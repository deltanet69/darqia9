import { gerbangAdminUsers, PRIMARY_SUPERADMIN_EMAIL } from '../../../utils/adminUsersGate'

export default defineEventHandler(async (event) => {
  const konteks = await gerbangAdminUsers(event, 'hapus')
  const { supabase } = konteks
  const id = String(getRouterParam(event, 'id') || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID pengguna tidak valid.' })
  if (id === konteks.uid) {
    throw createError({ statusCode: 400, statusMessage: 'Anda tidak dapat menghapus akun Anda sendiri.' })
  }

  const { data: targetData, error: targetError } = await supabase.auth.admin.getUserById(id)
  const target = targetData?.user
  if (targetError || !target) {
    throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan.' })
  }
  if ((target.email || '').toLowerCase() === PRIMARY_SUPERADMIN_EMAIL) {
    throw createError({ statusCode: 400, statusMessage: 'Akun Superadmin Utama tidak dapat dihapus.' })
  }

  // Bersihkan penugasan RBAC (kedua bentuk subjek) + tautan guru, lalu akunnya.
  const { data: guru } = await supabase.from('teachers').select('id').eq('user_id', id).maybeSingle()
  const subjekSemua = [...new Set([id, guru?.id ? String(guru.id) : null].filter(Boolean) as string[])]
  await supabase.from('rbac_assignments').delete().in('subjek_id', subjekSemua)
  if (guru?.id) await supabase.from('teachers').update({ user_id: null }).eq('id', guru.id)

  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) {
    throw createError({ statusCode: 400, statusMessage: `Akun gagal dihapus: ${error.message}` })
  }

  return { ok: true }
})
