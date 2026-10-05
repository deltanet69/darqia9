<template>
  <section v-show="screen === 'confirm'" class="min-h-screen pb-16">
    <!-- Topbar Simple -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-30 py-3.5 px-4 sm:px-6">
      <div class="max-w-5xl mx-auto flex items-center gap-3">
        <img src="/asset/logo.png" alt="Logo" class="w-9 h-9 object-contain">
        <div>
          <div class="text-sm font-extrabold text-slate-900 leading-tight">{{ jenjangText }}</div>
          <div class="text-xs font-semibold text-slate-500">Verifikasi Data Ujian</div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      <!-- Page Head -->
      <div class="text-center sm:text-left mb-6">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Siap mengikuti ujian?</h2>
        <p class="text-xs sm:text-sm text-slate-600 mt-1">Periksa datamu dan baca tata tertib sebelum mulai.</p>
      </div>

      <!-- Flow Step Badges -->
      <div class="flex items-center gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 shrink-0">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
          1. Login
        </span>
        <span class="w-6 h-0.5 bg-emerald-300 shrink-0"></span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/25 shrink-0">
          <span class="w-4 h-4 rounded-full bg-white text-blue-600 flex items-center justify-center text-[10px] font-black">2</span>
          Verifikasi
        </span>
        <span class="w-6 h-0.5 bg-slate-200 shrink-0"></span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 shrink-0">
          <span class="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-black">3</span>
          Ujian
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: ID Card + Exam Information -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Student ID Card -->
          <div class="bg-gradient-to-br from-[#0F1E38] via-[#122B52] to-[#0A1A33] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div class="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div class="flex items-center gap-4 mb-6">
              <div class="relative w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg">
                AF
                <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0F1E38] flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                </span>
              </div>
              <div>
                <div class="text-[11px] font-bold uppercase tracking-wider text-blue-300">Kartu Peserta Ujian</div>
                <div class="text-lg font-black text-white leading-tight">Ahmad Fauzi</div>
                <div class="text-xs text-slate-300 mt-0.5">NIS {{ loginForm.nis || '2024001234' }} &bull; {{ grade === 'SMP' ? 'IX-A' : 'XII TKJ 1' }}</div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center text-xs">
              <div class="bg-white/5 rounded-xl p-2.5 backdrop-blur-sm">
                <span class="block text-[10px] text-slate-400 uppercase font-semibold">Token</span>
                <b class="text-blue-300 font-mono font-bold text-xs truncate block mt-0.5">{{ grade === 'SMP' ? 'BCA-9X2K' : 'ATQ-9X2K' }}</b>
              </div>
              <div class="bg-white/5 rounded-xl p-2.5 backdrop-blur-sm">
                <span class="block text-[10px] text-slate-400 uppercase font-semibold">Ruang</span>
                <b class="text-white font-bold block mt-0.5">Online</b>
              </div>
              <div class="bg-white/5 rounded-xl p-2.5 backdrop-blur-sm">
                <span class="block text-[10px] text-slate-400 uppercase font-semibold">Sesi</span>
                <b class="text-white font-bold block mt-0.5">1</b>
              </div>
            </div>
          </div>

          <!-- Exam Detail Card -->
          <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Informasi Ujian</span>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <dl class="space-y-3.5 text-xs sm:text-sm">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>
                </div>
                <div>
                  <dt class="text-slate-400 text-xs">Mata Pelajaran</dt>
                  <dd class="font-extrabold text-slate-900">Informatika</dd>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                </div>
                <div>
                  <dt class="text-slate-400 text-xs">Materi</dt>
                  <dd class="font-extrabold text-slate-900">{{ grade === 'SMP' ? 'Informatika & Komputer Dasar' : 'Jaringan Komputer Dasar' }}</dd>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/></svg>
                </div>
                <div>
                  <dt class="text-slate-400 text-xs">Durasi &amp; Soal</dt>
                  <dd class="font-extrabold text-slate-900">90 menit &bull; {{ totalQuestions }} Soal</dd>
                </div>
              </div>
            </dl>

            <div class="mt-5 p-3 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-start gap-2.5 text-blue-900 text-xs">
              <svg class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z"/><path d="M8.8 12l2.3 2.3 4.2-4.6"/></svg>
              <span>Jawaban <b>tersimpan otomatis setiap 10 detik</b> — aman walau ter-reload.</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Question Sections + Rules + Start CTA -->
        <div class="lg:col-span-7 space-y-6">
          <!-- Accordion Bagian Soal -->
          <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Bagian Soal</h3>
              <span class="text-xs text-slate-400">Ketuk untuk detail</span>
            </div>

            <div class="space-y-2.5">
              <div
                v-for="sec in sections"
                :key="sec.id"
                class="border rounded-2xl overflow-hidden transition-all"
                :class="openedAcc === sec.id ? 'border-blue-400 bg-blue-50/20 shadow-sm' : 'border-slate-200 bg-white'"
              >
                <button
                  type="button"
                  class="w-full p-3.5 flex items-center justify-between gap-3 text-left"
                  @click="$emit('toggle-acc', sec.id)"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs" v-html="sec.icon"></span>
                    <span class="text-xs sm:text-sm font-bold text-slate-900">{{ sec.title }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{{ secRange(sec.id).length }} soal</span>
                    <svg
                      class="w-4 h-4 text-slate-400 transition-transform duration-200"
                      :class="{ 'rotate-180 text-blue-600': openedAcc === sec.id }"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </button>
                <div v-show="openedAcc === sec.id" class="px-4 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100" v-html="sec.desc"></div>
              </div>
            </div>
          </div>

          <!-- Tata Tertib Ujian -->
          <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">Tata Tertib Ujian</h3>
            <ul class="space-y-3 text-xs sm:text-sm text-slate-700">
              <li class="flex items-start gap-3">
                <span class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                </span>
                <span>Kerjakan tepat waktu — durasi ujian <b>90 menit</b> dan tidak bisa diperpanjang.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9a14.5 14.5 0 0 1 19 0"/><path d="M5.8 12.6a9.8 9.8 0 0 1 12.4 0"/><path d="M9 16.2a5 5 0 0 1 6 0"/><circle cx="12" cy="19.4" r="1.5" fill="currentColor" stroke="none"/></svg>
                </span>
                <span>Pastikan <b>koneksi internet stabil</b> selama ujian berlangsung.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 5.2A10 10 0 0 1 12 5c7 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3M6.6 6.6A16.9 16.9 0 0 0 2 12s3 7 10 7a10.3 10.3 0 0 0 5-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
                </span>
                <span>Kerjakan <b>secara mandiri</b>. Dilarang membuka catatan, aplikasi, atau tab lain.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5L22 20H2z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r="1.1" fill="currentColor" stroke="none"/></svg>
                </span>
                <span>Pelanggaran tata tertib berakibat <b>akun terkunci dan nilai dibatalkan</b>.</span>
              </li>
            </ul>
          </div>

          <!-- Checkbox Agreement -->
          <label class="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-300 cursor-pointer transition-all">
            <input
              type="checkbox"
              :checked="agreeStart"
              @change="$emit('update:agreeStart', ($event.target as HTMLInputElement).checked)"
              class="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            >
            <span class="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Saya telah membaca tata tertib dan <b>siap mengikuti ujian dengan jujur</b>.
            </span>
          </label>

          <!-- Start CTA -->
          <button
            type="button"
            class="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 text-white transition-all"
            :class="agreeStart ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30' : 'bg-slate-300 cursor-not-allowed opacity-60'"
            :disabled="!agreeStart"
            @click="$emit('start-exam')"
          >
            <span>Mulai Ujian</span>
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 4 20 12 6 20" fill="currentColor" stroke="none"/></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LoginForm, SectionItem } from '~/composables/useCbtExam'

defineProps<{
  screen: string
  jenjangText: string
  grade: string
  loginForm: LoginForm
  totalQuestions: number
  sections: SectionItem[]
  openedAcc: string
  agreeStart: boolean
  secRange: (secId: string) => number[]
}>()

defineEmits<{
  (e: 'toggle-acc', id: string): void
  (e: 'update:agreeStart', val: boolean): void
  (e: 'start-exam'): void
}>()
</script>
