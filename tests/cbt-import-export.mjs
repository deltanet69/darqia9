// Tes ekspor/impor bank soal (Excel, CSV, Word) — jalankan: node tests/cbt-import-export.mjs
import assert from 'node:assert/strict'
import { buildBankExcel, readExcelBankTemplate } from '../app/utils/cbtExcelBank.ts'
import { cocokKelas } from '../app/utils/cbtKelas.ts'
import { buildBankCsv } from '../app/utils/cbtCsvBank.ts'
import { decodeXml, fields, linesFromXml } from '../app/utils/cbtWordBank.ts'

let lulus = 0
const cek = async (nama, fn) => { await fn(); lulus++; console.log('ok -', nama) }

const paket = (grade) => {
  const huruf = grade === 'SMP' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']
  const opsi = prefix => huruf.map(key => ({ key, text: `${prefix} ${key}` }))
  return {
    id: 'PKG-1', code: 'X', classroom: 'X AK', subject: 'Matematika', grade, difficulty: 'Sukar',
    teacherName: 'Budi Hartono, S.Kom', updatedAt: 'x', hasInteractive: true,
    questions: [
      { id: 'q1', number: 1, type: 'PG', difficulty: 'Mudah', text: 'Hitung $x^{2}$ pada C# "kode" =1\nbaris kedua', key: 'B', options: opsi('Opsi'), isRtl: false },
      { id: 'q2', number: 2, type: 'PG', difficulty: 'Sedang', text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ', key: ['A', 'C'], isMultiSelect: true, options: opsi('Pilih'), isRtl: true },
      { id: 'q3', number: 3, type: 'Esai', difficulty: 'Sukar', text: 'Jelaskan nilai pi', key: '', rubric: 'Skor 3 jika benar', isRtl: false },
      { id: 'q4', number: 4, type: 'Esai', difficulty: 'Sedang', text: 'Jelaskan $$\\frac{a}{b}$$', key: '', rubric: 'Skor 4 jika lengkap; skor 2 jika sebagian', isRtl: false },
      { id: 'q5', number: 5, type: 'Interaktif', difficulty: 'Sedang', text: 'Tonton video', key: ['A', 'B'], isMultiSelect: true, options: opsi('Video'), mediaType: 'video', mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', interactiveAnswerType: 'PG_Multi', isRtl: false },
      { id: 'q6', number: 6, type: 'Interaktif', difficulty: 'Mudah', text: 'Dengar audio', key: 'jawaban', mediaType: 'audio', mediaUrl: 'https://contoh.sch.id/audio.mp3', interactiveAnswerType: 'Isian', isRtl: false },
      { id: 'q7', number: 7, type: 'PG', difficulty: 'Sedang', text: 'Lihat gambar', key: 'D', options: opsi('Gbr'), imageUrl: 'https://contoh.sch.id/gambar.png', isRtl: false },
      { id: 'q8', number: 8, type: 'PG', difficulty: 'Sedang', text: 'Gambar tertanam', key: 'A', options: opsi('Tertanam'), imageUrl: 'data:image/webp;base64,' + 'A'.repeat(40000), isRtl: false }
    ]
  }
}

for (const grade of ['SMP', 'SMK']) {
  await cek(`Excel ${grade}: ekspor lalu impor mengembalikan seluruh soal tanpa perubahan`, async () => {
    const pkg = paket(grade)
    const { blob, fileName, gambarDilewati } = await buildBankExcel(pkg)
    assert.equal(gambarDilewati, 1)
    assert.ok(fileName.endsWith('.xlsx'))
    const file = new File([await blob.arrayBuffer()], fileName)
    const hasil = await readExcelBankTemplate(file, grade, ['X AK'], ['Matematika'])
    assert.deepEqual(hasil.issues, [])
    assert.equal(hasil.package.teacherName, pkg.teacherName)
    assert.equal(hasil.package.difficulty, 'Sukar')
    assert.equal(hasil.package.questions.length, 8)
    hasil.package.questions.forEach((q, i) => {
      const asli = pkg.questions[i]
      assert.equal(q.type, asli.type, `tipe soal ${i + 1}`)
      assert.equal(q.text, asli.text, `teks soal ${i + 1}`)
      assert.equal(q.difficulty, asli.difficulty)
      assert.deepEqual(q.key, asli.key, `kunci soal ${i + 1}`)
      assert.deepEqual(q.options, asli.options, `opsi soal ${i + 1}`)
      assert.equal(Boolean(q.isRtl), asli.isRtl, `RTL soal ${i + 1}`)
      assert.equal(q.rubric, asli.rubric)
      assert.equal(q.mediaType, asli.mediaType)
      assert.equal(q.mediaUrl, asli.mediaUrl)
      assert.equal(q.interactiveAnswerType, asli.interactiveAnswerType)
      assert.equal(Boolean(q.isMultiSelect), Boolean(asli.isMultiSelect))
      assert.equal(q.imageUrl, asli.imageUrl?.startsWith('http') ? asli.imageUrl : undefined, `gambar soal ${i + 1}`)
    })
  })
}

await cek('Excel: soal bertipe Isian ditolak per baris, soal lain tetap terimpor', async () => {
  const pkg = paket('SMK')
  pkg.questions[2] = { id: 'q3', number: 3, type: 'Isian', difficulty: 'Sukar', text: 'Nilai pi?', key: '3,14', isRtl: false }
  const { blob, fileName } = await buildBankExcel(pkg)
  const hasil = await readExcelBankTemplate(new File([await blob.arrayBuffer()], fileName), 'SMK', ['X AK'], ['Matematika'])
  assert.equal(hasil.issues.length, 1)
  assert.match(hasil.issues[0].message, /Isian sudah tidak dipakai/)
  assert.equal(hasil.package.questions.length, 7)
})

await cek('Excel: jenjang, kelas, dan mapel yang tidak cocok ditolak dengan pesan jelas', async () => {
  const { blob, fileName } = await buildBankExcel(paket('SMK'))
  const file = new File([await blob.arrayBuffer()], fileName)
  await assert.rejects(readExcelBankTemplate(file, 'SMP', ['X AK'], ['Matematika']), /untuk SMK/)
  await assert.rejects(readExcelBankTemplate(file, 'SMK', ['X TKJ 1'], ['Matematika']), /KELAS/)
  await assert.rejects(readExcelBankTemplate(file, 'SMK', ['X AK'], ['Fisika']), /MATA_PELAJARAN/)
})

await cek('CSV: semua pilihan, kunci, rubrik ikut; # dan kutip aman; sel berawalan = diberi apostrof', async () => {
  const pkg = paket('SMK')
  pkg.questions.push({ id: 'q9', number: 9, type: 'Isian', difficulty: 'Sedang', text: '=HYPERLINK("x")', key: '-1', isRtl: false })
  const { csv, fileName, gambarDilewati } = buildBankCsv(pkg)
  assert.equal(gambarDilewati, 1)
  assert.ok(csv.startsWith('﻿"No","Tipe"'))
  assert.ok(csv.includes('"Pilihan E"'))
  assert.ok(csv.includes('Hitung $x^{2}$ pada C# ""kode"" =1\nbaris kedua'), 'teks utuh termasuk # dan baris baru')
  assert.ok(csv.includes('"Skor 4 jika lengkap; skor 2 jika sebagian"'), 'rubrik esai ikut')
  assert.ok(csv.includes('"A, C"'), 'kunci multi')
  assert.ok(csv.includes('"\'=HYPERLINK(""x"")"'), 'perlindungan rumus Excel')
  assert.ok(!csv.includes('data:image'))
  assert.equal(fileName, 'Bank_Soal_Matematika_X AK.csv')
})

await cek('Word: decodeXml tidak mendekode ganda (&amp;lt; tetap teks &lt;)', () => {
  assert.equal(decodeXml('a &amp;lt; b'), 'a &lt; b')
  assert.equal(decodeXml('5 &lt; 7 &amp; 8 &gt; 2'), '5 < 7 & 8 > 2')
  assert.equal(decodeXml('x&#8217;y &#x2019;'), 'x’y ’')
})

await cek('Word: pindah baris dan tab dalam paragraf dipertahankan', () => {
  const xml = '<w:p><w:r><w:t>baris 1</w:t><w:br/><w:t>baris 2</w:t><w:tab/><w:t xml:space="preserve">x</w:t></w:r></w:p><w:p><w:r><w:t>  </w:t></w:r></w:p><w:p><w:r><w:t>B</w:t></w:r></w:p>'
  assert.deepEqual(linesFromXml(xml), ['baris 1\nbaris 2 x', 'B'])
})

await cek('Word: pertanyaan beberapa paragraf tidak terpotong, baris berkolon biasa jadi lanjutan', () => {
  const f = fields([
    'NO: 1', 'TIPE: PG', 'PERTANYAAN: Perhatikan kode berikut',
    'Contoh: x = 1', 'print(x)',
    'PILIHAN_A: satu', 'PILIHAN_B: dua', 'KUNCI: A'
  ])
  assert.equal(f.PERTANYAAN, 'Perhatikan kode berikut\nContoh: x = 1\nprint(x)')
  assert.equal(f.PILIHANA, 'satu')
  assert.equal(f.KUNCI, 'A')
  assert.equal(f.CONTOH, undefined)
})

await cek('Word: kolom satu baris tidak menyerap teks lain; penanda --- dan banner BLOK SOAL memutus lanjutan', () => {
  const meta = fields(['JENJANG: SMP', 'KESULITAN_PAKET: Sukar', 'Aturan Pengisian', '1. Gunakan 4 pilihan: A, B'])
  assert.equal(meta.KESULITANPAKET, 'Sukar')
  const esai = fields(['NO: 3', 'TIPE: Esai', 'PERTANYAAN: Jelaskan', 'paragraf kedua', 'RUBRIK: Skor penuh', 'lanjutan rubrik', '---', 'BLOK SOAL 4 · INTERAKTIF'])
  assert.equal(esai.PERTANYAAN, 'Jelaskan\nparagraf kedua')
  assert.equal(esai.RUBRIK, 'Skor penuh\nlanjutan rubrik')
  const pg = fields(['KUNCI: A,C', 'MODE_PG: Multi', 'BLOK SOAL 3 · ESAI', '---'])
  assert.equal(pg.MODEPG, 'Multi')
  const tanpaPemisah = fields(['RUBRIK: Skor', 'BLOK SOAL 5 · PG'])
  assert.equal(tanpaPemisah.RUBRIK, 'Skor')
})


await cek('KELAS template dicocokkan toleran terhadap penulisan (8.4 = VIII.4, spasi tak terlihat, huruf kecil)', () => {
  const daftar = ['7.1', '8.4', 'VIII.A', 'X RPL 1', 'XI AKL']
  assert.equal(cocokKelas('8.4', daftar), '8.4')
  assert.equal(cocokKelas(' 8.4 ', daftar), '8.4')
  assert.equal(cocokKelas('8,4'.replace(',', '.'), daftar), '8.4')
  assert.equal(cocokKelas('VIII-4', daftar), '8.4')
  assert.equal(cocokKelas('viii a', daftar), 'VIII.A')
  assert.equal(cocokKelas('8 A', daftar), 'VIII.A')
  assert.equal(cocokKelas('10 rpl 1', daftar), 'X RPL 1')
  assert.equal(cocokKelas('X-RPL-1', daftar), 'X RPL 1')
  assert.equal(cocokKelas('9.4', daftar), null)
  assert.equal(cocokKelas('', daftar), null)
  assert.equal(cocokKelas('8.4', ['8.4', 'VIII.4']), '8.4', 'persis menang bila ada dua kelas sepadan')
  assert.equal(cocokKelas('8-4', ['8.4', 'VIII.4']), null, 'ambigu ditolak, bukan ditebak')
})

await cek('Word: Rumus Word (OMML), simbol font, dan pangkat terbaca, tidak lagi kosong', () => {
  const r = t => `<w:r><w:t>${t}</w:t></w:r>`
  const mr = t => `<m:r><w:rPr><w:rFonts w:ascii="Cambria Math"/></w:rPr><m:t>${t}</m:t></m:r>`
  const p = isi => `<w:p><w:pPr><w:spacing/></w:pPr>${isi}</w:p>`
  const xml = [
    p(r('PILIHAN_A: ') + `<m:oMath>${mr('15')}<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${mr('3')}</m:e></m:rad></m:oMath>`),
    p(r('PILIHAN_B: ') + `<m:oMathPara><m:oMath><m:f><m:num>${mr('1')}</m:num><m:den>${mr('3')}</m:den></m:f><m:rad><m:deg/><m:e>${mr('3')}</m:e></m:rad></m:oMath></m:oMathPara>`),
    p(r('PILIHAN_C: ') + '<w:r><w:sym w:font="Symbol" w:char="F0A5"/></w:r>'),
    p(r('PERTANYAAN: Cos 30') + '<w:r><w:rPr><w:vertAlign w:val="superscript"/></w:rPr><w:t>0</w:t></w:r>' + r(' = …')),
    p(r('PILIHAN_D: ') + `<m:oMath><m:sSup><m:e>${mr('x')}</m:e><m:sup>${mr('2')}</m:sup></m:sSup>${mr('+')}<m:d><m:dPr><m:begChr m:val="{"/><m:endChr m:val="}"/></m:dPr><m:e>${mr('a_b')}</m:e></m:d></m:oMath>`)
  ].join('')
  assert.deepEqual(linesFromXml(xml), [
    String.raw`PILIHAN_A: $15\sqrt{3}$`,
    String.raw`PILIHAN_B: $\frac{1}{3}\sqrt{3}$`,
    'PILIHAN_C: ∞',
    'PERTANYAAN: Cos 30$^{0}$ = …',
    'PILIHAN_D: $' + String.raw`{x}^{2}+\{a\_b\}` + '$'
  ])
})
console.log(`\n${lulus} tes lulus`)
