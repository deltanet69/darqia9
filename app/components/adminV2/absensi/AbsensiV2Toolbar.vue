<script setup lang="ts">
import { computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import SiswaV2Dropdown from '../siswa/SiswaV2Dropdown.vue'

interface Props {
  q: string
  kelas: string
  status: string
  gate: string
  kelasList: string[]
  jenjang?: 'smp' | 'smk'
  showingCount: number
  totalCount: number
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'update:q', val: string): void
  (e: 'update:kelas', val: string): void
  (e: 'update:status', val: string): void
  (e: 'update:gate', val: string): void
  (e: 'reset'): void
}>()

const kelasOptions = computed(() => [
  { value: '', label: 'Semua Kelas' },
  ...props.kelasList.map(k => ({ value: k, label: k }))
])

const statusOptions = [
  { value: '', label: 'Status: Semua' },
  { value: 'Hadir', label: 'Tepat Waktu' },
  { value: 'Terlambat', label: 'Terlambat' },
  { value: 'Izin', label: 'Izin' },
  { value: 'Sakit', label: 'Sakit' },
  { value: 'Alpa', label: 'Alpa' }
]

const gateOptions = [
  { value: '', label: 'Gate: Semua' },
  { value: 'Gate 1', label: 'Gate 1 · Utama' },
  { value: 'Gate 2', label: 'Gate 2 · Lobi' }
]
</script>

<template>
  <div>
    <!-- Toolbar Filters -->
    <div class="flex flex-wrap items-center gap-2 mb-3.5">
      <!-- Search Input -->
      <div class="relative flex-1 min-w-[170px] max-w-full sm:max-w-xs">
        <AdminV2Icon
          name="search"
          :size="16"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none"
        />
        <input
          :value="q"
          type="text"
          placeholder="Cari nama, NISN, NIS, kelas…"
          class="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E7EBF2] rounded-full text-[13px] text-[#101828] min-h-[38px] placeholder:text-[#667085] transition focus:outline-none focus:ring-2"
          :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
          @input="emit('update:q', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Dropdown Kelas -->
      <SiswaV2Dropdown
        :model-value="kelas"
        :options="kelasOptions"
        :jenjang="jenjang"
        @update:model-value="emit('update:kelas', $event)"
      />

      <!-- Dropdown Status Kehadiran -->
      <SiswaV2Dropdown
        :model-value="status"
        :options="statusOptions"
        :jenjang="jenjang"
        @update:model-value="emit('update:status', $event)"
      />

      <!-- Dropdown Gate RFID -->
      <SiswaV2Dropdown
        :model-value="gate"
        :options="gateOptions"
        :jenjang="jenjang"
        align="right"
        @update:model-value="emit('update:gate', $event)"
      />

      <!-- Reset Filter Button -->
      <button
        type="button"
        class="inline-flex items-center justify-center bg-white border border-[#E7EBF2] rounded-full px-4 py-2 text-[13px] font-semibold text-[#344054] min-h-[38px] cursor-pointer transition hover:bg-[#EFF2F7] hover:border-[#C3CEDD] active:scale-95"
        @click="emit('reset')"
      >
        Reset
      </button>
    </div>

    <!-- Summary Count -->
    <div class="text-[13px] text-[#475467] font-semibold mb-2.5">
      Menampilkan {{ showingCount }} dari {{ totalCount }} presensi hari ini
    </div>
  </div>
</template>
