import type { BankPackage, BankQuestionItem, GradeType } from '~/components/adminV2/cbt/cbtV2Data'
import type { WordBankIssue, WordBankPreview } from './cbtWordBank'

const clean = (value: unknown) => String(value ?? '').trim()
const keyOf = (value = '') => value.toUpperCase().replace(/[^A-Z0-9]/g, '')

const toDifficulty = (value: string): BankQuestionItem['difficulty'] => {
  const item = clean(value).toLowerCase()
  return item === 'mudah' ? 'Mudah' : item === 'sukar' ? 'Sukar' : 'Sedang'
}

const DATA_HEADERS = (grade: GradeType) => [
  'No', 'Tipe', 'Kesulitan', 'Pertanyaan',
  ...(grade === 'SMP' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']).map(key => `Pilihan ${key}`),
  'Kunci', 'Rubrik', 'Gambar (URL)', 'Jenis Media', 'Media (URL YouTube / Path Audio)', 'Arab RTL', 'Jenis Jawaban Interaktif'
]

export const readExcelBankTemplate = async (file: File, currentGrade: GradeType, classes: string[], subjects: string[]): Promise<WordBankPreview> => {
  if (!file.name.toLowerCase().endsWith('.xlsx')) throw new Error('Gunakan template Excel berformat .xlsx.')
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })

  const metadataSheet = workbook.Sheets.Metadata
  if (!metadataSheet) throw new Error('Sheet "Metadata" tidak ditemukan. Gunakan template Excel resmi Bank Soal.')
  const metadataRows = XLSX.utils.sheet_to_json<unknown[]>(metadataSheet, { header: 1, defval: '' })
  const metadata: Record<string, string> = {}
  for (const row of metadataRows) {
    const key = keyOf(clean(row[0]))
    if (key) metadata[key] = clean(row[1])
  }
  const grade = clean(metadata.JENJANG).toUpperCase() as GradeType
  const classroom = clean(metadata.KELAS)
  const subject = clean(metadata.MATAPELAJARAN)
  const teacherName = clean(metadata.PENYUSUN)
  if (!['SMP', 'SMK'].includes(grade)) throw new Error('Metadata JENJANG harus SMP atau SMK.')
  if (grade !== currentGrade) throw new Error(`Template ini untuk ${grade}, sedangkan Bank Soal aktif adalah ${currentGrade}.`)
  if (!classes.includes(classroom)) throw new Error('KELAS pada template tidak ditemukan di Manajemen Kelas.')
  if (!subjects.includes(subject)) throw new Error('MATA_PELAJARAN pada template tidak ditemukan pada jenjang ini.')
  if (!teacherName) throw new Error('PENYUSUN pada template wajib diisi.')

  const dataSheet = workbook.Sheets['Data Soal']
  if (!dataSheet) throw new Error('Sheet "Data Soal" tidak ditemukan. Gunakan template Excel resmi Bank Soal.')
  const rows = XLSX.utils.sheet_to_json<unknown[]>(dataSheet, { header: 1, defval: '' })
  const headerIndex = rows.findIndex(row => row.some(cell => keyOf(clean(cell)) === 'TIPE') && row.some(cell => keyOf(clean(cell)) === 'PERTANYAAN'))
  if (headerIndex < 0) throw new Error('Kolom soal tidak ditemukan. Jangan mengubah nama kolom pada template Excel.')
  const columns: Record<string, number> = {}
  rows[headerIndex].forEach((cell, index) => {
    const key = keyOf(clean(cell))
    if (key) columns[key] = index
  })
  const mediaColumn = Object.keys(columns).find(key => key.startsWith('MEDIA'))
  const cellOf = (row: unknown[], name: string) => {
    const index = name === 'MEDIA' ? (mediaColumn ? columns[mediaColumn] : -1) : columns[keyOf(name)]
    return index === undefined || index < 0 ? '' : clean(row[index])
  }

  const letters = grade === 'SMP' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']
  const questions: BankQuestionItem[] = []
  const issues: WordBankIssue[] = []
  let totalCount = 0
  rows.slice(headerIndex + 1).forEach((row, rowIndex) => {
    if (row.every(cell => !clean(cell))) return
    const typeValue = cellOf(row, 'Tipe')
    if (!typeValue && clean(row[0]).toUpperCase().startsWith('SECTION')) return
    totalCount += 1
    const number = Number(cellOf(row, 'No')) || totalCount
    try {
      const typeKey = keyOf(typeValue)
      const type = typeKey === 'PG' || typeKey === 'PILIHANGANDA' ? 'PG'
        : typeKey === 'ISIAN' || typeKey === 'ISIANSINGKAT' ? 'Isian'
        : typeKey === 'ESAI' || typeKey === 'ESSAY' ? 'Esai'
        : typeKey === 'INTERAKTIF' ? 'Interaktif' : null
      if (!type) throw new Error(`Soal ${number}: Tipe harus PG, Isian, Esai, atau Interaktif.`)
      const text = cellOf(row, 'Pertanyaan')
      if (!text) throw new Error(`Soal ${number}: Pertanyaan wajib diisi.`)
      const question: BankQuestionItem = {
        id: `Q-IMP-${Date.now()}-${rowIndex + 1}`,
        number: questions.length + 1,
        type,
        difficulty: toDifficulty(cellOf(row, 'Kesulitan')),
        text,
        isRtl: keyOf(cellOf(row, 'Arab RTL')) === 'YA' || /[\u0600-\u06FF]/.test(text),
        key: ''
      }
      const imageUrl = cellOf(row, 'Gambar (URL)')
      if (/^https?:\/\//i.test(imageUrl)) question.imageUrl = imageUrl
      const jenisJawaban = keyOf(cellOf(row, 'Jenis Jawaban Interaktif') || 'PG')
      if (type === 'Interaktif' && !['PG', 'PGMULTI', 'ISIAN'].includes(jenisJawaban)) {
        throw new Error(`Soal ${number}: Jenis Jawaban Interaktif harus PG, PG Multi, atau Isian.`)
      }
      const needsOptions = type === 'PG' || (type === 'Interaktif' && jenisJawaban !== 'ISIAN')
      if (needsOptions) {
        question.options = letters.map(key => {
          const optionText = cellOf(row, `Pilihan ${key}`)
          if (!optionText) throw new Error(`Soal ${number}: Pilihan ${key} wajib diisi.`)
          return { key, text: optionText }
        })
        const answers = cellOf(row, 'Kunci').toUpperCase().split(/[\s,;]+/).filter(Boolean)
        if (!answers.length) throw new Error(`Soal ${number}: KUNCI wajib diisi.`)
        if (!answers.every(answer => letters.includes(answer))) throw new Error(`Soal ${number}: KUNCI tidak sesuai pilihan jawaban.`)
        question.isMultiSelect = answers.length > 1
        question.key = question.isMultiSelect ? answers : answers[0]
      }
      if (type === 'Isian') {
        const key = cellOf(row, 'Kunci')
        if (!key) throw new Error(`Soal ${number}: KUNCI wajib diisi untuk soal Isian.`)
        question.key = key
      }
      if (type === 'Esai') {
        const rubric = cellOf(row, 'Rubrik')
        if (!rubric) throw new Error(`Soal ${number}: RUBRIK wajib diisi untuk soal Esai.`)
        question.rubric = rubric
      }
      if (type === 'Interaktif') {
        const mediaKind = keyOf(cellOf(row, 'Jenis Media'))
        if (!['AUDIO', 'VIDEO'].includes(mediaKind)) throw new Error(`Soal ${number}: Jenis Media harus Audio atau Video.`)
        let mediaUrl = cellOf(row, 'MEDIA')
        if (!mediaUrl) throw new Error(`Soal ${number}: Media wajib diisi.`)
        const mediaType = mediaKind === 'AUDIO' ? 'audio' : 'video'
        if (mediaType === 'video') {
          if (/^[A-Za-z0-9_-]{11}$/.test(mediaUrl)) mediaUrl = `https://www.youtube.com/watch?v=${mediaUrl}`
          if (!/(youtube\.com|youtu\.be)/i.test(mediaUrl)) throw new Error(`Soal ${number}: video harus menggunakan tautan YouTube.`)
        } else if (!/^https?:\/\//i.test(mediaUrl) && !mediaUrl.startsWith('/')) {
          throw new Error(`Soal ${number}: Media audio harus berupa tautan lengkap atau path berkas MP3.`)
        }
        question.mediaType = mediaType
        question.mediaUrl = mediaUrl
        question.interactiveAnswerType = jenisJawaban === 'ISIAN' ? 'Isian' : question.isMultiSelect ? 'PG_Multi' : 'PG'
        if (jenisJawaban === 'ISIAN') {
          const key = cellOf(row, 'Kunci')
          if (!key) throw new Error(`Soal ${number}: KUNCI wajib diisi untuk jawaban Isian interaktif.`)
          question.key = key
        }
      }
      questions.push(question)
    } catch (error) {
      issues.push({ number, message: error instanceof Error ? error.message : 'Format soal tidak valid.' })
    }
  })
  if (!questions.length) throw new Error(`Tidak ada butir soal yang valid dalam file Excel.${issues[0] ? ` ${issues[0].message}` : ''}`)
  return {
    classroom,
    subject,
    questionCount: questions.length,
    totalCount,
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

export const buildBankExcel = async (pkg: BankPackage): Promise<{ blob: Blob; fileName: string }> => {
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()
  const metadataSheet = XLSX.utils.aoa_to_sheet([
    ['METADATA BANK SOAL'],
    ['JENJANG', pkg.grade],
    ['KELAS', pkg.classroom],
    ['MATA_PELAJARAN', pkg.subject],
    ['PENYUSUN', pkg.teacherName],
    ['KESULITAN_PAKET', pkg.difficulty]
  ])
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata')
  const letters = pkg.grade === 'SMP' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']
  const rows: unknown[][] = [DATA_HEADERS(pkg.grade)]
  for (const question of pkg.questions) {
    const optionOf = (key: string) => question.options?.find(option => option.key === key)?.text || ''
    rows.push([
      question.number,
      question.type,
      question.difficulty,
      question.text,
      ...letters.map(optionOf),
      Array.isArray(question.key) ? question.key.join(', ') : question.key || '',
      question.rubric || '',
      question.imageUrl || '',
      question.mediaType ? (question.mediaType === 'audio' ? 'Audio' : 'Video') : '',
      question.mediaUrl || '',
      question.isRtl ? 'Ya' : 'Tidak',
      question.type === 'Interaktif'
        ? question.interactiveAnswerType === 'PG_Multi' ? 'PG Multi' : question.interactiveAnswerType === 'Isian' ? 'Isian' : 'PG'
        : ''
    ])
  }
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Data Soal')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['File ini hasil Export Excel dari Bank Soal Darqia 9 dan dapat diimpor kembali.'],
    ['Isi metadata di sheet "Metadata"; satu baris di sheet "Data Soal" = satu soal.'],
    ['Jangan mengubah nama sheet dan nama kolom agar impor berjalan lancar.']
  ]), 'Petunjuk')
  const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  const result = {
    blob: new Blob([output], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fileName: `Bank_Soal_${pkg.subject}_${pkg.classroom}.xlsx`
  }
  return result
}
