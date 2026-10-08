<template>
  <div>
    <!-- ======= OVERLAY HEADER ======= -->
    <div 
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-[#D1E7DD] shadow-[0_8px_28px_rgba(6,56,38,.12)]' 
          : 'bg-[#063826]/90 backdrop-blur-sm border-white/10 lg:bg-transparent lg:border-transparent'
      ]"
    >
      <!-- Topbar Info SMP (Desktop Only) -->
      <div 
        :class="[
          'hidden md:block text-[#C4E4D4] text-[12px] overflow-hidden transition-all duration-300',
          isScrolled ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[44px] opacity-100 py-[8px]'
        ]"
      >
        <div class="w-[min(1180px,100%-40px)] mx-auto flex justify-between items-center">
          <div class="flex items-center gap-[16px]">
            <span class="inline-flex items-center gap-[6px] opacity-95">
              <span class="w-[7px] h-[7px] rounded-full bg-[#4ADE80] animate-pulse"></span>
              <span>SMP IT Bina Cendekia Assalam · Milad ke-6</span>
            </span>
            <span class="opacity-40">|</span>
            <span class="opacity-90">Sekolah Berbasis Kelas Gender — Ujung Harapan, Babelan</span>
          </div>
          <div class="flex items-center gap-[18px]">
            <a href="tel:02188886776" class="opacity-90 hover:opacity-100 hover:text-white transition-opacity">
              Telp: 021-8888 6776
            </a>
            <a href="mailto:smpitbca@gmail.com" class="opacity-90 hover:opacity-100 hover:text-white transition-opacity">
              smpitbca@gmail.com
            </a>
          </div>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <header class="h-[68px] transition-colors duration-300 flex items-center mt-3 mb-3">
        <div class="w-[min(1180px,100%-40px)] mx-auto h-full flex items-center justify-between gap-[14px]">
          <!-- Brand / Logos -->
          <NuxtLink to="/smp" class="flex items-center gap-[10px] min-w-0 group" aria-label="Beranda SMP IT BCA">
            <img 
              src="/asset/logosmp.png" 
              alt="Logo SMP IT Bina Cendekia Assalam" 
              class="w-[42px] h-[48px] lg:w-[46px] lg:h-[52px] object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]"
            />
            <div class="flex flex-col">
              <span 
                :class="[
                  'text-[15px] sm:text-[16px] font-black tracking-tight leading-tight transition-colors duration-200',
                  isScrolled ? 'text-[#063826]' : 'text-white'
                ]"
              >
                SMP IT Bina Cendekia Assalam
              </span>
              <span 
                :class="[
                  'text-[11px] font-semibold tracking-wider uppercase transition-colors duration-200',
                  isScrolled ? 'text-[#0E7A4E]' : 'text-[#FCD34D]'
                ]"
              >
                Kelas Gender &amp; Berkarakter Qur'ani
              </span>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation Links -->
          <nav class="hidden xl:flex items-center gap-[3px]" aria-label="Menu utama">
            <NuxtLink 
              to="/smp" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smp' 
                  ? (isScrolled ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#1E3A2F] hover:bg-[#E4F4EC] hover:text-[#0E7A4E]' : 'text-[#E0F2E9] hover:bg-white/15 hover:text-white')
              ]"
            >
              Beranda
            </NuxtLink>

            <NuxtLink 
              to="/smp/tentang" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smp/tentang' 
                  ? (isScrolled ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#1E3A2F] hover:bg-[#E4F4EC] hover:text-[#0E7A4E]' : 'text-[#E0F2E9] hover:bg-white/15 hover:text-white')
              ]"
            >
              Tentang Kami
            </NuxtLink>

            <NuxtLink 
              to="/smp/akademik" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smp/akademik' 
                  ? (isScrolled ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#1E3A2F] hover:bg-[#E4F4EC] hover:text-[#0E7A4E]' : 'text-[#E0F2E9] hover:bg-white/15 hover:text-white')
              ]"
            >
              Akademik &amp; Ekskul
            </NuxtLink>

            <NuxtLink 
              to="/smp/berita" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smp/berita' 
                  ? (isScrolled ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#1E3A2F] hover:bg-[#E4F4EC] hover:text-[#0E7A4E]' : 'text-[#E0F2E9] hover:bg-white/15 hover:text-white')
              ]"
            >
              Berita &amp; Artikel
            </NuxtLink>

            <NuxtLink 
              to="/smp/spmb" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smp/spmb' 
                  ? (isScrolled ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#1E3A2F] hover:bg-[#E4F4EC] hover:text-[#0E7A4E]' : 'text-[#E0F2E9] hover:bg-white/15 hover:text-white')
              ]"
            >
              SPMB 2027/2028
            </NuxtLink>
          </nav>

          <!-- Right Action CTA -->
          <div class="flex items-center gap-[10px]">
            <NuxtLink 
              to="/smp/kontak" 
              class="hidden sm:inline-flex items-center justify-center font-bold text-[14px] py-[9px] px-[18px] rounded-[12px] text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] shadow-[0_8px_18px_rgba(240,180,41,.3)] hover:shadow-[0_12px_24px_rgba(240,180,41,.4)] hover:-translate-y-[1px] active:scale-95 transition-all"
            >
              <span>Kontak Kami</span>
            </NuxtLink>

            <!-- Mobile Drawer Toggle Button -->
            <button 
              type="button" 
              @click="isMobileMenuOpen = !isMobileMenuOpen" 
              :class="[
                'xl:hidden p-[10px] rounded-[12px] transition-colors cursor-pointer border',
                isScrolled ? 'bg-white border-[#D1E7DD] text-[#063826]' : 'bg-white/15 border-white/30 text-white'
              ]"
              aria-label="Menu Navigasi"
            >
              <svg v-if="!isMobileMenuOpen" class="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </div>

    <!-- Mobile Drawer Navigation -->
    <div 
      v-show="isMobileMenuOpen" 
      class="fixed inset-0 z-40 bg-[#052E22]/60 backdrop-blur-sm xl:hidden pt-[72px]"
      @click="isMobileMenuOpen = false"
    >
      <div 
        class="bg-white border-b border-[#D1E7DD] px-[20px] py-[20px] space-y-[8px] shadow-2xl max-h-[calc(100vh-72px)] overflow-y-auto"
        @click.stop
      >
        <div class="pb-[12px] border-b border-[#D1E7DD] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <img src="/asset/logosmp.png" alt="Logo SMP" class="w-[36px] h-[40px] object-contain" />
            <div>
              <b class="text-[14px] text-[#063826] block leading-tight">SMP IT Bina Cendekia Assalam</b>
              <small class="text-[11px] text-[#55705F]">Kelas Gender · Babelan Bekasi</small>
            </div>
          </div>
          <span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            Milad ke-6
          </span>
        </div>

        <NuxtLink 
          to="/smp" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0E241B] rounded-[10px] hover:bg-[#F2F9F5]"
          :class="$route.path === '/smp' ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : ''"
        >
          Beranda
        </NuxtLink>
        <NuxtLink 
          to="/smp/tentang" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0E241B] rounded-[10px] hover:bg-[#F2F9F5]"
          :class="$route.path === '/smp/tentang' ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : ''"
        >
          Tentang Kami
        </NuxtLink>
        <NuxtLink 
          to="/smp/akademik" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0E241B] rounded-[10px] hover:bg-[#F2F9F5]"
          :class="$route.path === '/smp/akademik' ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : ''"
        >
          Akademik &amp; Ekstrakurikuler
        </NuxtLink>
        <NuxtLink 
          to="/smp/berita" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0E241B] rounded-[10px] hover:bg-[#F2F9F5]"
          :class="$route.path === '/smp/berita' ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : ''"
        >
          Berita &amp; Artikel
        </NuxtLink>
        <NuxtLink 
          to="/smp/spmb" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0E241B] rounded-[10px] hover:bg-[#F2F9F5]"
          :class="$route.path === '/smp/spmb' ? 'bg-[#E4F4EC] text-[#0E7A4E] font-bold' : ''"
        >
          SPMB 2027/2028
        </NuxtLink>

        <div class="pt-[12px] border-t border-[#D1E7DD]">
          <NuxtLink 
            to="/smp/kontak" 
            @click="isMobileMenuOpen = false" 
            class="w-full text-center block text-[15px] font-extrabold text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] py-[12px] px-[18px] rounded-[12px] shadow-md"
          >
            Kontak Kami
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 25
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
