import { wajibSesiOrtu } from '../../utils/ortuSesi'
import { ambilPresensiHarian } from '../../utils/ortuPresensi'
import { persenHadir } from '../../utils/ortuData'
import { bulanSah } from '../../../app/composables/ortuCore'
import { tanggalWib } from '../../../app/composables/dashboardCore'
import type { PresensiOrtu } from '../../../app/types/ortu'

// GET /api/ortu/presensi?bulan=YYYY-MM (bawaan: bulan berjalan WIB).
export default defineEventHandler(async (event): Promise<PresensiOrtu> => {
  const { db, sesi } = await wajibSesiOrtu(event)
  const q = getQuery(event).bulan
  if (q !== undefined && !bulanSah(q)) throw createError({ statusCode: 400, statusMessage: 'Format bulan tidak valid.' })
  const bulan = (q as string | undefined) ?? tanggalWib().slice(0, 7)
  const [hari, { data: s }] = await Promise.all([
    ambilPresensiHarian(db, sesi.studentId, bulan),
    db.from('students').select('attendance_pct').eq('id', sesi.studentId).maybeSingle()
  ])
  return { bulan, nama: sesi.nama, kehadiranPersen: persenHadir(s), hari }
})
