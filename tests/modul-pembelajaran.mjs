// Tes logika murni Modul Pembelajaran (composable useModulPembelajaran).
// Jalankan: node --experimental-strip-types tests/modul-pembelajaran.mjs
import assert from 'node:assert/strict'
import {
  isiBawaan, totalJpLangkah, totalBobot, petaPertemuan, saringDaftarModul,
  bolehSunting, bolehSetujui, bolehArsip, ringkasTanggal, modulDariBaris, barisDariModul, isiDariAi, TAHAP_PJBL
} from '../app/composables/useModulPembelajaran.ts'

let lolos = 0
const cek = (nama, fn) => { fn(); lolos++; console.log(`  ok - ${nama}`) }

// Contoh terisi "Sekolah Bebas Sampah": JP per tahap 1,2,1,4,2,2 = 12 JP, 4 pertemuan.
const isiContoh = isiBawaan()
isiContoh.langkah = [
  { tahap: 'Penentuan pertanyaan mendasar', guru: 'g1', siswa: 's1', jp: 1 },
  { tahap: 'Mendesain perencanaan projek', guru: 'g2', siswa: 's2', jp: 2 },
  { tahap: 'Menyusun jadwal', guru: 'g3', siswa: 's3', jp: 1 },
  { tahap: 'Memantau siswa dan progres projek', guru: 'g4', siswa: 's4', jp: 4 },
  { tahap: 'Menguji hasil', guru: 'g5', siswa: 's5', jp: 2 },
  { tahap: 'Evaluasi pengalaman', guru: 'g6', siswa: 's6', jp: 2 }
]

cek('totalJpLangkah: contoh = 12 JP', () => {
  assert.equal(totalJpLangkah(isiContoh), 12)
  assert.equal(totalJpLangkah(isiBawaan()), 0)
})

cek('totalBobot: bawaan = 100%', () => {
  assert.equal(totalBobot(isiBawaan()), 100)
})

cek('petaPertemuan: 12 JP / 4 pertemuan = peta contoh (1–2, 3–4, 4–5, 5–6)', () => {
  const peta = petaPertemuan(isiContoh, 4)
  assert.deepEqual(peta.map(p => [p.ke, p.jp, p.tahapDari, p.tahapKe]), [
    [1, 3, 1, 2], [2, 3, 3, 4], [3, 3, 4, 5], [4, 3, 5, 6]
  ])
  assert.deepEqual(petaPertemuan(isiBawaan(), 4), [])
})

const modul = (id, ekstra = {}) => ({
  id, jenjang: 'SMP', jenis: 'projek', nomor: 1, judul: `Modul ${id}`, penyusun: 'Budi',
  authorTeacherId: 'guru-1', satuan: 'SMP IT BCA', mapel: 'Projek IPAS', fase: 'Fase D', kelas: 'Kelas VII',
  alokasiJp: 12, jumlahPertemuan: 4, durasiMinggu: 4, status: 'draf', tahapBerjalan: 0,
  isi: isiBawaan(), submittedAt: null, approvedAt: null, approvedBy: null,
  createdAt: null, updatedAt: null, deletedAt: null, ...ekstra
})
const daftarTes = [
  modul('a'),
  modul('b', { status: 'disetujui', penyusun: 'Sari', authorTeacherId: 'guru-2', judul: 'Modul Bijak Bermedia' }),
  modul('c', { jenis: 'mapel', status: 'menunggu', judul: 'Modul Ajar IPAS Ekosistem', penyusun: 'Sari', authorTeacherId: 'guru-2' })
]

cek('saringDaftarModul: kata + status + penyusun + jenis', () => {
  assert.equal(saringDaftarModul(daftarTes, {}).length, 3)
  assert.deepEqual(saringDaftarModul(daftarTes, { kata: 'bermedia' }).map(m => m.id), ['b'])
  assert.deepEqual(saringDaftarModul(daftarTes, { kata: 'sari' }).map(m => m.id), ['b', 'c'])
  assert.deepEqual(saringDaftarModul(daftarTes, { status: 'menunggu' }).map(m => m.id), ['c'])
  assert.deepEqual(saringDaftarModul(daftarTes, { penyusunId: 'guru-1' }).map(m => m.id), ['a'])
  assert.deepEqual(saringDaftarModul(daftarTes, { jenis: 'mapel' }).map(m => m.id), ['c'])
  assert.deepEqual(saringDaftarModul(daftarTes, { kata: 'zzz' }), [])
})

cek('aturan akses: sunting hanya penulis / superadmin; setujui admin; arsip penulis / superadmin', () => {
  const m = modul('a')
  assert.equal(bolehSunting(m, 'guru', 'guru-1'), true)
  assert.equal(bolehSunting(m, 'guru', 'guru-2'), false)
  assert.equal(bolehSunting(m, 'superadmin', ''), true)
  assert.equal(bolehSunting({ ...m, deletedAt: '2026-10-31T00:00:00Z' }, 'superadmin', ''), false)
  assert.equal(bolehSetujui('superadmin'), true)
  assert.equal(bolehSetujui('admin_tu'), true)
  assert.equal(bolehSetujui('guru'), false)
  assert.equal(bolehArsip(m, 'guru', 'guru-2'), false)
  assert.equal(bolehArsip(m, 'guru', 'guru-1'), true)
})

cek('ringkasTanggal: format Indonesia ringkas', () => {
  assert.equal(ringkasTanggal('2026-10-20T03:00:00Z').endsWith('Okt 2026'), true)
  assert.equal(ringkasTanggal(null), '—')
  assert.equal(ringkasTanggal('bukan-tanggal'), '—')
})

cek('pemetaan baris <-> modul: bolak-balik konsisten & isi dilengkapi bawaan', () => {
  const asli = modul('x', { status: 'menunggu' })
  const pulih = modulDariBaris({ id: 'x', ...barisDariModul(asli) })
  assert.equal(pulih.judul, asli.judul)
  assert.equal(pulih.status, 'menunggu')
  assert.equal(pulih.authorTeacherId, 'guru-1')
  assert.equal(pulih.isi.langkah.length, 6)
  assert.equal(pulih.isi.bobot.length, 3)
  const minim = modulDariBaris({ id: 'y', jenjang: 'SMK', judul: 'Minim', penyusun: 'A', isi: {} })
  assert.equal(minim.isi.model, 'Project-Based Learning (PjBL)')
  assert.equal(minim.status, 'draf')
})

cek('isiDariAi: hasil AI dirapikan (dimensi resmi maks 3, 6 tahap PjBL, kolom hilang = bawaan)', () => {
  const isi = isiDariAi({
    cp: 'CP', dimensi: ['Kolaborasi', 'Ngarang', 'Kreativitas', 'Komunikasi', 'Kemandirian'],
    tujuan: ['T1', 5, ''], langkah: [{ tahap: 'salah', guru: 'g', siswa: 's', jp: '2.6' }], bobot: 'bukan array'
  })
  assert.deepEqual(isi.dimensi, ['Kolaborasi', 'Kreativitas', 'Komunikasi'])
  assert.deepEqual(isi.tujuan, ['T1'])
  assert.deepEqual(isi.langkah.map(l => l.tahap), TAHAP_PJBL)
  assert.equal(isi.langkah[0].jp, 3)
  assert.equal(isi.langkah[5].guru, '')
  assert.equal(isi.bobot.length, 3)
  assert.equal(isi.cpReferensi, 'Kepkabskap 032/H/KR/2024')
  assert.equal(isiDariAi(null).cp, '')
})

console.log(`\n${lolos} kelompok tes lolos`)
