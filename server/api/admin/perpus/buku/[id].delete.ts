// DELETE /api/admin/perpus/buku/:id — hapus buku dari katalog + sampul dan PDF unggahannya.
// PDF hasil impor manual (path di luar unggah/) tidak disentuh.
import { gerbangAdminUsers } from '../../../../utils/adminUsersGate'
import { hapusBerkas, resetKatalog } from '../../../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { supabase: db } = await gerbangAdminUsers(event, 'hapus', 'Perpustakaan Digital')
  const { data, error } = await db.from('perpus_buku').delete().eq('id', getRouterParam(event, 'id')).select('path_pdf, sampul').maybeSingle()
  if (error) throw createError({ statusCode: 502, statusMessage: 'Buku gagal dihapus.' })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })
  if (data.sampul) await hapusBerkas(data.sampul)
  if (data.path_pdf?.startsWith('unggah/')) await hapusBerkas(data.path_pdf)
  resetKatalog()
  return { ok: true }
})
