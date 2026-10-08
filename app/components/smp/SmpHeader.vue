<template>
  <div>
    <!-- ================= TOPBAR ================= -->
    <div class="bg-[#052E22] text-[#C4E4D4] text-[12.5px] py-[8px] border-b border-[#0A4A30] hidden sm:block">
      <div class="max-w-[1180px] mx-auto px-[22px] flex justify-between items-center flex-wrap gap-3">
        <div class="flex items-center gap-4 flex-wrap">
          <a href="tel:02188886776" class="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
              <path d="M5.5 4h3.6l1.9 4.8-2.4 1.4a12.5 12.5 0 005.2 5.2l1.4-2.4 4.8 1.9v3.6a2 2 0 01-2.1 2A16.5 16.5 0 013.5 6.1a2 2 0 012-2.1z"/>
            </svg>
            <span>021-8888 6776</span>
          </a>
          <a href="mailto:smpitbca@gmail.com" class="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
              <rect x="3" y="5.5" width="18" height="13" rx="2.5"/>
              <path d="M3.5 7.5L12 13l8.5-5.5"/>
            </svg>
            <span>smpitbca@gmail.com</span>
          </a>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 stroke-current stroke-[1.8] fill-none text-[#34C77B]" viewBox="0 0 24 24">
            <path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/>
            <circle cx="12" cy="10" r="2.6"/>
          </svg>
          <span>Ujung Harapan, Babelan, Kab. Bekasi</span>
        </div>
      </div>
    </div>

    <!-- ================= NAVBAR ================= -->
    <header class="bg-white sticky top-0 z-50 shadow-[0_2px_18px_rgba(6,56,38,0.08)] border-b border-[#E0ECE6]">
      <div class="max-w-[1180px] mx-auto px-[22px] h-[76px] flex items-center justify-between gap-[26px]">
        
        <!-- Logo -->
        <NuxtLink to="/smp" class="flex items-center gap-[12px] text-inherit no-underline shrink-0 group">
          <div class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#12A15E] to-[#063826] flex items-center justify-center text-white font-black text-[18px] shadow-[0_6px_16px_rgba(14,122,78,0.35)] shrink-0">
            BCA
          </div>
          <div class="flex flex-col">
            <b class="text-[#052E22] font-black text-[15px] sm:text-[16.5px] leading-tight block">
              SMP IT BINA CENDEKIA ASSALAM
            </b>
            <small class="text-[#55705F] text-[10.5px] font-semibold tracking-[0.04em] block">
              Alqur'an &amp; Akhlaknya Terpuji, Prestasi Akademiknya Teruji
            </small>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden xl:flex items-center gap-1 ml-auto">
          <NuxtLink 
            to="/smp" 
            :class="[
              'text-[13.8px] font-semibold py-[10px] px-[13px] rounded-[10px] transition-all whitespace-nowrap',
              $route.path === '/smp' 
                ? 'bg-[#063826] text-white font-bold' 
                : 'text-[#0E241B] hover:bg-[#E4F4EC] hover:text-[#063826]'
            ]"
          >
            Home
          </NuxtLink>

          <NuxtLink 
            to="/smp/tentang" 
            :class="[
              'text-[13.8px] font-semibold py-[10px] px-[13px] rounded-[10px] transition-all whitespace-nowrap',
              $route.path === '/smp/tentang' 
                ? 'bg-[#063826] text-white font-bold' 
                : 'text-[#0E241B] hover:bg-[#E4F4EC] hover:text-[#063826]'
            ]"
          >
            Tentang Sekolah
          </NuxtLink>

          <NuxtLink 
            to="/smp/akademik" 
            :class="[
              'text-[13.8px] font-semibold py-[10px] px-[13px] rounded-[10px] transition-all whitespace-nowrap',
              $route.path === '/smp/akademik' 
                ? 'bg-[#063826] text-white font-bold' 
                : 'text-[#0E241B] hover:bg-[#E4F4EC] hover:text-[#063826]'
            ]"
          >
            Akademik
          </NuxtLink>

          <NuxtLink 
            to="/smp/akademik#ekskul" 
            :class="[
              'text-[13.8px] font-semibold py-[10px] px-[13px] rounded-[10px] transition-all whitespace-nowrap',
              'text-[#0E241B] hover:bg-[#E4F4EC] hover:text-[#063826]'
            ]"
          >
            Ekstrakurikuler
          </NuxtLink>

          <NuxtLink 
            to="/smp/berita" 
            :class="[
              'text-[13.8px] font-semibold py-[10px] px-[13px] rounded-[10px] transition-all whitespace-nowrap',
              $route.path.startsWith('/smp/berita') 
                ? 'bg-[#063826] text-white font-bold' 
                : 'text-[#0E241B] hover:bg-[#E4F4EC] hover:text-[#063826]'
            ]"
          >
            Berita &amp; Artikel
          </NuxtLink>

          <NuxtLink 
            to="/smp/kontak" 
            :class="[
              'text-[13.8px] font-semibold py-[10px] px-[13px] rounded-[10px] transition-all whitespace-nowrap',
              $route.path === '/smp/kontak' 
                ? 'bg-[#063826] text-white font-bold' 
                : 'text-[#0E241B] hover:bg-[#E4F4EC] hover:text-[#063826]'
            ]"
          >
            Kontak Kami
          </NuxtLink>
        </nav>

        <!-- Right Action Button -->
        <div class="flex items-center gap-3 shrink-0">
          <NuxtLink 
            to="/smp/spmb" 
            class="hidden sm:inline-flex items-center justify-center font-bold text-[13.5px] py-[10px] px-[20px] rounded-[11px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 active:scale-95 transition-all shrink-0"
          >
            SPMB 2027/2028
          </NuxtLink>

          <!-- Mobile Burger Button -->
          <button 
            type="button" 
            @click="isMobileMenuOpen = !isMobileMenuOpen" 
            class="xl:hidden p-2 rounded-lg text-[#052E22] hover:bg-[#E4F4EC] transition-colors cursor-pointer"
            aria-label="Menu"
          >
            <div class="space-y-1.5 w-6">
              <span class="block w-6 h-0.5 bg-[#052E22] rounded-full"></span>
              <span class="block w-6 h-0.5 bg-[#052E22] rounded-full"></span>
              <span class="block w-6 h-0.5 bg-[#052E22] rounded-full"></span>
            </div>
          </button>
        </div>

      </div>
    </header>

    <!-- ================= MOBILE DRAWER ================= -->
    <div 
      v-show="isMobileMenuOpen" 
      class="fixed inset-0 z-50 transition-opacity duration-300"
    >
      <!-- Backdrop Scrim -->
      <div 
        class="absolute inset-0 bg-[#052E22]/55 backdrop-blur-sm"
        @click="isMobileMenuOpen = false"
      ></div>

      <!-- Slide Panel -->
      <div 
        class="absolute top-0 right-0 bottom-0 w-[min(320px,84vw)] bg-white p-[26px_24px] shadow-2xl overflow-y-auto flex flex-col justify-between"
      >
        <div>
          <!-- Header Inside Drawer -->
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-[#E0ECE6]">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#12A15E] to-[#063826] flex items-center justify-center text-white font-black text-sm shadow-md">
                BCA
              </div>
              <div>
                <b class="text-[13.5px] text-[#052E22] block leading-tight">SMP IT BCA</b>
                <small class="text-[10.5px] text-[#55705F]">Milad ke-6</small>
              </div>
            </div>
            <button 
              @click="isMobileMenuOpen = false"
              class="text-[#55705F] hover:text-[#052E22] p-1.5 text-lg font-bold"
              aria-label="Tutup Menu"
            >
              ✕
            </button>
          </div>

          <!-- Drawer Navigation Links -->
          <nav class="space-y-1">
            <NuxtLink 
              to="/smp" 
              @click="isMobileMenuOpen = false"
              :class="[
                'block py-[13px] px-[6px] font-bold text-[15.5px] border-b border-[#E0ECE6]',
                $route.path === '/smp' ? 'text-[#0E7A4E]' : 'text-[#0E241B] hover:text-[#0E7A4E]'
              ]"
            >
              Home
            </NuxtLink>

            <NuxtLink 
              to="/smp/tentang" 
              @click="isMobileMenuOpen = false"
              :class="[
                'block py-[13px] px-[6px] font-bold text-[15.5px] border-b border-[#E0ECE6]',
                $route.path === '/smp/tentang' ? 'text-[#0E7A4E]' : 'text-[#0E241B] hover:text-[#0E7A4E]'
              ]"
            >
              Tentang Sekolah
            </NuxtLink>

            <NuxtLink 
              to="/smp/akademik" 
              @click="isMobileMenuOpen = false"
              :class="[
                'block py-[13px] px-[6px] font-bold text-[15.5px] border-b border-[#E0ECE6]',
                $route.path === '/smp/akademik' ? 'text-[#0E7A4E]' : 'text-[#0E241B] hover:text-[#0E7A4E]'
              ]"
            >
              Akademik
            </NuxtLink>

            <NuxtLink 
              to="/smp/akademik#ekskul" 
              @click="isMobileMenuOpen = false"
              class="block py-[13px] px-[6px] font-bold text-[15.5px] border-b border-[#E0ECE6] text-[#0E241B] hover:text-[#0E7A4E]"
            >
              Ekstrakurikuler
            </NuxtLink>

            <NuxtLink 
              to="/smp/berita" 
              @click="isMobileMenuOpen = false"
              :class="[
                'block py-[13px] px-[6px] font-bold text-[15.5px] border-b border-[#E0ECE6]',
                $route.path.startsWith('/smp/berita') ? 'text-[#0E7A4E]' : 'text-[#0E241B] hover:text-[#0E7A4E]'
              ]"
            >
              Berita &amp; Artikel
            </NuxtLink>

            <NuxtLink 
              to="/smp/spmb" 
              @click="isMobileMenuOpen = false"
              :class="[
                'block py-[13px] px-[6px] font-bold text-[15.5px] border-b border-[#E0ECE6]',
                $route.path === '/smp/spmb' ? 'text-[#0E7A4E]' : 'text-[#0E241B] hover:text-[#0E7A4E]'
              ]"
            >
              SPMB
            </NuxtLink>

            <NuxtLink 
              to="/smp/kontak" 
              @click="isMobileMenuOpen = false"
              :class="[
                'block py-[13px] px-[6px] font-bold text-[15.5px] border-b border-[#E0ECE6]',
                $route.path === '/smp/kontak' ? 'text-[#0E7A4E]' : 'text-[#0E241B] hover:text-[#0E7A4E]'
              ]"
            >
              Kontak Kami
            </NuxtLink>
          </nav>
        </div>

        <!-- CTA in Drawer Bottom -->
        <div class="pt-6">
          <NuxtLink 
            to="/smp/spmb" 
            @click="isMobileMenuOpen = false"
            class="w-full inline-flex items-center justify-center font-bold text-[15px] py-[14px] px-[28px] rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)]"
          >
            Daftar SPMB 2027/2028
          </NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)
</script>

