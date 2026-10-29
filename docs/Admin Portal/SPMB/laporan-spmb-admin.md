# Laporan — Manajemen SPMB AdminV2 + Penempatan Kelas

Tanggal: 29 Oktober 2026 · Backup: `backup/spmb-admin-20261029`

## Yang dibangun

Halaman admin SPMB di `/adminV2/spmb` (menu Aplikasi → SPMB kini mengarah ke sini),
port setia dari preview v5 yang disetujui user, **Tailwind penuh tanpa CSS konvensional/scoped**:

- `app/pages/adminV2/spmb/index.vue` — shell halaman mengikuti pola halaman AdminV2 lain.
- `app/components/adminV2/spmb/SpmbManager.vue` — daftar pendaftar: strip kuota gabungan
  (bisa diubah, bawaan 150/jenjang), KPI 5 status (klik = filter), chip status, saringan
  jurusan (SMK) + sumber (Online/Manual), pencarian, urutan, ekspor CSV, sampah (soft delete + pulihkan).
- `app/components/adminV2/spmb/SpmbDetail.vue` — detail persis formulir: Data Siswa &
  Informasi Orang Tua dengan tempat/tanggal lahir TERPISAH, label persis spesifikasi user,
  NIK tersamar, tombol WA/email wali, kartu pembayaran Rp50.000, tindakan per status
  (Verifikasi Pembayaran → Terima/Tolak dengan penjaga kuota penuh).
- `app/components/adminV2/spmb/SpmbForm.vue` — CRUD pendaftaran MANUAL (wali datang ke sekolah):
  field persis formulir publik + pembayaran (metode + status + upload bukti; bukti WAJIB
  untuk Transfer BSI/QRIS). NISN divalidasi unik per jenjang. Entri online TIDAK bisa diubah
  admin (integritas data orang tua) — hanya entri manual yang punya Ubah Data.
- `app/components/adminV2/spmb/SpmbPlacement.vue` — tab Penempatan Kelas: pool siswa Diterima,
  kartu rombel per jenjang (SMK per jurusan kap. 36; SMP kap. 32; rombel bisa ditambah),
  tempatkan terpilih (validasi jurusan + kapasitas), Bagi Rata Otomatis, batalkan penempatan.
  Saat ditempatkan siswa menerima NIS otomatis berurutan (SMK 27001xx, SMP 27002xx —
  format mengikuti konvensi Data Induk) dan tercatat sebagai data siswa resmi TA 2027/2028.
- `app/composables/useSpmbAdmin.ts` — lapisan data + logika murni (teruji).

## Aliran data (fase ini)

- Sumber data = localStorage `spmb27_regs` yang SAMA dengan formulir pendaftaran publik
  (`useSpmbForm`) — data admin adalah data asli input orang tua/wali, bukan salinan.
  Pendaftaran manual ditulis ke array yang sama (`via: 'Manual'`). Status yang diubah admin
  ikut terlihat di fitur Lacak pendaftaran publik karena kuncinya sama.
- Kuota & rombel tersimpan di `spmb27_kuota` / `spmb27_rombel`.
- Saat database SPMB disiapkan (keputusan user: setelah semua halaman selesai), hanya isi
  `useSpmbAdmin` yang diganti ke API — komponen tidak berubah.

## Penyesuaian kontrak data

- Formulir publik menyimpan TTL gabungan (`s_ttl`/`o_ttl`). `useSpmbForm` kini JUGA menulis
  `s_tempat/s_tgl/o_tempat/o_tgl` terpisah saat submit; record lama diurai balik oleh
  `parseTtl` di lapisan admin — detail selalu menampilkan tempat & tanggal lahir terpisah.
- Biaya formulir diselaraskan ke **Rp50.000** di halaman publik (`pages/spmb/index.vue`,
  `pages/spmb/smp/index.vue`, `pages/spmb/smk/index.vue` — 5 titik tampilan), sesuai koreksi user.
- Keterbatasan fase ini: berkas bukti pembayaran pendaftar ONLINE belum tersimpan permanen
  (formulir publik mewajibkan upload, tetapi belum ada storage) — di detail admin ditandai
  dengan catatan; nama berkas entri manual tersimpan. Tersimpan penuh mulai fase database/storage.

## Verifikasi

- `tests/spmb-admin.mjs`: 9 kelompok tes logika (parse TTL, normalisasi, validasi + NISN unik,
  NIS berurutan, bagi rata + kapasitas, CSV) — LOLOS (exit 0).
- `tests/cbt-banksoal.mjs` (regresi): exit 0.
- `npm run build`: exit 0.

## Integrasi Database (29 Okt 2026, malam) — menggantikan fase localStorage

Menindaklanjuti pertanyaan user soal kepastian aliran data publik → admin:

- **Migrasi `supabase/migrations/0018_spmb.sql`** (dijalankan user di SQL Editor):
  tabel `spmb_registrations` (satu sumber online+manual, TTL terpisah, NISN unik per
  jenjang via partial index, soft delete `deleted_at`, kolom penempatan kelas/nis),
  tabel `spmb_settings` (kuota & rombel), RLS (anon hanya INSERT pendaftaran online;
  staf = pemilik `profiles` via `is_staff()`; select khusus staf), RPC `spmb_lacak`
  (security definer — publik melacak hanya dengan ID miliknya), bucket privat
  `spmb-bukti` (anon upload, staf baca).
- **Migrasi `0019_spmb_lacak_lengkap.sql`**: RPC lacak ikut mengembalikan jurusan &
  sekolah asal (sesuai modal Lacak publik).
- **Verifikasi lapisan database (skrip anon dari laptop, tanpa login): 5/5 lolos** —
  RPC lacak OK, insert anon payload formulir OK, lacak menemukan barisnya, select
  anon langsung terbaca 0 baris (RLS melindungi), upload bucket OK (catatan: upload
  TIDAK memakai upsert — upsert menuntut policy UPDATE untuk anon).
- **Rewiring kode**: `useSpmbForm.submitForm` kini async — unggah bukti ke bucket +
  insert ke `spmb_registrations` (duplikat NISN dari database, kode 23505, dikembalikan
  sebagai galat field NISN; kegagalan jaringan jatuh ke simpanan lokal lama sebagai
  cadangan). `doTrack` memakai RPC dulu, fallback lokal. `useSpmbAdmin` membaca
  Supabase sebagai sumber utama (data lokal non-DB tetap digabung), semua mutasi admin
  (status, hapus/pulihkan, simpan manual + unggah buktinya, penempatan) ditulis tembus
  via upsert; kuota & rombel di-upsert ke `spmb_settings`. Mapper `recordDariRow` /
  `recordKeRow` teruji di `tests/spmb-admin.mjs` (10 kelompok, lolos).
- Bukti tampil di admin: baris uji `SPMB27-SMK-UJITES` ("UJI INTEGRASI HAPUS") yang
  diinsert sebagai anon tampil di Manajemen SPMB (SMK) setelah user login — verifikasi
  visual oleh user. Pembersihan baris uji: baris tabel bisa dihapus lewat SQL biasa,
  TETAPI berkas di storage TIDAK bisa dihapus lewat SQL (Supabase menjaga
  `storage.objects` dengan `protect_delete` — error 42501); berkas dihapus lewat
  Dashboard Storage / Storage API. Catatan migrasi: mengubah jumlah kolom
  `RETURNS TABLE` pada fungsi wajib `DROP FUNCTION` dulu (error 42P13 bila tidak).
- Build produksi exit 0; regresi CBT exit 0. Backup: `backup/spmb-db-20261029`.
