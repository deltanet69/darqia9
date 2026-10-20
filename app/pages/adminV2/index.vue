<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2HeroCard from '~/components/adminV2/AdminV2HeroCard.vue'
import AdminV2Metrics from '~/components/adminV2/AdminV2Metrics.vue'
import AdminV2ChartCard from '~/components/adminV2/AdminV2ChartCard.vue'
import AdminV2ExamSchedule from '~/components/adminV2/AdminV2ExamSchedule.vue'
import AdminV2AgendaCard from '~/components/adminV2/AdminV2AgendaCard.vue'
import AdminV2Announcements from '~/components/adminV2/AdminV2Announcements.vue'
import AdminV2ActivityTable from '~/components/adminV2/AdminV2ActivityTable.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import {
  SCHOOL_DATA,
  GROUPS,
  ANNOUNCEMENTS,
  ACTIVITIES,
  type GroupItem
} from '~/components/adminV2/adminV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Darqia 9 — Admin Dashboard V2',
  meta: [
    { name: 'description', content: 'Dashboard Admin Portal Darqia 9 V2 Opsi Desain' }
  ]
})

/* ================= REACTIVE STATE ================= */
const jenjang = ref<'smp' | 'smk'>('smk')
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')

const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)

const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isNotifOpen = ref(false)
const isProfileOpen = ref(false)

const toastMessage = ref('')
const isToastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const currentSchool = computed(() => SCHOOL_DATA[jenjang.value])

/* ================= TOAST HELPER ================= */
const triggerToast = (msg: string) => {
  toastMessage.value = msg
  isToastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    isToastVisible.value = false
  }, 2200)
}

/* ================= ACTIONS ================= */
const setJenjang = (val: 'smp' | 'smk') => {
  jenjang.value = val
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
  if (isMegaOpen.value && activeMegaGroup.value?.id === g.id) {
    isMegaOpen.value = false
    activeMegaGroup.value = null
  } else {
    activeMegaGroup.value = g
    isMegaOpen.value = true
    closeAllPopovers()
  }
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

/* ================= GREETING & DATE ================= */
const greetingTitle = ref('Selamat datang, Admin')
const todayFormatted = ref('')

onMounted(() => {
  const h = new Date().getHours()
  const g = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam'
  greetingTitle.value = `${g}, Admin`

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const now = new Date()
  todayFormatted.value = `${days[now.getDay()]}, ${now.getDate()} ${mo[now.getMonth()]} ${now.getFullYear()}`

  window.addEventListener('keydown', handleGlobalKeydown)
  window.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalKeydown)
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

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeAllModals()
  }
}

const handleSelectModule = (title: string) => {
  isMegaOpen.value = false
  isMobileMenuOpen.value = false
  const t = title.toLowerCase()
  if (t === 'dashboard' || t === 'ringkasan utama') return navigateTo('/adminV2')
  if (t.includes('absensi') && (t.includes('guru') || t.includes('staff'))) return navigateTo('/adminV2/absensi-guru')
  if (t.includes('absensi')) return navigateTo('/adminV2/absensi')
  if (t.includes('cbt') || t === 'manajemen cbt' || t === 'ujian digital') return navigateTo('/adminV2/cbt')
  if (t.includes('siswa') && !t.includes('kelas') && !t.includes('raport') && !t.includes('rapor')) return navigateTo('/adminV2/siswa')
  if (t.includes('kelas')) return navigateTo('/adminV2/kelas')
  if (t.includes('mapel')) return navigateTo('/adminV2/mapel')
  if (t.includes('raport') || t.includes('rapor')) return navigateTo('/adminV2/raport')
  if (t.includes('guru') || t.includes('pegawai') || t.includes('staff')) return navigateTo('/adminV2/guru')
  triggerToast(`${title} — modul demo`)
}
</script>

<template>
  <div
    class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans overflow-x-clip antialiased pb-24 lg:pb-12 selection:bg-[#101828] selection:text-white"
    @click="closeAllModals"
  >
    <!-- STICKY HEADER & INTEGRATED MEGA PANEL (Non-fixed mega menu) -->
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <!-- Topbar Header -->
      <AdminV2Header
        :jenjang="jenjang"
        :role="role"
        :groups="GROUPS"
        :active-group-id="activeMegaGroup?.id"
        :is-mega-open="isMegaOpen"
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
          { label: 'Dashboard Utama' }
        ]"
        :badge="jenjang === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'"
        :jenjang="jenjang"
      />

      <!-- Desktop Mega Panel (Anchored absolute to sticky container, NOT fixed to window) -->
      <AdminV2MegaPanel
        :open="isMegaOpen"
        :group="activeMegaGroup"
        :jenjang="jenjang"
        @close="isMegaOpen = false"
        @select-item="handleSelectModule"
      />
    </div>

    <!-- MAIN DASHBOARD CONTENT -->
    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-4">
      <!-- Greeting Header -->
      <div class="flex items-start justify-between gap-3 my-1">
        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-1">
            Portal administrasi · V2
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
            {{ greetingTitle }}
          </h1>
          <p class="text-xs sm:text-[13px] text-[#667085] mt-1 font-medium">
            Pantau kehadiran, progres akademik, dan agenda sekolah hari ini.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="todayFormatted" class="hidden md:inline-block text-[11.5px] font-bold text-[#667085] bg-white border border-[#E7EBF2] py-2 px-3 rounded-full whitespace-nowrap shadow-sm">
            {{ todayFormatted }}
          </span>
          <span class="text-[10px] font-bold text-[#98A2B3] bg-white border border-dashed border-[#E7EBF2] py-1.5 px-2.5 rounded-full whitespace-nowrap shadow-sm">
            Preview v6
          </span>
        </div>
      </div>

      <!-- CARD LAYOUT HARMONY: ROW 1 (Hero, Metrics, Chart) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        <!-- Hero Card (Span 4) -->
        <div class="lg:col-span-4 h-full">
          <AdminV2HeroCard
            :value="currentSchool.heroValue"
            :sub="currentSchool.heroSub"
            :jenjang="jenjang"
            @action="triggerToast"
          />
        </div>

        <!-- Metrics Grid (Span 4) -->
        <div class="lg:col-span-4 h-full">
          <AdminV2Metrics
            :siswa-hadir="currentSchool.siswaHadir"
            :siswa-total="currentSchool.siswaTotal"
            :siswa-pct="currentSchool.siswaPct"
            :siswa-bar="currentSchool.siswaBar"
            :rombel="currentSchool.rombel"
            :guru="currentSchool.guru"
            :guru-hadir="currentSchool.guruHadir"
            :guru-total="currentSchool.guruTotal"
            :guru-pct="currentSchool.guruPct"
            :guru-bar="currentSchool.guruBar"
            :jenjang="jenjang"
          />
        </div>

        <!-- Attendance Chart Card (Span 4) -->
        <div class="lg:col-span-4 h-full">
          <AdminV2ChartCard :jenjang="jenjang" />
        </div>
      </div>

      <!-- CARD LAYOUT HARMONY: ROW 2 (Exam Schedule, Agenda, Announcements) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch mt-3.5">
        <!-- Exam Schedule (Span 4) -->
        <div class="lg:col-span-4 h-full">
          <AdminV2ExamSchedule
            :jenjang="jenjang"
            :exams="currentSchool.exams"
          />
        </div>

        <!-- Agenda Card (Span 4) -->
        <div class="lg:col-span-4 h-full">
          <AdminV2AgendaCard
            :jenjang="jenjang"
            @add-agenda="triggerToast('Tambah agenda — demo')"
            @click-item="(t) => triggerToast(`Detail agenda: ${t}`)"
          />
        </div>

        <!-- Announcements (Span 4) -->
        <div class="lg:col-span-4 h-full">
          <AdminV2Announcements
            :announcements="ANNOUNCEMENTS"
            :jenjang="jenjang"
            @view-all="triggerToast('Daftar pengumuman — demo')"
            @click-item="(t) => triggerToast(`Pengumuman: ${t}`)"
          />
        </div>
      </div>

      <!-- CARD LAYOUT: ROW 3 (Recent Activities Table) -->
      <div class="mt-3.5">
        <AdminV2ActivityTable
          :rows="ACTIVITIES"
          :jenjang="jenjang"
          @filter-click="triggerToast('Filter: Semua status')"
          @view-all="triggerToast('Membuka daftar transaksi lengkap')"
          @row-click="(r) => triggerToast(`Detail ${r.id}: ${r.name}`)"
          @notify="triggerToast"
        />
      </div>
    </main>

    <!-- Mobile Bottom Navigation Bar -->
    <AdminV2BottomNav
      :role="role"
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @nav-click="(tab) => triggerToast(`Navigasi ke ${tab}`)"
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

    <!-- Floating Interactive Toast -->
    <AdminV2Toast
      :message="toastMessage"
      :visible="isToastVisible"
    />
  </div>
</template>
