<template>
  <section class="py-[64px] lg:py-[88px] bg-white" id="pembinaan">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <!-- Section Header -->
      <div class="text-center max-w-[720px] mx-auto mb-[44px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[7px] px-[14px] rounded-full mb-[16px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#1B5FD9]"></span>
          Kultur Pesantren Modern
        </div>
        <h2 class="text-[clamp(26px,4.6vw,40px)] font-extrabold text-[#0F1E38] tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Pembiasaan Harian <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Santri di Kampus</span>
        </h2>
        <p class="text-[#5A6B8C] text-[clamp(15px,2.4vw,17.5px)] leading-[1.6]">
          Pendidikan karakter tidak sekadar teori di dalam kelas, melainkan pembiasaan terstruktur dari pagi hingga kepulangan santri.
        </p>
      </div>

      <!-- Campus Culture Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        <!-- Item 1: Apel Pagi -->
        <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[20px] p-[26px] hover:border-[#1B5FD9] hover:bg-white hover:shadow-[0_20px_50px_rgba(10,42,92,.08)] transition-all duration-250">
          <div class="flex items-center justify-between mb-[14px]">
            <span class="text-[12.5px] font-extrabold tracking-[1px] text-[#1B5FD9] uppercase">06.45 WIB</span>
            <span class="text-[11px] font-bold px-[8px] py-[3px] rounded-full bg-[#E0EDFF] text-[#1B5FD9]">Setiap Hari</span>
          </div>
          <h3 class="text-[18px] font-extrabold text-[#0F1E38] mb-[8px]">
            Apel Komando Semangat Pagi
          </h3>
          <p class="text-[#5A6B8C] text-[14px] leading-[1.6]">
            Membentuk kedisiplinan, kesiapan mental, dan semangat belajar sejak awal hari melalui baris-berbaris dan evaluasi ketertiban.
          </p>
        </div>

        <!-- Item 2: Sima'an Quran -->
        <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[20px] p-[26px] hover:border-[#1B5FD9] hover:bg-white hover:shadow-[0_20px_50px_rgba(10,42,92,.08)] transition-all duration-250">
          <div class="flex items-center justify-between mb-[14px]">
            <span class="text-[12.5px] font-extrabold tracking-[1px] text-[#1B5FD9] uppercase">Jadwal Harian</span>
            <span class="text-[11px] font-bold px-[8px] py-[3px] rounded-full bg-[#DCFCE7] text-[#166534]">Al-Qur’an</span>
          </div>
          <h3 class="text-[18px] font-extrabold text-[#0F1E38] mb-[8px]">
            Sima’an Al-Qur’an Rutin
          </h3>
          <p class="text-[#5A6B8C] text-[14px] leading-[1.6]">
            Pembacaan bersama surat-surat pilihan: Al-Waqi’ah (Selasa–Rabu), Al-Mulk (Kamis), dan Surat Yasin pada hari Jumat pagi.
          </p>
        </div>

        <!-- Item 3: Tawasul bil Fatihah -->
        <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[20px] p-[26px] hover:border-[#1B5FD9] hover:bg-white hover:shadow-[0_20px_50px_rgba(10,42,92,.08)] transition-all duration-250">
          <div class="flex items-center justify-between mb-[14px]">
            <span class="text-[12.5px] font-extrabold tracking-[1px] text-[#1B5FD9] uppercase">Tradisi Attaqwa</span>
            <span class="text-[11px] font-bold px-[8px] py-[3px] rounded-full bg-[#FEF3C7] text-[#92400E]">Sanad Ilmu</span>
          </div>
          <h3 class="text-[18px] font-extrabold text-[#0F1E38] mb-[8px]">
            Tawasul bil Fatihah
          </h3>
          <p class="text-[#5A6B8C] text-[14px] leading-[1.6]">
            Menghidupkan doa dan sambung sanad keilmuan kepada para pendiri dan guru besar sesuai tradisi mulia Perguruan Attaqwa.
          </p>
        </div>

        <!-- Item 4: Kedisiplinan & Kerapihan -->
        <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[20px] p-[26px] hover:border-[#1B5FD9] hover:bg-white hover:shadow-[0_20px_50px_rgba(10,42,92,.08)] transition-all duration-250">
          <div class="flex items-center justify-between mb-[14px]">
            <span class="text-[12.5px] font-extrabold tracking-[1px] text-[#1B5FD9] uppercase">Kultur Akhlak</span>
            <span class="text-[11px] font-bold px-[8px] py-[3px] rounded-full bg-[#F1F5F9] text-[#475569]">Ketertiban</span>
          </div>
          <h3 class="text-[18px] font-extrabold text-[#0F1E38] mb-[8px]">
            Kedisiplinan &amp; Kerapihan
          </h3>
          <p class="text-[#5A6B8C] text-[14px] leading-[1.6]">
            Standar penampilan santri yang rapi, tertata, serta etika kesopanan tinggi dalam interaksi antar-siswa dan dengan dewan guru.
          </p>
        </div>

        <!-- Item 5: Kolaborasi Mitra -->
        <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[20px] p-[26px] lg:col-span-2 hover:border-[#1B5FD9] hover:bg-white hover:shadow-[0_20px_50px_rgba(10,42,92,.08)] transition-all duration-250">
          <div class="flex items-center justify-between mb-[14px]">
            <span class="text-[12.5px] font-extrabold tracking-[1px] text-[#1B5FD9] uppercase">Sinergi Komunitas</span>
            <span class="text-[11px] font-bold px-[8px] py-[3px] rounded-full bg-[#E0EDFF] text-[#1B5FD9]">Mitra Eksternal</span>
          </div>
          <h3 class="text-[18px] font-extrabold text-[#0F1E38] mb-[8px]">
            Program Edukasi &amp; Kesehatan Terpadu
          </h3>
          <p class="text-[#5A6B8C] text-[14px] leading-[1.6]">
            Kolaborasi aktif bersama mitra seperti Astra Syariah untuk penguatan literasi keuangan syariah dan UPTD Puskesmas Bahagia untuk pemeliharaan berkala kesehatan jasmani seluruh peserta didik.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
