// Tes export jadwal ruang (Excel) — jalankan: node tests/ruang-ujian-excel.mjs
import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import * as XLSX from 'xlsx'
import { eksporJadwalRuang } from '../app/utils/cbtExcelJadwalRuang.ts'

const berkas = path.join(os.tmpdir(), `jadwal-ruang-${Date.now()}.xlsx`)
const jadwal = [
  { tanggal: '2026-12-07', mulai: '07:30', selesai: '09:00', mapel: 'Bahasa Indonesia', pengawas: 'Ahmad' },
  { tanggal: '2026-12-07', mulai: '09:30', selesai: '11:00', mapel: 'Matematika', pengawas: '' }
]
process.chdir(os.tmpdir())
await eksporJadwalRuang(path.basename(berkas), jadwal)
const rows = XLSX.utils.sheet_to_json(XLSX.read(fs.readFileSync(berkas)).Sheets.Jadwal, { header: 1, defval: '' })
assert.deepEqual(rows.slice(1), [
  [1, '07-12-2026', '07:30', '09:00', 'Bahasa Indonesia', 'Ahmad'],
  [2, '07-12-2026', '09:30', '11:00', 'Matematika', '']
])
console.log('ok - export berisi tanggal dd-mm-yyyy, jam, mapel, dan pengawas')
fs.rmSync(berkas, { force: true })
console.log('\n1 tes lulus')
