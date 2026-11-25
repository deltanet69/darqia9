import { wajibStaf } from '../../../utils/wajibStaf'
import { statusSesiOpenwa } from '../../../utils/openwa'

// Status sesi WhatsApp sekolah untuk panel SPMB admin: apakah sudah
// terhubung, nomor berapa, dan kode QR untuk dipindai admin TU bila
// belum terhubung / terputus.
export default defineEventHandler(async (event) => {
  await wajibStaf(event)
  try {
    return await statusSesiOpenwa(event)
  } catch (e: any) {
    throw createError({ statusCode: 503, statusMessage: `Gateway WhatsApp tidak terjangkau: ${e?.message || 'tidak ada respons'}` })
  }
})
