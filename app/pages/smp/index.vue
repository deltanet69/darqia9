<script setup lang="ts">
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smp' })
</script>

<template>
  <div class="min-h-screen bg-[#F2F9F5] text-[#0E241B] font-sans antialiased overflow-x-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. HERO SECTION (Mirroring .hero from web-profil-smp-bca.html) -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white bg-[#063826] bg-[radial-gradient(900px_480px_at_85%_-10%,rgba(52,199,123,0.45),transparent_60%),linear-gradient(135deg,#0A4A30_0%,#063826_55%,#052E22_100%)]">
      <!-- Background Grid Texture -->
      <div class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1.5px,transparent_1.5px)] [background-size:26px_26px] pointer-events-none"></div>

      <div class="max-w-[1180px] mx-auto px-[22px] py-[70px] lg:py-[88px] pb-[80px] lg:pb-[96px] relative">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          <!-- Teks Kiri (7 Cols) -->
          <div class="lg:col-span-7">
            <!-- Badge -->
            <div class="inline-flex items-center gap-[9px] bg-[#F59E0B]/[0.16] border border-[#F59E0B]/50 text-[#FCD34D] text-[13px] font-bold py-[9px] px-[18px] rounded-full mb-[22px]">
              <span class="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
              <span>SPMB 2027/2028 Telah Dibuka — 7 Rombel</span>
            </div>

            <!-- Headline H1 -->
            <h1 class="text-[clamp(32px,5vw,56px)] font-black leading-[1.15] tracking-[-0.02em] max-w-[18ch] text-white">
              Alqur'an &amp; <em class="not-italic bg-gradient-to-r from-[#7EE2AE] to-[#FCD34D] bg-clip-text text-transparent">Akhlaknya Terpuji</em>, Prestasi <em class="not-italic bg-gradient-to-r from-[#7EE2AE] to-[#FCD34D] bg-clip-text text-transparent">Akademiknya Teruji</em>
            </h1>

            <!-- Subtitle -->
            <p class="text-[17.5px] text-[#C4E4D4] max-w-[62ch] my-[20px] mb-[12px] leading-relaxed">
              SMP IT Bina Cendekia Assalam — sekolah berbasis kelas gender di bawah مؤسسة دار القهار, memadukan kurikulum nasional dengan pendidikan Islam terpadu.
            </p>

            <!-- Motto -->
            <p class="text-[#FDE68A] font-bold text-[clamp(14px,2.4vw,16.5px)] mb-[28px] tracking-[0.2px]">
              "Membentuk Generasi Qur'ani Berprestasi yang Terpercaya, Cerdas dan Mandiri."
            </p>

            <!-- Action Buttons -->
            <div class="flex items-center gap-[14px] flex-wrap mb-[40px] lg:mb-[56px]">
              <NuxtLink 
                to="/smp/spmb" 
                class="inline-flex items-center gap-[9px] font-bold text-[15px] py-[14px] px-[28px] rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <span>Daftar SPMB 2027/2028</span>
                <svg class="w-[20px] h-[20px] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </NuxtLink>

              <NuxtLink 
                to="/smp/tentang" 
                class="inline-flex items-center gap-[9px] font-bold text-[15px] py-[14px] px-[28px] rounded-[14px] text-white bg-white/10 border-2 border-white/35 hover:bg-white/20 transition-colors"
              >
                <span>Jelajahi Sekolah</span>
              </NuxtLink>
            </div>

            <!-- Stats 4 Boxes -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-[14px] max-w-[860px]">
              <div class="bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-[18px_20px] backdrop-blur-[4px]">
                <b class="block text-[30px] font-black text-white leading-none mb-1">7<small class="text-[18px] text-[#FCD34D] font-bold">+</small></b>
                <span class="text-[12.5px] text-[#A9D4BC] font-semibold">Kelas / Rombel</span>
              </div>

              <div class="bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-[18px_20px] backdrop-blur-[4px]">
                <b class="block text-[30px] font-black text-white leading-none mb-1">7</b>
                <span class="text-[12.5px] text-[#A9D4BC] font-semibold">Program Unggulan</span>
              </div>

              <div class="bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-[18px_20px] backdrop-blur-[4px]">
                <b class="block text-[30px] font-black text-white leading-none mb-1">13</b>
                <span class="text-[12.5px] text-[#A9D4BC] font-semibold">Ekstrakurikuler</span>
              </div>

              <div class="bg-white/[0.07] border border-white/[0.14] rounded-[16px] p-[18px_20px] backdrop-blur-[4px]">
                <b class="block text-[30px] font-black text-white leading-none mb-1">6<small class="text-[18px] text-[#FCD34D] font-bold">th</small></b>
                <span class="text-[12.5px] text-[#A9D4BC] font-semibold">Milad SMP IT BCA</span>
              </div>
            </div>

          </div>

          <!-- Visual Kanan (5 Cols) -->
          <div class="lg:col-span-5 relative mt-6 lg:mt-0">
            <div class="grid grid-cols-2 gap-[16px] relative">
              
              <!-- Siswi Photo Box -->
              <div class="rounded-[20px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.4)] border-[3px] border-white/25 bg-gradient-to-br from-[#12A15E] to-[#063826] min-h-[340px] max-h-[460px] flex flex-col justify-between p-6 relative">
                <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                    <circle cx="12" cy="9" r="5"/>
                    <path d="M12 14v7M9 18h6"/>
                  </svg>
                </div>
                <div class="bg-black/35 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
                  <strong class="text-white text-sm font-black block">Santri Putri</strong>
                  <span class="text-xs text-[#A9D4BC]">Fokus &amp; Berkarakter</span>
                </div>
              </div>

              <!-- Siswa Photo Box -->
              <div class="rounded-[20px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.4)] border-[3px] border-white/25 bg-gradient-to-br from-[#0A4A30] to-[#052E22] min-h-[340px] max-h-[460px] flex flex-col justify-between p-6 relative">
                <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-[#FCD34D] shadow-inner">
                  <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                    <path d="M16 4h4v4M20 4l-6.5 6.5"/>
                    <circle cx="9.5" cy="14.5" r="5.5"/>
                  </svg>
                </div>
                <div class="bg-black/35 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
                  <strong class="text-white text-sm font-black block">Santri Putra</strong>
                  <span class="text-xs text-[#A9D4BC]">Mandiri &amp; Cerdas</span>
                </div>
              </div>

              <!-- Floating Chip 1 (Top Left) -->
              <div class="absolute top-[14px] -left-[10px] sm:left-[6px] bg-white text-[#052E22] rounded-[14px] shadow-[0_18px_44px_rgba(3,15,40,0.35)] px-[17px] py-[12px] flex items-center gap-[10px] font-extrabold text-[13.5px] whitespace-nowrap z-10 animate-bounce">
                <svg class="w-[22px] h-[22px] text-[#0E7A4E] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
                  <path d="M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5z"/>
                  <path d="M9 11.8l2.2 2.2 4-4.2"/>
                </svg>
                <span>Kelas Gender</span>
              </div>

              <!-- Floating Chip 2 (Bottom Right) -->
              <div class="absolute bottom-[14px] -right-[10px] sm:right-[6px] bg-white text-[#052E22] rounded-[14px] shadow-[0_18px_44px_rgba(3,15,40,0.35)] px-[17px] py-[12px] flex items-center gap-[10px] font-extrabold text-[13.5px] whitespace-nowrap z-10">
                <svg class="w-[22px] h-[22px] text-[#0E7A4E] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
                  <circle cx="9" cy="8" r="3.4"/>
                  <path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/>
                  <circle cx="16.8" cy="9" r="2.6"/>
                  <path d="M16.2 14.3c2.5.4 4.3 2.1 5 5.2"/>
                </svg>
                <span>1000+ Siswa</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>


    <!-- ================================================================= -->
    <!-- 2. TUJUH PROGRAM UNGGULAN (Soft Emerald Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="text-center max-w-[720px] mx-auto mb-14">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Pilar Pembelajaran
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            Tujuh Program <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Unggulan Sekolah</span>
          </h2>
          <p class="text-[#55705F] text-[16px] mt-2.5 leading-relaxed">
            Tujuh pilar yang membuat SMP IT BCA istimewa — dari pembelajaran berbasis kelas gender hingga kemitraan public speaking global.
          </p>
        </div>

        <!-- 7 Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Card 1 -->
          <div class="rv bg-white border border-[#E0ECE6] rounded-[22px] p-7 shadow-[0_4px_20px_rgba(6,56,38,0.04)] hover:shadow-[0_20px_45px_rgba(6,56,38,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-5 font-black">
                <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/><circle cx="16.8" cy="9" r="2.6"/><path d="M16.2 14.3c2.5.4 4.3 2.1 5 5.2"/></svg>
              </div>
              <h3 class="text-[19px] font-black text-[#063826] leading-snug mb-2">1. Kelas Berbasis Gender</h3>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                Kelas khusus putra dan kelas khusus putri dengan metode CTL (Contextual Teaching and Learning) — fokus dan nyaman sesuai fitrah anak.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#F2F9F5] text-[12.5px] font-bold text-[#0E7A4E]">
              Metode Contextual Learning
            </div>
          </div>

          <!-- Card 2 -->
          <div class="rv bg-white border border-[#E0ECE6] rounded-[22px] p-7 shadow-[0_4px_20px_rgba(6,56,38,0.04)] hover:shadow-[0_20px_45px_rgba(6,56,38,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-5 font-black">
                <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9.5 20.5h5M12 16.5v4"/></svg>
              </div>
              <h3 class="text-[19px] font-black text-[#063826] leading-snug mb-2">2. Kurikulum Terintegrasi ICT</h3>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                Kurikulum Diknas dan Islam Terpadu yang terintegrasi penuh, didukung sarana teknologi informasi dan lab multimedia.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#F2F9F5] text-[12.5px] font-bold text-[#0E7A4E]">
              Diknas + Islam Terpadu
            </div>
          </div>

          <!-- Card 3 -->
          <div class="rv bg-white border border-[#E0ECE6] rounded-[22px] p-7 shadow-[0_4px_20px_rgba(6,56,38,0.04)] hover:shadow-[0_20px_45px_rgba(6,56,38,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-5 font-black">
                <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
              </div>
              <h3 class="text-[19px] font-black text-[#063826] leading-snug mb-2">3. Tahfidz Metode Yanbu'a</h3>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                Program baca Qur'an dan tahfidz bersanad dengan metode Yanbu'a — target hafalan tartil dan terukur setiap semesternya.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#F2F9F5] text-[12.5px] font-bold text-[#0E7A4E]">
              Bimbingan Asatidz Bersanad
            </div>
          </div>

          <!-- Card 4 -->
          <div class="rv bg-white border border-[#E0ECE6] rounded-[22px] p-7 shadow-[0_4px_20px_rgba(6,56,38,0.04)] hover:shadow-[0_20px_45px_rgba(6,56,38,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-5 font-black">
                <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20 13.2A8.2 8.2 0 1110.8 4 6.6 6.6 0 0020 13.2z"/></svg>
              </div>
              <h3 class="text-[19px] font-black text-[#063826] leading-snug mb-2">4. Sima'an &amp; Sholat Berjamaah</h3>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                Sima'an Al-Qur'an dan sholat fardhu berjamaah menjadi pembiasaan serta budaya harian yang melekat di jiwa santri.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#F2F9F5] text-[12.5px] font-bold text-[#0E7A4E]">
              Budaya Ibadah Harian
            </div>
          </div>

          <!-- Card 5 -->
          <div class="rv bg-white border border-[#E0ECE6] rounded-[22px] p-7 shadow-[0_4px_20px_rgba(6,56,38,0.04)] hover:shadow-[0_20px_45px_rgba(6,56,38,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-5 font-black">
                <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 20s-7.2-4.6-9.3-9.2a5 5 0 019.3-2.9A5 5 0 0121.3 11c-2.1 4.6-9.3 9-9.3 9z"/></svg>
              </div>
              <h3 class="text-[19px] font-black text-[#063826] leading-snug mb-2">5. Pendalaman Fiqih &amp; Ubudiyah</h3>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                Praktik ibadah terpandu agar setiap tata cara thaharah, sholat, dan muamalah santri benar sesuai tuntunan syariat.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#F2F9F5] text-[12.5px] font-bold text-[#0E7A4E]">
              Karakter Akhlakul Karimah
            </div>
          </div>

          <!-- Card 6 -->
          <div class="rv bg-white border border-[#E0ECE6] rounded-[22px] p-7 shadow-[0_4px_20px_rgba(6,56,38,0.04)] hover:shadow-[0_20px_45px_rgba(6,56,38,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-5 font-black">
                <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 3a6 6 0 00-3.4 10.9c.8.6 1.4 1.3 1.4 2.6h4c0-1.3.6-2 1.4-2.6A6 6 0 0012 3z"/></svg>
              </div>
              <h3 class="text-[19px] font-black text-[#063826] leading-snug mb-2">6. Talent &amp; Entrepreneur Day</h3>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                Pengembangan minat bakat kepemimpinan serta pelatihan wirausaha santri sejak dini melalui agenda Entrepreneur Day.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#F2F9F5] text-[12.5px] font-bold text-[#0E7A4E]">
              Bakat &amp; Kewirausahaan
            </div>
          </div>

          <!-- Card 7 (Col-span on large) -->
          <div class="rv md:col-span-2 lg:col-span-3 bg-gradient-to-r from-[#063826] to-[#0A4A30] text-white rounded-[22px] p-7 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-white/15 text-[#FCD34D] flex items-center justify-center shrink-0 font-black">
                <svg class="w-7 h-7 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3"/></svg>
              </div>
              <div>
                <span class="text-[12px] font-extrabold text-[#FCD34D] uppercase tracking-wider block mb-0.5">Program Spesial</span>
                <h3 class="text-[20px] font-black text-white">7. Unggul Bahasa &amp; Public Speaking @america</h3>
                <p class="text-[14px] text-[#C4E4D4] mt-1 max-w-2xl">
                  Pelatihan kefasihan berbahasa Inggris, retorika pidato, dan keberanian tampil di panggung publik melalui kolaborasi School @america.
                </p>
              </div>
            </div>
            <NuxtLink 
              to="/smp/akademik" 
              class="py-3 px-6 rounded-xl bg-[#F0B429] hover:bg-[#FCD34D] text-[#3D2C00] font-extrabold text-[14px] whitespace-nowrap shadow-md transition-all shrink-0"
            >
              Lihat Kurikulum →
            </NuxtLink>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. CIRI KHAS KELAS GENDER (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E0ECE6]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="text-center max-w-[700px] mx-auto mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5z"/></svg>
            Metodologi CTL
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            Sekolah Berbasis <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Kelas Gender</span>
          </h2>
          <p class="text-[#55705F] text-[16px] mt-2.5">
            Putra belajar bersama putra, putri belajar bersama putri — masing-masing lingkungan didesain selaras dengan fase tumbuh kembang dan potensi terbaiknya.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Card Putra -->
          <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center gap-3.5 mb-4">
              <div class="w-12 h-12 rounded-xl bg-[#0E7A4E] text-white flex items-center justify-center font-black">
                <svg class="w-6 h-6 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M16 4h4v4M20 4l-6.5 6.5"/><circle cx="9.5" cy="14.5" r="5.5"/></svg>
              </div>
              <div>
                <h3 class="text-[21px] font-black text-[#063826]">Kelas Khusus Laki-laki</h3>
                <span class="text-[13px] font-bold text-[#0E7A4E]">Fokus, Kepemimpinan &amp; Disiplin</span>
              </div>
            </div>
            <p class="text-[15px] text-[#55705F] leading-relaxed mb-5">
              Lingkungan belajar yang dinamis dan menantang, dirancang khusus dengan pendekatan pengajaran yang merangsang daya nalar kritis, ketangkasan fisik, dan etos kemandirian putra.
            </p>
            <ul class="space-y-2 text-[14px] text-[#0E241B]">
              <li class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-[#D9F2E3] text-[#0E7A4E] flex items-center justify-center text-xs font-black">✓</span>
                <span>Pembelajaran berbasis praktik &amp; kompetisi sehat</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-[#D9F2E3] text-[#0E7A4E] flex items-center justify-center text-xs font-black">✓</span>
                <span>Pembinaan sholat berjamaah &amp; adab masjid</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-[#D9F2E3] text-[#0E7A4E] flex items-center justify-center text-xs font-black">✓</span>
                <span>Penguatan mental kepemimpinan santri</span>
              </li>
            </ul>
          </div>

          <!-- Card Putri -->
          <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center gap-3.5 mb-4">
              <div class="w-12 h-12 rounded-xl bg-[#0E7A4E] text-white flex items-center justify-center font-black">
                <svg class="w-6 h-6 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/></svg>
              </div>
              <div>
                <h3 class="text-[21px] font-black text-[#063826]">Kelas Khusus Perempuan</h3>
                <span class="text-[13px] font-bold text-[#0E7A4E]">Santun, Percaya Diri &amp; Berprestasi</span>
              </div>
            </div>
            <p class="text-[15px] text-[#55705F] leading-relaxed mb-5">
              Suasana belajar yang aman, suportif, dan ramah muslimah. Menumbuhkan rasa percaya diri, kecerdasan emosional, kecakapan literasi, serta keanggunan akhlak santriwati.
            </p>
            <ul class="space-y-2 text-[14px] text-[#0E241B]">
              <li class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-[#D9F2E3] text-[#0E7A4E] flex items-center justify-center text-xs font-black">✓</span>
                <span>Suasana belajar nyaman tanpa sekat kecanggungan</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-[#D9F2E3] text-[#0E7A4E] flex items-center justify-center text-xs font-black">✓</span>
                <span>Bimbingan kepribadian muslimah &amp; keputrian</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-[#D9F2E3] text-[#0E7A4E] flex items-center justify-center text-xs font-black">✓</span>
                <span>Akselerasi tahfidz Qur'an &amp; publik speaking</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. EDITORIAL NUMBERED ROWS (Kenapa SMP IT BCA) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="max-w-[700px] mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            Nilai Keunggulan
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            Alqur'an &amp; Akhlaknya Terpuji, <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Prestasinya Teruji</span>
          </h2>
          <p class="text-[#55705F] text-[16px] mt-2.5">
            Tagline kami bukan sekadar semboyan — ini yang kami terapkan secara nyata dalam keseharian santri.
          </p>
        </div>

        <div class="divide-y divide-[#D1E7DD] border-y border-[#D1E7DD]">
          
          <!-- Row 1 -->
          <NuxtLink to="/smp/akademik" class="rv group flex flex-col md:flex-row md:items-center justify-between py-7 px-4 hover:bg-[#E4F4EC]/60 rounded-2xl transition-all">
            <div class="flex items-start md:items-center gap-6">
              <span class="text-[38px] md:text-[46px] font-black text-[#A8D9BE] group-hover:text-[#0E7A4E] transition-colors leading-none">01</span>
              <div>
                <h3 class="text-[19px] font-black text-[#063826] group-hover:text-[#0E7A4E] transition-colors mb-1">
                  Satu-satunya Berbasis Kelas Gender di Babelan
                </h3>
                <p class="text-[14.5px] text-[#55705F] max-w-2xl">
                  Kelas khusus putra dan putri dengan metode CTL — proses belajar lebih fokus, efisien, dan pergaulan remaja lebih terjaga secara syar'i.
                </p>
              </div>
            </div>
            <span class="text-[#0E7A4E] font-bold text-[14px] flex items-center gap-1.5 mt-4 md:mt-0 group-hover:translate-x-2 transition-transform">
              Pelajari Lebih Lanjut →
            </span>
          </NuxtLink>

          <!-- Row 2 -->
          <NuxtLink to="/smp/akademik" class="rv group flex flex-col md:flex-row md:items-center justify-between py-7 px-4 hover:bg-[#E4F4EC]/60 rounded-2xl transition-all">
            <div class="flex items-start md:items-center gap-6">
              <span class="text-[38px] md:text-[46px] font-black text-[#A8D9BE] group-hover:text-[#0E7A4E] transition-colors leading-none">02</span>
              <div>
                <h3 class="text-[19px] font-black text-[#063826] group-hover:text-[#0E7A4E] transition-colors mb-1">
                  Tahfidz Yanbu'a &amp; Ibadah Sebagai Budaya
                </h3>
                <p class="text-[14.5px] text-[#55705F] max-w-2xl">
                  Bimbingan baca Al-Qur'an bersanad, sima'an bulanan, sholat berjamaah lima waktu, dan pendalaman fiqih praktis harian.
                </p>
              </div>
            </div>
            <span class="text-[#0E7A4E] font-bold text-[14px] flex items-center gap-1.5 mt-4 md:mt-0 group-hover:translate-x-2 transition-transform">
              Pelajari Lebih Lanjut →
            </span>
          </NuxtLink>

          <!-- Row 3 -->
          <NuxtLink to="/smp/akademik" class="rv group flex flex-col md:flex-row md:items-center justify-between py-7 px-4 hover:bg-[#E4F4EC]/60 rounded-2xl transition-all">
            <div class="flex items-start md:items-center gap-6">
              <span class="text-[38px] md:text-[46px] font-black text-[#A8D9BE] group-hover:text-[#0E7A4E] transition-colors leading-none">03</span>
              <div>
                <h3 class="text-[19px] font-black text-[#063826] group-hover:text-[#0E7A4E] transition-colors mb-1">
                  Bahasa &amp; Public Speaking Kelas Dunia
                </h3>
                <p class="text-[14.5px] text-[#55705F] max-w-2xl">
                  Kolaborasi program unggul bahasa bersama School @america — melatih santri percaya diri menyampaikan gagasan di panggung publik.
                </p>
              </div>
            </div>
            <span class="text-[#0E7A4E] font-bold text-[14px] flex items-center gap-1.5 mt-4 md:mt-0 group-hover:translate-x-2 transition-transform">
              Pelajari Lebih Lanjut →
            </span>
          </NuxtLink>

          <!-- Row 4 -->
          <NuxtLink to="/smp/akademik" class="rv group flex flex-col md:flex-row md:items-center justify-between py-7 px-4 hover:bg-[#E4F4EC]/60 rounded-2xl transition-all">
            <div class="flex items-start md:items-center gap-6">
              <span class="text-[38px] md:text-[46px] font-black text-[#A8D9BE] group-hover:text-[#0E7A4E] transition-colors leading-none">04</span>
              <div>
                <h3 class="text-[19px] font-black text-[#063826] group-hover:text-[#0E7A4E] transition-colors mb-1">
                  Bakat &amp; Jiwa Wirausaha Terasah
                </h3>
                <p class="text-[14.5px] text-[#55705F] max-w-2xl">
                  Talent Development Program dan Entrepreneur Day, plus 13 pilihan ekstrakurikuler untuk menyalurkan minat dan bakat santri.
                </p>
              </div>
            </div>
            <span class="text-[#0E7A4E] font-bold text-[14px] flex items-center gap-1.5 mt-4 md:mt-0 group-hover:translate-x-2 transition-transform">
              Pelajari Lebih Lanjut →
            </span>
          </NuxtLink>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. KABAR TERBARU & HIGHLIGHT BERITA -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E0ECE6]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
              Kabar Sekolah
            </span>
            <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
              Berita &amp; <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Artikel Terkini</span>
            </h2>
          </div>
          <NuxtLink to="/smp/berita" class="text-[14px] font-bold text-[#0E7A4E] hover:underline flex items-center gap-1">
            Lihat Semua Berita →
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <NuxtLink to="/smp/berita" class="rv group bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#92400E] bg-[#FEF3C7] py-1 px-3 rounded-full mb-3 inline-block">
                Pengumuman Resmi
              </span>
              <h3 class="text-[17px] font-black text-[#063826] group-hover:text-[#0E7A4E] transition-colors mb-2">
                SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran
              </h3>
              <p class="text-[13.5px] text-[#55705F] leading-relaxed mb-4">
                Penerimaan murid baru tahun ajaran 2027/2028 resmi dibuka dengan biaya registrasi hanya Rp50.000.
              </p>
            </div>
            <span class="text-[12px] font-bold text-[#55705F] border-t border-[#D1E7DD] pt-3 block">
              4 Oktober 2026 · Panitia SPMB
            </span>
          </NuxtLink>

          <NuxtLink to="/smp/berita" class="rv group bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#0B6B45] bg-[#D9F2E3] py-1 px-3 rounded-full mb-3 inline-block">
                Berita Sekolah
              </span>
              <h3 class="text-[17px] font-black text-[#063826] group-hover:text-[#0E7A4E] transition-colors mb-2">
                Milad ke-6: Enam Tahun SMP IT Bina Cendekia Assalam
              </h3>
              <p class="text-[13.5px] text-[#55705F] leading-relaxed mb-4">
                Perayaan enam tahun berdirinya sekolah — dari angkatan pertama hingga mendidik lebih dari 1000 santri alumni.
              </p>
            </div>
            <span class="text-[12px] font-bold text-[#55705F] border-t border-[#D1E7DD] pt-3 block">
              16 April 2026 · Humas Sekolah
            </span>
          </NuxtLink>

          <NuxtLink to="/smp/berita" class="rv group bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#4338CA] bg-[#E0E7FF] py-1 px-3 rounded-full mb-3 inline-block">
                Artikel Edukasi
              </span>
              <h3 class="text-[17px] font-black text-[#063826] group-hover:text-[#0E7A4E] transition-colors mb-2">
                Mengenal Sekolah Berbasis Kelas Gender
              </h3>
              <p class="text-[13.5px] text-[#55705F] leading-relaxed mb-4">
                Putra belajar dengan putra, putri dengan putri — bagaimana konsep kelas gender membuat proses KBM lebih optimal.
              </p>
            </div>
            <span class="text-[12px] font-bold text-[#55705F] border-t border-[#D1E7DD] pt-3 block">
              28 September 2026 · Tim Akademik
            </span>
          </NuxtLink>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 6. SECTION CTA PENDAFTARAN SPMB (Forest Green Gradient) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="bg-[radial-gradient(700px_400px_at_85%_100%,rgba(52,199,123,0.45),transparent_65%),linear-gradient(135deg,#0A4A30_0%,#063826_55%,#052E22_100%)] text-white rounded-[24px] p-7 sm:p-9 md:p-12 shadow-[0_24px_60px_rgba(6,56,38,0.2)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
          
          <div class="lg:col-span-8 relative z-10">
            <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#FCD34D] uppercase mb-3">Penerimaan Murid Baru</span>
            <h2 class="text-[clamp(26px,4vw,40px)] font-black tracking-[-0.02em] leading-tight mb-4">
              Amankan kursimu.<br><span class="bg-gradient-to-r from-[#7EE2AE] to-[#FCD34D] bg-clip-text text-transparent">7 rombel</span>, 3 gelombang.
            </h2>
            <p class="text-[#C4E4D4] text-[15.5px] leading-relaxed mb-8 max-w-[560px]">
              SPMB 2027/2028 telah dibuka dengan biaya registrasi hanya <strong class="text-white">Rp50.000</strong> (gratis bagi siswa berprestasi &amp; yatim). Tersedia beasiswa Milad BCA ke-6.
            </p>

            <div class="flex flex-wrap items-center gap-4 mb-8">
              <NuxtLink 
                to="/smp/spmb" 
                class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-7 rounded-[14px] text-[#3D2C00] bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all"
              >
                Daftar SPMB 2027/2028
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </NuxtLink>

              <NuxtLink 
                to="/smp/kontak" 
                class="text-[#C4E4D4] hover:text-white font-bold text-[14.5px] underline underline-offset-4 transition-colors"
              >
                atau hubungi panitia
              </NuxtLink>
            </div>

            <div class="flex flex-wrap items-center gap-5 text-[13px] font-bold text-[#A9D4BC]">
              <span class="inline-flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#4ADE80] stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                Beasiswa Milad BCA ke-6
              </span>
              <span class="inline-flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#4ADE80] stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                Respon &lt; 1×24 jam
              </span>
            </div>
          </div>

          <div class="lg:col-span-4 relative z-10 flex justify-center">
            <div class="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md text-center text-white w-full max-w-xs">
              <span class="text-[12px] font-bold text-[#FCD34D] block uppercase tracking-wider mb-1">Sekretariat SPMB</span>
              <strong class="text-[18px] font-black block mb-2">Bina Cendekia Assalam</strong>
              <p class="text-[13px] text-[#C4E4D4] leading-snug mb-4">
                Ujung Harapan, Musholla Assalam, Babelan, Kab. Bekasi
              </p>
              <a 
                href="https://wa.me/6281210949978" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] text-white font-bold text-[13px] shadow-sm hover:brightness-105 transition-all"
              >
                Chat Panitia WhatsApp
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>

  </div>
</template>
