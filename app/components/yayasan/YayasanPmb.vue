<template>
  <section 
    id="pmb"
    class="py-[64px] lg:py-[88px] text-white relative overflow-hidden bg-gradient-to-br from-[#0A2A5C] via-[#123E85] to-[#1B5FD9] bg-[#0A2A5C]"
  >
    <!-- Ambient Glow & Pattern -->
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:30px_30px] pointer-events-none" aria-hidden="true"></div>

    <div class="relative w-[min(1180px,100%-40px)] mx-auto">
      <!-- Section Header -->
      <div class="mb-[36px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#FDE68A] py-[7px] px-[14px] rounded-full mb-[16px] bg-white/[0.15] border border-white/25">
          <span class="w-[7px] h-[7px] rounded-full bg-[#FDE68A]"></span>
          PMB 2027/2028
        </div>
        <h2 class="text-[clamp(26px,4.6vw,42px)] font-extrabold text-white tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Penerimaan Murid Baru<br>Tahun Ajaran 2027/2028 Telah Dibuka
        </h2>
        <p class="text-[#C9D9F5] text-[clamp(15px,2.4vw,17.5px)] max-w-[680px]">
          Pendaftaran dibuka untuk SMP IT Bina Cendekia Assalam &amp; SMK IT Attaqwa 9 dengan total <b>7 Rombel</b>. Tersedia pula kesempatan pendaftaran <b>Jalur Inden T.A 2028/2029</b>.
        </p>
      </div>

      <!-- Main PMB Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[28px] items-start">
        <!-- Left: Gelombang Diskon Table -->
        <div class="rounded-[22px] p-[26px] sm:p-[32px] bg-white/[0.08] border border-white/[0.18] backdrop-blur-md">
          <h3 class="text-[20px] font-extrabold text-white mb-[8px]">
            Skema Gelombang Biaya Masuk
          </h3>
          <p class="text-[#C9D9F5] text-[14px] leading-[1.5] mb-[22px]">
            Dapatkan potongan biaya masuk pendidikan melalui pendaftaran lebih awal di gelombang resmi:
          </p>

          <!-- Table Cards -->
          <div class="space-y-[12px] mb-[24px]">
            <!-- Gelombang 1 -->
            <div class="rounded-[16px] p-[16px_20px] flex items-center justify-between gap-[16px] bg-white/10 border border-white/[0.16]">
              <div>
                <b class="text-[16px] text-white block font-bold">Gelombang 1</b>
                <span class="text-[12.5px] text-[#C9D9F5]">Periode Awal Pendaftaran</span>
              </div>
              <div class="text-right">
                <span class="text-[22px] sm:text-[24px] font-extrabold text-[#FDE68A]">Diskon 70%</span>
                <small class="block text-[11px] text-[#4ADE80] font-semibold">Terverifikasi</small>
              </div>
            </div>

            <!-- Gelombang 2 -->
            <div class="rounded-[16px] p-[16px_20px] flex items-center justify-between gap-[16px] bg-white/10 border border-white/[0.16]">
              <div>
                <b class="text-[16px] text-white block font-bold">Gelombang 2</b>
                <span class="text-[12.5px] text-[#C9D9F5]">Periode Lanjutan</span>
              </div>
              <div class="text-right">
                <span class="text-[22px] sm:text-[24px] font-extrabold text-[#FDE68A]">Diskon 50%</span>
                <small class="block text-[11px] text-[#4ADE80] font-semibold">Terverifikasi</small>
              </div>
            </div>

            <!-- Gelombang 3 -->
            <div class="rounded-[16px] p-[16px_20px] flex items-center justify-between gap-[16px] bg-white/10 border border-white/[0.16]">
              <div>
                <b class="text-[16px] text-white block font-bold">Gelombang 3</b>
                <span class="text-[12.5px] text-[#C9D9F5]">Periode Terakhir</span>
              </div>
              <div class="text-right">
                <span class="text-[18px] sm:text-[20px] font-bold text-white">Diskon Tambahan</span>
                <small class="block text-[11px] text-[#C9D9F5]/70">Konfirmasi Panitia</small>
              </div>
            </div>
          </div>

          <!-- Note Jalur Inden -->
          <div class="rounded-[14px] p-[14px] text-[13px] text-[#FFE3A1] leading-[1.5] bg-[#F0B429]/[0.15] border border-[#F0B429]/30">
            <b>Jalur Inden 2028/2029:</b> Orang tua dapat mengamankan kuota putra/putri untuk tahun ajaran berikutnya dengan syarat khusus melalui panitia PMB.
          </div>
        </div>

        <!-- Right: Direct Application CTAs -->
        <div class="bg-white rounded-[22px] p-[26px] sm:p-[30px] text-[#0F1E38] shadow-2xl">
          <span class="text-[11.5px] font-extrabold text-[#1B5FD9] uppercase tracking-[1.2px] block mb-[6px]">
            Kanal Pendaftaran &amp; Konsultasi
          </span>
          <h3 class="text-[21px] font-extrabold text-[#0F1E38] mb-[10px]">
            Daftar Sekarang Secara Online
          </h3>
          <p class="text-[#5A6B8C] text-[14px] leading-[1.6] mb-[22px]">
            Pilih kemudahan pendaftaran melalui formulir portal bersama atau langsung terhubung dengan nomor WhatsApp panitia PMB.
          </p>

          <!-- Action Buttons -->
          <div class="space-y-[12px] mb-[22px]">
            <NuxtLink 
              to="/spmb" 
              class="w-full inline-flex items-center justify-between font-extrabold text-[15px] py-[14px] px-[22px] rounded-[13px] text-white bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] shadow-md hover:shadow-lg transition-all"
            >
              <span>Buka Formulir SPMB Online</span>
              <svg class="ai w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>

            <a 
              href="https://wa.me/6282210823033" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full inline-flex items-center justify-between font-bold text-[14.5px] py-[13px] px-[22px] rounded-[13px] text-[#166534] bg-[#DCFCE7] border border-[#BBF7D0] hover:bg-[#bbf7d0] transition-all"
            >
              <span>Chat WhatsApp: 0822-1082-3033</span>
            </a>
          </div>

          <!-- Phone & Location Info -->
          <div class="pt-[16px] border-t border-[#E3EAF7] text-[13px] text-[#5A6B8C] space-y-[6px]">
            <div class="flex items-center justify-between">
              <span>Telepon Kantor Kampus:</span>
              <a href="tel:02188886776" class="font-bold text-[#0F1E38] hover:text-[#1B5FD9]">021-8888 6776</a>
            </div>
            <div class="flex items-center justify-between">
              <span>Lokasi Pelayanan:</span>
              <span class="font-medium text-[#0F1E38]">Kampus Assalam Babelan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
