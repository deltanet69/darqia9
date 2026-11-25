import { serverSupabaseServiceRole } from '#supabase/server'
import { wajibStaf } from '../../../utils/wajibStaf'

// Penampil bukti pembayaran SPMB untuk panitia.
// Bucket 'spmb-bukti' bersifat privat, jadi berkas tidak bisa ditautkan
// langsung. Endpoint ini (khusus staf yang login) membuat URL bertanda
// tangan berumur 1 jam lalu mengalihkan browser ke sana.
export default defineEventHandler(async (event) => {
  await wajibStaf(event)
  const path = String(getQuery(event).path || '').trim()
  if (!path || path.includes('..') || path.startsWith('/') || path.length > 300) {
    throw createError({ statusCode: 400, statusMessage: 'Path bukti tidak valid.' })
  }
  const admin = await serverSupabaseServiceRole(event)
  const unduh = String(getQuery(event).unduh || '') === '1'
  const { data, error } = await admin.storage.from('spmb-bukti').createSignedUrl(path, 3600, unduh ? { download: true } : undefined)
  if (error || !data?.signedUrl) {
    throw createError({ statusCode: 404, statusMessage: 'Berkas bukti tidak ditemukan di penyimpanan.' })
  }
  return sendRedirect(event, data.signedUrl, 302)
})
