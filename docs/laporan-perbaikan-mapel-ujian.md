# Laporan Perbaikan — Mapel Buat Ujian dari Master Mapel

Tanggal: 28 Oktober 2026 · Branch: `fitur/ujian-mapel-master` (backup: `backup/ujian-mapel-master-20261028`)

## Gejala (laporan owner + tangkapan layar)

Wizard **Buat Ujian** Langkah 1: setelah memilih rombel (contoh: RL XI), daftar
**Mata Pelajaran** kosong — hanya "Pilih mata pelajaran".

## Akar masalah

`availableSubjects` di `CbtV2Exams.vue` menyaring mapel dari **bank soal**:
mapel hanya muncul bila sudah ada paket bank untuk rombel terpilih. Rombel yang
belum memiliki bank soal sama sekali (wajar untuk rombel baru) tidak menampilkan
mapel apa pun, padahal Master Mapel jenjangnya lengkap — alurnya buntu: ujian
tidak bisa dibuat sebelum ada bank, tetapi pilihan mapelnya justru dikunci oleh
bank. Pola yang sama sebelumnya diperbaiki di Bank Soal (fallback Master Mapel).

## Perbaikan

- `availableSubjects` kini selalu mengambil **seluruh mapel aktif jenjang dari
  Master Mapel** (`subjects` menurut `grade`), tidak lagi bergantung pada bank soal.
- Computed baru `subjectHasBank`: bila mapel terpilih belum memiliki bank soal di
  rombel tersebut, wizard menampilkan catatan kuning di Langkah 1 — "Belum ada
  bank soal untuk mapel ini di rombel ini. Buat dulu bank soalnya di tab Bank
  Soal…" — dan penjaga lama di `goStep2` tetap menolak lanjut dengan pesan yang
  sama, jadi tidak ada jalan buntu diam-diam.

## Verifikasi

- `node tests/cbt-banksoal.mjs` — exit 0. Assert regresi baru: dengan daftar bank
  dikosongkan total, mapel Master tetap muncul di `availableSubjects`;
  `subjectHasBank` berubah benar/salah sesuai ketersediaan bank. (Catatan: assert
  menanam ulang state mapel karena `load()` tiruan di tengah suite mengosongkan
  state saat error — perilaku lama, bukan dari perubahan ini.)
- `npm run build` — exit 0.

## Cara uji owner

Buka Buat Ujian → pilih rombel yang belum punya bank soal → daftar Mata Pelajaran
kini berisi seluruh mapel Master jenjang tersebut. Pilih mapel yang belum ada
banknya → catatan kuning muncul dan tombol Lanjut ditolak dengan penjelasan;
buat banknya di tab Bank Soal, kembali, catatan hilang dan ujian bisa dilanjutkan.
