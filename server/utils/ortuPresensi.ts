// Presensi harian siswa untuk Portal Orang Tua. Kontrak tetap walau sumbernya berganti.
import type { PresensiHarian, StatusPresensi } from '../../app/types/ortu'

const DARI_ATTENDANCE: Record<string, StatusPresensi> = { tepat_waktu: 'tepat', terlambat: 'terlambat', alpa: 'alpa', izin: 'izin', sakit: 'sakit' }
const DARI_AGENDA: Record<string, StatusPresensi> = { A: 'alpa', I: 'izin', S: 'sakit' }
const PRIORITAS_AGENDA: StatusPresensi[] = ['alpa', 'izin', 'sakit']

const jamWib = (iso: string | null) => iso
  ? new Date(iso).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.')
  : null

// bulan = 'YYYY-MM'. Kosong = belum ada data bulan itu (UI menampilkan keadaan kosong, tanpa angka karangan).
export async function ambilPresensiHarian(db: any, studentId: string, bulan: string): Promise<PresensiHarian[]> {
  // TODO(rfid): /api/absensi/tap belum menyimpan ke tabel attendance; begitu tersambung data tap langsung terbaca di sini.
  const [y, m] = bulan.split('-').map(Number)
  const awal = `${bulan}-01`
  const akhir = `${bulan}-${String(new Date(y!, m!, 0).getDate()).padStart(2, '0')}`
  const [hadir, agenda] = await Promise.all([
    db.from('attendance').select('attendance_date, time_in, status').eq('student_id', studentId)
      .gte('attendance_date', awal).lte('attendance_date', akhir).order('attendance_date').limit(62),
    // S/I/A dari buku agenda guru (per pertemuan mapel) melengkapi hari yang belum punya data tap.
    db.from('agenda_kehadiran').select('buku_id, pertemuan_ke, status').eq('siswa_id', studentId).limit(1000)
  ])
  const hasil = new Map<string, PresensiHarian>()
  for (const r of hadir.data || []) {
    const status = DARI_ATTENDANCE[r.status]
    if (status) hasil.set(r.attendance_date, { tanggal: r.attendance_date, jamMasuk: jamWib(r.time_in), status })
  }
  const dariTap = new Set(hasil.keys())
  const baris = agenda.data || []
  if (baris.length) {
    const buku = [...new Set(baris.map((r: any) => r.buku_id))]
    const { data: pertemuan } = await db.from('agenda_pertemuan').select('buku_id, pertemuan_ke, tanggal')
      .in('buku_id', buku).gte('tanggal', awal).lte('tanggal', akhir).limit(2000)
    const tanggal = new Map<string, string>((pertemuan || []).map((p: any) => [`${p.buku_id}|${p.pertemuan_ke}`, p.tanggal]))
    for (const r of baris) {
      const t = tanggal.get(`${r.buku_id}|${r.pertemuan_ke}`)
      const status = DARI_AGENDA[r.status]
      if (!t || !status) continue
      if (dariTap.has(t)) continue // data tap gerbang menang
      const ada = hasil.get(t)
      if (!ada || PRIORITAS_AGENDA.indexOf(status) < PRIORITAS_AGENDA.indexOf(ada.status)) hasil.set(t, { tanggal: t, jamMasuk: null, status })
    }
  }
  return [...hasil.values()].sort((a, b) => a.tanggal.localeCompare(b.tanggal))
}
