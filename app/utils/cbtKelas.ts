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

// Isian KELAS boleh berisi banyak kelas dipisah koma, titik koma, garis miring, atau baris baru (cth: "7.2, 8.1, 7.3").
// Hasil: kelas resmi tanpa duplikat (urutan sesuai isian) dan isian yang tidak ditemukan.
export const cocokDaftarKelas = (isian: string, daftar: string[]): { cocok: string[]; hilang: string[] } => {
  const cocok: string[] = []
  const hilang: string[] = []
  for (const bagian of String(isian ?? '').split(/[,;/\n]+/).map(item => item.trim()).filter(Boolean)) {
    const nama = cocokKelas(bagian, daftar)
    if (!nama) hilang.push(bagian)
    else if (!cocok.includes(nama)) cocok.push(nama)
  }
  return { cocok, hilang }
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
