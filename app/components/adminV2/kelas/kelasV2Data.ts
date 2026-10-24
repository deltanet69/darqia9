export interface ClassRombel {
  id: string
  name: string
  level: 'SMP' | 'SMK'
  gradeLevel: 'X' | 'XI' | 'XII' | 'VII' | 'VIII' | 'IX'
  major: string
  room: string
  capacity: number
  studentsCount: number
  boys: number
  girls: number
  teacher: string
  teacherNip: string
  teacherPhone: string
  teacherEmail: string
  attendance: number
  average: number
  status: 'Aktif' | 'Nonaktif'
}

export interface ClassScheduleItem {
  id: string
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'
  time: string
  session: number
  subject: string
  teacher: string
  room: string
  guruPresent: boolean
  isCurrentPeriod?: boolean
  classAttendanceDone?: boolean
  alpaStudents?: string[]
}

export interface ClassStudentItem {
  id: string
  nisn: string
  nis: string
  name: string
  gender: 'L' | 'P'
  className: string
  phone: string
  parentName: string
  parentPhone: string
  hasRfid: boolean
  status: 'Aktif' | 'Mutasi' | 'Lulus'
  attendancePct: number
}

export interface ClassAttendanceDaily {
  studentId: string
  name: string
  nisn: string
  gender: 'L' | 'P'
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'
  time: string
  note?: string
}

export interface ClassGradeItem {
  studentId: string
  name: string
  nisn: string
  tugas: number
  uts: number
  uas: number
  finalScore: number
  predikat: 'A' | 'B' | 'C' | 'D'
  tuntas: boolean
}

export interface ClassExamItem {
  id: string
  code: string
  category: 'UH' | 'UTS' | 'UAS'
  categoryLabel: string
  title: string
  subject: string
  date: string
  time: string
  room: string
  supervisor: string
  status: 'Terjadwal' | 'Berlangsung' | 'Selesai'
}

export interface KelasFilter {
  q: string
  tingkat: string
  jurusan: string
  sort: string
  view: 'grid' | 'table'
  page: number
}

export const INITIAL_CLASSES_SMK: ClassRombel[] = [
  {
    id: 'smk-x-rpl-1',
    name: 'X RPL 1',
    level: 'SMK',
    gradeLevel: 'X',
    major: 'RPL',
    room: 'Gedung B · Lab RPL 1',
    capacity: 36,
    studentsCount: 36,
    boys: 24,
    girls: 12,
    teacher: 'Bambang Supriyanto, M.Kom',
    teacherNip: '19890120 201504 1 002',
    teacherPhone: '0812-9876-1001',
    teacherEmail: 'bambang.supriyanto@smkitattaqwa9.sch.id',
    attendance: 96.4,
    average: 85.5,
    status: 'Aktif'
  },
  {
    id: 'smk-x-rpl-2',
    name: 'X RPL 2',
    level: 'SMK',
    gradeLevel: 'X',
    major: 'RPL',
    room: 'Gedung B · Lab RPL 2',
    capacity: 36,
    studentsCount: 35,
    boys: 22,
    girls: 13,
    teacher: 'Eko Prasetyo, S.Pd',
    teacherNip: '19900925 201608 1 003',
    teacherPhone: '0812-9876-1002',
    teacherEmail: 'eko.prasetyo@smkitattaqwa9.sch.id',
    attendance: 94.8,
    average: 83.2,
    status: 'Aktif'
  },
  {
    id: 'smk-x-tkj-1',
    name: 'X TKJ 1',
    level: 'SMK',
    gradeLevel: 'X',
    major: 'TKJ',
    room: 'Gedung A · Lab Jaringan Dasar',
    capacity: 36,
    studentsCount: 36,
    boys: 25,
    girls: 11,
    teacher: 'Budi Hartono, S.Pd',
    teacherNip: '19791120 200502 1 008',
    teacherPhone: '0812-9876-1003',
    teacherEmail: 'budi.hartono@smkitattaqwa9.sch.id',
    attendance: 95.2,
    average: 82.6,
    status: 'Aktif'
  },
  {
    id: 'smk-xi-rpl-1',
    name: 'XI RPL 1',
    level: 'SMK',
    gradeLevel: 'XI',
    major: 'RPL',
    room: 'Gedung B · Lab Mobile & Cloud',
    capacity: 36,
    studentsCount: 34,
    boys: 23,
    girls: 11,
    teacher: 'Hendra Gunawan, S.Kom',
    teacherNip: '19871103 201402 1 004',
    teacherPhone: '0812-9876-1004',
    teacherEmail: 'hendra.gunawan@smkitattaqwa9.sch.id',
    attendance: 95.8,
    average: 86.9,
    status: 'Aktif'
  },
  {
    id: 'smk-xii-rpl-1',
    name: 'XII RPL 1',
    level: 'SMK',
    gradeLevel: 'XII',
    major: 'RPL',
    room: 'Gedung B · R.301 Studio Proyek',
    capacity: 36,
    studentsCount: 35,
    boys: 22,
    girls: 13,
    teacher: 'Fajar Nugroho, S.Pd',
    teacherNip: '19930412 202101 1 005',
    teacherPhone: '0812-9876-1005',
    teacherEmail: 'fajar.nugroho@smkitattaqwa9.sch.id',
    attendance: 97.4,
    average: 88.3,
    status: 'Aktif'
  },
  {
    id: 'smk-xii-tkj-1',
    name: 'XII TKJ 1',
    level: 'SMK',
    gradeLevel: 'XII',
    major: 'TKJ',
    room: 'Gedung B · R.302 Lab Mikrotik & Fiber',
    capacity: 36,
    studentsCount: 34,
    boys: 26,
    girls: 8,
    teacher: 'Agus Setiawan, S.T',
    teacherNip: '19860520 201403 1 002',
    teacherPhone: '0812-9876-1006',
    teacherEmail: 'agus.setiawan@smkitattaqwa9.sch.id',
    attendance: 94.6,
    average: 85.8,
    status: 'Aktif'
  }
]

export const INITIAL_CLASSES_SMP: ClassRombel[] = [
  {
    id: 'smp-vii-a',
    name: 'VII-A',
    level: 'SMP',
    gradeLevel: 'VII',
    major: '',
    room: 'Gedung C · R.101',
    capacity: 36,
    studentsCount: 34,
    boys: 18,
    girls: 16,
    teacher: 'Siti Aminah, S.Pd',
    teacherNip: '19820415 200801 2 003',
    teacherPhone: '0813-2233-0001',
    teacherEmail: 'siti.aminah@smpitbca.sch.id',
    attendance: 95.8,
    average: 84.2,
    status: 'Aktif'
  },
  {
    id: 'smp-vii-b',
    name: 'VII-B',
    level: 'SMP',
    gradeLevel: 'VII',
    major: '',
    room: 'Gedung C · R.102',
    capacity: 36,
    studentsCount: 36,
    boys: 19,
    girls: 17,
    teacher: 'Rini Astuti, S.Pd',
    teacherNip: '19910510 201903 2 005',
    teacherPhone: '0813-2233-0002',
    teacherEmail: 'rini.astuti@smpitbca.sch.id',
    attendance: 94.2,
    average: 82.8,
    status: 'Aktif'
  },
  {
    id: 'smp-viii-a',
    name: 'VIII-A',
    level: 'SMP',
    gradeLevel: 'VIII',
    major: '',
    room: 'Gedung C · R.201',
    capacity: 36,
    studentsCount: 35,
    boys: 18,
    girls: 17,
    teacher: 'Ahmad Fauzi, S.Pd',
    teacherNip: '19870312 201101 1 002',
    teacherPhone: '0813-2233-0003',
    teacherEmail: 'ahmad.fauzi@smpitbca.sch.id',
    attendance: 96.1,
    average: 85.1,
    status: 'Aktif'
  },
  {
    id: 'smp-viii-b',
    name: 'VIII-B',
    level: 'SMP',
    gradeLevel: 'VIII',
    major: '',
    room: 'Gedung C · R.202',
    capacity: 36,
    studentsCount: 35,
    boys: 17,
    girls: 18,
    teacher: 'Nurul Hidayati, S.Si',
    teacherNip: '19880714 201201 2 002',
    teacherPhone: '0813-2233-0004',
    teacherEmail: 'nurul.hidayati@smpitbca.sch.id',
    attendance: 93.9,
    average: 81.5,
    status: 'Aktif'
  },
  {
    id: 'smp-ix-a',
    name: 'IX-A',
    level: 'SMP',
    gradeLevel: 'IX',
    major: '',
    room: 'Gedung C · R.301',
    capacity: 36,
    studentsCount: 34,
    boys: 16,
    girls: 18,
    teacher: 'Drs. H. Ahmad Dahlan',
    teacherNip: '19750812 200003 1 001',
    teacherPhone: '0813-2233-0005',
    teacherEmail: 'ahmad.dahlan@smpitbca.sch.id',
    attendance: 97.2,
    average: 86.4,
    status: 'Aktif'
  },
  {
    id: 'smp-ix-b',
    name: 'IX-B',
    level: 'SMP',
    gradeLevel: 'IX',
    major: '',
    room: 'Gedung C · R.302',
    teacher: 'Dewi Lestari, S.Pd',
    teacherNip: '19940218 202012 2 008',
    teacherPhone: '0813-2233-0006',
    teacherEmail: 'dewi.lestari@smpitbca.sch.id',
    capacity: 36,
    studentsCount: 36,
    boys: 20,
    girls: 16,
    attendance: 94.5,
    average: 83.7,
    status: 'Aktif'
  }
]

export const TEACHER_POOL_SMK = [
  'Bambang Supriyanto, M.Kom',
  'Eko Prasetyo, S.Pd',
  'Budi Hartono, S.Pd',
  'Hendra Gunawan, S.Kom',
  'Fajar Nugroho, S.Pd',
  'Agus Setiawan, S.T',
  'Dewi Sartika, S.Si',
  'Rina Marlina, S.Pd',
  'Andi Wijaya, S.Kom',
  'Ust. H. Mahmud, S.Pd.I'
]

export const TEACHER_POOL_SMP = [
  'Siti Aminah, S.Pd',
  'Rini Astuti, S.Pd',
  'Ahmad Fauzi, S.Pd',
  'Nurul Hidayati, S.Si',
  'Drs. H. Ahmad Dahlan',
  'Dewi Lestari, S.Pd',
  'Fajar Sidik, S.Pd',
  'Nina Kurnia, S.Pd',
  'Sri Wahyuni, S.Pd',
  'Ustzh. Fatimah, S.Pd.I'
]

export const getTingkatLabel = (name: string, level: 'SMP' | 'SMK'): string => {
  if (level === 'SMK') {
    if (name.startsWith('X ')) return 'Tingkat X'
    if (name.startsWith('XI ')) return 'Tingkat XI'
    if (name.startsWith('XII ')) return 'Tingkat XII'
  } else {
    if (name.startsWith('VII')) return 'Tingkat VII'
    if (name.startsWith('VIII')) return 'Tingkat VIII'
    if (name.startsWith('IX')) return 'Tingkat IX'
  }
  return 'Reguler'
}

export const getInitials = (name: string): string => {
  const parts = name.replace(/^(H\.|Hj\.|Drs\.|Dra\.|Ust\.|Ustzh\.)\s*/i, '').trim().split(/\s+/)
  const first = parts[0]
  if (!first) return 'WK'
  if (parts.length === 1) return first.substring(0, 2).toUpperCase()
  return (first[0] + (parts[1]?.[0] || '')).toUpperCase()
}

export const getAvatarColor = (name: string): string => {
  const gradients = [
    'from-[#1B5FD9] to-[#0A2A5C]',
    'from-[#059669] to-[#064E3B]',
    'from-[#7C3AED] to-[#4C1D95]',
    'from-[#D97706] to-[#78350F]',
    'from-[#0284C7] to-[#0C4A6E]',
    'from-[#E11D48] to-[#881337]'
  ]
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return gradients[sum % gradients.length] || gradients[0]!
}

export const generateMockSchedule = (className: string, level: 'SMP' | 'SMK'): ClassScheduleItem[] => {
  const days: Array<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'> = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  const slots = [
    { time: '07:00–07:45', session: 1 },
    { time: '07:45–08:30', session: 2 },
    { time: '08:30–09:15', session: 3 },
    { time: '09:30–10:15', session: 4 },
    { time: '10:15–11:00', session: 5 },
    { time: '11:00–11:45', session: 6 },
    { time: '12:30–13:15', session: 7 }
  ]

  const subjectsSMK = [
    { name: 'Pemrograman Berorientasi Objek', teacher: 'Andi Wijaya, S.Kom' },
    { name: 'Basis Data & SQL', teacher: 'Hendra Gunawan, S.Kom' },
    { name: 'Informatika & Logika Algoritma', teacher: 'Bambang Supriyanto, M.Kom' },
    { name: 'Pendidikan Agama Islam', teacher: 'Ust. H. Mahmud, S.Pd.I' },
    { name: 'Matematika Terapan', teacher: 'Budi Hartono, S.Pd' },
    { name: 'Bahasa Indonesia & Literasi', teacher: 'Siti Maryam, S.Pd' },
    { name: 'Administrasi Infrastruktur Jaringan', teacher: 'Agus Setiawan, S.T' }
  ]

  const subjectsSMP = [
    { name: 'Tahfidz Al-Qur\'an', teacher: 'Ustzh. Fatimah, S.Pd.I' },
    { name: 'Matematika', teacher: 'Fajar Sidik, S.Pd' },
    { name: 'Ilmu Pengetahuan Alam', teacher: 'Wulan Dari, S.Si' },
    { name: 'Bahasa Indonesia', teacher: 'Nina Kurnia, S.Pd' },
    { name: 'Pendidikan Agama Islam', teacher: 'Ust. H. Mahmud, S.Pd.I' },
    { name: 'Bahasa Inggris', teacher: 'Sri Wahyuni, S.Pd' },
    { name: 'Ilmu Pengetahuan Sosial', teacher: 'Ahmad Fauzi, S.Pd' }
  ]

  const subjects = level === 'SMK' ? subjectsSMK : subjectsSMP
  const items: ClassScheduleItem[] = []

  days.forEach((day, di) => {
    slots.forEach((slot, si) => {
      const sub = subjects[(di * 2 + si) % subjects.length]
      if (!sub) return
      const isToday = day === 'Senin'
      const isCurrent = isToday && slot.session === 3
      items.push({
        id: `${className}-${day}-${slot.session}`,
        day,
        time: slot.time,
        session: slot.session,
        subject: sub.name,
        teacher: sub.teacher,
        room: className.includes('RPL') ? 'Lab RPL' : 'Ruang Kelas',
        guruPresent: si < 4,
        isCurrentPeriod: isCurrent,
        classAttendanceDone: si < 3
      })
    })
  })

  return items
}

export const generateMockStudents = (className: string, level: 'SMP' | 'SMK', count: number): ClassStudentItem[] => {
  const maleNames = [
    'Muhammad Al-Fatih', 'Ahmad Dani Pratama', 'Bintang Ramadan', 'Fahri Hidayat',
    'Rafi Ahmad Sanjaya', 'Hafiz Surya Wijaya', 'Ibrahim Qasim', 'Reza Kurniawan',
    'Gilang Ramadhan', 'Dimas Prasetyo', 'Zaki Pratama Putra', 'Fikri Haikal',
    'Rian Ardiansyah', 'Aditya Nugraha', 'Yoga Permana', 'Satria Dewa',
    'Bagas Maulana', 'Aldi Saputra', 'Dwi Cahyo', 'Yusuf Habibi'
  ]

  const femaleNames = [
    'Nabila Zahra Putri', 'Siti Nur Azizah', 'Aisyah Humaira', 'Salma Fauziah',
    'Zahra Khoirunnisa', 'Farida Nur Rahma', 'Annisa Zahra', 'Khansa Lathifah',
    'Putri Maharani', 'Safira Maulida', 'Rania Zulaikha', 'Dinda Permata',
    'Tasya Kamila', 'Syifa Azzahra', 'Indah Permata Sari', 'Alia Wardani'
  ]

  const res: ClassStudentItem[] = []
  const baseNis = level === 'SMK' ? 2026100 : 2026500

  for (let i = 0; i < count; i++) {
    const isMale = i % 2 === 0
    const namePool = isMale ? maleNames : femaleNames
    const name = `${namePool[i % namePool.length]} ${i > 15 ? (i + 1) : ''}`.trim()
    const nisn = `00${level === 'SMK' ? '7' : '6'}${100000 + i * 149}`
    const nis = `${baseNis + i}`

    res.push({
      id: `${level.toLowerCase()}-sis-${nis}`,
      nisn,
      nis,
      name,
      gender: isMale ? 'L' : 'P',
      className,
      phone: `0812-98${String(10000 + i * 83).padStart(5, '0')}`,
      parentName: `Wali ${name.split(' ')[0]}`,
      parentPhone: `0813-88${String(10000 + i * 91).padStart(5, '0')}`,
      hasRfid: i % 7 !== 0,
      status: 'Aktif',
      attendancePct: Math.min(100, Math.round(90 + ((i * 13) % 11)))
    })
  }

  return res
}

export const generateMockAttendance = (students: ClassStudentItem[]): ClassAttendanceDaily[] => {
  return students.map((s, idx) => {
    let st: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' = 'Hadir'
    let time = `06:${String(35 + (idx % 22)).padStart(2, '0')} WIB`
    let note = ''

    if (idx === 3) {
      st = 'Sakit'
      time = '-'
      note = 'Surat dokter terlampir'
    } else if (idx === 7) {
      st = 'Izin'
      time = '-'
      note = 'Acara keluarga (ada surat)'
    } else if (idx === 14) {
      st = 'Alpa'
      time = '-'
      note = 'Tanpa keterangan'
    }

    return {
      studentId: s.id,
      name: s.name,
      nisn: s.nisn,
      gender: s.gender,
      status: st,
      time,
      note
    }
  })
}

export const generateMockGrades = (students: ClassStudentItem[]): ClassGradeItem[] => {
  return students.map((s, idx) => {
    const tugas = 75 + ((idx * 17) % 23)
    const uts = 70 + ((idx * 13) % 28)
    const uas = 72 + ((idx * 19) % 26)
    const finalScore = Math.round((tugas * 0.3) + (uts * 0.3) + (uas * 0.4))
    const predikat: 'A' | 'B' | 'C' | 'D' = finalScore >= 88 ? 'A' : finalScore >= 78 ? 'B' : finalScore >= 70 ? 'C' : 'D'

    return {
      studentId: s.id,
      name: s.name,
      nisn: s.nisn,
      tugas,
      uts,
      uas,
      finalScore,
      predikat,
      tuntas: finalScore >= 75
    }
  })
}

export const generateMockExams = (className: string, level: 'SMP' | 'SMK'): ClassExamItem[] => {
  return [
    {
      id: 'uh-1',
      code: 'UH-101',
      category: 'UH',
      categoryLabel: 'Ujian Harian',
      title: level === 'SMK' ? 'Ulangan Harian 1: Pemrograman Modular' : 'Ulangan Harian 1: Bilangan Bulat',
      subject: level === 'SMK' ? 'Pemrograman Berorientasi Objek' : 'Matematika',
      date: '22 Okt 2026',
      time: '08:00–09:30 WIB',
      room: className.includes('RPL') ? 'Lab RPL 1' : 'Ruang Kelas',
      supervisor: 'Wali Kelas',
      status: 'Terjadwal'
    },
    {
      id: 'uh-2',
      code: 'UH-102',
      category: 'UH',
      categoryLabel: 'Ujian Harian',
      title: level === 'SMK' ? 'Kuis Teori: Normalisasi Basis Data' : 'Ulangan Harian 2: Struktur Tumbuhan',
      subject: level === 'SMK' ? 'Basis Data & SQL' : 'IPA Terpadu',
      date: '24 Okt 2026',
      time: '10:15–11:45 WIB',
      room: 'Ruang Kelas',
      supervisor: 'Guru Pengampu',
      status: 'Terjadwal'
    },
    {
      id: 'uts-1',
      code: 'UTS-GANJIL',
      category: 'UTS',
      categoryLabel: 'Ujian Tengah Semester',
      title: 'Ujian Tengah Semester Ganjil 2026/2027',
      subject: 'Serentak Seluruh Mapel (8 Mapel)',
      date: '27 Okt – 02 Nov 2026',
      time: '07:30–12:00 WIB',
      room: 'Ruang Ujian Terpadu',
      supervisor: 'Pengawas Silang CBT',
      status: 'Terjadwal'
    },
    {
      id: 'uas-1',
      code: 'UAS-GANJIL',
      category: 'UAS',
      categoryLabel: 'Ujian Akhir Semester',
      title: 'Penilaian Akhir Semester (PAS) Ganjil',
      subject: 'Seluruh Mapel Kurikulum',
      date: '08 – 14 Des 2026',
      time: '07:30–12:30 WIB',
      room: 'Ruang CBT & Lab',
      supervisor: 'Panitia Asesmen Semester',
      status: 'Terjadwal'
    }
  ]
}
