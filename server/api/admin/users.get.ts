import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

const PRIMARY_SUPERADMIN_EMAIL = 'betadev94@gmail.com'
const ADMIN_ROLES = new Set(['superadmin', 'super_admin', 'admin'])

const normalizeRole = (value: unknown) => String(value || '').trim().toLowerCase()

const roleLabel = (role: string, isPrimarySuperadmin: boolean) => {
  if (isPrimarySuperadmin) return 'Superadmin Utama'
  if (role === 'superadmin' || role === 'super_admin') return 'Superadmin'
  if (role === 'admin' || role === 'admin_tu') return 'Admin TU'
  if (role === 'guru') return 'Guru'
  if (role === 'wali_kelas') return 'Wali Kelas'
  if (role === 'staff' || role === 'staf_tu') return 'Staf TU'
  return 'Pengguna'
}

export default defineEventHandler(async (event) => {
  let claims
  try {
    claims = await serverSupabaseUser(event)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Sesi admin tidak valid.' })
  }

  if (!claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Sesi admin tidak valid.' })
  }

  let supabase
  try {
    supabase = serverSupabaseServiceRole(event)
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'Secret key Supabase belum dikonfigurasi di server.'
    })
  }

  const { data: callerData, error: callerError } = await supabase.auth.admin.getUserById(claims.sub)
  const caller = callerData.user
  if (callerError || !caller?.email) {
    throw createError({ statusCode: 401, statusMessage: 'Akun admin tidak dapat diverifikasi.' })
  }

  const callerEmail = caller.email.toLowerCase()
  const callerRole = normalizeRole(caller.app_metadata?.role || caller.user_metadata?.role)
  const isPrimarySuperadmin = callerEmail === PRIMARY_SUPERADMIN_EMAIL

  if (!isPrimarySuperadmin && !ADMIN_ROLES.has(callerRole)) {
    throw createError({ statusCode: 403, statusMessage: 'Akun tidak memiliki hak mengelola pengguna.' })
  }

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  })

  if (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Data pengguna Supabase Auth gagal dimuat.'
    })
  }

  const now = Date.now()
  const users = data.users.map((user) => {
    const email = user.email || ''
    const metadata = user.user_metadata || {}
    const role = normalizeRole(user.app_metadata?.role || metadata.role)
    const primary = email.toLowerCase() === PRIMARY_SUPERADMIN_EMAIL
    const bannedUntil = user.banned_until ? new Date(user.banned_until).getTime() : 0

    return {
      id: user.id,
      name: metadata.name || metadata.full_name || (primary ? 'Naufal Hamidy' : email.split('@')[0] || 'Pengguna'),
      email,
      role: roleLabel(role, primary),
      status: bannedUntil > now ? 'Tidak Aktif' : 'Aktif',
      emailConfirmed: Boolean(user.email_confirmed_at),
      lastSignInAt: user.last_sign_in_at || null,
      createdAt: user.created_at,
      isPrimarySuperadmin: primary
    }
  })

  return {
    users,
    total: users.length,
    source: 'Supabase Auth'
  }
})