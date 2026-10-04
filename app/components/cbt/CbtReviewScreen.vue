<template>
  <section id="screen-review" class="screen" :class="{ active: screen === 'review' }">
    <div class="topbar-simple">
      <div class="wrap">
        <div class="mini-logo"><span class="school-logo"></span></div>
        <div><div class="t1">Periksa Kembali</div><div class="t2">Informatika &bull; {{ fmtTime(remainingTime) }} tersisa</div></div>
      </div>
    </div>
    <div class="wrap">
      <div class="page-head">
        <h2>Yakin sudah selesai?</h2>
        <p>Periksa ringkasan jawabanmu sebelum dikumpulkan. Jawaban tidak bisa diubah setelah dikumpulkan.</p>
      </div>

      <div class="rv-cols">
        <div class="rv-left">
          <div class="revhero">
            <div class="revhero-shine"></div>
            <div class="revhero-top">
              <div class="pring">
                <svg viewBox="0 0 84 84">
                  <circle class="pring-bg" cx="42" cy="42" r="36"/>
                  <circle class="pring-fg" cx="42" cy="42" r="36" :style="{ strokeDasharray: pringCircumference, strokeDashoffset: pringOffset }"/>
                </svg>
                <div class="pring-txt"><b>{{ Math.round((answeredCount / totalQuestions) * 100) }}%</b></div>
              </div>
              <div>
                <div class="revhero-kicker">Ringkasan Jawaban</div>
                <div class="revhero-big"><b>{{ answeredCount }}</b> dari {{ totalQuestions }} soal terjawab</div>
                <div class="revhero-sub"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg><span>{{ fmtTime(remainingTime) }} tersisa</span></div>
              </div>
            </div>
            <div class="rstats">
              <button class="rstat" :class="{ on: revFilter === 'ok' }" @click="$emit('update:revFilter', 'ok')"><span class="dot g"></span><div><b>{{ answeredCount }}</b><span class="lbl">Terjawab</span></div></button>
              <button class="rstat" :class="{ on: revFilter === 'un' }" @click="$emit('update:revFilter', 'un')"><span class="dot r"></span><div><b>{{ unansweredCount }}</b><span class="lbl">Belum</span></div></button>
              <button class="rstat" :class="{ on: revFilter === 'fl' }" @click="$emit('update:revFilter', 'fl')"><span class="dot a"></span><div><b>{{ flaggedCount }}</b><span class="lbl">Ragu-ragu</span></div></button>
            </div>
            <div class="rsecs">
              <div v-for="s in sections" :key="s.id" class="rsec">
                <div class="rsec-top"><span>{{ s.title }}</span><b>{{ sectionDoneCount(s.id) }}/{{ secRange(s.id).length }}</b></div>
                <div class="rsec-bar"><i :style="{ width: (sectionDoneCount(s.id) / secRange(s.id).length * 100) + '%' }"></i></div>
              </div>
            </div>
          </div>

          <div v-if="unansweredCount > 0" class="warn-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex:none;margin-top:1px"><path d="M12 9v4M12 17.5v.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
            <span>Perhatian: Tombol kumpulkan <b>terkunci</b> karena masih ada <b>{{ unansweredCount }} soal</b> yang belum dijawab. Lengkapi semua soal sebelum mengumpulkan.</span>
          </div>
        </div>

        <div class="rv-right">
          <div class="rev-filters">
            <button class="rchip" :class="{ on: revFilter === 'all' }" @click="$emit('update:revFilter', 'all')">Semua</button>
            <button class="rchip" :class="{ on: revFilter === 'un' }" @click="$emit('update:revFilter', 'un')">Belum dijawab</button>
            <button class="rchip" :class="{ on: revFilter === 'fl' }" @click="$emit('update:revFilter', 'fl')">Ragu-ragu</button>
            <button class="rchip" :class="{ on: revFilter === 'ok' }" @click="$emit('update:revFilter', 'ok')">Terjawab</button>
          </div>

          <div class="card rev-list-card">
            <div class="sect-title"><span>{{ revFilterTitle }}</span><span class="hint">{{ filteredQuestions.length }} soal</span></div>
            <div class="rev-list">
              <div v-if="filteredQuestions.length === 0" class="rev-empty">Tidak ada soal pada filter ini.</div>
              <button v-for="q in filteredQuestions" :key="q.index" class="rev-item" :class="q.kind" @click="$emit('go-to-from-review', q.index)">
                <span class="rn">{{ q.index + 1 }}</span>
                <span class="rt"><b>{{ q.secTitle }}</b><span>Soal {{ q.index + 1 }}</span></span>
                <span class="rpill" :class="q.kind">{{ q.pillLabel }}</span>
                <svg class="go" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            </div>
          </div>

          <label class="agree2">
            <input type="checkbox" :checked="submitAgree" @change="$emit('update:submitAgree', ($event.target as HTMLInputElement).checked)">
            <span class="abox"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M4.5 12.5l5 5L19.5 7"/></svg></span>
            <span class="atxt">Saya yakin dan ingin <b>mengumpulkan jawaban sekarang</b>.</span>
          </label>

          <div class="cta-sticky">
            <button type="button" class="btn btn-ghost" style="margin-bottom:10px" @click="$emit('back-to-exam')">Kembali ke Soal</button>
            <button type="button" class="btn btn-primary btn-go" :disabled="!submitAgree || unansweredCount > 0" @click="$emit('attempt-submit')">Kumpulkan Jawaban</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FilteredQuestionItem, SectionItem } from '~/composables/useCbtExam'

defineProps<{
  screen: string
  remainingTime: number
  answeredCount: number
  unansweredCount: number
  flaggedCount: number
  totalQuestions: number
  sections: SectionItem[]
  revFilter: string
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
  (e: 'update:revFilter', val: string): void
  (e: 'update:submitAgree', val: boolean): void
  (e: 'go-to-from-review', idx: number): void
  (e: 'back-to-exam'): void
  (e: 'attempt-submit'): void
}>()
</script>
