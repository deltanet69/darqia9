// Penjaga domain live: tiap subdomain .sch.id hanya melayani modulnya (aturan di domainCore).
// Berawalan 00 agar berjalan sebelum middleware auth/RBAC. Localhost dan staging Vercel tidak dibatasi.
import { arahkanDomain } from '~/composables/domainCore'

export default defineNuxtRouteMiddleware((to) => {
  const tujuan = arahkanDomain(useRequestURL().hostname, to.path, to.fullPath)
  if (!tujuan) return
  return navigateTo(tujuan, { replace: true, external: tujuan.startsWith('http') })
})
