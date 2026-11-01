# Laporan — Manajemen Pengguna: CRUD + Impor dari Data Guru

Status: SELESAI dieksekusi (1 Nov 2026, branch `fitur/manajemen-user-crud` → master).
Melengkapi halaman Manajemen Pengguna yang sebelumnya hanya membaca daftar akun Supabase Auth.

## Konfigurasi server (prasyarat, dilakukan user)

- Endpoint membaca akun Auth lewat service role — wajib env `NUXT_SUPABASE_SECRET_KEY`
  di server (diisi user dari dashboard Supabase ke `.env` laptop, 1 Nov 2026; halaman langsung tampil).
- Saat deploy production, env yang sama wajib dipasang di server production.

## Endpoint (server/api/admin/users/, struktur folder dari users.get.ts)

| Method | Rute | Fungsi |
|---|---|---|
| GET | /api/admin/users | Daftar akun + label peran RBAC (penugasan mengalahkan label metadata lama) + peranId/jenjang/guruId per akun |
| POST | /api/admin/users | Buat akun (email terverifikasi langsung); opsional peranId + jenjang; bila guruId diisi: record guru ditautkan (teachers.user_id) dan penugasan memakai id guru |
| PATCH | /api/admin/users/:id | Nama, kata sandi baru, aktif/nonaktif (ban), ganti/lepas penugasan RBAC |
| DELETE | /api/admin/users/:id | Hapus akun + penugasan RBAC + tautan guru dibersihkan |

Gerbang bersama `server/utils/adminUsersGate.ts` per aksi (lihat/buat/ubah/hapus):
email Superadmin Utama → role metadata auth lama → peran terkunci RBAC (semua aksi)
→ matriks izin RBAC modul "Manajemen User" sesuai aksi. Penjaga: Superadmin Utama
tidak bisa dinonaktifkan/dihapus; pengguna tidak bisa menonaktifkan/menghapus akun sendiri.

## Antarmuka (app/pages/adminV2/users/index.vue)

- Tombol "Tambah Pengguna" + "Impor dari Guru" di header (di samping Muat Ulang Data).
- Kolom Aksi di tabel desktop + baris aksi di kartu mobile: Ubah, Nonaktifkan/Aktifkan.
- `UserFormModal.vue` — tambah/ubah: nama, email (terkunci saat ubah), kata sandi,
  peran RBAC + jenjang; zona bahaya hapus permanen dengan konfirmasi dua langkah di modal ubah.
- `UserImportModal.vue` — daftar guru aktif: yang bisa diimpor (email terisi & belum
  punya akun) tercentang otomatis; penanda "Sudah punya akun" / "Email kosong";
  satu kata sandi awal + peran untuk semua (bawaan: peran Guru), jenjang mengikuti
  jenjang guru (Yayasan = SMK + SMP); hasil per guru dilaporkan baris per baris.
- Pita pesan hasil aksi (hijau sukses / merah gagal) di bawah header halaman.

## Verifikasi

- Build production exit 0; tabel rute .output memuat keempat rute di atas.
- Tes klik manual oleh pemilik (buat akun uji, ubah, nonaktifkan, impor 1–2 guru) masih menyusul.
