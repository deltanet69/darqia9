// Kompres foto sampul di peramban sebelum diunggah: sampul tampil kecil (kartu 2:3), jadi 480x720 sudah tajam di layar HP.
// Hasil WebP (JPEG di peramban tanpa encoder WebP) ~30–120 KB, bukan megabyte foto kamera, sehingga unggahan, disk VPS, dan transfer ke siswa tetap ringan.
const MAKS_SISI = [480, 720] as const
const TARGET_BYTE = 120 * 1024
const MAKS_ASAL = 15 * 1048576

const sandi = (k: HTMLCanvasElement, q: number) => new Promise<Blob | null>(r => k.toBlob(r, 'image/webp', q)).then(b => b?.type === 'image/webp' ? b : new Promise<Blob | null>(r => k.toBlob(r, 'image/jpeg', q)))

export async function kompresSampul(file: File): Promise<Blob> {
  if (file.size > MAKS_ASAL) throw new Error('Foto terlalu besar (maks. 15 MB). Pilih foto yang lebih kecil.')
  const bmp = await createImageBitmap(file).catch(() => { throw new Error('File bukan gambar yang bisa dibaca. Pakai JPG, PNG, atau WebP.') })
  try {
    let skala = Math.min(1, MAKS_SISI[0] / bmp.width, MAKS_SISI[1] / bmp.height)
    for (;;) {
      const k = document.createElement('canvas')
      k.width = Math.max(1, Math.round(bmp.width * skala)); k.height = Math.max(1, Math.round(bmp.height * skala))
      const c = k.getContext('2d')!
      c.fillStyle = '#fff'; c.fillRect(0, 0, k.width, k.height) // PNG transparan -> latar putih
      c.drawImage(bmp, 0, 0, k.width, k.height)
      for (let q = 0.82; q >= 0.5; q -= 0.08) {
        const b = await sandi(k, q)
        if (b && b.size <= TARGET_BYTE) return b
      }
      // Masih di atas target pada mutu terendah: kecilkan dimensi, berhenti di lebar 240 px lalu terima apa adanya (server membatasi 300 KB).
      if (k.width <= 240) {
        const b = await sandi(k, 0.5)
        if (!b || b.size > 300 * 1024) throw new Error('Foto tidak bisa dikompres cukup kecil. Pilih foto lain.')
        return b
      }
      skala *= 0.85
    }
  } finally { bmp.close() }
}
