<template>
  <footer class="text-white pt-[56px] pb-[32px] border-t border-white/10 bg-[#071D40]">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-[36px] pb-[40px] border-b border-white/10">
        <!-- Col 1: Identity & Legal -->
        <div>
          <div class="flex items-center gap-[12px] mb-[16px]">
            <img src="/asset/logo.png" alt="Logo Yayasan" class="w-[44px] h-[50px] object-contain">
            <img src="/asset/logosmp.png" alt="Logo Yayasan" class="w-[44px] h-[50px] object-contain">
            
          </div>
          <p class="text-[#C9D9F5] text-[15px] leading-[1.65] max-w-[440px] mb-[18px]">
            SMK rasa pesantren — membentuk generasi vokasi Qur'ani yang benar, pintar, dan terampil. Unggul dalam IMTAQ, terdepan dalam IPTEK.
          </p>
          <div class="inline-block bg-white/10 border border-white/15 rounded-[10px] p-[10px_14px] text-[12px] text-[#C9D9F5]">
            SMK IT Attaqwa 9 - Ujung Harapan, Bekasi
          </div>
        </div>

        <!-- Col 2: Unit Pendidikan & Website -->
        <div>
          <h4 class="text-[14.5px] font-bold text-white uppercase tracking-[1px] mb-[16px]">
            Menu Cepat
          </h4>
          <ul class="space-y-[12px] text-[14px] text-[#C9D9F5]">
            <li>
              <NuxtLink to="/smk/tentang" class="hover:text-white transition-colors block">
                <b class="text-white block">Tentang Kami</b>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/smk/akademik" class="hover:text-white transition-colors block">
                <b class="text-white block">Akademik</b>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/smk/ekstrakurikuler" class="hover:text-white transition-colors block">
                <b class="text-white block">Ekstrakurikuler</b>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/smk/berita" class="hover:text-white transition-colors block">
                <b class="text-white block">Berita &amp; Artikel</b>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/smk/spmb" class="hover:text-white transition-colors block">
                <b class="text-white block">SPMB 2027/2028</b>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/smk/kontak" class="hover:text-white transition-colors block">
                <b class="text-white block">Kontak Kami</b>
              </NuxtLink>
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
              Email: <a href="mailto:smkitattaqwa09@gmail.com" class="text-white hover:underline">smkitattaqwa09@gmail.com</a>
            </p>
            <p class="text-[12.5px] text-[#C9D9F5]/80 pt-[4px]">
              Senin–Kamis: 07.30–14.00 WIB · Sabtu: 07.30–12.00 WIB
            </p>
          </div>
        </div>
      </div>

      <!-- Copyright & Bottom Credit -->
      <div class="pt-[22px] flex flex-col sm:flex-row items-center justify-between gap-[12px] text-[12.5px] text-[#C9D9F5]/70">
        <p>© {{ new Date().getFullYear() }} SMK IT Attaqwa 9. Bagian dari Perguruan Attaqwa di Babelan, Bekasi.</p>
        <p class="text-[#FDE68A] font-semibold">“Unggul dalam IMTAQ, Terdepan dalam IPTEK”</p>
      </div>
    </div>
  </footer>
</template>
