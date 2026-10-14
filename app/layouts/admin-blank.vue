<template>
  <div class="min-h-screen bg-[#F8FAFC] text-slate-900 font-admin antialiased selection:bg-blue-600 selection:text-white">
    <slot />
  </div>
</template>

<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'font-admin'
  }
})
</script>
