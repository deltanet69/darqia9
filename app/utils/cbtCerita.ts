// Soal cerita = soal-soal dengan storyGroup sama. Satu unit = satu soal biasa, atau satu cerita beserta semua
// sub-soalnya. Unit berada di posisi kemunculan pertamanya; sub-soal dirapatkan dengan urutan relatif tetap.
export const kelompokCerita = <T extends { storyGroup?: string }>(soal: T[]): T[][] => {
  const unit: T[][] = []
  const cerita = new Map<string, T[]>()
  for (const q of soal) {
    const grup = q.storyGroup ? cerita.get(q.storyGroup) : undefined
    if (grup) { grup.push(q); continue }
    const baru = [q]
    if (q.storyGroup) cerita.set(q.storyGroup, baru)
    unit.push(baru)
  }
  return unit
}
