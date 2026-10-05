<template>
  <div class="relative w-full" ref="containerRef">
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
          <stop offset="0%" :stop-color="s.color" stop-opacity="0.38" />
          <stop offset="100%" :stop-color="s.color" stop-opacity="0" />
        </linearGradient>
        <filter :id="`lgw-${id}`" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Horizontal Grid Lines -->
      <g>
        <template v-for="i in 5" :key="`grid-${i}`">
          <line
            :x1="PL"
            :y1="getY(maxV * (5 - i) / 4)"
            :x2="W - PR"
            :y2="getY(maxV * (5 - i) / 4)"
            stroke="#edf1f6"
            stroke-width="1"
          />
          <text
            :x="PL - 8"
            :y="getY(maxV * (5 - i) / 4) + 4"
            text-anchor="end"
            font-size="11"
            fill="#94a3b8"
            class="font-mono font-medium"
          >
            {{ formatY(maxV * (5 - i) / 4) }}
          </text>
        </template>
      </g>

      <!-- X Axis Labels -->
      <g>
        <text
          v-for="(l, i) in labels"
          :key="`lbl-${i}`"
          :x="getX(i)"
          :y="H - 10"
          text-anchor="middle"
          font-size="11.5"
          fill="#64748b"
          font-weight="600"
        >
          {{ l }}
        </text>
      </g>

      <!-- Series Area & Line & Dots -->
      <g v-for="(s, si) in series" :key="`s-${si}`">
        <!-- Filled Area -->
        <path
          :d="`${smoothPath(getSeriesPoints(s))} L${getX(labels.length - 1)},${getY(0)} L${getX(0)},${getY(0)} Z`"
          :fill="`url(#lg-line-${id}-${si})`"
          class="animate-fadeIn"
        />

        <!-- Animated Stroke Line -->
        <path
          :d="smoothPath(getSeriesPoints(s))"
          fill="none"
          :stroke="s.color"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          :filter="`url(#lgw-${id})`"
          class="animate-drawLn"
        />

        <!-- Dots -->
        <g v-for="(p, pi) in getSeriesPoints(s)" :key="`dot-${si}-${pi}`">
          <circle :cx="p[0]" :cy="p[1]" r="7.5" :fill="s.color" opacity="0.16" />
          <circle :cx="p[0]" :cy="p[1]" r="3.8" fill="#fff" :stroke="s.color" stroke-width="2.6" />
        </g>
      </g>

      <!-- Guide Line -->
      <line
        v-if="hoverIndex !== null"
        :x1="getX(hoverIndex)"
        :y1="PT"
        :x2="getX(hoverIndex)"
        :y2="PT + ih"
        stroke="#94a3b8"
        stroke-width="1"
        stroke-dasharray="4 3"
        class="transition-all duration-75"
      />

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

    <!-- Tooltip -->
    <div
      v-if="tooltip.show"
      class="fixed z-50 pointer-events-none bg-[#020817] text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-2xl border border-slate-700 transition-opacity duration-150 space-y-1"
      :style="{ left: `${tooltip.x + 14}px`, top: `${tooltip.y + 14}px` }"
    >
      <div class="text-blue-300 font-bold border-b border-white/10 pb-1">{{ tooltip.title }}</div>
      <div v-for="item in tooltip.items" :key="item.name" class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: item.color }" />
        <span class="text-slate-300">{{ item.name }}:</span>
        <b class="text-white font-mono">{{ item.val }}</b>
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

const props = withDefaults(defineProps<{
  labels: string[]
  series: Series[]
  yFormat?: (v: number) => string
}>(), {
  yFormat: (v: number) => `${Math.round(v)}%`
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

const maxV = computed(() => {
  const allValues = props.series.flatMap(s => s.values)
  const max = Math.max(...allValues, 10)
  return niceMax(max)
})

const getX = (i: number) => {
  if (props.labels.length === 1) return PL + iw * 0.5
  return PL + (iw * i) / (props.labels.length - 1)
}

const getY = (v: number) => {
  return PT + ih * (1 - v / (maxV.value || 1))
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
  x: 0,
  y: 0,
  title: '',
  items: [] as { name: string; color: string; val: string }[]
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
    x: e.clientX,
    y: e.clientY,
    title: props.labels[bi] || '',
    items: props.series.map(s => ({
      name: s.name,
      color: s.color,
      val: props.yFormat ? props.yFormat(s.values[bi]) : `${s.values[bi]}`
    }))
  }
}

const onMouseLeave = () => {
  hoverIndex.value = null
  tooltip.value.show = false
}
</script>
