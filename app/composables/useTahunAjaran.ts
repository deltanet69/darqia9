// State global Tahun Ajaran AdminV2 — hasil meeting manajemen 4 Nov 2026 (butir 5).
// Pola sama seperti useAdminGrade: satu useState bersama untuk seluruh AdminV2.
// Opsi selalu berasal dari tahun yang EXISTING di tabel classes (academic_year),
// tidak pernah mengarang tahun. Pilihan tersimpan di localStorage per perangkat.
import { useState } from 'nuxt/app'
import { TAHUN_AJARAN_BAWAAN, daftarTahunUnik, pastikanPilihan, tahunAjaranSah } from './tahunAjaranCore'

const KUNCI_SIMPAN = 'darqia-admin-tahun-ajaran'

export function useTahunAjaran() {
  const tahun = useState<string>('adminTahunAjaran', () => TAHUN_AJARAN_BAWAAN)
  const opsi = useState<string[]>('adminTahunAjaranOpsi', () => [TAHUN_AJARAN_BAWAAN])
  const termuat = useState<boolean>('adminTahunAjaranTermuat', () => false)

  // Muat opsi dari classes + pulihkan pilihan tersimpan. Client-only, sekali saja.
  // Kegagalan baca data tidak menggagalkan halaman: opsi bawaan tetap dipakai.
  async function muatOpsi() {
    if (!import.meta.client || termuat.value) return
    termuat.value = true
    try {
      const simpan = localStorage.getItem(KUNCI_SIMPAN)
      if (tahunAjaranSah(simpan)) tahun.value = simpan
    } catch { /* abaikan */ }
    try {
      const client = useSupabaseClient()
      const { data } = await client.from('classes').select('academic_year').eq('active', true)
      if (data && data.length) {
        const unik = daftarTahunUnik(data.map((r) => (r as { academic_year: string }).academic_year))
        if (unik.length) {
          opsi.value = unik
          tahun.value = pastikanPilihan(unik, tahun.value)
        }
      }
    } catch { /* abaikan: tetap pakai opsi bawaan */ }
  }

  function pilih(nilai: string) {
    if (!tahunAjaranSah(nilai)) return
    tahun.value = nilai
    if (import.meta.client) {
      try { localStorage.setItem(KUNCI_SIMPAN, nilai) } catch { /* abaikan */ }
    }
  }

  return { tahun, opsi, muatOpsi, pilih }
}
