<script setup lang="ts">
import AdminV2Icon from './AdminV2Icon.vue'

interface Props {
  value: string
  sub: string
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'action', type: string): void
}>()
</script>

<template>
  <section class="h-full flex flex-col justify-between bg-gradient-to-br from-white to-[#F2F6FF] border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)] relative overflow-hidden">
    <!-- Watermark Shield Icon -->
    <div
      class="absolute -right-6 -top-6 w-[150px] h-[150px] opacity-[0.06] pointer-events-none transition-colors"
      :class="jenjang === 'smp' ? 'text-[#14532D]' : 'text-[#0A2A5C]'"
    >
      <AdminV2Icon name="shield" :size="150" />
    </div>

    <!-- Card Top Header & Main Metric -->
    <div class="relative z-10">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-[#667085]">Total Siswa Aktif</span>
        <button
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition"
          aria-label="Opsi"
          @click="emit('action', 'Opsi Hero')"
        >
          <AdminV2Icon name="dots" :size="16" />
        </button>
      </div>

      <div class="text-[34px] font-extrabold tracking-tight text-[#101828] mt-1">
        {{ value }}
      </div>

      <div class="mt-1.5">
        <span class="inline-flex items-center gap-1 text-[11.5px] font-bold py-0.5 px-2 rounded-full text-[#12B76A] bg-[#E7F8F0]">
          <AdminV2Icon name="check" :size="12" />
          <span>3,2%</span>
          <small class="font-medium text-[#667085]">vs tahun lalu</small>
        </span>
      </div>

      <p class="text-xs font-semibold text-[#667085] mt-2.5">
        {{ sub }}
      </p>
    </div>

    <!-- Quick Action Buttons -->
    <div class="flex gap-2.5 mt-5 flex-wrap relative z-10">
      <button
        type="button"
        class="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 text-[13px] font-bold py-2.5 px-4 rounded-full bg-[#101828] text-white hover:bg-[#1D2939] active:scale-95 transition shadow-sm"
        @click="emit('action', 'Form tambah siswa — demo')"
      >
        <AdminV2Icon name="plus" :size="15" />
        <span>Tambah Siswa</span>
      </button>

      <button
        type="button"
        class="flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 text-[13px] font-bold py-2.5 px-4 rounded-full bg-white border border-[#E7EBF2] text-[#101828] hover:border-[#98A2B3] active:scale-95 transition shadow-sm"
        @click="emit('action', 'Impor data siswa — demo')"
      >
        <AdminV2Icon name="swap" :size="15" />
        <span>Impor Data</span>
      </button>
    </div>
  </section>
</template>
