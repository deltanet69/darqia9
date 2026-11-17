// POST /api/admin/perpus/buku — tambah buku ke katalog (metadata). Sampul dan PDF diunggah lewat endpoint terpisah.
import { rapikanForm, slugBuku } from '../../../../app/composables/perpusCore'
import { gerbangAdminUsers } from '../../../utils/adminUsersGate'
import { resetKatalog } from '../../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { supabase: db } = await gerbangAdminUsers(event, 'buat', 'Perpustakaan Digital')
  const f = rapikanForm(await readBody(event).catch(() => null))
  if ('galat' in f) throw createError({ statusCode: 400, statusMessage: f.galat })
  const dasar = slugBuku(f.baris.judul) || 'buku'
  const [{ data: ada, error }, { data: akhir }] = await Promise.all([
    db.from('perpus_buku').select('id').like('id', `${dasar}%`),
    db.from('perpus_buku').select('urutan').order('urutan', { ascending: false }).limit(1)
  ])
  if (error) throw createError({ statusCode: 502, statusMessage: 'Katalog gagal dibaca.' })
  const pakai = new Set((ada || []).map((r: any) => r.id))
  let id = dasar
  for (let n = 2; pakai.has(id); n++) id = `${dasar}-${n}`
  const { error: e } = await db.from('perpus_buku').insert({ ...f.baris, id, slug_file: id, urutan: (akhir?.[0]?.urutan ?? 0) + 1 })
  if (e) throw createError({ statusCode: 502, statusMessage: 'Buku gagal disimpan.' })
  resetKatalog()
  return { id }
})
