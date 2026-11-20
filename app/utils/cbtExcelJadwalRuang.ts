// Export jadwal ujian per ruang (Excel). Jadwal dibuat di Daftar Ujian; ruang hanya menugaskan pengawas.
export interface BarisExcelJadwal { tanggal: string, mulai: string, selesai: string, mapel: string, pengawas: string }

const KOLOM = ['No', 'Tanggal (dd-mm-yyyy)', 'Jam Mulai', 'Jam Selesai', 'Mata Pelajaran', 'Pengawas']

export const eksporJadwalRuang = async (namaFile: string, baris: BarisExcelJadwal[]) => {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const dmy = (iso: string) => iso.split('-').reverse().join('-')
  const ws = XLSX.utils.aoa_to_sheet([KOLOM, ...baris.map((b, i) => [i + 1, dmy(b.tanggal), b.mulai, b.selesai, b.mapel, b.pengawas])])
  ws['!cols'] = [6, 22, 11, 11, 30, 30].map(wch => ({ wch }))
  XLSX.utils.book_append_sheet(wb, ws, 'Jadwal')
  XLSX.writeFile(wb, namaFile)
}
