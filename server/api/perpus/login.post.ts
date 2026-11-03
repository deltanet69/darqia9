// POST /api/perpus/login — verifikasi NIS Perpustakaan Digital.
// Halaman perpus bersifat publik (tanpa akun Supabase Auth), jadi NIS
// diverifikasi di server dengan service role terhadap tabel students
// (Data Induk). Yang dikembalikan HANYA profil tampil seperlunya
// (nama, jenjang, kelas) untuk siswa aktif — tidak ada data induk lain
// yang keluar lewat endpoint ini.
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const nis = String(body?.nis || '').trim()
  if (!nis || nis.length > 20 || !/^[0-9A-Za-z-]+$/.test(nis)) {
    throw createError({ statusCode: 400, statusMessage: 'NIS tidak valid.' })
  }
  let supabase
  try {
    supabase = serverSupabaseServiceRole(event)
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Secret key Supabase belum dikonfigurasi di server.' })
  }
  const { data, error } = await supabase
    .from('students')
    .select('nis, name, grade, class_id, student_status, active')
    .eq('nis', nis)
    .eq('active', true)
    .maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Gagal memeriksa NIS.' })
  if (!data || (data.student_status && data.student_status !== 'Aktif')) {
    return { ok: false }
  }
  let kelas = ''
  if (data.class_id) {
    const { data: k } = await supabase.from('classes').select('name').eq('id', data.class_id).maybeSingle()
    kelas = k?.name || ''
  }
  return { ok: true, siswa: { nis: data.nis, nama: data.name, grade: data.grade, kelas } }
})
