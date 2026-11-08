import { gerbangAdminUsers } from '../../../utils/adminUsersGate'
import { catatLogServer } from '../../../utils/catatLogServer'

interface TeacherAccountInput {
  nip?: string
  nik?: string
  name: string
  email?: string
  unit: 'SMP' | 'SMK' | 'Yayasan'
}

const EMAIL_VALID = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Buatkan akun login untuk guru hasil impor. Sama dengan alur Manajemen User:
// createUser langsung aktif (tanpa email undangan/SMTP), kata sandi awal dari admin,
// wajib diganti saat masuk pertama. Tiap guru diproses sendiri: yang gagal dicatat,
// yang lain tetap berjalan.
export default defineEventHandler(async (event) => {
  const konteks = await gerbangAdminUsers(event, 'buat')
  const { supabase } = konteks
  const body = await readBody<{ teachers?: TeacherAccountInput[]; password?: string }>(event)

  const password = String(body?.password || '')
  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Kata sandi awal minimal 8 karakter.' })
  }

  const accounts: Array<{ userId: string; nip: string; name: string; email: string; scope: string; role: string }> = []
  const gagal: string[] = []
  let skipped = 0

  // Peta email -> uid akun auth yang sudah ada; dimuat sekali, hanya bila dibutuhkan.
  let petaAuth: Map<string, string> | null = null
  const uidDariEmail = async (email: string): Promise<string | null> => {
    if (!petaAuth) {
      petaAuth = new Map()
      const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
      for (const u of data?.users || []) if (u.email) petaAuth.set(u.email.toLowerCase(), u.id)
    }
    return petaAuth.get(email) || null
  }

  for (const teacher of body?.teachers || []) {
    const nama = String(teacher.name || '').trim()
    const email = String(teacher.email || '').trim().toLowerCase()
    const nip = String(teacher.nip || '').trim()
    const nik = String(teacher.nik || '').trim()
    if (!nama || (!nip && !nik) || !EMAIL_VALID.test(email)) {
      skipped++
      continue
    }

    let guru: { id: string; user_id: string | null } | null = null
    if (nip) guru = (await supabase.from('teachers').select('id, user_id').eq('nip', nip).maybeSingle()).data
    if (!guru && nik) guru = (await supabase.from('teachers').select('id, user_id').eq('nik', nik).maybeSingle()).data
    if (!guru) {
      gagal.push(`${nama}: data guru belum tersimpan di database.`)
      continue
    }
    if (guru.user_id) {
      skipped++ // sudah punya akun, tidak dibuat ulang dan sandinya tidak disentuh
      continue
    }

    const scope = teacher.unit === 'Yayasan' ? 'yayasan' : String(teacher.unit || 'SMK').toLowerCase()
    let uid: string | null = null
    let baru = false
    const { data: dibuat, error: errBuat } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: nama, must_change_password: true }
    })
    if (dibuat?.user) {
      uid = dibuat.user.id
      baru = true
    } else if (errBuat && (errBuat.code === 'email_exists' || /already|registered|exists/i.test(errBuat.message))) {
      uid = await uidDariEmail(email)
    }
    if (!uid) {
      gagal.push(`${nama}: akun gagal dibuat (${errBuat?.message || 'akun dengan email ini tidak ditemukan'}).`)
      continue
    }

    // Akun baru: trigger database membuat profil berperan 'admin'; turunkan ke 'guru'.
    // Akun lama (mis. admin yang juga guru) tidak diubah perannya.
    const { error: errProfil } = baru
      ? await supabase.from('profiles').upsert({ id: uid, email, name: nama, role: 'guru', scope }, { onConflict: 'id' })
      : { error: null }
    const { error: errTaut } = errProfil
      ? { error: null }
      : await supabase.from('teachers').update({ user_id: uid }).eq('id', guru.id)
    if (errProfil || errTaut) {
      if (baru) await supabase.auth.admin.deleteUser(uid) // batalkan akun setengah jadi
      gagal.push(`${nama}: ${errProfil ? `profil gagal disimpan (${errProfil.message})` : `gagal ditautkan ke data guru (${errTaut?.message})`}.`)
      continue
    }

    accounts.push({ userId: uid, nip, name: nama, email, scope, role: 'guru' })
  }

  if (accounts.length) {
    await catatLogServer(supabase, { id: konteks.uid, nama: konteks.caller.user_metadata?.name || konteks.email }, 'Manajemen User', 'buat akun', `Impor guru: ${accounts.length} akun login dibuat`)
  }
  return { accounts, skipped, gagal }
})
