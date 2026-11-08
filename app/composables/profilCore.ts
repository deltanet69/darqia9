// Inti Profil Saya — fungsi murni tanpa impor Nuxt/Vue agar bisa dites langsung
// (tests/profil.mjs). Semua tampilan profil dibangun dari data nyata:
// baris guru milik akun yang login (teachers.user_id), akun auth, dan peran RBAC.
import { RBAC_MODUL, type IzinPeran } from './rbacCore.ts'

// Sama dengan PRIMARY_SUPERADMIN_EMAIL di server/utils/adminUsersGate.ts.
export const EMAIL_UTAMA = 'betadev94@gmail.com'

export interface AkunInfo {
  id: string
  email: string
  name: string
  aktif: boolean
  avatarUrl: string
  tema: number
  prefs: Partial<PrefNotifikasi> | null
}

export interface PrefNotifikasi { wa: boolean; email: boolean; jadwal: boolean }

export interface GuruRow {
  id: string
  name: string | null
  nip: string | null
  nuptk: string | null
  nik: string | null
  email: string | null
  phone: string | null
  gender: string | null
  birth_place: string | null
  birth_date: string | null
  address: string | null
  kelurahan: string | null
  kecamatan: string | null
  kab_kota: string | null
  education: string | null
  rfid_uid: string | null
  subject: string | null
  position: string | null
  grade: string | null
  employment_status: string | null
}

export interface ProfilSaya {
  id: string
  adaGuru: boolean
  name: string
  roleSys: string
  roleLabel: string
  unit: string
  jabatan: string
  mapel: string
  nik: string
  nuptk: string
  nip: string
  email: string
  wa: string
  tempat: string
  tgl: string
  jk: string
  alamat: string
  kel: string
  kec: string
  kab: string
  pendidikan: string
  statusPeg: string
  rfid: string
  akun: 'Aktif' | 'Nonaktif'
  fotoUrl: string
}

export interface LogRow { modul: string; aksi: string; detail: string | null; created_at: string }

const kosong = (v: unknown): string => {
  const s = String(v ?? '').trim()
  return s && s !== '-' ? s : '-'
}

export const inisial = (nama: string): string => {
  const lewati = ['H.', 'Hj.', 'Drs.', 'Dr.', 'Ust.', 'Ustzh.']
  const kata = String(nama || '').replace(/,.*$/, '').split(' ').filter(k => k && !lewati.includes(k))
  return kata.slice(0, 2).map(k => k[0]).join('').toUpperCase() || '?'
}

export const maskNum = (v: string): string => {
  if (!v) return '-'
  return v.length > 10 ? v.slice(0, 6) + '••••••' + v.slice(-4) : v
}

export const tanggalIndo = (iso: unknown): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''))
  if (!m) return '-'
  const bulan = Number(m[2])
  const hari = Number(m[3])
  if (bulan < 1 || bulan > 12 || hari < 1 || hari > 31) return '-'
  return `${m[3]}-${m[2]}-${m[1]}`
}

const UNIT: Record<string, string> = {
  SMK: 'SMK IT Attaqwa 9',
  SMP: 'SMP IT Bina Cendekia Assalam',
  Yayasan: 'Yayasan Darqia Attaqwa'
}

export const bangunProfil = (akun: AkunInfo, guru: GuruRow | null, peranNama: string): ProfilSaya => ({
  id: guru?.id || akun.id,
  adaGuru: !!guru,
  name: kosong(guru?.name || akun.name || akun.email),
  roleSys: peranNama || '-',
  roleLabel: kosong(guru?.position),
  unit: UNIT[String(guru?.grade || '')] || '-',
  jabatan: kosong(guru?.position),
  mapel: kosong(guru?.subject),
  nik: kosong(guru?.nik),
  nuptk: kosong(guru?.nuptk),
  nip: kosong(guru?.nip),
  email: kosong(akun.email),
  wa: kosong(guru?.phone),
  tempat: kosong(guru?.birth_place),
  tgl: tanggalIndo(guru?.birth_date),
  jk: guru?.gender === 'L' ? 'Laki laki' : guru?.gender === 'P' ? 'Perempuan' : '-',
  alamat: kosong(guru?.address),
  kel: kosong(guru?.kelurahan),
  kec: kosong(guru?.kecamatan),
  kab: kosong(guru?.kab_kota),
  pendidikan: kosong(guru?.education),
  statusPeg: kosong(guru?.employment_status),
  rfid: kosong(guru?.rfid_uid),
  akun: akun.aktif ? 'Aktif' : 'Nonaktif',
  fotoUrl: akun.avatarUrl || ''
})

export const hitungKelengkapan = (p: ProfilSaya): { pct: number; missing: string[] } => {
  const ada = (v: string) => !!v && v !== '-'
  const cek: Array<[string, boolean]> = [
    ['NIK', ada(p.nik)],
    ['NIP/NUPTK', ada(p.nip) || ada(p.nuptk)],
    ['Email', ada(p.email)],
    ['No. WhatsApp', ada(p.wa)],
    ['Tempat Lahir', ada(p.tempat)],
    ['Tanggal Lahir', ada(p.tgl)],
    ['Alamat', ada(p.alamat)],
    ['Pendidikan', ada(p.pendidikan)],
    ['RFID', ada(p.rfid)],
    ['Foto Profil', !!p.fotoUrl]
  ]
  const missing = cek.filter(c => !c[1]).map(c => c[0])
  return { pct: Math.round(((cek.length - missing.length) / cek.length) * 100), missing }
}

// ===== Ubah data mandiri =====
// Daftar putih kolom teachers yang boleh diubah guru sendiri. NIK, nama, jabatan,
// RFID, dan data kepegawaian lain hanya bisa diubah Superadmin (Data Guru & Staff).
export const KOLOM_UBAH = ['nip', 'nuptk', 'phone', 'address', 'kelurahan', 'kecamatan', 'kab_kota'] as const
export type KolomUbah = typeof KOLOM_UBAH[number]
export type DataUbah = Record<KolomUbah, string>

const rapikan = (v: unknown): string => String(v ?? '').trim()

export const validasiUbah = (input: Record<string, any>, awal: Record<string, any>): { galat: string; nilai: DataUbah } => {
  const baku = (k: KolomUbah, v: unknown) => (k === 'nip' || k === 'nuptk') ? rapikan(v).replace(/\s+/g, '') : rapikan(v)
  const nilai = {} as DataUbah
  for (const k of KOLOM_UBAH) nilai[k] = baku(k, input?.[k])

  const berubah = (k: KolomUbah) => nilai[k] !== baku(k, awal?.[k])
  let galat = ''
  if (berubah('address') && !nilai.address) galat = 'Alamat domisili tidak boleh kosong.'
  else if (nilai.address.length > 200) galat = 'Alamat lengkap maksimal 200 karakter.'
  else if (berubah('phone') && !/^[\d\s+()-]+$/.test(nilai.phone)) galat = 'Nomor WhatsApp hanya boleh berisi angka.'
  else if (berubah('phone') && !(nilai.phone.replace(/\D/g, '').length >= 10 && nilai.phone.replace(/\D/g, '').length <= 15)) galat = 'Nomor WhatsApp harus 10–15 digit.'
  else if (berubah('nip') && nilai.nip && !/^\d{18}$/.test(nilai.nip)) galat = 'NIP harus 18 digit angka.'
  else if (berubah('nuptk') && nilai.nuptk && !/^\d{16}$/.test(nilai.nuptk)) galat = 'NUPTK harus 16 digit angka.'
  else if (['kelurahan', 'kecamatan', 'kab_kota'].some(k => nilai[k as KolomUbah].length > 100)) galat = 'Kelurahan, kecamatan, dan kabupaten maksimal 100 karakter.'
  return { galat, nilai }
}

// ===== Aplikasi Saya (RBAC) =====
const URUT_AKSI: Array<['lihat' | 'buat' | 'ubah' | 'hapus', string]> = [['lihat', 'Lihat'], ['buat', 'Buat'], ['ubah', 'Ubah'], ['hapus', 'Hapus']]

export const ringkasHak = (h: { lihat: boolean; buat: boolean; ubah: boolean; hapus: boolean }): string => {
  if (h.lihat && h.buat && h.ubah && h.hapus) return 'Penuh'
  return URUT_AKSI.filter(([k]) => h[k]).map(([, label]) => label).join(' · ')
}

export const daftarAplikasi = (p: { terkunci: boolean; izin: IzinPeran | null }): Array<{ modul: string; hak: string }> => {
  if (!p.terkunci && !p.izin) return []
  return RBAC_MODUL
    .filter(m => p.terkunci || p.izin?.[m]?.lihat)
    .map(m => ({
      modul: m,
      hak: p.terkunci ? 'Penuh' : ringkasHak(p.izin![m])
    }))
}

// ===== Sesi & aktivitas =====
export const perangkatDari = (ua: string): string => {
  const u = String(ua || '')
  if (!u) return 'Perangkat tidak dikenal'
  const os = /Android/i.test(u) ? 'Android'
    : /iPhone|iPad|iPod/i.test(u) ? 'iOS'
      : /Windows/i.test(u) ? 'Windows'
        : /Mac OS X|Macintosh/i.test(u) ? 'macOS'
          : /Linux|X11/i.test(u) ? 'Linux' : ''
  const browser = /Edg(e|A|iOS)?\//i.test(u) ? 'Edge'
    : /OPR\/|Opera/i.test(u) ? 'Opera'
      : /Firefox\/|FxiOS/i.test(u) ? 'Firefox'
        : /Chrome\/|CriOS/i.test(u) ? 'Chrome'
          : /Safari\//i.test(u) ? 'Safari' : 'Peramban lain'
  return os ? `${browser} (${os})` : browser
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// WIB = UTC+7 tanpa DST, jadi cukup digeser 7 jam lalu dibaca sebagai UTC.
export const formatWaktuWib = (iso: unknown): string => {
  if (!iso) return '-'
  const t = new Date(String(iso)).getTime()
  if (Number.isNaN(t)) return '-'
  const d = new Date(t + 7 * 3600_000)
  const dua = (n: number) => String(n).padStart(2, '0')
  return `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${dua(d.getUTCHours())}:${dua(d.getUTCMinutes())} WIB`
}

export const sesiLogin = (logs: LogRow[], n = 3): Array<{ waktu: string; perangkat: string }> =>
  logs
    .filter(l => l.modul === 'Sistem' && l.aksi === 'login')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, n)
    .map(l => {
      const perangkat = String(l.detail || '').split(' · ').slice(1).join(' · ').trim()
      return { waktu: l.created_at, perangkat: perangkat || 'Perangkat tidak tercatat' }
    })

export const aktivitasTampil = (logs: LogRow[]): Array<{ judul: string; waktu: string }> =>
  logs.map(l => ({
    judul: rapikan(l.detail) || `${l.aksi.charAt(0).toUpperCase()}${l.aksi.slice(1)} — ${l.modul}`,
    waktu: formatWaktuWib(l.created_at)
  }))

// ===== Foto profil =====
// Potong persegi dari tengah lalu kecilkan ke maks; tidak pernah memperbesar.
export const ukuranKompres = (w: number, h: number, maks = 512) => {
  const sisi = Math.min(w, h)
  const dst = Math.min(maks, sisi)
  return { sx: Math.floor((w - sisi) / 2), sy: Math.floor((h - sisi) / 2), sw: sisi, sh: sisi, dw: dst, dh: dst }
}
