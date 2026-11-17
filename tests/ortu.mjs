// Uji logika murni Portal Orang Tua — jalankan: node --experimental-strip-types tests/ortu.mjs
import assert from 'node:assert/strict'
import { hitungSiswa } from '../app/composables/keuanganCore.ts'
import { jenisUjian, kontakDari, normalisasiWa, semesterDari, tingkatOrtu, validasiProfilOrtu } from '../app/composables/ortuCore.ts'
import { cocokSandiOrtu, galatSandiBaruOrtu, hashSandiOrtu, sandiAcakOrtu } from '../server/utils/ortuSandi.ts'

let lulus = 0
const cek = async (nama, fn) => { await fn(); lulus++; console.log('ok -', nama) }

await cek('profil: hanya wa/email/alamat, field lain ditolak', () => {
  assert.ok('galat' in validasiProfilOrtu({ wa: '081234567890', nama: 'X' }))
  assert.ok('galat' in validasiProfilOrtu({ student_id: 'abc' }))
  assert.ok('galat' in validasiProfilOrtu({}))
  assert.ok('galat' in validasiProfilOrtu(null))
  assert.ok('galat' in validasiProfilOrtu({ wa: 123 }))
  const ok = validasiProfilOrtu({ wa: '0812-3456-7890', email: ' Ortu@Mail.COM ', alamat: ' Jl.  Melati\n12 ' })
  assert.deepEqual(ok, { nilai: { wa: '6281234567890', email: 'ortu@mail.com', alamat: 'Jl. Melati 12' } })
  assert.deepEqual(validasiProfilOrtu({ email: '' }), { nilai: { email: null } })
  assert.ok('galat' in validasiProfilOrtu({ email: 'bukan-email' }))
  assert.ok('galat' in validasiProfilOrtu({ alamat: 'x'.repeat(301) }))
  assert.ok('galat' in validasiProfilOrtu({ wa: '' }))
})

await cek('nomor WA dinormalisasi ke 62', () => {
  assert.equal(normalisasiWa('081234567890'), '6281234567890')
  assert.equal(normalisasiWa('+6281234567890'), '6281234567890')
  assert.equal(normalisasiWa('6281234567890'), '6281234567890')
  assert.equal(normalisasiWa('0812'), null)
  assert.equal(normalisasiWa('08abc1234567'), null)
})

await cek('kontak milik ayah bila nama ayah ada, selain itu ibu', () => {
  assert.deepEqual(kontakDari({ father_name: 'Hendra', father_phone: '62811', mother_phone: '62822', address: 'A' }), { wa: '62811', email: '', alamat: 'A' })
  assert.deepEqual(kontakDari({ father_name: '', mother_phone: '62822', mother_email: 'i@x.id' }), { wa: '62822', email: 'i@x.id', alamat: '' })
})

await cek('tingkat: Belum Diset (nominal 0), Belum dirilis, dirilis; angka sama dengan hitungSiswa', () => {
  const paket = { kode: 'R', nama: 'Reguler', grade: 'SMK', nominal: [4500000, 5300000, 5300000, 0], aktif: true }
  const h = hitungSiswa(paket, [0, 0, 0, 0], [{ nis: '1', tingkat: null, dibayar: 3300000 }])
  const t = tingkatOrtu('SMK', h, new Set([0]))
  assert.deepEqual(t.map(x => x.label), ['Kelas X', 'Kelas XI', 'Kelas XII', 'Tingkat Akhir'])
  assert.deepEqual(t.map(x => x.keadaan), ['ok', 'belum', 'belum', 'noset'])
  assert.equal(t[0].sisa, 1200000)
  assert.equal(t[0].bayar, 3300000)
  assert.equal(tingkatOrtu('SMP', h, new Set())[0].label, 'Kelas VII')
  // waterfall: kelebihan bayar mengalir ke tingkat berikutnya
  const lebih = tingkatOrtu('SMK', hitungSiswa(paket, [0, 0, 0, 0], [{ nis: '1', tingkat: null, dibayar: 5000000 }]), new Set([0, 1]))
  assert.equal(lebih[0].sisa, 0)
  assert.equal(lebih[1].bayar, 500000)
})

await cek('semester & jenis ujian', () => {
  assert.deepEqual(semesterDari('2026-11-18'), { label: 'Ganjil 2026/2027', tahunAjaran: '2026/2027', dari: '2026-07-01', sampai: '2026-12-31' })
  assert.equal(semesterDari('2027-02-01').label, 'Genap 2026/2027')
  assert.equal(jenisUjian('pr'), 'PR')
  assert.equal(jenisUjian('tengah_semester'), 'PTS')
  assert.equal(jenisUjian('akhir'), 'PAS')
  assert.equal(jenisUjian('lain'), null)
})

await cek('hash sandi scrypt: cocok, salah ditolak, simpanan rusak ditolak', async () => {
  const h = await hashSandiOrtu('rahasia123')
  assert.match(h, /^scrypt\$16384\$8\$1\$/)
  assert.equal(await cocokSandiOrtu('rahasia123', h), true)
  assert.equal(await cocokSandiOrtu('rahasia124', h), false)
  assert.equal(await cocokSandiOrtu('rahasia123', 'scrypt$99999999$8$1$YQ==$YQ=='), false)
  assert.equal(await cocokSandiOrtu('x', ''), false)
  assert.notEqual(await hashSandiOrtu('rahasia123'), h) // salt acak
  assert.match(sandiAcakOrtu(), /^[A-HJ-NP-Za-hj-np-z2-9]{8}$/)
})

await cek('aturan kata sandi baru', () => {
  assert.ok(galatSandiBaruOrtu('pendek', '1287'))
  assert.ok(galatSandiBaruOrtu('12871287', '12871287'))
  assert.ok(galatSandiBaruOrtu('samasama1', '1287', 'samasama1'))
  assert.equal(galatSandiBaruOrtu('sandiBaru9', '1287', 'lama1234'), '')
})

console.log(`\n${lulus} uji lulus`)
