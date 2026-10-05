<script setup lang="ts">
import AdminIcon from '~/components/admin/AdminIcon.vue'

withDefaults(defineProps<{ message: string; kind?: 'ok' | 'info' }>(), { kind: 'ok' })
</script>

<template>
  <Teleport to="body">
    <div v-if="message" class="fixed bottom-6 right-6 z-50 animate-fadeIn" aria-live="polite">
      <div
        class="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl border transition-all"
        :class="kind === 'ok' ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/25' : 'bg-slate-900 text-white border-slate-700'"
        role="status"
      >
        <span class="shrink-0"><AdminIcon :name="kind === 'ok' ? 'check' : 'alert'" size="16" /></span>
        <span>{{ message }}</span>
      </div>
    </div>
  </Teleport>
</template>
