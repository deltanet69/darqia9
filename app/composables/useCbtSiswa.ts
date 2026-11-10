import type { RekapUjian, UjianSiswa } from '~/utils/cbtSiswaJadwal'

// Sesi & data aplikasi CBT siswa. Satu panggilan login membawa profil + jadwal (tanpa soal) dan hasilnya
// disimpan di state bersama + sessionStorage: pindah tab/refresh tidak mengunduh ulang selama masih segar.
export interface ProfilSiswa {
  nama: string
  nis: string
  nisn: string
  jenjang: 'SMP' | 'SMK'
  gender: 'L' | 'P'
  kelas: string | null
  tempatLahir: string | null
  tanggalLahir: string | null
  agama: string | null
  angkatan: number | null
  token: string
  ruang: string | null
}

export interface SesiSiswa { nis: string, token: string, grade: 'SMP' | 'SMK' }

interface KeadaanSiswa {
  sesi: SesiSiswa | null
  siswa: ProfilSiswa | null
  ujian: UjianSiswa[]
  rekap: RekapUjian[] | null
  selisihJam: number // jam server - jam perangkat (ms), agar jam HP yang salah tidak berpengaruh
  jadwalAt: number
  rekapAt: number
  memuat: boolean
}

const KUNCI_SESI = 'cbt_sesi_v1'
const KUNCI_CACHE = 'cbt_cache_v1'
const SEGAR_MS = 60_000

const awal = (): KeadaanSiswa => ({ sesi: null, siswa: null, ujian: [], rekap: null, selisihJam: 0, jadwalAt: 0, rekapAt: 0, memuat: false })

const simpanLokal = (kunci: string, nilai: unknown) => { try { sessionStorage.setItem(kunci, JSON.stringify(nilai)) } catch { /* penyimpanan tidak tersedia */ } }
const bacaLokal = <T>(kunci: string): T | null => { try { return JSON.parse(sessionStorage.getItem(kunci) || 'null') as T | null } catch { return null } }

export const useCbtSiswa = () => {
  const state = useState<KeadaanSiswa>('cbt-siswa', awal)

  const sekarang = () => Date.now() + state.value.selisihJam

  const terapkanLogin = (data: any) => {
    state.value.siswa = data.siswa
    state.value.ujian = data.ujian || []
    state.value.selisihJam = data.serverNow ? new Date(data.serverNow).getTime() - Date.now() : 0
    state.value.jadwalAt = Date.now()
    simpanLokal(KUNCI_CACHE, { siswa: state.value.siswa, ujian: state.value.ujian, selisihJam: state.value.selisihJam, jadwalAt: state.value.jadwalAt })
  }

  const keluar = () => {
    Object.assign(state.value, awal())
    try { sessionStorage.removeItem(KUNCI_SESI); sessionStorage.removeItem(KUNCI_CACHE); sessionStorage.removeItem('cbt_aktif_v1') } catch { /* abaikan */ }
  }

  const masuk = async (nis: string, token: string, grade: 'SMP' | 'SMK') => {
    const data = await $fetch<any>('/api/cbt/login', { method: 'POST', body: { nis, token, grade } })
    Object.assign(state.value, awal())
    state.value.sesi = { nis: data.siswa.nis, token: data.siswa.token, grade }
    simpanLokal(KUNCI_SESI, state.value.sesi)
    terapkanLogin(data)
  }

  // Pulihkan sesi setelah refresh: data tersimpan tampil seketika, lalu disegarkan di latar belakang.
  const pulihkan = (): boolean => {
    if (state.value.sesi) return true
    const sesi = bacaLokal<SesiSiswa>(KUNCI_SESI)
    const cache = bacaLokal<{ siswa: ProfilSiswa, ujian: UjianSiswa[], selisihJam: number, jadwalAt: number }>(KUNCI_CACHE)
    if (!sesi || !cache) return false
    state.value.sesi = sesi
    state.value.siswa = cache.siswa
    state.value.ujian = cache.ujian
    state.value.selisihJam = cache.selisihJam
    state.value.jadwalAt = cache.jadwalAt
    return true
  }

  // Segarkan jadwal bila sudah lewat 1 menit (atau dipaksa). Sesi yang ditolak server (token berubah) dikeluarkan.
  const muatJadwal = async (paksa = false): Promise<boolean> => {
    const sesi = state.value.sesi
    if (!sesi || state.value.memuat) return false
    if (!paksa && Date.now() - state.value.jadwalAt < SEGAR_MS) return true
    state.value.memuat = true
    try {
      terapkanLogin(await $fetch<any>('/api/cbt/login', { method: 'POST', body: { nis: sesi.nis, token: sesi.token, grade: sesi.grade } }))
      return true
    } catch (e: any) {
      if (e?.statusCode === 401) keluar()
      return false
    } finally { state.value.memuat = false }
  }

  const muatRekap = async (paksa = false) => {
    const sesi = state.value.sesi
    if (!sesi) return
    if (!paksa && state.value.rekap && Date.now() - state.value.rekapAt < SEGAR_MS) return
    try {
      state.value.rekap = await $fetch<RekapUjian[]>('/api/cbt/rekap', { method: 'POST', body: { nis: sesi.nis, token: sesi.token, grade: sesi.grade } })
      state.value.rekapAt = Date.now()
    } catch { /* data lama tetap tampil; coba lagi saat tab dibuka */ }
  }

  // Dipakai setelah mengumpulkan ujian: jadwal & rekap harus diambil ulang.
  const kadaluwarsa = () => { state.value.jadwalAt = 0; state.value.rekapAt = 0 }

  return { state, sekarang, masuk, pulihkan, muatJadwal, muatRekap, kadaluwarsa, keluar }
}
