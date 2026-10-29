# Laporan — Manajemen SPMB AdminV2 + Penempatan Kelas

Tanggal: 29 Oktober 2026 · Backup: `backup/spmb-admin-20261029`

## Yang dibangun

Halaman admin SPMB di `/adminV2/spmb` (menu Aplikasi → SPMB kini mengarah ke sini),
port setia dari preview v5 yang disetujui user, **Tailwind penuh tanpa CSS konvensional/scoped**:

- `app/pages/adminV2/spmb/index.vue` — shell halaman mengikuti pola halaman AdminV2 lain.
- `app/components/adminV2/spmb/SpmbManager.vue` — daftar pendaftar: strip kuota gabungan
  (bisa diubah, bawaan 150/jenjang), KPI 5 status (klik = filter), chip status, saringan
  jurusan (SMK) + sumber (Online/Manual), pencarian, urutan, ekspor CSV, sampah (soft delete + pulihkan).
- `app/components/adminV2/spmb/SpmbDetail.vue` — detail persis formulir: Data Siswa &
  Informasi Orang Tua dengan tempat/tanggal lahir TERPISAH, label persis spesifikasi user,
  NIK tersamar, tombol WA/email wali, kartu pembayaran Rp50.000, tindakan per status
  (Verifikasi Pembayaran → Terima/Tolak dengan penjaga kuota penuh).
- `app/components/adminV2/spmb/SpmbForm.vue` — CRUD pendaftaran MANUAL (wali datang ke sekolah):
  field persis formulir publik + pembayaran (metode + status + upload bukti; bukti WAJIB
  untuk Transfer BSI/QRIS). NISN divalidasi unik per jenjang. Entri online TIDAK bisa diubah
  admin (integritas data orang tua) — hanya entri manual yang punya Ubah Data.
- `app/components/adminV2/spmb/SpmbPlacement.vue` — tab Penempatan Kelas: pool siswa Diterima,
  kartu rombel per jenjang (SMK per jurusan kap. 36; SMP kap. 32; rombel bisa ditambah),
  tempatkan terpilih (validasi jurusan + kapasitas), Bagi Rata Otomatis, batalkan penempatan.
  Saat ditempatkan siswa menerima NIS otomatis berurutan (SMK 27001xx, SMP 27002xx —
  format mengikuti konvensi Data Induk) dan tercatat sebagai data siswa resmi TA 2027/2028.
- `app/composables/useSpmbAdmin.ts` — lapisan data + logika murni (teruji).

## Aliran data (fase ini)

- Sumber data = localStorage `spmb27_regs` yang SAMA dengan formulir pendaftaran publik
  (`useSpmbForm`) — data admin adalah data asli input orang tua/wali, bukan salinan.
  Pendaftaran manual ditulis ke array yang sama (`via: 'Manual'`). Status yang diubah admin
  ikut terlihat di fitur Lacak pendaftaran publik karena kuncinya sama.
- Kuota & rombel tersimpan di `spmb27_kuota` / `spmb27_rombel`.
- Saat database SPMB disiapkan (keputusan user: setelah semua halaman selesai), hanya isi
  `useSpmbAdmin` yang diganti ke API — komponen tidak berubah.

## Penyesuaian kontrak data

- Formulir publik menyimpan TTL gabungan (`s_ttl`/`o_ttl`). `useSpmbForm` kini JUGA menulis
  `s_tempat/s_tgl/o_tempat/o_tgl` terpisah saat submit; record lama diurai balik oleh
  `parseTtl` di lapisan admin — detail selalu menampilkan tempat & tanggal lahir terpisah.
- Biaya formulir diselaraskan ke **Rp50.000** di halaman publik (`pages/spmb/index.vue`,
  `pages/spmb/smp/index.vue`, `pages/spmb/smk/index.vue` — 5 titik tampilan), sesuai koreksi user.
- Keterbatasan fase ini: berkas bukti pembayaran pendaftar ONLINE belum tersimpan permanen
  (formulir publik mewajibkan upload, tetapi belum ada storage) — di detail admin ditandai
  dengan catatan; nama berkas entri manual tersimpan. Tersimpan penuh mulai fase database/storage.

## Verifikasi

- `tests/spmb-admin.mjs`: 9 kelompok tes logika (parse TTL, normalisasi, validasi + NISN unik,
  NIS berurutan, bagi rata + kapasitas, CSV) — LOLOS (exit 0).
- `tests/cbt-banksoal.mjs` (regresi): exit 0.
- `npm run build`: exit 0.
