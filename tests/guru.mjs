// Uji logika murni Data Guru (guruCore.ts) — penyesuaian meeting 4 Nov 2026.
// Jalankan: node --experimental-strip-types tests/guru.mjs
import assert from 'node:assert/strict'
import {
  PENDIDIKAN_OPSI, jenisNomorDari, labelAsalInstitusi, nomorAktif, normalisasiPendidikan, parseCsvGuru, tanggalLahirIso, pesanGalatDb
} from '../app/composables/guruCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

cek('opsi pendidikan baku = 5 tingkat sesuai meeting', () => {
  assert.deepEqual([...PENDIDIKAN_OPSI], ['SMK/SMA Sederajat', 'Diploma', 'Sarjana', 'Magister', 'Doktor'])
})

cek('normalisasi pendidikan bebas -> opsi baku', () => {
  assert.equal(normalisasiPendidikan('S1 Pendidikan'), 'Sarjana')
  assert.equal(normalisasiPendidikan('S2 Manajemen Pendidikan'), 'Magister')
  assert.equal(normalisasiPendidikan('S3'), 'Doktor')
  assert.equal(normalisasiPendidikan('D3 Akuntansi'), 'Diploma')
  assert.equal(normalisasiPendidikan('D4 Teknik Informatika'), 'Diploma')
  assert.equal(normalisasiPendidikan('SMK'), 'SMK/SMA Sederajat')
  assert.equal(normalisasiPendidikan('SMA Negeri'), 'SMK/SMA Sederajat')
  assert.equal(normalisasiPendidikan('Sarjana'), 'Sarjana')
  assert.equal(normalisasiPendidikan(''), '')
  assert.equal(normalisasiPendidikan('Kursus Bahasa'), '')
})

cek('label asal institusi mengikuti jenjang pendidikan', () => {
  assert.equal(labelAsalInstitusi('SMK/SMA Sederajat'), 'Asal Sekolah')
  assert.equal(labelAsalInstitusi('Sarjana'), 'Asal Kampus / Perguruan Tinggi')
  assert.equal(labelAsalInstitusi('Diploma'), 'Asal Kampus / Perguruan Tinggi')
  assert.equal(labelAsalInstitusi(''), 'Asal Sekolah')
})

cek('jenis nomor: kolom menang, warisan diturunkan dari isi', () => {
  assert.equal(jenisNomorDari('NUPTK', '123', ''), 'NUPTK')
  assert.equal(jenisNomorDari('', '', '9998887776665554'), 'NUPTK')
  assert.equal(jenisNomorDari('', '198501012010011001', ''), 'NIP')
  assert.equal(jenisNomorDari('', '198501012010011001', '9998887776665554'), 'NIP')
  assert.equal(jenisNomorDari(null, '', ''), 'NIP')
})

cek('nomor aktif mengikuti jenisnya', () => {
  assert.equal(nomorAktif('NUPTK', '111', '222'), '222')
  assert.equal(nomorAktif('NIP', '111', '222'), '111')
  assert.equal(nomorAktif('NUPTK', '111', ''), '')
})

const HEAD = 'Nama Guru,NIK,NUPTK,NIP,Jenis Nomor,No Telp/WA,Alamat Email,Tempat Lahir,Tgl Lahir,Alamat,Kelurahan,Kecamatan,Kab/Kota,Pendidikan Terakhir,Asal Institusi,Unit Sekolah,Jabatan Guru,Bidang Studi/Jurusan'
const baris = (o = {}) => {
  const v = { nama: 'Budi Hartono', nik: '3216071411780010', nuptk: '4752768643130010', nip: '', jenis: 'NUPTK', hp: '081290000010', email: 'Budi@SMK.sch.id', tl: 'Bekasi', tgl: '14/11/1978', alamat: 'Jl. Kenanga, No. 10', kel: 'Bahagia', kec: 'Babelan', kab: 'Kab. Bekasi', pend: 'S1', asal: 'Univ X', unit: 'SMK', jab: 'Guru Mapel', mapel: 'TKJ', ...o }
  return [v.nama, v.nik, v.nuptk, v.nip, v.jenis, v.hp, v.email, v.tl, v.tgl, `"${v.alamat}"`, v.kel, v.kec, v.kab, v.pend, v.asal, v.unit, v.jab, v.mapel].join(',')
}

cek('tanggalLahirIso: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd; selain itu null', () => {
  assert.equal(tanggalLahirIso('14/11/1978'), '1978-11-14')
  assert.equal(tanggalLahirIso('4-1-1980'), '1980-01-04')
  assert.equal(tanggalLahirIso('1978-11-14'), '1978-11-14')
  assert.equal(tanggalLahirIso('31/02/1980'), null)
  assert.equal(tanggalLahirIso('14-Nov-78'), null)
  assert.equal(tanggalLahirIso(''), null)
})

cek('parseCsvGuru: baris valid terbaca penuh (koma dalam kutip, BOM, email huruf kecil, pendidikan baku)', () => {
  const h = parseCsvGuru('\uFEFF' + HEAD + '\r\n' + baris(), 'SMK')
  assert.equal(h.galat.length, 0)
  assert.equal(h.rows.length, 1)
  const r = h.rows[0]
  assert.equal(r.name, 'Budi Hartono')
  assert.equal(r.email, 'budi@smk.sch.id')
  assert.equal(r.address, 'Jl. Kenanga, No. 10')
  assert.equal(r.education, 'Sarjana')
  assert.equal(r.birthDate, '1978-11-14')
  assert.equal(r.jenisNomor, 'NUPTK')
  assert.equal(r.unit, 'SMK')
})

cek('parseCsvGuru: pemisah titik koma (Excel regional Indonesia) juga terbaca', () => {
  const pecahKoma = (l) => l.replace(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ';')
  const h = parseCsvGuru(pecahKoma(HEAD) + '\n' + pecahKoma(baris()), 'SMK')
  assert.equal(h.galat.length, 0)
  assert.equal(h.rows[0].name, 'Budi Hartono')
  assert.equal(h.rows[0].address, 'Jl. Kenanga, No. 10')
})

cek('parseCsvGuru: NIK notasi ilmiah Excel ditolak, bukan masuk rusak', () => {
  const h = parseCsvGuru(HEAD + '\n' + baris({ nik: '"3,21607E+15"' }), 'SMK')
  assert.equal(h.rows.length, 0)
  assert.match(h.galat[0], /Baris 2.*NIK.*angka/)
})

cek('parseCsvGuru: tanggal lahir tak dikenal ditolak, bukan diam-diam kosong', () => {
  const h = parseCsvGuru(HEAD + '\n' + baris({ tgl: '14-Nov-78' }), 'SMK')
  assert.match(h.galat[0], /Baris 2.*tanggal lahir/i)
})

cek('parseCsvGuru: semua galat baris dilaporkan, satu galat per baris', () => {
  const isi = [HEAD, baris(), baris({ nama: '', nik: '3216071411780011' }), baris({ nik: '', nip: '', nuptk: '' }), baris({ email: 'salah', nik: '3216071411780012' })].join('\n')
  const h = parseCsvGuru(isi, 'SMK')
  assert.equal(h.galat.length, 3)
  assert.equal(h.rows.length, 1)
  assert.match(h.galat[0], /Baris 3.*nama/)
  assert.match(h.galat[1], /Baris 4.*NIP atau NIK/)
  assert.match(h.galat[2], /Baris 5.*email/)
})

cek('parseCsvGuru: duplikat NIK atau NIP dalam satu berkas ditolak', () => {
  const dupNik = parseCsvGuru([HEAD, baris(), baris({ nama: 'Siti' })].join('\n'), 'SMK')
  assert.match(dupNik.galat[0], /Baris 3.*NIK.*duplikat/)
  const dupNip = parseCsvGuru([HEAD, baris({ nip: '198001012005011001' }), baris({ nama: 'Siti', nik: '3216071411780099', email: 'siti@smk.sch.id', nip: '198001012005011001' })].join('\n'), 'SMK')
  assert.match(dupNip.galat[0], /Baris 3.*NIP.*duplikat/)
})

cek('parseCsvGuru: berkas Excel biner (xlsx/xls) dijelaskan, bukan "tidak ada data"', () => {
  const h = parseCsvGuru('PK\u0003\u0004\u0014\u0000\u0006\u0000', 'SMK')
  assert.match(h.galat[0], /simpan.*CSV/i)
})

cek('parseCsvGuru: unit kosong memakai jenjang aktif; header saja ditolak', () => {
  assert.equal(parseCsvGuru(HEAD + '\n' + baris({ unit: '' }), 'SMP').rows[0].unit, 'SMP')
  assert.equal(parseCsvGuru(HEAD, 'SMK').rows.length, 0)
  assert.equal(parseCsvGuru(HEAD, 'SMK').galat.length, 1)
})

cek('tanggalLahirIso: nama bulan Indonesia/Inggris, lengkap atau singkat (format hasil Google Sheets)', () => {
  assert.equal(tanggalLahirIso('25 Juli 1985'), '1985-07-25')
  assert.equal(tanggalLahirIso('10 Februari 1989'), '1989-02-10')
  assert.equal(tanggalLahirIso('9 Maret 1990'), '1990-03-09')
  assert.equal(tanggalLahirIso('3 Agu 1990'), '1990-08-03')
  assert.equal(tanggalLahirIso('3 AGUSTUS 1990'), '1990-08-03')
  assert.equal(tanggalLahirIso('12 Desember 1971'), '1971-12-12')
  assert.equal(tanggalLahirIso('5 July 1980'), '1980-07-05')
  assert.equal(tanggalLahirIso('31 Februari 1980'), null)
  assert.equal(tanggalLahirIso('5 Bulan 1980'), null)
})

cek('parseCsvGuru: nomor dengan spasi (format ekspor aplikasi) dirapikan, bukan ditolak', () => {
  const h = parseCsvGuru(HEAD + '\n' + baris({ nip: '1979 0817 2005 01 1001', nuptk: '4752 7686 4313 0010' }), 'SMK')
  assert.equal(h.galat.length, 0)
  assert.equal(h.rows[0].nip, '197908172005011001')
  assert.equal(h.rows[0].nuptk, '4752768643130010')
})

cek('parseCsvGuru: isi kolom Unit yang bukan SMP/SMK/Yayasan (nama kampus) -> unit jenjang aktif, teks pindah ke Asal Institusi bila kosong', () => {
  const kampus = parseCsvGuru(HEAD + '\n' + baris({ unit: 'Universitas Indraprasta PGRI', asal: '' }), 'SMP').rows[0]
  assert.equal(kampus.unit, 'SMP')
  assert.equal(kampus.asalInstitusi, 'Universitas Indraprasta PGRI')
  const terisi = parseCsvGuru(HEAD + '\n' + baris({ unit: 'UNJ', asal: 'Univ X' }), 'SMK').rows[0]
  assert.equal(terisi.unit, 'SMK')
  assert.equal(terisi.asalInstitusi, 'Univ X')
  assert.equal(parseCsvGuru(HEAD + '\n' + baris({ unit: 'Yayasan' }), 'SMK').rows[0].unit, 'Yayasan')
  assert.equal(parseCsvGuru(HEAD + '\n' + baris({ unit: 'smp it bca' }), 'SMK').rows[0].unit, 'SMP')
})

cek('parseCsvGuru: format ekspor aplikasi (22 kolom, urutan berbeda, kolom Status Akun Portal) terbaca', () => {
  const head = 'No,Nama Lengkap,Alamat Email,NIK,NUPTK,NIP,Jenis Nomor,No Telp/WA,Tempat Lahir,Tgl Lahir,Alamat,Kelurahan,Kecamatan,Kab/Kota,Pendidikan Terakhir,Asal Institusi,Unit Sekolah,Jabatan & Tugas,Bidang Studi/Jurusan,Status Kepegawaian,RFID UID,Status Akun Portal'
  const r1 = '1,Siti Aminah,siti@x.sch.id,3216071411780010,2147483647123456,-,,812900001,Bekasi,25 Juli 1985,Jl. A,Bahagia,Babelan,Kab. Bekasi,S2,,UNJ,,Teknologi Pendidikan,,,'
  const r2 = '2,Andi,andi@x.sch.id,3216071411780011,,,,,,-,,,,,SMK,,,,,,,'
  const h = parseCsvGuru([head, r1, r2].join('\n'), 'SMK')
  assert.deepEqual(h.galat, [])
  assert.equal(h.rows.length, 2)
  assert.equal(h.rows[0].birthDate, '1985-07-25')
  assert.equal(h.rows[0].education, 'Magister')
  assert.equal(h.rows[0].role, 'Guru')
  assert.equal(h.rows[0].status, 'Aktif')
  assert.equal(h.rows[0].jenisNomor, 'NUPTK')
  assert.equal(h.rows[1].birthDate, '')
  assert.equal(h.rows[1].education, 'SMK/SMA Sederajat')
})

cek('pesanGalatDb: galat database diterjemahkan jadi tindakan yang jelas', () => {
  assert.match(pesanGalatDb('null value in column "nip" of relation "teachers" violates not-null constraint'), /0008_nip_opsional_guru/)
  assert.match(pesanGalatDb('new row violates row-level security policy for table "teachers"'), /0007/)
  assert.match(pesanGalatDb('duplicate key value violates unique constraint "teachers_nik_unique"'), /NIK.*sudah dipakai/)
  assert.match(pesanGalatDb('duplicate key value violates unique constraint "teachers_nip_key"'), /NIP.*sudah dipakai/)
  assert.match(pesanGalatDb('new row for relation "teachers" violates check constraint "teachers_grade_check"'), /unit sekolah/i)
  assert.equal(pesanGalatDb('galat aneh lain'), 'galat aneh lain')
})

console.log(`
${lulus} uji lulus`)
