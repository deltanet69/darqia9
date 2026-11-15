import type { BankQuestionItem } from '~/components/adminV2/cbt/cbtV2Data'
import { kelompokCerita } from './cbtCerita.ts'

// Soal cerita di template impor: guru menulis kode yang sama (mis. C1) di semua soal satu cerita,
// teks ceritanya cukup di baris pertama. Kode dibaca tanpa beda huruf besar/kecil dan spasi.
export interface BarisCerita { number: number, kode: string, teks: string, soal: BankQuestionItem }

export const terapkanKodeCerita = (baris: BarisCerita[]): { soal: BankQuestionItem[], issues: { number: number, message: string }[] } => {
  const issues: { number: number, message: string }[] = []
  const grup = new Map<string, BarisCerita[]>()
  for (const b of baris) {
    const kode = b.kode.trim().toUpperCase()
    if (kode) grup.set(kode, [...(grup.get(kode) ?? []), b])
  }
  const tolak = new Set<BarisCerita>()
  for (const [kode, anggota] of grup) {
    const teks = anggota.find(b => b.teks.trim())?.teks.trim()
    const pesan = new Set(anggota.map(b => b.soal.type)).size > 1
      ? (n: number) => `Soal ${n}: Kode Cerita ${kode} dipakai di tipe berbeda.`
      : !teks ? (n: number) => `Soal ${n}: Teks Cerita untuk kode ${kode} belum diisi.` : null
    if (pesan) {
      anggota.forEach(b => { tolak.add(b); issues.push({ number: b.number, message: pesan(b.number) }) })
      continue
    }
    const id = crypto.randomUUID()
    for (const b of anggota) { b.soal.storyGroup = id; b.soal.storyText = teks }
  }
  const soal = kelompokCerita(baris.filter(b => !tolak.has(b)).map(b => b.soal)).flat()
  soal.forEach((q, i) => { q.number = i + 1 })
  return { soal, issues }
}

// Ekspor: kode C1, C2, … sesuai urutan cerita; teks cerita hanya di soal pertama tiap cerita.
export const kodeCeritaEkspor = (soal: BankQuestionItem[]) => {
  const kode = new Map<string, string>()
  return soal.map(q => {
    if (!q.storyGroup) return { kode: '', teks: '' }
    const ada = kode.get(q.storyGroup)
    if (ada) return { kode: ada, teks: '' }
    const baru = `C${kode.size + 1}`
    kode.set(q.storyGroup, baru)
    return { kode: baru, teks: q.storyText || '' }
  })
}

export const angkaMinKata = (nilai: unknown) => Math.max(0, Math.floor(Number(String(nilai ?? '').trim()) || 0))
