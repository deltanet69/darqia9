export type DayIndex = 0 | 1 | 2 | 3 | 4
export type DayName = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'
export type RoleKey = 'operator' | 'wali' | 'guru' | 'staff'
export type Jenjang = 'smp' | 'smk'
export type GuruStatus = 'Hadir' | 'Terlambat' | 'Berlangsung' | 'Terjadwal'

export interface ClassMeta {
  name: string
  major: string
  room: string
  wali: string
  nip: string
  boys: number
  girls: number
  att: number
  avg: number
}

export interface MapelMeta {
  code: string
  name: string
  cat: string
  kkm: number
  hours: number
  coord: string
}

export interface LessonSlot {
  mapel: string
  guru: string
  code?: string
  ket?: string
  baru?: boolean
}

export interface LessonItem {
  id: string
  level: Jenjang
  kelas: string
  room: string
  di: DayIndex
  si: number
  time: string
  mapel: string
  guru: string
  ket?: string
}

export interface LessonSession {
  hadir: number
  alpa: string[]
  done: boolean
}

export interface StudentRosterItem {
  name: string
  gender: 'L' | 'P'
  nis: string
}

export interface PersonaInfo {
  name: string
  label: string
  kelas?: string
}

export const DAYS: DayName[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
export const SLOT_TIMES: string[] = [
  '07:00–07:45',
  '07:45–08:30',
  '08:30–09:15',
  '09:30–10:15',
  '10:15–11:00',
  '11:00–11:45',
  '12:30–13:15'
]

export const KELAS: Record<Jenjang, ClassMeta[]> = {
  smk: [
    { name: 'X RPL 1', major: 'RPL', room: 'Gedung A · R.101', wali: 'H. Abdul Muiz, S.Pd', nip: '19680512 199803 1 002', boys: 18, girls: 14, att: 96.4, avg: 82.5 },
    { name: 'X RPL 2', major: 'RPL', room: 'Gedung A · R.102', wali: 'Siti Maryam, S.Pd', nip: '19820314 200801 2 005', boys: 17, girls: 15, att: 95.1, avg: 80.2 },
    { name: 'X TKJ 1', major: 'TKJ', room: 'Gedung A · R.103', wali: 'Budi Hartono, S.Pd', nip: '19791120 200502 1 008', boys: 20, girls: 12, att: 94.8, avg: 79.6 },
    { name: 'XI RPL 1', major: 'RPL', room: 'Gedung B · R.201', wali: 'Dewi Sartika, S.Si', nip: '19850608 201001 2 011', boys: 16, girls: 16, att: 93.5, avg: 81.8 },
    { name: 'XII RPL 1', major: 'RPL', room: 'Gedung B · R.202', wali: 'Agus Setiawan, S.Pd', nip: '19750228 199901 1 004', boys: 15, girls: 15, att: 97.2, avg: 84.1 },
    { name: 'XII TKJ 1', major: 'TKJ', room: 'Gedung B · R.203', wali: 'Rina Marlina, S.Pd', nip: '19891201 201503 2 009', boys: 19, girls: 13, att: 92.9, avg: 78.4 }
  ],
  smp: [
    { name: 'VII-A', major: '', room: 'Gedung C · R.301', wali: 'Drs. H. Ahmad Yani', nip: '19670115 199203 1 001', boys: 16, girls: 16, att: 97.8, avg: 83.2 },
    { name: 'VII-B', major: '', room: 'Gedung C · R.302', wali: 'Nina Kurnia, S.Pd', nip: '19880419 201201 2 014', boys: 15, girls: 17, att: 96.9, avg: 81.5 },
    { name: 'VIII-A', major: '', room: 'Gedung C · R.303', wali: 'Fajar Sidik, S.Pd', nip: '19900123 201801 1 017', boys: 17, girls: 15, att: 95.6, avg: 80.9 },
    { name: 'VIII-B', major: '', room: 'Gedung D · R.401', wali: 'Wulan Dari, S.Pd', nip: '19920530 201902 2 020', boys: 16, girls: 16, att: 94.2, avg: 79.8 },
    { name: 'IX-A', major: '', room: 'Gedung D · R.402', wali: 'Hendra Gunawan, S.Pd', nip: '19820817 200701 1 012', boys: 15, girls: 17, att: 96.1, avg: 82.7 },
    { name: 'IX-B', major: '', room: 'Gedung D · R.403', wali: 'Sri Wahyuni, S.Pd', nip: '19851111 201001 2 016', boys: 16, girls: 16, att: 93.8, avg: 78.9 }
  ]
}

export const MAPEL: Record<Jenjang, MapelMeta[]> = {
  smk: [
    { code: 'SMK-PAI', name: 'Pendidikan Agama Islam', cat: 'Keagamaan', kkm: 75, hours: 2, coord: 'Ust. H. Mahmud, S.Pd.I' },
    { code: 'SMK-BIN', name: 'Bahasa Indonesia', cat: 'Umum', kkm: 75, hours: 3, coord: 'Siti Maryam, S.Pd' },
    { code: 'SMK-MTK', name: 'Matematika Terapan', cat: 'Umum', kkm: 75, hours: 4, coord: 'Budi Hartono, S.Pd' },
    { code: 'SMK-PBO', name: 'Pemrograman Berorientasi Objek', cat: 'Kejuruan', kkm: 78, hours: 6, coord: 'Andi Wijaya, S.Kom' },
    { code: 'SMK-BD', name: 'Basis Data', cat: 'Kejuruan', kkm: 78, hours: 4, coord: 'Rina Marlina, S.Kom' },
    { code: 'SMK-AIJ', name: 'Administrasi Infrastruktur Jaringan', cat: 'Kejuruan', kkm: 78, hours: 6, coord: 'Agus Setiawan, S.T' },
    { code: 'SMK-PKK', name: 'Produk Kreatif & Kewirausahaan', cat: 'Kejuruan', kkm: 78, hours: 2, coord: 'Dewi Sartika, S.Si' }
  ],
  smp: [
    { code: 'SMP-PAI', name: 'Pendidikan Agama Islam', cat: 'Keagamaan', kkm: 75, hours: 3, coord: 'Ust. H. Mahmud, S.Pd.I' },
    { code: 'SMP-TAH', name: 'Tahfidz Al-Qur\'an', cat: 'Keagamaan', kkm: 75, hours: 4, coord: 'Ustzh. Fatimah, S.Pd.I' },
    { code: 'SMP-BIN', name: 'Bahasa Indonesia', cat: 'Umum', kkm: 75, hours: 4, coord: 'Nina Kurnia, S.Pd' },
    { code: 'SMP-MTK', name: 'Matematika', cat: 'Umum', kkm: 75, hours: 5, coord: 'Fajar Sidik, S.Pd' },
    { code: 'SMP-IPA', name: 'Ilmu Pengetahuan Alam', cat: 'Umum', kkm: 75, hours: 5, coord: 'Wulan Dari, S.Si' },
    { code: 'SMP-IPS', name: 'Ilmu Pengetahuan Sosial', cat: 'Umum', kkm: 75, hours: 4, coord: 'Hendra Gunawan, S.Pd' },
    { code: 'SMP-ING', name: 'Bahasa Inggris', cat: 'Umum', kkm: 75, hours: 3, coord: 'Sri Wahyuni, S.Pd' },
    { code: 'SMP-INF', name: 'Informatika', cat: 'Muatan Lokal', kkm: 75, hours: 2, coord: 'Andi Wijaya, S.Kom' }
  ]
}

export const PERSONAS: Record<RoleKey, Record<Jenjang, PersonaInfo>> = {
  operator: {
    smk: { name: 'Dewi Sartika, S.Si', label: 'Operator / Admin Akademik' },
    smp: { name: 'Dewi Sartika, S.Si', label: 'Operator / Admin Akademik' }
  },
  wali: {
    smk: { name: 'Agus Setiawan, S.Pd', label: 'Wali Kelas XII RPL 1', kelas: 'XII RPL 1' },
    smp: { name: 'Fajar Sidik, S.Pd', label: 'Wali Kelas VIII-A', kelas: 'VIII-A' }
  },
  guru: {
    smk: { name: 'Budi Hartono, S.Pd', label: 'Guru Matematika Terapan' },
    smp: { name: 'Nina Kurnia, S.Pd', label: 'Guru Bahasa Indonesia' }
  },
  staff: {
    smk: { name: 'Tono Wibowo', label: 'Staff Tata Usaha' },
    smp: { name: 'Tono Wibowo', label: 'Staff Tata Usaha' }
  }
}

export const OVERRIDES: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string }> = [
  { level: 'smk', kelas: 'X TKJ 1', di: 4, si: 0, mapel: 'Matematika Terapan', guru: 'Budi Hartono, S.Pd' },
  { level: 'smk', kelas: 'XII TKJ 1', di: 4, si: 2, mapel: 'Matematika Terapan', guru: 'Budi Hartono, S.Pd' },
  { level: 'smk', kelas: 'XI RPL 1', di: 4, si: 4, mapel: 'Matematika Terapan', guru: 'Budi Hartono, S.Pd' },
  { level: 'smk', kelas: 'X TKJ 1', di: 0, si: 1, mapel: 'Matematika Terapan', guru: 'Budi Hartono, S.Pd' },
  { level: 'smk', kelas: 'XII TKJ 1', di: 2, si: 1, mapel: 'Matematika Terapan', guru: 'Budi Hartono, S.Pd' },
  { level: 'smk', kelas: 'X RPL 2', di: 3, si: 5, mapel: 'Matematika Terapan', guru: 'Budi Hartono, S.Pd' },
  { level: 'smk', kelas: 'XII RPL 1', di: 4, si: 1, mapel: 'Produk Kreatif & Kewirausahaan', guru: 'Dewi Sartika, S.Si' },
  { level: 'smk', kelas: 'XI RPL 1', di: 4, si: 2, mapel: 'Produk Kreatif & Kewirausahaan', guru: 'Dewi Sartika, S.Si' },
  { level: 'smk', kelas: 'XI RPL 1', di: 1, si: 3, mapel: 'Produk Kreatif & Kewirausahaan', guru: 'Dewi Sartika, S.Si' },
  { level: 'smp', kelas: 'VII-A', di: 4, si: 0, mapel: 'Bahasa Indonesia', guru: 'Nina Kurnia, S.Pd' },
  { level: 'smp', kelas: 'VIII-A', di: 4, si: 2, mapel: 'Bahasa Indonesia', guru: 'Nina Kurnia, S.Pd' },
  { level: 'smp', kelas: 'IX-A', di: 4, si: 4, mapel: 'Bahasa Indonesia', guru: 'Nina Kurnia, S.Pd' },
  { level: 'smp', kelas: 'VII-B', di: 1, si: 1, mapel: 'Bahasa Indonesia', guru: 'Nina Kurnia, S.Pd' }
]

export const slotMin = (si: number): [number, number] => {
  const p = SLOT_TIMES[si].split('–')
  const f = (s: string) => {
    const a = s.split(':')
    return (+a[0]) * 60 + (+a[1])
  }
  return [f(p[0]), f(p[1])]
}

export const fmtMin = (m: number): string => {
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
}

export const teachersOf = (level: Jenjang): string[] => {
  const s = new Set<string>()
  MAPEL[level].forEach(m => s.add(m.coord))
  KELAS[level].forEach(k => s.add(k.wali))
  return [...s].sort()
}

export const genGrid = (
  level: Jenjang,
  kelasName: string,
  extra: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string; ket?: string }> = []
): Record<DayIndex, LessonSlot[]> => {
  const kIdx = Math.max(0, KELAS[level].findIndex(k => k.name === kelasName))
  const pool = MAPEL[level]
  const g: Record<number, LessonSlot[]> = {}

  DAYS.forEach((_, di) => {
    g[di] = SLOT_TIMES.map((_, si) => {
      const m = pool[(si * 3 + di + kIdx) % pool.length]
      return { mapel: m.name, guru: m.coord, code: m.code }
    })
  })

  OVERRIDES.filter(o => o.level === level && o.kelas === kelasName).forEach(o => {
    g[o.di][o.si] = { mapel: o.mapel, guru: o.guru, code: '' }
  })

  extra.filter(e => e.level === level && e.kelas === kelasName).forEach(e => {
    g[e.di][e.si] = { mapel: e.mapel, guru: e.guru, code: '', ket: e.ket, baru: true }
  })

  return g as Record<DayIndex, LessonSlot[]>
}

export const allLessons = (
  level: Jenjang,
  extra: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string; ket?: string }> = []
): LessonItem[] => {
  const out: LessonItem[] = []
  KELAS[level].forEach(k => {
    const g = genGrid(level, k.name, extra)
    DAYS.forEach((_, di) => {
      const dIndex = di as DayIndex
      SLOT_TIMES.forEach((t, si) => {
        const c = g[dIndex][si]
        if (c) {
          out.push({
            id: `${level}-${k.name}-${dIndex}-${si}`,
            level,
            kelas: k.name,
            room: k.room,
            di: dIndex,
            si,
            time: t,
            mapel: c.mapel,
            guru: c.guru,
            ket: c.ket
          })
        }
      })
    })
  })
  return out
}

export const lessonsOf = (
  level: Jenjang,
  guruName: string,
  extra: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string; ket?: string }> = []
): LessonItem[] => {
  return allLessons(level, extra)
    .filter(l => l.guru === guruName)
    .sort((a, b) => a.di - b.di || slotMin(a.si)[0] - slotMin(b.si)[0])
}

export const guruStatus = (
  level: Jenjang,
  kelasName: string,
  di: DayIndex,
  si: number,
  simDayIdx: DayIndex,
  simMin: number
): GuruStatus => {
  const kIdx = Math.max(0, KELAS[level].findIndex(k => k.name === kelasName))
  if (di < simDayIdx) return ((di * 7 + si * 3 + kIdx) % 9 === 4) ? 'Terlambat' : 'Hadir'
  if (di > simDayIdx) return 'Terjadwal'
  const sm = slotMin(si)
  if (simMin >= sm[1]) return ((di * 3 + si + kIdx) % 8 === 5) ? 'Terlambat' : 'Hadir'
  if (simMin >= sm[0]) return 'Berlangsung'
  return 'Terjadwal'
}

const NAME_POOL = [
  'Raka Aditya Pratama', 'Nabila Zahra', 'Dimas Aryo Nugroho', 'Salsabila Putri',
  'Farhan Rizky Ramadhan', 'Aisyah Nur Rahma', 'Galih Permana', 'Kirana Ayu Lestari',
  'Bagas Wicaksono', 'Tiara Andini', 'Ilham Fauzan', 'Mega Puspita Sari',
  'Reza Pahlevi', 'Intan Nuraini', 'Yusuf Hamdani', 'Laras Sekar Wangi'
]

export const rosterOf = (level: Jenjang, kelasName: string): StudentRosterItem[] => {
  const kIdx = Math.max(0, KELAS[level].findIndex(k => k.name === kelasName))
  const out: StudentRosterItem[] = []
  let n = 0
  while (out.length < 14) {
    const nm = NAME_POOL[(kIdx * 3 + n * 5) % NAME_POOL.length]
    n++
    if (out.some(s => s.name === nm)) continue
    out.push({
      name: nm,
      gender: n % 2 ? 'P' : 'L',
      nis: String(2026100 + kIdx * 40 + n * 3)
    })
  }
  return out
}
