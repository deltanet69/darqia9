-- ==============================================================================
-- Migrasi 0018: SPMB — tabel pendaftaran terpusat, RLS, RPC lacak, bucket bukti
-- Darqia 9 — Ekosistem Digital Yayasan Darqia Attaqwa
--
-- Tujuan: pendaftaran dari formulir publik (perangkat orang tua) tersimpan di
-- database dan langsung terbaca di Manajemen SPMB AdminV2 — menggantikan
-- penyimpanan localStorage per-perangkat.
--
-- Jalankan SELURUH isi file ini sekali di Supabase SQL Editor.
-- Aman dijalankan ulang (if not exists / drop policy if exists).
-- ==============================================================================

-- 1. Tabel pendaftaran SPMB (satu sumber untuk online + manual)
create table if not exists public.spmb_registrations (
  id text primary key,                          -- SPMB27-SMP-XXXXXX / SPMB27-SMK-XXXXXX
  jenjang text not null,                        -- nama penuh jenjang
  jurusan text,                                 -- khusus SMK
  -- Data siswa (field persis formulir; tempat & tanggal lahir TERPISAH)
  s_nama text not null,
  s_nisn text not null,
  s_jk text,
  s_tempat text,
  s_tgl date,
  s_hp text,
  s_email text,
  s_sekolah text,
  s_alsekolah text,
  -- Informasi orang tua / wali
  o_nama text,
  o_hub text,
  o_nik text,
  o_hp text,
  o_email text,                                 -- dipakai untuk seluruh notifikasi SPMB
  o_tempat text,
  o_tgl date,
  o_alamat text,
  -- Sumber & pembayaran
  via text not null default 'Online' check (via in ('Online', 'Manual')),
  oleh text,                                    -- petugas input manual (mis. 'Admin TU')
  metode text,                                  -- Tunai di sekolah / Transfer BSI / QRIS
  bukti_path text,                              -- path berkas di bucket 'spmb-bukti'
  -- Alur panitia
  status text not null default 'Menunggu verifikasi'
    check (status in ('Menunggu verifikasi', 'Pembayaran terverifikasi', 'Diterima', 'Ditolak')),
  -- Penempatan kelas (terisi saat siswa resmi ditempatkan)
  kelas text,
  nis text,
  deleted_at timestamptz,                       -- soft delete
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- NISN unik per jenjang di antara data yang tidak terhapus
create unique index if not exists spmb_registrations_nisn_unik
  on public.spmb_registrations (jenjang, s_nisn)
  where deleted_at is null;

create index if not exists spmb_registrations_jenjang_idx
  on public.spmb_registrations (jenjang);
create index if not exists spmb_registrations_status_idx
  on public.spmb_registrations (status);

-- updated_at otomatis
create or replace function public.spmb_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists spmb_registrations_updated_at on public.spmb_registrations;
create trigger spmb_registrations_updated_at
  before update on public.spmb_registrations
  for each row execute function public.spmb_set_updated_at();

-- 2. Tabel pengaturan SPMB (kuota & rombel, dibaca/ditulis staf)
create table if not exists public.spmb_settings (
  key text primary key,                         -- 'kuota' | 'rombel'
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 3. Row Level Security
alter table public.spmb_registrations enable row level security;
alter table public.spmb_settings enable row level security;

-- Staf = pengguna login yang memiliki profil (superadmin / admin TU)
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$;

-- Publik (tanpa login) HANYA boleh mendaftar sebagai pendaftar online baru.
drop policy if exists "Publik dapat mendaftar SPMB" on public.spmb_registrations;
create policy "Publik dapat mendaftar SPMB"
  on public.spmb_registrations
  for insert
  to anon
  with check (
    via = 'Online'
    and status = 'Menunggu verifikasi'
    and deleted_at is null
  );

-- Staf dapat membaca seluruh pendaftaran.
drop policy if exists "Staf membaca pendaftaran SPMB" on public.spmb_registrations;
create policy "Staf membaca pendaftaran SPMB"
  on public.spmb_registrations
  for select
  to authenticated
  using (public.is_staff());

-- Staf dapat menambah (pendaftaran manual).
drop policy if exists "Staf menambah pendaftaran SPMB" on public.spmb_registrations;
create policy "Staf menambah pendaftaran SPMB"
  on public.spmb_registrations
  for insert
  to authenticated
  with check (public.is_staff());

-- Staf dapat mengubah (verifikasi, keputusan, penempatan, soft delete).
drop policy if exists "Staf mengubah pendaftaran SPMB" on public.spmb_registrations;
create policy "Staf mengubah pendaftaran SPMB"
  on public.spmb_registrations
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Staf dapat menghapus permanen (pembersihan data uji).
drop policy if exists "Staf menghapus pendaftaran SPMB" on public.spmb_registrations;
create policy "Staf menghapus pendaftaran SPMB"
  on public.spmb_registrations
  for delete
  to authenticated
  using (public.is_staff());

-- Pengaturan: hanya staf.
drop policy if exists "Staf membaca pengaturan SPMB" on public.spmb_settings;
create policy "Staf membaca pengaturan SPMB"
  on public.spmb_settings
  for select
  to authenticated
  using (public.is_staff());

drop policy if exists "Staf menulis pengaturan SPMB" on public.spmb_settings;
create policy "Staf menulis pengaturan SPMB"
  on public.spmb_settings
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists "Staf mengubah pengaturan SPMB" on public.spmb_settings;
create policy "Staf mengubah pengaturan SPMB"
  on public.spmb_settings
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- 4. RPC lacak untuk publik — orang tua mengecek status HANYA dengan ID
--    pendaftaran miliknya, tanpa membuka akses baca tabel.
create or replace function public.spmb_lacak(p_id text)
returns table (
  id text,
  s_nama text,
  jenjang text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select r.id, r.s_nama, r.jenjang, r.status, r.created_at
  from public.spmb_registrations r
  where r.id = upper(trim(p_id))
    and r.deleted_at is null;
$$;

grant execute on function public.spmb_lacak(text) to anon, authenticated;

-- 5. Bucket privat untuk bukti pembayaran
insert into storage.buckets (id, name, public)
values ('spmb-bukti', 'spmb-bukti', false)
on conflict (id) do nothing;

-- Publik boleh mengunggah bukti saat mendaftar (tidak bisa membaca berkas).
drop policy if exists "Publik mengunggah bukti SPMB" on storage.objects;
create policy "Publik mengunggah bukti SPMB"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'spmb-bukti');

-- Staf boleh membaca & menghapus bukti.
drop policy if exists "Staf membaca bukti SPMB" on storage.objects;
create policy "Staf membaca bukti SPMB"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'spmb-bukti' and public.is_staff());

drop policy if exists "Staf menghapus bukti SPMB" on storage.objects;
create policy "Staf menghapus bukti SPMB"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'spmb-bukti' and public.is_staff());

notify pgrst, 'reload schema';
