import { gerbangAdminUsers } from '../../../utils/adminUsersGate'

const EMAIL_VALID = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const jenjangValid = (nilai: unknown): string[] =>
  Array.isArray(nilai) ? nilai.filter((j): j is string => j === 'SMK' || j === 'SMP') : []

export default defineEventHandler(async (event) => {
  const { supabase } = await gerbangAdminUsers(event, 'buat')
  const body = await readBody(event)

  const nama = String(body?.nama || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  const peranId = body?.peranId ? String(body.peranId) : null
  const guruId = body?.guruId ? String(body.guruId) : null
  const jenjang = jenjangValid(body?.jenjang)

  if (!nama || !EMAIL_VALID.test(email) || password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nama, email yang valid, dan kata sandi minimal 8 karakter wajib diisi.'
    })
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    // Kata sandi dibuatkan admin — pengguna WAJIB menggantinya saat masuk pertama.
    user_metadata: { name: nama, must_change_password: true }
  })
  if (error || !data?.user) {
    throw createError({
      statusCode: 400,
      statusMessage: `Akun gagal dibuat: ${error?.message || 'email mungkin sudah terdaftar.'}`
    })
  }

  const uidBaru = data.user.id

  // Akun hasil impor guru: penugasan memakai id guru (bentuk kanonis penugasan
  // guru di RBAC) dan record guru ditautkan ke uid auth barunya.
  let subjek = uidBaru
  if (guruId) {
    await supabase.from('teachers').update({ user_id: uidBaru }).eq('id', guruId)
    subjek = guruId
  }

  if (peranId) {
    await supabase.from('rbac_assignments').upsert(
      { subjek_id: subjek, nama, peran_id: peranId, jenjang: jenjang.length ? jenjang : ['SMK', 'SMP'] },
      { onConflict: 'subjek_id' }
    )
  }

  return { id: uidBaru, email }
})
