# Laporan Implementasi — Token Ujian per Siswa

Tanggal: 28 Oktober 2026 · Branch: `fitur/token-per-siswa` (backup: `backup/token-per-siswa-20261028`)
Dasar: `BRIEF-TOKEN-PER-SISWA.md` + preview `token-per-siswa-preview-v1.html` (disetujui owner).

## Perubahan skema — `supabase/migrations/0017_token_peserta.sql` (baru)

Urutan terapkan di Supabase: **0015 → 0016 → 0017**.

- `students.exam_eligible boolean not null default true` — satu-satunya sumber status
  persyaratan administrasi untuk kartu ujian (dikelola Admin TU/Superadmin; modul
  Keuangan kelak menulis kolom yang sama).
- `exam_assignments.access_token` + `token_issued_at`, begitu pula
  `ujian_harian_assignments`; index unik parsial pada `access_token`.
- `generate_student_token()` — token 8 karakter huruf besar + angka tanpa karakter
  ambigu (0/O, 1/I), dibuat di server.
- `issue_exam_tokens(exam, source)` — memastikan assignment seluruh roster kelas ujian
  ada, lalu menerbitkan token bagi peserta eligible yang belum memilikinya.
- `issue_student_token(exam, student, source)` — terbitkan satu siswa (token lama
  dikembalikan apa adanya bila sudah ada).
- `regenerate_exam_token(assignment, source)` — token baru, token lama hangus seketika.
- `load_student_exam_questions` **ditulis ulang**: siswa dicari dari NIS (aktif +
  eligible), ujian dicari lewat assignment siswa yang `access_token`-nya cocok.
  `exams.code` tetap identitas internal ujian, **tidak lagi berfungsi sebagai
  kredensial masuk**. Semua kegagalan tetap satu pesan generik. Kontrak endpoint
  `POST /api/cbt/questions` tidak berubah; tampilan login siswa tidak berubah.

## Perubahan aplikasi

- `app/composables/useAdminCbtData.ts`
  - `saveExam`: setelah ujian tersimpan, `issue_exam_tokens` dipanggil otomatis —
    kegagalannya (mis. migrasi 0017 belum diterapkan) tidak membatalkan penyimpanan.
  - Baru: `loadExamParticipants`, `issueExamTokens`, `issueStudentToken`,
    `regenerateStudentToken`, `setStudentExamEligible`, tipe `ExamParticipant`.
- `app/components/adminV2/cbt/CbtV2ExamTokens.vue` (baru) — panel **Token Peserta**
  per ujian: ringkasan peserta/token terbit/belum beres; tabel siswa (NIS, status
  administrasi + ubah status, token, Salin/Terbitkan/Regenerasi); **Export Excel**
  daftar token seluruh peserta; **Cetak Kartu Ujian** (hanya siswa eligible yang
  sudah memiliki token, jendela cetak siap potong). Bila migrasi 0017 belum
  diterapkan, panel menampilkan penjelasan, bukan error mentah.
- `app/components/adminV2/cbt/CbtV2Exams.vue`
  - Tombol **Token Peserta** pada kartu Daftar Ujian dan pada tabel Detail Rombel.
  - Kode token bersama tidak lagi ditampilkan sebagai "Token {kode}"; subjudul kini
    "Token per siswa". Kolom wizard menjadi informasi "Dibuat otomatis per siswa
    saat ditayangkan"; toast penyimpanan tidak lagi memamerkan kode bersama.

## Perilaku penting

- Mencabut status eligible menutup akses masuk siswa pada **semua** ujian selama
  statusnya belum beres (RPC login memeriksa `exam_eligible` setiap kali masuk),
  walaupun token sudah terbit; mengembalikan status eligible membuat token lama
  berlaku lagi tanpa cetak ulang.
- Ujian yang sudah tayang sebelum migrasi 0017: peserta belum memiliki assignment —
  buka panel Token Peserta lalu **Terbitkan untuk yang eligible** satu kali.

## Verifikasi

- `node tests/cbt-banksoal.mjs` — exit 0. Assert baru: penerbitan token tepat setelah
  `save_assessment_exam` (CBT dan ujian harian), isi migrasi 0017 (token diikat ke
  assignment, login tidak lagi memakai kode bersama), dan keberadaan panel + ekspor
  + cetak. Dua assert lama disesuaikan karena urutan RPC berubah oleh penerbitan
  token otomatis (kontrak tersimpan tidak berubah).
- `npm run build` — exit 0.

## Belum terverifikasi (butuh owner)

1. Terapkan migrasi 0015, 0016, lalu 0017 di Supabase.
2. Uji klik akun staf: buat/tayangkan ujian → panel Token Peserta → terbitkan →
   Export Excel & Cetak Kartu → login siswa dengan token pribadi (token siswa lain
   dan kode lama ujian harus ditolak).
