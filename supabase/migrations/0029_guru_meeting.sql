-- 0029_guru_meeting.sql — Penyesuaian Data Master Guru hasil meeting
-- manajemen Darqia 4 Nov 2026 (butir Data Master Guru).
-- Jalankan manual di Supabase SQL Editor (pola sama seperti 0025–0028).
--
-- Isi:
-- 1. No KK DIHAPUS dari data guru -> kolom no_kk dibuang (data guru tidak
--    dipakai modul mana pun; keputusan meeting eksplisit "hapus").
-- 2. jenis_nomor: keterangan jenis nomor pegawai (NIP / NUPTK) agar UI
--    menampilkan satu nomor aktif beserta jenisnya.
-- 3. asal_institusi: asal sekolah (lulusan SMK/SMA sederajat) atau asal
--    kampus/perguruan tinggi (Diploma ke atas) — label menyesuaikan
--    pendidikan terakhir di aplikasi.
-- Aplikasi sudah tahan sebelum migrasi ini jalan (simpan guru otomatis
-- mundur tanpa dua kolom baru), tetapi jenis nomor & asal institusi baru
-- tersimpan setelah migrasi dijalankan.

alter table public.teachers
  add column if not exists jenis_nomor text not null default 'NIP',
  add column if not exists asal_institusi text;

-- Data lama: guru yang hanya punya NUPTK ditandai berjenis NUPTK.
update public.teachers
set jenis_nomor = 'NUPTK'
where coalesce(trim(nuptk), '') <> ''
  and coalesce(trim(nip), '') = ''
  and jenis_nomor <> 'NUPTK';

alter table public.teachers drop column if exists no_kk;

notify pgrst, 'reload schema';
