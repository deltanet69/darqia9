// Kategori resmi Master Mapel (sumber: daftar mapel & jadwal.xlsx, tab Nama Mapel SMP/SMK).
export const KATEGORI_MAPEL = [
  'Muatan Nasional',
  'Muatan Kewilayahan',
  'Muatan Keunggulan',
  'Muatan Peminatan Kejuruan',
  'Kelompok Muatan Lokal'
] as const

export type KategoriMapel = typeof KATEGORI_MAPEL[number]
export type JenjangMapel = 'SMP' | 'SMK'

// SMP punya Muatan Keunggulan; SMK punya Muatan Peminatan Kejuruan.
export const KATEGORI_PER_JENJANG: Record<JenjangMapel, readonly KategoriMapel[]> = {
  SMP: ['Muatan Nasional', 'Muatan Kewilayahan', 'Muatan Keunggulan', 'Kelompok Muatan Lokal'],
  SMK: ['Muatan Nasional', 'Muatan Kewilayahan', 'Muatan Peminatan Kejuruan', 'Kelompok Muatan Lokal']
}

const ALIAS: Record<string, KategoriMapel> = {
  'muatan unggulan': 'Muatan Keunggulan',
  'peminatan kejuruan': 'Muatan Peminatan Kejuruan',
  'muatan lokal': 'Kelompok Muatan Lokal',
  'mulok': 'Kelompok Muatan Lokal'
}

// Mengenali kategori dari teks bebas (impor Excel); null bila tidak dikenal.
export function kategoriDariTeks(teks: unknown): KategoriMapel | null {
  const kunci = String(teks ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
  if (!kunci) return null
  return KATEGORI_MAPEL.find(item => item.toLowerCase() === kunci) ?? ALIAS[kunci] ?? null
}

export const kategoriSahUntuk = (jenjang: JenjangMapel, kategori: string | null | undefined): boolean =>
  !!kategori && (KATEGORI_PER_JENJANG[jenjang] as readonly string[]).includes(kategori)

// Warna lencana per kategori; kategori lama/tak dikenal tampil abu-abu.
export const WARNA_KATEGORI: Record<string, string> = {
  'Muatan Nasional': 'bg-[#EFF4FF] text-[#1B5FD9] border-[#B2CCFF]',
  'Muatan Kewilayahan': 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
  'Muatan Keunggulan': 'bg-[#F4F3FF] text-[#5925DC] border-[#D9D6FE]',
  'Muatan Peminatan Kejuruan': 'bg-[#F4F3FF] text-[#5925DC] border-[#D9D6FE]',
  'Kelompok Muatan Lokal': 'bg-[#FEF6EE] text-[#B93815] border-[#F9DBAF]'
}
export const warnaKategori = (kategori: string): string => WARNA_KATEGORI[kategori] ?? 'bg-[#F2F4F7] text-[#475467] border-[#E4E7EC]'
