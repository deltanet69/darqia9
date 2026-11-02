# Brief — Fitur Tiketing (Sistem Apps)

Handoff development. Sumber kebenaran desain: pratinjau interaktif v3 yang sudah
di-approve user (3 Nov 2026). Port dengan setia; jangan menambah fitur di luar brief ini.

## Tujuan
Pengguna (semua peran kecuali Superadmin) membuat tiket aduan/issue; Superadmin
menerima, menangani, dan menutupnya. Satu tiket = satu persoalan.

## Aturan bisnis (dikunci user, jangan diubah)
1. **Visibilitas (keras):** hanya Superadmin yang boleh melihat SELURUH tiket masuk
   beserta detailnya. Role lain HANYA melihat tiket pribadinya sendiri (daftar,
   detail, pencarian, statistik). Ditegakkan di RLS database, bukan sekadar UI.
2. **Kategori tiket** = 23 modul aplikasi (sama persis dengan `RBAC_MODUL`) ditambah:
   Login, Jaringan / Network, Integrasi Data, Lainnya. Di form tampil berkelompok
   (optgroup "Modul Aplikasi" / "Kendala Teknis & Lainnya").
3. **Grade mengikuti pengalih jenjang** (`useAdminGrade`): daftar pelapor hanya
   menampilkan tiket grade aktif; tiket baru tercatat pada grade aktif, tidak
   dipilih manual di form.
4. **ID tiket per grade:** `TKT-<GRADE>-<TAHUN>-<URUT 4 digit>`, nomor urut berjalan
   terpisah per grade per tahun, diterbitkan trigger database (tabel tiket_counter).
5. **Form pelapor persis 4 isian:** Judul (wajib), Issue/Kategori (wajib),
   Komentar/Deskripsi (wajib), Upload file (gambar JPG/PNG, opsional, maks 1 MB,
   1 berkas). TIDAK ADA field prioritas.
6. **Status:** Baru → Diproses / Menunggu Info → Selesai / Ditutup.
   **Progress:** 0 / 25 / 50 / 75 / 100 (diatur Superadmin; Selesai = 100).
7. **Superadmin:** Kotak Masuk semua grade dengan filter Semua Grade / SMP Saja /
   SMK Saja + status + kategori + pencarian; update status & progress + catatan;
   balas/komentar dengan lampiran gambar bukti penanganan (opsional).
8. **Log Penanganan** per tiket: setiap pembuatan, perubahan status/progress,
   komentar, pengubahan, dan pembukaan-kembali tercatat (pelaku, waktu, catatan).
9. Pelapor boleh **mengubah** tiketnya hanya selama berstatus Baru, dan **menghapus**
   tiketnya sendiri (konfirmasi dulu). Superadmin boleh menghapus tiket (spam).
   Komentar pelapor pada tiket Selesai/Ditutup **membuka kembali** tiket (Diproses).
10. Tiketing **TIDAK** masuk matriks RBAC: menu tampil untuk semua akun yang login
    ('Tiketing' tidak ada di `JUDUL_KE_MODUL`/`PATH_KE_MODUL` → penjaga rute dan
    penyaring menu otomatis melewatkannya). Jangan tambahkan ke RBAC_MODUL.

## Kontrak data (migrasi 0025)
- `tiket` (nomor diterbitkan trigger; grade; judul; deskripsi; kategori; status;
  progress; pelapor_id = auth.uid(); snapshot pelapor_nama & pelapor_peran;
  lampiran_path/nama; created_at/updated_at).
- `tiket_pesan` — balasan saja (append-only): penulis, dari_superadmin, teks,
  bukti_path/nama. Utas = deskripsi tiket sebagai pesan pertama + tiket_pesan.
- `tiket_log` — append-only: pelaku, teks, catatan.
- `tiket_boleh_akses(uuid)` SECURITY DEFINER: pemilik tiket ATAU `rbac_superadmin()`.
- RLS: tiket select = pemilik/superadmin; insert = pelapor_id = auth.uid();
  update/delete = pemilik/superadmin, DITAMBAH trigger penjaga kolom: non-Superadmin
  tidak dapat mengubah status/progress/grade/nomor/pelapor, dan judul/kategori/
  deskripsi hanya saat status lama = Baru.
- Bucket privat `tiket-lampiran` (file_size_limit 1 MB), path `<tiket_id>/<nama>`;
  kebijakan storage memakai `tiket_boleh_akses()` pada segmen folder pertama.

## Struktur kode
- `app/composables/tiketingCore.ts` — konstanta + logika murni (saring, statistik,
  teks log, validasi). Kategori modul diambil dari `RBAC_MODUL` (sumber tunggal).
- `app/composables/useTiketing.ts` — lapisan data Supabase + state bersama.
  Deteksi Superadmin sama seperti LogAktivitasManager (peran terkunci / email utama).
  Instrumentasi Log Aktivitas: `catat('Tiketing', ...)` untuk buat & penanganan.
- `app/components/adminV2/sistem/TiketingManager.vue` — daftar (mode pelapor:
  Tiket Saya per grade aktif; mode Superadmin: Kotak Masuk + filter grade).
- `app/components/adminV2/sistem/TiketingForm.vue` — buat & ubah tiket.
- `app/components/adminV2/sistem/TiketingDetail.vue` — utas, komentar, log,
  panel Tangani Tiket (Superadmin), ubah/hapus (pelapor).
- `app/pages/adminV2/tiketing/index.vue` — SistemPageShell (modul "Tiketing")
  + orkestrasi tampilan daftar/form/detail.
- `app/components/adminV2/adminV2Data.ts` — item menu Sistem "Tiketing" +
  tujuan `/adminV2/tiketing`.
- `tests/tiketing.mjs` — uji logika tiketingCore.

## Yang dilarang
- Data/contoh fiktif ter-commit sebagai data asli; PII asli dalam bentuk apa pun.
- CSS scoped/konvensional di komponen (wajib Tailwind penuh).
- Mengubah daftar 23 modul RBAC atau menambah gerbang RBAC untuk Tiketing.
- Dependensi baru.

## Definition of done
- Migrasi 0025 terpasang di repo (`supabase/migrations/`), SQL-nya diserahkan ke
  user untuk dijalankan di Supabase SQL Editor.
- `tests/tiketing.mjs` lulus; build produksi sukses dan terverifikasi dari chunk
  hasil build (string khas fitur ditemukan) + timestamp `.output` baru.
- Halaman menampilkan keadaan ramah "migrasi belum dijalankan" bila tabel belum ada.
