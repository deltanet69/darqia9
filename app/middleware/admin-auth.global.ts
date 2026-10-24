export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path.toLowerCase()
  const isAdminV2 = path.startsWith('/adminv2')
  const isAdminLegacy = path.startsWith('/admin') && !isAdminV2

  if (!isAdminV2 && !isAdminLegacy) return
  if (path === '/adminv2/login' || path === '/admin/login') return

  const supabase = useSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (!error && data.user) return

  if (import.meta.client) {
    await supabase.auth.signOut({ scope: 'local' })
  }

  if (isAdminV2) {
    return navigateTo({
      path: '/adminV2/login',
      query: { redirect: to.fullPath }
    }, { replace: true })
  }

  return navigateTo('/admin/login', { replace: true })
})
