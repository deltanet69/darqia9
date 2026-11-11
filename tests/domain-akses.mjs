// Tes aturan akses domain — jalankan: node tests/domain-akses.mjs
import assert from 'node:assert/strict'
import { arahkanDomain as a, jenjangHost } from '../app/composables/domainCore.ts'

// Tidak dibatasi: localhost, staging Vercel, host asing
for (const h of ['localhost', 'darqia9.vercel.app', '127.0.0.1']) {
  for (const p of ['/', '/cbt', '/adminV2', '/spmb/smp', '/smk']) assert.equal(a(h, p), null, `${h}${p}`)
}

// Beranda tiap domain tampil sebagai "/" (bersih)
for (const h of ['darqiaattaqwa.sch.id', 'www.darqiaattaqwa.sch.id', 'smpitbca.sch.id', 'smkitattaqwa9.sch.id', 'spmb.smpitbca.sch.id', 'cbt.smkitattaqwa9.sch.id', 'perpus.smpitbca.sch.id', 'absen.smkitattaqwa9.sch.id']) assert.equal(a(h, '/'), null, h)
assert.equal(a('smpitbca.sch.id', '/smp'), '/')
assert.equal(a('smkitattaqwa9.sch.id', '/smk/'), '/')
// Portal: "/" TIDAK boleh jadi alias (penjaga login membaca path /admin*), harus dialihkan ke /adminV2
assert.equal(a('portal.darqiaattaqwa.sch.id', '/'), '/adminV2')
assert.equal(a('portal.darqiaattaqwa.sch.id', '/adminv2'), null)
assert.equal(a('portal.darqiaattaqwa.sch.id', '/adminV2'), null)
assert.equal(a('spmb.smpitbca.sch.id', '/spmb/smp'), '/')
assert.equal(a('spmb.smkitattaqwa9.sch.id', '/spmb'), '/')
assert.equal(a('cbt.smpitbca.sch.id', '/cbt'), '/')
assert.equal(a('perpus.smkitattaqwa9.sch.id', '/perpus'), '/')
assert.equal(a('absen.smpitbca.sch.id', '/absensi'), '/')

// Modul sendiri lolos
assert.equal(a('smpitbca.sch.id', '/akademik'), null)
assert.equal(a('smpitbca.sch.id', '/berita'), null)
assert.equal(a('smkitattaqwa9.sch.id', '/spmb'), null)
assert.equal(a('portal.darqiaattaqwa.sch.id', '/adminV2/cbt'), null)
assert.equal(a('portal.darqiaattaqwa.sch.id', '/admin/login'), null)

// Modul/jenjang lain dialihkan ke domain yang benar
assert.equal(a('smpitbca.sch.id', '/smk/akademik', '/smk/akademik?x=1'), 'https://smkitattaqwa9.sch.id/akademik?x=1')
// Web sekolah tanpa /smp dan /smk: awalan lama dialihkan ke path bersih
assert.equal(a('smpitbca.sch.id', '/smp/berita', '/smp/berita?p=2'), '/berita?p=2')
assert.equal(a('smkitattaqwa9.sch.id', '/smk/tentang'), '/tentang')
assert.equal(a('smkitattaqwa9.sch.id', '/smk', '/smk?x=1'), '/?x=1')
assert.equal(a('spmb.smpitbca.sch.id', '/spmb/smk'), 'https://spmb.smkitattaqwa9.sch.id/')
assert.equal(a('smpitbca.sch.id', '/cbt'), 'https://cbt.smpitbca.sch.id/')
assert.equal(a('smkitattaqwa9.sch.id', '/perpus'), 'https://perpus.smkitattaqwa9.sch.id/')
assert.equal(a('cbt.smkitattaqwa9.sch.id', '/spmb'), 'https://spmb.smkitattaqwa9.sch.id/')
assert.equal(a('cbt.smpitbca.sch.id', '/adminV2'), 'https://portal.darqiaattaqwa.sch.id/adminV2')
assert.equal(a('darqiaattaqwa.sch.id', '/smp'), 'https://smpitbca.sch.id/')
assert.equal(a('darqiaattaqwa.sch.id', '/smp/berita'), 'https://smpitbca.sch.id/berita')
assert.equal(a('darqiaattaqwa.sch.id', '/spmb/smk'), 'https://spmb.smkitattaqwa9.sch.id/')
assert.equal(a('smpitbca.sch.id', '/spmb/smp', '/spmb/smp?x=1'), 'https://spmb.smpitbca.sch.id/?x=1')
// Tanpa jenjang yang bisa ditebak: kembali ke beranda domain itu
assert.equal(a('darqiaattaqwa.sch.id', '/cbt'), '/')
assert.equal(a('portal.darqiaattaqwa.sch.id', '/perpus'), '/')

// Absensi per kelas: absen.<sekolah>/<kelas> (rute /absensi/<kelas> dialihkan ke /<kelas>)
assert.equal(a('absen.smpitbca.sch.id', '/kelas7a'), null)
assert.equal(a('absen.smkitattaqwa9.sch.id', '/absensi/10abc'), '/10abc')
assert.equal(a('absen.smkitattaqwa9.sch.id', '/absensi/10abc/'), '/10abc')

// Halaman verifikasi publik terbuka di semua domain; modul belum jadi diarahkan ke web yayasan
assert.equal(a('smpitbca.sch.id', '/verifikasi/tagihan/1'), null)
assert.equal(a('parent.smpitbca.sch.id', '/'), 'https://darqiaattaqwa.sch.id/')
assert.equal(a('absen.darqiaattaqwa.sch.id', '/absensi'), 'https://darqiaattaqwa.sch.id/')

// Awalan tidak boleh salah cocok (/smpx bukan /smp)
assert.equal(a('smpitbca.sch.id', '/smpx'), null)
console.log('ok domain')
