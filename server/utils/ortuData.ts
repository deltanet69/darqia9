// Pemuat data bersama endpoint /api/ortu/*. Kolom selalu eksplisit: NIK/No. KK (nik, family_card_number,
// father_nik, mother_nik) tidak pernah dipilih, jadi tidak mungkin ikut ke respons.
import { hitungSiswa, namaItem, type Grade, type ItemBayar, type RekapBayar } from '../../app/composables/keuanganCore'
import { jenisUjian, semesterDari, tingkatOrtu } from '../../app/composables/ortuCore'
import { tanggalWib } from '../../app/composables/dashboardCore'
import { formatTtl } from '../../app/utils/cbtKartuCetak'
import type { BayarOrtu, SiswaOrtu, TingkatOrtu, UjianOrtu } from '../../app/types/ortu'

export const KOLOM_SISWA_ORTU = 'name, nis, nisn, birth_place, birth_date, grade, class_id, student_status, attendance_pct, exam_eligible, father_name, mother_name'

export async function muatSiswaOrtu(db: any, studentId: string, kolomTambahan = ''): Promise<{ siswa: SiswaOrtu, baris: any }> {
  const { data: s, error } = await db.from('students').select(KOLOM_SISWA_ORTU + (kolomTambahan ? `, ${kolomTambahan}` : '')).eq('id', studentId).maybeSingle()
  if (error || !s) throw createError({ statusCode: 500, statusMessage: 'Data siswa gagal dimuat.' })
  const kelas = s.class_id ? (await db.from('classes').select('name, academic_year, major').eq('id', s.class_id).maybeSingle()).data : null
  const sem = semesterDari(tanggalWib())
  return {
    baris: s,
    siswa: {
      nama: s.name, nis: s.nis || '', nisn: s.nisn || '', ttl: formatTtl(s.birth_place, s.birth_date),
      kelas: kelas?.name || 'Tanpa kelas', jurusan: kelas?.major || '',
      tahunAjaran: kelas?.academic_year || sem.tahunAjaran, semester: sem.label, status: s.student_status || 'Aktif'
    }
  }
}

// Persen kehadiran hanya dari students.attendance_pct; 0/kosong = belum ada data (bukan "0% hadir").
export const persenHadir = (s: any): number | null => Number(s?.attendance_pct) > 0 ? Number(s.attendance_pct) : null

// Ujian semester berjalan, terbaru dulu. Aturan nilai & H-2 PTS/PAS ada di fungsi database parent_nilai (0080).
export async function muatUjianOrtu(db: any, studentId: string): Promise<UjianOrtu[]> {
  const { data, error } = await db.rpc('parent_nilai', { p_student_id: studentId })
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42883') throw createError({ statusCode: 503, statusMessage: 'Portal belum siap. Hubungi pengelola untuk menerapkan migrasi 0080.' })
    throw createError({ statusCode: 500, statusMessage: 'Nilai gagal dimuat.' })
  }
  const sem = semesterDari(tanggalWib())
  const hasil: UjianOrtu[] = []
  for (const u of (data || []) as any[]) {
    const jenis = jenisUjian(u.jenis)
    const tanggal = tanggalWib(new Date(u.mulai))
    if (!jenis || tanggal < sem.dari || tanggal > sem.sampai) continue
    const total = Number(u.total) || 0
    const benar = Number(u.benar) || 0
    const menunggu = Number(u.menunggu) || 0
    hasil.push({
      id: u.id, jenis, mapelId: u.mapelId ?? null, mapel: u.mapel ?? null, tanggal: u.mulai, selesai: !!u.selesai, tidakIkut: !!u.tidakIkut,
      total, benar, menunggu, salah: Math.max(0, total - benar - menunggu), nilai: u.nilai === null || u.nilai === undefined ? null : Number(u.nilai)
    })
  }
  return hasil
}

// Rata-rata nilai ujian yang sudah selesai (skala 0–100), null bila belum ada.
export const rataUjian = (ujian: UjianOrtu[]): number | null => {
  const n = ujian.filter(u => u.selesai && u.nilai !== null).map(u => u.nilai!)
  return n.length ? n.reduce((a, b) => a + b, 0) / n.length : null
}

const KOL_PEMBAYARAN = 'id, no_kwitansi, tanggal, metode, nominal, keterangan'

// Tagihan per tingkat + riwayat bayar. Rumus SAMA dengan modul Keuangan admin (useKeuangan.barisSiswa):
// paket (keuangan_siswa -> keuangan_paket) + tambahan, rekap dari view keuangan_rekap, lalu hitungSiswa.
export async function muatTagihanOrtu(db: any, grade: Grade, nis: string, denganRiwayat: boolean): Promise<{ kode: string, paket: string, tingkat: TingkatOrtu[], riwayat: BayarOrtu[], dirilisPada: Array<{ tingkat: number, pada: string }> }> {
  const rekapQ = (kolom: string) => db.from('keuangan_rekap').select(kolom).eq('grade', grade).eq('nis', nis)
  const [tetapRes, rekapAwal, rilisRes, bayarRes] = await Promise.all([
    db.from('keuangan_siswa').select('kode, tambahan_1, tambahan_2, tambahan_3, tambahan_akhir').eq('grade', grade).eq('nis', nis).maybeSingle(),
    rekapQ('tingkat, dibayar, terarah'),
    db.from('keuangan_rilis_tagihan').select('tingkat, dirilis_pada').eq('grade', grade).eq('nis', nis),
    denganRiwayat
      ? db.from('keuangan_pembayaran').select(KOL_PEMBAYARAN).eq('grade', grade).eq('nis', nis).is('dihapus_pada', null)
        .order('tanggal', { ascending: false }).order('created_at', { ascending: false }).limit(50)
      : Promise.resolve({ data: [], error: null })
  ])
  // Pra-migrasi 0046 kolom terarah belum ada: ulangi tanpa kolom itu (sama seperti useKeuangan.kueriRekap).
  const rekapRes = rekapAwal.error && /terarah/i.test(String(rekapAwal.error.message || '')) ? await rekapQ('tingkat, dibayar') : rekapAwal
  for (const r of [tetapRes, rekapRes, bayarRes]) {
    if (r.error) throw createError({ statusCode: 500, statusMessage: 'Data administrasi gagal dimuat.' })
  }
  const tetap = tetapRes.data
  const paketRow = tetap?.kode
    ? (await db.from('keuangan_paket').select('kode, nama, grade, nominal_1, nominal_2, nominal_3, nominal_akhir, aktif').eq('kode', tetap.kode).maybeSingle()).data
    : null
  const paket = paketRow ? { kode: paketRow.kode, nama: paketRow.nama, grade: paketRow.grade, nominal: [paketRow.nominal_1, paketRow.nominal_2, paketRow.nominal_3, paketRow.nominal_akhir] as [number, number, number, number], aktif: paketRow.aktif } : undefined
  const tambahan = tetap ? [tetap.tambahan_1, tetap.tambahan_2, tetap.tambahan_3, tetap.tambahan_akhir] : [0, 0, 0, 0]
  const rekap: RekapBayar[] = (rekapRes.data || []).map((r: any) => ({ nis, tingkat: r.tingkat, dibayar: Number(r.dibayar), terarah: !!r.terarah }))
  const hitung = hitungSiswa(paket, tambahan, rekap)
  const rilis = rilisRes.error ? [] : (rilisRes.data || []) as any[]
  const tingkat = tingkatOrtu(grade, hitung, new Set(rilis.map(r => r.tingkat)))

  const bayar = (bayarRes.data || []) as any[]
  const items = new Map<string, ItemBayar[]>()
  if (bayar.length) {
    const ambil = (kolom: string) => db.from('keuangan_pembayaran_item').select(kolom).in('pembayaran_id', bayar.map(b => b.id)).order('urutan')
    let { data, error } = await ambil('pembayaran_id, keterangan, nominal, tingkat')
    if (error && /tingkat/i.test(String(error.message || ''))) ({ data, error } = await ambil('pembayaran_id, keterangan, nominal'))
    for (const it of (error ? [] : data || []) as any[]) {
      const daftar = items.get(it.pembayaran_id) || []
      daftar.push({ keterangan: it.keterangan, nominal: Number(it.nominal), tingkat: it.tingkat ?? null })
      items.set(it.pembayaran_id, daftar)
    }
  }
  const riwayat: BayarOrtu[] = bayar.map(b => ({
    no: b.no_kwitansi, tanggal: b.tanggal, metode: b.metode, nominal: Number(b.nominal),
    items: (items.get(b.id) || [{ keterangan: b.keterangan, nominal: Number(b.nominal), tingkat: null }]).map(i => ({ nama: namaItem(i, grade), nominal: i.nominal }))
  }))
  return {
    kode: tetap?.kode || '', paket: paket?.nama || '', tingkat, riwayat,
    dirilisPada: rilis.map(r => ({ tingkat: r.tingkat, pada: r.dirilis_pada }))
  }
}
