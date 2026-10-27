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
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import {
  CBT_TABS,
  INITIAL_STUDENTS,
  type GradeType,
  type CbtTabId,
  type StudentScore
} from '~/components/adminV2/cbt/cbtV2Data'

const props = withDefaults(defineProps<{
  source?: 'cbt' | 'ujian_harian'
}>(), {
  source: 'cbt'
})

const route = useRoute()
const router = useRouter()

const assessmentSource = computed<'cbt' | 'ujian_harian'>(() => {
  if (props.source === 'ujian_harian') return 'ujian_harian'
  if (route.query.mode === 'ujian_harian' || route.path.toLowerCase().includes('/adminv2/lms')) return 'ujian_harian'
  return 'cbt'
})

const isDailyAssessment = computed(() => assessmentSource.value === 'ujian_harian')
const moduleName = computed(() => isDailyAssessment.value ? 'LMS Ujian Harian' : 'Manajemen CBT')
const moduleDescription = computed(() => isDailyAssessment.value ? 'Bank Soal LMS · ujian harian' : 'Bank Soal CBT · PTS/PAS')

useHead({
  title: () => `Darqia 9 · ${moduleName.value} V2`,
  meta: [
    { name: 'description', content: () => `${moduleName.value} Digital V2 untuk SMK IT Attaqwa 9 & SMP IT Bina Cendekia Assalam` }
  ]
})

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
const cbtData = useAdminCbtData(assessmentSource.value)
const grade = ref<GradeType>(initialGrade)
const activeTab = ref<CbtTabId>(initialActiveTab)
const bankEntry = ref(0)
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
let monitoringRefresh: ReturnType<typeof setInterval> | null = null

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

watch([activeTab, () => cbtData.loading.value], ([tab, isLoading]) => {
  if (tab === 'bank' && !isLoading) {
    void cbtData.loadQuestions().catch(() => {})
  }
})
watch(activeTab, tab => {
  if (tab === 'monitoring') void cbtData.load(true)
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
  const dest = getAdminDestination(title)
  if (dest) {
    return navigateTo(dest)
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
  return exams.value.filter(e => e.grade === grade.value && e.status === 'Berlangsung').length
})

// Tab navigation handler
const switchTab = (tab: CbtTabId) => {
  if (tab === 'bank') bankEntry.value++
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
    target.totalScore = target.pgScore + score
    target.status = target.totalScore >= 75 ? 'Lulus' : 'Remedial'
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
  monitoringRefresh = setInterval(() => {
    if (activeTab.value === 'monitoring') void cbtData.load(true)
  }, 15_000)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  if (monitoringRefresh) clearInterval(monitoringRefresh)
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
          { label: moduleName }
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
      :module-name="moduleName"
      :module-description="moduleDescription"
      @navigate-tab="switchTab"
    />

    <!-- SUBMODULE TABS (1440px) -->
    <CbtV2Tabs
      :bank-label="moduleDescription"
      :active-tab="activeTab"
      :live-exam-count="liveExamCount"
      :grade="grade"
      @update:active-tab="switchTab"
    />

    <main class="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 lg:pb-10">
      <!-- TAB 1: SUMMARY TAB -->
      <div
        v-if="cbtData.loading.value || cbtData.questionsLoading.value"
        class="mb-4 rounded-xl border border-[#D9E2F0] bg-white px-4 py-3 text-xs font-semibold text-[#475467]"
        role="status"
      >
        Memuat data {{ moduleName }}...
      </div>
      <div
        v-else-if="cbtData.error.value"
        class="mb-4 rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-xs text-[#B42318]"
        role="alert"
      >
        Data gagal dimuat: {{ cbtData.error.value }}. Muat ulang halaman untuk mencoba kembali.
      </div>

      <CbtV2Summary
        v-if="activeTab === 'summary'"
        :grade="grade"
        :exams="exams"
        :source="assessmentSource"
        @open-drawer="openDrawer"
        @switch-tab="switchTab"
        @copy-token="copyToken"
        @toast="triggerToast"
      />

      <!-- TAB 2: LIVE MONITORING TAB -->
      <CbtV2Monitoring
        v-else-if="activeTab === 'monitoring'"
        :grade="grade"
        :source="assessmentSource"
        :is-frozen="isFrozen"
        @toggle-freeze="toggleFreeze"
        @open-drawer="openDrawer"
        @copy-token="copyToken"
        @toast="triggerToast"
        @switch-tab="switchTab"
        :exams="exams"
      />

      <!-- TAB 3: QUESTION BANK TAB -->
      <CbtV2Bank
        :key="`bank-${assessmentSource}-${grade}-${bankEntry}`"
        v-else-if="activeTab === 'bank'"
        :grade="grade"
        :source="assessmentSource"
        @open-drawer="openDrawer"
        @toast="triggerToast"
      />

      <!-- TAB 4: EXAM SCHEDULE & LIST TAB -->
      <CbtV2Exams
        :key="`exams-${assessmentSource}-${grade}`"
        v-else-if="activeTab === 'exams'"
        :grade="grade"
        :source="assessmentSource"
        @open-drawer="openDrawer"
        @copy-token="copyToken"
        :exams="exams"
        @toast="triggerToast"
      />

      <!-- TAB 5: STUDENT RESULTS & GRADES TAB -->
      <CbtV2Results
        v-else-if="activeTab === 'results'"
        :grade="grade"
        :students="students"
        @open-drawer="openDrawer"
        @toast="triggerToast"
      />

      <!-- TAB 6: SETTINGS & CBT MANAGEMENT TAB -->
      <CbtV2Management
        v-else-if="activeTab === 'management'"
        :grade="grade"
        :is-frozen="isFrozen"
        @toggle-freeze="toggleFreeze"
        @toast="triggerToast"
      />
    </main>

    <!-- UNIFIED SIDE DRAWER (Create Exam, Bank Detail, Student Grade Detail, Token Display) -->
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
      :module-name="moduleName"
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
      @logout-click="isMobileMenuOpen = false"
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
