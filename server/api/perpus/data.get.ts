// GET /api/perpus/data — progres baca, favorit, tandai, catatan, rangkuman milik siswa.
import { bersihkanData } from '../../../app/composables/perpusCore'
import { wajibSiswa } from '../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { db, siswa } = await wajibSiswa(event)
  const { data, error } = await db.from('perpus_data').select('data').eq('student_id', siswa.id).maybeSingle()
  if (error) throw createError({ statusCode: 502, statusMessage: 'Data baca gagal dimuat.' })
  return { data: bersihkanData(data?.data) }
})
