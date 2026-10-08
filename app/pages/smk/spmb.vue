<script setup lang="ts">
import { ref } from 'vue'
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smk' })

// State interaktif
const activeTab = ref<'jadwal' | 'syarat' | 'beasiswa' | 'alur'>('jadwal')
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[170px] sm:pt-[180px] md:pt-[190px] lg:pt-[200px] pb-[70px] lg:pb-[80px] bg-gradient-to-br from-[#0C2C61] to-[#061A3E]">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
      
      <!-- Ambient Glows -->
      <div class="absolute -top-32 right-0 w-[500px] h-[500px] bg-[#1B5FD9]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-[#2B7CD8]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <!-- Breadcrumb -->
        <div class="text-[12.5px] text-[#8FA6CC] font-semibold mb-3.5 flex items-center gap-1.5">
          <NuxtLink to="/smk" class="hover:text-white transition-colors">Home</NuxtLink>
          <span class="text-[#4C8DFF]">/</span>
          <b class="text-[#FCD34D]">SPMB 2027/2028</b>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#7DB9F5] uppercase py-1 px-3.5 rounded-full bg-white/10 backdrop-blur-md mb-3 border border-white/15">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Penerimaan Murid Baru
            </span>
            <h1 class="text-[clamp(32px,4.5vw,50px)] font-black tracking-[-0.02em] leading-tight mb-3">
              SPMB <span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">2027/2028</span>
            </h1>
            <p class="text-[#B9CBE8] max-w-[680px] text-[15.5px] md:text-[17px] leading-relaxed">
              Seleksi Penerimaan Murid Baru SMK IT Attaqwa 9 — kuota terbatas hanya <strong class="text-white">7 rombel</strong>. Tersedia 6 konsentrasi keahlian vokasi industri dan program beasiswa prestasi/tahfidz.
            </p>
          </div>

          <!-- Action Buttons Hero -->
          <div class="flex flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0 self-start lg:self-end">
            <NuxtLink 
              to="/spmb" 
              class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all"
            >
              Mulai Daftar Online
              <svg class="w-4 h-4 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </NuxtLink>
            <a 
              href="https://wa.me/6281210949978?text=Halo%20Panitia%20SPMB%20SMK%20IT%20Attaqwa%209,%20saya%20ingin%20konsultasi%20pendaftaran" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center gap-2 font-bold text-[14.5px] py-3.5 px-6 rounded-[14px] bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.871.815 2.796.815 3.182 0 5.768-2.587 5.769-5.767.001-3.181-2.585-5.766-5.769-5.766zm3.435 8.204c-.144.405-.838.775-1.171.825-.31.046-.713.064-2.12-.518-1.794-.741-2.934-2.56-3.023-2.679-.089-.119-.729-.97-.729-1.85 0-.88.46-1.314.624-1.493.164-.179.358-.224.478-.224.12 0 .239.001.344.006.11.005.258-.042.404.309.15.358.513 1.25.558 1.34.045.09.075.195.015.314-.06.12-.09.195-.179.3-.09.104-.188.232-.269.313-.09.09-.184.188-.079.368.105.18.467.771 1.002 1.248.689.614 1.27.804 1.45.894.18.09.284.075.389-.045.105-.12.449-.523.569-.703.12-.179.239-.149.398-.09.16.06 1.017.48 1.192.568.175.09.292.135.337.21.045.075.045.435-.099.84z"/></svg>
              Konsultasi WA
            </a>
          </div>
        </div>

        <!-- 4 Quick Fact Highlights -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mt-10 pt-8 border-t border-white/10">
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span class="text-[12px] font-bold text-[#8FA6CC] block uppercase tracking-wider">Biaya Registrasi</span>
            <span class="text-[20px] font-black text-white">Rp50.000</span>
            <span class="text-[11.5px] text-[#4ADE80] font-semibold block mt-0.5">Gratis bagi yatim &amp; juara</span>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span class="text-[12px] font-bold text-[#8FA6CC] block uppercase tracking-wider">Kapasitas Kelas</span>
            <span class="text-[20px] font-black text-[#FCD34D]">7 Rombel</span>
            <span class="text-[11.5px] text-[#C9D8F2] font-semibold block mt-0.5">Rasio praktik ideal</span>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span class="text-[12px] font-bold text-[#8FA6CC] block uppercase tracking-wider">Konsentrasi</span>
            <span class="text-[20px] font-black text-white">6 Jurusan</span>
            <span class="text-[11.5px] text-[#C9D8F2] font-semibold block mt-0.5">Bisnis, Otomotif, IT</span>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span class="text-[12px] font-bold text-[#8FA6CC] block uppercase tracking-wider">Pendaftaran Inden</span>
            <span class="text-[20px] font-black text-[#7DB9F5]">2028/2029</span>
            <span class="text-[11.5px] text-[#C9D8F2] font-semibold block mt-0.5">Kunci kursi lebih awal</span>
          </div>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. JADWAL TIGA GELOMBANG SELEKSI (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section id="jadwal" class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Header -->
        <div class="max-w-[720px] mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Jadwal Penerimaan
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            3 Gelombang <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Pendaftaran Resmi</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16px] md:text-[17px] mt-2.5 leading-relaxed">
            Pendaftaran dibuka bertahap. Segera amankan pilihan jurusan sebelum kuota per rombel terpenuhi.
          </p>
        </div>

        <!-- 3 Waves Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <!-- Gelombang I (Featured Card) -->
          <div class="rv group relative bg-white border-2 border-[#1B5FD9] rounded-[24px] p-7 shadow-[0_12px_36px_rgba(27,95,217,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div class="absolute top-0 right-0 bg-gradient-to-l from-[#1B5FD9] to-[#0A2A5C] text-white font-extrabold text-[11px] uppercase tracking-wider py-1.5 px-4 rounded-bl-xl shadow-sm">
              Gelombang Utama
            </div>

            <div>
              <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center font-black text-[18px] mb-5">
                01
              </div>
              <h3 class="text-[22px] font-black text-[#061A3E] mb-1">Gelombang I</h3>
              <div class="text-[13.5px] font-bold text-[#1B5FD9] mb-4">01 Sep – 26 Des 2026</div>
              
              <div class="space-y-3 pt-4 border-t border-[#EEF3FA] text-[14px]">
                <div class="flex items-start gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">✓</div>
                  <div>
                    <span class="text-[#5A6B8C] block text-[12.5px]">Tes Seleksi Masuk</span>
                    <strong class="text-[#061A3E]">Ahad, 27 Des 2026</strong>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">✓</div>
                  <div>
                    <span class="text-[#5A6B8C] block text-[12.5px]">Pengumuman Hasil</span>
                    <strong class="text-[#061A3E]">30 Des 2026</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6 mt-6 border-t border-[#EEF3FA]">
              <span class="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#166534] bg-[#DCFCE7] py-1 px-3 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></span>
                Prioritas Rombel &amp; Beasiswa
              </span>
            </div>
          </div>

          <!-- Gelombang II -->
          <div class="rv group bg-white border border-[#E2ECF8] hover:border-[#1B5FD9]/40 rounded-[24px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_20px_40px_rgba(10,42,92,0.1)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-[14px] bg-[#F1F5F9] text-[#0A2A5C] flex items-center justify-center font-black text-[18px] mb-5">
                02
              </div>
              <h3 class="text-[22px] font-black text-[#061A3E] mb-1">Gelombang II</h3>
              <div class="text-[13.5px] font-bold text-[#5A6B8C] mb-4">01 Jan – 24 Apr 2027</div>
              
              <div class="space-y-3 pt-4 border-t border-[#EEF3FA] text-[14px]">
                <div class="flex items-start gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-[#F1F5F9] text-[#5A6B8C] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">✓</div>
                  <div>
                    <span class="text-[#5A6B8C] block text-[12.5px]">Tes Seleksi Masuk</span>
                    <strong class="text-[#061A3E]">Ahad, 25 Apr 2027</strong>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-[#F1F5F9] text-[#5A6B8C] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">✓</div>
                  <div>
                    <span class="text-[#5A6B8C] block text-[12.5px]">Pengumuman Hasil</span>
                    <strong class="text-[#061A3E]">28 Apr 2027</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6 mt-6 border-t border-[#EEF3FA]">
              <span class="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0A2A5C] bg-[#F1F5F9] py-1 px-3 rounded-full">
                Pendaftaran Reguler Tahap 2
              </span>
            </div>
          </div>

          <!-- Gelombang Tambahan -->
          <div class="rv group bg-white border border-[#E2ECF8] hover:border-[#1B5FD9]/40 rounded-[24px] p-7 shadow-[0_4px_24px_rgba(10,42,92,0.05)] hover:shadow-[0_20px_40px_rgba(10,42,92,0.1)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-[14px] bg-[#F1F5F9] text-[#0A2A5C] flex items-center justify-center font-black text-[18px] mb-5">
                03
              </div>
              <h3 class="text-[22px] font-black text-[#061A3E] mb-1">Gelombang Tambahan</h3>
              <div class="text-[13.5px] font-bold text-[#5A6B8C] mb-4">26 Apr – 27 Jun 2027</div>
              
              <div class="space-y-3 pt-4 border-t border-[#EEF3FA] text-[14px]">
                <div class="flex items-start gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-[#F1F5F9] text-[#5A6B8C] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">✓</div>
                  <div>
                    <span class="text-[#5A6B8C] block text-[12.5px]">Tes Seleksi Masuk</span>
                    <strong class="text-[#061A3E]">Setiap Hari Ahad</strong>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-[#F1F5F9] text-[#5A6B8C] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">✓</div>
                  <div>
                    <span class="text-[#5A6B8C] block text-[12.5px]">Pengumuman Hasil</span>
                    <strong class="text-[#061A3E]">2 Hari Setelah Tes</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6 mt-6 border-t border-[#EEF3FA]">
              <span class="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#92400E] bg-[#FEF3C7] py-1 px-3 rounded-full">
                Khusus Jika Masih Ada Sisa Kuota
              </span>
            </div>
          </div>

        </div>

        <!-- Info Jam Layanan Sekretariat SPMB -->
        <div class="bg-white border border-[#E2ECF8] rounded-[20px] p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h4 class="text-[16px] font-extrabold text-[#061A3E]">Jam Pelayanan Sekretariat SPMB</h4>
              <p class="text-[14px] text-[#5A6B8C]">
                <strong>Senin – Jumat:</strong> 08.00 – 15.00 WIB &nbsp;·&nbsp; <strong>Sabtu – Ahad:</strong> 09.00 – 14.00 WIB
              </p>
            </div>
          </div>
          <a 
            href="https://wa.me/6281210949978" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="py-2.5 px-5 rounded-xl bg-[#F8FAFC] hover:bg-[#E8F0FE] border border-[#E2ECF8] text-[#1B5FD9] font-bold text-[13.5px] transition-colors shrink-0 flex items-center gap-2"
          >
            <span>Hubungi Sekretariat</span>
            <span>→</span>
          </a>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. ALUR TAHAPAN PENDAFTARAN (4 STEP TIMELINE) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7] relative overflow-hidden">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="text-center max-w-[700px] mx-auto mb-14">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Prosedur Masuk
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            4 Langkah Mudah <span class="bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#4C8DFF] bg-clip-text text-transparent">Pendaftaran Santri</span>
          </h2>
          <p class="text-[#5A6B8C] text-[16px] mt-2.5">
            Proses seleksi transparan, berbasis Computer Based Test (CBT) mandiri dan penilaian karakter Islami.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          <!-- Step 1 -->
          <div class="rv bg-[#F8FAFC] border border-[#E2ECF8] rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="w-10 h-10 rounded-xl bg-[#0A2A5C] text-white flex items-center justify-center font-black text-[16px] shadow-sm">1</span>
                <span class="text-[12px] font-bold text-[#1B5FD9] bg-[#E8F0FE] py-1 px-2.5 rounded-full">Online / Offline</span>
              </div>
              <h3 class="text-[17.5px] font-black text-[#061A3E] mb-2">Formulir &amp; Registrasi</h3>
              <p class="text-[13.5px] text-[#5A6B8C] leading-relaxed">
                Isi data calon siswa di portal SPMB Online dan bayar biaya registrasi Rp50.000 (gratis untuk yatim &amp; berprestasi).
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#EEF3FA] text-[12.5px] font-bold text-[#0A2A5C]">
              ID Pendaftaran Digenerate
            </div>
          </div>

          <!-- Step 2 -->
          <div class="rv bg-[#F8FAFC] border border-[#E2ECF8] rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="w-10 h-10 rounded-xl bg-[#0A2A5C] text-white flex items-center justify-center font-black text-[16px] shadow-sm">2</span>
                <span class="text-[12px] font-bold text-[#5A6B8C] bg-white border border-[#E2ECF8] py-1 px-2.5 rounded-full">Dokumen</span>
              </div>
              <h3 class="text-[17.5px] font-black text-[#061A3E] mb-2">Kelengkapan Berkas</h3>
              <p class="text-[13.5px] text-[#5A6B8C] leading-relaxed">
                Serahkan fotokopi ijazah/SKL, NISN, KK, Akta Kelahiran, dan pas foto ke sekretariat atau upload melalui sistem.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#EEF3FA] text-[12.5px] font-bold text-[#0A2A5C]">
              Verifikasi Panitia
            </div>
          </div>

          <!-- Step 3 -->
          <div class="rv bg-[#F8FAFC] border border-[#E2ECF8] rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="w-10 h-10 rounded-xl bg-[#0A2A5C] text-white flex items-center justify-center font-black text-[16px] shadow-sm">3</span>
                <span class="text-[12px] font-bold text-[#1B5FD9] bg-[#E8F0FE] py-1 px-2.5 rounded-full">Tes Seleksi</span>
              </div>
              <h3 class="text-[17.5px] font-black text-[#061A3E] mb-2">CBT &amp; Wawancara</h3>
              <p class="text-[13.5px] text-[#5A6B8C] leading-relaxed">
                Mengikuti ujian CBT akademik, tes baca/tahfidz Al-Qur'an, dan sesi wawancara kesiapan belajar orang tua/wali santri.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#EEF3FA] text-[12.5px] font-bold text-[#0A2A5C]">
              Lab Komputer SMK
            </div>
          </div>

          <!-- Step 4 -->
          <div class="rv bg-[#F8FAFC] border border-[#E2ECF8] rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="w-10 h-10 rounded-xl bg-[#0A2A5C] text-white flex items-center justify-center font-black text-[16px] shadow-sm">4</span>
                <span class="text-[12px] font-bold text-[#166534] bg-[#DCFCE7] py-1 px-2.5 rounded-full">Resmi</span>
              </div>
              <h3 class="text-[17.5px] font-black text-[#061A3E] mb-2">Hasil &amp; Daftar Ulang</h3>
              <p class="text-[13.5px] text-[#5A6B8C] leading-relaxed">
                Pengumuman kelulusan melalui portal dan WhatsApp, dilanjutkan penyelesaian administrasi daftar ulang rombel.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#EEF3FA] text-[12.5px] font-bold text-[#166534]">
              Resmi Santri Attaqwa
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. PERSYARATAN & BEASISWA VOKASI (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Persyaratan Berkas (5 Cols) -->
          <div class="lg:col-span-5 bg-white border border-[#E2ECF8] rounded-[24px] p-7 sm:p-8 shadow-[0_8px_30px_rgba(10,42,92,0.06)]">
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Dokumen Masuk
            </span>
            <h3 class="text-[22px] sm:text-[24px] font-black text-[#061A3E] mb-2">Persyaratan Pendaftaran</h3>
            <p class="text-[14px] text-[#5A6B8C] mb-6">Berkas wajib diserahkan dalam map warna sesuai jurusan saat verifikasi:</p>
            
            <ol class="space-y-3 text-[14.5px] text-[#0F1E38]">
              <li class="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF3FA]">
                <span class="w-6 h-6 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong class="text-[#061A3E] block">Biaya Registrasi Rp50.000</strong>
                  <span class="text-[12.5px] text-[#5A6B8C]">Gratis khusus siswa berprestasi &amp; yatim piatu.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF3FA]">
                <span class="w-6 h-6 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong class="text-[#061A3E] block">Formulir Pendaftaran</strong>
                  <span class="text-[12.5px] text-[#5A6B8C]">Tercetak dari sistem SPMB Online / fisik.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF3FA]">
                <span class="w-6 h-6 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong class="text-[#061A3E] block">Fotokopi Ijazah / SKHUN (3 Lembar)</strong>
                  <span class="text-[12.5px] text-[#5A6B8C]">Telah dilegalisir basah oleh kepala sekolah asal.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF3FA]">
                <span class="w-6 h-6 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <strong class="text-[#061A3E] block">Fotokopi NISN &amp; Akta Kelahiran (3 Lembar)</strong>
                  <span class="text-[12.5px] text-[#5A6B8C]">NISN tepat 10 digit terdaftar di Dapodik.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF3FA]">
                <span class="w-6 h-6 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                <div>
                  <strong class="text-[#061A3E] block">Fotokopi Kartu Keluarga (3 Lembar)</strong>
                  <span class="text-[12.5px] text-[#5A6B8C]">NIK orang tua/wali valid 16 digit.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#EEF3FA]">
                <span class="w-6 h-6 rounded-lg bg-[#E8F0FE] text-[#1B5FD9] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">6</span>
                <div>
                  <strong class="text-[#061A3E] block">Pas Foto Hitam Putih 3×4 (3 Lembar)</strong>
                  <span class="text-[12.5px] text-[#5A6B8C]">Seragam sekolah asal, latar rapi.</span>
                </div>
              </li>
            </ol>
          </div>

          <!-- Beasiswa Vokasi (7 Cols) -->
          <div class="lg:col-span-7">
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Bantuan Biaya Pendidikan
            </span>
            <h3 class="text-[22px] sm:text-[26px] font-black text-[#061A3E] mb-2">6 Skema Beasiswa Vokasi</h3>
            <p class="text-[#5A6B8C] text-[15px] mb-6">
              Yayasan Attaqwa menyediakan program afirmasi dan apresiasi prestasi agar tidak ada anak putus sekolah karena kendala biaya.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-sm hover:border-[#1B5FD9]/40 hover:shadow-md transition-all">
                <div class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M2.5 9L12 4.5 21.5 9 12 13.5 2.5 9z"/><path d="M6.5 11.3V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.7M21.5 9V14"/></svg>
                </div>
                <h4 class="text-[16px] font-black text-[#061A3E] mb-1">Gratis Uang Pangkal</h4>
                <p class="text-[13px] text-[#5A6B8C] leading-relaxed">
                  Pembebasan biaya uang gedung/pangkal untuk seluruh santri penerima beasiswa afirmasi.
                </p>
              </div>

              <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-sm hover:border-[#1B5FD9]/40 hover:shadow-md transition-all">
                <div class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="14.5" r="4.8"/><path d="M9.2 10.8L5.5 3.5h5.6L12 6l.9-2.5h5.6l-3.7 7.3"/></svg>
                </div>
                <h4 class="text-[16px] font-black text-[#061A3E] mb-1">Siswa Berprestasi</h4>
                <p class="text-[13px] text-[#5A6B8C] leading-relaxed">
                  Gratis SPP bagi juara kelas (ranking 1–3), juara LKS, MTQ, tahfidz, atau olimpiade tingkat kab/provinsi.
                </p>
              </div>

              <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-sm hover:border-[#1B5FD9]/40 hover:shadow-md transition-all">
                <div class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 20s-7.2-4.6-9.3-9.2a5 5 0 019.3-2.9A5 5 0 0121.3 11c-2.1 4.6-9.3 9-9.3 9z"/></svg>
                </div>
                <h4 class="text-[16px] font-black text-[#061A3E] mb-1">Yatim &amp; Anak Guru</h4>
                <p class="text-[13px] text-[#5A6B8C] leading-relaxed">
                  Pembebasan SPP penuh bagi santri yatim serta apresiasi khusus bagi putra/putri tenaga pendidik.
                </p>
              </div>

              <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-sm hover:border-[#1B5FD9]/40 hover:shadow-md transition-all">
                <div class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
                <h4 class="text-[16px] font-black text-[#061A3E] mb-1">Afirmasi KETM</h4>
                <p class="text-[13px] text-[#5A6B8C] leading-relaxed">
                  Bantuan biaya sekolah bagi keluarga prasejahtera dengan melampirkan SKTM / KIP / PKH resmi.
                </p>
              </div>

              <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-sm hover:border-[#1B5FD9]/40 hover:shadow-md transition-all">
                <div class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M9 4L3.5 6.8 5.3 10l1.9-1.1V20h9.6V8.9l1.9 1.1 1.8-3.2L15 4a3 3 0 01-6 0z"/></svg>
                </div>
                <h4 class="text-[16px] font-black text-[#061A3E] mb-1">Paket Seragam &amp; Buku</h4>
                <p class="text-[13px] text-[#5A6B8C] leading-relaxed">
                  Bantuan seragam kejuruan, baju muslim, serta modul buku panduan praktek bagi penerima khusus.
                </p>
              </div>

              <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-sm hover:border-[#1B5FD9]/40 hover:shadow-md transition-all">
                <div class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h4 class="text-[16px] font-black text-[#061A3E] mb-1">Subsidi Silang 3 Tahun</h4>
                <p class="text-[13px] text-[#5A6B8C] leading-relaxed">
                  Program pendampingan dana pendidikan berkesinambungan dari alumni dan donatur yayasan.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. SECTION CTA PENDAFTARAN (Grounded Hero Student Cutout) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-t border-[#E3EAF7]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="bg-[radial-gradient(700px_400px_at_85%_100%,rgba(43,124,216,0.45),transparent_65%),linear-gradient(135deg,#0C2C61_0%,#0A2A5C_55%,#061A3E_100%)] text-white rounded-[24px] p-6 sm:p-8 md:px-12 md:pt-12 pb-0 shadow-[0_24px_60px_rgba(10,42,92,0.2)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative overflow-hidden">
          
          <!-- Background Deco -->
          <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

          <!-- Teks Kiri -->
          <div class="lg:col-span-7 relative z-10 pb-8 md:pb-12">
            <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#FCD34D] uppercase mb-3">Penerimaan Murid Baru</span>
            <h2 class="text-[clamp(26px,4vw,40px)] font-black tracking-[-0.02em] leading-tight mb-4">
              Amankan kursimu.<br><span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">7 rombel</span>, 3 gelombang.
            </h2>
            <p class="text-[#C9D8F2] text-[15.5px] leading-relaxed mb-8 max-w-[500px]">
              SPMB 2027/2028 telah dibuka dengan biaya registrasi hanya <b class="text-white">Rp50.000</b>. Pilih jurusan vokasi impianmu dan raih beasiswa prestasi/tahfidz.
            </p>

            <!-- Tombol Aksi -->
            <div class="flex flex-wrap items-center gap-4 mb-8">
              <NuxtLink 
                to="/spmb" 
                class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all duration-150"
              >
                Mulai Pendaftaran Online
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </NuxtLink>

              <NuxtLink 
                to="/smk/kontak" 
                class="text-[#C9D8F2] hover:text-white font-bold text-[14.5px] underline underline-offset-4 transition-colors"
              >
                atau hubungi panitia
              </NuxtLink>
            </div>

            <!-- Proof Points -->
            <div class="flex flex-wrap items-center gap-5 text-[13px] font-bold text-[#A9BDDD]">
              <span class="inline-flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#4ADE80] stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                Konsultasi jurusan gratis
              </span>
              <span class="inline-flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#4ADE80] stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                Respon &lt; 1×24 jam
              </span>
            </div>
          </div>

          <!-- Visual Kanan: Foto Hero Siswa Cutout Grounded -->
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

      </div>
    </section>

  </div>
</template>
