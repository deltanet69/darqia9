<script setup lang="ts">
import { ref, computed } from 'vue'
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
  role: 'superadmin' | 'admin_tu' | 'guru'
  groups: GroupItem[]
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-item', title: string): void
  (e: 'profile-click'): void
  (e: 'settings-click'): void
  (e: 'logout-click'): void
}>()

const route = useRoute()
const supabase = useSupabaseClient()
const searchQuery = ref('')
const openGroups = ref<Set<string>>(new Set(['dashboard']))
const isAvailable = (title: string) => getAdminDestination(title) !== '#'

const isPageActive = (title: string) => {
  const t = title.toLowerCase().trim()
  const p = (route.path || '').toLowerCase()

  if (t.includes('absensi') && (t.includes('guru') || t.includes('staff'))) return p.includes('/adminv2/absensi-guru')
  if (t.includes('data guru') || t === 'data guru & staff') return p === '/adminv2/guru' || p.includes('/adminv2/guru')
  if (t.includes('absensi siswa') || (t.includes('absensi') && !t.includes('guru'))) return p === '/adminv2/absensi'
  if (t.includes('data siswa') || t === 'data siswa') return p === '/adminv2/siswa' || p.includes('/adminv2/siswa')
  if (t.includes('kelas') || t.includes('rombel')) return p.includes('/adminv2/kelas')
  if (t.includes('mapel') || t.includes('mata pelajaran')) return p.includes('/adminv2/mapel')
  if (t.includes('raport') || t.includes('rapor')) return p.includes('/adminv2/raport')
  if (t === 'lms' || t.includes('ujian harian')) {
    return p.includes('/adminv2/lms') || (p.includes('/adminv2/cbt') && route.query.mode === 'ujian_harian')
  }
  if (t.includes('cbt') || t.includes('ujian digital')) {
    return p.includes('/adminv2/cbt') && route.query.mode !== 'ujian_harian' && !p.includes('/adminv2/lms')
  }
  if (t.includes('manajemen user') || t.includes('manajemen pengguna')) return p.includes('/adminv2/users')
  if (t.includes('hak akses') || t.includes('rbac')) return p.includes('/adminv2/rbac')
  if (t.includes('log aktivitas')) return p.includes('/adminv2/log')
  if (t === 'pengaturan') return p.includes('/adminv2/profil') && route.query.tab === 'pengaturan'
  if (t.includes('profil saya')) return p.includes('/adminv2/profil') && route.query.tab !== 'pengaturan'
  if (t === 'dashboard' || t === 'ringkasan utama') return p === '/adminv2' || p === '/adminv2/'
  return false
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    const p = (route.path || '').toLowerCase()
    if (p.includes('/guru') || p.includes('/absensi-guru') || p.includes('/kepegawaian')) {
      openGroups.value = new Set(['kepegawaian'])
    } else if (p.includes('/siswa') || p.includes('/absensi') || p.includes('/kelas') || p.includes('/mapel') || p.includes('/raport')) {
      openGroups.value = new Set(['akademik'])
    } else if (p.includes('/cbt') || p.includes('/lms')) {
      openGroups.value = new Set(['aplikasi'])
    } else if (p.includes('/users') || p.includes('/rbac') || p.includes('/log') || p.includes('/profil') || p.includes('/pengaturan')) {
      openGroups.value = new Set(['sistem'])
    } else {
      openGroups.value = new Set(['dashboard'])
    }
  }
}, { immediate: true })

const visibleGroups = computed(() => {
  return props.groups.filter(g => !(props.role === 'guru' && g.id === 'keuangan'))
})

const filteredGroups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  return visibleGroups.value
    .map(g => {
      const matchedItems = g.items.filter(([title, desc]) => {
        if (!isAvailable(title)) return false
        return !q || `${g.label} ${title} ${desc}`.toLowerCase().includes(q)
      })
      return { ...g, matchedItems }
    })
    .filter(g => g.matchedItems.length > 0)
})

const hasResults = computed(() => filteredGroups.value.length > 0)

const toggleGroup = (id: string) => {
  if (openGroups.value.has(id)) {
    openGroups.value.delete(id)
  } else {
    openGroups.value.clear()
    openGroups.value.add(id)
  }
}

const handleGroupHeaderClick = (group: GroupItem) => {
  if (group.id === 'dashboard') {
    handleItemClick('Dashboard')
    return
  }
  toggleGroup(group.id)
}

const isGroupOpen = (id: string) => {
  if (searchQuery.value.trim()) return true
  return openGroups.value.has(id)
}

const handleItemClick = async (title: string) => {
  const dest = getAdminDestination(title)
  if (!isAvailable(title)) return
  await navigateTo(dest)
  emit('close')
}

const handleLogout = async () => {
  await supabase.auth.signOut({ scope: 'local' })
  emit('logout-click')
  emit('close')
  await navigateTo('/adminV2/login', { replace: true })
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-[100] bg-[#F3F5F9] flex flex-col"
      aria-label="Menu modul"
      @click.stop
    >
      <!-- Menu Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E7EBF2]">
        <div class="flex items-center gap-2.5">
          <span
            class="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-white shrink-0"
            :class="jenjang === 'smp' ? 'bg-gradient-to-br from-[#22C55E] to-[#14532D]' : 'bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C]'"
          >
            <AdminV2Icon name="shield" :size="22" />
          </span>
          <span class="flex flex-col leading-tight">
            <span
              class="font-extrabold text-[15px] tracking-tight"
              :class="jenjang === 'smp' ? 'text-[#14532D]' : 'text-[#0A2A5C]'"
            >
              Darqia
            </span>
            <span class="text-[10px] text-[#667085] font-semibold tracking-wider uppercase">
              Attaqwa 9
            </span>
          </span>
        </div>
        <button
          type="button"
          class="w-11 h-11 rounded-xl flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] active:bg-[#E7EBF2] transition touch-manipulation"
          aria-label="Tutup menu"
          @click="emit('close')"
        >
          <AdminV2Icon name="x" :size="20" />
        </button>
      </div>

      <!-- Search in Menu -->
      <label class="flex items-center gap-2.5 mx-4 mt-3.5 mb-1.5 bg-white border border-[#E7EBF2] rounded-2xl px-3.5 py-3 text-[#98A2B3] focus-within:border-[#101828] transition">
        <AdminV2Icon name="search" :size="17" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari modul, mis. SPP, CBT, Rapor"
          class="border-none outline-none bg-transparent text-sm w-full text-[#101828] placeholder-[#98A2B3]"
        >
      </label>

      <!-- Menu Body Accordion -->
      <div class="flex-1 overflow-y-auto px-4 py-2 space-y-2.5">
        <div
          v-for="g in filteredGroups"
          :key="g.id"
          class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-sm transition"
        >
          <button
            type="button"
            class="w-full flex items-center gap-3 p-4 text-left font-bold text-sm text-[#101828] hover:bg-[#F8FAFD] transition"
            @click="handleGroupHeaderClick(g)"
          >
            <span
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
              :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
            >
              <AdminV2Icon :name="g.items[0]?.[2] || 'grid'" :size="18" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block truncate">{{ g.label }}</span>
              <small class="block truncate text-[11px] font-medium text-[#667085] mt-0.5">{{ g.desc }}</small>
            </span>
            <AdminV2Icon
              v-if="g.id !== 'dashboard'"
              name="chev"
              :size="17"
              class="text-[#98A2B3] transition-transform duration-200"
              :class="{ 'rotate-180': isGroupOpen(g.id) }"
            />
          </button>

          <div v-show="g.id !== 'dashboard' && isGroupOpen(g.id)" class="px-2 pb-3 space-y-1">
            <NuxtLink
              v-for="([title, desc, icon], idx) in g.matchedItems"
              :key="idx"
              :to="getAdminDestination(title)"
              class="w-full flex items-center gap-3 p-3 rounded-xl text-[13.5px] font-semibold transition text-left"
              :class="[
                isPageActive(title)
                ? (jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D] font-bold border border-[#A6E9C5]' : 'bg-[#EFF6FF] text-[#1B5FD9] font-bold border border-[#BFDBFE]')
                : (isAvailable(title) ? 'text-[#344054] hover:bg-[#EFF2F7] active:bg-[#EFF2F7] cursor-pointer touch-manipulation' : 'text-[#98A2B3] opacity-60 cursor-not-allowed'),
                !isAvailable(title) && 'pointer-events-none'
              ]"
              @click="emit('close')"
            >
              <span
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :class="isPageActive(title)
                  ? (jenjang === 'smp' ? 'bg-[#16A34A] text-white' : 'bg-[#1B5FD9] text-white')
                  : 'bg-[#EFF2F7] text-[#0A2A5C]'"
              >
                <AdminV2Icon :name="icon" :size="16" />
              </span>
              <span class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1.5">
                  <span class="block truncate">{{ title }}</span>
                  <span
                    v-if="isPageActive(title)"
                    class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shrink-0"
                    :class="jenjang === 'smp' ? 'bg-[#16A34A] text-white' : 'bg-[#1B5FD9] text-white'"
                  >
                    Aktif
                  </span>
                </div>
                <small class="block truncate text-[11px] font-medium text-[#98A2B3]">{{ desc }}</small>
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!hasResults" class="text-center text-[#667085] text-sm py-8">
          Modul tidak ditemukan.
        </div>
      </div>

      <!-- Menu Footer -->
      <div class="bg-white border-t border-[#E7EBF2] flex p-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] gap-1">
        <button
          type="button"
          class="flex-1 flex flex-col items-center gap-1 text-[10.5px] font-semibold text-[#344054] py-2 px-1 rounded-xl hover:bg-[#EFF2F7] transition"
          @click="handleItemClick('Profil saya')"
        >
          <AdminV2Icon name="users" :size="20" />
          <span>Profil</span>
        </button>
        <button
          type="button"
          class="flex-1 flex flex-col items-center gap-1 text-[10.5px] font-semibold text-[#344054] py-2 px-1 rounded-xl hover:bg-[#EFF2F7] transition"
          @click="handleItemClick('Pengaturan')"
        >
          <AdminV2Icon name="gear" :size="20" />
          <span>Pengaturan</span>
        </button>
        <button
          type="button"
          class="flex-1 flex flex-col items-center gap-1 text-[10.5px] font-semibold text-[#344054] py-2 px-1 rounded-xl hover:bg-[#EFF2F7] transition"
          @click="handleLogout"
        >
          <AdminV2Icon name="out" :size="20" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  </Transition>
</template>
