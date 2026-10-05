<template>
  <div>
    <!-- ======= OVERLAY HEADER ======= -->
    <div 
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-[#E3EAF7] shadow-[0_8px_28px_rgba(10,42,92,.12)]' 
          : 'bg-transparent border-transparent'
      ]"
    >
      <!-- Topbar Info Yayasan (Desktop Only) -->
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
        <div class="w-[min(1180px,100%-40px)] mx-auto h-full flex items-center gap-[14px]">
          <!-- Brand / Logos -->
          <NuxtLink to="/smk" class="flex items-center gap-[10px] mr-auto min-w-0 group" aria-label="Beranda Yayasan">
            <img 
              src="/asset/logosmp.png" 
              alt="Logo SMK IT Attaqwa 9" 
              class="w-[42px] h-[50px] lg:w-[46px] lg:h-[54px] object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]"
            >
            <img 
              src="/asset/logo.png" 
              alt="Logo SMK IT Attaqwa 9" 
              class="w-[42px] h-[50px] lg:w-[46px] lg:h-[54px] object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]"
            >
          </NuxtLink>

          <!-- Desktop Navigation Links -->
          <nav class="hidden xl:flex items-center gap-[4px]" aria-label="Menu utama">
            <NuxtLink 
              to="/smk" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Beranda
            </NuxtLink>

            <NuxtLink 
              to="/smk/tentang" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Tentang Kami
            </NuxtLink>

            <NuxtLink 
              to="/smk/ekstrakurikuler" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Ekstrakurikuler
            </NuxtLink>
            <NuxtLink 
              to="/smk/berita" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Berita & Artikel
            </NuxtLink>

            <NuxtLink 
              to="/smk/akademik" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Pembinaan
            </NuxtLink>

            <NuxtLink 
              to="/smk/spmb" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              SPMB 2027/2028
            </NuxtLink>


          </nav>

          <!-- Right Action CTA -->
          <div class="flex items-center gap-[10px]">
            <NuxtLink 
              to="/smk/kontak" 
              class="hidden sm:inline-flex items-center justify-center font-bold text-[15px] py-[11px] px-[22px] rounded-[13px] text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] shadow-[0_10px_22px_rgba(240,180,41,.35)] hover:shadow-[0_14px_28px_rgba(240,180,41,.45)] hover:-translate-y-[1px] active:scale-95 transition-all"
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
        class="bg-white border-b border-[#E3EAF7] px-[20px] py-[20px] space-y-[12px] shadow-2xl animate-fadeIn max-h-[calc(100vh-72px)] overflow-y-auto"
        @click.stop
      >
        <div class="pb-[12px] border-b border-[#E3EAF7] flex items-center justify-center gap-[14px]">
          <img src="/asset/logosmp.png" alt="Logo SMP" class="w-[44px] h-[50px] object-contain">
          <img src="/asset/logo.png" alt="Logo SMK" class="w-[44px] h-[50px] object-contain">
        </div>

        <NuxtLink 
          to="/smk" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          Beranda
        </NuxtLink>
        <NuxtLink 
          to="/smk/tentang" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          Tentang Sekolah
        </NuxtLink>
        <NuxtLink 
          to="/smk/ekstrakurikuler" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          Ekstrakurikuler
        </NuxtLink>
        <NuxtLink 
          to="/smk/akademik" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          Akademik
        </NuxtLink>
        <NuxtLink 
          to="/smk/spmb" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          SPMB 2027/2028
        </NuxtLink>


        <div class="pt-[12px] border-t border-[#E3EAF7]">
          <NuxtLink 
            to="/smk/kontak" 
            @click="isMobileMenuOpen = false" 
            class="w-full text-center block text-[15px] font-extrabold text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] py-[13px] px-[18px] rounded-[12px] shadow-md"
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
const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)
const schoolsDropdownRef = ref<HTMLElement | null>(null)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleClickOutside = (e: MouseEvent) => {
  if (schoolsDropdownRef.value && !schoolsDropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>
