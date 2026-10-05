<template>
  <section class="py-[64px] lg:py-[88px] bg-white" id="kontak">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <!-- Section Header -->
      <div class="text-center max-w-[720px] mx-auto mb-[44px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[7px] px-[14px] rounded-full mb-[16px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#1B5FD9]"></span>
          Kontak &amp; Informasi
        </div>
        <h2 class="gsap-rv text-[clamp(26px,4.6vw,40px)] font-extrabold text-[#0F1E38] tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Terhubung dengan <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Yayasan &amp; Sekolah</span>
        </h2>
        <p class="gsap-rv text-[#5A6B8C] text-[clamp(15px,2.4vw,17.5px)] leading-[1.6]">
          Informasi administrasi, kemitraan, kunjungan kampus, dan pertanyaan seputar PMB dapat disampaikan melalui kanal resmi berikut.
        </p>
      </div>

      <div class="gsap-rv grid grid-cols-1 lg:grid-cols-2 gap-[32px]">
        <!-- Left: Contact Details & Office Hours -->
        <div class="space-y-[18px]">
          <!-- Contact Cards Grid -->
          <div class="gsap-rv grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[16px] p-[18px]">
              <span class="text-[11.5px] font-extrabold uppercase tracking-[1px] text-[#1B5FD9] block mb-[4px]">Alamat Kampus</span>
              <p class="gsap-rv text-[13.5px] text-[#33415C] leading-[1.5]">
                Ujung Harapan Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi, Jawa Barat
              </p>
            </div>

            <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[16px] p-[18px]">
              <span class="text-[11.5px] font-extrabold uppercase tracking-[1px] text-[#1B5FD9] block mb-[4px]">Telepon &amp; WA</span>
              <p class="gsap-rv text-[13.5px] text-[#33415C] leading-[1.6]">
                Kantor: <a href="tel:02188886776" class="text-[#1B5FD9] font-bold hover:underline">021-8888 6776</a><br>
                PMB WA: <a href="https://wa.me/6282210823033" target="_blank" rel="noopener noreferrer" class="text-[#166534] font-bold hover:underline">0822-1082-3033</a>
              </p>
            </div>

            <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[16px] p-[18px]">
              <span class="text-[11.5px] font-extrabold uppercase tracking-[1px] text-[#1B5FD9] block mb-[4px]">Email Yayasan</span>
              <a href="mailto:yayasandarqia@gmail.com" class="text-[13.5px] text-[#1B5FD9] font-bold hover:underline break-all block">
                yayasandarqia@gmail.com
              </a>
            </div>

            <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[16px] p-[18px]">
              <span class="text-[11.5px] font-extrabold uppercase tracking-[1px] text-[#1B5FD9] block mb-[4px]">Jam Layanan Kantor</span>
              <p class="gsap-rv text-[13.5px] text-[#33415C] leading-[1.5]">
                Senin–Kamis: 07.30–14.00 WIB<br>
                Sabtu: 07.30–12.00 WIB
              </p>
            </div>
          </div>

          <!-- Official Social Media Links Box -->
          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-[22px]">
            <h4 class="text-[15.5px] font-extrabold text-[#0F1E38] mb-[12px]">
              Kanal Resmi Media Sosial
            </h4>

            <div class="space-y-[10px]">
              <!-- SMP Socials -->
              <div class="pb-[10px] border-b border-[#E3EAF7]">
                <span class="text-[12px] font-bold text-[#1B5FD9] uppercase block mb-[4px]">SMP IT Bina Cendekia Assalam</span>
                <div class="flex flex-wrap items-center gap-[12px] text-[13px]">
                  <a href="https://instagram.com/smpitbca_official" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#33415C] hover:text-[#1B5FD9]">
                    Instagram: <b>@smpitbca_official</b>
                  </a>
                  <span class="text-[#CBD5E1]">·</span>
                  <a href="https://youtube.com/@SMPITBCA" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#33415C] hover:text-[#1B5FD9]">
                    YouTube: <b>@SMPITBCA</b>
                  </a>
                </div>
              </div>

              <!-- SMK Socials -->
              <div>
                <span class="text-[12px] font-bold text-[#D97706] uppercase block mb-[4px]">SMK IT Attaqwa 9</span>
                <div class="flex flex-wrap items-center gap-[12px] text-[13px]">
                  <a href="https://instagram.com/smkit.attaqwa9" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#33415C] hover:text-[#1B5FD9]">
                    Instagram: <b>@smkit.attaqwa9</b>
                  </a>
                  <span class="text-[#CBD5E1]">·</span>
                  <a href="https://tiktok.com/@smkitattaqwa9" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#33415C] hover:text-[#1B5FD9]">
                    TikTok: <b>@smkitattaqwa9</b>
                  </a>
                  <span class="text-[#CBD5E1]">·</span>
                  <a href="https://youtube.com/@smkitattaqwa9764" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#33415C] hover:text-[#1B5FD9]">
                    YouTube: <b>@smkitattaqwa9764</b>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Google Maps Iframe -->
        <div class="rounded-[20px] overflow-hidden border border-[#E3EAF7] shadow-sm min-h-[360px] h-full flex flex-col">
          <div class="bg-[#F5F8FF] p-[12px_16px] border-b border-[#E3EAF7] flex items-center justify-between">
            <b class="text-[13.5px] text-[#0F1E38]">Peta Lokasi Kampus Assalam Babelan</b>
            <span class="text-[11.5px] text-[#5A6B8C]">Babelan, Kab. Bekasi</span>
          </div>
          <iframe 
            title="Lokasi Yayasan Darqia Attaqwa Babelan" 
            loading="lazy" 
            class="w-full flex-1 border-0 min-h-[320px]"
            src="https://www.google.com/maps?q=SMK+IT+Attaqwa+9+Babelan+Bekasi&output=embed"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
</template>
