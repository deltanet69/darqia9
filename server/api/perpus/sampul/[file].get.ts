// GET /api/perpus/sampul/:file — foto sampul buku. Publik: tag <img> tidak bisa membawa token, dan sampul bukan isi buku.
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { jalurBerkas } from '../../../utils/perpus'

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file') || ''
  const path = /^[a-z0-9-]+\.(jpg|webp)$/.test(file) ? jalurBerkas(`sampul/${file}`) : null
  const info = path ? await stat(path).catch(() => null) : null
  if (!path || !info?.isFile()) throw createError({ statusCode: 404, statusMessage: 'Sampul tidak ditemukan.' })
  setHeader(event, 'Content-Type', file.endsWith('.webp') ? 'image/webp' : 'image/jpeg')
  setHeader(event, 'Content-Length', info.size)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return sendStream(event, createReadStream(path))
})
