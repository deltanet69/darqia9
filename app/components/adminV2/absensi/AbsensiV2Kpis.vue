<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'

interface Props {
  hadirCount: number
  terlambatCount: number
  izinCount: number
  sakitCount: number
  alpaCount: number
  totalCount: number
  kehadiranPct: number
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'filter-reset'): void
  (e: 'filter-alert'): void
  (e: 'filter-izin'): void
  (e: 'filter-hadir'): void
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
    <!-- Card 1: Hadir Tepat Waktu (Clean White Card) -->
    <div
      role="button"
      tabindex="0"
      class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_-12px_rgba(16,24,40,0.08)] cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_rgba(16,24,40,0.18)] select-none focus:outline-none focus:ring-2 focus:ring-[#12B76A]"
      @click="emit('filter-hadir')"
      @keydown.enter="emit('filter-hadir')"
    >
      <div class="flex items-start justify-between gap-2.5">
        <span class="text-[13.5px] font-bold text-[#475467] leading-snug">Hadir Tepat Waktu</span>
        <span class="w-10 h-10 rounded-xl bg-[#E7F8F0] text-[#067647] flex items-center justify-center shrink-0">
          <AdminV2Icon name="clock" :size="20" />
        </span>
      </div>
      <div class="text-[32px] sm:text-[34px] font-extrabold tracking-tight mt-2.5 text-[#101828] tabular-nums leading-none">
        {{ hadirCount }}
      </div>
      <div class="flex items-center gap-2 mt-3 text-[12.5px] text-[#475467]">
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E7F8F0] text-[#067647] inline-flex items-center gap-1.5 whitespace-nowrap">
          <i class="w-2 h-2 rounded-full bg-[#12B76A]" />
          &le; 06:45 WIB
        </span>
        <span class="truncate font-medium">Tepat waktu</span>
      </div>
    </div>

    <!-- Card 2: Terlambat & Alpa (ALERT MERAH KONTRAS) -->
    <div
      role="button"
      tabindex="0"
      class="rounded-[18px] p-5 shadow-[0_12px_28px_-8px_rgba(240,68,56,0.38)] cursor-pointer transition hover:-translate-y-0.5 select-none focus:outline-none focus:ring-2 focus:ring-[#F04438] bg-gradient-to-br from-[#F04438] to-[#991B1B] text-white"
      @click="emit('filter-alert')"
      @keydown.enter="emit('filter-alert')"
    >
      <div class="flex items-start justify-between gap-2.5">
        <span class="text-[13.5px] font-bold leading-snug text-white/95">
          Terlambat &amp; Alpa
        </span>
        <span class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
          <AdminV2Icon name="alert" :size="20" />
        </span>
      </div>
      <div class="text-[32px] sm:text-[34px] font-extrabold tracking-tight mt-2.5 tabular-nums leading-none text-white">
        {{ terlambatCount + alpaCount }}
      </div>
      <div class="flex items-center gap-2 mt-3 text-[12.5px] text-white/95">
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap bg-white/20 text-white">
          <i class="w-2 h-2 rounded-full bg-white" />
          Alert Presensi
        </span>
        <span class="truncate font-medium">{{ terlambatCount }} terlambat &bull; {{ alpaCount }} alpa</span>
      </div>
    </div>

    <!-- Card 3: Izin & Sakit (Clean White Card) -->
    <div
      role="button"
      tabindex="0"
      class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_-12px_rgba(16,24,40,0.08)] cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_rgba(16,24,40,0.18)] select-none focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]"
      @click="emit('filter-izin')"
      @keydown.enter="emit('filter-izin')"
    >
      <div class="flex items-start justify-between gap-2.5">
        <span class="text-[13.5px] font-bold text-[#475467] leading-snug">Izin &amp; Sakit</span>
        <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#12459B] flex items-center justify-center shrink-0">
          <AdminV2Icon name="doc" :size="20" />
        </span>
      </div>
      <div class="text-[32px] sm:text-[34px] font-extrabold tracking-tight mt-2.5 text-[#101828] tabular-nums leading-none">
        {{ izinCount + sakitCount }}
      </div>
      <div class="flex items-center gap-2 mt-3 text-[12.5px] text-[#475467]">
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EFF2F7] text-[#344054] inline-flex items-center gap-1.5 whitespace-nowrap">
          <i class="w-2 h-2 rounded-full bg-[#1B5FD9]" />
          Surat Valid
        </span>
        <span class="truncate font-medium">{{ izinCount }} izin &bull; {{ sakitCount }} sakit</span>
      </div>
    </div>

    <!-- Card 4: Persentase Kehadiran Live (Branding Gradient Card) -->
    <div
      role="button"
      tabindex="0"
      class="rounded-[18px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_-12px_rgba(16,24,40,0.08)] cursor-pointer transition hover:-translate-y-0.5 select-none focus:outline-none focus:ring-2 focus:ring-white/40"
      :class="jenjang === 'smp'
        ? 'bg-gradient-to-br from-[#22C55E] to-[#14532D] text-white border-transparent shadow-[0_12px_28px_-8px_rgba(22,163,74,0.35)]'
        : 'bg-gradient-to-br from-[#2E7CF6] to-[#0A2A5C] text-white border-transparent shadow-[0_12px_28px_-8px_rgba(27,95,217,0.35)]'"
      @click="emit('filter-reset')"
      @keydown.enter="emit('filter-reset')"
    >
      <div class="flex items-start justify-between gap-2.5">
        <span class="text-[13.5px] font-bold leading-snug text-white/95">
          Tingkat Kehadiran
        </span>
        <span class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/16 text-white">
          <AdminV2Icon name="wifi" :size="20" />
        </span>
      </div>
      <div class="text-[32px] sm:text-[34px] font-extrabold tracking-tight mt-2.5 tabular-nums leading-none text-white">
        {{ kehadiranPct }}%
      </div>
      <div class="flex items-center gap-2 mt-3 text-[12.5px] text-white/95">
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap bg-white/20 text-white">
          <i class="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
          Smartcard Live
        </span>
        <span class="truncate font-medium">{{ hadirCount + terlambatCount }} dari {{ totalCount }} siswa</span>
      </div>
    </div>
  </div>
</template>
