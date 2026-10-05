<template>
  <svg :viewBox="`0 0 ${width} ${height}`" :style="{ width: `${width}px`, height: `${height}px` }" class="opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
    <polyline
      :points="points"
      fill="none"
      :stroke="color"
      stroke-width="2.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  values: number[]
  color?: string
  width?: number
  height?: number
}>(), {
  color: 'rgba(255,255,255,0.95)',
  width: 120,
  height: 42
})

const points = computed(() => {
  if (!props.values || props.values.length === 0) return ''
  const max = Math.max(...props.values)
  const min = Math.min(...props.values)
  const rg = max - min || 1
  return props.values.map((v, i) => {
    const x = (i / (props.values.length - 1) * props.width).toFixed(1)
    const y = (props.height - 4 - ((v - min) / rg) * (props.height - 10)).toFixed(1)
    return `${x},${y}`
  }).join(' ')
})
</script>
