// GET /api/perpus/kisi — kisi-kisi bank soal CBT untuk kelas siswa.
// Butir terstruktur Bloom (kisi_butir, migrasi 0095) menjadi topik berlevel C1-C6; bank lama tanpa butir
// memakai jalur teks (parseKisi). Tiap topik dicocokkan ke rekomendasi BAB spesifik dari indeks
// perpus_bab (judul bab + subbab + halaman), dengan cadangan rekomendasi tingkat buku (cocokkanBuku).
import { cocokkanBab, cocokkanBuku, parseKisi, type BabBuku } from '../../../app/composables/perpusCore'
import { indikatorLengkap, parseButirKisi } from '../../../app/utils/kisiBloom'
import { bukuSiswa, wajibSiswa } from '../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { db, siswa } = await wajibSiswa(event)
  const { data: s } = await db.from('students').select('class_id').eq('id', siswa.id).maybeSingle()
  if (!s?.class_id) return { kisi: [] }

  const kolom = 'id, name, created_at, subjects(name), question_banks(kisi_kisi, kisi_butir)'
  const ambilUjian = (kol: string) => db.from('exams')
    .select(kol)
    .eq('class_id', s.class_id).eq('grade', siswa.jenjang).in('status', ['draf', 'terjadwal', 'berlangsung', 'dibekukan'])
    .not('question_bank_id', 'is', null).order('created_at', { ascending: false }).limit(20)
  let { data, error } = await ambilUjian(kolom)
  if (error && /kisi_butir/i.test(String(error.message || ''))) {
    // Migrasi 0095 belum jalan: mundur ke kolom teks saja agar kisi-kisi lama tetap tampil.
    ({ data, error } = await ambilUjian('id, name, created_at, subjects(name), question_banks(kisi_kisi)'))
  }
  if (error) throw createError({ statusCode: 502, statusMessage: 'Kisi-kisi gagal dimuat.' })

  const buku = (await bukuSiswa(db, siswa)).filter(b => !b.akhirPekan)

  // Indeks bab untuk seluruh katalog (dijaring per buku siswa di cocokkanBab). Tabel belum ada -> kosong.
  const bab: BabBuku[] = []
  for (let dari = 0; dari < 10_000; dari += 1000) {
    const { data: baris, error: errBab } = await db.from('perpus_bab')
      .select('buku_id, nomor, judul, halaman_mulai, halaman_selesai, subbab')
      .order('buku_id').order('nomor').range(dari, dari + 999)
    if (errBab || !baris?.length) break
    for (const r of baris) {
      bab.push({
        bukuId: String(r.buku_id), nomor: Number(r.nomor) || 0, judul: String(r.judul),
        mulai: Number(r.halaman_mulai) || 0, selesai: Number(r.halaman_selesai) || 0,
        subbab: Array.isArray(r.subbab) ? r.subbab.map((x: unknown) => String(x)) : []
      })
    }
    if (baris.length < 1000) break
  }
  const babPerBuku = new Map<string, number>()
  for (const b of bab) babPerBuku.set(b.bukuId, (babPerBuku.get(b.bukuId) ?? 0) + 1)

  const kisi = (data || []).flatMap((e: any) => {
    const mapel = e.subjects?.name || ''
    const hari = Math.max(0, Math.floor((Date.now() - new Date(e.created_at).getTime()) / 864e5))
    const lengkapi = (t: { t: string, i: string }) => {
      const bukuCocok = cocokkanBuku(t, mapel, buku)
      return {
        buku: bukuCocok,
        rek: cocokkanBab(t, mapel, buku, bab),
        // Jujur untuk label siswa: buku rujukan utama sudah punya indeks bab atau belum.
        babTerindeks: bukuCocok.length ? (babPerBuku.get(bukuCocok[0]!.id) ?? 0) > 0 : false
      }
    }
    const butir = parseButirKisi(e.question_banks?.kisi_butir)
    if (butir.length) {
      return [{
        id: e.id, judul: e.name, mapel, hari,
        topik: butir.map(b => {
          const t = { t: b.materi, i: indikatorLengkap(b) }
          return { ...t, level: b.level, kko: b.kko, soal: b.soal, ...lengkapi(t) }
        })
      }]
    }
    const topik = parseKisi(String(e.question_banks?.kisi_kisi || ''))
    if (!topik.length) return []
    return [{ id: e.id, judul: e.name, mapel, hari, topik: topik.map(t => ({ ...t, ...lengkapi(t) })) }]
  })
  return { kisi }
})
