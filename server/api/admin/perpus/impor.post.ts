// POST /api/admin/perpus/impor { isi } — perbarui katalog dari isi katalog-perpus-darqia.json / Excel ekspor
// (larik baris, atau objek { namaSheet: [baris] }). Aturan penyaringan sama dengan skrip impor: baris
// "Tidak boleh di-host", UNVERIFIED, dan sheet terlarang tidak pernah ditulis. Buku yang tidak ada di file
// dibiarkan apa adanya; status aktif buku yang sudah ada tidak diubah.
import { bacaKatalog, jumlahMentah } from '../../../../app/composables/perpusCore'
import { gerbangAdminUsers } from '../../../utils/adminUsersGate'
import { resetKatalog } from '../../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { supabase: db } = await gerbangAdminUsers(event, 'buat', 'Perpustakaan Digital')
  const body = await readBody(event).catch(() => null)
  const isi = body?.isi
  if (!isi || typeof isi !== 'object' || jumlahMentah(isi) > 5000) throw createError({ statusCode: 400, statusMessage: 'Isi katalog tidak valid atau lebih dari 5.000 baris.' })
  const baris = bacaKatalog(isi)
  if (!baris.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada baris buku yang bisa dibaca. Periksa nama kolom (Judul, Jenjang, Kelas, ...).' })

  const { data: ada, error } = await db.from('perpus_buku').select('id')
  if (error) throw createError({ statusCode: 502, statusMessage: 'Katalog gagal dibaca.' })
  const sudah = new Set((ada || []).map((r: any) => r.id))
  for (let i = 0; i < baris.length; i += 100) {
    const { error: e } = await db.from('perpus_buku').upsert(baris.slice(i, i + 100), { onConflict: 'id' })
    if (e) throw createError({ statusCode: 502, statusMessage: `Katalog gagal ditulis (${e.message}).` })
  }
  resetKatalog()
  const diperbarui = baris.filter(r => sudah.has(r.id)).length
  return { ditulis: baris.length, baru: baris.length - diperbarui, diperbarui, disaring: jumlahMentah(isi) - baris.length }
})
