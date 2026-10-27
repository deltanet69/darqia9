export const parseOcrExtraction = (content: unknown) => {
  if (typeof content !== 'string' || !content.trim()) throw new Error('empty')
  const raw = content.trim().replace(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i, '$1').trim()
  let extracted: any
  try {
    extracted = JSON.parse(raw)
    if (typeof extracted === 'string') extracted = JSON.parse(extracted)
  } catch {
    // Penyedia kadang mengirim isi JSON yang masih ter-escape satu lapis.
    extracted = JSON.parse(JSON.parse('"' + raw + '"'))
  }
  if (typeof extracted?.text !== 'string' || !extracted.text.trim()) throw new Error('empty')
  return {
    text: extracted.text.trim(),
    isRtl: extracted.isRtl === true,
    containsFormula: extracted.containsFormula === true,
    reviewNote: typeof extracted.reviewNote === 'string' ? extracted.reviewNote : ''
  }
}

export const ocrTextsAgree = (first: string, second: string) => {
  const normalize = (text: string) => text.normalize('NFC')
    .replace(/\\(?:left|right)|\\[,;!]|\s+/g, '')
    .replace(/([_^])\{([a-zA-Z0-9])\}/g, '$1$2')
    .replace(/\\sqrt\{\(([^()]+)\)\}/g, '\\sqrt{$1}')
  return normalize(first) === normalize(second)
}

// Perbandingan longgar khusus kerangka huruf: harakat, tanda Quran, dan bentuk huruf
// Arab yang setara diabaikan. Dipakai hanya untuk memvalidasi hasil ajudikasi terhadap
// salah satu kandidat (isi hurufnya harus sama), BUKAN untuk menyatakan dua pembacaan
// identik - kesepakatan persis tetap urusan ocrTextsAgree di atas.
export const ocrTextsAgreeLoose = (first: string, second: string) => {
  const normalize = (text: string) => text.normalize('NFKC')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0627\u0626/g, '\u0626')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .replace(/[\u0660-\u0669]/g, digit => String.fromCharCode(48 + digit.charCodeAt(0) - 0x660))
    .replace(/[\u06F0-\u06F9]/g, digit => String.fromCharCode(48 + digit.charCodeAt(0) - 0x6F0))
    .replace(/\\(?:left|right)|\\[,;!]|\s+/g, '')
    .replace(/\\[dt]frac/g, '\\frac')
    .replace(/([_^])\{([a-zA-Z0-9])\}/g, '$1$2')
    .replace(/\\sqrt\{\(([^()]+)\)\}/g, '\\sqrt{$1}')
  return normalize(first) === normalize(second)
}

export const ocrFidelityScore = (text: string) => (text.match(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g) || []).length
