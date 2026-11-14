<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2HeroCard from '~/components/adminV2/AdminV2HeroCard.vue'
import AdminV2Metrics from '~/components/adminV2/AdminV2Metrics.vue'
import AdminV2ChartCard from '~/components/adminV2/AdminV2ChartCard.vue'
import AdminV2ExamSchedule from '~/components/adminV2/AdminV2ExamSchedule.vue'
import AdminV2Announcements from '~/components/adminV2/AdminV2Announcements.vue'
import AdminV2ActivityTable from '~/components/adminV2/AdminV2ActivityTable.vue'
import AdminV2GuruDashboard from '~/components/adminV2/AdminV2GuruDashboard.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import {
  SCHOOL_DATA,
  GROUPS,
  getAdminDestination,
  type GroupItem
} from '~/components/adminV2/adminV2Data'
import { angka, rekapAbsensi, teksPersen, type BarisUjian, type TabUjian } from '~/composables/dashboardCore'
import type { BarisPembayaran, BarisPengumuman, JadwalHariIni } from '~/composables/useDashboard'

definePageMeta({
  layout: false
})

useHead({
  title: 'Darqia 9 — Admin Dashboard V2',
  meta: [
    { name: 'description', content: 'Dashboard Admin Portal Darqia 9 V2 Opsi Desain' }
  ]
})

/* ================= REACTIVE STATE ================= */
const jenjang = useAdminJenjang()
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin')

const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)

const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isNotifOpen = ref(false)
const isProfileOpen = ref(false)

const toastMessage = ref('')
const isToastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const currentSchool = computed(() => SCHOOL_DATA[jenjang.value])

/* ================= DATA REAL (brief aksesaplikasi.md) ================= */
// Guru Pengajar & Wali Kelas melihat dashboard pribadi; peran lain (Superadmin, Yayasan, Kepsek, Wakasek,
// Operator, Staff) melihat Overview sekolah per jenjang.
const rbac = useRbac()
const dashboard = useDashboard()
const tahunAjaran = useTahunAjaran()
const modeGuru = rbac.modeGuru
const bolehKeuangan = computed(() => rbac.bolehJudulMenu('Keuangan sekolah'))
const memuat = ref(true)
const galatData = ref<string[]>([])
const kosongUjian = (): Record<TabUjian, BarisUjian[]> => ({ harian: [], pts: [], pas: [] })
const overview = ref({ siswa: 0, siswaHadir: 0, siswaPct: 0, rombel: 0, guru: 0, guruHadir: 0, guruPct: 0, siswaTercatat: 0, guruTercatat: 0 })
const ujian = ref(kosongUjian())
const pengumuman = ref<BarisPengumuman[]>([])
const pembayaran = ref<BarisPembayaran[]>([])
const guru = ref({ tertaut: true, absensi: rekapAbsensi([]), jadwal: [] as JadwalHariIni[] })

let urutanMuat = 0
const muatDashboard = async () => {
  const ke = ++urutanMuat
  memuat.value = true
  try {
    await rbac.muat()
    // Dibaca setelah muat: muat bisa menyelaraskan jenjang aktif ke jenjang tempat guru mengajar.
    const grade = jenjang.value === 'smp' ? 'SMP' : 'SMK'
    if (modeGuru.value) {
      const d = await dashboard.muatGuru(grade, rbac.state.value.subjekSaya)
      if (ke !== urutanMuat) return
      guru.value = { tertaut: d.tertaut, absensi: d.absensi, jadwal: d.jadwal }
      ujian.value = d.ujian
      pengumuman.value = d.pengumuman
      galatData.value = d.galat
    } else {
      const d = await dashboard.muatOverview(grade, bolehKeuangan.value)
      if (ke !== urutanMuat) return
      overview.value = { siswa: d.siswa, siswaHadir: d.siswaHadir, siswaPct: d.siswaPct, rombel: d.rombel, guru: d.guru, guruHadir: d.guruHadir, guruPct: d.guruPct, siswaTercatat: d.siswaTercatat, guruTercatat: d.guruTercatat }
      ujian.value = d.ujian
      pengumuman.value = d.pengumuman
      pembayaran.value = d.pembayaran
      galatData.value = d.galat
    }
  } catch (e) {
    if (ke === urutanMuat) galatData.value = [e instanceof Error ? e.message : 'Data dashboard gagal dimuat.']
  } finally {
    if (ke === urutanMuat) memuat.value = false
  }
}
watch(jenjang, () => { void muatDashboard() })
const subUjian = computed(() => `Ujian terdekat · TA ${tahunAjaran.tahun.value}`)
const heroAksi = () => navigateTo('/adminV2/siswa')

// Semua kartu selalu tampil; yang belum punya data menampilkan nilai 0 / keterangan kosong.
const spanBaris1 = 'lg:col-span-4'
const spanBaris2 = 'lg:col-span-6'

/* ================= TOAST HELPER ================= */
const triggerToast = (msg: string) => {
  toastMessage.value = msg
  isToastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    isToastVisible.value = false
  }, 2200)
}

/* ================= ACTIONS ================= */
const setJenjang = (val: 'smp' | 'smk') => {
  jenjang.value = val
  triggerToast(`Beralih ke ${val === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'}`)
}

const setRole = (r: 'superadmin' | 'admin_tu' | 'guru') => {
  role.value = r
  closeAllModals()
  const msg = r === 'guru'
    ? 'Mode Guru: menu Keuangan disembunyikan'
    : `Mode ${r === 'superadmin' ? 'Superadmin' : 'Admin TU'}`
  triggerToast(msg)
}

const toggleMega = (g: GroupItem) => {
  if (isMegaOpen.value && activeMegaGroup.value?.id === g.id) {
    isMegaOpen.value = false
    activeMegaGroup.value = null
  } else {
    activeMegaGroup.value = g
    isMegaOpen.value = true
    closeAllPopovers()
  }
}

const closeAllPopovers = () => {
  isNotifOpen.value = false
  isProfileOpen.value = false
}

const closeAllModals = () => {
  isMegaOpen.value = false
  isMobileMenuOpen.value = false
  isSearchOpen.value = false
  closeAllPopovers()
}

const toggleSearch = () => {
  closeAllPopovers()
  isMegaOpen.value = false
  isSearchOpen.value = !isSearchOpen.value
}

const toggleNotif = () => {
  isProfileOpen.value = false
  isMegaOpen.value = false
  isNotifOpen.value = !isNotifOpen.value
}

const toggleProfile = () => {
  isNotifOpen.value = false
  isMegaOpen.value = false
  isProfileOpen.value = !isProfileOpen.value
}

/* ================= GREETING & DATE ================= */
const greetingTitle = ref('Selamat datang')
const todayFormatted = ref('')

onMounted(() => {
  const h = new Date().getHours()
  const g = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam'
  greetingTitle.value = `${g}, ${rbac.namaAkun.value || (rbac.adalahSuperadmin.value ? 'Superadmin' : 'Admin')}`
  void tahunAjaran.muatOpsi()
  void muatDashboard()

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const now = new Date()
  todayFormatted.value = `${days[now.getDay()]}, ${now.getDate()} ${mo[now.getMonth()]} ${now.getFullYear()}`

  window.addEventListener('keydown', handleGlobalKeydown)
  window.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalKeydown)
    window.removeEventListener('click', handleDocumentClick)
  }
})

const handleDocumentClick = (e: MouseEvent) => {
  if (!isMegaOpen.value) return
  const target = e.target as HTMLElement
  if (!target.closest('.sticky')) {
    isMegaOpen.value = false
    activeMegaGroup.value = null
  }
}

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeAllModals()
  }
}

const handleSelectModule = (title: string) => {
  isMegaOpen.value = false
  isMobileMenuOpen.value = false
  const dest = getAdminDestination(title)
  if (dest) return navigateTo(dest)
  triggerToast(`${title} — modul demo`)
}
</script>

<template>
  <div
    class="min-h-screen bg-[#F3F5F9] text-[#101828] font-sans overflow-x-clip antialiased pb-24 lg:pb-12 selection:bg-[#101828] selection:text-white"
    @click="closeAllModals"
  >
    <!-- STICKY HEADER & INTEGRATED MEGA PANEL (Non-fixed mega menu) -->
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <!-- Topbar Header -->
      <AdminV2Header
        :jenjang="jenjang"
        :role="role"
        :groups="GROUPS"
        :active-group-id="activeMegaGroup?.id"
        :is-mega-open="isMegaOpen"
        @update:jenjang="setJenjang"
        @toggle-mega="toggleMega"
        @open-mobile-menu="isMobileMenuOpen = true"
        @toggle-search="toggleSearch"
        @toggle-notif="toggleNotif"
        @toggle-profile="toggleProfile"
      />

      <!-- SUB NAVBAR KHUSUS BREADCRUMB (Desktop & Mobile: Sticky Sub-Navbar) -->
      <AdminV2Breadcrumb
        :items="[
          { label: 'Portal Admin', to: '/adminV2' },
          { label: 'Dashboard Utama' }
        ]"
        :badge="jenjang === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'"
        :jenjang="jenjang"
      />

      <!-- Desktop Mega Panel (Anchored absolute to sticky container, NOT fixed to window) -->
      <AdminV2MegaPanel
        :open="isMegaOpen"
        :group="activeMegaGroup"
        :jenjang="jenjang"
        @close="isMegaOpen = false"
        @select-item="handleSelectModule"
      />
    </div>

    <!-- MAIN DASHBOARD CONTENT -->
    <main class="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 space-y-4">
      <!-- Greeting Header -->
      <div class="flex items-start justify-between gap-3 my-1">
        <div>
          <div class="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-1">
            Portal administrasi · V2
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
            {{ greetingTitle }}
          </h1>
          <p class="text-xs sm:text-[13px] text-[#667085] mt-1 font-medium">
            {{ modeGuru ? 'Ringkasan absensi, jadwal mengajar, dan ujian Anda.' : 'Pantau kehadiran, data akademik, dan jadwal ujian sekolah hari ini.' }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="todayFormatted" class="hidden md:inline-block text-[11.5px] font-bold text-[#667085] bg-white border border-[#E7EBF2] py-2 px-3 rounded-full whitespace-nowrap shadow-sm">
            {{ todayFormatted }}
          </span>
        </div>
      </div>

      <p v-if="galatData.length" class="rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-xs text-[#B42318]" role="alert">
        Sebagian data dashboard gagal dimuat: {{ galatData[0] }}
      </p>

      <p v-if="memuat" class="rounded-[18px] border border-[#E7EBF2] bg-white px-5 py-8 text-center text-[13px] text-[#667085]" role="status">Memuat data dashboard…</p>

      <!-- DASHBOARD GURU (Guru Pengajar & Wali Kelas) -->
      <AdminV2GuruDashboard
        v-else-if="modeGuru"
        :jenjang="jenjang"
        :tertaut="guru.tertaut"
        :guru-id="rbac.state.value.subjekSaya"
        :absensi="guru.absensi"
        :jadwal="guru.jadwal"
        :ujian="ujian"
        :pengumuman="pengumuman"
        :tahun-ajaran="tahunAjaran.tahun.value"
        @toast="triggerToast"
      />

      <template v-else>
        <!-- ROW 1: Total siswa, metrik, rekap kehadiran (grafik masih contoh sampai RFID berjalan, selalu tampil) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          <div class="h-full" :class="spanBaris1">
            <AdminV2HeroCard
              :value="angka(overview.siswa)"
              :sub="`${currentSchool.label} · TA ${tahunAjaran.tahun.value}`"
              :jenjang="jenjang"
              :boleh-kelola="rbac.bisaSaya('Data Siswa', 'buat')"
              @action="heroAksi"
            />
          </div>

          <div class="h-full" :class="spanBaris1">
            <AdminV2Metrics
              :siswa-hadir="angka(overview.siswaHadir)"
              :siswa-total="`/${angka(overview.siswa)}`"
              :siswa-pct="teksPersen(overview.siswaPct)"
              :siswa-bar="overview.siswaPct"
              :rombel="angka(overview.rombel)"
              :guru="angka(overview.guru)"
              :guru-hadir="angka(overview.guruHadir)"
              :guru-total="`/${angka(overview.guru)}`"
              :guru-pct="teksPersen(overview.guruPct)"
              :guru-bar="overview.guruPct"
              :jenjang="jenjang"
            />
          </div>

          <div class="h-full" :class="spanBaris1">
            <AdminV2ChartCard :jenjang="jenjang" />
          </div>
        </div>

        <!-- ROW 2: Jadwal ujian terdekat & pengumuman, hanya bila ada datanya -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch mt-3.5">
          <div class="h-full" :class="spanBaris2">
            <AdminV2ExamSchedule :jenjang="jenjang" :exams="ujian" :sub="subUjian" />
          </div>
          <div class="h-full" :class="spanBaris2">
            <AdminV2Announcements :announcements="pengumuman" :jenjang="jenjang" />
          </div>
        </div>

        <!-- ROW 3: Pembayaran terbaru (peran yang boleh melihat Keuangan, dan hanya bila ada transaksi) -->
        <div v-if="bolehKeuangan && pembayaran.length" class="mt-3.5">
          <AdminV2ActivityTable
            :rows="pembayaran"
            :jenjang="jenjang"
            judul="Pembayaran Terbaru"
            @filter-click="navigateTo('/adminV2/keuangan')"
            @view-all="navigateTo('/adminV2/keuangan')"
            @row-click="navigateTo('/adminV2/keuangan')"
            @notify="triggerToast"
          />
        </div>
      </template>
    </main>

    <!-- Mobile Bottom Navigation Bar -->
    <AdminV2BottomNav
      :role="role"
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @nav-click="(tab) => triggerToast(`Navigasi ke ${tab}`)"
    />

    <!-- Full-screen Mobile Menu Drawer -->
    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :role="role"
      :groups="GROUPS"
      :jenjang="jenjang"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
      @profile-click="() => { isMobileMenuOpen = false; triggerToast('Profil Saya — demo') }"
      @settings-click="() => { isMobileMenuOpen = false; triggerToast('Pengaturan — demo') }"
      @logout-click="isMobileMenuOpen = false"
    />

    <!-- Popovers and Modals (Notif, Profile, Search) -->
    <AdminV2Popovers
      :is-notif-open="isNotifOpen"
      :is-profile-open="isProfileOpen"
      :is-search-open="isSearchOpen"
      :role="role"
      :jenjang="jenjang"
      @close-all="closeAllModals"
      @update:role="setRole"
      @item-click="(label) => triggerToast(`${label} — demo`)"
    />

    <!-- Floating Interactive Toast -->
    <AdminV2Toast
      :message="toastMessage"
      :visible="isToastVisible"
    />
  </div>
</template>
