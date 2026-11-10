<template>
  <section v-show="screen === 'app'" class="min-h-screen pb-24 bg-[#F1F5F9]">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 py-3 px-4">
      <div class="max-w-3xl mx-auto flex items-center gap-3">
        <img src="/asset/logo.png" alt="Logo" class="w-9 h-9 object-contain">
        <div class="min-w-0">
          <div class="text-sm font-extrabold text-slate-900 leading-tight truncate">{{ jenjangText }}</div>
          <div class="text-xs font-semibold text-slate-500">Portal Ujian Online</div>
        </div>
        <button
          type="button"
          class="ml-auto shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 bg-white disabled:opacity-50"
          :disabled="memuat"
          @click="emit('muat-ulang')"
        >
          {{ memuat ? 'Memuat…' : 'Segarkan' }}
        </button>
      </div>
    </header>

    <main v-if="profil" class="max-w-3xl mx-auto px-4 pt-5">
      <CbtHomeTab v-if="tab === 'home'" :profil="profil" :ujian="ujian" :now="now" @buka="emit('buka-ujian', $event)" />
      <CbtJadwalTab v-else-if="tab === 'jadwal'" :ujian="ujian" :now="now" @buka="emit('buka-ujian', $event)" />
      <CbtRekapTab v-else-if="tab === 'rekap'" :rekap="rekap" />
      <CbtProfilTab v-else :profil="profil" @keluar="emit('keluar')" />
    </main>

    <nav class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200" aria-label="Menu utama">
      <div class="max-w-3xl mx-auto grid grid-cols-4">
        <button
          v-for="item in menu"
          :key="item.id"
          type="button"
          class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-colors"
          :class="tab === item.id ? 'text-blue-600' : 'text-slate-400'"
          :aria-current="tab === item.id ? 'page' : undefined"
          @click="pilihTab(item.id)"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="item.ikon" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { ProfilSiswa } from '~/composables/useCbtSiswa'
import type { RekapUjian, UjianSiswa } from '~/utils/cbtSiswaJadwal'
import CbtHomeTab from '~/components/cbt/CbtHomeTab.vue'
import CbtJadwalTab from '~/components/cbt/CbtJadwalTab.vue'
import CbtRekapTab from '~/components/cbt/CbtRekapTab.vue'
import CbtProfilTab from '~/components/cbt/CbtProfilTab.vue'

type Tab = 'home' | 'jadwal' | 'rekap' | 'profil'

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
  { id: 'jadwal', label: 'Jadwal Ujian', ikon: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>' },
  { id: 'rekap', label: 'Rekap Ujian', ikon: '<path d="M6 3.5h9l4 4v13H6z"/><path d="M9.5 13h6M9.5 17h6"/>' },
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
