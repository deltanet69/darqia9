<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ExamItem, GradeType, CbtTabId } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource } from '~/composables/useAdminCbtData'

interface Props {
  grade: GradeType
  exams: ExamItem[]
  source?: AssessmentSource
}

const props = defineProps<Props>()
const cbtData = useAdminCbtData(props.source ?? 'cbt')

const emit = defineEmits<{
  (e: 'switch-tab', tab: CbtTabId): void
  (e: 'open-drawer', type: string, payload?: any): void
  (e: 'toast', msg: string): void
  (e: 'copy-token', token: string): void
}>()

const examView = ref<'classes' | 'detail'>('classes')
const selectedClass = ref('')
const isCreateModalOpen = ref(false)

const localDateTime = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const emptyExam = () => ({
  id: '',
  name: '',
  classId: '',
  subjectId: '',
  questionBankId: '',
  startsAt: localDateTime(new Date(Date.now() + 86_400_000)),
  duration: 90,
  token: ''
})

const newExam = ref(emptyExam())
const currentExams = computed(() => props.exams.filter(exam => exam.grade === props.grade))
const gradeClasses = computed(() => cbtData.classes.value.filter(item => item.grade === props.grade))
const gradePackages = computed(() => cbtData.bankPackages.value.filter(item => item.grade === props.grade))

const groups = computed(() => gradeClasses.value.map(classItem => ({
  id: classItem.id,
  classroom: classItem.name,
  students: classItem.studentCount,
  subjects: new Set(gradePackages.value.filter(pkg => pkg.classId === classItem.id).map(pkg => pkg.subjectId)).size
})))

const classExams = computed(() => {
  if (!selectedClass.value) return currentExams.value
  return currentExams.value.filter(exam => exam.classroom === selectedClass.value)
})

const availablePackages = computed(() =>
  gradePackages.value.filter(pkg => !newExam.value.classId || pkg.classId === newExam.value.classId)
)

const availableSubjects = computed(() => {
  const ids = new Set(availablePackages.value.map(pkg => pkg.subjectId))
  return cbtData.subjects.value.filter(item => item.grade === props.grade && ids.has(item.id))
})

const openDetail = (classroom: string) => {
  selectedClass.value = classroom
  examView.value = 'detail'
}

const syncPackage = () => {
  const matching = availablePackages.value.find(pkg => pkg.subjectId === newExam.value.subjectId)
  newExam.value.questionBankId = matching?.id ?? ''
}

const openCreateSchedule = (classroom?: string) => {
  const classItem = gradeClasses.value.find(item => item.name === classroom)
    ?? gradeClasses.value.find(item => item.name === selectedClass.value)
    ?? gradeClasses.value[0]
  newExam.value = emptyExam()
  newExam.value.classId = classItem?.id ?? ''
  const firstPackage = gradePackages.value.find(pkg => pkg.classId === newExam.value.classId)
  newExam.value.subjectId = firstPackage?.subjectId ?? ''
  newExam.value.questionBankId = firstPackage?.id ?? ''
  isCreateModalOpen.value = true
}

const openEditSchedule = (exam: ExamItem) => {
  newExam.value = {
    id: exam.id,
    name: exam.name,
    classId: exam.classId ?? '',
    subjectId: exam.subjectId ?? '',
    questionBankId: exam.questionBankId ?? '',
    startsAt: exam.startsAt ? localDateTime(new Date(exam.startsAt)) : localDateTime(new Date()),
    duration: exam.duration,
    token: exam.token
  }
  isCreateModalOpen.value = true
}

const saveSchedule = async () => {
  if (!newExam.value.name.trim()) {
    emit('toast', 'Nama ujian wajib diisi.')
    return
  }
  if (!newExam.value.classId || !newExam.value.subjectId || !newExam.value.questionBankId) {
    emit('toast', 'Pilih kelas, mata pelajaran, dan bank soal yang sesuai.')
    return
  }
  try {
    const token = await cbtData.saveExam({
      ...newExam.value,
      name: newExam.value.name.trim(),
      token: newExam.value.token || undefined
    })
    isCreateModalOpen.value = false
    emit('toast', `Jadwal ujian berhasil disimpan. Token: ${token}`)
  } catch (saveError) {
    emit('toast', saveError instanceof Error ? saveError.message : 'Jadwal ujian gagal disimpan.')
  }
}

const removeSchedule = async (exam: ExamItem) => {
  if (!confirm(`Hapus ujian ${exam.name}?`)) return
  try {
    await cbtData.deleteExam(exam.id)
    emit('toast', 'Ujian berhasil dihapus.')
  } catch (deleteError) {
    emit('toast', deleteError instanceof Error ? deleteError.message : 'Ujian gagal dihapus.')
  }
}

</script>

<template>
  <div class="space-y-4">
    <!-- VIEW 1: CLASSES GRID (vbt-v4) -->
    <div v-if="examView === 'classes'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">Daftar Ujian</h2>
          <p class="text-xs text-[#667085] mt-0.5">Jadwal disusun per rombel agar mudah diperiksa.</p>
        </div>
        <button
          type="button"
          class="px-4 py-2.5 rounded-full bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-extrabold transition shadow-sm inline-flex items-center gap-1.5"
          @click="openCreateSchedule()"
        >
          <AdminV2Icon name="plus" :size="14" />
          <span>Buat Jadwal Ujian</span>
        </button>
      </div>

      <!-- Classes Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <article
          v-for="g in groups"
          :key="g.classroom"
          role="button"
          tabindex="0"
          class="bg-white border border-[#E7EBF2] hover:border-[#1B5FD9] rounded-[18px] p-5 shadow-xs cursor-pointer transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
          @click="openDetail(g.classroom)"
        >
          <div>
            <div class="flex items-center justify-between mb-3.5">
              <span class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
                <AdminV2Icon name="cal" :size="20" />
              </span>
              <span
                class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                :class="currentExams.filter(e => (e.classroom || (e as any).cls) === g.classroom).some(e => e.status === 'Berlangsung')
                  ? 'bg-[#E7F8F0] text-[#087C52]'
                  : currentExams.filter(e => (e.classroom || (e as any).cls) === g.classroom).some(e => e.status === 'Terjadwal')
                    ? 'bg-[#FEF4E5] text-[#AD6504]'
                    : 'bg-[#EFF2F7] text-[#344054]'"
              >
                {{ currentExams.filter(e => (e.classroom || (e as any).cls) === g.classroom).some(e => e.status === 'Berlangsung')
                  ? 'Berlangsung'
                  : currentExams.filter(e => (e.classroom || (e as any).cls) === g.classroom).some(e => e.status === 'Terjadwal')
                    ? 'Terjadwal'
                    : 'Selesai' }}
              </span>
            </div>

            <h3 class="text-base font-extrabold text-[#101828]">{{ g.classroom }}</h3>
            <p class="text-xs text-[#667085] mt-0.5 mb-3">
              {{ g.students }} peserta · {{ g.subjects }} mapel
            </p>

            <div class="flex items-center gap-4 text-xs mt-3">
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">
                  {{ currentExams.filter(e => (e.classroom || (e as any).cls) === g.classroom).length }}
                </b>
                <span class="text-[10px] text-[#667085]">Jadwal tampil</span>
              </div>
              <div>
                <b class="text-sm font-extrabold text-[#101828] block">
                  {{ currentExams.filter(e => (e.classroom || (e as any).cls) === g.classroom).reduce((a, e) => a + (e.violations || (e as any).warn || 0), 0) }}
                </b>
                <span class="text-[10px] text-[#667085]">Peringatan</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 mt-4 border-t border-[#E7EBF2] text-xs font-bold text-[#1B5FD9]">
            <span>Lihat daftar ujian</span>
            <AdminV2Icon name="arrow-right" :size="12" />
          </div>
        </article>
      </div>
      <div v-if="!groups.length" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">
        Belum ada rombel aktif untuk jenjang ini. Layout daftar ujian tetap siap digunakan.
      </div>
    </div>

    <!-- VIEW 2: DETAIL PER KELAS (vbt-v4) -->
    <div v-else-if="examView === 'detail'" class="space-y-4">
      <button
        type="button"
        class="text-xs font-bold text-[#667085] hover:text-[#101828] inline-flex items-center gap-1.5 transition"
        @click="examView = 'classes'; selectedClass = ''"
      >
        <AdminV2Icon name="arrow-left" :size="12" />
        <span>Kembali ke daftar rombel</span>
      </button>

      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">
            Daftar Ujian · {{ selectedClass }}
          </h2>
          <p class="text-xs text-[#667085] mt-0.5">
            Jadwal, peserta, pengawas, dan status pada rombel ini.
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2.5 rounded-full bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-extrabold transition shadow-sm inline-flex items-center gap-1.5"
          @click="openCreateSchedule(selectedClass)"
        >
          <AdminV2Icon name="plus" :size="14" />
          <span>Tambah Ujian</span>
        </button>
      </div>

      <!-- Table Card -->
      <section class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[700px]">
            <thead class="bg-[#FAFBFC] border-b border-[#E7EBF2] text-[10px] uppercase font-extrabold text-[#667085] tracking-wider">
              <tr>
                <th class="py-3 px-4">Ujian</th>
                <th class="py-3 px-4">Jadwal</th>
                <th class="py-3 px-4">Pengawas</th>
                <th class="py-3 px-4 text-center">Peserta</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="e in classExams" :key="e.id" class="hover:bg-[#FAFCFF] transition">
                <td class="py-3 px-4">
                  <div class="cell-title font-extrabold text-[#101828]">{{ e.name }}</div>
                  <div class="text-[10.5px] text-[#667085] mt-0.5">
                    {{ e.subject }} · Token <b class="font-mono text-[#0A2A5C]">{{ e.token }}</b>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div>{{ e.date }}</div>
                  <div class="text-[10.5px] text-[#667085]">{{ e.time }}</div>
                </td>
                <td class="py-3 px-4 font-semibold text-[#344054]">
                  {{ e.supervisor || (e as any).teacher }}
                </td>
                <td class="py-3 px-4 text-center font-mono font-bold">
                  {{ e.participants || e.total }}
                </td>
                <td class="py-3 px-4">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    :class="e.status === 'Berlangsung'
                      ? 'bg-[#E7F8F0] text-[#087C52]'
                      : e.status === 'Terjadwal'
                        ? 'bg-[#FEF4E5] text-[#AD6504]'
                        : 'bg-[#EFF2F7] text-[#344054]'"
                  >
                    {{ e.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="inline-flex items-center gap-3">
                    <button type="button" class="text-xs font-bold text-[#1B5FD9] hover:underline" @click="openEditSchedule(e)">
                      Ubah
                    </button>
                    <button type="button" class="text-xs font-bold text-[#B42318] hover:underline" @click="removeSchedule(e)">
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!classExams.length">
                <td colspan="6" class="py-8 text-center text-xs text-[#667085]">
                  Belum ada ujian contoh di rombel ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- CREATE SCHEDULE MODAL -->
    <Teleport to="body">
      <div
        v-if="isCreateModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
      >
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-[#E7EBF2]">
          <div class="p-5 border-b border-[#E7EBF2] flex items-center justify-between">
            <div>
              <span class="text-[10px] font-extrabold uppercase text-[#1B5FD9] tracking-wider">Form Penjadwalan</span>
              <h3 class="text-base font-extrabold text-[#101828] mt-0.5">{{ newExam.id ? 'Ubah Jadwal Ujian' : 'Buat Jadwal Ujian' }}</h3>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-lg hover:bg-[#EFF2F7] flex items-center justify-center text-[#667085]"
              @click="isCreateModalOpen = false"
            >
              <AdminV2Icon name="x" :size="16" />
            </button>
          </div>

          <div class="p-5 space-y-3.5 text-xs">
            <div class="p-3 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] flex items-center gap-2 font-semibold">
              <AdminV2Icon name="cal" :size="16" class="shrink-0" />
              <span>Form V2 mengikuti field penjadwalan pada aplikasi. Token digenerate otomatis.</span>
            </div>

            <div>
              <label class="block font-bold text-[#344054] mb-1">Nama Ujian *</label>
              <input
                v-model="newExam.name"
                type="text"
                placeholder="Contoh: Penilaian Tengah Semester Informatika"
                class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none focus:border-[#1B5FD9]"
              >
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-[#344054] mb-1">Mata Pelajaran</label>
                <select
                  v-model="newExam.subjectId"
                  @change="syncPackage"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none"
                >
                  <option value="" disabled>Pilih mata pelajaran</option>
                  <option v-for="s in availableSubjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-[#344054] mb-1">Rombel</label>
                <select
                  v-model="newExam.classId"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none"
                  @change="newExam.subjectId = ''; newExam.questionBankId = ''"
                >
                  <option value="" disabled>Pilih rombel</option>
                  <option v-for="c in gradeClasses" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-[#344054] mb-1">Tanggal dan Waktu Mulai</label>
                <input
                  v-model="newExam.startsAt"
                  type="datetime-local"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none"
                >
              </div>
              <div>
                <label class="block font-bold text-[#344054] mb-1">Durasi (menit)</label>
                <input
                  v-model="newExam.duration"
                  type="number"
                  min="1"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none"
                >
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-[#E7EBF2] bg-[#FAFBFC] flex items-center justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-white"
              @click="isCreateModalOpen = false"
            >
              Batal
            </button>
            <button
              type="button"
              class="px-5 py-2 rounded-xl bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm"
              @click="saveSchedule"
            >
              Simpan Jadwal
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
