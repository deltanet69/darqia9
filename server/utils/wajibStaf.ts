import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// Gerbang endpoint yang memakai kuota layanan berbayar: hanya sesi login milik guru/staf (fungsi database is_staff()).
// Tanpa sesi -> 401; login tetapi bukan staf (mis. akun siswa) -> 403. Dipanggil sebelum pembatas laju agar permintaan
// tanpa login tidak menambah catatan di memori server dan tidak pernah sampai ke penyedia OCR.
export const wajibStaf = async (event: any) => {
  let claims: any = null
  try {
    claims = await serverSupabaseUser(event)
  } catch {
    claims = null
  }
  if (!claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan masuk terlebih dahulu.' })
  }
  const client: any = await serverSupabaseClient(event)
  const { data, error } = await client.rpc('is_staff')
  if (error || data !== true) {
    throw createError({ statusCode: 403, statusMessage: 'Fitur ini hanya untuk guru dan staf.' })
  }
}
