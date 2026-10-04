<script setup lang="ts">
import AdminIcon from '~/components/admin/AdminIcon.vue'

withDefaults(defineProps<{ message: string; kind?: 'ok' | 'info' }>(), { kind: 'ok' })
</script>

<template>
  <Teleport to="body">
    <div v-if="message" id="toast-root" aria-live="polite">
      <div class="toast" :class="kind" role="status">
        <span class="ic"><AdminIcon :name="kind === 'ok' ? 'check' : 'alert'" size="15" /></span>
        {{ message }}
      </div>
    </div>
  </Teleport>
</template>
