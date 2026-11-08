// Logika murni Ruang Ujian (tanpa Vue/Supabase) agar mudah dites.
export const JENIS_PERIODE = ['PTS Ganjil', 'PAS Ganjil', 'PTS Genap', 'PAS Genap'] as const

export interface ProgresRow {
  student_id: string
  student_name: string
  nis: string | null
  class_name: string | null
  exam_id: string | null
  exam_name: string | null
  subject_name: string | null
  assignment_id: string | null
  status: string
  answered: number
  total: number
  violations: number
  token: string | null
}

// Opsi periode = jenis ujian pada tahun ajaran aktif + semua periode yang pernah dibuat (riwayat/arsip).
export function periodeOpsi(tahunAjaran: string, riwayat: string[]): string[] {
  const baru = JENIS_PERIODE.map(jenis => `${jenis} ${tahunAjaran}`)
  // Arsip: tahun ajaran terbaru dulu, di dalam tahun mengikuti urutan jenis ujian.
  const tahunDari = (p: string) => p.replace(/^\S+\s+\S+\s+/, '')
  const urutJenis = (p: string) => JENIS_PERIODE.findIndex(jenis => p.startsWith(jenis))
  const arsip = [...new Set(riwayat)].filter(p => !baru.includes(p))
    .sort((a, b) => tahunDari(b).localeCompare(tahunDari(a)) || urutJenis(a) - urutJenis(b))
  return [...baru, ...arsip]
}

export const persenProgres = (answered: number, total: number): number =>
  total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0

export function labelStatus(status: string): string {
  return status === 'selesai' ? 'Selesai' : status === 'terkunci' ? 'Terkunci'
    : status === 'berlangsung' ? 'Mengerjakan' : 'Belum mulai'
}

export function labelPelanggaran(jenis: string): string {
  const peta: Record<string, string> = {
    pindah_tab: 'Pindah tab', alt_tab: 'Alt + Tab', tutup_browser: 'Tutup browser',
    multi_window: 'Banyak jendela', multi_screen: 'Banyak layar', split_screen: 'Layar terbagi'
  }
  return peta[jenis] ?? 'Pelanggaran lain'
}

export function validasiRuang(input: { name: string, capacity: number }): string | null {
  if (!input.name.trim()) return 'Nama ruang wajib diisi.'
  if (!Number.isInteger(input.capacity) || input.capacity < 1 || input.capacity > 60) return 'Kapasitas ruang harus 1 sampai 60 siswa.'
  return null
}

// Satu baris per siswa untuk ujian terpilih (satu ujian ruang = beberapa ujian kelas dengan jadwal sama).
// Siswa yang kelasnya tidak punya ujian itu tetap tampil sebagai belum mulai.
export function barisSiswa(rows: ProgresRow[], examIds: string[] | null): ProgresRow[] {
  const hasil = new Map<string, ProgresRow>()
  for (const row of rows) {
    if (examIds && !(row.exam_id && examIds.includes(row.exam_id))) continue
    if (!hasil.has(row.student_id)) hasil.set(row.student_id, row)
  }
  for (const row of rows) {
    if (!hasil.has(row.student_id)) {
      hasil.set(row.student_id, { ...row, exam_id: null, exam_name: null, subject_name: null, assignment_id: null, status: 'belum_mulai', answered: 0, total: 0, violations: 0, token: null })
    }
  }
  return [...hasil.values()]
}

export function ringkasProgres(baris: ProgresRow[]) {
  const hitung = (status: string) => baris.filter(r => r.exam_id && r.status === status).length
  const denganUjian = baris.filter(r => r.exam_id)
  const rata = denganUjian.length
    ? Math.round(denganUjian.reduce((sum, r) => sum + persenProgres(r.answered, r.total), 0) / denganUjian.length)
    : 0
  return {
    siswa: baris.length,
    belumMulai: baris.length - hitung('berlangsung') - hitung('selesai') - hitung('terkunci'),
    mengerjakan: hitung('berlangsung'),
    selesai: hitung('selesai'),
    terkunci: hitung('terkunci'),
    pelanggaran: baris.reduce((sum, r) => sum + r.violations, 0),
    rataProgres: rata
  }
}

export function komposisiKelas(kelas: (string | null)[]): { kelas: string, jumlah: number }[] {
  const peta = new Map<string, number>()
  for (const nama of kelas) peta.set(nama || 'Tanpa kelas', (peta.get(nama || 'Tanpa kelas') ?? 0) + 1)
  return [...peta.entries()].map(([kelas, jumlah]) => ({ kelas, jumlah })).sort((a, b) => b.jumlah - a.jumlah || a.kelas.localeCompare(b.kelas))
}

export interface JadwalUjian { subjectId?: string, startsAt?: string, duration: number }

// Satu ruang hanya boleh satu mapel pada satu jadwal: ujian yang jamnya beririsan harus
// sama persis (mapel, jam mulai, durasi). Mengembalikan ujian yang bentrok, atau null.
export function bentrokJadwal(ada: JadwalUjian[], baru: JadwalUjian): JadwalUjian | null {
  const mulai = (j: JadwalUjian) => new Date(j.startsAt ?? '').getTime()
  const bm = mulai(baru)
  const be = bm + baru.duration * 60_000
  return ada.find((j) => {
    const m = mulai(j)
    const tumpang = m < be && bm < m + j.duration * 60_000
    const sama = j.subjectId === baru.subjectId && m === bm && j.duration === baru.duration
    return tumpang && !sama
  }) ?? null
}

// Kelas pada ruang yang belum punya bank soal untuk mapel terpilih (bank per kelas).
export function kelasTanpaBank(
  classIds: string[], subjectId: string, banks: { classId?: string, subjectId?: string }[]
): string[] {
  return classIds.filter(id => !banks.some(bank => bank.classId === id && bank.subjectId === subjectId))
}
