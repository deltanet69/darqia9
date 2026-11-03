// Uji logika murni Perpustakaan Digital (perpusCore.ts) — jalankan:
//   node --experimental-strip-types tests/perpus.mjs
import assert from 'node:assert/strict'
import {
  cariBuku, daftarMapel, judulSub, judulUtama, jurusanDariKelas, progresBuku,
  salamWaktu, sudahMulai, tingkatDariKelas
} from '../app/composables/perpusCore.ts'
import { BUKU_CONTOH, SISWA_CONTOH } from '../app/composables/perpusContoh.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }
const inf10 = BUKU_CONTOH.find(b => b.id === 'inf10')

cek('katalog contoh: 10 buku (7 teks + 3 literasi), 23 bab', () => {
  assert.equal(BUKU_CONTOH.length, 10)
  assert.equal(BUKU_CONTOH.filter(b => b.lit).length, 3)
  assert.equal(BUKU_CONTOH.reduce((a, b) => a + b.bab.length, 0), 23)
  assert.equal(SISWA_CONTOH.length, 3)
})

cek('judul dipecah Mapel: Subjudul untuk sampul', () => {
  assert.equal(judulUtama(inf10), 'Informatika')
  assert.equal(judulSub(inf10), 'Jaringan Komputer Dasar')
})

cek('progres dari indeks bab terakhir: bab 2 dari 4 = 50%', () => {
  assert.equal(progresBuku(inf10, {}), 0)
  assert.equal(sudahMulai(inf10, {}), false)
  assert.equal(progresBuku(inf10, { inf10: 1 }), 50)
  assert.equal(progresBuku(inf10, { inf10: 3 }), 100)
  assert.equal(sudahMulai(inf10, { inf10: 0 }), true)
})

cek('tingkat dari nama kelas Data Induk (romawi & angka)', () => {
  assert.equal(tingkatDariKelas('XI TKJ 1', 'SMK'), 11)
  assert.equal(tingkatDariKelas('X AKL 1', 'SMK'), 10)
  assert.equal(tingkatDariKelas('XII TSM 2', 'SMK'), 12)
  assert.equal(tingkatDariKelas('VII. A', 'SMP'), 7)
  assert.equal(tingkatDariKelas('IX. B', 'SMP'), 9)
  assert.equal(tingkatDariKelas('10 RPL 1', 'SMK'), 10)
  assert.equal(tingkatDariKelas('', 'SMP'), 7)
  assert.equal(tingkatDariKelas('', 'SMK'), 10)
})

cek('jurusan dari nama kelas; rombel huruf SMP bukan jurusan', () => {
  assert.equal(jurusanDariKelas('XI TKJ 1'), 'TKJ')
  assert.equal(jurusanDariKelas('X AKL 1'), 'AKL')
  assert.equal(jurusanDariKelas('VII. A'), '')
  assert.equal(jurusanDariKelas('VIII. B'), '')
})

cek('pencarian & daftar mapel katalog', () => {
  assert.equal(cariBuku(BUKU_CONTOH, 'jaringan').length >= 1, true)
  assert.ok(cariBuku(BUKU_CONTOH, 'akuntansi').some(b => b.id === 'akl10'))
  assert.deepEqual(daftarMapel(BUKU_CONTOH), ['Informatika', 'Teknik Komputer & Jaringan', 'Matematika', 'Bahasa Indonesia', 'Akuntansi', 'Bahasa Inggris'])
})

cek('salam waktu Indonesia', () => {
  assert.equal(salamWaktu(8), 'Selamat pagi')
  assert.equal(salamWaktu(13), 'Selamat siang')
  assert.equal(salamWaktu(17), 'Selamat sore')
  assert.equal(salamWaktu(21), 'Selamat malam')
})

console.log(`\n${lulus} uji lulus`)
