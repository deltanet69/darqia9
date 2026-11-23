import { wajibSesiOrtu } from '../../utils/ortuSesi'
import { sajikanFotoSiswa } from '../../utils/fotoSiswa'

// GET /api/ortu/foto — foto anak sendiri untuk cetak kartu ujian dari Portal Orang Tua.
// NIS selalu diambil dari sesi, tidak pernah dari parameter, jadi orang tua hanya bisa mengambil foto anaknya.
export default defineEventHandler(async (event) => {
  const { sesi } = await wajibSesiOrtu(event)
  return sajikanFotoSiswa(event, sesi.nis)
})
