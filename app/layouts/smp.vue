<template>
  <div class="smp-theme bg-[#F2F9F5] text-[#0E241B] min-h-screen flex flex-col selection:bg-[#10B981] selection:text-white">
    <SmpHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <SmpFooter />
    <ChatbotAI />
  </div>
</template>

<script setup lang="ts">
import SmpHeader from '~/components/smp/SmpHeader.vue'
import SmpFooter from '~/components/smp/SmpFooter.vue'
import ChatbotAI from '~/components/ChatbotAI.vue'
</script>
