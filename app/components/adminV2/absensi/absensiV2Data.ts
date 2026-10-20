import {
  INITIAL_STUDENTS_SMK,
  INITIAL_STUDENTS_SMP,
  KELAS_DATA,
  type Student
} from '~/components/adminV2/siswa/siswaV2Data'

export interface PresensiRecord {
  id: string
  nis: string
  nisn: string
  name: string
  gender: 'L' | 'P'
  className: string
  major: string
  level: 'smp' | 'smk'
  hasRfid: boolean
  rfidUid: string
  timeIn: string
  timeOut: string
  lateMinutes: number
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa'
  gate: string
  date: string
  note?: string
  father: string
  fphone: string
}

export interface RombelPresensi {
  name: string
  level: 'smp' | 'smk'
  room: string
  wali: string
  totalSiswa: number
  hadirCount: number
  terlambatCount: number
  izinCount: number
  sakitCount: number
  alpaCount: number
  attPct: number
  gradeAvg: number
}

export interface TrendDay {
  dayLabel: string
  dateFull: string
  hadirPct: number
  smpPct: number
  smkPct: number
  hadir: number
  terlambat: number
  izinSakit: number
  alpa: number
}

export interface TapBucket {
  slot: string
  label: string
  count: number
  status: 'ok' | 'late' | 'alpa'
}

export interface AbsensiFilter {
  q: string
  kelas: string
  status: string
  gate: string
  page: number
}

export function buildPresensiFromStudent(s: Student, i: number): PresensiRecord {
  const pattern = (i * 7 + (s.gender === 'P' ? 3 : 1)) % 10

  let status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa' = 'Hadir'
  let timeIn = '—'
  let timeOut = '—'
  let lateMinutes = 0
  let gate = '—'
  let note = ''

  if (pattern <= 6) {
    status = 'Hadir'
    const minute = 15 + ((i * 11 + 3) % 30) // 06:15 - 06:44
    timeIn = `06:${String(minute).padStart(2, '0')}`
    timeOut = s.level === 'smk' ? '15:30' : '14:30'
    gate = i % 2 === 0 ? 'Gate 1 · Utama' : 'Gate 2 · Lobi'
  } else if (pattern === 7) {
    status = 'Terlambat'
    const minute = 46 + ((i * 3 + 2) % 13) // 06:46 - 06:58
    timeIn = `06:${String(minute).padStart(2, '0')}`
    timeOut = s.level === 'smk' ? '15:30' : '14:30'
    lateMinutes = minute - 45
    gate = 'Gate 1 · Utama'
    note = `Terlambat ${lateMinutes} menit (batas 06:45)`
  } else if (pattern === 8) {
    if (i % 2 === 0) {
      status = 'Izin'
      note = 'Surat izin keperluan keluarga'
    } else {
      status = 'Sakit'
      note = 'Surat keterangan dokter (rawat jalan)'
    }
  } else {
    status = 'Alpa'
    note = 'Belum tap kartu lewat batas 07:00'
  }

  return {
    id: s.id,
    nis: s.nis,
    nisn: s.nisn,
    name: s.name,
    gender: s.gender,
    className: s.className,
    major: s.major,
    level: s.level,
    hasRfid: s.hasRfid,
    rfidUid: s.rfidUid,
    timeIn,
    timeOut,
    lateMinutes,
    status,
    gate,
    date: '16 Oktober 2026',
    note,
    father: s.father,
    fphone: s.fphone
  }
}

export const INITIAL_PRESENSI_SMK: PresensiRecord[] = INITIAL_STUDENTS_SMK.map((s, i) => buildPresensiFromStudent(s, i))
export const INITIAL_PRESENSI_SMP: PresensiRecord[] = INITIAL_STUDENTS_SMP.map((s, i) => buildPresensiFromStudent(s, i))

export function computeRombelPresensi(records: PresensiRecord[], level: 'smp' | 'smk'): RombelPresensi[] {
  const master = KELAS_DATA[level]
  return master.map((k) => {
    const classRecords = records.filter(r => r.className === k.name)
    const total = classRecords.length || (k.boys + k.girls)
    const hadir = classRecords.filter(r => r.status === 'Hadir').length
    const terlambat = classRecords.filter(r => r.status === 'Terlambat').length
    const izin = classRecords.filter(r => r.status === 'Izin').length
    const sakit = classRecords.filter(r => r.status === 'Sakit').length
    const alpa = classRecords.filter(r => r.status === 'Alpa').length

    // If records are dummy-sliced, fall back gracefully to master KPI percentages
    const pct = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : Math.round(k.att)

    return {
      name: k.name,
      level,
      room: k.room,
      wali: k.wali,
      totalSiswa: total,
      hadirCount: classRecords.length ? hadir : Math.round(total * 0.92),
      terlambatCount: classRecords.length ? terlambat : 2,
      izinCount: classRecords.length ? izin : 1,
      sakitCount: classRecords.length ? sakit : 0,
      alpaCount: classRecords.length ? alpa : 1,
      attPct: pct,
      gradeAvg: k.avg
    }
  })
}

export const ATTENDANCE_TREND_7_DAYS: TrendDay[] = [
  { dayLabel: 'Sen', dateFull: 'Senin, 12 Okt', hadirPct: 95.8, smpPct: 96.4, smkPct: 95.2, hadir: 1195, terlambat: 32, izinSakit: 12, alpa: 8 },
  { dayLabel: 'Sel', dateFull: 'Selasa, 13 Okt', hadirPct: 96.6, smpPct: 97.2, smkPct: 96.0, hadir: 1205, terlambat: 24, izinSakit: 11, alpa: 7 },
  { dayLabel: 'Rab', dateFull: 'Rabu, 14 Okt', hadirPct: 94.2, smpPct: 95.0, smkPct: 93.4, hadir: 1175, terlambat: 48, izinSakit: 16, alpa: 8 },
  { dayLabel: 'Kam', dateFull: 'Kamis, 15 Okt', hadirPct: 97.4, smpPct: 97.9, smkPct: 96.9, hadir: 1215, terlambat: 18, izinSakit: 10, alpa: 4 },
  { dayLabel: 'Jum', dateFull: 'Jumat, 16 Okt (Hari Ini)', hadirPct: 96.5, smpPct: 97.1, smkPct: 95.9, hadir: 1204, terlambat: 25, izinSakit: 12, alpa: 6 },
  { dayLabel: 'Sab', dateFull: 'Sabtu, 17 Okt', hadirPct: 96.8, smpPct: 97.0, smkPct: 96.6, hadir: 1208, terlambat: 22, izinSakit: 11, alpa: 6 },
  { dayLabel: 'Min', dateFull: 'Senin Depan (Target)', hadirPct: 98.0, smpPct: 98.2, smkPct: 97.8, hadir: 1222, terlambat: 15, izinSakit: 8, alpa: 2 }
]

export const TAP_TIME_SLOTS: TapBucket[] = [
  { slot: '06:00–06:30', label: 'Lebih Awal', count: 540, status: 'ok' },
  { slot: '06:31–06:45', label: 'Tepat Waktu', count: 664, status: 'ok' },
  { slot: '06:46–07:00', label: 'Terlambat', count: 25, status: 'late' },
  { slot: '> 07:00', label: 'Alpa / Lewat Batas', count: 6, status: 'alpa' }
]

export interface RecentTap {
  id: string
  name: string
  classroom: string
  rfid: string
  time: string
  status: 'Tepat Waktu' | 'Terlambat'
  gate: string
}

export const RECENT_RFID_TAPS: Record<'smk' | 'smp', RecentTap[]> = {
  smk: [
    { id: 't1', name: 'Ahmad Fauzi Rahman', classroom: 'X RPL 1', rfid: '04:A1:B2:C3', time: '06:38 WIB', status: 'Tepat Waktu', gate: 'Gate 1 · Utama' },
    { id: 't2', name: 'Nabila Zahra Putri', classroom: 'XI RPL 1', rfid: '04:D4:E5:F6', time: '06:41 WIB', status: 'Tepat Waktu', gate: 'Gate 2 · Lobi' },
    { id: 't3', name: 'Muhammad Rizky Pratama', classroom: 'XII TKJ 1', rfid: '04:77:88:99', time: '06:48 WIB', status: 'Terlambat', gate: 'Gate 1 · Utama' }
  ],
  smp: [
    { id: 't4', name: 'Ahmad Raihan Pratama', classroom: 'VII-A', rfid: '04:33:44:55', time: '06:34 WIB', status: 'Tepat Waktu', gate: 'Gate 1 · Utama' },
    { id: 't5', name: 'Siti Aisyah Humaira', classroom: 'VIII-A', rfid: '04:66:77:88', time: '06:39 WIB', status: 'Tepat Waktu', gate: 'Gate 2 · Lobi' },
    { id: 't6', name: 'Fikri Haikal Ramadhan', classroom: 'IX-A', rfid: '04:99:AA:BB', time: '06:47 WIB', status: 'Terlambat', gate: 'Gate 1 · Utama' }
  ]
}

