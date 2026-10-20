<script setup lang="ts">
import { computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'

interface Props {
  aktifCount: number
  gapCount: number
  rombelCount: number
  rfidCount: number
  rfidPct: number
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'filter-reset'): void
  (e: 'filter-gap'): void
  (e: 'filter-rfid'): void
  (e: 'go-kelas'): void
}>()

const isGapHot = computed(() => props.gapCount > 0)
const isRfidHot = computed(() => props.rfidCount < props.aktifCount)
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
    <!-- Card 1: Total Siswa Aktif (Normal White Card) -->
    <div
      role="button"
      tabindex="0"
      class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_-12px_rgba(16,24,40,0.08)] cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_rgba(16,24,40,0.18)] select-none focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]"
      @click="emit('filter-reset')"
      @keydown.enter="emit('filter-reset')"
    >
      <div class="flex items-start justify-between gap-2.5">
        <span class="text-[13.5px] font-bold text-[#475467] leading-snug">Total Siswa Aktif</span>
        <span
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition"
          :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
        >
          <AdminV2Icon name="users" :size="20" />
        </span>
      </div>
      <div class="text-[32px] sm:text-[34px] font-extrabold tracking-tight mt-2.5 text-[#101828] tabular-nums leading-none">
        {{ aktifCount }}
      </div>
      <div class="flex items-center gap-2 mt-3 text-[12.5px] text-[#475467]">
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EFF2F7] text-[#344054] inline-flex items-center gap-1.5 whitespace-nowrap">
          <i class="w-2 h-2 rounded-full bg-[#12B76A]" />
          Aktif
        </span>
        <span class="truncate font-medium">T.A 2026/2027</span>
      </div>
    </div>

    <!-- Card 2: Data Belum Lengkap (ALERT MERAH KONTRAS) -->
    <div
      role="button"
      tabindex="0"
      class="rounded-[18px] p-5 shadow-[0_12px_28px_-8px_rgba(240,68,56,0.38)] cursor-pointer transition hover:-translate-y-0.5 select-none focus:outline-none focus:ring-2 focus:ring-[#F04438] bg-gradient-to-br from-[#F04438] to-[#991B1B] text-white"
      @click="emit('filter-gap')"
      @keydown.enter="emit('filter-gap')"
    >
      <div class="flex items-start justify-between gap-2.5">
        <span class="text-[13.5px] font-bold leading-snug text-white/95">
          Data Belum Lengkap
        </span>
        <span class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
          <AdminV2Icon name="alert" :size="20" />
        </span>
      </div>
      <div class="text-[32px] sm:text-[34px] font-extrabold tracking-tight mt-2.5 tabular-nums leading-none text-white">
        {{ gapCount }}
      </div>
      <div class="flex items-center gap-2 mt-3 text-[12.5px] text-white/95">
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap bg-white/20 text-white">
          <i class="w-2 h-2 rounded-full bg-white" />
          Alert Data
        </span>
        <span class="truncate font-medium">{{ gapCount }} siswa perlu dilengkapi</span>
      </div>
    </div>

    <!-- Card 3: Total Rombel (Normal White Card) -->
    <div
      role="button"
      tabindex="0"
      class="bg-white border border-[#E7EBF2] rounded-[18px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_-12px_rgba(16,24,40,0.08)] cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_rgba(16,24,40,0.18)] select-none focus:outline-none focus:ring-2 focus:ring-[#6941C6]"
      @click="emit('go-kelas')"
      @keydown.enter="emit('go-kelas')"
    >
      <div class="flex items-start justify-between gap-2.5">
        <span class="text-[13.5px] font-bold text-[#475467] leading-snug">Total Rombel</span>
        <span class="w-10 h-10 rounded-xl bg-[#F1EAFF] text-[#6941C6] flex items-center justify-center shrink-0">
          <AdminV2Icon name="layers" :size="20" />
        </span>
      </div>
      <div class="text-[32px] sm:text-[34px] font-extrabold tracking-tight mt-2.5 text-[#101828] tabular-nums leading-none">
        {{ rombelCount }}
      </div>
      <div class="flex items-center gap-2 mt-3 text-[12.5px] text-[#475467]">
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EFF2F7] text-[#344054] inline-flex items-center gap-1.5 whitespace-nowrap">
          <i class="w-2 h-2 rounded-full bg-[#6941C6]" />
          Rombel
        </span>
        <span class="truncate font-medium">Kelas aktif tahun ini</span>
      </div>
    </div>

    <!-- Card 4: Smartcard Aktif (Branding Gradient Card) -->
    <div
      role="button"
      tabindex="0"
      class="rounded-[18px] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_-12px_rgba(16,24,40,0.08)] cursor-pointer transition hover:-translate-y-0.5 select-none focus:outline-none focus:ring-2 focus:ring-white/40"
      :class="[
        isRfidHot
          ? jenjang === 'smp'
            ? 'bg-gradient-to-br from-[#22C55E] to-[#14532D] text-white border-transparent shadow-[0_12px_28px_-8px_rgba(22,163,74,0.35)]'
            : 'bg-gradient-to-br from-[#2E7CF6] to-[#0A2A5C] text-white border-transparent shadow-[0_12px_28px_-8px_rgba(27,95,217,0.35)]'
          : 'bg-white border border-[#E7EBF2] text-[#101828]'
      ]"
      @click="emit('filter-rfid')"
      @keydown.enter="emit('filter-rfid')"
    >
      <div class="flex items-start justify-between gap-2.5">
        <span
          class="text-[13.5px] font-bold leading-snug"
          :class="isRfidHot ? 'text-white/95' : 'text-[#475467]'"
        >
          Smartcard Aktif
        </span>
        <span
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          :class="isRfidHot ? 'bg-white/16 text-white' : 'bg-[#E7F8F0] text-[#067647]'"
        >
          <AdminV2Icon name="wifi" :size="20" />
        </span>
      </div>
      <div
        class="text-[32px] sm:text-[34px] font-extrabold tracking-tight mt-2.5 tabular-nums leading-none"
        :class="isRfidHot ? 'text-white' : 'text-[#101828]'"
      >
        {{ rfidPct }}%
      </div>
      <div
        class="flex items-center gap-2 mt-3 text-[12.5px]"
        :class="isRfidHot ? 'text-white/95' : 'text-[#475467]'"
      >
        <span
          class="text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap"
          :class="isRfidHot ? 'bg-white/18 text-white' : 'bg-[#E7F8F0] text-[#067647]'"
        >
          <i
            class="w-2 h-2 rounded-full"
            :class="isRfidHot ? 'bg-white' : 'bg-[#12B76A]'"
          />
          Smartcard
        </span>
        <span class="truncate font-medium">{{ rfidCount }} dari {{ aktifCount }} siswa</span>
      </div>
    </div>
  </div>
</template>
