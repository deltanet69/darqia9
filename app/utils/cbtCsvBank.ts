import type { BankPackage } from '~/components/adminV2/cbt/cbtV2Data'

// Sel yang diawali = + - @ dibaca Excel sebagai rumus; diberi apostrof di depan agar tampil sebagai teks.
const bahaya = /^[=+\-@\t\r]/
const sel = (nilai: unknown): string => {
  let teks = String(nilai ?? '')
  if (bahaya.test(teks)) teks = `'${teks}`
  return `"${teks.replace(/"/g, '""')}"`
}

const URL_HTTP = /^https?:\/\//i

// CSV bank soal: setiap pilihan, kunci, rubrik, dan media ikut diekspor (berkas bacaan/arsip; impor memakai Excel/Word).
// Gambar tertanam (data URL) tidak dimasukkan karena ukurannya merusak berkas; jumlahnya dikembalikan untuk diberitahukan.
export const buildBankCsv = (pkg: BankPackage): { csv: string; fileName: string; gambarDilewati: number } => {
  const huruf = pkg.grade === 'SMP' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']
  const header = ['No', 'Tipe', 'Kesulitan', 'Pertanyaan', ...huruf.map(h => `Pilihan ${h}`), 'Kunci', 'Rubrik', 'Gambar (URL)', 'Jenis Media', 'Media (URL)', 'Arab RTL']
  let gambarDilewati = 0
  const baris = pkg.questions.map((q) => {
    if (q.imageUrl && !URL_HTTP.test(q.imageUrl)) gambarDilewati += 1
    return [
      q.number,
      q.type,
      q.difficulty,
      q.text,
      ...huruf.map(h => q.options?.find(o => o.key === h)?.text ?? ''),
      Array.isArray(q.key) ? q.key.join(', ') : q.key || '',
      q.rubric || '',
      q.imageUrl && URL_HTTP.test(q.imageUrl) ? q.imageUrl : '',
      q.mediaType ? (q.mediaType === 'audio' ? 'Audio' : 'Video') : '',
      q.mediaUrl || '',
      q.isRtl ? 'Ya' : 'Tidak'
    ].map(sel).join(',')
  })
  return {
    // BOM agar Excel membaca UTF-8 (huruf Arab dan simbol) dengan benar.
    csv: '﻿' + [header.map(sel).join(','), ...baris].join('\r\n'),
    fileName: `Bank_Soal_${pkg.subject}_${pkg.classroom}.csv`.replace(/[\\/:*?"<>|]+/g, '-'),
    gambarDilewati
  }
}
