// Di domain live, beranda modul tampil sebagai "/" (smpitbca.sch.id, bukan smpitbca.sch.id/smp).
// Rute beranda modul diberi alias "/"; web sekolah juga tanpa awalan (smpitbca.sch.id/berita);
// di domain absen kelas diakses lewat /<kelas>. Host tak terdaftar (localhost, Vercel) memakai rute bawaan.
import type { RouterConfig } from 'nuxt/schema'
import { adalahHostAbsen, awalanSekolahHost, berandaHost } from '~/composables/domainCore'

export default {
  routes: (routes) => {
    const { hostname } = useRequestURL()
    const sekolah = awalanSekolahHost(hostname)
    if (sekolah) {
      // "/" dan "/spmb" bawaan (beranda yayasan, pemilih unit SPMB) digantikan halaman web sekolah
      return routes
        .filter(r => r.path !== '/' && r.path !== '/spmb')
        .map((r) => {
          const p = r.path.toLowerCase()
          return p === sekolah || p.startsWith(sekolah + '/') ? { ...r, alias: [r.path.slice(sekolah.length) || '/'] } : r
        })
    }
    const awal = berandaHost(hostname)
    if (!awal || awal === '/') return routes
    const absen = adalahHostAbsen(hostname)
    return routes
      .filter(r => r.path !== '/')
      .map((r) => {
        if (r.path.toLowerCase() === awal.toLowerCase()) return { ...r, alias: ['/'] }
        if (absen && r.path.startsWith('/absensi/:kode')) return { ...r, alias: ['/:kode()'] }
        return r
      })
  }
} satisfies RouterConfig
