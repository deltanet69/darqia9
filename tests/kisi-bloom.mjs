// Tes util kisi-kisi Bloom: validasi pasangan level-KKO, urutan C1->C6, teks turunan, komposisi.
// Jalankan: node tests/kisi-bloom.mjs
import assert from 'node:assert/strict'
import { BLOOM, urutkanButirKisi, kkoKanonik, rapikanButirKisi, parseButirKisi, teksDariButir, komposisiButir, indikatorLengkap } from '../app/utils/kisiBloom.ts'

// KKO kanonik: tidak peka huruf, harus anggota levelnya
assert.equal(kkoKanonik('C3', 'menyelesaikan'), 'Menyelesaikan')
assert.equal(kkoKanonik('C3', 'Menyebutkan'), null) // Menyebutkan itu C1
assert.equal(kkoKanonik('C2', 'Membandingkan'), 'Membandingkan') // ada di beberapa level, sah di levelnya
assert.equal(kkoKanonik('C1', 'Membandingkan'), null)
assert.equal(BLOOM.C6.kko.includes('Merancang'), true)

// Rapikan: butir sah, nomor soal di luar daftar dibuang, pola "Siswa dapat <kko>" ganda dipotong
const sah = new Set([1, 2, 3, 5])
const b = rapikanButirKisi({ materi: ' Eksponen ', level: 'c3', kko: 'menyelesaikan', indikator: 'Siswa dapat menyelesaikan soal pertumbuhan bakteri.', soal: [5, 3, 3, 99] }, sah)
assert.deepEqual(b, { materi: 'Eksponen', indikator: 'soal pertumbuhan bakteri.', level: 'C3', kko: 'Menyelesaikan', soal: [3, 5] })

// Rapikan: yang tidak sah ditolak
assert.equal(rapikanButirKisi({ materi: 'X', level: 'C9', kko: 'Menilai', indikator: 'y', soal: [] }), null)
assert.equal(rapikanButirKisi({ materi: 'X', level: 'C5', kko: 'Menghitung', indikator: 'y', soal: [] }), null) // KKO bukan milik level
assert.equal(rapikanButirKisi({ materi: '', level: 'C1', kko: 'Menyebutkan', indikator: 'y', soal: [] }), null)
assert.equal(rapikanButirKisi({ materi: 'X', level: 'C1', kko: 'Menyebutkan', indikator: '', soal: [] }), null)
assert.equal(rapikanButirKisi('bukan objek'), null)

// Urutan: menaik C1->C6, stabil di dalam level yang sama
const acak = [
  { materi: 'B', indikator: 'i', level: 'C4', kko: 'Menganalisis', soal: [] },
  { materi: 'A', indikator: 'i', level: 'C1', kko: 'Menyebutkan', soal: [] },
  { materi: 'C', indikator: 'i', level: 'C3', kko: 'Menghitung', soal: [] },
  { materi: 'D', indikator: 'i', level: 'C1', kko: 'Mengingat', soal: [] },
  { materi: 'E', indikator: 'i', level: 'C6', kko: 'Membuat', soal: [] }
]
assert.deepEqual(urutkanButirKisi(acak).map(x => x.materi), ['A', 'D', 'C', 'B', 'E'])

// parseButirKisi: jsonb rusak aman, hasil terurut
assert.deepEqual(parseButirKisi(null), [])
assert.deepEqual(parseButirKisi('teks'), [])
assert.deepEqual(parseButirKisi(acak).map(x => x.level), ['C1', 'C1', 'C3', 'C4', 'C6'])

// Teks turunan terbaca pola parseKisi lama: baris materi lalu poin "-"
const teks = teksDariButir(acak)
assert.ok(teks.includes('A\n- [C1] Siswa dapat menyebutkan i'))
assert.equal(indikatorLengkap(acak[1]), 'Siswa dapat menyebutkan i')

// Komposisi: C1-C3 mayoritas pada contoh ini
const k = komposisiButir(acak)
assert.equal(k.total, 5)
assert.equal(k.rendah, 60)
assert.equal(k.tengah, 20)
assert.equal(k.tinggi, 20)

console.log('kisi-bloom: semua tes lulus')
