// Tes kisi-kisi AI bank soal — jalankan: node tests/cbt-kisi-kisi.mjs
import assert from 'node:assert/strict'

globalThis.createError = ({ statusCode, statusMessage }) => Object.assign(new Error(statusMessage), { statusCode })
const { buatKisiKisi } = await import('../server/utils/cbtKisiKisi.ts')

const klien = (bank, soal) => {
  const log = { dibaca: [], diubah: [] }
  return {
    log,
    from(tabel) {
      const q = {
        select: () => q, eq: () => q, order: () => q,
        maybeSingle: async () => { log.dibaca.push(tabel); return { data: bank, error: null } },
        update: (nilai) => { log.diubah.push([tabel, nilai]); return { eq: async () => ({ error: null }) } },
        then: (res) => { log.dibaca.push(tabel); return Promise.resolve({ data: soal, error: null }).then(res) }
      }
      return q
    }
  }
}
const bank = { id: 'b1', name: 'Bab 1', description: 'Frasa', subject: 'Bahasa Indonesia', grade: 'SMP', kisi_kisi: 'lama' }
const soal = [
  { text: 'Apa itu frasa?', type: 'PG', answer_key: 'KUNCI-RAHASIA', rubric: null, story_text: null },
  { text: 'Jelaskan frasa nominal.', type: 'Esai', answer_key: '', rubric: 'RUBRIK-RAHASIA', story_text: 'Cerita' }
]

// (a) otomatis + sudah ada isi: tidak memanggil AI, tidak menimpa
let dipanggil = 0
const c1 = klien(bank, soal)
const h1 = await buatKisiKisi({ client: c1, source: 'ujian_harian', bankId: 'b1', mode: 'otomatis', panggilAi: async () => { dipanggil++; return 'baru' } })
assert.deepEqual(h1, { kisiKisi: 'lama', dilewati: true })
assert.equal(dipanggil, 0)
assert.equal(c1.log.diubah.length, 0)

// (b) ulang: AI dipanggil tanpa kunci/rubrik, hasil disimpan ke tabel bank sesuai sumber
let prompt = ''
const c2 = klien(bank, soal)
const h2 = await buatKisiKisi({ client: c2, source: 'ujian_harian', bankId: 'b1', mode: 'ulang', panggilAi: async (p) => { prompt = p; return '  Kisi-kisi baru  ' } })
assert.equal(h2.kisiKisi, 'Kisi-kisi baru')
assert.ok(prompt.includes('Apa itu frasa?') && prompt.includes('Bab 1'))
assert.ok(!prompt.includes('KUNCI-RAHASIA') && !prompt.includes('RUBRIK-RAHASIA'), 'kunci & rubrik tidak dikirim ke AI')
assert.deepEqual(c2.log.diubah, [['ujian_harian_banks', { kisi_kisi: 'Kisi-kisi baru' }]])

// otomatis + kosong: dibuat
const c3 = klien({ ...bank, kisi_kisi: null }, soal)
assert.equal((await buatKisiKisi({ client: c3, source: 'cbt', bankId: 'b1', mode: 'otomatis', panggilAi: async () => 'K' })).kisiKisi, 'K')
assert.equal(c3.log.diubah[0][0], 'question_banks')

// (c) bank tidak terbaca (RLS: bukan pemilik) -> 404
await assert.rejects(buatKisiKisi({ client: klien(null, []), source: 'cbt', bankId: 'x', mode: 'ulang', panggilAi: async () => 'K' }), e => e.statusCode === 404)
console.log('OK: kisi-kisi AI')
