// Sesi Portal Orang Tua: cookie httpOnly berisi token acak; database hanya menyimpan sha256-nya (parent_sessions).
// Semua data dibaca lewat service role di server, dan siswa SELALU diambil dari sesi, tidak pernah dari body/query.
import { serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'
import { createHash, randomBytes } from 'node:crypto'
import { jenjangHost } from '../../app/composables/domainCore'
import { catatLogServer } from './catatLogServer'

export const COOKIE_ORTU = 'ortu_sesi'
const UMUR_DETIK = 12 * 3600

export const klienOrtu = (event: H3Event): any => {
  try { return serverSupabaseServiceRole(event) } catch {
    throw createError({ statusCode: 500, statusMessage: 'Secret key Supabase belum dikonfigurasi di server.' })
  }
}

// Jenjang pemilik domain parent.<sekolah>; null di localhost/staging (jenjang lalu diambil dari body login).
export const jenjangDomainOrtu = (event: H3Event): 'SMP' | 'SMK' | null => {
  const j = jenjangHost(getRequestHost(event, { xForwardedHost: true }).split(':')[0] || '')
  return j ? (j.toUpperCase() as 'SMP' | 'SMK') : null
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export async function buatSesiOrtu(event: H3Event, db: any, studentId: string) {
  const token = randomBytes(32).toString('base64url')
  const { error } = await db.from('parent_sessions').insert({
    token_hash: hashToken(token), student_id: studentId, expires_at: new Date(Date.now() + UMUR_DETIK * 1000).toISOString()
  })
  if (error) throw createError({ statusCode: 500, statusMessage: 'Sesi gagal dibuat. Coba lagi sebentar lagi.' })
  // Bersihkan sesi kedaluwarsa sesekali, tanpa menunggu hasilnya.
  if (Math.random() < 0.05) db.from('parent_sessions').delete().lt('expires_at', new Date().toISOString()).then(() => {}, () => {})
  setCookie(event, COOKIE_ORTU, token, { httpOnly: true, secure: !import.meta.dev, sameSite: 'lax', path: '/', maxAge: UMUR_DETIK })
}

export async function hapusSesiOrtu(event: H3Event) {
  const token = getCookie(event, COOKIE_ORTU)
  deleteCookie(event, COOKIE_ORTU, { path: '/' })
  if (token) await klienOrtu(event).from('parent_sessions').delete().eq('token_hash', hashToken(token))
}

export interface SesiOrtu {
  studentId: string
  nis: string
  nama: string
  grade: 'SMP' | 'SMK'
  tokenHash: string
  wajibGanti: boolean
}

// Penjaga semua endpoint /api/ortu/* (kecuali login/logout). 401 tanpa sesi; 403 GANTI_PASSWORD selama kata sandi awal belum diganti.
export async function wajibSesiOrtu(event: H3Event, opsi: { bolehWajibGanti?: boolean } = {}): Promise<{ db: any, sesi: SesiOrtu }> {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const token = getCookie(event, COOKIE_ORTU)
  const tolak = () => createError({ statusCode: 401, statusMessage: 'Sesi berakhir. Silakan masuk lagi.' })
  if (!token || token.length > 100) throw tolak()
  const db = klienOrtu(event)
  const tokenHash = hashToken(token)
  const { data: s } = await db.from('parent_sessions').select('student_id, expires_at').eq('token_hash', tokenHash).maybeSingle()
  if (!s || new Date(s.expires_at).getTime() <= Date.now()) {
    deleteCookie(event, COOKIE_ORTU, { path: '/' })
    throw tolak()
  }
  const [{ data: akun }, { data: siswa }] = await Promise.all([
    db.from('parent_accounts').select('must_change_password').eq('student_id', s.student_id).maybeSingle(),
    db.from('students').select('id, nis, name, grade, active').eq('id', s.student_id).maybeSingle()
  ])
  const domain = jenjangDomainOrtu(event)
  if (!akun || !siswa?.active || (domain && domain !== siswa.grade)) {
    await db.from('parent_sessions').delete().eq('token_hash', tokenHash)
    deleteCookie(event, COOKIE_ORTU, { path: '/' })
    throw tolak()
  }
  const sesi: SesiOrtu = { studentId: siswa.id, nis: siswa.nis || '', nama: siswa.name, grade: siswa.grade, tokenHash, wajibGanti: !!akun.must_change_password }
  if (sesi.wajibGanti && !opsi.bolehWajibGanti) {
    throw createError({ statusCode: 403, statusMessage: 'Ganti kata sandi awal terlebih dahulu.', data: { kode: 'GANTI_PASSWORD' } })
  }
  return { db, sesi }
}

// Log aktivitas orang tua. Jangan pernah memasukkan token, kata sandi, atau NIK ke `detail`.
export const catatLogOrtu = (db: any, sesi: Pick<SesiOrtu, 'nis' | 'nama' | 'grade'>, aksi: string, detail = '') =>
  catatLogServer(db, { id: null, nama: `Orang tua ${sesi.nama} (NIS ${sesi.nis}, ${sesi.grade})` }, 'Portal Orang Tua', aksi, detail)
