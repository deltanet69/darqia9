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
            <span class="text-[#FCD34D]">Tentang Sekolah</span>
          </div>
          <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-tight text-white mb-2">
            Tentang Sekolah
          </h1>
          <p class="text-[#B9CBE8] text-[15px] sm:text-[16.5px] max-w-[660px]">
            Mengenal lebih dekat SMK IT Attaqwa 9 - sejarah, visi misi, dan kepemimpinan sekolah.
          </p>
        </div>
      </section>

      <!-- ======= 1. PROFIL & KARTU FAKTA ======= -->
      <section class="py-[72px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[36px] items-start">
            <div>
              <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
                Profil Sekolah
              </span>
              <h2 class="text-[clamp(26px,3.6vw,36px)] font-black text-[#0A2A5C] tracking-tight mb-4">
                SMK Rasa Pesantren
              </h2>
              <p class="text-[#5A6B8C] text-[15.5px] leading-[1.7] mb-4">
                SMK IT Attaqwa 9 adalah sekolah menengah kejuruan berbasis pesantren di bawah Yayasan Attaqwa Pusat, berlokasi di Ujung Harapan, Babelan, Kabupaten Bekasi. Berdiri sejak 2015 dan terakreditasi <b>A</b> oleh BAN-SM, sekolah ini memadukan pendidikan vokasi yang link and match dengan industri dan pembinaan akhlak Qur'ani yang intensif.
              </p>
              <p class="text-[#5A6B8C] text-[15.5px] leading-[1.7]">
                Dengan 6 konsentrasi keahlian dalam 3 bidang - bisnis &amp; manajemen, teknik otomotif, dan teknologi informasi - lebih dari 316 siswa dibimbing menjadi lulusan yang benar, pintar, dan terampil.
              </p>
            </div>

            <!-- 4 Kartu Fakta -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-sm">
                <b class="text-[26px] font-black text-[#0A2A5C] block mb-1">2015</b>
                <p class="text-[13px] text-[#5A6B8C] leading-snug">Tahun berdiri - izin 503.15/54/XII/SK-SMK/BPMPPT/2015</p>
              </div>
              <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-sm">
                <b class="text-[26px] font-black text-[#16A34A] block mb-1">A</b>
                <p class="text-[13px] text-[#5A6B8C] leading-snug">Akreditasi BAN-SM No. 02.00/203/SK/BAN-SM/XII/2018</p>
              </div>
              <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-sm">
                <b class="text-[24px] font-black text-[#1B5FD9] block mb-1">69940449</b>
                <p class="text-[13px] text-[#5A6B8C] leading-snug">NPSN resmi Kementerian Pendidikan</p>
              </div>
              <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-6 shadow-sm">
                <b class="text-[26px] font-black text-[#0A2A5C] block mb-1">316+</b>
                <p class="text-[13px] text-[#5A6B8C] leading-snug">Siswa aktif belajar di 6 konsentrasi keahlian</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 2. VISI & MISI ======= -->
      <section class="py-[72px] bg-white border-y border-[#E3EAF7]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="text-center max-w-[620px] mx-auto mb-[44px]">
            <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
              Visi &amp; Misi
            </span>
            <h2 class="text-[clamp(26px,3.8vw,36px)] font-black text-[#0A2A5C] tracking-tight">
              Arah Kami <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Melangkah</span>
            </h2>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 items-stretch">
            <!-- Visi Card -->
            <div class="bg-gradient-to-br from-[#0E2E66] to-[#061A3E] rounded-[24px] p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-center shadow-lg">
              <span class="text-[80px] leading-none text-[#F0B429] font-serif block mb-2 opacity-90">“</span>
              <h3 class="text-[12px] font-extrabold uppercase tracking-[2px] text-[#FCD34D] mb-3">Visi Sekolah</h3>
              <p class="text-[21px] sm:text-[24px] font-extrabold leading-[1.4] text-white">
                Membentuk Generasi Vokasi Qur'ani yang Benar, Pintar, dan Terampil.
              </p>
            </div>

            <!-- Misi List -->
            <div class="flex flex-col gap-3.5 justify-center">
              <div class="flex items-start gap-4 bg-[#F8FAFC] border border-[#E3EAF7] rounded-[18px] p-5 sm:p-6 hover:border-[#1B5FD9] hover:bg-[#E8F0FE]/40 transition-all">
                <span class="w-[46px] h-[46px] rounded-xl bg-gradient-to-br from-[#2B7CD8] to-[#0A2A5C] text-[#FCD34D] font-black text-[15px] flex items-center justify-center shrink-0">
                  01
                </span>
                <p class="text-[14.5px] sm:text-[15.5px] text-[#0F1E38] pt-1 leading-relaxed">
                  Menjadi lembaga pendidikan Islam terpadu yang <b>terpercaya</b>, <b>unggul</b>, dan <b>agamis</b>.
                </p>
              </div>

              <div class="flex items-start gap-4 bg-[#F8FAFC] border border-[#E3EAF7] rounded-[18px] p-5 sm:p-6 hover:border-[#1B5FD9] hover:bg-[#E8F0FE]/40 transition-all">
                <span class="w-[46px] h-[46px] rounded-xl bg-gradient-to-br from-[#2B7CD8] to-[#0A2A5C] text-[#FCD34D] font-black text-[15px] flex items-center justify-center shrink-0">
                  02
                </span>
                <p class="text-[14.5px] sm:text-[15.5px] text-[#0F1E38] pt-1 leading-relaxed">
                  Membentuk pribadi yang <b>terampil</b> dan memiliki kecakapan hidup (life skills) siap kerja.
                </p>
              </div>

              <div class="flex items-start gap-4 bg-[#F8FAFC] border border-[#E3EAF7] rounded-[18px] p-5 sm:p-6 hover:border-[#1B5FD9] hover:bg-[#E8F0FE]/40 transition-all">
                <span class="w-[46px] h-[46px] rounded-xl bg-gradient-to-br from-[#2B7CD8] to-[#0A2A5C] text-[#FCD34D] font-black text-[15px] flex items-center justify-center shrink-0">
                  03
                </span>
                <p class="text-[14.5px] sm:text-[15.5px] text-[#0F1E38] pt-1 leading-relaxed">
                  Meningkatkan <b>kompetensi dan profesionalisme</b> pendidik serta tenaga kependidikan berkelanjutan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 3. SEJARAH SINGKAT ======= -->
      <section class="py-[72px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="text-center max-w-[620px] mx-auto mb-[48px]">
            <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
              Sejarah Singkat
            </span>
            <h2 class="text-[clamp(26px,3.8vw,36px)] font-black text-[#0A2A5C] tracking-tight">
              Perjalanan <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Kami</span>
            </h2>
          </div>

          <div class="max-w-[760px] mx-auto relative pl-8 sm:pl-10 border-l-2 border-[#1B5FD9]/30 space-y-8">
            <div class="relative group">
              <span class="absolute -left-[41px] sm:-left-[49px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-[#1B5FD9] shadow-sm"></span>
              <span class="inline-block bg-[#0A2A5C] text-[#FCD34D] font-extrabold text-[12px] py-1 px-3.5 rounded-full tracking-wider mb-2">2015</span>
              <div class="bg-white border border-[#E3EAF7] rounded-2xl p-5 sm:p-6 shadow-sm group-hover:border-[#1B5FD9] transition-colors">
                <b class="text-[#0F1E38] text-[15.5px] block mb-1">Berdiri Resmi</b>
                <p class="text-[14px] text-[#5A6B8C]">SMK IT Attaqwa 9 resmi beroperasi dengan izin operasional 503.15/54/XII/SK-SMK/BPMPPT/2015 di bawah naungan Yayasan Attaqwa Pusat.</p>
              </div>
            </div>

            <div class="relative group">
              <span class="absolute -left-[41px] sm:-left-[49px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-[#1B5FD9] shadow-sm"></span>
              <span class="inline-block bg-[#0A2A5C] text-[#FCD34D] font-extrabold text-[12px] py-1 px-3.5 rounded-full tracking-wider mb-2">2018</span>
              <div class="bg-white border border-[#E3EAF7] rounded-2xl p-5 sm:p-6 shadow-sm group-hover:border-[#1B5FD9] transition-colors">
                <b class="text-[#0F1E38] text-[15.5px] block mb-1">Akreditasi A BAN-SM</b>
                <p class="text-[14px] text-[#5A6B8C]">Pengakuan formal dari Badan Akreditasi Nasional Sekolah/Madrasah atas standar mutu kurikulum dan sarana pembelajaran.</p>
              </div>
            </div>

            <div class="relative group">
              <span class="absolute -left-[41px] sm:-left-[49px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-[#1B5FD9] shadow-sm"></span>
              <span class="inline-block bg-[#0A2A5C] text-[#FCD34D] font-extrabold text-[12px] py-1 px-3.5 rounded-full tracking-wider mb-2">PENGEMBANGAN</span>
              <div class="bg-white border border-[#E3EAF7] rounded-2xl p-5 sm:p-6 shadow-sm group-hover:border-[#1B5FD9] transition-colors">
                <b class="text-[#0F1E38] text-[15.5px] block mb-1">Gedung BLK Komunitas Kemnaker RI</b>
                <p class="text-[14px] text-[#5A6B8C]">Hadirnya Gedung BLK Komunitas Link and Match memperkuat keahlian praktik kerja siswa setara bengkel industri modern.</p>
              </div>
            </div>

            <div class="relative group">
              <span class="absolute -left-[41px] sm:-left-[49px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-[#F0B429] shadow-sm"></span>
              <span class="inline-block bg-[#0A2A5C] text-[#FCD34D] font-extrabold text-[12px] py-1 px-3.5 rounded-full tracking-wider mb-2">KINI</span>
              <div class="bg-white border border-[#E3EAF7] rounded-2xl p-5 sm:p-6 shadow-sm group-hover:border-[#1B5FD9] transition-colors">
                <b class="text-[#0F1E38] text-[15.5px] block mb-1">316+ Siswa &amp; 6 Jurusan</b>
                <p class="text-[14px] text-[#5A6B8C]">Membimbing 316+ siswa dengan kurikulum Deep Learning, tahfidz Qur'an Yanbu'a, dan jejaring industri yang kokoh.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 4. SAMBUTAN KEPALA SEKOLAH ======= -->
      <section class="py-[72px] bg-white border-y border-[#E3EAF7]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="bg-gradient-to-br from-[#0E2E66] to-[#061A3E] rounded-[28px] overflow-hidden text-white shadow-2xl grid grid-cols-1 lg:grid-cols-[320px_1fr]">
            <!-- Foto Placeholder -->
            <div class="bg-gradient-to-br from-[#123E85] to-[#0A2A5C] min-h-[320px] flex items-center justify-center p-8 text-center border-b lg:border-b-0 lg:border-r border-white/10">
              <div class="border-2 border-dashed border-white/30 rounded-2xl p-6 flex flex-col items-center gap-2">
                <svg class="w-12 h-12 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/>
                  <circle cx="12" cy="13.5" r="3.4"/>
                  <path d="M8.5 7.5L10 5h4l1.5 2.5"/>
                </svg>
                <b class="text-[12px] font-extrabold tracking-wider uppercase text-white">FOTO : KEPALA SEKOLAH</b>
                <small class="text-[11px] text-[#A9BDDD]">H. Abd. Muiz</small>
              </div>
            </div>

            <!-- Sambutan Body -->
            <div class="p-8 sm:p-12 flex flex-col justify-center">
              <div class="inline-flex items-center gap-2 bg-[#F0B429]/15 border border-[#F0B429]/40 text-[#FCD34D] text-[11.5px] font-extrabold py-1 px-3.5 rounded-lg w-fit mb-4">
                DRAF - menunggu persetujuan Bpk. Kepala Sekolah
              </div>
              <blockquote class="text-[#DCE7FA] text-[15px] sm:text-[16.5px] italic leading-[1.7] space-y-3 mb-6">
                <p>Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di SMK IT Attaqwa 9.</p>
                <p>Kami percaya lulusan vokasi yang hebat bukan hanya yang terampil tangannya, tapi juga yang benar akhlaknya. Karena itu, setiap hari di sekolah ini keterampilan kejuruan berjalan beriringan dengan tahfidz Qur'an, sholat berjamaah, dan pembiasaan adab.</p>
                <p>Mari bergabung dan bertumbuh bersama - menjadi generasi vokasi Qur'ani yang benar, pintar, dan terampil. Wassalamu'alaikum warahmatullahi wabarakatuh.</p>
              </blockquote>
              <div class="flex items-center gap-3 pt-4 border-t border-white/15">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#F0B429] to-[#C98A12] text-[#061A3E] font-black text-lg flex items-center justify-center">
                  M
                </div>
                <div>
                  <b class="text-white text-[16px] block">H. Abd. Muiz</b>
                  <span class="text-[13px] text-[#A9BDDD]">Kepala SMK IT Attaqwa 9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 5. CATATAN PRESTASI (EMPTY STATE) ======= -->
      <section class="py-[72px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="text-center max-w-[620px] mx-auto mb-[36px]">
            <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
              Prestasi Siswa
            </span>
            <h2 class="text-[clamp(26px,3.8vw,36px)] font-black text-[#0A2A5C] tracking-tight">
              Catatan Kebanggaan
            </h2>
          </div>

          <div class="bg-white border-2 border-dashed border-[#B9D2F8] rounded-[24px] p-12 text-center max-w-[720px] mx-auto shadow-sm">
            <div class="w-14 h-14 rounded-2xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 4h8v4.5a4 4 0 01-8 0V4zM8 5.5H4.5a3.5 3.5 0 003.6 5.5M16 5.5h3.5a3.5 3.5 0 01-3.6 5.5M12 12.5V16M8.5 20h7M10 16.5h4"/></svg>
            </div>
            <b class="text-[17px] font-extrabold text-[#0A2A5C] block mb-2">Data prestasi sedang dikurasi</b>
            <p class="text-[14px] text-[#5A6B8C] max-w-[460px] mx-auto mb-6">
              Segera hadir - daftar prestasi akademik, kejuruan, dan non-akademik siswa SMK IT Attaqwa 9.
            </p>
            <NuxtLink 
              to="/spmb/smk" 
              class="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-bold text-sm text-[#3D2C00] bg-gradient-to-r from-[#F0B429] to-[#F59E0B] shadow-md"
            >
              <span>Jadi Bagian Berikutnya</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ======= 6. CTA BANNER ======= -->
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
  title: 'Tentang Sekolah — SMK IT Attaqwa 9',
  meta: [
    { name: 'description', content: 'Profil resmi, sejarah, visi misi, dan kepemimpinan SMK IT Attaqwa 9 Babelan, Kabupaten Bekasi.' }
  ]
})
</script>
