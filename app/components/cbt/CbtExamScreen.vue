<template>
  <section id="screen-exam" class="screen" :class="{ active: screen === 'exam' }">
    <div class="exam-sticky">
      <div class="exam-top">
        <div class="inner">
          <div class="exam-brand">
            <div class="mini-logo" style="width:46px;height:46px;border-radius:14px"><span class="school-logo"></span></div>
            <div><div class="t1">Informatika</div><div class="t2">{{ grade === 'SMP' ? 'Informatika & Komputer Dasar' : 'Jaringan Komputer Dasar' }}</div></div>
          </div>
          <span class="save-ind" title="Penyimpanan otomatis aktif"><span class="save-dot" :class="{ saving: isSaving }"></span></span>
          <span class="timer" :class="{ danger: remainingTime <= 300 && remainingTime > 0 }">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            <span>{{ fmtTime(remainingTime) }}</span>
          </span>
        </div>
      </div>

      <div class="tabs">
        <div class="inner">
          <button v-for="s in sections" :key="s.id" class="step" :class="{ active: s.id === curQuestion.sec, done: isSectionDone(s.id) }" @click="$emit('go-to-section', s.id)">
            <span class="step-ico">
              <span v-html="s.icon"></span>
              <span class="step-check" v-if="isSectionDone(s.id)"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" width="11" height="11"><path d="M4.5 12.5l5 5L19.5 7"/></svg></span>
            </span>
            <span class="step-tx">
              <span class="step-name">{{ s.short }}</span>
              <span class="step-sub">{{ sectionDoneCount(s.id) }}/{{ secRange(s.id).length }}</span>
            </span>
            <span class="step-bar"><i :style="{ width: (sectionDoneCount(s.id) / secRange(s.id).length * 100) + '%' }"></i></span>
          </button>
        </div>
      </div>
    </div>

    <div class="exam-layout">
      <main>
        <div class="progress-row">
          <span class="lbl">Soal <b>{{ qIdx + 1 }}</b> dari <b>{{ totalQuestions }}</b></span>
          <div class="pbar"><i :style="{ width: (answeredCount / totalQuestions * 100) + '%' }"></i></div>
          <span class="lbl">{{ answeredCount }} terjawab</span>
        </div>

        <article class="qcard">
          <div class="q-head">
            <span class="q-num">{{ qIdx + 1 }}</span>
            <span class="q-type">{{ typeLabel(curQuestion) }}</span>
            <button class="q-flag" :class="{ on: isFlagged(qIdx) }" @click="$emit('toggle-flag', qIdx)" title="Tandai ragu-ragu" aria-label="Tandai ragu-ragu">
              <svg width="19" height="19" viewBox="0 0 24 24" :fill="isFlagged(qIdx) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>
          <div class="q-text">{{ curQuestion.text }}</div>

          <!-- Single choice / Audio / Video options -->
          <template v-if="curQuestion.type === 'single' || curQuestion.type === 'audio' || curQuestion.type === 'video'">
            <!-- Audio card -->
            <div v-if="curQuestion.type === 'audio'" class="audio-card" :class="{ playing: audioPlaying }">
              <div class="audio-top">
                <button type="button" class="play-btn" @click="$emit('toggle-audio', curQuestion)" aria-label="Putar audio">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>
                </button>
                <div class="audio-meta">
                  <div class="a1">{{ curQuestion.audioTitle || '' }}</div>
                  <div class="a2">{{ curQuestion.audioSub || '' }}</div>
                </div>
              </div>
              <div class="eq"><i v-for="n in 28" :key="n"></i></div>
              <div class="audio-note">Ketuk tombol putar untuk mendengarkan. Audio dapat diputar ulang.</div>
            </div>

            <!-- Video card -->
            <div v-if="curQuestion.type === 'video'" class="video-ph">
              <div class="video-thumb">
                <span class="dur">{{ curQuestion.videoDur || '00:00' }}</span>
                <button type="button" class="play-btn" @click="$emit('toast', 'Mode demo: video ujian akan diputar di sini.')" aria-label="Putar video">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>
                </button>
                <p>{{ curQuestion.videoTitle || 'Video Ujian' }} &bull; mode demo</p>
              </div>
            </div>

            <div class="opts" v-if="curQuestion.options && curQuestion.options.length">
              <button type="button" v-for="(op, oi) in (curQuestion.options || [])" :key="oi" class="opt" :class="{ sel: answers[qIdx] === String(oi) }" @click="$emit('select-option', qIdx, oi)">
                <span class="letter">{{ letters[oi] }}</span>
                <span class="txt">{{ op }}</span>
              </button>
            </div>
          </template>

          <!-- Multiple choice -->
          <template v-else-if="curQuestion.type === 'multiple'">
            <div class="q-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex:none;margin-top:2px"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>
              <span>Soal ini memiliki <b>lebih dari satu</b> jawaban benar. Ketuk semua pilihan yang menurutmu benar.</span>
            </div>
            <div class="opts" v-if="curQuestion.options && curQuestion.options.length">
              <button type="button" v-for="(op, oi) in (curQuestion.options || [])" :key="oi" class="opt multi" :class="{ sel: isOptionSelected(qIdx, oi) }" @click="$emit('select-option', qIdx, oi)">
                <span class="letter">{{ isOptionSelected(qIdx, oi) ? '✓' : letters[oi] }}</span>
                <span class="txt">{{ op }}</span>
              </button>
            </div>
          </template>

          <!-- Short text / Essay -->
          <template v-else-if="curQuestion.type === 'short' || curQuestion.type === 'essay'">
            <div class="ta-wrap">
              <textarea class="ta" :class="{ tall: curQuestion.type === 'essay' }" v-model="answers[qIdx]" @input="$emit('text-input')" :placeholder="curQuestion.placeholder || 'Tulis jawabanmu di sini...'"></textarea>
              <div class="ta-foot">
                <span class="words"><b>{{ countWords(answers[qIdx]) }}</b> kata <template v-if="curQuestion.minWords">&bull; minimal {{ curQuestion.minWords }} kata</template></span>
                <span>Jawaban tersimpan otomatis</span>
              </div>
            </div>
          </template>
        </article>

        <div class="exam-nav">
          <div class="row">
            <button class="nav-btn" id="btn-prev" :disabled="qIdx === 0" @click="$emit('go-to', qIdx - 1)">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
              <span class="nb-t">Sebelumnya</span>
            </button>
            <button class="nav-btn mid" id="btn-palette" @click="$emit('open-mobile-palette')">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              <span>{{ qIdx + 1 }}/{{ totalQuestions }}</span>
            </button>
            <button type="button" class="nav-btn next" id="btn-next" @click="$emit('next')">
              <span class="nb-t">{{ qIdx === totalQuestions - 1 ? 'Periksa & Kumpulkan' : 'Berikutnya' }}</span>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
          <div class="kbd-hint"><kbd>1</kbd>&ndash;<kbd>5</kbd> pilih jawaban &nbsp;&bull;&nbsp; <kbd>&larr;</kbd><kbd>&rarr;</kbd> pindah soal &nbsp;&bull;&nbsp; <kbd>F</kbd> tandai ragu-ragu</div>
        </div>
      </main>

      <aside class="desktop-pal">
        <div class="palette-card">
          <h3>Navigasi Soal</h3>
          <div class="pc-sub">Klik nomor untuk loncat ke soal.</div>
          <div class="pal-grid" id="pal-desktop">
            <button v-for="(_, i) in questions" :key="i" class="pal" :class="{ current: i === qIdx, answered: isAnswered(i) }" @click="$emit('go-to', i)">
              {{ i + 1 }}
              <span class="flagdot" v-if="isFlagged(i)"></span>
            </button>
          </div>
          <div class="legend">
            <span><i class="dot" style="background:var(--blue-600)"></i> Sudah dijawab</span>
            <span><i class="dot" style="background:#fff;border:1.5px solid var(--line)"></i> Belum dijawab</span>
            <span><i class="dot" style="background:var(--amber)"></i> Ditandai ragu-ragu</span>
          </div>
          <button class="btn btn-primary" id="btn-finish-side" @click="$emit('go-review')">Periksa &amp; Kumpulkan</button>
        </div>
      </aside>
    </div>

    <!-- bottom sheet palette (mobile) -->
    <div class="sheet-back" id="sheet-back" :class="{ open: showMobilePalette }" @click="$emit('update:showMobilePalette', false)"></div>
    <div class="sheet" id="sheet" :class="{ open: showMobilePalette }">
      <div class="sheet-handle"></div>
      <div class="sheet-body">
        <div class="palette-card" style="border:none;box-shadow:none;padding:6px 0 0;position:static">
          <h3>Navigasi Soal</h3>
          <div class="pc-sub">{{ answeredCount }} dari {{ totalQuestions }} soal terjawab</div>
          <div class="pal-grid" id="pal-mobile">
            <button v-for="(_, i) in questions" :key="i" class="pal" :class="{ current: i === qIdx, answered: isAnswered(i) }" @click="$emit('update:showMobilePalette', false); $emit('go-to', i)">
              {{ i + 1 }}
              <span class="flagdot" v-if="isFlagged(i)"></span>
            </button>
          </div>
          <div class="legend">
            <span><i class="dot" style="background:var(--blue-600)"></i> Sudah dijawab</span>
            <span><i class="dot" style="background:#fff;border:1.5px solid var(--line)"></i> Belum dijawab</span>
            <span><i class="dot" style="background:var(--amber)"></i> Ditandai ragu-ragu</span>
          </div>
          <button class="btn btn-primary" id="btn-finish-sheet" style="margin-bottom:8px" @click="$emit('update:showMobilePalette', false); $emit('go-review')">Periksa &amp; Kumpulkan</button>
        </div>
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
  sections: SectionItem[]
  questions: QuestionItem[]
  curQuestion: QuestionItem
  totalQuestions: number
  qIdx: number
  answeredCount: number
  answers: { [key: number]: any }
  letters: string[]
  audioPlaying: boolean
  showMobilePalette: boolean
  fmtTime: (sec: number) => string
  isSectionDone: (secId: string) => boolean
  sectionDoneCount: (secId: string) => number
  secRange: (secId: string) => number[]
  typeLabel: (q?: QuestionItem | null) => string
  isFlagged: (i: number) => boolean
  isAnswered: (i: number) => boolean
  isOptionSelected: (i: number, oi: number) => boolean
  countWords: (s: unknown) => number
}>()

defineEmits<{
  (e: 'go-to-section', secId: string): void
  (e: 'toggle-flag', idx: number): void
  (e: 'toggle-audio', q: QuestionItem): void
  (e: 'toast', msg: string): void
  (e: 'select-option', idx: number, oi: number): void
  (e: 'text-input'): void
  (e: 'go-to', idx: number): void
  (e: 'open-mobile-palette'): void
  (e: 'update:showMobilePalette', val: boolean): void
  (e: 'next'): void
  (e: 'go-review'): void
}>()
</script>
