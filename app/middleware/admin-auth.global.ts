export default defineNuxtRouteMiddleware((to) => {
  // Lindungi semua route /admin/** KECUALI /admin/login dan /adminV2
  if (!to.path.startsWith('/admin') || to.path.startsWith('/adminV2') || to.path === '/admin/login') {
    return
  }

  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/admin/login')
  }
})
