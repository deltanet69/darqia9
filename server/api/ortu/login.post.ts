import { buatPembatas } from '../../utils/pembatas'
import { buatSesiOrtu, catatLogOrtu, jenjangDomainOrtu, klienOrtu } from '../../utils/ortuSesi'
import { cocokSandiOrtu, hashTiruanOrtu } from '../../utils/ortuSandi'

const PESAN_SALAH = 'NIS/NISN atau kata sandi tidak cocok.'
const PESAN_BATAS = 'Terlalu banyak percobaan masuk yang salah. Coba lagi dalam beberapa menit.'
// Sama dengan CBT siswa: per NIS ketat, per IP longgar (satu sekolah bisa berbagi satu IP).
const batasNis = buatPembatas(8, 5 * 60_000)
const batasIp = buatPembatas(300, 5 * 60_000)
const GAGAL_KUNCI = 10
const LAMA_KUNCI_MS = 15 * 60_000

// POST /api/ortu/login — NIS atau NISN anak + kata sandi. Galat selalu generik agar keberadaan NIS tidak bisa ditebak.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const b = await readBody(event).catch(() => null) as Record<string, unknown> | null
  const nis = typeof b?.nis === 'string' ? b.nis.trim() : ''
  const sandi = typeof b?.password === 'string' ? b.password : ''
  // Di domain parent.<sekolah> jenjang mengikuti domain; di localhost/staging dari body.
  const grade = jenjangDomainOrtu(event) ?? (b?.grade === 'SMP' || b?.grade === 'SMK' ? b.grade : null)
  if (!nis || nis.length > 30 || !/^[0-9A-Za-z-]+$/.test(nis) || !sandi || sandi.length > 200 || !grade) {
    throw createError({ statusCode: 400, statusMessage: 'Isi NIS/NISN dan kata sandi dengan benar.' })
  }
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'tak-dikenal'
  const kunciNis = `${grade}:${nis}`
  if (batasNis.terblokir(kunciNis) || batasIp.terblokir(ip)) throw createError({ statusCode: 429, statusMessage: PESAN_BATAS })

  const db = klienOrtu(event)
  const { data, error } = await db.rpc('parent_login_cek', { p_nis: nis, p_grade: grade })
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42883') throw createError({ statusCode: 503, statusMessage: 'Portal belum siap. Hubungi pengelola untuk menerapkan migrasi 0080.' })
    throw createError({ statusCode: 500, statusMessage: 'Terjadi gangguan di server. Coba lagi sebentar lagi.' })
  }
  const akun = (Array.isArray(data) ? data[0] : data) as { student_id: string, password_hash: string, must_change_password: boolean, failed_count: number, locked_until: string | null } | undefined
  const gagal = () => { batasNis.catat(kunciNis); batasIp.catat(ip); return createError({ statusCode: 401, statusMessage: PESAN_SALAH }) }

  if (!akun) {
    await cocokSandiOrtu(sandi, await hashTiruanOrtu()) // samakan waktu jawaban dengan akun yang ada
    throw gagal()
  }
  if (akun.locked_until && new Date(akun.locked_until).getTime() > Date.now()) throw createError({ statusCode: 429, statusMessage: PESAN_BATAS })

  if (!(await cocokSandiOrtu(sandi, akun.password_hash))) {
    const n = (akun.failed_count || 0) + 1
    await db.from('parent_accounts').update(n >= GAGAL_KUNCI
      ? { failed_count: 0, locked_until: new Date(Date.now() + LAMA_KUNCI_MS).toISOString() }
      : { failed_count: n }).eq('student_id', akun.student_id)
    throw gagal()
  }

  batasNis.hapus(kunciNis)
  await db.from('parent_accounts').update({ failed_count: 0, locked_until: null, last_login_at: new Date().toISOString() }).eq('student_id', akun.student_id)
  await buatSesiOrtu(event, db, akun.student_id)
  // Yang diketik bisa NISN; sesi & log memakai NIS asli siswa.
  const { data: s } = await db.from('students').select('name, nis').eq('id', akun.student_id).maybeSingle()
  const masuk = { nis: s?.nis || nis, nama: s?.name || '', grade }
  await catatLogOrtu(db, masuk, 'masuk')
  return { nis: masuk.nis, nama: masuk.nama, jenjang: grade, wajibGanti: !!akun.must_change_password }
})
