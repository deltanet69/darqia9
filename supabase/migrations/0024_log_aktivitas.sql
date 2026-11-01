-- ============================================================
-- Migrasi 0024 — Log Aktivitas aplikasi
-- Satu tabel ramping. Halaman Log Aktivitas membaca REKAP agregat
-- dari fungsi log_rekap() (dihitung di database), sehingga beban
-- selalu ringan: tidak ada penarikan ribuan baris mentah.
-- Tulis: pengguna hanya boleh mencatat aksinya sendiri (klien);
-- endpoint server memakai service role. Baca: KHUSUS Superadmin.
-- ============================================================

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_id uuid,
  actor_name text not null default '',
  actor_role text not null default '',
  modul text not null,
  aksi text not null,
  tingkat text not null default 'info' check (tingkat in ('info', 'galat')),
  detail text not null default '',
  jenjang text
);

create index if not exists activity_logs_grup_idx on public.activity_logs (modul, aksi, created_at desc);
create index if not exists activity_logs_waktu_idx on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

-- Pemanggil adalah Superadmin bila memegang peran terkunci (RBAC)
-- atau merupakan email utama. Dipakai kebijakan baca + log_rekap().
create or replace function public.rbac_superadmin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((auth.jwt() ->> 'email') = 'betadev94@gmail.com', false)
      or exists (
        select 1
        from public.rbac_assignments a
        join public.rbac_roles r on r.id = a.peran_id
        where r.terkunci
          and (a.subjek_id = auth.uid()::text
               or a.subjek_id in (select id::text from public.teachers where user_id = auth.uid()))
      );
$$;

drop policy if exists activity_logs_insert on public.activity_logs;
create policy activity_logs_insert on public.activity_logs
  for insert to authenticated
  with check (actor_id = auth.uid());

drop policy if exists activity_logs_select on public.activity_logs;
create policy activity_logs_select on public.activity_logs
  for select to authenticated
  using (public.rbac_superadmin());

-- Rekap agregat: satu baris per (modul, aksi) dalam rentang waktu.
create or replace function public.log_rekap(sejak timestamptz)
returns table (modul text, aksi text, jumlah bigint, jumlah_galat bigint, pengguna_unik bigint, terakhir timestamptz)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.rbac_superadmin() then
    raise exception 'Log Aktivitas khusus Superadmin';
  end if;
  return query
    select l.modul, l.aksi, count(*)::bigint,
           (count(*) filter (where l.tingkat = 'galat'))::bigint,
           count(distinct l.actor_id)::bigint, max(l.created_at)
    from public.activity_logs l
    where l.created_at >= sejak
    group by l.modul, l.aksi
    order by l.modul, count(*) desc;
end;
$$;
