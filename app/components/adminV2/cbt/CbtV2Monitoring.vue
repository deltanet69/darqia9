<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ExamItem, GradeType, LiveStudent } from './cbtV2Data'
import { INITIAL_LIVE_STUDENTS } from './cbtV2Data'

interface Props {
  grade: GradeType
  exams: ExamItem[]
  isFrozen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFrozen: false
})

const emit = defineEmits<{
  (e: 'copy-token', token: string): void
  (e: 'toast', msg: string): void
  (e: 'open-drawer', type: string, payload?: any): void
  (e: 'switch-tab', tab: string): void
}>()

const liveExams = computed(() => {
  return props.exams.filter(e => ((e as any).grade === props.grade || e.g === props.grade) && e.status === 'Berlangsung')
})

// Selected session in rail
const selectedSessionId = ref<string>('')

// Initialize or update selected session
const activeExam = computed<ExamItem | null>(() => {
  if (!liveExams.value.length) return null
  return liveExams.value.find(e => e.id === selectedSessionId.value) || liveExams.value[0]
})

// Roster state
const searchQuery = ref('')
const filterStatus = ref<'Semua' | 'Mengerjakan' | 'Terkunci' | 'Selesai'>('Semua')
const students = ref<LiveStudent[]>([...INITIAL_LIVE_STUDENTS])

// Student Drawer State
const selectedStudent = ref<LiveStudent | null>(null)
const isStudentDrawerOpen = ref(false)

const filteredStudents = computed(() => {
  if (!activeExam.value) return []
  const q = searchQuery.value.toLowerCase().trim()
  return students.value.filter(s => {
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.nisn.includes(q)
    const matchFilter = filterStatus.value === 'Semua'
      ? true
      : filterStatus.value === 'Terkunci'
        ? s.status.startsWith('Terkunci')
        : s.status === filterStatus.value
    return matchQ && matchFilter
  })
})

const pct = computed(() => {
  if (!activeExam.value) return 0
  const total = activeExam.value.participants || activeExam.value.total || 1
  const done = activeExam.value.collected || (activeExam.value as any).done || 0
  return Math.round((done / total) * 100)
})

const remainCount = computed(() => {
  if (!activeExam.value) return 0
  const total = activeExam.value.participants || activeExam.value.total || 0
  const done = activeExam.value.collected || (activeExam.value as any).done || 0
  const doing = activeExam.value.doing || 0
  return Math.max(0, total - done - doing)
})

const openStudentDrawer = (s: LiveStudent) => {
  selectedStudent.value = s
  isStudentDrawerOpen.value = true
}

const closeStudentDrawer = () => {
  isStudentDrawerOpen.value = false
  selectedStudent.value = null
}

const unlockStudent = (s: LiveStudent) => {
  s.status = 'Mengerjakan'
  s.violations = 0
  emit('toast', `Akun ${s.name} berhasil dibuka kuncinya.`)
  closeStudentDrawer()
}

const warnStudent = (s: LiveStudent) => {
  emit('toast', `Peringatan pengawas dikirim ke layar ${s.name}.`)
  closeStudentDrawer()
}

const forceSubmit = (s: LiveStudent) => {
  s.status = 'Selesai'
  s.progress = s.total
  emit('toast', `Ujian ${s.name} berhasil dikumpulkan oleh pengawas.`)
  closeStudentDrawer()
}

const exportRosterCsv = () => {
  if (!activeExam.value) return
  const rows = filteredStudents.value.map(s => [
    s.nisn,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.progress}/${s.total}"`,
    `"${s.status}"`,
    s.violations
  ])
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
    'NISN,Nama Siswa,Progres Soal,Status,Peringatan',
    ...rows.map(r => r.join(','))
  ].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Monitoring_${activeExam.value.classroom || (activeExam.value as any).cls}_contoh.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  emit('toast', 'Snapshot peserta contoh berhasil diunduh.')
}
</script>

<template>
  <div class="space-y-4">
    <!-- EMERGENCY FREEZE ALERT BANNER (PRD §03) -->
    <div
      v-if="isFrozen"
      class="bg-[#FDECEA] border-2 border-[#F04438] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-[#B42318] shadow-md animate-pulse"
      role="alert"
    >
      <AdminV2Icon name="alert" :size="24" class="text-[#D92D20] shrink-0 mt-0.5" />
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-extrabold uppercase tracking-wide">
          SISTEM CBT DALAM STATUS DARURAT · SEMUA TIMER UJIAN DIBEKUKAN
        </h4>
        <p class="text-xs text-[#7A271A] mt-1 leading-relaxed">
          Seluruh waktu pengerjaan di komputer peserta saat ini dihentikan sementara. Peserta tidak dapat submit jawaban hingga sistem dibuka kembali oleh Administrator. Kompensasi durasi waktu pengerjaan otomatis ditambahkan saat status darurat dicabut.
        </p>
      </div>
    </div>

    <!-- Section Head -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
      <div>
        <h2 class="text-lg font-extrabold text-[#101828]">Monitoring Ujian</h2>
        <p class="text-xs text-[#667085] mt-0.5">
          Pilih sesi, pantau progres, dan tangani peserta dari satu layar.
        </p>
      </div>
      <span class="text-[11px] font-bold px-3 py-1 rounded-full bg-[#EFF2F7] text-[#344054] w-max shrink-0">
        Snapshot data contoh · bukan real-time
      </span>
    </div>

    <!-- COMMAND CENTER LAYOUT: Left Rail + Right Main -->
    <div v-if="liveExams.length" class="grid grid-cols-1 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] gap-3.5 items-start">
      <!-- LEFT RAIL: Sesi Berjalan -->
      <aside class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 shadow-sm space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#E7EBF2]">
          <h3 class="text-xs font-extrabold text-[#101828]">Sesi berjalan</h3>
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E7F8F0] text-[#087C52]">
            {{ liveExams.length }} sesi
          </span>
        </div>

        <!-- Session List in Rail -->
        <div class="space-y-2">
          <button
            v-for="x in liveExams"
            :key="x.id"
            type="button"
            class="w-full text-left p-3.5 rounded-xl border transition group"
            :class="activeExam?.id === x.id
              ? (grade === 'SMP' ? 'border-[#16A34A] bg-[#E7F6ED]' : 'border-[#1B5FD9] bg-[#E8F0FE]')
              : 'border-[#E7EBF2] bg-white hover:border-[#BBCAE0] hover:bg-[#F8FAFD]'"
            @click="selectedSessionId = x.id"
          >
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span
                class="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full"
                :class="(x.violations || (x as any).warn)
                  ? 'bg-[#FDECEA] text-[#C43232]'
                  : 'bg-[#E7F8F0] text-[#087C52]'"
              >
                {{ (x.violations || (x as any).warn) ? `${x.violations || (x as any).warn} peringatan` : 'Aman' }}
              </span>
              <AdminV2Icon name="arrow-right" :size="12" class="text-[#98A2B3] group-hover:text-[#101828] transition" />
            </div>
            <strong class="block text-xs font-extrabold text-[#101828] leading-tight">
              {{ x.name }}
            </strong>
            <small class="block text-[10.5px] text-[#667085] mt-1 truncate">
              {{ x.classroom || (x as any).cls }} · {{ x.time }} · {{ x.collected || (x as any).done || 0 }}/{{ x.participants || x.total }} selesai
            </small>
            <!-- Progress bar -->
            <div class="w-full h-1 rounded-full bg-[#EFF2F7] overflow-hidden mt-2.5">
              <div
                class="h-full rounded-full"
                :class="grade === 'SMP' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'"
                :style="{
                  width: `${Math.round(((x.collected || (x as any).done || 0) / (x.participants || x.total)) * 100)}%`
                }"
              />
            </div>
          </button>
        </div>

        <!-- Rail Alert: Log Anti-Cheat -->
        <button
          v-if="activeExam"
          type="button"
          class="w-full text-left p-3 rounded-xl border border-[#F8D3CE] bg-[#FFF8F7] text-[#C43232] flex items-start gap-2.5 hover:bg-[#FDECEA] transition"
          @click="emit('switch-tab', 'management')"
        >
          <AdminV2Icon name="alert" :size="16" class="shrink-0 mt-0.5 text-[#C43232]" />
          <div class="min-w-0 flex-1">
            <b class="block text-[11px] font-extrabold">Log anti-cheat</b>
            <small class="block text-[10px] text-[#AD5950] mt-0.5">
              {{ activeExam.violations || (activeExam as any).warn || 0 }} peringatan pada sesi terpilih · buka untuk tinjau
            </small>
          </div>
        </button>
      </aside>

      <!-- RIGHT MAIN: Focus Card + Roster -->
      <div v-if="activeExam" class="space-y-3.5 min-w-0">
        <!-- FOCUS CARD -->
        <section
          class="relative overflow-hidden rounded-[20px] p-5 sm:p-6 text-white shadow-xl"
          :class="grade === 'SMP'
            ? 'bg-gradient-to-r from-[#14532D] to-[#16A34A]'
            : 'bg-gradient-to-r from-[#0A2A5C] to-[#1B5FD9]'"
        >
          <!-- Background Circles -->
          <div
            class="absolute -right-16 -top-28 w-72 h-72 rounded-full border border-white/20 pointer-events-none shadow-[0_0_0_35px_rgba(255,255,255,0.03),0_0_0_70px_rgba(255,255,255,0.02)]"
          />

          <!-- Head -->
          <div class="relative z-10 flex items-start justify-between gap-3">
            <div>
              <small class="text-[10px] font-extrabold uppercase tracking-wider text-[#B7D5FF]">
                Sesi terpilih · {{ activeExam.classroom || (activeExam as any).cls }} · {{ activeExam.subject }}
              </small>
              <h3 class="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 leading-tight">
                {{ activeExam.name }}
              </h3>
              <p class="text-xs text-[#C5D9F6] mt-1.5">
                {{ activeExam.date }} · {{ activeExam.time }} · Pengawas: {{ activeExam.supervisor || (activeExam as any).teacher }}
              </p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/15 border border-white/25 shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-[#69DAA5] animate-ping" />
              <span>Berlangsung</span>
            </span>
          </div>

          <!-- Body: Stats + Conic Completion Ring -->
          <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 my-5">
            <!-- 4 Stats -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              <div class="border-l-0 sm:border-l first:border-l-0 border-white/25 pl-0 sm:pl-3.5">
                <b class="block text-2xl font-extrabold font-mono leading-none">
                  {{ activeExam.participants || activeExam.total }}
                </b>
                <span class="block text-[10px] text-[#C4D8F4] mt-1">Total peserta</span>
              </div>
              <div class="border-l-0 sm:border-l border-white/25 pl-0 sm:pl-3.5">
                <b class="block text-2xl font-extrabold font-mono leading-none">
                  {{ activeExam.doing }}
                </b>
                <span class="block text-[10px] text-[#C4D8F4] mt-1">Mengerjakan</span>
              </div>
              <div class="border-l-0 sm:border-l border-white/25 pl-0 sm:pl-3.5">
                <b class="block text-2xl font-extrabold font-mono leading-none">
                  {{ activeExam.collected || (activeExam as any).done || 0 }}
                </b>
                <span class="block text-[10px] text-[#C4D8F4] mt-1">Selesai submit</span>
              </div>
              <div class="border-l-0 sm:border-l border-white/25 pl-0 sm:pl-3.5">
                <b class="block text-2xl font-extrabold font-mono leading-none">
                  {{ remainCount }}
                </b>
                <span class="block text-[10px] text-[#C4D8F4] mt-1">Belum mulai</span>
              </div>
            </div>

            <!-- Conic Completion Ring -->
            <div
              class="w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0 flex items-center justify-center relative p-2"
              :style="{
                background: `conic-gradient(#80BCFF ${pct}%, rgba(255, 255, 255, 0.18) 0)`
              }"
            >
              <div class="w-full h-full rounded-full bg-[#0A2A5C] flex flex-col items-center justify-center text-center">
                <b class="text-xl sm:text-2xl font-extrabold font-mono leading-none">{{ pct }}%</b>
                <span class="text-[9px] text-[#C4D8F4] mt-0.5">selesai</span>
              </div>
            </div>
          </div>

          <!-- Foot: Token & Actions -->
          <div class="relative z-10 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 text-[#C4D8F4] text-[11px]">
              <span>Token ujian:</span>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white font-mono font-extrabold inline-flex items-center gap-1.5 transition"
                @click="emit('copy-token', activeExam.token)"
              >
                <span>{{ activeExam.token }}</span>
                <AdminV2Icon name="copy" :size="12" />
              </button>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                class="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-extrabold text-[10.5px] inline-flex items-center gap-1.5 transition"
                @click="emit('switch-tab', 'management')"
              >
                <AdminV2Icon name="alert" :size="13" />
                <span>{{ activeExam.violations || (activeExam as any).warn || 0 }} peringatan</span>
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-extrabold text-[10.5px] inline-flex items-center gap-1.5 transition"
                @click="exportRosterCsv"
              >
                <AdminV2Icon name="download" :size="13" />
                <span>Ekspor contoh</span>
              </button>
            </div>
          </div>
        </section>

        <!-- PARTICIPANT ROSTER -->
        <section class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-sm">
          <!-- Roster Top -->
          <div class="flex items-start justify-between gap-3 mb-3.5">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-extrabold text-[#101828]">Aktivitas peserta</h3>
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E8F0FE] text-[#1B5FD9]">
                  {{ filteredStudents.length }} data contoh
                </span>
              </div>
              <p class="text-xs text-[#667085] mt-0.5">
                Cari peserta, filter status, lalu buka rincian pengerjaan untuk aksi pengawas.
              </p>
            </div>
            <span
              class="text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0"
              :class="(activeExam.violations || (activeExam as any).warn)
                ? 'bg-[#FDECEA] text-[#C43232]'
                : 'bg-[#E7F8F0] text-[#087C52]'"
            >
              {{ (activeExam.violations || (activeExam as any).warn) ? `${activeExam.violations || (activeExam as any).warn} peringatan` : 'Tanpa peringatan' }}
            </span>
          </div>

          <!-- Roster Tools: Search & Filters -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="relative flex-1 min-w-[200px] max-w-sm">
              <AdminV2Icon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama atau NISN"
                class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E7EBF2] bg-[#F9FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none transition"
              >
            </div>

            <!-- Filter Pills -->
            <div class="flex items-center gap-1 p-1 bg-[#EFF2F7] rounded-xl text-xs font-bold">
              <button
                v-for="f in (['Semua', 'Mengerjakan', 'Terkunci', 'Selesai'] as const)"
                :key="f"
                type="button"
                class="px-3 py-1.5 rounded-lg transition"
                :class="filterStatus === f
                  ? 'bg-white text-[#0A2A5C] shadow-sm'
                  : 'text-[#667085] hover:text-[#101828]'"
                @click="filterStatus = f"
              >
                {{ f }}
              </button>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="hidden sm:block overflow-x-auto border border-[#E7EBF2] rounded-xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#FAFBFC] border-b border-[#E7EBF2] text-[10px] uppercase font-extrabold text-[#667085] tracking-wider">
                <tr>
                  <th class="py-3 px-4">Peserta</th>
                  <th class="py-3 px-4">Progres</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Peringatan</th>
                  <th class="py-3 px-4">Aktivitas</th>
                  <th class="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E7EBF2]">
                <tr
                  v-for="s in filteredStudents"
                  :key="s.nisn"
                  class="hover:bg-[#FAFCFF] transition"
                >
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2.5">
                      <span class="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#0A2A5C] font-extrabold text-[11px] flex items-center justify-center shrink-0">
                        {{ s.name.split(' ').map(x => x[0]).slice(0, 2).join('') }}
                      </span>
                      <div>
                        <strong class="block text-xs font-bold text-[#101828]">{{ s.name }}</strong>
                        <span class="block text-[10.5px] text-[#667085] font-mono">{{ s.nisn }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold">{{ s.progress }}/{{ s.total }}</span>
                      <div class="w-16 h-1.5 rounded-full bg-[#EFF2F7] overflow-hidden">
                        <div
                          class="h-full bg-[#1B5FD9] rounded-full"
                          :style="{ width: `${Math.round((s.progress / s.total) * 100)}%` }"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span
                      class="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                      :class="s.status.startsWith('Terkunci')
                        ? 'bg-[#FDECEA] text-[#C43232]'
                        : s.status === 'Selesai'
                          ? 'bg-[#E7F8F0] text-[#087C52]'
                          : 'bg-[#E8F0FE] text-[#1B5FD9]'"
                    >
                      {{ s.status }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <b :class="s.violations ? 'text-[#C43232]' : 'text-[#667085]'">
                      {{ s.violations }}
                    </b>
                  </td>
                  <td class="py-3 px-4 text-[#667085] text-[11px]">
                    {{ s.lastActive }}
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button
                      type="button"
                      class="text-xs font-bold text-[#1B5FD9] hover:underline inline-flex items-center gap-1"
                      @click="openStudentDrawer(s)"
                    >
                      <span>Lihat</span>
                      <AdminV2Icon name="arrow-right" :size="12" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!filteredStudents.length">
                  <td colspan="6" class="text-center py-8 text-xs text-[#667085]">
                    Tidak ada peserta sesuai pencarian atau filter.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="sm:hidden space-y-2.5">
            <div
              v-for="s in filteredStudents"
              :key="s.nisn"
              class="border border-[#E7EBF2] rounded-xl p-3 bg-white flex items-center justify-between gap-3"
            >
              <div>
                <strong class="block text-xs font-bold text-[#101828]">{{ s.name }}</strong>
                <small class="block text-[10px] text-[#667085]">{{ s.nisn }} · {{ s.progress }}/{{ s.total }} soal</small>
                <span
                  class="inline-block mt-1 text-[9.5px] font-extrabold px-2 py-0.5 rounded-full"
                  :class="s.status.startsWith('Terkunci') ? 'bg-[#FDECEA] text-[#C43232]' : s.status === 'Selesai' ? 'bg-[#E7F8F0] text-[#087C52]' : 'bg-[#E8F0FE] text-[#1B5FD9]'"
                >
                  {{ s.status }}
                </span>
              </div>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg border border-[#E7EBF2] text-xs font-bold text-[#101828]"
                @click="openStudentDrawer(s)"
              >
                Detail
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
    <div v-else class="bg-white border border-[#E7EBF2] rounded-[18px] p-8 text-center text-xs text-[#667085]">
      Belum ada sesi ujian berstatus Berlangsung pada data contoh.
    </div>

    <!-- STUDENT INSPECTION SLIDE-OVER DRAWER -->
    <Teleport to="body">
      <div
        v-if="isStudentDrawerOpen && selectedStudent"
        class="fixed inset-0 z-50 overflow-hidden"
        aria-modal="true"
        role="dialog"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" @click="closeStudentDrawer" />
        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col">
            <!-- Header -->
            <div class="p-5 border-b border-[#E7EBF2] flex items-center justify-between">
              <div>
                <span class="text-[10px] font-extrabold uppercase text-[#1B5FD9] tracking-wider">Aktivitas peserta</span>
                <h3 class="text-base font-extrabold text-[#101828] mt-0.5">{{ selectedStudent.name }}</h3>
              </div>
              <button
                type="button"
                class="w-8 h-8 rounded-lg hover:bg-[#EFF2F7] flex items-center justify-center text-[#667085]"
                @click="closeStudentDrawer"
              >
                <AdminV2Icon name="x" :size="16" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 flex-1 overflow-y-auto space-y-4">
              <!-- Callout -->
              <div
                class="p-3.5 rounded-xl border flex items-center gap-3 text-xs font-bold"
                :class="selectedStudent.violations
                  ? 'bg-[#FDECEA] border-[#F8D3CE] text-[#C43232]'
                  : 'bg-[#E8F0FE] border-[#C5D9F6] text-[#0A2A5C]'"
              >
                <AdminV2Icon :name="selectedStudent.violations ? 'alert' : 'check'" :size="16" />
                <span>{{ selectedStudent.status }} · {{ selectedStudent.violations }} peringatan</span>
              </div>

              <div class="space-y-3 divide-y divide-[#E7EBF2] text-xs">
                <div class="pt-2">
                  <span class="block text-[10.5px] text-[#667085]">NISN</span>
                  <strong class="font-mono text-sm font-bold text-[#101828]">{{ selectedStudent.nisn }}</strong>
                </div>
                <div class="pt-3">
                  <span class="block text-[10.5px] text-[#667085]">Progres Pengerjaan</span>
                  <strong class="block text-sm font-bold text-[#101828] mb-1.5">
                    {{ selectedStudent.progress }} dari {{ selectedStudent.total }} soal
                  </strong>
                  <div class="w-full h-2 rounded-full bg-[#EFF2F7] overflow-hidden">
                    <div
                      class="h-full bg-[#1B5FD9] rounded-full"
                      :style="{ width: `${Math.round((selectedStudent.progress / selectedStudent.total) * 100)}%` }"
                    />
                  </div>
                </div>
                <div class="pt-3">
                  <span class="block text-[10.5px] text-[#667085]">Aktivitas Terakhir</span>
                  <strong class="text-xs font-bold text-[#101828]">{{ selectedStudent.lastActive }}</strong>
                </div>
                <div class="pt-3">
                  <span class="block text-[10.5px] text-[#667085]">Status Pengerjaan</span>
                  <strong class="text-xs font-bold text-[#101828]">{{ selectedStudent.status }}</strong>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-[#EFF2F7] text-[#475467] text-[11px] leading-relaxed">
                Aksi pengawas pada preview ini mensimulasikan tindakan pembukaan kunci, peringatan proctoring, dan paksa submit pada akun peserta.
              </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-[#E7EBF2] flex items-center justify-end gap-2 bg-[#FAFBFC]">
              <button
                type="button"
                class="px-3.5 py-2 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-white"
                @click="closeStudentDrawer"
              >
                Tutup
              </button>
              <button
                v-if="selectedStudent.status.startsWith('Terkunci')"
                type="button"
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#087C52] text-white hover:bg-[#066542]"
                @click="unlockStudent(selectedStudent)"
              >
                Buka Kunci
              </button>
              <button
                v-else
                type="button"
                class="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E7EBF2] hover:bg-white text-[#AD6504]"
                @click="warnStudent(selectedStudent)"
              >
                Kirim Peringatan
              </button>
              <button
                type="button"
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#101828] text-white hover:bg-[#1E293B]"
                @click="forceSubmit(selectedStudent)"
              >
                Paksa Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
