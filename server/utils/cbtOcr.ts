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
