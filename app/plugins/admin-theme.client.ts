// Terapkan tema AdminV2 sedini mungkin (sebelum aplikasi tampil) agar tidak ada
// kedipan terang pada muatan pertama. Atribut data-theme hanya hidup selama
// pengguna berada di halaman /adminV2 — halaman publik tidak ikut berubah.
export default defineNuxtPlugin(() => {
  const isAdminRoute = () => window.location.pathname.toLowerCase().startsWith('/adminv2')

  const applyInitial = () => {
    if (!isAdminRoute()) return
    try {
      const saved = localStorage.getItem('darqia-admin-theme')
      const dark = saved ? saved === 'dark' : !!window.matchMedia?.('(prefers-color-scheme: dark)').matches
      if (dark) {
        document.documentElement.dataset.theme = 'dark'
        document.documentElement.style.colorScheme = 'dark'
      }
    } catch { /* abaikan */ }
  }

  applyInitial()

  const router = useRouter()
  router.afterEach(() => {
    if (!isAdminRoute()) {
      delete document.documentElement.dataset.theme
      document.documentElement.style.colorScheme = ''
    } else {
      applyInitial()
    }
  })
})
