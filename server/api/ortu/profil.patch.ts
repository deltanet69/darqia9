import { catatLogOrtu, wajibSesiOrtu } from '../../utils/ortuSesi'
import { kontakDari, pihakKontak, validasiProfilOrtu } from '../../../app/composables/ortuCore'
import type { KontakOrtu } from '../../../app/types/ortu'

const LABEL = { wa: 'No. WhatsApp', email: 'email', alamat: 'alamat' } as const

// PATCH /api/ortu/profil — hanya { wa, email, alamat }; field lain ditolak 400. Langsung tersimpan + tercatat di log.
export default defineEventHandler(async (event): Promise<KontakOrtu> => {
  const { db, sesi } = await wajibSesiOrtu(event)
  const hasil = validasiProfilOrtu(await readBody(event).catch(() => null))
  if ('galat' in hasil) throw createError({ statusCode: 400, statusMessage: hasil.galat })
  const kolom = 'father_name, father_phone, mother_phone, father_email, mother_email, address'
  const { data: s } = await db.from('students').select(kolom).eq('id', sesi.studentId).maybeSingle()
  if (!s) throw createError({ statusCode: 404, statusMessage: 'Data siswa tidak ditemukan.' })
  const p = pihakKontak(s)
  const v = hasil.nilai
  const payload: Record<string, string | null> = {}
  if ('wa' in v) payload[`${p}_phone`] = v.wa!
  if ('email' in v) payload[`${p}_email`] = v.email ?? null
  if ('alamat' in v) payload.address = v.alamat ?? null
  const { data: baru, error } = await db.from('students').update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', sesi.studentId).select(kolom).single()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Perubahan gagal disimpan. Coba lagi.' })
  await catatLogOrtu(db, sesi, 'ubah kontak', `Mengubah ${Object.keys(v).map(k => LABEL[k as keyof typeof LABEL]).join(', ')}`)
  return kontakDari(baru)
})
