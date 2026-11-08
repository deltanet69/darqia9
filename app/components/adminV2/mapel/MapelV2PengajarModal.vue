<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import type { AdminSubject } from '~/composables/useAdminSubjects'

defineProps<{ subject: AdminSubject | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="subject"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pengajar dan kelas mata pelajaran"
      @click.self="emit('close')"
      @keydown.esc="emit('close')"
    >
      <div class="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-3xl border border-[#E7EBF2] bg-white shadow-2xl sm:rounded-3xl">
        <div class="flex items-start justify-between gap-3 border-b border-[#F1F5F9] p-5">
          <div class="min-w-0">
            <span class="font-mono text-[11px] font-bold text-[#1B5FD9]">{{ subject.code }}</span>
            <h3 class="mt-0.5 break-words text-base font-extrabold text-[#101828]">{{ subject.name }}</h3>
            <p class="mt-0.5 text-xs text-[#667085]">{{ subject.teachers.length }} guru &middot; {{ subject.scheduledClasses }} kelas terjadwal</p>
          </div>
          <button type="button" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-[#667085] hover:text-[#101828]" aria-label="Tutup" @click="emit('close')">
            <AdminV2Icon name="x" :size="16" />
          </button>
        </div>

        <ul class="divide-y divide-[#F1F5F9] overflow-y-auto px-5">
          <li v-for="a in subject.assignments" :key="a.teacher" class="py-3.5">
            <b class="block break-words text-sm font-bold" :class="a.teacher ? 'text-[#101828]' : 'text-[#B54708]'">{{ a.teacher || 'Belum ada guru' }}</b>
            <div class="mt-1.5 flex flex-wrap gap-1.5">
              <span v-for="kelas in a.classes" :key="kelas" class="rounded-lg border border-[#B2CCFF] bg-[#EFF4FF] px-2.5 py-1 text-[11px] font-bold text-[#1B5FD9]">{{ kelas }}</span>
            </div>
          </li>
        </ul>

        <p class="border-t border-[#F1F5F9] p-4 text-[11px] text-[#667085]">Diambil dari Jadwal Pelajaran. Untuk mengubah pengajar, atur di Jadwal Pelajaran per kelas.</p>
      </div>
    </div>
  </Teleport>
</template>
