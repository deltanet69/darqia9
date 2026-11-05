// Logika murni Tahun Ajaran — hasil meeting manajemen 4 Nov 2026 (butir 5).
// Tanpa impor Nuxt/Vue agar bisa diuji langsung dengan Node (tests/tahun-ajaran.mjs).

export const TAHUN_AJARAN_BAWAAN = '2026/2027'

const POLA_TAHUN = /^\d{4}\/\d{4}$/

// Sah hanya format "TTTT/TTTT" dengan tahun kedua tepat satu tahun setelahnya.
export function tahunAjaranSah(nilai: unknown): nilai is string {
  if (typeof nilai !== 'string' || !POLA_TAHUN.test(nilai)) return false
  const [awal, akhir] = nilai.split('/').map(Number)
  return akhir === awal + 1
}

// Daftar unik tahun yang sah dari nilai mentah (mis. kolom academic_year
// tabel classes), terurut terbaru lebih dulu.
export function daftarTahunUnik(nilai: Array<string | null | undefined>): string[] {
  const unik = new Set<string>()
  for (const n of nilai) if (tahunAjaranSah(n)) unik.add(n)
  return [...unik].sort().reverse()
}

// Tahun bawaan: utamakan tahun berjalan bila termasuk opsi existing,
// selain itu tahun existing terbaru; daftar kosong -> konstanta bawaan.
export function tahunBawaan(opsi: string[]): string {
  if (opsi.includes(TAHUN_AJARAN_BAWAAN)) return TAHUN_AJARAN_BAWAAN
  return opsi[0] ?? TAHUN_AJARAN_BAWAAN
}

// Jaga pilihan tetap anggota opsi existing; bila tidak, jatuh ke bawaan.
export function pastikanPilihan(opsi: string[], pilihan: string): string {
  return opsi.includes(pilihan) ? pilihan : tahunBawaan(opsi)
}
