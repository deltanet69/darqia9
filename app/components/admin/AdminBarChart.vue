<template>
  <div class="relative w-full" ref="containerRef">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto block select-none">
      <defs>
        <linearGradient
          v-for="(d, di) in datasets"
          :key="`bg-${di}`"
          :id="`bg-bar-${id}-${di}`"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" :stop-color="d.color" stop-opacity="0.48" />
          <stop offset="55%" :stop-color="d.color" stop-opacity="0.85" />
          <stop offset="100%" :stop-color="d.color" stop-opacity="1" />
        </linearGradient>
        <filter :id="`bsh-${id}`" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.16" />
        </filter>
      </defs>

      <!-- Horizontal Grid Lines -->
      <g>
        <template v-for="i in 5" :key="`bgrid-${i}`">
          <line
            :x1="PL"
            :y1="getY(maxV * (5 - i) / 4)"
            :x2="W - PR"
            :y2="getY(maxV * (5 - i) / 4)"
            stroke="#e8eef5"
            stroke-dasharray="2 6"
            stroke-linecap="round"
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
          :key="`blbl-${i}`"
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

      <!-- Bars -->
      <g v-for="(_, i) in labels" :key="`bargrp-${i}`">
        <rect
          v-for="(d, di) in datasets"
          :key="`bar-${i}-${di}`"
          :x="getX(i) - (bw * datasets.length) / 2 + di * bw + 2"
          :y="getY(d.values[i])"
          :width="bw - 4"
          :height="Math.max(ih * (d.values[i] / (maxV || 1)), 2)"
          :rx="(bw - 4) / 2"
          :fill="`url(#bg-bar-${id}-${di})`"
          :filter="`url(#bsh-${id})`"
          class="origin-bottom animate-growBar transition-all duration-300 hover:opacity-90"
          :style="{ animationDelay: `${i * 45 + di * 25}ms` }"
        />
      </g>

      <!-- Interactive Hover Rect -->
      <rect
        :x="PL"
        :y="PT"
        :width="iw"
        :height="ih"
        fill="transparent"
        class="cursor-pointer"
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
        <span class="w-2.5 h-2.5 rounded-sm" :style="{ backgroundColor: item.color }" />
        <span class="text-slate-300">{{ item.name }}:</span>
        <b class="text-white font-mono">{{ item.val }}</b>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Dataset {
  name: string
  color: string
  values: number[]
}

const props = withDefaults(defineProps<{
  labels: string[]
  datasets: Dataset[]
  yFormat?: (v: number) => string
}>(), {
  yFormat: (v: number) => `${v} jt`
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
  const allValues = props.datasets.flatMap(d => d.values)
  const max = Math.max(...allValues, 10)
  return niceMax(max)
})

const gw = computed(() => iw / (props.labels.length || 1))
const bw = computed(() => Math.min(26, (gw.value - 18) / (props.datasets.length || 1)))

const getX = (i: number) => {
  return PL + gw.value * i + gw.value / 2
}

const getY = (v: number) => {
  return PT + ih * (1 - v / (maxV.value || 1))
}

const formatY = (v: number) => {
  return props.yFormat ? props.yFormat(v) : `${Math.round(v)}`
}

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

  let bi = Math.floor((locX - PL) / gw.value)
  bi = Math.max(0, Math.min(props.labels.length - 1, bi))

  tooltip.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    title: props.labels[bi] || '',
    items: props.datasets.map(d => ({
      name: d.name,
      color: d.color,
      val: props.yFormat ? props.yFormat(d.values[bi]) : `${d.values[bi].toLocaleString('id-ID')}`
    }))
  }
}

const onMouseLeave = () => {
  tooltip.value.show = false
}
</script>
