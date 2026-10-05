<template>
  <div class="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col justify-between">
    <!-- ======= HEADER SPMB PORTAL ======= -->
    <header
      class="sticky top-0 z-40 w-full transition-all duration-300 border-b"
      :class="isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-200/80 py-3.5' : 'bg-white border-transparent py-4'"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 group" aria-label="Kembali ke portal yayasan">
          <img src="/asset/logo.png" alt="Logo Yayasan Darqia Attaqwa" class="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105">
          <div>
            <b class="block text-base font-extrabold text-slate-900 leading-tight">SPMB Terpadu</b>
            <small class="block text-xs font-semibold text-slate-500">Yayasan Darqia Attaqwa</small>
          </div>
        </NuxtLink>
        <div class="flex items-center gap-2.5">
          <button
            class="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition-all duration-200"
            @click="openTrackModal"
          >
            Cek Status
          </button>
          <NuxtLink
            to="/"
            class="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 rounded-xl transition-all duration-200"
          >
            Beranda
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <!-- ======= HERO PORTAL SPMB ======= -->
      <section class="relative overflow-hidden bg-gradient-to-b from-[#0F1E38] via-[#122748] to-[#0D192F] text-white py-16 sm:py-20">
        <!-- Background Glows -->
        <div class="absolute -top-24 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 text-blue-300 mb-6">
            Penerimaan Murid Baru • Tahun Ajaran 2027/2028
          </span>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-5">
            Penerimaan Murid Baru <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">2027/2028</span>
          </h1>
          <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Portal pendaftaran online resmi <strong class="text-white">SMP IT Bina Cendekia Assalam</strong> &amp; <strong class="text-white">SMK IT Attaqwa 9</strong> Babelan, Bekasi. Silakan pilih unit sekolah tujuan pendaftaran Anda di bawah ini.
          </p>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <span class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-slate-200">
              <svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5h.01M18 14.5h.01"/></svg>
              Biaya pendaftaran Rp300.000
            </span>
            <span class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-slate-200">
              <svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>
              Online 24 Jam
            </span>
            <span class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-slate-200">
              <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/><path d="M9.5 12l2 2 3.5-4"/></svg>
              Data Aman &amp; Terverifikasi
            </span>
          </div>
        </div>
      </section>

      <!-- ======= PILIHAN UNIT SEKOLAH (PORTAL CARD) ======= -->
      <section class="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <span class="inline-block text-xs font-black tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full uppercase mb-3">
            PILIH UNIT SEKOLAH
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Dua Jenjang Pendidikan Unggulan
          </h2>
          <p class="text-sm sm:text-base text-slate-600">
            Pilih jenjang pendidikan yang sesuai untuk membuka formulir pendaftaran khusus masing-masing sekolah.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <!-- KARTU SMP -->
          <div class="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 group">
            <div>
              <div class="flex items-center justify-between gap-4 mb-6">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-5 9 5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>
                </div>
                <span class="text-xs font-bold text-blue-700 bg-blue-100/80 px-3 py-1.5 rounded-full">Jenjang SMP</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-3">
                SMP IT Bina Cendekia Assalam
              </h3>
              <p class="text-sm text-slate-600 leading-relaxed mb-6">
                Pendidikan Islam Terpadu tingkat menengah pertama dengan fokus penguatan karakter, tahfidz Qur'an, dan literasi digital sejak dini.
              </p>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <svg class="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Khusus Lulusan SD / MI
                </li>
                <li class="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <svg class="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Program Tahsin &amp; Tahfidz Qur'an
                </li>
                <li class="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <svg class="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Jalur Lanjut Prioritas ke SMK IT Attaqwa 9
                </li>
              </ul>
            </div>
            <NuxtLink
              to="/spmb/smp"
              class="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              <span>Daftar SPMB SMP</span>
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </NuxtLink>
          </div>

          <!-- KARTU SMK -->
          <div class="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 group">
            <div>
              <div class="flex items-center justify-between gap-4 mb-6">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/><path d="M9.5 12l2 2 3.5-4"/></svg>
                </div>
                <span class="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-3 py-1.5 rounded-full">Jenjang SMK • Akreditasi A</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-3">
                SMK IT Attaqwa 9
              </h3>
              <p class="text-sm text-slate-600 leading-relaxed mb-6">
                Sekolah kejuruan teknologi informasi unggulan dengan 3 kompetensi keahlian siap kerja, kuliah, dan berwirausaha.
              </p>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <svg class="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Khusus Lulusan SMP / MTs
                </li>
                <li class="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <svg class="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  3 Jurusan: TKJ, PPLG / RPL, dan DKV
                </li>
                <li class="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <svg class="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Sertifikasi Industri &amp; Penyaluran Kerja
                </li>
              </ul>
            </div>
            <NuxtLink
              to="/spmb/smk"
              class="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              <span>Daftar SPMB SMK</span>
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ======= SECTION CEK STATUS PORTAL ======= -->
      <section class="pb-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div class="bg-gradient-to-r from-[#0A2A5C] via-[#0F3D8A] to-[#1E3A8A] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4 text-center sm:text-left">
            <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-extrabold tracking-tight">Sudah Melakukan Pendaftaran?</h3>
              <p class="text-sm text-slate-200">Lacak progres verifikasi pembayaran dan berkas SPMB SMP maupun SMK secara mandiri.</p>
            </div>
          </div>
          <button
            class="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-900 font-black text-sm hover:bg-blue-50 shadow-md transition-all duration-200"
            @click="openTrackModal"
          >
            <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <span>Cek Status Pendaftaran</span>
          </button>
        </div>
      </section>
    </main>

    <!-- ======= FOOTER ======= -->
    <footer class="bg-white border-t border-slate-200 py-6 text-slate-600 text-xs sm:text-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <span>&copy; 2026 Yayasan Darqia Attaqwa • SMP IT Bina Cendekia Assalam &amp; SMK IT Attaqwa 9 — Babelan, Kab. Bekasi</span>
        <span>Butuh bantuan? <a href="tel:02188886776" class="font-bold text-blue-600 hover:underline">021-88886776</a></span>
      </div>
    </footer>

    <!-- ======= MODAL CEK STATUS ======= -->
    <div v-if="modalTrack" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="mtTitle">
      <div class="fixed inset-0" @click="modalTrack = false"></div>
      <div class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-scaleUp">
        <button
          class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          @click="modalTrack = false"
          aria-label="Tutup"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        <h2 id="mtTitle" class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
          Cek Status Pendaftaran
        </h2>
        <p class="text-sm text-slate-600 mb-6">
          Masukkan ID pendaftaran SPMB Anda (SMP atau SMK) untuk melihat status verifikasi terkini.
        </p>

        <div class="mb-4">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">ID Pendaftaran</label>
          <input
            v-model="trackQuery"
            @keydown.enter="doTrack"
            type="text"
            placeholder="cth: SPMB27-SMP-XXXXXX / SPMB27-SMK-XXXXXX"
            class="w-full px-4 py-3 text-sm font-semibold uppercase bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
          >
        </div>

        <div class="mb-4">
          <button
            class="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
            @click="doTrack"
          >
            Lacak Sekarang
          </button>
        </div>

        <div v-if="trackNotFound" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
          ID pendaftaran tidak ditemukan di perangkat ini. Pastikan ID sudah benar atau periksa pada perangkat saat mendaftar.
        </div>
        
        <div v-if="trackResult" class="mt-6 pt-6 border-t border-slate-100">
          <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center mb-4">
            <small class="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">ID Pendaftaran</small>
            <div class="text-lg font-black text-blue-950 tracking-wider font-mono">{{ trackResult.id }}</div>
          </div>
          <dl class="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div class="bg-slate-50 p-3 rounded-xl"><dt class="text-slate-500 font-medium">Nama Siswa</dt><dd class="font-bold text-slate-800 mt-0.5">{{ trackResult.s_nama }}</dd></div>
            <div class="bg-slate-50 p-3 rounded-xl"><dt class="text-slate-500 font-medium">Jenjang</dt><dd class="font-bold text-slate-800 mt-0.5">{{ trackResult.jenjang }}</dd></div>
            <div v-if="trackResult.jurusan" class="bg-slate-50 p-3 rounded-xl col-span-2"><dt class="text-slate-500 font-medium">Jurusan</dt><dd class="font-bold text-blue-600 mt-0.5">{{ trackResult.jurusan }}</dd></div>
            <div class="bg-slate-50 p-3 rounded-xl"><dt class="text-slate-500 font-medium">Sekolah Asal</dt><dd class="font-bold text-slate-800 mt-0.5">{{ trackResult.s_sekolah }}</dd></div>
            <div class="bg-slate-50 p-3 rounded-xl"><dt class="text-slate-500 font-medium">Status</dt><dd class="font-bold text-blue-600 mt-0.5">{{ trackResult.status }}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSpmbForm } from '~/composables/useSpmbForm'

definePageMeta({ layout: 'default' })

useHead({
  title: 'SPMB 2027/2028 — Penerimaan Murid Baru Yayasan Darqia Attaqwa',
  meta: [
    { name: 'description', content: 'Penerimaan Murid Baru SMP IT Bina Cendekia Assalam dan SMK IT Attaqwa 9 Tahun Ajaran 2027/2028.' }
  ]
})

const isScrolled = ref(false)
const onScroll = () => { isScrolled.value = window.scrollY > 40 }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const {
  modalTrack,
  trackQuery,
  trackResult,
  trackNotFound,
  openTrackModal,
  doTrack
} = useSpmbForm('smk')
</script>
