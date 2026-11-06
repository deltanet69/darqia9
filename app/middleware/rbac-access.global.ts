// Penjaga rute RBAC: modul AdminV2 hanya bisa dibuka bila peran pengguna
// (sesuai penugasan + cakupan jenjangnya) memiliki izin Lihat untuk modul itu.
// Penegakan aktif hanya untuk pengguna yang sudah ditugaskan sebuah peran;
// kegagalan apa pun di jalur ini tidak pernah mengunci pengguna (fail-open),
// penegakan kerasnya berada di RLS database (fungsi public.rbac_can).
import { modulDariPath } from '~/composables/rbacCore'
import { useRbac } from '~/composables/useRbac'

export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path.toLowerCase()
  if (!path.startsWith('/adminv2') && !path.startsWith('/admin/tabungan')) return
  if (path === '/adminv2/login') return

  // Pengaturan berbagi halaman Profil (?tab=pengaturan), jadi dibedakan lewat query.
  const modul = path === '/adminv2/profil' && to.query.tab === 'pengaturan' ? 'Pengaturan' : modulDariPath(path)
  if (modul === null) return

  try {
    const rbac = useRbac()
    await rbac.muat()
    if (!rbac.penegakanAktif.value) return
    if (!rbac.bisaSaya(modul, 'lihat')) {
      return navigateTo('/adminV2', { replace: true })
    }
  } catch {
    return
  }
})
