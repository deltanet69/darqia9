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
          <NuxtLink to="/smk" class="hover:underline">Home</NuxtLink> / <b class="text-[#FCD34D]">SPMB</b>
        </div>
        <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-[-0.02em] leading-tight mb-2.5">SPMB 2027/2028</h1>
        <p class="text-[#B9CBE8] max-w-[700px] text-[16px] leading-relaxed">
          Seleksi Penerimaan Murid Baru — hanya 7 rombel. Ditambah pendaftaran inden untuk tahun ajaran 2028/2029.
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. JADWAL SELEKSI (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Jadwal Seleksi</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">Tiga Gelombang Pendaftaran</h2>
        </div>

        <div class="space-y-4 max-w-[900px]">
          <!-- Gelombang I -->
          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <b class="block text-[20px] font-black text-[#061A3E]">Gelombang I</b>
              <span class="text-[13.5px] text-[#5A6B8C] font-semibold">01 Sep – 26 Des 2026</span>
            </div>
            <ul class="text-[14.5px] text-[#5A6B8C] space-y-1 sm:text-right">
              <li>Tes seleksi: <b class="text-[#061A3E]">Ahad, 27 Des 2026</b></li>
              <li>Pengumuman: <b class="text-[#061A3E]">30 Des 2026</b></li>
            </ul>
          </div>

          <!-- Gelombang II -->
          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <b class="block text-[20px] font-black text-[#061A3E]">Gelombang II</b>
              <span class="text-[13.5px] text-[#5A6B8C] font-semibold">01 Jan – 24 Apr 2027</span>
            </div>
            <ul class="text-[14.5px] text-[#5A6B8C] space-y-1 sm:text-right">
              <li>Tes seleksi: <b class="text-[#061A3E]">Ahad, 25 Apr 2027</b></li>
              <li>Pengumuman: <b class="text-[#061A3E]">28 Apr 2027</b></li>
            </ul>
          </div>

          <!-- Gelombang Tambahan -->
          <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <b class="block text-[20px] font-black text-[#061A3E]">Gelombang Tambahan</b>
              <span class="text-[13.5px] text-[#5A6B8C] font-semibold">26 Apr – 27 Jun 2027</span>
            </div>
            <ul class="text-[14.5px] text-[#5A6B8C] space-y-1 sm:text-right">
              <li>Tes seleksi: <b class="text-[#061A3E]">Setiap hari Ahad</b></li>
              <li>Pengumuman: <b class="text-[#061A3E]">2 hari setelah tes</b></li>
            </ul>
          </div>
        </div>

        <p class="text-[#5A6B8C] text-[14px] mt-5 flex items-center gap-2">
          <svg class="w-4 h-4 text-[#1B5FD9] stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.3"/><path d="M12 7.5V12l3.3 2"/></svg>
          Pelayanan pendaftaran: Senin–Jumat 08.00–15.00 WIB · Sabtu–Ahad 09.00–14.00 WIB
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. PERSYARATAN & BEASISWA (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <!-- Persyaratan Box -->
          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[20px] p-8 shadow-[0_10px_30px_rgba(10,42,92,0.06)]">
            <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Persyaratan</span>
            <h2 class="text-[24px] font-black text-[#061A3E] mb-6">Syarat Pendaftaran</h2>
            <ol class="list-decimal pl-5 space-y-2.5 text-[15px] text-[#0F1E38] leading-relaxed">
              <li>Membayar biaya registrasi <b class="text-[#0A2A5C]">Rp50.000</b> <span class="text-[#5A6B8C] text-[13.5px]">(gratis bagi siswa berprestasi &amp; yatim)</span></li>
              <li>Mengisi formulir pendaftaran</li>
              <li>Fotokopi ijazah legalisir (3 lembar)</li>
              <li>Fotokopi SKHUN legalisir (3 lembar)</li>
              <li>Fotokopi NISN (3 lembar)</li>
              <li>Fotokopi akte kelahiran (3 lembar)</li>
              <li>Fotokopi kartu keluarga (3 lembar)</li>
              <li>Pas foto hitam putih 3×4 (3 lembar)</li>
            </ol>
          </div>

          <!-- Beasiswa Grid -->
          <div>
            <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Beasiswa</span>
            <h2 class="text-[24px] font-black text-[#061A3E] mb-6">Beasiswa Vokasi</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="bg-[#E8F0FE] border border-[#C9DDFB] rounded-[16px] p-4 text-[#0A2A5C]">
                <b class="flex items-center gap-2 text-[15px] font-bold mb-1">
                  <svg class="w-5 h-5 text-[#1B5FD9] stroke-current stroke-[2] fill-none shrink-0" viewBox="0 0 24 24"><path d="M2.5 9L12 4.5 21.5 9 12 13.5 2.5 9z"/><path d="M6.5 11.3V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.7M21.5 9V14"/></svg>
                  Gratis Uang Pangkal
                </b>
                <span class="text-[13px] text-[#5A6B8C]">Untuk seluruh penerima beasiswa</span>
              </div>

              <div class="bg-[#E8F0FE] border border-[#C9DDFB] rounded-[16px] p-4 text-[#0A2A5C]">
                <b class="flex items-center gap-2 text-[15px] font-bold mb-1">
                  <svg class="w-5 h-5 text-[#1B5FD9] stroke-current stroke-[2] fill-none shrink-0" viewBox="0 0 24 24"><circle cx="12" cy="14.5" r="4.8"/><path d="M9.2 10.8L5.5 3.5h5.6L12 6l.9-2.5h5.6l-3.7 7.3"/></svg>
                  Siswa Berprestasi
                </b>
                <span class="text-[13px] text-[#5A6B8C]">Gratis SPP akademik &amp; non-akademik</span>
              </div>

              <div class="bg-[#E8F0FE] border border-[#C9DDFB] rounded-[16px] p-4 text-[#0A2A5C]">
                <b class="flex items-center gap-2 text-[15px] font-bold mb-1">
                  <svg class="w-5 h-5 text-[#1B5FD9] stroke-current stroke-[2] fill-none shrink-0" viewBox="0 0 24 24"><path d="M12 20s-7.2-4.6-9.3-9.2a5 5 0 019.3-2.9A5 5 0 0121.3 11c-2.1 4.6-9.3 9-9.3 9z"/></svg>
                  Yatim &amp; Anak Guru
                </b>
                <span class="text-[13px] text-[#5A6B8C]">Gratis SPP penuh</span>
              </div>

              <div class="bg-[#E8F0FE] border border-[#C9DDFB] rounded-[16px] p-4 text-[#0A2A5C]">
                <b class="flex items-center gap-2 text-[15px] font-bold mb-1">
                  <svg class="w-5 h-5 text-[#1B5FD9] stroke-current stroke-[2] fill-none shrink-0" viewBox="0 0 24 24"><path d="M12 20s-7.2-4.6-9.3-9.2a5 5 0 019.3-2.9A5 5 0 0121.3 11c-2.1 4.6-9.3 9-9.3 9z"/></svg>
                  KETM
                </b>
                <span class="text-[13px] text-[#5A6B8C]">Gratis SPP keluarga ekonomi tidak mampu</span>
              </div>

              <div class="bg-[#E8F0FE] border border-[#C9DDFB] rounded-[16px] p-4 text-[#0A2A5C]">
                <b class="flex items-center gap-2 text-[15px] font-bold mb-1">
                  <svg class="w-5 h-5 text-[#1B5FD9] stroke-current stroke-[2] fill-none shrink-0" viewBox="0 0 24 24"><path d="M9 4L3.5 6.8 5.3 10l1.9-1.1V20h9.6V8.9l1.9 1.1 1.8-3.2L15 4a3 3 0 01-6 0z"/></svg>
                  Seragam &amp; Buku
                </b>
                <span class="text-[13px] text-[#5A6B8C]">Gratis biaya seragam, buku, dan praktek</span>
              </div>

              <div class="bg-[#E8F0FE] border border-[#C9DDFB] rounded-[16px] p-4 text-[#0A2A5C]">
                <b class="flex items-center gap-2 text-[15px] font-bold mb-1">
                  <svg class="w-5 h-5 text-[#1B5FD9] stroke-current stroke-[2] fill-none shrink-0" viewBox="0 0 24 24"><path d="M20.5 12a8.5 8.5 0 11-2.5-6"/><path d="M20.5 3.5V8H16"/></svg>
                  Subsidi Silang
                </b>
                <span class="text-[13px] text-[#5A6B8C]">Subsidi silang biaya pendidikan 3 tahun</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. CTA FORMULIR ONLINE (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="bg-[radial-gradient(700px_400px_at_85%_100%,rgba(43,124,216,0.45),transparent_65%),linear-gradient(135deg,#0C2C61_0%,#0A2A5C_55%,#061A3E_100%)] text-white rounded-[24px] p-6 sm:p-8 md:px-12 md:pt-12 pb-0 shadow-[0_24px_60px_rgba(10,42,92,0.2)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative overflow-hidden">
          
          <div class="lg:col-span-7 relative z-10 pb-8 md:pb-12">
            <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#FCD34D] uppercase mb-3">Formulir Online</span>
            <h2 class="text-[clamp(26px,4vw,38px)] font-black tracking-[-0.02em] leading-tight mb-4">
              Amankan kursimu di <span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">7 rombel</span> ini.
            </h2>
            <p class="text-[#C9D8F2] text-[15.5px] leading-relaxed mb-8 max-w-[500px]">
              Klik tombol di bawah untuk mengisi formulir pendaftaran online resmi SPMB 2027/2028.
            </p>

            <div class="flex flex-wrap items-center gap-4">
              <NuxtLink 
                to="/spmb" 
                class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all duration-150"
              >
                Mulai Pendaftaran
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </NuxtLink>
            </div>
          </div>

          <div class="lg:col-span-5 relative z-10 flex justify-center lg:justify-end items-end self-end">
            <div class="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-none flex justify-center items-end">
              <div class="absolute bottom-0 inset-x-0 h-[280px] bg-[radial-gradient(ellipse_at_bottom,rgba(43,124,216,0.45),transparent_70%)] pointer-events-none"></div>

              <div class="absolute top-6 -left-2 sm:left-4 bg-white/95 backdrop-blur-md text-[#0A2A5C] font-extrabold text-[12px] py-1.5 px-3 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.3)] border border-[#E3EAF7] flex items-center gap-1.5 z-10 hover:scale-105 transition-transform">
                <span class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                Kuota 7 Rombel
              </div>

              <img 
                src="/asset/SMK/herosmk.png" 
                alt="Siswa SMK IT Attaqwa 9" 
                class="relative z-0 w-full h-auto max-h-[340px] sm:max-h-[390px] lg:max-h-[440px] object-contain object-bottom block drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)] select-none pointer-events-none"
                loading="lazy"
              />
            </div>
          </div>

        </div>
        <p class="text-center text-[#5A6B8C] text-[13px] mt-4">Tautan menuju formulir SPMB online (prototipe).</p>
      </div>
    </section>

  </div>
</template>
