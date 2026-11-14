// Inti Dashboard AdminV2 (brief docs/Admin Portal/RBAC & Manajemen User/aksesaplikasi.md) — fungsi murni
// tanpa Nuxt/Vue agar bisa dites langsung (tests/dashboard.mjs).

export type TabUjian = 'harian' | 'pts' | 'pas'
// [tanggal, bulan, judul, keterangan, label status, kelas status] — format kartu AdminV2ExamSchedule.
export type BarisUjian = [string, string, string, string, string, 'on' | 'wait' | 'off']

export interface UjianMentah {
  id: string
  name: string
  starts_at: string
  status: string
  jenis: string // CBT: 'tengah_semester' | 'akhir'; LMS: 'harian' | 'pr'
  sumber: 'cbt' | 'lms'
  class_id: string
  subject_id: string
  supervisor_id: string | null
  kelas: string
  mapel: string
}

// Status yang ditampilkan sebagai jadwal "terdekat" (selesai & dibatalkan disembunyikan).
const STATUS: Record<string, [string, 'on' | 'wait' | 'off']> = {
  berlangsung: ['Berlangsung', 'on'],
  terjadwal: ['Terjadwal', 'on'],
  dibekukan: ['Dibekukan', 'wait'],
  draf: ['Draf', 'off']
}
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const bagianWib = (iso: string) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date(iso)).map(x => [x.type, x.value]))
  return { hari: String(Number(p.day)), bulan: BULAN[Number(p.month) - 1] ?? '', jam: `${p.hour}.${p.minute}` }
}

export const tabUjian = (u: Pick<UjianMentah, 'sumber' | 'jenis'>): TabUjian =>
  u.sumber === 'lms' ? 'harian' : u.jenis === 'tengah_semester' ? 'pts' : 'pas'

// Ujian satu mapel & jam yang sama di beberapa kelas digabung jadi satu baris; maks. `batas` baris per tab.
export function kelompokkanUjian(daftar: UjianMentah[], batas = 3): Record<TabUjian, BarisUjian[]> {
  const grup = new Map<string, { u: UjianMentah, kelas: string[] }>()
  for (const u of [...daftar].sort((a, b) => a.starts_at.localeCompare(b.starts_at))) {
    if (!STATUS[u.status]) continue
    const k = `${tabUjian(u)}|${u.subject_id}|${u.starts_at}|${u.name}`
    const ada = grup.get(k)
    if (ada) { if (!ada.kelas.includes(u.kelas)) ada.kelas.push(u.kelas) } else grup.set(k, { u, kelas: [u.kelas] })
  }
  const hasil: Record<TabUjian, BarisUjian[]> = { harian: [], pts: [], pas: [] }
  for (const { u, kelas } of grup.values()) {
    const tab = tabUjian(u)
    if (hasil[tab].length >= batas) continue
    const w = bagianWib(u.starts_at)
    const [label, kelasStatus] = STATUS[u.status]!
    const jenisPr = u.sumber === 'lms' && u.jenis === 'pr' ? ' · PR' : ''
    hasil[tab].push([w.hari, w.bulan, `${u.name} · ${u.mapel}`, `${kelas.join(', ')} · ${w.jam} WIB${jenisPr}`, label, kelasStatus])
  }
  return hasil
}

// Ujian milik guru: ia pengawasnya, atau kelas+mapel ujian ada di jadwal mengajarnya.
export function ujianMilikGuru(daftar: UjianMentah[], guruId: string, ajar: Array<{ class_id: string, subject_id: string }>): UjianMentah[] {
  const pasangan = new Set(ajar.map(a => `${a.class_id}|${a.subject_id}`))
  return daftar.filter(u => u.supervisor_id === guruId || pasangan.has(`${u.class_id}|${u.subject_id}`))
}

export const tanggalWib = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(d)
// Hari jadwal pelajaran: Senin = 1 … Sabtu = 6, Minggu = 0 (tidak ada jadwal).
export const hariJadwalWib = (d = new Date()) =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', weekday: 'short' }).format(d))
// Rentang tanggal bulan berjalan (WIB), format YYYY-MM-DD.
export const rentangBulanWib = (d = new Date()) => {
  const [y, m] = tanggalWib(d).split('-').map(Number) as [number, number]
  const akhir = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const mm = String(m).padStart(2, '0')
  return { awal: `${y}-${mm}-01`, akhir: `${y}-${mm}-${String(akhir).padStart(2, '0')}` }
}

export const HADIR = ['tepat_waktu', 'terlambat']
export interface RekapAbsensi { hadir: number, terlambat: number, izin: number, sakit: number, alpa: number, total: number }
export function rekapAbsensi(status: string[]): RekapAbsensi {
  const n = (s: string) => status.filter(x => x === s).length
  return { hadir: n('tepat_waktu') + n('terlambat'), terlambat: n('terlambat'), izin: n('izin'), sakit: n('sakit'), alpa: n('alpa'), total: status.length }
}

export const angka = (n: number) => n.toLocaleString('id-ID')
export const persen = (bagian: number, total: number) => total > 0 ? Math.round((bagian / total) * 1000) / 10 : 0
export const teksPersen = (p: number) => `${p.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
export const rupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

// Isi pengumuman (HTML) jadi satu baris teks pendek.
export const teksPolos = (html: string, maks = 90) => {
  const t = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
  return t.length > maks ? `${t.slice(0, maks - 1)}…` : t
}
export const tanggalPendek = (iso: string) => {
  const w = bagianWib(iso)
  return `${w.hari} ${w.bulan}`
}

// Jendela Mulai Mengajar: 10 menit sebelum s.d. 10 menit sesudah jam mulai (WIB). Lewat = tercatat tidak hadir.
// Sama dengan Jadwal Mengajar (getMulaiState) dan trigger database 0065.
export type JendelaMulai = 'belum' | 'buka' | 'lewat'
const menit = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return (h ?? 0) * 60 + (m ?? 0) }
const jamDariMenit = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}.${String(n % 60).padStart(2, '0')}`
export function jendelaMulai(jamMulai: string, d = new Date()): { status: JendelaMulai, buka: string, tutup: string } {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(d).split(':')
  const kini = Number(h) % 24 * 60 + Number(m)
  const mulai = menit(jamMulai)
  return {
    status: kini < mulai - 10 ? 'belum' : kini <= mulai + 10 ? 'buka' : 'lewat',
    buka: jamDariMenit(mulai - 10), tutup: jamDariMenit(mulai + 10)
  }
}
