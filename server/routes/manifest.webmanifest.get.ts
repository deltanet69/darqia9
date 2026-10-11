// Manifest PWA dinamis per host + konteks halaman.
//
// Satu codebase Nuxt melayani banyak host (web yayasan, web SMP/SMK,
// cbt.smp*, cbt.smk*, parent.*). Manifest tidak bisa statis karena
// nama aplikasi & ikon harus ngikutin subdomain yang dibuka.
//
// v2: install dari halaman /cbt harus membuka /cbt saat aplikasi
// diluncurkan (start_url), bukan web utama. Konteks halaman dikirim
// eksplisit lewat query ?app= oleh plugin PWA (app/plugins/pwa.client.ts)
// — deterministik & aman dari cache CDN (tidak pakai Referer).
// Setiap varian punya `id` unik agar tidak dianggap aplikasi yang sama.
//
// Route ini dibaca browser lewat <link rel="manifest" href="/manifest.webmanifest">.
//
// Kriteria install Chrome (Android): manifest valid + ikon 192 & 512
// + service worker terdaftar (public/sw.js) + HTTPS.
export default defineEventHandler((event) => {
  const host = (getHeader(event, 'host') || '').split(':')[0].toLowerCase()
  const app = String(getQuery(event).app || '').toLowerCase()
  setResponseHeader(event, 'content-type', 'application/manifest+json')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')
  return manifestFor(host, app)
})

type School = 'smp' | 'smk'

function schoolOf(host: string): School | null {
  // cbt.smpitbca.sch.id -> 'smp' ; cbt.smkitattaqwa9.sch.id -> 'smk'
  // parent.smpitbca.sch.id -> 'smp' ; dst. Tidak hardcode domain penuh,
  // hanya pola subdomain, sesuai aturan INFRA.md (no hardcode domain).
  const seg = host.split('.')[1] || ''
  if (seg.startsWith('smp')) return 'smp'
  if (seg.startsWith('smk')) return 'smk'
  return null
}

function iconsFor(school: School) {
  return [192, 512].map((s) => ({
    src: `/icons/${school}-${s}.png`,
    sizes: `${s}x${s}`,
    type: 'image/png',
    purpose: 'any maskable',
  }))
}

interface Variant {
  id: string
  school: School
  name: string
  shortName: string
  themeColor: string
  startUrl: string
  scope: string
}

function toManifest(v: Variant) {
  return {
    id: v.id,
    name: v.name,
    short_name: v.shortName,
    description: v.name,
    lang: 'id',
    dir: 'ltr',
    start_url: v.startUrl,
    scope: v.scope,
    display: 'standalone',
    background_color: v.themeColor,
    theme_color: v.themeColor,
    icons: iconsFor(v.school),
  }
}

function manifestFor(host: string, app: string) {
  const sub = host.split('.')[0]
  const school = schoolOf(host)
  const isCbt = sub === 'cbt' || app === 'cbt'

  if (isCbt && school === 'smp') {
    return toManifest({ id: 'cbt-smp', school: 'smp', name: 'CBT SMP IT Bina Cendekia Assalam', shortName: 'CBT SMP', themeColor: '#15803d', startUrl: '/cbt', scope: '/cbt' })
  }
  if (isCbt && school === 'smk') {
    return toManifest({ id: 'cbt-smk', school: 'smk', name: 'CBT SMK IT Attaqwa 9', shortName: 'CBT SMK', themeColor: '#0A2A5C', startUrl: '/cbt', scope: '/cbt' })
  }
  if (isCbt) {
    // Staging/localhost: host tidak membawa info sekolah.
    return toManifest({ id: 'cbt', school: 'smk', name: 'CBT Darqia Attaqwa', shortName: 'CBT Darqia', themeColor: '#0A2A5C', startUrl: '/cbt', scope: '/cbt' })
  }
  if (sub === 'parent' && school === 'smp') {
    return toManifest({ id: 'ortu-smp', school: 'smp', name: 'Portal Orang Tua SMP IT Bina Cendekia Assalam', shortName: 'Ortu SMP', themeColor: '#15803d', startUrl: '/', scope: '/' })
  }
  if (sub === 'parent' && school === 'smk') {
    return toManifest({ id: 'ortu-smk', school: 'smk', name: 'Portal Orang Tua SMK IT Attaqwa 9', shortName: 'Ortu SMK', themeColor: '#0A2A5C', startUrl: '/', scope: '/' })
  }
  // Default: host lain (portal yayasan, web SMP/SMK, localhost, staging).
  // Tetap installable dengan branding utama, tidak merusak apa pun.
  return toManifest({ id: 'darqia', school: 'smk', name: 'Darqia Attaqwa', shortName: 'Darqia', themeColor: '#0A2A5C', startUrl: '/', scope: '/' })
}
