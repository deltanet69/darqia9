-- 0097_spmb_orang_tua_kandung.sql
-- SPMB Step 2: blok kedua "Orang Tua Kandung" (OPSIONAL) di samping Wali (WAJIB).
-- Semua kolom boleh kosong (nullable) — pendaftaran tanpa blok ini tetap sah.
-- Jalankan sekali di Supabase SQL Editor.

alter table public.spmb_registrations
  add column if not exists ot_nama   text,
  add column if not exists ot_hub    text,
  add column if not exists ot_nik    text,
  add column if not exists ot_hp     text,
  add column if not exists ot_email  text,
  add column if not exists ot_tempat text,
  add column if not exists ot_tgl    date,
  add column if not exists ot_alamat text;
