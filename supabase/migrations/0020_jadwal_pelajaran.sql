-- Migrasi 0020 — Jadwal Pelajaran (Akademik)
-- 1) Kolom keterangan pada class_schedules (catatan sesi, cth. "Praktik jaringan").
-- 2) jadwal_settings: pola jam pelajaran & istirahat per jenjang (satu baris per jenjang).
-- 3) teaching_sessions: sesi mengajar harian per jadwal. Ditulis oleh tombol
--    Mulai/Selesai Mengajar guru (halaman Jadwal Mengajar), dibaca oleh halaman
--    Jadwal Pelajaran (penanda kehadiran) dan Rekap Mengajar (Absensi Guru).
-- Prasyarat: migrasi 0018 sudah jalan (fungsi public.is_staff()).

alter table public.class_schedules add column if not exists notes text;

create table if not exists public.jadwal_settings (
  jenjang text primary key check (jenjang in ('SMP', 'SMK')),
  config jsonb not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.teaching_sessions (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.class_schedules(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  session_date date not null,
  started_at timestamptz,
  ended_at timestamptz,
  status text not null default 'belum' check (status in ('belum', 'berlangsung', 'selesai', 'tidak_hadir')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_id, session_date)
);

create index if not exists teaching_sessions_date_idx on public.teaching_sessions (session_date);
create index if not exists teaching_sessions_teacher_idx on public.teaching_sessions (teacher_id, session_date);

alter table public.jadwal_settings enable row level security;
alter table public.teaching_sessions enable row level security;

drop policy if exists "jadwal_settings staff" on public.jadwal_settings;
create policy "jadwal_settings staff" on public.jadwal_settings
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "teaching_sessions staff" on public.teaching_sessions;
create policy "teaching_sessions staff" on public.teaching_sessions
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "teaching_sessions guru sendiri" on public.teaching_sessions;
create policy "teaching_sessions guru sendiri" on public.teaching_sessions
  for all to authenticated
  using (exists (select 1 from public.teachers t where t.id = teacher_id and t.user_id = auth.uid()))
  with check (exists (select 1 from public.teachers t where t.id = teacher_id and t.user_id = auth.uid()));
