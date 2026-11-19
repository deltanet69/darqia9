<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ExamItem, GradeType } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource, type EsaiKoreksi } from '~/composables/useAdminCbtData'
import { rekapNilai, statusNilai, type NilaiPenugasan, type StatusNilai } from '~/utils/cbtNilai'
import { isArabicText, renderKaTeXHtml } from '~/utils/cbtFormula'

interface Props {
  grade: GradeType
  source?: AssessmentSource
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toast', msg: string): void
  (e: 'open-drawer', type: string, payload?: any): void
}>()

const cbtData = useAdminCbtData(props.source ?? 'cbt')

// 3 Modes: classes | students | essay
const resultMode = ref<'classes' | 'students' | 'essay'>('classes')
const selectedClassId = ref('')
const selectedExamId = ref('')
const searchQuery = ref('')
const statusFilter = ref('all')

// Ujian jenjang ini dalam cakupan RBAC akun (urut terbaru dulu, dari useAdminCbtData).
const exams = computed(() => cbtData.exams.value.filter(e => e.grade === props.grade && cbtData.dalamCakupanSaya(e.classId, e.subjectId)))
const examById = computed(() => new Map(exams.value.map(e => [e.id, e])))

type Baris = NilaiPenugasan & { exam: ExamItem, label: StatusNilai }
const rows = ref<NilaiPenugasan[]>([])
const memuat = ref(false)
const galat = ref('')
const baris = computed<Baris[]>(() => rows.value.flatMap((r) => {
  const exam = examById.value.get(r.examId)
  return exam ? [{ ...r, exam, label: statusNilai(r, exam.kkm, exam.status === 'Selesai') }] : []
}))

const muat = async () => {
  if (memuat.value) return
  memuat.value = true
  try {
    rows.value = await cbtData.loadNilai(exams.value.map(e => e.id))
    galat.value = ''
  } catch (e: any) {
    galat.value = e?.message ?? 'Nilai siswa gagal dimuat.'
  } finally {
    memuat.value = false
  }
}

// Nilai keluar saat siswa menekan Kumpulkan; tab ini menyegarkan tiap 15 detik (sama dengan Monitoring).
let timer: ReturnType<typeof setInterval> | null = null
watch(() => exams.value.map(e => e.id).join(), () => void muat(), { immediate: true })
onMounted(() => {
  void cbtData.load()
  timer = setInterval(async () => {
    if (document.hidden || resultMode.value === 'essay') return
    await cbtData.load(true, true)
    await muat()
  }, 15_000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

const classGroups = computed(() => cbtData.classes.value
  .filter(c => c.grade === props.grade && exams.value.some(e => e.classId === c.id))
  .map((c) => {
    // Ujian yang belum dimulai tidak dihitung agar progres "Dinilai" tidak tampak tertinggal.
    const milik = baris.value.filter(b => b.exam.classId === c.id && b.exam.status !== 'Terjadwal')
    return { id: c.id, name: c.name, count: c.studentCount, ...rekapNilai(milik.map(b => ({ status: b.label, nilai: b.nilai }))) }
  }))

const selectedClass = computed(() => cbtData.classes.value.find(c => c.id === selectedClassId.value)?.name ?? '')
const classExams = computed(() => exams.value.filter(e => e.classId === selectedClassId.value))

const filteredStudents = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  const st = statusFilter.value
  return baris.value.filter(s => s.examId === selectedExamId.value
    && (!q || s.nama.toLowerCase().includes(q) || (s.nisn ?? '').includes(q) || (s.nis ?? '').includes(q))
    && (st === 'all' || s.label === st))
})

const openClassStudents = (classId: string) => {
  selectedClassId.value = classId
  selectedExamId.value = (classExams.value.find(e => e.status !== 'Terjadwal') ?? classExams.value[0])?.id ?? ''
  resultMode.value = 'students'
  searchQuery.value = ''
  statusFilter.value = 'all'
}

// Koreksi esai: guru mengisi 0-100 per soal, disimpan sebagai porsi bobot soal (cbt_koreksi_esai).
const persen = (skor: number, bobot: number) => bobot ? Math.round(skor / bobot * 100) : 0
const selectedEssayStudent = ref<Baris | null>(null)
const esai = ref<(EsaiKoreksi & { input: number | null })[]>([])
const memuatEsai = ref(false)
const menyimpan = ref(false)
const bolehKoreksi = computed(() => cbtData.bolehAksi('results', 'ubah', true))

const openEssayGrading = async (student: Baris) => {
  selectedEssayStudent.value = student
  resultMode.value = 'essay'
  esai.value = []
  memuatEsai.value = true
  try {
    esai.value = (await cbtData.loadEsai(student.id)).map(e => ({ ...e, input: e.skor === null ? null : persen(e.skor, e.bobot) }))
  } catch (e: any) {
    emit('toast', e?.message ?? 'Jawaban esai gagal dimuat.')
  } finally {
    memuatEsai.value = false
  }
}

const saveEssayGrading = async () => {
  const s = selectedEssayStudent.value
  if (!s || menyimpan.value) return
  const ubah = esai.value.filter(e => e.input !== null && (e.skor === null || e.input !== persen(e.skor, e.bobot)))
  if (ubah.some(e => !Number.isFinite(e.input) || e.input! < 0 || e.input! > 100)) {
    emit('toast', 'Nilai esai harus 0 sampai 100.')
    return
  }
  menyimpan.value = true
  try {
    for (const e of ubah) await cbtData.koreksiEsai(s.id, e.questionId, e.input! / 100)
    await muat()
    emit('toast', ubah.length ? 'Nilai esai tersimpan.' : 'Tidak ada perubahan nilai.')
    resultMode.value = 'students'
  } catch (e: any) {
    emit('toast', e?.message ?? 'Nilai esai gagal disimpan.')
  } finally {
    menyimpan.value = false
  }
}

const csvSel = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
const exportCsv = (classId: string | null) => {
  const list = classId ? baris.value.filter(b => b.exam.classId === classId) : baris.value
  const rows = list.map((s, i) => [
    i + 1,
    csvSel(s.nisn),
    csvSel(s.nama),
    csvSel(s.exam.classroom),
    csvSel(s.exam.subject),
    csvSel(s.exam.name),
    s.objektif,
    s.esaiSoal ? s.esai : '-',
    s.nilai ?? '',
    s.exam.kkm,
    csvSel(s.label),
    csvSel(s.submittedAt ? new Date(s.submittedAt).toLocaleString('id-ID') : '')
  ].join(','))

  const csvContent = '\uFEFF' + [
    'No,NISN,Nama Siswa,Kelas,Mapel,Ujian,Nilai Objektif,Nilai Esai,Nilai Akhir,KKM,Status,Waktu Submit',
    ...rows
  ].join('\n')

  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }))
  link.download = `Nilai_${classId ? selectedClass.value || props.grade : props.grade}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
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

      <p v-if="galat" class="p-3 rounded-xl bg-[#FDECEA] text-[#C43232] text-xs font-bold">{{ galat }}</p>
      <p v-else-if="!classGroups.length" class="p-6 rounded-2xl border border-[#E7EBF2] bg-white text-center text-xs text-[#667085]">
        {{ cbtData.loading.value || memuat ? 'Memuat nilai siswa...' : 'Belum ada ujian pada jenjang ini.' }}
      </p>

      <!-- Class Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <article
          v-for="c in classGroups"
          :key="c.id"
          role="button"
          tabindex="0"
          class="bg-white border border-[#E7EBF2] hover:border-[#1B5FD9] rounded-[18px] p-5 shadow-xs cursor-pointer transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
          @click="openClassStudents(c.id)"
          @keydown.enter="openClassStudents(c.id)"
        >
          <div>
            <div class="flex items-center justify-between mb-3.5">
              <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
                <AdminV2Icon name="users" :size="20" />
              </span>
              <span
                class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                :class="c.perluKoreksi > 0 ? 'bg-[#FEF4E5] text-[#AD6504]' : c.dinilai ? 'bg-[#E7F8F0] text-[#087C52]' : 'bg-[#EFF2F7] text-[#667085]'"
              >
                {{ c.perluKoreksi > 0 ? `${c.perluKoreksi} perlu koreksi` : c.dinilai ? 'Tuntas' : 'Belum ada nilai' }}
              </span>
            </div>

            <h3 class="text-base font-extrabold text-[#101828]">{{ c.name }}</h3>
            <p class="text-xs text-[#667085] mt-0.5 mb-3.5">
              {{ c.count }} siswa · rata-rata {{ c.rata ?? '-' }}
            </p>

            <div class="flex items-center gap-4 text-xs mb-3">
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">{{ c.dinilai }}/{{ c.peserta }}</b>
                <span class="text-[10px] text-[#667085]">Dinilai</span>
              </div>
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">{{ c.tuntas }}</b>
                <span class="text-[10px] text-[#667085]">Tuntas</span>
              </div>
            </div>

            <div class="w-full h-1.5 rounded-full bg-[#EFF2F7] overflow-hidden">
              <div
                class="h-full bg-[#1B5FD9] rounded-full"
                :style="{ width: `${c.peserta ? Math.round((c.dinilai / c.peserta) * 100) : 0}%` }"
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
        @click="resultMode = 'classes'; selectedClassId = ''"
      >
        <AdminV2Icon name="back" :size="12" />
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
          @click="exportCsv(selectedClassId)"
        >
          <AdminV2Icon name="download" :size="14" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      <!-- Toolstrip -->
      <section class="bg-white border border-[#E7EBF2] rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <select
          v-model="selectedExamId"
          aria-label="Pilih ujian"
          class="border border-[#E7EBF2] rounded-xl px-3 py-2 text-xs font-bold text-[#344054] bg-white outline-none cursor-pointer w-full sm:w-auto sm:max-w-xs"
        >
          <option v-for="e in classExams" :key="e.id" :value="e.id">
            {{ e.subject }} · {{ e.name }} · {{ e.date }}
          </option>
        </select>
        <div class="relative flex-1 w-full">
          <AdminV2Icon name="search" :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama, NIS, atau NISN"
            class="w-full bg-[#F9FAFC] border border-[#E7EBF2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#101828] outline-none focus:bg-white focus:border-[#1B5FD9]"
          >
        </div>

        <select
          v-model="statusFilter"
          class="border border-[#E7EBF2] rounded-xl px-3 py-2 text-xs font-bold text-[#344054] bg-white outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="all">Semua Status</option>
          <option value="Tuntas">Tuntas</option>
          <option value="Remedial">Remedial</option>
          <option value="Perlu Koreksi">Perlu Koreksi</option>
          <option value="Belum Selesai">Belum Selesai</option>
          <option value="Tidak Ikut">Tidak Ikut</option>
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
                <th class="py-3 px-3 text-center">Nilai Objektif</th>
                <th class="py-3 px-3 text-center">Esai</th>
                <th class="py-3 px-3 text-center">Nilai Akhir</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="s in filteredStudents" :key="s.id" class="hover:bg-[#FAFCFF] transition">
                <td class="py-3 px-4">
                  <div class="cell-title font-extrabold text-[#101828]">{{ s.nama }}</div>
                  <div class="text-[10.5px] text-[#667085]">{{ s.exam.classroom }} · NIS {{ s.nis || '-' }}</div>
                </td>
                <td class="py-3 px-3 font-mono text-[#667085]">{{ s.nisn || '-' }}</td>
                <td class="py-3 px-3 text-center font-mono font-bold">{{ s.status === 'selesai' ? s.objektif : '-' }}</td>
                <td class="py-3 px-3 text-center">
                  <span v-if="!s.esaiSoal || s.status !== 'selesai'" class="text-[#98A2B3]">-</span>
                  <span v-else-if="s.menunggu" class="text-[#AD6504] italic text-[11px]">Belum dinilai</span>
                  <span v-else class="font-mono font-bold">{{ s.esai }}</span>
                </td>
                <td class="py-3 px-3 text-center font-mono font-extrabold text-sm">
                  <b>{{ s.nilai ?? '-' }}</b>
                </td>
                <td class="py-3 px-3 text-center">
                  <span
                    class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                    :class="s.label === 'Tuntas'
                      ? 'bg-[#E7F8F0] text-[#087C52]'
                      : s.label === 'Remedial' || s.label === 'Tidak Ikut'
                        ? 'bg-[#FDECEA] text-[#C43232]'
                        : 'bg-[#FEF4E5] text-[#AD6504]'"
                  >
                    {{ s.label }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    v-if="s.status === 'selesai' && s.esaiSoal"
                    type="button"
                    class="text-xs font-bold text-[#1B5FD9] hover:underline inline-flex items-center gap-1"
                    @click="openEssayGrading(s)"
                  >
                    <span>{{ s.menunggu ? 'Koreksi esai' : 'Detail esai' }}</span>
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
          Nilai = jumlah skor tiap soal (bobot 100 / jumlah soal) · KKM {{ classExams.find(e => e.id === selectedExamId)?.kkm ?? 75 }} · diperbarui otomatis tiap 15 detik
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
        <AdminV2Icon name="back" :size="12" />
        <span>Kembali ke daftar nilai</span>
      </button>

      <section class="bg-white border border-[#E7EBF2] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <!-- Callout -->
        <div class="p-3.5 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] flex items-center gap-2.5 text-xs font-bold">
          <AdminV2Icon name="users" :size="16" />
          <span>{{ selectedEssayStudent.nama }} · {{ selectedEssayStudent.exam.classroom }} · NISN {{ selectedEssayStudent.nisn || '-' }}</span>
        </div>

        <div class="grid grid-cols-3 gap-3 border-b border-[#E7EBF2] pb-4">
          <div>
            <span class="block text-[10px] text-[#667085]">Nilai Objektif</span>
            <b class="text-xl font-mono font-extrabold text-[#101828]">{{ selectedEssayStudent.objektif }}</b>
          </div>
          <div>
            <span class="block text-[10px] text-[#667085]">Nilai Esai</span>
            <b class="text-xl font-mono font-extrabold text-[#1B5FD9]">
              {{ selectedEssayStudent.menunggu ? 'Belum dikoreksi' : selectedEssayStudent.esai }}
            </b>
          </div>
          <div>
            <span class="block text-[10px] text-[#667085]">Nilai Akhir (KKM {{ selectedEssayStudent.exam.kkm }})</span>
            <b class="text-xl font-mono font-extrabold text-[#087C52]">{{ selectedEssayStudent.nilai ?? '-' }} · {{ selectedEssayStudent.label }}</b>
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="text-xs font-extrabold text-[#101828]">Jawaban esai · {{ selectedEssayStudent.exam.subject }}</h4>
          <p v-if="memuatEsai" class="text-xs text-[#667085]">Memuat jawaban esai...</p>
          <div v-for="answer in esai" :key="answer.questionId" class="p-3.5 rounded-xl border border-[#E7EBF2] bg-[#F9FAFC] space-y-2 text-xs">
            <div class="overflow-x-auto font-bold text-[#101828]" :dir="isArabicText(answer.pertanyaan) ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(answer.pertanyaan)" />
            <div class="overflow-x-auto text-[#475467] leading-relaxed p-2.5 bg-white rounded-lg border border-[#E7EBF2]" :dir="isArabicText(answer.jawaban || '') ? 'rtl' : 'ltr'" v-html="answer.jawaban ? renderKaTeXHtml(answer.jawaban) : '<i>Tidak dijawab</i>'" />
            <div v-if="answer.jawabanPasti || answer.rubrik" class="overflow-x-auto text-[#475467]" :dir="isArabicText(answer.jawabanPasti || answer.rubrik || '') ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(answer.jawabanPasti || answer.rubrik || '')" />
            <label class="flex items-center gap-2 pt-1">
              <span class="font-bold text-[#344054]">Skor soal (0–100)</span>
              <input
                v-model.number="answer.input"
                type="number"
                min="0"
                max="100"
                :disabled="!bolehKoreksi"
                placeholder="Belum dinilai"
                class="w-28 border border-[#E7EBF2] rounded-xl p-2 text-sm font-mono font-bold text-[#101828] outline-none focus:border-[#1B5FD9] disabled:bg-[#F3F5F9]"
              >
              <span class="text-[11px] text-[#667085]">bobot {{ answer.bobot }} poin</span>
            </label>
          </div>
          <p class="text-[11px] text-[#667085]">Skor esai dari AI saat siswa mengumpulkan bisa diubah guru. Nilai akhir dihitung ulang otomatis.</p>
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
            v-if="bolehKoreksi"
            type="button"
            :disabled="menyimpan || memuatEsai"
            class="px-5 py-2 rounded-xl bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm disabled:opacity-60"
            @click="saveEssayGrading"
          >
            {{ menyimpan ? 'Menyimpan...' : 'Simpan Nilai Esai' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
