<template>
  <!-- ======= BIDANG & FASILITAS UNGGULAN ======= -->
  <section class="py-[64px] lg:py-[88px] bg-white" id="program">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <div class="mb-[32px] lg:mb-[44px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[7px] px-[14px] rounded-full mb-[16px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#1B5FD9]"></span>
          Bidang &amp; Fasilitas Unggulan
        </div>
        <h2 class="text-[clamp(26px,4.6vw,40px)] font-extrabold text-[#0F1E38] tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Belajar Langsung <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Praktik Industri</span>
        </h2>
        <p class="text-[#5A6B8C] text-[clamp(15px,2.4vw,17.5px)] max-w-[680px]">
          Didukung laboratorium dan bengkel produksi yang terhubung dengan dunia usaha &amp; industri (DUDIKA). Ketuk kartu untuk detail.
        </p>
      </div>

      <!-- 3 Jurusan Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] mb-[56px]">
        <div 
          @click="openModal('m-it')"
          class="bg-white border border-[#E3EAF7] rounded-[18px] p-[24px] shadow-sm hover:shadow-[0_24px_60px_rgba(10,42,92,.16)] hover:-translate-y-[4px] transition-all duration-250 cursor-pointer group"
        >
          <div class="w-[52px] h-[52px] rounded-[15px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white grid place-items-center mb-[16px] group-hover:scale-110 transition-transform">
            <svg class="ai w-[26px] h-[26px]"><use href="#i-cpu"/></svg>
          </div>
          <h4 class="text-[17px] font-bold text-[#0F1E38] mb-[8px] group-hover:text-[#1B5FD9] transition-colors">Teknik Informatika</h4>
          <p class="text-[#5A6B8C] text-[14px] leading-[1.6]">Lab komputer modern + BLK Teknik Informatika: jaringan, pemrograman, dan multimedia.</p>
        </div>

        <div 
          @click="openModal('m-oto')"
          class="bg-white border border-[#E3EAF7] rounded-[18px] p-[24px] shadow-sm hover:shadow-[0_24px_60px_rgba(10,42,92,.16)] hover:-translate-y-[4px] transition-all duration-250 cursor-pointer group"
        >
          <div class="w-[52px] h-[52px] rounded-[15px] bg-gradient-to-br from-[#D97706] to-[#FBBF24] text-white grid place-items-center mb-[16px] group-hover:scale-110 transition-transform">
            <svg class="ai w-[26px] h-[26px]"><use href="#i-car"/></svg>
          </div>
          <h4 class="text-[17px] font-bold text-[#0F1E38] mb-[8px] group-hover:text-[#D97706] transition-colors">Teknik Otomotif</h4>
          <p class="text-[#5A6B8C] text-[14px] leading-[1.6]">Lab otomotif + Rumah Bengkel Produksi: praktik langsung standar bengkel profesional.</p>
        </div>

        <div 
          @click="openModal('m-bis')"
          class="bg-white border border-[#E3EAF7] rounded-[18px] p-[24px] shadow-sm hover:shadow-[0_24px_60px_rgba(10,42,92,.16)] hover:-translate-y-[4px] transition-all duration-250 cursor-pointer group"
        >
          <div class="w-[52px] h-[52px] rounded-[15px] bg-gradient-to-br from-[#059669] to-[#34D399] text-white grid place-items-center mb-[16px] group-hover:scale-110 transition-transform">
            <svg class="ai w-[26px] h-[26px]"><use href="#i-chart"/></svg>
          </div>
          <h4 class="text-[17px] font-bold text-[#0F1E38] mb-[8px] group-hover:text-[#059669] transition-colors">Bisnis &amp; Akuntansi</h4>
          <p class="text-[#5A6B8C] text-[14px] leading-[1.6]">Lab akuntansi dan bisnis + koperasi pelajar: simulasi usaha nyata sejak sekolah.</p>
        </div>
      </div>

      <!-- Fasilitas Sub-Heading -->
      <div class="mb-[24px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[7px] px-[14px] rounded-full mb-[12px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#1B5FD9]"></span>
          Fasilitas
        </div>
        <h2 class="text-[clamp(22px,3.6vw,30px)] font-extrabold text-[#0F1E38]">Lengkap &amp; Nyaman</h2>
      </div>

      <!-- Fasilitas 12 Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        <div v-for="(fas, idx) in fasilitasList" :key="idx" class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[16px] p-[20px] hover:border-[#1B5FD9] hover:bg-white transition-all duration-200">
          <h4 class="text-[15px] font-bold text-[#0F1E38] flex items-center gap-[8px] mb-[4px]">
            <svg class="ai w-[18px] h-[18px] text-[#1B5FD9]"><use :href="'#' + fas.icon"/></svg>
            <span>{{ fas.name }}</span>
          </h4>
          <p class="text-[#5A6B8C] text-[13.5px] leading-[1.5]">{{ fas.desc }}</p>
        </div>
      </div>
    </div>

    <!-- ======= MODAL DETAIL PROGRAM ======= -->
    <div 
      :class="['fixed inset-0 z-[85] grid place-items-center p-[18px] transition-all duration-250', modalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none']" 
      role="dialog" 
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-[#08142D]/60 backdrop-blur-[4px]" @click="closeModal"></div>
      <div 
        :class="['relative bg-white rounded-[22px] max-w-[560px] w-full max-h-[86vh] overflow-y-auto p-[30px] transition-all duration-250 shadow-[0_24px_60px_rgba(10,42,92,.25)]', modalOpen ? 'translate-y-0 scale-100' : 'translate-y-[18px] scale-98']"
      >
        <button 
          type="button" 
          @click="closeModal" 
          class="absolute top-[16px] right-[16px] w-[38px] h-[38px] rounded-[11px] bg-[#F5F8FF] hover:bg-[#E3EAF7] grid place-items-center transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <svg class="w-[18px] h-[18px] text-[#0F1E38]"><use href="#i-x"/></svg>
        </button>

        <div v-if="activeModalData">
          <div :class="['w-[58px] h-[58px] rounded-[17px] grid place-items-center text-white mb-[16px] bg-gradient-to-br', activeModalData.gradient]">
            <svg class="ai w-[28px] h-[28px]"><use :href="'#' + activeModalData.icon"/></svg>
          </div>
          <h3 class="text-[20px] font-extrabold text-[#0F1E38] mb-[10px] tracking-[-0.3px]">{{ activeModalData.title }}</h3>
          <p class="text-[#5A6B8C] text-[14.5px] leading-[1.6] mb-[16px]">{{ activeModalData.desc }}</p>
          <ul class="space-y-[10px] mb-[24px]">
            <li v-for="(item, i) in activeModalData.list" :key="i" class="flex items-start gap-[10px] text-[14.5px] text-[#33415C]">
              <svg class="ai w-[18px] h-[18px] text-[#16A34A] shrink-0 mt-[2px]"><use href="#i-check"/></svg>
              <span>{{ item }}</span>
            </li>
          </ul>
          <NuxtLink 
            to="/spmb" 
            @click="closeModal"
            class="w-full inline-flex items-center justify-center font-bold text-[15px] py-[13px] rounded-[12px] text-white bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] shadow-[0_10px_22px_rgba(27,95,217,.35)]"
          >
            Daftar di Bidang Ini
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Modal State
const modalOpen = ref(false)
const activeModalKey = ref<string | null>(null)

const modalDatabase: Record<string, { title: string; desc: string; icon: string; gradient: string; list: string[] }> = {
  'm-it': {
    title: 'Bidang Teknik Informatika',
    desc: 'Bidang teknologi informasi dengan laboratorium komputer modern dan BLK (Balai Latihan Kerja) Komunitas yang link & match dengan dunia industri.',
    icon: 'i-cpu',
    gradient: 'from-[#1B5FD9] to-[#4C8DFF]',
    list: [
      'Jaringan komputer & administrasi server',
      'Pemrograman & pengembangan aplikasi web/mobile',
      'Multimedia & desain antarmuka (UI/UX)',
      'Teknisi komputer & IT support bersertifikasi BLK'
    ]
  },
  'm-oto': {
    title: 'Bidang Teknik Otomotif',
    desc: 'Bidang otomotif dengan laboratorium praktik dan Rumah Bengkel Produksi — siswa mengerjakan pekerjaan bengkel nyata berstandar profesional.',
    icon: 'i-car',
    gradient: 'from-[#D97706] to-[#FBBF24]',
    list: [
      'Perawatan & perbaikan mesin kendaraan bermotor',
      'Sistem kelistrikan & teknologi injeksi modern',
      'Praktik langsung di bengkel produksi sekolah',
      'Magang industri (prakerin) di DUDIKA terpercaya'
    ]
  },
  'm-bis': {
    title: 'Bidang Bisnis & Akuntansi',
    desc: 'Bidang bisnis dan akuntansi dengan lab praktik dan koperasi pelajar — siswa belajar mengelola usaha sungguhan sejak di bangku sekolah.',
    icon: 'i-chart',
    gradient: 'from-[#059669] to-[#34D399]',
    list: [
      'Akuntansi keuangan & aplikasi pembukuan digital',
      'Administrasi perkantoran & tata kelola modern',
      'Praktik kewirausahaan via koperasi pelajar',
      'Pemasaran digital & manajemen bisnis online'
    ]
  }
}

const activeModalData = computed(() => {
  return activeModalKey.value ? modalDatabase[activeModalKey.value] : null
})

const openModal = (key: string) => {
  activeModalKey.value = key
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  activeModalKey.value = null
}

// Fasilitas List
const fasilitasList = [
  { name: 'Ruang Belajar', desc: 'Ruang kelas nyaman & kondusif', icon: 'i-home' },
  { name: 'Lab. Komputer', desc: 'Praktik informatika modern', icon: 'i-laptop' },
  { name: 'Lab. Otomotif', desc: 'Standar bengkel profesional', icon: 'i-wrench' },
  { name: 'Lab. Akuntansi & Bisnis', desc: 'Simulasi dunia usaha', icon: 'i-bank' },
  { name: 'Workshop BLK Komunitas', desc: 'Link & match DUDIKA', icon: 'i-factory' },
  { name: 'Perpustakaan', desc: 'Koleksi bacaan & referensi', icon: 'i-book' },
  { name: 'Auditorium & Musholla', desc: 'Pusat kegiatan & ibadah', icon: 'i-mosque' },
  { name: 'Outdoor & Sport Center', desc: 'Belajar & olahraga luar ruang', icon: 'i-park' },
  { name: 'Kantin & Gazebo', desc: 'Area istirahat siswa', icon: 'i-cup' },
  { name: 'Ruang Kesenian', desc: 'Seni islami & kreativitas', icon: 'i-palette' },
  { name: 'Koperasi Pelajar', desc: 'Praktik kewirausahaan', icon: 'i-store' },
  { name: 'Area Parkir', desc: 'Luas, tertata & aman', icon: 'i-car' }
]
</script>
