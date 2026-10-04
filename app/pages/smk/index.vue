<script setup lang="ts">
useHead({
  title: 'SMK IT Attaqwa 9 — Unggul dalam IMTAQ, Terdepan dalam IPTEK',
  meta: [
    {
      name: 'description',
      content: 'SMK rasa pesantren berbasis kejuruan dan tahfidz di Ujung Harapan Babelan Bekasi. 6 Konsentrasi Keahlian, BLK Komunitas Kemnaker RI, Akreditasi A.'
    }
  ]
})

const stats = [
  { val: '316', sup: '+', label: 'Siswa Aktif' },
  { val: '6', sup: '', label: 'Konsentrasi Keahlian' },
  { val: '13', sup: '', label: 'Ekstrakurikuler' },
  { val: 'A', sup: '', label: 'Akreditasi BAN-SM' }
]

const jurusanList = [
  {
    bidang: 'Bisnis & Manajemen',
    kode: 'AKL',
    nama: 'Akuntansi & Keuangan Lembaga',
    desc: 'Akuntansi, perpajakan, dan sistem keuangan lembaga modern berbasis aplikasi perbankan.',
    icon: 'calc'
  },
  {
    bidang: 'Bisnis & Manajemen',
    kode: 'OTKP',
    nama: 'Otomatisasi & Tata Kelola Perkantoran',
    desc: 'Administrasi perkantoran digital, kesekretarisan, korespondensi, dan layanan bisnis profesional.',
    icon: 'office'
  },
  {
    bidang: 'Teknik Otomotif',
    kode: 'TBSM',
    nama: 'Teknik & Bisnis Sepeda Motor',
    desc: 'Teknologi sepeda motor terkini dipadukan dengan kewirausahaan bengkel mandiri.',
    icon: 'bike'
  },
  {
    bidang: 'Teknik Otomotif',
    kode: 'TKR',
    nama: 'Teknik Kendaraan Ringan',
    desc: 'Perawatan, perbaikan mesin, kelistrikan, dan sasis kendaraan ringan niaga berstandar industri.',
    icon: 'car'
  },
  {
    bidang: 'Teknologi Informasi',
    kode: 'TKJ',
    nama: 'Teknik Komputer & Jaringan',
    desc: 'Instalasi jaringan LAN/WAN, administrasi server Linux/Windows, mikrotik, dan infrastruktur IT.',
    icon: 'network'
  },
  {
    bidang: 'Teknologi Informasi',
    kode: 'DKV',
    nama: 'Desain Komunikasi Visual',
    desc: 'Desain grafis, ilustrasi, branding multimedia, fotografi, dan komunikasi visual kreatif.',
    icon: 'palette'
  }
]

const keunggulanRows = [
  {
    num: '01',
    title: 'Kurikulum Merdeka + Deep Learning',
    desc: 'Pembelajaran yang menekankan pemahaman konsep secara mendalam bukan sekadar hafalan. Ditambah program tahfidz metode Yanbu\'a dan pembiasaan ibadah harian.',
    link: '/smk/akademik'
  },
  {
    num: '02',
    title: 'BLK Komunitas Kemnaker RI',
    desc: 'Gedung Balai Latihan Kerja Komunitas Link and Match di dalam lingkungan sekolah untuk praktik kejuruan standar industri.',
    link: '/smk/akademik'
  },
  {
    num: '03',
    title: 'Link & Match Dunia Industri',
    desc: 'Kelas industri bersama DUDIKA, pendidikan sistem ganda (PSG), dan program prakerin yang terstruktur di perusahaan rekanan.',
    link: '/smk/akademik'
  },
  {
    num: '04',
    title: 'Pembinaan Akhlak Qur\'ani',
    desc: 'Sima\'an Qur\'an harian, sholat berjamaah tepat waktu, dan 13 ekstrakurikuler pembinaan karakter kepemimpinan siswa.',
    link: '/smk/ekstrakurikuler'
  }
]

const beritaTerkini = [
  {
    tag: 'Pengumuman',
    tagClass: 'bg-[#FEF3C7] text-[#B45309]',
    title: 'SPMB 2027/2028 Dibuka: 7 Rombel, 3 Gelombang Pendaftaran',
    date: '4 Oktober 2026',
    icon: 'announcement'
  },
  {
    tag: 'Artikel',
    tagClass: 'bg-[#EEF2FF] text-[#4338CA]',
    title: 'Mengenal Deep Learning: Cara Baru Belajar di Kurikulum Merdeka',
    date: '28 September 2026',
    icon: 'article'
  },
  {
    tag: 'Berita',
    tagClass: 'bg-[#E0F2FE] text-[#0369A1]',
    title: 'BLK Komunitas: Jembatan Sekolah Menuju Dunia Industri',
    date: '20 September 2026',
    icon: 'news'
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased flex flex-col">
    <SmkHeader />

    <main class="flex-1">
      <!-- ======= 1. HERO HOME ======= -->
      <section 
        class="relative overflow-hidden text-white pt-[140px] lg:pt-[170px] pb-[70px] lg:pb-[96px]"
        style="background: radial-gradient(900px 480px at 85% -10%, rgba(43,124,216,0.55), transparent 60%), linear-gradient(135deg, #0C2C61 0%, #0A2A5C 55%, #061A3E 100%); background-color: #0A2A5C;"
      >
        <!-- Ambient Glow & Pattern -->
        <div class="absolute inset-0 opacity-12 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:26px_26px] pointer-events-none"></div>
        <div class="absolute -top-[120px] -right-[100px] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none" style="background: rgba(76, 141, 255, 0.25);"></div>

        <div class="w-[min(1180px,100%-40px)] mx-auto relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[44px] items-center">
            <!-- Left Text Column -->
            <div>
              <div 
                class="inline-flex items-center gap-[8px] text-[12.5px] font-bold py-[7px] px-[16px] rounded-full mb-[20px] shadow-sm"
                style="background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.5); color: #FCD34D;"
              >
                <span class="w-[8px] h-[8px] rounded-full bg-[#F59E0B] animate-pulse"></span>
                <span>SPMB 2027/2028 Telah Dibuka • 7 Rombel</span>
              </div>

              <h1 class="text-[clamp(32px,4.8vw,56px)] font-black tracking-tight leading-[1.15] mb-[18px] text-white">
                Unggul dalam <span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">IMTAQ</span>,<br>
                Terdepan dalam <span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">IPTEK</span>
              </h1>

              <p class="text-[#C9D8F2] text-[16px] sm:text-[17.5px] leading-[1.65] max-w-[580px] mb-[12px]">
                SMK IT Attaqwa 9 - SMK rasa pesantren yang membentuk generasi vokasi Qur'ani: benar, pintar, dan terampil.
              </p>

              <p class="text-[#FDE68A] font-bold text-[14.5px] italic mb-[32px]">
                "Membentuk Generasi Vokasi Qur'ani yang Benar, Pintar, dan Terampil."
              </p>

              <!-- CTAs -->
              <div class="flex flex-wrap items-center gap-[14px] mb-[48px]">
                <NuxtLink 
                  to="/spmb/smk" 
                  class="inline-flex items-center gap-[8px] font-black text-[15px] py-[13px] px-[26px] rounded-[14px] text-[#3D2C00] shadow-[0_10px_24px_rgba(240,180,41,.35)] hover:-translate-y-0.5 transition-all"
                  style="background: linear-gradient(90deg, #F0B429 0%, #F59E0B 100%);"
                >
                  <span>Daftar SPMB 2027/2028</span>
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </NuxtLink>
                <NuxtLink 
                  to="/smk/tentang" 
                  class="inline-flex items-center gap-[8px] font-bold text-[15px] py-[13px] px-[24px] rounded-[14px] text-white transition-all hover:bg-white/20"
                  style="background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.3); backdrop-filter: blur(8px);"
                >
                  <span>Jelajahi Sekolah</span>
                </NuxtLink>
              </div>

              <!-- 4 Stats Cards -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-[12px]">
                <div 
                  v-for="s in stats" 
                  :key="s.label"
                  class="rounded-[16px] p-[16px_18px] transition-all"
                  style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.16); backdrop-filter: blur(6px);"
                >
                  <b class="block text-[28px] font-black text-white leading-none mb-1">
                    {{ s.val }}<small class="text-[#FCD34D] text-[18px]">{{ s.sup }}</small>
                  </b>
                  <span class="text-[12px] font-semibold text-[#A9BDDD]">{{ s.label }}</span>
                </div>
              </div>
            </div>

            <!-- Right Visual Column: Frame Placeholder + Floating Badges -->
            <div class="relative flex items-center justify-center">
              <div 
                class="w-full rounded-[24px] p-8 text-center flex flex-col items-center justify-center min-h-[360px] lg:min-h-[420px] relative transition-all"
                style="background: rgba(255, 255, 255, 0.06); border: 2px dashed rgba(255, 255, 255, 0.25); backdrop-filter: blur(8px);"
              >
                <!-- Floating Badge 1 (Akreditasi A) -->
                <div 
                  class="absolute -top-4 -left-4 sm:top-6 sm:-left-6 text-[#0A2A5C] bg-white rounded-full px-4 py-2.5 shadow-[0_12px_28px_rgba(0,0,0,.25)] flex items-center gap-2.5 font-black text-[13px] border border-[#E3EAF7]"
                >
                  <span class="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[12px]">✓</span>
                  <span>Akreditasi A BAN-SM</span>
                </div>

                <!-- Floating Badge 2 (316+ Siswa) -->
                <div 
                  class="absolute -bottom-4 -right-4 sm:bottom-6 sm:-right-6 text-white bg-[#0A2A5C] rounded-full px-4 py-2.5 shadow-[0_12px_28px_rgba(0,0,0,.3)] flex items-center gap-2.5 font-black text-[13px] border border-white/25"
                >
                  <span class="w-6 h-6 rounded-full bg-[#F59E0B] text-[#3D2C00] flex items-center justify-center text-[12px] font-bold">★</span>
                  <span>316+ Siswa Vokasi</span>
                </div>

                <!-- Center Placeholder Box -->
                <div class="flex flex-col items-center gap-3">
                  <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <svg class="w-8 h-8 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/>
                      <circle cx="12" cy="13.5" r="3.4"/>
                      <path d="M8.5 7.5L10 5h4l1.5 2.5"/>
                    </svg>
                  </div>
                  <b class="text-[13px] font-extrabold text-white uppercase tracking-wider">FOTO : SISWA SMK IT ATTAQWA 9</b>
                  <small class="text-[11.5px] text-[#A9BDDD]">Ganti dengan foto dokumentasi asli siswa</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======= 2. JURUSAN UNGGULAN (6 KARTU) ======= -->
      <section class="py-[64px] lg:py-[96px] bg-[#F5F8FF]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="text-center max-w-[680px] mx-auto mb-[48px]">
            <span class="text-[12px] font-extrabold tracking-[0.14em] uppercase text-[#1B5FD9] block mb-[8px]">
              Konsentrasi Keahlian
            </span>
            <h2 class="text-[clamp(26px,3.6vw,38px)] font-black text-[#0A2A5C] tracking-tight mb-[12px]">
              Bidang &amp; <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Jurusan Unggulan</span>
            </h2>
            <p class="text-[#5A6B8C] text-[15.5px] sm:text-[16.5px] leading-relaxed">
              Pilih jalur vokasi sesuai minat dan bakatmu - semuanya terhubung langsung dengan kebutuhan dunia industri.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
            <NuxtLink 
              v-for="j in jurusanList" 
              :key="j.kode"
              to="/smk/akademik"
              class="group bg-white border border-[#E3EAF7] rounded-[20px] p-[28px] shadow-[0_8px_24px_rgba(10,42,92,.06)] hover:-translate-y-1.5 hover:shadow-[0_20px_44px_rgba(10,42,92,.14)] hover:border-[#1B5FD9]/40 transition-all flex flex-col"
            >
              <div class="flex items-center justify-between gap-2 mb-[16px]">
                <span class="text-[11px] font-extrabold tracking-wider uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[4px] px-[12px] rounded-full">
                  {{ j.bidang }}
                </span>
                <span class="text-[12px] font-bold text-[#5A6B8C] group-hover:text-[#1B5FD9] transition-colors">
                  SMK IT
                </span>
              </div>

              <div class="w-[52px] h-[52px] rounded-[15px] bg-[#E8F0FE] group-hover:bg-gradient-to-br group-hover:from-[#1B5FD9] group-hover:to-[#0A2A5C] group-hover:text-white text-[#1B5FD9] flex items-center justify-center text-[22px] font-black mb-[16px] transition-all">
                {{ j.kode.substring(0, 1) }}
              </div>

              <h3 class="text-[20px] font-black text-[#0A2A5C] mb-[4px] group-hover:text-[#1B5FD9] transition-colors">
                {{ j.kode }}
              </h3>
              <b class="text-[13.5px] text-[#0F1E38] block mb-[10px]">{{ j.nama }}</b>

              <p class="text-[#5A6B8C] text-[13.5px] leading-relaxed mb-[20px] flex-1">
                {{ j.desc }}
              </p>

              <div class="pt-[14px] border-t border-[#E3EAF7] flex items-center justify-between text-[13px] font-bold text-[#1B5FD9]">
                <span>Pelajari jurusan</span>
                <span class="group-hover:translate-x-1.5 transition-transform text-[16px]">→</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ======= 3. KENAPA ATTAQWA 9 (NUMBERED ROWS 01-04) ======= -->
      <section class="py-[64px] lg:py-[96px] bg-white border-y border-[#E3EAF7]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="max-w-[640px] mb-[44px]">
            <span class="text-[12px] font-extrabold tracking-[0.14em] uppercase text-[#1B5FD9] block mb-[8px]">
              Kenapa Attaqwa 9
            </span>
            <h2 class="text-[clamp(26px,3.6vw,38px)] font-black text-[#0A2A5C] tracking-tight mb-[10px]">
              SMK Rasa <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Pesantren</span>
            </h2>
            <p class="text-[#5A6B8C] text-[15.5px] sm:text-[16.5px]">
              Vokasi yang kuat, akhlak yang terjaga - dua hal yang tidak kami pisahkan.
            </p>
          </div>

          <div class="space-y-[14px]">
            <NuxtLink 
              v-for="row in keunggulanRows" 
              :key="row.num"
              :to="row.link"
              class="group bg-[#F5F8FF] border border-[#E3EAF7] rounded-[20px] p-[24px_28px] flex flex-col md:flex-row items-start md:items-center justify-between gap-[20px] hover:bg-white hover:border-[#1B5FD9]/40 hover:shadow-[0_12px_32px_rgba(10,42,92,.1)] transition-all cursor-pointer"
            >
              <div class="flex items-start md:items-center gap-[22px]">
                <span class="text-[32px] sm:text-[40px] font-black text-[#0A2A5C]/20 group-hover:text-[#1B5FD9] transition-colors leading-none font-mono">
                  {{ row.num }}
                </span>
                <div>
                  <h3 class="text-[17.5px] sm:text-[19px] font-extrabold text-[#0A2A5C] group-hover:text-[#1B5FD9] transition-colors mb-[4px]">
                    {{ row.title }}
                  </h3>
                  <p class="text-[#5A6B8C] text-[14px] sm:text-[14.5px] leading-relaxed max-w-[760px]">
                    {{ row.desc }}
                  </p>
                </div>
              </div>

              <div class="w-10 h-10 rounded-full bg-white border border-[#E3EAF7] group-hover:bg-[#1B5FD9] group-hover:border-[#1B5FD9] text-[#1B5FD9] group-hover:text-white flex items-center justify-center shrink-0 self-end md:self-center transition-all shadow-xs">
                <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ======= 4. BERITA TERBARU ======= -->
      <section class="py-[64px] lg:py-[96px] bg-[#F5F8FF]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-[16px] mb-[40px]">
            <div>
              <span class="text-[12px] font-extrabold tracking-[0.14em] uppercase text-[#1B5FD9] block mb-[8px]">
                Kabar Sekolah
              </span>
              <h2 class="text-[clamp(24px,3.2vw,34px)] font-black text-[#0A2A5C] tracking-tight">
                Berita Terbaru
              </h2>
            </div>
            <NuxtLink 
              to="/smk/berita" 
              class="inline-flex items-center gap-[6px] font-bold text-[14.5px] text-[#1B5FD9] hover:underline"
            >
              <span>Semua Berita</span>
              <span>→</span>
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-[22px] mb-[36px]">
            <NuxtLink 
              v-for="b in beritaTerkini" 
              :key="b.title"
              to="/smk/berita"
              class="group bg-white border border-[#E3EAF7] rounded-[20px] overflow-hidden shadow-[0_8px_24px_rgba(10,42,92,.05)] hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(10,42,92,.12)] transition-all flex flex-col"
            >
              <div class="bg-[#E8F0FE] h-[140px] flex items-center justify-center p-6 border-b border-[#E3EAF7]">
                <svg class="w-12 h-12 text-[#1B5FD9]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="5" y="3.5" width="14" height="17" rx="1.5"/>
                  <path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2M10 20.5v-2.8h4v2.8"/>
                </svg>
              </div>

              <div class="p-[22px] flex-1 flex flex-col">
                <div class="flex items-center justify-between gap-[8px] mb-[10px]">
                  <span :class="['text-[11px] font-extrabold uppercase px-[10px] py-[3px] rounded-full', b.tagClass]">
                    {{ b.tag }}
                  </span>
                  <span class="text-[12px] text-[#5A6B8C] font-semibold">{{ b.date }}</span>
                </div>

                <h3 class="text-[15.5px] font-extrabold text-[#0A2A5C] leading-snug group-hover:text-[#1B5FD9] transition-colors flex-1 mb-[14px]">
                  {{ b.title }}
                </h3>

                <div class="pt-[10px] border-t border-[#E3EAF7] flex items-center justify-between text-[12.5px] font-bold text-[#1B5FD9]">
                  <span>Baca selengkapnya</span>
                  <span class="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ======= 5. CTA PENDAFTARAN SPMB ======= -->
      <section class="py-[40px] lg:py-[64px] bg-[#F5F8FF]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <SmkCtaCard />
        </div>
      </section>
    </main>

    <SmkFooter />
  </div>
</template>
