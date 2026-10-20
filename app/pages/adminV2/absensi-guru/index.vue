<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import AbsensiGuruDetailModal, { type TeacherAttendance } from '~/components/adminV2/absensi-guru/AbsensiGuruDetailModal.vue'
import AbsensiGuruCharts from '~/components/adminV2/absensi-guru/AbsensiGuruCharts.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useAdminTeachers } from '~/composables/useAdminTeachers'
import { GROUPS, type GroupItem } from '~/components/adminV2/adminV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Absensi Guru — Kepegawaian — Admin Portal Darqia 9',
  meta: [
    { name: 'description', content: 'Rekapitulasi presensi dan integrasi smartcard tap RFID pendidik dan tenaga kependidikan realtime' }
  ]
})

/* ================= STORE & STATE TERINTEGRASI ================= */
const activeGrade = useAdminGrade()
const teachersStore = useAdminTeachers()
const rawTeachers = teachersStore.attendanceList

const jenjang = ref<'smp' | 'smk'>(activeGrade.value.toLowerCase() as 'smp' | 'smk')
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')

watch(jenjang, (v) => {
  activeGrade.value = v.toUpperCase() as 'SMP' | 'SMK'
})

watch(activeGrade, (v) => {
  jenjang.value = v.toLowerCase() as 'smp' | 'smk'
})

const title = 'Absensi Guru'
const subtitle = 'Senin, 05 Okt 2026 · Rekap Presensi & Data Tap RFID Pendidik & Tenaga Kependidikan Realtime'

// Submenu Navigation State
const activeSubmenu = ref<'overview' | 'detail'>('overview')

// Period Filter for Overview
const selectedPeriod = ref<'harian' | 'mingguan' | 'bulanan'>('harian')
const periodOptions = [
  { label: 'Harian', value: 'harian' as const },
  { label: 'Mingguan', value: 'mingguan' as const },
  { label: 'Bulanan', value: 'bulanan' as const }
]

const periodLabel = computed(() => {
  switch (selectedPeriod.value) {
    case 'harian': return '06:00 - 07:30 WIB'
    case 'mingguan': return 'Senin - Jumat'
    case 'bulanan': return 'Oktober 2026'
  }
})

// Table Filters & State
const selectedDay = ref('Senin, 05 Okt 2026')
const days = [
  'Senin, 05 Okt 2026',
  'Jumat, 02 Okt 2026',
  'Kamis, 01 Okt 2026',
  'Rabu, 30 Sep 2026',
  'Selasa, 29 Sep 2026'
]

const selectedGradeFilter = ref('Semua')
const selectedRole = ref('Semua')
const roleOptions = ['Guru Utama', 'Wali Kelas', 'Kaprog', 'Tendik']

const selectedSort = ref('time-desc')
const searchQuery = ref('')
const selectedStatus = ref('Semua')

// Dataset Aktif Sesuai Filter Jenjang (Proporsional & Akurat)
const activeDataset = computed(() => {
  if (selectedGradeFilter.value === 'Semua') {
    return rawTeachers.value
  }
  return rawTeachers.value.filter(t => t.school === selectedGradeFilter.value)
})

const totalTeachersCount = computed(() => activeDataset.value.length)
const hadirCount = computed(() => activeDataset.value.filter(s => s.status === 'Hadir').length)
const terlambatCount = computed(() => activeDataset.value.filter(s => s.status === 'Terlambat').length)
const izinCount = computed(() => activeDataset.value.filter(s => s.status === 'Izin').length)
const sakitCount = computed(() => activeDataset.value.filter(s => s.status === 'Sakit').length)
const izinSakitCount = computed(() => izinCount.value + sakitCount.value)
const alpaCount = computed(() => activeDataset.value.filter(s => s.status === 'Alpa').length)

// Persentase Proporsional Akurat (100% dinamis dari dataset)
const hadirRate = computed(() => totalTeachersCount.value ? Number(((hadirCount.value / totalTeachersCount.value) * 100).toFixed(1)) : 0)
const terlambatRate = computed(() => totalTeachersCount.value ? Number(((terlambatCount.value / totalTeachersCount.value) * 100).toFixed(1)) : 0)
const izinSakitRate = computed(() => totalTeachersCount.value ? Number(((izinSakitCount.value / totalTeachersCount.value) * 100).toFixed(1)) : 0)
const alpaRate = computed(() => totalTeachersCount.value ? Number(((alpaCount.value / totalTeachersCount.value) * 100).toFixed(1)) : 0)

// 4 Canonical KPI Cards (100% Terintegrasi Dinamis)
const summaryCards = computed(() => [
  {
    label: 'Hadir Tepat Waktu',
    value: hadirCount.value.toString(),
    sub: '≤ 06:45 WIB',
    note: 'Tap tepat waktu via RFID',
    rate: `${hadirRate.value}%`
  },
  {
    label: 'Terlambat',
    value: terlambatCount.value.toString(),
    sub: '06:46-07:00 WIB',
    note: `${terlambatCount.value} pendidik tercatat telat`,
    rate: `${terlambatRate.value}%`
  },
  {
    label: 'Izin & Sakit / Cuti',
    value: izinSakitCount.value.toString(),
    sub: 'Surat Terlampir',
    note: `${izinCount.value} Izin Dinas · ${sakitCount.value} Sakit`,
    rate: `${izinSakitRate.value}%`
  },
  {
    label: 'Alpa / Belum Hadir',
    value: alpaCount.value.toString(),
    sub: '> 07:00 WIB',
    note: alpaCount.value > 0 ? `${alpaCount.value} belum ada konfirmasi` : 'Semua terdata hadir/izin',
    rate: `${alpaRate.value}%`
  }
])

// Role Summary Matrix for Overview (Dihitung 100% Dinamis)
const roleSummaryMatrix = computed(() => {
  const roles = [
    { role: 'Guru Utama', match: (t: TeacherAttendance) => t.level.includes('Guru Utama') || t.level.includes('Kepala') },
    { role: 'Wali Kelas', match: (t: TeacherAttendance) => t.level.includes('Wali Kelas') },
    { role: 'Kaprog', match: (t: TeacherAttendance) => t.level.includes('Kaprog') || t.level.includes('Waka') },
    { role: 'Tendik', match: (t: TeacherAttendance) => t.level.includes('Tendik') || t.level.includes('TU') || t.level.includes('Keuangan') || t.level.includes('Staf') }
  ]
  return roles.map(r => {
    const list = activeDataset.value.filter(r.match)
    const count = list.length
    const present = list.filter(t => t.status === 'Hadir' || t.status === 'Terlambat').length
    const late = list.filter(t => t.status === 'Terlambat').length
    const percentage = count ? Number(((present / count) * 100).toFixed(1)) : 100
    const latePct = count ? Number(((late / count) * 100).toFixed(1)) : 0
    return {
      role: r.role,
      count,
      present,
      total: count,
      percentage,
      late,
      latePct
    }
  })
})

const selectRoleAndGoDetail = (roleName: string) => {
  selectedRole.value = roleName
  activeSubmenu.value = 'detail'
}

// Chart Trend Data based on selectedPeriod (Proporsional dengan data aktual)
const trendLabels = computed(() => {
  if (selectedPeriod.value === 'harian') {
    return ['06:00', '06:15', '06:30', '06:45', '07:00', '07:15']
  }
  if (selectedPeriod.value === 'mingguan') {
    return ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  }
  return ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4']
})

const trendSeries = computed(() => {
  const hr = hadirRate.value
  const lr = terlambatRate.value
  if (selectedPeriod.value === 'harian') {
    return [
      { name: 'Tepat Waktu', color: '#10B981', values: [Math.round(hr * 0.2), Math.round(hr * 0.65), Math.round(hr * 0.95), hr, hr, hr] },
      { name: 'Terlambat', color: '#F59E0B', values: [0, 0, Math.round(lr * 0.5), lr, lr, lr] }
    ]
  }
  if (selectedPeriod.value === 'mingguan') {
    return [
      { name: 'Tepat Waktu', color: '#10B981', values: [hr, Math.min(100, Math.round(hr + 3)), Math.max(70, Math.round(hr - 2)), Math.min(100, Math.round(hr + 5)), hr] },
      { name: 'Terlambat', color: '#F59E0B', values: [lr, Math.max(0, lr - 2), lr, 0, lr] }
    ]
  }
  return [
    { name: 'Tepat Waktu', color: '#10B981', values: [95.2, 94.0, 96.8, hr] },
    { name: 'Terlambat', color: '#F59E0B', values: [2.8, 3.5, 1.8, lr] }
  ]
})

// Donut Chart Breakdown (100% Dinamis & Proporsional Sesuai Jumlah Guru)
const donutSegments = computed(() => [
  { label: 'Tepat Waktu', value: hadirCount.value, color: '#10B981' },
  { label: 'Terlambat', value: terlambatCount.value, color: '#F59E0B' },
  { label: 'Izin Dinas', value: izinCount.value, color: '#3B82F6' },
  { label: 'Sakit', value: sakitCount.value, color: '#06B6D4' },
  { label: 'Alpa', value: alpaCount.value, color: '#F43F5E' }
])

// Recent Live Taps for Teachers (Terkoneksi ke data presensi)
const recentTaps = computed(() => {
  return rawTeachers.value
    .filter(t => t.timeIn)
    .slice(0, 3)
    .map((t, idx) => ({
      id: `tap-${t.id}-${idx}`,
      name: t.name,
      role: t.level,
      rfid: t.rfidUid,
      time: `${t.timeIn}:12`,
      status: t.status === 'Terlambat' ? 'Terlambat' : 'Tepat Waktu',
      gate: t.gate || 'Ruang Guru'
    }))
})

// Status Filter Options with Counts
const statusFilterOptions = computed(() => {
  const list = rawTeachers.value
  return [
    { label: 'Semua', value: 'Semua', count: list.length },
    { label: 'Hadir', value: 'Hadir', color: '#10B981', count: list.filter(s => s.status === 'Hadir').length },
    { label: 'Terlambat', value: 'Terlambat', color: '#F59E0B', count: list.filter(s => s.status === 'Terlambat').length },
    { label: 'Izin', value: 'Izin', color: '#3B82F6', count: list.filter(s => s.status === 'Izin').length },
    { label: 'Sakit', value: 'Sakit', color: '#06B6D4', count: list.filter(s => s.status === 'Sakit').length },
    { label: 'Alpa', value: 'Alpa', color: '#F43F5E', count: list.filter(s => s.status === 'Alpa').length }
  ]
})

// Filtered & Sorted Rows
const filteredRows = computed(() => {
  let list = rawTeachers.value.filter((item) => {
    if (selectedGradeFilter.value !== 'Semua' && item.school !== selectedGradeFilter.value) {
      return false
    }
    if (selectedRole.value !== 'Semua' && !item.level.includes(selectedRole.value)) {
      return false
    }
    if (selectedStatus.value !== 'Semua' && item.status !== selectedStatus.value) {
      return false
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchName = item.name.toLowerCase().includes(q)
      const matchNip = item.nip.includes(q)
      const matchSub = item.subject.toLowerCase().includes(q)
      const matchRfid = item.rfidUid.toLowerCase().includes(q)
      if (!matchName && !matchNip && !matchSub && !matchRfid) return false
    }
    return true
  })

  list = [...list].sort((a, b) => {
    if (selectedSort.value === 'name-asc') return a.name.localeCompare(b.name)
    if (selectedSort.value === 'name-desc') return b.name.localeCompare(a.name)
    if (selectedSort.value === 'time-desc') {
      const timeA = a.timeIn || '00:00'
      const timeB = b.timeIn || '00:00'
      return timeB.localeCompare(timeA)
    }
    if (selectedSort.value === 'time-asc') {
      const timeA = a.timeIn || '99:99'
      const timeB = b.timeIn || '99:99'
      return timeA.localeCompare(timeB)
    }
    if (selectedSort.value === 'status') {
      return a.status.localeCompare(b.status)
    }
    return 0
  })

  return list
})

// Pagination
const currentPage = ref(1)
const perPage = 8

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / perPage)))

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredRows.value.slice(start, start + perPage)
})

watch([searchQuery, selectedStatus, selectedRole, selectedGradeFilter, selectedSort], () => {
  currentPage.value = 1
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = 'Semua'
  selectedRole.value = 'Semua'
  selectedGradeFilter.value = 'Semua'
  currentPage.value = 1
  triggerToast('Semua filter berhasil direset.')
}

// Teacher Detail Modal Handling
const selectedTeacher = ref<TeacherAttendance | null>(null)
const isDetailModalOpen = ref(false)

const openTeacherDetail = (item: TeacherAttendance) => {
  selectedTeacher.value = item
  isDetailModalOpen.value = true
}

const handleSaveTeacher = (updated: TeacherAttendance) => {
  const idx = rawTeachers.value.findIndex(s => s.id === updated.id)
  if (idx !== -1) {
    rawTeachers.value[idx] = { ...updated }
    triggerToast(`Status presensi ${updated.name} diperbarui ke ${updated.status}.`)
  }
  isDetailModalOpen.value = false
}

// Formatters
const initials = (name: string) => {
  return name.replace(/^Drs\.\s*|H\.\s*|Ust\.\s*|S\.Pd\s*|M\.Kom\s*|S\.Kom\s*|S\.Si\s*|S\.E\s*/g, '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const pillClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
    case 'Terlambat': return 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
    case 'Izin': return 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
    case 'Sakit': return 'bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC]'
    case 'Alpa': return 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]'
    default: return 'bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC]'
  }
}

const dotClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-[#10B981]'
    case 'Terlambat': return 'bg-[#F59E0B]'
    case 'Izin': return 'bg-[#3B82F6]'
    case 'Sakit': return 'bg-[#06B6D4]'
    case 'Alpa': return 'bg-[#F43F5E]'
    default: return 'bg-[#98A2B3]'
  }
}

// CSV Export with UTF-8 BOM
const exportRecapCsv = () => {
  const headers = ['No', 'NIP', 'Nama Guru / Tendik', 'Jenjang', 'Mata Pelajaran', 'Jabatan / Peran', 'Gender', 'ID Kartu RFID', 'Jam Masuk', 'Jam Keluar', 'Status Presensi', 'Keterangan']
  const rows = filteredRows.value.map((s, i) => [
    i + 1,
    `"${s.nip}"`,
    `"${s.name}"`,
    s.school,
    `"${s.subject}"`,
    `"${s.level}"`,
    s.gender,
    `"${s.rfidUid}"`,
    s.timeIn || '-',
    s.timeOut || '-',
    s.status,
    s.status === 'Terlambat' ? `Terlambat ${s.lateMinutes || 0} menit` : '-'
  ])

  const csvContent = '\uFEFF' + [
    `Rekap Presensi Guru & Tenaga Kependidikan - ${selectedDay.value} (${selectedPeriod.value.toUpperCase()})`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `rekap_absensi_guru_${selectedPeriod.value}_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  triggerToast(`${filteredRows.value.length} data absensi diekspor ke CSV.`)
}

// Header & Navigation States
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

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals()
      isDetailModalOpen.value = false
    }
  })
})
</script>

<template>
  <div
    class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans overflow-x-clip antialiased pb-24 lg:pb-12 selection:bg-[#101828] selection:text-white"
    @click="closeAllModals"
  >
    <!-- STICKY HEADER & MEGA MENU -->
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header
        :jenjang="jenjang"
        :role="role"
        :groups="GROUPS"
        :active-group-id="activeMegaGroup?.id || 'kepegawaian'"
        :current-route="'kepegawaian'"
        :is-mega-open="isMegaOpen"
        @update:jenjang="jenjang = $event; triggerToast(`Beralih ke jenjang ${$event.toUpperCase()}`)"
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
          { label: 'Kepegawaian', to: '/adminV2/guru' },
          { label: 'Presensi & Absensi RFID Guru' }
        ]"
        :badge="activeGrade === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'"
        :jenjang="activeGrade === 'SMP' ? 'smp' : 'smk'"
      />

      <AdminV2MegaPanel
        :open="isMegaOpen"
        :group="activeMegaGroup"
        :jenjang="jenjang"
        @close="isMegaOpen = false"
        @select-item="handleSelectModule"
      />
    </div>

    <!-- MAIN PAGE CONTAINER -->
    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-6">
      <!-- SUB-MODULE NAVIGATION SWITCHER ANTAR HALAMAN KEPEGAWAIAN -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
        <NuxtLink
          to="/adminV2/guru"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] shrink-0"
        >
          <AdminV2Icon name="users" :size="16" />
          <span>Data Guru &amp; Staff</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F2F4F7] text-[#475467]">
            {{ teachersStore.staffList.value.length }} Pendidik
          </span>
        </NuxtLink>
        <NuxtLink
          to="/adminV2/absensi-guru"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-[#1B5FD9] text-white shadow-xs shrink-0"
        >
          <AdminV2Icon name="check-circle" :size="16" />
          <span>Presensi &amp; Absensi RFID</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white">
            Live Reader
          </span>
        </NuxtLink>
      </div>

      <!-- PAGE HEAD & AKSI -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-[#E8F0FE] text-[#12459B] border border-[#BFDBFE]">
              {{ activeGrade === 'SMP' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9' }}
            </span>
            <span class="inline-flex items-center gap-1.5 text-xs font-bold text-[#059669]">
              <span class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              RFID Reader Online (Ruang Guru &amp; Gerbang)
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
            {{ title }}
          </h1>
          <p class="text-xs sm:text-[13px] text-[#667085] mt-1 font-medium">
            {{ subtitle }}
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1B5FD9] hover:bg-[#154db0] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            @click="exportRecapCsv"
          >
            <AdminV2Icon name="dl" :size="16" />
            <span>Ekspor Rekap (.CSV)</span>
          </button>
        </div>
      </div>

      <!-- SUBMENU NAVIGATION PILLS (Overview vs Detail Kehadiran) -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0"
          :class="activeSubmenu === 'overview'
            ? 'bg-[#1B5FD9] text-white shadow-xs'
            : 'text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] font-semibold'"
          @click="activeSubmenu = 'overview'"
        >
          <AdminV2Icon name="grid" :size="16" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0"
          :class="activeSubmenu === 'detail'
            ? 'bg-[#1B5FD9] text-white shadow-xs'
            : 'text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] font-semibold'"
          @click="activeSubmenu = 'detail'"
        >
          <AdminV2Icon name="user" :size="16" />
          <span>Detail Kehadiran</span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
            :class="activeSubmenu === 'detail' ? 'bg-white/20 text-white' : 'bg-[#F2F4F7] text-[#475467]'"
          >
            {{ totalTeachersCount }} Guru &amp; Tendik
          </span>
        </button>
      </div>

      <!-- ============================================================= -->
      <!-- TAB 1: OVERVIEW                                               -->
      <!-- ============================================================= -->
      <div v-if="activeSubmenu === 'overview'" class="space-y-6">
        <!-- Period & Unit Filter Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E7EBF2] rounded-2xl p-3 sm:px-4 shadow-xs">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1B5FD9]" />
            <span class="text-xs font-bold text-[#101828]">Analitik Presensi Pendidik:</span>
            <span class="text-xs font-medium text-[#667085]">({{ periodLabel }})</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Jenjang Filter Switcher -->
            <div class="bg-[#F8FAFC] p-1 rounded-xl flex items-center border border-[#E2E8F0]">
              <button
                v-for="g in ['Semua', 'SMK', 'SMP']"
                :key="g"
                type="button"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
                :class="selectedGradeFilter === g ? 'bg-[#101828] text-white shadow-xs' : 'text-[#475467] hover:text-[#101828]'"
                @click="selectedGradeFilter = g"
              >
                {{ g }}
              </button>
            </div>
            <!-- Period Selector -->
            <div class="bg-[#F8FAFC] p-1 rounded-xl flex items-center border border-[#E2E8F0]">
              <button
                v-for="p in periodOptions"
                :key="p.value"
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                :class="selectedPeriod === p.value ? 'bg-[#1B5FD9] text-white shadow-xs' : 'text-[#475467] hover:text-[#101828]'"
                @click="selectedPeriod = p.value"
              >
                {{ p.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 4 Canonical KPI Cards (100% Dinamis & Proporsional) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(item, idx) in summaryCards"
            :key="item.label"
            class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-xs hover:border-[#1B5FD9]/30 transition-all flex flex-col justify-between"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-[#667085]">{{ item.label }}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2F4F7] text-[#344054] border border-[#E7EBF2]">
                {{ item.sub }}
              </span>
            </div>
            <div class="text-3xl font-extrabold font-mono text-[#101828] tracking-tight my-2.5 flex items-baseline gap-1.5">
              <span :class="idx === 0 ? 'text-[#059669]' : idx === 1 ? 'text-[#D97706]' : idx === 2 ? 'text-[#1D4ED8]' : 'text-[#DC2626]'">
                {{ item.value }}
              </span>
              <span class="text-xs font-semibold text-[#667085] font-sans">Pendidik</span>
            </div>
            <div class="text-xs font-semibold text-[#667085] flex items-center justify-between pt-2 border-t border-[#F2F4F7]">
              <span>{{ item.note }}</span>
              <span class="text-xs font-bold text-[#101828]">{{ item.rate }}</span>
            </div>
          </div>
        </div>

        <!-- Visualisasi Line & Donut Charts (Proporsional dari dataset aktif) -->
        <AbsensiGuruCharts
          :period-label="periodLabel"
          :trend-labels="trendLabels"
          :trend-series="trendSeries"
          :donut-segments="donutSegments"
          :total-teachers="totalTeachersCount"
          :avg-present-rate="`${hadirRate}%`"
        />

        <!-- Live RFID Stream Ticker -->
        <div class="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3 shrink-0">
            <div class="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <AdminV2Icon name="check" :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white tracking-wide">Live Stream Tap RFID Pendidik</span>
                <span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-[#10B981] text-white animate-pulse">Live</span>
              </div>
              <p class="text-[11px] text-slate-400 font-medium">Reader Ruang Guru &amp; Gerbang Utama</p>
            </div>
          </div>

          <!-- Realtime Ticker Items -->
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div
              v-for="tap in recentTaps"
              :key="tap.id"
              class="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center justify-between text-xs hover:bg-white/10 transition-colors"
            >
              <div class="min-w-0 pr-2">
                <b class="text-white font-bold block truncate text-[11.5px]">{{ tap.name }}</b>
                <span class="text-[10px] text-slate-300 font-mono">{{ tap.role }} &bull; {{ tap.rfid }}</span>
              </div>
              <div class="text-right shrink-0">
                <span
                  class="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider block mb-0.5"
                  :class="tap.status === 'Tepat Waktu' ? 'bg-[#059669]/30 text-emerald-300 border border-emerald-500/40' : 'bg-[#D97706]/30 text-amber-300 border border-amber-500/40'"
                >
                  {{ tap.time }}
                </span>
                <span class="text-[9px] text-slate-400">{{ tap.gate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Rekap Kehadiran per Jabatan / Peran Pendidik -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-[#101828] tracking-tight">Rekap Kehadiran per Jabatan / Peran Pendidik</h3>
            <span class="text-xs font-medium text-[#667085]">Klik unit untuk membuka detail rincian</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="r in roleSummaryMatrix"
              :key="r.role"
              class="p-4 rounded-2xl bg-white border border-[#E7EBF2] shadow-xs hover:shadow hover:border-[#1B5FD9] transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              @click="selectRoleAndGoDetail(r.role)"
            >
              <div class="flex items-start justify-between">
                <div>
                  <b class="text-sm font-bold text-[#101828] group-hover:text-[#1B5FD9] transition-colors block">{{ r.role }}</b>
                  <span class="text-[11px] text-[#667085] font-medium">{{ r.count }} Guru / Tendik</span>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  {{ r.percentage }}%
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-1">
                <div class="w-full bg-[#F2F4F7] rounded-full h-2 overflow-hidden flex">
                  <div class="bg-[#10B981] h-full" :style="{ width: `${r.percentage}%` }" />
                  <div class="bg-[#F59E0B] h-full" :style="{ width: `${r.latePct}%` }" />
                </div>
                <div class="flex items-center justify-between text-[10.5px] font-mono font-semibold text-[#667085]">
                  <span>Hadir: {{ r.present }}/{{ r.total }}</span>
                  <span>Terlambat: {{ r.late }}</span>
                </div>
              </div>

              <div class="pt-2 border-t border-[#F2F4F7] flex items-center justify-between text-xs font-bold text-[#1B5FD9] group-hover:translate-x-0.5 transition-transform">
                <span>Buka Detail Unit</span>
                <span>&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================= -->
      <!-- TAB 2: DETAIL KEHADIRAN                                       -->
      <!-- ============================================================= -->
      <div v-else class="space-y-4">
        <!-- Role / Unit Tab Navigator -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-2.5 shadow-xs space-y-2">
          <div class="flex items-center justify-between px-2 pt-0.5">
            <span class="text-xs font-bold text-[#667085] uppercase tracking-wider">Pilih Jabatan / Peran:</span>
            <span class="text-xs font-bold text-[#1B5FD9]">{{ selectedRole === 'Semua' ? 'Menampilkan Semua Pendidik & Tendik' : `Peran: ${selectedRole}` }}</span>
          </div>
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer"
              :class="selectedRole === 'Semua'
                ? 'bg-[#1B5FD9] text-white border-[#1B5FD9] shadow-xs'
                : 'bg-[#F8FAFC] text-[#344054] border-[#E2E8F0] hover:bg-[#F1F5F9]'"
              @click="selectedRole = 'Semua'"
            >
              Semua ({{ rawTeachers.length }})
            </button>
            <button
              v-for="roleItem in roleOptions"
              :key="roleItem"
              type="button"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer flex items-center gap-1.5"
              :class="selectedRole === roleItem
                ? 'bg-[#1B5FD9] text-white border-[#1B5FD9] shadow-xs'
                : 'bg-[#F8FAFC] text-[#344054] border-[#E2E8F0] hover:bg-[#F1F5F9]'"
              @click="selectedRole = roleItem"
            >
              <span>{{ roleItem }}</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
                :class="selectedRole === roleItem ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#475467]'"
              >
                {{ rawTeachers.filter(t => t.level.includes(roleItem) || (roleItem === 'Tendik' && (t.level.includes('TU') || t.level.includes('Keuangan')))).length }}
              </span>
            </button>
          </div>
        </div>

        <!-- Attendance Table Card -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl shadow-xs overflow-hidden">
          <!-- Toolbar & Filters -->
          <div class="p-4 sm:p-5 border-b border-[#F2F4F7] bg-[#F8FAFC] space-y-3.5">
            <div class="flex flex-wrap items-center gap-3">
              <!-- Day Selector -->
              <select
                v-model="selectedDay"
                class="px-3.5 py-2 text-xs font-bold bg-white text-[#344054] border border-[#CBD5E1] rounded-xl outline-none focus:border-[#1B5FD9] shadow-2xs cursor-pointer"
              >
                <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
              </select>

              <!-- School Grade Switcher -->
              <select
                v-model="selectedGradeFilter"
                class="px-3.5 py-2 text-xs font-bold bg-white text-[#344054] border border-[#CBD5E1] rounded-xl outline-none focus:border-[#1B5FD9] shadow-2xs cursor-pointer"
              >
                <option value="Semua">Semua Jenjang</option>
                <option value="SMK">SMK IT Attaqwa 9</option>
                <option value="SMP">SMP IT Bina Cendekia</option>
              </select>

              <!-- Sort Selector -->
              <select
                v-model="selectedSort"
                class="px-3.5 py-2 text-xs font-bold bg-white text-[#344054] border border-[#CBD5E1] rounded-xl outline-none focus:border-[#1B5FD9] shadow-2xs cursor-pointer"
              >
                <option value="time-desc">Waktu Tap Terbaru</option>
                <option value="time-asc">Waktu Tap Terlama</option>
                <option value="name-asc">Nama Guru (A-Z)</option>
                <option value="name-desc">Nama Guru (Z-A)</option>
                <option value="status">Status Presensi</option>
              </select>

              <!-- Search Box -->
              <label class="flex-1 min-w-[220px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] focus-within:border-[#1B5FD9] shadow-2xs transition-colors">
                <AdminV2Icon name="search" :size="16" class="text-[#94A3B8] shrink-0" />
                <input
                  v-model.trim="searchQuery"
                  placeholder="Cari nama guru, NIP, mapel, atau ID RFID..."
                  class="w-full text-xs font-medium outline-none bg-transparent text-[#1E293B] placeholder:text-[#94A3B8]"
                />
                <button
                  v-if="searchQuery"
                  class="text-[#94A3B8] hover:text-[#475467] text-xs font-bold cursor-pointer"
                  type="button"
                  @click="searchQuery = ''"
                >
                  ✕
                </button>
              </label>
            </div>

            <!-- Filter Status Chips -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              <span class="text-[11px] font-bold text-[#64748B] shrink-0 mr-1 uppercase tracking-wider">Status:</span>
              <button
                v-for="item in statusFilterOptions"
                :key="item.value"
                type="button"
                class="px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer"
                :class="selectedStatus === item.value
                  ? 'bg-[#101828] text-white border-[#101828] shadow-xs'
                  : 'bg-white text-[#475467] border-[#CBD5E1] hover:border-[#1B5FD9] hover:text-[#1B5FD9]'"
                @click="selectedStatus = item.value"
              >
                <span v-if="item.color" class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: item.color }" />
                <span>{{ item.label }}</span>
                <span
                  class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
                  :class="selectedStatus === item.value ? 'bg-white/20 text-white' : 'bg-[#F2F4F7] text-[#475467]'"
                >
                  {{ item.count }}
                </span>
              </button>
            </div>
          </div>

          <!-- Table View -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-[#344054]">
              <thead class="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-bold border-b border-[#E2E8F0] text-[11px]">
                <tr>
                  <th class="py-3.5 px-4">Guru / Tendik</th>
                  <th class="py-3.5 px-4">NIP &amp; RFID</th>
                  <th class="py-3.5 px-4">Mata Pelajaran</th>
                  <th class="py-3.5 px-4">Jam Masuk</th>
                  <th class="py-3.5 px-4">Jam Keluar</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F5F9]">
                <tr
                  v-for="item in pagedRows"
                  :key="item.id"
                  class="hover:bg-[#F8FAFC] transition-colors"
                >
                  <!-- Guru / Tendik -->
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <span
                        class="w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                        :class="item.school === 'SMK' ? 'bg-[#1B5FD9]' : 'bg-[#059669]'"
                      >
                        {{ initials(item.name) }}
                      </span>
                      <div>
                        <button
                          type="button"
                          class="text-[#101828] text-xs font-bold hover:text-[#1B5FD9] transition-colors block text-left cursor-pointer"
                          @click="openTeacherDetail(item)"
                        >
                          {{ item.name }}
                        </button>
                        <span class="text-[11px] text-[#64748B] font-medium">{{ item.level }} &bull; {{ item.school }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- NIP & RFID -->
                  <td class="py-3.5 px-4">
                    <div class="font-mono text-[#334155] font-semibold text-xs">{{ item.nip }}</div>
                    <div class="inline-flex items-center gap-1 text-[10.5px] font-mono text-[#64748B]">
                      <span class="text-[9px] uppercase px-1 py-0.2 rounded bg-[#F1F5F9] text-[#475467] font-bold">RFID</span>
                      <span>{{ item.rfidUid }}</span>
                    </div>
                  </td>

                  <!-- Mata Pelajaran -->
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] inline-block">
                      {{ item.subject }}
                    </span>
                  </td>

                  <!-- Jam Masuk -->
                  <td class="py-3.5 px-4 font-mono font-medium">
                    <div v-if="item.timeIn" class="flex items-center gap-1.5">
                      <span class="font-bold text-[#101828]">{{ item.timeIn }}</span>
                      <span
                        v-if="item.status === 'Terlambat'"
                        class="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#FEF3C7] text-[#92400E] font-sans"
                      >
                        +{{ item.lateMinutes }}m
                      </span>
                    </div>
                    <span v-else class="text-[#94A3B8] font-sans italic text-[11px]">Belum tap</span>
                  </td>

                  <!-- Jam Keluar -->
                  <td class="py-3.5 px-4 font-mono font-medium">
                    <span v-if="item.timeOut" class="font-bold text-[#101828]">{{ item.timeOut }}</span>
                    <span v-else class="text-[#94A3B8] font-sans italic text-[11px]">&mdash;</span>
                  </td>

                  <!-- Status Presensi -->
                  <td class="py-3.5 px-4">
                    <span
                      class="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs"
                      :class="pillClass(item.status)"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="dotClass(item.status)" />
                      <span>{{ item.status }}</span>
                    </span>
                  </td>

                  <!-- Aksi -->
                  <td class="py-3.5 px-4 text-right">
                    <button
                      class="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#334155] hover:text-[#1D4ED8] font-bold text-xs inline-flex items-center gap-1.5 transition-all border border-[#CBD5E1] cursor-pointer"
                      type="button"
                      @click="openTeacherDetail(item)"
                    >
                      <AdminV2Icon name="eye" :size="14" />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="filteredRows.length === 0">
                  <td colspan="7" class="py-12 text-center text-[#94A3B8] font-medium space-y-2">
                    <div class="text-[#334155] font-bold text-sm">Tidak ada data pendidik yang sesuai filter</div>
                    <p class="text-xs text-[#94A3B8]">Coba sesuaikan kata kunci pencarian atau reset filter peran/status.</p>
                    <button
                      class="px-3.5 py-1.5 rounded-xl bg-[#F2F4F7] text-[#344054] font-bold text-xs inline-block hover:bg-[#E4E7EC] transition-colors cursor-pointer"
                      type="button"
                      @click="resetFilters"
                    >
                      Reset Semua Filter
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[#F2F4F7] bg-[#F8FAFC] text-xs font-semibold text-[#64748B]">
            <div>
              Menampilkan <b class="text-[#101828]">{{ pagedRows.length }}</b> dari <b class="text-[#101828]">{{ filteredRows.length }}</b> guru &amp; tendik
            </div>
            <div class="flex items-center gap-1.5">
              <button
                class="px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-colors shadow-2xs cursor-pointer"
                :disabled="currentPage <= 1"
                type="button"
                @click="currentPage--"
              >
                &lsaquo; Sebelumnya
              </button>
              <span class="px-3 py-1.5 rounded-xl bg-[#E2E8F0] font-mono font-bold text-[#101828]">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                class="px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-colors shadow-2xs cursor-pointer"
                :disabled="currentPage >= totalPages"
                type="button"
                @click="currentPage++"
              >
                Berikutnya &rsaquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL DETAIL PRESENSI GURU -->
    <AbsensiGuruDetailModal
      :is-open="isDetailModalOpen"
      :teacher="selectedTeacher"
      @close="isDetailModalOpen = false"
      @save="handleSaveTeacher"
    />

    <!-- BOTTOM NAV (Mobile) -->
    <AdminV2BottomNav
      :role="role"
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @nav-click="handleSelectModule"
    />

    <!-- MOBILE MENU DRAWER -->
    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :role="role"
      :groups="GROUPS"
      :jenjang="jenjang"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
    />

    <!-- POPOVERS & SEARCH OVERLAY -->
    <AdminV2Popovers
      :is-search-open="isSearchOpen"
      :is-notif-open="isNotifOpen"
      :is-profile-open="isProfileOpen"
      :role="role"
      :jenjang="jenjang"
      @close-all="closeAllModals"
      @select-module="handleSelectModule"
    />

    <!-- GLOBAL TOAST NOTIFICATION -->
    <AdminV2Toast
      :show="isToastVisible"
      :message="toastMessage"
    />
  </div>
</template>
