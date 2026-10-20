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
import MapelV2Modal, { type SubjectItem } from '~/components/adminV2/mapel/MapelV2Modal.vue'
import { GROUPS, type GroupItem } from '~/components/adminV2/adminV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Master Mata Pelajaran — Admin Portal Darqia 9',
  meta: [
    { name: 'description', content: 'Daftar kurikulum mata pelajaran, bobot jam tatap muka, dan standar KKM SMK IT Attaqwa 9 & SMP IT Bina Cendekia Assalam' }
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

// Master Subjects Data (Identik 1:1 Versi Asli admin/mapel/index.vue)
const subjects = ref<SubjectItem[]>([
  // SMP Subjects
  { id: 'S-01', code: 'SMP-PAI', name: 'Pendidikan Agama Islam & Budi Pekerti', category: 'Keagamaan', kkm: 75, hoursPerWeek: 4, coordinator: 'Ust. H. Ahmad Fauzi, S.Pd.I', grade: 'SMP', status: 'Aktif' },
  { id: 'S-02', code: 'SMP-TFZ', name: 'Tahfidz & Tahsin Al-Qur\'an', category: 'Keagamaan', kkm: 80, hoursPerWeek: 3, coordinator: 'Ust. M. Rizky, Lc', grade: 'SMP', status: 'Aktif' },
  { id: 'S-03', code: 'SMP-BIN', name: 'Bahasa Indonesia', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Rina Kurniawati, S.Pd', grade: 'SMP', status: 'Aktif' },
  { id: 'S-04', code: 'SMP-MAT', name: 'Matematika', category: 'Umum', kkm: 75, hoursPerWeek: 5, coordinator: 'Aisyah Putri, M.Pd', grade: 'SMP', status: 'Aktif' },
  { id: 'S-05', code: 'SMP-IPA', name: 'Ilmu Pengetahuan Alam (IPA Terpadu)', category: 'Umum', kkm: 75, hoursPerWeek: 5, coordinator: 'Budi Santoso, S.Si', grade: 'SMP', status: 'Aktif' },
  { id: 'S-06', code: 'SMP-IPS', name: 'Ilmu Pengetahuan Sosial (IPS Terpadu)', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Dra. Hj. Maryam, M.Pd', grade: 'SMP', status: 'Aktif' },
  { id: 'S-07', code: 'SMP-BIG', name: 'Bahasa Inggris', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Farhan Maulana, S.Pd', grade: 'SMP', status: 'Aktif' },
  { id: 'S-08', code: 'SMP-INF', name: 'Informatika & Literasi Digital', category: 'Muatan Lokal', kkm: 75, hoursPerWeek: 2, coordinator: 'Dedi Prasetyo, S.Kom', grade: 'SMP', status: 'Aktif' },

  // SMK Subjects
  { id: 'S-09', code: 'SMK-PAI', name: 'Pendidikan Agama Islam & Budi Pekerti', category: 'Keagamaan', kkm: 75, hoursPerWeek: 3, coordinator: 'Ust. H. Ahmad Fauzi, S.Pd.I', grade: 'SMK', status: 'Aktif' },
  { id: 'S-10', code: 'SMK-BIN', name: 'Bahasa Indonesia', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Rina Kurniawati, S.Pd', grade: 'SMK', status: 'Aktif' },
  { id: 'S-11', code: 'SMK-MAT', name: 'Matematika Terapan', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Aisyah Putri, M.Pd', grade: 'SMK', status: 'Aktif' },
  { id: 'S-12', code: 'SMK-PBO', name: 'Pemrograman Berorientasi Objek (PBO)', category: 'Kejuruan', kkm: 78, hoursPerWeek: 6, coordinator: 'Hendra Gunawan, M.Kom', grade: 'SMK', status: 'Aktif' },
  { id: 'S-13', code: 'SMK-BD', name: 'Basis Data & SQL Lanjutan', category: 'Kejuruan', kkm: 78, hoursPerWeek: 4, coordinator: 'Siti Rahmawati, S.Kom', grade: 'SMK', status: 'Aktif' },
  { id: 'S-14', code: 'SMK-AIJ', name: 'Administrasi Infrastruktur Jaringan (AIJ)', category: 'Kejuruan', kkm: 78, hoursPerWeek: 6, coordinator: 'Fajar Nugraha, S.T', grade: 'SMK', status: 'Aktif' },
  { id: 'S-15', code: 'SMK-PKK', name: 'Produk Kreatif & Kewirausahaan (PKK)', category: 'Kejuruan', kkm: 75, hoursPerWeek: 5, coordinator: 'Irwan Setiawan, S.E', grade: 'SMK', status: 'Aktif' }
])

const searchQuery = ref('')
const selectedCategory = ref('all')
const isModalOpen = ref(false)

const filteredSubjects = computed(() => {
  return subjects.value.filter(s => {
    if (s.grade !== grade.value) return false
    if (selectedCategory.value !== 'all' && s.category !== selectedCategory.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.coordinator.toLowerCase().includes(q)
    }
    return true
  })
})

const totalHours = computed(() => {
  return filteredSubjects.value.reduce((acc, curr) => acc + curr.hoursPerWeek, 0)
})

// Export CSV (1:1 Versi Asli)
const exportCsv = () => {
  const headers = ['No', 'Kode Mapel', 'Nama Mata Pelajaran', 'Kategori', 'KKM', 'Beban Jam/Minggu', 'Koordinator Guru', 'Jenjang', 'Status']
  const rows = filteredSubjects.value.map((s, i) => [
    i + 1,
    `"${s.code}"`,
    `"${s.name}"`,
    `"${s.category}"`,
    s.kkm,
    s.hoursPerWeek,
    `"${s.coordinator}"`,
    s.grade,
    s.status
  ])
  const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `master-mapel-${grade.value.toLowerCase()}-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  triggerToast(`Master mapel ${grade.value} berhasil diekspor ke CSV.`)
}

// Tambah Mapel Handler
const handleSaveSubject = (data: Omit<SubjectItem, 'id' | 'grade' | 'status'>) => {
  subjects.value.push({
    id: `S-${Date.now()}`,
    code: data.code,
    name: data.name,
    category: data.category,
    kkm: data.kkm,
    hoursPerWeek: data.hoursPerWeek,
    coordinator: data.coordinator,
    grade: grade.value,
    status: 'Aktif'
  })
  isModalOpen.value = false
  triggerToast(`Mata pelajaran ${data.name} (${data.code}) berhasil ditambahkan.`)
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
  if (t.includes('siswa') && !t.includes('kelas') && !t.includes('raport') && !t.includes('rapor')) return router.push('/adminV2/siswa')
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
          { label: 'Master Mata Pelajaran' }
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
            <span class="text-xs font-semibold text-[#667085]">Struktur Kurikulum Nasional</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
            Master Mata Pelajaran
          </h1>
          <p class="text-xs sm:text-sm text-[#667085] mt-0.5 font-medium">
            Daftar mata pelajaran, bobot jam tatap muka, dan standar KKM
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl font-bold text-xs text-[#344054] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-2xs flex items-center gap-2 transition cursor-pointer"
            @click="exportCsv"
          >
            <AdminV2Icon name="dl" :size="14" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#1B5FD9] hover:bg-[#154EBC] shadow-xs flex items-center gap-2 transition cursor-pointer"
            @click="isModalOpen = true"
          >
            <AdminV2Icon name="plus" :size="14" />
            <span>Tambah Mapel</span>
          </button>
        </div>
      </div>

      <!-- 4 KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
          <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Total Mata Pelajaran</span>
          <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#101828] block mt-1.5">{{ filteredSubjects.length }} Mapel</b>
          <span class="text-xs text-[#667085] block mt-1">Kurikulum Aktif {{ grade }}</span>
        </div>

        <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
          <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Total Beban Tatap Muka</span>
          <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#1B5FD9] block mt-1.5">{{ totalHours }} Jam/Mg</b>
          <span class="text-xs text-[#667085] block mt-1">Alokasi beban guru</span>
        </div>

        <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
          <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Standar KKM Rata-rata</span>
          <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#101828] block mt-1.5">75 - 78</b>
          <span class="text-xs text-[#667085] block mt-1">Kriteria Ketuntasan Minimal</span>
        </div>

        <div class="p-4 sm:p-5 rounded-3xl bg-white border border-[#E7EBF2] shadow-xs">
          <span class="text-[10.5px] font-extrabold uppercase tracking-wider text-[#98A2B3] block">Status Kurikulum</span>
          <b class="text-2xl sm:text-3xl font-mono font-extrabold text-[#059669] block mt-1.5">Terverifikasi</b>
          <span class="text-xs text-[#667085] block mt-1">Disetujui Waka Kurikulum</span>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white border border-[#E7EBF2] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kode mapel, nama mata pelajaran, atau koordinator..."
            class="w-full pl-9 pr-4 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1B5FD9] font-medium transition-colors text-[#101828] placeholder:text-[#98A2B3]"
          />
          <AdminV2Icon name="search" :size="15" class="absolute left-3 top-3 text-[#98A2B3]" />
        </div>

        <select
          v-model="selectedCategory"
          class="w-full sm:w-56 px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#1B5FD9] font-bold text-[#344054] cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          <option value="Umum">Umum (Wajib)</option>
          <option value="Kejuruan">Kejuruan (Khusus SMK)</option>
          <option value="Keagamaan">Keagamaan / Al-Qur'an</option>
          <option value="Muatan Lokal">Muatan Lokal</option>
        </select>
      </div>

      <!-- Subjects Table -->
      <div class="bg-white border border-[#E7EBF2] rounded-3xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#F8FAFC] text-[#475467] font-bold uppercase tracking-wider text-[10.5px] border-b border-[#E7EBF2]">
              <tr>
                <th class="py-3.5 px-4 font-mono">Kode</th>
                <th class="py-3.5 px-4">Mata Pelajaran</th>
                <th class="py-3.5 px-4">Kategori</th>
                <th class="py-3.5 px-4 text-center">KKM</th>
                <th class="py-3.5 px-4 text-center">Beban Jam</th>
                <th class="py-3.5 px-4">Koordinator Pengampu</th>
                <th class="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9] font-medium text-[#344054]">
              <tr
                v-for="s in filteredSubjects"
                :key="s.id"
                class="hover:bg-[#F8FAFC] transition-colors"
              >
                <td class="py-3.5 px-4 font-mono font-bold text-[#1B5FD9]">{{ s.code }}</td>
                <td class="py-3.5 px-4 font-extrabold text-[#101828] text-[13px]">{{ s.name }}</td>
                <td class="py-3.5 px-4">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
                    :class="{
                      'bg-[#EFF4FF] text-[#1B5FD9] border-[#B2CCFF]': s.category === 'Umum',
                      'bg-[#F4F3FF] text-[#5925DC] border-[#D9D6FE]': s.category === 'Kejuruan',
                      'bg-[#E7F6ED] text-[#166534] border-[#A6E9C5]': s.category === 'Keagamaan',
                      'bg-[#FEF6EE] text-[#B93815] border-[#F9DBAF]': s.category === 'Muatan Lokal'
                    }"
                  >
                    {{ s.category }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center font-mono font-bold text-[#101828]">{{ s.kkm }}</td>
                <td class="py-3.5 px-4 text-center font-mono text-[#667085]">{{ s.hoursPerWeek }} Jam / mg</td>
                <td class="py-3.5 px-4 font-semibold text-[#344054]">{{ s.coordinator }}</td>
                <td class="py-3.5 px-4 text-right">
                  <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#059669]">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    {{ s.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredSubjects.length === 0">
                <td colspan="7" class="py-12 text-center text-[#98A2B3] font-medium">
                  Tidak ada data mata pelajaran ditemukan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- MODAL TAMBAH MAPEL -->
    <MapelV2Modal
      :open="isModalOpen"
      :grade="grade"
      :school-name="schoolName"
      @close="isModalOpen = false"
      @save="handleSaveSubject"
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
