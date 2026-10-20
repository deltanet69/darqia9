<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { compressImageToWebP, isArabicText, LATEX_TOOLBAR_SYMBOLS, renderKaTeXHtml, validateLatexExpressions } from '~/utils/cbtFormula'

const props = defineProps<{ modelValue: string; imageUrl?: string; rtl?: boolean }>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'update:imageUrl', value: string | undefined): void
  (event: 'update:rtl', value: boolean): void
  (event: 'message', value: string): void
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const extracting = ref(false)
const detectedRtl = computed(() => props.rtl || isArabicText(props.modelValue))
const formulaError = computed(() => validateLatexExpressions(props.modelValue))
const tick = String.fromCharCode(96)

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

const handleImage = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return emit('message', 'Berkas harus berupa gambar.')
  try {
    const result = await compressImageToWebP(file)
    emit('update:imageUrl', result.dataUrl)
    emit('message', 'Gambar berhasil diproses menjadi ' + result.compressedSizeKB + ' KB.')
  } catch {
    emit('message', 'Gambar gagal diproses.')
  } finally {
    if (imageInput.value) imageInput.value.value = ''
  }
}

const extractImageText = async () => {
  if (!props.imageUrl || extracting.value) return
  const Detector = (window as any).TextDetector
  if (!Detector) {
    emit('message', 'Mesin ekstraksi teks belum tersedia pada peramban ini. Teks dan rumus perlu disalin secara manual.')
    return
  }
  extracting.value = true
  try {
    const image = new Image()
    image.src = props.imageUrl
    await image.decode()
    const blocks = await new Detector().detect(image)
    const extracted = blocks.map((block: any) => block.rawValue).filter(Boolean).join('\n').trim()
    if (!extracted) throw new Error('Tidak ada teks yang terbaca.')
    emit('update:modelValue', props.modelValue + (props.modelValue.trim() ? '\n' : '') + extracted)
    emit('message', 'Teks berhasil diekstrak. Periksa kembali tulisan dan rumus sebelum menyimpan.')
  } catch (error) {
    emit('message', error instanceof Error ? error.message : 'Teks pada gambar gagal diekstrak.')
  } finally {
    extracting.value = false
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-[#E7EBF2] bg-white focus-within:border-[#1B5FD9]">
    <div class="flex flex-wrap items-center gap-1 border-b border-[#E7EBF2] bg-[#F9FAFC] p-2" role="toolbar" aria-label="Pemformatan pertanyaan">
      <button type="button" class="editor-button font-extrabold" title="Tebal" @click="replaceSelection('**', '**', 'teks tebal')">B</button>
      <button type="button" class="editor-button italic" title="Miring" @click="replaceSelection('_', '_', 'teks miring')">I</button>
      <button type="button" class="editor-button" title="Subjudul" @click="replaceSelection('### ', '', 'Subjudul')">H</button>
      <button type="button" class="editor-button" title="Daftar" @click="replaceSelection('- ', '', 'butir daftar')">Daftar</button>
      <button type="button" class="editor-button font-mono" title="Kode sebaris" @click="replaceSelection(tick, tick, 'kode')">&lt;/&gt;</button>
      <button type="button" class="editor-button font-mono" title="Blok kode" @click="replaceSelection(tick + tick + tick + '\n', '\n' + tick + tick + tick, 'kode program')">Blok kode</button>
      <span class="mx-1 h-6 w-px bg-[#DCE2EA]" aria-hidden="true" />
      <button v-for="symbol in LATEX_TOOLBAR_SYMBOLS" :key="symbol.syntax" type="button" class="editor-button" :title="symbol.description" @click="replaceSelection('$', '$', symbol.syntax)">
        {{ symbol.label }}
      </button>
      <span class="mx-1 h-6 w-px bg-[#DCE2EA]" aria-hidden="true" />
      <button type="button" class="editor-button" :aria-pressed="detectedRtl" @click="emit('update:rtl', !detectedRtl)">العربية RTL</button>
      <button type="button" class="editor-button" @click="imageInput?.click()">Unggah gambar</button>
      <input ref="imageInput" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" @change="handleImage">
    </div>

    <textarea
      ref="textarea"
      :value="modelValue"
      rows="5"
      :dir="detectedRtl ? 'rtl' : 'ltr'"
      :class="detectedRtl ? 'text-right text-base leading-loose' : 'text-left'"
      class="block w-full resize-y bg-white p-3 text-sm text-[#101828] outline-none"
      placeholder="Tulis pertanyaan. Gunakan $...$ untuk rumus sebaris dan $$...$$ untuk rumus terpisah."
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <div v-if="imageUrl" class="border-t border-[#E7EBF2] p-3">
      <img :src="imageUrl" alt="Gambar pendukung soal" class="max-h-56 rounded-xl border border-[#E7EBF2] object-contain">
      <div class="mt-2 flex flex-wrap gap-2">
        <button type="button" class="editor-action" :disabled="extracting" @click="extractImageText">{{ extracting ? 'Mengekstrak…' : 'Ekstrak teks dari gambar' }}</button>
        <button type="button" class="editor-action text-[#C43232]" @click="emit('update:imageUrl', undefined)">Hapus gambar</button>
      </div>
      <p class="mt-2 text-[11px] leading-relaxed text-[#667085]">Hasil ekstraksi wajib diperiksa. Rumus kompleks mungkin perlu ditulis ulang dengan KaTeX.</p>
    </div>

    <div v-if="modelValue.trim()" class="border-t border-[#E7EBF2] bg-[#FAFBFC] p-3">
      <span class="mb-2 block text-[10px] font-extrabold uppercase text-[#667085]">Pratinjau siswa</span>
      <div class="question-preview overflow-x-auto text-sm leading-relaxed text-[#101828]" :dir="detectedRtl ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(modelValue)" />
      <p v-if="formulaError" class="mt-2 text-xs font-semibold text-[#C43232]" role="alert">Rumus belum valid: {{ formulaError }}</p>
    </div>
  </div>
</template>

<style scoped>
.editor-button {
  min-height: 36px;
  border: 1px solid #e7ebf2;
  border-radius: 8px;
  background: #fff;
  padding: 0.35rem 0.6rem;
  color: #344054;
  font-size: 0.75rem;
  font-weight: 700;
}
.editor-button:hover, .editor-button:focus-visible {
  border-color: #1b5fd9;
  outline: 2px solid #d9e7ff;
  outline-offset: 1px;
}
.editor-button[aria-pressed='true'] {
  border-color: #1b5fd9;
  background: #e8f0fe;
  color: #0a2a5c;
}
.editor-action {
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid #e7ebf2;
  padding: 0.4rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.editor-action:disabled { cursor: wait; opacity: 0.55; }
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
