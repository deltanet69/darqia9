// PATCH /api/admin/perpus/buku/:id — { aktif } saja (tampil/sembunyikan), atau formulir lengkap (ubah metadata buku).
import { rapikanForm } from '../../../../../app/composables/perpusCore'
import { gerbangAdminUsers } from '../../../../utils/adminUsersGate'
import { resetKatalog } from '../../../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { supabase: db } = await gerbangAdminUsers(event, 'ubah', 'Perpustakaan Digital')
  const body = await readBody(event).catch(() => null)
  let patch: Record<string, unknown>
  if ('judul' in (body || {})) {
    const f = rapikanForm(body)
    if ('galat' in f) throw createError({ statusCode: 400, statusMessage: f.galat })
    patch = f.baris
  } else if (typeof body?.aktif === 'boolean') {
    patch = { aktif: body.aktif }
  } else throw createError({ statusCode: 400, statusMessage: 'Data buku tidak valid.' })
  const { data, error } = await db.from('perpus_buku').update(patch).eq('id', getRouterParam(event, 'id')).select('id').maybeSingle()
  if (error) throw createError({ statusCode: 502, statusMessage: 'Buku gagal disimpan.' })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })
  resetKatalog()
  return { ok: true }
})
