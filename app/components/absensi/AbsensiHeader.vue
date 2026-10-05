<template>
  <header class="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 pb-2 sm:pb-2.5 border-b border-[#1D2C4E] shrink-0">
    <!-- Brand -->
    <div class="flex items-center gap-3">
      <svg class="w-8 h-10 sm:w-9 sm:h-11 shrink-0 filter drop-shadow-[0_0_10px_rgba(46,155,255,0.4)]" viewBox="0 0 48 56" fill="none">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="48" y2="56">
            <stop stop-color="#7cc4ff" />
            <stop offset="1" stop-color="#1E73BE" />
          </linearGradient>
        </defs>
        <path
          d="M24 2 44 9v16c0 13.5-8.5 22.5-20 29C12.5 47.5 4 38.5 4 25V9L24 2z"
          stroke="url(#sg)"
          stroke-width="3"
          fill="rgba(46,155,255,.08)"
        />
        <text x="24" y="37" text-anchor="middle" font-family="Inter" font-weight="900" font-size="23" fill="#7cc4ff">
          9
        </text>
      </svg>
      <div>
        <div class="text-sm sm:text-base font-black text-white leading-tight tracking-wider">
          SMK IT <span class="text-blue-400">ATTAQWA 9</span>
        </div>
        <div class="text-[10px] sm:text-[11px] font-semibold text-slate-400">
          Unggul dalam IMTAQ, Terdepan dalam IPTEK
        </div>
      </div>
    </div>

    <!-- URL Chip -->
    <div class="hidden md:flex items-center px-3.5 py-1.5 rounded-full bg-[#0A1730] border border-[#1D2C4E] text-xs font-mono text-slate-300">
      absen.smkitattaqwa9.sch.id/<b class="text-blue-400 ml-1">{{ kode }}</b>
    </div>

    <!-- Clock -->
    <div class="text-center sm:text-right">
      <div class="text-[11px] font-semibold text-slate-400 mb-0.5">{{ dateLine }}</div>
      <div class="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white leading-none">
        {{ hours }}<span class="text-blue-400 animate-pulse">:</span>{{ minutes }}<span class="text-blue-400 animate-pulse">:</span>{{ seconds }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  kode: string
  hours: string
  minutes: string
  seconds: string
  dateLine: string
}>()
</script>
