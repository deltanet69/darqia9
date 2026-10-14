<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'

const props = defineProps<{
  open: boolean
  title: string
  subtitle?: string
  wide?: boolean
  badge?: string
  icon?: string
}>()

const emit = defineEmits<{ close: [] }>()
const closeButton = ref<HTMLButtonElement | null>(null)

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) emit('close')
}

watch(
  () => props.open,
  async (open) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = open ? 'hidden' : ''
    }
    if (typeof window !== 'undefined') {
      if (open) {
        window.addEventListener('keydown', handleEscape)
        await nextTick()
        closeButton.value?.focus()
      } else {
        window.removeEventListener('keydown', handleEscape)
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape)
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 md:p-6 overflow-y-auto"
    >
      <!-- Backdrop Gelap dengan Blur Halus -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          class="fixed inset-0 bg-slate-950/65 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
          @click="emit('close')"
        />
      </Transition>

      <!-- Centered Modal Card (Keren, Modern, Mobile-First) -->
      <Transition
        enter-active-class="transition duration-200 ease-out transform"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in transform"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <section
          class="relative w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/30 border border-slate-200/90 z-10 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto font-admin"
          :class="wide ? 'max-w-2xl sm:max-w-3xl' : 'max-w-lg sm:max-w-xl'"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <!-- Header Sticky -->
          <header class="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-white/95 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0 sticky top-0 z-10">
            <div class="min-w-0 flex items-center gap-3 sm:gap-3.5">
              <div
                v-if="icon"
                class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80 shadow-xs"
              >
                <AdminIcon :name="icon" size="20" />
              </div>
              <div class="min-w-0">
                <div v-if="badge" class="mb-1">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {{ badge }}
                  </span>
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug truncate">
                  {{ title }}
                </h3>
                <p v-if="subtitle" class="text-xs sm:text-sm text-slate-500 font-medium truncate mt-0.5">
                  {{ subtitle }}
                </p>
              </div>
            </div>

            <!-- Tombol Tutup Touch Friendly -->
            <button
              ref="closeButton"
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer touch-manipulation"
              type="button"
              title="Tutup (Esc)"
              aria-label="Tutup dialog"
              @click="emit('close')"
            >
              <AdminIcon name="x" size="18" />
            </button>
          </header>

          <!-- Modal Body Scrollable (Font Sizing Nyaman, Tidak Terlalu Kecil) -->
          <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800 text-sm">
            <slot />
          </div>

          <!-- Modal Sticky Footer (Touch Friendly) -->
          <footer
            v-if="$slots.footer"
            class="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0"
          >
            <slot name="footer" />
          </footer>
        </section>
      </Transition>
    </div>
  </Teleport>
</template>
