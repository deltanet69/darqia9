<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased flex flex-col">
    <SmkHeader />

    <main class="flex-1 pt-[104px] lg:pt-[112px]">
      <!-- ======= PAGE HERO ======= -->
      <section 
        class="text-white py-[48px] sm:py-[64px] relative overflow-hidden border-b border-white/10"
        style="background: radial-gradient(900px 480px at 85% -10%, rgba(43,124,216,0.45), transparent 60%), linear-gradient(135deg, #0C2C61 0%, #0A2A5C 60%, #061A3E 100%); background-color: #0A2A5C;"
      >
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        <div class="w-[min(1180px,100%-40px)] mx-auto relative z-10">
          <div class="flex items-center gap-2 text-[12.5px] font-semibold text-[#8FA6CC] mb-3">
            <NuxtLink to="/smk" class="hover:text-white transition-colors">Home</NuxtLink>
            <span>/</span>
            <span class="text-[#FCD34D]">Akademik</span>
          </div>
          <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-tight text-white mb-2">
            Akademik &amp; Kejuruan
          </h1>
          <p class="text-[#B9CBE8] text-[15px] sm:text-[16.5px] max-w-[660px]">
            Kurikulum, konsentrasi keahlian, dan keunggulan pembelajaran vokasi di SMK IT Attaqwa 9.
          </p>
        </div>
      </section>

      <!-- ======= 1. KURIKULUM MERDEKA + DEEP LEARNING ======= -->
      <section class="py-[72px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="max-w-[680px] mb-[44px]">
            <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
              Pilar Kurikulum
            </span>
            <h2 class="text-[clamp(26px,3.6vw,36px)] font-black text-[#0A2A5C] tracking-tight mb-3">
              Kurikulum Merdeka + Deep Learning
            </h2>
            <p class="text-[#5A6B8C] text-[15px] sm:text-[16px] leading-[1.65]">
              Kami menerapkan Kurikulum Merdeka dengan pendekatan Deep Learning - siswa diajak memahami konsep secara mendalam, berpikir kritis, dan mengaitkan pelajaran dengan dunia industri nyata, bukan sekadar menghafal teori.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white border border-[#E3EAF7] rounded-[20px] p-7 shadow-sm">
              <div class="w-13 h-13 rounded-2xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-5">
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3z"/></svg>
              </div>
              <h3 class="text-[18px] font-extrabold text-[#0A2A5C] mb-2">Pembelajaran Mendalam</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6]">Proyek kolaboratif, studi kasus, dan praktik laboratorium menjadi metode utama belajar - bukan ceramah pasif satu arah.</p>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-[20px] p-7 shadow-sm">
              <div class="w-13 h-13 rounded-2xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-5">
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14zM12 6.5v14"/></svg>
              </div>
              <h3 class="text-[18px] font-extrabold text-[#0A2A5C] mb-2">Tahfidz &amp; Ibadah Harian</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6]">Baca Qur'an metode Yanbu'a, sima'an Qur'an, dan sholat berjamaah terstruktur sebagai pembiasaan adab dan iman.</p>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-[20px] p-7 shadow-sm">
              <div class="w-13 h-13 rounded-2xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-5">
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9.5 20.5h5M12 16.5v4"/></svg>
              </div>
              <h3 class="text-[18px] font-extrabold text-[#0A2A5C] mb-2">Berbasis Teknologi</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6]">Pembelajaran ditopang infrastruktur teknologi informasi mutakhir - dari lab komputer hingga platform ujian CBT digital.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 2. 6 KONSENTRASI KEAHLIAN (JURUSAN) ======= -->
      <section class="py-[72px] bg-white border-y border-[#E3EAF7]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="text-center max-w-[620px] mx-auto mb-[48px]">
            <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
              Kompetensi Keahlian
            </span>
            <h2 class="text-[clamp(26px,3.8vw,36px)] font-black text-[#0A2A5C] tracking-tight">
              Enam Jurusan, Tiga Bidang
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- AKL -->
            <div class="border border-[#E3EAF7] bg-[#F8FAFC] rounded-[20px] p-7 hover:border-[#1B5FD9] hover:bg-white transition-all shadow-xs">
              <span class="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Bisnis &amp; Manajemen</span>
              <h3 class="text-[20px] font-extrabold text-[#0A2A5C] mb-2">AKL - Akuntansi &amp; Keuangan Lembaga</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6]">Menguasai siklus akuntansi, perpajakan, dan aplikasi keuangan lembaga. Lulusan siap kerja di perbankan, kantor akuntan, divisi keuangan perusahaan, atau melanjutkan ke perguruan tinggi.</p>
            </div>

            <!-- OTKP -->
            <div class="border border-[#E3EAF7] bg-[#F8FAFC] rounded-[20px] p-7 hover:border-[#1B5FD9] hover:bg-white transition-all shadow-xs">
              <span class="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Bisnis &amp; Manajemen</span>
              <h3 class="text-[20px] font-extrabold text-[#0A2A5C] mb-2">OTKP - Otomatisasi &amp; Tata Kelola Perkantoran</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6]">Kesekretarisan modern, korespondensi bisnis digital, kearsipan elektronik, dan otomatisasi tata kelola perkantoran untuk kebutuhan administrasi perusahaan profesional.</p>
            </div>

            <!-- TBSM -->
            <div class="border border-[#E3EAF7] bg-[#F8FAFC] rounded-[20px] p-7 hover:border-[#1B5FD9] hover:bg-white transition-all shadow-xs">
              <span class="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Teknik Otomotif</span>
              <h3 class="text-[20px] font-extrabold text-[#0A2A5C] mb-2">TBSM - Teknik &amp; Bisnis Sepeda Motor</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6]">Teknologi mesin sepeda motor injeksi terkini dipadukan dengan manajemen bengkel dan kewirausahaan - lulusan dibekali keahlian siap kerja mekanik atau mandiri berwirausaha.</p>
            </div>

            <!-- TKR -->
            <div class="border border-[#E3EAF7] bg-[#F8FAFC] rounded-[20px] p-7 hover:border-[#1B5FD9] hover:bg-white transition-all shadow-xs">
              <span class="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Teknik Otomotif</span>
              <h3 class="text-[20px] font-extrabold text-[#0A2A5C] mb-2">TKR - Teknik Kendaraan Ringan</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6]">Perawatan dan perbaikan sistem mesin, kelistrikan, chasis kendaraan ringan niaga dengan fasilitas workshop lab otomotif sekolah berstandar bengkel resmi.</p>
            </div>

            <!-- TKJ -->
            <div class="border border-[#E3EAF7] bg-[#F8FAFC] rounded-[20px] p-7 hover:border-[#1B5FD9] hover:bg-white transition-all shadow-xs">
              <span class="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Teknologi Informasi</span>
              <h3 class="text-[20px] font-extrabold text-[#0A2A5C] mb-2">TKJ - Teknik Komputer &amp; Jaringan</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6]">Instalasi jaringan LAN/WAN, routing mikrotik, administrasi server Linux/Cloud, dan troubleshooting infrastruktur IT - fondasi karier profesional di era digital.</p>
            </div>

            <!-- DKV -->
            <div class="border border-[#E3EAF7] bg-[#F8FAFC] rounded-[20px] p-7 hover:border-[#1B5FD9] hover:bg-white transition-all shadow-xs">
              <span class="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Teknologi Informasi</span>
              <h3 class="text-[20px] font-extrabold text-[#0A2A5C] mb-2">DKV - Desain Komunikasi Visual</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6]">Desain grafis, ilustrasi digital, videografi, motion graphic, dan komunikasi visual kreatif untuk industri kreatif, advertising, dan studio produksi.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 3. 9 PROGRAM UNGGULAN ======= -->
      <section class="py-[72px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="text-center max-w-[620px] mx-auto mb-[48px]">
            <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
              Keunggulan Vokasi
            </span>
            <h2 class="text-[clamp(26px,3.8vw,36px)] font-black text-[#0A2A5C] tracking-tight">
              Sembilan Program Unggulan
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div class="bg-white border border-[#E3EAF7] rounded-2xl p-6 shadow-xs flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2"/></svg>
              </div>
              <div>
                <b class="text-[16px] text-[#0A2A5C] block mb-1">BLK Komunitas</b>
                <p class="text-[13px] text-[#5A6B8C]">Gedung Balai Latihan Kerja Komunitas Link and Match Kemnaker RI.</p>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-2xl p-6 shadow-xs flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14zM12 6.5v14"/></svg>
              </div>
              <div>
                <b class="text-[16px] text-[#0A2A5C] block mb-1">Kurikulum Merdeka</b>
                <p class="text-[13px] text-[#5A6B8C]">Dengan pendekatan Deep Learning pada seluruh mata pelajaran.</p>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-2xl p-6 shadow-xs flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/></svg>
              </div>
              <div>
                <b class="text-[16px] text-[#0A2A5C] block mb-1">Tahfidz Yanbu'a</b>
                <p class="text-[13px] text-[#5A6B8C]">Program baca Qur'an dan tahfidz metode Yanbu'a terstruktur.</p>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-2xl p-6 shadow-xs flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 13.2A8.2 8.2 0 1110.8 4 6.6 6.6 0 0020 13.2z"/></svg>
              </div>
              <div>
                <b class="text-[16px] text-[#0A2A5C] block mb-1">Sima'an &amp; Berjamaah</b>
                <p class="text-[13px] text-[#5A6B8C]">Sima'an Qur'an dan sholat berjamaah harian sebagai budaya sekolah.</p>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-2xl p-6 shadow-xs flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2M16.8 9a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2z"/></svg>
              </div>
              <div>
                <b class="text-[16px] text-[#0A2A5C] block mb-1">Kelas Industri</b>
                <p class="text-[13px] text-[#5A6B8C]">Link and match bersama DUDIKA (dunia usaha dan industri).</p>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-2xl p-6 shadow-xs flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.6 6.6a5 5 0 01-6.9 6.9L7 20.2a2.2 2.2 0 01-3.1-3.1l6.7-6.7A5 5 0 0117.5 3.4l-2.8 2.8 2.6 2.6 3.3-2.2z"/></svg>
              </div>
              <div>
                <b class="text-[16px] text-[#0A2A5C] block mb-1">Sistem Ganda &amp; Prakerin</b>
                <p class="text-[13px] text-[#5A6B8C]">Pendidikan sistem ganda dan praktik kerja industri terarah.</p>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-2xl p-6 shadow-xs flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.8M12 18.7v2.8M2.5 12h2.8M18.7 12h2.8"/></svg>
              </div>
              <div>
                <b class="text-[16px] text-[#0A2A5C] block mb-1">Skill Equipment</b>
                <p class="text-[13px] text-[#5A6B8C]">Program kejuruan terpadu lintas konsentrasi keahlian.</p>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-2xl p-6 shadow-xs flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9.5 20.5h5M12 16.5v4"/></svg>
              </div>
              <div>
                <b class="text-[16px] text-[#0A2A5C] block mb-1">Pembelajaran Digital</b>
                <p class="text-[13px] text-[#5A6B8C]">Pemanfaatan platform teknologi informatika di kelas.</p>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-2xl p-6 shadow-xs flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 3a6 6 0 00-3.4 10.9c.8.6 1.4 1.3 1.4 2.6h4c0-1.3.6-2 1.4-2.6A6 6 0 0012 3z"/></svg>
              </div>
              <div>
                <b class="text-[16px] text-[#0A2A5C] block mb-1">Kewirausahaan</b>
                <p class="text-[13px] text-[#5A6B8C]">Penguatan jiwa entrepreneur - lulusan siap membuka lapangan usaha.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 4. CTA BANNER ======= -->
      <section class="pb-[72px] lg:pb-[96px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <SmkCtaCard />
        </div>
      </section>
    </main>

    <SmkFooter />
  </div>
</template>

<script setup>
import SmkHeader from '~/components/smk/SmkHeader.vue'
import SmkFooter from '~/components/smk/SmkFooter.vue'
import SmkCtaCard from '~/components/smk/SmkCtaCard.vue'

definePageMeta({ layout: false })

useHead({
  title: 'Akademik & Jurusan — SMK IT Attaqwa 9',
  meta: [
    { name: 'description', content: 'Kurikulum Merdeka, 6 Konsentrasi Keahlian, dan 9 Program Unggulan SMK IT Attaqwa 9 Babelan.' }
  ]
})
</script>
