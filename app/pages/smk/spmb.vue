<script setup lang="ts">
useHead({
  title: 'SPMB 2027/2028 — SMK IT Attaqwa 9',
  meta: [
    {
      name: 'description',
      content: 'Seleksi Penerimaan Murid Baru SMK IT Attaqwa 9 Tahun Ajaran 2027/2028. Kuota 7 rombel, 3 gelombang pendaftaran, biaya registrasi Rp50.000.'
    }
  ]
})

const gelombangList = [
  {
    nama: 'Gelombang I',
    periode: '01 Sep – 26 Des 2026',
    status: 'Sedang Dibuka',
    isAktif: true,
    tes: 'Ahad, 27 Desember 2026',
    pengumuman: '30 Desember 2026'
  },
  {
    nama: 'Gelombang II',
    periode: '01 Jan – 24 Apr 2027',
    status: 'Segera Dibuka',
    isAktif: false,
    tes: 'Ahad, 25 April 2027',
    pengumuman: '28 April 2027'
  },
  {
    nama: 'Gelombang Tambahan',
    periode: '26 Apr – 27 Jun 2027',
    status: 'Kuotapilihan',
    isAktif: false,
    tes: 'Setiap hari Ahad',
    pengumuman: '2 hari setelah tes'
  }
]

const beasiswaList = [
  {
    judul: 'Gratis Uang Pangkal',
    ket: 'Untuk seluruh penerima program beasiswa resmi sekolah.',
    icon: 'pangkal'
  },
  {
    judul: 'Siswa Berprestasi',
    ket: 'Gratis SPP jalur akademik dan non-akademik (juara lomba/tahfidz).',
    icon: 'prestasi'
  },
  {
    judul: 'Yatim & Anak Guru',
    ket: 'Gratis SPP penuh sebagai bentuk kepedulian dan apresiasi dedikasi.',
    icon: 'yatim'
  },
  {
    judul: 'KETM',
    ket: 'Gratis SPP bagi siswa dari keluarga ekonomi tidak mampu.',
    icon: 'ketm'
  },
  {
    judul: 'Seragam & Buku',
    ket: 'Bantuan gratis seragam sekolah, modul pembelajaran, dan praktek.',
    icon: 'buku'
  },
  {
    judul: 'Subsidi Silang',
    ket: 'Skema subsidi silang biaya pendidikan selama 3 tahun masa studi.',
    icon: 'subsidi'
  }
]
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
            <b class="text-[#FCD34D]">SPMB</b>
          </div>
          <h1 class="text-[clamp(28px,4vw,44px)] font-black tracking-tight leading-[1.15] mb-[12px]">
            SPMB 2027/2028
          </h1>
          <p class="text-[#C9D8F2] text-[15.5px] sm:text-[17px] max-w-[640px] leading-relaxed">
            Seleksi Penerimaan Murid Baru - hanya 7 rombel. Ditambah pendaftaran inden untuk tahun ajaran 2028/2029.
          </p>
        </div>
      </section>

      <!-- Section 1: Gelombang Pendaftaran -->
      <section class="py-[64px] lg:py-[88px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="mb-[36px]">
            <span class="text-[12px] font-extrabold tracking-[0.14em] uppercase text-[#1B5FD9] block mb-[8px]">
              Jadwal Seleksi
            </span>
            <h2 class="text-[clamp(24px,3.2vw,34px)] font-black text-[#0A2A5C] tracking-tight">
              Tiga Gelombang Pendaftaran
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-[20px] mb-[28px]">
            <div 
              v-for="gel in gelombangList" 
              :key="gel.nama"
              :class="[
                'border rounded-[22px] p-[28px] transition-all flex flex-col',
                gel.isAktif 
                  ? 'bg-white border-[#1B5FD9] shadow-[0_16px_36px_rgba(27,95,217,.12)] relative' 
                  : 'bg-white border-[#E3EAF7] shadow-[0_8px_24px_rgba(10,42,92,.05)]'
              ]"
            >
              <div v-if="gel.isAktif" class="absolute -top-[12px] right-[24px] bg-gradient-to-r from-[#1B5FD9] to-[#0A2A5C] text-white text-[11px] font-black uppercase px-[12px] py-[3px] rounded-full shadow-xs">
                Gelombang Aktif
              </div>

              <div class="border-b border-[#E3EAF7] pb-[16px] mb-[18px]">
                <h3 class="text-[20px] font-extrabold text-[#0A2A5C] mb-[4px]">{{ gel.nama }}</h3>
                <span class="text-[14px] font-bold text-[#1B5FD9]">{{ gel.periode }}</span>
              </div>

              <ul class="space-y-[12px] text-[14px] text-[#5A6B8C] mb-[24px] flex-1">
                <li class="flex items-start gap-[10px]">
                  <span class="w-[6px] h-[6px] rounded-full bg-[#1B5FD9] shrink-0 mt-[7px]"></span>
                  <span><b>Tes seleksi:</b> {{ gel.tes }}</span>
                </li>
                <li class="flex items-start gap-[10px]">
                  <span class="w-[6px] h-[6px] rounded-full bg-[#1B5FD9] shrink-0 mt-[7px]"></span>
                  <span><b>Pengumuman:</b> {{ gel.pengumuman }}</span>
                </li>
              </ul>

              <NuxtLink 
                to="/spmb/smk" 
                :class="[
                  'w-full py-[11px] px-[16px] rounded-[12px] font-bold text-[14px] text-center transition-all',
                  gel.isAktif
                    ? 'bg-[#1B5FD9] text-white hover:bg-[#0A2A5C] shadow-[0_6px_16px_rgba(27,95,217,.25)]'
                    : 'bg-[#F5F8FF] text-[#0A2A5C] border border-[#E3EAF7] hover:bg-[#E8F0FE]'
                ]"
              >
                {{ gel.isAktif ? 'Daftar Gelombang Ini →' : 'Lihat Alur SPMB' }}
              </NuxtLink>
            </div>
          </div>

          <!-- Pelayanan Info Box -->
          <div class="bg-white border border-[#E3EAF7] rounded-[16px] p-[16px_22px] flex items-center gap-[12px] text-[#5A6B8C] text-[13.5px] sm:text-[14px] shadow-xs">
            <svg class="w-5 h-5 text-[#1B5FD9] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="8.3"/>
              <path d="M12 7.5V12l3.3 2"/>
            </svg>
            <span>
              <b>Pelayanan Pendaftaran:</b> Senin – Jumat (08.00 – 15.00 WIB) • Sabtu – Ahad (09.00 – 14.00 WIB)
            </span>
          </div>
        </div>
      </section>

      <!-- Section 2: Syarat & Beasiswa (2 Kolom) -->
      <section class="py-[64px] lg:py-[88px] bg-white border-y border-[#E3EAF7]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-[48px]">
            <!-- Syarat Pendaftaran (8 Poin) -->
            <div>
              <span class="text-[12px] font-extrabold tracking-[0.14em] uppercase text-[#1B5FD9] block mb-[8px]">
                Persyaratan
              </span>
              <h2 class="text-[clamp(24px,3.2vw,32px)] font-black text-[#0A2A5C] tracking-tight mb-[24px]">
                Syarat Pendaftaran
              </h2>

              <div class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[22px] p-[24px_28px]">
                <ol class="space-y-[14px]">
                  <li class="flex items-start gap-[12px] text-[14.5px] text-[#0F1E38]">
                    <span class="w-[24px] h-[24px] rounded-full bg-[#0A2A5C] text-white text-[12px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <span>Membayar biaya registrasi <b>Rp50.000</b></span>
                      <span class="block text-[13px] text-[#16A34A] font-semibold mt-0.5">(gratis bagi siswa berprestasi &amp; yatim)</span>
                    </div>
                  </li>
                  <li class="flex items-start gap-[12px] text-[14.5px] text-[#0F1E38]">
                    <span class="w-[24px] h-[24px] rounded-full bg-[#0A2A5C] text-white text-[12px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Mengisi formulir pendaftaran secara online atau offline</span>
                  </li>
                  <li class="flex items-start gap-[12px] text-[14.5px] text-[#0F1E38]">
                    <span class="w-[24px] h-[24px] rounded-full bg-[#0A2A5C] text-white text-[12px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Fotokopi ijazah SMP/MTs sederajat legalisir (3 lembar)</span>
                  </li>
                  <li class="flex items-start gap-[12px] text-[14.5px] text-[#0F1E38]">
                    <span class="w-[24px] h-[24px] rounded-full bg-[#0A2A5C] text-white text-[12px] font-black flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span>Fotokopi SKHUN legalisir (3 lembar)</span>
                  </li>
                  <li class="flex items-start gap-[12px] text-[14.5px] text-[#0F1E38]">
                    <span class="w-[24px] h-[24px] rounded-full bg-[#0A2A5C] text-white text-[12px] font-black flex items-center justify-center shrink-0 mt-0.5">5</span>
                    <span>Fotokopi NISN (3 lembar)</span>
                  </li>
                  <li class="flex items-start gap-[12px] text-[14.5px] text-[#0F1E38]">
                    <span class="w-[24px] h-[24px] rounded-full bg-[#0A2A5C] text-white text-[12px] font-black flex items-center justify-center shrink-0 mt-0.5">6</span>
                    <span>Fotokopi akte kelahiran (3 lembar)</span>
                  </li>
                  <li class="flex items-start gap-[12px] text-[14.5px] text-[#0F1E38]">
                    <span class="w-[24px] h-[24px] rounded-full bg-[#0A2A5C] text-white text-[12px] font-black flex items-center justify-center shrink-0 mt-0.5">7</span>
                    <span>Fotokopi kartu keluarga (3 lembar)</span>
                  </li>
                  <li class="flex items-start gap-[12px] text-[14.5px] text-[#0F1E38]">
                    <span class="w-[24px] h-[24px] rounded-full bg-[#0A2A5C] text-white text-[12px] font-black flex items-center justify-center shrink-0 mt-0.5">8</span>
                    <span>Pas foto hitam putih ukuran 3×4 (3 lembar)</span>
                  </li>
                </ol>
              </div>
            </div>

            <!-- Beasiswa Vokasi (6 Kartu) -->
            <div>
              <span class="text-[12px] font-extrabold tracking-[0.14em] uppercase text-[#1B5FD9] block mb-[8px]">
                Beasiswa
              </span>
              <h2 class="text-[clamp(24px,3.2vw,32px)] font-black text-[#0A2A5C] tracking-tight mb-[24px]">
                Beasiswa Vokasi
              </h2>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                <div 
                  v-for="b in beasiswaList" 
                  :key="b.judul"
                  class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[18px] p-[18px] hover:border-[#1B5FD9]/40 hover:bg-white transition-all"
                >
                  <div class="flex items-center gap-[10px] mb-[8px]">
                    <span class="w-[32px] h-[32px] rounded-[10px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center font-bold">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2.5 9L12 4.5 21.5 9 12 13.5 2.5 9z"/>
                        <path d="M6.5 11.3V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.7M21.5 9V14"/>
                      </svg>
                    </span>
                    <b class="text-[14.5px] text-[#0A2A5C]">{{ b.judul }}</b>
                  </div>
                  <p class="text-[12.5px] text-[#5A6B8C] leading-relaxed">
                    {{ b.ket }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: Formulir Online CTA -->
      <section class="py-[64px] lg:py-[88px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="bg-gradient-to-br from-[#0C2C61] via-[#0A2A5C] to-[#061A3E] text-white rounded-[28px] overflow-hidden shadow-[0_24px_60px_rgba(10,42,92,.18)] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] border border-white/10">
            <div class="p-[36px_28px] sm:p-[48px_44px] flex flex-col justify-center">
              <span class="text-[11.5px] font-extrabold tracking-[1.5px] uppercase text-[#FCD34D] block mb-[12px]">
                Formulir Online
              </span>
              <h2 class="text-[clamp(24px,3.4vw,36px)] font-black tracking-tight leading-[1.2] mb-[14px]">
                Amankan kursimu di <span class="bg-gradient-to-r from-[#7DB9F5] to-[#FCD34D] bg-clip-text text-transparent">7 rombel</span> ini.
              </h2>
              <p class="text-[#C9D8F2] text-[15px] sm:text-[16px] leading-relaxed max-w-[460px] mb-[28px]">
                Klik tombol di bawah untuk mengisi formulir pendaftaran online resmi SMK IT Attaqwa 9.
              </p>
              
              <div class="flex flex-wrap items-center gap-[16px]">
                <NuxtLink 
                  to="/spmb/smk" 
                  class="inline-flex items-center gap-[8px] font-extrabold text-[15px] py-[13px] px-[28px] rounded-[14px] text-[#3D2C00] bg-gradient-to-r from-[#F0B429] to-[#F59E0B] shadow-[0_10px_24px_rgba(240,180,41,.35)] hover:-translate-y-0.5 transition-all"
                >
                  <span>Mulai Pendaftaran</span>
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </NuxtLink>
                <NuxtLink 
                  to="/smk/kontak" 
                  class="font-bold text-[14.5px] text-[#A9BDDD] hover:text-white transition-colors"
                >
                  Butuh bantuan formulir?
                </NuxtLink>
              </div>
            </div>

            <!-- Placeholder Foto -->
            <div class="bg-white/5 min-h-[260px] flex items-center justify-center p-8 border-t lg:border-t-0 lg:border-l border-white/10">
              <div class="border-2 border-dashed border-white/20 rounded-[20px] p-8 text-center flex flex-col items-center justify-center gap-3 w-full h-full min-h-[220px]">
                <svg class="w-10 h-10 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/>
                  <circle cx="12" cy="13.5" r="3.4"/>
                  <path d="M8.5 7.5L10 5h4l1.5 2.5"/>
                </svg>
                <b class="text-[12px] font-extrabold text-white tracking-wider uppercase">FOTO : SISWA SMK IT ATTAQWA 9</b>
                <small class="text-[11.5px] text-[#A9BDDD]">Ganti dengan foto asli siswa</small>
              </div>
            </div>
          </div>
          <p class="text-center text-[#5A6B8C] text-[13px] mt-[16px]">
            Tautan formulir terintegrasi langsung dengan portal SPMB Online SMK IT Attaqwa 9.
          </p>
        </div>
      </section>
    </main>

    <SmkFooter />
  </div>
</template>
