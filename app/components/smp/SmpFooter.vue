<template>
  <footer class="bg-[#052E22] text-[#A9D4BC] border-t border-[#0A4A30] relative overflow-hidden">
    <!-- Background Texture Glow -->
    <div class="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

    <div class="max-w-[1180px] mx-auto px-5 lg:px-6 py-[64px] relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
        
        <!-- Kolom 1: Profil Brand (4 Cols) -->
        <div class="lg:col-span-4">
          <div class="flex items-center gap-3 mb-4">
            <img 
              src="/asset/logosmp.png" 
              alt="Logo SMP IT BCA" 
              class="w-[42px] h-[48px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,.3)]"
            />
            <div>
              <h4 class="text-white text-[16px] font-black tracking-tight leading-tight">SMP IT Bina Cendekia Assalam</h4>
              <span class="text-[12px] font-bold text-[#FCD34D]">Sekolah Berbasis Kelas Gender</span>
            </div>
          </div>
          <p class="text-[14px] text-[#C4E4D4] leading-relaxed mb-4 max-w-sm">
            Alqur'an &amp; akhlaknya terpuji, prestasi akademiknya teruji — membentuk generasi Qur'ani yang terpercaya, cerdas, dan mandiri.
          </p>
          <div class="inline-flex items-center gap-2 text-[12px] font-bold text-[#7EE2AE] bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span>Di bawah مؤسسة دار القهار</span>
            <span>·</span>
            <span>Milad ke-6</span>
          </div>
        </div>

        <!-- Kolom 2: Navigasi Utama (2 Cols) -->
        <div class="lg:col-span-2">
          <h4 class="text-white text-[15px] font-extrabold mb-4 uppercase tracking-wider text-xs text-[#FCD34D]">Navigasi</h4>
          <ul class="space-y-2.5 text-[14px]">
            <li><NuxtLink to="/smp" class="hover:text-white transition-colors">Beranda</NuxtLink></li>
            <li><NuxtLink to="/smp/tentang" class="hover:text-white transition-colors">Tentang Sekolah</NuxtLink></li>
            <li><NuxtLink to="/smp/akademik" class="hover:text-white transition-colors">Akademik &amp; Ekskul</NuxtLink></li>
            <li><NuxtLink to="/smp/berita" class="hover:text-white transition-colors">Berita &amp; Artikel</NuxtLink></li>
            <li><NuxtLink to="/smp/spmb" class="hover:text-white transition-colors">SPMB 2027/2028</NuxtLink></li>
            <li><NuxtLink to="/smp/kontak" class="hover:text-white transition-colors">Kontak Kami</NuxtLink></li>
          </ul>
        </div>

        <!-- Kolom 3: 7 Program Unggulan (3 Cols) -->
        <div class="lg:col-span-3">
          <h4 class="text-white text-[15px] font-extrabold mb-4 uppercase tracking-wider text-xs text-[#FCD34D]">Program Unggulan</h4>
          <ul class="space-y-2 text-[13.5px]">
            <li><NuxtLink to="/smp/akademik" class="hover:text-white transition-colors">1. Kelas Berbasis Gender</NuxtLink></li>
            <li><NuxtLink to="/smp/akademik" class="hover:text-white transition-colors">2. Kurikulum Terintegrasi ICT</NuxtLink></li>
            <li><NuxtLink to="/smp/akademik" class="hover:text-white transition-colors">3. Tahfidz Metode Yanbu'a</NuxtLink></li>
            <li><NuxtLink to="/smp/akademik" class="hover:text-white transition-colors">4. Sima'an &amp; Sholat Berjamaah</NuxtLink></li>
            <li><NuxtLink to="/smp/akademik" class="hover:text-white transition-colors">5. Pendalaman Fiqih &amp; Ubudiyah</NuxtLink></li>
            <li><NuxtLink to="/smp/akademik" class="hover:text-white transition-colors">6. Talent &amp; Entrepreneur Day</NuxtLink></li>
            <li><NuxtLink to="/smp/akademik" class="hover:text-white transition-colors">7. Public Speaking @america</NuxtLink></li>
          </ul>
        </div>

        <!-- Kolom 4: Kontak & Lokasi (3 Cols) -->
        <div class="lg:col-span-3">
          <h4 class="text-white text-[15px] font-extrabold mb-4 uppercase tracking-wider text-xs text-[#FCD34D]">Hubungi Kami</h4>
          <div class="space-y-3 text-[13.5px]">
            <p class="flex items-start gap-2.5">
              <svg class="w-4 h-4 text-[#34C77B] stroke-current stroke-[2] fill-none shrink-0 mt-0.5" viewBox="0 0 24 24"><path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/><circle cx="12" cy="10" r="2.6"/></svg>
              <span>Ujung Harapan, Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17612</span>
            </p>
            <p class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-[#34C77B] stroke-current stroke-[2] fill-none shrink-0" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              <span>021-8888 6776</span>
            </p>
            <p class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-[#34C77B] stroke-current stroke-[2] fill-none shrink-0" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7.5L12 13l8.5-5.5"/></svg>
              <span>smpitbca@gmail.com</span>
            </p>
          </div>
          <div class="mt-5">
            <NuxtLink 
              to="/smp/spmb" 
              class="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl font-black text-[13px] text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] hover:shadow-lg transition-all"
            >
              <span>Daftar SPMB 2027/2028</span>
              <span>→</span>
            </NuxtLink>
          </div>
        </div>

      </div>

      <!-- Bottom Copyright & Credit -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#8FBCA1]">
        <div>
          © {{ currentYear }} <strong>SMP IT Bina Cendekia Assalam</strong>. Hak Cipta Dilindungi.
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/smk" class="hover:text-white transition-colors">Portal SMK IT</NuxtLink>
          <span>·</span>
          <NuxtLink to="/" class="hover:text-white transition-colors">Web Yayasan</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
