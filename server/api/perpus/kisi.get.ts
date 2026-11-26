// GET /api/perpus/kisi — kisi-kisi untuk kelas siswa di Media Pembelajaran.
// Sumber utama: bank soal yang ditugaskan ke KELAS siswa sendiri (CBT `question_banks` +
// LMS `ujian_harian_banks`) dan sudah disusun kisi-kisinya oleh guru — tampil walau ujiannya
// belum dijadwalkan. Ujian kelas (exams / ujian_harian) yang memakai bank yang sama memberi
// judul tampilan, dan bisa menarik bank tambahan di luar penugasan kelas.
// Butir terstruktur Bloom (kisi_butir, migrasi 0095) menjadi topik berlevel C1-C6; bank lama
// tanpa butir memakai jalur teks (parseKisi). Tiap topik dicocokkan ke rekomendasi BAB spesifik
// dari indeks perpus_bab (judul bab + subbab + halaman), dengan cadangan rekomendasi tingkat
// buku (cocokkanBuku).
import { cocokkanBab, cocokkanBuku, parseKisi, type BabBuku } from '../../../app/composables/perpusCore'
import { indikatorLengkap, parseButirKisi } from '../../../app/utils/kisiBloom'
import { bukuSiswa, wajibSiswa } from '../../utils/perpus'

export default defineEventHandler(async (event) => {
  const { db, siswa } = await wajibSiswa(event)
  const { data: s } = await db.from('students').select('class_id').eq('id', siswa.id).maybeSingle()
  if (!s?.class_id) return { kisi: [] }

  type BankMentah = {
    id: string, name: string, subject: string | null,
    kisi_kisi: string | null, kisi_butir?: unknown,
    created_at: string | null, updated_at: string | null
  }
  const bankMap = new Map<string, BankMentah>()
  const tambahBank = (b: BankMentah) => { if (b?.id && !bankMap.has(b.id)) bankMap.set(b.id, b) }

  const ambilBank = async (tabel: string, bangun: (q: any) => any) => {
    let r = await bangun(db.from(tabel).select('id, name, subject, kisi_kisi, kisi_butir, created_at, updated_at'))
    if (r.error && /kisi_butir/i.test(String(r.error.message || ''))) {
      // Migrasi 0095 belum jalan: mundur ke kolom teks saja agar kisi-kisi lama tetap tampil.
      r = await bangun(db.from(tabel).select('id, name, subject, kisi_kisi, created_at, updated_at'))
    }
    if (r.error) throw createError({ statusCode: 502, statusMessage: 'Kisi-kisi gagal dimuat.' })
    return (r.data || []) as BankMentah[]
  }

  // 1) Bank yang ditugaskan ke kelas siswa (CBT + LMS).
  for (const tabel of ['question_banks', 'ujian_harian_banks']) {
    const baris = await ambilBank(tabel, q => q
      .eq('class_id', s.class_id).eq('grade', siswa.jenjang)
      .order('updated_at', { ascending: false }).limit(30))
    for (const b of baris) tambahBank(b)
  }

  // 2) Ujian kelas: nama ujian menjadi judul tampilan; bank di luar penugasan kelas ikut ditarik.
  const judulUjian = new Map<string, string>()
  for (const tabel of ['exams', 'ujian_harian']) {
    const { data: uj } = await db.from(tabel)
      .select('name, question_bank_id, created_at')
      .eq('class_id', s.class_id).eq('grade', siswa.jenjang)
      .in('status', ['draf', 'terjadwal', 'berlangsung', 'dibekukan'])
      .not('question_bank_id', 'is', null)
      .order('created_at', { ascending: false }).limit(20)
    for (const e of (uj || []) as any[]) {
      if (e.question_bank_id && !judulUjian.has(e.question_bank_id)) judulUjian.set(e.question_bank_id, e.name)
    }
  }
  const bankKurang = [...judulUjian.keys()].filter(id => !bankMap.has(id))
  if (bankKurang.length) {
    for (const tabel of ['question_banks', 'ujian_harian_banks']) {
      const baris = await ambilBank(tabel, q => q.in('id', bankKurang))
      for (const b of baris) tambahBank(b)
    }
  }

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

  const lengkapi = (t: { t: string, i: string }, mapel: string) => {
    const bukuCocok = cocokkanBuku(t, mapel, buku)
    return {
      buku: bukuCocok,
      rek: cocokkanBab(t, mapel, buku, bab),
      // Jujur untuk label siswa: buku rujukan utama sudah punya indeks bab atau belum.
      babTerindeks: bukuCocok.length ? (babPerBuku.get(bukuCocok[0]!.id) ?? 0) > 0 : false
    }
  }

  const kisi = [...bankMap.values()].flatMap((b) => {
    const mapel = b.subject || ''
    const acuan = b.updated_at || b.created_at
    const hari = acuan ? Math.max(0, Math.floor((Date.now() - new Date(acuan).getTime()) / 864e5)) : 0
    const judul = judulUjian.get(b.id) || b.name
    const butir = parseButirKisi(b.kisi_butir)
    if (butir.length) {
      return [{
        id: b.id, judul, mapel, hari,
        topik: butir.map(x => {
          const t = { t: x.materi, i: indikatorLengkap(x) }
          return { ...t, level: x.level, kko: x.kko, soal: x.soal, ...lengkapi(t, mapel) }
        })
      }]
    }
    const topik = parseKisi(String(b.kisi_kisi || ''))
    if (!topik.length) return []
    return [{ id: b.id, judul, mapel, hari, topik: topik.map(t => ({ ...t, ...lengkapi(t, mapel) })) }]
  }).slice(0, 20)
  return { kisi }
})
