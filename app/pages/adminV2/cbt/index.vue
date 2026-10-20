<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import CbtV2Header from '~/components/adminV2/cbt/CbtV2Header.vue'
import CbtV2Tabs from '~/components/adminV2/cbt/CbtV2Tabs.vue'
import CbtV2Summary from '~/components/adminV2/cbt/CbtV2Summary.vue'
import CbtV2Monitoring from '~/components/adminV2/cbt/CbtV2Monitoring.vue'
import CbtV2Bank from '~/components/adminV2/cbt/CbtV2Bank.vue'
import CbtV2Exams from '~/components/adminV2/cbt/CbtV2Exams.vue'
import CbtV2Results from '~/components/adminV2/cbt/CbtV2Results.vue'
import CbtV2Management from '~/components/adminV2/cbt/CbtV2Management.vue'
import CbtV2Drawer from '~/components/adminV2/cbt/CbtV2Drawer.vue'
import CbtV2MobileNav from '~/components/adminV2/cbt/CbtV2MobileNav.vue'
import { GROUPS, type GroupItem } from '~/components/adminV2/adminV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import {
  CBT_TABS,
  INITIAL_STUDENTS,
  type GradeType,
  type CbtTabId,
  type StudentScore
} from '~/components/adminV2/cbt/cbtV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Darqia 9 · Manajemen CBT V2',
  meta: [
    { name: 'description', content: 'Manajemen CBT Digital V2 untuk SMK IT Attaqwa 9 & SMP IT Bina Cendekia Assalam' }
  ]
})

const route = useRoute()
const router = useRouter()
const queryValue = (value: unknown) => Array.isArray(value) ? value[0] : value
const initialGrade: GradeType = queryValue(route.query.jenjang) === 'smp' ? 'SMP' : 'SMK'
const initialTab = queryValue(route.query.tab)
const initialActiveTab: CbtTabId = CBT_TABS.some(tab => tab.id === initialTab)
  ? initialTab as CbtTabId
  : 'summary'

// Unified Top Navigation & RBAC State
const jenjang = ref<'smp' | 'smk'>(initialGrade === 'SMP' ? 'smp' : 'smk')
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')

const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)

const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isNotifOpen = ref(false)
const isProfileOpen = ref(false)

// Core CBT State
const cbtData = useAdminCbtData()
const grade = ref<GradeType>(initialGrade)
const activeTab = ref<CbtTabId>(initialActiveTab)
const exams = computed(() => cbtData.exams.value)
const students = ref<StudentScore[]>([...INITIAL_STUDENTS])

// Drawer State
const isDrawerOpen = ref(false)
const drawerType = ref<string>('exam')
const drawerPayload = ref<any>(null)

// Toast State
const toastMessage = ref('')
const isToastVisible = ref(false)
let toastTimeout: ReturnType<typeof setTimeout> | null = null

const syncRoute = () => router.replace({
  query: {
    ...route.query,
    tab: activeTab.value,
    jenjang: jenjang.value
  }
})

watch(() => route.query.tab, value => {
  const tab = queryValue(value)
  if (CBT_TABS.some(item => item.id === tab)) activeTab.value = tab as CbtTabId
})

watch(() => route.query.jenjang, value => {
  const nextJenjang = queryValue(value)
  if (nextJenjang === 'smp' || nextJenjang === 'smk') {
    jenjang.value = nextJenjang
    grade.value = nextJenjang === 'smp' ? 'SMP' : 'SMK'
  }
})

const triggerToast = (msg: string) => {
  toastMessage.value = msg
  isToastVisible.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    isToastVisible.value = false
  }, 2800)
}

// Navigation & Jenjang Handlers
const setJenjang = (val: 'smp' | 'smk') => {
  jenjang.value = val
  grade.value = val === 'smp' ? 'SMP' : 'SMK'
  syncRoute()
  triggerToast(`Beralih ke ${val === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'}`)
}

const setRole = (r: 'superadmin' | 'admin_tu' | 'guru') => {
  role.value = r
  closeAllModals()
  const msg = r === 'guru'
    ? 'Mode Guru: menu Keuangan disembunyikan'
    : `Mode ${r === 'superadmin' ? 'Superadmin' : 'Admin TU'}`
  triggerToast(msg)
}

const toggleMega = (g: GroupItem) => {
  if (g.id === 'dashboard') {
    isMegaOpen.value = false
    activeMegaGroup.value = null
    navigateTo('/adminV2')
    return
  }
  if (isMegaOpen.value && activeMegaGroup.value?.id === g.id) {
    isMegaOpen.value = false
    activeMegaGroup.value = null
  } else {
    activeMegaGroup.value = g
    isMegaOpen.value = true
    closeAllPopovers()
  }
}

const toggleMegaByGroup = (groupId: string) => {
  const g = GROUPS.find(item => item.id === groupId)
  if (g) toggleMega(g)
}

const closeAllPopovers = () => {
  isNotifOpen.value = false
  isProfileOpen.value = false
}

const closeAllModals = () => {
  isMegaOpen.value = false
  isMobileMenuOpen.value = false
  isSearchOpen.value = false
  closeAllPopovers()
}

const toggleSearch = () => {
  closeAllPopovers()
  isMegaOpen.value = false
  isSearchOpen.value = !isSearchOpen.value
}

const toggleNotif = () => {
  isProfileOpen.value = false
  isMegaOpen.value = false
  isNotifOpen.value = !isNotifOpen.value
}

const toggleProfile = () => {
  isNotifOpen.value = false
  isMegaOpen.value = false
  isProfileOpen.value = !isProfileOpen.value
}

const handleSelectModule = (title: string) => {
  isMegaOpen.value = false
  isMobileMenuOpen.value = false
  if (title === 'Dashboard') {
    return navigateTo('/adminV2')
  }
  if (title.toLowerCase().includes('absensi') && (title.toLowerCase().includes('guru') || title.toLowerCase().includes('staff'))) {
    return navigateTo('/adminV2/absensi-guru')
  }
  if (title.toLowerCase().includes('absensi')) {
    return navigateTo('/adminV2/absensi')
  }
  if (title === 'Manajemen CBT' || title === 'Ujian digital' || title.toLowerCase().includes('cbt')) {
    switchTab('summary')
    return
  }
  if (title === 'Data siswa' || title === 'Data induk siswa' || (title.toLowerCase().includes('siswa') && !title.toLowerCase().includes('kelas'))) {
    return navigateTo('/adminV2/siswa')
  }
  if (title.toLowerCase().includes('kelas')) {
    return navigateTo('/adminV2/kelas')
  }
  if (title.toLowerCase().includes('mapel')) {
    return navigateTo('/adminV2/mapel')
  }
  if (title.toLowerCase().includes('raport') || title.toLowerCase().includes('rapor')) {
    return navigateTo('/adminV2/raport')
  }
  if (title.toLowerCase().includes('guru') || title.toLowerCase().includes('pegawai') || title.toLowerCase().includes('staff')) {
    return navigateTo('/adminV2/guru')
  }
  triggerToast(`${title} — modul demo`)
}

// Freeze Emergency State (PRD §03)
const isFrozen = ref(false)
const toggleFreeze = () => {
  isFrozen.value = !isFrozen.value
  if (isFrozen.value) {
    triggerToast('DARURAT: semua timer ujian dibekukan.')
  } else {
    triggerToast('Semua timer dilanjutkan — kompensasi waktu otomatis diterapkan.')
  }
}

// Live exam count for current grade (for tab badge)
const liveExamCount = computed(() => {
  return exams.value.filter(e => ((e as any).grade === grade.value || e.g === grade.value) && e.status === 'Berlangsung').length
})

// Tab navigation handler
const switchTab = (tab: CbtTabId) => {
  activeTab.value = tab
  syncRoute()
  isMobileMenuOpen.value = false
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Drawer Open/Close Handlers
const openDrawer = (type: string, payload?: any) => {
  drawerType.value = type
  drawerPayload.value = payload ?? null
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

// Copy Token with Clipboard API fallback
const copyToken = async (token: string) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(token)
      triggerToast('Token ujian berhasil disalin')
    } else {
      triggerToast(`Token: ${token}`)
    }
  } catch {
    triggerToast(`Token: ${token}`)
  }
}

// Interactive Save Essay Score
const saveStudentScore = (nisn: string, score: number) => {
  const target = students.value.find(s => s.nisn === nisn)
  if (target) {
    target.essayScore = score
    target.finalScore = target.pgScore + score
    target.status = target.finalScore >= 75 ? 'Lulus' : 'Remedial'
    triggerToast('Nilai contoh esai berhasil disimpan')
    closeDrawer()
  }
}

// Keyboard shortcuts (Escape key closes drawer & mobile menu)
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isDrawerOpen.value) {
      closeDrawer()
    }
    closeAllModals()
  }
}

onMounted(() => {
  cbtData.load(true)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('click', handleDocumentClick)
  }
})

const handleDocumentClick = (e: MouseEvent) => {
  if (!isMegaOpen.value) return
  const target = e.target as HTMLElement
  if (!target.closest('.sticky')) {
    isMegaOpen.value = false
    activeMegaGroup.value = null
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans antialiased pb-24 lg:pb-14 selection:bg-[#101828] selection:text-white overflow-x-clip"
    @click="closeAllModals"
  >
    <!-- STICKY TOPBAR & INTEGRATED MEGA PANEL (Unified with Admin V2) -->
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header
        :jenjang="jenjang"
        :role="role"
        :groups="GROUPS"
        :active-group-id="activeMegaGroup?.id"
        :is-mega-open="isMegaOpen"
        current-route="cbt"
        @update:jenjang="setJenjang"
        @toggle-mega="toggleMega"
        @open-mobile-menu="isMobileMenuOpen = true"
        @toggle-search="toggleSearch"
        @toggle-notif="toggleNotif"
        @toggle-profile="toggleProfile"
      />

      <!-- SUB NAVBAR KHUSUS BREADCRUMB (Desktop & Mobile: Sticky Sub-Navbar) -->
      <AdminV2Breadcrumb
        :items="[
          { label: 'Portal Admin', to: '/adminV2' },
          { label: 'Aplikasi' },
          { label: 'Manajemen CBT' }
        ]"
        :badge="grade === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'"
        :jenjang="grade === 'SMP' ? 'smp' : 'smk'"
      />

      <AdminV2MegaPanel
        :open="isMegaOpen"
        :group="activeMegaGroup"
        :jenjang="jenjang"
        @close="isMegaOpen = false"
        @select-item="handleSelectModule"
      />
    </div>

    <!-- CBT PAGE HERO HEADER (1440px) -->
    <CbtV2Header
      :grade="grade"
      :active-tab="activeTab"
      @navigate-tab="switchTab"
    />

    <!-- SUBMODULE TABS (1440px) -->
    <CbtV2Tabs
      :active-tab="activeTab"
      :grade="grade"
      :live-exam-count="liveExamCount"
      @update:active-tab="switchTab"
    />

    <!-- MAIN PANELS CONTAINER (1440px) -->
    <main class="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <!-- 1. Ringkasan Panel -->
        <div v-if="activeTab === 'summary'" key="summary">
          <CbtV2Summary
            :grade="grade"
            :exams="exams"
            @switch-tab="switchTab"
            @open-drawer="openDrawer"
            @copy-token="copyToken"
            @toast="triggerToast"
          />
        </div>

        <!-- 2. Monitoring Ujian Panel -->
        <div v-else-if="activeTab === 'monitoring'" key="monitoring">
          <CbtV2Monitoring
            :grade="grade"
            :exams="exams"
            :is-frozen="isFrozen"
            @open-drawer="openDrawer"
            @copy-token="copyToken"
            @toast="triggerToast"
            @switch-tab="switchTab"
          />
        </div>

        <!-- 3. Bank Soal Panel -->
        <div v-else-if="activeTab === 'bank'" key="bank">
          <CbtV2Bank
            :key="grade"
            :grade="grade"
            @open-drawer="openDrawer"
            @toast="triggerToast"
          />
        </div>

        <!-- 4. Daftar Ujian Panel -->
        <div v-else-if="activeTab === 'exams'" key="exams">
          <CbtV2Exams
            :grade="grade"
            :exams="exams"
            @open-drawer="openDrawer"
            @copy-token="copyToken"
            @toast="triggerToast"
          />
        </div>

        <!-- 5. Nilai Siswa Panel -->
        <div v-else-if="activeTab === 'results'" key="results">
          <CbtV2Results
            :grade="grade"
            :students="students"
            @open-drawer="openDrawer"
            @toast="triggerToast"
          />
        </div>

        <!-- 6. Manajemen Ujian Panel -->
        <div v-else-if="activeTab === 'management'" key="management">
          <CbtV2Management
            :grade="grade"
            :students="students"
            :is-frozen="isFrozen"
            @open-drawer="openDrawer"
            @copy-token="copyToken"
            @toast="triggerToast"
            @toggle-freeze="toggleFreeze"
          />
        </div>
      </Transition>
    </main>

    <!-- SLIDE-OVER DRAWER -->
    <CbtV2Drawer
      :open="isDrawerOpen"
      :drawer-type="drawerType"
      :payload="drawerPayload"
      :grade="grade"
      :students="students"
      @close="closeDrawer"
      @switch-tab="switchTab"
      @copy-token="copyToken"
      @save-score="saveStudentScore"
      @toast="triggerToast"
    />

    <!-- MOBILE BOTTOM NAVIGATION -->
    <CbtV2MobileNav
      :active-tab="activeTab"
      :grade="grade"
      :menu-open="false"
      @update:active-tab="switchTab"
      @toggle-menu="isMobileMenuOpen = true"
      @close-menu="isMobileMenuOpen = false"
      @toast="triggerToast"
    />

    <!-- Full-screen Mobile Menu Drawer -->
    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :role="role"
      :groups="GROUPS"
      :jenjang="jenjang"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
      @profile-click="() => { isMobileMenuOpen = false; triggerToast('Profil Saya — demo') }"
      @settings-click="() => { isMobileMenuOpen = false; triggerToast('Pengaturan — demo') }"
      @logout-click="() => { isMobileMenuOpen = false; triggerToast('Keluar — demo') }"
    />

    <!-- Popovers and Modals (Notif, Profile, Search) -->
    <AdminV2Popovers
      :is-notif-open="isNotifOpen"
      :is-profile-open="isProfileOpen"
      :is-search-open="isSearchOpen"
      :role="role"
      :jenjang="jenjang"
      @close-all="closeAllModals"
      @update:role="setRole"
      @item-click="(label) => triggerToast(`${label} — demo`)"
    />

    <!-- GLOBAL TOAST NOTIFICATION -->
    <AdminV2Toast
      :message="toastMessage"
      :visible="isToastVisible"
    />
  </div>
</template>
