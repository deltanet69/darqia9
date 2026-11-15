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

// Pilih acak sekitar n soal tanpa memotong cerita: unit dikocok, diambil selama total ≤ n
// (unit yang membuat total lewat n dilewati). Hasil: id soal, urut seperti di bank.
export const pilihUnitAcak = <T extends { id: string, storyGroup?: string }>(soal: T[], n: number, rnd: () => number): string[] => {
  const unit = kelompokCerita(soal)
  for (let i = unit.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[unit[i], unit[j]] = [unit[j]!, unit[i]!]
  }
  const dipilih = new Set<string>()
  for (const u of unit) if (dipilih.size + u.length <= n) u.forEach(q => dipilih.add(q.id))
  return soal.filter(q => dipilih.has(q.id)).map(q => q.id)
}
