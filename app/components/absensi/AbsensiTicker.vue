<template>
  <footer class="flex items-stretch border border-[#1D2C4E] rounded-xl bg-[#081226] overflow-hidden shadow-lg shrink-0 h-8 sm:h-9">
    <div class="flex items-center gap-1.5 px-3 bg-red-600 text-white font-black text-[10px] sm:text-xs shrink-0 tracking-wider">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
      <span>LIVE</span>
    </div>
    
    <div class="flex-1 overflow-hidden relative flex items-center px-3">
      <div class="flex items-center gap-6 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
        <template v-if="events.length > 0">
          <span
            v-for="(ev, idx) in duplicatedEvents"
            :key="idx"
            class="inline-flex items-center gap-2 text-xs text-slate-300"
          >
            <b class="text-white font-mono text-[11px] sm:text-xs">{{ ev.time }}</b>
            <span class="px-1.5 py-0.5 rounded bg-[#0B152C] border border-[#1D2C4E] text-blue-300 font-bold text-[10px]">{{ ev.className }}</span>
            <span class="text-[11px] sm:text-xs">{{ ev.student.name }} tap masuk</span>
            <b :class="ev.student.status === 'tepat' ? 'text-emerald-400' : 'text-amber-400'" class="text-[11px] sm:text-xs">
              &bull; {{ ev.student.status === 'tepat' ? 'Tepat waktu' : 'Terlambat' }}
            </b>
            <span class="text-slate-600 ml-2">&bull;</span>
          </span>
        </template>
        <template v-else>
          <span class="text-[11px] sm:text-xs text-slate-400 font-medium">Sistem siap &mdash; menunggu tap masuk siswa pertama…</span>
        </template>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AbsensiStudent } from '~/composables/useAbsensiTv'

const props = defineProps<{
  events: { time: string; student: AbsensiStudent; className: string }[]
}>()

const duplicatedEvents = computed(() => {
  const top14 = props.events.slice(0, 14)
  return [...top14, ...top14]
})
</script>

<style scoped>
/* Empty style block to fix Vite HMR cache error */
</style>

