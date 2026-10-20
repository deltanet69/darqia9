import { ref, computed } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

export interface StaffItem {
  id: string
  nip: string
  name: string
  role: string
  unit: 'SMP' | 'SMK' | 'Yayasan'
  subject?: string
  phone: string
  status: 'GTY' | 'GTT' | 'Staf Tetap'
  rfidUid: string
}

export interface TeacherAttendance {
  id: string
  name: string
  nip: string
  rfidUid: string
  school: 'SMK' | 'SMP'
  subject: string
  level: string // 'Guru Utama' | 'Wali Kelas' | 'Kaprog' | 'Tendik'
  gender: 'Laki-laki' | 'Perempuan'
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa'
  timeIn: string | null
  timeOut: string | null
  lateMinutes?: number
  gate?: string
}

export const useAdminTeachers = () => {
  const grade = useAdminGrade()

  // 1. Master Staff List
  const staffList = useState<StaffItem[]>('admin-staff-list', () => [
    { id: 'T-01', nip: '198204122005011003', name: 'Drs. H. Ahmad Fauzi, M.Pd.I', role: 'Kepala Sekolah / Guru Utama', unit: 'SMK', subject: 'Pendidikan Agama Islam', phone: '081288990011', status: 'GTY', rfidUid: 'E28068940001' },
    { id: 'T-02', nip: '198506152009022004', name: 'Ust. H. Ahmad Fauzi, S.Pd.I', role: 'Waka Kurikulum / Guru Utama', unit: 'SMP', subject: 'PAI & Fiqih', phone: '081288990012', status: 'GTY', rfidUid: 'E28068940002' },
    { id: 'T-03', nip: '199002102015011005', name: 'Hendra Gunawan, M.Kom', role: 'Kaprog RPL', unit: 'SMK', subject: 'PBO & Web', phone: '081377889922', status: 'GTY', rfidUid: 'E28068940003' },
    { id: 'T-04', nip: '199208222017011006', name: 'Fajar Nugraha, S.T', role: 'Kaprog TKJ', unit: 'SMK', subject: 'Jaringan & AIJ', phone: '081377889923', status: 'GTY', rfidUid: 'E28068940004' },
    { id: 'T-05', nip: '198811192014022007', name: 'Aisyah Putri, M.Pd', role: 'Wali Kelas VII-A', unit: 'SMP', subject: 'Matematika', phone: '081299881122', status: 'GTY', rfidUid: 'E28068940005' },
    { id: 'T-06', nip: '199304052018022008', name: 'Rina Kurniawati, S.Pd', role: 'Wali Kelas VIII-A', unit: 'SMP', subject: 'Bahasa Indonesia', phone: '081299881123', status: 'GTT', rfidUid: 'E28068940006' },
    { id: 'T-07', nip: '198703122012011009', name: 'Budi Santoso, S.Si', role: 'Guru Utama', unit: 'SMP', subject: 'IPA Terpadu', phone: '081299881124', status: 'GTY', rfidUid: 'E28068940007' },
    { id: 'T-08', nip: '199507142020011010', name: 'Farhan Maulana, S.Pd', role: 'Wali Kelas X RPL 1', unit: 'SMK', subject: 'Bahasa Inggris', phone: '081299881125', status: 'GTT', rfidUid: 'E28068940008' },
    { id: 'T-09', nip: '199109092016022011', name: 'Siti Rahmawati, S.Kom', role: 'Guru Utama', unit: 'SMK', subject: 'Basis Data', phone: '081377889924', status: 'GTY', rfidUid: 'E28068940009' },
    { id: 'T-10', nip: '198401012008011012', name: 'Ust. M. Rizky, Lc', role: 'Guru Utama', unit: 'SMP', subject: 'Tahfidz Al-Qur\'an', phone: '081288990013', status: 'GTY', rfidUid: 'E28068940010' },
    { id: 'T-11', nip: '199405062019011013', name: 'Sulaeman, S.Kom', role: 'Kepala Tata Usaha / Tendik', unit: 'Yayasan', subject: 'Administrasi', phone: '081299881126', status: 'Staf Tetap', rfidUid: 'E28068940011' },
    { id: 'T-12', nip: '199602032021022014', name: 'Fitri Handayani, A.Md', role: 'Staf Keuangan / Tendik', unit: 'Yayasan', subject: 'Keuangan', phone: '081299881127', status: 'Staf Tetap', rfidUid: 'E28068940012' }
  ])

  // 2. Realtime Teacher Attendance Records
  const attendanceList = useState<TeacherAttendance[]>('admin-teacher-attendance', () => [
    { id: 'T-01', name: 'Drs. H. Ahmad Fauzi, M.Pd.I', nip: '198204122005011003', rfidUid: 'E28068940001', school: 'SMK', subject: 'Pendidikan Agama Islam', level: 'Guru Utama', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:18', timeOut: '15:45', gate: 'Ruang Guru' },
    { id: 'T-02', name: 'Ust. H. Ahmad Fauzi, S.Pd.I', nip: '198506152009022004', rfidUid: 'E28068940002', school: 'SMP', subject: 'PAI & Fiqih', level: 'Guru Utama', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:22', timeOut: '14:45', gate: 'Gerbang Utama' },
    { id: 'T-03', name: 'Hendra Gunawan, M.Kom', nip: '199002102015011005', rfidUid: 'E28068940003', school: 'SMK', subject: 'PBO & Web', level: 'Kaprog RPL', gender: 'Laki-laki', status: 'Terlambat', timeIn: '06:52', timeOut: '16:00', lateMinutes: 7, gate: 'Ruang Guru' },
    { id: 'T-04', name: 'Fajar Nugraha, S.T', nip: '199208222017011006', rfidUid: 'E28068940004', school: 'SMK', subject: 'Jaringan & AIJ', level: 'Kaprog TKJ', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:28', timeOut: '15:30', gate: 'Ruang Guru' },
    { id: 'T-05', name: 'Aisyah Putri, M.Pd', nip: '198811192014022007', rfidUid: 'E28068940005', school: 'SMP', subject: 'Matematika', level: 'Wali Kelas VII-A', gender: 'Perempuan', status: 'Hadir', timeIn: '06:25', timeOut: '14:30', gate: 'Gerbang Utama' },
    { id: 'T-06', name: 'Rina Kurniawati, S.Pd', nip: '199304052018022008', rfidUid: 'E28068940006', school: 'SMP', subject: 'Bahasa Indonesia', level: 'Wali Kelas VIII-A', gender: 'Perempuan', status: 'Hadir', timeIn: '06:30', timeOut: '14:30', gate: 'Ruang Guru' },
    { id: 'T-07', name: 'Budi Santoso, S.Si', nip: '198703122012011009', rfidUid: 'E28068940007', school: 'SMP', subject: 'IPA Terpadu', level: 'Guru Utama', gender: 'Laki-laki', status: 'Sakit', timeIn: null, timeOut: null },
    { id: 'T-08', name: 'Farhan Maulana, S.Pd', nip: '199507142020011010', rfidUid: 'E28068940008', school: 'SMK', subject: 'Bahasa Inggris', level: 'Wali Kelas X RPL 1', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:35', timeOut: '15:30', gate: 'Ruang Guru' },
    { id: 'T-09', name: 'Siti Rahmawati, S.Kom', nip: '199109092016022011', rfidUid: 'E28068940009', school: 'SMK', subject: 'Basis Data', level: 'Guru Utama', gender: 'Perempuan', status: 'Izin', timeIn: null, timeOut: null },
    { id: 'T-10', name: 'Ust. M. Rizky, Lc', nip: '198401012008011012', rfidUid: 'E28068940010', school: 'SMP', subject: 'Tahfidz Al-Qur\'an', level: 'Guru Utama', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:15', timeOut: '14:30', gate: 'Gerbang Utama' },
    { id: 'T-11', name: 'Sulaeman, S.Kom', nip: '199405062019011013', rfidUid: 'E28068940011', school: 'SMK', subject: 'Administrasi', level: 'Tendik', gender: 'Laki-laki', status: 'Hadir', timeIn: '06:20', timeOut: '16:00', gate: 'Ruang TU' },
    { id: 'T-12', name: 'Fitri Handayani, A.Md', nip: '199602032021022014', rfidUid: 'E28068940012', school: 'SMP', subject: 'Keuangan', level: 'Tendik', gender: 'Perempuan', status: 'Hadir', timeIn: '06:24', timeOut: '15:30', gate: 'Ruang TU' }
  ])

  // Sync attendance with staff updates
  const syncAttendanceFromStaff = (staff: StaffItem) => {
    const existing = attendanceList.value.find(a => a.id === staff.id)
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
        gender: 'Laki-laki',
        status: 'Hadir',
        timeIn: '06:25',
        timeOut: '15:30',
        gate: 'Ruang Guru'
      })
    }
  }

  // Update Attendance Status Manually
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
    syncAttendanceFromStaff,
    updateAttendanceStatus
  }
}
