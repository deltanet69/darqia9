# Laporan — Log Aktivitas (Sistem Apps)

Tanggal: 1 November 2026 · Status: kode selesai & build lulus; **menunggu migrasi 0024 dijalankan user** di Supabase SQL Editor sebelum data mulai tercatat.

## Keputusan desain (permintaan user)
1. **Bukan satu baris per aktivitas di UI** — log tampil sebagai grup: satu baris per (modul, aksi) berisi jumlah, mis. "Login — 10×". Klik grup membuka daftar pelaku (siapa, peran, rincian, waktu), dimuat malas maks 50 baris terbaru.
2. **Ringan** — rekap dihitung di database oleh fungsi `log_rekap(sejak)`; halaman hanya menarik ≤ (jumlah modul × jenis aksi) baris agregat + satu query kecil per grup yang dibuka. Tidak ada penarikan ribuan baris mentah.
3. **Rekap per modul jelas + jalur masalah** — kartu ringkasan (total aktivitas, total galat, modul tercatat), saringan "Hanya masalah", dan lencana galat per modul/grup untuk kebutuhan troubleshoot/bottleneck.
4. **Khusus Superadmin, ditegakkan di database** — RLS select memakai `rbac_superadmin()` (peran terkunci atau email utama) dan `log_rekap()` menolak pemanggil non-Superadmin. UI juga menampilkan panel terkunci.

## Data (migrasi 0024)
- Tabel `activity_logs` (id, created_at, actor_id, actor_name, actor_role, modul, aksi, tingkat info/galat, detail, jenjang) + indeks (modul, aksi, created_at desc) dan (created_at desc).
- RLS: insert untuk authenticated dengan `actor_id = auth.uid()` (tidak bisa memalsukan log orang lain); server memakai service role. Select khusus `rbac_superadmin()`.
- Fungsi `rbac_superadmin()` + `log_rekap(sejak)` (security definer, memeriksa Superadmin di dalamnya).

## Pencatatan (instrumentasi)
- Klien: composable `useLogAktivitas().catat(...)` — fire-and-forget, kegagalan mencatat tidak pernah mengganggu aksi pengguna.
- Login (login.vue, aktor eksplisit dari hasil sign-in) & logout (AdminV2Popovers, sebelum signOut) → modul "Sistem".
- Galat aplikasi: plugin `log-error.client.ts` menangkap vue:error + unhandledrejection → aksi "error" tingkat galat, dibatasi (jeda ≥3 dtk; pesan sama ≤1×/30 dtk) agar tidak banjir.
- RBAC (useRbac): buat/ubah/hapus peran, ubah izin, tugaskan, lepaskan → modul "Hak Akses (RBAC)".
- Modul Pembelajaran (useModulPembelajaran): buat/ubah modul, kirim persetujuan, setujui, kembalikan, arsipkan, pulihkan.
- Server (endpoint Manajemen User, via `catatLogServer` + service role): buat akun (termasuk impor guru), ubah akun, reset sandi, aktifkan/nonaktifkan, hapus akun → modul "Manajemen User".
- Modul lain dapat ikut mencatat cukup dengan memanggil `useLogAktivitas().catat(modul, aksi, detail)` dari composable/aksinya — pola yang sama dipakai bertahap sesuai prioritas pengembangan.

## Halaman
- Rute `/adminV2/log-aktivitas` (menu "Log Aktivitas" dialihkan dari legacy `/admin/log`), shell Sistem Apps (SistemPageShell digeneralisasi: prop modulLabel/modulTo, bawaan tetap RBAC).
- Rentang: Hari ini / 7 hari / 30 hari. Keadaan khusus tertangani: panel "khusus Superadmin", panel petunjuk bila migrasi 0024 belum dijalankan, pesan galat muat.
