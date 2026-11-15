import { serverSupabaseClient } from '#supabase/server'
import { wajibStaf } from '../../utils/wajibStaf'
import { kumpulkanStream } from '../../utils/aiStream'
import { buatPembatas } from '../../utils/pembatas'
import { buatKisiKisi } from '../../utils/cbtKisiKisi'

// Kisi-kisi bank soal: dibuat & disimpan di server, jadi tetap jadi walaupun guru langsung pindah halaman.
// Memakai penyedia & token AI yang sama dengan OCR Bank Soal (OCR_UTAMA_*).
const pembatas = buatPembatas(10, 60_000)

export default defineEventHandler(async (event) => {
  await wajibStaf(event)
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (pembatas.terblokir(ip)) throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak permintaan AI. Coba lagi dalam satu menit.' })
  pembatas.catat(ip)

  const body = await readBody<Record<string, unknown>>(event)
  const source = body?.source === 'cbt' ? 'cbt' : body?.source === 'ujian_harian' ? 'ujian_harian' : null
  const bankId = String(body?.bankId ?? '')
  if (!source || !/^[0-9a-f-]{36}$/i.test(bankId)) throw createError({ statusCode: 400, statusMessage: 'Permintaan kisi-kisi tidak valid.' })

  const config = useRuntimeConfig(event)
  const url = String(config.ocrUtamaUrl || 'https://api.pecutmarket.my.id/v1')
  const key = String(config.ocrUtamaKey || '')
  const model = String(config.ocrUtamaModel || 'glm-5.3-flash')
  if (!key) throw createError({ statusCode: 503, statusMessage: 'Kunci AI (OCR_UTAMA_KEY) belum tersedia di server.' })

  const panggilAi = async (prompt: string) => {
    const hasil: any = await $fetch<any>(url.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      timeout: 60_000,
      responseType: 'stream',
      headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
      body: { model, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 4_000, stream: true }
    }).catch((error: any) => {
      const status = error?.response?.status || error?.statusCode
      if (status === 429 || status === 503) throw createError({ statusCode: 429, statusMessage: 'Layanan AI sedang penuh. Coba lagi beberapa saat.' })
      throw createError({ statusCode: 502, statusMessage: 'Layanan AI gagal membuat kisi-kisi. Coba lagi.' })
    })
    return typeof hasil?.getReader === 'function'
      ? await kumpulkanStream(hasil, {
        galat: 'Layanan AI melaporkan galat saat menyusun kisi-kisi. Coba lagi.',
        habisWaktu: 'Layanan AI terlalu lama menyusun kisi-kisi. Coba lagi.'
      })
      : String(hasil?.choices?.[0]?.message?.content ?? '')
  }

  return await buatKisiKisi({
    client: await serverSupabaseClient(event),
    source,
    bankId,
    mode: body?.mode === 'ulang' ? 'ulang' : 'otomatis',
    panggilAi
  })
})
