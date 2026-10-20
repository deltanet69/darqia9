<script setup lang="ts">
import AdminLineChart from '~/components/admin/AdminLineChart.vue'
import AdminDonutChart from '~/components/admin/AdminDonutChart.vue'

defineProps<{
  periodLabel: string
  trendLabels: string[]
  trendSeries: Array<{ name: string; color: string; values: number[] }>
  donutSegments: Array<{ label: string; value: number; color: string }>
  totalTeachers: number
  avgPresentRate?: string
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <!-- 1. Attendance Trend Chart (2 Cols) -->
    <div class="lg:col-span-2 bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#F2F4F7]">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1B5FD9]" />
            <h3 class="text-sm font-bold text-[#101828] tracking-tight">Tren Presensi Guru &amp; Tenaga Kependidikan</h3>
          </div>
          <p class="text-xs text-[#667085] mt-0.5">Tingkat kehadiran tepat waktu vs terlambat ({{ periodLabel }})</p>
        </div>
        <div class="flex items-center gap-4 text-xs font-bold">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-1.5 rounded-full bg-[#10B981]" />
            <span class="text-[#475467]">Tepat Waktu</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-1.5 rounded-full bg-[#F59E0B]" />
            <span class="text-[#475467]">Terlambat</span>
          </div>
        </div>
      </div>

      <!-- Line Chart Component -->
      <div class="py-3">
        <AdminLineChart
          :labels="trendLabels"
          :series="trendSeries"
          :y-format="(v) => `${Math.round(v)}%`"
        />
      </div>

      <div class="pt-3 border-t border-[#F2F4F7] grid grid-cols-3 gap-2 text-center text-xs">
        <div class="p-2.5 rounded-xl bg-[#F8FAFC]">
          <span class="text-[10.5px] font-semibold text-[#667085] block">Rata-rata Hadir</span>
          <b class="text-[#101828] font-mono text-sm font-bold">{{ avgPresentRate || '96.5%' }}</b>
        </div>
        <div class="p-2.5 rounded-xl bg-[#F8FAFC]">
          <span class="text-[10.5px] font-semibold text-[#667085] block">Puncak Kedatangan</span>
          <b class="text-[#047857] font-mono text-sm font-bold">06:15 - 06:35</b>
        </div>
        <div class="p-2.5 rounded-xl bg-[#F8FAFC]">
          <span class="text-[10.5px] font-semibold text-[#667085] block">Kepatuhan Tap RFID</span>
          <b class="text-[#1D4ED8] font-mono text-sm font-bold">100%</b>
        </div>
      </div>
    </div>

    <!-- 2. Donut Composition Chart (1 Col) -->
    <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div class="pb-3 border-b border-[#F2F4F7]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
            <h3 class="text-sm font-bold text-[#101828] tracking-tight">Komposisi Presensi Guru</h3>
          </div>
          <span class="text-xs font-mono font-bold text-[#667085]">Total: {{ totalTeachers }} Tendik</span>
        </div>
        <p class="text-xs text-[#667085] mt-0.5">Proporsi status presensi pendidik hari ini</p>
      </div>

      <!-- Donut Chart -->
      <div class="py-3 flex flex-col items-center justify-center">
        <AdminDonutChart
          :segments="donutSegments"
          :center-text="totalTeachers"
          caption="Total Guru"
        />
      </div>

      <!-- Legend Details -->
      <div class="space-y-1.5 pt-3 border-t border-[#F2F4F7] text-xs">
        <div
          v-for="seg in donutSegments"
          :key="seg.label"
          class="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: seg.color }" />
            <span class="text-[#344054] font-medium">{{ seg.label }}</span>
          </div>
          <div class="flex items-center gap-2 font-mono">
            <b class="text-[#101828] font-bold">{{ seg.value }}</b>
            <span class="text-[11px] text-[#667085]">
              ({{ totalTeachers ? ((seg.value / totalTeachers) * 100).toFixed(1) : 0 }}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
