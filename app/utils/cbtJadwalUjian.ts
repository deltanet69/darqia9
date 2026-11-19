// Blok jam pelajaran mapel di kelasnya (dipakai untuk menyaring mapel yang bisa diujikan di LMS). Hari: 1 = Senin ... 6 = Sabtu.
export interface BarisJadwal { class_id: string; subject_id: string; day_of_week?: number | null; starts_at?: string | null; ends_at?: string | null }
export interface BlokJadwal { hari: number; mulai: string; selesai: string; menit: number }

const keMenit = (jam: string) => { const [h = 0, m = 0] = jam.split(':').map(Number); return h * 60 + m }
const keJam = (menit: number) => `${String(Math.floor(menit / 60)).padStart(2, '0')}:${String(menit % 60).padStart(2, '0')}`

// Jam pelajaran yang bersambung (07.00-07.40 lalu 07.40-08.20) digabung menjadi satu blok.
export const blokJadwal = (rows: BarisJadwal[], classId: string, subjectId: string): BlokJadwal[] => {
  const blok: { hari: number; mulai: number; selesai: number }[] = []
  rows.filter(r => r.class_id === classId && r.subject_id === subjectId && r.day_of_week && r.starts_at && r.ends_at)
    .map(r => ({ hari: r.day_of_week!, mulai: keMenit(r.starts_at!), selesai: keMenit(r.ends_at!) }))
    .sort((a, b) => a.hari - b.hari || a.mulai - b.mulai)
    .forEach(s => {
      const akhir = blok.at(-1)
      if (akhir && akhir.hari === s.hari && akhir.selesai === s.mulai) akhir.selesai = s.selesai
      else blok.push(s)
    })
  return blok.map(b => ({ hari: b.hari, mulai: keJam(b.mulai), selesai: keJam(b.selesai), menit: b.selesai - b.mulai }))
}
