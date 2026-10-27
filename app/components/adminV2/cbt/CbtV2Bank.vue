<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import CbtV2BankForm from './CbtV2BankForm.vue'
import type { GradeType, BankPackage, BankQuestionItem } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource } from '~/composables/useAdminCbtData'
import { isArabicText, renderKaTeXHtml } from '~/utils/cbtFormula'
import { readWordBankTemplate, type WordBankPreview } from '~/utils/cbtWordBank'
import { readExcelBankTemplate, buildBankExcel } from '~/utils/cbtExcelBank'

interface Props {
  grade: GradeType
  source?: AssessmentSource
}

const props = defineProps<Props>()
const bankLabel = computed(() => props.source === 'ujian_harian' ? 'Bank Soal LMS (ujian harian)' : 'Bank Soal CBT (PTS/PAS)')
const cbtData = useAdminCbtData(props.source ?? 'cbt')

const emit = defineEmits<{
  (e: 'open-drawer', type: string, payload?: any): void
  (e: 'toast', msg: string): void
}>()

// Navigation & Filters: 'classes' | 'subjects' | 'detail' | 'form'
const bankMode = ref<'subjects' | 'detail' | 'form'>('subjects')
const hasSavedDraft = ref(false)
const isSaving = ref(false)
const selectedClass = ref('')
const selectedPkgId = ref<string | null>(null)
const searchQuery = ref('')
const activeFormat = ref<'all' | 'PG' | 'Isian' | 'Esai' | 'Interaktif'>('all')

const packages = computed(() => cbtData.bankPackages.value)

// Form State for CbtV2BankForm
const formDraft = ref<BankPackage | null>(null)
const isEditingForm = ref(false)
type QuestionStep = 'PG' | 'Isian' | 'Esai' | 'Interaktif'
const formStep = ref<QuestionStep>('PG')
const draftStorageFailed = ref(false)

const draftStorageKey = () => `darqia:${props.source || 'cbt'}-bank-draft:${props.grade}`

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
  hasSavedDraft.value = false
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
    formStep.value = ['PG', 'Esai', 'Interaktif'].includes(saved.step || '')
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
const importTarget = ref<'baru' | 'tambah'>('baru')
const importTargetPkgId = ref('')
const expandedQuestions = ref<Record<string, boolean>>({})
const formatColorHex = (type: string) => (({ PG: '#1B5FD9', Isian: '#0E9384', Esai: '#6941C6', Interaktif: '#B54708' } as Record<string, string>)[type] || '#667085')
const toggleQuestion = (id: string) => { expandedQuestions.value = { ...expandedQuestions.value, [id]: !expandedQuestions.value[id] } }
const isQuestionOpen = (q: BankQuestionItem, idx: number) => expandedQuestions.value[q.id] ?? idx === 0
const plainQuestionText = (value = '') => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const questionMeta = (q: BankQuestionItem) => q.type === 'Esai' ? 'Rubrik terisi' : `Kunci ${Array.isArray(q.key) ? q.key.join(', ') : q.key || '-'}`

const currentGradePackages = computed(() => {
  return packages.value.filter(p => p.grade === props.grade)
})
const storedFormatCount = computed(() => new Set(currentGradePackages.value.flatMap(pkg => pkg.questions.map(q => q.type))).size)

const allClasses = computed(() => {
  return cbtData.classes.value.filter(item => item.grade === props.grade).map(item => item.name)
})

const allSubjects = computed(() => {
  return cbtData.subjects.value.filter(item => item.grade === props.grade).map(item => item.name)
})
const subjectsForClass = (classroom: string) => {
  const target = cbtData.classes.value.find(item => item.grade === props.grade && item.name === classroom)
  if (!target) return []
  const ids = new Set(cbtData.classSubjects.value.filter(item => item.class_id === target.id).map(item => item.subject_id))
  for (const bank of currentGradePackages.value.filter(item => item.classId === target.id)) {
    if (bank.subjectId) ids.add(bank.subjectId)
  }
  return cbtData.subjects.value.filter(item => item.grade === props.grade && ids.has(item.id)).map(item => item.name)
}


// Current subject packages in selected class
const subjectPackages = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return currentGradePackages.value.filter(p => {
    const inCls = !selectedClass.value || p.classroom === selectedClass.value
    const matchQ = !q || [p.subject, p.classroom, p.code, p.teacherName].some(value => (value || '').toLowerCase().includes(q))
    return inCls && matchQ
  })
})

// Current selected package
const selectedPackage = computed(() => {
  return currentGradePackages.value.find(p => p.id === selectedPkgId.value) || null
})

// Filtered questions in package detail
const displayedQuestions = computed(() => {
  if (!selectedPackage.value) return []
  if (activeFormat.value === 'all') return selectedPackage.value.questions
  return selectedPackage.value.questions.filter(q => q.type === activeFormat.value)
})

// Actions

const openPackageDetail = (pkgId: string) => {
  if (!currentGradePackages.value.some(pkg => pkg.id === pkgId)) return
  selectedPkgId.value = pkgId
  bankMode.value = 'detail'
  activeFormat.value = 'all'
}

const startCreatePackage = (preselectedClass?: string) => {
  const targetClass = preselectedClass || selectedClass.value || ''
  const targetSubject = ''
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
        options: (props.grade === 'SMP' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']).map(key => ({ key, text: '' }))
      }
    ]
  }
  isEditingForm.value = false
  formStep.value = 'PG'
  bankMode.value = 'form'
  persistFormDraft()
}

const startEditPackage = (pkg: BankPackage) => {
  if (pkg.grade !== props.grade) return
  formDraft.value = JSON.parse(JSON.stringify(pkg))
  isEditingForm.value = true
  formStep.value = 'PG'
  bankMode.value = 'form'
  persistFormDraft()
}

const handleSavePackage = async (updatedPkg: BankPackage) => {
  if (isSaving.value) return
  isSaving.value = true
  try {
    if (!subjectsForClass(updatedPkg.classroom).includes(updatedPkg.subject)) throw new Error('Mata pelajaran tidak tersedia pada kelas yang dipilih.')
    const updated = { ...updatedPkg, code: isEditingForm.value ? updatedPkg.code : `BANK-${props.grade}-${crypto.randomUUID().slice(0, 8).toUpperCase()}` }
    const savedId = await cbtData.saveBankPackage(updated, props.grade)
    selectedPkgId.value = savedId
    selectedClass.value = updatedPkg.classroom
    bankMode.value = 'detail'
    formDraft.value = null
    clearFormDraft()
    emit('toast', `Paket bank soal ${updatedPkg.subject} berhasil disimpan.`)
  } catch (saveError) {
    emit('toast', saveError instanceof Error ? saveError.message : 'Paket bank soal gagal disimpan.')
  } finally { isSaving.value = false }
}

const handleCancelForm = () => {
  clearFormDraft()
  formDraft.value = null
  bankMode.value = 'subjects'
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

const exportExcel = async (pkg: BankPackage) => {
  try {
    const { blob, fileName } = await buildBankExcel(pkg)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    emit('toast', `File Excel paket ${pkg.subject} berhasil diunduh.`)
  } catch {
    emit('toast', 'File Excel gagal dibuat.')
  }
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
      await cbtData.deleteBankPackage(pkgId, props.grade)
      clearFormDraft()
      bankMode.value = 'subjects'
      emit('toast', 'Paket bank soal berhasil dihapus.')
    } catch (deleteError) {
      emit('toast', deleteError instanceof Error ? deleteError.message : 'Paket bank soal gagal dihapus.')
    }
  }
}

onMounted(() => {
  try { hasSavedDraft.value = !!window.sessionStorage.getItem(draftStorageKey()) }
  catch { hasSavedDraft.value = false }
})

const downloadWordTemplate = (grade: GradeType) => {
  const link = document.createElement('a')
  link.href = `/templates/Template_Import_Bank_Soal_${grade}.docx`
  link.download = `Template_Import_Bank_Soal_${grade}.docx`
  link.click()
}

const downloadExcelTemplate = (grade: GradeType) => {
  const link = document.createElement('a')
  link.href = `/templates/Template_Import_Bank_Soal_${grade}.xlsx`
  link.download = `Template_Import_Bank_Soal_${grade}.xlsx`
  link.click()
}

const readImportFile = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  importPreview.value = null
  importError.value = ''
  importFileName.value = file?.name || ''
  if (!file) return
  try {
    importPreview.value = file.name.toLowerCase().endsWith('.xlsx')
      ? await readExcelBankTemplate(file, props.grade, allClasses.value, allSubjects.value)
      : await readWordBankTemplate(file, props.grade, allClasses.value, allSubjects.value)
  } catch (error) {
    importError.value = error instanceof Error ? error.message : 'Dokumen Word tidak dapat dibaca.'
  }
}

const closeImport = () => {
  isImportModalOpen.value = false
  importPreview.value = null
  importError.value = ''
  importFileName.value = ''
  importTarget.value = 'baru'
  importTargetPkgId.value = ''
}

const confirmImport = async () => {
  if (!importPreview.value || isImporting.value) return
  isImporting.value = true
  try {
    if (!subjectsForClass(importPreview.value.classroom).includes(importPreview.value.subject)) throw new Error('Mata pelajaran impor tidak sesuai dengan jadwal kelas.')
    if (importTarget.value === 'tambah') {
      const target = packages.value.find(pkg => pkg.id === importTargetPkgId.value && pkg.grade === props.grade)
      if (!target) throw new Error('Pilih paket tujuan terlebih dahulu.')
      if (target.classroom !== importPreview.value.classroom || target.subject !== importPreview.value.subject) {
        throw new Error(`File ini untuk ${importPreview.value.subject} - ${importPreview.value.classroom}, sedangkan paket tujuan adalah ${target.subject} - ${target.classroom}.`)
      }
      const merged = [...target.questions, ...importPreview.value.package.questions]
      if (merged.length > 100) throw new Error(`Paket sudah berisi ${target.questions.length} soal; tambahan ${importPreview.value.questionCount} soal melebihi batas 100 soal per paket.`)
      const updated: BankPackage = { ...target, hasInteractive: merged.some(q => q.type === 'Interaktif'), questions: merged.map((q, i) => ({ ...q, number: i + 1 })) }
      const savedId = await cbtData.saveBankPackage(updated, props.grade)
      selectedPkgId.value = savedId
      selectedClass.value = target.classroom
      activeFormat.value = 'all'
      bankMode.value = 'detail'
      emit('toast', `${importPreview.value.questionCount} butir soal ditambahkan ke paket ${target.subject}. Total sekarang ${merged.length} soal.`)
      closeImport()
      return
    }
    const savedId = await cbtData.saveBankPackage(importPreview.value.package, props.grade)
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
        :saving="isSaving"
        :editing="isEditingForm"
        :grade="grade"
        :class-options="allClasses"
        :subject-options="subjectsForClass(formDraft.classroom)"
        :initial-step="formStep"
        @save="handleSavePackage"
        @cancel="handleCancelForm"
        @update-draft="updateFormDraft"
        @update-step="updateFormStep"
        @toast="(m) => emit('toast', m)"
      />
    </div>


    <!-- VIEW 2: SUBJECTS LIST -->
    <div v-else-if="bankMode === 'subjects'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-semibold text-[#101828]">
            {{ bankLabel }}
          </h2>
          <p class="text-xs text-[#667085] mt-0.5">
            {{ currentGradePackages.length }} bank soal · {{ currentGradePackages.reduce((total, pkg) => total + pkg.questions.length, 0) }} soal tersimpan · {{ storedFormatCount || '-' }} format · {{ grade }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
        <button v-if="hasSavedDraft" type="button" class="min-h-11 rounded-xl border px-3 text-xs font-bold text-[#344054]" @click="restoreFormDraft">Lanjutkan draf</button>
        <button type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] bg-white px-3 text-xs font-bold text-[#344054]" @click="isImportModalOpen = true">Impor Word / Excel</button>
        <button
          type="button"
          class="px-4 py-2.5 rounded-full bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5"
          @click="startCreatePackage(selectedClass)"
        >
          <AdminV2Icon name="plus" :size="14" />
          <span>Buat Bank Soal</span>
        </button>
        </div>
      </div>

      <!-- Search Toolstrip -->
      <div class="flex flex-col gap-3 sm:flex-row">
      <div class="relative w-full">
        <AdminV2Icon name="search" :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari mata pelajaran, kelas, atau penyusun"
          class="w-full bg-white border border-[#E7EBF2] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#101828] outline-none shadow-xs"
        >
      </div>
      <select v-model="selectedClass" aria-label="Filter kelas bank soal" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm sm:w-56"><option value="">Semua kelas {{ grade }}</option><option v-for="cls in allClasses" :key="cls" :value="cls">{{ cls }}</option></select>
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
              <h3 class="text-sm font-semibold text-[#101828] break-words">{{ p.subject }}</h3>
              <p class="mt-0.5 text-xs text-[#667085]">{{ p.classroom }} · {{ p.updatedAt }}</p>
            </div>
            <span class="shrink-0 rounded-lg bg-[#EFF2F7] px-2 py-1 text-[11px] font-bold text-[#344054]">{{ p.questions.length }} soal</span>
          </div>

          <p class="text-xs text-[#667085]">Guru penyusun: <strong class="text-[#344054]">{{ p.teacherName }}</strong></p>

          <div class="flex flex-wrap gap-x-3 gap-y-1.5">
            <span
              v-for="t in ['PG', 'Isian', 'Esai', 'Interaktif'].filter(fmt => p.questions.some(q => q.type === fmt))"
              :key="t"
              class="inline-flex items-center gap-1.5 text-[11px] text-[#344054]"
            >
              <span class="h-1.5 w-1.5 rounded-full" :style="{ background: formatColorHex(t) }" />
              {{ p.questions.filter(q => q.type === t).length }} {{ t }}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 border-t border-[#E7EBF2] pt-3">
            <button
              type="button"
              class="min-h-11 rounded-xl border border-[#E7EBF2] px-3 text-xs font-bold text-[#344054] active:bg-[#F3F5F9]"
              @click="startEditPackage(p)"
            >
              Ubah
            </button>
            <button
              type="button"
              class="min-h-11 rounded-xl bg-[#E8F0FE] px-3 text-xs font-bold text-[#0A2A5C] active:bg-[#D6E6FF]"
              @click="openPackageDetail(p.id)"
            >
              Lihat
            </button>
            <button type="button" class="min-h-11 rounded-xl border border-[#F8D3CE] px-3 text-xs font-bold text-[#B42318]" @click="deletePackage(p.id)">Hapus</button>
          </div>
        </article>
      </div>
      <div v-else class="md:hidden rounded-2xl border border-[#E7EBF2] bg-white p-6 text-center text-sm text-[#667085]">
        {{ currentGradePackages.length ? 'Tidak ada bank soal sesuai pencarian.' : `Belum ada bank soal ${grade}. Klik Buat Bank Soal untuk mulai menyusun.` }}
      </div>

      <section class="hidden md:block bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[700px]">
            <thead class="bg-[#FAFBFC] border-b border-[#E7EBF2] text-[10px] uppercase font-semibold text-[#667085] tracking-wider">
              <tr>
                <th class="py-3 px-4">Mata Pelajaran &amp; Kelas</th>
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
                  <span class="block text-[11px] text-[#667085]">{{ p.classroom }} · {{ p.updatedAt }}</span>
                </td>
                <td class="py-3 px-4 font-semibold text-[#344054]">{{ p.teacherName }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-x-3 gap-y-1 flex-wrap">
                    <span
                      v-for="t in ['PG', 'Isian', 'Esai', 'Interaktif'].filter(fmt => p.questions.some(q => q.type === fmt))"
                      :key="t"
                      class="inline-flex items-center gap-1.5 text-[11px] text-[#344054]"
                    >
                      <span class="h-1.5 w-1.5 rounded-full" :style="{ background: formatColorHex(t) }" />
                      {{ p.questions.filter(q => q.type === t).length }} {{ t }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="text-xs text-[#667085]">{{ p.difficulty }}</span>
                </td>
                <td class="py-3 px-4 font-mono font-semibold">{{ p.questions.length }}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                  <div class="inline-flex gap-1.5">
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-xl border border-[#E7EBF2] text-xs font-bold hover:bg-[#F3F5F9] transition"
                      @click="startEditPackage(p)"
                    >
                      Ubah
                    </button>
                    <button type="button" class="min-h-11 px-3 text-xs font-bold text-[#B42318]" @click="deletePackage(p.id)">Hapus</button>
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
                  {{ currentGradePackages.length ? 'Tidak ada bank soal sesuai pencarian.' : `Belum ada bank soal ${grade}. Klik Buat Bank Soal untuk mulai menyusun.` }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-3 border-t border-[#E7EBF2] bg-[#FAFBFC] text-xs text-[#667085]">
          Menampilkan {{ subjectPackages.length }} bank soal {{ grade }}{{ selectedClass ? ` · ${selectedClass}` : '' }}.
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
        <span>Kembali ke daftar bank soal</span>
      </button>

      <!-- Head & Actions -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-semibold text-[#101828]">
            {{ selectedPackage.subject }} · {{ selectedPackage.classroom }}
          </h2>
          <p class="text-xs text-[#667085] mt-0.5">
            Penyusun: {{ selectedPackage.teacherName }} · {{ selectedPackage.questions.length }} butir soal · {{ selectedPackage.code }}
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            class="px-3.5 py-2 rounded-full border border-[#E7EBF2] text-xs font-semibold hover:bg-[#F3F5F9] inline-flex items-center gap-1.5 transition"
            @click="exportCsv(selectedPackage)"
          >
            <AdminV2Icon name="download" :size="14" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-full border border-[#E7EBF2] text-xs font-semibold hover:bg-[#F3F5F9] inline-flex items-center gap-1.5 transition"
            @click="exportExcel(selectedPackage)"
          >
            <AdminV2Icon name="download" :size="14" />
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-full bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition"
            @click="startEditPackage(selectedPackage)"
          >
            <span>Edit Paket Lengkap</span>
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-full border border-[#F8D3CE] text-[#C43232] hover:bg-[#FDECEA] text-xs font-semibold transition"
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
      <div v-if="displayedQuestions.length" class="space-y-2">
        <article
          v-for="(q, qIdx) in displayedQuestions"
          :key="q.id"
          class="bg-white border rounded-xl overflow-hidden transition-colors"
          :class="isQuestionOpen(q, qIdx) ? 'border-[#B9C4D6]' : 'border-[#E7EBF2] hover:border-[#CBD5E3]'"
        >
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-3 text-left"
            @click="toggleQuestion(q.id)"
          >
            <span class="text-[11px] text-[#98A2B3] tabular-nums">#{{ qIdx + 1 }}</span>
            <span class="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" :style="{ color: formatColorHex(q.type) }">
              <span class="h-1.5 w-1.5 rounded-full" :style="{ background: formatColorHex(q.type) }" />
              {{ q.type === 'PG' && q.isMultiSelect ? 'PG Kompleks' : q.type }}
            </span>
            <span class="min-w-0 flex-1 truncate text-[13px] text-[#101828]">{{ plainQuestionText(q.text) }}</span>
            <span class="hidden shrink-0 text-[11px] text-[#98A2B3] md:block">{{ q.difficulty }} - {{ questionMeta(q) }}</span>
            <span class="shrink-0 text-[11px] text-[#98A2B3] transition-transform" :class="isQuestionOpen(q, qIdx) ? 'rotate-180' : ''">&#9662;</span>
          </button>

          <div v-if="isQuestionOpen(q, qIdx)" class="space-y-3 px-4 pb-4 md:pl-[52px]">
            <!-- Question Text -->
            <div
              class="block overflow-x-auto text-xs sm:text-sm font-medium text-[#101828] leading-relaxed"
              :dir="q.isRtl || isArabicText(q.text) ? 'rtl' : 'ltr'"
              v-html="renderKaTeXHtml(q.text)"
            />
            <img
              v-if="q.imageUrl"
              :src="q.imageUrl"
              alt="Gambar pendukung soal"
              class="max-h-64 rounded-xl border border-[#E7EBF2] object-contain"
            >

            <!-- Options preview with correct highlight -->
            <div v-if="(q.type === 'PG' || q.type === 'Interaktif') && q.options" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <span
                v-for="opt in q.options"
                :key="opt.key"
                class="p-2.5 rounded-lg border"
                :class="Array.isArray(q.key) ? q.key.includes(opt.key) ? 'bg-[#E7F8F0] border-[#BDE7D0] text-[#087C52] font-semibold' : 'bg-[#FAFBFC] border-[#E7EBF2] text-[#344054]' : q.key === opt.key ? 'bg-[#E7F8F0] border-[#BDE7D0] text-[#087C52] font-semibold' : 'bg-[#FAFBFC] border-[#E7EBF2] text-[#344054]'"
              >
                <b>{{ opt.key }}.</b>
                <span class="overflow-x-auto" :dir="isArabicText(opt.text) ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(opt.text)" />
              </span>
            </div>

            <!-- Answer / Rubric Box -->
            <div class="p-2.5 rounded-lg bg-[#EFF2F7] text-xs text-[#344054]">
              <b class="text-[#101828]">{{ q.type === 'Esai' ? 'Rubrik: ' : q.type === 'Interaktif' ? 'Media & Kunci: ' : 'Kunci: ' }}</b>
              <span>{{ q.type === 'Interaktif' && q.mediaUrl ? `${q.mediaType === 'audio' ? 'Audio' : 'Video'} - ${q.mediaUrl} - ` : '' }}{{ q.rubric || (Array.isArray(q.key) ? q.key.join(', ') : q.key) || '-' }}</span>
            </div>

            <div class="flex gap-1.5">
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-xs font-medium text-[#667085] hover:bg-[#EFF2F7] hover:text-[#101828]"
                @click="startEditPackage(selectedPackage)"
              >
                Edit Soal
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-xs font-medium text-[#C43232] hover:bg-[#FDECEA]"
                @click="deleteQuestion(q.id)"
              >
                Hapus
              </button>
            </div>
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
              <h3 class="text-base font-semibold text-[#101828]">Impor {{ bankLabel }}</h3>
              <p class="text-xs text-[#667085] mt-0.5">Unggah template Word .docx atau Excel .xlsx lalu konfirmasi metadata yang terdeteksi.</p>
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
              <span>Gunakan template resmi agar metadata kelas dan mata pelajaran dapat terdeteksi otomatis sebelum disimpan.</span>
            </div>

            <div class="rounded-xl border border-[#E7EBF2] bg-[#FAFBFC] p-3">
              <p class="font-semibold text-[#344054]">Template sesuai jenjang aktif: {{ props.grade }}</p>
              <p class="mt-1 text-[11px] leading-relaxed text-[#667085]">PG SMP berisi 4 pilihan A-D. PG SMK berisi 5 pilihan A-E. Template juga memuat Esai, Isian, Video YouTube, dan Audio dengan jawaban PG.</p>
              <button type="button" class="mt-2 min-h-10 rounded-lg bg-white px-3 font-semibold text-[#1B5FD9] ring-1 ring-[#B9D1F9] hover:bg-[#E8F0FE]" @click="downloadWordTemplate(props.grade)">
                Unduh Template Word {{ props.grade }}
              </button>
              <button type="button" class="mt-2 ml-2 min-h-10 rounded-lg bg-white px-3 font-semibold text-[#1B5FD9] ring-1 ring-[#B9D1F9] hover:bg-[#E8F0FE]" @click="downloadExcelTemplate(props.grade)">
                Unduh Template Excel {{ props.grade }}
              </button>
            </div>

            <div>
              <label class="block font-semibold text-[#344054] mb-1.5">Simpan sebagai</label>
              <div class="flex rounded-xl bg-[#EEF1F6] p-1 gap-1">
                <button type="button" class="flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition" :class="importTarget === 'baru' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'" @click="importTarget = 'baru'">Paket Baru</button>
                <button type="button" class="flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition" :class="importTarget === 'tambah' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'" @click="importTarget = 'tambah'">Tambah ke Paket Ini</button>
              </div>
              <select v-if="importTarget === 'tambah'" v-model="importTargetPkgId" class="mt-2 w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none focus:border-[#1B5FD9]">
                <option value="" disabled>Pilih paket tujuan ({{ props.grade }})</option>
                <option v-for="pkg in currentGradePackages" :key="pkg.id" :value="pkg.id">{{ pkg.subject }} - {{ pkg.classroom }} ({{ pkg.questions.length }} soal)</option>
              </select>
              <p v-if="importTarget === 'tambah'" class="mt-1.5 text-[11px] text-[#667085]">Kelas dan mata pelajaran pada file harus sama dengan paket tujuan. Maksimum total 100 soal per paket.</p>
            </div>

            <div>
              <label class="block font-semibold text-[#344054] mb-1.5">Unggah Template Bank Soal</label>
              <input
                type="file"
                accept=".docx,.xlsx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-[#F9FAFC] outline-none focus:border-[#1B5FD9]"
                @change="readImportFile"
              >
              <p v-if="importFileName" class="mt-1.5 text-[11px] text-[#667085]">Dokumen: {{ importFileName }}</p>
            </div>

            <div v-if="importPreview" class="rounded-xl border border-[#B9D1F9] bg-[#F6F9FF] p-3 text-[#0A2A5C]">
              <p class="font-semibold">Data terdeteksi. Periksa sebelum disimpan.</p>
              <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                <div><dt class="text-[#667085]">Jenjang</dt><dd class="font-semibold">{{ importPreview.package.grade }}</dd></div>
                <div><dt class="text-[#667085]">Kelas</dt><dd class="font-semibold">{{ importPreview.classroom }}</dd></div>
                <div><dt class="text-[#667085]">Mata pelajaran</dt><dd class="font-semibold">{{ importPreview.subject }}</dd></div>
                <div><dt class="text-[#667085]">Butir soal</dt><dd class="font-semibold">{{ importPreview.questionCount }} butir</dd></div>
              </dl>
              <div v-if="importPreview.issues.length" class="mt-3 border-t border-[#D6E4FA] pt-2.5">
                <p class="font-semibold text-[#7A4A03]">{{ importPreview.questionCount }} soal siap disimpan - {{ importPreview.issues.length }} soal gagal dan tidak ikut disimpan:</p>
                <ul class="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-[#7A4A03]">
                  <li v-for="(issue, issueIdx) in importPreview.issues" :key="issueIdx">{{ issue.message }}</li>
                </ul>
              </div>
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
              :disabled="!importPreview || importPreview.questionCount === 0 || isImporting || (importTarget === 'tambah' && !importTargetPkgId)"
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
