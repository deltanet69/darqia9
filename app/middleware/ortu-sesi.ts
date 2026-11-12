// Halaman portal wajib sesi masuk; tanpa sesi kembali ke halaman masuk
export default defineNuxtRouteMiddleware(() => {
  const sesi = useState<{ nis: string; jenjang: 'SMK' | 'SMP' } | null>('ortu-sesi', () => null)
  if (!sesi.value) return navigateTo('/ortu')
})
