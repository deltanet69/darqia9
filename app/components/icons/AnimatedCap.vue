<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="animated-cap"
    :style="{ width: size, height: size }"
  >
    <path class="cap-path-1" d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path class="cap-path-2" d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: '16px'
  }
})
</script>

<style scoped>
.animated-cap {
  color: inherit;
}

.animated-cap:hover {
  animation: cap-bounce 0.5s cubic-bezier(0.28, 0.84, 0.42, 1);
}

@keyframes cap-bounce {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}
</style>
