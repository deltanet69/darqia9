# Laporan Perbaikan CRUD Bank Soal

Tanggal: 28 Oktober 2026
Branch: `fitur/bank-crud-fix` (di atas backup `backup/bank-crud-fix-20261028`)
Pemicu: tiga keluhan pengguna pada formulir Buat Bank Soal — (1) mata pelajaran tidak
bisa dipilih, (2) ekstrak teks dari gambar Arab/rumus selalu ditolak, (3) jawaban belum
mendukung rumus dan bahasa Arab.

## 1. Mata pelajaran bisa dipilih dan terintegrasi Master Mapel

Akar masalah: daftar mapel formulir hanya berasal dari `class_schedules` (jadwal
pelajaran per kelas). Modul Jadwal Pelajaran belum ada, jadi tabel itu kosong untuk
semua kelas dan dropdown mapel selalu terkunci ("Belum ada mata pelajaran pada jadwal
kelas ini"), termasuk kelas yang sudah punya bank.

Perbaikan:

- `CbtV2Bank.vue` — `subjectsForClass()` kini memakai gabungan mapel terjadwal +
  mapel dari bank yang sudah ada; bila kelas **belum memiliki jadwal sama sekali**,
  tampilkan semua mapel aktif jenjang tersebut dari Master Mapel (`subjects`).
  Fungsi baru `isSubjectFallback()` diteruskan ke formulir sebagai prop
  `subject-fallback`.
- `CbtV2BankForm.vue` — saat mode fallback aktif, tampil catatan biru bahwa kelas
  belum memiliki jadwal dan mapel diambil dari Master Mapel.
- `useAdminCbtData.ts` — `saveBankPackage()` hanya menolak mapel di luar jadwal bila
  kelas memang memiliki jadwal; kelas tanpa jadwal boleh memakai mapel Master Mapel
  (jenjang tetap divalidasi harus sama).

## 2. Ekstrak gambar (rumus & Arab) tidak lagi selalu ditolak

Akar masalah: endpoint OCR membandingkan dua pembacaan model secara ketat
(`ocrTextsAgree`) — perbedaan harakat sekecil apa pun membuat hasil ditolak total
("Dua pembacaan gambar belum cocok"), padahal dua model vision hampir tidak pernah
menghasilkan harakat yang identik pada teks Arab.

Perbaikan (kesepakatan ketat DIPERTAHANKAN, sesuai kontrak tes lama):

- `server/utils/cbtOcr.ts` — fungsi baru `ocrTextsAgreeLoose()`: perbandingan kerangka
  huruf (harakat/tanda Quran diabaikan, varian alif/hamzah/teh marbuta disetarakan,
  angka Arab-Indic disamakan, `\dfrac`/`\tfrac` = `\frac`). `ocrFidelityScore()`
  menghitung kelengkapan harakat.
- `server/api/cbt/ocr.post.ts` — bila dua pembacaan tidak cocok persis, dilakukan
  **pembacaan ketiga (ajudikasi)**: model memeriksa piksel gambar dengan kedua
  kandidat di tangan dan menulis transkripsi final yang paling setia pada gambar.
  Hasil ajudikasi hanya diterima bila kerangka hurufnya sama dengan salah satu
  kandidat (isi tidak boleh berubah), lalu tetap melewati gerbang validasi rumus
  dan penanda `[tidak terbaca]`. Bila tetap tidak ada yang cocok, hasil ditolak
  seperti sebelumnya.

## 3. Jawaban mendukung rumus & bahasa Arab

- `CbtRichQuestionEditor.vue` — mode baru `compact`: toolbar rumus KaTeX + tombol
  RTL Arab + pratinjau render, tanpa unggah gambar/ekstraksi; status RTL dikelola
  lokal per bidang (otomatis dari isi teks Arab, bisa dialihkan manual).
- `CbtV2BankForm.vue`:
  - Opsi PG dan Interaktif kini memakai editor kaya compact (sebelumnya input teks
    polos) — guru dapat menulis rumus dan opsi berbahasa Arab dengan pratinjau.
  - **Langkah Isian baru** di pembuat soal (sebelumnya soal Isian hanya bisa masuk
    lewat impor dan tidak dapat dibuat/diedit di formulir): `questionSteps`,
    `blankQuestion`, navigasi langkah, judul langkah, dan blok "Kunci Jawaban Isian"
    dengan editor kaya compact. Kunci Interaktif jenis Isian juga memakai editor ini;
    untuk Interaktif jenis PG, kunci tetap dipilih dari tombol opsi.
  - Validasi simpan diperluas: rumus tidak valid kini juga dicari di teks opsi dan
    kunci Isian (sebelumnya hanya teks pertanyaan), dan kunci soal Isian wajib diisi.

## Verifikasi

- `node tests/cbt-banksoal.mjs` exit 0 — termasuk assert baru: perbandingan longgar
  Arab (basmalah berharakat vs polos, teh marbuta, angka Arab), skenario ajudikasi
  OCR (dua pembacaan berbeda harakat → hasil final diterima; isi benar-benar beda →
  tetap 422), dan perilaku langkah Isian formulir.
- `npm run build` exit 0.

## Catatan lanjutan

- Uji klik akun staf tetap diperlukan: pilih mapel untuk kelas tanpa jadwal
  (mis. XII TBSM), ekstrak gambar ayat berharakat asli, dan buat soal Isian dari
  formulir.
- Drive C: laptop kembali kritis (±0,24 GB bebas) — perlu pembersihan berkala di luar
  cache npm.
