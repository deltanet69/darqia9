<script setup lang="ts">
import { useGsapReveal } from "~/composables/useGsapReveal";
useGsapReveal();
definePageMeta({ layout: 'smk' })

// Integrasi Feed Instagram (Live dari Meta Graph API dengan Curated Fallback)
const { data: feedResponse, pending: feedPending } = await useFetch('/api/instagram/feed')
const instagramPosts = computed(() => feedResponse.value?.data || [])
const isLiveFeed = computed(() => Boolean(feedResponse.value?.isLive))
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    <!-- ================================================================= -->
    <!-- 1. HERO SECTION (Dark Navy Gradient) -->
    <!-- ================================================================= -->
    <section 
      class="relative overflow-hidden text-white pt-[190px] lg:pt-[230px] pb-0 bg-[radial-gradient(900px_480px_at_85%_-10%,rgba(43,124,216,0.55),transparent_60%),linear-gradient(135deg,#0C2C61_0%,#0A2A5C_55%,#061A3E_100%)]"
    >
      <!-- Ambient Dot Grid -->
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:26px_26px] pointer-events-none"></div>

      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          <!-- Kolom Kiri: Copywriting & CTAs -->
          <div class="lg:col-span-7 pb-[60px] sm:pb-[80px] lg:pb-[170px]">
            <!-- Badge SPMB -->
            <span class="inline-flex items-center gap-2 bg-[#F59E0B]/15 border border-[#F59E0B]/50 text-[#FCD34D] text-[13px] font-bold py-2 px-4 rounded-full mb-5">
              <i class="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></i>
              SPMB 2027/2028 Telah Dibuka
            </span>

            <!-- Main Heading -->
            <h1 class="text-[clamp(32px,5.2vw,54px)] font-black leading-[1.12] tracking-[-0.02em] mb-4 text-white">
              Unggul dalam <em class="not-italic bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">IMTAQ</em>, Terdepan dalam <em class="not-italic bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">IPTEK</em>
            </h1>

            <!-- Motto -->
            <p class="text-[#C9D8F2] text-[16px] md:text-[17.5px] max-w-[580px] mb-7 leading-relaxed">
              "Membentuk Generasi Vokasi Qur'ani yang Benar, Pintar, dan Terampil."
            </p>

            <!-- Hero Action Buttons -->
            <div class="flex flex-wrap items-center gap-3.5 mb-8 sm:mb-9">
              <NuxtLink 
                to="/smk/spmb" 
                class="inline-flex items-center gap-2 font-bold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all duration-150"
              >
                Daftar SPMB 2027/2028 
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </NuxtLink>
              
              <NuxtLink 
                to="/smk/tentang" 
                class="inline-flex items-center gap-2 font-bold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-white/10 border border-white/35 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-150"
              >
                Jelajahi Sekolah
              </NuxtLink>
            </div>

            <!-- Stats Counter 4 Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-[860px]">
              <div class="hstat bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-4 sm:p-4.5 backdrop-blur-sm">
                <b class="block text-[28px] sm:text-[30px] font-black text-white leading-tight">316<small class="text-[#FCD34D] text-[18px] font-bold">+</small></b>
                <span class="text-[12.5px] text-[#A9BDDD] font-semibold">Siswa Aktif</span>
              </div>
              <div class="hstat bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-4 sm:p-4.5 backdrop-blur-sm">
                <b class="block text-[28px] sm:text-[30px] font-black text-white leading-tight">6</b>
                <span class="text-[12.5px] text-[#A9BDDD] font-semibold">Konsentrasi Keahlian</span>
              </div>
              <div class="hstat bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-4 sm:p-4.5 backdrop-blur-sm">
                <b class="block text-[28px] sm:text-[30px] font-black text-white leading-tight">13</b>
                <span class="text-[12.5px] text-[#A9BDDD] font-semibold">Ekstrakurikuler</span>
              </div>
              <div class="hstat bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-4 sm:p-4.5 backdrop-blur-sm">
                <b class="block text-[28px] sm:text-[30px] font-black text-white leading-tight">A</b>
                <span class="text-[12.5px] text-[#A9BDDD] font-semibold">Akreditasi BAN-SM</span>
              </div>
            </div>
          </div>

          <!-- Kolom Kanan: Foto Siswa Frameless Grounded di Ujung Bawah Frame & Floating Badges -->
          <div class="lg:col-span-5 flex justify-center lg:justify-end items-end relative self-end">
            <div class="relative w-full sm:w-[500px] lg:w-[650px] xl:w-[720px] max-w-none flex justify-center items-end lg:-mr-16 xl:-mr-24">
              <!-- Chip 1: Akreditasi A -->
              <div class="absolute top-12 -left-4 sm:left-4 lg:left-0 bg-white/95 backdrop-blur-md text-[#0A2A5C] font-extrabold text-[12.5px] sm:text-[13px] py-2 px-3.5 rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.35)] border border-[#E3EAF7] flex items-center gap-2 z-10 hover:scale-105 transition-transform">
                <svg class="w-4 h-4 text-[#1B5FD9] stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5z"/><path d="M9 11.8l2.2 2.2 4-4.2"/></svg>
                Akreditasi A
              </div>

              <!-- Chip 2: 316+ Siswa -->
              <div class="absolute bottom-32 -right-2 sm:right-4 lg:right-6 bg-white/95 backdrop-blur-md text-[#0A2A5C] font-extrabold text-[12.5px] sm:text-[13px] py-2 px-3.5 rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.35)] border border-[#E3EAF7] flex items-center gap-2 z-10 hover:scale-105 transition-transform">
                <svg class="w-4 h-4 text-[#1B5FD9] stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/><circle cx="16.8" cy="9" r="2.6"/><path d="M16.2 14.3c2.5.4 4.3 2.1 5 5.2"/></svg>
                316+ Siswa Aktif
              </div>

              <!-- Foto Siswa Asli (Frameless Cutout, Grounded di Ujung Bawah Frame) -->
              <img 
                src="/asset/SMK/herosmk.png" 
                alt="Siswa SMK IT Attaqwa 9" 
                class="relative z-0 w-full h-auto max-h-[500px] sm:max-h-[600px] lg:max-h-[750px] object-contain object-bottom block drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                loading="eager"
              />
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. JURUSAN UNGGULAN (Konsentrasi Keahlian - Modern Interactive) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF] relative overflow-hidden">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="text-center max-w-[720px] mx-auto mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Konsentrasi Keahlian
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Bidang &amp; <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Jurusan Unggulan</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16px] md:text-[17px] mt-3 leading-relaxed">
            Kurikulum vokasi terpadu berbasis industri dengan sertifikasi keahlian, fasilitas BLK modern, dan penyaluran kerja terarah.
          </p>
        </div>

        <!-- Grid 6 Jurusan Modern Interactive -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Card 1: AKL -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group relative bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden block text-decoration-none"
          >
            <!-- Decorative Monogram Watermark -->
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">AKL</span>

            <div>
              <!-- Top Row: Badge & Category -->
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#1B5FD9] bg-[#EFF6FF] border border-[#DBEAFE] py-1 px-3 rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#1B5FD9]"></span>
                  Bisnis &amp; Manajemen
                </span>
                <span class="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                  Akreditasi A
                </span>
              </div>

              <!-- Icon Tile -->
              <div class="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#EEF5FF] to-[#DBEAFE] text-[#1B5FD9] group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(27,95,217,0.3)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M7 20v-7M12 20V6M17 20v-10"/></svg>
              </div>

              <!-- Headings -->
              <div class="flex items-baseline gap-2 mb-1">
                <h3 class="text-[22px] font-black text-[#061A3E] group-hover:text-[#1B5FD9] transition-colors">AKL</h3>
                <span class="text-[12px] font-semibold text-[#8FA6CC]">· Keuangan</span>
              </div>
              <p class="text-[13.5px] font-bold text-[#1B5FD9] mb-2.5">Akuntansi &amp; Keuangan Lembaga</p>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-5">
                Akuntansi perpajakan, audit pembukuan digital, dan sistem perbankan mini modern berbasis aplikasi industri.
              </p>

              <!-- Competency Chips -->
              <div class="flex flex-wrap gap-1.5 mb-6">
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Zahir &amp; MYOB</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Pajak Digital</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Bank Mini</span>
              </div>
            </div>

            <!-- Footer Action -->
            <div class="pt-4 border-t border-[#EEF3FA] flex items-center justify-between text-[13.5px] font-bold text-[#1B5FD9] group-hover:text-[#0A2A5C] transition-colors">
              <span>Pelajari Silabus &amp; Karir</span>
              <div class="w-8 h-8 rounded-full bg-[#EFF6FF] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </NuxtLink>

          <!-- Card 2: OTKP -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group relative bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden block text-decoration-none"
          >
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">OTKP</span>

            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#1B5FD9] bg-[#EFF6FF] border border-[#DBEAFE] py-1 px-3 rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#1B5FD9]"></span>
                  Bisnis &amp; Manajemen
                </span>
                <span class="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                  Akreditasi A
                </span>
              </div>

              <div class="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#EEF5FF] to-[#DBEAFE] text-[#1B5FD9] group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(27,95,217,0.3)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2.5"/><path d="M9 8V6.5A2.5 2.5 0 0111.5 4h1A2.5 2.5 0 0115 6.5V8M3 13.5h18"/></svg>
              </div>

              <div class="flex items-baseline gap-2 mb-1">
                <h3 class="text-[22px] font-black text-[#061A3E] group-hover:text-[#1B5FD9] transition-colors">OTKP</h3>
                <span class="text-[12px] font-semibold text-[#8FA6CC]">· Manajemen</span>
              </div>
              <p class="text-[13.5px] font-bold text-[#1B5FD9] mb-2.5">Otomatisasi &amp; Tata Kelola Perkantoran</p>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-5">
                Administrasi perkantoran modern, kesekretarisan digital, humas, kearsipan elektronik, dan etika komunikasi bisnis.
              </p>

              <div class="flex flex-wrap gap-1.5 mb-6">
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Digital Office</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Public Relations</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">E-Arsip</span>
              </div>
            </div>

            <div class="pt-4 border-t border-[#EEF3FA] flex items-center justify-between text-[13.5px] font-bold text-[#1B5FD9] group-hover:text-[#0A2A5C] transition-colors">
              <span>Pelajari Silabus &amp; Karir</span>
              <div class="w-8 h-8 rounded-full bg-[#EFF6FF] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </NuxtLink>

          <!-- Card 3: TBSM -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group relative bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden block text-decoration-none"
          >
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">TBSM</span>

            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#15803D] bg-[#F0FDF4] border border-[#DCFCE7] py-1 px-3 rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
                  Teknik Otomotif
                </span>
                <span class="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                  BLK Partner
                </span>
              </div>

              <div class="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#EEF5FF] to-[#DBEAFE] text-[#1B5FD9] group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(27,95,217,0.3)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20.6 6.6a5 5 0 01-6.9 6.9L7 20.2a2.2 2.2 0 01-3.1-3.1l6.7-6.7A5 5 0 0117.5 3.4l-2.8 2.8 2.6 2.6 3.3-2.2z"/></svg>
              </div>

              <div class="flex items-baseline gap-2 mb-1">
                <h3 class="text-[22px] font-black text-[#061A3E] group-hover:text-[#1B5FD9] transition-colors">TBSM</h3>
                <span class="text-[12px] font-semibold text-[#8FA6CC]">· Otomotif R2</span>
              </div>
              <p class="text-[13.5px] font-bold text-[#1B5FD9] mb-2.5">Teknik &amp; Bisnis Sepeda Motor</p>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-5">
                Teknologi injeksi EFI, sistem kelistrikan, chasis sepeda motor, dan manajemen wirausaha bengkel mandiri.
              </p>

              <div class="flex flex-wrap gap-1.5 mb-6">
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Injeksi EFI</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Uji Emisi Mesin</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Bisnis Bengkel</span>
              </div>
            </div>

            <div class="pt-4 border-t border-[#EEF3FA] flex items-center justify-between text-[13.5px] font-bold text-[#1B5FD9] group-hover:text-[#0A2A5C] transition-colors">
              <span>Pelajari Silabus &amp; Karir</span>
              <div class="w-8 h-8 rounded-full bg-[#EFF6FF] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </NuxtLink>

          <!-- Card 4: TKR -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group relative bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden block text-decoration-none"
          >
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">TKR</span>

            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#15803D] bg-[#F0FDF4] border border-[#DCFCE7] py-1 px-3 rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
                  Teknik Otomotif
                </span>
                <span class="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                  BLK Partner
                </span>
              </div>

              <div class="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#EEF5FF] to-[#DBEAFE] text-[#1B5FD9] group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(27,95,217,0.3)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4.5 15.5L6 10.7A2 2 0 017.9 9.3h8.2a2 2 0 011.9 1.4l1.5 4.8"/><path d="M3.5 15.5h17V19a1 1 0 01-1 1H4.5a1 1 0 01-1-1v-3.5z"/><circle cx="8" cy="17.6" r="1" fill="currentColor"/><circle cx="16" cy="17.6" r="1" fill="currentColor"/></svg>
              </div>

              <div class="flex items-baseline gap-2 mb-1">
                <h3 class="text-[22px] font-black text-[#061A3E] group-hover:text-[#1B5FD9] transition-colors">TKR</h3>
                <span class="text-[12px] font-semibold text-[#8FA6CC]">· Otomotif R4</span>
              </div>
              <p class="text-[13.5px] font-bold text-[#1B5FD9] mb-2.5">Teknik Kendaraan Ringan</p>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-5">
                Perawatan engine overhaul, kelistrikan bodi, sistem transmisi otomatis/manual, dan teknologi AC mobil modern.
              </p>

              <div class="flex flex-wrap gap-1.5 mb-6">
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Engine Overhaul</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Kelistrikan Bodi</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">AC &amp; Chasis</span>
              </div>
            </div>

            <div class="pt-4 border-t border-[#EEF3FA] flex items-center justify-between text-[13.5px] font-bold text-[#1B5FD9] group-hover:text-[#0A2A5C] transition-colors">
              <span>Pelajari Silabus &amp; Karir</span>
              <div class="w-8 h-8 rounded-full bg-[#EFF6FF] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </NuxtLink>

          <!-- Card 5: TKJ -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group relative bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden block text-decoration-none"
          >
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">TKJ</span>

            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#7E22CE] bg-[#FAF5FF] border border-[#F3E8FF] py-1 px-3 rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#7E22CE]"></span>
                  Teknologi Informasi
                </span>
                <span class="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                  Lab Komputer
                </span>
              </div>

              <div class="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#EEF5FF] to-[#DBEAFE] text-[#1B5FD9] group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(27,95,217,0.3)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10.5 2v3M13.5 2v3M10.5 19v3M13.5 19v3M2 10.5h3M2 13.5h3M19 10.5h3M19 13.5h3"/></svg>
              </div>

              <div class="flex items-baseline gap-2 mb-1">
                <h3 class="text-[22px] font-black text-[#061A3E] group-hover:text-[#1B5FD9] transition-colors">TKJ</h3>
                <span class="text-[12px] font-semibold text-[#8FA6CC]">· IT Network</span>
              </div>
              <p class="text-[13.5px] font-bold text-[#1B5FD9] mb-2.5">Teknik Komputer &amp; Jaringan</p>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-5">
                Infrastruktur jaringan, routing MikroTik &amp; Cisco, instalasi Fiber Optic, administrasi server Linux, dan cloud computing.
              </p>

              <div class="flex flex-wrap gap-1.5 mb-6">
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">MikroTik &amp; Cisco</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Fiber Optic</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Server Linux</span>
              </div>
            </div>

            <div class="pt-4 border-t border-[#EEF3FA] flex items-center justify-between text-[13.5px] font-bold text-[#1B5FD9] group-hover:text-[#0A2A5C] transition-colors">
              <span>Pelajari Silabus &amp; Karir</span>
              <div class="w-8 h-8 rounded-full bg-[#EFF6FF] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </NuxtLink>

          <!-- Card 6: DKV -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group relative bg-white border border-[#E2ECF8] rounded-[22px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden block text-decoration-none"
          >
            <span class="absolute -right-2 -bottom-2 text-[72px] font-black text-[#0A2A5C]/[0.03] group-hover:text-[#1B5FD9]/[0.06] select-none pointer-events-none transition-colors">DKV</span>

            <div>
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#7E22CE] bg-[#FAF5FF] border border-[#F3E8FF] py-1 px-3 rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#7E22CE]"></span>
                  Teknologi Informasi
                </span>
                <span class="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                  Studio Kreatif
                </span>
              </div>

              <div class="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#EEF5FF] to-[#DBEAFE] text-[#1B5FD9] group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(27,95,217,0.3)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center mb-5">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4 20l1.2-4.2L16.7 4.3a2 2 0 012.8 0l.2.2a2 2 0 010 2.8L8.2 18.8 4 20z"/><path d="M14.8 6.2l3 3"/></svg>
              </div>

              <div class="flex items-baseline gap-2 mb-1">
                <h3 class="text-[22px] font-black text-[#061A3E] group-hover:text-[#1B5FD9] transition-colors">DKV</h3>
                <span class="text-[12px] font-semibold text-[#8FA6CC]">· Creative Studio</span>
              </div>
              <p class="text-[13.5px] font-bold text-[#1B5FD9] mb-2.5">Desain Komunikasi Visual</p>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-5">
                Desain grafis periklanan, UI/UX aplikasi, fotografi studio, videografi sinematik, dan animasi motion graphics.
              </p>

              <div class="flex flex-wrap gap-1.5 mb-6">
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">UI/UX Design</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Motion Graphic</span>
                <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Video Editing</span>
              </div>
            </div>

            <div class="pt-4 border-t border-[#EEF3FA] flex items-center justify-between text-[13.5px] font-bold text-[#1B5FD9] group-hover:text-[#0A2A5C] transition-colors">
              <span>Pelajari Silabus &amp; Karir</span>
              <div class="w-8 h-8 rounded-full bg-[#EFF6FF] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </NuxtLink>

        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. KENAPA ATTAQWA 9 (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-3">Kenapa Attaqwa 9</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            SMK Rasa <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Pesantren</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16.5px] mt-3">
            Vokasi yang kuat, akhlak yang terjaga — dua hal yang tidak kami pisahkan.
          </p>
        </div>

        <!-- Why List Rows -->
        <div class="flex flex-col divide-y divide-[#E3EAF7]">
          
          <!-- Row 1 -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-6 px-3 rounded-[12px] hover:bg-gradient-to-r hover:from-[#E8F0FE] hover:to-transparent hover:pl-6 transition-all duration-250 text-decoration-none"
          >
            <span class="text-[32px] sm:text-[44px] font-black text-transparent [-webkit-text-stroke:1.5px_#C9DDFB] group-hover:[-webkit-text-stroke:1.5px_#1B5FD9] group-hover:text-[#1B5FD9] transition-colors shrink-0">01</span>
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center shrink-0 transition-all">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
            </div>
            <div class="flex-1">
              <h3 class="text-[18px] sm:text-[19px] font-extrabold text-[#061A3E] mb-1">Kurikulum Merdeka + Deep Learning</h3>
              <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Pembelajaran yang menekankan pemahaman mendalam — bukan hafalan. Ditambah program tahfidz Yanbu'a dan pembiasaan ibadah harian.</p>
            </div>
            <span class="text-[#1B5FD9] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all hidden sm:block shrink-0">
              <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>

          <!-- Row 2 -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-6 px-3 rounded-[12px] hover:bg-gradient-to-r hover:from-[#E8F0FE] hover:to-transparent hover:pl-6 transition-all duration-250 text-decoration-none"
          >
            <span class="text-[32px] sm:text-[44px] font-black text-transparent [-webkit-text-stroke:1.5px_#C9DDFB] group-hover:[-webkit-text-stroke:1.5px_#1B5FD9] group-hover:text-[#1B5FD9] transition-colors shrink-0">02</span>
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center shrink-0 transition-all">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5z"/><path d="M9 11.8l2.2 2.2 4-4.2"/></svg>
            </div>
            <div class="flex-1">
              <h3 class="text-[18px] sm:text-[19px] font-extrabold text-[#061A3E] mb-1">BLK Komunitas Kemnaker RI</h3>
              <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Gedung Balai Latihan Kerja Komunitas Link and Match di dalam sekolah — praktik kejuruan berstandar industri.</p>
            </div>
            <span class="text-[#1B5FD9] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all hidden sm:block shrink-0">
              <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>

          <!-- Row 3 -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-6 px-3 rounded-[12px] hover:bg-gradient-to-r hover:from-[#E8F0FE] hover:to-transparent hover:pl-6 transition-all duration-250 text-decoration-none"
          >
            <span class="text-[32px] sm:text-[44px] font-black text-transparent [-webkit-text-stroke:1.5px_#C9DDFB] group-hover:[-webkit-text-stroke:1.5px_#1B5FD9] group-hover:text-[#1B5FD9] transition-colors shrink-0">03</span>
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center shrink-0 transition-all">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/><circle cx="16.8" cy="9" r="2.6"/><path d="M16.2 14.3c2.5.4 4.3 2.1 5 5.2"/></svg>
            </div>
            <div class="flex-1">
              <h3 class="text-[18px] sm:text-[19px] font-extrabold text-[#061A3E] mb-1">Link &amp; Match Dunia Industri</h3>
              <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Kelas industri bersama DUDIKA, pendidikan sistem ganda, dan prakerin yang terstruktur.</p>
            </div>
            <span class="text-[#1B5FD9] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all hidden sm:block shrink-0">
              <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>

          <!-- Row 4 -->
          <NuxtLink 
            to="/smk/ekstrakurikuler"
            class="rv group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-6 px-3 rounded-[12px] hover:bg-gradient-to-r hover:from-[#E8F0FE] hover:to-transparent hover:pl-6 transition-all duration-250 text-decoration-none"
          >
            <span class="text-[32px] sm:text-[44px] font-black text-transparent [-webkit-text-stroke:1.5px_#C9DDFB] group-hover:[-webkit-text-stroke:1.5px_#1B5FD9] group-hover:text-[#1B5FD9] transition-colors shrink-0">04</span>
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center shrink-0 transition-all">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20 13.2A8.2 8.2 0 1110.8 4 6.6 6.6 0 0020 13.2z"/></svg>
            </div>
            <div class="flex-1">
              <h3 class="text-[18px] sm:text-[19px] font-extrabold text-[#061A3E] mb-1">Pembinaan Akhlak Qur'ani</h3>
              <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Sima'an Qur'an, sholat berjamaah, dan 13 ekstrakurikuler untuk mengasah bakat dan karakter.</p>
            </div>
            <span class="text-[#1B5FD9] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all hidden sm:block shrink-0">
              <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>

        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. BERITA TERBARU (Kabar Sekolah - Rich Photographic Highlight) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF] relative overflow-hidden">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-11 gap-4">
          <div>
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
              Kabar &amp; Informasi Sekolah
            </span>
            <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
              Berita &amp; <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Artikel Terkini</span>
            </h2>
          </div>
          <NuxtLink 
            to="/smk/berita" 
            class="inline-flex items-center gap-2 font-bold text-[14.5px] text-[#1B5FD9] hover:text-[#0A2A5C] transition-colors group"
          >
            Lihat Semua Berita 
            <span class="w-7 h-7 rounded-full bg-[#E8F0FE] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>
        </div>

        <!-- News 3 Cards Grid with Images & Rich Informative Details -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Card 1: SPMB -->
          <div 
            @click="$router.push('/smk/berita')"
            class="rv group bg-white border border-[#E2ECF8] rounded-[22px] overflow-hidden shadow-[0_6px_25px_rgba(10,42,92,0.06)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.14)] hover:-translate-y-2 hover:border-[#1B5FD9]/30 transition-all duration-300 cursor-pointer flex flex-col"
          >
            <!-- Image Frame -->
            <div class="relative h-[210px] overflow-hidden bg-[#0A2A5C]">
              <img 
                src="/asset/SMK/news-spmb.jpg" 
                alt="Pendaftaran SPMB SMK IT Attaqwa 9" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
              <!-- Subtle Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
              
              <!-- Floating Category Pill -->
              <div class="absolute top-4 left-4">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#FEF3C7]/95 text-[#92400E] backdrop-blur-md shadow-sm">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
                  Pengumuman
                </span>
              </div>

              <!-- Read Time Pill -->
              <div class="absolute bottom-3 right-4 text-[11.5px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
                3 mnt baca
              </div>
            </div>

            <!-- Content Area -->
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 text-[12.5px] text-[#8FA6CC] font-semibold mb-2.5">
                  <span>4 Oktober 2026</span>
                  <span>·</span>
                  <span class="text-[#1B5FD9] font-bold">Panitia SPMB</span>
                </div>
                <h3 class="text-[17.5px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                  Penerimaan murid baru resmi dibuka dengan biaya registrasi terjangkau Rp50.000. Tersedia kuota 7 rombel dengan beasiswa tahfidz &amp; prestasi.
                </p>
              </div>

              <!-- Card Action Link -->
              <div class="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-[13px] font-bold text-[#1B5FD9]">
                <span>Baca Pengumuman Lengkap</span>
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </div>

          <!-- Card 2: Deep Learning -->
          <div 
            @click="$router.push('/smk/berita')"
            class="rv group bg-white border border-[#E2ECF8] rounded-[22px] overflow-hidden shadow-[0_6px_25px_rgba(10,42,92,0.06)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.14)] hover:-translate-y-2 hover:border-[#1B5FD9]/30 transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div class="relative h-[210px] overflow-hidden bg-[#0A2A5C]">
              <img 
                src="/asset/SMK/news-deeplearning.jpg" 
                alt="Pembelajaran Deep Learning SMK IT Attaqwa 9" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
              
              <div class="absolute top-4 left-4">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#EEF2FF]/95 text-[#4338CA] backdrop-blur-md shadow-sm">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#4F46E5]"></span>
                  Artikel Edukasi
                </span>
              </div>

              <div class="absolute bottom-3 right-4 text-[11.5px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
                4 mnt baca
              </div>
            </div>

            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 text-[12.5px] text-[#8FA6CC] font-semibold mb-2.5">
                  <span>28 September 2026</span>
                  <span>·</span>
                  <span class="text-[#1B5FD9] font-bold">Tim Kurikulum</span>
                </div>
                <h3 class="text-[17.5px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Mengenal Deep Learning: Cara Baru Belajar di Kurikulum Merdeka
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                  Bukan sekadar menghafal materi. Pendekatan Deep Learning mengasah penalaran kritis, kolaborasi digital, dan studi kasus riil industri.
                </p>
              </div>

              <div class="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-[13px] font-bold text-[#1B5FD9]">
                <span>Baca Artikel Lengkap</span>
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </div>

          <!-- Card 3: BLK Komunitas -->
          <div 
            @click="$router.push('/smk/berita')"
            class="rv group bg-white border border-[#E2ECF8] rounded-[22px] overflow-hidden shadow-[0_6px_25px_rgba(10,42,92,0.06)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.14)] hover:-translate-y-2 hover:border-[#1B5FD9]/30 transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div class="relative h-[210px] overflow-hidden bg-[#0A2A5C]">
              <img 
                src="/asset/SMK/news-blk.jpg" 
                alt="BLK Komunitas SMK IT Attaqwa 9" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
              
              <div class="absolute top-4 left-4">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#DBEAFE]/95 text-[#1D4ED8] backdrop-blur-md shadow-sm">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                  Berita Kejuruan
                </span>
              </div>

              <div class="absolute bottom-3 right-4 text-[11.5px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
                3 mnt baca
              </div>
            </div>

            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 text-[12.5px] text-[#8FA6CC] font-semibold mb-2.5">
                  <span>20 September 2026</span>
                  <span>·</span>
                  <span class="text-[#1B5FD9] font-bold">Humas &amp; DUDIKA</span>
                </div>
                <h3 class="text-[17.5px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  BLK Komunitas: Jembatan Sekolah Menuju Dunia Industri
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                  Gedung BLK Komunitas Kemnaker RI di Attaqwa 9 menjadi pusat uji kompetensi kejuruan dengan mesin modern dan instruktur tersertifikasi.
                </p>
              </div>

              <div class="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-[13px] font-bold text-[#1B5FD9]">
                <span>Baca Berita Lengkap</span>
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4.5 INSTAGRAM SOCIAL FEED SECTION (Modern Interactive Social View) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7] relative overflow-hidden">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header & Profile Info Bar -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-[#EEF3FA]">
          
          <!-- Section Title -->
          <div class="max-w-[620px]">
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#DD2A7B] uppercase py-1 px-3.5 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] mb-3">
              <!-- Instagram Icon -->
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram Resmi @smkit.attaqwa9
            </span>
            <h2 class="text-[clamp(24px,3.4vw,34px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
              Kilas Cerita &amp; <span class="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text text-transparent">Aktivitas Santri</span>
            </h2>
            <p class="text-[#5A6B8C] text-[15.5px] mt-2 leading-relaxed">
              Ikuti liputan kegiatan praktikum, pembiasaan ibadah, dan karya kreatif siswa langsung di akun Instagram kami.
            </p>
          </div>

          <!-- Profile Badge & CTA Button -->
          <div class="flex flex-wrap items-center gap-4">
            <!-- Profile Chip -->
            <div class="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 pr-4 rounded-[16px]">
              <!-- Avatar with Instagram Gradient Border Ring -->
              <div class="p-[2px] rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] shrink-0">
                <div class="w-11 h-11 rounded-full bg-white p-[2px] overflow-hidden flex items-center justify-center">
                  <img src="/asset/logo.png" alt="Logo SMK IT Attaqwa 9" class="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[13.5px] font-black text-[#0A2A5C]">smkit.attaqwa9</span>
                  <!-- Verified Badge -->
                  <svg class="w-4 h-4 text-[#1B5FD9] fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </div>
                <span class="text-[12px] text-[#64748B] font-medium">SMK IT ATTAQWA 9 (Official)</span>
              </div>
            </div>

            <!-- Action Button -->
            <a 
              href="https://www.instagram.com/smkit.attaqwa9/?hl=id" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 font-bold text-[14.5px] py-3 px-6 rounded-[14px] text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] shadow-[0_8px_20px_rgba(221,42,123,0.3)] hover:shadow-[0_12px_28px_rgba(221,42,123,0.45)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Ikuti di Instagram
            </a>
          </div>

        </div>

        <!-- 4 Grid Instagram Post Cards (Dynamic dari Meta API / Fallback) -->
        <div v-if="feedPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div v-for="i in 4" :key="i" class="bg-[#F8FAFC] border border-[#E2ECF8] rounded-[20px] overflow-hidden animate-pulse">
            <div class="aspect-square bg-slate-200"></div>
            <div class="p-4 space-y-3">
              <div class="h-4 bg-slate-200 rounded w-3/4"></div>
              <div class="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <a 
            v-for="(post, idx) in instagramPosts" 
            :key="post.id || idx"
            :href="post.permalink || 'https://www.instagram.com/smkit.attaqwa9/?hl=id'" 
            target="_blank"
            rel="noopener noreferrer"
            class="rv group relative bg-[#F8FAFC] border border-[#E2ECF8] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col block text-decoration-none"
          >
            <!-- Media Image Container -->
            <div class="relative aspect-square overflow-hidden bg-[#0A2A5C]">
              <img 
                :src="post.imageUrl" 
                :alt="post.caption" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
              
              <!-- Post Type Badge -->
              <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1.5">
                <!-- Icon Reel -->
                <svg v-if="post.badgeType === 'reel'" class="w-3 h-3 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <!-- Icon Gallery -->
                <svg v-else-if="post.badgeType === 'gallery'" class="w-3 h-3 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <!-- Icon Default/Custom -->
                <svg v-else class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/></svg>
                {{ post.badge }}
              </div>

              <!-- Interactive Hover Backdrop Overlay -->
              <div class="absolute inset-0 bg-[#061A3E]/75 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity duration-200 flex flex-col items-center justify-center text-white p-5 text-center">
                <div class="flex items-center gap-4 font-extrabold text-[14px] mb-3">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 fill-[#F43F5E]" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    {{ post.likes }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    {{ post.comments }}
                  </span>
                </div>
                <span class="text-[12px] font-bold py-1.5 px-3.5 rounded-full bg-white/20 border border-white/30 hover:bg-white/30 transition-colors">
                  Lihat di Instagram ↗
                </span>
              </div>
            </div>

            <!-- Post Caption & Meta -->
            <div class="p-4 flex-1 flex flex-col justify-between bg-white">
              <div>
                <p class="text-[13px] text-[#334155] leading-relaxed line-clamp-2 mb-2 font-medium">
                  {{ post.caption }}
                </p>
                <div class="text-[12px] font-bold text-[#1B5FD9] line-clamp-1">
                  {{ post.hashtags }}
                </div>
              </div>
              <div class="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11.5px] text-[#94A3B8]">
                <span>{{ post.timeAgo }}</span>
                <span class="font-semibold text-[#64748B]">{{ post.author || '@smkit.attaqwa9' }}</span>
              </div>
            </div>
          </a>

        </div>

        <!-- Social Footer Note -->
        <div class="text-center mt-8">
          <p class="text-[13px] text-[#8FA6CC] font-medium">
            Dokumentasi diperbarui secara berkala melalui akun Instagram resmi <a href="https://www.instagram.com/smkit.attaqwa9/?hl=id" target="_blank" rel="noopener noreferrer" class="text-[#1B5FD9] font-bold hover:underline">@smkit.attaqwa9</a>.
          </p>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. PENERIMAAN MURID BARU (White Background + Premium CTA Card) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white">
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
              SPMB 2027/2028 telah dibuka dengan biaya registrasi hanya <b class="text-white">Rp50.000</b>. Kuota terbatas — hanya 7 rombel.
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
              <!-- Glow Ambient Behind Student -->
              <div class="absolute bottom-0 inset-x-0 h-[280px] bg-[radial-gradient(ellipse_at_bottom,rgba(43,124,216,0.45),transparent_70%)] pointer-events-none"></div>

              <!-- Floating Chip: Kuota Terbatas -->
              <div class="absolute top-6 -left-2 sm:left-4 bg-white/95 backdrop-blur-md text-[#0A2A5C] font-extrabold text-[12px] py-1.5 px-3 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.3)] border border-[#E3EAF7] flex items-center gap-1.5 z-10 hover:scale-105 transition-transform">
                <span class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                Kuota 7 Rombel
              </div>

              <!-- Foto Siswa Asli (Grounded ke dasar card) -->
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
