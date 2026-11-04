// Uji logika murni Data Guru (guruCore.ts) — penyesuaian meeting 4 Nov 2026.
// Jalankan: node --experimental-strip-types tests/guru.mjs
import assert from 'node:assert/strict'
import {
  PENDIDIKAN_OPSI, jenisNomorDari, labelAsalInstitusi, nomorAktif, normalisasiPendidikan
} from '../app/composables/guruCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

cek('opsi pendidikan baku = 5 tingkat sesuai meeting', () => {
  assert.deepEqual([...PENDIDIKAN_OPSI], ['SMK/SMA Sederajat', 'Diploma', 'Sarjana', 'Magister', 'Doktor'])
})

cek('normalisasi pendidikan bebas -> opsi baku', () => {
  assert.equal(normalisasiPendidikan('S1 Pendidikan'), 'Sarjana')
  assert.equal(normalisasiPendidikan('S2 Manajemen Pendidikan'), 'Magister')
  assert.equal(normalisasiPendidikan('S3'), 'Doktor')
  assert.equal(normalisasiPendidikan('D3 Akuntansi'), 'Diploma')
  assert.equal(normalisasiPendidikan('D4 Teknik Informatika'), 'Diploma')
  assert.equal(normalisasiPendidikan('SMK'), 'SMK/SMA Sederajat')
  assert.equal(normalisasiPendidikan('SMA Negeri'), 'SMK/SMA Sederajat')
  assert.equal(normalisasiPendidikan('Sarjana'), 'Sarjana')
  assert.equal(normalisasiPendidikan(''), '')
  assert.equal(normalisasiPendidikan('Kursus Bahasa'), '')
})

cek('label asal institusi mengikuti jenjang pendidikan', () => {
  assert.equal(labelAsalInstitusi('SMK/SMA Sederajat'), 'Asal Sekolah')
  assert.equal(labelAsalInstitusi('Sarjana'), 'Asal Kampus / Perguruan Tinggi')
  assert.equal(labelAsalInstitusi('Diploma'), 'Asal Kampus / Perguruan Tinggi')
  assert.equal(labelAsalInstitusi(''), 'Asal Sekolah')
})

cek('jenis nomor: kolom menang, warisan diturunkan dari isi', () => {
  assert.equal(jenisNomorDari('NUPTK', '123', ''), 'NUPTK')
  assert.equal(jenisNomorDari('', '', '9998887776665554'), 'NUPTK')
  assert.equal(jenisNomorDari('', '198501012010011001', ''), 'NIP')
  assert.equal(jenisNomorDari('', '198501012010011001', '9998887776665554'), 'NIP')
  assert.equal(jenisNomorDari(null, '', ''), 'NIP')
})

cek('nomor aktif mengikuti jenisnya', () => {
  assert.equal(nomorAktif('NUPTK', '111', '222'), '222')
  assert.equal(nomorAktif('NIP', '111', '222'), '111')
  assert.equal(nomorAktif('NUPTK', '111', ''), '')
})

console.log(`\n${lulus} uji lulus`)
