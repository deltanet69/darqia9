# Laporan — Tahun Ajaran (Hasil Meeting Manajemen 4 Nov 2026, Butir 5)

## Ketentuan dari dokumen meeting

Dokumen hasil meeting hanya memuat satu poin untuk butir ini:

> "Tahun ajaran sekolah harus terorganisir dengan baik dan benar. 1. Dapat select
> tahun ajaran sekolah melalui dropdown simple (jangan terlalu mencolok,
> utamakan tahun ajaran existing)"

Dokumen terpotong di poin 1 — bila ada poin lanjutan dari manajemen, sampaikan
ke pengembang agar setup ini disesuaikan. Implementasi ini sengaja dibatasi
pada poin yang tertulis.

## Yang dikerjakan

1. **State global** `app/composables/useTahunAjaran.ts` — pola sama seperti
   `useAdminGrade` (satu `useState` bersama untuk seluruh AdminV2):
   - `tahun` — tahun ajaran terpilih.
   - `opsi` — daftar tahun yang **existing**, dibaca dari kolom
     `academic_year` tabel `classes` (kelas aktif), unik, terurut terbaru dulu.
   - Pilihan tersimpan di `localStorage` (`darqia-admin-tahun-ajaran`) per
     perangkat; saat opsi selesai dimuat, pilihan dijaga tetap anggota opsi
     existing.
   - Bawaan: `2026/2027` bila termasuk existing, selain itu tahun existing
     terbaru. Tidak ada tahun karangan.
   - Gagal baca data tidak menggagalkan halaman — opsi bawaan tetap dipakai.
2. **Logika murni** `app/composables/tahunAjaranCore.ts` — validasi format
   `TTTT/TTTT` berurutan, dedupe + urut, aturan bawaan. Diuji oleh
   `tests/tahun-ajaran.mjs` (4 kelompok uji).
3. **Dropdown simple** di `AdminV2Breadcrumb.vue` — menggantikan teks statis
   "Tahun Ajaran 2026/2027" di sisi kanan bar breadcrumb (tampil di `xl` ke
   atas, sama seperti teks sebelumnya). Karena komponen ini dipakai semua
   shell dan halaman AdminV2, dropdown langsung hadir di seluruh AdminV2
   tanpa mengubah halaman lain.

## Yang SENGAJA belum diubah

- Modul yang sudah punya pemilih tahun lokal (Jadwal Pelajaran) dan logika
  tahun internal (Jadwal Mengajar) belum disambungkan ke state global —
  menunggu arahan lanjutan; penyambungan itu mengubah perilaku modul lain.
- SPMB tidak disambungkan: SPMB memakai konstanta tahun penerimaan sendiri
  (`2027/2028` di `useSpmbAdmin.ts`), maknanya berbeda dari tahun ajaran
  berjalan.
- Teks tahun ajaran statis di subjudul beberapa halaman lama tidak diubah
  pada tahap ini.

## Cara uji manual

1. Buka halaman AdminV2 mana pun (mis. `/adminV2`) pada layar lebar.
2. Di kanan bar breadcrumb tampil "Tahun Ajaran" + dropdown berisi tahun
   yang ada di data kelas.
3. Ganti pilihan, muat ulang halaman — pilihan bertahan.
4. Pindah halaman AdminV2 lain — pilihan sama (state global).
