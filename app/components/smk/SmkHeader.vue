<template>
  <div>
    <!-- ======= OVERLAY HEADER SMK ======= -->
    <div 
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-[#E3EAF7] shadow-[0_8px_28px_rgba(10,42,92,.12)]' 
          : 'bg-[#0A2A5C]/90 backdrop-blur-sm border-white/10'
      ]"
    >
      <!-- Topbar Info SMK (Desktop Only) -->
      <div 
        :class="[
          'hidden md:block text-[#DCE7FA] text-[12px] overflow-hidden transition-all duration-300',
          isScrolled ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[44px] opacity-100 py-[8px]'
        ]"
      >
        <div class="w-[min(1180px,100%-40px)] mx-auto flex justify-between items-center">
          <div class="flex items-center gap-[16px]">
            <span class="inline-flex items-center gap-[6px] opacity-95">
              <span class="w-[7px] h-[7px] rounded-full bg-[#4ADE80] animate-pulse"></span>
              <span>NPSN: <b>69940449</b> • Akreditasi <b>A</b></span>
            </span>
            <span class="opacity-40">|</span>
            <span class="opacity-90">Ujung Harapan, Babelan, Kab. Bekasi</span>
          </div>
          <div class="flex items-center gap-[18px]">
            <a href="tel:02188886776" class="opacity-90 hover:opacity-100 hover:text-white transition-opacity">
              Telp: 021-8888 6776
            </a>
            <a href="mailto:smkitattaqwa09@gmail.com" class="opacity-90 hover:opacity-100 hover:text-white transition-opacity">
              smkitattaqwa09@gmail.com
            </a>
          </div>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <header class="h-[68px] transition-colors duration-300 flex items-center">
        <div class="w-[min(1180px,100%-40px)] mx-auto h-full flex items-center gap-[14px]">
          <!-- Brand / Logo -->
          <NuxtLink to="/smk" class="flex items-center gap-[12px] mr-auto min-w-0 group" aria-label="Beranda SMK IT Attaqwa 9">
            <img 
              src="/asset/logo.png" 
              alt="Logo SMK IT Attaqwa 9" 
              class="w-[42px] h-[50px] object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]"
            >
            <div class="flex flex-col">
              <span 
                :class="[
                  'font-extrabold text-[15.5px] leading-tight transition-colors',
                  isScrolled ? 'text-[#0A2A5C]' : 'text-white'
                ]"
              >
                SMK IT ATTAQWA 9
              </span>
              <span 
                :class="[
                  'text-[10.5px] font-semibold tracking-wider transition-colors',
                  isScrolled ? 'text-[#5A6B8C]' : 'text-[#C9D8F2]'
                ]"
              >
                Unggul dalam IMTAQ, Terdepan dalam IPTEK
              </span>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation Links -->
          <nav class="hidden lg:flex items-center gap-[2px]" aria-label="Menu utama">
            <NuxtLink 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path"
              :class="[
                'py-[8px] px-[11px] rounded-[10px] font-bold text-[14px] whitespace-nowrap transition-all duration-200',
                isActive(item.path)
                  ? (isScrolled ? 'bg-[#0A2A5C] text-white shadow-sm' : 'bg-white text-[#0A2A5C] shadow-md')
                  : (isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white')
              ]"
            >
              {{ item.title }}
            </NuxtLink>
          </nav>

          <!-- CTA Button -->
          <div class="hidden sm:flex items-center gap-[10px]">
            <NuxtLink 
              to="/spmb/smk" 
              class="inline-flex items-center gap-[6px] py-[9px] px-[16px] rounded-[12px] font-extrabold text-[13.5px] text-[#3D2C00] bg-gradient-to-r from-[#F0B429] to-[#F59E0B] shadow-[0_4px_14px_rgba(240,180,41,.35)] hover:-translate-y-0.5 transition-all"
            >
              <span>Daftar SPMB</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button 
            type="button" 
            @click="isDrawerOpen = true"
            :class="[
              'lg:hidden p-2 rounded-[10px] transition-colors cursor-pointer',
              isScrolled ? 'text-[#0A2A5C] hover:bg-[#E8F0FE]' : 'text-white hover:bg-white/15'
            ]"
            aria-label="Buka menu navigasi"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
    </div>

    <!-- ======= MOBILE DRAWER ======= -->
    <div 
      v-if="isDrawerOpen" 
      class="fixed inset-0 z-50 lg:hidden flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-[#06142D]/60 backdrop-blur-xs transition-opacity"
        @click="isDrawerOpen = false"
      ></div>

      <!-- Drawer Content -->
      <div class="relative w-[min(320px,84vw)] bg-white h-full shadow-2xl p-6 flex flex-col z-10 overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-[#E3EAF7] mb-4">
          <div class="flex items-center gap-2">
            <img src="/asset/logo.png" alt="Logo SMK IT Attaqwa 9" class="w-8 h-9 object-contain">
            <b class="text-[#0A2A5C] text-sm">SMK IT Attaqwa 9</b>
          </div>
          <button 
            type="button" 
            @click="isDrawerOpen = false"
            class="p-2 text-[#5A6B8C] hover:text-[#0A2A5C] rounded-lg"
            aria-label="Tutup menu"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav class="flex flex-col gap-1">
          <NuxtLink 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            @click="isDrawerOpen = false"
            :class="[
              'p-3 rounded-xl font-bold text-sm transition-colors',
              isActive(item.path) ? 'bg-[#0A2A5C] text-white' : 'text-[#0F1E38] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]'
            ]"
          >
            {{ item.title }}
          </NuxtLink>
        </nav>

        <div class="mt-auto pt-6 border-t border-[#E3EAF7]">
          <NuxtLink 
            to="/spmb/smk" 
            @click="isDrawerOpen = false"
            class="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-sm text-[#3D2C00] bg-gradient-to-r from-[#F0B429] to-[#F59E0B] shadow-md"
          >
            <span>Daftar SPMB 2027/2028</span>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isScrolled = ref(false)
const isDrawerOpen = ref(false)

const navItems = [
  { title: 'Home', path: '/smk' },
  { title: 'Tentang Sekolah', path: '/smk/tentang' },
  { title: 'Akademik', path: '/smk/akademik' },
  { title: 'Ekstrakurikuler', path: '/smk/ekstrakurikuler' },
  { title: 'Berita & Artikel', path: '/smk/berita' },
  { title: 'SPMB', path: '/smk/spmb' },
  { title: 'Kontak Kami', path: '/smk/kontak' }
]

const isActive = (path) => {
  if (path === '/smk') {
    return route.path === '/smk' || route.path === '/smk/'
  }
  return route.path.startsWith(path)
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
