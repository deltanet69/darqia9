<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased flex flex-col">
    <SmkHeader />

    <main class="flex-1 pt-[72px] lg:pt-[116px]">
      <!-- ======= PAGE HERO ======= -->
      <section class="bg-gradient-to-br from-[#0C2C61] via-[#0A2A5C] to-[#061A3E] text-white py-[54px] lg:py-[72px] relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        <div class="w-[min(1180px,100%-40px)] mx-auto relative z-10">
          <div class="flex items-center gap-2 text-[12.5px] font-semibold text-[#8FA6CC] mb-3">
            <NuxtLink to="/smk" class="hover:text-white transition-colors">Home</NuxtLink>
            <span>/</span>
            <span class="text-[#FCD34D]">Ekstrakurikuler</span>
          </div>
          <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-tight text-white mb-2">
            Ekstrakurikuler (13 Pilihan)
          </h1>
          <p class="text-[#B9CBE8] text-[15px] sm:text-[16.5px] max-w-[660px]">
            Wadah pengembangan bakat, kepemimpinan, seni, olahraga, dan karakter Islami siswa SMK IT Attaqwa 9.
          </p>
        </div>
      </section>

      <!-- ======= 1. FILTER & GRID EKSKUL ======= -->
      <section class="py-[72px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <!-- Filter Category Chips -->
          <div class="flex flex-wrap gap-2.5 mb-[36px] justify-center sm:justify-start">
            <button 
              v-for="cat in categories" 
              :key="cat.id"
              @click="activeCategory = cat.id"
              :class="[
                'py-2 px-5 rounded-full font-bold text-[13.5px] transition-all cursor-pointer border',
                activeCategory === cat.id
                  ? 'bg-[#0A2A5C] border-[#0A2A5C] text-white shadow-sm'
                  : 'bg-white border-[#E3EAF7] text-[#5A6B8C] hover:border-[#1B5FD9] hover:text-[#1B5FD9]'
              ]"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Grid Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="item in filteredEkskul" 
              :key="item.name"
              class="bg-white border border-[#E3EAF7] rounded-[20px] p-7 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-[#B9D2F8] transition-all flex flex-col"
            >
              <div class="flex items-center justify-between mb-4">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-[#1B5FD9] bg-[#E8F0FE] py-1 px-3 rounded-full">
                  {{ item.categoryLabel }}
                </span>
                <div class="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
                  <component :is="item.icon" class="w-5 h-5" />
                </div>
              </div>
              
              <h3 class="text-[20px] font-extrabold text-[#0A2A5C] mb-2">{{ item.name }}</h3>
              <p class="text-[14px] text-[#5A6B8C] leading-[1.6] flex-1">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 2. CARA BERGABUNG & JADWAL ======= -->
      <section class="py-[72px] bg-white border-y border-[#E3EAF7]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-[#F8FAFC] border border-[#E3EAF7] rounded-[20px] p-8 shadow-xs">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="4.5" width="12" height="16.5" rx="2"/><path d="M9 4.5a3 3 0 016 0M9.5 11.5h5M9.5 15h3.5"/></svg>
              </div>
              <h3 class="text-[18px] font-extrabold text-[#0A2A5C] mb-2">Cara Bergabung</h3>
              <p class="text-[14.5px] text-[#5A6B8C] leading-[1.65]">
                Pendaftaran ekstrakurikuler dibuka setiap awal tahun ajaran baru melalui pembina OSIS dan wali kelas. Siswa diperbolehkan memilih lebih dari satu kegiatan sesuai minat dan manajemen waktu.
              </p>
            </div>

            <div class="bg-[#F8FAFC] border border-[#E3EAF7] rounded-[20px] p-8 shadow-xs">
              <div class="w-12 h-12 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mb-4">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.3"/><path d="M12 7.5V12l3.3 2"/></svg>
              </div>
              <h3 class="text-[18px] font-extrabold text-[#0A2A5C] mb-2">Jadwal Latihan</h3>
              <p class="text-[14.5px] text-[#5A6B8C] leading-[1.65]">
                Latihan rutin dilaksanakan sepulang sekolah dan akhir pekan di fasilitas kampus SMK IT Attaqwa 9 (lapangan, lab, workshop). Jadwal rinci dibagikan saat orientasi kesiswaan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 3. CTA BANNER ======= -->
      <section class="py-[72px] lg:py-[96px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <SmkCtaCard />
        </div>
      </section>
    </main>

    <SmkFooter />
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import SmkHeader from '~/components/smk/SmkHeader.vue'
import SmkFooter from '~/components/smk/SmkFooter.vue'
import SmkCtaCard from '~/components/smk/SmkCtaCard.vue'

definePageMeta({ layout: false })

useHead({
  title: 'Ekstrakurikuler — SMK IT Attaqwa 9',
  meta: [
    { name: 'description', content: '13 Ekstrakurikuler di SMK IT Attaqwa 9: OSIS, Pramuka, Paskibra, PMR, Hadroh, Marawis, Silat, dan Keterampilan Digital.' }
  ]
})

const makeSvg = (pathD) => () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: pathD })
])

const activeCategory = ref('semua')

const categories = [
  { id: 'semua', label: 'Semua (13)' },
  { id: 'kepemimpinan', label: 'Kepemimpinan' },
  { id: 'keagamaan', label: 'Keagamaan' },
  { id: 'seni', label: 'Seni Islami' },
  { id: 'olahraga', label: 'Olahraga' },
  { id: 'keterampilan', label: 'Keterampilan' }
]

const ekskulList = [
  {
    name: 'OSIS',
    category: 'kepemimpinan',
    categoryLabel: 'Kepemimpinan',
    desc: 'Wadah organisasi siswa - belajar kepemimpinan, tata kelola kepanitiaan event, dan menyalurkan aspirasi santri/siswa.',
    icon: makeSvg('M12 12m-8.3 0a8.3 8.3 0 1016.6 0 8.3 8.3 0 10-16.6 0M15.8 8.2l-2.1 5-5 2.1 2.1-5 5-2.1z')
  },
  {
    name: 'Pramuka',
    category: 'kepemimpinan',
    categoryLabel: 'Kepemimpinan',
    desc: 'Pembentukan karakter mandiri, survival skill, disiplin tinggi, dan kecintaan pada alam terbuka.',
    icon: makeSvg('M5.5 21.5v-17M5.5 5H18l-2.8 3.8L18 12.5H5.5')
  },
  {
    name: 'Paskibra',
    category: 'kepemimpinan',
    categoryLabel: 'Kepemimpinan',
    desc: 'Pasukan pengibar bendera - melatih kedisiplinan baris-berbaris, kekompakan tim, dan jiwa nasionalisme.',
    icon: makeSvg('M5.5 21.5v-17M5.5 5H18l-2.8 3.8L18 12.5H5.5')
  },
  {
    name: 'PMR',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan',
    desc: 'Palang Merah Remaja - keterampilan medis pertolongan pertama pada kecelakaan (P3K) dan kepedulian sosial kemanusiaan.',
    icon: makeSvg('M12 12m-8.3 0a8.3 8.3 0 1016.6 0 8.3 8.3 0 10-16.6 0M12 8.5v7M8.5 12h7')
  },
  {
    name: 'Muhadhoroh',
    category: 'keagamaan',
    categoryLabel: 'Keagamaan',
    desc: 'Latihan pidato, retorika dakwah 3 bahasa (Indonesia, Arab, Inggris), dan ceramah keagamaan di depan umum.',
    icon: makeSvg('M9 3h6v11H9zM5.5 11.5a6.5 6.5 0 0013 0M12 18v3')
  },
  {
    name: 'Marawis',
    category: 'seni',
    categoryLabel: 'Seni Islami',
    desc: 'Seni musik perkusi rebana Islami - kekompakan ritme tabuhan dan lantunan syair pujian sholawat Nabi.',
    icon: makeSvg('M9.5 17.5V6l10-2v11.5M7 17.5m-2.5 0a2.5 2.5 0 105 0 2.5 2.5 0 10-5 0M17 15.5m-2.5 0a2.5 2.5 0 105 0 2.5 2.5 0 10-5 0')
  },
  {
    name: 'Hadroh',
    category: 'seni',
    categoryLabel: 'Seni Islami',
    desc: 'Seni musik hadroh dengan vokal merdu dan tabuhan terbang khas tradisi pesantren nusantara.',
    icon: makeSvg('M9.5 17.5V6l10-2v11.5M7 17.5m-2.5 0a2.5 2.5 0 105 0 2.5 2.5 0 10-5 0M17 15.5m-2.5 0a2.5 2.5 0 105 0 2.5 2.5 0 10-5 0')
  },
  {
    name: 'Seni Islami & Kaligrafi',
    category: 'seni',
    categoryLabel: 'Seni Islami',
    desc: 'Khat kaligrafi Arab, nasyid, dan karya seni rupa dalam bingkai estetika nilai-nilai keislaman.',
    icon: makeSvg('M4 20l1.2-4.2L16.7 4.3a2 2 0 012.8 0l.2.2a2 2 0 010 2.8L8.2 18.8 4 20zM14.8 6.2l3 3')
  },
  {
    name: 'Pencak Silat',
    category: 'olahraga',
    categoryLabel: 'Olahraga',
    desc: 'Bela diri warisan budaya leluhur - melatih ketahanan fisik, ketangkasan mental, dan sportivitas ksatria.',
    icon: makeSvg('M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z')
  },
  {
    name: 'Paduan Suara',
    category: 'seni',
    categoryLabel: 'Seni',
    desc: 'Olah vokal, pembagian nada, dan harmoni paduan suara untuk upacara resmi serta ajang kompetisi.',
    icon: makeSvg('M9 3h6v11H9zM5.5 11.5a6.5 6.5 0 0013 0M12 18v3')
  },
  {
    name: 'Unggul Office',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan',
    desc: 'Penguasaan aplikasi otomasi perkantoran digital, pengolahan spreadsheet data tingkat mahir, dan presentasi bisnis.',
    icon: makeSvg('M3 8h18v12H3zM9 8V6.5A2.5 2.5 0 0111.5 4h1A2.5 2.5 0 0115 6.5V8M3 13.5h18')
  },
  {
    name: 'Unggul Bahasa',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan',
    desc: 'English Club & Arabic Conversation untuk membekali keterampilan komunikasi global di dunia industri.',
    icon: makeSvg('M20 12a8 8 0 10-14.7 4.4L4 20l3.7-1.2A8 8 0 0020 12zM8.5 12h.01M12 12h.01M15.5 12h.01')
  },
  {
    name: 'Rumah Bengkel Produksi',
    category: 'keterampilan',
    categoryLabel: 'Keterampilan',
    desc: 'Bengkel praktik berbasis unit produksi - mengerjakan order perbaikan dan perakitan riil layaknya dunia industri.',
    icon: makeSvg('M20.6 6.6a5 5 0 01-6.9 6.9L7 20.2a2.2 2.2 0 01-3.1-3.1l6.7-6.7A5 5 0 0117.5 3.4l-2.8 2.8 2.6 2.6 3.3-2.2z')
  }
]

const filteredEkskul = computed(() => {
  if (activeCategory.value === 'semua') return ekskulList
  return ekskulList.filter(item => item.category === activeCategory.value)
})
</script>
