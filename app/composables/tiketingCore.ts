// Inti Tiketing — konstanta dan fungsi murni (tanpa Nuxt/Vue, dapat dites
// langsung lewat tests/tiketing.mjs). Spek dikunci user 3 Nov 2026:
// kategori = modul aplikasi + kendala teknis; ID & data per grade;
// hanya Superadmin melihat seluruh tiket (ditegakkan RLS, migrasi 0025).
import { RBAC_MODUL } from './rbacCore.ts'

export type GradeTiket = 'SMK' | 'SMP'
export type StatusTiket = 'Baru' | 'Diproses' | 'Menunggu Info' | 'Selesai' | 'Ditutup'

export interface TiketRow {
  id: string
  nomor: string
  grade: GradeTiket
  judul: string
  deskripsi: string
  kategori: string
  status: StatusTiket
  progress: number
  pelapor_id: string
  pelapor_nama: string
  pelapor_peran: string
  lampiran_path: string | null
  lampiran_nama: string | null
  created_at: string
  updated_at: string
}

export interface TiketPesan {
  id: string
  tiket_id: string
  penulis_id: string
  penulis_nama: string
  dari_superadmin: boolean
  teks: string
  bukti_path: string | null
  bukti_nama: string | null
  created_at: string
}

export interface TiketLog {
  id: number
  tiket_id: string
  pelaku_id: string | null
  pelaku_nama: string
  teks: string
  catatan: string
  created_at: string
}

export interface SaringTiket {
  grade: GradeTiket | 'Semua'
  status: StatusTiket | 'Semua'
  kategori: string
  cari: string
}

// Kategori modul = daftar modul aplikasi yang sama dengan matriks RBAC
// (sumber tunggal di rbacCore), ditambah kendala teknis & lainnya.
export const TIKET_KATEGORI_MODUL: string[] = RBAC_MODUL.filter(m => m !== 'Tiketing')
export const TIKET_KATEGORI_LAIN: string[] = ['Login', 'Jaringan / Network', 'Integrasi Data', 'Lainnya']
export const TIKET_SEMUA_KATEGORI: string[] = [...TIKET_KATEGORI_MODUL, ...TIKET_KATEGORI_LAIN]

export const TIKET_STATUS: StatusTiket[] = ['Baru', 'Diproses', 'Menunggu Info', 'Selesai', 'Ditutup']

export const TIKET_PROGRESS: Array<{ nilai: number, label: string }> = [
  { nilai: 0, label: '0% — belum mulai' },
  { nilai: 25, label: '25% — sedang ditelusuri' },
  { nilai: 50, label: '50% — penyebab ditemukan' },
  { nilai: 75, label: '75% — perbaikan berjalan / menunggu info' },
  { nilai: 100, label: '100% — selesai' }
]

export const BATAS_BERKAS = 1024 * 1024 // 1 MB, sesuai batas bucket di migrasi 0025

const URUTAN_STATUS: Record<StatusTiket, number> = { 'Baru': 0, 'Diproses': 1, 'Menunggu Info': 2, 'Selesai': 3, 'Ditutup': 4 }

// Saring + urutkan daftar tiket: tiket Baru paling atas, lalu yang
// terakhir diperbarui. Dipakai daftar pelapor maupun Kotak Masuk.
export function saringTiket(daftar: TiketRow[], s: SaringTiket): TiketRow[] {
  const cari = s.cari.trim().toLowerCase()
  return daftar
    .filter(t => (s.grade === 'Semua' || t.grade === s.grade)
      && (s.status === 'Semua' || t.status === s.status)
      && (s.kategori === 'Semua' || t.kategori === s.kategori)
      && (!cari || `${t.judul} ${t.nomor} ${t.kategori} ${t.pelapor_nama}`.toLowerCase().includes(cari)))
    .slice()
    .sort((a, b) => (URUTAN_STATUS[a.status] - URUTAN_STATUS[b.status])
      || (a.updated_at < b.updated_at ? 1 : -1))
}

export interface StatistikTiket {
  total: number
  baru: number
  diproses: number
  menunggu: number
  selesai: number
  baruSMK: number
  baruSMP: number
}

export function statistikTiket(daftar: TiketRow[]): StatistikTiket {
  const hitung = (st: StatusTiket) => daftar.filter(t => t.status === st).length
  return {
    total: daftar.length,
    baru: hitung('Baru'),
    diproses: hitung('Diproses'),
    menunggu: hitung('Menunggu Info'),
    selesai: hitung('Selesai'),
    baruSMK: daftar.filter(t => t.status === 'Baru' && t.grade === 'SMK').length,
    baruSMP: daftar.filter(t => t.status === 'Baru' && t.grade === 'SMP').length
  }
}

// Teks Log Penanganan untuk perubahan status/progress; '' bila tak berubah.
export function teksLogPerubahan(statusLama: StatusTiket, statusBaru: StatusTiket, progLama: number, progBaru: number): string {
  const bagian: string[] = []
  if (statusBaru !== statusLama) bagian.push(`Status: ${statusLama} → ${statusBaru}`)
  if (progBaru !== progLama) bagian.push(`Progress ${progLama}% → ${progBaru}%`)
  return bagian.join(' · ')
}

// Validasi form pelapor (Judul, Kategori, Komentar wajib) — pesan galat
// Bahasa Indonesia, atau null bila lolos.
export function validasiFormTiket(input: { judul: string, kategori: string, deskripsi: string }): string | null {
  if (!input.judul.trim()) return 'Judul wajib diisi.'
  if (!input.kategori || !TIKET_SEMUA_KATEGORI.includes(input.kategori)) return 'Issue / Kategori wajib dipilih.'
  if (!input.deskripsi.trim()) return 'Komentar wajib diisi.'
  return null
}

export function berkasDiterima(ukuran: number): boolean {
  return ukuran > 0 && ukuran <= BATAS_BERKAS
}

export function kelasStatus(status: StatusTiket): string {
  return {
    'Baru': 'bg-[#EAF1FC] text-[#1B5FD9]',
    'Diproses': 'bg-[#FFFAEB] text-[#B54708]',
    'Menunggu Info': 'bg-[#F4F3FF] text-[#6941C6]',
    'Selesai': 'bg-[#ECFDF3] text-[#067647]',
    'Ditutup': 'bg-[#F2F4F7] text-[#475467]'
  }[status]
}

export function warnaGrade(grade: GradeTiket): string {
  return grade === 'SMK' ? '#1B5FD9' : '#067647'
}

export function labelSekolah(grade: GradeTiket): string {
  return grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT BCA'
}
