<script setup lang="ts">
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smp' })
</script>

<template>
  <div class="min-h-screen bg-[#F2F9F5] text-[#0E241B] font-sans antialiased overflow-x-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO (Dark Green Gradient Overlay) -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[170px] sm:pt-[180px] md:pt-[190px] lg:pt-[205px] pb-[60px] lg:pb-[75px] bg-[radial-gradient(900px_480px_at_85%_-10%,rgba(52,199,123,0.45),transparent_60%),linear-gradient(135deg,#0A4A30_0%,#063826_55%,#052E22_100%)]">
      <div class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="text-[12.5px] text-[#A9D4BC] font-semibold mb-3.5 flex items-center gap-1.5">
          <NuxtLink to="/smp" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <span class="text-[#34C77B]">/</span>
          <b class="text-[#FCD34D]">Tentang Kami</b>
        </div>
        <h1 class="text-[clamp(32px,4.5vw,48px)] font-black tracking-[-0.02em] leading-tight mb-3">
          Tentang <span class="bg-gradient-to-r from-[#7EE2AE] to-[#FCD34D] bg-clip-text text-transparent">Sekolah</span>
        </h1>
        <p class="text-[#C4E4D4] max-w-[700px] text-[16px] leading-relaxed">
          Mengenal lebih dekat SMP IT Bina Cendekia Assalam — sejarah berdirinya, visi misi pendidikan, serta sarana penunjang kenyamanan belajar santri.
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. PROFIL & 4 FACT TILES (Soft Emerald Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <!-- Teks Profil (7 Cols) -->
          <div class="lg:col-span-7">
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5z"/></svg>
              Identitas Sekolah
            </span>
            <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826] mb-5">
              Sekolah Berbasis <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Kelas Gender</span>
            </h2>
            <p class="text-[15.5px] text-[#55705F] leading-relaxed mb-4">
              SMP IT Bina Cendekia Assalam (BCA) adalah sekolah menengah pertama Islam terpadu di bawah naungan <strong>مؤسسة دار القهار (Yayasan Darqia)</strong>, berlokasi di Ujung Harapan, Babelan, Kabupaten Bekasi. Didirikan pada 16 April 2021 dan kini memasuki milad ke-6.
            </p>
            <p class="text-[15.5px] text-[#55705F] leading-relaxed mb-6">
              Sekolah ini menerapkan model <strong>kelas khusus gender</strong> — memisahkan ruang belajar putra dan putri dengan metode CTL (Contextual Teaching and Learning). Didukung 7 program unggulan dan kemitraan public speaking global, lebih dari 1000 santri telah dibimbing menjadi generasi Qur'ani yang terpercaya, cerdas, dan mandiri.
            </p>

            <div class="flex items-center gap-3">
              <NuxtLink 
                to="/smp/akademik" 
                class="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[#0E7A4E] text-white font-bold text-[14px] hover:bg-[#063826] transition-colors"
              >
                Lihat 7 Program Unggulan →
              </NuxtLink>
            </div>
          </div>

          <!-- 4 Fact Tiles (5 Cols) -->
          <div class="lg:col-span-5 grid grid-cols-2 gap-4">
            <div class="rv bg-white border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm hover:shadow-md transition-all">
              <strong class="block text-[28px] font-black text-[#0E7A4E] mb-1">2021</strong>
              <span class="text-[13px] font-bold text-[#063826] block mb-1">Tahun Berdiri</span>
              <p class="text-[12px] text-[#55705F]">Diresmikan 16 April 2021</p>
            </div>
            <div class="rv bg-white border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm hover:shadow-md transition-all">
              <strong class="block text-[28px] font-black text-[#F0B429] mb-1">6 Tahun</strong>
              <span class="text-[13px] font-bold text-[#063826] block mb-1">Milad Sekolah</span>
              <p class="text-[12px] text-[#55705F]">Periode 2021–2026</p>
            </div>
            <div class="rv bg-white border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm hover:shadow-md transition-all">
              <strong class="block text-[28px] font-black text-[#0E7A4E] mb-1">7 Program</strong>
              <span class="text-[13px] font-bold text-[#063826] block mb-1">Pilar Unggulan</span>
              <p class="text-[12px] text-[#55705F]">ICT, Tahfidz, Bahasa</p>
            </div>
            <div class="rv bg-white border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm hover:shadow-md transition-all">
              <strong class="block text-[28px] font-black text-[#0E7A4E] mb-1">2 Kelas</strong>
              <span class="text-[13px] font-bold text-[#063826] block mb-1">Kelas Gender</span>
              <p class="text-[12px] text-[#55705F]">Khusus Putra &amp; Putri</p>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. VISI & MISI SEKOLAH (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E0ECE6]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="max-w-[700px] mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Landasan Filosofis
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            Visi &amp; Misi <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Sekolah</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <!-- Panel Visi (5 Cols) -->
          <div class="lg:col-span-5 bg-gradient-to-br from-[#0A4A30] to-[#052E22] text-white rounded-[26px] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div class="absolute -bottom-16 -right-16 w-60 h-60 bg-[#34C77B]/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div>
              <span class="text-[#FCD34D] text-[72px] font-serif leading-none block -mb-4 opacity-80">“</span>
              <span class="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#FCD34D] block mb-3">Visi Sekolah</span>
              <h3 class="text-[22px] sm:text-[25px] font-black leading-snug">
                Membentuk Generasi Qur'ani Berprestasi yang Terpercaya, Cerdas dan Mandiri.
              </h3>
            </div>

            <div class="pt-8 mt-6 border-t border-white/15 text-[13px] text-[#A9D4BC]">
              SMP IT Bina Cendekia Assalam · Babelan Bekasi
            </div>
          </div>

          <!-- Panel 3 Misi (7 Cols) -->
          <div class="lg:col-span-7 space-y-4 flex flex-col justify-between">
            
            <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm hover:border-[#0E7A4E] hover:translate-x-1.5 transition-all flex items-start gap-4">
              <span class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#12A15E] to-[#063826] text-[#FCD34D] font-black text-[16px] flex items-center justify-center shrink-0 shadow-sm">
                01
              </span>
              <div>
                <strong class="text-[16px] font-extrabold text-[#063826] block mb-1">Pendidikan Islam Terpercaya &amp; Unggul</strong>
                <p class="text-[14.5px] text-[#55705F] leading-relaxed">
                  Menjadi lembaga pendidikan Islam terpadu yang <strong>terpercaya</strong>, <strong>unggul</strong> dalam mutu akademik, dan berkarakter <strong>agamis</strong>.
                </p>
              </div>
            </div>

            <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm hover:border-[#0E7A4E] hover:translate-x-1.5 transition-all flex items-start gap-4">
              <span class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#12A15E] to-[#063826] text-[#FCD34D] font-black text-[16px] flex items-center justify-center shrink-0 shadow-sm">
                02
              </span>
              <div>
                <strong class="text-[16px] font-extrabold text-[#063826] block mb-1">Keterampilan &amp; Kecakapan Hidup</strong>
                <p class="text-[14.5px] text-[#55705F] leading-relaxed">
                  Membentuk pribadi santri yang <strong>terampil</strong>, memiliki kecakapan hidup (*life skills*), serta berdaya saing global.
                </p>
              </div>
            </div>

            <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm hover:border-[#0E7A4E] hover:translate-x-1.5 transition-all flex items-start gap-4">
              <span class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#12A15E] to-[#063826] text-[#FCD34D] font-black text-[16px] flex items-center justify-center shrink-0 shadow-sm">
                03
              </span>
              <div>
                <strong class="text-[16px] font-extrabold text-[#063826] block mb-1">Profesionalisme Pendidik</strong>
                <p class="text-[14.5px] text-[#55705F] leading-relaxed">
                  Meningkatkan <strong>kompetensi dan profesionalisme</strong> pendidik serta tenaga kependidikan secara berkesinambungan.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. SEJARAH SINGKAT (TIMELINE VERTIKAL MODERN) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="text-center max-w-[700px] mx-auto mb-14">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Milad ke-6
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            Perjalanan <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">SMP IT BCA</span>
          </h2>
        </div>

        <div class="max-w-2xl mx-auto relative pl-6 sm:pl-8 border-l-2 border-[#0E7A4E]/30 space-y-10">
          
          <!-- Item 1 -->
          <div class="rv relative group">
            <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-[#0E7A4E] shadow-sm"></div>
            <span class="inline-block bg-[#063826] text-[#FCD34D] font-extrabold text-[12px] py-1 px-3.5 rounded-full uppercase tracking-wider mb-2">
              16 April 2021
            </span>
            <div class="bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
              <strong class="text-[17px] font-black text-[#063826] block mb-1">Berdiri Resmi</strong>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                SMP IT Bina Cendekia Assalam resmi beroperasi di bawah naungan مؤسسة دار القهار, memelopori konsep sekolah berbasis kelas gender di kawasan Babelan.
              </p>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="rv relative group">
            <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-[#0E7A4E] shadow-sm"></div>
            <span class="inline-block bg-[#063826] text-[#7EE2AE] font-extrabold text-[12px] py-1 px-3.5 rounded-full uppercase tracking-wider mb-2">
              Pengembangan Program
            </span>
            <div class="bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
              <strong class="text-[17px] font-black text-[#063826] block mb-1">Penguatan ICT &amp; Kemitraan Bahasa</strong>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                Integrasi kurikulum berbasis ICT, pemantapan tahfidz metode Yanbu'a, serta kemitraan public speaking global bersama School @america.
              </p>
            </div>
          </div>

          <!-- Item 3 -->
          <div class="rv relative group">
            <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-[#F0B429] shadow-sm"></div>
            <span class="inline-block bg-[#F0B429] text-[#3D2C00] font-extrabold text-[12px] py-1 px-3.5 rounded-full uppercase tracking-wider mb-2">
              2026 — Milad ke-6
            </span>
            <div class="bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
              <strong class="text-[17px] font-black text-[#063826] block mb-1">Mendidik Lebih dari 1000 Santri</strong>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                Memasuki usia 6 tahun dengan 7 program unggulan, 13 pilihan ekstrakurikuler, dan kepercayaan tinggi dari masyarakat Bekasi.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. SAMBUTAN KEPALA SEKOLAH (DRAF RESMI) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E0ECE6]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="bg-gradient-to-br from-[#0A4A30] via-[#063826] to-[#052E22] text-white rounded-[26px] p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

          <div class="relative z-10 max-w-3xl">
            <span class="inline-block bg-[#F0B429]/15 border border-[#F0B429]/50 text-[#FCD34D] font-bold text-[12px] py-1 px-3 rounded-lg mb-6">
              DRAF — menunggu persetujuan Kepala Sekolah
            </span>

            <span class="text-[#FCD34D] text-[72px] font-serif leading-none block -mb-6 opacity-80">“</span>
            
            <blockquote class="text-[16.5px] sm:text-[18px] text-[#D9EDE1] italic leading-relaxed space-y-4 mb-8">
              <p>
                "Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di SMP IT Bina Cendekia Assalam."
              </p>
              <p>
                "Kami percaya masa SMP adalah fondasi terpenting dalam pembentukan karakter dan jati diri anak. Karena itu, selain mengejar prestasi akademik yang teruji, setiap hari anak-anak kami dibiasakan dengan Al-Qur'an, akhlak terpuji, dan keberanian tampil — dalam suasana kelas gender yang nyaman, aman, dan fokus."
              </p>
              <p>
                "Mari bergabung dan bertumbuh bersama — menjadi generasi Qur'ani yang terpercaya, cerdas, dan mandiri. Wassalamu'alaikum warahmatullahi wabarakatuh."
              </p>
            </blockquote>

            <div class="flex items-center gap-4 pt-6 border-t border-white/15">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#F0B429] to-[#C98A12] text-[#063826] flex items-center justify-center font-black text-[18px] shadow-sm">
                K
              </div>
              <div>
                <strong class="text-[16px] font-black text-white block">Kepala Sekolah</strong>
                <span class="text-[13px] text-[#A9D4BC]">SMP IT Bina Cendekia Assalam</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 6. SEMBILAN FASILITAS PENDUKUNG -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="text-center max-w-[700px] mx-auto mb-14">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
            Sarana Belajar
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            9 Fasilitas <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Pendukung KBM</span>
          </h2>
          <p class="text-[#55705F] text-[16px] mt-2.5">
            Sarana lengkap untuk menunjang kenyamanan belajar, praktik sains, teknologi, dan kegiatan ibadah harian.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 7.5h8M8 11h8M8 14.5h5"/></svg>
            </div>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">1. Ruang Belajar Terpisah</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">Ruang kelas nyaman dan ber-AC yang didesain terpisah untuk kelas khusus putra dan putri.</p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9.5 20.5h5M12 16.5v4"/></svg>
            </div>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">2. Lab. Komputer &amp; ICT</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">Praktik teknologi informasi, ujian CBT, dan media pembelajaran digital interaktif.</p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 3a6 6 0 00-3.4 10.9c.8.6 1.4 1.3 1.4 2.6h4c0-1.3.6-2 1.4-2.6A6 6 0 0012 3z"/></svg>
            </div>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">3. Lab. MIPA Sains</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">Peralatan eksperimen biologi, fisika, dan kimia untuk mengasah nalar kritis santri.</p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
            </div>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">4. Perpustakaan &amp; Literasi</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">Koleksi buku keislaman, ensiklopedia sains, dan novel edukasi untuk menumbuhkan minat baca.</p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4 21V10l8-6 8 6v11"/><path d="M9 21v-6h6v6"/></svg>
            </div>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">5. Auditorium &amp; Musholla</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">Tempat sholat berjamaah lima waktu, sima'an Al-Qur'an, dan aula pertemuan kegiatan besar.</p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 3v18M5 8l14 8M19 8L5 16"/></svg>
            </div>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">6. Outdoor Learning Center</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">Area belajar di ruang terbuka hijau yang asri dan segar untuk pembelajaran kontekstual.</p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4 11h16v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z"/><path d="M7 11V8a5 5 0 0110 0v3"/></svg>
            </div>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">7. Kantin Sehat &amp; Gazebo</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">Area istirahat bersih dan higienis dengan sajian makanan sehat bagi santri.</p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2.5"/><path d="M9 8V6.5A2.5 2.5 0 0111.5 4h1A2.5 2.5 0 0115 6.5V8M3 13.5h18"/></svg>
            </div>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">8. Koperasi Pelajar</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">Wadah praktik literasi finansial dan kewirausahaan siswa sejak bangku SMP.</p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M9.5 17.5V6l10-2v11.5"/><circle cx="7" cy="17.5" r="2.5"/><circle cx="17" cy="15.5" r="2.5"/></svg>
            </div>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">9. Ruang Kesenian &amp; Hadroh</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">Studio latihan marawis, hadroh, seni musik Islami, dan kaligrafi santri.</p>
          </div>

        </div>

      </div>
    </section>

  </div>
</template>
