<template>
  <div style="background:#040814;min-height:100vh;display:grid;place-items:center;color:#93A4C4;font-family:sans-serif">
    Memuat TV Absensi...
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

await navigateTo('/absensi/10abc', { replace: true })
</script>
