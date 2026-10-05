<script setup lang="ts">
import { useGsapReveal } from "~/composables/useGsapReveal";
useGsapReveal();
import { ref } from 'vue'
const activeFilter = ref('semua')
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
          <NuxtLink to="/smk" class="hover:underline">Home</NuxtLink> / <b class="text-[#FCD34D]">Ekstrakurikuler</b>
        </div>
        <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-[-0.02em] leading-tight mb-2.5">Ekstrakurikuler</h1>
        <p class="text-[#B9CBE8] max-w-[700px] text-[16px] leading-relaxed">
          13 pilihan kegiatan untuk mengasah bakat, kepemimpinan, dan akhlak di luar jam pelajaran.
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. FILTER & EKSKUL GRID (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <!-- Category Filter Chips -->
        <div class="flex flex-wrap gap-2.5 mb-10">
          <button 
            v-for="cat in [
              { id: 'semua', label: 'Semua' },
              { id: 'kepemimpinan', label: 'Kepemimpinan' },
              { id: 'keagamaan', label: 'Keagamaan' },
              { id: 'seni', label: 'Seni' },
              { id: 'olahraga', label: 'Olahraga' },
              { id: 'keterampilan', label: 'Keterampilan' }
            ]"
            :key="cat.id"
            @click="activeFilter = cat.id"
            class="py-2.5 px-5 rounded-full font-bold text-[14px] transition-all duration-150 border"
            :class="activeFilter === cat.id 
              ? 'bg-[#0A2A5C] text-white border-[#0A2A5C] shadow-md' 
              : 'bg-white text-[#5A6B8C] border-[#E3EAF7] hover:border-[#1B5FD9] hover:text-[#1B5FD9]'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <!-- OSIS -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'kepemimpinan'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Kepemimpinan</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.3"/><path d="M15.8 8.2l-2.1 5-5 2.1 2.1-5 5-2.1z"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">OSIS</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Wadah organisasi siswa — belajar memimpin, mengelola acara, dan menyuarakan aspirasi teman.</p>
          </div>

          <!-- Pramuka -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'kepemimpinan'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Kepemimpinan</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5.5 21.5v-17"/><path d="M5.5 5H18l-2.8 3.8L18 12.5H5.5"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Pramuka</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Pembentukan karakter mandiri, disiplin, dan cinta alam melalui kegiatan kepramukaan.</p>
          </div>

          <!-- Paskibra -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'kepemimpinan'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Kepemimpinan</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5.5 21.5v-17"/><path d="M5.5 5H18l-2.8 3.8L18 12.5H5.5"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Paskibra</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Pasukan pengibar bendera — melatih kedisiplinan, kekompakan, dan jiwa nasionalisme.</p>
          </div>

          <!-- PMR -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'keterampilan'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Keterampilan</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.3"/><path d="M12 8.5v7M8.5 12h7"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">PMR</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Palang Merah Remaja — keterampilan pertolongan pertama dan kepedulian sosial.</p>
          </div>

          <!-- Muhadhoroh -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'keagamaan'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Keagamaan</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Muhadhoroh</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Latihan pidato, ceramah, dan retorika dakwah untuk melatih keberanian tampil.</p>
          </div>

          <!-- Marawis -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'seni'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Seni Islami</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M9.5 17.5V6l10-2v11.5"/><circle cx="7" cy="17.5" r="2.5"/><circle cx="17" cy="15.5" r="2.5"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Marawis</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Seni musik rebana Islami — kekompakan ritme dan syair pujian.</p>
          </div>

          <!-- Hadroh -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'seni'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Seni Islami</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M9.5 17.5V6l10-2v11.5"/><circle cx="7" cy="17.5" r="2.5"/><circle cx="17" cy="15.5" r="2.5"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Hadroh</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Seni musik hadroh dengan vokal dan perkusi khas tradisi pesantren.</p>
          </div>

          <!-- Seni Islami -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'seni'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Seni Islami</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M4 20l1.2-4.2L16.7 4.3a2 2 0 012.8 0l.2.2a2 2 0 010 2.8L8.2 18.8 4 20z"/><path d="M14.8 6.2l3 3"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Seni Kaligrafi &amp; Nasyid</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Kaligrafi, nasyid, dan ekspresi seni dalam bingkai nilai keislaman.</p>
          </div>

          <!-- Pencak Silat -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'olahraga'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Olahraga</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Pencak Silat</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Bela diri warisan budaya — melatih fisik, mental, dan sportivitas.</p>
          </div>

          <!-- Paduan Suara -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'seni'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Seni</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Paduan Suara</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Olah vokal dan harmoni — tampil di acara sekolah dan perayaan.</p>
          </div>

          <!-- Unggul Office -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'keterampilan'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Keterampilan</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2.5"/><path d="M9 8V6.5A2.5 2.5 0 0111.5 4h1A2.5 2.5 0 0115 6.5V8M3 13.5h18"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Unggul Office</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Penguasaan aplikasi perkantoran dan administrasi digital hingga level mahir.</p>
          </div>

          <!-- Unggul Bahasa -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'keterampilan'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Keterampilan</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20 12a8 8 0 10-14.7 4.4L4 20l3.7-1.2A8 8 0 0020 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Unggul Bahasa</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Bahasa Inggris dan public speaking — bekal komunikasi di dunia kerja global.</p>
          </div>

          <!-- Rumah Bengkel Produksi -->
          <div v-show="activeFilter === 'semua' || activeFilter === 'keterampilan'" class="bg-white border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.08)] hover:-translate-y-1 transition-all">
            <span class="inline-block text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full mb-3">Keterampilan</span>
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20.6 6.6a5 5 0 01-6.9 6.9L7 20.2a2.2 2.2 0 01-3.1-3.1l6.7-6.7A5 5 0 0117.5 3.4l-2.8 2.8 2.6 2.6 3.3-2.2z"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Rumah Bengkel Produksi</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Bengkel praktik berbasis produksi — mengerjakan order riil layaknya dunia usaha.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. CARA BERGABUNG & JADWAL (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.06)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="6" y="4.5" width="12" height="16.5" rx="2"/><path d="M9 4.5a3 3 0 016 0M9.5 11.5h5M9.5 15h3.5"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Cara Bergabung</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Pendaftaran ekstrakurikuler dibuka setiap awal tahun ajaran melalui OSIS dan wali kelas. Siswa boleh mengikuti lebih dari satu kegiatan sesuai minat dan jadwal.</p>
          </div>

          <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-7 shadow-[0_10px_30px_rgba(10,42,92,0.06)]">
            <div class="w-12 h-12 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
              <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.3"/><path d="M12 7.5V12l3.3 2"/></svg>
            </div>
            <h3 class="text-[19px] font-extrabold text-[#061A3E] mb-2">Jadwal Latihan</h3>
            <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed">Latihan rutin diadakan sepulang sekolah dan akhir pekan. Jadwal detail tiap kegiatan diumumkan melalui papan informasi dan grup kelas.</p>
          </div>

        </div>

        <div class="text-center">
          <NuxtLink 
            to="/smk/kontak" 
            class="inline-flex items-center gap-2 font-bold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#2B7CD8] to-[#0A2A5C] shadow-[0_10px_24px_rgba(27,106,201,0.35)] hover:-translate-y-0.5 transition-all"
          >
            Tanya Kesiswaan →
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>
