import { serverSupabaseServiceRole } from '#supabase/server'
import { wajibStaf } from '../../../utils/wajibStaf'
import { kirimWaOpenwa } from '../../../utils/openwa'
import { nomorWa62, renderWaSpmb, type BarisSpmb } from '../../../utils/spmbWaTemplate'

// Kirim notifikasi WhatsApp status pendaftaran ke nomor WA wali.
// Dipanggil panel admin: otomatis setiap admin mengubah status, dan
// manual lewat tombol "Kirim Notifikasi WA" (kirim ulang status terakhir).
// Pengiriman melewati governor anti-ban OpenWA; penolakan governor
// dilaporkan apa adanya ke admin, tidak pernah dipaksa.
export default defineEventHandler(async (event) => {
  await wajibStaf(event)
  const body = await readBody<{ id?: string }>(event)
  const id = String(body?.id || '').trim()
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID pendaftaran wajib diisi.' })

  const admin = await serverSupabaseServiceRole(event)
  const { data, error } = await admin.from('spmb_registrations').select('*').eq('id', id).single()
  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Data pendaftaran tidak ditemukan di database.' })

  const r = data as BarisSpmb & { o_hp: string }
  const nomor = nomorWa62(r.o_hp)
  if (!nomor) {
    return { ok: false, keadaan: 'nomor_tidak_valid', pesan: `Nomor WA wali (${r.o_hp || 'kosong'}) tidak valid.` }
  }
  const hasil = await kirimWaOpenwa(event, nomor, renderWaSpmb(r), `${r.id}:${r.status}`)
  return { ...hasil, tujuan: nomor }
})
