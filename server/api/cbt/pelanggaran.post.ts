import { argumenUjian, bacaBodySiswa, rpcSiswa } from '../../utils/cbtSiswa'

export default defineEventHandler(async (event) => {
  const b = await bacaBodySiswa(event, true)
  return await rpcSiswa(event, 'cbt_siswa_pelanggaran', { ...argumenUjian(b), p_jenis: b.jenis ?? 'pindah_tab' }, b)
})
