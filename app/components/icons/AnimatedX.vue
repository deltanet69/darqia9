<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="text-inherit transition-transform duration-300 hover:rotate-90 hover:scale-110 group"
    :style="{ width: size, height: size }"
  >
    <path class="group-hover:animate-xCross1" d="M18 6 6 18" />
    <path class="group-hover:animate-xCross2" d="m6 6 12 12" />
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
