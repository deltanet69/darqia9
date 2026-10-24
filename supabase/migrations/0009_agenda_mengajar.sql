-- Agenda Mengajar F.32 hanya menyimpan transaksi.
-- Guru, mata pelajaran, kelas, siswa, dan orang tua tetap memakai Data Induk.

create table if not exists public.agenda_buku (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references public.teachers(id) on delete restrict,
  mapel_id uuid not null references public.subjects(id) on delete restrict,
  kelas_id uuid not null references public.classes(id) on delete restrict,
  semester smallint not null check (semester in (1, 2)),
  tahun_ajaran text not null,
  created_at timestamptz not null default now(),
  unique (guru_id, mapel_id, kelas_id, semester, tahun_ajaran)
);

create table if not exists public.agenda_pertemuan (
  id uuid primary key default gen_random_uuid(),
  buku_id uuid not null references public.agenda_buku(id) on delete restrict,
  pertemuan_ke smallint not null check (pertemuan_ke between 1 and 20),
  tanggal date not null,
  topik text not null default '',
  kegiatan text not null default '',
  updated_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  unique (buku_id, pertemuan_ke)
);

create table if not exists public.agenda_kehadiran (
  id uuid primary key default gen_random_uuid(),
  buku_id uuid not null references public.agenda_buku(id) on delete restrict,
  pertemuan_ke smallint not null check (pertemuan_ke between 1 and 20),
  siswa_id uuid not null references public.students(id) on delete restrict,
  status text not null check (status in ('S', 'I', 'A')),
  updated_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  unique (buku_id, pertemuan_ke, siswa_id)
);

create table if not exists public.agenda_nilai (
  id uuid primary key default gen_random_uuid(),
  buku_id uuid not null references public.agenda_buku(id) on delete restrict,
  siswa_id uuid not null references public.students(id) on delete restrict,
  jenis text not null check (jenis in ('tugas', 'pts', 'pas', 'predikat', 'sikap')),
  nomor smallint,
  nilai text not null,
  updated_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  constraint agenda_nilai_nomor_check check (
    (jenis = 'tugas' and nomor between 1 and 5)
    or (jenis <> 'tugas' and nomor is null)
  ),
  constraint agenda_nilai_isi_check check (
    (
      jenis in ('tugas', 'pts', 'pas')
      and case
        when nilai ~ '^[0-9]{1,3}$' then nilai::integer between 0 and 100
        else false
      end
    )
    or (
      jenis in ('predikat', 'sikap')
      and length(trim(nilai)) between 1 and 120
    )
  ),
  unique nulls not distinct (buku_id, siswa_id, jenis, nomor)
);

create index if not exists agenda_buku_kelas_idx
  on public.agenda_buku (kelas_id, semester, tahun_ajaran);
create index if not exists agenda_buku_guru_idx
  on public.agenda_buku (guru_id, semester, tahun_ajaran);
create index if not exists agenda_pertemuan_buku_idx
  on public.agenda_pertemuan (buku_id, pertemuan_ke);
create index if not exists agenda_kehadiran_buku_idx
  on public.agenda_kehadiran (buku_id, pertemuan_ke, siswa_id);
create index if not exists agenda_nilai_buku_idx
  on public.agenda_nilai (buku_id, jenis, nomor, siswa_id);

create or replace function public.agenda_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('superadmin', 'admin', 'operator')
  );
$$;

create or replace function public.agenda_current_teacher_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
  from public.teachers
  where user_id = auth.uid()
    and active
  limit 1;
$$;

create or replace function public.can_access_agenda_buku(target_buku_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.agenda_buku b
    left join public.classes c on c.id = b.kelas_id
    where b.id = target_buku_id
      and (
        public.agenda_is_admin()
        or b.guru_id = public.agenda_current_teacher_id()
        or c.homeroom_teacher_id = public.agenda_current_teacher_id()
      )
  );
$$;

create or replace function public.validate_agenda_buku_assignment()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.class_schedules cs
    join public.classes c on c.id = cs.class_id
    where cs.active
      and cs.class_id = new.kelas_id
      and cs.subject_id = new.mapel_id
      and cs.teacher_id = new.guru_id
      and c.academic_year = new.tahun_ajaran
  ) then
    raise exception 'Buku agenda harus berasal dari penugasan mengajar aktif.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_agenda_buku_assignment on public.agenda_buku;
create trigger validate_agenda_buku_assignment
  before insert or update of guru_id, mapel_id, kelas_id, tahun_ajaran
  on public.agenda_buku
  for each row execute function public.validate_agenda_buku_assignment();

create or replace function public.validate_agenda_student_membership()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_kelas_id uuid;
begin
  select kelas_id into target_kelas_id
  from public.agenda_buku
  where id = new.buku_id;

  if target_kelas_id is null or not exists (
    select 1
    from public.students
    where id = new.siswa_id
      and class_id = target_kelas_id
      and active
  ) then
    raise exception 'Siswa bukan anggota aktif kelas buku agenda ini.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_agenda_kehadiran_student on public.agenda_kehadiran;
create trigger validate_agenda_kehadiran_student
  before insert or update of buku_id, siswa_id
  on public.agenda_kehadiran
  for each row execute function public.validate_agenda_student_membership();

drop trigger if exists validate_agenda_nilai_student on public.agenda_nilai;
create trigger validate_agenda_nilai_student
  before insert or update of buku_id, siswa_id
  on public.agenda_nilai
  for each row execute function public.validate_agenda_student_membership();

create or replace function public.set_agenda_audit_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_agenda_pertemuan_audit on public.agenda_pertemuan;
create trigger set_agenda_pertemuan_audit
  before insert or update on public.agenda_pertemuan
  for each row execute function public.set_agenda_audit_fields();

drop trigger if exists set_agenda_kehadiran_audit on public.agenda_kehadiran;
create trigger set_agenda_kehadiran_audit
  before insert or update on public.agenda_kehadiran
  for each row execute function public.set_agenda_audit_fields();

drop trigger if exists set_agenda_nilai_audit on public.agenda_nilai;
create trigger set_agenda_nilai_audit
  before insert or update on public.agenda_nilai
  for each row execute function public.set_agenda_audit_fields();

create or replace function public.sync_agenda_buku_from_schedule()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_tahun_ajaran text;
begin
  if new.active then
    select academic_year into target_tahun_ajaran
    from public.classes
    where id = new.class_id;

    insert into public.agenda_buku (
      guru_id,
      mapel_id,
      kelas_id,
      semester,
      tahun_ajaran
    )
    select
      new.teacher_id,
      new.subject_id,
      new.class_id,
      semester_no,
      target_tahun_ajaran
    from generate_series(1, 2) as semesters(semester_no)
    on conflict (guru_id, mapel_id, kelas_id, semester, tahun_ajaran) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_agenda_buku_after_schedule on public.class_schedules;
create trigger sync_agenda_buku_after_schedule
  after insert or update of class_id, subject_id, teacher_id, active
  on public.class_schedules
  for each row execute function public.sync_agenda_buku_from_schedule();

insert into public.agenda_buku (
  guru_id,
  mapel_id,
  kelas_id,
  semester,
  tahun_ajaran
)
select distinct
  cs.teacher_id,
  cs.subject_id,
  cs.class_id,
  semester_no,
  c.academic_year
from public.class_schedules cs
join public.classes c on c.id = cs.class_id
cross join generate_series(1, 2) as semesters(semester_no)
where cs.active
on conflict (guru_id, mapel_id, kelas_id, semester, tahun_ajaran) do nothing;

alter table public.agenda_buku enable row level security;
alter table public.agenda_pertemuan enable row level security;
alter table public.agenda_kehadiran enable row level security;
alter table public.agenda_nilai enable row level security;

drop policy if exists "Agenda read accessible books" on public.agenda_buku;
create policy "Agenda read accessible books"
  on public.agenda_buku
  for select
  using (public.can_access_agenda_buku(id));

drop policy if exists "Agenda admins manage books" on public.agenda_buku;
create policy "Agenda admins manage books"
  on public.agenda_buku
  for all
  using (public.agenda_is_admin())
  with check (public.agenda_is_admin());

drop policy if exists "Agenda users read meetings" on public.agenda_pertemuan;
create policy "Agenda users read meetings"
  on public.agenda_pertemuan
  for select
  using (public.can_access_agenda_buku(buku_id));

drop policy if exists "Agenda users manage meetings" on public.agenda_pertemuan;
create policy "Agenda users manage meetings"
  on public.agenda_pertemuan
  for all
  using (public.can_access_agenda_buku(buku_id))
  with check (public.can_access_agenda_buku(buku_id));

drop policy if exists "Agenda users read attendance" on public.agenda_kehadiran;
create policy "Agenda users read attendance"
  on public.agenda_kehadiran
  for select
  using (public.can_access_agenda_buku(buku_id));

drop policy if exists "Agenda users manage attendance" on public.agenda_kehadiran;
create policy "Agenda users manage attendance"
  on public.agenda_kehadiran
  for all
  using (public.can_access_agenda_buku(buku_id))
  with check (public.can_access_agenda_buku(buku_id));

drop policy if exists "Agenda users read scores" on public.agenda_nilai;
create policy "Agenda users read scores"
  on public.agenda_nilai
  for select
  using (public.can_access_agenda_buku(buku_id));

drop policy if exists "Agenda users manage scores" on public.agenda_nilai;
create policy "Agenda users manage scores"
  on public.agenda_nilai
  for all
  using (public.can_access_agenda_buku(buku_id))
  with check (public.can_access_agenda_buku(buku_id));

grant select on public.agenda_buku to authenticated;
grant select, insert, update, delete on public.agenda_pertemuan to authenticated;
grant select, insert, update, delete on public.agenda_kehadiran to authenticated;
grant select, insert, update, delete on public.agenda_nilai to authenticated;

create or replace function public.agenda_context(
  target_tahun_ajaran text,
  target_semester smallint,
  target_grade text default null
)
returns table (
  buku_id uuid,
  guru_id uuid,
  guru_nama text,
  mapel_id uuid,
  mapel_nama text,
  kelas_id uuid,
  kelas_nama text,
  jenjang text,
  kkm smallint,
  semester smallint,
  tahun_ajaran text,
  pas_terbuka boolean
)
language sql
set search_path = public
stable
as $$
  select
    b.id,
    b.guru_id,
    t.name,
    b.mapel_id,
    s.name,
    b.kelas_id,
    c.name,
    c.grade,
    s.kkm,
    b.semester,
    b.tahun_ajaran,
    false
  from public.agenda_buku b
  join public.teachers t on t.id = b.guru_id
  join public.subjects s on s.id = b.mapel_id
  join public.classes c on c.id = b.kelas_id
  where b.tahun_ajaran = target_tahun_ajaran
    and b.semester = target_semester
    and (target_grade is null or lower(c.grade) = lower(target_grade))
  order by c.name, s.name, t.name;
$$;

create or replace function public.agenda_tab_data(
  target_buku_id uuid,
  target_tab text
)
returns jsonb
language plpgsql
set search_path = public
stable
as $$
declare
  result_data jsonb;
begin
  if target_tab not in ('pertemuan', 'tugas', 'ujian', 'rekap') then
    raise exception 'Tab agenda tidak valid.';
  end if;

  if not public.can_access_agenda_buku(target_buku_id) then
    raise exception 'Akses buku agenda ditolak.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'students', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', st.id,
          'nis', st.nis,
          'nisn', st.nisn,
          'name', st.name,
          'gender', st.gender
        ) order by st.name
      )
      from public.students st
      join public.agenda_buku roster_book on roster_book.kelas_id = st.class_id
      where roster_book.id = target_buku_id
        and st.active
    ), '[]'::jsonb),
    'meetings', case when target_tab in ('pertemuan', 'rekap') then coalesce((
      select jsonb_agg(to_jsonb(ap) order by ap.pertemuan_ke)
      from public.agenda_pertemuan ap
      where ap.buku_id = target_buku_id
    ), '[]'::jsonb) else '[]'::jsonb end,
    'attendance', case when target_tab in ('pertemuan', 'rekap') then coalesce((
      select jsonb_agg(to_jsonb(ak) order by ak.pertemuan_ke, ak.siswa_id)
      from public.agenda_kehadiran ak
      where ak.buku_id = target_buku_id
    ), '[]'::jsonb) else '[]'::jsonb end,
    'scores', case
      when target_tab = 'tugas' then coalesce((
        select jsonb_agg(to_jsonb(an) order by an.nomor, an.siswa_id)
        from public.agenda_nilai an
        where an.buku_id = target_buku_id and an.jenis = 'tugas'
      ), '[]'::jsonb)
      when target_tab = 'ujian' then coalesce((
        select jsonb_agg(to_jsonb(an) order by an.jenis, an.siswa_id)
        from public.agenda_nilai an
        where an.buku_id = target_buku_id and an.jenis in ('pts', 'pas')
      ), '[]'::jsonb)
      when target_tab = 'rekap' then coalesce((
        select jsonb_agg(to_jsonb(an) order by an.jenis, an.nomor, an.siswa_id)
        from public.agenda_nilai an
        where an.buku_id = target_buku_id
      ), '[]'::jsonb)
      else '[]'::jsonb
    end
  ) into result_data;

  return result_data;
end;
$$;

grant execute on function public.agenda_context(text, smallint, text) to authenticated;
grant execute on function public.agenda_tab_data(uuid, text) to authenticated;

create or replace function public.agenda_integrity_report()
returns table (pemeriksaan text, jumlah bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.agenda_is_admin() then
    raise exception 'Hanya admin atau operator yang dapat menjalankan verifikasi integritas.' using errcode = '42501';
  end if;

  return query
  select 'Siswa aktif tanpa kelas'::text, count(*)::bigint
  from public.students st
  left join public.classes c on c.id = st.class_id
  where st.active and (st.class_id is null or c.id is null)

  union all

  select 'Siswa aktif tanpa relasi orang tua/wali'::text, count(*)::bigint
  from public.students st
  where st.active
    and not exists (
      select 1 from public.student_parents sp where sp.student_id = st.id
    )

  union all

  select 'Penugasan mengajar tanpa guru atau mapel'::text, count(*)::bigint
  from public.class_schedules cs
  left join public.teachers t on t.id = cs.teacher_id
  left join public.subjects s on s.id = cs.subject_id
  where cs.active and (t.id is null or s.id is null)

  union all

  select 'Buku agenda dengan kelas tanpa siswa'::text, count(*)::bigint
  from public.agenda_buku b
  where not exists (
    select 1
    from public.students st
    where st.class_id = b.kelas_id and st.active
  )

  union all

  select 'Transaksi agenda dengan siswa di luar kelas buku'::text, count(*)::bigint
  from (
    select ak.buku_id, ak.siswa_id
    from public.agenda_kehadiran ak
    union all
    select an.buku_id, an.siswa_id
    from public.agenda_nilai an
  ) transaksi
  join public.agenda_buku b on b.id = transaksi.buku_id
  left join public.students st
    on st.id = transaksi.siswa_id
    and st.class_id = b.kelas_id
    and st.active
  where st.id is null

  union all

  select 'Nilai di luar rentang 0-100'::text, count(*)::bigint
  from public.agenda_nilai an
  where an.jenis in ('tugas', 'pts', 'pas')
    and case
      when an.nilai ~ '^[0-9]{1,3}$' then an.nilai::integer not between 0 and 100
      else true
    end;
end;
$$;

grant execute on function public.agenda_integrity_report() to authenticated;
