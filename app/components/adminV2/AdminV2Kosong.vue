<script setup lang="ts">
// Keadaan kosong kartu dashboard: pratinjau samar bentuk daftar yang akan terisi + keterangan.
// Sengaja tanpa ikon/karakter (aturan AGENTS.md); grafiknya adalah bentuk baris itu sendiri.
withDefaults(defineProps<{
  judul: string
  keterangan?: string
  jenjang?: 'smp' | 'smk'
  lead?: 'chip' | 'kotak'
}>(), { keterangan: '', jenjang: 'smk', lead: 'chip' })

const LEBAR = [['72%', '48%'], ['58%', '64%'], ['80%', '40%']]
</script>

<template>
  <div class="relative overflow-hidden rounded-[14px] border border-dashed border-[#DCE3EE] bg-[#FAFCFE]">
    <ul class="flex flex-col gap-2 p-3 [mask-image:linear-gradient(to_bottom,#000_10%,transparent_85%)]" aria-hidden="true">
      <li v-for="([a, b], i) in LEBAR" :key="i" class="flex items-center gap-3 rounded-xl border border-[#EEF2F7] bg-white p-2.5">
        <span
          class="shrink-0 rounded-[10px]"
          :class="[lead === 'chip' ? 'h-9 w-[46px]' : 'h-9 w-9', jenjang === 'smp' ? 'bg-[#E7F6ED]' : 'bg-[#E8F0FE]']"
        />
        <span class="flex min-w-0 flex-1 flex-col gap-1.5">
          <span class="h-2 rounded-full bg-[#E4E9F1]" :style="{ width: a }" />
          <span class="h-1.5 rounded-full bg-[#EEF2F7]" :style="{ width: b }" />
        </span>
        <span class="h-5 w-12 shrink-0 rounded-full bg-[#EFF2F7]" />
      </li>
    </ul>
    <div class="relative -mt-14 px-4 pb-4 text-center">
      <p class="text-[13px] font-bold text-[#101828]">{{ judul }}</p>
      <p v-if="keterangan" class="mx-auto mt-0.5 max-w-[34ch] text-[11.5px] leading-snug text-[#667085]">{{ keterangan }}</p>
    </div>
  </div>
</template>
