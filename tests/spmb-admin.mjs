// Tes logika murni Manajemen SPMB (composable useSpmbAdmin).
// Jalankan: node --experimental-strip-types tests/spmb-admin.mjs
import assert from 'node:assert/strict'
import {
  parseTtl, gabungTtl, fmtTanggalPanjang, normalizeRecord, validasiManual,
  nisBerikutnya, bagiRataPenempatan, csvSpmb, samarNik, jenjangKeyDari,
  recordDariRow, recordKeRow
} from '../app/composables/useSpmbAdmin.ts'

let lolos = 0
const cek = (nama, fn) => { fn(); lolos++; console.log(`  ok - ${nama}`) }

cek('parseTtl memisahkan tempat & tanggal dari format formulir publik', () => {
  assert.deepEqual(parseTtl('Bekasi, 14 Maret 2011'), { tempat: 'Bekasi', tgl: '2011-03-14' })
  assert.deepEqual(parseTtl('Kota Bekasi, 2 Juni 2011'), { tempat: 'Kota Bekasi', tgl: '2011-06-02' })
  assert.deepEqual(parseTtl(''), { tempat: '', tgl: '' })
})

cek('gabungTtl <-> parseTtl konsisten (round-trip)', () => {
  assert.equal(gabungTtl('Bekasi', '2011-03-14'), 'Bekasi, 14 Maret 2011')
  assert.deepEqual(parseTtl(gabungTtl('Tambun', '2010-11-30')), { tempat: 'Tambun', tgl: '2010-11-30' })
  assert.equal(fmtTanggalPanjang('2011-03-14'), '14 Maret 2011')
})

cek('normalizeRecord: record publik lama (TTL gabungan) terurai; status dinormalkan', () => {
  const r = normalizeRecord({
    id: 'SPMB27-SMK-XXXXXX', jenjang: 'SMK IT Attaqwa 9', jurusan: 'Teknik Komputer & Jaringan',
    s_nama: 'Uji', s_nisn: '0087654321', s_jk: 'Laki-laki', s_ttl: 'Bekasi, 14 Maret 2011',
    s_hp: '-', s_email: '-', s_sekolah: 'SMPN 1', s_alsekolah: 'Jl. A',
    o_nama: 'Wali Uji', o_hub: 'Ayah', o_nik: '3201121403800001', o_hp: '081387654321',
    o_email: '-', o_ttl: 'Jakarta, 14 Maret 1980', o_alamat: 'Jl. B',
    waktu: '2026-10-28T09:14:00', status: 'Menunggu Verifikasi'
  })
  assert.equal(r.s_tempat, 'Bekasi')
  assert.equal(r.s_tgl, '2011-03-14')
  assert.equal(r.o_tempat, 'Jakarta')
  assert.equal(r.o_tgl, '1980-03-14')
  assert.equal(r.status, 'Menunggu verifikasi')
  assert.equal(r.via, 'Online')
  assert.equal(jenjangKeyDari(r), 'SMK')
})

cek('normalizeRecord: field terpisah eksplisit (formulir baru) dipakai apa adanya', () => {
  const r = normalizeRecord({
    id: 'SPMB27-SMP-YYYYYY', jenjang: 'SMP IT Bina Cendekia Assalam',
    s_ttl: 'Bekasi, 11 Februari 2014', s_tempat: 'Bekasi', s_tgl: '2014-02-11',
    o_ttl: 'Bekasi, 11 Februari 1979', o_tempat: 'Bekasi', o_tgl: '1979-02-11',
    status: 'Diterima'
  })
  assert.equal(r.s_tgl, '2014-02-11')
  assert.equal(jenjangKeyDari(r), 'SMP')
})

const inputValid = {
  s_nama: 'Siswa Uji', s_nisn: '0011223344', s_jk: 'Perempuan', s_tempat: 'Bekasi', s_tgl: '2011-05-05',
  s_hp: '', s_email: '', s_sekolah: 'SMPN 2', s_alsekolah: 'Jl. C', jurusan: 'Desain Komunikasi Visual',
  o_nama: 'Wali Uji', o_hub: 'Ibu', o_nik: '3201050505900002', o_hp: '081299887766', o_email: '',
  o_tempat: 'Bekasi', o_tgl: '1990-05-05', o_alamat: 'Jl. D', metode: 'Tunai di sekolah', bukti: ''
}

cek('validasiManual: input valid lolos; NISN duplikat per jenjang ditolak', () => {
  assert.equal(validasiManual(inputValid, 'SMK', []), '')
  const ada = [normalizeRecord({ id: 'SPMB27-SMK-ZZZZZZ', jenjang: 'SMK IT Attaqwa 9', s_nisn: '0011223344', status: 'Diterima' })]
  assert.match(validasiManual(inputValid, 'SMK', ada), /sudah terdaftar/)
  assert.equal(validasiManual(inputValid, 'SMP', ada), '')
  assert.equal(validasiManual(inputValid, 'SMK', ada, 'SPMB27-SMK-ZZZZZZ'), '')
})

cek('validasiManual: bukti wajib untuk transfer; NISN/NIK/HP dijaga', () => {
  assert.match(validasiManual({ ...inputValid, metode: 'Transfer BSI', bukti: '' }, 'SMK', []), /Bukti pembayaran wajib/)
  assert.equal(validasiManual({ ...inputValid, metode: 'Transfer BSI', bukti: 'bukti.jpg' }, 'SMK', []), '')
  assert.match(validasiManual({ ...inputValid, s_nisn: '123' }, 'SMK', []), /10 digit/)
  assert.match(validasiManual({ ...inputValid, o_nik: '123' }, 'SMK', []), /16 digit/)
  assert.match(validasiManual({ ...inputValid, o_hp: '07123' }, 'SMK', []), /HP\/WA/)
})

cek('nisBerikutnya berurutan per jenjang', () => {
  const recs = [
    normalizeRecord({ id: 'A', jenjang: 'SMK IT Attaqwa 9', nis: '2700101', status: 'Diterima' }),
    normalizeRecord({ id: 'B', jenjang: 'SMK IT Attaqwa 9', nis: '2700102', status: 'Diterima' }),
    normalizeRecord({ id: 'C', jenjang: 'SMP IT Bina Cendekia Assalam', nis: '2700201', status: 'Diterima' })
  ]
  assert.equal(nisBerikutnya(recs, 'SMK'), '2700103')
  assert.equal(nisBerikutnya(recs, 'SMP'), '2700202')
  assert.equal(nisBerikutnya([], 'SMK'), '2700101')
})

cek('bagiRataPenempatan: round-robin per jurusan + hormati kapasitas', () => {
  const buat = (id, jurusan) => normalizeRecord({ id, jenjang: 'SMK IT Attaqwa 9', jurusan, status: 'Diterima' })
  const pool = [buat('1', 'Teknik Komputer & Jaringan'), buat('2', 'Teknik Komputer & Jaringan'), buat('3', 'Teknik Komputer & Jaringan'), buat('4', 'Desain Komunikasi Visual')]
  const rombels = [
    { nama: 'X TKJ 1', jurusan: 'Teknik Komputer & Jaringan', kap: 2 },
    { nama: 'X TKJ 2', jurusan: 'Teknik Komputer & Jaringan', kap: 2 },
    { nama: 'X DKV 1', jurusan: 'Desain Komunikasi Visual', kap: 1 }
  ]
  const untuk = r => rombels.filter(rb => rb.jurusan === r.jurusan)
  const { pasangan, sisa } = bagiRataPenempatan(pool, untuk, {})
  assert.equal(pasangan.length, 4)
  assert.equal(sisa.length, 0)
  const perRombel = {}
  for (const p of pasangan) perRombel[p.rombel] = (perRombel[p.rombel] || 0) + 1
  assert.deepEqual(perRombel, { 'X TKJ 1': 2, 'X TKJ 2': 1, 'X DKV 1': 1 })
  const penuh = bagiRataPenempatan(pool, untuk, { 'X TKJ 1': 2, 'X TKJ 2': 2, 'X DKV 1': 1 })
  assert.equal(penuh.pasangan.length, 0)
  assert.equal(penuh.sisa.length, 4)
})

cek('csvSpmb memuat kolom TTL terpisah + penempatan; samarNik menyamarkan', () => {
  const r = normalizeRecord({ id: 'SPMB27-SMK-AAAAAA', jenjang: 'SMK IT Attaqwa 9', s_nama: 'Uji', s_ttl: 'Bekasi, 14 Maret 2011', o_ttl: 'Jakarta, 14 Maret 1980', o_nik: '3201121403800001', status: 'Diterima', kelas: 'X TKJ 1', nis: '2700101' })
  const csv = csvSpmb([r])
  assert.match(csv, /Tempat Lahir Siswa/)
  assert.match(csv, /"Bekasi";"14 Maret 2011"/)
  assert.match(csv, /"X TKJ 1";"2700101"/)
  assert.equal(samarNik('3201121403800001'), '3201••••••••••01')
})

cek('mapper database: baris spmb_registrations <-> record admin', () => {
  const row = {
    id: 'SPMB27-SMK-DB1234', jenjang: 'SMK IT Attaqwa 9', jurusan: 'Teknik Komputer & Jaringan',
    s_nama: 'Siswa DB', s_nisn: '0012345678', s_jk: 'Laki-laki', s_tempat: 'Bekasi', s_tgl: '2011-03-14',
    s_hp: '081200000000', s_email: 'db@example.com', s_sekolah: 'SMPN 9', s_alsekolah: 'Jl. DB',
    o_nama: 'Wali DB', o_hub: 'Ayah', o_nik: '3201121403800001', o_hp: '081200000001', o_email: 'wali@example.com',
    o_tempat: 'Jakarta', o_tgl: '1980-03-14', o_alamat: 'Jl. Wali',
    via: 'Online', oleh: null, metode: 'Transfer BSI', bukti_path: 'SPMB27-SMK-DB1234/bukti-db.jpg',
    status: 'Diterima', kelas: 'X TKJ 1', nis: '2700101',
    deleted_at: null, created_at: '2026-10-29T02:00:00.000Z', updated_at: '2026-10-29T02:00:00.000Z'
  }
  const r = recordDariRow(row)
  assert.equal(r.waktu, '2026-10-29T02:00:00.000Z')
  assert.equal(r.bukti, 'bukti-db.jpg')
  assert.equal(r.bukti_path, 'SPMB27-SMK-DB1234/bukti-db.jpg')
  assert.equal(r.deleted, false)
  assert.equal(r.s_tgl, '2011-03-14')
  const kembali = recordKeRow(r)
  assert.equal(kembali.s_tgl, '2011-03-14')
  assert.equal(kembali.bukti_path, 'SPMB27-SMK-DB1234/bukti-db.jpg')
  assert.equal(kembali.deleted_at, null)
  assert.equal(kembali.status, 'Diterima')
  const terhapus = recordDariRow({ ...row, deleted_at: '2026-10-29T03:00:00.000Z' })
  assert.equal(terhapus.deleted, true)
  assert.ok(recordKeRow(terhapus).deleted_at)
})

console.log(`\nSEMUA ${lolos} KELOMPOK TES SPMB LOLOS`)
