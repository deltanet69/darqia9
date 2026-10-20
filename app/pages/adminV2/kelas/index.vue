<script setup lang="ts">
import { ref, computed } from 'vue'
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
import KelasV2CreateModal from '~/components/adminV2/kelas/KelasV2CreateModal.vue'
import { GROUPS, type GroupItem } from '~/components/adminV2/adminV2Data'

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

// 12 Master Raw Classes (Identik 1:1 Versi Asli admin/kelas/index.vue)
const rawClasses = ref<ClassRombel[]>([
  { name: 'VII-A', level: 'SMP', major: '', room: 'Gedung A · R.101', teacher: 'Siti Aminah, S.Pd', teacherNip: '198204152008012003', students: 34, boys: 18, girls: 16, attendance: 94, average: 84.2 },
  { name: 'VII-B', level: 'SMP', major: '', room: 'Gedung A · R.102', teacher: 'Rini Astuti, S.Pd', teacherNip: '199105102019032005', students: 36, boys: 19, girls: 17, attendance: 91, average: 82.8 },
  { name: 'VIII-A', level: 'SMP', major: '', room: 'Gedung A · R.201', teacher: 'Ahmad Fauzi, S.Pd', teacherNip: '198703122011011002', students: 35, boys: 18, girls: 17, attendance: 95, average: 85.1 },
  { name: 'VIII-B', level: 'SMP', major: '', room: 'Gedung A · R.202', teacher: 'Nurul Hidayati, S.Si', teacherNip: '198807142012012002', students: 35, boys: 17, girls: 18, attendance: 89, average: 81.5 },
  { name: 'IX-A', level: 'SMP', major: '', room: 'Gedung A · R.301', teacher: 'Drs. H. Ahmad Dahlan', teacherNip: '197508122000031001', students: 34, boys: 16, girls: 18, attendance: 96, average: 86.4 },
  { name: 'IX-B', level: 'SMP', major: '', room: 'Gedung A · R.302', teacher: 'Dewi Lestari, S.Pd', teacherNip: '199402182020122008', students: 36, boys: 20, girls: 16, attendance: 92, average: 83.7 },
  { name: 'X RPL 1', level: 'SMK', major: 'RPL', room: 'Gedung B · Lab 1', teacher: 'Bambang Supriyanto, M.Kom', teacherNip: '198901202015041002', students: 36, boys: 24, girls: 12, attendance: 94, average: 85.5 },
  { name: 'X RPL 2', level: 'SMK', major: 'RPL', room: 'Gedung B · Lab 2', teacher: 'Eko Prasetyo, S.Pd', teacherNip: '199009252016081003', students: 35, boys: 22, girls: 13, attendance: 90, average: 83.2 },
  { name: 'XI RPL 1', level: 'SMK', major: 'RPL', room: 'Gedung B · Lab 3', teacher: 'Hendra Gunawan, S.Kom', teacherNip: '198711032014021004', students: 34, boys: 23, girls: 11, attendance: 95, average: 86.9 },
  { name: 'XI TKJ 1', level: 'SMK', major: 'TKJ', room: 'Gedung B · Lab Jaringan', teacher: 'Rizky Wahyudi, S.T', teacherNip: '199208152018011003', students: 36, boys: 27, girls: 9, attendance: 93, average: 84.6 },
  { name: 'XII RPL 1', level: 'SMK', major: 'RPL', room: 'Gedung B · R.301', teacher: 'Fajar Nugroho, S.Pd', teacherNip: '199304122021011005', students: 35, boys: 22, girls: 13, attendance: 97, average: 88.3 },
  { name: 'XII TKJ 1', level: 'SMK', major: 'TKJ', room: 'Gedung B · R.302', teacher: 'Agus Setiawan, S.T', teacherNip: '198605202014031002', students: 34, boys: 26, girls: 8, attendance: 94, average: 85.8 }
])

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

const handleClassCreated = (newClass: { name: string; level: 'SMP' | 'SMK'; major: string; room: string; teacher: string }) => {
  rawClasses.value.unshift({
    name: newClass.name,
    level: newClass.level,
    major: newClass.major,
    room: newClass.room || 'Gedung Utama',
    teacher: newClass.teacher,
    teacherNip: '199001012020011001',
    students: 34,
    boys: 18,
    girls: 16,
    attendance: 95,
    average: 85.0
  })

  isCreateModalOpen.value = false
  activeSubmenu.value = 'daftar'
  triggerToast(`Rombel kelas ${newClass.name} berhasil ditambahkan ke daftar.`)
}

// Export CSV Function (1:1 Versi Asli)
const exportClassesCsv = () => {
  const headers = ['No', 'Nama Rombel', 'Jenjang', 'Jurusan', 'Wali Kelas', 'NIP Wali Kelas', 'Ruangan', 'Total Siswa', 'Laki-laki', 'Perempuan', 'Kehadiran (%)', 'Rata-rata Nilai']
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
  const t = title.toLowerCase()
  if (t === 'dashboard' || t === 'ringkasan utama') return router.push('/adminV2')
  if (t.includes('absensi') && (t.includes('guru') || t.includes('staff'))) return router.push('/adminV2/absensi-guru')
  if (t.includes('absensi')) return router.push('/adminV2/absensi')
  if (t.includes('cbt') || t === 'manajemen cbt') return router.push('/adminV2/cbt')
  if (t.includes('siswa') && !t.includes('kelas')) return router.push('/adminV2/siswa')
  if (t.includes('kelas')) return router.push('/adminV2/kelas')
  if (t.includes('mapel')) return router.push('/adminV2/mapel')
  if (t.includes('raport') || t.includes('rapor')) return router.push('/adminV2/raport')
  if (t.includes('guru') || t.includes('pegawai') || t.includes('staff')) return router.push('/adminV2/guru')
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
            @click="isCreateModalOpen = true"
          >
            <AdminV2Icon name="plus" :size="14" />
            <span>Tambah Rombel</span>
          </button>
        </div>
      </div>

      <!-- Submenu Navigation Pills (Hanya 2 Tab: Overview & Daftar Rombel Kelas) -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shrink-0"
          :class="activeSubmenu === 'overview'
            ? 'bg-[#101828] text-white shadow-xs'
            : 'text-[#475467] hover:text-[#101828] hover:bg-[#F8FAFC] font-semibold'"
          @click="activeSubmenu = 'overview'"
        >
          <AdminV2Icon name="grid" :size="15" />
          <span>Overview &amp; Kapasitas</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shrink-0"
          :class="activeSubmenu === 'daftar'
            ? 'bg-[#101828] text-white shadow-xs'
            : 'text-[#475467] hover:text-[#101828] hover:bg-[#F8FAFC] font-semibold'"
          @click="activeSubmenu = 'daftar'"
        >
          <AdminV2Icon name="layers" :size="15" />
          <span>Daftar Rombel Kelas</span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
            :class="activeSubmenu === 'daftar' ? 'bg-white/20 text-white' : 'bg-[#EFF2F7] text-[#344054]'"
          >
            {{ rawClasses.length }} Kelas
          </span>
        </button>
      </div>

      <!-- TAB 1: OVERVIEW & KAPASITAS -->
      <KelasV2OverviewTab
        v-if="activeSubmenu === 'overview'"
        :total-classes="rawClasses.length"
        @go-daftar="activeSubmenu = 'daftar'"
        @select-class="goToClassDetail"
      />

      <!-- TAB 2: DAFTAR ROMBEL KELAS -->
      <KelasV2DaftarTab
        v-else-if="activeSubmenu === 'daftar'"
        :classes="rawClasses"
        @select-class="goToClassDetail"
        @open-presensi="goToClassAttendance"
      />
    </main>

    <!-- MODAL TAMBAH ROMBEL -->
    <KelasV2CreateModal
      :open="isCreateModalOpen"
      :default-level="jenjang.toUpperCase() as any"
      @close="isCreateModalOpen = false"
      @created="handleClassCreated"
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
      :show="isToastVisible"
      :message="toastMessage"
    />
  </div>
</template>
