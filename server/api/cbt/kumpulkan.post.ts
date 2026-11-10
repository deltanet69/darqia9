import { argumenUjian, bacaBodySiswa, rpcSiswa } from '../../utils/cbtSiswa'
import { nilaiEsai, type EsaiDinilai } from '../../utils/cbtNilaiEsai'

// Kumpulkan -> soal otomatis dinilai di database -> esai dinilai AI (maks. ~3,5 dtk, ada cadangan) -> ringkasan hasil.
export default defineEventHandler(async (event) => {
  const b = await bacaBodySiswa(event, true)
  const kumpul = await rpcSiswa(event, 'cbt_siswa_kumpulkan', { ...argumenUjian(b), p_jawaban: b.jawaban ?? [] }, b) as { esai?: EsaiDinilai[] }
  const esai = Array.isArray(kumpul?.esai) ? kumpul.esai : []
  const skorEsai = esai.length ? await nilaiEsai(esai, useRuntimeConfig(event)) : []
  const hasil = await rpcSiswa(event, 'cbt_siswa_hasil', { ...argumenUjian(b), p_esai: skorEsai }, b) as Record<string, unknown>
  return { selesai: true, ...hasil }
})
