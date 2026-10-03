<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-[#0A2A5C] via-[#123E85] to-[#1B5FD9] text-white pt-[80px] lg:pt-[100px]" id="home">
    <!-- Background Ambient Glow & Patterns -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute w-[420px] h-[420px] bg-[#4C8DFF]/40 rounded-full blur-[80px] -top-[140px] -right-[100px]"></div>
      <div class="absolute w-[340px] h-[340px] bg-[#0EA5E9]/30 rounded-full blur-[70px] -bottom-[120px] -left-[80px]"></div>
      <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <img src="/asset/logo.png" alt="Watermark" class="absolute -right-[40px] -bottom-[60px] w-[340px] opacity-[0.06] grayscale brightness-200">
    </div>

    <div class="relative w-[min(1180px,100%-40px)] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-[36px] items-center pt-[36px] pb-[48px] lg:pt-[48px] lg:pb-[72px]">
      <!-- Hero Left Column: Copywriting & CTAs -->
      <div>
        <!-- SPMB Badge -->
        <div class="inline-flex items-center gap-[9px] bg-white/12 border border-white/25 py-[8px] px-[16px] rounded-full text-[13px] font-semibold backdrop-blur-md mb-[20px] shadow-sm">
          <span class="w-[9px] h-[9px] rounded-full bg-[#4ADE80] animate-pulse"></span>
          <span>SPMB 2026/2027 Telah Dibuka</span>
        </div>

        <!-- Main Heading -->
        <h1 class="text-[clamp(30px,6.5vw,52px)] font-extrabold tracking-[-1px] leading-[1.14] mb-[18px]">
          Sekolah IT Berbasis <span class="bg-gradient-to-r from-[#FDE68A] to-[#F0B429] bg-clip-text text-transparent">IMTAQ &amp; IPTEK</span> di Babelan, Bekasi
        </h1>

        <!-- Subtitle -->
        <p class="text-[#C9D9F5] text-[clamp(15px,2.5vw,17.5px)] leading-[1.6] max-w-[560px] mb-[10px]">
          SMP IT Bina Cendekia Assalam &amp; SMK IT Attaqwa 9 — mencetak generasi yang benar, pintar, dan terampil, siap kerja, kuliah, maupun berwirausaha.
        </p>

        <p class="text-[#FDE68A] font-bold text-[clamp(14px,2.3vw,16.5px)] mb-[28px] tracking-[0.2px]">
          "Benar, Pintar dan Terampil."
        </p>

        <!-- Hero Action Buttons -->
        <div class="flex flex-wrap items-center gap-[12px] mb-[36px]">
          <NuxtLink 
            to="/spmb" 
            class="inline-flex items-center justify-center gap-[9px] font-extrabold text-[15px] py-[13px] px-[26px] rounded-[14px] text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] shadow-[0_12px_26px_rgba(240,180,41,.35)] transition-all duration-200 hover:shadow-[0_16px_34px_rgba(240,180,41,.45)] hover:-translate-y-[2px] active:scale-95"
          >
            <span>Daftar SPMB 2026/2027</span>
            <svg class="ai w-[17px] h-[17px]"><use href="#i-arrow-r"/></svg>
          </NuxtLink>

          <a 
            href="#profil" 
            class="inline-flex items-center justify-center font-bold text-[15px] py-[13px] px-[24px] rounded-[14px] text-white bg-white/15 border border-white/30 backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:border-white/40 hover:-translate-y-[1px]"
          >
            Lihat Profil Sekolah
          </a>
        </div>

        <!-- Hero Stats Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-[12px] max-w-[560px] lg:max-w-none">
          <div class="bg-white/10 border border-white/15 rounded-[14px] p-[16px] backdrop-blur-md">
            <b class="block text-[clamp(22px,4vw,28px)] font-extrabold tracking-[-0.5px]">
              316<span class="text-[#F0B429]">+</span>
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">Siswa Aktif</span>
          </div>
          <div class="bg-white/10 border border-white/15 rounded-[14px] p-[16px] backdrop-blur-md">
            <b class="block text-[clamp(22px,4vw,28px)] font-extrabold tracking-[-0.5px] text-[#F0B429]">
              A
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">Akreditasi Sekolah</span>
          </div>
          <div class="bg-white/10 border border-white/15 rounded-[14px] p-[16px] backdrop-blur-md">
            <b class="block text-[clamp(22px,4vw,28px)] font-extrabold tracking-[-0.5px]">
              13
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">Ekstrakurikuler</span>
          </div>
          <div class="bg-white/10 border border-white/15 rounded-[14px] p-[16px] backdrop-blur-md">
            <b class="block text-[clamp(22px,4vw,28px)] font-extrabold tracking-[-0.5px]">
              12
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">Fasilitas Unggulan</span>
          </div>
        </div>
      </div>

      <!-- Hero Right Column: Mockup Visual & Floating Chips -->
      <div class="relative hidden lg:block">
        <div class="relative bg-white/95 backdrop-blur-md rounded-[24px] p-[14px] shadow-[0_24px_60px_rgba(10,42,92,.35)] text-[#0F1E38] rotate-[1.5deg] transition-transform hover:rotate-0 duration-300">
          <!-- Mockup Card Header -->
          <div class="flex items-center gap-[12px] p-[12px_16px] border-b border-[#E3EAF7]">
            <img src="/asset/logo.png" alt="Logo" class="w-[44px] h-[52px] object-contain">
            <div>
              <b class="text-[15.5px] text-[#0F1E38] block font-bold">SMK IT Attaqwa 9</b>
              <small class="text-[#5A6B8C] text-[12px]">Babelan — Kab. Bekasi</small>
            </div>
            <span class="ml-auto bg-[#E7F7EE] text-[#16A34A] text-[11.5px] font-extrabold py-[6px] px-[12px] rounded-full">
              ✓ Akreditasi A
            </span>
          </div>

          <!-- Mockup Bento Grid -->
          <div class="grid grid-cols-2 gap-[10px] p-[10px]">
            <div class="bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm">
              <svg class="ai w-[26px] h-[26px] absolute top-[12px] right-[12px] opacity-60"><use href="#i-cpu"/></svg>
              <b class="text-[14.5px] font-bold leading-[1.3] relative">BLK Komunitas IT</b>
              <small class="text-[11.5px] opacity-90 relative">Link &amp; match DUDIKA</small>
            </div>
            <div class="bg-gradient-to-br from-[#0EA5E9] to-[#22D3EE] rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm">
              <svg class="ai w-[26px] h-[26px] absolute top-[12px] right-[12px] opacity-60"><use href="#i-bookopen"/></svg>
              <b class="text-[14.5px] font-bold leading-[1.3] relative">Tahfidz Qur'an</b>
              <small class="text-[11.5px] opacity-90 relative">Tahsin &amp; tahfidz rutin</small>
            </div>
            <div class="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm">
              <svg class="ai w-[26px] h-[26px] absolute top-[12px] right-[12px] opacity-60"><use href="#i-users"/></svg>
              <b class="text-[14.5px] font-bold leading-[1.3] relative">316+ Siswa</b>
              <small class="text-[11.5px] opacity-90 relative">SMP &amp; SMK</small>
            </div>
            <div class="bg-gradient-to-br from-[#059669] to-[#34D399] rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm">
              <svg class="ai w-[26px] h-[26px] absolute top-[12px] right-[12px] opacity-60"><use href="#i-school"/></svg>
              <b class="text-[14.5px] font-bold leading-[1.3] relative">Kurikulum Merdeka</b>
              <small class="text-[11.5px] opacity-90 relative">+ K13 Terintegrasi</small>
            </div>
          </div>
        </div>

        <!-- Floating Chips -->
        <div class="absolute -top-[16px] -left-[14px] bg-white rounded-[14px] shadow-[0_18px_40px_rgba(10,42,92,.22)] py-[10px] px-[14px] flex items-center gap-[10px] text-[13px] font-extrabold text-[#0F1E38] -rotate-[3deg] animate-[aiFloat_5s_ease-in-out_infinite]">
          <svg class="ai w-[20px] h-[20px] text-[#1B5FD9]"><use href="#i-shield"/></svg>
          <span>Unggul dalam IMTAQ</span>
        </div>

        <div class="absolute bottom-[22px] -right-[10px] bg-white rounded-[14px] shadow-[0_18px_40px_rgba(10,42,92,.22)] py-[10px] px-[14px] flex items-center gap-[10px] text-[13px] font-extrabold text-[#0F1E38] rotate-[2deg] animate-[aiFloat_5s_ease-in-out_infinite_2.5s]">
          <svg class="ai w-[20px] h-[20px] text-[#0EA5E9]"><use href="#i-laptop"/></svg>
          <span>Terdepan dalam IPTEK</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes aiFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}
</style>
