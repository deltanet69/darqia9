import { wajibSesiOrtu } from '../../utils/ortuSesi'
import { muatSiswaOrtu, muatTagihanOrtu } from '../../utils/ortuData'
import type { AdministrasiOrtu } from '../../../app/types/ortu'

// GET /api/ortu/administrasi — tagihan per tingkat (rumus modul Keuangan) + 50 pembayaran terakhir.
export default defineEventHandler(async (event): Promise<AdministrasiOrtu> => {
  const { db, sesi } = await wajibSesiOrtu(event)
  const [{ siswa }, t] = await Promise.all([
    muatSiswaOrtu(db, sesi.studentId),
    muatTagihanOrtu(db, sesi.grade, sesi.nis, true)
  ])
  // Format tautan sama dengan cetak tagihan admin (KeuanganCetak): halaman verifikasi membaca total & sisa dari query.
  const total = t.tingkat.reduce((a, x) => a + x.total, 0)
  const sisa = t.tingkat.reduce((a, x) => a + x.sisa, 0)
  const nis = encodeURIComponent(sesi.nis)
  return {
    kode: t.kode, paket: t.paket, tahunAjaran: siswa.tahunAjaran, tingkat: t.tingkat, riwayat: t.riwayat,
    verifikasi: `/verifikasi/tagihan/TAG-${sesi.grade}-${nis}?nis=${nis}&grade=${sesi.grade}&t=${total}&s=${sisa}`
  }
})
