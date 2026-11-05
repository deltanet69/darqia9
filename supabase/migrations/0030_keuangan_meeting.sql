-- 0030_keuangan_meeting.sql — Keuangan hasil meeting manajemen Darqia
-- 4 Nov 2026 (butir Keuangan). Jalankan manual di Supabase SQL Editor.
--
-- Isi:
-- 1. WATERFALL: pembayaran menempel ke siswa, bukan tingkat. Kolom
--    tingkat keuangan_pembayaran dibuat nullable (null = pembayaran
--    waterfall baru; nilai lama tetap sebagai anotasi historis).
-- 2. Keterangan LIST: tabel keuangan_pembayaran_item — satu pembayaran
--    berisi banyak keterangan, masing-masing dengan nominal sendiri.
--    Kolom keterangan di pembayaran induk menyimpan ringkasannya.
-- 3. RELEASE TAGIHAN: tabel keuangan_rilis_tagihan per (grade, nis,
--    tingkat) — penanda tagihan resmi diterbitkan ke wali (notifikasi
--    Portal Orang Tua menyusul setelah portalnya dibangun).
-- 4. CUT-OFF TUNAI SAJA: keuangan_buat_cutoff diganti — hanya transaksi
--    metode 'Tunai' yang dihitung & dikunci; kolom jumlah_setor mencatat
--    uang fisik yang diserahkan petugas saat Release.
-- Aplikasi sudah tahan sebelum migrasi ini jalan (pembayaran tetap bisa
-- disimpan, rilis tagihan & item keterangan menunggu migrasi), tetapi
-- fitur barunya aktif penuh setelah migrasi dijalankan.

-- 1) tingkat boleh null (waterfall)
alter table public.keuangan_pembayaran drop constraint if exists keuangan_pembayaran_tingkat_check;
alter table public.keuangan_pembayaran alter column tingkat drop not null;

-- 2) item keterangan per pembayaran
create table if not exists public.keuangan_pembayaran_item (
  id uuid primary key default gen_random_uuid(),
  pembayaran_id uuid not null references public.keuangan_pembayaran(id) on delete cascade,
  keterangan text not null,
  nominal bigint not null check (nominal > 0),
  urutan integer not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists keuangan_item_bayar on public.keuangan_pembayaran_item (pembayaran_id);

-- 3) rilis tagihan per tingkat
create table if not exists public.keuangan_rilis_tagihan (
  grade text not null check (grade in ('SMP', 'SMK')),
  nis text not null,
  tingkat smallint not null check (tingkat between 0 and 3),
  dirilis_pada timestamptz not null default now(),
  oleh text not null default '',
  primary key (grade, nis, tingkat)
);

-- 4) cut-off: jumlah setor + fungsi khusus tunai
alter table public.keuangan_cutoff add column if not exists jumlah_setor bigint;

drop function if exists public.keuangan_buat_cutoff(text, date, date, text);
create or replace function public.keuangan_buat_cutoff(p_grade text, p_dari date, p_sampai date, p_oleh text, p_jumlah_setor bigint default null)
returns public.keuangan_cutoff language plpgsql as $$
declare v_trx integer; v_total bigint; v_kode text; v_hasil public.keuangan_cutoff;
begin
  select count(*), coalesce(sum(nominal), 0) into v_trx, v_total
  from public.keuangan_pembayaran
  where grade = p_grade and cutoff_id is null and metode = 'Tunai' and tanggal between p_dari and p_sampai;
  if v_trx = 0 then
    raise exception 'Tidak ada transaksi TUNAI terbuka dalam rentang ini';
  end if;
  v_kode := 'CUT-' || extract(year from p_sampai)::int || '-' ||
    lpad((select count(*) + 1 from public.keuangan_cutoff where grade = p_grade
          and extract(year from created_at) = extract(year from p_sampai))::text, 3, '0');
  insert into public.keuangan_cutoff (kode, grade, dari, sampai, trx, total, oleh, jumlah_setor)
  values (v_kode, p_grade, p_dari, p_sampai, v_trx, v_total, coalesce(p_oleh, ''), coalesce(p_jumlah_setor, v_total))
  returning * into v_hasil;
  update public.keuangan_pembayaran set cutoff_id = v_hasil.id
  where grade = p_grade and cutoff_id is null and metode = 'Tunai' and tanggal between p_dari and p_sampai;
  return v_hasil;
end $$;

-- RLS untuk dua tabel baru (pola sama seperti tabel keuangan lain di 0026)
alter table public.keuangan_pembayaran_item enable row level security;
alter table public.keuangan_rilis_tagihan enable row level security;

do $$
declare t text;
begin
  foreach t in array array['keuangan_pembayaran_item', 'keuangan_rilis_tagihan'] loop
    execute format('drop policy if exists %I on public.%I', t || '_baca', t);
    execute format('create policy %I on public.%I for select to authenticated using (true)', t || '_baca', t);
    execute format('drop policy if exists %I on public.%I', t || '_tulis', t);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', t || '_tulis', t);
  end loop;
end $$;

notify pgrst, 'reload schema';
