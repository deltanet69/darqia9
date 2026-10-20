<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type {
  ExamItem,
  GradeType,
  CbtTabId,
  BankPackage,
  StudentResult,
  ViolationLog
} from './cbtV2Data'
import {
  INITIAL_PACKAGES,
  INITIAL_RESULTS,
  INITIAL_VIOLATIONS,
  BANK_CLASSES
} from './cbtV2Data'

interface Props {
  grade: GradeType
  exams: ExamItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'switch-tab', tab: CbtTabId): void
  (e: 'open-drawer', type: string, payload?: any): void
  (e: 'copy-token', token: string): void
  (e: 'toast', msg: string): void
}>()

// Filter for live sessions: 'all' or 'attention'
const summaryFilter = ref<'all' | 'attention'>('all')

const currentExams = computed(() => {
  return props.exams.filter(e => ((e as any).grade === props.grade || e.g === props.grade))
})

const liveExams = computed(() => {
  return currentExams.value.filter(e => e.status === 'Berlangsung')
})

const scheduledExams = computed(() => {
  return currentExams.value.filter(e => e.status === 'Terjadwal')
})

const doneExams = computed(() => {
  return currentExams.value.filter(e => e.status === 'Selesai')
})

const gradeViolations = computed<ViolationLog[]>(() => {
  return INITIAL_VIOLATIONS.filter(v => v.grade === props.grade)
})

const gradeResults = computed<StudentResult[]>(() => {
  return INITIAL_RESULTS.filter(r => r.grade === props.grade)
})

// Metrics for summary pulse
const totalParticipants = computed(() => {
  return liveExams.value.reduce((sum, e) => sum + (e.participants || e.total || 0), 0)
})

const submittedParticipants = computed(() => {
  return liveExams.value.reduce((sum, e) => sum + (e.collected || e.done || 0), 0)
})

const doingParticipants = computed(() => {
  return liveExams.value.reduce((sum, e) => sum + (e.doing || 0), 0)
})

const unstartedParticipants = computed(() => {
  return Math.max(0, totalParticipants.value - submittedParticipants.value - doingParticipants.value)
})

const submitPct = computed(() => {
  if (!totalParticipants.value) return 0
  return Math.round((submittedParticipants.value / totalParticipants.value) * 100)
})

// Attention sessions (warnings > 0)
const attentionExams = computed(() => {
  return liveExams.value.filter(e => (e.violations || (e as any).warn || 0) > 0)
})

const displayedLiveSessions = computed(() => {
  return summaryFilter.value === 'attention' ? attentionExams.value : liveExams.value
})

// Actions waiting count
const unresolvedViolations = computed(() => {
  return gradeViolations.value.filter(v => v.status !== 'Selesai Dibuka').length
})

const uncorrectedEssays = computed(() => {
  return gradeResults.value.filter(r => r.essayStatus === 'Perlu Koreksi').length
})

const bankClassCount = computed(() => {
  return (BANK_CLASSES[props.grade] || []).length
})

const parseDateParts = (dateStr: string) => {
  const parts = dateStr.split(' ')
  return {
    day: parts[0] || '1',
    month: parts[1] || 'Okt'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- 1. SUMMARY HERO BANNER (vbt-v4) -->
    <section
      class="relative overflow-hidden rounded-[20px] p-6 sm:p-7 text-white shadow-xl"
      :class="grade === 'SMP'
        ? 'bg-gradient-to-r from-[#14532D] to-[#16A34A]'
        : 'bg-gradient-to-r from-[#0A2A5C] to-[#1B5FD9]'"
      aria-label="Gambaran ujian"
    >
      <!-- Background decorative circle -->
      <div
        class="absolute -right-24 -top-36 w-96 h-96 rounded-full border border-white/15 pointer-events-none shadow-[0_0_0_40px_rgba(255,255,255,0.03),0_0_0_80px_rgba(255,255,255,0.02)]"
      />

      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.7fr)] gap-6 sm:gap-7 items-center">
        <!-- Left: Headline & Actions -->
        <div>
          <div class="inline-flex items-center gap-2 text-[#D8E8FF] uppercase tracking-wider text-[10.5px] font-extrabold mb-2.5">
            <span class="w-2 h-2 rounded-full bg-[#76E6A8] shadow-[0_0_0_4px_rgba(118,230,168,0.25)] animate-pulse" />
            <span>Ruang Kerja CBT · {{ grade }}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight max-w-xl">
            {{ liveExams.length ? `${liveExams.length} sesi ujian dalam pantauan` : 'Pantau kesiapan ujian dari sini' }}
          </h2>
          <p class="text-xs sm:text-[13px] text-[#DCE8FB] mt-2 max-w-lg leading-relaxed">
            Snapshot data contoh dari repositori. Pilih sesi untuk melihat progres dan peserta, atau periksa tindakan yang menunggu.
          </p>
          <div class="flex items-center gap-2.5 flex-wrap mt-5">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-extrabold bg-white text-[#0A2A5C] shadow-sm hover:-translate-y-0.5 transition active:translate-y-0"
              @click="emit('switch-tab', 'monitoring')"
            >
              <AdminV2Icon name="monitor" :size="15" />
              <span>Buka Monitoring</span>
              <AdminV2Icon name="arrow-right" :size="13" />
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-extrabold bg-white/10 hover:bg-white/20 border border-white/40 text-white transition hover:-translate-y-0.5"
              @click="emit('switch-tab', 'exams')"
            >
              <AdminV2Icon name="cal" :size="15" />
              <span>Lihat Daftar Ujian</span>
            </button>
          </div>
        </div>

        <!-- Right: Pulse Card -->
        <div class="bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
          <div class="flex items-center justify-between text-xs text-[#DCE8FB] font-semibold">
            <span>Peserta selesai submit</span>
            <b class="text-white text-sm font-extrabold font-mono">{{ submitPct }}%</b>
          </div>
          <div class="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight my-2.5">
            {{ submittedParticipants }}
            <span class="text-sm sm:text-base text-[#CDE0F9] font-sans font-medium">/ {{ totalParticipants }}</span>
          </div>
          <p class="text-[10px] text-[#DCE8FB]">
            Gabungan sesi berstatus berlangsung pada data contoh
          </p>
          <!-- Progress bar -->
          <div class="w-full h-2 rounded-full bg-white/20 overflow-hidden my-3">
            <div
              class="h-full bg-[#86EFAC] rounded-full transition-all duration-300"
              :style="{ width: `${submitPct}%` }"
            />
          </div>
          <div class="flex items-center justify-between text-[10.5px] text-[#DCE8FB]">
            <span>{{ doingParticipants }} mengerjakan</span>
            <span>{{ unstartedParticipants }} belum mulai</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. SUMMARY METRIC BUTTONS (4 cards) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Total Sesi -->
      <button
        type="button"
        class="bg-white border border-[#E7EBF2] hover:border-[#BBCAE0] rounded-[15px] p-3.5 sm:p-4 text-left flex items-center gap-3 transition hover:-translate-y-0.5 shadow-sm group"
        @click="emit('switch-tab', 'exams')"
      >
        <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
          <AdminV2Icon name="cal" :size="18" />
        </span>
        <div class="min-w-0 flex-1">
          <b class="block text-xl font-extrabold text-[#101828] font-mono leading-none">
            {{ currentExams.length }}
          </b>
          <span class="block text-[10.5px] font-bold text-[#667085] mt-1 truncate">
            Total sesi ujian
          </span>
        </div>
        <AdminV2Icon name="arrow-right" :size="14" class="text-[#98A2B3] group-hover:text-[#1B5FD9] transition shrink-0" />
      </button>

      <!-- Berlangsung -->
      <button
        type="button"
        class="bg-white border border-[#E7EBF2] hover:border-[#BBCAE0] rounded-[15px] p-3.5 sm:p-4 text-left flex items-center gap-3 transition hover:-translate-y-0.5 shadow-sm group"
        @click="emit('switch-tab', 'monitoring')"
      >
        <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
          <AdminV2Icon name="monitor" :size="18" />
        </span>
        <div class="min-w-0 flex-1">
          <b class="block text-xl font-extrabold text-[#101828] font-mono leading-none">
            {{ liveExams.length }}
          </b>
          <span class="block text-[10.5px] font-bold text-[#667085] mt-1 truncate">
            Berlangsung
          </span>
        </div>
        <AdminV2Icon name="arrow-right" :size="14" class="text-[#98A2B3] group-hover:text-[#1B5FD9] transition shrink-0" />
      </button>

      <!-- Terjadwal -->
      <button
        type="button"
        class="bg-white border border-[#E7EBF2] hover:border-[#BBCAE0] rounded-[15px] p-3.5 sm:p-4 text-left flex items-center gap-3 transition hover:-translate-y-0.5 shadow-sm group"
        @click="emit('switch-tab', 'exams')"
      >
        <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
          <AdminV2Icon name="clock" :size="18" />
        </span>
        <div class="min-w-0 flex-1">
          <b class="block text-xl font-extrabold text-[#101828] font-mono leading-none">
            {{ scheduledExams.length }}
          </b>
          <span class="block text-[10.5px] font-bold text-[#667085] mt-1 truncate">
            Terjadwal
          </span>
        </div>
        <AdminV2Icon name="arrow-right" :size="14" class="text-[#98A2B3] group-hover:text-[#1B5FD9] transition shrink-0" />
      </button>

      <!-- Alert: Log Perlu Ditinjau -->
      <button
        type="button"
        class="bg-white border border-[#E7EBF2] hover:border-[#F8D3CE] rounded-[15px] p-3.5 sm:p-4 text-left flex items-center gap-3 transition hover:-translate-y-0.5 shadow-sm group"
        @click="emit('switch-tab', 'management')"
      >
        <span class="w-10 h-10 rounded-xl bg-[#FDECEA] text-[#C43232] flex items-center justify-center shrink-0">
          <AdminV2Icon name="alert" :size="18" />
        </span>
        <div class="min-w-0 flex-1">
          <b class="block text-xl font-extrabold text-[#C43232] font-mono leading-none">
            {{ unresolvedViolations }}
          </b>
          <span class="block text-[10.5px] font-bold text-[#667085] mt-1 truncate">
            Log perlu ditinjau
          </span>
        </div>
        <AdminV2Icon name="arrow-right" :size="14" class="text-[#98A2B3] group-hover:text-[#C43232] transition shrink-0" />
      </button>
    </div>

    <!-- 3. SUMMARY WORKSPACE (2 Columns: 1.65fr Main, 0.9fr Side) -->
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)] gap-4 items-start">
      <!-- MAIN COLUMN -->
      <div class="space-y-4 min-w-0">
        <!-- CARD: Sesi Dalam Pantauan -->
        <section class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3 mb-3.5">
            <div>
              <h3 class="text-base font-extrabold text-[#101828]">Sesi dalam pantauan</h3>
              <p class="text-xs text-[#667085] mt-0.5">Buka sesi langsung ke monitoring peserta.</p>
            </div>
            <span class="text-[10.5px] font-extrabold px-2.5 py-1 rounded-full bg-[#E7F8F0] text-[#087C52] shrink-0">
              {{ liveExams.length }} berlangsung
            </span>
          </div>

          <!-- Filter Pills -->
          <div class="flex items-center gap-1 p-1 bg-[#EFF2F7] rounded-xl w-max max-w-full mb-3.5 text-xs font-bold">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg transition"
              :class="summaryFilter === 'all'
                ? 'bg-white text-[#0A2A5C] shadow-sm'
                : 'text-[#667085] hover:text-[#101828]'"
              @click="summaryFilter = 'all'"
            >
              Semua sesi · {{ liveExams.length }}
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg transition"
              :class="summaryFilter === 'attention'
                ? 'bg-white text-[#0A2A5C] shadow-sm'
                : 'text-[#667085] hover:text-[#101828]'"
              @click="summaryFilter = 'attention'"
            >
              Perlu perhatian · {{ attentionExams.length }}
            </button>
          </div>

          <!-- Session List -->
          <div v-if="displayedLiveSessions.length" class="space-y-3">
            <article
              v-for="e in displayedLiveSessions"
              :key="e.id"
              class="border border-[#E7EBF2] rounded-xl p-4 bg-white hover:border-[#BFCEE4] transition"
            >
              <div class="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 class="text-[13px] font-extrabold text-[#101828] leading-tight">
                    {{ e.name }}
                  </h4>
                  <p class="text-[11px] text-[#667085] mt-1">
                    {{ e.classroom || (e as any).cls }} · {{ e.subject }} · {{ e.time }}
                  </p>
                </div>
                <span
                  class="text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
                  :class="(e.violations || (e as any).warn)
                    ? 'bg-[#FDECEA] text-[#C43232]'
                    : 'bg-[#E7F8F0] text-[#087C52]'"
                >
                  {{ (e.violations || (e as any).warn) ? `${e.violations || (e as any).warn} peringatan` : 'Aman' }}
                </span>
              </div>

              <!-- Stats & Progress -->
              <div class="flex items-baseline gap-4 my-3 text-xs">
                <div>
                  <b class="text-sm font-extrabold text-[#101828]">
                    {{ e.collected || (e as any).done || 0 }}/{{ e.participants || e.total }}
                  </b>
                  <span class="text-[10px] text-[#667085] ml-1">selesai</span>
                </div>
                <div>
                  <b class="text-sm font-extrabold text-[#101828]">{{ e.doing }}</b>
                  <span class="text-[10px] text-[#667085] ml-1">mengerjakan</span>
                </div>
                <div>
                  <b
                    class="text-sm font-extrabold"
                    :class="(e.violations || (e as any).warn) ? 'text-[#C43232]' : 'text-[#101828]'"
                  >
                    {{ e.violations || (e as any).warn || 0 }}
                  </b>
                  <span class="text-[10px] text-[#667085] ml-1">peringatan</span>
                </div>
              </div>

              <div class="w-full h-1.5 rounded-full bg-[#EFF2F7] overflow-hidden">
                <div
                  class="h-full bg-[#1B5FD9] rounded-full"
                  :style="{
                    width: `${Math.round(((e.collected || (e as any).done || 0) / (e.participants || e.total)) * 100)}%`
                  }"
                />
              </div>

              <!-- Foot -->
              <div class="flex items-center justify-between gap-3 mt-3 pt-2 text-xs">
                <span class="text-[11px] text-[#667085]">
                  Pengawas: {{ e.supervisor || (e as any).teacher }}
                </span>
                <button
                  type="button"
                  class="text-xs font-bold text-[#1B5FD9] hover:underline inline-flex items-center gap-1"
                  @click="emit('switch-tab', 'monitoring')"
                >
                  <span>Pantau sesi</span>
                  <AdminV2Icon name="arrow-right" :size="13" />
                </button>
              </div>
            </article>
          </div>
          <div v-else class="text-center py-8 text-xs text-[#667085]">
            Tidak ada sesi yang perlu perhatian pada filter ini.
          </div>
        </section>

        <!-- CARD: Jadwal Terdaftar Berikutnya -->
        <section class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3 mb-3.5">
            <div>
              <h3 class="text-base font-extrabold text-[#101828]">Jadwal terdaftar berikutnya</h3>
              <p class="text-xs text-[#667085] mt-0.5">Status jadwal dari snapshot data contoh, bukan kalender hari ini.</p>
            </div>
            <button
              type="button"
              class="text-xs font-bold text-[#1B5FD9] hover:underline inline-flex items-center gap-1 shrink-0"
              @click="emit('switch-tab', 'exams')"
            >
              <span>Semua jadwal</span>
              <AdminV2Icon name="arrow-right" :size="13" />
            </button>
          </div>

          <div v-if="scheduledExams.length" class="divide-y divide-[#E7EBF2]">
            <div
              v-for="e in scheduledExams"
              :key="e.id"
              class="py-3 first:pt-0 last:pb-0 flex items-center gap-3.5"
            >
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] flex flex-col items-center justify-center shrink-0">
                <b class="text-sm font-extrabold leading-none">{{ parseDateParts(e.date).day }}</b>
                <span class="text-[9px] font-extrabold uppercase mt-0.5 text-[#1B5FD9]">{{ parseDateParts(e.date).month }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <strong class="block text-xs font-bold text-[#101828] truncate">
                  {{ e.name }}
                </strong>
                <small class="block text-[11px] text-[#667085] mt-0.5">
                  {{ e.classroom || (e as any).cls }} · {{ e.subject }} · {{ e.time }}
                </small>
              </div>
              <button
                type="button"
                class="w-7 h-7 rounded-lg bg-[#EFF2F7] hover:bg-[#E8F0FE] text-[#0A2A5C] flex items-center justify-center transition shrink-0"
                @click="emit('open-drawer', 'exam', e)"
              >
                <AdminV2Icon name="arrow-right" :size="13" />
              </button>
            </div>
          </div>
          <div v-else class="text-center py-6 text-xs text-[#667085]">
            Belum ada jadwal berstatus terjadwal.
          </div>
        </section>
      </div>

      <!-- SIDE COLUMN -->
      <div class="space-y-4 min-w-0">
        <!-- CARD: Prioritas Tindakan -->
        <section class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-sm">
          <div class="mb-3.5">
            <h3 class="text-base font-extrabold text-[#101828]">Prioritas tindakan</h3>
            <p class="text-xs text-[#667085] mt-0.5">Langsung ke bagian yang perlu dicek.</p>
          </div>

          <div class="space-y-2.5">
            <!-- Task 1: Log Anti-Cheat -->
            <button
              v-if="unresolvedViolations > 0"
              type="button"
              class="w-full text-left p-3 rounded-xl border border-[#E7EBF2] hover:border-[#F8D3CE] hover:bg-[#FFF8F7] transition flex items-start gap-3 group"
              @click="emit('switch-tab', 'management')"
            >
              <span class="w-8 h-8 rounded-lg bg-[#FDECEA] text-[#C43232] flex items-center justify-center shrink-0 mt-0.5">
                <AdminV2Icon name="alert" :size="15" />
              </span>
              <div class="min-w-0 flex-1">
                <strong class="block text-xs font-bold text-[#101828] group-hover:text-[#C43232] transition">
                  Tinjau {{ unresolvedViolations }} log anti-cheat
                </strong>
                <small class="block text-[10.5px] text-[#667085] mt-0.5">
                  Periksa kejadian dan status kunci peserta
                </small>
              </div>
              <AdminV2Icon name="arrow-right" :size="13" class="text-[#98A2B3] group-hover:text-[#C43232] mt-1 shrink-0" />
            </button>

            <!-- Task 2: Koreksi Esai -->
            <button
              v-if="uncorrectedEssays > 0"
              type="button"
              class="w-full text-left p-3 rounded-xl border border-[#E7EBF2] hover:border-[#FEF4E5] hover:bg-[#FEF9F0] transition flex items-start gap-3 group"
              @click="emit('switch-tab', 'results')"
            >
              <span class="w-8 h-8 rounded-lg bg-[#FEF4E5] text-[#AD6504] flex items-center justify-center shrink-0 mt-0.5">
                <AdminV2Icon name="book" :size="15" />
              </span>
              <div class="min-w-0 flex-1">
                <strong class="block text-xs font-bold text-[#101828] group-hover:text-[#AD6504] transition">
                  {{ uncorrectedEssays }} jawaban perlu koreksi
                </strong>
                <small class="block text-[10.5px] text-[#667085] mt-0.5">
                  Buka Nilai Siswa dan periksa rombel terkait
                </small>
              </div>
              <AdminV2Icon name="arrow-right" :size="13" class="text-[#98A2B3] group-hover:text-[#AD6504] mt-1 shrink-0" />
            </button>

            <!-- Task 3: Jadwal Menunggu -->
            <button
              type="button"
              class="w-full text-left p-3 rounded-xl border border-[#E7EBF2] hover:border-[#BBCAE0] hover:bg-[#F8FAFD] transition flex items-start gap-3 group"
              @click="emit('switch-tab', 'exams')"
            >
              <span class="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0 mt-0.5">
                <AdminV2Icon name="clock" :size="15" />
              </span>
              <div class="min-w-0 flex-1">
                <strong class="block text-xs font-bold text-[#101828] group-hover:text-[#1B5FD9] transition">
                  {{ scheduledExams.length }} jadwal menunggu pelaksanaan
                </strong>
                <small class="block text-[10.5px] text-[#667085] mt-0.5">
                  Periksa waktu, mapel, dan pengawas
                </small>
              </div>
              <AdminV2Icon name="arrow-right" :size="13" class="text-[#98A2B3] group-hover:text-[#1B5FD9] mt-1 shrink-0" />
            </button>
          </div>
        </section>

        <!-- CARD: Bank Soal & Hasil -->
        <section class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-sm">
          <div class="mb-3.5">
            <h3 class="text-base font-extrabold text-[#101828]">Bank soal &amp; hasil</h3>
            <p class="text-xs text-[#667085] mt-0.5">Akses cepat ke pekerjaan berikutnya.</p>
          </div>

          <div class="space-y-3.5">
            <!-- Bank Soal Row -->
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <AdminV2Icon name="book" :size="18" />
              </span>
              <div class="min-w-0 flex-1">
                <strong class="block text-xs font-bold text-[#101828]">{{ bankClassCount }} rombel</strong>
                <small class="block text-[10.5px] text-[#667085] mt-0.5">Jelajahi paket dan format soal</small>
              </div>
              <button
                type="button"
                class="px-3 py-1.5 rounded-full text-xs font-extrabold border border-[#E7EBF2] hover:bg-[#EFF2F7] transition text-[#344054]"
                @click="emit('switch-tab', 'bank')"
              >
                Buka
              </button>
            </div>

            <div class="h-px bg-[#E7EBF2]" />

            <!-- Hasil Nilai Row -->
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <AdminV2Icon name="users" :size="18" />
              </span>
              <div class="min-w-0 flex-1">
                <strong class="block text-xs font-bold text-[#101828]">{{ doneExams.length }} sesi selesai</strong>
                <small class="block text-[10.5px] text-[#667085] mt-0.5">Lihat rekap nilai per rombel</small>
              </div>
              <button
                type="button"
                class="px-3 py-1.5 rounded-full text-xs font-extrabold border border-[#E7EBF2] hover:bg-[#EFF2F7] transition text-[#344054]"
                @click="emit('switch-tab', 'results')"
              >
                Nilai
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
