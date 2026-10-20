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
import GuruV2Modal, { type StaffItem } from '~/components/adminV2/guru/GuruV2Modal.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useAdminTeachers } from '~/composables/useAdminTeachers'
import { GROUPS, type GroupItem } from '~/components/adminV2/adminV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Data Guru & Staff — Kepegawaian — Admin Portal Darqia 9',
  meta: [
    { name: 'description', content: 'Manajemen profil pendidik, penugasan, dan integrasi kartu absensi RFID ekosistem Darqia 9' }
  ]
})

/* ================= STORE & STATE TERINTEGRASI ================= */
const grade = useAdminGrade()
const teachersStore = useAdminTeachers()
const { staffList, syncAttendanceFromStaff } = teachersStore

const jenjang = ref<'smp' | 'smk'>(grade.value.toLowerCase() as 'smp' | 'smk')
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')

watch(jenjang, (v) => {
  grade.value = v.toUpperCase() as 'SMP' | 'SMK'
})

watch(grade, (v) => {
  jenjang.value = v.toLowerCase() as 'smp' | 'smk'
})

const schoolName = computed(() => {
  return grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
})

// Filter & Pencarian
const searchQuery = ref('')
const selectedUnit = ref<'all' | 'SMP' | 'SMK' | 'Yayasan'>('all')
const selectedStatus = ref<string>('all')

const filteredStaff = computed(() => {
  return staffList.value.filter((s) => {
    if (selectedUnit.value !== 'all' && s.unit !== selectedUnit.value) return false
    if (selectedStatus.value !== 'all' && s.status !== selectedStatus.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.nip.includes(q) || s.role.toLowerCase().includes(q)
    }
    return true
  })
})

const resetFilter = () => {
  searchQuery.value = ''
  selectedUnit.value = 'all'
  selectedStatus.value = 'all'
  triggerToast('Filter berhasil direset.')
}

// Modal Form State
const isModalOpen = ref(false)
const editingStaff = ref<StaffItem | null>(null)
const deletingStaff = ref<StaffItem | null>(null)

const openAddModal = () => {
  editingStaff.value = null
  isModalOpen.value = true
}

const openEditModal = (s: StaffItem) => {
  editingStaff.value = s
  isModalOpen.value = true
}

const handleSaveStaff = (data: Omit<StaffItem, 'id'> & { id?: string }) => {
  if (editingStaff.value) {
    const idx = staffList.value.findIndex(item => item.id === editingStaff.value?.id)
    if (idx !== -1) {
      const updated: StaffItem = { ...data, id: editingStaff.value.id }
      staffList.value[idx] = updated
      syncAttendanceFromStaff(updated)
      triggerToast(`Data ${data.name} berhasil diperbarui.`)
    }
  } else {
    const newItem: StaffItem = {
      id: `T-${Date.now()}`,
      ...data
    }
    staffList.value.unshift(newItem)
    syncAttendanceFromStaff(newItem)
    triggerToast(`Pendidik baru ${data.name} berhasil ditambahkan.`)
  }
  isModalOpen.value = false
}

const confirmDelete = (s: StaffItem) => {
  deletingStaff.value = s
}

const executeDelete = () => {
  if (deletingStaff.value) {
    const id = deletingStaff.value.id
    const name = deletingStaff.value.name
    staffList.value = staffList.value.filter(s => s.id !== id)
    teachersStore.attendanceList.value = teachersStore.attendanceList.value.filter(a => a.id !== id)
    triggerToast(`Data ${name} berhasil dihapus.`)
    deletingStaff.value = null
  }
}

// Ekspor CSV
const exportStaffCsv = () => {
  const headers = ['No', 'NIP/NUPTK', 'Nama Lengkap', 'Jabatan/Tugas', 'Unit', 'Mapel Utama', 'No HP', 'Status', 'RFID UID']
  const rows = filteredStaff.value.map((s, i) => [
    i + 1,
    `"${s.nip}"`,
    `"${s.name}"`,
    `"${s.role}"`,
    s.unit,
    `"${s.subject || '-'}"`,
    `"${s.phone}"`,
    s.status,
    `"${s.rfidUid}"`
  ])
  const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `data-guru-staff-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  triggerToast(`${filteredStaff.value.length} data guru diekspor ke CSV.`)
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
      isModalOpen.value = false
      deletingStaff.value = null
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
          { label: 'Data Guru & Staff' }
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

    <!-- MAIN PAGE CONTAINER -->
    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-6">
      <!-- SUB-MODULE NAVIGATION SWITCHER -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
        <NuxtLink
          to="/adminV2/guru"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-[#1B5FD9] text-white shadow-xs shrink-0"
        >
          <AdminV2Icon name="users" :size="16" />
          <span>Data Guru &amp; Staff</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white">
            {{ staffList.length }} Pendidik
          </span>
        </NuxtLink>
        <NuxtLink
          to="/adminV2/absensi-guru"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] shrink-0"
        >
          <AdminV2Icon name="check-circle" :size="16" />
          <span>Presensi &amp; Absensi RFID</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
            Live Reader
          </span>
        </NuxtLink>
      </div>

      <!-- PAGE HEAD & AKSI (Persis 1:1 Flow Admin Portal) -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-1">
            Portal Administrasi · Kepegawaian
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828] flex items-center gap-2.5 flex-wrap">
            <span>Data Guru &amp; Staff</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F0FE] text-[#12459B] border border-[#BFDBFE]">
              Pendidik &amp; Tenaga Kependidikan
            </span>
          </h1>
          <p class="text-xs sm:text-[13px] text-[#667085] mt-1 font-medium">
            Manajemen profil pendidik, penugasan, dan integrasi kartu absensi RFID &bull; {{ schoolName }} &bull; Yayasan Darqia
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F3F5F9] text-[#344054] text-xs sm:text-sm font-bold rounded-xl border border-[#D0D5DD] shadow-xs hover:border-[#98A2B3] transition-all cursor-pointer"
            @click="exportStaffCsv"
          >
            <AdminV2Icon name="dl" :size="16" class="text-[#667085]" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B5FD9] hover:bg-[#154db0] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            @click="openAddModal"
          >
            <AdminV2Icon name="plus" :size="16" />
            <span>Tambah Guru/Staff</span>
          </button>
        </div>
      </div>

      <!-- 4 KPI CARDS (Data 1:1 dari admin/guru) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <!-- 1. Total Guru & Staff -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] hover:border-[#1B5FD9]/30 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
              <AdminV2Icon name="users" :size="20" />
            </div>
            <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#F3F5F9] text-[#344054] border border-[#E7EBF2]">
              Yayasan
            </span>
          </div>
          <div class="text-3xl font-extrabold text-[#101828] tracking-tight mt-3 mb-1">
            {{ staffList.length }} Orang
          </div>
          <div class="text-xs font-medium text-[#667085]">
            Seluruh Unit Sekolah &amp; TU Terpadu
          </div>
        </div>

        <!-- 2. Guru SMP IT BCA -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] hover:border-[#16A34A]/30 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <AdminV2Icon name="book" :size="20" />
            </div>
            <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              SMP IT BCA
            </span>
          </div>
          <div class="text-3xl font-extrabold text-[#059669] tracking-tight mt-3 mb-1">
            {{ staffList.filter(s => s.unit === 'SMP').length }} Guru
          </div>
          <div class="text-xs font-medium text-[#667085]">
            Pendidik aktif jenjang SMP
          </div>
        </div>

        <!-- 3. Guru SMK IT Attaqwa 9 -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] hover:border-[#1B5FD9]/30 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <AdminV2Icon name="layers" :size="20" />
            </div>
            <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              SMK IT 9
            </span>
          </div>
          <div class="text-3xl font-extrabold text-[#1D4ED8] tracking-tight mt-3 mb-1">
            {{ staffList.filter(s => s.unit === 'SMK').length }} Guru
          </div>
          <div class="text-xs font-medium text-[#667085]">
            Pendidik aktif jenjang SMK
          </div>
        </div>

        <!-- 4. Kartu RFID Terdaftar -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] hover:border-[#7c3aed]/30 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
              <AdminV2Icon name="card" :size="20" />
            </div>
            <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
              RFID Active
            </span>
          </div>
          <div class="text-3xl font-extrabold text-[#101828] tracking-tight mt-3 mb-1">
            100%
          </div>
          <div class="text-xs font-medium text-[#667085]">
            Semua guru memiliki kartu RFID
          </div>
        </div>
      </div>

      <!-- FILTER & SEARCH BAR -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 shadow-xs">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Search Input -->
          <label class="flex items-center gap-2 px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex-1 min-w-[240px] focus-within:bg-white focus-within:border-[#1B5FD9] focus-within:ring-4 focus-within:ring-[#1B5FD9]/10 transition-all">
            <AdminV2Icon name="search" :size="16" class="text-[#94A3B8] shrink-0" />
            <input
              v-model="searchQuery"
              placeholder="Cari nama guru, NIP, atau jabatan..."
              class="bg-transparent text-xs sm:text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none w-full font-medium"
            />
          </label>

          <!-- Filter Unit -->
          <select
            v-model="selectedUnit"
            class="px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#334155] focus:bg-white focus:outline-none focus:border-[#1B5FD9] transition-all cursor-pointer min-w-[160px]"
          >
            <option value="all">Semua Unit</option>
            <option value="SMP">SMP IT BCA</option>
            <option value="SMK">SMK IT Attaqwa 9</option>
            <option value="Yayasan">Yayasan / TU</option>
          </select>

          <!-- Filter Status Kepegawaian -->
          <select
            v-model="selectedStatus"
            class="px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#334155] focus:bg-white focus:outline-none focus:border-[#1B5FD9] transition-all cursor-pointer min-w-[150px]"
          >
            <option value="all">Semua Status</option>
            <option value="GTY">GTY (Tetap Yayasan)</option>
            <option value="GTT">GTT (Honorer)</option>
            <option value="Staf Tetap">Staf Tetap Operasional</option>
          </select>

          <!-- Reset Filter -->
          <button
            type="button"
            class="px-3.5 py-2.5 text-xs font-bold text-[#475467] hover:text-[#101828] bg-[#F2F4F7] hover:bg-[#E4E7EC] rounded-xl transition cursor-pointer"
            title="Reset filter"
            @click="resetFilter"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- DATA TABLE (1:1 Flow & Function dari admin/guru) -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl shadow-xs overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F2F4F7] flex items-center justify-between bg-white">
          <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-[#101828] before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-[#1B5FD9]">
            Daftar Guru &amp; Tenaga Kependidikan &mdash; Ekosistem Attaqwa 9
          </h3>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E8F0FE] text-[#12459B] border border-[#BFDBFE]">
            {{ filteredStaff.length }} staf
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-[#344054]">
            <thead class="bg-[#F8FAFC] text-xs font-bold text-[#64748B] border-b border-[#E2E8F0] uppercase tracking-wider">
              <tr>
                <th class="px-4 py-3.5 w-12 text-center">No</th>
                <th class="px-4 py-3.5">Nama &amp; Gelar</th>
                <th class="px-4 py-3.5">NIP / NUPTK</th>
                <th class="px-4 py-3.5">Jabatan &amp; Tugas</th>
                <th class="px-4 py-3.5 text-center">Unit Sekolah</th>
                <th class="px-4 py-3.5 text-center">Status</th>
                <th class="px-4 py-3.5 text-center">RFID UID</th>
                <th class="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9]">
              <tr v-if="filteredStaff.length === 0">
                <td colspan="8" class="py-14 text-center text-[#94A3B8]">
                  <div class="text-sm font-bold mb-1 text-[#334155]">Tidak ada data guru atau staff ditemukan</div>
                  <div class="text-xs text-[#94A3B8]">Coba sesuaikan kata kunci pencarian atau filter yang dipilih.</div>
                </td>
              </tr>
              <tr
                v-for="(s, idx) in filteredStaff"
                :key="s.id"
                class="hover:bg-[#F8FAFC] transition"
              >
                <td class="px-4 py-3.5 text-xs text-[#94A3B8] font-mono text-center">{{ idx + 1 }}</td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <span
                      class="w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                      :class="s.unit === 'SMP' ? 'bg-[#059669]' : s.unit === 'SMK' ? 'bg-[#1B5FD9]' : 'bg-[#7C3AED]'"
                    >
                      {{ s.name.charAt(0) }}
                    </span>
                    <div>
                      <button
                        type="button"
                        class="font-bold text-[#101828] text-left hover:text-[#1B5FD9] transition block text-[13.5px] leading-tight cursor-pointer"
                        @click="openEditModal(s)"
                      >
                        {{ s.name }}
                      </button>
                      <div class="text-xs text-[#64748B] mt-0.5 font-mono">
                        {{ s.phone }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3.5 font-mono text-xs text-[#334155] font-semibold">
                  {{ s.nip }}
                </td>
                <td class="px-4 py-3.5 font-medium text-[#101828]">
                  <div>{{ s.role }}</div>
                  <div v-if="s.subject" class="text-xs text-[#64748B] mt-0.5 font-normal">
                    Mapel: {{ s.subject }}
                  </div>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                    :class="{
                      'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]': s.unit === 'SMP',
                      'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]': s.unit === 'SMK',
                      'bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]': s.unit === 'Yayasan'
                    }"
                  >
                    {{ s.unit === 'SMP' ? 'SMP IT BCA' : s.unit === 'SMK' ? 'SMK IT 9' : 'Yayasan / TU' }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#F2F4F7] text-[#344054]">
                    {{ s.status }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span class="inline-flex items-center gap-1 font-mono text-xs text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                    <AdminV2Icon name="card" :size="12" />
                    {{ s.rfidUid }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      class="p-1.5 rounded-lg text-[#64748B] hover:text-[#1B5FD9] hover:bg-[#EFF6FF] transition cursor-pointer"
                      title="Ubah Data"
                      @click="openEditModal(s)"
                    >
                      <AdminV2Icon name="pencil" :size="15" />
                    </button>
                    <button
                      type="button"
                      class="p-1.5 rounded-lg text-[#64748B] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition cursor-pointer"
                      title="Hapus"
                      @click="confirmDelete(s)"
                    >
                      <AdminV2Icon name="trash" :size="15" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-5 py-3.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B] bg-[#F8FAFC]">
          <span><b>{{ filteredStaff.length }}</b> dari total {{ staffList.length }} staf ditampilkan</span>
          <span class="font-mono text-[11px] text-[#94A3B8]">Tahun Ajaran 2026/2027</span>
        </div>
      </div>
    </main>

    <!-- MODAL FORM TAMBAH / UBAH GURU & STAFF -->
    <GuruV2Modal
      :is-open="isModalOpen"
      :editing-staff="editingStaff"
      :current-grade="grade"
      @close="isModalOpen = false"
      @save="handleSaveStaff"
    />

    <!-- MODAL KONFIRMASI HAPUS GURU / STAFF -->
    <Teleport to="body">
      <div v-if="deletingStaff" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#0C111D]/60 backdrop-blur-xs" @click="deletingStaff = null" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 space-y-4 border border-[#E7EBF2]">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-[#101828]">Hapus Data Pendidik?</h3>
            <button class="p-1 text-[#98A2B3] hover:text-[#101828] rounded-lg transition cursor-pointer" type="button" aria-label="Tutup" @click="deletingStaff = null">
              <AdminV2Icon name="x" :size="18" />
            </button>
          </div>
          <p class="text-sm text-[#475467] leading-relaxed">
            Apakah kamu yakin ingin menghapus data pendidik <b class="text-[#101828]">{{ deletingStaff.name }}</b> (NIP: {{ deletingStaff.nip }})?
          </p>
          <div class="flex justify-end gap-2 pt-2 border-t border-[#F2F4F7]">
            <button class="px-3.5 py-2 text-xs font-semibold text-[#475467] hover:text-[#101828] transition cursor-pointer" type="button" @click="deletingStaff = null">Batal</button>
            <button class="px-4 py-2 bg-[#D92D20] hover:bg-[#B42318] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer" type="button" @click="executeDelete">Hapus Pendidik</button>
          </div>
        </div>
      </div>
    </Teleport>

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
