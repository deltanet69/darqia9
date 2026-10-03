<template>
  <!-- ======= BERITA & ARTIKEL ======= -->
  <section class="py-[64px] lg:py-[88px] bg-[#F5F8FF]" id="berita">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <div class="mb-[32px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[7px] px-[14px] rounded-full mb-[16px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#1B5FD9]"></span>
          Berita &amp; Artikel
        </div>
        <h2 class="text-[clamp(26px,4.6vw,40px)] font-extrabold text-[#0F1E38] tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Kabar <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Terkini</span>
        </h2>
        <p class="text-[#5A6B8C] text-[clamp(15px,2.4vw,17.5px)] max-w-[680px]">
          Ikuti aktivitas dan prestasi keluarga besar SMPIT BCA &amp; SMK IT Attaqwa 9.
        </p>
      </div>

      <!-- Filter Buttons -->
      <div class="flex flex-wrap gap-[8px] mb-[28px]">
        <button 
          type="button" 
          v-for="cat in ['all', 'berita', 'kegiatan', 'pengumuman']" 
          :key="cat"
          @click="activeFilter = cat"
          :class="[
            'py-[8px] px-[20px] rounded-full font-bold text-[13.5px] transition-all capitalize cursor-pointer border',
            activeFilter === cat ? 'bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] text-white border-transparent shadow-[0_10px_22px_rgba(27,95,217,.3)]' : 'bg-white border-[#E3EAF7] text-[#5A6B8C] hover:border-[#1B5FD9] hover:text-[#1B5FD9]'
          ]"
        >
          {{ cat === 'all' ? 'Semua' : cat }}
        </button>
      </div>

      <!-- News Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
        <article 
          v-for="(item, idx) in filteredBerita" 
          :key="idx" 
          class="bg-white border border-[#E3EAF7] rounded-[18px] overflow-hidden flex flex-col shadow-sm hover:shadow-[0_24px_60px_rgba(10,42,92,.16)] hover:-translate-y-[4px] transition-all duration-250"
        >
          <div class="h-[168px] relative overflow-hidden flex items-end p-[14px]">
            <div :class="['absolute inset-0 bg-gradient-to-br', item.bgGradient]"></div>
            <span class="absolute top-[12px] left-[12px] bg-[#0A2A5C]/80 text-white text-[11.5px] font-bold py-[6px] px-[12px] rounded-full backdrop-blur-sm z-10 capitalize">
              {{ item.category }}
            </span>
            <span class="absolute top-[12px] right-[12px] bg-white text-[#0A2A5C] text-[11.5px] font-bold py-[6px] px-[12px] rounded-full z-10">
              {{ item.date }}
            </span>
          </div>

          <div class="p-[22px] flex flex-col gap-[10px] flex-1">
            <h4 class="text-[16px] font-bold text-[#0F1E38] leading-[1.45]">{{ item.title }}</h4>
            <p class="text-[#5A6B8C] text-[13.5px] leading-[1.6] flex-1">{{ item.excerpt }}</p>
            <a :href="item.link" class="text-[#1B5FD9] font-bold text-[14px] inline-flex items-center gap-[6px] hover:gap-[10px] transition-all mt-[4px]">
              <span>Selengkapnya</span>
              <svg class="ai w-[15px] h-[15px]"><use href="#i-arrow-r"/></svg>
            </a>
          </div>
        </article>
      </div>

      <!-- Instagram CTA Card -->
      <div class="mt-[36px] bg-gradient-to-r from-[#7C3AED] via-[#DB2777] to-[#F59E0B] rounded-[20px] p-[24px] lg:p-[28px] text-white flex flex-col sm:flex-row items-center gap-[18px] shadow-[0_24px_60px_rgba(219,39,119,.25)]">
        <span class="w-[56px] h-[56px] rounded-[16px] bg-white/20 backdrop-blur-md grid place-items-center text-white shrink-0">
          <svg class="ai w-[30px] h-[30px]"><use href="#i-ig"/></svg>
        </span>
        <div>
          <b class="text-[17px] block">@smkit.attaqwa9</b>
          <p class="text-[13.5px] text-white/90">2.017+ pengikut — dokumentasi kegiatan terbaru selalu update di Instagram kami.</p>
        </div>
        <a 
          href="https://www.instagram.com/smkit.attaqwa9" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="sm:ml-auto bg-white text-[#7C3AED] font-extrabold text-[14.5px] py-[11px] px-[22px] rounded-[12px] shadow-sm hover:scale-105 transition-transform"
        >
          Follow Instagram
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeFilter = ref<string>('all')

// Berita Database
const beritaList = [
  {
    category: 'pengumuman',
    date: 'Sep 2026',
    title: 'SPMB Tahun Pelajaran 2026/2027 Resmi Dibuka',
    excerpt: 'Penerimaan murid baru SMP IT Bina Cendekia Assalam & SMK IT Attaqwa 9 telah dibuka. Daftar via formulir online atau WhatsApp.',
    link: '/spmb',
    bgGradient: 'from-[#1B5FD9] to-[#4C8DFF]'
  },
  {
    category: 'kegiatan',
    date: 'Agu 2026',
    title: 'Pelantikan Pengurus OSIS Periode 2026/2027',
    excerpt: 'Regenerasi kepemimpinan siswa: pengurus OSIS baru resmi dilantik dan siap menjalankan program kerja kepemimpinan.',
    link: 'https://www.instagram.com/smkit.attaqwa9',
    bgGradient: 'from-[#059669] to-[#34D399]'
  },
  {
    category: 'kegiatan',
    date: 'Agu 2026',
    title: 'Outing Class: Belajar Langsung dari Lapangan',
    excerpt: 'Siswa belajar di luar kelas — mengasah observasi, kemandirian, dan kebersamaan lewat pengalaman industri nyata.',
    link: 'https://www.instagram.com/smkit.attaqwa9',
    bgGradient: 'from-[#7C3AED] to-[#A78BFA]'
  },
  {
    category: 'berita',
    date: 'Jul 2026',
    title: 'Mempertahankan Akreditasi A: Komitmen Mutu Berkelanjutan',
    excerpt: 'Akreditasi A menjadi amanah untuk terus meningkatkan mutu pembelajaran vokasi, sarana BLK, dan layanan siswa.',
    link: 'https://www.instagram.com/smkit.attaqwa9',
    bgGradient: 'from-[#D97706] to-[#FBBF24]'
  },
  {
    category: 'kegiatan',
    date: 'Jun 2026',
    title: 'Peringatan Hari Pahlawan: Meneladani Semangat Juang',
    excerpt: 'Upacara dan pentas seni islami menumbuhkan nasionalisme dan apresiasi mendalam pada jasa para pahlawan bangsa.',
    link: 'https://www.instagram.com/smkit.attaqwa9',
    bgGradient: 'from-[#0EA5E9] to-[#22D3EE]'
  },
  {
    category: 'berita',
    date: 'Mei 2026',
    title: 'HUT PGRI: Apresiasi untuk Para Pendidik Inspiratif',
    excerpt: 'Siswa dan dewan guru merayakan Hari Guru dengan upacara khidmat serta persembahan karya seni santri.',
    link: 'https://www.instagram.com/smkit.attaqwa9',
    bgGradient: 'from-[#E11D48] to-[#FB7185]'
  }
]

const filteredBerita = computed(() => {
  if (activeFilter.value === 'all') return beritaList
  return beritaList.filter(b => b.category === activeFilter.value)
})
</script>
