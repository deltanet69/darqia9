<script setup lang="ts">
import { ref } from 'vue'
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smp' })

const isSubmitting = ref(false)
const formSent = ref(false)
const formData = ref({
  nama: '',
  kontak: '',
  topik: 'SPMB / Pendaftaran',
  pesan: ''
})

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
    a: 'Tiga gelombang: Gelombang I (01 Sep – 26 Des 2026), Gelombang II (01 Jan – 24 Apr 2027), dan Gelombang Tambahan (26 Apr – 27 Jun 2027). Kuota hanya 7 rombel untuk menjaga efektivitas kelas gender.'
  },
  {
    q: 'Berapa biaya pendaftarannya?',
    a: 'Biaya registrasi Rp50.000 — gratis bagi siswa berprestasi dan siswa yatim. Tersedia juga beasiswa Milad BCA ke-6 (gratis uang pangkal, SPP, seragam, buku, dan kegiatan).'
  },
  {
    q: 'Apa itu sekolah berbasis kelas gender?',
    a: 'Siswa putra belajar di kelas khusus laki-laki dan siswi putri di kelas khusus perempuan dengan metode CTL (Contextual Teaching and Learning) — pembelajaran lebih fokus dan pergaulan lebih terjaga secara syar\'i.'
  },
  {
    q: 'Program unggulan apa saja yang ada?',
    a: 'Tujuh program: kelas berbasis gender, kurikulum terintegrasi ICT, tahfidz metode Yanbu\'a, sima\'an & sholat berjamaah, pendalaman fiqih-ubudiyah, Talent Development Program + Entrepreneur Day, dan unggul bahasa & public speaking with School @america.'
  },
  {
    q: 'Di mana lokasi sekolah?',
    a: 'Ujung Harapan, Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17612. Silakan lihat peta atau hubungi sekretariat kami untuk panduan rute.'
  },
  {
    q: 'Bagaimana cara mendaftar?',
    a: 'Klik tombol "Daftar SPMB", isi formulir online, lalu lengkapi berkas persyaratan dan ikuti tes seleksi sesuai gelombang pilihan Anda.'
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#F2F9F5] text-[#0E241B] font-sans antialiased overflow-x-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[170px] sm:pt-[180px] md:pt-[190px] lg:pt-[200px] pb-[70px] lg:pb-[80px] bg-gradient-to-br from-[#0A4A30] via-[#063826] to-[#052E22]">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
      
      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="text-[12.5px] text-[#A9D4BC] font-semibold mb-3.5 flex items-center gap-1.5">
          <NuxtLink to="/smp" class="hover:text-white transition-colors">Home</NuxtLink>
          <span class="text-[#34C77B]">/</span>
          <b class="text-[#FCD34D]">Kontak Kami</b>
        </div>
        <h1 class="text-[clamp(32px,4.5vw,48px)] font-black tracking-[-0.02em] leading-tight mb-2.5">
          Hubungi <span class="bg-gradient-to-r from-[#7EE2AE] to-[#FCD34D] bg-clip-text text-transparent">Kami</span>
        </h1>
        <p class="text-[#C4E4D4] max-w-[650px] text-[15.5px] md:text-[16.5px] leading-relaxed">
          Ada pertanyaan seputar pendaftaran SPMB, model kelas gender, atau beasiswa? Sekretariat SMP IT BCA siap melayani Anda.
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. INFORMASI KONTAK & FORMULIR PESAN -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Kiri: 5 Info Cards (5 Cols) -->
          <div class="lg:col-span-5 space-y-4">
            
            <div class="mb-2">
              <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-2">
                <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/><circle cx="12" cy="10" r="2.6"/></svg>
                Sekretariat
              </span>
              <h2 class="text-[24px] font-black text-[#063826]">Kontak Resmi</h2>
            </div>

            <!-- Alamat -->
            <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-5 shadow-sm flex items-start gap-4">
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/><circle cx="12" cy="10" r="2.6"/></svg>
              </div>
              <div>
                <strong class="block text-[15px] font-black text-[#063826] mb-1">Alamat Kampus</strong>
                <p class="text-[13.5px] text-[#55705F] leading-snug">
                  Ujung Harapan, Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17612
                </p>
              </div>
            </div>

            <!-- Telepon -->
            <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-5 shadow-sm flex items-start gap-4">
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div>
                <strong class="block text-[15px] font-black text-[#063826] mb-1">Telepon Kantor</strong>
                <a href="tel:02188886776" class="text-[14px] font-bold text-[#0E7A4E] hover:underline">
                  021-8888 6776
                </a>
              </div>
            </div>

            <!-- WhatsApp -->
            <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-5 shadow-sm flex items-start gap-4">
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.871.815 2.796.815 3.182 0 5.768-2.587 5.769-5.767.001-3.181-2.585-5.766-5.769-5.766zm3.435 8.204c-.144.405-.838.775-1.171.825-.31.046-.713.064-2.12-.518-1.794-.741-2.934-2.56-3.023-2.679-.089-.119-.729-.97-.729-1.85 0-.88.46-1.314.624-1.493.164-.179.358-.224.478-.224.12 0 .239.001.344.006.11.005.258-.042.404.309.15.358.513 1.25.558 1.34.045.09.075.195.015.314-.06.12-.09.195-.179.3-.09.104-.188.232-.269.313-.09.09-.184.188-.079.368.105.18.467.771 1.002 1.248.689.614 1.27.804 1.45.894.18.09.284.075.389-.045.105-.12.449-.523.569-.703.12-.179.239-.149.398-.09.16.06 1.017.48 1.192.568.175.09.292.135.337.21.045.075.045.435-.099.84z"/></svg>
              </div>
              <div>
                <strong class="block text-[15px] font-black text-[#063826] mb-1">WhatsApp Panitia</strong>
                <a href="https://wa.me/6281210949978" target="_blank" rel="noopener noreferrer" class="text-[14px] font-bold text-[#0E7A4E] hover:underline block">
                  0812 1094 9978 (Panitia SPMB)
                </a>
              </div>
            </div>

            <!-- Email & Medsos -->
            <div class="rv bg-white border border-[#D1E7DD] rounded-[20px] p-5 shadow-sm flex items-start gap-4">
              <div class="w-12 h-12 rounded-[14px] bg-[#E4F4EC] text-[#0E7A4E] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7.5L12 13l8.5-5.5"/></svg>
              </div>
              <div>
                <strong class="block text-[15px] font-black text-[#063826] mb-1">Email &amp; Medsos</strong>
                <a href="mailto:smpitbca@gmail.com" class="text-[13.5px] font-bold text-[#0E7A4E] hover:underline block">
                  smpitbca@gmail.com
                </a>
                <span class="text-[12px] text-[#55705F]">IG: @smpit.bca · FB: SMP IT. BCA</span>
              </div>
            </div>

            <!-- Map Box -->
            <div class="rv bg-gradient-to-br from-[#063826] to-[#0A4A30] text-white rounded-[22px] p-6 shadow-md">
              <span class="text-[12px] font-bold text-[#FCD34D] block uppercase tracking-wider mb-1">Petunjuk Arah</span>
              <strong class="text-[17px] font-black block mb-1">Kampus SMP IT BCA</strong>
              <p class="text-[13px] text-[#C4E4D4] mb-4">Ujung Harapan, Babelan, Kabupaten Bekasi</p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=SMP+IT+Bina+Cendekia+Assalam+Babelan+Bekasi" 
                target="_blank" 
                rel="noopener noreferrer"
                class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0E7A4E] hover:bg-[#34C77B] text-white font-bold text-[13px] transition-all"
              >
                Buka di Google Maps →
              </a>
            </div>

          </div>

          <!-- Kanan: Form Pesan (7 Cols) -->
          <div class="lg:col-span-7 bg-white border border-[#D1E7DD] rounded-[24px] p-7 sm:p-9 md:p-10 shadow-sm">
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Layanan Pesan
            </span>
            <h2 class="text-[26px] sm:text-[28px] font-black text-[#063826] mb-2">Kirim Pesan Anda</h2>
            <p class="text-[14.5px] text-[#55705F] mb-8 leading-relaxed">
              Tim sekretariat kami akan merespons pertanyaan Anda maksimal 1×24 jam pada hari kerja.
            </p>

            <div v-if="formSent" class="mb-6 bg-[#ECFDF5] border border-[#6EE7B7] text-[#065F46] p-5 rounded-[18px]">
              <strong class="block text-[15px] font-black mb-1">Pesan Berhasil Terkirim!</strong>
              <p class="text-[13.5px]">Terima kasih telah menghubungi SMP IT BCA. Kami akan segera menghubungi Anda.</p>
              <button @click="formSent = false" class="text-[12.5px] font-bold underline mt-2 inline-block">Kirim pesan lain</button>
            </div>

            <form v-else @submit.prevent="sendForm" class="space-y-4">
              <div>
                <label for="smp-nama" class="block text-[13.5px] font-bold text-[#063826] mb-1.5">Nama Lengkap *</label>
                <input 
                  id="smp-nama" 
                  v-model="formData.nama"
                  type="text" 
                  required 
                  placeholder="Nama Anda" 
                  class="w-full border border-[#D1E7DD] rounded-[14px] py-3.5 px-4 text-[14.5px] bg-[#F2F9F5] focus:bg-white focus:outline-none focus:border-[#0E7A4E] focus:ring-4 focus:ring-[#0E7A4E]/10 transition-all"
                />
              </div>

              <div>
                <label for="smp-kontak" class="block text-[13.5px] font-bold text-[#063826] mb-1.5">No. WhatsApp / Email *</label>
                <input 
                  id="smp-kontak" 
                  v-model="formData.kontak"
                  type="text" 
                  required 
                  placeholder="08xx / email@contoh.com" 
                  class="w-full border border-[#D1E7DD] rounded-[14px] py-3.5 px-4 text-[14.5px] bg-[#F2F9F5] focus:bg-white focus:outline-none focus:border-[#0E7A4E] focus:ring-4 focus:ring-[#0E7A4E]/10 transition-all"
                />
              </div>

              <div>
                <label for="smp-topik" class="block text-[13.5px] font-bold text-[#063826] mb-1.5">Topik *</label>
                <select 
                  id="smp-topik" 
                  v-model="formData.topik"
                  class="w-full border border-[#D1E7DD] rounded-[14px] py-3.5 px-4 text-[14.5px] font-semibold text-[#063826] bg-[#F2F9F5] focus:bg-white focus:outline-none focus:border-[#0E7A4E] focus:ring-4 focus:ring-[#0E7A4E]/10 transition-all cursor-pointer"
                >
                  <option value="SPMB / Pendaftaran">SPMB / Pendaftaran 2027/2028</option>
                  <option value="Biaya & Beasiswa">Biaya Pendidikan &amp; Beasiswa Milad BCA</option>
                  <option value="Kelas Gender">Konsultasi Model Kelas Gender</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label for="smp-pesan" class="block text-[13.5px] font-bold text-[#063826] mb-1.5">Pesan *</label>
                <textarea 
                  id="smp-pesan" 
                  v-model="formData.pesan"
                  rows="4" 
                  required 
                  placeholder="Tuliskan pertanyaan Anda..." 
                  class="w-full border border-[#D1E7DD] rounded-[14px] py-3.5 px-4 text-[14.5px] bg-[#F2F9F5] focus:bg-white focus:outline-none focus:border-[#0E7A4E] focus:ring-4 focus:ring-[#0E7A4E]/10 transition-all"
                ></textarea>
              </div>

              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="w-full py-4 px-7 rounded-[14px] text-white font-black text-[15px] bg-gradient-to-r from-[#0E7A4E] to-[#063826] hover:from-[#12A15E] hover:to-[#0E7A4E] shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {{ isSubmitting ? 'Mengirim Pesan...' : 'Kirim Pesan Sekarang →' }}
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. FAQ ACCORDION -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E0ECE6]">
      <div class="max-w-[860px] mx-auto px-5 lg:px-6">
        
        <div class="text-center mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Tanya Jawab
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            Pertanyaan Umum (FAQ)
          </h2>
        </div>

        <div class="space-y-3.5">
          <div 
            v-for="(faq, i) in faqs" 
            :key="i"
            class="rv bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] overflow-hidden transition-all duration-200"
            :class="{ 'bg-white shadow-md border-[#0E7A4E]/40': openFaq === i }"
          >
            <button 
              class="w-full text-left font-black text-[15.5px] sm:text-[16.5px] text-[#063826] p-5 sm:p-6 cursor-pointer flex justify-between items-center gap-4 hover:text-[#0E7A4E] transition-colors"
              @click="toggleFaq(i)"
            >
              <span>{{ faq.q }}</span>
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300"
                :class="openFaq === i ? 'bg-[#063826] text-white rotate-180' : 'bg-[#E4F4EC] text-[#0E7A4E]'"
              >
                <svg class="w-4 h-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </button>

            <div 
              class="overflow-hidden transition-all duration-300 text-[#55705F] text-[14.5px] leading-relaxed"
              :style="{ maxHeight: openFaq === i ? '260px' : '0' }"
            >
              <div class="px-5 sm:px-6 pb-6 pt-1 border-t border-[#D1E7DD]">
                {{ faq.a }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>
