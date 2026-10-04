<template>
  <div class="cbt-page" :data-theme="cbt.grade.value.toLowerCase()">
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
      @update:agree-start="cbt.agreeStart.value = $event"
      @start-exam="cbt.startExam"
    />

    <!-- SCREEN 3 : UJIAN -->
    <CbtExamScreen
      :screen="cbt.screen.value"
      :grade="cbt.grade.value"
      :remaining-time="cbt.remainingTime.value"
      :is-saving="cbt.isSaving.value"
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
      @update:show-mobile-palette="cbt.showMobilePalette.value = $event"
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
      @update:rev-filter="cbt.revFilter.value = $event"
      @update:submit-agree="cbt.submitAgree.value = $event"
      @go-to-from-review="cbt.goToFromReview"
      @back-to-exam="cbt.screen.value = 'exam'"
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
    <div id="toast" :class="{ show: cbt.toastMsg.value !== '' }">{{ cbt.toastMsg.value }}</div>

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

const cbt = useCbtExam()

onMounted(() => {
  cbt.registerListeners()
})

onUnmounted(() => {
  cbt.unregisterListeners()
})
</script>

<style src="~/assets/css/cbt.css"></style>
