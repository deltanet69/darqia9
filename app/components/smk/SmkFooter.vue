<template>
  <footer class="text-white pt-[56px] pb-[32px] border-t border-white/10" style="background-color: #061A3E;">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_0.9fr_1fr_1.1fr] gap-[36px] pb-[40px] border-b border-white/10">
        <!-- Col 1: Profil Singkat -->
        <div>
          <div class="flex items-center gap-[12px] mb-[16px]">
            <img src="/asset/logo.png" alt="Logo SMK IT Attaqwa 9" class="w-[44px] h-[52px] object-contain">
            <div>
              <b class="text-white text-[16px] block leading-tight">SMK IT ATTAQWA 9</b>
              <small class="text-[#FDE68A] text-[11px] font-semibold tracking-wide">Unggul dalam IMTAQ, Terdepan dalam IPTEK</small>
            </div>
          </div>
          <p class="text-[#C9D8F2] text-[14px] leading-[1.65] mb-[16px]">
            SMK rasa pesantren yang membentuk generasi vokasi Qur'ani yang benar, pintar, dan terampil. Link &amp; match dunia industri bersama BLK Komunitas Kemnaker RI.
          </p>
          <div class="inline-block bg-white/10 border border-white/15 rounded-[10px] p-[8px_14px] text-[12px] text-[#C9D8F2]">
            NPSN: <b>69940449</b> • Akreditasi <b>A</b> (BAN-SM)
          </div>
        </div>

        <!-- Col 2: Navigasi Menu -->
        <div>
          <h4 class="text-[14px] font-extrabold text-white uppercase tracking-[1.2px] mb-[16px]">
            Navigasi
          </h4>
          <ul class="space-y-[10px] text-[13.5px] text-[#C9D8F2]">
            <li><NuxtLink to="/smk" class="hover:text-[#FDE68A] transition-colors">Home</NuxtLink></li>
            <li><NuxtLink to="/smk/tentang" class="hover:text-[#FDE68A] transition-colors">Tentang Sekolah</NuxtLink></li>
            <li><NuxtLink to="/smk/akademik" class="hover:text-[#FDE68A] transition-colors">Akademik &amp; Kurikulum</NuxtLink></li>
            <li><NuxtLink to="/smk/ekstrakurikuler" class="hover:text-[#FDE68A] transition-colors">Ekstrakurikuler (13)</NuxtLink></li>
            <li><NuxtLink to="/smk/berita" class="hover:text-[#FDE68A] transition-colors">Berita &amp; Artikel</NuxtLink></li>
            <li><NuxtLink to="/smk/kontak" class="hover:text-[#FDE68A] transition-colors">Kontak &amp; Lokasi</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3: Konsentrasi Keahlian -->
        <div>
          <h4 class="text-[14px] font-extrabold text-white uppercase tracking-[1.2px] mb-[16px]">
            Jurusan Unggulan
          </h4>
          <ul class="space-y-[10px] text-[13.5px] text-[#C9D8F2]">
            <li><NuxtLink to="/smk/akademik" class="hover:text-[#FDE68A] transition-colors block"><b>AKL</b> - Akuntansi Keuangan</NuxtLink></li>
            <li><NuxtLink to="/smk/akademik" class="hover:text-[#FDE68A] transition-colors block"><b>OTKP</b> - Tata Kelola Kantor</NuxtLink></li>
            <li><NuxtLink to="/smk/akademik" class="hover:text-[#FDE68A] transition-colors block"><b>TBSM</b> - Sepeda Motor</NuxtLink></li>
            <li><NuxtLink to="/smk/akademik" class="hover:text-[#FDE68A] transition-colors block"><b>TKR</b> - Kendaraan Ringan</NuxtLink></li>
            <li><NuxtLink to="/smk/akademik" class="hover:text-[#FDE68A] transition-colors block"><b>TKJ</b> - Komputer &amp; Jaringan</NuxtLink></li>
            <li><NuxtLink to="/smk/akademik" class="hover:text-[#FDE68A] transition-colors block"><b>DKV</b> - Desain Visual</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 4: Kontak & SPMB -->
        <div>
          <h4 class="text-[14px] font-extrabold text-white uppercase tracking-[1.2px] mb-[16px]">
            Hubungi Kami
          </h4>
          <div class="space-y-[10px] text-[13.5px] text-[#C9D8F2] leading-[1.6]">
            <p>
              Ujung Harapan, Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17612
            </p>
            <p>
              Telepon: <a href="tel:02188886776" class="text-white font-semibold hover:underline">021-8888 6776</a><br>
              WhatsApp: <a href="https://wa.me/6281210949978" target="_blank" rel="noopener" class="text-white hover:underline">0812-1094-9978</a><br>
              Email: <a href="mailto:smkitattaqwa09@gmail.com" class="text-white hover:underline">smkitattaqwa09@gmail.com</a>
            </p>
            <div class="pt-[6px]">
              <NuxtLink 
                to="/spmb/smk" 
                class="inline-flex items-center gap-2 py-[8px] px-[14px] rounded-[10px] font-bold text-[12.5px] text-[#3D2C00] bg-gradient-to-r from-[#F0B429] to-[#F59E0B] shadow-md hover:brightness-105 transition-all"
              >
                <span>SPMB SMK 2027/2028 (7 Rombel)</span>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-[22px] flex flex-col sm:flex-row items-center justify-between gap-[12px] text-[12.5px] text-[#C9D8F2]/75">
        <p>© {{ new Date().getFullYear() }} SMK IT Attaqwa 9 • Di bawah naungan Yayasan Attaqwa Pusat.</p>
        <p class="text-[#FDE68A] font-semibold">“Unggul dalam IMTAQ, Terdepan dalam IPTEK”</p>
      </div>
    </div>
  </footer>
</template>
