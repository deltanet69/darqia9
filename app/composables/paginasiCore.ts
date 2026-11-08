// Logika murni paginasi tabel (tanpa Vue) agar mudah dites.
export const jumlahHalaman = (total: number, ukuran: number): number => Math.max(1, Math.ceil(total / Math.max(1, ukuran)))

// Halaman dijepit ke rentang sah (mis. setelah filter mengecilkan hasil).
export const jepitHalaman = (halaman: number, total: number, ukuran: number): number =>
  Math.min(Math.max(1, Math.floor(halaman) || 1), jumlahHalaman(total, ukuran))

export const potongHalaman = <T>(item: T[], halaman: number, ukuran: number): T[] => {
  const h = jepitHalaman(halaman, item.length, ukuran)
  return item.slice((h - 1) * ukuran, h * ukuran)
}

// Nomor halaman yang ditampilkan: selalu awal dan akhir, sekitar halaman aktif, sisanya "…".
export function daftarHalaman(aktif: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, aktif - 1, aktif, aktif + 1])
  if (aktif <= 3) { set.add(2); set.add(3); set.add(4) }
  if (aktif >= total - 2) { set.add(total - 1); set.add(total - 2); set.add(total - 3) }
  const urut = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b)
  const hasil: (number | '…')[] = []
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1]! > 1) hasil.push('…')
    hasil.push(n)
  })
  return hasil
}
