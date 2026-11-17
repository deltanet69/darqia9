import { buatPembatas } from '../../utils/pembatas'
import { catatLogOrtu, wajibSesiOrtu } from '../../utils/ortuSesi'
import { cocokSandiOrtu, galatSandiBaruOrtu, hashSandiOrtu } from '../../utils/ortuSandi'

const batas = buatPembatas(8, 5 * 60_000)

// POST /api/ortu/ganti-password — { lama, baru }. Sesi lain milik akun ini dihapus setelah berhasil.
export default defineEventHandler(async (event) => {
  const { db, sesi } = await wajibSesiOrtu(event, { bolehWajibGanti: true })
  const b = await readBody(event).catch(() => null) as Record<string, unknown> | null
  const lama = typeof b?.lama === 'string' ? b.lama : ''
  const baru = typeof b?.baru === 'string' ? b.baru : ''
  if (!lama || lama.length > 200) throw createError({ statusCode: 400, statusMessage: 'Isi kata sandi lama.' })
  const galat = galatSandiBaruOrtu(baru, sesi.nis, lama)
  if (galat) throw createError({ statusCode: 400, statusMessage: galat })
  if (batas.terblokir(sesi.studentId)) throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.' })

  const { data: akun } = await db.from('parent_accounts').select('password_hash').eq('student_id', sesi.studentId).maybeSingle()
  if (!akun || !(await cocokSandiOrtu(lama, akun.password_hash))) {
    batas.catat(sesi.studentId)
    throw createError({ statusCode: 400, statusMessage: 'Kata sandi lama tidak cocok.' })
  }
  const { error } = await db.from('parent_accounts')
    .update({ password_hash: await hashSandiOrtu(baru), must_change_password: false, updated_at: new Date().toISOString() })
    .eq('student_id', sesi.studentId)
  if (error) throw createError({ statusCode: 500, statusMessage: 'Kata sandi gagal disimpan. Coba lagi.' })
  batas.hapus(sesi.studentId)
  await db.from('parent_sessions').delete().eq('student_id', sesi.studentId).neq('token_hash', sesi.tokenHash)
  await catatLogOrtu(db, sesi, 'ganti kata sandi')
  return { ok: true }
})
