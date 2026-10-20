<script setup lang="ts">
import { ref } from 'vue'
import AdminV2Icon from '../../AdminV2Icon.vue'

interface Props {
  open: boolean
  className: string
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported', fileName: string): void
}>()

const selectedFile = ref<File | null>(null)
const selectedSubject = ref('Pemrograman Berorientasi Objek')

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleImport = () => {
  if (!selectedFile.value) {
    alert('Silakan pilih file Excel (.xlsx / .csv) terlebih dahulu.')
    return
  }
  emit('imported', selectedFile.value.name)
  emit('close')
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E7EBF2] space-y-4">
      <div class="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">Impor Nilai Siswa Excel</h3>
          <p class="text-xs text-[#667085] mt-0.5">Unggah berkas rekapitulasi nilai rombel {{ className }}</p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-[#F8FAFC] text-[#667085] hover:text-[#101828] flex items-center justify-center font-bold text-sm cursor-pointer transition"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-[#344054] mb-1">Mata Pelajaran</label>
          <select
            v-model="selectedSubject"
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-bold text-[#101828] outline-none focus:border-[#1B5FD9]"
          >
            <option value="Pemrograman Berorientasi Objek">Pemrograman Berorientasi Objek</option>
            <option value="Basis Data & SQL">Basis Data &amp; SQL</option>
            <option value="Matematika Terapan">Matematika Terapan</option>
            <option value="Pendidikan Agama Islam">Pendidikan Agama Islam</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-[#344054] mb-1">Pilih File Spreadsheet (.xlsx, .csv)</label>
          <div class="border-2 border-dashed border-[#D0D5DD] hover:border-[#1B5FD9] rounded-2xl p-6 text-center transition cursor-pointer bg-[#F8FAFC]">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              class="hidden"
              id="grade-file-input"
              @change="handleFileChange"
            />
            <label for="grade-file-input" class="cursor-pointer space-y-2 block">
              <div class="w-10 h-10 rounded-2xl bg-[#EFF4FF] text-[#1B5FD9] flex items-center justify-center mx-auto">
                <AdminV2Icon name="dl" :size="20" class="rotate-180" />
              </div>
              <div class="font-extrabold text-xs text-[#101828]">
                {{ selectedFile ? selectedFile.name : 'Klik untuk memilih berkas Excel' }}
              </div>
              <p class="text-[11px] text-[#667085]">Maksimal 5MB sesuai format standar Kurikulum Merdeka</p>
            </label>
          </div>
        </div>
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
          type="button"
          class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer flex items-center gap-1.5"
          @click="handleImport"
        >
          <AdminV2Icon name="check" :size="13" />
          <span>Unggah &amp; Proses</span>
        </button>
      </div>
    </div>
  </div>
</template>
