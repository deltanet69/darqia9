# Laporan — Mode Gelap (Dark Navy) AdminV2

Tanggal: 29 Oktober 2026 (mulai 28 Okt malam)
Branch kerja: `fitur/dark-mode` — cadangan: `backup/dark-mode-20261028`

## Yang diminta

Mode terang/gelap untuk AdminV2 sesuai desain yang dikunci user (preview v3,
28 Okt 21:26 WIB): **tidak ada layout, teks, atau fungsi yang berubah** —
satu-satunya tambahan adalah baris saklar "Mode Gelap" di dalam menu profil,
di antara Pengaturan dan Keluar; tema gelapnya "Dark Navy", transisi halus,
pilihan tersimpan, bawaan mengikuti setelan sistem.

## Yang dikerjakan (6 berkas)

1. `app/components/adminV2/AdminV2Popovers.vue` — baris **Mode Gelap** bersaklar
   di popover profil (antara Pengaturan dan Keluar): ikon bulan, teks status
   Aktif/Nonaktif mengikuti keadaan, klik baris/saklar mengganti tema tanpa
   menutup popover; bisa dioperasikan keyboard (Enter/Spasi). Inisialisasi tema
   dipanggil saat komponen terpasang.
2. `app/composables/useAdminTheme.ts` (baru) — keadaan tema bersama
   (`useState`), `toggleTheme`/`setTheme`/`initTheme`; pilihan tersimpan di
   `localStorage` (`darqia-admin-theme`); pertama kali mengikuti
   `prefers-color-scheme`. Tema diterapkan lewat atribut `data-theme="dark"`
   di `<html>` + `color-scheme: dark`.
3. `app/plugins/admin-theme.client.ts` (baru) — menerapkan tema sedini mungkin
   sebelum aplikasi tampil (anti kedipan terang) dan **hanya di rute
   `/adminV2`**; atribut tema dilepas otomatis saat pengguna pindah ke halaman
   publik, jadi website publik tidak pernah ikut berubah.
4. `app/assets/css/admin-dark.css` (baru) — pemetaan ulang palet: seluruh
   warna terang komponen AdminV2 (permukaan, teks, garis tepi, pembagi,
   keadaan hover, varian slate) dipetakan ke keluarga Dark Navy
   (latar `#050C1D`, permukaan `#0A1830`/`#0C1E3A`, garis `#1C3560`,
   teks `#E9EFFA`/`#93A5C4`). Warna merek (biru `#1B5FD9`, hijau SMP,
   gradasi jenjang, panel yang memang selalu gelap) sengaja TIDAK diubah.
   Didaftarkan di `nuxt.config.ts` (daftar `css`).
5. `app/components/adminV2/AdminV2Icon.vue` — ikon `moon` baru mengikuti pola
   ikon yang ada.
6. `nuxt.config.ts` — satu baris: pendaftaran `admin-dark.css`.

## Verifikasi

- `node --experimental-strip-types tests/cbt-banksoal.mjs` → **exit 0**.
- `npm run build` → **exit 0** (percobaan pertama gagal di minifikasi
  lightningcss: selektor nilai arbitrary wajib lolos `#` sebagai `\#`
  — 219 selektor diperbaiki, build ulang lulus).
- Uji klik manual oleh pemilik (buka menu profil → nyalakan Mode Gelap,
  keliling dashboard/CBT/siswa) tetap disarankan sebagai pemeriksaan akhir
  visual; pemetaan warna bersifat menyeluruh dari inventaris warna repo,
  tetapi halaman dengan warna sangat khusus bisa dilaporkan bila ada yang
  terlewat.

## Catatan

- Tema hanya berlaku di AdminV2; portal publik dan CBT siswa tidak berubah.
- Tidak ada dependensi baru; tidak ada migrasi basis data.
