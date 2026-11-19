import assert from 'node:assert/strict'
import { blokJadwal } from '../app/utils/cbtJadwalUjian.ts'

const baris = (hari, mulai, selesai, subject = 'mtk', kelas = 'x1') => ({ class_id: kelas, subject_id: subject, day_of_week: hari, starts_at: mulai + ':00', ends_at: selesai + ':00' })
const rows = [
  baris(3, '10:00', '10:40'),
  baris(1, '07:40', '08:20'),
  baris(1, '07:00', '07:40'),
  baris(1, '08:40', '09:20'), // setelah istirahat: blok baru
  baris(1, '07:00', '07:40', 'ipa'),
  baris(2, '07:00', '07:40', 'mtk', 'x2')
]
const blok = blokJadwal(rows, 'x1', 'mtk')
assert.deepEqual(blok, [
  { hari: 1, mulai: '07:00', selesai: '08:20', menit: 80 },
  { hari: 1, mulai: '08:40', selesai: '09:20', menit: 40 },
  { hari: 3, mulai: '10:00', selesai: '10:40', menit: 40 }
], 'jam bersambung digabung, mapel/kelas lain diabaikan')
console.log('ok jadwal ujian')
