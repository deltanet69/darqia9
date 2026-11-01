// Menangkap galat aplikasi (galat Vue + promise tak tertangani) ke Log
// Aktivitas sebagai bahan pemecahan masalah/bottleneck. Dibatasi keras:
// jeda minimal 3 detik antarcatatan dan pesan yang sama tidak dicatat
// ulang dalam 30 detik, supaya log tidak banjir saat galat beruntun.
export default defineNuxtPlugin((nuxtApp) => {
  let terakhir = 0
  let pesanTerakhir = ''
  const tangkap = (pesan: string) => {
    const bersih = String(pesan || 'Galat tidak dikenal').slice(0, 200)
    const kini = Date.now()
    if (kini - terakhir < 3000 || (bersih === pesanTerakhir && kini - terakhir < 30000)) return
    terakhir = kini
    pesanTerakhir = bersih
    try { useLogAktivitas().catat('Sistem', 'error', bersih, 'galat') } catch { /* abaikan */ }
  }
  nuxtApp.hook('vue:error', (err: any) => tangkap(err?.message || String(err)))
  window.addEventListener('unhandledrejection', (e: any) => tangkap(e?.reason?.message || String(e?.reason || '')))
})
