<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="animated-send"
    :style="{ width: size, height: size }"
  >
    <path class="send-paper" d="M22 2 11 13" />
    <path class="send-paper" d="M22 2 15 22l-4-9-9-4 22-7z" />
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
.animated-send {
  color: inherit;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animated-send:hover {
  transform: translate(2px, -2px) scale(1.1);
}

.animated-send:hover .send-paper {
  animation: fly-away 0.6s ease-in-out forwards;
}

@keyframes fly-away {
  0% { transform: translate(0, 0); opacity: 1; }
  40% { transform: translate(10px, -10px); opacity: 0; }
  41% { transform: translate(-10px, 10px); opacity: 0; }
  100% { transform: translate(0, 0); opacity: 1; }
}
</style>
