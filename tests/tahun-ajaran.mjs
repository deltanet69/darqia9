// Uji logika murni Tahun Ajaran (tahunAjaranCore.ts) — meeting 4 Nov 2026 butir 5.
// Jalankan: node --experimental-strip-types tests/tahun-ajaran.mjs
import assert from 'node:assert/strict'
import {
  TAHUN_AJARAN_BAWAAN, daftarTahunUnik, pastikanPilihan, tahunAjaranSah, tahunBawaan
} from '../app/composables/tahunAjaranCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

cek('format tahun sah hanya TTTT/TTTT berurutan', () => {
  assert.equal(tahunAjaranSah('2026/2027'), true)
  assert.equal(tahunAjaranSah('2027/2028'), true)
  assert.equal(tahunAjaranSah('2026/2028'), false)
  assert.equal(tahunAjaranSah('2026-2027'), false)
  assert.equal(tahunAjaranSah('26/27'), false)
  assert.equal(tahunAjaranSah(''), false)
  assert.equal(tahunAjaranSah(null), false)
  assert.equal(tahunAjaranSah(2026), false)
})

cek('daftar unik: buang duplikat & nilai rusak, urut terbaru dulu', () => {
  assert.deepEqual(
    daftarTahunUnik(['2026/2027', '2027/2028', '2026/2027', null, 'rusak', undefined, '2025/2026']),
    ['2027/2028', '2026/2027', '2025/2026']
  )
  assert.deepEqual(daftarTahunUnik([]), [])
  assert.deepEqual(daftarTahunUnik([null, 'x']), [])
})

cek('bawaan mengutamakan tahun berjalan existing', () => {
  assert.equal(TAHUN_AJARAN_BAWAAN, '2026/2027')
  assert.equal(tahunBawaan(['2027/2028', '2026/2027']), '2026/2027')
  assert.equal(tahunBawaan(['2027/2028', '2025/2026']), '2027/2028')
  assert.equal(tahunBawaan([]), '2026/2027')
})

cek('pilihan dijaga tetap anggota opsi existing', () => {
  assert.equal(pastikanPilihan(['2027/2028', '2026/2027'], '2027/2028'), '2027/2028')
  assert.equal(pastikanPilihan(['2027/2028'], '2026/2027'), '2027/2028')
  assert.equal(pastikanPilihan([], '2020/2021'), '2026/2027')
})

console.log(`\n${lulus} uji lulus`)
