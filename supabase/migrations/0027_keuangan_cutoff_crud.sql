-- 0027_keuangan_cutoff_crud.sql — CRUD Cut-off Harian (lanjutan 0026)
-- Jalankan manual di Supabase SQL Editor SETELAH 0026_keuangan.sql.
--
-- Kebutuhan: catatan cut-off adalah bukti perpindahan dana sekolah ->
-- keuangan pusat (yayasan), jadi harus bisa diperbarui & dihapus secara
-- resmi dari halaman — bukan lewat SQL manual.
--   - UBAH (penanggung jawab + status bukti): cukup UPDATE biasa lewat RLS
--     0026, tidak perlu SQL di sini.
--   - HAPUS: harus membuka kunci seluruh transaksi di dalamnya dulu
--     (keuangan_pembayaran.cutoff_id -> null), padahal trigger kunci 0026
--     menolak semua ubah/hapus pada transaksi terkunci. Fungsi RPC di bawah
--     adalah SATU-SATUNYA jalan resmi: ia menyalakan penanda transaksi-lokal
--     yang dikenali trigger penjaga, membuka kunci, lalu menghapus catatan
--     cut-off-nya — atomik dalam satu transaksi.

-- Penjaga kunci versi sadar konteks: penanda app.buka_kunci_cutoff hanya
-- boleh dinyalakan oleh fungsi keuangan_hapus_cutoff di bawah (set_config
-- lokal transaksi; klien tidak bisa menyalakannya lewat PostgREST biasa
-- karena pengaturan itu tidak diteruskan dari header/query API).
create or replace function public.keuangan_jaga_terkunci()
returns trigger language plpgsql as $$
begin
  if current_setting('app.buka_kunci_cutoff', true) = 'ya' then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  if old.cutoff_id is not null then
    raise exception 'Transaksi % sudah masuk cut-off dan terkunci', old.no_kwitansi;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

-- Hapus satu cut-off + buka kunci seluruh transaksinya (atomik).
create or replace function public.keuangan_hapus_cutoff(p_id uuid)
returns public.keuangan_cutoff language plpgsql as $$
declare v public.keuangan_cutoff;
begin
  select * into v from public.keuangan_cutoff where id = p_id;
  if not found then
    raise exception 'Cut-off tidak ditemukan';
  end if;
  perform set_config('app.buka_kunci_cutoff', 'ya', true);
  update public.keuangan_pembayaran set cutoff_id = null where cutoff_id = p_id;
  delete from public.keuangan_cutoff where id = p_id;
  return v;
end $$;

notify pgrst, 'reload schema';
