import type { KategoriMapel } from './mapelKategori'

export interface SubjectUsage {
  schedules: number
  banks: number
  exams: number
}

export interface SubjectAssignment {
  teacher: string
  classes: string[]
}

export interface AdminSubject {
  id: string
  code: string
  name: string
  grade: 'SMP' | 'SMK'
  // Teks bebas agar data lama (Umum/Kejuruan/...) tetap tampil sampai dirapikan; input baru wajib KategoriMapel.
  category: string
  // Kategori tambahan untuk mapel yang masuk dua kategori (mis. Unggul Bahasa).
  extraCategory: string | null
  kkm: number
  hoursPerWeek: number
  status: 'Aktif' | 'Nonaktif'
  // Ringkasan turunan dari Jadwal Pelajaran (class_schedules) — bukan input master.
  teachers: string[]
  // Rincian per guru: kelas apa saja yang diajar untuk mapel ini.
  assignments: SubjectAssignment[]
  scheduledClasses: number
  usage: SubjectUsage
}

export interface SubjectInput {
  name: string
  grade: 'SMP' | 'SMK'
  category: KategoriMapel
  extraCategory?: KategoriMapel | null
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

  // Master mapel di-cache di state bersama; force = true setelah tambah/ubah/hapus.
  const load = async (force = false) => {
    if (!force && subjects.value.length) return
    loading.value = true
    error.value = null
    const [subjectsResult, schedulesResult, banksResult, dailyBanksResult, examsResult, dailyExamsResult] = await Promise.all([
      client.from('subjects').select('id, code, name, grade, category, category_tambahan, kkm, hours_per_week, active').order('name'),
      client.from('class_schedules').select('subject_id, class_id, classes(name), teachers(name)').eq('active', true),
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
    const classesByTeacher = new Map<string, Map<string, Set<string>>>()
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
      // Kunci '' = jadwal yang belum punya guru; tetap dicatat agar kelasnya terlihat di rincian.
      if (!classesByTeacher.has(row.subject_id)) classesByTeacher.set(row.subject_id, new Map())
      const perGuru = classesByTeacher.get(row.subject_id)!
      const kunciGuru = teacherName ?? ''
      if (!perGuru.has(kunciGuru)) perGuru.set(kunciGuru, new Set())
      const className = (row as any).classes?.name
      if (className) perGuru.get(kunciGuru)!.add(className)
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
      category: row.category as string,
      extraCategory: (row.category_tambahan as string | null) ?? null,
      kkm: row.kkm,
      hoursPerWeek: row.hours_per_week,
      status: row.active ? 'Aktif' : 'Nonaktif',
      teachers: [...(teachersBySubject.get(row.id) ?? [])].sort(),
      assignments: [...(classesByTeacher.get(row.id) ?? new Map<string, Set<string>>()).entries()]
        .map(([teacher, classes]) => ({ teacher, classes: [...classes].sort((a, b) => a.localeCompare(b, 'id', { numeric: true })) }))
        .sort((a, b) => (a.teacher === '' ? 1 : b.teacher === '' ? -1 : a.teacher.localeCompare(b.teacher, 'id'))),
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
      category_tambahan: input.extraCategory ?? null,
      kkm: input.kkm,
      hours_per_week: input.hoursPerWeek
    })
    if (insertError) throw insertError
    await load(true)
    return code
  }

  const importMany = async (items: SubjectInput[]) => {
    if (!items.length) return [] as string[]
    const takenCodes = subjects.value.map(subject => subject.code)
    const insertRows = items.map(item => {
      const code = generateSubjectCode(item.name, takenCodes)
      takenCodes.push(code)
      return {
        code,
        name: item.name,
        grade: item.grade,
        category: item.category,
        category_tambahan: item.extraCategory ?? null,
        kkm: item.kkm,
        hours_per_week: item.hoursPerWeek
      }
    })
    const { error: insertError } = await client.from('subjects').insert(insertRows)
    if (insertError) throw insertError
    await load(true)
    return insertRows.map(row => row.code)
  }

  const update = async (id: string, input: SubjectInput) => {
    // Kode sengaja tidak diubah: kode adalah identitas yang dirujuk jadwal, bank soal, dan nilai.
    const { error: updateError } = await client.from('subjects').update({
      name: input.name,
      grade: input.grade,
      category: input.category,
      category_tambahan: input.extraCategory ?? null,
      kkm: input.kkm,
      hours_per_week: input.hoursPerWeek
    }).eq('id', id)
    if (updateError) throw updateError
    await load(true)
  }

  const setActive = async (id: string, active: boolean) => {
    const { error: updateError } = await client.from('subjects').update({ active }).eq('id', id)
    if (updateError) throw updateError
    await load(true)
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
    await load(true)
  }

  return { subjects, loading, error, load, create, importMany, update, setActive, remove }
}
