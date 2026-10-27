export interface SubjectUsage {
  schedules: number
  banks: number
  exams: number
}

export interface AdminSubject {
  id: string
  code: string
  name: string
  grade: 'SMP' | 'SMK'
  category: 'Umum' | 'Kejuruan' | 'Keagamaan' | 'Muatan Lokal'
  kkm: number
  hoursPerWeek: number
  status: 'Aktif' | 'Nonaktif'
  // Ringkasan turunan dari Jadwal Pelajaran (class_schedules) — bukan input master.
  teachers: string[]
  scheduledClasses: number
  usage: SubjectUsage
}

export interface SubjectInput {
  name: string
  grade: 'SMP' | 'SMK'
  category: AdminSubject['category']
  kkm: number
  hoursPerWeek: number
}

const CODE_STOP_WORDS = new Set(['DAN', 'DI', 'KE', 'DARI', 'YANG'])

// Kode mapel dibuat otomatis dari nama: multi-kata diambil huruf depan tiap kata
// bermakna, satu kata diambil 3 huruf pertama. Tabrakan diberi akhiran angka (2, 3, ...).
export const generateSubjectCode = (name: string, existingCodes: string[]): string => {
  const words = name.toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
  const significant = words.filter(word => !CODE_STOP_WORDS.has(word))
  const baseWords = significant.length ? significant : words
  let base = ''
  if (baseWords.length >= 2) base = baseWords.map(word => word[0]).join('').slice(0, 5)
  else if (baseWords.length === 1) base = baseWords[0].slice(0, 3)
  if (!base) return ''
  let candidate = base
  let suffix = 2
  while (existingCodes.includes(candidate)) {
    candidate = `${base}${suffix}`
    suffix += 1
  }
  return candidate
}

export const useAdminSubjects = () => {
  const client = useSupabaseClient()
  const subjects = useState<AdminSubject[]>('admin-subjects', () => [])
  const loading = useState('admin-subjects-loading', () => false)
  const error = useState<string | null>('admin-subjects-error', () => null)

  const load = async () => {
    loading.value = true
    error.value = null
    const [subjectsResult, schedulesResult, banksResult, dailyBanksResult, examsResult, dailyExamsResult] = await Promise.all([
      client.from('subjects').select('id, code, name, grade, category, kkm, hours_per_week, active').order('name'),
      client.from('class_schedules').select('subject_id, class_id, teachers(name)').eq('active', true),
      client.from('question_banks').select('subject_id'),
      client.from('ujian_harian_banks').select('subject_id'),
      client.from('exams').select('subject_id'),
      client.from('ujian_harian').select('subject_id')
    ])

    if (subjectsResult.error) {
      error.value = subjectsResult.error.message
      subjects.value = []
      loading.value = false
      return
    }

    const teachersBySubject = new Map<string, Set<string>>()
    const classesBySubject = new Map<string, Set<string>>()
    const countBySubject = (rows: any[] | null) => {
      const counts = new Map<string, number>()
      for (const row of rows ?? []) counts.set(row.subject_id, (counts.get(row.subject_id) ?? 0) + 1)
      return counts
    }
    for (const row of schedulesResult.data ?? []) {
      const teacherName = (row as any).teachers?.name
      if (teacherName) {
        if (!teachersBySubject.has(row.subject_id)) teachersBySubject.set(row.subject_id, new Set())
        teachersBySubject.get(row.subject_id)!.add(teacherName)
      }
      if (!classesBySubject.has(row.subject_id)) classesBySubject.set(row.subject_id, new Set())
      classesBySubject.get(row.subject_id)!.add(row.class_id)
    }
    const scheduleCounts = countBySubject(schedulesResult.data as any[] | null)
    const bankCounts = countBySubject(banksResult.data as any[] | null)
    const dailyBankCounts = countBySubject(dailyBanksResult.data as any[] | null)
    const examCounts = countBySubject(examsResult.data as any[] | null)
    const dailyExamCounts = countBySubject(dailyExamsResult.data as any[] | null)

    subjects.value = (subjectsResult.data ?? []).map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      grade: row.grade,
      category: row.category as AdminSubject['category'],
      kkm: row.kkm,
      hoursPerWeek: row.hours_per_week,
      status: row.active ? 'Aktif' : 'Nonaktif',
      teachers: [...(teachersBySubject.get(row.id) ?? [])].sort(),
      scheduledClasses: classesBySubject.get(row.id)?.size ?? 0,
      usage: {
        schedules: scheduleCounts.get(row.id) ?? 0,
        banks: (bankCounts.get(row.id) ?? 0) + (dailyBankCounts.get(row.id) ?? 0),
        exams: (examCounts.get(row.id) ?? 0) + (dailyExamCounts.get(row.id) ?? 0)
      }
    }))
    loading.value = false
  }

  const create = async (input: SubjectInput) => {
    const code = generateSubjectCode(input.name, subjects.value.map(subject => subject.code))
    if (!code) throw new Error('Nama mata pelajaran belum cukup untuk membuat kode otomatis.')
    const { error: insertError } = await client.from('subjects').insert({
      code,
      name: input.name,
      grade: input.grade,
      category: input.category,
      kkm: input.kkm,
      hours_per_week: input.hoursPerWeek
    })
    if (insertError) throw insertError
    await load()
    return code
  }

  const update = async (id: string, input: SubjectInput) => {
    // Kode sengaja tidak diubah: kode adalah identitas yang dirujuk jadwal, bank soal, dan nilai.
    const { error: updateError } = await client.from('subjects').update({
      name: input.name,
      grade: input.grade,
      category: input.category,
      kkm: input.kkm,
      hours_per_week: input.hoursPerWeek
    }).eq('id', id)
    if (updateError) throw updateError
    await load()
  }

  const setActive = async (id: string, active: boolean) => {
    const { error: updateError } = await client.from('subjects').update({ active }).eq('id', id)
    if (updateError) throw updateError
    await load()
  }

  const remove = async (id: string) => {
    const countReferences = async (table: string) => {
      const { count } = await client.from(table).select('id', { count: 'exact', head: true }).eq('subject_id', id)
      return count ?? 0
    }
    const [schedules, banks, dailyBanks, exams, dailyExams] = await Promise.all([
      countReferences('class_schedules'),
      countReferences('question_banks'),
      countReferences('ujian_harian_banks'),
      countReferences('exams'),
      countReferences('ujian_harian')
    ])
    if (schedules + banks + dailyBanks + exams + dailyExams > 0) {
      throw new Error('Mata pelajaran sudah dipakai di jadwal, bank soal, atau ujian. Nonaktifkan saja agar data lama tetap utuh.')
    }
    const { error: deleteError } = await client.from('subjects').delete().eq('id', id)
    if (deleteError) throw deleteError
    await load()
  }

  return { subjects, loading, error, load, create, update, setActive, remove }
}
