// Konversi gambar lama ke WebP. Aman dijalankan ulang (berkas yang sudah .webp dilewati).
//   node scripts/konversi-gambar.mjs aset [--kering]       aset statis public/*.png|jpg (>100 KB, kecuali public/icons) -> .webp,
//                                                          rujukan di app/, server/, public/sw.js ikut diganti, berkas asli dihapus
//   node scripts/konversi-gambar.mjs unggahan [--kering]   sampul perpus di disk (PERPUS_DIR) + bucket Supabase spmb-bukti & tiket-lampiran
// Mode unggahan butuh env NUXT_PUBLIC_SUPABASE_URL (atau SUPABASE_URL) dan NUXT_SUPABASE_SECRET_KEY (service role); jalankan di VPS.
// Urutan tiap berkas: unggah WebP -> perbarui kolom database -> hapus berkas lama, jadi gagal di tengah tidak menghilangkan data.
import { readFileSync, readdirSync, statSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, extname, relative } from 'node:path'
import sharp from 'sharp'

const [mode, ...opsi] = process.argv.slice(2)
const kering = opsi.includes('--kering')
const kb = n => (n / 1024).toFixed(0) + ' KB'
const webp = (buf, sisi, q = 80) => sharp(buf).rotate().resize({ width: sisi, height: sisi, fit: 'inside', withoutEnlargement: true }).webp({ quality: q }).toBuffer()
const gambar = nama => /\.(png|jpe?g)$/i.test(nama)

async function aset() {
  const akar = join(import.meta.dirname, '..')
  const publik = join(akar, 'public')
  const daftar = []
  const telusur = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) { if (!['icons', '_prev'].includes(e.name)) telusur(p) } else if (gambar(e.name) && statSync(p).size > 100 * 1024) daftar.push(p)
    }
  }
  telusur(publik)
  const ganti = [] // [url lama, url baru]
  let sebelum = 0, sesudah = 0
  for (const p of daftar) {
    const asli = readFileSync(p)
    const hasil = await webp(asli, 1920)
    sebelum += asli.length; sesudah += hasil.length
    console.log(`${relative(publik, p)}  ${kb(asli.length)} -> ${kb(hasil.length)}`)
    if (kering) continue
    writeFileSync(p.replace(/\.[^.]+$/, '.webp'), hasil)
    unlinkSync(p)
    const url = '/' + relative(publik, p).replaceAll('\\', '/')
    ganti.push([url, url.replace(/\.[^.]+$/, '.webp')])
  }
  console.log(`Total ${kb(sebelum)} -> ${kb(sesudah)}`)
  if (kering) return
  const berkasKode = []
  const cari = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) cari(p)
      else if (/\.(vue|ts|js|css|md)$/.test(e.name)) berkasKode.push(p)
    }
  }
  for (const d of ['app', 'server']) cari(join(akar, d))
  berkasKode.push(join(akar, 'public/sw.js'), join(akar, 'nuxt.config.ts'))
  for (const f of berkasKode) {
    let s
    try { s = readFileSync(f, 'utf8') } catch { continue }
    const baru = ganti.reduce((t, [a, b]) => t.replaceAll(a, b), s)
    if (baru !== s) { writeFileSync(f, baru); console.log('rujukan diperbarui:', relative(akar, f)) }
  }
}

async function unggahan() {
  const { createClient } = await import('@supabase/supabase-js')
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const kunci = process.env.NUXT_SUPABASE_SECRET_KEY
  if (!url || !kunci) throw new Error('Env Supabase belum diisi.')
  const db = createClient(url, kunci, { auth: { persistSession: false } })

  // 1. sampul perpus di disk: sampul/<id>-<kode>.jpg -> .webp, kolom perpus_buku.sampul
  const dir = join(process.env.PERPUS_DIR || '/srv/darqia/perpus', 'sampul')
  for (const nama of readdirSync(dir).filter(n => /\.jpe?g$/i.test(n))) {
    const asli = readFileSync(join(dir, nama))
    const hasil = await webp(asli, 720, 78)
    const baru = nama.replace(/\.[^.]+$/, '.webp')
    console.log(`sampul/${nama}  ${kb(asli.length)} -> ${kb(hasil.length)}`)
    if (kering || hasil.length >= asli.length) continue
    writeFileSync(join(dir, baru), hasil)
    const { error } = await db.from('perpus_buku').update({ sampul: `sampul/${baru}` }).eq('sampul', `sampul/${nama}`)
    if (error) { unlinkSync(join(dir, baru)); console.error('  gagal, dibiarkan:', error.message); continue }
    unlinkSync(join(dir, nama))
  }

  // 2. bucket Supabase: [bucket, tabel, kolom path]
  for (const [bucket, tabel, kolom] of [['spmb-bukti', 'spmb_registrations', 'bukti_path'], ['tiket-lampiran', 'tiket', 'lampiran_path'], ['tiket-lampiran', 'tiket_pesan', 'bukti_path']]) {
    const { data: baris, error } = await db.from(tabel).select(`id, ${kolom}`).not(kolom, 'is', null)
    if (error) { console.error(tabel, error.message); continue }
    for (const r of baris.filter(r => gambar(r[kolom]))) {
      const lama = r[kolom]
      const { data: blob, error: eUnduh } = await db.storage.from(bucket).download(lama)
      if (eUnduh) { console.error('  unduh gagal:', lama, eUnduh.message); continue }
      const asli = Buffer.from(await blob.arrayBuffer())
      const hasil = await webp(asli, 1600)
      const baru = lama.replace(/\.[^.]+$/, '.webp')
      console.log(`${bucket}/${lama}  ${kb(asli.length)} -> ${kb(hasil.length)}`)
      if (kering || hasil.length >= asli.length) continue
      const { error: eNaik } = await db.storage.from(bucket).upload(baru, hasil, { contentType: 'image/webp', upsert: true })
      if (eNaik) { console.error('  unggah gagal:', eNaik.message); continue }
      const { error: eDb } = await db.from(tabel).update({ [kolom]: baru }).eq('id', r.id)
      if (eDb) { await db.storage.from(bucket).remove([baru]); console.error('  update gagal, dibiarkan:', eDb.message); continue }
      // path lama bisa dipakai baris lain (nama sama dalam folder yang sama): hapus hanya bila sudah tak dirujuk
      const { count } = await db.from(tabel).select('id', { count: 'exact', head: true }).eq(kolom, lama)
      if (!count) await db.storage.from(bucket).remove([lama])
    }
  }
}

if (mode === 'aset') await aset()
else if (mode === 'unggahan') await unggahan()
else { console.error('Pakai: node scripts/konversi-gambar.mjs aset|unggahan [--kering]'); process.exit(1) }
