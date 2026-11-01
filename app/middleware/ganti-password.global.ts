// Wajib ganti kata sandi: akun yang kata sandinya dibuatkan admin (impor dari
// data guru, tambah manual, atau reset oleh admin) ditandai
// user_metadata.must_change_password = true. Selama tanda itu ada, semua
// halaman AdminV2 diarahkan ke /adminV2/ganti-password sampai pengguna
// mengganti kata sandinya sendiri. Berjalan setelah admin-auth.global
// (urutan nama file) sehingga sesi sudah pasti valid di sini; halaman login
// dan halaman ganti sandi sendiri dikecualikan agar tidak berputar.
export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.toLowerCase()
  if (!path.startsWith('/adminv2')) return
  if (path === '/adminv2/login' || path === '/adminv2/ganti-password') return

  try {
    const user = useSupabaseUser()
    if ((user.value as any)?.user_metadata?.must_change_password) {
      return navigateTo('/adminV2/ganti-password', { replace: true })
    }
  } catch {
    return
  }
})
