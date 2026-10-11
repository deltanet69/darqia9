// Service worker minimal Darqia 9.
//
// Tugasnya: memenuhi kriteria install PWA Chrome (fetch handler wajib ada)
// dan langsung mengambil alih klien. SENGAJA tidak melakukan caching agresif:
// data ujian CBT, API, dan halaman dinamis tidak boleh disajikan dari cache basi.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
