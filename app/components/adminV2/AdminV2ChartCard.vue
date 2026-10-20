<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from './AdminV2Icon.vue'

interface Props {
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

type ChartPeriod = 'hari' | 'minggu' | 'bulan'

const activePeriod = ref<ChartPeriod>('hari')

const ATT_DATA: Record<ChartPeriod, Array<[string, number]>> = {
  hari: [
    ['Sen', 96.2],
    ['Sel', 95.8],
    ['Rab', 94.6],
    ['Kam', 93.9],
    ['Jum', 95.1],
    ['Sab', 88.4]
  ],
  minggu: [
    ['Mg 1', 95.4],
    ['Mg 2', 94.8],
    ['Mg 3', 96.1],
    ['Mg 4', 93.7]
  ],
  bulan: [
    ['Mei', 94.2],
    ['Jun', 95.0],
    ['Jul', 93.5],
    ['Agu', 94.8],
    ['Sep', 95.3],
    ['Okt', 94.6]
  ]
}

const currentBars = computed(() => ATT_DATA[activePeriod.value])

const currentAverage = computed(() => {
  const bars = currentBars.value
  if (!bars.length) return '0,0%'
  const avg = bars.reduce((acc, curr) => acc + curr[1], 0) / bars.length
  return avg.toFixed(1).replace('.', ',') + '%'
})

const getBarHeight = (val: number) => {
  return Math.round((val / 100) * 150)
}

const formatVal = (val: number) => {
  return String(val).replace('.', ',') + '%'
}
</script>

<template>
  <section class="h-full flex flex-col justify-between bg-white border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)]">
    <!-- Header -->
    <div>
      <div class="flex items-start justify-between gap-2">
        <div>
          <h3 class="text-[15px] font-extrabold text-[#101828]">Rekap Kehadiran Siswa</h3>
          <p class="text-[11.5px] text-[#667085] mt-0.5">Persentase kehadiran per periode</p>
        </div>
        <span class="inline-flex items-center gap-1 text-[11.5px] font-bold py-0.5 px-2 rounded-full text-[#12B76A] bg-[#E7F8F0]">
          <AdminV2Icon name="check" :size="12" />
          <span>{{ currentAverage }}</span>
          <small class="font-medium text-[#667085]">rata-rata</small>
        </span>
      </div>

      <!-- Segmented Control for Period -->
      <div class="my-3">
        <div class="flex bg-[#EFF2F7] rounded-full p-0.5 sm:p-1 gap-0.5">
          <button
            type="button"
            class="flex-1 text-[11px] font-bold py-1 px-2.5 rounded-full transition whitespace-nowrap text-center"
            :class="activePeriod === 'hari' ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.12)]' : 'text-[#667085] hover:text-[#101828]'"
            @click="activePeriod = 'hari'"
          >
            Hari
          </button>
          <button
            type="button"
            class="flex-1 text-[11px] font-bold py-1 px-2.5 rounded-full transition whitespace-nowrap text-center"
            :class="activePeriod === 'minggu' ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.12)]' : 'text-[#667085] hover:text-[#101828]'"
            @click="activePeriod = 'minggu'"
          >
            Minggu
          </button>
          <button
            type="button"
            class="flex-1 text-[11px] font-bold py-1 px-2.5 rounded-full transition whitespace-nowrap text-center"
            :class="activePeriod === 'bulan' ? 'bg-white text-[#101828] shadow-[0_1px_3px_rgba(16,24,40,0.12)]' : 'text-[#667085] hover:text-[#101828]'"
            @click="activePeriod = 'bulan'"
          >
            Bulan
          </button>
        </div>
      </div>
    </div>

    <!-- Interactive Bar Chart -->
    <div class="flex items-end gap-1.5 h-[180px] pt-2">
      <div
        v-for="([lbl, val], idx) in currentBars"
        :key="idx"
        class="flex-1 flex flex-col items-center justify-end gap-1.5 h-full"
      >
        <span
          class="text-[10px] font-extrabold transition-colors"
          :class="jenjang === 'smp' ? 'text-[#14532D]' : 'text-[#0A2A5C]'"
        >
          {{ formatVal(val) }}
        </span>
        <div
          class="flex flex-col-reverse w-full max-w-[40px] rounded-[7px] overflow-hidden"
          :title="`${lbl}: kehadiran ${formatVal(val)}`"
        >
          <div
            class="w-full transition-all duration-300"
            :class="val < 90
              ? 'bg-gradient-to-t from-[#F79009] to-[#FDB022]'
              : jenjang === 'smp'
                ? 'bg-gradient-to-t from-[#14532D] to-[#22C55E]'
                : 'bg-gradient-to-t from-[#0A2A5C] to-[#2E7CF6]'"
            :style="{ height: getBarHeight(val) + 'px' }"
          />
        </div>
        <span class="text-[10px] font-semibold text-[#98A2B3]">{{ lbl }}</span>
      </div>
    </div>
  </section>
</template>
