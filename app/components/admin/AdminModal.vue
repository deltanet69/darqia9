<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'

const props = defineProps<{ open: boolean; title: string; wide?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const closeButton = ref<HTMLButtonElement | null>(null)

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) emit('close')
}

watch(() => props.open, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    window.addEventListener('keydown', handleEscape)
    await nextTick()
    closeButton.value?.focus()
  } else {
    window.removeEventListener('keydown', handleEscape)
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <button class="fixed inset-0 cursor-default" type="button" aria-label="Tutup dialog" @click="emit('close')" />
      <section
        class="relative w-full bg-white rounded-3xl shadow-2xl border border-slate-100 z-10 max-h-[90vh] flex flex-col animate-scaleUp overflow-hidden"
        :class="wide ? 'max-w-3xl' : 'max-w-lg'"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
          <h3 class="text-lg font-black text-slate-900 tracking-tight">{{ title }}</h3>
          <button
            ref="closeButton"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            type="button"
            aria-label="Tutup dialog"
            @click="emit('close')"
          >
            <AdminIcon name="x" size="16" />
          </button>
        </header>
        <div class="p-5 sm:p-6 overflow-y-auto flex-1">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>
