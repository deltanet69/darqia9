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
import GuruV2Modal from '~/components/adminV2/guru/GuruV2Modal.vue'
import GuruV2DetailModal from '~/components/adminV2/guru/GuruV2DetailModal.vue'
import GuruV2UploadModal from '~/components/adminV2/guru/GuruV2UploadModal.vue'
import GuruV2Table from '~/components/adminV2/guru/GuruV2Table.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useAdminTeachers, type StaffItem } from '~/composables/useAdminTeachers'
import { useAdminSystemStore } from '~/composables/useAdminSystemStore'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Data Induk Guru & Staff — Kepegawaian — Admin Portal Darqia 9',
  meta: [
    { name: 'description', content: 'Manajemen data induk pendidik, penugasan, integrasi RFID, dan sinkronisasi akun portal ekosistem Darqia 9' }
  ]
})

/* ================= STORE & STATE TERINTEGRASI ================= */
const grade = useAdminGrade()
const teachersStore = useAdminTeachers()
const systemStore = useAdminSystemStore()
const {
  staffList,
  syncAttendanceFromStaff,
  fetchTeachersFromDb,
  saveStaffToDb,
  batchImportTeachersToDb,
  syncTeacherAccounts,
  deleteStaffFromDb,
  isDbConnected
} = teachersStore

// Muat data dari Supabase saat halaman dibuka
onMounted(async () => {
  await fetchTeachersFromDb()
})

const isSyncingDb = ref(false)
const syncAllToDatabase = async () => {
  if (staffList.value.length === 0) {
    triggerToast('Tidak ada data guru untuk disinkronkan ke database.')
    return
  }
  isSyncingDb.value = true
  const res = await batchImportTeachersToDb(staffList.value)
  isSyncingDb.value = false
  if (res.success) {
    triggerToast(`Sukses! ${staffList.value.length} data guru berhasil tersimpan di tabel teachers Supabase.`)
  } else {
    triggerToast(`Gagal menyimpan ke Supabase: ${res.error || 'Cek RLS policy atau jalankan migrasi 0007'}`)
  }
}

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
      return (
        s.name.toLowerCase().includes(q) ||
        s.nip.includes(q) ||
        (s.nik && s.nik.includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        s.role.toLowerCase().includes(q)
      )
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

// Modal States
const isModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isUploadModalOpen = ref(false)
const editingStaff = ref<StaffItem | null>(null)
const viewingStaff = ref<StaffItem | null>(null)
const deletingStaff = ref<StaffItem | null>(null)

const openAddModal = () => {
  editingStaff.value = null
  isModalOpen.value = true
}

const openEditModal = (s: StaffItem) => {
  editingStaff.value = s
  isModalOpen.value = true
}

const openDetailModal = (s: StaffItem) => {
  viewingStaff.value = s
  isDetailModalOpen.value = true
}

// Sinkronisasi Guru ke User Management
const syncStaffToUserManagement = (staff: StaffItem) => {
  const username = staff.email || staff.nip
  // Cek apakah akun sudah ada
  const existingUser = systemStore.users.value.find(u => u.username === username)
  if (!existingUser) {
    systemStore.addUser(staff.name, username, 'Guru')
    systemStore.addLog('Administrator', 'Super Admin', `membuat akun pengguna portal untuk ${staff.name}`, 'Pengguna')
  }

  // Tandai di profil guru
  const target = staffList.value.find(s => s.id === staff.id)
  if (target) {
    target.isUserSynced = true
  }
  if (viewingStaff.value && viewingStaff.value.id === staff.id) {
    viewingStaff.value.isUserSynced = true
  }

  triggerToast(`Akun portal untuk ${staff.name} berhasil dibuat di Manajemen Pengguna.`)
}

// Batch Sync Semua Guru ke User Management
const syncAllToUserManagement = () => {
  let count = 0
  staffList.value.forEach((staff) => {
    if (!staff.isUserSynced) {
      const username = staff.email || staff.nip
      const existing = systemStore.users.value.find(u => u.username === username)
      if (!existing) {
        systemStore.addUser(staff.name, username, 'Guru')
      }
      staff.isUserSynced = true
      count++
    }
  })

  if (count > 0) {
    systemStore.addLog('Administrator', 'Super Admin', `sinkronisasi massal ${count} akun guru ke Manajemen Pengguna`, 'Pengguna')
    triggerToast(`${count} akun guru berhasil disinkronkan ke Manajemen Pengguna.`)
  } else {
    triggerToast('Seluruh data guru sudah terhubung dengan Manajemen Pengguna.')
  }
}

// Simpan Data Guru (Tambah / Edit)
const handleSaveStaff = async (data: Omit<StaffItem, 'id'> & { id?: string; syncUser?: boolean }) => {
  let targetStaff: StaffItem
  if (editingStaff.value) {
    const idx = staffList.value.findIndex(item => item.id === editingStaff.value?.id)
    if (idx !== -1) {
      const updated: StaffItem = { ...data, id: editingStaff.value.id }
      staffList.value[idx] = updated
      syncAttendanceFromStaff(updated)
      targetStaff = updated

      if (data.syncUser) {
        syncStaffToUserManagement(updated)
      }
      triggerToast(`Data guru ${data.name} berhasil diperbarui.`)
    } else {
      return
    }
  } else {
    const newItem: StaffItem = {
      id: `T-${Date.now()}`,
      ...data
    }
    staffList.value.unshift(newItem)
    syncAttendanceFromStaff(newItem)
    targetStaff = newItem

    if (data.syncUser) {
      syncStaffToUserManagement(newItem)
    }
    triggerToast(`Data guru baru ${data.name} berhasil ditambahkan.`)
  }
  isModalOpen.value = false

  // Simpan langsung ke tabel Supabase teachers
  const dbRes = await saveStaffToDb(targetStaff)
  if (!dbRes.success) {
    triggerToast(`Tersimpan lokal. Status database: ${dbRes.error || 'Perlu migrasi Supabase'}`)
  }
}

// Impor Massal dari Berkas Excel / CSV
const handleBatchImported = async (items: StaffItem[], syncUsers: boolean) => {
  triggerToast(`Mengimpor ${items.length} data guru ke database...`)

  // Sinkronisasi user management jika diminta
  // Kirim langsung ke Supabase — staffList diisi ulang dari DB setelah selesai
  const dbRes = await batchImportTeachersToDb(items)

  if (dbRes.success) {
    const importedCount = (dbRes as any).count || items.length
    const failedCount = (dbRes as any).failed || 0
    const importedItems = (dbRes as any).items || items

    if (syncUsers) {
      const accountRes = await syncTeacherAccounts(importedItems)
      if (!accountRes.success) {
        triggerToast(`${importedCount} guru tersimpan, tetapi akun gagal disinkronkan: ${accountRes.error}`)
        return
      }

      accountRes.accounts.forEach((account) => {
        const appliesToActiveGrade = account.scope === 'yayasan' || account.scope === grade.value.toLowerCase()
        const exists = systemStore.users.value.some(user => user.username === account.email)
        if (appliesToActiveGrade && !exists) systemStore.addUser(account.name, account.email, 'Guru')
      })
      systemStore.addLog('Administrator', 'Super Admin', `mengimpor ${importedCount} guru dan menyinkronkan ${accountRes.accounts.length} akun login`, 'Kepegawaian')
      triggerToast(`${importedCount} guru tersimpan, ${accountRes.accounts.length} akun disinkronkan${failedCount ? `, ${failedCount} baris gagal` : ''}.`)
    } else {
      triggerToast(`${importedCount} guru berhasil diimpor${failedCount ? `, ${failedCount} baris gagal` : ''}.`)
    }
    // Sinkronisasi attendance dari staffList yang sudah diisi DB
    staffList.value.forEach(s => syncAttendanceFromStaff(s))
  } else {
    triggerToast(`Import gagal: ${dbRes.error || 'Periksa koneksi Supabase & RLS'}`)
  }
}

// Hapus Guru
const confirmDelete = (s: StaffItem) => {
  deletingStaff.value = s
}

const executeDelete = async () => {
  if (deletingStaff.value) {
    const id = deletingStaff.value.id
    const nip = deletingStaff.value.nip
    const name = deletingStaff.value.name
    staffList.value = staffList.value.filter(s => s.id !== id)
    teachersStore.attendanceList.value = teachersStore.attendanceList.value.filter(a => a.id !== id)
    triggerToast(`Data ${name} berhasil dihapus.`)
    deletingStaff.value = null

    // Hapus dari database Supabase
    await deleteStaffFromDb(id, nip)
  }
}

// Ekspor seluruh data induk ke CSV
const exportStaffCsv = () => {
  const headers = [
    'No',
    'Nama Lengkap',
    'NIK',
    'No KK',
    'NUPTK',
    'NIP',
    'No Telp/WA',
    'Alamat Email',
    'Tempat Lahir',
    'Tgl Lahir',
    'Alamat',
    'Kelurahan',
    'Kecamatan',
    'Kab/Kota',
    'Pendidikan Terakhir',
    'Unit Sekolah',
    'Jabatan & Tugas',
    'Mapel Utama',
    'Status Kepegawaian',
    'RFID UID',
    'Status Akun Portal'
  ]

  const rows = filteredStaff.value.map((s, i) => [
    i + 1,
    `"${s.name}"`,
    `"${s.nik || '-'}"`,
    `"${s.noKk || '-'}"`,
    `"${s.nuptk || '-'}"`,
    `"${s.nip}"`,
    `"${s.phone || '-'}"`,
    `"${s.email || '-'}"`,
    `"${s.birthPlace || '-'}"`,
    `"${s.birthDate || '-'}"`,
    `"${s.address || '-'}"`,
    `"${s.kelurahan || '-'}"`,
    `"${s.kecamatan || '-'}"`,
    `"${s.kabKota || '-'}"`,
    `"${s.education || '-'}"`,
    s.unit,
    `"${s.role}"`,
    `"${s.subject || '-'}"`,
    s.status,
    `"${s.rfidUid}"`,
    s.isUserSynced ? 'Terhubung' : 'Belum'
  ])

  const csvContent = '\uFEFF' + headers.join(',') + '\r\n' + rows.map(r => r.join(',')).join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `data-induk-guru-staff-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  triggerToast(`${filteredStaff.value.length} data guru diekspor lengkap ke CSV.`)
}

// Header & Navigation States
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
  const dest = getAdminDestination(title)
  if (dest) return navigateTo(dest)
  triggerToast(`${title} — modul demo`)
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals()
      isModalOpen.value = false
      isDetailModalOpen.value = false
      isUploadModalOpen.value = false
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

      <AdminV2Breadcrumb
        :items="[
          { label: 'Portal Admin', to: '/adminV2' },
          { label: 'Kepegawaian', to: '/adminV2/guru' },
          { label: 'Data Induk Guru & Staff' }
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
      <!-- PAGE HEAD & AKSI LENGKAP -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-1">
            Portal Administrasi · Kepegawaian
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828] flex items-center gap-2.5 flex-wrap">
            <span>Data Induk Guru &amp; Staff</span>
          </h1>
        </div>

        <!-- Tombol Aksi Lengkap -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Tombol Sinkron Semua ke User Management -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] text-xs font-bold rounded-xl border border-[#BBF7D0] shadow-2xs transition cursor-pointer"
            title="Sinkronkan seluruh akun guru ke Manajemen Pengguna"
            @click="syncAllToUserManagement"
          >
            <AdminV2Icon name="check" :size="15" />
            <span>Sinkron ke Pengguna</span>
          </button>

          <!-- Tombol Sinkron ke Database Supabase -->
          <!-- <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border shadow-2xs transition cursor-pointer disabled:opacity-50"
            :class="isDbConnected ? 'bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]' : 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border-[#FCD34D]'"
            :disabled="isSyncingDb"
            title="Kirim dan simpan seluruh data guru ke tabel teachers Supabase"
            @click="syncAllToDatabase"
          >
            <AdminV2Icon name="database" :size="15" />
            <span>{{ isSyncingDb ? 'Menyimpan...' : 'Simpan ke Supabase' }}</span>
          </button> -->

          <!-- Tombol Unggah / Import Excel / CSV -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F3F5F9] text-[#344054] text-xs font-bold rounded-xl border border-[#D0D5DD] shadow-2xs transition cursor-pointer"
            @click="isUploadModalOpen = true"
          >
            <AdminV2Icon name="dl" :size="15" class="rotate-180 text-[#667085]" />
            <span>Unggah Excel/CSV</span>
          </button>

          <!-- Tombol Ekspor CSV -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F3F5F9] text-[#344054] text-xs font-bold rounded-xl border border-[#D0D5DD] shadow-2xs transition cursor-pointer"
            @click="exportStaffCsv"
          >
            <AdminV2Icon name="dl" :size="15" class="text-[#667085]" />
            <span>Ekspor Data</span>
          </button>

          <!-- Tombol Tambah Guru Baru -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B5FD9] hover:bg-[#154db0] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition cursor-pointer"
            @click="openAddModal"
          >
            <AdminV2Icon name="plus" :size="16" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      <!-- 4 KPI SUMMARY CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
              <AdminV2Icon name="users" :size="20" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F3F5F9] text-[#344054] border border-[#E7EBF2]">
              Yayasan
            </span>
          </div>
          <div class="text-3xl font-extrabold text-[#101828] tracking-tight mt-3 mb-1">
            {{ staffList.length }} Orang
          </div>
          <div class="text-xs font-medium text-[#667085]">
            Total Guru &amp; Tenaga Kependidikan
          </div>
        </div>

        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <AdminV2Icon name="book" :size="20" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
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

        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <AdminV2Icon name="layers" :size="20" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
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

        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <AdminV2Icon name="check" :size="20" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
              User Synced
            </span>
          </div>
          <div class="text-3xl font-extrabold text-[#101828] tracking-tight mt-3 mb-1">
            {{ staffList.filter(s => s.isUserSynced).length }} / {{ staffList.length }}
          </div>
          <div class="text-xs font-medium text-[#667085]">
            Akun login terhubung ke User Management
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 shadow-xs">
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex-1 min-w-[240px] focus-within:bg-white focus-within:border-[#1B5FD9] focus-within:ring-4 focus-within:ring-[#1B5FD9]/10 transition-all">
            <AdminV2Icon name="search" :size="16" class="text-[#94A3B8] shrink-0" />
            <input
              v-model="searchQuery"
              placeholder="Cari nama guru, NIP, NIK, atau email..."
              class="bg-transparent text-xs sm:text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none w-full font-medium"
            />
          </label>

          <select
            v-model="selectedUnit"
            class="px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#334155] focus:bg-white focus:outline-none focus:border-[#1B5FD9] transition-all cursor-pointer min-w-[160px]"
          >
            <option value="all">Semua Unit</option>
            <option value="SMP">SMP IT BCA</option>
            <option value="SMK">SMK IT Attaqwa 9</option>
            <option value="Yayasan">Yayasan / TU</option>
          </select>

          <select
            v-model="selectedStatus"
            class="px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#334155] focus:bg-white focus:outline-none focus:border-[#1B5FD9] transition-all cursor-pointer min-w-[150px]"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>

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

      <!-- TABEL DATA INDUK GURU (Modular Component) -->
      <GuruV2Table
        :staff-list="filteredStaff"
        @view="openDetailModal"
        @edit="openEditModal"
        @delete="confirmDelete"
        @sync-user="syncStaffToUserManagement"
        @add="openAddModal"
        @upload="isUploadModalOpen = true"
      />
    </main>

    <!-- MODAL FORM TAMBAH / UBAH GURU -->
    <GuruV2Modal
      :is-open="isModalOpen"
      :editing-staff="editingStaff"
      :current-grade="grade"
      @close="isModalOpen = false"
      @save="handleSaveStaff"
    />

    <!-- MODAL DOSSIER DETAIL GURU LENGKAP -->
    <GuruV2DetailModal
      :is-open="isDetailModalOpen"
      :staff="viewingStaff"
      @close="isDetailModalOpen = false"
      @edit="(s) => { isDetailModalOpen = false; openEditModal(s) }"
      @sync-user="syncStaffToUserManagement"
    />

    <!-- MODAL UNGGAH DATA GURU & TEMPLATE EXCEL -->
    <GuruV2UploadModal
      :is-open="isUploadModalOpen"
      :current-grade="grade"
      @close="isUploadModalOpen = false"
      @imported="handleBatchImported"
    />

    <!-- MODAL KONFIRMASI HAPUS GURU -->
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

    <!-- MOBILE NAVIGATION & POPOVERS -->
    <AdminV2BottomNav
      :role="role"
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @nav-click="handleSelectModule"
    />

    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :role="role"
      :groups="GROUPS"
      :jenjang="jenjang"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
    />

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
