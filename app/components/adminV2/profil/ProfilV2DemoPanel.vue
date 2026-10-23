<script setup lang="ts">
import { ref } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { ProfileAccount } from './profilV2Data'

defineProps<{
  profile: ProfileAccount
  currentWho: string
}>()

const emit = defineEmits<{
  (e: 'switch-account', who: string): void
}>()

const isOpen = ref(false)
</script>

<template>
  <div class="fixed bottom-4 left-4 z-40 w-72 overflow-hidden rounded-2xl bg-[#0B1F3A] text-white shadow-2xl transition-all">
    <!-- Header Bar Collapsible -->
    <button
      type="button"
      class="flex w-full items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-white/5 cursor-pointer"
      @click="isOpen = !isOpen"
    >
      <b class="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#DCE6F5]">
        Simulasi Akun Login
      </b>
      <div class="flex items-center gap-2">
        <span class="rounded-md bg-[#F59E0B] px-1.5 py-0.5 text-[10px] font-extrabold text-[#231A00]">
          DEMO
        </span>
        <AdminV2Icon
          name="chev"
          :size="13"
          class="text-[#9FB3D9] transition-transform duration-200"
          :class="isOpen ? 'rotate-180' : ''"
        />
      </div>
    </button>

    <!-- Body Panel -->
    <div v-show="isOpen" class="border-t border-white/10 p-3.5 space-y-3">
      <div>
        <label class="block text-[10px] font-extrabold uppercase tracking-wider text-[#9FB3D9]">
          Login Sebagai Akun
        </label>
        <div class="mt-1.5 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            class="rounded-xl border p-2 text-center text-xs font-bold transition-colors"
            :class="currentWho === 'ridwan' ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('switch-account', 'ridwan')"
          >
            Super Admin
          </button>
          <button
            type="button"
            class="rounded-xl border p-2 text-center text-xs font-bold transition-colors"
            :class="currentWho === 'dewi' ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('switch-account', 'dewi')"
          >
            Admin Keuangan
          </button>
          <button
            type="button"
            class="rounded-xl border p-2 text-center text-xs font-bold transition-colors"
            :class="currentWho === 'budi' ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('switch-account', 'budi')"
          >
            Guru
          </button>
          <button
            type="button"
            class="rounded-xl border p-2 text-center text-xs font-bold transition-colors"
            :class="currentWho === 'tono' ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('switch-account', 'tono')"
          >
            Staff TU
          </button>
        </div>

        <p class="mt-2.5 text-[11px] leading-relaxed text-[#C7D5EE]">
          Aktif: <b class="text-white">{{ profile.name }}</b><br>
          <span class="text-[#9FB3D9]">{{ profile.roleLabel }} &bull; {{ profile.unit }}</span>
        </p>

        <p class="mt-1.5 text-[10px] text-[#9FB3D9] leading-tight">
          Pada environment produksi, profil otomatis terhubung dengan akun autentikasi pengguna saat ini.
        </p>
      </div>
    </div>
  </div>
</template>
