-- 0026_keuangan.sql — Keuangan Sekolah Darqia 9 (konsep FLAT per Kode Keuangan)
-- Jalankan manual di Supabase SQL Editor (pola sama seperti 0025 Tiketing).
--
-- Model data:
--   keuangan_paket      : master Kode Keuangan (nominal flat per tingkat,
--                         ditentukan manajemen berdasarkan tahun masuk).
--   keuangan_siswa      : penetapan siswa -> kode + biaya tambahan per tingkat.
--                         Siswa tetap milik tabel students (Data Induk);
--                         di sini hanya dipasang kodenya. Kunci (grade, nis)
--                         mengikuti index unik students_grade_nis_unique (0012).
--   keuangan_pembayaran : riwayat pembayaran — SATU-SATUNYA sumber angka
--                         "Total Dibayar". Nomor kwitansi dibuat trigger.
--   keuangan_cutoff     : serah dana sekolah -> yayasan; transaksi yang sudah
--                         masuk cut-off TERKUNCI (trigger menolak ubah/hapus).
--   keuangan_rekap      : view agregat dibayar per (grade, nis, tingkat) —
--                         halaman daftar membaca view ini, BUKAN memindai
--                         seluruh riwayat, supaya query tetap ringan.
--   keuangan_keterangan : master jenis pembayaran (tanpa Tabungan).
--
-- Penegakan akses: rute /adminV2/keuangan dijaga middleware RBAC modul
-- "Keuangan Sekolah" (sudah terdaftar di rbacCore PATH_KE_MODUL); RLS di
-- bawah membatasi semua tabel hanya untuk pengguna terotentikasi.

create table if not exists public.keuangan_paket (
  kode text primary key,
  nama text not null,
  grade text not null check (grade in ('SMP', 'SMK')),
  nominal_1 bigint not null default 0 check (nominal_1 >= 0),
  nominal_2 bigint not null default 0 check (nominal_2 >= 0),
  nominal_3 bigint not null default 0 check (nominal_3 >= 0),
  nominal_akhir bigint not null default 0 check (nominal_akhir >= 0),
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.keuangan_keterangan (
  id integer generated always as identity primary key,
  nama text not null unique,
  urutan integer not null default 0
);

create table if not exists public.keuangan_siswa (
  grade text not null check (grade in ('SMP', 'SMK')),
  nis text not null,
  kode text not null references public.keuangan_paket(kode) on update cascade,
  tambahan_1 bigint not null default 0 check (tambahan_1 >= 0),
  tambahan_2 bigint not null default 0 check (tambahan_2 >= 0),
  tambahan_3 bigint not null default 0 check (tambahan_3 >= 0),
  tambahan_akhir bigint not null default 0 check (tambahan_akhir >= 0),
  updated_at timestamptz not null default now(),
  primary key (grade, nis)
);

create table if not exists public.keuangan_cutoff (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique,
  grade text not null check (grade in ('SMP', 'SMK')),
  dari date not null,
  sampai date not null,
  trx integer not null default 0,
  total bigint not null default 0,
  oleh text not null default '',
  bukti boolean not null default false,
  created_at timestamptz not null default now(),
  check (sampai >= dari)
);

create table if not exists public.keuangan_pembayaran (
  id uuid primary key default gen_random_uuid(),
  no_kwitansi text unique,
  grade text not null check (grade in ('SMP', 'SMK')),
  nis text not null,
  tingkat smallint not null check (tingkat between 0 and 3),
  nominal bigint not null check (nominal > 0),
  keterangan text not null,
  metode text not null check (metode in ('Tunai', 'Transfer', 'QRIS')),
  petugas text not null default '',
  tanggal date not null default current_date,
  cutoff_id uuid references public.keuangan_cutoff(id),
  created_at timestamptz not null default now()
);

create index if not exists keuangan_bayar_grade_tanggal on public.keuangan_pembayaran (grade, tanggal desc);
create index if not exists keuangan_bayar_siswa on public.keuangan_pembayaran (grade, nis, tanggal desc);
create index if not exists keuangan_bayar_cutoff on public.keuangan_pembayaran (cutoff_id);
create index if not exists keuangan_siswa_kode on public.keuangan_siswa (kode);

create table if not exists public.keuangan_counter (
  grade text not null check (grade in ('SMP', 'SMK')),
  tahun integer not null,
  terakhir integer not null default 0,
  primary key (grade, tahun)
);

-- Nomor kwitansi otomatis: KEU-<tahun>-<urut 4 digit> per grade per tahun.
create or replace function public.keuangan_isi_kwitansi()
returns trigger language plpgsql as $$
declare v_urut integer;
begin
  if new.no_kwitansi is null or new.no_kwitansi = '' then
    insert into public.keuangan_counter (grade, tahun, terakhir)
    values (new.grade, extract(year from new.tanggal)::int, 1)
    on conflict (grade, tahun) do update set terakhir = public.keuangan_counter.terakhir + 1
    returning terakhir into v_urut;
    new.no_kwitansi := 'KEU-' || extract(year from new.tanggal)::int || '-' || lpad(v_urut::text, 4, '0');
  end if;
  return new;
end $$;

drop trigger if exists trg_keuangan_kwitansi on public.keuangan_pembayaran;
create trigger trg_keuangan_kwitansi before insert on public.keuangan_pembayaran
  for each row execute function public.keuangan_isi_kwitansi();

-- Kunci pembukuan: transaksi yang sudah cut-off tidak bisa diubah/dihapus.
create or replace function public.keuangan_jaga_terkunci()
returns trigger language plpgsql as $$
begin
  if old.cutoff_id is not null then
    raise exception 'Transaksi % sudah masuk cut-off dan terkunci', old.no_kwitansi;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

drop trigger if exists trg_keuangan_terkunci on public.keuangan_pembayaran;
create trigger trg_keuangan_terkunci before update or delete on public.keuangan_pembayaran
  for each row execute function public.keuangan_jaga_terkunci();

-- View agregat ringan untuk daftar & overview.
create or replace view public.keuangan_rekap as
select grade, nis, tingkat, sum(nominal)::bigint as dibayar, count(*)::int as trx
from public.keuangan_pembayaran
group by grade, nis, tingkat;

-- Buat cut-off secara atomik: hitung rentang, catat, kunci transaksinya.
create or replace function public.keuangan_buat_cutoff(p_grade text, p_dari date, p_sampai date, p_oleh text)
returns public.keuangan_cutoff language plpgsql as $$
declare v_trx integer; v_total bigint; v_kode text; v_hasil public.keuangan_cutoff;
begin
  select count(*), coalesce(sum(nominal), 0) into v_trx, v_total
  from public.keuangan_pembayaran
  where grade = p_grade and cutoff_id is null and tanggal between p_dari and p_sampai;
  if v_trx = 0 then
    raise exception 'Tidak ada transaksi terbuka dalam rentang ini';
  end if;
  v_kode := 'CUT-' || extract(year from p_sampai)::int || '-' ||
    lpad((select count(*) + 1 from public.keuangan_cutoff where grade = p_grade
          and extract(year from created_at) = extract(year from p_sampai))::text, 3, '0');
  insert into public.keuangan_cutoff (kode, grade, dari, sampai, trx, total, oleh)
  values (v_kode, p_grade, p_dari, p_sampai, v_trx, v_total, coalesce(p_oleh, ''))
  returning * into v_hasil;
  update public.keuangan_pembayaran set cutoff_id = v_hasil.id
  where grade = p_grade and cutoff_id is null and tanggal between p_dari and p_sampai;
  return v_hasil;
end $$;

alter table public.keuangan_paket enable row level security;
alter table public.keuangan_keterangan enable row level security;
alter table public.keuangan_siswa enable row level security;
alter table public.keuangan_pembayaran enable row level security;
alter table public.keuangan_cutoff enable row level security;
alter table public.keuangan_counter enable row level security;

do $$
declare t text;
begin
  foreach t in array array['keuangan_paket', 'keuangan_keterangan', 'keuangan_siswa', 'keuangan_pembayaran', 'keuangan_cutoff'] loop
    execute format('drop policy if exists %I on public.%I', t || '_baca', t);
    execute format('create policy %I on public.%I for select to authenticated using (true)', t || '_baca', t);
    execute format('drop policy if exists %I on public.%I', t || '_tulis', t);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', t || '_tulis', t);
  end loop;
end $$;
-- keuangan_counter hanya disentuh trigger (security invoker mengikuti pemilik
-- fungsi trigger di skema yang sama); tidak dibuka untuk klien.
drop policy if exists keuangan_counter_tulis on public.keuangan_counter;
create policy keuangan_counter_tulis on public.keuangan_counter for all to authenticated using (true) with check (true);

-- ===== Data awal =====
-- Keterangan pembayaran (tanpa Tabungan).
insert into public.keuangan_keterangan (nama, urutan) values
  ('SPP', 1), ('Buku 1 Tahun', 2), ('Kegiatan 1 Tahun', 3), ('Kegiatan Akhir Tahun', 4),
  ('OSIS 1 Tahun', 5), ('Praktik 1 Tahun', 6), ('Siswa Baru Tahap 1', 7), ('Siswa Baru Tahap 2', 8)
on conflict (nama) do nothing;

-- Paket SMK persis nominal aplikasi lama milik sekolah (screenshot pemilik).
-- Paket SMP TIDAK diisi dari karangan: dibuat manajemen lewat halaman
-- Kode Keuangan begitu nominal resmi SMP ditetapkan.
insert into public.keuangan_paket (kode, nama, grade, nominal_1, nominal_2, nominal_3, nominal_akhir, aktif) values
  ('khllBv', 'Keuangan Alumni 2526-1', 'SMK', 7680000, 6400000, 9500000, 0, true),
  ('R-2627', 'Siswa Reguler', 'SMK', 7625000, 5300000, 5300000, 0, true),
  ('SSK-2627', 'Siswa SSK', 'SMK', 2500000, 5300000, 5300000, 0, true),
  ('BB-2627', 'Siswa Beasiswa Berprestasi', 'SMK', 5975000, 4100000, 4100000, 0, true),
  ('BP-2627', 'Siswa Beasiswa Penuh', 'SMK', 2987500, 4100000, 4100000, 0, false),
  ('0b5Eef', 'Reguler - XII - Angkatan 10', 'SMK', 8180000, 6400000, 6400000, 2500000, true),
  ('TK-2627-1', 'Siswa Tinggal Kelas', 'SMK', 14650000, 0, 0, 0, true)
on conflict (kode) do nothing;

notify pgrst, 'reload schema';
