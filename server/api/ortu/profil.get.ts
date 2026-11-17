import { wajibSesiOrtu } from '../../utils/ortuSesi'
import { muatSiswaOrtu } from '../../utils/ortuData'
import { kontakDari } from '../../../app/composables/ortuCore'
import type { ProfilOrtu } from '../../../app/types/ortu'

// GET /api/ortu/profil — data pokok (hanya baca) + kontak yang boleh diubah orang tua. Tanpa NIK/No. KK.
export default defineEventHandler(async (event): Promise<ProfilOrtu> => {
  const { db, sesi } = await wajibSesiOrtu(event)
  const { siswa, baris } = await muatSiswaOrtu(db, sesi.studentId, 'father_phone, mother_phone, father_email, mother_email, address')
  return { siswa, ayah: baris.father_name || '', ibu: baris.mother_name || '', kontak: kontakDari(baris) }
})
