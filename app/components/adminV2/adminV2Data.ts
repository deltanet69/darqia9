export interface SchoolData {
  label: string
  heroValue: string
  heroSub: string
  guru: string
  rombel: string
  siswaHadir: string
  siswaTotal: string
  siswaPct: string
  siswaBar: number
  guruHadir: string
  guruTotal: string
  guruPct: string
  guruBar: number
  exams: {
    harian: Array<[string, string, string, string, string, string]>
    uts: Array<[string, string, string, string, string, string]>
    uas: Array<[string, string, string, string, string, string]>
  }
}

export interface GroupItem {
  id: string
  label: string
  desc: string
  items: Array<[string, string, string]>
}

export interface ActivityRow {
  id: string
  name: string
  icon: string
  amount: string
  statusType: 'ok' | 'wait' | 'proc'
  statusLabel: string
  date: string
}

export const SCHOOL_DATA: Record<'smp' | 'smk', SchoolData> = {
  smp: {
    label: 'SMP IT Bina Cendekia Assalam',
    heroValue: '842',
    heroSub: 'SMP IT BCA &middot; TA 2026/2027',
    guru: '64',
    rombel: '24',
    siswaHadir: '798',
    siswaTotal: '/842',
    siswaPct: '94,8%',
    siswaBar: 94.8,
    guruHadir: '60',
    guruTotal: '/64',
    guruPct: '93,8%',
    guruBar: 93.8,
    exams: {
      harian: [
        ['16', 'Okt', 'UH Matematika', 'Kelas VII Aâ€“C Â· 08:00', 'Terjadwal', 'on'],
        ['17', 'Okt', 'UH IPA Terpadu', 'Kelas VIII Aâ€“B Â· 10:00', 'Terjadwal', 'on']
      ],
      uts: [
        ['20', 'Okt', 'UTS Ganjil 2026', '20â€“25 Okt Â· 8 mapel Â· 842 peserta', 'Persiapan', 'wait']
      ],
      uas: [
        ['8', 'Des', 'UAS Ganjil 2026', '8â€“13 Des Â· 9 mapel Â· 842 peserta', 'Draft', 'off']
      ]
    }
  },
  smk: {
    label: 'SMK IT Attaqwa 9',
    heroValue: '1.247',
    heroSub: 'SMK IT Attaqwa 9 &middot; TA 2026/2027',
    guru: '86',
    rombel: '36',
    siswaHadir: '1.180',
    siswaTotal: '/1.247',
    siswaPct: '94,6%',
    siswaBar: 94.6,
    guruHadir: '81',
    guruTotal: '/86',
    guruPct: '94,2%',
    guruBar: 94.2,
    exams: {
      harian: [
        ['16', 'Okt', 'UH Matematika', 'XII TKJ 1â€“3 Â· 08:00', 'Terjadwal', 'on'],
        ['17', 'Okt', 'UH Produktif TKJ', 'XI TKJ 2 Â· 10:00', 'Terjadwal', 'on']
      ],
      uts: [
        ['20', 'Okt', 'UTS Ganjil 2026', '20â€“25 Okt Â· 8 mapel Â· 1.247 peserta', 'Persiapan', 'wait']
      ],
      uas: [
        ['8', 'Des', 'UAS Ganjil 2026', '8â€“13 Des Â· 9 mapel Â· 1.247 peserta', 'Draft', 'off']
      ]
    }
  }
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
    desc: 'Kas sekolah & tabungan',
    items: [
      ['Keuangan sekolah', 'Kas & anggaran', 'i-wallet'],
      ['Tabungan siswa', 'Kelola tabungan', 'i-bank']
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
      ['Pengaturan', 'Konfigurasi', 'i-gear'],
      ['Profil saya', 'Akun admin', 'i-users']
    ]
  }
]

export const ANNOUNCEMENTS: Array<[string, string, string, string]> = [
  ['i-cal', 'Gladi bersih CBT kelas XII', 'Lab 1â€“4 Â· 20 Okt 2026, 07:00', '2 h'],
  ['i-doc', 'Batas input nilai UTS', 'Maksimal 28 Okt 2026 via modul Akademik', '5 h'],
  ['i-users', 'Rapat komite sekolah', 'Aula utama Â· 30 Okt 2026, 09:00', '1 mg']
]

export const ACTIVITIES: ActivityRow[] = [
  { id: 'INV_00241', name: 'Pembayaran SPP', icon: 'i-wallet', amount: 'Rp 350.000', statusType: 'ok', statusLabel: 'Lunas', date: '14 Okt 2026 08:15' },
  { id: 'INV_00240', name: 'Pendaftaran PPDB', icon: 'i-plus', amount: 'Rp 150.000', statusType: 'ok', statusLabel: 'Lunas', date: '13 Okt 2026 14:40' },
  { id: 'INV_00239', name: 'Pengajuan Dana Kegiatan', icon: 'i-doc', amount: 'Rp 2.500.000', statusType: 'wait', statusLabel: 'Menunggu', date: '13 Okt 2026 11:02' },
  { id: 'INV_00238', name: 'Gaji Guru Honorer', icon: 'i-users', amount: 'Rp 4.800.000', statusType: 'proc', statusLabel: 'Diproses', date: '12 Okt 2026 16:20' },
  { id: 'INV_00237', name: 'Pembelian ATK', icon: 'i-layers', amount: 'Rp 1.150.000', statusType: 'ok', statusLabel: 'Lunas', date: '10 Okt 2026 09:45' }
]

export const ADMIN_DESTINATIONS: Record<string, string> = {
  'Dashboard': '/adminV2',
  'Data siswa': '/adminV2/siswa',
  'Absensi siswa': '/adminV2/absensi',
  'Manajemen kelas': '/adminV2/kelas',
  'Jadwal pelajaran': '/admin/jadwal-pelajaran',
  'Master mapel': '/adminV2/mapel',
  'Raport siswa': '/adminV2/raport',
  'Data guru & staff': '/adminV2/guru',
  'Absensi guru & staff': '/adminV2/absensi-guru',
  'Jadwal mengajar': '/adminV2/jadwal-mengajar',
  'Agenda mengajar': '/adminV2/agenda-mengajar',
  'Modul pembelajaran': '/admin/modul-ajar',
  'Keuangan sekolah': '/admin/keuangan',
  'Tabungan siswa': '/admin/tabungan',
  'Manajemen CBT': '/adminV2/cbt',
  'LMS': '/adminV2/lms',
  'Konten Website': '/adminV2/konten',
  'SPMB': '/spmb',
  'Perpustakaan digital': '#',
  'Manajemen user': '/adminV2/users',
  'Hak Akses (RBAC)': '/admin/rbac',
  'Log Aktivitas': '/admin/log',
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

