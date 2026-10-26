import type {
  AgendaAttendance,
  AgendaBook,
  AgendaMeeting,
  AgendaScore,
  AgendaStudent,
  AgendaTab,
  AgendaTabData,
  AttendanceStatus,
  ScoreType
} from '~/composables/useAgendaMengajar'

type Grade = 'SMP' | 'SMK'
type BookRow = {
  id: string
  guru_id: string
  mapel_id: string
  kelas_id: string
  semester: 1 | 2
  tahun_ajaran: string
  created_at: string
}
type MeetingRow = AgendaMeeting & { updated_by: string; updated_at: string }
type AttendanceRow = AgendaAttendance & { updated_by: string; updated_at: string }
type ScoreRow = AgendaScore & { updated_by: string; updated_at: string }
type DemoStudent = AgendaStudent & { kelas_id: string }

interface DummyAgendaStore {
  tahunAjaran: string
  books: BookRow[]
  meetings: MeetingRow[]
  attendance: AttendanceRow[]
  scores: ScoreRow[]
}

const DEMO_USER_ID = '90000000-0000-4000-8000-000000000001'
const TEACHERS = {
  smk: { id: '91000000-0000-4000-8000-000000000001', name: 'Guru Demo SMK' },
  smp: { id: '91000000-0000-4000-8000-000000000002', name: 'Guru Demo SMP' }
}
const SUBJECTS = {
  informatika: { id: '92000000-0000-4000-8000-000000000001', name: 'Informatika' },
  matematika: { id: '92000000-0000-4000-8000-000000000002', name: 'Matematika' }
}
const CLASSES = [
  { id: '93000000-0000-4000-8000-000000000001', name: 'X RPL 1', grade: 'SMK' as Grade, kkm: 77 },
  { id: '93000000-0000-4000-8000-000000000002', name: 'XI TKJ 1', grade: 'SMK' as Grade, kkm: 82 },
  { id: '93000000-0000-4000-8000-000000000003', name: 'VIII A', grade: 'SMP' as Grade, kkm: 78 }
]

const uuid = (group: number, number: number) => `${group.toString().padStart(8, '0')}-0000-4000-8000-${number.toString().padStart(12, '0')}`
const isoNow = () => new Date().toISOString()
const classStudents = (kelasId: string, classNumber: number, label: string): DemoStudent[] =>
  Array.from({ length: 8 }, (_, index) => ({
    id: uuid(94 + classNumber, index + 1),
    kelas_id: kelasId,
    nis: `D${classNumber}${String(index + 1).padStart(3, '0')}`,
    nisn: `99${classNumber}${String(index + 1).padStart(7, '0')}`,
    name: `Siswa Demo ${label} ${String(index + 1).padStart(2, '0')}`,
    gender: index % 2 === 0 ? 'L' : 'P'
  }))

const STUDENTS: DemoStudent[] = [
  ...classStudents(CLASSES[0]!.id, 1, 'RPL'),
  ...classStudents(CLASSES[1]!.id, 2, 'TKJ'),
  ...classStudents(CLASSES[2]!.id, 3, 'VIII')
]

const createDummyStore = (tahunAjaran: string): DummyAgendaStore => {
  const createdAt = isoNow()
  const startYear = Number(tahunAjaran.slice(0, 4))
  const meetingDates = ['07-21', '07-28', '08-04', '08-11', '08-18', '08-25']
  const books: BookRow[] = [
    { id: uuid(10, 1), guru_id: TEACHERS.smk.id, mapel_id: SUBJECTS.informatika.id, kelas_id: CLASSES[0]!.id, semester: 1, tahun_ajaran: tahunAjaran, created_at: createdAt },
    { id: uuid(10, 2), guru_id: TEACHERS.smk.id, mapel_id: SUBJECTS.matematika.id, kelas_id: CLASSES[0]!.id, semester: 1, tahun_ajaran: tahunAjaran, created_at: createdAt },
    { id: uuid(10, 3), guru_id: TEACHERS.smk.id, mapel_id: SUBJECTS.informatika.id, kelas_id: CLASSES[1]!.id, semester: 1, tahun_ajaran: tahunAjaran, created_at: createdAt },
    { id: uuid(10, 4), guru_id: TEACHERS.smp.id, mapel_id: SUBJECTS.informatika.id, kelas_id: CLASSES[2]!.id, semester: 1, tahun_ajaran: tahunAjaran, created_at: createdAt }
  ]
  const topics = ['Orientasi pembelajaran', 'Berpikir komputasional', 'Algoritma dasar', 'Struktur data', 'Pemrograman dasar', 'Proyek latihan']
  const meetings: MeetingRow[] = books.flatMap((book, bookIndex) => topics.map((topik, index) => ({
    id: uuid(20 + bookIndex, index + 1),
    buku_id: book.id,
    pertemuan_ke: index + 1,
    tanggal: `${startYear}-${meetingDates[index]}`,
    topik: book.mapel_id === SUBJECTS.matematika.id ? ['Bilangan berpangkat', 'Persamaan linear', 'Fungsi', 'Statistika', 'Peluang', 'Latihan terpadu'][index]! : topik,
    kegiatan: 'Pembukaan, penjelasan materi, latihan terarah, dan refleksi pembelajaran.',
    updated_by: DEMO_USER_ID,
    updated_at: createdAt
  })))
  const attendance: AttendanceRow[] = books.flatMap((book, bookIndex) => {
    const roster = STUDENTS.filter(student => student.kelas_id === book.kelas_id)
    return [
      { id: uuid(30 + bookIndex, 1), buku_id: book.id, pertemuan_ke: 2, siswa_id: roster[1]!.id, status: 'S' as const, updated_by: DEMO_USER_ID, updated_at: createdAt },
      { id: uuid(30 + bookIndex, 2), buku_id: book.id, pertemuan_ke: 4, siswa_id: roster[3]!.id, status: 'I' as const, updated_by: DEMO_USER_ID, updated_at: createdAt },
      { id: uuid(30 + bookIndex, 3), buku_id: book.id, pertemuan_ke: 5, siswa_id: roster[6]!.id, status: 'A' as const, updated_by: DEMO_USER_ID, updated_at: createdAt }
    ]
  })
  const scores: ScoreRow[] = books.flatMap((book, bookIndex) =>
    STUDENTS.filter(student => student.kelas_id === book.kelas_id).flatMap((student, studentIndex) => {
      const tasks: ScoreRow[] = Array.from({ length: 5 }, (_, index) => ({
        id: uuid(40 + bookIndex, studentIndex * 10 + index + 1),
        buku_id: book.id,
        siswa_id: student.id,
        jenis: 'tugas',
        nomor: index + 1,
        nilai: String(72 + (studentIndex * 4 + index * 3) % 25),
        updated_by: DEMO_USER_ID,
        updated_at: createdAt
      }))
      return [
        ...tasks,
        { id: uuid(50 + bookIndex, studentIndex * 3 + 1), buku_id: book.id, siswa_id: student.id, jenis: 'pts', nomor: null, nilai: String(75 + studentIndex * 3), updated_by: DEMO_USER_ID, updated_at: createdAt },
        { id: uuid(50 + bookIndex, studentIndex * 3 + 2), buku_id: book.id, siswa_id: student.id, jenis: 'predikat', nomor: null, nilai: studentIndex % 3 === 0 ? 'A' : 'B', updated_by: DEMO_USER_ID, updated_at: createdAt },
        { id: uuid(50 + bookIndex, studentIndex * 3 + 3), buku_id: book.id, siswa_id: student.id, jenis: 'sikap', nomor: null, nilai: 'Baik', updated_by: DEMO_USER_ID, updated_at: createdAt }
      ] as ScoreRow[]
    })
  )
  return { tahunAjaran, books, meetings, attendance, scores }
}

const bookView = (row: BookRow): AgendaBook => {
  const teacher = row.guru_id === TEACHERS.smp.id ? TEACHERS.smp : TEACHERS.smk
  const subject = Object.values(SUBJECTS).find(item => item.id === row.mapel_id)!
  const kelas = CLASSES.find(item => item.id === row.kelas_id)!
  return {
    buku_id: row.id,
    guru_id: row.guru_id,
    guru_nama: teacher.name,
    mapel_id: row.mapel_id,
    mapel_nama: subject.name,
    kelas_id: row.kelas_id,
    kelas_nama: kelas.name,
    jenjang: kelas.grade,
    kkm: kelas.kkm,
    semester: row.semester,
    tahun_ajaran: row.tahun_ajaran,
    pas_terbuka: false
  }
}

export const useAgendaMengajarDummy = () => {
  const store = useState<DummyAgendaStore | null>('agenda-mengajar-dummy', () => null)
  const ensureStore = (tahunAjaran?: string) => {
    if (!store.value || (tahunAjaran && store.value.tahunAjaran !== tahunAjaran)) {
      store.value = createDummyStore(tahunAjaran || '2026/2027')
    }
    return store.value
  }

  const loadBooks = async (tahunAjaran: string, semester: 1 | 2, grade: Grade) =>
    ensureStore(tahunAjaran).books
      .filter(book => book.semester === semester && CLASSES.find(kelas => kelas.id === book.kelas_id)?.grade === grade)
      .map(bookView)

  const loadTab = async (bookId: string, _tab: AgendaTab): Promise<AgendaTabData> => {
    const data = ensureStore()
    const book = data.books.find(item => item.id === bookId)
    if (!book) throw new Error('Buku agenda demonstrasi tidak ditemukan.')
    return {
      students: STUDENTS.filter(student => student.kelas_id === book.kelas_id).map(({ kelas_id: _, ...student }) => ({ ...student })),
      meetings: data.meetings.filter(item => item.buku_id === bookId).map(item => ({ ...item })),
      attendance: data.attendance.filter(item => item.buku_id === bookId).map(item => ({ ...item })),
      scores: data.scores.filter(item => item.buku_id === bookId).map(item => ({ ...item }))
    }
  }

  const saveMeeting = async (bookId: string, meeting: Pick<AgendaMeeting, 'pertemuan_ke' | 'tanggal' | 'topik' | 'kegiatan'>) => {
    const data = ensureStore()
    const existing = data.meetings.find(item => item.buku_id === bookId && item.pertemuan_ke === meeting.pertemuan_ke)
    const audit = { updated_by: DEMO_USER_ID, updated_at: isoNow() }
    if (existing) Object.assign(existing, meeting, audit)
    else data.meetings.push({ id: crypto.randomUUID(), buku_id: bookId, ...meeting, ...audit })
  }

  const saveAttendance = async (bookId: string, meetingNumber: number, studentId: string, status: AttendanceStatus) => {
    const data = ensureStore()
    const index = data.attendance.findIndex(item => item.buku_id === bookId && item.pertemuan_ke === meetingNumber && item.siswa_id === studentId)
    if (status === 'H') {
      if (index >= 0) data.attendance.splice(index, 1)
      return
    }
    const audit = { updated_by: DEMO_USER_ID, updated_at: isoNow() }
    if (index >= 0) Object.assign(data.attendance[index]!, { status, ...audit })
    else data.attendance.push({ id: crypto.randomUUID(), buku_id: bookId, pertemuan_ke: meetingNumber, siswa_id: studentId, status, ...audit })
  }

  const saveScore = async (bookId: string, studentId: string, jenis: ScoreType, nilai: string, nomor: number | null = null) => {
    const data = ensureStore()
    const index = data.scores.findIndex(item => item.buku_id === bookId && item.siswa_id === studentId && item.jenis === jenis && item.nomor === nomor)
    if (!nilai.trim()) {
      if (index >= 0) data.scores.splice(index, 1)
      return
    }
    const audit = { updated_by: DEMO_USER_ID, updated_at: isoNow() }
    if (index >= 0) Object.assign(data.scores[index]!, { nilai: nilai.trim(), ...audit })
    else data.scores.push({ id: crypto.randomUUID(), buku_id: bookId, siswa_id: studentId, jenis, nomor, nilai: nilai.trim(), ...audit })
  }

  const loadIntegrityReport = async () => [
    'Siswa aktif tanpa kelas',
    'Penugasan mengajar tanpa guru atau mata pelajaran',
    'Buku agenda tanpa siswa',
    'Transaksi siswa di luar kelas buku',
    'Nilai di luar rentang 0-100'
  ].map(pemeriksaan => ({ pemeriksaan, jumlah: 0 }))

  return { loadBooks, loadTab, saveMeeting, saveAttendance, saveScore, loadIntegrityReport }
}
