<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import AbsensiV2Kpis from '~/components/adminV2/absensi/AbsensiV2Kpis.vue'
import AbsensiV2Chart from '~/components/adminV2/absensi/AbsensiV2Chart.vue'
import AbsensiV2RombelGrid from '~/components/adminV2/absensi/AbsensiV2RombelGrid.vue'
import AbsensiV2Toolbar from '~/components/adminV2/absensi/AbsensiV2Toolbar.vue'
import AbsensiV2Table from '~/components/adminV2/absensi/AbsensiV2Table.vue'
import AbsensiV2DetailModal from '~/components/adminV2/absensi/AbsensiV2DetailModal.vue'
import AbsensiV2ManualModal from '~/components/adminV2/absensi/AbsensiV2ManualModal.vue'
import { GROUPS, type GroupItem } from '~/components/adminV2/adminV2Data'
import {
  INITIAL_PRESENSI_SMK,
  INITIAL_PRESENSI_SMP,
  computeRombelPresensi,
  RECENT_RFID_TAPS,
  type PresensiRecord,
  type AbsensiFilter,
  type RombelPresensi,
  type RecentTap
} from '~/components/adminV2/absensi/absensiV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Absensi Siswa — Kesiswaan — Admin Portal Darqia 9',
  meta: [
    { name: 'description', content: 'Presensi harian peserta didik berbasis Smartcard RFID SMK IT Attaqwa 9 & SMP IT Bina Cendekia Assalam' }
  ]
})

/* ================= REACTIVE STATE ================= */
const jenjang = ref<'smp' | 'smk'>('smk')
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')

// Header popovers & mobile navigation
const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)
const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isNotifOpen = ref(false)
const isProfileOpen = ref(false)

// Toast
const toastMessage = ref('')
const isToastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const triggerToast = (msg: string) => {
  toastMessage.value = msg
  isToastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    isToastVisible.value = false
  }, 2400)
}

// Attendance Database
const smkRecords = ref<PresensiRecord[]>([...INITIAL_PRESENSI_SMK])
const smpRecords = ref<PresensiRecord[]>([...INITIAL_PRESENSI_SMP])

const currentRecords = computed(() => {
  return jenjang.value === 'smp' ? smpRecords.value : smkRecords.value
})

// Filters
const filter = ref<AbsensiFilter>({
  q: '',
  kelas: '',
  status: '',
  gate: '',
  page: 1
})

const resetFilter = () => {
  const q = filter.value.q
  filter.value = {
    q,
    kelas: '',
    status: '',
    gate: '',
    page: 1
  }
}

const kelasList = computed(() => {
  const set = new Set(currentRecords.value.map(x => x.className))
  return [...set].sort()
})

// Filtered and Paginated Records
const filteredRecords = computed(() => {
  const v = filter.value
  const q = v.q.trim().toLowerCase()

  return currentRecords.value.filter((rec) => {
    if (v.kelas && rec.className !== v.kelas) return false
    if (v.status && rec.status !== v.status) return false
    if (v.gate && !rec.gate.includes(v.gate)) return false
    if (q) {
      const targetStr = `${rec.name} ${rec.nisn} ${rec.nis} ${rec.className} ${rec.father} ${rec.gate}`.toLowerCase()
      if (!targetStr.includes(q)) return false
    }
    return true
  })
})

const RECORDS_PER_PAGE = 10
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / RECORDS_PER_PAGE)))

const pagedRecords = computed(() => {
  const start = (filter.value.page - 1) * RECORDS_PER_PAGE
  return filteredRecords.value.slice(start, start + RECORDS_PER_PAGE)
})

// KPIs Metrics
const totalCount = computed(() => currentRecords.value.length)
const hadirCount = computed(() => currentRecords.value.filter(r => r.status === 'Hadir').length)
const terlambatCount = computed(() => currentRecords.value.filter(r => r.status === 'Terlambat').length)
const izinCount = computed(() => currentRecords.value.filter(r => r.status === 'Izin').length)
const sakitCount = computed(() => currentRecords.value.filter(r => r.status === 'Sakit').length)
const alpaCount = computed(() => currentRecords.value.filter(r => r.status === 'Alpa').length)
const kehadiranPct = computed(() => {
  return totalCount.value ? Math.round(((hadirCount.value + terlambatCount.value) / totalCount.value) * 100) : 0
})

// Submenu navigation: CBT-identical tab structure
export type AbsensiSubmenuId = 'overview' | 'monitoring' | 'rombel' | 'detail'

interface AbsensiTabItem {
  id: AbsensiSubmenuId
  label: string
  icon: string
  live?: boolean
  badgeText?: string
}

const ABSENSI_TABS: AbsensiTabItem[] = [
  { id: 'overview', label: 'Ringkasan', icon: 'grid' },
  { id: 'monitoring', label: 'Monitoring RFID', icon: 'screen', live: true, badgeText: '2 Live' },
  { id: 'rombel', label: 'Rekap per Kelas', icon: 'layers' },
  { id: 'detail', label: 'Log Presensi Siswa', icon: 'users' }
]

const activeSubmenu = ref<AbsensiSubmenuId>('overview')

// Computed Rombel Breakdown & Recent RFID Taps
const rombelList = computed(() => computeRombelPresensi(currentRecords.value, jenjang.value))
const recentTaps = computed(() => RECENT_RFID_TAPS[jenjang.value] || [])

// Select Class from Rombel Grid
const handleSelectRombel = (className: string) => {
  filter.value.kelas = className
  filter.value.page = 1
  if (className) {
    activeSubmenu.value = 'detail'
    triggerToast(`Memfilter log presensi untuk rombel ${className}`)
  } else {
    triggerToast('Filter rombel direset.')
  }
}

// Modals State
const activeDetailRecord = ref<PresensiRecord | null>(null)
const editingRecord = ref<PresensiRecord | null>(null)

// Actions
const setJenjang = (j: 'smp' | 'smk') => {
  jenjang.value = j
  resetFilter()
  filter.value.q = ''
  triggerToast(`Beralih ke jenjang ${j.toUpperCase()} (${j === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'})`)
}

const handleKpiReset = () => {
  resetFilter()
  filter.value.q = ''
  activeSubmenu.value = 'detail'
  triggerToast('Menampilkan semua presensi siswa.')
}

const handleKpiAlert = () => {
  resetFilter()
  filter.value.status = 'Terlambat'
  activeSubmenu.value = 'detail'
  triggerToast('Filter aktif: Siswa terlambat & alpa.')
}

const handleKpiIzin = () => {
  resetFilter()
  filter.value.status = 'Izin'
  activeSubmenu.value = 'detail'
  triggerToast('Filter aktif: Siswa izin & sakit.')
}

const handleKpiHadir = () => {
  resetFilter()
  filter.value.status = 'Hadir'
  activeSubmenu.value = 'detail'
  triggerToast('Filter aktif: Siswa hadir tepat waktu.')
}

// Modal Handlers
const openDetail = (record: PresensiRecord) => {
  activeDetailRecord.value = record
}

const openEdit = (record: PresensiRecord) => {
  activeDetailRecord.value = null
  editingRecord.value = record
}

const handleSaveRecord = (payload: { id: string; status: PresensiRecord['status']; timeIn: string; note: string; gate: string }) => {
  const list = jenjang.value === 'smp' ? smpRecords.value : smkRecords.value
  const idx = list.findIndex(r => r.id === payload.id)
  if (idx >= 0) {
    list[idx].status = payload.status
    list[idx].timeIn = payload.timeIn
    list[idx].note = payload.note
    list[idx].gate = payload.gate
    if (payload.status === 'Terlambat') {
      list[idx].lateMinutes = 10
    } else {
      list[idx].lateMinutes = 0
    }
    triggerToast(`Status presensi ${list[idx].name} berhasil diubah ke ${payload.status}.`)
  }
  editingRecord.value = null
}

// Export CSV
const downloadCSV = (filename: string, rows: (string | number)[][]) => {
  const csvContent = '\uFEFF' + rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleExport = () => {
  const rows: (string | number)[][] = [
    ['ID', 'NIS', 'NISN', 'Nama Siswa', 'Kelas', 'Jam Masuk', 'Jam Keluar', 'Status', 'Gate', 'RFID UID', 'Keterangan'],
    ...filteredRecords.value.map(r => [
      r.id,
      r.nis,
      r.nisn,
      r.name,
      r.className,
      r.timeIn,
      r.timeOut,
      r.status,
      r.gate,
      r.rfidUid || '-',
      r.note || '-'
    ])
  ]
  downloadCSV(`rekap-absensi-${jenjang.value}-${Date.now()}.csv`, rows)
  triggerToast(`${filteredRecords.value.length} data presensi diekspor ke CSV.`)
}

// Navigation & Global Modals
const closeAllModals = () => {
  isMegaOpen.value = false
  isMobileMenuOpen.value = false
  isSearchOpen.value = false
  isNotifOpen.value = false
  isProfileOpen.value = false
}

const toggleMega = (g: GroupItem) => {
  if (isMegaOpen.value && activeMegaGroup.value?.id === g.id) {
    isMegaOpen.value = false
    activeMegaGroup.value = null
  } else {
    activeMegaGroup.value = g
    isMegaOpen.value = true
    isNotifOpen.value = false
    isProfileOpen.value = false
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

// Greeting Date
const todayFormatted = ref('')
onMounted(() => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const mo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const now = new Date()
  todayFormatted.value = `${days[now.getDay()]}, ${now.getDate()} ${mo[now.getMonth()]} ${now.getFullYear()}`

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals()
      activeDetailRecord.value = null
      editingRecord.value = null
    }
  })
})
</script>

<template>
  <div
    class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans overflow-x-clip antialiased pb-24 lg:pb-12 selection:bg-[#101828] selection:text-white"
    @click="closeAllModals"
  >
    <!-- STICKY HEADER & INTEGRATED MEGA PANEL -->
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header
        :jenjang="jenjang"
        :role="role"
        :groups="GROUPS"
        :active-group-id="activeMegaGroup?.id || 'akademik'"
        :current-route="'akademik'"
        :is-mega-open="isMegaOpen"
        @update:jenjang="setJenjang"
        @toggle-mega="toggleMega"
        @open-mobile-menu="isMobileMenuOpen = true"
        @toggle-search="isSearchOpen = !isSearchOpen"
        @toggle-notif="isNotifOpen = !isNotifOpen"
        @toggle-profile="isProfileOpen = !isProfileOpen"
      />

      <!-- SUB NAVBAR KHUSUS BREADCRUMB (Desktop & Mobile: Sticky Sub-Navbar) -->
      <AdminV2Breadcrumb
        :items="[
          { label: 'Portal Admin', to: '/adminV2' },
          { label: 'Akademik' },
          { label: 'Absensi Siswa RFID' }
        ]"
        :badge="jenjang === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'"
        :jenjang="jenjang"
      />

      <AdminV2MegaPanel
        :open="isMegaOpen"
        :group="activeMegaGroup"
        :jenjang="jenjang"
        @close="isMegaOpen = false"
        @select-item="handleSelectModule"
      />
    </div>

    <!-- MAIN PAGE CONTAINER (Wide Layout 1440px matching V2 Standard) -->
    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-6">
      <!-- Greeting / Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-1">
            Portal administrasi · V2
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828] flex items-center gap-2.5 flex-wrap">
            <span>Absensi Siswa</span>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors"
              :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#12459B]'"
            >
              {{ jenjang.toUpperCase() }}
            </span>
          </h1>
          <p class="text-xs sm:text-[13px] text-[#667085] mt-1 font-medium">
            Presensi harian peserta didik berbasis Smartcard RFID &bull; {{ jenjang === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }} &bull; Tahun Ajaran 2026/2027
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <span v-if="todayFormatted" class="hidden md:inline-flex text-[11.5px] font-bold text-[#667085] bg-white border border-[#E7EBF2] py-2 px-3 rounded-full whitespace-nowrap shadow-xs">
            {{ todayFormatted }}
          </span>

          <!-- Quick Link to TV Screen -->
          <NuxtLink
            to="/absensi/10abc"
            target="_blank"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#101828] text-white hover:bg-[#1D2939] transition shadow-xs cursor-pointer"
            title="Buka Layar TV Absensi Lobi"
          >
            <AdminV2Icon name="monitor" :size="14" />
            <span>TV Absensi Lobi</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Submenu Navigation Bar (Identik 1:1 Styling Manajemen CBT) -->
      <div class="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mb-5">
        <nav
          class="inline-flex items-center gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1.5 rounded-2xl min-w-max"
          role="tablist"
          aria-label="Navigasi Absensi Siswa"
        >
          <button
            v-for="tab in ABSENSI_TABS"
            :key="tab.id"
            type="button"
            role="tab"
            class="inline-flex items-center gap-2 text-[12.5px] px-3.5 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer"
            :class="activeSubmenu === tab.id
              ? 'bg-white text-[#101828] font-bold shadow-[0_1px_4px_rgba(16,24,40,0.12)]'
              : 'text-[#667085] font-semibold hover:text-[#101828]'"
            :aria-selected="activeSubmenu === tab.id"
            @click="activeSubmenu = tab.id"
          >
            <AdminV2Icon
              :name="tab.icon"
              :size="15"
              :class="activeSubmenu === tab.id ? (jenjang === 'smp' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
            />
            <span>{{ tab.label }}</span>

            <!-- Live Badge with pulsing dot (matching CBT Monitoring Ujian) -->
            <span
              v-if="tab.live"
              class="text-[10px] font-extrabold bg-[#FDECEA] text-[#B42318] rounded-full px-2 py-0.5 inline-flex items-center gap-1.5"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#F04438] animate-ping" />
              <span>{{ tab.badgeText || '2 Live' }}</span>
            </span>

            <!-- Count Badge on Log Presensi -->
            <span
              v-else-if="tab.id === 'detail'"
              class="text-[10.5px] font-mono font-bold bg-[#E7EBF2] text-[#344054] rounded-full px-2 py-0.5 ml-0.5"
            >
              {{ filteredRecords.length }}
            </span>
          </button>
        </nav>
      </div>

      <!-- ============================================================= -->
      <!-- VIEW 1: OVERVIEW & ANALITIK (Cards, Charts, Ticker, Rombel)  -->
      <!-- ============================================================= -->
      <div v-if="activeSubmenu === 'overview'" class="space-y-5">
        <!-- 1. 4 KPI Overview Cards -->
        <AbsensiV2Kpis
          :hadir-count="hadirCount"
          :terlambat-count="terlambatCount"
          :izin-count="izinCount"
          :sakit-count="sakitCount"
          :alpa-count="alpaCount"
          :total-count="totalCount"
          :kehadiran-pct="kehadiranPct"
          :jenjang="jenjang"
          @filter-reset="handleKpiReset"
          @filter-alert="handleKpiAlert"
          @filter-izin="handleKpiIzin"
          @filter-hadir="handleKpiHadir"
        />

        <!-- 2. Interactive Attendance Charts (7-day trend Line & Tap time Bar) -->
        <AbsensiV2Chart :jenjang="jenjang" />

        <!-- 3. Real-time Live Stream RFID Card Tap Ticker -->
        <div class="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-[18px] p-4 sm:p-5 shadow-lg border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3 shrink-0">
            <div class="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <AdminV2Icon name="check" :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white tracking-wide">Live Stream RFID Card Tap</span>
                <span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-[#12B76A] text-white animate-pulse">Live</span>
              </div>
              <p class="text-[11px] text-slate-300 font-medium">Gateway RFID Gate 1 &amp; 2 Online &bull; Terhubung ke Layar TV Lobi</p>
            </div>
          </div>

          <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div
              v-for="tap in recentTaps"
              :key="tap.id"
              class="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs hover:bg-white/10 transition-colors"
            >
              <div class="min-w-0 pr-2">
                <b class="text-white font-bold block truncate text-[12px]">{{ tap.name }}</b>
                <span class="text-[10px] text-slate-300 font-mono">{{ tap.classroom }} &bull; {{ tap.rfid }}</span>
              </div>
              <div class="text-right shrink-0">
                <span
                  class="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider block mb-0.5"
                  :class="tap.status === 'Tepat Waktu' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'"
                >
                  {{ tap.time }}
                </span>
                <span class="text-[9px] text-slate-400">{{ tap.gate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Rekap Kehadiran per Masing-Masing Rombel / Kelas -->
        <AbsensiV2RombelGrid
          :rombels="rombelList"
          :selected-kelas="filter.kelas"
          :jenjang="jenjang"
          @select-rombel="handleSelectRombel"
        />

        <!-- Shortcut Action to Full Log -->
        <div class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div>
            <h4 class="text-sm font-bold text-[#101828]">Ingin Memeriksa Log Presensi Individual Siswa?</h4>
            <p class="text-xs text-[#667085] mt-0.5 font-medium">Buka daftar log presensi individual untuk verifikasi RFID, koreksi manual status presensi, atau ekspor laporan.</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white transition shrink-0 cursor-pointer shadow-xs"
            :class="jenjang === 'smp' ? 'bg-[#166534] hover:bg-[#14532D]' : 'bg-[#1B5FD9] hover:bg-[#12459B]'"
            @click="activeSubmenu = 'detail'"
          >
            <span>Buka Detail Log Presensi ({{ totalCount }} Siswa)</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      <!-- ============================================================= -->
      <!-- VIEW 2: MONITORING RFID (Focused Real-time IoT Stream)       -->
      <!-- ============================================================= -->
      <div v-else-if="activeSubmenu === 'monitoring'" class="space-y-5">
        <!-- Gateway Readers Status Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <div class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 sm:p-5 shadow-xs">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-[#667085]">Gate 1 · Gerbang Utama</span>
              <span class="text-[10px] font-extrabold bg-[#E7F8F0] text-[#067647] px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
                Online
              </span>
            </div>
            <div class="text-[24px] font-extrabold text-[#101828]">782 Tap</div>
            <div class="text-xs text-[#667085] mt-1">Reader Mifare 13.56 MHz &bull; Latensi 95ms</div>
          </div>

          <div class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 sm:p-5 shadow-xs">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-[#667085]">Gate 2 · Lobi Depan</span>
              <span class="text-[10px] font-extrabold bg-[#E7F8F0] text-[#067647] px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
                Online
              </span>
            </div>
            <div class="text-[24px] font-extrabold text-[#101828]">422 Tap</div>
            <div class="text-xs text-[#667085] mt-1">Reader Mifare 13.56 MHz &bull; Latensi 110ms</div>
          </div>

          <div class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-[#667085]">Tampilan TV Lobi</span>
              <span class="text-[10px] font-extrabold bg-[#E8F0FE] text-[#12459B] px-2 py-0.5 rounded-full">
                1080p Fullscreen
              </span>
            </div>
            <NuxtLink
              to="/absensi/10abc"
              target="_blank"
              class="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#101828] text-white hover:bg-[#1D2939] transition cursor-pointer"
            >
              <AdminV2Icon name="monitor" :size="15" />
              <span>Buka Layar TV Lobi</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Real-time Live Stream RFID Card Tap Ticker -->
        <div class="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-[18px] p-5 shadow-lg border border-white/10">
          <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <AdminV2Icon name="check" :size="20" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-bold text-white tracking-wide">Live Stream RFID Card Tap Siswa</h4>
                  <span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-[#12B76A] text-white animate-pulse">Live</span>
                </div>
                <p class="text-[11px] text-slate-300 font-medium">Gateway RFID Gate 1 &amp; 2 Online &bull; Terhubung ke Layar TV Lobi</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="tap in recentTaps"
              :key="tap.id"
              class="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs hover:bg-white/10 transition-colors"
            >
              <div class="min-w-0 pr-2">
                <b class="text-white font-bold block truncate text-[13px]">{{ tap.name }}</b>
                <span class="text-[11px] text-slate-300 font-mono">{{ tap.classroom }} &bull; {{ tap.rfid }}</span>
              </div>
              <div class="text-right shrink-0">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider block mb-1"
                  :class="tap.status === 'Tepat Waktu' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'"
                >
                  {{ tap.time }}
                </span>
                <span class="text-[10px] text-slate-400">{{ tap.gate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance Chart in Monitoring Mode (Focused on tap slots) -->
        <AbsensiV2Chart :jenjang="jenjang" />
      </div>

      <!-- ============================================================= -->
      <!-- VIEW 3: REKAP PER KELAS / ROMBEL                              -->
      <!-- ============================================================= -->
      <div v-else-if="activeSubmenu === 'rombel'" class="space-y-4">
        <AbsensiV2RombelGrid
          :rombels="rombelList"
          :selected-kelas="filter.kelas"
          :jenjang="jenjang"
          @select-rombel="handleSelectRombel"
        />
      </div>

      <!-- ============================================================= -->
      <!-- VIEW 4: DETAIL LOG PRESENSI SISWA                             -->
      <!-- ============================================================= -->
      <div v-else-if="activeSubmenu === 'detail'" class="space-y-4">
        <!-- Quick Rombel Selector Horizontal Scroll -->
        <div class="bg-white border border-[#E7EBF2] rounded-[18px] p-3 shadow-xs">
          <div class="flex items-center justify-between px-1 mb-2">
            <span class="text-xs font-bold text-[#475467] uppercase tracking-wider">Filter Berdasarkan Rombel / Kelas:</span>
            <span class="text-xs font-bold" :class="jenjang === 'smp' ? 'text-[#166534]' : 'text-[#1B5FD9]'">
              {{ filter.kelas ? `Kelas ${filter.kelas}` : 'Semua Kelas' }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border cursor-pointer"
              :class="!filter.kelas
                ? (jenjang === 'smp' ? 'bg-[#166534] text-white border-[#166534]' : 'bg-[#1B5FD9] text-white border-[#1B5FD9]')
                : 'bg-[#F8FAFD] text-[#344054] border-[#E7EBF2] hover:bg-[#EFF2F7]'"
              @click="filter.kelas = ''; filter.page = 1"
            >
              Semua Kelas ({{ currentRecords.length }})
            </button>
            <button
              v-for="k in kelasList"
              :key="k"
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border cursor-pointer"
              :class="filter.kelas === k
                ? (jenjang === 'smp' ? 'bg-[#166534] text-white border-[#166534]' : 'bg-[#1B5FD9] text-white border-[#1B5FD9]')
                : 'bg-[#F8FAFD] text-[#344054] border-[#E7EBF2] hover:bg-[#EFF2F7]'"
              @click="filter.kelas = k; filter.page = 1"
            >
              {{ k }}
            </button>
          </div>
        </div>

        <!-- REKAP PRESENSI HARIAN SECTION -->
        <div class="bg-white border border-[#E7EBF2] rounded-[18px] p-4 sm:p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)]">
          <!-- Section Header with Action Buttons -->
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3.5">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-[16px] font-extrabold text-[#101828]">
                  Log Presensi Siswa Hari Ini
                </h3>
                <span v-if="filter.kelas" class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F0FE] text-[#12459B]">
                  Kelas {{ filter.kelas }}
                </span>
                <span v-if="filter.status" class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF4E5] text-[#B54708]">
                  Status: {{ filter.status }}
                </span>
              </div>
              <p class="text-[13px] text-[#667085] mt-0.5 font-medium">
                Data tap smartcard masuk &amp; keluar gerbang sekolah {{ jenjang === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9' }}
              </p>
            </div>

            <!-- Actions matching V2 ghost buttons -->
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Back to Overview Button -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 bg-[#F8FAFD] border border-[#E7EBF2] rounded-full px-3.5 py-2 text-[13px] font-bold text-[#344054] hover:bg-[#EFF2F7] transition cursor-pointer"
                @click="activeSubmenu = 'overview'"
              >
                <AdminV2Icon name="back" :size="14" />
                <span>Kembali ke Overview</span>
              </button>

              <!-- Export Rekap Button -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 bg-white border border-[#E7EBF2] rounded-full px-3.5 py-2 text-[13px] font-bold text-[#101828] hover:bg-[#EFF2F7] transition cursor-pointer"
                @click="handleExport"
              >
                <AdminV2Icon name="dl" :size="15" />
                <span>Export CSV</span>
              </button>

              <!-- Buka Tampilan TV -->
              <NuxtLink
                to="/absensi/10abc"
                target="_blank"
                class="inline-flex items-center gap-1.5 bg-white border border-[#E7EBF2] rounded-full px-3.5 py-2 text-[13px] font-bold text-[#101828] hover:bg-[#EFF2F7] transition cursor-pointer"
              >
                <AdminV2Icon name="monitor" :size="15" />
                <span>Layar TV Lobi</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Filter Toolbar -->
          <AbsensiV2Toolbar
            v-model:q="filter.q"
            v-model:kelas="filter.kelas"
            v-model:status="filter.status"
            v-model:gate="filter.gate"
            :kelas-list="kelasList"
            :jenjang="jenjang"
            :showing-count="pagedRecords.length"
            :total-count="filteredRecords.length"
            @reset="resetFilter"
          />

          <!-- Table View -->
          <AbsensiV2Table
            :records="pagedRecords"
            :current-page="filter.page"
            :total-pages="totalPages"
            :start-index="(filter.page - 1) * RECORDS_PER_PAGE"
            :jenjang="jenjang"
            @view-detail="openDetail"
            @edit-record="openEdit"
            @update:page="filter.page = $event"
          />
        </div>
      </div>
    </main>

    <!-- DETAIL MODAL -->
    <AbsensiV2DetailModal
      :record="activeDetailRecord"
      :jenjang="jenjang"
      @close="activeDetailRecord = null"
      @edit="openEdit"
    />

    <!-- EDIT MANUAL MODAL -->
    <AbsensiV2ManualModal
      :record="editingRecord"
      :jenjang="jenjang"
      @close="editingRecord = null"
      @save="handleSaveRecord"
    />

    <!-- BOTTOM NAV (Mobile) -->
    <AdminV2BottomNav
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @action="triggerToast"
    />

    <!-- MOBILE MENU DRAWER -->
    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :groups="GROUPS"
      :jenjang="jenjang"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
      @action="triggerToast"
    />

    <!-- POPOVERS & SEARCH OVERLAY -->
    <AdminV2Popovers
      :notif-open="isNotifOpen"
      :profile-open="isProfileOpen"
      :search-open="isSearchOpen"
      :role="role"
      :jenjang="jenjang"
      @close-all="closeAllModals"
      @update:role="role = $event; triggerToast(`Peran diubah ke: ${$event}`)"
      @action="triggerToast"
      @select-module="handleSelectModule"
    />

    <!-- GLOBAL TOAST NOTIFICATION -->
    <AdminV2Toast
      :show="isToastVisible"
      :message="toastMessage"
    />
  </div>
</template>
