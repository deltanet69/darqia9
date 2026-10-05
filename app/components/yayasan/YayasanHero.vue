<template>
  <section 
    id="beranda"
    class="relative overflow-hidden text-white pt-[190px] lg:pt-[230px] pb-[56px] lg:pb-[170px] bg-[#0A2A5C] bg-cover bg-center bg-no-repeat bg-[linear-gradient(135deg,rgba(10,42,92,0.95)_40%,rgba(18,62,133,0.88)_80%,rgba(27,95,217,0.85)_100%),url('/bgdarqia.png')]"
  >
    <!-- Background Ambient Glow & Patterns -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute w-[500px] h-[500px] rounded-full blur-[90px] -top-[160px] -right-[100px] bg-[#4C8DFF]/35"></div>
      <div class="absolute w-[400px] h-[400px] rounded-full blur-[80px] -bottom-[120px] -left-[100px] bg-[#0EA5E9]/25"></div>
      <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:28px_28px]"></div>
      
    </div>

    <div class="relative w-[min(1180px,100%-40px)] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-center">
      <!-- Hero Left Column: Copywriting & CTAs -->
      <div>
        <!-- PMB & Location Badge -->
        <div class="inline-flex items-center gap-[9px] py-[8px] px-[16px] rounded-full text-[13px] font-bold mb-[20px] shadow-sm bg-white/[0.14] border border-white/25 backdrop-blur-[8px]">
          <span class="w-[9px] h-[9px] rounded-full bg-[#4ADE80] animate-pulse"></span>
          <span class="text-[#F1F5F9]">Yayasan Darqia Attaqwa · Babelan, Bekasi</span>
        </div>

        <!-- Main Heading -->
        <h1 class="gsap-rv text-[clamp(28px,5.5vw,48px)] font-extrabold tracking-[-1px] leading-[1.16] mb-[18px] text-white">
          Membina Generasi <span class="text-[#F0B429]">Qur’ani</span> untuk Prestasi Tinggi &amp; Akhlak Terpuji
        </h1>

        <!-- Subtitle -->
        <p class="gsap-rv text-[#DCE7FA] text-[clamp(15px,2.2vw,17.5px)] leading-[1.65] max-w-[580px] mb-[12px]">
          Yayasan Darqia Attaqwa menaungi <b>SMP IT Bina Cendekia Assalam</b> dan <b>SMK IT Attaqwa 9</b> — memadukan keunggulan teknologi informatika dengan pembinaan karakter pesantren.
        </p>

        <!-- Tagline quote -->
        <p class="text-[#FDE68A] font-bold text-[clamp(14px,2vw,16px)] mb-[32px] tracking-[0.2px]">
          “Unggul dalam IMTAQ, Terdepan dalam IPTEK”
        </p>

        <!-- Hero Action Buttons -->
        <div class="gsap-rv flex flex-wrap items-center gap-[14px] mb-[40px]">
          <a 
            href="#pmb" 
            class="inline-flex items-center justify-center gap-[9px] font-extrabold text-[15px] py-[13px] px-[26px] rounded-[14px] text-[#3D2C00] transition-all duration-200 hover:-translate-y-[2px] active:scale-95 bg-gradient-to-r from-[#E9A319] to-[#F0B429] shadow-[0_10px_25px_rgba(240,180,41,0.4)]"
          >
            <span>Daftar SPMB 2027/2028</span>
          </a>

          <a 
            href="#sekolah" 
            class="inline-flex items-center justify-center font-bold text-[15px] py-[13px] px-[24px] rounded-[14px] text-white transition-all duration-200 hover:-translate-y-[1px] bg-white/[0.15] border border-white/30 backdrop-blur-[8px]"
          >
            Sekolah Naungan
          </a>
        </div>

        <!-- Hero Stats Cards -->
        <!-- <div class="grid grid-cols-2 sm:grid-cols-4 gap-[12px] max-w-[600px] lg:max-w-none">
          <div class="rounded-[14px] p-[16px] bg-white/10 border border-white/[0.18] backdrop-blur-[8px]">
            <b class="block text-[clamp(22px,3.8vw,28px)] font-extrabold tracking-[-0.5px] text-white">
              2<span class="text-[#F0B429]"> Unit</span>
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">SMP &amp; SMK IT</span>
          </div>
          <div class="rounded-[14px] p-[16px] bg-white/10 border border-white/[0.18] backdrop-blur-[8px]">
            <b class="block text-[clamp(22px,3.8vw,28px)] font-extrabold tracking-[-0.5px] text-[#F0B429]">
              6
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">Program Keahlian</span>
          </div>
          <div class="rounded-[14px] p-[16px] bg-white/10 border border-white/[0.18] backdrop-blur-[8px]">
            <b class="block text-[clamp(22px,3.8vw,28px)] font-extrabold tracking-[-0.5px] text-white">
              7
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">Rombel PMB</span>
          </div>
          <div class="rounded-[14px] p-[16px] bg-white/10 border border-white/[0.18] backdrop-blur-[8px]">
            <b class="block text-[clamp(22px,3.8vw,28px)] font-extrabold tracking-[-0.5px] text-white">
              2020
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">NIB OSS Terbit</span>
          </div>
        </div> -->
      </div>

      <!-- Hero Right Column: Mockup Bento Grid & Floating Chips -->
      <div class="relative hidden lg:block gsap-rv [transition-delay:200ms]">
        <div class="relative rounded-[24px] p-[16px] shadow-[0_24px_60px_rgba(0,0,0,.35)] text-[#0F1E38] rotate-[1.5deg] transition-transform hover:rotate-0 duration-300 bg-white/[0.98] backdrop-blur-[12px]">
          <!-- Mockup Card Header -->
          <div class="flex items-center gap-[12px] p-[10px_14px] border-b border-[#E3EAF7]">
            <img src="/asset/logo.png" alt="Logo" class="w-[42px] h-[50px] object-contain">
            <div>
              <b class="text-[15.5px] text-[#0F1E38] block font-bold">Yayasan Darqia Attaqwa</b>
              <small class="text-[#5A6B8C] text-[12px]">Kampus Assalam Babelan — Bekasi</small>
            </div>
            <span class="ml-auto bg-[#E7F7EE] text-[#16A34A] text-[11.5px] font-extrabold py-[6px] px-[12px] rounded-full border border-[#BBF7D0]">
              Terverifikasi
            </span>
          </div>

          <!-- Mockup Bento Grid -->
          <div class="grid grid-cols-2 gap-[10px] p-[10px]">
            <div class="rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF]">
              <b class="text-[14.5px] font-bold leading-[1.3] relative">SMP IT Bina Cendekia</b>
              <small class="text-[11.5px] opacity-90 relative">Kelas Gender &amp; Yanbu'a</small>
            </div>
            <div class="rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm bg-gradient-to-br from-[#0EA5E9] to-[#22D3EE]">
              <b class="text-[14.5px] font-bold leading-[1.3] relative">SMK IT Attaqwa 9</b>
              <small class="text-[11.5px] opacity-90 relative">6 Keahlian &amp; BLK</small>
            </div>
            <div class="rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
              <b class="text-[14.5px] font-bold leading-[1.3] relative">413+ Siswa Aktif</b>
              <small class="text-[11.5px] opacity-90 relative">Dapodik 2025/2026</small>
            </div>
            <div class="rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm bg-gradient-to-br from-[#059669] to-[#34D399]">
              <b class="text-[14.5px] font-bold leading-[1.3] relative">Diskon s.d 70%</b>
              <small class="text-[11.5px] opacity-90 relative">PMB 2027/2028</small>
            </div>
          </div>
        </div>

        <!-- Floating Chips -->
        <div class="absolute -top-[16px] -left-[14px] bg-white rounded-[14px] shadow-[0_18px_40px_rgba(10,42,92,.22)] py-[10px] px-[14px] flex items-center gap-[10px] text-[13px] font-extrabold text-[#0F1E38] -rotate-[3deg] border border-[#E3EAF7] animate-[aiFloat_5s_ease-in-out_infinite]">
          <span>Unggul dalam IMTAQ</span>
        </div>

        <div class="absolute bottom-[22px] -right-[10px] bg-white rounded-[14px] shadow-[0_18px_40px_rgba(10,42,92,.22)] py-[10px] px-[14px] flex items-center gap-[10px] text-[13px] font-extrabold text-[#0F1E38] rotate-[2deg] border border-[#E3EAF7] animate-[aiFloat_5s_ease-in-out_infinite_2.5s]">
          <span>Terdepan dalam IPTEK</span>
        </div>
      </div>
    </div>
  </section>
</template>
