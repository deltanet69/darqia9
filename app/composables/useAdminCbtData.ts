import { computed } from 'vue'
import type { BankPackage, BankQuestionItem, ExamItem, GradeType, LiveStudent } from '~/components/adminV2/cbt/cbtV2Data'

export type AssessmentSource = 'cbt' | 'ujian_harian'
const questionRequests = new Map<AssessmentSource, Promise<void>>()

const assessmentTables = (source: AssessmentSource) => source === 'ujian_harian'
  ? { banks: 'ujian_harian_banks', questions: 'ujian_harian_questions', exams: 'ujian_harian', assignments: 'ujian_harian_assignments', answers: 'ujian_harian_answers', violations: 'ujian_harian_violations' }
  : { banks: 'question_banks', questions: 'questions', exams: 'exams', assignments: 'exam_assignments', answers: 'exam_answers', violations: 'exam_violations' }

export interface CbtClass {
  id: string
  name: string
  grade: GradeType
  major: string
  room: string
  academicYear: string
  studentCount: number
  teacher: string
  homeroomTeacherId: string | null
  teacherNip: string
}

export interface CbtTeacher {
  id: string
  nip: string
  name: string
  grade: 'SMP' | 'SMK' | 'Yayasan'
}

export interface CbtSubject {
  id: string
  code: string
  name: string
  grade: GradeType
  kkm: number
}

export interface CbtExamInput {
  id?: string
  name: string
  classId: string
  subjectId: string
  questionBankId: string
  questionIds: string[]
  supervisorId?: string
  startsAt: string
  duration: number
  token?: string
}

const isUuid = (value?: string) =>
  !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))

const formatTime = (value: string, duration: number) => {
  const start = new Date(value)
  const end = new Date(start.getTime() + duration * 60_000)
  const formatter = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${formatter.format(start)} - ${formatter.format(end)}`
}

const examStatus = (status: string, startsAt: string, duration: number): ExamItem['status'] => {
  if (status === 'selesai') return 'Selesai'
  const now = Date.now()
  const start = new Date(startsAt).getTime()
  const end = start + duration * 60_000
  if (now >= start && now < end) return 'Berlangsung'
  if (now >= end) return 'Selesai'
  return 'Terjadwal'
}

export const useAdminCbtData = (source: AssessmentSource = 'cbt') => {
  const client = useSupabaseClient()
  const tables = assessmentTables(source)
  const stateKey = source === 'ujian_harian' ? 'ujian-harian' : 'cbt'
  const classes = useState<CbtClass[]>(`${stateKey}-master-classes`, () => [])
  const subjects = useState<CbtSubject[]>(`${stateKey}-master-subjects`, () => [])
  const classSubjects = useState<{ class_id: string; subject_id: string }[]>(`${stateKey}-class-subjects`, () => [])
  const teachers = useState<CbtTeacher[]>('admin-master-teachers', () => [])
  const bankPackages = useState<BankPackage[]>(`${stateKey}-bank-packages`, () => [])
  const exams = useState<ExamItem[]>(`${stateKey}-exams`, () => [])
  const loading = useState(`${stateKey}-data-loading`, () => false)
  const error = useState<string | null>(`${stateKey}-data-error`, () => null)
  const loaded = useState(`${stateKey}-data-loaded`, () => false)
  const questionsLoaded = useState(`${stateKey}-questions-loaded`, () => false)

  const questionsLoading = useState(`${stateKey}-questions-loading`, () => false)
  const load = async (force = false) => {
    if (loading.value || (loaded.value && !force)) return
    loading.value = true
    error.value = null

    try {
      const [classResult, subjectResult, bankResult, examResult, assignmentResult, studentResult, teacherResult, selectionResult, violationResult, scheduleResult] = await Promise.all([
        client.from('classes').select('id, name, grade, major, room, academic_year, homeroom_teacher_id, active').eq('active', true).order('name'),
        client.from('subjects').select('id, code, name, grade, kkm, active').eq('active', true).order('name'),
        client.from(tables.banks).select('id, code, classroom, subject, grade, difficulty, teacher_name, has_interactive, updated_at, class_id, subject_id').order('updated_at', { ascending: false }),
        client.from(tables.exams).select('*').order('starts_at', { ascending: false }),
        client.from(tables.assignments).select('id, exam_id, status'),
        client.from('students').select('class_id').eq('active', true),
        client.from('teachers').select('id, nip, name, grade, active').eq('active', true),
        client.from(source === 'cbt' ? 'exam_questions' : 'ujian_harian_exam_questions').select('exam_id, question_id, position').order('position'),
        client.from(tables.violations).select('assignment_id'),
        client.from('class_schedules').select('class_id, subject_id').eq('active', true)
      ])

      const firstError = [classResult, subjectResult, bankResult, examResult, assignmentResult, studentResult, teacherResult, selectionResult, violationResult, scheduleResult]
        .find(result => result.error)?.error
      if (firstError) throw firstError

      const classRows = classResult.data ?? []
      classSubjects.value = scheduleResult.data ?? []
      const subjectRows = subjectResult.data ?? []
      const teacherRows = teacherResult.data ?? []
      const teacherById = new Map(teacherRows.map((row: any) => [row.id, row]))
      const studentCounts = new Map<string, number>()
      for (const student of studentResult.data ?? []) {
        if (student.class_id) studentCounts.set(student.class_id, (studentCounts.get(student.class_id) ?? 0) + 1)
      }

      classes.value = classRows.map((row: any) => ({
        id: row.id,
        name: row.name,
        grade: row.grade,
        major: row.major ?? '',
        room: row.room ?? '',
        academicYear: row.academic_year,
        studentCount: studentCounts.get(row.id) ?? 0,
        teacher: teacherById.get(row.homeroom_teacher_id)?.name ?? '',
        homeroomTeacherId: row.homeroom_teacher_id ?? null,
        teacherNip: teacherById.get(row.homeroom_teacher_id)?.nip ?? ''
      }))
      teachers.value = teacherRows.map((row: any) => ({
        id: row.id,
        nip: row.nip,
        name: row.name,
        grade: row.grade
      }))
      subjects.value = subjectRows.map((row: any) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        grade: row.grade,
        kkm: row.kkm
      }))

      const classById = new Map(classes.value.map(item => [item.id, item]))
      const subjectById = new Map(subjects.value.map(item => [item.id, item]))
      const existingQuestionsByBank = new Map(bankPackages.value.map(item => [item.id, item.questions]))

      bankPackages.value = (bankResult.data ?? []).map((row: any) => ({
        id: row.id,
        code: row.code,
        classId: row.class_id,
        subjectId: row.subject_id,
        classroom: classById.get(row.class_id)?.name ?? row.classroom,
        subject: subjectById.get(row.subject_id)?.name ?? row.subject,
        grade: row.grade,
        difficulty: row.difficulty,
        teacherName: row.teacher_name,
        updatedAt: formatDate(row.updated_at),
        hasInteractive: row.has_interactive,
        questions: existingQuestionsByBank.get(row.id) ?? []
      }))

      const assignments = new Map<string, { total: number; doing: number; collected: number }>()
      for (const row of assignmentResult.data ?? []) {
        const count = assignments.get(row.exam_id) ?? { total: 0, doing: 0, collected: 0 }
        count.total += 1
        if (row.status === 'berlangsung' || row.status === 'terkunci') count.doing += 1
        if (row.status === 'selesai') count.collected += 1
        assignments.set(row.exam_id, count)
      }
      const bankById = new Map(bankPackages.value.map(item => [item.id, item]))
      const examByAssignment = new Map((assignmentResult.data ?? []).map((row: any) => [row.id, row.exam_id]))
      const violationCounts = new Map<string, number>()
      for (const row of violationResult.data ?? []) {
        const examId = examByAssignment.get(row.assignment_id)
        if (examId) violationCounts.set(examId, (violationCounts.get(examId) ?? 0) + 1)
      }

      exams.value = (examResult.data ?? [])
        .filter((row: any) => row.status !== 'draf' && row.status !== 'dibatalkan')
        .map((row: any) => {
          const classItem = classById.get(row.class_id)
          const subjectItem = subjectById.get(row.subject_id)
          const counts = assignments.get(row.id) ?? { total: classItem?.studentCount ?? 0, doing: 0, collected: 0 }
          return {
            id: row.id,
            name: row.name,
            classId: row.class_id,
            subjectId: row.subject_id,
            questionBankId: row.question_bank_id,
            questionIds: selectionResult.data?.some((item: any) => item.exam_id === row.id)
              ? selectionResult.data.filter((item: any) => item.exam_id === row.id).map((item: any) => item.question_id)
              : null,
            subject: subjectItem?.name ?? '',
            classroom: classItem?.name ?? '',
            grade: row.grade,
            date: formatDate(row.starts_at),
            time: formatTime(row.starts_at, row.duration_minutes),
            startsAt: row.starts_at,
            duration: row.duration_minutes,
            participants: counts.total || classItem?.studentCount || 0,
            status: examStatus(row.status, row.starts_at, row.duration_minutes),
            average: 0,
            kkm: subjectItem?.kkm ?? 75,
            token: row.code,
            collected: counts.collected,
            doing: counts.doing,
            violations: violationCounts.get(row.id) ?? 0,
            supervisor: teacherById.get(row.supervisor_id)?.name ?? '',
            supervisorId: row.supervisor_id ?? '',
            bankCode: bankById.get(row.question_bank_id)?.code ?? ''
          } as ExamItem
        })

      loaded.value = true
    } catch (loadError: any) {
      error.value = loadError?.message ?? 'Data CBT gagal dimuat.'
      classes.value = []
      subjects.value = []
      teachers.value = []
      bankPackages.value = []
      exams.value = []
    } finally {
      loading.value = false
    }
  }

  const loadMonitoring = async (exam: ExamItem): Promise<LiveStudent[]> => {
    const { data: assignments, error: assignmentError } = await client.from(tables.assignments)
      .select('id, student_id, status, started_at, submitted_at').eq('exam_id', exam.id)
    if (assignmentError) throw new Error(assignmentError.message)
    const sessions = assignments ?? []
    let rosterQuery = client.from('students').select('id, name, nisn').eq('grade', exam.grade)
    rosterQuery = sessions.length
      ? rosterQuery.in('id', sessions.map((row: any) => row.student_id))
      : rosterQuery.eq('class_id', exam.classId).eq('active', true)
    const [roster, questions] = await Promise.all([
      rosterQuery.order('name'),
      client.from(tables.questions).select('id').eq('bank_id', exam.questionBankId)
    ])
    if (roster.error || questions.error) throw new Error((roster.error || questions.error)!.message)
    const questionIds = new Set<string>(exam.questionIds ?? (questions.data ?? []).map((row: any) => row.id))
    const assignmentIds = sessions.map((row: any) => row.id)
    const [answers, violations] = assignmentIds.length ? await Promise.all([
      client.from(tables.answers).select('assignment_id, question_id, answer, saved_at').in('assignment_id', assignmentIds),
      client.from(tables.violations).select('assignment_id, occurred_at').in('assignment_id', assignmentIds)
    ]) : [{ data: [], error: null }, { data: [], error: null }]
    if (answers.error || violations.error) throw new Error((answers.error || violations.error)!.message)
    const sessionByStudent = new Map(sessions.map((row: any) => [row.student_id, row]))
    return (roster.data ?? []).map((student: any) => {
      const session: any = sessionByStudent.get(student.id)
      const saved = session ? (answers.data ?? []).filter((row: any) => row.assignment_id === session.id && questionIds.has(row.question_id)) : []
      const incidents = session ? (violations.data ?? []).filter((row: any) => row.assignment_id === session.id) : []
      const times = [session?.started_at, session?.submitted_at, ...saved.map((row: any) => row.saved_at), ...incidents.map((row: any) => row.occurred_at)]
        .filter(Boolean).sort()
      const lastTime = times.at(-1)
      const answered = saved.filter((row: any) => typeof row.answer === 'string' ? row.answer.trim().length > 0
        : Array.isArray(row.answer) ? row.answer.length > 0
        : row.answer !== null && (typeof row.answer !== 'object' || Object.keys(row.answer).length > 0))
      return {
        id: student.id, name: student.name, nisn: student.nisn,
        progress: new Set(answered.map((row: any) => row.question_id)).size,
        total: questionIds.size,
        status: session?.status === 'selesai' ? 'Selesai' : session?.status === 'terkunci' ? 'Terkunci'
          : session?.status === 'berlangsung' ? 'Mengerjakan' : 'Belum mulai',
        violations: incidents.length,
        lastActive: lastTime ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(lastTime)) : '-'
      }
    })
  }

  const loadQuestions = (force = false): Promise<void> => {
    const pending = questionRequests.get(source)
    if (pending) return pending
    if (questionsLoaded.value && !force) return Promise.resolve()
    const request = (async () => {
    questionsLoading.value = true
    try {
      const { data, error: questionError } = await client
        .from(tables.questions)
        .select('id, bank_id, number, type, difficulty, text, image_url, is_rtl, is_multi_select, options, answer_key, rubric, media_type, media_url, media_file_name, interactive_answer_type')
        .order('number')
      if (questionError) throw questionError

      const questionsByBank = new Map<string, BankQuestionItem[]>()
      for (const row of data ?? []) {
        const list = questionsByBank.get(row.bank_id) ?? []
        list.push({
          id: row.id,
          number: row.number,
          type: row.type,
          difficulty: row.difficulty,
          text: row.text,
          imageUrl: row.image_url ?? undefined,
          isRtl: row.is_rtl ?? false,
          isMultiSelect: row.is_multi_select,
          options: row.options ?? undefined,
          key: row.answer_key,
          rubric: row.rubric ?? undefined,
          mediaType: row.media_type ?? undefined,
          mediaUrl: row.media_url ?? undefined,
          mediaFileName: row.media_file_name ?? undefined,
          interactiveAnswerType: row.interactive_answer_type ?? undefined
        })
        questionsByBank.set(row.bank_id, list)
      }
      bankPackages.value = bankPackages.value.map(pkg => ({ ...pkg, questions: questionsByBank.get(pkg.id) ?? [] }))
      questionsLoaded.value = true
      error.value = null
    } catch (loadError: any) {
      error.value = loadError?.message ?? 'Isi bank soal gagal dimuat.'
      throw new Error(error.value!)
    } finally {
      questionsLoading.value = false
      questionRequests.delete(source)
    }
    })()
    questionRequests.set(source, request)
    return request
  }

  const saveBankPackage = async (pkg: BankPackage, expectedGrade: GradeType = pkg.grade) => {
    const classItem = classes.value.find(item => item.id === pkg.classId || (item.grade === pkg.grade && item.name === pkg.classroom))
    const subjectItem = subjects.value.find(item => item.id === pkg.subjectId || (item.grade === pkg.grade && item.name === pkg.subject))
    if (!classItem || !subjectItem) throw new Error('Kelas atau mata pelajaran tidak lagi tersedia.')
    if (pkg.grade !== expectedGrade || classItem.grade !== expectedGrade || subjectItem.grade !== expectedGrade) {
      throw new Error('Jenjang bank soal, kelas, dan mata pelajaran harus sesuai dengan jenjang yang dipilih.')
    }
    const existingBank = bankPackages.value.find(item => item.id === pkg.id)
    if (existingBank && existingBank.grade !== expectedGrade) throw new Error('Bank soal berasal dari jenjang lain.')
    if ((!existingBank || existingBank.classId !== classItem.id || existingBank.subjectId !== subjectItem.id)
      && !classSubjects.value.some(item => item.class_id === classItem.id && item.subject_id === subjectItem.id)) {
      throw new Error('Mata pelajaran belum terdaftar pada jadwal kelas yang dipilih.')
    }
    const keys = classItem.grade === 'SMP' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']
    for (const question of pkg.questions) {
      if (question.type !== 'PG' && !(question.type === 'Interaktif' && ['PG', 'PG_Multi'].includes(question.interactiveAnswerType || ''))) continue
      if (question.options?.length !== keys.length || question.options.some((option, index) => option.key !== keys[index] || !option.text.trim())) {
        throw new Error(`Pilihan ganda ${expectedGrade} wajib memiliki ${keys.length} opsi terisi (${keys.join('–')}).`)
      }
      const answers = Array.isArray(question.key) ? question.key : [question.key]
      if (!answers.length || answers.some(answer => !keys.includes(answer))) throw new Error('Kunci pilihan ganda tidak sesuai dengan opsi jawaban.')
    }
    if (classItem.grade !== subjectItem.grade) throw new Error('Jenjang kelas dan mata pelajaran tidak sesuai.')

    const payload: Record<string, any> = {
      code: pkg.code,
      classroom: classItem.name,
      subject: subjectItem.name,
      grade: classItem.grade,
      difficulty: pkg.difficulty,
      teacher_name: pkg.teacherName,
      has_interactive: pkg.questions.some(question => question.type === 'Interaktif'),
      class_id: classItem.id,
      subject_id: subjectItem.id,
      updated_at: new Date().toISOString()
    }
    if (isUuid(pkg.id)) payload.id = pkg.id

    const rows = pkg.questions.map((question, index) => ({
        id: isUuid(question.id) ? question.id : crypto.randomUUID(),
        number: index + 1,
        type: question.type,
        text: question.text,
        image_url: question.imageUrl ?? null,
        is_rtl: question.isRtl ?? false,
        difficulty: question.difficulty,
        is_multi_select: !!question.isMultiSelect,
        options: question.options ?? null,
        answer_key: question.key,
        rubric: question.rubric ?? null,
        media_type: question.mediaType ?? null,
        media_url: question.mediaUrl ?? null,
        media_file_name: question.mediaFileName ?? null,
        interactive_answer_type: question.interactiveAnswerType ?? null
      }))
    const { data: bankId, error: packageError } = await client.rpc('save_assessment_bank', {
      source,
      bank_data: payload,
      question_data: rows
    })
    if (packageError) throw new Error(packageError.message)

    await load(true)
    await loadQuestions(true)
    return bankId
  }

  const deleteBankPackage = async (id: string, grade?: GradeType) => {
    const bank = bankPackages.value.find(item => item.id === id)
    if (!bank || (grade && bank.grade !== grade)) throw new Error('Bank soal tidak tersedia pada jenjang yang dipilih.')
    const { error: deleteError } = await client.from(tables.banks).delete().eq('id', id).eq('grade', grade ?? bank.grade).select('id').single()
    if (deleteError) throw new Error(deleteError.message)
    await load(true)
  }

  const saveExam = async (input: CbtExamInput) => {
    const classItem = classes.value.find(item => item.id === input.classId)
    const subjectItem = subjects.value.find(item => item.id === input.subjectId)
    const bank = bankPackages.value.find(item => item.id === input.questionBankId)
    if (!classItem || !subjectItem || !bank) throw new Error('Kelas, mata pelajaran, atau bank soal tidak tersedia.')
    if (classItem.grade !== subjectItem.grade || bank.classId !== classItem.id || bank.subjectId !== subjectItem.id) {
      throw new Error('Bank soal harus sesuai dengan kelas dan mata pelajaran ujian.')
    }
    if (!input.questionIds.length || new Set(input.questionIds).size !== input.questionIds.length
      || input.questionIds.some(id => !bank.questions.some(question => question.id === id))) {
      throw new Error('Pilih minimal satu soal yang tersedia di bank ujian, tanpa duplikasi.')
    }
    if (!Number.isFinite(Number(input.duration)) || Number(input.duration) <= 0 || !Number.isFinite(new Date(input.startsAt).getTime())) {
      throw new Error('Waktu mulai dan durasi ujian harus valid.')
    }

    const token = (input.token || Math.random().toString(36).slice(2, 8)).toUpperCase()
    const payload = {
      ...(input.id ? { id: input.id } : {}),
      code: token,
      name: input.name,
      grade: classItem.grade,
      class_id: classItem.id,
      subject_id: subjectItem.id,
      question_bank_id: bank.id,
      supervisor_id: input.supervisorId || null,
      starts_at: new Date(input.startsAt).toISOString(),
      duration_minutes: input.duration,
      updated_at: new Date().toISOString()
    }

    const { error: saveError } = await client.rpc('save_assessment_exam', {
      source,
      exam_data: payload,
      question_ids: input.questionIds
    })
    if (saveError) throw new Error(saveError.message)
    await load(true)
    return token
  }

  const deleteExam = async (id: string) => {
    const { error: deleteError } = await client.from(tables.exams).delete().eq('id', id)
    if (deleteError) throw deleteError
    await load(true)
  }

  const saveClass = async (input: { id?: string; name: string; grade: GradeType; major: string; room: string; homeroomTeacherId: string }) => {
    const { data: teacher, error: teacherError } = await client
      .from('teachers')
      .select('id')
      .eq('id', input.homeroomTeacherId)
      .eq('active', true)
      .maybeSingle()
    if (teacherError) throw teacherError
    if (!teacher) throw new Error('Wali kelas harus dipilih dari Data Guru aktif.')

    const payload = {
      name: input.name.trim(),
      grade: input.grade,
      major: input.major.trim() || null,
      room: input.room.trim() || null,
      homeroom_teacher_id: teacher.id,
      academic_year: '2026/2027',
      updated_at: new Date().toISOString()
    }
    const query = input.id
      ? client.from('classes').update(payload).eq('id', input.id)
      : client.from('classes').insert(payload)
    const { error: saveError } = await query
    if (saveError) throw saveError
    await load(true)
  }

  const archiveClass = async (id: string) => {
    const classItem = classes.value.find(item => item.id === id)
    if (classItem?.studentCount) throw new Error('Rombel yang masih memiliki siswa tidak dapat diarsipkan.')

    const { error: archiveError } = await client
      .from('classes')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (archiveError) throw archiveError
    await load(true)
  }

  const gradeClasses = (grade: GradeType) => computed(() => classes.value.filter(item => item.grade === grade))
  const gradeSubjects = (grade: GradeType) => computed(() => subjects.value.filter(item => item.grade === grade))
  const gradePackages = (grade: GradeType) => computed(() => bankPackages.value.filter(item => item.grade === grade))
  const gradeExams = (grade: GradeType) => computed(() => exams.value.filter(item => item.grade === grade))

  return {
    classes,
    subjects,
    classSubjects,
    teachers,
    bankPackages,
    exams,
    loading,
    error,
    questionsLoading,
    loadQuestions,
    loadMonitoring,
    load,
    saveBankPackage,
    deleteBankPackage,
    saveExam,
    deleteExam,
    saveClass,
    archiveClass,
    gradeClasses,
    gradeSubjects,
    gradePackages,
    gradeExams
  }
}
