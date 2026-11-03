// Logika murni Keuangan Sekolah Darqia 9 — tanpa dependensi UI/Supabase.
// Prinsip data (satu-satunya aturan, dipakai semua tampilan):
//   Total Tagihan = Nominal Master (Kode Keuangan) + Biaya Tambahan per siswa
//   Total Dibayar = selalu dihitung dari Riwayat Pembayaran (view keuangan_rekap)
//   Status diturunkan dari angka — tidak pernah diketik manual.
// Konsep FLAT: nominal per tingkat ditetapkan manajemen lewat Kode Keuangan
// berdasarkan tahun masuk; NIS adalah ID pembayaran resmi siswa sampai lulus.

export type Grade = 'SMK' | 'SMP'

export interface PaketKeuangan {
  kode: string
  nama: string
  grade: Grade
  nominal: [number, number, number, number] // indeks 0..3 = Tingkat 1..Akhir
  aktif: boolean
}

export interface SiswaInduk {
  nis: string
  nisn: string
  nama: string
  grade: Grade
  kelas: string
  angkatan: number
  status: string // Aktif / Lulus / Pindah / Nonaktif
  hpWali: string
}

export interface PenetapanSiswa {
  nis: string
  grade: Grade
  kode: string
  tambahan: [number, number, number, number]
}

export interface RekapBayar { nis: string, tingkat: number, dibayar: number }

export interface Pembayaran {
  id?: string
  no: string
  nis: string
  grade: Grade
  tingkat: number // 0..3
  nominal: number
  keterangan: string
  metode: 'Tunai' | 'Transfer' | 'QRIS'
  petugas: string
  tanggal: string // display dd MMM yyyy
  tanggalISO: string // yyyy-mm-dd
  cutoff: string | null // kode cut-off bila sudah terkunci
}

export interface Cutoff {
  id?: string
  kode: string
  grade: Grade
  dari: string
  sampai: string
  dariISO: string
  sampaiISO: string
  hari: number
  trx: number
  total: number
  oleh: string
  bukti: boolean
}

export interface RincianTingkat {
  master: number
  tambahan: number
  total: number
  bayar: number
  sisa: number
  persen: number
}

export interface HitunganSiswa {
  per: RincianTingkat[]
  total: number
  bayar: number
  sisa: number
  persen: number
}

export const LABEL_TINGKAT: Record<Grade, string[]> = {
  SMK: ['Kelas X', 'Kelas XI', 'Kelas XII', 'Tingkat Akhir'],
  SMP: ['Kelas VII', 'Kelas VIII', 'Kelas IX', 'Tingkat Akhir']
}
export const TINGKAT_SINGKAT = ['Tk. 1', 'Tk. 2', 'Tk. 3', 'Tk. Akhir']
export const METODE_BAYAR = ['Tunai', 'Transfer', 'QRIS'] as const

// Keterangan pembayaran resmi — TANPA Tabungan (perintah pemilik: Keuangan
// hanya satu menu, tidak ada tabungan dan lainnya).
export const KETERANGAN_AWAL = [
  'SPP', 'Buku 1 Tahun', 'Kegiatan 1 Tahun', 'Kegiatan Akhir Tahun',
  'OSIS 1 Tahun', 'Praktik 1 Tahun', 'Siswa Baru Tahap 1', 'Siswa Baru Tahap 2'
]

export const rp = (n: number): string => 'Rp ' + Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
export const persenTeks = (p: number): string => p.toFixed(2).replace('.', ',') + '%'
export const inisialNama = (nama: string): string => nama.split(' ').filter(Boolean).slice(0, 2).map(k => k[0]).join('').toUpperCase()

export const totalPaket = (p: PaketKeuangan): number => p.nominal.reduce((a, b) => a + b, 0)

export function hitungSiswa(paket: PaketKeuangan | undefined, tambahan: readonly number[], rekap: RekapBayar[]): HitunganSiswa {
  const per: RincianTingkat[] = [0, 1, 2, 3].map(t => {
    const master = paket ? paket.nominal[t] : 0
    const tb = tambahan[t] || 0
    const total = master + tb
    const bayar = rekap.filter(r => r.tingkat === t).reduce((a, r) => a + r.dibayar, 0)
    const sisa = Math.max(0, total - bayar)
    return { master, tambahan: tb, total, bayar, sisa, persen: total > 0 ? Math.min(100, bayar / total * 100) : 0 }
  })
  const total = per.reduce((a, v) => a + v.total, 0)
  const bayar = per.reduce((a, v) => a + v.bayar, 0)
  return { per, total, bayar, sisa: Math.max(0, total - bayar), persen: total > 0 ? Math.min(100, bayar / total * 100) : 0 }
}

export type StatusBayar = 'Lunas' | 'Kurang' | 'Belum Bayar'
export const statusDari = (h: HitunganSiswa): StatusBayar => h.total > 0 && h.sisa <= 0 ? 'Lunas' : h.bayar > 0 ? 'Kurang' : 'Belum Bayar'

export const SATUAN_TERBILANG = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas']
export function terbilang(n: number): string {
  n = Math.floor(Math.abs(n))
  if (n < 12) return SATUAN_TERBILANG[n]
  if (n < 20) return terbilang(n - 10) + ' belas'
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' puluh ' + terbilang(n % 10)
  if (n < 200) return 'seratus ' + terbilang(n - 100)
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' ratus ' + terbilang(n % 100)
  if (n < 2000) return 'seribu ' + terbilang(n - 1000)
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' ribu ' + terbilang(n % 1000)
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' juta ' + terbilang(n % 1000000)
  if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + ' miliar ' + terbilang(n % 1000000000)
  return terbilang(Math.floor(n / 1000000000000)) + ' triliun ' + terbilang(n % 1000000000000)
}
export const terbilangRupiah = (n: number): string => {
  const t = terbilang(n).replace(/\s+/g, ' ').trim()
  return (t ? t[0].toUpperCase() + t.slice(1) : 'Nol') + ' Rupiah'
}

const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
export const formatTanggal = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${String(d).padStart(2, '0')} ${BULAN_ID[(m || 1) - 1]} ${y}`
}
export const formatTanggalPanjang = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number)
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${d} ${bulan[(m || 1) - 1]} ${y}`
}
export const selisihHari = (dariISO: string, sampaiISO: string): number =>
  Math.round((new Date(sampaiISO + 'T00:00:00').getTime() - new Date(dariISO + 'T00:00:00').getTime()) / 86400000) + 1

// Saring + urut daftar siswa keuangan (murni, dipakai daftar & uji).
export interface BarisSiswa extends SiswaInduk {
  kode: string
  tambahan: [number, number, number, number]
  hitung: HitunganSiswa
  statusBayar: StatusBayar
}
export function saringSiswa(baris: BarisSiswa[], f: { cari?: string, kelas?: string, status?: string, urut?: string }): BarisSiswa[] {
  let list = baris.slice()
  if (f.cari) {
    const q = f.cari.toLowerCase()
    list = list.filter(s => s.nis.includes(q) || s.nama.toLowerCase().includes(q))
  }
  if (f.kelas) list = list.filter(s => s.kelas === f.kelas)
  if (f.status) list = list.filter(s => s.statusBayar === f.status)
  const urut = f.urut || 'sisa'
  list.sort((a, b) => urut === 'nama' ? a.nama.localeCompare(b.nama)
    : urut === 'nis' ? a.nis.localeCompare(b.nis)
    : urut === 'progress' ? a.hitung.persen - b.hitung.persen
    : b.hitung.sisa - a.hitung.sisa)
  return list
}

export function rekapPerKelas(baris: BarisSiswa[]): Array<{ kelas: string, siswa: number, tagihan: number, dibayar: number, sisa: number }> {
  const peta = new Map<string, { kelas: string, siswa: number, tagihan: number, dibayar: number, sisa: number }>()
  for (const s of baris) {
    const r = peta.get(s.kelas) || { kelas: s.kelas, siswa: 0, tagihan: 0, dibayar: 0, sisa: 0 }
    r.siswa++; r.tagihan += s.hitung.total; r.dibayar += s.hitung.bayar; r.sisa += s.hitung.sisa
    peta.set(s.kelas, r)
  }
  return [...peta.values()].sort((a, b) => a.kelas.localeCompare(b.kelas))
}

// ===== Data contoh lokal =====
// Dipakai HANYA saat migrasi 0026 belum dijalankan (mode contoh lokal, ada
// banner penanda di halaman). Angka contoh SMK berasal dari aplikasi lama
// milik sekolah (screenshot pemilik); SMP diberi paket contoh berlabel jelas.
// Begitu migrasi jalan, data asli dari tabel students yang dipakai.
export const PAKET_CONTOH: PaketKeuangan[] = [
  { kode: 'khllBv', nama: 'Keuangan Alumni 2526-1', grade: 'SMK', nominal: [7680000, 6400000, 9500000, 0], aktif: true },
  { kode: 'R-2627', nama: 'Siswa Reguler', grade: 'SMK', nominal: [7625000, 5300000, 5300000, 0], aktif: true },
  { kode: 'SSK-2627', nama: 'Siswa SSK', grade: 'SMK', nominal: [2500000, 5300000, 5300000, 0], aktif: true },
  { kode: 'BB-2627', nama: 'Siswa Beasiswa Berprestasi', grade: 'SMK', nominal: [5975000, 4100000, 4100000, 0], aktif: true },
  { kode: 'BP-2627', nama: 'Siswa Beasiswa Penuh', grade: 'SMK', nominal: [2987500, 4100000, 4100000, 0], aktif: false },
  { kode: '0b5Eef', nama: 'Reguler - XII - Angkatan 10', grade: 'SMK', nominal: [8180000, 6400000, 6400000, 2500000], aktif: true },
  { kode: 'TK-2627-1', nama: 'Siswa Tinggal Kelas', grade: 'SMK', nominal: [14650000, 0, 0, 0], aktif: true },
  { kode: 'SMP-R27', nama: 'Siswa Reguler (contoh SMP)', grade: 'SMP', nominal: [4200000, 3600000, 3600000, 0], aktif: true },
  { kode: 'SMP-B27', nama: 'Siswa Beasiswa (contoh SMP)', grade: 'SMP', nominal: [2100000, 2600000, 2600000, 0], aktif: true }
]

export const SISWA_CONTOH: SiswaInduk[] = [
  { nis: '2324090134', nisn: '0081788947', nama: 'Anisa Febryanti', grade: 'SMK', kelas: 'Alumni - AKL', angkatan: 2023, status: 'Lulus', hpWali: '0812-3456-7890' },
  { nis: '2324090138', nisn: '0081788951', nama: 'Bulan Kaiza Haris', grade: 'SMK', kelas: 'Alumni - AKL', angkatan: 2023, status: 'Lulus', hpWali: '0813-2211-4455' },
  { nis: '2324090145', nisn: '0081788960', nama: 'Cindy', grade: 'SMK', kelas: 'Alumni - AKL', angkatan: 2023, status: 'Lulus', hpWali: '0813-9988-7766' },
  { nis: '242510115', nisn: '0099887766', nama: 'Syaddad Fuadi', grade: 'SMK', kelas: 'XII TSM', angkatan: 2024, status: 'Aktif', hpWali: '0857-1122-3344' },
  { nis: '2526011067', nisn: '0102030405', nama: 'Khumaira', grade: 'SMK', kelas: 'XI TKJ 1', angkatan: 2025, status: 'Aktif', hpWali: '0821-6677-8899' },
  { nis: '26270120040', nisn: '0111222333', nama: "Afra Na'ilah", grade: 'SMK', kelas: 'X AK', angkatan: 2026, status: 'Aktif', hpWali: '0812-9090-8080' },
  { nis: '26270120100', nisn: '0111222444', nama: 'Aidina Nur Albania', grade: 'SMK', kelas: 'X AK', angkatan: 2026, status: 'Aktif', hpWali: '0813-7070-6060' },
  { nis: '26270120097', nisn: '0111222555', nama: 'Annisa Ayumi', grade: 'SMK', kelas: 'X AK', angkatan: 2026, status: 'Aktif', hpWali: '0852-5050-4040' },
  { nis: '26270120123', nisn: '0111222666', nama: 'Annisa Zefanya Subarkah', grade: 'SMK', kelas: 'X AK', angkatan: 2026, status: 'Aktif', hpWali: '0819-3030-2020' },
  { nis: '26270120031', nisn: '0111222777', nama: 'Aliyatul Sadiyah', grade: 'SMK', kelas: 'X AK', angkatan: 2026, status: 'Aktif', hpWali: '0822-1010-9090' },
  { nis: '2627011001', nisn: '0203040506', nama: 'Contoh: Nadia Putri', grade: 'SMP', kelas: 'VII. A', angkatan: 2026, status: 'Aktif', hpWali: '0812-1111-2222' },
  { nis: '2627011002', nisn: '0203040507', nama: 'Contoh: Rafif Ahmad', grade: 'SMP', kelas: 'VII. A', angkatan: 2026, status: 'Aktif', hpWali: '0813-3333-4444' },
  { nis: '2526011003', nisn: '0203040508', nama: 'Contoh: Salsa Nabila', grade: 'SMP', kelas: 'VIII. B', angkatan: 2025, status: 'Aktif', hpWali: '0857-5555-6666' },
  { nis: '2425101004', nisn: '0203040509', nama: 'Contoh: Dimas Prasetyo', grade: 'SMP', kelas: 'IX. A', angkatan: 2024, status: 'Aktif', hpWali: '0821-7777-8888' }
]

export const PENETAPAN_CONTOH: PenetapanSiswa[] = [
  { nis: '2324090134', grade: 'SMK', kode: 'khllBv', tambahan: [0, 0, 0, 0] },
  { nis: '2324090138', grade: 'SMK', kode: 'khllBv', tambahan: [0, 0, 0, 0] },
  { nis: '2324090145', grade: 'SMK', kode: 'khllBv', tambahan: [0, 0, 0, 0] },
  { nis: '242510115', grade: 'SMK', kode: '0b5Eef', tambahan: [0, 0, 0, 0] },
  { nis: '2526011067', grade: 'SMK', kode: 'R-2627', tambahan: [0, 0, 0, 0] },
  { nis: '26270120040', grade: 'SMK', kode: 'R-2627', tambahan: [0, 0, 0, 0] },
  { nis: '26270120100', grade: 'SMK', kode: 'R-2627', tambahan: [0, 0, 0, 0] },
  { nis: '26270120097', grade: 'SMK', kode: 'SSK-2627', tambahan: [0, 0, 0, 0] },
  { nis: '26270120123', grade: 'SMK', kode: 'SSK-2627', tambahan: [150000, 0, 0, 0] },
  { nis: '26270120031', grade: 'SMK', kode: 'R-2627', tambahan: [0, 0, 0, 0] },
  { nis: '2627011001', grade: 'SMP', kode: 'SMP-R27', tambahan: [0, 0, 0, 0] },
  { nis: '2627011002', grade: 'SMP', kode: 'SMP-R27', tambahan: [0, 0, 0, 0] },
  { nis: '2526011003', grade: 'SMP', kode: 'SMP-B27', tambahan: [0, 0, 0, 0] },
  { nis: '2425101004', grade: 'SMP', kode: 'SMP-R27', tambahan: [0, 0, 0, 0] }
]

export const BAYAR_CONTOH: Pembayaran[] = [
  { no: 'MIG-2324090134-K1', nis: '2324090134', grade: 'SMK', tingkat: 0, nominal: 2325000, keterangan: 'Migrasi Data Lama', metode: 'Tunai', petugas: 'Anis Azyzy, S.T', tanggal: '29 Jul 2026', tanggalISO: '2026-07-29', cutoff: '15–18 Sep 2026' },
  { no: 'MIG-2324090134-K2', nis: '2324090134', grade: 'SMK', tingkat: 1, nominal: 925000, keterangan: 'Migrasi Data Lama', metode: 'Tunai', petugas: 'Anis Azyzy, S.T', tanggal: '29 Jul 2026', tanggalISO: '2026-07-29', cutoff: '15–18 Sep 2026' },
  { no: 'MIG-2324090134-K3', nis: '2324090134', grade: 'SMK', tingkat: 2, nominal: 4325000, keterangan: 'Migrasi Data Lama', metode: 'Tunai', petugas: 'Anis Azyzy, S.T', tanggal: '29 Jul 2026', tanggalISO: '2026-07-29', cutoff: '15–18 Sep 2026' },
  { no: 'MIG-2324090138-K1', nis: '2324090138', grade: 'SMK', tingkat: 0, nominal: 7680000, keterangan: 'Migrasi Data Lama', metode: 'Tunai', petugas: 'Anis Azyzy, S.T', tanggal: '29 Jul 2026', tanggalISO: '2026-07-29', cutoff: '15–18 Sep 2026' },
  { no: 'MIG-2324090138-K2', nis: '2324090138', grade: 'SMK', tingkat: 1, nominal: 6400000, keterangan: 'Migrasi Data Lama', metode: 'Tunai', petugas: 'Anis Azyzy, S.T', tanggal: '29 Jul 2026', tanggalISO: '2026-07-29', cutoff: '15–18 Sep 2026' },
  { no: 'MIG-2324090138-K3', nis: '2324090138', grade: 'SMK', tingkat: 2, nominal: 9500000, keterangan: 'Migrasi Data Lama', metode: 'Tunai', petugas: 'Anis Azyzy, S.T', tanggal: '29 Jul 2026', tanggalISO: '2026-07-29', cutoff: '15–18 Sep 2026' },
  { no: 'KEU-2026-0091', nis: '2526011067', grade: 'SMK', tingkat: 0, nominal: 500000, keterangan: 'SPP', metode: 'Tunai', petugas: 'Anis Azyzy, S.T', tanggal: '28 Okt 2026', tanggalISO: '2026-10-28', cutoff: null },
  { no: 'KEU-2026-0092', nis: '242510115', grade: 'SMK', tingkat: 2, nominal: 750000, keterangan: 'SPP', metode: 'Transfer', petugas: 'Anis Azyzy, S.T', tanggal: '03 Nov 2026', tanggalISO: '2026-11-03', cutoff: null },
  { no: 'KEU-2026-0093', nis: '26270120040', grade: 'SMK', tingkat: 0, nominal: 500000, keterangan: 'SPP', metode: 'QRIS', petugas: 'Anis Azyzy, S.T', tanggal: '03 Nov 2026', tanggalISO: '2026-11-03', cutoff: null },
  { no: 'KEU-2026-0094', nis: '2627011001', grade: 'SMP', tingkat: 0, nominal: 1000000, keterangan: 'SPP', metode: 'Tunai', petugas: 'Anis Azyzy, S.T', tanggal: '02 Nov 2026', tanggalISO: '2026-11-02', cutoff: null }
]

export const CUTOFF_CONTOH: Cutoff[] = [
  { kode: 'CUT-2026-003', grade: 'SMK', dari: '15 Sep 2026', sampai: '18 Sep 2026', dariISO: '2026-09-15', sampaiISO: '2026-09-18', hari: 4, trx: 40, total: 32400000, oleh: 'Mia Akmalia', bukti: false },
  { kode: 'CUT-2026-002', grade: 'SMK', dari: '07 Sep 2026', sampai: '14 Sep 2026', dariISO: '2026-09-07', sampaiISO: '2026-09-14', hari: 8, trx: 107, total: 118575000, oleh: 'Mia Akmalia', bukti: false },
  { kode: 'CUT-2026-001', grade: 'SMK', dari: '04 Sep 2026', sampai: '05 Sep 2026', dariISO: '2026-09-04', sampaiISO: '2026-09-05', hari: 2, trx: 22, total: 24130000, oleh: 'Administrator', bukti: true }
]
