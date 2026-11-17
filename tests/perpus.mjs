// Uji logika murni Perpustakaan Digital (perpusCore.ts) — jalankan:
//   node --experimental-strip-types tests/perpus.mjs
import assert from 'node:assert/strict'
import {
  akhirPekanWib, bacaKatalog, bersihkanData, gabungBaca, bukuDariBaris, cocokkanBuku, jalurPdfAman, jenjangDariTeks, normalisasiBaris,
  formatBerkas, parseKisi, persenBaca, rapikanForm, urlSampul, terbukaUntuk, tingkatDariKelas, tingkatDariLabel
} from '../app/composables/perpusCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

const dasar = { Judul: 'Informatika Kelas X', 'Penulis / Penerbit': 'Tim / Kemendikdasmen', Jenjang: 'SMK', Kelas: 'Kelas X', 'Mapel / Kategori': 'Informatika', Jenis: 'Buku teks', 'Kurikulum / Sumber': 'Merdeka', 'Status Legal': 'Boleh di-host', 'Akses Baca': 'Setiap hari', 'Slug File': 'informatika-x', 'Path PDF (rencana)': 'smk/informatika-x.pdf' }

cek('form admin: valid, wajib judul+jenjang, status terlarang ditolak', () => {
  const ok = rapikanForm({ judul: ' Fisika X ', jenjang: ['SMK', 'XXX'], kelas_label: 'Kelas X', mapel: 'Fisika', akhir_pekan: true })
  assert.equal(ok.baris.judul, 'Fisika X')
  assert.deepEqual(ok.baris.jenjang, ['SMK'])
  assert.deepEqual(ok.baris.tingkat_kelas, [10])
  assert.equal(ok.baris.akses_baca, 'Sabtu–Minggu')
  assert.ok(rapikanForm({ judul: '', jenjang: ['SMP'] }).galat)
  assert.ok(rapikanForm({ judul: 'A', jenjang: [] }).galat)
  assert.equal(rapikanForm({ judul: 'A', jenjang: ['SMP'], sinopsis: ' Ringkas ' }).baris.sinopsis, 'Ringkas')
  assert.equal('status_legal' in ok.baris, false) // form tidak menimpa status legal hasil impor
})

cek('format berkas dari ekstensi path', () => {
  assert.equal(formatBerkas('unggah/a.epub'), 'epub')
  assert.equal(formatBerkas('smk/a.pdf'), 'pdf')
  assert.equal(formatBerkas(''), 'pdf')
})

cek('urlSampul memetakan nama berkas ke endpoint publik', () => {
  assert.equal(urlSampul(''), '')
  assert.equal(urlSampul('sampul/a-1.jpg'), '/api/perpus/sampul/a-1.jpg')
})

cek('baris katalog normal dibaca lengkap', () => {
  const r = normalisasiBaris(dasar, 'Buku Teks', 1)
  assert.equal(r.id, 'informatika-x')
  assert.deepEqual(r.jenjang, ['SMK'])
  assert.deepEqual(r.tingkat_kelas, [10])
  assert.equal(r.pengarang, 'Tim')
  assert.equal(r.penerbit, 'Kemendikdasmen')
  assert.equal(r.path_pdf, 'smk/informatika-x.pdf')
  assert.equal(r.akhir_pekan, false)
})

cek('Tidak boleh di-host, UNVERIFIED, dan sheet terlarang tidak jadi koleksi', () => {
  assert.equal(normalisasiBaris({ ...dasar, 'Status Legal': 'Tidak boleh di-host' }, '', 1), null)
  assert.equal(normalisasiBaris({ ...dasar, 'Status Legal': 'UNVERIFIED' }, '', 1), null)
  assert.equal(normalisasiBaris({ ...dasar, Kurikulum: 'UNVERIFIED - cek lisensi' }, '', 1), null)
  assert.equal(normalisasiBaris(dasar, 'Tidak Boleh Di-host', 1), null)
  assert.equal(normalisasiBaris({ ...dasar, Judul: '' }, '', 1), null)
})

cek('manga/komik: akhir pekan dari sheet atau kolom Akses Baca', () => {
  assert.equal(normalisasiBaris(dasar, 'Manga Komik Weekend', 1).akhir_pekan, true)
  assert.equal(normalisasiBaris({ ...dasar, 'Akses Baca': 'Hanya Sabtu-Minggu' }, 'Buku Teks', 1).akhir_pekan, true)
})

cek('nama kolom tidak peka huruf besar/kecil dan tanda baca', () => {
  const r = normalisasiBaris({ judul: 'X', JENJANG: 'SMP', 'status legal': 'ok', 'path pdf (rencana)': '/srv/darqia/perpus/smp/x.pdf' }, '', 1)
  assert.equal(r.path_pdf, 'smp/x.pdf')
})

cek('jenjang: SMP/SMK/keduanya, jenjang lain dibuang', () => {
  assert.deepEqual(jenjangDariTeks('SMP'), ['SMP'])
  assert.deepEqual(jenjangDariTeks('SMP & SMK'), ['SMP', 'SMK'])
  assert.deepEqual(jenjangDariTeks('Semua'), ['SMP', 'SMK'])
  assert.deepEqual(jenjangDariTeks(''), ['SMP', 'SMK'])
  assert.deepEqual(jenjangDariTeks('SD'), [])
})

cek('kelas: romawi, angka, rentang, kosong', () => {
  assert.deepEqual(tingkatDariLabel('Kelas VII – IX'), [7, 8, 9])
  assert.deepEqual(tingkatDariLabel('Kelas 10-12'), [10, 11, 12])
  assert.deepEqual(tingkatDariLabel('X, XII'), [10, 12])
  assert.deepEqual(tingkatDariLabel('Kelas XI'), [11])
  assert.deepEqual(tingkatDariLabel('Semua kelas'), [])
  assert.deepEqual(tingkatDariLabel(''), [])
  assert.deepEqual(tingkatDariLabel('E'), [10])
  assert.deepEqual(tingkatDariLabel('Fase D'), [7, 8, 9])
  assert.deepEqual(tingkatDariLabel('D1'), [7, 8, 9])
  assert.deepEqual(tingkatDariLabel('F'), [11, 12])
  assert.deepEqual(tingkatDariLabel('—'), [])
})

cek('tingkat dari nama kelas Data Induk', () => {
  assert.equal(tingkatDariKelas('XI TKJ 1', 'SMK'), 11)
  assert.equal(tingkatDariKelas('VIII A', 'SMP'), 8)
  assert.equal(tingkatDariKelas('', 'SMP'), 7)
})

cek('jalur PDF aman: tanpa .., absolut, atau drive', () => {
  assert.equal(jalurPdfAman('smk/a.pdf'), 'smk/a.pdf')
  assert.equal(jalurPdfAman('/srv/darqia/perpus/smk/a.pdf'), 'smk/a.pdf')
  assert.equal(jalurPdfAman('../etc/passwd'), '')
  assert.equal(jalurPdfAman('smk/../../x.pdf'), '')
  assert.equal(jalurPdfAman('C:/x.pdf'), '')
  assert.equal(jalurPdfAman(''), '')
})

cek('akhir pekan memakai WIB (UTC+7), bukan UTC', () => {
  assert.equal(akhirPekanWib(new Date('2026-11-13T16:59:00Z')), false) // Jumat 23.59 WIB
  assert.equal(akhirPekanWib(new Date('2026-11-13T17:00:00Z')), true) // Sabtu 00.00 WIB
  assert.equal(akhirPekanWib(new Date('2026-11-15T16:59:00Z')), true) // Minggu 23.59 WIB
  assert.equal(akhirPekanWib(new Date('2026-11-15T17:00:00Z')), false) // Senin 00.00 WIB
})

cek('buku manga terkunci hari kerja, terbuka Sabtu', () => {
  const r = normalisasiBaris(dasar, 'Manga Komik Weekend', 1)
  assert.equal(bukuDariBaris(r, true, new Date('2026-11-17T05:00:00Z')).terkunci, true) // Selasa
  assert.equal(bukuDariBaris(r, true, new Date('2026-11-14T05:00:00Z')).terkunci, false) // Sabtu
})

cek('akses per jenjang dan kelas', () => {
  const r = normalisasiBaris(dasar, '', 1)
  assert.equal(terbukaUntuk(r, { jenjang: 'SMK', tingkat: 10 }), true)
  assert.equal(terbukaUntuk(r, { jenjang: 'SMK', tingkat: 11 }), false)
  assert.equal(terbukaUntuk(r, { jenjang: 'SMP', tingkat: 10 }), false)
  assert.equal(terbukaUntuk({ jenjang: ['SMP', 'SMK'], tingkat_kelas: [] }, { jenjang: 'SMP', tingkat: 8 }), true)
})

cek('katalog dari larik dan dari objek per sheet; id kembar diberi akhiran', () => {
  assert.equal(bacaKatalog([dasar, { ...dasar, Judul: 'Lain', 'Slug File': 'informatika-x' }]).length, 2)
  const k = bacaKatalog({ 'Buku Teks': [dasar], 'Tidak Boleh Di-host': [dasar], 'Manga Komik Weekend': [{ ...dasar, Judul: 'Manga A', 'Slug File': 'manga-a' }] })
  assert.equal(k.length, 2)
  assert.equal(new Set(bacaKatalog([dasar, dasar]).map(x => x.id)).size, 2)
  assert.equal(k.find(x => x.id === 'manga-a').akhir_pekan, true)
})

cek('kisi-kisi: judul materi + indikator, bullet tanpa judul', () => {
  const t = parseKisi('**1. Jaringan Komputer**\n- Menjelaskan jenis jaringan\n- Menentukan topologi\n\nAlamat IP:\n- Memahami subnet mask')
  assert.equal(t.length, 2)
  assert.equal(t[0].t, 'Jaringan Komputer')
  assert.equal(t[0].i, 'Menjelaskan jenis jaringan; Menentukan topologi')
  assert.equal(t[1].t, 'Alamat IP')
  const b = parseKisi('- Pilar berpikir komputasional\n- Struktur algoritma')
  assert.deepEqual(b.map(x => x.t), ['Pilar berpikir komputasional', 'Struktur algoritma'])
  assert.deepEqual(parseKisi(''), [])
})

cek('kisi-kisi: topik dicocokkan ke buku lewat judul/mapel', () => {
  const buku = [
    { id: 'a', judul: 'Dasar Jaringan Komputer', mapel: 'Informatika' },
    { id: 'b', judul: 'Matematika Dasar', mapel: 'Matematika' }
  ]
  const hasil = cocokkanBuku({ t: 'Topologi jaringan', i: 'Menentukan topologi' }, 'Informatika', buku)
  assert.equal(hasil[0].id, 'a')
  assert.ok(!hasil.some(x => x.id === 'b'))
})

cek('data siswa dari klien dibersihkan dan dibatasi', () => {
  const d = bersihkanData({
    fav: ['a', 5, 'b'], tema: 'neon', fs: 999,
    baca: { a: { i: 3, n: 10, ts: 1 }, b: 'rusak' },
    tandai: [{ id: 'a', i: 1, teks: 'x'.repeat(900), cat: 'c', r: [[0.1, 0.2, 0.3, 0.1], [1, 2]], ts: 1 }, { teks: 'tanpa id' }],
    rk: { a: 'rangkuman' }, kisi: { 'k:0': true, 'k:1': 'ya' }, nbaca: ['n1', 2]
  })
  assert.deepEqual(d.fav, ['a', 'b'])
  assert.equal(d.tema, 'terang')
  assert.equal(d.fs, 28)
  assert.equal(d.baca.a.n, 10)
  assert.equal(d.baca.b.i, 0)
  assert.equal(d.tandai.length, 1)
  assert.equal(d.tandai[0].teks.length, 400)
  assert.equal(d.tandai[0].r.length, 1)
  assert.deepEqual(d.kisi, { 'k:0': true })
  assert.deepEqual(d.nbaca, ['n1'])
  assert.deepEqual(bersihkanData(null).fav, [])
  assert.deepEqual(bersihkanData('x').tandai, [])
})

cek('persen baca dari halaman terakhir', () => {
  const d = bersihkanData({ baca: { a: { i: 4, n: 10, ts: 1 } } })
  assert.equal(persenBaca(d, 'a'), 50)
  assert.equal(persenBaca(d, 'z'), 0)
})

cek('halaman terakhir tidak mundur oleh data usang perangkat lain', () => {
  const lama = { a: { i: 40, n: 100, ts: 200 }, b: { i: 3, n: 10, ts: 50 } }
  const baru = { a: { i: 5, n: 100, ts: 100 }, c: { i: 1, n: 9, ts: 10 } }
  const h = gabungBaca(lama, baru)
  assert.equal(h.a.i, 40)
  assert.equal(h.b.i, 3)
  assert.equal(h.c.i, 1)
  assert.equal(gabungBaca({ a: { i: 2, n: 9, ts: 1 } }, { a: { i: 7, n: 9, ts: 5 } }).a.i, 7)
})

console.log(`\n${lulus} kelompok uji lulus`)
