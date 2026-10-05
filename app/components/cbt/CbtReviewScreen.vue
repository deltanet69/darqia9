<template>
  <section v-show="screen === 'review'" class="min-h-screen pb-20">
    <!-- Topbar Simple -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-30 py-3.5 px-4 sm:px-6 shadow-sm">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/asset/logo.png" alt="Logo" class="w-9 h-9 object-contain">
          <div>
            <div class="text-sm font-extrabold text-slate-900 leading-tight">Periksa Kembali</div>
            <div class="text-xs font-semibold text-slate-500">Informatika &bull; {{ fmtTime(remainingTime) }} tersisa</div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      <!-- Page Head -->
      <div class="text-center sm:text-left mb-6">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Yakin sudah selesai?</h2>
        <p class="text-xs sm:text-sm text-slate-600 mt-1">Periksa ringkasan jawabanmu sebelum dikumpulkan. Jawaban tidak bisa diubah setelah dikumpulkan.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Summary Hero Card + Warning -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-gradient-to-br from-[#0F1E38] via-[#122B52] to-[#0A1A33] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <!-- Top Ring + Info -->
            <div class="flex items-center gap-4 mb-6">
              <div class="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 84 84">
                  <circle cx="42" cy="42" r="36" class="text-white/10" stroke-width="8" stroke="currentColor" fill="transparent" />
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    class="text-blue-400 transition-all duration-500"
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
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-blue-300 block mb-0.5">Ringkasan Jawaban</span>
                <div class="text-base sm:text-lg font-black leading-tight"><b class="text-blue-400">{{ answeredCount }}</b> dari {{ totalQuestions }} soal</div>
                <div class="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                  <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                  <span>{{ fmtTime(remainingTime) }} tersisa</span>
                </div>
              </div>
            </div>

            <!-- Stats 3-Column -->
            <div class="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                class="p-2.5 rounded-xl transition-all text-xs"
                :class="revFilter === 'ok' ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300' : 'bg-white/5 hover:bg-white/10 text-slate-300'"
                @click="$emit('update:revFilter', 'ok')"
              >
                <b class="block text-base font-black text-emerald-400">{{ answeredCount }}</b>
                <span class="text-[11px] font-semibold text-slate-300">Terjawab</span>
              </button>
              <button
                type="button"
                class="p-2.5 rounded-xl transition-all text-xs"
                :class="revFilter === 'un' ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300' : 'bg-white/5 hover:bg-white/10 text-slate-300'"
                @click="$emit('update:revFilter', 'un')"
              >
                <b class="block text-base font-black text-rose-400">{{ unansweredCount }}</b>
                <span class="text-[11px] font-semibold text-slate-300">Belum</span>
              </button>
              <button
                type="button"
                class="p-2.5 rounded-xl transition-all text-xs"
                :class="revFilter === 'fl' ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300' : 'bg-white/5 hover:bg-white/10 text-slate-300'"
                @click="$emit('update:revFilter', 'fl')"
              >
                <b class="block text-base font-black text-amber-400">{{ flaggedCount }}</b>
                <span class="text-[11px] font-semibold text-slate-300">Ragu-ragu</span>
              </button>
            </div>

            <!-- Sections breakdown -->
            <div class="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs">
              <div v-for="s in sections" :key="s.id" class="space-y-1">
                <div class="flex justify-between text-slate-300 font-semibold">
                  <span>{{ s.title }}</span>
                  <b class="text-white">{{ sectionDoneCount(s.id) }}/{{ secRange(s.id).length }}</b>
                </div>
                <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-400 transition-all" :style="{ width: (sectionDoneCount(s.id) / secRange(s.id).length * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Unanswered Warning Banner -->
          <div v-if="unansweredCount > 0" class="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
            <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 9v4M12 17.5v.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
            <span class="leading-relaxed">Perhatian: Tombol kumpulkan <b>terkunci</b> karena masih ada <b>{{ unansweredCount }} soal</b> yang belum dijawab. Lengkapi semua soal sebelum mengumpulkan.</span>
          </div>
        </div>

        <!-- Right Column: Filter Pills + Question List + Submit CTA -->
        <div class="lg:col-span-7 space-y-6">
          <!-- Filters -->
          <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0"
              :class="revFilter === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
              @click="$emit('update:revFilter', 'all')"
            >
              Semua
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0"
              :class="revFilter === 'un' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'"
              @click="$emit('update:revFilter', 'un')"
            >
              Belum Dijawab ({{ unansweredCount }})
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0"
              :class="revFilter === 'fl' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'"
              @click="$emit('update:revFilter', 'fl')"
            >
              Ragu-ragu ({{ flaggedCount }})
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0"
              :class="revFilter === 'ok' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'"
              @click="$emit('update:revFilter', 'ok')"
            >
              Terjawab ({{ answeredCount }})
            </button>
          </div>

          <!-- Question List Card -->
          <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">{{ revFilterTitle }}</h3>
              <span class="text-xs font-semibold text-slate-500">{{ filteredQuestions.length }} soal</span>
            </div>

            <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              <div v-if="filteredQuestions.length === 0" class="text-center py-8 text-xs text-slate-400 font-semibold">
                Tidak ada soal pada filter ini.
              </div>
              <button
                v-for="q in filteredQuestions"
                :key="q.index"
                type="button"
                class="w-full p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-left transition-all hover:border-blue-400 group"
                :class="q.kind === 'un' ? 'border-rose-200 bg-rose-50/40' : q.kind === 'fl' ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50/50'"
                @click="$emit('go-to-from-review', q.index)"
              >
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {{ q.index + 1 }}
                  </span>
                  <div>
                    <b class="block text-xs font-bold text-slate-900">{{ q.secTitle }}</b>
                    <span class="text-[11px] text-slate-500">Soal {{ q.index + 1 }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span
                    class="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    :class="q.kind === 'un' ? 'bg-rose-100 text-rose-700' : q.kind === 'fl' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'"
                  >
                    {{ q.pillLabel }}
                  </span>
                  <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Agreement Checkbox -->
          <label class="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-300 cursor-pointer transition-all">
            <input
              type="checkbox"
              :checked="submitAgree"
              @change="$emit('update:submitAgree', ($event.target as HTMLInputElement).checked)"
              class="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            >
            <span class="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Saya yakin dan ingin <b>mengumpulkan jawaban sekarang</b>.
            </span>
          </label>

          <!-- Sticky Action Buttons -->
          <div class="space-y-3">
            <button
              type="button"
              class="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 text-white transition-all"
              :class="submitAgree && unansweredCount === 0 ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30' : 'bg-slate-300 cursor-not-allowed opacity-60'"
              :disabled="!submitAgree || unansweredCount > 0"
              @click="$emit('attempt-submit')"
            >
              Kumpulkan Jawaban
            </button>
            <button
              type="button"
              class="w-full py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              @click="$emit('back-to-exam')"
            >
              Kembali ke Soal
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FilteredQuestionItem, SectionItem, RevFilterType } from '~/composables/useCbtExam'

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
