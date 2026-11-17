// Buat akun Portal Orang Tua (sekali jalan, oleh pengelola). Kata sandi awal acak 8 karakter hanya dicetak ke CSV lokal
// akun-ortu-<waktu>.csv (di-.gitignore) untuk dibagikan Tata Usaha; orang tua wajib menggantinya saat pertama masuk.
//   node --experimental-strip-types scripts/buat-akun-ortu.mjs                   # semua siswa aktif yang belum punya akun
//   node --experimental-strip-types scripts/buat-akun-ortu.mjs --nis 1287 --jenjang SMK [--reset]
// --reset hanya berlaku dengan --nis: membuat kata sandi awal baru untuk akun yang sudah ada (lupa kata sandi).
// Env: NUXT_PUBLIC_SUPABASE_URL (atau SUPABASE_URL) dan NUXT_SUPABASE_SECRET_KEY (service role). Butuh migrasi 0080.
import { writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { hashSandiOrtu, sandiAcakOrtu } from '../server/utils/ortuSandi.ts'

const args = process.argv.slice(2)
const opsi = (nama) => { const i = args.indexOf(nama); return i >= 0 ? args[i + 1] : undefined }
const nis = opsi('--nis')
const jenjang = opsi('--jenjang')
const reset = args.includes('--reset')
if (nis && !['SMP', 'SMK'].includes(jenjang)) { console.error('Sertakan --jenjang SMP atau SMK bersama --nis.'); process.exit(1) }
if (reset && !nis) { console.error('--reset hanya untuk satu siswa (--nis).'); process.exit(1) }

const url = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const kunci = process.env.NUXT_SUPABASE_SECRET_KEY
if (!url || !kunci) { console.error('Env NUXT_PUBLIC_SUPABASE_URL dan NUXT_SUPABASE_SECRET_KEY wajib diisi.'); process.exit(1) }
const db = createClient(url, kunci, { auth: { persistSession: false } })

const siswa = []
for (let dari = 0; ; dari += 1000) {
  let q = db.from('students').select('id, nis, name, grade').eq('active', true).not('nis', 'is', null).order('grade').order('nis').range(dari, dari + 999)
  if (nis) q = q.eq('nis', nis).eq('grade', jenjang)
  const { data, error } = await q
  if (error) { console.error('Gagal membaca siswa:', error.message); process.exit(1) }
  siswa.push(...data)
  if (data.length < 1000) break
}
if (!siswa.length) { console.error(nis ? 'Siswa aktif dengan NIS & jenjang itu tidak ditemukan.' : 'Tidak ada siswa aktif.'); process.exit(1) }

const sudah = new Set()
for (let i = 0; i < siswa.length; i += 500) {
  const { data, error } = await db.from('parent_accounts').select('student_id').in('student_id', siswa.slice(i, i + 500).map(s => s.id))
  if (error) { console.error('Gagal membaca akun (migrasi 0080 sudah diterapkan?):', error.message); process.exit(1) }
  for (const a of data) sudah.add(a.student_id)
}

const target = siswa.filter(s => reset || !sudah.has(s.id))
const baris = []
for (const s of target) {
  const sandi = sandiAcakOrtu()
  const isi = { student_id: s.id, password_hash: await hashSandiOrtu(sandi), must_change_password: true, failed_count: 0, locked_until: null, updated_at: new Date().toISOString() }
  const { error } = await db.from('parent_accounts').upsert(isi, { onConflict: 'student_id' })
  if (error) { console.error(`Gagal untuk NIS ${s.nis}:`, error.message); continue }
  if (reset) await db.from('parent_sessions').delete().eq('student_id', s.id)
  baris.push([s.grade, s.nis, s.name, sandi])
}

if (!baris.length) { console.log(`Tidak ada akun baru (${sudah.size} siswa sudah punya akun).`); process.exit(0) }
const sel = (v) => `"${String(v).replace(/"/g, '""')}"`
const berkas = `akun-ortu-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
writeFileSync(berkas, ['Jenjang,NIS,Nama Siswa,Kata Sandi Awal', ...baris.map(b => b.map(sel).join(','))].join('\n') + '\n', { mode: 0o600 })
console.log(`${baris.length} akun ${reset ? 'direset' : 'dibuat'}. Kata sandi awal tersimpan di ${berkas} — bagikan ke orang tua, lalu hapus berkasnya.`)
