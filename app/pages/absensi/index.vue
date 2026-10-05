<script setup lang="ts">
definePageMeta({
  layout: false
})

await navigateTo('/absensi/10abc', { replace: true })
</script>

<template>
  <div class="bg-[#040814] min-h-screen grid place-items-center text-slate-400 font-sans">
    Memuat TV Absensi...
  </div>
</template>
