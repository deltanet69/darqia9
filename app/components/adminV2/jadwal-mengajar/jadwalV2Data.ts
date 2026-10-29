import { reactive } from 'vue'

// ================================================================
//  Data Jadwal Mengajar v2 — REGISTRY DATA ASLI (bukan demo).
//  Seluruh isi registry diisi oleh useJadwalMengajar() dari tabel
//  resmi: classes, subjects, teachers, students, class_schedules,
//  jadwal_settings, dan teaching_sessions. Fungsi-fungsi di file
//  ini hanya MEMBACA registry sehingga komponen tampilan tidak
//  berubah; sumber kebenarannya satu: basis data Darqia.
// ================================================================

export type DayIndex = 0 | 1 | 2 | 3 | 4
export type DayName = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'
export type RoleKey = 'operator' | 'wali' | 'guru' | 'staff'
export type Jenjang = 'smp' | 'smk'
export type GuruStatus = 'Hadir' | 'Terlambat' | 'Berlangsung' | 'Terjadwal' | 'Tidak Hadir'

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
  id: string // id baris class_schedules
  level: Jenjang
  kelas: string
  room: string
  di: DayIndex
  si: number // indeks slot mulai (0 = jam ke-1)
  siAkhir: number // indeks slot selesai (multi-JP: > si)
  time: string
  mapel: string
  guru: string
  ket?: string
  classId: string
  subjectId: string
  teacherId: string
}

export interface LessonSession {
  hadir: number
  alpa: string[] // daftar NIS siswa alpa
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

export interface SesiDb {
  tanggal: string // YYYY-MM-DD (lokal)
  status: 'belum' | 'berlangsung' | 'selesai' | 'tidak_hadir'
  startedAt: string | null // ISO timestamptz
  endedAt: string | null
  hadir: number | null
  alpa: string[]
}

export interface JedaSlot {
  setelahSi: number // jeda tampil setelah indeks slot ini
  label: string
  rentang: string
}

export interface GuruRingkas {
  id: string
  nama: string
}

export const DAYS: DayName[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

// ---------------- Registry (diisi useJadwalMengajar) ----------------

export const stateV2 = reactive({
  siap: false,
  tahunAjaran: '',
  kelas: { smp: [] as ClassMeta[], smk: [] as ClassMeta[] },
  mapel: { smp: [] as MapelMeta[], smk: [] as MapelMeta[] },
  polaSlot: { smp: [] as string[], smk: [] as string[] },
  polaJeda: { smp: [] as JedaSlot[], smk: [] as JedaSlot[] },
  pelajaran: [] as LessonItem[],
  roster: {} as Record<string, StudentRosterItem[]>, // kunci `${level}|${kelas}`
  sesi: {} as Record<string, SesiDb>, // kunci `${scheduleId}|${tanggal}`
  guru: { smp: [] as GuruRingkas[], smk: [] as GuruRingkas[] },
  idKelas: {} as Record<string, string>, // `${level}|${namaKelas}` -> id kelas
  idMapel: {} as Record<string, string>, // `${level}|${namaMapel}` -> id mapel
  idGuru: {} as Record<string, string>, // nama guru -> id guru
  waliDari: {} as Record<string, string> // `${level}|${namaKelas}` -> id guru wali kelas
})

export const KELAS = stateV2.kelas
export const MAPEL = stateV2.mapel

// Slot & jeda jenjang yang sedang tampil (ditukar terapkanJenjang)
export const SLOT_TIMES = reactive<string[]>([])
export const JEDA = reactive<JedaSlot[]>([])

export const terapkanJenjang = (j: Jenjang) => {
  SLOT_TIMES.splice(0, SLOT_TIMES.length, ...stateV2.polaSlot[j])
  JEDA.splice(0, JEDA.length, ...stateV2.polaJeda[j])
}

// ---------------- Kunci & tanggal ----------------

export const kunciSesi = (scheduleId: string, tanggal: string): string => `${scheduleId}|${tanggal}`

export const kunciPelajaran = (l: Pick<LessonItem, 'level' | 'kelas' | 'di' | 'si'>): string =>
  `${l.level}|${l.kelas}|${l.di}|${l.si}`

export const isoTanggalLokal = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Indeks hari Senin=0 .. Jumat=4; akhir pekan = -1
export const diHariIni = (acuan: Date = new Date()): number => {
  const d = acuan.getDay()
  return d >= 1 && d <= 5 ? d - 1 : -1
}

// Tanggal (YYYY-MM-DD) dari indeks hari pada minggu berjalan
export const tanggalDariDi = (di: number, acuan: Date = new Date()): string => {
  const senin = new Date(acuan)
  senin.setDate(acuan.getDate() - ((acuan.getDay() + 6) % 7) + di)
  return isoTanggalLokal(senin)
}

// ---------------- Waktu slot ----------------

const menitDariTeks = (s: string): number => {
  const [h = '0', m = '0'] = s.split(':')
  return (+h) * 60 + (+m)
}

export const rentangSlot = (level: Jenjang, si: number): [number, number] => {
  const [mulai = '00:00', selesai = '00:00'] = (stateV2.polaSlot[level][si] || '').split('–')
  return [menitDariTeks(mulai), menitDariTeks(selesai)]
}

export const slotMin = (si: number): [number, number] => {
  const [mulai = '00:00', selesai = '00:00'] = (SLOT_TIMES[si] || '').split('–')
  return [menitDariTeks(mulai), menitDariTeks(selesai)]
}

export const fmtMin = (m: number): string => {
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
}

// ---------------- Pembaca registry untuk komponen ----------------

export const teachersOf = (level: Jenjang): string[] => stateV2.guru[level].map(g => g.nama)

export const genGrid = (
  level: Jenjang,
  kelasName: string,
  extra: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string; ket?: string }> = []
): Record<DayIndex, LessonSlot[]> => {
  const jumlahSlot = Math.max(stateV2.polaSlot[level].length, SLOT_TIMES.length, 1)
  const g: Record<number, LessonSlot[]> = {}
  DAYS.forEach((_, di) => {
    g[di] = Array.from({ length: jumlahSlot }, () => ({ mapel: '', guru: '', code: '' }))
  })
  stateV2.pelajaran
    .filter(l => l.level === level && l.kelas === kelasName)
    .forEach(l => {
      for (let si = l.si; si <= l.siAkhir; si++) {
        const sel = g[l.di]?.[si]
        if (sel) {
          sel.mapel = l.mapel
          sel.guru = l.guru
          sel.ket = l.ket
        }
      }
    })
  extra
    .filter(e => e.level === level && e.kelas === kelasName)
    .forEach(e => {
      const sel = g[e.di]?.[e.si]
      if (sel) {
        sel.mapel = e.mapel
        sel.guru = e.guru
        sel.ket = e.ket
        sel.baru = true
      }
    })
  return g as Record<DayIndex, LessonSlot[]>
}

export const allLessons = (
  level: Jenjang,
  extra: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string; ket?: string }> = []
): LessonItem[] => {
  const out = stateV2.pelajaran.filter(l => l.level === level)
  extra
    .filter(e => e.level === level)
    .forEach(e => {
      out.push({
        id: `lokal-${e.kelas}-${e.di}-${e.si}`,
        level,
        kelas: e.kelas,
        room: stateV2.kelas[level].find(k => k.name === e.kelas)?.room || '',
        di: e.di,
        si: e.si,
        siAkhir: e.si,
        time: stateV2.polaSlot[level][e.si] || '',
        mapel: e.mapel,
        guru: e.guru,
        ket: e.ket,
        classId: '',
        subjectId: '',
        teacherId: ''
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
    .sort((a, b) => a.di - b.di || rentangSlot(level, a.si)[0] - rentangSlot(level, b.si)[0])
}

export const rosterOf = (level: Jenjang, kelasName: string): StudentRosterItem[] => {
  return stateV2.roster[`${level}|${kelasName}`] || []
}

// ---------------- Status kehadiran guru ----------------

// Logika murni status satu sel timetable — diuji di tests/jadwal-mengajar.mjs.
// "Tidak Hadir" hanya disimpulkan dari data: hari sudah lewat (atau jam hari
// ini sudah berakhir) tanpa sesi yang pernah dimulai.
export const statusGuruMurni = (input: {
  adaJadwal: boolean
  sesi: SesiDb | null
  posisi: 'lalu' | 'ini' | 'depan'
  menitKini: number
  mulai: number
  selesai: number
}): GuruStatus => {
  if (!input.adaJadwal) return 'Terjadwal'
  const s = input.sesi
  if (s?.status === 'berlangsung') return 'Berlangsung'
  if (s?.status === 'tidak_hadir') return 'Tidak Hadir'
  if (s?.startedAt) {
    const d = new Date(s.startedAt)
    const menitMulai = d.getHours() * 60 + d.getMinutes()
    return menitMulai > input.mulai + 10 ? 'Terlambat' : 'Hadir'
  }
  if (s?.status === 'selesai') return 'Hadir'
  if (input.posisi === 'depan') return 'Terjadwal'
  if (input.posisi === 'lalu') return 'Tidak Hadir'
  return input.menitKini >= input.selesai ? 'Tidak Hadir' : 'Terjadwal'
}

export const guruStatus = (
  level: Jenjang,
  kelasName: string,
  di: DayIndex,
  si: number,
  simDayIdx: number,
  simMin: number
): GuruStatus => {
  const les = stateV2.pelajaran.find(
    l => l.level === level && l.kelas === kelasName && l.di === di && si >= l.si && si <= l.siAkhir
  )
  if (!les) return 'Terjadwal'
  const posisi = di < simDayIdx ? 'lalu' : di > simDayIdx ? 'depan' : 'ini'
  const sesi = stateV2.sesi[kunciSesi(les.id, tanggalDariDi(di))] ?? null
  // Keterlambatan & akhir sesi dinilai dari rentang PELAJARAN (si..siAkhir),
  // bukan dari sel yang sedang dilihat — pelajaran 2 JP yang dimulai 08:52
  // untuk jam mulai 08:30 tetap terlambat di sel jam keduanya.
  const [mulai] = rentangSlot(level, les.si)
  const [, selesai] = rentangSlot(level, les.siAkhir)
  return statusGuruMurni({ adaJadwal: true, sesi, posisi, menitKini: simMin, mulai, selesai })
}
