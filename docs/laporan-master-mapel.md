# Laporan Eksekusi — CRUD Master Mata Pelajaran (AdminV2)

Tanggal: 28 Oktober 2026 · Atas persetujuan owner terhadap preview `master-mapel-crud-preview-v1.html`
Cadangan sebelum eksekusi: branch `backup/master-mapel-20261028`

## Masalah yang diperbaiki

1. Form "Guru Koordinator Pengampu" wajib diisi tetapi nilainya **tidak pernah disimpan** (fungsi simpan lama tidak mengirimnya ke database) dan tidak pernah ditampilkan dari data asli.
2. Halaman hanya bisa membaca dan menambah — tidak ada Ubah, Nonaktifkan, maupun Hapus.
3. Kartu "Standar KKM Rata-rata 75 - 78" dan "Status Kurikulum: Terverifikasi" adalah teks mati, bukan dari data.
4. Kode mapel diketik manual — rawan tidak konsisten dan bentrok (kode bersifat unik di database).

## Yang dikerjakan

### `app/composables/useAdminSubjects.ts` (ditulis ulang)

- `generateSubjectCode(nama, kodeYangAda)`: kode dibuat otomatis dari nama. Multi-kata → huruf depan tiap kata bermakna (kata sambung dan/di/ke/dari/yang dilewati, maks 5 huruf); satu kata → 3 huruf pertama. Tabrakan diberi akhiran angka (2, 3, ...). Contoh: Bahasa Indonesia → BI, Bahasa Inggris → BI2, Pendidikan Agama dan Budi Pekerti → PABP.
- `create` memakai generator di atas (kode tidak lagi diketik). `update` mengubah nama/jenjang/kategori/KKM/jam — **kode sengaja tidak diubah** karena menjadi rujukan jadwal, bank soal, dan nilai.
- `setActive` untuk nonaktifkan/aktifkan (`subjects.active`).
- `remove` berpenjaga: menghitung referensi segar di `class_schedules`, `question_banks`, `ujian_harian_banks`, `exams`, `ujian_harian`. Bila masih dipakai, hapus ditolak dengan pesan awam; jalan aman yang ditawarkan UI adalah nonaktifkan.
- `load` sekarang juga memuat ringkasan turunan per mapel dari `class_schedules` aktif: daftar guru pengajar (unik, terurut), jumlah kelas terjadwal, dan jumlah pemakaian (jadwal/bank/ujian) untuk penjaga hapus.

### `app/components/adminV2/mapel/MapelV2Modal.vue` (ditulis ulang)

- Satu modal untuk Tambah dan Ubah. Field: Nama, **Kode (kotak baca-saja: "Otomatis" saat tambah, "Terkunci" saat ubah)**, **Jenjang Pendidikan (SMP/SMK) di dalam form**, Kategori, Standar KKM (0–100, keterangan: acuan penilaian akhir), Alokasi Beban Jam.
- Field Guru Koordinator Pengampu **dihapus**. Sebagai gantinya ada kotak penjelasan: pengajar ditentukan di Jadwal Pelajaran per kelas.
- Kode pratinjau langsung berubah mengikuti nama yang diketik (memakai `generateSubjectCode` yang sama dengan lapisan data).

### `app/components/adminV2/mapel/MapelV2DeleteModal.vue` (baru)

- Dialog hapus dua cabang: mapel terpakai → penjelasan pemakaian (jadwal/bank/ujian) + tombol "Nonaktifkan Saja"; mapel belum terpakai → konfirmasi "Hapus Permanen".

### `app/pages/adminV2/mapel/index.vue`

- Kolom "Koordinator Pengampu" diganti **"Pengajar (dari Jadwal Pelajaran)"**: nama guru + "N guru · M kelas terjadwal", atau "Belum ada jadwal — Atur di Jadwal Pelajaran".
- Kolom **Aksi** baru: Ubah, Nonaktifkan/Aktifkan, Hapus. Baris nonaktif tampil redup, titik status abu-abu.
- KPI nyata: Standar KKM = rentang min–maks dari data aktif; kartu ke-4 menjadi **"Sudah Terjadwal" (x / y mapel aktif)** menggantikan "Terverifikasi".
- Bilah integrasi di atas kartu: Jadwal Pelajaran per Kelas · Jadwal Mengajar Guru · Bank Soal CBT & LMS · Ujian (KKM bawaan) · Agenda Mengajar · Rapor.
- Pencarian kini juga mencocokkan nama pengajar; placeholder diperbarui. Ekspor CSV: kolom koordinator diganti "Pengajar (dari Jadwal)" + "Kelas Terjadwal".

## Keputusan desain

- **Pengajar tidak tinggal di master.** Pengampu adalah relasi di Jadwal Pelajaran (`class_schedules.teacher_id` memang wajib di skema): satu mapel bisa diajar guru berbeda per kelas (mis. Matematika XII A dan XII B beda guru) tanpa menduplikasi master. Dari relasi itu Jadwal Mengajar guru dan hak bank soal CBT mengikuti secara otomatis.
- Kolom `subjects.coordinator_id` di database **dibiarkan** (tidak dipakai UI lagi) agar tidak perlu migrasi; tidak ada data yang dihapus.
- Tidak ada migrasi dan tidak ada dependensi baru.

## Verifikasi

- `node tests/cbt-banksoal.mjs` → exit 0 (suite repo, tidak ada regresi).
- `npm run build` → exit 0 (NODE_OPTIONS=--max-old-space-size=6144).
- `git diff --check` → bersih.
- Belum dilakukan: uji transaksi akun staf asli di browser (tambah/ubah/hapus mapel nyata).

## Catatan tindak lanjut

- Kolom Pengajar membaca `class_schedules`; halaman **CRUD Jadwal Pelajaran belum ada** di aplikasi (tabelnya sudah ada dan baru dibaca CBT). Sampai modul itu dibangun, kolom akan menampilkan "Belum ada jadwal" — itu kondisi sebenarnya, bukan kerusakan.
- Langkah manual untuk owner: buka `/adminV2/mapel` → Tambah Mapel (kode terisi otomatis saat mengetik nama) → Simpan → Ubah (kode terkunci) → Nonaktifkan → coba Hapus pada mapel yang sudah punya bank soal/ujian (harus tertolak dan menawarkan nonaktifkan) dan pada mapel baru yang belum terpakai (bisa dihapus).
