<script setup lang="ts">
import { computed } from 'vue'
import AdminLineChart from '~/components/admin/AdminLineChart.vue'
import AdminDonutChart from '~/components/admin/AdminDonutChart.vue'

interface Props {
  totalClasses: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'go-daftar'): void
  (e: 'select-class', className: string): void
}>()

// 4 Canonical Summary KPI Cards
const summaryCards = computed(() => [
  {
    label: 'Total Rombel Kelas',
    value: `${props.totalClasses}`,
    unit: 'Kelas',
    sub: 'T.A 2026/2027',
    note: '6 SMK · 6 SMP',
    rate: '100% Aktif'
  },
  {
    label: 'Total Kapasitas Siswa',
    value: '422',
    unit: 'Siswa',
    sub: 'Rata² 35.2/kelas',
    note: '241 Laki-laki · 181 Perempuan',
    rate: '98.5% Kuota'
  },
  {
    label: 'Wali Kelas Terisi',
    value: '12/12',
    unit: 'Guru',
    sub: 'SK Terbit',
    note: 'Semua rombel punya wali',
    rate: '100%'
  },
  {
    label: 'Rata-rata Kehadiran',
    value: '94.2',
    unit: '%',
    sub: '30 Hari Terakhir',
    note: 'Kehadiran harian terpantau',
    rate: 'Stabil'
  }
])

// Chart Data (Comparing Attendance vs Academic Score per Class)
const chartLabels = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B', 'X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']

const chartSeries = [
  { name: 'Kehadiran (%)', color: '#10B981', values: [94, 91, 95, 89, 96, 92, 94, 90, 95, 93, 97, 94] },
  { name: 'Rata-rata Nilai', color: '#1B5FD9', values: [84.2, 82.8, 85.1, 81.5, 86.4, 83.7, 85.5, 83.2, 86.9, 84.6, 88.3, 85.8] }
]

// Donut Chart Segments (Major & Grade Distribution)
const donutSegments = [
  { label: 'RPL (SMK)', value: 140, color: '#1B5FD9' },
  { label: 'TKJ (SMK)', value: 70, color: '#6366F1' },
  { label: 'Kelas VII (SMP)', value: 70, color: '#10B981' },
  { label: 'Kelas VIII (SMP)', value: 70, color: '#F59E0B' },
  { label: 'Kelas IX (SMP)', value: 72, color: '#06B6D4' }
]

// Group Summary by Education Stage
const gradeGroupSummary = [
  {
    badge: 'SMK IT Attaqwa 9',
    title: 'Tingkat X, XI, XII (Kejuruan)',
    sub: 'Program RPL & Teknik Komputer Jaringan',
    classesCount: 6,
    totalStudents: 210,
    avgAttendance: 94.8,
    avgScore: 85.7,
    classList: ['X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']
  },
  {
    badge: 'SMP IT Bina Cendekia',
    title: 'Tingkat VII & VIII (Menengah Pertama)',
    sub: 'Kurikulum IMTAQ & IPTEK Terpadu',
    classesCount: 4,
    totalStudents: 140,
    avgAttendance: 92.3,
    avgScore: 83.4,
    classList: ['VII-A', 'VII-B', 'VIII-A', 'VIII-B']
  },
  {
    badge: 'SMP IT Bina Cendekia',
    title: 'Tingkat IX (Tingkat Akhir SMP)',
    sub: 'Persiapan Ujian Akhir & SPMB Lanjutan',
    classesCount: 2,
    totalStudents: 72,
    avgAttendance: 94.0,
    avgScore: 85.1,
    classList: ['IX-A', 'IX-B']
  }
]
</script>

<template>
  <div class="space-y-6">
    <!-- 4 Canonical Summary KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      <article
        v-for="(item, idx) in summaryCards"
        :key="item.label"
        class="group relative overflow-hidden rounded-3xl p-5 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
        :class="[
          idx === 0 ? 'bg-gradient-to-br from-[#1E40AF] via-[#1B5FD9] to-[#60A5FA]' :
          idx === 1 ? 'bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399]' :
          idx === 2 ? 'bg-gradient-to-br from-[#92400E] via-[#D97706] to-[#FBBF24]' :
          'bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#A78BFA]'
        ]"
      >
        <div class="flex items-center justify-between relative z-10">
          <div class="text-xs font-bold uppercase tracking-wider text-white/90">{{ item.label }}</div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-xs border border-white/25">
            {{ item.sub }}
          </span>
        </div>
        <div class="text-3xl sm:text-4xl font-extrabold font-mono my-2 relative z-10 flex items-baseline gap-1.5">
          <span>{{ item.value }}</span>
          <span class="text-xs font-semibold text-white/80 font-sans">{{ item.unit }}</span>
        </div>
        <div class="text-[11px] font-semibold text-white/85 relative z-10 flex items-center justify-between">
          <span>{{ item.note }}</span>
          <span class="text-[10px] font-bold underline decoration-white/40 underline-offset-2">{{ item.rate }}</span>
        </div>
      </article>
    </div>

    <!-- Charts & Visualizations Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Attendance Trend Chart (2 Cols) -->
      <div class="lg:col-span-2 bg-white border border-[#E7EBF2] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#1B5FD9]" />
              <h3 class="text-sm font-extrabold text-[#101828] tracking-tight">Tingkat Kehadiran &amp; Rata-rata Nilai per Rombel</h3>
            </div>
            <p class="text-[11.5px] text-[#667085] mt-0.5">Komparasi performa kehadiran vs capaian akademik antar kelas</p>
          </div>
          <div class="flex items-center gap-4 text-xs font-bold">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-1.5 rounded-full bg-[#10B981]" />
              <span class="text-[#475467]">Kehadiran (%)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-1.5 rounded-full bg-[#1B5FD9]" />
              <span class="text-[#475467]">Rata-rata Nilai</span>
            </div>
          </div>
        </div>

        <!-- Line Chart Component -->
        <div class="py-3">
          <AdminLineChart
            :labels="chartLabels"
            :series="chartSeries"
            :y-format="(v) => `${Math.round(v)}`"
          />
        </div>

        <div class="pt-3 border-t border-[#F1F5F9] grid grid-cols-3 gap-2 text-center text-xs">
          <div class="p-2.5 rounded-2xl bg-[#F8FAFC]">
            <span class="text-[11px] font-medium text-[#667085] block">Rombel Tertinggi</span>
            <b class="text-[#059669] font-mono text-sm font-bold">XII RPL 1 (97%)</b>
          </div>
          <div class="p-2.5 rounded-2xl bg-[#F8FAFC]">
            <span class="text-[11px] font-medium text-[#667085] block">Rata-rata Nilai Total</span>
            <b class="text-[#1B5FD9] font-mono text-sm font-bold">84.8 / 100</b>
          </div>
          <div class="p-2.5 rounded-2xl bg-[#F8FAFC]">
            <span class="text-[11px] font-medium text-[#667085] block">Rasio Gender L/P</span>
            <b class="text-[#101828] font-mono text-sm font-bold">57% : 43%</b>
          </div>
        </div>
      </div>

      <!-- Donut Composition Chart (1 Col) -->
      <div class="bg-white border border-[#E7EBF2] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
        <div class="pb-3.5 border-b border-[#F1F5F9]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
              <h3 class="text-sm font-extrabold text-[#101828] tracking-tight">Distribusi Jurusan &amp; Jenjang</h3>
            </div>
            <span class="text-xs font-mono font-bold text-[#667085]">Total: 422 Siswa</span>
          </div>
          <p class="text-[11.5px] text-[#667085] mt-0.5">Proporsi siswa per bidang keahlian</p>
        </div>

        <!-- Donut Chart -->
        <div class="py-3 flex flex-col items-center justify-center">
          <AdminDonutChart
            :segments="donutSegments"
            center-text="422"
            caption="Total Siswa"
          />
        </div>

        <!-- Legend Details -->
        <div class="space-y-1.5 pt-3 border-t border-[#F1F5F9] text-xs">
          <div
            v-for="seg in donutSegments"
            :key="seg.label"
            class="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
          >
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: seg.color }" />
              <span class="text-[#344054] font-medium">{{ seg.label }}</span>
            </div>
            <div class="flex items-center gap-2 font-mono">
              <b class="text-[#101828] font-bold">{{ seg.value }} Siswa</b>
              <span class="text-[11px] text-[#98A2B3]">({{ ((seg.value / 422) * 100).toFixed(1) }}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Class Grade Matrix (Bento Cards Preview) -->
    <div class="space-y-3.5">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-extrabold text-[#101828] tracking-tight">Distribusi per Tingkat Pendidikan</h3>
          <p class="text-xs text-[#667085] mt-0.5">Ringkasan rombel dan capaian per tingkatan jenjang</p>
        </div>
        <button
          type="button"
          class="text-xs font-bold text-[#1B5FD9] hover:text-[#154EBC] flex items-center gap-1 transition-colors cursor-pointer"
          @click="emit('go-daftar')"
        >
          <span>Lihat Semua Rombel</span>
          <span>&rarr;</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="grp in gradeGroupSummary"
          :key="grp.title"
          class="p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs hover:shadow-md hover:border-[#1B5FD9]/40 transition-all flex flex-col justify-between space-y-4"
        >
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#1B5FD9] block mb-0.5">{{ grp.badge }}</span>
              <h4 class="text-base font-extrabold text-[#101828]">{{ grp.title }}</h4>
              <p class="text-xs text-[#667085] mt-0.5 leading-relaxed">{{ grp.sub }}</p>
            </div>
            <span class="px-2.5 py-1 rounded-xl bg-[#EFF4FF] text-[#1B5FD9] font-bold text-xs flex items-center justify-center font-mono shrink-0">
              {{ grp.classesCount }} Rombel
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 bg-[#F8FAFC] border border-[#F1F5F9] p-3 rounded-2xl text-center text-xs">
            <div>
              <b class="text-[#101828] font-mono font-bold block text-sm">{{ grp.totalStudents }}</b>
              <span class="text-[10.5px] text-[#667085]">Siswa</span>
            </div>
            <div>
              <b class="text-[#059669] font-mono font-bold block text-sm">{{ grp.avgAttendance }}%</b>
              <span class="text-[10.5px] text-[#667085]">Hadir</span>
            </div>
            <div>
              <b class="text-[#1B5FD9] font-mono font-bold block text-sm">{{ grp.avgScore }}</b>
              <span class="text-[10.5px] text-[#667085]">Nilai</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5 pt-1">
            <button
              v-for="cls in grp.classList"
              :key="cls"
              type="button"
              class="px-2.5 py-1 rounded-xl text-[11.5px] font-bold bg-[#EFF2F7] text-[#344054] hover:bg-[#EFF4FF] hover:text-[#1B5FD9] cursor-pointer transition-colors"
              @click="emit('select-class', cls)"
            >
              {{ cls }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
