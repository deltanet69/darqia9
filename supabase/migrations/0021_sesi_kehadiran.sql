-- Migrasi 0021 — Kehadiran siswa per sesi mengajar
-- Sheet Mulai Mengajar di halaman Jadwal Mengajar mencatat ringkasan
-- kehadiran kelas saat sesi dimulai: jumlah hadir + daftar NIS siswa
-- alpa. Disimpan di baris teaching_sessions yang sama agar Rekap
-- Mengajar dan penanda Jadwal Pelajaran membaca satu sumber data.
alter table public.teaching_sessions add column if not exists hadir int;
alter table public.teaching_sessions add column if not exists alpa jsonb not null default '[]'::jsonb;
