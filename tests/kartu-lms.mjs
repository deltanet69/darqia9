import assert from 'node:assert/strict'
import { bangunHtmlKartuLms } from '../app/utils/lmsKartuCetak.ts'

const qr = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const contoh = (i) => ({
  name: `Siswa Contoh ${i}`, nis: `242510${String(i).padStart(2, '0')}`, nisn: '0087654321',
  noPeserta: `2627--0102-242510${String(i).padStart(2, '0')}`, ttl: 'Bekasi, 14 Mei 2009',
  classroom: 'XII AK', major: 'AKL', room: 'Ruang 01', token: 'XK42P7'
})
const dasar = { judul: 'PAS Ganjil', tahunAjaran: '2026/2027', qr, asal: 'https://portal.darqiaattaqwa.sch.id' }

// SMK: landscape 10x7 cm, 8 kartu per A4, identitas + token + portal SMK + kepsek SMK.
const smk = bangunHtmlKartuLms({ ...dasar, kartu: [contoh(1)], grade: 'SMK' })
assert.ok(smk.includes('grid-template-columns: 10cm 10cm'), 'grid 2 kolom 10cm')
assert.ok(smk.includes('repeat(4, 7cm)'), '4 baris 7cm')
assert.ok(smk.includes('width: 10cm; height: 7cm'), 'kartu landscape 10x7')
assert.ok(!smk.includes('width: 7cm; height: 10cm'), 'bukan portrait')
assert.ok(smk.includes('KARTU PESERTA UJIAN'))
assert.ok(smk.includes('SMK IT Attaqwa 9'))
assert.ok(smk.includes('H. Abd. Muiz, M.Pd'))
assert.ok(smk.includes('cbt.smkitattaqwa9.sch.id'), 'portal ujian SMK dari domainCore')
assert.ok(smk.includes('XK42P7'), 'token tampil')
assert.ok(smk.includes('Ruang 01'), 'ruang tampil')
assert.ok(smk.includes('2627--0102-24251001'), 'no peserta tampil')
assert.ok(smk.includes('XII AK · AKL'), 'kelas + jurusan')
assert.ok(smk.includes('/asset/logo.png'), 'logo SMK')

// SMP: tema hijau, kepsek SMP, portal SMP, logo SMP, tanpa jurusan.
const smp = bangunHtmlKartuLms({ ...dasar, kartu: [{ ...contoh(2), classroom: 'IX A', major: '' }], grade: 'SMP' })
assert.ok(smp.includes('kartu smp'), 'kelas tema smp')
assert.ok(smp.includes('SMP IT Bina Cendekia Assalam'))
assert.ok(smp.includes('H. Muhammad Ridwan Hakim'))
assert.ok(smp.includes('cbt.smpitbca.sch.id'), 'portal ujian SMP')
assert.ok(smp.includes('/asset/logosmp.webp'), 'logo SMP')

// Paginasi: 9 kartu -> 2 halaman.
const sembilan = bangunHtmlKartuLms({ ...dasar, kartu: Array.from({ length: 9 }, (_, i) => contoh(i + 1)), grade: 'SMK' })
assert.equal((sembilan.match(/class="halaman"/g) || []).length, 2, '9 kartu = 2 halaman')

// Escape: nama berbahaya tidak menyisipkan HTML.
const jahat = bangunHtmlKartuLms({ ...dasar, kartu: [{ ...contoh(3), name: '<script>alert(1)</script>' }], grade: 'SMK' })
assert.ok(!jahat.includes('<script>alert(1)</script>'), 'nama di-escape')
assert.ok(jahat.includes('&lt;script&gt;'), 'nama tampil sebagai teks')

console.log('kartu-lms: semua tes lulus')
