<script setup lang="ts">
import { computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import {
  initials,
  completeness,
  AVATAR_GRADIENTS,
  type ProfileAccount
} from './profilV2Data'

const props = defineProps<{
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
  (e: 'copy-text', text: string): void
  (e: 'upload-foto'): void
}>()

const comp = computed(() => completeness(props.profile))

// Lingkaran SVG: r = 34, Keliling = 2 * Math.PI * 34 ≈ 213.6
const ringCircumference = 2 * Math.PI * 34
const ringOffset = computed(() => {
  return (ringCircumference * (1 - comp.value.pct / 100)).toFixed(1)
})
</script>
<template>
  <section
    class="profil-v2-hero relative overflow-hidden rounded-[22px] p-[22px] text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] mb-4"
    style="background: radial-gradient(560px 260px at 88% -10%, rgba(56,189,248,.35), transparent 60%), radial-gradient(480px 300px at -10% 115%, rgba(29,78,216,.5), transparent 60%), linear-gradient(125deg,#0B1F3A 0%,#122E57 55%,#1D4ED8 130%);"
  >
    <!-- Highlight overlay -->
    <div
      class="pointer-events-none absolute inset-0"
      style="background: radial-gradient(700px 200px at 50% -30%, rgba(255,255,255,.14), transparent 65%);"
    />

    <div class="relative flex flex-col gap-4.5 sm:flex-row sm:items-center sm:justify-between">
      <!-- Sisi Kiri: Avatar & Info Akun -->
      <div class="flex flex-col items-start gap-4.5 sm:flex-row sm:items-center min-w-0">
        <!-- Avatar Wrapper -->
        <div class="relative shrink-0 w-[84px]">
          <div
            class="profil-v2-avatar flex h-[84px] w-[84px] items-center justify-center rounded-full bg-gradient-to-br text-[28px] font-bold tracking-wide text-white shadow-[0_0_0_3px_rgba(255,255,255,0.85),0_10px_22px_rgba(2,6,23,0.35)]"
            :class="AVATAR_GRADIENTS[themeIdx] || AVATAR_GRADIENTS[0]"
          >
            {{ initials(profile.name) }}
          </div>
          <!-- Online status dot -->
          <span
            class="absolute left-[64px] top-[2px] h-[15px] w-[15px] rounded-full border-[3px] border-[#0E2547] bg-[#34D399]"
            title="Akun Aktif"
          />
          <!-- Button Ganti Tema/Foto -->
          <button
            type="button"
            class="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0B1F3A] bg-white text-[#0B1F3A] shadow-md transition-transform hover:scale-110"
            aria-label="Ganti tema avatar atau foto"
            @click="emit('toggle-theme-picker')"
          >
            <AdminV2Icon name="pencil" :size="13" />
          </button>
        </div>

        <!-- Info Teks Akun -->
        <div class="min-w-0 flex-1">
          <h2 class="text-[21px] font-bold leading-tight tracking-tight text-white">
            {{ profile.name }}
          </h2>

          <p class="mt-1 text-[12.5px] font-semibold text-[#BCD2F7]">
            {{ profile.roleLabel }} &bull; {{ profile.unit }}
          </p>

          <!-- Chips Row -->
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-white/22 bg-white/13 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
              {{ profile.roleSys }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-white/22 bg-white/13 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
              <AdminV2Icon name="check" :size="12" />
              <span>Akun {{ profile.akun }}</span>
            </span>
          </div>

          <!-- Contact Pills -->
          <div class="mt-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-white/16 bg-white/8 px-3 py-1.5 font-semibold text-[#E7EEFB] transition hover:bg-white/16 active:scale-95"
              @click="emit('copy-text', profile.email)"
            >
              <AdminV2Icon name="mail" :size="14" />
              <span class="truncate max-w-[180px] sm:max-w-none">{{ profile.email }}</span>
              <em class="not-italic text-[10px] font-bold uppercase tracking-wider text-[#9FB9EA]">Salin</em>
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-white/16 bg-white/8 px-3 py-1.5 font-semibold text-[#E7EEFB] transition hover:bg-white/16 active:scale-95"
              @click="emit('copy-text', profile.wa)"
            >
              <AdminV2Icon name="phone" :size="14" />
              <span>{{ profile.wa }}</span>
              <em class="not-italic text-[10px] font-bold uppercase tracking-wider text-[#9FB9EA]">Salin</em>
            </button>
          </div>
        </div>
      </div>

      <!-- Sisi Kanan: Circular Completeness Ring & Action Button -->
      <div class="flex items-center justify-between sm:flex-col sm:items-center sm:justify-center gap-2 shrink-0 border-t border-white/15 pt-3 sm:border-t-0 sm:pt-0 sm:ml-auto">
        <!-- Radial Circular Ring -->
        <div class="relative h-[84px] w-[84px]">
          <svg class="h-full w-full -rotate-90" viewBox="0 0 84 84">
            <circle
              class="stroke-white/18"
              cx="42"
              cy="42"
              r="34"
              fill="none"
              stroke-width="7"
            />
            <circle
              class="stroke-[#38BDF8] transition-all duration-700"
              cx="42"
              cy="42"
              r="34"
              fill="none"
              stroke-width="7"
              stroke-linecap="round"
              :stroke-dasharray="ringCircumference.toFixed(1)"
              :stroke-dashoffset="ringOffset"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center text-center">
            <b class="text-[17px] font-bold text-white">{{ comp.pct }}%</b>
          </div>
        </div>

        <span class="text-[10.5px] font-bold uppercase tracking-wider text-[#BCD2F7]">
          Kelengkapan Profil
        </span>

        <!-- Tombol Edit / Simpan / Batal -->
        <div class="mt-1">
          <div v-if="isEditing" class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-bold text-[#0B1F3A] shadow-md transition hover:bg-white/90"
              @click="emit('save-edit')"
            >
              <AdminV2Icon name="check" :size="14" />
              <span>Simpan</span>
            </button>
            <button
              type="button"
              class="inline-flex min-h-9 items-center rounded-full border border-white/25 bg-white/12 px-4 text-xs font-bold text-white transition hover:bg-white/20"
              @click="emit('cancel-edit')"
            >
              Batal
            </button>
          </div>

          <button
            v-else
            type="button"
            class="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-[#0B1F3A] shadow-md transition hover:bg-white/90"
            @click="emit('start-edit')"
          >
            <AdminV2Icon name="pencil" :size="14" />
            <span>Edit Profil</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Theme Picker Dropdown Row (jika tombol pensil diklik) -->
    <div
      v-if="themeOpen"
      class="mt-4 flex flex-wrap items-center gap-3 border-t border-white/15 pt-3.5 text-xs font-semibold text-[#BCD2F7]"
    >
      <span>Tema avatar:</span>
      <div class="flex items-center gap-2">
        <button
          v-for="(_, idx) in AVATAR_GRADIENTS"
          :key="'th-' + idx"
          type="button"
          class="h-6 w-6 rounded-full border-2 bg-gradient-to-br transition-transform hover:scale-110"
          :class="[
            AVATAR_GRADIENTS[idx],
            themeIdx === idx ? 'border-white ring-2 ring-white/50 scale-110' : 'border-transparent'
          ]"
          :aria-label="'Tema avatar ' + (idx + 1)"
          @click="emit('update:themeIdx', idx)"
        />
      </div>
      <button
        type="button"
        class="ml-auto inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/30 bg-white/10 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-white/20"
        @click="emit('upload-foto')"
      >
        <AdminV2Icon name="upload" :size="13" />
        <span>Unggah foto</span>
      </button>
    </div>

    <!-- Hint Footer Persis Prototype -->
    <p class="relative mt-3.5 border-t border-white/14 pt-3 text-[11px] font-semibold leading-relaxed text-[#9FB9EA]">
      Yang dapat diubah: foto, alamat domisili, email &amp; nomor WhatsApp, dan kata sandi. Data induk (NIK, NIP, jabatan) dikunci — hanya diubah Admin TU.
    </p>
  </section>
</template>
