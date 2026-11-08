import { gerbangProfil } from '../../utils/profilGate'
import { catatLogServer } from '../../utils/catatLogServer'

const MAKS_BYTE = 300 * 1024
const BUCKET = 'avatars'

// Foto sudah dikompres di browser (persegi, maks 512 px, WebP/JPEG). Server tetap
// memeriksa tipe & ukuran, lalu menyimpan satu berkas per akun (menimpa foto lama).
export default defineEventHandler(async (event) => {
  const { supabase, uid, user } = await gerbangProfil(event)
  const body = await readBody(event)
  const cocok = /^data:image\/(webp|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(String(body?.gambar || ''))
  if (!cocok) throw createError({ statusCode: 400, statusMessage: 'Format foto harus JPG atau WebP.' })
  const buf = Buffer.from(cocok[2], 'base64')
  if (!buf.length || buf.length > MAKS_BYTE) throw createError({ statusCode: 400, statusMessage: 'Ukuran foto setelah kompresi maksimal 300 KB.' })

  const ext = cocok[1] === 'webp' ? 'webp' : 'jpg'
  const { error: cekBucket } = await supabase.storage.getBucket(BUCKET)
  if (cekBucket) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAKS_BYTE, allowedMimeTypes: ['image/webp', 'image/jpeg'] })
    if (error && !/already exists/i.test(error.message)) throw createError({ statusCode: 502, statusMessage: 'Penyimpanan foto belum siap. Hubungi Administrator.' })
  }
  const path = `${uid}.${ext}`
  const { error: errUnggah } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: `image/${cocok[1]}`, upsert: true })
  if (errUnggah) throw createError({ statusCode: 502, statusMessage: `Foto gagal diunggah: ${errUnggah.message}` })
  // Ekstensi lain milik akun yang sama dibuang agar tidak ada berkas yatim.
  await supabase.storage.from(BUCKET).remove([`${uid}.${ext === 'webp' ? 'jpg' : 'webp'}`])

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const url = `${data.publicUrl}?v=${Date.now()}`
  const meta = { ...(user.user_metadata || {}), avatar_url: url }
  const { error } = await supabase.auth.admin.updateUserById(uid, { user_metadata: meta })
  if (error) throw createError({ statusCode: 400, statusMessage: `Foto gagal disimpan: ${error.message}` })

  await catatLogServer(supabase, { id: uid, nama: meta.name || user.email || '' }, 'Profil', 'ubah foto', 'Memperbarui foto profil')
  return { url }
})
