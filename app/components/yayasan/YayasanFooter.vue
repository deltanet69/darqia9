<template>
  <footer class="text-white pt-[56px] pb-[32px] border-t border-white/10" style="background-color: #071D40;">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-[36px] pb-[40px] border-b border-white/10">
        <!-- Col 1: Identity & Legal -->
        <div>
          <div class="flex items-center gap-[12px] mb-[16px]">
            <img src="/asset/logo.png" alt="Logo Yayasan" class="w-[44px] h-[50px] object-contain">
            <img src="/asset/logosmp.png" alt="Logo Yayasan" class="w-[44px] h-[50px] object-contain">
            
          </div>
          <p class="text-[#C9D9F5] text-[15px] leading-[1.65] max-w-[440px] mb-[18px]">
            Lembaga pendidikan Islam terpadu yang menaungi <b>SMP IT Bina Cendekia Assalam</b> dan <b>SMK IT Attaqwa 9</b> dengan komitmen keunggulan iman-takwa dan sains-teknologi.
          </p>
          <div class="inline-block bg-white/10 border border-white/15 rounded-[10px] p-[10px_14px] text-[12px] text-[#C9D9F5]">
            Yayasan Darqia Attaqwa - Ujung Harapan, Bekasi
          </div>
        </div>

        <!-- Col 2: Unit Pendidikan & Website -->
        <div>
          <h4 class="text-[14.5px] font-bold text-white uppercase tracking-[1px] mb-[16px]">
            Satuan Pendidikan
          </h4>
          <ul class="space-y-[12px] text-[14px] text-[#C9D9F5]">
            <li>
              <a href="https://smpitbca.sch.id" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors block">
                <b class="text-white block">SMP IT Bina Cendekia Assalam</b>
                <span class="text-[12px] text-[#C9D9F5]/75">smpitbca.sch.id ↗</span>
              </a>
            </li>
            <li>
              <a href="https://smkitattaqwa9.sch.id" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors block">
                <b class="text-white block">SMK IT Attaqwa 9</b>
                <span class="text-[12px] text-[#C9D9F5]/75">smkitattaqwa9.sch.id ↗</span>
              </a>
            </li>
            <li>
              <a href="https://s.id/home_smpitbca_smkita9" target="_blank" rel="noopener noreferrer" class="text-[#FDE68A] hover:underline font-semibold block mt-[4px]">
                Portal PMB 2027/2028 (7 Rombel) ↗
              </a>
            </li>
          </ul>
        </div>

        <!-- Col 3: Layanan & Jam Operasional -->
        <div>
          <h4 class="text-[14.5px] font-bold text-white uppercase tracking-[1px] mb-[16px]">
            Layanan &amp; Kampus
          </h4>
          <div class="space-y-[10px] text-[13.5px] text-[#C9D9F5] leading-[1.6]">
            <p>
              Ujung Harapan Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17610
            </p>
            <p>
              Telepon: <a href="tel:02188886776" class="text-white font-semibold hover:underline">021-8888 6776</a><br>
              Email: <a href="mailto:yayasandarqia@gmail.com" class="text-white hover:underline">yayasandarqia@gmail.com</a>
            </p>
            <p class="text-[12.5px] text-[#C9D9F5]/80 pt-[4px]">
              Senin–Kamis: 07.30–14.00 WIB · Sabtu: 07.30–12.00 WIB
            </p>
          </div>
        </div>
      </div>

      <!-- Copyright & Bottom Credit -->
      <div class="pt-[22px] flex flex-col sm:flex-row items-center justify-between gap-[12px] text-[12.5px] text-[#C9D9F5]/70">
        <p>© {{ new Date().getFullYear() }} Yayasan Darqia Attaqwa. Bagian dari Perguruan Attaqwa di Babelan, Bekasi.</p>
        <p class="text-[#FDE68A] font-semibold">“Unggul dalam IMTAQ, Terdepan dalam IPTEK”</p>
      </div>
    </div>
  </footer>
</template>
