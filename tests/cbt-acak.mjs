// Uji pengacakan soal per jenis (issue 13 Nov): jalankan dengan  node tests/cbt-acak.mjs
import assert from 'node:assert'
import { acakPerSiswa } from '../app/utils/cbtAcak.ts'
const soal = [
  ...Array.from({ length: 6 }, (_, i) => ({ id: `pg${i}`, sec: 'pg', options: ['a', 'b', 'c', 'd'] })),
  ...Array.from({ length: 3 }, (_, i) => ({ id: `es${i}`, sec: 'essay' })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `in${i}`, sec: 'interaktif', options: ['a', 'b', 'c'] }))
]
const urut = ['pg', 'singkat', 'essay', 'interaktif']
for (const nis of ['1', '2', '3', '4', '5']) {
  // Hanya Esai diacak: PG & Interaktif tetap (soal + pilihan).
  const h = acakPerSiswa(soal, `${nis}|x`, urut, ['interaktif', 'pg'])
  assert.equal(h.length, soal.length, 'tidak ada soal hilang')
  assert.deepEqual(h.filter(q => q.sec === 'pg').map(q => q.id), soal.filter(q => q.sec === 'pg').map(q => q.id))
  assert.deepEqual(h.filter(q => q.sec === 'interaktif').map(q => q.id), ['in0', 'in1', 'in2', 'in3'])
  assert.ok(h.filter(q => q.sec !== 'essay').every(q => !q.optionOrder && (!q.options || q.options.join() === (q.sec === 'pg' ? 'a,b,c,d' : 'a,b,c'))), 'pilihan bagian tetap tidak diacak')
  assert.deepEqual(new Set(h.filter(q => q.sec === 'essay').map(q => q.id)), new Set(['es0', 'es1', 'es2']))
  // Deterministik per siswa
  assert.deepEqual(acakPerSiswa(soal, `${nis}|x`, urut, ['interaktif']).map(q => q.id), acakPerSiswa(soal, `${nis}|x`, urut, ['interaktif']).map(q => q.id))
}
// PG dipilih diacak: minimal satu siswa urutannya berbeda dan pilihan teracak + optionOrder ada
const beda = ['1', '2', '3', '4', '5'].some(n => acakPerSiswa(soal, `${n}|x`, urut, ['interaktif']).filter(q => q.sec === 'pg').map(q => q.id).join() !== 'pg0,pg1,pg2,pg3,pg4,pg5')
assert.ok(beda, 'PG diacak bila dipilih')
assert.ok(acakPerSiswa(soal, '1|x', urut, ['interaktif']).filter(q => q.sec === 'pg').every(q => Array.isArray(q.optionOrder)))
console.log('OK: pengacakan per jenis soal benar')
