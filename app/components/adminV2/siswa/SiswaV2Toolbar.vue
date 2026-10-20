<script setup lang="ts">
import { computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import SiswaV2Dropdown from './SiswaV2Dropdown.vue'

interface Props {
  q: string
  kelas: string
  jurusan: string
  gender: string
  rfid: string
  kelasList: string[]
  jurusanList: string[]
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
  (e: 'update:jurusan', val: string): void
  (e: 'update:gender', val: string): void
  (e: 'update:rfid', val: string): void
  (e: 'reset'): void
}>()

const kelasOptions = computed(() => [
  { value: '', label: 'Semua Kelas' },
  ...props.kelasList.map(k => ({ value: k, label: k }))
])

const jurusanOptions = computed(() => [
  { value: '', label: 'Semua Jurusan' },
  ...props.jurusanList.map(j => ({ value: j, label: j }))
])

const genderOptions = [
  { value: '', label: 'L/P' },
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' }
]

const rfidOptions = [
  { value: '', label: 'Smartcard: Semua' },
  { value: 'ada', label: 'Sudah Ada' },
  { value: 'belum', label: 'Belum Ada' }
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
          class="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E7EBF2] rounded-full text-[13px] text-[#101828] min-h-[38px] placeholder:text-[#667085] transition focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
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

      <!-- Dropdown Jurusan (SMK Only) -->
      <SiswaV2Dropdown
        v-if="jenjang === 'smk' && jurusanList.length > 0"
        :model-value="jurusan"
        :options="jurusanOptions"
        :jenjang="jenjang"
        @update:model-value="emit('update:jurusan', $event)"
      />

      <!-- Dropdown Gender -->
      <SiswaV2Dropdown
        :model-value="gender"
        :options="genderOptions"
        :jenjang="jenjang"
        @update:model-value="emit('update:gender', $event)"
      />

      <!-- Dropdown Smartcard -->
      <SiswaV2Dropdown
        :model-value="rfid"
        :options="rfidOptions"
        :jenjang="jenjang"
        align="right"
        @update:model-value="emit('update:rfid', $event)"
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
      Menampilkan {{ showingCount }} dari {{ totalCount }} siswa
    </div>
  </div>
</template>
