<template>
  <div class="min-h-screen bg-[#F5F8FF] text-[#0F1E38] font-sans antialiased overflow-x-hidden selection:bg-[#1B5FD9] selection:text-white">
    <!-- SVG Sprite for Icons -->
    <IconSprite />

    <!-- Header Overlay Resmi Yayasan -->
    <YayasanHeader />

    <main>
      <!-- Hero Section (Dark Navy Gradient) -->
      <YayasanHero />

      <!-- Running Ticker Marquee (Gold) -->
      <YayasanTicker />

      <!-- Tentang Yayasan & 3 Pilar Karakter (White) -->
      <YayasanAbout />

      <!-- Sekolah Naungan: SMP IT BCA & SMK IT Attaqwa 9 (Light Blue) -->
      <YayasanSchools />

      <!-- Kultur Pembinaan Kampus Assalam (White) -->
      <YayasanCampusCulture />

      <!-- Informasi PMB 2027/2028 (Dark Navy Gradient) -->
      <YayasanPmb />

      <!-- Kontak & Lokasi (White) -->
      <YayasanContact />
    </main>

    <!-- Footer Resmi Yayasan (Navy) -->
    <YayasanFooter />
  </div>
</template>

<script setup lang="ts">
import YayasanHeader from '~/components/yayasan/YayasanHeader.vue'
import YayasanHero from '~/components/yayasan/YayasanHero.vue'
import YayasanTicker from '~/components/yayasan/YayasanTicker.vue'
import YayasanAbout from '~/components/yayasan/YayasanAbout.vue'
import YayasanSchools from '~/components/yayasan/YayasanSchools.vue'
import YayasanCampusCulture from '~/components/yayasan/YayasanCampusCulture.vue'
import YayasanPmb from '~/components/yayasan/YayasanPmb.vue'
import YayasanContact from '~/components/yayasan/YayasanContact.vue'
import YayasanFooter from '~/components/yayasan/YayasanFooter.vue'

useHead({
  title: 'Yayasan Darqia Attaqwa — Membina Generasi Qur’ani untuk Prestasi Tinggi dan Akhlak Terpuji',
  meta: [
    {
      name: 'description',
      content: 'Portal resmi Yayasan Darqia Attaqwa Babelan, Kabupaten Bekasi. Menaungi SMP IT Bina Cendekia Assalam dan SMK IT Attaqwa 9. Unggul dalam IMTAQ, Terdepan dalam IPTEK.'
    }
  ]
})
</script>

<style scoped>
</style>
