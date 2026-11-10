import { argumenUjian, bacaBodySiswa, rpcSiswa } from '../../utils/cbtSiswa'

export default defineEventHandler(async (event) => {
  const b = await bacaBodySiswa(event, true)
  return await rpcSiswa(event, 'cbt_siswa_kumpulkan', { ...argumenUjian(b), p_jawaban: b.jawaban ?? [] }, b)
})
