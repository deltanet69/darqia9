<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import AdminV2Icon from './AdminV2Icon.vue'

interface Props {
  isNotifOpen: boolean
  isProfileOpen: boolean
  isSearchOpen: boolean
  role: 'superadmin' | 'admin_tu' | 'guru'
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close-all'): void
  (e: 'update:role', role: 'superadmin' | 'admin_tu' | 'guru'): void
  (e: 'item-click', label: string): void
}>()

// Search Overlay Logic
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const supabase = useSupabaseClient()
const authUser = useSupabaseUser()
const { isDark, toggleTheme, initTheme } = useAdminTheme()
onMounted(() => initTheme())

const profileName = computed(() => {
  const metadata = authUser.value?.user_metadata
  return metadata?.name || metadata?.full_name || authUser.value?.email || 'Administrator'
})

const profileEmail = computed(() => authUser.value?.email || 'Email tidak tersedia')
const profileRole = computed(() => {
  const rawRole = String(authUser.value?.app_metadata?.role || authUser.value?.user_metadata?.role || '').toLowerCase()
  if (authUser.value?.email?.toLowerCase() === 'betadev94@gmail.com') return 'Superadmin Utama'
  if (rawRole === 'superadmin' || rawRole === 'super_admin') return 'Superadmin'
  if (rawRole === 'admin' || rawRole === 'admin_tu') return 'Admin TU'
  if (rawRole === 'guru') return 'Guru'
  return 'Pengguna'
})

const searchData: Array<[string, string]> = [
  ['Modul', 'Data Siswa'],
  ['Modul', 'Data Guru'],
  ['Modul', 'SPP'],
  ['Modul', 'CBT'],
  ['Modul', 'PPDB / SPMB'],
  ['Siswa', 'Ahmad Fauzi — XII TKJ 1'],
  ['Siswa', 'Siti Rahma — XI AKL 2'],
  ['Guru', 'Budi Santoso — Produktif'],
  ['Transaksi', 'INV_00241 — Rp 350.000']
]

const filteredSearch = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return searchData
  return searchData.filter(([, v]) => v.toLowerCase().includes(q))
})

// Focus search input when opened
watch(
  () => props.isSearchOpen,
  (open) => {
    if (open) {
      searchQuery.value = ''
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
)

const handleSearchSelect = (val: string) => {
  emit('item-click', val)
  emit('close-all')
}

const handleProfileAction = async (label: string) => {
  emit('close-all')

  if (label === 'Keluar') {
    await supabase.auth.signOut({ scope: 'local' })
    await navigateTo('/adminV2/login', { replace: true })
    return
  }

  if (label === 'Profil Saya') {
    await navigateTo('/adminV2/profil')
    return
  }

  if (label === 'Pengaturan') {
    await navigateTo('/adminV2/profil?tab=pengaturan')
    return
  }

  emit('item-click', label)
}
</script>

<template>
  <div>
    <!-- Notification Popover (anchored right below topbar) -->
    <div
      v-if="isNotifOpen"
      class="fixed z-[80] top-[72px] right-14 sm:right-16 w-80 max-w-[calc(100vw-32px)] bg-white border border-[#E7EBF2] rounded-2xl shadow-[0_24px_48px_-16px_rgba(16,24,40,0.25)] overflow-hidden"
      @click.stop
    >
      <div class="px-4 py-3 border-b border-[#E7EBF2] flex justify-between items-center text-sm font-extrabold text-[#101828]">
        <span>Notifikasi</span>
        <button
          type="button"
          class="text-xs font-bold transition p-0"
          :class="jenjang === 'smp' ? 'text-[#16A34A] hover:text-[#14532D]' : 'text-[#1B5FD9] hover:text-[#0A2A5C]'"
          @click="emit('item-click', 'Semua notifikasi ditandai dibaca')"
        >
          Tandai dibaca
        </button>
      </div>

      <div class="flex flex-col divide-y divide-[#EFF2F7]">
        <div
          class="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFD] transition cursor-pointer"
          @click="emit('item-click', 'Tunggakan SPP')"
        >
          <span
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon name="wallet" :size="17" />
          </span>
          <div class="flex-1 min-w-0">
            <b class="text-xs font-bold text-[#101828] block truncate">SPP 24 siswa jatuh tempo</b>
            <span class="text-[11px] text-[#667085] block truncate mt-0.5">Tunggakan bulan Oktober</span>
          </div>
          <span class="text-[10px] text-[#98A2B3] shrink-0 font-medium">2 j</span>
        </div>

        <div
          class="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFD] transition cursor-pointer"
          @click="emit('item-click', 'Persiapan Gladi Bersih CBT')"
        >
          <span
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon name="cal" :size="17" />
          </span>
          <div class="flex-1 min-w-0">
            <b class="text-xs font-bold text-[#101828] block truncate">Gladi bersih CBT 6 hari lagi</b>
            <span class="text-[11px] text-[#667085] block truncate mt-0.5">120 perangkat lab perlu dicek</span>
          </div>
          <span class="text-[10px] text-[#98A2B3] shrink-0 font-medium">5 j</span>
        </div>

        <div
          class="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFD] transition cursor-pointer"
          @click="emit('item-click', 'Pengajuan Cuti Guru')"
        >
          <span
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon name="users" :size="17" />
          </span>
          <div class="flex-1 min-w-0">
            <b class="text-xs font-bold text-[#101828] block truncate">3 pengajuan cuti menunggu</b>
            <span class="text-[11px] text-[#667085] block truncate mt-0.5">Dari guru mapel produktif</span>
          </div>
          <span class="text-[10px] text-[#98A2B3] shrink-0 font-medium">1 h</span>
        </div>
      </div>
    </div>

    <!-- Profile Popover -->
    <div
      v-if="isProfileOpen"
      class="fixed z-[80] top-[72px] right-3 sm:right-6 w-72 max-w-[calc(100vw-24px)] bg-white border border-[#E7EBF2] rounded-2xl shadow-[0_24px_48px_-16px_rgba(16,24,40,0.25)] overflow-hidden"
      @click.stop
    >
      <div class="px-4 py-3 border-b border-[#E7EBF2] flex justify-between items-center text-sm font-extrabold text-[#101828]">
        <span class="truncate">{{ profileName }}</span>
        <span class="text-[10.5px] font-bold py-0.5 px-2.5 rounded-full text-[#12B76A] bg-[#E7F8F0]">
          Aktif
        </span>
      </div>

      <div class="px-4 py-2.5 border-b border-[#EFF2F7] bg-[#FAFCFE]">
        <span class="text-[10.5px] font-bold text-[#667085]">
          {{ profileRole }}
        </span>
      </div>
      <div class="flex flex-col divide-y divide-[#EFF2F7]">
        <div
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFD] transition cursor-pointer"
          @click="handleProfileAction('Profil Saya')"
        >
          <span
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon name="users" :size="16" />
          </span>
          <div class="flex-1 min-w-0">
            <b class="text-xs font-bold text-[#101828] block truncate">Profil Saya</b>
            <span class="text-[11px] text-[#667085] block truncate">{{ profileEmail }}</span>
          </div>
        </div>

        <div
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFD] transition cursor-pointer"
          @click="handleProfileAction('Pengaturan')"
        >
          <span
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon name="gear" :size="16" />
          </span>
          <div class="flex-1 min-w-0">
            <b class="text-xs font-bold text-[#101828] block truncate">Pengaturan</b>
            <span class="text-[11px] text-[#667085] block truncate">Preferensi &amp; akses</span>
          </div>
        </div>

        <div
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFD] transition cursor-pointer"
          role="switch"
          :aria-checked="isDark"
          tabindex="0"
          @click="toggleTheme"
          @keydown.enter.prevent="toggleTheme"
          @keydown.space.prevent="toggleTheme"
        >
          <span
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
          >
            <AdminV2Icon name="moon" :size="16" />
          </span>
          <div class="flex-1 min-w-0">
            <b class="text-xs font-bold text-[#101828] block truncate">Mode Gelap</b>
            <span class="text-[11px] text-[#667085] block truncate">{{ isDark ? 'Aktif' : 'Nonaktif' }}</span>
          </div>
          <span
            class="relative w-10 h-[22px] rounded-full transition-colors shrink-0"
            :class="isDark ? 'bg-[#1B5FD9]' : 'bg-[#D9E0EC]'"
            aria-hidden="true"
          >
            <span
              class="absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform"
              :class="isDark ? 'translate-x-[18px]' : 'translate-x-0'"
            />
          </span>
        </div>

        <div
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFD] transition cursor-pointer"
          @click="handleProfileAction('Keluar')"
        >
          <span class="w-8 h-8 rounded-lg bg-[#EFF2F7] flex items-center justify-center text-[#344054] shrink-0">
            <AdminV2Icon name="out" :size="16" />
          </span>
          <div class="flex-1 min-w-0">
            <b class="text-xs font-bold text-[#101828] block truncate">Keluar</b>
            <span class="text-[11px] text-[#667085] block truncate">Akhiri sesi admin</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Spotlight Search Overlay Modal -->
    <div
      v-if="isSearchOpen"
      class="fixed inset-0 z-[90] bg-[#101828]/45 backdrop-blur-sm flex items-start justify-center pt-20 px-4 pb-4"
      @click="emit('close-all')"
    >
      <div
        class="bg-white rounded-[18px] w-full max-w-[520px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)] overflow-hidden"
        @click.stop
      >
        <div class="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#E7EBF2]">
          <AdminV2Icon name="search" :size="18" class="text-[#98A2B3]" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Cari siswa, guru, modul, transaksi..."
            class="border-none outline-none text-sm w-full text-[#101828] placeholder-[#98A2B3]"
          >
          <button
            type="button"
            class="w-7 h-7 rounded-lg flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition"
            aria-label="Tutup"
            @click="emit('close-all')"
          >
            <AdminV2Icon name="x" :size="16" />
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto p-2 space-y-1">
          <template v-if="filteredSearch.length > 0">
            <a
              v-for="([category, title], idx) in filteredSearch"
              :key="idx"
              href="#"
              class="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-[#101828] hover:bg-[#EFF2F7] transition"
              @click.prevent="handleSearchSelect(title)"
            >
              <span class="w-[30px] h-[30px] rounded-[9px] bg-[#EFF2F7] flex items-center justify-center text-[#344054] shrink-0">
                <AdminV2Icon name="search" :size="15" />
              </span>
              <span class="flex-1 min-w-0">
                <span class="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider block">{{ category }}</span>
                <span class="text-xs text-[#101828] block truncate font-medium">{{ title }}</span>
              </span>
            </a>
          </template>
          <div v-else class="py-6 text-center text-xs text-[#667085]">
            Tidak ada hasil untuk "{{ searchQuery }}"
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
