<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="animated-x"
    :style="{ width: size, height: size }"
  >
    <path class="x-line-1" d="M18 6 6 18" />
    <path class="x-line-2" d="m6 6 12 12" />
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
.animated-x {
  color: inherit;
  transition: transform 0.3s ease;
}

.animated-x:hover {
  transform: rotate(90deg) scale(1.1);
}

.animated-x:hover .x-line-1 {
  animation: x-cross-1 0.3s ease-in-out;
}

.animated-x:hover .x-line-2 {
  animation: x-cross-2 0.3s ease-in-out;
}

@keyframes x-cross-1 {
  0% { transform: scale(1); }
  50% { transform: scale(0.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes x-cross-2 {
  0% { transform: scale(1); }
  50% { transform: scale(1.5); }
  100% { transform: scale(1); }
}
</style>
