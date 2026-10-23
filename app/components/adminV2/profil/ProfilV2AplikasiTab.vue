<script setup lang="ts">
import { computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import {
  MODULES,
  MODULE_INFO,
  ACCESS,
  type ProfileAccount,
  type AccessLevel
} from './profilV2Data'

const props = defineProps<{
  profile: ProfileAccount
}>()

const userAccess = computed(() => ACCESS[props.profile.roleSys] || {})

const badgeClasses = (lvl?: AccessLevel): string => {
  switch (lvl) {
    case 'Penuh':
      return 'bg-[#ECFDF5] text-[#047857]'
    case 'Kelola':
      return 'bg-[#EAF0FE] text-[#1D4ED8]'
    case 'Lihat':
      return 'bg-[#F1F5F9] text-[#64748B]'
    case 'Tidak Ada':
    default:
      return 'bg-[#F8FAFC] text-[#94A3B8]'
  }
}

const dotClasses = (lvl?: AccessLevel): string => {
  switch (lvl) {
    case 'Penuh':
      return 'bg-[#047857]'
    case 'Kelola':
      return 'bg-[#1D4ED8]'
    case 'Lihat':
      return 'bg-[#64748B]'
    case 'Tidak Ada':
    default:
      return 'bg-[#94A3B8]'
  }
}
</script>

<template>
  <section class="rounded-3xl border border-[#E7EBF2] bg-white p-5 shadow-xs sm:p-6">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFF2F7] pb-3.5">
      <div>
        <h3 class="text-base font-extrabold text-[#101828]">
          Aplikasi Saya
        </h3>
        <p class="text-xs font-semibold text-[#667085]">
          Daftar modul yang dapat Anda akses sesuai peran (RBAC) akun Anda.
        </p>
      </div>
      <span class="rounded-full bg-[#E8F0FE] px-3 py-1 text-[11px] font-bold text-[#12459B]">
        Role: {{ profile.roleSys }}
      </span>
    </div>

    <p class="mt-3.5 flex items-start gap-1.5 text-xs leading-relaxed text-[#667085]">
      <AdminV2Icon name="info" :size="15" class="mt-0.5 shrink-0 text-[#1B5FD9]" />
      <span>Hak akses sistem ditetapkan oleh Super Admin melalui modul Pengguna &amp; Peran. Halaman ini hanya menampilkan izin akses akun Anda saat ini.</span>
    </p>

    <!-- Grid Kartu Aplikasi -->
    <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="m in MODULES"
        :key="m"
        class="flex flex-col justify-between rounded-2xl border p-4 transition-all hover:shadow-xs"
        :class="userAccess[m] ? 'border-[#E7EBF2] bg-white hover:-translate-y-0.5' : 'border-[#EFF2F7] bg-[#FAFBFD] opacity-60'"
      >
        <div>
          <div class="flex items-center justify-between gap-2">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl"
              :class="userAccess[m] ? 'bg-[#EAF0FE] text-[#1D4ED8]' : 'bg-[#EFF2F7] text-[#98A2B3]'"
            >
              <AdminV2Icon :name="MODULE_INFO[m][0]" :size="18" />
            </div>

            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              :class="badgeClasses(userAccess[m])"
            >
              <span class="h-1.5 w-1.5 rounded-full" :class="dotClasses(userAccess[m])" />
              <span>{{ userAccess[m] || 'Tidak Ada' }}</span>
            </span>
          </div>

          <h4 class="mt-3 text-sm font-extrabold text-[#101828]">
            {{ m }}
          </h4>
          <p class="mt-0.5 text-xs font-semibold text-[#667085] leading-snug">
            {{ MODULE_INFO[m][1] }}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-[#EFF2F7] text-[10.5px] font-semibold text-[#667085]">
          Akses: <b class="text-[#344054]">{{ userAccess[m] ? 'Diizinkan (' + userAccess[m] + ')' : 'Dibatasi' }}</b>
        </div>
      </div>
    </div>
  </section>
</template>
