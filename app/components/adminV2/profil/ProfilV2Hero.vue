<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import { inisial, hitungKelengkapan, type ProfilSaya } from '~/composables/profilCore'
import { AVATAR_GRADIENTS } from './profilV2Data'

const props = defineProps<{
  profile: ProfilSaya
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
  (e: 'upload-foto', file: File): void
}>()

const comp = computed(() => hitungKelengkapan(props.profile))

const inputFoto = ref<HTMLInputElement | null>(null)
const pilihFoto = (e: Event) => {
  const el = e.target as HTMLInputElement
  const file = el.files?.[0]
  if (file) emit('upload-foto', file)
  el.value = ''
}

// Format nama & peran agar tidak tampil raw email atau '-'
const namaTampil = computed(() => {
  const raw = props.profile.name || ''
  if (!raw || raw.includes('@')) {
    const bagian = raw.split('@')[0] || 'Administrator'
    return bagian.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  return raw
})

const peranTampil = computed(() => {
  if (props.profile.roleLabel && props.profile.roleLabel !== '-') return props.profile.roleLabel
  return props.profile.roleSys || 'Superadmin Utama'
})

const unitTampil = computed(() => {
  if (props.profile.unit && props.profile.unit !== '-') return props.profile.unit
  return 'Yayasan Darqia 9'
})

// Lingkaran SVG: r = 34, Keliling = 2 * Math.PI * 34 ≈ 213.6
const ringCircumference = 2 * Math.PI * 34
const ringOffset = computed(() => {
  return (ringCircumference * (1 - comp.value.pct / 100)).toFixed(1)
})
</script>

<template>
  <section
    class="relative overflow-hidden rounded-[22px] p-5 sm:p-6 text-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(27,95,217,0.3)] bg-gradient-to-br from-[#0B1F3A] via-[#122E57] to-[#1B5FD9] mb-4"
  >
    <!-- Watermark Shield Icon (No white border, subtle opacity) -->
    <div class="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 pointer-events-none text-white">
      <AdminV2Icon name="shield" :size="144" />
    </div>

    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <!-- Sisi Kiri: Avatar & Identitas Pegawai (Rapi & Terstruktur) -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
        <!-- Avatar Wrapper (Tanpa list/border putih) -->
        <div class="relative shrink-0">
          <div
            class="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-black text-white shadow-lg"
            :class="AVATAR_GRADIENTS[themeIdx] || AVATAR_GRADIENTS[0]"
          >
            <img
              v-if="profile.fotoUrl"
              :src="profile.fotoUrl"
              :alt="'Foto ' + namaTampil"
              class="h-full w-full rounded-2xl object-cover"
            >
            <span v-else>{{ inisial(namaTampil) }}</span>
          </div>

          <!-- Status Aktif Online Dot -->
          <span
            class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#10B981] ring-2 ring-[#0B1F3A]"
            title="Akun Aktif"
          />

          <!-- Tombol Ganti Tema/Foto -->
          <button
            type="button"
            class="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg bg-[#1B5FD9] hover:bg-[#154cb0] text-white shadow-md transition-all active:scale-95 cursor-pointer"
            aria-label="Ganti tema avatar atau foto"
            title="Ganti Tema atau Foto Profil"
            @click="emit('toggle-theme-picker')"
          >
            <AdminV2Icon name="pencil" :size="13" />
          </button>
        </div>

        <!-- Info Identitas Akun -->
        <div class="min-w-0 flex-1 space-y-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-2xl font-black tracking-tight text-white leading-tight">
              {{ namaTampil }}
            </h2>
            <span class="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
              <AdminV2Icon name="check" :size="11" />
              <span>Akun Aktif</span>
            </span>
          </div>

          <p class="text-[13px] font-semibold text-blue-200">
            {{ peranTampil }} &bull; {{ unitTampil }}
          </p>

          <!-- Badges & Contact Chips (Tanpa list/border putih) -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <span class="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-100">
              <AdminV2Icon name="shield" :size="12" class="text-blue-300" />
              <span>{{ profile.roleSys }}</span>
            </span>

            <!-- Tombol Email dengan Salin -->
            <button
              v-if="profile.email && profile.email !== '-'"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer"
              title="Klik untuk menyalin email"
              @click="emit('copy-text', profile.email)"
            >
              <AdminV2Icon name="mail" :size="13" class="text-blue-300" />
              <span class="truncate max-w-[200px] sm:max-w-none">{{ profile.email }}</span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-1.5 py-0.2 rounded">
                Salin
              </span>
            </button>

            <!-- Tombol WhatsApp dengan Salin -->
            <button
              v-if="profile.wa && profile.wa !== '-'"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer"
              title="Klik untuk menyalin nomor WhatsApp"
              @click="emit('copy-text', profile.wa)"
            >
              <AdminV2Icon name="phone" :size="13" class="text-emerald-300" />
              <span>{{ profile.wa }}</span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-1.5 py-0.2 rounded">
                Salin
              </span>
            </button>
            <span
              v-else
              class="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200"
            >
              <AdminV2Icon name="phone" :size="13" class="text-amber-300" />
              <span>No. WhatsApp Belum Diisi</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Sisi Kanan: Widget Kelengkapan Profil & Aksi Cepat (Rapi & Terstruktur) -->
      <div class="flex items-center gap-4 bg-white/10 rounded-2xl p-4 shrink-0 justify-between sm:justify-start">
        <!-- Radial Circular Ring (Tanpa garis putih kasar) -->
        <div class="relative h-[68px] w-[68px] shrink-0">
          <svg class="h-full w-full -rotate-90" viewBox="0 0 84 84">
            <circle
              class="stroke-white/10"
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
            <b class="text-[16px] font-black text-white tabular-nums">{{ comp.pct }}%</b>
          </div>
        </div>

        <div class="space-y-1.5">
          <span class="block text-[10.5px] font-extrabold uppercase tracking-wider text-blue-200">
            Kelengkapan Profil
          </span>
          <p class="text-[12px] text-white/90 font-medium">
            {{ comp.pct >= 100 ? 'Profil sudah lengkap' : `${comp.missing.length} data perlu dilengkapi` }}
          </p>

          <!-- Tombol Aksi: Edit Profil / Simpan / Batal -->
          <div>
            <div v-if="isEditing" class="flex items-center gap-1.5">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                @click="emit('save-edit')"
              >
                <AdminV2Icon name="check" :size="13" />
                <span>Simpan</span>
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                @click="emit('cancel-edit')"
              >
                Batal
              </button>
            </div>

            <button
              v-else
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-[#1B5FD9] hover:bg-[#154cb0] px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
              @click="emit('start-edit')"
            >
              <AdminV2Icon name="pencil" :size="13" />
              <span>Edit Profil</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Theme Picker Dropdown Panel (Tanpa list/border putih) -->
    <div
      v-if="themeOpen"
      class="relative z-10 mt-4 rounded-xl bg-black/25 p-3.5 text-xs font-semibold text-blue-100 flex flex-wrap items-center gap-3 animate-fade-in"
    >
      <span class="font-bold text-white">Pilih Tema Avatar:</span>
      <div class="flex items-center gap-2">
        <button
          v-for="(_, idx) in AVATAR_GRADIENTS"
          :key="'th-' + idx"
          type="button"
          class="h-6 w-6 rounded-lg bg-gradient-to-br transition-transform hover:scale-110 cursor-pointer"
          :class="[
            AVATAR_GRADIENTS[idx],
            themeIdx === idx ? 'ring-2 ring-[#38BDF8] scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
          ]"
          :aria-label="'Tema avatar ' + (idx + 1)"
          @click="emit('update:themeIdx', idx)"
        />
      </div>

      <button
        type="button"
        class="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
        @click="inputFoto?.click()"
      >
        <AdminV2Icon name="upload" :size="13" />
        <span>Unggah Foto Profil</span>
      </button>
      <input
        ref="inputFoto"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="pilihFoto"
      >
    </div>

    <!-- Bottom Guidance Strip (Tanpa horizontal list/border putih) -->
    <div class="relative z-10 mt-4 rounded-xl bg-black/25 px-4 py-2.5 text-[11.5px] font-medium leading-relaxed text-blue-100 flex items-start gap-2.5">
      <AdminV2Icon name="info" :size="15" class="text-blue-300 mt-0.5 shrink-0" />
      <span>
        <b>Informasi Pembaruan Mandiri:</b> Foto profil, alamat domisili, nomor WhatsApp, NIP, NUPTK, dan kata sandi dapat Anda ubah mandiri. Data pokok kepegawaian (NIK, jabatan resmi, nomor kartu RFID) dikunci demi integritas data dan hanya dapat diperbarui oleh Superadmin.
      </span>
    </div>
  </section>
</template>
