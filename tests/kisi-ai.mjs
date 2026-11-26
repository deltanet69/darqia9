// Tes generator kisi-kisi AI: pengurai keluaran AI + isi prompt Bloom.
// Jalankan: node tests/kisi-ai.mjs (fungsi murni dari app/utils/kisiBloom.ts;
// buatKisiKisi di server/utils/cbtKisiKisi.ts butuh konteks Nuxt sehingga tidak dipanggil di sini.)
import assert from 'node:assert/strict'
import { uraiButirAi, promptKisiKisiBloom } from '../app/utils/kisiBloom.ts'

const sah = new Set([1, 2, 3, 4, 5])
const kotor = 'Berikut kisi-kisinya:\n```json\n[{"materi":"Eksponen","level":"C3","kko":"Menyelesaikan","indikator":"soal pertumbuhan bakteri.","soal":[4,5,99]},{"materi":"Eksponen","level":"C1","kko":"Menyebutkan","indikator":"sifat-sifat bilangan berpangkat.","soal":[1]},{"materi":"Ngawur","level":"C5","kko":"Menghitung","indikator":"tidak selevel.","soal":[2]}]\n```\nSemoga membantu.'
const hasil = uraiButirAi(kotor, sah)
assert.equal(hasil.length, 2) // butir dengan KKO tak selevel dibuang
assert.deepEqual(hasil.map(b => b.level), ['C1', 'C3']) // terurut menaik C1 -> C6
assert.deepEqual(hasil[1].soal, [4, 5]) // nomor 99 karangan AI dibuang
assert.equal(uraiButirAi('tidak ada json sama sekali', sah).length, 0)
assert.equal(uraiButirAi('{"bukan":"array"}', sah).length, 0)
assert.equal(uraiButirAi('[]', sah).length, 0)

// Prompt: memuat tabel KKO Bloom, aturan JSON, dan nomor soal asli dari bank.
const prompt = promptKisiKisiBloom(
  { grade: 'SMK', subject: 'Matematika', name: 'PAS Ganjil', description: '' },
  [{ number: 7, type: 'PG', text: 'Hasil dari 2^3 adalah...', story_text: '' }, { number: 9, type: 'PG', text: 'Sifat logaritma...', story_text: '' }]
)
assert.ok(prompt.includes('TAKSONOMI BLOOM'))
assert.ok(prompt.includes('C1 (Mengingat): Menyebutkan'))
assert.ok(prompt.includes('C6 (Menciptakan): Merancang'))
assert.ok(prompt.includes('JSON array murni'))
assert.ok(prompt.includes('7. (PG) Hasil dari 2^3'))
assert.ok(prompt.includes('9. (PG) Sifat logaritma'))
assert.ok(!prompt.includes('kunci jawaban') || prompt.includes('Jangan menuliskan jawaban'))

console.log('kisi-ai: semua tes lulus')
