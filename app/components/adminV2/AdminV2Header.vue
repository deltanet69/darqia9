<script setup lang="ts">
import { computed } from 'vue'
import AdminV2Icon from './AdminV2Icon.vue'

interface GroupItem {
  id: string
  label: string
  desc: string
  items: Array<[string, string, string]>
}

interface Props {
  jenjang: 'smp' | 'smk'
  role: 'superadmin' | 'admin_tu' | 'guru'
  groups: GroupItem[]
  activeGroupId?: string | null
  isMegaOpen?: boolean
  currentRoute?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeGroupId: null,
  isMegaOpen: false,
  currentRoute: ''
})

const emit = defineEmits<{
  (e: 'update:jenjang', val: 'smp' | 'smk'): void
  (e: 'toggle-mega', group: GroupItem): void
  (e: 'open-mobile-menu'): void
  (e: 'toggle-search'): void
  (e: 'toggle-notif'): void
  (e: 'toggle-profile'): void
}>()

const route = useRoute()

const visibleGroups = computed(() => {
  return props.groups.filter(g => !(props.role === 'guru' && g.id === 'keuangan'))
})

const detectedActiveGroupId = computed(() => {
  // 1. Jika mega menu sedang dibuka oleh user, prioritaskan grup yang sedang dibuka
  if (props.isMegaOpen && props.activeGroupId) {
    return props.activeGroupId
  }

  // 2. Cek explicit currentRoute prop
  const cr = (props.currentRoute || '').toLowerCase()
  if (cr === 'dashboard') return 'dashboard'
  if (cr === 'akademik' || cr === 'kesiswaan') return 'akademik'
  if (cr === 'kepegawaian') return 'kepegawaian'
  if (cr === 'keuangan') return 'keuangan'
  if (cr === 'aplikasi' || cr === 'cbt') return 'aplikasi'
  if (cr === 'sistem') return 'sistem'

  // 3. Otomatis deteksi dari Nuxt route path
  const path = (route.path || '').toLowerCase()
  if (path === '/adminv2' || path === '/adminv2/') {
    return 'dashboard'
  }
  if (path.includes('/adminv2/guru') || path.includes('/adminv2/absensi-guru') || path.includes('/adminv2/kepegawaian')) {
    return 'kepegawaian'
  }
  if (path.includes('/adminv2/siswa') || (path.includes('/adminv2/absensi') && !path.includes('/absensi-guru')) || path.includes('/adminv2/kelas') || path.includes('/adminv2/mapel') || path.includes('/adminv2/raport')) {
    return 'akademik'
  }
  if (path.includes('/adminv2/cbt') || path.includes('/adminv2/lms') || path.includes('/adminv2/konten') || path.includes('/adminv2/spmb') || path.includes('/adminv2/perpustakaan')) {
    return 'aplikasi'
  }
  if (path.includes('/adminv2/keuangan') || path.includes('/adminv2/tabungan')) {
    return 'keuangan'
  }
  if (path.includes('/adminv2/user') || path.includes('/adminv2/rbac') || path.includes('/adminv2/log') || path.includes('/adminv2/sistem') || path.includes('/adminv2/pengaturan')) {
    return 'sistem'
  }

  return 'dashboard'
})

const isItemActive = (groupId: string) => {
  return detectedActiveGroupId.value === groupId
}
</script>

<template>
  <header class="w-full h-16 lg:h-[76px] bg-white/95 backdrop-blur-xl border-b border-[#E7EBF2] transition-colors">
    <div class="w-full h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Left side: Hamburger (mobile), Brand Logo (Pojok Kiri dengan margin) -->
      <div class="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0">
        <!-- Hamburger Button (Mobile) -->
        <button
          type="button"
          class="w-10 h-10 rounded-xl flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition lg:hidden shrink-0 cursor-pointer"
          aria-label="Buka menu"
          @click="emit('open-mobile-menu')"
        >
          <AdminV2Icon name="menu" :size="22" />
        </button>

        <!-- Brand Logo -->
        <NuxtLink
          to="/adminV2"
          class="flex items-center gap-2.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5FD9] rounded-xl"
          title="Ke Dashboard Utama Admin V2"
        >
          <span
            class="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
            :class="jenjang === 'smp' ? 'bg-gradient-to-br from-[#22C55E] to-[#14532D]' : 'bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C]'"
          >
            <AdminV2Icon name="shield" :size="22" class="text-white" />
          </span>
          <span class="hidden sm:flex flex-col leading-tight">
            <span
              class="font-extrabold text-[15px] lg:text-base tracking-tight transition-colors"
              :class="jenjang === 'smp' ? 'text-[#14532D]' : 'text-[#0A2A5C]'"
            >
              Darqia
            </span>
            <span class="text-[10px] text-[#667085] font-semibold tracking-wider uppercase">
              Attaqwa 9
            </span>
          </span>
        </NuxtLink>
      </div>

      <!-- Center: Pill Navigation (Desktop) -->
      <nav class="hidden lg:flex items-center bg-[#EFF2F7] border border-[#E7EBF2] rounded-full p-1 gap-0.5 mx-auto" aria-label="Modul">
        <template v-for="group in visibleGroups" :key="group.id">
          <!-- Dashboard: Langsung navigasi ke /adminV2 -->
          <NuxtLink
            v-if="group.id === 'dashboard'"
            to="/adminV2"
            class="nav-pill-btn text-[13px] font-semibold py-2 px-3.5 xl:px-4 rounded-full transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer relative"
            :class="isItemActive('dashboard')
              ? 'bg-[#101828] text-white font-bold shadow-xs'
              : 'text-[#344054] hover:text-[#101828] hover:bg-white/60'"
            @click="emit('toggle-mega', group)"
          >
            <span>{{ group.label }}</span>
            <span
              v-if="isItemActive('dashboard')"
              class="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse"
            />
          </NuxtLink>

          <!-- Group Modul: Toggle Mega Panel -->
          <button
            v-else
            type="button"
            class="nav-pill-btn text-[13px] font-semibold py-2 px-3.5 xl:px-4 rounded-full transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer relative"
            :class="isItemActive(group.id)
              ? 'bg-[#101828] text-white font-bold shadow-xs'
              : 'text-[#344054] hover:text-[#101828] hover:bg-white/60'"
            @click="emit('toggle-mega', group)"
          >
            <span>{{ group.label }}</span>
            <span
              v-if="isItemActive(group.id)"
              class="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse"
            />
          </button>
        </template>
      </nav>

      <!-- Right side: Top Actions (Pojok Kanan dengan margin) -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
        <!-- Search Button -->
        <button
          type="button"
          class="w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition cursor-pointer"
          aria-label="Cari"
          @click.stop="emit('toggle-search')"
        >
          <AdminV2Icon name="search" :size="20" />
        </button>

        <!-- Notification Button -->
        <button
          type="button"
          class="relative w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition cursor-pointer"
          aria-label="Notifikasi"
          @click.stop="emit('toggle-notif')"
        >
          <AdminV2Icon name="bell" :size="20" />
          <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F04438] border-2 border-white" />
        </button>

        <!-- Jenjang Switcher -->
        <div class="flex bg-[#EFF2F7] border border-[#E7EBF2] rounded-full p-0.5 sm:p-1 gap-0.5" role="group" aria-label="Pilih jenjang">
          <button
            type="button"
            class="text-[11px] sm:text-[11.5px] font-bold py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-full transition whitespace-nowrap cursor-pointer"
            :class="jenjang === 'smp' ? 'bg-[#14532D] text-white shadow-sm' : 'text-[#667085] hover:text-[#101828]'"
            @click="emit('update:jenjang', 'smp')"
          >
            SMP
          </button>
          <button
            type="button"
            class="text-[11px] sm:text-[11.5px] font-bold py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-full transition whitespace-nowrap cursor-pointer"
            :class="jenjang === 'smk' ? 'bg-[#0A2A5C] text-white shadow-sm' : 'text-[#667085] hover:text-[#101828]'"
            @click="emit('update:jenjang', 'smk')"
          >
            SMK
          </button>
        </div>

        <!-- Profile Avatar Button -->
        <button
          type="button"
          class="w-9 sm:w-[38px] h-9 sm:h-[38px] rounded-full text-white font-bold text-xs sm:text-[13px] flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-[#E7EBF2] cursor-pointer shrink-0 transition hover:ring-[#1B5FD9]"
          :class="jenjang === 'smp' ? 'bg-gradient-to-br from-[#22C55E] to-[#14532D]' : 'bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C]'"
          aria-label="Profil"
          @click.stop="emit('toggle-profile')"
        >
          AD
        </button>
      </div>
    </div>
  </header>
</template>
