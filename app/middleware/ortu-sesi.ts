// Halaman portal wajib sesi masuk (dicek ke server); kata sandi awal belum diganti -> layar ganti kata sandi.
import type { SesiOrtuKlien } from '~/types/ortu'

export default defineNuxtRouteMiddleware(async () => {
  const { sesi } = useOrtu()
  if (!sesi.value || sesi.value.wajibGanti) {
    sesi.value = await $fetch<SesiOrtuKlien>('/api/ortu/sesi').catch(() => null)
  }
  if (!sesi.value) return navigateTo('/ortu/login', { replace: true })
  if (sesi.value.wajibGanti) return navigateTo('/ortu/login?ganti=1', { replace: true })
})
