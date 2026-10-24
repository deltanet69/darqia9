<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import KelasDetailSlotModal from '~/components/adminV2/kelas/detail/KelasDetailSlotModal.vue'
import KelasDetailImportModal from '~/components/adminV2/kelas/detail/KelasDetailImportModal.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import {
  INITIAL_CLASSES_SMK,
  INITIAL_CLASSES_SMP,
  generateMockSchedule,
  generateMockStudents,
  generateMockAttendance,
  generateMockGrades,
  generateMockExams,
  type ClassRombel,
  type ClassStudentItem,
  type ClassAttendanceDaily,
  type ClassGradeItem,
  type ClassExamItem
} from '~/components/adminV2/kelas/kelasV2Data'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()

const classIdParam = computed(() => {
  return decodeURIComponent(String(route.params.id || ''))
})

const allMockClasses = [...INITIAL_CLASSES_SMK, ...INITIAL_CLASSES_SMP]
const defaultClass = INITIAL_CLASSES_SMK[0]
if (!defaultClass) throw new Error('Data kelas awal tidak tersedia.')

const currentClass = computed<ClassRombel>(() => {
  const param = classIdParam.value.toLowerCase()
  const found = allMockClasses.find(c => c.name.toLowerCase() === param || c.id.toLowerCase() === param)
  return found || defaultClass
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

const studentsList = ref<ClassStudentItem[]>([])
const attendanceList = ref<ClassAttendanceDaily[]>([])
const gradesList = ref<ClassGradeItem[]>([])
const examsList = ref<ClassExamItem[]>([])

watch(
  () => currentClass.value,
  (val) => {
    if (val) {
      studentsList.value = generateMockStudents(val.name, val.level, val.studentsCount)
      attendanceList.value = generateMockAttendance(studentsList.value)
      gradesList.value = generateMockGrades(studentsList.value)
      examsList.value = generateMockExams(val.name, val.level)
    }
  },
  { immediate: true }
)

const scheduleList = computed(() => {
  return generateMockSchedule(currentClass.value.name, currentClass.value.level)
})

const submenus = computed(() => [
  { id: 'overview' as const, label: 'Overview', icon: 'grid' },
  { id: 'siswa' as const, label: 'Data Siswa', icon: 'users', count: studentsList.value.length },
  { id: 'absensi' as const, label: 'Absensi', icon: 'clock' },
  { id: 'jadwal' as const, label: 'Jadwal Pelajaran', icon: 'cal' },
  { id: 'nilai' as const, label: 'Penilaian Siswa', icon: 'doc' },
  { id: 'ujian' as const, label: 'Jadwal Ujian', icon: 'monitor' }
])

// Modal 1: Move Student
const isMoveStudentModalOpen = ref(false)
const movingStudent = ref<ClassStudentItem | null>(null)

const handleOpenMoveStudent = (student: ClassStudentItem) => {
  movingStudent.value = student
  isMoveStudentModalOpen.value = true
}

const handleConfirmMoveStudent = (studentId: string, targetClass: string, reason: string) => {
  isMoveStudentModalOpen.value = false
  triggerToast(`Peserta didik berhasil dipindahkan ke rombel ${targetClass}. (${reason})`)
}

const handleDeleteStudent = (student: ClassStudentItem) => {
  triggerToast(`Siswa ${student.name} dinonaktifkan dari rombel.`)
}

// Absensi Actions
const handleMarkAllPresent = () => {
  attendanceList.value.forEach(a => {
    a.status = 'Hadir'
    if (a.time === '-') a.time = '06:50 WIB'
  })
  triggerToast(`Seluruh siswa rombel ${currentClass.value.name} ditandai hadir lengkap.`)
}

const handleUpdateAttendanceStatus = (studentId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa') => {
  const item = attendanceList.value.find(a => a.studentId === studentId)
  if (item) {
    item.status = status
    if (status !== 'Hadir') item.time = '-'
    triggerToast(`Status absensi ${item.name} diubah menjadi ${status}.`)
  }
}

// Jadwal Timetable Actions
const handleMarkSessionComplete = (sessionId: string) => {
  const item = scheduleList.value.find(s => s.id === sessionId)
  if (item) {
    item.classAttendanceDone = true
    item.guruPresent = true
    triggerToast(`Sesi ${item.subject} terkonfirmasi siswa hadir lengkap.`)
  }
}

// Modal 2: Set Alpa Per Session
const isSlotModalOpen = ref(false)
const selectedSlotForModal = ref<any>(null)

const handleFlagStudentSkip = (sessionId: string) => {
  const item = scheduleList.value.find(s => s.id === sessionId)
  if (item) {
    selectedSlotForModal.value = item
    isSlotModalOpen.value = true
  }
}

const handleSubmitSlotAttendance = (result: { sessionId: string; alpaList: string[]; izinList: string[]; sakitList: string[]; hadirCount: number }) => {
  const item = scheduleList.value.find(s => s.id === result.sessionId)
  if (item) {
    item.alpaStudents = result.alpaList
    item.classAttendanceDone = true
    if (result.alpaList.length > 0) {
      triggerToast(`Presensi tersimpan: ${result.alpaList.length} siswa alpa pada sesi ${item.subject}.`)
    } else {
      triggerToast(`Presensi tersimpan: seluruh siswa hadir pada sesi ${item.subject}.`)
    }
  }
  isSlotModalOpen.value = false
}

// Modal 3: Impor Nilai Excel
const isImportModalOpen = ref(false)
const handleImportGradesDone = (fileName: string) => {
  triggerToast(`Berkas ${fileName} berhasil diimpor ke template penilaian rombel.`)
}

// Export Student List to CSV (1:1 Versi Asli)
const exportStudentList = () => {
  const headers = ['No', 'NISN', 'Nama Siswa', 'Gender', 'Presensi (%)', 'Nilai', 'Status']
  const scores = new Map(gradesList.value.map(grade => [grade.studentId, grade.finalScore]))
  const rows = studentsList.value.map((s, idx) => [
    idx + 1,
    `"${s.nisn}"`,
    `"${s.name}"`,
    s.gender === 'L' ? 'Putra' : 'Putri',
    s.attendancePct,
    scores.get(s.id) ?? '-',
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

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals()
      isMoveStudentModalOpen.value = false
      isSlotModalOpen.value = false
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
            v-for="sub in submenus"
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
          :schedule="scheduleList"
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
          @add-student="triggerToast('Formulir penambahan siswa baru siap.')"
        />

        <KelasDetailAbsensi
          v-else-if="activeSubmenu === 'absensi'"
          :attendance-list="attendanceList"
          :class-name="currentClass.name"
          :jenjang="jenjang"
          @mark-all-present="handleMarkAllPresent"
          @update-status="handleUpdateAttendanceStatus"
        />

        <KelasDetailJadwal
          v-else-if="activeSubmenu === 'jadwal'"
          :schedule="scheduleList"
          :class-name="currentClass.name"
          :jenjang="jenjang"
          @mark-session-complete="handleMarkSessionComplete"
          @flag-student-skip="handleFlagStudentSkip"
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
      :available-classes="allMockClasses"
      :jenjang="jenjang"
      @close="isMoveStudentModalOpen = false"
      @move="handleConfirmMoveStudent"
    />

    <!-- MODAL 2: SET ALPA PER SESI KBM -->
    <KelasDetailSlotModal
      :open="isSlotModalOpen"
      :session="selectedSlotForModal"
      :students="studentsList"
      :current-alpa-list="selectedSlotForModal?.alpaStudents || []"
      @close="isSlotModalOpen = false"
      @submit="handleSubmitSlotAttendance"
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
