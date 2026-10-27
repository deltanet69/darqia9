<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { GradeType, StudentResult } from './cbtV2Data'
import { CLASS_RESULTS, INITIAL_RESULTS } from './cbtV2Data'
import { isArabicText, renderKaTeXHtml } from '~/utils/cbtFormula'

interface Props {
  grade: GradeType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toast', msg: string): void
  (e: 'open-drawer', type: string, payload?: any): void
}>()

// 3 Modes: classes | students | essay
const resultMode = ref<'classes' | 'students' | 'essay'>('classes')
const selectedClass = ref('')
const searchQuery = ref('')
const statusFilter = ref('all')

// Selected student for essay grading
const selectedEssayStudent = ref<StudentResult | null>(null)
const tempEssayScore = ref<number>(20)

// Reactive results store
const results = ref<StudentResult[]>(JSON.parse(JSON.stringify(INITIAL_RESULTS)))

const currentGradeResults = computed(() => {
  return results.value.filter(r => r.grade === props.grade)
})

const classGroups = computed(() => {
  return CLASS_RESULTS[props.grade] || []
})

const filteredStudents = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  const st = statusFilter.value
  return currentGradeResults.value.filter(s => {
    const matchCls = !selectedClass.value || s.classroom === selectedClass.value
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.nisn.includes(q)
    const matchSt = st === 'all'
      ? true
      : st === 'Belum Selesai'
        ? s.status === 'Belum Selesai' || s.essayStatus === 'Perlu Koreksi'
        : s.status === st
    return matchCls && matchQ && matchSt
  })
})

const openClassStudents = (cls: string) => {
  selectedClass.value = cls
  resultMode.value = 'students'
  searchQuery.value = ''
  statusFilter.value = 'all'
}

const openEssayGrading = (student: StudentResult) => {
  selectedEssayStudent.value = student
  tempEssayScore.value = student.essayScore ?? 20
  resultMode.value = 'essay'
}

const saveEssayGrading = () => {
  if (!selectedEssayStudent.value) return
  const s = selectedEssayStudent.value
  s.essayScore = tempEssayScore.value
  s.totalScore = s.pgScore + tempEssayScore.value
  s.essayStatus = 'Sudah Dikoreksi'
  s.status = s.totalScore >= 75 ? 'Lulus' : 'Remedial'
  if (s.essayAnswers && s.essayAnswers[0]) {
    s.essayAnswers[0].score = tempEssayScore.value
  }
  emit('toast', 'Nilai contoh esai diperbarui di preview!')
  resultMode.value = 'students'
}

const exportCsv = (clsFilter: string | null) => {
  const list = clsFilter
    ? currentGradeResults.value.filter(s => s.classroom === clsFilter)
    : currentGradeResults.value

  const rows = list.map((s, i) => [
    i + 1,
    `"${s.nisn}"`,
    `"${s.name}"`,
    `"${s.classroom}"`,
    s.pgScore,
    s.essayScore ?? 'Belum dinilai',
    s.totalScore,
    `"${s.status}"`,
    `"${s.submittedAt}"`
  ].join(','))

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
    'No,NISN,Nama Siswa,Kelas,Nilai PG,Nilai Esai,Nilai Akhir,Status,Waktu Submit',
    ...rows
  ].join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Nilai_${clsFilter || props.grade}_contoh.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  emit('toast', 'Rekap nilai CSV berhasil diunduh.')
}
</script>

<template>
  <div class="space-y-4">
    <!-- VIEW 1: REKAPITULASI ROMBEL (vbt-v4) -->
    <div v-if="resultMode === 'classes'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">Nilai Siswa</h2>
          <p class="text-xs text-[#667085] mt-0.5">
            Rekap per rombel, termasuk koreksi esai dan status ketuntasan.
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2.5 rounded-full border border-[#E7EBF2] bg-white text-xs font-extrabold text-[#344054] hover:bg-[#F3F5F9] transition shadow-xs inline-flex items-center gap-1.5"
          @click="exportCsv(null)"
        >
          <AdminV2Icon name="download" :size="14" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      <!-- Class Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <article
          v-for="c in classGroups"
          :key="c.name"
          role="button"
          tabindex="0"
          class="bg-white border border-[#E7EBF2] hover:border-[#1B5FD9] rounded-[18px] p-5 shadow-xs cursor-pointer transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
          @click="openClassStudents(c.name)"
        >
          <div>
            <div class="flex items-center justify-between mb-3.5">
              <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
                <AdminV2Icon name="users" :size="20" />
              </span>
              <span
                class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                :class="c.needGrading > 0 ? 'bg-[#FEF4E5] text-[#AD6504]' : 'bg-[#E7F8F0] text-[#087C52]'"
              >
                {{ c.needGrading > 0 ? `${c.needGrading} perlu koreksi` : 'Tuntas' }}
              </span>
            </div>

            <h3 class="text-base font-extrabold text-[#101828]">{{ c.name }}</h3>
            <p class="text-xs text-[#667085] mt-0.5 mb-3.5">
              {{ c.count }} siswa · rata-rata {{ c.avg }}
            </p>

            <div class="flex items-center gap-4 text-xs mb-3">
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">{{ c.graded }}/{{ c.count }}</b>
                <span class="text-[10px] text-[#667085]">Dinilai</span>
              </div>
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">{{ c.passed }}</b>
                <span class="text-[10px] text-[#667085]">Tuntas</span>
              </div>
            </div>

            <div class="w-full h-1.5 rounded-full bg-[#EFF2F7] overflow-hidden">
              <div
                class="h-full bg-[#1B5FD9] rounded-full"
                :style="{ width: `${Math.round((c.graded / c.count) * 100)}%` }"
              />
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 mt-4 border-t border-[#E7EBF2] text-xs font-bold text-[#1B5FD9]">
            <span>Buka daftar nilai</span>
            <AdminV2Icon name="arrow-right" :size="12" />
          </div>
        </article>
      </div>
    </div>

    <!-- VIEW 2: DAFTAR SISWA (STUDENTS) (vbt-v4) -->
    <div v-else-if="resultMode === 'students'" class="space-y-4">
      <button
        type="button"
        class="text-xs font-bold text-[#667085] hover:text-[#101828] inline-flex items-center gap-1.5 transition"
        @click="resultMode = 'classes'; selectedClass = ''"
      >
        <AdminV2Icon name="arrow-left" :size="12" />
        <span>Kembali ke rombel</span>
      </button>

      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">
            Nilai Siswa · {{ selectedClass }}
          </h2>
          <p class="text-xs text-[#667085] mt-0.5">
            Periksa nilai objektif, esai, dan status ketuntasan.
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2 rounded-full border border-[#E7EBF2] bg-white text-xs font-extrabold text-[#344054] hover:bg-[#F3F5F9] transition shadow-xs inline-flex items-center gap-1.5"
          @click="exportCsv(selectedClass)"
        >
          <AdminV2Icon name="download" :size="14" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      <!-- Toolstrip -->
      <section class="bg-white border border-[#E7EBF2] rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <AdminV2Icon name="search" :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama atau NISN"
            class="w-full bg-[#F9FAFC] border border-[#E7EBF2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#101828] outline-none focus:bg-white focus:border-[#1B5FD9]"
          >
        </div>

        <select
          v-model="statusFilter"
          class="border border-[#E7EBF2] rounded-xl px-3 py-2 text-xs font-bold text-[#344054] bg-white outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="all">Semua Status</option>
          <option value="Lulus">Lulus</option>
          <option value="Remedial">Remedial</option>
          <option value="Belum Selesai">Perlu Koreksi</option>
        </select>
      </section>

      <!-- Table Card -->
      <section class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[720px]">
            <thead class="bg-[#FAFBFC] border-b border-[#E7EBF2] text-[10px] uppercase font-extrabold text-[#667085] tracking-wider">
              <tr>
                <th class="py-3 px-4">Siswa</th>
                <th class="py-3 px-3">NISN</th>
                <th class="py-3 px-3 text-center">Nilai PG</th>
                <th class="py-3 px-3 text-center">Esai</th>
                <th class="py-3 px-3 text-center">Nilai Akhir</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="s in filteredStudents" :key="s.id" class="hover:bg-[#FAFCFF] transition">
                <td class="py-3 px-4">
                  <div class="cell-title font-extrabold text-[#101828]">{{ s.name }}</div>
                  <div class="text-[10.5px] text-[#667085]">{{ s.classroom }}</div>
                </td>
                <td class="py-3 px-3 font-mono text-[#667085]">{{ s.nisn }}</td>
                <td class="py-3 px-3 text-center font-mono font-bold">{{ s.pgScore }}</td>
                <td class="py-3 px-3 text-center">
                  <span v-if="s.essayScore !== null" class="font-mono font-bold">{{ s.essayScore }}</span>
                  <span v-else class="text-[#98A2B3] italic text-[11px]">Belum dinilai</span>
                </td>
                <td class="py-3 px-3 text-center font-mono font-extrabold text-sm">
                  <b>{{ s.totalScore }}</b>
                </td>
                <td class="py-3 px-3 text-center">
                  <span
                    class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                    :class="s.status === 'Lulus'
                      ? 'bg-[#E7F8F0] text-[#087C52]'
                      : s.status === 'Remedial'
                        ? 'bg-[#FDECEA] text-[#C43232]'
                        : 'bg-[#FEF4E5] text-[#AD6504]'"
                  >
                    {{ s.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    class="text-xs font-bold text-[#1B5FD9] hover:underline inline-flex items-center gap-1"
                    @click="openEssayGrading(s)"
                  >
                    <span>{{ s.essayScore === null ? 'Koreksi esai' : 'Detail' }}</span>
                    <AdminV2Icon name="arrow-right" :size="12" />
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredStudents.length">
                <td colspan="7" class="py-8 text-center text-xs text-[#667085]">
                  Siswa tidak ditemukan pada filter ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-3 border-t border-[#E7EBF2] bg-[#FAFBFC] text-xs text-[#667085]">
          Data contoh dari repo · ambang tuntas 75
        </div>
      </section>
    </div>

    <!-- VIEW 3: ESSAY GRADING IN-PLACE FORM (vbt-v4) -->
    <div v-else-if="resultMode === 'essay' && selectedEssayStudent" class="max-w-3xl mx-auto space-y-4">
      <button
        type="button"
        class="text-xs font-bold text-[#667085] hover:text-[#101828] inline-flex items-center gap-1.5 transition"
        @click="resultMode = 'students'"
      >
        <AdminV2Icon name="arrow-left" :size="12" />
        <span>Kembali ke daftar nilai</span>
      </button>

      <section class="bg-white border border-[#E7EBF2] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <!-- Callout -->
        <div class="p-3.5 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] flex items-center gap-2.5 text-xs font-bold">
          <AdminV2Icon name="users" :size="16" />
          <span>{{ selectedEssayStudent.classroom }} · NISN {{ selectedEssayStudent.nisn }}</span>
        </div>

        <div class="grid grid-cols-3 gap-3 border-b border-[#E7EBF2] pb-4">
          <div>
            <span class="block text-[10px] text-[#667085]">Nilai PG</span>
            <b class="text-xl font-mono font-extrabold text-[#101828]">{{ selectedEssayStudent.pgScore }}</b>
          </div>
          <div>
            <span class="block text-[10px] text-[#667085]">Nilai Esai</span>
            <b class="text-xl font-mono font-extrabold text-[#1B5FD9]">
              {{ selectedEssayStudent.essayScore !== null ? selectedEssayStudent.essayScore : 'Belum dikoreksi' }}
            </b>
          </div>
          <div>
            <span class="block text-[10px] text-[#667085]">Nilai Akhir (Ambang 75)</span>
            <b class="text-xl font-mono font-extrabold text-[#087C52]">{{ selectedEssayStudent.totalScore }} · {{ selectedEssayStudent.status }}</b>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-extrabold text-[#101828] mb-2">Jawaban esai dari data contoh</h4>
          <div v-for="(answer, index) in selectedEssayStudent.essayAnswers || []" :key="index" class="p-3.5 rounded-xl border border-[#E7EBF2] bg-[#F9FAFC] space-y-2 text-xs">
            <div class="overflow-x-auto font-bold text-[#101828]" :dir="isArabicText(answer.question) ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(answer.question)" />
            <div class="overflow-x-auto text-[#475467] leading-relaxed p-2.5 bg-white rounded-lg border border-[#E7EBF2]" :dir="isArabicText(answer.studentAnswer) ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(answer.studentAnswer)" />
            <div class="overflow-x-auto text-[#475467]" :dir="isArabicText(answer.rubric) ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(answer.rubric)" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-bold text-[#344054]">Nilai esai (0–35)</label>
          <input
            v-model.number="tempEssayScore"
            type="number"
            min="0"
            max="35"
            class="w-full sm:w-48 border border-[#E7EBF2] rounded-xl p-2.5 text-sm font-mono font-bold text-[#101828] outline-none focus:border-[#1B5FD9]"
          >
          <p class="text-[11px] text-[#667085]">Perubahan di preview hanya terlihat selama halaman ini terbuka.</p>
        </div>

        <div class="pt-3 border-t border-[#E7EBF2] flex items-center justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F3F5F9]"
            @click="resultMode = 'students'"
          >
            Batal
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-xl bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm"
            @click="saveEssayGrading"
          >
            Simpan Nilai Contoh
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
