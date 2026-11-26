import { serverSupabaseServiceRole } from '#supabase/server'
import { keBentukPublik, normalisasiJenjang, sudahTayang, type BarisKonten } from '../../../app/utils/kontenBerita'

// GET /api/konten/berita?jenjang=smp|smk&limit=30 — daftar berita & artikel
// yang sudah tayang untuk website publik. Hanya status Terbit, atau
// Terjadwal yang tanggalnya sudah lewat. Bila tabel belum ada (migrasi
// 0096 belum jalan) endpoint mengembalikan daftar kosong agar website
// tetap menampilkan data cadangannya dan tidak error.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const jenjang = normalisasiJenjang(query.jenjang)
  if (!jenjang) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter jenjang harus smp atau smk.' })
  }
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 30))

  let db: any
  try {
    db = serverSupabaseServiceRole(event)
  } catch {
    return { berita: [] }
  }

  const { data, error } = await db
    .from('website_articles')
    .select('id, jenjang, judul, subjudul, slug, kategori, status, tanggal_terbit, tanggal_jadwal, penulis, penulis_peran, ringkasan, isi_html, gambar_url, featured, tags, kutipan_teks, kutipan_penulis, views, created_at')
    .eq('jenjang', jenjang.toUpperCase())
    .in('status', ['Terbit', 'Terjadwal'])
    .is('deleted_at', null)
    .order('tanggal_terbit', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[konten/berita] gagal memuat:', error.message)
    return { berita: [] }
  }

  const sekarang = new Date()
  const berita = ((data || []) as BarisKonten[])
    .filter(b => sudahTayang(b.status, b.tanggal_jadwal, sekarang))
    .slice(0, limit)
    .map(keBentukPublik)

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  return { berita }
})
