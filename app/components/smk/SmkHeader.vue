<template>
  <div>
    <!-- ======= OVERLAY HEADER ======= -->
    <div 
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-[#E3EAF7] shadow-[0_8px_28px_rgba(10,42,92,.12)]' 
          : 'bg-[#0A2A5C]/90 backdrop-blur-sm border-white/10 lg:bg-transparent lg:border-transparent'
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
              <span>NPSN: <b>69940449</b> (SMK IT Attaqwa 9)</span>
            </span>
            <span class="opacity-40">|</span>
            <span class="opacity-90">Ujung Harapan, Babelan — Kab. Bekasi</span>
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
      <header class="h-[68px] transition-colors duration-300 flex items-center mt-4 mb-4">
        <div class="w-[min(1180px,100%-40px)] mx-auto h-full flex items-center justify-between gap-[14px]">
          <!-- Brand / Logos -->
          <NuxtLink to="/smk" class="flex items-center gap-[10px] min-w-0 group" aria-label="Beranda SMK IT Attaqwa 9">
            <img 
              src="/asset/logo.png" 
              alt="Logo SMK IT Attaqwa 9" 
              class="w-[42px] h-[50px] lg:w-[46px] lg:h-[54px] object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]"
            >
            <div class="flex flex-col">
              <span 
                :class="[
                  'text-[15px] sm:text-[16px] font-black tracking-tight leading-tight transition-colors duration-200',
                  isScrolled ? 'text-[#0A2A5C]' : 'text-white'
                ]"
              >
                SMK IT Attaqwa 9
              </span>
              <span 
                :class="[
                  'text-[11px] font-semibold tracking-wider uppercase transition-colors duration-200',
                  isScrolled ? 'text-[#1B5FD9]' : 'text-[#FCD34D]'
                ]"
              >
                Vokasi Unggulan &amp; Berakhlak
              </span>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation Links (7 Pages) -->
          <nav class="hidden xl:flex items-center gap-[3px]" aria-label="Menu utama">
            <NuxtLink 
              to="/smk" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smk' 
                  ? (isScrolled ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white')
              ]"
            >
              Beranda
            </NuxtLink>

            <NuxtLink 
              to="/smk/tentang" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smk/tentang' 
                  ? (isScrolled ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white')
              ]"
            >
              Tentang Kami
            </NuxtLink>

            <NuxtLink 
              to="/smk/akademik" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smk/akademik' 
                  ? (isScrolled ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white')
              ]"
            >
              Akademik &amp; Ekskul
            </NuxtLink>

            <NuxtLink 
              to="/smk/berita" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smk/berita' 
                  ? (isScrolled ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white')
              ]"
            >
              Berita &amp; Artikel
            </NuxtLink>

            <NuxtLink 
              to="/smk/spmb" 
              :class="[
                'py-[8px] px-[12px] rounded-[10px] font-semibold text-[15px] whitespace-nowrap transition-all duration-200',
                $route.path === '/smk/spmb' 
                  ? (isScrolled ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : 'bg-white/20 text-white font-bold')
                  : (isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white')
              ]"
            >
              SPMB 2027/2028
            </NuxtLink>
          </nav>

          <!-- Right Action CTA -->
          <div class="flex items-center gap-[10px]">
            <NuxtLink 
              to="/smk/kontak" 
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
                isScrolled ? 'bg-white border-[#E3EAF7] text-[#0F1E38]' : 'bg-white/15 border-white/30 text-white'
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
      class="fixed inset-0 z-40 bg-[#0A2A5C]/60 backdrop-blur-sm xl:hidden pt-[72px]"
      @click="isMobileMenuOpen = false"
    >
      <div 
        class="bg-white border-b border-[#E3EAF7] px-[20px] py-[20px] space-y-[8px] shadow-2xl animate-fadeIn max-h-[calc(100vh-72px)] overflow-y-auto"
        @click.stop
      >
        <div class="pb-[12px] border-b border-[#E3EAF7] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <img src="/asset/logo.png" alt="Logo SMK" class="w-[36px] h-[42px] object-contain">
            <div>
              <b class="text-[14px] text-[#0A2A5C] block leading-tight">SMK IT Attaqwa 9</b>
              <small class="text-[11px] text-[#5A6B8C]">Babelan, Kab. Bekasi</small>
            </div>
          </div>
          <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            Akreditasi A
          </span>
        </div>

        <NuxtLink 
          to="/smk" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
          :class="$route.path === '/smk' ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : ''"
        >
          Beranda
        </NuxtLink>
        <NuxtLink 
          to="/smk/tentang" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
          :class="$route.path === '/smk/tentang' ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : ''"
        >
          Tentang Kami
        </NuxtLink>
        <NuxtLink 
          to="/smk/akademik" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
          :class="$route.path === '/smk/akademik' ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : ''"
        >
          Akademik &amp; Ekstrakurikuler
        </NuxtLink>
        <NuxtLink 
          to="/smk/berita" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
          :class="$route.path === '/smk/berita' ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : ''"
        >
          Berita &amp; Artikel
        </NuxtLink>
        <NuxtLink 
          to="/smk/spmb" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
          :class="$route.path === '/smk/spmb' ? 'bg-[#E8F0FE] text-[#1B5FD9] font-bold' : ''"
        >
          SPMB 2027/2028
        </NuxtLink>

        <div class="pt-[12px] border-t border-[#E3EAF7]">
          <NuxtLink 
            to="/smk/kontak" 
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
