<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ClassStudentItem, ClassRombel } from './kelasV2Data'

interface Props {
  open: boolean
  student: ClassStudentItem | null
  currentClass: string
  availableClasses: ClassRombel[]
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'move', studentId: string, targetClass: string, reason: string): void
}>()

const targetClass = ref('')
const reason = ref('Pemerataan kuota rombel dan jurusan')

watch(
  () => props.open,
  (val) => {
    if (val) {
      const other = props.availableClasses.filter(c => c.name !== props.currentClass)
      targetClass.value = other[0]?.name || ''
      reason.value = 'Pemerataan kuota rombel dan jurusan'
    }
  }
)

const handleMove = () => {
  if (!targetClass.value || !props.student) return
  emit('move', props.student.id, targetClass.value, reason.value)
}
</script>

<template>
  <div
    v-if="open && student"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/60 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E7EBF2] animate-in fade-in zoom-in-95 duration-200"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-start justify-between pb-3.5 border-b border-[#F1F5F9] mb-4">
        <div>
          <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#1B5FD9] block mb-0.5">
            Mutasi Internal Rombel
          </span>
          <h3 class="text-lg font-extrabold text-[#101828]">Ubah Kelas Peserta Didik</h3>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#EFF2F7] flex items-center justify-center cursor-pointer"
          @click="emit('close')"
        >
          <AdminV2Icon name="x" :size="16" />
        </button>
      </div>

      <!-- Content -->
      <div class="space-y-4">
        <!-- Student Card -->
        <div class="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#EFF4FF] text-[#1B5FD9] font-extrabold flex items-center justify-center shrink-0">
            {{ student.gender }}
          </div>
          <div class="min-w-0">
            <h4 class="font-extrabold text-sm text-[#101828] truncate">{{ student.name }}</h4>
            <p class="text-xs text-[#667085] font-mono">
              NISN: {{ student.nisn }} &bull; Kelas Asal: <strong class="text-[#101828]">{{ currentClass }}</strong>
            </p>
          </div>
        </div>

        <!-- Target Class Selection -->
        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5">
            Pilih Rombel Kelas Tujuan <span class="text-[#F04438]">*</span>
          </label>
          <select
            v-model="targetClass"
            class="w-full px-3.5 py-2.5 text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#101828] focus:bg-white focus:border-[#1B5FD9] focus:outline-none transition cursor-pointer"
          >
            <option
              v-for="c in availableClasses.filter(c => c.name !== currentClass)"
              :key="c.id"
              :value="c.name"
            >
              {{ c.name }} (Wali: {{ c.teacher }} &bull; {{ c.studentsCount }}/{{ c.capacity }} Siswa)
            </option>
          </select>
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1.5">
            Alasan Pemindahan / Catatan Mutasi
          </label>
          <input
            v-model.trim="reason"
            type="text"
            placeholder="Contoh: Penyesuaian peminatan / rekomendasi BK"
            class="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#101828] focus:bg-white focus:border-[#1B5FD9] focus:outline-none transition"
          />
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-4 border-t border-[#F1F5F9] mt-4 flex items-center justify-end gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-[#667085] hover:bg-[#EFF2F7] transition cursor-pointer"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-sm"
          :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#154EBC]'"
          @click="handleMove"
        >
          Konfirmasi Pindah Kelas
        </button>
      </div>
    </div>
  </div>
</template>
