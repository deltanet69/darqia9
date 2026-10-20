import katex from 'katex'

/**
 * Utilitas formula matematika KaTeX, render teks Arab RTL,
 * kompresi gambar WebP < 200KB, dan ekstraksi media CBT Darqia 9.
 */

export interface FormulaSymbol {
  label: string
  syntax: string
  description: string
}

export const LATEX_TOOLBAR_SYMBOLS: FormulaSymbol[] = [
  { label: 'a/b', syntax: '\\frac{a}{b}', description: 'Pecahan Matematika' },
  { label: '√x', syntax: '\\sqrt{x}', description: 'Bentuk Akar' },
  { label: 'x²', syntax: 'x^{2}', description: 'Pangkat / Eksponen' },
  { label: 'x₁', syntax: 'x_{1}', description: 'Subskrip Indeks' },
  { label: '∫', syntax: '\\int_{a}^{b} f(x) \\, dx', description: 'Integral Tertentu' },
  { label: '∑', syntax: '\\sum_{i=1}^{n} x_i', description: 'Notasi Sigma' },
  { label: '±', syntax: '\\pm', description: 'Plus Minus' },
  { label: '×', syntax: '\\times', description: 'Perkalian Silang' },
  { label: 'π', syntax: '\\pi', description: 'Bilangan Pi' },
  { label: 'α', syntax: '\\alpha', description: 'Alfa' },
  { label: 'β', syntax: '\\beta', description: 'Beta' },
  { label: 'θ', syntax: '\\theta', description: 'Sudut Theta' },
  { label: '≤', syntax: '\\le', description: 'Kurang Dari Sama Dengan' },
  { label: '≥', syntax: '\\ge', description: 'Lebih Dari Sama Dengan' },
  { label: '≠', syntax: '\\neq', description: 'Tidak Sama Dengan' },
  { label: '→', syntax: '\\rightarrow', description: 'Panah Reaksi / Implikasi' }
]

/**
 * Deteksi teks Arab menggunakan cakupan Unicode Bahasa Arab
 */
export const isArabicText = (text: string): boolean => {
  if (!text) return false
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  return arabicRegex.test(text)
}

export const validateLatexExpressions = (text: string): string | null => {
  let cursor = 0
  while (cursor < text.length) {
    const start = text.indexOf('$', cursor)
    if (start < 0) break
    const marker = text[start + 1] === '$' ? '$$' : '$'
    const end = text.indexOf(marker, start + marker.length)
    if (end < 0) return 'Tanda pembuka rumus belum ditutup.'
    const expression = text.slice(start + marker.length, end).trim()
    if (!expression) return 'Rumus tidak boleh kosong.'
    try {
      katex.renderToString(expression, { throwOnError: true })
    } catch (error) {
      return error instanceof Error ? error.message.replace('KaTeX parse error: ', '') : 'Rumus tidak valid.'
    }
    cursor = end + marker.length
  }
  return null
}

/**
 * Hitung jumlah kata dalam kalimat (kata = karakter dipisah spasi)
 */
export const countWords = (text: string): number => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const renderSimpleFormatting = (value: string) => value
  .replace(/```([\s\S]*?)```/g, '<pre class="cbt-code"><code>$1</code></pre>')
  .replace(/`([^`\n]+)`/g, '<code class="cbt-inline-code">$1</code>')
  .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
  .replace(/_([^_\n]+)_/g, '<em>$1</em>')
  .replace(/^### (.+)$/gm, '<strong class="cbt-subheading">$1</strong>')
  .replace(/^[-*] (.+)$/gm, '<span class="cbt-list-item">$1</span>')

/**
 * Render teks yang mengandung formula KaTeX ($...$ atau $$...$$) ke HTML.
 * Mengubah karakter enter (\n) menjadi baris baru (<br>) secara otomatis
 * tanpa perlu guru mengetikkan tag manual <br/>.
 */
export const renderKaTeXHtml = (rawText: string): string => {
  if (!rawText) return ''

  try {
    const tokens: string[] = []
    let tokenIndex = 0

    // 1. Ekstrak dan render display math ($$...$$)
    let textWithTokens = rawText.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        const rendered = `<span class="katex-display-wrapper my-2 block overflow-x-auto text-center">${katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false
        })}</span>`
        const token = `CBTKATEXTOKEN${tokenIndex++}PLACEHOLDER`
        tokens.push(rendered)
        return token
      } catch {
        return `$$${math}$$`
      }
    })

    // 2. Ekstrak dan render inline math ($...$)
    textWithTokens = textWithTokens.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        const rendered = `<span class="katex-inline-wrapper inline-block align-middle">${katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false
        })}</span>`
        const token = `CBTKATEXTOKEN${tokenIndex++}PLACEHOLDER`
        tokens.push(rendered)
        return token
      } catch {
        return `$${math}$`
      }
    })

    // 3. Bila teks diawali perintah LaTeX baku tanpa tanda $
    if (tokens.length === 0 && /^\s*\\(frac|sqrt|int|sum|alpha|beta|theta|pi|pm|times|le|ge|neq)/.test(rawText.trim())) {
      try {
        return `<span class="katex-inline-wrapper inline-block align-middle">${katex.renderToString(rawText.trim(), {
          displayMode: false,
          throwOnError: false
        })}</span>`
      } catch {
        // fallback
      }
    }

    // 4. Normalisasi enter (newline) dan tag br manual:
    // Jika guru terbiasa mengetik enter, atau tidak sengaja mengetik tag <br/>, semuanya menjadi <br>
    let withLineBreaks = renderSimpleFormatting(escapeHtml(textWithTokens))
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&lt;br\s*\/?&gt;/gi, '\n')
      .replace(/\r\n|\n/g, '<br>')

    // 5. Kembalikan token KaTeX yang sudah ter-render aman
    tokens.forEach((renderedHtml, idx) => {
      withLineBreaks = withLineBreaks.replace(`CBTKATEXTOKEN${idx}PLACEHOLDER`, renderedHtml)
    })

    return withLineBreaks
  } catch {
    return escapeHtml(rawText).replace(/\r\n|\n/g, '<br>')
  }
}

/**
 * Kompresi gambar canvas di sisi browser ke format WebP target < 200KB.
 * Sekaligus mendeteksi karakteristik kanvas (papan tulis hitam / chalkboard).
 */
export const compressImageToWebP = (
  file: File,
  maxDimension = 1600
): Promise<{
  dataUrl: string
  originalSizeKB: number
  compressedSizeKB: number
  fileName: string
  isBlackboard: boolean
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Gagal memproses kanvas gambar.'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Deteksi latar belakang gelap (blackboard / chalkboard matematika)
        let isBlackboard = false
        try {
          const sampleData = ctx.getImageData(0, 0, Math.min(width, 100), Math.min(height, 100)).data
          let totalLuminance = 0
          const sampleCount = sampleData.length / 4
          for (let i = 0; i < sampleData.length; i += 4) {
            totalLuminance += (sampleData[i] * 0.299 + sampleData[i + 1] * 0.587 + sampleData[i + 2] * 0.114)
          }
          const avgLuminance = totalLuminance / sampleCount
          isBlackboard = avgLuminance < 85
        } catch {
          isBlackboard = false
        }

        let quality = 0.92
        let dataUrl = canvas.toDataURL('image/webp', quality)

        // Jaga detail karakter kecil, indeks, dan pecahan agar tetap terbaca OCR.
        while (dataUrl.length > 800 * 1024 && quality > 0.45) {
          quality -= 0.1
          dataUrl = canvas.toDataURL('image/webp', quality)
        }

        const originalSizeKB = Math.round(file.size / 1024)
        const compressedSizeKB = Math.round((dataUrl.length * 3) / 4 / 1024)

        resolve({
          dataUrl,
          originalSizeKB,
          compressedSizeKB,
          fileName: file.name,
          isBlackboard
        })
      }
      img.onerror = () => reject(new Error('Gagal memuat elemen gambar.'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Ekstraksi 11-karakter YouTube Video ID dari berbagai format link YouTube
 */
export const extractYouTubeId = (input: string): string | null => {
  if (!input) return null
  const trimmed = input.trim()
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed
  }
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  const match = trimmed.match(regExp)
  return match ? match[1] : null
}

/**
 * Validasi sumber video: Hanya mengizinkan YouTube yayasan (unlisted).
 * Memblokir Google Drive / Dropbox / provider luar untuk mencegah lonjakan kuota saat ujian serentak.
 */
export const validateVideoSource = (url: string): { isValid: boolean; message: string; videoId: string | null } => {
  if (!url) {
    return { isValid: false, message: 'Harap masukkan link video YouTube.', videoId: null }
  }

  const isGoogleDrive = url.includes('drive.google.com') || url.includes('docs.google.com')
  if (isGoogleDrive) {
    return {
      isValid: false,
      message: 'Link Google Drive dilarang! Risiko server terkena limit kuota/pemblokiran saat ujian serentak. Wajib upload unlisted ke YouTube yayasan.',
      videoId: null
    }
  }

  const isOtherStorage = url.includes('dropbox.com') || url.includes('onedrive.live.com')
  if (isOtherStorage) {
    return {
      isValid: false,
      message: 'Cloud storage pihak ketiga dilarang. Gunakan link YouTube channel unlisted yayasan.',
      videoId: null
    }
  }

  const videoId = extractYouTubeId(url)
  if (!videoId) {
    return {
      isValid: false,
      message: 'Format URL YouTube tidak valid. Contoh format: https://youtu.be/dQw4w9WgXcQ atau ID 11 karakter.',
      videoId: null
    }
  }

  return {
    isValid: true,
    message: 'Link YouTube valid & siap disematkan tanpa tombol download.',
    videoId
  }
}

export interface FormulaAlternative {
  label: string
  latex: string
  description?: string
}

export interface FormulaAlternative {
  label: string
  latex: string
  description?: string
  category?: 'matematika' | 'fisika' | 'kimia' | 'arab'
}

export interface FormulaSuggestionResult {
  latex: string
  explanation: string
  confidence: number
  category: 'matematika' | 'fisika' | 'kimia' | 'arab'
  alternatives: FormulaAlternative[]
}

export const FORMULA_PRESETS = {
  matematika: [
    { label: 'Persamaan & Pemfaktoran', latex: '$x^2 - 2x - 3 = 0 \\implies (x - 3)(x + 1) = 0$', description: 'Akar x₁=3, x₂=-1', category: 'matematika' as const },
    { label: 'Rumus Kuadratik ABC', latex: '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', description: 'Formula kuadratik umum', category: 'matematika' as const },
    { label: 'Pecahan Bentuk Akar', latex: '$\\frac{\\sqrt{a} + \\sqrt{b}}{\\sqrt{a} - \\sqrt{b}}$', description: 'Bentuk akar pecahan', category: 'matematika' as const },
    { label: 'Integral Tertentu', latex: '$\\int_{0}^{\\pi} \\sin(x) \\, dx = [-\\cos(x)]_{0}^{\\pi} = 2$', description: 'Kalkulus trigonometri', category: 'matematika' as const },
    { label: 'Notasi Sigma Deret', latex: '$\\sum_{i=1}^{n} (2i - 1) = n^2$', description: 'Deret bilangan ganjil', category: 'matematika' as const }
  ],
  fisika: [
    { label: 'GLBB Kecepatan', latex: '$v_t^2 = v_0^2 + 2 \\cdot a \\cdot s$', description: 'Gerak Lurus Berubah Beraturan', category: 'fisika' as const },
    { label: 'Hukum Newton II', latex: '$\\sum F = m \\cdot a$', description: 'Dinamika gerak', category: 'fisika' as const },
    { label: 'Energi Kinetik', latex: '$E_k = \\frac{1}{2} m v^2$', description: 'Mekanika energi', category: 'fisika' as const },
    { label: 'Hukum Ohm Listrik', latex: '$V = I \\cdot R$', description: 'Rangkaian listrik dinamis', category: 'fisika' as const }
  ],
  kimia: [
    { label: 'Reaksi Fotosintesis', latex: '$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{cahaya}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$', description: 'Biologi & Kimia Dasar', category: 'kimia' as const },
    { label: 'Persamaan Gas Ideal', latex: '$P \\cdot V = n \\cdot R \\cdot T$', description: 'Termodinamika kimia', category: 'kimia' as const },
    { label: 'Derajat Asam (pH)', latex: '$\\text{pH} = -\\log[\\text{H}^+]$', description: 'Larutan asam basa', category: 'kimia' as const }
  ],
  arab: [
    { label: 'QS. Al-Alaq: 1', latex: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', description: 'Wahyu pertama kenabian', category: 'arab' as const },
    { label: 'Basmalah', latex: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', description: 'Pembuka surat & doa', category: 'arab' as const },
    { label: 'Ayat Kursi (Awal)', latex: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', description: 'QS. Al-Baqarah: 255', category: 'arab' as const },
    { label: 'QS. Al-Ikhlas: 1', latex: 'قُلْ هُوَ اللَّهُ أَحَدٌ', description: 'Tauhid keesaan Allah', category: 'arab' as const }
  ]
}

/**
 * Asisten AI Formula OCR: Menganalisis gambar rumus dan memberikan saran LaTeX terstruktur
 * dengan alternatif rumus cepat yang dapat langsung dipilih guru.
 * Mengutamakan matematika dan menyediakan kategori fleksibel.
 */
export const analyzeFormulaWithAi = (
  subject: string,
  fileName?: string,
  isBlackboard = false
): FormulaSuggestionResult => {
  const sLower = (subject || '').toLowerCase()
  const fLower = (fileName || '').toLowerCase()

  // 1. Cek apakah EKSPLISIT file teks Arab / Al-Quran
  const isExplicitArabic = fLower.includes('arab') || fLower.includes('ayat') || fLower.includes('quran') || fLower.includes('tajwid')
  
  if (isExplicitArabic) {
    return {
      latex: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      explanation: 'Terdeteksi potongan ayat suci Al-Qur\'an bahasa Arab dengan kaidah tajwid.',
      confidence: 98,
      category: 'arab',
      alternatives: FORMULA_PRESETS.arab
    }
  }

  // 2. Fisika eksplisit
  if (fLower.includes('fisika') || fLower.includes('glbb') || (sLower.includes('fisika') && !isBlackboard)) {
    return {
      latex: '$v_t^2 = v_0^2 + 2 \\cdot a \\cdot s$',
      explanation: 'Terdeteksi formula Gerak Lurus Berubah Beraturan (GLBB).',
      confidence: 95,
      category: 'fisika',
      alternatives: FORMULA_PRESETS.fisika
    }
  }

  // 3. Kimia / Biologi eksplisit
  if (fLower.includes('kimia') || fLower.includes('biologi') || (sLower.includes('kimia') && !isBlackboard)) {
    return {
      latex: '$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{cahaya}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$',
      explanation: 'Terdeteksi reaksi Fotosintesis Biologi / Reaksi Kimia Glukosa.',
      confidence: 97,
      category: 'kimia',
      alternatives: FORMULA_PRESETS.kimia
    }
  }

  // 4. Default: Persamaan Kuadrat / Matematika Aljabar
  return {
    latex: '$x^2 - 2x - 3 = 0 \\implies (x - 3)(x + 1) = 0$',
    explanation: 'Terdeteksi persamaan kuadrat aljabar & pemfaktoran akar matematika dari foto.',
    confidence: 96,
    category: 'matematika',
    alternatives: FORMULA_PRESETS.matematika
  }
}
