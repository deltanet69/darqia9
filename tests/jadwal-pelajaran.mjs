// Tes logika murni Jadwal Pelajaran (composable useJadwalPelajaran).
// Jalankan: node --experimental-strip-types tests/jadwal-pelajaran.mjs
import assert from 'node:assert/strict'
import {
  setelanBawaan, bangunSlotJam, waktuDariJamKe, jamKeDariWaktu,
  rentangTumpangTindih, cariBentrok, tingkatDariNamaKelas,
  jamBerlangsung, hitungKejadian, warnaMapel
} from '../app/composables/useJadwalPelajaran.ts'

let lolos = 0
const cek = (nama, fn) => { fn(); lolos++; console.log(`  ok - ${nama}`) }

const slots = bangunSlotJam(setelanBawaan())

cek('bangunSlotJam: pola bawaan 8 jam + 2 istirahat tersusun benar', () => {
  assert.equal(slots.length, 10)
  assert.deepEqual(slots[0], { jenis: 'jam', ke: 1, mulai: '07:00', selesai: '07:45' })
  assert.deepEqual(slots[4], { jenis: 'istirahat', label: 'Istirahat', mulai: '10:00', selesai: '10:20' })
  assert.deepEqual(slots[7], { jenis: 'istirahat', label: 'Istirahat & Shalat', mulai: '11:50', selesai: '12:30' })
  assert.deepEqual(slots[9], { jenis: 'jam', ke: 8, mulai: '13:15', selesai: '14:00' })
})

cek('bangunSlotJam: setelan khusus (mulai 06:30, 40 menit, tanpa istirahat kedua)', () => {
  const kustom = bangunSlotJam({ mulai: '06:30', durasiJP: 40, jumlahJam: 6, istirahat: [{ setelah: 3, durasi: 15, label: 'Istirahat' }] })
  assert.equal(kustom.length, 7)
  assert.equal(kustom[0].mulai, '06:30')
  assert.equal(kustom[3].jenis, 'istirahat')
  assert.equal(kustom[3].mulai, '08:30')
  assert.equal(kustom[6].selesai, '10:45')
})

cek('waktuDariJamKe <-> jamKeDariWaktu konsisten (round-trip)', () => {
  assert.deepEqual(waktuDariJamKe(slots, 1, 2), { startsAt: '07:00', endsAt: '08:30' })
  assert.deepEqual(waktuDariJamKe(slots, 3, 4), { startsAt: '08:30', endsAt: '10:00' })
  assert.deepEqual(jamKeDariWaktu(slots, '07:00', '08:30'), { mulaiKe: 1, selesaiKe: 2 })
  assert.deepEqual(jamKeDariWaktu(slots, '08:30:00', '10:00:00'), { mulaiKe: 3, selesaiKe: 4 })
  assert.equal(jamKeDariWaktu(slots, '07:10', '08:30'), null) // di luar pola -> ditandai null
  assert.equal(waktuDariJamKe(slots, 1, 99), null)
})

cek('rentangTumpangTindih: bersebelahan tidak dianggap bentrok', () => {
  assert.equal(rentangTumpangTindih('07:00', '08:30', '08:30', '10:00'), false)
  assert.equal(rentangTumpangTindih('07:00', '08:30', '08:00', '09:00'), true)
  assert.equal(rentangTumpangTindih('07:00', '08:30', '10:00', '11:00'), false)
})

const daftarContoh = [
  { id: 'a', classId: 'k1', subjectId: 'm1', teacherId: 'g1', day: 1, startsAt: '07:00', endsAt: '08:30', room: 'Lab TKJ 1', notes: '', mulaiKe: 1, selesaiKe: 2 },
  { id: 'b', classId: 'k2', subjectId: 'm2', teacherId: 'g2', day: 1, startsAt: '08:30', endsAt: '10:00', room: 'R. 2.4', notes: '', mulaiKe: 3, selesaiKe: 4 }
]

cek('cariBentrok: guru sama + jam tumpang tindih terdeteksi lintas kelas', () => {
  const hasil = cariBentrok(daftarContoh, { classId: 'k3', teacherId: 'g1', day: 1, startsAt: '08:00', endsAt: '09:00', room: '' })
  assert.equal(hasil.guru?.id, 'a')
  assert.equal(hasil.kelas, null)
})

cek('cariBentrok: kelas sama terdeteksi; hari berbeda aman', () => {
  const kelas = cariBentrok(daftarContoh, { classId: 'k1', teacherId: 'g9', day: 1, startsAt: '07:30', endsAt: '08:00', room: '' })
  assert.equal(kelas.kelas?.id, 'a')
  const aman = cariBentrok(daftarContoh, { classId: 'k1', teacherId: 'g1', day: 2, startsAt: '07:00', endsAt: '08:30', room: 'Lab TKJ 1' })
  assert.deepEqual(aman, { guru: null, kelas: null, ruangan: null })
})

cek('cariBentrok: ruangan sama lintas kelas terdeteksi; abaikanId mengecualikan diri sendiri', () => {
  const ruang = cariBentrok(daftarContoh, { classId: 'k3', teacherId: 'g9', day: 1, startsAt: '07:15', endsAt: '08:00', room: 'lab tkj 1' })
  assert.equal(ruang.ruangan?.id, 'a')
  const sendiri = cariBentrok(daftarContoh, { classId: 'k1', teacherId: 'g1', day: 1, startsAt: '07:00', endsAt: '08:30', room: 'Lab TKJ 1' }, 'a')
  assert.deepEqual(sendiri, { guru: null, kelas: null, ruangan: null })
})

cek('tingkatDariNamaKelas: awalan romawi dibaca tepat (XII sebelum XI sebelum X)', () => {
  assert.equal(tingkatDariNamaKelas('X TKJ 1'), 'X')
  assert.equal(tingkatDariNamaKelas('XI AKL 1'), 'XI')
  assert.equal(tingkatDariNamaKelas('XII TKR 2'), 'XII')
  assert.equal(tingkatDariNamaKelas('VII A'), 'VII')
  assert.equal(tingkatDariNamaKelas('VIII B'), 'VIII')
  assert.equal(tingkatDariNamaKelas('IX A'), 'IX')
  assert.equal(tingkatDariNamaKelas('Kelas Khusus'), '')
})

cek('jamBerlangsung: pukul di dalam jam pelajaran, istirahat, dan di luar jam', () => {
  assert.equal(jamBerlangsung(slots, '09:12')?.ke, 3)
  assert.equal(jamBerlangsung(slots, '07:00')?.ke, 1)
  assert.equal(jamBerlangsung(slots, '10:05')?.jenis, 'istirahat')
  assert.equal(jamBerlangsung(slots, '14:00'), null)
  assert.equal(jamBerlangsung(slots, '06:30'), null)
})

cek('hitungKejadian: jumlah Senin dalam rentang (Okt 2026: 5, 12, 19, 26)', () => {
  assert.equal(hitungKejadian(1, '2026-10-01', '2026-10-31'), 4)
  assert.equal(hitungKejadian(1, '2026-10-05', '2026-10-05'), 1) // 5 Okt 2026 = Senin
  assert.equal(hitungKejadian(2, '2026-10-05', '2026-10-05'), 0)
  assert.equal(hitungKejadian(5, '2026-10-30', '2026-10-30'), 1) // 30 Okt 2026 = Jumat
  assert.equal(hitungKejadian(1, '2026-10-31', '2026-10-01'), 0) // rentang terbalik
})

cek('warnaMapel: stabil untuk nama yang sama', () => {
  assert.equal(warnaMapel('Matematika'), warnaMapel('Matematika'))
  assert.notEqual(warnaMapel('Matematika'), '')
})

console.log(`\n${lolos} kelompok tes lolos`)
