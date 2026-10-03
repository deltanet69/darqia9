<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="animated-sparkle"
    :style="{ width: size, height: size }"
  >
    <path
      class="sparkle-star"
      d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
    />
    <path class="sparkle-dot-1" d="M20 3v4" />
    <path class="sparkle-dot-2" d="M22 5h-4" />
    <path class="sparkle-dot-3" d="M4 17v2" />
    <path class="sparkle-dot-4" d="M5 18H3" />
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
.animated-sparkle {
  color: inherit;
}

.sparkle-star {
  transform-origin: center;
  animation: sparkle-spin 3s linear infinite, sparkle-pulse 1.5s ease-in-out infinite alternate;
}

.sparkle-dot-1, .sparkle-dot-2 {
  transform-origin: 20px 5px;
  animation: sparkle-blink 2s ease-in-out infinite;
}

.sparkle-dot-3, .sparkle-dot-4 {
  transform-origin: 4px 18px;
  animation: sparkle-blink 2s ease-in-out infinite 1s;
}

@keyframes sparkle-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(180deg); }
}

@keyframes sparkle-pulse {
  0% { transform: scale(0.8) rotate(0deg); }
  100% { transform: scale(1.1) rotate(45deg); }
}

@keyframes sparkle-blink {
  0%, 100% { opacity: 0.2; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>
