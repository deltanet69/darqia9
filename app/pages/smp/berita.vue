<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smp' })

interface Article {
  id: number
  slug: string
  title: string
  category: 'berita' | 'artikel' | 'pengumuman'
  categoryLabel: string
  badgeBg: string
  badgeText: string
  date: string
  isoDate: string
  author: string
  authorRole: string
  readTime: string
  views: number
  featured: boolean
  tags: string[]
  summary: string
  content: string[]
  quote?: {
    text: string
    author: string
  }
}

const articlesData: Article[] = [
  {
    id: 1,
    slug: 'spmb-2027-2028-smp-it-bca-dibuka',
    title: 'SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran',
    category: 'pengumuman',
    categoryLabel: 'Pengumuman Resmi',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#92400E]',
    date: '4 Oktober 2026',
    isoDate: '2026-10-04',
    author: 'Panitia SPMB',
    authorRole: 'Sekretariat SPMB BCA',
    readTime: '3 mnt baca',
    views: 1280,
    featured: true,
    tags: ['SPMB', 'Pendaftaran', 'Kelas Gender', 'Beasiswa'],
    summary: 'Penerimaan murid baru tahun ajaran 2027/2028 resmi dibuka dengan tiga gelombang dan biaya registrasi hanya Rp50.000. Kuota terbatas hanya tujuh rombel — ditambah pendaftaran inden untuk 2028/2029.',
    quote: {
      text: 'Kami menjaga rasio ideal pembelajaran kelas gender agar setiap santri putra dan putri mendapatkan pendampingan murobbi yang maksimal.',
      author: 'Ketua Panitia SPMB SMP IT BCA'
    },
    content: [
      'SMP IT Bina Cendekia Assalam (BCA) Babelan secara resmi membuka Seleksi Penerimaan Murid Baru (SPMB) Tahun Ajaran 2027/2028. Mengusung tagline "Alqur\'an & Akhlaknya Terpuji, Prestasi Akademiknya Teruji", proses seleksi tahun ini siap menyaring calon santri yang ingin mendalami kurikulum nasional Diknas yang dipadukan dengan pembiasaan karakter Islami.',
      'Sesuai keputusan yayasan, kuota penerimaan tahun ini dibatasi 7 rombongan belajar (rombel) yang terbagi ke dalam kelas khusus putra dan kelas khusus putri. Pendaftaran dibuka dalam 3 gelombang bertahap dengan biaya registrasi hanya Rp50.000 (gratis bagi siswa yatim dan berprestasi).',
      'Orang tua dan calon siswa dapat mendaftar secara online melalui portal SPMB atau datang langsung ke sekretariat di Ujung Harapan, Musholla Assalam, Kelurahan Bahagia, Kecamatan Babelan, Kabupaten Bekasi pada jam kerja.'
    ]
  },
  {
    id: 2,
    slug: 'milad-ke-6-enam-tahun-smp-it-bina-cendekia-assalam',
    title: 'Milad ke-6: Enam Tahun SMP IT Bina Cendekia Assalam Mendidik Generasi',
    category: 'berita',
    categoryLabel: 'Berita Sekolah',
    badgeBg: 'bg-[#D9F2E3]',
    badgeText: 'text-[#0B6B45]',
    date: '16 April 2026',
    isoDate: '2026-04-16',
    author: 'Humas Sekolah',
    authorRole: 'Biro Publikasi & Dokumentasi',
    readTime: '4 mnt baca',
    views: 940,
    featured: false,
    tags: ['Milad BCA', 'Sejarah', 'Generasi Qurani', 'Ulang Tahun'],
    summary: 'Perayaan enam tahun berdirinya sekolah — dari angkatan pertama hingga mendidik lebih dari 1000 santri alumni berprestasi.',
    quote: {
      text: 'Enam tahun adalah tonggak kematangan kurikulum dan pembiasaan adab yang terus kami jaga.',
      author: 'Kepala SMP IT BCA'
    },
    content: [
      'SMP IT Bina Cendekia Assalam memperingati milad ke-6 sejak didirikan pada 16 April 2021 di bawah naungan مؤسسة دار القهار. Acara syukuran ini dihadiri oleh jajaran pembina yayasan, dewan guru, komite orang tua, serta para alumni.',
      'Dalam kurun waktu enam tahun, SMP IT BCA telah menorehkan berbagai capaian membanggakan, mulai dari akreditasi unggul, implementasi penuh 7 program unggulan, hingga melahirkan santri-santri penghafal Al-Qur\'an yang berprestasi di tingkat kabupaten dan provinsi.',
      'Pada momen milad ini, sekolah juga meluncurkan program Beasiswa Milad BCA ke-6 berupa pembebasan uang pangkal dan subsidi SPP bagi santri berprestasi dan yatim piatu.'
    ]
  },
  {
    id: 3,
    slug: 'mengenal-sekolah-berbasis-kelas-gender',
    title: 'Mengenal Sekolah Berbasis Kelas Gender: Mengapa Lebih Fokus?',
    category: 'artikel',
    categoryLabel: 'Artikel Edukasi',
    badgeBg: 'bg-[#E0E7FF]',
    badgeText: 'text-[#4338CA]',
    date: '28 September 2026',
    isoDate: '2026-09-28',
    author: 'Tim Akademik',
    authorRole: 'Divisi Kurikulum CTL',
    readTime: '4 mnt baca',
    views: 860,
    featured: false,
    tags: ['Kelas Gender', 'Metode CTL', 'Pendidikan Remaja', 'Fitrah'],
    summary: 'Putra belajar dengan putra, putri dengan putri — bagaimana konsep kelas gender membuat proses KBM lebih optimal dan pergaulan terjaga.',
    quote: {
      text: 'Kelas gender bukan membatasi, melainkan memberikan ruang tumbuh yang paling aman dan sesuai fitrah psikologis remaja.',
      author: 'Konsultan Psikologi Pendidikan'
    },
    content: [
      'Pemisahan kelas putra dan putri di SMP IT Bina Cendekia Assalam didasarkan pada pemahaman mendalam atas perbedaan psikologi perkembangan remaja. Di usia SMP (12–15 tahun), anak mengalami transisi pubertas yang membutuhkan lingkungan kondusif tanpa tekanan sosial antar-lawan jenis.',
      'Dengan metode Contextual Teaching and Learning (CTL), guru dapat menyesuaikan gaya mengajar: kelas putra diberikan stimulasi tantangan gerak dan diskusi aktif, sementara kelas putri difokuskan pada kedalaman analisis dan kerja sama suportif.',
      'Hasilnya, santri lebih percaya diri bertanya, berani mengemukakan pendapat, dan tidak merasa canggung saat belajar di dalam kelas.'
    ]
  },
  {
    id: 4,
    slug: 'program-tahfidz-yanbua-target-hafalan-terukur',
    title: "Program Tahfidz Yanbu'a: Target Hafalan Setiap Semester",
    category: 'artikel',
    categoryLabel: 'Artikel Edukasi',
    badgeBg: 'bg-[#E0E7FF]',
    badgeText: 'text-[#4338CA]',
    date: '12 September 2026',
    isoDate: '2026-09-12',
    author: 'Asatidz Tahfidz',
    authorRole: "Koordinator Tahfidz Yanbu'a",
    readTime: '3 mnt baca',
    views: 710,
    featured: false,
    tags: ['Tahfidz', 'Yanbua', 'Simaan', 'Adab Quran'],
    summary: "Metode Yanbu'a membuat setoran hafalan Qur'an menjadi pembiasaan yang ringan, tartil, dan terukur bagi siswa tingkat SMP.",
    content: [
      "Metode Yanbu'a menekankan ketelitian makhraj huruf dan hukum tajwid sebelum santri menambah jumlah hafalan. Di SMP IT BCA, setiap santri memiliki buku mutaba'ah harian untuk mencatat capaian ziyadah dan murojaah.",
      "Program ini didukung oleh tradisi Sima'an Qur'an bulanan, di mana santri membaca hafalan satu juz sekali duduk di hadapan asatidz dan teman sekelas tanpa melihat mushaf.",
      "Dengan metode terstruktur ini, santri mampu mencapai target hafalan Juz 30, Juz 29, dan surat-surat pilihan saat menyelesaikan pendidikan jenjang SMP."
    ]
  },
  {
    id: 5,
    slug: 'entrepreneur-day-melatih-jiwa-wirausaha-sejak-dini',
    title: 'Entrepreneur Day: Melatih Jiwa Wirausaha dan Kreativitas Santri',
    category: 'berita',
    categoryLabel: 'Berita Sekolah',
    badgeBg: 'bg-[#D9F2E3]',
    badgeText: 'text-[#0B6B45]',
    date: '5 September 2026',
    isoDate: '2026-09-05',
    author: 'Kesiswaan',
    authorRole: 'Koordinator Talent Development',
    readTime: '3 mnt baca',
    views: 650,
    featured: false,
    tags: ['Entrepreneur Day', 'Bazar', 'Kewirausahaan', 'Kreativitas'],
    summary: 'Siswa mempraktikkan ilmu kewirausahaan lewat bazar produk kuliner dan kriya mandiri di lingkungan sekolah.',
    content: [
      'Agenda tahunan Entrepreneur Day SMP IT BCA kembali digelar meriah. Seluruh kelompok kelas santri putra dan putri merancang proposal produk, menghitung harga pokok produksi, mendesain kemasan, hingga memasarkan produk olahan kuliner dan karya kerajinan tangan.',
      'Kegiatan ini melatih kecakapan komunikasi bisnis, kejujuran dalam berdagang, pembagian tugas tim, serta pengelolaan laba usaha secara syariah.',
      'Sebagian keuntungan penjualan disalurkan ke kas infaq sosial santri untuk melatih kepedulian berbagi.'
    ]
  },
  {
    id: 6,
    slug: 'public-speaking-with-school-america',
    title: 'Public Speaking with School @america: Santri Percaya Diri Tampil',
    category: 'berita',
    categoryLabel: 'Berita Sekolah',
    badgeBg: 'bg-[#D9F2E3]',
    badgeText: 'text-[#0B6B45]',
    date: '28 Agustus 2026',
    isoDate: '2026-08-28',
    author: 'Tim Bahasa',
    authorRole: 'Koordinator Unggul Bahasa',
    readTime: '3 mnt baca',
    views: 790,
    featured: false,
    tags: ['Public Speaking', 'School @america', 'Bahasa Inggris', 'Prestasi'],
    summary: 'Program unggul bahasa melatih santri tampil fasih dan percaya diri berbahasa Inggris di depan panggung publik.',
    content: [
      'Bekerja sama dengan platform edukasi School @america, santri SMP IT BCA mengikuti lokakarya intensif teknik presentasi dan pidato bahasa Inggris.',
      'Santri dilatih mengatasi demam panggung, menyusun argumen terstruktur, menguasai intonasi suara, serta bahasa tubuh yang meyakinkan.',
      'Sesi ditutup dengan lomba pidato bahasa Inggris antar-kelas dengan dewan juri penutur asli (*native speaker*).'
    ]
  }
]

// Filter, Search, Sort & Pagination State
const searchQuery = ref('')
const activeCategory = ref<string>('semua')
const sortBy = ref<'terbaru' | 'terlama' | 'populer'>('terbaru')
const currentPage = ref(1)
const itemsPerPage = 6

const categories = [
  { id: 'semua', label: 'Semua Artikel' },
  { id: 'berita', label: 'Berita Sekolah' },
  { id: 'artikel', label: 'Artikel Edukasi' },
  { id: 'pengumuman', label: 'Pengumuman' }
]

const getCategoryCount = (catId: string) => {
  if (catId === 'semua') return articlesData.length
  return articlesData.filter(a => a.category === catId).length
}

const filteredArticles = computed(() => {
  let result = [...articlesData]
  if (activeCategory.value !== 'semua') {
    result = result.filter(item => item.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  if (sortBy.value === 'terbaru') {
    result.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime())
  } else if (sortBy.value === 'terlama') {
    result.sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime())
  } else if (sortBy.value === 'populer') {
    result.sort((a, b) => b.views - a.views)
  }
  return result
})

const featuredHeadline = computed(() => {
  if (searchQuery.value.trim()) return null
  if (activeCategory.value === 'semua' || activeCategory.value === 'pengumuman') {
    return articlesData.find(a => a.featured) || articlesData[0]
  }
  return null
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredArticles.value.length / itemsPerPage)))

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredArticles.value.slice(start, start + itemsPerPage)
})

watch([searchQuery, activeCategory, sortBy], () => {
  currentPage.value = 1
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  const el = document.getElementById('daftar-berita-smp')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const clearFilters = () => {
  searchQuery.value = ''
  activeCategory.value = 'semua'
  sortBy.value = 'terbaru'
  currentPage.value = 1
}

// Modal Reader
const selectedArticle = ref<Article | null>(null)
const isModalOpen = ref(false)
const copiedToast = ref(false)

const openArticle = (article: Article) => {
  selectedArticle.value = article
  isModalOpen.value = true
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  if (typeof document !== 'undefined') document.body.style.overflow = ''
  setTimeout(() => { selectedArticle.value = null }, 200)
}

const relatedArticles = computed(() => {
  if (!selectedArticle.value) return []
  return articlesData.filter(a => a.id !== selectedArticle.value?.id).slice(0, 3)
})

const copyArticleLink = () => {
  if (typeof window !== 'undefined' && selectedArticle.value) {
    const url = `${window.location.origin}/smp/berita?id=${selectedArticle.value.id}`
    navigator.clipboard.writeText(url).then(() => {
      copiedToast.value = true
      setTimeout(() => { copiedToast.value = false }, 2500)
    })
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isModalOpen.value) closeModal()
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
    const urlParams = new URLSearchParams(window.location.search)
    const articleId = urlParams.get('id')
    if (articleId) {
      const match = articlesData.find(a => a.id === Number(articleId))
      if (match) openArticle(match)
    }
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})
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
          <b class="text-[#FCD34D]">Berita &amp; Artikel</b>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#7EE2AE] uppercase py-1 px-3.5 rounded-full bg-white/10 backdrop-blur-md mb-3 border border-white/15">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
              Publikasi &amp; Kabar Santri
            </span>
            <h1 class="text-[clamp(32px,4.5vw,48px)] font-black tracking-[-0.02em] leading-tight mb-2.5">
              Berita &amp; <span class="bg-gradient-to-r from-[#7EE2AE] to-[#FCD34D] bg-clip-text text-transparent">Artikel</span>
            </h1>
            <p class="text-[#C4E4D4] max-w-[650px] text-[15.5px] md:text-[16.5px] leading-relaxed">
              Kabar kegiatan sekolah, pembinaan kelas gender, program tahfidz Yanbu'a, dan pengumuman resmi SMP IT BCA.
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0 self-start lg:self-end">
            <div class="bg-white/10 border border-white/15 rounded-2xl py-3 px-5 text-center">
              <span class="block text-[22px] font-black text-white">{{ articlesData.length }}</span>
              <span class="text-[11.5px] font-bold text-[#A9D4BC] uppercase tracking-wider">Artikel</span>
            </div>
            <div class="bg-white/10 border border-white/15 rounded-2xl py-3 px-5 text-center">
              <span class="block text-[22px] font-black text-[#FCD34D]">3</span>
              <span class="text-[11.5px] font-bold text-[#A9D4BC] uppercase tracking-wider">Kategori</span>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. CONTROL BAR (SEARCH, CATEGORY & SORT) -->
    <!-- ================================================================= -->
    <section id="daftar-berita-smp" class="py-6 bg-white border-b border-[#D1E7DD] sticky top-[72px] sm:top-[80px] z-30 shadow-sm">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          <!-- Search Bar -->
          <div class="relative flex-1 max-w-xl">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#55705F]">
              <svg class="w-4 h-4 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Cari berita, pengumuman, atau topik santri..." 
              class="w-full pl-11 pr-10 py-3 rounded-xl bg-[#F2F9F5] border border-[#D1E7DD] focus:border-[#0E7A4E] focus:bg-white focus:ring-4 focus:ring-[#0E7A4E]/10 text-[14.5px] text-[#0E241B] placeholder-[#55705F] transition-all outline-none"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''" 
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#55705F] hover:text-[#063826]"
            >
              <svg class="w-4 h-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Sort Selector -->
          <div class="flex items-center gap-3 shrink-0">
            <span class="text-[13px] font-bold text-[#55705F] hidden sm:inline">Urutkan:</span>
            <div class="relative inline-block w-full sm:w-auto">
              <select 
                v-model="sortBy"
                class="w-full sm:w-auto py-3 pl-4 pr-10 rounded-xl bg-[#F2F9F5] border border-[#D1E7DD] focus:border-[#0E7A4E] text-[13.5px] font-bold text-[#063826] outline-none cursor-pointer appearance-none hover:border-[#0E7A4E] transition-all"
              >
                <option value="terbaru">Terbaru (Default)</option>
                <option value="populer">Paling Banyak Dibaca</option>
                <option value="terlama">Terlama</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#55705F]">
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>

        </div>

        <!-- Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pt-4 pb-1">
          <button 
            v-for="cat in categories"
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="py-2 px-4 rounded-full font-bold text-[13px] whitespace-nowrap transition-all duration-150 flex items-center gap-2 border cursor-pointer shrink-0"
            :class="activeCategory === cat.id 
              ? 'bg-[#063826] text-white border-[#063826] shadow-sm' 
              : 'bg-[#F2F9F5] text-[#55705F] border-[#D1E7DD] hover:border-[#0E7A4E] hover:text-[#0E7A4E]'"
          >
            <span>{{ cat.label }}</span>
            <span 
              class="text-[11px] py-0.5 px-1.5 rounded-full font-extrabold"
              :class="activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#E4F4EC] text-[#0E7A4E]'"
            >
              {{ getCategoryCount(cat.id) }}
            </span>
          </button>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. ARTIKEL GRID & DETAIL READER -->
    <!-- ================================================================= -->
    <section class="py-[60px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">

        <!-- Info Hasil Search -->
        <div v-if="searchQuery || activeCategory !== 'semua'" class="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white border border-[#D1E7DD] py-3 px-5 rounded-xl text-[14px]">
          <div class="text-[#55705F]">
            Menemukan <strong class="text-[#063826]">{{ filteredArticles.length }}</strong> artikel
            <span v-if="searchQuery">untuk kata kunci "<strong class="text-[#0E7A4E]">{{ searchQuery }}</strong>"</span>
          </div>
          <button @click="clearFilters" class="text-[13px] font-bold text-[#0E7A4E] hover:underline">
            Reset Filter
          </button>
        </div>

        <!-- Headline Featured Card -->
        <div 
          v-if="featuredHeadline && !searchQuery"
          @click="openArticle(featuredHeadline)"
          class="rv bg-white border border-[#D1E7DD] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md grid grid-cols-1 lg:grid-cols-12 gap-0 mb-10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
        >
          <div class="lg:col-span-5 min-h-[260px] bg-gradient-to-br from-[#0A4A30] to-[#052E22] p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase py-1 px-3 rounded-full bg-[#FEF3C7] text-[#92400E] self-start shadow-sm">
              <span class="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></span>
              Headline Utama
            </span>
            <div>
              <span class="text-[12px] text-[#A9D4BC] block mb-1 font-semibold">{{ featuredHeadline.date }}</span>
              <strong class="text-[20px] sm:text-[22px] font-black block leading-snug">SMP IT Bina Cendekia Assalam</strong>
            </div>
          </div>
          <div class="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between">
            <div>
              <span class="text-[12.5px] font-bold text-[#0E7A4E] block mb-2">{{ featuredHeadline.categoryLabel }} · {{ featuredHeadline.readTime }}</span>
              <h2 class="text-[22px] sm:text-[26px] font-black text-[#063826] leading-snug mb-3 group-hover:text-[#0E7A4E] transition-colors">
                {{ featuredHeadline.title }}
              </h2>
              <p class="text-[14.5px] text-[#55705F] leading-relaxed mb-5">
                {{ featuredHeadline.summary }}
              </p>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-[#F2F9F5]">
              <span class="text-[14px] font-extrabold text-[#0E7A4E] flex items-center gap-1.5">
                Baca Selengkapnya →
              </span>
              <span class="text-[12px] text-[#55705F]">{{ featuredHeadline.views }} pembaca</span>
            </div>
          </div>
        </div>

        <!-- 3-Column Articles Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div 
            v-for="article in paginatedArticles" 
            :key="article.id"
            @click="openArticle(article)"
            class="rv group bg-white border border-[#D1E7DD] rounded-[22px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <span 
                  class="text-[11px] font-black uppercase tracking-wider py-1 px-3 rounded-full"
                  :class="[article.badgeBg, article.badgeText]"
                >
                  {{ article.categoryLabel }}
                </span>
                <span class="text-[12px] font-semibold text-[#55705F]">{{ article.readTime }}</span>
              </div>
              <span class="text-[12px] text-[#55705F] block mb-2">{{ article.date }} · {{ article.author }}</span>
              <h3 class="text-[17.5px] font-black text-[#063826] leading-snug mb-2.5 group-hover:text-[#0E7A4E] transition-colors line-clamp-2">
                {{ article.title }}
              </h3>
              <p class="text-[14px] text-[#55705F] leading-relaxed mb-4 line-clamp-3">
                {{ article.summary }}
              </p>
            </div>
            <div class="pt-3 border-t border-[#F2F9F5] flex items-center justify-between text-[13px] font-bold text-[#0E7A4E]">
              <span>Baca Artikel →</span>
              <span class="text-[11.5px] text-[#55705F] font-normal">{{ article.views }} pembaca</span>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. MODAL DETAIL BERITA -->
    <!-- ================================================================= -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="isModalOpen && selectedArticle"
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 bg-[#052E22]/80 backdrop-blur-md overflow-y-auto"
          @click.self="closeModal"
        >
          <div class="relative w-full max-w-3xl bg-white rounded-[26px] shadow-2xl border border-[#D1E7DD] overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            <!-- Sticky Header -->
            <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#D1E7DD] flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <span 
                  class="text-[11px] font-black uppercase tracking-wider py-1 px-3 rounded-full"
                  :class="[selectedArticle.badgeBg, selectedArticle.badgeText]"
                >
                  {{ selectedArticle.categoryLabel }}
                </span>
                <span class="text-[12px] text-[#55705F] font-semibold hidden sm:inline">· {{ selectedArticle.readTime }}</span>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  @click="copyArticleLink" 
                  class="p-2 rounded-xl text-[#55705F] hover:text-[#0E7A4E] hover:bg-[#F2F9F5] transition-all text-[12.5px] font-bold flex items-center gap-1.5"
                >
                  Salin Link
                </button>
                <button 
                  @click="closeModal" 
                  class="w-9 h-9 rounded-xl bg-[#F2F9F5] hover:bg-[#E4F4EC] text-[#063826] flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Scrollable Content -->
            <div class="overflow-y-auto px-6 sm:px-10 py-8 space-y-6">
              <div>
                <h2 class="text-[24px] sm:text-[30px] font-black text-[#063826] leading-tight mb-3">
                  {{ selectedArticle.title }}
                </h2>
                <div class="flex items-center gap-3 pb-6 border-b border-[#F2F9F5] text-[13px] text-[#55705F]">
                  <strong class="text-[#0E7A4E]">{{ selectedArticle.author }}</strong>
                  <span>·</span>
                  <span>{{ selectedArticle.date }}</span>
                  <span>·</span>
                  <span>{{ selectedArticle.views }} tayangan</span>
                </div>
              </div>

              <!-- Quote Box -->
              <div v-if="selectedArticle.quote" class="p-5 rounded-2xl bg-[#E4F4EC] border-l-4 border-[#0E7A4E] text-[#063826]">
                <p class="italic text-[15px] mb-1 font-medium">"{{ selectedArticle.quote.text }}"</p>
                <span class="text-[12px] font-bold text-[#0E7A4E]">— {{ selectedArticle.quote.author }}</span>
              </div>

              <!-- Paragraphs -->
              <div class="space-y-4 text-[15.5px] text-[#2C3E35] leading-relaxed">
                <p v-for="(p, idx) in selectedArticle.content" :key="idx" class="leading-[1.8]">
                  {{ p }}
                </p>
              </div>

              <!-- Tags -->
              <div class="pt-6 border-t border-[#F2F9F5] flex flex-wrap gap-2">
                <span v-for="tag in selectedArticle.tags" :key="tag" class="text-[12px] font-bold text-[#0E7A4E] bg-[#E4F4EC] py-1 px-3 rounded-lg">
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-[#F2F9F5] border-t border-[#D1E7DD] px-6 py-4 flex items-center justify-between">
              <span class="text-[12px] text-[#55705F] hidden sm:inline">SMP IT Bina Cendekia Assalam</span>
              <button @click="closeModal" class="py-2.5 px-6 rounded-xl font-black text-[13px] text-white bg-[#063826] hover:bg-[#0E7A4E] transition-all ml-auto">
                Tutup Pembaca
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>
