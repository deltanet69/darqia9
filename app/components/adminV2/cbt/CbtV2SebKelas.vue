<script setup lang="ts">
// LMS tidak punya Ruang Ujian: kode quit SEB iOS berlaku per kelas (migrasi 0062).
import { ref, computed } from 'vue'
import CbtV2SebQuit from './CbtV2SebQuit.vue'
import type { GradeType } from './cbtV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'

const props = defineProps<{ grade: GradeType }>()
const emit = defineEmits<{ (e: 'toast', msg: string): void }>()

const cbtData = useAdminCbtData('ujian_harian')
const kelasList = computed(() => cbtData.classes.value
  .filter(item => item.grade === props.grade)
  .sort((a, b) => a.name.localeCompare(b.name, 'id', { numeric: true })))
const kelasId = ref('')
</script>

<template>
  <section class="mt-4 space-y-4">
    <div class="rounded-2xl border border-[#E7EBF2] bg-white p-4">
      <p class="mb-2 text-xs font-bold text-[#344054]">Pilih kelas</p>
      <p v-if="!kelasList.length" class="text-xs text-[#667085]">Belum ada kelas aktif di jenjang ini.</p>
      <div v-else class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" role="group" aria-label="Pilih kelas">
        <button
          v-for="k in kelasList" :key="k.id" type="button"
          class="min-h-9 shrink-0 whitespace-nowrap rounded-lg border px-3 text-xs font-bold"
          :class="kelasId === k.id ? 'border-[#1B5FD9] bg-[#EEF4FF] text-[#0A2A5C]' : 'border-[#E7EBF2] text-[#344054] hover:border-[#C9D5E8]'"
          :aria-pressed="kelasId === k.id"
          @click="kelasId = k.id"
        >{{ k.name }}</button>
      </div>
    </div>
    <CbtV2SebQuit v-if="kelasId" :key="kelasId" jenis="kelas" :target-id="kelasId" @toast="emit('toast', $event)" />
  </section>
</template>
