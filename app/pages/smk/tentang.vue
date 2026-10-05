<script setup lang="ts">
import { useGsapReveal } from "~/composables/useGsapReveal";
useGsapReveal();
definePageMeta({ layout: 'smk' })
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO (Navy Gradient) -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[170px] sm:pt-[180px] md:pt-[190px] lg:pt-[200px] pb-[60px] lg:pb-[70px] bg-gradient-to-br from-[#0C2C61] to-[#061A3E]">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="text-[12.5px] text-[#8FA6CC] font-semibold mb-3.5">
          <NuxtLink to="/smk" class="hover:underline">Home</NuxtLink> / <b class="text-[#FCD34D]">Tentang Sekolah</b>
        </div>
        <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-[-0.02em] leading-tight mb-2.5">Tentang Sekolah</h1>
        <p class="text-[#B9CBE8] max-w-[700px] text-[16px] leading-relaxed">
          Mengenal lebih dekat SMK IT Attaqwa 9 — sejarah, visi misi, dan orang-orang di baliknya.
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. PROFIL & STATS (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Profil</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">SMK Rasa Pesantren</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div class="text-[#5A6B8C] text-[16.5px] leading-relaxed space-y-4">
            <p>
              SMK IT Attaqwa 9 adalah sekolah menengah kejuruan berbasis pesantren di bawah Yayasan Attaqwa Pusat, berlokasi di Ujung Harapan, Babelan, Kabupaten Bekasi. Berdiri sejak 2015 dan terakreditasi <b class="text-[#061A3E]">A</b> oleh BAN-SM, sekolah ini memadukan pendidikan vokasi yang link and match dengan industri dan pembinaan akhlak Qur'ani yang intensif.
            </p>
            <p>
              Dengan 6 konsentrasi keahlian dalam 3 bidang — bisnis &amp; manajemen, teknik otomotif, dan teknologi informasi — lebih dari 316 siswa dibimbing menjadi lulusan yang benar, pintar, dan terampil.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3.5">
            <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
              <b class="block text-[24px] font-black text-[#0A2A5C] mb-1">2015</b>
              <p class="text-[13.5px] text-[#5A6B8C] leading-snug">Tahun berdiri — izin 503.15/54/XII/SK-SMK/BPMPPT/2015</p>
            </div>
            <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
              <b class="block text-[24px] font-black text-[#0A2A5C] mb-1">A</b>
              <p class="text-[13.5px] text-[#5A6B8C] leading-snug">Akreditasi BAN-SM No. 02.00/203/SK/BAN-SM/XII/2018</p>
            </div>
            <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
              <b class="block text-[24px] font-black text-[#0A2A5C] mb-1">69940449</b>
              <p class="text-[13.5px] text-[#5A6B8C] leading-snug">NPSN resmi terdaftar</p>
            </div>
            <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
              <b class="block text-[24px] font-black text-[#0A2A5C] mb-1">316+</b>
              <p class="text-[13.5px] text-[#5A6B8C] leading-snug">Siswa aktif dari 6 jurusan</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. VISI & MISI (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Visi &amp; Misi</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">
            Arah Kami <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Melangkah</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <!-- Visi Panel -->
          <div class="lg:col-span-5 bg-gradient-to-br from-[#0C2C61] to-[#0A2A5C] text-white rounded-[20px] p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <span class="text-[60px] font-serif text-[#FCD34D]/30 leading-none absolute top-4 right-6 pointer-events-none">&ldquo;</span>
            <div>
              <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#FCD34D] uppercase mb-4">Visi Sekolah</span>
              <p class="text-[20px] md:text-[22px] font-bold leading-relaxed">
                Membentuk Generasi Vokasi Qur'ani yang Benar, Pintar, dan Terampil.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 text-[13px] text-[#A9BDDD]">
              SMK IT Attaqwa 9 · Babelan, Bekasi
            </div>
          </div>

          <!-- Misi List -->
          <div class="lg:col-span-7 bg-[#F5F8FF] border border-[#E3EAF7] rounded-[20px] p-7 md:p-8 flex flex-col justify-center gap-4">
            <div class="flex items-start gap-4 p-4 rounded-[14px] bg-white border border-[#E3EAF7]">
              <span class="text-[18px] font-black text-[#1B5FD9] bg-[#E8F0FE] w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">01</span>
              <p class="text-[15px] text-[#0F1E38] leading-relaxed pt-1">
                Menjadi lembaga pendidikan Islam terpadu yang <b class="text-[#0A2A5C]">terpercaya</b>, <b class="text-[#0A2A5C]">unggul</b>, dan <b class="text-[#0A2A5C]">agamis</b>.
              </p>
            </div>
            <div class="flex items-start gap-4 p-4 rounded-[14px] bg-white border border-[#E3EAF7]">
              <span class="text-[18px] font-black text-[#1B5FD9] bg-[#E8F0FE] w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">02</span>
              <p class="text-[15px] text-[#0F1E38] leading-relaxed pt-1">
                Membentuk pribadi yang <b class="text-[#0A2A5C]">terampil</b> dan memiliki kecakapan hidup.
              </p>
            </div>
            <div class="flex items-start gap-4 p-4 rounded-[14px] bg-white border border-[#E3EAF7]">
              <span class="text-[18px] font-black text-[#1B5FD9] bg-[#E8F0FE] w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">03</span>
              <p class="text-[15px] text-[#0F1E38] leading-relaxed pt-1">
                Meningkatkan <b class="text-[#0A2A5C]">kompetensi dan profesionalisme</b> pendidik serta tenaga kependidikan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. SEJARAH SINGKAT (TIMELINE) (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Sejarah Singkat</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">
            Perjalanan <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Kami</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- 2015 -->
          <div class="tl2-item bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)] flex flex-col justify-between">
            <div>
              <span class="inline-block text-[12px] font-black uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">2015</span>
              <h3 class="text-[17px] font-black text-[#061A3E] mb-2">Berdiri</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                SMK IT Attaqwa 9 resmi beroperasi dengan izin 503.15/54/XII/SK-SMK/BPMPPT/2015 di bawah Yayasan Attaqwa Pusat.
              </p>
            </div>
          </div>

          <!-- 2018 -->
          <div class="tl2-item bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)] flex flex-col justify-between">
            <div>
              <span class="inline-block text-[12px] font-black uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">2018</span>
              <h3 class="text-[17px] font-black text-[#061A3E] mb-2">Akreditasi A</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                Pengakuan BAN-SM atas mutu layanan pendidikan sekolah dengan capaian akreditasi unggul.
              </p>
            </div>
          </div>

          <!-- PENGEMBANGAN -->
          <div class="tl2-item bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)] flex flex-col justify-between">
            <div>
              <span class="inline-block text-[12px] font-black uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">PENGEMBANGAN</span>
              <h3 class="text-[17px] font-black text-[#061A3E] mb-2">BLK Komunitas</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                Hadirnya Gedung Balai Latihan Kerja Komunitas Link and Match Kemnaker RI memperkuat praktik kejuruan industri.
              </p>
            </div>
          </div>

          <!-- KINI -->
          <div class="tl2-item bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.08)] flex flex-col justify-between">
            <div>
              <span class="inline-block text-[12px] font-black uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">KINI</span>
              <h3 class="text-[17px] font-black text-[#061A3E] mb-2">316+ Siswa</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-relaxed">
                Belajar di 6 konsentrasi keahlian — dengan pembinaan tahfidz, kewirausahaan, dan link industri yang kokoh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. SAMBUTAN KEPALA SEKOLAH (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Sambutan</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">
            Kepala <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Sekolah</span>
          </h2>
        </div>

        <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[22px] p-7 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-[0_10px_30px_rgba(10,42,92,0.06)]">
          <!-- Foto Placeholder -->
          <div class="md:col-span-4 flex justify-center">
            <div class="w-full max-w-[280px] aspect-[3/4] bg-white border-2 border-dashed border-[#C9DDFB] rounded-[18px] p-6 flex flex-col items-center justify-center text-center text-[#8FA6CC] shadow-sm">
              <svg class="w-12 h-12 mb-3 text-[#1B5FD9] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7.5L10 5h4l1.5 2.5"/></svg>
              <b class="text-[14px] font-bold text-[#061A3E]">FOTO : KEPALA SEKOLAH</b>
              <small class="text-[12px] text-[#8FA6CC] mt-1">Ganti dengan foto asli</small>
            </div>
          </div>

          <!-- Isi Sambutan -->
          <div class="md:col-span-8">
            <span class="inline-block text-[11px] font-bold tracking-wider uppercase bg-[#FEF3C7] text-[#B45309] py-1 px-3 rounded-full mb-4">
              DRAF — menunggu persetujuan Bpk. Kepala Sekolah
            </span>
            <blockquote class="text-[#0F1E38] text-[15.5px] leading-relaxed space-y-3 mb-6">
              <p>Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di SMK IT Attaqwa 9.</p>
              <p>Kami percaya lulusan vokasi yang hebat bukan hanya yang terampil tangannya, tapi juga yang benar akhlaknya. Karena itu, setiap hari di sekolah ini keterampilan kejuruan berjalan beriringan dengan tahfidz Qur'an, sholat berjamaah, dan pembiasaan adab.</p>
              <p>Mari bergabung dan bertumbuh bersama — menjadi generasi vokasi Qur'ani yang benar, pintar, dan terampil. Wassalamu'alaikum warahmatullahi wabarakatuh.</p>
            </blockquote>

            <div class="flex items-center gap-3.5 pt-4 border-t border-[#E3EAF7]">
              <div class="w-11 h-11 rounded-full bg-[#1B5FD9] text-white font-black flex items-center justify-center text-[17px] shadow-sm">M</div>
              <div>
                <b class="block text-[16px] font-extrabold text-[#061A3E]">H. Abd. Muiz</b>
                <span class="text-[13px] text-[#5A6B8C]">Kepala SMK IT Attaqwa 9</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 6. PRESTASI (Empty State) (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Prestasi</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">Catatan Kebanggaan</h2>
        </div>

        <div class="bg-white border-2 border-dashed border-[#C9DDFB] rounded-[20px] p-12 text-center text-[#5A6B8C]">
          <b class="flex items-center justify-center gap-2 text-[17px] font-black text-[#061A3E] mb-2">
            <svg class="w-5 h-5 text-[#1B5FD9] stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M8 4h8v4.5a4 4 0 01-8 0V4z"/><path d="M8 5.5H4.5a3.5 3.5 0 003.6 5.5M16 5.5h3.5a3.5 3.5 0 01-3.6 5.5"/><path d="M12 12.5V16M8.5 20h7M10 16.5h4"/></svg>
            Data prestasi sedang dikurasi
          </b>
          <p class="text-[14.5px]">Segera hadir — daftar prestasi akademik dan non-akademik siswa SMK IT Attaqwa 9.</p>
        </div>

        <div class="text-center mt-8">
          <NuxtLink 
            to="/smk/spmb" 
            class="inline-flex items-center gap-2 font-bold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all"
          >
            Jadi Bagian Berikutnya →
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>
