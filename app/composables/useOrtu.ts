// State bersama Portal Orang Tua: sesi (tanpa data sensitif), tema jenjang, ringkasan + pemberitahuan, toast.
// Token sesi hanya ada di cookie httpOnly; tidak ada apa pun yang rahasia di localStorage.
import type { RingkasanOrtu, SesiOrtuKlien } from '~/types/ortu'
import { TEMA_ORTU } from '~/composables/ortuCore'

const KUNCI_DIBACA = 'ortu-notif-dibaca'
// Satu permintaan ringkasan yang sedang berjalan dipakai bersama (layout + Beranda memuat bersamaan).
let ringkasanJalan: Promise<RingkasanOrtu> | null = null

export const useOrtu = () => {
  const sesi = useState<SesiOrtuKlien | null>('ortu-sesi', () => null)
  const ringkasan = useState<RingkasanOrtu | null>('ortu-ringkasan', () => null)
  const dibaca = useState<Record<string, number> | null>('ortu-dibaca', () => null)
  const toast = useState<{ teks: string, n: number }>('ortu-toast', () => ({ teks: '', n: 0 }))

  const tema = computed(() => TEMA_ORTU[sesi.value?.jenjang ?? 'SMK'])
  const gayaTema = (t = tema.value) => `--p0:${t.p0};--p1:${t.p1};--soft:${t.soft}`

  const reset = () => { sesi.value = null; ringkasan.value = null }

  // Semua panggilan /api/ortu/* lewat sini: 401 -> halaman masuk; 403 GANTI_PASSWORD -> layar ganti kata sandi.
  async function api<T>(url: string, opsi: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    try {
      return await $fetch<T>(url, opsi as any)
    } catch (e: any) {
      const status = e?.statusCode ?? e?.response?.status
      if (status === 401) { reset(); await navigateTo('/ortu/login', { replace: true }) }
      else if (status === 403 && e?.data?.data?.kode === 'GANTI_PASSWORD') {
        if (sesi.value) sesi.value.wajibGanti = true
        await navigateTo('/ortu/login?ganti=1', { replace: true })
      }
      throw e
    }
  }
  const pesanGalat = (e: any): string => e?.data?.statusMessage || e?.data?.message || 'Terjadi gangguan. Periksa koneksi lalu coba lagi.'

  const muatRingkasan = async (paksa = false): Promise<RingkasanOrtu> => {
    if (ringkasan.value && !paksa) return ringkasan.value
    ringkasanJalan ??= api<RingkasanOrtu>('/api/ortu/ringkasan').finally(() => { ringkasanJalan = null })
    ringkasan.value = await ringkasanJalan
    return ringkasan.value
  }

  const bacaDibaca = (): Record<string, number> => {
    if (dibaca.value) return dibaca.value
    let isi: Record<string, number> = {}
    try { isi = JSON.parse(localStorage.getItem(KUNCI_DIBACA) || '{}') || {} } catch { /* penyimpanan tidak tersedia */ }
    dibaca.value = isi
    return isi
  }
  const tandaiDibaca = (ids: string[]) => {
    const isi = { ...bacaDibaca() }
    const kini = Date.now()
    for (const id of ids) isi[id] ??= kini
    // Simpan maks. 200 entri terbaru agar penyimpanan tidak membengkak.
    const rapi = Object.fromEntries(Object.entries(isi).sort((a, b) => b[1] - a[1]).slice(0, 200))
    dibaca.value = rapi
    try { localStorage.setItem(KUNCI_DIBACA, JSON.stringify(rapi)) } catch { /* abaikan */ }
  }

  const tampilToast = (teks: string) => {
    const n = toast.value.n + 1
    toast.value = { teks, n }
    setTimeout(() => { if (toast.value.n === n) toast.value = { teks: '', n } }, 2400)
  }

  const keluar = async () => {
    await $fetch('/api/ortu/logout', { method: 'POST' }).catch(() => {})
    reset()
    await navigateTo('/ortu/login', { replace: true })
  }

  return { sesi, ringkasan, tema, gayaTema, api, pesanGalat, muatRingkasan, dibaca, bacaDibaca, tandaiDibaca, toast, tampilToast, keluar }
}
