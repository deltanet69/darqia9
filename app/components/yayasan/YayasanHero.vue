<template>
  <section 
    id="beranda"
    class="relative overflow-hidden text-white pt-[190px] lg:pt-[230px] pb-[56px] lg:pb-[170px]"
    style="background: linear-gradient(135deg, rgba(10,42,92,0.95) 40%, rgba(18,62,133,0.88) 80%, rgba(27,95,217,0.85) 100%), url('/bgdarqia.png') center/cover no-repeat; background-color: #0A2A5C;"
  >
    <!-- Background Ambient Glow & Patterns -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute w-[500px] h-[500px] rounded-full blur-[90px] -top-[160px] -right-[100px]" style="background: rgba(76, 141, 255, 0.35);"></div>
      <div class="absolute w-[400px] h-[400px] rounded-full blur-[80px] -bottom-[120px] -left-[100px]" style="background: rgba(14, 165, 233, 0.25);"></div>
      <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:28px_28px]"></div>
      
    </div>

    <div class="relative w-[min(1180px,100%-40px)] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-center">
      <!-- Hero Left Column: Copywriting & CTAs -->
      <div>
        <!-- PMB & Location Badge -->
        <div class="inline-flex items-center gap-[9px] py-[8px] px-[16px] rounded-full text-[13px] font-bold mb-[20px] shadow-sm" style="background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.25); backdrop-filter: blur(8px);">
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
            class="inline-flex items-center justify-center gap-[9px] font-extrabold text-[15px] py-[13px] px-[26px] rounded-[14px] text-[#3D2C00] transition-all duration-200 hover:-translate-y-[2px] active:scale-95 shadow-lg"
            style="background: linear-gradient(90deg, #E9A319 0%, #F0B429 100%); box-shadow: 0 10px 25px rgba(240, 180, 41, 0.4);"
          >
            <span>Daftar SPMB 2027/2028</span>
          </a>

          <a 
            href="#sekolah" 
            class="inline-flex items-center justify-center font-bold text-[15px] py-[13px] px-[24px] rounded-[14px] text-white transition-all duration-200 hover:-translate-y-[1px]"
            style="background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); backdrop-filter: blur(8px);"
          >
            Sekolah Naungan
          </a>
        </div>

        <!-- Hero Stats Cards -->
        <!-- <div class="grid grid-cols-2 sm:grid-cols-4 gap-[12px] max-w-[600px] lg:max-w-none">
          <div class="rounded-[14px] p-[16px]" style="background: rgba(255, 255, 255, 0.10); border: 1px solid rgba(255, 255, 255, 0.18); backdrop-filter: blur(8px);">
            <b class="block text-[clamp(22px,3.8vw,28px)] font-extrabold tracking-[-0.5px] text-white">
              2<span class="text-[#F0B429]"> Unit</span>
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">SMP &amp; SMK IT</span>
          </div>
          <div class="rounded-[14px] p-[16px]" style="background: rgba(255, 255, 255, 0.10); border: 1px solid rgba(255, 255, 255, 0.18); backdrop-filter: blur(8px);">
            <b class="block text-[clamp(22px,3.8vw,28px)] font-extrabold tracking-[-0.5px] text-[#F0B429]">
              6
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">Program Keahlian</span>
          </div>
          <div class="rounded-[14px] p-[16px]" style="background: rgba(255, 255, 255, 0.10); border: 1px solid rgba(255, 255, 255, 0.18); backdrop-filter: blur(8px);">
            <b class="block text-[clamp(22px,3.8vw,28px)] font-extrabold tracking-[-0.5px] text-white">
              7
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">Rombel PMB</span>
          </div>
          <div class="rounded-[14px] p-[16px]" style="background: rgba(255, 255, 255, 0.10); border: 1px solid rgba(255, 255, 255, 0.18); backdrop-filter: blur(8px);">
            <b class="block text-[clamp(22px,3.8vw,28px)] font-extrabold tracking-[-0.5px] text-white">
              2020
            </b>
            <span class="text-[12.5px] text-[#C9D9F5] font-medium">NIB OSS Terbit</span>
          </div>
        </div> -->
      </div>

      <!-- Hero Right Column: Mockup Bento Grid & Floating Chips -->
      <div class="relative hidden lg:block gsap-rv" style="transition-delay: 200ms">
        <div class="relative rounded-[24px] p-[16px] shadow-[0_24px_60px_rgba(0,0,0,.35)] text-[#0F1E38] rotate-[1.5deg] transition-transform hover:rotate-0 duration-300" style="background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(12px);">
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
            <div class="rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm" style="background: linear-gradient(135deg, #1B5FD9 0%, #4C8DFF 100%);">
              <b class="text-[14.5px] font-bold leading-[1.3] relative">SMP IT Bina Cendekia</b>
              <small class="text-[11.5px] opacity-90 relative">Kelas Gender &amp; Yanbu'a</small>
            </div>
            <div class="rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm" style="background: linear-gradient(135deg, #0EA5E9 0%, #22D3EE 100%);">
              <b class="text-[14.5px] font-bold leading-[1.3] relative">SMK IT Attaqwa 9</b>
              <small class="text-[11.5px] opacity-90 relative">6 Keahlian &amp; BLK</small>
            </div>
            <div class="rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm" style="background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);">
              <b class="text-[14.5px] font-bold leading-[1.3] relative">413+ Siswa Aktif</b>
              <small class="text-[11.5px] opacity-90 relative">Dapodik 2025/2026</small>
            </div>
            <div class="rounded-[16px] p-[16px_14px] text-white min-h-[118px] flex flex-col justify-end relative overflow-hidden shadow-sm" style="background: linear-gradient(135deg, #059669 0%, #34D399 100%);">
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
