<template>
  <section v-show="screen === 'done'" class="min-h-screen py-8 px-4 bg-[#F1F5F9] flex items-start sm:items-center justify-center">
    <div class="max-w-xl w-full mx-auto space-y-4">
      <!-- Nilai -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1E38] via-[#122B52] to-[#0A1A33] p-6 text-white shadow-xl text-center">
        <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <span class="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4.5 12.5l5 5L19.5 7" /></svg>
          Jawaban terkirim
        </span>
        <p class="relative mt-4 text-xs font-bold uppercase tracking-wider text-blue-200">Nilai Ujian</p>
        <div class="relative mt-1 text-6xl font-black tabular-nums tracking-tight">{{ hasil ? formatNilai(hasil.nilai) : '-' }}</div>
        <p class="relative mt-1 text-xs text-slate-300">{{ subject }} &bull; {{ examName }}</p>
        <p v-if="hasil && hasil.menunggu" class="relative mt-2 text-[11px] text-amber-200">{{ hasil.menunggu }} soal esai masih menunggu penilaian guru.</p>
      </div>

      <!-- Benar / Salah / Tidak dijawab -->
      <div v-if="hasil" class="grid grid-cols-3 gap-2.5">
        <div class="bg-white border-2 border-emerald-200 rounded-2xl p-3.5 text-center">
          <b class="block text-2xl font-black text-emerald-600 tabular-nums">{{ hasil.benar }}</b>
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Benar</span>
        </div>
        <div class="bg-white border-2 border-rose-200 rounded-2xl p-3.5 text-center">
          <b class="block text-2xl font-black text-rose-600 tabular-nums">{{ hasil.salah }}</b>
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Salah</span>
        </div>
        <div class="bg-white border-2 border-slate-200 rounded-2xl p-3.5 text-center">
          <b class="block text-2xl font-black text-slate-700 tabular-nums">{{ hasil.total }}</b>
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Soal</span>
        </div>
      </div>

      <!-- Ringkasan -->
      <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-5 shadow-sm">
        <dl class="space-y-2.5 text-xs">
          <div class="flex justify-between gap-4 border-b border-slate-100 pb-2"><dt class="text-slate-500">Nama</dt><dd class="font-bold text-right text-slate-900">{{ studentName }}</dd></div>
          <div class="flex justify-between gap-4 border-b border-slate-100 pb-2"><dt class="text-slate-500">Waktu Selesai</dt><dd class="font-bold text-slate-900">{{ doneTime }}</dd></div>
          <div class="flex justify-between gap-4 border-b border-slate-100 pb-2"><dt class="text-slate-500">Durasi Pengerjaan</dt><dd class="font-bold text-slate-900">{{ doneDur }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Tidak Dijawab</dt><dd class="font-bold text-slate-900">{{ hasil ? hasil.kosong : totalQuestions - answeredCount }} soal</dd></div>
        </dl>
        <p class="mt-3 text-[11px] leading-relaxed text-slate-500">{{ doneMsg }} Nilai juga tersimpan di menu Rekap Ujian.</p>
      </div>

      <button
        type="button"
        class="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
        @click="$emit('reset-home')"
      >
        Kembali ke Beranda
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  screen: string
  grade: string
  studentName: string
  subject: string
  examName: string
  doneMsg: string
  doneTime: string
  doneDur: string
  answeredCount: number
  totalQuestions: number
  hasil: { total: number; benar: number; salah: number; kosong: number; menunggu: number; nilai: number } | null
}>()

defineEmits<{
  (e: 'reset-home'): void
}>()

const formatNilai = (n: number) => Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',')
</script>
