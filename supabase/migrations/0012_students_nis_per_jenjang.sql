alter table public.students
  drop constraint if exists students_nis_key;

create unique index if not exists students_grade_nis_unique
  on public.students (grade, nis)
  where nis is not null;

notify pgrst, 'reload schema';
