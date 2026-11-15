// Kisi-kisi (media belajar) bank soal dibuat AI dari isi soal, lalu disimpan ke kolom kisi_kisi (migrasi 0066).
// Bank & soal dibaca dengan klien sesi pengguna: RLS memastikan hanya pemilik / wali kelas / pimpinan / Superadmin.
// Kunci jawaban dan rubrik tidak pernah dikirim ke AI agar kisi-kisi untuk siswa tidak membocorkan jawaban.
type Sumber = 'cbt' | 'ujian_harian'

const bersih = (teks: unknown, maks: number) => String(teks ?? '')
  .replace(/data:[^\s)"']+/g, '') // gambar tertanam
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, maks)

export const promptKisiKisi = (bank: any, soal: any[]) => {
  const ceritaTerpakai = new Set<string>()
  const daftar = soal.map((q, i) => {
    const cerita = q.story_text && !ceritaTerpakai.has(q.story_text) ? (ceritaTerpakai.add(q.story_text), `[Cerita] ${bersih(q.story_text, 600)}\n`) : ''
    return `${cerita}${i + 1}. (${q.type}) ${bersih(q.text, 400)}`
  }).join('\n').slice(0, 24_000)
  return [
    'Anda guru yang menyusun kisi-kisi belajar untuk siswa sekolah Islam terpadu di Indonesia.',
    `Bank soal: ${JSON.stringify({ jenjang: bank.grade, mapel: bank.subject, nama: bank.name, keterangan: bank.description || '' })}.`,
    'Dari daftar soal di bawah, susun kisi-kisi: kelompokkan per materi, tulis indikator yang harus dikuasai siswa, dan sebut nomor soal terkait.',
    'Gunakan Bahasa Indonesia baku sesuai KBBI. Jangan menuliskan jawaban atau kunci soal. Tulis teks biasa (boleh poin dengan "-"), tanpa JSON dan tanpa tabel.',
    'Daftar soal:',
    daftar
  ].join('\n')
}

export const buatKisiKisi = async (opsi: {
  client: any
  source: Sumber
  bankId: string
  mode: 'otomatis' | 'ulang'
  panggilAi: (prompt: string) => Promise<string>
}): Promise<{ kisiKisi: string, dilewati?: true }> => {
  const tabelBank = opsi.source === 'cbt' ? 'question_banks' : 'ujian_harian_banks'
  const tabelSoal = opsi.source === 'cbt' ? 'questions' : 'ujian_harian_questions'
  const { data: bank, error } = await opsi.client.from(tabelBank).select('id, name, description, subject, grade, kisi_kisi').eq('id', opsi.bankId).maybeSingle()
  if (error) throw createError({ statusCode: 502, statusMessage: 'Bank soal gagal dibaca.' })
  if (!bank) throw createError({ statusCode: 404, statusMessage: 'Bank soal tidak ditemukan.' })
  // Simpan ulang bank tidak menimpa kisi-kisi yang sudah ada (bisa jadi sudah disunting guru).
  if (opsi.mode === 'otomatis' && bank.kisi_kisi?.trim()) return { kisiKisi: bank.kisi_kisi, dilewati: true }
  const { data: soal, error: errSoal } = await opsi.client.from(tabelSoal).select('text, type, story_text').eq('bank_id', opsi.bankId).order('number')
  if (errSoal) throw createError({ statusCode: 502, statusMessage: 'Soal bank gagal dibaca.' })
  if (!soal?.length) throw createError({ statusCode: 400, statusMessage: 'Bank soal belum berisi soal.' })
  const kisiKisi = (await opsi.panggilAi(promptKisiKisi(bank, soal))).trim()
  if (!kisiKisi) throw createError({ statusCode: 502, statusMessage: 'AI tidak menghasilkan kisi-kisi. Coba lagi.' })
  const { error: errSimpan } = await opsi.client.from(tabelBank).update({ kisi_kisi: kisiKisi }).eq('id', opsi.bankId)
  if (errSimpan) throw createError({ statusCode: 502, statusMessage: 'Kisi-kisi gagal disimpan.' })
  return { kisiKisi }
}
