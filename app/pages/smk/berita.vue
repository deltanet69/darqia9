<script setup lang="ts">
useHead({
  title: 'Berita & Artikel — SMK IT Attaqwa 9',
  meta: [
    {
      name: 'description',
      content: 'Kabar terbaru, gagasan pendidikan, dan pengumuman resmi dari SMK IT Attaqwa 9 Babelan Bekasi.'
    }
  ]
})

const activeCategory = ref<'semua' | 'berita' | 'artikel' | 'pengumuman'>('semua')

interface NewsItem {
  id: string
  category: 'berita' | 'artikel' | 'pengumuman'
  categoryLabel: string
  title: string
  desc: string
  date: string
  author?: string
  isFeatured?: boolean
}

const featuredNews: NewsItem = {
  id: 'spmb-dibuka-2027',
  category: 'pengumuman',
  categoryLabel: 'Pengumuman • Headline',
  title: 'SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran',
  desc: 'Penerimaan murid baru tahun ajaran 2027/2028 resmi dibuka dengan tiga gelombang dan biaya registrasi hanya Rp50.000. Kuota terbatas hanya tujuh rombel - ditambah pendaftaran inden untuk 2028/2029.',
  date: '4 Oktober 2026',
  author: 'Panitia SPMB',
  isFeatured: true
}

const newsList: NewsItem[] = [
  {
    id: 'deep-learning',
    category: 'artikel',
    categoryLabel: 'Artikel',
    title: 'Mengenal Deep Learning: Cara Baru Belajar di Kurikulum Merdeka',
    desc: 'Bukan sekadar menghafal - bagaimana pendekatan pembelajaran mendalam mengubah cara siswa Attaqwa 9 memahami pelajaran.',
    date: '28 September 2026'
  },
  {
    id: 'blk-komunitas',
    category: 'berita',
    categoryLabel: 'Berita',
    title: 'BLK Komunitas: Jembatan Sekolah Menuju Dunia Industri',
    desc: 'Gedung Balai Latihan Kerja Komunitas Kemnaker RI menjadi pusat praktik kejuruan yang terhubung langsung dengan kebutuhan industri.',
    date: '20 September 2026'
  },
  {
    id: 'tahfidz-yanbua',
    category: 'artikel',
    categoryLabel: 'Artikel',
    title: 'Program Tahfidz Yanbu\'a: Target Hafalan Setiap Semester',
    desc: 'Metode Yanbu\'a membuat setoran hafalan Qur\'an menjadi pembiasaan yang ringan dan terukur bagi siswa vokasi.',
    date: '12 September 2026'
  },
  {
    id: 'simaan-sholat',
    category: 'berita',
    categoryLabel: 'Berita',
    title: 'Sima\'an Qur\'an dan Sholat Berjamaah: Pembiasaan Harian Siswa',
    desc: 'Setiap hari dimulai dengan sima\'an dan ditutup dengan sholat berjamaah - budaya sekolah yang membentuk karakter.',
    date: '5 September 2026'
  },
  {
    id: 'entrepreneur-day',
    category: 'berita',
    categoryLabel: 'Berita',
    title: 'Entrepreneur Day: Melatih Jiwa Wirausaha Sejak Sekolah',
    desc: 'Siswa mempraktikkan ilmu kewirausahaan lewat bazar dan proyek usaha nyata di lingkungan sekolah.',
    date: '28 Agustus 2026'
  },
  {
    id: 'jadwal-tes-g1',
    category: 'pengumuman',
    categoryLabel: 'Pengumuman',
    title: 'Jadwal Tes Gelombang I SPMB 2027/2028',
    desc: 'Tes seleksi gelombang pertama dilaksanakan Ahad, 27 Desember 2026. Pengumuman hasil 30 Desember 2026.',
    date: '15 Agustus 2026'
  }
]

const showFeatured = computed(() => {
  return activeCategory.value === 'semua' || activeCategory.value === featuredNews.category
})

const filteredNews = computed(() => {
  if (activeCategory.value === 'semua') return newsList
  return newsList.filter(n => n.category === activeCategory.value)
})

const selectedItem = ref<NewsItem | null>(null)
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased flex flex-col">
    <SmkHeader />

    <main class="flex-1 pt-[72px] lg:pt-[116px]">
      <!-- Page Hero Header -->
      <section class="bg-gradient-to-br from-[#0C2C61] via-[#0A2A5C] to-[#061A3E] text-white py-[48px] sm:py-[64px] border-b border-white/10 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        <div class="w-[min(1180px,100%-40px)] mx-auto relative z-10">
          <div class="flex items-center gap-[8px] text-[13px] font-semibold text-[#A9BDDD] mb-[12px]">
            <NuxtLink to="/smk" class="hover:text-white transition-colors">Home</NuxtLink>
            <span>/</span>
            <b class="text-[#FCD34D]">Berita &amp; Artikel</b>
          </div>
          <h1 class="text-[clamp(28px,4vw,44px)] font-black tracking-tight leading-[1.15] mb-[12px]">
            Berita &amp; Artikel
          </h1>
          <p class="text-[#C9D8F2] text-[15.5px] sm:text-[17px] max-w-[620px] leading-relaxed">
            Kabar terbaru, gagasan pendidikan, dan pengumuman resmi dari SMK IT Attaqwa 9.
          </p>
        </div>
      </section>

      <!-- Main News Section -->
      <section class="py-[64px] lg:py-[88px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <!-- Filter Category Chips -->
          <div class="flex flex-wrap gap-[10px] mb-[36px]">
            <button
              type="button"
              :class="[
                'font-bold text-[14px] py-[9px] px-[20px] rounded-[12px] transition-all cursor-pointer border',
                activeCategory === 'semua'
                  ? 'bg-[#0A2A5C] text-white border-[#0A2A5C] shadow-[0_4px_14px_rgba(10,42,92,.2)]'
                  : 'bg-white text-[#5A6B8C] border-[#E3EAF7] hover:border-[#1B5FD9]/40 hover:text-[#0A2A5C]'
              ]"
              @click="activeCategory = 'semua'"
            >
              Semua
            </button>
            <button
              type="button"
              :class="[
                'font-bold text-[14px] py-[9px] px-[20px] rounded-[12px] transition-all cursor-pointer border',
                activeCategory === 'berita'
                  ? 'bg-[#0A2A5C] text-white border-[#0A2A5C] shadow-[0_4px_14px_rgba(10,42,92,.2)]'
                  : 'bg-white text-[#5A6B8C] border-[#E3EAF7] hover:border-[#1B5FD9]/40 hover:text-[#0A2A5C]'
              ]"
              @click="activeCategory = 'berita'"
            >
              Berita
            </button>
            <button
              type="button"
              :class="[
                'font-bold text-[14px] py-[9px] px-[20px] rounded-[12px] transition-all cursor-pointer border',
                activeCategory === 'artikel'
                  ? 'bg-[#0A2A5C] text-white border-[#0A2A5C] shadow-[0_4px_14px_rgba(10,42,92,.2)]'
                  : 'bg-white text-[#5A6B8C] border-[#E3EAF7] hover:border-[#1B5FD9]/40 hover:text-[#0A2A5C]'
              ]"
              @click="activeCategory = 'artikel'"
            >
              Artikel
            </button>
            <button
              type="button"
              :class="[
                'font-bold text-[14px] py-[9px] px-[20px] rounded-[12px] transition-all cursor-pointer border',
                activeCategory === 'pengumuman'
                  ? 'bg-[#0A2A5C] text-white border-[#0A2A5C] shadow-[0_4px_14px_rgba(10,42,92,.2)]'
                  : 'bg-white text-[#5A6B8C] border-[#E3EAF7] hover:border-[#1B5FD9]/40 hover:text-[#0A2A5C]'
              ]"
              @click="activeCategory = 'pengumuman'"
            >
              Pengumuman
            </button>
          </div>

          <!-- Featured Headline News -->
          <div 
            v-if="showFeatured" 
            class="bg-white border border-[#E3EAF7] rounded-[24px] overflow-hidden shadow-[0_12px_36px_rgba(10,42,92,.08)] mb-[32px] grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] hover:shadow-[0_20px_48px_rgba(10,42,92,.12)] transition-all cursor-pointer"
            @click="selectedItem = featuredNews"
          >
            <div class="bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C] min-h-[200px] flex flex-col items-center justify-center p-6 text-white text-center">
              <svg class="w-16 h-16 text-white/80 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3.5 10.5v4l3.5.6v-5.2l-3.5.6z"/>
                <path d="M7 9.9L17.5 5v14L7 14.1"/>
                <path d="M17.5 8.8a3.2 3.2 0 010 6.4"/>
              </svg>
              <span class="text-[11px] font-bold text-[#FCD34D] uppercase tracking-wider">Headline Utama</span>
            </div>
            <div class="p-[28px_24px] sm:p-[36px_32px] flex flex-col justify-center">
              <div class="flex items-center gap-[8px] mb-[12px]">
                <span class="bg-[#F59E0B]/15 text-[#B45309] text-[11px] font-extrabold uppercase px-[12px] py-[4px] rounded-full">
                  {{ featuredNews.categoryLabel }}
                </span>
                <span class="text-[12px] text-[#5A6B8C] font-semibold">{{ featuredNews.date }}</span>
              </div>
              <h2 class="text-[20px] sm:text-[24px] font-extrabold text-[#0A2A5C] leading-snug mb-[12px] hover:text-[#1B5FD9] transition-colors">
                {{ featuredNews.title }}
              </h2>
              <p class="text-[#5A6B8C] text-[14.5px] sm:text-[15.5px] leading-relaxed mb-[18px]">
                {{ featuredNews.desc }}
              </p>
              <div class="flex items-center justify-between pt-[14px] border-t border-[#E3EAF7] text-[13px] font-bold text-[#1B5FD9]">
                <span>Oleh: {{ featuredNews.author }}</span>
                <span class="inline-flex items-center gap-[4px] hover:translate-x-1 transition-transform">
                  Baca selengkapnya →
                </span>
              </div>
            </div>
          </div>

          <!-- Grid Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px] mb-[64px]">
            <article 
              v-for="item in filteredNews" 
              :key="item.id"
              class="bg-white border border-[#E3EAF7] rounded-[20px] overflow-hidden shadow-[0_10px_28px_rgba(10,42,92,.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(10,42,92,.12)] transition-all flex flex-col cursor-pointer"
              @click="selectedItem = item"
            >
              <div class="bg-[#E8F0FE] h-[160px] flex items-center justify-center p-6 border-b border-[#E3EAF7]">
                <svg v-if="item.category === 'artikel'" class="w-12 h-12 text-[#1B5FD9]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14z"/>
                  <path d="M12 6.5v14"/>
                </svg>
                <svg v-else-if="item.category === 'berita'" class="w-12 h-12 text-[#1B5FD9]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="5" y="3.5" width="14" height="17" rx="1.5"/>
                  <path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2M10 20.5v-2.8h4v2.8"/>
                </svg>
                <svg v-else class="w-12 h-12 text-[#1B5FD9]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/>
                  <path d="M3.5 10h17M8 3v4M16 3v4"/>
                </svg>
              </div>

              <div class="p-[24px] flex-1 flex flex-col">
                <div class="flex items-center justify-between gap-[8px] mb-[10px]">
                  <span 
                    :class="[
                      'text-[11px] font-extrabold uppercase px-[10px] py-[3px] rounded-full',
                      item.category === 'artikel' ? 'bg-[#EEF2FF] text-[#4338CA]' : '',
                      item.category === 'berita' ? 'bg-[#E0F2FE] text-[#0369A1]' : '',
                      item.category === 'pengumuman' ? 'bg-[#FEF3C7] text-[#B45309]' : ''
                    ]"
                  >
                    {{ item.categoryLabel }}
                  </span>
                  <span class="text-[12px] font-medium text-[#5A6B8C]">{{ item.date }}</span>
                </div>

                <h3 class="text-[16.5px] font-extrabold text-[#0A2A5C] leading-snug mb-[10px] hover:text-[#1B5FD9] transition-colors">
                  {{ item.title }}
                </h3>

                <p class="text-[#5A6B8C] text-[13.5px] leading-relaxed mb-[16px] flex-1">
                  {{ item.desc }}
                </p>

                <div class="pt-[12px] border-t border-[#E3EAF7] flex items-center justify-between text-[13px] font-bold text-[#1B5FD9]">
                  <span>Baca rincian</span>
                  <span class="text-[15px]">→</span>
                </div>
              </div>
            </article>
          </div>

          <!-- Bottom CTA -->
          <SmkCtaCard />
        </div>
      </section>

      <!-- Popup Detail Modal -->
      <div 
        v-if="selectedItem" 
        class="fixed inset-0 z-50 bg-[#061A3E]/70 backdrop-blur-xs flex items-center justify-center p-4"
        @click.self="selectedItem = null"
      >
        <div class="bg-white rounded-[24px] max-w-[620px] w-full p-[28px_24px] sm:p-[36px_32px] shadow-[0_24px_60px_rgba(10,42,92,.25)] relative border border-[#E3EAF7] max-h-[90vh] overflow-y-auto">
          <button 
            type="button" 
            class="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5F8FF] hover:bg-[#E8F0FE] text-[#5A6B8C] hover:text-[#0A2A5C] flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
            @click="selectedItem = null"
          >
            ✕
          </button>

          <div class="flex items-center gap-[8px] mb-[12px]">
            <span class="bg-[#E8F0FE] text-[#1B5FD9] text-[11px] font-extrabold uppercase px-[10px] py-[3px] rounded-full">
              {{ selectedItem.categoryLabel }}
            </span>
            <span class="text-[12.5px] text-[#5A6B8C] font-semibold">{{ selectedItem.date }}</span>
          </div>

          <h3 class="text-[20px] sm:text-[24px] font-extrabold text-[#0A2A5C] leading-snug mb-[16px]">
            {{ selectedItem.title }}
          </h3>

          <div class="text-[#0F1E38] text-[15px] leading-relaxed space-y-4 mb-[24px]">
            <p>{{ selectedItem.desc }}</p>
            <p class="text-[13.5px] text-[#5A6B8C] bg-[#F5F8FF] p-4 rounded-[14px] border border-[#E3EAF7]">
              <i>Konten lengkap artikel dan dokumentasi kegiatan resmi akan dipublikasikan secara berkala melalui portal berita SMK IT Attaqwa 9.</i>
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#E3EAF7]">
            <button 
              type="button" 
              class="font-bold text-[14px] py-[10px] px-[20px] rounded-[12px] bg-[#0A2A5C] text-white hover:bg-[#1B5FD9] transition-colors cursor-pointer"
              @click="selectedItem = null"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </main>

    <SmkFooter />
  </div>
</template>
