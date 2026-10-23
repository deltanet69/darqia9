export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.toLowerCase()
  const user = useSupabaseUser()

  if (path.startsWith('/adminv2')) {
    if (path === '/adminv2/login') {
      if (user.value) return navigateTo('/adminV2')
      return
    }

    if (!user.value) {
      return navigateTo({
        path: '/adminV2/login',
        query: { redirect: to.fullPath }
      })
    }
    return
  }

  // Lindungi semua route /admin/** kecuali /admin/login.
  if (!path.startsWith('/admin') || path === '/admin/login') {
    return
  }

  if (!user.value) {
    return navigateTo('/admin/login')
  }
})