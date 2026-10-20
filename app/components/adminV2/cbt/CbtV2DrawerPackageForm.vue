<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import type { GradeType } from './cbtV2Data'

interface Props {
  type: 'create-package' | 'edit-package' | 'import-package'
  grade: GradeType
  classOptions: string[]
  subjectOptions: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', data?: any): void
}>()

const packageClass = ref('X RPL 1')
const packageSubject = ref('Informatika')
const packageTeacher = ref('')
const packageDifficulty = ref('Sedang')
const formFormat = ref<'PG' | 'Isian' | 'Esai' | 'Interaktif'>('PG')

const formatGuide = computed(() => {
  const map: Record<string, [string, string]> = {
    PG: ['Pilihan ganda', 'Opsi jawaban A–E, kunci benar, dan pilihan lebih dari satu jawaban.'],
    Isian: ['Isian singkat', 'Kunci jawaban dan toleransi penulisan.'],
    Esai: ['Esai', 'Rubrik dan skor maksimal untuk koreksi guru.'],
    Interaktif: ['Soal interaktif', 'Audio atau video dan tipe jawaban terkait.']
  }
  return map[formFormat.value] || ['Format soal', '']
})
</script>

<template>
  <!-- IMPORT PACKAGE -->
  <div v-if="type === 'import-package'" class="space-y-3">
    <div
      class="flex items-center gap-2 p-3 rounded-xl font-bold"
      :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
    >
      <AdminV2Icon name="download" :size="16" class="shrink-0" />
      <span>Alur impor mempertahankan validasi dan pemetaan soal yang sudah ada.</span>
    </div>

    <div class="space-y-3 pt-1">
      <div>
        <span class="block text-[10px] text-[#667085]">Jenjang</span>
        <strong class="font-extrabold text-[#101828]">{{ grade }}</strong>
      </div>
      <div>
        <label class="block text-xs font-bold text-[#667085] mb-1">Rombel</label>
        <select class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
          <option v-for="c in classOptions" :key="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-[#667085] mb-1">Pilih file Word, Excel, atau CSV</label>
        <input
          type="file"
          accept=".doc,.docx,.xls,.xlsx,.csv"
          class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none bg-[#F9FAFC]"
        >
      </div>
      <div class="flex items-center gap-2 p-3 rounded-xl bg-[#FEF4E5] text-[#AD6504] text-xs font-semibold">
        <AdminV2Icon name="alert" :size="16" class="shrink-0" />
        <span>Pratinjau ini tidak mengunggah file. Proses impor asli tetap memakai validasi backend.</span>
      </div>
    </div>
  </div>

  <!-- CREATE / EDIT PACKAGE -->
  <div v-else class="space-y-3">
    <div
      class="flex items-center gap-2 p-3 rounded-xl font-bold"
      :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
    >
      <AdminV2Icon name="book" :size="16" class="shrink-0" />
      <span>Satu paket per mapel, dengan empat format soal dalam alur yang sama.</span>
    </div>

    <div class="space-y-3 pt-1">
      <div>
        <label class="block text-xs font-bold text-[#667085] mb-1">Rombel</label>
        <select v-model="packageClass" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
          <option v-for="c in classOptions" :key="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-[#667085] mb-1">Mata pelajaran</label>
        <select v-model="packageSubject" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
          <option v-for="s in subjectOptions" :key="s">{{ s }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-[#667085] mb-1">Guru penyusun</label>
        <input
          v-model="packageTeacher"
          type="text"
          placeholder="Nama guru penyusun"
          class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none"
        >
      </div>
      <div>
        <label class="block text-xs font-bold text-[#667085] mb-1">Tingkat kesulitan</label>
        <select v-model="packageDifficulty" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
          <option>Mudah</option>
          <option>Sedang</option>
          <option>Sukar</option>
        </select>
      </div>

      <div class="pt-2">
        <h4 class="text-xs font-extrabold text-[#101828] mb-2">
          Susun soal
        </h4>
        <div class="flex items-center gap-1 bg-[#EFF2F7] p-1 rounded-full w-max mb-3">
          <button
            v-for="fmt in (['PG', 'Isian', 'Esai', 'Interaktif'] as const)"
            :key="fmt"
            type="button"
            class="px-3 py-1 rounded-full text-[11px] font-extrabold transition"
            :class="formFormat === fmt ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085]'"
            @click="formFormat = fmt"
          >
            {{ fmt }}
          </button>
        </div>

        <div class="p-3.5 border border-[#E7EBF2] rounded-xl bg-white space-y-2">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
            :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            {{ formFormat }}
          </span>
          <strong class="block text-xs font-bold text-[#101828]">{{ formatGuide[0] }}</strong>
          <p class="text-[11px] text-[#667085]">{{ formatGuide[1] }}</p>
          <textarea
            rows="3"
            placeholder="Tulis pertanyaan di sini..."
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Kunci jawaban / rubrik penilaian"
            class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none focus:border-blue-500"
          >
        </div>
      </div>
    </div>
  </div>
</template>
