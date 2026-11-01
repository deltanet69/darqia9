-- Migrasi 0023 — RBAC / Hak Akses (Sistem Apps)
-- Tabel: rbac_roles (peran, bisa CRUD; superadmin terkunci), rbac_permissions
-- (matriks modul x lihat/buat/ubah/hapus per peran), rbac_assignments
-- (penugasan pengguna -> peran; subjek_id adalah KUNCI PRIMER sehingga satu
-- pengguna hanya bisa memegang satu peran — penugasan baru memindahkan yang lama).
-- Kolom jenjang pada penugasan = cakupan SMP/SMK (boleh keduanya).
-- Prasyarat: migrasi 0018 sudah jalan (fungsi public.is_staff()).
-- Fungsi rbac_can(modul, aksi) menjadi fondasi penegakan lapisan database.

create table if not exists public.rbac_roles (
  id uuid primary key,
  kunci text not null unique,
  nama text not null,
  deskripsi text not null default '',
  terkunci boolean not null default false,
  urutan int not null default 99,
  created_at timestamptz not null default now()
);

create table if not exists public.rbac_permissions (
  peran_id uuid not null references public.rbac_roles(id) on delete cascade,
  modul text not null,
  lihat boolean not null default false,
  buat boolean not null default false,
  ubah boolean not null default false,
  hapus boolean not null default false,
  primary key (peran_id, modul)
);

create table if not exists public.rbac_assignments (
  subjek_id text primary key,
  nama text not null,
  peran_id uuid not null references public.rbac_roles(id),
  jenjang text[] not null default array['SMK','SMP'],
  created_at timestamptz not null default now(),
  constraint rbac_assignments_jenjang_valid check (jenjang <@ array['SMK','SMP'] and cardinality(jenjang) >= 1)
);

create or replace function public.rbac_can(p_modul text, p_aksi text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.rbac_assignments a
    join public.rbac_roles r on r.id = a.peran_id
    left join public.rbac_permissions p on p.peran_id = r.id and p.modul = p_modul
    where a.subjek_id = (select auth.uid())::text
      and (
        r.terkunci
        or case p_aksi
          when 'lihat' then coalesce(p.lihat, false)
          when 'buat' then coalesce(p.buat, false)
          when 'ubah' then coalesce(p.ubah, false)
          when 'hapus' then coalesce(p.hapus, false)
          else false
        end
      )
  );
$$;

-- ===== Data awal peran (sesuai preview RBAC v6 yang disetujui) =====
insert into public.rbac_roles (id, kunci, nama, deskripsi, terkunci, urutan) values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'superadmin', 'Superadmin', 'Akses penuh ke semua modul — tidak bisa diubah.', true, 0),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'ketua_yayasan', 'Ketua Yayasan', 'Pengurus yayasan — pengawasan menyeluruh, tanpa pengelolaan harian.', false, 1),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'kepala_sekolah', 'Kepala Sekolah', 'Kepala sekolah — melihat semua data dan mengatur hal strategis.', false, 2),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'wakil_kepala_sekolah', 'Wakil Kepala Sekolah', 'Wakil kepala sekolah — mendampingi kepsek di bidang akademik.', false, 3),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'operator', 'Operator', 'Mengelola operasional harian hampir semua modul.', false, 4),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'staff_adm', 'Staff Adm', 'Staff administrasi / TU — data siswa, kelas, dan tabungan.', false, 5),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'wali_kelas', 'Wali Kelas', 'Wali kelas — hanya kelas yang diampu.', false, 6),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'guru_pengajar', 'Guru Pengajar', 'Guru pengajar — jadwal, agenda, modul, dan CBT mapelnya.', false, 7),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'staff_sekolah', 'Staff Sekolah', 'Staff non-guru — akses terbatas sesuai tugasnya.', false, 8)
on conflict (kunci) do nothing;

-- ===== Data awal izin =====
insert into public.rbac_permissions (peran_id, modul, lihat, buat, ubah, hapus) values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Dashboard', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Data Siswa', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Absensi Siswa', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Manajemen Kelas', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Jadwal Pelajaran', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Master Mapel', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Raport Siswa', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Data Guru & Staff', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Absensi Guru', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Jadwal Mengajar', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Agenda Mengajar', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Modul Pembelajaran', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Keuangan Sekolah', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Tabungan Siswa', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Manajemen CBT', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'LMS', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Konten Website', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'SPMB', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Perpustakaan Digital', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Manajemen User', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Hak Akses (RBAC)', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Log Aktivitas', true, true, true, true),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Pengaturan', true, true, true, true),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Dashboard', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Data Siswa', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Absensi Siswa', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Manajemen Kelas', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Jadwal Pelajaran', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Master Mapel', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Raport Siswa', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Data Guru & Staff', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Absensi Guru', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Jadwal Mengajar', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Agenda Mengajar', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Modul Pembelajaran', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Keuangan Sekolah', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Tabungan Siswa', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Manajemen CBT', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'LMS', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Konten Website', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'SPMB', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Perpustakaan Digital', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Manajemen User', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Hak Akses (RBAC)', false, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Log Aktivitas', true, false, false, false),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Pengaturan', false, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Dashboard', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Data Siswa', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Absensi Siswa', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Manajemen Kelas', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Jadwal Pelajaran', true, false, true, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Master Mapel', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Raport Siswa', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Data Guru & Staff', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Absensi Guru', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Jadwal Mengajar', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Agenda Mengajar', true, false, true, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Modul Pembelajaran', true, false, true, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Keuangan Sekolah', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Tabungan Siswa', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Manajemen CBT', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'LMS', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Konten Website', true, false, true, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'SPMB', true, false, true, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Perpustakaan Digital', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Manajemen User', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Hak Akses (RBAC)', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Log Aktivitas', true, false, false, false),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Pengaturan', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Dashboard', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Data Siswa', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Absensi Siswa', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Manajemen Kelas', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Jadwal Pelajaran', true, false, true, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Master Mapel', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Raport Siswa', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Data Guru & Staff', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Absensi Guru', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Jadwal Mengajar', true, false, true, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Agenda Mengajar', true, false, true, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Modul Pembelajaran', true, false, true, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Keuangan Sekolah', false, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Tabungan Siswa', false, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Manajemen CBT', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'LMS', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Konten Website', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'SPMB', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Perpustakaan Digital', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Manajemen User', false, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Hak Akses (RBAC)', false, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Log Aktivitas', true, false, false, false),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'Pengaturan', false, false, false, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Dashboard', true, false, false, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Data Siswa', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Absensi Siswa', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Manajemen Kelas', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Jadwal Pelajaran', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Master Mapel', true, true, true, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Raport Siswa', true, true, true, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Data Guru & Staff', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Absensi Guru', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Jadwal Mengajar', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Agenda Mengajar', true, true, true, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Modul Pembelajaran', true, true, true, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Keuangan Sekolah', true, true, true, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Tabungan Siswa', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Manajemen CBT', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'LMS', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Konten Website', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'SPMB', true, true, true, true),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Perpustakaan Digital', true, true, true, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Manajemen User', true, true, true, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Hak Akses (RBAC)', true, false, false, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Log Aktivitas', true, false, false, false),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'Pengaturan', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Dashboard', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Data Siswa', true, true, true, true),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Absensi Siswa', true, true, true, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Manajemen Kelas', true, true, true, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Jadwal Pelajaran', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Master Mapel', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Raport Siswa', true, false, true, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Data Guru & Staff', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Absensi Guru', true, true, true, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Jadwal Mengajar', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Agenda Mengajar', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Modul Pembelajaran', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Keuangan Sekolah', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Tabungan Siswa', true, true, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Manajemen CBT', true, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'LMS', false, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Konten Website', false, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'SPMB', true, true, true, true),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Perpustakaan Digital', false, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Manajemen User', false, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Hak Akses (RBAC)', false, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Log Aktivitas', false, false, false, false),
  ('66666666-6666-4666-8666-666666666666'::uuid, 'Pengaturan', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Dashboard', true, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Data Siswa', true, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Absensi Siswa', true, false, true, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Manajemen Kelas', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Jadwal Pelajaran', true, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Master Mapel', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Raport Siswa', true, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Data Guru & Staff', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Absensi Guru', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Jadwal Mengajar', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Agenda Mengajar', true, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Modul Pembelajaran', true, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Keuangan Sekolah', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Tabungan Siswa', true, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Manajemen CBT', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'LMS', true, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Konten Website', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'SPMB', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Perpustakaan Digital', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Manajemen User', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Hak Akses (RBAC)', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Log Aktivitas', false, false, false, false),
  ('77777777-7777-4777-8777-777777777777'::uuid, 'Pengaturan', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Dashboard', true, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Data Siswa', true, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Absensi Siswa', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Manajemen Kelas', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Jadwal Pelajaran', true, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Master Mapel', true, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Raport Siswa', true, false, true, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Data Guru & Staff', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Absensi Guru', true, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Jadwal Mengajar', true, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Agenda Mengajar', true, true, true, true),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Modul Pembelajaran', true, true, true, true),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Keuangan Sekolah', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Tabungan Siswa', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Manajemen CBT', true, true, true, true),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'LMS', true, true, true, true),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Konten Website', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'SPMB', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Perpustakaan Digital', true, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Manajemen User', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Hak Akses (RBAC)', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Log Aktivitas', false, false, false, false),
  ('88888888-8888-4888-8888-888888888888'::uuid, 'Pengaturan', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Dashboard', true, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Data Siswa', true, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Absensi Siswa', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Manajemen Kelas', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Jadwal Pelajaran', true, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Master Mapel', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Raport Siswa', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Data Guru & Staff', true, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Absensi Guru', true, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Jadwal Mengajar', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Agenda Mengajar', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Modul Pembelajaran', true, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Keuangan Sekolah', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Tabungan Siswa', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Manajemen CBT', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'LMS', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Konten Website', true, true, true, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'SPMB', true, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Perpustakaan Digital', true, true, true, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Manajemen User', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Hak Akses (RBAC)', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Log Aktivitas', false, false, false, false),
  ('99999999-9999-4999-8999-999999999999'::uuid, 'Pengaturan', false, false, false, false)
on conflict (peran_id, modul) do nothing;

-- ===== RLS =====
-- Baca: semua pengguna terautentikasi (UI perlu menampilkan peran & izin).
-- Tulis: staff (is_staff) ATAU pemegang izin RBAC yang sesuai ATAU selama belum
-- ada penugasan sama sekali (jendela bootstrap penyiapan awal — tertutup
-- otomatis begitu penugasan pertama dibuat).
alter table public.rbac_roles enable row level security;
alter table public.rbac_permissions enable row level security;
alter table public.rbac_assignments enable row level security;

drop policy if exists rbac_roles_baca on public.rbac_roles;
create policy rbac_roles_baca on public.rbac_roles for select to authenticated using (true);
drop policy if exists rbac_roles_sisip on public.rbac_roles;
create policy rbac_roles_sisip on public.rbac_roles for insert to authenticated with check (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'buat') or not exists (select 1 from public.rbac_assignments));
drop policy if exists rbac_roles_ubah on public.rbac_roles;
create policy rbac_roles_ubah on public.rbac_roles for update to authenticated using (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'ubah') or not exists (select 1 from public.rbac_assignments)) with check (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'ubah') or not exists (select 1 from public.rbac_assignments));
drop policy if exists rbac_roles_hapus on public.rbac_roles;
create policy rbac_roles_hapus on public.rbac_roles for delete to authenticated using (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'hapus') or not exists (select 1 from public.rbac_assignments));

drop policy if exists rbac_permissions_baca on public.rbac_permissions;
create policy rbac_permissions_baca on public.rbac_permissions for select to authenticated using (true);
drop policy if exists rbac_permissions_sisip on public.rbac_permissions;
create policy rbac_permissions_sisip on public.rbac_permissions for insert to authenticated with check (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'buat') or not exists (select 1 from public.rbac_assignments));
drop policy if exists rbac_permissions_ubah on public.rbac_permissions;
create policy rbac_permissions_ubah on public.rbac_permissions for update to authenticated using (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'ubah') or not exists (select 1 from public.rbac_assignments)) with check (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'ubah') or not exists (select 1 from public.rbac_assignments));
drop policy if exists rbac_permissions_hapus on public.rbac_permissions;
create policy rbac_permissions_hapus on public.rbac_permissions for delete to authenticated using (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'hapus') or not exists (select 1 from public.rbac_assignments));

drop policy if exists rbac_assignments_baca on public.rbac_assignments;
create policy rbac_assignments_baca on public.rbac_assignments for select to authenticated using (true);
drop policy if exists rbac_assignments_sisip on public.rbac_assignments;
create policy rbac_assignments_sisip on public.rbac_assignments for insert to authenticated with check (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'buat') or not exists (select 1 from public.rbac_assignments));
drop policy if exists rbac_assignments_ubah on public.rbac_assignments;
create policy rbac_assignments_ubah on public.rbac_assignments for update to authenticated using (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'ubah') or not exists (select 1 from public.rbac_assignments)) with check (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'ubah') or not exists (select 1 from public.rbac_assignments));
drop policy if exists rbac_assignments_hapus on public.rbac_assignments;
create policy rbac_assignments_hapus on public.rbac_assignments for delete to authenticated using (public.is_staff() or public.rbac_can('Hak Akses (RBAC)', 'hapus') or not exists (select 1 from public.rbac_assignments));
