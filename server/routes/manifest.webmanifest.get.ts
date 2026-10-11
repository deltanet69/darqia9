// Manifest PWA dinamis per host.
//
// Satu codebase Nuxt melayani banyak host (web yayasan, web SMP/SMK,
// cbt.smp*, cbt.smk*, parent.*). Manifest tidak bisa statis karena
// nama aplikasi & ikon harus ngikutin subdomain yang dibuka.
// Route ini dibaca browser lewat <link rel="manifest" href="/manifest.webmanifest">.
//
// Kriteria install Chrome (Android): manifest valid + ikon 192 & 512
// + service worker terdaftar (public/sw.js) + HTTPS.
export default defineEventHandler((event) => {
  const host = (getHeader(event, 'host') || '').split(':')[0].toLowerCase()
  setResponseHeader(event, 'content-type', 'application/manifest+json')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')
  return manifestForHost(host)
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

function baseManifest(school: School, name: string, shortName: string, themeColor: string) {
  return {
    name,
    short_name: shortName,
    description: name,
    lang: 'id',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: themeColor,
    theme_color: themeColor,
    icons: iconsFor(school),
  }
}

function manifestForHost(host: string) {
  const sub = host.split('.')[0]
  const school = schoolOf(host)

  if (sub === 'cbt' && school === 'smp') {
    return baseManifest(school, 'CBT SMP IT Bina Cendekia Assalam', 'CBT SMP', '#15803d')
  }
  if (sub === 'cbt' && school === 'smk') {
    return baseManifest(school, 'CBT SMK IT Attaqwa 9', 'CBT SMK', '#0A2A5C')
  }
  if (sub === 'parent' && school === 'smp') {
    return baseManifest(school, 'Portal Orang Tua SMP IT Bina Cendekia Assalam', 'Ortu SMP', '#15803d')
  }
  if (sub === 'parent' && school === 'smk') {
    return baseManifest(school, 'Portal Orang Tua SMK IT Attaqwa 9', 'Ortu SMK', '#0A2A5C')
  }
  // Default: host lain (portal yayasan, web SMP/SMK, localhost, staging).
  // Tetap installable dengan branding utama, tidak merusak apa pun.
  return baseManifest('smk', 'Darqia Attaqwa', 'Darqia', '#0A2A5C')
}
