// Logika murni jadwal ujian di aplikasi CBT siswa (tanpa Vue/Supabase) agar bisa diuji.
// Semua penentuan tanggal memakai WIB (UTC+7), sama dengan aturan di fungsi database cbt_siswa_login.

export type JenisUjian = 'akhir' | 'tengah_semester' | 'harian' | 'pr'

export interface UjianSiswa {
  source: 'cbt' | 'ujian_harian'
  id: string
  jenis: JenisUjian
  mulai: string // ISO
  durasi: number // menit
  terkunci: boolean // detail disembunyikan server sampai H-2 (akhir/tengah semester)
  nama: string | null
  mapel: string | null
  statusUjian: string
  statusSiswa: 'belum_mulai' | 'berlangsung' | 'terkunci' | 'selesai'
  dikumpulkan: string | null
}

export interface RekapUjian {
  source: 'cbt' | 'ujian_harian'
  id: string
  nama: string
  mapel: string
  jenis: JenisUjian
  mulai: string
  statusSiswa: UjianSiswa['statusSiswa']
  dikumpulkan: string | null
  pelanggaran: number
  nilai: number | null
  menunggu: boolean
}

// Keadaan satu ujian di mata siswa, dihitung dari jam server.
export type KeadaanUjian = 'terkunci' | 'belum' | 'dibuka' | 'berjalan' | 'selesai' | 'akun-terkunci' | 'lewat'

const WIB = 7 * 3_600_000
const hariWib = (ms: number) => Math.floor((ms + WIB) / 86_400_000)

export function keadaanUjian(u: UjianSiswa, sekarangMs: number): KeadaanUjian {
  if (u.statusSiswa === 'selesai') return 'selesai'
  if (u.statusSiswa === 'terkunci') return 'akun-terkunci'
  if (u.statusSiswa === 'berlangsung') return 'berjalan'
  const mulai = new Date(u.mulai).getTime()
  const akhir = mulai + u.durasi * 60_000
  if (sekarangMs >= akhir) return 'lewat'
  if (sekarangMs >= mulai) return 'dibuka'
  // Ujian akhir/tengah semester: sebelum H-2 hanya tanggal & jam yang terlihat.
  if (u.terkunci || (u.jenis !== 'harian' && u.jenis !== 'pr' && hariWib(mulai) - 2 > hariWib(sekarangMs))) return 'terkunci'
  return 'belum'
}

export const bisaDibuka = (k: KeadaanUjian) => k === 'dibuka' || k === 'berjalan'

export const KEADAAN_INFO: Record<KeadaanUjian, { label: string, kelas: string }> = {
  terkunci: { label: 'Terkunci', kelas: 'bg-slate-100 text-slate-600' },
  belum: { label: 'Belum dimulai', kelas: 'bg-merek-50 text-merek-700' },
  dibuka: { label: 'Dapat dimulai', kelas: 'bg-emerald-100 text-emerald-700' },
  berjalan: { label: 'Sedang dikerjakan', kelas: 'bg-amber-100 text-amber-800' },
  selesai: { label: 'Selesai', kelas: 'bg-emerald-50 text-emerald-700' },
  'akun-terkunci': { label: 'Akun terkunci', kelas: 'bg-rose-100 text-rose-700' },
  lewat: { label: 'Tidak diikuti', kelas: 'bg-slate-100 text-slate-500' }
}

export const JENIS_LABEL: Record<JenisUjian, string> = {
  akhir: 'Ujian Akhir',
  tengah_semester: 'Ujian Tengah Semester',
  harian: 'Ujian Harian',
  pr: 'PR di Rumah'
}

const fmt = (opsi: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('id-ID', { ...opsi, timeZone: 'Asia/Jakarta' })
const fmtJam = fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const fmtHariPanjang = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const fmtTanggalPendek = fmt({ day: 'numeric', month: 'short', year: 'numeric' })

export const jamWib = (iso: string) => fmtJam.format(new Date(iso)).replace(':', '.')
export const jamRentang = (iso: string, durasiMenit: number) =>
  `${jamWib(iso)} – ${jamWib(new Date(new Date(iso).getTime() + durasiMenit * 60_000).toISOString())}`
export const hariPanjang = (iso: string) => fmtHariPanjang.format(new Date(iso))
export const tanggalPendek = (iso: string) => fmtTanggalPendek.format(new Date(iso))

// Kelompokkan per hari (WIB) berurutan menurut waktu mulai.
export function kelompokPerHari(daftar: UjianSiswa[]): Array<{ kunci: number, label: string, ujian: UjianSiswa[] }> {
  const hasil: Array<{ kunci: number, label: string, ujian: UjianSiswa[] }> = []
  for (const u of daftar.slice().sort((a, b) => a.mulai.localeCompare(b.mulai))) {
    const kunci = hariWib(new Date(u.mulai).getTime())
    let grup = hasil.find(g => g.kunci === kunci)
    if (!grup) { grup = { kunci, label: hariPanjang(u.mulai), ujian: [] }; hasil.push(grup) }
    grup.ujian.push(u)
  }
  return hasil
}

// Hitung mundur ke jam mulai: "2 hari 3 jam", "1 jam 05 menit", "04:32".
export function hitungMundur(mulaiIso: string, sekarangMs: number): string {
  const detik = Math.max(0, Math.ceil((new Date(mulaiIso).getTime() - sekarangMs) / 1000))
  const hari = Math.floor(detik / 86400)
  const jam = Math.floor((detik % 86400) / 3600)
  const menit = Math.floor((detik % 3600) / 60)
  if (hari > 0) return `${hari} hari ${jam} jam`
  if (jam > 0) return `${jam} jam ${String(menit).padStart(2, '0')} menit`
  return `${String(menit).padStart(2, '0')}:${String(detik % 60).padStart(2, '0')}`
}
