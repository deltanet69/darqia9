import { wajibStaf } from '../../../utils/wajibStaf'

// Status gerbang aplikasi untuk tab Kebijakan Ujian: saklar + daftar NIS pengecualian yang diatur
// lewat env server (NUXT_CBT_GERBANG_APLIKASI / NUXT_CBT_GERBANG_NIS_BEBAS). Daftar dari panel
// (tabel cbt_bebas_gerbang) dibaca klien langsung lewat RLS, bukan dari endpoint ini.
export default defineEventHandler(async (event) => {
  await wajibStaf(event)
  const cfg = useRuntimeConfig(event)
  return {
    gerbangAktif: String(cfg.cbtGerbangAplikasi) !== 'false',
    nisEnv: String(cfg.cbtGerbangNisBebas ?? '').split(',').map(s => s.trim()).filter(Boolean)
  }
})
