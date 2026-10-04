<script setup lang="ts">
useHead({
  title: 'Kontak Kami — SMK IT Attaqwa 9',
  meta: [
    {
      name: 'description',
      content: 'Hubungi SMK IT Attaqwa 9 Babelan Bekasi. Layanan informasi pendaftaran SPMB, konsultasi jurusan, alamat, dan pertanyaan umum.'
    }
  ]
})

const infoKontak = [
  {
    label: 'Alamat',
    val: 'Ujung Harapan, Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17612',
    icon: 'pin'
  },
  {
    label: 'Telepon',
    val: '021-8888 6776',
    href: 'tel:02188886776',
    icon: 'tel'
  },
  {
    label: 'WhatsApp',
    val: '0812 1094 9978 • 0878 4748 8247',
    href: 'https://wa.me/6281210949978',
    icon: 'wa'
  },
  {
    label: 'Email',
    val: 'smkitattaqwa09@gmail.com',
    href: 'mailto:smkitattaqwa09@gmail.com',
    icon: 'mail'
  },
  {
    label: 'Jam Layanan',
    val: 'Senin–Jumat 08.00–15.00 • Sabtu–Ahad 09.00–14.00 WIB',
    icon: 'time'
  }
]

const form = ref({
  nama: '',
  kontak: '',
  topik: 'SPMB / Pendaftaran',
  pesan: ''
})

const isSubmitting = ref(false)
const showSuccess = ref(false)

const handleSubmit = () => {
  if (!form.value.nama || !form.value.kontak || !form.value.pesan) return
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    showSuccess.value = true
    form.value = {
      nama: '',
      kontak: '',
      topik: 'SPMB / Pendaftaran',
      pesan: ''
    }
    setTimeout(() => {
      showSuccess.value = false
    }, 6000)
  }, 400)
}

const faqs = ref([
  {
    q: 'Kapan SPMB 2027/2028 dibuka?',
    a: 'Tiga gelombang: Gelombang I (1 Sep – 26 Des 2026), Gelombang II (1 Jan – 24 Apr 2027), dan Gelombang Tambahan (26 Apr – 27 Jun 2027). Kuota hanya 7 rombel.',
    open: false
  },
  {
    q: 'Berapa biaya pendaftarannya?',
    a: 'Biaya registrasi Rp50.000 - gratis bagi siswa berprestasi dan siswa yatim. Tersedia juga berbagai skema beasiswa SPP.',
    open: false
  },
  {
    q: 'Jurusan apa saja yang tersedia?',
    a: 'Enam konsentrasi: AKL, OTKP (bidang Bisnis & Manajemen); TBSM, TKR (Teknik Otomotif); TKJ, DKV (Teknologi Informasi).',
    open: false
  },
  {
    q: 'Apakah ada beasiswa?',
    a: 'Ada - gratis uang pangkal, gratis SPP untuk siswa berprestasi / yatim / anak guru / KETM, gratis seragam, buku, dan biaya praktek, plus subsidi silang selama 3 tahun.',
    open: false
  },
  {
    q: 'Di mana lokasi sekolah?',
    a: 'Ujung Harapan, Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17612. Lihat kotak peta di atas atau hubungi kami untuk panduan rute.',
    open: false
  },
  {
    q: 'Bagaimana cara mendaftar?',
    a: 'Klik tombol "Daftar SPMB", isi formulir online, lalu lengkapi berkas persyaratan dan ikuti tes seleksi sesuai gelombang pilihanmu.',
    open: false
  }
])

const toggleFaq = (index: number) => {
  faqs.value[index].open = !faqs.value[index].open
}
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased flex flex-col">
    <SmkHeader />

    <main class="flex-1 pt-[104px] lg:pt-[112px]">
      <!-- Page Hero Header -->
      <section 
        class="text-white py-[48px] sm:py-[64px] border-b border-white/10 relative overflow-hidden"
        style="background: radial-gradient(900px 480px at 85% -10%, rgba(43,124,216,0.45), transparent 60%), linear-gradient(135deg, #0C2C61 0%, #0A2A5C 60%, #061A3E 100%); background-color: #0A2A5C;"
      >
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        <div class="w-[min(1180px,100%-40px)] mx-auto relative z-10">
          <div class="flex items-center gap-[8px] text-[13px] font-semibold text-[#A9BDDD] mb-[12px]">
            <NuxtLink to="/smk" class="hover:text-white transition-colors">Home</NuxtLink>
            <span>/</span>
            <b class="text-[#FCD34D]">Kontak Kami</b>
          </div>
          <h1 class="text-[clamp(28px,4vw,44px)] font-black tracking-tight leading-[1.15] mb-[12px]">
            Kontak Kami
          </h1>
          <p class="text-[#C9D8F2] text-[15.5px] sm:text-[17px] max-w-[620px] leading-relaxed">
            Ada pertanyaan? Hubungi kami langsung atau kirim pesan melalui formulir di bawah.
          </p>
        </div>
      </section>

      <!-- Main Kontak & Form Grid -->
      <section class="py-[64px] lg:py-[88px]">
        <div class="w-[min(1180px,100%-40px)] mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[36px] items-start mb-[64px]">
            <!-- Sisi Kiri: 5 Kartu Info Kontak + Mapbox -->
            <div class="space-y-[14px]">
              <div 
                v-for="info in infoKontak" 
                :key="info.label"
                class="bg-white border border-[#E3EAF7] rounded-[18px] p-[16px_20px] shadow-[0_4px_16px_rgba(10,42,92,.04)] flex items-start gap-[14px] hover:border-[#1B5FD9]/30 transition-all"
              >
                <div class="w-[40px] h-[40px] rounded-[12px] bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center shrink-0 mt-0.5">
                  <svg v-if="info.icon === 'pin'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/>
                    <circle cx="12" cy="10" r="2.6"/>
                  </svg>
                  <svg v-else-if="info.icon === 'tel'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5.5 4h3.6l1.9 4.8-2.4 1.4a12.5 12.5 0 005.2 5.2l1.4-2.4 4.8 1.9v3.6a2 2 0 01-2.1 2A16.5 16.5 0 013.5 6.1a2 2 0 012-2.1z"/>
                  </svg>
                  <svg v-else-if="info.icon === 'wa'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 12a8 8 0 10-14.7 4.4L4 20l3.7-1.2A8 8 0 0020 12z"/>
                    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>
                  </svg>
                  <svg v-else-if="info.icon === 'mail'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="5.5" width="18" height="13" rx="2.5"/>
                    <path d="M3.5 7.5L12 13l8.5-5.5"/>
                  </svg>
                  <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="8.3"/>
                    <path d="M12 7.5V12l3.3 2"/>
                  </svg>
                </div>

                <div class="flex-1">
                  <b class="block text-[12px] uppercase tracking-wider text-[#5A6B8C] font-extrabold mb-[2px]">
                    {{ info.label }}
                  </b>
                  <a 
                    v-if="info.href" 
                    :href="info.href" 
                    class="text-[14.5px] font-bold text-[#0A2A5C] hover:text-[#1B5FD9] transition-colors"
                  >
                    {{ info.val }}
                  </a>
                  <span v-else class="text-[14px] text-[#0A2A5C] font-medium leading-relaxed block">
                    {{ info.val }}
                  </span>
                </div>
              </div>

              <!-- Mapbox Visual Card -->
              <div class="bg-gradient-to-br from-[#0C2C61] to-[#0A2A5C] text-white rounded-[20px] p-[28px_24px] text-center flex flex-col items-center justify-center gap-3 shadow-[0_12px_32px_rgba(10,42,92,.15)]">
                <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg class="w-6 h-6 text-[#FCD34D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 21.5s-7.2-5.8-7.2-11.3a7.2 7.2 0 0114.4 0c0 5.5-7.2 11.3-7.2 11.3z"/>
                    <circle cx="12" cy="10" r="2.6"/>
                  </svg>
                </div>
                <div class="text-[14.5px] font-bold text-[#DCE7FA]">
                  Ujung Harapan, Babelan,<br>Kabupaten Bekasi
                </div>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=SMK+IT+Attaqwa+9+Babelan+Bekasi" 
                  target="_blank" 
                  rel="noopener"
                  class="inline-flex items-center gap-[6px] text-[13.5px] font-extrabold py-[9px] px-[20px] rounded-[11px] bg-white text-[#0A2A5C] hover:bg-[#FCD34D] transition-colors mt-1"
                >
                  <span>Buka di Google Maps</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            <!-- Sisi Kanan: Formulir Kirim Pesan -->
            <div class="bg-white border border-[#E3EAF7] rounded-[24px] p-[32px_24px] sm:p-[40px_36px] shadow-[0_16px_44px_rgba(10,42,92,.08)]">
              <span class="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#1B5FD9] block mb-[6px]">
                Formulir Pesan
              </span>
              <h2 class="text-[24px] sm:text-[28px] font-black text-[#0A2A5C] tracking-tight mb-[6px]">
                Kirim Pesan
              </h2>
              <p class="text-[#5A6B8C] text-[14px] mb-[24px]">
                Tim kami akan membalas maksimal 1×24 jam pada hari kerja.
              </p>

              <form @submit.prevent="handleSubmit" class="space-y-[18px]">
                <div>
                  <label for="cf-nama" class="block text-[13px] font-bold text-[#0A2A5C] mb-[6px]">Nama Lengkap</label>
                  <input 
                    id="cf-nama" 
                    v-model="form.nama" 
                    type="text" 
                    required 
                    placeholder="Nama lengkap Anda"
                    class="w-full bg-[#F5F8FF] border border-[#E3EAF7] focus:border-[#1B5FD9] focus:bg-white rounded-[12px] px-[16px] py-[11px] text-[14.5px] text-[#0F1E38] outline-hidden transition-all"
                  >
                </div>

                <div>
                  <label for="cf-kontak" class="block text-[13px] font-bold text-[#0A2A5C] mb-[6px]">No. WhatsApp / Email</label>
                  <input 
                    id="cf-kontak" 
                    v-model="form.kontak" 
                    type="text" 
                    required 
                    placeholder="08xx atau email@contoh.com"
                    class="w-full bg-[#F5F8FF] border border-[#E3EAF7] focus:border-[#1B5FD9] focus:bg-white rounded-[12px] px-[16px] py-[11px] text-[14.5px] text-[#0F1E38] outline-hidden transition-all"
                  >
                </div>

                <div>
                  <label for="cf-topik" class="block text-[13px] font-bold text-[#0A2A5C] mb-[6px]">Topik Pertanyaan</label>
                  <select 
                    id="cf-topik" 
                    v-model="form.topik"
                    class="w-full bg-[#F5F8FF] border border-[#E3EAF7] focus:border-[#1B5FD9] focus:bg-white rounded-[12px] px-[16px] py-[11px] text-[14.5px] text-[#0F1E38] outline-hidden transition-all"
                  >
                    <option value="SPMB / Pendaftaran">SPMB / Pendaftaran</option>
                    <option value="Biaya & Beasiswa">Biaya &amp; Beasiswa</option>
                    <option value="Jurusan">Konsentrasi Jurusan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label for="cf-pesan" class="block text-[13px] font-bold text-[#0A2A5C] mb-[6px]">Pesan</label>
                  <textarea 
                    id="cf-pesan" 
                    v-model="form.pesan" 
                    rows="4" 
                    required 
                    placeholder="Tulis pertanyaan Anda di sini..."
                    class="w-full bg-[#F5F8FF] border border-[#E3EAF7] focus:border-[#1B5FD9] focus:bg-white rounded-[12px] px-[16px] py-[11px] text-[14.5px] text-[#0F1E38] outline-hidden transition-all resize-y"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  :disabled="isSubmitting"
                  class="w-full py-[13px] px-[24px] rounded-[14px] font-extrabold text-[15px] text-white bg-gradient-to-r from-[#1B5FD9] to-[#0A2A5C] shadow-[0_10px_24px_rgba(27,95,217,.28)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>{{ isSubmitting ? 'Mengirim pesan...' : 'Kirim Pesan' }}</span>
                  <span v-if="!isSubmitting">→</span>
                </button>

                <!-- Status Berhasil -->
                <div 
                  v-if="showSuccess" 
                  class="bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] rounded-[12px] p-[14px] text-[13.5px] font-bold text-center animate-fade-in"
                >
                  ✓ Pesan terkirim! Terima kasih - tim kami akan segera menghubungi Anda.
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Section FAQ Accordion -->
      <section class="py-[64px] lg:py-[88px] bg-white border-t border-[#E3EAF7]">
        <div class="w-[min(880px,100%-40px)] mx-auto">
          <div class="text-center mb-[44px]">
            <span class="text-[12px] font-extrabold tracking-[0.14em] uppercase text-[#1B5FD9] block mb-[8px]">
              FAQ
            </span>
            <h2 class="text-[clamp(24px,3.2vw,34px)] font-black text-[#0A2A5C] tracking-tight">
              Pertanyaan Umum
            </h2>
          </div>

          <div class="space-y-[14px]">
            <div 
              v-for="(faq, i) in faqs" 
              :key="i"
              class="border border-[#E3EAF7] rounded-[18px] overflow-hidden transition-all bg-[#F5F8FF]"
            >
              <button 
                type="button" 
                class="w-full p-[18px_22px] flex items-center justify-between text-left font-extrabold text-[15.5px] text-[#0A2A5C] hover:text-[#1B5FD9] transition-colors cursor-pointer gap-4"
                @click="toggleFaq(i)"
              >
                <span>{{ faq.q }}</span>
                <span 
                  :class="[
                    'w-[28px] h-[28px] rounded-full bg-white border border-[#E3EAF7] flex items-center justify-center text-[13px] font-bold text-[#1B5FD9] shrink-0 transition-transform duration-200',
                    faq.open ? 'rotate-180 bg-[#1B5FD9] text-white border-[#1B5FD9]' : ''
                  ]"
                >
                  ▼
                </span>
              </button>
              
              <div 
                v-if="faq.open" 
                class="px-[22px] pb-[20px] text-[#5A6B8C] text-[14.5px] leading-relaxed border-t border-[#E3EAF7]/60 pt-[14px]"
              >
                <p>{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <SmkFooter />
  </div>
</template>
