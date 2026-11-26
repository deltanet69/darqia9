import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { PRIMARY_SUPERADMIN_EMAIL } from './adminUsersGate'

const ADMIN_ROLES = new Set(['superadmin', 'super_admin', 'admin'])
export const MODUL_KONTEN_WEBSITE = 'Konten Website'

// Gerbang endpoint /api/admin/konten: pola yang sama dengan gerbang
// Manajemen User — sesi valid + (email utama | role metadata lama |
// peran RBAC terkunci | izin RBAC modul 'Konten Website' sesuai aksi
// 'lihat' | 'buat' | 'ubah' | 'hapus'). Mengembalikan klien service role.
export const gerbangKonten = async (event: any, aksi: string) => {
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
        .eq('modul', MODUL_KONTEN_WEBSITE)
        .eq(aksi, true)
      if (izin?.length) return konteks
    }
  } catch { /* tabel RBAC belum tersedia — gerbang lama tetap berlaku */ }

  throw createError({ statusCode: 403, statusMessage: 'Akun tidak memiliki hak mengelola konten website.' })
}

// Galat khas saat migrasi 0096 belum dijalankan di Supabase: tabel
// website_articles sudah ada (migrasi 0010), yang belum ada adalah kolom
// tambahan penulis_peran / kutipan dari 0096.
export const galatTabelKonten = (error: any): boolean => {
  const pesan = String(error?.message || '')
  if (/website_articles/i.test(pesan) && (error?.code === '42P01' || error?.code === 'PGRST205')) return true
  return /(penulis_peran|kutipan_teks|kutipan_penulis)/i.test(pesan) && (error?.code === '42703' || error?.code === 'PGRST204' || /does not exist/i.test(pesan))
}

export const galatMigrasiKonten = () => createError({
  statusCode: 503,
  statusMessage: 'Kolom konten website belum lengkap. Jalankan migrasi 0096_website_articles_publik.sql di Supabase terlebih dahulu.'
})
