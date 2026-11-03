// Lapisan data Perpustakaan Digital (migrasi 0028):
// - Katalog dibaca dari perpus_buku + perpus_bab (RLS baca publik — isi SIBI
//   memang terbuka). Selama 0028 belum dijalankan: mode contoh lokal dengan
//   data identik seed (perpusContoh.ts) + banner penanda, pola yang sama
//   seperti Tiketing/Keuangan sebelum migrasinya jalan.
// - Login NIS diverifikasi server (/api/perpus/login, service role) —
//   halaman publik tidak pernah membaca tabel students langsung.
// - Sesi + progres + rak tersimpan di localStorage perangkat (per NIS),
//   persis desain preview v8: "sesi tersimpan di perangkat ini".
import { computed, ref } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  jurusanDariKelas, tingkatDariKelas,
  type Buku, type PetaProgres, type SesiSiswa
} from './perpusCore'
import { BUKU_CONTOH, SISWA_CONTOH } from './perpusContoh'

interface KeadaanPerpus {
  keadaan: 'siap' | 'belum-migrasi' | 'galat'
  memuat: boolean
  termuat: boolean
  buku: Buku[]
  sesi: SesiSiswa | null
  prog: PetaProgres
  rak: string[]
}

const buatAwal = (): KeadaanPerpus => ({
  keadaan: 'siap', memuat: false, termuat: false, buku: [], sesi: null, prog: {}, rak: []
})

const kunci = (nis: string, apa: string) => `perpusv1_${nis}_${apa}`

export const usePerpus = () => {
  const client = useSupabaseClient() as unknown as SupabaseClient
  const state = useState<KeadaanPerpus>('perpus', buatAwal)
  const pesanGalat = ref('')
  const toastTeks = ref('')
  let toastTimer: ReturnType<typeof setTimeout> | undefined

  const lokal = computed(() => state.value.keadaan === 'belum-migrasi')

  const tampilToast = (teks: string) => {
    toastTeks.value = teks
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastTeks.value = '' }, 2300)
  }

  const masukModeLokal = () => {
    if (state.value.keadaan === 'belum-migrasi') return
    state.value.keadaan = 'belum-migrasi'
    state.value.buku = structuredClone(BUKU_CONTOH)
    state.value.termuat = true
  }

  const tanganiGalat = (error: any): boolean => {
    const pesan = String(error?.message || error || '')
    if (error?.code === '42P01' || error?.code === 'PGRST205' || /does not exist|schema cache|Could not find the table/i.test(pesan)) {
      masukModeLokal()
      return true
    }
    pesanGalat.value = pesan
    return false
  }

  const muatBuku = async () => {
    if (state.value.termuat || state.value.memuat) return
    state.value.memuat = true
    try {
      const [bukuRes, babRes] = await Promise.all([
        client.from('perpus_buku').select('*').eq('aktif', true).order('urutan'),
        client.from('perpus_bab').select('buku_id, urut, judul, isi').order('urut')
      ])
      if (bukuRes.error) throw bukuRes.error
      if (babRes.error) throw babRes.error
      const babPerBuku = new Map<string, Buku['bab']>()
      for (const r of babRes.data || []) {
        const arr = babPerBuku.get(r.buku_id) || []
        arr.push({ judul: r.judul, isi: r.isi })
        babPerBuku.set(r.buku_id, arr)
      }
      state.value.buku = (bukuRes.data || []).map((b: any) => ({
        id: b.id, judul: b.judul, lit: !!b.lit, tingkat: b.tingkat, mapel: b.mapel, jurusan: b.jurusan || '',
        pengarang: b.pengarang, penerbit: b.penerbit, tahun: b.tahun, halaman: b.halaman,
        gradasi: b.gradasi, inisial: b.inisial, deskripsi: b.deskripsi, rating: Number(b.rating),
        bab: babPerBuku.get(b.id) || []
      }))
      state.value.keadaan = 'siap'
      state.value.termuat = true
    } catch (e) {
      if (!tanganiGalat(e)) state.value.keadaan = 'galat'
    } finally {
      state.value.memuat = false
    }
  }

  const muatProgRak = (nis: string) => {
    try {
      state.value.prog = JSON.parse(localStorage.getItem(kunci(nis, 'prog')) || '{}')
      state.value.rak = JSON.parse(localStorage.getItem(kunci(nis, 'rak')) || '[]')
    } catch { state.value.prog = {}; state.value.rak = [] }
  }

  const tetapkanSesi = (sesi: SesiSiswa) => {
    state.value.sesi = sesi
    try { localStorage.setItem('perpusv1_sesi', JSON.stringify(sesi)) } catch { /* abaikan */ }
    muatProgRak(sesi.nis)
  }

  // Pulihkan sesi dari perangkat (dijalankan sekali di sisi klien).
  const pulihkanSesi = () => {
    if (state.value.sesi) return
    try {
      const mentah = localStorage.getItem('perpusv1_sesi')
      if (!mentah) return
      const sesi = JSON.parse(mentah) as SesiSiswa
      if (sesi?.nis && sesi?.nama) tetapkanSesi(sesi)
    } catch { /* sesi rusak -> abaikan, siswa login ulang */ }
  }

  const login = async (nisMentah: string): Promise<void> => {
    const nis = nisMentah.trim()
    if (!nis) throw new Error('Isi dulu NIS kamu.')
    if (lokal.value) {
      const s = SISWA_CONTOH.find(x => x.nis === nis)
      if (!s) throw new Error('NIS tidak terdaftar atau status siswa tidak aktif. Periksa kembali NIS kamu, atau hubungi petugas perpustakaan.')
      tetapkanSesi({ nis: s.nis, nama: s.nama, grade: 'SMK', kelas: s.kelas, tingkat: s.tingkat, jurusan: s.jurusan })
      return
    }
    const hasil: any = await $fetch('/api/perpus/login', { method: 'POST', body: { nis } }).catch(() => null)
    if (!hasil?.ok || !hasil?.siswa) {
      throw new Error('NIS tidak terdaftar atau status siswa tidak aktif. Periksa kembali NIS kamu, atau hubungi petugas perpustakaan.')
    }
    const s = hasil.siswa
    tetapkanSesi({
      nis: s.nis, nama: s.nama, grade: s.grade || 'SMK', kelas: s.kelas || '',
      tingkat: tingkatDariKelas(s.kelas || '', s.grade || 'SMK'),
      jurusan: jurusanDariKelas(s.kelas || '')
    })
  }

  const keluar = () => {
    state.value.sesi = null
    state.value.prog = {}
    state.value.rak = []
    try { localStorage.removeItem('perpusv1_sesi') } catch { /* abaikan */ }
  }

  const simpanProgRak = () => {
    const nis = state.value.sesi?.nis
    if (!nis) return
    try {
      localStorage.setItem(kunci(nis, 'prog'), JSON.stringify(state.value.prog))
      localStorage.setItem(kunci(nis, 'rak'), JSON.stringify(state.value.rak))
    } catch { /* abaikan */ }
  }

  // Catat bab terjauh yang dibuka (progres hanya maju, seperti preview).
  const catatBaca = (bukuId: string, babIdx: number) => {
    if (state.value.prog[bukuId] == null || babIdx > state.value.prog[bukuId]) {
      state.value.prog[bukuId] = babIdx
      simpanProgRak()
    }
  }

  const alihRak = (bukuId: string): boolean => {
    if (state.value.rak.includes(bukuId)) {
      state.value.rak = state.value.rak.filter(x => x !== bukuId)
      simpanProgRak()
      return false
    }
    state.value.rak.push(bukuId)
    simpanProgRak()
    return true
  }

  return {
    state, lokal, pesanGalat, toastTeks, tampilToast,
    muatBuku, pulihkanSesi, login, keluar, catatBaca, alihRak
  }
}
