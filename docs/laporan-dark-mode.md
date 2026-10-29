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

## Pembaruan Ronde 2 — 29 Oktober 2026

Umpan balik pemilik dari uji live (5 poin): garis terlalu kontras, sebagian
container masih terang, grafik kurang baik, ubin ikon menyatu dengan latar,
dan kolom formulir kurang oke. Akar masalah hasil inventaris ulang
(589 token warna, termasuk komponen lama `app/components/admin/` yang
diimpor halaman AdminV2 — modal siswa & grafik garis/donat — dan varian
opacity + varian keadaan hover/focus yang belum terpetakan):

- Garis: `border-[#F1F5F9]`, `border-[#F2F4F7]`, `divide-[#F1F5F9]`,
  `border-slate-200/80` (113×), dan keluarga border pucat lain → keluarga
  navy redup (#16294D / rgba navy). Putih kini hanya untuk teks.
- Container: `bg-slate-50/70–/90` (strip tab & kaki modal siswa),
  `bg-slate-200`, `bg-[#E7EBF2]`, `bg-[#CBD5E1]`, latar lembut palet bernama
  (blue/emerald/rose/purple/violet/amber-50) → Dark Navy.
- Grafik: warna kerangka SVG dipetakan lewat pemilih atribut
  (Seksi 9) — garis kisi #1C3560, label sumbu, angka tengah donat.
- Ikon: ubin `bg-blue-50` dkk kini gelap (Seksi 3) sehingga ikon tidak
  lagi berada di atas ubin terang.
- Formulir (Seksi 8 baru): `focus:bg-white` (59×) dan ring fokus pucat
  dipetakan — kolom aktif tidak lagi putih terang.
- Total aturan 75 → 185; seluruh aturan ronde 1 utuh (terverifikasi
  otomatis). Semua aturan tetap terkurung `html[data-theme="dark"]` —
  **mode terang tidak berubah sama sekali**. Tes exit 0, build exit 0.

## Pembaruan Ronde 3 — 29 Oktober 2026

Umpan balik pemilik: (1) Agenda Mengajar masih banyak putih, (2) kartu
"Total Siswa Aktif" dashboard masih putih, (3) teks biru daftar siswa
sulit dibaca di Dark Navy. Hasil diagnosis:

- Agenda memakai `<style scoped>` sendiri (variabel `--ink/--ink-2/
  --ink-3/--line` + puluhan warna langsung), di luar jangkauan pemetaan
  kelas Tailwind. Seksi 10 baru menimpa gaya bawaan itu khusus gelap:
  variabel halaman digelapkan (satu aturan memperbaiki teks & garis
  seluruh halaman), strip tab, dropdown filter, tabel F.32 (kepala,
  kolom nama lengket, sel H/S/I/A), kartu skor, rekap, dan panel jurnal.
- Kartu hero dashboard memakai gradien `from-white to-[#F2F6FF]`
  (satu-satunya pemakaian kombinasi itu) — kini digelapkan lewat
  variabel gradien, plus cincin tipis untuk tombol gelapnya.
- Teks biru dilembutkan: #5B96F5 → #9DBEF9 dan #6EA8FE → #A9C6FA
  (keluarga text biru merek + blue-600/700) — kontras naik, jenuh turun.
- Total aturan 185 → 253; selain 6 nilai biru itu, semua aturan lama
  utuh (terverifikasi otomatis). Mode terang tetap nol perubahan.
  Tes exit 0, build exit 0.

## Ronde 4 — Halaman Profil (29 Okt 2026, siang)
Atas permintaan user agar Profil Saya selaras dengan halaman lain di mode gelap. Tiga akar masalah: (1) jalur cincin Kelengkapan Profil memakai KELAS `stroke-[#EFF2F7]` — pemetaan Seksi 9 hanya menangkap atribut SVG, jadi jalurnya tetap putih; (2) hero profil memakai gradien sebaris yang jauh lebih cerah daripada kartu Dark Navy lain; (3) ujung gradien kartu RFID & panel Smartcard (#1D4ED8) menyala sendiri di atas kartu gelap. Perbaikan = **Seksi 11** baru di `admin-dark.css` (aturan kelas stroke → #1C3560; gradien RFID/Smartcard diturunkan via variabel --tw-gradient; latar hero dipergelap via kelas kait baru `profil-v2-hero` + !important karena latarnya style sebaris) + 1 baris kelas kait di `ProfilV2Hero.vue`. Desain Profil v4 yang terkunci tidak berubah; light mode nol perubahan. Backup `backup/dark-profil-20261029`; tes + build exit 0.
