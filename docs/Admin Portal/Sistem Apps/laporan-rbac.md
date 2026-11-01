# Laporan Eksekusi — Hak Akses (RBAC) AdminV2

Tanggal: 1 November 2026 · Branch: `fitur/rbac` (backup: `backup/rbac-20261101`)
Acuan visual: preview RBAC v6 yang di-lock user (struktur v5 "selection simple" + tone shell AdminV2 asli).

## Yang dibangun

Halaman **Hak Akses (RBAC)** di `/adminV2/rbac` (menu Sistem Apps → Hak Akses (RBAC) kini menunjuk ke sini, tidak lagi ke `/admin/rbac` lama):

- Pilihan peran berupa **satu dropdown** (bukan kartu listing) — mengganti peran langsung menukar deskripsi, daftar pengguna, dan matriks izin.
- **Peran bisa di-CRUD**: tambah (mis. peran khusus yayasan/sekolah), ubah nama/deskripsi, hapus (terblokir selama masih berisi pengguna; konfirmasi dua klik). Bawaan 9 peran: Superadmin (terkunci, tidak bisa diubah/dihapus), Ketua Yayasan, Kepala Sekolah, Wakil Kepala Sekolah, Operator, Staff Adm, Wali Kelas, Guru Pengajar, Staff Sekolah — dengan izin bawaan persis preview v6.
- **Penugasan pengguna per peran** dari daftar guru/staff (tabel `teachers`) atau nama manual (untuk yayasan/kepsek yang tidak ada di tabel guru).
- **Matriks izin 23 modul × 4 aksi** (Lihat/Buat/Ubah/Hapus) dengan aturan ketergantungan: Buat/Ubah/Hapus menyalakan Lihat; mematikan Lihat membersihkan baris. Centang master per kolom tersedia. Matriks disimpan lewat tombol **Simpan Izin** (bar bawah); penugasan & CRUD peran langsung tersimpan.

## Tiga aturan user (1 Nov 2026) dan penegakannya

1. **Satu pengguna = satu peran.** Tabel `rbac_assignments` memakai `subjek_id` sebagai primary key dan penugasan disimpan dengan upsert — menugaskan pengguna ke peran baru otomatis melepaskannya dari peran lama. UI menampilkan peringatan sebelum pemindahan terjadi. Tidak ada pengalih peran di sisi pengguna.
2. **Izin ditegakkan, bukan sekadar tampilan.**
   - *Menu*: item modul yang tidak boleh dilihat peran pengguna disembunyikan di MegaPanel (desktop) dan MobileMenu.
   - *Rute*: middleware `rbac-access.global.ts` memetakan path AdminV2 → modul; tanpa izin Lihat, pengguna dialihkan ke Dashboard.
   - *Halaman RBAC*: bila peran pengguna hanya boleh melihat, semua tombol kelola nonaktif.
   - *Sumber kebenaran bersama*: `bisaSaya(modul, aksi)` dari `useRbac` — halaman/fitur lain bisa memakai fungsi yang sama untuk menyembunyikan tombol Buat/Ubah/Hapus (penerapan per halaman menyusul bertahap, lihat "Belum dikerjakan").
   - *Lapisan database*: migrasi menyediakan fungsi `public.rbac_can(modul, aksi)` (security definer) sebagai fondasi kebijakan RLS per tabel modul. Pengetatan RLS per tabel **belum** diterapkan di migrasi ini karena kebijakan lama tiap tabel harus diaudit dulu agar tidak mengunci aplikasi (query audit disertakan di bawah).
   - Penegakan sisi aplikasi aktif **per pengguna begitu ia ditugaskan sebuah peran**. Pengguna yang belum ditugaskan (termasuk akun pengelola selama masa penyiapan) belum dibatasi — ini masa peralihan yang disengaja sampai semua akun selesai ditugaskan.
3. **Cakupan jenjang per penugasan.** Setiap penugasan membawa centang **SMP / SMK** (boleh keduanya). Peran hanya berlaku di jenjang yang dicentang: guru yang hanya mengajar di SMK tidak mendapat akses apa pun saat pengalih jenjang berada di SMP (menu kosong untuk modul terkait + rute dialihkan). Chip pengguna menampilkan lencana jenjangnya.

## Berkas

| Berkas | Isi |
| --- | --- |
| `app/composables/rbacCore.ts` | Konstanta 23 modul, seed 9 peran + izin, fungsi murni (aturan centang, pemetaan judul/path, cakupan) |
| `app/composables/useRbac.ts` | State bersama, muat/simpan Supabase, CRUD peran & penugasan, `bisaSaya` |
| `app/components/adminV2/sistem/SistemPageShell.vue` | Cangkang halaman Sistem Apps (pola ModulPageShell) |
| `app/components/adminV2/sistem/RbacManager.vue` | UI halaman RBAC |
| `app/pages/adminV2/rbac/index.vue` | Rute halaman |
| `app/middleware/rbac-access.global.ts` | Penjaga rute per modul |
| `app/components/adminV2/AdminV2MegaPanel.vue` | + penyaringan item menu RBAC |
| `app/components/adminV2/AdminV2MobileMenu.vue` | + penyaringan item menu RBAC |
| `app/components/adminV2/adminV2Data.ts` | Destinasi Hak Akses → `/adminV2/rbac` |
| `supabase/migrations/0023_rbac.sql` | Tabel + fungsi + RLS + seed (dijalankan user di SQL Editor) |
| `tests/rbac.mjs` | 10 tes fungsi murni — semua lulus |

## Verifikasi

- `node --experimental-strip-types tests/rbac.mjs` → 10/10 lulus (termasuk jumlah izin bawaan per peran: Superadmin 92, Operator 73, Staff Adm 30, Guru 25, Wakasek 22, Yayasan 21, Kepsek 28, Staff 13, Wali Kelas 10).
- `npm run build` production → selesai; chunk rute `rbac` terverifikasi ada di `.output`.
- Tanpa migrasi 0023, halaman tetap terbuka dengan data awal lokal + pemberitahuan amber (pola defensif yang sama seperti Modul Pembelajaran / migrasi 0022).

## Belum dikerjakan (tahap berikutnya)

1. **Pengetatan RLS per tabel modul** memakai `rbac_can()` — perlu hasil audit kebijakan existing dulu:
   ```sql
   select schemaname, tablename, policyname, cmd, qual, with_check
   from pg_policies where schemaname = 'public' order by tablename, policyname;
   ```
2. **Tombol aksi per halaman** disembunyikan/dinonaktifkan memakai `bisaSaya(modul, 'buat'|'ubah'|'hapus')` — infrastruktur sudah siap, penerapannya per modul bertahap.
3. **Log Aktivitas** masih menunjuk halaman lama `/admin/log`.
4. Penugasan massal dari Manajemen User (saat ini penugasan dilakukan dari halaman RBAC; Manajemen User masih memakai store contoh lama).

## Perbaikan 1 Nov 2026 (sore) — temuan uji pakai user

1. **Lebar layout disamakan dengan halaman Sistem Apps lain.** Cangkang halaman semula meniru Modul Pembelajaran (`max-w-[1100px]`), padahal Manajemen User dan Profil memakai `max-w-[1440px]` — kini `SistemPageShell` dan bar Simpan Izin memakai 1440px persis halaman Sistem Apps lainnya.
2. **Daftar kandidat guru kosong — diperbaiki.** Query kandidat semula meminta kolom `unit` yang tidak ada di tabel `teachers` (skema aslinya `id, nip, name, grade, active`), sehingga query gagal diam-diam dan dropdown kosong. Kini memakai `select('id, name, grade').eq('active', true).order('name')`, sama seperti composable lain.
3. **Peran terkunci (Superadmin) kini bisa ditugaskan penggunanya.** Sebelumnya baris penugasan disembunyikan untuk peran terkunci sehingga tidak ada jalan menugaskan siapa pun sebagai Superadmin. Kini: yang terkunci hanya nama & izin peran; penugasan dan pelepasan pengguna tetap bisa. Ditambah tombol **Tugaskan akun saya** untuk menugaskan akun yang sedang login (subjek terikat ke `teachers.user_id`/uid auth, sehingga penegakan mengenali akun itu), lengkap dengan peringatan pemindahan bila akun sudah memegang peran lain.

## Perbaikan 1 Nov 2026 (sore, lanjutan) — floating chat & permukaan putih dark mode

- **Widget ChatbotAI tidak lagi tampil di portal admin.** Widget "AI Assistant / Tanya AI" adalah widget info pendaftaran untuk halaman publik, tetapi terpasang di layout `default`/`smk`/`smp` sehingga ikut muncul di `/adminV2/*` (termasuk halaman RBAC), membawa permukaan putih (gelembung "Butuh info pendaftaran?", laci chat, modal) yang tidak terpetakan tema gelap AdminV2. Perbaikan di `app/components/ChatbotAI.vue`: seluruh elemen widget digerbang `useRoute` — tidak dirender pada rute `/admin*` (termasuk login admin), tetap tampil normal di halaman publik.
