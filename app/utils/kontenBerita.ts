// Util bersama Konten Berita & Artikel website (Admin Portal <-> website publik).
// Satu-satunya sumber bentuk data berita: tabel `website_articles` (rancangan
// migrasi 0010, sudah berjalan di database) menjadi jembatan — admin menulis
// lewat /api/admin/konten, website publik membaca lewat /api/konten/berita.
// Fungsi di sini murni (tanpa dependensi server/klien) agar bisa dites
// langsung (tests/konten-berita.mjs).

export type JenjangKonten = 'smp' | 'smk'
export type StatusKonten = 'Draft' | 'Review' | 'Terbit' | 'Terjadwal'

export const STATUS_KONTEN: StatusKonten[] = ['Draft', 'Review', 'Terbit', 'Terjadwal']
export const KATEGORI_KONTEN = ['Akademik', 'Prestasi', 'Kegiatan', 'Keagamaan', 'Olahraga', 'Pengumuman']

export const normalisasiJenjang = (nilai: unknown): JenjangKonten | null => {
  const j = String(nilai || '').trim().toLowerCase()
  return j === 'smp' || j === 'smk' ? (j as JenjangKonten) : null
}

// Slug URL dari judul: huruf kecil, non-alfanumerik menjadi '-', tanpa '-' ganda/tepi.
export const buatSlug = (judul: string): string => {
  const slug = String(judul || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/g, '')
  return slug || 'berita'
}

// Artikel boleh tampil di website publik bila status Terbit, atau Terjadwal
// yang tanggal jadwalnya sudah lewat.
export const sudahTayang = (status: string, tanggalJadwal: string | null | undefined, sekarang: Date = new Date()): boolean => {
  if (status === 'Terbit') return true
  if (status === 'Terjadwal' && tanggalJadwal) return new Date(tanggalJadwal).getTime() <= sekarang.getTime()
  return false
}

const lepasTag = (html: string): string => String(html || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/\s+/g, ' ')
  .replace(/\s+([.,!?;:%])/g, '$1')
  .trim()

// Paragraf teks polos dari isi HTML editor (untuk cadangan tampilan daftar isi
// di halaman berita yang merender per paragraf).
export const paragrafDariHtml = (html: string): string[] => {
  const sumber = String(html || '')
  if (!sumber.trim()) return []
  const blok = sumber.match(/<p[\s>][\s\S]*?<\/p>/gi) || sumber.match(/<p>[\s\S]*?<\/p>/gi)
  if (blok?.length) return blok.map(lepasTag).filter(Boolean)
  return sumber.split(/\n{2,}/).map(lepasTag).filter(Boolean)
}

export const estimasiMenitBaca = (html: string): number => {
  const kata = lepasTag(html).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(kata / 200))
}

// Label tanggal Indonesia dari ISO/tanggal, selalu di zona Asia/Jakarta agar
// tanggal tampil tidak bergeser mengikuti zona server.
export const labelTanggal = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(d)
}

// Tanggal kalender (YYYY-MM-DD) di zona Asia/Jakarta dari sebuah momen ISO.
export const tanggalJakarta = (iso: string | Date): string => {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

export type BarisKonten = {
  id: string
  jenjang: string // 'SMP' | 'SMK' sesuai batasan tabel
  judul: string
  subjudul?: string | null
  slug: string
  kategori?: string | null
  status: string
  tanggal_terbit?: string | null // date
  tanggal_jadwal?: string | null // timestamptz
  penulis?: string | null
  penulis_peran?: string | null
  ringkasan?: string | null
  isi_html?: string | null
  gambar_url?: string | null
  featured?: boolean | null
  tags?: string[] | null
  kutipan_teks?: string | null
  kutipan_penulis?: string | null
  views?: number | null
  deleted_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

// Momen tampil artikel: Terbit memakai tanggal_terbit, Terjadwal memakai
// tanggal_jadwal.
export const tanggalEfektif = (b: BarisKonten): string | null =>
  b.status === 'Terjadwal' ? (b.tanggal_jadwal || b.tanggal_terbit || null) : (b.tanggal_terbit || b.tanggal_jadwal || null)

// Bentuk yang dikirim endpoint publik ke website.
export const keBentukPublik = (b: BarisKonten) => ({
  id: b.id,
  slug: b.slug,
  judul: b.judul,
  subjudul: b.subjudul || '',
  kategori: b.kategori || 'Kegiatan',
  tanggal: tanggalEfektif(b),
  penulis: b.penulis || '',
  penulisPeran: b.penulis_peran || '',
  ringkasan: b.ringkasan || '',
  isi: b.isi_html || '',
  paragraf: paragrafDariHtml(b.isi_html || ''),
  menitBaca: estimasiMenitBaca(b.isi_html || ''),
  gambarUrl: b.gambar_url || '',
  featured: !!b.featured,
  tags: Array.isArray(b.tags) ? b.tags : [],
  kutipan: b.kutipan_teks ? { teks: b.kutipan_teks, penulis: b.kutipan_penulis || '' } : null,
  views: Number(b.views || 0)
})

// Bentuk yang dikirim endpoint admin ke Admin Portal (mengikuti tipe Berita
// yang sudah dipakai WebsiteContentManager & halaman editor).
export const keBentukAdmin = (b: BarisKonten) => ({
  id: b.id,
  jenjang: String(b.jenjang || '').toUpperCase(),
  judul: b.judul,
  subjudul: b.subjudul || '',
  slug: b.slug,
  kategori: b.kategori || 'Kegiatan',
  status: b.status,
  tanggal: tanggalEfektif(b) || '',
  penulis: b.penulis || '',
  penulisPeran: b.penulis_peran || '',
  ringkasan: b.ringkasan || '',
  isi: b.isi_html || '',
  gambarUrl: b.gambar_url || '',
  gambarNama: '',
  featured: !!b.featured,
  tags: Array.isArray(b.tags) ? b.tags : [],
  views: Number(b.views || 0),
  dibuatPada: b.created_at || '',
  diubahPada: b.updated_at || ''
})

// Validasi + normalisasi payload tulis dari Admin Portal.
// Mengembalikan { data } siap simpan ke website_articles atau { galat }.
export const normalisasiPayloadBerita = (body: any): { data?: Record<string, any>, galat?: string } => {
  const judul = String(body?.judul || '').trim()
  if (!judul) return { galat: 'Judul konten wajib diisi.' }
  const jenjang = normalisasiJenjang(body?.jenjang)
  if (!jenjang) return { galat: 'Jenjang tidak valid.' }
  const status = STATUS_KONTEN.includes(body?.status) ? body.status as StatusKonten : 'Draft'
  const penulis = String(body?.penulis || '').trim()
  if (!penulis) return { galat: 'Penulis wajib diisi.' }
  const kategori = String(body?.kategori || '').trim()
  if (!kategori) return { galat: 'Kategori wajib dipilih.' }
  if (!KATEGORI_KONTEN.includes(kategori)) {
    return { galat: `Kategori harus salah satu dari: ${KATEGORI_KONTEN.join(', ')}.` }
  }
  const featured = !!body?.featured
  if (featured && status !== 'Terbit') return { galat: 'Berita unggulan hanya untuk status Terbit.' }

  const tanggalMentah = String(body?.tanggal || '').trim()
  let tanggalTerbit: string | null = null
  let tanggalJadwal: string | null = null
  if (status === 'Terjadwal') {
    if (!tanggalMentah) return { galat: 'Tanggal dan jam terbit terjadwal wajib diisi.' }
    const d = new Date(tanggalMentah)
    if (Number.isNaN(d.getTime())) return { galat: 'Tanggal terbit tidak valid.' }
    tanggalJadwal = d.toISOString()
  } else if (status === 'Terbit') {
    const d = tanggalMentah ? new Date(tanggalMentah) : new Date()
    if (Number.isNaN(d.getTime())) return { galat: 'Tanggal terbit tidak valid.' }
    tanggalTerbit = tanggalJakarta(d)
  } else if (tanggalMentah) {
    const d = new Date(tanggalMentah)
    if (!Number.isNaN(d.getTime())) tanggalTerbit = tanggalJakarta(d)
  }

  const tags = Array.isArray(body?.tags)
    ? body.tags.map((t: any) => String(t).trim()).filter(Boolean).slice(0, 12)
    : String(body?.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean).slice(0, 12)
  const gambar = String(body?.gambarUrl || body?.gambar_url || '').trim()
  return {
    data: {
      jenjang: jenjang.toUpperCase(),
      judul,
      subjudul: String(body?.subjudul || '').trim(),
      kategori,
      status,
      tanggal_terbit: tanggalTerbit,
      tanggal_jadwal: tanggalJadwal,
      penulis,
      penulis_peran: String(body?.penulisPeran || body?.penulis_peran || '').trim(),
      ringkasan: String(body?.ringkasan || '').trim(),
      isi_html: String(body?.isi || body?.isi_html || ''),
      gambar_url: gambar || null,
      featured,
      tags,
      kutipan_teks: String(body?.kutipanTeks || body?.kutipan_teks || '').trim(),
      kutipan_penulis: String(body?.kutipanPenulis || body?.kutipan_penulis || '').trim(),
      updated_at: new Date().toISOString()
    }
  }
}
