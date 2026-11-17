// GET /api/perpus/buku — koleksi untuk jenjang & kelas siswa. Buku yang PDF-nya belum ada tetap tampil (tersedia: false).
import { bukuSiswa, wajibSiswa } from '../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { db, siswa } = await wajibSiswa(event)
  return { buku: await bukuSiswa(db, siswa) }
})
