# Laporan — Daftar Ujian per Ujian & Alur Buat Ujian Dua Langkah (AdminV2 CBT/LMS)

Tanggal: 28 Oktober 2026. Acuan: `docs/Admin Portal/CBT/cbt_banksoal.md` versi 2
(alur Siapkan Soal → Buat Ujian → Atur Jadwal & Tayangkan) dan
`docs/laporan-cbt-banksoal.md` (kondisi terakhir sebelum pekerjaan ini).
Cadangan sebelum perubahan: commit `27feb38` dan cabang
`backup/cbt-daftar-ujian-20261028`.

## Yang dikerjakan

- **Daftar Ujian tampil per ujian** (tampilan utama baru di
  `CbtV2Exams.vue`): satu kartu = satu ujian berisi nama, mapel, rombel,
  token, jadwal, pengawas, jumlah peserta, dan jumlah soal terpasang
  ("N soal terpasang", atau "Seluruh bank soal" untuk ujian lama tanpa
  relasi pilihan). Saringan status (Semua / Siap Tayang / Sedang
  Berlangsung / Sudah Selesai) dan pencarian nama ujian/mapel/rombel.
  Label status dari data nyata: `Terjadwal` ditampilkan "Siap Tayang",
  `Berlangsung` ditampilkan "Sedang Berlangsung".
- **Tampilan per rombel dipertahankan** sebagai tampilan sekunder
  (penukar "Per Ujian | Per Rombel"); detail per rombel dan seluruh
  perilaku lama tidak berubah.
- **Tombol utama "+ Buat Ujian"** (bukan lagi "Buat Jadwal Ujian") dengan
  penanda 3 langkah di atas daftar; langkah 1 membuka tab Bank Soal.
- **Formulir buat/ubah ujian dipisah dua langkah dalam satu dialog:**
  - Langkah 1 "Buat Ujian" (kerangka): nama ujian, rombel, mata pelajaran,
    durasi, pengawas. Belum ada jadwal dan belum ada soal di langkah ini.
    Kolom pengawas sekarang benar-benar tersimpan (`supervisor_id`) —
    sebelumnya formulir tidak mengumpulkannya sehingga mengubah ujian
    mengosongkan pengawas; `ExamItem` dan pemetaan data menambah
    `supervisorId`.
  - Langkah 2 "Jadwal & Soal": tanggal/waktu mulai, token (otomatis),
    bank soal (otomatis mengikuti mapel+rombel), cara pasang soal, dan
    **kotak ringkasan** (nama, mapel·rombel, jadwal, jumlah soal) sebelum
    tombol **"Simpan & Tayangkan"**.
- **Pasang soal dua cara:**
  - **Acak oleh Sistem** (baru): operator mengisi jumlah soal, sistem
    mengacak (Fisher–Yates) satu kali dan mengambil sejumlah itu; hasil
    acakan tersimpan tetap sebagai pilihan ujian lewat RPC
    `save_assessment_exam` yang sudah ada, tampil sebagai daftar nomor
    soal, dan bisa diacak ulang selama belum disimpan.
  - **Pilih Sendiri**: centang per soal + urutan Naik/Turun — perilaku
    lama dipertahankan persis, termasuk memulihkan pilihan saat mengubah
    ujian.
- Komponen yang sama dipakai CBT dan LMS (`source`), sehingga kedua
  manajemen mendapat alur baru yang sama. Tidak ada dependensi baru,
  tidak ada perubahan skema/RPC yang berjalan.

## Yang belum dikerjakan (sesuai desain, menunggu owner)

- **Kerangka tersimpan sebagai draf server ("Belum Lengkap") + antrean
  pengajuan pengajar ("Menunggu Persetujuan")**: memerlukan migrasi
  `supabase/migrations/0016_kerangka_ujian_draf.sql` (sudah ditulis,
  BELUM diterapkan): melonggarkan `starts_at`/`question_bank_id` menjadi
  boleh kosong pada `exams` dan `ujian_harian`, menambah RPC
  `save_exam_framework` (simpan kerangka berstatus `draf`) dan
  `publish_exam_framework` (naikkan draf menjadi terjadwal setelah
  jadwal+soal lengkap). Ujian draf tidak tampil ke siswa karena
  `load_student_exam_questions` hanya memuat status terjadwal/berlangsung.
  Setelah migrasi diterapkan, tindak lanjutnya: memuat draf ke daftar
  admin (saat ini data layer menyaring status `draf` keluar), status
  "Belum Lengkap" + tombol Lengkapi, dan tabel pengajuan pengajar.
- Migrasi 0015 (validasi jenjang bank soal) juga masih belum diterapkan.

## Verifikasi

- `node tests/cbt-banksoal.mjs` — **lulus (exit 0)**, termasuk uji SSR
  Daftar Ujian kosong (tidak ada status "Selesai" palsu dan keterangan
  siswa aktif tampil) serta uji simpan subset soal lewat RPC tiruan.
  Agar penjaga regresi itu tetap utuh, saringan status di daftar memakai
  label "Sudah Selesai" dan kepala daftar menampilkan jumlah siswa aktif
  jenjang dari data kelas nyata.
- `npm run build` — **lulus (exit 0)**. Percobaan pertama berhenti di
  tahap kompresi akhir dengan `Z_MEM_ERROR` (memori laptop), bukan galat
  kode; pengulangan dengan `NODE_OPTIONS=--max-old-space-size=6144`
  selesai penuh.
- `git diff --check` — bersih.
- Pemeriksaan visual browser (desktop/360 px) dan transaksi dengan akun
  staf asli TIDAK diklaim lulus — belum dilakukan pada pekerjaan ini.

## Berkas yang disentuh

- `app/components/adminV2/cbt/CbtV2Exams.vue` — tampilan daftar per ujian,
  penukar tampilan, wizard dua langkah, mode acak, ringkasan.
- `app/components/adminV2/cbt/cbtV2Data.ts` — `ExamItem.supervisorId`.
- `app/composables/useAdminCbtData.ts` — pemetaan `supervisorId`.
- `docs/Admin Portal/CBT/cbt_banksoal.md` — diganti brief alur v2 + status
  implementasi (berkas docs ter-gitignore, hidup di disk repo lokal).
- `docs/Admin Portal/CBT/cbtadmin.md` — konsep Daftar Ujian dan alur resmi
  diselaraskan ke v2 (ter-gitignore, di disk).
- `supabase/migrations/0016_kerangka_ujian_draf.sql` — migrasi draf
  (belum diterapkan).
- `.gitignore` — izinkan pelacakan laporan ini dan migrasi 0016.
- `docs/laporan-cbt-daftar-ujian.md` — laporan ini.

## Uji manual untuk owner

1. Buka `/adminV2/cbt?tab=exams&jenjang=smk` — daftar tampil per ujian;
   coba saringan status dan pencarian; penukar "Per Rombel" membuka
   tampilan lama.
2. Klik **+ Buat Ujian** — Langkah 1 hanya berisi kerangka. Isi nama,
   rombel, mapel, durasi, pengawas → **Lanjut ke Jadwal & Soal**.
3. Langkah 2: atur tanggal; pada "Acak oleh Sistem" isi jumlah soal →
   **Acak Soal** → periksa daftar nomor soal dan kotak ringkasan →
   **Simpan & Tayangkan**. Ujian muncul di daftar dengan token barunya.
4. Ubah ujian itu: formulir membuka dengan pilihan soal lama utuh
   (mode Pilih Sendiri) dan pengawas tidak lagi kosong.
5. Ulangi ringkas di `/adminV2/lms` dan pada lebar 360 px.
