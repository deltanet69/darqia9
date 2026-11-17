// GET /api/admin/ortu-akses?studentId=<uuid> — status akses Portal Orang Tua satu siswa (tanpa hash kata sandi).
import { gerbangAdminUsers } from '../../utils/adminUsersGate'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { supabase: db } = await gerbangAdminUsers(event, 'lihat', 'Data Siswa')
  const id = getQuery(event).studentId
  if (typeof id !== 'string' || !UUID.test(id)) throw createError({ statusCode: 400, statusMessage: 'Siswa tidak valid.' })
  const { data, error } = await db.from('parent_accounts').select('must_change_password, last_login_at, locked_until, updated_at').eq('student_id', id).maybeSingle()
  if (error) throw createError({ statusCode: 503, statusMessage: 'Portal orang tua belum siap. Terapkan migrasi 0080.' })
  return data
    ? { ada: true, wajibGanti: data.must_change_password, terakhirMasuk: data.last_login_at, terkunciSampai: data.locked_until, diperbarui: data.updated_at }
    : { ada: false, wajibGanti: false, terakhirMasuk: null, terkunciSampai: null, diperbarui: null }
})
