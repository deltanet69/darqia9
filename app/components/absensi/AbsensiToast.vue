<template>
  <div
    class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#080F20]/95 backdrop-blur-md border border-[#2a3f6e] rounded-full px-5 py-3 shadow-2xl text-white text-xs sm:text-sm transition-all duration-300 pointer-events-none"
    :class="data.show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-95'"
  >
    <span
      class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
      :class="data.isAlpa ? 'bg-rose-500/20 text-rose-400 border border-rose-500' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'"
    >
      {{ data.isAlpa ? '✕' : '✓' }}
    </span>
    <b class="text-white">{{ data.name }}</b>
    <span v-if="data.className" class="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-[10px]">
      {{ data.className }}
    </span>
    <span class="font-mono text-slate-400 text-xs">{{ data.time }}</span>
    <span
      class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5"
      :class="getPillClass(data.status)"
    >
      <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getDotClass(data.status)" />
      <span>{{ getLabel(data.status) }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { AbsensiToastData } from '~/composables/useAbsensiTv'

defineProps<{
  data: AbsensiToastData
}>()

const getPillClass = (status: AbsensiToastData['status']) => {
  switch (status) {
    case 'tepat': return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
    case 'terlambat': return 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
    case 'alpa': return 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
    default: return 'bg-transparent text-slate-400 border border-slate-700'
  }
}

const getDotClass = (status: AbsensiToastData['status']) => {
  switch (status) {
    case 'tepat': return 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
    case 'terlambat': return 'bg-amber-400 shadow-[0_0_8px_#FB923C]'
    case 'alpa': return 'bg-rose-400 shadow-[0_0_8px_#F87171]'
    default: return 'bg-slate-500'
  }
}

const getLabel = (status: AbsensiToastData['status']) => {
  switch (status) {
    case 'tepat': return 'Tepat waktu'
    case 'terlambat': return 'Terlambat'
    case 'alpa': return 'Alpa'
    default: return 'Menunggu'
  }
}
</script>
