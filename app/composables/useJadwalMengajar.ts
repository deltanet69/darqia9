import {
  stateV2, kunciSesi, isoTanggalLokal, tanggalDariDi,
  type Jenjang, type LessonItem, type SesiDb, type ClassMeta, type MapelMeta
} from '~/components/adminV2/jadwal-mengajar/jadwalV2Data'
import { bangunSlotJam, jamKeDariWaktu, setelanBawaan, type JadwalSetelan } from './useJadwalPelajaran'

// ================================================================
//  Pemuat & penulis data asli Jadwal Mengajar.
//  Membaca: jadwal_settings, classes, subjects, teachers, students,
//  class_schedules, teaching_sessions (minggu berjalan).
//  Menulis: teaching_sessions (Mulai/Selesai Mengajar) — tabel yang
//  sama yang dibaca penanda Jadwal Pelajaran & Rekap Mengajar.
// ================================================================

const jenjangDariGrade = (grade: string): Jenjang => (grade === 'SMP' ? 'smp' : 'smk')

// Peta referensi hasil muatSemua — dipakai ulang oleh muatJadwalUlang
// agar penyegaran setelah menyimpan jadwal cukup 2 query (jadwal + sesi),
// bukan mengulang seluruh data referensi.
let petaCache: {
  kelasById: Map<string, { id: string; name: string; grade: string; room: string | null }>
  mapelById: Map<string, { id: string; name: string }>
  guruById: Map<string, { id: string; name: string }>
  pola: Record<Jenjang, ReturnType<typeof bangunSlotJam>>
} | null = null

export function useJadwalMengajar() {
  const client = useSupabaseClient()

  const muatSemua = async (): Promise<void> => {
    // 1) Pola jam per jenjang dari jadwal_settings (bawaan bila belum ada)
    const pola: Record<Jenjang, ReturnType<typeof bangunSlotJam>> = { smp: [], smk: [] }
    const setelanPer: Record<Jenjang, JadwalSetelan> = { smp: setelanBawaan(), smk: setelanBawaan() }
    // Empat data referensi independen diambil paralel (satu gelombang)
    const [{ data: barisSetelan }, { data: barisGuru }, { data: barisKelas }, { data: barisMapel }] = await Promise.all([
      client.from('jadwal_settings').select('jenjang, config'),
      client.from('teachers').select('id, name, nip, grade').eq('active', true).order('name'),
      client.from('classes').select('id, name, grade, major, room, homeroom_teacher_id, academic_year').eq('active', true).order('name'),
      client.from('subjects').select('id, code, name, grade, category, kkm, hours_per_week').eq('active', true).order('name')
    ])
    for (const b of barisSetelan || []) {
      const cfg = (b as { config: JadwalSetelan }).config
      if (cfg && typeof cfg.mulai === 'string' && Array.isArray(cfg.istirahat)) {
        setelanPer[jenjangDariGrade((b as { jenjang: string }).jenjang)] = cfg
      }
    }
    for (const j of ['smp', 'smk'] as Jenjang[]) {
      pola[j] = bangunSlotJam(setelanPer[j])
      const jamSaja = pola[j].filter(s => s.jenis === 'jam')
      stateV2.polaSlot[j] = jamSaja.map(s => `${s.mulai}–${s.selesai}`)
      stateV2.polaJeda[j] = pola[j]
        .filter(s => s.jenis === 'istirahat')
        .map(s => {
          const sebelum = pola[j][pola[j].indexOf(s) - 1]
          const jamKe = sebelum && sebelum.jenis === 'jam' ? (sebelum.ke || 1) : 1
          return { setelahSi: jamKe - 1, label: s.label || 'Istirahat', rentang: `${s.mulai}–${s.selesai}` }
        })
    }

    // 2) Guru (untuk wali, daftar guru, dan pemetaan nama -> id)
    const guruSemua = (barisGuru || []) as Array<{ id: string; name: string; nip: string | null; grade: string }>
    const guruById = new Map(guruSemua.map(g => [g.id, g]))
    stateV2.idGuru = {}
    guruSemua.forEach(g => { stateV2.idGuru[g.name] = g.id })

    // 3) Kelas aktif — satu tahun ajaran (2026/2027 bila ada, selain itu terbaru)
    const kelasSemua = (barisKelas || []) as Array<{ id: string; name: string; grade: string; major: string | null; room: string | null; homeroom_teacher_id: string | null; academic_year: string }>
    const tahunTersedia = [...new Set(kelasSemua.map(k => k.academic_year))].sort()
    const tahun = tahunTersedia.includes('2026/2027') ? '2026/2027' : (tahunTersedia[tahunTersedia.length - 1] || '2026/2027')
    stateV2.tahunAjaran = tahun
    const kelasTahun = kelasSemua.filter(k => k.academic_year === tahun)
    const kelasIds = kelasTahun.map(k => k.id)
    const kelasById = new Map(kelasTahun.map(k => [k.id, k]))

    stateV2.idKelas = {}
    stateV2.waliDari = {}
    kelasTahun.forEach(k => {
      const j = jenjangDariGrade(k.grade)
      stateV2.idKelas[`${j}|${k.name}`] = k.id
      if (k.homeroom_teacher_id) stateV2.waliDari[`${j}|${k.name}`] = k.homeroom_teacher_id
    })

    // 4) Mapel per jenjang dari Master Mapel
    const mapelSemua = (barisMapel || []) as Array<{ id: string; code: string; name: string; grade: string; category: string | null; kkm: number | null; hours_per_week: number | null }>
    const mapelById = new Map(mapelSemua.map(m => [m.id, m]))
    stateV2.idMapel = {}
    stateV2.mapel.smp.length = 0
    stateV2.mapel.smk.length = 0 // isi ulang di tempat: KELAS/MAPEL di jadwalV2Data merujuk objek yang sama
    mapelSemua.forEach(m => {
      const j = jenjangDariGrade(m.grade)
      stateV2.idMapel[`${j}|${m.name}`] = m.id
      stateV2.mapel[j].push({ code: m.code, name: m.name, cat: m.category || '', kkm: m.kkm ?? 0, hours: m.hours_per_week ?? 0 } satisfies MapelMeta)
    })

    // 5) Siswa — roster per kelas + hitungan L/P untuk meta kelas
    // Hanya siswa aktif; diambil bertahap karena PostgREST membatasi 1000 baris per permintaan.
    const barisSiswa: any[] = []
    for (let dari = 0; kelasIds.length; dari += 1000) {
      const { data } = await client.from('students').select('nis, nisn, name, gender, class_id')
        .in('class_id', kelasIds).eq('active', true).order('name').order('id').range(dari, dari + 999)
      barisSiswa.push(...(data ?? []))
      if ((data?.length ?? 0) < 1000) break
    }
    const siswaSemua = barisSiswa as Array<{ nis: string | null; nisn: string; name: string; gender: string; class_id: string }>
    stateV2.roster = {}
    const hitungGender = new Map<string, { boys: number; girls: number }>()
    siswaSemua.forEach(s => {
      const k = kelasById.get(s.class_id)
      if (!k) return
      const j = jenjangDariGrade(k.grade)
      const kunci = `${j}|${k.name}`
      ;(stateV2.roster[kunci] ||= []).push({ name: s.name, gender: s.gender === 'P' ? 'P' : 'L', nis: s.nis || '', nisn: s.nisn })
      const h = hitungGender.get(k.id) || { boys: 0, girls: 0 }
      if (s.gender === 'P') h.girls++
      else h.boys++
      hitungGender.set(k.id, h)
    })

    // Meta kelas (setelah roster diketahui)
    stateV2.kelas.smp.length = 0
    stateV2.kelas.smk.length = 0
    kelasTahun.forEach(k => {
      const j = jenjangDariGrade(k.grade)
      const wali = k.homeroom_teacher_id ? guruById.get(k.homeroom_teacher_id) : undefined
      const h = hitungGender.get(k.id) || { boys: 0, girls: 0 }
      stateV2.kelas[j].push({
        name: k.name,
        major: k.major || '',
        room: k.room || '',
        wali: wali?.name || '',
        nip: wali?.nip || '',
        boys: h.boys,
        girls: h.girls
      } satisfies ClassMeta)
    })

    // Daftar guru per jenjang: guru se-jenjang/Yayasan + yang terjadwal di jenjang itu
    stateV2.guru = { smp: [], smk: [] }
    guruSemua.forEach(g => {
      if (g.grade === 'SMP') stateV2.guru.smp.push({ id: g.id, nama: g.name })
      else if (g.grade === 'SMK') stateV2.guru.smk.push({ id: g.id, nama: g.name })
      else {
        stateV2.guru.smp.push({ id: g.id, nama: g.name })
        stateV2.guru.smk.push({ id: g.id, nama: g.name })
      }
    })

    // 6) Jadwal + sesi minggu berjalan
    petaCache = { kelasById, mapelById, guruById, pola }
    await muatJadwalDanSesi(kelasById, mapelById, guruById, pola)
    stateV2.siap = true
  }

  const muatJadwalDanSesi = async (
    kelasById?: Map<string, { id: string; name: string; grade: string; room: string | null }>,
    mapelById?: Map<string, { id: string; name: string }>,
    guruById?: Map<string, { id: string; name: string }>,
    pola?: Record<Jenjang, ReturnType<typeof bangunSlotJam>>
  ): Promise<void> => {
    // Dipanggil ulang setelah simpan jadwal: pakai peta cache bila ada
    if (!kelasById || !mapelById || !guruById || !pola) {
      if (petaCache) {
        kelasById = petaCache.kelasById
        mapelById = petaCache.mapelById
        guruById = petaCache.guruById
        pola = petaCache.pola
        return muatJadwalDanSesi(kelasById, mapelById, guruById, pola)
      }
      const [k, m, g, s] = await Promise.all([
        client.from('classes').select('id, name, grade, room').eq('active', true),
        client.from('subjects').select('id, name'),
        client.from('teachers').select('id, name'),
        client.from('jadwal_settings').select('jenjang, config')
      ])
      kelasById = new Map(((k.data || []) as Array<{ id: string; name: string; grade: string; room: string | null }>).map(x => [x.id, x]))
      mapelById = new Map(((m.data || []) as Array<{ id: string; name: string }>).map(x => [x.id, x]))
      guruById = new Map(((g.data || []) as Array<{ id: string; name: string }>).map(x => [x.id, x]))
      pola = { smp: bangunSlotJam(setelanBawaan()), smk: bangunSlotJam(setelanBawaan()) }
      for (const b of (s.data || []) as Array<{ jenjang: string; config: JadwalSetelan }>) {
        if (b.config && typeof b.config.mulai === 'string') pola[jenjangDariGrade(b.jenjang)] = bangunSlotJam(b.config)
      }
    }
    const kelasIds = [...kelasById.keys()]
    const tahunKelasIds = kelasIds.filter(id => {
      const k = kelasById!.get(id)
      return k && stateV2.idKelas[`${jenjangDariGrade(k.grade)}|${k.name}`] === id
    })
    const ids = tahunKelasIds.length ? tahunKelasIds : kelasIds

    let q = client
      .from('class_schedules')
      .select('id, class_id, subject_id, teacher_id, day_of_week, starts_at, ends_at, room, notes')
      .eq('active', true)
    if (ids.length) q = q.in('class_id', ids)
    const { data: barisJadwal } = await q
    const pelajaran: LessonItem[] = []
    const terjadwal = new Set<string>()
    for (const b of (barisJadwal || []) as Array<{ id: string; class_id: string; subject_id: string; teacher_id: string; day_of_week: number; starts_at: string; ends_at: string; room: string | null; notes: string | null }>) {
      const k = kelasById.get(b.class_id)
      const m = mapelById.get(b.subject_id)
      const g = guruById.get(b.teacher_id)
      if (!k || !m || !g) continue
      if (b.day_of_week < 1 || b.day_of_week > 5) continue
      const j = jenjangDariGrade(k.grade)
      const rentang = jamKeDariWaktu(pola[j], b.starts_at, b.ends_at)
      if (!rentang) continue // di luar pola jam — diselaraskan dari Jadwal Pelajaran
      pelajaran.push({
        id: b.id,
        level: j,
        kelas: k.name,
        room: b.room || k.room || '',
        di: (b.day_of_week - 1) as LessonItem['di'],
        si: rentang.mulaiKe - 1,
        siAkhir: rentang.selesaiKe - 1,
        mapel: m.name,
        guru: g.name,
        ket: b.notes || undefined,
        classId: b.class_id,
        subjectId: b.subject_id,
        teacherId: b.teacher_id
      })
      terjadwal.add(b.teacher_id)
    }
    stateV2.pelajaran = pelajaran
    // Guru yang terjadwal di jenjang tetapi beda unit tetap muncul di daftar jenjang itu
    for (const les of pelajaran) {
      const daftar = stateV2.guru[les.level]
      if (!daftar.some(x => x.id === les.teacherId)) daftar.push({ id: les.teacherId, nama: les.guru })
    }

    // Sesi minggu berjalan (Senin–Jumat)
    const senin = tanggalDariDi(0)
    const jumat = tanggalDariDi(4)
    const { data: barisSesi } = await client
      .from('teaching_sessions')
      .select('schedule_id, session_date, started_at, ended_at, status, hadir, alpa')
      .gte('session_date', senin)
      .lte('session_date', jumat)
    stateV2.sesi = {}
    for (const s of (barisSesi || []) as Array<{ schedule_id: string; session_date: string; started_at: string | null; ended_at: string | null; status: SesiDb['status']; hadir: number | null; alpa: unknown }>) {
      stateV2.sesi[kunciSesi(s.schedule_id, s.session_date)] = {
        tanggal: s.session_date,
        status: s.status,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        hadir: s.hadir,
        alpa: Array.isArray(s.alpa) ? (s.alpa as string[]) : []
      }
    }
  }

  const muatJadwalUlang = async (): Promise<void> => {
    await muatJadwalDanSesi()
  }

  // Mulai Mengajar: upsert sesi hari ini untuk jadwal ini.
  // Kehadiran (hadir/alpa) ikut ditulis bila migrasi 0021 sudah jalan;
  // bila belum, sesi tetap tercatat dan fungsi melaporkan flag-nya.
  const mulaiSesi = async (les: LessonItem, hadir: number, alpa: string[]): Promise<{ ok: boolean; kehadiranTersimpan: boolean; pesan?: string }> => {
    const tanggal = isoTanggalLokal(new Date())
    const dasar = {
      schedule_id: les.id,
      teacher_id: les.teacherId,
      session_date: tanggal,
      started_at: new Date().toISOString(),
      status: 'berlangsung' as const
    }
    let kehadiranTersimpan = true
    const denganKehadiran = await client
      .from('teaching_sessions')
      .upsert({ ...dasar, hadir, alpa }, { onConflict: 'schedule_id,session_date' })
    if (denganKehadiran.error) {
      kehadiranTersimpan = false
      const cadangan = await client
        .from('teaching_sessions')
        .upsert(dasar, { onConflict: 'schedule_id,session_date' })
      if (cadangan.error) return { ok: false, kehadiranTersimpan: false, pesan: cadangan.error.message }
    }
    stateV2.sesi[kunciSesi(les.id, tanggal)] = {
      tanggal,
      status: 'berlangsung',
      startedAt: dasar.started_at,
      endedAt: null,
      hadir: kehadiranTersimpan ? hadir : null,
      alpa: kehadiranTersimpan ? alpa : []
    }
    return { ok: true, kehadiranTersimpan }
  }

  const selesaikanSesi = async (les: LessonItem): Promise<boolean> => {
    const tanggal = isoTanggalLokal(new Date())
    const kunci = kunciSesi(les.id, tanggal)
    const { error } = await client
      .from('teaching_sessions')
      .update({ status: 'selesai', ended_at: new Date().toISOString() })
      .eq('schedule_id', les.id)
      .eq('session_date', tanggal)
    if (error) return false
    const lama = stateV2.sesi[kunci]
    if (lama) {
      lama.status = 'selesai'
      lama.endedAt = new Date().toISOString()
    }
    return true
  }

  return { state: stateV2, muatSemua, muatJadwalUlang, mulaiSesi, selesaikanSesi }
}
