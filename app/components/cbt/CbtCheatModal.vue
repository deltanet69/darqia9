<template>
  <Teleport to="body">
    <div
      v-if="modal.show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      @click.self="$emit('back-click', $event)"
    >
      <div
        class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_-15px_rgba(220,38,38,0.4)] border-2 z-10 animate-scaleUp space-y-5 overflow-hidden text-slate-900"
        :class="[
          modal.level === 3 || modal.fatal ? 'border-rose-600 ring-4 ring-rose-300/50' :
          modal.level === 2 ? 'border-orange-500 ring-4 ring-orange-200/60' :
          'border-amber-400 ring-4 ring-amber-100'
        ]"
      >
        <!-- Security Siren Header Bar -->
        <div
          class="flex items-center justify-between p-3.5 rounded-2xl"
          :class="[
            modal.level === 3 || modal.fatal ? 'bg-rose-50 border border-rose-200 text-rose-950' :
            modal.level === 2 ? 'bg-orange-50 border border-orange-200 text-orange-950' :
            'bg-amber-50 border border-amber-200 text-amber-950'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="relative flex h-3.5 w-3.5 shrink-0" title="Sistem Keamanan Aktif">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                :class="modal.level === 3 || modal.fatal ? 'bg-rose-500' : modal.level === 2 ? 'bg-orange-500' : 'bg-amber-500'"
              />
              <span
                class="relative inline-flex rounded-full h-3.5 w-3.5"
                :class="modal.level === 3 || modal.fatal ? 'bg-rose-600' : modal.level === 2 ? 'bg-orange-600' : 'bg-amber-600'"
              />
            </span>
            <div>
              <div class="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <span>{{ modal.badge || (modal.fatal ? 'SECURITY ALERT: LOCKDOWN' : 'ANTI-CHEAT SYSTEM: WARNING') }}</span>
              </div>
              <div class="text-[10.5px] font-mono text-slate-500">
                Log Event: {{ currentTimestamp }} &bull; Sesi ID: ATQ-SEC-992
              </div>
            </div>
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border"
            :class="[
              modal.level === 3 || modal.fatal ? 'bg-rose-600 text-white border-rose-700' :
              modal.level === 2 ? 'bg-orange-600 text-white border-orange-700' :
              'bg-amber-500 text-white border-amber-600'
            ]"
          >
            {{ modal.level === 3 || modal.fatal ? 'BLOKIR PERMANEN' : modal.level === 2 ? 'WASPADA TINGGI' : 'KUNCI SEMENTARA' }}
          </span>
        </div>

        <!-- Title & Icon -->
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md font-black text-xl"
            :class="[
              modal.level === 3 || modal.fatal ? 'bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-rose-500/30' :
              modal.level === 2 ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-orange-500/30' :
              'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30'
            ]"
          >
            <svg v-if="modal.level === 3 || modal.fatal" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <svg v-else-if="modal.level === 2" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              {{ modal.title }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1" v-html="modal.desc" />
          </div>
        </div>

        <!-- PIN Input Box for Proctor Unlock (Level 1 & 2 only) -->
        <div v-if="modal.requiresPin && !modal.fatal" class="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password Pengawas / Proktor
            </label>
            <button
              type="button"
              class="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              @click="fillProctorPin"
            >
              Isi Password (cbt)
            </button>
          </div>

          <div class="relative">
            <input
              type="password"
              :value="modal.pin"
              placeholder="Masukkan password pengawas (contoh: cbt)"
              autocomplete="off"
              class="w-full px-4 py-3 text-sm font-mono bg-white border-2 rounded-xl outline-none transition-all"
              :class="modal.pinError ? 'border-rose-500 bg-rose-50/50 text-rose-900' : 'border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'"
              @input="modal.pin = ($event.target as HTMLInputElement).value; modal.pinError = false"
              @keydown.enter.prevent="$emit('ok')"
            />
          </div>
          <div v-if="modal.pinError" class="text-xs font-bold text-rose-600 flex items-center gap-1.5 animate-fadeIn">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Password pengawas salah! (Gunakan kata sandi: <b>cbt</b>).</span>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            v-if="modal.cancelText"
            type="button"
            class="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            @click="$emit('close')"
          >
            {{ modal.cancelText }}
          </button>
          <button
            type="button"
            class="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            :class="[
              modal.level === 3 || modal.fatal ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 shadow-rose-600/40 hover:from-rose-700 hover:to-red-900' :
              modal.level === 2 ? 'bg-gradient-to-r from-orange-600 to-red-600 shadow-orange-600/30 hover:from-orange-700 hover:to-red-700' :
              'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/30'
            ]"
            @click="$emit('ok')"
          >
            <span>{{ modal.okText }}</span>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ModalState } from '~/composables/useCbtExam'

const props = defineProps<{
  grade: string
  modal: ModalState
}>()

const emit = defineEmits<{
  (e: 'back-click', event: MouseEvent): void
  (e: 'close'): void
  (e: 'ok'): void
}>()

const currentTimestamp = computed(() => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} WIB`
})

const fillProctorPin = () => {
  props.modal.pin = 'cbt'
  props.modal.pinError = false
}
</script>
