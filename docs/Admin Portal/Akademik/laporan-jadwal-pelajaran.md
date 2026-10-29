# Laporan — Jadwal Pelajaran (Akademik)

Tanggal: 30 Oktober 2026 · Cabang fitur: `fitur/jadwal-pelajaran` · Cadangan: `backup/jadwal-pelajaran-20261030`

## Ringkasan

Halaman **Jadwal Pelajaran** kini hidup di `/adminV2/jadwal-pelajaran` (menu Akademik diperbaiki dari rute lama `/admin/jadwal-pelajaran`). Halaman ini adalah penulis UI pertama untuk tabel resmi `class_schedules` — sebelumnya tabel hanya dibaca Bank Soal/CBT dan Master Mapel, sehingga penugasan guru × mapel × kelas tidak bisa diatur dari aplikasi.

Jenjang mengikuti switcher global top navbar (`useAdminGrade`), bukan switcher lokal halaman.

## Yang dibangun

- `app/pages/adminV2/jadwal-pelajaran/index.vue` — shell AdminV2 (header, breadcrumb Akademik, mega panel).
- `app/composables/useJadwalPelajaran.ts` — store + logika murni teruji: susun slot jam dari setelan, pemetaan waktu ↔ jam ke-, mesin anti-bentrok, baca tingkat dari nama kelas, hitung kejadian hari untuk rekap.
- Komponen `app/components/adminV2/jadwal/`:
  - `JadwalManager.vue` — mode Per Kelas: pemilih kelas berkelompok per angkatan (dropdown optgroup + tombol geser), pemilih tahun ajaran, KPI, strip pantau kehadiran hari ini, panel KKM & Pengajar di bawah timetable.
  - `JadwalTimetable.vue` — timetable **CSS grid murni** (bukan tabel rowspan): tinggi baris jam terkunci (78px, istirahat 34px), setiap jadwal mulai/berakhir tepat di garis jamnya; penanda baris jam yang sedang berlangsung + sesi live berbingkai biru.
  - `JadwalFormModal.vue` — CRUD jadwal dengan validasi bentrok real-time (tombol Simpan mati saat bentrok).
  - `JadwalSetelanModal.vue` — Pengaturan Jam & Istirahat per jenjang (jam mulai, durasi JP, jumlah jam, daftar jeda) + pratinjau susunan hari.
  - `JadwalGuruView.vue` — mode Per Guru baca-saja: dropdown guru berkelompok per unit + ringkasan beban JP dan kelas yang diajar.
  - `RekapMengajar.vue` — tab **Rekap Mengajar** di halaman Absensi Guru (tab "Presensi Harian | Rekap Mengajar"): per guru sesi terjadwal/mengajar/tidak hadir/total JP/persen per bulan + unduh Excel.
- `tests/jadwal-pelajaran.mjs` — 11 kelompok tes logika murni (semua lolos).
- `supabase/migrations/0020_jadwal_pelajaran.sql` — lihat bagian Migrasi.

## Anti-bentrok (3 lapis, satu mesin `cariBentrok`)

1. **Guru**: guru yang sama + hari sama + rentang tumpang tindih di kelas mana pun → diblokir, alert menyebut nama guru, mapel, kelas, hari, dan jam konfliknya.
2. **Kelas**: kelas yang sama terisi pada rentang itu → diblokir.
3. **Ruangan**: ruangan yang sama dipakai kelas lain pada rentang itu → diblokir.
Rentang yang hanya bersebelahan (selesai 08:30, mulai 08:30) tidak dianggap bentrok. Di basis data, constraint `unique (class_id, day_of_week, starts_at)` tetap menjadi pengaman terakhir.

## Integrasi data

- Membaca: `classes` (aktif, per jenjang + tahun ajaran), `subjects` (KKM + target JP dari Master Mapel), `teachers`, `students` (jumlah siswa per kelas).
- Menulis: `class_schedules` (insert/update/delete langsung; tidak ada tabel bayangan).
- Karena `class_schedules` kini terisi dari UI, hak akses Bank Soal/CBT dan daftar pengajar di Master Mapel — yang memang membaca tabel ini — otomatis mengikuti jadwal resmi.
- Jadwal lama yang waktunya tidak mengikuti pola jam aktif **tidak dibuang**: ditandai dalam kotak peringatan di bawah timetable agar operator menyelaraskannya lewat formulir.

## Migrasi 0020 (WAJIB dijalankan manual di Supabase SQL Editor)

1. `class_schedules.notes` — kolom keterangan sesi.
2. `jadwal_settings` — pola jam & istirahat per jenjang (RLS: staf).
3. `teaching_sessions` — sesi mengajar harian per jadwal (unik per jadwal per tanggal; RLS: staf penuh, guru untuk baris miliknya).

Kode sudah defensif sebelum migrasi jalan: CRUD inti tetap berfungsi (kolom notes dilewati otomatis), pengaturan jam jatuh ke pola bawaan, penanda sesi kosong. Fitur penuh aktif setelah migrasi dijalankan.

## Sesi mengajar & rekap — batasan jujur

Penanda kehadiran (Belum mulai / Sedang mengajar / Selesai / Tidak hadir) dan Rekap Mengajar **membaca** `teaching_sessions`. Yang **menulis** tabel itu adalah tombol Mulai/Selesai Mengajar di halaman Jadwal Mengajar guru — halaman tersebut saat ini masih memakai data contoh, jadi penanda akan kosong sampai Jadwal Mengajar dihubungkan ke `class_schedules` + `teaching_sessions` (pekerjaan lanjutan tersendiri, di luar cakupan ini). Struktur tabel dan sisi bacanya sudah siap.

## Verifikasi

- `node --experimental-strip-types tests/jadwal-pelajaran.mjs` → 11 kelompok lolos.
- Regresi: `tests/spmb-admin.mjs` 10 kelompok lolos; `tests/cbt-banksoal.mjs` exit 0.
- `npm run build` → exit 0; rute `jadwal-pelajaran` terdaftar di hasil build.
- Uji klik manual dengan akun staf asli (membuat jadwal pertama, memicu bentrok, mengubah pola jam) tetap perlu dilakukan pemilik.

## Addendum 30 Okt 2026 — Dark mode (Seksi 13)

Uji live pemilik dalam Mode Gelap menemukan komponen jadwal memakai rumpun warna yang belum terpetakan di `app/assets/css/admin-dark.css`: judul/teks `blue-950` nyaris tak terbaca di atas kartu gelap, kolom jam (`bg-slate-50/50`) dan strip pantau (`bg-blue-50/60`, `bg-blue-100/70`) tampil sebagai blok terang, chip KKM kosong (teks hilang + border `blue-100` pucat), dan pembagi `slate-50` menyilaukan. Ditambahkan **Seksi 13** pada file yang sama (14 aturan, nilai mengikuti palet terkunci: teks utama #E9EFFA, penegas #C4D0E4, permukaan #22345C, garis #16294D/#22386B) — mode terang dan seksi lain tidak diubah. Kelas-kelas tersebut saat ini hanya dipakai komponen jadwal (terverifikasi grep), jadi halaman lain tidak terpengaruh. Diverifikasi dengan harness visual statis (markup kelas yang sama + CSS asli) sebelum/sesudah: semua elemen terbaca dan senada Dark Navy.
