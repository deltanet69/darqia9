// Logika murni Perpustakaan Digital Darqia 9 (dipakai klien, server, skrip impor, dan tes).
// Katalog: baris katalog-perpus-darqia.json -> Buku. Akses: jenjang domain, kelas siswa, jadwal manga/komik.
// Kisi-kisi: teks bank soal CBT -> topik -> buku yang cocok. Data per siswa: struktur + pembersih.

export interface Buku {
  id: string
  judul: string
  penulis: string
  mapel: string
  kelas: string // label apa adanya dari katalog
  kur: string
  jenis: string
  jenjang: string[] // ['SMP'], ['SMK'], atau keduanya
  tingkat: number[] // 7–12; kosong = semua kelas
  akhirPekan: boolean // manga/komik: hanya Sabtu–Minggu
  warna: [string, string]
  ringkas: string
  tersedia: boolean // berkas PDF ada di server (diisi endpoint)
  terkunci: boolean // akhirPekan dan sekarang bukan Sabtu/Minggu (diisi endpoint)
  sampul: string // URL foto sampul unggahan admin; kosong = sampul dari halaman 1 PDF
  sinopsis: string // ditulis admin; kosong = teks otomatis dari metadata
  format: 'pdf' | 'epub' // epub hanya bisa diunduh, belum dibaca di pembaca
}

export interface SesiPerpus {
  nama: string
  nis: string
  nisn: string
  jenjang: 'SMP' | 'SMK'
  kelas: string
  tingkat: number
  email: string
}

export interface BarisKatalog {
  id: string
  judul: string
  pengarang: string
  penerbit: string
  jenjang: string[]
  kelas_label: string
  tingkat_kelas: number[]
  mapel: string
  kategori: string
  jenis: string
  kurikulum: string
  status_legal: string
  akses_baca: string
  akhir_pekan: boolean
  slug_file: string
  path_pdf: string
  urutan: number
  sampul?: string // nama berkas di PERPUS_DIR; tidak diisi impor sehingga impor tidak menimpa sampul
  sinopsis?: string // idem: hanya diisi lewat form admin
}

// ---------- katalog ----------
const kunci = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
// Ambil kolom tanpa peduli huruf besar/kecil, spasi, dan tanda baca pada nama kolom.
const ambil = (baris: Record<string, unknown>, ...nama: string[]): string => {
  const peta = new Map(Object.keys(baris).map(k => [kunci(k), k]))
  for (const n of nama) {
    const k = peta.get(kunci(n))
    if (k !== undefined && baris[k] != null && String(baris[k]).trim() !== '') return String(baris[k]).trim()
  }
  return ''
}

export const slugBuku = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90)

const ROMAWI: Array<[string, number]> = [['XII', 12], ['XI', 11], ['X', 10], ['IX', 9], ['VIII', 8], ['VII', 7]]
const TOKEN_KELAS = /\b(XII|XI|IX|X|VIII|VII|7|8|9|10|11|12)\b/gi
const angkaKelas = (t: string) => ROMAWI.find(([s]) => s === t.toUpperCase())?.[1] ?? parseInt(t, 10)

// Fase Kurikulum Merdeka: D = kelas VII–IX, E = kelas X, F = kelas XI–XII ("E", "Fase D", "D1").
const FASE: Record<string, number[]> = { D: [7, 8, 9], E: [10], F: [11, 12] }

// "Kelas VII – IX" -> [7,8,9]; "X, XII" -> [10,12]; fase "E" -> [10]; tanpa angka kelas -> [] (semua kelas).
export function tingkatDariLabel(label: string): number[] {
  const fase = /^\s*(?:fase\s*)?([A-F])\d?\s*$/i.exec(label)
  if (fase) return [...(FASE[fase[1]!.toUpperCase()] ?? [])]
  const ada = new Set<number>()
  const tokens = [...label.matchAll(TOKEN_KELAS)]
  tokens.forEach((m, i) => {
    const a = angkaKelas(m[1]!)
    ada.add(a)
    const n = tokens[i + 1]
    if (n) {
      const antara = label.slice(m.index! + m[0].length, n.index)
      if (/^\s*(?:-|–|—|s\/d|sd|sampai|hingga)\s*$/i.test(antara)) {
        for (let k = a; k <= angkaKelas(n[1]!); k++) ada.add(k)
      }
    }
  })
  return [...ada].sort((x, y) => x - y)
}

// SMP/SMK dari teks; kosong/"semua"/"umum" = keduanya; jenjang lain (SD, SMA saja) = [] (bukan koleksi kita).
export function jenjangDariTeks(teks: string): string[] {
  const t = teks.toUpperCase()
  const j = ['SMP', 'SMK'].filter(x => t.includes(x))
  if (j.length) return j
  return !t.trim() || /SEMUA|UMUM|SMP/.test(t) ? ['SMP', 'SMK'] : []
}

const SHEET_TERLARANG = /tidak\s*boleh/i
const SHEET_AKHIR_PEKAN = /weekend|manga|komik/i
const AKSES_AKHIR_PEKAN = /sabtu|minggu|ahad|weekend|akhir\s*pekan/i

// Amankan jalur PDF agar tidak keluar dari folder perpus. Hasil relatif terhadap /srv/darqia/perpus/.
export function jalurPdfAman(mentah: string): string {
  const p = mentah.trim().replace(/\\/g, '/').replace(/^\/?srv\/darqia\/perpus\//i, '').replace(/^\/+/, '')
  if (!p || p.split('/').some(s => s === '..' || s === '') || /[\0:]/.test(p)) return ''
  return p
}

// null = baris tidak boleh tampil sebagai koleksi.
export function normalisasiBaris(baris: Record<string, unknown>, sheet: string, urutan: number): BarisKatalog | null {
  const judul = ambil(baris, 'Judul')
  const status = ambil(baris, 'Status Legal')
  if (!judul) return null
  if (SHEET_TERLARANG.test(sheet) || SHEET_TERLARANG.test(status)) return null
  if (/unverified/i.test(status) || Object.values(baris).some(v => /^\s*unverified\b/i.test(String(v ?? '')))) return null
  const jenjang = jenjangDariTeks(ambil(baris, 'Jenjang'))
  if (!jenjang.length) return null
  const kelas = ambil(baris, 'Kelas')
  const akses = ambil(baris, 'Akses Baca')
  const slug = ambil(baris, 'Slug File')
  const [pengarang = '', penerbit = ''] = ambil(baris, 'Penulis / Penerbit', 'Penulis', 'Penerbit').split('/').map(s => s.trim())
  return {
    id: slugBuku(slug || judul) || `buku-${urutan}`,
    judul, pengarang, penerbit, jenjang,
    kelas_label: kelas,
    tingkat_kelas: tingkatDariLabel(kelas),
    mapel: ambil(baris, 'Mapel / Kategori', 'Mapel', 'Kategori'),
    kategori: ambil(baris, 'Mapel / Kategori', 'Kategori'),
    jenis: ambil(baris, 'Jenis'),
    kurikulum: ambil(baris, 'Kurikulum / Sumber', 'Kurikulum'),
    status_legal: status,
    akses_baca: akses,
    akhir_pekan: SHEET_AKHIR_PEKAN.test(sheet) || AKSES_AKHIR_PEKAN.test(akses),
    slug_file: slug,
    path_pdf: jalurPdfAman(ambil(baris, 'Path PDF (rencana)', 'Path PDF')),
    urutan
  }
}

// Isi katalog bisa berupa larik baris, atau objek { namaSheet: [baris] }.
export function bacaKatalog(isi: unknown): BarisKatalog[] {
  const kelompok: Array<[string, any[]]> = Array.isArray(isi)
    ? [['', isi]]
    : Object.entries((isi ?? {}) as Record<string, unknown>).filter(([, v]) => Array.isArray(v)) as Array<[string, any[]]>
  const hasil: BarisKatalog[] = []
  const dipakai = new Set<string>()
  let n = 0
  for (const [sheet, baris] of kelompok) {
    for (const b of baris) {
      if (!b || typeof b !== 'object') continue
      n++
      const nama = sheet || ambil(b, 'Sheet', 'Lembar')
      const r = normalisasiBaris(b, nama, n)
      if (!r) continue
      if (dipakai.has(r.id)) r.id = `${r.id}-${n}`
      dipakai.add(r.id)
      hasil.push(r)
    }
  }
  return hasil
}

// Jumlah baris mentah di isi katalog (larik atau objek per sheet), sebelum disaring.
export const jumlahMentah = (isi: unknown): number => Array.isArray(isi)
  ? isi.length
  : Object.values((isi ?? {}) as Record<string, unknown>).reduce<number>((n, v) => n + (Array.isArray(v) ? v.length : 0), 0)

// ---------- akses ----------
// Waktu Indonesia Barat (UTC+7), tanpa bergantung pada ICU.
export const hariWib = (d: Date = new Date()): number => new Date(d.getTime() + 7 * 3600e3).getUTCDay() // 0 = Minggu
export const akhirPekanWib = (d: Date = new Date()): boolean => [0, 6].includes(hariWib(d))
export const KETERANGAN_JADWAL = 'Hanya dapat dibuka Sabtu dan Minggu'

export const terbukaUntuk = (b: { jenjang: string[], tingkat_kelas?: number[], tingkat?: number[] }, s: { jenjang: string, tingkat: number }): boolean => {
  const t = b.tingkat_kelas ?? b.tingkat ?? []
  return b.jenjang.includes(s.jenjang) && (!t.length || t.includes(s.tingkat))
}

// Tingkat (7–12) dari nama kelas Data Induk: "XI TKJ 1" -> 11, "VII. A" -> 7. Cadangan: jenjang masuk.
export function tingkatDariKelas(kelas: string, jenjang: string): number {
  const token = (kelas || '').toUpperCase().replace(/\./g, ' ').split(/\s+/).filter(Boolean)
  for (const t of token) {
    const a = parseInt(t, 10)
    if ([7, 8, 9, 10, 11, 12].includes(a) && String(a) === t) return a
    const r = ROMAWI.find(([s]) => s === t)
    if (r) return r[1]
  }
  return jenjang === 'SMP' ? 7 : 10
}

// ---------- tampilan ----------
const PALET: Array<[string, string]> = [['#0a2a5c', '#2f6bff'], ['#0f3d8a', '#18b4c9'], ['#1b2f6b', '#6b7cff'], ['#12306b', '#3a86ff'], ['#0b4a6f', '#2bb3a3'], ['#7a2f1f', '#e8833a'], ['#3b2a6b', '#8f6bff'], ['#14532d', '#34a77b']]
export const warnaBuku = (kunciWarna: string): [string, string] => {
  let h = 0
  for (const c of kunciWarna) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PALET[h % PALET.length]!
}
export const judulPendek = (judul: string) => judul.includes(': ') ? judul.split(': ').slice(1).join(': ') : judul
export const inisialSiswa = (nama: string) => nama.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
export const kapan = (ts: number, sekarang = Date.now()) => {
  const h = Math.floor((sekarang - ts) / 864e5)
  return h <= 0 ? 'hari ini' : h === 1 ? 'kemarin' : `${h} hari lalu`
}

export const formatBerkas = (path?: string): 'pdf' | 'epub' => (/\.epub$/i.test(path || '') ? 'epub' : 'pdf')

export const urlSampul = (berkas?: string): string => (berkas ? '/api/perpus/sampul/' + berkas.replace(/^sampul\//, '') : '')

// Form admin (tambah/ubah buku) -> kolom perpus_buku. Status legal tidak diubah dari form (hanya lewat impor, yang menyaringnya).
export function rapikanForm(b: any): { galat: string } | { baris: Omit<BarisKatalog, 'id' | 'urutan' | 'slug_file' | 'path_pdf' | 'sampul' | 'status_legal' | 'sinopsis'> & { sinopsis: string } } {
  const t = (k: string) => String(b?.[k] ?? '').trim().slice(0, 300)
  const jenjang = (['SMP', 'SMK'] as const).filter(j => Array.isArray(b?.jenjang) && b.jenjang.includes(j))
  if (!t('judul')) return { galat: 'Judul buku wajib diisi.' }
  if (!jenjang.length) return { galat: 'Pilih minimal satu jenjang (SMP/SMK).' }
  const akhirPekan = b?.akhir_pekan === true
  return {
    baris: {
      judul: t('judul'), pengarang: t('pengarang'), penerbit: t('penerbit'), jenjang,
      kelas_label: t('kelas_label'), tingkat_kelas: tingkatDariLabel(t('kelas_label')),
      mapel: t('mapel'), kategori: t('mapel'), jenis: t('jenis'), kurikulum: t('kurikulum'),
      sinopsis: String(b?.sinopsis ?? '').trim().slice(0, 3000),
      akses_baca: akhirPekan ? 'Sabtu–Minggu' : 'Setiap hari', akhir_pekan: akhirPekan
    }
  }
}

export const bukuDariBaris = (r: BarisKatalog, tersedia: boolean, sekarang = new Date()): Buku => ({
  id: r.id, judul: r.judul, penulis: [r.pengarang, r.penerbit].filter(Boolean).join(' · '),
  mapel: r.mapel || r.kategori || 'Umum', kelas: r.kelas_label || 'Semua kelas', kur: r.kurikulum, jenis: r.jenis,
  jenjang: r.jenjang, tingkat: r.tingkat_kelas, akhirPekan: r.akhir_pekan,
  warna: warnaBuku(r.mapel || r.judul),
  ringkas: [r.jenis, r.mapel, r.kelas_label].filter(Boolean).join(' · '),
  tersedia, terkunci: r.akhir_pekan && !akhirPekanWib(sekarang), sampul: urlSampul(r.sampul), sinopsis: r.sinopsis || '', format: formatBerkas(r.path_pdf)
})

// ---------- kisi-kisi dari bank soal ----------
export interface TopikKisi { t: string, i: string }

const bersihBaris = (s: string) => s.replace(/[*_`#>]/g, '').replace(/^\s*\d+[.)]\s+/, '').trim()
// Teks AI bank soal: baris biasa = judul materi, baris berawalan "-"/"•" = indikator di bawahnya.
export function parseKisi(teks: string): TopikKisi[] {
  const topik: TopikKisi[] = []
  let kini: { t: string, poin: string[] } | null = null
  const tutup = () => { if (kini) topik.push({ t: kini.t, i: kini.poin.join('; ') }); kini = null }
  for (const mentah of teks.split(/\r?\n/)) {
    const bullet = /^\s*[-•*]\s+/.test(mentah)
    const baris = bersihBaris(mentah.replace(/^\s*[-•*]\s+/, ''))
    if (!baris) continue
    if (!bullet) {
      tutup()
      kini = { t: baris.replace(/:$/, '').slice(0, 120), poin: [] }
    } else if (kini) kini.poin.push(baris.slice(0, 220))
    else topik.push({ t: baris.slice(0, 120), i: '' }) // daftar poin tanpa judul: tiap poin = satu topik
  }
  tutup()
  return topik.filter(x => x.t).slice(0, 15)
}

const BUANG = new Set('dan yang untuk dengan sesuai dalam beserta tiga dari pada atau menjelaskan menentukan membedakan menghitung mengidentifikasi menulis menyelesaikan mengubah menemukan mengelompokkan menggambar kelas bank soal materi'.split(' '))
const kataKunci = (s: string) => [...new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 4 && !BUANG.has(w)))]

// Cocokkan topik ke buku katalog lewat kata kunci judul + mapel (bukan pembacaan isi PDF). Skor 0–100.
export function cocokkanBuku(topik: TopikKisi, mapelUjian: string, buku: Buku[], maks = 3): Array<{ id: string, skor: number }> {
  const kk = kataKunci(`${topik.t} ${topik.i}`)
  const mapelKk = kataKunci(mapelUjian)
  return buku.map((b) => {
    const teks = `${b.judul} ${b.mapel}`.toLowerCase()
    const kena = kk.filter(w => teks.includes(w.slice(0, 5))).length
    const mapelCocok = mapelKk.length > 0 && mapelKk.some(w => teks.includes(w.slice(0, 5)))
    const skor = Math.min(98, (mapelCocok ? 55 : 0) + Math.round(kena / Math.max(kk.length, 1) * 43))
    return { id: b.id, skor: kena || mapelCocok ? skor : 0 }
  }).filter(x => x.skor >= 30).sort((a, b) => b.skor - a.skor).slice(0, maks)
}

// ---------- data per siswa ----------
export interface DataSiswa {
  fav: string[]
  baca: Record<string, { i: number, n: number, ts: number }>
  hal: Array<{ id: string, i: number }>
  tandai: Array<{ id: string, i: number, r: number[][], teks: string, cat: string, ts: number }>
  rk: Record<string, string>
  kisi: Record<string, boolean>
  nbaca: string[]
  tema: 'terang' | 'sepia' | 'gelap'
  fs: number
}
export const dataBaru = (): DataSiswa => ({ fav: [], baca: {}, hal: [], tandai: [], rk: {}, kisi: {}, nbaca: [], tema: 'terang', fs: 19 })

const bil = (v: unknown, min: number, maks: number, awal: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(maks, Math.max(min, Math.round(v))) : awal)
const teks = (v: unknown, maks: number) => (typeof v === 'string' ? v.slice(0, maks) : '')
const larik = (v: unknown, maks: number): any[] => (Array.isArray(v) ? v.slice(0, maks) : [])
const obj = (v: unknown): Record<string, any> => (v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, any> : {})

// Bentuk kiriman klien dipaksa ke struktur yang diketahui dengan batas ukuran (kepercayaan nol pada klien).
export function bersihkanData(mentah: unknown): DataSiswa {
  const m = obj(mentah), d = dataBaru()
  d.fav = larik(m.fav, 1000).filter((x): x is string => typeof x === 'string').map(x => x.slice(0, 120))
  for (const [id, v] of Object.entries(obj(m.baca)).slice(0, 1000)) {
    d.baca[id.slice(0, 120)] = { i: bil(v?.i, 0, 99999, 0), n: bil(v?.n, 1, 99999, 1), ts: bil(v?.ts, 0, 9e15, 0) }
  }
  d.hal = larik(m.hal, 2000).filter(x => x && typeof x.id === 'string').map(x => ({ id: x.id.slice(0, 120), i: bil(x.i, 0, 99999, 0) }))
  d.tandai = larik(m.tandai, 2000).filter(x => x && typeof x.id === 'string').map(x => ({
    id: x.id.slice(0, 120), i: bil(x.i, 0, 99999, 0), teks: teks(x.teks, 400), cat: teks(x.cat, 1000), ts: bil(x.ts, 0, 9e15, 0),
    r: larik(x.r, 40).map(r => larik(r, 4).map(n => (typeof n === 'number' && Number.isFinite(n) ? n : 0))).filter(r => r.length === 4)
  }))
  for (const [id, v] of Object.entries(obj(m.rk)).slice(0, 1000)) d.rk[id.slice(0, 120)] = teks(v, 20000)
  for (const [k, v] of Object.entries(obj(m.kisi)).slice(0, 2000)) if (v === true) d.kisi[k.slice(0, 160)] = true
  d.nbaca = larik(m.nbaca, 500).filter((x): x is string => typeof x === 'string').map(x => x.slice(0, 160))
  d.tema = ['terang', 'sepia', 'gelap'].includes(m.tema) ? m.tema : 'terang'
  d.fs = bil(m.fs, 15, 28, 19)
  return d
}

export const persenBaca = (d: DataSiswa, id: string) => {
  const b = d.baca[id]
  return b ? Math.min(100, Math.round((b.i + 1) / Math.max(b.n, 1) * 100)) : 0
}

// Halaman terakhir tidak boleh mundur karena perangkat lain/lama menyimpan data usang: per buku, catatan terbaru menang.
export const gabungBaca = (lama: DataSiswa['baca'], baru: DataSiswa['baca']): DataSiswa['baca'] => {
  const h = { ...baru }
  for (const [id, v] of Object.entries(lama)) if (!h[id] || h[id]!.ts < v.ts) h[id] = v
  return h
}
