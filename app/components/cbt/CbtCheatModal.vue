<template>
  <Teleport to="body">
    <div id="modal-root" v-if="modal.show" class="cbt-page cbt-modal-portal" :data-theme="grade.toLowerCase()">
      <div class="modal-back" @click.self="$emit('back-click', $event)">
        <div class="modal">
          <h3>{{ modal.title }}</h3>
          <p v-html="modal.desc"></p>
          <div v-if="modal.requiresPin" style="margin-bottom:20px">
            <input
              type="password"
              :value="modal.pin"
              @input="modal.pin = ($event.target as HTMLInputElement).value"
              class="inp"
              placeholder="Masukkan kata sandi pengawas"
              autocomplete="off"
            />
            <div v-if="modal.pinError" style="color:var(--red);font-size:12px;margin-top:6px;font-weight:700">Kata sandi pengawas salah!</div>
          </div>
          <div class="mrow">
            <button type="button" v-if="modal.cancelText" class="btn btn-ghost" @click="$emit('close')">{{ modal.cancelText }}</button>
            <button type="button" v-if="!modal.fatal" class="btn" :class="modal.btnClass || 'btn-primary'" @click="$emit('ok')">{{ modal.okText }}</button>
          </div>
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
