// Aturan akses domain live (.sch.id): setiap subdomain hanya melayani modulnya sendiri.
// Host yang tidak terdaftar (localhost, staging Vercel, IP) tidak dibatasi sama sekali.
// Murni fungsi tanpa Nuxt agar bisa diuji (tests/domain-akses.mjs).
export type Jenjang = 'smp' | 'smk'
export type Modul = 'yayasan' | 'sekolah' | 'portal' | 'spmb' | 'cbt' | 'perpus' | 'absen' | 'absen-guru' | 'parent'

const SMP = 'smpitbca.sch.id'
const SMK = 'smkitattaqwa9.sch.id'
const YAYASAN = 'darqiaattaqwa.sch.id'

const HOST: Record<string, { modul: Modul, jenjang?: Jenjang }> = {
  [YAYASAN]: { modul: 'yayasan' },
  [SMP]: { modul: 'sekolah', jenjang: 'smp' },
  [SMK]: { modul: 'sekolah', jenjang: 'smk' },
  [`portal.${YAYASAN}`]: { modul: 'portal' },
  [`spmb.${SMP}`]: { modul: 'spmb', jenjang: 'smp' },
  [`spmb.${SMK}`]: { modul: 'spmb', jenjang: 'smk' },
  [`cbt.${SMP}`]: { modul: 'cbt', jenjang: 'smp' },
  [`cbt.${SMK}`]: { modul: 'cbt', jenjang: 'smk' },
  [`perpus.${SMP}`]: { modul: 'perpus', jenjang: 'smp' },
  [`perpus.${SMK}`]: { modul: 'perpus', jenjang: 'smk' },
  [`absen.${YAYASAN}`]: { modul: 'absen-guru' },
  [`absen.${SMP}`]: { modul: 'absen', jenjang: 'smp' },
  [`absen.${SMK}`]: { modul: 'absen', jenjang: 'smk' },
  [`parent.${SMP}`]: { modul: 'parent', jenjang: 'smp' },
  [`parent.${SMK}`]: { modul: 'parent', jenjang: 'smk' }
}

// Halaman awal tiap modul. Modul tanpa halaman (Absensi Guru, Parent Portal) belum dibangun.
const beranda = (modul: Modul, jenjang?: Jenjang): string | null => {
  if (modul === 'yayasan') return '/'
  if (modul === 'sekolah') return `/${jenjang}`
  if (modul === 'portal') return '/adminV2'
  if (modul === 'spmb') return `/spmb/${jenjang}`
  if (modul === 'cbt') return '/cbt'
  if (modul === 'perpus') return '/perpus'
  if (modul === 'absen') return '/absensi'
  return null
}

const hostUntuk = (modul: Modul, jenjang?: Jenjang) =>
  Object.keys(HOST).find(h => HOST[h]!.modul === modul && (!HOST[h]!.jenjang || HOST[h]!.jenjang === jenjang))

// Modul dan jenjang pemilik sebuah path. 'bebas' = boleh di semua domain; null = bukan rute modul mana pun.
const pemilik = (path: string): { modul: Modul, jenjang?: Jenjang } | 'bebas' | null => {
  const p = path.toLowerCase()
  const awal = (pre: string) => p === pre || p.startsWith(pre + '/')
  if (awal('/verifikasi')) return 'bebas'
  if (p === '/') return { modul: 'yayasan' }
  if (awal('/smp')) return { modul: 'sekolah', jenjang: 'smp' }
  if (awal('/smk')) return { modul: 'sekolah', jenjang: 'smk' }
  if (awal('/spmb/smp')) return { modul: 'spmb', jenjang: 'smp' }
  if (awal('/spmb/smk')) return { modul: 'spmb', jenjang: 'smk' }
  if (awal('/spmb')) return { modul: 'spmb' }
  if (awal('/cbt')) return { modul: 'cbt' }
  if (awal('/perpus')) return { modul: 'perpus' }
  if (awal('/absensi')) return { modul: 'absen' }
  if (p.startsWith('/admin')) return { modul: 'portal' }
  return null
}

// Path internal yang tampil sebagai "/" di domain ini (router.options menambahkan alias "/" ke rute itu).
const normalHost = (hostname: string) => hostname.toLowerCase().replace(/^www\./, '')
export const berandaHost = (hostname: string): string | null => {
  const peran = HOST[normalHost(hostname)]
  return peran ? beranda(peran.modul, peran.jenjang) : null
}
// Awalan web sekolah ('/smp' atau '/smk') bila host-nya web utama sekolah; di domain itu awalan dibuang dari URL.
export const awalanSekolahHost = (hostname: string): string | null => {
  const peran = HOST[normalHost(hostname)]
  return peran?.modul === 'sekolah' ? `/${peran.jenjang}` : null
}
const tanpaAwalan = (url: string) => url.replace(/^\/(smp|smk)(?=[/?#]|$)/i, '').replace(/^(?!\/)/, '/')
export const adalahHostAbsen =(hostname: string) => HOST[normalHost(hostname)]?.modul === 'absen'

// Mengembalikan tujuan pengalihan (path internal atau URL domain lain), atau null bila akses diizinkan.
// Beranda tiap domain selalu "/" (bersih, tanpa /smp, /cbt, dst.).
export const arahkanDomain = (hostname: string, path: string, fullPath = path): string | null => {
  const peran = HOST[normalHost(hostname)]
  if (!peran) return null
  const pemilikPath = pemilik(path)
  if (pemilikPath === 'bebas') return null

  const awal = beranda(peran.modul, peran.jenjang)
  if (!awal) return `https://${YAYASAN}/`
  if (path === '/' || pemilikPath === null) return null
  // di web sekolah /spmb adalah halaman info SPMB sekolah itu (SPMB asli ada di subdomain spmb.)
  if (peran.modul === 'sekolah' && /^\/spmb\/?$/i.test(path)) return null

  if (pemilikPath.modul === peran.modul && (!pemilikPath.jenjang || pemilikPath.jenjang === peran.jenjang)) {
    if (peran.modul === 'sekolah') return tanpaAwalan(fullPath)
    const p = path.toLowerCase().replace(/\/$/, '')
    // beranda modul, dan pemilih unit SPMB (tidak dipakai di domain SPMB per jenjang), tampil sebagai "/"
    if (p === awal.toLowerCase() || (peran.modul === 'spmb' && p === '/spmb')) return '/'
    // absen.<sekolah>/<kelas> menggantikan /absensi/<kelas>
    const kelas = peran.modul === 'absen' && path.match(/^\/absensi\/([^/]+)\/?$/i)
    return kelas ? `/${kelas[1]}` : null
  }

  const jenjang = pemilikPath.jenjang ?? peran.jenjang
  const tujuan = hostUntuk(pemilikPath.modul, jenjang)
  if (!tujuan) return '/'
  if (pemilikPath.modul === 'sekolah') return `https://${tujuan}${tanpaAwalan(fullPath)}`
  // beranda modul (mis. /spmb/smp, /cbt) langsung ke "/" di domain tujuan, tanpa pengalihan kedua
  const p = path.toLowerCase().replace(/\/$/, '')
  const keBeranda = p === beranda(pemilikPath.modul, jenjang)?.toLowerCase() || (pemilikPath.modul === 'spmb' && p === '/spmb')
  return `https://${tujuan}${keBeranda ? '/' + fullPath.slice(path.length) : fullPath}`
}
