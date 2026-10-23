<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  activeSession: {
    key: string
    mapel: string
    kelas: string
    hadir: number
    alpaCount: number
    startTime: number
  } | null
}>()

const emit = defineEmits<{
  (e: 'akhiri', key: string): void
}>()

const timerStr = ref('00:00')
let intervalId: ReturnType<typeof setInterval> | null = null

const updateTimer = () => {
  if (!props.activeSession?.startTime) {
    timerStr.value = '00:00'
    return
  }
  const elapsedSec = Math.max(0, Math.floor((Date.now() - props.activeSession.startTime) / 1000))
  const m = String(Math.floor(elapsedSec / 60)).padStart(2, '0')
  const s = String(elapsedSec % 60).padStart(2, '0')
  timerStr.value = `${m}:${s}`
}

onMounted(() => {
  updateTimer()
  intervalId = setInterval(updateTimer, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div
    v-if="activeSession"
    class="sticky top-20 z-40 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0E2547] p-3.5 text-white shadow-xl animate-fade-in"
  >
    <div class="flex items-center gap-3 min-w-0">
      <span class="relative flex h-3 w-3 shrink-0">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F87171] opacity-75" />
        <span class="relative inline-flex h-3 w-3 rounded-full bg-[#EF4444]" />
      </span>

      <div class="min-w-0">
        <b class="block text-[11px] font-extrabold tracking-wider text-[#93B4F5] uppercase">
          Sedang Mengajar
        </b>
        <p class="truncate text-xs font-semibold text-white">
          {{ activeSession.mapel }} &bull; Kelas {{ activeSession.kelas }} &bull; Hadir {{ activeSession.hadir }} &bull; Alpa {{ activeSession.alpaCount }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-3 ml-auto">
      <span class="font-mono text-base font-extrabold tabular-nums tracking-wider text-white">
        {{ timerStr }}
      </span>

      <button
        type="button"
        class="rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-[#0B1F3A] shadow-xs transition-colors hover:bg-[#F3F5F9]"
        @click="emit('akhiri', activeSession.key)"
      >
        Akhiri Sesi
      </button>
    </div>
  </div>
</template>
