<template>
  <!-- ======= KONTAK & LOKASI ======= -->
  <section class="py-[64px] lg:py-[88px] bg-white" id="kontak">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <div class="text-center max-w-[700px] mx-auto mb-[36px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[7px] px-[14px] rounded-full mb-[16px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#1B5FD9]"></span>
          Kontak Kami
        </div>
        <h2 class="text-[clamp(26px,4.6vw,40px)] font-extrabold text-[#0F1E38] tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Hubungi <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Kami</span>
        </h2>
        <p class="text-[#5A6B8C] text-[clamp(15px,2.4vw,17.5px)] leading-[1.6]">
          Ada pertanyaan seputar SPMB atau sekolah? Silakan hubungi kami melalui kanal berikut.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-[28px]">
        <!-- Left Column: Contact Cards & Google Maps -->
        <div class="space-y-[16px]">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            <div class="flex items-start gap-[14px] bg-[#F5F8FF] border border-[#E3EAF7] rounded-[14px] p-[18px]">
              <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#E11D48] to-[#FB7185] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-pin"/></svg>
              </span>
              <div>
                <b class="text-[14px] font-bold text-[#0F1E38] block mb-[3px]">Alamat</b>
                <p class="text-[#5A6B8C] text-[13.5px] leading-[1.5]">Ujung Harapan Musholla Assalam, Kel. Bahagia, Kec. Babelan, Kab. Bekasi 17610</p>
              </div>
            </div>

            <div class="flex items-start gap-[14px] bg-[#F5F8FF] border border-[#E3EAF7] rounded-[14px] p-[18px]">
              <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#059669] to-[#34D399] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-phone"/></svg>
              </span>
              <div>
                <b class="text-[14px] font-bold text-[#0F1E38] block mb-[3px]">Telepon</b>
                <a href="tel:02188886776" class="text-[#1B5FD9] font-semibold text-[14px] hover:underline">021-88886776</a>
              </div>
            </div>

            <div class="flex items-start gap-[14px] bg-[#F5F8FF] border border-[#E3EAF7] rounded-[14px] p-[18px]">
              <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-mail"/></svg>
              </span>
              <div>
                <b class="text-[14px] font-bold text-[#0F1E38] block mb-[3px]">Email</b>
                <a href="mailto:smkitattaqwa09@gmail.com" class="text-[#1B5FD9] font-semibold text-[13px] hover:underline break-all">smkitattaqwa09@gmail.com</a>
              </div>
            </div>

            <div class="flex items-start gap-[14px] bg-[#F5F8FF] border border-[#E3EAF7] rounded-[14px] p-[18px]">
              <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#D97706] to-[#FBBF24] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-clock"/></svg>
              </span>
              <div>
                <b class="text-[14px] font-bold text-[#0F1E38] block mb-[3px]">Jam Layanan</b>
                <p class="text-[#5A6B8C] text-[13.5px] leading-[1.5]">Senin–Jumat, 07.00–15.00 WIB</p>
              </div>
            </div>
          </div>

          <!-- Google Maps Iframe -->
          <div class="rounded-[18px] overflow-hidden border border-[#E3EAF7] shadow-sm min-h-[280px]">
            <iframe 
              title="Peta SMK IT Attaqwa 9" 
              loading="lazy" 
              class="w-full h-[280px] border-0 block"
              src="https://www.google.com/maps?q=SMK+IT+Attaqwa+9+Babelan+Bekasi&output=embed"
            ></iframe>
          </div>
        </div>

        <!-- Right Column: Interactive Contact Form -->
        <form @submit.prevent="submitContactForm" class="bg-[#F5F8FF] border border-[#E3EAF7] rounded-[20px] p-[24px] lg:p-[28px]">
          <h4 class="text-[18px] font-bold text-[#0F1E38] mb-[6px]">Kirim Pesan</h4>
          <p class="text-[#5A6B8C] text-[14px] mb-[20px]">Isi formulir di bawah — pesan akan diteruskan ke email sekolah.</p>

          <div class="space-y-[14px]">
            <div>
              <label for="kf-name" class="block text-[13.5px] font-semibold text-[#0F1E38] mb-[6px]">Nama Lengkap</label>
              <input 
                id="kf-name" 
                v-model="contactForm.name" 
                type="text" 
                required 
                placeholder="Nama Anda"
                class="w-full border border-[#E3EAF7] rounded-[12px] py-[12px] px-[15px] text-[14.5px] bg-white outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/15 transition-all"
              >
            </div>

            <div>
              <label for="kf-phone" class="block text-[13.5px] font-semibold text-[#0F1E38] mb-[6px]">No. WhatsApp / Telepon</label>
              <input 
                id="kf-phone" 
                v-model="contactForm.phone" 
                type="tel" 
                placeholder="08xx-xxxx-xxxx"
                class="w-full border border-[#E3EAF7] rounded-[12px] py-[12px] px-[15px] text-[14.5px] bg-white outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/15 transition-all"
              >
            </div>

            <div>
              <label for="kf-type" class="block text-[13.5px] font-semibold text-[#0F1E38] mb-[6px]">Keperluan</label>
              <select 
                id="kf-type" 
                v-model="contactForm.subject"
                class="w-full border border-[#E3EAF7] rounded-[12px] py-[12px] px-[15px] text-[14.5px] bg-white outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/15 transition-all"
              >
                <option value="Informasi SPMB">Informasi SPMB</option>
                <option value="Informasi SMPIT BCA">Informasi SMPIT BCA</option>
                <option value="Informasi SMK IT Attaqwa 9">Informasi SMK IT Attaqwa 9</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label for="kf-msg" class="block text-[13.5px] font-semibold text-[#0F1E38] mb-[6px]">Pesan</label>
              <textarea 
                id="kf-msg" 
                v-model="contactForm.message" 
                required 
                rows="3"
                placeholder="Tulis pesan Anda..."
                class="w-full border border-[#E3EAF7] rounded-[12px] py-[12px] px-[15px] text-[14.5px] bg-white outline-none focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/15 transition-all resize-y"
              ></textarea>
            </div>

            <button 
              type="submit" 
              class="w-full inline-flex items-center justify-center gap-[8px] font-bold text-[15px] py-[13px] px-[20px] rounded-[12px] text-white bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] shadow-[0_12px_26px_rgba(27,95,217,.35)] hover:-translate-y-[1px] transition-all cursor-pointer"
            >
              <span>Kirim Pesan</span>
              <svg class="ai w-[16px] h-[16px]"><use href="#i-send"/></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const contactForm = ref({
  name: '',
  phone: '',
  subject: 'Informasi SPMB',
  message: ''
})

const submitContactForm = () => {
  const { name, phone, subject, message } = contactForm.value
  const subjectEncoded = encodeURIComponent(`[Website] ${subject} — ${name}`)
  const bodyEncoded = encodeURIComponent(`Nama: ${name}\nTelepon: ${phone || '-'}\nKeperluan: ${subject}\n\nPesan:\n${message}`)
  window.location.href = `mailto:smkitattaqwa09@gmail.com?subject=${subjectEncoded}&body=${bodyEncoded}`
}
</script>
