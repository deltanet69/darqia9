-- ============================================================
-- Migrasi 0025 — Tiketing (aduan pengguna ke Superadmin)
-- Aturan visibilitas (dikunci user): HANYA Superadmin yang boleh
-- melihat seluruh tiket masuk + detailnya; role lain hanya boleh
-- melihat tiket pribadinya sendiri. Ditegakkan di RLS di bawah,
-- bukan sekadar disembunyikan di UI.
-- ID tiket per grade diterbitkan trigger: TKT-<GRADE>-<TAHUN>-<URUT>.
-- ============================================================

-- Penomoran urut per grade per tahun
create table if not exists public.tiket_counter (
  grade text not null check (grade in ('SMK', 'SMP')),
  tahun int not null,
  terakhir int not null default 0,
  primary key (grade, tahun)
);

create table if not exists public.tiket (
  id uuid primary key default gen_random_uuid(),
  nomor text not null unique,
  grade text not null check (grade in ('SMK', 'SMP')),
  judul text not null,
  deskripsi text not null default '',
  kategori text not null,
  status text not null default 'Baru'
    check (status in ('Baru', 'Diproses', 'Menunggu Info', 'Selesai', 'Ditutup')),
  progress int not null default 0 check (progress in (0, 25, 50, 75, 100)),
  pelapor_id uuid not null default auth.uid(),
  pelapor_nama text not null default '',
  pelapor_peran text not null default '',
  lampiran_path text,
  lampiran_nama text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tiket_pelapor_idx on public.tiket (pelapor_id, grade, updated_at desc);
create index if not exists tiket_status_idx on public.tiket (status, grade, updated_at desc);

-- Balasan/utas (deskripsi tiket adalah pesan pertama; tabel ini balasan saja, append-only)
create table if not exists public.tiket_pesan (
  id uuid primary key default gen_random_uuid(),
  tiket_id uuid not null references public.tiket (id) on delete cascade,
  penulis_id uuid not null default auth.uid(),
  penulis_nama text not null default '',
  dari_superadmin boolean not null default false,
  teks text not null,
  bukti_path text,
  bukti_nama text,
  created_at timestamptz not null default now()
);

create index if not exists tiket_pesan_tiket_idx on public.tiket_pesan (tiket_id, created_at);

-- Log penanganan per tiket (append-only)
create table if not exists public.tiket_log (
  id bigint generated always as identity primary key,
  tiket_id uuid not null references public.tiket (id) on delete cascade,
  pelaku_id uuid,
  pelaku_nama text not null default '',
  teks text not null,
  catatan text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists tiket_log_tiket_idx on public.tiket_log (tiket_id, created_at desc);

-- ---------- Fungsi bantu ----------

-- Akses ke satu tiket: pemiliknya ATAU Superadmin (fungsi migrasi 0024).
create or replace function public.tiket_boleh_akses(p_tiket uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.rbac_superadmin() or exists (
    select 1 from public.tiket t
    where t.id = p_tiket and t.pelapor_id = auth.uid()
  );
$$;

-- Penerbit nomor tiket per grade (dipanggil trigger BEFORE INSERT).
create or replace function public.tiket_terbitkan_nomor()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_tahun int := extract(year from now())::int;
  v_urut int;
begin
  insert into public.tiket_counter (grade, tahun, terakhir)
  values (new.grade, v_tahun, 1)
  on conflict (grade, tahun)
  do update set terakhir = public.tiket_counter.terakhir + 1
  returning terakhir into v_urut;
  new.nomor := 'TKT-' || new.grade || '-' || v_tahun || '-' || lpad(v_urut::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists tiket_nomor on public.tiket;
create trigger tiket_nomor
  before insert on public.tiket
  for each row execute function public.tiket_terbitkan_nomor();

-- updated_at selalu segar
create or replace function public.tiket_sentuh()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tiket_updated on public.tiket;
create trigger tiket_updated
  before update on public.tiket
  for each row execute function public.tiket_sentuh();

-- Penjaga kolom: non-Superadmin tidak boleh mengubah status/progress/
-- grade/nomor/pelapor; judul/kategori/deskripsi hanya saat status lama Baru.
create or replace function public.tiket_jaga_kolom()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if public.rbac_superadmin() then
    return new;
  end if;
  if new.status is distinct from old.status
     or new.progress is distinct from old.progress
     or new.grade is distinct from old.grade
     or new.nomor is distinct from old.nomor
     or new.pelapor_id is distinct from old.pelapor_id then
    raise exception 'Hanya Superadmin yang dapat mengubah status/progress tiket';
  end if;
  if old.status <> 'Baru' and (
       new.judul is distinct from old.judul
       or new.kategori is distinct from old.kategori
       or new.deskripsi is distinct from old.deskripsi) then
    raise exception 'Tiket hanya dapat diubah selama berstatus Baru';
  end if;
  return new;
end;
$$;

drop trigger if exists tiket_jaga on public.tiket;
create trigger tiket_jaga
  before update on public.tiket
  for each row execute function public.tiket_jaga_kolom();

-- ---------- RLS ----------

alter table public.tiket enable row level security;
alter table public.tiket_pesan enable row level security;
alter table public.tiket_log enable row level security;

drop policy if exists tiket_select on public.tiket;
create policy tiket_select on public.tiket
  for select to authenticated
  using (pelapor_id = auth.uid() or public.rbac_superadmin());

drop policy if exists tiket_insert on public.tiket;
create policy tiket_insert on public.tiket
  for insert to authenticated
  with check (pelapor_id = auth.uid());

drop policy if exists tiket_update on public.tiket;
create policy tiket_update on public.tiket
  for update to authenticated
  using (pelapor_id = auth.uid() or public.rbac_superadmin())
  with check (pelapor_id = auth.uid() or public.rbac_superadmin());

drop policy if exists tiket_delete on public.tiket;
create policy tiket_delete on public.tiket
  for delete to authenticated
  using (pelapor_id = auth.uid() or public.rbac_superadmin());

drop policy if exists tiket_pesan_select on public.tiket_pesan;
create policy tiket_pesan_select on public.tiket_pesan
  for select to authenticated
  using (public.tiket_boleh_akses(tiket_id));

drop policy if exists tiket_pesan_insert on public.tiket_pesan;
create policy tiket_pesan_insert on public.tiket_pesan
  for insert to authenticated
  with check (penulis_id = auth.uid() and public.tiket_boleh_akses(tiket_id));

drop policy if exists tiket_log_select on public.tiket_log;
create policy tiket_log_select on public.tiket_log
  for select to authenticated
  using (public.tiket_boleh_akses(tiket_id));

drop policy if exists tiket_log_insert on public.tiket_log;
create policy tiket_log_insert on public.tiket_log
  for insert to authenticated
  with check (pelaku_id = auth.uid() and public.tiket_boleh_akses(tiket_id));

-- ---------- Bucket lampiran (privat, maks 1 MB) ----------

insert into storage.buckets (id, name, public, file_size_limit)
values ('tiket-lampiran', 'tiket-lampiran', false, 1048576)
on conflict (id) do nothing;

-- Path berkas: <tiket_id>/<nama berkas>; akses mengikuti akses ke tiketnya.
drop policy if exists "Tiket: unggah lampiran" on storage.objects;
create policy "Tiket: unggah lampiran"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'tiket-lampiran'
    and public.tiket_boleh_akses(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Tiket: baca lampiran" on storage.objects;
create policy "Tiket: baca lampiran"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'tiket-lampiran'
    and public.tiket_boleh_akses(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Tiket: hapus lampiran" on storage.objects;
create policy "Tiket: hapus lampiran"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'tiket-lampiran'
    and public.tiket_boleh_akses(((storage.foldername(name))[1])::uuid)
  );

notify pgrst, 'reload schema';
