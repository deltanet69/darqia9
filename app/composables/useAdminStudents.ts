import { computed, onMounted, ref } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

export interface StudentItem {
  id: string
  nis: string
  nisn: string
  nik: string
  noKk?: string
  name: string
  gender: 'L' | 'P'
  level: 'SMP' | 'SMK'
  classId?: string
  className: string
  major?: string
  birthPlace: string
  birthDate: string
  religion: string
  address: string
  rt?: string
  rw?: string
  village?: string
  district?: string
  city?: string
  livingType?: string
  transportation?: string
  phone?: string
  fatherName: string
  fatherBirthYear?: string
  fatherEducation?: string
  fatherJob?: string
  fatherIncome?: string
  fatherNik?: string
  fatherPhone?: string
  motherName: string
  motherBirthYear?: string
  motherEducation?: string
  motherJob?: string
  motherIncome?: string
  motherNik?: string
  motherPhone?: string
  prevSchool?: string
  prevDiplomaNo?: string
  birthOrder?: number
  siblingsCount?: number
  weight?: number
  height?: number
  headCircumference?: number
  distanceKm?: number
  hobby?: string
  ambition?: string
  entryDate?: string
  rfidUid?: string
  hasRfid: boolean
  status: 'Aktif' | 'Lulus' | 'Pindah' | 'Nonaktif'
  attendancePct: number
  entryYear: string
  notes?: string
}

interface StudentClass {
  id: string
  name: string
  grade: 'SMP' | 'SMK'
  major: string
}

export interface StudentMutationResult {
  success: boolean
  message: string
  successCount?: number
  failedRows?: string[]
}

const clean = (value: unknown) => String(value ?? '').trim()
const textOrNull = (value: unknown) => clean(value) || null
const numberOrNull = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const STUDENT_CSV_HEADERS = ['NIS', 'NISN', 'NIK', 'NoKK', 'Nama', 'Gender', 'Jenjang', 'Kelas', 'Jurusan', 'TempatLahir', 'TanggalLahir', 'Agama', 'Alamat', 'RT', 'RW', 'Kelurahan', 'Kecamatan', 'Kota', 'JenisTinggal', 'Transportasi', 'NoHPSiswa', 'NamaAyah', 'NIKAyah', 'TahunLahirAyah', 'PendidikanAyah', 'PekerjaanAyah', 'PenghasilanAyah', 'NoHPAyah', 'NamaIbu', 'NIKIbu', 'TahunLahirIbu', 'PendidikanIbu', 'PekerjaanIbu', 'PenghasilanIbu', 'NoHPIbu', 'SekolahAsal', 'NoIjazah', 'AnakKe', 'JmlSaudara', 'TinggiBadan', 'BeratBadan', 'LingkarKepala', 'JarakKM', 'Hobi', 'CitaCita', 'Status', 'RFID_UID', 'Presensi', 'TahunAngkatan', 'TanggalMasuk', 'Catatan']

export const useAdminStudents = () => {
  const grade = useAdminGrade()
  const supabase = useSupabaseClient()
  const students = useState<StudentItem[]>('admin-students', () => [])
  const classes = useState<StudentClass[]>('admin-student-classes', () => [])
  const loading = useState('admin-students-loading', () => false)
  const error = useState<string | null>('admin-students-error', () => null)
  const operationMessage = useState<string | null>('admin-students-operation-message', () => null)

  const searchQuery = ref('')
  const selectedClass = ref('all')
  const selectedMajor = ref('all')
  const selectedGender = ref('all')
  const selectedStatus = ref('all')
  const selectedRfid = ref('all')
  const detailModalStudent = ref<StudentItem | null>(null)
  const isFormModalOpen = ref(false)
  const formModalMode = ref<'add' | 'edit'>('add')
  const formStudent = ref<Partial<StudentItem>>({})
  const deleteConfirmStudent = ref<StudentItem | null>(null)
  const isImportModalOpen = ref(false)

  const classById = computed(() => new Map(classes.value.map(item => [item.id, item])))
  const mapRow = (row: any): StudentItem => {
    const cls = classById.value.get(row.class_id)
    return {
      id: row.id, nis: row.nis ?? '', nisn: row.nisn ?? '', nik: row.nik ?? '',
      noKk: row.family_card_number ?? '', name: row.name ?? '', gender: row.gender,
      level: row.grade, classId: row.class_id ?? undefined, className: cls?.name ?? '',
      major: cls?.major ?? '', birthPlace: row.birth_place ?? '', birthDate: row.birth_date ?? '',
      religion: row.religion ?? '', address: row.address ?? '', rt: row.rt ?? '', rw: row.rw ?? '',
      village: row.village ?? '', district: row.district ?? '', city: row.city ?? '',
      livingType: row.living_type ?? '', transportation: row.transportation ?? '', phone: row.phone ?? '',
      fatherName: row.father_name ?? '', fatherBirthYear: row.father_birth_year ? String(row.father_birth_year) : '',
      fatherEducation: row.father_education ?? '', fatherJob: row.father_job ?? '',
      fatherIncome: row.father_income ?? '', fatherNik: row.father_nik ?? '', fatherPhone: row.father_phone ?? '',
      motherName: row.mother_name ?? '', motherBirthYear: row.mother_birth_year ? String(row.mother_birth_year) : '',
      motherEducation: row.mother_education ?? '', motherJob: row.mother_job ?? '',
      motherIncome: row.mother_income ?? '', motherNik: row.mother_nik ?? '', motherPhone: row.mother_phone ?? '',
      prevSchool: row.previous_school ?? '', prevDiplomaNo: row.previous_diploma_number ?? '',
      birthOrder: row.birth_order ?? undefined, siblingsCount: row.siblings_count ?? undefined,
      weight: row.weight_kg ?? undefined, height: row.height_cm ?? undefined,
      headCircumference: row.head_circumference_cm ?? undefined, distanceKm: row.distance_km ?? undefined,
      hobby: row.hobby ?? '', ambition: row.ambition ?? '', entryDate: row.entry_date ?? '',
      rfidUid: row.rfid_cards?.find((card: any) => card.active)?.uid ?? '',
      hasRfid: Boolean(row.rfid_cards?.some((card: any) => card.active)),
      status: row.student_status ?? (row.active ? 'Aktif' : 'Nonaktif'),
      attendancePct: Number(row.attendance_pct ?? 0), entryYear: row.entry_year ? String(row.entry_year) : '',
      notes: row.notes ?? ''
    }
  }

  const findClass = (name: unknown, level: 'SMP' | 'SMK') => {
    const target = clean(name).toLocaleLowerCase('id-ID')
    return classes.value.find(item => item.grade === level && item.name.trim().toLocaleLowerCase('id-ID') === target)
  }

  const toPayload = (data: Partial<StudentItem>, cls: StudentClass) => ({
    nis: textOrNull(data.nis), nisn: clean(data.nisn), nik: textOrNull(data.nik),
    family_card_number: textOrNull(data.noKk), name: clean(data.name), gender: data.gender ?? 'L',
    grade: data.level ?? grade.value, class_id: cls.id, birth_place: textOrNull(data.birthPlace),
    birth_date: textOrNull(data.birthDate), religion: textOrNull(data.religion),
    address: textOrNull(data.address), rt: textOrNull(data.rt), rw: textOrNull(data.rw),
    village: textOrNull(data.village), district: textOrNull(data.district), city: textOrNull(data.city),
    living_type: textOrNull(data.livingType), transportation: textOrNull(data.transportation),
    phone: textOrNull(data.phone), father_name: textOrNull(data.fatherName),
    father_birth_year: numberOrNull(data.fatherBirthYear), father_education: textOrNull(data.fatherEducation),
    father_job: textOrNull(data.fatherJob), father_income: textOrNull(data.fatherIncome),
    father_nik: textOrNull(data.fatherNik), father_phone: textOrNull(data.fatherPhone),
    mother_name: textOrNull(data.motherName), mother_birth_year: numberOrNull(data.motherBirthYear),
    mother_education: textOrNull(data.motherEducation), mother_job: textOrNull(data.motherJob),
    mother_income: textOrNull(data.motherIncome), mother_nik: textOrNull(data.motherNik),
    mother_phone: textOrNull(data.motherPhone), previous_school: textOrNull(data.prevSchool),
    previous_diploma_number: textOrNull(data.prevDiplomaNo), birth_order: numberOrNull(data.birthOrder),
    siblings_count: numberOrNull(data.siblingsCount), weight_kg: numberOrNull(data.weight),
    height_cm: numberOrNull(data.height), head_circumference_cm: numberOrNull(data.headCircumference),
    distance_km: numberOrNull(data.distanceKm), hobby: textOrNull(data.hobby),
    ambition: textOrNull(data.ambition), entry_date: textOrNull(data.entryDate),
    attendance_pct: numberOrNull(data.attendancePct) ?? 0,
    student_status: data.status ?? 'Aktif', entry_year: numberOrNull(data.entryYear),
    notes: textOrNull(data.notes), active: (data.status ?? 'Aktif') === 'Aktif'
  })

  const load = async () => {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const [classResult, studentResult] = await Promise.all([
        supabase.from('classes').select('id, name, grade, major, academic_year').eq('active', true)
          .order('academic_year', { ascending: false }).order('name'),
        supabase.from('students').select('*, rfid_cards(uid, active)').order('name')
      ])
      if (classResult.error) throw classResult.error
      if (studentResult.error) throw studentResult.error
      classes.value = (classResult.data ?? []).map((row: any) => ({
        id: row.id, name: row.name, grade: row.grade, major: row.major ?? ''
      }))
      students.value = (studentResult.data ?? []).map(mapRow)
    } catch (cause: any) {
      students.value = []
      classes.value = []
      error.value = 'Data siswa gagal dimuat dari Supabase: ' + (cause?.message ?? 'kesalahan tidak diketahui')
    } finally {
      loading.value = false
    }
  }

  const currentGradeStudents = computed(() => students.value.filter(item => item.level === grade.value))
  const classOptions = computed(() => Array.from(new Set(classes.value.filter(item => item.grade === grade.value).map(item => item.name))))
  const majorOptions = computed(() => grade.value === 'SMP' ? [] : Array.from(new Set(classes.value.filter(item => item.grade === 'SMK' && item.major).map(item => item.major))))
  const filteredStudents = computed(() => currentGradeStudents.value.filter((item) => {
    const query = searchQuery.value.trim().toLocaleLowerCase('id-ID')
    if (query && ![item.name, item.nis, item.nisn, item.nik, item.className, item.village, item.fatherName, item.motherName]
      .some(value => clean(value).toLocaleLowerCase('id-ID').includes(query))) return false
    if (selectedClass.value !== 'all' && item.className !== selectedClass.value) return false
    if (grade.value === 'SMK' && selectedMajor.value !== 'all' && item.major !== selectedMajor.value) return false
    if (selectedGender.value !== 'all' && item.gender !== selectedGender.value) return false
    if (selectedStatus.value !== 'all' && item.status !== selectedStatus.value) return false
    if (selectedRfid.value === 'yes' && !item.hasRfid) return false
    if (selectedRfid.value === 'no' && item.hasRfid) return false
    return true
  }))
  const stats = computed(() => {
    const list = currentGradeStudents.value
    const active = list.filter(item => item.status === 'Aktif')
    const rfidCount = active.filter(item => item.hasRfid).length
    return {
      total: list.length, boys: list.filter(item => item.gender === 'L').length,
      girls: list.filter(item => item.gender === 'P').length, rfidCount,
      rfidPct: active.length ? Math.round(rfidCount / active.length * 100) : 0,
      activeCount: active.length, totalClasses: classOptions.value.length
    }
  })

  const viewDetail = (item: StudentItem) => { detailModalStudent.value = item }
  const closeDetail = () => { detailModalStudent.value = null }
  const openAddModal = () => {
    formModalMode.value = 'add'
    formStudent.value = {
      level: grade.value, gender: 'L', religion: 'Islam', status: 'Aktif',
      attendancePct: 100, hasRfid: false, entryYear: String(new Date().getFullYear())
    }
    isFormModalOpen.value = true
  }
  const openEditModal = (item: StudentItem) => {
    formModalMode.value = 'edit'
    formStudent.value = structuredClone(item)
    isFormModalOpen.value = true
  }
  const closeFormModal = () => { isFormModalOpen.value = false; formStudent.value = {} }
  const validate = (data: Partial<StudentItem>) => {
    const level = data.level ?? grade.value
    if (!clean(data.name) || !clean(data.nis)) return { message: 'Nama lengkap dan NIS wajib diisi.' }
    if (!/^\d{10}$/.test(clean(data.nisn))) return { message: 'NISN wajib terdiri dari tepat 10 digit.' }
    const cls = findClass(data.className, level)
    if (!cls) return { message: 'Kelas "' + (data.className || '-') + '" tidak ditemukan pada jenjang ' + level + '.' }
    return { cls }
  }

  const syncRfid = async (studentId: string, uid: unknown) => {
    const normalizedUid = clean(uid)
    if (!normalizedUid) {
      return supabase.from('rfid_cards').update({ active: false }).eq('student_id', studentId)
    }
    return supabase.from('rfid_cards').upsert({
      uid: normalizedUid,
      student_id: studentId,
      teacher_id: null,
      active: true
    }, { onConflict: 'uid' })
  }

  const saveStudent = async (data: Partial<StudentItem>): Promise<StudentMutationResult> => {
    error.value = null
    const checked = validate(data)
    if (!checked.cls) {
      error.value = checked.message ?? 'Data siswa tidak valid.'
      return { success: false, message: error.value }
    }
    const payload = toPayload(data, checked.cls)
    const result = formModalMode.value === 'add'
      ? await supabase.from('students').insert(payload).select('id').single()
      : await supabase.from('students').update(payload).eq('id', data.id).select('id').single()
    if (result.error) {
      error.value = 'Data siswa gagal disimpan: ' + result.error.message
      return { success: false, message: error.value }
    }
    const rfidResult = await syncRfid(result.data.id, data.rfidUid)
    if (rfidResult.error) {
      error.value = 'Data siswa tersimpan, tetapi RFID gagal disinkronkan: ' + rfidResult.error.message
      return { success: false, message: error.value }
    }
    await load()
    closeFormModal()
    operationMessage.value = 'Data ' + data.name + ' berhasil disimpan dan tersambung ke kelas ' + checked.cls.name + '.'
    return { success: true, message: operationMessage.value }
  }

  const confirmDelete = (item: StudentItem) => { deleteConfirmStudent.value = item }
  const cancelDelete = () => { deleteConfirmStudent.value = null }
  const executeDelete = async (): Promise<StudentMutationResult> => {
    const item = deleteConfirmStudent.value
    if (!item) return { success: false, message: 'Siswa tidak ditemukan.' }
    const result = await supabase.from('students').update({ active: false, student_status: 'Nonaktif' }).eq('id', item.id)
    if (result.error) {
      error.value = 'Siswa gagal dinonaktifkan: ' + result.error.message
      return { success: false, message: error.value }
    }
    deleteConfirmStudent.value = null
    await load()
    operationMessage.value = item.name + ' berhasil dinonaktifkan.'
    return { success: true, message: operationMessage.value }
  }

  const importStudents = async (items: StudentItem[], mode: 'append' | 'replace' = 'append'): Promise<StudentMutationResult> => {
    error.value = null
    const failedRows: string[] = []
    const payloads: Record<string, any>[] = []
    const seen = new Set<string>()
    const existing = new Set(students.value.filter(item => item.level === grade.value).map(item => item.nisn))
    const missingClasses = Array.from(new Set(
      items
        .map(item => clean(item.className))
        .filter(name => name && !findClass(name, grade.value))
    ))
    if (missingClasses.length) {
      const message = 'Impor dibatalkan: ' + missingClasses.length + ' kelas belum terdaftar di Manajemen Kelas.'
      return { success: false, message, successCount: 0, failedRows: missingClasses }
    }
    for (const [index, item] of items.entries()) {
      const label = 'Baris ' + (index + 2) + (item.name ? ' (' + item.name + ')' : '')
      if (!/^\d{10}$/.test(clean(item.nisn))) {
        failedRows.push(label + ': NISN wajib tepat 10 digit.')
        continue
      }
      if (seen.has(item.nisn) || (mode === 'append' && existing.has(item.nisn))) {
        failedRows.push(label + ': NISN ' + item.nisn + ' duplikat pada jenjang ' + grade.value + '.')
        continue
      }
      const checked = validate({ ...item, level: grade.value })
      if (!checked.cls) {
        failedRows.push(label + ': ' + checked.message)
        continue
      }
      seen.add(item.nisn)
      payloads.push(toPayload({ ...item, level: grade.value }, checked.cls))
    }
    if (!payloads.length) {
      const message = failedRows.join(' ') || 'Tidak ada baris valid untuk diimpor.'
      return { success: false, message, successCount: 0, failedRows }
    }
    const rfidByNisn = new Map(items.map(item => [item.nisn, item.rfidUid]))
    const result = mode === 'replace'
      ? await supabase.from('students').upsert(payloads, { onConflict: 'nisn' }).select('id, nisn')
      : await supabase.from('students').insert(payloads).select('id, nisn')
    if (result.error) {
      error.value = 'Impor gagal disimpan ke Supabase: ' + result.error.message
      return { success: false, message: error.value, successCount: 0, failedRows }
    }
    for (const row of result.data ?? []) {
      const rfidResult = await syncRfid(row.id, rfidByNisn.get(row.nisn))
      if (rfidResult.error) failedRows.push('RFID NISN ' + row.nisn + ' gagal: ' + rfidResult.error.message)
    }
    if (mode === 'replace') {
      const retained = payloads.map(item => item.nisn)
      const staleIds = students.value.filter(item => item.level === grade.value && !retained.includes(item.nisn)).map(item => item.id)
      if (staleIds.length) {
        const staleResult = await supabase.from('students').update({ active: false, student_status: 'Nonaktif' }).in('id', staleIds)
        if (staleResult.error) failedRows.push('Data lama gagal dinonaktifkan: ' + staleResult.error.message)
      }
    }
    await load()
    closeImportModal()
    operationMessage.value = payloads.length + ' siswa berhasil diimpor.' + (failedRows.length ? ' ' + failedRows.length + ' baris ditolak: ' + failedRows.join(' ') : '')
    return { success: true, message: operationMessage.value, successCount: payloads.length, failedRows }
  }

  const updateStudentClass = async (studentId: string, targetClassName: string): Promise<StudentMutationResult> => {
    const student = students.value.find(item => item.id === studentId)
    if (!student) return { success: false, message: 'Siswa tidak ditemukan.' }
    const cls = findClass(targetClassName, student.level)
    if (!cls) return { success: false, message: 'Kelas tujuan tidak ditemukan.' }
    const result = await supabase.from('students').update({ class_id: cls.id }).eq('id', studentId)
    if (result.error) return { success: false, message: 'Siswa gagal dipindahkan: ' + result.error.message }
    await load()
    return { success: true, message: student.name + ' berhasil dipindahkan ke ' + cls.name + '.' }
  }
  const deactivateStudent = async (studentId: string) => {
    const student = students.value.find(item => item.id === studentId)
    if (!student) return { success: false, message: 'Siswa tidak ditemukan.' }
    deleteConfirmStudent.value = student
    return executeDelete()
  }

  const resetFilters = () => {
    searchQuery.value = ''; selectedClass.value = 'all'; selectedMajor.value = 'all'
    selectedGender.value = 'all'; selectedStatus.value = 'all'; selectedRfid.value = 'all'
  }
  const openImportModal = () => { isImportModalOpen.value = true }
  const closeImportModal = () => { isImportModalOpen.value = false }
  const saveCsv = (content: string, filename: string) => {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url)
  }
  const quote = (value: unknown) => '"' + String(value ?? '').replace(/\r\n|\n|\r/g, ' ').replaceAll('"', '""') + '"'
  const downloadTemplate = (targetGrade?: 'SMP' | 'SMK') => {
    const level = targetGrade ?? grade.value
    const cls = classes.value.find(item => item.grade === level)
    const sample = ['0000001', '0000000001', '', '', 'SISWA CONTOH', 'L', level, cls?.name ?? 'NAMA KELAS SESUAI SISTEM', cls?.major ?? '', 'BEKASI', '2012-01-01', 'Islam', 'Alamat contoh', '', '', '', '', 'Kab. Bekasi', 'Bersama orang tua', '', '', 'AYAH CONTOH', '', '', '', '', '', '', 'IBU CONTOH', '', '', '', '', '', '', 'SEKOLAH CONTOH', '', '', '', '', '', '', '', '', '', 'Aktif', '', '100', String(new Date().getFullYear()), '', '']
    saveCsv(STUDENT_CSV_HEADERS.join(',') + '\n' + sample.map(quote).join(','), 'template-import-siswa-' + level.toLowerCase() + '.csv')
  }
  const exportStudentsCsv = (targetGrade?: 'SMP' | 'SMK') => {
    const level = targetGrade ?? grade.value
    const rows = students.value.filter(item => item.level === level).map(item => [
      item.nis, item.nisn, item.nik, item.noKk, item.name, item.gender, item.level, item.className, item.major,
      item.birthPlace, item.birthDate, item.religion, item.address, item.rt, item.rw, item.village, item.district,
      item.city, item.livingType, item.transportation, item.phone, item.fatherName, item.fatherNik,
      item.fatherBirthYear, item.fatherEducation, item.fatherJob, item.fatherIncome, item.fatherPhone,
      item.motherName, item.motherNik, item.motherBirthYear, item.motherEducation, item.motherJob,
      item.motherIncome, item.motherPhone, item.prevSchool, item.prevDiplomaNo, item.birthOrder,
      item.siblingsCount, item.height, item.weight, item.headCircumference, item.distanceKm, item.hobby,
      item.ambition, item.status, item.rfidUid, item.attendancePct, item.entryYear, item.entryDate, item.notes
    ].map(quote).join(','))
    saveCsv([STUDENT_CSV_HEADERS.join(','), ...rows].join('\n'), 'data-induk-siswa-' + level.toLowerCase() + '-' + new Date().toISOString().slice(0, 10) + '.csv')
  }

  onMounted(load)
  return {
    grade, students, currentGradeStudents, filteredStudents, classOptions, majorOptions, searchQuery,
    selectedClass, selectedMajor, selectedGender, selectedStatus, selectedRfid, detailModalStudent,
    isFormModalOpen, isImportModalOpen, formModalMode, formStudent, deleteConfirmStudent, stats,
    loading, error, operationMessage, load, viewDetail, closeDetail, openAddModal, openEditModal,
    closeFormModal, openImportModal, closeImportModal, importStudents, downloadTemplate,
    exportStudentsCsv, saveStudent, confirmDelete, cancelDelete, executeDelete, updateStudentClass,
    deactivateStudent, resetFilters
  }
}
