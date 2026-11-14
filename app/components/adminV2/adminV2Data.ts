export interface SchoolData {
  label: string
}

export interface GroupItem {
  id: string
  label: string
  desc: string
  items: Array<[string, string, string]>
}

// Nama sekolah per jenjang (angka dashboard kini dari database, lihat useDashboard).
export const SCHOOL_DATA: Record<'smp' | 'smk', SchoolData> = {
  smp: { label: 'SMP IT Bina Cendekia Assalam' },
  smk: { label: 'SMK IT Attaqwa 9' }
}

export const GROUPS: GroupItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    desc: 'Ringkasan aktivitas sekolah',
    items: [['Dashboard', 'Ringkasan utama', 'i-grid']]
  },
  {
    id: 'akademik',
    label: 'Akademik',
    desc: 'Data pembelajaran & kesiswaan',
    items: [
      ['Data siswa', 'Data induk siswa', 'i-users'],
      ['Absensi siswa', 'Kehadiran harian', 'i-clock'],
      ['Manajemen kelas', 'Rombel & wali kelas', 'i-layers'],
      ['Jadwal pelajaran', 'Jadwal mingguan', 'i-cal'],
      ['Master mapel', 'Mata pelajaran', 'i-book'],
      ['Raport siswa', 'Nilai & raport', 'i-doc']
    ]
  },
  {
    id: 'kepegawaian',
    label: 'Kepegawaian',
    desc: 'Guru, staff & presensi',
    items: [
      ['Data guru & staff', 'Data induk pegawai', 'i-users'],
      ['Absensi guru & staff', 'Presensi harian', 'i-clock'],
      ['Jadwal mengajar', 'Jadwal mingguan', 'i-cal'],
      ['Agenda mengajar', 'Agenda guru', 'i-book'],
      ['Modul pembelajaran', 'Materi & modul', 'i-layers']
    ]
  },
  {
    id: 'keuangan',
    label: 'Keuangan',
    desc: 'Kas & tagihan siswa',
    items: [
      ['Keuangan sekolah', 'Kas & anggaran', 'i-wallet'],
      ['Pembayaran', 'Input pembayaran siswa', 'i-wallet'],
    ]
  },
  {
    id: 'aplikasi',
    label: 'Aplikasi',
    desc: 'Modul aplikasi Darqia 9',
    items: [
      ['Manajemen CBT', 'Ujian digital', 'i-grid'],
      ['LMS', 'Ujian harian digital', 'i-book'],
      ['Konten Website', 'Kelola konten web', 'i-doc'],
      ['SPMB', 'Penerimaan murid baru', 'i-plus'],
      ['Perpustakaan digital', 'Katalog & sirkulasi', 'i-book']
    ]
  },
  {
    id: 'sistem',
    label: 'Sistem Apps',
    desc: 'Pengguna, akses & pengaturan',
    items: [
      ['Manajemen user', 'Akun pengguna', 'i-users'],
      ['Hak Akses (RBAC)', 'Peran & izin', 'i-shield'],
      ['Log Aktivitas', 'Audit trail', 'i-doc'],
      ['Tiketing', 'Aduan & bantuan pengguna', 'i-mail'],
      ['Pengaturan', 'Konfigurasi', 'i-gear'],
      ['Profil saya', 'Akun admin', 'i-users']
    ]
  }
]

export const ADMIN_DESTINATIONS: Record<string, string> = {
  'Dashboard': '/adminV2',
  'Data siswa': '/adminV2/siswa',
  'Absensi siswa': '/adminV2/absensi',
  'Manajemen kelas': '/adminV2/kelas',
  'Jadwal pelajaran': '/adminV2/jadwal-pelajaran',
  'Master mapel': '/adminV2/mapel',
  'Raport siswa': '/adminV2/raport',
  'Data guru & staff': '/adminV2/guru',
  'Absensi guru & staff': '/adminV2/absensi-guru',
  'Jadwal mengajar': '/adminV2/jadwal-mengajar',
  'Agenda mengajar': '/adminV2/agenda-mengajar',
  'Modul pembelajaran': '/adminV2/modul-ajar',
  'Keuangan sekolah': '/adminV2/keuangan',
  'Pembayaran': '/adminV2/keuangan/pembayaran',
  'Manajemen CBT': '/adminV2/cbt',
  'LMS': '/adminV2/lms',
  'Konten Website': '/adminV2/konten',
  'SPMB': '/adminV2/spmb',
  'Perpustakaan digital': '#',
  'Manajemen user': '/adminV2/users',
  'Hak Akses (RBAC)': '/adminV2/rbac',
  'Log Aktivitas': '/adminV2/log-aktivitas',
  'Tiketing': '/adminV2/tiketing',
  'Profil saya': '/adminV2/profil',
  'Pengaturan': '/adminV2/profil?tab=pengaturan'
}

export const getAdminDestination = (title: string): string => {
  if (ADMIN_DESTINATIONS[title]) return ADMIN_DESTINATIONS[title]
  const t = title.toLowerCase().trim()
  for (const [key, dest] of Object.entries(ADMIN_DESTINATIONS)) {
    if (key.toLowerCase().trim() === t) return dest
  }
  if (t === 'lms' || t.includes('ujian harian')) return '/adminV2/lms'
  if (t.includes('cbt') || t.includes('ujian digital')) return '/adminV2/cbt'
  if (t.includes('siswa') && !t.includes('kelas') && !t.includes('raport') && !t.includes('rapor')) return '/adminV2/siswa'
  if (t.includes('absensi') && (t.includes('guru') || t.includes('staff'))) return '/adminV2/absensi-guru'
  if (t.includes('absensi')) return '/adminV2/absensi'
  if (t.includes('kelas') || t.includes('rombel')) return '/adminV2/kelas'
  if (t.includes('mapel') || t.includes('mata pelajaran')) return '/adminV2/mapel'
  if (t.includes('raport') || t.includes('rapor')) return '/adminV2/raport'
  if (t.includes('guru') || t.includes('pegawai') || t.includes('staff')) return '/adminV2/guru'
  if (t.includes('profil') || t.includes('profile')) return '/adminV2/profil'
  return '#'
}

