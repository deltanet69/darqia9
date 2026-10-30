-- Migrasi 0022 — Modul Pembelajaran (Kepegawaian)
-- Dokumen modul ajar / modul projek PjBL berstruktur A–H (Identitas, Komponen
-- Inti, Produk, Langkah Kegiatan, Asesmen, Diferensiasi, Refleksi, Lampiran).
-- Alur persetujuan TANPA pengesahan kepala sekolah (keputusan user 31 Okt 2026):
--   draf -> menunggu (dikumpulkan penulis) -> disetujui (admin menyetujui).
-- Aturan akses (keputusan user 31 Okt 2026):
--   1) Superadmin/staff: CRUD penuh.
--   2) Semua guru bisa MEMBACA seluruh modul; edit/update HANYA penulisnya
--      (author_teacher_id -> teachers.user_id = auth.uid()).
--   3) Soft delete: kolom deleted_at; baris tidak pernah dihapus permanen
--      oleh aplikasi (arsip bisa dipulihkan superadmin).
--   4) Terintegrasi: penyusun merujuk teachers, jenjang mengikuti pengalih
--      global AdminV2, isi dokumen (seksi B–H) disimpan sebagai jsonb "isi".
-- Prasyarat: migrasi 0018 sudah jalan (fungsi public.is_staff()).

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  jenjang text not null check (jenjang in ('SMP', 'SMK')),
  jenis text not null default 'projek' check (jenis in ('projek', 'mapel')),
  nomor int,
  judul text not null,
  penyusun text not null,
  author_teacher_id uuid references public.teachers(id) on delete set null,
  satuan text,
  mapel text,
  fase text,
  kelas text,
  alokasi_jp int,
  jumlah_pertemuan int,
  durasi_minggu int,
  status text not null default 'draf' check (status in ('draf', 'menunggu', 'disetujui')),
  tahap_berjalan int not null default 0 check (tahap_berjalan between 0 and 6),
  isi jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists learning_modules_jenjang_idx on public.learning_modules (jenjang, status);
create index if not exists learning_modules_author_idx on public.learning_modules (author_teacher_id);
create index if not exists learning_modules_deleted_idx on public.learning_modules (deleted_at);

alter table public.learning_modules enable row level security;

-- Baca: semua pengguna terautentikasi (guru & staff) boleh membaca semua modul.
drop policy if exists "learning_modules baca semua" on public.learning_modules;
create policy "learning_modules baca semua" on public.learning_modules
  for select to authenticated
  using (true);

-- Tulis (insert/update): staff (superadmin/admin) ATAU guru penulisnya sendiri.
drop policy if exists "learning_modules tulis penulis atau staff" on public.learning_modules;
create policy "learning_modules tulis penulis atau staff" on public.learning_modules
  for insert to authenticated
  with check (
    public.is_staff()
    or exists (select 1 from public.teachers t where t.id = author_teacher_id and t.user_id = auth.uid())
  );

drop policy if exists "learning_modules ubah penulis atau staff" on public.learning_modules;
create policy "learning_modules ubah penulis atau staff" on public.learning_modules
  for update to authenticated
  using (
    public.is_staff()
    or exists (select 1 from public.teachers t where t.id = author_teacher_id and t.user_id = auth.uid())
  )
  with check (
    public.is_staff()
    or exists (select 1 from public.teachers t where t.id = author_teacher_id and t.user_id = auth.uid())
  );

-- Hapus permanen: hanya staff (aplikasi sendiri memakai soft delete via update).
drop policy if exists "learning_modules hapus staff" on public.learning_modules;
create policy "learning_modules hapus staff" on public.learning_modules
  for delete to authenticated
  using (public.is_staff());
