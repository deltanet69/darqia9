<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import ProfilV2Hero from '~/components/adminV2/profil/ProfilV2Hero.vue'
import ProfilV2SlimHeader from '~/components/adminV2/profil/ProfilV2SlimHeader.vue'
import ProfilV2OverviewTab from '~/components/adminV2/profil/ProfilV2OverviewTab.vue'
import ProfilV2DataProfilTab from '~/components/adminV2/profil/ProfilV2DataProfilTab.vue'
import ProfilV2AplikasiTab from '~/components/adminV2/profil/ProfilV2AplikasiTab.vue'
import ProfilV2PengaturanTab from '~/components/adminV2/profil/ProfilV2PengaturanTab.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import type { ProfileTabKey } from '~/components/adminV2/profil/profilV2Data'
import { aktivitasTampil, sesiLogin, validasiUbah, type PrefNotifikasi } from '~/composables/profilCore'

definePageMeta({
  layout: false
})

useHead({
  title: 'Profil Saya — Admin Portal Darqia 9',
  meta: [
    {
      name: 'description',
      content: 'Kelola data pribadi, identitas RFID presensi, hak akses aplikasi RBAC, dan keamanan akun di Admin Portal Darqia 9.'
    }
  ]
})

const router = useRouter()
const route = useRoute()
const store = useProfilSaya()
const rbac = useRbac()
const grade = useAdminGrade()
const { tahun, muatOpsi: muatTahunAjaran } = useTahunAjaran()

/* ================= STATE ================= */
const jenjang = computed<'smp' | 'smk'>({
  get: () => grade.value.toLowerCase() as 'smp' | 'smk',
  set: value => { grade.value = value.toUpperCase() as 'SMP' | 'SMK' }
})
const isProfileTab = (value: unknown): value is ProfileTabKey => ['overview', 'dataprofil', 'aplikasi', 'pengaturan'].includes(value as ProfileTabKey)
const activeTab = ref<ProfileTabKey>(isProfileTab(route.query.tab) ? route.query.tab : 'overview')
const themeOpen = ref<boolean>(false)
const isEditing = ref<boolean>(false)
const isSaving = ref<boolean>(false)

const profil = store.profil
const themeIdx = computed(() => store.state.value.akun?.tema ?? 0)
const prefs = computed<PrefNotifikasi>(() => ({ wa: true, email: true, jadwal: true, ...(store.state.value.akun?.prefs || {}) }))
const aktivitas = computed(() => aktivitasTampil(store.state.value.aktivitas))
const sesi = computed(() => sesiLogin(store.state.value.login, 3))

// Form Edit Data Mandiri — nilai awal dari baris guru milik akun
const editForm = reactive({ alamat: '', kel: '', kec: '', kab: '', wa: '', nip: '', nuptk: '' })

const syncEditForm = () => {
  const g = store.state.value.guru
  editForm.alamat = g?.address || ''
  editForm.kel = g?.kelurahan || ''
  editForm.kec = g?.kecamatan || ''
  editForm.kab = g?.kab_kota || ''
  editForm.wa = g?.phone || ''
  editForm.nip = g?.nip || ''
  editForm.nuptk = g?.nuptk || ''
}

// Popovers & Shell Navigasi
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

// Sama seperti SistemPageShell: menu disaring oleh RBAC, bukan oleh prop ini.
const shellRole = 'superadmin' as const

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
}

// Edit Profil
const handleStartEdit = () => {
  if (!profil.value?.adaGuru) {
    triggerToast('Akun belum terhubung ke Data Induk Pegawai. Hubungi Superadmin.')
    return
  }
  syncEditForm()
  isEditing.value = true
  if (activeTab.value !== 'dataprofil' && activeTab.value !== 'pengaturan') {
    activeTab.value = 'dataprofil'
  }
}

const handleCancelEdit = () => {
  isEditing.value = false
}

const handleSaveEdit = async () => {
  if (isSaving.value) return
  const data = {
    nip: editForm.nip,
    nuptk: editForm.nuptk,
    phone: editForm.wa,
    address: editForm.alamat,
    kelurahan: editForm.kel,
    kecamatan: editForm.kec,
    kab_kota: editForm.kab
  }
  const { galat } = validasiUbah(data, store.state.value.guru || {})
  if (galat) {
    triggerToast(galat)
    return
  }
  isSaving.value = true
  const pesan = await store.simpanData(data)
  isSaving.value = false
  if (pesan) {
    triggerToast(pesan)
    return
  }
  isEditing.value = false
  triggerToast('Profil berhasil diperbarui.')
}

const handleCopyText = (text: string) => {
  try {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    }
  } catch (err) {
    console.error('Clipboard copy failed', err)
  }
  triggerToast(`${text} tersalin ke clipboard.`)
}

const handleUploadFoto = async (file: File) => {
  triggerToast('Mengunggah foto...')
  const pesan = await store.unggahFoto(file)
  triggerToast(pesan || 'Foto profil berhasil diperbarui.')
}

const handleTema = async (idx: number) => {
  const pesan = await store.simpanPengaturan({ tema: idx })
  if (pesan) triggerToast(pesan)
}

const handleTogglePref = async (key: keyof PrefNotifikasi) => {
  const pesan = await store.simpanPengaturan({ prefs: { ...prefs.value, [key]: !prefs.value[key] } })
  triggerToast(pesan || 'Preferensi notifikasi diperbarui.')
}

// Aktivitas & sesi diperbarui berkala selama halaman terbuka dan tab browser terlihat.
let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  void muatTahunAjaran()
  await Promise.all([rbac.muat(), store.muat()])
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible' && !isEditing.value) void store.muat()
  }, 60000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <div
    class="min-h-screen overflow-x-clip bg-[#F3F5F9] font-sans text-[#101828] antialiased selection:bg-[#101828] selection:text-white pb-24 lg:pb-12"
    @click="closeAllPopovers"
  >
    <!-- STICKY HEADER -->
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header
        :jenjang="jenjang"
        :role="shellRole"
        :groups="GROUPS"
        :active-group-id="activeMegaGroup?.id || 'sistem'"
        :current-route="'sistem'"
        :is-mega-open="isMegaOpen"
        @update:jenjang="jenjang = $event"
        @toggle-mega="toggleMega"
        @open-mobile-menu="isMobileMenuOpen = true"
        @toggle-search="isSearchOpen = !isSearchOpen"
        @toggle-notif="isNotifOpen = !isNotifOpen"
        @toggle-profile="isProfileOpen = !isProfileOpen"
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
    <main class="mx-auto max-w-[1440px] space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <!-- Page Header & Greeting (.greet) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-2">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl flex items-center gap-2.5 flex-wrap">
            <span>Profil Saya</span>
            <span
              id="gradeBadge"
              class="rounded-full px-3 py-1 text-xs font-bold transition-colors"
              :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#1B5FD9]'"
            >
              {{ jenjang.toUpperCase() }}
            </span>
          </h1>
          <p class="mt-1 text-xs text-[#667085]">
            Data pribadi, kepegawaian &amp; keamanan akun &bull; {{ jenjang === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }} &bull; Tahun Ajaran {{ tahun }}
          </p>
        </div>

        <div class="hidden items-center gap-2 sm:flex">
          <span class="rounded-full border border-[#E7EBF2] bg-white px-3 py-1.5 text-xs font-bold text-[#667085] shadow-2xs">
            {{ formattedTodayDate }}
          </span>
        </div>
      </div>

      <!-- SUBMENU NAVIGATION BAR: Identik 1:1 Styling Standar AdminV2 (Keuangan, Kelas, CBT, Absensi) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="w-full sm:w-auto overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav
            class="inline-flex items-center gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1.5 rounded-2xl min-w-max"
            role="tablist"
            aria-label="Navigasi Profil User"
          >
            <button
              v-for="tab in ([
                { key: 'overview', label: 'Overview', icon: 'grid' },
                { key: 'dataprofil', label: 'Data Profil', icon: 'user' },
                { key: 'aplikasi', label: 'Aplikasi Saya', icon: 'layers' },
                { key: 'pengaturan', label: 'Pengaturan', icon: 'gear' }
              ] as const)"
              :key="tab.key"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.key"
              @click="activeTab = tab.key"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-all cursor-pointer select-none"
              :class="activeTab === tab.key
                ? 'bg-[#101828] text-white shadow-[0_2px_8px_rgba(16,24,40,0.15)]'
                : 'text-[#475467] hover:text-[#101828] hover:bg-white/60 font-semibold'"
            >
              <AdminV2Icon :name="tab.icon" :size="15" />
              <span>{{ tab.label }}</span>
            </button>
          </nav>
        </div>

        <!-- Indikator Status Akun di sebelah kanan -->
        <div class="hidden sm:flex items-center gap-2 text-[12px] font-semibold text-slate-500 shrink-0">
          <span class="inline-block h-2 w-2 rounded-full" :class="profil?.active !== false ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
          <span>{{ profil?.roleSys || 'Superadmin Utama' }} &bull; Akun Terverifikasi</span>
        </div>
      </div>

      <!-- Strip Identitas Jenjang Terintegrasi (Clean & Sleek) -->
      <div class="flex items-center justify-between gap-3 rounded-xl border border-[#E7EBF2] bg-white px-4 py-2.5 text-xs text-slate-600 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div class="flex items-center gap-2 min-w-0">
          <span class="flex h-2 w-2 rounded-full shrink-0" :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
          <span class="font-bold text-slate-800 shrink-0">{{ jenjang === 'smk' ? 'SMK IT Attaqwa 9' : 'SMP IT BCA' }}</span>
          <span class="text-slate-300">|</span>
          <span class="text-slate-500 truncate">Tahun Ajaran {{ tahun }} &middot; Data disinkronkan otomatis dari Data Induk Kepegawaian</span>
        </div>
        <span class="shrink-0 text-[11px] font-semibold text-slate-400 hidden md:inline">
          Ganti jenjang lewat switch SMP/SMK di bilah atas
        </span>
      </div>

      <p v-if="!store.state.value.termuat" class="rounded-2xl border border-[#E7EBF2] bg-white p-5 text-center text-xs font-semibold text-[#667085]">
        Memuat profil...
      </p>
      <div v-else-if="!profil" class="rounded-2xl border border-[#FECDC2] bg-[#FFF4ED] p-5 text-xs font-semibold text-[#B42318]">
        <p>{{ store.state.value.galat || 'Profil gagal dimuat.' }}</p>
        <button type="button" class="mt-2 rounded-xl border border-[#FECDC2] bg-white px-3 py-1.5 font-bold" @click="store.muat()">
          Coba lagi
        </button>
      </div>

      <template v-else>
        <!-- HERO / SLIM HEADER SESUAI ACTIVE TAB -->
        <ProfilV2Hero
          v-if="activeTab === 'overview'"
          :profile="profil"
          :theme-idx="themeIdx"
          :theme-open="themeOpen"
          :is-editing="isEditing"
          @update:theme-idx="handleTema"
          @toggle-theme-picker="themeOpen = !themeOpen"
          @start-edit="handleStartEdit"
          @save-edit="handleSaveEdit"
          @cancel-edit="handleCancelEdit"
          @copy-text="handleCopyText"
          @upload-foto="handleUploadFoto"
        />

        <ProfilV2SlimHeader
          v-else
          :profile="profil"
          :theme-idx="themeIdx"
          :theme-open="themeOpen"
          :is-editing="isEditing"
          @update:theme-idx="handleTema"
          @toggle-theme-picker="themeOpen = !themeOpen"
          @start-edit="handleStartEdit"
          @save-edit="handleSaveEdit"
          @cancel-edit="handleCancelEdit"
          @upload-foto="handleUploadFoto"
        />

        <!-- TAB 1: OVERVIEW -->
        <ProfilV2OverviewTab
          v-if="activeTab === 'overview'"
          :profile="profil"
          :aplikasi="store.aplikasi.value"
          :aktivitas="aktivitas"
          :login-terakhir="sesi[0] || null"
          @navigate-tab="activeTab = $event"
        />

        <!-- TAB 2: DATA PROFIL -->
        <ProfilV2DataProfilTab
          v-else-if="activeTab === 'dataprofil'"
          :profile="profil"
          :is-editing="isEditing"
          :edit-form="editForm"
        />

        <!-- TAB 3: APLIKASI SAYA (RBAC) -->
        <ProfilV2AplikasiTab
          v-else-if="activeTab === 'aplikasi'"
          :profile="profil"
          :aplikasi="store.aplikasi.value"
          :cakupan="store.cakupan.value"
        />

        <!-- TAB 4: PENGATURAN & KEAMANAN -->
        <ProfilV2PengaturanTab
          v-else-if="activeTab === 'pengaturan'"
          :profile="profil"
          :is-editing="isEditing"
          :edit-form="editForm"
          :prefs="prefs"
          :sesi="sesi"
          :ubah-sandi="store.ubahSandi"
          @toggle-pref="handleTogglePref"
        />
      </template>
    </main>

    <!-- BOTTOM BAR & POPOVERS MOBILE -->
    <AdminV2BottomNav
      :role="shellRole"
      :jenjang="jenjang"
      @open-menu="isMobileMenuOpen = true"
      @nav-click="handleSelectModule"
    />

    <AdminV2MobileMenu
      :open="isMobileMenuOpen"
      :role="shellRole"
      :jenjang="jenjang"
      :groups="GROUPS"
      @close="isMobileMenuOpen = false"
      @select-item="handleSelectModule"
    />

    <AdminV2Popovers
      :is-search-open="isSearchOpen"
      :is-notif-open="isNotifOpen"
      :is-profile-open="isProfileOpen"
      :role="shellRole"
      :jenjang="jenjang"
      @close-all="closeAllPopovers"
      @item-click="closeAllPopovers"
    />

    <AdminV2Toast
      :visible="isToastVisible"
      :message="toastMessage"
    />
  </div>
</template>
