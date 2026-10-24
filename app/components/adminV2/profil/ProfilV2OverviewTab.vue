<script setup lang="ts">
import { computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import {
  completeness,
  MODULES,
  MODULE_INFO,
  ACCESS,
  ACTIVITIES,
  type ProfileAccount,
  type ProfileTabKey
} from './profilV2Data'

const props = defineProps<{
  profile: ProfileAccount
}>()

const emit = defineEmits<{
  (e: 'navigate-tab', tab: ProfileTabKey): void
}>()

const comp = computed(() => completeness(props.profile))

// Big Circular Ring SVG: r = 52, Keliling = 2 * Math.PI * 52 ≈ 326.72
const bigCircumference = 2 * Math.PI * 52
const bigOffset = computed(() => {
  return (bigCircumference * (1 - comp.value.pct / 100)).toFixed(1)
})

const userAccess = computed(() => ACCESS[props.profile.roleSys] || {})
const accessibleModules = computed(() => MODULES.filter(m => userAccess.value[m]))
const userActivities = computed(() => ACTIVITIES[props.profile.id] || [])
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <!-- Card 1: Kelengkapan Profil (.bt-a: 2 col, 2 row) -->
    <div class="sm:col-span-2 sm:row-span-2 flex flex-col items-center text-center justify-between rounded-[18px] border border-[#E7EBF2] bg-white p-[18px] shadow-sm">
      <span class="w-full text-left text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#667085] mb-2.5">
        Kelengkapan Profil
      </span>

      <!-- Big Radial Ring (132x132px) -->
      <div class="relative my-2 h-[132px] w-[132px]">
        <svg class="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            class="stroke-[#EFF2F7]"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke-width="9"
          />
          <circle
            class="stroke-[#38BDF8] transition-all duration-700"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke-width="9"
            stroke-linecap="round"
            :stroke-dasharray="bigCircumference.toFixed(1)"
            :stroke-dashoffset="bigOffset"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <b class="text-[30px] font-bold text-[#101828]">{{ comp.pct }}</b>
          <span class="text-[15px] font-semibold text-[#667085] ml-0.5">%</span>
        </div>
      </div>

      <!-- Missing Fields -->
      <div class="w-full">
        <div v-if="comp.missing.length" class="text-[11px] font-semibold text-[#667085]">
          Belum terisi:
          <span
            v-for="m in comp.missing"
            :key="m"
            class="ml-1 inline-block rounded-md border border-[#FEDF89] bg-[#FFFAEB] px-1.5 py-0.5 text-[10.5px] font-bold text-[#B54708]"
          >
            {{ m }}
          </span>
        </div>
        <div v-else class="text-[11px] font-bold text-[#067647]">
          Semua data pokok lengkap. Profil Anda siap.
        </div>

        <button
          type="button"
          class="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-bold text-[#101828] hover:text-[#1B5FD9] transition"
          @click="emit('navigate-tab', 'dataprofil')"
        >
          <span>Lengkapi di Data Profil</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>

    <!-- Card 2: Smartcard Presensi (.bt-b: 2 col) -->
    <div class="sm:col-span-2 flex flex-col justify-center rounded-[18px] border border-[#E7EBF2] bg-white p-[18px] shadow-sm">
      <span class="text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#667085] mb-2.5">
        Smartcard Presensi
      </span>

      <div class="flex items-center gap-3 rounded-[14px] bg-gradient-to-r from-[#0E2547] to-[#1D4ED8] p-3.5 text-white">
        <div class="h-[22px] w-[30px] shrink-0 rounded-[5px] bg-gradient-to-br from-[#FDE68A] to-[#F59E0B] shadow-[inset_0_0_0_2px_rgba(146,64,14,0.35)]" />
        <div class="min-w-0 flex-1">
          <b class="block text-[13.5px] font-bold">
            {{ profile.rfid === '-' ? 'Belum Terhubung' : 'Terhubung' }}
          </b>
          <span class="block font-mono text-[11px] text-[#BCD2F7] mt-0.5">
            {{ profile.rfid }} &bull; tap terakhir 06:38 WIB
          </span>
        </div>
        <div class="shrink-0 text-[#BCD2F7]">
          <AdminV2Icon name="wifi" :size="20" />
        </div>
      </div>
    </div>

    <!-- Card 3: Modul Diakses (.bt-c: 1 col) -->
    <div class="sm:col-span-1 flex flex-col justify-between rounded-[18px] border border-[#E7EBF2] bg-white p-[18px] shadow-sm">
      <span class="text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#667085]">
        Modul Diakses
      </span>
      <div class="my-1 text-2xl font-bold text-[#101828] leading-tight">
        {{ accessibleModules.length }}
        <small class="text-[13px] font-semibold text-[#667085]">dari {{ MODULES.length }}</small>
      </div>
      <div class="mt-2.5 flex flex-wrap gap-1.5">
        <span
          v-for="m in accessibleModules.slice(0, 5)"
          :key="m"
          class="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#EAF0FE] text-[#1D4ED8]"
          :title="m"
        >
          <AdminV2Icon :name="MODULE_INFO[m][0]" :size="15" />
        </span>
      </div>
    </div>

    <!-- Card 4: Login Terakhir (.bt-d: 1 col) -->
    <div class="sm:col-span-1 flex flex-col justify-between rounded-[18px] border border-[#E7EBF2] bg-white p-[18px] shadow-sm">
      <span class="text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#667085]">
        Login Terakhir
      </span>
      <div class="my-1 text-[17px] font-bold text-[#101828] leading-tight">
        {{ (profile.lastLogin.split('·')[0] || '').replace('Jumat, ', '').replace('Kamis, ', '').trim() }}
      </div>
      <span class="text-[11px] font-semibold text-[#667085] leading-relaxed">
        {{ profile.lastLogin.split('·').slice(1).join('·').trim() }}
      </span>
    </div>

    <!-- Card 5: Aplikasi Saya Shortcut (.bt-e: 2 col) -->
    <div class="sm:col-span-2 flex flex-col justify-between rounded-[18px] border border-[#E7EBF2] bg-white p-[18px] shadow-sm">
      <div class="flex items-center justify-between mb-2.5">
        <h3 class="text-[15px] font-bold text-[#101828]">
          Aplikasi Saya
        </h3>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-full border border-[#E7EBF2] bg-white px-3 py-1 text-xs font-bold text-[#101828] hover:border-[#CBD5E1] transition"
          @click="emit('navigate-tab', 'aplikasi')"
        >
          <span>Semua</span>
          <span>&rarr;</span>
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <span
          v-for="m in accessibleModules"
          :key="'ov-app-' + m"
          class="inline-flex items-center gap-1.5 rounded-full border border-[#E7EBF2] bg-[#EFF2F7] px-3 py-1.5 text-xs font-bold text-[#344054]"
        >
          <AdminV2Icon :name="MODULE_INFO[m][0]" :size="15" class="text-[#667085]" />
          <span>{{ m }}</span>
          <em class="not-italic font-bold text-[#1D4ED8]">{{ userAccess[m] }}</em>
        </span>
      </div>
    </div>

    <!-- Card 6: Aktivitas Terakhir (.bt-f: 2 col) -->
    <div class="sm:col-span-2 flex flex-col justify-between rounded-[18px] border border-[#E7EBF2] bg-white p-[18px] shadow-sm">
      <h3 class="text-[15px] font-bold text-[#101828] mb-1.5">
        Aktivitas Terakhir
      </h3>

      <div class="flex flex-col">
        <div
          v-for="(act, idx) in userActivities"
          :key="'act-' + idx"
          class="flex items-start gap-2.5 py-2.5 border-b border-dashed border-[#EFF2F7] last:border-b-0"
        >
          <span class="mt-1.5 h-[9px] w-[9px] rounded-full bg-[#1D4ED8] shadow-[0_0_0_3px_#EAF0FE] shrink-0" />
          <div class="min-w-0 flex-1">
            <b class="block text-[13px] font-semibold text-[#101828] truncate">{{ act[0] }}</b>
            <span class="block text-[11.5px] font-semibold text-[#667085] truncate">{{ act[1] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
