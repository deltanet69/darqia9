<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../../AdminV2Icon.vue'
import type { ClassGradeItem } from '../kelasV2Data'

interface Props {
  grades: ClassGradeItem[]
  className: string
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'export-grades'): void
  (e: 'import-grades'): void
  (e: 'print-leger'): void
}>()

const selectedSubject = ref(props.jenjang === 'smk' ? 'Pemrograman Berorientasi Objek' : 'Matematika')
const subjects = computed(() => {
  return props.jenjang === 'smk'
    ? ['Pemrograman Berorientasi Objek', 'Basis Data & SQL', 'Administrasi Infrastruktur Jaringan', 'Pendidikan Agama Islam', 'Bahasa Indonesia']
    : ['Matematika', 'Ilmu Pengetahuan Alam', 'Bahasa Indonesia', 'Tahfidz Al-Qur\'an', 'Bahasa Inggris']
})

const avgClass = computed(() => {
  if (!props.grades.length) return 0
  const sum = props.grades.reduce((acc, g) => acc + g.finalScore, 0)
  return Math.round((sum / props.grades.length) * 10) / 10
})

const passCount = computed(() => props.grades.filter(g => g.tuntas).length)
const passPct = computed(() => props.grades.length ? Math.round((passCount.value / props.grades.length) * 100) : 0)
</script>

<template>
  <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-4">
    <!-- Header with Subject Filter & Export -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
      <div>
        <h4 class="text-sm font-extrabold text-[#101828]">
          Template Penilaian Siswa Rombel {{ className }}
        </h4>
        <p class="text-xs text-[#667085] mt-0.5">
          Rumus terstandarisasi: (Tugas &times; 30%) + (UTS &times; 30%) + (UAS &times; 40%) &bull; KKM 75
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Filter Mapel -->
        <select
          v-model="selectedSubject"
          class="px-3 py-1.5 text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#344054] focus:outline-none cursor-pointer"
        >
          <option v-for="sub in subjects" :key="sub" :value="sub">{{ sub }}</option>
        </select>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EFF4FF] hover:bg-[#D1E0FF] text-[#1B5FD9] transition cursor-pointer shadow-xs"
          @click="emit('import-grades')"
        >
          <AdminV2Icon name="plus" :size="13" />
          <span>Impor Nilai Excel</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#344054] transition cursor-pointer shadow-xs"
          @click="emit('export-grades')"
        >
          <AdminV2Icon name="dl" :size="13" />
          <span>Ekspor Excel</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-xs"
          :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#154EBC]'"
          @click="emit('print-leger')"
        >
          <AdminV2Icon name="printer" :size="13" />
          <span>Cetak Leger Nilai</span>
        </button>
      </div>
    </div>

    <!-- Summary KPI Mini Banner -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
        <span class="text-[11px] font-semibold text-[#667085] block">Kriteria Ketuntasan (KKM)</span>
        <b class="text-lg font-mono font-bold text-[#101828] block mt-0.5">75 / 100</b>
      </div>
      <div class="p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
        <span class="text-[11px] font-semibold text-[#667085] block">Rata-rata Nilai Kelas</span>
        <b class="text-lg font-mono font-bold text-[#1B5FD9] block mt-0.5">{{ avgClass }}</b>
      </div>
      <div class="p-3 rounded-xl bg-[#E7F6ED] border border-[#A6E9C5]">
        <span class="text-[11px] font-semibold text-[#14532D] block">Tuntas KKM</span>
        <b class="text-lg font-mono font-bold text-[#166534] block mt-0.5">{{ passCount }} Siswa ({{ passPct }}%)</b>
      </div>
      <div class="p-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA]">
        <span class="text-[11px] font-semibold text-[#912018] block">Perlu Remedial</span>
        <b class="text-lg font-mono font-bold text-[#D92D20] block mt-0.5">{{ grades.length - passCount }} Siswa</b>
      </div>
    </div>

    <!-- Grade Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#F8FAFC] text-[#475467] uppercase tracking-wider font-bold border-b border-[#E7EBF2] text-[10.5px]">
          <tr>
            <th class="py-2.5 px-3">No</th>
            <th class="py-2.5 px-3">Nama Siswa</th>
            <th class="py-2.5 px-3 font-mono">NISN</th>
            <th class="py-2.5 px-3 font-mono text-center">Tugas (30%)</th>
            <th class="py-2.5 px-3 font-mono text-center">UTS (30%)</th>
            <th class="py-2.5 px-3 font-mono text-center">UAS (40%)</th>
            <th class="py-2.5 px-3 font-mono text-center">Nilai Akhir</th>
            <th class="py-2.5 px-3 text-center">Predikat</th>
            <th class="py-2.5 px-3 text-right">Status KKM</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F1F5F9] font-medium text-[#344054]">
          <tr
            v-for="(row, idx) in grades"
            :key="row.studentId"
            class="hover:bg-[#F8FAFC] transition-colors"
          >
            <td class="py-2.5 px-3 font-mono text-[#98A2B3]">{{ idx + 1 }}</td>
            <td class="py-2.5 px-3 font-bold text-[#101828]">{{ row.name }}</td>
            <td class="py-2.5 px-3 font-mono text-xs">{{ row.nisn }}</td>
            <td class="py-2.5 px-3 font-mono text-center">{{ row.tugas }}</td>
            <td class="py-2.5 px-3 font-mono text-center">{{ row.uts }}</td>
            <td class="py-2.5 px-3 font-mono text-center">{{ row.uas }}</td>
            <td class="py-2.5 px-3 font-mono font-extrabold text-center text-[#1B5FD9] text-sm">
              {{ row.finalScore }}
            </td>
            <td class="py-2.5 px-3 text-center">
              <span
                class="w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs"
                :class="{
                  'bg-[#E7F6ED] text-[#166534]': row.predikat === 'A',
                  'bg-[#EFF4FF] text-[#1B5FD9]': row.predikat === 'B',
                  'bg-[#FEF6EE] text-[#B54708]': row.predikat === 'C',
                  'bg-[#FEF3F2] text-[#D92D20]': row.predikat === 'D'
                }"
              >
                {{ row.predikat }}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold"
                :class="row.tuntas ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#FEF3F2] text-[#D92D20]'"
              >
                {{ row.tuntas ? 'Tuntas' : 'Remedial' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
