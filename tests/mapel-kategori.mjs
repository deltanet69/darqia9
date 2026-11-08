// Tes kategori Master Mapel — jalankan: node tests/mapel-kategori.mjs
import assert from 'node:assert'
import { KATEGORI_MAPEL, KATEGORI_PER_JENJANG, kategoriDariTeks, kategoriSahUntuk, warnaKategori } from '../app/composables/mapelKategori.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

cek('kategori resmi persis sesuai daftar owner', () => {
  assert.deepEqual([...KATEGORI_MAPEL], ['Muatan Nasional', 'Muatan Kewilayahan', 'Muatan Keunggulan', 'Muatan Peminatan Kejuruan', 'Kelompok Muatan Lokal'])
})

cek('kategoriDariTeks: nama resmi, alias spreadsheet, dan huruf besar/kecil', () => {
  assert.equal(kategoriDariTeks('Muatan Nasional'), 'Muatan Nasional')
  assert.equal(kategoriDariTeks('  muatan   KEWILAYAHAN '), 'Muatan Kewilayahan')
  assert.equal(kategoriDariTeks('Muatan Unggulan'), 'Muatan Keunggulan')
  assert.equal(kategoriDariTeks('MULOK'), 'Kelompok Muatan Lokal')
  assert.equal(kategoriDariTeks('Muatan Lokal'), 'Kelompok Muatan Lokal')
})

cek('kategoriDariTeks menolak kategori lama dan kosong', () => {
  for (const lama of ['Umum', 'Kejuruan', 'Keagamaan', '', null, undefined]) assert.equal(kategoriDariTeks(lama), null)
})

cek('kategoriSahUntuk: Keunggulan hanya SMP, Peminatan Kejuruan hanya SMK', () => {
  assert.equal(kategoriSahUntuk('SMP', 'Muatan Keunggulan'), true)
  assert.equal(kategoriSahUntuk('SMK', 'Muatan Keunggulan'), false)
  assert.equal(kategoriSahUntuk('SMK', 'Muatan Peminatan Kejuruan'), true)
  assert.equal(kategoriSahUntuk('SMP', 'Muatan Peminatan Kejuruan'), false)
  assert.equal(kategoriSahUntuk('SMP', null), false)
  assert.equal(KATEGORI_PER_JENJANG.SMP.length, 4)
  assert.equal(KATEGORI_PER_JENJANG.SMK.length, 4)
})

cek('warnaKategori: kategori lama tampil abu-abu', () => {
  assert.ok(warnaKategori('Umum').includes('F2F4F7'))
  assert.ok(warnaKategori('Muatan Nasional').includes('EFF4FF'))
})

console.log(`\n${lulus} tes lulus`)
