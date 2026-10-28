<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { isArabicText, renderKaTeXHtml } from '~/utils/cbtFormula'
import AdminV2Icon from '../AdminV2Icon.vue'
import CbtV2ExamTokens from './CbtV2ExamTokens.vue'
import type { ExamItem, GradeType, CbtTabId } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource } from '~/composables/useAdminCbtData'

interface Props {
  grade: GradeType
  exams: ExamItem[]
  source?: AssessmentSource
}

const props = defineProps<Props>()
const cbtData = useAdminCbtData(props.source ?? 'cbt')

const emit = defineEmits<{
  (e: 'switch-tab', tab: CbtTabId): void
  (e: 'open-drawer', type: string, payload?: any): void
  (e: 'toast', msg: string): void
  (e: 'copy-token', token: string): void
}>()

const examView = ref<'list' | 'classes' | 'detail'>('list')
const tokenExam = ref<ExamItem | null>(null)
const selectedClass = ref('')
const isCreateModalOpen = ref(false)
const scheduleDialog = ref<HTMLElement | null>(null)
watch(isCreateModalOpen, async open => {
  if (open) { await nextTick(); scheduleDialog.value?.focus() }
})
const isSaving = ref(false)
const wizardStep = ref(1)
const soalMode = ref<'acak' | 'manual'>('acak')
const acakCount = ref(40)
const acakRolled = ref(false)
const statusFilter = ref<'semua' | 'siap' | 'berlangsung' | 'selesai'>('semua')
const searchQuery = ref('')
const selectedQuestionIds = ref<string[]>([])
const selectionError = ref('')
const loadingSelection = ref(false)
const requestedQuestionIds = ref<string[] | null>(null)
let selectionRequest = 0

const localDateTime = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const emptyExam = () => ({
  id: '',
  name: '',
  classId: '',
  subjectId: '',
  questionBankId: '',
  startsAt: localDateTime(new Date(Date.now() + 86_400_000)),
  duration: 90,
  token: '',
  supervisorId: ''
})

const newExam = ref(emptyExam())
const currentExams = computed(() => props.exams.filter(exam => exam.grade === props.grade))
const statusKey = (e: ExamItem) => e.status === 'Berlangsung' ? 'berlangsung' : e.status === 'Selesai' ? 'selesai' : 'siap'
const statusLabel = (e: ExamItem) => e.status === 'Berlangsung' ? 'Sedang Berlangsung' : e.status === 'Selesai' ? 'Selesai' : 'Siap Tayang'
const soalLabel = (e: ExamItem) => e.questionIds ? e.questionIds.length + ' soal terpasang' : 'Seluruh bank soal'
const filteredExams = computed(() => currentExams.value.filter(e => {
  if (statusFilter.value !== 'semua' && statusKey(e) !== statusFilter.value) return false
  const q = searchQuery.value.trim().toLowerCase()
  if (q && !(e.name + ' ' + e.subject + ' ' + e.classroom).toLowerCase().includes(q)) return false
  return true
}))
const gradeClasses = computed(() => cbtData.classes.value.filter(item => item.grade === props.grade))
const totalSiswaAktif = computed(() => gradeClasses.value.reduce((sum, c) => sum + (c.studentCount ?? 0), 0))
const gradePackages = computed(() => cbtData.bankPackages.value.filter(item => item.grade === props.grade))

const groups = computed(() => gradeClasses.value.map(classItem => {
  const scheduled = currentExams.value.filter(exam => exam.classId === classItem.id)
  return {
  id: classItem.id,
  classroom: classItem.name,
  students: classItem.studentCount,
  subjects: new Set(scheduled.map(exam => exam.subjectId)).size,
  exams: scheduled.length,
  violations: scheduled.reduce((sum, exam) => sum + exam.violations, 0),
  status: scheduled.some(exam => exam.status === 'Berlangsung') ? 'Berlangsung'
    : scheduled.some(exam => exam.status === 'Terjadwal') ? 'Terjadwal'
    : scheduled.length ? 'Selesai' : '-'
  }
}))

const classExams = computed(() => {
  if (!selectedClass.value) return currentExams.value
  return currentExams.value.filter(exam => exam.classroom === selectedClass.value)
})

const availablePackages = computed(() =>
  gradePackages.value.filter(pkg => !newExam.value.classId || pkg.classId === newExam.value.classId)
)

const availableSubjects = computed(() => {
  const ids = new Set(availablePackages.value.map(pkg => pkg.subjectId))
  return cbtData.subjects.value.filter(item => item.grade === props.grade && ids.has(item.id))
})

const selectedBank = computed(() => availablePackages.value.find(pkg => pkg.id === newExam.value.questionBankId))
const bankQuestions = computed(() => selectedBank.value?.questions ?? [])
const orderedQuestions = computed(() => selectedQuestionIds.value.map(id => bankQuestions.value.find(q => q.id === id)).filter(q => !!q))

const loadSelection = async (ids?: string[] | null) => {
  requestedQuestionIds.value = ids == null ? null : [...ids]
  const request = ++selectionRequest
  loadingSelection.value = true
  selectionError.value = ''
  selectedQuestionIds.value = []
  try {
    await cbtData.loadQuestions(true)
    if (request !== selectionRequest) return
    selectedQuestionIds.value = ids == null ? bankQuestions.value.map(q => q.id) : [...ids]
  } catch (error) {
    if (request === selectionRequest) selectionError.value = error instanceof Error ? error.message : 'Soal gagal dimuat.'
  } finally {
    if (request === selectionRequest) loadingSelection.value = false
  }
}

const toggleQuestion = (id: string) => {
  selectedQuestionIds.value = selectedQuestionIds.value.includes(id)
    ? selectedQuestionIds.value.filter(item => item !== id)
    : [...selectedQuestionIds.value, id]
}

const moveQuestion = (index: number, offset: number) => {
  const next = [...selectedQuestionIds.value]
  const target = index + offset
  if (target < 0 || target >= next.length) return
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  selectedQuestionIds.value = next
}

watch(() => newExam.value.questionBankId, () => {
  acakRolled.value = false
  if (isCreateModalOpen.value) void loadSelection()
}, { flush: 'sync' })

const rollRandom = () => {
  const ids = bankQuestions.value.map(q => q.id)
  if (!ids.length) return
  const n = Math.max(1, Math.min(Math.floor(Number(acakCount.value)) || 1, ids.length))
  acakCount.value = n
  const shuffled = [...ids]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  const order = new Map(bankQuestions.value.map(q => [q.id, q.number]))
  const picked = shuffled.slice(0, n).sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
  selectedQuestionIds.value = picked
  acakRolled.value = true
}

const goStep2 = () => {
  if (!newExam.value.name.trim()) { emit('toast', 'Nama ujian wajib diisi.'); return }
  if (!newExam.value.classId || !newExam.value.subjectId) { emit('toast', 'Pilih rombel dan mata pelajaran dulu.'); return }
  if (!newExam.value.questionBankId) { emit('toast', 'Belum ada bank soal untuk mapel ini di rombel ini. Buat dulu di tab Bank Soal.'); return }
  wizardStep.value = 2
  if (soalMode.value === 'acak' && !acakRolled.value && bankQuestions.value.length) rollRandom()
}

const ringkasanJadwal = computed(() => newExam.value.startsAt
  ? new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(newExam.value.startsAt))
  : '-')
const ringkasanKelas = computed(() => gradeClasses.value.find(c => c.id === newExam.value.classId)?.name ?? '-')
const ringkasanMapel = computed(() => cbtData.subjects.value.find(s => s.id === newExam.value.subjectId)?.name ?? '-')

const openDetail = (classroom: string) => {
  selectedClass.value = classroom
  examView.value = 'detail'
}

const syncPackage = () => {
  const matching = availablePackages.value.find(pkg => pkg.subjectId === newExam.value.subjectId)
  newExam.value.questionBankId = matching?.id ?? ''
}

const openCreateSchedule = (classroom?: string) => {
  const classItem = gradeClasses.value.find(item => item.name === classroom)
    ?? gradeClasses.value.find(item => item.name === selectedClass.value)
    ?? gradeClasses.value[0]
  newExam.value = emptyExam()
  newExam.value.classId = classItem?.id ?? ''
  const firstPackage = gradePackages.value.find(pkg => pkg.classId === newExam.value.classId)
  newExam.value.subjectId = firstPackage?.subjectId ?? ''
  newExam.value.questionBankId = firstPackage?.id ?? ''
  wizardStep.value = 1
  soalMode.value = 'acak'
  acakRolled.value = false
  acakCount.value = 40
  isCreateModalOpen.value = true
  void loadSelection()
}

const openEditSchedule = (exam: ExamItem) => {
  isCreateModalOpen.value = false
  newExam.value = {
    id: exam.id,
    name: exam.name,
    classId: exam.classId ?? '',
    subjectId: exam.subjectId ?? '',
    questionBankId: exam.questionBankId ?? '',
    startsAt: exam.startsAt ? localDateTime(new Date(exam.startsAt)) : localDateTime(new Date()),
    duration: exam.duration,
    token: exam.token,
    supervisorId: exam.supervisorId ?? ''
  }
  wizardStep.value = 1
  soalMode.value = 'manual'
  acakRolled.value = true
  isCreateModalOpen.value = true
  void loadSelection(exam.questionIds)
}

const saveSchedule = async () => {
  if (isSaving.value || loadingSelection.value || selectionError.value) return
  if (!newExam.value.name.trim()) {
    emit('toast', 'Nama ujian wajib diisi.')
    return
  }
  if (!newExam.value.classId || !newExam.value.subjectId || !newExam.value.questionBankId) {
    emit('toast', 'Pilih kelas, mata pelajaran, dan bank soal yang sesuai.')
    return
  }
  if (!selectedQuestionIds.value.length) {
    emit('toast', 'Pilih minimal satu soal untuk ujian.')
    return
  }
  isSaving.value = true
  try {
    await cbtData.saveExam({
      ...newExam.value,
      name: newExam.value.name.trim(),
      questionIds: selectedQuestionIds.value,
      token: newExam.value.token || undefined
    })
    isCreateModalOpen.value = false
    emit('toast', 'Ujian berhasil ditayangkan. Token peserta diterbitkan untuk siswa yang eligible.')
  } catch (saveError) {
    emit('toast', saveError instanceof Error ? saveError.message : 'Jadwal ujian gagal disimpan.')
  } finally { isSaving.value = false }
}

const removeSchedule = async (exam: ExamItem) => {
  if (!confirm(`Hapus ujian ${exam.name}?`)) return
  try {
    await cbtData.deleteExam(exam.id)
    emit('toast', 'Ujian berhasil dihapus.')
  } catch (deleteError) {
    emit('toast', deleteError instanceof Error ? deleteError.message : 'Ujian gagal dihapus.')
  }
}

</script>

<template>
  <div class="space-y-4">
    <!-- VIEW 0: LIST PER UJIAN -->
    <div v-if="examView === 'list'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">Daftar Ujian</h2>
          <p class="text-xs text-[#667085] mt-0.5">Satu baris = satu ujian &middot; {{ totalSiswaAktif }} siswa aktif di jenjang ini.</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex rounded-full bg-[#EEF1F6] p-1 gap-1">
            <button type="button" class="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white text-[#101828] shadow-xs">Per Ujian</button>
            <button type="button" class="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#667085]" @click="examView = 'classes'">Per Rombel</button>
          </div>
          <button type="button" class="px-4 py-2.5 rounded-full bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-extrabold transition shadow-sm inline-flex items-center gap-1.5" @click="openCreateSchedule()">
            <AdminV2Icon name="plus" :size="14" />
            <span>Buat Ujian</span>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 text-xs font-bold text-[#667085] flex-wrap">
        <button type="button" class="inline-flex items-center gap-1.5 hover:text-[#1B5FD9]" @click="emit('switch-tab', 'bank')"><span class="w-5 h-5 rounded-full bg-[#1B5FD9] text-white inline-flex items-center justify-center text-[10px] font-extrabold">1</span> Siapkan Soal</button>
        <span aria-hidden="true">&rarr;</span>
        <span class="inline-flex items-center gap-1.5 text-[#101828]"><span class="w-5 h-5 rounded-full bg-[#1B5FD9] text-white inline-flex items-center justify-center text-[10px] font-extrabold">2</span> Buat Ujian</span>
        <span aria-hidden="true">&rarr;</span>
        <span class="inline-flex items-center gap-1.5 text-[#101828]"><span class="w-5 h-5 rounded-full bg-[#1B5FD9] text-white inline-flex items-center justify-center text-[10px] font-extrabold">3</span> Jadwal &amp; Tayang</span>
      </div>

      <div class="flex flex-col lg:flex-row gap-2.5">
        <div class="flex gap-1.5 flex-wrap">
          <button type="button" class="px-3.5 py-2 rounded-full text-xs font-extrabold border" :class="statusFilter === 'semua' ? 'bg-[#101828] text-white border-[#101828]' : 'bg-white text-[#667085] border-[#E7EBF2]'" @click="statusFilter = 'semua'">Semua</button>
          <button type="button" class="px-3.5 py-2 rounded-full text-xs font-extrabold border" :class="statusFilter === 'siap' ? 'bg-[#101828] text-white border-[#101828]' : 'bg-white text-[#667085] border-[#E7EBF2]'" @click="statusFilter = 'siap'">Siap Tayang</button>
          <button type="button" class="px-3.5 py-2 rounded-full text-xs font-extrabold border" :class="statusFilter === 'berlangsung' ? 'bg-[#101828] text-white border-[#101828]' : 'bg-white text-[#667085] border-[#E7EBF2]'" @click="statusFilter = 'berlangsung'">Sedang Berlangsung</button>
          <button type="button" class="px-3.5 py-2 rounded-full text-xs font-extrabold border" :class="statusFilter === 'selesai' ? 'bg-[#101828] text-white border-[#101828]' : 'bg-white text-[#667085] border-[#E7EBF2]'" @click="statusFilter = 'selesai'">Sudah Selesai</button>
        </div>
        <input v-model="searchQuery" type="text" placeholder="Cari nama ujian, mapel, atau rombel..." class="flex-1 border border-[#E7EBF2] rounded-full px-4 py-2 text-xs bg-white outline-none focus:border-[#1B5FD9]">
      </div>

      <div class="space-y-3">
        <article v-for="e in filteredExams" :key="e.id" class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-xs">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-extrabold text-[#101828]">{{ e.name }}</h3>
              <p class="text-xs text-[#667085] mt-0.5">{{ e.subject }} &middot; {{ e.classroom }} &middot; Token per siswa</p>
            </div>
            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0" :class="statusKey(e) === 'berlangsung' ? 'bg-[#E7F8F0] text-[#087C52]' : statusKey(e) === 'siap' ? 'bg-[#E8F0FE] text-[#1B5FD9]' : 'bg-[#EFF2F7] text-[#344054]'">{{ statusLabel(e) }}</span>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3.5">
            <div class="rounded-xl bg-[#F8F9FC] px-3 py-2.5"><span class="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">Jadwal</span><b class="text-xs font-bold text-[#101828]">{{ e.date }}</b><span class="block text-[10.5px] text-[#667085]">{{ e.time }}</span></div>
            <div class="rounded-xl bg-[#F8F9FC] px-3 py-2.5"><span class="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">Pengawas</span><b class="text-xs font-bold text-[#101828]">{{ e.supervisor || '-' }}</b></div>
            <div class="rounded-xl bg-[#F8F9FC] px-3 py-2.5"><span class="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">Peserta</span><b class="text-xs font-bold text-[#101828]">{{ e.participants }} siswa</b></div>
            <div class="rounded-xl bg-[#F8F9FC] px-3 py-2.5"><span class="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">Soal</span><b class="text-xs font-bold text-[#101828]">{{ soalLabel(e) }}</b></div>
          </div>
          <div class="flex items-center justify-end gap-3 pt-3 mt-3.5 border-t border-[#E7EBF2]">
            <button type="button" class="text-xs font-bold text-[#1B5FD9] hover:underline" @click="tokenExam = e">Token Peserta</button>
            <button type="button" class="text-xs font-bold text-[#667085] hover:underline" @click="openDetail(e.classroom)">Detail Rombel</button>
            <button type="button" class="text-xs font-bold text-[#1B5FD9] hover:underline" @click="openEditSchedule(e)">Ubah</button>
            <button type="button" class="text-xs font-bold text-[#B42318] hover:underline" @click="removeSchedule(e)">Hapus</button>
          </div>
        </article>
        <div v-if="!filteredExams.length" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center">
          <p class="text-xs text-[#667085] mb-3">Belum ada ujian yang cocok.</p>
          <button type="button" class="px-4 py-2.5 rounded-full bg-[#101828] text-white text-xs font-extrabold" @click="openCreateSchedule()">+ Buat Ujian</button>
        </div>
      </div>
    </div>

    <!-- VIEW 1: CLASSES GRID (vbt-v4) -->
    <div v-if="examView === 'classes'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">Daftar Ujian</h2>
          <p class="text-xs text-[#667085] mt-0.5">Jadwal disusun per rombel agar mudah diperiksa.</p>
        </div>
        <button
          type="button"
          class="px-4 py-2.5 rounded-full bg-white border border-[#E7EBF2] text-[#344054] text-xs font-extrabold transition inline-flex items-center gap-1.5"
          @click="examView = 'list'"
        >
          <span>Lihat per Ujian</span>
        </button>
        <button
          type="button"
          class="px-4 py-2.5 rounded-full bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-extrabold transition shadow-sm inline-flex items-center gap-1.5"
          @click="openCreateSchedule()"
        >
          <AdminV2Icon name="plus" :size="14" />
          <span>Buat Ujian</span>
        </button>
      </div>

      <!-- Classes Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <article
          v-for="g in groups"
          :key="g.classroom"
          role="button"
          tabindex="0"
          class="bg-white border border-[#E7EBF2] hover:border-[#1B5FD9] rounded-[18px] p-5 shadow-xs cursor-pointer transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
          @click="openDetail(g.classroom)"
          @keydown.enter.prevent="openDetail(g.classroom)"
          @keydown.space.prevent="openDetail(g.classroom)"
        >
          <div>
            <div class="flex items-center justify-between mb-3.5">
              <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
                <AdminV2Icon name="cal" :size="20" />
              </span>
              <span
                class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                :class="g.status === 'Berlangsung'
                  ? 'bg-[#E7F8F0] text-[#087C52]'
                  : g.status === 'Terjadwal'
                    ? 'bg-[#FEF4E5] text-[#AD6504]'
                    : 'bg-[#EFF2F7] text-[#344054]'"
              >
                {{ g.status }}
              </span>
            </div>

            <h3 class="text-base font-extrabold text-[#101828]">{{ g.classroom }}</h3>
            <p class="text-xs text-[#667085] mt-0.5 mb-3">
              {{ g.students }} siswa aktif · {{ g.exams ? g.subjects : '-' }} mapel ujian
            </p>

            <div class="flex items-center gap-4 text-xs mt-3">
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">
                  {{ g.exams || '-' }}
                </b>
                <span class="text-[10px] text-[#667085]">Jadwal tampil</span>
              </div>
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">
                  {{ g.exams ? g.violations : '-' }}
                </b>
                <span class="text-[10px] text-[#667085]">Peringatan</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 mt-4 border-t border-[#E7EBF2] text-xs font-bold text-[#1B5FD9]">
            <span>Lihat daftar ujian</span>
            <AdminV2Icon name="arrow-right" :size="12" />
          </div>
        </article>
      </div>
      <div v-if="!groups.length" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">
        Belum ada rombel aktif untuk jenjang ini. Layout daftar ujian tetap siap digunakan.
      </div>
    </div>

    <!-- VIEW 2: DETAIL PER KELAS (vbt-v4) -->
    <div v-else-if="examView === 'detail'" class="space-y-4">
      <button
        type="button"
        class="text-xs font-bold text-[#667085] hover:text-[#101828] inline-flex items-center gap-1.5 transition"
        @click="examView = 'classes'; selectedClass = ''"
      >
        <AdminV2Icon name="arrow-left" :size="12" />
        <span>Kembali ke daftar rombel</span>
      </button>

      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">
            Daftar Ujian · {{ selectedClass }}
          </h2>
          <p class="text-xs text-[#667085] mt-0.5">
            Jadwal, peserta, pengawas, dan status pada rombel ini.
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2.5 rounded-full bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-extrabold transition shadow-sm inline-flex items-center gap-1.5"
          @click="openCreateSchedule(selectedClass)"
        >
          <AdminV2Icon name="plus" :size="14" />
          <span>Tambah Ujian</span>
        </button>
      </div>

      <!-- Table Card -->
      <section class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[700px]">
            <thead class="bg-[#FAFBFC] border-b border-[#E7EBF2] text-[10px] uppercase font-extrabold text-[#667085] tracking-wider">
              <tr>
                <th class="py-3 px-4">Ujian</th>
                <th class="py-3 px-4">Jadwal</th>
                <th class="py-3 px-4">Pengawas</th>
                <th class="py-3 px-4 text-center">Peserta</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="e in classExams" :key="e.id" class="hover:bg-[#FAFCFF] transition">
                <td class="py-3 px-4">
                  <div class="cell-title font-extrabold text-[#101828]">{{ e.name }}</div>
                  <div class="text-[10.5px] text-[#667085] mt-0.5">
                    {{ e.subject }} · Token per siswa
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div>{{ e.date }}</div>
                  <div class="text-[10.5px] text-[#667085]">{{ e.time }}</div>
                </td>
                <td class="py-3 px-4 font-semibold text-[#344054]">
                  {{ e.supervisor || (e as any).teacher }}
                </td>
                <td class="py-3 px-4 text-center font-mono font-bold">
                  {{ e.participants }}
                </td>
                <td class="py-3 px-4">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    :class="e.status === 'Berlangsung'
                      ? 'bg-[#E7F8F0] text-[#087C52]'
                      : e.status === 'Terjadwal'
                        ? 'bg-[#FEF4E5] text-[#AD6504]'
                        : 'bg-[#EFF2F7] text-[#344054]'"
                  >
                    {{ e.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="inline-flex items-center gap-3">
                    <button type="button" class="text-xs font-bold text-[#1B5FD9] hover:underline" @click="tokenExam = e">
                      Token Peserta
                    </button>
                    <button type="button" class="text-xs font-bold text-[#1B5FD9] hover:underline" @click="openEditSchedule(e)">
                      Ubah
                    </button>
                    <button type="button" class="text-xs font-bold text-[#B42318] hover:underline" @click="removeSchedule(e)">
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!classExams.length">
                <td colspan="6" class="py-8 text-center text-xs text-[#667085]">
                  Belum ada ujian di rombel ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- CREATE SCHEDULE MODAL -->
    <Teleport to="body">
      <div
        v-if="isCreateModalOpen"
        ref="scheduleDialog"
        tabindex="-1"
        class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-label="Penjadwalan ujian"
        @keydown.esc="!isSaving && (isCreateModalOpen = false)"
      >
        <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-[#E7EBF2]">
          <div class="p-5 border-b border-[#E7EBF2] flex items-center justify-between">
            <div>
              <span class="text-[10px] font-extrabold uppercase text-[#1B5FD9] tracking-wider">{{ wizardStep === 1 ? 'Langkah 1 dari 2 · Buat Ujian' : 'Langkah 2 dari 2 · Jadwal & Soal' }}</span>
              <h3 class="text-base font-extrabold text-[#101828] mt-0.5">{{ newExam.id ? 'Ubah Ujian' : 'Buat Ujian' }}</h3>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-lg hover:bg-[#EFF2F7] flex items-center justify-center text-[#667085]"
              @click="isCreateModalOpen = false"
            >
              <AdminV2Icon name="x" :size="16" />
            </button>
          </div>

          <div class="p-5 space-y-3.5 text-xs">
            <div class="p-3 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] flex items-center gap-2 font-semibold">
              <AdminV2Icon name="cal" :size="16" class="shrink-0" />
              <span>{{ source === 'ujian_harian' ? 'Bank Soal LMS untuk ujian harian.' : 'Bank Soal CBT untuk PTS/PAS.' }} Token peserta dibuat otomatis per siswa yang eligible saat ujian ditayangkan.</span>
            </div>

            <div v-if="wizardStep === 1" class="space-y-3.5">
              <div>
                <label class="block font-bold text-[#344054] mb-1">Nama Ujian *</label>
                <input v-model="newExam.name" type="text" placeholder="Contoh: Penilaian Tengah Semester Informatika" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none focus:border-[#1B5FD9]">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Rombel</label>
                  <select v-model="newExam.classId" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none" @change="newExam.subjectId = ''; newExam.questionBankId = ''">
                    <option value="" disabled>Pilih rombel</option>
                    <option v-for="c in gradeClasses" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Mata Pelajaran</label>
                  <select v-model="newExam.subjectId" @change="syncPackage" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none">
                    <option value="" disabled>Pilih mata pelajaran</option>
                    <option v-for="s in availableSubjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Durasi (menit)</label>
                  <input v-model="newExam.duration" type="number" min="1" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
                </div>
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Pengawas</label>
                  <select v-model="newExam.supervisorId" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none">
                    <option value="">Belum ditentukan</option>
                    <option v-for="t in cbtData.teachers.value.filter(t => t.grade === grade || t.grade === 'Yayasan')" :key="t.id" :value="t.id">{{ t.name }}</option>
                  </select>
                </div>
              </div>
              <p class="p-3 rounded-xl bg-[#F6F8FC] text-[#43506B] font-semibold">Di langkah ini belum ada jadwal dan soal — keduanya dikerjakan di langkah berikutnya.</p>
            </div>

            <div v-else class="space-y-3.5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Tanggal dan Waktu Mulai</label>
                  <input v-model="newExam.startsAt" type="datetime-local" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
                </div>
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Token Peserta</label>
                  <input value="Dibuat otomatis per siswa saat ditayangkan" readonly class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#667085] bg-[#F6F8FC] outline-none">
                </div>
              </div>
              <div>
                <label for="exam-bank" class="block font-bold text-[#344054] mb-1">{{ source === 'ujian_harian' ? 'Bank Soal LMS (ujian harian)' : 'Bank Soal CBT (PTS/PAS)' }}</label>
                <select id="exam-bank" v-model="newExam.questionBankId" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5FD9]">
                  <option value="" disabled>Pilih bank soal</option>
                  <option v-for="pkg in availablePackages.filter(p => p.subjectId === newExam.subjectId)" :key="pkg.id" :value="pkg.id">{{ pkg.subject }} &middot; {{ pkg.code }}</option>
                </select>
              </div>
              <div class="flex rounded-xl bg-[#EEF1F6] p-1 gap-1">
                <button type="button" class="flex-1 px-3 py-2 rounded-lg text-xs font-extrabold" :class="soalMode === 'acak' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'" @click="soalMode = 'acak'">Acak oleh Sistem</button>
                <button type="button" class="flex-1 px-3 py-2 rounded-lg text-xs font-extrabold" :class="soalMode === 'manual' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'" @click="soalMode = 'manual'">Pilih Sendiri</button>
              </div>
              <div v-if="soalMode === 'acak'" class="space-y-2.5 rounded-xl border border-[#E7EBF2] p-3">
                <div class="flex items-end gap-2">
                  <div class="flex-1">
                    <label class="block font-bold text-[#344054] mb-1">Berapa soal yang dipakai</label>
                    <input v-model="acakCount" type="number" min="1" :max="bankQuestions.length || 1" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
                  </div>
                  <button type="button" class="px-4 py-2.5 rounded-xl bg-[#1B5FD9] text-white text-xs font-extrabold" @click="rollRandom">Acak Soal</button>
                </div>
                <p class="font-bold text-[#0A2A5C]" aria-live="polite">{{ selectedQuestionIds.length }} soal terpasang dari {{ bankQuestions.length }} soal di bank</p>
                <p v-if="loadingSelection" role="status">Memuat soal&hellip;</p>
                <div v-else-if="selectionError" role="alert" class="text-[#B42318]">{{ selectionError }} <button type="button" class="min-h-11 px-2 underline" @click="loadSelection(requestedQuestionIds)">Muat ulang soal</button></div>
                <div v-else class="flex flex-wrap gap-1.5">
                  <span v-for="q in orderedQuestions" :key="q.id" class="px-2 py-1 rounded-lg bg-[#E8F0FE] text-[#0A2A5C] font-bold">Soal {{ q.number }}</span>
                </div>
                <p class="text-[#667085]">Hasil acakan tersimpan untuk ujian ini dan terkunci setelah disimpan. Masih bisa diacak ulang sebelum itu.</p>
              </div>
              <fieldset v-if="soalMode === 'manual'" class="min-w-0 space-y-2 rounded-xl border border-[#E7EBF2] p-3">
              <legend class="px-1 font-bold text-[#344054]">Pemilihan soal</legend>
              <p aria-live="polite" class="font-bold text-[#0A2A5C]">{{ selectedQuestionIds.length }} dari {{ bankQuestions.length }} soal terpilih</p>
              <p v-if="loadingSelection" role="status">Memuat soal…</p>
              <div v-else-if="selectionError" role="alert" class="text-[#B42318]">
                {{ selectionError }}
                <button type="button" class="min-h-11 px-2 underline" @click="loadSelection(requestedQuestionIds)">Muat ulang soal</button>
              </div>
              <template v-else>
                <label class="flex min-h-11 items-center gap-2 font-bold">
                  <input type="checkbox" :checked="bankQuestions.length > 0 && selectedQuestionIds.length === bankQuestions.length" :indeterminate="selectedQuestionIds.length > 0 && selectedQuestionIds.length < bankQuestions.length" :disabled="!bankQuestions.length" @change="selectedQuestionIds = ($event.target as HTMLInputElement).checked ? bankQuestions.map(q => q.id) : []">
                  Pilih semua
                </label>
                <div class="max-h-56 overflow-y-auto divide-y divide-[#E7EBF2]">
                  <label v-for="q in bankQuestions" :key="q.id" class="flex min-h-11 items-start gap-2 py-3">
                    <input type="checkbox" class="mt-1 shrink-0" :aria-label="`Pilih soal ${q.number}`" :checked="selectedQuestionIds.includes(q.id)" @change="toggleQuestion(q.id)">
                    <span class="shrink-0 font-bold">{{ q.number }}.</span>
                    <span class="min-w-0 flex-1 overflow-x-auto break-words" :dir="q.isRtl || isArabicText(q.text) ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(q.text)" />
                  </label>
                </div>
                <p v-if="!bankQuestions.length" class="text-[#667085]">Belum ada soal di bank yang dipilih.</p>
                <div v-if="orderedQuestions.length" class="border-t border-[#E7EBF2] pt-3">
                  <p class="font-bold text-[#344054]">Urutan soal siswa</p>
                  <ol class="max-h-48 overflow-y-auto">
                    <li v-for="(q, index) in orderedQuestions" :key="q.id" class="flex items-center justify-between gap-2 py-1">
                      <span>{{ index + 1 }}. Soal bank nomor {{ q.number }}</span>
                      <span class="flex shrink-0 gap-1">
                        <button type="button" class="min-h-11 rounded-lg border px-2 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5FD9]" :aria-label="`Naikkan soal ${q.number}`" :disabled="index === 0" @click="moveQuestion(index, -1)">Naik</button>
                        <button type="button" class="min-h-11 rounded-lg border px-2 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5FD9]" :aria-label="`Turunkan soal ${q.number}`" :disabled="index === orderedQuestions.length - 1" @click="moveQuestion(index, 1)">Turun</button>
                      </span>
                    </li>
                  </ol>
                </div>
              </template>
            </fieldset>
              <div class="rounded-xl bg-[#101828] text-[#C9D6F2] p-4 space-y-1.5">
                <p class="font-extrabold text-white">Ringkasan Ujian</p>
                <div class="flex justify-between gap-3"><span>Nama</span><b class="text-white text-right">{{ newExam.name || '-' }}</b></div>
                <div class="flex justify-between gap-3"><span>Mapel &middot; Rombel</span><b class="text-white text-right">{{ ringkasanMapel }} &middot; {{ ringkasanKelas }}</b></div>
                <div class="flex justify-between gap-3"><span>Jadwal</span><b class="text-white text-right">{{ ringkasanJadwal }}</b></div>
                <div class="flex justify-between gap-3"><span>Soal</span><b class="text-white text-right">{{ selectedQuestionIds.length }} soal ({{ soalMode === 'acak' ? 'diacak sistem' : 'pilih sendiri' }})</b></div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-[#E7EBF2] bg-[#FAFBFC] flex items-center justify-between gap-2">
            <button v-if="wizardStep === 2" type="button" class="px-4 py-2 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-white" @click="wizardStep = 1">Kembali</button>
            <span v-else></span>
            <div class="flex items-center gap-2">
              <button type="button" class="px-4 py-2 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-white" @click="isCreateModalOpen = false">Batal</button>
              <button v-if="wizardStep === 1" type="button" class="px-5 py-2 rounded-xl bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm" @click="goStep2">Lanjut ke Jadwal &amp; Soal</button>
              <button v-else type="button" class="px-5 py-2 rounded-xl bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm" @click="saveSchedule" :disabled="isSaving || loadingSelection || !!selectionError || !selectedQuestionIds.length">{{ isSaving ? 'Menyimpan…' : (newExam.id ? 'Simpan Perubahan' : 'Simpan & Tayangkan') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <CbtV2ExamTokens
      v-if="tokenExam"
      :exam="tokenExam"
      :source="source"
      @close="tokenExam = null"
      @toast="emit('toast', $event)"
    />
  </div>
</template>
