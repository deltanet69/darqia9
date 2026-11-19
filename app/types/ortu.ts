// Bentuk data respons /api/ortu/* (dipakai server dan halaman Portal Orang Tua).
export type JenjangOrtu = 'SMK' | 'SMP'

export interface SesiOrtuKlien { nis: string, nama: string, jenjang: JenjangOrtu, wajibGanti: boolean }

export type StatusPresensi = 'tepat' | 'terlambat' | 'alpa' | 'izin' | 'sakit'
export interface PresensiHarian { tanggal: string, jamMasuk: string | null, status: StatusPresensi }

export interface SiswaOrtu { nama: string, nis: string, nisn: string, ttl: string, jurusan: string, kelas: string, tahunAjaran: string, semester: string, status: string }

export interface NotifOrtu {
  id: string
  jenis: 'presensi' | 'nilai' | 'tagihan' | 'kartu'
  judul: string
  sub: string
  waktu: string // ISO
  ke: string // rute tujuan
}

export interface RingkasanOrtu {
  siswa: SiswaOrtu
  hariIni: PresensiHarian | null
  kehadiranPersen: number | null
  rataNilai: number | null
  tagihan: { label: string, sisa: number } | null
  notif: NotifOrtu[]
}

export interface PresensiOrtu { bulan: string, nama: string, kehadiranPersen: number | null, hari: PresensiHarian[] }

export type JenisUjian = 'UH' | 'PR' | 'PTS' | 'PAS'
export interface UjianOrtu {
  id: string
  jenis: JenisUjian
  mapelId: string | null // null = PTS/PAS sebelum H-2 (mapel dirahasiakan)
  mapel: string | null
  tanggal: string // ISO
  selesai: boolean
  tidakIkut: boolean // waktu ujian sudah lewat dan siswa tidak pernah memulai
  total: number
  benar: number
  salah: number
  menunggu: number
  nilai: number | null
}
export interface NilaiOrtu { nama: string, semester: string, ujian: UjianOrtu[] }

export interface TingkatOrtu {
  label: string
  keadaan: 'ok' | 'belum' | 'noset' // ok = dirilis & ada nominal; belum = belum dirilis; noset = nominal belum ditetapkan
  total: number
  bayar: number
  sisa: number
  persen: number
}
export interface BayarOrtu { no: string, tanggal: string, metode: string, nominal: number, items: Array<{ nama: string, nominal: number }> }
export interface AdministrasiOrtu {
  kode: string
  paket: string
  tahunAjaran: string
  tingkat: TingkatOrtu[]
  riwayat: BayarOrtu[]
  verifikasi: string // path halaman verifikasi tagihan
}

export interface KontakOrtu { wa: string, email: string, alamat: string }
export interface ProfilOrtu {
  siswa: SiswaOrtu
  ayah: string
  ibu: string
  kontak: KontakOrtu
}

export interface KartuUjianOrtu { periodeId: string, periode: string, mulai: string, selesai: string, punyaKartu: boolean }
export interface KartuOrtu {
  layak: boolean
  siswa: SiswaOrtu
  ujian: KartuUjianOrtu[]
}
