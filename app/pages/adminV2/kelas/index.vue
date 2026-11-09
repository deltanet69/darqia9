<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import KelasV2OverviewTab from '~/components/adminV2/kelas/KelasV2OverviewTab.vue'
import KelasV2DaftarTab, { type ClassRombel } from '~/components/adminV2/kelas/KelasV2DaftarTab.vue'
import KelasV2CreateModal, { type ClassFormData } from '~/components/adminV2/kelas/KelasV2CreateModal.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'

definePageMeta({
  layout: false
})

useHead({
  title: 'Manajemen Rombel & Kelas — Admin Portal Darqia 9',
  meta: [
    { name: 'description', content: 'Pengelolaan rombongan belajar, kapasitas ruang, dan data wali kelas SMK IT Attaqwa 9 & SMP IT Bina Cendekia Assalam' }
  ]
})

const router = useRouter()
const cbtData = useAdminCbtData()

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

// Submenu Navigation (2 Tabs Identik Versi Awal)
export type SubmenuKey = 'overview' | 'daftar'
const activeSubmenu = ref<SubmenuKey>('overview')

// Rombel berasal dari data master siswa: hanya kelas yang punya siswa aktif yang ditampilkan.
// Kehadiran & rata-rata nilai 0 = belum tersambung ke modul Absensi/Penilaian (tidak diisi angka rekaan).
const rawClasses = computed<ClassRombel[]>(() => {
  const currentGrade = jenjang.value.toUpperCase()
  return cbtData.classes.value
    .filter(item => item.grade === currentGrade && item.studentCount > 0)
    .map(item => ({
      id: item.id,
      name: item.name,
      level: item.grade as 'SMP' | 'SMK',
      major: item.major,
      room: item.room || 'Ruang Belajar',
      homeroomTeacherId: item.homeroomTeacherId,
      teacher: item.teacher,
      teacherNip: item.teacherNip,
      students: item.studentCount,
      boys: item.boysCount,
      girls: item.girlsCount,
      attendance: 0,
      average: 0
    }))
})

// Navigation to Class Detail
const goToClassDetail = (className: string) => {
  router.push(`/adminV2/kelas/${encodeURIComponent(className)}`)
}

// Navigation to Attendance
const goToClassAttendance = (item: ClassRombel) => {
  router.push({
    path: '/adminV2/absensi',
    query: {
      kelas: item.name,
      jenjang: item.level
    }
  })
}

// Create Class Modal State
const isCreateModalOpen = ref(false)
const editingClass = ref<ClassFormData | null>(null)

const handleClassSaved = async (newClass: Required<Omit<ClassFormData, 'id'>> & { id?: string }) => {
  try {
    if (!newClass.homeroomTeacherId) throw new Error('Wali kelas wajib dipilih.')
    await cbtData.saveClass({
      id: newClass.id,
      name: newClass.name,
      grade: newClass.level,
      major: newClass.major,
      room: newClass.room,
      homeroomTeacherId: newClass.homeroomTeacherId
    })
    isCreateModalOpen.value = false
    editingClass.value = null
    activeSubmenu.value = 'daftar'
    triggerToast(`Rombel kelas ${newClass.name} berhasil disimpan.`)
  } catch (saveError) {
    triggerToast(saveError instanceof Error ? saveError.message : 'Rombel gagal disimpan.')
  }
}

const editClass = (item: ClassRombel) => {
  editingClass.value = item
  isCreateModalOpen.value = true
}

const archiveClass = async (item: ClassRombel) => {
  if (!window.confirm(`Arsipkan rombel ${item.name}?`)) return
  try {
    await cbtData.archiveClass(item.id)
    triggerToast(`Rombel ${item.name} berhasil diarsipkan.`)
  } catch (archiveError) {
    triggerToast(archiveError instanceof Error ? archiveError.message : 'Rombel gagal diarsipkan.')
  }
}

onMounted(() => cbtData.load())

// Export CSV Function (1:1 Versi Asli)
const exportClassesCsv = () => {
  const headers = ['No', 'Nama Rombel', 'Jenjang', 'Jurusan', 'Wali Kelas', 'NIP Wali Kelas', 'Ruangan', 'Total Siswa', 'Laki laki', 'Perempuan', 'Kehadiran (%)', 'Rata-rata Nilai']
  const rows = rawClasses.value.map((c, i) => [
    i + 1,
    `"${c.name}"`,
    c.level,
    c.major || 'Umum',
    `"${c.teacher}"`,
    `"${c.teacherNip}"`,
    `"${c.room}"`,
    c.students,
    c.boys,
    c.girls,
    c.attendance,
    c.average
  ])

  const csvContent = '\uFEFF' + [
    'Data Manajemen Rombongan Belajar (Rombel) Kelas - Tahun Ajaran 2026/2027',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `data_rombel_kelas_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  triggerToast('Data seluruh rombel kelas berhasil diekspor ke CSV.')
}

// Global Nav & Mega Menu
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
  }
}

const handleSelectModule = (title: string) => {
  closeAllModals()
  const dest = getAdminDestination(title)
  if (dest) return router.push(dest)
  triggerToast(`${title} — modul demo`)
}
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
        :active-group-id="activeMegaGroup?.id || 'akademik'"
        :current-route="'akademik'"
        :is-mega-open="isMegaOpen"
        @update:jenjang="jenjang = $event"
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
          { label: 'Manajemen Rombel & Kelas' }
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

    <!-- MAIN CONTAINER -->
    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-4 sm:space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider"
              :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534] border border-[#A6E9C5]' : 'bg-[#EFF4FF] text-[#1B5FD9] border border-[#B2CCFF]'"
            >
              {{ jenjang === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9' }}
            </span>
            <span class="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#667085]">
              Tahun Ajaran 2026/2027 &bull; Semester Ganjil
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
            Manajemen Rombel &amp; Kelas
          </h1>
          <p class="text-xs sm:text-sm text-[#667085] mt-0.5 font-medium">
            Kelola rombongan belajar, kapasitas ruang, dan data wali kelas
          </p>
        </div>

        <!-- Action Buttons (Ekspor CSV & Tambah Rombel) -->
        <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl font-bold text-xs text-[#344054] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-2xs flex items-center gap-2 transition cursor-pointer"
            @click="exportClassesCsv"
          >
            <AdminV2Icon name="dl" :size="14" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#1B5FD9] hover:bg-[#154EBC] shadow-xs flex items-center gap-2 transition cursor-pointer"
            @click="editingClass = null; isCreateModalOpen = true"
          >
            <AdminV2Icon name="plus" :size="14" />
            <span>Tambah Rombel</span>
          </button>
        </div>
      </div>

      <!-- SUBMENU NAVIGATION BAR: Identik 1:1 Styling Standar AdminV2 (Keuangan, Absensi, CBT) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="w-full sm:w-auto overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav
            class="inline-flex items-center gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1.5 rounded-2xl min-w-max"
            role="tablist"
            aria-label="Navigasi Manajemen Kelas"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="activeSubmenu === 'overview'"
              @click="activeSubmenu = 'overview'"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-all cursor-pointer select-none"
              :class="activeSubmenu === 'overview'
                ? 'bg-[#101828] text-white shadow-[0_2px_8px_rgba(16,24,40,0.15)]'
                : 'text-[#475467] hover:text-[#101828] hover:bg-white/60 font-semibold'"
            >
              <AdminV2Icon name="grid" :size="15" />
              <span>Overview &amp; Kapasitas</span>
            </button>

            <button
              type="button"
              role="tab"
              :aria-selected="activeSubmenu === 'daftar'"
              @click="activeSubmenu = 'daftar'"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-all cursor-pointer select-none"
              :class="activeSubmenu === 'daftar'
                ? 'bg-[#101828] text-white shadow-[0_2px_8px_rgba(16,24,40,0.15)]'
                : 'text-[#475467] hover:text-[#101828] hover:bg-white/60 font-semibold'"
            >
              <AdminV2Icon name="layers" :size="15" />
              <span>Daftar Rombel Kelas</span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                :class="activeSubmenu === 'daftar' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
              >
                {{ rawClasses.length }} Kelas
              </span>
            </button>
          </nav>
        </div>

        <!-- Indikator Total Rombel di Data Induk -->
        <div class="hidden sm:flex items-center gap-2 text-[12px] font-semibold text-slate-500 shrink-0">
          <span class="inline-block h-2 w-2 rounded-full" :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
          <span>{{ rawClasses.length }} rombel {{ jenjang.toUpperCase() }} terdaftar di Data Induk</span>
        </div>
      </div>

      <!-- Strip Identitas Jenjang Terintegrasi (Clean & Sleek) -->
      <div class="flex items-center justify-between gap-3 rounded-xl border border-[#E7EBF2] bg-white px-4 py-2.5 text-xs text-slate-600 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div class="flex items-center gap-2 min-w-0">
          <span class="flex h-2 w-2 rounded-full shrink-0" :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
          <span class="font-bold text-slate-800 shrink-0">{{ jenjang === 'smk' ? 'SMK IT Attaqwa 9' : 'SMP IT BCA' }}</span>
          <span class="text-slate-300">|</span>
          <span class="text-slate-500 truncate">Tahun Ajaran 2026/2027 &middot; Semester Ganjil &middot; Data disinkronkan otomatis dari Data Induk Siswa</span>
        </div>
        <span class="shrink-0 text-[11px] font-semibold text-slate-400 hidden md:inline">
          Ganti jenjang lewat switch SMP/SMK di bilah atas
        </span>
      </div>

      <!-- TAB 1: OVERVIEW & KAPASITAS -->
      <KelasV2OverviewTab
        v-if="activeSubmenu === 'overview'"
        :total-classes="rawClasses.length"
        :jenjang="jenjang"
        @go-daftar="activeSubmenu = 'daftar'"
        @select-class="goToClassDetail"
      />

      <!-- TAB 2: DAFTAR ROMBEL KELAS -->
      <KelasV2DaftarTab
        v-else-if="activeSubmenu === 'daftar'"
        :classes="rawClasses"
        @select-class="goToClassDetail"
        @edit-class="editClass"
        @archive-class="archiveClass"
        @open-presensi="goToClassAttendance"
      />
    </main>

    <!-- MODAL TAMBAH ROMBEL -->
    <KelasV2CreateModal
      :open="isCreateModalOpen"
      :default-level="jenjang.toUpperCase() as any"
      :teachers="cbtData.teachers.value"
      :classroom="editingClass"
      @close="isCreateModalOpen = false; editingClass = null"
      @saved="handleClassSaved"
    />

    <!-- BOTTOM BAR NAVIGATION (Mobile) -->
    <AdminV2BottomNav
      :role="role"
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @nav-click="handleSelectModule"
    />

    <!-- MOBILE DRAWER MENU -->
    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :role="role"
      :groups="GROUPS"
      :jenjang="jenjang"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
    />

    <!-- POPOVERS -->
    <AdminV2Popovers
      :is-search-open="isSearchOpen"
      :is-notif-open="isNotifOpen"
      :is-profile-open="isProfileOpen"
      :role="role"
      :jenjang="jenjang"
      @close-all="closeAllModals"
      @select-module="handleSelectModule"
    />

    <!-- TOAST NOTIFICATION -->
    <AdminV2Toast
      :visible="isToastVisible"
      :message="toastMessage"
    />
  </div>
</template>
