<script setup lang="ts">
import { ref } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { RoleKey, Jenjang, PersonaInfo } from './jadwalV2Data'

const props = defineProps<{
  role: RoleKey
  jenjang: Jenjang
  simMin: number
  persona: PersonaInfo
}>()

const emit = defineEmits<{
  (e: 'update:role', val: RoleKey): void
  (e: 'update:simMin', val: number): void
  (e: 'simulate-start'): void
}>()

const isOpen = ref(false)
</script>

<template>
  <div class="fixed bottom-4 left-4 z-40 w-72 overflow-hidden rounded-2xl bg-[#0B1F3A] text-white shadow-2xl transition-all">
    <!-- Header Bar Collapsible -->
    <button
      type="button"
      class="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-white/5"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-2">
        <span class="rounded-md bg-[#F59E0B] px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#231A00]">
          DEMO
        </span>
        <b class="text-[11px] font-extrabold uppercase tracking-wider text-[#DCE6F5]">
          Simulasi Peran &amp; Waktu
        </b>
      </div>
      <AdminV2Icon
        name="chev"
        :size="14"
        class="text-[#9FB3D9] transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- Body Panel -->
    <div v-show="isOpen" class="border-t border-white/10 p-3.5 space-y-3">
      <!-- Role Switcher -->
      <div>
        <label class="block text-[10px] font-extrabold uppercase tracking-wider text-[#9FB3D9]">
          Role Pengguna
        </label>
        <div class="mt-1.5 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            class="rounded-xl border p-2 text-center text-xs font-bold transition-colors"
            :class="role === 'operator' ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('update:role', 'operator')"
          >
            Operator
          </button>
          <button
            type="button"
            class="rounded-xl border p-2 text-center text-xs font-bold transition-colors"
            :class="role === 'wali' ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('update:role', 'wali')"
          >
            Wali Kelas
          </button>
          <button
            type="button"
            class="rounded-xl border p-2 text-center text-xs font-bold transition-colors"
            :class="role === 'guru' ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('update:role', 'guru')"
          >
            Guru
          </button>
          <button
            type="button"
            class="rounded-xl border p-2 text-center text-xs font-bold transition-colors"
            :class="role === 'staff' ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('update:role', 'staff')"
          >
            Staff
          </button>
        </div>

        <p class="mt-2 text-[11px] leading-relaxed text-[#C7D5EE]">
          Login sebagai <b class="text-white">{{ persona.name }}</b><br>
          <span class="text-[#9FB3D9]">{{ persona.label }} &bull; {{ jenjang.toUpperCase() }}</span>
        </p>
      </div>

      <!-- Time Simulator Switcher (Jumat) -->
      <div>
        <label class="block text-[10px] font-extrabold uppercase tracking-wider text-[#9FB3D9]">
          Waktu Simulasi (Jumat)
        </label>
        <div class="mt-1.5 grid grid-cols-3 gap-1.5">
          <button
            type="button"
            class="rounded-xl border p-1.5 text-center text-[11px] font-bold transition-colors"
            :class="simMin === 490 ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('update:simMin', 490)"
          >
            08:10<br><span class="text-[9px] font-normal opacity-80">Sebelum</span>
          </button>
          <button
            type="button"
            class="rounded-xl border p-1.5 text-center text-[11px] font-bold transition-colors"
            :class="simMin === 504 ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('update:simMin', 504)"
          >
            08:24<br><span class="text-[9px] font-normal opacity-80">Jendela</span>
          </button>
          <button
            type="button"
            class="rounded-xl border p-1.5 text-center text-[11px] font-bold transition-colors"
            :class="simMin === 532 ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white' : 'border-[#24406E] bg-[#13294D] text-[#DCE6F5] hover:bg-[#1A3866]'"
            @click="emit('update:simMin', 532)"
          >
            08:52<br><span class="text-[9px] font-normal opacity-80">Lewat</span>
          </button>
        </div>
      </div>

      <!-- Quick Action Simulate Start -->
      <button
        type="button"
        class="w-full rounded-xl bg-[#F59E0B] p-2.5 text-xs font-extrabold text-[#231A00] shadow-sm transition-transform hover:scale-[1.02]"
        @click="emit('simulate-start')"
      >
        Simulasikan Mulai Mengajar
      </button>

      <p class="text-[10px] text-[#9FB3D9] leading-tight">
        Target: Budi Hartono &bull; Mat. Terapan XII TKJ 1 (08:30-09:15). Tombol aktif 10 mnt sebelum s.d. 10 mnt sesudah jam mulai.
      </p>
    </div>
  </div>
</template>
