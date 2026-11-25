// Kompres gambar di peramban sebelum diunggah: maks 1600 px, WebP mutu 0.85 (JPEG bila peramban tak bisa menyandi WebP, mis. Safari).
// Non-gambar (PDF) dan gambar yang tak terbaca dikembalikan apa adanya; hasil yang malah lebih besar dari asli juga dibuang.
export async function kompresGambar(file: File, maksSisi = 1600): Promise<File> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return file
  let bmp: ImageBitmap
  try { bmp = await createImageBitmap(file) } catch { return file }
  try {
    const skala = Math.min(1, maksSisi / Math.max(bmp.width, bmp.height))
    const k = document.createElement('canvas')
    k.width = Math.max(1, Math.round(bmp.width * skala))
    k.height = Math.max(1, Math.round(bmp.height * skala))
    const c = k.getContext('2d')
    if (!c) return file
    c.fillStyle = '#fff'; c.fillRect(0, 0, k.width, k.height) // PNG transparan -> latar putih (JPEG tak punya alfa)
    c.drawImage(bmp, 0, 0, k.width, k.height)
    for (const tipe of ['image/webp', 'image/jpeg']) {
      const b: Blob | null = await new Promise(r => k.toBlob(r, tipe, 0.85))
      if (b && b.type === tipe) {
        if (b.size >= file.size) return file
        return new File([b], file.name.replace(/\.[^.]+$/, '') + (tipe === 'image/webp' ? '.webp' : '.jpg'), { type: tipe })
      }
    }
    return file
  } finally { bmp.close() }
}
