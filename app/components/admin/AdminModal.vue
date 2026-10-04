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
    <div v-if="open" id="modal-root" class="show">
      <button class="modal-ov" type="button" aria-label="Tutup dialog" @click="emit('close')" />
      <section class="modal" :class="{ wide }" role="dialog" aria-modal="true" :aria-label="title">
        <header class="modal-h">
          <h3>{{ title }}</h3>
          <button ref="closeButton" class="icon-btn" type="button" aria-label="Tutup dialog" @click="emit('close')">
            <AdminIcon name="x" size="17" />
          </button>
        </header>
        <div class="modal-b"><slot /></div>
        <footer v-if="$slots.footer" class="modal-f"><slot name="footer" /></footer>
      </section>
    </div>
  </Teleport>
</template>
