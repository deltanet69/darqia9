// Pengacakan soal per siswa: urutan soal dan urutan pilihan jawaban berbeda untuk tiap siswa,
// tetapi tetap sama setiap kali siswa yang sama memuat ulang ujiannya (acak deterministik dari NIS + ujian).
// Bagian soal tetap berurutan (PG, Singkat, Essay, Interaktif); pengacakan terjadi di dalam tiap bagian.

export interface SoalAcak {
  sec: string
  options?: string[]
  // posisi tampil -> indeks pilihan asli. Jawaban selalu disimpan dengan indeks asli agar penilaian server tetap benar.
  optionOrder?: number[]
}

const sidik = (teks: string): number => { // FNV-1a 32-bit
  let h = 2166136261
  for (let i = 0; i < teks.length; i++) { h ^= teks.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

const acakan = (benih: number) => { // mulberry32
  let a = benih
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const kocok = <T>(daftar: T[], rnd: () => number): T[] => {
  const hasil = daftar.slice()
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[hasil[i], hasil[j]] = [hasil[j]!, hasil[i]!]
  }
  return hasil
}

export function acakPerSiswa<T extends SoalAcak>(soal: T[], kunci: string, urutBagian: string[]): T[] {
  const rnd = acakan(sidik(kunci))
  const bagian = [...new Set([...urutBagian, ...soal.map(q => q.sec)])]
  const hasil: T[] = []
  for (const sec of bagian) {
    for (const q of kocok(soal.filter(item => item.sec === sec), rnd)) {
      const pilihan = q.options
      if (pilihan && pilihan.length > 1) {
        const urut = kocok(pilihan.map((_, i) => i), rnd)
        hasil.push({ ...q, options: urut.map(i => pilihan[i]!), optionOrder: urut })
      } else hasil.push(q)
    }
  }
  return hasil
}
