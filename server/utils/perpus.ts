// Penunjang API Perpustakaan Digital. Semua akses data lewat service role di sini; halaman publik tidak pernah
// membaca tabel students atau perpus_* langsung. Identitas = JWT Supabase Auth (Google) -> perpus_akun -> students.
import { serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { jenjangHost } from '../../app/composables/domainCore'
import { bukuDariBaris, terbukaUntuk, tingkatDariKelas, tingkatDariLabel, type Buku, type SesiPerpus } from '../../app/composables/perpusCore'

export const klienPerpus = (event: H3Event): any => {
  try { return serverSupabaseServiceRole(event) } catch {
    throw createError({ statusCode: 500, statusMessage: 'Secret key Supabase belum dikonfigurasi di server.' })
  }
}

export const jenjangDomain = (event: H3Event): 'SMP' | 'SMK' | null => {
  const host = getRequestHost(event, { xForwardedHost: true }).split(':')[0] || ''
  const j = jenjangHost(host)
  return j ? (j.toUpperCase() as 'SMP' | 'SMK') : null
}

export const ambilToken = (event: H3Event): string => {
  const h = getHeader(event, 'authorization') || ''
  const t = h.startsWith('Bearer ') ? h.slice(7).trim() : ''
  if (!t) throw createError({ statusCode: 401, statusMessage: 'Silakan masuk terlebih dahulu.' })
  return t
}

// Cache singkat per token: satu buku PDF memicu puluhan permintaan rentang; tanpa cache tiap permintaan
// memanggil Supabase Auth + database. Status aktif siswa tetap dicek ulang tiap menit.
const cache = new Map<string, { exp: number, v: Pengguna }>()
export interface Pengguna { userId: string, email: string, siswa: (SesiPerpus & { id: string }) | null }

export const siswaAktif = (s: any): boolean => !!s && s.active === true && (!s.student_status || s.student_status === 'Aktif')

export async function penggunaPerpus(event: H3Event): Promise<Pengguna> {
  const token = ambilToken(event)
  const c = cache.get(token)
  if (c && c.exp > Date.now()) return c.v
  const db = klienPerpus(event)
  const { data: au, error } = await db.auth.getUser(token)
  if (error || !au?.user) throw createError({ statusCode: 401, statusMessage: 'Sesi berakhir. Silakan masuk lagi.' })
  const user = au.user
  const v: Pengguna = { userId: user.id, email: user.email || '', siswa: null }
  const { data: akun } = await db.from('perpus_akun').select('student_id').eq('user_id', user.id).maybeSingle()
  if (akun) {
    const { data: s } = await db.from('students').select('id, nis, nisn, name, grade, class_id, active, student_status').eq('id', akun.student_id).maybeSingle()
    const domain = jenjangDomain(event)
    if (!siswaAktif(s) || (domain && domain !== s.grade)) {
      throw createError({ statusCode: 403, statusMessage: 'Akun ini tidak dapat masuk ke perpustakaan.' })
    }
    let kelas = ''
    if (s.class_id) kelas = (await db.from('classes').select('name').eq('id', s.class_id).maybeSingle()).data?.name || ''
    v.siswa = { id: s.id, nama: s.name, nis: s.nis || '', nisn: s.nisn || '', jenjang: s.grade, kelas, tingkat: tingkatDariKelas(kelas, s.grade), email: v.email }
  }
  if (cache.size > 2000) cache.clear()
  cache.set(token, { exp: Date.now() + 60_000, v })
  return v
}

export const wajibSiswa = async (event: H3Event) => {
  const p = await penggunaPerpus(event)
  if (!p.siswa) throw createError({ statusCode: 403, statusMessage: 'Verifikasi NIS/NISN dulu.' })
  return { db: klienPerpus(event), siswa: p.siswa }
}

export const lupakanToken = (event: H3Event) => cache.delete(ambilToken(event))

// ---------- katalog ----------
let katalog: { exp: number, baris: any[] } | null = null
export const resetKatalog = () => { katalog = null; adaPdf.clear() }
export async function barisKatalog(db: any): Promise<any[]> {
  if (katalog && katalog.exp > Date.now()) return katalog.baris
  const { data, error } = await db.from('perpus_buku').select('*').eq('aktif', true).order('urutan')
  if (error) throw createError({ statusCode: 502, statusMessage: 'Katalog gagal dimuat.' })
  // tingkat dihitung ulang dari label supaya perbaikan pemetaan kelas berlaku tanpa impor ulang
  katalog = { exp: Date.now() + 60_000, baris: (data || []).map((r: any) => ({ ...r, tingkat_kelas: tingkatDariLabel(r.kelas_label || '') })) }
  return katalog.baris
}

const dirPerpus = () => resolve(useRuntimeConfig().perpusDir as string)
export const jalurBerkas = (rel: string): string | null => {
  if (!rel) return null
  const dasar = dirPerpus()
  const p = resolve(dasar, rel)
  if (p.startsWith(dasar + sep)) return p
  if (import.meta.dev) {
    const lokal = resolve('perpus', rel)
    return lokal
  }
  return null
}
const adaPdf = new Map<string, { exp: number, ada: boolean }>()
export async function pdfAda(rel: string): Promise<boolean> {
  const c = adaPdf.get(rel)
  if (c && c.exp > Date.now()) return c.ada
  const p = jalurBerkas(rel)
  // shortcut: saat dev lokal berkas yang tidak ada diganti PDF contoh (lihat perpusContoh.ts); di produksi selalu cek berkas asli
  const ada = import.meta.dev || (!!p && await stat(p).then(s => s.isFile(), () => false))
  adaPdf.set(rel, { exp: Date.now() + 30_000, ada })
  return ada
}

export async function tulisBerkas(rel: string, isi: Buffer) {
  const p = jalurBerkas(rel)
  if (!p) throw createError({ statusCode: 400, statusMessage: 'Jalur berkas tidak valid.' })
  await mkdir(dirname(p), { recursive: true })
  await writeFile(p, isi)
}
export const hapusBerkas = async (rel: string) => { const p = jalurBerkas(rel); if (p) await unlink(p).catch(() => {}) }

// Badan mentah (JPEG/PDF/EPUB) dengan batas ukuran + cek isi berkas lewat `sah`, bukan percaya Content-Type.
export async function bacaBerkasUnggahan(event: H3Event, maks: number, sah: (b: Buffer) => boolean, nama: string): Promise<Buffer> {
  const isi = await readRawBody(event, false)
  if (!isi?.length || !sah(isi)) throw createError({ statusCode: 400, statusMessage: `Berkas bukan ${nama} yang valid.` })
  if (isi.length > maks) throw createError({ statusCode: 413, statusMessage: `Ukuran ${nama} maksimal ${maks >= 1048576 ? Math.round(maks / 1048576) + ' MB' : Math.round(maks / 1024) + ' KB'}.` })
  return isi
}

export async function bukuSiswa(db: any, s: { jenjang: string, tingkat: number }): Promise<Buku[]> {
  const baris = (await barisKatalog(db)).filter(r => terbukaUntuk(r, s))
  const ada = await Promise.all(baris.map(r => pdfAda(r.path_pdf)))
  const sekarang = new Date()
  return baris.map((r, i) => bukuDariBaris(r, ada[i]!, sekarang))
}
