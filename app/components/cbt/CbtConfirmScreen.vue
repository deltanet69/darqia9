<template>
  <section v-show="screen === 'confirm'" class="min-h-screen pb-10 bg-[#F1F5F9]">
    <div class="bg-white border-b border-slate-200 sticky top-0 z-30 py-3 px-4">
      <div class="max-w-xl mx-auto flex items-center gap-3">
        <img src="/asset/logo.png" alt="Logo" class="w-9 h-9 object-contain">
        <div class="min-w-0">
          <div class="text-sm font-extrabold text-slate-900 leading-tight truncate">{{ jenjangText }}</div>
          <div class="text-xs font-semibold text-slate-500">Verifikasi Sebelum Ujian</div>
        </div>
      </div>
    </div>

    <div class="max-w-xl mx-auto px-4 pt-5 space-y-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Siap mengikuti ujian?</h2>
        <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Periksa datamu dan baca tata tertib sebelum mulai.</p>
      </div>

      <!-- 1. Data singkat siswa -->
      <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-4 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Data Peserta</div>
        <div class="text-base font-black text-slate-900 leading-tight break-words">{{ exam?.studentName }}</div>
        <dl class="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div class="bg-slate-50 rounded-xl p-2.5">
            <dt class="text-[10px] text-slate-400 uppercase font-semibold">NIS</dt>
            <dd class="font-bold text-slate-900 font-mono mt-0.5 break-all">{{ nis }}</dd>
          </div>
          <div class="bg-slate-50 rounded-xl p-2.5">
            <dt class="text-[10px] text-slate-400 uppercase font-semibold">Kelas</dt>
            <dd class="font-bold text-slate-900 mt-0.5 break-words">{{ exam?.classroom }}</dd>
          </div>
          <div class="bg-slate-50 rounded-xl p-2.5">
            <dt class="text-[10px] text-slate-400 uppercase font-semibold">Token</dt>
            <dd class="font-bold text-blue-700 font-mono mt-0.5 break-all">{{ token }}</dd>
          </div>
        </dl>
      </div>

      <!-- 2. Informasi ujian -->
      <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-4 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Informasi Ujian</div>
        <dl class="divide-y divide-slate-100 text-sm">
          <div class="py-2.5 flex items-start justify-between gap-4">
            <dt class="text-slate-500 shrink-0">Mata Pelajaran</dt>
            <dd class="font-extrabold text-slate-900 text-right break-words">{{ exam?.subject }}</dd>
          </div>
          <div class="py-2.5 flex items-start justify-between gap-4">
            <dt class="text-slate-500 shrink-0">Materi</dt>
            <dd class="font-extrabold text-slate-900 text-right break-words">{{ exam?.name }}</dd>
          </div>
          <div class="py-2.5 flex items-start justify-between gap-4">
            <dt class="text-slate-500 shrink-0">Durasi &amp; Soal</dt>
            <dd class="font-extrabold text-slate-900 text-right">{{ exam?.duration }} menit &bull; {{ totalQuestions }} soal</dd>
          </div>
        </dl>
      </div>

      <!-- 3. Bagian soal (sesuai isi bank soal ujian ini) -->
      <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Bagian Soal</h3>
          <span class="text-xs text-slate-400">Ketuk untuk detail</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="sec in sectionsAda"
            :key="sec.id"
            class="border rounded-2xl overflow-hidden transition-all"
            :class="openedAcc === sec.id ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200 bg-white'"
          >
            <button type="button" class="w-full p-3 flex items-center justify-between gap-3 text-left" @click="$emit('toggle-acc', sec.id)">
              <span class="text-sm font-bold text-slate-900">{{ sec.title }}</span>
              <span class="flex items-center gap-2 shrink-0">
                <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{{ secRange(sec.id).length }} soal</span>
                <svg
                  class="w-4 h-4 text-slate-400 transition-transform duration-200"
                  :class="{ 'rotate-180 text-blue-600': openedAcc === sec.id }"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                ><path d="M6 9l6 6 6-6" /></svg>
              </span>
            </button>
            <div v-show="openedAcc === sec.id" class="px-3.5 pb-3 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100" v-html="sec.desc" />
          </div>
        </div>
      </div>

      <!-- 4. Tata tertib -->
      <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-4 shadow-sm">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Tata Tertib Ujian</h3>
        <ul class="space-y-2 text-xs sm:text-sm text-slate-700 list-disc pl-5 leading-relaxed">
          <li>Kerjakan tepat waktu. Durasi ujian <b>{{ exam?.duration }} menit</b> dan tidak bisa diperpanjang.</li>
          <li>Pastikan <b>koneksi internet stabil</b> selama ujian berlangsung.</li>
          <li>Kerjakan <b>secara mandiri</b>. Dilarang membuka catatan, aplikasi, atau tab lain.</li>
          <li>Pelanggaran tata tertib berakibat <b>akun terkunci dan nilai dibatalkan</b>.</li>
          <li>Jawaban <b>tersimpan otomatis setiap 10 detik</b> dan aman walau halaman dimuat ulang.</li>
        </ul>
      </div>

      <!-- 5. Checklist -->
      <label class="flex items-start gap-3 p-4 rounded-2xl border-2 bg-white cursor-pointer transition-all" :class="agreeStart ? 'border-blue-400' : 'border-slate-200'">
        <input
          type="checkbox"
          :checked="agreeStart"
          class="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          @change="$emit('update:agreeStart', ($event.target as HTMLInputElement).checked)"
        >
        <span class="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Saya telah membaca tata tertib dan <b>siap mengikuti ujian dengan jujur</b>.
        </span>
      </label>

      <!-- 6. Mulai ujian -->
      <div class="space-y-2.5">
        <button
          type="button"
          class="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base text-white transition-all"
          :class="agreeStart ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30' : 'bg-slate-300 cursor-not-allowed opacity-60'"
          :disabled="!agreeStart"
          @click="$emit('start-exam')"
        >
          Mulai Ujian
        </button>
        <button type="button" class="w-full py-3 rounded-2xl text-sm font-bold text-slate-500" @click="$emit('kembali')">
          Kembali ke Beranda
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SectionItem } from '~/composables/useCbtExam'

const props = defineProps<{
  screen: string
  exam?: { studentName: string; classroom: string; code: string; name: string; subject: string; duration: number } | null
  jenjangText: string
  grade: string
  nis: string
  token: string
  ruang?: string | null
  totalQuestions: number
  sections: SectionItem[]
  openedAcc: string
  agreeStart: boolean
  secRange: (secId: string) => number[]
}>()

defineEmits<{
  (e: 'toggle-acc', id: string): void
  (e: 'update:agreeStart', val: boolean): void
  (e: 'start-exam'): void
  (e: 'kembali'): void
}>()

// Hanya bagian yang benar-benar ada di bank soal ujian ini (mis. tanpa Jawaban Singkat bila tidak ada soalnya).
const sectionsAda = computed(() => props.sections.filter(sec => props.secRange(sec.id).length > 0))
</script>
