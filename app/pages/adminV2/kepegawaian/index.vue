<script setup lang="ts">
// Forward langsung ke Data Guru & Staff (Halaman Pokok Kepegawaian)
await navigateTo('/adminV2/guru', { replace: true })
</script>

<template>
  <div class="min-h-screen bg-[#F3F5F9] flex items-center justify-center p-4">
    <div class="text-sm font-semibold text-[#667085] animate-pulse">
      Memuat modul Kepegawaian...
    </div>
  </div>
</template>
