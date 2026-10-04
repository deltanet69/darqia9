<template>
  <div class="exam-layout-wrapper">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Layout khusus CBT - Fokus tanpa header/footer navigasi publik
</script>

<style scoped>
.exam-layout-wrapper {
  min-height: 100svh;
  background-color: var(--bg, #F2F5FA);
}
</style>
