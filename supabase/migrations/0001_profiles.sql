-- ==============================================================================
-- Migrasi 0001: Skema Profiles, RLS Policies, dan Trigger User Baru
-- Darqia 9 — Ekosistem Digital Yayasan Darqia Attaqwa
-- ==============================================================================

-- 1. Buat Tabel public.profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'admin' check (role in ('superadmin', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Fungsi Security Definer untuk cek superadmin tanpa rekursi RLS
create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'superadmin'
  );
$$;

-- 4. Kebijakan RLS (Policies)
-- User dapat membaca profil miliknya sendiri
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Superadmin dapat membaca seluruh profil
drop policy if exists "Superadmins can read all profiles" on public.profiles;
create policy "Superadmins can read all profiles"
  on public.profiles
  for select
  using (public.is_superadmin());

-- Superadmin dapat menambahkan profil
drop policy if exists "Superadmins can insert profiles" on public.profiles;
create policy "Superadmins can insert profiles"
  on public.profiles
  for insert
  with check (public.is_superadmin());

-- Superadmin dapat mengubah seluruh profil
drop policy if exists "Superadmins can update profiles" on public.profiles;
create policy "Superadmins can update profiles"
  on public.profiles
  for update
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Superadmin dapat menghapus profil
drop policy if exists "Superadmins can delete profiles" on public.profiles;
create policy "Superadmins can delete profiles"
  on public.profiles
  for delete
  using (public.is_superadmin());

-- 5. Fungsi & Trigger Otomatis saat pendaftaran user di auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'admin'
  );
  return new;
end;
$$;

-- Pasang trigger pada tabel auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Sinkronisasi otomatis untuk user yang SUDAH terdaftar di auth.users sebelumnya
insert into public.profiles (id, email, name, role)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'superadmin'
from auth.users
on conflict (id) do update set role = 'superadmin';
