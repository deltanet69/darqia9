<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="text-inherit transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:translate-x-[2px] hover:-translate-y-[2px] hover:scale-110 group"
    :style="{ width: size, height: size }"
  >
    <g class="group-hover:animate-flyAway">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 22-7z" />
    </g>
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
