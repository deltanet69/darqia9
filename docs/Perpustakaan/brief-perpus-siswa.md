# Brief — Perpustakaan Digital (Aplikasi Siswa) Darqia 9

Port setia dari preview v8 yang DIKUNCI pemilik 30 Okt 2026
(`perpus-siswa-preview-v8.html`). Dieksekusi 4 Nov 2026 atas perintah pemilik.

## Aturan produk (dikunci pemilik 29–30 Okt 2026)

1. Login siswa CUKUP NIS terdaftar di Data Induk (siswa aktif) — tanpa
   kata sandi / token.
2. SELURUH buku dibaca DI DALAM aplikasi — TIDAK ADA tautan keluar
   (iPusnas dihapus total dari desain final).
3. Koleksi = buku teks + buku nonteks SIBI Kemendikdasmen (gratis & legal
   di-host sendiri). Novel komersial berhak cipta TIDAK di-host tanpa lisensi.
4. Subdomain khusus: `perpus.smkitattaqwa9.sch.id` (pola sama untuk SMP
   menyusul) — routing host di lapisan Nginx; rute aplikasi `/perpus`.
5. NPP Perpusnas sekolah SUDAH ada & terdaftar (tertulis di Profil siswa).

## Implementasi

- Halaman: `app/pages/perpus/index.vue` (layout `exam` — tanpa navigasi
  publik & tanpa widget chat), aplikasi satu halaman bergaya mobile
  (maks 480px) persis preview: Login → Beranda → Katalog → Rak Saya →
  Detail → Reader → Profil, navigasi bawah 4 tombol.
- Komponen: `app/components/perpus/` (Login, Beranda, Katalog, Rak,
  Detail, Profil, Reader, Cover). CSS desain preview dibawa sebagai
  stylesheet ter-namespace `.perpus-app` di halaman (desain aplikasi
  mandiri, bukan permukaan AdminV2 — pengecualian sadar dari pakem
  Tailwind AdminV2, demi kesetiaan pada preview yang dikunci).
- Data: `app/composables/perpusCore.ts` (logika murni + penurunan
  tingkat/jurusan dari nama kelas), `perpusContoh.ts` (data contoh =
  isi seed, digenerate dari preview), `usePerpus.ts` (Supabase + mode
  contoh lokal berlabel selama migrasi belum jalan).
- Login NIS diverifikasi server: `server/api/perpus/login.post.ts`
  (service role) membaca `students` + `classes` seperlunya dan hanya
  mengembalikan nama/jenjang/kelas siswa AKTIF. Halaman publik tidak
  pernah membaca tabel students langsung.
- Skema: `supabase/migrations/0028_perpus_digital.sql` — tabel
  `perpus_buku` + `perpus_bab`, RLS baca publik (anon + authenticated),
  tulis klien ditutup; seed 10 buku / 23 bab persis preview.
- Progres baca & Rak Saya: localStorage per NIS di perangkat siswa
  (persis desain preview v8). Sinkronisasi progres ke server = tahap
  berikutnya, bersama halaman admin katalog (modul RBAC
  "Perpustakaan Digital").

## Yang TIDAK dikerjakan tahap ini

- Halaman admin/pustakawan untuk mengelola katalog (nanti: CRUD buku &
  bab, impor metadata SIBI massal, unggah PDF SIBI ke VPS + reader PDF).
- Reader PDF — tahap ini reader bab teks/HTML sesuai preview.
- Subdomain & vhost Nginx perpus (infra, menunggu arahan deploy).
