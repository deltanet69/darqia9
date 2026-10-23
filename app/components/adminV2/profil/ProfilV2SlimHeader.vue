<script setup lang="ts">
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import {
  initials,
  AVATAR_GRADIENTS,
  type ProfileAccount
} from './profilV2Data'

defineProps<{
  profile: ProfileAccount
  themeIdx: number
  themeOpen: boolean
  isEditing: boolean
}>()

const emit = defineEmits<{
  (e: 'update:themeIdx', val: number): void
  (e: 'toggle-theme-picker'): void
  (e: 'start-edit'): void
  (e: 'save-edit'): void
  (e: 'cancel-edit'): void
  (e: 'upload-foto'): void
}>()
</script>

<template>
  <div class="space-y-3">
    <section class="flex flex-wrap items-center justify-between gap-3.5 rounded-2xl border border-[#E7EBF2] bg-white p-3.5 shadow-xs sm:p-4">
      <div class="flex items-center gap-3 min-w-0">
        <!-- Compact Avatar -->
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-xs"
          :class="AVATAR_GRADIENTS[themeIdx] || AVATAR_GRADIENTS[0]"
        >
          {{ initials(profile.name) }}
        </div>

        <div class="min-w-0">
          <h3 class="truncate text-sm font-extrabold text-[#101828]">
            {{ profile.name }}
          </h3>
          <p class="truncate text-xs font-semibold text-[#667085]">
            {{ profile.roleLabel }} &bull; {{ profile.unit }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7EBF2] text-[#667085] transition-colors hover:bg-[#F3F5F9] hover:text-[#101828]"
          aria-label="Ganti tema avatar atau foto"
          @click="emit('toggle-theme-picker')"
        >
          <AdminV2Icon name="pencil" :size="15" />
        </button>

        <template v-if="isEditing">
          <button
            type="button"
            class="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#1B5FD9] px-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#12459B]"
            @click="emit('save-edit')"
          >
            <AdminV2Icon name="check" :size="14" />
            <span>Simpan</span>
          </button>
          <button
            type="button"
            class="inline-flex min-h-9 items-center rounded-xl border border-[#D0D5DD] bg-white px-3.5 text-xs font-bold text-[#344054] shadow-xs hover:bg-[#F8FAFD]"
            @click="emit('cancel-edit')"
          >
            Batal
          </button>
        </template>

        <button
          v-else
          type="button"
          class="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#1B5FD9] px-3.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#12459B]"
          @click="emit('start-edit')"
        >
          <AdminV2Icon name="pencil" :size="14" />
          <span>Edit Profil</span>
        </button>
      </div>
    </section>

    <!-- Theme Picker Dropdown -->
    <div
      v-if="themeOpen"
      class="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E7EBF2] bg-white p-3.5 text-xs font-semibold text-[#667085] shadow-xs"
    >
      <span>Tema Avatar:</span>
      <div class="flex items-center gap-2">
        <button
          v-for="(_, idx) in AVATAR_GRADIENTS"
          :key="'slim-th-' + idx"
          type="button"
          class="h-6 w-6 rounded-full border-2 bg-gradient-to-br transition-transform hover:scale-110"
          :class="[
            AVATAR_GRADIENTS[idx],
            themeIdx === idx ? 'border-[#101828] ring-2 ring-[#101828]/20 scale-110' : 'border-transparent'
          ]"
          :aria-label="'Tema avatar ' + (idx + 1)"
          @click="emit('update:themeIdx', idx)"
        />
      </div>
      <button
        type="button"
        class="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#D0D5DD] bg-[#F8FAFD] px-3 py-1 text-xs font-bold text-[#344054] transition-colors hover:bg-[#EFF2F7]"
        @click="emit('upload-foto')"
      >
        <AdminV2Icon name="upload" :size="13" />
        <span>Unggah Foto Profil</span>
      </button>
    </div>
  </div>
</template>
