<script setup lang="ts">
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { ProfilSaya } from '~/composables/profilCore'
import { MODUL_INFO } from './profilV2Data'

defineProps<{
  profile: ProfilSaya
  aplikasi: Array<{ modul: string; hak: string }>
  cakupan: string[]
}>()
</script>

<template>
  <section class="rounded-3xl border border-[#E7EBF2] bg-white p-5 shadow-xs sm:p-6">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFF2F7] pb-3.5">
      <div>
        <h3 class="text-base font-extrabold text-[#101828]">
          Aplikasi Saya
        </h3>
        <p class="text-xs font-semibold text-[#667085]">
          Aplikasi yang diizinkan untuk akun Anda sesuai Hak Akses (RBAC).
        </p>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <span class="rounded-full bg-[#E8F0FE] px-3 py-1 text-[11px] font-bold text-[#12459B]">
          Peran: {{ profile.roleSys }}
        </span>
        <span v-if="cakupan.length" class="rounded-full bg-[#F3F5F9] px-3 py-1 text-[11px] font-bold text-[#475467]">
          Jenjang: {{ cakupan.join(' + ') }}
        </span>
      </div>
    </div>

    <p v-if="!aplikasi.length" class="mt-5 rounded-2xl border border-dashed border-[#D0D5DD] bg-[#FAFBFD] p-5 text-center text-xs font-semibold text-[#667085]">
      Belum ada aplikasi yang diizinkan untuk akun ini. Hubungi Superadmin untuk pengaturan Hak Akses.
    </p>

    <div v-else class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="a in aplikasi"
        :key="a.modul"
        class="flex flex-col justify-between rounded-2xl border border-[#E7EBF2] bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-xs"
      >
        <div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF0FE] text-[#1D4ED8]">
              <AdminV2Icon :name="MODUL_INFO[a.modul]?.[0] || 'grid'" :size="18" />
            </div>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              :class="a.hak === 'Penuh' ? 'bg-[#ECFDF5] text-[#047857]' : a.hak === 'Lihat' ? 'bg-[#F1F5F9] text-[#64748B]' : 'bg-[#EAF0FE] text-[#1D4ED8]'"
            >
              {{ a.hak }}
            </span>
          </div>
          <h4 class="mt-3 text-sm font-extrabold text-[#101828]">
            {{ a.modul }}
          </h4>
          <p class="mt-0.5 text-xs font-semibold text-[#667085] leading-snug">
            {{ MODUL_INFO[a.modul]?.[1] }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
