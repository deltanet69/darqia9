// Akses data Ruang Ujian (migrasi 0033). Semua aturan berat (kapasitas, satu siswa satu ruang,
// pembagian acak) dijaga fungsi database; di sini hanya pemanggilan tipis.
import type { ProgresRow } from './ruangUjianCore'

export interface RuangUjian {
  id: string
  grade: 'SMP' | 'SMK'
  periode: string
  name: string
  capacity: number
  supervisorId: string | null
  jumlahSiswa: number
}

export interface AnggotaRuang {
  studentId: string
  nama: string
  nis: string
  classId: string | null
  kelas: string
}

export interface SiswaBebas {
  id: string
  nama: string
  nis: string
  classId: string
  kelas: string
}

export interface AlertRuang {
  violation_id: string
  student_id: string
  student_name: string
  class_name: string | null
  exam_id: string
  exam_name: string
  violation_type: string
  occurrence: number
  locked: boolean
  unlock_code: string | null
  occurred_at: string
  unlocked_at: string | null
}

export const useRuangUjian = () => {
  const client = useSupabaseClient()
  const galat = (error: { message: string } | null) => { if (error) throw new Error(error.message) }

  const muatPeriodeRiwayat = async (grade: string): Promise<string[]> => {
    const { data, error } = await client.from('exam_rooms').select('periode').eq('grade', grade).is('deleted_at', null)
    galat(error)
    return (data ?? []).map((row: any) => row.periode)
  }

  const muatRuang = async (grade: string, periode: string): Promise<RuangUjian[]> => {
    const { data, error } = await client.from('exam_rooms')
      .select('id, grade, periode, name, capacity, supervisor_id, exam_room_members(count)')
      .eq('grade', grade).eq('periode', periode).is('deleted_at', null).is('exam_room_members.deleted_at', null).order('name')
    galat(error)
    return (data ?? []).map((row: any) => ({
      id: row.id, grade: row.grade, periode: row.periode, name: row.name, capacity: row.capacity,
      supervisorId: row.supervisor_id ?? null, jumlahSiswa: row.exam_room_members?.[0]?.count ?? 0
    }))
  }

  const simpanRuang = async (input: { id?: string, grade: string, periode: string, name: string, capacity: number, supervisorId: string | null }) => {
    const payload = { grade: input.grade, periode: input.periode, name: input.name.trim(), capacity: input.capacity, supervisor_id: input.supervisorId }
    const { data, error } = input.id
      ? await client.from('exam_rooms').update(payload).eq('id', input.id).select('id').single()
      : await client.from('exam_rooms').insert(payload).select('id').single()
    if (error?.code === '23505') throw new Error('Nama ruang sudah dipakai pada periode ini.')
    galat(error)
    return (data as any).id as string
  }

  const hapusRuang = async (id: string) => {
    // Soft delete: ruang dan anggotanya ditandai dihapus, datanya tetap ada di database.
    const { error } = await client.rpc('soft_delete_exam_room', { p_room: id })
    galat(error)
  }

  const generateRuang = async (input: { grade: string, periode: string, jumlahRuang: number, kapasitas: number, classIds: string[] | null, supervisorId: string | null }) => {
    const { data, error } = await client.rpc('generate_exam_rooms', {
      p_grade: input.grade, p_periode: input.periode, p_room_count: input.jumlahRuang, p_capacity: input.kapasitas,
      p_class_ids: input.classIds?.length ? input.classIds : null, p_supervisor: input.supervisorId
    })
    galat(error)
    return data as { ruang: number, siswa: number, sisa: number }
  }

  const isiAcak = async (roomId: string, jumlah: number | null, classIds: string[] | null) => {
    const { data, error } = await client.rpc('fill_exam_room_random', { p_room: roomId, p_count: jumlah, p_class_ids: classIds?.length ? classIds : null })
    galat(error)
    return Number(data)
  }

  const tambahAnggota = async (roomId: string, studentIds: string[]) => {
    const { data, error } = await client.rpc('add_exam_room_members', { p_room: roomId, p_student_ids: studentIds })
    galat(error)
    return Number(data)
  }

  const keluarkanAnggota = async (roomId: string, studentId: string) => {
    const { error } = await client.rpc('remove_exam_room_member', { p_room: roomId, p_student: studentId })
    galat(error)
  }

  const muatAnggota = async (roomId: string): Promise<AnggotaRuang[]> => {
    const { data, error } = await client.from('exam_room_members')
      .select('student_id, students(name, nis, class_id, classes(name))').eq('room_id', roomId).is('deleted_at', null)
    galat(error)
    return (data ?? []).map((row: any) => ({
      studentId: row.student_id, nama: row.students?.name ?? '-', nis: row.students?.nis ?? '-',
      classId: row.students?.class_id ?? null, kelas: row.students?.classes?.name ?? '-'
    })).sort((a: AnggotaRuang, b: AnggotaRuang) => a.nama.localeCompare(b.nama))
  }

  // PostgREST membatasi 1000 baris per permintaan, jadi ambil bertahap.
  const ambilSemua = async (buat: (from: number, to: number) => PromiseLike<{ data: any[] | null, error: any }>) => {
    const rows: any[] = []
    for (let from = 0; ; from += 1000) {
      const page = await buat(from, from + 999)
      galat(page.error)
      rows.push(...(page.data ?? []))
      if ((page.data?.length ?? 0) < 1000) return rows
    }
  }

  // Siswa aktif berkelas pada jenjang ini yang belum punya ruang pada periode tersebut.
  const muatSiswaBebas = async (grade: string, periode: string): Promise<SiswaBebas[]> => {
    const [siswa, terpakai] = await Promise.all([
      ambilSemua((from, to) => client.from('students').select('id, name, nis, class_id, classes(name)')
        .eq('active', true).eq('grade', grade).not('class_id', 'is', null).order('id').range(from, to)),
      ambilSemua((from, to) => client.from('exam_room_members').select('student_id').eq('periode', periode).is('deleted_at', null).order('student_id').range(from, to))
    ])
    const dipakai = new Set(terpakai.map((row: any) => row.student_id))
    return siswa.filter((row: any) => !dipakai.has(row.id)).map((row: any) => ({
      id: row.id, nama: row.name, nis: row.nis ?? '-', classId: row.class_id, kelas: row.classes?.name ?? '-'
    })).sort((a: SiswaBebas, b: SiswaBebas) => a.nama.localeCompare(b.nama))
  }

  const muatProgres = async (roomId: string): Promise<ProgresRow[]> => {
    const { data, error } = await client.rpc('room_progress', { p_room: roomId })
    galat(error)
    return (data ?? []) as ProgresRow[]
  }

  const muatAlert = async (roomId: string): Promise<AlertRuang[]> => {
    const { data, error } = await client.rpc('room_alerts', { p_room: roomId })
    galat(error)
    return (data ?? []) as AlertRuang[]
  }

  const bukaKunci = async (violationId: string) => {
    const { error } = await client.rpc('unlock_exam_violation', { p_violation: violationId })
    galat(error)
  }

  // Ujian yang sudah ditautkan ke ruang (lintas kelas) dengan daftar ruangnya.
  const muatTautanUjian = async (roomIds: string[]): Promise<{ exam_id: string, room_id: string }[]> => {
    if (!roomIds.length) return []
    const { data, error } = await client.from('exam_room_exams').select('exam_id, room_id').in('room_id', roomIds)
    galat(error)
    return (data ?? []) as { exam_id: string, room_id: string }[]
  }

  const tautkanUjian = async (examIds: string[], roomIds: string[]) => {
    const rows = examIds.flatMap(examId => roomIds.map(roomId => ({ exam_id: examId, room_id: roomId })))
    const { error } = await client.from('exam_room_exams').upsert(rows, { onConflict: 'exam_id,room_id', ignoreDuplicates: true })
    galat(error)
  }

  const lepasUjian = async (examIds: string[], roomId: string) => {
    const { error } = await client.from('exam_room_exams').delete().eq('room_id', roomId).in('exam_id', examIds)
    galat(error)
  }

  return {
    muatPeriodeRiwayat, muatRuang, simpanRuang, hapusRuang, generateRuang, isiAcak, tambahAnggota,
    keluarkanAnggota, muatAnggota, muatSiswaBebas, muatProgres, muatAlert, bukaKunci,
    muatTautanUjian, tautkanUjian, lepasUjian
  }
}
