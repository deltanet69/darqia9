<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import ProfilV2Hero from '~/components/adminV2/profil/ProfilV2Hero.vue'
import ProfilV2SlimHeader from '~/components/adminV2/profil/ProfilV2SlimHeader.vue'
import ProfilV2OverviewTab from '~/components/adminV2/profil/ProfilV2OverviewTab.vue'
import ProfilV2DataProfilTab from '~/components/adminV2/profil/ProfilV2DataProfilTab.vue'
import ProfilV2AplikasiTab from '~/components/adminV2/profil/ProfilV2AplikasiTab.vue'
import ProfilV2PengaturanTab from '~/components/adminV2/profil/ProfilV2PengaturanTab.vue'
import ProfilV2DemoPanel from '~/components/adminV2/profil/ProfilV2DemoPanel.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import {
  PROFILES,
  type ProfileAccount,
  type ProfileTabKey,
  type NotificationPrefs
} from '~/components/adminV2/profil/profilV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Profil Saya — Admin Portal Darqia 9',
  meta: [
    {
      name: 'description',
      content: 'Kelola data pribadi, identitas RFID presensi, hak akses aplikasi RBAC, dan keamanan akun di Admin Portal Darqia 9.'
    }
  ]
})

const router = useRouter()
const route = useRoute()

/* ================= STATE GLOBAL ================= */
const jenjang = ref<'smk' | 'smp'>('smk')
const currentWho = ref<string>('budi')
const isProfileTab = (value: unknown): value is ProfileTabKey => ['overview', 'dataprofil', 'aplikasi', 'pengaturan'].includes(value as ProfileTabKey)
const activeTab = ref<ProfileTabKey>(isProfileTab(route.query.tab) ? route.query.tab : 'overview')
const themeIdx = ref<number>(0)
const themeOpen = ref<boolean>(false)
const isEditing = ref<boolean>(false)

// State Profil Reaktif (Clone data untuk simulasi demo)
const profilesState = reactive<Record<string, ProfileAccount>>({ ...PROFILES })
const currentProfile = computed<ProfileAccount>(() => profilesState[currentWho.value] || PROFILES.budi)

// Form Edit Data Mandiri
const editForm = reactive({
  alamat: '',
  kel: '',
  kec: '',
  kab: '',
  email: '',
  wa: ''
})

const syncEditForm = () => {
  editForm.alamat = currentProfile.value.alamat
  editForm.kel = currentProfile.value.kel
  editForm.kec = currentProfile.value.kec
  editForm.kab = currentProfile.value.kab
  editForm.email = currentProfile.value.email
  editForm.wa = currentProfile.value.wa
}

// Preferensi Notifikasi
const prefs = reactive<NotificationPrefs>({
  wa: true,
  email: true,
  jadwal: true
})

// Popovers & Shell Navigasi
const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)
const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isNotifOpen = ref(false)
const isProfileOpen = ref(false)

// Toast State
const toastMessage = ref('')
const isToastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const triggerToast = (msg: string) => {
  toastMessage.value = msg
  isToastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    isToastVisible.value = false
  }, 2600)
}

// Role map untuk header shell
const shellRole = computed<'superadmin' | 'admin_tu' | 'guru'>(() => {
  if (currentProfile.value.roleSys === 'Super Admin') return 'superadmin'
  if (currentProfile.value.roleSys === 'Staff TU' || currentProfile.value.roleSys === 'Admin Keuangan') return 'admin_tu'
  return 'guru'
})

// Format Tanggal Hari Ini
const formattedTodayDate = computed(() => {
  const d = new Date()
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
})

/* ================= EVENT HANDLERS ================= */
const closeAllPopovers = () => {
  isMegaOpen.value = false
  isSearchOpen.value = false
  isNotifOpen.value = false
  isProfileOpen.value = false
}

const toggleMega = (group: GroupItem) => {
  if (activeMegaGroup.value?.id === group.id && isMegaOpen.value) {
    isMegaOpen.value = false
  } else {
    activeMegaGroup.value = group
    isMegaOpen.value = true
  }
}

const handleSelectModule = (title: string) => {
  closeAllPopovers()
  const dest = getAdminDestination(title)
  if (dest && dest !== '#') return router.push(dest)
  triggerToast(`${title} — modul demo`)
}

// Switch Akun Demo
const handleSwitchAccount = (who: string) => {
  currentWho.value = who
  isEditing.value = false
  themeOpen.value = false
  syncEditForm()
  triggerToast(`Beralih akun: ${currentProfile.value.name}`)
}

// Edit Profil
const handleStartEdit = () => {
  syncEditForm()
  isEditing.value = true
  if (activeTab.value !== 'dataprofil' && activeTab.value !== 'pengaturan') {
    activeTab.value = 'dataprofil'
  }
}

const handleCancelEdit = () => {
  isEditing.value = false
}

const handleSaveEdit = () => {
  if (!editForm.alamat.trim()) {
    triggerToast('Alamat domisili tidak boleh kosong.')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
    triggerToast('Format email tidak valid — periksa kembali.')
    return
  }
  if (editForm.wa.replace(/\D/g, '').length < 10) {
    triggerToast('Nomor WhatsApp minimal 10 digit.')
    return
  }

  // Simpan perubahan ke state reaktif
  const p = currentProfile.value
  p.alamat = editForm.alamat.trim()
  p.kel = editForm.kel.trim()
  p.kec = editForm.kec.trim()
  p.kab = editForm.kab.trim()
  p.email = editForm.email.trim()
  p.wa = editForm.wa.trim()

  isEditing.value = false
  triggerToast('Profil berhasil diperbarui.')
}

const handleCopyText = (text: string) => {
  try {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    }
  } catch (err) {
    console.error('Clipboard copy failed', err)
  }
  triggerToast(`${text} tersalin ke clipboard.`)
}

const handleUploadFoto = () => {
  triggerToast('Foto terpilih — pada versi produksi foto akan diunggah & disimpan.')
}

const handleTogglePref = (key: keyof NotificationPrefs) => {
  prefs[key] = !prefs[key]
  triggerToast('Preferensi notifikasi diperbarui.')
}

const handleUpdatePassword = () => {
  triggerToast('Kata sandi berhasil diperbarui.')
}

onMounted(() => {
  syncEditForm()
})
</script>

<template>
  <div
    class="min-h-screen overflow-x-clip bg-[#F3F5F9] font-sans text-[#101828] antialiased selection:bg-[#101828] selection:text-white pb-24 lg:pb-12"
    @click="closeAllPopovers"
  >
    <!-- STICKY HEADER -->
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header
        :jenjang="jenjang"
        :role="shellRole"
        :groups="GROUPS"
        :active-group-id="activeMegaGroup?.id || 'sistem'"
        :current-route="'sistem'"
        :is-mega-open="isMegaOpen"
        @update:jenjang="jenjang = $event"
        @toggle-mega="toggleMega"
        @open-mobile-menu="isMobileMenuOpen = true"
        @toggle-search="isSearchOpen = !isSearchOpen"
        @toggle-notif="isNotifOpen = !isNotifOpen"
        @toggle-profile="isProfileOpen = !isProfileOpen"
      />

      <AdminV2MegaPanel
        :open="isMegaOpen"
        :group="activeMegaGroup"
        :jenjang="jenjang"
        @close="isMegaOpen = false"
        @select-item="handleSelectModule"
      />
    </div>

    <!-- MAIN CONTAINER -->
    <main class="mx-auto max-w-[1440px] space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <!-- Page Header & Greeting (.greet) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-2">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl flex items-center gap-2.5 flex-wrap">
            <span>Profil Saya</span>
            <span
              id="gradeBadge"
              class="rounded-full px-3 py-1 text-xs font-bold transition-colors"
              :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#1B5FD9]'"
            >
              {{ jenjang.toUpperCase() }}
            </span>
          </h1>
          <p class="mt-1 text-xs text-[#667085]">
            Data pribadi, kepegawaian &amp; keamanan akun &bull; {{ jenjang === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }} &bull; Tahun Ajaran 2026/2027
          </p>
        </div>

        <div class="hidden items-center gap-2 sm:flex">
          <span class="rounded-full border border-[#E7EBF2] bg-white px-3 py-1.5 text-xs font-bold text-[#667085] shadow-2xs">
            {{ formattedTodayDate }}
          </span>
          <span class="rounded-full border border-dashed border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-bold text-[#475467]">
            Preview Profil v4
          </span>
        </div>
      </div>

      <!-- Segmented Control Tabs Navigation (#ctabs) -->
      <div
        class="sticky top-[70px] z-30 inline-flex max-w-full overflow-x-auto rounded-full border border-[#E7EBF2] bg-white/85 p-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.07)] backdrop-blur-md mb-3"
        role="tablist"
      >
        <button
          v-for="tab in ([
            { key: 'overview', label: 'Overview', icon: 'grid' },
            { key: 'dataprofil', label: 'Data Profil', icon: 'user' },
            { key: 'aplikasi', label: 'Aplikasi Saya', icon: 'layers' },
            { key: 'pengaturan', label: 'Pengaturan', icon: 'gear' }
          ] as const)"
          :key="tab.key"
          type="button"
          class="flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-all whitespace-nowrap"
          :class="activeTab === tab.key ? 'bg-white text-[#101828] font-bold shadow-[0_1px_4px_rgba(16,24,40,0.14)]' : 'text-[#475467] font-semibold hover:text-[#101828]'"
          @click="activeTab = tab.key"
        >
          <AdminV2Icon :name="tab.icon" :size="15" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- HERO / SLIM HEADER SESUAI ACTIVE TAB -->
      <ProfilV2Hero
        v-if="activeTab === 'overview'"
        :profile="currentProfile"
        :theme-idx="themeIdx"
        :theme-open="themeOpen"
        :is-editing="isEditing"
        @update:theme-idx="themeIdx = $event"
        @toggle-theme-picker="themeOpen = !themeOpen"
        @start-edit="handleStartEdit"
        @save-edit="handleSaveEdit"
        @cancel-edit="handleCancelEdit"
        @copy-text="handleCopyText"
        @upload-foto="handleUploadFoto"
      />

      <ProfilV2SlimHeader
        v-else
        :profile="currentProfile"
        :theme-idx="themeIdx"
        :theme-open="themeOpen"
        :is-editing="isEditing"
        @update:theme-idx="themeIdx = $event"
        @toggle-theme-picker="themeOpen = !themeOpen"
        @start-edit="handleStartEdit"
        @save-edit="handleSaveEdit"
        @cancel-edit="handleCancelEdit"
      />

      <!-- TAB 1: OVERVIEW -->
      <ProfilV2OverviewTab
        v-if="activeTab === 'overview'"
        :profile="currentProfile"
        @navigate-tab="activeTab = $event"
      />

      <!-- TAB 2: DATA PROFIL -->
      <ProfilV2DataProfilTab
        v-else-if="activeTab === 'dataprofil'"
        :profile="currentProfile"
        :is-editing="isEditing"
        :edit-form="editForm"
      />

      <!-- TAB 3: APLIKASI SAYA (RBAC) -->
      <ProfilV2AplikasiTab
        v-else-if="activeTab === 'aplikasi'"
        :profile="currentProfile"
      />

      <!-- TAB 4: PENGATURAN & KEAMANAN -->
      <ProfilV2PengaturanTab
        v-else-if="activeTab === 'pengaturan'"
        :profile="currentProfile"
        :is-editing="isEditing"
        :edit-form="editForm"
        :prefs="prefs"
        @update-password="handleUpdatePassword"
        @toggle-pref="handleTogglePref"
      />
    </main>

    <!-- FLOATING DEMO SIMULATION PANEL -->
    <ProfilV2DemoPanel
      :profile="currentProfile"
      :current-who="currentWho"
      @switch-account="handleSwitchAccount"
    />

    <!-- BOTTOM BAR & POPOVERS MOBILE -->
    <AdminV2BottomNav
      :role="shellRole"
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @nav-click="handleSelectModule"
    />

    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :role="shellRole"
      :jenjang="jenjang"
      :groups="GROUPS"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
    />

    <AdminV2Popovers
      :is-search-open="isSearchOpen"
      :is-notif-open="isNotifOpen"
      :is-profile-open="isProfileOpen"
      :role="shellRole"
      @close="closeAllPopovers"
      @switch-role="triggerToast('Role diubah via popover')"
      @toast="triggerToast"
    />

    <AdminV2Toast
      :visible="isToastVisible"
      :message="toastMessage"
    />
  </div>
</template>
