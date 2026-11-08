// Tes paginasi — jalankan: node tests/paginasi.mjs
import assert from 'node:assert'
import { jumlahHalaman, jepitHalaman, potongHalaman, daftarHalaman } from '../app/composables/paginasiCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

cek('jumlahHalaman minimal 1 dan membulat ke atas', () => {
  assert.equal(jumlahHalaman(0, 20), 1)
  assert.equal(jumlahHalaman(57, 20), 3)
  assert.equal(jumlahHalaman(60, 20), 3)
  assert.equal(jumlahHalaman(61, 20), 4)
})

cek('jepitHalaman menjaga halaman dalam rentang', () => {
  assert.equal(jepitHalaman(5, 57, 20), 3)
  assert.equal(jepitHalaman(0, 57, 20), 1)
  assert.equal(jepitHalaman(NaN, 57, 20), 1)
  assert.equal(jepitHalaman(2, 0, 20), 1)
})

cek('potongHalaman: halaman terakhir berisi sisa, halaman di luar rentang dijepit', () => {
  const data = Array.from({ length: 57 }, (_, i) => i + 1)
  assert.deepEqual(potongHalaman(data, 1, 20), data.slice(0, 20))
  assert.equal(potongHalaman(data, 3, 20).length, 17)
  assert.equal(potongHalaman(data, 9, 20).length, 17)
  assert.deepEqual(potongHalaman([], 1, 20), [])
})

cek('daftarHalaman: semua tampil bila <= 7, selebihnya diringkas dengan elipsis', () => {
  assert.deepEqual(daftarHalaman(1, 3), [1, 2, 3])
  assert.deepEqual(daftarHalaman(1, 10), [1, 2, 3, 4, '…', 10])
  assert.deepEqual(daftarHalaman(5, 10), [1, '…', 4, 5, 6, '…', 10])
  assert.deepEqual(daftarHalaman(10, 10), [1, '…', 7, 8, 9, 10])
})

console.log(`\n${lulus} tes lulus`)
