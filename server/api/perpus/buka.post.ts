// POST /api/perpus/buka { id } — catat satu pembacaan buku (statistik admin). Dipanggil reader setelah buku berhasil dimuat.
// Hanya buku yang memang boleh dibuka siswa ini yang dihitung; jeda < 30 menit per siswa tidak menambah hitungan (SQL).
import { akhirPekanWib, terbukaUntuk } from '../../../app/composables/perpusCore'
import { barisKatalog, wajibSiswa } from '../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { db, siswa } = await wajibSiswa(event)
  const body = await readBody(event).catch(() => null)
  const b = (await barisKatalog(db)).find(x => x.id === body?.id)
  if (!b || !terbukaUntuk(b, siswa) || (b.akhir_pekan && !akhirPekanWib())) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })
  await db.rpc('perpus_catat_buka', { p_student: siswa.id, p_buku: b.id })
  return { ok: true }
})
