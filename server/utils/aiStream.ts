// Gateway penyedia AI memotong respons biasa yang lebih dari ~30 detik (HTTP 504). Karena itu permintaan memakai stream:
// gateway mengirim keep-alive sehingga koneksi tetap hidup. Isi jawaban dikumpulkan dari potongan delta.content
// (reasoning_content diabaikan). Berhenti paksa bila lewat batas waktu total. Dipakai OCR Bank Soal dan AI Modul Pembelajaran.
export const kumpulkanStream = async (
  stream: any,
  pesan: { galat: string; habisWaktu: string },
  batasMs = 110_000
): Promise<string> => {
  const reader = stream.getReader()
  const dekoder = new TextDecoder()
  let sisa = ''
  let isi = ''
  let habisWaktu = false
  const timer = setTimeout(() => { habisWaktu = true; void reader.cancel().catch(() => {}) }, batasMs)
  const prosesBaris = (baris: string) => {
    if (!baris.startsWith('data:')) return
    const data = baris.slice(5).trim()
    if (!data || data === '[DONE]') return
    let potongan: any
    try { potongan = JSON.parse(data) } catch { return }
    if (potongan?.error) throw createError({ statusCode: 502, statusMessage: pesan.galat })
    const delta = potongan?.choices?.[0]?.delta?.content ?? potongan?.choices?.[0]?.message?.content
    if (typeof delta === 'string') isi += delta
  }
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      sisa += dekoder.decode(value, { stream: true })
      let akhir = sisa.indexOf('\n')
      while (akhir >= 0) {
        prosesBaris(sisa.slice(0, akhir).replace(/\r$/, ''))
        sisa = sisa.slice(akhir + 1)
        akhir = sisa.indexOf('\n')
      }
    }
    prosesBaris(sisa.replace(/\r$/, ''))
  } finally {
    clearTimeout(timer)
  }
  if (habisWaktu) throw createError({ statusCode: 504, statusMessage: pesan.habisWaktu })
  return isi
}
