<template>
  <!-- ======= KEGIATAN SEKOLAH ======= -->
  <section class="py-[64px] lg:py-[88px]" id="kegiatan">
    <div class="w-[min(1180px,100%-40px)] mx-auto">
      <div class="text-center max-w-[700px] mx-auto mb-[32px]">
        <div class="inline-flex items-center gap-[8px] text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#1B5FD9] bg-[#E8F0FE] py-[7px] px-[14px] rounded-full mb-[16px]">
          <span class="w-[7px] h-[7px] rounded-full bg-[#1B5FD9]"></span>
          Kegiatan
        </div>
        <h2 class="text-[clamp(26px,4.6vw,40px)] font-extrabold text-[#0F1E38] tracking-[-0.5px] leading-[1.2] mb-[12px]">
          Aktif di Dalam &amp; <span class="bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] bg-clip-text text-transparent">Luar Kelas</span>
        </h2>
        <p class="text-[#5A6B8C] text-[clamp(15px,2.4vw,17.5px)] leading-[1.6]">
          Pembinaan seimbang: akademik yang kuat, karakter islami yang kokoh, dan bakat yang tersalurkan.
        </p>
      </div>

      <!-- Kegiatan Tabs -->
      <div class="flex flex-wrap justify-center gap-[8px] mb-[28px]">
        <button 
          type="button" 
          @click="setTab('akademik')"
          :class="[
            'py-[10px] px-[22px] rounded-full font-bold text-[14.5px] transition-all cursor-pointer border',
            modelValue === 'akademik' ? 'bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] text-white border-transparent shadow-[0_10px_22px_rgba(27,95,217,.3)]' : 'bg-white border-[#E3EAF7] text-[#5A6B8C] hover:border-[#1B5FD9] hover:text-[#1B5FD9]'
          ]"
        >
          Akademik
        </button>
        <button 
          type="button" 
          @click="setTab('nonakademik')"
          :class="[
            'py-[10px] px-[22px] rounded-full font-bold text-[14.5px] transition-all cursor-pointer border',
            modelValue === 'nonakademik' ? 'bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] text-white border-transparent shadow-[0_10px_22px_rgba(27,95,217,.3)]' : 'bg-white border-[#E3EAF7] text-[#5A6B8C] hover:border-[#1B5FD9] hover:text-[#1B5FD9]'
          ]"
        >
          Non Akademik
        </button>
        <button 
          type="button" 
          @click="setTab('ekskul')"
          :class="[
            'py-[10px] px-[22px] rounded-full font-bold text-[14.5px] transition-all cursor-pointer border',
            modelValue === 'ekskul' ? 'bg-gradient-to-r from-[#1B5FD9] to-[#4C8DFF] text-white border-transparent shadow-[0_10px_22px_rgba(27,95,217,.3)]' : 'bg-white border-[#E3EAF7] text-[#5A6B8C] hover:border-[#1B5FD9] hover:text-[#1B5FD9]'
          ]"
        >
          Ekstrakurikuler
        </button>
      </div>

      <!-- Tab 1: Akademik -->
      <div v-show="modelValue === 'akademik'" class="grid grid-cols-1 md:grid-cols-2 gap-[14px] animate-fadeIn">
        <div class="flex items-start gap-[16px] bg-white border border-[#E3EAF7] rounded-[16px] p-[20px] shadow-sm hover:border-[#1B5FD9] transition-all">
          <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white grid place-items-center shrink-0"><svg class="ai w-[23px] h-[23px]"><use href="#i-bookopen"/></svg></span>
          <div>
            <b class="block text-[15.5px] font-bold text-[#0F1E38] mb-[4px]">Kurikulum Merdeka &amp; K13</b>
            <p class="text-[#5A6B8C] text-[13.5px] leading-[1.6]">Pembelajaran aktif, projek penguatan profil pelajar, dan asesmen berbasis kompetensi.</p>
          </div>
        </div>

        <div class="flex items-start gap-[16px] bg-white border border-[#E3EAF7] rounded-[16px] p-[20px] shadow-sm hover:border-[#1B5FD9] transition-all">
          <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white grid place-items-center shrink-0"><svg class="ai w-[23px] h-[23px]"><use href="#i-monitor"/></svg></span>
          <div>
            <b class="block text-[15.5px] font-bold text-[#0F1E38] mb-[4px]">Ujian Berbasis Komputer (CBT)</b>
            <p class="text-[#5A6B8C] text-[13.5px] leading-[1.6]">Penilaian digital yang cepat, transparan, dan paperless untuk seluruh mata pelajaran.</p>
          </div>
        </div>

        <div class="flex items-start gap-[16px] bg-white border border-[#E3EAF7] rounded-[16px] p-[20px] shadow-sm hover:border-[#1B5FD9] transition-all">
          <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#059669] to-[#34D399] text-white grid place-items-center shrink-0"><svg class="ai w-[23px] h-[23px]"><use href="#i-factory"/></svg></span>
          <div>
            <b class="block text-[15.5px] font-bold text-[#0F1E38] mb-[4px]">BLK &amp; Praktik Industri</b>
            <p class="text-[#5A6B8C] text-[13.5px] leading-[1.6]">Balai Latihan Kerja komunitas — praktik langsung dengan standar dunia industri.</p>
          </div>
        </div>

        <div class="flex items-start gap-[16px] bg-white border border-[#E3EAF7] rounded-[16px] p-[20px] shadow-sm hover:border-[#1B5FD9] transition-all">
          <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#D97706] to-[#FBBF24] text-white grid place-items-center shrink-0"><svg class="ai w-[23px] h-[23px]"><use href="#i-briefcase"/></svg></span>
          <div>
            <b class="block text-[15.5px] font-bold text-[#0F1E38] mb-[4px]">Prakerin &amp; BKK</b>
            <p class="text-[#5A6B8C] text-[13.5px] leading-[1.6]">Praktik kerja industri + Bursa Kerja Khusus yang menjembatani lulusan ke dunia kerja.</p>
          </div>
        </div>
      </div>

      <!-- Tab 2: Non Akademik -->
      <div v-show="modelValue === 'nonakademik'" class="grid grid-cols-1 md:grid-cols-2 gap-[14px] animate-fadeIn">
        <div class="flex items-start gap-[16px] bg-white border border-[#E3EAF7] rounded-[16px] p-[20px] shadow-sm hover:border-[#1B5FD9] transition-all">
          <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#059669] to-[#34D399] text-white grid place-items-center shrink-0"><svg class="ai w-[23px] h-[23px]"><use href="#i-book"/></svg></span>
          <div>
            <b class="block text-[15.5px] font-bold text-[#0F1E38] mb-[4px]">Tahsin &amp; Tahfidz Qur'an</b>
            <p class="text-[#5A6B8C] text-[13.5px] leading-[1.6]">Program unggulan pembinaan bacaan dan hafalan Al-Qur'an secara rutin dan terprogram.</p>
          </div>
        </div>

        <div class="flex items-start gap-[16px] bg-white border border-[#E3EAF7] rounded-[16px] p-[20px] shadow-sm hover:border-[#1B5FD9] transition-all">
          <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white grid place-items-center shrink-0"><svg class="ai w-[23px] h-[23px]"><use href="#i-mic"/></svg></span>
          <div>
            <b class="block text-[15.5px] font-bold text-[#0F1E38] mb-[4px]">Muhadhoroh &amp; Mabit</b>
            <p class="text-[#5A6B8C] text-[13.5px] leading-[1.6]">Latihan dakwah/pidato dan malam bina iman-takwa untuk penguatan karakter.</p>
          </div>
        </div>

        <div class="flex items-start gap-[16px] bg-white border border-[#E3EAF7] rounded-[16px] p-[20px] shadow-sm hover:border-[#1B5FD9] transition-all">
          <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#E11D48] to-[#FB7185] text-white grid place-items-center shrink-0"><svg class="ai w-[23px] h-[23px]"><use href="#i-drum"/></svg></span>
          <div>
            <b class="block text-[15.5px] font-bold text-[#0F1E38] mb-[4px]">Marawis, Hadroh &amp; Paduan Suara</b>
            <p class="text-[#5A6B8C] text-[13.5px] leading-[1.6]">Seni islami sebagai media dakwah dan penyalur bakat seni siswa.</p>
          </div>
        </div>

        <div class="flex items-start gap-[16px] bg-white border border-[#E3EAF7] rounded-[16px] p-[20px] shadow-sm hover:border-[#1B5FD9] transition-all">
          <span class="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#1B5FD9] to-[#4C8DFF] text-white grid place-items-center shrink-0"><svg class="ai w-[23px] h-[23px]"><use href="#i-flag"/></svg></span>
          <div>
            <b class="block text-[15.5px] font-bold text-[#0F1E38] mb-[4px]">OSIS, Pramuka &amp; Paskibra</b>
            <p class="text-[#5A6B8C] text-[13.5px] leading-[1.6]">Kawah kepemimpinan: organisasi siswa, kepramukaan, pasukan pengibar bendera, dan PMR.</p>
          </div>
        </div>
      </div>

      <!-- Tab 3: Ekstrakurikuler Grid -->
      <div v-show="modelValue === 'ekskul'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[12px] animate-fadeIn">
        <div v-for="(ekskul, idx) in ekskulList" :key="idx" class="flex items-center gap-[12px] bg-white border border-[#E3EAF7] rounded-[14px] p-[14px] font-bold text-[14px] text-[#0F1E38] hover:border-[#1B5FD9] hover:-translate-y-[2px] hover:shadow-md transition-all">
          <span class="w-[40px] h-[40px] rounded-[11px] bg-[#E8F0FE] text-[#1B5FD9] grid place-items-center shrink-0 shadow-sm">
            <svg class="ai w-[20px] h-[20px]"><use :href="'#' + ekskul.icon"/></svg>
          </span>
          <span>{{ ekskul.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: 'akademik' | 'nonakademik' | 'ekskul'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'akademik' | 'nonakademik' | 'ekskul'): void
}>()

const setTab = (val: 'akademik' | 'nonakademik' | 'ekskul') => {
  emit('update:modelValue', val)
}

// Ekstrakurikuler List
const ekskulList = [
  { name: 'OSIS', icon: 'i-users' },
  { name: 'Unggul Bahasa', icon: 'i-bookopen' },
  { name: 'Unggul Office', icon: 'i-laptop' },
  { name: 'BLK Informatika', icon: 'i-cpu' },
  { name: 'BKK & Prakerin', icon: 'i-briefcase' },
  { name: 'Rumah Bengkel', icon: 'i-wrench' },
  { name: 'Paduan Suara & Seni', icon: 'i-music' },
  { name: 'Pramuka & SMK Taruna', icon: 'i-tent' },
  { name: 'Paskibra & PMR', icon: 'i-flag' },
  { name: 'Tahsin & Tahfidz', icon: 'i-book' },
  { name: 'Marawis & Hadroh', icon: 'i-drum' },
  { name: 'Muhadhoroh & Mabit', icon: 'i-mic' },
  { name: 'Pencak Silat', icon: 'i-medal' }
]
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.35s ease-out forwards;
}
</style>
