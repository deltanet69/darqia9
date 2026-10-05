<script setup lang="ts">
import { ref } from 'vue'
import { useAdminCbtState, type Exam } from '~/composables/useAdminCbtState'
import AdminIcon from '~/components/admin/AdminIcon.vue'

const { liveExams, grade } = useAdminCbtState()
const selectedExamForDetail = ref<Exam | null>(null)
const isModalOpen = ref(false)
const toastMessage = ref('')

const openDetailModal = (exam: Exam) => {
  selectedExamForDetail.value = exam
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedExamForDetail.value = null
}

// Sample live students in active exam
const liveStudents = ref([
  { id: '1', name: 'Ahmad Fauzan', nisn: '0071234501', progress: 28, total: 30, status: 'Mengerjakan', violations: 0, lastActive: '1 menit lalu' },
  { id: '2', name: 'Siti Aisyah', nisn: '0071234502', progress: 22, total: 30, status: 'Terkunci (1x)', violations: 2, lastActive: 'Baru saja' },
  { id: '3', name: 'Muhammad Rizky Pratama', nisn: '0071234503', progress: 30, total: 30, status: 'Selesai', violations: 0, lastActive: '5 menit lalu' },
  { id: '4', name: 'Nabila Zahra Putri', nisn: '0071234504', progress: 14, total: 30, status: 'Terkunci (1x)', violations: 1, lastActive: '2 menit lalu' },
  { id: '5', name: 'Farhan Maulana', nisn: '0071234505', progress: 25, total: 30, status: 'Mengerjakan', violations: 0, lastActive: 'Baru saja' },
  { id: '6', name: 'Putri Safitri', nisn: '0071234506', progress: 30, total: 30, status: 'Selesai', violations: 0, lastActive: '10 menit lalu' }
])

const triggerUnlock = (student: any) => {
  student.status = 'Mengerjakan'
  student.violations = 0
  showToast(`Akun siswa ${student.name} berhasil dibuka kuncinya.`)
}

const triggerWarning = (student: any) => {
  showToast(`Peringatan pengawas dikirim ke layar ujian ${student.name}.`)
}

const triggerForceSubmit = (student: any) => {
  student.status = 'Selesai'
  showToast(`Ujian siswa ${student.name} berhasil dikumpulkan oleh pengawas.`)
}

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}
</script>

<template>
  <div class="space-y-6">
    <!-- SECTION HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-rose-500 before:to-pink-600 before:shadow-[0_2px_8px_rgba(244,63,94,0.4)]">
          Monitoring Ujian Real-Time
        </h3>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5 ml-3.5 font-medium">
          Pantau aktivitas peserta, progres pengerjaan, dan status pelanggaran sistem anti-kecurangan
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200/80 text-rose-700 rounded-xl text-xs font-bold shadow-2xs">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          <span>LIVE UPDATES AKTIF</span>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div
      v-if="toastMessage"
      class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-fadeUp text-xs font-semibold"
    >
      <AdminIcon name="check" size="16" class="text-emerald-400" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- EMPTY STATE -->
    <div
      v-if="liveExams.length === 0"
      class="bg-gradient-to-b from-white to-[#FCFEFF] rounded-[20px] border border-slate-200/80 p-12 text-center shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]"
    >
      <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
        <AdminIcon name="monitor" size="32" />
      </div>
      <h3 class="text-base font-bold text-slate-900">Tidak ada sesi ujian yang sedang berlangsung</h3>
      <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
        Saat ini tidak ada sesi ujian aktif untuk jenjang {{ grade }}. Silakan periksa tab Daftar Ujian untuk jadwal mendatang.
      </p>
    </div>

    <!-- LIVE EXAMS GRID -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <article
        v-for="exam in liveExams"
        :key="exam.id"
        class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <!-- Header Card -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  {{ exam.classroom }}
                </span>
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {{ exam.subject }}
                </span>
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  Token: {{ exam.token }}
                </span>
              </div>
              <h4 class="text-lg font-bold text-slate-900 tracking-tight leading-tight">{{ exam.name }}</h4>
              <p class="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
                <AdminIcon name="clock" size="14" class="text-slate-400" />
                <span>{{ exam.time }} ({{ exam.duration }} Menit) &bull; Pengawas: {{ exam.supervisor }}</span>
              </p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Aktif
            </span>
          </div>

          <!-- 3 Stats Block -->
          <div class="grid grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-xl mb-4 border border-slate-100">
            <div class="text-center">
              <span class="block text-[11px] font-semibold text-slate-500">Total Peserta</span>
              <span class="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">{{ exam.participants }}</span>
            </div>
            <div class="text-center">
              <span class="block text-[11px] font-semibold text-purple-600">Mengerjakan</span>
              <span class="text-xl sm:text-2xl font-extrabold text-purple-700 font-mono">{{ exam.doing }}</span>
            </div>
            <div class="text-center">
              <span class="block text-[11px] font-semibold text-emerald-600">Selesai</span>
              <span class="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">{{ exam.collected }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-5">
            <div class="flex justify-between items-center text-xs font-bold text-slate-600 mb-1.5">
              <span>Progres Pengerjaan Keseluruhan</span>
              <span class="font-mono text-blue-600 text-sm">{{ Math.round((exam.collected / exam.participants) * 100) }}%</span>
            </div>
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div
                class="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 h-full rounded-full transition-all duration-700"
                :style="{ width: `${(exam.collected / exam.participants) * 100}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Footer Card -->
        <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :class="exam.violations > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'"
            >
              <AdminIcon name="alert" size="16" />
            </span>
            <div>
              <span class="block text-xs font-bold" :class="exam.violations > 0 ? 'text-rose-600' : 'text-slate-700'">
                {{ exam.violations }} Peringatan Anti-Cheat
              </span>
              <span class="block text-[11px] text-slate-400">Selama sesi berlangsung</span>
            </div>
          </div>

          <button
            class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            type="button"
            @click="openDetailModal(exam)"
          >
            <AdminIcon name="eye" size="14" />
            <span>Detail Peserta Live</span>
          </button>
        </div>
      </article>
    </div>

    <!-- DETAIL PESERTA LIVE MODAL -->
    <div
      v-if="isModalOpen && selectedExamForDetail"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-[20px] shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        <!-- Modal Head -->
        <div class="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono">
                {{ selectedExamForDetail.classroom }}
              </span>
              <span class="text-xs font-bold text-slate-500">{{ selectedExamForDetail.subject }}</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900">{{ selectedExamForDetail.name }} &mdash; Pantauan Peserta</h3>
          </div>
          <button
            class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
            type="button"
            @click="closeModal"
          >
            <AdminIcon name="x" size="18" />
          </button>
        </div>

        <!-- Modal Body (Table) -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold bg-blue-50/60 p-3 rounded-xl border border-blue-100">
            <span>Siswa yang berpindah tab atau keluar fullscreen otomatis terkunci &amp; membutuhkan PIN Pengawas untuk membuka.</span>
            <span class="font-mono text-blue-700 font-bold">PIN Darurat: ATQ-9481</span>
          </div>

          <div class="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3">Nama Siswa</th>
                  <th class="px-4 py-3">NISN</th>
                  <th class="px-4 py-3">Progres Soal</th>
                  <th class="px-4 py-3 text-center">Pelanggaran</th>
                  <th class="px-4 py-3 text-center">Status</th>
                  <th class="px-4 py-3 text-right">Aksi Pengawas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="stu in liveStudents" :key="stu.id" class="hover:bg-slate-50/60 transition">
                  <td class="px-4 py-3 font-bold text-slate-900">{{ stu.name }}</td>
                  <td class="px-4 py-3 font-mono text-slate-500">{{ stu.nisn }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold text-slate-800">{{ stu.progress }}/{{ stu.total }}</span>
                      <div class="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-blue-600 h-full rounded-full" :style="{ width: `${(stu.progress / stu.total) * 100}%` }"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span
                      class="px-2 py-0.5 rounded-md font-bold text-[11px]"
                      :class="stu.violations > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'"
                    >
                      {{ stu.violations }}x Peringatan
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px]"
                      :class="{
                        'bg-emerald-50 text-emerald-700 border border-emerald-200': stu.status === 'Selesai',
                        'bg-blue-50 text-blue-700 border border-blue-200': stu.status === 'Mengerjakan',
                        'bg-rose-50 text-rose-700 border border-rose-200': stu.status.includes('Terkunci')
                      }"
                    >
                      {{ stu.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        v-if="stu.status.includes('Terkunci')"
                        class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                        type="button"
                        @click="triggerUnlock(stu)"
                      >
                        Buka Kunci
                      </button>
                      <button
                        v-if="stu.status === 'Mengerjakan'"
                        class="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold text-[11px] transition"
                        type="button"
                        @click="triggerWarning(stu)"
                      >
                        Peringatkan
                      </button>
                      <button
                        v-if="stu.status === 'Mengerjakan'"
                        class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition"
                        type="button"
                        @click="triggerForceSubmit(stu)"
                      >
                        Kumpulkan
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span class="text-xs text-slate-500">Data terhubung secara real-time ke aplikasi ujian siswa</span>
          <button
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
            type="button"
            @click="closeModal"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
