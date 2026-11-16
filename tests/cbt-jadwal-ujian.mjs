import assert from 'node:assert/strict'
import { blokJadwal, slotMendatang, menitSlot } from '../app/utils/cbtJadwalUjian.ts'

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

// Minggu 15 Nov 2026 siang: slot pertama Senin 16 Nov 07.00.
const slot = slotMendatang(blok, new Date(2026, 10, 15, 12, 0), 14)
assert.deepEqual(slot.slice(0, 3).map(s => s.startsAt), ['2026-11-16T07:00', '2026-11-16T08:40', '2026-11-18T10:00'])
assert.equal(slot.length, 6, 'dua minggu = 3 blok x 2')
// Jam yang sudah lewat hari ini tidak ditawarkan.
assert.equal(slotMendatang(blok, new Date(2026, 10, 16, 8, 0), 1)[0].startsAt, '2026-11-16T08:40')

assert.equal(menitSlot(blok, '2026-11-16T07:00'), 80)
assert.equal(menitSlot(blok, '2026-11-16T07:40'), null, 'tengah blok bukan jam mulai')
assert.equal(menitSlot(blok, '2026-11-17T07:00'), null, 'Selasa tidak ada mapel ini')
assert.equal(menitSlot(blok, 'bukan tanggal'), null)
console.log('ok jadwal ujian')
