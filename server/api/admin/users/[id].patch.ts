import { gerbangAdminUsers, PRIMARY_SUPERADMIN_EMAIL } from '../../../utils/adminUsersGate'
import { catatLogServer } from '../../../utils/catatLogServer'
import { pastikanDataGuru } from '../../../utils/pastikanDataGuru'

const jenjangValid = (nilai: unknown): string[] =>
  Array.isArray(nilai) ? nilai.filter((j): j is string => j === 'SMK' || j === 'SMP') : []

export default defineEventHandler(async (event) => {
  const konteks = await gerbangAdminUsers(event, 'ubah')
  const { supabase } = konteks
  const id = String(getRouterParam(event, 'id') || '')
  const body = await readBody(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID pengguna tidak valid.' })

  const { data: targetData, error: targetError } = await supabase.auth.admin.getUserById(id)
  const target = targetData?.user
  if (targetError || !target) {
    throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan.' })
  }
  const utama = (target.email || '').toLowerCase() === PRIMARY_SUPERADMIN_EMAIL

  const atribut: Record<string, any> = {}
  const metadataBaru: Record<string, any> = {}
  if (typeof body?.nama === 'string' && body.nama.trim()) {
    metadataBaru.name = body.nama.trim()
  }
  if (typeof body?.password === 'string' && body.password) {
    if (body.password.length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Kata sandi baru minimal 8 karakter.' })
    }
    atribut.password = body.password
    // Kata sandi diatur ulang oleh admin — pengguna wajib menggantinya saat masuk.
    metadataBaru.must_change_password = true
  }
  if (Object.keys(metadataBaru).length) {
    atribut.user_metadata = { ...(target.user_metadata || {}), ...metadataBaru }
  }
  if (typeof body?.aktif === 'boolean') {
    if (!body.aktif && utama) {
      throw createError({ statusCode: 400, statusMessage: 'Akun Superadmin Utama tidak dapat dinonaktifkan.' })
    }
    if (!body.aktif && id === konteks.uid) {
      throw createError({ statusCode: 400, statusMessage: 'Anda tidak dapat menonaktifkan akun Anda sendiri.' })
    }
    atribut.ban_duration = body.aktif ? 'none' : '87600h'
  }
  if (Object.keys(atribut).length) {
    const { error } = await supabase.auth.admin.updateUserById(id, atribut)
    if (error) {
      throw createError({ statusCode: 400, statusMessage: `Perubahan gagal disimpan: ${error.message}` })
    }
  }

  // Penugasan RBAC: peranId undefined = tidak diubah, null = dilepas, string = diganti.
  if (body?.peranId !== undefined) {
    const { data: guru } = await supabase.from('teachers').select('id').eq('user_id', id).maybeSingle()
    // Diubah ke peran guru: pastikan data guru ada (akun lama yang belum punya baris teachers).
    const guruBaru = !guru?.id && body.peranId
      ? await pastikanDataGuru(supabase, {
          uid: id,
          nama: String(body?.nama || target.user_metadata?.name || target.email || 'Pengguna'),
          email: (target.email || '').toLowerCase(),
          peranId: String(body.peranId),
          jenjang: jenjangValid(body?.jenjang)
        })
      : null
    const subjekUtama = guru?.id ? String(guru.id) : guruBaru || id
    const subjekSemua = [...new Set([id, subjekUtama])]
    await supabase.from('rbac_assignments').delete().in('subjek_id', subjekSemua)
    if (body.peranId) {
      const jenjang = jenjangValid(body?.jenjang)
      await supabase.from('rbac_assignments').insert({
        subjek_id: subjekUtama,
        nama: String(body?.nama || target.user_metadata?.name || target.email || 'Pengguna'),
        peran_id: String(body.peranId),
        jenjang: jenjang.length ? jenjang : ['SMK', 'SMP']
      })
    }
  }

  const aksiLog = (typeof body?.password === 'string' && body.password)
    ? 'reset sandi'
    : typeof body?.aktif === 'boolean'
      ? (body.aktif ? 'aktifkan akun' : 'nonaktifkan akun')
      : 'ubah akun'
  await catatLogServer(supabase, { id: konteks.uid, nama: konteks.caller.user_metadata?.name || konteks.email }, 'Manajemen User', aksiLog, `Akun ${target.user_metadata?.name || target.email} (${target.email})`)
  return { ok: true }
})
