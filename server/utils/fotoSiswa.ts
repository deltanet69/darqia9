import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Folder foto siswa di server (di luar repo, disinkronkan dari Google Drive sekolah):
// nama berkas = NIS siswa, mis. "26270120100.png". Lokasi dapat diganti lewat env NUXT_FOTO_SISWA_DIR.
const DIR = process.env.NUXT_FOTO_SISWA_DIR || '/srv/darqia/foto-siswa'
const EKSTENSI: [string, string][] = [['thumb.jpg', 'image/jpeg'], ['jpg', 'image/jpeg'], ['jpeg', 'image/jpeg'], ['png', 'image/png'], ['webp', 'image/webp']]

// Sajikan berkas foto siswa berdasarkan NIS. NIS divalidasi ketat (angka saja) agar tidak bisa dipakai membaca berkas lain.
export const sajikanFotoSiswa = async (event: any, nis: string) => {
  if (!/^\d{4,20}$/.test(nis)) throw createError({ statusCode: 400, statusMessage: 'NIS tidak valid.' })
  for (const [ext, mime] of EKSTENSI) {
    try {
      const buf = await readFile(join(DIR, `${nis}.${ext}`))
      setResponseHeader(event, 'Content-Type', mime)
      setResponseHeader(event, 'Cache-Control', 'private, max-age=3600')
      return buf
    } catch { /* coba ekstensi berikutnya */ }
  }
  throw createError({ statusCode: 404, statusMessage: 'Foto siswa belum tersedia.' })
}
