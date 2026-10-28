<template>
  <div class="relative w-full" ref="containerRef">
    <!-- Legenda interaktif (opsional): klik untuk sembunyi / tampil seri -->
    <div v-if="legend" class="flex flex-wrap items-center gap-x-4 gap-y-1.5 pb-2">
      <button
        v-for="(s, si) in series"
        :key="`lgnd-${si}`"
        type="button"
        class="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#475467] transition-opacity cursor-pointer"
        :class="hiddenSeries.has(si) ? 'opacity-35' : ''"
        @click="toggleSeries(si)"
      >
        <span class="w-3 h-[5px] rounded-full shrink-0" :style="{ backgroundColor: s.color }" />
        <span>{{ s.name }}</span>
        <span class="text-[#98A2B3] font-medium">· rata-rata {{ formatY(seriesAvg(s)) }}</span>
      </button>
      <span class="ml-auto text-[11px] text-[#98A2B3] font-medium hidden sm:inline">Klik seri untuk sembunyi / tampil</span>
    </div>

    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto block select-none">
      <defs>
        <linearGradient
          v-for="(s, si) in series"
          :key="`lg-${si}`"
          :id="`lg-line-${id}-${si}`"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" :stop-color="s.color" stop-opacity="0.16" />
          <stop offset="100%" :stop-color="s.color" stop-opacity="0.01" />
        </linearGradient>
      </defs>

      <!-- Horizontal Grid Lines -->
      <g>
        <template v-for="t in ticks" :key="`grid-${t}`">
          <line
            :x1="PL"
            :y1="getY(t)"
            :x2="W - PR"
            :y2="getY(t)"
            stroke="#E7EBF2"
            stroke-width="1"
            stroke-dasharray="3 5"
          />
          <text
            :x="PL - 8"
            :y="getY(t) + 4"
            text-anchor="end"
            font-size="10.5"
            fill="#98A2B3"
            font-weight="600"
          >
            {{ formatY(t) }}
          </text>
        </template>
      </g>

      <!-- Active Column Band + Guide Line -->
      <g v-if="hoverIndex !== null">
        <rect
          :x="getX(hoverIndex) - bandW / 2"
          :y="PT - 4"
          :width="bandW"
          :height="ih + 8"
          rx="8"
          fill="#101828"
          fill-opacity="0.03"
        />
        <line
          :x1="getX(hoverIndex)"
          :y1="PT"
          :x2="getX(hoverIndex)"
          :y2="PT + ih"
          stroke="#98A2B3"
          stroke-width="1"
          stroke-dasharray="3 4"
        />
      </g>

      <!-- Series Area & Line & Dots -->
      <g v-for="(s, si) in series" :key="`s-${si}`">
        <template v-if="!hiddenSeries.has(si)">
          <!-- Filled Area -->
          <path
            :d="`${smoothPath(getSeriesPoints(s))} L${getX(labels.length - 1)},${getY(minV)} L${getX(0)},${getY(minV)} Z`"
            :fill="`url(#lg-line-${id}-${si})`"
            class="animate-fadeIn"
          />

          <!-- Stroke Line -->
          <path
            :d="smoothPath(getSeriesPoints(s))"
            fill="none"
            :stroke="s.color"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="animate-drawLn"
          />

          <!-- Dots -->
          <g v-for="(p, pi) in getSeriesPoints(s)" :key="`dot-${si}-${pi}`">
            <circle v-if="hoverIndex === pi" :cx="p[0]" :cy="p[1]" r="8" :fill="s.color" opacity="0.2" />
            <circle
              :cx="p[0]"
              :cy="p[1]"
              :r="hoverIndex === pi ? 4.6 : 3.2"
              :fill="s.color"
              stroke="#FFFFFF"
              stroke-width="1.8"
              class="transition-all duration-150"
            />
            <circle :cx="p[0]" :cy="p[1]" :r="hoverIndex === pi ? 1.8 : 1.3" fill="#FFFFFF" />
          </g>
        </template>
      </g>

      <!-- X Axis Labels -->
      <g>
        <text
          v-for="(l, i) in labels"
          :key="`lbl-${i}`"
          :x="getX(i)"
          :y="H - 10"
          :text-anchor="i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'"
          font-size="10.5"
          :fill="hoverIndex === i ? '#101828' : '#64748B'"
          :font-weight="hoverIndex === i ? '800' : '600'"
        >
          {{ l }}
        </text>
      </g>

      <!-- Interactive Hover Rect -->
      <rect
        :x="PL"
        :y="PT"
        :width="iw"
        :height="ih"
        fill="transparent"
        class="cursor-crosshair"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      />
    </svg>

    <!-- Tooltip kartu (menempel di titik aktif, bukan mengikuti tetikus) -->
    <div
      v-if="tooltip.show"
      class="absolute z-50 pointer-events-none bg-[#0B1F3A] text-white rounded-xl shadow-2xl border border-[#2A4A8F] px-2.5 py-2 min-w-[152px] transition-all duration-150"
      :style="tooltipStyle"
    >
      <div class="text-[10px] font-extrabold tracking-wider uppercase text-[#9FB3D9]">{{ tooltip.title }}</div>
      <div v-if="tooltip.sub" class="text-[10.5px] text-[#C4D0E4] font-medium mt-0.5">{{ tooltip.sub }}</div>
      <div class="mt-1.5 space-y-1">
        <div v-for="item in tooltip.items" :key="item.name" class="flex items-center gap-1.5 text-[11.5px]">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
          <span class="text-[#C4D0E4] font-medium flex-1">{{ item.name }}</span>
          <b class="text-white font-bold tabular-nums">{{ item.val }}</b>
        </div>
      </div>
      <div
        v-if="tooltip.footer"
        class="mt-1.5 pt-1.5 border-t border-white/10 text-[10.5px] font-bold"
        :style="{ color: tooltip.footer.color || '#7EE2A8' }"
      >
        {{ tooltip.footer.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Series {
  name: string
  color: string
  values: number[]
}

interface TooltipFooter {
  text: string
  color?: string
}

const props = withDefaults(defineProps<{
  labels: string[]
  series: Series[]
  yFormat?: (v: number) => string
  /** Batas bawah sumbu Y (bawaan 0). */
  yMin?: number
  /** Batas atas sumbu Y (bawaan: otomatis dari data). */
  yMax?: number
  /** Kelipatan label sumbu Y, mis. 10 untuk 10/20/.../100 (perlu yMax). */
  yStep?: number
  /** Tampilkan legenda interaktif di atas grafik. */
  legend?: boolean
  tooltipTitle?: (index: number) => string
  tooltipSub?: (index: number) => string
  tooltipFooter?: (index: number) => TooltipFooter | null
}>(), {
  yFormat: (v: number) => `${Math.round(v)}%`,
  yMin: 0,
  legend: false
})

const id = Math.random().toString(36).substring(2, 9)
const containerRef = ref<HTMLElement | null>(null)

const W = 640
const H = 260
const PL = 44
const PR = 16
const PT = 16
const PB = 34
const iw = W - PL - PR
const ih = H - PT - PB

const niceMax = (v: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(v || 1)))
  const n = (v || 1) / p
  const factor = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10
  return factor * p
}

const minV = computed(() => props.yMin)
const maxV = computed(() => {
  if (props.yMax != null) return props.yMax
  const allValues = props.series.flatMap(s => s.values)
  const max = Math.max(...allValues, 10)
  return niceMax(max)
})

const ticks = computed(() => {
  if (props.yStep && props.yMax != null) {
    const out: number[] = []
    for (let v = props.yMin; v <= props.yMax + 1e-9; v += props.yStep) out.push(Math.round(v * 100) / 100)
    return out
  }
  const out: number[] = []
  for (let i = 0; i <= 4; i++) out.push(minV.value + ((maxV.value - minV.value) * i) / 4)
  return out
})

const bandW = computed(() => (props.labels.length > 1 ? iw / (props.labels.length - 1) : iw))

const hiddenSeries = ref<Set<number>>(new Set())
const toggleSeries = (si: number) => {
  const next = new Set(hiddenSeries.value)
  if (next.has(si)) next.delete(si)
  else next.add(si)
  hiddenSeries.value = next
}

const seriesAvg = (s: Series) => (s.values.length ? s.values.reduce((a, v) => a + v, 0) / s.values.length : 0)

const getX = (i: number) => {
  if (props.labels.length === 1) return PL + iw * 0.5
  return PL + (iw * i) / (props.labels.length - 1)
}

const getY = (v: number) => {
  const range = maxV.value - minV.value || 1
  return PT + ih * (1 - (v - minV.value) / range)
}

const formatY = (v: number) => {
  return props.yFormat ? props.yFormat(v) : `${Math.round(v)}`
}

const getSeriesPoints = (s: Series): [number, number][] => {
  return s.values.map((v, i) => [getX(i), getY(v)])
}

const smoothPath = (pts: [number, number][]) => {
  if (pts.length < 3) return 'M' + pts.map(p => p.join(',')).join(' L')
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

const hoverIndex = ref<number | null>(null)
const tooltip = ref({
  show: false,
  title: '',
  sub: '',
  items: [] as { name: string; color: string; val: string }[],
  footer: null as TooltipFooter | null
})

const tooltipStyle = computed(() => {
  const i = hoverIndex.value
  if (i === null) return {}
  const leftPct = Math.min(86, Math.max(14, (getX(i) / W) * 100))
  const firstVisible = props.series.findIndex((_, si) => !hiddenSeries.value.has(si))
  const anchorV = firstVisible >= 0 ? props.series[firstVisible]?.values[i] ?? maxV.value : maxV.value
  const topPct = (getY(anchorV) / H) * 100
  const flip = getY(anchorV) < 118
  return {
    left: `${leftPct}%`,
    top: `${topPct}%`,
    transform: flip ? 'translate(-50%, 16px)' : 'translate(-50%, calc(-100% - 12px))'
  }
})

const onMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return
  const svg = containerRef.value.querySelector('svg')
  if (!svg) return
  const r = svg.getBoundingClientRect()
  const locX = (e.clientX - r.left) * (W / r.width)

  let bi = 0
  let bd = 1e9
  props.labels.forEach((_, i) => {
    const d = Math.abs(locX - getX(i))
    if (d < bd) {
      bd = d
      bi = i
    }
  })

  hoverIndex.value = bi
  tooltip.value = {
    show: true,
    title: props.tooltipTitle ? props.tooltipTitle(bi) : props.labels[bi] || '',
    sub: props.tooltipSub ? props.tooltipSub(bi) : '',
    items: props.series
      .map((s, si) => ({ s, si }))
      .filter(({ si }) => !hiddenSeries.value.has(si))
      .map(({ s }) => ({
        name: s.name,
        color: s.color,
        val: props.yFormat ? props.yFormat(s.values[bi]) : `${s.values[bi]}`
      })),
    footer: props.tooltipFooter ? props.tooltipFooter(bi) : null
  }
}

const onMouseLeave = () => {
  hoverIndex.value = null
  tooltip.value.show = false
}
</script>
