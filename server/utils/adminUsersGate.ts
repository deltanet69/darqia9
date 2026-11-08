import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export const PRIMARY_SUPERADMIN_EMAIL = 'betadev94@gmail.com'
const ADMIN_ROLES = new Set(['superadmin', 'super_admin', 'admin'])
export const MODUL_MANAJEMEN_USER = 'Manajemen User'

// Gerbang bersama endpoint /api/admin/users: sesi valid + secret key server
// + hak kelola menurut (berurutan) email utama, role metadata auth lama,
// peran terkunci RBAC (Superadmin: semua aksi), atau matriks izin RBAC
// untuk modul Manajemen User sesuai aksi ('lihat' | 'buat' | 'ubah' | 'hapus').
export const gerbangAdminUsers = async (event: any, aksi: string) => {
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
  const caller = callerData?.user
  if (callerError || !caller?.email) {
    throw createError({ statusCode: 401, statusMessage: 'Akun admin tidak dapat diverifikasi.' })
  }

  const email = caller.email.toLowerCase()
  const metaRole = String(caller.app_metadata?.role || caller.user_metadata?.role || '').trim().toLowerCase()
  const konteks = { supabase, caller, uid: String(claims.sub), email }
  if (email === PRIMARY_SUPERADMIN_EMAIL || ADMIN_ROLES.has(metaRole)) return konteks

  try {
    const { data: guru } = await supabase.from('teachers').select('id').eq('user_id', claims.sub).maybeSingle()
    const subjek = [String(claims.sub), guru?.id ? String(guru.id) : null].filter(Boolean) as string[]
    const { data: tugas } = await supabase.from('rbac_assignments').select('peran_id').in('subjek_id', subjek)
    const peranIds = [...new Set((tugas || []).map((t: any) => String(t.peran_id)))]
    if (peranIds.length) {
      const { data: peranTerkunci } = await supabase.from('rbac_roles').select('id').in('id', peranIds).eq('terkunci', true)
      if (peranTerkunci?.length) return konteks
      const { data: izin } = await supabase
        .from('rbac_permissions')
        .select('peran_id')
        .in('peran_id', peranIds)
        .eq('modul', MODUL_MANAJEMEN_USER)
        .eq(aksi, true)
      if (izin?.length) return konteks
    }
  } catch { /* tabel RBAC belum tersedia — gerbang lama tetap berlaku */ }

  throw createError({ statusCode: 403, statusMessage: 'Akun tidak memiliki hak mengelola pengguna.' })
}
