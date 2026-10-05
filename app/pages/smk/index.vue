<script setup lang="ts">
import { useGsapReveal } from "~/composables/useGsapReveal";
useGsapReveal();
definePageMeta({ layout: 'smk' })
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    <!-- ================================================================= -->
    <!-- 1. HERO SECTION (Dark Navy Gradient) -->
    <!-- ================================================================= -->
    <section 
      class="relative overflow-hidden text-white pt-[60px] pb-[80px] md:pt-[90px] md:pb-[100px]"
      style="background: radial-gradient(900px 480px at 85% -10%, rgba(43, 124, 216, 0.55), transparent 60%), linear-gradient(135deg, #0C2C61 0%, #0A2A5C 55%, #061A3E 100%);"
    >
      <!-- Ambient Dot Grid -->
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:26px_26px] pointer-events-none"></div>

      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          <!-- Kolom Kiri: Copywriting & CTAs -->
          <div>
            <!-- Badge SPMB -->
            <span class="inline-flex items-center gap-2 bg-[#F59E0B]/15 border border-[#F59E0B]/50 text-[#FCD34D] text-[13px] font-bold py-2 px-4 rounded-full mb-6">
              <i class="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></i>
              SPMB 2027/2028 Telah Dibuka
            </span>

            <!-- Main Heading -->
            <h1 class="text-[clamp(32px,5.2vw,56px)] font-black leading-[1.12] tracking-[-0.02em] mb-4 text-white">
              Unggul dalam <em class="not-italic bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">IMTAQ</em>, Terdepan dalam <em class="not-italic bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">IPTEK</em>
            </h1>

            <!-- Motto -->
            <p class="text-[#C9D8F2] text-[16px] md:text-[17.5px] max-w-[580px] mb-8 leading-relaxed">
              "Membentuk Generasi Vokasi Qur'ani yang Benar, Pintar, dan Terampil."
            </p>

            <!-- Hero Action Buttons -->
            <div class="flex flex-wrap items-center gap-3.5 mb-12">
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
              <div class="hstat bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-4 sm:p-5 backdrop-blur-sm">
                <b class="block text-[28px] sm:text-[30px] font-black text-white leading-tight">316<small class="text-[#FCD34D] text-[18px] font-bold">+</small></b>
                <span class="text-[12.5px] text-[#A9BDDD] font-semibold">Siswa Aktif</span>
              </div>
              <div class="hstat bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-4 sm:p-5 backdrop-blur-sm">
                <b class="block text-[28px] sm:text-[30px] font-black text-white leading-tight">6</b>
                <span class="text-[12.5px] text-[#A9BDDD] font-semibold">Konsentrasi Keahlian</span>
              </div>
              <div class="hstat bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-4 sm:p-5 backdrop-blur-sm">
                <b class="block text-[28px] sm:text-[30px] font-black text-white leading-tight">13</b>
                <span class="text-[12.5px] text-[#A9BDDD] font-semibold">Ekstrakurikuler</span>
              </div>
              <div class="hstat bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-4 sm:p-5 backdrop-blur-sm">
                <b class="block text-[28px] sm:text-[30px] font-black text-white leading-tight">A</b>
                <span class="text-[12.5px] text-[#A9BDDD] font-semibold">Akreditasi BAN-SM</span>
              </div>
            </div>
          </div>

          <!-- Kolom Kanan: Foto Frame & Floating Badges -->
          <div class="relative flex justify-center lg:justify-end">
            <div class="relative w-full max-w-[480px]">
              <!-- Frame Placeholder Foto -->
              <div class="w-full aspect-[4/3] sm:aspect-[16/11] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] border-2 border-dashed border-[#4C8DFF]/40 rounded-[22px] p-6 flex flex-col items-center justify-center text-center text-[#B9D2F5] shadow-2xl">
                <svg class="w-12 h-12 mb-3 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7.5L10 5h4l1.5 2.5"/></svg>
                <b class="text-[15px] font-bold text-white tracking-wide">FOTO : SISWA SMK IT ATTAQWA 9</b>
                <small class="text-[12px] text-[#8FA6CC] mt-1">Ganti dengan foto asli</small>
              </div>

              <!-- Chip 1: Akreditasi A -->
              <div class="absolute -top-3 -left-2 sm:-left-5 bg-white text-[#0A2A5C] font-extrabold text-[13px] py-2 px-3.5 rounded-full shadow-[0_8px_20px_rgba(10,42,92,0.15)] border border-[#E3EAF7] flex items-center gap-2">
                <svg class="w-4 h-4 text-[#1B5FD9] stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5z"/><path d="M9 11.8l2.2 2.2 4-4.2"/></svg>
                Akreditasi A
              </div>

              <!-- Chip 2: 316+ Siswa -->
              <div class="absolute -bottom-3 -right-2 sm:-right-5 bg-white text-[#0A2A5C] font-extrabold text-[13px] py-2 px-3.5 rounded-full shadow-[0_8px_20px_rgba(10,42,92,0.15)] border border-[#E3EAF7] flex items-center gap-2">
                <svg class="w-4 h-4 text-[#1B5FD9] stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/><circle cx="16.8" cy="9" r="2.6"/><path d="M16.2 14.3c2.5.4 4.3 2.1 5 5.2"/></svg>
                316+ Siswa
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. JURUSAN UNGGULAN (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="text-center max-w-[700px] mx-auto mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-3">Konsentrasi Keahlian</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Bidang &amp; <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Jurusan Unggulan</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16.5px] mt-3">
            Pilih jalur vokasi sesuai minat dan bakatmu — semuanya terhubung langsung dengan kebutuhan dunia industri.
          </p>
        </div>

        <!-- Grid 6 Jurusan -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <!-- AKL -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:shadow-[0_20px_44px_rgba(10,42,92,0.16)] hover:-translate-y-1.5 transition-all duration-200 block text-decoration-none"
          >
            <span class="inline-block text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-4">Bisnis &amp; Manajemen</span>
            <div class="w-[54px] h-[54px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-4 transition-all duration-200">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M7 20v-7M12 20V6M17 20v-10"/></svg>
            </div>
            <h3 class="text-[20px] font-black text-[#061A3E] mb-1">AKL</h3>
            <p class="text-[13px] font-bold text-[#1B5FD9] mb-2.5">Akuntansi &amp; Keuangan Lembaga</p>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed mb-4">Akuntansi, perpajakan, dan sistem keuangan lembaga modern berbasis aplikasi.</p>
            <span class="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#1B5FD9] group-hover:translate-x-1 transition-transform">
              Pelajari jurusan <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>

          <!-- OTKP -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:shadow-[0_20px_44px_rgba(10,42,92,0.16)] hover:-translate-y-1.5 transition-all duration-200 block text-decoration-none"
          >
            <span class="inline-block text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-4">Bisnis &amp; Manajemen</span>
            <div class="w-[54px] h-[54px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-4 transition-all duration-200">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2.5"/><path d="M9 8V6.5A2.5 2.5 0 0111.5 4h1A2.5 2.5 0 0115 6.5V8M3 13.5h18"/></svg>
            </div>
            <h3 class="text-[20px] font-black text-[#061A3E] mb-1">OTKP</h3>
            <p class="text-[13px] font-bold text-[#1B5FD9] mb-2.5">Otomatisasi &amp; Tata Kelola Perkantoran</p>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed mb-4">Administrasi perkantoran digital, kesekretarisan, dan layanan bisnis profesional.</p>
            <span class="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#1B5FD9] group-hover:translate-x-1 transition-transform">
              Pelajari jurusan <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>

          <!-- TBSM -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:shadow-[0_20px_44px_rgba(10,42,92,0.16)] hover:-translate-y-1.5 transition-all duration-200 block text-decoration-none"
          >
            <span class="inline-block text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-4">Teknik Otomotif</span>
            <div class="w-[54px] h-[54px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-4 transition-all duration-200">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20.6 6.6a5 5 0 01-6.9 6.9L7 20.2a2.2 2.2 0 01-3.1-3.1l6.7-6.7A5 5 0 0117.5 3.4l-2.8 2.8 2.6 2.6 3.3-2.2z"/></svg>
            </div>
            <h3 class="text-[20px] font-black text-[#061A3E] mb-1">TBSM</h3>
            <p class="text-[13px] font-bold text-[#1B5FD9] mb-2.5">Teknik &amp; Bisnis Sepeda Motor</p>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed mb-4">Teknologi sepeda motor plus kewirausahaan bengkel — lulusan siap buka usaha.</p>
            <span class="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#1B5FD9] group-hover:translate-x-1 transition-transform">
              Pelajari jurusan <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>

          <!-- TKR -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:shadow-[0_20px_44px_rgba(10,42,92,0.16)] hover:-translate-y-1.5 transition-all duration-200 block text-decoration-none"
          >
            <span class="inline-block text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-4">Teknik Otomotif</span>
            <div class="w-[54px] h-[54px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-4 transition-all duration-200">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4.5 15.5L6 10.7A2 2 0 017.9 9.3h8.2a2 2 0 011.9 1.4l1.5 4.8"/><path d="M3.5 15.5h17V19a1 1 0 01-1 1H4.5a1 1 0 01-1-1v-3.5z"/><circle cx="8" cy="17.6" r="1" fill="currentColor"/><circle cx="16" cy="17.6" r="1" fill="currentColor"/></svg>
            </div>
            <h3 class="text-[20px] font-black text-[#061A3E] mb-1">TKR</h3>
            <p class="text-[13px] font-bold text-[#1B5FD9] mb-2.5">Teknik Kendaraan Ringan</p>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed mb-4">Perawatan, perbaikan, dan teknologi kendaraan ringan niaga terkini.</p>
            <span class="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#1B5FD9] group-hover:translate-x-1 transition-transform">
              Pelajari jurusan <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>

          <!-- TKJ -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:shadow-[0_20px_44px_rgba(10,42,92,0.16)] hover:-translate-y-1.5 transition-all duration-200 block text-decoration-none"
          >
            <span class="inline-block text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-4">Teknologi Informasi</span>
            <div class="w-[54px] h-[54px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-4 transition-all duration-200">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10.5 2v3M13.5 2v3M10.5 19v3M13.5 19v3M2 10.5h3M2 13.5h3M19 10.5h3M19 13.5h3"/></svg>
            </div>
            <h3 class="text-[20px] font-black text-[#061A3E] mb-1">TKJ</h3>
            <p class="text-[13px] font-bold text-[#1B5FD9] mb-2.5">Teknik Komputer &amp; Jaringan</p>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed mb-4">Jaringan komputer, server, dan infrastruktur IT untuk era digital.</p>
            <span class="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#1B5FD9] group-hover:translate-x-1 transition-transform">
              Pelajari jurusan <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </NuxtLink>

          <!-- DKV -->
          <NuxtLink 
            to="/smk/akademik"
            class="rv group bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:shadow-[0_20px_44px_rgba(10,42,92,0.16)] hover:-translate-y-1.5 transition-all duration-200 block text-decoration-none"
          >
            <span class="inline-block text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-4">Teknologi Informasi</span>
            <div class="w-[54px] h-[54px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center mb-4 transition-all duration-200">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4 20l1.2-4.2L16.7 4.3a2 2 0 012.8 0l.2.2a2 2 0 010 2.8L8.2 18.8 4 20z"/><path d="M14.8 6.2l3 3"/></svg>
            </div>
            <h3 class="text-[20px] font-black text-[#061A3E] mb-1">DKV</h3>
            <p class="text-[13px] font-bold text-[#1B5FD9] mb-2.5">Desain Komunikasi Visual</p>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed mb-4">Desain grafis, multimedia, dan komunikasi visual kreatif.</p>
            <span class="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#1B5FD9] group-hover:translate-x-1 transition-transform">
              Pelajari jurusan <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
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
    <!-- 4. BERITA TERBARU (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-3">Kabar Sekolah</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Berita Terbaru
          </h2>
        </div>

        <!-- News 3 Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <!-- Card 1 -->
          <div 
            @click="$router.push('/smk/berita')"
            class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col"
          >
            <div class="min-h-[170px] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] flex items-center justify-center text-white">
              <svg class="w-10 h-10 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path d="M3.5 10.5v4l3.5.6v-5.2l-3.5.6z"/><path d="M7 9.9L17.5 5v14L7 14.1"/><path d="M17.5 8.8a3.2 3.2 0 010 6.4"/></svg>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="inline-block text-[11px] font-extrabold tracking-[0.1em] uppercase py-1.5 px-3 rounded-full bg-[#FEF3C7] text-[#B45309] w-fit mb-3">Pengumuman</span>
              <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-3">SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran</h3>
              <span class="text-[12.5px] text-[#5A6B8C] font-semibold mt-auto block">4 Oktober 2026</span>
            </div>
          </div>

          <!-- Card 2 -->
          <div 
            @click="$router.push('/smk/berita')"
            class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col"
          >
            <div class="min-h-[170px] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] flex items-center justify-center text-white">
              <svg class="w-10 h-10 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 3a6 6 0 00-3.4 10.9c.8.6 1.4 1.3 1.4 2.6h4c0-1.3.6-2 1.4-2.6A6 6 0 0012 3z"/></svg>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="inline-block text-[11px] font-extrabold tracking-[0.1em] uppercase py-1.5 px-3 rounded-full bg-[#E0E7FF] text-[#4338CA] w-fit mb-3">Artikel</span>
              <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-3">Mengenal Deep Learning: Cara Baru Belajar di Kurikulum Merdeka</h3>
              <span class="text-[12.5px] text-[#5A6B8C] font-semibold mt-auto block">28 September 2026</span>
            </div>
          </div>

          <!-- Card 3 -->
          <div 
            @click="$router.push('/smk/berita')"
            class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col"
          >
            <div class="min-h-[170px] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] flex items-center justify-center text-white">
              <svg class="w-10 h-10 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2M10 20.5v-2.8h4v2.8"/></svg>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="inline-block text-[11px] font-extrabold tracking-[0.1em] uppercase py-1.5 px-3 rounded-full bg-[#DBEAFE] text-[#1D4ED8] w-fit mb-3">Berita</span>
              <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-3">BLK Komunitas: Jembatan Sekolah Menuju Dunia Industri</h3>
              <span class="text-[12.5px] text-[#5A6B8C] font-semibold mt-auto block">20 September 2026</span>
            </div>
          </div>

        </div>

        <!-- Button Semua Berita -->
        <div class="text-center mt-10">
          <NuxtLink 
            to="/smk/berita" 
            class="inline-flex items-center gap-2 font-bold text-[15px] py-3.5 px-7 rounded-[14px] text-[#0A2A5C] bg-white border-2 border-[#C9DDFB] hover:bg-[#E8F0FE] hover:-translate-y-0.5 transition-all"
          >
            Semua Berita →
          </NuxtLink>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. PENERIMAAN MURID BARU (White Background + Premium CTA Card) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-t border-[#E3EAF7]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="bg-gradient-to-br from-[#0C2C61] via-[#0A2A5C] to-[#061A3E] text-white rounded-[24px] p-8 md:p-12 shadow-[0_24px_60px_rgba(10,42,92,0.2)] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative overflow-hidden">
          
          <!-- Background Deco -->
          <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

          <!-- Teks Kiri -->
          <div class="relative z-10">
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
                class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#2B7CD8] to-[#0A2A5C] border border-[#7DB9F5]/40 shadow-[0_10px_25px_rgba(27,106,201,0.4)] hover:-translate-y-0.5 transition-all"
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

          <!-- Visual Kanan (Frame Foto) -->
          <div class="relative z-10 flex justify-center lg:justify-end">
            <div class="w-full max-w-[420px] aspect-[4/3] bg-white/10 border-2 border-dashed border-white/30 rounded-[20px] p-6 flex flex-col items-center justify-center text-center text-[#DCE7FA] backdrop-blur-sm">
              <svg class="w-12 h-12 mb-3 text-[#7DB9F5] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7.5L10 5h4l1.5 2.5"/></svg>
              <b class="text-[14px] font-bold text-white tracking-wide">FOTO : SUASANA BELAJAR SISWA</b>
              <small class="text-[12px] text-[#A9BDDD] mt-1">Ganti dengan foto asli</small>
            </div>
          </div>

        </div>

      </div>
    </section>

  </div>
</template>
