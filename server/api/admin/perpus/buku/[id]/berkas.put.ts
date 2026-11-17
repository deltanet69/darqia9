// PUT /api/admin/perpus/buku/:id/berkas — badan mentah PDF atau EPUB, maks 100 MB. Disimpan di PERPUS_DIR/unggah/<id>.pdf|.epub.
// shortcut: seluruh berkas dibaca ke memori; ganti ke stream bila berkas > 100 MB atau unggahan serentak ramai.
import { gerbangAdminUsers } from '../../../../../utils/adminUsersGate'
import { bacaBerkasUnggahan, hapusBerkas, resetKatalog, tulisBerkas } from '../../../../../utils/perpus'

const adalahPdf = (b: Buffer) => b.subarray(0, 5).toString('latin1') === '%PDF-'
// EPUB = ZIP yang entri pertamanya "mimetype" berisi application/epub+zip (aturan OCF).
const adalahEpub = (b: Buffer) => b.readUInt32LE(0) === 0x04034B50 && b.subarray(30, 38).toString('latin1') === 'mimetype' && b.subarray(38, 58).toString('latin1') === 'application/epub+zip'

export default defineEventHandler(async (event) => {
  const { supabase: db } = await gerbangAdminUsers(event, 'ubah', 'Perpustakaan Digital')
  const id = getRouterParam(event, 'id')!
  const { data: buku } = await db.from('perpus_buku').select('id, path_pdf').eq('id', id).maybeSingle()
  if (!buku) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })
  const isi = await bacaBerkasUnggahan(event, 100 * 1048576, b => b.length > 58 && (adalahPdf(b) || adalahEpub(b)), 'PDF atau EPUB')
  const rel = `unggah/${id}.${adalahPdf(isi) ? 'pdf' : 'epub'}`
  await tulisBerkas(rel, isi)
  const { error } = await db.from('perpus_buku').update({ path_pdf: rel }).eq('id', id)
  if (error) throw createError({ statusCode: 502, statusMessage: 'Jalur berkas gagal disimpan.' })
  if (buku.path_pdf?.startsWith('unggah/') && buku.path_pdf !== rel) await hapusBerkas(buku.path_pdf) // format diganti: buang berkas lama
  resetKatalog()
  return { ok: true }
})
