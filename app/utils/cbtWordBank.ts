import type { BankPackage, BankQuestionItem, GradeType } from '~/components/adminV2/cbt/cbtV2Data'

type ImportType = BankQuestionItem['type']

export interface WordBankIssue {
  number: number
  message: string
}

export interface WordBankPreview {
  package: BankPackage
  classroom: string
  subject: string
  questionCount: number
  totalCount: number
  issues: WordBankIssue[]
}

const clean = (value = '') => value.trim()
const keyOf = (value = '') => value.toUpperCase().replace(/[^A-Z0-9]/g, '')
// &amp; didekode TERAKHIR: "&amp;lt;" di XML adalah teks "&lt;" (bukan "<"). Entitas numerik (&#8217; / &#x2019;) ikut didekode.
export const decodeXml = (value: string) => value
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')

// Nama kolom yang dikenal template. Pada kolom bernarasi (PERTANYAAN, RUBRIK, PILIHAN_x), baris yang tidak diawali
// nama kolom adalah LANJUTAN isinya (pertanyaan beberapa paragraf, kode program, dst.) dan digabung dengan baris baru,
// bukan dibuang. Kolom satu baris (TIPE, KUNCI, dst.) tidak pernah menyerap baris lain. Penanda "---" memutus lanjutan,
// dan banner "BLOK SOAL ..." tidak dibaca.
const KOLOM_NARASI = new Set(['PERTANYAAN', 'RUBRIK', 'PILIHANA', 'PILIHANB', 'PILIHANC', 'PILIHAND', 'PILIHANE'])
const KOLOM_DIKENAL = new Set([
  'JENJANG', 'KELAS', 'MATAPELAJARAN', 'PENYUSUN', 'KESULITANPAKET', 'NO', 'TIPE', 'KESULITAN', 'PERTANYAAN',
  'PILIHANA', 'PILIHANB', 'PILIHANC', 'PILIHAND', 'PILIHANE', 'KUNCI', 'MODEPG', 'RUBRIK', 'MEDIA', 'LINKMEDIA', 'JENISJAWABAN'
])
export const fields = (lines: string[]) => {
  const hasil: Record<string, string> = {}
  let terakhir = ''
  for (const line of lines) {
    if (/^---/.test(line)) { terakhir = ''; continue }
    const separator = line.indexOf(':')
    const key = separator < 0 ? '' : keyOf(line.slice(0, separator))
    if (key && KOLOM_DIKENAL.has(key)) {
      terakhir = key
      hasil[key] = clean(line.slice(separator + 1))
    } else if (terakhir && KOLOM_NARASI.has(terakhir) && !/^BLOK SOAL\b/i.test(line)) {
      hasil[terakhir] = clean(`${hasil[terakhir]}\n${line}`)
    }
  }
  return hasil
}

const documentXml = async (file: File) => {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let directory = -1
  for (let index = Math.max(0, bytes.length - 65_557); index <= bytes.length - 22; index++) {
    if (view.getUint32(index, true) === 0x06054b50) directory = view.getUint32(index + 16, true)
  }
  if (directory < 0) throw new Error('Dokumen Word tidak valid.')
  let cursor = directory
  while (cursor + 46 <= bytes.length && view.getUint32(cursor, true) === 0x02014b50) {
    const method = view.getUint16(cursor + 10, true)
    const compressedSize = view.getUint32(cursor + 20, true)
    const nameSize = view.getUint16(cursor + 28, true)
    const extraSize = view.getUint16(cursor + 30, true)
    const commentSize = view.getUint16(cursor + 32, true)
    const localOffset = view.getUint32(cursor + 42, true)
    const name = new TextDecoder().decode(bytes.slice(cursor + 46, cursor + 46 + nameSize))
    if (name === 'word/document.xml') {
      if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('Isi dokumen Word tidak dapat dibaca.')
      const localNameSize = view.getUint16(localOffset + 26, true)
      const localExtraSize = view.getUint16(localOffset + 28, true)
      const start = localOffset + 30 + localNameSize + localExtraSize
      const data = bytes.slice(start, start + compressedSize)
      if (method === 0) return new TextDecoder().decode(data)
      if (method === 8 && 'DecompressionStream' in window) {
        const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
        return new TextDecoder().decode(await new Response(stream).arrayBuffer())
      }
      throw new Error('Peramban ini belum mendukung pembacaan dokumen Word.')
    }
    cursor += 46 + nameSize + extraSize + commentSize
  }
  throw new Error('Bagian soal tidak ditemukan dalam dokumen Word.')
}

// Satu paragraf = satu baris. Pindah baris di dalam paragraf (Shift+Enter) dan tab dipertahankan, bukan menyatukan kata.
export const linesFromXml = (xml: string) => Array.from(xml.matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g))
  .map(block => Array.from(block[1].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:br\s*\/?>|<w:tab\s*\/?>/g))
    .map(token => token[0].startsWith('<w:br') ? '\n' : token[0].startsWith('<w:tab') ? ' ' : decodeXml(token[1] ?? ''))
    .join('').trim())
  .filter(Boolean)

const toType = (value: string): ImportType | null => {
  const type = keyOf(value)
  if (['PG', 'PILIHANGANDA'].includes(type)) return 'PG'
  if (['ESAI', 'ESSAY'].includes(type)) return 'Esai'
  return type === 'INTERAKTIF' ? 'Interaktif' : null
}

const toDifficulty = (value: string): BankQuestionItem['difficulty'] => {
  const item = clean(value).toLowerCase()
  return item === 'mudah' ? 'Mudah' : item === 'sukar' ? 'Sukar' : 'Sedang'
}

const required = (value: string | undefined, label: string, number: number) => {
  if (!clean(value)) throw new Error(`Soal ${number}: ${label} wajib diisi.`)
  return clean(value)
}

export const readWordBankTemplate = async (file: File, currentGrade: GradeType, classes: string[], subjects: string[]): Promise<WordBankPreview> => {
  if (!file.name.toLowerCase().endsWith('.docx')) throw new Error('Gunakan template Word berformat .docx.')
  const lines = linesFromXml(await documentXml(file))
  const start = lines.findIndex(line => /^NO\s*:/i.test(line))
  if (start < 0) throw new Error('Tidak ada blok soal. Gunakan template Bank Soal CBT.')
  const metadata = fields(lines.slice(0, start))
  const grade = clean(metadata.JENJANG).toUpperCase() as GradeType
  const classroom = clean(metadata.KELAS)
  const subject = clean(metadata.MATAPELAJARAN)
  const teacherName = clean(metadata.PENYUSUN)
  if (!['SMP', 'SMK'].includes(grade)) throw new Error('Metadata JENJANG harus SMP atau SMK.')
  if (grade !== currentGrade) throw new Error(`Template ini untuk ${grade}, sedangkan Bank Soal aktif adalah ${currentGrade}.`)
  if (!classes.includes(classroom)) throw new Error('KELAS pada template tidak ditemukan di Manajemen Kelas.')
  if (!subjects.includes(subject)) throw new Error('MATA_PELAJARAN pada template tidak ditemukan pada jenjang ini.')
  if (!teacherName) throw new Error('PENYUSUN pada template wajib diisi.')

  const blocks: string[][] = []
  let block: string[] = []
  for (const line of lines.slice(start)) {
    if (/^NO\s*:/i.test(line) && block.length) { blocks.push(block); block = [] }
    block.push(line) // penanda "---" ikut agar fields() memutus lanjutan kolom narasi
  }
  if (block.length) blocks.push(block)
  const options = grade === 'SMP' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']
  const questions: BankQuestionItem[] = []
  const issues: WordBankIssue[] = []
  blocks.forEach((item, index) => {
    const row = fields(item)
    const number = Number(row.NO || index + 1)
    try {
      const type = toType(row.TIPE)
      if (!type) throw new Error(`Soal ${number}: TIPE harus PG, Esai, atau Interaktif (soal Isian sudah tidak dipakai).`)
      const text = required(row.PERTANYAAN, 'PERTANYAAN', number)
      const question: BankQuestionItem = {
        id: `Q-IMP-${Date.now()}-${index + 1}`,
        number: questions.length + 1,
        type,
        difficulty: toDifficulty(row.KESULITAN),
        text,
        isRtl: /[\u0600-\u06FF]/.test(text),
        key: ''
      }
      const jenisJawaban = keyOf(row.JENISJAWABAN || 'PG')
      if (type === 'Interaktif' && !['PG', 'PGMULTI', 'ISIAN'].includes(jenisJawaban)) {
        throw new Error(`Soal ${number}: JENIS_JAWABAN interaktif harus PG, PG Multi, atau Isian.`)
      }
      const needsOptions = type === 'PG' || (type === 'Interaktif' && jenisJawaban !== 'ISIAN')
      if (needsOptions) {
        question.options = options.map(key => ({ key, text: required(row[`PILIHAN${key}`], `PILIHAN_${key}`, number) }))
        const answers = required(row.KUNCI, 'KUNCI', number).toUpperCase().split(',').map(clean)
        if (!answers.every(answer => options.includes(answer))) throw new Error(`Soal ${number}: KUNCI PG tidak sesuai pilihan jawaban.`)
        question.isMultiSelect = type === 'Interaktif' ? jenisJawaban === 'PGMULTI' : keyOf(row.MODEPG) === 'MULTI'
        if (!question.isMultiSelect && answers.length !== 1) throw new Error(`Soal ${number}: PG tunggal hanya boleh memiliki satu KUNCI.`)
        question.key = question.isMultiSelect ? answers : answers[0]
      }
      if (type === 'Esai') question.rubric = required(row.RUBRIK, 'RUBRIK', number)
      if (type === 'Interaktif') {
        const mediaUrl = required(row.LINKMEDIA, 'LINK_MEDIA', number)
        const mediaType = keyOf(row.MEDIA) === 'AUDIO' ? 'audio' : 'video'
        if (!/^https?:\/\//i.test(mediaUrl) && !(mediaType === 'audio' && mediaUrl.startsWith('/'))) {
          throw new Error(`Soal ${number}: LINK_MEDIA harus berupa tautan lengkap.`)
        }
        if (mediaType === 'video' && !/(youtube\.com|youtu\.be)/i.test(mediaUrl)) throw new Error(`Soal ${number}: video harus menggunakan tautan YouTube.`)
        question.mediaType = mediaType
        question.mediaUrl = mediaUrl
        question.interactiveAnswerType = jenisJawaban === 'ISIAN' ? 'Isian' : question.isMultiSelect ? 'PG_Multi' : 'PG'
        if (jenisJawaban === 'ISIAN') question.key = required(row.KUNCI, 'KUNCI', number)
      }
      questions.push(question)
    } catch (error) {
      issues.push({ number, message: error instanceof Error ? error.message : 'Format soal tidak valid.' })
    }
  })
  if (!questions.length) throw new Error(`Tidak ada butir soal yang valid dalam dokumen.${issues[0] ? ` ${issues[0].message}` : ''}`)
  return {
    classroom,
    subject,
    questionCount: questions.length,
    totalCount: blocks.length,
    issues,
    package: {
      id: `PKG-IMP-${Date.now()}`,
      code: `IMP-${subject.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      classroom,
      subject,
      grade,
      difficulty: toDifficulty(metadata.KESULITANPAKET),
      teacherName,
      updatedAt: 'Baru saja',
      hasInteractive: questions.some(question => question.type === 'Interaktif'),
      questions
    }
  }
}
