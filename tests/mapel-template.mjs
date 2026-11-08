// Tes template impor mapel & ekspor kosong — jalankan: node tests/mapel-template.mjs
import assert from 'node:assert'
import { createRequire } from 'node:module'
import { kategoriDariTeks, kategoriSahUntuk } from '../app/composables/mapelKategori.ts'

const XLSX = createRequire(import.meta.url)('xlsx')
let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

const wb = XLSX.readFile('public/template-impor-mapel-darqia9.xlsx')
const aoa = XLSX.utils.sheet_to_json(wb.Sheets['Data Mapel'], { header: 1, defval: '' })
const headers = aoa[0].map(h => String(h).trim().toLowerCase())

cek('template punya dua tab dan kolom yang dikenali importer', () => {
  assert.deepEqual(wb.SheetNames, ['Data Mapel', 'Petunjuk'])
  assert.ok(headers.findIndex(h => h.includes('nama')) === 0)
  assert.ok(headers.findIndex(h => h.includes('jenjang')) === 1)
  assert.ok(headers.findIndex(h => h.includes('kategori') && !h.includes('tambahan')) === 2)
  assert.ok(headers.findIndex(h => h.includes('kategori') && h.includes('tambahan')) === 3)
  assert.ok(headers.findIndex(h => h.includes('kkm')) === 4)
  assert.ok(headers.findIndex(h => h.includes('beban') || h.includes('jam')) === 5)
})

const data = aoa.slice(1).filter(r => r.some(c => String(c).trim() !== ''))

cek('template berisi 57 mapel resmi (SMP 17, SMK 40) tanpa duplikat', () => {
  assert.equal(data.length, 57)
  assert.equal(data.filter(r => r[1] === 'SMP').length, 17)
  assert.equal(data.filter(r => r[1] === 'SMK').length, 40)
  const kunci = data.map(r => `${r[1]}|${String(r[0]).toLowerCase()}`)
  assert.equal(new Set(kunci).size, kunci.length)
})

cek('semua baris lolos aturan importer (kategori sah per jenjang, KKM 0-100, jam 0-60)', () => {
  for (const r of data) {
    const [nama, jenjang, kat, tambahan, kkm, jam] = r
    assert.ok(String(nama).trim(), 'nama kosong')
    assert.ok(['SMP', 'SMK'].includes(jenjang), `${nama}: jenjang`)
    const k = kategoriDariTeks(kat)
    assert.ok(k && kategoriSahUntuk(jenjang, k), `${nama}: kategori ${kat}`)
    if (tambahan) {
      const t = kategoriDariTeks(tambahan)
      assert.ok(t && t !== k && kategoriSahUntuk(jenjang, t), `${nama}: kategori tambahan ${tambahan}`)
    }
    assert.ok(Number(kkm) >= 0 && Number(kkm) <= 100, `${nama}: kkm`)
    assert.ok(Number(jam) >= 0 && Number(jam) <= 60, `${nama}: jam`)
  }
})

cek('mapel berkategori ganda sesuai spreadsheet', () => {
  const ganda = data.filter(r => r[3]).map(r => `${r[1]}:${r[0]}`).sort()
  assert.deepEqual(ganda, ['SMP:Tahfidz Al-Qur\'an', 'SMP:Unggul Bahasa'])
})

cek('ekspor tanpa data tetap menghasilkan baris judul (bukan file kosong)', () => {
  const judul = ['Kode', 'Nama Mata Pelajaran', 'Jenjang', 'Kategori', 'Kategori Tambahan', 'KKM', 'Beban Jam/Minggu']
  const ws = XLSX.utils.json_to_sheet([], { header: judul })
  assert.deepEqual(XLSX.utils.sheet_to_json(ws, { header: 1 })[0], judul)
  assert.equal(XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet([])).length, 0)
})

console.log(`\n${lulus} tes lulus`)
