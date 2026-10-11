export type AdminSubItem = {
  id: string
  t: string
  to: string
  grade?: 'SMP' | 'SMK'
}

export type AdminNavigationItem = {
  id: string
  t: string
  icon: string
  badge?: string
  to?: string
  children?: AdminSubItem[]
}

export type AdminNavigationGroup = {
  group: string
  items: AdminNavigationItem[]
}

export const adminNavigation: AdminNavigationGroup[] = [
  {
    group: 'Utama',
    items: [
      { id: 'dashboard', t: 'Dashboard', icon: 'grid', to: '/admin' }
    ]
  },
  {
    group: 'Akademik',
    items: [
      {
        id: 'siswa',
        t: 'Data Siswa',
        icon: 'users',
        to: '/admin/siswa',
        children: [
          { id: 'siswa-smp', t: 'Data Siswa SMP', to: '/admin/siswa?jenjang=smp', grade: 'SMP' },
          { id: 'siswa-smk', t: 'Data Siswa SMK', to: '/admin/siswa?jenjang=smk', grade: 'SMK' }
        ]
      },
      {
        id: 'absensi-siswa',
        t: 'Absensi Siswa',
        icon: 'ucheck',
        to: '/admin/absensi-siswa',
        children: [
          { id: 'absensi-smp', t: 'Absensi Siswa SMP', to: '/admin/absensi-siswa?jenjang=smp', grade: 'SMP' },
          { id: 'absensi-smk', t: 'Absensi Siswa SMK', to: '/admin/absensi-siswa?jenjang=smk', grade: 'SMK' }
        ]
      },
      {
        id: 'kelas',
        t: 'Manajemen Kelas',
        icon: 'bldg',
        to: '/admin/kelas',
        children: [
          { id: 'kelas-smp', t: 'Kelas SMP', to: '/admin/kelas?jenjang=smp', grade: 'SMP' },
          { id: 'kelas-smk', t: 'Kelas SMK', to: '/admin/kelas?jenjang=smk', grade: 'SMK' }
        ]
      },
      {
        id: 'jadwal-pelajaran',
        t: 'Jadwal Pelajaran',
        icon: 'cal',
        to: '/admin/jadwal-pelajaran',
        children: [
          { id: 'jadwal-smp', t: 'Jadwal Mapel SMP', to: '/admin/jadwal-pelajaran?jenjang=smp', grade: 'SMP' },
          { id: 'jadwal-smk', t: 'Jadwal Mapel SMK', to: '/admin/jadwal-pelajaran?jenjang=smk', grade: 'SMK' }
        ]
      },
      {
        id: 'mapel',
        t: 'Master Mapel',
        icon: 'book',
        to: '/admin/mapel',
        children: [
          { id: 'mapel-smp', t: 'Mapel SMP', to: '/admin/mapel?jenjang=smp', grade: 'SMP' },
          { id: 'mapel-smk', t: 'Mapel SMK', to: '/admin/mapel?jenjang=smk', grade: 'SMK' }
        ]
      },
      {
        id: 'raport',
        t: 'Raport Siswa',
        icon: 'printer',
        to: '/admin/raport',
        children: [
          { id: 'raport-smp', t: 'Raport SMP', to: '/admin/raport?jenjang=smp', grade: 'SMP' },
          { id: 'raport-smk', t: 'Raport SMK', to: '/admin/raport?jenjang=smk', grade: 'SMK' }
        ]
      }
    ]
  },
  {
    group: 'Kepegawaian',
    items: [
      { id: 'guru', t: 'Data Guru & Staff', icon: 'user', to: '/admin/guru' },
      { id: 'absensi-guru', t: 'Absensi Guru & Staff', icon: 'ucheck', to: '/admin/absensi-guru' },
      {
        id: 'jadwal-mengajar',
        t: 'Jadwal Mengajar',
        icon: 'cal',
        to: '/admin/jadwal-mengajar',
        children: [
          { id: 'jadwal-guru-smp', t: 'Jadwal SMP', to: '/admin/jadwal-mengajar?jenjang=smp', grade: 'SMP' },
          { id: 'jadwal-guru-smk', t: 'Jadwal SMK', to: '/admin/jadwal-mengajar?jenjang=smk', grade: 'SMK' }
        ]
      },
      { id: 'agenda-mengajar', t: 'Agenda Mengajar', icon: 'file', to: '/admin/agenda-mengajar' },
      {
        id: 'modul-ajar',
        t: 'Modul Pembelajaran',
        icon: 'layers',
        to: '/admin/modul-ajar',
        children: [
          { id: 'modul-smp', t: 'Modul SMP', to: '/admin/modul-ajar?jenjang=smp', grade: 'SMP' },
          { id: 'modul-smk', t: 'Modul SMK', to: '/admin/modul-ajar?jenjang=smk', grade: 'SMK' }
        ]
      }
    ]
  },
  {
    group: 'Keuangan',
    items: [
      {
        id: 'keuangan',
        t: 'Keuangan Sekolah',
        icon: 'wallet',
        to: '/admin/keuangan',
        children: [
          { id: 'keuangan-smp', t: 'Keuangan SMP', to: '/admin/keuangan?jenjang=smp', grade: 'SMP' },
          { id: 'keuangan-smk', t: 'Keuangan SMK', to: '/admin/keuangan?jenjang=smk', grade: 'SMK' }
        ]
      },
      {
        id: 'tabungan',
        t: 'Tabungan Siswa',
        icon: 'piggy',
        to: '/admin/tabungan',
        children: [
          { id: 'tabungan-smp', t: 'Tabungan SMP', to: '/admin/tabungan?jenjang=smp', grade: 'SMP' },
          { id: 'tabungan-smk', t: 'Tabungan SMK', to: '/admin/tabungan?jenjang=smk', grade: 'SMK' }
        ]
      }
    ]
  },
  {
    group: 'Aplikasi',
    items: [
      {
        id: 'cbt',
        t: 'Manajemen CBT',
        icon: 'monitor',
        badge: '2',
        to: '/admin/cbt',
        children: [
          { id: 'cbt-smp', t: 'CBT SMP', to: '/admin/cbt?jenjang=smp', grade: 'SMP' },
          { id: 'cbt-smk', t: 'CBT SMK', to: '/admin/cbt?jenjang=smk', grade: 'SMK' }
        ]
      },
      {
        id: 'lms',
        t: 'Manajemen LMS',
        icon: 'grad',
        to: '/admin/lms',
        children: [
          { id: 'lms-smp', t: 'LMS SMP', to: '/admin/lms?jenjang=smp', grade: 'SMP' },
          { id: 'lms-smk', t: 'LMS SMK', to: '/admin/lms?jenjang=smk', grade: 'SMK' }
        ]
      },
      {
        id: 'konten',
        t: 'Konten Website',
        icon: 'globe',
        to: '/admin/konten',
        children: [
          { id: 'konten-smp', t: 'Website SMP', to: '/admin/konten?jenjang=smp', grade: 'SMP' },
          { id: 'konten-smk', t: 'Website SMK', to: '/admin/konten?jenjang=smk', grade: 'SMK' }
        ]
      }
    ]
  },
  {
    group: 'Sistem',
    items: [
      { id: 'users', t: 'Manajemen User', icon: 'users', to: '/admin/users' },
      { id: 'rbac', t: 'Hak Akses (RBAC)', icon: 'shield', to: '/admin/rbac' },
      { id: 'log', t: 'Log Aktivitas', icon: 'hist', to: '/admin/log' }
    ]
  }
]

export const adminMobileNavigation: AdminNavigationItem[] = [
  { id: 'dashboard', t: 'Beranda', icon: 'grid', to: '/admin' },
  { id: 'siswa', t: 'Siswa', icon: 'users', to: '/admin/siswa' },
  { id: 'absensi-siswa', t: 'Absensi', icon: 'ucheck', to: '/admin/absensi-siswa' },
  { id: 'guru', t: 'Guru', icon: 'user', to: '/admin/guru' },
  { id: 'keuangan', t: 'Keuangan', icon: 'wallet', to: '/admin/keuangan' }
]

export const adminTitles: Record<string, [string, string]> = {
  dashboard: ['Dashboard', 'Ringkasan operasional sekolah hari ini'],
  siswa: ['Data Siswa', 'Data induk peserta didik, biodata lengkap & status akademik'],
  'absensi-siswa': ['Absensi Siswa', 'Kehadiran & absensi RFID peserta didik per rombel kelas'],
  kelas: ['Manajemen Kelas', 'Pengelolaan rombel kelas, wali kelas & kapasitas ruangan'],
  'jadwal-pelajaran': ['Jadwal Pelajaran', 'Jadwal mata pelajaran terstruktur mingguan per kelas'],
  mapel: ['Master Mapel', 'Daftar mata pelajaran kurikulum dan alokasi jam tatap muka'],
  raport: ['Raport Siswa', 'Rekapitulasi nilai semesteran & pencetakan rapor digital'],
  nilai: ['Manajemen Nilai', 'Rekap nilai SMP & SMK per mata pelajaran'],
  guru: ['Data Guru & Staff', 'Manajemen pendidik, tenaga kependidikan & staf operasional'],
  'absensi-guru': ['Absensi Guru & Staff', 'Kehadiran, absensi RFID & rekap keterlambatan pendidik'],
  'jadwal-mengajar': ['Jadwal Mengajar', 'Jadwal jam mengajar guru per rombel kelas dan jenjang'],
  'agenda-mengajar': ['Agenda Mengajar', 'Catatan agenda harian proses pembelajaran & jurnal kelas'],
  'modul-ajar': ['Modul Pembelajaran', 'Repositori perangkat ajar, materi & modul kurikulum'],
  keuangan: ['Keuangan Sekolah', 'Arus kas, infaq, SPP & ringkasan transaksi kas masuk/keluar'],
  tabungan: ['Tabungan Siswa', 'Simpanan dan mutasi tabungan peserta didik terpadu'],
  cbt: ['Manajemen CBT', 'Jadwal ujian digital, bank soal & hasil asesmen terpusat'],
  lms: ['Manajemen LMS', 'Learning Management System & e-learning interaktif'],
  konten: ['Konten Website', 'Kelola publikasi berita, artikel, galeri & pengumuman'],
  users: ['Manajemen User', 'Akun & peran pengguna sistem operasional sekolah'],
  rbac: ['Hak Akses (RBAC)', 'Matriks perizinan dan wewenang pengguna per peran'],
  log: ['Log Aktivitas', 'Jejak audit seluruh aktivitas operasional sistem'],
  profile: ['Profil Saya', 'Detail identitas akun, hak akses & pengaturan preferensi']
}
