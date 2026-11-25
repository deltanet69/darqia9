-- ============================================================
-- Migrasi 0094 — Dokumen pendukung pendaftaran SPMB
--
-- Formulir publik (Step 2) kini menerima unggahan dokumen
-- pendukung: KK, akta kelahiran, KTP wali (wajib) serta
-- ijazah/SKL dan pas foto (opsional). Berkasnya tersimpan
-- terkompresi di bucket privat 'spmb-bukti' pada folder
-- <id-pendaftaran>/dokumen/<jenis>-<namafile>; kolom ini
-- menyimpan petanya: {"kk": "path", "akta": "path", ...}.
-- Panel admin membaca peta ini untuk menampilkan/mengunduh
-- dokumen lewat endpoint staf (URL bertanda tangan).
-- ============================================================

alter table public.spmb_registrations
  add column if not exists dokumen jsonb not null default '{}'::jsonb;

comment on column public.spmb_registrations.dokumen is
  'Peta dokumen pendukung SPMB: kunci jenis dokumen (kk/akta/ktp/ijazah/foto) -> path berkas di bucket spmb-bukti.';
