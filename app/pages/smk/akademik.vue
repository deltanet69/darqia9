<script setup lang="ts">
import { ref } from 'vue'
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smk' })

// Filter State untuk Ekstrakurikuler
const activeEkskulFilter = ref('semua')

// Data 13 Ekstrakurikuler Terverifikasi
const ekskulList = [
  {
    id: 'osis',
    category: 'kepemimpinan',
    categoryLabel: 'Kepemimpinan',
    name: 'OSIS (Organisasi Siswa)',
    desc: 'Wadah organisasi siswa intra sekolah untuk mengasah kemampuan manajerial, kepemimpinan publik, dan koordinasi program sekolah.',
    schedule: 'Rapat Mingguan & Event',
    icon: 'compass'
  },
  {
    id: 'pramuka',
    category: 'kepemimpinan',
    categoryLabel: 'Kepemimpinan',
    name: 'Gerakan Pramuka',
    desc: 'Pembentukan karakter mandiri, kedisiplinan regu, ketahanan mental, serta keterampilan survival dan cinta alam.',
    schedule: 'Jumat Sore',
    icon: 'flag'
  },
  {
    id: 'paskibra',
    category: 'kepemimpinan',
    categoryLabel: 'Kepemimpinan',
    name: 'Paskibra',
    desc: 'Pasukan Pengibar Bendera — melatih postur tegap, baris-berbaris presisi militer, konsentrasi, dan jiwa patriotisme tinggi.',
    schedule: 'Sabtu Pagi',
    icon: 'shield'
  },
  {
    id: 'pmr',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan Medis',
    name: 'Palang Merah Remaja (PMR)',
    desc: 'Pelatihan dasar pertolongan pertama pada kecelakaan (P3K), kesiapsiagaan darurat medis, dan aksi sosial kemanusiaan.',
    schedule: 'Rabu Sore',
    icon: 'cross'
  },
  {
    id: 'muhadhoroh',
    category: 'keagamaan',
    categoryLabel: 'Keagamaan & Retorika',
    name: 'Muhadhoroh & Public Speaking',
    desc: 'Latihan retorika pidato dakwah 3 bahasa (Indonesia, Arab, Inggris), kultum santri, dan pembentukan kepercayaan diri di mimbar.',
    schedule: 'Kamis Malam',
    icon: 'mic'
  },
  {
    id: 'marawis',
    category: 'seni',
    categoryLabel: 'Seni Musik Islami',
    name: 'Marawis & Rebana',
    desc: 'Seni perkusi ritmis Islami memadukan kekompakan tabuhan hajir, marawis, dan lantunan bait pujian shalawat.',
    schedule: 'Sabtu Siang',
    icon: 'music'
  },
  {
    id: 'hadroh',
    category: 'seni',
    categoryLabel: 'Seni Musik Islami',
    name: 'Hadroh Al-Banjari',
    desc: 'Seni musik hadroh tradisi pesantren dengan harmoni vokal syahdu dan tabuhan terbang banjari yang dinamis.',
    schedule: 'Ahad Pagi',
    icon: 'music'
  },
  {
    id: 'kaligrafi',
    category: 'seni',
    categoryLabel: 'Seni Rupa Islami',
    name: 'Kaligrafi & Nasyid',
    desc: 'Eksplorasi estetika khat kaligrafi Al-Qur\'an (Tsuluts, Naskhi, Diwani) dan pembinaan vokal harmoni nasyid islami.',
    schedule: 'Senin Sore',
    icon: 'brush'
  },
  {
    id: 'silat',
    category: 'olahraga',
    categoryLabel: 'Olahraga & Bela Diri',
    name: 'Pencak Silat',
    desc: 'Bela diri warisan budaya bangsa — menggembleng fisik prima, ketangkasan reflek, mental ksatria, dan sportivitas.',
    schedule: 'Selasa & Sabtu Sore',
    icon: 'sword'
  },
  {
    id: 'padus',
    category: 'seni',
    categoryLabel: 'Seni Vokal',
    name: 'Paduan Suara',
    desc: 'Pelatihan olah vokal harmoni, pembacaan partitur lagu nasional, serta penampilan di seremoni resmi dan kejuaraan.',
    schedule: 'Kamis Sore',
    icon: 'mic'
  },
  {
    id: 'office',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan Terapan',
    name: 'Unggul Office & Digital',
    desc: 'Penguasaan aplikasi perkantoran tingkat lanjut (Word processor, spreadsheet analitik, otomasi presentasi) berstandar sertifikasi.',
    schedule: 'Rabu Sore',
    icon: 'laptop'
  },
  {
    id: 'bahasa',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan Bahasa',
    name: 'Unggul Bahasa (English Club)',
    desc: 'Klub percakapan bahasa Inggris interaktif, persiapan tes bahasa, dan public speaking global untuk bekal bersaing di era digital.',
    schedule: 'Selasa Sore',
    icon: 'chat'
  },
  {
    id: 'bengkel',
    category: 'keterampilan',
    categoryLabel: 'Teaching Factory',
    name: 'Rumah Bengkel Produksi',
    desc: 'Pusat teaching factory kejuruan otomotif dan desain grafis — siswa mengerjakan proyek servis motor dan pesanan riil industri.',
    schedule: 'Sabtu Fleksibel',
    icon: 'wrench'
  }
]

// Smooth Scroll Anchor Helper
function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO (Dark Navy Gradient) -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[170px] sm:pt-[180px] md:pt-[190px] lg:pt-[205px] pb-[65px] lg:pb-[80px] bg-[radial-gradient(900px_480px_at_85%_-10%,rgba(43,124,216,0.55),transparent_60%),linear-gradient(135deg,#0C2C61_0%,#0A2A5C_55%,#061A3E_100%)]">
      <!-- Ambient Dot Grid -->
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:26px_26px] pointer-events-none"></div>

      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-2 text-[13px] text-[#A9BDDD] font-medium mb-3.5">
          <NuxtLink to="/smk" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <span class="text-[#7DB9F5]">/</span>
          <span class="text-[#FCD34D] font-bold">Akademik &amp; Ekstrakurikuler</span>
        </div>

        <!-- Title & Subtitle -->
        <div class="max-w-[820px]">
          <span class="inline-flex items-center gap-2 bg-[#F59E0B]/15 border border-[#F59E0B]/50 text-[#FCD34D] text-[12.5px] font-bold py-1.5 px-3.5 rounded-full mb-3.5">
            <i class="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></i>
            Kurikulum Terpadu &amp; Pengembangan Bakat
          </span>
          <h1 class="text-[clamp(32px,4.8vw,52px)] font-black tracking-[-0.02em] leading-[1.12] mb-3 text-white">
            Akademik &amp; <span class="bg-gradient-to-r from-[#7DB9F5] via-[#A8C8FA] to-[#FCD34D] bg-clip-text text-transparent">Ekstrakurikuler</span>
          </h1>
          <p class="text-[#C9D8F2] text-[16px] md:text-[18px] leading-relaxed mb-8">
            Pendidikan vokasi Kurikulum Merdeka berpendekatan *Deep Learning* yang terintegrasi dengan 13 kegiatan ekstrakurikuler pembentuk kepemimpinan, kepribadian agamis, dan keahlian kerja nyata.
          </p>

          <!-- Quick Jump Navigation Pills -->
          <div class="flex flex-wrap items-center gap-2.5">
            <button 
              @click="scrollToSection('kurikulum')"
              class="text-[13px] font-bold py-2 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-150 cursor-pointer"
            >
              ↓ Kurikulum
            </button>
            <button 
              @click="scrollToSection('jurusan')"
              class="text-[13px] font-bold py-2 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-150 cursor-pointer"
            >
              ↓ 6 Konsentrasi Keahlian
            </button>
            <button 
              @click="scrollToSection('unggulan')"
              class="text-[13px] font-bold py-2 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-150 cursor-pointer"
            >
              ↓ 9 Program Unggulan
            </button>
            <button 
              @click="scrollToSection('ekskul')"
              class="text-[13px] font-bold py-2 px-4 rounded-full bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/40 text-[#FCD34D] transition-all duration-150 cursor-pointer"
            >
              ↓ 13 Ekstrakurikuler
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. KURIKULUM MERDEKA + DEEP LEARNING (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section id="kurikulum" class="py-[80px] bg-[#F5F8FF] relative overflow-hidden scroll-mt-24">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="max-w-[760px] mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Kurikulum Pembelajaran
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Kurikulum Merdeka + <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Deep Learning</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16px] md:text-[17px] mt-3 leading-relaxed">
            Kami mengimplementasikan Kurikulum Merdeka melalui pendekatan *Deep Learning* — mendorong santri menguasai konsep secara mendalam, berpikir analitis, dan mengaitkan materi belajar dengan kebutuhan dunia industri nyata, bukan sekadar menghafal.
          </p>
        </div>

        <!-- 3 Pilar Kurikulum Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="rv group bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_20px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-14 h-14 rounded-[16px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-5 transition-all duration-300 shadow-sm">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3z"/></svg>
              </div>
              <h3 class="text-[19px] font-extrabold text-[#061A3E] leading-snug mb-2.5">Pembelajaran Berbasis Proyek</h3>
              <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">
                Praktik bengkel, laboratorium, diskusi kritis, dan *Project-Based Learning* menjadi inti kegiatan belajar — memecahkan masalah riil layaknya di tempat kerja.
              </p>
            </div>
            <div class="pt-4 mt-5 border-t border-[#F1F5F9] text-[12px] font-bold text-[#1B5FD9]">
              <span>Problem Solving &amp; Analitik</span>
            </div>
          </div>

          <div class="rv group bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_20px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-14 h-14 rounded-[16px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-5 transition-all duration-300 shadow-sm">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
              </div>
              <h3 class="text-[19px] font-extrabold text-[#061A3E] leading-snug mb-2.5">Tahfidz &amp; Ibadah Harian</h3>
              <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">
                Bimbingan tahsin/tahfidz metode Yanbu'a terstruktur, sima'an Al-Qur'an terprogram, sholat berjamaah 5 waktu, dan pembiasaan adab islami sehari-hari.
              </p>
            </div>
            <div class="pt-4 mt-5 border-t border-[#F1F5F9] text-[12px] font-bold text-[#1B5FD9]">
              <span>Karakter Qur'ani Muttaqin</span>
            </div>
          </div>

          <div class="rv group bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_20px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-14 h-14 rounded-[16px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-5 transition-all duration-300 shadow-sm">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>
              </div>
              <h3 class="text-[19px] font-extrabold text-[#061A3E] leading-snug mb-2.5">Ekosistem Belajar Digital</h3>
              <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">
                Seluruh aktivitas pembelajaran ditunjang infrastruktur komputer modern, materi interaktif terintegrasi, dan platform ujian CBT online mandiri.
              </p>
            </div>
            <div class="pt-4 mt-5 border-t border-[#F1F5F9] text-[12px] font-bold text-[#1B5FD9]">
              <span>Informatika &amp; Ujian CBT</span>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. ENAM KONSENTRASI KEAHLIAN (White Background + Interactive Cards) -->
    <!-- ================================================================= -->
    <section id="jurusan" class="py-[80px] bg-white border-y border-[#E3EAF7] relative overflow-hidden scroll-mt-24">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="text-center max-w-[720px] mx-auto mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
            Program Kejuruan
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            6 Konsentrasi Keahlian, <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">3 Bidang</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16px] md:text-[17px] mt-2.5 leading-relaxed">
            Pilihan jurusan vokasi terakreditasi A dengan prospek kerja tinggi, fasilitas bengkel BLK Komunitas, dan sertifikasi keahlian terstandar.
          </p>
        </div>

        <!-- 6 Jurusan Grid Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Jurusan 1: AKL -->
          <div class="rv group relative bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.04)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">AKL</span>
            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-3 rounded-full">
                  Bisnis &amp; Manajemen
                </span>
                <span class="text-[12px] font-bold text-[#8FA6CC]">3 Tahun</span>
              </div>
              <h3 class="text-[20px] font-black text-[#061A3E] leading-snug mb-2 group-hover:text-[#1B5FD9] transition-colors">
                Akuntansi &amp; Keuangan Lembaga (AKL)
              </h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                Menguasai siklus akuntansi komprehensif, administrasi perpajakan, aplikasi akuntansi digital (MYOB/Zahir), dan tata kelola keuangan perbankan syariah.
              </p>
              <div class="flex flex-wrap gap-1.5 mb-5">
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Akuntansi Pajak</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Perbankan Syariah</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Software Akuntansi</span>
              </div>
            </div>
            <div class="pt-4 border-t border-[#EEF3FA] text-[13px] font-bold text-[#1B5FD9] flex items-center justify-between">
              <span>Prospek: Staf Keuangan / Bank</span>
              <span>→</span>
            </div>
          </div>

          <!-- Jurusan 2: OTKP -->
          <div class="rv group relative bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.04)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">OTKP</span>
            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-3 rounded-full">
                  Bisnis &amp; Manajemen
                </span>
                <span class="text-[12px] font-bold text-[#8FA6CC]">3 Tahun</span>
              </div>
              <h3 class="text-[20px] font-black text-[#061A3E] leading-snug mb-2 group-hover:text-[#1B5FD9] transition-colors">
                Otomatisasi &amp; Tata Kelola Perkantoran (OTKP)
              </h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                Kesekretarisan modern, manajemen korespondensi bisnis digital, kearsipan elektronik, keprotokolan, dan otomatisasi administrasi perkantoran unggul.
              </p>
              <div class="flex flex-wrap gap-1.5 mb-5">
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Administrasi Digital</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Korespondensi</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Public Relations</span>
              </div>
            </div>
            <div class="pt-4 border-t border-[#EEF3FA] text-[13px] font-bold text-[#1B5FD9] flex items-center justify-between">
              <span>Prospek: Sekretaris / HRD Admin</span>
              <span>→</span>
            </div>
          </div>

          <!-- Jurusan 3: TBSM -->
          <div class="rv group relative bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.04)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">TBSM</span>
            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-3 rounded-full">
                  Teknik Otomotif
                </span>
                <span class="text-[12px] font-bold text-[#8FA6CC]">3 Tahun</span>
              </div>
              <h3 class="text-[20px] font-black text-[#061A3E] leading-snug mb-2 group-hover:text-[#1B5FD9] transition-colors">
                Teknik &amp; Bisnis Sepeda Motor (TBSM)
              </h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                Keahlian pemeliharaan mesin motor, injeksi EFI modern, kelistrikan, dan manajemen wirausaha bengkel berbasis fasilitas Balai Latihan Kerja (BLK).
              </p>
              <div class="flex flex-wrap gap-1.5 mb-5">
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Injeksi EFI &amp; ECU</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Fasilitas BLK</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Bisnis Bengkel</span>
              </div>
            </div>
            <div class="pt-4 border-t border-[#EEF3FA] text-[13px] font-bold text-[#1B5FD9] flex items-center justify-between">
              <span>Prospek: Teknisi Ahass / Wirausaha</span>
              <span>→</span>
            </div>
          </div>

          <!-- Jurusan 4: TKR -->
          <div class="rv group relative bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.04)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">TKR</span>
            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-3 rounded-full">
                  Teknik Otomotif
                </span>
                <span class="text-[12px] font-bold text-[#8FA6CC]">3 Tahun</span>
              </div>
              <h3 class="text-[20px] font-black text-[#061A3E] leading-snug mb-2 group-hover:text-[#1B5FD9] transition-colors">
                Teknik Kendaraan Ringan (TKR)
              </h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                Kompetensi perawatan mesin mobil, transmisi otomatis/manual, sistem pengereman ABS, kelistrikan bodi, dan tune up berbasis scanner diagnostik.
              </p>
              <div class="flex flex-wrap gap-1.5 mb-5">
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Engine Diagnostic</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Transmisi &amp; Chasis</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">AC &amp; Kelistrikan</span>
              </div>
            </div>
            <div class="pt-4 border-t border-[#EEF3FA] text-[13px] font-bold text-[#1B5FD9] flex items-center justify-between">
              <span>Prospek: Mekanik Bengkel Resmi / QC</span>
              <span>→</span>
            </div>
          </div>

          <!-- Jurusan 5: TKJ -->
          <div class="rv group relative bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.04)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">TKJ</span>
            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-3 rounded-full">
                  Teknologi Informasi
                </span>
                <span class="text-[12px] font-bold text-[#8FA6CC]">3 Tahun</span>
              </div>
              <h3 class="text-[20px] font-black text-[#061A3E] leading-snug mb-2 group-hover:text-[#1B5FD9] transition-colors">
                Teknik Komputer &amp; Jaringan (TKJ)
              </h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                Perakitan komputer, instalasi jaringan fiber optic, konfigurasi routing MikroTik/Cisco, administrasi server Linux/Windows, dan keamanan data.
              </p>
              <div class="flex flex-wrap gap-1.5 mb-5">
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">MikroTik &amp; Cisco</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Server Linux</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Fiber Optic</span>
              </div>
            </div>
            <div class="pt-4 border-t border-[#EEF3FA] text-[13px] font-bold text-[#1B5FD9] flex items-center justify-between">
              <span>Prospek: Network Engineer / IT Support</span>
              <span>→</span>
            </div>
          </div>

          <!-- Jurusan 6: DKV -->
          <div class="rv group relative bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.04)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">DKV</span>
            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-3 rounded-full">
                  Teknologi Informasi
                </span>
                <span class="text-[12px] font-bold text-[#8FA6CC]">3 Tahun</span>
              </div>
              <h3 class="text-[20px] font-black text-[#061A3E] leading-snug mb-2 group-hover:text-[#1B5FD9] transition-colors">
                Desain Komunikasi Visual (DKV)
              </h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                Desain grafis digital, ilustrasi vektor, UI/UX aplikasi modern, motion graphic, fotografi studio, serta produksi video kreatif komersial.
              </p>
              <div class="flex flex-wrap gap-1.5 mb-5">
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">UI/UX Design</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Motion Graphics</span>
                <span class="text-[11.5px] font-semibold text-[#475569] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-md">Video Editing</span>
              </div>
            </div>
            <div class="pt-4 border-t border-[#EEF3FA] text-[13px] font-bold text-[#1B5FD9] flex items-center justify-between">
              <span>Prospek: Graphic / UI Designer / Creator</span>
              <span>→</span>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. SEMBILAN PROGRAM UNGGULAN (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section id="unggulan" class="py-[80px] bg-[#F5F8FF] relative overflow-hidden scroll-mt-24">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="max-w-[720px] mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Nilai Lebih Sekolah
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            9 Program Unggulan <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">SMK IT Attaqwa 9</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16px] md:text-[17px] mt-2.5 leading-relaxed">
            Kombinasi kurikulum vokasi industri, sarana Balai Latihan Kerja mandiri, dan pembinaan karakter Qur'ani berkesinambungan.
          </p>
        </div>

        <!-- 9 Program Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
            </div>
            <h3 class="text-[17.5px] font-extrabold text-[#061A3E] mb-1.5">1. BLK Komunitas Kemnaker RI</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Gedung Balai Latihan Kerja Komunitas mandiri di lingkungan sekolah sebagai pusat praktik uji kompetensi industri.</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3z"/></svg>
            </div>
            <h3 class="text-[17.5px] font-extrabold text-[#061A3E] mb-1.5">2. Kurikulum Merdeka + Deep Learning</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Pendekatan pembelajaran aktif, pemecahan masalah kontekstual, dan pemahaman konsep secara mendalam.</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
            </div>
            <h3 class="text-[17.5px] font-extrabold text-[#061A3E] mb-1.5">3. Tahfidz Al-Qur'an Yanbu'a</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Bimbingan tahsin dan tahfidz Al-Qur'an terprogram dengan metode Yanbu'a bersama asatidz bersanad.</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 class="text-[17.5px] font-extrabold text-[#061A3E] mb-1.5">4. Sima'an Qur'an &amp; Berjamaah</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Budaya sholat berjamaah harian dan sima'an Qur'an rutin membentuk karakter akhlakul karimah.</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/><circle cx="16.8" cy="9" r="2.6"/><path d="M16.2 14.3c2.5.4 4.3 2.1 5 5.2"/></svg>
            </div>
            <h3 class="text-[17.5px] font-extrabold text-[#061A3E] mb-1.5">5. Kelas Industri DUDIKA</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Kerja sama kemitraan kurikulum link and match langsung dengan dunia usaha dan industri manufaktur/IT.</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20.6 6.6a5 5 0 01-6.9 6.9L7 20.2a2.2 2.2 0 01-3.1-3.1l6.7-6.7A5 5 0 0117.5 3.4l-2.8 2.8 2.6 2.6 3.3-2.2z"/></svg>
            </div>
            <h3 class="text-[17.5px] font-extrabold text-[#061A3E] mb-1.5">6. Sistem Ganda &amp; Prakerin</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Pendidikan sistem ganda melalui Praktik Kerja Industri (Prakerin) terarah dan penyaluran kerja terpadu.</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3 class="text-[17.5px] font-extrabold text-[#061A3E] mb-1.5">7. Skill Equipment &amp; Sertifikasi</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Uji kompetensi kejuruan bersertifikat standar BNSP dan industri untuk validasi keahlian lulusan.</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>
            </div>
            <h3 class="text-[17.5px] font-extrabold text-[#061A3E] mb-1.5">8. Pembelajaran Digital &amp; CBT</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Ujian berbasis Computer Based Test (CBT) mandiri, akses materi digital, dan lab komputer terkoneksi LAN/WAN.</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] hover:-translate-y-1 transition-all duration-200">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 3a6 6 0 00-3.4 10.9c.8.6 1.4 1.3 1.4 2.6h4c0-1.3.6-2 1.4-2.6A6 6 0 0012 3z"/></svg>
            </div>
            <h3 class="text-[17.5px] font-extrabold text-[#061A3E] mb-1.5">9. Technopreneur Kewirausahaan</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Pelatihan wirausaha terapan dan teaching factory agar santri mampu merintis usaha bengkel, kantor, atau studio desain mandiri.</p>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. TIGA BELAS EKSTRAKURIKULER (Merged Section - Interactive Filter) -->
    <!-- ================================================================= -->
    <section id="ekskul" class="py-[80px] bg-white border-y border-[#E3EAF7] relative overflow-hidden scroll-mt-24">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Pengembangan Diri &amp; Karakter
            </span>
            <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
              13 Pilihan <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Ekstrakurikuler</span>
            </h2>
            <p class="text-[#5A6B8C] text-[15.5px] mt-2">
              Wadah mengasah bakat seni, ketangkasan fisik, kematangan spiritual, dan kepemimpinan di luar jam pelajaran.
            </p>
          </div>

          <!-- Total Count Badge -->
          <div class="hidden sm:inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E2ECF8] py-2 px-4 rounded-xl text-[13.5px] font-bold text-[#0A2A5C] shrink-0">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1B5FD9]"></span>
            <span>13 Ekstrakurikuler Aktif</span>
          </div>
        </div>

        <!-- Category Filter Tabs -->
        <div class="flex flex-wrap gap-2.5 mb-10">
          <button 
            v-for="cat in [
              { id: 'semua', label: 'Semua (13)' },
              { id: 'kepemimpinan', label: 'Kepemimpinan' },
              { id: 'keagamaan', label: 'Keagamaan' },
              { id: 'seni', label: 'Seni Islami' },
              { id: 'olahraga', label: 'Olahraga' },
              { id: 'keterampilan', label: 'Keterampilan' }
            ]"
            :key="cat.id"
            @click="activeEkskulFilter = cat.id"
            class="py-2.5 px-5 rounded-full font-bold text-[14px] transition-all duration-150 cursor-pointer border"
            :class="activeEkskulFilter === cat.id 
              ? 'bg-[#0A2A5C] text-white border-[#0A2A5C] shadow-md shadow-[#0A2A5C]/20' 
              : 'bg-[#F8FAFC] text-[#5A6B8C] border-[#E2ECF8] hover:border-[#1B5FD9] hover:text-[#1B5FD9] hover:bg-white'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Ekskul Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div 
            v-for="item in ekskulList" 
            :key="item.id"
            v-show="activeEkskulFilter === 'semua' || activeEkskulFilter === item.category"
            class="rv group bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] hover:border-[#1B5FD9]/40 rounded-[22px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_20px_40px_rgba(10,42,92,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full">
                  {{ item.categoryLabel }}
                </span>
                <span class="text-[12px] font-bold text-[#8FA6CC] flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ item.schedule }}
                </span>
              </div>

              <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-4 transition-all duration-300 shadow-sm">
                <!-- Clean Inline SVGs -->
                <svg v-if="item.icon === 'compass'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                <svg v-else-if="item.icon === 'flag'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                <svg v-else-if="item.icon === 'shield'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <svg v-else-if="item.icon === 'cross'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <svg v-else-if="item.icon === 'mic'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                <svg v-else-if="item.icon === 'music'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                <svg v-else-if="item.icon === 'brush'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M18.375 2.625a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.375-9.375z"/></svg>
                <svg v-else-if="item.icon === 'sword'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>
                <svg v-else-if="item.icon === 'laptop'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
                <svg v-else-if="item.icon === 'chat'" class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                <svg v-else class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              </div>

              <h3 class="text-[18.5px] font-black text-[#061A3E] leading-snug mb-2 group-hover:text-[#1B5FD9] transition-colors">
                {{ item.name }}
              </h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                {{ item.desc }}
              </p>
            </div>

            <div class="pt-4 mt-5 border-t border-[#EEF3FA] flex items-center justify-between text-[12.5px] font-bold text-[#1B5FD9]">
              <span>Bergabung di Awal Semester</span>
              <span>→</span>
            </div>
          </div>

        </div>

        <!-- Info Card: Cara Bergabung & Jadwal Latihan -->
        <div class="mt-12 bg-[#F8FAFC] border border-[#E2ECF8] rounded-[24px] p-7 md:p-9 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
          
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
            </div>
            <div>
              <h4 class="text-[17px] font-extrabold text-[#061A3E] mb-1.5">Mekanisme Pendaftaran Ekskul</h4>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                Pendaftaran dibuka setiap awal semester ganjil melalui OSIS dan wali kelas. Santri dapat memilih maksimal 2 kegiatan ekstrakurikuler yang tidak bertubrukan jadwal latihannya.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h4 class="text-[17px] font-extrabold text-[#061A3E] mb-1.5">Jadwal Latihan &amp; Sarana</h4>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                Kegiatan diadakan setelah jam KBM selesai (ba'da Ashar) atau pada hari Sabtu/Ahad menggunakan fasilitas aula, lapangan olahraga, bengkel BLK, dan laboratorium komputer.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 6. SECTION CTA PENDAFTARAN MURID BARU (Grounded Hero Student Cutout) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-t border-[#E3EAF7]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="bg-[radial-gradient(700px_400px_at_85%_100%,rgba(43,124,216,0.45),transparent_65%),linear-gradient(135deg,#0C2C61_0%,#0A2A5C_55%,#061A3E_100%)] text-white rounded-[24px] p-6 sm:p-8 md:px-12 md:pt-12 pb-0 shadow-[0_24px_60px_rgba(10,42,92,0.2)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative overflow-hidden">
          
          <!-- Background Deco -->
          <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

          <!-- Teks Kiri -->
          <div class="lg:col-span-7 relative z-10 pb-8 md:pb-12">
            <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#FCD34D] uppercase mb-3">Penerimaan Murid Baru</span>
            <h2 class="text-[clamp(26px,4vw,40px)] font-black tracking-[-0.02em] leading-tight mb-4">
              Amankan kursimu.<br><span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">7 rombel</span>, 3 gelombang.
            </h2>
            <p class="text-[#C9D8F2] text-[15.5px] leading-relaxed mb-8 max-w-[500px]">
              SPMB 2027/2028 telah dibuka dengan biaya registrasi hanya <b class="text-white">Rp50.000</b>. Pilih jurusan vokasi impianmu dan raih beasiswa prestasi/tahfidz.
            </p>

            <!-- Tombol Aksi -->
            <div class="flex flex-wrap items-center gap-4 mb-8">
              <NuxtLink 
                to="/smk/spmb" 
                class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all duration-150"
              >
                Daftar SPMB 2027/2028
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </NuxtLink>

              <NuxtLink 
                to="/smk/kontak" 
                class="text-[#C9D8F2] hover:text-white font-bold text-[14.5px] underline underline-offset-4 transition-colors"
              >
                atau hubungi panitia
              </NuxtLink>
            </div>

            <!-- Proof Points -->
            <div class="flex flex-wrap items-center gap-5 text-[13px] font-bold text-[#A9BDDD]">
              <span class="inline-flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#4ADE80] stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                Konsultasi jurusan gratis
              </span>
              <span class="inline-flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#4ADE80] stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                Respon &lt; 1×24 jam
              </span>
            </div>
          </div>

          <!-- Visual Kanan: Foto Hero Siswa Cutout Grounded -->
          <div class="lg:col-span-5 relative z-10 flex justify-center lg:justify-end items-end self-end">
            <div class="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-none flex justify-center items-end">
              <div class="absolute bottom-0 inset-x-0 h-[280px] bg-[radial-gradient(ellipse_at_bottom,rgba(43,124,216,0.45),transparent_70%)] pointer-events-none"></div>

              <div class="absolute top-6 -left-2 sm:left-4 bg-white/95 backdrop-blur-md text-[#0A2A5C] font-extrabold text-[12px] py-1.5 px-3 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.3)] border border-[#E3EAF7] flex items-center gap-1.5 z-10 hover:scale-105 transition-transform">
                <span class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                Kuota 7 Rombel
              </div>

              <img 
                src="/asset/SMK/herosmk.png" 
                alt="Siswa SMK IT Attaqwa 9" 
                class="relative z-0 w-full h-auto max-h-[340px] sm:max-h-[390px] lg:max-h-[440px] object-contain object-bottom block drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)] select-none pointer-events-none"
                loading="lazy"
              />
            </div>
          </div>

        </div>

      </div>
    </section>

  </div>
</template>
