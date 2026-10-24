export type AgendaTab = 'pertemuan' | 'tugas' | 'ujian' | 'rekap'
export type AgendaMode = 'sementara' | 'akhir'
export type AttendanceStatus = 'H' | 'S' | 'I' | 'A'
export type ScoreType = 'tugas' | 'pts' | 'pas' | 'predikat' | 'sikap'

export interface AgendaBook {
  buku_id: string
  guru_id: string
  guru_nama: string
  mapel_id: string
  mapel_nama: string
  kelas_id: string
  kelas_nama: string
  jenjang: 'SMP' | 'SMK'
  kkm: number
  semester: 1 | 2
  tahun_ajaran: string
  pas_terbuka: boolean
}

export interface AgendaStudent {
  id: string
  nis: string | null
  nisn: string
  name: string
  gender: 'L' | 'P'
}

export interface AgendaMeeting {
  id: string
  buku_id: string
  pertemuan_ke: number
  tanggal: string
  topik: string
  kegiatan: string
}

export interface AgendaAttendance {
  id: string
  buku_id: string
  pertemuan_ke: number
  siswa_id: string
  status: Exclude<AttendanceStatus, 'H'>
}

export interface AgendaScore {
  id: string
  buku_id: string
  siswa_id: string
  jenis: ScoreType
  nomor: number | null
  nilai: string
}

export interface AgendaTabData {
  students: AgendaStudent[]
  meetings: AgendaMeeting[]
  attendance: AgendaAttendance[]
  scores: AgendaScore[]
}

export interface AgendaCalculation {
  present: number
  meetingCount: number
  attendanceNormalized: number
  taskSum: number
  taskCount: number
  taskNormalized: number | null
  pts: number | null
  pas: number | null
  finalScore: number | null
  missing: 'Pertemuan' | 'Tugas' | 'PTS' | 'PAS' | ''
}

const roundOne = (value: number) => Math.round(value * 10) / 10

export const calculateAgendaScore = (input: {
  present: number
  meetingCount: number
  tasks: number[]
  pts: number | null
  pas: number | null
  mode: AgendaMode
}): AgendaCalculation => {
  const attendanceNormalized = input.meetingCount > 0
    ? roundOne(input.present / input.meetingCount * 100)
    : 0
  const taskSum = input.tasks.reduce((total, score) => total + score, 0)
  const taskNormalized = input.tasks.length > 0 ? roundOne(taskSum / input.tasks.length) : null
  const missing = input.meetingCount === 0
    ? 'Pertemuan'
    : taskNormalized === null
      ? 'Tugas'
      : input.pts === null
        ? 'PTS'
        : input.mode === 'akhir' && input.pas === null
          ? 'PAS'
          : ''

  if (missing) {
    return {
      present: input.present,
      meetingCount: input.meetingCount,
      attendanceNormalized,
      taskSum,
      taskCount: input.tasks.length,
      taskNormalized,
      pts: input.pts,
      pas: input.pas,
      finalScore: null,
      missing
    }
  }

  const weighted = input.mode === 'sementara'
    ? attendanceNormalized * 0.3 + taskNormalized! * 0.2 + input.pts! * 0.5
    : attendanceNormalized * 0.3 + taskNormalized! * 0.2 + input.pts! * 0.1 + input.pas! * 0.4

  return {
    present: input.present,
    meetingCount: input.meetingCount,
    attendanceNormalized,
    taskSum,
    taskCount: input.tasks.length,
    taskNormalized,
    pts: input.pts,
    pas: input.pas,
    finalScore: roundOne(weighted),
    missing: ''
  }
}

export const useAgendaMengajar = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const requireUserId = () => {
    if (!user.value?.id) throw new Error('Sesi pengguna tidak tersedia.')
    return user.value.id
  }

  const loadBooks = async (academicYear: string, semester: 1 | 2, grade: 'SMP' | 'SMK') => {
    const { data, error } = await client.rpc('agenda_context', {
      target_tahun_ajaran: academicYear,
      target_semester: semester,
      target_grade: grade
    })
    if (error) throw error
    return (data || []) as AgendaBook[]
  }

  const loadTab = async (bookId: string, tab: AgendaTab) => {
    const { data, error } = await client.rpc('agenda_tab_data', {
      target_buku_id: bookId,
      target_tab: tab
    })
    if (error) throw error
    return data as unknown as AgendaTabData
  }

  const saveMeeting = async (bookId: string, meeting: Pick<AgendaMeeting, 'pertemuan_ke' | 'tanggal' | 'topik' | 'kegiatan'>) => {
    const { error } = await client.from('agenda_pertemuan').upsert({
      buku_id: bookId,
      pertemuan_ke: meeting.pertemuan_ke,
      tanggal: meeting.tanggal,
      topik: meeting.topik,
      kegiatan: meeting.kegiatan,
      updated_by: requireUserId()
    }, { onConflict: 'buku_id,pertemuan_ke' })
    if (error) throw error
  }

  const saveAttendance = async (
    bookId: string,
    meetingNumber: number,
    studentId: string,
    status: AttendanceStatus
  ) => {
    if (status === 'H') {
      const { error } = await client
        .from('agenda_kehadiran')
        .delete()
        .eq('buku_id', bookId)
        .eq('pertemuan_ke', meetingNumber)
        .eq('siswa_id', studentId)
      if (error) throw error
      return
    }

    const { error } = await client.from('agenda_kehadiran').upsert({
      buku_id: bookId,
      pertemuan_ke: meetingNumber,
      siswa_id: studentId,
      status,
      updated_by: requireUserId()
    }, { onConflict: 'buku_id,pertemuan_ke,siswa_id' })
    if (error) throw error
  }

  const saveScore = async (
    bookId: string,
    studentId: string,
    type: ScoreType,
    value: string,
    number: number | null = null
  ) => {
    if (!value.trim()) {
      let request = client
        .from('agenda_nilai')
        .delete()
        .eq('buku_id', bookId)
        .eq('siswa_id', studentId)
        .eq('jenis', type)
      request = number === null ? request.is('nomor', null) : request.eq('nomor', number)
      const { error } = await request
      if (error) throw error
      return
    }

    const { error } = await client.from('agenda_nilai').upsert({
      buku_id: bookId,
      siswa_id: studentId,
      jenis: type,
      nomor: number,
      nilai: value.trim(),
      updated_by: requireUserId()
    }, { onConflict: 'buku_id,siswa_id,jenis,nomor' })
    if (error) throw error
  }

  const loadIntegrityReport = async () => {
    const { data, error } = await client.rpc('agenda_integrity_report')
    if (error) throw error
    return (data || []) as Array<{ pemeriksaan: string; jumlah: number }>
  }

  return {
    loadBooks,
    loadTab,
    saveMeeting,
    saveAttendance,
    saveScore,
    loadIntegrityReport
  }
}
