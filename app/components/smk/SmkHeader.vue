<template>
  <div>
    <!-- ======= OVERLAY HEADER SMK ======= -->
    <header 
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E3EAF7] shadow-[0_8px_28px_rgba(10,42,92,.12)]' 
          : 'bg-[#0A2A5C]/95 backdrop-blur-md border-b border-white/15 shadow-[0_4px_20px_rgba(6,26,62,.25)]'
      ]"
      :style="!isScrolled ? 'background-color: rgba(10, 42, 92, 0.96);' : 'background-color: rgba(255, 255, 255, 0.96);'"
    >
      <!-- Topbar Info SMK (Desktop Only) -->
      <div 
        :class="[
          'hidden md:block text-[12px] border-b transition-all duration-300 overflow-hidden',
          isScrolled 
            ? 'max-h-0 opacity-0 pointer-events-none border-transparent' 
            : 'max-h-[44px] opacity-100 py-[7px] text-[#C9D8F2] border-white/10'
        ]"
        :style="!isScrolled ? 'background-color: #061A3E;' : ''"
      >
        <div class="w-[min(1180px,100%-40px)] mx-auto flex justify-between items-center">
          <div class="flex items-center gap-[16px]">
            <span class="inline-flex items-center gap-[6px]">
              <span class="w-[7px] h-[7px] rounded-full bg-[#4ADE80] animate-pulse"></span>
              <span>NPSN: <b class="text-white">69940449</b> • Akreditasi <b class="text-[#FCD34D]">A</b> (BAN-SM)</span>
            </span>
            <span class="opacity-30">|</span>
            <span class="opacity-90">Ujung Harapan, Babelan, Kab. Bekasi</span>
          </div>
          <div class="flex items-center gap-[18px]">
            <a href="tel:02188886776" class="hover:text-white transition-colors">
              Telp: 021-8888 6776
            </a>
            <a href="mailto:smkitattaqwa09@gmail.com" class="hover:text-white transition-colors">
              smkitattaqwa09@gmail.com
            </a>
          </div>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <div class="h-[68px] flex items-center">
        <div class="w-[min(1180px,100%-40px)] mx-auto h-full flex items-center justify-between gap-[16px]">
          <!-- Brand / Logo -->
          <NuxtLink to="/smk" class="flex items-center gap-[12px] min-w-0 group" aria-label="Beranda SMK IT Attaqwa 9">
            <img 
              src="/asset/logo.png" 
              alt="Logo SMK IT Attaqwa 9" 
              class="w-[40px] h-[48px] object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,.3)]"
            >
            <div class="flex flex-col">
              <span 
                :class="[
                  'font-black text-[15.5px] leading-tight transition-colors',
                  isScrolled ? 'text-[#0A2A5C]' : 'text-white'
                ]"
              >
                SMK IT ATTAQWA 9
              </span>
              <span 
                :class="[
                  'text-[10.5px] font-bold tracking-wider uppercase transition-colors',
                  isScrolled ? 'text-[#5A6B8C]' : 'text-[#FCD34D]'
                ]"
              >
                Unggul dalam IMTAQ, Terdepan dalam IPTEK
              </span>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation Links -->
          <nav class="hidden lg:flex items-center gap-[4px]" aria-label="Menu navigasi">
            <NuxtLink 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path"
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-bold text-[14px] whitespace-nowrap transition-all duration-200',
                isActive(item.path)
                  ? (isScrolled ? 'bg-[#0A2A5C] text-white shadow-xs' : 'bg-white/20 text-[#FCD34D] border border-white/25')
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
              class="inline-flex items-center gap-[6px] py-[9px] px-[18px] rounded-[12px] font-black text-[13.5px] text-[#3D2C00] shadow-[0_4px_14px_rgba(240,180,41,.35)] hover:-translate-y-0.5 transition-all"
              style="background: linear-gradient(90deg, #F0B429 0%, #F59E0B 100%);"
            >
              <span>Daftar SPMB</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
      </div>
    </header>

    <!-- ======= MOBILE DRAWER ======= -->
    <div 
      v-if="isDrawerOpen" 
      class="fixed inset-0 z-50 lg:hidden flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-[#06142D]/70 backdrop-blur-xs transition-opacity"
        @click="isDrawerOpen = false"
      ></div>

      <!-- Drawer Content -->
      <div class="relative w-[min(320px,84vw)] bg-white h-full shadow-2xl p-6 flex flex-col z-10 overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-[#E3EAF7] mb-4">
          <div class="flex items-center gap-2">
            <img src="/asset/logo.png" alt="Logo SMK IT Attaqwa 9" class="w-8 h-9 object-contain">
            <b class="text-[#0A2A5C] text-sm font-extrabold">SMK IT Attaqwa 9</b>
          </div>
          <button 
            type="button" 
            @click="isDrawerOpen = false"
            class="p-2 text-[#5A6B8C] hover:text-[#0A2A5C] rounded-lg cursor-pointer"
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
            class="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-sm text-[#3D2C00] shadow-md"
            style="background: linear-gradient(90deg, #F0B429 0%, #F59E0B 100%);"
          >
            <span>Daftar SPMB 2027/2028</span>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const isActive = (path: string) => {
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
