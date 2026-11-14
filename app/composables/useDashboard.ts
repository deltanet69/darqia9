// Data real Dashboard AdminV2 (brief aksesaplikasi.md). Dua versi:
// - Overview: Superadmin & peran pengawasan (angka sekolah per jenjang).
// - Guru: Guru Pengajar & Wali Kelas (rekap pribadi, jadwal mengajar, ujian miliknya).
// Kegagalan satu kartu tidak menggagalkan kartu lain: tiap kartu menyimpan galatnya sendiri.
import {
  HADIR, hariJadwalWib, kelompokkanUjian, persen, rekapAbsensi, rentangBulanWib, rupiah, tanggalPendek,
  tanggalWib, teksPolos, ujianMilikGuru,
  type BarisUjian, type RekapAbsensi, type TabUjian, type UjianMentah
} from './dashboardCore'

type Jenjang = 'SMP' | 'SMK'
export type BarisPengumuman = [string, string, string, string]
export interface BarisPembayaran { id: string, name: string, icon: string, amount: string, statusType: 'ok', statusLabel: string, date: string }
export interface JadwalHariIni {
  id: string, kelas: string, mapel: string, jam: string, mulai: string, ruang: string, classId: string, subjectId: string
  jenjang: 'smp' | 'smk', sesi: 'belum' | 'berlangsung' | 'selesai' | 'tidak_hadir'
}

const kosongUjian = (): Record<TabUjian, BarisUjian[]> => ({ harian: [], pts: [], pas: [] })

export const useDashboard = () => {
  const client = useSupabaseClient()

  const hitung = async (q: PromiseLike<{ count: number | null, error: any }>) => {
    const { count, error } = await q
    if (error) throw new Error(error.message)
    return count ?? 0
  }

  // Ujian CBT (PTS/PAS) + LMS (harian/PR) mulai hari ini, belum selesai/dibatalkan.
  const muatUjianMentah = async (grades: Jenjang[]): Promise<UjianMentah[]> => {
    const sejak = `${tanggalWib()}T00:00:00+07:00`
    const kolom = 'id, name, starts_at, status, class_id, subject_id, supervisor_id, classes(name), subjects(name)'
    const [cbt, lms] = await Promise.all([
      client.from('exams').select(`${kolom}, jenis`).in('grade', grades).gte('starts_at', sejak).not('status', 'in', '(selesai,dibatalkan)').order('starts_at').limit(200),
      client.from('ujian_harian').select(`${kolom}, tipe`).in('grade', grades).gte('starts_at', sejak).not('status', 'in', '(selesai,dibatalkan)').order('starts_at').limit(200)
    ])
    if (cbt.error) throw new Error(cbt.error.message)
    if (lms.error) throw new Error(lms.error.message)
    const ubah = (sumber: 'cbt' | 'lms') => (r: any): UjianMentah => ({
      id: r.id, name: r.name, starts_at: r.starts_at, status: r.status, sumber,
      jenis: sumber === 'cbt' ? (r.jenis ?? 'akhir') : (r.tipe ?? 'harian'),
      class_id: r.class_id, subject_id: r.subject_id, supervisor_id: r.supervisor_id,
      kelas: r.classes?.name ?? '-', mapel: r.subjects?.name ?? '-'
    })
    return [...(cbt.data ?? []).map(ubah('cbt')), ...(lms.data ?? []).map(ubah('lms'))]
  }

  const muatPengumuman = async (grades: Jenjang[], untukGuru: boolean): Promise<BarisPengumuman[]> => {
    let q = client.from('portal_information').select('judul, isi_html, tanggal, disematkan')
      .in('jenjang', grades).eq('status', 'Publish').is('deleted_at', null).in('target', ['Admin Portal', 'Keduanya'])
    if (untukGuru) q = q.in('audiens', ['Semua', 'Guru'])
    const { data, error } = await q.order('disematkan', { ascending: false }).order('tanggal', { ascending: false }).limit(4)
    if (error) throw new Error(error.message)
    return (data ?? []).map((r: any) => [r.disematkan ? 'i-shield' : 'i-doc', r.judul, teksPolos(r.isi_html || ''), tanggalPendek(r.tanggal)])
  }

  // ===== Overview =====
  const muatOverview = async (grade: Jenjang, denganKeuangan: boolean) => {
    const hariIni = tanggalWib()
    const [siswa, siswaHadir, rombel, guru, guruHadir, ujian, pengumuman, pembayaran, siswaTercatat, guruTercatat] = await Promise.allSettled([
      hitung(client.from('students').select('id', { count: 'exact', head: true }).eq('grade', grade).eq('active', true)),
      hitung(client.from('attendance').select('id, students!inner(grade)', { count: 'exact', head: true })
        .eq('students.grade', grade).eq('attendance_date', hariIni).in('status', HADIR)),
      hitung(client.from('classes').select('id', { count: 'exact', head: true }).eq('grade', grade).eq('active', true)),
      hitung(client.from('teachers').select('id', { count: 'exact', head: true }).eq('grade', grade).eq('active', true)),
      hitung(client.from('attendance').select('id, teachers!inner(grade)', { count: 'exact', head: true })
        .eq('teachers.grade', grade).eq('attendance_date', hariIni).in('status', HADIR)),
      muatUjianMentah([grade]).then(d => kelompokkanUjian(d)),
      muatPengumuman([grade], false),
      denganKeuangan
        ? client.from('keuangan_pembayaran').select('id, no_kwitansi, nis, nominal, keterangan, metode, tanggal, created_at')
          .eq('grade', grade).order('created_at', { ascending: false }).limit(5)
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return (data ?? []).map((r: any): BarisPembayaran => ({
              id: r.no_kwitansi || String(r.id).slice(0, 8).toUpperCase(),
              name: `${r.keterangan} · NIS ${r.nis}`, icon: 'i-wallet', amount: rupiah(Number(r.nominal)),
              statusType: 'ok', statusLabel: r.metode, date: tanggalPendek(r.created_at)
            }))
          })
        : Promise.resolve([] as BarisPembayaran[]),
      hitung(client.from('attendance').select('id, students!inner(grade)', { count: 'exact', head: true })
        .eq('students.grade', grade).eq('attendance_date', hariIni)),
      hitung(client.from('attendance').select('id, teachers!inner(grade)', { count: 'exact', head: true })
        .eq('teachers.grade', grade).eq('attendance_date', hariIni))
    ])
    const nilai = <T>(r: PromiseSettledResult<T>, cadangan: T) => r.status === 'fulfilled' ? r.value : cadangan
    const galat = [siswa, siswaHadir, rombel, guru, guruHadir, ujian, pengumuman, pembayaran, siswaTercatat, guruTercatat]
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected').map(r => String(r.reason?.message || r.reason))
    const nSiswa = nilai(siswa, 0), nSiswaHadir = nilai(siswaHadir, 0), nGuru = nilai(guru, 0), nGuruHadir = nilai(guruHadir, 0)
    return {
      siswa: nSiswa, siswaHadir: nSiswaHadir, siswaPct: persen(nSiswaHadir, nSiswa),
      rombel: nilai(rombel, 0),
      siswaTercatat: nilai(siswaTercatat, 0), guruTercatat: nilai(guruTercatat, 0),
      guru: nGuru, guruHadir: nGuruHadir, guruPct: persen(nGuruHadir, nGuru),
      ujian: nilai(ujian, kosongUjian()),
      pengumuman: nilai(pengumuman, [] as BarisPengumuman[]),
      pembayaran: nilai(pembayaran, [] as BarisPembayaran[]),
      galat
    }
  }

  // ===== Guru (pribadi) =====
  // Data pribadi tampil di semua jenjang tempat guru mengajar, tidak tergantung pilihan jenjang di header.
  const muatGuru = async (grade: Jenjang, guruId: string | null) => {
    if (!guruId) {
      return { tertaut: false, absensi: rekapAbsensi([]), jadwal: [] as JadwalHariIni[], ujian: kosongUjian(), pengumuman: await muatPengumuman([grade], true).catch(() => []), galat: [] as string[] }
    }
    const { awal, akhir } = rentangBulanWib()
    const hari = hariJadwalWib()
    const hariIni = tanggalWib()
    const [absensi, ajar, sesi] = await Promise.allSettled([
      client.from('attendance').select('status').eq('teacher_id', guruId).gte('attendance_date', awal).lte('attendance_date', akhir)
        .then(({ data, error }) => { if (error) throw new Error(error.message); return rekapAbsensi((data ?? []).map((r: any) => r.status)) }),
      client.from('class_schedules').select('id, class_id, subject_id, day_of_week, starts_at, ends_at, room, classes!inner(name, grade, active), subjects(name)')
        .eq('teacher_id', guruId).eq('active', true).eq('classes.active', true).order('starts_at')
        .then(({ data, error }) => { if (error) throw new Error(error.message); return data ?? [] }),
      client.from('teaching_sessions').select('schedule_id, status').eq('teacher_id', guruId).eq('session_date', hariIni)
        .then(({ data, error }) => { if (error) throw new Error(error.message); return data ?? [] })
    ])
    const daftarAjar: any[] = ajar.status === 'fulfilled' ? ajar.value : []
    const sesiHariIni = new Map((sesi.status === 'fulfilled' ? sesi.value : []).map((r: any) => [r.schedule_id, r.status]))
    // Jenjang tempat guru mengajar (pengumuman & ujian); bila belum berjadwal, jenjang aktif di header.
    const grades = [...new Set(daftarAjar.map(r => r.classes?.grade as Jenjang).filter(Boolean))]
    const jenjangGuru = grades.length ? grades : [grade]
    const [ujian, pengumuman] = await Promise.allSettled([muatUjianMentah(jenjangGuru), muatPengumuman(jenjangGuru, true)])
    const jadwal: JadwalHariIni[] = daftarAjar.filter(r => r.day_of_week === hari).map(r => ({
      id: r.id, kelas: r.classes?.name ?? '-', mapel: r.subjects?.name ?? '-',
      jam: `${String(r.starts_at).slice(0, 5)}–${String(r.ends_at).slice(0, 5)}`, mulai: String(r.starts_at).slice(0, 5),
      ruang: r.room ?? '', classId: r.class_id, subjectId: r.subject_id,
      jenjang: String(r.classes?.grade ?? grade).toLowerCase() as 'smp' | 'smk',
      sesi: (sesiHariIni.get(r.id) ?? 'belum') as JadwalHariIni['sesi']
    }))
    const galat = [absensi, ajar, sesi, ujian, pengumuman]
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected').map(r => String(r.reason?.message || r.reason))
    return {
      tertaut: true,
      absensi: absensi.status === 'fulfilled' ? absensi.value : rekapAbsensi([]) as RekapAbsensi,
      jadwal,
      ujian: ujian.status === 'fulfilled' ? kelompokkanUjian(ujianMilikGuru(ujian.value, guruId, daftarAjar)) : kosongUjian(),
      pengumuman: pengumuman.status === 'fulfilled' ? pengumuman.value : [],
      galat
    }
  }

  // Mulai Mengajar dari dashboard = tombol yang sama di Jadwal Mengajar: catat sesi hari ini (jendela ±10 menit
  // dijaga database, 0065), lalu buka Agenda Mengajar. Galat database dikembalikan apa adanya.
  const mulaiMengajar = async (scheduleId: string, guruId: string) => {
    const { error } = await client.from('teaching_sessions').upsert(
      { schedule_id: scheduleId, teacher_id: guruId, session_date: tanggalWib(), started_at: new Date().toISOString(), status: 'berlangsung' },
      { onConflict: 'schedule_id,session_date' })
    if (error) throw new Error(error.message)
  }

  return { muatOverview, muatGuru, mulaiMengajar }
}
