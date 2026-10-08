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
    <section class="relative overflow-hidden text-white pt-[170px] sm:pt-[180px] md:pt-[190px] lg:pt-[200px] pb-[60px] lg:pb-[70px] bg-gradient-to-br from-[#0C2C61] to-[#061A3E]">
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
          class="rv bg-white border border-[#E2ECF8] rounded-[22px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:shadow-[0_22px_45px_rgba(10,42,92,0.14)] grid grid-cols-1 lg:grid-cols-12 gap-0 mb-10 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
        >
          <div class="lg:col-span-5 min-h-[260px] relative overflow-hidden bg-[#0A2A5C]">
            <img 
              src="/asset/SMK/news-spmb.jpg" 
              alt="SPMB 2027/2028 SMK IT Attaqwa 9" 
              class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
            <span class="absolute top-4 left-4 inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#FEF3C7]/95 text-[#92400E] backdrop-blur-md shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
              Pengumuman · Headline
            </span>
          </div>
          <div class="lg:col-span-7 p-8 md:p-10 flex flex-col justify-center">
            <div class="flex items-center gap-2 text-[13px] text-[#8FA6CC] font-semibold mb-3">
              <span>4 Oktober 2026</span>
              <span>·</span>
              <span class="text-[#1B5FD9] font-bold">Panitia SPMB</span>
              <span>·</span>
              <span>3 mnt baca</span>
            </div>
            <h2 class="text-[22px] md:text-[26px] font-black text-[#061A3E] leading-snug mb-3 group-hover:text-[#1B5FD9] transition-colors">
              SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran
            </h2>
            <p class="text-[15px] text-[#5A6B8C] leading-relaxed mb-5">
              Penerimaan murid baru tahun ajaran 2027/2028 resmi dibuka dengan tiga gelombang dan biaya registrasi hanya Rp50.000. Kuota terbatas hanya tujuh rombel — ditambah pendaftaran inden untuk 2028/2029.
            </p>
            <div class="flex items-center gap-2 text-[14px] font-bold text-[#1B5FD9]">
              <span>Baca Selengkapnya</span>
              <svg class="w-4 h-4 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>
          </div>
        </div>

        <!-- 3-Column Grid Articles -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Card 1 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'artikel'" class="rv group bg-white border border-[#E2ECF8] rounded-[20px] overflow-hidden shadow-[0_6px_25px_rgba(10,42,92,0.06)] hover:shadow-[0_20px_45px_rgba(10,42,92,0.14)] hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer">
            <div class="relative h-[200px] overflow-hidden bg-[#0A2A5C]">
              <img 
                src="/asset/SMK/news-deeplearning.jpg" 
                alt="Deep Learning" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
              <span class="absolute top-3.5 left-3.5 inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#EEF2FF]/95 text-[#4338CA] backdrop-blur-md">
                Artikel Edukasi
              </span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[12px] text-[#8FA6CC] font-semibold block mb-2">28 September 2026 · Tim Kurikulum</span>
                <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Mengenal Deep Learning: Cara Baru Belajar di Kurikulum Merdeka
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                  Bukan sekadar menghafal — bagaimana pendekatan pembelajaran mendalam mengubah cara siswa memahami pelajaran vokasi.
                </p>
              </div>
              <span class="text-[13px] font-bold text-[#1B5FD9] flex items-center gap-1.5 pt-3 border-t border-[#F1F5F9] mt-auto">
                Baca Artikel <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </div>

          <!-- Card 2 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'berita'" class="rv group bg-white border border-[#E2ECF8] rounded-[20px] overflow-hidden shadow-[0_6px_25px_rgba(10,42,92,0.06)] hover:shadow-[0_20px_45px_rgba(10,42,92,0.14)] hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer">
            <div class="relative h-[200px] overflow-hidden bg-[#0A2A5C]">
              <img 
                src="/asset/SMK/news-blk.jpg" 
                alt="BLK Komunitas" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
              <span class="absolute top-3.5 left-3.5 inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#DBEAFE]/95 text-[#1D4ED8] backdrop-blur-md">
                Berita Kejuruan
              </span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[12px] text-[#8FA6CC] font-semibold block mb-2">20 September 2026 · Humas DUDIKA</span>
                <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  BLK Komunitas: Jembatan Sekolah Menuju Dunia Industri
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                  Gedung Balai Latihan Kerja Komunitas Kemnaker RI menjadi pusat praktik kejuruan berstandar industri nasional.
                </p>
              </div>
              <span class="text-[13px] font-bold text-[#1B5FD9] flex items-center gap-1.5 pt-3 border-t border-[#F1F5F9] mt-auto">
                Baca Berita <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </div>

          <!-- Card 3 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'artikel'" class="rv group bg-white border border-[#E2ECF8] rounded-[20px] overflow-hidden shadow-[0_6px_25px_rgba(10,42,92,0.06)] hover:shadow-[0_20px_45px_rgba(10,42,92,0.14)] hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer">
            <div class="relative h-[200px] overflow-hidden bg-[#0A2A5C]">
              <img 
                src="/asset/SMK/ig-3.jpg" 
                alt="Program Tahfidz Yanbua" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
              <span class="absolute top-3.5 left-3.5 inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#EEF2FF]/95 text-[#4338CA] backdrop-blur-md">
                Artikel
              </span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[12px] text-[#8FA6CC] font-semibold block mb-2">12 September 2026 · Asatidz Tahfidz</span>
                <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Program Tahfidz Yanbu'a: Target Hafalan Setiap Semester
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                  Metode Yanbu'a membuat setoran hafalan Qur'an menjadi pembiasaan yang ringan dan terukur bagi siswa vokasi.
                </p>
              </div>
              <span class="text-[13px] font-bold text-[#1B5FD9] flex items-center gap-1.5 pt-3 border-t border-[#F1F5F9] mt-auto">
                Baca Artikel <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </div>

          <!-- Card 4 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'berita'" class="rv group bg-white border border-[#E2ECF8] rounded-[20px] overflow-hidden shadow-[0_6px_25px_rgba(10,42,92,0.06)] hover:shadow-[0_20px_45px_rgba(10,42,92,0.14)] hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer">
            <div class="relative h-[200px] overflow-hidden bg-[#0A2A5C]">
              <img 
                src="/asset/SMK/ig-4.jpg" 
                alt="Prestasi Juara LKS" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
              <span class="absolute top-3.5 left-3.5 inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#DBEAFE]/95 text-[#1D4ED8] backdrop-blur-md">
                Prestasi Siswa
              </span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[12px] text-[#8FA6CC] font-semibold block mb-2">5 September 2026 · Humas Sekolah</span>
                <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Juara 1 LKS IT Network System Administration Kab. Bekasi
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                  Siswa kompetensi keahlian TKJ SMK IT Attaqwa 9 berhasil membuktikan keunggulan skill di ajang bergengsi LKS.
                </p>
              </div>
              <span class="text-[13px] font-bold text-[#1B5FD9] flex items-center gap-1.5 pt-3 border-t border-[#F1F5F9] mt-auto">
                Baca Berita <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </div>

          <!-- Card 5 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'berita'" class="rv group bg-white border border-[#E2ECF8] rounded-[20px] overflow-hidden shadow-[0_6px_25px_rgba(10,42,92,0.06)] hover:shadow-[0_20px_45px_rgba(10,42,92,0.14)] hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer">
            <div class="relative h-[200px] overflow-hidden bg-[#0A2A5C]">
              <img 
                src="/asset/SMK/ig-2.jpg" 
                alt="Showcase Portofolio DKV" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
              <span class="absolute top-3.5 left-3.5 inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#DBEAFE]/95 text-[#1D4ED8] backdrop-blur-md">
                Karya Siswa
              </span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[12px] text-[#8FA6CC] font-semibold block mb-2">28 Agustus 2026 · Jurusan DKV</span>
                <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Showcase Portofolio: Desain UI/UX &amp; Animasi Santri DKV
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                  Pameran karya digital santri vokasi siap industri: prototipe aplikasi mobile dan kreasi visual berstandar agensi.
                </p>
              </div>
              <span class="text-[13px] font-bold text-[#1B5FD9] flex items-center gap-1.5 pt-3 border-t border-[#F1F5F9] mt-auto">
                Baca Liputan <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </div>

          <!-- Card 6 -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'pengumuman'" class="rv group bg-white border border-[#E2ECF8] rounded-[20px] overflow-hidden shadow-[0_6px_25px_rgba(10,42,92,0.06)] hover:shadow-[0_20px_45px_rgba(10,42,92,0.14)] hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer">
            <div class="relative h-[200px] overflow-hidden bg-[#0A2A5C]">
              <img 
                src="/asset/SMK/ig-1.jpg" 
                alt="Jadwal Tes Seleksi" 
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/20"></div>
              <span class="absolute top-3.5 left-3.5 inline-block text-[11px] font-extrabold tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#FEF3C7]/95 text-[#92400E] backdrop-blur-md">
                Pengumuman
              </span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[12px] text-[#8FA6CC] font-semibold block mb-2">15 Agustus 2026 · Panitia SPMB</span>
                <h3 class="text-[17px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors">
                  Jadwal Tes Gelombang I SPMB 2027/2028
                </h3>
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4">
                  Tes seleksi gelombang pertama dilaksanakan Ahad, 27 Desember 2026. Pengumuman hasil seleksi 30 Desember 2026.
                </p>
              </div>
              <span class="text-[13px] font-bold text-[#1B5FD9] flex items-center gap-1.5 pt-3 border-t border-[#F1F5F9] mt-auto">
                Baca Jadwal <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>
