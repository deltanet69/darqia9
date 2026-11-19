// Export/import jadwal ujian per ruang (Excel). Hanya baca/tulis berkas; pencocokan mapel & pengawas
// serta validasi jadwal dikerjakan form Atur Jadwal (CbtV2RoomDetail) sebelum apa pun disimpan.
import { jamIsian, tanggalIsian } from '../composables/ruangUjianCore.ts'

export interface BarisExcelJadwal { tanggal: string, mulai: string, selesai: string, mapel: string, pengawas: string }

const KOLOM = ['No', 'Tanggal (dd-mm-yyyy)', 'Jam Mulai', 'Jam Selesai', 'Mata Pelajaran', 'Pengawas']
const kunci = (v: unknown) => String(v ?? '').toUpperCase().replace(/[^A-Z]/g, '')

export const eksporJadwalRuang = async (namaFile: string, baris: BarisExcelJadwal[], mapel: string[], guru: string[]) => {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const dmy = (iso: string) => iso.split('-').reverse().join('-')
  const ws = XLSX.utils.aoa_to_sheet([KOLOM, ...baris.map((b, i) => [i + 1, dmy(b.tanggal), b.mulai, b.selesai, b.mapel, b.pengawas])])
  ws['!cols'] = [6, 22, 11, 11, 30, 30].map(wch => ({ wch }))
  XLSX.utils.book_append_sheet(wb, ws, 'Jadwal')
  // Daftar nama yang dikenali sistem, agar isian Mata Pelajaran & Pengawas ditulis persis.
  const ref = XLSX.utils.aoa_to_sheet([['Mata Pelajaran', 'Pengawas'], ...Array.from({ length: Math.max(mapel.length, guru.length) }, (_, i) => [mapel[i] ?? '', guru[i] ?? ''])])
  ref['!cols'] = [{ wch: 30 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, ref, 'Referensi')
  XLSX.writeFile(wb, namaFile)
}

export const bacaJadwalRuang = async (file: File): Promise<BarisExcelJadwal[]> => {
  if (!file.name.toLowerCase().endsWith('.xlsx')) throw new Error('Gunakan berkas Excel .xlsx hasil Export jadwal.')
  const XLSX = await import('xlsx')
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const ws = wb.Sheets.Jadwal ?? wb.Sheets[wb.SheetNames[0] ?? '']
  if (!ws) throw new Error('Sheet "Jadwal" tidak ditemukan.')
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', raw: true })
  const h = rows.findIndex(r => r.some(c => kunci(c).startsWith('TANGGAL')) && r.some(c => kunci(c) === 'MATAPELAJARAN'))
  if (h < 0) throw new Error('Kolom jadwal tidak ditemukan. Jangan mengubah nama kolom hasil Export.')
  const kol = (awal: string) => rows[h]!.findIndex(c => kunci(c).startsWith(awal))
  const [iT, iM, iS, iP, iG] = [kol('TANGGAL'), kol('JAMMULAI'), kol('JAMSELESAI'), kol('MATAPELAJARAN'), kol('PENGAWAS')]
  if ([iT, iM, iS, iP].some(i => i < 0)) throw new Error('Kolom Tanggal, Jam Mulai, Jam Selesai, dan Mata Pelajaran wajib ada.')
  const hasil = rows.slice(h + 1)
    .filter(r => [iT, iM, iS, iP].some(i => String(r[i] ?? '').trim()))
    .map(r => ({
      tanggal: tanggalIsian(r[iT]), mulai: jamIsian(r[iM]), selesai: jamIsian(r[iS]),
      mapel: String(r[iP] ?? '').trim(), pengawas: iG < 0 ? '' : String(r[iG] ?? '').trim()
    }))
  if (!hasil.length) throw new Error('Berkas tidak berisi baris jadwal.')
  if (hasil.length > 50) throw new Error('Maksimal 50 baris jadwal per ruang dalam satu kali impor.')
  return hasil
}
