<template>
  <section v-show="screen === 'login'" class="min-h-screen flex flex-col bg-gradient-to-b from-[#08152B] via-[#0E2754] to-[#F1F5F9] text-slate-900 font-sans">
    <main class="flex-1 w-full max-w-md mx-auto px-4 pt-10 pb-8 flex flex-col items-center">
      <!-- Identitas -->
      <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-2.5 flex items-center justify-center shadow-lg">
        <img src="/asset/logo.png" alt="Logo Sekolah" class="w-full h-full object-contain">
      </div>
      <p class="mt-3 text-xs font-bold text-blue-100 text-center">{{ jenjangText }}</p>
      <span class="mt-3 inline-flex px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/15 text-blue-100 border border-white/20">
        Tahun Ajaran {{ tahunAjaran }}
      </span>

      <h1 class="mt-4 text-3xl font-black text-white tracking-tight text-center">Portal Ujian Online</h1>
      <p class="mt-2 text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium text-center">
        Masuk menggunakan akun peserta yang telah diverifikasi oleh panitia ujian untuk memulai sesi pengerjaan.
      </p>

      <!-- Kartu login -->
      <div class="mt-6 w-full bg-white rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)]">
        <div class="bg-slate-100 p-1 rounded-2xl grid grid-cols-2 gap-1 mb-4" role="group" aria-label="Pilih jenjang">
          <button
            type="button"
            class="py-2 rounded-xl text-xs font-extrabold transition-all"
            :class="activeGrade === 'SMK' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-500'"
            @click="setGrade('SMK')"
          >
            SMK IT Attaqwa 9
          </button>
          <button
            type="button"
            class="py-2 rounded-xl text-xs font-extrabold transition-all"
            :class="activeGrade === 'SMP' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-500'"
            @click="setGrade('SMP')"
          >
            SMP IT BCA
          </button>
        </div>

        <form autocomplete="off" class="space-y-3.5" @submit.prevent="emit('login')">
          <div>
            <label for="f-nis" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nomor Peserta / NIS</label>
            <input
              id="f-nis"
              v-model="loginForm.nis"
              inputmode="numeric"
              autocomplete="username"
              placeholder="Masukkan NIS"
              class="w-full px-4 py-3 text-sm font-mono font-medium bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-sans"
            >
          </div>
          <div>
            <label for="f-kode" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Token Ujian</label>
            <input
              id="f-kode"
              v-model="loginForm.kode"
              autocomplete="off"
              autocapitalize="characters"
              placeholder="Masukkan token"
              class="w-full px-4 py-3 text-sm font-mono uppercase font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:normal-case"
            >
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-black text-sm shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {{ loading ? 'Memeriksa akun…' : 'Masuk' }}
          </button>
        </form>
      </div>

      <!-- Sistem Integritas Ujian -->
      <div class="mt-4 w-full bg-gradient-to-br from-[#0F1E38] via-[#122B52] to-[#0A1A33] rounded-3xl p-5 text-white shadow-xl border border-white/10">
        <h2 class="text-sm font-black">Sistem Integritas Ujian</h2>
        <ul class="mt-3 space-y-2 text-xs text-slate-200 leading-relaxed">
          <li><b>Jawaban tersimpan otomatis</b> ke server setiap 10 detik.</li>
          <li><b>Pindah tab atau keluar aplikasi</b> terdeteksi dan memicu peringatan.</li>
          <li><b>Pelanggaran ke-3</b> mengunci akunmu dari ujian tersebut.</li>
        </ul>
      </div>
    </main>

    <footer class="w-full text-center py-5 px-4 text-[11px] text-slate-500 border-t border-slate-200/60 bg-white/40">
      Butuh bantuan? Hubungi proktor atau panitia ujian. &copy; 2026 {{ jenjangText }}
    </footer>
  </section>
</template>

<script setup lang="ts">
import type { LoginForm } from '~/composables/useCbtExam'
import { useAdminGrade } from '~/composables/useAdminGrade'

const props = defineProps<{
  screen: string
  jenjangText: string
  loginForm: LoginForm
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'login'): void
}>()

const activeGrade = useAdminGrade()

// Tahun ajaran berganti setiap Juli.
const sekarang = new Date()
const mulaiTahun = sekarang.getMonth() >= 6 ? sekarang.getFullYear() : sekarang.getFullYear() - 1
const tahunAjaran = `${mulaiTahun}/${mulaiTahun + 1}`

const setGrade = (gradeVal: 'SMK' | 'SMP') => {
  activeGrade.value = gradeVal
  props.loginForm.nis = ''
  props.loginForm.kode = ''
}
</script>
