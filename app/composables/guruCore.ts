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

// ===== Impor CSV Data Induk Guru =====
// Tanggal lahir -> YYYY-MM-DD (tipe DATE Postgres). Dikenali: yyyy-mm-dd, dd/mm/yyyy, dd-mm-yyyy,
// dan "25 Juli 1985" (bulan Indonesia/Inggris, lengkap atau singkat — format hasil Google Sheets).
// null bila tidak dikenali atau tidak ada di kalender.
const BULAN: Record<string, number> = {
  januari: 1, jan: 1, january: 1, februari: 2, pebruari: 2, feb: 2, february: 2, maret: 3, mar: 3, march: 3,
  april: 4, apr: 4, mei: 5, may: 5, juni: 6, jun: 6, june: 6, juli: 7, jul: 7, july: 7,
  agustus: 8, agu: 8, agt: 8, aug: 8, august: 8, september: 9, sep: 9, sept: 9,
  oktober: 10, okt: 10, oct: 10, october: 10, november: 11, nopember: 11, nov: 11, desember: 12, des: 12, dec: 12, december: 12
}

export function tanggalLahirIso(teks: unknown): string | null {
  const t = String(teks || '').trim()
  let y: number, mo: number, d: number
  let m: RegExpExecArray | null
  if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t))) { y = +m[1]; mo = +m[2]; d = +m[3] }
  else if ((m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(t))) { d = +m[1]; mo = +m[2]; y = +m[3] }
  else if ((m = /^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/.exec(t))) {
    d = +m[1]; y = +m[3]
    mo = BULAN[m[2].toLowerCase()]
    if (!mo) return null
  } else return null
  const tgl = new Date(Date.UTC(y, mo - 1, d))
  if (tgl.getUTCFullYear() !== y || tgl.getUTCMonth() !== mo - 1 || tgl.getUTCDate() !== d) return null
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export interface GuruImpor {
  name: string; nik: string; nuptk: string; nip: string; jenisNomor: JenisNomor
  phone: string; email: string; birthPlace: string; birthDate: string
  address: string; kelurahan: string; kecamatan: string; kabKota: string
  education: string; asalInstitusi: string; unit: 'SMP' | 'SMK' | 'Yayasan'
  role: string; subject: string; status: 'Aktif' | 'Tidak Aktif'; rfidUid: string
  gender?: 'Laki laki' | 'Perempuan'
}

const EMAIL_SAH = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Baca CSV guru. Satu galat per baris; baris bermasalah tidak pernah masuk diam-diam
// (NIK notasi ilmiah Excel, tanggal tak dikenal, duplikat dalam berkas).
export function parseCsvGuru(isi: string, unitBawaan: 'SMP' | 'SMK'): { rows: GuruImpor[]; galat: string[] } {
  if (/^PK\u0003\u0004/.test(isi) || isi.includes('\u0000')) {
    return { rows: [], galat: ['Berkas Excel (.xlsx/.xls) tidak dapat dibaca langsung. Buka di Excel, lalu simpan sebagai CSV (UTF-8).'] }
  }
  const baris = isi.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n').filter(l => l.trim())
  if (baris.length < 2) return { rows: [], galat: ['Berkas minimal harus memiliki 1 baris judul dan 1 baris data guru.'] }

  const pemisah = (baris[0].match(/;/g) || []).length > (baris[0].match(/,/g) || []).length ? ';' : ','
  const pecah = (line: string): string[] => {
    const hasil: string[] = []
    let cur = ''
    let kutip = false
    for (const ch of line) {
      if (ch === '"') kutip = !kutip
      else if (ch === pemisah && !kutip) { hasil.push(cur.trim()); cur = '' }
      else cur += ch
    }
    hasil.push(cur.trim())
    return hasil
  }

  const judul = pecah(baris[0]).map(h => h.replace('\uFEFF', '').trim().toLowerCase())
  const rows: GuruImpor[] = []
  const galat: string[] = []
  const nikAda = new Set<string>()
  const nipAda = new Set<string>()
  const emailAda = new Set<string>()

  for (let i = 1; i < baris.length; i++) {
    const cols = pecah(baris[i])
    const ambil = (...nama: string[]) => {
      const idx = judul.findIndex(h => nama.includes(h))
      const v = idx >= 0 ? (cols[idx] || '').trim() : ''
      return v === '-' ? '' : v
    }
    const no = i + 1
    const name = ambil('nama guru', 'nama lengkap')
    const nik = ambil('nik').replace(/\s+/g, '')
    const nuptk = ambil('nuptk').replace(/\s+/g, '')
    const nip = ambil('nip').replace(/\s+/g, '')
    const email = ambil('alamat email').toLowerCase()
    const tglMentah = ambil('tgl lahir')
    const birthDate = tglMentah ? tanggalLahirIso(tglMentah) : ''

    const angkaSalah = [['NIK', nik], ['NUPTK', nuptk], ['NIP', nip]].find(([, v]) => v && !/^\d+$/.test(v))
    const masalah =
      !name ? 'nama guru wajib diisi.'
        : (!nip && !nik) ? 'NIP atau NIK wajib diisi.'
          : !EMAIL_SAH.test(email) ? 'alamat email tidak valid.'
            : angkaSalah ? `${angkaSalah[0]} hanya boleh berisi angka (cek format sel di Excel, jangan notasi ilmiah seperti 3,2E+15).`
              : birthDate === null ? `format tanggal lahir "${tglMentah}" tidak dikenali (gunakan dd/mm/yyyy).`
                : (nik && nikAda.has(nik)) ? `NIK ${nik} duplikat dalam berkas.`
                  : (nip && nipAda.has(nip)) ? `NIP ${nip} duplikat dalam berkas.`
                    : emailAda.has(email) ? `email ${email} duplikat dalam berkas.` : ''
    if (masalah) { galat.push(`Baris ${no}: ${masalah}`); continue }
    if (nik) nikAda.add(nik)
    if (nip) nipAda.add(nip)
    emailAda.add(email)

    const unitMentah = ambil('unit', 'unit sekolah')
    const unitDikenal = /\bSMP|\bSMK|YAYASAN/i.test(unitMentah)
    const pendMentah = ambil('pendidikan terakhir')
    const statusMentah = ambil('status', 'status kepegawaian').toLowerCase()
    const jk = ambil('jenis kelamin').toUpperCase()
    rows.push({
      name, nik, nuptk, nip,
      jenisNomor: jenisNomorDari(ambil('jenis nomor'), nip, nuptk),
      phone: ambil('no telp/wa'), email,
      birthPlace: ambil('tempat lahir'), birthDate: birthDate || '',
      address: ambil('alamat'), kelurahan: ambil('kelurahan'), kecamatan: ambil('kecamatan'), kabKota: ambil('kab/kota'),
      education: normalisasiPendidikan(pendMentah) || pendMentah,
      asalInstitusi: ambil('asal institusi', 'asal sekolah', 'asal kampus') || (unitMentah && !unitDikenal ? unitMentah : ''),
      unit: /\bSMP/i.test(unitMentah) ? 'SMP' : /YAYASAN/i.test(unitMentah) ? 'Yayasan' : /\bSMK/i.test(unitMentah) ? 'SMK' : unitBawaan,
      role: ambil('jabatan guru', 'jabatan', 'jabatan & tugas') || 'Guru',
      subject: ambil('bidang studi/jurusan', 'bidang studi', 'jurusan', 'mapel utama'),
      status: ['tidak aktif', 'nonaktif', 'inactive'].includes(statusMentah) ? 'Tidak Aktif' : 'Aktif',
      rfidUid: ambil('rfid uid'),
      gender: jk ? (jk === 'PRIA' || jk.startsWith('L') ? 'Laki laki' : 'Perempuan') : undefined
    })
  }

  if (!galat.length && !rows.length) galat.push('Tidak ada baris data guru yang valid terbaca dari file.')
  return { rows, galat }
}

// Terjemahan galat database saat menyimpan guru -> tindakan yang bisa langsung dilakukan.
export function pesanGalatDb(pesan: string): string {
  const m = String(pesan || '')
  if (/null value in column "nip"/i.test(m)) return 'Kolom NIP di database masih wajib diisi. Jalankan supabase/migrations/0008_nip_opsional_guru.sql di Supabase SQL Editor.'
  if (/row-level security/i.test(m)) return 'Ditolak kebijakan keamanan database (RLS). Pastikan migrasi 0007_update_data_induk_guru.sql sudah dijalankan.'
  if (/teachers_nik|\(nik\)|nik_key/i.test(m)) return 'NIK sudah dipakai guru lain.'
  if (/teachers_nip|\(nip\)|nip_key/i.test(m)) return 'NIP sudah dipakai guru lain.'
  if (/teachers_grade_check/i.test(m)) return 'Unit sekolah harus SMP, SMK, atau Yayasan.'
  return m
}
