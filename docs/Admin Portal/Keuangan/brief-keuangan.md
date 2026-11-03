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
