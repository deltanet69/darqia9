<script setup lang="ts">
interface Props {
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'add-agenda'): void
  (e: 'click-item', title: string): void
}>()
</script>

<template>
  <section class="h-full flex flex-col justify-between bg-white border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)]">
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-[15px] font-extrabold text-[#101828]">Agenda Terdekat</h3>
        <button
          type="button"
          class="text-xs font-bold transition p-0"
          :class="jenjang === 'smp' ? 'text-[#16A34A] hover:text-[#14532D]' : 'text-[#1B5FD9] hover:text-[#0A2A5C]'"
          @click="emit('add-agenda')"
        >
          + Tambah agenda
        </button>
      </div>

      <div class="flex flex-col gap-2.5">
        <!-- Card 1: Rapat -->
        <div
          class="rounded-[14px] p-3.5 text-white relative overflow-hidden min-h-[105px] flex flex-col justify-end transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          :class="jenjang === 'smp'
            ? 'bg-gradient-to-br from-[#22C55E] to-[#14532D]'
            : 'bg-gradient-to-br from-[#2E7CF6] to-[#0A2A5C]'"
          @click="emit('click-item', 'Rapat Dewan Guru')"
        >
          <span class="absolute top-2.5 left-3 text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            Rapat
          </span>
          <span class="absolute top-2.5 right-3 text-center bg-white/15 rounded-lg py-1 px-2">
            <b class="block text-sm font-extrabold leading-none">16</b>
            <span class="text-[9px] font-bold tracking-wider uppercase">Okt</span>
          </span>
          <b class="text-sm font-bold block">Rapat Dewan Guru</b>
          <span class="text-[11.5px] opacity-85 mt-0.5">09:00 &middot; Aula Utama &middot; 42 peserta</span>
        </div>

        <!-- Card 2: Ujian -->
        <div
          class="rounded-[14px] p-3.5 text-white relative overflow-hidden min-h-[105px] flex flex-col justify-end bg-gradient-to-br from-[#1D2939] to-[#0B1220] transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          @click="emit('click-item', 'Gladi Bersih CBT')"
        >
          <span class="absolute top-2.5 left-3 text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            Ujian
          </span>
          <span class="absolute top-2.5 right-3 text-center bg-white/15 rounded-lg py-1 px-2">
            <b class="block text-sm font-extrabold leading-none">20</b>
            <span class="text-[9px] font-bold tracking-wider uppercase">Okt</span>
          </span>
          <b class="text-sm font-bold block">Gladi Bersih CBT</b>
          <span class="text-[11.5px] opacity-85 mt-0.5">07:00 &middot; Lab 1-4 &middot; Kelas XII</span>
        </div>
      </div>
    </div>
  </section>
</template>
