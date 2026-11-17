<template>
  <OrtuPresensi />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'ortu', middleware: 'ortu-sesi' })
useHead({ title: 'Presensi · Portal Orang Tua' })
</script>
