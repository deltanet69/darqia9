-- Data rahasia siswa hanya boleh keluar untuk Superadmin/Admin TU dari sisi database.
create or replace function public.student_detail_sensitive(target_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('superadmin', 'admin', 'operator')
  ) then
    raise exception 'Akses data rahasia siswa ditolak.' using errcode = '42501';
  end if;

  return (
    select jsonb_build_object(
      'nik', nik,
      'noKk', family_card_number,
      'fatherNik', father_nik,
      'motherNik', mother_nik
    )
    from public.students
    where id = target_student_id
  );
end;
$$;

grant execute on function public.student_detail_sensitive(uuid) to authenticated;
