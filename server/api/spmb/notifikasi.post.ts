import { serverSupabaseServiceRole } from '#supabase/server'
import { nomorWa62, renderWaSpmb, type BarisSpmb } from '../../utils/spmbWaTemplate'
import { kirimEmailSpmb } from '../../utils/spmbEmail'

// Notifikasi pendaftaran baru dari formulir SPMB publik.
// Dipanggil formulir tepat setelah pendaftaran tersimpan di database:
//   1. WhatsApp  — dimasukkan ke antrean wa_outbox (migrasi 0093);
//      worker khusus yang mengirimnya lewat OpenWA dengan jeda anti-ban.
//   2. Email     — dikirim langsung via Brevo dari alamat resmi sekolah.
// Endpoint ini tidak pernah menggagalkan pendaftaran: semua hasil
// dilaporkan sebagai keadaan, bukan error. Agar tidak disalahgunakan,
// notifikasi hanya diproses untuk pendaftaran berusia <= 2 jam dan
// hanya ke alamat/nomor yang tersimpan pada pendaftaran itu sendiri.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ id?: string }>(event)
  const id = String(body?.id || '').trim()
  if (!id || id.length > 40) {
    throw createError({ statusCode: 400, statusMessage: 'ID pendaftaran wajib diisi.' })
  }

  const admin = await serverSupabaseServiceRole(event)
  const { data, error } = await admin.from('spmb_registrations').select('*').eq('id', id).single()
  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Data pendaftaran tidak ditemukan di database.' })
  }

  const r = data as BarisSpmb & { o_hp: string; o_email?: string | null; s_email?: string | null; created_at?: string }
  const dibuat = r.created_at ? new Date(r.created_at).getTime() : NaN
  if (!Number.isFinite(dibuat) || Date.now() - dibuat > 2 * 60 * 60 * 1000 || dibuat - Date.now() > 5 * 60 * 1000) {
    return { ok: false, keadaan: 'di_luar_jendela', wa: 'dilewati', email: 'dilewati' }
  }

  // 1) WhatsApp → antrean outbox (dedupe: satu pendaftaran + satu status).
  let wa = 'tanpa_nomor'
  const nomor = nomorWa62(r.o_hp)
  if (nomor) {
    const { error: errWa } = await admin.from('wa_outbox').insert({
      reg_id: r.id,
      jenjang: r.jenjang,
      status: r.status,
      tujuan: nomor,
      isi: renderWaSpmb(r),
      dedupe_key: `${r.id}:${r.status.replace(/\s+/g, '-')}`
    })
    if (!errWa) wa = 'antre'
    else if ((errWa as { code?: string }).code === '23505') wa = 'sudah_antre'
    else wa = 'belum_aktif' // tabel wa_outbox belum dibuat (migrasi 0093 belum dijalankan)
  }

  // 2) Email → Brevo, dari alamat resmi sekolah sesuai jenjang.
  const email = await kirimEmailSpmb(event, r)

  return { ok: true, wa, email: email.keadaan, ...(email.pesan ? { emailPesan: email.pesan } : {}) }
})
