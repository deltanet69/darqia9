<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import RaportPreviewModal, { type ReportStudent } from '~/components/adminV2/raport/RaportPreviewModal.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Raport Siswa — Admin Portal Darqia 9',
  meta: [
    { name: 'description', content: 'Rekapitulasi pencapaian nilai kompetensi, ketuntasan belajar per rombel kelas, dan cetak rapor digital' }
  ]
})

const router = useRouter()

// Reactive Jenjang & Role
const jenjang = ref<'smp' | 'smk'>('smk')
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')

const grade = computed<'SMP' | 'SMK'>(() => jenjang.value.toUpperCase() as 'SMP' | 'SMK')
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

// Header Popovers & Mobile Navigation
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
  }, 2600)
}

// Filter State (Berdasarkan Kelas)
const selectedClass = ref('all')
const searchQuery = ref('')
const selectedStatus = ref('all')
const activePreviewStudent = ref<ReportStudent | null>(null)

const smpClasses = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B']
const smkClasses = ['X RPL 1', 'X TKJ 1', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']

const availableClasses = computed(() => grade.value === 'SMP' ? smpClasses : smkClasses)

// Auto reset class filter if switched jenjang
watch(jenjang, () => {
  selectedClass.value = 'all'
})

// Report Students Master Data (Identik 1:1 Versi Asli admin/raport/index.vue)
const reportStudents = ref<ReportStudent[]>([
  // SMP Students
  { id: 'RS-01', nisn: '0089123401', nis: '242507001', name: 'Ahmad Faiz Ramadhan', className: 'VII-A', gender: 'L', averageScore: 88.4, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMP' },
  { id: 'RS-02', nisn: '0089123402', nis: '242507002', name: 'Aisyah Putri Azzahra', className: 'VII-A', gender: 'P', averageScore: 86.9, rank: 2, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMP' },
  { id: 'RS-03', nisn: '0089123403', nis: '242507003', name: 'Bilal Al-Ghifari', className: 'VII-A', gender: 'L', averageScore: 81.2, rank: 3, kkmStatus: 'Tuntas', reportStatus: 'Siap Cetak', grade: 'SMP' },
  { id: 'RS-04', nisn: '0089123404', nis: '242507004', name: 'Fatimah Zahra', className: 'VIII-A', gender: 'P', averageScore: 89.0, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Siap Cetak', grade: 'SMP' },
  { id: 'RS-05', nisn: '0089123405', nis: '242507005', name: 'Hafiz Muhammad', className: 'VIII-A', gender: 'L', averageScore: 74.0, rank: 14, kkmStatus: 'Remedial', reportStatus: 'Draft', grade: 'SMP' },
  { id: 'RS-06', nisn: '0089123406', nis: '242507006', name: 'Nabila Syakira', className: 'IX-A', gender: 'P', averageScore: 91.5, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMP' },

  // SMK Students
  { id: 'RS-07', nisn: '3095100998', nis: '242510001', name: 'A. Sauqi Nur Kamil', className: 'X RPL 1', gender: 'L', averageScore: 87.6, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMK' },
  { id: 'RS-08', nisn: '3095100999', nis: '242510002', name: 'Abdurrahman Al-Farisi', className: 'X RPL 1', gender: 'L', averageScore: 83.2, rank: 2, kkmStatus: 'Tuntas', reportStatus: 'Siap Cetak', grade: 'SMK' },
  { id: 'RS-09', nisn: '3095101000', nis: '242510003', name: 'Adinda Nurhaliza', className: 'X TKJ 1', gender: 'P', averageScore: 85.0, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMK' },
  { id: 'RS-10', nisn: '3095101001', nis: '242510004', name: 'Arya Putra Pratama', className: 'XI RPL 1', gender: 'L', averageScore: 80.5, rank: 4, kkmStatus: 'Tuntas', reportStatus: 'Siap Cetak', grade: 'SMK' },
  { id: 'RS-11', nisn: '3095101002', nis: '242510005', name: 'Bagas Wahyu Hidayat', className: 'XII TKJ 1', gender: 'L', averageScore: 72.8, rank: 18, kkmStatus: 'Remedial', reportStatus: 'Draft', grade: 'SMK' }
])

// Class Pill Options with Count
const classPills = computed(() => {
  const currentGradeStudents = reportStudents.value.filter(s => s.grade === grade.value)
  return [
    { label: 'Semua Rombel', value: 'all', count: currentGradeStudents.length },
    ...availableClasses.value.map(c => ({
      label: c,
      value: c,
      count: currentGradeStudents.filter(s => s.className === c).length
    }))
  ]
})

// Filtered List
const filteredList = computed(() => {
  return reportStudents.value.filter(s => {
    if (s.grade !== grade.value) return false
    if (selectedClass.value !== 'all' && s.className !== selectedClass.value) return false
    if (selectedStatus.value !== 'all' && s.reportStatus !== selectedStatus.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.nisn.includes(q) || s.nis.includes(q)
    }
    return true
  })
})

const completedCount = computed(() => filteredList.value.filter(s => s.kkmStatus === 'Tuntas').length)
const completionRate = computed(() => filteredList.value.length ? Math.round((completedCount.value / filteredList.value.length) * 100) : 0)
const publishedCount = computed(() => filteredList.value.filter(s => s.reportStatus === 'Diterbitkan').length)
const readyCount = computed(() => filteredList.value.filter(s => s.reportStatus === 'Siap Cetak').length)

const openPreview = (s: ReportStudent) => {
  activePreviewStudent.value = s
}

const handleBulkPrint = () => {
  triggerToast('Mempersiapkan dokumen cetak masal rapor siswa...')
  setTimeout(() => {
    window.print()
  }, 300)
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
          { label: 'Raport Siswa' }
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

    <!-- MAIN CONTAINER -->
    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-4 sm:space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider"
              :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#166534] border border-[#A6E9C5]' : 'bg-[#EFF4FF] text-[#1B5FD9] border border-[#B2CCFF]'"
            >
              {{ schoolName }}
            </span>
            <span class="text-xs font-semibold text-[#667085]">Semester Ganjil &bull; T.A 2026/2027</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
            Raport Siswa (Berdasarkan Kelas)
          </h1>
          <p class="text-xs sm:text-sm text-[#667085] mt-0.5 font-medium">
            Rekapitulasi pencapaian nilai kompetensi, ketuntasan belajar per rombel, dan cetak rapor digital
          </p>
        </div>

        <!-- Action Button -->
        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl font-bold text-xs text-[#344054] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-2xs flex items-center gap-2 transition cursor-pointer"
            @click="handleBulkPrint"
          >
            <AdminV2Icon name="printer" :size="14" />
            <span>Cetak Masal</span>
          </button>
        </div>
      </div>

      <!-- Class Selection Bar (Berdasarkan Kelas) -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span class="text-[11px] font-extrabold text-[#98A2B3] shrink-0 mx-2 uppercase tracking-wider">
          Pilih Rombel:
        </span>
        <button
          v-for="pill in classPills"
          :key="pill.value"
          type="button"
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap"
          :class="selectedClass === pill.value
            ? 'bg-[#101828] text-white shadow-xs'
            : 'text-[#475467] hover:text-[#101828] hover:bg-[#F8FAFC] font-semibold'"
          @click="selectedClass = pill.value"
        >
          <span>{{ pill.label }}</span>
          <span
            class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
            :class="selectedClass === pill.value ? 'bg-white/20 text-white' : 'bg-[#EFF2F7] text-[#344054]'"
          >
            {{ pill.count }}
          </span>
        </button>
      </div>

      <!-- 4 KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
          <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Total Siswa Terdaftar</span>
          <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#101828] block mt-1.5">{{ filteredList.length }} Siswa</b>
          <span class="text-xs text-[#667085] block mt-1">
            {{ selectedClass === 'all' ? 'Seluruh Rombel' : 'Rombel ' + selectedClass }}
          </span>
        </div>

        <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
          <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Ketuntasan Belajar</span>
          <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#059669] block mt-1.5">{{ completionRate }}%</b>
          <span class="text-xs text-[#667085] block mt-1">{{ completedCount }} siswa tuntas KKM</span>
        </div>

        <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
          <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Rapor Diterbitkan</span>
          <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#1B5FD9] block mt-1.5">{{ publishedCount }}</b>
          <span class="text-xs text-[#667085] block mt-1">Tervalidasi Kepala Sekolah</span>
        </div>

        <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
          <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Rapor Siap Cetak</span>
          <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#101828] block mt-1.5">{{ readyCount }}</b>
          <span class="text-xs text-[#667085] block mt-1">Menunggu penandatanganan</span>
        </div>
      </div>

      <!-- Toolbar / Filter Bar -->
      <div class="bg-white border border-[#E7EBF2] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama siswa, NISN, atau NIS..."
            class="w-full pl-9 pr-4 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1B5FD9] font-medium transition-colors text-[#101828] placeholder:text-[#98A2B3]"
          />
          <AdminV2Icon name="search" :size="15" class="absolute left-3 top-3 text-[#98A2B3]" />
        </div>

        <select
          v-model="selectedClass"
          class="w-full sm:w-48 px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1B5FD9] font-bold text-[#344054] cursor-pointer"
        >
          <option value="all">Semua Rombel</option>
          <option v-for="c in availableClasses" :key="c" :value="c">{{ c }}</option>
        </select>

        <select
          v-model="selectedStatus"
          class="w-full sm:w-48 px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1B5FD9] font-bold text-[#344054] cursor-pointer"
        >
          <option value="all">Semua Status Rapor</option>
          <option value="Diterbitkan">Diterbitkan</option>
          <option value="Siap Cetak">Siap Cetak</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <!-- Report Table -->
      <div class="bg-white border border-[#E7EBF2] rounded-3xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#F8FAFC] text-[#475467] font-bold uppercase tracking-wider text-[10.5px] border-b border-[#E7EBF2]">
              <tr>
                <th class="py-3.5 px-4 font-mono text-center">Peringkat</th>
                <th class="py-3.5 px-4">NISN / NIS</th>
                <th class="py-3.5 px-4">Nama Lengkap</th>
                <th class="py-3.5 px-4 text-center">Kelas</th>
                <th class="py-3.5 px-4 text-center">Rata-rata Nilai</th>
                <th class="py-3.5 px-4 text-center">Ketuntasan</th>
                <th class="py-3.5 px-4 text-center">Status Rapor</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9] font-medium text-[#344054]">
              <tr
                v-for="s in filteredList"
                :key="s.id"
                class="hover:bg-[#F8FAFC] transition-colors"
              >
                <td class="py-3.5 px-4 font-extrabold text-[#101828] font-mono text-center">
                  <span class="px-2 py-0.5 rounded-lg bg-[#EFF2F7]">#{{ s.rank }}</span>
                </td>
                <td class="py-3.5 px-4 font-mono">
                  <b class="text-[#101828] block">{{ s.nisn }}</b>
                  <span class="text-[10.5px] text-[#98A2B3]">NIS: {{ s.nis }}</span>
                </td>
                <td class="py-3.5 px-4 font-extrabold text-[#101828] text-[13px]">{{ s.name }}</td>
                <td class="py-3.5 px-4 text-center">
                  <span class="px-2.5 py-0.5 rounded-xl text-[10.5px] font-bold bg-[#EFF2F7] text-[#344054]">
                    {{ s.className }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center font-mono font-extrabold text-[#1B5FD9] text-sm">
                  {{ s.averageScore }}
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
                    :class="s.kkmStatus === 'Tuntas' ? 'bg-[#E7F6ED] text-[#166534] border-[#A6E9C5]' : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'"
                  >
                    {{ s.kkmStatus }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
                    :class="{
                      'bg-[#EFF4FF] text-[#1B5FD9] border-[#B2CCFF]': s.reportStatus === 'Diterbitkan',
                      'bg-[#FEF6EE] text-[#B93815] border-[#F9DBAF]': s.reportStatus === 'Siap Cetak',
                      'bg-[#EFF2F7] text-[#475467] border-[#E2E8F0]': s.reportStatus === 'Draft'
                    }"
                  >
                    {{ s.reportStatus }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold text-[#1B5FD9] bg-[#EFF4FF] hover:bg-[#D1E0FF] transition cursor-pointer"
                    @click="openPreview(s)"
                  >
                    Lihat Rapor
                  </button>
                </td>
              </tr>
              <tr v-if="filteredList.length === 0">
                <td colspan="8" class="py-12 text-center text-[#98A2B3] font-medium">
                  Tidak ada data rapor siswa ditemukan pada rombel ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- MODAL PRATINJAU RAPOR DIGITAL -->
    <RaportPreviewModal
      :student="activePreviewStudent"
      :school-name="schoolName"
      :grade="grade"
      @close="activePreviewStudent = null"
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
