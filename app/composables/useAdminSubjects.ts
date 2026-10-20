export interface AdminSubject {
  id: string
  code: string
  name: string
  grade: 'SMP' | 'SMK'
  category: 'Umum' | 'Kejuruan' | 'Keagamaan' | 'Muatan Lokal'
  kkm: number
  hoursPerWeek: number
  coordinator: string
  status: 'Aktif' | 'Nonaktif'
}

export const useAdminSubjects = () => {
  const client = useSupabaseClient()
  const subjects = useState<AdminSubject[]>('admin-subjects', () => [])
  const loading = useState('admin-subjects-loading', () => false)
  const error = useState<string | null>('admin-subjects-error', () => null)

  const load = async () => {
    loading.value = true
    error.value = null
    const { data, error: queryError } = await client
      .from('subjects')
      .select('id, code, name, grade, category, kkm, hours_per_week, active, teachers(name)')
      .order('name')

    if (queryError) {
      error.value = queryError.message
      subjects.value = []
    } else {
      subjects.value = (data ?? []).map((row: any) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        grade: row.grade,
        category: row.category as AdminSubject['category'],
        kkm: row.kkm,
        hoursPerWeek: row.hours_per_week,
        coordinator: row.teachers?.name ?? '',
        status: row.active ? 'Aktif' : 'Nonaktif'
      }))
    }
    loading.value = false
  }

  const create = async (subject: Omit<AdminSubject, 'id' | 'coordinator' | 'status'>) => {
    const { error: insertError } = await client.from('subjects').insert({
      code: subject.code,
      name: subject.name,
      grade: subject.grade,
      category: subject.category,
      kkm: subject.kkm,
      hours_per_week: subject.hoursPerWeek
    })
    if (insertError) throw insertError
    await load()
  }

  return { subjects, loading, error, load, create }
}
