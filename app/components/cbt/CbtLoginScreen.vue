<template>
  <section v-show="screen === 'login'" class="min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6">
    <div class="max-w-md w-full mx-auto">
      <!-- Hero Top -->
      <div class="text-center mb-8">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 mb-4">
          Prototipe Demo
        </span>
        <div class="flex items-center justify-center gap-3 mb-4">
          <img src="/asset/logo.png" alt="Logo Sekolah" class="w-12 h-12 object-contain">
          <div class="text-left">
            <h1 class="text-lg font-black text-slate-900 leading-tight">{{ jenjangText }}</h1>
            <div class="text-xs font-semibold text-slate-500">Computer Based Test &bull; Ujian Online</div>
          </div>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
          Ujian jadi lebih <br><span class="text-blue-600">mudah &amp; modern</span>.
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          Kerjakan ujian langsung dari HP kamu. Jawaban tersimpan otomatis, kapan pun, di mana pun.
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60">
        <h3 class="text-xl font-extrabold text-slate-900 tracking-tight mb-1">Masuk Ujian</h3>
        <p class="text-xs text-slate-500 mb-6">Gunakan akun yang dibagikan panitia sebelum ujian dimulai.</p>
        
        <form @submit.prevent="doLogin" autocomplete="off" class="space-y-4">
          <div>
            <label for="f-nis" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nomor Peserta / NIS</label>
            <input
              v-model="loginForm.nis"
              id="f-nis"
              inputmode="numeric"
              placeholder="cth: 2024001234"
              class="w-full px-4 py-3 text-sm font-mono bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div>
            <label for="f-pass" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kata Sandi</label>
            <input
              v-model="loginForm.pass"
              id="f-pass"
              type="password"
              placeholder="Masukkan kata sandi"
              class="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div>
            <label for="f-kode" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kode Ujian <span class="font-normal text-slate-400 lowercase">(opsional)</span>
            </label>
            <input
              v-model="loginForm.kode"
              id="f-kode"
              placeholder="cth: IF-1201"
              class="w-full px-4 py-3 text-sm font-mono uppercase bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            class="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <span>Masuk</span>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </form>

        <div class="mt-4 text-center">
          <a href="#" @click.prevent="fillDemo" class="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Isi otomatis untuk demo
          </a>
        </div>
      </div>
    </div>

    <!-- Footer Note -->
    <div class="text-center text-xs text-slate-500 mt-8">
      Butuh bantuan? Hubungi panitia ujian di ruang guru.<br>
      &copy; 2026 {{ jenjangText }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LoginForm } from '~/composables/useCbtExam'

defineProps<{
  screen: string
  jenjangText: string
  loginForm: LoginForm
}>()

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'fill-demo'): void
}>()

const doLogin = () => emit('login')
const fillDemo = () => emit('fill-demo')
</script>
