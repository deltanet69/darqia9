# Laporan — Modul Pembelajaran (AdminV2)

Tanggal: 31 Oktober 2026 · Branch fitur: `fitur/modul-pembelajaran` · Backup: `backup/modul-pembelajaran-20261031`
Dasar: preview v5 yang disetujui user (struktur modul ajar/projek A–H + revisi 31 Okt).

## Yang dibangun

Halaman **Modul Pembelajaran** di AdminV2 (grup Kepegawaian), menggantikan tujuan menu lama
`'Modul pembelajaran': '/admin/modul-ajar'` menjadi `'/adminV2/modul-ajar'` (satu baris di
`app/components/adminV2/adminV2Data.ts`; halaman admin lama tidak diubah).

Rute baru:
- `/adminV2/modul-ajar` — daftar modul (tabel tegas: Modul · Fase/Kelas · Alokasi · Penyusun · Status)
- `/adminV2/modul-ajar/baru` — formulir buat modul per kartu seksi A–H
- `/adminV2/modul-ajar/[id]` — dokumen modul A–H + aksi alur persetujuan
- `/adminV2/modul-ajar/[id]/sunting` — formulir sunting (hanya penulis / superadmin)

File:
- `app/composables/useModulPembelajaran.ts` — tipe IsiModul (seksi B–H sebagai jsonb), logika murni
  (total JP, peta pertemuan, penyaring daftar, aturan akses, pemetaan baris DB, HTML cetak PDF),
  dan akses tabel `learning_modules`.
- `app/components/adminV2/modul/ModulPageShell.vue` — rangka halaman (pola Jadwal Pelajaran).
- `app/components/adminV2/modul/ModulList.vue` — pencarian + filter (status, penyusun, jenis),
  hitungan hasil, pemilih "Saya sebagai penulis", arsip soft delete untuk superadmin.
- `app/components/adminV2/modul/ModulDocument.vue` — dokumen A–H, tombol alur
  (Kumpulkan / Setujui / Kembalikan ke Draf / Arsipkan), pengatur tahap pelaksanaan (0–6),
  Unduh PDF (membuka dokumen cetak mandiri di tab baru).
- `app/components/adminV2/modul/ModulForm.vue` — editor A–H: chip 8 Dimensi Profil Lulusan (maks 3),
  editor rubrik kriteria, editor 6 tahap PjBL dengan cek total JP vs alokasi, editor bobot (cek 100%),
  lampiran sebagai metadata judul/keterangan dulu (unggah berkas menyusul).
- `supabase/migrations/0022_modul_pembelajaran.sql` — tabel `learning_modules` + RLS.
- `tests/modul-pembelajaran.mjs` — 7 kelompok tes logika (semuanya lolos).

## Aturan yang ditegakkan (keputusan user 31 Okt 2026)

1. **Alur tanpa pengesahan kepala sekolah**: draf → dikumpulkan → **admin menyetujui**
   (`status`: draf/menunggu/disetujui; `submitted_at`, `approved_at`, `approved_by` tercatat).
2. **Superadmin CRUD penuh** (termasuk memulihkan arsip).
3. **Semua guru membaca semua modul; edit hanya penulisnya** — ditegakkan di UI
   (`bolehSunting`) dan di RLS (policy update/insert: `is_staff()` atau guru pemilik
   `author_teacher_id` via `teachers.user_id = auth.uid()`; select untuk semua authenticated).
4. **Soft delete** — `deleted_at`; aplikasi tidak pernah menghapus baris; arsip bisa dipulihkan.
5. **Terintegrasi** — penyusun dari tabel `teachers` aktif per jenjang; jenjang mengikuti
   pengalih global `useAdminGrade`; satuan pendidikan per jenjang; 1 JP SMP 40 / SMK 45 menit.

Jenjang mengikuti switcher global (tidak ada pemilih jenjang lokal di halaman).

## Verifikasi

- `node --experimental-strip-types tests/modul-pembelajaran.mjs` → 7 kelompok tes lolos
  (termasuk peta pertemuan contoh "Sekolah Bebas Sampah": 12 JP / 4 pertemuan = tahap 1–2, 3–4, 4–5, 5–6).
- `npm run build` → Build complete; chunk `modul-ajar` hadir di `.output`, tabel `learning_modules`
  terverifikasi teracu di chunk klien.

## Prasyarat & cara test manual

1. **Jalankan migrasi 0022** di Supabase SQL Editor (project darqia9). Tanpa itu halaman menampilkan
   pemberitahuan "tabel belum tersedia" dan daftar kosong (kode defensif, tidak error).
2. Buka Portal Admin → menu Modul Pembelajaran.
3. Pilih "Saya sebagai penulis" (guru jenjang aktif), klik **+ Buat Modul**, isi minimal judul +
   penyusun, **Simpan Draf** → modul tampil di daftar berstatus DRAF.
4. Buka modul → **Kumpulkan untuk Persetujuan** → status MENUNGGU.
5. Sebagai superadmin/admin: buka modul → **Setujui Modul** → status DISETUJUI; atur tahap pelaksanaan;
   unduh PDF dari tombol di dokumen.
6. Uji aturan baca: ganti "Saya sebagai penulis" ke guru lain — modul orang lain hanya bisa dibuka
   (Lihat), tombol Sunting hilang; **Arsipkan** lalu pulihkan dari bagian arsip (superadmin).

## Belum termasuk (disengaja, fase berikutnya)

- Tampilan siswa "Projek Saya" (portal siswa) — konsepnya ada di preview v5; dieksekusi saat
  modul ini disambungkan ke sisi siswa.
- Unggah berkas lampiran beneran (storage) — saat ini lampiran dicatat sebagai metadata.
- Tulis-balik nilai sumatif modul ke Gradebook/Rapor — mengikuti fase integrasi nilai.
