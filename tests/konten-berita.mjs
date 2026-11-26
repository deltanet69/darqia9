import assert from 'node:assert/strict'
import {
  buatSlug, sudahTayang, paragrafDariHtml, estimasiMenitBaca, labelTanggal,
  tanggalJakarta, tanggalEfektif, keBentukPublik, keBentukAdmin, normalisasiPayloadBerita
} from '../app/utils/kontenBerita.ts'

// Slug: huruf kecil, spasi & tanda baca jadi '-', aksen dilepas, tepi bersih.
assert.equal(buatSlug('SPMB 2027/2028 Dibuka: 7 Rombel!'), 'spmb-2027-2028-dibuka-7-rombel')
assert.equal(buatSlug('  Kegiatan Santri — Yanbu\'a  '), 'kegiatan-santri-yanbu-a')
assert.equal(buatSlug(''), 'berita')
assert.equal(buatSlug('!!!'), 'berita')

// Aturan tayang publik: Terbit selalu tampil; Terjadwal hanya setelah
// tanggal_jadwal lewat; Draft & Review tidak pernah tampil.
const kini = new Date('2026-11-27T01:00:00+07:00')
assert.equal(sudahTayang('Terbit', null, kini), true)
assert.equal(sudahTayang('Terjadwal', '2026-11-26T07:00:00+07:00', kini), true)
assert.equal(sudahTayang('Terjadwal', '2026-11-28T07:00:00+07:00', kini), false)
assert.equal(sudahTayang('Terjadwal', null, kini), false)
assert.equal(sudahTayang('Draft', '2026-11-26T07:00:00+07:00', kini), false)
assert.equal(sudahTayang('Review', '2026-11-26T07:00:00+07:00', kini), false)

// Paragraf dari HTML editor: ambil isi <p>, lepas tag sisipan, abaikan yang kosong.
assert.deepEqual(
  paragrafDariHtml('<p>Paragraf <b>pertama</b>.</p><p></p><p>Paragraf kedua &amp; terakhir.</p>'),
  ['Paragraf pertama.', 'Paragraf kedua & terakhir.']
)
assert.deepEqual(paragrafDariHtml(''), [])
assert.deepEqual(paragrafDariHtml('Teks polos satu baris.'), ['Teks polos satu baris.'])

// Estimasi baca: minimal 1 menit, ±200 kata per menit.
assert.equal(estimasiMenitBaca('<p>' + 'kata '.repeat(50) + '</p>'), 1)
assert.equal(estimasiMenitBaca('<p>' + 'kata '.repeat(450) + '</p>'), 3)

// Label & tanggal kalender selalu zona Jakarta.
assert.equal(labelTanggal('2026-10-04'), '4 Oktober 2026')
assert.equal(labelTanggal(null), '')
assert.equal(tanggalJakarta('2026-11-26T22:30:00.000Z'), '2026-11-27') // 05:30 WIB keesokan hari
assert.equal(tanggalJakarta('2026-11-26T10:00:00.000Z'), '2026-11-26')

// Tanggal efektif: Terbit -> tanggal_terbit; Terjadwal -> tanggal_jadwal.
assert.equal(tanggalEfektif({ status: 'Terbit', tanggal_terbit: '2026-10-04', tanggal_jadwal: null }), '2026-10-04')
assert.equal(tanggalEfektif({ status: 'Terjadwal', tanggal_terbit: null, tanggal_jadwal: '2026-12-01T01:00:00.000Z' }), '2026-12-01T01:00:00.000Z')

// Bentuk publik & admin dari satu baris website_articles yang sama.
const baris = {
  id: 'uuid-1', jenjang: 'SMK', judul: 'Judul Uji', subjudul: '', slug: 'judul-uji',
  kategori: 'Prestasi', status: 'Terbit', tanggal_terbit: '2026-10-04', tanggal_jadwal: null,
  penulis: 'Humas', penulis_peran: 'Tim Humas', ringkasan: 'Ringkasan uji.',
  isi_html: '<p>Isi satu.</p><p>Isi dua.</p>', gambar_url: '/asset/uji.webp',
  featured: true, tags: ['Uji'], kutipan_teks: 'Kutipan uji.', kutipan_penulis: 'Penulis Kutipan',
  views: 12, created_at: '2026-10-04T00:00:00+00:00', updated_at: '2026-10-05T00:00:00+00:00'
}
const publik = keBentukPublik(baris)
assert.equal(publik.slug, 'judul-uji')
assert.equal(publik.tanggal, '2026-10-04')
assert.deepEqual(publik.paragraf, ['Isi satu.', 'Isi dua.'])
assert.deepEqual(publik.kutipan, { teks: 'Kutipan uji.', penulis: 'Penulis Kutipan' })
assert.equal(publik.views, 12)
const admin = keBentukAdmin(baris)
assert.equal(admin.jenjang, 'SMK')
assert.equal(admin.gambarUrl, '/asset/uji.webp')
assert.equal(admin.isi, '<p>Isi satu.</p><p>Isi dua.</p>')
assert.equal(admin.featured, true)

// Normalisasi payload tulis: jenjang disimpan kapital sesuai batasan tabel;
// Terbit -> tanggal_terbit tanggal Jakarta; Terjadwal -> tanggal_jadwal ISO;
// kategori di luar enam resmi ditolak; featured di luar Terbit ditolak.
const ok = normalisasiPayloadBerita({ jenjang: 'smk', judul: 'Baru', penulis: 'Humas', kategori: 'Kegiatan', status: 'Terbit', tanggal: '2026-11-26T22:30:00.000Z', tags: 'a, b' })
assert.equal(ok.galat, undefined)
assert.equal(ok.data.jenjang, 'SMK')
assert.equal(ok.data.tanggal_terbit, '2026-11-27')
assert.equal(ok.data.tanggal_jadwal, null)
assert.deepEqual(ok.data.tags, ['a', 'b'])
const terjadwal = normalisasiPayloadBerita({ jenjang: 'SMP', judul: 'Nanti', penulis: 'Humas', kategori: 'Pengumuman', status: 'Terjadwal', tanggal: '2026-12-01T08:00:00+07:00' })
assert.equal(terjadwal.galat, undefined)
assert.equal(terjadwal.data.tanggal_jadwal, '2026-12-01T01:00:00.000Z')
assert.equal(terjadwal.data.tanggal_terbit, null)
assert.equal(normalisasiPayloadBerita({ jenjang: 'smk', judul: 'X', penulis: 'H', kategori: 'Kegiatan', status: 'Terjadwal' }).galat, 'Tanggal dan jam terbit terjadwal wajib diisi.')
assert.equal(normalisasiPayloadBerita({ jenjang: 'smk', judul: 'X', penulis: 'H', kategori: 'Kegiatan', status: 'Draft', featured: true }).galat, 'Berita unggulan hanya untuk status Terbit.')
assert.equal(normalisasiPayloadBerita({ jenjang: 'smk', judul: '', penulis: 'H', kategori: 'Kegiatan' }).galat, 'Judul konten wajib diisi.')
assert.equal(normalisasiPayloadBerita({ jenjang: 'tk', judul: 'X', penulis: 'H', kategori: 'Kegiatan' }).galat, 'Jenjang tidak valid.')
assert.ok(normalisasiPayloadBerita({ jenjang: 'smk', judul: 'X', penulis: 'H', kategori: 'Otomotif' }).galat.startsWith('Kategori harus salah satu dari:'))

console.log('konten-berita: semua tes lulus')
