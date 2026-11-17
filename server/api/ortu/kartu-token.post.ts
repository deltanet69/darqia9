import { buatPembatas } from '../../utils/pembatas'
import { catatLogOrtu, wajibSesiOrtu } from '../../utils/ortuSesi'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const batas = buatPembatas(10, 5 * 60_000)

// POST /api/ortu/kartu-token — { periodeId }. Token kartu ujian siswa (satu token untuk semua ujian periode itu),
// hanya bila memenuhi syarat administrasi. Token tidak pernah ditulis ke log.
export default defineEventHandler(async (event) => {
  const { db, sesi } = await wajibSesiOrtu(event)
  const b = await readBody(event).catch(() => null) as Record<string, unknown> | null
  const periodeId = typeof b?.periodeId === 'string' ? b.periodeId : ''
  if (!UUID.test(periodeId)) throw createError({ statusCode: 400, statusMessage: 'Periode kartu tidak valid.' })
  if (batas.terblokir(sesi.tokenHash)) throw createError({ statusCode: 429, statusMessage: 'Terlalu sering membuka token. Coba lagi dalam beberapa menit.' })
  batas.catat(sesi.tokenHash)

  const [{ data: s }, { data: p }] = await Promise.all([
    db.from('students').select('exam_eligible').eq('id', sesi.studentId).maybeSingle(),
    db.from('exam_card_periods').select('id, periode').eq('id', periodeId).eq('grade', sesi.grade).eq('source', 'cbt').not('released_at', 'is', null).maybeSingle()
  ])
  if (s?.exam_eligible === false) throw createError({ statusCode: 403, statusMessage: 'Kartu ujian terkunci karena administrasi belum memenuhi syarat.' })
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Kartu ujian periode ini belum dirilis.' })
  const { data: k } = await db.from('exam_cards').select('token, classroom').eq('period_id', p.id).eq('student_id', sesi.studentId).maybeSingle()
  if (!k?.token) throw createError({ statusCode: 404, statusMessage: 'Kartu ujian ananda belum diterbitkan. Hubungi Tata Usaha.' })
  await catatLogOrtu(db, sesi, 'buka token kartu ujian', p.periode)
  return { token: k.token as string, kelas: (k.classroom as string) || '' }
})
