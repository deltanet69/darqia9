<script setup lang="ts">
import { ref } from 'vue'
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smk' })

// State formulir
const isSubmitting = ref(false)
const formSent = ref(false)
const formData = ref({
  nama: '',
  kontak: '',
  topik: 'SPMB / Pendaftaran',
  pesan: ''
})

// State FAQ accordion
const openFaq = ref<number | null>(0)

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index
}

const sendForm = () => {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    formSent.value = true
    formData.value = {
      nama: '',
      kontak: '',
      topik: 'SPMB / Pendaftaran',
      pesan: ''
    }
  }, 1000)
}

const faqs = [
  {
    q: 'Kapan SPMB 2027/2028 dibuka dan berapa kuotanya?',
    a: 'Pendaftaran dibuka dalam 3 gelombang: Gelombang I (01 Sep – 26 Des 2026), Gelombang II (01 Jan – 24 Apr 2027), dan Gelombang Tambahan (26 Apr – 27 Jun 2027). Kuota dibatasi tepat 7 rombel untuk menjaga efektivitas praktik kejuruan.'
  },
  {
    q: 'Berapa biaya pendaftaran awal?',
    a: 'Biaya formulir dan registrasi seleksi adalah Rp50.000. Biaya digratiskan 100% khusus bagi calon santri berprestasi (juara lomba/tahfidz) serta santri yatim piatu.'
  },
  {
    q: 'Apa saja 6 konsentrasi keahlian (jurusan) yang tersedia?',
    a: 'Tersedia 6 jurusan terakreditasi A: Akuntansi & Keuangan Lembaga (AKL), Otomatisasi & Tata Kelola Perkantoran (OTKP), Teknik & Bisnis Sepeda Motor (TBSM), Teknik Kendaraan Ringan (TKR), Teknik Komputer & Jaringan (TKJ), dan Desain Komunikasi Visual (DKV).'
  },
  {
    q: 'Bagaimana cara mengajukan beasiswa di SMK IT Attaqwa 9?',
    a: 'Calon santri dapat memilih skema beasiswa saat mengisi formulir SPMB dengan melampirkan sertifikat kejuaraan/syahadah tahfidz, atau dokumen KETM/KIP/PKH bagi program afirmasi ekonomi.'
  },
  {
    q: 'Di mana lokasi kampus dan bagaimana akses transportasinya?',
    a: 'Kampus kami berlokasi di Ujung Harapan, Musholla Assalam, Kelurahan Bahagia, Kecamatan Babelan, Kabupaten Bekasi 17612. Lokasi mudah diakses melalui Jl. Raya Babelan dan dekat dengan pusat Pondok Pesantren Attaqwa.'
  },
  {
    q: 'Apakah bisa melakukan kunjungan langsung (school tour)?',
    a: 'Bisa. Sekretariat kami terbuka untuk konsultasi jurusan dan school tour fasilitas lab/bengkel BLK setiap hari kerja (Senin–Jumat 08.00–15.00 WIB) dan akhir pekan (Sabtu–Ahad 09.00–14.00 WIB).'
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[170px] sm:pt-[180px] md:pt-[190px] lg:pt-[200px] pb-[70px] lg:pb-[80px] bg-gradient-to-br from-[#0C2C61] to-[#061A3E]">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
      
      <!-- Subtle Glows -->
      <div class="absolute -top-32 right-0 w-[500px] h-[500px] bg-[#1B5FD9]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-[#2B7CD8]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <!-- Breadcrumb -->
        <div class="text-[12.5px] text-[#8FA6CC] font-semibold mb-3.5 flex items-center gap-1.5">
          <NuxtLink to="/smk" class="hover:text-white transition-colors">Home</NuxtLink>
          <span class="text-[#4C8DFF]">/</span>
          <b class="text-[#FCD34D]">Kontak Kami</b>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#7DB9F5] uppercase py-1 px-3.5 rounded-full bg-white/10 backdrop-blur-md mb-3 border border-white/15">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
              Pusat Layanan &amp; Informasi
            </span>
            <h1 class="text-[clamp(32px,4.5vw,48px)] font-black tracking-[-0.02em] leading-tight mb-2.5">
              Hubungi <span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">Kami</span>
            </h1>
            <p class="text-[#B9CBE8] max-w-[650px] text-[15.5px] md:text-[16.5px] leading-relaxed">
              Ada pertanyaan seputar pendaftaran SPMB, konsultasi 6 konsentrasi keahlian, atau beasiswa? Tim sekretariat kami siap melayani Anda.
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-3 shrink-0 self-start lg:self-end">
            <a 
              href="https://wa.me/6281210949978" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-[#25D366] text-white font-extrabold text-[13.5px] shadow-md hover:brightness-105 transition-all"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.871.815 2.796.815 3.182 0 5.768-2.587 5.769-5.767.001-3.181-2.585-5.766-5.769-5.766zm3.435 8.204c-.144.405-.838.775-1.171.825-.31.046-.713.064-2.12-.518-1.794-.741-2.934-2.56-3.023-2.679-.089-.119-.729-.97-.729-1.85 0-.88.46-1.314.624-1.493.164-.179.358-.224.478-.224.12 0 .239.001.344.006.11.005.258-.042.404.309.15.358.513 1.25.558 1.34.045.09.075.195.015.314-.06.12-.09.195-.179.3-.09.104-.188.232-.269.313-.09.09-.184.188-.079.368.105.18.467.771 1.002 1.248.689.614 1.27.804 1.45.894.18.09.284.075.389-.045.105-.12.449-.523.569-.703.12-.179.239-.149.398-.09.16.06 1.017.48 1.192.568.175.09.292.135.337.21.045.075.045.435-.099.84z"/></svg>
              Chat WhatsApp
            </a>
            <a 
              href="tel:02188886776" 
              class="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-[13.5px] backdrop-blur-md transition-all"
            >
              <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              (021) 8888 6776
            </a>
          </div>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. KONTAK INFO & FORMULIR PESAN (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Kiri: 5 Info Cards & Map Shortcut (5 Cols) -->
          <div class="lg:col-span-5 space-y-4">
            
            <div class="mb-2">
              <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-2">
                <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/><circle cx="12" cy="10" r="2.6"/></svg>
                Informasi Kontak
              </span>
              <h2 class="text-[24px] font-black text-[#061A3E]">Sekretariat Sekolah</h2>
            </div>

            <!-- Card 1: Alamat -->
            <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_12px_30px_rgba(10,42,92,0.08)] transition-all flex items-start gap-4 group">
              <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/><circle cx="12" cy="10" r="2.6"/></svg>
              </div>
              <div>
                <strong class="block text-[15px] font-black text-[#061A3E] mb-1">Alamat Kampus</strong>
                <p class="text-[13.5px] text-[#5A6B8C] leading-snug">
                  Ujung Harapan, Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17612
                </p>
              </div>
            </div>

            <!-- Card 2: Telepon -->
            <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_12px_30px_rgba(10,42,92,0.08)] transition-all flex items-start gap-4 group">
              <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div class="flex-1">
                <strong class="block text-[15px] font-black text-[#061A3E] mb-1">Telepon Kantor</strong>
                <a href="tel:02188886776" class="text-[14px] font-bold text-[#1B5FD9] hover:underline block">
                  021-8888 6776
                </a>
              </div>
            </div>

            <!-- Card 3: WhatsApp -->
            <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_12px_30px_rgba(10,42,92,0.08)] transition-all flex items-start gap-4 group">
              <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.871.815 2.796.815 3.182 0 5.768-2.587 5.769-5.767.001-3.181-2.585-5.766-5.769-5.766zm3.435 8.204c-.144.405-.838.775-1.171.825-.31.046-.713.064-2.12-.518-1.794-.741-2.934-2.56-3.023-2.679-.089-.119-.729-.97-.729-1.85 0-.88.46-1.314.624-1.493.164-.179.358-.224.478-.224.12 0 .239.001.344.006.11.005.258-.042.404.309.15.358.513 1.25.558 1.34.045.09.075.195.015.314-.06.12-.09.195-.179.3-.09.104-.188.232-.269.313-.09.09-.184.188-.079.368.105.18.467.771 1.002 1.248.689.614 1.27.804 1.45.894.18.09.284.075.389-.045.105-.12.449-.523.569-.703.12-.179.239-.149.398-.09.16.06 1.017.48 1.192.568.175.09.292.135.337.21.045.075.045.435-.099.84z"/></svg>
              </div>
              <div class="flex-1">
                <strong class="block text-[15px] font-black text-[#061A3E] mb-1">WhatsApp Panitia</strong>
                <div class="space-y-1 text-[13.5px]">
                  <a href="https://wa.me/6281210949978" target="_blank" rel="noopener noreferrer" class="text-[#1B5FD9] font-bold hover:underline block">
                    0812 1094 9978 (Panitia 1)
                  </a>
                  <a href="https://wa.me/6287847488247" target="_blank" rel="noopener noreferrer" class="text-[#1B5FD9] font-bold hover:underline block">
                    0878 4748 8247 (Panitia 2)
                  </a>
                </div>
              </div>
            </div>

            <!-- Card 4: Email -->
            <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_12px_30px_rgba(10,42,92,0.08)] transition-all flex items-start gap-4 group">
              <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7.5L12 13l8.5-5.5"/></svg>
              </div>
              <div class="flex-1">
                <strong class="block text-[15px] font-black text-[#061A3E] mb-1">Email Resmi</strong>
                <a href="mailto:smkitattaqwa09@gmail.com" class="text-[13.5px] font-bold text-[#1B5FD9] hover:underline block break-all">
                  smkitattaqwa09@gmail.com
                </a>
              </div>
            </div>

            <!-- Card 5: Jam Layanan -->
            <div class="rv bg-white border border-[#E2ECF8] rounded-[20px] p-5 shadow-[0_4px_20px_rgba(10,42,92,0.04)] hover:shadow-[0_12px_30px_rgba(10,42,92,0.08)] transition-all flex items-start gap-4 group">
              <div class="w-12 h-12 rounded-[14px] bg-[#E8F0FE] text-[#1B5FD9] group-hover:bg-[#1B5FD9] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <strong class="block text-[15px] font-black text-[#061A3E] mb-1">Jam Operasional Layanan</strong>
                <div class="text-[13px] text-[#5A6B8C] space-y-0.5">
                  <p><strong>Senin – Jumat:</strong> 08.00 – 15.00 WIB</p>
                  <p><strong>Sabtu – Ahad:</strong> 09.00 – 14.00 WIB</p>
                </div>
              </div>
            </div>

            <!-- Location Map Box -->
            <div class="rv bg-gradient-to-br from-[#0C2C61] to-[#061A3E] text-white rounded-[22px] p-6 shadow-[0_10px_30px_rgba(10,42,92,0.15)] flex flex-col justify-between relative overflow-hidden">
              <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none"></div>
              
              <div class="relative z-10 mb-5">
                <div class="flex items-center gap-2 text-[12px] font-bold text-[#FCD34D] uppercase tracking-wider mb-2">
                  <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/><circle cx="12" cy="10" r="2.6"/></svg>
                  Petunjuk Arah Kampus
                </div>
                <h4 class="text-[18px] font-black text-white leading-snug mb-1">Kampus SMK IT Attaqwa 9</h4>
                <p class="text-[13px] text-[#B9CBE8]">
                  Area Pondok Pesantren Attaqwa Ujung Harapan, Babelan, Kabupaten Bekasi.
                </p>
              </div>

              <div class="relative z-10">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=SMK+IT+Attaqwa+9+Babelan+Bekasi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center gap-2 w-full font-extrabold text-[13.5px] py-3 px-5 rounded-xl text-white bg-gradient-to-r from-[#1B5FD9] to-[#2B7CD8] hover:from-[#2B7CD8] hover:to-[#4C8DFF] shadow-md transition-all"
                >
                  <span>Buka di Google Maps</span>
                  <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>
              </div>
            </div>

          </div>

          <!-- Kanan: Form Kirim Pesan Interaktif (7 Cols) -->
          <div class="lg:col-span-7 bg-white border border-[#E2ECF8] rounded-[24px] p-7 sm:p-9 md:p-10 shadow-[0_10px_30px_rgba(10,42,92,0.06)]">
            
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Formulir Layanan
            </span>
            <h2 class="text-[26px] sm:text-[28px] font-black text-[#061A3E] mb-2">Kirim Pertanyaan Anda</h2>
            <p class="text-[14.5px] text-[#5A6B8C] mb-8 leading-relaxed">
              Silakan lengkapi formulir di bawah. Tim panitia kami akan merespons melalui WhatsApp atau email maksimal 1×24 jam pada hari kerja.
            </p>

            <!-- Success Alert Banner -->
            <div 
              v-if="formSent" 
              class="mb-6 bg-[#ECFDF5] border border-[#6EE7B7] text-[#065F46] p-5 rounded-[18px] flex items-start gap-3.5 animate-in fade-in"
            >
              <div class="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <div class="flex-1">
                <strong class="block text-[15px] font-black text-[#065F46] mb-0.5">Pesan Berhasil Terkirim!</strong>
                <p class="text-[13.5px] text-[#047857] leading-relaxed">
                  Terima kasih telah menghubungi SMK IT Attaqwa 9. Panitia kami akan segera meninjau pertanyaan Anda.
                </p>
                <button 
                  @click="formSent = false" 
                  class="text-[12.5px] font-bold text-[#065F46] underline mt-2 inline-block hover:text-black"
                >
                  Kirim pesan lain
                </button>
              </div>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="sendForm" class="space-y-4">
              
              <div>
                <label for="nama" class="block text-[13.5px] font-bold text-[#061A3E] mb-1.5">
                  Nama Lengkap <span class="text-red-500">*</span>
                </label>
                <input 
                  id="nama" 
                  v-model="formData.nama"
                  type="text" 
                  required 
                  placeholder="Masukkan nama lengkap Anda" 
                  class="w-full border border-[#E2ECF8] rounded-[14px] py-3.5 px-4 text-[14.5px] text-[#0F1E38] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10 transition-all placeholder-[#8FA6CC]"
                />
              </div>

              <div>
                <label for="kontak" class="block text-[13.5px] font-bold text-[#061A3E] mb-1.5">
                  Nomor WhatsApp / Email Aktif <span class="text-red-500">*</span>
                </label>
                <input 
                  id="kontak" 
                  v-model="formData.kontak"
                  type="text" 
                  required 
                  placeholder="Contoh: 081234567890 atau email@domain.com" 
                  class="w-full border border-[#E2ECF8] rounded-[14px] py-3.5 px-4 text-[14.5px] text-[#0F1E38] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10 transition-all placeholder-[#8FA6CC]"
                />
              </div>

              <div>
                <label for="topik" class="block text-[13.5px] font-bold text-[#061A3E] mb-1.5">
                  Topik Pertanyaan <span class="text-red-500">*</span>
                </label>
                <select 
                  id="topik" 
                  v-model="formData.topik"
                  class="w-full border border-[#E2ECF8] rounded-[14px] py-3.5 px-4 text-[14.5px] font-semibold text-[#0A2A5C] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10 transition-all cursor-pointer"
                >
                  <option value="SPMB / Pendaftaran">Penerimaan Murid Baru (SPMB 2027/2028)</option>
                  <option value="Biaya & Beasiswa">Informasi Biaya Pendidikan &amp; Beasiswa</option>
                  <option value="Konsultasi 6 Jurusan">Konsultasi Pemilihan Konsentrasi Keahlian</option>
                  <option value="Kemitraan Industri">Kemitraan Industri / Prakerin (DUDIKA)</option>
                  <option value="Lainnya">Pertanyaan Umum Lainnya</option>
                </select>
              </div>

              <div>
                <label for="pesan" class="block text-[13.5px] font-bold text-[#061A3E] mb-1.5">
                  Detail Pesan <span class="text-red-500">*</span>
                </label>
                <textarea 
                  id="pesan" 
                  v-model="formData.pesan"
                  rows="4" 
                  required 
                  placeholder="Tuliskan pertanyaan atau informasi yang ingin Anda tanyakan secara jelas..." 
                  class="w-full border border-[#E2ECF8] rounded-[14px] py-3.5 px-4 text-[14.5px] text-[#0F1E38] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10 transition-all placeholder-[#8FA6CC]"
                ></textarea>
              </div>

              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="w-full inline-flex items-center justify-center gap-2 font-black text-[15px] py-4 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#1B5FD9] via-[#2B7CD8] to-[#0A2A5C] shadow-[0_10px_24px_rgba(27,95,217,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <svg v-if="isSubmitting" class="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                <span v-if="isSubmitting">Mengirim Pesan...</span>
                <span v-else class="flex items-center gap-2">
                  Kirim Pesan Sekarang
                  <svg class="w-4 h-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
              </button>

              <p class="text-[12px] text-[#8FA6CC] text-center pt-2">
                🔒 Data kontak Anda aman dan hanya digunakan untuk keperluan komunikasi resmi sekolah.
              </p>
            </form>

          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. FAQ ACCORDION (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7] relative">
      <div class="max-w-[860px] mx-auto px-5 lg:px-6">
        
        <div class="text-center mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase py-1 px-3.5 rounded-full bg-[#E8F0FE] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Tanya Jawab Populer
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#061A3E]">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p class="text-[#5A6B8C] text-[15.5px] mt-2">
            Jawaban ringkas dan resmi atas pertanyaan yang kerap ditanyakan oleh calon wali santri.
          </p>
        </div>

        <div class="space-y-3.5">
          <div 
            v-for="(faq, i) in faqs" 
            :key="i"
            class="rv bg-[#F8FAFC] border border-[#E2ECF8] rounded-[20px] overflow-hidden transition-all duration-200"
            :class="{ 'bg-white shadow-md border-[#1B5FD9]/40': openFaq === i }"
          >
            <button 
              class="w-full text-left font-black text-[15.5px] sm:text-[16.5px] text-[#061A3E] p-5 sm:p-6 cursor-pointer flex justify-between items-center gap-4 hover:text-[#1B5FD9] transition-colors"
              @click="toggleFaq(i)"
            >
              <span>{{ faq.q }}</span>
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300"
                :class="openFaq === i ? 'bg-[#0A2A5C] text-white rotate-180' : 'bg-[#E8F0FE] text-[#1B5FD9]'"
              >
                <svg class="w-4 h-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </button>

            <div 
              class="overflow-hidden transition-all duration-300 text-[#5A6B8C] text-[14.5px] leading-relaxed"
              :style="{ maxHeight: openFaq === i ? '260px' : '0' }"
            >
              <div class="px-5 sm:px-6 pb-6 pt-1 border-t border-[#EEF3FA]">
                {{ faq.a }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. SECTION CTA PENDAFTARAN (Grounded Hero Student Cutout) -->
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
                Daftar SPMB 2027/2028
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </NuxtLink>

              <NuxtLink 
                to="/smk/akademik" 
                class="text-[#C9D8F2] hover:text-white font-bold text-[14.5px] underline underline-offset-4 transition-colors"
              >
                lihat kurikulum &amp; jurusan
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
