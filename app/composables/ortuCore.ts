// Logika murni Portal Orang Tua — tanpa Nuxt/Vue agar bisa diuji langsung (tests/ortu.mjs).
import { LABEL_TINGKAT, type Grade, type HitunganSiswa } from './keuanganCore.ts'
import type { JenisUjian, KontakOrtu, TingkatOrtu } from '../types/ortu.ts'

export const TEMA_ORTU = {
  SMK: { p0: '#0A2A5C', p1: '#1B5FD9', soft: '#E8F0FE', nama: 'SMK IT Attaqwa 9', singkat: 'SMK IT Attaqwa 9', logo: '/asset/logo.png' },
  SMP: { p0: '#0B4A2A', p1: '#15803D', soft: '#E7F5EC', nama: 'SMP IT Bina Cendekia Assalam', singkat: 'SMP IT Bina Cendekia', logo: '/asset/logosmp.png' }
} as const

// Aturan tap kartu RFID di gerbang — hanya untuk teks legenda; status dihitung di sumber data, bukan di klien.
export const BATAS_TEPAT = '06.45'
export const BATAS_TERLAMBAT = '07.00'

const JENIS: Record<string, JenisUjian> = { harian: 'UH', pr: 'PR', tengah_semester: 'PTS', akhir: 'PAS' }
export const jenisUjian = (mentah: string): JenisUjian | null => JENIS[mentah] ?? null

// Semester berjalan menurut tanggal WIB (yyyy-mm-dd): Juli–Desember Ganjil, Januari–Juni Genap.
export function semesterDari(tanggal: string): { label: string, tahunAjaran: string, dari: string, sampai: string } {
  const [y, m] = tanggal.split('-').map(Number) as [number, number]
  return m >= 7
    ? { label: `Ganjil ${y}/${y + 1}`, tahunAjaran: `${y}/${y + 1}`, dari: `${y}-07-01`, sampai: `${y}-12-31` }
    : { label: `Genap ${y - 1}/${y}`, tahunAjaran: `${y - 1}/${y}`, dari: `${y}-01-01`, sampai: `${y}-06-30` }
}


export const bulanSah = (b: unknown): b is string => typeof b === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(b)

// Per tingkat untuk orang tua: angka dari hitungSiswa (modul Keuangan), keadaan dari rilis + nominal master.
// Sama dengan admin: nominal master 0 = "Belum Diset"; selain itu belum dirilis = "Belum dirilis".
export function tingkatOrtu(grade: Grade, hitung: HitunganSiswa, dirilis: ReadonlySet<number>): TingkatOrtu[] {
  return hitung.per.map((v, t) => ({
    label: LABEL_TINGKAT[grade][t]!,
    keadaan: v.master <= 0 ? 'noset' : dirilis.has(t) ? 'ok' : 'belum',
    total: v.total, bayar: v.bayar, sisa: v.sisa, persen: v.persen
  }))
}

// Kontak orang tua yang dapat diubah sendiri: milik ayah bila nama ayah terisi, selain itu milik ibu.
export const pihakKontak = (s: { father_name?: string | null }): 'father' | 'mother' => (s.father_name || '').trim() ? 'father' : 'mother'
export const kontakDari = (s: Record<string, any>): KontakOrtu => {
  const p = pihakKontak(s)
  return { wa: s[`${p}_phone`] || '', email: s[`${p}_email`] || '', alamat: s.address || '' }
}

// 08xx / +628xx / 628xx -> 628xx. Kosong = galat.
export const normalisasiWa = (v: string): string | null => {
  const bersih = v.replace(/[\s.()-]/g, '')
  if (!/^\+?[0-9]{9,15}$/.test(bersih)) return null
  const angka = bersih.replace(/^\+/, '')
  return angka.startsWith('0') ? '62' + angka.slice(1) : angka
}

const KOLOM_PROFIL = ['wa', 'email', 'alamat'] as const
// Validasi PATCH profil: hanya wa/email/alamat; field lain ditolak. Email & alamat boleh dikosongkan (null).
export function validasiProfilOrtu(body: unknown): { galat: string } | { nilai: Partial<Record<'wa' | 'email' | 'alamat', string | null>> } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { galat: 'Data tidak valid.' }
  const kunci = Object.keys(body)
  if (!kunci.length || kunci.some(k => !(KOLOM_PROFIL as readonly string[]).includes(k))) return { galat: 'Hanya No. WhatsApp, email, dan alamat yang dapat diubah.' }
  const b = body as Record<string, unknown>
  if (kunci.some(k => typeof b[k] !== 'string')) return { galat: 'Data tidak valid.' }
  const nilai: Partial<Record<'wa' | 'email' | 'alamat', string | null>> = {}
  if ('wa' in b) {
    const wa = normalisasiWa(String(b.wa).trim())
    if (!wa) return { galat: 'No. WhatsApp harus 9 sampai 15 angka, contoh 081234567890.' }
    nilai.wa = wa
  }
  if ('email' in b) {
    const email = String(b.email).trim().toLowerCase()
    if (email && (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) return { galat: 'Format email tidak valid.' }
    nilai.email = email || null
  }
  if ('alamat' in b) {
    // eslint-disable-next-line no-control-regex
    const alamat = String(b.alamat).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
    if (alamat.length > 300) return { galat: 'Alamat maksimal 300 karakter.' }
    nilai.alamat = alamat || null
  }
  return { nilai }
}

