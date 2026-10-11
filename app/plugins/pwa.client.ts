// Daftarkan service worker PWA + sesuaikan manifest per halaman.
// Hanya jalan di browser (.client.ts).
//
// Kenapa manifest diganti per route: install dari /cbt harus membuka /cbt
// saat aplikasi diluncurkan (start_url), bukan web utama. Konteks dikirim
// eksplisit via query ?app= ke route manifest — deterministik & aman dari
// cache CDN. Ganti href membuat browser fetch ulang manifest yang sesuai.
//
// Gagal daftar SW (mis. konteks non-HTTPS) bukan fatal — diabaikan diam-diam.
export default defineNuxtPlugin(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }

  const setManifest = (path: string) => {
    const app = path.split('/')[1] === 'cbt' ? 'cbt' : ''
    const href = app ? `/manifest.webmanifest?app=${app}` : '/manifest.webmanifest'
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'manifest'
      document.head.appendChild(link)
    }
    if (link.getAttribute('href') !== href) link.setAttribute('href', href)
  }

  const route = useRoute()
  setManifest(route.path)
  // Navigasi SPA: ganti manifest saat pindah halaman.
  useRouter().afterEach((to) => setManifest(to.path))
})
