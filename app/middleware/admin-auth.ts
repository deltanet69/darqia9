export default defineNuxtRouteMiddleware((to) => {
  // Lindungi semua route /admin/** KECUALI /admin/login
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/admin/login')
  }
})

