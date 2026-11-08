import { gerbangAdminUsers } from '../../../utils/adminUsersGate'
import { catatLogServer } from '../../../utils/catatLogServer'
import { pastikanDataGuru } from '../../../utils/pastikanDataGuru'

const EMAIL_VALID = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const jenjangValid = (nilai: unknown): string[] =>
  Array.isArray(nilai) ? nilai.filter((j): j is string => j === 'SMK' || j === 'SMP') : []

export default defineEventHandler(async (event) => {
  const konteks = await gerbangAdminUsers(event, 'buat')
  const { supabase } = konteks
  const body = await readBody(event)

  const nama = String(body?.nama || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  const peranId = body?.peranId ? String(body.peranId) : null
  let guruId = body?.guruId ? String(body.guruId) : null
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

  // Peran guru dari form manual: buatkan data guru + tautkan, agar terdeteksi di jadwal/RBAC/wali kelas.
  if (!guruId) {
    try {
      guruId = await pastikanDataGuru(supabase, { uid: uidBaru, nama, email, peranId, jenjang })
      if (guruId) await supabase.from('profiles').upsert({ id: uidBaru, email, name: nama, role: 'guru', scope: jenjang.length === 1 ? jenjang[0]!.toLowerCase() : 'yayasan' }, { onConflict: 'id' })
    } catch (e) {
      await supabase.auth.admin.deleteUser(uidBaru) // jangan sisakan akun setengah jadi
      throw e
    }
  }

  // Akun hasil impor guru: penugasan memakai id guru (bentuk kanonis penugasan
  // guru di RBAC) dan record guru ditautkan ke uid auth barunya.
  let subjek = uidBaru
  if (guruId) {
    await supabase.from('teachers').update({ user_id: uidBaru }).eq('id', guruId)
    subjek = guruId
  }

  // Penugasan yang sudah dibuat lewat halaman Hak Akses selalu dipertahankan:
  // impor hanya membuatkan akun + tautan guru, tidak memindahkan peran orang.
  let sudahDitugaskan = false
  if (guruId) {
    const { data: eksis } = await supabase
      .from('rbac_assignments')
      .select('subjek_id')
      .eq('subjek_id', guruId)
      .maybeSingle()
    sudahDitugaskan = !!eksis
  }

  if (peranId && !sudahDitugaskan) {
    await supabase.from('rbac_assignments').upsert(
      { subjek_id: subjek, nama, peran_id: peranId, jenjang: jenjang.length ? jenjang : ['SMK', 'SMP'] },
      { onConflict: 'subjek_id' }
    )
  }

  await catatLogServer(supabase, { id: konteks.uid, nama: konteks.caller.user_metadata?.name || konteks.email }, 'Manajemen User', 'buat akun', `${guruId ? 'Akun guru dibuat' : 'Akun dibuat'}: ${nama} (${email})`)
  return { id: uidBaru, email }
})
