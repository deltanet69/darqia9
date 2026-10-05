<template>
  <div class="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased">
    <!-- SCREEN 1 : LOGIN -->
    <CbtLoginScreen
      :screen="cbt.screen.value"
      :jenjang-text="cbt.jenjangText.value"
      :login-form="cbt.loginForm"
      @login="cbt.doLogin"
      @fill-demo="cbt.fillDemo"
    />

    <!-- SCREEN 2 : VERIFIKASI & TATA TERTIB -->
    <CbtConfirmScreen
      :screen="cbt.screen.value"
      :jenjang-text="cbt.jenjangText.value"
      :grade="cbt.grade.value"
      :login-form="cbt.loginForm"
      :total-questions="cbt.totalQuestions.value"
      :sections="cbt.sections"
      :opened-acc="cbt.openedAcc.value"
      :agree-start="cbt.agreeStart.value"
      :sec-range="cbt.secRange"
      @toggle-acc="cbt.toggleAcc"
      @update:agree-start="cbt.setAgreeStart"
      @start-exam="cbt.startExam"
    />

    <!-- SCREEN 3 : UJIAN -->
    <CbtExamScreen
      :screen="cbt.screen.value"
      :grade="cbt.grade.value"
      :remaining-time="cbt.remainingTime.value"
      :is-saving="cbt.isSaving.value"
      :is-timer-frozen="cbt.isTimerFrozen.value"
      :sections="cbt.sections"
      :questions="cbt.questions.value"
      :cur-question="cbt.curQuestion.value"
      :total-questions="cbt.totalQuestions.value"
      :q-idx="cbt.qIdx.value"
      :answered-count="cbt.answeredCount.value"
      :answers="cbt.answers"
      :letters="cbt.letters"
      :audio-playing="cbt.audioPlaying.value"
      :show-mobile-palette="cbt.showMobilePalette.value"
      :fmt-time="cbt.fmtTime"
      :is-section-done="cbt.isSectionDone"
      :section-done-count="cbt.sectionDoneCount"
      :sec-range="cbt.secRange"
      :type-label="cbt.typeLabel"
      :is-flagged="cbt.isFlagged"
      :is-answered="cbt.isAnswered"
      :is-option-selected="cbt.isOptionSelected"
      :count-words="cbt.countWords"
      @go-to-section="cbt.goToSection"
      @toggle-flag="cbt.toggleFlag"
      @toggle-audio="cbt.toggleAudio"
      @toast="cbt.triggerToast"
      @select-option="cbt.selectOption"
      @text-input="cbt.onTextAnswerInput"
      @go-to="cbt.goTo"
      @open-mobile-palette="cbt.openMobilePalette"
      @update:show-mobile-palette="cbt.setShowMobilePalette"
      @next="cbt.handleNextClick"
      @go-review="cbt.goReview"
    />

    <!-- SCREEN 4 : REVIEW & SUBMIT -->
    <CbtReviewScreen
      :screen="cbt.screen.value"
      :remaining-time="cbt.remainingTime.value"
      :answered-count="cbt.answeredCount.value"
      :unanswered-count="cbt.unansweredCount.value"
      :flagged-count="cbt.flaggedCount.value"
      :total-questions="cbt.totalQuestions.value"
      :sections="cbt.sections"
      :rev-filter="cbt.revFilter.value"
      :filtered-questions="cbt.filteredQuestions.value"
      :rev-filter-title="cbt.revFilterTitle.value"
      :submit-agree="cbt.submitAgree.value"
      :pring-circumference="cbt.pringCircumference"
      :pring-offset="cbt.pringOffset.value"
      :fmt-time="cbt.fmtTime"
      :section-done-count="cbt.sectionDoneCount"
      :sec-range="cbt.secRange"
      @update:rev-filter="cbt.setRevFilter"
      @update:submit-agree="cbt.setSubmitAgree"
      @go-to-from-review="cbt.goToFromReview"
      @back-to-exam="cbt.goToExamScreen"
      @attempt-submit="cbt.attemptSubmit"
    />

    <!-- SCREEN 5 : SELESAI -->
    <CbtDoneScreen
      :screen="cbt.screen.value"
      :grade="cbt.grade.value"
      :done-msg="cbt.doneMsg.value"
      :done-time="cbt.doneTime.value"
      :done-dur="cbt.doneDur.value"
      :answered-count="cbt.answeredCount.value"
      :total-questions="cbt.totalQuestions.value"
      @reset-home="cbt.resetToHome"
    />

    <!-- TOAST NOTIFICATION -->
    <div
      v-if="cbt.toastMsg.value !== ''"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-2xl border border-slate-700 animate-fadeIn"
    >
      {{ cbt.toastMsg.value }}
    </div>

    <!-- MODAL POPUP & ANTI-CHEAT -->
    <CbtCheatModal
      :grade="cbt.grade.value"
      :modal="cbt.modal"
      @back-click="cbt.onModalBackClick"
      @close="cbt.closeModal"
      @ok="cbt.handleModalOk"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useCbtExam } from '~/composables/useCbtExam'
import CbtLoginScreen from '~/components/cbt/CbtLoginScreen.vue'
import CbtConfirmScreen from '~/components/cbt/CbtConfirmScreen.vue'
import CbtExamScreen from '~/components/cbt/CbtExamScreen.vue'
import CbtReviewScreen from '~/components/cbt/CbtReviewScreen.vue'
import CbtDoneScreen from '~/components/cbt/CbtDoneScreen.vue'
import CbtCheatModal from '~/components/cbt/CbtCheatModal.vue'

definePageMeta({
  layout: 'exam'
})

useHead({
  title: 'CBT Online — Ujian Terstandar Komputer Yayasan Darqia Attaqwa',
  meta: [
    { name: 'description', content: 'Aplikasi CBT Ujian Online mandiri SMP IT Bina Cendekia Assalam dan SMK IT Attaqwa 9.' }
  ]
})

const cbt = useCbtExam()

onMounted(() => {
  cbt.registerListeners()
})

onUnmounted(() => {
  cbt.unregisterListeners()
})
</script>
