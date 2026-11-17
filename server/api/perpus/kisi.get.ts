// GET /api/perpus/kisi — kisi-kisi bank soal CBT untuk kelas siswa, topiknya dicocokkan ke buku koleksinya.
import { cocokkanBuku, parseKisi } from '../../../app/composables/perpusCore'
import { bukuSiswa, wajibSiswa } from '../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { db, siswa } = await wajibSiswa(event)
  const { data: s } = await db.from('students').select('class_id').eq('id', siswa.id).maybeSingle()
  if (!s?.class_id) return { kisi: [] }
  const { data, error } = await db.from('exams')
    .select('id, name, created_at, subjects(name), question_banks(kisi_kisi)')
    .eq('class_id', s.class_id).eq('grade', siswa.jenjang).in('status', ['draf', 'terjadwal', 'berlangsung', 'dibekukan'])
    .not('question_bank_id', 'is', null).order('created_at', { ascending: false }).limit(20)
  if (error) throw createError({ statusCode: 502, statusMessage: 'Kisi-kisi gagal dimuat.' })
  const buku = (await bukuSiswa(db, siswa)).filter(b => !b.akhirPekan)
  const kisi = (data || []).flatMap((e: any) => {
    const topik = parseKisi(String(e.question_banks?.kisi_kisi || ''))
    if (!topik.length) return []
    const mapel = e.subjects?.name || ''
    return [{
      id: e.id, judul: e.name, mapel, hari: Math.max(0, Math.floor((Date.now() - new Date(e.created_at).getTime()) / 864e5)),
      topik: topik.map(t => ({ ...t, buku: cocokkanBuku(t, mapel, buku) }))
    }]
  })
  return { kisi }
})
