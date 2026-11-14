// Tes fungsi murni Dashboard — jalankan: node --experimental-strip-types tests/dashboard.mjs
import assert from 'node:assert'
import {
  kelompokkanUjian, ujianMilikGuru, rekapAbsensi, teksPolos, rentangBulanWib, tanggalWib, hariJadwalWib, persen, teksPersen, jendelaMulai
} from '../app/composables/dashboardCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

const u = (o) => ({ id: 'x', name: 'PTS Ganjil', starts_at: '2026-11-20T01:00:00Z', status: 'terjadwal', jenis: 'tengah_semester', sumber: 'cbt',
  class_id: 'k1', subject_id: 'm1', supervisor_id: null, kelas: 'X TKJ 1', mapel: 'Matematika', ...o })

cek('ujian dikelompokkan ke Harian (LMS) / PTS / PAS, kelas digabung, jam WIB', () => {
  const h = kelompokkanUjian([
    u({ id: '1' }), u({ id: '2', class_id: 'k2', kelas: 'X TKJ 2' }),
    u({ id: '3', jenis: 'akhir', name: 'PAS Ganjil' }),
    u({ id: '4', sumber: 'lms', jenis: 'pr', name: 'PR Bab 1' }),
    u({ id: '5', status: 'selesai' })
  ])
  assert.equal(h.pts.length, 1)
  assert.deepEqual(h.pts[0], ['20', 'Nov', 'PTS Ganjil · Matematika', 'X TKJ 1, X TKJ 2 · 08.00 WIB', 'Terjadwal', 'on'])
  assert.equal(h.pas.length, 1)
  assert.equal(h.harian[0][3], 'X TKJ 1 · 08.00 WIB · PR')
})

cek('maksimal 3 baris per tab, urut paling dekat', () => {
  const daftar = [5, 2, 4, 1, 3].map(d => u({ id: String(d), name: `U${d}`, starts_at: `2026-11-0${d}T01:00:00Z` }))
  const h = kelompokkanUjian(daftar)
  assert.deepEqual(h.pts.map(r => r[0]), ['1', '2', '3'])
})

cek('ujian milik guru = ia pengawas atau kelas+mapel ada di jadwal mengajarnya', () => {
  const daftar = [u({ id: 'a' }), u({ id: 'b', class_id: 'k9' }), u({ id: 'c', class_id: 'k9', supervisor_id: 'g1' })]
  assert.deepEqual(ujianMilikGuru(daftar, 'g1', [{ class_id: 'k1', subject_id: 'm1' }]).map(x => x.id), ['a', 'c'])
})

cek('rekap absensi: hadir = tepat waktu + terlambat', () => {
  assert.deepEqual(rekapAbsensi(['tepat_waktu', 'terlambat', 'izin', 'alpa', 'tepat_waktu']),
    { hadir: 3, terlambat: 1, izin: 1, sakit: 0, alpa: 1, total: 5 })
  assert.equal(persen(3, 5), 60)
  assert.equal(persen(1, 0), 0)
  assert.equal(teksPersen(94.8), '94,8%')
})

cek('tanggal & hari mengikuti WIB, bukan zona perangkat', () => {
  const malam = new Date('2026-11-13T18:30:00Z') // 14 Nov 01.30 WIB (Sabtu)
  assert.equal(tanggalWib(malam), '2026-11-14')
  assert.equal(hariJadwalWib(malam), 6)
  assert.deepEqual(rentangBulanWib(new Date('2026-02-10T05:00:00Z')), { awal: '2026-02-01', akhir: '2026-02-28' })
})

cek('isi pengumuman HTML jadi teks pendek', () => {
  assert.equal(teksPolos('<p>Rapat <b>komite</b>&nbsp;sekolah</p>'), 'Rapat komite sekolah')
  assert.equal(teksPolos('a'.repeat(200)).length, 90)
})

cek('jendela Mulai Mengajar: 10 menit sebelum s.d. 10 menit sesudah jam mulai (WIB)', () => {
  const pada = (wib) => new Date(`2026-11-13T${wib}:00+07:00`)
  assert.equal(jendelaMulai('13:00', pada('12:49')).status, 'belum')
  assert.equal(jendelaMulai('13:00', pada('12:50')).status, 'buka')
  assert.equal(jendelaMulai('13:00', pada('13:10')).status, 'buka')
  assert.equal(jendelaMulai('13:00', pada('13:11')).status, 'lewat')
  assert.deepEqual(jendelaMulai('07:05', pada('06:00')), { status: 'belum', buka: '06.55', tutup: '07.15' })
})

console.log(`\n${lulus} tes lulus`)
