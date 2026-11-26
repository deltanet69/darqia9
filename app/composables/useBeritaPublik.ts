import { labelTanggal, type JenjangKonten } from '~/utils/kontenBerita'

// Bentuk artikel untuk halaman publik (mengikuti antarmuka Article yang sudah
// dipakai halaman berita & homepage SMP/SMK selama ini).
export type ArtikelPublik = {
  id: string
  slug: string
  title: string
  category: string
  categoryLabel: string
  badgeBg: string
  badgeText: string
  date: string
  isoDate: string
  author: string
  authorRole: string
  readTime: string
  views: number
  image: string
  featured: boolean
  tags: string[]
  summary: string
  content: string[]
  isiHtml: string
  quote?: { text: string, author: string }
}

// Warna lencana per kategori admin, mengikuti warna yang selama ini tampil
// di website untuk kategori padanannya.
export const badgeUntukKategori = (kategori: string, jenjang: JenjangKonten): { bg: string, text: string } => {
  switch (kategori) {
    case 'Pengumuman': return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' }
    case 'Akademik': return { bg: 'bg-[#E0E7FF]', text: 'text-[#4338CA]' }
    case 'Prestasi': return { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]' }
    case 'Keagamaan': return { bg: 'bg-[#EEF2FF]', text: 'text-[#4338CA]' }
    case 'Olahraga': return { bg: 'bg-[#FFE4E6]', text: 'text-[#9F1239]' }
    case 'Kegiatan':
      return jenjang === 'smp'
        ? { bg: 'bg-[#D9F2E3]', text: 'text-[#0B6B45]' }
        : { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' }
    default: return { bg: 'bg-[#E2E8F0]', text: 'text-[#334155]' }
  }
}

// Petakan satu baris bentuk publik dari endpoint /api/konten/berita.
export const petakanArtikelPublik = (b: any, jenjang: JenjangKonten): ArtikelPublik => {
  const badge = badgeUntukKategori(String(b?.kategori || 'Kegiatan'), jenjang)
  const iso = String(b?.tanggal || '')
  return {
    id: String(b?.slug || b?.id || ''),
    slug: String(b?.slug || ''),
    title: String(b?.judul || ''),
    category: String(b?.kategori || 'Kegiatan'),
    categoryLabel: String(b?.kategori || 'Kegiatan'),
    badgeBg: badge.bg,
    badgeText: badge.text,
    date: labelTanggal(iso) || String(b?.tanggalLabel || ''),
    isoDate: iso.slice(0, 10),
    author: String(b?.penulis || ''),
    authorRole: String(b?.penulisPeran || ''),
    readTime: `${Math.max(1, Number(b?.menitBaca) || 1)} mnt baca`,
    views: Number(b?.views || 0),
    image: String(b?.gambarUrl || ''),
    featured: !!b?.featured,
    tags: Array.isArray(b?.tags) ? b.tags : [],
    summary: String(b?.ringkasan || ''),
    content: Array.isArray(b?.paragraf) ? b.paragraf : [],
    isiHtml: String(b?.isi || ''),
    quote: b?.kutipan ? { text: String(b.kutipan.teks || ''), author: String(b.kutipan.penulis || '') } : undefined
  }
}

// Ambil artikel tayang satu jenjang dari endpoint publik. Mengembalikan
// array kosong bila endpoint kosong/gagal — pemanggil mempertahankan
// data cadangan (artikel hardcode lama) dalam keadaan itu.
export const ambilArtikelPublik = async (jenjang: JenjangKonten): Promise<ArtikelPublik[]> => {
  try {
    const data = await $fetch<{ berita?: any[] }>('/api/konten/berita', { query: { jenjang } })
    return (data?.berita || []).map(b => petakanArtikelPublik(b, jenjang))
  } catch {
    return []
  }
}

// Catat satu tayangan saat pembaca membuka detail artikel (diam-diam;
// kegagalan tidak mengganggu bacaan).
export const catatTayanganArtikel = (jenjang: JenjangKonten, slug: string) => {
  if (!slug) return
  $fetch(`/api/konten/berita/${encodeURIComponent(slug)}`, { query: { jenjang } }).catch(() => {})
}
