<script setup lang="ts">
interface Props {
  message: string
  visible: boolean
}

defineProps<Props>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="visible"
      class="fixed z-[120] bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 bg-[#101828] text-white text-xs font-semibold py-2.5 px-5 rounded-full shadow-[0_10px_25px_-5px_rgba(16,24,40,0.3)] whitespace-nowrap max-w-[92vw] overflow-hidden text-ellipsis pointer-events-none"
    >
      {{ message }}
    </div>
  </Transition>
</template>
