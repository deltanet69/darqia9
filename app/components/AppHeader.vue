<template>
  <div>
    <!-- ======= OVERLAY HEADER ======= -->
    <div 
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-[#E3EAF7] shadow-[0_8px_28px_rgba(10,42,92,.12)]' 
          : 'bg-transparent border-transparent'
      ]"
    >
      <!-- Topbar (Desktop Only) -->
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
      <header class="h-[68px] transition-colors duration-300 flex items-center">
        <div class="w-[min(1180px,100%-40px)] mx-auto h-full flex items-center gap-[14px]">
          <!-- Brand / Logo -->
          <a href="#home" class="flex items-center gap-[11px] mr-auto min-w-0 group" aria-label="Beranda">
            <img 
              src="/asset/logo.png" 
              alt="Logo SMK IT Attaqwa 9" 
              class="w-[44px] h-[52px] lg:w-[48px] lg:h-[56px] object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]"
            >
            <div class="leading-[1.25] min-w-0">
              <b :class="['block text-[15.5px] lg:text-[17.5px] font-extrabold tracking-[-0.3px] truncate transition-colors duration-300', isScrolled ? 'text-[#0F1E38]' : 'text-white']">
                SMK IT Attaqwa 9
              </b>
              <span :class="['block text-[11px] lg:text-[12px] font-semibold truncate transition-colors duration-300', isScrolled ? 'text-[#5A6B8C]' : 'text-white/75']">
                Unggul dalam IMTAQ, Terdepan dalam IPTEK
              </span>
            </div>
          </a>

          <!-- Desktop Navigation Links -->
          <nav class="hidden lg:flex items-center gap-[4px]" aria-label="Menu utama">
            <a 
              href="#home" 
              :class="[
                'py-[10px] px-[13px] rounded-[10px] font-semibold text-[14.5px] transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Home
            </a>

            <!-- Dropdown: Profile -->
            <div class="relative" ref="profileDropdownRef">
              <button 
                type="button"
                @click="toggleDropdown('profile')"
                :class="[
                  'inline-flex items-center gap-[6px] py-[10px] px-[13px] rounded-[10px] font-semibold text-[14.5px] cursor-pointer transition-all duration-200',
                  isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
                ]"
                aria-haspopup="true"
                :aria-expanded="activeDropdown === 'profile'"
              >
                Profile 
                <svg :class="['w-[14px] h-[14px] transition-transform duration-200', activeDropdown === 'profile' ? 'rotate-180' : '']"><use href="#i-chev-d"/></svg>
              </button>

              <div 
                v-show="activeDropdown === 'profile'"
                class="absolute top-[calc(100%+8px)] left-0 min-w-[260px] bg-white border border-[#E3EAF7] rounded-[14px] shadow-[0_24px_60px_rgba(10,42,92,.16)] p-[8px] z-50 transition-all duration-200"
              >
                <a 
                  href="#profil" 
                  @click="goToTab('smp')"
                  class="flex flex-col p-[10px_12px] rounded-[10px] hover:bg-[#E8F0FE] transition-colors group"
                >
                  <b class="text-[14px] text-[#0F1E38] group-hover:text-[#1B5FD9]">SMP IT Bina Cendekia Assalam</b>
                  <small class="text-[#5A6B8C] text-[12px]">Unit SMP — satu kompleks</small>
                </a>
                <a 
                  href="#profil" 
                  @click="goToTab('smk')"
                  class="flex flex-col p-[10px_12px] rounded-[10px] hover:bg-[#E8F0FE] transition-colors group"
                >
                  <b class="text-[14px] text-[#0F1E38] group-hover:text-[#1B5FD9]">SMK IT Attaqwa 9</b>
                  <small class="text-[#5A6B8C] text-[12px]">Akreditasi A • NPSN 69940449</small>
                </a>
              </div>
            </div>

            <a 
              href="#berita" 
              :class="[
                'py-[10px] px-[13px] rounded-[10px] font-semibold text-[14.5px] transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              Berita &amp; Artikel
            </a>

            <!-- Dropdown: Kegiatan -->
            <div class="relative" ref="kegiatanDropdownRef">
              <button 
                type="button"
                @click="toggleDropdown('kegiatan')"
                :class="[
                  'inline-flex items-center gap-[6px] py-[10px] px-[13px] rounded-[10px] font-semibold text-[14.5px] cursor-pointer transition-all duration-200',
                  isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
                ]"
                aria-haspopup="true"
                :aria-expanded="activeDropdown === 'kegiatan'"
              >
                Kegiatan 
                <svg :class="['w-[14px] h-[14px] transition-transform duration-200', activeDropdown === 'kegiatan' ? 'rotate-180' : '']"><use href="#i-chev-d"/></svg>
              </button>

              <div 
                v-show="activeDropdown === 'kegiatan'"
                class="absolute top-[calc(100%+8px)] left-0 min-w-[260px] bg-white border border-[#E3EAF7] rounded-[14px] shadow-[0_24px_60px_rgba(10,42,92,.16)] p-[8px] z-50 transition-all duration-200"
              >
                <a 
                  href="#kegiatan" 
                  @click="goToKegiatan('akademik')"
                  class="flex flex-col p-[10px_12px] rounded-[10px] hover:bg-[#E8F0FE] transition-colors group"
                >
                  <b class="text-[14px] text-[#0F1E38] group-hover:text-[#1B5FD9]">Akademik</b>
                  <small class="text-[#5A6B8C] text-[12px]">KBM, kurikulum, BLK &amp; prakerin</small>
                </a>
                <a 
                  href="#kegiatan" 
                  @click="goToKegiatan('nonakademik')"
                  class="flex flex-col p-[10px_12px] rounded-[10px] hover:bg-[#E8F0FE] transition-colors group"
                >
                  <b class="text-[14px] text-[#0F1E38] group-hover:text-[#1B5FD9]">Non Akademik</b>
                  <small class="text-[#5A6B8C] text-[12px]">Keagamaan &amp; kepemimpinan</small>
                </a>
                <a 
                  href="#kegiatan" 
                  @click="goToKegiatan('ekskul')"
                  class="flex flex-col p-[10px_12px] rounded-[10px] hover:bg-[#E8F0FE] transition-colors group"
                >
                  <b class="text-[14px] text-[#0F1E38] group-hover:text-[#1B5FD9]">Ekstrakurikuler</b>
                  <small class="text-[#5A6B8C] text-[12px]">13 pilihan ekskul</small>
                </a>
              </div>
            </div>

            <NuxtLink 
              to="/spmb" 
              :class="[
                'py-[10px] px-[13px] rounded-[10px] font-semibold text-[14.5px] transition-all duration-200',
                isScrolled ? 'text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]' : 'text-[#E8EFFC] hover:bg-white/15 hover:text-white'
              ]"
            >
              SPMB
            </NuxtLink>
          </nav>

          <!-- CTA Button (Desktop) -->
          <a 
            href="#kontak" 
            class="hidden lg:inline-flex items-center justify-center gap-[9px] font-bold text-[14px] py-[10px] px-[20px] rounded-[11px] ml-[10px] text-white bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] shadow-[0_12px_26px_rgba(27,95,217,.35)] transition-all duration-200 hover:shadow-[0_16px_34px_rgba(27,95,217,.45)] hover:-translate-y-[1px] active:scale-95"
          >
            Kontak Kami
          </a>

          <!-- Mobile Hamburger Button -->
          <button 
            type="button"
            class="lg:hidden inline-flex w-[44px] h-[44px] rounded-[12px] items-center justify-center transition-all duration-200 cursor-pointer"
            :class="isScrolled ? 'bg-white border border-[#E3EAF7] text-[#0F1E38]' : 'bg-white/10 border border-white/35 text-white'"
            aria-label="Buka menu"
            @click="openDrawer"
          >
            <svg class="w-[22px] h-[22px]"><use href="#i-menu"/></svg>
          </button>
        </div>
      </header>
    </div>

    <!-- ======= MOBILE DRAWER & SCRIM ======= -->
    <div 
      :class="['fixed inset-0 bg-[#0A1937]/50 backdrop-blur-[2px] transition-opacity duration-250 z-[75]', drawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none']" 
      @click="closeDrawer"
    ></div>

    <aside 
      :class="['fixed top-0 right-0 bottom-0 w-[min(340px,88vw)] bg-white z-[80] flex flex-col rounded-l-[20px] shadow-[0_24px_60px_rgba(10,42,92,.25)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]', drawerOpen ? 'translate-x-0' : 'translate-x-full']" 
      aria-label="Menu navigasi mobile"
    >
      <div class="flex items-center gap-[10px] p-[18px] border-b border-[#E3EAF7]">
        <img src="/asset/logo.png" alt="Logo" class="w-[38px] h-[45px] object-contain">
        <div>
          <b class="text-[15px] text-[#0F1E38] block">SMK IT Attaqwa 9</b>
          <div class="text-[12px] text-[#5A6B8C]">Babelan — Kab. Bekasi</div>
        </div>
        <button 
          class="w-[38px] h-[38px] rounded-[11px] bg-[#F5F8FF] hover:bg-[#E3EAF7] grid place-items-center ml-auto transition-colors"
          @click="closeDrawer" 
          aria-label="Tutup menu"
        >
          <svg class="w-[18px] h-[18px] text-[#0F1E38]"><use href="#i-x"/></svg>
        </button>
      </div>

      <div class="overflow-y-auto p-[16px_18px_26px] flex-1 flex flex-col gap-[4px]">
        <a href="#home" class="flex items-center gap-[12px] p-[12px] rounded-[12px] font-semibold text-[15.5px] text-[#0F1E38] hover:bg-[#E8F0FE] transition-colors" @click="closeDrawer">
          <span class="w-[36px] h-[36px] rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] grid place-items-center shrink-0"><svg class="w-[19px] h-[19px]"><use href="#i-home"/></svg></span>
          Home
        </a>

        <!-- Mobile Accordion: Profile -->
        <div class="rounded-[12px]">
          <button 
            type="button" 
            class="w-full flex items-center gap-[12px] p-[12px] font-semibold text-[15.5px] text-[#0F1E38] rounded-[12px] hover:bg-[#E8F0FE] transition-colors"
            @click="mobileProfileOpen = !mobileProfileOpen"
          >
            <span class="w-[36px] h-[36px] rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] grid place-items-center shrink-0"><svg class="w-[19px] h-[19px]"><use href="#i-school"/></svg></span>
            Profile
            <svg :class="['w-[14px] h-[14px] ml-auto text-[#5A6B8C] transition-transform duration-200', mobileProfileOpen ? 'rotate-180' : '']"><use href="#i-chev-d"/></svg>
          </button>
          <div v-show="mobileProfileOpen" class="pl-[48px] pr-[12px] py-[6px] flex flex-col gap-[6px]">
            <a href="#profil" @click="goToTab('smp'); closeDrawer()" class="block p-[8px_10px] rounded-[8px] text-[14px] text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]">
              <b>SMP IT Bina Cendekia Assalam</b>
              <small class="block text-[#5A6B8C] text-[11.5px]">Unit SMP</small>
            </a>
            <a href="#profil" @click="goToTab('smk'); closeDrawer()" class="block p-[8px_10px] rounded-[8px] text-[14px] text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]">
              <b>SMK IT Attaqwa 9</b>
              <small class="block text-[#5A6B8C] text-[11.5px]">Akreditasi A</small>
            </a>
          </div>
        </div>

        <a href="#berita" class="flex items-center gap-[12px] p-[12px] rounded-[12px] font-semibold text-[15.5px] text-[#0F1E38] hover:bg-[#E8F0FE] transition-colors" @click="closeDrawer">
          <span class="w-[36px] h-[36px] rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] grid place-items-center shrink-0"><svg class="w-[19px] h-[19px]"><use href="#i-news"/></svg></span>
          Berita &amp; Artikel
        </a>

        <!-- Mobile Accordion: Kegiatan -->
        <div class="rounded-[12px]">
          <button 
            type="button" 
            class="w-full flex items-center gap-[12px] p-[12px] font-semibold text-[15.5px] text-[#0F1E38] rounded-[12px] hover:bg-[#E8F0FE] transition-colors"
            @click="mobileKegiatanOpen = !mobileKegiatanOpen"
          >
            <span class="w-[36px] h-[36px] rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] grid place-items-center shrink-0"><svg class="w-[19px] h-[19px]"><use href="#i-zap"/></svg></span>
            Kegiatan
            <svg :class="['w-[14px] h-[14px] ml-auto text-[#5A6B8C] transition-transform duration-200', mobileKegiatanOpen ? 'rotate-180' : '']"><use href="#i-chev-d"/></svg>
          </button>
          <div v-show="mobileKegiatanOpen" class="pl-[48px] pr-[12px] py-[6px] flex flex-col gap-[6px]">
            <a href="#kegiatan" @click="goToKegiatan('akademik'); closeDrawer()" class="block p-[8px_10px] rounded-[8px] text-[14px] text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]">
              <b>Akademik</b>
              <small class="block text-[#5A6B8C] text-[11.5px]">KBM &amp; kurikulum</small>
            </a>
            <a href="#kegiatan" @click="goToKegiatan('nonakademik'); closeDrawer()" class="block p-[8px_10px] rounded-[8px] text-[14px] text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]">
              <b>Non Akademik</b>
              <small class="block text-[#5A6B8C] text-[11.5px]">Keagamaan &amp; kepemimpinan</small>
            </a>
            <a href="#kegiatan" @click="goToKegiatan('ekskul'); closeDrawer()" class="block p-[8px_10px] rounded-[8px] text-[14px] text-[#2A3A58] hover:bg-[#E8F0FE] hover:text-[#1B5FD9]">
              <b>Ekstrakurikuler</b>
              <small class="block text-[#5A6B8C] text-[11.5px]">13 pilihan ekskul</small>
            </a>
          </div>
        </div>

        <NuxtLink to="/spmb" class="flex items-center gap-[12px] p-[12px] rounded-[12px] font-semibold text-[15.5px] text-[#0F1E38] hover:bg-[#E8F0FE] transition-colors" @click="closeDrawer">
          <span class="w-[36px] h-[36px] rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] grid place-items-center shrink-0"><svg class="w-[19px] h-[19px]"><use href="#i-cap"/></svg></span>
          SPMB 2026/2027
        </NuxtLink>

        <a href="#kontak" class="flex items-center gap-[12px] p-[12px] rounded-[12px] font-semibold text-[15.5px] text-[#0F1E38] hover:bg-[#E8F0FE] transition-colors" @click="closeDrawer">
          <span class="w-[36px] h-[36px] rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] grid place-items-center shrink-0"><svg class="w-[19px] h-[19px]"><use href="#i-phone"/></svg></span>
          Kontak Kami
        </a>
      </div>

      <div class="p-[18px] border-t border-[#E3EAF7]">
        <a 
          href="#kontak" 
          class="w-full flex items-center justify-center gap-[9px] font-bold text-[15px] p-[13px] rounded-[14px] text-white bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] shadow-[0_12px_26px_rgba(27,95,217,.35)]"
          @click="closeDrawer"
        >
          Hubungi Kami
        </a>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const drawerOpen = ref(false)
const activeDropdown = ref<'profile' | 'kegiatan' | null>(null)
const mobileProfileOpen = ref(false)
const mobileKegiatanOpen = ref(false)

const profileDropdownRef = ref<HTMLElement | null>(null)
const kegiatanDropdownRef = ref<HTMLElement | null>(null)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 24
}

const toggleDropdown = (name: 'profile' | 'kegiatan') => {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

const openDrawer = () => {
  drawerOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeDrawer = () => {
  drawerOpen.value = false
  document.body.style.overflow = ''
}

const emit = defineEmits<{
  (e: 'select-tab', tab: 'smk' | 'smp'): void
  (e: 'select-kegiatan', tab: 'akademik' | 'nonakademik' | 'ekskul'): void
}>()

const goToTab = (tab: 'smk' | 'smp') => {
  activeDropdown.value = null
  emit('select-tab', tab)
  const el = document.getElementById('profil')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const goToKegiatan = (tab: 'akademik' | 'nonakademik' | 'ekskul') => {
  activeDropdown.value = null
  emit('select-kegiatan', tab)
  const el = document.getElementById('kegiatan')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node
  if (
    profileDropdownRef.value && !profileDropdownRef.value.contains(target) &&
    kegiatanDropdownRef.value && !kegiatanDropdownRef.value.contains(target)
  ) {
    activeDropdown.value = null
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    activeDropdown.value = null
    closeDrawer()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>
