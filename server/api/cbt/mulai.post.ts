import { argumenUjian, bacaBodySiswa, rpcSiswa, ujianPr, wajibAplikasi } from '../../utils/cbtSiswa'

export default defineEventHandler(async (event) => {
  const b = await bacaBodySiswa(event, true)
  await wajibAplikasi(event, b, () => ujianPr(event, b))
  return await rpcSiswa(event, 'cbt_siswa_mulai', argumenUjian(b), b)
})
