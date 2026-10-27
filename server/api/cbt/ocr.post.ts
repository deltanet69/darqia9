import { parseOcrExtraction, ocrTextsAgree, ocrTextsAgreeLoose } from '../../utils/cbtOcr'
import { validateLatexExpressions } from '../../../app/utils/cbtFormula'

const requestWindows = new Map<string, { count: number; startedAt: number }>()
const MAX_IMAGE_BYTES = 700 * 1024
const MAX_REQUESTS_PER_MINUTE = 12

const getRequestIp = (event: Parameters<typeof getRequestIP>[0]) => getRequestIP(event, { xForwardedFor: true }) || 'unknown'

const limitRequest = (event: Parameters<typeof getRequestIP>[0]) => {
  const ip = getRequestIp(event)
  const now = Date.now()
  const existing = requestWindows.get(ip)
  if (!existing || now - existing.startedAt >= 60_000) {
    requestWindows.set(ip, { count: 1, startedAt: now })
    return
  }
  if (existing.count >= MAX_REQUESTS_PER_MINUTE) {
    throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak ekstraksi. Coba lagi dalam satu menit.' })
  }
  existing.count += 1
}

const hasValidFormula = (text: string) => {
  if (validateLatexExpressions(text)) return false
  const formulas = [...text.matchAll(/\$\$([\s\S]+?)\$\$|\$([^\n$]+?)\$/g)]
  if (!formulas.length) return false
  if (hasFormulaHint(text.replace(/\$\$([\s\S]+?)\$\$|\$([^\n$]+?)\$/g, ''))) return false
  return true
}

const hasFormulaHint = (text: string) => /\\(?:frac|sqrt|sum|int)|[=^_√∑∫π]|\d\s*[=\/]\s*\d/.test(text)

export default defineEventHandler(async (event) => {
  limitRequest(event)
  const config = useRuntimeConfig(event)
  if (!config.pecutMarketApiKey) {
    throw createError({ statusCode: 503, statusMessage: 'PECUTMARKET_API_KEY belum tersedia di server.' })
  }

  const body = await readBody<{ imageDataUrl?: string }>(event)
  const match = body?.imageDataUrl?.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: 'Gambar harus berformat PNG, JPEG, atau WebP.' })
  }

  const [, mimeType, base64] = match
  if (Buffer.byteLength(base64, 'base64') > MAX_IMAGE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Ukuran gambar maksimal 700 KB.' })
  }

  const prompt = [
    'Anda adalah OCR untuk bank soal sekolah Indonesia.',
    'Transkripsikan isi gambar dengan setia. Jangan menerjemahkan, memperbaiki, atau mengarang bagian yang tidak terbaca.',
    'Untuk teks Arab atau Al-Quran: pertahankan Unicode Arab beserta harakat dan tanda baca yang terlihat.',
    'Baca piksel gambar, bukan hafalan ayat. Jangan melengkapi kalimat yang dikenal. Jangan menambah tanda waqaf, nomor ayat, atau harakat yang tidak terlihat pada gambar.',
    'Untuk rumus matematika, fisika, kimia, atau biologi: JANGAN tulis sebagai teks biasa. Setiap rumus wajib menjadi LaTeX KaTeX valid di dalam $$...$$ pada baris terpisah.',
    'Pertahankan struktur visual: pecahan horizontal menjadi \\frac{pembilang}{penyebut}, pangkat menjadi ^{...}, indeks menjadi _{...}, akar menjadi \\sqrt{...}, dan satuan atau nama zat gunakan \\text{...}.',
    'Contoh gambar "Sₙ = n/2(a + Uₙ)" harus ditulis "$$S_n = \\frac{n}{2}(a + U_n)$$". Pastikan semua kurung kurawal dan penanda $$ berpasangan.',
    'Untuk kode program: gunakan blok kode Markdown dengan tiga tanda backtick.',
    'Jika satu bagian tidak terbaca, gunakan penanda [tidak terbaca].',
    'Keluarkan satu objek JSON dengan tepat empat properti: "text" (string hasil transkripsi), "isRtl" (boolean, true untuk teks utama Arab), "containsFormula" (boolean), "reviewNote" (string catatan pemeriksaan guru).',
    'Gunakan nama properti persis tersebut, bukan "transkripsi". Jangan sertakan penjelasan di luar JSON yang diminta.'
  ].join(' ')

  const extract = (instruction: string, model = 'glm-5.3-flash') => $fetch<any>('https://api.pecutmarket.my.id/v1/chat/completions', {
    method: 'POST',
    timeout: 60_000,
    headers: {
      authorization: 'Bearer ' + config.pecutMarketApiKey,
      'content-type': 'application/json'
    },
    body: {
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: instruction },
          { type: 'image_url', image_url: { url: 'data:' + mimeType + ';base64,' + base64, detail: 'high' } }
        ]
      }],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 4_000
    }
  }).catch((error: any) => {
    const statusCode = error?.response?.status || error?.statusCode
    if (statusCode === 429 || statusCode === 503) {
      throw createError({ statusCode: 429, statusMessage: 'Layanan OCR sedang penuh. Coba lagi beberapa saat.' })
    }
    const providerMessage = error?.data?.error?.message || error?.response?._data?.error?.message
    if (statusCode === 400 && providerMessage) {
      throw createError({ statusCode: 502, statusMessage: 'Layanan OCR menolak gambar: ' + providerMessage })
    }
    throw createError({ statusCode: 502, statusMessage: 'Layanan OCR gagal mengekstrak gambar. Coba gunakan gambar yang lebih jelas.' })
  })

  const parseSafely = (response: any) => {
    try {
      return parseOcrExtraction(response?.choices?.[0]?.message?.content)
    } catch {
      throw createError({ statusCode: 502, statusMessage: 'Format hasil OCR tidak valid. Coba ekstrak kembali.' })
    }
  }

  let extracted = parseSafely(await extract(prompt))
  if ((extracted.containsFormula || hasFormulaHint(extracted.text)) && !hasValidFormula(extracted.text)) {
    extracted = parseSafely(await extract([
      prompt,
      'Hasil OCR sebelumnya belum memenuhi format rumus:', extracted.text,
      'Ulangi transkripsi dari gambar. Keluarkan JSON yang sama, dengan setiap rumus valid di dalam $$...$$. Jangan mengubah teks yang bukan rumus.'
    ].join('\n')))
  }

  if ((extracted.containsFormula || hasFormulaHint(extracted.text)) && !hasValidFormula(extracted.text)) {
    throw createError({ statusCode: 422, statusMessage: 'Rumus hasil OCR belum valid setelah dicoba ulang. Gunakan gambar yang lebih jelas atau tulis rumus melalui editor.' })
  }

  if (/\[tidak terbaca\]/i.test(extracted.text)) {
    throw createError({ statusCode: 422, statusMessage: 'Sebagian isi gambar tidak terbaca dengan pasti. Hasil tidak dimasukkan. Gunakan potongan gambar yang lebih jelas atau tulis melalui editor.' })
  }
  const independent = parseSafely(await extract(prompt, 'deepseek-v4-flash-vision-exp'))
  if (!ocrTextsAgree(extracted.text, independent.text)) {
    // Ajudikasi: pembacaan ketiga memeriksa piksel gambar dengan dua kandidat di tangan
    // dan menulis transkripsi final yang paling setia. Hasilnya hanya diterima bila
    // kerangka hurufnya sama dengan salah satu kandidat (isi tidak berubah), dan tetap
    // melewati gerbang rumus serta [tidak terbaca].
    const adjudicated = parseSafely(await extract([
      prompt,
      'Dua transkripsi kandidat dari gambar yang sama berbeda pada detail harakat, tanda baca, atau rumus:',
      'Kandidat 1: ' + JSON.stringify(extracted.text),
      'Kandidat 2: ' + JSON.stringify(independent.text),
      'Periksa kembali piksel gambar kata per kata. Tulis transkripsi final yang persis seperti gambar - harakat, tanda waqaf, dan rumus mengikuti gambar, bukan mengikuti salah satu kandidat. Keluarkan format JSON yang sama.'
    ].join('\n')))
    if (!ocrTextsAgreeLoose(adjudicated.text, extracted.text) && !ocrTextsAgreeLoose(adjudicated.text, independent.text)) {
      throw createError({ statusCode: 422, statusMessage: 'Dua pembacaan gambar belum cocok. Hasil tidak dimasukkan agar teks, harakat, atau rumus tidak berubah. Gunakan potongan gambar yang lebih jelas atau tulis melalui editor.' })
    }
    extracted = adjudicated
    if ((extracted.containsFormula || hasFormulaHint(extracted.text)) && !hasValidFormula(extracted.text)) {
      throw createError({ statusCode: 422, statusMessage: 'Rumus hasil OCR belum valid setelah dicoba ulang. Gunakan gambar yang lebih jelas atau tulis rumus melalui editor.' })
    }
    if (/\[tidak terbaca\]/i.test(extracted.text)) {
      throw createError({ statusCode: 422, statusMessage: 'Sebagian isi gambar tidak terbaca dengan pasti. Hasil tidak dimasukkan. Gunakan potongan gambar yang lebih jelas atau tulis melalui editor.' })
    }
  }
  return extracted
})
