import { gerbangKonten, galatTabelKonten, galatMigrasiKonten } from '../../../../utils/kontenGate'
import { keBentukAdmin, normalisasiPayloadBerita, type BarisKonten } from '../../../../../app/utils/kontenBerita'

// PUT /api/admin/konten/berita/:id — ubah berita dari Admin Portal.
// Slug tidak ikut berubah agar tautan publik yang sudah tersebar tidak mati.
export default defineEventHandler(async (event) => {
  const { supabase } = await gerbangKonten(event, 'ubah')
  const id = String(getRouterParam(event, 'id') || '')
  const body = await readBody(event).catch(() => null)
  const { data, galat } = normalisasiPayloadBerita(body || {})
  if (galat || !data) {
    throw createError({ statusCode: 400, statusMessage: galat || 'Data berita tidak valid.' })
  }

  const { data: lama, error: galatLama } = await supabase
    .from('website_articles')
    .select('id, jenjang')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (galatLama) {
    if (galatTabelKonten(galatLama)) throw galatMigrasiKonten()
    throw createError({ statusCode: 502, statusMessage: 'Berita gagal dimuat.' })
  }
  if (!lama) {
    throw createError({ statusCode: 404, statusMessage: 'Berita tidak ditemukan.' })
  }
  // Jenjang pemilik baris adalah yang berlaku (berita tidak pindah jenjang).
  data.jenjang = lama.jenjang

  if (data.featured) {
    const { count } = await supabase
      .from('website_articles')
      .select('id', { count: 'exact', head: true })
      .eq('jenjang', data.jenjang)
      .eq('featured', true)
      .eq('status', 'Terbit')
      .neq('id', id)
    if ((count || 0) >= 5) {
      throw createError({ statusCode: 400, statusMessage: 'Maksimal lima berita unggulan per jenjang.' })
    }
  }

  const { slug: _abaikan, ...perubahan } = data as Record<string, any>
  const { data: diubah, error } = await supabase
    .from('website_articles')
    .update(perubahan)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    if (galatTabelKonten(error)) throw galatMigrasiKonten()
    throw createError({ statusCode: 502, statusMessage: 'Berita gagal disimpan.' })
  }
  return { berita: keBentukAdmin(diubah as BarisKonten) }
})
