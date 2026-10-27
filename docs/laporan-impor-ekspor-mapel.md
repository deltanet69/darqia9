# Laporan Eksekusi — Impor & Ekspor Excel Master Mata Pelajaran

Tanggal: 28 Oktober 2026 · Atas persetujuan owner terhadap preview `master-mapel-impor-ekspor-preview-v1.html`
Cadangan sebelum eksekusi: branch `backup/master-mapel-impor-20261028` · Melengkapi laporan `laporan-master-mapel.md`

## Yang dikerjakan

### Dependensi baru: `xlsx` (SheetJS) `^0.18.5`

Satu-satunya cara membaca/menulis .xlsx di browser; disetujui owner di depan. Dimuat **dinamis** (`await import('xlsx')`) hanya saat impor/ekspor dijalankan, jadi tidak membebani muatan awal halaman.

### Template resmi: `public/template-impor-mapel-darqia9.xlsx`

- Sheet **Data Mapel**: kolom Nama Mata Pelajaran, Jenjang, Kategori, KKM, Beban Jam per Minggu (tanpa kolom kode — kode dibuat otomatis), 4 baris contoh, dropdown Jenjang/Kategori, validasi angka KKM 0–100 dan jam 0–60, judul kolom terkunci tampil (freeze).
- Sheet **Petunjuk**: 10 aturan pengisian termasuk perilaku duplikat dan laporan per baris.
- File yang sama dibagikan ke owner lewat chat dan dilayani aplikasi dari tautan "Unduh Template Impor" di dialog impor — satu sumber, tidak akan beda versi.

### `app/components/adminV2/mapel/MapelV2ImportModal.vue` (baru)

- Alur: pilih file .xlsx → sistem mencari baris judul (kolom dikenali dari nama: nama/jenjang/kategori/kkm/beban-jam) → validasi per baris → laporan → tombol "Impor N Mapel".
- Aturan validasi per baris: nama wajib; jenjang harus SMP/SMK; kategori harus salah satu dari Umum/Kejuruan/Keagamaan/Muatan Lokal (peka huruf besar-kecil ditoleransi); KKM angka 0–100; beban jam angka 0–60.
- **Duplikat dilewati, bukan digandakan**: nama + jenjang yang sama dengan data di sistem, atau duplikat di dalam file yang sama.
- Baris gagal tidak menghentikan baris lain. Laporan menampilkan nomor baris Excel, nama, dan alasan untuk setiap baris dilewati/gagal.
- Judul kolom tidak ditemukan → pesan awam menyuruh memakai template resmi.

### `app/composables/useAdminSubjects.ts`

- `importMany(items)`: membuat kode untuk semua baris sekaligus (generator yang sama dengan tambah manual; kode unik dijamin juga antar sesama baris impor), lalu **satu kali insert massal** ke `subjects`, lalu muat ulang daftar. Mengembalikan daftar kode yang terbentuk.

### `app/pages/adminV2/mapel/index.vue`

- Tombol baru di samping Ekspor CSV: **Ekspor Excel** (mengunduh daftar sesuai tampilan/saringan saat itu, termasuk Kode dan Pengajar) dan **Impor Excel** (membuka dialog di atas). Ekspor CSV lama dipertahankan.

## Verifikasi

- `node tests/cbt-banksoal.mjs` → exit 0.
- `npm run build` → exit 0 (impor dinamis xlsx ter-bundle normal).
- `git diff --check` → bersih.
- Belum dilakukan: uji impor file nyata dengan akun staf di browser (butuh sesi login owner). Langkah uji: unduh template dari dialog impor → isi 3–4 mapel baru + 1 mapel yang sudah ada → impor → laporan harus menunjukkan yang baru masuk dan yang lama dilewati.
