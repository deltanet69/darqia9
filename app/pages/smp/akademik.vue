<script setup lang="ts">
import { ref } from 'vue'
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smp' })

const activeEkskulFilter = ref('semua')

const ekskulList = [
  {
    id: 1,
    name: 'OSIS',
    category: 'kepemimpinan',
    categoryLabel: 'Kepemimpinan',
    icon: 'compass',
    desc: 'Wadah organisasi siswa — belajar memimpin, mengelola acara, dan menyuarakan aspirasi teman.'
  },
  {
    id: 2,
    name: 'Pramuka',
    category: 'kepemimpinan',
    categoryLabel: 'Kepemimpinan',
    icon: 'flag',
    desc: 'Pembentukan karakter mandiri, disiplin, dan cinta alam melalui kegiatan kepramukaan.'
  },
  {
    id: 3,
    name: 'Paskibra',
    category: 'kepemimpinan',
    categoryLabel: 'Kepemimpinan',
    icon: 'shield',
    desc: 'Pasukan pengibar bendera — melatih kedisiplinan baris-berbaris, kekompakan, dan nasionalisme.'
  },
  {
    id: 4,
    name: 'PMR (Palang Merah Remaja)',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan',
    icon: 'cross',
    desc: 'Keterampilan pertolongan pertama pada kecelakaan (P3K) dan penanaman kepedulian sosial.'
  },
  {
    id: 5,
    name: 'Muhadhoroh',
    category: 'keagamaan',
    categoryLabel: 'Keagamaan',
    icon: 'mic',
    desc: 'Latihan pidato tiga bahasa, ceramah kultum, dan retorika dakwah untuk melatih keberanian tampil.'
  },
  {
    id: 6,
    name: 'Marawis',
    category: 'seni',
    categoryLabel: 'Seni Islami',
    icon: 'music',
    desc: 'Seni musik perkusi rebana Islami — melatih kekompakan ritme dan lantunan syair pujian shalawat.'
  },
  {
    id: 7,
    name: 'Hadroh',
    category: 'seni',
    categoryLabel: 'Seni Islami',
    icon: 'music',
    desc: 'Seni musik hadroh dengan vokal dan perkusi khas tradisi pesantren nusantara.'
  },
  {
    id: 8,
    name: 'Seni Islami & Kaligrafi',
    category: 'seni',
    categoryLabel: 'Seni Islami',
    icon: 'brush',
    desc: 'Khat Al-Qur\'an, nasyid, dan ekspresi kreasi visual dalam bingkai nilai-nilai keislaman.'
  },
  {
    id: 9,
    name: 'Pencak Silat',
    category: 'olahraga',
    categoryLabel: 'Olahraga',
    icon: 'sword',
    desc: 'Seni bela diri warisan leluhur nusantara — melatih ketangkasan fisik, mentalitas, dan sportivitas.'
  },
  {
    id: 10,
    name: 'Paduan Suara',
    category: 'seni',
    categoryLabel: 'Seni',
    icon: 'music',
    desc: 'Olah vokal dan harmoni nada — tampil pada upacara bendera, wisuda, dan peringatan hari besar.'
  },
  {
    id: 11,
    name: 'Unggul Office',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan',
    icon: 'laptop',
    desc: 'Penguasaan aplikasi perkantoran, pengolahan data dokumen, dan administrasi digital tingkat mahir.'
  },
  {
    id: 12,
    name: 'Unggul Bahasa @america',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan',
    icon: 'chat',
    desc: 'Praktik percakapan bahasa Inggris dan public speaking intensif bersama School @america.'
  },
  {
    id: 13,
    name: 'Rumah Bengkel Produksi',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan',
    icon: 'tool',
    desc: 'Bengkel praktik berbasis produksi — mengerjakan pesanan kriya nyata layaknya dunia industri kreatif.'
  }
]
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
          <b class="text-[#FCD34D]">Akademik &amp; Ekstrakurikuler</b>
        </div>
        <h1 class="text-[clamp(32px,4.5vw,48px)] font-black tracking-[-0.02em] leading-tight mb-3">
          Akademik &amp; <span class="bg-gradient-to-r from-[#7EE2AE] to-[#FCD34D] bg-clip-text text-transparent">Ekstrakurikuler</span>
        </h1>
        <p class="text-[#C4E4D4] max-w-[720px] text-[16px] leading-relaxed">
          Kurikulum terpadu berbasis ICT, kelas gender dengan metode CTL, 7 program unggulan, serta 13 pilihan ekstrakurikuler santri SMP IT BCA.
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. KURIKULUM TERINTEGRASI BERBASIS ICT -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="max-w-[720px] mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
            Sistem Kurikulum
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            Kurikulum Terintegrasi <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Berbasis ICT</span>
          </h2>
          <p class="text-[#55705F] text-[16px] mt-2.5 leading-relaxed">
            Kurikulum Diknas dan Islam Terpadu yang menyatu dalam satu sistem pembelajaran kontekstual (CTL), didukung pemanfaatan teknologi digital di setiap kelas.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          <div class="rv bg-white border border-[#D1E7DD] rounded-[22px] p-7 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3z"/></svg>
            </div>
            <h3 class="text-[18.5px] font-black text-[#063826] mb-2">Diknas + Islam Terpadu</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">
              Standar kompetensi nasional Diknas dipadukan harmonis dengan kurikulum kepesantrenan dan akhlak Islami.
            </p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[22px] p-7 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/><path d="M12 6.5v14"/></svg>
            </div>
            <h3 class="text-[18.5px] font-black text-[#063826] mb-2">Tahfidz &amp; Ibadah Harian</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">
              Setoran hafalan Qur'an metode Yanbu'a, sima'an bulanan, sholat berjamaah, dan pendalaman fiqih ubudiyah.
            </p>
          </div>

          <div class="rv bg-white border border-[#D1E7DD] rounded-[22px] p-7 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-xl bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center mb-5">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9.5 20.5h5M12 16.5v4"/></svg>
            </div>
            <h3 class="text-[18.5px] font-black text-[#063826] mb-2">Pembelajaran Berbasis ICT</h3>
            <p class="text-[14px] text-[#55705F] leading-relaxed">
              Fasilitas laboratorium komputer modern, pelaksanaan ujian CBT mandiri, dan modul materi digital interaktif.
            </p>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. TUJUH PROGRAM UNGGULAN (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E0ECE6]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="max-w-[700px] mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            7 Pilar Keunggulan
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            7 Program Unggulan <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">SMP IT BCA</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm">
            <span class="w-10 h-10 rounded-xl bg-[#0E7A4E] text-white flex items-center justify-center font-black text-sm mb-4">1</span>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">Kelas Berbasis Gender</h3>
            <p class="text-[13.5px] text-[#55705F]">Kelas khusus putra &amp; putri dengan metode CTL (Contextual Teaching and Learning).</p>
          </div>

          <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm">
            <span class="w-10 h-10 rounded-xl bg-[#0E7A4E] text-white flex items-center justify-center font-black text-sm mb-4">2</span>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">Kurikulum Terintegrasi ICT</h3>
            <p class="text-[13.5px] text-[#55705F]">Penyelarasan Diknas dan Islam Terpadu yang didukung media teknologi.</p>
          </div>

          <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm">
            <span class="w-10 h-10 rounded-xl bg-[#0E7A4E] text-white flex items-center justify-center font-black text-sm mb-4">3</span>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">Tahfidz Metode Yanbu'a</h3>
            <p class="text-[13.5px] text-[#55705F]">Program bimbingan baca Al-Qur'an bersanad dan target hafalan tartil.</p>
          </div>

          <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm">
            <span class="w-10 h-10 rounded-xl bg-[#0E7A4E] text-white flex items-center justify-center font-black text-sm mb-4">4</span>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">Sima'an &amp; Sholat Berjamaah</h3>
            <p class="text-[13.5px] text-[#55705F]">Budaya ibadah harian yang membentuk karakter disiplin dan spiritual.</p>
          </div>

          <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm">
            <span class="w-10 h-10 rounded-xl bg-[#0E7A4E] text-white flex items-center justify-center font-black text-sm mb-4">5</span>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">Pendalaman Fiqih &amp; Ubudiyah</h3>
            <p class="text-[13.5px] text-[#55705F]">Kajian fiqih praktis agar ibadah santri benar sesuai tuntunan syariat.</p>
          </div>

          <div class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm">
            <span class="w-10 h-10 rounded-xl bg-[#0E7A4E] text-white flex items-center justify-center font-black text-sm mb-4">6</span>
            <h3 class="text-[17.5px] font-black text-[#063826] mb-1.5">Talent &amp; Entrepreneur Day</h3>
            <p class="text-[13.5px] text-[#55705F]">Pengembangan bakat dan pelatihan jiwa wirausaha santri sejak dini.</p>
          </div>

          <div class="rv md:col-span-2 lg:col-span-3 bg-[#063826] text-white rounded-[22px] p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <span class="w-10 h-10 rounded-xl bg-[#F0B429] text-[#063826] flex items-center justify-center font-black text-sm shrink-0">7</span>
              <div>
                <strong class="text-[17.5px] font-black block">Unggul Bahasa &amp; Public Speaking with School @america</strong>
                <p class="text-[13.5px] text-[#C4E4D4]">Pelatihan kefasihan berbahasa Inggris dan keberanian tampil di panggung publik.</p>
              </div>
            </div>
            <span class="text-[12px] font-bold text-[#FCD34D] bg-white/10 py-1.5 px-3 rounded-lg shrink-0">Program Spesial</span>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. TIGA BELAS EKSTRAKURIKULER (Interaktif Filter) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Pengembangan Diri
            </span>
            <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
              13 Pilihan <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Ekstrakurikuler</span>
            </h2>
            <p class="text-[#55705F] text-[15.5px] mt-2">
              Wadah menyalurkan bakat seni Islami, ketangkasan fisik, kematangan spiritual, dan kepemimpinan santri.
            </p>
          </div>

          <!-- Total Count Badge -->
          <div class="hidden sm:inline-flex items-center gap-2 bg-white border border-[#D1E7DD] py-2 px-4 rounded-xl text-[13.5px] font-bold text-[#063826] shrink-0">
            <span class="w-2.5 h-2.5 rounded-full bg-[#0E7A4E]"></span>
            <span>13 Ekstrakurikuler Aktif</span>
          </div>
        </div>

        <!-- Filter Pills -->
        <div class="flex flex-wrap gap-2.5 mb-10">
          <button 
            v-for="cat in [
              { id: 'semua', label: 'Semua (13)' },
              { id: 'kepemimpinan', label: 'Kepemimpinan' },
              { id: 'keagamaan', label: 'Keagamaan' },
              { id: 'seni', label: 'Seni Islami' },
              { id: 'olahraga', label: 'Olahraga' },
              { id: 'keterampilan', label: 'Keterampilan' }
            ]"
            :key="cat.id"
            @click="activeEkskulFilter = cat.id"
            class="py-2.5 px-5 rounded-full font-bold text-[14px] transition-all duration-150 cursor-pointer border"
            :class="activeEkskulFilter === cat.id 
              ? 'bg-[#063826] text-white border-[#063826] shadow-md shadow-[#063826]/20' 
              : 'bg-white text-[#55705F] border-[#D1E7DD] hover:border-[#0E7A4E] hover:text-[#0E7A4E]'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Ekskul Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="item in ekskulList" 
            :key="item.id"
            v-show="activeEkskulFilter === 'semua' || activeEkskulFilter === item.category"
            class="rv bg-white border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between"
          >
            <div>
              <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#0E7A4E] bg-[#E4F4EC] py-1 px-3 rounded-full mb-3 inline-block">
                {{ item.categoryLabel }}
              </span>
              <h3 class="text-[18px] font-black text-[#063826] mb-2">
                {{ item.name }}
              </h3>
              <p class="text-[14px] text-[#55705F] leading-relaxed">
                {{ item.desc }}
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-[#F2F9F5] text-[12.5px] font-bold text-[#0E7A4E]">
              Terbuka di Awal Semester →
            </div>
          </div>
        </div>

        <!-- Info Cards: Cara Bergabung & Jadwal -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div class="bg-white border border-[#D1E7DD] rounded-[22px] p-7 shadow-sm">
            <h4 class="text-[17px] font-black text-[#063826] mb-1.5">Mekanisme Pendaftaran Ekskul</h4>
            <p class="text-[14px] text-[#55705F] leading-relaxed">
              Pendaftaran dibuka setiap awal tahun ajaran melalui OSIS dan wali kelas. Santri dapat memilih maksimal 2 kegiatan yang tidak bertubrukan jadwal latihannya.
            </p>
          </div>
          <div class="bg-white border border-[#D1E7DD] rounded-[22px] p-7 shadow-sm">
            <h4 class="text-[17px] font-black text-[#063826] mb-1.5">Jadwal &amp; Sarana Latihan</h4>
            <p class="text-[14px] text-[#55705F] leading-relaxed">
              Latihan rutin diadakan sepulang sekolah (ba'da Ashar) dan akhir pekan menggunakan fasilitas aula, lapangan olahraga, lab komputer, dan musholla.
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 5. SECTION CTA PENDAFTARAN -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-t border-[#E0ECE6]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="bg-[radial-gradient(700px_400px_at_85%_100%,rgba(52,199,123,0.45),transparent_65%),linear-gradient(135deg,#0A4A30_0%,#063826_55%,#052E22_100%)] text-white rounded-[24px] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span class="text-[12px] font-extrabold uppercase tracking-wider text-[#FCD34D] block mb-2">Penerimaan Murid Baru</span>
            <h2 class="text-[28px] md:text-[34px] font-black leading-tight mb-2">
              Daftar SPMB 2027/2028 Sekarang
            </h2>
            <p class="text-[#C4E4D4] text-[15px] max-w-xl">
              Biaya registrasi hanya <b>Rp50.000</b> (gratis bagi siswa berprestasi &amp; yatim). Kuota terbatas hanya 7 rombel.
            </p>
          </div>
          <NuxtLink 
            to="/smp/spmb" 
            class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-8 rounded-[14px] text-[#3D2C00] bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-lg hover:-translate-y-0.5 transition-all shrink-0"
          >
            Mulai Pendaftaran →
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>
