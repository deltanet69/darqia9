import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

// Gerbang endpoint /api/profil: hanya butuh sesi valid. Semua query dikunci ke
// uid sesi itu sendiri, jadi data satu akun tidak mungkin tercampur dengan akun lain.
export const gerbangProfil = async (event: any) => {
  let claims
  try {
    claims = await serverSupabaseUser(event)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Sesi tidak valid. Silakan masuk kembali.' })
  }
  if (!claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Sesi tidak valid. Silakan masuk kembali.' })
  }

  let supabase
  try {
    supabase = serverSupabaseServiceRole(event)
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Secret key Supabase belum dikonfigurasi di server.' })
  }

  const { data, error } = await supabase.auth.admin.getUserById(String(claims.sub))
  if (error || !data?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Akun tidak dapat diverifikasi.' })
  }
  return { supabase, uid: String(claims.sub), user: data.user }
}

// Baris guru milik akun ini. Hanya lewat teachers.user_id, tidak pernah dicocokkan lewat email/nama.
export const guruMilikAkun = async (supabase: any, uid: string) => {
  const { data, error } = await supabase.from('teachers').select('*').eq('user_id', uid).limit(2)
  if (error) throw createError({ statusCode: 502, statusMessage: 'Data pegawai gagal dimuat.' })
  if ((data?.length || 0) > 1) {
    throw createError({ statusCode: 409, statusMessage: 'Akun ini tertaut ke lebih dari satu data pegawai. Hubungi Superadmin.' })
  }
  return data?.[0] || null
}
