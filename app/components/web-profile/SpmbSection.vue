<template>
  <!-- ======= SPMB SECTION ======= -->
  <section class="py-[64px] lg:py-[88px] bg-gradient-to-br from-[#0A2A5C] via-[#123E85] to-[#1B5FD9] text-white relative overflow-hidden" id="spmb">
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:30px_30px] pointer-events-none"></div>

    <div class="relative w-[min(1180px,100%-40px)] mx-auto">
      <div class="mb-[36px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#FDE68A] bg-white/15 py-[7px] px-[14px] rounded-full mb-[16px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#FDE68A]"></span>
          SPMB 2026/2027
        </div>
        <h2 class="text-[clamp(26px,4.6vw,42px)] font-extrabold text-white tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Penerimaan Murid Baru<br>Telah Dibuka
        </h2>
        <p class="text-[#C9D9F5] text-[clamp(15px,2.4vw,17.5px)] max-w-[680px]">
          Bergabunglah dengan keluarga besar SMP IT Bina Cendekia Assalam &amp; SMK IT Attaqwa 9. Kuota terbatas setiap tahun ajaran.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-[28px] items-start mb-[48px]">
        <!-- Steps & CTAs -->
        <div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-[14px] mb-[24px]">
            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[22px] backdrop-blur-md">
              <div class="w-[42px] h-[42px] rounded-[13px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white font-extrabold text-[17px] grid place-items-center mb-[14px]">
                1
              </div>
              <b class="block text-[15.5px] font-bold mb-[6px]">Isi Formulir</b>
              <p class="text-[#C9D9F5] text-[13.5px] leading-[1.6]">Daftar via WhatsApp atau formulir online melalui portal PMB resmi sekolah.</p>
            </div>

            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[22px] backdrop-blur-md">
              <div class="w-[42px] h-[42px] rounded-[13px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white font-extrabold text-[17px] grid place-items-center mb-[14px]">
                2
              </div>
              <b class="block text-[15.5px] font-bold mb-[6px]">Verifikasi Berkas</b>
              <p class="text-[#C9D9F5] text-[13.5px] leading-[1.6]">Serahkan/pindai dokumen persyaratan ke panitia SPMB untuk diverifikasi.</p>
            </div>

            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[22px] backdrop-blur-md">
              <div class="w-[42px] h-[42px] rounded-[13px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white font-extrabold text-[17px] grid place-items-center mb-[14px]">
                3
              </div>
              <b class="block text-[15.5px] font-bold mb-[6px]">Observasi &amp; Wawancara</b>
              <p class="text-[#C9D9F5] text-[13.5px] leading-[1.6]">Calon murid mengikuti observasi akademik serta wawancara bersama orang tua.</p>
            </div>

            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[22px] backdrop-blur-md">
              <div class="w-[42px] h-[42px] rounded-[13px] bg-gradient-to-br from-[#F0B429] to-[#FDE68A] text-[#3D2C00] font-extrabold text-[17px] grid place-items-center mb-[14px]">
                4
              </div>
              <b class="block text-[15.5px] font-bold mb-[6px]">Daftar Ulang</b>
              <p class="text-[#C9D9F5] text-[13.5px] leading-[1.6]">Lengkapi administrasi daftar ulang — selamat datang di keluarga besar kami!</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-[12px]">
            <NuxtLink 
              to="/spmb" 
              class="inline-flex items-center gap-[9px] font-extrabold text-[15px] py-[13px] px-[26px] rounded-[14px] text-[#3D2C00] bg-gradient-to-r from-[#E9A319] to-[#F0B429] shadow-[0_12px_26px_rgba(240,180,41,.35)] hover:-translate-y-[1px] transition-all"
            >
              <span>Portal PMB Resmi</span>
              <svg class="ai w-[16px] h-[16px]"><use href="#i-arrow-r"/></svg>
            </NuxtLink>
            <a 
              href="tel:02188886776" 
              class="inline-flex items-center gap-[8px] font-bold text-[15px] py-[13px] px-[24px] rounded-[14px] text-white bg-white/15 border border-white/30 hover:bg-white/25 transition-colors"
            >
              <svg class="ai w-[16px] h-[16px]"><use href="#i-phone"/></svg>
              <span>021-88886776</span>
            </a>
          </div>
        </div>

        <!-- Syarat Pendaftaran Card -->
        <div class="bg-white rounded-[20px] p-[24px_28px] text-[#0F1E38] shadow-lg">
          <h4 class="text-[17px] font-extrabold text-[#0F1E38] mb-[16px]">Syarat Pendaftaran</h4>
          <ul class="space-y-[12px] mb-[24px]">
            <li class="flex items-start gap-[11px] text-[14.5px] text-[#33415C]">
              <svg class="ai w-[18px] h-[18px] text-[#16A34A] shrink-0 mt-[2px]"><use href="#i-check"/></svg>
              <span>Fotokopi Kartu Keluarga (KK)</span>
            </li>
            <li class="flex items-start gap-[11px] text-[14.5px] text-[#33415C]">
              <svg class="ai w-[18px] h-[18px] text-[#16A34A] shrink-0 mt-[2px]"><use href="#i-check"/></svg>
              <span>Fotokopi Akta Kelahiran</span>
            </li>
            <li class="flex items-start gap-[11px] text-[14.5px] text-[#33415C]">
              <svg class="ai w-[18px] h-[18px] text-[#16A34A] shrink-0 mt-[2px]"><use href="#i-check"/></svg>
              <span>Ijazah / SKL dari sekolah asal</span>
            </li>
            <li class="flex items-start gap-[11px] text-[14.5px] text-[#33415C]">
              <svg class="ai w-[18px] h-[18px] text-[#16A34A] shrink-0 mt-[2px]"><use href="#i-check"/></svg>
              <span>Pas foto terbaru ukuran 3×4</span>
            </li>
            <li class="flex items-start gap-[11px] text-[14.5px] text-[#33415C]">
              <svg class="ai w-[18px] h-[18px] text-[#16A34A] shrink-0 mt-[2px]"><use href="#i-check"/></svg>
              <span>Mengisi formulir pendaftaran</span>
            </li>
          </ul>
          <NuxtLink to="/spmb" class="w-full inline-flex items-center justify-center font-bold text-[14.5px] py-[12px] px-[20px] rounded-[12px] text-white bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] shadow-md hover:shadow-lg transition-all">
            Buka Pendaftaran Online
          </NuxtLink>
        </div>
      </div>

      <!-- FAQ Accordion -->
      <div class="max-w-[760px]">
        <h2 class="text-[clamp(20px,3.4vw,28px)] font-bold text-white mb-[20px]">Pertanyaan Umum</h2>
        <div class="space-y-[10px]">
          <div 
            v-for="(faq, idx) in faqList" 
            :key="idx" 
            class="bg-white/8 border border-white/15 rounded-[14px] overflow-hidden backdrop-blur-md"
          >
            <button 
              type="button" 
              @click="toggleFaq(idx)"
              class="w-full flex justify-between items-center gap-[12px] p-[18px_20px] font-bold text-[15px] text-left text-white cursor-pointer"
            >
              <span>{{ faq.q }}</span>
              <svg :class="['ai w-[18px] h-[18px] text-[#F0B429] shrink-0 transition-transform duration-250', openFaqIndex === idx ? 'rotate-180' : '']">
                <use href="#i-chev-d"/>
              </svg>
            </button>
            <div v-show="openFaqIndex === idx" class="px-[20px] pb-[18px] text-[#C9D9F5] text-[14px] leading-[1.6]">
              <p>{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const openFaqIndex = ref<number | null>(null)
const toggleFaq = (index: number) => {
  openFaqIndex.value = openFaqIndex.value === index ? null : index
}

const faqList = [
  {
    q: 'Kapan SPMB 2026/2027 dibuka?',
    a: 'Penerimaan murid baru tahun pelajaran 2026/2027 sudah dibuka. Karena kuota tiap rombongan belajar terbatas, kami sarankan mendaftar lebih awal melalui portal PMB resmi atau menghubungi 021-88886776.'
  },
  {
    q: 'Apa saja jenjang yang tersedia?',
    a: 'Tersedia dua jenjang dalam satu kompleks: SMP IT Bina Cendekia Assalam (SMPIT BCA) dan SMK IT Attaqwa 9. Lulusan SMPIT BCA mendapat jalur lanjut prioritas ke SMK IT Attaqwa 9.'
  },
  {
    q: 'Apakah ada program tahfidz?',
    a: "Ya. Tahsin & tahfidz Al-Qur'an adalah program unggulan kami, didukung kegiatan muhadhoroh, mabit, marawis, dan hadroh sebagai pembinaan karakter islami."
  },
  {
    q: 'Bagaimana prospek lulusan SMK?',
    a: 'Lulusan dibekali tiga jalur: bekerja (didukung BKK & link industri DUDIKA), melanjutkan kuliah, atau berwirausaha (dilatih lewat koperasi pelajar & bengkel produksi).'
  },
  {
    q: 'Di mana lokasi sekolah?',
    a: 'Ujung Harapan Musholla Assalam, Kelurahan Bahagia, Kecamatan Babelan, Kabupaten Bekasi 17610, Jawa Barat.'
  }
]
</script>
