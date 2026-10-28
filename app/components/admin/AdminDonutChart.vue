<template>
  <div class="relative flex items-center justify-center">
    <svg viewBox="0 0 220 220" class="w-full max-w-[210px] h-auto block mx-auto animate-riseIn">
      <defs>
        <filter id="donut-sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#020817" flood-opacity="0.18" />
        </filter>
      </defs>

      <g transform="rotate(-90 110 110)">
        <!-- Jalur latar -->
        <circle cx="110" cy="110" :r="Rr" fill="none" stroke="#EFF2F7" stroke-width="19" />
        <circle
          v-for="(s, i) in calculatedSegments"
          :key="`seg-${i}`"
          cx="110"
          cy="110"
          :r="Rr"
          fill="none"
          :stroke="s.color"
          :stroke-width="activeIndex === i ? 25 : 19"
          :stroke-dasharray="`${s.dash} ${C}`"
          :stroke-dashoffset="s.offset"
          stroke-linecap="butt"
          filter="url(#donut-sh)"
          class="transition-all duration-300 cursor-pointer"
          :opacity="activeIndex === null || activeIndex === i ? 1 : 0.32"
          @mouseenter="activeIndex = i"
          @mouseleave="activeIndex = null"
          @click="activeIndex = i"
        >
          <title>{{ s.label }}: {{ s.value }}</title>
        </circle>
      </g>

      <!-- Center Text: total bawaan, atau rincian segmen aktif saat diarahkan -->
      <text
        x="110"
        :y="activeSegment ? 100 : 106"
        text-anchor="middle"
        font-size="24"
        font-weight="900"
        :fill="activeSegment ? activeSegment.color : '#0f172a'"
        class="font-mono"
      >
        {{ activeSegment ? activeSegment.value.toLocaleString('id-ID') : (centerText || total.toLocaleString('id-ID')) }}
      </text>
      <text x="110" y="122" text-anchor="middle" font-size="10.5" font-weight="600" fill="#64748B" class="tracking-wider uppercase">
        {{ activeSegment ? activeSegment.label : caption }}
      </text>
      <text
        v-if="activeSegment"
        x="110"
        y="142"
        text-anchor="middle"
        font-size="12.5"
        font-weight="800"
        :fill="activeSegment.color"
      >
        {{ ((activeSegment.value / total) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}%
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

const activeIndex = ref<number | null>(null)
const activeSegment = computed(() => (activeIndex.value === null ? null : props.segments[activeIndex.value] ?? null))

const total = computed(() => {
  return props.segments.reduce((acc, s) => acc + s.value, 0) || 1
})

const calculatedSegments = computed(() => {
  let off = 0
  return props.segments.map(s => {
    const frac = s.value / total.value
    const gap = frac > 0.02 ? 3.5 : 0
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
