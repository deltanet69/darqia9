// Kisi-kisi (media belajar) bank soal dibuat AI dari isi soal sebagai BUTIR TERSTRUKTUR Taksonomi Bloom
// (migrasi 0095: kolom kisi_butir), lalu kolom teks kisi_kisi ditulis ulang sebagai turunan yang terbaca.
// Prompt, tabel KKO, validasi pasangan level-KKO, dan urutan C1 -> C6 hidup di app/utils/kisiBloom.ts.
// Bank & soal dibaca dengan klien sesi pengguna: RLS memastikan hanya pemilik / wali kelas / pimpinan / Superadmin.
// Kunci jawaban dan rubrik tidak pernah dikirim ke AI agar kisi-kisi untuk siswa tidak membocorkan jawaban.
import { parseButirKisi, promptKisiKisiBloom, teksDariButir, uraiButirAi, type ButirKisi } from '../../app/utils/kisiBloom.ts'

export { promptKisiKisiBloom as promptKisiKisi, uraiButirAi }

type Sumber = 'cbt' | 'ujian_harian'

const galatMigrasi = (e: any) => /kisi_butir/i.test(String(e?.message || e || ''))
const pesanMigrasi = 'Kolom kisi_butir belum ada. Jalankan migrasi 0095_kisi_bloom.sql di Supabase terlebih dahulu.'

export const buatKisiKisi = async (opsi: {
  client: any
  source: Sumber
  bankId: string
  mode: 'otomatis' | 'ulang'
  panggilAi: (prompt: string) => Promise<string>
}): Promise<{ kisiKisi: string, butir: ButirKisi[], dilewati?: true }> => {
  const tabelBank = opsi.source === 'cbt' ? 'question_banks' : 'ujian_harian_banks'
  const tabelSoal = opsi.source === 'cbt' ? 'questions' : 'ujian_harian_questions'
  const { data: bank, error } = await opsi.client.from(tabelBank).select('id, name, description, subject, grade, kisi_kisi, kisi_butir').eq('id', opsi.bankId).maybeSingle()
  if (error) {
    if (galatMigrasi(error)) throw createError({ statusCode: 503, statusMessage: pesanMigrasi })
    throw createError({ statusCode: 502, statusMessage: 'Bank soal gagal dibaca.' })
  }
  if (!bank) throw createError({ statusCode: 404, statusMessage: 'Bank soal tidak ditemukan.' })
  const butirAda = parseButirKisi(bank.kisi_butir)
  // Simpan ulang bank tidak menimpa kisi-kisi yang sudah ada (bisa jadi sudah disunting guru).
  if (opsi.mode === 'otomatis' && (butirAda.length || bank.kisi_kisi?.trim())) {
    return { kisiKisi: bank.kisi_kisi?.trim() || teksDariButir(butirAda), butir: butirAda, dilewati: true }
  }
  const { data: soal, error: errSoal } = await opsi.client.from(tabelSoal).select('text, type, story_text, number').eq('bank_id', opsi.bankId).order('number')
  if (errSoal) throw createError({ statusCode: 502, statusMessage: 'Soal bank gagal dibaca.' })
  if (!soal?.length) throw createError({ statusCode: 400, statusMessage: 'Bank soal belum berisi soal.' })
  const nomorSah = new Set<number>(soal.map((q: any, i: number) => (Number(q.number) > 0 ? Number(q.number) : i + 1)))
  const butir = uraiButirAi(await opsi.panggilAi(promptKisiKisiBloom(bank, soal)), nomorSah)
  if (!butir.length) throw createError({ statusCode: 502, statusMessage: 'AI tidak menghasilkan kisi-kisi terstruktur yang sah. Coba lagi.' })
  const kisiKisi = teksDariButir(butir)
  const { error: errSimpan } = await opsi.client.from(tabelBank).update({ kisi_butir: butir, kisi_kisi: kisiKisi }).eq('id', opsi.bankId)
  if (errSimpan) {
    if (galatMigrasi(errSimpan)) throw createError({ statusCode: 503, statusMessage: pesanMigrasi })
    throw createError({ statusCode: 502, statusMessage: 'Kisi-kisi gagal disimpan.' })
  }
  return { kisiKisi, butir }
}
