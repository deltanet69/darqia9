-- Token ujian per siswa: satu token berlaku untuk satu siswa pada satu ujian,
-- terikat NIS melalui assignment, dan hanya terbit bila persyaratan administrasi
-- siswa terpenuhi (students.exam_eligible — satu sumber Keuangan/CBT).
-- Terapkan SETELAH 0015 dan 0016.

alter table public.students
  add column if not exists exam_eligible boolean not null default true;

alter table public.exam_assignments
  add column if not exists access_token text,
  add column if not exists token_issued_at timestamptz;
alter table public.ujian_harian_assignments
  add column if not exists access_token text,
  add column if not exists token_issued_at timestamptz;

create unique index if not exists exam_assignments_access_token_key
  on public.exam_assignments (access_token) where access_token is not null;
create unique index if not exists ujian_harian_assignments_access_token_key
  on public.ujian_harian_assignments (access_token) where access_token is not null;

-- Token 8 karakter huruf besar + angka, tanpa karakter ambigu (0/O dan 1/I).
create function public.generate_student_token() returns text
language plpgsql set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
  end loop;
  return result;
end $$;

-- Pastikan assignment seluruh roster kelas ujian ada, lalu terbitkan token untuk
-- peserta eligible yang belum memilikinya. Mengembalikan jumlah token yang terbit.
create function public.issue_exam_tokens(target_exam_id uuid, source text default 'cbt')
returns integer language plpgsql security invoker set search_path = public as $$
declare
  exam_table text; assignment_table text;
  exam_class uuid; issued integer := 0; rec record; candidate text;
begin
  if not public.is_staff() then raise exception 'Akses staf diperlukan.'; end if;
  if source = 'cbt' then exam_table := 'exams'; assignment_table := 'exam_assignments';
  elsif source = 'ujian_harian' then exam_table := 'ujian_harian'; assignment_table := 'ujian_harian_assignments';
  else raise exception 'Sumber ujian tidak valid.'; end if;
  execute format('select class_id from public.%I where id = $1', exam_table)
    into exam_class using target_exam_id;
  if exam_class is null then raise exception 'Ujian tidak ditemukan.'; end if;
  execute format('insert into public.%I (exam_id, student_id)
    select $1, id from public.students where class_id = $2 and active
    on conflict (exam_id, student_id) do nothing', assignment_table)
    using target_exam_id, exam_class;
  for rec in execute format('select a.id from public.%I a
      join public.students s on s.id = a.student_id
      where a.exam_id = $1 and a.access_token is null and s.exam_eligible and s.active', assignment_table)
      using target_exam_id loop
    loop
      candidate := public.generate_student_token();
      begin
        execute format('update public.%I set access_token = $1, token_issued_at = now() where id = $2', assignment_table)
          using candidate, rec.id;
        exit;
      exception when unique_violation then candidate := null;
      end;
    end loop;
    issued := issued + 1;
  end loop;
  return issued;
end $$;

-- Terbitkan token satu siswa (assignment dibuat bila belum ada). Token yang sudah
-- ada dikembalikan apa adanya; gunakan regenerate_exam_token untuk mengganti.
create function public.issue_student_token(target_exam_id uuid, target_student_id uuid, source text default 'cbt')
returns text language plpgsql security invoker set search_path = public as $$
declare
  exam_table text; assignment_table text;
  exam_class uuid; student_row record; assignment_id uuid; existing text; candidate text;
begin
  if not public.is_staff() then raise exception 'Akses staf diperlukan.'; end if;
  if source = 'cbt' then exam_table := 'exams'; assignment_table := 'exam_assignments';
  elsif source = 'ujian_harian' then exam_table := 'ujian_harian'; assignment_table := 'ujian_harian_assignments';
  else raise exception 'Sumber ujian tidak valid.'; end if;
  execute format('select class_id from public.%I where id = $1', exam_table)
    into exam_class using target_exam_id;
  if exam_class is null then raise exception 'Ujian tidak ditemukan.'; end if;
  select id, class_id, exam_eligible, active into student_row from public.students where id = target_student_id;
  if student_row.id is null or not student_row.active or student_row.class_id is distinct from exam_class then
    raise exception 'Siswa bukan peserta ujian ini.';
  end if;
  if not student_row.exam_eligible then
    raise exception 'Siswa belum memenuhi persyaratan administrasi.';
  end if;
  execute format('insert into public.%I (exam_id, student_id) values ($1, $2)
    on conflict (exam_id, student_id) do update set exam_id = excluded.exam_id
    returning id, access_token', assignment_table)
    into assignment_id, existing using target_exam_id, target_student_id;
  if existing is not null then return existing; end if;
  loop
    candidate := public.generate_student_token();
    begin
      execute format('update public.%I set access_token = $1, token_issued_at = now() where id = $2', assignment_table)
        using candidate, assignment_id;
      return candidate;
    exception when unique_violation then candidate := null;
    end;
  end loop;
end $$;

-- Regenerasi token satu assignment: token lama hangus seketika.
create function public.regenerate_exam_token(target_assignment_id uuid, source text default 'cbt')
returns text language plpgsql security invoker set search_path = public as $$
declare
  assignment_table text; candidate text; eligible boolean;
begin
  if not public.is_staff() then raise exception 'Akses staf diperlukan.'; end if;
  if source = 'cbt' then assignment_table := 'exam_assignments';
  elsif source = 'ujian_harian' then assignment_table := 'ujian_harian_assignments';
  else raise exception 'Sumber ujian tidak valid.'; end if;
  execute format('select s.exam_eligible from public.%I a
    join public.students s on s.id = a.student_id where a.id = $1', assignment_table)
    into eligible using target_assignment_id;
  if eligible is null then raise exception 'Peserta tidak ditemukan.'; end if;
  if not eligible then raise exception 'Siswa belum memenuhi persyaratan administrasi.'; end if;
  loop
    candidate := public.generate_student_token();
    begin
      execute format('update public.%I set access_token = $1, token_issued_at = now() where id = $2', assignment_table)
        using candidate, target_assignment_id;
      return candidate;
    exception when unique_violation then candidate := null;
    end;
  end loop;
end $$;

revoke all on function public.issue_exam_tokens(uuid, text) from public, anon;
revoke all on function public.issue_student_token(uuid, uuid, text) from public, anon;
revoke all on function public.regenerate_exam_token(uuid, text) from public, anon;
grant execute on function public.issue_exam_tokens(uuid, text) to authenticated;
grant execute on function public.issue_student_token(uuid, uuid, text) to authenticated;
grant execute on function public.regenerate_exam_token(uuid, text) to authenticated;

-- Login siswa: token kini adalah token PRIBADI siswa pada assignment-nya, bukan
-- kode bersama ujian. Siswa harus aktif, eligible, terdaftar sebagai peserta
-- (assignment ada), dan ujian berada dalam jendela waktunya. exams.code tetap
-- identitas internal ujian dan tidak lagi berfungsi sebagai kredensial.
create or replace function public.load_student_exam_questions(student_nis text, exam_code text, target_grade text, source text default 'cbt')
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  exam_table text; question_table text; relation_table text; assignment_table text;
  exam_row record; student_row record; question_rows jsonb; has_selection boolean;
begin
  if source = 'cbt' then exam_table := 'exams'; question_table := 'questions'; relation_table := 'exam_questions'; assignment_table := 'exam_assignments';
  elsif source = 'ujian_harian' then exam_table := 'ujian_harian'; question_table := 'ujian_harian_questions'; relation_table := 'ujian_harian_exam_questions'; assignment_table := 'ujian_harian_assignments';
  else raise exception 'Sumber ujian tidak valid.'; end if;
  select id, name, class_id, grade into student_row from public.students
    where nis = student_nis and grade = target_grade and active and exam_eligible;
  if student_row.id is null then raise exception 'NIS atau token tidak cocok dengan ujian yang tersedia.'; end if;
  execute format('select e.id, e.name, e.class_id, e.question_bank_id, e.duration_minutes, e.subject_id, e.code
    from public.%I a join public.%I e on e.id = a.exam_id
    where a.student_id = $1 and a.access_token = upper($2) and e.grade = $3
      and e.status in (''terjadwal'', ''berlangsung'')
      and e.starts_at <= now() and e.starts_at + e.duration_minutes * interval ''1 minute'' > now()', assignment_table, exam_table)
    into exam_row using student_row.id, exam_code, target_grade;
  if exam_row.id is null then raise exception 'NIS atau token tidak cocok dengan ujian yang tersedia.'; end if;
  execute format('select exists(select 1 from public.%I where exam_id = $1)', relation_table) into has_selection using exam_row.id;
  execute format('select coalesce(jsonb_agg(to_jsonb(q) - ''answer_key'' - ''rubric'' - ''rubric_score'' - ''created_at'' order by coalesce(eq.position, q.number), q.id), ''[]''::jsonb)
    from public.%I q left join public.%I eq on eq.question_id = q.id and eq.exam_id = $1
    where q.bank_id = $2 and (not $3 or eq.question_id is not null)', question_table, relation_table)
    into question_rows using exam_row.id, exam_row.question_bank_id, has_selection;
  return jsonb_build_object('id', exam_row.id, 'name', exam_row.name, 'code', exam_row.code,
    'duration', exam_row.duration_minutes, 'studentName', student_row.name,
    'classroom', (select name from public.classes where id = student_row.class_id),
    'subject', (select name from public.subjects where id = exam_row.subject_id), 'questions', question_rows);
end $$;
revoke all on function public.load_student_exam_questions(text, text, text, text) from public;
grant execute on function public.load_student_exam_questions(text, text, text, text) to anon, authenticated;
