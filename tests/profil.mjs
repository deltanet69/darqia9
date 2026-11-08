// Tes fungsi murni Profil Saya — jalankan: node --experimental-strip-types tests/profil.mjs
import assert from 'node:assert'
import {
  inisial, maskNum, tanggalIndo, bangunProfil, hitungKelengkapan, validasiUbah,
  daftarAplikasi, ringkasHak, perangkatDari, sesiLogin, aktivitasTampil,
  formatWaktuWib, ukuranKompres, EMAIL_UTAMA
} from '../app/composables/profilCore.ts'
import { RBAC_MODUL, RBAC_SEED_IZIN } from '../app/composables/rbacCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

const akun = { id: 'u1', email: 'budi@smk.sch.id', name: 'Budi', aktif: true, avatarUrl: '', tema: 0, prefs: null }
const guru = {
  id: 'g1', name: 'Budi Hartono, S.Kom', nip: null, nuptk: '4752768643130010', nik: '3216071411780010',
  email: 'budi@smk.sch.id', phone: '081290000010', gender: 'L', birth_place: 'Bekasi', birth_date: '1978-11-14',
  address: 'Jl. Kenanga No. 10', kelurahan: 'Bahagia', kecamatan: 'Babelan', kab_kota: 'Kab. Bekasi',
  education: 'Sarjana', asal_institusi: 'Universitas X', rfid_uid: '04A3F29B', subject: 'Produktif TKJ',
  position: 'Guru Mapel', grade: 'SMK', employment_status: 'Aktif', jenis_nomor: 'NUPTK'
}

cek('inisial melewati gelar depan dan belakang', () => {
  assert.equal(inisial('H. Muhammad Ridwan Hakim'), 'MR')
  assert.equal(inisial('Budi Hartono, S.Kom'), 'BH')
  assert.equal(inisial(''), '?')
})

cek('maskNum menyamarkan nomor panjang, nomor pendek apa adanya', () => {
  assert.equal(maskNum('3216071411780010'), '321607••••••0010')
  assert.equal(maskNum('12345'), '12345')
  assert.equal(maskNum(''), '-')
})

cek('tanggalIndo mengubah ISO ke dd-mm-yyyy, tidak valid jadi tanda strip', () => {
  assert.equal(tanggalIndo('1978-11-14'), '14-11-1978')
  assert.equal(tanggalIndo(null), '-')
  assert.equal(tanggalIndo('bukan-tanggal'), '-')
})

cek('bangunProfil memakai data guru milik akun, kosong jadi strip, tanpa data dummy', () => {
  const p = bangunProfil(akun, guru, 'Guru Pengajar')
  assert.equal(p.name, 'Budi Hartono, S.Kom')
  assert.equal(p.nip, '-')
  assert.equal(p.nuptk, '4752768643130010')
  assert.equal(p.jk, 'Laki laki')
  assert.equal(p.tgl, '14-11-1978')
  assert.equal(p.unit, 'SMK IT Attaqwa 9')
  assert.equal(p.roleSys, 'Guru Pengajar')
  assert.equal(p.roleLabel, 'Guru Mapel')
  assert.equal(p.akun, 'Aktif')
  assert.equal(p.adaGuru, true)
})

cek('bangunProfil tanpa baris guru: pakai data akun, field kepegawaian strip, adaGuru false', () => {
  const p = bangunProfil({ ...akun, name: 'Naufal Hamidy' }, null, 'Superadmin Utama')
  assert.equal(p.name, 'Naufal Hamidy')
  assert.equal(p.email, 'budi@smk.sch.id')
  assert.equal(p.nik, '-')
  assert.equal(p.rfid, '-')
  assert.equal(p.adaGuru, false)
})

cek('unit Yayasan dan SMP dipetakan ke nama lengkap', () => {
  assert.equal(bangunProfil(akun, { ...guru, grade: 'SMP' }, '').unit, 'SMP IT Bina Cendekia Assalam')
  assert.equal(bangunProfil(akun, { ...guru, grade: 'Yayasan' }, '').unit, 'Yayasan Darqia Attaqwa')
})

cek('akun nonaktif tampil Nonaktif', () => {
  assert.equal(bangunProfil({ ...akun, aktif: false }, guru, '').akun, 'Nonaktif')
})

cek('hitungKelengkapan: nomor pegawai cukup salah satu (NIP atau NUPTK)', () => {
  const p = bangunProfil({ ...akun, avatarUrl: 'x.webp' }, guru, '')
  const k = hitungKelengkapan(p)
  assert.equal(k.pct, 100)
  assert.deepEqual(k.missing, [])
})

cek('hitungKelengkapan menyebut field yang belum terisi', () => {
  const p = bangunProfil(akun, { ...guru, nuptk: null, nip: null, phone: '', rfid_uid: null }, '')
  const k = hitungKelengkapan(p)
  assert.deepEqual(k.missing.sort(), ['Foto Profil', 'NIP/NUPTK', 'No. WhatsApp', 'RFID'].sort())
  assert.equal(k.pct, 60)
})

cek('validasiUbah: alamat dan WhatsApp wajib valid', () => {
  const awal = { nip: '', nuptk: '4752768643130010', phone: '081290000010', address: 'Jl. A', kelurahan: '', kecamatan: '', kab_kota: '' }
  assert.match(validasiUbah({ ...awal, address: ' ' }, awal).galat, /Alamat/)
  assert.match(validasiUbah({ ...awal, phone: '0812' }, awal).galat, /WhatsApp/)
  const ok = validasiUbah({ ...awal, address: ' Jl. B ', kelurahan: ' Bahagia ' }, awal)
  assert.equal(ok.galat, '')
  assert.equal(ok.nilai.address, 'Jl. B')
  assert.equal(ok.nilai.kelurahan, 'Bahagia')
})

cek('validasiUbah: NIP 18 digit dan NUPTK 16 digit, hanya dicek bila berubah', () => {
  const awal = { nip: '12345', nuptk: '', phone: '081290000010', address: 'Jl. A', kelurahan: '', kecamatan: '', kab_kota: '' }
  // NIP lama tidak standar tapi tidak diubah: simpan alamat tetap boleh
  assert.equal(validasiUbah({ ...awal, address: 'Jl. Baru' }, awal).galat, '')
  assert.match(validasiUbah({ ...awal, nip: '999' }, awal).galat, /NIP/)
  assert.match(validasiUbah({ ...awal, nuptk: '12ab' }, awal).galat, /NUPTK/)
  assert.equal(validasiUbah({ ...awal, nip: '198001012005011001', nuptk: '4752768643130010' }, awal).galat, '')
})

cek('validasiUbah mengabaikan field di luar daftar putih', () => {
  const awal = { nip: '', nuptk: '', phone: '081290000010', address: 'Jl. A', kelurahan: '', kecamatan: '', kab_kota: '' }
  const hasil = validasiUbah({ ...awal, nik: '1', rfid_uid: 'X', position: 'Kepala' }, awal)
  assert.deepEqual(Object.keys(hasil.nilai).sort(), ['address', 'kab_kota', 'kecamatan', 'kelurahan', 'nip', 'nuptk', 'phone'])
})

cek('ringkasHak: empat aksi = Penuh, selain itu urut Lihat Buat Ubah Hapus', () => {
  assert.equal(ringkasHak({ lihat: true, buat: true, ubah: true, hapus: true }), 'Penuh')
  assert.equal(ringkasHak({ lihat: true, buat: false, ubah: false, hapus: false }), 'Lihat')
  assert.equal(ringkasHak({ lihat: true, buat: true, ubah: true, hapus: false }), 'Lihat · Buat · Ubah')
})

cek('daftarAplikasi hanya memuat modul dengan izin Lihat, persis checklist RBAC', () => {
  const izin = RBAC_SEED_IZIN.guru_pengajar
  const daftar = daftarAplikasi({ terkunci: false, izin })
  const diharapkan = RBAC_MODUL.filter(m => izin[m].lihat)
  assert.deepEqual(daftar.map(a => a.modul), diharapkan)
  assert.ok(!daftar.some(a => a.modul === 'Keuangan Sekolah'))
  assert.equal(daftar.find(a => a.modul === 'Agenda Mengajar').hak, 'Penuh')
  assert.equal(daftar.find(a => a.modul === 'Dashboard').hak, 'Lihat')
})

cek('daftarAplikasi peran terkunci (Superadmin) = 23 modul semua Penuh', () => {
  const daftar = daftarAplikasi({ terkunci: true, izin: null })
  assert.equal(daftar.length, 23)
  assert.ok(daftar.every(a => a.hak === 'Penuh'))
})

cek('daftarAplikasi tanpa peran = kosong (tidak ada akses yang ditampilkan)', () => {
  assert.deepEqual(daftarAplikasi({ terkunci: false, izin: null }), [])
})

cek('EMAIL_UTAMA sama dengan Superadmin Utama di server', () => {
  assert.equal(EMAIL_UTAMA, 'betadev94@gmail.com')
})

cek('perangkatDari membaca browser dan sistem operasi', () => {
  assert.equal(perangkatDari('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'), 'Chrome (Windows)')
  assert.equal(perangkatDari('Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'), 'Chrome (Android)')
  assert.equal(perangkatDari('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'), 'Edge (Windows)')
  assert.equal(perangkatDari('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'), 'Safari (iOS)')
  assert.equal(perangkatDari('Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0'), 'Firefox (Linux)')
  assert.equal(perangkatDari(''), 'Perangkat tidak dikenal')
})

cek('sesiLogin: 3 login terakhir, terbaru dulu, perangkat dari detail', () => {
  const logs = [
    { modul: 'Sistem', aksi: 'login', detail: 'Masuk ke portal admin · Chrome (Windows)', created_at: '2026-11-01T01:00:00Z' },
    { modul: 'Sistem', aksi: 'logout', detail: 'Keluar', created_at: '2026-11-08T01:00:00Z' },
    { modul: 'Sistem', aksi: 'login', detail: 'Masuk ke portal admin · Chrome (Android)', created_at: '2026-11-05T01:00:00Z' },
    { modul: 'Sistem', aksi: 'login', detail: 'Masuk ke portal admin', created_at: '2026-11-03T01:00:00Z' },
    { modul: 'Sistem', aksi: 'login', detail: 'Masuk ke portal admin · Edge (Windows)', created_at: '2026-11-07T01:00:00Z' }
  ]
  const s = sesiLogin(logs, 3)
  assert.equal(s.length, 3)
  assert.deepEqual(s.map(x => x.perangkat), ['Edge (Windows)', 'Chrome (Android)', 'Perangkat tidak tercatat'])
  assert.equal(s[0].waktu, '2026-11-07T01:00:00Z')
})

cek('formatWaktuWib memakai zona Asia/Jakarta', () => {
  assert.equal(formatWaktuWib('2026-10-24T23:58:00Z'), 'Minggu, 25 Okt 2026 · 06:58 WIB')
  assert.equal(formatWaktuWib(null), '-')
})

cek('aktivitasTampil: judul dari detail, cadangan dari aksi + modul', () => {
  const a = aktivitasTampil([
    { modul: 'Sistem', aksi: 'login', detail: 'Masuk ke portal admin', created_at: '2026-10-24T23:58:00Z' },
    { modul: 'Keuangan', aksi: 'cetak', detail: '', created_at: '2026-10-24T22:00:00Z' }
  ])
  assert.equal(a[0].judul, 'Masuk ke portal admin')
  assert.equal(a[1].judul, 'Cetak — Keuangan')
  assert.equal(a[0].waktu, 'Minggu, 25 Okt 2026 · 06:58 WIB')
})

cek('ukuranKompres: potong persegi dari tengah, kecilkan ke maks, tidak memperbesar', () => {
  assert.deepEqual(ukuranKompres(4000, 3000, 512), { sx: 500, sy: 0, sw: 3000, sh: 3000, dw: 512, dh: 512 })
  assert.deepEqual(ukuranKompres(300, 400, 512), { sx: 0, sy: 50, sw: 300, sh: 300, dw: 300, dh: 300 })
})

console.log(`\n${lulus} tes lulus`)
