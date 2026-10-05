<template>
  <section v-show="screen === 'login'" class="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#08152B] via-[#0E2754] to-[#F1F5F9] relative overflow-hidden text-slate-900 font-sans">
    <!-- Ambient Background Lighting & Particles -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
    <div class="absolute top-20 right-[-100px] w-[350px] h-[350px] bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute top-32 left-[-100px] w-[300px] h-[300px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

    <!-- Top Navigation / Brand Status Bar -->
    <header class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- School Identity -->
      <div class="flex items-center gap-3.5">
        <div class="relative w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shadow-lg">
          <img src="/asset/logo.png" alt="Logo Sekolah" class="w-full h-full object-contain drop-shadow-md">
        </div>
        <div class="text-left text-white">
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-black tracking-tight leading-tight text-white">{{ jenjangText }}</h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
              CBT v2.5
            </span>
          </div>
          <p class="text-xs text-blue-200/80 font-medium">Computer Based Test &bull; Ujian Terstandar Komputer</p>
        </div>
      </div>

      <!-- Live Server & Grade Switcher -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Live Server Status Indicator -->
        <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-xs">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span class="text-emerald-300 font-bold">Server CBT Online</span>
          <span class="text-white/40">&bull;</span>
          <span class="text-slate-300 font-mono text-[11px]">Latensi: 8ms</span>
        </div>

        <!-- Grade Segmented Switcher -->
        <div class="bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/15 flex items-center shadow-xs">
          <button
            type="button"
            class="px-3 py-1 rounded-xl text-xs font-extrabold transition-all"
            :class="activeGrade === 'SMK' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40' : 'text-slate-300 hover:text-white'"
            @click="setGrade('SMK')"
          >
            SMK IT 9
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-xl text-xs font-extrabold transition-all"
            :class="activeGrade === 'SMP' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40' : 'text-slate-300 hover:text-white'"
            @click="setGrade('SMP')"
          >
            SMP IT BCA
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 max-w-5xl w-full mx-auto">
      <!-- Title Section -->
      <div class="text-center mb-7 space-y-2 max-w-xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/15 text-blue-100 border border-white/20 shadow-inner">
          <span>T.A 2026/2027</span>
          <span class="text-white/40">&bull;</span>
          <span>Semester Ganjil</span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
          Portal Ujian Terstandar <br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">
            Mandiri &amp; Terintegrasi
          </span>
        </h2>
        <p class="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
          Masuk menggunakan akun peserta yang telah diverifikasi oleh panitia ujian untuk memulai sesi pengerjaan.
        </p>
      </div>

      <!-- Login Card & Info Bento Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-4xl items-stretch">
        <!-- Left: Interactive Login Card -->
        <div class="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.3)] border border-white/80 flex flex-col justify-between">
          <div>
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
              <div>
                <span class="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider block mb-0.5">Autentikasi Siswa</span>
                <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Masuk Ujian</h3>
              </div>
              <span class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </span>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="doLogin" autocomplete="off" class="space-y-4">
              <!-- NIS Input -->
              <div>
                <label for="f-nis" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Nomor Peserta / NIS</span>
                  <span class="text-[10.5px] font-normal text-slate-400">10 Digit NIS</span>
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="f-nis"
                    v-model="loginForm.nis"
                    inputmode="numeric"
                    placeholder="Contoh: 2024001234"
                    class="w-full pl-10 pr-4 py-3 text-sm font-mono font-medium bg-slate-50/80 border-2 border-slate-200/90 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-sans"
                  />
                  <button
                    v-if="loginForm.nis"
                    type="button"
                    class="absolute right-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    @click="loginForm.nis = ''"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Password Input with Toggle Visibility -->
              <div>
                <label for="f-pass" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Kata Sandi</span>
                  <span class="text-[10.5px] font-normal text-slate-400">Tercantum di Kartu</span>
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="f-pass"
                    v-model="loginForm.pass"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Masukkan kata sandi ujian"
                    class="w-full pl-10 pr-11 py-3 text-sm font-medium bg-slate-50/80 border-2 border-slate-200/90 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    class="absolute right-3.5 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                    :title="showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'"
                    @click="showPassword = !showPassword"
                  >
                    <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Kode Ujian (Opsional) -->
              <div>
                <label for="f-kode" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Kode Ujian / Token <span class="text-slate-400 font-normal lowercase">(opsional)</span></span>
                  <span class="text-[10.5px] font-mono text-blue-600 font-bold">{{ activeGrade === 'SMP' ? 'IF-0901' : 'IF-1201' }}</span>
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </span>
                  <input
                    id="f-kode"
                    v-model="loginForm.kode"
                    placeholder="Contoh: IF-1201"
                    class="w-full pl-10 pr-4 py-3 text-sm font-mono uppercase font-bold bg-slate-50/80 border-2 border-slate-200/90 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal"
                  />
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.98] mt-3 cursor-pointer"
              >
                <span>Masuk Ujian Sekarang</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </div>

          <!-- Demo Quick Fill Pill Bar -->
          <div class="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span class="text-xs font-bold text-slate-500">Coba Mode Demo:</span>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                @click="fillDemoAccount('SMK')"
              >
                <span>⚡ Demo SMK</span>
              </button>
              <button
                type="button"
                class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                @click="fillDemoAccount('SMP')"
              >
                <span>⚡ Demo SMP</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Security & Features Highlights -->
        <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
          <!-- Anti-Cheat Card -->
          <div class="bg-gradient-to-br from-[#0F1E38] via-[#122B52] to-[#0A1A33] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-white/10 space-y-4">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-black">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <div>
                <h4 class="text-sm font-black text-white">Sistem Integritas Ujian</h4>
                <p class="text-[11px] text-blue-200/80">Protokol Keamanan &amp; Anti-Kecurangan</p>
              </div>
            </div>

            <ul class="space-y-2.5 text-xs text-slate-200">
              <li class="flex items-start gap-2.5">
                <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                <span><b>Autosave 10 Detik</b>: Jawaban tersimpan otomatis secara berkala ke cloud.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">!</span>
                <span><b>Deteksi Multitab</b>: Pindah tab atau keluar aplikasi memicu peringatan &amp; penguncian akun.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✕</span>
                <span><b>Batas 2x Pelanggaran</b>: Pelanggaran ke-3 mengunci akun total dari ujian.</span>
              </li>
            </ul>

            <div class="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
              <span class="text-blue-300 font-bold">ℹ️ Info:</span>
              <span>Pastikan baterai perangkat cukup dan koneksi stabil selama ujian.</span>
            </div>
          </div>

          <!-- 2 Bento Mini Cards -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span class="text-[10.5px] font-black uppercase tracking-wider text-blue-600 block">Format Soal</span>
              <b class="text-xs font-black text-slate-900 block">4 Tipe Soal Ujian</b>
              <span class="text-[10px] text-slate-500 block leading-tight">PG, Singkat, Essay &amp; Audio/Video Interaktif</span>
            </div>

            <div class="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span class="text-[10.5px] font-black uppercase tracking-wider text-emerald-600 block">Waktu Ujian</span>
              <b class="text-xs font-black text-slate-900 block">Standar 90 Menit</b>
              <span class="text-[10px] text-slate-500 block leading-tight">Timer sinkron realtime dengan server sekolah</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Note -->
    <footer class="relative z-10 w-full text-center py-6 px-4 text-xs text-slate-500 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
      <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-medium">
        <div>
          Butuh bantuan teknis? Hubungi proktor di ruang pengawas atau panitia CBT.
        </div>
        <div class="text-slate-400 font-semibold text-[11px]">
          &copy; 2026 {{ jenjangText }} &bull; Yayasan Darqia Attaqwa
        </div>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LoginForm } from '~/composables/useCbtExam'
import { useAdminGrade } from '~/composables/useAdminGrade'

const props = defineProps<{
  screen: string
  jenjangText: string
  loginForm: LoginForm
}>()

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'fill-demo'): void
}>()

const activeGrade = useAdminGrade()
const showPassword = ref(false)

const setGrade = (gradeVal: 'SMK' | 'SMP') => {
  activeGrade.value = gradeVal
  if (gradeVal === 'SMP') {
    props.loginForm.nis = '2024005678'
    props.loginForm.kode = 'IF-0901'
  } else {
    props.loginForm.nis = '2024001234'
    props.loginForm.kode = 'IF-1201'
  }
}

const fillDemoAccount = (gradeVal: 'SMK' | 'SMP') => {
  setGrade(gradeVal)
  props.loginForm.pass = 'demo123'
  emit('fill-demo')
}

const doLogin = () => emit('login')
</script>
