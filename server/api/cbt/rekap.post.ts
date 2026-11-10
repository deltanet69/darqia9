import { argumenSiswa, bacaBodySiswa, rpcSiswa } from '../../utils/cbtSiswa'

export default defineEventHandler(async (event) => {
  const b = await bacaBodySiswa(event)
  return await rpcSiswa(event, 'cbt_siswa_rekap', argumenSiswa(b), b)
})
