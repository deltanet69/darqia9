<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="animated-chev-up"
    :style="{ width: size, height: size }"
  >
    <path class="chev-path" d="m18 15-6-6-6 6" />
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
.animated-chev-up {
  color: inherit;
}

.animated-chev-up:hover .chev-path {
  animation: bounce-up 0.8s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate;
}

@keyframes bounce-up {
  0% { transform: translateY(2px); }
  100% { transform: translateY(-4px); }
}
</style>
