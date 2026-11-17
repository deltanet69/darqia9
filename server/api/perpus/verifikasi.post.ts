// POST /api/perpus/verifikasi { nomor } — langkah 2 login: cocokkan NIS atau NISN (salah satu) ke siswa aktif
// pada jenjang domain, lalu simpan kaitan akun Google dengan siswa. Satu siswa satu akun: bila NIS sudah terhubung
// ke akun Google lain (reset), wajib verifikasi lengkap NIS + NISN + tanggal lahir. Kegagalan memakai satu pesan umum.
import { buatPembatas } from '../../utils/pembatas'
import { klienPerpus, jenjangDomain, lupakanToken, penggunaPerpus, siswaAktif } from '../../utils/perpus'

const batasUser = buatPembatas(6, 10 * 60_000)
const batasIp = buatPembatas(300, 10 * 60_000)
const GAGAL = 'Nomor belum terdaftar. Periksa lagi atau tanyakan ke wali kelas.'

export default defineEventHandler(async (event) => {
  const p = await penggunaPerpus(event)
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'tak-dikenal'
  if (batasUser.terblokir(p.userId) || batasIp.terblokir(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' })
  }
  if (p.siswa) return { ok: true }
  const body = await readBody(event).catch(() => null)
  const nomor = String(body?.nomor || '').replace(/\D/g, '')
  const lengkap = body?.nisn !== undefined || body?.lahir !== undefined
  const nisn = String(body?.nisn || '').replace(/\D/g, '')
  const lahir = String(body?.lahir || '')
  const gagal = () => { batasUser.catat(p.userId); batasIp.catat(ip); return createError({ statusCode: 404, statusMessage: GAGAL }) }
  if (nomor.length < 4 || nomor.length > 20) throw gagal()
  if (lengkap && (nisn.length < 4 || nisn.length > 20 || !/^\d{4}-\d{2}-\d{2}$/.test(lahir))) throw gagal()
  const db = klienPerpus(event)
  // nomor cuma angka (sudah dibersihkan), aman dipakai di filter or(). Lengkap: NIS wajib cocok ke kolom nis.
  const { data: cocok, error } = await db.from('students').select('id, nis, nisn, birth_date, grade, active, student_status')
    .or(lengkap ? `nis.eq.${nomor}` : `nis.eq.${nomor},nisn.eq.${nomor}`).limit(2)
  if (error) throw createError({ statusCode: 500, statusMessage: 'Gagal memeriksa nomor.' })
  const s = cocok?.length === 1 ? cocok[0] : null // dua siswa dengan nomor sama = ambigu, tolak
  const domain = jenjangDomain(event)
  if (!siswaAktif(s) || (domain && domain !== s.grade)) throw gagal()
  if (lengkap && (s.nisn !== nisn || String(s.birth_date || '').slice(0, 10) !== lahir)) throw gagal()
  const { data: lama } = await db.from('perpus_akun').select('user_id').eq('student_id', s.id).maybeSingle()
  if (lama && lama.user_id !== p.userId) {
    if (!lengkap) throw createError({ statusCode: 409, statusMessage: 'Siswa ini sudah terhubung ke akun Google lain. Untuk memindahkannya, lengkapi NIS, NISN, dan tanggal lahir.' })
    await db.from('perpus_akun').delete().eq('student_id', s.id) // akun lama dilepas; data baca tetap milik siswa
  }
  const { error: eSimpan } = await db.from('perpus_akun').insert({ user_id: p.userId, student_id: s.id, email: p.email })
  if (eSimpan) throw createError({ statusCode: eSimpan.code === '23505' ? 409 : 500, statusMessage: eSimpan.code === '23505' ? 'Siswa ini sudah terhubung ke akun Google lain. Untuk memindahkannya, lengkapi NIS, NISN, dan tanggal lahir.' : 'Gagal menyimpan akun.' })
  batasUser.hapus(p.userId)
  lupakanToken(event)
  return { ok: true }
})
