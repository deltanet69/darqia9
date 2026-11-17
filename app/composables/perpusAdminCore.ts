// Logika murni halaman admin Perpustakaan Digital: saring + urut daftar buku, ringkasan, dan baris ekspor.
// Kolom ekspor sengaja memakai nama kolom katalog-perpus-darqia.json supaya file ekspor bisa diimpor kembali.

export interface BukuAdmin {
  id: string
  judul: string
  pengarang: string
  penerbit: string
  jenjang: string[]
  kelas: string
  mapel: string
  jenis: string
  kurikulum: string
  statusLegal: string
  aksesBaca: string
  akhirPekan: boolean
  slugFile: string
  pathPdf: string
  sampul: string
  sinopsis: string
  format: 'pdf' | 'epub'
  aktif: boolean
  berkasAda: boolean
  dibaca: number
  pembaca: number
  terakhir: string | null
}

// Isian formulir tambah/ubah buku (nama kunci = kolom perpus_buku, dibaca rapikanForm di server).
export interface FormBuku { judul: string, pengarang: string, penerbit: string, jenjang: string[], kelas_label: string, mapel: string, jenis: string, kurikulum: string, sinopsis: string, akhir_pekan: boolean }

export const formKosong = (jenjang: string): FormBuku => ({ judul: '', pengarang: '', penerbit: '', jenjang: [jenjang], kelas_label: '', mapel: '', jenis: 'Buku teks', kurikulum: '', sinopsis: '', akhir_pekan: false })
export const formDariBuku = (b: BukuAdmin): FormBuku => ({ judul: b.judul, pengarang: b.pengarang, penerbit: b.penerbit, jenjang: [...b.jenjang], kelas_label: b.kelas, mapel: b.mapel, jenis: b.jenis, kurikulum: b.kurikulum, sinopsis: b.sinopsis, akhir_pekan: b.akhirPekan })

export type UrutBuku = 'populer' | 'pembaca' | 'terbaru' | 'judul' | 'mapel'
export interface SaringBuku { q: string, jenjang: '' | 'SMP' | 'SMK', mapel: string, jenis: string, berkas: '' | 'ada' | 'belum', status: '' | 'aktif' | 'nonaktif', akses: '' | 'harian' | 'akhirpekan' }

export const SARING_AWAL: SaringBuku = { q: '', jenjang: '', mapel: '', jenis: '', berkas: '', status: '', akses: '' }

const cocok = (b: BukuAdmin, f: SaringBuku): boolean => {
  if (f.jenjang && !b.jenjang.includes(f.jenjang)) return false
  if (f.mapel && b.mapel !== f.mapel) return false
  if (f.jenis && b.jenis !== f.jenis) return false
  if (f.berkas && b.berkasAda !== (f.berkas === 'ada')) return false
  if (f.status && b.aktif !== (f.status === 'aktif')) return false
  if (f.akses && b.akhirPekan !== (f.akses === 'akhirpekan')) return false
  const q = f.q.trim().toLowerCase()
  return !q || `${b.judul} ${b.pengarang} ${b.penerbit} ${b.mapel} ${b.jenis} ${b.kurikulum} ${b.slugFile}`.toLowerCase().includes(q)
}

const abjad = (a: string, b: string) => a.localeCompare(b, 'id')
const waktu = (t: string | null) => (t ? new Date(t).getTime() : 0)

export function saringUrut(daftar: BukuAdmin[], f: SaringBuku, urut: UrutBuku): BukuAdmin[] {
  const hasil = daftar.filter(b => cocok(b, f))
  const dasar = (a: BukuAdmin, b: BukuAdmin) => abjad(a.judul, b.judul)
  const pembanding: Record<UrutBuku, (a: BukuAdmin, b: BukuAdmin) => number> = {
    populer: (a, b) => b.dibaca - a.dibaca || dasar(a, b),
    pembaca: (a, b) => b.pembaca - a.pembaca || dasar(a, b),
    terbaru: (a, b) => waktu(b.terakhir) - waktu(a.terakhir) || dasar(a, b),
    judul: dasar,
    mapel: (a, b) => abjad(a.mapel, b.mapel) || dasar(a, b)
  }
  return hasil.sort(pembanding[urut])
}

export const ringkasan = (daftar: BukuAdmin[]) => ({
  total: daftar.length,
  aktif: daftar.filter(b => b.aktif).length,
  berkasAda: daftar.filter(b => b.berkasAda).length,
  dibaca: daftar.reduce((n, b) => n + b.dibaca, 0),
  belumPernah: daftar.filter(b => b.aktif && b.berkasAda && b.dibaca === 0).length
})

export const KOLOM_EKSPOR = ['Judul', 'Penulis / Penerbit', 'Jenjang', 'Kelas', 'Mapel / Kategori', 'Jenis', 'Kurikulum / Sumber', 'Status Legal', 'Akses Baca', 'Slug File', 'Path PDF (rencana)', 'Status Tampil', 'Berkas PDF', 'Dibaca (kali)', 'Pembaca Unik', 'Terakhir Dibaca'] as const

const AKSES_AKHIR_PEKAN = /sabtu|minggu|ahad|weekend|akhir\s*pekan/i

// Delapan kolom pertama + Slug/Path adalah kolom impor; sisanya hanya informasi (diabaikan saat impor).
export function barisEkspor(daftar: BukuAdmin[]): Array<Record<(typeof KOLOM_EKSPOR)[number], string | number>> {
  return daftar.map(b => ({
    'Judul': b.judul,
    'Penulis / Penerbit': b.pengarang || b.penerbit ? `${b.pengarang} / ${b.penerbit}` : '',
    'Jenjang': b.jenjang.join(' & '),
    'Kelas': b.kelas,
    'Mapel / Kategori': b.mapel,
    'Jenis': b.jenis,
    'Kurikulum / Sumber': b.kurikulum,
    'Status Legal': b.statusLegal,
    'Akses Baca': b.akhirPekan && !AKSES_AKHIR_PEKAN.test(b.aksesBaca) ? 'Sabtu–Minggu' : b.aksesBaca,
    'Slug File': b.slugFile || b.id,
    'Path PDF (rencana)': b.pathPdf,
    'Status Tampil': b.aktif ? 'Tampil' : 'Disembunyikan',
    'Berkas PDF': b.berkasAda ? 'Ada' : 'Belum ada',
    'Dibaca (kali)': b.dibaca,
    'Pembaca Unik': b.pembaca,
    'Terakhir Dibaca': b.terakhir ? b.terakhir.slice(0, 10) : ''
  }))
}

export const opsiUnik = (daftar: BukuAdmin[], k: 'mapel' | 'jenis'): string[] =>
  [...new Set(daftar.map(b => b[k]).filter(Boolean))].sort(abjad)

export const tanggalBaca = (t: string | null): string =>
  t ? new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum pernah'
