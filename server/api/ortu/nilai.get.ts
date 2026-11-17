import { wajibSesiOrtu } from '../../utils/ortuSesi'
import { muatUjianOrtu } from '../../utils/ortuData'
import { semesterDari, tanggalWib } from '../../../app/composables/ortuCore'
import type { NilaiOrtu } from '../../../app/types/ortu'

// GET /api/ortu/nilai — semua ujian semester berjalan (UH/PR/PTS/PAS) beserta benar/salah; rincian per mapel dihitung di klien.
export default defineEventHandler(async (event): Promise<NilaiOrtu> => {
  const { db, sesi } = await wajibSesiOrtu(event)
  const ujian = await muatUjianOrtu(db, sesi.studentId)
  return { nama: sesi.nama, semester: semesterDari(tanggalWib()).label, ujian }
})
