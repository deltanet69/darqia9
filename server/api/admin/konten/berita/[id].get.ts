import { gerbangKonten, galatTabelKonten, galatMigrasiKonten } from '../../../../utils/kontenGate'
import { keBentukAdmin, type BarisKonten } from '../../../../../app/utils/kontenBerita'

// GET /api/admin/konten/berita/:id — satu berita untuk halaman editor admin.
export default defineEventHandler(async (event) => {
  const { supabase } = await gerbangKonten(event, 'lihat')
  const id = String(getRouterParam(event, 'id') || '')

  const { data, error } = await supabase
    .from('website_articles')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    if (galatTabelKonten(error)) throw galatMigrasiKonten()
    throw createError({ statusCode: 502, statusMessage: 'Berita gagal dimuat.' })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Berita tidak ditemukan.' })
  }
  return { berita: keBentukAdmin(data as BarisKonten) }
})
