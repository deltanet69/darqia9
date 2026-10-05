<template>
  <section v-show="screen === 'done'" class="min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center">
    <div class="max-w-3xl w-full mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <!-- Left Hero Summary -->
        <div class="md:col-span-5 bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center shadow-lg space-y-4">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>
          </div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Ujian Selesai!</h2>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">{{ doneMsg }}</p>
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
            <span>Jawaban terkirim</span>
          </div>
        </div>

        <!-- Right Detail Card -->
        <div class="md:col-span-7 space-y-6">
          <div class="bg-gradient-to-br from-[#0F1E38] via-[#122B52] to-[#0A1A33] rounded-3xl p-6 text-white shadow-xl space-y-4">
            <span class="text-[11px] font-bold uppercase tracking-wider text-blue-300 block">Ringkasan Pengumpulan</span>
            
            <dl class="space-y-2.5 text-xs">
              <div class="flex justify-between border-b border-white/10 pb-2"><dt class="text-slate-400">Nama</dt><dd class="font-bold">Ahmad Fauzi</dd></div>
              <div class="flex justify-between border-b border-white/10 pb-2"><dt class="text-slate-400">Mata Pelajaran</dt><dd class="font-bold">Informatika</dd></div>
              <div class="flex justify-between border-b border-white/10 pb-2"><dt class="text-slate-400">Materi</dt><dd class="font-bold">{{ grade === 'SMP' ? 'Informatika & Komputer Dasar' : 'Jaringan Komputer Dasar' }}</dd></div>
              <div class="flex justify-between border-b border-white/10 pb-2"><dt class="text-slate-400">Waktu Selesai</dt><dd class="font-bold">{{ doneTime }}</dd></div>
              <div class="flex justify-between border-b border-white/10 pb-2"><dt class="text-slate-400">Durasi Pengerjaan</dt><dd class="font-bold">{{ doneDur }}</dd></div>
              <div class="flex justify-between pb-1"><dt class="text-slate-400">Soal Terjawab</dt><dd class="font-bold text-blue-400">{{ answeredCount }} dari {{ totalQuestions }}</dd></div>
            </dl>

            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-400" :style="{ width: Math.round(answeredCount / totalQuestions * 100) + '%' }"></div>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Langkah Selanjutnya</h3>
            <ul class="space-y-2.5 text-xs text-slate-700">
              <li class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <span>Nilai akan diumumkan oleh guru/pengawas setelah diperiksa.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                <span>Jawabanmu tersimpan aman di server sekolah.</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            class="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
            @click="$emit('reset-home')"
          >
            Kembali ke Beranda
          </button>
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
