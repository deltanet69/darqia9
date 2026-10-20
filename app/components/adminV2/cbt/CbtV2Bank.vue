<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import CbtV2BankForm from './CbtV2BankForm.vue'
import type { GradeType, BankPackage, BankQuestionItem } from './cbtV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import { isArabicText, renderKaTeXHtml } from '~/utils/cbtFormula'
import { readWordBankTemplate, type WordBankPreview } from '~/utils/cbtWordBank'

interface Props {
  grade: GradeType
}

const props = defineProps<Props>()
const cbtData = useAdminCbtData()

const emit = defineEmits<{
  (e: 'open-drawer', type: string, payload?: any): void
  (e: 'toast', msg: string): void
}>()

// Navigation & Filters: 'classes' | 'subjects' | 'detail' | 'form'
const bankMode = ref<'classes' | 'subjects' | 'detail' | 'form'>('classes')
const selectedClass = ref('')
const selectedPkgId = ref<string | null>(null)
const searchQuery = ref('')
const levelFilter = ref('all')
const activeFormat = ref<'all' | 'PG' | 'Isian' | 'Esai' | 'Interaktif'>('all')

const packages = computed(() => cbtData.bankPackages.value)

// Form State for CbtV2BankForm
const formDraft = ref<BankPackage | null>(null)
const isEditingForm = ref(false)
type QuestionStep = 'PG' | 'Isian' | 'Esai' | 'Interaktif'
const formStep = ref<QuestionStep>('PG')
const draftStorageFailed = ref(false)

const draftStorageKey = () => `darqia:cbt-bank-draft:${props.grade}`

const persistFormDraft = () => {
  if (typeof window === 'undefined' || !formDraft.value) return
  try {
    window.sessionStorage.setItem(draftStorageKey(), JSON.stringify({
      draft: formDraft.value,
      editing: isEditingForm.value,
      selectedClass: selectedClass.value,
      selectedPkgId: selectedPkgId.value,
      step: formStep.value
    }))
    draftStorageFailed.value = false
  } catch {
    if (!draftStorageFailed.value) {
      draftStorageFailed.value = true
      emit('toast', 'Draf terlalu besar untuk disimpan otomatis. Simpan paket sebelum menutup halaman.')
    }
  }
}

const clearFormDraft = () => {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(draftStorageKey())
}

const updateFormDraft = (draft: BankPackage) => {
  formDraft.value = draft
  persistFormDraft()
}

const updateFormStep = (step: QuestionStep) => {
  formStep.value = step
  persistFormDraft()
}

const restoreFormDraft = () => {
  if (typeof window === 'undefined') return
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(draftStorageKey()) || 'null') as {
      draft?: BankPackage
      editing?: boolean
      selectedClass?: string
      selectedPkgId?: string | null
      step?: QuestionStep
    } | null
    if (!saved?.draft || saved.draft.grade !== props.grade || !Array.isArray(saved.draft.questions)) return

    formDraft.value = saved.draft
    isEditingForm.value = Boolean(saved.editing)
    selectedClass.value = saved.selectedClass || saved.draft.classroom
    selectedPkgId.value = saved.selectedPkgId || null
    formStep.value = ['PG', 'Isian', 'Esai', 'Interaktif'].includes(saved.step || '')
      ? saved.step as QuestionStep
      : 'PG'
    bankMode.value = 'form'
    emit('toast', 'Draf Bank Soal dipulihkan.')
  } catch {
    clearFormDraft()
  }
}

// Import modal state
const isImportModalOpen = ref(false)
const importPreview = ref<WordBankPreview | null>(null)
const importError = ref('')
const isImporting = ref(false)
const importFileName = ref('')

const currentGradePackages = computed(() => {
  return packages.value.filter(p => p.grade === props.grade)
})

const allClasses = computed(() => {
  return cbtData.classes.value.filter(item => item.grade === props.grade).map(item => item.name)
})

const allSubjects = computed(() => {
  return cbtData.subjects.value.filter(item => item.grade === props.grade).map(item => item.name)
})

const filteredClasses = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  const lv = levelFilter.value
  return allClasses.value.filter(c => {
    const matchQ = !q || c.toLowerCase().includes(q)
    const matchLv = lv === 'all' || c.includes(lv)
    return matchQ && matchLv
  })
})

const classStats = (cls: string) => {
  const pks = currentGradePackages.value.filter(p => p.classroom === cls)
  const countByType = (t: string) =>
    pks.reduce((sum, p) => sum + p.questions.filter(q => q.type === t).length, 0)
  const total = pks.reduce((sum, p) => sum + p.questions.length, 0)
  return {
    subjects: pks.length,
    total,
    pg: countByType('PG'),
    isian: countByType('Isian'),
    esai: countByType('Esai'),
    inter: countByType('Interaktif')
  }
}

// Current subject packages in selected class
const subjectPackages = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return currentGradePackages.value.filter(p => {
    const inCls = p.classroom === selectedClass.value
    const matchQ = !q || p.subject.toLowerCase().includes(q) || p.teacherName.toLowerCase().includes(q)
    return inCls && matchQ
  })
})

// Current selected package
const selectedPackage = computed(() => {
  return packages.value.find(p => p.id === selectedPkgId.value) || null
})

// Filtered questions in package detail
const displayedQuestions = computed(() => {
  if (!selectedPackage.value) return []
  if (activeFormat.value === 'all') return selectedPackage.value.questions
  return selectedPackage.value.questions.filter(q => q.type === activeFormat.value)
})

// Actions
const openClassSubjects = (cls: string) => {
  selectedClass.value = cls
  bankMode.value = 'subjects'
  searchQuery.value = ''
}

const openPackageDetail = (pkgId: string) => {
  selectedPkgId.value = pkgId
  bankMode.value = 'detail'
  activeFormat.value = 'all'
}

const startCreatePackage = (preselectedClass?: string) => {
  const targetClass = preselectedClass || selectedClass.value || allClasses.value[0] || ''
  const targetSubject = allSubjects.value[0] || ''
  formDraft.value = {
    id: `PKG-${Date.now()}`,
    code: `${targetSubject.slice(0, 3).toUpperCase()}-${targetClass.replace(/\s+/g, '')}`,
    classroom: targetClass,
    subject: targetSubject,
    grade: props.grade,
    difficulty: 'Sedang',
    teacherName: '',
    updatedAt: 'Baru saja',
    hasInteractive: false,
    questions: [
      {
        id: `Q-${Date.now()}-1`,
        number: 1,
        type: 'PG',
        difficulty: 'Sedang',
        text: '',
        key: 'A',
        options: [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' }
        ]
      }
    ]
  }
  isEditingForm.value = false
  formStep.value = 'PG'
  bankMode.value = 'form'
  persistFormDraft()
}

const startEditPackage = (pkg: BankPackage) => {
  formDraft.value = JSON.parse(JSON.stringify(pkg))
  isEditingForm.value = true
  formStep.value = 'PG'
  bankMode.value = 'form'
  persistFormDraft()
}

const handleSavePackage = async (updatedPkg: BankPackage) => {
  try {
    const savedId = await cbtData.saveBankPackage(updatedPkg)
    selectedPkgId.value = savedId
    selectedClass.value = updatedPkg.classroom
    bankMode.value = 'detail'
    formDraft.value = null
    clearFormDraft()
    emit('toast', `Paket bank soal ${updatedPkg.subject} berhasil disimpan.`)
  } catch (saveError) {
    emit('toast', saveError instanceof Error ? saveError.message : 'Paket bank soal gagal disimpan.')
  }
}

const handleCancelForm = () => {
  clearFormDraft()
  formDraft.value = null
  if (selectedPkgId.value) {
    bankMode.value = 'detail'
  } else if (selectedClass.value) {
    bankMode.value = 'subjects'
  } else {
    bankMode.value = 'classes'
  }
}

const exportCsv = (pkg: BankPackage) => {
  const rows = pkg.questions.map(q => {
    const k = Array.isArray(q.key) ? q.key.join(', ') : (q.key || '-')
    return [
      q.number,
      `"${q.type}"`,
      `"${q.difficulty}"`,
      `"${q.text.replace(/"/g, '""')}"`,
      `"${String(k).replace(/"/g, '""')}"`,
      `"${q.mediaUrl || '-'}"`
    ].join(',')
  })
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
    'No,Tipe Format,Tingkat Kesulitan,Pertanyaan,Kunci / Rubrik Jawaban,Media Lampiran',
    ...rows
  ].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Bank_Soal_${pkg.subject}_${pkg.classroom}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  emit('toast', `File CSV paket ${pkg.subject} berhasil diunduh.`)
}

const deleteQuestion = async (qId: string) => {
  if (!selectedPackage.value) return
  if (confirm('Hapus butir soal ini dari paket?')) {
    const updated = structuredClone(selectedPackage.value)
    updated.questions = updated.questions.filter(q => q.id !== qId)
    updated.questions.forEach((q, i) => { q.number = i + 1 })
    await handleSavePackage(updated)
  }
}

const deletePackage = async (pkgId: string) => {
  if (confirm('Hapus seluruh paket bank soal ini?')) {
    try {
      await cbtData.deleteBankPackage(pkgId)
      clearFormDraft()
      bankMode.value = 'classes'
      emit('toast', 'Paket bank soal berhasil dihapus.')
    } catch (deleteError) {
      emit('toast', deleteError instanceof Error ? deleteError.message : 'Paket bank soal gagal dihapus.')
    }
  }
}

onMounted(async () => {
  await cbtData.load()
  restoreFormDraft()
})

const downloadWordTemplate = (grade: GradeType) => {
  const link = document.createElement('a')
  link.href = `/templates/Template_Import_Bank_Soal_${grade}.docx`
  link.download = `Template_Import_Bank_Soal_${grade}.docx`
  link.click()
}

const readImportFile = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  importPreview.value = null
  importError.value = ''
  importFileName.value = file?.name || ''
  if (!file) return
  try {
    importPreview.value = await readWordBankTemplate(file, props.grade, allClasses.value, allSubjects.value)
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'Dokumen Word tidak dapat dibaca.'
  }
}

const closeImport = () => {
  isImportModalOpen.value = false
  importPreview.value = null
  importError.value = ''
  importFileName.value = ''
}

const confirmImport = async () => {
  if (!importPreview.value || isImporting.value) return
  isImporting.value = true
  try {
    const savedId = await cbtData.saveBankPackage(importPreview.value.package)
    selectedPkgId.value = savedId
    selectedClass.value = importPreview.value.classroom
    activeFormat.value = 'all'
    bankMode.value = 'detail'
    emit('toast', `${importPreview.value.questionCount} butir soal berhasil masuk ke Bank Soal.`)
    closeImport()
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'Bank soal gagal disimpan.'
  } finally {
    isImporting.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- VIEW 4: FULL-PAGE PACKAGE BUILDER (vbt-v4) -->
    <div v-if="bankMode === 'form' && formDraft">
      <CbtV2BankForm
        :pkg="formDraft"
        :editing="isEditingForm"
        :grade="grade"
        :class-options="allClasses"
        :subject-options="allSubjects"
        :initial-step="formStep"
        @save="handleSavePackage"
        @cancel="handleCancelForm"
        @update-draft="updateFormDraft"
        @update-step="updateFormStep"
        @toast="(m) => emit('toast', m)"
      />
    </div>

    <!-- VIEW 1: CLASSES GRID -->
    <div v-else-if="bankMode === 'classes'" class="space-y-4">
      <!-- Section Head -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">Bank Soal</h2>
          <p class="text-xs text-[#667085] mt-0.5">Jelajahi rombel → paket mapel → rincian soal.</p>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            class="min-h-11 px-3 sm:px-4 rounded-xl border border-[#E7EBF2] bg-white hover:bg-[#F3F5F9] text-xs font-extrabold text-[#344054] transition inline-flex items-center justify-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
            @click="isImportModalOpen = true"
          >
            <AdminV2Icon name="download" :size="14" />
            <span>Import Word/Excel</span>
          </button>
          <button
            type="button"
            class="min-h-11 px-3 sm:px-4 rounded-xl bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-extrabold transition shadow-sm inline-flex items-center justify-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5FD9]"
            @click="startCreatePackage()"
          >
            <AdminV2Icon name="plus" :size="14" />
            <span>Buat Paket Soal</span>
          </button>
        </div>
      </div>

      <!-- 4 KPIs (vbt-v4) -->
      <div class="hidden lg:grid grid-cols-4 gap-3">
        <!-- 1. Paket Contoh -->
        <article class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 flex flex-col justify-between shadow-xs">
          <div class="flex items-center justify-between text-xs">
            <span class="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
              <AdminV2Icon name="book" :size="16" />
            </span>
            <span class="text-[10px] font-extrabold text-[#667085]">Multi-Format</span>
          </div>
          <div class="my-2">
            <div class="text-2xl font-extrabold font-mono text-[#101828] leading-none">
              {{ currentGradePackages.length }} Paket
            </div>
            <div class="text-xs text-[#667085] font-semibold mt-1">Paket tersimpan</div>
          </div>
        </article>

        <!-- 2. Rombel Aktif -->
        <article class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 flex flex-col justify-between shadow-xs">
          <div class="flex items-center justify-between text-xs">
            <span class="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
              <AdminV2Icon name="users" :size="16" />
            </span>
            <span class="text-[10px] font-extrabold text-[#667085]">{{ grade }}</span>
          </div>
          <div class="my-2">
            <div class="text-2xl font-extrabold font-mono text-[#101828] leading-none">
              {{ allClasses.length }}
            </div>
            <div class="text-xs text-[#667085] font-semibold mt-1">Rombel aktif</div>
          </div>
        </article>

        <!-- 3. Mata Pelajaran Siap -->
        <article class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 flex flex-col justify-between shadow-xs">
          <div class="flex items-center justify-between text-xs">
            <span class="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
              <AdminV2Icon name="check" :size="16" />
            </span>
            <span class="text-[10px] font-extrabold text-[#667085]">Kurikulum</span>
          </div>
          <div class="my-2">
            <div class="text-2xl font-extrabold font-mono text-[#101828] leading-none">
              {{ allSubjects.length }} Mapel
            </div>
            <div class="text-xs text-[#667085] font-semibold mt-1">Mata pelajaran siap</div>
          </div>
        </article>

        <!-- 4. Format Soal -->
        <article class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 flex flex-col justify-between shadow-xs">
          <div class="flex items-center justify-between text-xs">
            <span class="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
              <AdminV2Icon name="grid" :size="16" />
            </span>
            <span class="text-[10px] font-extrabold text-[#667085]">PG · Isian · Esai · Interaktif</span>
          </div>
          <div class="my-2">
            <div class="text-2xl font-extrabold font-mono text-[#101828] leading-none">
              4 Format
            </div>
            <div class="text-xs text-[#667085] font-semibold mt-1">Format soal</div>
          </div>
        </article>
      </div>

      <div class="lg:hidden rounded-xl border border-[#E7EBF2] bg-white px-3.5 py-3 text-sm text-[#344054]">
        <strong class="text-[#101828]">{{ currentGradePackages.length }}</strong> paket pada
        <strong class="text-[#101828]">{{ allClasses.length }}</strong> rombel dan
        <strong class="text-[#101828]">{{ allSubjects.length }}</strong> mata pelajaran.
      </div>

      <!-- Toolstrip Search + Level Filter -->
      <section class="bg-white border border-[#E7EBF2] rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <AdminV2Icon name="search" :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari rombel, mis. X RPL 1, VII-A"
            class="w-full bg-[#F9FAFC] border border-[#E7EBF2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#101828] outline-none focus:bg-white focus:border-[#1B5FD9]"
          >
        </div>

        <select
          v-model="levelFilter"
          class="border border-[#E7EBF2] rounded-xl px-3 py-2 text-xs font-bold text-[#344054] bg-white outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="all">Semua Tingkat</option>
          <template v-if="grade === 'SMK'">
            <option value="X">Kelas X</option>
            <option value="XI">Kelas XI</option>
            <option value="XII">Kelas XII</option>
            <option value="RPL">Jurusan RPL</option>
            <option value="TKJ">Jurusan TKJ</option>
          </template>
          <template v-else>
            <option value="VII">Kelas VII</option>
            <option value="VIII">Kelas VIII</option>
            <option value="IX">Kelas IX</option>
          </template>
        </select>
      </section>

      <!-- 4-col Cards Grid -->
      <div v-if="filteredClasses.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <article
          v-for="c in filteredClasses"
          :key="c"
          role="button"
          tabindex="0"
          class="bg-white border border-[#E7EBF2] hover:border-[#1B5FD9] rounded-[18px] p-4 sm:p-5 shadow-xs cursor-pointer transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
          @click="openClassSubjects(c)"
          @keydown.enter.prevent="openClassSubjects(c)"
          @keydown.space.prevent="openClassSubjects(c)"
        >
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="w-9 h-9 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
                <AdminV2Icon name="book" :size="18" />
              </span>
              <span class="text-[10.5px] font-extrabold px-2 py-0.5 rounded-full bg-[#EFF2F7] text-[#344054]">
                {{ grade }}
              </span>
            </div>
            <h3 class="text-base font-extrabold text-[#101828]">{{ c }}</h3>
            <p class="text-xs text-[#667085] mt-0.5 mb-3">
              {{ classStats(c).subjects ? `${classStats(c).subjects} paket mapel tersedia` : 'Belum ada paket soal' }}
            </p>

            <div class="flex items-center gap-4 text-xs mt-2">
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">{{ classStats(c).total }}</b>
                <span class="text-[10px] text-[#667085]">Total soal</span>
              </div>
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">4</b>
                <span class="text-[10px] text-[#667085]">Jenis format</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 mt-4 border-t border-[#E7EBF2] text-xs font-bold text-[#1B5FD9]">
            <span>Lihat paket mapel</span>
            <AdminV2Icon name="arrow-right" :size="12" />
          </div>
        </article>
      </div>
      <div v-else class="bg-white border border-[#E7EBF2] rounded-2xl p-8 text-center text-xs text-[#667085]">
        Rombel tidak ditemukan. Ubah kata kunci atau filter tingkat.
      </div>
    </div>

    <!-- VIEW 2: SUBJECTS LIST -->
    <div v-else-if="bankMode === 'subjects'" class="space-y-4">
      <button
        type="button"
        class="text-xs font-bold text-[#667085] hover:text-[#101828] inline-flex items-center gap-1.5 transition"
        @click="bankMode = 'classes'"
      >
        <AdminV2Icon name="arrow-left" :size="12" />
        <span>Kembali ke daftar rombel</span>
      </button>

      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">
            Bank Soal · {{ selectedClass }}
          </h2>
          <p class="text-xs text-[#667085] mt-0.5">
            Paket mata pelajaran dan komposisi format untuk rombel ini.
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2.5 rounded-full bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-extrabold transition shadow-sm inline-flex items-center gap-1.5"
          @click="startCreatePackage(selectedClass)"
        >
          <AdminV2Icon name="plus" :size="14" />
          <span>Buat Paket Mapel Baru</span>
        </button>
      </div>

      <!-- Search Toolstrip -->
      <div class="relative w-full">
        <AdminV2Icon name="search" :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari mapel atau guru"
          class="w-full bg-white border border-[#E7EBF2] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#101828] outline-none shadow-xs"
        >
      </div>

      <!-- Table of Packages -->
      <div v-if="subjectPackages.length" class="space-y-3 md:hidden">
        <article
          v-for="p in subjectPackages"
          :key="p.id"
          class="rounded-2xl border border-[#E7EBF2] bg-white p-4 space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="text-sm font-extrabold text-[#101828] break-words">{{ p.subject }}</h3>
              <p class="mt-0.5 font-mono text-[11px] text-[#667085] break-all">{{ p.code }}</p>
            </div>
            <span class="shrink-0 rounded-lg bg-[#EFF2F7] px-2 py-1 text-[11px] font-bold text-[#344054]">{{ p.questions.length }} soal</span>
          </div>

          <p class="text-xs text-[#667085]">Guru penyusun: <strong class="text-[#344054]">{{ p.teacherName }}</strong></p>

          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="t in ['PG', 'Isian', 'Esai', 'Interaktif'].filter(fmt => p.questions.some(q => q.type === fmt))"
              :key="t"
              class="rounded-lg bg-[#E8F0FE] px-2 py-1 text-[11px] font-bold text-[#1B5FD9]"
            >
              {{ p.questions.filter(q => q.type === t).length }} {{ t }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 border-t border-[#E7EBF2] pt-3">
            <button
              type="button"
              class="min-h-11 rounded-xl border border-[#E7EBF2] px-3 text-xs font-bold text-[#344054] active:bg-[#F3F5F9]"
              @click="startEditPackage(p)"
            >
              Edit Paket
            </button>
            <button
              type="button"
              class="min-h-11 rounded-xl bg-[#E8F0FE] px-3 text-xs font-bold text-[#0A2A5C] active:bg-[#D6E6FF]"
              @click="openPackageDetail(p.id)"
            >
              Lihat Soal
            </button>
          </div>
        </article>
      </div>
      <div v-else class="md:hidden rounded-2xl border border-[#E7EBF2] bg-white p-6 text-center text-sm text-[#667085]">
        Belum ada paket sesuai pencarian. Buat paket mapel baru untuk kelas ini.
      </div>

      <section class="hidden md:block bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[700px]">
            <thead class="bg-[#FAFBFC] border-b border-[#E7EBF2] text-[10px] uppercase font-extrabold text-[#667085] tracking-wider">
              <tr>
                <th class="py-3 px-4">Mata Pelajaran &amp; Kode</th>
                <th class="py-3 px-4">Guru Penyusun</th>
                <th class="py-3 px-4">Komposisi Format</th>
                <th class="py-3 px-4">Kesulitan</th>
                <th class="py-3 px-4">Total Soal</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="p in subjectPackages" :key="p.id" class="hover:bg-[#FAFCFF] transition">
                <td class="py-3 px-4">
                  <strong class="block text-xs font-bold text-[#101828]">{{ p.subject }}</strong>
                  <span class="block text-[10.5px] font-mono text-[#667085]">{{ p.code }}</span>
                </td>
                <td class="py-3 px-4 font-semibold text-[#344054]">{{ p.teacherName }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      v-for="t in ['PG', 'Isian', 'Esai', 'Interaktif'].filter(fmt => p.questions.some(q => q.type === fmt))"
                      :key="t"
                      class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E8F0FE] text-[#1B5FD9]"
                    >
                      {{ p.questions.filter(q => q.type === t).length }} {{ t }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EFF2F7] text-[#344054]">
                    {{ p.difficulty }}
                  </span>
                </td>
                <td class="py-3 px-4 font-mono font-extrabold">{{ p.questions.length }}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                  <div class="inline-flex gap-1.5">
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-xl border border-[#E7EBF2] text-xs font-bold hover:bg-[#F3F5F9] transition"
                      @click="startEditPackage(p)"
                    >
                      Edit Paket
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1.5 text-xs font-bold text-[#1B5FD9] hover:underline inline-flex items-center gap-1"
                      @click="openPackageDetail(p.id)"
                    >
                      <span>Lihat Soal</span>
                      <AdminV2Icon name="arrow-right" :size="12" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!subjectPackages.length">
                <td colspan="6" class="py-8 text-center text-xs text-[#667085]">
                  Belum ada paket sesuai pencarian. Buat paket mapel baru untuk kelas ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-3 border-t border-[#E7EBF2] bg-[#FAFBFC] text-xs text-[#667085]">
          Menampilkan {{ subjectPackages.length }} paket soal untuk {{ selectedClass }}.
        </div>
      </section>
    </div>

    <!-- VIEW 3: PACKAGE DETAIL -->
    <div v-else-if="bankMode === 'detail' && selectedPackage" class="space-y-4">
      <button
        type="button"
        class="text-xs font-bold text-[#667085] hover:text-[#101828] inline-flex items-center gap-1.5 transition"
        @click="bankMode = 'subjects'"
      >
        <AdminV2Icon name="arrow-left" :size="12" />
        <span>Kembali ke paket {{ selectedPackage.classroom }}</span>
      </button>

      <!-- Head & Actions -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">
            {{ selectedPackage.subject }} · {{ selectedPackage.classroom }}
          </h2>
          <p class="text-xs text-[#667085] mt-0.5">
            Penyusun: {{ selectedPackage.teacherName }} · {{ selectedPackage.questions.length }} butir soal · {{ selectedPackage.code }}
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            class="px-3.5 py-2 rounded-full border border-[#E7EBF2] text-xs font-extrabold hover:bg-[#F3F5F9] inline-flex items-center gap-1.5 transition"
            @click="exportCsv(selectedPackage)"
          >
            <AdminV2Icon name="download" :size="14" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-full bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition"
            @click="startEditPackage(selectedPackage)"
          >
            <span>Edit Paket Lengkap</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-full border border-[#F8D3CE] text-[#C43232] hover:bg-[#FDECEA] text-xs font-extrabold transition"
            @click="deletePackage(selectedPackage.id)"
          >
            Hapus Paket
          </button>
        </div>
      </div>

      <!-- Format Filter Bar -->
      <div class="bg-white border border-[#E7EBF2] rounded-xl p-2.5 shadow-xs overflow-x-auto">
        <div class="flex items-center gap-1 text-xs font-bold min-w-max">
          <button
            v-for="fmt in ['all', 'PG', 'Isian', 'Esai', 'Interaktif'] as const"
            :key="fmt"
            type="button"
            class="px-3 py-1.5 rounded-lg transition"
            :class="activeFormat === fmt ? 'bg-[#1B5FD9] text-white' : 'text-[#667085] hover:bg-[#EFF2F7]'"
            @click="activeFormat = fmt"
          >
            {{ fmt === 'all' ? `Semua Format (${selectedPackage.questions.length})` : `${fmt} (${selectedPackage.questions.filter(q => q.type === fmt).length})` }}
          </button>
        </div>
      </div>

      <!-- Questions List -->
      <div v-if="displayedQuestions.length" class="space-y-3">
        <article
          v-for="(q, qIdx) in displayedQuestions"
          :key="q.id"
          class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
        >
          <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E7EBF2] flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EFF2F7] text-[#344054]">
                Soal #{{ qIdx + 1 }}
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E8F0FE] text-[#1B5FD9]">
                {{ q.type === 'PG' && q.isMultiSelect ? 'PG Kompleks' : q.type }}
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEF4E5] text-[#AD6504]">
                {{ q.difficulty }}
              </span>
            </div>
            <div class="inline-flex gap-1.5">
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg border border-[#E7EBF2] text-xs font-bold hover:bg-[#F3F5F9]"
                @click="startEditPackage(selectedPackage)"
              >
                Edit Soal
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg border border-[#F8D3CE] text-[#C43232] hover:bg-[#FDECEA] text-xs font-bold"
                @click="deleteQuestion(q.id)"
              >
                Hapus
              </button>
            </div>
          </div>

          <!-- Question Text -->
          <div
            class="block overflow-x-auto text-xs sm:text-sm font-semibold text-[#101828] leading-relaxed"
            :dir="q.isRtl || isArabicText(q.text) ? 'rtl' : 'ltr'"
            v-html="renderKaTeXHtml(q.text)"
          />
          <img
            v-if="q.imageUrl"
            :src="q.imageUrl"
            alt="Gambar pendukung soal"
            class="max-h-64 rounded-xl border border-[#E7EBF2] object-contain"
          >

          <!-- PG Options preview with correct highlight -->
          <div v-if="q.type === 'PG' && q.options" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <span
              v-for="opt in q.options"
              :key="opt.key"
              class="p-2.5 rounded-xl border"
              :class="Array.isArray(q.key) ? q.key.includes(opt.key) ? 'bg-[#E7F8F0] border-[#BDE7D0] text-[#087C52] font-bold' : 'bg-[#FAFBFC] border-[#E7EBF2] text-[#344054]' : q.key === opt.key ? 'bg-[#E7F8F0] border-[#BDE7D0] text-[#087C52] font-bold' : 'bg-[#FAFBFC] border-[#E7EBF2] text-[#344054]'"
            >
              <b>{{ opt.key }}.</b>
              <span class="overflow-x-auto" :dir="isArabicText(opt.text) ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(opt.text)" />
            </span>
          </div>

          <!-- Answer / Rubric Box -->
          <div class="p-2.5 rounded-xl bg-[#EFF2F7] text-xs text-[#344054]">
            <b class="text-[#101828]">{{ q.type === 'Esai' ? 'Rubrik: ' : q.type === 'Interaktif' ? 'Media & Kunci: ' : 'Kunci: ' }}</b>
            <span>{{ q.rubric || (Array.isArray(q.key) ? q.key.join(', ') : q.key) || '—' }}</span>
          </div>
        </article>
      </div>
      <div v-else class="bg-white border border-[#E7EBF2] rounded-2xl p-8 text-center text-xs text-[#667085]">
        Belum ada butir soal pada format ini.
      </div>
    </div>

    <!-- IMPORT BANK SOAL MODAL (vbt-v4) -->
    <Teleport to="body">
      <div
        v-if="isImportModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
      >
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-[#E7EBF2]">
          <!-- Head -->
          <div class="p-5 border-b border-[#E7EBF2] flex items-center justify-between">
            <div>
              <h3 class="text-base font-extrabold text-[#101828]">Import Bank Soal</h3>
              <p class="text-xs text-[#667085] mt-0.5">Unggah template Word .docx lalu konfirmasi metadata yang terdeteksi.</p>
            </div>
            <button
              type="button"
              aria-label="Tutup dialog import"
              class="w-8 h-8 rounded-lg hover:bg-[#EFF2F7] flex items-center justify-center text-[#667085]"
              @click="closeImport"
            >
              <AdminV2Icon name="x" :size="16" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4 text-xs">
            <div class="p-3.5 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] flex items-start gap-2.5 font-semibold">
              <AdminV2Icon name="book" :size="16" class="mt-0.5 shrink-0" />
              <span>Gunakan template Word agar metadata kelas dan mata pelajaran dapat terdeteksi otomatis sebelum disimpan.</span>
            </div>

            <div class="rounded-xl border border-[#E7EBF2] bg-[#FAFBFC] p-3">
              <p class="font-extrabold text-[#344054]">Template sesuai jenjang aktif: {{ props.grade }}</p>
              <p class="mt-1 text-[11px] leading-relaxed text-[#667085]">PG SMP berisi 4 pilihan A-D. PG SMK berisi 5 pilihan A-E. Template juga memuat Isian, Esai, Video YouTube, dan Audio.</p>
              <button type="button" class="mt-2 min-h-10 rounded-lg bg-white px-3 font-extrabold text-[#1B5FD9] ring-1 ring-[#B9D1F9] hover:bg-[#E8F0FE]" @click="downloadWordTemplate(props.grade)">
                Unduh Template Word {{ props.grade }}
              </button>
            </div>

            <div>
              <label class="block font-bold text-[#344054] mb-1.5">Unggah Template Bank Soal</label>
              <input
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-[#F9FAFC] outline-none focus:border-[#1B5FD9]"
                @change="readImportFile"
              >
              <p v-if="importFileName" class="mt-1.5 text-[11px] text-[#667085]">Dokumen: {{ importFileName }}</p>
            </div>

            <div v-if="importPreview" class="rounded-xl border border-[#B9D1F9] bg-[#F6F9FF] p-3 text-[#0A2A5C]">
              <p class="font-extrabold">Data terdeteksi. Periksa sebelum disimpan.</p>
              <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                <div><dt class="text-[#667085]">Jenjang</dt><dd class="font-bold">{{ importPreview.package.grade }}</dd></div>
                <div><dt class="text-[#667085]">Kelas</dt><dd class="font-bold">{{ importPreview.classroom }}</dd></div>
                <div><dt class="text-[#667085]">Mata pelajaran</dt><dd class="font-bold">{{ importPreview.subject }}</dd></div>
                <div><dt class="text-[#667085]">Butir soal</dt><dd class="font-bold">{{ importPreview.questionCount }} butir</dd></div>
              </dl>
            </div>

            <p v-if="importError" class="rounded-xl bg-[#FDECEA] p-3 text-[11px] font-semibold text-[#C43232]">{{ importError }}</p>
          </div>

          <!-- Foot -->
          <div class="p-4 border-t border-[#E7EBF2] bg-[#FAFBFC] flex items-center justify-end gap-2">
            <button type="button" class="min-h-10 px-4 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-white" @click="closeImport">
              Batal
            </button>
            <button
              type="button"
              class="min-h-10 px-4 rounded-xl bg-[#1B5FD9] hover:bg-[#12459B] disabled:bg-[#98A2B3] text-white text-xs font-bold shadow-sm"
              :disabled="!importPreview || isImporting"
              @click="confirmImport"
            >
              {{ isImporting ? 'Menyimpan...' : 'Konfirmasi dan Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
