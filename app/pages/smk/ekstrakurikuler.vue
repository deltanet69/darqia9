<script setup lang="ts">
// Halaman Ekstrakurikuler telah digabung ke dalam satu Halaman Akademik (/smk/akademik#ekskul)
await navigateTo('/smk/akademik#ekskul', { replace: true })
</script>

<template>
  <div class="min-h-screen bg-[#F5F8FF] flex items-center justify-center p-6 text-center">
    <div class="bg-white border border-[#E2ECF8] rounded-[20px] p-8 shadow-md max-w-md">
      <div class="w-12 h-12 rounded-full bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center mx-auto mb-4 animate-pulse">
        <svg class="w-6 h-6 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
      <h2 class="text-[18px] font-black text-[#061A3E] mb-2">Mengalihkan ke Halaman Akademik &amp; Ekskul...</h2>
      <p class="text-[14px] text-[#64748B] mb-4">Informasi ekstrakurikuler kini terintegrasi di halaman Akademik SMK IT Attaqwa 9.</p>
      <NuxtLink to="/smk/akademik#ekskul" class="text-[14px] font-bold text-[#1B5FD9] hover:underline">
        Klik di sini jika tidak beralih otomatis →
      </NuxtLink>
    </div>
  </div>
</template>
