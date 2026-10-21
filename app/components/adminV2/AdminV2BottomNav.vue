<script setup lang="ts">
import { ref } from 'vue'
import AdminV2Icon from './AdminV2Icon.vue'

interface Props {
  role: 'superadmin' | 'admin_tu' | 'guru'
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'open-menu'): void
  (e: 'nav-click', item: string): void
}>()

const route = useRoute()

const destinations: Record<string, string> = {
  beranda: '/adminV2',
  akademik: '/adminV2/siswa',
  keuangan: '#',
  profil: '#'
}

const activeTab = computed(() => {
  const p = (route.path || '').toLowerCase()
  if (p === '/adminv2' || p === '/adminv2/') return 'beranda'
  if (p.includes('/siswa') || (p.includes('/absensi') && !p.includes('/absensi-guru')) || p.includes('/kelas') || p.includes('/mapel') || p.includes('/raport')) return 'akademik'
  if (p.includes('/guru') || p.includes('/absensi-guru') || p.includes('/kepegawaian')) return 'menu'
  if (p.includes('/keuangan')) return 'keuangan'
  return 'beranda'
})

const handleNav = (tab: string) => {
  if (tab === 'menu') {
    emit('open-menu')
    return
  }
  const dest = destinations[tab]
  if (dest !== '#') navigateTo(dest)
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E7EBF2] flex px-1 py-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_-12px_rgba(16,24,40,0.12)] lg:hidden"
    aria-label="Navigasi bawah"
    @click.stop
  >
    <button
      type="button"
      class="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 min-h-[54px] text-[10px] font-semibold rounded-2xl transition whitespace-nowrap"
      :class="activeTab === 'beranda'
        ? jenjang === 'smp' ? 'text-[#14532D] bg-[#E7F6ED]' : 'text-[#0A2A5C] bg-[#E8F0FE]'
        : 'text-[#98A2B3] hover:text-[#344054]'"
      @click="handleNav('beranda')"
    >
      <AdminV2Icon name="home" :size="20" />
      <span>Beranda</span>
    </button>

    <button
      type="button"
      class="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 min-h-[54px] text-[10px] font-semibold rounded-2xl transition whitespace-nowrap"
      :class="activeTab === 'akademik'
        ? jenjang === 'smp' ? 'text-[#14532D] bg-[#E7F6ED]' : 'text-[#0A2A5C] bg-[#E8F0FE]'
        : 'text-[#98A2B3] hover:text-[#344054]'"
      @click="handleNav('akademik')"
    >
      <AdminV2Icon name="cal" :size="20" />
      <span>Akademik</span>
    </button>

    <button
      type="button"
      class="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 min-h-[54px] text-[10px] font-semibold rounded-2xl transition whitespace-nowrap text-[#98A2B3] hover:text-[#344054] active:bg-[#EFF2F7]"
      @click="handleNav('menu')"
    >
      <AdminV2Icon name="grid" :size="20" />
      <span>Menu</span>
    </button>

    <button
      v-if="role !== 'guru'"
      type="button"
      :disabled="destinations.keuangan === '#'"
      :aria-disabled="destinations.keuangan === '#'"
      class="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 min-h-[54px] text-[10px] font-semibold rounded-2xl transition whitespace-nowrap"
      :class="activeTab === 'keuangan'
        ? jenjang === 'smp' ? 'text-[#14532D] bg-[#E7F6ED]' : 'text-[#0A2A5C] bg-[#E8F0FE]'
        : 'text-[#98A2B3] hover:text-[#344054]'"
      @click="handleNav('keuangan')"
    >
      <AdminV2Icon name="wallet" :size="20" />
      <span>Keuangan</span>
    </button>

    <button
      type="button"
      :disabled="destinations.profil === '#'"
      :aria-disabled="destinations.profil === '#'"
      class="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 min-h-[54px] text-[10px] font-semibold rounded-2xl transition whitespace-nowrap"
      :class="activeTab === 'profil'
        ? jenjang === 'smp' ? 'text-[#14532D] bg-[#E7F6ED]' : 'text-[#0A2A5C] bg-[#E8F0FE]'
        : 'text-[#98A2B3] hover:text-[#344054]'"
      @click="handleNav('profil')"
    >
      <AdminV2Icon name="users" :size="20" />
      <span>Profil</span>
    </button>
  </nav>
</template>
