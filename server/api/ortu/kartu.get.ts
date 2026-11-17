import { wajibSesiOrtu } from '../../utils/ortuSesi'
import { muatSiswaOrtu } from '../../utils/ortuData'
import type { KartuOrtu } from '../../../app/types/ortu'

// GET /api/ortu/kartu — kelayakan (students.exam_eligible dari modul Keuangan) + periode kartu ujian PTS/PAS yang sudah dirilis.
// Token TIDAK dikirim di sini; hanya lewat POST /api/ortu/kartu-token.
export default defineEventHandler(async (event): Promise<KartuOrtu> => {
  const { db, sesi } = await wajibSesiOrtu(event)
  const [{ siswa, baris }, periodeRes, kartuRes] = await Promise.all([
    muatSiswaOrtu(db, sesi.studentId),
    db.from('exam_card_periods').select('id, periode, starts_on, ends_on').eq('grade', sesi.grade).eq('source', 'cbt')
      .not('released_at', 'is', null).order('starts_on', { ascending: false }).limit(6),
    db.from('exam_cards').select('period_id').eq('student_id', sesi.studentId)
  ])
  const punya = new Set(((kartuRes.error ? [] : kartuRes.data) || []).map((k: any) => k.period_id))
  return {
    layak: baris.exam_eligible !== false,
    siswa,
    ujian: ((periodeRes.error ? [] : periodeRes.data) || []).map((p: any) => ({
      periodeId: p.id, periode: p.periode, mulai: p.starts_on, selesai: p.ends_on, punyaKartu: punya.has(p.id)
    }))
  }
})
