<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: false
})

useHead({
  title: 'Masuk — Portal Admin Darqia Attaqwa',
  meta: [
    { name: 'description', content: 'Halaman masuk terpadu Portal Admin Darqia 9 untuk SMP IT Bina Cendekia Assalam & SMK IT Attaqwa 9' }
  ]
})

/* ================= STATE & REACTIVITY ================= */
const supabase = useSupabaseClient()

// Jenjang aktif untuk styling tema: 'yayasan' | 'smp' | 'smk'
const jenjang = ref<'yayasan' | 'smp' | 'smk'>('yayasan')

// Form inputs
const identifier = ref('') // Email
const password = ref('')
const rememberMe = ref(true)
const showPassword = ref(false)
const isCapsLockOn = ref(false)
const showForgotInfo = ref(false)

// UI States
const isFocusedIdentifier = ref(false)
const isFocusedPassword = ref(false)
const errUser = ref('')
const errPass = ref('')
const alertMsg = ref('')
const alertType = ref<'error' | 'warn'>('error')
const isLoading = ref(false)
const isShaking = ref(false)

// Success veil overlay state
const isSuccess = ref(false)
const successGreetingName = ref('')

// Clock & Greetings
const clockWib = ref('--:--:-- WIB')
const dateWib = ref('Memuat…')
const greetingText = ref('Selamat datang')
let clockInterval: ReturnType<typeof setInterval> | null = null

// Word rotator for Hero headline
const ROTATING_WORDS = ['akademik.', 'keuangan.', 'ujian digital.', 'absensi RFID.', 'perpustakaan.']
const rotatingWordIndex = ref(0)
const isWordFading = ref(false)
let rotatorInterval: ReturnType<typeof setInterval> | null = null

// Animated Counter Numbers
const countAlumni = ref(0)
const countApps = ref(0)
const countDomains = ref(0)

// Cursor glow coordinate
const glowX = ref(-999)
const glowY = ref(-999)

/* ================= COMPUTED THEMING ================= */
const themeStyles = computed(() => {
  if (jenjang.value === 'smp') {
    return {
      bgGradient: 'from-[#04150F] via-[#064E3B] to-[#07332A]',
      blob1: 'bg-emerald-600',
      blob2: 'bg-cyan-700',
      blob3: 'bg-blue-600',
      accentText: 'text-emerald-600',
      accentBg: 'bg-emerald-600',
      accentBgHover: 'hover:bg-emerald-700',
      accentRing: 'focus-within:border-emerald-600 focus-within:ring-emerald-100',
      accentBorder: 'border-emerald-600',
      accentGlow: 'shadow-emerald-600/30',
      heroAccentText: 'text-emerald-300',
      heroAccentBar: 'bg-emerald-300'
    }
  }

  // Yayasan / SMK default (Biru Navy)
  return {
    bgGradient: 'from-[#060F20] via-[#0B1F3A] to-[#0A2A52]',
    blob1: 'bg-blue-600',
    blob2: 'bg-cyan-700',
    blob3: 'bg-emerald-600',
    accentText: 'text-blue-700',
    accentBg: 'bg-blue-700',
    accentBgHover: 'hover:bg-blue-800',
    accentRing: 'focus-within:border-blue-600 focus-within:ring-blue-100',
    accentBorder: 'border-blue-600',
    accentGlow: 'shadow-blue-700/30',
    heroAccentText: 'text-sky-300',
    heroAccentBar: 'bg-sky-300'
  }
})

/* ================= CLOCK & ROTATOR ================= */
const updateClock = () => {
  try {
    const now = new Date()
    const t = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now)

    const d = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now)

    clockWib.value = t.replace(/\./g, ':') + ' WIB'
    dateWib.value = d

    const hour = Number(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      hour12: false
    }).format(now))

    greetingText.value = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam'
  } catch (e) {
    // Fallback jika timezone lokal
    const now = new Date()
    clockWib.value = now.toLocaleTimeString('id-ID') + ' WIB'
  }
}

const runStatsCounters = () => {
  const duration = 1400
  const startTime = performance.now()

  const step = (currentTime: number) => {
    const progress = Math.min(1, (currentTime - startTime) / duration)
    const easeOut = 1 - Math.pow(1 - progress, 3)

    countAlumni.value = Math.round(2000 * easeOut)
    countApps.value = Math.round(11 * easeOut)
    countDomains.value = Math.round(3 * easeOut)

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

const handleMouseMove = (e: MouseEvent) => {
  glowX.value = e.clientX
  glowY.value = e.clientY
}

const handleKeyupPassword = (e: KeyboardEvent) => {
  if (e.getModifierState) {
    isCapsLockOn.value = e.getModifierState('CapsLock')
  }
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  // Rotator kata headline
  rotatorInterval = setInterval(() => {
    isWordFading.value = true
    setTimeout(() => {
      rotatingWordIndex.value = (rotatingWordIndex.value + 1) % ROTATING_WORDS.length
      isWordFading.value = false
    }, 380)
  }, 3200)

  // Jalankan counter
  runStatsCounters()

  // Track glow cursor
  if (typeof window !== 'undefined' && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', handleMouseMove)
  }
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
  if (rotatorInterval) clearInterval(rotatorInterval)
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', handleMouseMove)
  }
})

/* ================= VALIDASI & AUTHENTICATION ================= */
const clearUserError = () => {
  errUser.value = ''
}

const clearPassError = () => {
  errPass.value = ''
}

const triggerShake = () => {
  isShaking.value = false
  nextTick(() => {
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 400)
  })
}

const route = useRoute()

const handleLogin = async () => {
  if (isLoading.value) return

  alertMsg.value = ''
  errUser.value = ''
  errPass.value = ''

  const email = identifier.value.trim().toLowerCase()
  const passVal = password.value

  if (!email) {
    errUser.value = 'Email wajib diisi.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errUser.value = 'Format email belum benar.'
  }

  if (!passVal) {
    errPass.value = 'Kata sandi wajib diisi.'
  }

  if (errUser.value || errPass.value) {
    triggerShake()
    return
  }

  isLoading.value = true

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: passVal
    })

    if (authError || !authData.user) {
      if (authError?.message?.includes('Email not confirmed')) {
        alertType.value = 'warn'
        alertMsg.value = 'Email belum dikonfirmasi. Silakan hubungi Administrator IT Darqia 9.'
      } else {
        alertType.value = 'error'
        alertMsg.value = 'Email atau kata sandi tidak cocok. Silakan periksa kembali.'
      }
      triggerShake()
      return
    }

    const { data: verifiedAuth, error: verificationError } = await supabase.auth.getUser()
    if (verificationError || verifiedAuth.user?.id !== authData.user.id) {
      await supabase.auth.signOut({ scope: 'local' })
      throw new Error('Sesi login tidak dapat diverifikasi.')
    }

    const metadata = authData.user.user_metadata
    successGreetingName.value = metadata?.name || metadata?.full_name || authData.user.email || email
    isSuccess.value = true

    const redirectQuery = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const destination = redirectQuery.startsWith('/adminV2') && !redirectQuery.startsWith('/adminV2/login')
      ? redirectQuery
      : '/adminV2'

    setTimeout(() => navigateTo(destination, { replace: true }), 900)
  } catch {
    alertType.value = 'error'
    alertMsg.value = 'Koneksi ke layanan autentikasi gagal. Periksa jaringan, lalu coba lagi.'
    triggerShake()
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    class="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans text-white selection:bg-blue-600 selection:text-white"
    :class="`bg-gradient-to-br ${themeStyles.bgGradient}`"
  >
    <!-- Background Organic Blobs & Glow Effect -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <!-- Glow Kursor Interaktif -->
      <div
        class="fixed w-[520px] h-[520px] rounded-full pointer-events-none z-[1] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
        :style="{
          left: `${glowX}px`,
          top: `${glowY}px`,
          background: 'radial-gradient(circle, rgba(125,211,252,0.13), transparent 62%)'
        }"
      />

      <!-- Blob 1 (Top Right) -->
      <div
        class="absolute -top-40 -right-16 w-[480px] h-[480px] rounded-full blur-[72px] opacity-45 transition-colors duration-700"
        :class="themeStyles.blob1"
      />

      <!-- Blob 2 (Bottom Left) -->
      <div
        class="absolute -bottom-36 -left-16 w-[380px] h-[380px] rounded-full blur-[64px] opacity-35 transition-colors duration-700"
        :class="themeStyles.blob2"
      />

      <!-- Blob 3 (Center Floating) -->
      <div
        class="absolute top-[44%] left-[38%] w-[230px] h-[230px] rounded-full blur-[54px] opacity-25 transition-colors duration-700"
        :class="themeStyles.blob3"
      />

      <!-- Watermark DARQIA Besar -->
      <div
        class="fixed -right-8 -bottom-16 z-0 text-[180px] sm:text-[240px] lg:text-[300px] font-black leading-none tracking-tighter text-transparent select-none pointer-events-none [webkit-text-stroke:1px_rgba(255,255,255,0.055)]"
      >
        DARQIA
      </div>
    </div>

    <!-- MAIN PAGE CONTAINER -->
    <div class="relative z-10 flex-1 w-full max-w-[1440px] mx-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 flex flex-col justify-between">
      <!-- TOPBAR NAVIGATION -->
      <header class="w-full flex items-center justify-between gap-3">
        <!-- Logo & Identitas Sekolah -->
        <NuxtLink to="/" class="flex items-center gap-3 group"> 
          <div class="w-[45px] h-[45px] rounded-[14px] bg-white/[0.09] border border-white/20 flex items-center justify-center text-white shrink-0 backdrop-blur-md shadow-sm transition-transform duration-200 group-hover:scale-105">
            <svg class="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <b class="block text-base font-extrabold tracking-tight leading-tight text-white">
              Darqia Attaqwa
            </b>
            <span class="block text-[11px] font-semibold text-slate-300 tracking-wider uppercase mt-0.5">
              Portal Admin Terpadu
            </span>
          </div>
        </NuxtLink>

        <!-- Clock & Date Widget (WIB) -->
        <div class="hidden sm:flex items-center gap-2.5 bg-white/[0.07] border border-white/[0.13] backdrop-blur-md px-3.5 py-2 rounded-full text-xs font-bold text-white shadow-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <b class="tabular-nums font-bold">{{ clockWib }}</b>
          <span class="text-slate-300 font-semibold hidden md:inline">&middot; {{ dateWib }}</span>
        </div>
      </header>

      <!-- MAIN CONTENT WRAPPER -->
      <main class="w-full my-auto py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
        <!-- HERO COLUMN (Desktop Only - Sesuai Prototipe Mobile First: Hidden di layar kecil) -->
        <section class="hidden lg:flex flex-col justify-center max-w-[620px] select-none">
          <div class="space-y-4">
            <!-- Eyebrow Pill -->
            <div class="inline-flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.14em] uppercase text-slate-200">
              <span class="w-6 h-0.5 rounded-full" :class="themeStyles.heroAccentBar" />
              <span>Ekosistem Digital Sekolah</span>
            </div>

            <!-- Headline dengan Rotator Kata -->
            <h1 class="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
              Satu Admin Portal Untuk Mengelola
              <span
                class="italic font-serif transition-all duration-300 inline-block"
                :class="[
                  themeStyles.heroAccentText,
                  isWordFading ? 'opacity-0 translate-y-2 blur-[2px]' : 'opacity-100 translate-y-0 blur-0'
                ]"
              >
                {{ ROTATING_WORDS[rotatingWordIndex] }}
              </span>
            </h1>

            <!-- Paragraf Deskripsi -->
            <p class="text-[14.5px] sm:text-base text-slate-300/90 leading-relaxed max-w-[480px]">
              Sebelas aplikasi terpadu untuk SMP IT BCA &amp; SMK IT Attaqwa 9 — dari absensi digital sampai raport digital, semua terintegrasi dalam satu sistem.
            </p>
          </div>

          <!-- Counter Statistik -->
          <div class="flex items-center gap-8 pt-6 mt-8 border-t border-white/10 max-w-[470px]">
            <div>
              <b class="block text-2xl font-extrabold tracking-tight text-white tabular-nums">
                {{ countAlumni.toLocaleString('id-ID') }}+
              </b>
              <span class="text-[11.5px] font-semibold text-slate-300 block mt-0.5">Alumni</span>
            </div>
            <div>
              <b class="block text-2xl font-extrabold tracking-tight text-white tabular-nums">
                {{ countApps }}
              </b>
              <span class="text-[11.5px] font-semibold text-slate-300 block mt-0.5">Aplikasi Terintegrasi</span>
            </div>
            <div>
              <b class="block text-2xl font-extrabold tracking-tight text-white tabular-nums">
                {{ countDomains }}
              </b>
              <span class="text-[11.5px] font-semibold text-slate-300 block mt-0.5">Domain Terpadu</span>
            </div>
          </div>
        </section>

        <!-- FORM COLUMN (Mobile First Card: Utama di HP & Tablet) -->
        <section class="w-full flex justify-center lg:justify-end">
          <div
            class="relative w-full max-w-[540px] bg-white text-slate-900 rounded-[28px] shadow-[0_2px_4px_rgba(2,10,26,0.2),0_32px_64px_-24px_rgba(2,10,26,0.55)] p-6 sm:p-7 overflow-hidden transition-all duration-300"
            :class="{ 'animate-pulse ring-2 ring-red-400': isShaking }"
          >
            <!-- SUCCESS VEIL OVERLAY (Saat Berhasil Login) -->
            <div
              v-if="isSuccess"
              class="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center text-center p-6 transition-all duration-300 animate-fadeIn"
            >
              <div class="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <svg class="w-10 h-10 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 class="text-xl font-extrabold text-slate-900 tracking-tight">
                Selamat datang kembali
              </h3>
              <p class="text-xs font-semibold text-slate-500 mt-1 max-w-[280px] truncate">
                {{ successGreetingName }}
              </p>
              <p class="text-xs text-slate-400 mt-1">
                Mengalihkan ke dashboard…
              </p>
              <!-- Progress Bar Indikator -->
              <div class="w-36 h-1 rounded-full bg-slate-100 mt-5 overflow-hidden">
                <div class="h-full bg-emerald-600 animate-[growBar_1.2s_ease-out_forwards]" />
              </div>
            </div>

            <!-- CARD HEADER -->
            <div class="text-center pb-5 pt-5 mb-4 border-b border-slate-100">
              <span class="inline-flex items-center justify-center gap-2 text-[13px] font-bold mb-1" :class="themeStyles.accentText">
                <span class="w-1.5 h-1.5 rounded-full" :class="themeStyles.accentBg" />
                <span>{{ greetingText }}</span>
              </span>
              <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">
                Masuk ke Portal Admin
              </h2>
              <p class="text-xs text-slate-500 font-medium mt-1">
                Gunakan akun yang diberikan Tim IT Darqia 9.
              </p>
            </div>

            <!-- ALERT NOTIFICATION BOX -->
            <div
              v-if="alertMsg"
              class="p-3 rounded-2xl text-xs font-semibold flex items-start justify-between gap-2.5 mb-4 transition-all"
              :class="alertType === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-amber-50 border border-amber-200 text-amber-800'"
              role="alert"
            >
              <div class="flex items-start gap-2 min-w-0">
                <svg class="w-4 h-4 mt-0.5 shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span class="leading-relaxed">{{ alertMsg }}</span>
              </div>
              <button
                type="button"
                class="p-0.5 rounded-md hover:bg-black/5 opacity-70 hover:opacity-100 cursor-pointer shrink-0 transition-opacity"
                aria-label="Tutup pesan"
                @click="alertMsg = ''"
              >
                <svg class="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <!-- LOGIN FORM -->
            <form class="space-y-4" novalidate autocomplete="on" @submit.prevent="handleLogin">
              <!-- Field 1: Email -->
              <div>
                <div
                  class="relative flex items-center gap-2.5 bg-white border-[1.5px] rounded-[16px] px-3.5 h-[58px] transition-all"
                  :class="[
                    errUser ? 'border-red-500 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' : 'border-slate-200 ' + themeStyles.accentRing
                  ]"
                >
                  <!-- Icon User/ID -->
                  <svg
                    class="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2 transition-colors duration-150"
                    :class="isFocusedIdentifier || identifier ? themeStyles.accentText : 'text-slate-400'"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>

                  <!-- Input Text -->
                  <input
                    id="inUser"
                    v-model="identifier"
                    type="email"
                    placeholder=" "
                    autocomplete="email"
                    class="flex-1 w-full min-w-0 bg-transparent text-sm sm:text-[14.5px] font-semibold text-slate-900 outline-none pt-3.5"
                    @focus="isFocusedIdentifier = true"
                    @blur="isFocusedIdentifier = false"
                    @input="clearUserError"
                  >

                  <!-- Floating Label -->
                  <label
                    for="inUser"
                    class="absolute left-10 pointer-events-none transition-all duration-150 px-1 bg-white"
                    :class="[
                      isFocusedIdentifier || identifier
                        ? `top-0 -translate-y-1/2 text-[11px] font-extrabold tracking-wider ${errUser ? 'text-red-600' : themeStyles.accentText}`
                        : 'top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500'
                    ]"
                  >
                    Email
                  </label>

                  <!-- Clear Button -->
                  <button
                    v-if="identifier"
                    type="button"
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0 transition-colors"
                    title="Hapus isian"
                    @click="identifier = ''; clearUserError()"
                  >
                    <svg class="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <p v-if="errUser" class="text-xs font-semibold text-red-600 mt-1.5 pl-1">
                  {{ errUser }}
                </p>
              </div>

              <!-- Field 2: Kata Sandi -->
              <div>
                <div
                  class="relative flex items-center gap-2.5 bg-white border-[1.5px] rounded-[16px] px-3.5 h-[58px] transition-all"
                  :class="[
                    errPass ? 'border-red-500 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' : 'border-slate-200 ' + themeStyles.accentRing
                  ]"
                >
                  <!-- Icon Lock -->
                  <svg
                    class="w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2 transition-colors duration-150"
                    :class="isFocusedPassword || password ? themeStyles.accentText : 'text-slate-400'"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>

                  <!-- Input Password -->
                  <input
                    id="inPass"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder=" "
                    autocomplete="current-password"
                    class="flex-1 w-full min-w-0 bg-transparent text-sm sm:text-[14.5px] font-semibold text-slate-900 outline-none pt-3.5"
                    @focus="isFocusedPassword = true"
                    @blur="isFocusedPassword = false"
                    @input="clearPassError"
                    @keyup="handleKeyupPassword"
                  >

                  <!-- Floating Label -->
                  <label
                    for="inPass"
                    class="absolute left-10 pointer-events-none transition-all duration-150 px-1 bg-white"
                    :class="[
                      isFocusedPassword || password
                        ? `top-0 -translate-y-1/2 text-[11px] font-extrabold tracking-wider ${errPass ? 'text-red-600' : themeStyles.accentText}`
                        : 'top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500'
                    ]"
                  >
                    Kata Sandi
                  </label>

                  <!-- Toggle View Password -->
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0 transition-colors"
                    :title="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                    @click="showPassword = !showPassword"
                  >
                    <svg v-if="!showPassword" class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>

                <!-- Caps Lock Warning -->
                <div v-if="isCapsLockOn" class="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mt-1.5 pl-1">
                  <svg class="w-3.5 h-3.5 shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Caps Lock aktif — periksa kembali huruf besar/kecil sandi Anda.</span>
                </div>

                <!-- Error Message -->
                <p v-if="errPass" class="text-xs font-semibold text-red-600 mt-1.5 pl-1">
                  {{ errPass }}
                </p>
              </div>

              <!-- Form Utility Row: Remember Me & Forgot Password -->
              <div class="flex items-center justify-between gap-2 pt-0.5">
                <label class="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                  <input
                    v-model="rememberMe"
                    type="checkbox"
                    class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  >
                  <span>Ingat sesi saya</span>
                </label>

                <button
                  type="button"
                  class="text-xs font-bold hover:underline cursor-pointer transition-colors"
                  :class="themeStyles.accentText"
                  @click="showForgotInfo = !showForgotInfo"
                >
                  Lupa sandi?
                </button>
              </div>

              <!-- Tombol Submit Masuk Dashboard -->
              <button
                type="submit"
                class="relative w-full h-[53px] rounded-full text-white text-[14.5px] font-extrabold flex items-center justify-center gap-2 overflow-hidden shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed group mt-2"
                :class="[themeStyles.accentBg, themeStyles.accentBgHover, themeStyles.accentGlow]"
                :disabled="isLoading"
              >
                <!-- Shimmering Highlight Effect on Hover -->
                <div
                  class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                />

                <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{{ isLoading ? 'Memverifikasi Kredensial…' : 'Masuk Dashboard' }}</span>
                <svg
                  v-if="!isLoading"
                  class="w-4 h-4 fill-none stroke-current stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>

            <!-- Forgot Password Expandable Box -->
            <div
              v-if="showForgotInfo"
              class="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs text-slate-700 leading-relaxed transition-all"
            >
              <b class="text-slate-900 block font-bold mb-1">Panduan Pemulihan Kata Sandi:</b>
              <ol class="list-decimal list-inside space-y-1 text-slate-600">
                <li>Hubungi Tim IT Darqia 9 dengan menyebutkan nama lengkap dan NIK/NIP Anda.</li>
                <li>Tim IT akan mereset akun dan menerbitkan sandi sementara.</li>
                <li>Masuk menggunakan sandi sementara, lalu perbarui sandi Anda di menu Profil.</li>
              </ol>
            </div>

            <!-- Card Bottom Note -->
            <div class="mt-4 pt-3.5 border-t border-slate-100 text-center text-[11.5px] text-slate-500 font-medium">
              Akun hanya untuk guru &amp; staf. Aktivitas login tercatat di log sistem.
            </div>
          </div>
        </section>
      </main>

      <!-- PAGE FOOTER -->
      <footer class="w-full text-center text-xs text-slate-400/80 pt-4 pb-2">
        &copy; 2026 Yayasan Darqia Attaqwa &middot; Portal Admin Terpadu
      </footer>
    </div>

  </div>
</template>
