import { useAdminGrade } from '~/composables/useAdminGrade'

export interface StaffItem {
  id: string
  nip: string
  name: string
  role: string
  unit: 'SMP' | 'SMK' | 'Yayasan'
  subject?: string
  phone: string
  status: string
  rfidUid: string
  // Detail Data Induk Guru (docs/Admin Portal/kepegawaian/dataindukguru.md)
  nik?: string
  noKk?: string
  nuptk?: string
  email?: string
  birthPlace?: string
  birthDate?: string
  address?: string
  kelurahan?: string
  kecamatan?: string
  kabKota?: string
  education?: string
  gender?: 'Laki laki' | 'Perempuan'
  isUserSynced?: boolean
}

export interface TeacherAttendance {
  id: string
  name: string
  nip: string
  rfidUid: string
  school: 'SMK' | 'SMP'
  subject: string
  level: string
  gender: 'Laki laki' | 'Perempuan'
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa'
  timeIn: string | null
  timeOut: string | null
  lateMinutes?: number
  gate?: string
}

interface SyncedTeacherAccount {
  userId: string
  nip: string
  name: string
  email: string
  scope: 'smp' | 'smk' | 'yayasan'
  role: string
}

const normalizeEmploymentStatus = (value: unknown): 'Aktif' | 'Tidak Aktif' => {
  const status = String(value || '').trim().toLowerCase()
  return ['tidak aktif', 'nonaktif', 'inactive'].includes(status) ? 'Tidak Aktif' : 'Aktif'
}

export const useAdminTeachers = () => {
  const grade = useAdminGrade()
  const supabase = useSupabaseClient()

  const staffList = useState<StaffItem[]>('admin-staff-list', () => [])
  const attendanceList = useState<TeacherAttendance[]>('admin-teacher-attendance', () => [])
  const isLoading = useState<boolean>('admin-staff-loading', () => false)
  const isDbConnected = useState<boolean>('admin-staff-db-connected', () => false)

  // Mapper: Database Row -> StaffItem UI
  const mapDbRowToStaff = (row: any): StaffItem => ({
    id: row.id,
    nip: row.nip || '',
    name: row.name,
    role: row.position || 'Guru',
    unit: (row.grade as 'SMP' | 'SMK' | 'Yayasan') || 'SMK',
    subject: row.subject || '',
    phone: row.phone || '',
    status: normalizeEmploymentStatus(row.employment_status),
    rfidUid: row.rfid_uid || '',
    nik: row.nik || '',
    noKk: row.no_kk || '',
    nuptk: row.nuptk || '',
    email: row.email || '',
    birthPlace: row.birth_place || '',
    birthDate: row.birth_date || '',
    address: row.address || '',
    kelurahan: row.kelurahan || '',
    kecamatan: row.kecamatan || '',
    kabKota: row.kab_kota || '',
    education: row.education || '',
    gender: row.gender === 'P' ? 'Perempuan' : row.gender === 'L' ? 'Laki laki' : undefined,
    isUserSynced: !!row.user_id
  })

  // Mapper: StaffItem UI -> Supabase Payload dengan Sanitasi Ketat
  const mapStaffToDbPayload = (s: StaffItem) => {
    // Sanitasi Grade (constraint: 'SMP' | 'SMK' | 'Yayasan')
    let gradeVal: 'SMP' | 'SMK' | 'Yayasan' = 'SMK'
    const unitUpper = String(s.unit || '').toUpperCase()
    if (unitUpper.includes('SMP')) gradeVal = 'SMP'
    else if (unitUpper.includes('YAYASAN')) gradeVal = 'Yayasan'
    else gradeVal = 'SMK'

    // Sanitasi Gender (constraint: 'L' | 'P')
    let genderVal: 'L' | 'P' | null = null
    const genderStr = String(s.gender || '').toUpperCase()
    if (genderStr === 'PRIA' || genderStr.startsWith('L')) {
      genderVal = 'L'
    } else if (genderStr === 'WANITA' || genderStr.includes('PEREMPUAN') || genderStr.startsWith('P')) {
      genderVal = 'P'
    }

    // Sanitasi NIP (wajib non-kosong, gunakan fallback unik)
    const nipVal = String(s.nip || '').trim()
    const nameVal = String(s.name || '').trim()
    if (!nameVal || (!nipVal && !String(s.nik || '').trim())) {
      throw new Error('Nama guru serta NIP atau NIK wajib diisi.')
    }

    const payload: Record<string, string | boolean | null> = {
      nip: nipVal || null,
      name: nameVal,
      grade: gradeVal,
      position: String(s.role || 'Guru').trim(),
      employment_status: normalizeEmploymentStatus(s.status),
      phone: String(s.phone || '').trim(),
      gender: genderVal,
      active: true
    }

    // Hanya sertakan UUID valid sebagai id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (s.id && uuidRegex.test(s.id)) payload.id = s.id

    // Kolom opsional — hanya dikirim jika ada nilai bermakna
    const optStr = (value: unknown) => {
      const normalized = String(value || '').trim()
      return normalized && normalized !== '-' ? normalized : null
    }

    payload.nik = optStr(s.nik)
    payload.no_kk = optStr(s.noKk)
    payload.nuptk = optStr(s.nuptk)
    payload.email = optStr(s.email)
    payload.birth_place = optStr(s.birthPlace)
    payload.birth_date = null
    payload.address = optStr(s.address)
    payload.kelurahan = optStr(s.kelurahan)
    payload.kecamatan = optStr(s.kecamatan)
    payload.kab_kota = optStr(s.kabKota)
    payload.education = optStr(s.education)
    payload.rfid_uid = optStr(s.rfidUid)
    payload.subject = optStr(s.subject)

    // Sanitasi Tanggal Lahir — format YYYY-MM-DD wajib untuk tipe DATE PostgreSQL
    if (s.birthDate && typeof s.birthDate === 'string') {
      const raw = s.birthDate.trim()
      let parsedDate: string | null = null

      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        parsedDate = raw
      } else if (/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.test(raw)) {
        const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
        if (m) parsedDate = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
      }

      if (parsedDate) payload.birth_date = parsedDate
    }

    return payload
  }

  // Fetch data guru dari tabel 'teachers' — DB adalah sumber kebenaran tunggal
  const fetchTeachersFromDb = async () => {
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) throw error

      if (data && data.length > 0) {
        staffList.value = data.map(mapDbRowToStaff)
        isDbConnected.value = true
      } else {
        // DB kosong — kosongkan juga staffList agar UI konsisten
        staffList.value = []
        isDbConnected.value = true
      }
    } catch (err: any) {
      console.warn('Gagal memuat dari Supabase teachers:', err?.message)
      isDbConnected.value = false
      // Fallback offline — coba localStorage
      if (import.meta.client) {
        const saved = localStorage.getItem('darqia-staff-offline-cache')
        if (saved) {
          try { staffList.value = JSON.parse(saved) } catch (e) {}
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // Simpan / Perbarui guru tunggal ke database Supabase
  const saveStaffToDb = async (staff: StaffItem) => {
    try {
      const payload = mapStaffToDbPayload(staff)
      const conflictColumn = payload.id ? 'id' : payload.nip ? 'nip' : 'nik'
      const { data, error } = await supabase
        .from('teachers')
        .upsert(payload, { onConflict: conflictColumn })
        .select()

      if (error) throw error

      // Update id di staffList dengan UUID dari DB
      if (data && data[0]) {
        const idx = staffList.value.findIndex(s => s.nip === staff.nip)
        if (idx !== -1) staffList.value[idx].id = data[0].id
      }
      return { success: true }
    } catch (err: any) {
      console.error('Error menyimpan guru ke Supabase:', err)
      return { success: false, error: err?.message }
    }
  }

  // Impor massal guru ke Supabase — row-by-row agar baris valid tetap masuk
  const batchImportTeachersToDb = async (items: StaffItem[]) => {
    isLoading.value = true
    let successCount = 0
    let lastError = ''
    const importedItems: StaffItem[] = []

    try {
      for (const item of items) {
        const payload = mapStaffToDbPayload(item)
        const conflictColumn = payload.nip ? 'nip' : 'nik'
        const { error } = await supabase
          .from('teachers')
          .upsert(payload, { onConflict: conflictColumn })

        if (!error) {
          successCount++
          importedItems.push(item)
        } else {
          console.warn(`Gagal upsert guru "${item.name}" (${item.nip}):`, error.message)
          lastError = error.message
        }
      }

      // Refresh staffList dari DB setelah import selesai
      await fetchTeachersFromDb()

      if (successCount === 0) {
        return { success: false, error: lastError || 'Semua baris gagal diimpor' }
      }

      return { success: true, count: successCount, failed: items.length - successCount, items: importedItems }
    } catch (err: any) {
      console.error('Error impor massal guru:', err)
      return { success: false, error: err?.message }
    } finally {
      isLoading.value = false
    }
  }

  const syncTeacherAccounts = async (items: StaffItem[]) => {
    try {
      const result = await $fetch<{ accounts: SyncedTeacherAccount[]; skipped: number }>('/api/admin/teachers/sync-accounts', {
        method: 'POST',
        body: {
          teachers: items.map(item => ({
            nip: item.nip,
            nik: item.nik,
            name: item.name,
            email: item.email,
            unit: item.unit
          }))
        }
      })
      await fetchTeachersFromDb()
      return { success: true, ...result }
    } catch (err: any) {
      return {
        success: false,
        accounts: [] as SyncedTeacherAccount[],
        skipped: 0,
        error: err?.data?.statusMessage || err?.message || 'Gagal menyinkronkan akun guru.'
      }
    }
  }

  // Hapus guru dari Supabase (hard delete)
  const deleteStaffFromDb = async (staffId: string, nip: string) => {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (staffId && uuidRegex.test(staffId)) {
        await supabase.from('teachers').delete().eq('id', staffId)
      } else {
        await supabase.from('teachers').delete().eq('nip', nip)
      }
      return { success: true }
    } catch (err: any) {
      console.error('Error menghapus guru dari Supabase:', err)
      return { success: false, error: err?.message }
    }
  }

  // Sinkronisasi data ke attendance list
  const syncAttendanceFromStaff = (staff: StaffItem) => {
    const existing = attendanceList.value.find(a => a.id === staff.id || a.nip === staff.nip)
    if (existing) {
      existing.name = staff.name
      existing.nip = staff.nip
      existing.rfidUid = staff.rfidUid
      existing.school = staff.unit === 'SMP' ? 'SMP' : 'SMK'
      if (staff.subject) existing.subject = staff.subject
      existing.level = staff.role
    } else {
      attendanceList.value.unshift({
        id: staff.id,
        name: staff.name,
        nip: staff.nip,
        rfidUid: staff.rfidUid,
        school: staff.unit === 'SMP' ? 'SMP' : 'SMK',
        subject: staff.subject || staff.role,
        level: staff.role,
        gender: staff.gender || 'Laki laki',
        status: 'Hadir',
        timeIn: '06:25',
        timeOut: '15:30',
        gate: 'Ruang Guru'
      })
    }
  }

  const updateAttendanceStatus = (id: string, newStatus: TeacherAttendance['status']) => {
    const item = attendanceList.value.find(t => t.id === id)
    if (item) {
      item.status = newStatus
      if (newStatus === 'Hadir') {
        item.timeIn = item.timeIn || '06:25'
        item.lateMinutes = 0
      } else if (newStatus === 'Terlambat') {
        item.timeIn = item.timeIn || '06:52'
        item.lateMinutes = item.lateMinutes || 7
      } else {
        item.timeIn = null
        item.timeOut = null
        item.lateMinutes = 0
      }
    }
  }

  return {
    grade,
    staffList,
    attendanceList,
    isLoading,
    isDbConnected,
    fetchTeachersFromDb,
    saveStaffToDb,
    batchImportTeachersToDb,
    syncTeacherAccounts,
    deleteStaffFromDb,
    syncAttendanceFromStaff,
    updateAttendanceStatus
  }
}
