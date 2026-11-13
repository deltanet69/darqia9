import { acakSoal, argumenUjian, bacaBodySiswa, rpcSiswa, soalUjian, versiSoal } from '../../utils/cbtSiswa'

// Membuka ujian yang jamnya sudah tiba: data ujian + keadaan tersimpan (dari database) + soal (dari cache server).
export default defineEventHandler(async (event) => {
  const b = await bacaBodySiswa(event, true)
  const info = await rpcSiswa(event, 'cbt_siswa_siapkan', argumenUjian(b), b) as Record<string, unknown>
  const acak = await acakSoal(event, b.source!, b.examId!)
  info.acak = acak
  info.acakEsai = acak.esai // aplikasi lama yang masih terbuka saat deploy
  const questions = await soalUjian(event, b.source!, b.examId!)
  if (!questions.length) throw createError({ statusCode: 403, statusMessage: 'Ujian belum memiliki soal. Hubungi pengawas.' })
  info.versiSoal = versiSoal(questions)
  // Perangkat yang sudah menyimpan soal versi yang sama (kembali ke ujian setelah refresh) tidak perlu mengunduhnya lagi.
  if (b.tanpaSoal && b.versi === info.versiSoal) return info
  return { ...info, questions }
})
