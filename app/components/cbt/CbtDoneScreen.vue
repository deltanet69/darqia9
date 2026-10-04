<template>
  <section id="screen-done" class="screen" :class="{ active: screen === 'done' }">
    <div class="wrap">
      <div class="done-cols">
        <div class="done-left">
          <div class="done-hero2">
            <div class="check-ring">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>
            </div>
            <h2>Ujian Selesai!</h2>
            <p>{{ doneMsg }}</p>
            <div class="done-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>Jawaban terkirim</div>
          </div>
        </div>
        <div class="done-right">
          <div class="donecard">
            <div class="donecard-shine"></div>
            <div class="examcard-kicker">Ringkasan Pengumpulan</div>
            <div class="drow"><span class="k">Nama</span><span class="v">Ahmad Fauzi</span></div>
            <div class="drow"><span class="k">Mata pelajaran</span><span class="v">Informatika</span></div>
            <div class="drow"><span class="k">Materi</span><span class="v">{{ grade === 'SMP' ? 'Informatika & Komputer Dasar' : 'Jaringan Komputer Dasar' }}</span></div>
            <div class="drow"><span class="k">Waktu selesai</span><span class="v">{{ doneTime }}</span></div>
            <div class="drow"><span class="k">Durasi pengerjaan</span><span class="v">{{ doneDur }}</span></div>
            <div class="drow"><span class="k">Soal terjawab</span><span class="v">{{ answeredCount }} dari {{ totalQuestions }}</span></div>
            <div class="dbar"><i :style="{ width: Math.round(answeredCount / totalQuestions * 100) + '%' }"></i></div>
          </div>
          <div class="card">
            <div class="sect-title">Langkah selanjutnya</div>
            <ul class="rules2">
              <li><span class="rico c-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.3l2.4 2.4 4.6-5.2"/></svg></span><span>Nilai akan <b>diumumkan oleh guru/pengawas</b> setelah semua jawaban diperiksa.</span></li>
              <li><span class="rico c-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z"/><path d="M8.8 12l2.3 2.3 4.2-4.6"/></svg></span><span>Jawabanmu <b>tersimpan aman</b> di server — tidak perlu khawatir soal koneksi.</span></li>
              <li><span class="rico c-indigo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg></span><span>Kamu bisa <b>menutup halaman ini</b> atau kembali ke beranda.</span></li>
            </ul>
          </div>
          <button class="btn btn-primary" style="margin-bottom:34px" @click="$emit('reset-home')">Kembali ke Beranda</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  screen: string
  grade: string
  doneMsg: string
  doneTime: string
  doneDur: string
  answeredCount: number
  totalQuestions: number
}>()

defineEmits<{
  (e: 'reset-home'): void
}>()
</script>
