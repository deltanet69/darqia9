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
  fatherName: string
  fatherPhone: string
  motherName: string
  motherPhone: string
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
