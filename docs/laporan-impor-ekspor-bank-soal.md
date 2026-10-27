# Laporan — Impor/Ekspor Bank Soal Selaras Sistem (Word + Excel) dan Penyegaran Tampilan Bank Soal

Tanggal: 28 Oktober 2026 · Branch: `fitur/bank-impor-ekspor` (cadangan: `backup/bank-impor-ekspor-20261028`)

## Ringkasan

Impor bank soal yang selama ini hanya Word kini sejajar penuh: template Word resmi diganti versi berpenanda section berwarna, parser mendukung Isian dan melaporkan kesalahan per soal (tidak lagi gagal total), impor Excel ditambahkan dengan kontrak bidang yang sama persis, ekspor Excel per paket ditambahkan, impor dapat ditujukan ke paket baru atau ditambahkan ke paket yang sudah ada, dan tampilan Bank Soal disegarkan mengikuti arah preview v3 yang disetujui (teks tidak lagi serba extrabold, penanda format berupa titik warna + teks, kartu soal dapat dibuka-tutup).

## Template

- `public/templates/Template_Import_Bank_Soal_SMK.docx` dan `_SMP.docx` DIGANTI versi v2: label kontrak sama persis dengan parser (`JENJANG/KELAS/MATA_PELAJARAN/PENYUSUN/KESULITAN_PAKET`, blok `NO/TIPE/PERTANYAAN/PILIHAN_x/KUNCI/MODE_PG/RUBRIK/MEDIA/LINK_MEDIA/JENIS_JAWABAN`), ditambah banner section berwarna per tipe dan contoh soal terisi penuh. Nilai metadata contoh kini bersih tanpa teks petunjuk di dalam nilai (SMK: XI AKL; SMP: VIII A; mapel Matematika) agar lolos pencocokan persis parser.
- `public/templates/Template_Import_Bank_Soal_SMK.xlsx` dan `_SMP.xlsx` BARU: sheet Metadata (kontrak sama), Data Soal (kolom sejajar kontrak: No, Tipe, Kesulitan, Pertanyaan, Pilihan A–D/E, Kunci, Rubrik, Gambar (URL), Jenis Media, Media, Arab RTL, Jenis Jawaban Interaktif; dengan banner section dan dropdown), dan Petunjuk.

## Parser

- `app/utils/cbtWordBank.ts`:
  - `TIPE: Isian` kini diterima (sebelumnya ditolak) — kunci berupa teks jawaban.
  - Kesalahan per soal dikumpulkan sebagai `issues[]` (+ `totalCount`); soal yang valid tetap diteruskan, yang gagal dilewati dan dilaporkan. Hanya kesalahan tingkat berkas (metadata, jenjang, tidak ada soal valid) yang menggagalkan impor.
  - `JENIS_JAWABAN` interaktif diperluas: PG, PG Multi, Isian.
  - `LINK_MEDIA` audio kini menerima path berkas MP3 VPS (mis. `/media/cbt/audio/...`) selain tautan lengkap — selaras aturan media sekolah; video tetap wajib YouTube.
- `app/utils/cbtExcelBank.ts` BARU: `readExcelBankTemplate` (kontrak metadata + validasi per baris identik dengan Word, memakai `xlsx` yang sudah terpasang untuk Master Mapel, dimuat dinamis) dan `buildBankExcel` untuk ekspor paket (Metadata + Data Soal + Petunjuk) sehingga berkas hasil ekspor dapat diimpor kembali.

## Antarmuka (`CbtV2Bank.vue`)

- Modal impor menerima `.docx` dan `.xlsx`; tombol unduh template Word dan Excel per jenjang; pilihan "Simpan sebagai: Paket Baru / Tambah ke Paket Ini" dengan pemilih paket tujuan — kelas dan mapel berkas wajib sama dengan paket tujuan dan total dibatasi 100 soal per paket.
- Pratinjau impor menampilkan metadata terdeteksi + laporan per soal (berapa siap, berapa gagal, beserta pesannya). Tombol Konfirmasi nonaktif bila tidak ada soal valid atau paket tujuan belum dipilih.
- Detail paket: tombol Export Excel di samping Export CSV; CSV tidak berubah.
- Penyegaran tampilan: seluruh `font-extrabold` di halaman ini diturunkan ke `font-semibold`; chip komposisi format (tabel dan kartu mobile) menjadi titik warna per tipe (PG biru, Isian toska, Esai ungu, Interaktif oranye — bahasa warna yang sama dengan banner template) + teks; lencana kesulitan menjadi teks biasa; kartu soal menjadi baris ringkas yang dapat dibuka-tutup (nomor, tipe, potongan soal, kesulitan, kunci) dengan isi lengkap (teks KaTeX, gambar, pilihan termasuk Interaktif, kotak kunci/rubrik/media, Edit/Hapus) saat dibuka; soal pertama terbuka secara bawaan.

## Tes

- `tests/cbt-banksoal.mjs` diperbarui mengikuti kontrak template v2 (metadata contoh baru; urutan tipe PG, PG, Esai, Interaktif; assert PG Kompleks multi `A, C`; assert `issues` kosong). Hasil: **exit 0, semua kelompok LULUS** termasuk `templateDanImpor: LULUS SMP/SMK`.
- `npm run build`: **exit 0**.
- Catatan lingkungan: build pertama gagal `ENOSPC` karena drive C: laptop penuh (0 GB); dibebaskan dengan `npm cache clean --force` (±2,1 GB) lalu build lulus. Drive C: tetap sempit (±1,7 GB bebas) — perlu dibersihkan berkala oleh pemilik.

## Belum dilakukan

- Uji klik nyata dengan akun staf (impor Word/Excel contoh, tambah ke paket, ekspor lalu impor kembali) — menunggu pemilik; halaman dev server aktif seperti biasa.
