export type GradeType = 'SMK' | 'SMP'
export type CbtTabId = 'summary' | 'monitoring' | 'bank' | 'exams' | 'results' | 'management'

export interface CbtTabDef {
  id: CbtTabId
  label: string
  icon: string
  live?: boolean
}

export const CBT_TABS: CbtTabDef[] = [
  { id: 'summary', label: 'Ringkasan', icon: 'grid' },
  { id: 'monitoring', label: 'Monitoring Ujian', icon: 'monitor', live: true },
  { id: 'bank', label: 'Bank Soal', icon: 'book' },
  { id: 'exams', label: 'Daftar Ujian', icon: 'cal' },
  { id: 'results', label: 'Nilai Siswa', icon: 'users' },
  { id: 'management', label: 'Manajemen Ujian', icon: 'gear' }
]

export interface ExamItem {
  id: string
  classId?: string
  subjectId?: string
  questionBankId?: string
  questionIds?: string[] | null
  startsAt?: string
  bankCode?: string
  name: string
  subject: string
  classroom: string
  grade: GradeType
  date: string
  time: string
  duration: number
  participants: number
  status: 'Berlangsung' | 'Terjadwal' | 'Selesai'
  average: number
  kkm: number
  token: string
  collected: number
  doing: number
  violations: number
  supervisor: string
}

export interface BankQuestionItem {
  id: string
  number: number
  type: 'PG' | 'Isian' | 'Esai' | 'Interaktif'
  difficulty: 'Mudah' | 'Sedang' | 'Sukar'
  text: string
  imageUrl?: string
  isRtl?: boolean
  isMultiSelect?: boolean
  options?: { key: string; text: string }[]
  key: string | string[]
  rubric?: string
  mediaType?: 'audio' | 'video'
  mediaUrl?: string
  mediaFileName?: string
  mediaCompressStatus?: string
  interactiveAnswerType?: 'PG' | 'PG_Multi' | 'Isian'
}

export interface BankPackage {
  id: string
  classId?: string
  subjectId?: string
  code: string
  classroom: string
  subject: string
  grade: GradeType
  difficulty: 'Mudah' | 'Sedang' | 'Sukar'
  teacherName: string
  updatedAt: string
  hasInteractive: boolean
  questions: BankQuestionItem[]
}

export interface StudentResult {
  id: string
  nisn: string
  name: string
  classroom: string
  grade: GradeType
  pgScore: number
  essayScore: number | null
  totalScore: number
  essayStatus: 'Sudah Dikoreksi' | 'Perlu Koreksi' | 'Tanpa Esai'
  status: 'Lulus' | 'Remedial' | 'Belum Selesai'
  submittedAt: string
  essayAnswers?: { question: string; studentAnswer: string; rubric: string; score: number | null }[]
}

export type StudentScore = StudentResult

export interface ViolationLog {
  id: string
  studentId: string
  studentName: string
  classroom: string
  grade: GradeType
  examId: string
  examName: string
  time: string
  reason: string
  level: number
  status: 'Terkunci (1x)' | 'Terkunci (2x)' | 'Terkunci Permanen' | 'Selesai Dibuka'
  unlockPin: string
}

export interface TeacherAccessItem {
  id: number
  name: string
  nip: string
  subject: string
  grade: GradeType
  roles: string[]
  classes: string[]
}

export interface LiveStudent {
  id: string
  name: string
  nisn: string
  progress: number
  total: number
  status: 'Mengerjakan' | 'Selesai' | 'Terkunci (1x)'
  violations: number
  lastActive: string
}

export interface ParticipantItem {
  id: string
  nisn: string
  name: string
  classroom: string
  sessionStatus: 'Aktif' | 'Terkunci (1x)'
  examToken: string
}

export interface ExamGroupItem {
  classroom: string
  students: number
  date: string
  status: 'Berlangsung' | 'Terjadwal' | 'Selesai'
  supervisor: string
  subjects: number
}

export interface ClassResultItem {
  name: string
  count: number
  avg: number
  graded: number
  needGrading: number
  passed: number
}

export const KKM_DEFAULT = 75

export const INITIAL_EXAMS: ExamItem[] = []

export const INITIAL_PACKAGES: BankPackage[] = []

export const INITIAL_RESULTS: StudentResult[] = [
  {
    id: 'R1',
    nisn: '0071234501',
    name: 'Ahmad Fauzan',
    classroom: 'X RPL 1',
    grade: 'SMK',
    pgScore: 70,
    essayScore: 20,
    totalScore: 90,
    essayStatus: 'Sudah Dikoreksi',
    status: 'Lulus',
    submittedAt: '30 Sep 2026 08:45',
    essayAnswers: [
      {
        question: 'Jelaskan perbedaan mendasar antara pemrograman berorientasi objek (OOP) dengan pemrograman prosedural!',
        studentAnswer: 'OOP menggunakan konsep class dan object dengan fitur inheritance dan encapsulation, sedangkan prosedural berurutan baris demi baris.',
        rubric: 'Menyebutkan konsep object, class, encapsulation, dan perbedaan alur prosedural.',
        score: 20
      }
    ]
  },
  {
    id: 'R2',
    nisn: '0071234502',
    name: 'Siti Aisyah',
    classroom: 'X RPL 1',
    grade: 'SMK',
    pgScore: 65,
    essayScore: null,
    totalScore: 65,
    essayStatus: 'Perlu Koreksi',
    status: 'Belum Selesai',
    submittedAt: '30 Sep 2026 08:50',
    essayAnswers: [
      {
        question: 'Jelaskan perbedaan mendasar antara pemrograman berorientasi objek (OOP) dengan pemrograman prosedural!',
        studentAnswer: 'OOP itu berorientasi pada objek nyata seperti mobil dan manusia, prosedural adalah prosedur fungsi biasa.',
        rubric: 'Menyebutkan konsep object, class, encapsulation, dan perbedaan alur prosedural.',
        score: null
      }
    ]
  },
  {
    id: 'R3',
    nisn: '0071234503',
    name: 'Muhammad Rizky Pratama',
    classroom: 'X RPL 1',
    grade: 'SMK',
    pgScore: 75,
    essayScore: 18,
    totalScore: 93,
    essayStatus: 'Sudah Dikoreksi',
    status: 'Lulus',
    submittedAt: '30 Sep 2026 08:40'
  },
  {
    id: 'R4',
    nisn: '0071234504',
    name: 'Nabila Zahra Putri',
    classroom: 'X RPL 1',
    grade: 'SMK',
    pgScore: 50,
    essayScore: 12,
    totalScore: 62,
    essayStatus: 'Sudah Dikoreksi',
    status: 'Remedial',
    submittedAt: '30 Sep 2026 08:55'
  },
  {
    id: 'R5',
    nisn: '0081234501',
    name: 'Farhan Maulana',
    classroom: 'VII-A',
    grade: 'SMP',
    pgScore: 85,
    essayScore: null,
    totalScore: 85,
    essayStatus: 'Tanpa Esai',
    status: 'Lulus',
    submittedAt: '27 Sep 2026 08:20'
  },
  {
    id: 'R6',
    nisn: '0081234502',
    name: 'Putri Safitri',
    classroom: 'VII-A',
    grade: 'SMP',
    pgScore: 90,
    essayScore: null,
    totalScore: 90,
    essayStatus: 'Tanpa Esai',
    status: 'Lulus',
    submittedAt: '27 Sep 2026 08:15'
  }
]

export const INITIAL_STUDENTS: StudentResult[] = INITIAL_RESULTS

export const INITIAL_VIOLATIONS: ViolationLog[] = [
  {
    id: 'V1',
    studentId: '0071234504',
    studentName: 'Nabila Zahra Putri',
    classroom: 'X RPL 1',
    grade: 'SMK',
    examId: 'E1',
    examName: 'PTS Informatika',
    time: '08:15 WIB',
    reason: 'Membuka tab browser lain (2x terdeteksi)',
    level: 1,
    status: 'Terkunci (1x)',
    unlockPin: 'ATQ-9481'
  },
  {
    id: 'V2',
    studentId: '0071234502',
    studentName: 'Siti Aisyah',
    classroom: 'X RPL 1',
    grade: 'SMK',
    examId: 'E1',
    examName: 'PTS Informatika',
    time: '08:42 WIB',
    reason: 'Keluar dari mode layar penuh (Full-Screen exit)',
    level: 1,
    status: 'Terkunci (1x)',
    unlockPin: 'ATQ-3312'
  },
  {
    id: 'V3',
    studentId: '0081234508',
    studentName: 'Raka Dimas',
    classroom: 'VII-A',
    grade: 'SMP',
    examId: 'E5',
    examName: 'UTS PAI',
    time: '08:05 WIB',
    reason: 'Shortcut tombol dilarang (Alt + Tab)',
    level: 2,
    status: 'Selesai Dibuka',
    unlockPin: 'SMP-8821'
  }
]

export const INITIAL_TEACHERS: TeacherAccessItem[] = [
  {
    id: 1,
    name: 'Bpk. Budi Santoso, S.Kom',
    nip: '198504122010011005',
    subject: 'Informatika & Basis Data',
    grade: 'SMK',
    roles: ['Pembuat Soal', 'Pengawas Ujian', 'Penilai Esai'],
    classes: ['X RPL 1', 'XI RPL 1', 'XII RPL 1']
  },
  {
    id: 2,
    name: 'Ibu Siti Aminah, S.Pd',
    nip: '198908232014022003',
    subject: 'Jaringan Komputer',
    grade: 'SMK',
    roles: ['Pengawas Ujian', 'Pembuat Soal'],
    classes: ['X TKJ 1', 'XI TKJ 1', 'XII TKJ 1']
  },
  {
    id: 3,
    name: 'Ust. Hendra Gunawan, S.Pd.I',
    nip: '198201152009031002',
    subject: 'PAI & Budi Pekerti',
    grade: 'SMP',
    roles: ['Pembuat Soal', 'Pengawas Ujian', 'Penilai Esai'],
    classes: ['VII-A', 'VIII-A', 'IX-A']
  },
  {
    id: 4,
    name: 'Ibu Rina Marlina, M.Pd',
    nip: '199103192016012004',
    subject: 'Matematika',
    grade: 'SMP',
    roles: ['Pembuat Soal', 'Pengawas Ujian'],
    classes: ['VII-B', 'VIII-B', 'IX-B']
  }
]

export const INITIAL_LIVE_STUDENTS: LiveStudent[] = [
  { id: '1', name: 'Ahmad Fauzan', nisn: '0071234501', progress: 28, total: 30, status: 'Mengerjakan', violations: 0, lastActive: '1 menit lalu' },
  { id: '2', name: 'Siti Aisyah', nisn: '0071234502', progress: 22, total: 30, status: 'Terkunci (1x)', violations: 2, lastActive: 'Baru saja' },
  { id: '3', name: 'Muhammad Rizky Pratama', nisn: '0071234503', progress: 30, total: 30, status: 'Selesai', violations: 0, lastActive: '5 menit lalu' },
  { id: '4', name: 'Nabila Zahra Putri', nisn: '0071234504', progress: 14, total: 30, status: 'Terkunci (1x)', violations: 1, lastActive: '2 menit lalu' },
  { id: '5', name: 'Farhan Maulana', nisn: '0071234505', progress: 25, total: 30, status: 'Mengerjakan', violations: 0, lastActive: 'Baru saja' },
  { id: '6', name: 'Putri Safitri', nisn: '0071234506', progress: 30, total: 30, status: 'Selesai', violations: 0, lastActive: '10 menit lalu' }
]

export const INITIAL_PARTICIPANTS: ParticipantItem[] = [
  { id: '1', nisn: '0071234501', name: 'Ahmad Fauzan', classroom: 'X RPL 1', sessionStatus: 'Aktif', examToken: 'INF930' },
  { id: '2', nisn: '0071234502', name: 'Siti Aisyah', classroom: 'X RPL 1', sessionStatus: 'Terkunci (1x)', examToken: 'INF930' },
  { id: '3', nisn: '0071234503', name: 'Muhammad Rizky Pratama', classroom: 'X RPL 1', sessionStatus: 'Aktif', examToken: 'INF930' },
  { id: '4', nisn: '0071234504', name: 'Nabila Zahra Putri', classroom: 'X RPL 1', sessionStatus: 'Terkunci (1x)', examToken: 'INF930' },
  { id: '5', nisn: '0081234501', name: 'Farhan Maulana', classroom: 'VII-A', sessionStatus: 'Aktif', examToken: 'PAI927' },
  { id: '6', nisn: '0081234502', name: 'Putri Safitri', classroom: 'VII-A', sessionStatus: 'Aktif', examToken: 'PAI927' }
]

export const EXAM_GROUPS: Record<GradeType, ExamGroupItem[]> = {
  SMK: [
    { classroom: 'X RPL 1', students: 40, date: '30 Sep - 5 Okt 2026', status: 'Berlangsung', supervisor: 'Bpk. Budi Santoso, S.Kom', subjects: 4 },
    { classroom: 'XII TKJ 1', students: 38, date: '30 Sep - 5 Okt 2026', status: 'Berlangsung', supervisor: 'Ibu Siti Aminah, S.Pd', subjects: 5 },
    { classroom: 'XI RPL 1', students: 40, date: '25 Sep - 29 Sep 2026', status: 'Selesai', supervisor: 'Bpk. Budi Santoso, S.Kom', subjects: 4 }
  ],
  SMP: [
    { classroom: 'IX-A', students: 44, date: '2 Okt - 8 Okt 2026', status: 'Terjadwal', supervisor: 'Bpk. Ahmad Dahlan, S.Pd', subjects: 6 },
    { classroom: 'VIII-B', students: 44, date: '5 Okt - 10 Okt 2026', status: 'Terjadwal', supervisor: 'Ibu Rina Marlina, M.Pd', subjects: 6 },
    { classroom: 'VII-A', students: 44, date: '27 Sep - 29 Sep 2026', status: 'Selesai', supervisor: 'Ust. Hendra Gunawan, S.Pd.I', subjects: 4 }
  ]
}

export const CLASS_RESULTS: Record<GradeType, ClassResultItem[]> = {
  SMK: [
    { name: 'X RPL 1', count: 40, avg: 82.4, graded: 38, needGrading: 2, passed: 36 },
    { name: 'XI RPL 1', count: 40, avg: 79.2, graded: 40, needGrading: 0, passed: 35 },
    { name: 'XII TKJ 1', count: 38, avg: 85.0, graded: 38, needGrading: 0, passed: 37 }
  ],
  SMP: [
    { name: 'VII-A', count: 44, avg: 84.5, graded: 44, needGrading: 0, passed: 42 },
    { name: 'VIII-B', count: 44, avg: 78.0, graded: 44, needGrading: 0, passed: 39 },
    { name: 'IX-A', count: 44, avg: 81.2, graded: 44, needGrading: 0, passed: 40 }
  ]
}

export const BANK_CLASSES: Record<GradeType, string[]> = {
  SMK: ['X RPL 1', 'XI RPL 1', 'XII RPL 1', 'X TKJ 1', 'XI TKJ 1', 'XII TKJ 1', 'XI TKJ 2'],
  SMP: ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B']
}

export const BANK_SUBJECTS: Record<GradeType, string[]> = {
  SMK: ['Informatika', 'Pemrograman Web', 'Jaringan Komputer', 'Basis Data', 'Matematika', 'PAI', 'Bahasa Inggris'],
  SMP: ['PAI', 'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA Terpadu', 'IPS Terpadu', 'Informatika']
}
