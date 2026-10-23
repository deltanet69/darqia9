-- Guru dan staf non-PNS dapat belum memiliki NIP. NIK menjadi identitas cadangan.
update public.teachers set nip = null where trim(nip) in ('', '-');
update public.teachers set nik = null where trim(nik) in ('', '-');

alter table public.teachers
  alter column nip drop not null;

create unique index if not exists teachers_nik_unique
  on public.teachers (nik);
