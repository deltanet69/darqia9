<script setup lang="ts">
import { useGsapReveal } from "~/composables/useGsapReveal";
useGsapReveal();
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
          <NuxtLink to="/smk" class="hover:underline">Home</NuxtLink> / <b class="text-[#FCD34D]">Akademik</b>
        </div>
        <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-[-0.02em] leading-tight mb-2.5">Akademik</h1>
        <p class="text-[#B9CBE8] max-w-[700px] text-[16px] leading-relaxed">
          Kurikulum, konsentrasi keahlian, dan keunggulan pembelajaran di SMK IT Attaqwa 9.
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. KURIKULUM MERDEKA + DEEP LEARNING (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Kurikulum</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">
            Kurikulum Merdeka + Deep Learning
          </h2>
          <p class="text-[#5A6B8C] text-[16.5px] mt-3 max-w-[800px] leading-relaxed">
            Kami menerapkan Kurikulum Merdeka dengan pendekatan Deep Learning — siswa diajak memahami konsep secara mendalam, berpikir kritis, dan mengaitkan pelajaran dengan dunia nyata, bukan sekadar menghafal.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-[54px] h-[54px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3z"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Pembelajaran Mendalam</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Proyek, diskusi, dan praktik laboratorium menjadi cara utama belajar — bukan ceramah satu arah.</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-[54px] h-[54px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Tahfidz &amp; Ibadah Harian</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Baca Qur'an metode Yanbu'a, sima'an Qur'an, dan sholat berjamaah sebagai pembiasaan harian.</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-[54px] h-[54px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9.5 20.5h5M12 16.5v4"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Berbasis Teknologi</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Pembelajaran didukung teknologi informatika — dari lab komputer hingga platform digital.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. ENAM JURUSAN (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Konsentrasi Keahlian</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">Enam Jurusan, Tiga Bidang</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.06)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Bisnis &amp; Manajemen</span>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">AKL — Akuntansi &amp; Keuangan Lembaga</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Menguasai siklus akuntansi, perpajakan, dan aplikasi keuangan lembaga. Lulusan siap kerja di perbankan, kantor akuntan, dan divisi keuangan perusahaan — atau melanjutkan ke pendidikan tinggi.</p>
          </div>

          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.06)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Bisnis &amp; Manajemen</span>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">OTKP — Otomatisasi &amp; Tata Kelola Perkantoran</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Kesekretarisan modern, korespondensi bisnis, dan otomatisasi perkantoran digital untuk kebutuhan administrasi profesional.</p>
          </div>

          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.06)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Teknik Otomotif</span>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">TBSM — Teknik &amp; Bisnis Sepeda Motor</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Teknologi sepeda motor terkini dipadukan dengan kewirausahaan — lulusan dibekali kemampuan membuka bengkel mandiri.</p>
          </div>

          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.06)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Teknik Otomotif</span>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">TKR — Teknik Kendaraan Ringan</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Perawatan dan perbaikan kendaraan ringan niaga dengan fasilitas workshop dan lab otomotif sekolah.</p>
          </div>

          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.06)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Teknologi Informasi</span>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">TKJ — Teknik Komputer &amp; Jaringan</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Instalasi jaringan, administrasi server, dan troubleshooting infrastruktur IT — fondasi karier di era digital.</p>
          </div>

          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.06)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Teknologi Informasi</span>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">DKV — Desain Komunikasi Visual</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Desain grafis, multimedia, dan komunikasi visual kreatif untuk industri kreatif yang terus bertumbuh.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. SEMBILAN PROGRAM UNGGULAN (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Keunggulan</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">Sembilan Program Unggulan</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3.5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2M10 20.5v-2.8h4v2.8"/></svg>
            </div>
            <h3 class="text-[18px] font-extrabold text-[#061A3E] mb-1.5">BLK Komunitas</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Gedung Balai Latihan Kerja Komunitas Link and Match Kemnaker RI.</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3.5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
            </div>
            <h3 class="text-[18px] font-extrabold text-[#061A3E] mb-1.5">Kurikulum Merdeka</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Dengan pendekatan Deep Learning di semua mata pelajaran.</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3.5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
            </div>
            <h3 class="text-[18px] font-extrabold text-[#061A3E] mb-1.5">Tahfidz Yanbu'a</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Program baca Qur'an dan tahfidz metode Yanbu'a.</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3.5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20 13.2A8.2 8.2 0 1110.8 4 6.6 6.6 0 0020 13.2z"/></svg>
            </div>
            <h3 class="text-[18px] font-extrabold text-[#061A3E] mb-1.5">Sima'an &amp; Berjamaah</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Sima'an Qur'an dan sholat berjamaah sebagai budaya sekolah.</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3.5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/><circle cx="16.8" cy="9" r="2.6"/><path d="M16.2 14.3c2.5.4 4.3 2.1 5 5.2"/></svg>
            </div>
            <h3 class="text-[18px] font-extrabold text-[#061A3E] mb-1.5">Kelas Industri</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Link and match bersama DUDIKA (dunia usaha &amp; industri).</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3.5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20.6 6.6a5 5 0 01-6.9 6.9L7 20.2a2.2 2.2 0 01-3.1-3.1l6.7-6.7A5 5 0 0117.5 3.4l-2.8 2.8 2.6 2.6 3.3-2.2z"/></svg>
            </div>
            <h3 class="text-[18px] font-extrabold text-[#061A3E] mb-1.5">Sistem Ganda &amp; Prakerin</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Pendidikan sistem ganda dan praktik kerja industri terstruktur.</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3.5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.8M12 18.7v2.8M2.5 12h2.8M18.7 12h2.8M5.2 5.2l2 2M16.8 16.8l2 2M18.8 5.2l-2 2M7.2 16.8l-2 2"/></svg>
            </div>
            <h3 class="text-[18px] font-extrabold text-[#061A3E] mb-1.5">Skill Equipment</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Program kejuruan terpadu lintas konsentrasi keahlian.</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3.5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9.5 20.5h5M12 16.5v4"/></svg>
            </div>
            <h3 class="text-[18px] font-extrabold text-[#061A3E] mb-1.5">Pembelajaran Digital</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Berbasis teknologi informatika di setiap proses belajar.</p>
          </div>

          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3.5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 3a6 6 0 00-3.4 10.9c.8.6 1.4 1.3 1.4 2.6h4c0-1.3.6-2 1.4-2.6A6 6 0 0012 3z"/></svg>
            </div>
            <h3 class="text-[18px] font-extrabold text-[#061A3E] mb-1.5">Kewirausahaan</h3>
            <p class="text-[14px] text-[#5A6B8C] leading-relaxed">Penguatan output berbasis kewirausahaan — lulusan siap membuka usaha.</p>
          </div>
        </div>

        <div class="text-center mt-10">
          <NuxtLink 
            to="/smk/spmb" 
            class="inline-flex items-center gap-2 font-bold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all"
          >
            Daftar &amp; Pilih Jurusanmu →
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>
