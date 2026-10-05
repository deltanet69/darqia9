<template>
  <div class="relative flex items-center justify-center">
    <svg viewBox="0 0 220 220" class="w-full max-w-[210px] h-auto block mx-auto animate-riseIn">
      <defs>
        <filter id="donut-sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#020817" flood-opacity="0.18" />
        </filter>
      </defs>

      <g transform="rotate(-90 110 110)">
        <circle
          v-for="(s, i) in calculatedSegments"
          :key="`seg-${i}`"
          cx="110"
          cy="110"
          :r="Rr"
          fill="none"
          :stroke="s.color"
          stroke-width="28"
          :stroke-dasharray="`${s.dash} ${C}`"
          :stroke-dashoffset="s.offset"
          stroke-linecap="round"
          filter="url(#donut-sh)"
          class="transition-all duration-700 hover:opacity-90 cursor-pointer"
        >
          <title>{{ s.label }}: {{ s.value }}</title>
        </circle>
      </g>

      <!-- Center Text -->
      <text x="110" y="106" text-anchor="middle" font-size="28" font-weight="900" fill="#0f172a" class="font-mono">
        {{ centerText || total.toLocaleString('id-ID') }}
      </text>
      <text x="110" y="128" text-anchor="middle" font-size="11.5" font-weight="600" fill="#64748b" class="tracking-wider uppercase">
        {{ caption }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Segment {
  label: string
  value: number
  color: string
}

const props = withDefaults(defineProps<{
  segments: Segment[]
  centerText?: string | number
  caption?: string
}>(), {
  caption: 'Total Siswa'
})

const Rr = 78
const C = 2 * Math.PI * Rr

const total = computed(() => {
  return props.segments.reduce((acc, s) => acc + s.value, 0) || 1
})

const calculatedSegments = computed(() => {
  let off = 0
  return props.segments.map(s => {
    const frac = s.value / total.value
    const gap = frac > 0.02 ? 4 : 0
    const dash = Math.max(frac * C - gap, 1)
    const offset = -off * C + gap / 2
    off += frac
    return {
      ...s,
      dash,
      offset
    }
  })
})
</script>
