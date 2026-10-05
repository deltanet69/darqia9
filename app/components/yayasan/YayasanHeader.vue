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
              <span>NIB OSS: <b>0220001672276</b> (Yayasan Darul Qohar Cendekia)</span>
            </span>
            <span class="opacity-40">|</span>
            <span class="opacity-90">Ujung Harapan, Babelan — Kab. Bekasi</span>
          </div>
          <div class="flex items-center gap-[18px]">
            <a href="tel:02188886776" class="opacity-90 hover:opacity-100 hover:text-white transition-opacity">
              Telp: 021-8888 6776
            </a>
            <a href="mailto:yayasandarqia@gmail.com" class="opacity-90 hover:opacity-100 hover:text-white transition-opacity">
              yayasandarqia@gmail.com
            </a>
          </div>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <header class="h-[68px] transition-colors duration-300 flex items-center mt-4 mb-4">
        <div class="w-[min(1180px,100%-40px)] mx-auto h-full flex items-center gap-[14px]">
          <!-- Brand / Logos -->
          <a href="#beranda" class="flex items-center gap-[10px] mr-auto min-w-0 group" aria-label="Beranda Yayasan">
            <img 
              src="/asset/logosmp.png" 
              alt="Logo SMP IT BCA" 
              class="w-[42px] h-[50px] lg:w-[46px] lg:h-[54px] object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]"
            >
            <img 
              src="/asset/logo.png" 
              alt="Logo SMK IT Attaqwa 9" 
              class="w-[42px] h-[50px] lg:w-[46px] lg:h-[54px] object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]"
            >
          </a>

          <!-- Desktop Navigation Links -->
          <nav class="hidden xl:flex items-center gap-[4px]" aria-label="Menu utama">
            <a 
              href="#beranda" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Beranda
            </a>

            <a 
              href="#tentang" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Tentang Kami
            </a>

            <!-- Dropdown: Sekolah Naungan -->
            <div class="relative" ref="schoolsDropdownRef">
              <button 
                type="button"
                @click="toggleDropdown"
                :class="[
                  'inline-flex items-center gap-[4px] py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap cursor-pointer transition-all duration-200',
                  isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
                ]"
                aria-haspopup="true"
                :aria-expanded="isDropdownOpen"
              >
                <span>Sekolah Kami</span>
                <svg class="w-[14px] h-[14px] transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div 
                v-show="isDropdownOpen" 
                class="absolute top-[calc(100%+8px)] left-0 w-[340px] bg-white border border-[#E3EAF7] rounded-[16px] shadow-[0_24px_60px_rgba(10,42,92,.16)] p-[10px] z-50 transition-all duration-200"
              >
                <a 
                  href="https://smpitbca.sch.id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="flex flex-col p-[12px] rounded-[12px] hover:bg-[#E8F0FE] transition-colors group mb-[4px]"
                >
                  <div class="flex items-center justify-between">
                    <b class="text-[14.5px] text-[#0F1E38] group-hover:text-[#1B5FD9] whitespace-nowrap">SMP IT Bina Cendekia</b>
                    <span class="text-[11px] font-extrabold text-[#1B5FD9] bg-[#E8F0FE] px-[7px] py-[2px] rounded-full whitespace-nowrap">NPSN 70008264</span>
                  </div>
                  <small class="text-[#5A6B8C] text-[12px] mt-[2px]">Kelas Gender &amp; Metode Yanbu'a</small>
                </a>

                <a 
                  href="https://smkitattaqwa9.sch.id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="flex flex-col p-[12px] rounded-[12px] hover:bg-[#E8F0FE] transition-colors group"
                >
                  <div class="flex items-center justify-between">
                    <b class="text-[14.5px] text-[#0F1E38] group-hover:text-[#1B5FD9] whitespace-nowrap">SMK IT Attaqwa 9</b>
                    <span class="text-[11px] font-extrabold text-[#92400E] bg-[#FEF3C7] px-[7px] py-[2px] rounded-full whitespace-nowrap">NPSN 69940449</span>
                  </div>
                  <small class="text-[#5A6B8C] text-[12px] mt-[2px]">6 Program Kejuruan, BLK Komunitas</small>
                </a>
              </div>
            </div>

            <a 
              href="#pembinaan" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Pembinaan
            </a>

            <a 
              href="#pmb" 
              :class="[
                'py-[10px] px-[12px] rounded-[10px] font-semibold text-[16px] whitespace-nowrap transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              SPMB 2027/2028
            </a>


          </nav>

          <!-- Right Action CTA -->
          <div class="flex items-center gap-[10px]">
            <a 
              href="#kontak" 
              class="hidden sm:inline-flex items-center justify-center font-bold text-[15px] py-[11px] px-[22px] rounded-[13px] text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] shadow-[0_10px_22px_rgba(240,180,41,.35)] hover:shadow-[0_14px_28px_rgba(240,180,41,.45)] hover:-translate-y-[1px] active:scale-95 transition-all"
            >
              <span>Kontak Kami</span>
            </a>

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

        <a 
          href="#beranda" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          Beranda
        </a>
        <a 
          href="#tentang" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          Tentang Yayasan
        </a>
        <a 
          href="#sekolah" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          Sekolah Kami (SMP &amp; SMK)
        </a>
        <a 
          href="#pembinaan" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          Kultur Pembinaan
        </a>
        <a 
          href="#pmb" 
          @click="isMobileMenuOpen = false" 
          class="block py-[10px] px-[12px] text-[15px] font-semibold text-[#0F1E38] rounded-[10px] hover:bg-[#F5F8FF]"
        >
          PMB 2027/2028 (7 Rombel)
        </a>


        <div class="pt-[12px] border-t border-[#E3EAF7]">
          <a 
            href="#kontak" 
            @click="isMobileMenuOpen = false" 
            class="w-full text-center block text-[15px] font-extrabold text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] py-[13px] px-[18px] rounded-[12px] shadow-md"
          >
            Kontak Kami
          </a>
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
