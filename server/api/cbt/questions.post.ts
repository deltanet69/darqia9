import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ nis?: string; code?: string; grade?: string; source?: string }>(event)
  if (typeof body?.nis !== 'string' || !body.nis.trim() || body.nis.length > 30
    || typeof body.code !== 'string' || !body.code.trim() || body.code.length > 100
    || !['SMP', 'SMK'].includes(body.grade || '')
    || (body.source !== undefined && !['cbt', 'ujian_harian'].includes(body.source))) {
    throw createError({ statusCode: 400, statusMessage: 'Isi NIS, token, dan jenjang ujian dengan benar.' })
  }
  const client = await serverSupabaseClient(event)
  const { data, error } = await client.rpc('load_student_exam_questions', {
    student_nis: body.nis.trim(),
    exam_code: body.code.trim().toUpperCase(),
    target_grade: body.grade,
    source: body.source || 'cbt'
  })
  if (error) {
    if (error.code === 'PGRST202') {
      throw createError({ statusCode: 503, statusMessage: 'Pemuatan soal belum tersedia. Hubungi pengelola untuk menerapkan migrasi bank soal.' })
    }
    throw createError({ statusCode: 403, statusMessage: 'NIS atau token tidak cocok dengan ujian yang tersedia.' })
  }
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return data
})
