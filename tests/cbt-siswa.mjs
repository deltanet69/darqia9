// Uji logika murni aplikasi CBT siswa — jalankan: node --experimental-strip-types tests/cbt-siswa.mjs
import assert from 'node:assert/strict'
import { bisaDibuka, hitungMundur, jamRentang, kelompokPerHari, keadaanUjian } from '../app/utils/cbtSiswaJadwal.ts'
import { acakPerSiswa } from '../app/utils/cbtAcak.ts'
import { skorKemiripan } from '../server/utils/cbtNilaiEsai.ts'
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
cek('harian dan PR tidak pernah terkunci H-2', () => {
  assert.equal(keadaanUjian(ujian({ jenis: 'harian' }), ms('2026-11-01T00:00:00Z')), 'belum')
  assert.equal(keadaanUjian(ujian({ jenis: 'pr' }), ms('2026-11-01T00:00:00Z')), 'belum')
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
cek('acak Esai nonaktif: Esai tetap berurutan, PG tetap diacak', () => {
  const soal = Array.from({ length: 12 }, (_, i) => ({ id: i, sec: i < 8 ? 'pg' : 'essay', options: i < 8 ? ['a', 'b', 'c', 'd'] : undefined }))
  for (const nis of ['n1', 'n2', 'n3']) assert.deepEqual(acakPerSiswa(soal, nis, ['pg', 'essay'], ['essay']).filter(q => q.sec === 'essay').map(q => q.id), [8, 9, 10, 11])
})
cek('acak per siswa: deterministik, beda antar siswa, bagian tetap berurutan, pilihan terpetakan ke indeks asli', () => {
  const soal = Array.from({ length: 12 }, (_, i) => ({ id: i, sec: i < 8 ? 'pg' : 'essay', options: i < 8 ? ['a', 'b', 'c', 'd'] : undefined }))
  const urut = ['pg', 'singkat', 'essay', 'interaktif']
  const a1 = acakPerSiswa(soal, 'nis1|cbt|u1', urut)
  assert.deepEqual(a1.map(q => q.id), acakPerSiswa(soal, 'nis1|cbt|u1', urut).map(q => q.id), 'siswa sama + ujian sama = urutan sama')
  assert.notDeepEqual(a1.map(q => q.id), acakPerSiswa(soal, 'nis2|cbt|u1', urut).map(q => q.id), 'siswa lain = urutan lain')
  assert.deepEqual(a1.map(q => q.sec), [...Array(8).fill('pg'), ...Array(4).fill('essay')], 'bagian PG tetap sebelum Essay')
  assert.deepEqual([...a1.map(q => q.id)].sort((x, y) => x - y), soal.map(q => q.id), 'tidak ada soal hilang/ganda')
  for (const q of a1.filter(x => x.options)) {
    assert.deepEqual([...q.optionOrder].sort(), [0, 1, 2, 3])
    assert.deepEqual(q.options, q.optionOrder.map(i => ['a', 'b', 'c', 'd'][i]), 'teks pilihan mengikuti indeks asli')
  }
  assert.ok(a1.filter(x => x.options).some(q => q.optionOrder.join() !== '0,1,2,3'), 'pilihan benar-benar teracak')
  assert.equal(a1.find(q => !q.options).optionOrder, undefined)
})
cek('nilai esai cadangan (tanpa AI): kosong = 0, sesuai rubrik = 1, sebagian = di antaranya', () => {
  const rubrik = 'Suku ke-40 = a + (n-1)b = 7 + 39(-2) = -71'
  assert.equal(skorKemiripan('', rubrik), 0)
  assert.equal(skorKemiripan(null, rubrik), 0)
  assert.equal(skorKemiripan('suku ke 40 = 7 + 39 x -2 = -71', rubrik), 1)
  const sebagian = skorKemiripan('suku 40', rubrik)
  assert.ok(sebagian > 0 && sebagian < 1)
  assert.equal(skorKemiripan('jawaban apa saja', ''), 0.5)
})
console.log(`\n${lulus} uji lulus`)
