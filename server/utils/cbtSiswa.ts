// Jalur server untuk aplikasi CBT siswa. Semua fungsi database cbt_siswa_* hanya bisa dipanggil lewat
// service role di sini (bukan dari peramban), sehingga pembatas percobaan salah tidak bisa dilewati.
import { serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'
import { createHash } from 'node:crypto'
import { buatPembatas } from './pembatas'

const PESAN_KREDENSIAL = 'NIS atau token tidak cocok.'
// Per NIS ketat; per IP longgar karena seluruh siswa memakai jaringan sekolah yang sama (satu IP).
const batasNis = buatPembatas(8, 5 * 60_000)
const batasIp = buatPembatas(300, 5 * 60_000)

export interface BodySiswa {
  nis: string
  token: string
  grade: 'SMP' | 'SMK'
  source?: 'cbt' | 'ujian_harian'
  examId?: string
  jawaban?: unknown[]
  jenis?: string
  kode?: string
  tanpaSoal?: boolean
  versi?: string
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function bacaBodySiswa(event: H3Event, perluUjian = false): Promise<BodySiswa> {
  const b = await readBody(event).catch(() => null) as Record<string, any> | null
  const nis = typeof b?.nis === 'string' ? b.nis.trim() : ''
  const token = typeof b?.token === 'string' ? b.token.trim().toUpperCase() : ''
  const salah = (pesan: string) => createError({ statusCode: 400, statusMessage: pesan })
  if (!nis || nis.length > 30 || !/^[0-9A-Za-z-]+$/.test(nis) || !token || token.length > 40 || !/^[0-9A-Z-]+$/.test(token)
    || !['SMP', 'SMK'].includes(b?.grade)) throw salah('Isi NIS, token, dan jenjang dengan benar.')
  const hasil: BodySiswa = { nis, token, grade: b!.grade }
  if (perluUjian) {
    if (!['cbt', 'ujian_harian'].includes(b?.source) || typeof b?.examId !== 'string' || !UUID.test(b.examId)) throw salah('Data ujian tidak valid.')
    hasil.source = b!.source
    hasil.examId = b!.examId
  }
  if (b?.jawaban !== undefined) {
    if (!Array.isArray(b.jawaban) || b.jawaban.length > 300) throw salah('Data jawaban tidak valid.')
    hasil.jawaban = b.jawaban
  }
  if (typeof b?.jenis === 'string') hasil.jenis = b.jenis.slice(0, 20)
  if (typeof b?.kode === 'string') hasil.kode = b.kode.trim().slice(0, 12)
  if (b?.tanpaSoal === true) hasil.tanpaSoal = true
  if (typeof b?.versi === 'string') hasil.versi = b.versi.slice(0, 32)
  return hasil
}

// Satu klien dipakai ulang untuk semua permintaan (tanpa sesi per pengguna), supaya tidak membuat objek klien
// baru setiap kali dan koneksi HTTP ke Supabase tetap dipakai bersama.
let klienBersama: ReturnType<typeof serverSupabaseServiceRole> | null = null
const klienService = (event: H3Event) => {
  if (klienBersama) return klienBersama
  try { klienBersama = serverSupabaseServiceRole(event) } catch {
    throw createError({ statusCode: 500, statusMessage: 'Secret key Supabase belum dikonfigurasi di server.' })
  }
  return klienBersama
}

// Tebakan kode buka kunci yang salah ikut dihitung pembatas, agar kode 6 karakter tidak bisa ditebak berulang.
export function catatTebakanSalah(event: H3Event, nis: string) {
  batasNis.catat(nis)
  batasIp.catat(getRequestIP(event, { xForwardedFor: true }) || 'tak-dikenal')
}

export async function rpcSiswa(event: H3Event, fungsi: string, args: Record<string, unknown>, b: BodySiswa) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'tak-dikenal'
  if (batasNis.terblokir(b.nis) || batasIp.terblokir(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak percobaan masuk yang salah. Coba lagi dalam beberapa menit.' })
  }
  const { data, error } = await klienService(event).rpc(fungsi, args)
  if (error) {
    if (error.message === PESAN_KREDENSIAL) {
      batasNis.catat(b.nis)
      batasIp.catat(ip)
      throw createError({ statusCode: 401, statusMessage: PESAN_KREDENSIAL })
    }
    // Pesan dari fungsi database (raise exception) ditulis untuk siswa dan aman diteruskan.
    if (error.code === 'P0001') throw createError({ statusCode: 403, statusMessage: error.message })
    if (error.code === 'PGRST202' || error.code === '42883') {
      throw createError({ statusCode: 503, statusMessage: 'Aplikasi ujian belum siap. Hubungi pengelola untuk menerapkan migrasi 0047.' })
    }
    console.error('[cbt]', fungsi, error.code, error.message)
    throw createError({ statusCode: 500, statusMessage: 'Terjadi gangguan di server. Coba lagi sebentar lagi.' })
  }
  if (fungsi === 'cbt_siswa_login') batasNis.hapus(b.nis)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return data
}

export const argumenSiswa = (b: BodySiswa) => ({ p_nis: b.nis, p_token: b.token, p_grade: b.grade })
export const argumenUjian = (b: BodySiswa) => ({ ...argumenSiswa(b), p_source: b.source, p_exam_id: b.examId })

// Soal satu ujian sama untuk semua peserta: simpan 2 menit di memori (dan satukan permintaan serentak)
// agar ribuan siswa yang membuka ujian bersamaan hanya membebani database satu kali.
const TTL_SOAL = 120_000
const soalCache = new Map<string, { at: number, data?: unknown, janji?: Promise<unknown> }>()

// Jenis soal yang diacak per ujian (PG / Singkat / Esai). Interaktif tidak pernah diacak.
// Kolom belum ada (migrasi 0060 belum dijalankan) = PG & Singkat diacak, Esai mengikuti acak_esai (0050).
export interface AcakSoal { pg: boolean, singkat: boolean, esai: boolean }
const acakCache = new Map<string, { at: number, nilai: AcakSoal }>()
export async function acakSoal(event: H3Event, source: string, examId: string): Promise<AcakSoal> {
  const kunci = `${source}:${examId}`
  const ada = acakCache.get(kunci)
  if (ada && Date.now() - ada.at < TTL_SOAL) return ada.nilai
  const tabel = klienService(event).from(source === 'cbt' ? 'exams' : 'ujian_harian')
  let { data, error } = await tabel.select('acak_pg, acak_singkat, acak_esai').eq('id', examId).maybeSingle() as { data: any, error: any }
  if (error) ({ data, error } = await klienService(event).from(source === 'cbt' ? 'exams' : 'ujian_harian').select('acak_esai').eq('id', examId).maybeSingle() as { data: any, error: any })
  const nilai: AcakSoal = { pg: data?.acak_pg !== false, singkat: data?.acak_singkat !== false, esai: error ? true : data?.acak_esai !== false }
  acakCache.set(kunci, { at: Date.now(), nilai })
  if (acakCache.size > 60) acakCache.delete(acakCache.keys().next().value as string)
  return nilai
}

// Sidik isi soal: perangkat yang menyimpan soal versi lama (guru mengubah soal setelah siswa membuka ujian) mendapat soal baru.
const versiCache = new WeakMap<object, string>()
export const versiSoal = (soal: unknown[]): string => {
  let v = versiCache.get(soal)
  if (!v) { v = createHash('sha1').update(JSON.stringify(soal)).digest('hex').slice(0, 16); versiCache.set(soal, v) }
  return v
}

export async function soalUjian(event: H3Event, source: string, examId: string): Promise<unknown[]> {
  const kunci = `${source}:${examId}`
  const ada = soalCache.get(kunci)
  if (ada?.data && Date.now() - ada.at < TTL_SOAL) return ada.data as unknown[]
  if (ada?.janji) return await ada.janji as unknown[]
  const janji = (async () => {
    const { data, error } = await klienService(event).rpc('cbt_soal_ujian', { p_source: source, p_exam_id: examId })
    if (error) throw createError({ statusCode: 500, statusMessage: 'Soal ujian gagal dimuat. Coba lagi sebentar lagi.' })
    return data
  })()
  soalCache.set(kunci, { at: Date.now(), janji })
  try {
    const data = await janji
    soalCache.set(kunci, { at: Date.now(), data })
    if (soalCache.size > 60) soalCache.delete(soalCache.keys().next().value as string)
    return data as unknown[]
  } catch (e) {
    soalCache.delete(kunci)
    throw e
  }
}
