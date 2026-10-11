// Daftarkan service worker PWA. Hanya jalan di browser (.client.ts).
// Gagal daftar (mis. konteks non-HTTPS) bukan fatal — diabaikan diam-diam.
export default defineNuxtPlugin(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }
})
