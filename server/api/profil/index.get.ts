import { gerbangProfil, guruMilikAkun } from '../../utils/profilGate'

export default defineEventHandler(async (event) => {
  const { supabase, uid, user } = await gerbangProfil(event)
  const guru = await guruMilikAkun(supabase, uid)
  const meta = user.user_metadata || {}

  const baca = async (q: any) => {
    const { data } = await q
    return data || []
  }
  // Aktivitas & sesi: hanya baris milik aktor ini. Tabel belum ada = daftar kosong.
  const aktivitas = await baca(supabase.from('activity_logs').select('modul, aksi, detail, created_at')
    .eq('actor_id', uid).order('created_at', { ascending: false }).limit(5))
  const login = await baca(supabase.from('activity_logs').select('modul, aksi, detail, created_at')
    .eq('actor_id', uid).eq('modul', 'Sistem').eq('aksi', 'login').order('created_at', { ascending: false }).limit(3))

  const diblokir = user.banned_until ? new Date(user.banned_until).getTime() > Date.now() : false
  return {
    akun: {
      id: uid,
      email: user.email || '',
      name: meta.name || meta.full_name || '',
      aktif: !diblokir,
      avatarUrl: meta.avatar_url || '',
      tema: Number.isInteger(meta.avatar_tema) ? meta.avatar_tema : 0,
      prefs: meta.prefs && typeof meta.prefs === 'object' ? meta.prefs : null
    },
    guru,
    aktivitas,
    login
  }
})
