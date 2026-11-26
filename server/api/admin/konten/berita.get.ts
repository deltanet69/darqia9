import { gerbangKonten, galatTabelKonten, galatMigrasiKonten } from '../../../utils/kontenGate'
import { keBentukAdmin, normalisasiJenjang, type BarisKonten } from '../../../../app/utils/kontenBerita'

// GET /api/admin/konten/berita?jenjang=SMP|SMK — semua berita satu jenjang
// untuk Admin Portal (semua status, termasuk Draft & Review).
export default defineEventHandler(async (event) => {
  const { supabase } = await gerbangKonten(event, 'lihat')
  const jenjang = normalisasiJenjang(getQuery(event).jenjang)
  if (!jenjang) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter jenjang harus SMP atau SMK.' })
  }

  const { data, error } = await supabase
    .from('website_articles')
    .select('*')
    .eq('jenjang', jenjang.toUpperCase())
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(300)

  if (error) {
    if (galatTabelKonten(error)) throw galatMigrasiKonten()
    throw createError({ statusCode: 502, statusMessage: 'Daftar berita gagal dimuat.' })
  }
  return { berita: ((data || []) as BarisKonten[]).map(keBentukAdmin) }
})
