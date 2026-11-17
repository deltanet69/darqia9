// POST /api/admin/ortu-akses { studentIds?: uuid[], classId?: uuid, reset?: boolean }
// Buat akses Portal Orang Tua (kata sandi acak) untuk siswa terpilih atau satu kelas. Tanpa reset, siswa yang sudah
// punya akses dilewati; dengan reset, kata sandinya diganti acak baru, sesi lama dihapus, dan orang tua wajib
// mengganti kata sandi lagi. Kata sandi hanya dikembalikan sekali di respons ini (database menyimpan hash-nya saja).
import { gerbangAdminUsers } from '../../utils/adminUsersGate'
import { catatLogServer } from '../../utils/catatLogServer'
import { hashSandiOrtu, sandiAcakOrtu } from '../../utils/ortuSandi'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAKS = 1000

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { supabase: db, caller, uid, email } = await gerbangAdminUsers(event, 'ubah', 'Data Siswa')
  const b = await readBody(event).catch(() => null) as Record<string, unknown> | null
  const ids = Array.isArray(b?.studentIds) ? b.studentIds : null
  const classId = typeof b?.classId === 'string' ? b.classId : null
  const reset = b?.reset === true
  if ((!ids && !classId) || (ids && (!ids.length || ids.length > MAKS || !ids.every(x => typeof x === 'string' && UUID.test(x)))) || (classId && !UUID.test(classId))) {
    throw createError({ statusCode: 400, statusMessage: 'Pilih siswa (maks. 1.000) atau satu kelas.' })
  }

  let q = db.from('students').select('id, name, nis, nisn, grade, class_id').eq('active', true).order('name').limit(MAKS)
  q = ids ? q.in('id', ids as string[]) : q.eq('class_id', classId!)
  const { data: siswa, error } = await q
  if (error) throw createError({ statusCode: 502, statusMessage: 'Data siswa gagal dibaca.' })
  if (!siswa?.length) throw createError({ statusCode: 404, statusMessage: 'Tidak ada siswa aktif yang dipilih.' })

  const semuaId = siswa.map((s: any) => s.id)
  const sudah = new Set<string>()
  for (let i = 0; i < semuaId.length; i += 500) {
    const { data, error: e } = await db.from('parent_accounts').select('student_id').in('student_id', semuaId.slice(i, i + 500))
    if (e) throw createError({ statusCode: 503, statusMessage: 'Portal orang tua belum siap. Terapkan migrasi 0080.' })
    for (const a of data || []) sudah.add(a.student_id)
  }
  const kelasId = [...new Set(siswa.map((s: any) => s.class_id).filter(Boolean))]
  const { data: kelas } = kelasId.length ? await db.from('classes').select('id, name').in('id', kelasId) : { data: [] }
  const namaKelas = new Map<string, string>((kelas || []).map((k: any) => [k.id, k.name]))

  const target = siswa.filter((s: any) => reset || !sudah.has(s.id))
  const akun: Array<{ id: string, nama: string, nis: string, nisn: string, kelas: string, jenjang: string, sandi: string }> = []
  // scrypt berjalan di thread pool Node: hash 20 sekaligus per gelombang.
  for (let i = 0; i < target.length; i += 20) {
    const gelombang = target.slice(i, i + 20)
    const hasil = await Promise.all(gelombang.map(async (s: any) => {
      const sandi = sandiAcakOrtu()
      return { s, sandi, baris: { student_id: s.id, password_hash: await hashSandiOrtu(sandi), must_change_password: true, failed_count: 0, locked_until: null, updated_at: new Date().toISOString() } }
    }))
    const { error: e } = await db.from('parent_accounts').upsert(hasil.map(h => h.baris), { onConflict: 'student_id' })
    if (e) throw createError({ statusCode: 502, statusMessage: `Akses gagal disimpan setelah ${akun.length} siswa. Coba lagi.` })
    for (const { s, sandi } of hasil) {
      akun.push({ id: s.id, nama: s.name, nis: s.nis || '', nisn: s.nisn || '', kelas: namaKelas.get(s.class_id) || '', jenjang: s.grade, sandi })
    }
  }
  if (reset && akun.length) {
    for (let i = 0; i < akun.length; i += 500) await db.from('parent_sessions').delete().in('student_id', akun.slice(i, i + 500).map(a => a.id))
  }
  if (akun.length) {
    await catatLogServer(db, { id: uid, nama: caller.user_metadata?.name || email }, 'Data Siswa', reset ? 'reset akses portal orang tua' : 'buat akses portal orang tua',
      akun.length === 1 ? `${akun[0]!.nama} (NIS ${akun[0]!.nis})` : `${akun.length} siswa`)
  }
  return {
    akun,
    dilewati: reset ? [] : siswa.filter((s: any) => sudah.has(s.id)).map((s: any) => ({ nama: s.name, nis: s.nis || '' }))
  }
})
