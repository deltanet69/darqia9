<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminCbtState, type Exam } from '~/composables/useAdminCbtState'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminSlideOver from '~/components/admin/AdminSlideOver.vue'

const { exams, allExams, grade, activeTab } = useAdminCbtState()

const viewMode = ref<'classes' | 'detail'>('classes')
const selectedClass = ref<string>('')
const selectedExamViolations = ref<Exam | null>(null)
const isViolationModalOpen = ref(false)
const isCreateExamModalOpen = ref(false)

// New Exam Form
const newExamName = ref('')
const newExamSubject = ref('Informatika')
const newExamClass = ref('')
const newExamDate = ref('10 Okt 2026')
const newExamTime = ref('08:00 - 09:30')
const newExamDuration = ref(90)
const newExamSupervisor = ref('Bpk. Budi Santoso, S.Kom')

const smkExamGroups = [
  { classroom: 'X RPL 1', students: 40, date: '30 Sep - 5 Okt 2026', status: 'Berlangsung', supervisor: 'Bpk. Budi Santoso, S.Kom', subjects: 4 },
  { classroom: 'XII TKJ 1', students: 38, date: '30 Sep - 5 Okt 2026', status: 'Berlangsung', supervisor: 'Ibu Siti Aminah, S.Pd', subjects: 5 },
  { classroom: 'XI RPL 1', students: 40, date: '25 Sep - 29 Sep 2026', status: 'Selesai', supervisor: 'Bpk. Budi Santoso, S.Kom', subjects: 4 }
]

const smpExamGroups = [
  { classroom: 'IX-A', students: 44, date: '2 Okt - 8 Okt 2026', status: 'Terjadwal', supervisor: 'Bpk. Ahmad Dahlan, S.Pd', subjects: 6 },
  { classroom: 'VIII-B', students: 44, date: '5 Okt - 10 Okt 2026', status: 'Terjadwal', supervisor: 'Ibu Rina Marlina, M.Pd', subjects: 6 },
  { classroom: 'VII-A', students: 44, date: '27 Sep - 29 Sep 2026', status: 'Selesai', supervisor: 'Ust. Hendra Gunawan, S.Pd.I', subjects: 4 }
]

const activeGroups = computed(() => {
  return grade.value === 'SMP' ? smpExamGroups : smkExamGroups
})

const openClassDetail = (cls: string) => {
  selectedClass.value = cls
  viewMode.value = 'detail'
}

const openViolationsModal = (exam: Exam) => {
  selectedExamViolations.value = exam
  isViolationModalOpen.value = true
}

const closeViolationsModal = () => {
  isViolationModalOpen.value = false
  selectedExamViolations.value = null
}

const openCreateModal = () => {
  newExamClass.value = selectedClass.value || (activeGroups.value[0]?.classroom || 'X RPL 1')
  newExamName.value = ''
  isCreateExamModalOpen.value = true
}

const saveNewExam = () => {
  if (!newExamName.value.trim()) {
    alert('Nama ujian wajib diisi!')
    return
  }

  const generatedToken = (newExamSubject.value.slice(0, 3) + Math.floor(100 + Math.random() * 900)).toUpperCase()

  allExams.value.push({
    id: `E${Date.now()}`,
    name: newExamName.value,
    subject: newExamSubject.value,
    classroom: newExamClass.value,
    grade: grade.value,
    date: newExamDate.value,
    time: newExamTime.value,
    duration: newExamDuration.value,
    participants: 40,
    status: 'Terjadwal',
    average: 0,
    kkm: 75,
    token: generatedToken,
    collected: 0,
    doing: 0,
    violations: 0,
    supervisor: newExamSupervisor.value
  })

  isCreateExamModalOpen.value = false
  alert('Jadwal ujian berhasil ditambahkan!')
}

const classExams = computed(() => {
  return exams.value.filter(e => e.classroom === selectedClass.value || !selectedClass.value)
})

const statusBadgeClass = (status: string) => {
  if (status === 'Berlangsung') return 'bg-purple-50 text-purple-700 border-purple-200'
  if (status === 'Selesai') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}
</script>

<template>
  <div class="space-y-6">
    <!-- MODE 1: GRID KELAS -->
    <template v-if="viewMode === 'classes'">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
            Daftar &amp; Jadwal Sesi Ujian per Rombel
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5 ml-3.5 font-medium">
            Pilih kelas untuk melihat jadwal mata pelajaran lengkap, status pengawasan, dan detail pelanggaran
          </p>
        </div>

        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition"
          type="button"
          @click="openCreateModal"
        >
          <AdminIcon name="plus" size="16" />
          <span>Tambah Jadwal Ujian</span>
        </button>
      </div>

      <!-- Class Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <article
          v-for="group in activeGroups"
          :key="group.classroom"
          class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          @click="openClassDetail(group.classroom)"
        >
          <div>
            <div class="flex items-start justify-between gap-3 mb-4">
              <div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border mb-2 shadow-2xs" :class="statusBadgeClass(group.status)">
                  <span v-if="group.status === 'Berlangsung'" class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                  {{ group.status }}
                </span>
                <h4 class="text-xl font-bold text-slate-900 tracking-tight">{{ group.classroom }}</h4>
              </div>
              <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                <AdminIcon name="cal" size="20" />
              </div>
            </div>

            <!-- Details Block -->
            <div class="space-y-2.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4">
              <div class="flex items-center gap-2.5">
                <AdminIcon name="user" size="14" class="text-slate-400" />
                <span class="font-semibold">{{ group.students }} Siswa Terdaftar</span>
              </div>
              <div class="flex items-center gap-2.5">
                <AdminIcon name="clock" size="14" class="text-slate-400" />
                <span class="font-medium">{{ group.date }}</span>
              </div>
              <div class="flex items-center gap-2.5">
                <AdminIcon name="eye" size="14" class="text-slate-400" />
                <span class="font-medium">{{ group.supervisor }}</span>
              </div>
            </div>
          </div>

          <div class="pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 font-mono">{{ group.subjects }} Mata Pelajaran</span>
            <span class="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
              <span>Kelola Jadwal</span>
              <AdminIcon name="arr" size="14" />
            </span>
          </div>
        </article>
      </div>
    </template>

    <!-- MODE 2: DETAIL JADWAL MAPEL PER KELAS -->
    <template v-if="viewMode === 'detail'">
      <!-- Breadcrumb and actions -->
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
              Jadwal Sesi Ujian: <span class="text-blue-600">{{ selectedClass }}</span>
            </h3>
            <p class="text-xs text-slate-500 font-medium">Daftar mata pelajaran, sesi aktif, dan kontrol anti-cheat</p>
          </div>
        </div>

        <button
          class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          type="button"
          @click="openCreateModal"
        >
          <AdminIcon name="plus" size="14" />
          <span>Tambah Mata Pelajaran</span>
        </button>
      </div>

      <!-- Schedule Cards List -->
      <div class="space-y-4">
        <article
          v-for="exam in classExams"
          :key="exam.id"
          class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
          :class="exam.status === 'Berlangsung' ? 'ring-2 ring-purple-400/50' : ''"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border" :class="statusBadgeClass(exam.status)">
                <span v-if="exam.status === 'Berlangsung'" class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                {{ exam.status }}
              </span>
              <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                {{ exam.date }} &bull; {{ exam.time }}
              </span>
              <span class="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                TOKEN: {{ exam.token }}
              </span>
            </div>

            <h4 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{{ exam.name }}</h4>
            <p class="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2 flex-wrap">
              <span>Mapel: <strong class="text-slate-700">{{ exam.subject }}</strong></span>
              <span>&bull;</span>
              <span>Durasi: {{ exam.duration }} Menit</span>
              <span>&bull;</span>
              <span>Pengawas: {{ exam.supervisor }}</span>
            </p>
          </div>

          <!-- Quick stats counter -->
          <div class="flex items-center gap-4 sm:gap-6 py-2 px-3 bg-slate-50/80 rounded-xl border border-slate-100 shrink-0">
            <div class="text-center">
              <span class="block text-base sm:text-lg font-bold text-slate-900 font-mono">{{ exam.participants }}</span>
              <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Peserta</span>
            </div>
            <div class="text-center">
              <span class="block text-base sm:text-lg font-bold text-emerald-600 font-mono">{{ exam.collected }}</span>
              <span class="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Selesai</span>
            </div>
            <div class="text-center cursor-pointer" @click="openViolationsModal(exam)">
              <span
                class="block text-base sm:text-lg font-bold font-mono"
                :class="exam.violations > 0 ? 'text-rose-600 underline' : 'text-slate-400'"
              >
                {{ exam.violations }}
              </span>
              <span
                class="text-[10px] font-semibold uppercase tracking-wider"
                :class="exam.violations > 0 ? 'text-rose-600' : 'text-slate-400'"
              >
                Pelanggaran
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              v-if="exam.status === 'Berlangsung'"
              class="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
              type="button"
              @click="activeTab = 'monitoring'"
            >
              Live Monitoring
            </button>
            <button
              v-else-if="exam.status === 'Selesai'"
              class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              type="button"
              @click="activeTab = 'results'"
            >
              Lihat Hasil Nilai
            </button>
            <button
              v-else
              class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition"
              type="button"
              @click="openCreateModal"
            >
              Atur Sesi
            </button>
          </div>
        </article>
      </div>
    </template>

    <!-- MODAL CENTER 1: DETAIL PELANGGARAN (MOBILE FIRST & MODERN) -->
    <AdminSlideOver
      :open="Boolean(isViolationModalOpen && selectedExamViolations)"
      title="Catatan Pelanggaran Sesi"
      :subtitle="`${selectedExamViolations?.name || ''} • ${selectedExamViolations?.classroom || ''}`"
      badge="Anti-Cheat CBT"
      badge-type="warning"
      width="lg"
      @close="closeViolationsModal"
    >
      <div v-if="selectedExamViolations" class="space-y-3.5 text-sm">
        <div v-if="selectedExamViolations.violations === 0" class="text-center py-8 text-sm text-slate-400 font-medium">
          Tidak ada pelanggaran tercatat untuk sesi ujian ini. Seluruh peserta tertib.
        </div>
        <div v-else class="space-y-3">
          <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm">
            <div class="flex justify-between items-center font-bold text-rose-900">
              <span>Nabila Zahra Putri (NISN: 0071234504)</span>
              <span class="font-mono text-xs font-bold text-rose-700">08:15 WIB</span>
            </div>
            <p class="text-rose-800 text-xs sm:text-sm mt-1.5 font-medium">Terdeteksi 2x berpindah tab/aplikasi lain di browser.</p>
            <span class="inline-block mt-2 font-bold text-xs bg-rose-200/90 text-rose-950 px-2.5 py-1 rounded-lg">Status: Terkunci (1x) &bull; PIN: ATQ-9481</span>
          </div>
          <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm">
            <div class="flex justify-between items-center font-bold text-rose-900">
              <span>Siti Aisyah (NISN: 0071234502)</span>
              <span class="font-mono text-xs font-bold text-rose-700">08:42 WIB</span>
            </div>
            <p class="text-rose-800 text-xs sm:text-sm mt-1.5 font-medium">Keluar dari mode full-screen jendela ujian.</p>
            <span class="inline-block mt-2 font-bold text-xs bg-rose-200/90 text-rose-950 px-2.5 py-1 rounded-lg">Status: Terkunci (1x) &bull; PIN: ATQ-3312</span>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer min-h-[44px]"
          type="button"
          @click="closeViolationsModal"
        >
          Tutup
        </button>
      </template>
    </AdminSlideOver>

    <!-- MODAL CENTER 2: TAMBAH JADWAL UJIAN (MOBILE FIRST & MODERN) -->
    <AdminSlideOver
      :open="isCreateExamModalOpen"
      title="Jadwalkan Sesi Ujian Baru"
      subtitle="Manajemen CBT • Bank Soal Terpadu"
      badge="Form Ujian"
      badge-type="primary"
      width="lg"
      @close="isCreateExamModalOpen = false"
    >
      <div class="space-y-4 sm:space-y-5 text-sm">
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Nama Sesi Ujian</label>
          <input
            v-model="newExamName"
            placeholder="Contoh: PTS Matematika Terpadu"
            class="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm font-medium min-h-[44px]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Kelas</label>
            <select v-model="newExamClass" class="w-full px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 cursor-pointer font-bold text-sm min-h-[44px]">
              <option v-for="g in activeGroups" :key="g.classroom" :value="g.classroom">{{ g.classroom }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Mata Pelajaran</label>
            <input
              v-model="newExamSubject"
              placeholder="Informatika"
              class="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm font-medium min-h-[44px]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Tanggal</label>
            <input
              v-model="newExamDate"
              class="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm font-medium min-h-[44px]"
            />
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Waktu &amp; Jam</label>
            <input
              v-model="newExamTime"
              class="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm font-medium min-h-[44px]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Pengawas Ujian</label>
          <input
            v-model="newExamSupervisor"
            class="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all text-sm font-medium min-h-[44px]"
          />
        </div>
      </div>

      <template #footer>
        <button
          class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer min-h-[44px]"
          type="button"
          @click="isCreateExamModalOpen = false"
        >
          Batal
        </button>
        <button
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors cursor-pointer min-h-[44px]"
          type="button"
          @click="saveNewExam"
        >
          Simpan Jadwal
        </button>
      </template>
    </AdminSlideOver>
  </div>
</template>
