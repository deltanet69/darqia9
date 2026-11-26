// Standar kisi-kisi Taksonomi Bloom (revisi Anderson & Krathwohl) untuk Bank Soal Darqia 9.
// Satu sumber kebenaran: dipakai editor guru (Admin CBT & LMS), generator AI di server, dan Perpus siswa.
// Daftar KKO per level mengikuti tabel referensi Taksonomi Bloom yang dipakai sekolah.
export type LevelBloom = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6'

export interface ButirKisi {
  materi: string
  indikator: string // kelanjutan kalimat setelah "Siswa dapat <KKO>"
  level: LevelBloom
  kko: string // kata kerja operasional, harus anggota daftar KKO levelnya
  soal: number[] // nomor soal terkait di bank (boleh kosong bila belum dikaitkan)
}

export interface InfoLevel {
  kode: LevelBloom
  nama: string
  warna: string
  definisi: string
  kko: string[]
}

export const BLOOM: Record<LevelBloom, InfoLevel> = {
  C1: {
    kode: 'C1', nama: 'Mengingat', warna: '#7C3AED',
    definisi: 'Mengambil kembali informasi yang relevan dari ingatan jangka panjang.',
    kko: ['Menyebutkan', 'Mengidentifikasi', 'Mendefinisikan', 'Menuliskan', 'Menghafal', 'Mencatat', 'Menjodohkan', 'Menyusun daftar', 'Mengingat']
  },
  C2: {
    kode: 'C2', nama: 'Memahami', warna: '#2563EB',
    definisi: 'Memahami makna informasi, menafsirkan, dan menjelaskan dengan kata sendiri.',
    kko: ['Menjelaskan', 'Menafsirkan', 'Merangkum', 'Mengklasifikasikan', 'Memberi contoh', 'Membandingkan', 'Menyatakan kembali']
  },
  C3: {
    kode: 'C3', nama: 'Menerapkan', warna: '#0891B2',
    definisi: 'Menggunakan informasi atau konsep dalam situasi baru.',
    kko: ['Menerapkan', 'Menggunakan', 'Mengoperasikan', 'Melaksanakan', 'Mempraktikkan', 'Menghitung', 'Menyelesaikan', 'Mendemonstrasikan']
  },
  C4: {
    kode: 'C4', nama: 'Menganalisis', warna: '#D97706',
    definisi: 'Menguraikan informasi menjadi bagian-bagian dan memahami hubungan antarbagian.',
    kko: ['Menganalisis', 'Menguraikan', 'Mengkaji', 'Membandingkan', 'Mengelompokkan', 'Menelaah', 'Mengidentifikasi', 'Memilah', 'Memetakan']
  },
  C5: {
    kode: 'C5', nama: 'Mengevaluasi', warna: '#DC2626',
    definisi: 'Memberi penilaian berdasarkan kriteria dan standar tertentu.',
    kko: ['Menilai', 'Mengevaluasi', 'Mengkritik', 'Mempertimbangkan', 'Menyimpulkan', 'Menafsirkan', 'Membandingkan', 'Memutuskan', 'Memverifikasi']
  },
  C6: {
    kode: 'C6', nama: 'Menciptakan', warna: '#DB2777',
    definisi: 'Menggabungkan unsur menjadi sesuatu yang baru, asli, dan bermakna.',
    kko: ['Merancang', 'Mencipta', 'Mengembangkan', 'Memodifikasi', 'Menyusun', 'Mengombinasikan', 'Merumuskan', 'Membuat', 'Merevisi']
  }
}

export const URUTAN_LEVEL: LevelBloom[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
const peringkat = (l: LevelBloom) => URUTAN_LEVEL.indexOf(l)

// Aturan user (26 Nov 2026): hasil kisi-kisi selalu tampil berurutan menaik C1 -> C6 mengikuti tahapan
// taksonomi; di dalam level yang sama urutan asal (pengelompokan materi) dipertahankan.
export const urutkanButirKisi = (butir: ButirKisi[]): ButirKisi[] =>
  butir.map((b, i) => [b, i] as const)
    .sort((a, b) => (peringkat(a[0].level) - peringkat(b[0].level)) || (a[1] - b[1]))
    .map(([b]) => b)

// KKO sah untuk levelnya? Mengembalikan ejaan kanonik dari tabel, atau null bila bukan anggota level itu.
export const kkoKanonik = (level: LevelBloom, kko: unknown): string | null => {
  const dicari = String(kko ?? '').trim().toLowerCase()
  if (!dicari) return null
  return BLOOM[level].kko.find(k => k.toLowerCase() === dicari) ?? null
}

const teksBersih = (v: unknown, maks: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, maks)

// Rapikan satu butir mentah (dari AI / form guru / jsonb) menjadi ButirKisi sah, atau null bila tidak sah:
// level harus C1-C6, KKO harus anggota levelnya, materi dan indikator wajib ada.
// Bila nomorSoalSah diberikan, nomor di luar daftar dibuang (AI tidak boleh mengarang nomor soal).
export const rapikanButirKisi = (mentah: unknown, nomorSoalSah?: ReadonlySet<number>): ButirKisi | null => {
  if (!mentah || typeof mentah !== 'object') return null
  const m = mentah as Record<string, unknown>
  const level = String(m.level ?? '').trim().toUpperCase() as LevelBloom
  if (!URUTAN_LEVEL.includes(level)) return null
  const kko = kkoKanonik(level, m.kko)
  if (!kko) return null
  const materi = teksBersih(m.materi, 160)
  let indikator = teksBersih(m.indikator, 400)
  // AI kadang mengulang pola lengkap "Siswa dapat <kko> ..." di indikator; potong agar tidak ganda saat ditampilkan.
  const pola = new RegExp(`^(siswa|peserta didik|kamu)\\s+dapat\\s+${kko.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i')
  indikator = indikator.replace(pola, '').trim()
  if (!materi || !indikator) return null
  const soalMentah = Array.isArray(m.soal) ? m.soal : []
  const soal = [...new Set(soalMentah.map(x => Math.floor(Number(x))).filter(n => Number.isFinite(n) && n > 0))]
    .filter(n => !nomorSoalSah || nomorSoalSah.has(n))
    .sort((a, b) => a - b)
  return { materi, indikator, level, kko, soal }
}

// Baca kolom jsonb kisi_butir menjadi daftar butir sah dan terurut. Nilai rusak -> daftar kosong.
export const parseButirKisi = (nilai: unknown): ButirKisi[] => {
  if (!Array.isArray(nilai)) return []
  const hasil = nilai.map(b => rapikanButirKisi(b)).filter((b): b is ButirKisi => !!b)
  return urutkanButirKisi(hasil).slice(0, 60)
}

// Indikator lengkap untuk dibaca guru: "Siswa dapat menyelesaikan ...".
export const indikatorLengkap = (b: ButirKisi) => `Siswa dapat ${b.kko.toLowerCase()} ${b.indikator}`

// Teks kisi-kisi turunan (kolom kisi_kisi lama) agar tampilan lama dan cadangan tetap terbaca manusia.
export const teksDariButir = (butir: ButirKisi[]): string => {
  const baris: string[] = []
  let materiKini = ''
  for (const b of urutkanButirKisi(butir)) {
    if (b.materi !== materiKini) { materiKini = b.materi; baris.push(b.materi) }
    baris.push(`- [${b.level}] ${indikatorLengkap(b)}${b.soal.length ? ` (Soal no. ${b.soal.join(', ')})` : ''}`)
  }
  return baris.join('\n')
}

// ---------- generator AI (dipakai server/utils/cbtKisiKisi.ts) ----------
const bersihSoal = (teks: unknown, maks: number) => String(teks ?? '')
  .replace(/data:[^\s)"']+/g, '') // gambar tertanam
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, maks)

const tabelKko = URUTAN_LEVEL.map(l => `${l} (${BLOOM[l].nama}): ${BLOOM[l].kko.join(', ')}`).join('\n')

// Prompt generator: AI wajib menjawab JSON array butir terstruktur; kunci jawaban tidak pernah dikirim.
export const promptKisiKisiBloom = (bank: any, soal: any[]) => {
  const ceritaTerpakai = new Set<string>()
  const daftar = soal.map((q, i) => {
    const nomor = Number(q.number) > 0 ? Number(q.number) : i + 1
    const cerita = q.story_text && !ceritaTerpakai.has(q.story_text) ? (ceritaTerpakai.add(q.story_text), `[Cerita] ${bersihSoal(q.story_text, 600)}\n`) : ''
    return `${cerita}${nomor}. (${q.type}) ${bersihSoal(q.text, 400)}`
  }).join('\n').slice(0, 24_000)
  return [
    'Anda guru yang menyusun kisi-kisi belajar untuk siswa sekolah Islam terpadu di Indonesia.',
    `Bank soal: ${JSON.stringify({ jenjang: bank.grade, mapel: bank.subject, nama: bank.name, keterangan: bank.description || '' })}.`,
    'Dari daftar soal di bawah, susun kisi-kisi mengikuti TAKSONOMI BLOOM. Kelompokkan soal per materi, lalu untuk tiap kelompok tentukan:',
    '- materi: nama topik yang benar-benar diujikan oleh soal-soal itu.',
    '- level: tahap berpikir Bloom yang dituntut soal (C1 mengingat fakta, C2 memahami konsep, C3 menerapkan pada situasi, C4 menganalisis hubungan/bagian, C5 menilai/memutuskan berdasarkan kriteria, C6 merancang/mencipta sesuatu yang baru). Nilai dari tuntutan berpikir soalnya, bukan sekadar kata kerja di teks soal.',
    '- kko: kata kerja operasional untuk indikator. WAJIB dipilih persis dari daftar KKO milik level itu:',
    tabelKko,
    '- indikator: kelanjutan kalimat setelah pola "Siswa dapat <kko huruf kecil>", ditulis tanpa mengulang "Siswa dapat" dan tanpa kata kerjanya lagi. Contoh untuk kko "Menyelesaikan": "persoalan pertumbuhan bakteri menggunakan konsep eksponen."',
    '- soal: daftar nomor soal (persis seperti nomor pada daftar) yang termasuk butir ini. Setiap nomor soal harus muncul di tepat satu butir.',
    'Komposisi umum kemampuan siswa: sebagian besar butir wajar di C1-C3, sebagian di C4-C5, dan hanya sedikit yang benar-benar C6. Jangan memaksakan level tinggi bila tuntutan soalnya tidak sampai ke sana.',
    'Gunakan Bahasa Indonesia baku sesuai KBBI. Jangan menuliskan jawaban atau kunci soal.',
    'Jawab HANYA dengan JSON array murni (tanpa penjelasan, tanpa markdown), bentuk tiap elemen:',
    '{"materi":"...","level":"C3","kko":"Menyelesaikan","indikator":"...","soal":[5,6,7]}',
    'Daftar soal:',
    daftar
  ].join('\n')
}

// Urai keluaran AI menjadi butir sah: ekstrak array JSON, validasi pasangan level-KKO, buang nomor soal
// karangan, lalu urutkan C1 -> C6. Keluaran yang tidak bisa diurai menghasilkan daftar kosong.
export const uraiButirAi = (teks: string, nomorSoalSah: ReadonlySet<number>): ButirKisi[] => {
  const awal = teks.indexOf('[')
  const akhir = teks.lastIndexOf(']')
  if (awal < 0 || akhir <= awal) return []
  try {
    const mentah = JSON.parse(teks.slice(awal, akhir + 1))
    if (!Array.isArray(mentah)) return []
    const hasil = mentah.map(b => rapikanButirKisi(b, nomorSoalSah)).filter((b): b is ButirKisi => !!b)
    return urutkanButirKisi(hasil).slice(0, 60)
  } catch { return [] }
}

// Ringkasan komposisi untuk meter panduan guru: pola lapangan = mayoritas C1-C3, sebagian C4-C5, sedikit C6.
export const komposisiButir = (butir: ButirKisi[]) => {
  const per: Record<LevelBloom, number> = { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 }
  for (const b of butir) per[b.level]++
  const total = butir.length
  const persen = (n: number) => (total ? Math.round(n / total * 100) : 0)
  return {
    per, total,
    rendah: persen(per.C1 + per.C2 + per.C3),
    tengah: persen(per.C4 + per.C5),
    tinggi: persen(per.C6)
  }
}
