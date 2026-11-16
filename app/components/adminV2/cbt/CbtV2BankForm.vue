<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
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
  subjectFallback?: boolean
  lockTeacher?: boolean
  // Pilihan guru penyusun untuk Superadmin (nama dari master guru) dan nama akun sendiri.
  teacherOptions?: string[]
  selfName?: string
  saving?: boolean
  // Keterangan / Bab hanya untuk LMS (ujian harian).
  source?: 'cbt' | 'ujian_harian'
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
const optionKeys = computed(() => props.grade === 'SMP' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E'])
for (const question of draft.value.questions) {
  if (question.type === 'PG') {
    question.options = optionKeys.value.map(key => question.options?.find(option => option.key === key) || { key, text: '' })
    question.key = Array.isArray(question.key) ? question.key.filter(key => optionKeys.value.includes(key))
      : optionKeys.value.includes(question.key) ? question.key : ''
  }
}
watch(() => draft.value.classroom, () => {
  draft.value.classId = undefined
  draft.value.subjectId = undefined
  draft.value.subject = ''
})
watch(() => props.subjectOptions, options => {
  if (!options.includes(draft.value.subject)) { draft.value.subject = ''; draft.value.subjectId = undefined }
})

const currentStep = ref<'PG' | 'Isian' | 'Esai' | 'Interaktif'>(props.initialStep || 'PG')
const isSettingsOpen = ref(!props.editing)
const activeQuestionId = ref('')
// Jenis soal baru hanya PG, Esai, dan Interaktif. Langkah Isian hanya muncul bila paket lama masih memuat soal Isian.
const questionSteps = computed(() => [
  { id: 'PG', label: 'Pilihan Ganda', shortLabel: 'PG' },
  ...(draft.value.questions.some(q => q.type === 'Isian') ? [{ id: 'Isian', label: 'Isian (soal lama)', shortLabel: 'Isian' }] : []),
  { id: 'Esai', label: 'Esai', shortLabel: 'Esai' },
  { id: 'Interaktif', label: 'Interaktif', shortLabel: 'Media' }
] as const)

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

// Butir yang terbuka selalu ditampilkan lewat kepala butirnya (sub-soal pertama untuk soal cerita).
const activeQuestion = computed(() => {
  const aktif = questionsInStep.value.find(q => q.id === activeQuestionId.value)
  return (aktif && daftarButir.value.find(b => anggota(b).includes(aktif))) || daftarButir.value[0] || null
})

const activeQuestionIndex = computed(() => activeQuestion.value ? daftarButir.value.indexOf(activeQuestion.value) + 1 : 0)

watch(questionsInStep, questions => {
  if (!questions.some(q => q.id === activeQuestionId.value)) {
    activeQuestionId.value = questions[0]?.id || ''
  }
}, { immediate: true })

// Teks cerita dipakai bersama oleh semua sub-soal dalam kelompok yang sama.
const setCerita = (q: BankQuestionItem, value: string) => {
  q.storyGroup = q.storyGroup || crypto.randomUUID()
  for (const item of draft.value.questions) if (item.storyGroup === q.storyGroup) item.storyText = value
}
const subSoalCerita = (q: BankQuestionItem) => questionsInStep.value.filter(item => item.storyGroup && item.storyGroup === q.storyGroup)
// Satu butir = satu soal, atau satu cerita beserta semua sub-soalnya (PG maupun Esai).
const anggota = (q: BankQuestionItem) => q.storyGroup ? subSoalCerita(q) : [q]
const daftarButir = computed(() => questionsInStep.value.filter((q, i, list) =>
  !q.storyGroup || list.findIndex(x => x.storyGroup === q.storyGroup) === i))

const blankQuestion = (type: 'PG' | 'Isian' | 'Esai' | 'Interaktif', cerita = false): BankQuestionItem => {
  return {
    storyGroup: cerita ? crypto.randomUUID() : undefined,
    id: crypto.randomUUID(),
    number: draft.value.questions.length + 1,
    type,
    difficulty: 'Sedang',
    text: '',
    key: type === 'PG' || type === 'Interaktif' ? 'A' : '',
    options: type === 'PG' || type === 'Interaktif'
      ? optionKeys.value.map(key => ({ key, text: '' }))
      : undefined,
    isMultiSelect: false,
    rubric: '',
    mediaType: 'video',
    mediaUrl: '',
    interactiveAnswerType: 'PG'
  }
}

// Selama gambar dibaca OCR, pindah/tambah/hapus butir dikunci: hasil OCR ditulis ke butir yang sedang terbuka.
const ocrBerjalan = ref(false)
const ringkasSoal = (q: BankQuestionItem) => {
  const teks = (anggota(q).length > 1 || q.storyText?.trim() ? q.storyText || q.text : q.text).replace(/\$+/g, '').replace(/[*_#`>]/g, ' ').replace(/\s+/g, ' ').trim()
  return teks.length > 80 ? teks.slice(0, 80) + '…' : teks
}
const kosongDiStep = computed(() => questionsInStep.value.filter(q => !q.text.trim()).length)

const addQuestion = (type: 'PG' | 'Isian' | 'Esai' | 'Interaktif', cerita = false) => {
  const q = blankQuestion(type, cerita)
  draft.value.questions.push(q)
  activeQuestionId.value = q.id
  void nextTick(() => { if (typeof document !== 'undefined') document.getElementById('butir-soal-aktif')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) })
  emit('toast', cerita ? `Soal cerita ${type} baru ditambahkan. Isi teks cerita, lalu pertanyaannya.` : `Butir soal ${type} baru ditambahkan.`)
}

const addSubSoal = (q: BankQuestionItem) => {
  const baru = blankQuestion(q.type)
  q.storyGroup = q.storyGroup || crypto.randomUUID()
  baru.storyGroup = q.storyGroup
  baru.storyText = q.storyText
  baru.difficulty = q.difficulty
  // Sub-soal baru diselipkan tepat setelah sub-soal terakhir dalam kelompoknya.
  const akhir = draft.value.questions.lastIndexOf(subSoalCerita(q).at(-1) || q)
  draft.value.questions.splice(akhir + 1, 0, baru)
  draft.value.questions.forEach((item, i) => { item.number = i + 1 })
  emit('toast', 'Pertanyaan baru ditambahkan pada cerita ini.')
}

// Hapus satu butir utuh: untuk soal cerita, cerita beserta semua sub-soalnya.
const removeQuestion = (q: BankQuestionItem) => {
  if (daftarButir.value.length <= 1) {
    emit('toast', `Sisakan minimal 1 butir soal ${currentStep.value}.`)
    return
  }
  const removedIndex = daftarButir.value.indexOf(q)
  const hapus = new Set(anggota(q).map(item => item.id))
  draft.value.questions = draft.value.questions.filter(item => !hapus.has(item.id))
  draft.value.questions.forEach((item, i) => { item.number = i + 1 })
  activeQuestionId.value = daftarButir.value[Math.min(removedIndex, daftarButir.value.length - 1)]?.id || ''
}

const removeSubSoal = (q: BankQuestionItem, sub: BankQuestionItem) => {
  const sisa = anggota(q).filter(item => item.id !== sub.id)
  if (!sisa.length) return
  draft.value.questions = draft.value.questions.filter(item => item.id !== sub.id)
  draft.value.questions.forEach((item, i) => { item.number = i + 1 })
  activeQuestionId.value = sisa[0]!.id
}

// Esai "titik-titik" (mis. Bahasa Inggris): mode Jawaban Pasti dinilai otomatis tanpa AI, mode Esai Uraian memakai rubrik + AI. Mode = ada tidaknya jawabanPasti (undefined = uraian).
const jawabanPasti = (q: BankQuestionItem) => q.jawabanPasti ?? ''
const setJawabanPasti = (q: BankQuestionItem, e: Event) => { q.jawabanPasti = (e.target as HTMLInputElement).value }
const modePasti = (q: BankQuestionItem) => q.jawabanPasti !== undefined
const setModePasti = (q: BankQuestionItem, pasti: boolean) => { q.jawabanPasti = pasti ? q.jawabanPasti ?? '' : undefined }
const punyaTitik = (q: BankQuestionItem) => /\.{3,}|…|_{3,}/.test(q.text)

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
const stepFlow = computed(() => questionSteps.value.map(step => step.id).filter(id => id !== 'Interaktif' || draft.value.hasInteractive))
const isLastStep = computed(() => stepFlow.value.indexOf(currentStep.value) === stepFlow.value.length - 1 || !stepFlow.value.includes(currentStep.value))

const nextStep = () => {
  if (isLastStep.value) submitForm()
  else currentStep.value = stepFlow.value[stepFlow.value.indexOf(currentStep.value) + 1]
}

const prevStep = () => {
  const ids = questionSteps.value.map(step => step.id)
  const index = ids.indexOf(currentStep.value)
  if (index > 0) currentStep.value = ids[index - 1]
}

const submitForm = () => {
  if (props.saving) return
  if (draft.value.grade !== props.grade || !props.classOptions.includes(draft.value.classroom) || !props.subjectOptions.includes(draft.value.subject)) {
    emit('toast', 'Pilih kelas dan mata pelajaran yang sesuai dengan jenjang aktif.')
    return
  }
  if (!draft.value.name?.trim()) {
    isSettingsOpen.value = true
    emit('toast', 'Nama bank soal wajib diisi.')
    return
  }
  if (!props.lockTeacher && !draft.value.teacherName?.trim()) {
    emit('toast', 'Nama guru penyusun wajib diisi.')
    return
  }
  const validQuestions = draft.value.questions.filter(q => q.text.trim())
  const ceritaKosong = validQuestions.find(q => q.storyGroup && !q.storyText?.trim())
  if (ceritaKosong) {
    currentStep.value = ceritaKosong.type
    activeQuestionId.value = ceritaKosong.id
    emit('toast', 'Isi teks cerita atau hapus butir cerita ini.')
    return
  }
  const pastiKosong = validQuestions.find(q => q.type === 'Esai' && q.jawabanPasti !== undefined && !q.jawabanPasti.trim())
  if (pastiKosong) {
    currentStep.value = 'Esai'
    activeQuestionId.value = pastiKosong.id
    emit('toast', 'Isi Jawaban pasti atau ganti ke Esai Uraian.')
    return
  }
  const formulaTexts = (q: BankQuestionItem) => [q.text, ...(q.options?.map(option => option.text) || []), ...(q.type === 'Isian' || q.interactiveAnswerType === 'Isian' ? [String(q.key || '')] : [])]
  const invalidFormula = validQuestions.find(q => formulaTexts(q).some(text => validateLatexExpressions(text)))
  if (invalidFormula) {
    currentStep.value = invalidFormula.type
    activeQuestionId.value = invalidFormula.id
    emit('toast', 'Perbaiki rumus yang belum valid sebelum menyimpan.')
    return
  }
  const missingIsianKey = validQuestions.find(q => q.type === 'Isian' && !String(q.key || '').trim())
  if (missingIsianKey) {
    currentStep.value = 'Isian'
    activeQuestionId.value = missingIsianKey.id
    emit('toast', 'Kunci jawaban soal Isian wajib diisi.')
    return
  }
  if (draft.value.hasInteractive && !validQuestions.some(q => q.type === 'Interaktif')) {
    currentStep.value = 'Interaktif'
    emit('toast', 'Isi minimal 1 soal Interaktif, atau nonaktifkan format interaktif.')
    return
  }
  if (!validQuestions.some(q => q.type === 'PG')) {
    currentStep.value = 'PG'
    emit('toast', 'Isi minimal 1 pertanyaan Pilihan Ganda.')
    return
  }
  // Minimal kata diatur per soal esai (0 = tanpa batas); isian kosong/tidak valid disimpan sebagai 0.
  for (const q of validQuestions) if (q.type === 'Esai') q.minKata = Math.max(0, Math.floor(Number(q.minKata) || 0))
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
          {{ editing ? 'Ubah Bank Soal' : 'Buat Bank Soal' }}
        </h2>
        <p class="text-xs text-[#C7D7F2] mt-1 max-w-xl">
          Pilih kelas dan mata pelajaran, susun soal, lalu simpan bank soal.
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
          :disabled="saving || ocrBerjalan"
        >
          <AdminV2Icon name="check" :size="14" />
          <span>{{ saving ? 'Menyimpan…' : 'Simpan Bank Soal' }}</span>
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
          {{ draft.name || draft.subject }} · {{ draft.classroom }}
        </button>
      </div>

      <div v-show="isSettingsOpen" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        <div class="sm:col-span-2 lg:col-span-1">
          <label for="bank-nama" class="block text-xs font-bold text-[#344054] mb-1.5">Nama Bank Soal</label>
          <input
            id="bank-nama"
            v-model="draft.name"
            type="text"
            maxlength="120"
            placeholder="Latihan membuat frasa dalam kalimat"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
          >
        </div>

        <div v-if="source === 'ujian_harian'" class="sm:col-span-2 lg:col-span-1">
          <label for="bank-keterangan" class="block text-xs font-bold text-[#344054] mb-1.5">Keterangan / Bab</label>
          <input
            id="bank-keterangan"
            v-model="draft.description"
            type="text"
            maxlength="160"
            placeholder="Bab 1 - Frasa Kalimat"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
          >
        </div>

        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5">Rombel / Kelas</label>
          <select
            v-model="draft.classroom"
            :disabled="editing || saving"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
          >
            <option value="" disabled>Pilih kelas</option>
            <option v-for="c in classOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5">Mata Pelajaran</label>
          <select
            v-model="draft.subject"
            :disabled="editing || saving || !draft.classroom || !subjectOptions.length"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
          >
            <option value="" disabled>Pilih mata pelajaran</option>
            <option v-for="s in subjectOptions" :key="s" :value="s">{{ s }}</option>
          </select>
          <p v-if="subjectFallback" class="mt-1 text-xs leading-relaxed text-[#1B5FD9]">Kelas ini belum memiliki jadwal pelajaran. Semua mata pelajaran {{ grade }} dari Master Mapel ditampilkan agar bank soal tetap dapat dibuat.</p>
          <p v-else-if="draft.classroom && !subjectOptions.length" class="mt-1 text-xs text-[#667085]">Belum ada mata pelajaran pada jadwal kelas ini.</p>
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
            v-if="lockTeacher"
            v-model="draft.teacherName"
            type="text"
            readonly
            aria-readonly="true"
            class="w-full cursor-not-allowed rounded-xl border border-[#E7EBF2] bg-[#F2F4F7] p-2.5 text-xs text-[#101828] outline-none"
          >
          <input
            v-else
            v-model="draft.teacherName"
            type="text"
            list="daftar-penyusun"
            maxlength="120"
            autocomplete="off"
            placeholder="Ketik nama penyusun atau pilih dari daftar"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
          >
          <datalist id="daftar-penyusun">
            <option v-if="selfName" :value="selfName" />
            <option v-for="nama in (teacherOptions || []).filter(item => item !== selfName)" :key="nama" :value="nama" />
          </datalist>
          <p class="mt-1 text-xs text-[#667085]">{{ lockTeacher ? 'Terisi otomatis sesuai akun Anda.' : 'Ketik nama siapa pun sebagai penyusun, atau pilih dari daftar guru. Nama di luar daftar guru tetap tersimpan.' }}</p>
        </div>
      </div>
      <nav class="hidden lg:block border-t border-[#E7EBF2] pt-3" aria-label="Jenis soal">
        <button
          v-for="st in questionSteps"
          :key="st.id"
          type="button"
          class="min-h-11 w-full rounded-xl px-3 text-left text-xs font-extrabold transition inline-flex items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
          :class="currentStep === st.id ? 'mb-1 bg-[#E8F0FE] text-[#0A2A5C]' : 'mb-1 text-[#667085] hover:bg-[#F7F9FC]'"
          :disabled="ocrBerjalan"
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
        <nav class="grid gap-1 sm:flex sm:items-center sm:gap-1.5" :style="{ gridTemplateColumns: `repeat(${questionSteps.length}, minmax(0, 1fr))` }" aria-label="Langkah format soal">
          <button
            v-for="st in questionSteps"
            :key="st.id"
            type="button"
            class="min-h-11 px-2 sm:px-3.5 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
            :class="currentStep === st.id
              ? 'bg-white text-[#0A2A5C] shadow-sm border border-[#E7EBF2]'
              : 'text-[#667085] hover:bg-white'"
            :disabled="ocrBerjalan"
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
                : currentStep === 'Isian' ? 'Butir Soal Isian'
                : currentStep === 'Esai' ? 'Butir Soal Esai'
                : 'Butir Soal Interaktif (Audio / Video)' }}
            </h3>
            <p class="text-xs text-[#667085] mt-0.5">
              {{ currentStep === 'PG' ? 'Pilih satu kunci atau aktifkan multi-select untuk PG kompleks.'
                : currentStep === 'Isian' ? 'Tulis kunci jawaban yang benar untuk setiap soal. Rumus dan teks Arab didukung.'
                : currentStep === 'Esai' ? 'Tulis rubrik sebagai pedoman koreksi guru.'
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
          <section v-if="questionsInStep.length" class="rounded-2xl border border-[#E7EBF2] bg-[#F9FAFC] p-2" aria-label="Daftar butir soal">
            <div class="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1">
              <span class="text-[11px] font-extrabold uppercase tracking-wide text-[#667085]">Daftar butir · {{ daftarButir.length }} butir</span>
              <span v-if="ocrBerjalan" class="text-[11px] font-bold text-[#1B5FD9]" role="status">Membaca gambar… pindah butir dikunci sampai selesai.</span>
              <span v-else-if="kosongDiStep" class="text-[11px] font-bold text-[#A15C00]">{{ kosongDiStep }} butir belum terisi</span>
            </div>
            <ul class="max-h-52 space-y-1 overflow-y-auto pr-1">
              <li v-for="(item, itemIndex) in daftarButir" :key="item.id">
                <button
                  type="button"
                  class="flex min-h-11 w-full items-center gap-2.5 rounded-xl border px-2.5 text-left text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9] disabled:cursor-not-allowed disabled:opacity-60"
                  :class="activeQuestion?.id === item.id ? 'border-[#1B5FD9] bg-[#E8F0FE]' : 'border-[#E7EBF2] bg-white hover:border-[#B9D1F9]'"
                  :disabled="ocrBerjalan"
                  :aria-current="activeQuestion?.id === item.id ? 'true' : undefined"
                  @click="activeQuestionId = item.id"
                >
                  <span class="flex h-6 min-w-6 items-center justify-center rounded-md bg-[#EFF2F7] px-1 font-mono text-[11px] font-extrabold text-[#344054]">{{ itemIndex + 1 }}</span>
                  <span class="min-w-0 flex-1 truncate" :class="ringkasSoal(item) ? 'font-semibold text-[#344054]' : 'italic text-[#98A2B3]'">{{ ringkasSoal(item) || 'Belum diisi' }}</span>
                  <span v-if="anggota(item).length > 1" class="shrink-0 rounded-full bg-[#EFF2F7] px-2 py-0.5 text-[10px] font-extrabold text-[#344054]">{{ anggota(item).length }} sub-soal</span>
                  <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="anggota(item).every(s => s.text.trim()) ? 'bg-[#E7F8F0] text-[#087C52]' : 'bg-[#FEF4E5] text-[#AD6504]'">{{ anggota(item).every(s => s.text.trim()) ? 'Terisi' : 'Kosong' }}</span>
                </button>
              </li>
            </ul>
          </section>

          <article
            v-for="(q, idx) in activeQuestion ? [activeQuestion] : []"
            id="butir-soal-aktif"
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
                  @change="anggota(q).forEach(s => { s.difficulty = q.difficulty })"
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
                  class="px-2.5 py-1 rounded-lg border border-[#F8D3CE] text-[#C43232] hover:bg-[#FDECEA] text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="ocrBerjalan"
                  @click="removeQuestion(q)"
                >
                  {{ q.storyGroup ? 'Hapus cerita' : 'Hapus' }}
                </button>
              </div>
            </div>

            <!-- Isi butir: soal biasa = 1 pertanyaan; soal cerita = teks cerita + beberapa pertanyaan -->
            <div class="p-4 space-y-3">
              <div v-if="q.storyGroup" class="rounded-xl border border-[#B9D1F9] bg-[#F6F9FF] p-3 space-y-2">
                <span class="inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#1B5FD9]">Soal cerita · {{ anggota(q).length }} pertanyaan</span>
                <label class="block text-xs font-bold text-[#344054]">Teks cerita / bacaan</label>
                <CbtRichQuestionEditor
                  :model-value="q.storyText || ''"
                  @update:model-value="setCerita(q, $event)"
                  @message="emit('toast', $event)"
                  @busy="ocrBerjalan = $event"
                />
                <p class="text-[11px] leading-relaxed text-[#667085]">Pertanyaan di bawah ini merujuk pada cerita ini. Saat soal diacak, pertanyaan cerita tetap berurutan dan selalu tampil bersama ceritanya.</p>
              </div>

              <section
                v-for="(sub, si) in anggota(q)"
                :key="sub.id"
                class="space-y-3"
                :class="q.storyGroup ? 'rounded-xl border border-[#E7EBF2] p-3' : ''"
              >
                <div v-if="q.storyGroup" class="flex items-center justify-between gap-2">
                  <span class="text-xs font-extrabold text-[#0A2A5C]">Pertanyaan {{ si + 1 }}</span>
                  <button
                    v-if="anggota(q).length > 1"
                    type="button"
                    class="min-h-11 px-3 rounded-lg border border-[#F8D3CE] text-[#C43232] hover:bg-[#FDECEA] text-xs font-bold disabled:opacity-50"
                    :disabled="ocrBerjalan"
                    @click="removeSubSoal(q, sub)"
                  >
                    Hapus pertanyaan {{ si + 1 }}
                  </button>
                </div>
                <div>
                  <label v-if="!q.storyGroup" class="block text-xs font-bold text-[#344054] mb-1">Pertanyaan</label>
                  <CbtRichQuestionEditor
                    v-model="sub.text"
                    v-model:image-url="sub.imageUrl"
                    v-model:rtl="sub.isRtl"
                    @message="emit('toast', $event)"
                    @busy="ocrBerjalan = $event"
                  />
                </div>

                <!-- PG Specific Options -->
                <div v-if="sub.type === 'PG' || (sub.type === 'Interaktif' && sub.interactiveAnswerType !== 'Isian')">
                  <div class="flex items-center justify-between gap-3 mb-2">
                    <span class="text-xs font-bold text-[#344054]">Opsi Jawaban &amp; Kunci Benar</span>
                    <button
                      type="button"
                      class="text-xs font-bold text-[#1B5FD9] hover:underline"
                      @click="sub.isMultiSelect = !sub.isMultiSelect"
                    >
                      {{ sub.isMultiSelect ? 'Mode: PG Kompleks (Multi-Select)' : 'Mode: PG Biasa (Tunggal)' }}
                    </button>
                  </div>

                  <div class="space-y-2">
                    <div
                      v-for="opt in (sub.options || [])"
                      :key="opt.key"
                      class="flex items-start gap-2"
                    >
                      <button
                        type="button"
                        class="w-11 h-11 rounded-xl font-extrabold text-xs shrink-0 border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
                        :class="isOptionSelected(sub, opt.key)
                          ? 'bg-[#1B5FD9] text-white border-[#1B5FD9]'
                          : 'bg-[#EFF2F7] text-[#667085] border-[#E7EBF2] hover:border-[#1B5FD9]'"
                        @click="toggleOptionKey(sub, opt.key)"
                      >
                        {{ opt.key }}
                      </button>
                      <div class="min-w-0 flex-1">
                        <CbtRichQuestionEditor
                          compact
                          v-model="opt.text"
                          @message="emit('toast', $event)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Isian Specific -->
                <div v-else-if="sub.type === 'Isian'">
                  <label class="block text-xs font-bold text-[#344054] mb-1">Kunci Jawaban Isian</label>
                  <CbtRichQuestionEditor
                    compact
                    v-model="(sub.key as string)"
                    @message="emit('toast', $event)"
                  />
                  <p class="mt-1 text-[11px] leading-relaxed text-[#667085]">Tulis jawaban yang benar persis seperti yang harus dijawab siswa. Rumus dan teks Arab didukung.</p>
                </div>

                <!-- Esai: pilih cara menilai. Esai Uraian = rubrik (rumus, gambar, OCR; dinilai AI). Jawaban Pasti = isian titik-titik, dinilai otomatis -->
                <div v-else-if="sub.type === 'Esai'" class="space-y-3">
                  <div class="space-y-1.5">
                    <span class="block text-xs font-bold text-[#344054]">Cara menilai</span>
                    <div class="flex rounded-xl bg-[#EEF1F6] p-1 gap-1" role="group" aria-label="Cara menilai esai">
                      <button
                        type="button"
                        class="flex-1 min-h-11 px-3 rounded-lg text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5FD9]"
                        :class="!modePasti(sub) ? 'bg-white text-[#0A2A5C] shadow-sm' : 'text-[#667085]'"
                        :aria-pressed="!modePasti(sub)"
                        @click="setModePasti(sub, false)"
                      >
                        Esai Uraian
                      </button>
                      <button
                        type="button"
                        class="flex-1 min-h-11 px-3 rounded-lg text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5FD9]"
                        :class="modePasti(sub) ? 'bg-white text-[#0A2A5C] shadow-sm' : 'text-[#667085]'"
                        :aria-pressed="modePasti(sub)"
                        @click="setModePasti(sub, true)"
                      >
                        Jawaban Pasti
                      </button>
                    </div>
                  </div>

                  <div v-if="modePasti(sub)" class="space-y-1.5">
                    <label :for="'pasti-' + sub.id" class="block text-xs font-bold text-[#344054]">Jawaban pasti</label>
                    <input
                      :id="'pasti-' + sub.id"
                      type="text"
                      :value="jawabanPasti(sub)"
                      maxlength="200"
                      autocomplete="off"
                      placeholder="Contoh: goes"
                      class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
                      @input="setJawabanPasti(sub, $event)"
                    >
                    <p class="text-[11px] leading-relaxed text-[#667085]">Dinilai otomatis tanpa AI: cocok persis = nilai penuh, selain itu 0. Beberapa jawaban benar dipisah titik koma, misalnya doesn't; does not. Huruf besar/kecil dan tanda baca di ujung diabaikan.</p>
                  </div>

                  <template v-else>
                    <p v-if="punyaTitik(sub)" class="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#A15C00]" role="status">
                      <span>Soal ini berisi titik-titik.</span>
                      <button
                        type="button"
                        class="min-h-11 px-3 rounded-lg border border-[#F5D08A] bg-[#FFF8E6] font-bold text-[#7A4A03]"
                        @click="setModePasti(sub, true)"
                      >
                        Pakai Jawaban Pasti
                      </button>
                    </p>
                    <div class="flex flex-wrap items-center gap-2">
                      <label :for="'min-kata-' + sub.id" class="text-xs font-bold text-[#344054]">Minimal kata jawaban</label>
                      <input
                        :id="'min-kata-' + sub.id"
                        v-model.number="sub.minKata"
                        type="number"
                        min="0"
                        inputmode="numeric"
                        placeholder="0"
                        class="w-20 min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]"
                      >
                      <span class="text-[11px] text-[#667085]">kata, isi 0 bila tanpa batas</span>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-[#344054] mb-1">Rubrik Penilaian</label>
                      <CbtRichQuestionEditor
                        :model-value="sub.rubric || ''"
                        @update:model-value="sub.rubric = $event"
                        v-model:image-url="sub.rubricImageUrl"
                        @message="emit('toast', $event)"
                        @busy="ocrBerjalan = $event"
                      />
                    </div>
                  </template>
                </div>

                <!-- Interaktif Specific -->
                <div v-if="sub.type === 'Interaktif'" class="space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-[#344054] mb-1">Jenis Media</label>
                      <select
                        v-model="sub.mediaType"
                        class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none"
                      >
                        <option value="video">Video YouTube</option>
                        <option value="audio">Audio Listening</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-[#344054] mb-1">URL Media Lampiran</label>
                      <input
                        v-model="sub.mediaUrl"
                        type="text"
                        placeholder="Link video atau file audio"
                        class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none"
                      >
                    </div>
                  </div>
                  <div v-if="sub.interactiveAnswerType === 'Isian'">
                    <label class="block text-xs font-bold text-[#344054] mb-1">Kunci / Jawaban</label>
                    <CbtRichQuestionEditor
                      compact
                      v-model="(sub.key as string)"
                      @message="emit('toast', $event)"
                    />
                  </div>
                </div>
              </section>

              <button
                v-if="q.storyGroup"
                type="button"
                class="w-full min-h-11 rounded-xl border border-[#B9D1F9] bg-white px-3 text-xs font-extrabold text-[#1B5FD9] hover:bg-[#E8F0FE] disabled:opacity-50"
                :disabled="ocrBerjalan"
                @click="addSubSoal(q)"
              >
                + Tambah pertanyaan untuk cerita ini
              </button>
            </div>
          </article>

          <!-- Tambah butir: PG & Esai bisa soal biasa atau soal cerita -->
          <div v-if="currentStep === 'PG' || currentStep === 'Esai'" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              class="w-full min-h-11 py-3 rounded-2xl border-2 border-dashed border-[#BBD0EC] bg-[#F8FBFF] hover:bg-[#E8F0FE] text-[#1B5FD9] font-extrabold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="ocrBerjalan"
              @click="addQuestion(currentStep)"
            >
              <AdminV2Icon name="plus" :size="16" />
              <span>Soal Biasa</span>
            </button>
            <button
              type="button"
              class="w-full min-h-11 py-3 rounded-2xl border-2 border-dashed border-[#BBD0EC] bg-[#F8FBFF] hover:bg-[#E8F0FE] text-[#1B5FD9] text-xs flex flex-col items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="ocrBerjalan"
              @click="addQuestion(currentStep, true)"
            >
              <span class="inline-flex items-center gap-2 font-extrabold"><AdminV2Icon name="plus" :size="16" />Soal Cerita</span>
              <span class="text-[11px] font-semibold text-[#667085]">1 bacaan untuk beberapa pertanyaan</span>
            </button>
          </div>
          <button
            v-else
            type="button"
            class="w-full min-h-11 py-3 rounded-2xl border-2 border-dashed border-[#BBD0EC] bg-[#F8FBFF] hover:bg-[#E8F0FE] text-[#1B5FD9] font-extrabold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="ocrBerjalan"
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
            :disabled="currentStep === 'PG' || ocrBerjalan"
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
            :disabled="ocrBerjalan"
            @click="nextStep"
          >
            <span>{{ isLastStep ? 'Simpan Seluruh Paket' : 'Lanjut' }}</span>
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
          :disabled="saving || ocrBerjalan"
        >
          {{ saving ? 'Menyimpan…' : 'Simpan Bank Soal' }}
        </button>
      </div>
    </div>
  </div>
</template>
