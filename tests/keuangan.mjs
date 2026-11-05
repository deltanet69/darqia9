// Uji logika murni Keuangan (keuanganCore.ts) — jalankan:
//   node --experimental-strip-types tests/keuangan.mjs
// Mencakup model WATERFALL (meeting 4 Nov 2026): pembayaran menempel ke
// siswa, alokasi menutup tingkat berurutan, kelebihan menjadi saldo.
import assert from 'node:assert/strict'
import {
  BAYAR_CONTOH, KETERANGAN_AWAL, PAKET_CONTOH, PENETAPAN_CONTOH, SISWA_CONTOH,
  alokasiWaterfall, formatTanggal, hitungSiswa, labelAliran, nomorHalaman, potongHalaman, rekapPerKelas,
  ringkasKeterangan, rp, saringSiswa, selisihHari, statusDari, terbilangRupiah, totalPaket
} from '../app/composables/keuanganCore.ts'

let lulus = 0
const cek = (nama, fn) => { fn(); lulus++; console.log('ok -', nama) }

const paket = kode => PAKET_CONTOH.find(p => p.kode === kode)
// Rekap model baru: total dibayar per NIS (tingkat tidak lagi dipakai).
const rekapDari = nis => {
  const total = BAYAR_CONTOH.filter(x => x.nis === nis).reduce((a, b) => a + b.nominal, 0)
  return total ? [{ nis, dibayar: total }] : []
}
const barisUntuk = nis => {
  const s = SISWA_CONTOH.find(x => x.nis === nis)
  const tetap = PENETAPAN_CONTOH.find(x => x.nis === nis)
  const hitung = hitungSiswa(paket(tetap.kode), tetap.tambahan, rekapDari(nis))
  return { ...s, kode: tetap.kode, tambahan: tetap.tambahan, hitung, statusBayar: statusDari(hitung) }
}
const anisa = barisUntuk('2324090134')

cek('Anisa: total tagihan 23.580.000 persis surat tagihan', () => assert.equal(anisa.hitung.total, 23580000))
cek('Anisa: total dibayar mentah 7.575.000 & sisa total 16.005.000', () => {
  assert.equal(anisa.hitung.totalBayar, 7575000)
  assert.equal(anisa.hitung.sisa, 16005000)
  assert.equal(anisa.hitung.saldo, 0)
})
cek('Anisa WATERFALL: seluruh 7.575.000 mengalir ke Tingkat 1 dulu', () => {
  assert.deepEqual(anisa.hitung.per.map(v => v.bayar), [7575000, 0, 0, 0])
  assert.deepEqual(anisa.hitung.per.map(v => v.sisa), [105000, 6400000, 9500000, 0])
})
cek('Anisa: persen total tetap 32,12%; persen Tingkat 1 = 98,63%', () => {
  assert.equal(anisa.hitung.persen.toFixed(2), '32.12')
  assert.equal(anisa.hitung.per[0].persen.toFixed(2), '98.63')
})
cek('Rekap baris per tingkat (view lama) dijumlahkan sama seperti total', () => {
  const perTingkat = [
    { nis: '2324090134', tingkat: 0, dibayar: 2325000 },
    { nis: '2324090134', tingkat: 1, dibayar: 925000 },
    { nis: '2324090134', tingkat: 2, dibayar: 4325000 }
  ]
  const h = hitungSiswa(paket('khllBv'), [0, 0, 0, 0], perTingkat)
  assert.equal(h.totalBayar, 7575000)
  assert.deepEqual(h.per.map(v => v.bayar), [7575000, 0, 0, 0])
})
cek('CONTOH MANAJEMEN: tagihan X 4,5jt dibayar 10jt -> X lunas, sisa mengalir ke XI', () => {
  const h = hitungSiswa({ kode: 'UJI', nama: 'Uji', grade: 'SMK', nominal: [4500000, 4000000, 0, 0], aktif: true }, [0, 0, 0, 0], [{ nis: 'X', dibayar: 10000000 }])
  assert.deepEqual(h.per.map(v => v.bayar), [4500000, 4000000, 0, 0])
  assert.equal(h.sisa, 0)
  assert.equal(h.saldo, 1500000)
  assert.equal(statusDari(h), 'Lunas')
})
cek('alokasiWaterfall murni: tuangan berurutan + saldo', () => {
  assert.deepEqual(alokasiWaterfall([100, 50, 50], 120), { per: [100, 20, 0], saldo: 0 })
  assert.deepEqual(alokasiWaterfall([100], 250), { per: [100], saldo: 150 })
  assert.deepEqual(alokasiWaterfall([0, 0], 75), { per: [0, 0], saldo: 75 })
})
cek('Bayar tanpa tagihan (belum pasang kode): semua jadi saldo', () => {
  const h = hitungSiswa(undefined, [0, 0, 0, 0], [{ nis: 'Y', dibayar: 500000 }])
  assert.equal(h.totalBayar, 500000)
  assert.equal(h.bayar, 0)
  assert.equal(h.saldo, 500000)
})
cek('Ringkas keterangan LIST: 1 item nama saja, banyak item diringkas', () => {
  assert.equal(ringkasKeterangan([{ keterangan: 'SPP', nominal: 500000 }]), 'SPP')
  assert.equal(ringkasKeterangan([{ keterangan: 'SPP', nominal: 1 }, { keterangan: 'Buku 1 Tahun', nominal: 2 }, { keterangan: 'OSIS 1 Tahun', nominal: 3 }]), 'SPP +2 keterangan lain')
  assert.equal(ringkasKeterangan([]), '')
})
cek('Label aliran: null = Waterfall, angka = tingkat historis', () => {
  assert.equal(labelAliran(null), 'Waterfall')
  assert.equal(labelAliran(0), 'Tk. 1')
  assert.equal(labelAliran(3), 'Tk. Akhir')
})
cek('Paket R-2627 total 18.225.000 (cocok laporan kelas X AK aplikasi lama)', () => assert.equal(totalPaket(paket('R-2627')), 18225000))
cek('Paket SSK-2627 total 13.100.000', () => assert.equal(totalPaket(paket('SSK-2627')), 13100000))
cek('Afra (R-2627) total 18.225.000', () => assert.equal(barisUntuk('26270120040').hitung.total, 18225000))
cek('Annisa Zefanya: tambahan 150.000 menaikkan total di atas master paket', () => {
  const b = barisUntuk('26270120123')
  assert.equal(b.hitung.per[0].tambahan, 150000)
  assert.equal(b.hitung.total, totalPaket(paket('SSK-2627')) + 150000)
})
cek('Bulan Kaiza lunas penuh -> status Lunas, tanpa saldo', () => {
  const b = barisUntuk('2324090138')
  assert.equal(b.hitung.sisa, 0)
  assert.equal(b.hitung.saldo, 0)
  assert.equal(b.statusBayar, 'Lunas')
})
cek('Keterangan resmi TANPA Tabungan', () => {
  assert.equal(KETERANGAN_AWAL.length, 8)
  assert.ok(!KETERANGAN_AWAL.some(k => /tabung/i.test(k)))
})
cek('Terbilang kwitansi K3 Anisa', () => assert.equal(terbilangRupiah(4325000), 'Empat juta tiga ratus dua puluh lima ribu Rupiah'))
cek('Format Rupiah & tanggal Indonesia', () => {
  assert.equal(rp(16005000), 'Rp 16.005.000')
  assert.equal(formatTanggal('2026-11-03'), '03 Nov 2026')
  assert.equal(selisihHari('2026-09-15', '2026-09-18'), 4)
})
cek('Saring NIS menemukan Anisa; urut sisa terbesar menaruh Cindy (belum bayar) di atas', () => {
  const semua = SISWA_CONTOH.filter(s => s.grade === 'SMK').map(s => barisUntuk(s.nis))
  const hasil = saringSiswa(semua, { cari: '2324090134' })
  assert.equal(hasil.length, 1)
  assert.equal(hasil[0].nama, 'Anisa Febryanti')
  assert.equal(saringSiswa(semua, { urut: 'sisa' })[0].nis, '2324090145')
  assert.equal(saringSiswa(semua, {})[0].hitung.sisa, 23580000)
})
cek('Rekap per kelas: Alumni - AKL menjumlah 3 siswa', () => {
  const semua = SISWA_CONTOH.filter(s => s.grade === 'SMK').map(s => barisUntuk(s.nis))
  const alumni = rekapPerKelas(semua).find(r => r.kelas === 'Alumni - AKL')
  assert.equal(alumni.siswa, 3)
  assert.equal(alumni.tagihan, 23580000 * 3)
})
cek('Siswa tanpa paket: total 0 & status Belum Bayar (bukan error)', () => {
  const h = hitungSiswa(undefined, [0, 0, 0, 0], [])
  assert.equal(h.total, 0)
  assert.equal(statusDari(h), 'Belum Bayar')
})
cek('Pagination: 413 baris per 25 -> 17 halaman, halaman terakhir 13 baris', () => {
  const items = Array.from({ length: 413 }, (_, i) => i + 1)
  const h1 = potongHalaman(items, 1, 25)
  assert.equal(h1.totalHalaman, 17)
  assert.equal(h1.rows.length, 25)
  assert.equal(h1.dari, 1)
  assert.equal(h1.sampai, 25)
  const h17 = potongHalaman(items, 17, 25)
  assert.equal(h17.rows.length, 13)
  assert.equal(h17.dari, 401)
  assert.equal(h17.sampai, 413)
})
cek('Pagination: halaman di luar rentang dijepit; daftar kosong aman', () => {
  const items = Array.from({ length: 30 }, (_, i) => i)
  assert.equal(potongHalaman(items, 99, 25).halaman, 2)
  assert.equal(potongHalaman(items, 0, 25).halaman, 1)
  const kosong = potongHalaman([], 3, 25)
  assert.equal(kosong.totalHalaman, 1)
  assert.equal(kosong.rows.length, 0)
  assert.equal(kosong.dari, 0)
})
cek('Nomor halaman pager: jendela maks 5 menempel tepi', () => {
  assert.deepEqual(nomorHalaman(1, 17), [1, 2, 3, 4, 5])
  assert.deepEqual(nomorHalaman(9, 17), [7, 8, 9, 10, 11])
  assert.deepEqual(nomorHalaman(17, 17), [13, 14, 15, 16, 17])
  assert.deepEqual(nomorHalaman(2, 3), [1, 2, 3])
})

console.log(`\n${lulus} uji lulus`)
