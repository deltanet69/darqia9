// Uji logika murni Tiketing (tiketingCore.ts) — jalankan:
//   node --experimental-strip-types tests/tiketing.mjs
import assert from 'node:assert/strict'
import {
  BATAS_BERKAS, TIKET_KATEGORI_LAIN, TIKET_KATEGORI_MODUL, TIKET_PROGRESS, TIKET_SEMUA_KATEGORI,
  berkasDiterima, kelasStatus, labelSekolah, saringTiket, statistikTiket,
  teksLogPerubahan, validasiFormTiket, warnaGrade
} from '../app/composables/tiketingCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

const tiket = (nomor, grade, status, extra = {}) => ({
  id: nomor, nomor, grade, judul: `Judul ${nomor}`, deskripsi: 'isi', kategori: 'SPMB',
  status, progress: 0, pelapor_id: 'u1', pelapor_nama: 'Penguji', pelapor_peran: 'Guru Pengajar',
  lampiran_path: null, lampiran_nama: null,
  created_at: '2026-11-01T00:00:00Z', updated_at: '2026-11-01T00:00:00Z', ...extra
})
const contoh = [
  tiket('TKT-SMK-2026-0002', 'SMK', 'Diproses', { updated_at: '2026-11-02T00:00:00Z' }),
  tiket('TKT-SMK-2026-0001', 'SMK', 'Baru', { kategori: 'Login', pelapor_nama: 'Bima' }),
  tiket('TKT-SMP-2026-0001', 'SMP', 'Baru', { kategori: 'Jaringan / Network' }),
  tiket('TKT-SMP-2026-0002', 'SMP', 'Selesai', { progress: 100 })
]

cek('kategori modul = 23 modul RBAC + 4 kategori lain', () => {
  assert.equal(TIKET_KATEGORI_MODUL.length, 23)
  assert.deepEqual(TIKET_KATEGORI_LAIN, ['Login', 'Jaringan / Network', 'Integrasi Data', 'Lainnya'])
  assert.equal(TIKET_SEMUA_KATEGORI.length, 27)
  assert.ok(TIKET_SEMUA_KATEGORI.includes('Manajemen CBT'))
  assert.ok(TIKET_SEMUA_KATEGORI.includes('Hak Akses (RBAC)'))
})

cek('saring per grade', () => {
  const smk = saringTiket(contoh, { grade: 'SMK', status: 'Semua', kategori: 'Semua', cari: '' })
  assert.equal(smk.length, 2)
  assert.ok(smk.every(t => t.grade === 'SMK'))
})

cek('urut: Baru paling atas walau lebih lama', () => {
  const semua = saringTiket(contoh, { grade: 'Semua', status: 'Semua', kategori: 'Semua', cari: '' })
  assert.equal(semua[0].status, 'Baru')
  assert.equal(semua[3].status, 'Selesai')
})

cek('saring status + kategori + pencarian nama pelapor', () => {
  assert.equal(saringTiket(contoh, { grade: 'Semua', status: 'Baru', kategori: 'Semua', cari: '' }).length, 2)
  assert.equal(saringTiket(contoh, { grade: 'Semua', status: 'Semua', kategori: 'Login', cari: '' }).length, 1)
  assert.equal(saringTiket(contoh, { grade: 'Semua', status: 'Semua', kategori: 'Semua', cari: 'bima' }).length, 1)
  assert.equal(saringTiket(contoh, { grade: 'Semua', status: 'Semua', kategori: 'Semua', cari: 'tkt-smp' }).length, 2)
})

cek('statistik per status + rincian tiket baru per grade', () => {
  const s = statistikTiket(contoh)
  assert.equal(s.total, 4)
  assert.equal(s.baru, 2)
  assert.equal(s.baruSMK, 1)
  assert.equal(s.baruSMP, 1)
  assert.equal(s.selesai, 1)
})

cek('teks log perubahan status/progress', () => {
  assert.equal(teksLogPerubahan('Baru', 'Diproses', 0, 25), 'Status: Baru → Diproses · Progress 0% → 25%')
  assert.equal(teksLogPerubahan('Diproses', 'Diproses', 50, 50), '')
  assert.equal(teksLogPerubahan('Diproses', 'Selesai', 75, 100), 'Status: Diproses → Selesai · Progress 75% → 100%')
})

cek('validasi form: judul/kategori/komentar wajib, kategori harus dikenal', () => {
  assert.equal(validasiFormTiket({ judul: 'x', kategori: 'SPMB', deskripsi: 'y' }), null)
  assert.ok(validasiFormTiket({ judul: ' ', kategori: 'SPMB', deskripsi: 'y' }))
  assert.ok(validasiFormTiket({ judul: 'x', kategori: 'Ngawur', deskripsi: 'y' }))
  assert.ok(validasiFormTiket({ judul: 'x', kategori: 'Login', deskripsi: '' }))
})

cek('berkas diterima hanya 1 byte s/d 1 MB', () => {
  assert.equal(BATAS_BERKAS, 1048576)
  assert.ok(berkasDiterima(500_000))
  assert.ok(berkasDiterima(1048576))
  assert.ok(!berkasDiterima(1048577))
  assert.ok(!berkasDiterima(0))
})

cek('langkah progress baku 0/25/50/75/100 + label kelas & warna grade', () => {
  assert.deepEqual(TIKET_PROGRESS.map(p => p.nilai), [0, 25, 50, 75, 100])
  assert.ok(kelasStatus('Baru').includes('#1B5FD9'))
  assert.equal(warnaGrade('SMK'), '#1B5FD9')
  assert.equal(warnaGrade('SMP'), '#067647')
  assert.equal(labelSekolah('SMP'), 'SMP IT BCA')
})

console.log(`\n${lulus} uji lulus`)
