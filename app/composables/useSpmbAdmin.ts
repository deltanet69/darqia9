// Lapisan data Manajemen SPMB AdminV2.
//
// Sumber data fase ini = localStorage 'spmb27_regs' yang SAMA dengan yang
// ditulis formulir pendaftaran publik (useSpmbForm) — jadi data yang tampil
// di admin adalah data asli input orang tua/wali, bukan salinan kedua.
// Pendaftaran manual oleh admin TU ditulis ke array yang sama (via: 'Manual').
// Saat database SPMB disiapkan, hanya isi composable ini yang diganti ke API;
// komponen tidak berubah.
//
// Kontrak data publik hanya menyimpan TTL gabungan (s_ttl/o_ttl). Di sini
// setiap record dinormalisasi: tempat & tanggal lahir selalu tersedia sebagai
// field terpisah (dari field eksplisit bila ada, atau diurai dari s_ttl).

export const SPMB_STORAGE_KEY = 'spmb27_regs'
export const SPMB_KUOTA_KEY = 'spmb27_kuota'
export const SPMB_ROMBEL_KEY = 'spmb27_rombel'
export const SPMB_BIAYA = 'Rp50.000'
export const SPMB_TAHUN_AJARAN = '2027/2028'

export const SPMB_JURUSAN_SMK = [
  'Teknik Komputer & Jaringan',
  'Pengembangan Perangkat Lunak & Gim',
  'Desain Komunikasi Visual'
] as const

export const SPMB_STATUS = [
  'Menunggu verifikasi',
  'Pembayaran terverifikasi',
  'Diterima',
  'Ditolak'
] as const
export type SpmbStatus = (typeof SPMB_STATUS)[number]

export type SpmbJenjangKey = 'SMP' | 'SMK'

export interface SpmbRombel {
  nama: string
  jurusan?: string
  kap: number
}

export interface SpmbAdminRecord {
  id: string
  jenjang: string
  jurusan: string
  s_nama: string
  s_nisn: string
  s_jk: string
  s_ttl: string
  s_tempat: string
  s_tgl: string
  s_hp: string
  s_email: string
  s_sekolah: string
  s_alsekolah: string
  o_nama: string
  o_hub: string
  o_nik: string
  o_hp: string
  o_email: string
  o_ttl: string
  o_tempat: string
  o_tgl: string
  o_alamat: string
  waktu: string
  status: SpmbStatus
  via: 'Online' | 'Manual'
  oleh: string
  metode: string
  bukti: string
  kelas: string
  nis: string
  deleted: boolean
  bukti_path?: string
}

const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/** 'Bekasi, 14 Maret 2011' -> { tempat: 'Bekasi', tgl: '2011-03-14' } */
export function parseTtl(ttl: string): { tempat: string; tgl: string } {
  const teks = (ttl || '').trim()
  const idx = teks.lastIndexOf(', ')
  if (idx < 0) return { tempat: teks, tgl: '' }
  const tempat = teks.slice(0, idx).trim()
  const bagian = teks.slice(idx + 2).trim().split(/\s+/)
  if (bagian.length !== 3) return { tempat, tgl: '' }
  const hari = parseInt(bagian[0], 10)
  const bulan = BULAN_PANJANG.indexOf(bagian[1])
  const tahun = parseInt(bagian[2], 10)
  if (!hari || bulan < 0 || !tahun) return { tempat, tgl: '' }
  const mm = String(bulan + 1).padStart(2, '0')
  const dd = String(hari).padStart(2, '0')
  return { tempat, tgl: `${tahun}-${mm}-${dd}` }
}

/** Kebalikan parseTtl — format yang sama dengan formulir publik. */
export function gabungTtl(tempat: string, tglIso: string): string {
  const t = fmtTanggalPanjang(tglIso)
  if (!tempat) return t
  if (!tglIso) return tempat
  return `${tempat}, ${t}`
}

/** '2011-03-14' -> '14 Maret 2011' */
export function fmtTanggalPanjang(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${BULAN_PANJANG[d.getMonth()]} ${d.getFullYear()}`
}

/** ISO datetime -> '28 Okt 2026, 09.14' */
export function fmtWaktuSpmb(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${BULAN_SINGKAT[d.getMonth()]} ${d.getFullYear()}, ${hh}.${mm}`
}

export function jenjangKeyDari(r: { jenjang: string }): SpmbJenjangKey {
  return (r.jenjang || '').toUpperCase().startsWith('SMK') ? 'SMK' : 'SMP'
}

export function namaJenjangPenuh(key: SpmbJenjangKey): string {
  return key === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam'
}

function kanonStatus(s: string): SpmbStatus {
  const t = (s || '').trim().toLowerCase()
  if (t === 'pembayaran terverifikasi') return 'Pembayaran terverifikasi'
  if (t === 'diterima') return 'Diterima'
  if (t === 'ditolak') return 'Ditolak'
  return 'Menunggu verifikasi'
}

/** Samakan bentuk record mentah (dari formulir publik / input manual) ke bentuk admin. */
export function normalizeRecord(raw: Record<string, unknown>): SpmbAdminRecord {
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '')
  const sTtl = str('s_ttl')
  const oTtl = str('o_ttl')
  const sPisah = str('s_tempat') && str('s_tgl') ? { tempat: str('s_tempat'), tgl: str('s_tgl') } : parseTtl(sTtl)
  const oPisah = str('o_tempat') && str('o_tgl') ? { tempat: str('o_tempat'), tgl: str('o_tgl') } : parseTtl(oTtl)
  return {
    id: str('id'),
    jenjang: str('jenjang'),
    jurusan: str('jurusan'),
    s_nama: str('s_nama'),
    s_nisn: str('s_nisn'),
    s_jk: str('s_jk'),
    s_ttl: sTtl || gabungTtl(sPisah.tempat, sPisah.tgl),
    s_tempat: sPisah.tempat,
    s_tgl: sPisah.tgl,
    s_hp: str('s_hp'),
    s_email: str('s_email'),
    s_sekolah: str('s_sekolah'),
    s_alsekolah: str('s_alsekolah'),
    o_nama: str('o_nama'),
    o_hub: str('o_hub'),
    o_nik: str('o_nik'),
    o_hp: str('o_hp'),
    o_email: str('o_email'),
    o_ttl: oTtl || gabungTtl(oPisah.tempat, oPisah.tgl),
    o_tempat: oPisah.tempat,
    o_tgl: oPisah.tgl,
    o_alamat: str('o_alamat'),
    waktu: str('waktu'),
    status: kanonStatus(str('status')),
    via: str('via') === 'Manual' ? 'Manual' : 'Online',
    oleh: str('oleh'),
    metode: str('metode'),
    bukti: str('bukti'),
    kelas: str('kelas'),
    nis: str('nis'),
    deleted: raw.deleted === true,
    bukti_path: str('bukti_path')
  }
}

const strKolom = (row: Record<string, unknown>, k: string) => (typeof row[k] === 'string' ? (row[k] as string) : '')

/** Baris tabel spmb_registrations -> record admin. */
export function recordDariRow(row: Record<string, unknown>): SpmbAdminRecord {
  const pre: Record<string, unknown> = { ...row }
  pre.waktu = strKolom(row, 'created_at')
  pre.deleted = row.deleted_at != null
  const path = strKolom(row, 'bukti_path')
  pre.bukti = path ? path.split('/').pop() || path : strKolom(row, 'bukti')
  const r = normalizeRecord(pre)
  r.bukti_path = path
  return r
}

/** Record admin -> baris tabel spmb_registrations (untuk upsert). */
export function recordKeRow(r: SpmbAdminRecord): Record<string, unknown> {
  return {
    id: r.id,
    jenjang: r.jenjang,
    jurusan: r.jurusan || null,
    s_nama: r.s_nama,
    s_nisn: r.s_nisn,
    s_jk: r.s_jk || null,
    s_tempat: r.s_tempat || null,
    s_tgl: r.s_tgl || null,
    s_hp: r.s_hp || null,
    s_email: r.s_email || null,
    s_sekolah: r.s_sekolah || null,
    s_alsekolah: r.s_alsekolah || null,
    o_nama: r.o_nama || null,
    o_hub: r.o_hub || null,
    o_nik: r.o_nik || null,
    o_hp: r.o_hp || null,
    o_email: r.o_email || null,
    o_tempat: r.o_tempat || null,
    o_tgl: r.o_tgl || null,
    o_alamat: r.o_alamat || null,
    via: r.via,
    oleh: r.oleh || null,
    metode: r.metode || null,
    bukti_path: r.bukti_path || null,
    status: r.status,
    kelas: r.kelas || null,
    nis: r.nis || null,
    deleted_at: r.deleted ? new Date().toISOString() : null
  }
}

export function samarNik(nik: string): string {
  if (!nik || nik.length < 8) return nik || '-'
  return `${nik.slice(0, 4)}••••••••••${nik.slice(-2)}`
}

const HURUF_ID = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function genSpmbId(key: SpmbJenjangKey, sudahAda: Set<string>): string {
  let id = ''
  do {
    let acak = ''
    for (let i = 0; i < 6; i++) acak += HURUF_ID[Math.floor(Math.random() * HURUF_ID.length)]
    id = `SPMB27-${key}-${acak}`
  } while (sudahAda.has(id))
  return id
}

/** NIS berurutan per jenjang: SMK mulai 2700101, SMP mulai 2700201. */
export function nisBerikutnya(records: SpmbAdminRecord[], key: SpmbJenjangKey): string {
  const dasar = key === 'SMK' ? 2700100 : 2700200
  let maks = dasar
  for (const r of records) {
    if (jenjangKeyDari(r) !== key || !r.nis) continue
    const n = parseInt(r.nis, 10)
    if (!Number.isNaN(n) && n > maks) maks = n
  }
  return String(maks + 1)
}

export interface SpmbInputManual {
  s_nama: string
  s_nisn: string
  s_jk: string
  s_tempat: string
  s_tgl: string
  s_hp: string
  s_email: string
  s_sekolah: string
  s_alsekolah: string
  jurusan: string
  o_nama: string
  o_hub: string
  o_nik: string
  o_hp: string
  o_email: string
  o_tempat: string
  o_tgl: string
  o_alamat: string
  metode: string
  bukti: string
}

const emailOk = (v: string) => !v || v === '-' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

/** Validasi input manual — aturan yang sama dengan formulir publik + keunikan NISN per jenjang. */
export function validasiManual(input: SpmbInputManual, key: SpmbJenjangKey, records: SpmbAdminRecord[], abaikanId = ''): string {
  if (!input.s_nama.trim()) return 'Nama lengkap siswa wajib diisi.'
  if (!/^\d{10}$/.test(input.s_nisn)) return 'NISN harus tepat 10 digit angka.'
  const duplikat = records.some(r => !r.deleted && r.id !== abaikanId && jenjangKeyDari(r) === key && r.s_nisn === input.s_nisn)
  if (duplikat) return `NISN ${input.s_nisn} sudah terdaftar di jenjang ini. Periksa kembali — satu NISN hanya boleh satu pendaftaran.`
  if (!input.s_jk) return 'Jenis kelamin wajib dipilih.'
  if (key === 'SMK' && !(SPMB_JURUSAN_SMK as readonly string[]).includes(input.jurusan)) return 'Pilihan jurusan wajib dipilih.'
  if (!input.s_tempat.trim() || !input.s_tgl) return 'Tempat dan tanggal lahir siswa wajib diisi.'
  if (input.s_hp && input.s_hp !== '-' && !/^08\d{7,12}$/.test(input.s_hp)) return 'No. HP siswa tidak valid (awali 08).'
  if (!emailOk(input.s_email)) return 'Email aktif siswa tidak valid.'
  if (!input.s_sekolah.trim()) return 'Nama sekolah asal wajib diisi.'
  if (!input.s_alsekolah.trim()) return 'Alamat sekolah asal wajib diisi.'
  if (!input.o_nama.trim()) return 'Nama lengkap wali wajib diisi.'
  if (!['Ayah', 'Ibu', 'Wali'].includes(input.o_hub)) return 'Hubungan dengan siswa wajib dipilih.'
  if (!/^\d{16}$/.test(input.o_nik)) return 'NIK wali harus tepat 16 digit angka.'
  if (!/^08\d{7,12}$/.test(input.o_hp)) return 'No. HP/WA wali wajib diisi dan diawali 08.'
  if (!emailOk(input.o_email)) return 'Email aktif wali tidak valid.'
  if (!input.o_tempat.trim() || !input.o_tgl) return 'Tempat dan tanggal lahir wali wajib diisi.'
  if (!input.o_alamat.trim()) return 'Alamat tinggal wali wajib diisi.'
  if (input.metode !== 'Tunai di sekolah' && !input.bukti) return 'Bukti pembayaran wajib diupload untuk metode Transfer BSI / QRIS.'
  return ''
}

/**
 * Bagi rata siswa ke rombel: round-robin per kelompok (jurusan untuk SMK,
 * satu kelompok untuk SMP), menghormati kapasitas yang sudah terisi.
 * Mengembalikan pasangan {id, rombel} + daftar id yang tidak tertampung.
 */
export function bagiRataPenempatan(
  pool: SpmbAdminRecord[],
  rombelUntuk: (r: SpmbAdminRecord) => SpmbRombel[],
  terisi: Record<string, number>
): { pasangan: { id: string; rombel: string }[]; sisa: string[] } {
  const isi: Record<string, number> = { ...terisi }
  const pasangan: { id: string; rombel: string }[] = []
  const sisa: string[] = []
  const kelompok = new Map<string, SpmbAdminRecord[]>()
  for (const r of pool) {
    const kunci = rombelUntuk(r).map(x => x.nama).join('|') || 'SEMUA'
    if (!kelompok.has(kunci)) kelompok.set(kunci, [])
    kelompok.get(kunci)!.push(r)
  }
  for (const daftar of kelompok.values()) {
    const tujuan = rombelUntuk(daftar[0])
    let i = 0
    for (const r of daftar) {
      let ok = false
      for (let j = 0; j < tujuan.length; j++) {
        const rb = tujuan[(i + j) % tujuan.length]
        if ((isi[rb.nama] || 0) < rb.kap) {
          pasangan.push({ id: r.id, rombel: rb.nama })
          isi[rb.nama] = (isi[rb.nama] || 0) + 1
          i++
          ok = true
          break
        }
      }
      if (!ok) sisa.push(r.id)
    }
  }
  return { pasangan, sisa }
}

export function csvSpmb(records: SpmbAdminRecord[]): string {
  const head = ['ID', 'Sumber', 'Diinput Oleh', 'Nama Siswa', 'NISN', 'Jenis Kelamin', 'Tempat Lahir Siswa', 'Tanggal Lahir Siswa', 'HP Siswa', 'Email Siswa', 'Asal Sekolah', 'Alamat Sekolah', 'Jurusan', 'Nama Orang Tua', 'Hubungan', 'NIK Orang Tua', 'HP Orang Tua', 'Email Orang Tua', 'Tempat Lahir Wali', 'Tanggal Lahir Wali', 'Alamat Tinggal Wali', 'Metode Bayar', 'Waktu Daftar', 'Status', 'Kelas Penempatan', 'NIS']
  const rows = records.map(x => [x.id, x.via, x.oleh || '—', x.s_nama, x.s_nisn, x.s_jk, x.s_tempat, fmtTanggalPanjang(x.s_tgl), x.s_hp, x.s_email, x.s_sekolah, x.s_alsekolah, x.jurusan || '-', x.o_nama, x.o_hub, x.o_nik, x.o_hp, x.o_email, x.o_tempat, fmtTanggalPanjang(x.o_tgl), x.o_alamat, x.metode || '-', x.waktu, x.status, x.kelas || '-', x.nis || '-'])
  return [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
}

export function rombelBawaan(): Record<SpmbJenjangKey, SpmbRombel[]> {
  return {
    SMK: [
      { nama: 'X TKJ 1', jurusan: 'Teknik Komputer & Jaringan', kap: 36 },
      { nama: 'X TKJ 2', jurusan: 'Teknik Komputer & Jaringan', kap: 36 },
      { nama: 'X PPLG 1', jurusan: 'Pengembangan Perangkat Lunak & Gim', kap: 36 },
      { nama: 'X DKV 1', jurusan: 'Desain Komunikasi Visual', kap: 36 }
    ],
    SMP: [
      { nama: 'VII A', kap: 32 },
      { nama: 'VII B', kap: 32 },
      { nama: 'VII C', kap: 32 }
    ]
  }
}

export function useSpmbAdmin() {
  const records = useState<SpmbAdminRecord[]>('spmb-admin-records', () => [])
  const termuat = useState<boolean>('spmb-admin-termuat', () => false)
  const kuota = useState<Record<SpmbJenjangKey, number>>('spmb-admin-kuota', () => ({ SMP: 150, SMK: 150 }))
  const rombel = useState<Record<SpmbJenjangKey, SpmbRombel[]>>('spmb-admin-rombel', () => rombelBawaan())

  function muat() {
    if (termuat.value || typeof localStorage === 'undefined') return
    try {
      const mentah = JSON.parse(localStorage.getItem(SPMB_STORAGE_KEY) || '[]') as Record<string, unknown>[]
      records.value = mentah.map(normalizeRecord)
    } catch { records.value = [] }
    try {
      const k = JSON.parse(localStorage.getItem(SPMB_KUOTA_KEY) || 'null') as Record<SpmbJenjangKey, number> | null
      if (k && typeof k.SMP === 'number' && typeof k.SMK === 'number') kuota.value = k
    } catch { /* abaikan */ }
    try {
      const rb = JSON.parse(localStorage.getItem(SPMB_ROMBEL_KEY) || 'null') as Record<SpmbJenjangKey, SpmbRombel[]> | null
      if (rb && Array.isArray(rb.SMP) && Array.isArray(rb.SMK)) rombel.value = rb
    } catch { /* abaikan */ }
    termuat.value = true
    void muatDariDb()
  }

  // Database pusat adalah sumber utama: hasil baca Supabase menggantikan
  // data lokal untuk ID yang sama; data lokal yang belum ada di database
  // (pendaftaran lama / cadangan luring) tetap ditampilkan.
  async function muatDariDb() {
    try {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('spmb_registrations')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        const dariDb = (data as Record<string, unknown>[]).map(recordDariRow)
        const idDb = new Set(dariDb.map(r => r.id))
        records.value = [...dariDb, ...records.value.filter(r => !idDb.has(r.id))]
      }
      const { data: st } = await supabase.from('spmb_settings').select('key, value')
      if (st) {
        for (const row of st as { key: string; value: unknown }[]) {
          if (row.key === 'kuota' && row.value && typeof row.value === 'object') kuota.value = row.value as Record<SpmbJenjangKey, number>
          if (row.key === 'rombel' && row.value && typeof row.value === 'object') rombel.value = row.value as Record<SpmbJenjangKey, SpmbRombel[]>
        }
      }
    } catch { /* tetap memakai data lokal */ }
  }

  // Tulis satu record ke database (insert bila baru, update bila sudah ada).
  async function simpanRecordDb(r: SpmbAdminRecord) {
    try {
      const supabase = useSupabaseClient()
      const { error } = await supabase.from('spmb_registrations').upsert(recordKeRow(r), { onConflict: 'id' })
      if (error) console.warn('SPMB admin: gagal menulis ke database.', error.message)
    } catch { /* abaikan — data tetap tersimpan lokal */ }
  }

  function simpan() {
    if (typeof localStorage === 'undefined') return
    try { localStorage.setItem(SPMB_STORAGE_KEY, JSON.stringify(records.value)) } catch { /* abaikan */ }
  }

  function simpanPengaturan() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(SPMB_KUOTA_KEY, JSON.stringify(kuota.value))
        localStorage.setItem(SPMB_ROMBEL_KEY, JSON.stringify(rombel.value))
      } catch { /* abaikan */ }
    }
    void (async () => {
      try {
        const supabase = useSupabaseClient()
        await supabase.from('spmb_settings').upsert([
          { key: 'kuota', value: kuota.value },
          { key: 'rombel', value: rombel.value }
        ], { onConflict: 'key' })
      } catch { /* abaikan */ }
    })()
  }

  return { records, termuat, kuota, rombel, muat, simpan, simpanPengaturan, simpanRecordDb }
}
