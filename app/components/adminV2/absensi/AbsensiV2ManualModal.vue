<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { PresensiRecord } from './absensiV2Data'

interface Props {
  record: PresensiRecord | null
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { id: string; status: PresensiRecord['status']; timeIn: string; note: string; gate: string }): void
}>()

const status = ref<PresensiRecord['status']>('Hadir')
const timeIn = ref('')
const note = ref('')
const gate = ref('Gate 1 · Utama')

watch(() => props.record, (newVal) => {
  if (newVal) {
    status.value = newVal.status
    timeIn.value = newVal.timeIn !== '—' ? newVal.timeIn : '06:45'
    note.value = newVal.note || ''
    gate.value = newVal.gate !== '—' ? newVal.gate : 'Gate 1 · Utama'
  }
}, { immediate: true })

const handleSave = () => {
  if (!props.record) return
  emit('save', {
    id: props.record.id,
    status: status.value,
    timeIn: (status.value === 'Hadir' || status.value === 'Terlambat') ? timeIn.value : '—',
    note: note.value.trim(),
    gate: (status.value === 'Hadir' || status.value === 'Terlambat') ? gate.value : '—'
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="record"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-[#101828]/50 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Modal Card -->
      <div
        class="relative bg-white rounded-[20px] max-w-md w-full shadow-[0_20px_50px_rgba(16,24,40,0.18)] border border-[#E7EBF2] p-5 sm:p-6 z-10 animate-in fade-in zoom-in-95 duration-150"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3.5 border-b border-[#F2F4F7]">
          <div>
            <h3 class="font-extrabold text-[16px] text-[#101828]">
              Ubah Status Presensi
            </h3>
            <p class="text-xs text-[#667085] mt-0.5">
              {{ record.name }} &bull; Kelas {{ record.className }}
            </p>
          </div>

          <button
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-[#667085] hover:bg-[#EFF2F7] transition cursor-pointer"
            aria-label="Tutup"
            @click="emit('close')"
          >
            <AdminV2Icon name="x" :size="18" />
          </button>
        </div>

        <!-- Form Content -->
        <div class="space-y-4 py-4 text-[13px]">
          <!-- Pilihan Status Kehadiran -->
          <div>
            <label class="block font-bold text-[#344054] mb-1.5">
              Status Kehadiran <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="st in (['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpa'] as const)"
                :key="st"
                type="button"
                class="py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center"
                :class="status === st
                  ? st === 'Alpa'
                    ? 'bg-[#FDECEA] border-[#F04438] text-[#B42318]'
                    : st === 'Terlambat'
                      ? 'bg-[#FEF4E5] border-[#F79009] text-[#B54708]'
                      : st === 'Hadir'
                        ? 'bg-[#E7F8F0] border-[#12B76A] text-[#067647]'
                        : 'bg-[#E8F0FE] border-[#1B5FD9] text-[#12459B]'
                  : 'bg-white border-[#E7EBF2] text-[#475467] hover:bg-[#F8FAFD]'"
                @click="status = st"
              >
                {{ st }}
              </button>
            </div>
          </div>

          <!-- Jam Masuk (Hanya jika Hadir / Terlambat) -->
          <div v-if="status === 'Hadir' || status === 'Terlambat'">
            <label class="block font-bold text-[#344054] mb-1.5">
              Waktu Tap Masuk
            </label>
            <input
              v-model="timeIn"
              type="text"
              placeholder="06:30"
              class="w-full px-3.5 py-2.5 bg-white border border-[#E7EBF2] rounded-xl text-xs font-mono font-bold text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]"
            />
          </div>

          <!-- Gate RFID -->
          <div v-if="status === 'Hadir' || status === 'Terlambat'">
            <label class="block font-bold text-[#344054] mb-1.5">
              Lokasi Gate Masuk
            </label>
            <select
              v-model="gate"
              class="w-full px-3.5 py-2.5 bg-white border border-[#E7EBF2] rounded-xl text-xs font-bold text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9]"
            >
              <option value="Gate 1 · Utama">Gate 1 · Utama</option>
              <option value="Gate 2 · Lobi">Gate 2 · Lobi</option>
              <option value="Manual TU">Manual TU (Petugas Piket)</option>
            </select>
          </div>

          <!-- Keterangan / Alasan -->
          <div>
            <label class="block font-bold text-[#344054] mb-1.5">
              Keterangan / Alasan
            </label>
            <textarea
              v-model="note"
              rows="3"
              placeholder="Contoh: Izin keperluan keluarga / Sakit flu surat dokter terlampir"
              class="w-full px-3.5 py-2 bg-white border border-[#E7EBF2] rounded-xl text-xs text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1B5FD9] placeholder:text-[#98A2B3]"
            />
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
          <button
            type="button"
            class="px-4 py-2 rounded-full border border-[#E7EBF2] bg-white text-xs font-bold text-[#344054] hover:bg-[#EFF2F7] transition cursor-pointer"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-full text-xs font-bold text-white transition cursor-pointer"
            :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#154EAE]'"
            @click="handleSave"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
