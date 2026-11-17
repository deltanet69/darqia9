// Uji logika admin Perpustakaan Digital — jalankan: node --experimental-strip-types tests/perpus-admin.mjs
import assert from 'node:assert/strict'
import { bacaKatalog, jumlahMentah } from '../app/composables/perpusCore.ts'
import { SARING_AWAL, barisEkspor, ringkasan, saringUrut } from '../app/composables/perpusAdminCore.ts'

const b = (o) => ({ id: 'x', judul: 'X', pengarang: '', penerbit: '', jenjang: ['SMK'], kelas: 'Kelas X', mapel: 'Informatika', jenis: 'Buku teks', kurikulum: 'Merdeka', statusLegal: 'Boleh', aksesBaca: 'Setiap hari', akhirPekan: false, slugFile: '', pathPdf: '', aktif: true, berkasAda: true, dibaca: 0, pembaca: 0, terakhir: null, ...o })
const data = [
  b({ id: 'a', judul: 'Jaringan Komputer', dibaca: 5, pembaca: 3, terakhir: '2026-11-10T00:00:00Z', slugFile: 'jar' }),
  b({ id: 'b', judul: 'Matematika Dasar', mapel: 'Matematika', jenjang: ['SMP', 'SMK'], dibaca: 9, pembaca: 2, terakhir: '2026-11-15T00:00:00Z', berkasAda: false }),
  b({ id: 'c', judul: 'Komik Sains', mapel: 'Manga Komik', jenis: 'Komik', akhirPekan: true, aktif: false, aksesBaca: '', pengarang: 'Tim', penerbit: 'Pen' })
]
let lulus = 0
const cek = (n, f) => { f(); lulus++; console.log('ok -', n) }

cek('urut populer, judul, terbaru', () => {
  assert.deepEqual(saringUrut(data, SARING_AWAL, 'populer').map(x => x.id), ['b', 'a', 'c'])
  assert.deepEqual(saringUrut(data, SARING_AWAL, 'judul').map(x => x.id), ['a', 'c', 'b'])
  assert.deepEqual(saringUrut(data, SARING_AWAL, 'terbaru').map(x => x.id), ['b', 'a', 'c'])
})

cek('saring: pencarian, jenjang, berkas, status, akses', () => {
  const f = (o) => saringUrut(data, { ...SARING_AWAL, ...o }, 'judul').map(x => x.id)
  assert.deepEqual(f({ q: 'jaringan' }), ['a'])
  assert.deepEqual(f({ q: 'JAR' }), ['a']) // slug ikut dicari
  assert.deepEqual(f({ jenjang: 'SMP' }), ['b'])
  assert.deepEqual(f({ berkas: 'belum' }), ['b'])
  assert.deepEqual(f({ status: 'nonaktif' }), ['c'])
  assert.deepEqual(f({ akses: 'akhirpekan' }), ['c'])
  assert.deepEqual(f({ mapel: 'Matematika', status: 'aktif' }), ['b'])
  assert.deepEqual(f({ q: 'tidak ada' }), [])
})

cek('ringkasan', () => {
  assert.deepEqual(ringkasan(data), { total: 3, aktif: 2, berkasAda: 2, dibaca: 14, belumPernah: 0 })
})

cek('ekspor bisa diimpor kembali tanpa kehilangan jenjang, kelas, akses akhir pekan', () => {
  const kembali = bacaKatalog(barisEkspor(data))
  assert.equal(kembali.length, 3)
  const komik = kembali.find(r => r.judul === 'Komik Sains')
  assert.equal(komik.akhir_pekan, true)
  assert.equal(komik.pengarang, 'Tim')
  assert.equal(komik.penerbit, 'Pen')
  assert.deepEqual(kembali.find(r => r.id === 'b').jenjang, ['SMP', 'SMK'])
  assert.deepEqual(kembali.find(r => r.id === 'jar').tingkat_kelas, [10])
})

cek('jumlah baris mentah: larik dan objek per sheet', () => {
  assert.equal(jumlahMentah([1, 2, 3]), 3)
  assert.equal(jumlahMentah({ A: [1, 2], B: [3], C: 'x' }), 3)
  assert.equal(jumlahMentah(null), 0)
})

console.log(`\n${lulus} kelompok uji lulus`)
