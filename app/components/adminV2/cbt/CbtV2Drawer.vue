<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import CbtV2DrawerPackageForm from './CbtV2DrawerPackageForm.vue'
import {
  BANK_CLASSES,
  type GradeType,
  type ExamItem,
  type StudentScore,
  type CbtTabId
} from './cbtV2Data'

interface Props {
  open: boolean
  drawerType: string
  payload: any
  grade: GradeType
  students: StudentScore[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'switch-tab', tab: CbtTabId): void
  (e: 'copy-token', token: string): void
  (e: 'save-score', nisn: string, score: number): void
  (e: 'toast', msg: string): void
}>()

const essayInputScore = ref(20)

// Create Exam state
const newExamName = ref('')
const newExamSubject = ref('Informatika')
const newExamClass = ref('X RPL 1')
const newExamDate = ref('')
const newExamTime = ref('08:00 – 09:30')
const newExamDuration = ref(90)
const newExamSupervisor = ref('')

watch(() => props.payload, (val) => {
  if (props.drawerType === 'student' && val) {
    essayInputScore.value = 20
  }
})

const classOptions = computed(() => {
  return BANK_CLASSES[props.grade] || []
})

const subjectOptions = computed(() => {
  return props.grade === 'SMK'
    ? ['Informatika', 'Pemrograman Web', 'Jaringan Komputer', 'Basis Data', 'Matematika', 'PAI', 'Bahasa Inggris']
    : ['PAI', 'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA Terpadu', 'IPS Terpadu', 'Informatika']
})

const sampleParticipants = computed(() => {
  if (props.drawerType !== 'exam' || !props.payload) return []
  const exam = props.payload as any
  const clsName = exam.classroom || exam.cls
  return props.students.filter(s => s.classroom === clsName).slice(0, 4)
})


const handleSaveScore = () => {
  const val = Number(essayInputScore.value)
  if (isNaN(val) || val < 0 || val > 35) {
    emit('toast', 'Nilai esai harus antara 0–35')
    return
  }
  emit('save-score', props.payload.nisn, val)
}

const handleCreateExamSubmit = () => {
  if (!newExamName.value.trim()) {
    emit('toast', 'Nama ujian wajib diisi')
    return
  }
  emit('toast', 'Jadwal pratinjau berhasil disimpan')
  emit('close')
}
</script>

<template>
  <div>
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-[#101828]/45 backdrop-blur-[2px]"
        @click="emit('close')"
      />
    </Transition>

    <!-- Slide-over Drawer Panel -->
    <div
      class="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[520px] bg-white shadow-[-20px_0_60px_rgba(16,24,40,0.16)] flex flex-col transition-transform duration-300 ease-out"
      :class="open ? 'translate-x-0' : 'translate-x-full'"
      role="dialog"
      aria-modal="true"
    >
      <!-- Drawer Head -->
      <div class="p-5 border-b border-[#E7EBF2] flex items-center justify-between gap-3 shrink-0">
        <div>
          <div
            class="text-[10px] uppercase tracking-wider font-extrabold"
            :class="grade === 'SMP' ? 'text-[#16A34A]' : 'text-[#1B5FD9]'"
          >
            {{
              drawerType === 'exam' ? 'Rincian sesi' :
              drawerType === 'student' ? (payload?.essayScore === null ? 'Koreksi esai' : 'Detail peserta') :
              drawerType === 'create-exam' ? 'Form penjadwalan' :
              drawerType === 'import-package' ? 'Import bank soal' :
              drawerType === 'edit-package' ? 'Editor paket' :
              drawerType === 'create-package' ? 'Paket mapel baru' :
              drawerType === 'violation' ? 'Log anti-cheat' :
              drawerType === 'teacher' ? 'Hak akses guru' : 'Detail'
            }}
          </div>
          <h3 class="text-lg font-extrabold text-[#101828] tracking-tight mt-0.5 truncate max-w-[420px]">
            {{
              drawerType === 'exam' ? payload?.name :
              drawerType === 'student' ? payload?.name :
              drawerType === 'create-exam' ? 'Buat Jadwal Ujian' :
              drawerType === 'import-package' ? 'Import Word/Excel' :
              drawerType === 'edit-package' ? 'Kelola Paket Soal' :
              drawerType === 'create-package' ? 'Buat Paket Soal' :
              drawerType === 'violation' ? payload?.name :
              drawerType === 'teacher' ? payload?.name : 'Detail'
            }}
          </h3>
        </div>
        <button
          type="button"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-[#667085] hover:text-[#101828] hover:bg-[#EFF2F7] transition shrink-0"
          aria-label="Tutup"
          @click="emit('close')"
        >
          <AdminV2Icon name="x" :size="18" />
        </button>
      </div>

      <!-- Drawer Body (Scrollable) -->
      <div class="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
        <!-- 1. EXAM DETAILS -->
        <template v-if="drawerType === 'exam' && payload">
          <div
            class="flex items-center gap-2 p-3 rounded-xl font-bold"
            :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon name="screen" :size="16" class="shrink-0" />
            <span>{{ payload.classroom || payload.cls }} · {{ payload.date }} · {{ payload.time }}</span>
          </div>

          <div class="divide-y divide-[#E7EBF2]">
            <div class="py-2.5 flex items-center justify-between">
              <span class="text-[#667085]">Status</span>
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold"
                :class="payload.status === 'Berlangsung' ? 'bg-[#E7F8F0] text-[#087C52]' : 'bg-[#EFF2F7] text-[#344054]'"
              >
                {{ payload.status }}
              </span>
            </div>
            <div class="py-2.5 flex items-center justify-between">
              <span class="text-[#667085]">Pengawas</span>
              <strong class="font-extrabold text-[#101828]">{{ payload.supervisor || payload.teacher }}</strong>
            </div>
            <div class="py-2.5 flex items-center justify-between">
              <span class="text-[#667085]">Token ujian</span>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E7EBF2] bg-[#F9FAFC] font-mono font-bold text-[#101828] hover:bg-white transition"
                @click="emit('copy-token', payload.token)"
              >
                <span>{{ payload.token }}</span>
                <AdminV2Icon name="copy" :size="13" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-2 pt-2">
            <div class="bg-[#EFF2F7] p-2.5 rounded-xl text-center">
              <b class="block text-base font-extrabold text-[#101828]">{{ payload.participants || payload.total }}</b>
              <span class="text-[10px] text-[#667085]">Peserta</span>
            </div>
            <div class="bg-[#EFF2F7] p-2.5 rounded-xl text-center">
              <b class="block text-base font-extrabold text-[#101828]">{{ payload.collected || payload.done }}</b>
              <span class="text-[10px] text-[#667085]">Submit</span>
            </div>
            <div class="bg-[#EFF2F7] p-2.5 rounded-xl text-center">
              <b class="block text-base font-extrabold text-[#101828]">{{ payload.doing }}</b>
              <span class="text-[10px] text-[#667085]">Mengerjakan</span>
            </div>
            <div class="bg-[#EFF2F7] p-2.5 rounded-xl text-center">
              <b class="block text-base font-extrabold" :class="(payload.violations || payload.warn) ? 'text-[#C43232]' : 'text-[#101828]'">
                {{ payload.violations ?? payload.warn ?? 0 }}
              </b>
              <span class="text-[10px] text-[#667085]">Peringatan</span>
            </div>
          </div>


          <div>
            <h4 class="text-xs font-extrabold text-[#101828] mb-2 mt-4">Peserta contoh</h4>
            <div v-if="sampleParticipants.length" class="divide-y divide-[#E7EBF2] border border-[#E7EBF2] rounded-xl px-3 bg-white">
              <div v-for="s in sampleParticipants" :key="s.nisn" class="py-2.5 flex items-center justify-between">
                <div>
                  <strong class="block font-bold text-[#101828]">{{ s.name }}</strong>
                  <span class="text-[10px] text-[#667085]">{{ s.nisn }}</span>
                </div>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                  :class="s.status === 'Lulus' ? 'bg-[#E7F8F0] text-[#087C52]' : 'bg-[#FEF4E5] text-[#AD6504]'"
                >
                  {{ s.status }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- 2. STUDENT DETAIL & ESSAY GRADING -->
        <template v-else-if="drawerType === 'student' && payload">
          <div
            class="flex items-center gap-2 p-3 rounded-xl font-bold"
            :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon name="users" :size="16" class="shrink-0" />
            <span>{{ payload.cls }} · NISN {{ payload.nisn }}</span>
          </div>

          <div class="divide-y divide-[#E7EBF2]">
            <div class="py-2.5 flex items-center justify-between">
              <span class="text-[#667085]">Nilai PG</span>
              <strong class="font-extrabold text-[#101828]">{{ payload.pgScore }}</strong>
            </div>
            <div class="py-2.5 flex items-center justify-between">
              <span class="text-[#667085]">Nilai esai</span>
              <strong class="font-extrabold text-[#101828]">
                {{ payload.essayScore !== null ? payload.essayScore : 'Belum dikoreksi' }}
              </strong>
            </div>
            <div class="py-2.5 flex items-center justify-between">
              <span class="text-[#667085]">Nilai akhir · ambang tuntas 75</span>
              <strong class="font-extrabold text-[#101828]">
                {{ payload.finalScore }} · {{ payload.status }}
              </strong>
            </div>
          </div>

          <div v-if="payload.essayScore === null" class="space-y-3 pt-2">
            <h4 class="text-xs font-extrabold text-[#101828]">Jawaban esai dari data contoh</h4>
            <div class="p-3.5 border border-[#E7EBF2] rounded-xl bg-white space-y-2">
              <strong class="block text-xs font-bold text-[#101828] leading-relaxed">
                Jelaskan perbedaan mendasar antara OOP dengan pemrograman prosedural!
              </strong>
              <div class="p-2.5 bg-[#EFF2F7] rounded-lg text-[11px] text-[#344054]">
                OOP itu berorientasi pada objek nyata seperti mobil dan manusia, prosedural adalah prosedur fungsi biasa.
              </div>
            </div>

            <div>
              <label for="essayScoreInput" class="block text-xs font-bold text-[#667085] mb-1">
                Nilai esai (0–35)
              </label>
              <input
                id="essayScoreInput"
                v-model.number="essayInputScore"
                type="number"
                min="0"
                max="35"
                class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none focus:border-blue-500"
              >
              <p class="text-[11px] text-[#667085] mt-1.5">
                Perubahan di preview langsung tersimpan pada sesi aktif.
              </p>
            </div>
          </div>
        </template>

        <!-- 3. CREATE EXAM FORM -->
        <template v-else-if="drawerType === 'create-exam'">
          <div
            class="flex items-center gap-2 p-3 rounded-xl font-bold"
            :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon name="cal" :size="16" class="shrink-0" />
            <span>Form V2 mengikuti format penjadwalan ujian resmi.</span>
          </div>

          <div class="space-y-3 pt-1">
            <div>
              <label class="block text-xs font-bold text-[#667085] mb-1">Nama ujian *</label>
              <input
                v-model="newExamName"
                type="text"
                placeholder="Contoh: Penilaian Tengah Semester Informatika"
                class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none focus:border-blue-500"
              >
            </div>
            <div>
              <label class="block text-xs font-bold text-[#667085] mb-1">Mata pelajaran</label>
              <select v-model="newExamSubject" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
                <option v-for="s in subjectOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-[#667085] mb-1">Rombel</label>
              <select v-model="newExamClass" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
                <option v-for="c in classOptions" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-[#667085] mb-1">Tanggal ujian</label>
                <input v-model="newExamDate" type="date" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-[#667085] mb-1">Waktu</label>
                <input v-model="newExamTime" type="text" placeholder="08:00 – 09:30" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-[#667085] mb-1">Durasi (menit)</label>
                <input v-model="newExamDuration" type="number" min="1" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-[#667085] mb-1">Pengawas</label>
                <input v-model="newExamSupervisor" type="text" placeholder="Nama guru pengawas" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
              </div>
            </div>
          </div>
        </template>

        <!-- 4. PACKAGE FORMS -->
        <template v-else-if="drawerType === 'import-package' || drawerType === 'create-package' || drawerType === 'edit-package'">
          <CbtV2DrawerPackageForm
            :type="(drawerType as any)"
            :grade="grade"
            :class-options="classOptions"
            :subject-options="subjectOptions"
          />
        </template>

        <!-- 5. VIOLATION DETAIL -->
        <template v-else-if="drawerType === 'violation' && payload">
          <div class="flex items-center gap-2 p-3 rounded-xl bg-[#FDECEA] text-[#C43232] font-bold">
            <AdminV2Icon name="alert" :size="16" class="shrink-0" />
            <span>{{ payload.status }}</span>
          </div>

          <div class="divide-y divide-[#E7EBF2]">
            <div class="py-2.5 flex items-center justify-between">
              <span class="text-[#667085]">Kelas</span>
              <strong class="font-extrabold text-[#101828]">{{ payload.cls }}</strong>
            </div>
            <div class="py-2.5 flex items-center justify-between">
              <span class="text-[#667085]">Waktu terdeteksi</span>
              <strong class="font-extrabold text-[#101828]">{{ payload.time }}</strong>
            </div>
            <div class="py-2.5">
              <span class="block text-[10px] text-[#667085] mb-1">Kejadian</span>
              <strong class="font-bold text-[#101828] leading-relaxed">{{ payload.incident }}</strong>
            </div>
          </div>
        </template>

        <!-- 6. TEACHER ACCESS -->
        <template v-else-if="drawerType === 'teacher' && payload">
          <div class="divide-y divide-[#E7EBF2]">
            <div class="py-2.5">
              <span class="block text-[10px] text-[#667085]">Mata pelajaran</span>
              <strong class="font-extrabold text-[#101828]">{{ payload.subjects }}</strong>
            </div>
            <div class="py-2.5">
              <span class="block text-[10px] text-[#667085]">Peran CBT</span>
              <strong class="font-extrabold text-[#101828]">{{ payload.role }}</strong>
            </div>
          </div>
        </template>
      </div>

      <!-- Drawer Foot -->
      <div class="p-4 sm:p-5 border-t border-[#E7EBF2] bg-white flex items-center justify-end gap-2 shrink-0">
        <template v-if="drawerType === 'exam'">
          <button type="button" class="px-4 py-2 rounded-full border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F9FAFC]" @click="emit('close')">
            Tutup
          </button>
          <button type="button" class="px-4 py-2 rounded-full text-xs font-extrabold bg-[#101828] text-white hover:bg-[#1D2939]" @click="{ emit('close'); emit('switch-tab', 'monitoring') }">
            Monitoring Ujian
          </button>
        </template>

        <template v-else-if="drawerType === 'student'">
          <template v-if="payload?.essayScore === null">
            <button type="button" class="px-4 py-2 rounded-full border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F9FAFC]" @click="emit('close')">
              Batal
            </button>
            <button type="button" class="px-4 py-2 rounded-full text-xs font-extrabold bg-[#101828] text-white hover:bg-[#1D2939]" @click="handleSaveScore">
              Simpan nilai contoh
            </button>
          </template>
          <template v-else>
            <button type="button" class="px-4 py-2 rounded-full border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F9FAFC]" @click="emit('close')">
              Tutup
            </button>
          </template>
        </template>

        <template v-else-if="drawerType === 'create-exam'">
          <button type="button" class="px-4 py-2 rounded-full border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F9FAFC]" @click="emit('close')">
            Batal
          </button>
          <button type="button" class="px-4 py-2 rounded-full text-xs font-extrabold bg-[#101828] text-white hover:bg-[#1D2939]" @click="handleCreateExamSubmit">
            Tinjau jadwal
          </button>
        </template>

        <template v-else-if="drawerType === 'create-package' || drawerType === 'edit-package'">
          <button type="button" class="px-4 py-2 rounded-full border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F9FAFC]" @click="emit('close')">
            Batal
          </button>
          <button type="button" class="px-4 py-2 rounded-full text-xs font-extrabold bg-[#101828] text-white hover:bg-[#1D2939]" @click="{ emit('toast', 'Tinjau paket preview siap'); emit('close') }">
            Tinjau paket
          </button>
        </template>

        <template v-else>
          <button type="button" class="px-4 py-2 rounded-full border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-[#F9FAFC]" @click="emit('close')">
            Tutup
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
