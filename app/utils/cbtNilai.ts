// Nilai Siswa admin: satu baris per penugasan (siswa x ujian) dari RPC cbt_rekap_nilai (migrasi 0089).
export interface NilaiPenugasan {
  id: string
  examId: string
  studentId: string
  nama: string
  nis: string | null
  nisn: string | null
  status: 'belum_mulai' | 'berlangsung' | 'terkunci' | 'selesai'
  submittedAt: string | null
  totalSoal: number
  objektif: number
  esai: number
  esaiSoal: number
  menunggu: number
  nilai: number | null
}

export type StatusNilai = 'Tuntas' | 'Remedial' | 'Perlu Koreksi' | 'Belum Selesai' | 'Tidak Ikut'

// ujianBerakhir: jadwal ujian sudah lewat (siswa yang belum mulai = tidak ikut).
export const statusNilai = (r: Pick<NilaiPenugasan, 'status' | 'menunggu' | 'nilai'>, kkm: number, ujianBerakhir: boolean): StatusNilai => {
  if (r.status !== 'selesai') return ujianBerakhir && r.status === 'belum_mulai' ? 'Tidak Ikut' : 'Belum Selesai'
  if (r.menunggu > 0) return 'Perlu Koreksi'
  return (r.nilai ?? 0) >= kkm ? 'Tuntas' : 'Remedial'
}

// Semester tahun ajaran dari tanggal ujian, sama dengan ujian_harian_semester (0090): Juli-Desember = 1, Januari-Juni = 2.
export const kunciSemester = (iso: string) => {
  const d = new Date(iso)
  const ganjil = d.getMonth() >= 6
  return `${ganjil ? d.getFullYear() : d.getFullYear() - 1}-${ganjil ? 1 : 2}`
}

// Nomor Nilai Tugas yang sudah dipakai ujian lain di kelas + mapel + semester yang sama (nomor -> nama ujian).
export const tugasTerpakai = (
  ujian: { id: string, classId?: string, subjectId?: string, startsAt?: string, tugasKe?: number | null, name: string }[],
  isi: { id?: string, classId: string, subjectId: string, startsAt: string }
) => new Map(ujian
  .filter(e => e.id !== isi.id && e.tugasKe && e.classId === isi.classId && e.subjectId === isi.subjectId
    && e.startsAt && isi.startsAt && kunciSemester(e.startsAt) === kunciSemester(isi.startsAt))
  .map(e => [e.tugasKe!, e.name]))

export const rekapNilai =(baris: { status: StatusNilai, nilai: number | null }[]) => {
  const dinilai = baris.filter(b => b.status === 'Tuntas' || b.status === 'Remedial')
  return {
    peserta: baris.length,
    dinilai: dinilai.length,
    tuntas: dinilai.filter(b => b.status === 'Tuntas').length,
    perluKoreksi: baris.filter(b => b.status === 'Perlu Koreksi').length,
    rata: dinilai.length ? Math.round(dinilai.reduce((n, b) => n + (b.nilai ?? 0), 0) / dinilai.length * 10) / 10 : null
  }
}
