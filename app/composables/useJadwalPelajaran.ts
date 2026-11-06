// Jadwal Pelajaran (Akademik) — satu-satunya penulis tabel class_schedules.
// Data induk dibaca apa adanya: kelas (classes), mapel (subjects, termasuk KKM),
// guru (teachers). Pola jam & istirahat per jenjang disimpan di jadwal_settings
// (migrasi 0020); status sesi harian dibaca dari teaching_sessions yang ditulis
// tombol Mulai/Selesai Mengajar guru di halaman Jadwal Mengajar.

export interface IstirahatSetelan { setelah: number; durasi: number; label: string }
export interface JadwalSetelan { mulai: string; durasiJP: number; jumlahJam: number; istirahat: IstirahatSetelan[] }
export interface SlotJam { jenis: 'jam' | 'istirahat'; ke?: number; label?: string; mulai: string; selesai: string }

export interface JadwalKelas {
  id: string; name: string; grade: 'SMP' | 'SMK'; major: string; academicYear: string
  tingkat: string; waliKelas: string; jumlahSiswa: number
}
export interface JadwalMapel { id: string; name: string; kkm: number; hoursPerWeek: number; warna: string }
export interface JadwalGuru { id: string; name: string; unit: string }
export interface JadwalEntri {
  id: string; classId: string; subjectId: string; teacherId: string
  day: number; startsAt: string; endsAt: string; room: string; notes: string
  mulaiKe: number | null; selesaiKe: number | null
}
export interface SesiHariIni { status: 'belum' | 'berlangsung' | 'selesai' | 'tidak_hadir'; startedAt: string | null; endedAt: string | null }
export interface BentrokHasil { guru: JadwalEntri | null; kelas: JadwalEntri | null; ruangan: JadwalEntri | null }

export const HARI_NAMA = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export const setelanBawaan = (): JadwalSetelan => ({
  mulai: '07:00',
  durasiJP: 45,
  jumlahJam: 8,
  istirahat: [
    { setelah: 4, durasi: 20, label: 'Istirahat' },
    { setelah: 6, durasi: 40, label: 'Istirahat & Shalat' }
  ]
})

export const menitDariJam = (jam: string): number => {
  const [a, b] = String(jam).slice(0, 5).split(':').map(Number)
  return (a || 0) * 60 + (b || 0)
}
export const jamDariMenit = (menit: number): string =>
  `${String(Math.floor(menit / 60)).padStart(2, '0')}:${String(menit % 60).padStart(2, '0')}`

// Susun slot jam pelajaran + jeda istirahat dari setelan.
export const bangunSlotJam = (setelan: JadwalSetelan): SlotJam[] => {
  const slot: SlotJam[] = []
  let t = menitDariJam(setelan.mulai)
  for (let ke = 1; ke <= setelan.jumlahJam; ke++) {
    const m0 = t; t += setelan.durasiJP
    slot.push({ jenis: 'jam', ke, mulai: jamDariMenit(m0), selesai: jamDariMenit(t) })
    const jeda = setelan.istirahat.find(i => i.setelah === ke)
    if (jeda && ke < setelan.jumlahJam) {
      const j0 = t; t += jeda.durasi
      slot.push({ jenis: 'istirahat', label: jeda.label, mulai: jamDariMenit(j0), selesai: jamDariMenit(t) })
    }
  }
  return slot
}

// Jam ke- (rentang) -> waktu mulai/selesai menurut pola.
export const waktuDariJamKe = (slots: SlotJam[], mulaiKe: number, selesaiKe: number): { startsAt: string; endsAt: string } | null => {
  const a = slots.find(s => s.ke === mulaiKe)
  const b = slots.find(s => s.ke === selesaiKe)
  if (!a || !b) return null
  return { startsAt: a.mulai, endsAt: b.selesai }
}

// Waktu tersimpan -> jam ke- menurut pola aktif. Null bila jadwal tidak
// mengikuti pola (data lama / pola berubah) — ditandai, bukan dibuang.
export const jamKeDariWaktu = (slots: SlotJam[], startsAt: string, endsAt: string): { mulaiKe: number; selesaiKe: number } | null => {
  const a = slots.find(s => s.jenis === 'jam' && s.mulai === String(startsAt).slice(0, 5))
  const b = slots.find(s => s.jenis === 'jam' && s.selesai === String(endsAt).slice(0, 5))
  if (!a?.ke || !b?.ke || b.ke < a.ke) return null
  return { mulaiKe: a.ke, selesaiKe: b.ke }
}

export const rentangTumpangTindih = (aMulai: string, aSelesai: string, bMulai: string, bSelesai: string): boolean =>
  menitDariJam(aMulai) < menitDariJam(bSelesai) && menitDariJam(bMulai) < menitDariJam(aSelesai)

// Mesin anti-bentrok: guru yang sama, kelas yang sama, atau ruangan yang sama
// pada hari yang sama dengan rentang waktu tumpang tindih.
export const cariBentrok = (
  daftar: JadwalEntri[],
  kandidat: { classId: string; teacherId: string; day: number; startsAt: string; endsAt: string; room: string },
  abaikanId?: string
): BentrokHasil => {
  const hasil: BentrokHasil = { guru: null, kelas: null, ruangan: null }
  const ruang = (kandidat.room || '').trim().toLowerCase()
  for (const j of daftar) {
    if (j.id === abaikanId || j.day !== kandidat.day) continue
    if (!rentangTumpangTindih(kandidat.startsAt, kandidat.endsAt, j.startsAt, j.endsAt)) continue
    if (j.teacherId === kandidat.teacherId && !hasil.guru) hasil.guru = j
    if (j.classId === kandidat.classId && !hasil.kelas) hasil.kelas = j
    if (ruang && (j.room || '').trim().toLowerCase() === ruang && j.classId !== kandidat.classId && !hasil.ruangan) hasil.ruangan = j
  }
  return hasil
}

// Tingkat/angkatan dibaca dari awalan nama kelas resmi ("X TKJ 1", "VII A").
export const tingkatDariNamaKelas = (nama: string): string => {
  const teks = String(nama).trim().toUpperCase()
  const cocok = teks.match(/^(XII|XI|IX|VIII|VII|X)(?=[\s-]|$)/)
  if (cocok) return cocok[1]
  // Penamaan angka, mis. "7.1" atau "8 A" (tingkat 7-12).
  const angka = teks.match(/^(\d{1,2})(?=[\s.\-]|$)/)
  return angka ? ({ 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII' } as Record<number, string>)[Number(angka[1])] ?? '' : ''
}

const PALET_MAPEL = ['#2563EB', '#0F766E', '#B45309', '#7C3AED', '#C2410C', '#047857', '#BE185D', '#334155', '#9333EA', '#0369A1']
export const warnaMapel = (nama: string): string => {
  let h = 0
  for (let i = 0; i < nama.length; i++) h = (h * 31 + nama.charCodeAt(i)) >>> 0
  return PALET_MAPEL[h % PALET_MAPEL.length]
}

// Jam pelajaran yang sedang berlangsung pada pukul tertentu (untuk penanda).
export const jamBerlangsung = (slots: SlotJam[], pukul: string): SlotJam | null => {
  const t = menitDariJam(pukul)
  return slots.find(s => menitDariJam(s.mulai) <= t && t < menitDariJam(s.selesai)) ?? null
}

// Jumlah kejadian satu hari-dalam-seminggu di rentang tanggal (untuk rekap).
export const hitungKejadian = (dayOfWeek: number, dari: string, sampai: string): number => {
  const awal = new Date(`${dari}T00:00:00`)
  const akhir = new Date(`${sampai}T00:00:00`)
  if (Number.isNaN(awal.getTime()) || Number.isNaN(akhir.getTime()) || akhir < awal) return 0
  let jumlah = 0
  const kursor = new Date(awal)
  while (kursor <= akhir) {
    const jsDay = kursor.getDay() // 0 Minggu .. 6 Sabtu
    const dow = jsDay === 0 ? 7 : jsDay
    if (dow === dayOfWeek) jumlah++
    kursor.setDate(kursor.getDate() + 1)
  }
  return jumlah
}

export interface EntriInput {
  classId: string; subjectId: string; teacherId: string
  day: number; mulaiKe: number; selesaiKe: number; room: string; notes: string
}

export const useJadwalPelajaran = () => {
  const client = useSupabaseClient()
  const kelasList = useState<JadwalKelas[]>('jadwal-kelas', () => [])
  const mapelList = useState<JadwalMapel[]>('jadwal-mapel', () => [])
  const guruList = useState<JadwalGuru[]>('jadwal-guru', () => [])
  const entriList = useState<JadwalEntri[]>('jadwal-entri', () => [])
  const sesiMap = useState<Record<string, SesiHariIni>>('jadwal-sesi-hari-ini', () => ({}))
  const setelanDb = useState<JadwalSetelan>('jadwal-setelan', () => setelanBawaan())
  const setelanTersimpan = useState<boolean>('jadwal-setelan-tersimpan', () => false)
  const loading = useState('jadwal-loading', () => false)
  const error = useState<string | null>('jadwal-error', () => null)

  const tanggalHariIni = (): string => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const petakanEntri = (rows: any[], slots: SlotJam[]): JadwalEntri[] => (rows ?? []).map((row: any) => {
    const peta = jamKeDariWaktu(slots, row.starts_at, row.ends_at)
    return {
      id: row.id,
      classId: row.class_id,
      subjectId: row.subject_id,
      teacherId: row.teacher_id,
      day: row.day_of_week,
      startsAt: String(row.starts_at).slice(0, 5),
      endsAt: String(row.ends_at).slice(0, 5),
      room: row.room ?? '',
      notes: row.notes ?? '',
      mulaiKe: peta?.mulaiKe ?? null,
      selesaiKe: peta?.selesaiKe ?? null
    }
  })

  const muatJadwal = async (grade: 'SMP' | 'SMK', classIds: string[], slots: SlotJam[]) => {
    if (!classIds.length) { entriList.value = []; return }
    const { data, error: err } = await client
      .from('class_schedules')
      .select('id, class_id, subject_id, teacher_id, day_of_week, starts_at, ends_at, room, notes')
      .eq('active', true)
      .in('class_id', classIds)
      .order('day_of_week')
    if (err) {
      // Kolom notes belum ada (migrasi 0020 belum jalan): baca tanpa notes.
      if (String(err.message).includes('notes')) {
        const ulang = await client
          .from('class_schedules')
          .select('id, class_id, subject_id, teacher_id, day_of_week, starts_at, ends_at, room')
          .eq('active', true)
          .in('class_id', classIds)
          .order('day_of_week')
        if (!ulang.error) { entriList.value = petakanEntri(ulang.data ?? [], slots); return }
      }
      throw err
    }
    entriList.value = petakanEntri(data ?? [], slots)
  }

  const muatSesiHariIni = async () => {
    const { data, error: err } = await client
      .from('teaching_sessions')
      .select('schedule_id, status, started_at, ended_at')
      .eq('session_date', tanggalHariIni())
    if (err) { sesiMap.value = {}; return } // tabel belum ada / kosong: tanpa penanda
    const fmt = (v: string | null) => v ? new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':') : null
    const peta: Record<string, SesiHariIni> = {}
    for (const row of data ?? []) {
      peta[row.schedule_id] = { status: row.status, startedAt: fmt(row.started_at), endedAt: fmt(row.ended_at) }
    }
    sesiMap.value = peta
  }

  const load = async (grade: 'SMP' | 'SMK') => {
    loading.value = true
    error.value = null
    try {
      const [kelasRes, mapelRes, guruRes, setelanRes] = await Promise.all([
        client.from('classes').select('id, name, grade, major, academic_year, teachers(name)').eq('active', true).eq('grade', grade).order('name'),
        client.from('subjects').select('id, name, kkm, hours_per_week').eq('active', true).eq('grade', grade).order('name'),
        client.from('teachers').select('id, name, grade').eq('active', true).in('grade', [grade, 'Yayasan']).order('name'),
        client.from('jadwal_settings').select('config').eq('jenjang', grade).maybeSingle()
      ])
      if (kelasRes.error) throw kelasRes.error
      if (mapelRes.error) throw mapelRes.error
      if (guruRes.error) throw guruRes.error

      if (!setelanRes.error && setelanRes.data?.config) {
        const cfg = setelanRes.data.config as JadwalSetelan
        setelanDb.value = { ...setelanBawaan(), ...cfg, istirahat: Array.isArray(cfg.istirahat) ? cfg.istirahat : setelanBawaan().istirahat }
        setelanTersimpan.value = true
      } else {
        setelanDb.value = setelanBawaan()
        setelanTersimpan.value = false
      }
      const slots = bangunSlotJam(setelanDb.value)

      const kelasRows = kelasRes.data ?? []
      const hitungSiswa = new Map<string, number>()
      if (kelasRows.length) {
        const siswaRes = await client.from('students').select('class_id').eq('active', true).in('class_id', kelasRows.map((k: any) => k.id))
        for (const s of siswaRes.data ?? []) hitungSiswa.set(s.class_id, (hitungSiswa.get(s.class_id) ?? 0) + 1)
      }
      kelasList.value = kelasRows.map((row: any) => ({
        id: row.id,
        name: row.name,
        grade: row.grade,
        major: row.major ?? '',
        academicYear: row.academic_year,
        tingkat: tingkatDariNamaKelas(row.name),
        waliKelas: (row as any).teachers?.name ?? '',
        jumlahSiswa: hitungSiswa.get(row.id) ?? 0
      }))
      mapelList.value = (mapelRes.data ?? []).map((row: any) => ({
        id: row.id, name: row.name, kkm: row.kkm, hoursPerWeek: row.hours_per_week, warna: warnaMapel(row.name)
      }))
      guruList.value = (guruRes.data ?? []).map((row: any) => ({ id: row.id, name: row.name, unit: row.grade }))

      await muatJadwal(grade, kelasList.value.map(k => k.id), slots)
      await muatSesiHariIni()
    } catch (e: any) {
      error.value = e?.message ?? 'Gagal memuat data jadwal.'
    } finally {
      loading.value = false
    }
  }

  const simpanEntri = async (grade: 'SMP' | 'SMK', input: EntriInput, id?: string) => {
    const slots = bangunSlotJam(setelanDb.value)
    const waktu = waktuDariJamKe(slots, input.mulaiKe, input.selesaiKe)
    if (!waktu) throw new Error('Rentang jam tidak sesuai pola jam pelajaran.')
    const bentrok = cariBentrok(entriList.value, {
      classId: input.classId, teacherId: input.teacherId, day: input.day,
      startsAt: waktu.startsAt, endsAt: waktu.endsAt, room: input.room
    }, id)
    if (bentrok.guru || bentrok.kelas || bentrok.ruangan) {
      throw new Error('Jadwal bentrok terdeteksi — periksa kembali pilihan guru, kelas, dan ruangan.')
    }
    const payload: Record<string, any> = {
      class_id: input.classId, subject_id: input.subjectId, teacher_id: input.teacherId,
      day_of_week: input.day, starts_at: waktu.startsAt, ends_at: waktu.endsAt,
      room: input.room || null
    }
    const kirim = async (denganNotes: boolean) => {
      const p = { ...payload }
      if (denganNotes) p.notes = input.notes || null
      return id
        ? client.from('class_schedules').update(p).eq('id', id)
        : client.from('class_schedules').insert(p)
    }
    let hasil = await kirim(true)
    if (hasil.error && String(hasil.error.message).includes('notes')) hasil = await kirim(false)
    if (hasil.error) {
      if ((hasil.error as any).code === '23505') throw new Error('Kelas ini sudah memiliki jadwal pada hari dan jam mulai yang sama.')
      throw hasil.error
    }
    await muatJadwal(grade, kelasList.value.map(k => k.id), slots)
  }

  const hapusEntri = async (grade: 'SMP' | 'SMK', id: string) => {
    const { error: err } = await client.from('class_schedules').delete().eq('id', id)
    if (err) throw err
    await muatJadwal(grade, kelasList.value.map(k => k.id), bangunSlotJam(setelanDb.value))
  }

  const simpanSetelan = async (grade: 'SMP' | 'SMK', setelan: JadwalSetelan) => {
    const { error: err } = await client
      .from('jadwal_settings')
      .upsert({ jenjang: grade, config: setelan, updated_at: new Date().toISOString() }, { onConflict: 'jenjang' })
    if (err) {
      if (String(err.message).includes('jadwal_settings')) {
        throw new Error('Tabel pengaturan belum tersedia. Jalankan migrasi 0020_jadwal_pelajaran.sql di Supabase terlebih dahulu.')
      }
      throw err
    }
    setelanDb.value = setelan
    setelanTersimpan.value = true
    await muatJadwal(grade, kelasList.value.map(k => k.id), bangunSlotJam(setelan))
  }

  return {
    kelasList, mapelList, guruList, entriList, sesiMap,
    setelanDb, setelanTersimpan, loading, error,
    load, simpanEntri, hapusEntri, simpanSetelan, muatSesiHariIni, tanggalHariIni
  }
}
