<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { ExamItem, GradeType, CbtTabId } from './cbtV2Data'
import { BANK_CLASSES, BANK_SUBJECTS } from './cbtV2Data'

interface Props {
  grade: GradeType
  exams: ExamItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'switch-tab', tab: CbtTabId): void
  (e: 'open-drawer', type: string, payload?: any): void
  (e: 'toast', msg: string): void
  (e: 'copy-token', token: string): void
}>()

const examView = ref<'classes' | 'detail'>('classes')
const selectedClass = ref('')

// Create Schedule Modal State
const isCreateModalOpen = ref(false)
const newExam = ref({
  name: '',
  classroom: 'X RPL 1',
  subject: 'Informatika',
  date: '2026-10-10',
  time: '08:00 – 09:30',
  duration: 90,
  supervisor: ''
})

const groups = computed(() => {
  if (props.grade === 'SMK') {
    return [
      { classroom: 'X RPL 1', students: 40, subjects: 4 },
      { classroom: 'XII TKJ 1', students: 38, subjects: 5 },
      { classroom: 'XI RPL 1', students: 40, subjects: 4 }
    ]
  }
  return [
    { classroom: 'IX-A', students: 44, subjects: 6 },
    { classroom: 'VIII-B', students: 44, subjects: 6 },
    { classroom: 'VII-A', students: 44, subjects: 4 }
  ]
})

const currentExams = computed(() => {
  return props.exams.filter(e => ((e as any).grade === props.grade || e.g === props.grade))
})

const classExams = computed(() => {
  if (!selectedClass.value) return currentExams.value
  return currentExams.value.filter(e => (e.classroom || (e as any).cls) === selectedClass.value)
})

const openDetail = (cls: string) => {
  selectedClass.value = cls
  examView.value = 'detail'
}

const openCreateSchedule = (cls?: string) => {
  newExam.value.classroom = cls || selectedClass.value || groups.value[0]?.classroom || 'X RPL 1'
  newExam.value.subject = BANK_SUBJECTS[props.grade][0] || 'Informatika'
  newExam.value.supervisor = props.grade === 'SMK' ? 'Bpk. Budi Santoso, S.Kom' : 'Bpk. Ahmad Dahlan, S.Pd'
  isCreateModalOpen.value = true
}

const saveNewSchedule = () => {
  if (!newExam.value.name.trim()) {
    emit('toast', 'Nama ujian wajib diisi!')
    return
  }
  const subj = newExam.value.subject.trim() || 'Ujian'
  const token = subj.slice(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900)
  props.exams.push({
    id: `E${Date.now()}`,
    name: newExam.value.name.trim(),
    subject: subj,
    classroom: newExam.value.classroom,
    grade: props.grade,
    date: newExam.value.date,
    time: newExam.value.time,
    duration: Number(newExam.value.duration) || 90,
    participants: 40,
    status: 'Terjadwal',
    average: 0,
    kkm: 75,
    token,
    collected: 0,
    doing: 0,
    violations: 0,
    supervisor: newExam.value.supervisor
  })
  isCreateModalOpen.value = false
  emit('toast', `Jadwal ujian berhasil disimpan! Token: ${token}`)
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
                  <button
                    type="button"
                    class="text-xs font-bold text-[#1B5FD9] hover:underline inline-flex items-center gap-1"
                    @click="emit('open-drawer', 'exam', e)"
                  >
                    <span>Detail</span>
                    <AdminV2Icon name="arrow-right" :size="12" />
                  </button>
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
              <h3 class="text-base font-extrabold text-[#101828] mt-0.5">Buat Jadwal Ujian</h3>
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
                  v-model="newExam.subject"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none"
                >
                  <option v-for="s in BANK_SUBJECTS[grade]" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-[#344054] mb-1">Rombel</label>
                <select
                  v-model="newExam.classroom"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none"
                >
                  <option v-for="c in BANK_CLASSES[grade]" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-[#344054] mb-1">Tanggal</label>
                <input
                  v-model="newExam.date"
                  type="text"
                  placeholder="10 Okt 2026"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none"
                >
              </div>
              <div>
                <label class="block font-bold text-[#344054] mb-1">Waktu</label>
                <input
                  v-model="newExam.time"
                  type="text"
                  placeholder="08:00 – 09:30"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none"
                >
              </div>
              <div>
                <label class="block font-bold text-[#344054] mb-1">Durasi (menit)</label>
                <input
                  v-model="newExam.duration"
                  type="number"
                  class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none"
                >
              </div>
            </div>

            <div>
              <label class="block font-bold text-[#344054] mb-1">Guru Pengawas</label>
              <input
                v-model="newExam.supervisor"
                type="text"
                placeholder="Nama guru pengawas"
                class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none"
              >
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
              @click="saveNewSchedule"
            >
              Simpan Jadwal
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
