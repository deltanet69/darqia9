<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0F1E38] via-[#122B52] to-[#0A1A33] text-white flex flex-col lg:flex-row items-center justify-center p-6 sm:p-10 lg:p-16 gap-10 lg:gap-16">
    <!-- Left Hero -->
    <div class="max-w-xl w-full space-y-6 text-center lg:text-left">
      <div class="flex items-center justify-center lg:justify-start gap-3.5">
        <img src="/asset/logo.png" class="w-12 h-12 object-contain" alt="Logo SMK IT Attaqwa 9">
        <div>
          <h2 class="text-xl font-black leading-tight tracking-wide">SMK IT Attaqwa 9</h2>
          <p class="text-xs text-blue-300 font-semibold uppercase tracking-wider">Admin Portal &bull; Sistem Terpadu</p>
        </div>
      </div>

      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
        Satu pintu untuk <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">seluruh operasional</span> sekolah.
      </h1>

      <p class="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
        Kelola akademik, keuangan, CBT, dan konten website dalam satu dashboard yang cepat, aman, dan bisa diakses dari mana saja.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <b class="block text-xs font-bold text-white">Akademik Terpadu</b>
            <span class="text-[11px] text-slate-400">Absensi, kelas, dan nilai</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <div>
            <b class="block text-xs font-bold text-white">Keuangan Transparan</b>
            <span class="text-[11px] text-slate-400">Arus kas, infaq &amp; tabungan</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
          </div>
          <div>
            <b class="block text-xs font-bold text-white">CBT Terpusat</b>
            <span class="text-[11px] text-slate-400">Bank soal &amp; ujian digital</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div>
            <b class="block text-xs font-bold text-white">Aman &amp; Teraudit</b>
            <span class="text-[11px] text-slate-400">RBAC + log aktivitas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Login Card -->
    <div class="max-w-md w-full">
      <form class="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900 space-y-5" autocomplete="off" @submit.prevent="handleLogin">
        <div>
          <span class="inline-block text-[11px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-2">Admin Portal</span>
          <h2 class="text-2xl font-black tracking-tight text-slate-900">Selamat Datang Kembali</h2>
          <p class="text-xs text-slate-500 mt-1">Masuk untuk mengelola ekosistem aplikasi sekolah.</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <label for="li-user" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Username / NIP</label>
            <div class="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
              <svg class="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                id="li-user"
                v-model="username"
                placeholder="cth: admin"
                class="w-full bg-transparent text-sm font-semibold outline-none text-slate-900 placeholder-slate-400"
              >
            </div>
          </div>

          <div>
            <label for="li-pass" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Kata Sandi</label>
            <div class="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
              <svg class="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                id="li-pass"
                type="password"
                v-model="password"
                placeholder="••••••••"
                class="w-full bg-transparent text-sm font-semibold outline-none text-slate-900 placeholder-slate-400"
              >
            </div>
          </div>
        </div>
        
        <div v-if="errorMsg" class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {{ errorMsg }}
        </div>
        
        <button
          class="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          type="submit"
          :disabled="loading"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ loading ? 'Memproses...' : 'Masuk Dashboard' }}</span>
        </button>
        
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500">
          Akun demo &mdash; Username <code class="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800">admin</code> &nbsp; Password <code class="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800">admin123</code>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'admin-blank',
  title: 'Admin Portal Login'
})

const router = useRouter()
const username = ref('admin')
const password = ref('admin123')
const errorMsg = ref('')
const loading = ref(false)

const handleLogin = () => {
  errorMsg.value = ''
  loading.value = true
  
  setTimeout(() => {
    loading.value = false
    if (username.value === 'admin' && password.value === 'admin123') {
      router.push('/admin')
    } else {
      errorMsg.value = 'Username atau kata sandi salah. Gunakan admin / admin123'
    }
  }, 600)
}
</script>
