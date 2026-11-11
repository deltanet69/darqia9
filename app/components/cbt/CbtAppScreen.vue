<template>
  <section v-show="screen === 'app'" class="min-h-screen pb-24 bg-[#F1F5F9] antialiased">
    <!-- Header Modern & Bersih (Tanpa Tombol Segarkan) -->
    <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] py-3 px-4">
      <div class="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <!-- Logo & Identitas Portal -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border border-blue-200/60 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
            <img :src="activeGrade === 'SMP' ? '/asset/logosmp.png' : '/asset/logo.png'" alt="Logo Sekolah" class="w-full h-full object-contain">
          </div>
          <div class="min-w-0">
            <h1 class="text-sm font-black text-slate-900 leading-tight tracking-tight truncate">{{ jenjangText }}</h1>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span class="text-[11px] font-bold text-slate-500">Portal Ujian Online</span>
            </div>
          </div>
        </div>

        <!-- Pill Status Peserta / Jenjang -->
        <div class="shrink-0 flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>{{ profil?.kelas || profil?.jenjang || 'Peserta' }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Konten Utama Tab -->
    <main v-if="profil" class="max-w-3xl mx-auto px-4 pt-5">
      <CbtHomeTab v-if="tab === 'home'" :profil="profil" :ujian="ujian" :now="now" @buka="emit('buka-ujian', $event)" />
      <CbtJadwalTab v-else-if="tab === 'jadwal'" :ujian="ujian" :now="now" @buka="emit('buka-ujian', $event)" />
      <CbtRekapTab v-else-if="tab === 'rekap'" :rekap="rekap" />
      <CbtProfilTab v-else :profil="profil" @keluar="emit('keluar')" />
    </main>

    <!-- Bottom Navigation Bar: Elegan, Bersih, Standar Mobile App Modern -->
    <nav class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/70 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" aria-label="Menu navigasi CBT">
      <div class="max-w-md mx-auto px-3 py-2 grid grid-cols-4 gap-1">
        <button
          v-for="item in menu"
          :key="item.id"
          type="button"
          class="group flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer active:scale-95"
          :aria-current="tab === item.id ? 'page' : undefined"
          @click="pilihTab(item.id)"
        >
          <!-- Icon Container with Subtle Active Pill Background -->
          <div
            class="w-10 h-7 flex items-center justify-center rounded-full transition-all duration-200"
            :class="tab === item.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100/60'"
          >
            <svg
              class="w-4 h-4 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              :stroke-width="tab === item.id ? 2.5 : 2"
              stroke-linecap="round"
              stroke-linejoin="round"
              v-html="item.ikon"
            />
          </div>
          <!-- Label Text -->
          <span
            class="text-[11px] leading-tight mt-1 transition-colors tracking-tight"
            :class="tab === item.id ? 'font-black text-blue-600' : 'font-semibold text-slate-400 group-hover:text-slate-600'"
          >
            {{ item.label }}
          </span>
        </button>
      </div>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { useAdminGrade } from '~/composables/useAdminGrade'
import { onBeforeUnmount, ref, watch } from 'vue'
import type { ProfilSiswa } from '~/composables/useCbtSiswa'
import type { RekapUjian, UjianSiswa } from '~/utils/cbtSiswaJadwal'
import CbtHomeTab from '~/components/cbt/CbtHomeTab.vue'
import CbtJadwalTab from '~/components/cbt/CbtJadwalTab.vue'
import CbtRekapTab from '~/components/cbt/CbtRekapTab.vue'
import CbtProfilTab from '~/components/cbt/CbtProfilTab.vue'

type Tab = 'home' | 'jadwal' | 'rekap' | 'profil'

const activeGrade = useAdminGrade()
const props = defineProps<{
  screen: string
  tab: Tab
  jenjangText: string
  profil: ProfilSiswa | null
  ujian: UjianSiswa[]
  rekap: RekapUjian[] | null
  memuat: boolean
  sekarang: () => number
}>()

const emit = defineEmits<{
  (e: 'update:tab', tab: Tab): void
  (e: 'buka-ujian', u: UjianSiswa): void
  (e: 'muat-ulang'): void
  (e: 'keluar'): void
}>()

const menu: Array<{ id: Tab; label: string; ikon: string }> = [
  { id: 'home', label: 'Beranda', ikon: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>' },
  { id: 'jadwal', label: 'Jadwal', ikon: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>' },
  { id: 'rekap', label: 'Rekap', ikon: '<path d="M6 3.5h9l4 4v13H6z"/><path d="M9.5 13h6M9.5 17h6"/>' },
  { id: 'profil', label: 'Profil', ikon: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1.5A5.5 5.5 0 0 1 9.5 14h5a5.5 5.5 0 0 1 5.5 5.5V21"/>' }
]

// Jam berdetak hanya saat layar aplikasi tampil (hitung mundur & status ujian).
const now = ref(props.sekarang())
let ticker: ReturnType<typeof setInterval> | null = null
const hentikan = () => { if (ticker) { clearInterval(ticker); ticker = null } }
watch(() => props.screen, (s) => {
  hentikan()
  if (s === 'app') {
    now.value = props.sekarang()
    ticker = setInterval(() => { now.value = props.sekarang() }, 1000)
  }
}, { immediate: true })
onBeforeUnmount(hentikan)

const pilihTab = (id: Tab) => {
  emit('update:tab', id)
  window.scrollTo(0, 0)
}
</script>