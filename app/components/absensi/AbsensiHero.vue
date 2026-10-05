<template>
  <section class="flex flex-col lg:flex-row items-center justify-between gap-3 bg-[#0B152C] border border-[#1D2C4E] rounded-2xl px-4 py-4 sm:px-5 sm:py-6 shadow-xl shrink-0">
    <!-- Level & Location -->
    <div class="text-center lg:text-left">
      <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold tracking-wider bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-0.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span>ABSENSI SISWA &bull; GEDUNG B &bull; LANTAI 2</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none my-0.5">
        Kelas <span class="text-blue-400">{{ levelNum }}</span>
      </h1>
      <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {{ classes.length }} KELAS &bull; {{ classes.join(' / ') }}
      </div>
    </div>

    <!-- Stats Row with Attendance Ring -->
    <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6">
      <!-- Attendance Progress Ring -->
      <div class="relative w-17 h-17 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 92 92">
          <circle cx="46" cy="46" r="39" class="text-[#1a2745]" stroke-width="9" stroke="currentColor" fill="none" />
          <circle
            cx="46"
            cy="46"
            r="39"
            class="text-blue-400 transition-all duration-700 ease-out"
            stroke-width="9"
            stroke-dasharray="245"
            :stroke-dashoffset="245 * (1 - (stats.pct || 0) / 100)"
            stroke-linecap="round"
            stroke="currentColor"
            fill="none"
          />
        </svg>
        <div class="absolute text-center">
          <b class="block text-sm sm:text-base font-black text-white leading-none">{{ stats.pct }}%</b>
          <small class="text-[8px] font-extrabold text-blue-300 tracking-wider leading-none">HADIR</small>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-4 gap-2 sm:gap-2.5">
        <div class="bg-[#0A1730] border border-[#1D2C4E] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center min-w-[70px] sm:min-w-[80px]">
          <div class="text-lg sm:text-xl font-black text-emerald-400 font-mono leading-tight">{{ stats.tepat }}</div>
          <div class="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Tepat waktu</div>
        </div>

        <div class="bg-[#0A1730] border border-[#1D2C4E] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center min-w-[70px] sm:min-w-[80px]">
          <div class="text-lg sm:text-xl font-black text-amber-400 font-mono leading-tight">{{ stats.terlambat }}</div>
          <div class="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Terlambat</div>
        </div>

        <div class="bg-[#0A1730] border border-[#1D2C4E] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center min-w-[70px] sm:min-w-[80px]">
          <div class="text-lg sm:text-xl font-black text-rose-400 font-mono leading-tight">{{ stats.alpa }}</div>
          <div class="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Alpa</div>
        </div>

        <div class="bg-[#0A1730] border border-[#1D2C4E] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center min-w-[70px] sm:min-w-[80px]">
          <div class="text-lg sm:text-xl font-black text-white font-mono leading-tight">{{ stats.total }}</div>
          <div class="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Total siswa</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  levelNum: string
  classes: string[]
  stats: {
    total: number
    tepat: number
    terlambat: number
    alpa: number
    hadir: number
    pct: number
  }
}>()
</script>
