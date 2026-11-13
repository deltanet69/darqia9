// Config Safe Exam Browser (.seb, plist XML) untuk satu Ruang Ujian (CBT) atau satu kelas (LMS), dibuat saat diminta dari data terbaru.
// Terbuka tanpa login: isinya hanya HASH SHA-256 kode quit ruang (migrasi 0061), kode asli tidak pernah ada di sini.
import { serverSupabaseServiceRole } from '#supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DOMAIN_CBT: Record<string, string> = { SMK: 'cbt.smkitattaqwa9.sch.id', SMP: 'cbt.smpitbca.sch.id' }
const DOMAIN_IZIN = ['*.supabase.co', 'fonts.googleapis.com', 'fonts.gstatic.com', 'www.youtube.com', 'drive.google.com']

const aturanIzin = (domain: string) =>
  `<dict><key>action</key><integer>1</integer><key>active</key><true/><key>expression</key><string>${domain}</string><key>regex</key><false/></dict>`

const buatConfigSeb = (grade: string, hash: string) => {
  const domain = DOMAIN_CBT[grade]
  if (!domain || !/^[0-9a-f]{64}$/.test(hash)) throw new Error('Data config SEB tidak valid.')
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>sebConfigPurpose</key><integer>0</integer>
<key>startURL</key><string>https://${domain}/</string>
<key>hashedQuitPassword</key><string>${hash}</string>
<key>allowQuit</key><true/>
<key>mobileEnableASAM</key><true/>
<key>mobileEnableModernAAC</key><true/>
<key>URLFilterEnable</key><true/>
<key>URLFilterEnableContentFilter</key><false/>
<key>URLFilterRules</key>
<array>${[domain, ...DOMAIN_IZIN].map(aturanIzin).join('')}</array>
<key>allowBrowsingBackForward</key><false/>
<key>newBrowserWindowNavigation</key><false/>
<key>browserWindowAllowReload</key><true/>
<key>showReloadButton</key><true/>
</dict>
</plist>
`
}

export default defineEventHandler(async (event) => {
  // ?ruang= untuk CBT PTS/PAS (0061), ?kelas= untuk LMS ujian harian (0062).
  const q = getQuery(event)
  const kelas = q.kelas !== undefined
  const id = String((kelas ? q.kelas : q.ruang) ?? '')
  if (!UUID.test(id)) throw createError({ statusCode: 400, statusMessage: 'Tautan config SEB tidak valid.' })
  let client
  try { client = serverSupabaseServiceRole(event) } catch {
    throw createError({ statusCode: 500, statusMessage: 'Secret key Supabase belum dikonfigurasi di server.' })
  }
  const { data, error } = kelas
    ? await client.rpc('seb_config_kelas', { p_class: id })
    : await client.rpc('seb_config_ruang', { p_room: id })
  if (error) throw createError({ statusCode: 500, statusMessage: `Config SEB gagal dibuat. Pastikan migrasi ${kelas ? '0062' : '0061'} sudah dijalankan.` })
  if (!data) throw createError({ statusCode: 404, statusMessage: kelas ? 'Kelas tidak ditemukan.' : 'Ruang ujian tidak ditemukan.' })
  const d = data as { grade: string, hash: string }
  setResponseHeaders(event, {
    'Content-Type': 'application/seb',
    'Content-Disposition': `attachment; filename="darqia-cbt-${d.grade.toLowerCase()}.seb"`,
    'Cache-Control': 'no-store'
  })
  return buatConfigSeb(d.grade, d.hash)
})
