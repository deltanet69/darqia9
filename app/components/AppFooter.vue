<template>
  <!-- ======= FOOTER ======= -->
  <footer class="bg-[#081D42] text-[#B9C8E4] pt-[64px] text-[14px]">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-[32px] lg:gap-[36px] pb-[48px]">
        <!-- Brand Section -->
        <div>
          <div class="flex items-center gap-[13px] mb-[16px]">
            <img src="/asset/logo.png" alt="Logo SMK IT Attaqwa 9" class="w-[48px] h-[56px] object-contain shrink-0">
            <div>
              <b class="text-white text-[17px] block leading-[1.25]">SMK IT Attaqwa 9</b>
              <span class="text-[12px] text-[#8BA4D0]">Unggul dalam IMTAQ, Terdepan dalam IPTEK</span>
            </div>
          </div>
          <p class="max-w-[320px] text-[14px] leading-[1.65] text-[#9CB5DC]">
            "Benar, Pintar dan Terampil." Sekolah vokasi berbasis IMTAQ &amp; IPTEK di Babelan, Kabupaten Bekasi — bagian dari Perguruan Attaqwa.
          </p>
        </div>

        <!-- Navigation Links -->
        <div>
          <h5 class="text-white text-[14px] font-bold mb-[16px] tracking-[0.4px] uppercase">Navigasi</h5>
          <ul class="list-none p-0 m-0 grid gap-[10px]">
            <li><a href="#home" class="hover:text-white transition-colors">Home</a></li>
            <li><a href="#profil" class="hover:text-white transition-colors">Profile</a></li>
            <li><a href="#berita" class="hover:text-white transition-colors">Berita &amp; Artikel</a></li>
            <li><a href="#kegiatan" class="hover:text-white transition-colors">Kegiatan</a></li>
            <li><NuxtLink to="/spmb" class="hover:text-white transition-colors">SPMB</NuxtLink></li>
          </ul>
        </div>

        <!-- Digital Services -->
        <div>
          <h5 class="text-white text-[14px] font-bold mb-[16px] tracking-[0.4px] uppercase">Layanan Digital</h5>
          <ul class="list-none p-0 m-0 grid gap-[10px]">
            <li>
              <NuxtLink to="/cbt" class="inline-flex items-center gap-[6px] hover:text-white transition-colors">
                <svg class="ai w-[14px] h-[14px] shrink-0"><use href="#i-monitor"/></svg>
                <span>CBT / Ujian Online</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/admin" class="inline-flex items-center gap-[6px] hover:text-white transition-colors">
                <svg class="ai w-[14px] h-[14px] shrink-0"><use href="#i-briefcase"/></svg>
                <span>Admin Portal</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/spmb" class="inline-flex items-center gap-[6px] hover:text-white transition-colors">
                <svg class="ai w-[14px] h-[14px] shrink-0"><use href="#i-cap"/></svg>
                <span>Portal PMB Online</span>
              </NuxtLink>
            </li>
            <li>
              <a href="https://www.instagram.com/smkit.attaqwa9" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-[6px] hover:text-white transition-colors">
                <svg class="ai w-[14px] h-[14px] shrink-0"><use href="#i-ig"/></svg>
                <span>Instagram Resmi</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h5 class="text-white text-[14px] font-bold mb-[16px] tracking-[0.4px] uppercase">Kontak</h5>
          <ul class="list-none p-0 m-0 grid gap-[10px]">
            <li class="flex items-start gap-[8px]">
              <svg class="ai w-[14px] h-[14px] shrink-0 mt-[4px]"><use href="#i-pin"/></svg>
              <span>Ujung Harapan, Babelan, Bekasi 17610</span>
            </li>
            <li>
              <a href="tel:02188886776" class="inline-flex items-center gap-[8px] hover:text-white transition-colors">
                <svg class="ai w-[14px] h-[14px] shrink-0"><use href="#i-phone"/></svg>
                <span>021-88886776</span>
              </a>
            </li>
            <li>
              <a href="mailto:smkitattaqwa09@gmail.com" class="inline-flex items-center gap-[8px] hover:text-white transition-colors">
                <svg class="ai w-[14px] h-[14px] shrink-0"><use href="#i-mail"/></svg>
                <span>smkitattaqwa09@gmail.com</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-white/10 py-[20px] flex flex-col sm:flex-row justify-between items-center gap-[10px] text-[12.5px] text-[#8BA4D0]">
        <span>© 2026 SMK IT Attaqwa 9 &amp; SMP IT Bina Cendekia Assalam. Seluruh hak cipta dilindungi.</span>
        <span class="bg-white/10 text-white px-[10px] py-[3px] rounded-full font-semibold">NPSN 69940449 • Akreditasi A</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component logic
</script>
