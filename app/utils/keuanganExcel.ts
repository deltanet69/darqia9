import type { Grade, PaketKeuangan, PenetapanSiswa, SiswaInduk } from '~/composables/keuanganCore'

// Template, ekspor, dan impor Excel Kode Keuangan. Satu file, dua sheet:
//   "Master Kode" : Kode, Nama Paket, nominal 4 tingkat, Aktif
//   "Kode Siswa"  : NIS, Nama, Kelas (hanya informasi), Kode, biaya tambahan 4 tingkat
// Parser murni (tanpa XLSX) agar bisa diuji; pembacaan file ada di bacaExcelKeuangan.

export const SHEET_MASTER = 'Master Kode'
export const SHEET_SISWA = 'Kode Siswa'

type Sel = string | number
type Tingkat4 = [number, number, number, number]

export interface BarisImpor<T> {
  baris: number
  label: string
  status: 'siap' | 'gagal' | 'dilewati'
  alasan: string
  data: T | null
  baru?: boolean
}
export interface HasilImpor {
  master: BarisImpor<PaketKeuangan>[]
  siswa: BarisImpor<{ nis: string, kode: string, tambahan: Tingkat4 }>[]
}
export interface KonteksImpor {
  grade: Grade
  kodeAda: Set<string> // kode master yang sudah ada di jenjang ini
  nisInduk: Set<string> // NIS siswa aktif jenjang ini di Data Induk
}

const bersih = (v: unknown) => String(v ?? '').trim()

// Angka rupiah: sel angka Excel, atau teks seperti "7.625.000" / "Rp 7.625.000". Kosong = 0; tidak valid = null.
const angkaRupiah = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? Math.round(v) : null
  const teks = bersih(v)
  if (!teks) return 0
  if (/^-/.test(teks)) return null
  const digit = teks.replace(/[^0-9]/g, '')
  return digit ? Number(digit) : null
}
const tingkat4 = (sel: unknown[]): Tingkat4 | null => {
  const n = [0, 1, 2, 3].map(i => angkaRupiah(sel[i]))
  return n.some(v => v === null) ? null : n as Tingkat4
}
const ya = (v: unknown) => !/^(tidak|nonaktif|0|false|tdk)$/i.test(bersih(v))

export const headerMaster = (label: string[]): string[] =>
  ['Kode', 'Nama Paket', ...label.slice(0, 3).map(l => `Nominal ${l}`), 'Nominal Tingkat Akhir', 'Aktif (Ya/Tidak)']
export const headerSiswa = (label: string[]): string[] =>
  ['NIS', 'Nama Siswa (info)', 'Kelas (info)', 'Kode Keuangan', ...label.slice(0, 3).map(l => `Tambahan ${l}`), 'Tambahan Tingkat Akhir']

export const aoaMaster = (label: string[], paket: PaketKeuangan[]): Sel[][] => [
  headerMaster(label),
  ...paket.map(p => [p.kode, p.nama, ...p.nominal, p.aktif ? 'Ya' : 'Tidak'])
]

export const aoaSiswa = (label: string[], siswa: SiswaInduk[], penetapan: PenetapanSiswa[]): Sel[][] => {
  const tetap = new Map(penetapan.map(p => [p.nis, p]))
  return [
    headerSiswa(label),
    ...siswa.slice().sort((a, b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama)).map(s => {
      const t = tetap.get(s.nis)
      return [s.nis, s.nama, s.kelas, t?.kode ?? '', ...(t?.tambahan ?? [0, 0, 0, 0])]
    })
  ]
}

// Cari baris judul (sel pertama memuat teks tertentu) lalu kembalikan baris datanya beserta nomor barisnya di Excel.
const dataSetelahJudul = (aoa: unknown[][], kata: string): Array<{ baris: number, sel: unknown[] }> => {
  const judul = aoa.findIndex(row => bersih(row[0]).toLowerCase().includes(kata))
  if (judul === -1) return []
  return aoa.slice(judul + 1)
    .map((sel, i) => ({ baris: judul + i + 2, sel }))
    .filter(r => r.sel.some(c => bersih(c) !== ''))
}

export function parseKeuangan(masterAoa: unknown[][], siswaAoa: unknown[][], ctx: KonteksImpor): HasilImpor {
  const master: HasilImpor['master'] = []
  const kodeMaster = new Set<string>()
  for (const { baris, sel } of dataSetelahJudul(masterAoa, 'kode')) {
    const kode = bersih(sel[0])
    const nama = bersih(sel[1])
    const gagal = (alasan: string) => master.push({ baris, label: kode || `Baris ${baris}`, status: 'gagal', alasan, data: null })
    if (!kode) { gagal('Kode kosong'); continue }
    if (!nama) { gagal('Nama paket kosong'); continue }
    if (kodeMaster.has(kode)) { master.push({ baris, label: kode, status: 'dilewati', alasan: 'Kode ganda di dalam file', data: null }); continue }
    const nominal = tingkat4(sel.slice(2, 6))
    if (!nominal) { gagal('Nominal harus berupa angka rupiah (tidak boleh negatif)'); continue }
    kodeMaster.add(kode)
    master.push({
      baris, label: kode, status: 'siap', alasan: '', baru: !ctx.kodeAda.has(kode),
      data: { kode, nama, grade: ctx.grade, nominal, aktif: ya(sel[6]) }
    })
  }

  const siswa: HasilImpor['siswa'] = []
  const nisTerbaca = new Set<string>()
  for (const { baris, sel } of dataSetelahJudul(siswaAoa, 'nis')) {
    const nis = bersih(sel[0])
    const kode = bersih(sel[3])
    const label = nis ? `${nis}${bersih(sel[1]) ? ' · ' + bersih(sel[1]) : ''}` : `Baris ${baris}`
    const gagal = (alasan: string) => siswa.push({ baris, label, status: 'gagal', alasan, data: null })
    if (!nis) { gagal('NIS kosong'); continue }
    if (!kode) { siswa.push({ baris, label, status: 'dilewati', alasan: 'Kode keuangan belum diisi', data: null }); continue }
    if (!ctx.nisInduk.has(nis)) { gagal('NIS tidak ditemukan di Data Induk siswa aktif jenjang ini'); continue }
    if (nisTerbaca.has(nis)) { siswa.push({ baris, label, status: 'dilewati', alasan: 'NIS ganda di dalam file', data: null }); continue }
    if (!ctx.kodeAda.has(kode) && !kodeMaster.has(kode)) { gagal(`Kode "${kode}" belum ada di master maupun di sheet ${SHEET_MASTER}`); continue }
    const tambahan = tingkat4(sel.slice(4, 8))
    if (!tambahan) { gagal('Biaya tambahan harus berupa angka rupiah (tidak boleh negatif)'); continue }
    nisTerbaca.add(nis)
    siswa.push({ baris, label, status: 'siap', alasan: '', data: { nis, kode, tambahan } })
  }
  return { master, siswa }
}

export async function bacaExcelKeuangan(file: File, ctx: KonteksImpor): Promise<HasilImpor> {
  if (!file.name.toLowerCase().endsWith('.xlsx')) throw new Error('Gunakan file Excel berformat .xlsx dari template.')
  const XLSX = await import('xlsx')
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  if (!wb.Sheets[SHEET_MASTER] && !wb.Sheets[SHEET_SISWA]) {
    throw new Error(`Sheet "${SHEET_MASTER}" atau "${SHEET_SISWA}" tidak ditemukan. Gunakan template resmi.`)
  }
  const baca = (nama: string) => wb.Sheets[nama] ? XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[nama], { header: 1, defval: '' }) : []
  return parseKeuangan(baca(SHEET_MASTER), baca(SHEET_SISWA), ctx)
}

// Unduh template sekaligus ekspor: berisi data saat ini, jadi admin cukup mengisi/mengubah kolom Kode lalu mengunggah.
export async function unduhExcelKeuangan(grade: Grade, label: string[], paket: PaketKeuangan[], siswa: SiswaInduk[], penetapan: PenetapanSiswa[]) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const lembar = (aoa: Sel[][], lebar: number[]) => {
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = lebar.map(wch => ({ wch }))
    return ws
  }
  XLSX.utils.book_append_sheet(wb, lembar(aoaMaster(label, paket), [14, 34, 18, 18, 18, 22, 16]), SHEET_MASTER)
  XLSX.utils.book_append_sheet(wb, lembar(aoaSiswa(label, siswa, penetapan), [16, 32, 16, 16, 18, 18, 18, 22]), SHEET_SISWA)
  XLSX.writeFile(wb, `kode-keuangan-${grade.toLowerCase()}.xlsx`)
}
