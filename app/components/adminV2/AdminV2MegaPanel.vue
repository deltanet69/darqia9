<script setup lang="ts">
import AdminV2Icon from './AdminV2Icon.vue'
import { getAdminDestination } from './adminV2Data'

interface GroupItem {
  id: string
  label: string
  desc: string
  items: Array<[string, string, string]>
}

interface Props {
  open: boolean
  group: GroupItem | null
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-item', title: string): void
}>()

const route = useRoute()
const isAvailable = (title: string) => getAdminDestination(title) !== '#'


const isPageActive = (title: string) => {
  const t = title.toLowerCase().trim()
  const p = (route.path || '').toLowerCase()

  if (t.includes('absensi') && (t.includes('guru') || t.includes('staff'))) {
    return p.includes('/adminv2/absensi-guru')
  }
  if (t.includes('data guru') || t === 'data guru & staff') {
    return p === '/adminv2/guru' || p.includes('/adminv2/guru')
  }
  if (t.includes('absensi siswa') || (t.includes('absensi') && !t.includes('guru'))) {
    return p === '/adminv2/absensi'
  }
  if (t.includes('data siswa') || t === 'data siswa') {
    return p === '/adminv2/siswa' || p.includes('/adminv2/siswa')
  }
  if (t.includes('kelas') || t.includes('rombel')) {
    return p.includes('/adminv2/kelas')
  }
  if (t.includes('mapel') || t.includes('mata pelajaran')) {
    return p.includes('/adminv2/mapel')
  }
  if (t.includes('raport') || t.includes('rapor')) {
    return p.includes('/adminv2/raport')
  }
  if (t === 'lms' || t.includes('ujian harian')) {
    return p.includes('/adminv2/lms') || (p.includes('/adminv2/cbt') && route.query.mode === 'ujian_harian')
  }
  if (t.includes('cbt') || t.includes('ujian digital')) {
    return p.includes('/adminv2/cbt') && route.query.mode !== 'ujian_harian' && !p.includes('/adminv2/lms')
  }
  if (t.includes('manajemen user') || t.includes('manajemen pengguna')) {
    return p.includes('/adminv2/users')
  }
  if (t.includes('hak akses') || t.includes('rbac')) {
    return p.includes('/adminv2/rbac')
  }
  if (t.includes('log aktivitas')) {
    return p.includes('/adminv2/log')
  }
  if (t === 'pengaturan') {
    return p.includes('/adminv2/profil') && route.query.tab === 'pengaturan'
  }
  if (t.includes('profil saya')) {
    return p.includes('/adminv2/profil') && route.query.tab !== 'pengaturan'
  }
  if (t === 'dashboard' || t === 'ringkasan utama') {
    return p === '/adminv2' || p === '/adminv2/'
  }
  return false
}

const handleSelect = async (title: string, event?: Event) => {
  if (event) {
    event.preventDefault()
  }
  const dest = getAdminDestination(title)
  if (dest === '#') return
  await navigateTo(dest)
  emit('close')
}
</script>

<template>
  <div class="relative w-full">
    <!-- Backdrop: Klik di luar menu untuk menutup mega menu -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open && group"
          class="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[0.5px]"
          aria-hidden="true"
          @click="emit('close')"
        />
      </Transition>
    </Teleport>

    <!-- Mega Panel Dropdown (Anchored absolute to the sticky header container) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="open && group"
        class="absolute top-0 left-0 right-0 w-full z-50 bg-white border-b border-[#E7EBF2] shadow-[0_24px_48px_-24px_rgba(16,24,40,0.18)]"
        @click.stop
      >
        <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
          <div class="flex items-center justify-between mb-3.5">
            <div>
              <h3
                class="text-[15px] font-extrabold tracking-tight transition-colors"
                :class="jenjang === 'smp' ? 'text-[#14532D]' : 'text-[#0A2A5C]'"
              >
                {{ group.label }}
              </h3>
              <p class="text-xs text-[#667085] mt-0.5">
                {{ group.desc }}
              </p>
            </div>
            <button
              type="button"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition cursor-pointer"
              aria-label="Tutup"
              @click="emit('close')"
            >
              <AdminV2Icon name="x" :size="18" />
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <a
              v-for="([title, desc, icon], idx) in group.items"
              :key="idx"
              :href="getAdminDestination(title)"
              :aria-disabled="!isAvailable(title)"
              class="group flex items-center gap-3 p-3 border rounded-[14px] transition relative"
              :class="[
                isPageActive(title)
                ? (jenjang === 'smp' ? 'bg-[#E7F6ED] border-[#16A34A] text-[#14532D] shadow-xs ring-1 ring-[#16A34A]/30' : 'bg-[#EFF6FF] border-[#1B5FD9] text-[#1D4ED8] shadow-xs ring-1 ring-[#1B5FD9]/30')
                : (isAvailable(title) ? (jenjang === 'smp' ? 'bg-white border-[#E7EBF2] hover:border-[#16A34A] hover:bg-[#E7F6ED] cursor-pointer hover:shadow-xs' : 'bg-white border-[#E7EBF2] hover:border-[#1B5FD9] hover:bg-[#E8F0FE] cursor-pointer hover:shadow-xs') : 'bg-white border-[#E7EBF2] text-[#98A2B3] opacity-60 cursor-not-allowed'),
                !isAvailable(title) && 'pointer-events-none'
              ]"
              @click.prevent="handleSelect(title, $event)"
            >
              <span
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition"
                :class="isPageActive(title)
                  ? (jenjang === 'smp' ? 'bg-[#16A34A] text-white shadow-xs' : 'bg-[#1B5FD9] text-white shadow-xs')
                  : (jenjang === 'smp' ? 'bg-[#EFF2F7] text-[#14532D] group-hover:bg-white' : 'bg-[#EFF2F7] text-[#0A2A5C] group-hover:bg-white')"
              >
                <AdminV2Icon :name="icon" :size="18" />
              </span>
              <span class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1.5">
                  <b class="block text-[13px] font-bold truncate" :class="isPageActive(title) ? (jenjang === 'smp' ? 'text-[#14532D]' : 'text-[#1D4ED8]') : 'text-[#101828]'">
                    {{ title }}
                  </b>
                  <span
                    v-if="isPageActive(title)"
                    class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shrink-0"
                    :class="jenjang === 'smp' ? 'bg-[#16A34A] text-white' : 'bg-[#1B5FD9] text-white'"
                  >
                    Aktif
                  </span>
                </div>
                <span class="block text-[11px] text-[#667085] truncate">{{ desc }}</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
