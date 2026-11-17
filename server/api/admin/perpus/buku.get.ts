// GET /api/admin/perpus/buku — seluruh katalog (aktif dan nonaktif) + ketersediaan berkas + statistik baca.
import { gerbangAdminUsers } from '../../../utils/adminUsersGate'
import { formatBerkas, urlSampul } from '../../../../app/composables/perpusCore'
import { pdfAda } from '../../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { supabase: db } = await gerbangAdminUsers(event, 'lihat', 'Perpustakaan Digital')
  const { data, error } = await db.from('perpus_buku').select('*').order('judul')
  if (error) throw createError({ statusCode: 502, statusMessage: 'Katalog gagal dimuat.' })
  const [stat, unik] = await Promise.all([db.rpc('perpus_statistik'), db.rpc('perpus_pembaca_unik')])
  if (stat.error || unik.error) throw createError({ statusCode: 502, statusMessage: 'Statistik baca gagal dimuat. Pastikan migrasi 0075 sudah dijalankan.' })
  const peta = new Map<string, any>((stat.data || []).map((s: any) => [s.buku_id, s]))
  const ada = await Promise.all((data || []).map((r: any) => pdfAda(r.path_pdf)))
  return {
    pembacaUnik: Number(unik.data || 0),
    buku: (data || []).map((r: any, i: number) => ({
      id: r.id, judul: r.judul, pengarang: r.pengarang, penerbit: r.penerbit, jenjang: r.jenjang || [],
      kelas: r.kelas_label, mapel: r.mapel, jenis: r.jenis, kurikulum: r.kurikulum, statusLegal: r.status_legal,
      aksesBaca: r.akses_baca, akhirPekan: r.akhir_pekan, slugFile: r.slug_file, pathPdf: r.path_pdf, sampul: urlSampul(r.sampul), sinopsis: r.sinopsis || '', format: formatBerkas(r.path_pdf), aktif: r.aktif,
      berkasAda: ada[i], dibaca: Number(peta.get(r.id)?.total || 0), pembaca: Number(peta.get(r.id)?.pembaca || 0),
      terakhir: peta.get(r.id)?.terakhir || null
    }))
  }
})
