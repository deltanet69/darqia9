import assert from 'node:assert/strict'
import { kunciSemester, rekapNilai, statusNilai, tugasTerpakai } from '../app/utils/cbtNilai.ts'

assert.equal(kunciSemester('2026-07-01T08:00:00'), '2026-1')
assert.equal(kunciSemester('2026-12-31T08:00:00'), '2026-1')
assert.equal(kunciSemester('2027-01-05T08:00:00'), '2026-2', 'Januari = semester 2 tahun ajaran sebelumnya')
assert.equal(kunciSemester('2027-06-30T08:00:00'), '2026-2')

const ujian = [
  { id: 'a', name: 'UH 1', classId: 'k', subjectId: 'm', startsAt: '2026-09-01T08:00:00', tugasKe: 1 },
  { id: 'b', name: 'UH 2', classId: 'k', subjectId: 'm', startsAt: '2027-02-01T08:00:00', tugasKe: 2 },
  { id: 'c', name: 'Mapel lain', classId: 'k', subjectId: 'x', startsAt: '2026-09-01T08:00:00', tugasKe: 3 },
  { id: 'd', name: 'Tanpa tugas', classId: 'k', subjectId: 'm', startsAt: '2026-09-01T08:00:00', tugasKe: null }
]
assert.deepEqual([...tugasTerpakai(ujian, { classId: 'k', subjectId: 'm', startsAt: '2026-10-01T08:00' })], [[1, 'UH 1']], 'hanya kelas+mapel+semester sama')
assert.equal(tugasTerpakai(ujian, { id: 'a', classId: 'k', subjectId: 'm', startsAt: '2026-10-01T08:00' }).size, 0, 'ujian yang sedang diubah tidak bentrok dengan dirinya')

const selesai = (nilai, menunggu = 0) => ({ status: 'selesai', menunggu, nilai })
assert.equal(statusNilai(selesai(75), 75, false), 'Tuntas', 'nilai = KKM tuntas')
assert.equal(statusNilai(selesai(74.9), 75, false), 'Remedial')
assert.equal(statusNilai(selesai(90, 1), 75, true), 'Perlu Koreksi', 'esai belum dikoreksi menahan status')
assert.equal(statusNilai({ status: 'berlangsung', menunggu: 0, nilai: null }, 75, false), 'Belum Selesai')
assert.equal(statusNilai({ status: 'belum_mulai', menunggu: 0, nilai: null }, 75, false), 'Belum Selesai')
assert.equal(statusNilai({ status: 'belum_mulai', menunggu: 0, nilai: null }, 75, true), 'Tidak Ikut')

assert.deepEqual(rekapNilai([
  { status: 'Tuntas', nilai: 80 },
  { status: 'Remedial', nilai: 60 },
  { status: 'Tuntas', nilai: 95 },
  { status: 'Perlu Koreksi', nilai: 50 },
  { status: 'Belum Selesai', nilai: null }
]), { peserta: 5, dinilai: 3, tuntas: 2, perluKoreksi: 1, rata: 78.3 }, 'rata-rata hanya dari nilai final')
assert.equal(rekapNilai([]).rata, null)
console.log('ok nilai siswa')
