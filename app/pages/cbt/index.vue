<template>
  <div :class="{ 'tema-smp': cbt.grade.value === 'SMP' }" class="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased">
    <!-- SCREEN 1 : LOGIN -->
    <CbtLoginScreen
      :screen="cbt.screen.value"
      :jenjang-text="cbt.jenjangText.value"
      :login-form="cbt.loginForm"
      :loading="cbt.loadingExam.value"
      @login="cbt.doLogin"
    />

    <!-- SCREEN 1B : APLIKASI SISWA (Beranda, Jadwal Ujian, Rekap Ujian, Profil) -->
    <CbtAppScreen
      v-model:tab="cbt.appTab.value"
      :screen="cbt.screen.value"
      :jenjang-text="cbt.jenjangText.value"
      :profil="cbt.siswa.state.value.siswa"
      :ujian="cbt.siswa.state.value.ujian"
      :rekap="cbt.siswa.state.value.rekap"
      :memuat="cbt.siswa.state.value.memuat"
      :sekarang="cbt.siswa.sekarang"
      @buka-ujian="cbt.bukaUjian"
      @muat-ulang="segarkan"
      @keluar="cbt.keluarAplikasi"
    />

    <!-- SCREEN 2 : VERIFIKASI & TATA TERTIB -->
    <CbtConfirmScreen
      :screen="cbt.screen.value"
      :jenjang-text="cbt.jenjangText.value"
      :grade="cbt.grade.value"
      :nis="cbt.siswa.state.value.siswa?.nis ?? ''"
      :token="cbt.siswa.state.value.siswa?.token ?? ''"
      :ruang="cbt.siswa.state.value.siswa?.ruang"
      :total-questions="cbt.totalQuestions.value"
      :exam="cbt.activeExam.value"
      :sections="cbt.sections"
      :opened-acc="cbt.openedAcc.value"
      :agree-start="cbt.agreeStart.value"
      :sec-range="cbt.secRange"
      @toggle-acc="cbt.toggleAcc"
      @update:agree-start="cbt.setAgreeStart"
      @start-exam="cbt.startExam"
      @kembali="cbt.screen.value = 'app'"
    />

    <!-- SCREEN 3 : UJIAN -->
    <CbtExamScreen
      v-if="muatUjian"
      :screen="cbt.screen.value"
      :grade="cbt.grade.value"
      :remaining-time="cbt.remainingTime.value"
      :is-saving="cbt.isSaving.value"
      :is-timer-frozen="cbt.isTimerFrozen.value"
      :sections="cbt.sections"
      :questions="cbt.questions.value"
      :cur-question="cbt.curQuestion.value"
      :exam="cbt.activeExam.value"
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
      :violations="cbt.violations.value"
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
      @simulate-violation="cbt.simulateViolation"
    />

    <!-- SCREEN 4 : REVIEW & SUBMIT -->
    <CbtReviewScreen
      v-if="muatUjian"
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
      :student-name="cbt.activeExam.value?.studentName ?? ''"
      :subject="cbt.activeExam.value?.subject ?? ''"
      :exam-name="cbt.activeExam.value?.name ?? ''"
      :hasil="cbt.hasil.value"
      :done-msg="cbt.doneMsg.value"
      :done-time="cbt.doneTime.value"
      :done-dur="cbt.doneDur.value"
      :answered-count="cbt.answeredCount.value"
      :total-questions="cbt.totalQuestions.value"
      @reset-home="cbt.resetToHome"
    />

    <!-- MENGHITUNG NILAI (setelah mengumpulkan) -->
    <div v-if="cbt.menghitung.value" class="fixed inset-0 z-[200] flex items-center justify-center bg-merek-d1/80 p-6" role="status" aria-live="polite">
      <div class="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div class="relative mx-auto h-20 w-20">
          <span class="absolute inset-0 rounded-full border-4 border-merek-100" />
          <span class="absolute inset-0 rounded-full border-4 border-transparent border-t-merek-600 border-r-merek2-500 animate-spin" />
          <span class="absolute inset-3 rounded-full bg-merek-50 animate-pulse" />
        </div>
        <p class="mt-4 text-base font-black text-slate-900">Menghitung nilaimu…</p>
        <p class="mt-1 text-xs text-slate-500">Jawaban sedang diperiksa. Mohon tunggu sebentar dan jangan tutup halaman ini.</p>
      </div>
    </div>

    <!-- LAYAR PENUH WAJIB: muncul saat ujian berjalan di luar layar penuh (setelah muat ulang atau keluar layar penuh) -->
    <div
      v-if="cbt.perluLayarPenuh.value"
      class="fixed inset-0 z-[150] flex items-center justify-center bg-merek-d1/95 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-layar-penuh"
    >
      <div class="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl">
        <p id="judul-layar-penuh" class="text-base font-black text-slate-900">Ujian harus dalam layar penuh</p>
        <p class="mt-1 text-xs text-slate-500">Layar penuh menyembunyikan bilah status selama ujian. Timer tetap berjalan dan jawabanmu aman.</p>
        <button type="button" class="mt-4 min-h-12 w-full rounded-2xl bg-merek-600 text-sm font-bold text-white active:scale-95" @click="cbt.masukLayarPenuh">
          Lanjutkan Ujian
        </button>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div
      v-if="cbt.toastMsg.value !== ''"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-2xl border border-slate-700 animate-fadeIn"
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
import { defineAsyncComponent, onErrorCaptured, onMounted, onUnmounted, ref, watch } from 'vue'
import { useCbtExam } from '~/composables/useCbtExam'
import CbtLoginScreen from '~/components/cbt/CbtLoginScreen.vue'
import CbtAppScreen from '~/components/cbt/CbtAppScreen.vue'
import CbtConfirmScreen from '~/components/cbt/CbtConfirmScreen.vue'
import CbtDoneScreen from '~/components/cbt/CbtDoneScreen.vue'
import CbtCheatModal from '~/components/cbt/CbtCheatModal.vue'

import { jenjangHost } from '~/composables/domainCore'

definePageMeta({
  layout: 'exam'
})

useHead({
  title: 'CBT Online — Ujian Terstandar Komputer Yayasan Darqia Attaqwa',
  meta: [
    { name: 'description', content: 'Aplikasi CBT Ujian Online mandiri SMP IT Bina Cendekia Assalam dan SMK IT Attaqwa 9.' }
  ]
})

// Layar ujian & review membawa KaTeX dan editor soal (±280 KB): baru diunduh saat siswa membuka ujian, bukan saat
// login. HP lawas (RAM 2 GB) tidak perlu memuatnya di layar login/beranda.
const CbtExamScreen = defineAsyncComponent(() => import('~/components/cbt/CbtExamScreen.vue'))
const CbtReviewScreen = defineAsyncComponent(() => import('~/components/cbt/CbtReviewScreen.vue'))

const cbt = useCbtExam()
const muatUjian = ref(false)
watch(() => cbt.screen.value, (s) => { if (s === 'confirm' || s === 'exam' || s === 'review') muatUjian.value = true }, { immediate: true })

// Jenjang mengikuti domain: cbt.smpitbca.sch.id = SMP, cbt.smkitattaqwa9.sch.id = SMK.
// Di localhost/staging (host tidak terdaftar) bisa dipilih lewat ?jenjang=smp atau ?jenjang=smk.
const kueriJenjang = String(useRoute().query.jenjang ?? '').toLowerCase()
const jenjangAktif = jenjangHost(useRequestURL().hostname) ?? (kueriJenjang === 'smp' || kueriJenjang === 'smk' ? kueriJenjang : null)
if (jenjangAktif) cbt.grade.value = jenjangAktif === 'smp' ? 'SMP' : 'SMK'

// Warna bilah browser dan ikon aplikasi mengikuti jenjang (hijau + logo SMP, atau biru + logo SMK).
const smp = cbt.grade.value === 'SMP'
useHead({
  meta: [{ name: 'theme-color', content: smp ? '#15803d' : '#0A2A5C' }],
  link: [
    { key: 'ikon', rel: 'icon', type: 'image/png', href: smp ? '/asset/logosmp.png' : '/asset/logo.png' },
    { key: 'ikon-apple', rel: 'apple-touch-icon', href: smp ? '/icons/smp-192.png' : '/icons/smk-192.png' }
  ]
})

// Segarkan jadwal + rekap (dipaksa) dari tombol Segarkan.
const segarkan = async () => {
  await cbt.siswa.muatJadwal(true)
  if (cbt.appTab.value === 'rekap') await cbt.siswa.muatRekap(true)
}

onMounted(async () => {
  cbt.registerListeners()
  // Refresh: sesi login tetap ada; bila sedang di tengah ujian, langsung kembali ke ujiannya.
  if (cbt.siswa.pulihkan()) {
    cbt.grade.value = cbt.siswa.state.value.sesi!.grade
    cbt.screen.value = 'app'
    if (!await cbt.pulihkanUjian()) void cbt.siswa.muatJadwal()
  }
})

// Buka tab: ambil ulang jadwal/rekap hanya bila data sudah lebih dari 1 menit.
watch(() => cbt.appTab.value, (tab) => {
  if (cbt.screen.value !== 'app') return
  void cbt.siswa.muatJadwal()
  if (tab === 'rekap') void cbt.siswa.muatRekap()
})

onUnmounted(() => {
  cbt.unregisterListeners()
})

// shortcut: diagnosa sementara masalah login iOS 16/17 — tampilkan galat di layar; hapus setelah penyebab ketemu.
onErrorCaptured((e) => {
  cbt.triggerToast(`Galat: ${(e as Error)?.message || e}`, 10000)
})
</script>
