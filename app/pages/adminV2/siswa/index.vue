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
import StudentDetailModal from '~/components/admin/siswa/StudentDetailModal.vue'
import StudentFormModal from '~/components/admin/siswa/StudentFormModal.vue'
import StudentImportModal from '~/components/admin/siswa/StudentImportModal.vue'
import { useAdminStudents, type StudentItem } from '~/composables/useAdminStudents'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Data Siswa — Kesiswaan — Admin Portal Darqia 9',
  meta: [
    { name: 'description', content: 'Data induk dan biodata peserta didik SMK IT Attaqwa 9 & SMP IT Bina Cendekia Assalam' }
  ]
})

/* ================= STORE & STATE ASLI 1:1 ================= */
const studentsStore = useAdminStudents()

// Sinkronisasi jenjang dengan store
const jenjang = ref<'smp' | 'smk'>(studentsStore.grade.value.toLowerCase() as 'smp' | 'smk')
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')

watch(jenjang, (newVal) => {
  studentsStore.grade.value = newVal.toUpperCase() as 'SMP' | 'SMK'
})

watch(studentsStore.grade, (newVal) => {
  jenjang.value = newVal.toLowerCase() as 'smp' | 'smk'
})

const gradeText = computed(() => {
  return studentsStore.grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'
})

const initials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const onEditFromDetail = (s: StudentItem) => {
  studentsStore.closeDetail()
  studentsStore.openEditModal(s)
}

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

// Actions
const setJenjang = (j: 'smp' | 'smk') => {
  jenjang.value = j
  triggerToast(`Beralih ke jenjang ${j.toUpperCase()} (${j === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'})`)
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
  const dest = getAdminDestination(title)
  if (dest) return navigateTo(dest)
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
      studentsStore.closeDetail()
      studentsStore.closeFormModal()
      studentsStore.closeImportModal()
      studentsStore.cancelDelete()
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
          { label: 'Data Siswa' }
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

    <!-- MAIN PAGE CONTAINER (Layout lebar 1440px konsisten V2) -->
    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-6">
      <!-- PAGE HEAD & AKSI (Persis 1:1 Flow Admin Portal) -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-1">
            Portal Administrasi · Kesiswaan
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828] flex items-center gap-2.5 flex-wrap">
            <span>Data Siswa</span>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors"
              :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#12459B]'"
            >
              {{ studentsStore.grade.value }}
            </span>
          </h1>
          <p class="text-xs sm:text-[13px] text-[#667085] mt-1 font-medium">
            Data induk peserta didik &bull; {{ gradeText }} &bull; Tahun Ajaran 2026/2027
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F3F5F9] text-[#344054] text-xs sm:text-sm font-bold rounded-xl border border-[#D0D5DD] shadow-xs hover:border-[#98A2B3] transition-all cursor-pointer"
            @click="studentsStore.openImportModal"
          >
            <AdminV2Icon name="upload" :size="16" class="text-[#667085]" />
            <span>Import CSV</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F3F5F9] text-[#344054] text-xs sm:text-sm font-bold rounded-xl border border-[#D0D5DD] shadow-xs hover:border-[#98A2B3] transition-all cursor-pointer"
            @click="studentsStore.exportStudentsCsv()"
          >
            <AdminV2Icon name="dl" :size="16" class="text-[#667085]" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B5FD9] hover:bg-[#154db0] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            @click="studentsStore.openAddModal"
          >
            <AdminV2Icon name="plus" :size="16" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      <!-- 4 KPI CARDS (Data 1:1 dari useAdminStudents stats) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <!-- 1. Total Siswa -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] hover:border-[#1B5FD9]/30 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#E8F0FE] text-[#1B5FD9] flex items-center justify-center">
              <AdminV2Icon name="users" :size="20" />
            </div>
            <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#F3F5F9] text-[#344054] border border-[#E7EBF2]">
              {{ studentsStore.grade.value }}
            </span>
          </div>
          <div class="text-3xl font-extrabold text-[#101828] tracking-tight mt-3 mb-1">
            {{ studentsStore.stats.value.total }}
          </div>
          <div class="text-xs font-medium text-[#667085]">
            Peserta Didik Terdaftar Aktif
          </div>
        </div>

        <!-- 2. Rasio Gender -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] hover:border-[#7c3aed]/30 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
              <AdminV2Icon name="user" :size="20" />
            </div>
            <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
              {{ studentsStore.stats.value.boys }}L / {{ studentsStore.stats.value.girls }}P
            </span>
          </div>
          <div class="text-2xl font-extrabold text-[#101828] tracking-tight mt-3.5 mb-1 flex items-baseline gap-2">
            <span>{{ studentsStore.stats.value.boys }} <small class="text-xs font-bold text-[#667085]">Putra</small></span>
            <span class="text-[#D0D5DD]">&bull;</span>
            <span>{{ studentsStore.stats.value.girls }} <small class="text-xs font-bold text-[#667085]">Putri</small></span>
          </div>
          <div class="text-xs font-medium text-[#667085]">
            {{ studentsStore.grade.value === 'SMP' ? 'Kelas terpisah berbasis gender' : 'Siswa putra & putri' }}
          </div>
        </div>

        <!-- 3. Rombongan Belajar -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] hover:border-[#d97706]/30 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
              <AdminV2Icon name="book" :size="20" />
            </div>
            <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
              {{ studentsStore.stats.value.totalClasses }} Rombel
            </span>
          </div>
          <div class="text-3xl font-extrabold text-[#101828] tracking-tight mt-3 mb-1">
            {{ studentsStore.stats.value.totalClasses }}
          </div>
          <div class="text-xs font-medium text-[#667085]">
            Total Kelas Rombongan Belajar
          </div>
        </div>

        <!-- 4. Kartu RFID -->
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] hover:border-[#059669]/30 transition-all">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <AdminV2Icon name="card" :size="20" />
            </div>
            <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
              {{ studentsStore.stats.value.rfidPct }}% Aktif
            </span>
          </div>
          <div class="text-3xl font-extrabold text-[#101828] tracking-tight mt-3 mb-1">
            {{ studentsStore.stats.value.rfidCount }} <span class="text-sm font-semibold text-[#667085]">/ {{ studentsStore.stats.value.total }}</span>
          </div>
          <div class="text-xs font-medium text-[#667085]">
            Siap Absensi Tap Kartu RFID
          </div>
        </div>
      </div>

      <!-- FILTER & SEARCH BAR (Persis 1:1 dengan admin portal) -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 shadow-xs">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Search Input -->
          <label class="flex items-center gap-2 px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex-1 min-w-[240px] focus-within:bg-white focus-within:border-[#1B5FD9] focus-within:ring-4 focus-within:ring-[#1B5FD9]/10 transition-all">
            <AdminV2Icon name="search" :size="16" class="text-[#94A3B8] shrink-0" />
            <input
              v-model="studentsStore.searchQuery.value"
              placeholder="Cari nama, NISN, NIK, kelas, nama ortu..."
              class="bg-transparent text-xs sm:text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none w-full font-medium"
            />
          </label>

          <!-- Filter Kelas -->
          <select
            v-model="studentsStore.selectedClass.value"
            class="px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#334155] focus:bg-white focus:outline-none focus:border-[#1B5FD9] transition-all cursor-pointer"
          >
            <option value="all">Semua Kelas</option>
            <option v-for="c in studentsStore.classOptions.value" :key="c" :value="c">{{ c }}</option>
          </select>

          <!-- Filter Jurusan (SMK Only) -->
          <select
            v-if="studentsStore.grade.value === 'SMK'"
            v-model="studentsStore.selectedMajor.value"
            class="px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#334155] focus:bg-white focus:outline-none focus:border-[#1B5FD9] transition-all cursor-pointer"
          >
            <option value="all">Semua Jurusan</option>
            <option v-for="m in studentsStore.majorOptions.value" :key="m" :value="m">{{ m }}</option>
          </select>

          <!-- Filter Gender -->
          <select
            v-model="studentsStore.selectedGender.value"
            class="px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#334155] focus:bg-white focus:outline-none focus:border-[#1B5FD9] transition-all cursor-pointer"
          >
            <option value="all">Semua Gender</option>
            <option value="L">Laki laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>

          <!-- Filter RFID -->
          <select
            v-model="studentsStore.selectedRfid.value"
            class="px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold text-[#334155] focus:bg-white focus:outline-none focus:border-[#1B5FD9] transition-all cursor-pointer"
          >
            <option value="all">Semua Status RFID</option>
            <option value="yes">Punya RFID</option>
            <option value="no">Belum Punya</option>
          </select>

          <!-- Reset Filter -->
          <button
            type="button"
            class="px-3.5 py-2 text-xs font-bold text-[#475467] hover:text-[#101828] bg-[#F2F4F7] hover:bg-[#E4E7EC] rounded-xl transition cursor-pointer"
            title="Reset filter"
            @click="studentsStore.resetFilters"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- DATA TABLE (1:1 Flow & Function dari admin/siswa) -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl shadow-xs overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F2F4F7] flex items-center justify-between bg-white">
          <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-[#101828] before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-[#1B5FD9]">
            Daftar Induk Siswa &mdash; {{ studentsStore.grade.value }}
          </h3>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E8F0FE] text-[#12459B] border border-[#D0D5DD]">
            {{ studentsStore.filteredStudents.value.length }} siswa
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-[#344054]">
            <thead class="bg-[#F8FAFC] text-xs font-bold text-[#64748B] border-b border-[#E2E8F0] uppercase tracking-wider">
              <tr>
                <th class="px-4 py-3.5 w-12 text-center">No</th>
                <th class="px-4 py-3.5">Peserta Didik</th>
                <th class="px-4 py-3.5">ID Siswa &amp; NISN</th>
                <th class="px-4 py-3.5">Kelas</th>
                <th class="px-4 py-3.5 text-center">Gender</th>
                <th class="px-4 py-3.5">Orang Tua &amp; Kontak</th>
                <th class="px-4 py-3.5 text-center">Kartu RFID</th>
                <th class="px-4 py-3.5 text-center">Status</th>
                <th class="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9]">
              <tr v-if="studentsStore.filteredStudents.value.length === 0">
                <td colspan="9" class="py-14 text-center text-[#94A3B8]">
                  <div class="text-sm font-bold mb-1 text-[#334155]">Tidak ada data siswa yang cocok</div>
                  <div class="text-xs text-[#94A3B8]">Coba sesuaikan kata kunci pencarian atau filter yang dipilih.</div>
                </td>
              </tr>
              <tr
                v-for="(s, idx) in studentsStore.filteredStudents.value"
                :key="s.id"
                class="hover:bg-[#F8FAFC] transition"
              >
                <td class="px-4 py-3.5 text-xs text-[#94A3B8] font-mono text-center">{{ idx + 1 }}</td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <span
                      class="w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                      :class="s.gender === 'L' ? 'bg-[#1B5FD9]' : 'bg-[#E11D48]'"
                    >
                      {{ initials(s.name) }}
                    </span>
                    <div>
                      <button
                        type="button"
                        class="font-bold text-[#101828] text-left hover:text-[#1B5FD9] transition block text-[13.5px] leading-tight cursor-pointer"
                        @click="studentsStore.viewDetail(s)"
                      >
                        {{ s.name }}
                      </button>
                      <div class="text-xs text-[#64748B] mt-0.5">{{ s.phone || 'Tanpa no. HP' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <div class="font-mono text-xs font-bold text-[#1B5FD9]">{{ s.id }}</div>
                  <div class="font-mono text-[11px] text-[#64748B]">NISN: {{ s.nisn }}</div>
                </td>
                <td class="px-4 py-3.5">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                    :class="s.level === 'SMP' ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]' : 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'"
                  >
                    {{ s.className }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold"
                    :class="s.gender === 'L' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-[#FFF1F2] text-[#BE123C]'"
                  >
                    {{ s.gender }}
                  </span>
                </td>
                <td class="px-4 py-3.5">
                  <div class="text-xs font-bold text-[#1E293B]">{{ s.fatherName || s.motherName || '-' }}</div>
                  <div class="text-[11px] text-[#64748B] mt-0.5">
                    <a
                      v-if="s.fatherPhone || s.motherPhone"
                      :href="`https://wa.me/62${(s.fatherPhone || s.motherPhone || '').replace(/^0/, '')}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-[#1B5FD9] hover:underline font-semibold"
                    >
                      {{ s.fatherPhone || s.motherPhone }}
                    </a>
                    <span v-else>-</span>
                  </div>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    v-if="s.hasRfid"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]"
                    title="RFID Terdaftar"
                  >
                    RFID Active
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]"
                  >
                    Belum Ada
                  </span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                    :class="s.status === 'Aktif' ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]' : 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]'"
                  >
                    {{ s.status }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      class="p-1.5 rounded-lg text-[#64748B] hover:text-[#1B5FD9] hover:bg-[#EFF6FF] transition cursor-pointer"
                      title="Detail Siswa"
                      @click="studentsStore.viewDetail(s)"
                    >
                      <AdminV2Icon name="eye" :size="15" />
                    </button>
                    <button
                      type="button"
                      class="p-1.5 rounded-lg text-[#64748B] hover:text-[#1B5FD9] hover:bg-[#EFF6FF] transition cursor-pointer"
                      title="Edit Data"
                      @click="studentsStore.openEditModal(s)"
                    >
                      <AdminV2Icon name="pencil" :size="15" />
                    </button>
                    <button
                      type="button"
                      class="p-1.5 rounded-lg text-[#64748B] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition cursor-pointer"
                      title="Hapus Siswa"
                      @click="studentsStore.confirmDelete(s)"
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
          <span><b>{{ studentsStore.filteredStudents.value.length }}</b> dari total {{ studentsStore.students.value.length }} siswa ditampilkan</span>
          <span class="font-mono text-[11px] text-[#94A3B8]">Tahun Ajaran 2026/2027</span>
        </div>
      </div>
    </main>

    <!-- MODAL DETAIL SISWA (Komponen Resmi 1:1) -->
    <StudentDetailModal
      :student="studentsStore.detailModalStudent.value"
      @close="studentsStore.closeDetail"
      @edit="onEditFromDetail"
    />

    <!-- MODAL FORM SISWA: TAMBAH / EDIT (Komponen Resmi 1:1) -->
    <StudentFormModal
      :is-open="studentsStore.isFormModalOpen.value"
      :mode="studentsStore.formModalMode.value"
      :grade="studentsStore.grade.value"
      :initial-data="studentsStore.formStudent.value"
      @close="studentsStore.closeFormModal"
      @save="studentsStore.saveStudent"
    />

    <!-- MODAL IMPORT CSV (Komponen Resmi 1:1) -->
    <StudentImportModal
      :is-open="studentsStore.isImportModalOpen.value"
      :grade="studentsStore.grade.value"
      @close="studentsStore.closeImportModal"
      @import="studentsStore.importStudents($event.students, $event.mode)"
      @download-template="studentsStore.downloadTemplate()"
    />

    <!-- MODAL KONFIRMASI HAPUS SISWA (Persis 1:1) -->
    <Teleport to="body">
      <div v-if="studentsStore.deleteConfirmStudent.value" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" @click="studentsStore.cancelDelete" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">Hapus Data Siswa?</h3>
            <button class="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer" type="button" aria-label="Tutup" @click="studentsStore.cancelDelete">
              <AdminV2Icon name="x" :size="18" />
            </button>
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">
            Apakah kamu yakin ingin menghapus data siswa <b class="text-slate-900">{{ studentsStore.deleteConfirmStudent.value.name }}</b> (NISN: {{ studentsStore.deleteConfirmStudent.value.nisn }})?
          </p>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer" type="button" @click="studentsStore.cancelDelete">Batal</button>
            <button class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer" type="button" @click="studentsStore.executeDelete">Hapus Siswa</button>
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
      :visible="isToastVisible"
      :message="toastMessage"
    />
  </div>
</template>
