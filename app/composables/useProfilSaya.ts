// Store Profil Saya — satu-satunya jalur baca/tulis profil akun yang sedang login.
// Semua lewat /api/profil (server mengunci ke uid sesi), jadi data tidak bisa tertukar antar guru.
import { computed } from 'vue'
import {
  bangunProfil, daftarAplikasi, EMAIL_UTAMA, ukuranKompres,
  type AkunInfo, type GuruRow, type LogRow, type PrefNotifikasi
} from './profilCore'

interface ProfilState {
  akun: AkunInfo | null
  guru: GuruRow | null
  aktivitas: LogRow[]
  login: LogRow[]
  termuat: boolean
  galat: string
}

const pesanGalat = (e: any, cadangan: string) => e?.data?.statusMessage || e?.statusMessage || e?.message || cadangan

export const useProfilSaya = () => {
  const state = useState<ProfilState>('profil-saya', () => ({ akun: null, guru: null, aktivitas: [], login: [], termuat: false, galat: '' }))
  const rbac = useRbac()

  const muat = async () => {
    try {
      const hasil = await $fetch<any>('/api/profil')
      state.value = { ...state.value, ...hasil, termuat: true, galat: '' }
    } catch (e) {
      state.value.galat = pesanGalat(e, 'Profil gagal dimuat.')
      state.value.termuat = true
    }
  }

  const utama = computed(() => (state.value.akun?.email || '').toLowerCase() === EMAIL_UTAMA)
  const peranNama = computed(() => {
    if (utama.value) return 'Superadmin Utama'
    return rbac.peranSaya.value?.nama || 'Belum ada peran'
  })
  const profil = computed(() => state.value.akun ? bangunProfil(state.value.akun, state.value.guru, peranNama.value) : null)
  const aplikasi = computed(() => {
    const peran = rbac.peranSaya.value
    const izin = peran ? rbac.state.value.izin[peran.id] || null : null
    return daftarAplikasi({ terkunci: utama.value || !!peran?.terkunci, izin })
  })
  const cakupan = computed(() => utama.value ? ['SMP', 'SMK'] : rbac.penugasanSaya.value?.jenjang || [])

  const simpanData = async (data: Record<string, string>): Promise<string> => {
    try {
      await $fetch('/api/profil', { method: 'PATCH', body: { data } })
      await muat()
      return ''
    } catch (e) { return pesanGalat(e, 'Perubahan gagal disimpan.') }
  }

  const simpanPengaturan = async (body: { prefs?: PrefNotifikasi; tema?: number }): Promise<string> => {
    try {
      await $fetch('/api/profil', { method: 'PATCH', body })
      await muat()
      return ''
    } catch (e) { return pesanGalat(e, 'Pengaturan gagal disimpan.') }
  }

  // Kompres di browser: potong persegi, maks 512 px, WebP 0.85 (JPEG bila WebP tak didukung).
  const kompres = async (file: File): Promise<string> => {
    const bmp = await createImageBitmap(file)
    const u = ukuranKompres(bmp.width, bmp.height, 512)
    const kanvas = document.createElement('canvas')
    kanvas.width = u.dw
    kanvas.height = u.dh
    const ctx = kanvas.getContext('2d')
    if (!ctx) throw new Error('Browser tidak mendukung pemrosesan gambar.')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bmp, u.sx, u.sy, u.sw, u.sh, 0, 0, u.dw, u.dh)
    for (const mutu of [0.85, 0.7, 0.55]) {
      for (const tipe of ['image/webp', 'image/jpeg']) {
        const blob: Blob | null = await new Promise(r => kanvas.toBlob(r, tipe, mutu))
        if (blob && blob.type === tipe && blob.size <= 300 * 1024) {
          return await new Promise<string>((ok, gagal) => {
            const fr = new FileReader()
            fr.onload = () => ok(String(fr.result))
            fr.onerror = () => gagal(new Error('Foto gagal dibaca.'))
            fr.readAsDataURL(blob)
          })
        }
      }
    }
    throw new Error('Foto terlalu besar setelah dikompres. Coba foto lain.')
  }

  const unggahFoto = async (file: File): Promise<string> => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return 'Format foto harus JPG, PNG, atau WebP.'
    if (file.size > 15 * 1024 * 1024) return 'Ukuran foto asli maksimal 15 MB.'
    try {
      const gambar = await kompres(file)
      await $fetch('/api/profil/foto', { method: 'POST', body: { gambar } })
      await muat()
      return ''
    } catch (e) { return pesanGalat(e, 'Foto gagal diunggah.') }
  }

  const ubahSandi = async (lama: string, baru: string): Promise<string> => {
    const client = useSupabaseClient()
    const email = state.value.akun?.email
    if (!email) return 'Akun tidak dikenali. Muat ulang halaman.'
    const { error: errLama } = await client.auth.signInWithPassword({ email, password: lama })
    if (errLama) return 'Kata sandi saat ini tidak cocok.'
    const { error } = await client.auth.updateUser({ password: baru })
    if (error) return `Kata sandi gagal diganti: ${error.message}`
    useLogAktivitas().catat('Sistem', 'ubah sandi', 'Mengganti kata sandi akun')
    return ''
  }

  return { state, muat, profil, aplikasi, cakupan, peranNama, simpanData, simpanPengaturan, unggahFoto, ubahSandi }
}
