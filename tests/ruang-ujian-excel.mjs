// Tes export → import jadwal ruang (Excel) — jalankan: node tests/ruang-ujian-excel.mjs
import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import * as XLSX from 'xlsx'
import { eksporJadwalRuang, bacaJadwalRuang } from '../app/utils/cbtExcelJadwalRuang.ts'

const berkas = path.join(os.tmpdir(), `jadwal-ruang-${Date.now()}.xlsx`)
const jadwal = [
  { tanggal: '2026-12-07', mulai: '07:30', selesai: '09:00', mapel: 'Bahasa Indonesia', pengawas: 'Ahmad' },
  { tanggal: '2026-12-07', mulai: '09:30', selesai: '11:00', mapel: 'Matematika', pengawas: '' }
]
process.chdir(os.tmpdir())
await eksporJadwalRuang(path.basename(berkas), jadwal, ['Bahasa Indonesia', 'Matematika'], ['Ahmad'])
const baca = (buf, nama = 'jadwal.xlsx') => bacaJadwalRuang(new File([buf], nama))
assert.deepEqual(await baca(fs.readFileSync(berkas)), jadwal)
console.log('ok - export lalu import menghasilkan jadwal yang sama')

// Isian manual di Excel: tanggal & jam sebagai sel tanggal/waktu asli (angka seri), bukan teks.
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
  ['No', 'Tanggal (dd-mm-yyyy)', 'Jam Mulai', 'Jam Selesai', 'Mata Pelajaran', 'Pengawas'],
  [1, 46363, 0.3125, 0.375, 'Matematika', 'Zainal'],
  ['', '', '', '', '', '']
]), 'Jadwal')
assert.deepEqual(await baca(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })),
  [{ tanggal: '2026-12-07', mulai: '07:30', selesai: '09:00', mapel: 'Matematika', pengawas: 'Zainal' }])
console.log('ok - sel tanggal/jam Excel asli terbaca, baris kosong dilewati')

await assert.rejects(baca(Buffer.from('x'), 'jadwal.csv'), /\.xlsx/)
console.log('ok - selain .xlsx ditolak')
fs.rmSync(berkas, { force: true })
console.log('\n3 tes lulus')
