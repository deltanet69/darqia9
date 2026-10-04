<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased flex flex-col">
    <SmkHeader />

    <main class="flex-1 pt-[72px] lg:pt-[116px]">
      <!-- ======= 1. HERO HOME ======= -->
      <section class="relative overflow-hidden bg-gradient-to-br from-[#0C2C61] via-[#0A2A5C] to-[#061A3E] text-white py-[64px] lg:py-[96px]">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:26px_26px] pointer-events-none"></div>
        <div class="absolute -top-[120px] -right-[100px] w-[500px] h-[500px] rounded-full bg-[#1B5FD9]/30 blur-[100px] pointer-events-none"></div>

        <div class="w-[min(1180px,100%-40px)] mx-auto relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[44px] items-center">
            <!-- Left Text Column -->
            <div>
              <div class="inline-flex items-center gap-[8px] bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#FCD34D] text-[12.5px] font-bold py-[7px] px-[16px] rounded-full mb-[20px]">
                <span class="w-[7px] h-[7px] rounded-full bg-[#F59E0B] animate-pulse"></span>
                <span>SPMB 2027/2028 Telah Dibuka • 7 Rombel</span>
              </div>

              <h1 class="text-[clamp(32px,4.8vw,56px)] font-black tracking-tight leading-[1.15] mb-[18px]">
                Unggul dalam <span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">IMTAQ</span>,<br>
                Terdepan dalam <span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">IPTEK</span>
              </h1>

              <p class="text-[#C9D8F2] text-[16px] sm:text-[17.5px] leading-[1.65] max-w-[580px] mb-[12px]">
                SMK IT Attaqwa 9 - SMK rasa pesantren yang membentuk generasi vokasi Qur'ani: benar, pintar, dan terampil.
              </p>

              <p class="text-[#FDE68A] font-bold text-[14.5px] italic mb-[30px]">
                "Membentuk Generasi Vokasi Qur'ani yang Benar, Pintar, dan Terampil."
              </p>

              <!-- CTAs -->
              <div class="flex flex-wrap gap-[14px] mb-[48px]">
                <NuxtLink 
                  to="/spmb/smk" 
                  class="inline-flex items-center gap-[8px] font-extrabold text-[15px] py-[13px] px-[26px] rounded-[14px] text-[#3D2C00] bg-gradient-to-r from-[#F0B429] to-[#F59E0B] shadow-[0_10px_24px_rgba(240,180,41,.35)] hover:-translate-y-0.5 transition-all"
                >
                  <span>Daftar SPMB 2027/2028</span>
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </NuxtLink>
                <NuxtLink 
                  to="/smk/tentang" 
                  class="inline-flex items-center gap-[8px] font-bold text-[15px] py-[13px] px-[24px] rounded-[14px] text-white bg-white/10 border border-white/30 hover:bg-white/20 transition-all"
                >
                  <span>Jelajahi Sekolah</span>
                </NuxtLink>
              </div>

              <!-- 4 Stats Cards -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-[12px]">
                <div class="bg-white/8 border border-white/14 rounded-[16px] p-[16px_18px] backdrop-blur-xs">
                  <b class="block text-[28px] font-black text-white leading-none mb-1">316<small class="text-[#FCD34D] text-[18px]">+</small></b>
                  <span class="text-[12px] font-semibold text-[#A9BDDD]">Siswa Aktif</span>
                </div>
                <div class="bg-white/8 border border-white/14 rounded-[16px] p-[16px_18px] backdrop-blur-xs">
                  <b class="block text-[28px] font-black text-white leading-none mb-1">6</b>
                  <span class="text-[12px] font-semibold text-[#A9BDDD]">Konsentrasi</span>
                </div>
                <div class="bg-white/8 border border-white/14 rounded-[16px] p-[16px_18px] backdrop-blur-xs">
                  <b class="block text-[28px] font-black text-white leading-none mb-1">13</b>
                  <span class="text-[12px] font-semibold text-[#A9BDDD]">Ekstrakurikuler</span>
                </div>
                <div class="bg-white/8 border border-white/14 rounded-[16px] p-[16px_18px] backdrop-blur-xs">
                  <b class="block text-[28px] font-black text-white leading-none mb-1 text-[#4ADE80]">A</b>
                  <span class="text-[12px] font-semibold text-[#A9BDDD]">Akreditasi BAN-SM</span>
                </div>
              </div>
            </div>

            <!-- Right Visual Frame -->
            <div class="relative max-w-[480px] mx-auto lg:max-w-none w-full">
              <div class="border-2 border-dashed border-white/40 rounded-[24px] bg-gradient-to-br from-white/10 to-white/5 p-[36px_24px] min-h-[360px] flex flex-col items-center justify-center text-center gap-3">
                <svg class="w-12 h-12 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/>
                  <circle cx="12" cy="13.5" r="3.4"/>
                  <path d="M8.5 7.5L10 5h4l1.5 2.5"/>
                </svg>
                <b class="text-[12.5px] font-extrabold tracking-widest uppercase text-white">FOTO : SISWA SMK IT ATTAQWA 9</b>
                <small class="text-[12px] text-[#C9D8F2]">Ganti dengan foto siswa asli</small>
              </div>

              <!-- Floating Chips -->
              <div class="absolute top-[20px] -left-[16px] bg-white text-[#0A2A5C] rounded-[14px] shadow-[0_16px_36px_rgba(3,15,40,.35)] p-[10px_16px] flex items-center gap-2 font-extrabold text-[13px] animate-bounce">
                <svg class="w-5 h-5 text-[#1B5FD9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5z"/><path d="M9 11.8l2.2 2.2 4-4.2"/></svg>
                <span>Akreditasi A</span>
              </div>

              <div class="absolute bottom-[24px] -right-[12px] bg-white text-[#0A2A5C] rounded-[14px] shadow-[0_16px_36px_rgba(3,15,40,.35)] p-[10px_16px] flex items-center gap-2 font-extrabold text-[13px]">
                <svg class="w-5 h-5 text-[#1B5FD9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/><circle cx="16.8" cy="9" r="2.6"/><path d="M16.2 14.3c2.5.4 4.3 2.1 5 5.2"/></svg>
                <span>316+ Siswa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 2. JURUSAN UNGGULAN ======= -->
      <section class="py-[72px] lg:py-[88px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="text-center max-w-[640px] mx-auto mb-[48px]">
            <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
              Konsentrasi Keahlian
            </span>
            <h2 class="text-[clamp(26px,3.8vw,38px)] font-black text-[#0A2A5C] tracking-tight mb-3">
              Bidang &amp; <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Jurusan Unggulan</span>
            </h2>
            <p class="text-[#5A6B8C] text-[15px] sm:text-[16px] leading-[1.6]">
              Pilih jalur vokasi sesuai minat dan bakatmu - semuanya terhubung langsung dengan kebutuhan dunia industri.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
            <NuxtLink 
              v-for="jur in jurusanList" 
              :key="jur.code"
              to="/smk/akademik"
              class="group bg-white border border-[#E3EAF7] rounded-[20px] p-[30px] flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(27,95,217,.14)] hover:border-[#B9D2F8]"
            >
              <span class="text-[11px] font-extrabold tracking-[1.5px] uppercase text-[#1B5FD9]">{{ jur.bidang }}</span>
              <div class="w-[56px] h-[56px] rounded-[16px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center my-[18px] group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white group-hover:scale-105 transition-all">
                <component :is="jur.icon" class="w-7 h-7" />
              </div>
              <h3 class="text-[28px] font-black text-[#0A2A5C] tracking-tight">{{ jur.code }}</h3>
              <p class="font-bold text-[14.5px] text-[#0F1E38] mt-1">{{ jur.name }}</p>
              <p class="text-[#5A6B8C] text-[13.5px] leading-[1.55] mt-2 flex-1">{{ jur.desc }}</p>
              
              <div class="mt-[20px] font-extrabold text-[13.5px] text-[#1B5FD9] inline-flex items-center gap-2 group-hover:translate-x-1.5 transition-transform">
                <span>Pelajari jurusan</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ======= 3. KENAPA ATTAQWA 9 (EDITORIAL ROWS) ======= -->
      <section class="py-[72px] lg:py-[88px] bg-white border-y border-[#E3EAF7]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="max-w-[620px] mb-[40px]">
            <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
              Kenapa Attaqwa 9
            </span>
            <h2 class="text-[clamp(26px,3.8vw,38px)] font-black text-[#0A2A5C] tracking-tight mb-2">
              SMK Rasa <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Pesantren</span>
            </h2>
            <p class="text-[#5A6B8C] text-[15px] sm:text-[16px] leading-[1.6]">
              Vokasi yang kuat, akhlak yang terjaga - dua hal yang tidak kami pisahkan.
            </p>
          </div>

          <div class="border-t border-[#E3EAF7] divide-y divide-[#E3EAF7]">
            <NuxtLink 
              v-for="item in whyRows" 
              :key="item.num"
              :to="item.link"
              class="group grid grid-cols-[60px_1fr] sm:grid-cols-[80px_56px_1fr_40px] gap-4 sm:gap-6 items-center py-[28px] px-2 sm:px-4 rounded-xl hover:bg-gradient-to-r hover:from-[#E8F0FE] hover:to-transparent transition-all"
            >
              <span class="text-[34px] sm:text-[44px] font-black text-transparent [-webkit-text-stroke:1.5px_#B9CBE8] group-hover:text-[#1B5FD9] group-hover:[-webkit-text-stroke:1.5px_#1B5FD9] transition-colors leading-none">
                {{ item.num }}
              </span>
              <div class="hidden sm:flex w-[52px] h-[52px] rounded-[15px] bg-[#E8F0FE] text-[#1B5FD9] items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#2B7CD8] group-hover:to-[#0A2A5C] group-hover:text-white transition-all">
                <component :is="item.icon" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-[17px] sm:text-[19px] font-extrabold text-[#0A2A5C] group-hover:text-[#1B5FD9] transition-colors">
                  {{ item.title }}
                </h3>
                <p class="text-[#5A6B8C] text-[13.5px] sm:text-[14.5px] leading-[1.55] mt-1 max-w-[620px]">
                  {{ item.desc }}
                </p>
              </div>
              <div class="hidden sm:flex text-[#C3D2EA] group-hover:text-[#1B5FD9] group-hover:translate-x-2 transition-all justify-end">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ======= 4. BERITA TERBARU ======= -->
      <section class="py-[72px] lg:py-[88px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-[40px]">
            <div>
              <span class="inline-block text-[11.5px] font-extrabold uppercase tracking-[2px] text-[#1B5FD9] bg-[#E8F0FE] py-1.5 px-4 rounded-full mb-3">
                Kabar Sekolah
              </span>
              <h2 class="text-[clamp(26px,3.8vw,38px)] font-black text-[#0A2A5C] tracking-tight">
                Berita Terbaru
              </h2>
            </div>
            <NuxtLink to="/smk/berita" class="text-[14px] font-bold text-[#1B5FD9] hover:underline inline-flex items-center gap-1.5">
              <span>Lihat semua berita</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
            <NuxtLink 
              v-for="news in latestNews" 
              :key="news.title"
              to="/smk/berita"
              class="group bg-white border border-[#E3EAF7] rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(10,42,92,.06)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(10,42,92,.12)] transition-all flex flex-col"
            >
              <div class="bg-gradient-to-br from-[#2B7CD8] to-[#0A2A5C] h-[170px] flex items-center justify-center text-white relative">
                <component :is="news.icon" class="w-12 h-12 text-white/90" />
              </div>
              <div class="p-[22px] flex-1 flex flex-col">
                <span :class="['text-[11px] font-extrabold uppercase tracking-wide py-1 px-3 rounded-full w-fit mb-3', news.tagClass]">
                  {{ news.category }}
                </span>
                <h3 class="text-[16.5px] font-extrabold text-[#0A2A5C] leading-snug group-hover:text-[#1B5FD9] transition-colors mb-2">
                  {{ news.title }}
                </h3>
                <span class="text-[12px] font-semibold text-[#5A6B8C] mt-auto">{{ news.date }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ======= 5. CTA BANNER ======= -->
      <section class="pb-[72px] lg:pb-[96px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <SmkCtaCard />
        </div>
      </section>
    </main>

    <SmkFooter />
  </div>
</template>

<script setup>
import { h } from 'vue'
import SmkHeader from '~/components/smk/SmkHeader.vue'
import SmkFooter from '~/components/smk/SmkFooter.vue'
import SmkCtaCard from '~/components/smk/SmkCtaCard.vue'

definePageMeta({ layout: false })

useHead({
  title: 'SMK IT Attaqwa 9 — Unggul dalam IMTAQ, Terdepan dalam IPTEK',
  meta: [
    { name: 'description', content: 'Website resmi SMK IT Attaqwa 9 Babelan, Kabupaten Bekasi. Akreditasi A. Membentuk generasi vokasi Qur\'ani: benar, pintar, dan terampil.' }
  ]
})

// SVG Ikon Helper
const makeSvg = (pathD) => () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: pathD })
])

const jurusanList = [
  {
    code: 'AKL',
    name: 'Akuntansi & Keuangan Lembaga',
    bidang: 'Bisnis & Manajemen',
    desc: 'Akuntansi, perpajakan, dan sistem keuangan lembaga modern berbasis aplikasi digital.',
    icon: makeSvg('M4 20h16M7 20v-7M12 20V6M17 20v-10')
  },
  {
    code: 'OTKP',
    name: 'Otomatisasi & Tata Kelola Perkantoran',
    bidang: 'Bisnis & Manajemen',
    desc: 'Administrasi perkantoran digital, kesekretarisan, dan layanan bisnis profesional.',
    icon: makeSvg('M3 8h18v12H3zM9 8V6.5A2.5 2.5 0 0111.5 4h1A2.5 2.5 0 0115 6.5V8M3 13.5h18')
  },
  {
    code: 'TBSM',
    name: 'Teknik & Bisnis Sepeda Motor',
    bidang: 'Teknik Otomotif',
    desc: 'Teknologi sepeda motor plus kewirausahaan bengkel - lulusan siap buka usaha mandiri.',
    icon: makeSvg('M20.6 6.6a5 5 0 01-6.9 6.9L7 20.2a2.2 2.2 0 01-3.1-3.1l6.7-6.7A5 5 0 0117.5 3.4l-2.8 2.8 2.6 2.6 3.3-2.2z')
  },
  {
    code: 'TKR',
    name: 'Teknik Kendaraan Ringan',
    bidang: 'Teknik Otomotif',
    desc: 'Perawatan, perbaikan, dan teknologi kendaraan ringan niaga terkini dengan workshop modern.',
    icon: makeSvg('M4.5 15.5L6 10.7A2 2 0 017.9 9.3h8.2a2 2 0 011.9 1.4l1.5 4.8M3.5 15.5h17V19a1 1 0 01-1 1H4.5a1 1 0 01-1-1v-3.5z')
  },
  {
    code: 'TKJ',
    name: 'Teknik Komputer & Jaringan',
    bidang: 'Teknologi Informasi',
    desc: 'Jaringan komputer, administrasi server, dan infrastruktur IT untuk era transformasi digital.',
    icon: makeSvg('M7 7h10v10H7zM10.5 2v3M13.5 2v3M10.5 19v3M13.5 19v3M2 10.5h3M2 13.5h3M19 10.5h3M19 13.5h3')
  },
  {
    code: 'DKV',
    name: 'Desain Komunikasi Visual',
    bidang: 'Teknologi Informasi',
    desc: 'Desain grafis, multimedia kreatif, dan komunikasi visual untuk industri kreatif modern.',
    icon: makeSvg('M4 20l1.2-4.2L16.7 4.3a2 2 0 012.8 0l.2.2a2 2 0 010 2.8L8.2 18.8 4 20zM14.8 6.2l3 3')
  }
]

const whyRows = [
  {
    num: '01',
    title: 'Kurikulum Merdeka + Deep Learning',
    desc: 'Pembelajaran yang menekankan pemahaman mendalam - bukan hafalan. Ditambah program tahfidz Yanbu\'a dan pembiasaan ibadah harian.',
    link: '/smk/akademik',
    icon: makeSvg('M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2v14zM12 6.5v14')
  },
  {
    num: '02',
    title: 'BLK Komunitas Kemnaker RI',
    desc: 'Gedung Balai Latihan Kerja Komunitas Link and Match di dalam sekolah - praktik kejuruan berstandar industri.',
    link: '/smk/akademik',
    icon: makeSvg('M12 2.5l7.5 2.8v5.7c0 4.8-3.3 8.2-7.5 10.5-4.2-2.3-7.5-5.7-7.5-10.5V5.3L12 2.5zM9 11.8l2.2 2.2 4-4.2')
  },
  {
    num: '03',
    title: 'Link & Match Dunia Industri (DUDIKA)',
    desc: 'Kelas industri bersama mitra dunia usaha, pendidikan sistem ganda, dan prakerin yang terstruktur.',
    link: '/smk/akademik',
    icon: makeSvg('M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2M16.8 9a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2z')
  },
  {
    num: '04',
    title: 'Pembinaan Akhlak Qur\'ani',
    desc: 'Sima\'an Qur\'an, sholat berjamaah, dan 13 ekstrakurikuler untuk mengasah bakat dan karakter mulia.',
    link: '/smk/ekstrakurikuler',
    icon: makeSvg('M20 13.2A8.2 8.2 0 1110.8 4 6.6 6.6 0 0020 13.2z')
  }
]

const latestNews = [
  {
    category: 'Pengumuman',
    tagClass: 'bg-[#FEF3C7] text-[#B45309]',
    title: 'SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran',
    date: '4 Oktober 2026',
    icon: makeSvg('M3.5 10.5v4l3.5.6v-5.2l-3.5.6zM7 9.9L17.5 5v14L7 14.1')
  },
  {
    category: 'Artikel',
    tagClass: 'bg-[#E0E7FF] text-[#4338CA]',
    title: 'Mengenal Deep Learning: Cara Baru Belajar di Kurikulum Merdeka',
    date: '28 September 2026',
    icon: makeSvg('M9.5 18.5h5M10.5 21.5h3M12 3a6 6 0 00-3.4 10.9c.8.6 1.4 1.3 1.4 2.6h4c0-1.3.6-2 1.4-2.6A6 6 0 0012 3z')
  },
  {
    category: 'Berita',
    tagClass: 'bg-[#DBEAFE] text-[#1D4ED8]',
    title: 'BLK Komunitas: Jembatan Sekolah Menuju Dunia Industri',
    date: '20 September 2026',
    icon: makeSvg('M5 3.5h14v17H5zM9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2')
  }
]
</script>
