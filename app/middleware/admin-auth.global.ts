export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path.toLowerCase()
  if (!path.startsWith('/adminv2')) return
  if (path === '/adminv2/login') return

  const supabase = useSupabaseClient()
  // getUser memanggil server Auth di setiap pindah halaman. Setelah terverifikasi, cukup cek sesi lokal selama 5 menit.
  const verifikasiTerakhir = useState<number>('admin-auth-verifikasi', () => 0)
  if (import.meta.client && Date.now() - verifikasiTerakhir.value < 300_000) {
    const { data: lokal } = await supabase.auth.getSession()
    if (lokal.session) return
  }
  const { data, error } = await supabase.auth.getUser()

  if (!error && data.user) {
    verifikasiTerakhir.value = Date.now()
    return
  }
  verifikasiTerakhir.value = 0

  if (import.meta.client) {
    await supabase.auth.signOut({ scope: 'local' })
  }

  return navigateTo({
    path: '/adminV2/login',
    query: { redirect: to.fullPath }
  }, { replace: true })
})
