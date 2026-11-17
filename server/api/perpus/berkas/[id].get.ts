// GET /api/perpus/berkas/:id — PDF buku untuk reader (mendukung Range agar pdf.js memuat per halaman).
// Dicek tiap permintaan: sesi siswa aktif, buku sesuai jenjang/kelas, jadwal manga/komik, berkas ada.
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { akhirPekanWib, formatBerkas, terbukaUntuk } from '../../../../app/composables/perpusCore'
import { barisKatalog, jalurBerkas, wajibSiswa } from '../../../utils/perpus'
import { pdfContoh } from '../../../utils/perpusContoh'

export default defineEventHandler(async (event) => {
  const { db, siswa } = await wajibSiswa(event)
  const b = (await barisKatalog(db)).find(x => x.id === getRouterParam(event, 'id'))
  if (!b || !terbukaUntuk(b, siswa)) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })
  if (b.akhir_pekan && !akhirPekanWib()) throw createError({ statusCode: 403, statusMessage: 'Buku ini hanya dapat dibuka Sabtu dan Minggu.' })
  const path = jalurBerkas(b.path_pdf)
  const info = path ? await stat(path).catch(() => null) : null
  // dev lokal: berkas asli tidak ada di laptop -> PDF contoh
  const contoh = !info?.isFile() && import.meta.dev ? pdfContoh(b) : null
  if (!contoh && (!path || !info?.isFile())) throw createError({ statusCode: 404, statusMessage: 'Berkas buku belum tersedia.' })

  const size = contoh ? contoh.length : info!.size
  const epub = formatBerkas(b.path_pdf) === 'epub'
  setHeader(event, 'Content-Type', epub ? 'application/epub+zip' : 'application/pdf')
  setHeader(event, 'Content-Disposition', epub ? 'attachment' : 'inline')
  setHeader(event, 'Accept-Ranges', 'bytes')
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  const m = /^bytes=(\d*)-(\d*)$/.exec(getHeader(event, 'range') || '')
  let start = 0
  let end = size - 1
  if (m && (m[1] || m[2])) {
    if (m[1]) {
      start = +m[1]
      end = m[2] ? Math.min(+m[2], size - 1) : size - 1
    } else {
      start = Math.max(0, size - +m[2]!)
    }
    if (start > end || start >= size) {
      setHeader(event, 'Content-Range', `bytes */${size}`)
      throw createError({ statusCode: 416, statusMessage: 'Rentang tidak valid.' })
    }
    setResponseStatus(event, 206)
    setHeader(event, 'Content-Range', `bytes ${start}-${end}/${size}`)
  }
  setHeader(event, 'Content-Length', end - start + 1)
  return contoh ? contoh.subarray(start, end + 1) : sendStream(event, createReadStream(path!, { start, end }))
})
