// Akses data Kartu Ujian (migrasi 0055, 0057 untuk LMS). Aturan kunci token dijaga database; di sini pemanggilan tipis.
export type SumberKartu = 'cbt' | 'ujian_harian'

export interface PeriodeKartu {
  id: string
  grade: 'SMP' | 'SMK'
  periode: string
  startsOn: string
  endsOn: string
  releasedAt: string | null
  source: SumberKartu
}

export interface SiswaKartu {
  studentId: string
  name: string
  nis: string
  classId: string | null
  classroom: string
  room: string
  eligible: boolean
  active: boolean
  cardId?: string
  token?: string
}

export const useKartuUjian = (sumber: SumberKartu = 'cbt') => {
  const client = useSupabaseClient()
  const rbac = useRbac()
  const galat = (error: { message: string } | null) => { if (error) throw new Error(error.message) }
  // RBAC sub-modul Kartu Ujian CBT/LMS (akun belum ditugaskan: aturan lama — hanya Superadmin).
  const bolehKartu = (aksi: 'buat' | 'ubah' | 'hapus') =>
    rbac.bolehAksi(sumber === 'ujian_harian' ? 'LMS' : 'Manajemen CBT', 'cards', aksi, rbac.adalahSuperadmin.value)
  const wajib = (aksi: 'buat' | 'ubah' | 'hapus') => { if (!bolehKartu(aksi)) throw new Error(`Peran Anda tidak memiliki izin ${aksi} di Kartu Ujian.`) }

  const muatPeriode = async (grade: string, source: SumberKartu = 'cbt'): Promise<PeriodeKartu[]> => {
    const { data, error } = await client.from('exam_card_periods').select('id, grade, periode, starts_on, ends_on, released_at, source').eq('grade', grade).eq('source', source)
    galat(error)
    return (data ?? []).map((row: any) => ({
      id: row.id, grade: row.grade, periode: row.periode, startsOn: row.starts_on, endsOn: row.ends_on, releasedAt: row.released_at, source: row.source
    }))
  }

  const simpanPeriode = async (input: { id?: string, grade: string, source: SumberKartu, periode: string, startsOn: string, endsOn: string }) => {
    wajib(input.id ? 'ubah' : 'buat')
    if (!input.startsOn || !input.endsOn || input.endsOn < input.startsOn) throw new Error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.')
    const payload = { grade: input.grade, source: input.source, periode: input.periode, starts_on: input.startsOn, ends_on: input.endsOn }
    const { error } = input.id
      ? await client.from('exam_card_periods').update(payload).eq('id', input.id)
      : await client.from('exam_card_periods').insert(payload)
    galat(error)
  }

  const hapusPeriode = async (id: string) => {
    wajib('hapus')
    const { error } = await client.from('exam_card_periods').delete().eq('id', id)
    galat(error)
  }

  const rilis = async (periodeId: string): Promise<number> => {
    wajib('ubah')
    const { data, error } = await client.rpc('release_exam_cards', { target_period: periodeId })
    galat(error)
    return typeof data === 'number' ? data : 0
  }

  const regenerasi = async (cardId: string): Promise<string> => {
    wajib('ubah')
    const { data, error } = await client.rpc('regenerate_card_token', { target_card: cardId })
    galat(error)
    return typeof data === 'string' ? data : ''
  }

  // Sumber utama = tabel kartu (kartu tidak hilang walau siswa pindah kelas/nonaktif), ditambah siswa aktif yang belum punya kartu.
  // shortcut: satu permintaan 1000 baris per jenjang, cukup untuk sekolah ini; paginasi bila melebihi.
  const muatSiswa = async (periode: PeriodeKartu): Promise<SiswaKartu[]> => {
    // Ruang hanya ada di CBT PTS/PAS; LMS ujian harian tidak punya ruang.
    const ruangQuery = periode.source === 'cbt'
      ? client.from('exam_room_members').select('student_id, exam_rooms!inner(name)').eq('periode', periode.periode).is('deleted_at', null).is('exam_rooms.deleted_at', null).range(0, 999)
      : Promise.resolve({ data: [], error: null })
    const [kartu, siswa, ruang] = await Promise.all([
      client.from('exam_cards').select('id, student_id, token, class_id, classroom, students(name, nis, exam_eligible, active)').eq('period_id', periode.id).range(0, 999),
      client.from('students').select('id, nis, name, class_id, exam_eligible, classes(name)').eq('grade', periode.grade).eq('active', true).range(0, 999),
      ruangQuery
    ])
    galat(kartu.error)
    galat(siswa.error)
    // Gagal memuat ruang tidak menggagalkan daftar: kolom ruang kosong saja.
    const ruangByStudent = new Map((ruang.error ? [] : ruang.data ?? []).map((row: any) => [row.student_id, row.exam_rooms?.name ?? '']))
    const punyaKartu = new Set<string>()
    const rows: SiswaKartu[] = (kartu.data ?? []).map((row: any) => {
      punyaKartu.add(row.student_id)
      return {
        studentId: row.student_id, name: row.students?.name ?? '-', nis: row.students?.nis || '', classId: row.class_id,
        classroom: row.classroom || 'Tanpa kelas', room: ruangByStudent.get(row.student_id) ?? '',
        eligible: row.students?.exam_eligible !== false, active: row.students?.active !== false, cardId: row.id, token: row.token
      }
    })
    for (const row of (siswa.data ?? []) as any[]) {
      if (punyaKartu.has(row.id)) continue
      rows.push({
        studentId: row.id, name: row.name, nis: row.nis || '', classId: row.class_id,
        classroom: row.classes?.name ?? 'Tanpa kelas', room: ruangByStudent.get(row.id) ?? '',
        eligible: row.exam_eligible !== false, active: true
      })
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name, 'id'))
  }

  const hapusKartu = async (cardIds: string[]) => {
    wajib('hapus')
    const { error } = await client.from('exam_cards').delete().in('id', cardIds)
    galat(error)
  }

  const setEligible = async (studentId: string, eligible: boolean) => {
    wajib('ubah')
    const { error } = await client.from('students').update({ exam_eligible: eligible }).eq('id', studentId)
    galat(error)
  }

  return {
    bolehKartu, muatPeriode, simpanPeriode, hapusPeriode, rilis, regenerasi, muatSiswa, hapusKartu, setEligible }
}
