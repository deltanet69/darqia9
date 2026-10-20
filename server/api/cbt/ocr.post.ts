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

const responseSchema = {
  type: 'OBJECT',
  properties: {
    text: { type: 'STRING', description: 'Hasil transkripsi sesuai isi gambar.' },
    isRtl: { type: 'BOOLEAN', description: 'Benar jika isi utama menggunakan aksara Arab.' },
    containsFormula: { type: 'BOOLEAN', description: 'Benar jika ada rumus matematika, fisika, kimia, atau biologi.' },
    reviewNote: { type: 'STRING', description: 'Catatan singkat bagian yang harus diperiksa guru.' }
  },
  required: ['text', 'isRtl', 'containsFormula', 'reviewNote']
}

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
    'Untuk rumus matematika, fisika, kimia, atau biologi: tulis sebagai LaTeX valid dengan $...$ untuk rumus sebaris dan $$...$$ untuk rumus terpisah.',
    'Untuk kode program: gunakan blok kode Markdown dengan tiga tanda backtick.',
    'Jika satu bagian tidak terbaca, gunakan penanda [tidak terbaca].',
    'Jangan sertakan penjelasan di luar JSON yang diminta.'
  ].join(' ')

  const response = await $fetch<any>('https://api.pecutmarket.my.id/v1/chat/completions', {
    method: 'POST',
    timeout: 60_000,
    headers: {
      authorization: 'Bearer ' + config.pecutMarketApiKey,
      'content-type': 'application/json'
    },
    body: {
      model: 'glm-5.3-flash',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: 'data:' + mimeType + ';base64,' + base64 } }
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

  const rawText = response?.choices?.[0]?.message?.content?.trim()
  if (!rawText) {
    throw createError({ statusCode: 422, statusMessage: 'Tidak ada teks yang dapat diekstrak dari gambar.' })
  }

  try {
    const extracted = JSON.parse(rawText)
    if (typeof extracted.text !== 'string' || !extracted.text.trim()) throw new Error('empty')
    return {
      text: extracted.text.trim(),
      isRtl: extracted.isRtl === true,
      containsFormula: extracted.containsFormula === true,
      reviewNote: typeof extracted.reviewNote === 'string' ? extracted.reviewNote : ''
    }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Format hasil OCR tidak valid. Coba ekstrak kembali.' })
  }
})
