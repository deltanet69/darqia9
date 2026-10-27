-- Pilihan berurutan dipisah per sumber. Tanpa relasi berarti seluruh bank lama.
create table public.exam_questions (
  exam_id uuid not null references public.exams(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  position integer not null check (position > 0),
  primary key (exam_id, question_id),
  unique (exam_id, position)
);
create table public.ujian_harian_exam_questions (
  exam_id uuid not null references public.ujian_harian(id) on delete cascade,
  question_id uuid not null references public.ujian_harian_questions(id) on delete restrict,
  position integer not null check (position > 0),
  primary key (exam_id, question_id),
  unique (exam_id, position)
);
alter table public.exam_questions enable row level security;
alter table public.ujian_harian_exam_questions enable row level security;
create policy "Staff manage exam questions" on public.exam_questions for all
  using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage daily exam questions" on public.ujian_harian_exam_questions for all
  using (public.is_staff()) with check (public.is_staff());

-- Pemeriksaan tetap berlaku untuk penulisan langsung di luar RPC.
create function public.validate_exam_question_bank() returns trigger
language plpgsql set search_path = public as $$
declare valid boolean;
begin
  if tg_table_name = 'exam_questions' then
    select exists (select 1 from public.exams e join public.questions q on q.bank_id = e.question_bank_id
      where e.id = new.exam_id and q.id = new.question_id) into valid;
  else
    select exists (select 1 from public.ujian_harian e join public.ujian_harian_questions q on q.bank_id = e.question_bank_id
      where e.id = new.exam_id and q.id = new.question_id) into valid;
  end if;
  if not valid then raise exception 'Soal tidak berasal dari bank ujian ini.'; end if;
  return new;
end $$;
create trigger validate_exam_question_bank before insert or update on public.exam_questions
  for each row execute function public.validate_exam_question_bank();
create trigger validate_daily_exam_question_bank before insert or update on public.ujian_harian_exam_questions
  for each row execute function public.validate_exam_question_bank();

create function public.save_assessment_exam(source text, exam_data jsonb, question_ids uuid[])
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  exam_table text; question_table text; relation_table text; assignment_table text;
  target_id uuid := coalesce((exam_data->>'id')::uuid, gen_random_uuid());
  bank_id uuid := (exam_data->>'question_bank_id')::uuid;
  found_count integer; started boolean;
begin
  if not public.is_staff() then raise exception 'Akses staf diperlukan.'; end if;
  if source = 'cbt' then
    exam_table := 'exams'; question_table := 'questions'; relation_table := 'exam_questions'; assignment_table := 'exam_assignments';
  elsif source = 'ujian_harian' then
    exam_table := 'ujian_harian'; question_table := 'ujian_harian_questions'; relation_table := 'ujian_harian_exam_questions'; assignment_table := 'ujian_harian_assignments';
  else raise exception 'Sumber ujian tidak valid.'; end if;
  if coalesce(cardinality(question_ids), 0) = 0 then raise exception 'Pilih minimal satu soal.'; end if;
  if cardinality(question_ids) <> (select count(distinct id) from unnest(question_ids) id) then
    raise exception 'Pilihan soal tidak boleh berulang.';
  end if;
  -- Kunci bank menyelaraskan penyimpanan pilihan dan perubahan isi bank.
  if source = 'cbt' then perform 1 from public.question_banks where id = bank_id for update;
  else perform 1 from public.ujian_harian_banks where id = bank_id for update; end if;
  execute format('select count(*) from public.%I where bank_id = $1 and id = any($2)', question_table)
    into found_count using bank_id, question_ids;
  if found_count <> cardinality(question_ids) then raise exception 'Ada soal yang tidak tersedia di bank ujian.'; end if;
  execute format('select id from public.%I where id = $1 for update', exam_table) using target_id;
  execute format('select exists(select 1 from public.%I where exam_id = $1 and status <> ''belum_mulai'')', assignment_table)
    into started using target_id;
  if started then raise exception 'Ujian yang sudah dikerjakan tidak dapat diubah.'; end if;
  -- Metadata dan pilihan disimpan dalam satu transaksi.
  execute format('insert into public.%I (id, code, name, grade, class_id, subject_id, question_bank_id, supervisor_id, starts_at, duration_minutes, status)
    values ($1, $2->>''code'', $2->>''name'', $2->>''grade'', ($2->>''class_id'')::uuid,
      ($2->>''subject_id'')::uuid, ($2->>''question_bank_id'')::uuid, ($2->>''supervisor_id'')::uuid,
      ($2->>''starts_at'')::timestamptz, ($2->>''duration_minutes'')::integer, ''terjadwal'')
    on conflict (id) do update set code = excluded.code, name = excluded.name, grade = excluded.grade,
      class_id = excluded.class_id, subject_id = excluded.subject_id, question_bank_id = excluded.question_bank_id,
      supervisor_id = excluded.supervisor_id, starts_at = excluded.starts_at, duration_minutes = excluded.duration_minutes, updated_at = now()', exam_table)
    using target_id, exam_data;
  execute format('delete from public.%I where exam_id = $1', relation_table) using target_id;
  execute format('insert into public.%I (exam_id, question_id, position) select $1, id, ord from unnest($2::uuid[]) with ordinality as q(id, ord)', relation_table)
    using target_id, question_ids;
  return target_id;
end $$;

-- Pertahankan UUID soal saat mengedit bank; kegagalan membatalkan seluruh paket.
create function public.save_assessment_bank(source text, bank_data jsonb, question_data jsonb)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  bank_table text; question_table text; target_id uuid; invalid boolean; offset_number integer;
begin
  if not public.is_staff() then raise exception 'Akses staf diperlukan.'; end if;
  if source = 'cbt' then bank_table := 'question_banks'; question_table := 'questions';
  elsif source = 'ujian_harian' then bank_table := 'ujian_harian_banks'; question_table := 'ujian_harian_questions';
  else raise exception 'Sumber bank soal tidak valid.'; end if;
  execute format('insert into public.%I (id, code, classroom, subject, grade, difficulty, teacher_name, has_interactive, class_id, subject_id)
    values (coalesce(($1->>''id'')::uuid, gen_random_uuid()), $1->>''code'', $1->>''classroom'', $1->>''subject'',
      $1->>''grade'', $1->>''difficulty'', $1->>''teacher_name'', ($1->>''has_interactive'')::boolean,
      ($1->>''class_id'')::uuid, ($1->>''subject_id'')::uuid)
    on conflict (id) do update set code = excluded.code, classroom = excluded.classroom, subject = excluded.subject,
      grade = excluded.grade, difficulty = excluded.difficulty, teacher_name = excluded.teacher_name,
      has_interactive = excluded.has_interactive, class_id = excluded.class_id, subject_id = excluded.subject_id, updated_at = now()
    returning id', bank_table) into target_id using bank_data;
  execute format('select exists(select 1 from jsonb_array_elements($1) r join public.%I q on q.id = (r->>''id'')::uuid where q.bank_id <> $2)', question_table)
    into invalid using question_data, target_id;
  if invalid then raise exception 'Soal berasal dari bank lain.'; end if;
  execute format('select exists(select 1 from jsonb_array_elements($1) r where
    (r->>''type'' = ''Isian'' and not exists(select 1 from public.%I q where q.id = (r->>''id'')::uuid and q.bank_id = $2 and q.type = ''Isian'')) or
    (r->>''interactive_answer_type'' = ''Isian'' and r->>''type'' = ''Interaktif'' and not exists(select 1 from public.%I q where q.id = (r->>''id'')::uuid and q.bank_id = $2 and q.type = ''Interaktif'' and q.interactive_answer_type = ''Isian'')))', question_table, question_table)
    into invalid using question_data, target_id;
  if invalid then raise exception 'Tipe jawaban ini tidak tersedia untuk soal baru.'; end if;
  execute format('delete from public.%I where bank_id = $1 and id not in (select (r->>''id'')::uuid from jsonb_array_elements($2) r)', question_table)
    using target_id, question_data;
  execute format('select coalesce(max(number), 0) + jsonb_array_length($2) + 1 from public.%I where bank_id = $1', question_table)
    into offset_number using target_id, question_data;
  execute format('update public.%I set number = number + $2 where bank_id = $1', question_table) using target_id, offset_number;
  execute format('insert into public.%I (id, bank_id, number, type, text, difficulty, is_multi_select, options, answer_key, rubric, image_url, media_type, media_url, media_file_name, interactive_answer_type, is_rtl)
    select r.id, $1, r.number, r.type, r.text, r.difficulty, r.is_multi_select, r.options, r.answer_key, r.rubric,
      r.image_url, r.media_type, r.media_url, r.media_file_name, r.interactive_answer_type, r.is_rtl
    from jsonb_to_recordset($2) as r(id uuid, number integer, type text, text text, difficulty text, is_multi_select boolean,
      options jsonb, answer_key jsonb, rubric text, image_url text, media_type text, media_url text, media_file_name text, interactive_answer_type text, is_rtl boolean)
    on conflict (id) do update set number = excluded.number, type = excluded.type, text = excluded.text, difficulty = excluded.difficulty,
      is_multi_select = excluded.is_multi_select, options = excluded.options, answer_key = excluded.answer_key, rubric = excluded.rubric,
      image_url = excluded.image_url, media_type = excluded.media_type, media_url = excluded.media_url,
      media_file_name = excluded.media_file_name, interactive_answer_type = excluded.interactive_answer_type, is_rtl = excluded.is_rtl', question_table)
    using target_id, question_data;
  return target_id;
exception when foreign_key_violation then
  raise exception 'Soal masih dipakai dalam ujian. Lepaskan dari pilihan ujian sebelum menghapusnya.';
end $$;

revoke all on function public.save_assessment_exam(text, jsonb, uuid[]) from public, anon;
revoke all on function public.save_assessment_bank(text, jsonb, jsonb) from public, anon;
grant execute on function public.save_assessment_exam(text, jsonb, uuid[]) to authenticated;
grant execute on function public.save_assessment_bank(text, jsonb, jsonb) to authenticated;

-- Hanya muat soal ujian sesuai NIS aktif, token, jenjang, dan rombel asli.
-- Kunci jawaban dan rubrik tidak pernah menjadi bagian respons siswa.
create function public.load_student_exam_questions(student_nis text, exam_code text, target_grade text, source text default 'cbt')
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  exam_table text; question_table text; relation_table text;
  exam_row record; student_row record; question_rows jsonb; has_selection boolean;
begin
  if source = 'cbt' then exam_table := 'exams'; question_table := 'questions'; relation_table := 'exam_questions';
  elsif source = 'ujian_harian' then exam_table := 'ujian_harian'; question_table := 'ujian_harian_questions'; relation_table := 'ujian_harian_exam_questions';
  else raise exception 'Sumber ujian tidak valid.'; end if;
  select id, name, class_id, grade into student_row from public.students
    where nis = student_nis and grade = target_grade and active;
  execute format('select id, name, class_id, question_bank_id, duration_minutes, subject_id, code from public.%I
    where code = upper($1) and grade = $2 and class_id = $3 and status in (''terjadwal'', ''berlangsung'')
      and starts_at <= now() and starts_at + duration_minutes * interval ''1 minute'' > now()', exam_table)
    into exam_row using exam_code, target_grade, student_row.class_id;
  if exam_row.id is null or student_row.id is null then raise exception 'NIS atau token tidak cocok dengan ujian yang tersedia.'; end if;
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
