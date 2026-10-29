// Tes logika murni Jadwal Mengajar (registry jadwalV2Data).
// Jalankan: node --experimental-strip-types tests/jadwal-mengajar.mjs
import assert from 'node:assert/strict'
import {
  stateV2, terapkanJenjang, slotMin, fmtMin, diHariIni, tanggalDariDi,
  statusGuruMurni, guruStatus, genGrid, lessonsOf, rosterOf, kunciSesi
} from '../app/components/adminV2/jadwal-mengajar/jadwalV2Data.ts'

let lolos = 0
const cek = (nama, fn) => { fn(); lolos++; console.log(`  ok - ${nama}`) }

cek('diHariIni: Senin=0, Jumat=4, akhir pekan=-1', () => {
  assert.equal(diHariIni(new Date(2026, 9, 26)), 0) // Senin 26 Okt 2026
  assert.equal(diHariIni(new Date(2026, 9, 30)), 4) // Jumat 30 Okt 2026
  assert.equal(diHariIni(new Date(2026, 9, 31)), -1) // Sabtu
  assert.equal(diHariIni(new Date(2026, 10, 1)), -1) // Minggu
})

cek('tanggalDariDi: tanggal Senin–Jumat pada minggu berjalan', () => {
  const rabu = new Date(2026, 9, 28)
  assert.equal(tanggalDariDi(0, rabu), '2026-10-26')
  assert.equal(tanggalDariDi(2, rabu), '2026-10-28')
  assert.equal(tanggalDariDi(4, rabu), '2026-10-30')
  assert.equal(tanggalDariDi(0, new Date(2026, 9, 30)), '2026-10-26')
})

const sesi = (status, startedAt = null) => ({ tanggal: '2026-10-28', status, startedAt, endedAt: null, hadir: null, alpa: [] })

cek('statusGuruMurni: selesai tepat waktu = Hadir; mulai >10 mnt = Terlambat', () => {
  const dasar = { adaJadwal: true, posisi: 'lalu', menitKini: 900, mulai: 510, selesai: 555 }
  assert.equal(statusGuruMurni({ ...dasar, sesi: sesi('selesai', '2026-10-28T08:31:00') }), 'Hadir')
  assert.equal(statusGuruMurni({ ...dasar, sesi: sesi('selesai', '2026-10-28T08:52:00') }), 'Terlambat')
  assert.equal(statusGuruMurni({ ...dasar, sesi: sesi('berlangsung', '2026-10-28T08:35:00') }), 'Berlangsung')
})

cek('statusGuruMurni: tanpa sesi — hari lalu & jam lewat = Tidak Hadir (bukan karangan Hadir)', () => {
  assert.equal(statusGuruMurni({ adaJadwal: true, sesi: null, posisi: 'lalu', menitKini: 900, mulai: 510, selesai: 555 }), 'Tidak Hadir')
  assert.equal(statusGuruMurni({ adaJadwal: true, sesi: null, posisi: 'ini', menitKini: 600, mulai: 510, selesai: 555 }), 'Tidak Hadir')
  assert.equal(statusGuruMurni({ adaJadwal: true, sesi: null, posisi: 'ini', menitKini: 500, mulai: 510, selesai: 555 }), 'Terjadwal')
  assert.equal(statusGuruMurni({ adaJadwal: true, sesi: null, posisi: 'depan', menitKini: 900, mulai: 510, selesai: 555 }), 'Terjadwal')
  assert.equal(statusGuruMurni({ adaJadwal: true, sesi: sesi('tidak_hadir'), posisi: 'ini', menitKini: 500, mulai: 510, selesai: 555 }), 'Tidak Hadir')
  assert.equal(statusGuruMurni({ adaJadwal: false, sesi: null, posisi: 'lalu', menitKini: 900, mulai: 510, selesai: 555 }), 'Terjadwal')
})

// --- Registry: pola bawaan 8 JP + satu pelajaran multi-JP + satu sesi terlambat ---
stateV2.polaSlot.smk = ['07:00–07:45', '07:45–08:30', '08:30–09:15', '09:15–10:00', '10:20–11:05', '11:05–11:50', '12:30–13:15', '13:15–14:00']
stateV2.pelajaran = [{
  id: 'jadwal-1', level: 'smk', kelas: 'X TKJ 1', room: 'Lab 1', di: 2, si: 2, siAkhir: 3,
  time: '08:30–09:15', mapel: 'Informatika', guru: 'naufal hamidy', classId: 'k1', subjectId: 'm1', teacherId: 'g1'
}]
stateV2.roster['smk|X TKJ 1'] = [{ name: 'Andi', gender: 'L', nis: '123' }]

cek('slotMin & fmtMin membaca pola jenjang aktif', () => {
  terapkanJenjang('smk')
  assert.deepEqual(slotMin(0), [420, 465])
  assert.deepEqual(slotMin(2), [510, 555])
  assert.equal(fmtMin(504), '08:24')
})

cek('genGrid: pelajaran 2 JP mengisi dua sel; sel lain kosong', () => {
  const g = genGrid('smk', 'X TKJ 1')
  assert.equal(g[2][2].mapel, 'Informatika')
  assert.equal(g[2][3].mapel, 'Informatika')
  assert.equal(g[2][4].mapel, '')
  assert.equal(g[0][2].mapel, '')
})

cek('guruStatus: sesi terlambat terbaca di kedua sel multi-JP; tanpa jadwal = Terjadwal', () => {
  const tgl = tanggalDariDi(2)
  stateV2.sesi[kunciSesi('jadwal-1', tgl)] = sesi('selesai', `${tgl}T08:52:00`)
  assert.equal(guruStatus('smk', 'X TKJ 1', 2, 2, 4, 900), 'Terlambat')
  assert.equal(guruStatus('smk', 'X TKJ 1', 2, 3, 4, 900), 'Terlambat')
  assert.equal(guruStatus('smk', 'X TKJ 1', 0, 0, 4, 900), 'Terjadwal')
})

cek('lessonsOf & rosterOf membaca registry', () => {
  assert.equal(lessonsOf('smk', 'naufal hamidy').length, 1)
  assert.equal(lessonsOf('smk', 'guru lain').length, 0)
  assert.equal(rosterOf('smk', 'X TKJ 1')[0].nis, '123')
  assert.deepEqual(rosterOf('smk', 'Kelas Gaib'), [])
})

console.log(`\n${lolos} kelompok tes lolos`)
