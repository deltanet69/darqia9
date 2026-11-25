-- ============================================================
-- Migrasi 0093 — Antrean keluar WhatsApp (outbox) Darqia
--
-- Fase lanjutan notifikasi SPMB: aplikasi menulis notifikasi ke tabel
-- ini, worker khusus (scripts/wa-worker.mjs) yang mengirimnya lewat
-- OpenWA dengan jeda acak + jam aktif. Panel admin TIDAK bergantung
-- pada tabel ini (kirim manual/admin berjalan langsung lewat gateway
-- dengan Idempotency-Key), tabel ini untuk pengiriman otomatis dari
-- formulir publik dan pengiriman massal terjadwal.
--
-- dedupe_key unik: satu pendaftaran + satu status = satu pesan.
-- ============================================================

create table if not exists public.wa_outbox (
  id          bigint generated always as identity primary key,
  reg_id      text not null,
  jenjang     text not null,
  status      text not null,
  tujuan      text not null,               -- nomor WA wali format 628xxxx
  isi         text not null,
  dedupe_key  text not null unique,        -- reg_id || ':' || status
  keadaan     text not null default 'antre'
              check (keadaan in ('antre','terkirim','gagal','batal')),
  percobaan   int  not null default 0,
  galat       text,
  dibuat_at   timestamptz not null default now(),
  terkirim_at timestamptz
);

create index if not exists wa_outbox_antre_idx
  on public.wa_outbox (keadaan, dibuat_at);

-- Hanya service role (worker + server Nuxt) yang boleh menyentuh tabel ini.
alter table public.wa_outbox enable row level security;
