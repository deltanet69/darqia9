# Brief — Keuangan Sekolah Darqia 9

Disetujui pemilik 3 Nov 2026 (preview v2 di-approve, perintah eksekusi dengan
tiga syarat: styling sesuai admin portal, data terintegrasi benar, query
ringan & instan tanpa overengineering).

## Aturan produk

1. Keuangan hanya SATU menu. Tidak ada Tabungan, tidak ada mega menu khusus
   untuk halaman ini. Grup Keuangan di header berisi satu item:
   "Keuangan sekolah" → `/adminV2/keuangan`.
2. Konsep FLAT: tagihan per Tingkat 1/2/3 (+Tingkat Akhir) nominalnya
   ditentukan manajemen lewat Kode Keuangan berdasarkan tahun masuk, tercatat
   sampai siswa lulus (SMP/SMK).
3. NIS adalah ID resmi pembayaran siswa dari masuk sampai lulus.
4. Sub-menu (tab di dalam halaman) persis 5: Overview, Data Keuangan,
   Kode Keuangan, Cut-off Harian, Riwayat Pembayaran.
5. Yang dilipat (bukan menu sendiri): Input Pembayaran (pencarian NIS di
   Overview + tombol Bayar di rincian siswa), Keterangan Bayar & Biaya
   Tambahan (setup di Kode Keuangan / rincian siswa), Laporan Rekap per
   Kelas (blok di Overview), Riwayat Cut-off (di dalam Cut-off Harian).

## Integritas data

- Data siswa narik dari Data Induk (tabel `students`, kunci (grade, nis)
  mengikuti index unik 0012). Keuangan hanya memasang Kode Keuangan —
  tidak membuat siswa baru.
- Total Tagihan = Nominal Master (kode) + Biaya Tambahan per siswa.
- Total Dibayar SELALU dihitung dari Riwayat Pembayaran (view agregat
  `keuangan_rekap`), tidak pernah disimpan sebagai angka terpisah.
- Pembayaran melebihi sisa tingkat ditolak; paket yang sudah dipakai tidak
  bisa dihapus (hanya dinonaktifkan); Tingkat Akhir belum diset tampil
  "Belum Diset", bukan Rp 0; transaksi yang sudah cut-off TERKUNCI
  (trigger database menolak ubah/hapus).

## Keringanan query (syarat pemilik)

- Daftar & overview membaca view agregat (maks 4 baris per siswa) + kolom
  students seperlunya; tidak pernah memindai seluruh riwayat.
- Himpunan kecil dimuat sekali per grade dan disimpan di state bersama —
  pindah tab tidak mengunduh ulang.
- Riwayat global terpaginasi di server (maks 100 baris per muat, filter
  tanggal/metode/pencarian di server); rincian pembayaran dimuat per NIS
  (query terindeks (grade, nis, tanggal)).

## Implementasi

- Halaman: `app/pages/adminV2/keuangan/index.vue` di shell AdminV2 bersama
  (SistemPageShell diperluas prop opsional grupLabel/routeId, perilaku lama
  tidak berubah), breadcrumb Portal Admin / Keuangan / Keuangan Sekolah.
- Komponen: `app/components/adminV2/keuangan/` (Manager, Detail, Bayar,
  Kode, Cutoff, Riwayat, Cetak).
- Data: `app/composables/keuanganCore.ts` (logika murni + data contoh lokal)
  dan `useKeuangan.ts` (Supabase + fallback mode contoh lokal).
- Skema: `supabase/migrations/0026_keuangan.sql` — WAJIB dijalankan manual
  di Supabase SQL Editor. Sebelum dijalankan, halaman menampilkan mode
  contoh lokal berlabel jelas; sesudahnya otomatis memakai data asli.
- Akses: rute sudah terdaftar di RBAC (`PATH_KE_MODUL` → modul
  "Keuangan Sekolah"); RLS membatasi tabel untuk pengguna terotentikasi.
- Notifikasi wali: tombol di rincian membuka WhatsApp dengan teks otomatis
  dari angka rincian yang sama (gateway WA server = tahap berikutnya).

## Pembaruan — 4 Nov 2026 (perintah pemilik)

1. **Input Pembayaran global**: tombol "+ Input Pembayaran" selalu tampil di
   header halaman Keuangan (semua tab). Popup-nya: cari Nama/NIS -> tagihan
   siswa tampil per tingkat (Total/Dibayar/Sisa) -> pilih pembayaran untuk
   tingkat & keterangan apa -> submit -> layar berhasil berisi nomor
   kwitansi + tombol input berikutnya. Komponen yang sama
   (`KeuanganBayar.vue`) tetap dipakai Rincian Siswa (prop siswa terisi,
   alur lama tidak berubah: tersimpan -> cetak kwitansi).
2. **Pagination Data Keuangan**: daftar siswa kini terpaginasi
   (25/50/100 per halaman, pager Sebelumnya/Berikutnya + nomor halaman
   jendela 5) mengikuti listing lain; filter/pencarian/urut/jenjang/ganti
   ukuran halaman mengembalikan ke halaman 1. Logika murni
   `potongHalaman` + `nomorHalaman` di keuanganCore (teruji).
3. **CRUD Cut-off Harian**: selain Buat (RPC 0026), catatan cut-off kini
   bisa **Ubah** (penanggung jawab serah + status bukti serah; rentang/trx/
   total terkunci karena berasal dari transaksi) dan **Hapus** — menghapus
   cut-off membuka kembali seluruh transaksinya dan dana dianggap belum
   diserahkan ke keuangan pusat. Hapus berjalan lewat RPC baru
   `keuangan_hapus_cutoff` (migrasi **0027_keuangan_cutoff_crud.sql**,
   dijalankan manual setelah 0026): trigger penjaga kunci 0026 diganti
   versi sadar konteks yang hanya menembus kunci bila penanda
   transaksi-lokal dinyalakan fungsi RPC itu.

## Pembaruan — Meeting Manajemen 4 Nov 2026 (butir Keuangan, migrasi 0030)

1. **Halaman Pembayaran** (sub-menu baru di grup Keuangan, rute
   `/adminV2/keuangan/pembayaran`): petugas mencari NIS/Nama di sini,
   klik siswa -> Rincian Keuangan Siswa. Tombol Input Pembayaran di
   halaman Keuangan kini mengarah ke halaman ini — TIDAK ada popup lagi.
2. **Rincian 2 kolom**: kiri = kartu detail siswa + form input pembayaran
   (nempel, bukan popup); kanan = rincian tagihan & pembayaran + riwayat.
3. **Release Tagihan** menggantikan tombol "Kirim notifikasi ke wali":
   per (siswa, tingkat), tersimpan di `keuangan_rilis_tagihan`. Notifikasi
   ke Portal Orang Tua menyusul setelah portal itu dibangun.
4. **Keterangan dinamis model LIST**: satu pembayaran = banyak item
   keterangan (combobox: pilih dari master atau ketik manual; keterangan
   baru otomatis masuk master). Item tersimpan di
   `keuangan_pembayaran_item`; kolom keterangan induk = ringkasannya.
5. **Pembayaran menempel ke siswa (WATERFALL)**: tidak ada pilihan
   tingkat; `hitungSiswa` mengalokasikan total riwayat berurutan ke
   Tingkat 1 -> 2 -> 3 -> Akhir; kelebihan = saldo (`HitunganSiswa.saldo`).
   Ganti Kode Keuangan hanya mengubah total tagihan; terbayar tidak
   berubah. Kolom tingkat pembayaran baru = null (anotasi historis lama
   dipertahankan, tidak dipakai hitungan).
6. **Cut-off = TUNAI saja**: `keuangan_buat_cutoff` (0030) hanya
   menghitung & mengunci transaksi Tunai. UI: tampilan Harian / Mingguan
   (Senin–Minggu) / Kustom -> daftar rentang -> Release -> input jumlah
   diserahkan (`jumlah_setor`) + bukti pemasukan. Transfer/QRIS tampil
   sebagai info saja.
7. **Ketahanan pra-0030**: halaman tetap berfungsi sebelum migrasi jalan
   (simpan bayar mundur ke anotasi tingkat; item & rilis menunggu
   migrasi; cut-off mundur ke RPC lama dengan catatan di notifikasi).
