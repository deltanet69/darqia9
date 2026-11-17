<script setup lang="ts">
import { usePerpus } from '~/composables/usePerpus'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Pembaca PDF di dalam aplikasi (pdf.js). Satu halaman per layar seperti prototipe: tema, ukuran (zoom),
// favorit halaman, tandai kalimat + catatan (di lapisan teks PDF), rangkuman, dan progres per siswa.
// Tandai tersimpan sebagai kotak relatif terhadap halaman (0–1) sehingga tetap pas di ukuran layar apa pun.
const P = usePerpus()
const W = P.W
const rd = P.reader.value!
const b = computed(() => P.cariBuku(rd.id)!)

const i = ref(rd.i ?? W.value.baca[rd.id]?.i ?? 0)
const n = ref(0)
const panel = ref<string | null>(rd.panel)
const pop = ref(false)
const status = ref<'muat' | 'siap' | 'galat'>('muat')
const galatTeks = ref('')
const anim = ref<'maju' | 'mundur' | null>(null)
const tanpaTeks = ref(false)
const isi = ref<Array<{ judul: string, i: number, tingkat: number }>>([])
type Sel = { jenis: 'baru', r: number[][], teks: string } | { jenis: 'mark', idx: number } | null
const sel = ref<Sel>(null)

const body = ref<HTMLElement>()
const wrap = ref<HTMLElement>()
const kanvas = ref<HTMLCanvasElement>()
const lapisTeks = ref<HTMLElement>()
let pdfjs: any, doc: any, tugas: any, nomor = 0

const halFav = computed(() => W.value.hal.some(x => x.id === rd.id && x.i === i.value))
const marks = computed(() => W.value.tandai.map((x, idx) => ({ ...x, idx })).filter(x => x.id === rd.id && x.i === i.value))
const sudahAdaTandai = computed(() => W.value.tandai.length > 0)
const petunjukTampil = ref(true)
let timerPetunjuk: ReturnType<typeof setTimeout>
let timerResize: ReturnType<typeof setTimeout>

async function gambar() {
  if (!doc || !kanvas.value || !wrap.value || !lapisTeks.value) return
  const saya = ++nomor
  try {
    const page = await doc.getPage(i.value + 1)
    if (saya !== nomor) return

    const bodyEl = body.value
    const availW = bodyEl?.clientWidth || window.innerWidth || 360
    const availH = bodyEl?.clientHeight || window.innerHeight || 600
    const baseVp = page.getViewport({ scale: 1 })
    const zoomFactor = W.value.fs / 19

    let scale: number
    if (availW < 768) {
      // Mobile: Full-screen membaca dari ujung ke ujung tanpa terpotong kotak
      scale = (availW / baseVp.width) * zoomFactor
    } else {
      // Layar lebar / Desktop: Ukuran proporsional optimal dibaca
      const maxLebar = Math.min(availW, 860)
      const scaleW = maxLebar / baseVp.width
      const scaleH = (availH - 24) / baseVp.height
      const baseScale = Math.min(scaleW, scaleH > 0 ? scaleH : scaleW)
      scale = Math.max(0.6, baseScale * zoomFactor)
    }

    const vp = page.getViewport({ scale })
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const c = kanvas.value
    c.width = Math.floor(vp.width * dpr); c.height = Math.floor(vp.height * dpr)
    c.style.width = Math.floor(vp.width) + 'px'; c.style.height = Math.floor(vp.height) + 'px'
    wrap.value.style.setProperty('--scale-factor', String(vp.scale))
    wrap.value.style.width = Math.floor(vp.width) + 'px'; wrap.value.style.height = Math.floor(vp.height) + 'px'
    tugas?.cancel()
    tugas = page.render({ canvasContext: c.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined })
    await tugas.promise
    if (saya !== nomor) return
    lapisTeks.value.replaceChildren()
    await new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: lapisTeks.value, viewport: vp }).render()
    tanpaTeks.value = saya === nomor && lapisTeks.value.querySelector('span') === null
    status.value = 'siap'
    clearTimeout(timerPetunjuk)
    timerPetunjuk = setTimeout(() => { petunjukTampil.value = false }, 3800)
  } catch (e: any) {
    if (e?.name === 'RenderingCancelledException' || saya !== nomor) return
    status.value = 'galat'
    galatTeks.value = 'Halaman gagal ditampilkan. Tutup buku lalu buka lagi.'
  }
}

async function bacaIsi() {
  const hasil: typeof isi.value = []
  const jalan = async (items: any[], tingkat: number) => {
    for (const it of items) {
      if (hasil.length >= 400) return
      try {
        const dest = typeof it.dest === 'string' ? await doc.getDestination(it.dest) : it.dest
        const idx = dest ? await doc.getPageIndex(dest[0]) : -1
        if (idx >= 0) hasil.push({ judul: String(it.title || '').trim().slice(0, 120) || `Halaman ${idx + 1}`, i: idx, tingkat: Math.min(tingkat, 3) })
      } catch { /* tujuan tak terbaca: lewati */ }
      if (it.items?.length) await jalan(it.items, tingkat + 1)
    }
  }
  try { await jalan((await doc.getOutline()) || [], 0) } catch { /* tanpa daftar isi */ }
  isi.value = hasil
}

const saatResize = () => {
  clearTimeout(timerResize)
  timerResize = setTimeout(() => {
    if (status.value === 'siap') gambar()
  }, 120)
}

onMounted(async () => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('resize', saatResize)
  try {
    pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default
    doc = await pdfjs.getDocument({ url: `/api/perpus/berkas/${encodeURIComponent(rd.id)}`, httpHeaders: { Authorization: `Bearer ${await P.token()}` }, rangeChunkSize: 262144 }).promise
    n.value = doc.numPages
    P.catatBuka(rd.id)
    i.value = Math.min(Math.max(i.value, 0), n.value - 1)
    if (!rd.lompat) P.catatBaca(rd.id, i.value, n.value)
    await nextTick()
    await gambar()
    bacaIsi()
  } catch (e: any) {
    status.value = 'galat'
    galatTeks.value = e?.status === 403 || e?.name === 'UnexpectedResponseException' ? 'Buku ini tidak dapat dibuka sekarang. Periksa jadwal buka atau coba lagi nanti.' : 'Buku gagal dimuat. Periksa koneksi lalu coba lagi.'
  }
})
onBeforeUnmount(() => {
  nomor++
  tugas?.cancel()
  doc?.destroy()
  clearTimeout(timerResize)
  clearTimeout(timerPetunjuk)
  window.removeEventListener('resize', saatResize)
  document.body.style.overflow = ''
  document.removeEventListener('selectionchange', saatPilih)
})

watch(() => W.value.fs, () => gambar())

function ganti(baru: number, arah?: 'maju' | 'mundur') {
  if (!doc || baru < 0 || baru >= n.value || baru === i.value) return
  anim.value = arah || (baru < i.value ? 'mundur' : 'maju')
  i.value = baru; sel.value = null
  P.catatBaca(rd.id, baru, n.value)
  nextTick(() => { gambar(); if (body.value) body.value.scrollTop = 0 })
}

// ----- tandai kalimat -----
let selT: ReturnType<typeof setTimeout>
function saatPilih() {
  clearTimeout(selT)
  selT = setTimeout(() => {
    const s = getSelection()
    if (!s || s.isCollapsed || !s.rangeCount || panel.value || !lapisTeks.value || !wrap.value) return
    const r = s.getRangeAt(0)
    if (!lapisTeks.value.contains(r.commonAncestorContainer)) return
    const teks = r.toString().replace(/\s+/g, ' ').trim()
    if (teks.length < 3) return
    const box = wrap.value.getBoundingClientRect()
    const semua = [...r.getClientRects()].filter(c => c.width > 1 && c.height > 1)
    // buang kotak yang sepenuhnya berada di dalam kotak lain (kotak elemen induk teks)
    const unik = semua.filter(a => !semua.some(o => o !== a && o.left <= a.left + .5 && o.top <= a.top + .5 && o.right >= a.right - .5 && o.bottom >= a.bottom - .5 && o.width * o.height > a.width * a.height))
    const rects = unik.slice(0, 40).map(c => [(c.left - box.left) / box.width, (c.top - box.top) / box.height, c.width / box.width, c.height / box.height].map(v => Math.round(v * 1e4) / 1e4))
    if (rects.length) sel.value = { jenis: 'baru', r: rects, teks: teks.length > 300 ? teks.slice(0, 300) + '…' : teks }
  }, 180)
}
onMounted(() => document.addEventListener('selectionchange', saatPilih))

const tumpang = (a: number[], b2: number[]) => a[0]! < b2[0]! + b2[2]! && b2[0]! < a[0]! + a[2]! && a[1]! < b2[1]! + b2[3]! && b2[1]! < a[1]! + a[3]!
function simpanTandai(cat: string) {
  const s = sel.value
  if (!s || s.jenis !== 'baru') return
  if (marks.value.some(m => m.r.some(x => s.r.some(y => tumpang(x, y))))) { P.toast('Bagian ini sudah ditandai'); return }
  W.value.tandai.push({ id: rd.id, i: i.value, r: s.r, teks: s.teks, cat, ts: Date.now() })
  P.simpan(); getSelection()?.removeAllRanges(); sel.value = null
  P.toast(cat ? 'Catatan tersimpan' : 'Teks ditandai')
}
const batal = () => { getSelection()?.removeAllRanges(); sel.value = null }
const tulisCatatan = () => {
  const s = sel.value
  if (!s) return
  if (s.jenis === 'mark') {
    const t = W.value.tandai[s.idx]!
    P.formCatatan(t.cat, (v) => { t.cat = v; P.simpan(); sel.value = null; P.toast('Catatan tersimpan') })
  } else P.formCatatan('', v => simpanTandai(v))
}
const hapusTandai = (idx: number) => { W.value.tandai.splice(idx, 1); P.simpan(); sel.value = null; P.toast('Tandai dihapus') }
const alihFavHal = () => {
  W.value.hal = halFav.value ? W.value.hal.filter(x => !(x.id === rd.id && x.i === i.value)) : [...W.value.hal, { id: rd.id, i: i.value }]
  P.simpan(); P.toast(halFav.value ? 'Halaman disimpan ke favorit' : 'Favorit halaman dihapus')
}
const atur = (k: 'tema' | 'fs', v: string | number) => { (W.value as any)[k] = v; P.simpan() }
const markPilih = computed(() => (sel.value?.jenis === 'mark' ? W.value.tandai[sel.value.idx] : null))

// ----- gestur -----
let tx: number | null = null
const sentuhMulai = (e: TouchEvent) => { tx = e.touches[0]!.clientX }
const sentuhAkhir = (e: TouchEvent) => {
  const dx = tx === null ? 0 : e.changedTouches[0]!.clientX - tx
  const geser = body.value && body.value.scrollWidth > body.value.clientWidth + 2
  const pilih = getSelection() && !getSelection()!.isCollapsed
  tx = null
  if (Math.abs(dx) > 80 && !geser && !pilih) ganti(i.value + (dx < 0 ? 1 : -1))
}
const tombol = (e: KeyboardEvent) => {
  if ((e.target as HTMLElement).matches('textarea,input')) return
  if (e.key === 'ArrowRight') ganti(i.value + 1)
  else if (e.key === 'ArrowLeft') ganti(i.value - 1)
  else if (e.key === 'Escape') { if (panel.value) panel.value = null; else tutup() }
}
onMounted(() => document.addEventListener('keydown', tombol))
onBeforeUnmount(() => document.removeEventListener('keydown', tombol))
const tutup = () => { P.reader.value = null }
</script>

<template>
  <div class="reader" :class="W.tema === 'terang' ? '' : W.tema" :style="{ '--fs': W.fs + 'px' }">
    <div class="r-top">
      <button class="ibtn" aria-label="Tutup buku" @click="tutup"><PerpusIkon n="kembali" /></button>
      <div class="t"><b>{{ b.judul }}</b><span class="num">{{ n ? `Halaman ${i + 1} dari ${n}` : 'Memuat…' }}</span></div>
      <button class="ibtn" :class="{ on: halFav }" :aria-label="halFav ? 'Hapus favorit halaman' : 'Jadikan halaman favorit'" :aria-pressed="halFav" @click="alihFavHal"><PerpusIkon n="koleksi" /></button>
      <button class="ibtn" aria-label="Ukuran dan tampilan huruf" @click="pop = !pop"><PerpusIkon n="aa" /></button>
      <button class="ibtn" aria-label="Daftar isi, tandai, catatan, rangkuman" @click="panel = 'isi'"><PerpusIkon n="daftar" /></button>
    </div>

    <div ref="body" class="r-body" @touchstart.passive="sentuhMulai" @touchend.passive="sentuhAkhir" @click="sel?.jenis === 'baru' && (sel = null)">
      <div v-if="status === 'muat'" class="kosong"><b>Memuat buku…</b>Mohon tunggu sebentar.</div>
      <div v-else-if="status === 'galat'" class="kosong"><b>Buku belum bisa dibuka</b>{{ galatTeks }}</div>
      <div v-show="status === 'siap'" :key="i + '-' + anim" ref="wrap" class="pdf-pg" :class="{ mundur: anim === 'mundur', diam: !anim }">
        <canvas ref="kanvas" class="pdf-c" />
        <div ref="lapisTeks" class="textLayer" />
        <div class="pdf-hl">
          <template v-for="m in marks" :key="m.idx">
            <button v-for="(r, k) in m.r" :key="k" class="hl" :class="{ cat: m.cat }" :aria-label="'Tandai: ' + m.teks" :style="{ left: r[0]! * 100 + '%', top: r[1]! * 100 + '%', width: r[2]! * 100 + '%', height: r[3]! * 100 + '%' }" @click.stop="sel = { jenis: 'mark', idx: m.idx }" />
          </template>
        </div>
      </div>
    </div>

    <div id="r-sel">
      <div v-if="sel?.jenis === 'baru'" class="selbar"><q>“{{ sel.teks }}”</q>
        <div class="xs"><button class="btn btn-p btn-s" @click="simpanTandai('')">Tandai</button><button class="btn btn-w btn-s" @click="tulisCatatan">Tulis catatan</button><button class="btn btn-s" style="color:#fff;background:rgba(255,255,255,.14)" @click="batal">Batal</button></div>
      </div>
      <div v-else-if="markPilih && sel?.jenis === 'mark'" class="selbar"><q>“{{ markPilih.teks }}”</q>
        <div v-if="markPilih.cat" style="font-size:14px;background:rgba(255,255,255,.12);border-radius:10px;padding:8px 12px">{{ markPilih.cat }}</div>
        <div class="xs"><button class="btn btn-w btn-s" @click="tulisCatatan">{{ markPilih.cat ? 'Ubah catatan' : 'Tambah catatan' }}</button><button class="btn btn-s" style="color:#fff;background:rgba(255,255,255,.14)" @click="hapusTandai(sel.idx)">Hapus tandai</button><button class="btn btn-s" style="color:#fff;background:rgba(255,255,255,.14)" @click="sel = null">Tutup</button></div>
      </div>
    </div>
    <div v-if="petunjukTampil && !sudahAdaTandai && status === 'siap'" class="hint">{{ tanpaTeks ? 'Halaman ini berupa gambar, jadi kalimatnya tidak bisa ditandai' : 'Tahan atau seret pada kalimat untuk menandai' }}</div>

    <div class="r-bot">
      <button class="btn btn-l" :disabled="i === 0" aria-label="Halaman sebelumnya" @click="ganti(i - 1)"><PerpusIkon n="kembali" /></button>
      <div><div class="bar"><span :style="{ width: (n ? (i + 1) / n * 100 : 0) + '%' }" /></div><small class="num">Halaman {{ i + 1 }} dari {{ n || '…' }}</small></div>
      <button class="btn btn-p" :disabled="!n || i >= n - 1" aria-label="Halaman berikutnya" @click="ganti(i + 1)"><PerpusIkon n="maju" /></button>
    </div>

    <div v-if="pop" id="r-pop">
      <div class="pop">
        <div>
          <div class="lbl">Ukuran huruf konten</div>
          <div class="seg">
            <button aria-label="Perkecil huruf" @click="atur('fs', Math.max(12, W.fs - 2))">A−</button>
            <button disabled class="on num">{{ Math.round((W.fs / 19) * 100) }}%</button>
            <button aria-label="Perbesar huruf" @click="atur('fs', Math.min(34, W.fs + 2))">A+</button>
          </div>
          <div class="zoom-presets">
            <button :class="{ on: W.fs === 15 }" @click="atur('fs', 15)">80%</button>
            <button :class="{ on: W.fs === 19 }" @click="atur('fs', 19)">100%</button>
            <button :class="{ on: W.fs === 24 }" @click="atur('fs', 24)">125%</button>
            <button :class="{ on: W.fs === 29 }" @click="atur('fs', 29)">150%</button>
          </div>
        </div>
        <div><div class="lbl">Latar membaca</div><div class="seg"><button v-for="[k, nm] in [['terang', 'Terang'], ['sepia', 'Sepia'], ['gelap', 'Gelap']]" :key="k" :class="{ on: W.tema === k }" @click="atur('tema', k!)">{{ nm }}</button></div></div>
      </div>
    </div>

    <PerpusReaderPanel v-if="panel" :b="b" :i="i" :n="n" :isi="isi" :panel="panel" @ganti="panel = $event" @tutup="panel = null" @ke="(k) => { panel = null; ganti(k) }" @hapus="hapusTandai" />
  </div>
</template>
