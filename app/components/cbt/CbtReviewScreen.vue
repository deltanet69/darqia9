<template>
  <section v-show="screen === 'review'" class="min-h-screen pb-20 bg-[#F1F5F9] antialiased">
    <!-- Topbar Simple & Modern -->
    <div class="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 py-3.5 px-4 sm:px-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
      <div class="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 p-1 flex items-center justify-center shrink-0">
            <img :src="activeGrade === 'SMP' ? '/asset/logosmp.png' : '/asset/logo.png'" alt="Logo" class="w-full h-full object-contain">
          </div>
          <div class="min-w-0">
            <h1 class="text-sm sm:text-base font-black text-slate-900 leading-tight truncate tracking-tight">Periksa Kembali Jawaban</h1>
            <p class="text-xs font-semibold text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
              <svg class="w-3.5 h-3.5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Sisa Waktu: <b class="font-mono text-slate-800">{{ fmtTime(remainingTime) }}</b></span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
      <!-- Judul Halaman -->
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Yakin sudah selesai?</h2>
        <p class="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Periksa ringkasan lembar jawabanmu sebelum dikumpulkan. Setelah dikumpulkan, jawaban tidak dapat diubah lagi.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Kolom Kiri: Kartu Ringkasan Hero + Peringatan Belum Selesai -->
        <div class="lg:col-span-5 space-y-5">
          <div class="bg-gradient-to-br from-[#08152B] via-[#0E2754] to-[#163673] rounded-3xl p-6 text-white shadow-xl shadow-blue-950/20 border border-white/10 relative overflow-hidden">
            <div class="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            <!-- Circular Progress Ring & Info -->
            <div class="flex items-center gap-4 mb-6 relative z-10">
              <div class="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 84 84">
                  <circle cx="42" cy="42" r="36" class="text-white/10" stroke-width="8" stroke="currentColor" fill="transparent" />
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    class="text-sky-400 transition-all duration-500"
                    stroke-width="8"
                    :stroke-dasharray="pringCircumference"
                    :stroke-dashoffset="pringOffset"
                    stroke-linecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span class="absolute font-black text-base">{{ Math.round((answeredCount / totalQuestions) * 100) }}%</span>
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-[10.5px] font-black uppercase tracking-wider text-blue-200 block mb-0.5">Ringkasan Pengerjaan</span>
                <div class="text-lg font-black leading-tight"><b class="text-sky-300">{{ answeredCount }}</b> dari {{ totalQuestions }} Soal</div>
                <div class="text-xs text-blue-100/80 font-medium flex items-center gap-1.5 mt-1">
                  <svg class="w-3.5 h-3.5 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{{ fmtTime(remainingTime) }} tersisa</span>
                </div>
              </div>
            </div>

            <!-- Stats 3-Kolom Interaktif -->
            <div class="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center relative z-10">
              <button
                type="button"
                class="p-2.5 rounded-2xl transition-all text-xs cursor-pointer active:scale-95 border"
                :class="revFilter === 'ok' ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200' : 'bg-white/5 hover:bg-white/10 border-transparent text-slate-300'"
                @click="$emit('update:revFilter', 'ok')"
              >
                <b class="block text-base font-black text-emerald-300">{{ answeredCount }}</b>
                <span class="text-[11px] font-bold">Terjawab</span>
              </button>
              <button
                type="button"
                class="p-2.5 rounded-2xl transition-all text-xs cursor-pointer active:scale-95 border"
                :class="revFilter === 'un' ? 'bg-rose-500/25 border-rose-400/50 text-rose-200' : 'bg-white/5 hover:bg-white/10 border-transparent text-slate-300'"
                @click="$emit('update:revFilter', 'un')"
              >
                <b class="block text-base font-black text-rose-300">{{ unansweredCount }}</b>
                <span class="text-[11px] font-bold">Belum</span>
              </button>
              <button
                type="button"
                class="p-2.5 rounded-2xl transition-all text-xs cursor-pointer active:scale-95 border"
                :class="revFilter === 'fl' ? 'bg-amber-500/25 border-amber-400/50 text-amber-200' : 'bg-white/5 hover:bg-white/10 border-transparent text-slate-300'"
                @click="$emit('update:revFilter', 'fl')"
              >
                <b class="block text-base font-black text-amber-300">{{ flaggedCount }}</b>
                <span class="text-[11px] font-bold">Ragu-ragu</span>
              </button>
            </div>

            <!-- Sections Breakdown Progress Bars -->
            <div class="mt-4 pt-4 border-t border-white/10 space-y-2.5 text-xs relative z-10">
              <div v-for="s in sections" :key="s.id" class="space-y-1">
                <div class="flex justify-between text-blue-100/90 font-bold">
                  <span>{{ s.title }}</span>
                  <b class="text-white font-mono">{{ sectionDoneCount(s.id) }}/{{ secRange(s.id).length }}</b>
                </div>
                <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full bg-sky-400 rounded-full transition-all" :style="{ width: (sectionDoneCount(s.id) / secRange(s.id).length * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Banner Peringatan Bila Masih Ada Soal Kosong -->
          <div v-if="unansweredCount > 0" class="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span class="leading-relaxed font-semibold">
              Perhatian: Tombol kumpulkan <b>terkunci</b> karena masih ada <b>{{ unansweredCount }} soal</b> yang belum dijawab. Lengkapi seluruh butir soal sebelum mengumpulkan ujian.
            </span>
          </div>
        </div>

        <!-- Kolom Kanan: Filter Tabs + List Soal + CTA Kumpulkan -->
        <div class="lg:col-span-7 space-y-5">
          <!-- Filter Kategori Soal -->
          <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-black transition-all border shrink-0 cursor-pointer active:scale-95"
              :class="revFilter === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
              @click="$emit('update:revFilter', 'all')"
            >
              Semua Soal
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-black transition-all border shrink-0 cursor-pointer active:scale-95"
              :class="revFilter === 'un' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'"
              @click="$emit('update:revFilter', 'un')"
            >
              Belum Dijawab ({{ unansweredCount }})
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-black transition-all border shrink-0 cursor-pointer active:scale-95"
              :class="revFilter === 'fl' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'"
              @click="$emit('update:revFilter', 'fl')"
            >
              Ragu-ragu ({{ flaggedCount }})
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-black transition-all border shrink-0 cursor-pointer active:scale-95"
              :class="revFilter === 'ok' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'"
              @click="$emit('update:revFilter', 'ok')"
            >
              Terjawab ({{ answeredCount }})
            </button>
          </div>

          <!-- List Soal Terfilter -->
          <div class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">{{ revFilterTitle }}</h3>
              <span class="text-xs font-bold text-slate-500">{{ filteredQuestions.length }} Soal</span>
            </div>

            <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              <div v-if="filteredQuestions.length === 0" class="text-center py-8 text-xs text-slate-400 font-semibold">
                Tidak ada butir soal pada filter ini.
              </div>
              <button
                v-for="q in filteredQuestions"
                :key="q.index"
                type="button"
                class="w-full p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-left transition-all hover:border-blue-400 group cursor-pointer active:scale-95"
                :class="q.kind === 'un' ? 'border-rose-200 bg-rose-50/40' : q.kind === 'fl' ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200/80 bg-slate-50/50'"
                @click="$emit('go-to-from-review', q.index)"
              >
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {{ q.index + 1 }}
                  </span>
                  <div>
                    <b class="block text-xs font-extrabold text-slate-900">{{ q.secTitle }}</b>
                    <span class="text-[11px] text-slate-500 font-medium">Soal {{ q.index + 1 }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span
                    class="text-[11px] font-black px-2.5 py-1 rounded-full border shadow-2xs"
                    :class="q.kind === 'un' ? 'bg-rose-100 border-rose-200 text-rose-700' : q.kind === 'fl' ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-emerald-100 border-emerald-200 text-emerald-700'"
                  >
                    {{ q.pillLabel }}
                  </span>
                  <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Konfirmasi Persetujuan Kumpul -->
          <label class="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200/90 bg-white hover:border-blue-300 cursor-pointer transition-all shadow-2xs">
            <input
              type="checkbox"
              :checked="submitAgree"
              @change="$emit('update:submitAgree', ($event.target as HTMLInputElement).checked)"
              class="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            >
            <span class="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
              Saya telah memeriksa seluruh jawaban dan <b>yakin ingin mengumpulkan lembar ujian sekarang</b>.
            </span>
          </label>

          <!-- Tombol Aksi Kumpul / Kembali -->
          <div class="space-y-2.5 pt-1">
            <button
              type="button"
              class="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 text-white transition-all cursor-pointer active:scale-[0.98]"
              :class="submitAgree && unansweredCount === 0 ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30' : 'bg-slate-300 cursor-not-allowed opacity-60'"
              :disabled="!submitAgree || unansweredCount > 0"
              @click="$emit('attempt-submit')"
            >
              <span>Kumpulkan Lembar Jawaban</span>
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button
              type="button"
              class="w-full py-3 px-6 rounded-2xl font-black text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
              @click="$emit('back-to-exam')"
            >
              Kembali ke Lembar Soal
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAdminGrade } from '~/composables/useAdminGrade'
import type { FilteredQuestionItem, SectionItem, RevFilterType } from '~/composables/useCbtExam'

const activeGrade = useAdminGrade()

defineProps<{
  screen: string
  remainingTime: number
  answeredCount: number
  unansweredCount: number
  flaggedCount: number
  totalQuestions: number
  sections: SectionItem[]
  revFilter: RevFilterType | string
  filteredQuestions: FilteredQuestionItem[]
  revFilterTitle: string
  submitAgree: boolean
  pringCircumference: string
  pringOffset: string
  fmtTime: (sec: number) => string
  sectionDoneCount: (secId: string) => number
  secRange: (secId: string) => number[]
}>()

defineEmits<{
  (e: 'update:revFilter', val: RevFilterType): void
  (e: 'update:submitAgree', val: boolean): void
  (e: 'go-to-from-review', idx: number): void
  (e: 'back-to-exam'): void
  (e: 'attempt-submit'): void
}>()
</script>