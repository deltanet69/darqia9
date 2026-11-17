// Sampul buku = halaman 1 PDF-nya, dirender di klien (pdf.js, hanya mengunduh bagian awal berkas lewat Range).
// Antrean 2 sekaligus + cache memori/sessionStorage supaya katalog ratusan buku tidak membebani peramban.
const cache = new Map<string, string>()
const antre: Array<() => Promise<void>> = []
let jalan = 0

const jalankan = () => {
  while (jalan < 2 && antre.length) {
    jalan++
    antre.shift()!().finally(() => { jalan--; jalankan() })
  }
}

async function render(id: string, token: string): Promise<string> {
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default
  const doc = await pdfjs.getDocument({ url: `/api/perpus/berkas/${encodeURIComponent(id)}`, httpHeaders: { Authorization: `Bearer ${token}` }, rangeChunkSize: 131072 }).promise
  try {
    const page = await doc.getPage(1)
    const w0 = page.getViewport({ scale: 1 }).width
    const vp = page.getViewport({ scale: 380 / w0 })
    const kanvas = document.createElement('canvas')
    kanvas.width = Math.round(vp.width); kanvas.height = Math.round(vp.height)
    await page.render({ canvasContext: kanvas.getContext('2d')!, viewport: vp }).promise
    return kanvas.toDataURL('image/jpeg', 0.82)
  } finally { doc.destroy() }
}

// Mengembalikan data URL sampul, atau '' bila gagal (kartu tetap memakai sampul teks).
export function sampulBuku(id: string, token: () => Promise<string>): Promise<string> {
  const k = 'pp-sampul:' + id
  const ada = cache.get(id) ?? (() => { try { return sessionStorage.getItem(k) || '' } catch { return '' } })()
  if (ada) { cache.set(id, ada); return Promise.resolve(ada) }
  return new Promise((selesai) => {
    antre.push(async () => {
      try {
        const url = await render(id, await token())
        cache.set(id, url)
        try { sessionStorage.setItem(k, url) } catch { /* penyimpanan penuh: cukup cache memori */ }
        selesai(url)
      } catch { selesai('') }
    })
    jalankan()
  })
}
