<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import type { Student } from './siswaV2Data'

interface Props {
  student: Student | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', id: string): void
}>()
</script>

<template>
  <div
    v-if="student"
    class="fixed inset-0 z-50 bg-[#101828]/45 flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in duration-150"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-[20px] w-full max-w-[420px] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150"
      @click.stop
    >
      <div class="w-[52px] h-[52px] rounded-2xl bg-[#FDECEA] text-[#F04438] inline-flex items-center justify-center mb-3.5">
        <AdminV2Icon name="trash" :size="24" />
      </div>

      <h3 class="text-base font-extrabold text-[#101828]">
        Hapus data siswa?
      </h3>

      <p class="text-[12.5px] text-[#667085] mt-2 leading-relaxed">
        <b class="text-[#101828]">{{ student.name }}</b> (NISN: {{ student.nisn }}) akan dihapus dari Data Induk. Tindakan ini tidak bisa dibatalkan.
      </p>

      <div class="flex items-center justify-center gap-2.5 mt-5">
        <button
          type="button"
          class="px-4 py-2 rounded-full border border-[#E7EBF2] bg-white text-xs font-bold text-[#101828] hover:bg-[#EFF2F7] transition cursor-pointer"
          @click="emit('close')"
        >
          Batal
        </button>

        <button
          type="button"
          class="px-5 py-2 rounded-full bg-[#F04438] text-white text-xs font-bold hover:bg-[#D92D20] transition shadow-sm cursor-pointer"
          @click="emit('confirm', student.id)"
        >
          Ya, Hapus
        </button>
      </div>
    </div>
  </div>
</template>
