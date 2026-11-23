import { wajibStaf } from '../../../utils/wajibStaf'
import { sajikanFotoSiswa } from '../../../utils/fotoSiswa'

// GET /api/kartu/foto/:nis — foto siswa untuk cetak kartu ujian di admin. Hanya sesi guru/staf.
export default defineEventHandler(async (event) => {
  await wajibStaf(event)
  return sajikanFotoSiswa(event, getRouterParam(event, 'nis') || '')
})
