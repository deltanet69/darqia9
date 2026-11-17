// POST /api/perpus/sesi — status masuk siswa: sudah terverifikasi (profil siswa) atau masih perlu NIS/NISN.
import { penggunaPerpus } from '../../utils/perpus'

export default defineEventHandler(async (event) => {
  const p = await penggunaPerpus(event)
  return p.siswa ? { tahap: 'masuk', siswa: p.siswa } : { tahap: 'verifikasi', email: p.email }
})
