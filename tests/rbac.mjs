// Tes fungsi murni RBAC — jalankan: node --experimental-strip-types tests/rbac.mjs
import assert from 'node:assert'
import {
  RBAC_MODUL, RBAC_SEED_IZIN, RBAC_SEED_PERAN, hitungIzin, izinKosong,
  terapkanCentang, kolomPenuh, penugasanDari, dalamCakupan, bisaAkses,
  modulDariJudul, modulDariPath, subDariPath, lengkapiSub, agregatModul, kunciSub,
  RBAC_SUBMODUL, RBAC_KUNCI, RBAC_DAUN, jenjangAkun, lintasJenjang
} from '../app/composables/rbacCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

cek('24 modul (termasuk Tiketing), 9 peran bawaan, superadmin terkunci', () => {
  assert.equal(RBAC_MODUL.length, 24)
  assert.equal(RBAC_SEED_PERAN.length, 9)
  assert.equal(RBAC_SEED_PERAN[0].kunci, 'superadmin')
  assert.equal(RBAC_SEED_PERAN[0].terkunci, true)
})

cek('izin bawaan sesuai brief aksesaplikasi.md', () => {
  const I = RBAC_SEED_IZIN
  assert.equal(hitungIzin(I.superadmin), 96)
  // Yayasan/Kepsek/Wakasek: baca seluruh modul, tanpa ubah (kecuali buat tiket)
  for (const p of ['ketua_yayasan', 'kepala_sekolah', 'wakil_kepala_sekolah']) {
    assert.ok(RBAC_MODUL.every(m => I[p][m].lihat), p)
    assert.ok(RBAC_MODUL.every(m => !I[p][m].ubah && !I[p][m].hapus), p)
  }
  // Operator: CRUD Akademik, CBT, LMS, Konten, SPMB, Perpus; tanpa Keuangan & menu Sistem
  for (const m of ['Data Siswa', 'Raport Siswa', 'Manajemen CBT', 'LMS', 'Konten Website', 'SPMB', 'Perpustakaan Digital']) assert.equal(I.operator[m].hapus, true, m)
  assert.equal(I.operator['Manajemen CBT/rooms'].buat, true)
  for (const m of ['Keuangan Sekolah', 'Manajemen User', 'Hak Akses (RBAC)']) assert.equal(I.operator[m].lihat, false, m)
  assert.equal(I.operator['Agenda Mengajar'].buat, true)
  // Staff Adm: CRUD Akademik & Keuangan, tanpa CBT
  assert.equal(I.staff_adm['Keuangan Sekolah/pembayaran'].buat, true)
  assert.equal(I.staff_adm['Tabungan Siswa'].hapus, true)
  assert.equal(I.staff_adm['Manajemen CBT'].lihat, false)
  // Guru: absensi siswa hanya ringkasan, jadwal & mapel read-only, tanpa Data Siswa / Raport / Keuangan
  const g = I.guru_pengajar
  assert.equal(g['Absensi Siswa/overview'].lihat, true)
  assert.equal(g['Absensi Siswa/detail'].lihat, false)
  assert.equal(g['Jadwal Pelajaran/kelas'].ubah, false)
  assert.equal(g['Master Mapel'].ubah, false)
  for (const m of ['Data Siswa', 'Raport Siswa', 'Keuangan Sekolah', 'Data Guru & Staff']) assert.equal(g[m].lihat, false, m)
  assert.equal(g['Tiketing'].buat, true)
  // Wali kelas = guru + kelola kelas, raport, presensi siswa rinci
  const w = I.wali_kelas
  assert.equal(w['Manajemen Kelas/daftar'].ubah, true)
  assert.equal(w['Raport Siswa'].buat, true)
  assert.equal(w['Absensi Siswa/detail'].lihat, true)
  assert.equal(w['LMS/exams'].buat, true)
})

cek('centang ubah otomatis menyalakan lihat', () => {
  const izin = terapkanCentang(izinKosong(), 'Data Siswa', 'ubah', true)
  assert.equal(izin['Data Siswa'].ubah, true)
  assert.equal(izin['Data Siswa'].lihat, true)
})

cek('mematikan lihat membersihkan seluruh baris modul', () => {
  let izin = terapkanCentang(izinKosong(), 'Data Siswa', 'hapus', true)
  izin = terapkanCentang(izin, 'Data Siswa', 'lihat', false)
  assert.deepEqual(izin['Data Siswa'], { lihat: false, buat: false, ubah: false, hapus: false })
})

cek('kolomPenuh hanya untuk superadmin', () => {
  assert.equal(kolomPenuh(RBAC_SEED_IZIN.superadmin, 'hapus'), true)
  assert.equal(kolomPenuh(RBAC_SEED_IZIN.operator, 'hapus'), false)
  assert.equal(kolomPenuh(RBAC_SEED_IZIN.ketua_yayasan, 'lihat'), true)
  assert.equal(kolomPenuh(RBAC_SEED_IZIN.operator, 'lihat'), false)
})

cek('satu pengguna satu peran: penugasan ditemukan unik per subjek', () => {
  const daftar = [
    { subjekId: 'guru-1', nama: 'Bu Dewi', peranId: 'p-guru', jenjang: ['SMK'] },
    { subjekId: 'guru-2', nama: 'Pak Budi', peranId: 'p-wali', jenjang: ['SMP', 'SMK'] }
  ]
  assert.equal(penugasanDari(daftar, 'guru-1').peranId, 'p-guru')
  assert.equal(penugasanDari(daftar, 'tidak-ada'), null)
})

cek('cakupan jenjang: guru SMK saja tidak masuk SMP', () => {
  const p = { subjekId: 'guru-1', nama: 'Bu Dewi', peranId: 'p-guru', jenjang: ['SMK'] }
  assert.equal(dalamCakupan(p, 'SMK'), true)
  assert.equal(dalamCakupan(p, 'SMP'), false)
  assert.equal(dalamCakupan(null, 'SMK'), false)
})

cek('bisaAkses: terkunci selalu boleh, guru tidak bisa hapus keuangan', () => {
  const superadmin = RBAC_SEED_PERAN[0]
  assert.equal(bisaAkses(superadmin, RBAC_SEED_IZIN.superadmin, 'Keuangan Sekolah', 'hapus'), true)
  const guru = RBAC_SEED_PERAN.find(r => r.kunci === 'guru_pengajar')
  assert.equal(bisaAkses(guru, RBAC_SEED_IZIN.guru_pengajar, 'Keuangan Sekolah', 'lihat'), false)
  assert.equal(bisaAkses(guru, RBAC_SEED_IZIN.guru_pengajar, 'Manajemen CBT', 'hapus'), true)
  assert.equal(bisaAkses(null, null, 'Dashboard', 'lihat'), false)
})

cek('pemetaan judul menu ke modul', () => {
  assert.equal(modulDariJudul('Absensi guru & staff'), 'Absensi Guru')
  assert.equal(modulDariJudul('Manajemen CBT'), 'Manajemen CBT')
  assert.equal(modulDariJudul('Hak Akses (RBAC)'), 'Hak Akses (RBAC)')
  assert.equal(modulDariJudul('Profil saya'), null)
})

cek('pemetaan path: Log Aktivitas & Tabungan terjaga', () => {
  assert.equal(modulDariPath('/adminv2/log-aktivitas'), 'Log Aktivitas')
})

cek('pemetaan path ke modul (absensi-guru bukan absensi siswa)', () => {
  assert.equal(modulDariPath('/adminv2/absensi-guru'), 'Absensi Guru')
  assert.equal(modulDariPath('/adminv2/absensi'), 'Absensi Siswa')
  assert.equal(modulDariPath('/adminv2/modul-ajar/abc'), 'Modul Pembelajaran')
  assert.equal(modulDariPath('/adminv2/rbac'), 'Hak Akses (RBAC)')
  assert.equal(modulDariPath('/adminv2/profil'), null)
  assert.equal(modulDariPath('/adminv2'), 'Dashboard')
})


cek('sub-modul tanpa baris tersimpan mewarisi modul utama', () => {
  const izin = izinKosong()
  izin['Absensi Siswa'] = { lihat: true, buat: false, ubah: true, hapus: false }
  lengkapiSub(izin, k => k === 'Absensi Siswa/monitoring')
  assert.deepEqual(izin['Absensi Siswa/overview'], { lihat: true, buat: false, ubah: true, hapus: false })
  assert.deepEqual(izin['Absensi Siswa/monitoring'], { lihat: false, buat: false, ubah: false, hapus: false })
})

cek('baris modul utama = gabungan (OR) sub-modulnya', () => {
  const izin = terapkanCentang(izinKosong(), kunciSub('Manajemen CBT', 'bank'), 'buat', true)
  agregatModul(izin)
  assert.deepEqual(izin['Manajemen CBT'], { lihat: true, buat: true, ubah: false, hapus: false })
  assert.deepEqual(izin['LMS'], { lihat: false, buat: false, ubah: false, hapus: false })
})

cek('seed guru (brief): CBT lihat ujian/ruang/kartu, bank soal CRUD, LMS buat ujian harian', () => {
  const g = RBAC_SEED_IZIN.guru_pengajar
  assert.equal(g['Manajemen CBT/rooms'].lihat, true)
  assert.equal(g['Manajemen CBT/rooms'].buat, false)
  assert.equal(g['Manajemen CBT/exams'].ubah, false)
  assert.equal(g['Manajemen CBT/bank'].buat, true)
  assert.equal(g['Manajemen CBT/bank'].hapus, true)
  assert.equal(g['LMS/cards'].ubah, false)
  assert.equal(g['LMS/exams'].buat, true)
  assert.equal(RBAC_SEED_IZIN.superadmin['Manajemen CBT/rooms'].hapus, true)
})

cek('kunci izin = modul + semua sub-modul; daun tanpa modul yang punya sub', () => {
  const jumlahSub = Object.values(RBAC_SUBMODUL).reduce((n, a) => n + a.length, 0)
  assert.equal(RBAC_KUNCI.length, 24 + jumlahSub)
  assert.ok(!RBAC_DAUN.includes('Manajemen CBT'))
  assert.ok(RBAC_DAUN.includes('Dashboard') && RBAC_DAUN.includes('LMS/seb'))
})

cek('halaman Pembayaran = sub-modul Keuangan; Tiketing masuk RBAC', () => {
  assert.equal(modulDariPath('/adminV2/keuangan/pembayaran'), 'Keuangan Sekolah')
  assert.equal(subDariPath('/adminV2/keuangan/pembayaran'), 'pembayaran')
  assert.equal(subDariPath('/adminV2/keuangan'), null)
  assert.equal(modulDariPath('/adminV2/tiketing'), 'Tiketing')
  assert.equal(modulDariJudul('Tiketing'), 'Tiketing')
})

cek('switcher jenjang: hanya bila berjadwal di SMP & SMK, kecuali peran lintas jenjang', () => {
  const dua = ['SMK', 'SMP']
  assert.deepEqual(jenjangAkun(dua, false, ['SMP', 'SMK'], 'SMK'), ['SMK', 'SMP'])
  assert.deepEqual(jenjangAkun(dua, false, ['SMP'], 'SMK'), ['SMP'])
  assert.deepEqual(jenjangAkun(dua, false, [], 'SMP'), ['SMP'])
  assert.deepEqual(jenjangAkun(dua, false, [], null), ['SMK'])
  assert.deepEqual(jenjangAkun(['SMK'], false, ['SMP'], 'SMK'), ['SMP'])
  assert.deepEqual(jenjangAkun(dua, true, [], 'SMK'), ['SMK', 'SMP'])
  assert.deepEqual(jenjangAkun(['SMK'], true, [], null), ['SMK'])
  for (const kunci of ['superadmin', 'ketua_yayasan', 'kepala_sekolah', 'wakil_kepala_sekolah', 'operator', 'staff_adm']) assert.ok(lintasJenjang({ kunci }))
  assert.ok(!lintasJenjang({ kunci: 'guru_pengajar' }))
  assert.ok(!lintasJenjang({ kunci: 'khusus_bdbceee5' }))
})

console.log(`\n${lulus} tes lulus`)
