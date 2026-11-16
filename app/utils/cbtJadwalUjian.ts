// Jam ujian LMS mengikuti Jadwal Pelajaran: mulai tepat di jam pelajaran mapel itu di kelasnya, selesai paling lambat
// saat jam pelajarannya berakhir. Sama dengan trigger guard_ujian_harian_jadwal (migrasi 0071). Hari: 1 = Senin ... 6 = Sabtu.
export interface BarisJadwal { class_id: string; subject_id: string; day_of_week?: number | null; starts_at?: string | null; ends_at?: string | null }
export interface BlokJadwal { hari: number; mulai: string; selesai: string; menit: number }
export interface SlotUjian { startsAt: string; selesai: string; menit: number }

const keMenit = (jam: string) => { const [h = 0, m = 0] = jam.split(':').map(Number); return h * 60 + m }
const keJam = (menit: number) => `${String(Math.floor(menit / 60)).padStart(2, '0')}:${String(menit % 60).padStart(2, '0')}`
const lokal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)

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

// Jam pelajaran setelah `dari` selama `hari` hari ke depan; startsAt berformat datetime-local (jam lokal peramban).
export const slotMendatang = (blok: BlokJadwal[], dari: Date, hari = 28): SlotUjian[] => {
  const hasil: SlotUjian[] = []
  for (let i = 0; i < hari; i++) {
    const tgl = new Date(dari.getFullYear(), dari.getMonth(), dari.getDate() + i)
    for (const b of blok) {
      if (b.hari !== tgl.getDay()) continue
      const mulai = new Date(tgl.getFullYear(), tgl.getMonth(), tgl.getDate(), 0, keMenit(b.mulai))
      if (mulai > dari) hasil.push({ startsAt: lokal(mulai), selesai: b.selesai, menit: b.menit })
    }
  }
  return hasil
}

// Panjang jam pelajaran (menit) bila startsAt tepat di awal blok jam pelajaran; null = di luar jadwal.
export const menitSlot = (blok: BlokJadwal[], startsAt: string | Date): number | null => {
  const d = new Date(startsAt)
  if (!Number.isFinite(d.getTime()) || d.getSeconds()) return null
  return blok.find(b => b.hari === d.getDay() && keMenit(b.mulai) === d.getHours() * 60 + d.getMinutes())?.menit ?? null
}
