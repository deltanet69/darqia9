<template>
  <section v-show="screen === 'confirm'" class="min-h-screen pb-16 bg-[#F1F5F9] antialiased">
    <!-- Header Sticky -->
    <div class="bg-white/95 border-b border-slate-200/90 sticky top-0 z-30 py-3 px-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
      <div class="max-w-xl mx-auto flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-merek-50 border border-merek-100 p-1 flex items-center justify-center shrink-0">
            <img :src="grade === 'SMP' ? '/asset/logosmp.png' : '/asset/logo.png'" alt="Logo" class="w-full h-full object-contain">
          </div>
          <div class="min-w-0">
            <div class="text-sm font-black text-slate-900 leading-tight truncate tracking-tight">{{ jenjangText }}</div>
            <div class="text-xs font-semibold text-slate-500">Konfirmasi Sesi Ujian</div>
          </div>
        </div>
        <button
          type="button"
          class="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-white cursor-pointer transition-colors shadow-2xs active:scale-95"
          @click="$emit('kembali')"
        >
          Batal
        </button>
      </div>
    </div>

    <div class="max-w-xl mx-auto px-4 pt-5 space-y-4">
      <!-- Hero Briefing Card Ujian (Keren, Menarik & Informatif) -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-merek-d1 via-merek-d2 to-merek-d3 p-5 sm:p-6 text-white shadow-xl shadow-merek-950/20 border border-white/10">
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-merek-500/20 rounded-full blur-3xl pointer-events-none" />
        <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-merek2-500/15 rounded-full blur-3xl pointer-events-none" />

        <div class="relative z-10 space-y-3">
          <!-- Top Tag -->
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sesi Terbuka &bull; Terverifikasi</span>
            </span>
            <span class="text-xs font-bold text-merek-200 font-mono">{{ token }}</span>
          </div>

          <!-- Exam Title -->
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight break-words">
              {{ exam?.subject }}
            </h2>
            <p class="text-xs sm:text-sm text-merek-100/90 font-medium mt-1 break-words">
              {{ exam?.name }}
            </p>
          </div>

          <!-- 3 Quick Specs Pills -->
          <div class="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
            <div class="bg-white/10 rounded-2xl p-2.5 border border-white/10">
              <span class="block text-[10px] text-merek-200 uppercase font-bold">Durasi</span>
              <b class="text-xs sm:text-sm text-white font-black mt-0.5 block">{{ exam?.duration }} Menit</b>
            </div>
            <div class="bg-white/10 rounded-2xl p-2.5 border border-white/10">
              <span class="block text-[10px] text-merek-200 uppercase font-bold">Total Soal</span>
              <b class="text-xs sm:text-sm text-white font-black mt-0.5 block">{{ totalQuestions }} Butir</b>
            </div>
            <div class="bg-white/10 rounded-2xl p-2.5 border border-white/10">
              <span class="block text-[10px] text-merek-200 uppercase font-bold">Ruang</span>
              <b class="text-xs sm:text-sm text-white font-black mt-0.5 block truncate">{{ ruang || 'Online' }}</b>
            </div>
          </div>
        </div>
      </div>

      <!-- Kartu Identitas Peserta -->
      <div class="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black uppercase tracking-wider text-slate-500">Identitas Peserta Ujian</span>
          <span class="text-[11px] font-bold text-merek-700 bg-merek-50 px-2.5 py-0.5 rounded-full border border-merek-200">Peserta Sah</span>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-merek-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
            {{ exam?.studentName ? exam.studentName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'PS' }}
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-base font-black text-slate-900 leading-tight break-words">{{ exam?.studentName }}</h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">NIS <b class="font-mono text-slate-800">{{ nis }}</b> &bull; Kelas {{ exam?.classroom }}</p>
          </div>
        </div>
      </div>

      <!-- Komposisi Soal Accordion -->
      <div class="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-500">Komposisi Butir Soal</h3>
          <span class="text-xs font-semibold text-slate-400">Ketuk untuk rincian</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="sec in sectionsAda"
            :key="sec.id"
            class="border rounded-2xl overflow-hidden transition-all duration-150"
            :class="openedAcc === sec.id ? 'border-merek-500 bg-merek-50/20 ring-1 ring-merek-100' : 'border-slate-200/90 bg-white'"
          >
            <button
              type="button"
              class="w-full p-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
              @click="$emit('toggle-acc', sec.id)"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2 h-2 rounded-full bg-merek-600 shrink-0" />
                <span class="text-xs sm:text-sm font-black text-slate-900 truncate">{{ sec.title }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">{{ secRange(sec.id).length }} Soal</span>
                <svg
                  class="w-4 h-4 text-slate-400 transition-transform duration-200"
                  :class="{ 'rotate-180 text-merek-600': openedAcc === sec.id }"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                ><path d="M6 9l6 6 6-6" /></svg>
              </div>
            </button>
            <div v-show="openedAcc === sec.id" class="px-4 pb-3.5 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100" v-html="sec.desc" />
          </div>
        </div>
      </div>

      <!-- Tata Tertib & Ketentuan Integritas -->
      <div class="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-500">Ketentuan Penting Ujian</h3>
        <ul class="space-y-2 text-xs text-slate-700 leading-relaxed">
          <li class="flex items-start gap-2">
            <svg class="w-4 h-4 text-merek-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Waktu berjalan otomatis selama <b>{{ exam?.duration }} menit</b> dan tidak dapat diulang.</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Jawaban tersimpan otomatis ke server setiap 10 detik.</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Dilarang keluar jendela/tab browser. Pelanggaran ke-3 mengunci akun total.</span>
          </li>
        </ul>
      </div>

      <!-- Checklist Persetujuan -->
      <label
        class="flex items-start gap-3 p-4 rounded-2xl border-2 bg-white cursor-pointer transition-all duration-150 shadow-2xs"
        :class="agreeStart ? 'border-merek-600 bg-merek-50/40 ring-2 ring-merek-100' : 'border-slate-200/90'"
      >
        <input
          type="checkbox"
          :checked="agreeStart"
          class="mt-0.5 w-4 h-4 text-merek-600 rounded focus:ring-merek-500 cursor-pointer"
          @change="$emit('update:agreeStart', ($event.target as HTMLInputElement).checked)"
        >
        <span class="text-xs sm:text-sm text-slate-900 leading-relaxed font-bold">
          Saya telah memeriksa data di atas dan siap mengerjakan ujian dengan tertib dan jujur.
        </span>
      </label>

      <!-- Tombol Aksi Mulai Ujian -->
      <div class="space-y-2.5 pt-1">
        <button
          type="button"
          class="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base text-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          :class="agreeStart ? 'bg-merek-600 hover:bg-merek-700 shadow-xl shadow-merek-500/30' : 'bg-slate-300 cursor-not-allowed opacity-60'"
          :disabled="!agreeStart"
          @click="$emit('start-exam')"
        >
          <span>Mulai Mengerjakan Ujian</span>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SectionItem } from '~/composables/useCbtExam'

const props = defineProps<{
  screen: string
  exam?: { studentName: string; classroom: string; code: string; name: string; subject: string; duration: number } | null
  jenjangText: string
  grade: string
  nis: string
  token: string
  ruang?: string | null
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
  (e: 'kembali'): void
}>()

// Hanya bagian yang benar-benar ada di bank soal ujian ini.
const sectionsAda = computed(() => props.sections.filter(sec => props.secRange(sec.id).length > 0))
</script>