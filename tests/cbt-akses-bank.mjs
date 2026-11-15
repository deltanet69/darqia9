// Tes aturan akses bank soal (cermin fungsi SQL bank_soal_boleh, migrasi 0066) — jalankan: node tests/cbt-akses-bank.mjs
import assert from 'node:assert/strict'
import { bolehAksesBank } from '../app/utils/cbtAksesBank.ts'

const bank = { ownerTeacherId: 'g1', classId: 'k1', grade: 'SMP' }
const akun = (o) => ({ superadmin: false, pimpinanJenjang: [], guruId: null, waliKelasIds: [], ...o })
assert.equal(bolehAksesBank(akun({ guruId: 'g1' }), bank), true, 'pemilik')
assert.equal(bolehAksesBank(akun({ guruId: 'g2' }), bank), false, 'guru lain')
assert.equal(bolehAksesBank(akun({ guruId: 'g2', waliKelasIds: ['k1'] }), bank), true, 'wali kelas itu')
assert.equal(bolehAksesBank(akun({ guruId: 'g2', waliKelasIds: ['k9'] }), bank), false, 'wali kelas lain')
assert.equal(bolehAksesBank(akun({ pimpinanJenjang: ['SMP'] }), bank), true, 'pimpinan jenjangnya')
assert.equal(bolehAksesBank(akun({ pimpinanJenjang: ['SMK'] }), bank), false, 'pimpinan jenjang lain')
assert.equal(bolehAksesBank(akun({ superadmin: true }), { ...bank, ownerTeacherId: null }), true, 'superadmin')
assert.equal(bolehAksesBank(akun({ guruId: 'g1' }), { ...bank, ownerTeacherId: null }), false, 'bank tanpa pemilik')
console.log('OK: akses bank soal')
