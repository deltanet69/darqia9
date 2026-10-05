<script setup lang="ts">
import { ref } from 'vue'
import { useAdminCbtState, type Exam } from '~/composables/useAdminCbtState'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'

const { exams, liveExams, scheduledExams, completedExams, activeTab, cheatLogs, bank, results, grade } = useAdminCbtState()
const copySuccessToast = ref('')

const copyToken = (token: string) => {
  navigator.clipboard?.writeText(token)
  copySuccessToast.value = `Token ${token} berhasil disalin!`
  setTimeout(() => {
    copySuccessToast.value = ''
  }, 2500)
}
</script>

<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- TOAST NOTIFICATION -->
    <div
      v-if="copySuccessToast"
      class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-fadeUp text-xs font-semibold"
    >
      <AdminIcon name="check" size="16" class="text-emerald-400" />
      <span>{{ copySuccessToast }}</span>
    </div>

    <!-- 4 CANONICAL KPI CARDS GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- KPI 1: Total Ujian (Blue) -->
      <div
        class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#60a5fa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10"
        @click="activeTab = 'exams'"
      >
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="monitor" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            {{ grade }}
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-xs font-mono">{{ exams.length }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Total Sesi Ujian Terdaftar</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[4, 5, 6, 6, 7, 8]" color="#ffffff" />
        </div>
      </div>

      <!-- KPI 2: Ujian Berlangsung (Violet / Purple) -->
      <div
        class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#a78bfa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10"
        @click="activeTab = 'monitoring'"
      >
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="clock" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Sedang Berjalan
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-xs font-mono">{{ liveExams.length }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Ujian Sedang Berlangsung</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[1, 2, 2, 3, 2, 2]" color="#ffffff" />
        </div>
      </div>

      <!-- KPI 3: Akan Datang (Amber) -->
      <div
        class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#92400e] via-[#d97706] to-[#fbbf24] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10"
        @click="activeTab = 'exams'"
      >
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="cal" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            Terjadwal
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-xs font-mono">{{ scheduledExams.length }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Jadwal Ujian Mendatang</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[2, 3, 2, 4, 3, 2]" color="#ffffff" />
        </div>
      </div>

      <!-- KPI 4: Ujian Selesai (Emerald) -->
      <div
        class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#065f46] via-[#059669] to-[#34d399] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10"
        @click="activeTab = 'results'"
      >
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="check" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            Arsip Nilai
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-xs font-mono">{{ completedExams.length }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Ujian Selesai &amp; Dinilai</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[3, 4, 5, 7, 8, 9]" color="#ffffff" />
        </div>
      </div>
    </div>

    <!-- MAIN DASHBOARD CONTENT (2 COLUMN RESPONSIVE GRID) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LEFT 2 COLS: QUICK LIVE EXAMS MONITORING -->
      <article class="lg:col-span-2 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] transition-all duration-300 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
                Monitoring Sesi Aktif Hari Ini
              </h3>
              <p class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Pantauan progres pengerjaan ujian siswa dan deteksi pelanggaran real-time</p>
            </div>
            <button
              class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition cursor-pointer"
              type="button"
              @click="activeTab = 'monitoring'"
            >
              <span>Monitoring Lengkap</span>
              <AdminIcon name="arr" size="14" />
            </button>
          </div>

          <!-- Empty State -->
          <div v-if="liveExams.length === 0" class="py-12 text-center text-slate-400">
            <AdminIcon name="monitor" size="32" class="mx-auto mb-2 text-slate-300" />
            <div class="text-sm font-semibold text-slate-700">Tidak ada sesi ujian aktif saat ini</div>
            <div class="text-xs text-slate-400 mt-0.5">Semua ujian saat ini berstatus terjadwal atau telah selesai dikerjakan.</div>
          </div>

          <!-- Live Exam Cards -->
          <div v-else class="space-y-4 mt-5">
            <div
              v-for="exam in liveExams"
              :key="exam.id"
              class="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-3.5"
            >
              <!-- Card Header Row -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      {{ exam.classroom }}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {{ exam.subject }}
                    </span>
                    <button
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
                      title="Klik untuk salin token ujian"
                      type="button"
                      @click="copyToken(exam.token)"
                    >
                      <span>Token: {{ exam.token }}</span>
                      <AdminIcon name="spark" size="12" class="text-indigo-500" />
                    </button>
                  </div>
                  <h4 class="text-base font-bold text-slate-900 tracking-tight leading-snug">{{ exam.name }}</h4>
                  <div class="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap font-medium">
                    <span class="flex items-center gap-1">
                      <AdminIcon name="clock" size="13" class="text-slate-400" />
                      <span>{{ exam.time }} ({{ exam.duration }} Menit)</span>
                    </span>
                    <span>&bull;</span>
                    <span>Pengawas: <strong>{{ exam.supervisor }}</strong></span>
                  </div>
                </div>

                <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Sesi
                  </span>
                </div>
              </div>

              <!-- 4 Detailed Stat Counters -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 px-3.5 bg-slate-50/90 rounded-xl border border-slate-100">
                <div class="text-center">
                  <span class="block text-[11px] font-semibold text-slate-500">Total Peserta</span>
                  <span class="text-base sm:text-lg font-extrabold text-slate-900 font-mono">{{ exam.participants }} Siswa</span>
                </div>
                <div class="text-center">
                  <span class="block text-[11px] font-semibold text-purple-600">Mengerjakan</span>
                  <span class="text-base sm:text-lg font-extrabold text-purple-700 font-mono">{{ exam.doing }} ({{ Math.round((exam.doing / exam.participants) * 100) }}%)</span>
                </div>
                <div class="text-center">
                  <span class="block text-[11px] font-semibold text-emerald-600">Selesai Submit</span>
                  <span class="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">{{ exam.collected }} ({{ Math.round((exam.collected / exam.participants) * 100) }}%)</span>
                </div>
                <div class="text-center">
                  <span class="block text-[11px] font-semibold text-slate-500">Belum Mulai</span>
                  <span class="text-base sm:text-lg font-extrabold text-slate-600 font-mono">{{ exam.participants - exam.doing - exam.collected }} Siswa</span>
                </div>
              </div>

              <!-- Animated Progress Bar -->
              <div>
                <div class="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Tingkat Penyelesaian Sesi</span>
                  <span class="font-mono text-blue-700 font-extrabold">{{ exam.collected }} / {{ exam.participants }} Siswa ({{ Math.round((exam.collected / exam.participants) * 100) }}%)</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    class="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 h-full rounded-full transition-all duration-700"
                    :style="{ width: `${(exam.collected / exam.participants) * 100}%` }"
                  />
                </div>
              </div>

              <!-- Footer info row -->
              <div class="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-0.5 rounded-md text-[11px] font-bold inline-flex items-center gap-1"
                    :class="exam.violations > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'"
                  >
                    <AdminIcon name="alert" size="12" />
                    <span>{{ exam.violations }} Peringatan Anti-Cheat Aktif</span>
                  </span>
                </div>

                <button
                  class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-end sm:self-auto cursor-pointer"
                  type="button"
                  @click="activeTab = 'monitoring'"
                >
                  <span>Lihat Detail Layar Peserta</span>
                  <AdminIcon name="arr" size="12" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-medium">Pengawasan anti-cheat otomatis mengunci tab-switch &amp; alt+tab</span>
          <button
            class="text-xs font-bold text-slate-700 hover:text-blue-600 transition cursor-pointer"
            type="button"
            @click="activeTab = 'management'"
          >
            Log Pelanggaran &rarr;
          </button>
        </div>
      </article>

      <!-- RIGHT 1 COL: JADWAL UJIAN TERDEKAT & KESIAPAN SOAL -->
      <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] transition-all duration-300 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2.5 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-amber-500 before:to-orange-500 before:shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
                Jadwal Ujian Terdekat
              </h3>
              <p class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Sesi ujian yang akan segera berlangsung</p>
            </div>
            <button
              class="text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
              type="button"
              @click="activeTab = 'exams'"
            >
              Semua
            </button>
          </div>

          <!-- Empty State -->
          <div v-if="scheduledExams.length === 0" class="py-8 text-center text-slate-400 text-xs">
            <AdminIcon name="cal" size="28" class="mx-auto mb-2 text-slate-300" />
            <div class="font-semibold text-slate-700">Tidak ada jadwal ujian mendatang</div>
            <div class="text-slate-400 mt-0.5">Seluruh sesi ujian telah selesai dilaksanakan.</div>
          </div>

          <!-- Scheduled Exam Items -->
          <div v-else class="space-y-3.5 mt-4">
            <div
              v-for="sched in scheduledExams"
              :key="sched.id"
              class="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-200 hover:shadow-xs transition space-y-2.5"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md font-mono">
                    {{ sched.classroom }}
                  </span>
                  <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {{ sched.subject }}
                  </span>
                </div>
                <span class="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  {{ sched.date }}
                </span>
              </div>

              <div>
                <h5 class="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{{ sched.name }}</h5>
                <p class="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Waktu: {{ sched.time }} ({{ sched.duration }}m)</span>
                  <span class="font-mono text-blue-700 font-bold">Token: {{ sched.token }}</span>
                </p>
              </div>

              <!-- Status Kesiapan Bank Soal & Supervisor -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span class="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <AdminIcon name="check" size="12" />
                  <span>30 Butir Soal Siap</span>
                </span>
                <span class="text-slate-500 truncate max-w-[140px] text-right" :title="sched.supervisor">
                  {{ sched.supervisor }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Shortcut Action Buttons -->
        <div class="pt-4 mt-5 border-t border-slate-100 space-y-2">
          <button
            class="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition flex items-center justify-between cursor-pointer"
            type="button"
            @click="activeTab = 'exams'"
          >
            <span class="flex items-center gap-2">
              <AdminIcon name="plus" size="14" class="text-blue-600" />
              <span>Jadwalkan Sesi Ujian Baru</span>
            </span>
            <AdminIcon name="arr" size="12" class="text-slate-400" />
          </button>
          <button
            class="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition flex items-center justify-between cursor-pointer"
            type="button"
            @click="activeTab = 'bank'"
          >
            <span class="flex items-center gap-2">
              <AdminIcon name="book" size="14" class="text-purple-600" />
              <span>Kelola Bank Soal Guru</span>
            </span>
            <AdminIcon name="arr" size="12" class="text-slate-400" />
          </button>
        </div>
      </article>
    </div>

    <!-- BOTTOM 3-COLUMN INFORMATIVE OVERVIEW WIDGETS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      <!-- WIDGET 1: ANTI-CHEAT & KEAMANAN UJIAN -->
      <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3.5">
            <span class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AdminIcon name="shield" size="20" />
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Anti-Cheat Aktif
            </span>
          </div>

          <h4 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Keamanan &amp; Deteksi Kecurangan</h4>
          <p class="text-xs text-slate-500 mt-1 font-medium">Log aktivitas sistem keamanan saat ujian berlangsung</p>

          <div class="space-y-2 mt-4 text-xs">
            <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600 font-medium">Total Insiden Hari Ini:</span>
              <strong class="font-mono text-rose-700">{{ cheatLogs.length }} Insiden</strong>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600 font-medium">Akun Terkunci (Butuh PIN):</span>
              <strong class="font-mono text-amber-700">2 Akun</strong>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600 font-medium">Pelanggaran Level 3 (Auto Submit):</span>
              <strong class="font-mono text-slate-700">0 Siswa</strong>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-100">
          <button
            class="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition border border-rose-200/80 flex items-center justify-center gap-1.5 cursor-pointer"
            type="button"
            @click="activeTab = 'management'"
          >
            <span>Buka Manajemen Pelanggaran</span>
            <AdminIcon name="arr" size="14" />
          </button>
        </div>
      </article>

      <!-- WIDGET 2: STATUS BANK SOAL & REPOSITORI -->
      <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3.5">
            <span class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <AdminIcon name="book" size="20" />
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              {{ bank.length + 150 }} Soal
            </span>
          </div>

          <h4 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Kesiapan Bank Soal Mata Pelajaran</h4>
          <p class="text-xs text-slate-500 mt-1 font-medium">Distribusi butir pertanyaan dan kesiapan kurikulum</p>

          <div class="space-y-2 mt-4 text-xs">
            <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600 font-medium">Format Pilihan Ganda (PG):</span>
              <strong class="font-mono text-blue-700">120 Soal</strong>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600 font-medium">Format Esai &amp; Jawaban Singkat:</span>
              <strong class="font-mono text-purple-700">25 Soal</strong>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600 font-medium">Format Audio &amp; Video:</span>
              <strong class="font-mono text-emerald-700">10 Soal</strong>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-100">
          <button
            class="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition border border-blue-200/80 flex items-center justify-center gap-1.5 cursor-pointer"
            type="button"
            @click="activeTab = 'bank'"
          >
            <span>Buka Bank Soal</span>
            <AdminIcon name="arr" size="14" />
          </button>
        </div>
      </article>

      <!-- WIDGET 3: REKAPITULASI HASIL & KOREKSI ESAI -->
      <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3.5">
            <span class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <AdminIcon name="user" size="20" />
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Tuntas 91.2%
            </span>
          </div>

          <h4 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Hasil Nilai &amp; Antrean Koreksi</h4>
          <p class="text-xs text-slate-500 mt-1 font-medium">Status kelulusan siswa dan penilaian manual esai guru</p>

          <div class="space-y-2 mt-4 text-xs">
            <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600 font-medium">Rata-rata Nilai Siswa:</span>
              <strong class="font-mono text-emerald-700 text-sm">82.4 / 100</strong>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600 font-medium">Standar KKM Sekolah:</span>
              <strong class="font-mono text-slate-700">75.0 Poin</strong>
            </div>
            <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600 font-medium">Antrean Koreksi Esai Guru:</span>
              <strong class="font-mono text-amber-700">2 Lembar Menunggu</strong>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-100">
          <button
            class="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition border border-emerald-200/80 flex items-center justify-center gap-1.5 cursor-pointer"
            type="button"
            @click="activeTab = 'results'"
          >
            <span>Rekap Nilai &amp; Koreksi</span>
            <AdminIcon name="arr" size="14" />
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
