import { wajibSesiOrtu } from '../../utils/ortuSesi'
import type { SesiOrtuKlien } from '../../../app/types/ortu'

// GET /api/ortu/sesi — cek ringan untuk middleware halaman; tetap menjawab walau kata sandi awal belum diganti.
export default defineEventHandler(async (event): Promise<SesiOrtuKlien> => {
  const { sesi } = await wajibSesiOrtu(event, { bolehWajibGanti: true })
  return { nis: sesi.nis, nama: sesi.nama, jenjang: sesi.grade, wajibGanti: sesi.wajibGanti }
})
