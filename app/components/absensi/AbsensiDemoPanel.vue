<template>
  <div v-if="isDemoMode" class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 font-sans">
    <!-- Panel -->
    <div
      v-show="isOpen"
      class="bg-[#0B152C]/95 backdrop-blur-md border border-[#1D2C4E] rounded-2xl p-4 shadow-2xl text-white space-y-3 w-64 animate-scaleUp"
    >
      <div class="flex items-center justify-between text-[11px] font-extrabold tracking-wider text-slate-400">
        <span>KONTROL DEMO ABSENSI SISWA</span>
      </div>

      <!-- Segmented Control Kelas -->
      <div class="grid grid-cols-3 gap-1 bg-[#040814] p-1 rounded-xl border border-[#1D2C4E]">
        <button
          type="button"
          class="py-1 text-xs font-bold rounded-lg transition-all"
          :class="classesCount === 2 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'"
          @click="$emit('changeCount', 2)"
        >
          2 kelas
        </button>
        <button
          type="button"
          class="py-1 text-xs font-bold rounded-lg transition-all"
          :class="classesCount === 3 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'"
          @click="$emit('changeCount', 3)"
        >
          3 kelas
        </button>
        <button
          type="button"
          class="py-1 text-xs font-bold rounded-lg transition-all"
          :class="classesCount === 4 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'"
          @click="$emit('changeCount', 4)"
        >
          4 kelas
        </button>
      </div>

      <!-- Controls -->
      <div class="grid grid-cols-2 gap-2">
        <button
          class="py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          :class="simOn ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/30' : 'bg-blue-600 hover:bg-blue-700 text-white'"
          type="button"
          @click="$emit('toggleSim')"
        >
          {{ simOn ? '⏸ Jeda' : '▶ Simulasi' }}
        </button>
        <button
          class="py-2 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          type="button"
          @click="$emit('reset')"
        >
          ↺ Reset
        </button>
      </div>
    </div>

    <!-- Toggle FAB -->
    <button
      class="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 transition-transform duration-200 hover:scale-105 active:scale-95"
      type="button"
      title="Kontrol demo"
      @click="isOpen = !isOpen"
    >
      <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-90': isOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  classesCount: number
  simOn: boolean
}>()

defineEmits<{
  (e: 'changeCount', n: number): void
  (e: 'toggleSim'): void
  (e: 'reset'): void
}>()

const isOpen = ref(false)
const isDemoMode = process.dev || true
</script>
