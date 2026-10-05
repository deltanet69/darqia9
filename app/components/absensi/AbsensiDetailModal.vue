<template>
  <Teleport to="body">
    <div
      v-if="student"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040814]/80 backdrop-blur-md animate-fadeIn"
      @click.self="$emit('close')"
    >
      <div class="relative w-full max-w-md bg-gradient-to-b from-[#0E1A36] to-[#0A1428] border border-[#2A3F6E] rounded-3xl p-6 sm:p-8 shadow-2xl text-white animate-popIn space-y-5" role="dialog" aria-modal="true">
        <button
          class="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          type="button"
          aria-label="Tutup"
          @click="$emit('close')"
        >
          ✕
        </button>

        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg">
            {{ initials(student.name) }}
          </div>
          <div>
            <div class="text-lg font-black text-white leading-tight">{{ student.name }}</div>
            <div class="text-xs text-slate-400 mt-0.5">NIS {{ student.nis }} &bull; Kelas {{ student.className }}</div>
          </div>
        </div>

        <div class="divide-y divide-[#1D2C4E] pt-2 text-xs">
          <div class="flex justify-between py-2.5">
            <span class="text-slate-400 font-medium">Jam Masuk</span>
            <span class="font-mono font-bold text-slate-200">{{ student.masuk || '—' }}</span>
          </div>
          <div class="flex justify-between py-2.5">
            <span class="text-slate-400 font-medium">Jam Keluar</span>
            <span class="font-mono font-bold text-slate-200">{{ student.keluar || '—' }}</span>
          </div>
          <div class="flex justify-between py-2.5 items-center">
            <span class="text-slate-400 font-medium">Keterangan</span>
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              :class="getStatusClass(student.status)"
            >
              {{ getStatusLabel(student.status).toUpperCase() }}
            </span>
          </div>
          <div class="flex justify-between py-2.5">
            <span class="text-slate-400 font-medium">Tepat Waktu s/d</span>
            <span class="font-mono text-slate-300">{{ config.TEPAT_STR }}</span>
          </div>
          <div class="flex justify-between py-2.5">
            <span class="text-slate-400 font-medium">Toleransi Terlambat s/d</span>
            <span class="font-mono text-slate-300">{{ config.TOL_STR }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { type AbsensiStudent, ABSENSI_CONFIG } from '~/composables/useAbsensiTv'

const props = defineProps<{
  student: AbsensiStudent | null
}>()

defineEmits<{
  (e: 'close'): void
}>()

const config = ABSENSI_CONFIG

const initials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const getStatusLabel = (status: AbsensiStudent['status']) => {
  switch (status) {
    case 'tepat': return 'Tepat Waktu'
    case 'terlambat': return 'Terlambat'
    case 'alpa': return 'Alpa'
    default: return 'Menunggu'
  }
}

const getStatusClass = (status: AbsensiStudent['status']) => {
  switch (status) {
    case 'tepat': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    case 'terlambat': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    case 'alpa': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    default: return 'bg-slate-700/40 text-slate-400 border border-slate-600/30'
  }
}
</script>
