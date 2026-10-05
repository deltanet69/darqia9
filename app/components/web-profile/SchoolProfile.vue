<template>
  <!-- ======= PROFIL SEKOLAH ======= -->
  <section class="py-[64px] lg:py-[88px]" id="profil">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <!-- Section Header -->
      <div class="text-center max-w-[700px] mx-auto mb-[32px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[7px] px-[14px] rounded-full mb-[16px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#1B5FD9]"></span>
          Profil Sekolah
        </div>
        <h2 class="text-[clamp(26px,4.6vw,40px)] font-extrabold text-[#0F1E38] tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Dua Jenjang, <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Satu Komitmen</span>
        </h2>
        <p class="text-[#5A6B8C] text-[clamp(15px,2.4vw,17.5px)] leading-[1.6]">
          SMP IT Bina Cendekia Assalam dan SMK IT Attaqwa 9 berada dalam satu kompleks pendidikan Perguruan Attaqwa di Babelan, Bekasi.
        </p>
      </div>

      <!-- Segmented Switcher -->
      <div class="flex flex-col items-center gap-[10px] mb-[24px]">
        <span class="text-[12px] font-extrabold tracking-[2px] uppercase text-[#5A6B8C]">Pilih Jenjang</span>
        <div class="relative grid grid-cols-2 bg-white border-[1.5px] border-[#E3EAF7] rounded-full p-[5px] shadow-[0_10px_30px_rgba(10,42,92,.08)] w-[min(100%,580px)]">
          <!-- Sliding Indicator -->
          <div 
            :class="[
              'absolute top-[5px] bottom-[5px] w-[calc(50%-5px)] rounded-full bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] shadow-[0_8px_20px_rgba(27,95,217,.35)] transition-transform duration-300 ease-[cubic-bezier(0.4,1.3,0.6,1)]',
              modelValue === 'smp' ? 'translate-x-full left-[5px]' : 'left-[5px] translate-x-0'
            ]"
          ></div>

          <button 
            type="button" 
            @click="setJenjang('smk')"
            :class="[
              'relative z-10 flex items-center justify-center gap-[8px] py-[12px] px-[8px] rounded-full font-extrabold text-[13.5px] sm:text-[14.5px] transition-colors duration-250 cursor-pointer',
              modelValue === 'smk' ? 'text-white' : 'text-[#5A6B8C] hover:text-[#1B5FD9]'
            ]"
          >
            <svg class="ai w-[18px] h-[18px] shrink-0"><use href="#i-school"/></svg>
            <span>SMK IT Attaqwa 9</span>
          </button>

          <button 
            type="button" 
            @click="setJenjang('smp')"
            :class="[
              'relative z-10 flex items-center justify-center gap-[8px] py-[12px] px-[8px] rounded-full font-extrabold text-[13.5px] sm:text-[14.5px] transition-colors duration-250 cursor-pointer',
              modelValue === 'smp' ? 'text-white' : 'text-[#5A6B8C] hover:text-[#1B5FD9]'
            ]"
          >
            <svg class="ai w-[18px] h-[18px] shrink-0"><use href="#i-bookopen"/></svg>
            <span>SMPIT Bina Cendekia Assalam</span>
          </button>
        </div>
      </div>

      <!-- Profil Interactive Panel (Dark Navy Card) -->
      <div class="relative bg-gradient-to-br from-[#0A2A5C] via-[#0F3D8A] to-[#1B5FD9] rounded-[28px] p-[22px_18px] sm:p-[32px_30px] lg:p-[40px_38px] text-white shadow-[0_24px_60px_rgba(10,42,92,.35)] overflow-hidden">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none"></div>

        <!-- SMK Active Content -->
        <div v-show="modelValue === 'smk'" class="relative z-10 space-y-[24px] animate-fadeIn">
          <!-- Stats Band -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-[12px] sm:gap-[14px]">
            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[18px_12px] text-center backdrop-blur-sm">
              <b class="block text-[clamp(26px,5vw,34px)] font-extrabold text-white">316+</b>
              <small class="block text-white/80 text-[12.5px] font-semibold mt-[4px]">Siswa Aktif</small>
            </div>
            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[18px_12px] text-center backdrop-blur-sm">
              <b class="block text-[clamp(26px,5vw,34px)] font-extrabold text-white">11</b>
              <small class="block text-white/80 text-[12.5px] font-semibold mt-[4px]">Tahun Berdiri<br>sejak 2015</small>
            </div>
            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[18px_12px] text-center backdrop-blur-sm">
              <b class="block text-[clamp(26px,5vw,34px)] font-extrabold text-white">3</b>
              <small class="block text-white/80 text-[12.5px] font-semibold mt-[4px]">Bidang Keahlian</small>
            </div>
            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[18px_12px] text-center backdrop-blur-sm">
              <b class="block text-[clamp(26px,5vw,34px)] font-extrabold bg-gradient-to-b from-[#FFEDA6] to-[#F0B429] bg-clip-text text-transparent">A</b>
              <small class="block text-white/80 text-[12.5px] font-semibold mt-[4px]">Akreditasi Unggul</small>
            </div>
          </div>

          <!-- Info Tiles -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px] lg:gap-[14px]">
            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-users"/></svg>
              </span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Kepala Sekolah</small>
                <b class="text-[14.5px] font-bold">H. ABD. MUIZ, M.Pd</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#0EA5E9] to-[#22D3EE] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-book"/></svg>
              </span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Kurikulum</small>
                <b class="text-[14.5px] font-bold">K13 &amp; Kurikulum Merdeka</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-shield"/></svg>
              </span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">NPSN</small>
                <b class="text-[14.5px] font-bold">69940449</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-phone"/></svg>
              </span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Telepon</small>
                <b class="text-[14.5px] font-bold">021-88886776</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#0EA5E9] to-[#22D3EE] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-mail"/></svg>
              </span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Email</small>
                <b class="text-[13px] font-bold break-all">smkitattaqwa09@gmail.com</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white grid place-items-center shrink-0">
                <svg class="ai w-[22px] h-[22px]"><use href="#i-pin"/></svg>
              </span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Alamat</small>
                <b class="text-[13px] font-bold">Ujung Harapan, Babelan, Kab. Bekasi 17610</b>
              </div>
            </div>
          </div>

          <!-- Visi & Misi Tab Box -->
          <div class="bg-white/8 border border-white/15 rounded-[18px] p-[18px] sm:p-[22px] backdrop-blur-md">
            <div class="flex gap-[8px] mb-[14px]">
              <button 
                type="button" 
                @click="activeSmkVmTab = 'visi'"
                :class="[
                  'py-[8px] px-[20px] rounded-full font-bold text-[13.5px] transition-all cursor-pointer',
                  activeSmkVmTab === 'visi' ? 'bg-white text-[#0A2A5C] shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                ]"
              >
                Visi
              </button>
              <button 
                type="button" 
                @click="activeSmkVmTab = 'misi'"
                :class="[
                  'py-[8px] px-[20px] rounded-full font-bold text-[13.5px] transition-all cursor-pointer',
                  activeSmkVmTab === 'misi' ? 'bg-white text-[#0A2A5C] shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                ]"
              >
                Misi
              </button>
            </div>

            <div v-if="activeSmkVmTab === 'visi'" class="text-white/90 text-[14.5px] leading-[1.75]">
              <p>"Terwujudnya SMK IT Attaqwa 9 yang <b>unggul dalam IMTAQ, terdepan dalam IPTEK</b>, serta menghasilkan lulusan yang benar, pintar, dan terampil."</p>
            </div>

            <div v-else class="text-white/90 text-[14.5px] leading-[1.75]">
              <ul class="list-disc pl-[20px] space-y-[6px]">
                <li>Menyelenggarakan pendidikan vokasi berbasis iman, takwa, dan akhlak mulia.</li>
                <li>Mengembangkan kompetensi teknologi informasi yang link &amp; match dengan dunia industri (DUDIKA).</li>
                <li>Membina kemandirian, kreativitas, dan jiwa kewirausahaan peserta didik.</li>
                <li>Mewujudkan budaya sekolah yang disiplin, bersih, dan berprestasi.</li>
              </ul>
            </div>
          </div>

          <div class="inline-flex items-center gap-[8px] bg-[#F0B429]/15 text-[#FFE3A1] border border-[#F0B429]/35 py-[6px] px-[14px] rounded-full text-[12px] font-medium">
            <svg class="ai w-[14px] h-[14px] shrink-0"><use href="#i-zap"/></svg>
            <span>Visi &amp; misi di atas adalah draf — akan disesuaikan dengan dokumen resmi sekolah.</span>
          </div>
        </div>

        <!-- SMP Active Content -->
        <div v-show="modelValue === 'smp'" class="relative z-10 space-y-[24px] animate-fadeIn">
          <!-- Stats Band -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-[12px] sm:gap-[14px]">
            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[18px_12px] text-center backdrop-blur-sm">
              <span class="w-[40px] h-[40px] mx-auto mb-[8px] rounded-[13px] bg-white/15 border border-white/20 grid place-items-center text-white"><svg class="ai w-[20px] h-[20px]"><use href="#i-school"/></svg></span>
              <b class="block text-[clamp(24px,4.5vw,30px)] font-extrabold text-white">SMP-IT</b>
              <small class="block text-white/80 text-[12.5px] font-semibold mt-[4px]">Islam Terpadu</small>
            </div>
            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[18px_12px] text-center backdrop-blur-sm">
              <span class="w-[40px] h-[40px] mx-auto mb-[8px] rounded-[13px] bg-white/15 border border-white/20 grid place-items-center text-white"><svg class="ai w-[20px] h-[20px]"><use href="#i-bookopen"/></svg></span>
              <b class="block text-[clamp(24px,4.5vw,30px)] font-extrabold text-white">Tahfidz</b>
              <small class="block text-white/80 text-[12.5px] font-semibold mt-[4px]">Program Unggulan</small>
            </div>
            <div class="bg-white/8 border border-white/15 rounded-[18px] p-[18px_12px] text-center backdrop-blur-sm">
              <span class="w-[40px] h-[40px] mx-auto mb-[8px] rounded-[13px] bg-white/15 border border-white/20 grid place-items-center text-white"><svg class="ai w-[20px] h-[20px]"><use href="#i-cap"/></svg></span>
              <b class="block text-[clamp(24px,4.5vw,30px)] font-extrabold bg-gradient-to-b from-[#FFEDA6] to-[#F0B429] bg-clip-text text-transparent">Dibuka</b>
              <small class="block text-white/80 text-[12.5px] font-semibold mt-[4px]">PMB 2026/2027</small>
            </div>
          </div>

          <!-- Info Tiles -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px] lg:gap-[14px]">
            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white grid place-items-center shrink-0"><svg class="ai w-[22px] h-[22px]"><use href="#i-school"/></svg></span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Nama Sekolah</small>
                <b class="text-[14px] font-bold">SMP IT Bina Cendekia Assalam</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#0EA5E9] to-[#22D3EE] text-white grid place-items-center shrink-0"><svg class="ai w-[22px] h-[22px]"><use href="#i-book"/></svg></span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Singkatan</small>
                <b class="text-[14.5px] font-bold">SMPIT BCA</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white grid place-items-center shrink-0"><svg class="ai w-[22px] h-[22px]"><use href="#i-shield"/></svg></span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Jenjang</small>
                <b class="text-[14.5px] font-bold">SMP Islam Terpadu</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white grid place-items-center shrink-0"><svg class="ai w-[22px] h-[22px]"><use href="#i-pin"/></svg></span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Lokasi</small>
                <b class="text-[14px] font-bold">Satu kompleks SMK IT Attaqwa 9</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#0EA5E9] to-[#22D3EE] text-white grid place-items-center shrink-0"><svg class="ai w-[22px] h-[22px]"><use href="#i-pin"/></svg></span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Alamat</small>
                <b class="text-[13px] font-bold">Ujung Harapan, Babelan, Kab. Bekasi 17610</b>
              </div>
            </div>

            <div class="flex items-start gap-[13px] bg-white rounded-[16px] p-[16px] text-[#0F1E38]">
              <span class="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#059669] to-[#34D399] text-white grid place-items-center shrink-0"><svg class="ai w-[22px] h-[22px]"><use href="#i-check"/></svg></span>
              <div>
                <small class="block text-[#5A6B8C] text-[11px] font-bold uppercase tracking-[0.7px]">Penerimaan Siswa Baru</small>
                <b class="text-[14px] font-bold text-[#16A34A]">Dibuka — T.A 2026/2027</b>
              </div>
            </div>
          </div>

          <!-- Visi & Misi Tab Box -->
          <div class="bg-white/8 border border-white/15 rounded-[18px] p-[18px] sm:p-[22px] backdrop-blur-md">
            <div class="flex gap-[8px] mb-[14px]">
              <button 
                type="button" 
                @click="activeSmpVmTab = 'tentang'"
                :class="[
                  'py-[8px] px-[20px] rounded-full font-bold text-[13.5px] transition-all cursor-pointer',
                  activeSmpVmTab === 'tentang' ? 'bg-white text-[#0A2A5C] shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                ]"
              >
                Tentang
              </button>
              <button 
                type="button" 
                @click="activeSmpVmTab = 'fokus'"
                :class="[
                  'py-[8px] px-[20px] rounded-full font-bold text-[13.5px] transition-all cursor-pointer',
                  activeSmpVmTab === 'fokus' ? 'bg-white text-[#0A2A5C] shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                ]"
              >
                Fokus Pembinaan
              </button>
            </div>

            <div v-if="activeSmpVmTab === 'tentang'" class="text-white/90 text-[14.5px] leading-[1.75]">
              <p>SMP Islam Terpadu Bina Cendekia Assalam adalah unit SMP dalam satu kompleks pendidikan bersama SMK IT Attaqwa 9. Mengusung semangat yang sama — <b>unggul dalam IMTAQ, terdepan dalam IPTEK</b> — dengan pembinaan tahsin &amp; tahfidz Qur'an, pembiasaan ibadah, dan penguatan literasi-digital sejak dini.</p>
            </div>

            <div v-else class="text-white/90 text-[14.5px] leading-[1.75]">
              <ul class="list-disc pl-[20px] space-y-[6px]">
                <li>Tahsin &amp; tahfidz Al-Qur'an sebagai program unggulan.</li>
                <li>Pembiasaan ibadah, akhlak, dan kepemimpinan (OSIS, pramuka).</li>
                <li>Penguatan literasi, numerasi, dan keterampilan komputer dasar.</li>
                <li>Jalur lanjut prioritas langsung ke SMK IT Attaqwa 9.</li>
              </ul>
            </div>
          </div>

          <div class="inline-flex items-center gap-[8px] bg-[#F0B429]/15 text-[#FFE3A1] border border-[#F0B429]/35 py-[6px] px-[14px] rounded-full text-[12px] font-medium">
            <svg class="ai w-[14px] h-[14px] shrink-0"><use href="#i-zap"/></svg>
            <span>Data detail SMPIT BCA (NPSN, kepala sekolah, jumlah siswa) menyusul — hubungi sekolah untuk info resmi.</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: 'smk' | 'smp'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'smk' | 'smp'): void
}>()

const setJenjang = (val: 'smk' | 'smp') => {
  emit('update:modelValue', val)
}

const activeSmkVmTab = ref<'visi' | 'misi'>('visi')
const activeSmpVmTab = ref<'tentang' | 'fokus'>('tentang')
</script>
