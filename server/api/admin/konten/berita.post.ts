import { gerbangKonten, galatTabelKonten, galatMigrasiKonten } from '../../../utils/kontenGate'
import { buatSlug, keBentukAdmin, normalisasiPayloadBerita, type BarisKonten } from '../../../../app/utils/kontenBerita'

// POST /api/admin/konten/berita — buat berita/artikel baru dari Admin Portal.
// Slug dibuat otomatis dari judul dan dijaga unik per jenjang.
export default defineEventHandler(async (event) => {
  const { supabase } = await gerbangKonten(event, 'buat')
  const body = await readBody(event).catch(() => null)
  const { data, galat } = normalisasiPayloadBerita(body || {})
  if (galat || !data) {
    throw createError({ statusCode: 400, statusMessage: galat || 'Data berita tidak valid.' })
  }

  if (data.featured) {
    const { count, error: galatHitung } = await supabase
      .from('website_articles')
      .select('id', { count: 'exact', head: true })
      .eq('jenjang', data.jenjang)
      .eq('featured', true)
      .eq('status', 'Terbit')
    if (galatHitung && galatTabelKonten(galatHitung)) throw galatMigrasiKonten()
    if ((count || 0) >= 5) {
      throw createError({ statusCode: 400, statusMessage: 'Maksimal lima berita unggulan per jenjang.' })
    }
  }

  const slugDasar = buatSlug(data.judul)
  let slug = slugDasar
  for (let percobaan = 2; percobaan <= 50; percobaan++) {
    const { data: ada } = await supabase
      .from('website_articles')
      .select('id')
      .eq('jenjang', data.jenjang)
      .eq('slug', slug)
      .maybeSingle()
    if (!ada) break
    slug = `${slugDasar}-${percobaan}`
  }

  const { data: dibuat, error } = await supabase
    .from('website_articles')
    .insert({ ...data, slug })
    .select('*')
    .single()

  if (error) {
    if (galatTabelKonten(error)) throw galatMigrasiKonten()
    throw createError({ statusCode: 502, statusMessage: 'Berita gagal disimpan.' })
  }
  return { berita: keBentukAdmin(dibuat as BarisKonten) }
})
