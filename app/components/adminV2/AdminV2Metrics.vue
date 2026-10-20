<script setup lang="ts">
import AdminV2Icon from './AdminV2Icon.vue'

interface Props {
  siswaHadir: string
  siswaTotal: string
  siswaPct: string
  siswaBar: number
  rombel: string
  guru: string
  guruHadir: string
  guruTotal: string
  guruPct: string
  guruBar: number
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})
</script>

<template>
  <div class="grid grid-cols-2 gap-3.5 h-full">
    <!-- Metric 1: Kehadiran Siswa (Hot Highlight Card) -->
    <section
      class="border rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)] flex flex-col justify-between text-white transition-colors"
      :class="jenjang === 'smp'
        ? 'bg-gradient-to-br from-[#22C55E] to-[#14532D] border-transparent'
        : 'bg-gradient-to-br from-[#2E7CF6] to-[#0A2A5C] border-transparent'"
    >
      <div>
        <div class="flex items-start justify-between gap-1.5">
          <span class="text-xs font-semibold text-white/80 leading-snug">Kehadiran Siswa Hari Ini</span>
          <span class="w-[34px] h-[34px] rounded-[10px] bg-white/20 flex items-center justify-center text-white shrink-0">
            <AdminV2Icon name="users" :size="17" />
          </span>
        </div>
        <div class="text-[26px] font-extrabold tracking-tight mt-2 text-white">
          <span>{{ siswaHadir }}</span>
          <span class="text-sm font-semibold opacity-60 ml-0.5 tracking-normal">{{ siswaTotal }}</span>
        </div>
      </div>

      <div>
        <div class="h-1.5 rounded-full bg-white/25 my-2.5 overflow-hidden">
          <div class="h-full rounded-full bg-white transition-all duration-500" :style="{ width: siswaBar + '%' }" />
        </div>
        <span class="inline-flex items-center gap-1 text-[11.5px] font-bold py-0.5 px-2 rounded-full bg-white/20 text-white">
          <AdminV2Icon name="check" :size="12" />
          <span>{{ siswaPct }}</span>
          <small class="font-medium text-white/70">hadir</small>
        </span>
      </div>
    </section>

    <!-- Metric 2: Jumlah Kelas / Rombel -->
    <section class="bg-white border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)] flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-1.5">
          <span class="text-xs font-semibold text-[#667085] leading-snug">Jumlah Kelas / Rombel</span>
          <span class="w-[34px] h-[34px] rounded-[10px] bg-[#EFF2F7] flex items-center justify-center text-[#344054] shrink-0">
            <AdminV2Icon name="layers" :size="17" />
          </span>
        </div>
        <div class="text-[26px] font-extrabold tracking-tight mt-2 text-[#101828]">
          {{ rombel }}
        </div>
      </div>

      <div>
        <span class="inline-flex items-center gap-1 text-[11.5px] font-bold py-0.5 px-2 rounded-full text-[#12B76A] bg-[#E7F8F0]">
          <AdminV2Icon name="check" :size="12" />
          <span>2</span>
          <small class="font-medium text-[#667085]">kelas baru</small>
        </span>
      </div>
    </section>

    <!-- Metric 3: Jumlah Guru & Staff -->
    <section class="bg-white border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)] flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-1.5">
          <span class="text-xs font-semibold text-[#667085] leading-snug">Jumlah Guru &amp; Staff</span>
          <span class="w-[34px] h-[34px] rounded-[10px] bg-[#EFF2F7] flex items-center justify-center text-[#344054] shrink-0">
            <AdminV2Icon name="users" :size="17" />
          </span>
        </div>
        <div class="text-[26px] font-extrabold tracking-tight mt-2 text-[#101828]">
          {{ guru }}
        </div>
      </div>

      <div>
        <span class="inline-flex items-center gap-1 text-[11.5px] font-bold py-0.5 px-2 rounded-full text-[#12B76A] bg-[#E7F8F0]">
          <AdminV2Icon name="check" :size="12" />
          <span>4</span>
          <small class="font-medium text-[#667085]">baru</small>
        </span>
      </div>
    </section>

    <!-- Metric 4: Kehadiran Guru & Staff -->
    <section class="bg-white border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)] flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-1.5">
          <span class="text-xs font-semibold text-[#667085] leading-snug">Kehadiran Guru &amp; Staff</span>
          <span class="w-[34px] h-[34px] rounded-[10px] bg-[#EFF2F7] flex items-center justify-center text-[#344054] shrink-0">
            <AdminV2Icon name="clock" :size="17" />
          </span>
        </div>
        <div class="text-[26px] font-extrabold tracking-tight mt-2 text-[#101828]">
          <span>{{ guruHadir }}</span>
          <span class="text-sm font-semibold text-[#667085]/60 ml-0.5 tracking-normal">{{ guruTotal }}</span>
        </div>
      </div>

      <div>
        <div class="h-1.5 rounded-full bg-[#EFF2F7] my-2.5 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="jenjang === 'smp' ? 'bg-gradient-to-r from-[#22C55E] to-[#14532D]' : 'bg-gradient-to-r from-[#2E7CF6] to-[#0A2A5C]'"
            :style="{ width: guruBar + '%' }"
          />
        </div>
        <span class="inline-flex items-center gap-1 text-[11.5px] font-bold py-0.5 px-2 rounded-full text-[#12B76A] bg-[#E7F8F0]">
          <AdminV2Icon name="check" :size="12" />
          <span>{{ guruPct }}</span>
          <small class="font-medium text-[#667085]">hadir</small>
        </span>
      </div>
    </section>
  </div>
</template>
