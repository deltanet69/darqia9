import { ref, computed } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useAdminCbtData } from '~/composables/useAdminCbtData'

export type ExamStatus = 'Berlangsung' | 'Terjadwal' | 'Selesai'
export type QuestionType = 'PG' | 'PG Kompleks' | 'Isian' | 'Esai' | 'Audio' | 'Video'
export type Difficulty = 'Mudah' | 'Sedang' | 'Sukar'

export interface Exam {
  id: string
  name: string
  subject: string
  classroom: string
  grade: 'SMP' | 'SMK'
  date: string
  time: string
  duration: number
  participants: number
  status: ExamStatus
  average: number
  kkm: number
  token: string
  collected: number
  doing: number
  violations: number
  supervisor: string
}

export interface Question {
  id: string
  code: string
  subject: string
  classroom: string
  grade: 'SMP' | 'SMK'
  type: QuestionType
  difficulty: Difficulty
  text: string
  key: string
  used: number
  options?: string[]
  audioUrl?: string
  videoUrl?: string
}

export interface BankQuestionItem {
  id: string
  number: number
  type: 'PG' | 'Isian' | 'Esai' | 'Interaktif'
  text: string
  difficulty: Difficulty
  isMultiSelect?: boolean
  options?: { key: string; text: string; imageUrl?: string }[]
  key: string | string[]
  rubric?: string
  rubricScore?: number
  mediaType?: 'audio' | 'video'
  mediaId?: string
  mediaUrl?: string
  mediaFileName?: string
  mediaFileSize?: string
  mediaCompressStatus?: string
  interactiveAnswerType?: 'PG' | 'PG_Multi' | 'Isian'
  imageUrl?: string
  imageOriginalSize?: string
  imageCompressedSize?: string
  imageAiSuggestion?: string
  isRtl?: boolean
  wordCountMin?: number
  wordCountMax?: number
}

export interface BankSubjectPackage {
  id: string
  code: string
  classroom: string
  subject: string
  grade: 'SMP' | 'SMK'
  difficulty: Difficulty
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
  grade: 'SMP' | 'SMK'
  pgScore: number
  essayScore: number | null
  totalScore: number
  essayStatus: 'Sudah Dikoreksi' | 'Perlu Koreksi' | 'Tanpa Esai'
  status: 'Lulus' | 'Remedial' | 'Belum Selesai'
  submittedAt: string
  essayAnswers?: { question: string; studentAnswer: string; rubric: string; score: number | null }[]
}

export interface ViolationLog {
  id: string
  studentId: string
  studentName: string
  classroom: string
  grade: 'SMP' | 'SMK'
  examId: string
  examName: string
  time: string
  reason: string
  level: 1 | 2 | 3
  status: 'Terkunci (1x)' | 'Terkunci (2x)' | 'Terkunci Permanen' | 'Selesai Dibuka'
  unlockPin: string
}

export interface TeacherRole {
  id: number
  name: string
  nip: string
  subject: string
  grade: 'SMP' | 'SMK'
  roles: string[]
  classes: string[]
}

export const useAdminCbtState = () => {
  const currentGrade = useAdminGrade()
  const activeTab = useState<string>('admin-cbt-tab', () => 'summary')

  // MASTER EXAMS DATA
  const allExams = useState<Exam[]>('admin-cbt-exams', () => [
    {
      id: 'E1',
      name: 'Penilaian Tengah Semester Informatika',
      subject: 'Informatika',
      classroom: 'X RPL 1',
      grade: 'SMK',
      date: '30 Sep 2026',
      time: '07:30 - 09:00',
      duration: 90,
      participants: 40,
      status: 'Berlangsung',
      average: 0,
      kkm: 75,
      token: 'INF930',
      collected: 26,
      doing: 9,
      violations: 2,
      supervisor: 'Bpk. Budi Santoso, S.Kom'
    },
    {
      id: 'E2',
      name: 'Ujian Praktik Jaringan Komputer',
      subject: 'Jaringan Komputer',
      classroom: 'XII TKJ 1',
      grade: 'SMK',
      date: '30 Sep 2026',
      time: '09:30 - 11:30',
      duration: 120,
      participants: 38,
      status: 'Berlangsung',
      average: 0,
      kkm: 75,
      token: 'JAR930',
      collected: 21,
      doing: 12,
      violations: 0,
      supervisor: 'Ibu Siti Aminah, S.Pd'
    },
    {
      id: 'E7',
      name: 'UAS Praktik Pemrograman Web',
      subject: 'Pemrograman Web',
      classroom: 'XI RPL 1',
      grade: 'SMK',
      date: '10 Okt 2026',
      time: '08:00 - 10:00',
      duration: 120,
      participants: 40,
      status: 'Terjadwal',
      average: 0,
      kkm: 75,
      token: 'WEB101',
      collected: 0,
      doing: 0,
      violations: 0,
      supervisor: 'Bpk. Budi Santoso, S.Kom'
    },
    {
      id: 'E8',
      name: 'Ujian Teori Kejuruan Komputer',
      subject: 'Informatika',
      classroom: 'X RPL 1',
      grade: 'SMK',
      date: '12 Okt 2026',
      time: '08:00 - 09:30',
      duration: 90,
      participants: 40,
      status: 'Terjadwal',
      average: 0,
      kkm: 75,
      token: 'TKJ102',
      collected: 0,
      doing: 0,
      violations: 0,
      supervisor: 'Ibu Siti Aminah, S.Pd'
    },
    {
      id: 'E6',
      name: 'Ujian Teori Basis Data',
      subject: 'Basis Data',
      classroom: 'XI RPL 1',
      grade: 'SMK',
      date: '25 Sep 2026',
      time: '08:00 - 09:30',
      duration: 90,
      participants: 40,
      status: 'Selesai',
      average: 79.2,
      kkm: 75,
      token: 'BDS925',
      collected: 40,
      doing: 0,
      violations: 3,
      supervisor: 'Bpk. Budi Santoso, S.Kom'
    },
    {
      id: 'E9',
      name: 'Simulasi Try Out IPA Terpadu',
      subject: 'IPA Terpadu',
      classroom: 'IX-A',
      grade: 'SMP',
      date: '30 Sep 2026',
      time: '07:30 - 09:00',
      duration: 90,
      participants: 44,
      status: 'Berlangsung',
      average: 0,
      kkm: 75,
      token: 'IPA930',
      collected: 31,
      doing: 11,
      violations: 1,
      supervisor: 'Ibu Rina Marlina, M.Pd'
    },
    {
      id: 'E3',
      name: 'Try Out Ujian Sekolah Matematika',
      subject: 'Matematika',
      classroom: 'IX-A',
      grade: 'SMP',
      date: '2 Okt 2026',
      time: '08:00 - 10:00',
      duration: 120,
      participants: 44,
      status: 'Terjadwal',
      average: 0,
      kkm: 75,
      token: 'MTK102',
      collected: 0,
      doing: 0,
      violations: 0,
      supervisor: 'Bpk. Ahmad Dahlan, S.Pd'
    },
    {
      id: 'E4',
      name: 'Penilaian Akhir Semester Matematika',
      subject: 'Matematika',
      classroom: 'VIII-B',
      grade: 'SMP',
      date: '5 Okt 2026',
      time: '08:00 - 09:30',
      duration: 90,
      participants: 44,
      status: 'Terjadwal',
      average: 0,
      kkm: 75,
      token: 'MTK105',
      collected: 0,
      doing: 0,
      violations: 0,
      supervisor: 'Ibu Rina Marlina, M.Pd'
    },
    {
      id: 'E5',
      name: 'UTS Pendidikan Agama Islam',
      subject: 'PAI',
      classroom: 'VII-A',
      grade: 'SMP',
      date: '27 Sep 2026',
      time: '07:30 - 08:30',
      duration: 60,
      participants: 44,
      status: 'Selesai',
      average: 84.5,
      kkm: 75,
      token: 'PAI927',
      collected: 44,
      doing: 0,
      violations: 1,
      supervisor: 'Ust. Hendra Gunawan, S.Pd.I'
    }
  ])

  // MASTER BANK SOAL
  const allBank = useState<Question[]>('admin-cbt-bank', () => [])

  // MASTER RESULTS
  const allResults = useState<StudentResult[]>('admin-cbt-results', () => [
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
  ])

  // MASTER VIOLATIONS
  const allCheatLogs = useState<ViolationLog[]>('admin-cbt-violations', () => [
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
  ])

  // MASTER GURU
  const allTeachers = useState<TeacherRole[]>('admin-cbt-teachers', () => [
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
  ])

  // MASTER PACKAGES PER MAPEL
  const allBankPackages = useState<BankSubjectPackage[]>('admin-cbt-packages', () => [])

  // Grade-filtered computed properties
  const grade = computed(() => currentGrade.value)

  const exams = computed(() => allExams.value.filter(e => e.grade === grade.value))
  const bank = computed(() => allBank.value.filter(q => q.grade === grade.value))
  const bankPackages = computed(() => allBankPackages.value.filter(p => p.grade === grade.value))
  const results = computed(() => allResults.value.filter(r => r.grade === grade.value))
  const cheatLogs = computed(() => allCheatLogs.value.filter(c => c.grade === grade.value))
  const teachers = computed(() => allTeachers.value.filter(t => t.grade === grade.value))

  const liveExams = computed(() => exams.value.filter(e => e.status === 'Berlangsung'))
  const scheduledExams = computed(() => exams.value.filter(e => e.status === 'Terjadwal'))
  const completedExams = computed(() => exams.value.filter(e => e.status === 'Selesai'))

  // SUPABASE REAL DATABASE SYNC
  const isDbLoading = useState<boolean>('admin-cbt-db-loading', () => false)
  const isDbConnected = useState<boolean>('admin-cbt-db-connected', () => false)

  const isValidUuid = (val: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)
  }

  // Fetch all packages & questions from Supabase
  const fetchBankPackagesFromDb = async () => {
    isDbLoading.value = true
    try {
      const supabase = useSupabaseClient()
      const { data: dbPackages, error: pkgError } = await supabase
        .from('question_banks')
        .select('*')
        .order('created_at', { ascending: false })

      if (pkgError || !dbPackages || dbPackages.length === 0) {
        // Jika tabel belum dibuat atau kosong, tetap gunakan data bawaan
        isDbLoading.value = false
        return false
      }

      const { data: dbQuestions, error: qError } = await supabase
        .from('questions')
        .select('*')
        .order('number', { ascending: true })

      if (qError) {
        isDbLoading.value = false
        return false
      }

      // Gabungkan relasi question_banks -> questions
      const mappedPackages: BankSubjectPackage[] = dbPackages.map((pkg: any) => {
        const pkgQuestions: BankQuestionItem[] = (dbQuestions || [])
          .filter((q: any) => q.bank_id === pkg.id)
          .map((q: any) => ({
            id: q.id,
            number: q.number,
            type: q.type,
            text: q.text,
            difficulty: q.difficulty,
            isMultiSelect: q.is_multi_select,
            options: q.options || undefined,
            key: q.answer_key,
            rubric: q.rubric || undefined,
            rubricScore: q.rubric_score || 20,
            imageUrl: q.image_url || undefined,
            mediaType: q.media_type || undefined,
            mediaId: q.media_id || undefined,
            mediaUrl: q.media_url || undefined,
            mediaFileName: q.media_file_name || undefined,
            interactiveAnswerType: q.interactive_answer_type || undefined,
            isRtl: q.is_rtl
          }))

        return {
          id: pkg.id,
          code: pkg.code,
          classroom: pkg.classroom,
          subject: pkg.subject,
          grade: pkg.grade,
          difficulty: pkg.difficulty,
          teacherName: pkg.teacher_name,
          updatedAt: pkg.updated_at ? new Date(pkg.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari Ini',
          hasInteractive: pkg.has_interactive,
          questions: pkgQuestions
        }
      })

      if (mappedPackages.length > 0) {
        allBankPackages.value = mappedPackages
        isDbConnected.value = true
      }
      return true
    } catch {
      return false
    } finally {
      isDbLoading.value = false
    }
  }

  // Save / Update package and its questions to Supabase
  const savePackageToDb = async (pkg: BankSubjectPackage): Promise<boolean> => {
    isDbLoading.value = true
    try {
      const cbtData = useAdminCbtData('cbt')
      await cbtData.load()
      pkg.id = await cbtData.saveBankPackage(pkg)
      await fetchBankPackagesFromDb()
      isDbConnected.value = true
      return true
    } catch (e: any) {
      console.warn('Kendala koneksi database:', e?.message)
      return false
    } finally {
      isDbLoading.value = false
    }
  }

  // Delete package from Supabase
  const deletePackageFromDb = async (pkgId: string): Promise<boolean> => {
    try {
      if (isValidUuid(pkgId)) {
        const supabase = useSupabaseClient()
        await supabase.from('question_banks').delete().eq('id', pkgId)
      }
      return true
    } catch {
      return false
    }
  }

  return {
    grade,
    activeTab,
    allExams,
    allBank,
    allBankPackages,
    allResults,
    allCheatLogs,
    allTeachers,
    exams,
    bank,
    bankPackages,
    results,
    cheatLogs,
    teachers,
    liveExams,
    scheduledExams,
    completedExams,
    isDbLoading,
    isDbConnected,
    fetchBankPackagesFromDb,
    savePackageToDb,
    deletePackageFromDb
  }
}
