<script setup lang="ts">
import { useGsapReveal } from "~/composables/useGsapReveal";
useGsapReveal();
import { ref } from 'vue'
const activeFilter = ref('semua')
definePageMeta({ layout: 'smk' })
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[50px] pb-[60px] bg-gradient-to-br from-[#0C2C61] to-[#061A3E]">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="text-[12.5px] text-[#8FA6CC] font-semibold mb-3.5">
          <NuxtLink to="/smk" class="hover:underline">Home</NuxtLink> / <b class="text-[#FCD34D]">Berita &amp; Artikel</b>
        </div>
        <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-[-0.02em] leading-tight mb-2.5">Berita &amp; Artikel</h1>
        <p class="text-[#B9CBE8] max-w-[700px] text-[16px] leading-relaxed">
          Kabar terbaru, gagasan pendidikan, dan pengumuman resmi dari SMK IT Attaqwa 9.
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. FILTER & BERITA GRID (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Filter Chips -->
        <div class="flex flex-wrap gap-2.5 mb-10">
          <button 
            v-for="cat in [
              { id: 'semua', label: 'Semua' },
              { id: 'berita', label: 'Berita' },
              { id: 'artikel', label: 'Artikel' },
              { id: 'pengumuman', label: 'Pengumuman' }
            ]"
            :key="cat.id"
            @click="activeFilter = cat.id"
            class="py-2.5 px-5 rounded-full font-bold text-[14px] transition-all duration-150 border"
            :class="activeFilter === cat.id 
              ? 'bg-[#0A2A5C] text-white border-[#0A2A5C] shadow-md' 
              : 'bg-white text-[#5A6B8C] border-[#E3EAF7] hover:border-[#1B5FD9] hover:text-[#1B5FD9]'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Headline Featured Card -->
        <div 
          v-show="activeFilter === 'semua' || activeFilter === 'pengumuman'"
          class="bg-white border border-[#E3EAF7] rounded-[22px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] grid grid-cols-1 lg:grid-cols-12 gap-0 mb-8 hover:-translate-y-1 transition-all duration-200"
        >
          <div class="lg:col-span-5 min-h-[220px] bg-gradient-to-br from-[#0C2C61] to-[#0A2A5C] flex items-center justify-center text-white p-8">
            <svg class="w-16 h-16 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path d="M3.5 10.5v4l3.5.6v-5.2l-3.5.6z"/><path d="M7 9.9L17.5 5v14L7 14.1"/><path d="M17.5 8.8a3.2 3.2 0 010 6.4"/></svg>
          </div>
          <div class="lg:col-span-7 p-8 md:p-10 flex flex-col justify-center">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#FEF3C7] text-[#B45309] w-fit mb-3">Pengumuman · Headline</span>
            <h2 class="text-[22px] md:text-[26px] font-black text-[#061A3E] leading-snug mb-3">SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran</h2>
            <p class="text-[15px] text-[#5A6B8C] leading-relaxed mb-4">Penerimaan murid baru tahun ajaran 2027/2028 resmi dibuka dengan tiga gelombang dan biaya registrasi hanya Rp50.000. Kuota terbatas hanya tujuh rombel — ditambah pendaftaran inden untuk 2028/2029.</p>
            <span class="text-[13px] text-[#8FA6CC] font-semibold">4 Oktober 2026 · Panitia SPMB</span>
          </div>
        </div>

        <!-- 3-Column Grid Articles -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <!-- Card 1 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'artikel'" class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1.5 transition-all duration-200 flex flex-col">
            <div class="min-h-[170px] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] flex items-center justify-center text-white">
              <svg class="w-10 h-10 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 3a6 6 0 00-3.4 10.9c.8.6 1.4 1.3 1.4 2.6h4c0-1.3.6-2 1.4-2.6A6 6 0 0012 3z"/></svg>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#E0E7FF] text-[#4338CA] w-fit mb-3">Artikel</span>
              <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2">Mengenal Deep Learning: Cara Baru Belajar di Kurikulum Merdeka</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">Bukan sekadar menghafal — bagaimana pendekatan pembelajaran mendalam mengubah cara siswa memahami pelajaran.</p>
              <span class="text-[12.5px] text-[#8FA6CC] font-semibold mt-auto block">28 September 2026</span>
            </div>
          </div>

          <!-- Card 2 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'berita'" class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1.5 transition-all duration-200 flex flex-col">
            <div class="min-h-[170px] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] flex items-center justify-center text-white">
              <svg class="w-10 h-10 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2M10 20.5v-2.8h4v2.8"/></svg>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#DBEAFE] text-[#1D4ED8] w-fit mb-3">Berita</span>
              <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2">BLK Komunitas: Jembatan Sekolah Menuju Dunia Industri</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">Gedung Balai Latihan Kerja Komunitas Kemnaker RI menjadi pusat praktik kejuruan berstandar industri.</p>
              <span class="text-[12.5px] text-[#8FA6CC] font-semibold mt-auto block">20 September 2026</span>
            </div>
          </div>

          <!-- Card 3 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'artikel'" class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1.5 transition-all duration-200 flex flex-col">
            <div class="min-h-[170px] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] flex items-center justify-center text-white">
              <svg class="w-10 h-10 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#E0E7FF] text-[#4338CA] w-fit mb-3">Artikel</span>
              <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2">Program Tahfidz Yanbu'a: Target Hafalan Setiap Semester</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">Metode Yanbu'a membuat setoran hafalan Qur'an menjadi pembiasaan yang ringan dan terukur bagi siswa vokasi.</p>
              <span class="text-[12.5px] text-[#8FA6CC] font-semibold mt-auto block">12 September 2026</span>
            </div>
          </div>

          <!-- Card 4 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'berita'" class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1.5 transition-all duration-200 flex flex-col">
            <div class="min-h-[170px] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] flex items-center justify-center text-white">
              <svg class="w-10 h-10 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path d="M20 13.2A8.2 8.2 0 1110.8 4 6.6 6.6 0 0020 13.2z"/></svg>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#DBEAFE] text-[#1D4ED8] w-fit mb-3">Berita</span>
              <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2">Sima'an Qur'an dan Sholat Berjamaah: Pembiasaan Harian</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">Setiap hari dimulai dengan sima'an dan ditutup dengan sholat berjamaah — budaya sekolah yang membentuk karakter.</p>
              <span class="text-[12.5px] text-[#8FA6CC] font-semibold mt-auto block">5 September 2026</span>
            </div>
          </div>

          <!-- Card 5 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'berita'" class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1.5 transition-all duration-200 flex flex-col">
            <div class="min-h-[170px] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] flex items-center justify-center text-white">
              <svg class="w-10 h-10 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 3a6 6 0 00-3.4 10.9c.8.6 1.4 1.3 1.4 2.6h4c0-1.3.6-2 1.4-2.6A6 6 0 0012 3z"/></svg>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#DBEAFE] text-[#1D4ED8] w-fit mb-3">Berita</span>
              <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2">Entrepreneur Day: Melatih Jiwa Wirausaha Sejak Sekolah</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">Siswa mempraktikkan ilmu kewirausahaan lewat bazar dan proyek usaha nyata di lingkungan sekolah.</p>
              <span class="text-[12.5px] text-[#8FA6CC] font-semibold mt-auto block">28 Agustus 2026</span>
            </div>
          </div>

          <!-- Card 6 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'pengumuman'" class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1.5 transition-all duration-200 flex flex-col">
            <div class="min-h-[170px] bg-gradient-to-br from-[#123E85] to-[#0A2A5C] flex items-center justify-center text-white">
              <svg class="w-10 h-10 text-[#4C8DFF] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>
            </div>
            <div class="p-6 flex-1 flex flex-col">
              <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#FEF3C7] text-[#B45309] w-fit mb-3">Pengumuman</span>
              <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2">Jadwal Tes Gelombang I SPMB 2027/2028</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">Tes seleksi gelombang pertama dilaksanakan Ahad, 27 Desember 2026. Pengumuman hasil 30 Desember 2026.</p>
              <span class="text-[12.5px] text-[#8FA6CC] font-semibold mt-auto block">15 Agustus 2026</span>
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>
