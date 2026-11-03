// Logika murni Perpustakaan Digital Darqia 9 (aplikasi siswa) — port setia
// dari preview v8 yang dikunci pemilik (30 Okt 2026):
//   - Login cukup NIS terdaftar di Data Induk (tanpa kata sandi).
//   - Semua buku dibaca DI DALAM aplikasi — tidak ada tautan keluar.
//   - Katalog = buku teks SIBI Kemendikdasmen + buku nonteks (literasi).
//   - Progres baca & Rak Saya tersimpan per NIS di perangkat siswa.

export interface BabBuku { judul: string, isi: string }

export interface Buku {
  id: string
  judul: string
  lit: boolean
  tingkat: number // 10/11/12 (SMK), 7/8/9 (SMP); 0 untuk literasi umum
  mapel: string
  jurusan: string
  pengarang: string
  penerbit: string
  tahun: string
  halaman: number
  gradasi: string // CSS gradient sampul (sampul digambar prosedural, bukan berkas gambar)
  inisial: string
  deskripsi: string
  rating: number
  bab: BabBuku[]
}

export interface SesiSiswa {
  nis: string
  nama: string
  grade: string
  kelas: string
  tingkat: number
  jurusan: string
}

export interface SiswaContoh { nis: string, nama: string, kelas: string, tingkat: number, jurusan: string }

// Judul buku berbentuk "Mapel: Subjudul" — sampul menampilkan dua bagiannya.
export const judulUtama = (b: Buku): string => {
  const p = b.judul.split(':')
  return p.length > 1 ? p[0].trim() : b.judul
}
export const judulSub = (b: Buku): string => {
  const p = b.judul.split(':')
  return p.length > 1 ? p[1].trim() : ''
}

// Progres: prog[bukuId] = indeks bab terakhir yang dibuka (0-based).
export type PetaProgres = Record<string, number>
export const sudahMulai = (b: Buku, prog: PetaProgres): boolean => prog[b.id] != null && prog[b.id] >= 0
export const progresBuku = (b: Buku, prog: PetaProgres): number => {
  const p = prog[b.id]
  if (p == null || p < 0 || !b.bab.length) return 0
  return Math.round(((p + 1) / b.bab.length) * 100)
}

export const inisialNama = (nama: string): string =>
  nama.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()

export const salamWaktu = (jam: number): string =>
  jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 19 ? 'Selamat sore' : 'Selamat malam'

const ROMAWI: Array<[string, number]> = [['XII', 12], ['XI', 11], ['X', 10], ['IX', 9], ['VIII', 8], ['VII', 7]]

// Tingkat (7–12) diturunkan dari nama kelas Data Induk: "XI TKJ 1" -> 11,
// "VII. A" -> 7, "10 RPL 1" -> 10. Cadangan bila tak terbaca: jenjang masuk.
export function tingkatDariKelas(kelas: string, grade: string): number {
  const bersih = (kelas || '').toUpperCase().replace(/\./g, ' ').trim()
  const token = bersih.split(/\s+/).filter(Boolean)
  for (const t of token) {
    const angka = parseInt(t, 10)
    if ([7, 8, 9, 10, 11, 12].includes(angka) && String(angka) === t) return angka
    const r = ROMAWI.find(([simbol]) => simbol === t)
    if (r) return r[1]
  }
  return grade === 'SMP' ? 7 : 10
}

// Jurusan diturunkan dari nama kelas: "XI TKJ 1" -> "TKJ", "X AKL 1" -> "AKL",
// "VII. A" -> "" (rombel huruf bukan jurusan).
export function jurusanDariKelas(kelas: string): string {
  const token = (kelas || '').toUpperCase().replace(/\./g, ' ').split(/\s+/).filter(Boolean)
  const romawi = new Set(ROMAWI.map(([s]) => s))
  return token.find(t => /^[A-Z]{2,5}$/.test(t) && !romawi.has(t)) || ''
}

export const KATA_PUTAR = ['Buku Teks', 'Cerpen', 'Novel Remaja', 'Puisi & Pantun', 'Buku Nonteks']
export const PENCARIAN_POPULER = ['Jaringan', 'Pemrograman', 'Akuntansi', 'Matematika', 'Bahasa']

export function cariBuku(buku: Buku[], kata: string): Buku[] {
  const q = kata.trim().toLowerCase()
  if (!q) return buku
  return buku.filter(b => (b.judul + ' ' + b.mapel + ' ' + b.pengarang).toLowerCase().includes(q))
}

export const daftarMapel = (buku: Buku[]): string[] =>
  [...new Set(buku.filter(b => !b.lit).map(b => b.mapel))]
