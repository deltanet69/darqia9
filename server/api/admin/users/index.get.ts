import { gerbangAdminUsers, PRIMARY_SUPERADMIN_EMAIL } from '../../../utils/adminUsersGate'

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
  const { supabase } = await gerbangAdminUsers(event, 'lihat')

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

  // Perkaya dengan penugasan RBAC: label peran mengikuti Hak Akses bila ada,
  // bukan hanya metadata auth lama.
  const petaGuru = new Map<string, string>() // uid auth -> id guru
  const petaTugas = new Map<string, { peranId: string, peranNama: string, jenjang: string[], guruId: string | null }>()
  try {
    const { data: guruRows } = await supabase.from('teachers').select('id, user_id').not('user_id', 'is', null)
    for (const g of guruRows || []) petaGuru.set(String(g.user_id), String(g.id))
    const subjekSemua = [...data.users.map(u => u.id), ...petaGuru.values()]
    const { data: tugasRows } = await supabase
      .from('rbac_assignments')
      .select('subjek_id, peran_id, jenjang, rbac_roles(nama)')
      .in('subjek_id', subjekSemua)
    for (const t of tugasRows || []) {
      petaTugas.set(String(t.subjek_id), {
        peranId: String(t.peran_id),
        peranNama: (t as any).rbac_roles?.nama || '',
        jenjang: Array.isArray(t.jenjang) ? t.jenjang : [],
        guruId: null
      })
    }
  } catch { /* RBAC belum tersedia — label metadata tetap dipakai */ }

  const now = Date.now()
  const users = data.users.map((user) => {
    const email = user.email || ''
    const metadata = user.user_metadata || {}
    const role = normalizeRole(user.app_metadata?.role || metadata.role)
    const primary = email.toLowerCase() === PRIMARY_SUPERADMIN_EMAIL
    const bannedUntil = user.banned_until ? new Date(user.banned_until).getTime() : 0
    const guruId = petaGuru.get(user.id) || null
    const tugas = petaTugas.get(user.id) || (guruId ? petaTugas.get(guruId) : undefined)

    return {
      id: user.id,
      name: metadata.name || metadata.full_name || (primary ? 'Naufal Hamidy' : email.split('@')[0] || 'Pengguna'),
      email,
      role: tugas?.peranNama || roleLabel(role, primary),
      peranId: tugas?.peranId || null,
      jenjang: tugas?.jenjang || [],
      guruId,
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
