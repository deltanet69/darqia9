<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: Option[]
  align?: 'left' | 'right'
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const currentLabel = computed(() => {
  const hit = props.options.find(o => o.value === props.modelValue)
  return hit ? hit.label : props.options[0]?.label || ''
})

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (val: string) => {
  emit('update:modelValue', val)
  isOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block text-left">
    <button
      type="button"
      class="inline-flex items-center gap-2 bg-white border border-[#E7EBF2] rounded-full px-3.5 py-2 text-[13px] font-semibold text-[#344054] cursor-pointer min-h-[38px] whitespace-nowrap transition hover:border-[#C3CEDD] hover:bg-[#EFF2F7] focus:outline-none focus:ring-2"
      :class="jenjang === 'smp' ? 'focus:ring-[#16A34A]' : 'focus:ring-[#1B5FD9]'"
      @click.stop="toggleOpen"
    >
      <span>{{ currentLabel }}</span>
      <AdminV2Icon name="chev" :size="14" class="text-[#667085] transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>

    <div
      v-if="isOpen"
      class="absolute top-[calc(100%+6px)] z-30 min-w-[180px] max-w-[calc(100vw-32px)] bg-white border border-[#E7EBF2] rounded-[14px] shadow-[0_12px_32px_rgba(16,24,40,0.14)] p-1.5 animate-in fade-in zoom-in-95 duration-100"
      :class="align === 'right' ? 'right-0' : 'left-0'"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="flex items-center justify-between gap-2.5 w-full text-left px-3 py-2 rounded-[9px] text-[13px] font-semibold cursor-pointer transition"
        :class="[
          opt.value === modelValue
            ? jenjang === 'smp'
              ? 'bg-[#E7F6ED] text-[#166534] font-bold'
              : 'bg-[#E8F0FE] text-[#12459B] font-bold'
            : 'text-[#344054] hover:bg-[#EFF2F7]'
        ]"
        @click="selectOption(opt.value)"
      >
        <span class="truncate">{{ opt.label }}</span>
        <AdminV2Icon
          v-if="opt.value === modelValue"
          name="check"
          :size="14"
          :class="jenjang === 'smp' ? 'text-[#16A34A]' : 'text-[#1B5FD9]'"
        />
      </button>
    </div>
  </div>
</template>
