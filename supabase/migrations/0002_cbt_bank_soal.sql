-- ==============================================================================
-- Migrasi 0002: Skema Bank Soal & Butir Pertanyaan CBT
-- Darqia 9 — Ekosistem Digital Yayasan Darqia Attaqwa
-- Sesuai kontrak: docs/Admin Portal/CBT/banksoalCRUD.md & docs/DATABASE.md
-- ==============================================================================

-- 1. Tabel question_banks (1 Baris = 1 Paket Mata Pelajaran Per Kelas)
create table if not exists public.question_banks (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  classroom text not null,
  subject text not null,
  grade text not null check (grade in ('SMP', 'SMK')),
  difficulty text not null check (difficulty in ('Mudah', 'Sedang', 'Sukar')),
  teacher_name text not null,
  has_interactive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabel questions (1 Baris = 1 Butir Soal Terkait Bank Soal)
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.question_banks(id) on delete cascade,
  number integer not null,
  type text not null check (type in ('PG', 'Isian', 'Esai', 'Interaktif')),
  text text not null,
  difficulty text not null check (difficulty in ('Mudah', 'Sedang', 'Sukar')),
  is_multi_select boolean not null default false,
  options jsonb,
  answer_key jsonb,
  rubric text,
  rubric_score integer default 20,
  image_url text,
  media_type text check (media_type in ('audio', 'video')),
  media_id text,
  media_url text,
  media_file_name text,
  interactive_answer_type text check (interactive_answer_type in ('PG', 'PG_Multi', 'Isian')),
  is_rtl boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index performa query per paket dan nomor soal
create index if not exists idx_questions_bank_id on public.questions(bank_id);
create index if not exists idx_questions_bank_number on public.questions(bank_id, number);
create index if not exists idx_question_banks_grade on public.question_banks(grade);
create index if not exists idx_question_banks_class_subject on public.question_banks(classroom, subject);

-- 3. Row Level Security (RLS)
alter table public.question_banks enable row level security;
alter table public.questions enable row level security;

-- Policy Baca (SELECT): Terbuka agar siswa yang sedang ujian CBT bisa mengambil paket soal
drop policy if exists "Public read question banks" on public.question_banks;
create policy "Public read question banks"
  on public.question_banks
  for select
  using (true);

drop policy if exists "Public read questions" on public.questions;
create policy "Public read questions"
  on public.questions
  for select
  using (true);

-- Policy Tulis (INSERT, UPDATE, DELETE): Staf/Admin & Dev
drop policy if exists "Allow insert question banks" on public.question_banks;
create policy "Allow insert question banks"
  on public.question_banks
  for insert
  with check (true);

drop policy if exists "Allow update question banks" on public.question_banks;
create policy "Allow update question banks"
  on public.question_banks
  for update
  using (true)
  with check (true);

drop policy if exists "Allow delete question banks" on public.question_banks;
create policy "Allow delete question banks"
  on public.question_banks
  for delete
  using (true);

drop policy if exists "Allow insert questions" on public.questions;
create policy "Allow insert questions"
  on public.questions
  for insert
  with check (true);

drop policy if exists "Allow update questions" on public.questions;
create policy "Allow update questions"
  on public.questions
  for update
  using (true)
  with check (true);

drop policy if exists "Allow delete questions" on public.questions;
create policy "Allow delete questions"
  on public.questions
  for delete
  using (true);

-- 4. Trigger auto-update timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_question_banks_updated_at on public.question_banks;
create trigger trigger_question_banks_updated_at
  before update on public.question_banks
  for each row execute procedure public.set_updated_at();

-- 5. Data Awal (Seed) Kurikulum SMK & SMP
-- Paket SMK Informatika
insert into public.question_banks (id, code, classroom, subject, grade, difficulty, teacher_name, has_interactive)
values (
  '11111111-1111-1111-1111-111111111111',
  'INF-XRPL1',
  'X RPL 1',
  'Informatika',
  'SMK',
  'Sedang',
  'Bpk. Budi Santoso, S.Kom',
  true
) on conflict (code) do nothing;

-- Butir Soal SMK Informatika
insert into public.questions (bank_id, number, type, text, difficulty, is_multi_select, options, answer_key, rubric, is_rtl)
values
(
  '11111111-1111-1111-1111-111111111111',
  1,
  'PG',
  'Perangkat keras komputer yang berfungsi sebagai unit pemrosesan pusat dan pengendali utama seluruh instruksi sistem adalah...',
  'Mudah',
  false,
  '[{"key": "A", "text": "RAM (Random Access Memory)"}, {"key": "B", "text": "CPU (Central Processing Unit)"}, {"key": "C", "text": "GPU (Graphics Processing Unit)"}, {"key": "D", "text": "Power Supply Unit"}, {"key": "E", "text": "Hard Disk Drive"}]'::jsonb,
  '"B"'::jsonb,
  null,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  2,
  'PG',
  'Topologi jaringan di mana setiap node terhubung ke satu perangkat konsentrator sentral seperti switch atau hub disebut...',
  'Sedang',
  false,
  '[{"key": "A", "text": "Topologi Bus"}, {"key": "B", "text": "Topologi Ring"}, {"key": "C", "text": "Topologi Star"}, {"key": "D", "text": "Topologi Mesh"}, {"key": "E", "text": "Topologi Tree"}]'::jsonb,
  '"C"'::jsonb,
  null,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  3,
  'PG',
  'Pilihlah protokol jaringan berikut yang berjalan pada Application Layer (OSI Layer 7)! (Pilih lebih dari satu jawaban yang benar)',
  'Sedang',
  true,
  '[{"key": "A", "text": "HTTP (Hypertext Transfer Protocol)"}, {"key": "B", "text": "TCP (Transmission Control Protocol)"}, {"key": "C", "text": "DNS (Domain Name System)"}, {"key": "D", "text": "IP (Internet Protocol)"}, {"key": "E", "text": "SMTP (Simple Mail Transfer Protocol)"}]'::jsonb,
  '["A", "C", "E"]'::jsonb,
  null,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  4,
  'Isian',
  'Sebutkan perintah terminal Linux untuk melihat alamat IP yang terkonfigurasi pada antarmuka jaringan!',
  'Sedang',
  false,
  null,
  '"ip a"'::jsonb,
  null,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  5,
  'Esai',
  'Jelaskan perbedaan mendasar antara pemrograman berorientasi objek (OOP) dengan pemrograman prosedural, sertakan contoh kasus penggunaannya!',
  'Sukar',
  false,
  null,
  '"OOP mengorganisasi kode dalam entitas objek dengan konsep enkapsulasi, pewarisan, dan polimorfisme."'::jsonb,
  'Menyebutkan konsep object, class, encapsulation, inheritance, serta perbandingan modular vs runtutan langkah prosedural.',
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  6,
  'Interaktif',
  'Dengarkan rekaman instruksi konfigurasi firewall berikut. Berdasarkan rekaman instruksi tersebut, port berapakah yang wajib dibuka untuk mengamankan protokol transfer data terenkripsi HTTPS?',
  'Sedang',
  false,
  null,
  '"Port 443"'::jsonb,
  null,
  false
);

-- Set media info untuk soal interaktif nomor 6
update public.questions
set media_type = 'audio',
    media_url = 'https://actions.google.com/sounds/v1/ambient/office_ambience.ogg',
    media_file_name = 'audio_firewall.mp3',
    interactive_answer_type = 'Isian'
where bank_id = '11111111-1111-1111-1111-111111111111' and number = 6;

-- Paket SMP PAI & Budi Pekerti
insert into public.question_banks (id, code, classroom, subject, grade, difficulty, teacher_name, has_interactive)
values (
  '22222222-2222-2222-2222-222222222222',
  'PAI-VIIA',
  'VII-A',
  'PAI',
  'SMP',
  'Mudah',
  'Ust. Hendra Gunawan, S.Pd.I',
  false
) on conflict (code) do nothing;

-- Butir Soal SMP PAI (Mendukung Teks Arab RTL)
insert into public.questions (bank_id, number, type, text, difficulty, is_multi_select, options, answer_key, rubric, is_rtl)
values
(
  '22222222-2222-2222-2222-222222222222',
  1,
  'PG',
  'Rukun Islam yang ketiga yang wajib ditunaikan bagi umat muslim yang telah memenuhi nisab harta adalah...',
  'Mudah',
  false,
  '[{"key": "A", "text": "Membaca Dua Kalimat Syahadat"}, {"key": "B", "text": "Menunaikan Shalat Lima Waktu"}, {"key": "C", "text": "Membayar Zakat"}, {"key": "D", "text": "Berpuasa di Bulan Ramadhan"}, {"key": "E", "text": "Menunaikan Ibadah Haji"}]'::jsonb,
  '"C"'::jsonb,
  null,
  false
),
(
  '22222222-2222-2222-2222-222222222222',
  2,
  'PG',
  'Perhatikan potongan firman Allah SWT berikut:
اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
Ayat di atas merupakan wahyu pertama yang diturunkan kepada Nabi Muhammad SAW dalam surat...',
  'Mudah',
  false,
  '[{"key": "A", "text": "QS. Al-Fatihah : 1"}, {"key": "B", "text": "QS. Al-\u0027Alaq : 1"}, {"key": "C", "text": "QS. Al-Baqarah : 255"}, {"key": "D", "text": "QS. Al-Ikhlas : 1"}]'::jsonb,
  '"B"'::jsonb,
  null,
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  3,
  'Isian',
  'Sebutkan nama malaikat yang bertugas menyampaikan wahyu kepada para nabi dan rasul!',
  'Mudah',
  false,
  null,
  '"Malaikat Jibril"'::jsonb,
  null,
  false
),
(
  '22222222-2222-2222-2222-222222222222',
  4,
  'Esai',
  'Jelaskan hikmah menuntut ilmu dalam pandangan Islam dan bagaimana penerapannya dalam kehidupan sehari-hari sebagai pelajar!',
  'Sedang',
  false,
  null,
  '"Menuntut ilmu mengangkat derajat seorang mukmin di sisi Allah SWT dan menjadi bekal amal jariyah."'::jsonb,
  'Menyebutkan dalil kewajiban menuntut ilmu, pengangkatan derajat, dan contoh ketekunan belajar di sekolah.',
  false
);
