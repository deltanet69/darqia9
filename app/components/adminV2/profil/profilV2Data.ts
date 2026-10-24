export interface ProfileAccount {
  id: string
  name: string
  roleSys: 'Super Admin' | 'Admin Keuangan' | 'Guru' | 'Staff TU'
  roleLabel: string
  unit: string
  jabatan: string
  mapel: string
  nik: string
  kk: string
  nuptk: string
  nip: string
  email: string
  wa: string
  tempat: string
  tgl: string
  jk: 'Laki laki' | 'Perempuan'
  alamat: string
  kel: string
  kec: string
  kab: string
  pendidikan: string
  statusPeg: string
  rfid: string
  akun: 'Aktif' | 'Nonaktif'
  lastLogin: string
}

export interface ProfileCompleteness {
  pct: number
  missing: string[]
}

export interface NotificationPrefs {
  wa: boolean
  email: boolean
  jadwal: boolean
}

export type AccessLevel = 'Penuh' | 'Kelola' | 'Lihat' | 'Tidak Ada'
export type ProfileTabKey = 'overview' | 'dataprofil' | 'aplikasi' | 'pengaturan'

export const PROFILES = {
  ridwan: {
    id: 'ridwan',
    name: 'H. Muhammad Ridwan Hakim',
    roleSys: 'Super Admin',
    roleLabel: 'Ketua Yayasan',
    unit: 'Yayasan Darqia Attaqwa',
    jabatan: 'Ketua Yayasan',
    mapel: '-',
    nik: '3216071205680001',
    kk: '3216070101240001',
    nuptk: '4638749301200001',
    nip: '-',
    email: 'ridwan.hakim@darqiaattqwa.sch.id',
    wa: '0812-9000-0001',
    tempat: 'Bekasi',
    tgl: '12-05-1968',
    jk: 'Laki laki',
    alamat: 'Jl. Masjid Raya No. 1',
    kel: 'Bahagia',
    kec: 'Babelan',
    kab: 'Kab. Bekasi',
    pendidikan: 'S2 Manajemen Pendidikan',
    statusPeg: 'Pegawai Tetap Yayasan',
    rfid: '04:1A:7C:01',
    akun: 'Aktif',
    lastLogin: 'Jumat, 24 Okt 2026 · 06:58 WIB · Chrome (Android)'
  },
  dewi: {
    id: 'dewi',
    name: 'Dewi Sartika, S.Pd',
    roleSys: 'Admin Keuangan',
    roleLabel: 'Bendahara Sekolah',
    unit: 'SMK IT Attaqwa 9',
    jabatan: 'Bendahara Sekolah',
    mapel: '-',
    nik: '3216076803920011',
    kk: '3216070101240011',
    nuptk: '5943765843130011',
    nip: '-',
    email: 'dewi.sartika@smkitattaqwa9.sch.id',
    wa: '0812-9000-0011',
    tempat: 'Bekasi',
    tgl: '28-03-1992',
    jk: 'Perempuan',
    alamat: 'Jl. Melati No. 11',
    kel: 'Bahagia',
    kec: 'Babelan',
    kab: 'Kab. Bekasi',
    pendidikan: 'S1 Pendidikan Ekonomi',
    statusPeg: 'Guru Tetap Yayasan',
    rfid: '04:B7:91:0B',
    akun: 'Aktif',
    lastLogin: 'Jumat, 24 Okt 2026 · 07:12 WIB · Chrome (Windows)'
  },
  budi: {
    id: 'budi',
    name: 'Budi Hartono, S.Kom',
    roleSys: 'Guru',
    roleLabel: 'Guru Mapel · Wali Kelas X TKJ 1',
    unit: 'SMK IT Attaqwa 9',
    jabatan: 'Guru Mapel (Guru)',
    mapel: 'Produktif TKJ (Jaringan & Server)',
    nik: '3216071411780010',
    kk: '3216070101240010',
    nuptk: '4752768643130010',
    nip: '-',
    email: 'budi.hartono@smkitattaqwa9.sch.id',
    wa: '0812-9000-0010',
    tempat: 'Bekasi',
    tgl: '14-11-1978',
    jk: 'Laki laki',
    alamat: 'Jl. Kenanga No. 10',
    kel: 'Bahagia',
    kec: 'Babelan',
    kab: 'Kab. Bekasi',
    pendidikan: 'S1 Teknik Informatika',
    statusPeg: 'Guru Tetap Yayasan',
    rfid: '04:A3:F2:9B',
    akun: 'Aktif',
    lastLogin: 'Jumat, 24 Okt 2026 · 06:41 WIB · Chrome (Android)'
  },
  tono: {
    id: 'tono',
    name: 'Tono Wibowo',
    roleSys: 'Staff TU',
    roleLabel: 'Staff Tata Usaha',
    unit: 'SMK IT Attaqwa 9',
    jabatan: 'Staff TU',
    mapel: '-',
    nik: '3216070202880024',
    kk: '3216070101240024',
    nuptk: '-',
    nip: '-',
    email: 'tono.wibowo@smkitattaqwa9.sch.id',
    wa: '0812-9000-0024',
    tempat: 'Bekasi',
    tgl: '02-02-1988',
    jk: 'Laki laki',
    alamat: 'Jl. Flamboyan No. 24',
    kel: 'Bahagia',
    kec: 'Babelan',
    kab: 'Kab. Bekasi',
    pendidikan: 'SMA',
    statusPeg: 'Pegawai Kontrak',
    rfid: '04:C2:88:17',
    akun: 'Aktif',
    lastLogin: 'Kamis, 23 Okt 2026 · 15:03 WIB · Chrome (Windows)'
  }
} satisfies Record<string, ProfileAccount>

export const MODULES = [
  'Dashboard',
  'Absensi',
  'Kelas',
  'Nilai',
  'Keuangan',
  'Tabungan',
  'CBT',
  'Konten Web',
  'Pengguna',
  'Pengaturan'
] as const

export type ProfileModule = typeof MODULES[number]

export const MODULE_INFO: Record<ProfileModule, [string, string]> = {
  Dashboard: ['home', 'Ringkasan & statistik portal'],
  Absensi: ['check', 'Presensi siswa, guru & staff'],
  Kelas: ['users', 'Manajemen kelas & rombel'],
  Nilai: ['doc', 'Input & rekap nilai siswa'],
  Keuangan: ['wallet', 'SPP, tagihan & pembayaran'],
  Tabungan: ['bank', 'Tabungan siswa'],
  CBT: ['monitor', 'Ujian berbasis komputer'],
  'Konten Web': ['layers', 'Berita & halaman website'],
  Pengguna: ['user', 'Akun & peran pengguna'],
  Pengaturan: ['gear', 'Konfigurasi sistem']
}

export const ACCESS: Record<string, Record<string, AccessLevel>> = {
  'Super Admin': {
    Dashboard: 'Penuh',
    Absensi: 'Penuh',
    Kelas: 'Penuh',
    Nilai: 'Penuh',
    Keuangan: 'Penuh',
    Tabungan: 'Penuh',
    CBT: 'Penuh',
    'Konten Web': 'Penuh',
    Pengguna: 'Penuh',
    Pengaturan: 'Penuh'
  },
  'Admin Keuangan': {
    Dashboard: 'Lihat',
    Keuangan: 'Penuh',
    Tabungan: 'Penuh'
  },
  Guru: {
    Dashboard: 'Lihat',
    Absensi: 'Kelola',
    Nilai: 'Kelola'
  },
  'Wali Kelas': {
    Dashboard: 'Lihat',
    Kelas: 'Kelola'
  },
  'Staff TU': {
    Dashboard: 'Lihat'
  }
}

export const ACTIVITIES: Record<string, Array<[string, string]>> = {
  ridwan: [
    ['Login ke portal', 'Chrome (Windows) · Jumat, 06:58 WIB'],
    ['Menyetujui perubahan peran pengguna', 'Kamis, 16:20 WIB'],
    ['Tap RFID di gerbang utama', 'Kamis, 06:47 WIB']
  ],
  dewi: [
    ['Login ke portal', 'Chrome (Windows) · Jumat, 07:12 WIB'],
    ['Mencetak laporan SPP bulan Oktober', 'Kamis, 14:05 WIB'],
    ['Tap RFID di gerbang utama', 'Kamis, 06:51 WIB']
  ],
  budi: [
    ['Login ke portal', 'Chrome (Android) · Jumat, 06:41 WIB'],
    ['Tap RFID di gerbang utama', 'Jumat, 06:38 WIB'],
    ['Memulai sesi mengajar — Produktif TKJ, X TKJ 1', 'Kamis, 08:31 WIB']
  ],
  tono: [
    ['Login ke portal', 'Chrome (Windows) · Kamis, 15:03 WIB'],
    ['Tap RFID di gerbang utama', 'Kamis, 06:52 WIB'],
    ['Memperbarui nomor WhatsApp di profil', 'Rabu, 10:14 WIB']
  ]
}

export const AVATAR_GRADIENTS = [
  'from-[#0B1F3A] to-[#1D4ED8]', // Theme 0: Navy Blue
  'from-[#065F46] to-[#10B981]', // Theme 1: Emerald Green
  'from-[#155E6B] to-[#0E7490]', // Theme 2: Cyan Ocean
  'from-[#7C2D12] to-[#D97706]'  // Theme 3: Warm Amber
]

export const initials = (name: string): string => {
  const skip = ['H.', 'Hj.', 'Drs.', 'Dr.', 'Ust.', 'Ustzh.']
  const words = name.replace(/,.*$/, '').split(' ').filter(w => w && !skip.includes(w))
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export const maskNum = (v: string): string => {
  return v.length > 10 ? v.slice(0, 6) + '••••••' + v.slice(-4) : v
}

export const completeness = (p: ProfileAccount): ProfileCompleteness => {
  const checks: Array<[string, string]> = [
    ['NIK', p.nik],
    ['No KK', p.kk],
    ['NUPTK', p.nuptk],
    ['NIP', p.nip],
    ['Email', p.email],
    ['No. WhatsApp', p.wa],
    ['Tempat Lahir', p.tempat],
    ['Alamat', p.alamat],
    ['Pendidikan', p.pendidikan],
    ['RFID', p.rfid]
  ]
  const missing = checks.filter(c => !c[1] || c[1] === '-').map(c => c[0])
  return {
    pct: Math.round(((checks.length - missing.length) / checks.length) * 100),
    missing
  }
}
