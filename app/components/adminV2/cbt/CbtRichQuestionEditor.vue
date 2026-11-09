<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { compressImageToWebP, isArabicText, LATEX_MORE_GROUPS, LATEX_TOOLBAR_SYMBOLS, renderKaTeXHtml, validateLatexExpressions } from '~/utils/cbtFormula'

const props = defineProps<{ modelValue: string; imageUrl?: string; rtl?: boolean; compact?: boolean }>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'update:imageUrl', value: string | undefined): void
  (event: 'update:rtl', value: boolean): void
  (event: 'message', value: string): void
  (event: 'busy', value: boolean): void
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const ocrInput = ref<HTMLInputElement | null>(null)
const ocrPratinjau = ref('')
const extracting = ref(false)
const extractionNote = ref('')
const localRtl = ref<boolean | null>(null)
const detectedRtl = computed(() => props.compact ? (localRtl.value ?? isArabicText(props.modelValue)) : (props.rtl || isArabicText(props.modelValue)))
const toggleRtl = () => {
  if (props.compact) localRtl.value = !detectedRtl.value
  else emit('update:rtl', !detectedRtl.value)
}
const formulaError = computed(() => validateLatexExpressions(props.modelValue))
const tick = String.fromCharCode(96)
const formulaOpen = ref(false)
const moreFormulaOpen = ref(false)
// Editor ringkas (jawaban/opsi): rumus disembunyikan sampai dipilih "Gunakan rumus" agar halaman tetap pendek.
const rumusAktif = ref(!props.compact || props.modelValue.includes('$'))
watch(() => props.modelValue, value => { if (value.includes('$')) rumusAktif.value = true })
const insertSymbol = async (syntax: string) => {
  formulaOpen.value = false
  await replaceSelection('$', '$', syntax)
}
const insertBlockFormula = async () => {
  formulaOpen.value = false
  await replaceSelection('$$\n', '\n$$', '\\frac{a}{b}')
}

const replaceSelection = async (before: string, after = '', placeholder = '') => {
  const el = textarea.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = props.modelValue.slice(start, end) || placeholder
  emit('update:modelValue', props.modelValue.slice(0, start) + before + selected + after + props.modelValue.slice(end))
  await nextTick()
  el.focus()
  el.setSelectionRange(start + before.length, start + before.length + selected.length)
}

// Satu pintu membaca gambar jadi data URL siap kirim: berkas kecil (<= 700 KB, PNG/JPEG/WebP) dipakai apa adanya,
// selain itu dikompres/diperkecil agar muat di batas ekstraksi server.
const bacaGambar = async (file: File): Promise<{ dataUrl: string; info: string }> => {
  if (file.size <= 700 * 1024 && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    return { dataUrl, info: 'Gambar asli dipakai tanpa kompresi ulang.' }
  }
  const result = await compressImageToWebP(file, 2400)
  return { dataUrl: result.dataUrl, info: 'Gambar berhasil diproses menjadi ' + result.compressedSizeKB + ' KB.' }
}

// Gambar OCR yang kecil (sisi terpanjang < 1000 px) diperbesar dulu: pembacaan huruf Arab berharakat jauh lebih konsisten.
const terlaluKecilUntukOcr = async (file: File) => {
  if (typeof createImageBitmap !== 'function') return false
  try {
    const bitmap = await createImageBitmap(file)
    const kecil = Math.max(bitmap.width, bitmap.height) < 1000
    bitmap.close?.()
    return kecil
  } catch {
    return false
  }
}

// Gambar SOAL: dilampirkan pada butir soal dan tampil ke siswa.
const handleImage = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return emit('message', 'Berkas harus berupa gambar.')
  try {
    const { dataUrl, info } = await bacaGambar(file)
    emit('update:imageUrl', dataUrl)
    emit('message', info)
  } catch {
    emit('message', 'Gambar gagal diproses.')
  } finally {
    if (imageInput.value) imageInput.value.value = ''
  }
}

// Gambar OCR: hanya untuk mengambil teks/rumus/huruf Arab. Gambarnya TIDAK dilampirkan ke soal dan tidak disimpan.
const handleOcrFile = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (ocrInput.value) ocrInput.value.value = ''
  if (!file || extracting.value) return
  if (!file.type.startsWith('image/')) return emit('message', 'Berkas harus berupa gambar.')
  extracting.value = true
  emit('busy', true)
  extractionNote.value = ''
  ocrPratinjau.value = ''
  try {
    const { dataUrl } = (await terlaluKecilUntukOcr(file))
      ? { dataUrl: (await compressImageToWebP(file, 2400, 1500)).dataUrl }
      : await bacaGambar(file)
    ocrPratinjau.value = dataUrl
    const sourceText = props.modelValue
    const extracted = await $fetch<{ text: string; isRtl: boolean; containsFormula: boolean; reviewNote: string }>('/api/cbt/ocr', {
      method: 'POST',
      body: { imageDataUrl: dataUrl }
    })
    if (props.modelValue !== sourceText) {
      extractionNote.value = 'Teks soal berubah saat gambar dibaca, jadi hasil tidak dimasukkan. Baca ulang gambarnya.'
      return
    }
    emit('update:modelValue', props.modelValue + (props.modelValue.trim() ? '\n' : '') + extracted.text)
    if (extracted.isRtl) emit('update:rtl', true)
    extractionNote.value = extracted.reviewNote || 'Periksa kembali hasil sebelum menyimpan.'
    emit('message', 'Teks berhasil diambil dari gambar. Periksa hasilnya sebelum menyimpan.')
  } catch (error) {
    const message = (error as any)?.data?.statusMessage || (error as any)?.statusMessage || 'Teks pada gambar gagal diambil.'
    extractionNote.value = message
    emit('message', message)
  } finally {
    extracting.value = false
    emit('busy', false)
  }
}
onBeforeUnmount(() => { if (extracting.value) emit('busy', false) })
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-[#E7EBF2] bg-white focus-within:border-[#1B5FD9]" :class="compact ? 'rich-compact' : ''">
    <div class="border-b border-[#E7EBF2] bg-[#F9FAFC] p-2" role="toolbar" aria-label="Pemformatan teks">
      <label v-if="compact" class="flex min-h-8 cursor-pointer items-center gap-2 text-xs font-bold text-[#344054]">
        <input v-model="rumusAktif" type="checkbox" class="h-4 w-4 accent-[#1B5FD9]" @change="formulaOpen = formulaOpen && rumusAktif">
        Gunakan rumus (buka rumus)
      </label>
      <div v-if="rumusAktif" class="flex flex-wrap items-center gap-x-1.5 gap-y-1.5" :class="compact ? 'mt-1.5' : ''">
        <div class="tb-group" role="group" aria-label="Gaya teks">
          <button type="button" class="tb font-extrabold" title="Tebal" aria-label="Tebal" @click="replaceSelection('**', '**', 'teks tebal')">B</button>
          <button type="button" class="tb italic" title="Miring" aria-label="Miring" @click="replaceSelection('_', '_', 'teks miring')">I</button>
          <template v-if="!compact">
            <button type="button" class="tb" title="Subjudul" aria-label="Subjudul" @click="replaceSelection('### ', '', 'Subjudul')">H</button>
            <button type="button" class="tb" title="Daftar berpoin" aria-label="Daftar berpoin" @click="replaceSelection('- ', '', 'butir daftar')">Daftar</button>
          </template>
        </div>
        <div v-if="!compact" class="tb-group" role="group" aria-label="Kode program">
          <button type="button" class="tb font-mono" title="Kode sebaris" aria-label="Kode sebaris" @click="replaceSelection(tick, tick, 'kode')">&lt;/&gt;</button>
          <button type="button" class="tb font-mono" title="Blok kode" aria-label="Blok kode" @click="replaceSelection(tick + tick + tick + '\n', '\n' + tick + tick + tick, 'kode program')">Blok kode</button>
        </div>
        <div class="tb-group" role="group" aria-label="Rumus">
          <button type="button" class="tb" :aria-expanded="formulaOpen" aria-controls="panel-rumus" title="Sisipkan rumus" @click="formulaOpen = !formulaOpen">
            <span aria-hidden="true">∑</span> Rumus <span aria-hidden="true" class="text-[10px]">{{ formulaOpen ? '▴' : '▾' }}</span>
          </button>
        </div>
        <div class="tb-group" role="group" aria-label="Arah tulisan">
          <button type="button" class="tb" :aria-pressed="detectedRtl" title="Teks Arab (kanan ke kiri)" @click="toggleRtl">العربية RTL</button>
        </div>
        <div v-if="!compact" class="tb-group" role="group" aria-label="Gambar">
          <button type="button" class="tb" title="Lampirkan gambar pada soal (tampil ke siswa)" @click="imageInput?.click()">Gambar soal</button>
          <button type="button" class="tb" :disabled="extracting" title="Ambil teks, rumus, atau huruf Arab dari gambar (gambar tidak dilampirkan)" @click="ocrInput?.click()">
            {{ extracting ? 'Membaca gambar…' : 'Baca gambar (OCR)' }}
          </button>
        </div>
        <input ref="imageInput" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" tabindex="-1" aria-label="Pilih gambar soal" @change="handleImage">
        <input ref="ocrInput" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" tabindex="-1" aria-label="Pilih gambar untuk dibaca OCR" @change="handleOcrFile">
      </div>
      <p v-if="!compact" class="mt-1.5 text-[11px] leading-relaxed text-[#667085]">
        <b>Gambar soal</b> tampil ke siswa. <b>Baca gambar (OCR)</b> hanya mengambil teks, rumus, atau huruf Arab dari gambar; gambarnya tidak disimpan.
      </p>

      <div v-if="formulaOpen && rumusAktif" id="panel-rumus" class="mt-2 rounded-lg border border-[#DCE2EA] bg-white p-2.5">
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span class="text-[11px] font-extrabold uppercase tracking-wide text-[#667085]">Sisipkan rumus sebaris</span>
          <button v-if="!compact" type="button" class="tb !min-h-8 text-[11px]" title="Rumus di baris tersendiri ($$ ... $$)" @click="insertBlockFormula">Rumus terpisah ($$)</button>
        </div>
        <div class="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          <button v-for="symbol in LATEX_TOOLBAR_SYMBOLS" :key="symbol.syntax" type="button" class="tb justify-center" :title="symbol.description" :aria-label="symbol.description" @click="insertSymbol(symbol.syntax)">
            {{ symbol.label }}
          </button>
        </div>
        <button type="button" class="mt-2 text-xs font-bold text-[#1B5FD9] hover:underline" :aria-expanded="moreFormulaOpen" @click="moreFormulaOpen = !moreFormulaOpen">
          {{ moreFormulaOpen ? 'Sembunyikan rumus lengkap' : 'Tampilkan rumus lengkap' }}
        </button>
        <div v-if="moreFormulaOpen" class="mt-2 max-h-72 space-y-3 overflow-y-auto pr-1">
          <section v-for="group in LATEX_MORE_GROUPS" :key="group.title">
            <h4 class="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-[#667085]">{{ group.title }}</h4>
            <div class="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
              <button v-for="symbol in group.symbols" :key="group.title + symbol.syntax" type="button" class="tb justify-center" :title="symbol.description" :aria-label="symbol.description" @click="insertSymbol(symbol.syntax)">
                {{ symbol.label }}
              </button>
            </div>
          </section>
        </div>
        <p class="mt-2 text-[11px] text-[#667085]">Rumus ditulis di antara tanda $ ... $. Pilih teks lebih dulu bila ingin membungkusnya.</p>
      </div>
    </div>

    <div v-if="!compact && (extracting || extractionNote)" class="flex items-start gap-3 border-b border-[#E7EBF2] bg-[#FFFBF2] p-3" role="status" aria-live="polite">
      <img v-if="ocrPratinjau" :src="ocrPratinjau" alt="Gambar yang sedang dibaca" class="h-14 w-20 shrink-0 rounded-lg border border-[#E7EBF2] bg-white object-contain">
      <div class="min-w-0 flex-1 text-[12px] leading-relaxed">
        <b v-if="extracting" class="block text-[#344054]">Membaca gambar… rumus biasanya 10–30 detik, teks Arab berharakat bisa sampai 1–2 menit. Jangan tutup halaman ini.</b>
        <template v-else>
          <b class="block text-[#344054]">Hasil baca gambar (draf)</b>
          <span class="font-semibold text-[#A15C00]">{{ extractionNote }}</span>
          <span class="mt-0.5 block text-[#667085]">Periksa teks, rumus, dan harakat sebelum menyimpan.</span>
        </template>
      </div>
      <button v-if="!extracting" type="button" class="tb !min-h-8 shrink-0" aria-label="Tutup keterangan" @click="extractionNote = ''; ocrPratinjau = ''">Tutup</button>
    </div>

    <textarea
      ref="textarea"
      :value="modelValue"
      :rows="compact ? 2 : 5"
      :dir="detectedRtl ? 'rtl' : 'ltr'"
      :lang="detectedRtl ? 'ar' : 'id'"
      :class="detectedRtl ? 'text-right font-serif text-xl leading-loose' : 'text-left'"
      class="block w-full resize-y bg-white p-3 text-sm text-[#101828] outline-none"
      :placeholder="compact ? 'Tulis jawaban. Gunakan $...$ untuk rumus dan aktifkan RTL untuk teks Arab.' : 'Tulis pertanyaan. Gunakan $...$ untuk rumus sebaris dan $$...$$ untuk rumus terpisah.'"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <div v-if="imageUrl && !compact" class="border-t border-[#E7EBF2] p-3">
      <span class="mb-2 block text-[10px] font-extrabold uppercase text-[#667085]">Gambar soal (tampil ke siswa)</span>
      <img :src="imageUrl" alt="Gambar pendukung soal" class="max-h-56 rounded-xl border border-[#E7EBF2] object-contain">
      <div class="mt-2 flex flex-wrap gap-2">
        <button type="button" class="editor-action text-[#C43232]" @click="emit('update:imageUrl', undefined)">Hapus gambar</button>
      </div>
    </div>

    <div v-if="modelValue.trim() && rumusAktif" class="border-t border-[#E7EBF2] bg-[#FAFBFC] p-3">
      <span class="mb-2 block text-[10px] font-extrabold uppercase text-[#667085]">{{ compact ? 'Pratinjau jawaban' : 'Pratinjau siswa' }}</span>
      <div class="question-preview overflow-x-auto text-sm leading-relaxed text-[#101828]" :class="detectedRtl ? 'font-serif text-xl leading-loose text-right' : ''" :dir="detectedRtl ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(modelValue)" />
      <p v-if="formulaError" class="mt-2 text-xs font-semibold text-[#C43232]" role="alert">Rumus belum valid: {{ formulaError }}</p>
    </div>
  </div>
</template>

<style scoped>
.tb-group {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  padding-right: 0.5rem;
  border-right: 1px solid #dce2ea;
}
.tb-group:last-of-type { border-right: 0; padding-right: 0; }
.tb {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 36px;
  border: 1px solid #e7ebf2;
  border-radius: 8px;
  background: #fff;
  padding: 0.25rem 0.6rem;
  color: #344054;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
}
.tb:disabled { cursor: wait; opacity: 0.6; }
.tb:hover, .tb:focus-visible {
  border-color: #1b5fd9;
  outline: 2px solid #d9e7ff;
  outline-offset: 1px;
}
.tb[aria-pressed='true'], .tb[aria-expanded='true'] {
  border-color: #1b5fd9;
  background: #e8f0fe;
  color: #0a2a5c;
}
.editor-action {
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid #e7ebf2;
  padding: 0.4rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.editor-action:disabled { cursor: wait; opacity: 0.55; }
.rich-compact .tb { min-height: 32px; padding: 0.2rem 0.5rem; }
textarea[dir='rtl'], .question-preview[dir='rtl'] {
  font-family: 'Traditional Arabic', 'Times New Roman', serif;
  font-size: 1.25rem;
  line-height: 2;
  text-align: right;
}
.question-preview :deep(.cbt-code) {
  overflow-x: auto;
  border-radius: 8px;
  background: #101828;
  padding: 0.75rem;
  color: #f8fafc;
  direction: ltr;
  text-align: left;
  white-space: pre-wrap;
}
.question-preview :deep(.cbt-inline-code) { border-radius: 4px; background: #e9eef5; padding: 0.1rem 0.3rem; direction: ltr; }
.question-preview :deep(.cbt-subheading) { display: block; margin: 0.45rem 0 0.2rem; }
.question-preview :deep(.cbt-list-item) { display: block; padding-inline-start: 1rem; }
.question-preview :deep(.cbt-list-item)::before { content: '•'; margin-inline-end: 0.5rem; }
</style>
