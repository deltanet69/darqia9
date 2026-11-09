export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path.toLowerCase()
  if (!path.startsWith('/adminv2')) return
  if (path === '/adminv2/login') return

  const supabase = useSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (!error && data.user) return

  if (import.meta.client) {
    await supabase.auth.signOut({ scope: 'local' })
  }

  return navigateTo({
    path: '/adminV2/login',
    query: { redirect: to.fullPath }
  }, { replace: true })
})
