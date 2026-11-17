import { hapusSesiOrtu } from '../../utils/ortuSesi'

// POST /api/ortu/logout — hapus baris sesi di database dan cookie-nya.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  await hapusSesiOrtu(event)
  return { ok: true }
})
