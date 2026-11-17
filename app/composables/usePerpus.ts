// Keadaan bersama Perpustakaan Digital (klien): masuk Google + verifikasi NIS/NISN, katalog, kisi-kisi,
// dan data baca per siswa (disimpan ke server). Satu instance untuk seluruh komponen perpus.
import { computed } from 'vue'
import { useState } from '#app'
import { useSupabaseClient } from '#imports'
import { jenjangHost } from '~/composables/domainCore'
import { dataBaru, gabungBaca, kapan, type Buku, type DataSiswa, type SesiPerpus } from '~/composables/perpusCore'

export interface TopikKisiBuku { t: string, i: string, buku: Array<{ id: string, skor: number }> }
export interface Kisi { id: string, judul: string, mapel: string, hari: number, topik: TopikKisiBuku[] }
type Tahap = 'memuat' | 'awal' | 'verifikasi' | 'masuk'
type Tab = 'beranda' | 'katalog' | 'belajar' | 'koleksi' | 'profil'

export interface Notif {
  id: string, ts: number, waktu: string, jenis: string, judul: string, isi: string
  kisiId?: string, mapel?: string, buku?: Buku, hal?: number
}

let simpanTimer: ReturnType<typeof setTimeout> | undefined
let toastTimer: ReturnType<typeof setTimeout> | undefined
let terpasang = false
let catatanCb: ((v: string) => void) | null = null

export function usePerpus() {
  const supabase = useSupabaseClient()
  const tahap = useState<Tahap>('perpus-tahap', () => 'memuat')
  const email = useState('perpus-email', () => '')
  const siswa = useState<SesiPerpus | null>('perpus-siswa', () => null)
  const buku = useState<Buku[]>('perpus-buku', () => [])
  const W = useState<DataSiswa>('perpus-w', dataBaru)
  const dataSiap = useState('perpus-data-siap', () => false)
  const kisi = useState<Kisi[]>('perpus-kisi', () => [])
  const galat = useState('perpus-galat', () => '')
  const V = useState('perpus-v', () => ({ tab: 'beranda' as Tab, detail: '' as string, q: '', mapel: '', kur: '', kol: 'riwayat' }))
  const sheet = useState<{ jenis: 'filter' | 'notif' | 'materi' | 'catatan', kunci?: string, awal?: string } | null>('perpus-sheet', () => null)
  const toastTeks = useState('perpus-toast', () => '')
  const reader = useState<{ id: string, i?: number, panel: string | null, lompat: boolean } | null>('perpus-reader', () => null)

  const jenjangTampil = computed<'SMP' | 'SMK'>(() => {
    if (siswa.value) return siswa.value.jenjang
    const host = import.meta.client ? location.hostname : ''
    const j = jenjangHost(host)
    if (j) return j.toUpperCase() as 'SMP' | 'SMK'
    return import.meta.client && new URLSearchParams(location.search).get('jenjang') === 'SMP' ? 'SMP' : 'SMK'
  })

  const toast = (t: string) => {
    toastTeks.value = t
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastTeks.value = '' }, 2400)
  }

  const token = async () => (await supabase.auth.getSession()).data.session?.access_token || ''
  const api = async <T = any>(url: string, opsi: { method?: string, body?: unknown } = {}): Promise<T> => {
    const t = await token()
    return await $fetch<T>(url, { method: (opsi.method || 'GET') as any, body: opsi.body as any, headers: { Authorization: `Bearer ${t}` } })
  }
  const pesanGalat = (e: any, cadangan: string) => e?.data?.statusMessage || e?.statusMessage || cadangan

  // ----- data baca: simpan tertunda + pastikan terkirim saat tab ditutup -----
  const kirim = async (keepalive = false) => {
    if (!dataSiap.value || !siswa.value) return
    const t = await token()
    if (!t) return
    const r = await fetch('/api/perpus/data', {
      method: 'PUT', keepalive,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ data: W.value })
    }).then(x => (x.ok ? x.json() : null)).catch(() => null)
    // halaman terakhir yang lebih baru dari perangkat lain ikut terambil, tidak tertimpa
    if (r?.baca) W.value.baca = gabungBaca(r.baca, W.value.baca)
  }
  const simpan = () => {
    clearTimeout(simpanTimer)
    simpanTimer = setTimeout(() => kirim(), 1200)
  }
  if (import.meta.client && !terpasang) {
    terpasang = true
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { clearTimeout(simpanTimer); kirim(true) } })
    window.addEventListener('pagehide', () => { clearTimeout(simpanTimer); kirim(true) })
  }

  // ----- masuk -----
  const bersihkan = () => {
    siswa.value = null; buku.value = []; kisi.value = []; W.value = dataBaru(); dataSiap.value = false
    email.value = ''; reader.value = null; sheet.value = null
    V.value = { tab: 'beranda', detail: '', q: '', mapel: '', kur: '', kol: 'riwayat' }
  }

  const muatSemua = async () => {
    const [b, d, k] = await Promise.all([
      api<{ buku: Buku[] }>('/api/perpus/buku'),
      api<{ data: DataSiswa }>('/api/perpus/data'),
      api<{ kisi: Kisi[] }>('/api/perpus/kisi').catch(() => ({ kisi: [] as Kisi[] }))
    ])
    buku.value = b.buku; W.value = d.data; kisi.value = k.kisi; dataSiap.value = true
  }

  const cekSesi = async () => {
    try {
      const r = await api<any>('/api/perpus/sesi', { method: 'POST' })
      if (r.tahap === 'masuk') {
        siswa.value = r.siswa
        await muatSemua()
        tahap.value = 'masuk'
      } else {
        email.value = r.email
        tahap.value = 'verifikasi'
      }
    } catch (e: any) {
      galat.value = e?.statusCode === 403 ? pesanGalat(e, 'Akun ini tidak dapat masuk ke perpustakaan.') : (e?.statusCode === 401 ? '' : 'Perpustakaan sedang tidak dapat dihubungi. Coba lagi sebentar lagi.')
      await supabase.auth.signOut()
      bersihkan()
      tahap.value = 'awal'
    }
  }

  const mulai = async () => {
    if ((await supabase.auth.getSession()).data.session) await cekSesi()
    else tahap.value = 'awal'
  }

  const masukGoogle = async () => {
    galat.value = ''
    // redirectTo = halaman ini juga (di domain perpus "/" adalah alias /perpus, tanpa pengalihan yang membuang ?code=)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } })
    if (error) galat.value = 'Masuk dengan Google belum dapat dipakai. Coba lagi nanti.'
  }

  const verifikasi = async (body: { nomor: string, nisn?: string, lahir?: string }) => {
    try {
      await api('/api/perpus/verifikasi', { method: 'POST', body })
    } catch (e: any) {
      const err: any = new Error(pesanGalat(e, 'Verifikasi gagal. Coba lagi.'))
      err.butuhLengkap = e?.statusCode === 409
      throw err
    }
    await cekSesi()
    if (tahap.value === 'masuk') toast(`Terverifikasi. Selamat datang, ${siswa.value!.nama.split(' ')[0]}!`)
  }

  const keluar = async () => {
    clearTimeout(simpanTimer)
    await kirim()
    await supabase.auth.signOut()
    bersihkan()
    tahap.value = 'awal'
  }

  const gantiAkun = async () => { await supabase.auth.signOut(); bersihkan(); tahap.value = 'awal' }

  // ----- turunan -----
  const bukuSaya = computed(() => buku.value)
  const cariBuku = (id: string) => buku.value.find(b => b.id === id)
  const bukuTersedia = (b: Buku) => b.tersedia && !b.terkunci
  const catatBaca = (id: string, i: number, n: number) => { W.value.baca[id] = { i, n, ts: Date.now() }; simpan() }

  // Pemberitahuan: kisi-kisi baru (≤ 3 hari) dan buku yang berhenti dibaca lebih dari 48 jam.
  const notif = computed<Notif[]>(() => {
    const n: Notif[] = []
    const now = Date.now()
    kisi.value.filter(k => k.hari <= 3).forEach((k) => {
      const ts = now - k.hari * 864e5
      n.push({ id: 'kisi:' + k.id, ts, waktu: kapan(ts), jenis: 'Kisi-kisi baru', judul: k.judul, isi: `${k.topik.length} topik dari gurumu. Rekomendasi bukunya sudah siap dibaca.`, kisiId: k.id, mapel: k.mapel })
    })
    Object.entries(W.value.baca).forEach(([id, v]) => {
      const b = cariBuku(id)
      if (!b || now - v.ts < 48 * 36e5 || v.i >= v.n - 1) return
      n.push({ id: `baca:${id}:${v.ts}`, ts: v.ts + 48 * 36e5, waktu: 'terakhir dibuka ' + kapan(v.ts), jenis: 'Lanjutkan membaca', judul: b.judul, isi: `Kamu berhenti di halaman ${v.i + 1} dari ${v.n}. Sedikit lagi, yuk lanjutkan.`, buku: b, hal: v.i })
    })
    return n.sort((a, b) => b.ts - a.ts)
  })
  const belumDibaca = computed(() => notif.value.filter(x => !W.value.nbaca.includes(x.id)).length)

  // Pembaca hanya terbuka untuk buku yang berkasnya ada dan jadwalnya sedang buka.
  // i kosong = lanjut dari halaman terakhir siswa; lompat = loncat ke halaman tertentu tanpa menimpa halaman terakhir.
  const bukaReader = (id: string, i?: number, panel: string | null = null, lompat = false) => {
    const b = cariBuku(id)
    if (!b) return
    if (b.terkunci) { toast('Buku ini hanya dapat dibuka Sabtu dan Minggu.'); return }
    if (!b.tersedia) { toast('Buku ini belum tersedia.'); return }
    if (b.format === 'epub') { toast('Buku EPUB belum bisa dibaca di aplikasi. Unduh dari halaman detail buku.'); return }
    sheet.value = null
    reader.value = { id, i, panel, lompat }
  }

  const formCatatan = (awal: string, cb: (v: string) => void) => { catatanCb = cb; sheet.value = { jenis: 'catatan', awal } }
  const simpanCatatan = (v: string) => { sheet.value = null; catatanCb?.(v); catatanCb = null }

  // Statistik admin: satu pembacaan per sesi baca (server yang menyaring jeda < 30 menit). Gagal mencatat tidak boleh mengganggu siswa.
  const catatBuka = (id: string) => { api('/api/perpus/buka', { method: 'POST', body: { id } }).catch(() => {}) }

  const ke = (tab: Tab, detail = '') => {
    V.value.tab = tab; V.value.detail = detail
    if (import.meta.client) window.scrollTo(0, 0)
  }

  return {
    tahap, email, siswa, buku, W, kisi, galat, V, sheet, toastTeks, reader, jenjangTampil,
    toast, simpan, mulai, masukGoogle, verifikasi, keluar, gantiAkun, token,
    bukuSaya, cariBuku, bukuTersedia, catatBaca, notif, belumDibaca, bukaReader, catatBuka, formCatatan, simpanCatatan, ke
  }
}
