<template>
  <div class="bg-white border border-[#E3EAF7] rounded-[28px] overflow-hidden shadow-[0_24px_60px_rgba(10,42,92,.12)] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
    <div class="p-[36px_28px] sm:p-[48px_44px] flex flex-col justify-center">
      <div class="inline-flex items-center gap-[8px] bg-[#E8F0FE] text-[#1B5FD9] text-[11.5px] font-extrabold uppercase tracking-[1.5px] py-[6px] px-[14px] rounded-full w-fit mb-[16px]">
        <span class="w-[6px] h-[6px] rounded-full bg-[#1B5FD9]"></span>
        Penerimaan Murid Baru
      </div>
      <h2 class="text-[clamp(24px,3.4vw,36px)] font-extrabold text-[#0A2A5C] tracking-tight leading-[1.2] mb-[12px]">
        Amankan Kursimu.<br>
        <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">7 Rombel</span>, 3 Gelombang.
      </h2>
      <p class="text-[#5A6B8C] text-[15px] sm:text-[16px] leading-[1.6] max-w-[460px] mb-[26px]">
        SPMB 2027/2028 telah dibuka dengan biaya registrasi hanya <b>Rp50.000</b> (gratis bagi siswa berprestasi &amp; yatim). Kuota terbatas hanya 7 rombel.
      </p>
      
      <div class="flex flex-wrap items-center gap-[16px] mb-[22px]">
        <NuxtLink 
          to="/spmb/smk" 
          class="inline-flex items-center gap-[8px] font-extrabold text-[15px] py-[13px] px-[26px] rounded-[14px] text-white bg-gradient-to-r from-[#1B5FD9] to-[#0A2A5C] shadow-[0_10px_24px_rgba(27,95,217,.3)] hover:-translate-y-0.5 transition-all"
        >
          <span>Daftar SPMB 2027/2028</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </NuxtLink>
        <NuxtLink 
          to="/smk/kontak" 
          class="font-bold text-[14.5px] text-[#1B5FD9] hover:underline pb-0.5"
        >
          atau hubungi panitia
        </NuxtLink>
      </div>

      <div class="flex flex-wrap gap-[18px] text-[13px] font-semibold text-[#5A6B8C] pt-[14px] border-t border-[#E3EAF7]">
        <span class="inline-flex items-center gap-[6px]">
          <svg class="w-4 h-4 text-[#16A34A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          Konsultasi jurusan gratis
        </span>
        <span class="inline-flex items-center gap-[6px]">
          <svg class="w-4 h-4 text-[#16A34A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          Respon cepat &lt; 1×24 jam
        </span>
      </div>
    </div>

    <!-- Visual Box / Placeholder Foto Suasana Belajar -->
    <div class="bg-[#E8F0FE] min-h-[300px] flex items-center justify-center p-8 border-t lg:border-t-0 lg:border-l border-[#E3EAF7]">
      <div class="border-2 border-dashed border-[#B9D2F8] rounded-[20px] p-8 text-center flex flex-col items-center justify-center gap-3 bg-white/40 w-full h-full min-h-[260px]">
        <svg class="w-10 h-10 text-[#1B5FD9]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/>
          <circle cx="12" cy="13.5" r="3.4"/>
          <path d="M8.5 7.5L10 5h4l1.5 2.5"/>
        </svg>
        <b class="text-[12px] font-extrabold text-[#0A2A5C] tracking-wider uppercase">FOTO : SUASANA BELAJAR SISWA</b>
        <small class="text-[11.5px] text-[#5A6B8C]">Ganti dengan foto asli siswa SMK IT Attaqwa 9</small>
      </div>
    </div>
  </div>
</template>
