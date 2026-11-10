import { argumenUjian, bacaBodySiswa, rpcSiswa, soalUjian } from '../../utils/cbtSiswa'

// Membuka ujian yang jamnya sudah tiba: data ujian + keadaan tersimpan (dari database) + soal (dari cache server).
export default defineEventHandler(async (event) => {
  const b = await bacaBodySiswa(event, true)
  const info = await rpcSiswa(event, 'cbt_siswa_siapkan', argumenUjian(b), b) as Record<string, unknown>
  // Perangkat yang sudah menyimpan soal (kembali ke ujian setelah refresh) tidak perlu mengunduhnya lagi.
  if (b.tanpaSoal) return info
  const questions = await soalUjian(event, b.source!, b.examId!)
  if (!questions.length) throw createError({ statusCode: 403, statusMessage: 'Ujian belum memiliki soal. Hubungi pengawas.' })
  return { ...info, questions }
})
