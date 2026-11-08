<script setup lang="ts">
import { computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import { hitungKelengkapan, formatWaktuWib, type ProfilSaya } from '~/composables/profilCore'
import { RBAC_MODUL } from '~/composables/rbacCore'
import { MODUL_INFO, type ProfileTabKey } from './profilV2Data'

const props = defineProps<{
  profile: ProfilSaya
  aplikasi: Array<{ modul: string; hak: string }>
  aktivitas: Array<{ judul: string; waktu: string }>
  loginTerakhir: { waktu: string; perangkat: string } | null
}>()

const emit = defineEmits<{
  (e: 'navigate-tab', tab: ProfileTabKey): void
}>()

const comp = computed(() => hitungKelengkapan(props.profile))

// Big Circular Ring SVG: r = 52, Keliling = 2 * Math.PI * 52 ≈ 326.72
const bigCircumference = 2 * Math.PI * 52
const bigOffset = computed(() => {
  return (bigCircumference * (1 - comp.value.pct / 100)).toFixed(1)
})

// "Minggu, 25 Okt 2026 · 06:58 WIB" -> tanggal tanpa nama hari + jam
const loginTanggal = computed(() => props.loginTerakhir ? formatWaktuWib(props.loginTerakhir.waktu).split(' · ')[0].replace(/^[^,]+,\s*/, '') : '-')
const loginJam = computed(() => props.loginTerakhir ? `${formatWaktuWib(props.loginTerakhir.waktu).split(' · ')[1]} · ${props.loginTerakhir.perangkat}` : 'Belum ada riwayat login')
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1: Kelengkapan Profil (2 Col, 2 Row) -->
    <div class="sm:col-span-2 sm:row-span-2 flex flex-col items-center text-center justify-between rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
      <div class="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
          Status Kelengkapan Data
        </span>
        <span
          class="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
          :class="comp.pct >= 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'"
        >
          {{ comp.pct >= 100 ? 'Lengkap 100%' : 'Perlu Dilengkapi' }}
        </span>
      </div>

      <!-- Big Radial Ring (132x132px) -->
      <div class="relative my-3 h-[132px] w-[132px]">
        <svg class="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            class="stroke-slate-100"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke-width="9"
          />
          <circle
            class="stroke-[#1B5FD9] transition-all duration-700"
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
          <b class="text-[32px] font-black text-slate-900 tabular-nums">{{ comp.pct }}</b>
          <span class="text-[15px] font-bold text-slate-400 ml-0.5">%</span>
        </div>
      </div>

      <!-- Missing Fields & Call to Action -->
      <div class="w-full space-y-3">
        <div v-if="comp.missing.length" class="text-xs font-medium text-slate-600 bg-amber-50/70 border border-amber-100 rounded-xl p-3">
          <span class="font-bold text-amber-900 block mb-1">Kolom yang belum lengkap:</span>
          <div class="flex flex-wrap justify-center gap-1.5 mt-1">
            <span
              v-for="m in comp.missing"
              :key="m"
              class="inline-block rounded-md bg-white border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800 shadow-2xs"
            >
              {{ m }}
            </span>
          </div>
        </div>
        <div v-else class="text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
          Semua data pokok pegawai telah lengkap dan terverifikasi.
        </div>

        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B5FD9] hover:bg-[#154cb0] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(27,95,217,0.25)] transition-all cursor-pointer active:scale-[0.99]"
          @click="emit('navigate-tab', 'dataprofil')"
        >
          <span>Lengkapi di Tab Data Profil</span>
          <span class="text-sm font-bold">&rarr;</span>
        </button>
      </div>
    </div>

    <!-- Card 2: Smartcard Presensi (2 Col) -->
    <div class="sm:col-span-2 flex flex-col justify-between rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
          Smartcard Presensi RFID
        </span>
        <span
          class="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
          :class="profile.rfid !== '-' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'"
        >
          {{ profile.rfid !== '-' ? 'Aktif' : 'Belum Ditautkan' }}
        </span>
      </div>

      <div class="my-3 flex items-center gap-3.5 rounded-2xl bg-gradient-to-r from-[#0E2547] to-[#1D4ED8] p-4 text-white shadow-md relative overflow-hidden">
        <!-- Watermark wifi -->
        <div class="absolute -right-2 -bottom-2 text-white/10 pointer-events-none">
          <AdminV2Icon name="wifi" :size="72" />
        </div>

        <div class="h-7 w-9 shrink-0 rounded-lg bg-gradient-to-br from-[#FDE68A] to-[#F59E0B] shadow-inner" />
        <div class="min-w-0 flex-1 relative z-10">
          <b class="block text-sm font-bold">
            {{ profile.rfid === '-' ? 'Kartu Belum Didaftarkan' : 'Kartu RFID Terhubung' }}
          </b>
          <span class="block font-mono text-xs text-blue-200 mt-0.5">
            {{ profile.rfid === '-' ? 'Hubungi Superadmin untuk registrasi kartu' : profile.rfid }}
          </span>
        </div>
        <div class="shrink-0 text-blue-200 relative z-10">
          <AdminV2Icon name="wifi" :size="22" />
        </div>
      </div>

      <p class="text-[11.5px] text-slate-500 font-medium">
        Digunakan untuk absensi kedatangan &amp; kepulangan guru pada reader RFID sekolah.
      </p>
    </div>

    <!-- Card 3: Modul Diakses (1 Col) -->
    <div class="sm:col-span-1 flex flex-col justify-between rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
      <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
        Modul Diakses
      </span>
      <div class="my-2">
        <div class="text-3xl font-black text-slate-900 tabular-nums">
          {{ aplikasi.length }}
        </div>
        <span class="text-xs font-medium text-slate-500">dari {{ RBAC_MODUL.length }} modul aplikasi</span>
      </div>
      <div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
        <span
          v-for="a in aplikasi.slice(0, 5)"
          :key="a.modul"
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1B5FD9] border border-blue-100 shadow-2xs"
          :title="a.modul"
        >
          <AdminV2Icon :name="MODUL_INFO[a.modul]?.[0] || 'grid'" :size="15" />
        </span>
      </div>
    </div>

    <!-- Card 4: Login Terakhir (1 Col) -->
    <div class="sm:col-span-1 flex flex-col justify-between rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
      <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
        Login Terakhir
      </span>
      <div class="my-2">
        <div class="text-[17px] font-black text-slate-900 leading-snug">
          {{ loginTanggal }}
        </div>
        <span class="text-xs text-slate-500 font-medium block mt-0.5 truncate">
          {{ loginJam }}
        </span>
      </div>
      <div class="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
        <span class="h-2 w-2 rounded-full bg-emerald-500" />
        <span>Sesi Aman</span>
      </div>
    </div>

    <!-- Card 5: Aplikasi Saya Shortcut (2 Col) -->
    <div class="sm:col-span-2 flex flex-col justify-between rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <h3 class="text-sm font-extrabold text-slate-900">
            Daftar Modul Izin Akses
          </h3>
          <p class="text-[11.5px] text-slate-500">Sesuai penugasan peran RBAC yang berlaku.</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs font-bold text-[#1B5FD9] hover:underline cursor-pointer"
          @click="emit('navigate-tab', 'aplikasi')"
        >
          <span>Lihat Semua</span>
          <span>&rarr;</span>
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <span
          v-for="a in aplikasi"
          :key="'ov-app-' + a.modul"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs"
        >
          <AdminV2Icon :name="MODUL_INFO[a.modul]?.[0] || 'grid'" :size="14" class="text-slate-500" />
          <span>{{ a.modul }}</span>
          <span class="text-[10px] font-bold text-[#1B5FD9] bg-blue-50 px-1.5 py-0.2 rounded-md border border-blue-100">
            {{ a.hak }}
          </span>
        </span>
        <span v-if="!aplikasi.length" class="text-xs font-medium text-slate-500">Belum ada modul yang diizinkan untuk akun ini.</span>
      </div>
    </div>

    <!-- Card 6: Aktivitas Terakhir (2 Col) -->
    <div class="sm:col-span-2 flex flex-col justify-between rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
      <div class="pb-3 border-b border-slate-100 mb-2">
        <h3 class="text-sm font-extrabold text-slate-900">
          Riwayat Aktivitas Terkini
        </h3>
        <p class="text-[11.5px] text-slate-500">Log operasional yang dilakukan melalui akun ini.</p>
      </div>

      <div class="flex flex-col divide-y divide-slate-100">
        <p v-if="!aktivitas.length" class="py-3 text-xs font-medium text-slate-500">Belum ada riwayat aktivitas tercatat.</p>
        <div
          v-for="(act, idx) in aktivitas"
          :key="'act-' + idx"
          class="flex items-start gap-2.5 py-2.5 hover:bg-slate-50/60 px-1 rounded-lg transition-colors"
        >
          <span class="mt-1 h-2 w-2 rounded-full bg-[#1B5FD9] shrink-0" />
          <div class="min-w-0 flex-1">
            <b class="block text-[12.5px] font-bold text-slate-800 truncate">{{ act.judul }}</b>
            <span class="block text-[11px] text-slate-500 font-medium truncate">{{ act.waktu }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
