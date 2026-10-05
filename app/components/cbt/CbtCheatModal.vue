<template>
  <Teleport to="body">
    <div v-if="modal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn" @click.self="$emit('back-click', $event)">
      <div class="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-scaleUp space-y-4">
        <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">{{ modal.title }}</h3>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed" v-html="modal.desc"></p>
        
        <div v-if="modal.requiresPin" class="space-y-1.5 py-2">
          <input
            type="password"
            :value="modal.pin"
            @input="modal.pin = ($event.target as HTMLInputElement).value"
            placeholder="Masukkan kata sandi pengawas"
            autocomplete="off"
            class="w-full px-4 py-3 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
          />
          <div v-if="modal.pinError" class="text-xs font-bold text-red-600">Kata sandi pengawas salah!</div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            v-if="modal.cancelText"
            class="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition-all"
            @click="$emit('close')"
          >
            {{ modal.cancelText }}
          </button>
          <button
            type="button"
            v-if="!modal.fatal"
            class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all"
            :class="modal.btnClass === 'btn-danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'"
            @click="$emit('ok')"
          >
            {{ modal.okText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ModalState } from '~/composables/useCbtExam'

defineProps<{
  grade: string
  modal: ModalState
}>()

defineEmits<{
  (e: 'back-click', event: MouseEvent): void
  (e: 'close'): void
  (e: 'ok'): void
}>()
</script>
