<script setup lang="ts">
import { computed } from 'vue'
import type { AdminSubject } from '~/composables/useAdminSubjects'

interface Props {
  subject: AdminSubject | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deactivate', subject: AdminSubject): void
  (e: 'confirm-delete', subject: AdminSubject): void
}>()

const usedTotal = computed(() => {
  if (!props.subject) return 0
  return props.subject.usage.schedules + props.subject.usage.banks + props.subject.usage.exams
})
</script>

<template>
  <div
    v-if="subject"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#E7EBF2] space-y-4">
      <div class="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">Hapus Mata Pelajaran</h3>
          <p class="text-xs text-[#667085] mt-0.5">{{ subject.name }} &bull; Kode {{ subject.code }} &bull; {{ subject.grade }}</p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-[#F8FAFC] text-[#667085] hover:text-[#101828] flex items-center justify-center font-bold text-sm cursor-pointer transition"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="text-xs text-[#344054] leading-relaxed space-y-2.5">
        <template v-if="usedTotal > 0">
          <p><b>Mapel ini belum bisa dihapus</b> karena sudah dipakai di:</p>
          <p class="font-semibold">
            &bull; Jadwal Pelajaran: {{ subject.usage.schedules }} jadwal<br>
            &bull; Bank Soal: {{ subject.usage.banks }} bank<br>
            &bull; Ujian: {{ subject.usage.exams }} ujian
          </p>
          <p>Menghapusnya akan memutus data-data itu. Jalan amannya: <b>nonaktifkan</b> — mapel hilang dari pilihan baru, tapi data lama tetap utuh.</p>
        </template>
        <p v-else>
          Mapel <b>{{ subject.name }}</b> belum dipakai di jadwal, bank soal, maupun ujian mana pun, jadi aman dihapus permanen.
        </p>
      </div>

      <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-bold text-[#667085] hover:bg-[#F8FAFC] transition cursor-pointer"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          v-if="usedTotal > 0"
          type="button"
          class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer"
          @click="emit('deactivate', subject)"
        >
          Nonaktifkan Saja
        </button>
        <button
          v-else
          type="button"
          class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#B42318] hover:bg-[#912018] transition shadow-xs cursor-pointer"
          @click="emit('confirm-delete', subject)"
        >
          Hapus Permanen
        </button>
      </div>
    </div>
  </div>
</template>
