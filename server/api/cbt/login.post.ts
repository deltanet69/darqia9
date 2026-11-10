import { argumenSiswa, bacaBodySiswa, rpcSiswa } from '../../utils/cbtSiswa'

// Login ringan: hanya NIS + token. Mengembalikan profil dan jadwal, tanpa soal.
export default defineEventHandler(async (event) => {
  const b = await bacaBodySiswa(event)
  return await rpcSiswa(event, 'cbt_siswa_login', argumenSiswa(b), b)
})
