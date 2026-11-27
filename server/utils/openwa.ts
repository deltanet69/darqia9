// Klien server untuk OpenWA Darqia (gateway WhatsApp tidak resmi, berjalan
// di VPS yang sama, hanya bisa diakses dari localhost).
//
// Keamanan anti-ban ditegakkan di dua lapis:
// 1. Governor pacing MILIK OpenWA (SEND_PACING_* di .env OpenWA): jatah
//    harian bertahap menurut umur sesi, jatah percakapan baru, dan rem
//    gagal beruntun. Penolakan governor = HTTP 429 SEND_PACING_LIMITED.
// 2. Di sini: setiap kiriman memakai Idempotency-Key "<regId>:<status>"
//    yang DISANITASI ke karakter ASCII tampak saja (spasi -> "-"):
//    OpenWA menolak kunci berisi spasi ("visible ASCII characters").
//    sehingga pengiriman ulang untuk status yang sama tidak dobel.
//
// Kredensial dari runtime config (env server NUXT_OPENWA_URL /
// NUXT_OPENWA_API_KEY / NUXT_OPENWA_SESSION) — tidak pernah ke browser.

interface OpenwaSession {
  id: string
  name: string
  status: string
  phone?: string | null
  engineLoaded?: boolean
}

function cfg(event: any) {
  const c = useRuntimeConfig(event)
  return {
    url: String(c.openwaUrl || 'http://127.0.0.1:2786').replace(/\/$/, ''),
    key: String(c.openwaApiKey || ''),
    sesi: String(c.openwaSession || 'spmb')
  }
}

async function ow(event: any, path: string, init: Record<string, any> = {}) {
  const { url, key } = cfg(event)
  if (!key) throw createError({ statusCode: 503, statusMessage: 'Kunci API OpenWA belum diatur di server.' })
  const res = await fetch(`${url}/api${path}`, {
    ...init,
    headers: { 'X-API-Key': key, 'Content-Type': 'application/json', ...(init.headers || {}) }
  })
  const teks = await res.text()
  let data: any = null
  try { data = teks ? JSON.parse(teks) : null } catch { data = { raw: teks } }
  if (!res.ok) {
    const err: any = new Error(data?.message || `OpenWA menjawab ${res.status}`)
    err.status = res.status
    err.code = data?.code
    err.retryAfterSeconds = data?.retryAfterSeconds
    err.data = data
    throw err
  }
  return data
}

/** Cari sesi berdasarkan nama; buat + nyalakan bila belum ada. */
export async function sesiOpenwa(event: any): Promise<OpenwaSession> {
  const { sesi } = cfg(event)
  const daftar = await ow(event, '/sessions')
  let s = (Array.isArray(daftar) ? daftar : []).find((x: any) => x.name === sesi) as OpenwaSession | undefined
  if (!s) {
    s = await ow(event, '/sessions', { method: 'POST', body: JSON.stringify({ name: sesi }) })
  }
  if (s && !s.engineLoaded && !['ready', 'connected'].includes(String(s.status))) {
    try {
      s = await ow(event, `/sessions/${s!.id}/start`, { method: 'POST' })
    } catch { /* status terakhir tetap dikembalikan; QR diambil terpisah */ }
  }
  return s as OpenwaSession
}

/** Status ringkas sesi untuk panel admin + QR (string) bila menunggu pindai. */
export async function statusSesiOpenwa(event: any) {
  const s = await sesiOpenwa(event)
  const status = String(s.status || '')
  const terhubung = ['ready', 'connected'].includes(status)
  let qr: string | null = null
  if (!terhubung) {
    try {
      const q = await ow(event, `/sessions/${s.id}/qr`)
      qr = (typeof q === 'string' ? q : q?.qr || q?.qrCode || q?.data || null) as string | null
    } catch { qr = null }
  }
  return {
    nama: s.name,
    status,
    terhubung,
    nomor: (s as any).phone || (s as any).me?.id?.split('@')[0] || null,
    qr
  }
}

export interface HasilKirimWa {
  ok: boolean
  keadaan: 'terkirim' | 'dibatasi' | 'sesi_belum_siap' | 'nomor_tidak_terdaftar' | 'gagal'
  pesan: string
  retryAfterSeconds?: number
}

/** Kirim satu pesan teks notifikasi. idemKey mencegah dobel per status. */
export async function kirimWaOpenwa(event: any, nomor62: string, isi: string, idemKey: string): Promise<HasilKirimWa> {
  const s = await sesiOpenwa(event)
  const status = String(s.status || '')
  if (!['ready', 'connected'].includes(status)) {
    return { ok: false, keadaan: 'sesi_belum_siap', pesan: 'Sesi WhatsApp sekolah belum terhubung. Minta admin memindai kode QR di panel SPMB.' }
  }
  // Pastikan nomor benar-benar terdaftar di WhatsApp sebelum mengirim —
  // kiriman ke nomor tak terdaftar adalah pola yang dicurigai WhatsApp.
  try {
    const cek = await ow(event, `/sessions/${s.id}/contacts/check/${nomor62}`)
    if (cek && cek.exists === false) {
      return { ok: false, keadaan: 'nomor_tidak_terdaftar', pesan: `Nomor ${nomor62} tidak terdaftar di WhatsApp.` }
    }
  } catch { /* pemeriksaan gagal tidak menghalangi kirim */ }
  try {
    await ow(event, `/sessions/${s.id}/messages/send-text`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idemKey.replace(/[^\x21-\x7E]/g, '-').slice(0, 255) },
      body: JSON.stringify({ chatId: `${nomor62}@c.us`, text: isi })
    })
    return { ok: true, keadaan: 'terkirim', pesan: 'Notifikasi WhatsApp terkirim ke wali.' }
  } catch (e: any) {
    if (e?.status === 429 && e?.code === 'SEND_PACING_LIMITED') {
      return {
        ok: false, keadaan: 'dibatasi',
        pesan: 'Jatah kirim aman hari ini sudah habis (perlindungan anti-ban). Notifikasi akan bisa dikirim lagi setelah jatah berganti — pendaftaran dan statusnya sendiri sudah tersimpan.',
        retryAfterSeconds: e.retryAfterSeconds
      }
    }
    return { ok: false, keadaan: 'gagal', pesan: `Pengiriman WhatsApp gagal: ${e?.message || 'gangguan gateway'}` }
  }
}
