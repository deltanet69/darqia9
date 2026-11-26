// Tes rekomendasi bab Perpus: topik kisi-kisi dicocokkan ke bab + subbab dari indeks perpus_bab.
// Jalankan: node tests/perpus-bab.mjs
import assert from 'node:assert/strict'
import { cocokkanBab } from '../app/composables/perpusCore.ts'

const buku = [
  { id: 'mtk-x', judul: 'Matematika untuk SMA/SMK Kelas X', mapel: 'Matematika' },
  { id: 'bind-x', judul: 'Bahasa Indonesia Kelas X', mapel: 'Bahasa Indonesia' }
]
const bab = [
  { bukuId: 'mtk-x', nomor: 1, judul: 'Eksponen dan Logaritma', mulai: 4, selesai: 38, subbab: ['Sifat-sifat bilangan berpangkat', 'Pangkat pecahan dan bentuk akar', 'Definisi logaritma'] },
  { bukuId: 'mtk-x', nomor: 3, judul: 'Sistem Persamaan Linear', mulai: 88, selesai: 121, subbab: ['Model matematika SPLTV', 'Metode eliminasi substitusi'] },
  { bukuId: 'bind-x', nomor: 1, judul: 'Laporan Hasil Observasi', mulai: 4, selesai: 32, subbab: ['Struktur teks observasi'] },
  { bukuId: 'buku-lain', nomor: 1, judul: 'Eksponen', mulai: 1, selesai: 20, subbab: ['Bilangan berpangkat'] } // bukan buku siswa: diabaikan
]

// Topik eksponen -> Bab 1 buku Matematika, lengkap dengan subbabnya
const r1 = cocokkanBab({ t: 'Eksponen dan Sifat-sifatnya', i: 'Siswa dapat menyebutkan sifat-sifat bilangan berpangkat' }, 'Matematika', buku, bab)
assert.ok(r1)
assert.equal(r1.bukuId, 'mtk-x')
assert.equal(r1.nomor, 1)
assert.equal(r1.mulai, 4)
assert.ok(r1.subbab.some(s => s.includes('berpangkat')))
assert.ok(r1.skor >= 45)

// Topik SPLTV -> Bab 3, bukan Bab 1
const r2 = cocokkanBab({ t: 'Sistem Persamaan Linear Tiga Variabel', i: 'Siswa dapat menyelesaikan masalah dengan metode eliminasi substitusi' }, 'Matematika', buku, bab)
assert.ok(r2)
assert.equal(r2.nomor, 3)

// Topik tanpa padanan bab -> null (jujur, tidak mengarang)
assert.equal(cocokkanBab({ t: 'Trigonometri Lanjut', i: 'Siswa dapat membuktikan identitas trigonometri' }, 'Matematika', buku, bab), null)
// Indeks bab kosong -> null
assert.equal(cocokkanBab({ t: 'Eksponen', i: 'bilangan berpangkat' }, 'Matematika', buku, []), null)

console.log('perpus-bab: semua tes lulus')
