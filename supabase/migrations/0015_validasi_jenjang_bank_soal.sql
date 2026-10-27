-- Identitas bank dan ujian tidak boleh dipindahkan lintas jenjang.
create or replace function public.lock_assessment_grade()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.grade is distinct from old.grade then
    raise exception 'Jenjang bank soal atau ujian tidak dapat diubah. Buat data baru pada jenjang yang sesuai.';
  end if;
  return new;
end $$;
do $$
declare target_table text;
begin
  foreach target_table in array array['question_banks', 'ujian_harian_banks', 'exams', 'ujian_harian'] loop
    execute format('create trigger lock_assessment_grade before update of grade on public.%I for each row execute function public.lock_assessment_grade()', target_table);
  end loop;
end $$;

-- Berlaku untuk penulisan berikutnya; soal lama tetap dapat dibaca.
create or replace function public.validate_question_options()
returns trigger language plpgsql set search_path = public as $$
declare bank_grade text; expected integer; option_keys text[]; answer text;
begin
  if new.type <> 'PG' and not (new.type = 'Interaktif' and coalesce(new.interactive_answer_type in ('PG', 'PG_Multi'), false)) then return new; end if;
  if tg_table_name = 'questions' then
    select grade into bank_grade from public.question_banks where id = new.bank_id;
  else
    select grade into bank_grade from public.ujian_harian_banks where id = new.bank_id;
  end if;
  expected := case when bank_grade = 'SMP' then 4 else 5 end;
  option_keys := case when expected = 4 then array['A','B','C','D'] else array['A','B','C','D','E'] end;
  if jsonb_typeof(new.options) is distinct from 'array' then raise exception 'Opsi pilihan ganda wajib diisi.'; end if;
  if jsonb_array_length(new.options) <> expected then raise exception 'Pilihan ganda % wajib memiliki % opsi.', bank_grade, expected; end if;
  for i in 0..expected - 1 loop
    if new.options->i->>'key' is distinct from option_keys[i+1] or coalesce(trim(new.options->i->>'text'), '') = '' then
      raise exception 'Opsi pilihan ganda harus berurutan dan terisi lengkap.';
    end if;
  end loop;
  if jsonb_typeof(new.answer_key) = 'array' then
    if jsonb_array_length(new.answer_key) = 0 then raise exception 'Kunci jawaban wajib dipilih.'; end if;
    for answer in select jsonb_array_elements_text(new.answer_key) loop
      if answer is null or not (answer = any(option_keys)) then raise exception 'Kunci jawaban tidak sesuai opsi.'; end if;
    end loop;
  elsif jsonb_typeof(new.answer_key) is distinct from 'string' or not ((new.answer_key #>> '{}') = any(option_keys)) then
    raise exception 'Kunci jawaban tidak sesuai opsi.';
  end if;
  return new;
end $$;
create trigger validate_question_options before insert or update of options, answer_key, type, bank_id, interactive_answer_type on public.questions
  for each row execute function public.validate_question_options();
create trigger validate_daily_question_options before insert or update of options, answer_key, type, bank_id, interactive_answer_type on public.ujian_harian_questions
  for each row execute function public.validate_question_options();

create or replace function public.validate_bank_subject_schedule()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.class_id is not distinct from old.class_id and new.subject_id is not distinct from old.subject_id then return new; end if;
  if not exists (select 1 from public.class_schedules where class_id = new.class_id and subject_id = new.subject_id and active) then
    raise exception 'Mata pelajaran belum terdaftar pada jadwal kelas yang dipilih.';
  end if;
  return new;
end $$;
create trigger validate_bank_subject_schedule before insert or update of class_id, subject_id on public.question_banks
  for each row execute function public.validate_bank_subject_schedule();
create trigger validate_daily_bank_subject_schedule before insert or update of class_id, subject_id on public.ujian_harian_banks
  for each row execute function public.validate_bank_subject_schedule();
