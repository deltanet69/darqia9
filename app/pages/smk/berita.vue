<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smk' })

// =========================================================================
// DATA BERITA & ARTIKEL RESMI SMK IT ATTAQWA 9
// =========================================================================
interface Article {
  id: number
  slug: string
  title: string
  category: 'berita' | 'artikel' | 'pengumuman' | 'prestasi' | 'karya'
  categoryLabel: string
  badgeBg: string
  badgeText: string
  date: string
  isoDate: string
  author: string
  authorRole: string
  readTime: string
  views: number
  image: string
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
    slug: 'spmb-2027-2028-dibuka-7-rombel',
    title: 'SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran',
    category: 'pengumuman',
    categoryLabel: 'Pengumuman Resmi',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#92400E]',
    date: '4 Oktober 2026',
    isoDate: '2026-10-04',
    author: 'Panitia SPMB',
    authorRole: 'Sekretariat SPMB 2027',
    readTime: '3 mnt baca',
    views: 1420,
    image: '/asset/SMK/news-spmb.jpg',
    featured: true,
    tags: ['SPMB', 'Pendaftaran', 'Gelombang 1', 'Beasiswa Tahfidz'],
    summary: 'Penerimaan murid baru tahun ajaran 2027/2028 resmi dibuka dengan tiga gelombang dan biaya registrasi hanya Rp50.000. Kuota terbatas hanya tujuh rombel — ditambah pendaftaran inden untuk 2028/2029.',
    quote: {
      text: 'Kami berkomitmen menjaga rasio ideal pembelajaran kejuruan dengan membatasi kuota hanya 7 rombel agar setiap santri mendapatkan porsi praktik bengkel dan lab komputer secara maksimal.',
      author: 'Ketua Panitia SPMB 2027/2028'
    },
    content: [
      'SMK IT Attaqwa 9 Babelan secara resmi membuka Penerimaan Murid Baru (SPMB) untuk Tahun Ajaran 2027/2028. Mengusung moto "Unggul dalam IMTAQ, Terdepan dalam IPTEK", proses seleksi tahun ini dirancang untuk menyaring calon santri yang siap berkomitmen mendalami keahlian vokasi industri dan pembinaan akhlak Islami.',
      'Sesuai ketetapan musyawarah yayasan dan manajemen sekolah, kuota penerimaan tahun ini dibatasi tepat 7 rombongan belajar (rombel) yang terbagi ke dalam 6 konsentrasi keahlian: Akuntansi & Keuangan Lembaga (AKL), Otomatisasi & Tata Kelola Perkantoran (OTKP), Teknik & Bisnis Sepeda Motor (TBSM), Teknik Kendaraan Ringan (TKR), Teknik Komputer & Jaringan (TKJ), serta Desain Komunikasi Visual (DKV).',
      'Pendaftaran dibuka dalam 3 gelombang bertahap dengan biaya registrasi terjangkau Rp50.000 (gratis khusus bagi yatim dan santri berprestasi): Gelombang 1 (Oktober – Desember 2026), Gelombang 2 (Januari – Maret 2027), dan Gelombang Tambahan (April – Juni 2027 jika kuota masih tersedia). Calon pendaftar juga dapat memanfaatkan fasilitas pendaftaran inden untuk Tahun Ajaran 2028/2029.',
      'Calon wali murid dan santri dapat melakukan pendaftaran secara mandiri melalui portal SPMB Online di website ini atau hadir langsung ke sekretariat SPMB di Kampus SMK IT Attaqwa 9, Pondok Pesantren Attaqwa Putri/Putra Kavling Ujung Harapan, Bahagia, Babelan, Kabupaten Bekasi pada hari kerja.'
    ]
  },
  {
    id: 2,
    slug: 'mengenal-deep-learning-kurikulum-merdeka',
    title: 'Mengenal Deep Learning: Cara Baru Belajar di Kurikulum Merdeka',
    category: 'artikel',
    categoryLabel: 'Artikel Edukasi',
    badgeBg: 'bg-[#EEF2FF]',
    badgeText: 'text-[#4338CA]',
    date: '28 September 2026',
    isoDate: '2026-09-28',
    author: 'Tim Kurikulum',
    authorRole: 'Pengembang Kurikulum Vokasi',
    readTime: '4 mnt baca',
    views: 890,
    image: '/asset/SMK/news-deeplearning.jpg',
    featured: false,
    tags: ['Kurikulum Merdeka', 'Deep Learning', 'Metode Belajar', 'Vokasi'],
    summary: 'Bukan sekadar menghafal — bagaimana pendekatan pembelajaran mendalam mengubah cara siswa memahami pelajaran vokasi dan pemecahan masalah kontekstual.',
    quote: {
      text: 'Pendidikan vokasi yang bermakna bukan diukur dari berapa banyak rumus yang dihafal, melainkan seberapa tanggap siswa memecahkan masalah riil di bengkel kerja.',
      author: 'Wakil Kepala Sekolah Bidang Kurikulum'
    },
    content: [
      'Penerapan Kurikulum Merdeka di SMK IT Attaqwa 9 diperkaya dengan pendekatan Deep Learning (pembelajaran mendalam). Berbeda dari metode ceramah tradisional yang berfokus pada hafalan teori, deep learning menempatkan siswa sebagai subjek aktif yang mengonstruksi pemahamannya melalui tiga pilar utama: Mindful Learning, Meaningful Learning, dan Joyful Learning.',
      'Dalam konteks kejuruan teknik dan manajemen, pendekatan ini diwujudkan melalui pembelajaran berbasis proyek nyata (Project-Based Learning). Sebagai contoh, siswa jurusan TKJ tidak hanya diajarkan konfigurasi routing di atas kertas, melainkan ditantang mendesain dan mengamankan topologi jaringan LAN/WAN berstandar enterprise yang siap tahan terhadap simulasi cyber attack.',
      'Begitu pula di bidang Desain Komunikasi Visual (DKV), santri membedah studi kasus identitas merek UMKM lokal, melakukan riset audiens pengguna, merancang antarmuka UI/UX aplikasi, hingga mempresentasikan purwarupa desain di hadapan dewan guru dan praktisi industri tamu.',
      'Hasil evaluasi internal menunjukkan bahwa santri yang belajar dengan metode pembelajaran mendalam memiliki daya nalar kritis lebih tajam, daya ingat konsep jangka panjang yang lebih kokoh, serta kepercayaan diri tinggi saat menjalani Uji Kompetensi Kejuruan (UKK).'
    ]
  },
  {
    id: 3,
    slug: 'blk-komunitas-jembatan-sekolah-ke-dunia-industri',
    title: 'BLK Komunitas: Jembatan Sekolah Menuju Dunia Industri',
    category: 'berita',
    categoryLabel: 'Berita Kejuruan',
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#1D4ED8]',
    date: '20 September 2026',
    isoDate: '2026-09-20',
    author: 'Humas DUDIKA',
    authorRole: 'Divisi Kemitraan Industri',
    readTime: '3 mnt baca',
    views: 960,
    image: '/asset/SMK/news-blk.jpg',
    featured: false,
    tags: ['BLK Komunitas', 'Kemnaker RI', 'Prakerin', 'Fasilitas Bengkel'],
    summary: 'Gedung Balai Latihan Kerja Komunitas Kemnaker RI di SMK IT Attaqwa 9 menjadi pusat praktik kejuruan berstandar industri nasional.',
    quote: {
      text: 'Fasilitas BLK Komunitas memastikan santri tidak canggung saat terjun ke lingkungan pabrik atau kantor industri modern.',
      author: 'Kepala Bengkel BLK Komunitas'
    },
    content: [
      'Keberadaan gedung Balai Latihan Kerja (BLK) Komunitas bantuan Kementerian Ketenagakerjaan Republik Indonesia (Kemnaker RI) menjadi nilai pembeda strategis bagi SMK IT Attaqwa 9. Berdiri mandiri di area kampus sekolah, fasilitas ini difungsikan sebagai pusat pelatihan dan sertifikasi kompetensi terpadu.',
      'Gedung BLK dilengkapi dengan peralatan uji mesin terkini, toolset otomotif injeksi berstandar APM, engine scanner multifungsi untuk roda dua dan empat, serta laboratorium multimedia komputer spesifikasi tinggi untuk simulasi rendering dan pemrograman jaringan.',
      'Melalui skema link and match dengan Dunia Usaha, Dunia Industri, dan Dunia Kerja (DUDIKA), kurikulum pelatihan di BLK diselaraskan langsung dengan kebutuhan industri manufaktur di kawasan industri Cikarang dan Karawang.',
      'Setiap tahunnya, santri tingkat akhir mengikuti sertifikasi profesi di BLK sebelum diberangkatkan menuju program Praktik Kerja Industri (Prakerin) selama 3 hingga 6 bulan di perusahaan mitra rekanan resmi sekolah.'
    ]
  },
  {
    id: 4,
    slug: 'juara-1-lks-it-network-kabupaten-bekasi',
    title: 'Juara 1 LKS IT Network System Administration Kab. Bekasi',
    category: 'prestasi',
    categoryLabel: 'Prestasi Siswa',
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#166534]',
    date: '15 September 2026',
    isoDate: '2026-09-15',
    author: 'Humas Sekolah',
    authorRole: 'Biro Prestasi & Publikasi',
    readTime: '4 mnt baca',
    views: 1680,
    image: '/asset/SMK/ig-4.jpg',
    featured: false,
    tags: ['LKS SMK', 'TKJ', 'Juara 1', 'Kabupaten Bekasi', 'Prestasi'],
    summary: 'Siswa kompetensi keahlian TKJ SMK IT Attaqwa 9 berhasil membuktikan keunggulan skill di ajang bergengsi Lomba Kompetensi Siswa (LKS) IT Network.',
    quote: {
      text: 'Alhamdulillah, pembinaan intensif di lab jaringan dan kebiasaan berdoa sebelum tanding menjadi kunci kemenangan di ajang LKS ini.',
      author: 'Pembimbing Kontingen LKS SMK IT Attaqwa 9'
    },
    content: [
      'Kabar membanggakan datang dari panggung Lomba Kompetensi Siswa (LKS) SMK Tingkat Kabupaten Bekasi Tahun 2026. Santri perwakilan SMK IT Attaqwa 9 sukses meraih Juara 1 pada bidang lomba IT Network System Administration setelah menyisihkan puluhan peserta dari sekolah negeri dan swasta se-Kabupaten Bekasi.',
      'Pada kompetisi yang berlangsung selama dua hari penuh tersebut, peserta diuji dalam skenario instalasi server enterprise Debian/CentOS, konfigurasi routing BGP/OSPF MikroTik & Cisco, deployment DNS/Web/Mail Server secured dengan SSL, serta pemecahan masalah jaringan dalam batas waktu ketat.',
      'Ketelitian konfigurasi, efisiensi dokumentasi teknis, dan etika kerja profesional santri SMK IT Attaqwa 9 mendapat apresiasi tinggi dari dewan juri yang beranggotakan praktisi industri telekomunikasi dan akademisi perguruan tinggi.',
      'Dengan raihan medali emas ini, kontingen SMK IT Attaqwa 9 berhak melaju mewakili Kabupaten Bekasi menuju gelaran LKS SMK Tingkat Provinsi Jawa Barat yang akan digelar pada awal tahun depan.'
    ]
  },
  {
    id: 5,
    slug: 'program-tahfidz-yanbua-target-hafalan-semester',
    title: "Program Tahfidz Yanbu'a: Target Hafalan Setiap Semester",
    category: 'artikel',
    categoryLabel: 'Artikel Keagamaan',
    badgeBg: 'bg-[#EEF2FF]',
    badgeText: 'text-[#4338CA]',
    date: '12 September 2026',
    isoDate: '2026-09-12',
    author: 'Asatidz Tahfidz',
    authorRole: "Koordinator Tahfidz Yanbu'a",
    readTime: '3 mnt baca',
    views: 740,
    image: '/asset/SMK/ig-3.jpg',
    featured: false,
    tags: ['Tahfidz', 'Yanbua', 'Karakter Santri', 'Simaan Quran'],
    summary: "Metode Yanbu'a membuat setoran hafalan Qur'an menjadi pembiasaan yang terukur, tartil, dan menyenangkan bagi santri sekolah kejuruan.",
    quote: {
      text: "Menjadi ahli teknologi bukan alasan untuk jauh dari Al-Qur'an. Keduanya justru saling melengkapi membentuk generasi tangguh berakhlak mulia.",
      author: "Koordinator Program Keagamaan"
    },
    content: [
      "Di tengah padatnya jadwal praktik kejuruan di bengkel dan lab komputer, SMK IT Attaqwa 9 tetap menempatkan pembinaan Al-Qur'an sebagai ruh utama pendidikan. Program tahfidz di sekolah ini dibimbing menggunakan metode Yanbu'a yang terkenal dengan penekanan pada ketepatan makharijul huruf, tajwid berstandar sanad, dan pembiasaan tartil.",
      "Setiap santri dikelompokkan ke dalam halaqoh kecil beranggotakan 10–12 orang yang didampingi oleh satu ustadz/ustadzah pembimbing. Kegiatan setoran hafalan (ziyadah) dan pengulangan rutin (murojaah) dilaksanakan pada pagi hari sebelum KBM dimulai serta ba'da sholat Ashar berjamaah.",
      "Program ini memiliki target kelulusan hafalan terstruktur setiap semesternya, mulai dari Juz 30, Juz 1, hingga Juz 29 dan surat-surat pilihan seperti Yasin, Al-Waqiah, Al-Mulk, dan Ar-Rahman. Bagi santri yang memiliki hafalan di atas 3 juz, sekolah menyediakan program kelas akselerasi tahfidz khusus.",
      "Kemandirian dan ketahanan mental santri diperkuat melalui tradisi Sima'an Qur'an bulanan, di mana santri melantunkan hafalan di hadapan teman sebaya dan asatidz tanpa melihat mushaf."
    ]
  },
  {
    id: 6,
    slug: 'showcase-portofolio-desain-uiux-animasi-dkv',
    title: 'Showcase Portofolio: Desain UI/UX & Animasi Santri DKV',
    category: 'karya',
    categoryLabel: 'Karya Santri',
    badgeBg: 'bg-[#FCE7F3]',
    badgeText: 'text-[#9D174D]',
    date: '28 Agustus 2026',
    isoDate: '2026-08-28',
    author: 'Jurusan DKV',
    authorRole: 'Kaprog Keahlian DKV',
    readTime: '3 mnt baca',
    views: 1120,
    image: '/asset/SMK/ig-2.jpg',
    featured: false,
    tags: ['DKV', 'UI/UX Design', 'Motion Graphic', 'Portofolio', 'Karya Digital'],
    summary: 'Pameran karya digital santri vokasi siap industri: prototipe aplikasi mobile interaktif, desain branding, dan kreasi visual berstandar agensi.',
    quote: {
      text: 'Karya santri DKV membuktikan bahwa nilai estetika modern dan pesan dakwah positif dapat berpadu menghasilkan produk desain bernilai jual tinggi.',
      author: 'Instruktur Desain Komunikasi Visual'
    },
    content: [
      'Santri Konsentrasi Keahlian Desain Komunikasi Visual (DKV) SMK IT Attaqwa 9 menyelenggarakan pameran karya digital bertajuk "Kreativitas Santri untuk Negeri". Acara tahunan ini memamerkan ratusan karya orisinal mulai dari rancangan antarmuka pengguna (UI/UX Design), identitas visual korporat, video iklan komersial, hingga animasi pendek 2D & 3D.',
      'Salah satu karya yang menyita perhatian adalah prototipe aplikasi mobile sistem donasi masjid digital dan sistem manajemen perpustakaan pesantren karya siswa kelas XI DKV. Prototipe tersebut dirancang lengkap dengan user flow terstruktur, design system berbasis komponen rapi di Figma, serta interaksi mikro yang intuitif.',
      'Di bidang grafis cetak dan digital, santri memamerkan poster edukasi sosial, kemasan produk UMKM, dan layout majalah sekolah. Seluruh karya dinilai secara langsung oleh kurator tamu dari studio kreatif rekanan industri.',
      'Portofolio digital yang terkumpul diunggah ke platform Behance dan Dribbble resmi sekolah untuk mempermudah perusahaan mitra merekrut lulusan DKV saat kelulusan.'
    ]
  },
  {
    id: 7,
    slug: 'jadwal-tes-gelombang-1-spmb-2027-2028',
    title: 'Jadwal Tes Gelombang I SPMB 2027/2028 & Alur Seleksi',
    category: 'pengumuman',
    categoryLabel: 'Pengumuman Resmi',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#92400E]',
    date: '15 Agustus 2026',
    isoDate: '2026-08-15',
    author: 'Panitia SPMB',
    authorRole: 'Biro Seleksi Akademik',
    readTime: '2 mnt baca',
    views: 910,
    image: '/asset/SMK/ig-1.jpg',
    featured: false,
    tags: ['SPMB', 'Jadwal Tes', 'CBT Seleksi', 'Wawancara'],
    summary: 'Tes seleksi gelombang pertama dilaksanakan Ahad, 27 Desember 2026. Pengumuman hasil seleksi 30 Desember 2026.',
    content: [
      'Bagi calon santri dan orang tua yang telah menyelesaikan formulir pendaftaran Gelombang I SPMB Tahun Ajaran 2027/2028, berikut jadwal resmi pelaksanaan tahapan seleksi masuk:',
      '1. Pelaksanaan Tes CBT Mandiri: Ahad, 27 Desember 2026 (Pukul 08.00 – 10.30 WIB di Lab Komputer SMK IT Attaqwa 9). Materi mencakup Tes Potensi Akademik (Matematika Dasar, Bahasa Indonesia, Bahasa Inggris) dan Pemahaman Agama Islam.',
      '2. Tes Baca Al-Qur\'an & Tahfidz: Ahad, 27 Desember 2026 (Pukul 10.45 – 12.00 WIB bersama Asatidz Penguji).',
      '3. Wawancara Komitmen Wali Santri: Dilaksanakan paralel bersama jajaran pimpinan sekolah untuk menyelaraskan visi pendidikan pesantren.',
      '4. Pengumuman Kelulusan Resmi: Rabu, 30 Desember 2026 melalui portal SPMB Online dan pesan WhatsApp panitia.',
      'Peserta wajib membawa kartu pendaftaran, berpakaian muslim/muslimah rapi dan sopan, serta hadir 30 menit sebelum sesi dimulai.'
    ]
  },
  {
    id: 8,
    slug: 'akreditasi-a-komitmen-mutu-vokasi-berkelanjutan',
    title: 'Mempertahankan Akreditasi A: Komitmen Mutu Vokasi Berkelanjutan',
    category: 'berita',
    categoryLabel: 'Berita Kejuruan',
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#1D4ED8]',
    date: '1 Agustus 2026',
    isoDate: '2026-08-01',
    author: 'Biro Penjaminan Mutu',
    authorRole: 'Tim Akreditasi BAN-SM',
    readTime: '4 mnt baca',
    views: 1240,
    image: '/asset/SMK/gedung-smk.jpg',
    featured: false,
    tags: ['Akreditasi A', 'Penjaminan Mutu', 'Fasilitas', 'BAN-SM'],
    summary: 'Hasil evaluasi BAN-SM mengukuhkan SMK IT Attaqwa 9 sebagai sekolah vokasi berpredikat Unggul dengan nilai kepatuhan standar industri tinggi.',
    content: [
      'Badan Akreditasi Nasional Sekolah/Madrasah (BAN-SM) secara resmi menetapkan kembali status Akreditasi A (Unggul) bagi SMK IT Attaqwa 9 dengan skor penilaian mutu 94 poin dari 100.',
      'Pencapaian ini merupakan buah dari pemenuhan delapan standar nasional pendidikan yang ditopang oleh fasilitas praktik bengkel BLK Komunitas, sarana lab komputer ber-AC, rasio guru tersertifikasi kompetensi, serta jejaring kerja sama industri yang aktif.',
      'Tim asesor memberikan apresiasi khusus terhadap keterpaduan nilai keagamaan pesantren dengan penguasaan teknologi mutakhir (IMTAQ & IPTEK) yang tercermin dalam etos kerja santri.',
      'Manajemen sekolah berkomitmen untuk terus meningkatkan investasi fasilitas dan pelatihan guru agar standar mutu lulusan semakin relevan dengan tuntutan revolusi industri.'
    ]
  }
]

// =========================================================================
// STATE: SEARCH, FILTER, SORT & PAGINATION
// =========================================================================
const searchQuery = ref('')
const activeCategory = ref<string>('semua')
const sortBy = ref<'terbaru' | 'terlama' | 'populer'>('terbaru')
const currentPage = ref(1)
const itemsPerPage = 6

// Kategori Tabs
const categories = [
  { id: 'semua', label: 'Semua Artikel' },
  { id: 'berita', label: 'Berita Kejuruan' },
  { id: 'artikel', label: 'Artikel Edukasi' },
  { id: 'pengumuman', label: 'Pengumuman' },
  { id: 'prestasi', label: 'Prestasi Siswa' },
  { id: 'karya', label: 'Karya Santri' }
]

// Hitung jumlah per kategori
const getCategoryCount = (catId: string) => {
  if (catId === 'semua') return articlesData.length
  return articlesData.filter(a => a.category === catId).length
}

// Filter + Search + Sort
const filteredArticles = computed(() => {
  let result = [...articlesData]

  // Filter Kategori
  if (activeCategory.value !== 'semua') {
    result = result.filter(item => item.category === activeCategory.value)
  }

  // Search Filter (Title, summary, author, tags)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  // Sorting
  if (sortBy.value === 'terbaru') {
    result.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime())
  } else if (sortBy.value === 'terlama') {
    result.sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime())
  } else if (sortBy.value === 'populer') {
    result.sort((a, b) => b.views - a.views)
  }

  return result
})

// Artikel Headline (Pertama yang relevan atau featured)
const featuredHeadline = computed(() => {
  if (searchQuery.value.trim()) return null
  if (activeCategory.value === 'semua' || activeCategory.value === 'pengumuman') {
    return articlesData.find(a => a.featured) || articlesData[0]
  }
  return null
})

// Total Pages
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredArticles.value.length / itemsPerPage))
})

// Paginated Items
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredArticles.value.slice(start, start + itemsPerPage)
})

// Watcher untuk reset page saat search/filter berubah
watch([searchQuery, activeCategory, sortBy], () => {
  currentPage.value = 1
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  // Scroll halus ke daftar berita
  const el = document.getElementById('daftar-berita')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  activeCategory.value = 'semua'
  sortBy.value = 'terbaru'
  currentPage.value = 1
}

// =========================================================================
// DETAIL BERITA READER MODAL
// =========================================================================
const selectedArticle = ref<Article | null>(null)
const isModalOpen = ref(false)
const copiedToast = ref(false)

const openArticle = (article: Article) => {
  selectedArticle.value = article
  isModalOpen.value = true
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
}

const closeModal = () => {
  isModalOpen.value = false
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  setTimeout(() => {
    selectedArticle.value = null
  }, 200)
}

// Berita Terkait (Selain artikel aktif, kategori sama atau artikel lain)
const relatedArticles = computed(() => {
  if (!selectedArticle.value) return []
  return articlesData
    .filter(a => a.id !== selectedArticle.value?.id)
    .slice(0, 3)
})

const copyArticleLink = () => {
  if (typeof window !== 'undefined' && selectedArticle.value) {
    const url = `${window.location.origin}/smk/berita?id=${selectedArticle.value.id}`
    navigator.clipboard.writeText(url).then(() => {
      copiedToast.value = true
      setTimeout(() => {
        copiedToast.value = false
      }, 2500)
    })
  }
}

// Keyboard ESC to close modal
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isModalOpen.value) {
    closeModal()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
    
    // Cek query param ?id=
    const urlParams = new URLSearchParams(window.location.search)
    const articleId = urlParams.get('id')
    if (articleId) {
      const match = articlesData.find(a => a.id === Number(articleId))
      if (match) {
        openArticle(match)
      }
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
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white pt-[170px] sm:pt-[180px] md:pt-[190px] lg:pt-[200px] pb-[60px] lg:pb-[70px] bg-gradient-to-br from-[#0C2C61] to-[#061A3E]">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
      
      <!-- Subtle Decorative Glows -->
      <div class="absolute -top-32 right-0 w-[500px] h-[500px] bg-[#1B5FD9]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-[#2B7CD8]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative max-w-[1180px] mx-auto px-5 lg:px-6">
        <!-- Breadcrumb -->
        <div class="text-[12.5px] text-[#8FA6CC] font-semibold mb-3.5 flex items-center gap-1.5">
          <NuxtLink to="/smk" class="hover:text-white transition-colors">Home</NuxtLink>
          <span class="text-[#4C8DFF]">/</span>
          <b class="text-[#FCD34D]">Berita &amp; Artikel</b>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#7DB9F5] uppercase py-1 px-3.5 rounded-full bg-white/10 backdrop-blur-md mb-3 border border-white/15">
              <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
              Pusat Informasi &amp; Kabar Sekolah
            </span>
            <h1 class="text-[clamp(32px,4.5vw,48px)] font-black tracking-[-0.02em] leading-tight mb-2.5">
              Berita &amp; <span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">Artikel</span>
            </h1>
            <p class="text-[#B9CBE8] max-w-[650px] text-[15.5px] md:text-[16.5px] leading-relaxed">
              Kabar terkini seputar kegiatan kejuruan, capaian prestasi santri, gagasan edukasi Kurikulum Merdeka, serta pengumuman resmi SMK IT Attaqwa 9.
            </p>
          </div>

          <!-- Quick Stat Badges -->
          <div class="flex items-center gap-3 self-start lg:self-end">
            <div class="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl py-3 px-5 text-center">
              <span class="block text-[22px] font-black text-white">{{ articlesData.length }}</span>
              <span class="text-[11.5px] font-bold text-[#8FA6CC] uppercase tracking-wider">Artikel Dirilis</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl py-3 px-5 text-center">
              <span class="block text-[22px] font-black text-[#FCD34D]">6</span>
              <span class="text-[11.5px] font-bold text-[#8FA6CC] uppercase tracking-wider">Kategori</span>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. INTERACTIVE CONTROL BAR (SEARCH, CATEGORY PILLS & SORTING) -->
    <!-- ================================================================= -->
    <section id="daftar-berita" class="py-8 bg-white border-b border-[#E3EAF7] sticky top-[72px] sm:top-[80px] z-30 shadow-[0_4px_20px_rgba(10,42,92,0.04)]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          <!-- Search Input Bar -->
          <div class="relative flex-1 max-w-xl">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8FA6CC]">
              <svg class="w-4 h-4 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Cari judul berita, materi, topik, atau kata kunci..." 
              class="w-full pl-11 pr-10 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2ECF8] focus:border-[#1B5FD9] focus:bg-white focus:ring-4 focus:ring-[#1B5FD9]/10 text-[14.5px] text-[#061A3E] placeholder-[#8FA6CC] transition-all outline-none"
            />
            <!-- Clear Search Button -->
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''" 
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8FA6CC] hover:text-[#061A3E] transition-colors"
              title="Hapus pencarian"
            >
              <svg class="w-4 h-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Sort Selector -->
          <div class="flex items-center gap-3 shrink-0">
            <span class="text-[13px] font-bold text-[#5A6B8C] hidden sm:inline">Urutkan:</span>
            <div class="relative inline-block w-full sm:w-auto">
              <select 
                v-model="sortBy"
                class="w-full sm:w-auto py-3 pl-4 pr-10 rounded-xl bg-[#F8FAFC] border border-[#E2ECF8] focus:border-[#1B5FD9] text-[13.5px] font-bold text-[#0A2A5C] outline-none cursor-pointer appearance-none hover:border-[#1B5FD9] transition-all"
              >
                <option value="terbaru">Terbaru (Default)</option>
                <option value="populer">Paling Banyak Dibaca</option>
                <option value="terlama">Terlama</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#5A6B8C]">
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>

        </div>

        <!-- Category Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pt-4 pb-1 no-scrollbar">
          <button 
            v-for="cat in categories"
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="py-2 px-4 rounded-full font-bold text-[13px] whitespace-nowrap transition-all duration-150 flex items-center gap-2 border cursor-pointer shrink-0"
            :class="activeCategory === cat.id 
              ? 'bg-[#0A2A5C] text-white border-[#0A2A5C] shadow-sm shadow-[#0A2A5C]/20' 
              : 'bg-[#F8FAFC] text-[#5A6B8C] border-[#E2ECF8] hover:border-[#1B5FD9] hover:text-[#1B5FD9] hover:bg-white'"
          >
            <span>{{ cat.label }}</span>
            <span 
              class="text-[11px] py-0.5 px-1.5 rounded-full font-extrabold"
              :class="activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#E8F0FE] text-[#1B5FD9]'"
            >
              {{ getCategoryCount(cat.id) }}
            </span>
          </button>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. CONTENT AREA: HEADLINE + GRID + PAGINATION -->
    <!-- ================================================================= -->
    <section class="py-[60px] md:py-[80px] bg-[#F5F8FF]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">

        <!-- Info Hasil Pencarian / Filter Status -->
        <div v-if="searchQuery || activeCategory !== 'semua'" class="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E2ECF8] py-3 px-5 rounded-xl text-[14px]">
          <div class="flex items-center gap-2 text-[#5A6B8C]">
            <span>Menemukan <strong class="text-[#061A3E]">{{ filteredArticles.length }}</strong> artikel</span>
            <span v-if="searchQuery">untuk kata kunci "<strong class="text-[#1B5FD9]">{{ searchQuery }}</strong>"</span>
          </div>
          <button 
            @click="clearFilters" 
            class="text-[13px] font-bold text-[#1B5FD9] hover:underline flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset Filter
          </button>
        </div>

        <!-- 3.A. HEADLINE CARD (Bila tidak sedang mencari kata kunci) -->
        <div 
          v-if="featuredHeadline && !searchQuery"
          @click="openArticle(featuredHeadline)"
          class="rv bg-white border border-[#E2ECF8] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(10,42,92,0.06)] hover:shadow-[0_24px_50px_rgba(10,42,92,0.14)] grid grid-cols-1 lg:grid-cols-12 gap-0 mb-12 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
        >
          <div class="lg:col-span-6 min-h-[280px] lg:min-h-[360px] relative overflow-hidden bg-[#0A2A5C]">
            <img 
              :src="featuredHeadline.image" 
              :alt="featuredHeadline.title" 
              class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/90 via-[#061A3E]/30 to-transparent"></div>
            
            <div class="absolute top-4 left-4 flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase py-1.5 px-3 rounded-full bg-[#FEF3C7] text-[#92400E] shadow-sm backdrop-blur-md">
                <span class="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></span>
                Headline Utama
              </span>
            </div>

            <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/80 text-[12.5px] font-semibold">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ featuredHeadline.readTime }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ featuredHeadline.views.toLocaleString('id-ID') }} dibaca
              </span>
            </div>
          </div>

          <div class="lg:col-span-6 p-7 sm:p-9 md:p-10 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 text-[13px] text-[#8FA6CC] font-semibold mb-3">
                <span class="text-[#1B5FD9] font-bold">{{ featuredHeadline.categoryLabel }}</span>
                <span>·</span>
                <span>{{ featuredHeadline.date }}</span>
                <span>·</span>
                <span>{{ featuredHeadline.author }}</span>
              </div>
              <h2 class="text-[22px] sm:text-[26px] md:text-[28px] font-black text-[#061A3E] leading-snug mb-3.5 group-hover:text-[#1B5FD9] transition-colors">
                {{ featuredHeadline.title }}
              </h2>
              <p class="text-[15px] text-[#5A6B8C] leading-relaxed mb-6">
                {{ featuredHeadline.summary }}
              </p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5 mb-6">
                <span 
                  v-for="tag in featuredHeadline.tags" 
                  :key="tag" 
                  class="text-[11.5px] font-bold text-[#5A6B8C] bg-[#F1F5F9] py-1 px-2.5 rounded-md"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-[#EEF3FA]">
              <div class="flex items-center gap-2 text-[14.5px] font-extrabold text-[#1B5FD9] group-hover:translate-x-1 transition-transform">
                <span>Baca Selengkapnya</span>
                <svg class="w-4 h-4 stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>
              <span class="text-[12.5px] font-bold text-[#8FA6CC]">Klik untuk membaca artikel</span>
            </div>
          </div>
        </div>

        <!-- 3.B. EMPTY STATE (Bila tidak ada artikel sesuai filter/search) -->
        <div 
          v-if="filteredArticles.length === 0" 
          class="bg-white border border-[#E2ECF8] rounded-[24px] p-12 text-center max-w-lg mx-auto shadow-sm my-8"
        >
          <div class="w-16 h-16 rounded-2xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
          <h3 class="text-[20px] font-black text-[#061A3E] mb-2">Artikel Tidak Ditemukan</h3>
          <p class="text-[14.5px] text-[#5A6B8C] leading-relaxed mb-6">
            Tidak ada berita atau artikel yang cocok dengan kata kunci atau filter yang Anda pilih. Silakan coba kata kunci lain.
          </p>
          <button 
            @click="clearFilters"
            class="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-[14px] text-white bg-[#0A2A5C] hover:bg-[#1B5FD9] transition-all shadow-md"
          >
            <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Tampilkan Semua Artikel
          </button>
        </div>

        <!-- 3.C. 3-COLUMN NEWS GRID -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          <div 
            v-for="article in paginatedArticles" 
            :key="article.id"
            @click="openArticle(article)"
            class="rv group bg-white border border-[#E2ECF8] rounded-[22px] overflow-hidden shadow-[0_4px_20px_rgba(10,42,92,0.05)] hover:shadow-[0_20px_40px_rgba(10,42,92,0.12)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <!-- Thumbnail -->
              <div class="relative h-[210px] overflow-hidden bg-[#0A2A5C]">
                <img 
                  :src="article.image" 
                  :alt="article.title" 
                  class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#061A3E]/80 via-transparent to-black/15"></div>
                
                <!-- Category Badge -->
                <span 
                  class="absolute top-3.5 left-3.5 inline-block text-[11px] font-black tracking-wider uppercase py-1.5 px-3 rounded-full shadow-sm backdrop-blur-md"
                  :class="[article.badgeBg, article.badgeText]"
                >
                  {{ article.categoryLabel }}
                </span>

                <!-- Reading time on thumbnail -->
                <span class="absolute bottom-3 right-3 text-[11px] font-bold text-white/90 bg-black/40 backdrop-blur-sm py-1 px-2.5 rounded-md flex items-center gap-1">
                  <svg class="w-3 h-3 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ article.readTime }}
                </span>
              </div>

              <!-- Card Body -->
              <div class="p-6">
                <!-- Metadata -->
                <div class="flex items-center gap-1.5 text-[12px] text-[#8FA6CC] font-semibold mb-2.5">
                  <span>{{ article.date }}</span>
                  <span>·</span>
                  <span class="text-[#1B5FD9] font-bold truncate max-w-[140px]">{{ article.author }}</span>
                </div>

                <!-- Title -->
                <h3 class="text-[17.5px] font-black text-[#061A3E] leading-snug mb-2.5 group-hover:text-[#1B5FD9] transition-colors line-clamp-2">
                  {{ article.title }}
                </h3>

                <!-- Summary -->
                <p class="text-[14px] text-[#5A6B8C] leading-relaxed mb-4 line-clamp-3">
                  {{ article.summary }}
                </p>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="tag in article.tags.slice(0, 2)" 
                    :key="tag" 
                    class="text-[11px] font-semibold text-[#5A6B8C] bg-[#F1F5F9] py-0.5 px-2 rounded"
                  >
                    #{{ tag }}
                  </span>
                  <span v-if="article.tags.length > 2" class="text-[11px] font-semibold text-[#8FA6CC] py-0.5 px-1">
                    +{{ article.tags.length - 2 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Action Footer -->
            <div class="px-6 pb-6 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[13px] font-bold text-[#1B5FD9]">
              <span class="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Baca Selengkapnya
                <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
              <span class="text-[11.5px] text-[#8FA6CC] font-medium flex items-center gap-1">
                <svg class="w-3 h-3 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ article.views }}
              </span>
            </div>
          </div>

        </div>

        <!-- 3.D. SMART PAGINATION -->
        <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#E2ECF8] rounded-[20px] p-4 sm:p-5 shadow-sm">
          <div class="text-[13.5px] text-[#5A6B8C] font-semibold text-center sm:text-left">
            Menampilkan <b class="text-[#061A3E]">{{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredArticles.length) }}</b> dari <b class="text-[#061A3E]">{{ filteredArticles.length }}</b> artikel
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Prev Button -->
            <button 
              @click="goToPage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="p-2.5 rounded-xl border font-bold text-[13px] flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              :class="currentPage === 1 ? 'border-[#E2ECF8] text-[#8FA6CC]' : 'border-[#E2ECF8] text-[#0A2A5C] hover:border-[#1B5FD9] hover:text-[#1B5FD9] bg-[#F8FAFC] hover:bg-white'"
            >
              <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              <span class="hidden sm:inline">Sebelumnya</span>
            </button>

            <!-- Page Numbers -->
            <button 
              v-for="p in totalPages" 
              :key="p"
              @click="goToPage(p)"
              class="w-10 h-10 rounded-xl font-bold text-[13.5px] transition-all cursor-pointer border"
              :class="currentPage === p 
                ? 'bg-[#0A2A5C] text-white border-[#0A2A5C] shadow-sm' 
                : 'bg-[#F8FAFC] text-[#5A6B8C] border-[#E2ECF8] hover:border-[#1B5FD9] hover:text-[#1B5FD9] hover:bg-white'"
            >
              {{ p }}
            </button>

            <!-- Next Button -->
            <button 
              @click="goToPage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="p-2.5 rounded-xl border font-bold text-[13px] flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              :class="currentPage === totalPages ? 'border-[#E2ECF8] text-[#8FA6CC]' : 'border-[#E2ECF8] text-[#0A2A5C] hover:border-[#1B5FD9] hover:text-[#1B5FD9] bg-[#F8FAFC] hover:bg-white'"
            >
              <span class="hidden sm:inline">Selanjutnya</span>
              <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. MODAL DETAIL BERITA (FULL ARTICLE READER) -->
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
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 bg-[#061A3E]/80 backdrop-blur-md overflow-y-auto"
          @click.self="closeModal"
        >
          
          <!-- Modal Card Container -->
          <div 
            class="relative w-full max-w-3xl bg-white rounded-[26px] shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-[#E2ECF8] overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            
            <!-- Sticky Header Modal -->
            <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#E3EAF7] flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <span 
                  class="text-[11px] font-black uppercase tracking-wider py-1 px-3 rounded-full"
                  :class="[selectedArticle.badgeBg, selectedArticle.badgeText]"
                >
                  {{ selectedArticle.categoryLabel }}
                </span>
                <span class="text-[12px] text-[#8FA6CC] font-semibold hidden sm:inline">· {{ selectedArticle.readTime }}</span>
              </div>

              <div class="flex items-center gap-2">
                <!-- Copy Link Button -->
                <button 
                  @click="copyArticleLink" 
                  class="p-2 rounded-xl text-[#5A6B8C] hover:text-[#1B5FD9] hover:bg-[#F1F5F9] transition-all flex items-center gap-1.5 text-[12.5px] font-bold"
                  title="Salin tautan artikel"
                >
                  <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  <span class="hidden md:inline">Salin Link</span>
                </button>

                <!-- Close Modal Button -->
                <button 
                  @click="closeModal" 
                  class="w-9 h-9 rounded-xl bg-[#F1F5F9] hover:bg-[#E2ECF8] text-[#0A2A5C] flex items-center justify-center transition-all cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <svg class="w-5 h-5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <!-- Toast Notification: Link Copied -->
            <div 
              v-if="copiedToast" 
              class="absolute top-16 right-6 z-30 bg-[#0A2A5C] text-white text-[12.5px] font-bold py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-bounce"
            >
              <svg class="w-4 h-4 text-[#4ADE80] stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
              <span>Tautan artikel berhasil disalin!</span>
            </div>

            <!-- Scrollable Article Body -->
            <div class="overflow-y-auto px-6 sm:px-10 py-8 space-y-6">
              
              <!-- Title & Meta -->
              <div>
                <h2 class="text-[clamp(22px,3.2vw,32px)] font-black text-[#061A3E] leading-tight mb-4">
                  {{ selectedArticle.title }}
                </h2>

                <!-- Author Chip -->
                <div class="flex items-center gap-3.5 pb-6 border-b border-[#EEF3FA]">
                  <div class="w-11 h-11 rounded-full bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C] text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
                    <svg class="w-5 h-5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <div class="text-[14.5px] font-extrabold text-[#061A3E]">{{ selectedArticle.author }}</div>
                    <div class="text-[12px] text-[#8FA6CC] font-semibold">{{ selectedArticle.authorRole }} · {{ selectedArticle.date }}</div>
                  </div>
                </div>
              </div>

              <!-- Featured Image Banner -->
              <div class="relative rounded-[20px] overflow-hidden bg-[#0A2A5C] shadow-md">
                <img 
                  :src="selectedArticle.image" 
                  :alt="selectedArticle.title" 
                  class="w-full max-h-[380px] object-cover"
                />
                <div class="bg-[#0A2A5C]/90 text-[#C9D8F2] text-[12px] py-2 px-4 italic flex items-center justify-between">
                  <span>Dokumentasi Resmi SMK IT Attaqwa 9</span>
                  <span>{{ selectedArticle.views.toLocaleString('id-ID') }} tayangan</span>
                </div>
              </div>

              <!-- Quote Box (Optional) -->
              <div 
                v-if="selectedArticle.quote" 
                class="p-5 sm:p-6 rounded-[18px] bg-[#F0F6FE] border-l-4 border-[#1B5FD9] text-[#0A2A5C]"
              >
                <p class="text-[15px] sm:text-[16px] italic font-medium leading-relaxed mb-2">
                  "{{ selectedArticle.quote.text }}"
                </p>
                <span class="text-[12.5px] font-bold text-[#1B5FD9] block">— {{ selectedArticle.quote.author }}</span>
              </div>

              <!-- Article Content Paragraphs -->
              <div class="prose max-w-none text-[#334155] text-[15.5px] sm:text-[16.5px] leading-relaxed space-y-4">
                <p 
                  v-for="(para, idx) in selectedArticle.content" 
                  :key="idx"
                  class="leading-[1.8]"
                >
                  {{ para }}
                </p>
              </div>

              <!-- Tags -->
              <div class="pt-6 border-t border-[#EEF3FA]">
                <span class="text-[12px] font-bold text-[#8FA6CC] block mb-2.5 uppercase tracking-wider">Topik Terkait:</span>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="tag in selectedArticle.tags" 
                    :key="tag" 
                    class="text-[12px] font-bold text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-3.5 rounded-lg hover:bg-[#1B5FD9] hover:text-white transition-colors cursor-pointer"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>

              <!-- Share Buttons -->
              <div class="bg-[#F8FAFC] border border-[#E2ECF8] rounded-[20px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-[13.5px] font-bold text-[#0A2A5C] text-center sm:text-left">
                  Bagikan artikel ini kepada rekan &amp; keluarga:
                </div>
                <div class="flex items-center gap-2">
                  <a 
                    :href="`https://api.whatsapp.com/send?text=${encodeURIComponent(selectedArticle.title + ' - Baca di: ')}`" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="py-2 px-3.5 rounded-xl bg-[#25D366] text-white font-bold text-[12.5px] flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all"
                  >
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.871.815 2.796.815 3.182 0 5.768-2.587 5.769-5.767.001-3.181-2.585-5.766-5.769-5.766zm3.435 8.204c-.144.405-.838.775-1.171.825-.31.046-.713.064-2.12-.518-1.794-.741-2.934-2.56-3.023-2.679-.089-.119-.729-.97-.729-1.85 0-.88.46-1.314.624-1.493.164-.179.358-.224.478-.224.12 0 .239.001.344.006.11.005.258-.042.404.309.15.358.513 1.25.558 1.34.045.09.075.195.015.314-.06.12-.09.195-.179.3-.09.104-.188.232-.269.313-.09.09-.184.188-.079.368.105.18.467.771 1.002 1.248.689.614 1.27.804 1.45.894.18.09.284.075.389-.045.105-.12.449-.523.569-.703.12-.179.239-.149.398-.09.16.06 1.017.48 1.192.568.175.09.292.135.337.21.045.075.045.435-.099.84z"/></svg>
                    WhatsApp
                  </a>
                  <button 
                    @click="copyArticleLink" 
                    class="py-2 px-3.5 rounded-xl bg-white border border-[#E2ECF8] text-[#0A2A5C] font-bold text-[12.5px] hover:border-[#1B5FD9] hover:text-[#1B5FD9] transition-all flex items-center gap-1.5"
                  >
                    <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    Salin URL
                  </button>
                </div>
              </div>

              <!-- Berita Terkait -->
              <div class="pt-6 border-t border-[#EEF3FA]">
                <h4 class="text-[17px] font-black text-[#061A3E] mb-4">Artikel Terkait Lainnya</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div 
                    v-for="rel in relatedArticles" 
                    :key="rel.id"
                    @click="openArticle(rel)"
                    class="p-4 rounded-[16px] bg-[#F8FAFC] hover:bg-white border border-[#E2ECF8] hover:border-[#1B5FD9] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <span class="text-[11px] font-bold text-[#1B5FD9] block mb-1.5">{{ rel.categoryLabel }}</span>
                    <h5 class="text-[13.5px] font-extrabold text-[#061A3E] group-hover:text-[#1B5FD9] transition-colors line-clamp-2 mb-1.5">
                      {{ rel.title }}
                    </h5>
                    <span class="text-[11px] text-[#8FA6CC] font-semibold">{{ rel.date }}</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Modal Footer Action -->
            <div class="bg-[#F8FAFC] border-t border-[#E3EAF7] px-6 py-4 flex items-center justify-between">
              <span class="text-[12.5px] text-[#8FA6CC] font-medium hidden sm:inline">Tekan Esc atau klik luar untuk keluar</span>
              <button 
                @click="closeModal" 
                class="py-2.5 px-6 rounded-xl font-extrabold text-[13.5px] text-white bg-[#0A2A5C] hover:bg-[#1B5FD9] transition-all ml-auto"
              >
                Tutup Pembaca
              </button>
            </div>

          </div>

        </div>
      </Transition>
    </Teleport>

    <!-- ================================================================= -->
    <!-- 5. SECTION CTA PENDAFTARAN MURID BARU (Grounded Hero Student Cutout) -->
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
              SPMB 2027/2028 telah dibuka dengan biaya registrasi hanya <b class="text-white">Rp50.000</b>. Dapatkan kesempatan beasiswa tahfidz dan prestasi akademik/non-akademik.
            </p>

            <!-- Tombol Aksi -->
            <div class="flex flex-wrap items-center gap-4 mb-8">
              <NuxtLink 
                to="/smk/spmb" 
                class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all duration-150"
              >
                Daftar SPMB 2027/2028
                <svg class="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </NuxtLink>

              <NuxtLink 
                to="/smk/kontak" 
                class="text-[#C9D8F2] hover:text-white font-bold text-[14.5px] underline underline-offset-4 transition-colors"
              >
                atau hubungi panitia
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

<style scoped>
/* Hide scrollbar for category pills on mobile */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
