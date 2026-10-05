<template>
  <section class="py-[64px] lg:py-[88px] bg-[#F5F8FF]" id="sekolah">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <!-- Section Header -->
      <div class="text-center max-w-[720px] mx-auto mb-[44px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[7px] px-[14px] rounded-full mb-[16px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#1B5FD9]"></span>
          Sekolah Naungan
        </div>
        <h2 class="gsap-rv text-[clamp(26px,4.6vw,40px)] font-extrabold text-[#0F1E38] tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Dua Satuan Pendidikan <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Unggulan</span>
        </h2>
        <p class="gsap-rv text-[#5A6B8C] text-[clamp(15px,2.4vw,17.5px)] leading-[1.6]">
          Pilihan pendidikan berjenjang dari tingkat menengah pertama hingga kejuruan vokasi dalam satu kawasan kampus terpadu.
        </p>
      </div>

      <!-- 2 Major School Cards Grid -->
      <div class="gsap-rv grid grid-cols-1 lg:grid-cols-2 gap-[28px]">
        <!-- Card 1: SMP IT Bina Cendekia Assalam -->
        <div class="bg-white border border-[#E3EAF7] rounded-[22px] p-[28px] sm:p-[32px] shadow-sm hover:shadow-[0_24px_60px_rgba(10,42,92,.14)] hover:border-[#1B5FD9] transition-all duration-300 flex flex-col justify-between">
          <div>
            <!-- Header Badge -->
            <div class="flex items-center justify-between gap-[12px] mb-[18px] pb-[16px] border-b border-[#E3EAF7]">
              <div class="flex items-center gap-[12px]">
                <img src="/asset/logo.png" alt="Logo SMPIT BCA" class="w-[44px] h-[50px] object-contain">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-[1px] text-[#1B5FD9] block">Jenjang Menengah Pertama</span>
                  <h3 class="text-[20px] font-extrabold text-[#0F1E38] leading-tight">SMP IT Bina Cendekia Assalam</h3>
                </div>
              </div>
              <span class="text-[11.5px] font-extrabold px-[10px] py-[4px] rounded-full bg-[#E0EDFF] text-[#1B5FD9] shrink-0">
                NPSN 70008264
              </span>
            </div>

            <!-- Tagline Identitas -->
            <div class="bg-[#F5F8FF] border-l-4 border-[#1B5FD9] p-[14px_16px] rounded-r-[12px] mb-[18px]">
              <b class="text-[14.5px] text-[#0F1E38] block mb-[2px]">“SMP Rasa Pesantren”</b>
              <p class="gsap-rv text-[13px] text-[#5A6B8C]">Membentuk generasi Qur’ani dengan kelas berbasis gender dan Metode Yanbu’a.</p>
            </div>

            <!-- Description -->
            <p class="gsap-rv text-[#33415C] text-[14.5px] leading-[1.65] mb-[22px]">
              Sekolah menengah pertama Islam terpadu dengan pemisahan kelas putra dan putri secara terstruktur, penguatan literasi digital berbasis teknologi informasi, dan bimbingan baca Al-Qur’an bersanad Metode Yanbu’a. Berdiri melalui SK Operasional 2020 (Milad ke-6 tahun 2026).
            </p>

            <!-- Key Features Badges -->
            <div class="mb-[28px]">
              <span class="text-[12px] font-bold text-[#5A6B8C] uppercase tracking-[1px] block mb-[10px]">Program &amp; Fasilitas Kunci:</span>
              <div class="flex flex-wrap gap-[8px]">
                <span class="text-[12.5px] font-semibold py-[6px] px-[12px] rounded-[10px] bg-[#F5F8FF] text-[#0F1E38] border border-[#E3EAF7]">
                  Kelas Berbasis Gender (Putra/Putri)
                </span>
                <span class="text-[12.5px] font-semibold py-[6px] px-[12px] rounded-[10px] bg-[#F5F8FF] text-[#0F1E38] border border-[#E3EAF7]">
                  Metode Yanbu’a Al-Qur'an
                </span>
                <span class="text-[12.5px] font-semibold py-[6px] px-[12px] rounded-[10px] bg-[#F5F8FF] text-[#0F1E38] border border-[#E3EAF7]">
                  Pembelajaran Berbasis TI
                </span>
                <span class="text-[12.5px] font-semibold py-[6px] px-[12px] rounded-[10px] bg-[#F5F8FF] text-[#0F1E38] border border-[#E3EAF7]">
                  Lab Komputer &amp; Perpustakaan
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Button -->
          <div class="pt-[20px] border-t border-[#E3EAF7] flex flex-col sm:flex-row items-center justify-between gap-[12px]">
            <span class="text-[13px] text-[#5A6B8C]">Website resmi sekolah:</span>
            <a 
              href="https://smpitbca.sch.id" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-[8px] font-bold text-[14px] text-white bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] py-[11px] px-[22px] rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all"
            >
              <span>Kunjungi smpitbca.sch.id</span>
            </a>
          </div>
        </div>

        <!-- Card 2: SMK IT Attaqwa 9 -->
        <div class="bg-white border border-[#E3EAF7] rounded-[22px] p-[28px] sm:p-[32px] shadow-sm hover:shadow-[0_24px_60px_rgba(10,42,92,.14)] hover:border-[#1B5FD9] transition-all duration-300 flex flex-col justify-between">
          <div>
            <!-- Header Badge -->
            <div class="flex items-center justify-between gap-[12px] mb-[18px] pb-[16px] border-b border-[#E3EAF7]">
              <div class="flex items-center gap-[12px]">
                <img src="/asset/logo.png" alt="Logo SMK IT Attaqwa 9" class="w-[44px] h-[50px] object-contain">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-[1px] text-[#D97706] block">Jenjang Menengah Kejuruan</span>
                  <h3 class="text-[20px] font-extrabold text-[#0F1E38] leading-tight">SMK IT Attaqwa 9</h3>
                </div>
              </div>
              <span class="text-[11.5px] font-extrabold px-[10px] py-[4px] rounded-full bg-[#FEF3C7] text-[#92400E] shrink-0">
                NPSN 69940449
              </span>
            </div>

            <!-- Tagline Identitas -->
            <div class="bg-[#F5F8FF] border-l-4 border-[#F0B429] p-[14px_16px] rounded-r-[12px] mb-[18px]">
              <b class="text-[14.5px] text-[#0F1E38] block mb-[2px]">“SMK Rasa Pesantren”</b>
              <p class="gsap-rv text-[13px] text-[#5A6B8C]">Membentuk generasi vokasi Qur’ani: siap kerja, siap kuliah, siap wirausaha.</p>
            </div>

            <!-- Description -->
            <p class="gsap-rv text-[#33415C] text-[14.5px] leading-[1.65] mb-[22px]">
              Sekolah kejuruan Islam terpadu dengan 6 program keahlian siap industri, fasilitas Balai Latihan Kerja (BLK Komunitas), kemitraan DUDIKA, dan pembinaan karakter pesantren harian. Tercatat 413 siswa aktif (Dapodik 2025/2026).
            </p>

            <!-- 6 Program Keahlian Grid -->
            <div class="mb-[28px]">
              <span class="text-[12px] font-bold text-[#5A6B8C] uppercase tracking-[1px] block mb-[10px]">6 Program Keahlian Terbuka:</span>
              <div class="gsap-rv grid grid-cols-2 sm:grid-cols-3 gap-[8px]">
                <div class="p-[8px_10px] rounded-[10px] bg-[#F5F8FF] border border-[#E3EAF7] text-center">
                  <b class="text-[13px] text-[#0F1E38] block font-bold">AKL</b>
                  <small class="text-[11px] text-[#5A6B8C]">Akuntansi &amp; Keuangan</small>
                </div>
                <div class="p-[8px_10px] rounded-[10px] bg-[#F5F8FF] border border-[#E3EAF7] text-center">
                  <b class="text-[13px] text-[#0F1E38] block font-bold">OTKP</b>
                  <small class="text-[11px] text-[#5A6B8C]">Tata Kelola Perkantoran</small>
                </div>
                <div class="p-[8px_10px] rounded-[10px] bg-[#F5F8FF] border border-[#E3EAF7] text-center">
                  <b class="text-[13px] text-[#0F1E38] block font-bold">TKJ</b>
                  <small class="text-[11px] text-[#5A6B8C]">Teknik Komputer Jaringan</small>
                </div>
                <div class="p-[8px_10px] rounded-[10px] bg-[#F5F8FF] border border-[#E3EAF7] text-center">
                  <b class="text-[13px] text-[#0F1E38] block font-bold">DKV / MM</b>
                  <small class="text-[11px] text-[#5A6B8C]">Desain Multimedia</small>
                </div>
                <div class="p-[8px_10px] rounded-[10px] bg-[#F5F8FF] border border-[#E3EAF7] text-center">
                  <b class="text-[13px] text-[#0F1E38] block font-bold">TBSM</b>
                  <small class="text-[11px] text-[#5A6B8C]">Bisnis Sepeda Motor</small>
                </div>
                <div class="p-[8px_10px] rounded-[10px] bg-[#F5F8FF] border border-[#E3EAF7] text-center">
                  <b class="text-[13px] text-[#0F1E38] block font-bold">TKR</b>
                  <small class="text-[11px] text-[#5A6B8C]">Kendaraan Ringan</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action Button -->
          <div class="pt-[20px] border-t border-[#E3EAF7] flex flex-col sm:flex-row items-center justify-between gap-[12px]">
            <span class="text-[13px] text-[#5A6B8C]">Website resmi sekolah:</span>
            <a 
              href="https://smkitattaqwa9.sch.id" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-[8px] font-bold text-[14px] text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] py-[11px] px-[22px] rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all"
            >
              <span>Kunjungi smkitattaqwa9.sch.id</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
