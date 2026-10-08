<script setup lang="ts">
import { useGsapReveal } from "~/composables/useGsapReveal";
useGsapReveal();
definePageMeta({ layout: 'smk' })
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO (Dark Navy Gradient) -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[170px] sm:pt-[180px] md:pt-[190px] lg:pt-[205px] pb-[60px] lg:pb-[75px] bg-[radial-gradient(900px_480px_at_85%_-10%,rgba(43,124,216,0.55),transparent_60%),linear-gradient(135deg,#0C2C61_0%,#0A2A5C_55%,#061A3E_100%)]">
      <!-- Ambient Dot Grid -->
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:26px_26px] pointer-events-none"></div>

      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-2 text-[13px] text-[#A9BDDD] font-medium mb-3.5">
          <NuxtLink to="/smk" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <span class="text-[#7DB9F5]">/</span>
          <span class="text-[#FCD34D] font-bold">Tentang Sekolah</span>
        </div>

        <!-- Title & Subtitle -->
        <div class="max-w-[780px]">
          <span class="inline-flex items-center gap-2 bg-[#F59E0B]/15 border border-[#F59E0B]/50 text-[#FCD34D] text-[12.5px] font-bold py-1.5 px-3.5 rounded-full mb-3.5">
            <i class="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></i>
            Profil &amp; Identitas Lembaga
          </span>
          <h1 class="text-[clamp(32px,4.8vw,50px)] font-black tracking-[-0.02em] leading-[1.15] mb-3 text-white">
            Mengenal Lebih Dekat <br class="hidden sm:inline">
            <span class="bg-gradient-to-r from-[#7DB9F5] via-[#A8C8FA] to-[#FCD34D] bg-clip-text text-transparent">SMK IT Attaqwa 9</span>
          </h1>
          <p class="text-[#C9D8F2] text-[16px] md:text-[17.5px] leading-relaxed">
            Pusat pendidikan vokasi unggulan berlandaskan nilai pesantren — mencetak santri profesional yang benar akhlaknya, pintar ilmunya, dan terampil keahliannya.
          </p>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. PROFIL SEKOLAH & GEDUNG SHOWCASE (Modern Bento + Image Frame) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF] relative overflow-hidden">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Section Header -->
        <div class="max-w-[720px] mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            Profil Sekolah
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Vokasi Modern, <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Karakter Pesantren</span>
          </h2>
        </div>

        <!-- 2 Kolom: Narasi & Image Showcase Frame -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          
          <!-- Kolom Kiri: Narasi & Poin Unggulan -->
          <div class="lg:col-span-6 text-[#5A6B8C] text-[16px] leading-relaxed space-y-5">
            <p>
              <b class="text-[#061A3E] font-extrabold">SMK IT Attaqwa 9</b> adalah institusi pendidikan menengah kejuruan berbasis pesantren di bawah naungan <b class="text-[#0A2A5C]">Yayasan Attaqwa Pusat</b>, berlokasi strategis di Ujung Harapan, Babelan, Kabupaten Bekasi.
            </p>
            <p>
              Berdiri sejak tahun 2015 dan memegang predikat <b class="text-[#1B5FD9] font-black">Akreditasi A (Unggul)</b> dari BAN-SM, kami memadukan kurikulum vokasi berbasis industri (*Link and Match*) dengan pembinaan akhlak Qur'ani yang intensif dan pembiasaan ibadah harian.
            </p>

            <!-- 3 Mini Feature Points -->
            <div class="pt-2 space-y-3">
              <div class="flex items-start gap-3.5 p-3.5 rounded-[14px] bg-white border border-[#E2ECF8] shadow-sm">
                <div class="w-10 h-10 rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5z"/></svg>
                </div>
                <div>
                  <h4 class="text-[14.5px] font-extrabold text-[#061A3E]">Gedung BLK Komunitas Kemnaker RI</h4>
                  <p class="text-[13px] text-[#64748B]">Laboratorium &amp; bengkel mandiri untuk uji kompetensi berstandar industri.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5 p-3.5 rounded-[14px] bg-white border border-[#E2ECF8] shadow-sm">
                <div class="w-10 h-10 rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
                <div>
                  <h4 class="text-[14.5px] font-extrabold text-[#061A3E]">Kemitraan Industri &amp; Penyaluran Kerja</h4>
                  <p class="text-[13px] text-[#64748B]">Kerja sama intensif dengan DUDIKA, kelas industri, dan sertifikasi BNSP.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5 p-3.5 rounded-[14px] bg-white border border-[#E2ECF8] shadow-sm">
                <div class="w-10 h-10 rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
                </div>
                <div>
                  <h4 class="text-[14.5px] font-extrabold text-[#061A3E]">Karakter Qur'ani &amp; Tahfidz Intensif</h4>
                  <p class="text-[13px] text-[#64748B]">Sima'an Al-Qur'an terprogram, sholat berjamaah, dan pembiasaan adab mulia.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Kolom Kanan: Image Showcase Frame -->
          <div class="lg:col-span-6">
            <div class="group relative bg-white border border-[#E2ECF8] rounded-[24px] p-3 shadow-[0_12px_40px_rgba(10,42,92,0.08)] hover:shadow-[0_20px_50px_rgba(10,42,92,0.14)] transition-all duration-300">
              
              <!-- Image Container -->
              <div class="relative aspect-[16/10] rounded-[18px] overflow-hidden bg-[#0A2A5C]">
                <img 
                  src="/asset/SMK/gedung-smk.jpg" 
                  alt="Gedung Kampus SMK IT Attaqwa 9 Babelan Bekasi" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/85 via-transparent to-black/20"></div>

                <!-- Floating Location Tag Top-Left -->
                <div class="absolute top-4 left-4">
                  <span class="inline-flex items-center gap-1.5 text-[11.5px] font-extrabold py-1.5 px-3.5 rounded-full bg-white/90 backdrop-blur-md text-[#0A2A5C] shadow-sm">
                    <svg class="w-3.5 h-3.5 text-[#1B5FD9] stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 7.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                    Ujung Harapan, Babelan
                  </span>
                </div>

                <!-- Floating Caption Bottom-Left -->
                <div class="absolute bottom-4 left-4 right-4 text-white">
                  <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#FCD34D] block mb-1">Kampus Terpadu</span>
                  <h3 class="text-[17px] font-black leading-snug">Gedung Pembelajaran &amp; Balai Latihan Kerja Komunitas</h3>
                  <p class="text-[12.5px] text-[#C9D8F2] mt-0.5">Lingkungan asri, kondusif, dan ramah teknologi di bawah naungan Yayasan Attaqwa Pusat.</p>
                </div>
              </div>

              <!-- Subtitle Bar Below Image -->
              <div class="flex items-center justify-between px-3 pt-3 pb-1 text-[12px] text-[#64748B] font-medium">
                <span>Dokumentasi Kampus SMK IT Attaqwa 9</span>
                <span class="text-[#1B5FD9] font-bold">Terakreditasi A BAN-SM</span>
              </div>

            </div>
          </div>

        </div>

        <!-- 4 Bento Grid Stats Tiles -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          
          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 sm:p-6 shadow-[0_6px_25px_rgba(10,42,92,0.05)] hover:border-[#1B5FD9]/40 hover:-translate-y-1 transition-all duration-200">
            <div class="w-10 h-10 rounded-[12px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center font-bold mb-3">
              <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <b class="block text-[28px] sm:text-[32px] font-black text-[#0A2A5C] leading-none mb-1.5">2015</b>
            <span class="text-[13px] font-extrabold text-[#061A3E] block mb-1">Tahun Berdiri</span>
            <p class="text-[12px] text-[#64748B] leading-relaxed">Izin 503.15/54/XII/SK-SMK/BPMPPT/2015</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 sm:p-6 shadow-[0_6px_25px_rgba(10,42,92,0.05)] hover:border-[#1B5FD9]/40 hover:-translate-y-1 transition-all duration-200">
            <div class="w-10 h-10 rounded-[12px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center font-bold mb-3">
              <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5z"/><path d="M9 11.8l2.2 2.2 4-4.2"/></svg>
            </div>
            <b class="block text-[28px] sm:text-[32px] font-black text-[#0A2A5C] leading-none mb-1.5">A</b>
            <span class="text-[13px] font-extrabold text-[#061A3E] block mb-1">Akreditasi BAN-SM</span>
            <p class="text-[12px] text-[#64748B] leading-relaxed">SK No. 02.00/203/SK/BAN-SM/XII/2018</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 sm:p-6 shadow-[0_6px_25px_rgba(10,42,92,0.05)] hover:border-[#1B5FD9]/40 hover:-translate-y-1 transition-all duration-200">
            <div class="w-10 h-10 rounded-[12px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center font-bold mb-3">
              <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 12h10M7 17h6"/></svg>
            </div>
            <b class="block text-[24px] sm:text-[28px] font-black text-[#0A2A5C] leading-none mb-1.5 tracking-tight">69940449</b>
            <span class="text-[13px] font-extrabold text-[#061A3E] block mb-1">NPSN Kemendikbud</span>
            <p class="text-[12px] text-[#64748B] leading-relaxed">Terdaftar resmi skala nasional</p>
          </div>

          <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 sm:p-6 shadow-[0_6px_25px_rgba(10,42,92,0.05)] hover:border-[#1B5FD9]/40 hover:-translate-y-1 transition-all duration-200">
            <div class="w-10 h-10 rounded-[12px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center font-bold mb-3">
              <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/><circle cx="16.8" cy="9" r="2.6"/><path d="M16.2 14.3c2.5.4 4.3 2.1 5 5.2"/></svg>
            </div>
            <b class="block text-[28px] sm:text-[32px] font-black text-[#0A2A5C] leading-none mb-1.5">316<small class="text-[#F59E0B] text-[20px] font-bold">+</small></b>
            <span class="text-[13px] font-extrabold text-[#061A3E] block mb-1">Siswa Aktif</span>
            <p class="text-[12px] text-[#64748B] leading-relaxed">Dari 6 konsentrasi keahlian</p>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. VISI & MISI (Modern, Interaktif & Informatif) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7] relative overflow-hidden">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="text-center max-w-[720px] mx-auto mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Arah &amp; Fondasi Strategis
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Visi &amp; <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Misi Lembaga</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16px] md:text-[17px] mt-2.5 leading-relaxed">
            Menjadi pedoman kami dalam mendidik generasi penerus bangsa yang tangguh secara spiritual dan unggul secara vokasi.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          
          <!-- Visi Card (Dark Navy Premium Glassmorphism) -->
          <div class="lg:col-span-5 bg-gradient-to-br from-[#0C2C61] via-[#0A2A5C] to-[#061A3E] text-white rounded-[24px] p-8 md:p-9 shadow-[0_16px_40px_rgba(10,42,92,0.2)] relative overflow-hidden flex flex-col justify-between">
            
            <!-- Ambient Light Beam -->
            <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-[#1B5FD9]/30 rounded-full blur-3xl pointer-events-none"></div>
            
            <!-- Decorative Large Quote Mark -->
            <span class="text-[90px] font-serif text-[#FCD34D]/20 leading-none absolute top-2 right-6 pointer-events-none select-none">&ldquo;</span>

            <div class="relative z-10">
              <div class="inline-flex items-center gap-2 text-[11.5px] font-black tracking-[0.14em] text-[#FCD34D] uppercase bg-white/10 border border-white/20 py-1.5 px-3.5 rounded-full mb-6 backdrop-blur-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
                Visi SMK IT Attaqwa 9
              </div>
              
              <h3 class="text-[22px] sm:text-[24px] font-black leading-[1.35] text-white mb-6">
                "Membentuk Generasi Vokasi Qur'ani yang <em class="not-italic text-[#FCD34D]">Benar</em>, <em class="not-italic text-[#7DB9F5]">Pintar</em>, dan <em class="not-italic text-[#4ADE80]">Terampil</em>."
              </h3>

              <!-- 3 Pilar Penjabaran Visi -->
              <div class="space-y-3 pt-2">
                <div class="flex items-center gap-3 bg-white/10 border border-white/15 rounded-[12px] p-2.5 backdrop-blur-sm">
                  <span class="w-6 h-6 rounded-full bg-[#FCD34D]/20 text-[#FCD34D] flex items-center justify-center text-[12px] font-black shrink-0">✓</span>
                  <span class="text-[13.5px] text-[#E2ECF8] font-semibold"><b class="text-white">Benar:</b> Akhlak karimah &amp; akidah kokoh</span>
                </div>
                <div class="flex items-center gap-3 bg-white/10 border border-white/15 rounded-[12px] p-2.5 backdrop-blur-sm">
                  <span class="w-6 h-6 rounded-full bg-[#7DB9F5]/20 text-[#7DB9F5] flex items-center justify-center text-[12px] font-black shrink-0">✓</span>
                  <span class="text-[13.5px] text-[#E2ECF8] font-semibold"><b class="text-white">Pintar:</b> Wawasan sains &amp; teknologi digital</span>
                </div>
                <div class="flex items-center gap-3 bg-white/10 border border-white/15 rounded-[12px] p-2.5 backdrop-blur-sm">
                  <span class="w-6 h-6 rounded-full bg-[#4ADE80]/20 text-[#4ADE80] flex items-center justify-center text-[12px] font-black shrink-0">✓</span>
                  <span class="text-[13.5px] text-[#E2ECF8] font-semibold"><b class="text-white">Terampil:</b> Kompetensi kejuruan siap kerja</span>
                </div>
              </div>
            </div>

            <div class="relative z-10 mt-8 pt-5 border-t border-white/15 flex items-center justify-between text-[12.5px] text-[#A9BDDD]">
              <span>Yayasan Attaqwa Pusat</span>
              <span class="font-bold text-[#FCD34D]">Babelan, Kab. Bekasi</span>
            </div>

          </div>

          <!-- Misi List (3 Interactive Clean Bento Cards) -->
          <div class="lg:col-span-7 flex flex-col justify-between gap-4">
            
            <!-- Misi 1 -->
            <div class="rv group bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] hover:border-[#1B5FD9]/40 rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] transition-all duration-300 flex items-start gap-4 sm:gap-5">
              <span class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center font-black text-[18px] shrink-0 transition-all duration-300 shadow-sm">
                01
              </span>
              <div class="flex-1">
                <div class="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-[#1B5FD9] tracking-wider mb-1">
                  Kelembagaan &amp; Kualitas
                </div>
                <h4 class="text-[17px] font-extrabold text-[#061A3E] mb-1.5">Lembaga Pendidikan Islam Terpadu &amp; Terpercaya</h4>
                <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">
                  Menjadi lembaga pendidikan Islam terpadu yang <b class="text-[#0A2A5C]">terpercaya</b>, <b class="text-[#0A2A5C]">unggul</b>, dan <b class="text-[#0A2A5C]">agamis</b> dalam pengelolaan tata kelola sekolah yang profesional.
                </p>
              </div>
            </div>

            <!-- Misi 2 -->
            <div class="rv group bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] hover:border-[#1B5FD9]/40 rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] transition-all duration-300 flex items-start gap-4 sm:gap-5">
              <span class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center font-black text-[18px] shrink-0 transition-all duration-300 shadow-sm">
                02
              </span>
              <div class="flex-1">
                <div class="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-[#1B5FD9] tracking-wider mb-1">
                  Keahlian &amp; Kecakapan Hidup
                </div>
                <h4 class="text-[17px] font-extrabold text-[#061A3E] mb-1.5">Membentuk Pribadi Terampil &amp; Mandiri</h4>
                <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">
                  Membentuk pribadi santri yang <b class="text-[#0A2A5C]">terampil</b>, memiliki kecakapan hidup (*life skills*), daya saing industri, serta berjiwa wirausaha tangguh.
                </p>
              </div>
            </div>

            <!-- Misi 3 -->
            <div class="rv group bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] hover:border-[#1B5FD9]/40 rounded-[20px] p-6 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_16px_36px_rgba(10,42,92,0.1)] transition-all duration-300 flex items-start gap-4 sm:gap-5">
              <span class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-gradient-to-br group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white flex items-center justify-center font-black text-[18px] shrink-0 transition-all duration-300 shadow-sm">
                03
              </span>
              <div class="flex-1">
                <div class="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-[#1B5FD9] tracking-wider mb-1">
                  Kompetensi Pendidik
                </div>
                <h4 class="text-[17px] font-extrabold text-[#061A3E] mb-1.5">Peningkatan Profesionalisme Berkelanjutan</h4>
                <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">
                  Meningkatkan <b class="text-[#0A2A5C]">kompetensi dan profesionalisme</b> pendidik serta tenaga kependidikan secara berkala sesuai perkembangan kurikulum vokasi dan teknologi.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. SEJARAH SINGKAT (Modern Connected Stepped Timeline) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF] relative overflow-hidden">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="text-center max-w-[720px] mx-auto mb-14">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Tonggak Sejarah
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Perjalanan <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Tumbuh &amp; Mengabdi</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16px] md:text-[17px] mt-2.5 leading-relaxed">
            Dedikasi berkelanjutan dari langkah awal pendirian hingga menjadi pusat vokasi modern terpercaya di Kabupaten Bekasi.
          </p>
        </div>

        <!-- Connected Stepped Timeline Rail -->
        <div class="relative">
          
          <!-- Connecting Line Desktop -->
          <div class="hidden lg:block absolute top-[44px] left-[60px] right-[60px] h-[3px] bg-gradient-to-r from-[#1B5FD9] via-[#4C8DFF] to-[#F0B429] z-0"></div>

          <!-- 4 Steps Timeline Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            
            <!-- Milestone 1: 2015 -->
            <div class="rv group bg-white border border-[#E2ECF8] rounded-[22px] p-6 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_20px_40px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
              <div>
                <!-- Top Indicator Node -->
                <div class="flex items-center justify-between mb-5">
                  <span class="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#1B5FD9] text-white font-black text-[14px] shadow-[0_6px_16px_rgba(27,95,217,0.35)] group-hover:scale-110 transition-transform">
                    2015
                  </span>
                  <span class="text-[11.5px] font-bold text-[#8FA6CC] bg-[#F1F5F9] px-2.5 py-1 rounded-md">Langkah Awal</span>
                </div>

                <h3 class="text-[18px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Pendirian &amp; Izin Operasional
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                  SMK IT Attaqwa 9 resmi beroperasi dengan izin 503.15/54/XII/SK-SMK/BPMPPT/2015 di bawah Yayasan Attaqwa Pusat.
                </p>
              </div>

              <div class="pt-4 mt-5 border-t border-[#F1F5F9] text-[12px] font-bold text-[#1B5FD9] flex items-center gap-1">
                <span>Izin Resmi BPMPPT</span>
              </div>
            </div>

            <!-- Milestone 2: 2018 -->
            <div class="rv group bg-white border border-[#E2ECF8] rounded-[22px] p-6 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_20px_40px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-5">
                  <span class="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#2B7CD8] text-white font-black text-[14px] shadow-[0_6px_16px_rgba(43,124,216,0.35)] group-hover:scale-110 transition-transform">
                    2018
                  </span>
                  <span class="text-[11.5px] font-bold text-[#1D4ED8] bg-[#DBEAFE] px-2.5 py-1 rounded-md">Akreditasi A</span>
                </div>

                <h3 class="text-[18px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Pengakuan Mutu BAN-SM
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                  Meraih pengakuan akreditasi Unggul (A) dari BAN-SM atas kelengkapan sarana kurikulum dan tata kelola pembelajaran.
                </p>
              </div>

              <div class="pt-4 mt-5 border-t border-[#F1F5F9] text-[12px] font-bold text-[#2B7CD8] flex items-center gap-1">
                <span>Predikat Unggul Nasional</span>
              </div>
            </div>

            <!-- Milestone 3: BLK Komunitas -->
            <div class="rv group bg-white border border-[#E2ECF8] rounded-[22px] p-6 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_20px_40px_rgba(10,42,92,0.12)] hover:border-[#1B5FD9]/40 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-5">
                  <span class="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#0A2A5C] text-[#FCD34D] font-black text-[14px] shadow-[0_6px_16px_rgba(10,42,92,0.35)] group-hover:scale-110 transition-transform">
                    BLK
                  </span>
                  <span class="text-[11.5px] font-bold text-[#0A2A5C] bg-[#E2ECF8] px-2.5 py-1 rounded-md">Kemnaker RI</span>
                </div>

                <h3 class="text-[18px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Gedung BLK Komunitas
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                  Peresmian Balai Latihan Kerja Komunitas Link and Match Kemnaker RI untuk standardisasi praktik bengkel &amp; lab modern.
                </p>
              </div>

              <div class="pt-4 mt-5 border-t border-[#F1F5F9] text-[12px] font-bold text-[#0A2A5C] flex items-center gap-1">
                <span>Standar Sertifikasi Industri</span>
              </div>
            </div>

            <!-- Milestone 4: Kini -->
            <div class="rv group bg-gradient-to-b from-white to-[#F8FAFC] border-2 border-[#1B5FD9]/30 rounded-[22px] p-6 shadow-[0_6px_28px_rgba(27,95,217,0.1)] hover:shadow-[0_20px_45px_rgba(27,95,217,0.18)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-5">
                  <span class="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-[#F0B429] to-[#C98A12] text-white font-black text-[14px] shadow-[0_6px_16px_rgba(240,180,41,0.4)] group-hover:scale-110 transition-transform">
                    Kini
                  </span>
                  <span class="text-[11.5px] font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-md">316+ Santri</span>
                </div>

                <h3 class="text-[18px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Ekosistem Vokasi Digital
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                  Mendidik lebih dari 316 santri di 6 konsentrasi keahlian dengan ujian CBT modern, tahfidz Qur'an, dan bursa kerja khusus.
                </p>
              </div>

              <div class="pt-4 mt-5 border-t border-[#E2ECF8] text-[12px] font-bold text-[#D97706] flex items-center gap-1">
                <span>6 Jurusan &amp; Ujian CBT</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. SAMBUTAN KEPALA SEKOLAH (Modern Portrait Frame + Official Quote) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7] relative overflow-hidden">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header Section -->
        <div class="max-w-[720px] mb-11">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Kepemimpinan Sekolah
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Sambutan <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Kepala Sekolah</span>
          </h2>
        </div>

        <div class="bg-[#F8FAFC] border border-[#E2ECF8] rounded-[24px] p-7 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-[0_12px_40px_rgba(10,42,92,0.06)]">
          
          <!-- Foto Kepala Sekolah Frame -->
          <div class="lg:col-span-4 flex justify-center">
            <div class="relative w-full max-w-[280px]">
              <div class="aspect-[3/4] bg-[#0A2A5C] rounded-[20px] overflow-hidden shadow-[0_12px_30px_rgba(10,42,92,0.18)] border-2 border-white relative group">
                <img 
                  src="/asset/SMK/kepala-sekolah.jpg" 
                  alt="Kepala Sekolah SMK IT Attaqwa 9" 
                  class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-transparent"></div>
                
                <!-- Badge on Photo -->
                <div class="absolute bottom-3 inset-x-3 text-center text-white">
                  <span class="text-[11px] font-extrabold uppercase tracking-wider text-[#FCD34D] block">Kepala Sekolah</span>
                  <span class="text-[14px] font-black">H. Abd. Muiz</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Isi Sambutan Quote -->
          <div class="lg:col-span-8">
            <!-- Label DRAF Sesuai Kontrak Kerja -->
            <div class="inline-flex items-center gap-2 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11.5px] font-extrabold py-1.5 px-3.5 rounded-full mb-5">
              <span class="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></span>
              DRAF — menunggu persetujuan Bpk. Kepala Sekolah
            </div>

            <blockquote class="text-[#0F1E38] text-[15.5px] md:text-[16.5px] leading-relaxed space-y-3.5 mb-7">
              <p class="font-bold text-[#061A3E]">
                Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di SMK IT Attaqwa 9.
              </p>
              <p class="text-[#475569]">
                Kami percaya lulusan vokasi yang hebat bukan hanya yang terampil tangannya, tapi juga yang benar akhlaknya. Karena itu, setiap hari di sekolah ini keterampilan kejuruan berjalan beriringan dengan tahfidz Qur'an, sholat berjamaah, dan pembiasaan adab mulia.
              </p>
              <p class="text-[#475569]">
                Mari bergabung dan bertumbuh bersama — menjadi generasi vokasi Qur'ani yang benar, pintar, dan terampil. Wassalamu'alaikum warahmatullahi wabarakatuh.
              </p>
            </blockquote>

            <div class="flex items-center gap-4 pt-5 border-t border-[#E2ECF8]">
              <div class="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-[#1B5FD9] to-[#0A2A5C] text-white font-black flex items-center justify-center text-[18px] shadow-sm">
                M
              </div>
              <div>
                <b class="block text-[17px] font-black text-[#061A3E]">H. Abd. Muiz</b>
                <span class="text-[13.5px] text-[#64748B] font-medium">Kepala SMK IT Attaqwa 9 · Babelan, Kab. Bekasi</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 6. PRESTASI (Catatan Kebanggaan - Curated State) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="text-center max-w-[720px] mx-auto mb-11">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M8 4h8v4.5a4 4 0 01-8 0V4z"/><path d="M8 5.5H4.5a3.5 3.5 0 003.6 5.5M16 5.5h3.5a3.5 3.5 0 01-3.6 5.5"/><path d="M12 12.5V16M8.5 20h7M10 16.5h4"/></svg>
            Prestasi Santri
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Catatan <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Kebanggaan</span>
          </h2>
          <p class="text-[#5A6B8C] text-[15.5px] mt-2">
            Dokumentasi raihan prestasi akademik, kejuruan, dan keagamaan siswa SMK IT Attaqwa 9.
          </p>
        </div>

        <div class="bg-white border-2 border-dashed border-[#C9DDFB] rounded-[24px] p-10 md:p-12 text-center text-[#5A6B8C] max-w-[800px] mx-auto">
          <div class="w-16 h-16 rounded-full bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path d="M8 4h8v4.5a4 4 0 01-8 0V4z"/><path d="M8 5.5H4.5a3.5 3.5 0 003.6 5.5M16 5.5h3.5a3.5 3.5 0 01-3.6 5.5"/><path d="M12 12.5V16M8.5 20h7M10 16.5h4"/></svg>
          </div>
          <b class="block text-[18px] font-black text-[#061A3E] mb-2">
            Data Prestasi Sedang Dikurasi
          </b>
          <p class="text-[14.5px] leading-relaxed max-w-[520px] mx-auto">
            Daftar lengkap medali LKS, kejuaraan tahfidz, dan kompetisi vokasi sedang dihimpun oleh tim kesiswaan untuk ditampilkan di web resmi.
          </p>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 7. SECTION CTA MURID BARU (Grounded Hero Student Cutout) -->
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
