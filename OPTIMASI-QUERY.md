# Optimasi Query Darqia 9

Commit: `83b6be4` · Cakupan: `app/composables/` · Sifat: murni optimasi query, tanpa perubahan fitur, UI, skema DB, atau migrasi.

## Latar belakang

- Server sehat: aplikasi di localhost VPS 7 ms, lewat Cloudflare 55–100 ms.
- Supabase di Singapura dengan latensi 90–300 ms per query. Masalah utama adalah jumlah dan bobot query, bukan server.
- Kondisi awal di `app/`: 209× `.from()`, 118× `select('*')`, 3× `.limit()`, 7× `.range()`.
- Bukti ukur: `students` dengan `select('*')` = 841 baris / 1.084 KB / 835 ms. Query ramping (kolom inti + limit 100) = 12 KB / 136 ms.

## Pola baku

1. Kolom eksplisit, tidak ada lagi `select('*')` di cakupan.
2. Daftar memakai `.range()`. Detail diambil per baris saat dibutuhkan.
3. Statistik dihitung sekali per konteks (jenjang), disimpan di `useState`, dan tidak dihitung ulang saat search, filter, atau pindah halaman.
4. Search memakai debounce 300 ms dan hanya memuat ulang daftar.
5. Data master (kelas, mapel, guru) di-cache di `useState`.
6. Query yang tidak saling bergantung dijalankan dengan `Promise.all`.

## Hasil per composable

Payload adalah estimasi dari ukuran kolom, bukan hasil pengukuran.

| Composable | Pola lama | Pola baru | Query per load | Payload |
|---|---|---|---|---|
| `useAdminStudents` | `select('*')` + embed RFID. Waterfall: classes, lalu list + 4 count, lalu rfid_cards, lalu count RFID. Diulang penuh tiap filter atau ketik. | 16 kolom inti untuk daftar. Statistik dan kelas di-cache per jenjang, paralel dengan daftar. | Pertama kali ±8 (satu gelombang paralel). Filter, search, ganti halaman: 1. | Daftar 20 baris: ±26 KB menjadi ±5 KB |
| `useKeuangan` | 7× `select('*')`. Rilis tagihan menunggu di akhir. | Kolom eksplisit. Rilis tagihan masuk `Promise.all`. | 1 round-trip lebih sedikit | Sedikit turun |
| `useAdminCbtData` | Exams `select('*')`. Paging siswa berurutan. | Kolom exams eksplisit. Halaman siswa berikutnya paralel. | Round-trip siswa: N menjadi 2 | Exams lebih ramping |
| `useTiketing` | 5× `select('*')`. | Kolom eksplisit. | Tetap | Setara |
| `useJadwalPelajaran` | Master, lalu hitung siswa, lalu jadwal, lalu sesi. Master guru diambil ulang tiap load. | Siswa, jadwal, dan sesi paralel. Master guru di-cache. | 4 gelombang menjadi 2 | Master guru tidak diambil ulang |
| `useJadwalMengajar` | Paging roster berurutan. Jadwal lalu sesi. | Roster paralel. Jadwal dan sesi paralel. | Roster: N menjadi 2. Jadwal+sesi: 2 menjadi 1 | Tetap |
| `useAdminSubjects` | Refetch tiap mount. | Cache di state. Refetch hanya lewat `load(true)` setelah mutasi. | Pindah halaman: 6 menjadi 0 | 0 |
| `useRbac` | 3 await berurutan, lalu guru dan getUser berurutan. 3× `select('*')`. | Matriks, guru, dan getUser paralel. Kolom eksplisit. | 6 gelombang menjadi 2 | Sedikit turun |
| `useRuangUjian` | Sudah ramping dan berpaginasi. | Tidak diubah. | – | – |

## Daftar file yang diubah

- `useAdminStudents.ts`: kolom daftar dan kolom lengkap eksplisit; statistik dan kelas di-cache per jenjang; Detail, Edit, dan Export mengambil baris lengkap; import dan sinkron RFID paralel; debounce search 300 ms.
- `useKeuangan.ts`: kolom eksplisit; rilis tagihan masuk `Promise.all`; fallback bila kolom `jumlah_setor` belum ada (migrasi 0030).
- `useAdminCbtData.ts`: kolom exams eksplisit; paging siswa aktif paralel.
- `useTiketing.ts`: kolom eksplisit pada 5 query.
- `useJadwalPelajaran.ts`: siswa, jadwal, sesi paralel; master guru di-cache.
- `useJadwalMengajar.ts`: roster paralel; jadwal dan sesi paralel.
- `useAdminSubjects.ts`: master mapel di-cache; refetch hanya setelah mutasi.
- `useRbac.ts`: query matriks, guru, dan getUser paralel; kolom eksplisit.

## Perubahan perilaku yang perlu diketahui

- Tombol Detail dan Edit pada Data Siswa kini mengambil baris lengkap lebih dulu, sehingga modal muncul setelah jeda satu query.
- Perubahan master mapel atau guru dari halaman lain baru terlihat setelah refresh, karena datanya di-cache.

## Belum dikerjakan (butuh keputusan)

- Agregat `useAdminCbtData` (assignments, violations) dan `useAdminSubjects` (banks, exams) masih menarik tabel penuh untuk dihitung di klien. Paginasi akan mengubah hasil agregat. Solusi yang benar adalah RPC atau view agregat, yang membutuhkan migrasi.
- `useKeuangan`: himpunan siswa, penetapan, dan rekap per jenjang harus utuh untuk perhitungan tagihan di klien, jadi tidak dipaginasi (sudah di-cache per jenjang).
- `useTiketing`: daftar tiket belum dipaginasi karena filter berjalan di klien dan volumenya kecil.
- Di luar cakupan dan masih memakai `select('*')`: `useModulPembelajaran`, `useAdminCbtState`, `useSpmbAdmin`, `usePerpus`, `useAdminTeachers`.

## Verifikasi

- `npm run build` lulus tanpa error.
- Belum diuji terhadap Supabase asli. Cek manual di Data Siswa: bandingkan KPI (total, L, P, aktif, RFID) serta hasil filter RFID, kelas, dan search dengan sebelum optimasi.
