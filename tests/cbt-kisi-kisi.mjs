// Tes kisi-kisi AI bank soal (terstruktur Bloom, migrasi 0095) — jalankan: node tests/cbt-kisi-kisi.mjs
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
const bank = { id: 'b1', name: 'Bab 1', description: 'Frasa', subject: 'Bahasa Indonesia', grade: 'SMP', kisi_kisi: 'lama', kisi_butir: [] }
const soal = [
  { text: 'Apa itu frasa?', type: 'PG', number: 1, answer_key: 'KUNCI-RAHASIA', rubric: null, story_text: null },
  { text: 'Jelaskan frasa nominal.', type: 'Esai', number: 2, answer_key: '', rubric: 'RUBRIK-RAHASIA', story_text: 'Cerita' }
]
const jsonAi = JSON.stringify([
  { materi: 'Frasa', level: 'C2', kko: 'Menjelaskan', indikator: 'pengertian frasa nominal dengan kata-katanya sendiri.', soal: [2] },
  { materi: 'Frasa', level: 'C1', kko: 'Menyebutkan', indikator: 'pengertian frasa.', soal: [1] }
])

// (a) otomatis + teks lama sudah ada: tidak memanggil AI, tidak menimpa
let dipanggil = 0
const c1 = klien(bank, soal)
const h1 = await buatKisiKisi({ client: c1, source: 'ujian_harian', bankId: 'b1', mode: 'otomatis', panggilAi: async () => { dipanggil++; return jsonAi } })
assert.equal(h1.dilewati, true)
assert.equal(h1.kisiKisi, 'lama')
assert.deepEqual(h1.butir, [])
assert.equal(dipanggil, 0)
assert.equal(c1.log.diubah.length, 0)

// (a2) otomatis + butir terstruktur sudah ada: dilewati dengan butir itu
const butirAda = [{ materi: 'Frasa', indikator: 'pengertian frasa.', level: 'C1', kko: 'Menyebutkan', soal: [1] }]
const c1b = klien({ ...bank, kisi_kisi: null, kisi_butir: butirAda }, soal)
const h1b = await buatKisiKisi({ client: c1b, source: 'cbt', bankId: 'b1', mode: 'otomatis', panggilAi: async () => { dipanggil++; return jsonAi } })
assert.equal(h1b.dilewati, true)
assert.deepEqual(h1b.butir, butirAda)
assert.equal(dipanggil, 0)

// (b) ulang: AI dipanggil tanpa kunci/rubrik; butir divalidasi + diurutkan C1->C6; disimpan ke tabel sesuai sumber
let prompt = ''
const c2 = klien(bank, soal)
const h2 = await buatKisiKisi({ client: c2, source: 'ujian_harian', bankId: 'b1', mode: 'ulang', panggilAi: async (p) => { prompt = p; return jsonAi } })
assert.deepEqual(h2.butir.map(b => b.level), ['C1', 'C2'])
assert.ok(prompt.includes('Apa itu frasa?') && prompt.includes('Bab 1') && prompt.includes('TAKSONOMI BLOOM'))
assert.ok(!prompt.includes('KUNCI-RAHASIA') && !prompt.includes('RUBRIK-RAHASIA'), 'kunci & rubrik tidak dikirim ke AI')
assert.equal(c2.log.diubah.length, 1)
assert.equal(c2.log.diubah[0][0], 'ujian_harian_banks')
assert.deepEqual(c2.log.diubah[0][1].kisi_butir, h2.butir)
assert.ok(c2.log.diubah[0][1].kisi_kisi.includes('[C1] Siswa dapat menyebutkan pengertian frasa. (Soal no. 1)'))

// (b2) ulang: keluaran AI bukan JSON terstruktur -> 502, tidak menyimpan apa pun
const c2b = klien(bank, soal)
await assert.rejects(
  buatKisiKisi({ client: c2b, source: 'cbt', bankId: 'b1', mode: 'ulang', panggilAi: async () => 'teks bebas tanpa json' }),
  e => e.statusCode === 502
)
assert.equal(c2b.log.diubah.length, 0)

// (c) otomatis + kosong: dibuat dan disimpan ke question_banks untuk sumber cbt
const c3 = klien({ ...bank, kisi_kisi: null }, soal)
const h3 = await buatKisiKisi({ client: c3, source: 'cbt', bankId: 'b1', mode: 'otomatis', panggilAi: async () => jsonAi })
assert.equal(h3.butir.length, 2)
assert.equal(c3.log.diubah[0][0], 'question_banks')

// (d) bank tidak terbaca (RLS: bukan pemilik) -> 404
await assert.rejects(buatKisiKisi({ client: klien(null, []), source: 'cbt', bankId: 'x', mode: 'ulang', panggilAi: async () => jsonAi }), e => e.statusCode === 404)
console.log('OK: kisi-kisi AI terstruktur Bloom')
