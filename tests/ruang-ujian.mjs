// Tes fungsi murni Ruang Ujian — jalankan: node tests/ruang-ujian.mjs
import assert from 'node:assert'
import {
  periodeOpsi, persenProgres, labelStatus, labelPelanggaran, validasiRuang,
  barisSiswa, ringkasProgres, komposisiKelas, kelasTanpaBank, bentrokJadwal,
  cekJadwalMassal, durasiBaris, tanggalIsian, jamIsian
} from '../app/composables/ruangUjianCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }
const row = (o) => ({ student_id: 's1', student_name: 'A', nis: '1', class_name: 'X AK', exam_id: 'e1', exam_name: 'PAS', subject_name: 'MTK', assignment_id: 'a1', status: 'belum_mulai', answered: 0, total: 10, violations: 0, token: null, ...o })

cek('periodeOpsi: tahun aktif dulu, arsip lama menyusul tanpa duplikat', () => {
  const opsi = periodeOpsi('2026/2027', ['PAS Genap 2025/2026', 'PTS Ganjil 2026/2027', 'PTS Ganjil 2025/2026'])
  assert.equal(opsi[0], 'PTS Ganjil 2026/2027')
  assert.equal(opsi.length, 6)
  assert.deepEqual(opsi.slice(4), ['PTS Ganjil 2025/2026', 'PAS Genap 2025/2026'])
})

cek('persenProgres aman untuk total 0 dan tidak melebihi 100', () => {
  assert.equal(persenProgres(5, 0), 0)
  assert.equal(persenProgres(5, 10), 50)
  assert.equal(persenProgres(12, 10), 100)
})

cek('label status dan pelanggaran', () => {
  assert.equal(labelStatus('terkunci'), 'Terkunci')
  assert.equal(labelStatus('apa-saja'), 'Belum mulai')
  assert.equal(labelPelanggaran('multi_screen'), 'Banyak layar')
  assert.equal(labelPelanggaran('baru'), 'Pelanggaran lain')
})

cek('validasiRuang menolak nama kosong dan kapasitas di luar 1-60', () => {
  assert.ok(validasiRuang({ name: ' ', capacity: 30 }))
  assert.ok(validasiRuang({ name: 'R1', capacity: 0 }))
  assert.ok(validasiRuang({ name: 'R1', capacity: 61 }))
  assert.ok(validasiRuang({ name: 'R1', capacity: 30.5 }))
  assert.equal(validasiRuang({ name: 'R1', capacity: 30 }), null)
})

cek('barisSiswa: filter ujian, siswa tanpa ujian itu tetap tampil belum mulai', () => {
  const rows = [
    row({ student_id: 's1', exam_id: 'e1', status: 'selesai', answered: 10 }),
    row({ student_id: 's2', exam_id: 'e2', class_name: 'X AP' }),
    row({ student_id: 's3', exam_id: null, exam_name: null })
  ]
  const baris = barisSiswa(rows, ['e1'])
  assert.equal(baris.length, 3)
  assert.equal(baris.find(r => r.student_id === 's1').status, 'selesai')
  assert.equal(baris.find(r => r.student_id === 's2').exam_id, null)
  assert.equal(barisSiswa(rows, null).length, 3)
  assert.equal(barisSiswa(rows, ['e1', 'e2']).find(r => r.student_id === 's2').exam_id, 'e2')
})

cek('ringkasProgres menghitung status, pelanggaran, dan rata-rata', () => {
  const baris = [
    row({ student_id: 's1', status: 'selesai', answered: 10, violations: 1 }),
    row({ student_id: 's2', status: 'berlangsung', answered: 5 }),
    row({ student_id: 's3', status: 'terkunci', violations: 2 }),
    row({ student_id: 's4', exam_id: null })
  ]
  const r = ringkasProgres(baris)
  assert.deepEqual([r.siswa, r.selesai, r.mengerjakan, r.terkunci, r.belumMulai, r.pelanggaran], [4, 1, 1, 1, 1, 3])
  assert.equal(r.rataProgres, 50)
  assert.equal(ringkasProgres([]).rataProgres, 0)
})

cek('komposisiKelas urut jumlah terbanyak', () => {
  assert.deepEqual(komposisiKelas(['X AK', 'X AP', 'X AK', null]), [
    { kelas: 'X AK', jumlah: 2 }, { kelas: 'Tanpa kelas', jumlah: 1 }, { kelas: 'X AP', jumlah: 1 }
  ])
})

cek('kelasTanpaBank menemukan kelas yang belum punya bank mapel', () => {
  const banks = [{ classId: 'c1', subjectId: 'm1' }, { classId: 'c2', subjectId: 'm2' }]
  assert.deepEqual(kelasTanpaBank(['c1', 'c2'], 'm1', banks), ['c2'])
  assert.deepEqual(kelasTanpaBank(['c1'], 'm1', banks), [])
})

cek('bentrokJadwal: irisan jam dengan mapel/jam/durasi berbeda ditolak, sesi identik boleh', () => {
  const ada = [{ subjectId: 'm1', startsAt: '2026-12-01T08:00:00Z', duration: 90 }]
  assert.equal(bentrokJadwal(ada, { subjectId: 'm1', startsAt: '2026-12-01T08:00:00Z', duration: 90 }), null)
  assert.ok(bentrokJadwal(ada, { subjectId: 'm2', startsAt: '2026-12-01T08:00:00Z', duration: 90 }))
  assert.ok(bentrokJadwal(ada, { subjectId: 'm1', startsAt: '2026-12-01T09:00:00Z', duration: 90 }))
  assert.ok(bentrokJadwal(ada, { subjectId: 'm1', startsAt: '2026-12-01T08:00:00Z', duration: 60 }))
  assert.equal(bentrokJadwal(ada, { subjectId: 'm2', startsAt: '2026-12-01T09:30:00Z', duration: 90 }), null)
  assert.equal(bentrokJadwal([], { subjectId: 'm2', startsAt: '2026-12-01T09:30:00Z', duration: 90 }), null)
})

const b = (o) => ({ tanggal: '2026-12-07', mulai: '07:30', selesai: '09:00', subjectId: 'm1', supervisorId: '', ...o })

cek('cekJadwalMassal: isian wajib, jam selesai setelah mulai', () => {
  assert.deepEqual(cekJadwalMassal([b({ tanggal: '' }), b({ tanggal: '2026-12-08', subjectId: '' }), b({ tanggal: '2026-12-09', selesai: '07:00' })], []),
    ['Tanggal wajib diisi.', 'Pilih mata pelajaran.', 'Jam selesai harus setelah jam mulai.'])
  assert.equal(durasiBaris(b({})), 90)
})

cek('cekJadwalMassal: baris beririsan ditolak, berurutan & beda hari boleh', () => {
  const hasil = cekJadwalMassal([b({}), b({ mulai: '08:30', selesai: '10:00', subjectId: 'm2' }), b({ mulai: '10:00', selesai: '11:30', subjectId: 'm3' }), b({ tanggal: '2026-12-08' })], [])
  assert.match(hasil[0], /baris 2/)
  assert.match(hasil[1], /baris 1/)
  assert.equal(hasil[2], '')
  assert.equal(hasil[3], '')
})

cek('cekJadwalMassal: bentrok dengan jadwal ruang yang ada, jadwal identik boleh', () => {
  const ada = [{ subjectId: 'm1', startsAt: '2026-12-07T07:30', duration: 90 }]
  assert.deepEqual(cekJadwalMassal([b({})], ada), [''])
  assert.match(cekJadwalMassal([b({ mulai: '08:00', selesai: '09:00', subjectId: 'm2' })], ada)[0], /sudah ada di ruang/)
})

cek('isian Excel: tanggal & jam dari teks maupun angka Excel', () => {
  assert.equal(tanggalIsian('7-12-2026'), '2026-12-07')
  assert.equal(tanggalIsian('07/12/2026'), '2026-12-07')
  assert.equal(tanggalIsian('2026-12-07'), '2026-12-07')
  assert.equal(tanggalIsian(46363), '2026-12-07')
  assert.equal(tanggalIsian('besok'), '')
  assert.equal(jamIsian('7.30'), '07:30')
  assert.equal(jamIsian('07:30'), '07:30')
  assert.equal(jamIsian(0.3125), '07:30')
  assert.equal(jamIsian('25:00'), '')
})

console.log(`\n${lulus} tes lulus`)
