// PUT /api/admin/perpus/buku/:id/sampul — badan mentah WebP/JPEG (klien sudah mengecilkan), maks 300 KB (klien memampatkan ke ~100 KB). Nama berkas unik per unggahan
// supaya cache peramban tidak menahan sampul lama.
import { urlSampul } from '../../../../../../app/composables/perpusCore'
import { gerbangAdminUsers } from '../../../../../utils/adminUsersGate'
import { bacaBerkasUnggahan, hapusBerkas, resetKatalog, tulisBerkas } from '../../../../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { supabase: db } = await gerbangAdminUsers(event, 'ubah', 'Perpustakaan Digital')
  const id = getRouterParam(event, 'id')!
  const { data: buku } = await db.from('perpus_buku').select('id, sampul').eq('id', id).maybeSingle()
  if (!buku) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })
  const webp = (b: Buffer) => b.length > 12 && b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP'
  const isi = await bacaBerkasUnggahan(event, 300 * 1024, b => webp(b) || (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF), 'sampul WebP/JPEG')
  const berkas = `sampul/${id}-${Date.now().toString(36)}.${webp(isi) ? 'webp' : 'jpg'}`
  await tulisBerkas(berkas, isi)
  const { error } = await db.from('perpus_buku').update({ sampul: berkas }).eq('id', id)
  if (error) {
    await hapusBerkas(berkas)
    throw createError({ statusCode: 502, statusMessage: 'Sampul gagal disimpan. Pastikan migrasi 0078 sudah dijalankan.' })
  }
  if (buku.sampul) await hapusBerkas(buku.sampul)
  resetKatalog()
  return { sampul: urlSampul(berkas) }
})
