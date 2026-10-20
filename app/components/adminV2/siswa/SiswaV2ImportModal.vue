<script setup lang="ts">
import { ref } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'

interface Props {
  open: boolean
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import-data', mode: 'append' | 'replace'): void
  (e: 'download-template'): void
}>()

const importMode = ref<'append' | 'replace'>('append')
const selectedFileName = ref('')

const handleFileSelect = () => {
  selectedFileName.value = 'contoh-data-siswa.csv'
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 bg-[#101828]/45 flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in duration-150"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-[20px] w-full max-w-[500px] shadow-2xl p-5 sm:p-6 relative animate-in zoom-in-95 duration-150"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-3.5">
        <h3 class="text-base font-extrabold text-[#101828]">
          Import Data Siswa (CSV)
        </h3>
        <button
          type="button"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition cursor-pointer"
          aria-label="Tutup modal"
          @click="emit('close')"
        >
          <AdminV2Icon name="x" :size="18" />
        </button>
      </div>

      <!-- File Drop Area -->
      <div
        role="button"
        tabindex="0"
        class="border-2 border-dashed border-[#E7EBF2] rounded-2xl p-6 text-center bg-[#F8FAFD] cursor-pointer transition hover:border-[#1B5FD9] hover:bg-[#E8F0FE] group"
        :class="jenjang === 'smp' ? 'hover:border-[#16A34A] hover:bg-[#E7F6ED]' : 'hover:border-[#1B5FD9] hover:bg-[#E8F0FE]'"
        @click="handleFileSelect"
      >
        <div class="w-12 h-12 rounded-xl bg-[#EFF2F7] group-hover:bg-white text-[#667085] group-hover:text-[#101828] flex items-center justify-center mx-auto transition">
          <AdminV2Icon name="upload" :size="24" />
        </div>
        <div class="font-extrabold text-[13px] text-[#101828] mt-2.5">
          {{ selectedFileName || 'Klik untuk pilih file CSV' }}
        </div>
        <div class="text-[11.5px] text-[#667085] mt-1">
          Format: Nama, NISN, NIS, Kelas, L/P, No HP…
        </div>
      </div>

      <!-- Mode Radios -->
      <div class="grid grid-cols-2 gap-2.5 my-4">
        <label
          class="flex items-center gap-2 text-[12.5px] font-semibold border rounded-xl p-3 cursor-pointer transition"
          :class="importMode === 'append' ? 'border-[#1B5FD9] bg-[#E8F0FE]/40 text-[#12459B]' : 'border-[#E7EBF2] bg-white text-[#344054] hover:bg-[#EFF2F7]'"
        >
          <input
            v-model="importMode"
            type="radio"
            name="impmode"
            value="append"
            class="accent-[#1B5FD9]"
          />
          <span>Append <span class="font-normal text-[#667085]">(gabung)</span></span>
        </label>

        <label
          class="flex items-center gap-2 text-[12.5px] font-semibold border rounded-xl p-3 cursor-pointer transition"
          :class="importMode === 'replace' ? 'border-[#F04438] bg-[#FDECEA]/40 text-[#B42318]' : 'border-[#E7EBF2] bg-white text-[#344054] hover:bg-[#EFF2F7]'"
        >
          <input
            v-model="importMode"
            type="radio"
            name="impmode"
            value="replace"
            class="accent-[#F04438]"
          />
          <span>Replace <span class="font-normal text-[#667085]">(timpa)</span></span>
        </label>
      </div>

      <!-- Info Banner -->
      <div class="bg-[#E8F0FE] border border-[#C9DCFB] text-[#0A2A5C] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs leading-relaxed mb-4">
        <AdminV2Icon name="info" :size="18" class="shrink-0 mt-0.5 text-[#1B5FD9]" />
        <span>
          Unduh
          <button
            type="button"
            class="font-extrabold underline hover:text-[#12459B] cursor-pointer"
            @click.prevent="emit('download-template')"
          >
            template CSV
          </button>
          agar kolom sesuai. Baris yang tidak lengkap akan dilewati otomatis.
        </span>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EFF2F7]">
        <button
          type="button"
          class="px-4 py-2 rounded-full border border-[#E7EBF2] bg-white text-xs font-bold text-[#101828] hover:bg-[#EFF2F7] transition cursor-pointer"
          @click="emit('close')"
        >
          Batal
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold transition shadow-sm cursor-pointer"
          :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#174FB5]'"
          @click="emit('import-data', importMode)"
        >
          <AdminV2Icon name="check" :size="14" />
          Terapkan Import
        </button>
      </div>
    </div>
  </div>
</template>
