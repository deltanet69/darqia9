import { wajibStaf } from '../../utils/wajibStaf'
import { kumpulkanStream } from '../../utils/aiStream'
import { buatPembatas } from '../../utils/pembatas'

// Rekomendasi isi Modul Pembelajaran (seksi B–H) dari identitas modul. Memakai penyedia & token AI yang sama
// dengan OCR Bank Soal (OCR_UTAMA_*). Hasil hanya draf: guru wajib meninjau sebelum disimpan/dipakai.
const pembatas = buatPembatas(6, 60_000)
const TAHAP_PJBL = [
  'Penentuan pertanyaan mendasar', 'Mendesain perencanaan projek', 'Menyusun jadwal',
  'Memantau siswa dan progres projek', 'Menguji hasil', 'Evaluasi pengalaman'
]
const DIMENSI = [
  'Keimanan dan Ketakwaan kepada Tuhan YME', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas',
  'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'
]
const teks = (v: unknown, maks = 200) => String(v ?? '').trim().slice(0, maks)

export default defineEventHandler(async (event) => {
  await wajibStaf(event)
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (pembatas.terblokir(ip)) throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak permintaan AI. Coba lagi dalam satu menit.' })
  pembatas.catat(ip)

  const config = useRuntimeConfig(event)
  const url = String(config.ocrUtamaUrl || 'https://api.pecutmarket.my.id/v1')
  const key = String(config.ocrUtamaKey || '')
  const model = String(config.ocrUtamaModel || 'glm-5.3-flash')
  if (!key) throw createError({ statusCode: 503, statusMessage: 'Kunci AI (OCR_UTAMA_KEY) belum tersedia di server.' })

  const body = await readBody<Record<string, unknown>>(event)
  const identitas = {
    jenjang: teks(body?.jenjang, 3) === 'SMP' ? 'SMP' : 'SMK',
    jenis: body?.jenis === 'mapel' ? 'Modul ajar mata pelajaran' : 'Projek kokurikuler lintas mapel',
    mapel: teks(body?.mapel),
    fase: teks(body?.fase, 20),
    kelas: teks(body?.kelas, 60),
    judul: teks(body?.judul),
    alokasiJp: Math.max(0, Math.min(200, Number(body?.alokasiJp) || 0)),
    jumlahPertemuan: Math.max(0, Math.min(50, Number(body?.jumlahPertemuan) || 0))
  }
  if (!identitas.mapel || !identitas.judul) throw createError({ statusCode: 400, statusMessage: 'Isi mata pelajaran dan judul modul terlebih dahulu.' })

  const prompt = [
    'Anda adalah perancang Modul Ajar Kurikulum Merdeka untuk sekolah Islam terpadu di Indonesia.',
    `Susun rekomendasi isi lengkap untuk modul berikut: ${JSON.stringify(identitas)}.`,
    'Gunakan Bahasa Indonesia baku sesuai KBBI. Model pembelajaran Project-Based Learning (PjBL).',
    'Jangan mengarang nomor regulasi, ISBN, URL, nama orang, atau nama perusahaan yang spesifik. Untuk mitra tulis jenis mitra yang cocok (cth. "bengkel/DU-DI setempat"). Untuk daftar pustaka sebut sumber umum (cth. "Buku Siswa ... Kemendikbudristek") tanpa detail yang tidak pasti.',
    `Langkah kegiatan WAJIB tepat 6 tahap berurutan: ${TAHAP_PJBL.join('; ')}.${identitas.alokasiJp ? ` Jumlah JP keenam tahap harus tepat ${identitas.alokasiJp} JP.` : ''}`,
    `Dimensi profil lulusan: pilih 2-3 dari daftar ini persis: ${DIMENSI.join('; ')}.`,
    'Bobot asesmen totalnya tepat 100.',
    'Keluarkan satu objek JSON saja, tanpa penjelasan, dengan properti persis:',
    '{"cp": string, "dimensi": string[], "tujuan": string[] (3-5, format ABCD), "pemahamanBermakna": string, "pertanyaanPemantik": string[] (2-3),',
    '"targetPeserta": "Reguler", "model": "Project-Based Learning (PjBL)", "sarana": string, "produkDeskripsi": string,',
    '"kriteria": [{"aspek": string, "sb": string, "b": string, "c": string, "pb": string}] (3-4 aspek), "mitra": string,',
    '"langkah": [{"tahap": string, "guru": string, "siswa": string, "jp": number}] (6 item),',
    '"asesmen": {"diagnostik": string, "formatif": string, "sumatif": string, "profil": string},',
    '"bobot": [{"komponen": string, "persen": number, "instrumen": string}], "diferensiasi": {"remedial": string, "pengayaan": string},',
    '"refleksi": {"guru": string, "siswa": string}, "lampiran": [{"jenis": "PDF"|"DOCX"|"XLSX"|"PPTX"|"TAUTAN", "judul": string, "keterangan": string}],',
    '"glosarium": string (istilah dipisah koma), "daftarPustaka": string}'
  ].join('\n')

  const hasil: any = await $fetch<any>(url.replace(/\/+$/, '') + '/chat/completions', {
    method: 'POST',
    timeout: 60_000,
    responseType: 'stream',
    headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
    body: {
      model,
      messages: [{ role: 'user', content: prompt }],
      ...(config.ocrUtamaJson !== false ? { response_format: { type: 'json_object' } } : {}),
      temperature: 0.4,
      max_tokens: 6_000,
      stream: true
    }
  }).catch((error: any) => {
    const status = error?.response?.status || error?.statusCode
    if (status === 429 || status === 503) throw createError({ statusCode: 429, statusMessage: 'Layanan AI sedang penuh. Coba lagi beberapa saat.' })
    throw createError({ statusCode: 502, statusMessage: 'Layanan AI gagal membuat rekomendasi modul. Coba lagi.' })
  })
  const isiTeks = typeof hasil?.getReader === 'function'
    ? await kumpulkanStream(hasil, {
      galat: 'Layanan AI melaporkan galat saat menyusun modul. Coba lagi.',
      habisWaktu: 'Layanan AI terlalu lama menyusun modul. Coba lagi.'
    })
    : String(hasil?.choices?.[0]?.message?.content ?? '')
  // Sebagian model membungkus JSON dengan ```json ... ```; ambil objek terluar.
  const awal = isiTeks.indexOf('{')
  const akhir = isiTeks.lastIndexOf('}')
  try {
    if (awal < 0 || akhir <= awal) throw new Error('kosong')
    return { isi: JSON.parse(isiTeks.slice(awal, akhir + 1)) }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Format hasil AI tidak valid. Coba buat ulang.' })
  }
})
