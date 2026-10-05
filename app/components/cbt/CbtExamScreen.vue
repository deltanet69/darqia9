<template>
  <section v-show="screen === 'exam'" class="min-h-screen pb-24 lg:pb-12 flex flex-col justify-between">
    <!-- Exam Sticky Header -->
    <div class="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div v-if="isTimerFrozen" class="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
        <svg class="w-4 h-4 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Ujian sedang dibekukan sementara oleh pengawas. Timer ujian dijeda.</span>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <!-- Subject Info -->
        <div class="flex items-center gap-3">
          <img src="/asset/logo.png" alt="Logo" class="w-9 h-9 sm:w-10 sm:h-10 object-contain">
          <div>
            <div class="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">Informatika</div>
            <div class="text-[11px] sm:text-xs font-semibold text-slate-500">{{ grade === 'SMP' ? 'Informatika & Komputer Dasar' : 'Jaringan Komputer Dasar' }}</div>
          </div>
        </div>

        <!-- Auto-save & Timer -->
        <div class="flex items-center gap-3">
          <span class="relative flex h-3 w-3" title="Penyimpanan otomatis aktif">
            <span v-if="isSaving" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3" :class="isSaving ? 'bg-emerald-500' : 'bg-slate-300'"></span>
          </span>

          <span
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm transition-colors"
            :class="remainingTime <= 300 && remainingTime > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-800'"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            <span>{{ fmtTime(remainingTime) }}</span>
          </span>
        </div>
      </div>

      <!-- Section Tabs Bar -->
      <div class="border-t border-slate-100 bg-slate-50/70">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto py-2 no-scrollbar">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border"
            :class="s.id === curQuestion.sec ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : isSectionDone(s.id) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'"
            @click="$emit('go-to-section', s.id)"
          >
            <span v-html="s.icon" class="w-3.5 h-3.5 flex items-center justify-center"></span>
            <span>{{ s.short }}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full" :class="s.id === curQuestion.sec ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'">
              {{ sectionDoneCount(s.id) }}/{{ secRange(s.id).length }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Exam Content Area -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Main Question Area -->
        <main class="lg:col-span-8 flex flex-col justify-between space-y-6">
          <!-- Progress Bar -->
          <div class="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>Soal <b class="text-slate-900">{{ qIdx + 1 }}</b> dari <b class="text-slate-900">{{ totalQuestions }}</b></span>
            <div class="flex-1 max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-600 transition-all duration-300" :style="{ width: (answeredCount / totalQuestions * 100) + '%' }"></div>
            </div>
            <span>{{ answeredCount }} terjawab</span>
          </div>

          <!-- Question Card -->
          <article class="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div class="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <span class="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">{{ qIdx + 1 }}</span>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">{{ typeLabel(curQuestion) }}</span>
              </div>
              <button
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                :class="isFlagged(qIdx) ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                @click="$emit('toggle-flag', qIdx)"
                title="Tandai ragu-ragu"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" :fill="isFlagged(qIdx) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                <span>Ragu-ragu</span>
              </button>
            </div>

            <!-- Question Text -->
            <div class="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
              {{ curQuestion.text }}
            </div>

            <!-- Single choice / Audio / Video options -->
            <template v-if="curQuestion.type === 'single' || curQuestion.type === 'audio' || curQuestion.type === 'video'">
              <!-- Audio card -->
              <div v-if="curQuestion.type === 'audio'" class="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-transform hover:scale-105"
                    @click="$emit('toggle-audio', curQuestion)"
                    aria-label="Putar audio"
                  >
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>
                  </button>
                  <div>
                    <div class="text-xs font-bold text-blue-950">{{ curQuestion.audioTitle || 'Audio Ujian' }}</div>
                    <div class="text-[11px] text-blue-700">{{ curQuestion.audioSub || 'Ketuk untuk mendengarkan' }}</div>
                  </div>
                </div>
                <div class="text-[11px] text-slate-500">Audio dapat diputar ulang jika diperlukan.</div>
              </div>

              <!-- Video card -->
              <div v-if="curQuestion.type === 'video'" class="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-center">
                <div class="text-xs font-bold text-slate-300">{{ curQuestion.videoTitle || 'Video Ujian' }} &bull; Mode Demo</div>
                <button
                  type="button"
                  class="mx-auto w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                  @click="$emit('toast', 'Mode demo: video ujian akan diputar di sini.')"
                >
                  <svg class="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>
                </button>
              </div>

              <!-- Options Grid -->
              <div class="space-y-3" v-if="curQuestion.options && curQuestion.options.length">
                <button
                  type="button"
                  v-for="(op, oi) in (curQuestion.options || [])"
                  :key="oi"
                  class="w-full p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all duration-150 group"
                  :class="answers[qIdx] === String(oi) ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
                  @click="$emit('select-option', qIdx, oi)"
                >
                  <span
                    class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors"
                    :class="answers[qIdx] === String(oi) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'"
                  >
                    {{ letters[oi] }}
                  </span>
                  <span class="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed pt-0.5">{{ op }}</span>
                </button>
              </div>
            </template>

            <!-- Multiple choice -->
            <template v-else-if="curQuestion.type === 'multiple'">
              <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>
                <span>Soal ini memiliki <b>lebih dari satu</b> jawaban benar. Pilih semua jawaban yang menurutmu benar.</span>
              </div>
              <div class="space-y-3" v-if="curQuestion.options && curQuestion.options.length">
                <button
                  type="button"
                  v-for="(op, oi) in (curQuestion.options || [])"
                  :key="oi"
                  class="w-full p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all duration-150 group"
                  :class="isOptionSelected(qIdx, oi) ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
                  @click="$emit('select-option', qIdx, oi)"
                >
                  <span
                    class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors"
                    :class="isOptionSelected(qIdx, oi) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'"
                  >
                    {{ isOptionSelected(qIdx, oi) ? '✓' : letters[oi] }}
                  </span>
                  <span class="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed pt-0.5">{{ op }}</span>
                </button>
              </div>
            </template>

            <!-- Short text / Essay -->
            <template v-else-if="curQuestion.type === 'short' || curQuestion.type === 'essay'">
              <div class="space-y-2">
                <textarea
                  v-model="answers[qIdx]"
                  @input="$emit('text-input')"
                  :rows="curQuestion.type === 'essay' ? 6 : 3"
                  :placeholder="curQuestion.placeholder || 'Tulis jawabanmu di sini...'"
                  class="w-full p-4 text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                ></textarea>
                <div class="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                  <span><b>{{ countWords(answers[qIdx]) }}</b> kata <template v-if="curQuestion.minWords">&bull; minimal {{ curQuestion.minWords }} kata</template></span>
                  <span>Jawaban tersimpan otomatis</span>
                </div>
              </div>
            </template>
          </article>

          <!-- Navigation Row (Bottom) -->
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <button
                type="button"
                :disabled="qIdx === 0"
                class="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-2 transition-all"
                :class="qIdx === 0 ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'"
                @click="$emit('go-to', qIdx - 1)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                class="lg:hidden px-4 py-3 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 flex items-center gap-1.5"
                @click="$emit('open-mobile-palette')"
              >
                <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                <span>{{ qIdx + 1 }}/{{ totalQuestions }}</span>
              </button>

              <button
                type="button"
                class="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all"
                @click="$emit('next')"
              >
                <span>{{ qIdx === totalQuestions - 1 ? 'Periksa & Kumpulkan' : 'Berikutnya' }}</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>

            <div class="hidden sm:block text-center text-[11px] text-slate-400">
              Pintasan keyboard: <kbd class="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px]">1</kbd>&ndash;<kbd class="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px]">5</kbd> opsi &bull; <kbd class="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px]">&larr;</kbd><kbd class="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px]">&rarr;</kbd> navigasi &bull; <kbd class="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px]">F</kbd> ragu-ragu
            </div>
          </div>
        </main>

        <!-- Desktop Palette Sidebar -->
        <aside class="hidden lg:block lg:col-span-4 space-y-6">
          <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-6 shadow-sm sticky top-36">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">Navigasi Soal</h3>
            <p class="text-xs text-slate-500 mb-4">Klik nomor untuk berpindah soal.</p>

            <div class="grid grid-cols-5 gap-2 mb-6">
              <button
                v-for="(_, i) in questions"
                :key="i"
                type="button"
                class="relative h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all border"
                :class="i === qIdx ? 'border-blue-600 bg-blue-600 text-white shadow-md ring-2 ring-blue-200' : isAnswered(i) ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                @click="$emit('go-to', i)"
              >
                {{ i + 1 }}
                <span v-if="isFlagged(i)" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
              </button>
            </div>

            <div class="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600 mb-6">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Sudah dijawab</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-white border border-slate-300"></span>
                <span>Belum dijawab</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Ditandai ragu-ragu</span>
              </div>
            </div>

            <button
              type="button"
              class="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all"
              @click="$emit('go-review')"
            >
              Periksa &amp; Kumpulkan
            </button>
          </div>
        </aside>
      </div>
    </div>

    <!-- Bottom Sheet Drawer for Mobile Palette -->
    <div
      v-if="showMobilePalette"
      class="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm lg:hidden"
      @click.self="$emit('update:showMobilePalette', false)"
    >
      <div class="bg-white rounded-t-3xl p-6 shadow-2xl max-h-[75vh] overflow-y-auto space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black text-slate-900 uppercase">Navigasi Soal</h3>
          <button
            type="button"
            class="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
            @click="$emit('update:showMobilePalette', false)"
          >
            ✕
          </button>
        </div>

        <div class="grid grid-cols-5 gap-2.5">
          <button
            v-for="(_, i) in questions"
            :key="i"
            type="button"
            class="relative h-11 rounded-xl font-bold text-xs flex items-center justify-center border"
            :class="i === qIdx ? 'border-blue-600 bg-blue-600 text-white' : isAnswered(i) ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-600'"
            @click="$emit('go-to', i); $emit('update:showMobilePalette', false)"
          >
            {{ i + 1 }}
            <span v-if="isFlagged(i)" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
          </button>
        </div>

        <button
          type="button"
          class="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
          @click="$emit('go-review'); $emit('update:showMobilePalette', false)"
        >
          Periksa &amp; Kumpulkan
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { QuestionItem, SectionItem } from '~/composables/useCbtExam'

defineProps<{
  screen: string
  grade: string
  remainingTime: number
  isSaving: boolean
  isTimerFrozen: boolean
  sections: SectionItem[]
  questions: QuestionItem[]
  curQuestion: QuestionItem
  totalQuestions: number
  qIdx: number
  answeredCount: number
  answers: Record<number, string>
  letters: string[]
  audioPlaying: boolean
  showMobilePalette: boolean
  fmtTime: (sec: number) => string
  isSectionDone: (secId: string) => boolean
  sectionDoneCount: (secId: string) => number
  secRange: (secId: string) => number[]
  typeLabel: (q: QuestionItem) => string
  isFlagged: (idx: number) => boolean
  isAnswered: (idx: number) => boolean
  isOptionSelected: (qIdx: number, optIdx: number) => boolean
  countWords: (text?: string) => number
}>()

defineEmits<{
  (e: 'go-to-section', secId: string): void
  (e: 'toggle-flag', qIdx: number): void
  (e: 'toggle-audio', q: QuestionItem): void
  (e: 'toast', msg: string): void
  (e: 'select-option', qIdx: number, optIdx: number): void
  (e: 'text-input'): void
  (e: 'go-to', idx: number): void
  (e: 'open-mobile-palette'): void
  (e: 'update:showMobilePalette', val: boolean): void
  (e: 'next'): void
  (e: 'go-review'): void
}>()
</script>
