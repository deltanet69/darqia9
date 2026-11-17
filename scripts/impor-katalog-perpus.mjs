// Seed katalog Perpustakaan Digital ke tabel perpus_buku dari katalog-perpus-darqia.json (jalankan di VPS).
//   node --experimental-strip-types scripts/impor-katalog-perpus.mjs [berkas.json] [--kering]
// Env: NUXT_PUBLIC_SUPABASE_URL (atau SUPABASE_URL) dan NUXT_SUPABASE_SECRET_KEY (service role).
// Folder PDF (env PERPUS_DIR, default /srv/darqia/perpus) dipindai: bila berkas di "Path PDF (rencana)" tidak ada,
// dicari berkas bernama <Slug File>.pdf / <id>.pdf di folder mana pun; kalau ketemu, path_pdf diganti ke lokasi sebenarnya.
// --kering hanya mencetak ringkasan (nilai Jenjang/Kelas/Status Legal/Akses Baca yang terbaca) tanpa menulis.
// Baris "Tidak boleh di-host", UNVERIFIED, dan sheet "Tidak Boleh Di-host" tidak pernah ditulis.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { bacaKatalog } from '../app/composables/perpusCore.ts'

const args = process.argv.slice(2)
const kering = args.includes('--kering')
const berkas = args.find(a => !a.startsWith('--')) || '/srv/darqia/perpus/katalog/katalog-perpus-darqia.json'
const mentah = JSON.parse(readFileSync(berkas, 'utf8'))
const jumlahMentah = Array.isArray(mentah) ? mentah.length : Object.values(mentah).filter(Array.isArray).reduce((n, a) => n + a.length, 0)
const baris = bacaKatalog(mentah)

const dasar = process.env.PERPUS_DIR || '/srv/darqia/perpus'
const pdfAda = new Map() // nama berkas huruf kecil -> path relatif
const jalan = (rel) => {
  let isi = []
  try { isi = readdirSync(join(dasar, rel), { withFileTypes: true }) } catch { return }
  for (const e of isi) {
    const r = rel ? `${rel}/${e.name}` : e.name
    if (e.isDirectory()) jalan(r)
    else if (/\.pdf$/i.test(e.name) && !pdfAda.has(e.name.toLowerCase())) pdfAda.set(e.name.toLowerCase(), r)
  }
}
jalan('')
const adaDiDisk = (rel) => !!rel && [...pdfAda.values()].includes(rel)
let diperbaiki = 0
for (const r of baris) {
  if (adaDiDisk(r.path_pdf)) continue
  const cari = [r.slug_file, r.id].filter(Boolean).map(x => `${x}.pdf`.toLowerCase()).find(n => pdfAda.has(n))
  if (cari) { r.path_pdf = pdfAda.get(cari); diperbaiki++ }
}
const tanpaBerkas = baris.filter(r => !adaDiDisk(r.path_pdf))
const dipakai = new Set(baris.map(r => r.path_pdf))
const yatim = [...pdfAda.values()].filter(p => !dipakai.has(p))
console.log(`Folder PDF ${dasar}: ${pdfAda.size} berkas | cocok ke katalog: ${baris.length - tanpaBerkas.length} (path diperbaiki otomatis: ${diperbaiki}) | belum ada berkas: ${tanpaBerkas.length} | berkas tanpa baris katalog: ${yatim.length}`)
if (tanpaBerkas.length) console.log('Contoh belum ada berkas:', tanpaBerkas.slice(0, 8).map(r => `${r.judul} -> ${r.path_pdf || '(tanpa path)'}`))
if (yatim.length) console.log('Contoh berkas tanpa katalog:', yatim.slice(0, 8))

const hitung = (f) => Object.entries(baris.reduce((m, r) => { const k = f(r) || '(kosong)'; m[k] = (m[k] || 0) + 1; return m }, {}))
console.log(`Baris di berkas: ${jumlahMentah} | koleksi yang tampil: ${baris.length} | disaring: ${jumlahMentah - baris.length}`)
console.log('Jenjang    :', hitung(r => r.jenjang.join('+')))
console.log('Kelas      :', hitung(r => `${r.kelas_label} => [${r.tingkat_kelas}]`))
console.log('Akses baca :', hitung(r => `${r.akses_baca}${r.akhir_pekan ? ' (akhir pekan)' : ''}`))
if (kering) process.exit(0)

const url = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const kunci = process.env.NUXT_SUPABASE_SECRET_KEY
if (!url || !kunci) { console.error('Env URL Supabase / NUXT_SUPABASE_SECRET_KEY belum diisi.'); process.exit(1) }
const db = createClient(url, kunci, { auth: { persistSession: false } })

for (let i = 0; i < baris.length; i += 100) {
  const { error } = await db.from('perpus_buku').upsert(baris.slice(i, i + 100).map(r => ({ ...r, aktif: true })), { onConflict: 'id' })
  if (error) { console.error('Gagal menulis:', error.message); process.exit(1) }
}
// Buku yang sudah tidak ada di katalog (mis. dicabut karena status legal) dinonaktifkan, bukan dihapus.
const { data: ada } = await db.from('perpus_buku').select('id').eq('aktif', true)
const basi = (ada || []).map(r => r.id).filter(id => !baris.some(r => r.id === id))
if (basi.length) await db.from('perpus_buku').update({ aktif: false }).in('id', basi)
console.log(`Selesai: ${baris.length} buku ditulis, ${basi.length} dinonaktifkan.`)
