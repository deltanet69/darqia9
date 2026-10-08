<script setup lang="ts">
import { useGsapReveal } from '~/composables/useGsapReveal'

useGsapReveal()
definePageMeta({ layout: 'smp' })
</script>

<template>
  <div class="min-h-screen bg-[#F2F9F5] text-[#0E241B] font-sans antialiased overflow-x-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. PAGE HERO -->
    <!-- ================================================================= -->
    <section class="relative overflow-hidden text-white bg-gradient-to-br from-[#0A4A30] to-[#052E22]">
      <div class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

      <div class="max-w-[1180px] mx-auto px-[22px] py-[64px] pb-[60px] relative">
        <div class="text-[12.5px] text-[#8FBCA1] font-semibold mb-[14px] flex items-center gap-1.5">
          <NuxtLink to="/smp" class="hover:text-white transition-colors">Home</NuxtLink>
          <span>/</span>
          <b class="text-[#FCD34D] font-bold">SPMB</b>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h1 class="text-[clamp(30px,4.4vw,46px)] font-black tracking-[-0.02em] leading-tight mb-2.5">
              SPMB 2027/2028
            </h1>
            <p class="text-[#BFE0CE] max-w-[70ch] text-[16px] leading-relaxed">
              Seleksi Penerimaan Murid Baru — hanya 7 rombel. Ditambah pendaftaran inden untuk tahun ajaran 2028/2029.
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0 self-start lg:self-end">
            <NuxtLink 
              to="/spmb" 
              class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-7 rounded-[14px] text-white bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-[0_10px_24px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 transition-all"
            >
              Mulai Pendaftaran Online
              <svg class="w-4 h-4 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </NuxtLink>
          </div>
        </div>

        <!-- 4 Fact Highlights -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mt-10 pt-8 border-t border-white/10">
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span class="text-[12px] font-bold text-[#A9D4BC] block uppercase tracking-wider">Biaya Registrasi</span>
            <span class="text-[20px] font-black text-white">Rp50.000</span>
            <span class="text-[11.5px] text-[#4ADE80] font-semibold block mt-0.5">Gratis bagi yatim &amp; juara</span>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span class="text-[12px] font-bold text-[#A9D4BC] block uppercase tracking-wider">Kapasitas Kelas</span>
            <span class="text-[20px] font-black text-[#FCD34D]">7 Rombel</span>
            <span class="text-[11.5px] text-[#C4E4D4] font-semibold block mt-0.5">Kelas Gender Putra &amp; Putri</span>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span class="text-[12px] font-bold text-[#A9D4BC] block uppercase tracking-wider">Metode Belajar</span>
            <span class="text-[20px] font-black text-white">CTL ICT</span>
            <span class="text-[11.5px] text-[#C4E4D4] font-semibold block mt-0.5">Contextual Learning</span>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span class="text-[12px] font-bold text-[#A9D4BC] block uppercase tracking-wider">Pendaftaran Inden</span>
            <span class="text-[20px] font-black text-[#7EE2AE]">2028/2029</span>
            <span class="text-[11.5px] text-[#C4E4D4] font-semibold block mt-0.5">Kunci kursi lebih awal</span>
          </div>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 2. JADWAL 3 GELOMBANG (Soft Emerald Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="max-w-[700px] mb-12">
          <span class="inline-flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.16em] text-[#0E7A4E] uppercase py-1 px-3.5 rounded-full bg-[#E4F4EC] mb-3">
            <svg class="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Jadwal Seleksi
          </span>
          <h2 class="text-[clamp(26px,3.6vw,38px)] font-black tracking-[-0.02em] leading-tight text-[#063826]">
            Tiga Gelombang <span class="bg-gradient-to-r from-[#0E7A4E] to-[#34C77B] bg-clip-text text-transparent">Pendaftaran</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <!-- Gelombang 1 -->
          <div class="rv bg-white border-2 border-[#0E7A4E] rounded-[24px] p-7 shadow-md flex flex-col justify-between">
            <div>
              <span class="text-[11px] font-black uppercase text-[#0E7A4E] bg-[#E4F4EC] py-1 px-3 rounded-full inline-block mb-4">
                Gelombang Utama
              </span>
              <h3 class="text-[22px] font-black text-[#063826] mb-1">Gelombang I</h3>
              <div class="text-[14px] font-bold text-[#0E7A4E] mb-4">01 Sep – 26 Des 2026</div>
              <ul class="space-y-2 text-[14px] text-[#55705F] pt-4 border-t border-[#F2F9F5]">
                <li>Tes Seleksi: <strong class="text-[#063826]">Ahad, 27 Des 2026</strong></li>
                <li>Pengumuman: <strong class="text-[#063826]">30 Des 2026</strong></li>
              </ul>
            </div>
            <div class="pt-4 mt-6 border-t border-[#F2F9F5]">
              <span class="text-[12px] font-bold text-[#166534] bg-[#DCFCE7] py-1 px-3 rounded-full">
                Prioritas Rombel Utama
              </span>
            </div>
          </div>

          <!-- Gelombang 2 -->
          <div class="rv bg-white border border-[#D1E7DD] rounded-[24px] p-7 shadow-sm flex flex-col justify-between">
            <div>
              <span class="text-[11px] font-black uppercase text-[#55705F] bg-[#F2F9F5] py-1 px-3 rounded-full inline-block mb-4">
                Tahap 2
              </span>
              <h3 class="text-[22px] font-black text-[#063826] mb-1">Gelombang II</h3>
              <div class="text-[14px] font-bold text-[#55705F] mb-4">01 Jan – 24 Apr 2027</div>
              <ul class="space-y-2 text-[14px] text-[#55705F] pt-4 border-t border-[#F2F9F5]">
                <li>Tes Seleksi: <strong class="text-[#063826]">Ahad, 25 Apr 2027</strong></li>
                <li>Pengumuman: <strong class="text-[#063826]">28 Apr 2027</strong></li>
              </ul>
            </div>
            <div class="pt-4 mt-6 border-t border-[#F2F9F5]">
              <span class="text-[12px] font-bold text-[#55705F] bg-[#F2F9F5] py-1 px-3 rounded-full">
                Pendaftaran Reguler
              </span>
            </div>
          </div>

          <!-- Gelombang Tambahan -->
          <div class="rv bg-white border border-[#D1E7DD] rounded-[24px] p-7 shadow-sm flex flex-col justify-between">
            <div>
              <span class="text-[11px] font-black uppercase text-[#92400E] bg-[#FEF3C7] py-1 px-3 rounded-full inline-block mb-4">
                Sisa Kuota
              </span>
              <h3 class="text-[22px] font-black text-[#063826] mb-1">Gelombang Tambahan</h3>
              <div class="text-[14px] font-bold text-[#55705F] mb-4">26 Apr – 27 Jun 2027</div>
              <ul class="space-y-2 text-[14px] text-[#55705F] pt-4 border-t border-[#F2F9F5]">
                <li>Tes Seleksi: <strong class="text-[#063826]">Setiap Hari Ahad</strong></li>
                <li>Pengumuman: <strong class="text-[#063826]">2 Hari Setelah Tes</strong></li>
              </ul>
            </div>
            <div class="pt-4 mt-6 border-t border-[#F2F9F5]">
              <span class="text-[12px] font-bold text-[#92400E] bg-[#FEF3C7] py-1 px-3 rounded-full">
                Khusus Jika Kuota Tersisa
              </span>
            </div>
          </div>

        </div>

        <div class="bg-white border border-[#D1E7DD] rounded-[20px] p-5 sm:p-6 text-[14px] text-[#55705F] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-[#0E7A4E] stroke-current stroke-[2] fill-none shrink-0" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span><strong>Jam Pelayanan:</strong> Senin–Jumat 08.00–15.00 WIB · Sabtu–Ahad 09.00–14.00 WIB</span>
          </div>
          <a href="https://wa.me/6281210949978" target="_blank" rel="noopener noreferrer" class="text-[#0E7A4E] font-bold hover:underline">
            Konsultasi WhatsApp →
          </a>
        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 3. PERSYARATAN & BEASISWA MILAD KE-6 (Pure White Background) -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-white border-y border-[#E0ECE6]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Persyaratan Berkas (5 Cols) -->
          <div class="lg:col-span-5 bg-[#F2F9F5] border border-[#D1E7DD] rounded-[24px] p-7 sm:p-8">
            <span class="text-[12px] font-extrabold uppercase tracking-wider text-[#0E7A4E] block mb-2">Persyaratan</span>
            <h3 class="text-[22px] font-black text-[#063826] mb-4">Syarat Pendaftaran</h3>
            
            <ol class="space-y-3 text-[14.5px] text-[#0E241B]">
              <li class="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E0ECE6]">
                <span class="w-6 h-6 rounded-lg bg-[#E4F4EC] text-[#0E7A4E] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong class="text-[#063826] block">Biaya Registrasi Rp50.000</strong>
                  <span class="text-[12.5px] text-[#55705F]">Gratis bagi siswa berprestasi &amp; yatim.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E0ECE6]">
                <span class="w-6 h-6 rounded-lg bg-[#E4F4EC] text-[#0E7A4E] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong class="text-[#063826] block">Mengisi Formulir Online</strong>
                  <span class="text-[12.5px] text-[#55705F]">Melalui portal resmi SPMB BCA.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E0ECE6]">
                <span class="w-6 h-6 rounded-lg bg-[#E4F4EC] text-[#0E7A4E] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong class="text-[#063826] block">Fotokopi Ijazah / SKL (3 Lembar)</strong>
                  <span class="text-[12.5px] text-[#55705F]">Telah dilegalisir basah.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E0ECE6]">
                <span class="w-6 h-6 rounded-lg bg-[#E4F4EC] text-[#0E7A4E] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <strong class="text-[#063826] block">Fotokopi NISN &amp; Akta Kelahiran (3 Lembar)</strong>
                  <span class="text-[12.5px] text-[#55705F]">NISN 10 digit aktif.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E0ECE6]">
                <span class="w-6 h-6 rounded-lg bg-[#E4F4EC] text-[#0E7A4E] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                <div>
                  <strong class="text-[#063826] block">Fotokopi Kartu Keluarga (3 Lembar)</strong>
                  <span class="text-[12.5px] text-[#55705F]">NIK orang tua/wali valid.</span>
                </div>
              </li>
              <li class="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E0ECE6]">
                <span class="w-6 h-6 rounded-lg bg-[#E4F4EC] text-[#0E7A4E] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">6</span>
                <div>
                  <strong class="text-[#063826] block">Pas Foto Hitam Putih 3×4 (3 Lembar)</strong>
                  <span class="text-[12.5px] text-[#55705F]">Seragam sekolah asal.</span>
                </div>
              </li>
            </ol>
          </div>

          <!-- Beasiswa (7 Cols) -->
          <div class="lg:col-span-7">
            <span class="text-[12px] font-extrabold uppercase tracking-wider text-[#0E7A4E] block mb-2">Apresiasi &amp; Afirmasi</span>
            <h3 class="text-[22px] sm:text-[26px] font-black text-[#063826] mb-4">Beasiswa Milad BCA ke-6</h3>
            <p class="text-[#55705F] text-[15px] mb-6">
              Yayasan menyediakan 6 skema beasiswa untuk memastikan generasi berakhlak mulia dapat mengenyam pendidikan terbaik.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div class="bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] p-5">
                <strong class="text-[16px] font-black text-[#063826] block mb-1">Gratis Uang Pangkal</strong>
                <p class="text-[13px] text-[#55705F]">Untuk seluruh penerima beasiswa afirmasi.</p>
              </div>

              <div class="bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] p-5">
                <strong class="text-[16px] font-black text-[#063826] block mb-1">Siswa Berprestasi</strong>
                <p class="text-[13px] text-[#55705F]">Gratis SPP prestasi akademik, tahfidz, dan lomba.</p>
              </div>

              <div class="bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] p-5">
                <strong class="text-[16px] font-black text-[#063826] block mb-1">Yatim &amp; Anak Guru</strong>
                <p class="text-[13px] text-[#55705F]">Gratis SPP penuh untuk santri yatim dan putra/putri guru.</p>
              </div>

              <div class="bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] p-5">
                <strong class="text-[16px] font-black text-[#063826] block mb-1">Afirmasi KETM</strong>
                <p class="text-[13px] text-[#55705F]">Gratis SPP bagi keluarga prasejahtera (KIP/PKH).</p>
              </div>

              <div class="bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] p-5">
                <strong class="text-[16px] font-black text-[#063826] block mb-1">Seragam, Buku &amp; Kegiatan</strong>
                <p class="text-[13px] text-[#55705F]">Bantuan paket seragam, buku panduan, dan kegiatan.</p>
              </div>

              <div class="bg-[#F2F9F5] border border-[#D1E7DD] rounded-[20px] p-5">
                <strong class="text-[16px] font-black text-[#063826] block mb-1">Subsidi Silang 3 Tahun</strong>
                <p class="text-[13px] text-[#55705F]">Subsidi silang biaya pendidikan berkelanjutan.</p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ================================================================= -->
    <!-- 4. SECTION CTA FORMULIR ONLINE -->
    <!-- ================================================================= -->
    <section class="py-[80px] bg-[#F2F9F5]">
      <div class="max-w-[1180px] mx-auto px-5 lg:px-6">
        <div class="bg-[radial-gradient(700px_400px_at_85%_100%,rgba(52,199,123,0.45),transparent_65%),linear-gradient(135deg,#0A4A30_0%,#063826_55%,#052E22_100%)] text-white rounded-[24px] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span class="text-[12px] font-extrabold uppercase tracking-wider text-[#FCD34D] block mb-2">Formulir Online</span>
            <h2 class="text-[28px] md:text-[34px] font-black leading-tight mb-2">
              Amankan Kursimu di 7 Rombel Ini
            </h2>
            <p class="text-[#C4E4D4] text-[15px] max-w-xl">
              Klik tombol di bawah untuk mengisi formulir pendaftaran online SPMB 2027/2028.
            </p>
          </div>
          <NuxtLink 
            to="/spmb" 
            class="inline-flex items-center gap-2 font-extrabold text-[15px] py-3.5 px-8 rounded-[14px] text-[#3D2C00] bg-gradient-to-r from-[#F0B429] to-[#C98A12] shadow-lg hover:-translate-y-0.5 transition-all shrink-0"
          >
            Mulai Pendaftaran →
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>
