<script setup lang="ts">
import { useGsapReveal } from "~/composables/useGsapReveal";
useGsapReveal();
import { ref } from 'vue'
definePageMeta({ layout: 'smk' })

const formSent = ref(false)
const openFaq = ref<number | null>(null)

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index
}

const sendForm = () => {
  formSent.value = true
  setTimeout(() => { formSent.value = false }, 3000)
}
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[50px] pb-[60px] bg-gradient-to-br from-[#0C2C61] to-[#061A3E]">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="text-[12.5px] text-[#8FA6CC] font-semibold mb-3.5">
          <NuxtLink to="/smk" class="hover:underline">Home</NuxtLink> / <b class="text-[#FCD34D]">Kontak Kami</b>
        </div>
        <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-[-0.02em] leading-tight mb-2.5">Kontak Kami</h1>
        <p class="text-[#B9CBE8] max-w-[700px] text-[16px] leading-relaxed">
          Ada pertanyaan? Hubungi kami langsung atau kirim pesan melalui formulir di bawah.
        </p>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. KONTAK & FORMULIR (Soft Ice Blue Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Info Kontak Kiri -->
          <div class="lg:col-span-5 space-y-4">
            
            <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,42,92,0.06)] flex items-start gap-4">
              <div class="w-11 h-11 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/><circle cx="12" cy="10" r="2.6"/></svg>
              </div>
              <div>
                <b class="block text-[15.5px] font-bold text-[#061A3E]">Alamat</b>
                <span class="text-[13.5px] text-[#5A6B8C] leading-snug">Ujung Harapan, Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17612</span>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,42,92,0.06)] flex items-start gap-4">
              <div class="w-11 h-11 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5.5 4h3.6l1.9 4.8-2.4 1.4a12.5 12.5 0 005.2 5.2l1.4-2.4 4.8 1.9v3.6a2 2 0 01-2.1 2A16.5 16.5 0 013.5 6.1a2 2 0 012-2.1z"/></svg>
              </div>
              <div>
                <b class="block text-[15.5px] font-bold text-[#061A3E]">Telepon</b>
                <span class="text-[13.5px] text-[#5A6B8C]">021-8888 6776</span>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,42,92,0.06)] flex items-start gap-4">
              <div class="w-11 h-11 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20 12a8 8 0 10-14.7 4.4L4 20l3.7-1.2A8 8 0 0020 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>
              </div>
              <div>
                <b class="block text-[15.5px] font-bold text-[#061A3E]">WhatsApp</b>
                <span class="text-[13.5px] text-[#5A6B8C]">0812 1094 9978 · 0878 4748 8247</span>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,42,92,0.06)] flex items-start gap-4">
              <div class="w-11 h-11 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7.5L12 13l8.5-5.5"/></svg>
              </div>
              <div>
                <b class="block text-[15.5px] font-bold text-[#061A3E]">Email</b>
                <span class="text-[13.5px] text-[#5A6B8C]">smkitattaqwa09@gmail.com</span>
              </div>
            </div>

            <div class="bg-white border border-[#E3EAF7] rounded-[18px] p-5 shadow-[0_10px_30px_rgba(10,42,92,0.06)] flex items-start gap-4">
              <div class="w-11 h-11 rounded-[13px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.3"/><path d="M12 7.5V12l3.3 2"/></svg>
              </div>
              <div>
                <b class="block text-[15.5px] font-bold text-[#061A3E]">Jam Layanan</b>
                <span class="text-[13.5px] text-[#5A6B8C]">Senin–Jumat 08.00–15.00 · Sabtu–Ahad 09.00–14.00 WIB</span>
              </div>
            </div>

            <!-- Map Box -->
            <div class="bg-gradient-to-br from-[#DCE9FB] to-[#B9D2F5] border border-[#C9DDFB] rounded-[20px] p-6 text-center text-[#0A2A5C] flex flex-col items-center justify-center gap-3 mt-4">
              <svg class="w-10 h-10 text-[#1B5FD9] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/><circle cx="12" cy="10" r="2.6"/></svg>
              <span class="font-bold text-[14.5px]">Ujung Harapan, Babelan,<br>Kabupaten Bekasi</span>
              <a 
                class="inline-flex items-center justify-center font-bold text-[13.5px] py-2.5 px-5 rounded-[12px] text-white bg-gradient-to-r from-[#2B7CD8] to-[#0A2A5C] shadow-md hover:-translate-y-0.5 transition-all"
                href="https://www.google.com/maps/search/?api=1&query=SMK+IT+Attaqwa+9+Babelan+Bekasi" 
                target="_blank" 
                rel="noopener"
              >
                Buka di Google Maps →
              </a>
            </div>

          </div>

          <!-- Form Kirim Pesan Kanan -->
          <div class="lg:col-span-7 bg-white border border-[#E3EAF7] rounded-[22px] p-8 md:p-10 shadow-[0_10px_30px_rgba(10,42,92,0.08)]">
            <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">Formulir Pesan</span>
            <h2 class="text-[26px] font-black text-[#061A3E] mb-2">Kirim Pesan</h2>
            <p class="text-[14.5px] text-[#5A6B8C] mb-6">Tim kami akan membalas maksimal 1×24 jam pada hari kerja.</p>
            
            <form id="contactForm" @submit.prevent="sendForm" class="space-y-4">
              <div>
                <label for="cf-nama" class="block text-[13.5px] font-bold text-[#061A3E] mb-1.5">Nama Lengkap</label>
                <input id="cf-nama" required placeholder="Nama Anda" class="w-full border border-[#E3EAF7] rounded-[12px] py-3 px-4 text-[15px] font-medium text-[#0F1E38] bg-[#FBFDFF] focus:outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10">
              </div>

              <div>
                <label for="cf-wa" class="block text-[13.5px] font-bold text-[#061A3E] mb-1.5">No. WhatsApp / Email</label>
                <input id="cf-wa" required placeholder="08xx / email@contoh.com" class="w-full border border-[#E3EAF7] rounded-[12px] py-3 px-4 text-[15px] font-medium text-[#0F1E38] bg-[#FBFDFF] focus:outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10">
              </div>

              <div>
                <label for="cf-topik" class="block text-[13.5px] font-bold text-[#061A3E] mb-1.5">Topik</label>
                <select id="cf-topik" class="w-full border border-[#E3EAF7] rounded-[12px] py-3 px-4 text-[15px] font-medium text-[#0F1E38] bg-[#FBFDFF] focus:outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10">
                  <option>SPMB / Pendaftaran</option>
                  <option>Biaya &amp; Beasiswa</option>
                  <option>Jurusan</option>
                  <option>Lainnya</option>
                </select>
              </div>

              <div>
                <label for="cf-pesan" class="block text-[13.5px] font-bold text-[#061A3E] mb-1.5">Pesan</label>
                <textarea id="cf-pesan" rows="5" required placeholder="Tulis pertanyaan Anda..." class="w-full border border-[#E3EAF7] rounded-[12px] py-3 px-4 text-[15px] font-medium text-[#0F1E38] bg-[#FBFDFF] focus:outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10"></textarea>
              </div>

              <button 
                class="w-full inline-flex items-center justify-center gap-2 font-bold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#2B7CD8] to-[#0A2A5C] shadow-[0_10px_24px_rgba(27,106,201,0.35)] hover:-translate-y-0.5 transition-all mt-4" 
                type="submit"
              >
                Kirim Pesan →
              </button>

              <div 
                v-if="formSent"
                class="bg-[#ECFDF5] border border-[#6EE7B7] text-[#065F46] font-bold text-[14.5px] p-4 rounded-[12px] text-center"
              >
                ✓ Pesan terkirim! Terima kasih — tim kami akan segera menghubungi Anda.
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. FAQ ACCORDION (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E3EAF7]">
      <div class="max-w-[820px] mx-auto px-5 lg:px-6">
        
        <div class="text-center mb-11">
          <span class="inline-block text-[12px] font-extrabold tracking-[0.16em] text-[#1B5FD9] uppercase mb-2">FAQ</span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] text-[#061A3E]">Pertanyaan Umum</h2>
        </div>

        <div class="space-y-3">
          <div 
            v-for="(faq, i) in [
              { q: 'Kapan SPMB 2027/2028 dibuka?', a: 'Tiga gelombang: Gelombang I (1 Sep–26 Des 2026), Gelombang II (1 Jan–24 Apr 2027), dan Gelombang Tambahan (26 Apr–27 Jun 2027). Kuota hanya 7 rombel.' },
              { q: 'Berapa biaya pendaftarannya?', a: 'Biaya registrasi Rp50.000 — gratis bagi siswa berprestasi dan siswa yatim. Tersedia juga berbagai skema beasiswa SPP.' },
              { q: 'Jurusan apa saja yang tersedia?', a: 'Enam konsentrasi: AKL, OTKP (bidang Bisnis & Manajemen); TBSM, TKR (Teknik Otomotif); TKJ, DKV (Teknologi Informasi).' },
              { q: 'Apakah ada beasiswa?', a: 'Ada — gratis uang pangkal, gratis SPP untuk siswa berprestasi / yatim / anak guru / KETM, gratis seragam, buku, dan biaya praktek, plus subsidi silang selama 3 tahun.' },
              { q: 'Di mana lokasi sekolah?', a: 'Ujung Harapan, Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17612. Lihat peta di atas atau hubungi kami untuk panduan rute.' },
              { q: 'Bagaimana cara mendaftar?', a: 'Klik tombol \'Daftar SPMB\', isi formulir online, lalu lengkapi berkas persyaratan dan ikuti tes seleksi sesuai gelombang pilihanmu.' }
            ]"
            :key="i"
            class="bg-white border border-[#E3EAF7] rounded-[14px] overflow-hidden"
          >
            <button 
              class="w-full text-left font-bold text-[15.5px] text-[#061A3E] p-5 cursor-pointer flex justify-between items-center gap-4 bg-transparent hover:bg-[#F5F8FF] transition-colors"
              @click="toggleFaq(i)"
            >
              <span>{{ faq.q }}</span>
              <span class="text-[22px] font-extrabold text-[#1B5FD9] transition-transform duration-200" :class="{ 'rotate-45': openFaq === i }">+</span>
            </button>
            <div 
              class="overflow-hidden transition-all duration-300 text-[#5A6B8C] text-[14.5px] leading-relaxed"
              :style="{ maxHeight: openFaq === i ? '200px' : '0' }"
            >
              <div class="px-5 pb-5 pt-1 border-t border-[#F5F8FF]">
                {{ faq.a }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>
