// Uji parser impor Excel Kode Keuangan — jalankan: node --experimental-strip-types tests/keuangan-excel.mjs
import assert from 'node:assert/strict'
import { aoaMaster, aoaSiswa, parseKeuangan } from '../app/utils/keuanganExcel.ts'
import { hitungSiswa } from '../app/composables/keuanganCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }
const label = ['Kelas X', 'Kelas XI', 'Kelas XII', 'Tingkat Akhir']
const ctx = { grade: 'SMK', kodeAda: new Set(['R-2627']), nisInduk: new Set(['111', '222', '333']) }

cek('master: kode baru & diperbarui, nominal teks "7.625.000" dan angka', () => {
  const m = [['Kode', 'Nama'], ['R-2627', 'Reguler', 7625000, '5.300.000', 'Rp 5.300.000', '', 'Ya'], ['SSK-2728', 'SSK', 1, 2, 3, 4, 'Tidak']]
  const h = parseKeuangan(m, [], ctx).master
  assert.equal(h[0].status, 'siap'); assert.equal(h[0].baru, false)
  assert.deepEqual(h[0].data.nominal, [7625000, 5300000, 5300000, 0])
  assert.equal(h[1].baru, true); assert.equal(h[1].data.aktif, false)
})
cek('master: kode kosong, nama kosong, negatif, ganda ditolak/dilewati', () => {
  const m = [['Kode'], ['', 'x'], ['A1', ''], ['A2', 'n', -5], ['A3', 'n'], ['A3', 'n']]
  const h = parseKeuangan(m, [], ctx).master
  assert.deepEqual(h.map(r => r.status), ['gagal', 'gagal', 'gagal', 'siap', 'dilewati'])
})
cek('siswa: NIS tidak ada, kode tak dikenal, kode dari sheet master diterima, ganda, tanpa kode dilewati', () => {
  const m = [['Kode'], ['BARU', 'Paket Baru', 1, 1, 1, 1]]
  const s = [['NIS'], ['999', 'x', 'k', 'R-2627'], ['111', 'a', 'k', 'XYZ'], ['222', 'b', 'k', 'BARU', 100], ['222', 'b', 'k', 'R-2627'], ['333', 'c', 'k', '']]
  const h = parseKeuangan(m, s, ctx).siswa
  assert.deepEqual(h.map(r => r.status), ['gagal', 'gagal', 'siap', 'dilewati', 'dilewati'])
  assert.deepEqual(h[2].data.tambahan, [100, 0, 0, 0])
})
cek('baris nomor mengikuti nomor baris Excel (judul di baris 1 -> data mulai baris 2)', () => {
  const h = parseKeuangan([['Kode'], ['', 'x']], [], ctx).master
  assert.equal(h[0].baris, 2)
})
cek('template: judul + data siswa dengan kode saat ini', () => {
  const siswa = [{ nis: '111', nama: 'Ani', kelas: 'X AK', grade: 'SMK' }]
  const a = aoaSiswa(label, siswa, [{ nis: '111', grade: 'SMK', kode: 'R-2627', tambahan: [0, 0, 0, 0] }])
  assert.equal(a[0][0], 'NIS'); assert.equal(a[1][3], 'R-2627')
  assert.equal(aoaMaster(label, []).length, 1)
})
cek('hitung: item bertingkat menutup tingkat pilihan, bukan waterfall', () => {
  const paket = { kode: 'P', nama: 'P', grade: 'SMK', nominal: [1000, 2000, 3000, 0], aktif: true }
  const h = hitungSiswa(paket, [0, 0, 0, 0], [{ nis: '1', tingkat: 1, dibayar: 500, terarah: true }])
  assert.deepEqual(h.per.map(p => p.bayar), [0, 500, 0, 0])
  assert.equal(h.sisa, 5500)
})
cek('hitung: terarah + data lama (waterfall) digabung; kelebihan terarah jadi saldo', () => {
  const paket = { kode: 'P', nama: 'P', grade: 'SMK', nominal: [1000, 2000, 3000, 0], aktif: true }
  const h = hitungSiswa(paket, [0, 0, 0, 0], [
    { nis: '1', tingkat: 2, dibayar: 3000, terarah: true },
    { nis: '1', tingkat: null, dibayar: 1500, terarah: false }
  ])
  assert.deepEqual(h.per.map(p => p.bayar), [1000, 500, 3000, 0])
  const lebih = hitungSiswa(paket, [0, 0, 0, 0], [{ nis: '1', tingkat: 0, dibayar: 1500, terarah: true }])
  assert.equal(lebih.per[0].bayar, 1000 + 0); assert.equal(lebih.per[1].bayar, 500)
})
console.log(`\n${lulus} uji lulus`)
