-- ==============================================================================
-- Migrasi 0019: spmb_lacak diperlengkap — modal Lacak publik menampilkan
-- jurusan & sekolah asal, jadi RPC ikut mengembalikan dua kolom itu.
-- Jalankan sekali di Supabase SQL Editor (aman dijalankan ulang).
-- ==============================================================================

create or replace function public.spmb_lacak(p_id text)
returns table (
  id text,
  s_nama text,
  jenjang text,
  jurusan text,
  s_sekolah text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select r.id, r.s_nama, r.jenjang, r.jurusan, r.s_sekolah, r.status, r.created_at
  from public.spmb_registrations r
  where r.id = upper(trim(p_id))
    and r.deleted_at is null;
$$;

grant execute on function public.spmb_lacak(text) to anon, authenticated;

notify pgrst, 'reload schema';
