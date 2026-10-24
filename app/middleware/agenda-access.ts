export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/adminV2/login')
  }

  const client = useSupabaseClient()
  const [adminResult, teacherResult] = await Promise.all([
    client.rpc('agenda_is_admin'),
    client.rpc('agenda_current_teacher_id')
  ])

  if (adminResult.error || teacherResult.error) {
    return navigateTo('/adminV2?agenda=verifikasi-akses-gagal')
  }

  if (adminResult.data === true || teacherResult.data) return

  return navigateTo('/adminV2?agenda=akses-ditolak')
})
