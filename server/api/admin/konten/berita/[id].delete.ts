import { gerbangKonten, galatTabelKonten, galatMigrasiKonten } from '../../../../utils/kontenGate'

// DELETE /api/admin/konten/berita/:id — hapus berita dari Admin Portal
// (soft delete: deleted_at diisi, baris tidak dihilangkan dari database).
export default defineEventHandler(async (event) => {
  const { supabase } = await gerbangKonten(event, 'hapus')
  const id = String(getRouterParam(event, 'id') || '')

  const { data, error } = await supabase
    .from('website_articles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle()

  if (error) {
    if (galatTabelKonten(error)) throw galatMigrasiKonten()
    throw createError({ statusCode: 502, statusMessage: 'Berita gagal dihapus.' })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Berita tidak ditemukan.' })
  }
  return { terhapus: true }
})
