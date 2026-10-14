<template>
  <div class="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-slate-100 selection:bg-blue-600 selection:text-white">
    <!-- Background Gedung Sekolah (public/1.jpg) dengan Cinematic Navy Overlay -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <img
        src="/1.jpg"
        alt="Gedung Yayasan Darqia Attaqwa"
        class="w-full h-full object-cover object-center scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
      >
      <!-- Multi-layer Gradient Overlay: Gedung tetap terlihat asri & gagah, kontras teks 100% terjaga -->
      <div class="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-slate-900/85 to-blue-950/80 backdrop-blur-[1.5px]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-black/60" />
    </div>

    <!-- Top Navigation / Header Utility Bar -->
    <header class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 flex items-center justify-between">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/15 backdrop-blur-md transition-all text-xs font-bold group shadow-sm"
      >
        <span class="transition-transform group-hover:-translate-x-1">‹</span>
        <span>Kembali ke Website</span>
      </NuxtLink>

      <div class="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-semibold text-slate-300">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Sistem Operasional Terpadu Darqia 9</span>
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 my-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
      <!-- Left Hero Brand & Informasi Sekolah -->
      <div class="w-full lg:max-w-xl space-y-6 text-center lg:text-left">
        <!-- Logo & Identitas Yayasan / Sekolah -->
        <div class="flex items-center justify-center lg:justify-start gap-3.5">
          <div class="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md p-2 flex items-center justify-center shadow-lg shrink-0">
            <img src="/asset/logo.png" class="w-full h-full object-contain" alt="Logo SMK IT Attaqwa 9">
          </div>
          <div class="text-left">
            <span class="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-300 block">
              Yayasan Darqia Attaqwa
            </span>
            <h2 class="text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight">
              SMK IT Attaqwa 9
            </h2>
            <p class="text-xs text-slate-300 font-medium">
              Unggul dalam IMTAQ, Terdepan dalam IPTEK
            </p>
          </div>
        </div>

        <!-- Headline Utama -->
        <div class="space-y-3">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] text-white">
            Satu pintu untuk <br class="hidden sm:inline">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">
              seluruh operasional
            </span> sekolah.
          </h1>
          <p class="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-lg mx-auto lg:mx-0 font-normal">
            Pusat manajemen terintegrasi untuk akademik, absensi RFID, keuangan, CBT ujian digital, dan layanan informasi civitas sekolah.
          </p>
        </div>

        <!-- 4 Fitur Kunci (Glass Tiles Interaktif) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
          <div class="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-start gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AdminIcon name="users" size="18" />
            </div>
            <div class="min-w-0">
              <b class="block text-xs font-bold text-white group-hover:text-blue-200 transition-colors">Akademik &amp; RFID</b>
              <span class="text-[11px] text-slate-400 block truncate">Absensi tap card, rombel &amp; nilai</span>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-start gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AdminIcon name="wallet" size="18" />
            </div>
            <div class="min-w-0">
              <b class="block text-xs font-bold text-white group-hover:text-emerald-200 transition-colors">Keuangan Transparan</b>
              <span class="text-[11px] text-slate-400 block truncate">Arus kas, infaq &amp; tabungan</span>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-start gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AdminIcon name="monitor" size="18" />
            </div>
            <div class="min-w-0">
              <b class="block text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">CBT Terpusat</b>
              <span class="text-[11px] text-slate-400 block truncate">Bank soal &amp; ujian digital</span>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all flex items-start gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AdminIcon name="shield" size="18" />
            </div>
            <div class="min-w-0">
              <b class="block text-xs font-bold text-white group-hover:text-amber-200 transition-colors">Aman &amp; Teraudit</b>
              <span class="text-[11px] text-slate-400 block truncate">RBAC multi-peran &amp; log aktivitas</span>
            </div>
          </div>
        </div>

        <!-- Akreditasi & Verifikasi Badge -->
        <div class="pt-2 flex items-center justify-center lg:justify-start gap-3 text-xs text-slate-300/80">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
            <AdminIcon name="check" size="13" />
            <span>Terakreditasi A</span>
          </span>
          <span>&bull;</span>
          <span>NPSN: 69940449</span>
          <span>&bull;</span>
          <span class="hidden sm:inline">Babelan, Kab. Bekasi</span>
        </div>
      </div>

      <!-- Right Login Card (Clean, Modern, Simple & Interaktif) -->
      <div class="w-full max-w-md">
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/40 border border-white/50 text-slate-900 transition-all">
          <!-- Card Header -->
          <div class="pb-5 border-b border-slate-100">
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Admin Portal
              </span>
              <span class="text-[11px] font-mono font-bold text-slate-400">Versi 2.4</span>
            </div>
            <h2 class="text-2xl font-bold tracking-tight text-slate-900">
              Selamat Datang Kembali
            </h2>
            <p class="text-xs text-slate-500 mt-1 font-medium">
              Masuk untuk mengelola ekosistem aplikasi sekolah.
            </p>
          </div>

          <!-- Alert Pesan Error -->
          <div
            v-if="errorMsg"
            class="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2 animate-shake"
          >
            <div class="flex items-center gap-2">
              <AdminIcon name="alert" size="16" class="text-rose-600 shrink-0" />
              <span>{{ errorMsg }}</span>
            </div>
            <button
              type="button"
              class="text-rose-500 hover:text-rose-800 text-xs font-bold cursor-pointer"
              @click="errorMsg = ''"
            >
              ✕
            </button>
          </div>

          <!-- Form Login -->
          <form class="space-y-4 pt-4" autocomplete="off" @submit.prevent="handleLogin">
            <!-- Input Email Akun Admin -->
            <div>
              <label for="li-email" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Administrator
              </label>
              <div
                class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all shadow-2xs"
              >
                <AdminIcon name="mail" size="17" class="text-slate-400 shrink-0" />
                <input
                  id="li-email"
                  v-model.trim="email"
                  type="email"
                  placeholder="admin@darqia.sch.id"
                  class="w-full bg-transparent text-xs sm:text-sm font-semibold outline-none text-slate-900 placeholder:text-slate-400"
                  required
                >
                <button
                  v-if="email"
                  type="button"
                  class="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  title="Hapus input"
                  @click="email = ''"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Input Kata Sandi + Toggle Eye -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="li-pass" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  class="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  @click="forgotPasswordHint"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div
                class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all shadow-2xs"
              >
                <AdminIcon name="lock" size="17" class="text-slate-400 shrink-0" />
                <input
                  id="li-pass"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full bg-transparent text-xs sm:text-sm font-semibold outline-none text-slate-900 placeholder:text-slate-400 font-mono tracking-wider"
                  required
                >
                <!-- Toggle Lihat Kata Sandi -->
                <button
                  type="button"
                  class="text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                  :title="showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'"
                  @click="showPassword = !showPassword"
                >
                  <AdminIcon :name="showPassword ? 'eye' : 'eye'" size="17" :class="showPassword ? 'text-blue-600' : 'text-slate-400'" />
                </button>
              </div>
            </div>

            <!-- Tombol Submit -->
            <button
              type="submit"
              class="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              :disabled="loading"
            >
              <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{{ loading ? 'Memverifikasi Kredensial...' : 'Masuk Dashboard' }}</span>
              <AdminIcon v-if="!loading" name="arr" size="15" />
            </button>
          </form>

          <!-- Informasi Layanan Bantuan Akses -->
          <div class="mt-5 pt-4 border-t border-slate-100 text-center">
            <p class="text-[11px] text-slate-400 font-medium">
              Akses portal khusus staf &amp; pengelola terdaftar. Hubungi <b class="text-slate-600">Administrator IT Darqia 9</b> jika mengalami kendala.
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Copyright -->
    <footer class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 sm:pb-6 text-center text-xs text-slate-400/80">
      <p>&copy; 2026 Yayasan Darqia Attaqwa &bull; SMK IT Attaqwa 9 &bull; Seluruh Hak Cipta Dilindungi</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminIcon from '~/components/admin/AdminIcon.vue'

definePageMeta({
  layout: 'admin-blank',
  title: 'Admin Portal Login'
})

const router = useRouter()
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const loading = ref(false)

// Bantuan Lupa Password
const forgotPasswordHint = () => {
  alert('Untuk pemulihan kata sandi akun staf atau guru, silakan hubungi Administrator IT Sekolah di smkitattaqwa09@gmail.com atau telepon (021) 8888-6776.')
}

const handleLogin = async () => {
  errorMsg.value = ''

  if (!email.value || !password.value) {
    errorMsg.value = 'Mohon masukkan email dan kata sandi Anda.'
    return
  }

  loading.value = true

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError || !authData.user) {
      if (authError?.message?.includes('Email not confirmed')) {
        errorMsg.value = 'Email belum dikonfirmasi. Matikan "Confirm Email" di Supabase → Authentication → Providers → Email.'
      } else if (authError?.message?.includes('Invalid login credentials')) {
        errorMsg.value = 'Email atau kata sandi salah. Periksa kembali atau reset password di Supabase Dashboard.'
      } else {
        errorMsg.value = authError?.message || 'Email atau kata sandi tidak valid.'
      }
      loading.value = false
      return
    }

    // Auth berhasil — langsung redirect, middleware yang verifikasi role
    await navigateTo('/admin')
  } catch (err: any) {
    errorMsg.value = err?.message || 'Terjadi kendala saat memverifikasi sesi login.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.35s ease-in-out;
}
</style>

