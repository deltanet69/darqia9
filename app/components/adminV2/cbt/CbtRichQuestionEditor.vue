<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { compressImageToWebP, isArabicText, LATEX_TOOLBAR_SYMBOLS, renderKaTeXHtml, validateLatexExpressions } from '~/utils/cbtFormula'

const props = defineProps<{ modelValue: string; imageUrl?: string; rtl?: boolean; compact?: boolean }>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'update:imageUrl', value: string | undefined): void
  (event: 'update:rtl', value: boolean): void
  (event: 'message', value: string): void
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
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
    if (file.size <= 700 * 1024 && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      const original = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      emit('update:imageUrl', original)
      emit('message', 'Gambar asli siap dibaca tanpa kompresi ulang.')
      return
    }
    const result = await compressImageToWebP(file, 2400)
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
  extracting.value = true
  extractionNote.value = ''
  const sourceImage = props.imageUrl
  const sourceText = props.modelValue
  try {
    const extracted = await $fetch<{ text: string; isRtl: boolean; containsFormula: boolean; reviewNote: string }>('/api/cbt/ocr', {
      method: 'POST',
      body: { imageDataUrl: sourceImage }
    })
    if (props.imageUrl !== sourceImage || props.modelValue !== sourceText) {
      extractionNote.value = 'Gambar atau teks sudah berubah. Ekstrak kembali agar hasil sesuai dengan gambar aktif.'
      return
    }
    emit('update:modelValue', props.modelValue + (props.modelValue.trim() ? '\n' : '') + extracted.text)
    if (extracted.isRtl) emit('update:rtl', true)
    extractionNote.value = extracted.reviewNote || 'Periksa kembali hasil ekstraksi sebelum menyimpan.'
    emit('message', 'Teks berhasil diekstrak. Periksa hasil sebelum menyimpan.')
  } catch (error) {
    const message = (error as any)?.data?.statusMessage || (error as any)?.statusMessage || 'Teks pada gambar gagal diekstrak.'
    extractionNote.value = message
    emit('message', message)
  } finally {
    extracting.value = false
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-[#E7EBF2] bg-white focus-within:border-[#1B5FD9]" :class="compact ? 'rich-compact' : ''">
    <div class="flex flex-wrap items-center gap-1 border-b border-[#E7EBF2] bg-[#F9FAFC] p-2" role="toolbar" aria-label="Pemformatan pertanyaan">
      <button type="button" class="editor-button font-extrabold" title="Tebal" @click="replaceSelection('**', '**', 'teks tebal')">B</button>
      <button type="button" class="editor-button italic" title="Miring" @click="replaceSelection('_', '_', 'teks miring')">I</button>
      <button v-if="!compact" type="button" class="editor-button" title="Subjudul" @click="replaceSelection('### ', '', 'Subjudul')">H</button>
      <button v-if="!compact" type="button" class="editor-button" title="Daftar" @click="replaceSelection('- ', '', 'butir daftar')">Daftar</button>
      <button v-if="!compact" type="button" class="editor-button font-mono" title="Kode sebaris" @click="replaceSelection(tick, tick, 'kode')">&lt;/&gt;</button>
      <button v-if="!compact" type="button" class="editor-button font-mono" title="Blok kode" @click="replaceSelection(tick + tick + tick + '\n', '\n' + tick + tick + tick, 'kode program')">Blok kode</button>
      <span class="mx-1 h-6 w-px bg-[#DCE2EA]" aria-hidden="true" />
      <button v-for="symbol in LATEX_TOOLBAR_SYMBOLS" :key="symbol.syntax" type="button" class="editor-button" :title="symbol.description" @click="replaceSelection('$', '$', symbol.syntax)">
        {{ symbol.label }}
      </button>
      <span class="mx-1 h-6 w-px bg-[#DCE2EA]" aria-hidden="true" />
      <button type="button" class="editor-button" :aria-pressed="detectedRtl" @click="toggleRtl">العربية RTL</button>
      <button v-if="!compact" type="button" class="editor-button" @click="imageInput?.click()">Unggah gambar</button>
      <input ref="imageInput" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" @change="handleImage">
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
      <img :src="imageUrl" alt="Gambar pendukung soal" class="max-h-56 rounded-xl border border-[#E7EBF2] object-contain">
      <div class="mt-2 flex flex-wrap gap-2">
        <button type="button" class="editor-action" :disabled="extracting" @click="extractImageText">{{ extracting ? 'Mengekstrak…' : 'Ekstrak teks dari gambar' }}</button>
        <button type="button" class="editor-action text-[#C43232]" :disabled="extracting" @click="emit('update:imageUrl', undefined)">Hapus gambar</button>
      </div>
      <p class="mt-2 text-[11px] leading-relaxed text-[#667085]">Hasil ekstraksi masuk sebagai draf dan wajib diperiksa sebelum disimpan.</p>
      <p v-if="extractionNote" class="mt-1 text-[11px] font-semibold text-[#A15C00]">{{ extractionNote }}</p>
    </div>

    <div v-if="modelValue.trim()" class="border-t border-[#E7EBF2] bg-[#FAFBFC] p-3">
      <span class="mb-2 block text-[10px] font-extrabold uppercase text-[#667085]">{{ compact ? 'Pratinjau jawaban' : 'Pratinjau siswa' }}</span>
      <div class="question-preview overflow-x-auto text-sm leading-relaxed text-[#101828]" :class="detectedRtl ? 'font-serif text-xl leading-loose text-right' : ''" :dir="detectedRtl ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(modelValue)" />
      <p v-if="formulaError" class="mt-2 text-xs font-semibold text-[#C43232]" role="alert">Rumus belum valid: {{ formulaError }}</p>
    </div>
  </div>
</template>

<style scoped>
.editor-button {
  min-height: 44px;
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
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid #e7ebf2;
  padding: 0.4rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.editor-action:disabled { cursor: wait; opacity: 0.55; }
.rich-compact .editor-button { min-height: 34px; padding: 0.2rem 0.45rem; }
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
