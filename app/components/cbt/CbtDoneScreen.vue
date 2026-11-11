<template>
  <section v-show="screen === 'done'" class="min-h-screen py-8 px-4 bg-[#F1F5F9] flex items-start sm:items-center justify-center antialiased">
    <div class="max-w-xl w-full mx-auto space-y-4">
      <!-- Kartu Skor & Nilai Akhir -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#08152B] via-[#0E2754] to-[#163673] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 text-center border border-white/10">
        <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div class="relative z-10">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 shadow-2xs">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Jawaban Berhasil Disimpan &amp; Terkirim</span>
          </span>

          <p class="mt-5 text-xs font-black uppercase tracking-wider text-blue-200">Perolehan Nilai Ujian</p>
          <div class="mt-1 text-6xl sm:text-7xl font-black tabular-nums tracking-tight font-mono text-white">
            {{ hasil ? formatNilai(hasil.nilai) : '-' }}
          </div>
          <p class="mt-2 text-xs sm:text-sm text-blue-100/90 font-bold">{{ subject }} &bull; {{ examName }}</p>

          <p v-if="hasil && hasil.menunggu" class="mt-3 text-xs text-amber-200 bg-amber-500/20 border border-amber-400/30 rounded-xl py-1.5 px-3 inline-block font-semibold">
            ⏳ {{ hasil.menunggu }} butir soal esai masih menunggu penilaian manual dari guru.
          </p>
        </div>
      </div>

      <!-- Ringkasan Butir Soal (Benar / Salah / Total) -->
      <div v-if="hasil" class="grid grid-cols-3 gap-3">
        <div class="bg-white border border-emerald-200 rounded-2xl p-4 text-center shadow-sm">
          <b class="block text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">{{ hasil.benar }}</b>
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 mt-0.5 block">Benar</span>
        </div>
        <div class="bg-white border border-rose-200 rounded-2xl p-4 text-center shadow-sm">
          <b class="block text-2xl sm:text-3xl font-black text-rose-600 tabular-nums">{{ hasil.salah }}</b>
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 mt-0.5 block">Salah</span>
        </div>
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 text-center shadow-sm">
          <b class="block text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">{{ hasil.total }}</b>
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 mt-0.5 block">Total Soal</span>
        </div>
      </div>

      <!-- Detail Informasi Pengerjaan -->
      <div class="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <span class="text-xs font-black uppercase tracking-wider text-slate-500 block">Rincian Sesi Pengerjaan</span>
        <dl class="space-y-2.5 text-xs sm:text-sm">
          <div class="flex justify-between gap-4 border-b border-slate-100 pb-2">
            <dt class="text-slate-500 font-medium">Nama Peserta</dt>
            <dd class="font-black text-right text-slate-900">{{ studentName }}</dd>
          </div>
          <div class="flex justify-between gap-4 border-b border-slate-100 pb-2">
            <dt class="text-slate-500 font-medium">Waktu Selesai</dt>
            <dd class="font-bold text-slate-800 font-mono">{{ doneTime }}</dd>
          </div>
          <div class="flex justify-between gap-4 border-b border-slate-100 pb-2">
            <dt class="text-slate-500 font-medium">Durasi Pengerjaan</dt>
            <dd class="font-bold text-slate-800 font-mono">{{ doneDur }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-slate-500 font-medium">Soal Tidak Dijawab</dt>
            <dd class="font-bold text-slate-800">{{ hasil ? hasil.kosong : totalQuestions - answeredCount }} butir</dd>
          </div>
        </dl>
        <p class="mt-3 text-xs leading-relaxed text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
          {{ doneMsg }} Nilai hasil ujian telah tersimpan permanen di menu Rekap Ujian.
        </p>
      </div>

      <!-- Tombol Kembali ke Beranda -->
      <button
        type="button"
        class="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
        @click="$emit('reset-home')"
      >
        <span>Kembali ke Beranda CBT</span>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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