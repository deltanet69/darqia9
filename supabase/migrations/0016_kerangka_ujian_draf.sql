-- 0016: Kerangka ujian sebagai draf (alur 3 langkah CBT & LMS)
--
-- Tujuan: operator dapat menyimpan KERANGKA ujian (Langkah 2 pada brief
-- docs/Admin Portal/CBT/cbt_banksoal.md) sebelum jadwal dan soal lengkap.
-- Ujian kerangka berstatus 'draf', ditampilkan di Daftar Ujian sebagai
-- "Belum Lengkap" beserta keterangan kurangnya, lalu dilengkapi dan
-- diterbitkan dari layar yang sama.
--
-- Keamanan siswa: load_student_exam_questions (0014) hanya memuat ujian
-- berstatus 'terjadwal'/'berlangsung', jadi draf TIDAK pernah tampil ke
-- siswa. Penerbitan tetap lewat save_assessment_exam (0014) yang
-- mewajibkan jadwal + minimal 1 soal, ditambah publish_exam_framework
-- di berkas ini untuk menaikkan status draf menjadi terjadwal.
--
-- BELUM DITERAPKAN selama berkas ini belum dijalankan owner di Supabase.
-- Antarmuka draf menyusul setelah migrasi ini aktif (lihat
-- docs/laporan-cbt-daftar-ujian.md).

-- 1) Kerangka boleh belum mempunyai jadwal dan bank soal.
alter table public.exams alter column starts_at drop not null;
alter table public.exams alter column question_bank_id drop not null;
alter table public.ujian_harian alter column starts_at drop not null;
alter table public.ujian_harian alter column question_bank_id drop not null;

-- 2) Simpan kerangka ujian (baru atau ubah draf yang sudah ada).
create function public.save_exam_framework(source text, exam_data jsonb)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  exam_table text; assignment_table text;
  target_id uuid := coalesce((exam_data->>'id')::uuid, gen_random_uuid());
  current_status text; started boolean;
  framework_code text := coalesce(nullif(exam_data->>'code', ''), 'DRAF-' || upper(substr(target_id::text, 1, 8)));
begin
  if not public.is_staff() then raise exception 'Akses staf diperlukan.'; end if;
  if source = 'cbt' then
    exam_table := 'exams'; assignment_table := 'exam_assignments';
  elsif source = 'ujian_harian' then
    exam_table := 'ujian_harian'; assignment_table := 'ujian_harian_assignments';
  else raise exception 'Sumber ujian tidak valid.'; end if;

  execute format('select status from public.%I where id = $1 for update', exam_table)
    into current_status using target_id;
  if current_status is not null and current_status <> 'draf' then
    raise exception 'Kerangka hanya dapat diubah selama ujian masih berstatus draf.';
  end if;
  execute format('select exists(select 1 from public.%I where exam_id = $1 and status <> ''belum_mulai'')', assignment_table)
    into started using target_id;
  if started then raise exception 'Ujian yang sudah dikerjakan tidak dapat diubah.'; end if;

  execute format('insert into public.%I (id, code, name, grade, class_id, subject_id, question_bank_id, supervisor_id, starts_at, duration_minutes, status)
    values ($1, $3, $2->>''name'', $2->>''grade'', ($2->>''class_id'')::uuid,
      ($2->>''subject_id'')::uuid, ($2->>''question_bank_id'')::uuid, ($2->>''supervisor_id'')::uuid,
      ($2->>''starts_at'')::timestamptz, coalesce(($2->>''duration_minutes'')::integer, 90), ''draf'')
    on conflict (id) do update set name = excluded.name, grade = excluded.grade,
      class_id = excluded.class_id, subject_id = excluded.subject_id,
      question_bank_id = excluded.question_bank_id, supervisor_id = excluded.supervisor_id,
      starts_at = excluded.starts_at, duration_minutes = excluded.duration_minutes, updated_at = now()', exam_table)
    using target_id, exam_data, framework_code;
  return target_id;
end $$;

-- 3) Naikkan draf menjadi terjadwal setelah save_assessment_exam berhasil
--    menyimpan jadwal + pilihan soal ujian itu.
create function public.publish_exam_framework(source text, target_exam_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare
  exam_table text; relation_table text;
  current_status text; exam_starts timestamptz; question_count integer;
begin
  if not public.is_staff() then raise exception 'Akses staf diperlukan.'; end if;
  if source = 'cbt' then
    exam_table := 'exams'; relation_table := 'exam_questions';
  elsif source = 'ujian_harian' then
    exam_table := 'ujian_harian'; relation_table := 'ujian_harian_exam_questions';
  else raise exception 'Sumber ujian tidak valid.'; end if;

  execute format('select status, starts_at from public.%I where id = $1 for update', exam_table)
    into current_status, exam_starts using target_exam_id;
  if current_status is null then raise exception 'Ujian tidak ditemukan.'; end if;
  if current_status <> 'draf' then raise exception 'Hanya ujian draf yang dapat diterbitkan dari kerangka.'; end if;
  if exam_starts is null then raise exception 'Jadwal ujian belum diisi.'; end if;
  execute format('select count(*) from public.%I where exam_id = $1', relation_table)
    into question_count using target_exam_id;
  if question_count = 0 then raise exception 'Soal ujian belum dipasang.'; end if;

  -- Kode/token TIDAK diubah di sini: token resmi sudah ditulis
  -- save_assessment_exam pada langkah simpan sebelumnya.
  execute format('update public.%I set status = ''terjadwal'', updated_at = now() where id = $1', exam_table)
    using target_exam_id;
end $$;
