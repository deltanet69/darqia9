// PUT /api/perpus/data — simpan data baca siswa (dibersihkan dan dibatasi ukurannya di server).
import { bersihkanData, gabungBaca } from '../../../app/composables/perpusCore'
import { wajibSiswa } from '../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { db, siswa } = await wajibSiswa(event)
  const body = await readBody(event).catch(() => null)
  const data = bersihkanData(body?.data)
  const { data: ada } = await db.from('perpus_data').select('data').eq('student_id', siswa.id).maybeSingle()
  data.baca = gabungBaca(bersihkanData(ada?.data).baca, data.baca)
  if (JSON.stringify(data).length > 400_000) throw createError({ statusCode: 413, statusMessage: 'Data baca terlalu besar.' })
  const { error } = await db.from('perpus_data').upsert({ student_id: siswa.id, data, updated_at: new Date().toISOString() }, { onConflict: 'student_id' })
  if (error) throw createError({ statusCode: 502, statusMessage: 'Data baca gagal disimpan.' })
  return { ok: true, baca: data.baca }
})
