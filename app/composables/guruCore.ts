// Logika murni Data Induk Guru — penyesuaian hasil meeting manajemen
// Darqia 4 Nov 2026 (butir Data Master Guru):
// - No KK DIHAPUS dari data guru.
// - Nomor pegawai punya JENIS: NIP atau NUPTK (pilihan + keterangan).
// - Pendidikan terakhir = dropdown 5 tingkat baku.
// - Asal institusi: "Asal Sekolah" untuk lulusan sederajat,
//   "Asal Kampus / Perguruan Tinggi" untuk Diploma ke atas.

export const PENDIDIKAN_OPSI = ['SMK/SMA Sederajat', 'Diploma', 'Sarjana', 'Magister', 'Doktor'] as const
export type PendidikanGuru = typeof PENDIDIKAN_OPSI[number]

export const JENIS_NOMOR_OPSI = ['NIP', 'NUPTK'] as const
export type JenisNomor = typeof JENIS_NOMOR_OPSI[number]

// Samakan teks pendidikan bebas (data lama / hasil impor) ke 5 opsi baku.
// Mengembalikan '' bila tidak dikenali agar pemanggil bisa menandai manual.
export function normalisasiPendidikan(teks: unknown): string {
  const t = String(teks || '').trim()
  if (!t) return ''
  if ((PENDIDIKAN_OPSI as readonly string[]).includes(t)) return t
  const k = t.toUpperCase().replace(/\./g, '')
  if (/^S3|DOKTOR|DR\b/.test(k)) return 'Doktor'
  if (/^S2|MAGISTER/.test(k)) return 'Magister'
  if (/^S1|SARJANA/.test(k)) return 'Sarjana'
  if (/^D[1-4]\b|DIPLOMA|AHLI (MADYA|MUDA|PRATAMA)/.test(k)) return 'Diploma'
  if (/SMA|SMK|STM|SMEA|\bMA\b|ALIYAH|SEDERAJAT/.test(k)) return 'SMK/SMA Sederajat'
  return ''
}

export const labelAsalInstitusi = (pendidikan: unknown): string =>
  normalisasiPendidikan(pendidikan) === 'SMK/SMA Sederajat' || !normalisasiPendidikan(pendidikan)
    ? 'Asal Sekolah'
    : 'Asal Kampus / Perguruan Tinggi'

// Jenis nomor dari baris DB: kolom jenis_nomor menang; warisan data lama
// diturunkan — NUPTK bila hanya NUPTK yang terisi.
export function jenisNomorDari(jenis: unknown, nip: unknown, nuptk: unknown): JenisNomor {
  const j = String(jenis || '').trim().toUpperCase()
  if (j === 'NUPTK' || j === 'NIP') return j
  return String(nuptk || '').trim() && !String(nip || '').trim() ? 'NUPTK' : 'NIP'
}

export const nomorAktif = (jenis: JenisNomor, nip: unknown, nuptk: unknown): string =>
  (jenis === 'NUPTK' ? String(nuptk || '') : String(nip || '')).trim()
