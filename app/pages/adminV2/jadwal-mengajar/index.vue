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
import JadwalV2GradeTimetable from '~/components/adminV2/jadwal-mengajar/JadwalV2GradeTimetable.vue'
import JadwalV2PersonalView from '~/components/adminV2/jadwal-mengajar/JadwalV2PersonalView.vue'
import JadwalV2CreateModal from '~/components/adminV2/jadwal-mengajar/JadwalV2CreateModal.vue'
import JadwalV2SessionSheet from '~/components/adminV2/jadwal-mengajar/JadwalV2SessionSheet.vue'
import JadwalV2LiveBar from '~/components/adminV2/jadwal-mengajar/JadwalV2LiveBar.vue'
import JadwalV2DemoPanel from '~/components/adminV2/jadwal-mengajar/JadwalV2DemoPanel.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import {
  PERSONAS,
  KELAS,
  genGrid,
  type Jenjang,
  type RoleKey,
  type DayIndex,
  type LessonSession
} from '~/components/adminV2/jadwal-mengajar/jadwalV2Data'

definePageMeta({
  layout: false
})

useHead({
  title: 'Jadwal Mengajar — Kepegawaian — Admin Portal Darqia 9',
  meta: [
    {
      name: 'description',
      content: 'Pengelolaan jadwal mengajar mingguan Senin-Jumat, absensi kehadiran guru dan sesi kelas siswa SMK IT Attaqwa 9 & SMP IT Bina Cendekia Assalam'
    }
  ]
})

const router = useRouter()

/* ================= STATE GLOBAL ================= */
const jenjang = ref<Jenjang>('smk')
const role = ref<RoleKey>('operator')
const activeSubmenu = ref<'grade' | 'saya'>('grade')

// Navigasi & Popover Shell
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

// Simulasi Waktu (Default: Jumat, 08:24)
const simDayIdx = ref<DayIndex>(4)
const simMin = ref<number>(8 * 60 + 24)

// State Kelas Terpilih
const selectedClass = ref<Record<Jenjang, string>>({
  smk: 'XII TKJ 1',
  smp: 'VII-A'
})

// State Sesi Mengajar & Jadwal Tambahan
const extraSchedules = ref<Array<{
  level: Jenjang
  kelas: string
  di: DayIndex
  si: number
  mapel: string
  guru: string
  ket?: string
}>>([])

const sessions = ref<Record<string, LessonSession>>({})
const liveStartTime = ref<number | null>(null)

// Modal & Sheet States
const isCreateModalOpen = ref(false)
const sessionSheetKey = ref<string | null>(null)

// Persona info dari role & jenjang aktif
const currentPersona = computed(() => {
  return PERSONAS[role.value][jenjang.value]
})

// Sesi Aktif untuk LiveBar
const activeLiveSession = computed(() => {
  const activeKey = Object.keys(sessions.value).find(k => !sessions.value[k].done)
  if (!activeKey || !liveStartTime.value) return null
  const [level, kelas, diStr, siStr] = activeKey.split('|')
  const grid = genGrid(level as Jenjang, kelas, extraSchedules.value)
  const cell = grid[+diStr as DayIndex][+siStr]
  const sess = sessions.value[activeKey]

  return {
    key: activeKey,
    mapel: cell.mapel,
    kelas,
    hadir: sess.hadir,
    alpaCount: sess.alpa.length,
    startTime: liveStartTime.value
  }
})

// Format Tanggal Hari Ini
const formattedTodayDate = computed(() => {
  const d = new Date()
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
})

/* ================= EVENT HANDLERS ================= */
const closeAllPopovers = () => {
  isMegaOpen.value = false
  isSearchOpen.value = false
  isNotifOpen.value = false
  isProfileOpen.value = false
}

const toggleMega = (group: GroupItem) => {
  if (activeMegaGroup.value?.id === group.id && isMegaOpen.value) {
    isMegaOpen.value = false
  } else {
    activeMegaGroup.value = group
    isMegaOpen.value = true
  }
}

const handleSelectModule = (title: string) => {
  closeAllPopovers()
  const dest = getAdminDestination(title)
  if (dest && dest !== '#') return router.push(dest)
  triggerToast(`${title} — modul demo`)
}

// Handler Buat Jadwal
const handleScheduleSaved = (payload: {
  level: Jenjang
  kelas: string
  di: DayIndex
  si: number
  mapel: string
  guru: string
  ket: string
}) => {
  extraSchedules.value.push(payload)
  selectedClass.value[payload.level] = payload.kelas
  if (role.value === 'operator') {
    activeSubmenu.value = 'grade'
  }
  triggerToast(`Jadwal tersimpan: ${payload.mapel} · ${payload.kelas}`)
}

// Handler Sesi Mengajar
const openMulaiSession = (key: string) => {
  sessionSheetKey.value = key
}

const handleSessionStarted = (payload: { key: string; hadir: number; alpa: string[] }) => {
  sessions.value[payload.key] = {
    hadir: payload.hadir,
    alpa: payload.alpa,
    done: false
  }
  liveStartTime.value = Date.now()
  triggerToast(`Sesi mengajar dimulai: Hadir ${payload.hadir} · Alpa ${payload.alpa.length}`)
}

const endLiveSession = (key: string) => {
  if (sessions.value[key]) {
    sessions.value[key].done = true
    liveStartTime.value = null
    triggerToast('Sesi mengajar diakhiri. Kehadiran siswa telah tersimpan.')
  }
}

// Handler Simulasi Cepat
const handleSimulateStart = () => {
  jenjang.value = 'smk'
  role.value = 'guru'
  simDayIdx.value = 4
  simMin.value = 504 // 08:24
  activeSubmenu.value = 'saya'
  openMulaiSession('smk|XII TKJ 1|4|2')
}

onMounted(() => {
  // Pastikan class terpilih sesuai jenjang awal
  if (!selectedClass.value[jenjang.value]) {
    selectedClass.value[jenjang.value] = KELAS[jenjang.value][0].name
  }
})
</script>

<template>
  <div
    class="min-h-screen bg-[#F3F5F9] font-sans text-[#101828] antialiased selection:bg-[#101828] selection:text-white pb-24 lg:pb-12"
    @click="closeAllPopovers"
  >
    <!-- STICKY HEADER & BREADCRUMB -->
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header
        :jenjang="jenjang"
        :role="role === 'operator' ? 'superadmin' : role === 'wali' ? 'admin_tu' : 'guru'"
        :groups="GROUPS"
        :active-group-id="activeMegaGroup?.id || 'kepegawaian'"
        :current-route="'kepegawaian'"
        :is-mega-open="isMegaOpen"
        @update:jenjang="jenjang = $event"
        @toggle-mega="toggleMega"
        @open-mobile-menu="isMobileMenuOpen = true"
        @toggle-search="isSearchOpen = !isSearchOpen"
        @toggle-notif="isNotifOpen = !isNotifOpen"
        @toggle-profile="isProfileOpen = !isProfileOpen"
      />

      <AdminV2Breadcrumb
        :items="[
          { label: 'Portal Admin', to: '/adminV2' },
          { label: 'Kepegawaian' },
          { label: 'Jadwal Mengajar' }
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
    <main class="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-4 sm:space-y-5">
      <!-- Live Sticky Bar jika sedang mengajar -->
      <JadwalV2LiveBar
        :active-session="activeLiveSession"
        @akhiri="endLiveSession"
      />

      <!-- Page Header & Greeting -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              class="rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider"
              :class="jenjang === 'smp' ? 'border border-[#A6E9C5] bg-[#E7F6ED] text-[#166534]' : 'border border-[#B2CCFF] bg-[#EFF4FF] text-[#1B5FD9]'"
            >
              {{ jenjang.toUpperCase() }}
            </span>
            <span class="rounded-full border border-[#E7EBF2] bg-white px-2.5 py-0.5 text-[10.5px] font-bold text-[#475467]">
              {{ currentPersona.name.split(',')[0] }} &bull; {{ currentPersona.label }}
            </span>
          </div>

          <h1 class="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
            Jadwal Mengajar
          </h1>
          <p class="mt-1 text-xs text-[#667085]">
            Timetable Senin–Jumat &bull; Kehadiran Guru &bull; {{ jenjang === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }} &bull; TA 2026/2027
          </p>
        </div>

        <div class="hidden items-center gap-2 sm:flex">
          <span class="rounded-full border border-[#E7EBF2] bg-white px-3 py-1.5 text-xs font-bold text-[#667085] shadow-2xs">
            {{ formattedTodayDate }}
          </span>
          <span class="rounded-full border border-dashed border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-bold text-[#475467]">
            Porting Modul v2
          </span>
        </div>
      </div>

      <!-- Role-based Sub Navigation Segmented Control -->
      <!-- HANYA untuk Operator / Admin -->
      <div
        v-if="role === 'operator'"
        class="inline-flex rounded-2xl border border-[#E7EBF2] bg-[#EFF2F7] p-1.5 shadow-2xs"
        role="tablist"
      >
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all"
          :class="activeSubmenu === 'grade' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#475467] hover:text-[#101828]'"
          @click="activeSubmenu = 'grade'"
        >
          <AdminV2Icon name="cal" :size="15" />
          <span>Jadwal Mengajar {{ jenjang.toUpperCase() }}</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all"
          :class="activeSubmenu === 'saya' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#475467] hover:text-[#101828]'"
          @click="activeSubmenu = 'saya'"
        >
          <AdminV2Icon name="user" :size="15" />
          <span>Jadwal Saya</span>
        </button>
      </div>

      <!-- VIEW KONTEN BERDASARKAN PERAN -->

      <!-- 1. Peran OPERATOR: Bisa switch antara Jadwal Sekolah dan Jadwal Saya -->
      <template v-if="role === 'operator'">
        <JadwalV2GradeTimetable
          v-if="activeSubmenu === 'grade'"
          :jenjang="jenjang"
          :selected-class="selectedClass[jenjang]"
          :editable="true"
          :sim-day-idx="simDayIdx"
          :sim-min="simMin"
          :extra-schedules="extraSchedules"
          @update:jenjang="jenjang = $event"
          @update:selected-class="selectedClass[jenjang] = $event"
          @open-create="isCreateModalOpen = true"
        />

        <JadwalV2PersonalView
          v-else
          :jenjang="jenjang"
          :persona="currentPersona"
          :sim-day-idx="simDayIdx"
          :sim-min="simMin"
          :sessions="sessions"
          :extra-schedules="extraSchedules"
          @mulai="openMulaiSession"
          @akhiri="endLiveSession"
        />
      </template>

      <!-- 2. Peran WALI KELAS: Melihat jadwal lengkap kelas perwaliannya secara penuh (Senin-Jumat) -->
      <template v-else-if="role === 'wali'">
        <!-- Info Banner Wali Kelas -->
        <div class="flex items-start gap-3 rounded-2xl border border-[#C9DCFB] bg-[#E8F0FE] p-4 text-xs font-semibold leading-relaxed text-[#12459B] shadow-xs">
          <div class="mt-0.5 shrink-0 text-[#1B5FD9]">
            <AdminV2Icon name="info" :size="18" />
          </div>
          <div>
            Anda melihat <b>jadwal lengkap kelas perwalian Anda ({{ currentPersona.kelas }})</b> (Senin–Jumat, jam ke-1 s.d. terakhir) beserta <b>status kehadiran guru</b> di setiap jam pelajaran. Role Wali Kelas berfokus pada monitoring kelas — penugasan kurikulum dikelola oleh operator/admin.
          </div>
        </div>

        <JadwalV2GradeTimetable
          :jenjang="jenjang"
          :selected-class="currentPersona.kelas || selectedClass[jenjang]"
          :editable="false"
          :fixed-kelas="currentPersona.kelas"
          :mine-teacher-name="currentPersona.name"
          :sim-day-idx="simDayIdx"
          :sim-min="simMin"
          :extra-schedules="extraSchedules"
          @update:jenjang="jenjang = $event"
          @update:selected-class="selectedClass[jenjang] = $event"
        />
      </template>

      <!-- 3. Peran GURU / STAFF: Hanya melihat Jadwal Saya pribadi (dengan filter Senin-Jumat simple dan jelas) -->
      <template v-else>
        <JadwalV2PersonalView
          :jenjang="jenjang"
          :persona="currentPersona"
          :sim-day-idx="simDayIdx"
          :sim-min="simMin"
          :sessions="sessions"
          :extra-schedules="extraSchedules"
          @mulai="openMulaiSession"
          @akhiri="endLiveSession"
        />
      </template>
    </main>

    <!-- FLOATING DEMO PANEL (SIMULASI ROLE & WAKTU) -->
    <JadwalV2DemoPanel
      :role="role"
      :jenjang="jenjang"
      :sim-min="simMin"
      :persona="currentPersona"
      @update:role="role = $event; if (role === 'operator') activeSubmenu = 'grade'"
      @update:sim-min="simMin = $event"
      @simulate-start="handleSimulateStart"
    />

    <!-- MODAL BUAT JADWAL MENGAJAR (OPERATOR) -->
    <JadwalV2CreateModal
      :is-open="isCreateModalOpen"
      :jenjang="jenjang"
      :current-class="selectedClass[jenjang]"
      :sim-day-idx="simDayIdx"
      :extra-schedules="extraSchedules"
      @close="isCreateModalOpen = false"
      @saved="handleScheduleSaved"
    />

    <!-- SHEET MULAI MENGAJAR & CEK KEHADIRAN SISWA -->
    <JadwalV2SessionSheet
      :is-open="!!sessionSheetKey"
      :session-key="sessionSheetKey"
      :extra-schedules="extraSchedules"
      @close="sessionSheetKey = null"
      @started="handleSessionStarted"
    />

    <!-- BOTTOM BAR & POPOVERS MOBILE -->
    <AdminV2BottomNav
      :role="role === 'operator' ? 'superadmin' : role === 'wali' ? 'admin_tu' : 'guru'"
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @nav-click="handleSelectModule"
    />

    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :role="role === 'operator' ? 'superadmin' : role === 'wali' ? 'admin_tu' : 'guru'"
      :jenjang="jenjang"
      :groups="GROUPS"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
    />

    <AdminV2Popovers
      :is-search-open="isSearchOpen"
      :is-notif-open="isNotifOpen"
      :is-profile-open="isProfileOpen"
      :role="role === 'operator' ? 'superadmin' : role === 'wali' ? 'admin_tu' : 'guru'"
      @close="closeAllPopovers"
      @switch-role="role = $event === 'superadmin' ? 'operator' : $event === 'admin_tu' ? 'wali' : 'guru'"
      @toast="triggerToast"
    />

    <AdminV2Toast
      :visible="isToastVisible"
      :message="toastMessage"
    />
  </div>
</template>
