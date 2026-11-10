// Pencocokan nama KELAS dari template impor bank soal dengan daftar Manajemen Kelas.
// Toleran terhadap perbedaan penulisan yang tidak mengubah kelasnya: huruf besar/kecil, spasi (termasuk spasi
// tak terlihat dari Word), tanda baca "." "-" "–" dan tingkat angka vs romawi ("8.4" = "VIII.4" = "VIII - 4").
const ROMAWI: Record<string, string> = { XII: '12', XI: '11', X: '10', IX: '9', VIII: '8', VII: '7', VI: '6', V: '5', IV: '4', III: '3', II: '2', I: '1' }

export const kunciKelas = (nama: string): string => {
  const teks = String(nama ?? '').normalize('NFKC').replace(/[\u00A0\u200B-\u200D\uFEFF]/g, ' ').trim().toUpperCase()
  // Tingkat romawi di awal (hanya bila diikuti batas: spasi, titik, strip, angka, atau akhir) diganti angka.
  const arab = teks.replace(/^(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)(?=[^A-Z]|$)/, romawi => ROMAWI[romawi] ?? romawi)
  return arab.replace(/[^A-Z0-9]/g, '')
}

// Nama kelas resmi (persis seperti di Manajemen Kelas) untuk isian template, atau null bila tidak ada/ambigu.
export const cocokKelas = (isian: string, daftar: string[]): string | null => {
  const persis = daftar.find(nama => nama === isian)
  if (persis) return persis
  const kunci = kunciKelas(isian)
  if (!kunci) return null
  const cocok = daftar.filter(nama => kunciKelas(nama) === kunci)
  return cocok.length === 1 ? cocok[0]! : null
}
