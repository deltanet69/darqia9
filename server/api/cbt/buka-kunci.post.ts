import { argumenUjian, bacaBodySiswa, catatTebakanSalah, rpcSiswa } from '../../utils/cbtSiswa'

export default defineEventHandler(async (event) => {
  const b = await bacaBodySiswa(event, true)
  const hasil = await rpcSiswa(event, 'cbt_siswa_buka_kunci', { ...argumenUjian(b), p_kode: b.kode ?? '' }, b) as { ok: boolean }
  if (!hasil?.ok) catatTebakanSalah(event, b.nis)
  return hasil
})
