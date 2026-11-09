<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
import JadwalV2LiveBar from '~/components/adminV2/jadwal-mengajar/JadwalV2LiveBar.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import {
  stateV2, terapkanJenjang, kunciSesi, kunciPelajaran, isoTanggalLokal, diHariIni,
  type Jenjang, type RoleKey, type DayIndex, type LessonSession, type PersonaInfo
} from '~/components/adminV2/jadwal-mengajar/jadwalV2Data'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useJadwalMengajar } from '~/composables/useJadwalMengajar'
import { useJadwalPelajaran } from '~/composables/useJadwalPelajaran'

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
const mengajar = useJadwalMengajar()
const jp = useJadwalPelajaran()

/* ================= STATE GLOBAL ================= */
// Jenjang mengikuti switcher global top navbar (sumber yang sama dengan Jadwal Pelajaran)
const grade = useAdminGrade()
const jenjang = computed<Jenjang>({
  get: () => grade.value.toLowerCase() as Jenjang,
  set: v => { grade.value = v.toUpperCase() as 'SMP' | 'SMK' }
})
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

/* ================= JAM NYATA (bukan simulasi) ================= */
const sekarang = ref(new Date())
let jamTimer: ReturnType<typeof setInterval> | null = null
const simDayIdx = computed(() => diHariIni(sekarang.value))
const simMin = computed(() => sekarang.value.getHours() * 60 + sekarang.value.getMinutes())
const simDayIdxModal = computed<DayIndex>(() => (simDayIdx.value >= 0 && simDayIdx.value <= 4 ? simDayIdx.value : 0) as DayIndex)

// State Kelas Terpilih
const selectedClass = ref<Record<Jenjang, string>>({ smk: '', smp: '' })

// Modal & Sheet States
const isCreateModalOpen = ref(false)
const slotBaru = ref<{ di: DayIndex, si: number } | null>(null)

/* ================= GURU AKTIF & PERSONA ASLI =================
   Sampai RBAC akun guru aktif, guru yang ditampilkan di "Jadwal Saya"
   dipilih secara terbuka lewat pemilih "Guru aktif" — tidak ada
   persona karangan. Sesi yang dicatat selalu atas nama guru ini. */
const rbac = useRbac()
const bolehKelola = rbac.adalahSuperadmin
// Data guru milik akun login (subjekSaya = id guru bila akun tertaut ke tabel teachers)
const guruSaya = computed(() => [...stateV2.guru.smp, ...stateV2.guru.smk].find(g => g.id === rbac.state.value.subjekSaya) || null)
const guruAktifId = ref('')
// Selain Superadmin, "Guru aktif" terkunci ke diri sendiri — tidak bisa melihat/mencatat atas nama guru lain.
const guruAktif = computed(() => bolehKelola.value
  ? stateV2.guru[jenjang.value].find(g => g.id === guruAktifId.value) || stateV2.guru[jenjang.value][0] || null
  : guruSaya.value)

const currentPersona = computed<PersonaInfo>(() => {
  const g = guruAktif.value
  if (!g) return { name: '—', label: 'Belum ada data guru' }
  const waliKelas = stateV2.kelas[jenjang.value].find(k => stateV2.waliDari[`${jenjang.value}|${k.name}`] === g.id)
  const mapelKu = [...new Set(stateV2.pelajaran.filter(l => l.level === jenjang.value && l.teacherId === g.id).map(l => l.mapel))]
  return {
    name: g.nama,
    label: waliKelas ? `Wali Kelas ${waliKelas.name}` : mapelKu.length ? `Guru ${mapelKu[0]}` : 'Guru',
    kelas: waliKelas?.name
  }
})

const kelasWali = computed(() => currentPersona.value.kelas || selectedClass.value[jenjang.value])

const pastikanPilihan = () => {
  for (const j of ['smp', 'smk'] as Jenjang[]) {
    const daftar = stateV2.kelas[j]
    if (daftar.length && !daftar.some(k => k.name === selectedClass.value[j])) {
      selectedClass.value[j] = daftar[0]!.name
    }
  }
  const daftarGuru = stateV2.guru[jenjang.value]
  if (daftarGuru.length && !daftarGuru.some(g => g.id === guruAktifId.value)) {
    guruAktifId.value = stateV2.pelajaran.find(l => l.level === jenjang.value)?.teacherId || daftarGuru[0]!.id
  }
}

watch(jenjang, j => {
  terapkanJenjang(j)
  pastikanPilihan()
})

/* ================= SESI HARI INI (dari teaching_sessions) ================= */
const sesiRecord = computed<Record<string, LessonSession>>(() => {
  const rec: Record<string, LessonSession> = {}
  const tgl = isoTanggalLokal(sekarang.value)
  for (const l of stateV2.pelajaran) {
    const s = stateV2.sesi[kunciSesi(l.id, tgl)]
    if (s && s.startedAt) {
      rec[kunciPelajaran(l)] = { done: s.status === 'selesai' }
    }
  }
  return rec
})

const activeLiveSession = computed(() => {
  const tgl = isoTanggalLokal(sekarang.value)
  for (const l of stateV2.pelajaran) {
    const s = stateV2.sesi[kunciSesi(l.id, tgl)]
    if (s && s.startedAt && s.status === 'berlangsung') {
      return {
        key: kunciPelajaran(l),
        mapel: l.mapel,
        kelas: l.kelas,
        startTime: new Date(s.startedAt).getTime()
      }
    }
  }
  return null
})

// Format Tanggal Hari Ini
const formattedTodayDate = computed(() => {
  const d = sekarang.value
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

// Handler Buat Jadwal — menulis ke class_schedules lewat mesin yang sama
// dengan Jadwal Pelajaran (anti-bentrok guru/kelas/ruangan identik).
const handleScheduleSaved = async (payload: {
  level: Jenjang
  kelas: string
  di: DayIndex
  si: number
  mapel: string
  guru: string
  ket: string
}) => {
  const gradeDb = (payload.level === 'smp' ? 'SMP' : 'SMK') as 'SMP' | 'SMK'
  await jp.load(gradeDb)
  const classId = stateV2.idKelas[`${payload.level}|${payload.kelas}`]
  const subjectId = stateV2.idMapel[`${payload.level}|${payload.mapel}`]
  const teacherId = stateV2.idGuru[payload.guru]
  if (!classId || !subjectId || !teacherId) {
    triggerToast('Data kelas, mapel, atau guru tidak ditemukan di Data Induk.')
    return
  }
  // Sel yang sudah terisi pada jam yang sama diganti (sesuai konfirmasi di modal)
  const lama = jp.entriList.value.find(j => j.classId === classId && j.day === payload.di + 1 && j.mulaiKe === payload.si + 1)
  // simpanEntri melempar galat bila gagal (bentrok/DB) dan tidak mengembalikan nilai bila sukses
  try {
    await jp.simpanEntri(gradeDb, {
      classId,
      subjectId,
      teacherId,
      day: payload.di + 1,
      mulaiKe: payload.si + 1,
      selesaiKe: payload.si + 1,
      room: '',
      notes: payload.ket || ''
    }, lama?.id)
  } catch (e: any) {
    triggerToast(e?.message || 'Jadwal gagal disimpan.')
    return
  }
  await mengajar.muatJadwalUlang()
  selectedClass.value[payload.level] = payload.kelas
  if (role.value === 'operator') {
    activeSubmenu.value = 'grade'
  }
  triggerToast(`Jadwal tersimpan: ${payload.mapel} · ${payload.kelas}`)
}

// Buka Agenda Mengajar untuk pelajaran ini; ?mulai=1 membuka jurnal pertemuan baru, tanpa itu agenda hanya dibuka.
const bukaAgenda = (les: { classId: string; subjectId: string; teacherId: string; level: Jenjang }, mulai: boolean) =>
  router.push({ path: '/adminV2/agenda-mengajar', query: { jenjang: les.level, kelas: les.classId, mapel: les.subjectId, guru: les.teacherId, ...(mulai ? { mulai: '1' } : {}) } })

// Handler Sesi Mengajar — menulis ke teaching_sessions, lalu langsung membuka agenda (kehadiran siswa diisi di sana)
const openMulaiSession = async (key: string) => {
  const les = stateV2.pelajaran.find(l => kunciPelajaran(l) === key)
  if (!les) return
  const hasil = await mengajar.mulaiSesi(les)
  if (!hasil.ok) {
    triggerToast(`Gagal mencatat sesi: ${hasil.pesan || 'periksa koneksi basis data'}`)
    return
  }
  bukaAgenda(les, true)
}

const bukaAgendaSesi = (key: string) => {
  const les = stateV2.pelajaran.find(l => kunciPelajaran(l) === key)
  if (les) bukaAgenda(les, false)
}

const endLiveSession = async (key: string) => {
  const les = stateV2.pelajaran.find(l => kunciPelajaran(l) === key)
  if (!les) return
  const ok = await mengajar.selesaikanSesi(les)
  triggerToast(ok
    ? 'Sesi mengajar diakhiri. Kehadiran siswa telah tersimpan.'
    : 'Gagal mengakhiri sesi — periksa koneksi basis data.')
}

onMounted(async () => {
  jamTimer = setInterval(() => {
    sekarang.value = new Date()
  }, 30000)
  terapkanJenjang(jenjang.value)
  await mengajar.muatSemua()
  terapkanJenjang(jenjang.value)
  pastikanPilihan()
})

onUnmounted(() => {
  if (jamTimer) clearInterval(jamTimer)
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
        @agenda="bukaAgendaSesi"
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
            Data Induk Terintegrasi
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

      <!-- KEADAAN MEMUAT -->
      <section v-if="!stateV2.siap" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center shadow-xs">
        <p class="text-sm font-bold text-[#344054]">Memuat jadwal dari Data Induk…</p>
        <p class="mt-1 text-xs font-semibold text-[#667085]">Kelas, mapel, guru, siswa, jadwal, dan sesi minggu ini sedang diambil dari basis data.</p>
      </section>

      <!-- GURU AKTIF: penentu Jadwal Saya & pencatatan sesi -->
      <div v-if="stateV2.siap && bolehKelola" class="flex flex-wrap items-center gap-2.5 rounded-2xl border border-[#E7EBF2] bg-white px-4 py-3 shadow-xs">
        <label for="guru-aktif" class="text-xs font-bold text-[#344054]">Guru aktif</label>
        <select
          id="guru-aktif"
          v-model="guruAktifId"
          class="min-h-9 rounded-xl border border-[#D0D5DD] bg-[#F8FAFD] px-3 text-xs font-semibold text-[#101828] focus:border-[#1B5FD9] focus:bg-white focus:outline-none"
        >
          <option v-for="g in stateV2.guru[jenjang]" :key="g.id" :value="g.id">{{ g.nama }}</option>
        </select>
        <span class="text-[11px] font-semibold text-[#667085]">Tampilan &quot;Jadwal Saya&quot; dan tombol Mulai Mengajar mencatat sesi atas nama guru ini.</span>
      </div>

      <!-- VIEW KONTEN BERDASARKAN PERAN -->

      <template v-if="stateV2.siap">
      <!-- 1. Peran OPERATOR: Bisa switch antara Jadwal Sekolah dan Jadwal Saya -->
      <template v-if="role === 'operator'">
        <JadwalV2GradeTimetable
          v-if="activeSubmenu === 'grade'"
          :jenjang="jenjang"
          :selected-class="selectedClass[jenjang]"
          :editable="bolehKelola"
          :mine-teacher-name="guruSaya?.nama"
          :sim-day-idx="simDayIdx"
          :sim-min="simMin"
              @update:jenjang="jenjang = $event"
          @update:selected-class="selectedClass[jenjang] = $event"
          @open-create="slotBaru = $event || null; isCreateModalOpen = true"
        />

        <JadwalV2PersonalView
          v-else
          :jenjang="jenjang"
          :persona="currentPersona"
          :sim-day-idx="simDayIdx"
          :sim-min="simMin"
          :sessions="sesiRecord"
              @mulai="openMulaiSession"
          @akhiri="endLiveSession"
          @agenda="bukaAgendaSesi"
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
            Anda melihat <b>jadwal lengkap kelas perwalian Anda ({{ kelasWali }})</b> (Senin–Jumat, jam ke-1 s.d. terakhir) beserta <b>status kehadiran guru</b> di setiap jam pelajaran. Role Wali Kelas berfokus pada monitoring kelas — penugasan kurikulum dikelola oleh operator/admin.
          </div>
        </div>

        <JadwalV2GradeTimetable
          :jenjang="jenjang"
          :selected-class="kelasWali"
          :editable="false"
          :fixed-kelas="kelasWali"
          :mine-teacher-name="guruSaya?.nama"
          :sim-day-idx="simDayIdx"
          :sim-min="simMin"
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
          :sessions="sesiRecord"
              @mulai="openMulaiSession"
          @akhiri="endLiveSession"
          @agenda="bukaAgendaSesi"
        />
      </template>
      </template>
    </main>

    <!-- MODAL BUAT JADWAL MENGAJAR (OPERATOR) -->
    <JadwalV2CreateModal
      :is-open="isCreateModalOpen"
      :jenjang="jenjang"
      :current-class="selectedClass[jenjang]"
      :sim-day-idx="simDayIdxModal"
      :slot-awal="slotBaru"
      @close="isCreateModalOpen = false"
      @saved="handleScheduleSaved"
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
