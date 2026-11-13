<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import KelasDetailOverview from '~/components/adminV2/kelas/detail/KelasDetailOverview.vue'
import KelasDetailSiswa from '~/components/adminV2/kelas/detail/KelasDetailSiswa.vue'
import KelasDetailAbsensi from '~/components/adminV2/kelas/detail/KelasDetailAbsensi.vue'
import KelasDetailJadwal from '~/components/adminV2/kelas/detail/KelasDetailJadwal.vue'
import KelasDetailNilai from '~/components/adminV2/kelas/detail/KelasDetailNilai.vue'
import KelasDetailUjian from '~/components/adminV2/kelas/detail/KelasDetailUjian.vue'
import KelasV2MoveStudentModal from '~/components/adminV2/kelas/KelasV2MoveStudentModal.vue'
import KelasDetailTambahSiswaModal from '~/components/adminV2/kelas/KelasDetailTambahSiswaModal.vue'
import KelasDetailImportModal from '~/components/adminV2/kelas/detail/KelasDetailImportModal.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import {
  generateMockGrades,
  generateMockExams,
  type ClassRombel,
  type ClassStudentItem,
  type ClassGradeItem,
  type ClassExamItem
} from '~/components/adminV2/kelas/kelasV2Data'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const cbtData = useAdminCbtData()
const supabase = useSupabaseClient()

const classIdParam = computed(() => {
  return decodeURIComponent(String(route.params.id || ''))
})

const availableClasses = computed<ClassRombel[]>(() => cbtData.classes.value.map(item => {
  return {
    id: item.id,
    name: item.name,
    level: item.grade,
    gradeLevel: (item.name.split(/[\s.-]/)[0] || (item.grade === 'SMP' ? 'VII' : 'X')) as ClassRombel['gradeLevel'],
    major: item.major,
    room: item.room,
    capacity: 36,
    studentsCount: item.studentCount,
    boys: item.boysCount,
    girls: item.girlsCount,
    teacher: item.teacher || 'Belum ditetapkan',
    teacherNip: item.teacherNip,
    teacherPhone: '',
    teacherEmail: '',
    attendance: 0,
    average: 0,
    status: 'Aktif'
  }
}))

const emptyClass: ClassRombel = {
  id: '', name: '', level: 'SMK', gradeLevel: 'X', major: '', room: '', capacity: 36,
  studentsCount: 0, boys: 0, girls: 0, teacher: 'Belum ditetapkan', teacherNip: '',
  teacherPhone: '', teacherEmail: '', attendance: 0, average: 0, status: 'Aktif'
}

const currentClass = computed<ClassRombel>(() => {
  const param = classIdParam.value.toLowerCase()
  return availableClasses.value.find(item => item.name.toLowerCase() === param || item.id.toLowerCase() === param) ?? emptyClass
})

const jenjang = computed<'smp' | 'smk'>(() => {
  return currentClass.value.level.toLowerCase() as 'smp' | 'smk'
})

const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')

useHead({
  title: computed(() => `Detail Rombel ${currentClass.value.name} — Manajemen Kelas — Admin Portal Darqia 9`),
  meta: [
    { name: 'description', content: `Detail rombongan belajar ${currentClass.value.name} SMK IT Attaqwa 9 & SMP IT Bina Cendekia Assalam` }
  ]
})

// Header & Modal State
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

// 6 Submenus (Sesuai docs/Admin Portal/manajemen kelas/kelasdetail.md)
export type DetailSubmenuId = 'overview' | 'siswa' | 'absensi' | 'jadwal' | 'nilai' | 'ujian'
const activeSubmenu = ref<DetailSubmenuId>('overview')

// Daftar siswa rombel: query ringan per kelas (bukan halaman listing Data Siswa), di-cache per kelas
// agar kunjungan ulang langsung tampil lalu disegarkan di latar belakang.
const rosterCache = useState<Record<string, ClassStudentItem[]>>('kelas-roster', () => ({}))
const rosterLoading = ref(false)
const rosterError = ref('')
const studentsList = computed<ClassStudentItem[]>(() => rosterCache.value[currentClass.value.id] ?? [])

const loadRoster = async (classId: string, className: string) => {
  rosterLoading.value = true
  rosterError.value = ''
  const { data, error } = await supabase
    .from('students')
    .select('id, nis, nisn, name, gender, phone, father_name, father_phone, mother_name, mother_phone, attendance_pct, rfid_cards(active)')
    .eq('class_id', classId)
    .eq('active', true)
    .order('name')
  rosterLoading.value = false
  if (error) {
    rosterError.value = 'Data siswa rombel gagal dimuat: ' + error.message
    return
  }
  rosterCache.value = {
    ...rosterCache.value,
    [classId]: (data ?? []).map((row: any) => ({
      id: row.id,
      nisn: row.nisn ?? '',
      nis: row.nis ?? '',
      name: row.name,
      gender: row.gender,
      className,
      phone: row.phone ?? '',
      parentName: row.father_name || row.mother_name || 'Belum diisi',
      parentPhone: row.father_phone || row.mother_phone || '',
      fatherName: row.father_name ?? '',
      fatherPhone: row.father_phone ?? '',
      motherName: row.mother_name ?? '',
      motherPhone: row.mother_phone ?? '',
      hasRfid: Boolean(row.rfid_cards?.some((card: any) => card.active)),
      status: 'Aktif' as const,
      attendancePct: Number(row.attendance_pct ?? 0)
    }))
  }
}
watch(() => currentClass.value.id, (id) => {
  if (id) void loadRoster(id, currentClass.value.name)
}, { immediate: true })

const gradesList = ref<ClassGradeItem[]>([])
const examsList = ref<ClassExamItem[]>([])

watch(
  [studentsList, currentClass],
  ([roster, cls]) => {
    gradesList.value = generateMockGrades(roster)
    examsList.value = generateMockExams(cls.name, cls.level)
  },
  { immediate: true }
)

const submenus = computed(() => [
  { id: 'overview' as const, label: 'Overview', icon: 'grid' },
  { id: 'siswa' as const, label: 'Data Siswa', icon: 'users', count: studentsList.value.length },
  { id: 'absensi' as const, label: 'Absensi', icon: 'clock' },
  { id: 'jadwal' as const, label: 'Jadwal Pelajaran', icon: 'cal' },
  { id: 'nilai' as const, label: 'Penilaian Siswa', icon: 'doc' },
  { id: 'ujian' as const, label: 'Jadwal Ujian', icon: 'monitor' }
])
const rbacKelas = useRbac()
const submenuTerlihat = computed(() => submenus.value.filter(s => s.id === 'overview' || rbacKelas.bisaSub('Manajemen Kelas', s.id, 'lihat')))
watchEffect(() => { if (!submenuTerlihat.value.some(s => s.id === activeSubmenu.value)) activeSubmenu.value = 'overview' })

// Modal: Tambah siswa (tanpa rombel / dari rombel lain) ke rombel ini
const isAddStudentModalOpen = ref(false)
const handleAddStudents = async (studentIds: string[]) => {
  isAddStudentModalOpen.value = false
  const { error } = await supabase.from('students').update({ class_id: currentClass.value.id }).in('id', studentIds)
  if (error) {
    triggerToast('Siswa gagal ditambahkan: ' + error.message)
    return
  }
  await Promise.all([cbtData.load(true), loadRoster(currentClass.value.id, currentClass.value.name)])
  triggerToast(`${studentIds.length} siswa ditambahkan ke rombel ${currentClass.value.name}.`)
}

// Modal 1: Move Student
const isMoveStudentModalOpen = ref(false)
const movingStudent = ref<ClassStudentItem | null>(null)

const handleOpenMoveStudent = (student: ClassStudentItem) => {
  movingStudent.value = student
  isMoveStudentModalOpen.value = true
}

const handleConfirmMoveStudent = async (studentId: string, targetClass: string, reason: string) => {
  const target = cbtData.classes.value.find(item => item.grade === currentClass.value.level && item.name === targetClass)
  isMoveStudentModalOpen.value = false
  if (!target) {
    triggerToast('Kelas tujuan tidak ditemukan.')
    return
  }
  const { error } = await supabase.from('students').update({ class_id: target.id }).eq('id', studentId)
  if (error) {
    triggerToast('Siswa gagal dipindahkan: ' + error.message)
    return
  }
  await Promise.all([cbtData.load(true), loadRoster(currentClass.value.id, currentClass.value.name)])
  triggerToast(`Peserta didik berhasil dipindahkan ke rombel ${targetClass}. (${reason})`)
}

const handleDeleteStudent = async (student: ClassStudentItem) => {
  if (!window.confirm('Nonaktifkan ' + student.name + ' dari rombel ini?')) return
  const { error } = await supabase.from('students').update({ active: false, student_status: 'Nonaktif' }).eq('id', student.id)
  if (error) {
    triggerToast('Siswa gagal dinonaktifkan: ' + error.message)
    return
  }
  await Promise.all([cbtData.load(true), loadRoster(currentClass.value.id, currentClass.value.name)])
  triggerToast(`Siswa ${student.name} dinonaktifkan dari rombel.`)
}

// Modal 3: Impor Nilai Excel
const isImportModalOpen = ref(false)
const handleImportGradesDone = (fileName: string) => {
  triggerToast(`Berkas ${fileName} berhasil diimpor ke template penilaian rombel.`)
}

// Export Student List to CSV (1:1 Versi Asli)
const exportStudentList = () => {
  const headers = ['No', 'NIS', 'NISN', 'Nama Siswa', 'Gender', 'Status']
  const rows = studentsList.value.map((s, idx) => [
    idx + 1,
    `"${s.nis}"`,
    `"${s.nisn}"`,
    `"${s.name}"`,
    s.gender === 'L' ? 'Putra' : 'Putri',
    'Aktif'
  ])

  const csvContent = '\uFEFF' + [
    `Data Siswa Rombel ${currentClass.value.name} - ${currentClass.value.level === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9'}`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `data_siswa_rombel_${currentClass.value.name.replace(/\s+/g, '_')}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  triggerToast(`Data siswa rombel ${currentClass.value.name} berhasil diekspor ke CSV.`)
}

// Global Nav
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

onMounted(async () => {
  await cbtData.load()
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals()
      isMoveStudentModalOpen.value = false
      isImportModalOpen.value = false
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
        :active-group-id="activeMegaGroup?.id || 'akademik'"
        :current-route="'akademik'"
        :is-mega-open="isMegaOpen"
        @update:jenjang="router.push('/adminV2/kelas')"
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
          { label: 'Manajemen Kelas', to: '/adminV2/kelas' },
          { label: `Rombel ${currentClass?.name || 'Detail'}` }
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
    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-4">
      <div
        v-if="(rosterLoading && !studentsList.length) || cbtData.loading.value || rosterError || cbtData.error.value"
        class="rounded-2xl border px-4 py-3 text-xs font-semibold"
        :class="rosterError || cbtData.error.value ? 'border-[#F5C6C0] bg-[#FFF8F7] text-[#B42318]' : 'border-[#C9DCFB] bg-[#F5F8FF] text-[#12459B]'"
        role="status"
      >
        {{ rosterError || cbtData.error.value || 'Memuat data rombel, wali kelas, dan siswa…' }}
      </div>

      <!-- Breadcrumb & Top Section -->
      <div class="bg-white border border-[#E7EBF2] rounded-3xl p-4 sm:p-5 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <NuxtLink
              to="/adminV2/kelas"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-[#667085] hover:text-[#1B5FD9] transition mb-2"
            >
              <AdminV2Icon name="back" :size="13" />
              <span>Kembali ke Manajemen Kelas</span>
            </NuxtLink>

            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
                Rombel {{ currentClass.name }}
              </h1>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                :class="currentClass.level === 'SMP' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#EFF4FF] text-[#1B5FD9]'"
              >
                {{ currentClass.level }} <template v-if="currentClass.major">&bull; {{ currentClass.major }}</template>
              </span>
            </div>

            <p class="text-xs text-[#667085] font-medium mt-1 flex items-center gap-2 flex-wrap">
              <span>{{ currentClass.level === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }}</span>
              <span>&bull;</span>
              <span>{{ currentClass.room }}</span>
              <span>&bull;</span>
              <span>Wali Kelas: {{ currentClass.teacher }}</span>
              <span>&bull;</span>
              <span>T.A 2026/2027</span>
            </p>
          </div>

          <!-- Top Action Buttons (Ekspor Siswa & Input Absensi) -->
          <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EFF2F7] hover:bg-[#E2E8F0] text-[#344054] transition cursor-pointer shadow-2xs flex items-center gap-1.5"
              @click="exportStudentList"
            >
              <AdminV2Icon name="dl" :size="14" />
              <span>Ekspor Siswa</span>
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
              :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#154EBC]'"
              @click="activeSubmenu = 'absensi'"
            >
              <AdminV2Icon name="clock" :size="14" />
              <span>Input Absensi Kelas</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 6 Sub-Menu Tabs Pill Bar (Sesuai kelasdetail.md) -->
      <div class="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <nav
          class="inline-flex items-center gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1.5 rounded-2xl min-w-max"
          role="tablist"
        >
          <button
            v-for="sub in submenuTerlihat"
            :key="sub.id"
            type="button"
            role="tab"
            class="inline-flex items-center gap-2 text-xs sm:text-[12.5px] px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer"
            :class="activeSubmenu === sub.id
              ? 'bg-white text-[#101828] font-bold shadow-[0_1px_4px_rgba(16,24,40,0.12)]'
              : 'text-[#667085] font-semibold hover:text-[#101828]'"
            @click="activeSubmenu = sub.id"
          >
            <AdminV2Icon
              :name="sub.icon"
              :size="14"
              :class="activeSubmenu === sub.id ? (jenjang === 'smp' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
            />
            <span>{{ sub.label }}</span>
            <span
              v-if="sub.count !== undefined"
              class="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold"
              :class="activeSubmenu === sub.id ? 'bg-[#EFF2F7] text-[#101828]' : 'bg-[#E2E8F0] text-[#475467]'"
            >
              {{ sub.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- 6 Submenu Tab Content Area -->
      <div>
        <KelasDetailOverview
          v-if="activeSubmenu === 'overview'"
          :cls="currentClass"
          :schedule="[]"
          :exams="examsList"
          :jenjang="jenjang"
        />

        <KelasDetailSiswa
          v-else-if="activeSubmenu === 'siswa'"
          :students="studentsList"
          :class-name="currentClass.name"
          :jenjang="jenjang"
          @move-student="handleOpenMoveStudent"
          @delete-student="handleDeleteStudent"
          @add-student="isAddStudentModalOpen = true"
        />

        <KelasDetailAbsensi
          v-else-if="activeSubmenu === 'absensi'"
          :students="studentsList"
          :class-name="currentClass.name"
          :jenjang="jenjang"
        />

        <KelasDetailJadwal
          v-else-if="activeSubmenu === 'jadwal'"
          :class-id="currentClass.id"
          :class-name="currentClass.name"
          :jenjang="jenjang"
        />

        <KelasDetailNilai
          v-else-if="activeSubmenu === 'nilai'"
          :grades="gradesList"
          :class-name="currentClass.name"
          :jenjang="jenjang"
          @export-grades="triggerToast('Nilai rombel diekspor ke Excel.')"
          @import-grades="isImportModalOpen = true"
          @print-leger="triggerToast('Mencetak leger nilai rombel...')"
        />

        <KelasDetailUjian
          v-else-if="activeSubmenu === 'ujian'"
          :exams="examsList"
          :class-name="currentClass.name"
          :jenjang="jenjang"
        />
      </div>
    </main>

    <!-- MODAL 1: PINDAH KELAS -->
    <KelasV2MoveStudentModal
      :open="isMoveStudentModalOpen"
      :student="movingStudent"
      :current-class="currentClass.name"
      :available-classes="availableClasses.filter(item => item.level === currentClass.level)"
      :jenjang="jenjang"
      @close="isMoveStudentModalOpen = false"
      @move="handleConfirmMoveStudent"
    />

    <KelasDetailTambahSiswaModal
      :open="isAddStudentModalOpen"
      :class-id="currentClass.id"
      :class-name="currentClass.name"
      :grade="currentClass.level"
      :jenjang="jenjang"
      @close="isAddStudentModalOpen = false"
      @add="handleAddStudents"
    />

    <!-- MODAL 3: IMPOR NILAI EXCEL -->
    <KelasDetailImportModal
      :open="isImportModalOpen"
      :class-name="currentClass.name"
      :jenjang="jenjang"
      @close="isImportModalOpen = false"
      @imported="handleImportGradesDone"
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
