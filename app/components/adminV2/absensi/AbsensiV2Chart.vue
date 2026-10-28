<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import {
  ATTENDANCE_TREND_7_DAYS,
  TAP_TIME_SLOTS,
  type TrendDay
} from './absensiV2Data'

interface Props {
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

// Active Chart Mode: 'trend' (7 days line) | 'slots' (tap time distribution bar)
const chartMode = ref<'trend' | 'slots'>('trend')
const selectedIndex = ref<number>(4) // Default to today (index 4)

const days = ATTENDANCE_TREND_7_DAYS
const slots = TAP_TIME_SLOTS

// SVG Coordinate Calculations for Smooth Spline Line Chart
const svgWidth = 600
const svgHeight = 240
const paddingLeft = 45
const paddingRight = 25
const paddingTop = 32
const paddingBottom = 38

const innerWidth = svgWidth - paddingLeft - paddingRight
const innerHeight = svgHeight - paddingTop - paddingBottom

const minPct = 0
const maxPct = 100
const yTicks = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

const getX = (index: number) => {
  return paddingLeft + (index / (days.length - 1)) * innerWidth
}

const getY = (pct: number) => {
  const clamped = Math.max(minPct, Math.min(maxPct, pct))
  const ratio = (clamped - minPct) / (maxPct - minPct)
  return paddingTop + innerHeight * (1 - ratio)
}

// Points for current jenjang
const points = computed(() => {
  return days.map((d, i) => {
    const val = props.jenjang === 'smp' ? d.smpPct : d.smkPct
    return {
      x: getX(i),
      y: getY(val),
      val,
      data: d
    }
  })
})

// Smooth cubic Bezier spline generator (Linear/Stripe style)
function getSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) {
    const point = pts[0]
    return point ? `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}` : ''
  }

  const start = pts[0]
  if (!start) return ''
  let d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1]
    if (!p0 || !p1 || !p2 || !p3) continue

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

const smoothPathString = computed(() => getSmoothPath(points.value))

const smoothAreaString = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  if (!first || !last) return ''
  const bottomY = paddingTop + innerHeight
  return `${getSmoothPath(pts)} L ${last.x.toFixed(1)} ${bottomY} L ${first.x.toFixed(1)} ${bottomY} Z`
})

const activeData = computed<TrendDay>(() => {
  return days[selectedIndex.value] || days[4] || days[0]!
})

const activePoint = computed(() => {
  return points.value[selectedIndex.value] || points.value[4]
})

// Tooltip kartu HTML: menempel di bawah titik aktif (titik selalu di pita atas skala penuh)
const fmtPct = (v: number) => `${v.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
const activeTotal = computed(() => activeData.value.hadir + activeData.value.terlambat + activeData.value.izinSakit + activeData.value.alpa)
const activeDiff = computed(() => (activePoint.value?.val ?? 0) - 95)
const tooltipCardStyle = computed(() => {
  if (!activePoint.value) return {}
  const leftPct = Math.min(84, Math.max(16, (activePoint.value.x / svgWidth) * 100))
  const topPct = (activePoint.value.y / svgHeight) * 100
  return { left: `${leftPct}%`, top: `${topPct}%`, transform: 'translate(-50%, 16px)' }
})

// Total count for bar chart calculations
const totalTapCount = computed(() => {
  return slots.reduce((acc, s) => acc + s.count, 0) || 1235
})
</script>

<template>
  <div class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] mb-5">
    <!-- Header with Title & Chart Mode Toggle (Mobile-First Wrap) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-[#F2F4F7]">
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="text-[16px] font-extrabold text-[#101828]">
            Analitik Presensi Kehadiran Siswa
          </h3>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#12459B]'"
          >
            <i class="w-1.5 h-1.5 rounded-full" :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
            {{ jenjang.toUpperCase() }}
          </span>
        </div>
        <p class="text-[12.5px] text-[#667085] mt-0.5 font-medium">
          Grafik tren mingguan dan sebaran jam tap gerbang sekolah berbasis Smartcard RFID
        </p>
      </div>

      <!-- Segmented Buttons Toggle Mode (Identik dengan standar V2) -->
      <div class="inline-flex items-center gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1 rounded-xl self-start sm:self-auto shrink-0">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
          :class="chartMode === 'trend'
            ? 'bg-white text-[#101828] font-bold shadow-[0_1px_3px_rgba(16,24,40,0.1)]'
            : 'text-[#667085] font-semibold hover:text-[#101828]'"
          @click="chartMode = 'trend'"
        >
          <AdminV2Icon
            name="chart"
            :size="14"
            :class="chartMode === 'trend' ? (jenjang === 'smp' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
          />
          <span>Tren 7 Hari (Line)</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
          :class="chartMode === 'slots'
            ? 'bg-white text-[#101828] font-bold shadow-[0_1px_3px_rgba(16,24,40,0.1)]'
            : 'text-[#667085] font-semibold hover:text-[#101828]'"
          @click="chartMode = 'slots'"
        >
          <AdminV2Icon
            name="clock"
            :size="14"
            :class="chartMode === 'slots' ? (jenjang === 'smp' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
          />
          <span>Jam Tap (Bar)</span>
        </button>
      </div>
    </div>

    <!-- 1. TREND LINE CHART (7 DAYS) -->
    <div v-if="chartMode === 'trend'" class="space-y-4">
      <!-- Legend & Info Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-3 text-[#475467] font-semibold flex-wrap">
          <span class="inline-flex items-center gap-1.5">
            <i class="w-2.5 h-2.5 rounded-full" :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
            <span>Presensi {{ jenjang.toUpperCase() }}</span>
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="w-3 h-0.5 border-b-2 border-dashed border-[#12B76A]" />
            <span>Target Minimal 95%</span>
          </span>
        </div>

        <span class="text-[11.5px] text-[#667085] font-medium hidden sm:inline">
          Ketuk titik hari pada grafik untuk melihat rincian
        </span>
      </div>

      <!-- Responsive SVG Smooth Curve Chart Container -->
      <div class="relative w-full bg-[#FAFBFD] border border-[#F2F4F7] rounded-2xl p-2 sm:p-3 overflow-hidden">
        <svg
          :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
          class="w-full h-auto select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="trendGradientSmk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#1B5FD9" stop-opacity="0.18" />
              <stop offset="60%" stop-color="#1B5FD9" stop-opacity="0.05" />
              <stop offset="100%" stop-color="#1B5FD9" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="trendGradientSmp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#16A34A" stop-opacity="0.18" />
              <stop offset="60%" stop-color="#16A34A" stop-opacity="0.05" />
              <stop offset="100%" stop-color="#16A34A" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Horizontal Grid Lines (skala penuh 10-100%, kelipatan 10) -->
          <g stroke="#E7EBF2" stroke-width="1" stroke-dasharray="3 3">
            <line v-for="tk in yTicks" :key="`grid-${tk}`" :x1="paddingLeft" :y1="getY(tk)" :x2="svgWidth - paddingRight" :y2="getY(tk)" />
          </g>
          <line :x1="paddingLeft" :y1="getY(95)" :x2="svgWidth - paddingRight" :y2="getY(95)" stroke="#12B76A" stroke-width="1.2" stroke-dasharray="6 5" />
          <text :x="svgWidth - paddingRight" :y="getY(95) - 6" text-anchor="end" font-size="9.5" fill="#12B76A" font-weight="800">TARGET 95%</text>

          <!-- Y-Axis Labels -->
          <text v-for="tk in yTicks" :key="`ylbl-${tk}`" :x="paddingLeft - 8" :y="getY(tk) + 4" text-anchor="end" font-size="10.5" fill="#98A2B3" font-weight="600">{{ tk }}%</text>

          <!-- Smooth Gradient Area Fill -->
          <path
            :d="smoothAreaString"
            :fill="jenjang === 'smp' ? 'url(#trendGradientSmp)' : 'url(#trendGradientSmk)'"
          />

          <!-- Active Vertical Guide Column -->
          <g v-if="activePoint">
            <!-- Shaded Column Highlight -->
            <rect
              :x="activePoint.x - (innerWidth / (days.length - 1)) / 2"
              :y="paddingTop"
              :width="innerWidth / (days.length - 1)"
              :height="innerHeight"
              fill="#101828"
              fill-opacity="0.03"
              rx="6"
            />
            <!-- Vertical Dashed Line -->
            <line
              :x1="activePoint.x"
              :y1="paddingTop"
              :x2="activePoint.x"
              :y2="paddingTop + innerHeight"
              stroke="#94A3B8"
              stroke-width="1.5"
              stroke-dasharray="3 3"
            />
          </g>

          <!-- Main Smooth Spline Line -->
          <path
            :d="smoothPathString"
            fill="none"
            :stroke="jenjang === 'smp' ? '#16A34A' : '#1B5FD9'"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Data Points and Interactive Targets -->
          <g v-for="(p, i) in points" :key="i">
            <!-- X Axis Day Label -->
            <text
              :x="p.x"
              :y="svgHeight - 12"
              text-anchor="middle"
              font-size="11.5"
              :font-weight="selectedIndex === i ? '800' : '600'"
              :fill="selectedIndex === i ? '#101828' : '#64748B'"
            >
              {{ p.data.dayLabel }}
            </text>

            <!-- Outer Glow Circle on Active -->
            <circle
              v-if="selectedIndex === i"
              :cx="p.x"
              :cy="p.y"
              r="8"
              :fill="jenjang === 'smp' ? '#16A34A' : '#1B5FD9'"
              opacity="0.22"
            />

            <!-- Point Dot -->
            <circle
              :cx="p.x"
              :cy="p.y"
              :r="selectedIndex === i ? '4.6' : '3.2'"
              fill="#FFFFFF"
              :stroke="jenjang === 'smp' ? '#16A34A' : '#1B5FD9'"
              :stroke-width="selectedIndex === i ? '2.6' : '2'"
              class="transition-all"
            />

            <!-- Invisible Wide Touch/Click Hit Area (Mobile-First friendly 44px+ hit zone) -->
            <rect
              :x="p.x - (innerWidth / (days.length - 1)) / 2"
              :y="paddingTop"
              :width="innerWidth / (days.length - 1)"
              :height="innerHeight + paddingBottom"
              fill="transparent"
              class="cursor-pointer"
              @mouseenter="selectedIndex = i"
              @click="selectedIndex = i"
            />
          </g>

        </svg>

        <!-- Tooltip kartu rincian titik aktif -->
        <div
          v-if="activePoint"
          class="absolute z-20 pointer-events-none bg-[#0B1F3A] text-white rounded-xl shadow-2xl border border-[#2A4A8F] px-2.5 py-2 min-w-[152px]"
          :style="tooltipCardStyle"
        >
          <div class="text-[10px] font-extrabold tracking-wider uppercase text-[#9FB3D9]">{{ activeData.dateFull }}</div>
          <div class="text-[10.5px] text-[#C4D0E4] font-medium mt-0.5">dari {{ activeTotal.toLocaleString('id-ID') }} siswa terdaftar</div>
          <div class="mt-1.5 flex items-center gap-1.5 text-[11.5px]">
            <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: jenjang === 'smp' ? '#16A34A' : '#1B5FD9' }" />
            <span class="text-[#C4D0E4] font-medium flex-1">Presensi {{ jenjang.toUpperCase() }}</span>
            <b class="font-bold tabular-nums">{{ fmtPct(activePoint.val) }}</b>
          </div>
          <div class="mt-1.5 pt-1.5 border-t border-white/10 text-[10.5px] font-bold" :style="{ color: activeDiff >= 0 ? '#7EE2A8' : '#FDA29B' }">
            {{ activeDiff >= 0 ? '\u25B2' : '\u25BC' }} {{ fmtPct(Math.abs(activeDiff)) }} {{ activeDiff >= 0 ? 'di atas' : 'di bawah' }} target 95%
          </div>
        </div>
      </div>

      <!-- Active Selected Day Interactive Breakdown Card (Mobile-First 4-Cols) -->
      <div class="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFD] border border-[#E7EBF2] transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 mb-3 border-b border-[#E7EBF2]">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
            <b class="text-sm font-extrabold text-[#101828]">
              Rincian Presensi: {{ activeData.dateFull }}
            </b>
          </div>

          <span
            class="text-xs font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1.5 self-start sm:self-auto"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#12459B]'"
          >
            <span>Tingkat Kehadiran:</span>
            <b class="font-mono text-[13px]">{{ jenjang === 'smp' ? activeData.smpPct : activeData.smkPct }}%</b>
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
          <div class="bg-white p-2.5 rounded-xl border border-[#E7EBF2] shadow-2xs">
            <span class="block text-[11px] font-bold text-[#067647] uppercase tracking-wider">Hadir Tepat</span>
            <b class="text-base sm:text-lg font-mono font-extrabold text-[#101828]">{{ activeData.hadir }}</b>
            <span class="block text-[10.5px] text-[#667085] mt-0.5">&le; 06:45 WIB</span>
          </div>

          <div class="bg-white p-2.5 rounded-xl border border-[#E7EBF2] shadow-2xs">
            <span class="block text-[11px] font-bold text-[#B54708] uppercase tracking-wider">Terlambat</span>
            <b class="text-base sm:text-lg font-mono font-extrabold text-[#B54708]">{{ activeData.terlambat }}</b>
            <span class="block text-[10.5px] text-[#667085] mt-0.5">06:46 &ndash; 07:00 WIB</span>
          </div>

          <div class="bg-white p-2.5 rounded-xl border border-[#E7EBF2] shadow-2xs">
            <span class="block text-[11px] font-bold text-[#12459B] uppercase tracking-wider">Izin &amp; Sakit</span>
            <b class="text-base sm:text-lg font-mono font-extrabold text-[#12459B]">{{ activeData.izinSakit }}</b>
            <span class="block text-[10.5px] text-[#667085] mt-0.5">Surat resmi</span>
          </div>

          <div class="bg-white p-2.5 rounded-xl border border-[#E7EBF2] shadow-2xs">
            <span class="block text-[11px] font-bold text-[#B42318] uppercase tracking-wider">Alpa</span>
            <b class="text-base sm:text-lg font-mono font-extrabold text-[#B42318]">{{ activeData.alpa }}</b>
            <span class="block text-[10.5px] text-[#667085] mt-0.5">Tanpa keterangan</span>
          </div>
        </div>
      </div>

      <!-- 3 Quick High-Level Analytical Summary Pills (Adaptasi versi lama) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
        <div class="p-3 rounded-xl bg-white border border-[#E7EBF2] flex items-center gap-3">
          <span class="w-9 h-9 rounded-xl bg-[#E7F8F0] text-[#067647] flex items-center justify-center shrink-0">
            <AdminV2Icon name="chart" :size="17" />
          </span>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-[#667085] block">Rata-rata 7 Hari</span>
            <b class="text-[14px] font-mono font-extrabold text-[#101828]">96.5%</b>
            <span class="text-[10px] text-[#067647] font-semibold ml-1.5">&uarr; +0.8%</span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-white border border-[#E7EBF2] flex items-center gap-3">
          <span class="w-9 h-9 rounded-xl bg-[#E8F0FE] text-[#12459B] flex items-center justify-center shrink-0">
            <AdminV2Icon name="clock" :size="17" />
          </span>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-[#667085] block">Puncak Jam Masuk</span>
            <b class="text-[14px] font-mono font-extrabold text-[#101828]">06:25 &ndash; 06:40</b>
            <span class="text-[10px] text-[#667085] font-medium ml-1.5">(64% siswa)</span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-white border border-[#E7EBF2] flex items-center gap-3">
          <span class="w-9 h-9 rounded-xl bg-[#EFF2F7] text-[#344054] flex items-center justify-center shrink-0">
            <AdminV2Icon name="wifi" :size="17" />
          </span>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-[#667085] block">Kepatuhan Smartcard</span>
            <b class="text-[14px] font-mono font-extrabold text-[#101828]">99.2%</b>
            <span class="text-[10px] text-[#667085] font-medium ml-1.5">(2 reader online)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. TAP TIME SLOT BAR CHART -->
    <div v-else class="space-y-3.5 pt-1">
      <div class="flex items-center justify-between text-xs text-[#667085] pb-2 border-b border-[#F2F4F7]">
        <span>Sebaran waktu tap siswa dari jam operasional masuk sekolah</span>
        <b class="text-[#101828]">Total: {{ totalTapCount }} siswa tap</b>
      </div>

      <div class="space-y-2.5">
        <div
          v-for="b in slots"
          :key="b.slot"
          class="p-3.5 rounded-2xl border border-[#E7EBF2] bg-[#F8FAFD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:bg-white hover:shadow-xs"
        >
          <!-- Left Label & Badge -->
          <div class="flex items-center gap-3 min-w-[210px]">
            <span
              class="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0"
              :class="b.status === 'ok'
                ? 'bg-[#E7F8F0] text-[#067647]'
                : b.status === 'late'
                  ? 'bg-[#FEF4E5] text-[#B54708]'
                  : 'bg-[#FDECEA] text-[#B42318]'"
            >
              <AdminV2Icon name="clock" :size="17" />
            </span>
            <div>
              <div class="font-extrabold text-sm text-[#101828]">
                {{ b.slot }}
              </div>
              <div class="text-xs text-[#667085] font-medium flex items-center gap-1.5">
                <span>{{ b.label }}</span>
                <span>&bull;</span>
                <span class="font-mono font-semibold">{{ ((b.count / totalTapCount) * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <!-- Right Animated Progress Bar & Number -->
          <div class="flex items-center gap-3 w-full sm:w-1/2">
            <div class="flex-1 h-3 rounded-full bg-[#E7EBF2] overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 bg-gradient-to-r"
                :class="b.status === 'ok'
                  ? (b.slot.includes('30') ? 'from-[#12B76A] to-[#059669]' : 'from-[#1B5FD9] to-[#0A2A5C]')
                  : b.status === 'late'
                    ? 'from-[#F79009] to-[#D97706]'
                    : 'from-[#F04438] to-[#991B1B]'"
                :style="{ width: `${Math.min(100, (b.count / totalTapCount) * 100)}%` }"
              />
            </div>
            <div class="font-mono text-xs font-extrabold text-[#101828] w-24 text-right tabular-nums shrink-0">
              {{ b.count }} siswa
            </div>
          </div>
        </div>
      </div>

      <!-- Informational Policy Note -->
      <div class="p-3 rounded-xl bg-[#EFF2F7] border border-[#E7EBF2] flex items-center gap-2.5 text-xs text-[#475467]">
        <AdminV2Icon name="info" :size="16" class="text-[#1B5FD9] shrink-0" />
        <span>
          <b>Ketentuan Gerbang:</b> Batas toleransi kehadiran tepat waktu adalah pukul 06:45 WIB. Siswa yang melakukan tap lewat pukul 06:45 otomatis terhitung terlambat pada sistem dan layar TV lobi.
        </span>
      </div>
    </div>
  </div>
</template>
