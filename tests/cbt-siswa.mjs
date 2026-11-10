// Uji logika murni aplikasi CBT siswa — jalankan: node --experimental-strip-types tests/cbt-siswa.mjs
import assert from 'node:assert/strict'
import { bisaDibuka, hitungMundur, jamRentang, kelompokPerHari, keadaanUjian } from '../app/utils/cbtSiswaJadwal.ts'
import { buatPembatas } from '../server/utils/pembatas.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

// 14 Nov 2026 07.30 WIB = 00:30 UTC
const mulai = '2026-11-14T00:30:00.000Z'
const ujian = (o = {}) => ({ source: 'cbt', id: 'u1', jenis: 'akhir', mulai, durasi: 90, terkunci: false, nama: 'PAS', mapel: 'Matematika', statusUjian: 'terjadwal', statusSiswa: 'belum_mulai', dikumpulkan: null, ...o })
const ms = iso => new Date(iso).getTime()

cek('akhir: H-3 terkunci, H-2 terbuka (belum mulai), saat jam tiba dibuka', () => {
  assert.equal(keadaanUjian(ujian(), ms('2026-11-11T05:00:00Z')), 'terkunci') // 11 Nov 12.00 WIB = H-3
  assert.equal(keadaanUjian(ujian(), ms('2026-11-12T00:00:00Z')), 'belum') // 12 Nov 07.00 WIB = H-2
  assert.equal(keadaanUjian(ujian(), ms(mulai)), 'dibuka')
})
cek('harian tidak pernah terkunci H-2', () => {
  assert.equal(keadaanUjian(ujian({ jenis: 'harian' }), ms('2026-11-01T00:00:00Z')), 'belum')
})
cek('penanda terkunci dari server tidak menahan ujian yang jamnya sudah tiba (cache usang)', () => {
  assert.equal(keadaanUjian(ujian({ terkunci: true, nama: null }), ms('2026-11-14T00:31:00Z')), 'dibuka')
})
cek('selesai, akun terkunci, berjalan, dan lewat waktu', () => {
  assert.equal(keadaanUjian(ujian({ statusSiswa: 'selesai' }), ms(mulai)), 'selesai')
  assert.equal(keadaanUjian(ujian({ statusSiswa: 'terkunci' }), ms(mulai)), 'akun-terkunci')
  assert.equal(keadaanUjian(ujian({ statusSiswa: 'berlangsung' }), ms('2026-11-14T03:00:00Z')), 'berjalan')
  assert.equal(keadaanUjian(ujian(), ms('2026-11-14T02:00:00Z')), 'lewat')
})
cek('hanya dibuka/berjalan yang boleh dimasuki', () => {
  assert.equal(bisaDibuka('dibuka'), true); assert.equal(bisaDibuka('berjalan'), true)
  for (const k of ['terkunci', 'belum', 'selesai', 'akun-terkunci', 'lewat']) assert.equal(bisaDibuka(k), false)
})
cek('jam & rentang tampil dalam WIB', () => assert.equal(jamRentang(mulai, 90), '07.30 – 09.00'))
cek('kelompok per hari WIB berurutan', () => {
  const g = kelompokPerHari([ujian({ id: 'b', mulai: '2026-11-15T01:00:00Z' }), ujian({ id: 'a' }), ujian({ id: 'c', mulai: '2026-11-14T03:00:00Z' })])
  assert.deepEqual(g.map(x => x.ujian.map(u => u.id)), [['a', 'c'], ['b']])
})
cek('hitung mundur', () => {
  assert.equal(hitungMundur(mulai, ms('2026-11-12T00:30:00Z')), '2 hari 0 jam')
  assert.equal(hitungMundur(mulai, ms('2026-11-13T23:25:00Z')), '1 jam 05 menit')
  assert.equal(hitungMundur(mulai, ms('2026-11-14T00:25:28Z')), '04:32')
})
cek('pembatas: blokir setelah batas, reset setelah jendela, hapus saat berhasil', () => {
  let t = 0
  const p = buatPembatas(3, 1000, () => t)
  p.catat('a'); p.catat('a'); assert.equal(p.terblokir('a'), false)
  p.catat('a'); assert.equal(p.terblokir('a'), true); assert.equal(p.terblokir('b'), false)
  t = 1000; assert.equal(p.terblokir('a'), false)
  p.catat('a'); p.catat('a'); p.catat('a'); p.hapus('a'); assert.equal(p.terblokir('a'), false)
})
console.log(`\n${lulus} uji lulus`)
