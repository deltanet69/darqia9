import { computed } from 'vue'
import type { BankPackage, BankQuestionItem, ExamItem, GradeType } from '~/components/adminV2/cbt/cbtV2Data'

export interface CbtClass {
  id: string
  name: string
  grade: GradeType
  major: string
  room: string
  academicYear: string
  studentCount: number
  teacher: string
  teacherNip: string
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

export const useAdminCbtData = () => {
  const client = useSupabaseClient()
  const classes = useState<CbtClass[]>('cbt-master-classes', () => [])
  const subjects = useState<CbtSubject[]>('cbt-master-subjects', () => [])
  const bankPackages = useState<BankPackage[]>('cbt-bank-packages', () => [])
  const exams = useState<ExamItem[]>('cbt-exams', () => [])
  const loading = useState('cbt-data-loading', () => false)
  const error = useState<string | null>('cbt-data-error', () => null)
  const loaded = useState('cbt-data-loaded', () => false)

  const load = async (force = false) => {
    if (loading.value || (loaded.value && !force)) return
    loading.value = true
    error.value = null

    try {
      const [classResult, subjectResult, bankResult, questionResult, examResult, assignmentResult, studentResult, teacherResult] = await Promise.all([
        client.from('classes').select('id, name, grade, major, room, academic_year, homeroom_teacher_id, active').eq('active', true).order('name'),
        client.from('subjects').select('id, code, name, grade, kkm, active').eq('active', true).order('name'),
        client.from('question_banks').select('id, code, classroom, subject, grade, difficulty, teacher_name, has_interactive, updated_at, class_id, subject_id').order('updated_at', { ascending: false }),
        client.from('questions').select('*').order('number'),
        client.from('exams').select('*').order('starts_at', { ascending: false }),
        client.from('exam_assignments').select('exam_id, status'),
        client.from('students').select('class_id').eq('active', true),
        client.from('teachers').select('id, nip, name, grade, active').eq('active', true)
      ])

      const firstError = [classResult, subjectResult, bankResult, questionResult, examResult, assignmentResult, studentResult, teacherResult]
        .find(result => result.error)?.error
      if (firstError) throw firstError

      const classRows = classResult.data ?? []
      const subjectRows = subjectResult.data ?? []
      const teacherById = new Map((teacherResult.data ?? []).map((row: any) => [row.id, row]))
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
        teacherNip: teacherById.get(row.homeroom_teacher_id)?.nip ?? ''
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
      const questionsByBank = new Map<string, BankQuestionItem[]>()
      for (const row of questionResult.data ?? []) {
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
        questions: questionsByBank.get(row.id) ?? []
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
            subject: subjectItem?.name ?? '',
            classroom: classItem?.name ?? '',
            grade: row.grade,
            date: formatDate(row.starts_at),
            time: formatTime(row.starts_at, row.duration_minutes),
            startsAt: row.starts_at,
            duration: row.duration_minutes,
            participants: counts.total,
            status: examStatus(row.status, row.starts_at, row.duration_minutes),
            average: 0,
            kkm: subjectItem?.kkm ?? 75,
            token: row.code,
            collected: counts.collected,
            doing: counts.doing,
            violations: 0,
            supervisor: teacherById.get(row.supervisor_id)?.name ?? '',
            bankCode: bankById.get(row.question_bank_id)?.code ?? ''
          } as ExamItem
        })

      loaded.value = true
    } catch (loadError: any) {
      error.value = loadError?.message ?? 'Data CBT gagal dimuat.'
      classes.value = []
      subjects.value = []
      bankPackages.value = []
      exams.value = []
    } finally {
      loading.value = false
    }
  }

  const saveBankPackage = async (pkg: BankPackage) => {
    const classItem = classes.value.find(item => item.id === pkg.classId || (item.grade === pkg.grade && item.name === pkg.classroom))
    const subjectItem = subjects.value.find(item => item.id === pkg.subjectId || (item.grade === pkg.grade && item.name === pkg.subject))
    if (!classItem || !subjectItem) throw new Error('Kelas atau mata pelajaran tidak lagi tersedia.')
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

    const { data, error: packageError } = await client
      .from('question_banks')
      .upsert(payload, { onConflict: 'code' })
      .select('id')
      .single()
    if (packageError) throw packageError

    const bankId = data.id
    const { error: deleteError } = await client.from('questions').delete().eq('bank_id', bankId)
    if (deleteError) throw deleteError

    if (pkg.questions.length) {
      const rows = pkg.questions.map((question, index) => ({
        bank_id: bankId,
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
      const { error: questionError } = await client.from('questions').insert(rows)
      if (questionError) throw questionError
    }

    await load(true)
    return bankId
  }

  const deleteBankPackage = async (id: string) => {
    const { error: deleteError } = await client.from('question_banks').delete().eq('id', id)
    if (deleteError) throw deleteError
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

    const token = (input.token || Math.random().toString(36).slice(2, 8)).toUpperCase()
    const payload = {
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

    const query = input.id
      ? client.from('exams').update(payload).eq('id', input.id)
      : client.from('exams').insert({ ...payload, status: 'terjadwal' })
    const { error: saveError } = await query
    if (saveError) throw saveError
    await load(true)
    return token
  }

  const deleteExam = async (id: string) => {
    const { error: deleteError } = await client.from('exams').delete().eq('id', id)
    if (deleteError) throw deleteError
    await load(true)
  }

  const createClass = async (input: { name: string; grade: GradeType; major: string; room: string; teacher: string }) => {
    const { data: teacherRows, error: teacherError } = await client
      .from('teachers')
      .select('id, name, grade')
      .eq('active', true)
      .eq('grade', input.grade)
    if (teacherError) throw teacherError
    const teacher = (teacherRows ?? []).find(row => row.name.trim().toLowerCase() === input.teacher.trim().toLowerCase())
    if (input.teacher.trim() && !teacher) throw new Error('Wali kelas harus dipilih dari Data Guru.')

    const { error: createError } = await client.from('classes').insert({
      name: input.name.trim(),
      grade: input.grade,
      major: input.major.trim() || null,
      room: input.room.trim() || null,
      homeroom_teacher_id: teacher?.id ?? null,
      academic_year: '2026/2027'
    })
    if (createError) throw createError
    await load(true)
  }

  const gradeClasses = (grade: GradeType) => computed(() => classes.value.filter(item => item.grade === grade))
  const gradeSubjects = (grade: GradeType) => computed(() => subjects.value.filter(item => item.grade === grade))
  const gradePackages = (grade: GradeType) => computed(() => bankPackages.value.filter(item => item.grade === grade))
  const gradeExams = (grade: GradeType) => computed(() => exams.value.filter(item => item.grade === grade))

  return {
    classes,
    subjects,
    bankPackages,
    exams,
    loading,
    error,
    load,
    saveBankPackage,
    deleteBankPackage,
    saveExam,
    deleteExam,
    createClass,
    gradeClasses,
    gradeSubjects,
    gradePackages,
    gradeExams
  }
}
