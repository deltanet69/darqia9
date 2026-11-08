import { gerbangProfil, guruMilikAkun } from '../../utils/profilGate'
import { catatLogServer } from '../../utils/catatLogServer'
import { validasiUbah, KOLOM_UBAH } from '../../../app/composables/profilCore'

const LABEL: Record<string, string> = {
  nip: 'NIP', nuptk: 'NUPTK', phone: 'WhatsApp', address: 'alamat', kelurahan: 'kelurahan', kecamatan: 'kecamatan', kab_kota: 'kabupaten'
}

export default defineEventHandler(async (event) => {
  const { supabase, uid, user } = await gerbangProfil(event)
  const body = await readBody(event)
  const meta: Record<string, any> = { ...(user.user_metadata || {}) }
  const diubah: string[] = []

  // Data pegawai: hanya kolom daftar putih (profilCore) dan hanya baris milik akun ini.
  if (body?.data && typeof body.data === 'object') {
    const guru = await guruMilikAkun(supabase, uid)
    if (!guru) throw createError({ statusCode: 404, statusMessage: 'Akun ini belum terhubung ke Data Induk Pegawai. Hubungi Superadmin.' })
    const { galat, nilai } = validasiUbah(body.data, guru)
    if (galat) throw createError({ statusCode: 400, statusMessage: galat })

    const payload: Record<string, string | null> = {}
    for (const k of KOLOM_UBAH) {
      const baru = nilai[k] || null
      if (baru !== ((guru[k] ?? '').toString().trim() || null)) { payload[k] = baru; diubah.push(LABEL[k]) }
    }
    if (Object.keys(payload).length) {
      const { error } = await supabase.from('teachers').update(payload).eq('id', guru.id).eq('user_id', uid)
      if (error) {
        const kembar = error.code === '23505'
        throw createError({
          statusCode: kembar ? 409 : 400,
          statusMessage: kembar ? 'NIP/NUPTK tersebut sudah dipakai pegawai lain.' : `Perubahan gagal disimpan: ${error.message}`
        })
      }
    }
  }

  // Preferensi akun (disimpan di metadata akun login).
  let metaBerubah = false
  if (body?.prefs && typeof body.prefs === 'object') {
    meta.prefs = { wa: !!body.prefs.wa, email: !!body.prefs.email, jadwal: !!body.prefs.jadwal }
    metaBerubah = true
  }
  if (body?.tema !== undefined) {
    const tema = Number(body.tema)
    if (!Number.isInteger(tema) || tema < 0 || tema > 3) throw createError({ statusCode: 400, statusMessage: 'Tema avatar tidak valid.' })
    meta.avatar_tema = tema
    metaBerubah = true
  }
  if (metaBerubah) {
    const { error } = await supabase.auth.admin.updateUserById(uid, { user_metadata: meta })
    if (error) throw createError({ statusCode: 400, statusMessage: `Pengaturan gagal disimpan: ${error.message}` })
  }

  if (diubah.length) {
    await catatLogServer(supabase, { id: uid, nama: meta.name || user.email || '' }, 'Profil', 'ubah profil', `Memperbarui ${diubah.join(', ')}`)
  }
  return { ok: true }
})
