<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminCbtState, type StudentResult } from '~/composables/useAdminCbtState'
import AdminIcon from '~/components/admin/AdminIcon.vue'

const { results, allResults, grade } = useAdminCbtState()

const viewMode = ref<'classes' | 'students' | 'essay'>('classes')
const selectedClass = ref<string>('')
const selectedStudentForEssay = ref<StudentResult | null>(null)
const inputEssayScore = ref<number>(20)

// Filters
const searchQuery = ref('')
const filterStatus = ref('all')

const smkClassResults = [
  { name: 'X RPL 1', count: 40, avg: 82.4, graded: 38, needGrading: 2, passed: 36 },
  { name: 'XI RPL 1', count: 40, avg: 79.2, graded: 40, needGrading: 0, passed: 35 },
  { name: 'XII TKJ 1', count: 38, avg: 85.0, graded: 38, needGrading: 0, passed: 37 }
]

const smpClassResults = [
  { name: 'VII-A', count: 44, avg: 84.5, graded: 44, needGrading: 0, passed: 42 },
  { name: 'VIII-B', count: 44, avg: 78.0, graded: 44, needGrading: 0, passed: 39 },
  { name: 'IX-A', count: 44, avg: 81.2, graded: 44, needGrading: 0, passed: 40 }
]

const activeClassSummaries = computed(() => {
  return grade.value === 'SMP' ? smpClassResults : smkClassResults
})

const openClassResults = (clsName: string) => {
  selectedClass.value = clsName
  viewMode.value = 'students'
}

const openEssayCorrection = (student: StudentResult) => {
  selectedStudentForEssay.value = student
  inputEssayScore.value = student.essayScore || 20
  viewMode.value = 'essay'
}

const saveEssayScore = () => {
  if (selectedStudentForEssay.value) {
    selectedStudentForEssay.value.essayScore = inputEssayScore.value
    selectedStudentForEssay.value.totalScore = selectedStudentForEssay.value.pgScore + inputEssayScore.value
    selectedStudentForEssay.value.essayStatus = 'Sudah Dikoreksi'
    selectedStudentForEssay.value.status = selectedStudentForEssay.value.totalScore >= 75 ? 'Lulus' : 'Remedial'
    if (selectedStudentForEssay.value.essayAnswers?.[0]) {
      selectedStudentForEssay.value.essayAnswers[0].score = inputEssayScore.value
    }
  }
  alert('Nilai esai berhasil disimpan dan nilai akhir telah diperbarui!')
  viewMode.value = 'students'
}

const exportClassResultsCsv = () => {
  const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Nilai PG (Otomatis)', 'Nilai Esai (Manual)', 'Total Nilai', 'Status', 'Waktu Submit']
  const rows = filteredStudents.value.map((s, idx) => [
    idx + 1,
    `"${s.nisn}"`,
    `"${s.name}"`,
    `"${s.classroom}"`,
    s.pgScore,
    s.essayScore ?? 0,
    s.totalScore,
    `"${s.status}"`,
    `"${s.submittedAt}"`
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Rekap_Nilai_${selectedClass.value || grade.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const filteredStudents = computed(() => {
  return results.value.filter(s => {
    const matchClass = selectedClass.value ? s.classroom === selectedClass.value : true
    const matchStatus = filterStatus.value === 'all' || s.status === filterStatus.value
    const matchSearch = !searchQuery.value.trim() ||
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.nisn.includes(searchQuery.value)
    return matchClass && matchStatus && matchSearch
  })
})
</script>

<template>
  <div class="space-y-6">
    <!-- MODE 1: GRID KELAS -->
    <template v-if="viewMode === 'classes'">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-emerald-500 before:to-teal-600 before:shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
            Rekapitulasi Nilai Siswa per Rombel
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5 ml-3.5 font-medium">
            Koreksi otomatis pilihan ganda, verifikasi penilaian esai, dan unduh laporan kelulusan
          </p>
        </div>

        <button
          class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/80 shadow-xs transition"
          type="button"
          @click="exportClassResultsCsv"
        >
          <AdminIcon name="dl" size="16" class="text-slate-500" />
          <span>Export Seluruh Nilai</span>
        </button>
      </div>

      <!-- Class Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <article
          v-for="cls in activeClassSummaries"
          :key="cls.name"
          class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          @click="openClassResults(cls.name)"
        >
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                <AdminIcon name="check" size="20" />
              </span>
              <span
                v-if="cls.needGrading > 0"
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
              >
                {{ cls.needGrading }} Perlu Koreksi Esai
              </span>
              <span
                v-else
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                Koreksi Lengkap
              </span>
            </div>

            <h4 class="text-xl font-bold text-slate-900 tracking-tight">{{ cls.name }}</h4>
            <p class="text-xs text-slate-500 mt-1 font-medium">{{ cls.count }} Siswa Mengikuti Ujian</p>

            <!-- Stats Block -->
            <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 mt-4 text-center">
              <div>
                <span class="block text-[11px] font-semibold text-slate-500">Rata-rata Nilai</span>
                <span class="text-xl font-extrabold text-slate-900 font-mono">{{ cls.avg }}</span>
              </div>
              <div>
                <span class="block text-[11px] font-semibold text-emerald-600">Tingkat Kelulusan</span>
                <span class="text-xl font-extrabold text-emerald-700 font-mono">{{ Math.round((cls.passed / cls.count) * 100) }}%</span>
              </div>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 font-mono">{{ cls.passed }}/{{ cls.count }} Tuntas (KKM 75)</span>
            <span class="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
              <span>Buka Nilai</span>
              <AdminIcon name="arr" size="14" />
            </span>
          </div>
        </article>
      </div>
    </template>

    <!-- MODE 2: REKAP DETAIL SISWA PER KELAS -->
    <template v-if="viewMode === 'students'">
      <!-- Breadcrumb & actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button
            class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 shadow-xs transition"
            type="button"
            @click="viewMode = 'classes'"
          >
            &larr; Semua Kelas
          </button>
          <div>
            <h3 class="text-lg font-bold text-slate-900 tracking-tight">
              Rekap Nilai: <span class="text-blue-600">{{ selectedClass }}</span>
            </h3>
            <p class="text-xs text-slate-500 font-medium">Daftar perolehan nilai siswa, hasil pilihan ganda, dan esai</p>
          </div>
        </div>

        <button
          class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/80 shadow-xs transition"
          type="button"
          @click="exportClassResultsCsv"
        >
          <AdminIcon name="dl" size="16" class="text-slate-500" />
          <span>Export Excel / CSV</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-4 shadow-xs">
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex-1 min-w-[220px] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition">
            <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
            <input
              v-model="searchQuery"
              placeholder="Cari nama siswa atau NISN..."
              class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </label>

          <select v-model="filterStatus" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none transition">
            <option value="all">Semua Status</option>
            <option value="Lulus">Lulus (Tuntas)</option>
            <option value="Remedial">Remedial</option>
            <option value="Belum Selesai">Belum Selesai / Perlu Koreksi</option>
          </select>
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead class="bg-slate-50/90 text-xs font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th class="px-4 py-3.5 w-12 text-center">No</th>
                <th class="px-4 py-3.5">Nama Siswa</th>
                <th class="px-4 py-3.5 font-mono">NISN</th>
                <th class="px-4 py-3.5 text-center">Nilai PG</th>
                <th class="px-4 py-3.5 text-center">Nilai Esai</th>
                <th class="px-4 py-3.5 text-center font-bold">Total Nilai</th>
                <th class="px-4 py-3.5 text-center">Status</th>
                <th class="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="filteredStudents.length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <div class="text-sm font-semibold text-slate-700">Tidak ada data nilai yang sesuai</div>
                  <div class="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian.</div>
                </td>
              </tr>
              <tr v-for="(s, idx) in filteredStudents" :key="s.id" class="hover:bg-blue-50/30 transition">
                <td class="px-4 py-3.5 text-center font-mono text-slate-400">{{ idx + 1 }}</td>
                <td class="px-4 py-3.5 font-bold text-slate-900">{{ s.name }}</td>
                <td class="px-4 py-3.5 font-mono text-slate-500">{{ s.nisn }}</td>
                <td class="px-4 py-3.5 text-center font-mono font-semibold text-slate-800">{{ s.pgScore }}</td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    v-if="s.essayScore !== null"
                    class="font-mono font-semibold text-slate-800"
                  >
                    {{ s.essayScore }}
                  </span>
                  <span
                    v-else-if="s.essayStatus === 'Perlu Koreksi'"
                    class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    Perlu Koreksi
                  </span>
                  <span v-else class="text-slate-400 font-mono">-</span>
                </td>
                <td class="px-4 py-3.5 text-center font-mono font-extrabold text-sm" :class="s.totalScore >= 75 ? 'text-emerald-700' : 'text-rose-700'">
                  {{ s.totalScore }}
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-block"
                    :class="{
                      'bg-emerald-50 text-emerald-700 border border-emerald-200': s.status === 'Lulus',
                      'bg-rose-50 text-rose-700 border border-rose-200': s.status === 'Remedial',
                      'bg-amber-50 text-amber-700 border border-amber-200': s.status === 'Belum Selesai'
                    }"
                  >
                    {{ s.status }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <button
                    v-if="s.essayAnswers && s.essayAnswers.length"
                    class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition border border-blue-200/60"
                    type="button"
                    @click="openEssayCorrection(s)"
                  >
                    {{ s.essayStatus === 'Perlu Koreksi' ? 'Koreksi Esai' : 'Review Esai' }}
                  </button>
                  <span v-else class="text-slate-400 text-xs font-medium">Otomatis Selesai</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- MODE 3: KOREKSI ESAI MANUAL -->
    <template v-if="viewMode === 'essay' && selectedStudentForEssay">
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-6 shadow-xs max-w-3xl mx-auto space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-900 tracking-tight">Koreksi Jawaban Esai Siswa</h3>
            <p class="text-xs text-slate-500 mt-0.5 font-medium">
              Siswa: <strong>{{ selectedStudentForEssay.name }}</strong> ({{ selectedStudentForEssay.classroom }})
            </p>
          </div>
          <button
            class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            type="button"
            @click="viewMode = 'students'"
          >
            Kembali
          </button>
        </div>

        <div v-if="selectedStudentForEssay.essayAnswers && selectedStudentForEssay.essayAnswers.length" class="space-y-4">
          <div
            v-for="(ans, idx) in selectedStudentForEssay.essayAnswers"
            :key="idx"
            class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3"
          >
            <div>
              <span class="text-xs font-bold text-blue-700 block mb-1">Pertanyaan Esai #{{ idx + 1 }}</span>
              <p class="text-xs sm:text-sm font-semibold text-slate-900">{{ ans.question }}</p>
            </div>

            <div class="p-3 bg-white rounded-lg border border-slate-200 text-xs">
              <span class="text-slate-500 font-bold block mb-1">Jawaban Siswa:</span>
              <p class="text-slate-800 font-medium leading-relaxed">{{ ans.studentAnswer }}</p>
            </div>

            <div class="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
              <span class="font-bold block mb-1">Panduan Rubrik Jawaban Benar:</span>
              <p>{{ ans.rubric }}</p>
            </div>

            <!-- Score input -->
            <div class="pt-2 flex items-center gap-3">
              <label class="text-xs font-bold text-slate-700">Bobot Nilai Esai (0 - 25):</label>
              <input
                v-model.number="inputEssayScore"
                type="number"
                min="0"
                max="25"
                class="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div class="text-xs text-slate-500">
            Nilai PG: <span class="font-mono font-bold text-slate-800">{{ selectedStudentForEssay.pgScore }}</span> + Esai: <span class="font-mono font-bold text-blue-700">{{ inputEssayScore }}</span> = Total: <strong class="font-mono text-emerald-700 text-sm">{{ selectedStudentForEssay.pgScore + inputEssayScore }}</strong>
          </div>
          <button
            class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            type="button"
            @click="saveEssayScore"
          >
            Simpan &amp; Perbarui Nilai Akhir
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
