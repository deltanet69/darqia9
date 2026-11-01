// Tes fungsi murni RBAC — jalankan: node --experimental-strip-types tests/rbac.mjs
import assert from 'node:assert'
import {
  RBAC_MODUL, RBAC_SEED_IZIN, RBAC_SEED_PERAN, hitungIzin, izinKosong,
  terapkanCentang, kolomPenuh, penugasanDari, dalamCakupan, bisaAkses,
  modulDariJudul, modulDariPath
} from '../app/composables/rbacCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

cek('23 modul, 9 peran bawaan, superadmin terkunci', () => {
  assert.equal(RBAC_MODUL.length, 23)
  assert.equal(RBAC_SEED_PERAN.length, 9)
  assert.equal(RBAC_SEED_PERAN[0].kunci, 'superadmin')
  assert.equal(RBAC_SEED_PERAN[0].terkunci, true)
})

cek('jumlah izin bawaan sesuai preview v6 yang disetujui', () => {
  assert.equal(hitungIzin(RBAC_SEED_IZIN.superadmin), 92)
  assert.equal(hitungIzin(RBAC_SEED_IZIN.ketua_yayasan), 21)
  assert.equal(hitungIzin(RBAC_SEED_IZIN.kepala_sekolah), 28)
  assert.equal(hitungIzin(RBAC_SEED_IZIN.wakil_kepala_sekolah), 22)
  assert.equal(hitungIzin(RBAC_SEED_IZIN.operator), 73)
  assert.equal(hitungIzin(RBAC_SEED_IZIN.staff_adm), 30)
  assert.equal(hitungIzin(RBAC_SEED_IZIN.wali_kelas), 10)
  assert.equal(hitungIzin(RBAC_SEED_IZIN.guru_pengajar), 25)
  assert.equal(hitungIzin(RBAC_SEED_IZIN.staff_sekolah), 13)
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
  assert.equal(kolomPenuh(RBAC_SEED_IZIN.operator, 'lihat'), true)
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

cek('pemetaan path ke modul (absensi-guru bukan absensi siswa)', () => {
  assert.equal(modulDariPath('/adminv2/absensi-guru'), 'Absensi Guru')
  assert.equal(modulDariPath('/adminv2/absensi'), 'Absensi Siswa')
  assert.equal(modulDariPath('/adminv2/modul-ajar/abc'), 'Modul Pembelajaran')
  assert.equal(modulDariPath('/adminv2/rbac'), 'Hak Akses (RBAC)')
  assert.equal(modulDariPath('/adminv2/profil'), null)
  assert.equal(modulDariPath('/adminv2'), 'Dashboard')
})

console.log(`\n${lulus} tes lulus`)
