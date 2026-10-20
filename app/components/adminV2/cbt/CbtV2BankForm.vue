<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import CbtRichQuestionEditor from './CbtRichQuestionEditor.vue'
import { validateLatexExpressions } from '~/utils/cbtFormula'
import type { GradeType, BankPackage, BankQuestionItem } from './cbtV2Data'

interface Props {
  pkg: BankPackage
  editing: boolean
  grade: GradeType
  classOptions: string[]
  subjectOptions: string[]
  initialStep?: 'PG' | 'Isian' | 'Esai' | 'Interaktif'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save', updatedPkg: BankPackage): void
  (e: 'cancel'): void
  (e: 'toast', msg: string): void
  (e: 'update-draft', draft: BankPackage): void
  (e: 'update-step', step: 'PG' | 'Isian' | 'Esai' | 'Interaktif'): void
}>()

// Deep clone of package to edit without mutating directly
const draft = ref<BankPackage>(JSON.parse(JSON.stringify(props.pkg)))

// Current step: PG, Isian, Esai, Interaktif
const currentStep = ref<'PG' | 'Isian' | 'Esai' | 'Interaktif'>(props.initialStep || 'PG')
const isSettingsOpen = ref(!props.editing)
const activeQuestionId = ref('')
const questionSteps = [
  { id: 'PG', label: 'Pilihan Ganda', shortLabel: 'PG' },
  { id: 'Isian', label: 'Jawaban Singkat', shortLabel: 'Isian' },
  { id: 'Esai', label: 'Esai', shortLabel: 'Esai' },
  { id: 'Interaktif', label: 'Interaktif', shortLabel: 'Media' }
] as const

watch(draft, value => {
  emit('update-draft', JSON.parse(JSON.stringify(value)))
}, { deep: true, flush: 'sync' })

watch(currentStep, step => emit('update-step', step))

const countByType = (type: string) => {
  return draft.value.questions.filter(q => q.type === type).length
}

const questionsInStep = computed(() => {
  return draft.value.questions.filter(q => q.type === currentStep.value)
})

const activeQuestion = computed(() => {
  return questionsInStep.value.find(q => q.id === activeQuestionId.value) || questionsInStep.value[0] || null
})

const activeQuestionIndex = computed(() => {
  return activeQuestion.value ? questionsInStep.value.findIndex(q => q.id === activeQuestion.value?.id) + 1 : 0
})

watch(questionsInStep, questions => {
  if (!questions.some(q => q.id === activeQuestionId.value)) {
    activeQuestionId.value = questions[0]?.id || ''
  }
}, { immediate: true })

let questionCounter = 100

const blankQuestion = (type: 'PG' | 'Isian' | 'Esai' | 'Interaktif'): BankQuestionItem => {
  questionCounter++
  return {
    id: `Q-${questionCounter}`,
    number: draft.value.questions.length + 1,
    type,
    difficulty: 'Sedang',
    text: '',
    key: type === 'PG' ? 'A' : '',
    options: type === 'PG' || type === 'Interaktif'
      ? [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' }
        ]
      : undefined,
    isMultiSelect: false,
    rubric: '',
    mediaType: 'video',
    mediaUrl: '',
    interactiveAnswerType: 'Isian'
  }
}

const addQuestion = (type: 'PG' | 'Isian' | 'Esai' | 'Interaktif') => {
  const q = blankQuestion(type)
  draft.value.questions.push(q)
  activeQuestionId.value = q.id
  emit('toast', `Butir soal ${type} baru ditambahkan.`)
}

const removeQuestion = (qId: string) => {
  const currentCount = draft.value.questions.filter(q => q.type === currentStep.value).length
  if (currentCount <= 1) {
    emit('toast', `Sisakan minimal 1 butir soal ${currentStep.value}.`)
    return
  }
  const removedIndex = questionsInStep.value.findIndex(q => q.id === qId)
  draft.value.questions = draft.value.questions.filter(q => q.id !== qId)
  draft.value.questions.forEach((q, i) => { q.number = i + 1 })
  const remaining = draft.value.questions.filter(q => q.type === currentStep.value)
  activeQuestionId.value = remaining[Math.min(removedIndex, remaining.length - 1)]?.id || ''
}

const toggleInteractiveMode = () => {
  draft.value.hasInteractive = !draft.value.hasInteractive
  if (draft.value.hasInteractive && !draft.value.questions.some(q => q.type === 'Interaktif')) {
    draft.value.questions.push(blankQuestion('Interaktif'))
  }
}

// Toggle Option Correct Key for PG
const toggleOptionKey = (q: BankQuestionItem, keyLetter: string) => {
  if (q.isMultiSelect) {
    const keys = Array.isArray(q.key) ? [...q.key] : [q.key].filter(Boolean)
    if (keys.includes(keyLetter)) {
      if (keys.length > 1) {
        q.key = keys.filter(k => k !== keyLetter)
      }
    } else {
      q.key = [...keys, keyLetter]
    }
  } else {
    q.key = keyLetter
  }
}

const isOptionSelected = (q: BankQuestionItem, keyLetter: string) => {
  if (Array.isArray(q.key)) {
    return q.key.includes(keyLetter)
  }
  return q.key === keyLetter
}

// Navigation Step Controls
const nextStep = () => {
  if (currentStep.value === 'PG') currentStep.value = 'Isian'
  else if (currentStep.value === 'Isian') currentStep.value = 'Esai'
  else if (currentStep.value === 'Esai') {
    if (draft.value.hasInteractive) currentStep.value = 'Interaktif'
    else submitForm()
  } else if (currentStep.value === 'Interaktif') {
    submitForm()
  }
}

const prevStep = () => {
  if (currentStep.value === 'Interaktif') currentStep.value = 'Esai'
  else if (currentStep.value === 'Esai') currentStep.value = 'Isian'
  else if (currentStep.value === 'Isian') currentStep.value = 'PG'
}

const submitForm = () => {
  if (!draft.value.teacherName?.trim()) {
    emit('toast', 'Nama guru penyusun wajib diisi.')
    return
  }
  const validQuestions = draft.value.questions.filter(q => q.text.trim())
  const invalidFormula = validQuestions.find(q => validateLatexExpressions(q.text))
  if (invalidFormula) {
    currentStep.value = invalidFormula.type
    emit('toast', 'Perbaiki rumus yang belum valid sebelum menyimpan.')
    return
  }
  if (!validQuestions.some(q => q.type === 'PG')) {
    currentStep.value = 'PG'
    emit('toast', 'Isi minimal 1 pertanyaan Pilihan Ganda.')
    return
  }
  draft.value.questions = validQuestions
  draft.value.updatedAt = 'Baru saja'
  emit('save', draft.value)
}
</script>

<template>
  <div class="w-full space-y-4 pb-32 sm:pb-6">
    <!-- Top Header -->
    <div class="rounded-[22px] bg-[#0A2A5C] px-5 py-5 sm:px-6 sm:py-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 shadow-sm">
      <div class="min-w-0">
        <span class="inline-flex text-[10px] font-extrabold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-white/10 text-[#DCE9FF]">
          {{ grade }} · {{ draft.classroom }}
        </span>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white mt-2">
          {{ editing ? 'Edit Paket Bank Soal' : 'Buat Paket Bank Soal Baru' }}
        </h2>
        <p class="text-xs text-[#C7D7F2] mt-1 max-w-xl">
          Kelola seluruh format dalam satu paket. Perubahan tersimpan secara interaktif.
        </p>
      </div>

      <div class="hidden sm:flex items-center gap-2">
        <button
          type="button"
          class="min-h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-sm font-bold text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition"
          @click="emit('cancel')"
        >
          Batal
        </button>
        <button
          type="button"
          class="min-h-11 px-5 rounded-xl bg-white hover:bg-[#E8F0FE] text-[#0A2A5C] text-sm font-bold transition shadow-sm inline-flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          @click="submitForm"
        >
          <AdminV2Icon name="check" :size="14" />
          <span>Simpan Paket</span>
        </button>
      </div>
    </div>

    <div class="lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:items-start lg:gap-5">
    <aside class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 shadow-sm space-y-4 lg:sticky lg:top-5">
      <div class="flex items-start justify-between gap-3 border-b border-[#E7EBF2] pb-3">
        <div>
          <h3 class="text-sm font-extrabold text-[#101828]">Konfigurasi paket ujian</h3>
          <p class="text-xs text-[#667085] mt-0.5">Tentukan identitas paket sebelum menyusun soal.</p>
        </div>
        <button
          type="button"
          aria-label="Ubah konfigurasi paket"
          class="min-h-11 rounded-xl bg-[#EFF2F7] px-3 text-xs font-bold text-[#344054] hover:bg-[#E8F0FE] hover:text-[#0A2A5C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
          :aria-expanded="isSettingsOpen"
          @click="isSettingsOpen = !isSettingsOpen"
        >
          {{ draft.subject }} · {{ draft.classroom }}
        </button>
      </div>

      <div v-show="isSettingsOpen" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5">Rombel / Kelas</label>
          <select
            v-model="draft.classroom"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
          >
            <option v-for="c in classOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5">Mata Pelajaran</label>
          <select
            v-model="draft.subject"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
          >
            <option v-for="s in subjectOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5">Kesulitan Umum</label>
          <select
            v-model="draft.difficulty"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
          >
            <option value="Mudah">Mudah</option>
            <option value="Sedang">Sedang</option>
            <option value="Sukar">Sukar</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5">Guru Penyusun</label>
          <input
            v-model="draft.teacherName"
            type="text"
            placeholder="Nama guru penyusun"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
          >
        </div>
      </div>
      <nav class="hidden lg:block border-t border-[#E7EBF2] pt-3" aria-label="Jenis soal">
        <button
          v-for="st in questionSteps"
          :key="st.id"
          type="button"
          class="min-h-11 w-full rounded-xl px-3 text-left text-xs font-extrabold transition inline-flex items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
          :class="currentStep === st.id ? 'mb-1 bg-[#E8F0FE] text-[#0A2A5C]' : 'mb-1 text-[#667085] hover:bg-[#F7F9FC]'"
          @click="currentStep = st.id"
        >
          <span>{{ st.label }}</span><span class="rounded-md px-1.5 py-0.5 text-[10px]" :class="currentStep === st.id ? 'bg-white text-[#1B5FD9]' : 'bg-[#EFF2F7] text-[#667085]'">{{ countByType(st.id) }}</span>
        </button>
        <button
          type="button"
          class="mt-2 min-h-11 w-full rounded-xl border px-3 text-xs font-extrabold transition"
          :class="draft.hasInteractive ? 'bg-[#E8F0FE] border-[#B9D1F9] text-[#0A2A5C]' : 'border-[#E7EBF2] text-[#667085] hover:bg-[#F7F9FC]'"
          @click="toggleInteractiveMode"
        >
          {{ draft.hasInteractive ? 'Interaktif aktif' : 'Aktifkan interaktif' }}
        </button>
      </nav>
    </aside>

    <!-- Area kerja soal -->

    <!-- CARD 2: Multi-Step Question Builder -->
    <section class="mt-4 lg:mt-0 bg-white border border-[#E7EBF2] rounded-[18px] overflow-hidden shadow-sm">
      <!-- Step Navigation Bar -->
      <div class="p-3 sm:p-4 bg-[#F9FAFC] border-b border-[#E7EBF2] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:hidden">
        <nav class="grid grid-cols-4 gap-1 sm:flex sm:items-center sm:gap-1.5" aria-label="Langkah format soal">
          <button
            v-for="st in questionSteps"
            :key="st.id"
            type="button"
            class="min-h-11 px-2 sm:px-3.5 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
            :class="currentStep === st.id
              ? 'bg-white text-[#0A2A5C] shadow-sm border border-[#E7EBF2]'
              : 'text-[#667085] hover:bg-white'"
            @click="currentStep = st.id"
          >
            <span class="sm:hidden">{{ st.shortLabel }}</span>
            <span class="hidden sm:inline">{{ st.label }}</span>
            <span
              class="px-1.5 py-0.5 rounded-md text-[10px]"
              :class="currentStep === st.id ? 'bg-[#E8F0FE] text-[#1B5FD9]' : 'bg-[#EFF2F7] text-[#667085]'"
            >
              {{ countByType(st.id) }}
            </span>
          </button>
        </nav>

        <button
          type="button"
          class="w-full sm:w-auto min-h-11 px-3 rounded-xl border text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
          :class="draft.hasInteractive
            ? 'bg-[#E8F0FE] border-[#B9D1F9] text-[#0A2A5C]'
            : 'border-[#E7EBF2] bg-white text-[#667085]'"
          @click="toggleInteractiveMode"
        >
          {{ draft.hasInteractive ? 'Interaktif Aktif' : 'Aktifkan Interaktif' }}
        </button>
      </div>

      <!-- Question Content Area -->
      <div class="p-5 space-y-4">
        <!-- Step Header -->
        <div class="flex items-start justify-between gap-3 pb-2 border-b border-[#E7EBF2]">
          <div>
            <h3 class="text-sm font-extrabold text-[#101828]">
              {{ currentStep === 'PG' ? 'Butir Soal Pilihan Ganda'
                : currentStep === 'Isian' ? 'Butir Soal Jawaban Singkat'
                : currentStep === 'Esai' ? 'Butir Soal Esai'
                : 'Butir Soal Interaktif (Audio / Video)' }}
            </h3>
            <p class="text-xs text-[#667085] mt-0.5">
              {{ currentStep === 'PG' ? 'Pilih satu kunci atau aktifkan multi-select untuk PG kompleks.'
                : currentStep === 'Isian' ? 'Isi pertanyaan dan kunci jawaban singkat.'
                : currentStep === 'Esai' ? 'Siapkan rubrik serta skor maksimal untuk koreksi guru.'
                : 'Pilih media dan jenis jawaban untuk setiap soal.' }}
            </p>
          </div>
          <span class="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#E8F0FE] text-[#1B5FD9]">
            {{ countByType(currentStep) }} butir
          </span>
        </div>

        <!-- If Interactive not active -->
        <div
          v-if="currentStep === 'Interaktif' && !draft.hasInteractive"
          class="p-8 text-center border-2 border-dashed border-[#CBD5E1] rounded-2xl bg-[#FAFBFE] space-y-2"
        >
          <h4 class="text-sm font-extrabold text-[#101828]">Format interaktif belum aktif</h4>
          <p class="text-xs text-[#667085]">Aktifkan untuk soal video YouTube atau audio listening.</p>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-[#1B5FD9] text-white text-xs font-extrabold shadow-sm mt-2"
            @click="toggleInteractiveMode"
          >
            Aktifkan Format Interaktif
          </button>
        </div>

        <!-- Questions List for Current Step -->
        <div v-else class="space-y-4">
          <nav
            v-if="questionsInStep.length > 1"
            class="flex gap-2 overflow-x-auto pb-1"
            aria-label="Pilih butir soal"
          >
            <button
              v-for="(item, itemIndex) in questionsInStep"
              :key="item.id"
              type="button"
              class="min-h-11 shrink-0 rounded-xl border px-3 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
              :class="activeQuestionId === item.id ? 'border-[#1B5FD9] bg-[#E8F0FE] text-[#0A2A5C]' : 'border-[#E7EBF2] bg-white text-[#667085] hover:border-[#B9D1F9]'"
              @click="activeQuestionId = item.id"
            >
              Soal {{ itemIndex + 1 }}
            </button>
          </nav>

          <article
            v-for="(q, idx) in activeQuestion ? [activeQuestion] : []"
            :key="q.id"
            class="border border-[#E7EBF2] rounded-2xl overflow-hidden bg-white shadow-xs"
          >
            <!-- Question Top -->
            <div class="bg-[#F9FAFC] p-3 border-b border-[#E7EBF2] flex items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-xs font-extrabold font-mono px-2 py-0.5 rounded-lg bg-[#EFF2F7] text-[#344054]">
                  Soal #{{ activeQuestionIndex }}
                </span>
                <select
                  v-model="q.difficulty"
                  class="border border-[#E7EBF2] rounded-lg px-2 py-1 text-xs font-bold text-[#344054] bg-white outline-none"
                >
                  <option value="Mudah">Mudah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Sukar">Sukar</option>
                </select>
              </div>

              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg border text-xs font-bold transition"
                  :class="q.isRtl ? 'bg-[#E8F0FE] border-[#1B5FD9] text-[#0A2A5C]' : 'border-[#E7EBF2] text-[#667085]'"
                  @click="q.isRtl = !q.isRtl"
                >
                  عربي · RTL
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg border border-[#F8D3CE] text-[#C43232] hover:bg-[#FDECEA] text-xs font-bold"
                  @click="removeQuestion(q.id)"
                >
                  Hapus
                </button>
              </div>
            </div>

            <!-- Question Body -->
            <div class="p-4 space-y-3">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1">Pertanyaan</label>
                <CbtRichQuestionEditor
                  v-model="q.text"
                  v-model:image-url="q.imageUrl"
                  v-model:rtl="q.isRtl"
                  @message="emit('toast', $event)"
                />
              </div>

              <!-- PG Specific Options -->
              <div v-if="q.type === 'PG'">
                <div class="flex items-center justify-between gap-3 mb-2">
                  <span class="text-xs font-bold text-[#344054]">Opsi Jawaban &amp; Kunci Benar</span>
                  <button
                    type="button"
                    class="text-xs font-bold text-[#1B5FD9] hover:underline"
                    @click="q.isMultiSelect = !q.isMultiSelect"
                  >
                    {{ q.isMultiSelect ? 'Mode: PG Kompleks (Multi-Select)' : 'Mode: PG Biasa (Tunggal)' }}
                  </button>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="(opt, oIdx) in (q.options || [])"
                    :key="opt.key"
                    class="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      class="w-11 h-11 rounded-xl font-extrabold text-xs shrink-0 border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
                      :class="isOptionSelected(q, opt.key)
                        ? 'bg-[#1B5FD9] text-white border-[#1B5FD9]'
                        : 'bg-[#EFF2F7] text-[#667085] border-[#E7EBF2] hover:border-[#1B5FD9]'"
                      @click="toggleOptionKey(q, opt.key)"
                    >
                      {{ opt.key }}
                    </button>
                    <input
                      v-model="opt.text"
                      type="text"
                      :placeholder="`Teks opsi ${opt.key}`"
                      class="flex-1 border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
                    >
                  </div>
                </div>
              </div>

              <!-- Isian Specific -->
              <div v-else-if="q.type === 'Isian'">
                <label class="block text-xs font-bold text-[#344054] mb-1">Kunci Jawaban Singkat</label>
                <input
                  v-model="q.key as string"
                  type="text"
                  placeholder="Contoh: Cascading Style Sheets"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
                >
              </div>

              <!-- Esai Specific -->
              <div v-else-if="q.type === 'Esai'" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-[#344054] mb-1">Rubrik Penilaian</label>
                  <textarea
                    v-model="q.rubric"
                    rows="2"
                    placeholder="Pedoman poin penilaian jawaban siswa..."
                    class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-[#344054] mb-1">Skor Maksimal</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value="20"
                    class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
                  >
                </div>
              </div>

              <!-- Interaktif Specific -->
              <div v-else-if="q.type === 'Interaktif'" class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-[#344054] mb-1">Jenis Media</label>
                    <select
                      v-model="q.mediaType"
                      class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none"
                    >
                      <option value="video">Video YouTube</option>
                      <option value="audio">Audio Listening</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-[#344054] mb-1">URL Media Lampiran</label>
                    <input
                      v-model="q.mediaUrl"
                      type="text"
                      placeholder="Link video atau file audio"
                      class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none"
                    >
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-[#344054] mb-1">Kunci / Jawaban</label>
                  <input
                    v-model="q.key as string"
                    type="text"
                    placeholder="Kunci jawaban interaktif"
                    class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none"
                  >
                </div>
              </div>
            </div>
          </article>

          <!-- Add question button -->
          <button
            type="button"
            class="w-full py-3 rounded-2xl border-2 border-dashed border-[#BBD0EC] bg-[#F8FBFF] hover:bg-[#E8F0FE] text-[#1B5FD9] font-extrabold text-xs flex items-center justify-center gap-2 transition"
            @click="addQuestion(currentStep)"
          >
            <AdminV2Icon name="plus" :size="16" />
            <span>Tambah Butir Soal {{ currentStep }}</span>
          </button>
        </div>

        <!-- Bottom Step Navigation -->
        <div class="pt-4 border-t border-[#E7EBF2] flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            class="min-h-11 px-4 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F3F5F9] disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="currentStep === 'PG'"
            @click="prevStep"
          >
            Sebelumnya
          </button>

          <span class="text-xs font-bold text-[#667085]">
            {{ draft.questions.filter(q => q.text.trim()).length }} pertanyaan terisi
          </span>

          <button
            type="button"
            class="min-h-11 px-5 rounded-xl bg-[#1B5FD9] hover:bg-[#12459B] text-white text-xs font-extrabold transition shadow-sm inline-flex items-center gap-1.5"
            @click="nextStep"
          >
            <span>{{ currentStep === 'Interaktif' || (!draft.hasInteractive && currentStep === 'Esai') ? 'Simpan Seluruh Paket' : 'Lanjut' }}</span>
            <AdminV2Icon name="arrow-right" :size="14" />
          </button>
        </div>
      </div>
    </section>
    </div>

    <div class="fixed inset-x-0 bottom-[56px] z-20 border-t border-[#DCE2EA] bg-white/95 p-3 shadow-[0_-8px_20px_rgba(16,24,40,0.08)] backdrop-blur sm:hidden">
      <div class="mx-auto grid max-w-lg grid-cols-2 gap-2">
        <button
          type="button"
          class="min-h-11 rounded-xl border border-[#E7EBF2] bg-white px-4 text-sm font-bold text-[#344054] active:bg-[#F3F5F9]"
          @click="emit('cancel')"
        >
          Batal
        </button>
        <button
          type="button"
          class="min-h-11 rounded-xl bg-[#1B5FD9] px-4 text-sm font-bold text-white active:bg-[#12459B]"
          @click="submitForm"
        >
          Simpan Paket
        </button>
      </div>
    </div>
  </div>
</template>
