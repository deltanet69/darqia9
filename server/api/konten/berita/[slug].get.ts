import { serverSupabaseServiceRole } from '#supabase/server'
import { keBentukPublik, normalisasiJenjang, sudahTayang, type BarisKonten } from '../../../../app/utils/kontenBerita'

// GET /api/konten/berita/:slug?jenjang=smp|smk — detail satu artikel yang
// sudah tayang; membuka detail menaikkan penghitung views satu kali.
export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '')
  const jenjang = normalisasiJenjang(getQuery(event).jenjang)
  if (!jenjang || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter jenjang dan slug wajib ada.' })
  }

  let db: any
  try {
    db = serverSupabaseServiceRole(event)
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Layanan berita belum tersedia.' })
  }

  const { data, error } = await db
    .from('website_articles')
    .select('id, jenjang, judul, subjudul, slug, kategori, status, tanggal_terbit, tanggal_jadwal, penulis, penulis_peran, ringkasan, isi_html, gambar_url, featured, tags, kutipan_teks, kutipan_penulis, views, created_at')
    .eq('jenjang', jenjang.toUpperCase())
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error('[konten/berita detail] gagal memuat:', error.message)
    throw createError({ statusCode: 503, statusMessage: 'Berita gagal dimuat.' })
  }
  const baris = data as BarisKonten | null
  if (!baris || !sudahTayang(baris.status, baris.tanggal_jadwal)) {
    throw createError({ statusCode: 404, statusMessage: 'Berita tidak ditemukan.' })
  }

  const viewsBaru = Number(baris.views || 0) + 1
  await db.from('website_articles').update({ views: viewsBaru }).eq('id', baris.id)

  return { berita: keBentukPublik({ ...baris, views: viewsBaru }) }
})
