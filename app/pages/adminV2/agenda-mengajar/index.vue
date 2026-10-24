<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import AgendaMengajarFilter from '~/components/adminV2/agenda-mengajar/AgendaMengajarFilter.vue'
import AgendaMengajarJournal from '~/components/adminV2/agenda-mengajar/AgendaMengajarJournal.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
import {
  calculateAgendaScore,
  useAgendaMengajar,
  type AgendaAttendance,
  type AgendaBook,
  type AgendaMode,
  type AgendaScore,
  type AgendaStudent,
  type AgendaTab,
  type AgendaTabData,
  type AttendanceStatus,
  type ScoreType
} from '~/composables/useAgendaMengajar'

definePageMeta({ layout: false, middleware: 'agenda-access' })
useHead({ title: 'Agenda Mengajar (F.32) — Admin Portal Darqia 9' })

const router = useRouter()
const client = useSupabaseClient()
const agenda = useAgendaMengajar()
const now = new Date()
const academicStartYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
const academicYear = `${academicStartYear}/${academicStartYear + 1}`
const emptyTabData = (): AgendaTabData => ({ students: [], meetings: [], attendance: [], scores: [] })

const jenjang = ref<'smp' | 'smk'>('smk')
const semester = ref<1 | 2>(1)
const activeTab = ref<AgendaTab>('pertemuan')
const scoreMode = ref<AgendaMode>('sementara')
const selectedTask = ref(1)
const selectedMeeting = ref(1)
const selectedClassId = ref('')
const selectedBookId = ref('')
const profileRole = ref('guru')
const books = ref<AgendaBook[]>([])
const tabData = ref<AgendaTabData>(emptyTabData())
const loadingContext = ref(true)
const loadingTab = ref(false)
const contextError = ref('')
const tabError = ref('')
const savingKeys = ref(new Set<string>())
const openFilter = ref<'kelas' | 'mapel' | 'semester' | 'meeting' | null>(null)
const isJournalOpen = ref(false)
const journalForm = ref({ pertemuan_ke: 1, tanggal: '', topik: '', kegiatan: '' })
const journalSaving = ref(false)
const isMegaOpen = ref(false)
const activeMegaGroup = ref<GroupItem | null>(null)
const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isNotifOpen = ref(false)
const isProfileOpen = ref(false)
const toastMessage = ref('')
const isToastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null
const scoreTimers = new Map<string, ReturnType<typeof setTimeout>>()
const pendingScoreSaves = new Map<string, () => Promise<void>>()
let tabRequestId = 0

const tabs: Array<{ id: AgendaTab; label: string; icon: string }> = [
  { id: 'pertemuan', label: 'Pertemuan', icon: 'cal' },
  { id: 'tugas', label: 'Nilai Tugas', icon: 'doc' },
  { id: 'ujian', label: 'PTS & PAS', icon: 'chart' },
  { id: 'rekap', label: 'Rekap', icon: 'book' }
]
const taskLabels = ['I', 'II', 'III', 'IV', 'V'] as const

const shellRole = computed<'superadmin' | 'guru'>(() => profileRole.value === 'guru' ? 'guru' : 'superadmin')
const isSemesterLocked = computed(() => semester.value === 2)
const currentBook = computed(() => books.value.find(book => book.buku_id === selectedBookId.value) || null)
const classOptions = computed(() => {
  const unique = new Map<string, string>()
  books.value.forEach(book => unique.set(book.kelas_id, book.kelas_nama))
  return [...unique.entries()].map(([id, name]) => ({ id, name }))
})
const subjectOptions = computed(() => books.value.filter(book => book.kelas_id === selectedClassId.value))
const students = computed(() => tabData.value.students || [])
const meetings = computed(() => tabData.value.meetings || [])
const scores = computed(() => tabData.value.scores || [])
const meetingMap = computed(() => new Map(meetings.value.map(meeting => [meeting.pertemuan_ke, meeting])))
const attendanceMap = computed(() => new Map((tabData.value.attendance || []).map(item => [`${item.siswa_id}:${item.pertemuan_ke}`, item.status])))
const scoreMap = computed(() => new Map(scores.value.map(item => [`${item.siswa_id}:${item.jenis}:${item.nomor ?? ''}`, item.nilai])))
const filledMeetingCount = computed(() => meetings.value.length)
const filledTaskCount = computed(() => new Set(scores.value.filter(item => item.jenis === 'tugas').map(item => item.nomor)).size)
const selectedMeetingData = computed(() => meetingMap.value.get(selectedMeeting.value))
const selectedMeetingLabel = computed(() => `Pertemuan ${selectedMeeting.value} · ${selectedMeetingData.value ? formatDate(selectedMeetingData.value.tanggal) : 'tanggal belum diisi'}`)
const selectedTaskLabel = computed(() => taskLabels[selectedTask.value - 1] ?? taskLabels[0])
const completeResultCount = computed(() => studentResults.value.filter(item => item.result.finalScore !== null).length)
const formattedToday = computed(() => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()))

const triggerToast = (message: string) => {
  toastMessage.value = message
  isToastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { isToastVisible.value = false }, 2800)
}

const closeAllPopovers = () => {
  isMegaOpen.value = false
  isSearchOpen.value = false
  isNotifOpen.value = false
  isProfileOpen.value = false
  openFilter.value = null
}

const toggleMega = (group: GroupItem) => {
  if (activeMegaGroup.value?.id === group.id && isMegaOpen.value) isMegaOpen.value = false
  else { activeMegaGroup.value = group; isMegaOpen.value = true }
}

const handleSelectModule = (title: string) => {
  closeAllPopovers()
  const destination = getAdminDestination(title)
  if (destination && destination !== '#') return router.push(destination)
  triggerToast(`${title} belum tersedia.`)
}

const loadProfileRole = async () => {
  const { data: isAdmin } = await client.rpc('agenda_is_admin')
  profileRole.value = isAdmin ? 'admin' : 'guru'
}

const loadContext = async () => {
  loadingContext.value = true
  contextError.value = ''
  tabData.value = emptyTabData()
  if (isSemesterLocked.value) {
    books.value = []
    selectedClassId.value = ''
    selectedBookId.value = ''
    loadingContext.value = false
    return
  }
  try {
    const result = await agenda.loadBooks(academicYear, semester.value, jenjang.value.toUpperCase() as 'SMP' | 'SMK')
    books.value = result
    if (!result.some(book => book.kelas_id === selectedClassId.value)) selectedClassId.value = result[0]?.kelas_id || ''
    const available = result.filter(book => book.kelas_id === selectedClassId.value)
    if (!available.some(book => book.buku_id === selectedBookId.value)) selectedBookId.value = available[0]?.buku_id || ''
  } catch (error: any) {
    books.value = []
    selectedClassId.value = ''
    selectedBookId.value = ''
    contextError.value = error?.message || 'Buku agenda tidak dapat dimuat.'
  } finally { loadingContext.value = false }
}

const loadCurrentTab = async () => {
  if (!selectedBookId.value || isSemesterLocked.value) { tabData.value = emptyTabData(); return }
  const requestId = ++tabRequestId
  const bookId = selectedBookId.value
  const tab = activeTab.value
  loadingTab.value = true
  tabError.value = ''
  try {
    const result = await agenda.loadTab(bookId, tab)
    if (requestId === tabRequestId) tabData.value = result
  } catch (error: any) {
    if (requestId === tabRequestId) {
      tabData.value = emptyTabData()
      tabError.value = error?.message || 'Data tab agenda tidak dapat dimuat.'
    }
  } finally {
    if (requestId === tabRequestId) loadingTab.value = false
  }
}

const selectClass = (classId: string) => {
  selectedClassId.value = classId
  selectedBookId.value = books.value.find(book => book.kelas_id === classId)?.buku_id || ''
  openFilter.value = null
}
const selectBook = (bookId: string) => { selectedBookId.value = bookId; openFilter.value = null }
const selectSemester = (value: 1 | 2) => {
  semester.value = value
  selectedClassId.value = ''
  selectedBookId.value = ''
  scoreMode.value = 'sementara'
  openFilter.value = null
  if (value === 2) triggerToast(`Semester 2 tahun ajaran ${academicYear} belum dimulai.`)
}
const selectJenjang = (value: 'smp' | 'smk') => { jenjang.value = value; selectedClassId.value = ''; selectedBookId.value = '' }
const setTab = (tab: AgendaTab) => { activeTab.value = tab; openFilter.value = null }

function formatDate(value: string) {
  if (!value) return 'Belum diisi'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}
const todayValue = () => {
  const date = new Date()
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase()
const meetingDateLabel = (meetingNumber: number, fallback: string, short = false) => {
  const date = meetingMap.value.get(meetingNumber)?.tanggal
  if (!date) return fallback
  const formatted = formatDate(date)
  return short ? formatted.split(' ').slice(0, 2).join(' ') : formatted
}
const attendanceStatus = (studentId: string, meetingNumber: number): AttendanceStatus => attendanceMap.value.get(`${studentId}:${meetingNumber}`) || 'H'
const presentCount = (studentId: string) => meetings.value.filter(meeting => attendanceStatus(studentId, meeting.pertemuan_ke) === 'H').length
const attendanceSummary = (meetingNumber: number) => {
  const summary: Record<AttendanceStatus, number> = { H: 0, S: 0, I: 0, A: 0 }
  students.value.forEach((student) => {
    const status = attendanceStatus(student.id, meetingNumber)
    summary[status] = (summary[status] ?? 0) + 1
  })
  return summary
}

const ensureMeeting = async (meetingNumber: number) => {
  if (meetingMap.value.has(meetingNumber) || !currentBook.value) return
  const meeting = { id: `baru-${meetingNumber}`, buku_id: currentBook.value.buku_id, pertemuan_ke: meetingNumber, tanggal: todayValue(), topik: '', kegiatan: '' }
  await agenda.saveMeeting(currentBook.value.buku_id, meeting)
  tabData.value.meetings.push(meeting)
}

const setAttendance = async (student: AgendaStudent, meetingNumber: number, status: AttendanceStatus) => {
  if (!currentBook.value) return
  const key = `${student.id}:${meetingNumber}`
  savingKeys.value = new Set(savingKeys.value).add(key)
  try {
    await ensureMeeting(meetingNumber)
    await agenda.saveAttendance(currentBook.value.buku_id, meetingNumber, student.id, status)
    const index = tabData.value.attendance.findIndex(item => item.siswa_id === student.id && item.pertemuan_ke === meetingNumber)
    const existing = index >= 0 ? tabData.value.attendance[index] : undefined
    if (status === 'H' && existing) tabData.value.attendance.splice(index, 1)
    else if (status !== 'H' && existing) existing.status = status
    else if (status !== 'H') tabData.value.attendance.push({ id: `baru-${key}`, buku_id: currentBook.value.buku_id, pertemuan_ke: meetingNumber, siswa_id: student.id, status } as AgendaAttendance)
  } catch (error: any) { triggerToast(error?.message || 'Kehadiran gagal disimpan.') }
  finally { const next = new Set(savingKeys.value); next.delete(key); savingKeys.value = next }
}

const cycleAttendance = (student: AgendaStudent, meetingNumber: number) => {
  const order: AttendanceStatus[] = ['H', 'S', 'I', 'A']
  const current = attendanceStatus(student.id, meetingNumber)
  const next = order[(order.indexOf(current) + 1) % order.length] ?? 'H'
  return setAttendance(student, meetingNumber, next)
}

const openJournal = (meetingNumber: number) => {
  const meeting = meetingMap.value.get(meetingNumber)
  journalForm.value = { pertemuan_ke: meetingNumber, tanggal: meeting?.tanggal || todayValue(), topik: meeting?.topik || '', kegiatan: meeting?.kegiatan || '' }
  isJournalOpen.value = true
  nextTick(() => document.querySelector<HTMLInputElement>('#agenda-journal-date')?.focus())
}

const saveJournal = async () => {
  if (!currentBook.value || !journalForm.value.tanggal) return
  journalSaving.value = true
  try {
    await agenda.saveMeeting(currentBook.value.buku_id, journalForm.value)
    const existing = tabData.value.meetings.find(item => item.pertemuan_ke === journalForm.value.pertemuan_ke)
    if (existing) Object.assign(existing, journalForm.value)
    else tabData.value.meetings.push({ id: `baru-${journalForm.value.pertemuan_ke}`, buku_id: currentBook.value.buku_id, ...journalForm.value })
    isJournalOpen.value = false
    triggerToast(`Jurnal pertemuan ${journalForm.value.pertemuan_ke} tersimpan.`)
  } catch (error: any) { triggerToast(error?.message || 'Jurnal gagal disimpan.') }
  finally { journalSaving.value = false }
}

const scoreValue = (studentId: string, type: ScoreType, number: number | null = null) => scoreMap.value.get(`${studentId}:${type}:${number ?? ''}`) || ''
const numericScore = (studentId: string, type: 'pts' | 'pas') => { const value = scoreValue(studentId, type); return value === '' ? null : Number(value) }
const updateLocalScore = (studentId: string, type: ScoreType, number: number | null, value: string) => {
  const index = tabData.value.scores.findIndex(item => item.siswa_id === studentId && item.jenis === type && item.nomor === number)
  if (!value.trim()) { if (index >= 0) tabData.value.scores.splice(index, 1); return }
  const existing = index >= 0 ? tabData.value.scores[index] : undefined
  if (existing) existing.nilai = value
  else tabData.value.scores.push({ id: `baru-${studentId}-${type}-${number ?? ''}`, buku_id: currentBook.value?.buku_id || '', siswa_id: studentId, jenis: type, nomor: number, nilai: value } as AgendaScore)
}

const queueScore = (studentId: string, type: ScoreType, rawValue: string, number: number | null = null) => {
  if (!currentBook.value) return
  const bookId = currentBook.value.buku_id
  const numeric = ['tugas', 'pts', 'pas'].includes(type)
  const value = numeric && rawValue !== '' ? String(Math.max(0, Math.min(100, Math.round(Number(rawValue) || 0)))) : rawValue.slice(0, 120)
  updateLocalScore(studentId, type, number, value)
  const key = `${studentId}:${type}:${number ?? ''}`
  const action = async () => {
    try { await agenda.saveScore(bookId, studentId, type, value, number) }
    catch (error: any) { triggerToast(error?.message || 'Nilai gagal disimpan.') }
    finally { pendingScoreSaves.delete(key); scoreTimers.delete(key) }
  }
  pendingScoreSaves.set(key, action)
  const timer = scoreTimers.get(key)
  if (timer) clearTimeout(timer)
  scoreTimers.set(key, setTimeout(action, 450))
}

const flushScoreSaves = async () => {
  const pending = [...pendingScoreSaves.entries()]
  pending.forEach(([key]) => { const timer = scoreTimers.get(key); if (timer) clearTimeout(timer) })
  await Promise.all(pending.map(([, action]) => action()))
  triggerToast('Nilai tersimpan. Rekap F.32 sudah diperbarui.')
}
const taskValues = (studentId: string) => [1, 2, 3, 4, 5].map(number => scoreValue(studentId, 'tugas', number)).filter(Boolean).map(Number)
const taskAverage = (studentId: string) => { const values = taskValues(studentId); return values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length * 10) / 10 : null }
const classAverage = (type: 'tugas' | 'pts' | 'pas', number: number | null = null) => {
  const values = students.value.map(student => scoreValue(student.id, type, number)).filter(Boolean).map(Number)
  return values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length * 10) / 10 : null
}
const scoreTone = (value: string) => {
  if (!value || !currentBook.value) return ''
  if (Number(value) < currentBook.value.kkm) return 'low'
  if (Number(value) >= currentBook.value.kkm + 10) return 'high'
  return 'middle'
}
const studentResults = computed(() => students.value.map(student => ({
  student,
  result: calculateAgendaScore({ present: presentCount(student.id), meetingCount: filledMeetingCount.value, tasks: taskValues(student.id), pts: numericScore(student.id, 'pts'), pas: numericScore(student.id, 'pas'), mode: scoreMode.value })
})))

watch([jenjang, semester], loadContext)
watch([selectedBookId, activeTab], loadCurrentTab)
onMounted(async () => { await loadProfileRole(); await loadContext() })
onBeforeUnmount(() => { if (toastTimer) clearTimeout(toastTimer); scoreTimers.forEach(timer => clearTimeout(timer)) })
</script>

<template>
  <div class="agenda-page min-h-screen bg-[#F3F5F9] pb-24 font-sans text-[#101828] antialiased lg:pb-12" :data-jenjang="jenjang" @click="closeAllPopovers">
    <div class="sticky top-0 z-50 w-full" @click.stop>
      <AdminV2Header :jenjang="jenjang" :role="shellRole" :groups="GROUPS" :active-group-id="activeMegaGroup?.id || 'kepegawaian'" current-route="kepegawaian" :is-mega-open="isMegaOpen" @update:jenjang="selectJenjang" @toggle-mega="toggleMega" @open-mobile-menu="isMobileMenuOpen = true" @toggle-search="isSearchOpen = !isSearchOpen" @toggle-notif="isNotifOpen = !isNotifOpen" @toggle-profile="isProfileOpen = !isProfileOpen" />
      <AdminV2Breadcrumb :items="[{ label: 'Portal Admin', to: '/adminV2' }, { label: 'Kepegawaian' }, { label: 'Agenda Mengajar' }]" :badge="jenjang === 'smp' ? 'SMP IT BCA' : 'SMK IT Attaqwa 9'" :jenjang="jenjang" />
      <AdminV2MegaPanel :open="isMegaOpen" :group="activeMegaGroup" :jenjang="jenjang" @close="isMegaOpen = false" @select-item="handleSelectModule" />
    </div>
    <main class="mx-auto max-w-[1440px] space-y-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <header class="flex flex-col justify-between gap-3.5 sm:flex-row sm:items-center">
        <div><span class="grade-badge" :class="jenjang">{{ jenjang.toUpperCase() }}</span><h1 class="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">Agenda Mengajar</h1><p class="mt-1 text-xs font-medium text-[#667085]">Jurnal pertemuan, daftar hadir &amp; penilaian F.32 &bull; {{ jenjang === 'smp' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9' }} &bull; Tahun Ajaran {{ academicYear }}</p></div>
        <div class="hidden items-center gap-2 sm:flex"><span class="date-pill">{{ formattedToday }}</span><span class="version-pill">Agenda F.32</span></div>
      </header>
      <nav class="agenda-tabs" role="tablist" aria-label="Navigasi Agenda Mengajar"><button v-for="tab in tabs" :key="tab.id" type="button" role="tab" :aria-selected="activeTab === tab.id" :class="{ active: activeTab === tab.id }" @click="setTab(tab.id)"><AdminV2Icon :name="tab.icon" :size="16" /><span>{{ tab.label }}</span></button></nav>
      <AgendaMengajarFilter
        :jenjang="jenjang"
        :semester="semester"
        :open-filter="openFilter"
        :current-book="currentBook"
        :class-options="classOptions"
        :subject-options="subjectOptions"
        :selected-class-id="selectedClassId"
        :selected-book-id="selectedBookId"
        :filled-meeting-count="filledMeetingCount"
        :filled-task-count="filledTaskCount"
        @update:open-filter="openFilter = $event"
        @select-class="selectClass"
        @select-book="selectBook"
        @select-semester="selectSemester"
      />
      <section v-if="isSemesterLocked" class="state-card warning" role="alert"><AdminV2Icon name="lock" :size="24" /><div><h2>Semester 2 belum dimulai</h2><p>Semester 2 tahun ajaran {{ academicYear }} belum dimulai. Pilih Semester 1 untuk membuka buku agenda.</p></div></section>
      <section v-else-if="loadingContext || loadingTab" class="state-card" aria-live="polite"><div class="loading-bars" aria-hidden="true"><i /><i /><i /></div><div><h2>Memuat buku agenda</h2><p>Data kelas, jurnal, dan nilai sedang disiapkan.</p></div></section>
      <section v-else-if="contextError || tabError" class="state-card error" role="alert"><AdminV2Icon name="alert" :size="24" /><div><h2>Data agenda belum dapat dibuka</h2><p>{{ contextError || tabError }}</p><button type="button" @click="contextError ? loadContext() : loadCurrentTab()">Coba lagi</button></div></section>
      <section v-else-if="!currentBook" class="state-card"><AdminV2Icon name="book" :size="24" /><div><h2>Tidak ada buku agenda</h2><p>Tidak ada penugasan kelas dan mata pelajaran dalam lingkup akun ini.</p></div></section>
      <template v-else>
        <template v-if="activeTab === 'pertemuan'">
          <div class="grid-toolbar"><p class="guide"><AdminV2Icon name="info" :size="14" /><span>Persis lembar F.32: ketuk sel untuk mengganti status hadir (H → S → I → A), tersimpan otomatis. Ketuk nomor pertemuan di kepala kolom untuk mengisi jurnalnya.</span></p><button type="button" class="primary-button" @click="loadCurrentTab"><AdminV2Icon name="check" :size="15" /> Update Data Nilai</button></div>
          <div class="legend"><span><i class="status-h" />Hadir</span><span><i class="status-s" />Sakit</span><span><i class="status-i" />Izin</span><span><i class="status-a" />Alpa</span><span class="legend-note">Sel redup = jurnal pertemuan belum diisi</span></div>
          <section class="agenda-card attendance-desktop">
            <div class="table-scroll"><table class="attendance-table"><thead><tr><th class="sticky-name">Nama Siswa</th><th>No. Induk</th><th>L/P</th><th v-for="number in 20" :key="number" class="meeting-heading"><button type="button" @click="openJournal(number)">{{ number }}<small>{{ meetingDateLabel(number, '—', true) }}</small></button></th><th>Jml<br>Hadir</th></tr></thead><tbody><tr v-for="student in students" :key="student.id"><td class="sticky-name student-name-cell"><span class="student-avatar">{{ initials(student.name) }}</span><span><b>{{ student.name }}</b><small>NISN {{ student.nisn }}</small></span></td><td>{{ student.nis || '—' }}</td><td>{{ student.gender }}</td><td v-for="number in 20" :key="number"><button type="button" class="attendance-cell" :class="[`value-${attendanceStatus(student.id, number).toLowerCase()}`, { fresh: !meetingMap.has(number), saving: savingKeys.has(`${student.id}:${number}`) }]" :disabled="savingKeys.has(`${student.id}:${number}`)" :aria-label="`Kehadiran ${student.name}, pertemuan ${number}: ${attendanceStatus(student.id, number)}`" @click="cycleAttendance(student, number)">{{ attendanceStatus(student.id, number) }}</button></td><td class="present-total"><b>{{ presentCount(student.id) }}</b>/{{ filledMeetingCount }}</td></tr></tbody></table></div>
          </section>
          <section class="agenda-card attendance-mobile">
            <div class="mobile-meeting-bar"><div class="custom-dropdown"><button type="button" class="dropdown-trigger light" @click.stop="openFilter = openFilter === 'meeting' ? null : 'meeting'"><span>{{ selectedMeetingLabel }}</span><AdminV2Icon name="chev" :size="14" /></button><div v-if="openFilter === 'meeting'" class="dropdown-menu" @click.stop><button v-for="number in 20" :key="number" type="button" :class="{ active: selectedMeeting === number }" @click="selectedMeeting = number; openFilter = null"><span>Pertemuan {{ number }} · {{ meetingDateLabel(number, 'tanggal belum diisi') }}</span><AdminV2Icon v-if="selectedMeeting === number" name="check" :size="14" /></button></div></div><button type="button" class="secondary-button" @click="openJournal(selectedMeeting)"><AdminV2Icon name="pencil" :size="14" /> Jurnal</button></div>
            <p class="mobile-meeting-meta">{{ selectedMeetingData?.topik || 'Topik belum diisi' }} · {{ attendanceSummary(selectedMeeting).H }} hadir dari {{ students.length }} siswa</p>
            <div v-for="student in students" :key="student.id" class="student-row mobile-attendance-row"><span class="student-avatar">{{ initials(student.name) }}</span><span class="student-copy"><b>{{ student.name }}</b><small>NISN {{ student.nisn }}</small></span><span class="attendance-segments"><button v-for="status in (['H', 'S', 'I', 'A'] as AttendanceStatus[])" :key="status" type="button" :class="{ active: attendanceStatus(student.id, selectedMeeting) === status, [`value-${status.toLowerCase()}`]: true }" :disabled="savingKeys.has(`${student.id}:${selectedMeeting}`)" @click="setAttendance(student, selectedMeeting, status)">{{ status }}</button></span></div>
          </section>
          <p class="footnote">20 kolom pertemuan sama dengan kolom tatap muka di kertas F.32. Kehadiran mengalir otomatis ke Rekap (bobot Pertemuan 30%).</p>
        </template>

        <template v-else-if="activeTab === 'tugas'">
          <div class="task-chips" role="group" aria-label="Pilih tugas"><button v-for="(label, index) in taskLabels" :key="label" type="button" :class="{ active: selectedTask === index + 1 }" @click="selectedTask = index + 1">Tugas {{ label }}<span v-if="!scores.some(item => item.jenis === 'tugas' && item.nomor === index + 1)"> · kosong</span></button></div>
          <section class="agenda-card score-card">
            <div class="score-heading"><div><h2>Nilai Tugas {{ selectedTaskLabel }}</h2><p>{{ currentBook.mapel_nama }} · {{ currentBook.kelas_nama }} · rata-rata kelas <b>{{ classAverage('tugas', selectedTask) ?? '—' }}</b></p></div></div>
            <div v-for="student in students" :key="student.id" class="student-row score-row" :class="scoreTone(scoreValue(student.id, 'tugas', selectedTask))"><span class="student-avatar">{{ initials(student.name) }}</span><span class="student-copy"><b>{{ student.name }}</b><small>NISN {{ student.nisn }}</small></span><span class="score-meta"><span class="task-dots"><i v-for="number in 5" :key="number" :class="{ filled: scoreValue(student.id, 'tugas', number) !== '' }" /></span><small>{{ taskAverage(student.id) === null ? 'Belum ada nilai tugas' : `Rata-rata tugas: ${taskAverage(student.id)}` }}</small></span><input type="number" min="0" max="100" step="1" inputmode="numeric" placeholder="—" :value="scoreValue(student.id, 'tugas', selectedTask)" :class="scoreTone(scoreValue(student.id, 'tugas', selectedTask))" :aria-label="`Nilai tugas ${student.name}`" @input="queueScore(student.id, 'tugas', ($event.target as HTMLInputElement).value, selectedTask)"></div>
            <div class="save-bar"><span>Nilai tersimpan otomatis saat diketik.</span><button type="button" class="primary-button" @click="flushScoreSaves"><AdminV2Icon name="check" :size="15" /> Simpan Nilai</button></div>
          </section>
          <p class="footnote">Di kertas F.32 ada 5 kolom tugas (I–V). Nilai tugas mengalir ke Rekap sebagai rata-rata tugas yang terisi (bobot 20%).</p>
        </template>

        <template v-else-if="activeTab === 'ujian'">
          <p class="guide"><AdminV2Icon name="info" :size="14" /><span>PTS dikerjakan di tengah semester; PAS di akhir semester dan dibuka melalui konfigurasi kalender akademik. Keduanya satu nilai per siswa, sama seperti kolom PTS/PAS di kertas F.32.</span></p>
          <div class="exam-grid">
            <section class="agenda-card score-card"><div class="score-heading"><div><h2>PTS (Penilaian Tengah Semester) <span>Bobot 50% sementara · 10% akhir</span></h2><p>Rata-rata kelas <b>{{ classAverage('pts') ?? '—' }}</b></p></div></div><div v-for="student in students" :key="student.id" class="student-row score-row" :class="scoreTone(scoreValue(student.id, 'pts'))"><span class="student-avatar">{{ initials(student.name) }}</span><span class="student-copy"><b>{{ student.name }}</b><small>NISN {{ student.nisn }}</small></span><span class="score-meta"><small :class="{ complete: scoreValue(student.id, 'pts') !== '' }">{{ scoreValue(student.id, 'pts') !== '' ? 'Sudah dinilai' : 'Belum dinilai' }}</small></span><input type="number" min="0" max="100" inputmode="numeric" placeholder="—" :value="scoreValue(student.id, 'pts')" :class="scoreTone(scoreValue(student.id, 'pts'))" @input="queueScore(student.id, 'pts', ($event.target as HTMLInputElement).value)"></div></section>
            <section class="agenda-card score-card" :class="{ locked: !currentBook.pas_terbuka }"><div class="score-heading"><div><h2>PAS (Penilaian Akhir Semester) <span>Bobot 40% akhir</span></h2><p>Rata-rata kelas <b>{{ classAverage('pas') ?? '—' }}</b></p></div><span v-if="!currentBook.pas_terbuka" class="status-chip waiting"><AdminV2Icon name="lock" :size="12" /> Terkunci</span></div><div v-if="!currentBook.pas_terbuka" class="lock-box"><AdminV2Icon name="lock" :size="24" /><div><b>PAS masih terkunci</b><span>Periode PAS belum dibuka pada konfigurasi kalender akademik semester ini.</span></div></div><div v-for="student in students" :key="student.id" class="student-row score-row" :class="scoreTone(scoreValue(student.id, 'pas'))"><span class="student-avatar">{{ initials(student.name) }}</span><span class="student-copy"><b>{{ student.name }}</b><small>NISN {{ student.nisn }}</small></span><span class="score-meta"><small :class="{ complete: scoreValue(student.id, 'pas') !== '' }">{{ scoreValue(student.id, 'pas') !== '' ? 'Sudah dinilai' : 'Belum dinilai' }}</small></span><input type="number" min="0" max="100" inputmode="numeric" placeholder="—" :disabled="!currentBook.pas_terbuka" :value="scoreValue(student.id, 'pas')" :class="scoreTone(scoreValue(student.id, 'pas'))" @input="queueScore(student.id, 'pas', ($event.target as HTMLInputElement).value)"></div></section>
          </div>
          <div class="agenda-card save-bar standalone"><span>Nilai tersimpan otomatis saat diketik.</span><button type="button" class="primary-button" @click="flushScoreSaves"><AdminV2Icon name="check" :size="15" /> Simpan Nilai</button></div>
        </template>

        <template v-else>
          <div class="mode-selector" role="group" aria-label="Mode nilai"><button type="button" :class="{ active: scoreMode === 'sementara' }" @click="scoreMode = 'sementara'">Nilai Sementara<small>sebelum PAS · PTS 50%</small></button><button type="button" :class="{ active: scoreMode === 'akhir' }" @click="scoreMode = 'akhir'">Nilai Akhir<small>setelah PAS · PAS 40%</small></button></div>
          <p class="guide"><AdminV2Icon name="info" :size="14" /><span>Rekap ini cermin tabel F.32: S* = skor mentah, N* = nilai ternormalisasi (0–100). <b>P</b> (predikat) dan <b>A</b> (sikap) diisi langsung oleh guru.</span></p>
          <div class="summary-grid"><div><span>{{ scoreMode === 'sementara' ? 'Nilai Sementara Lengkap' : 'Nilai Akhir Lengkap' }}</span><b>{{ completeResultCount }}/{{ students.length }} siswa</b><small>dari seluruh komponen mode ini</small></div><div><span>KKM {{ currentBook.kelas_nama }}</span><b>{{ currentBook.kkm }}</b><small>batas tuntas kelas ini</small></div><div><span>Bobot Mode {{ scoreMode === 'sementara' ? 'Sementara' : 'Akhir' }}</span><b class="weight-copy">Pertemuan 30% · Tugas 20% · PTS {{ scoreMode === 'sementara' ? '50%' : '10% · PAS 40%' }}</b><small>ketentuan penilaian sekolah</small></div></div>
          <section class="agenda-card recap-desktop"><div class="table-scroll"><table class="recap-table"><thead><tr><th>Nama Siswa</th><th colspan="2">Pertemuan 30%<br><small>S* · N*</small></th><th colspan="2">Tugas 20%<br><small>S* · N*</small></th><th>PTS {{ scoreMode === 'sementara' ? '50%' : '10%' }}<br><small>N*</small></th><th v-if="scoreMode === 'akhir'">PAS 40%<br><small>N*</small></th><th>{{ scoreMode === 'sementara' ? 'Nilai Sementara' : 'Nilai Akhir' }}<br><small>K</small></th><th>P</th><th>A</th><th>Ket.</th></tr></thead><tbody><tr v-for="item in studentResults" :key="item.student.id"><td class="recap-name"><b>{{ item.student.name }}</b><span>NISN {{ item.student.nisn }}</span></td><td>{{ item.result.present }}/{{ item.result.meetingCount }}</td><td><b>{{ item.result.attendanceNormalized }}</b></td><td>{{ item.result.taskCount ? item.result.taskSum : '—' }}</td><td><b>{{ item.result.taskNormalized ?? '—' }}</b></td><td>{{ item.result.pts ?? '—' }}</td><td v-if="scoreMode === 'akhir'">{{ item.result.pas ?? '—' }}</td><td class="final-score"><b v-if="item.result.finalScore !== null">{{ item.result.finalScore }}</b><span v-else>—</span></td><td><input type="text" maxlength="120" placeholder="—" :value="scoreValue(item.student.id, 'predikat')" @input="queueScore(item.student.id, 'predikat', ($event.target as HTMLInputElement).value)"></td><td><input type="text" maxlength="120" placeholder="—" :value="scoreValue(item.student.id, 'sikap')" @input="queueScore(item.student.id, 'sikap', ($event.target as HTMLInputElement).value)"></td><td><span v-if="item.result.finalScore === null" class="status-chip waiting">Menunggu {{ item.result.missing }}</span><span v-else-if="item.result.finalScore >= currentBook.kkm" class="status-chip success">Tuntas</span><span v-else class="status-chip danger">Belum Tuntas</span></td></tr></tbody></table></div></section>
          <div class="recap-mobile"><section v-for="item in studentResults" :key="item.student.id" class="agenda-card recap-card"><div class="recap-card-heading"><span class="student-avatar">{{ initials(item.student.name) }}</span><span class="student-copy"><b>{{ item.student.name }}</b><small>NISN {{ item.student.nisn }}</small></span><span v-if="item.result.finalScore === null" class="status-chip waiting">Menunggu {{ item.result.missing }}</span><span v-else-if="item.result.finalScore >= currentBook.kkm" class="status-chip success">Tuntas</span><span v-else class="status-chip danger">Belum Tuntas</span></div><div class="recap-values" :class="{ four: scoreMode === 'akhir' }"><div><span>Pertemuan N*</span><b>{{ item.result.attendanceNormalized }}</b></div><div><span>Tugas N*</span><b>{{ item.result.taskNormalized ?? '—' }}</b></div><div><span>PTS</span><b>{{ item.result.pts ?? '—' }}</b></div><div v-if="scoreMode === 'akhir'"><span>PAS</span><b>{{ item.result.pas ?? '—' }}</b></div></div><div class="recap-text-fields"><label>Predikat<input type="text" maxlength="120" placeholder="Belum diisi" :value="scoreValue(item.student.id, 'predikat')" @input="queueScore(item.student.id, 'predikat', ($event.target as HTMLInputElement).value)"></label><label>Sikap<input type="text" maxlength="120" placeholder="Belum diisi" :value="scoreValue(item.student.id, 'sikap')" @input="queueScore(item.student.id, 'sikap', ($event.target as HTMLInputElement).value)"></label></div><div class="recap-final"><span>{{ scoreMode === 'sementara' ? 'Nilai Sementara K' : 'Nilai Akhir K' }}</span><b>{{ item.result.finalScore ?? '—' }}</b></div></section></div>
          <p class="footnote">Ketentuan bobot sekolah — Sementara: Pertemuan 30% + Tugas 20% + PTS 50%. Akhir: Pertemuan 30% + Tugas 20% + PTS 10% + PAS 40%. K hanya tampil setelah seluruh komponen mode terisi.</p>
        </template>
      </template>
    </main>
    <AgendaMengajarJournal
      :open="isJournalOpen"
      :book="currentBook"
      :form="journalForm"
      :saving="journalSaving"
      :summary="attendanceSummary(journalForm.pertemuan_ke)"
      @close="isJournalOpen = false"
      @save="saveJournal"
      @update:form="journalForm = $event"
    />
    <AdminV2BottomNav :role="shellRole" :jenjang="jenjang" @open-menu="isMobileMenuOpen = true" @nav-click="handleSelectModule" />
    <AdminV2MobileMenu :open="isMobileMenuOpen" :role="shellRole" :jenjang="jenjang" :groups="GROUPS" @close="isMobileMenuOpen = false" @select-item="handleSelectModule" />
    <AdminV2Popovers :is-search-open="isSearchOpen" :is-notif-open="isNotifOpen" :is-profile-open="isProfileOpen" :role="shellRole" @close="closeAllPopovers" @toast="triggerToast" />
    <AdminV2Toast :visible="isToastVisible" :message="toastMessage" />
  </div>
</template>

<style scoped>
.agenda-page{--ink:#101828;--ink-2:#344054;--ink-3:#667085;--line:#E4E7EC}
button,input,textarea{font-family:inherit}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid rgba(37,99,235,.28);outline-offset:2px}
.grade-badge,.date-pill,.version-pill{display:inline-flex;border-radius:999px;font-size:10.5px;font-weight:800}.grade-badge{padding:2px 10px;letter-spacing:.06em}.grade-badge.smk{border:1px solid #B2CCFF;background:#EFF4FF;color:#1B5FD9}.grade-badge.smp{border:1px solid #A6E9C5;background:#E7F6ED;color:#166534}.date-pill,.version-pill{border:1px solid #E7EBF2;background:#fff;padding:6px 12px;color:#667085}.version-pill{border-style:dashed;border-color:#CBD5E1;color:#475467}
.agenda-tabs{display:flex;gap:4px;overflow-x:auto;border:1px solid var(--line);border-radius:16px;background:#EEF2F7;padding:5px;scrollbar-width:none}.agenda-tabs::-webkit-scrollbar{display:none}.agenda-tabs button{display:inline-flex;flex-shrink:0;align-items:center;gap:8px;border-radius:11px;padding:9px 15px;color:#475467;font-size:12.5px;font-weight:600}.agenda-tabs button.active{background:#fff;color:var(--ink);font-weight:700;box-shadow:0 1px 4px rgba(16,24,40,.14)}
.custom-dropdown{position:relative;min-width:0}.dropdown-trigger{display:flex;min-height:42px;width:100%;align-items:center;justify-content:space-between;gap:10px;border:1px solid rgba(255,255,255,.28);border-radius:12px;background:#fff;padding:0 12px;color:var(--ink);font-size:13px;font-weight:650;text-align:left}.dropdown-trigger span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dropdown-trigger.light{border-color:var(--line)}.dropdown-menu{position:absolute;z-index:70;top:calc(100% + 6px);left:0;right:0;max-height:260px;overflow:auto;border:1px solid var(--line);border-radius:12px;background:#fff;padding:5px;box-shadow:0 18px 36px -16px rgba(16,24,40,.35)}.dropdown-menu button{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;border-radius:9px;padding:9px 10px;color:var(--ink-2);font-size:12.5px;font-weight:600;text-align:left}.dropdown-menu button:hover,.dropdown-menu button.active{background:#EFF4FF;color:#1D4ED8}.dropdown-menu p{padding:12px;color:var(--ink-3);font-size:12px}
.state-card{display:flex;align-items:flex-start;gap:14px;border:1px solid var(--line);border-radius:16px;background:#fff;padding:22px;color:#475467}.state-card h2{color:var(--ink);font-size:15px;font-weight:750}.state-card p{margin-top:4px;max-width:70ch;font-size:12.5px;line-height:1.6}.state-card.warning{border-color:#F2D492;background:#FFFBEB;color:#92600A}.state-card.error{border-color:#F5C6C0;background:#FFF8F7;color:#B42318}.state-card button{margin-top:10px;border-radius:10px;background:#fff;padding:8px 12px;color:var(--ink);font-size:12px;font-weight:700}.loading-bars{display:flex;height:30px;align-items:flex-end;gap:4px}.loading-bars i{display:block;width:5px;border-radius:4px;background:#2563EB;animation:loading 900ms ease-in-out infinite}.loading-bars i:nth-child(1){height:12px}.loading-bars i:nth-child(2){height:24px;animation-delay:120ms}.loading-bars i:nth-child(3){height:17px;animation-delay:240ms}@keyframes loading{50%{opacity:.3;transform:scaleY(.72)}}
.agenda-card{border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,.06)}.guide{display:flex;align-items:flex-start;gap:7px;border:1px solid #CFE0FB;border-radius:13px;background:#EFF6FF;padding:11px 13px;color:#1E40AF;font-size:12px;font-weight:600;line-height:1.65}.guide svg{margin-top:2px;flex-shrink:0}.grid-toolbar{display:flex;align-items:stretch;gap:10px}.grid-toolbar .guide{flex:1}.primary-button,.secondary-button{display:inline-flex;min-height:40px;align-items:center;justify-content:center;gap:7px;border-radius:11px;padding:9px 14px;font-size:12px;font-weight:750}.primary-button{background:#2563EB;color:#fff}.primary-button:hover{background:#1D4ED8}.primary-button:disabled{cursor:not-allowed;opacity:.55}.secondary-button{border:1px solid var(--line);background:#fff;color:var(--ink-2)}
.legend{display:flex;flex-wrap:wrap;align-items:center;gap:14px;color:var(--ink-3);font-size:11.5px;font-weight:700}.legend span{display:inline-flex;align-items:center}.legend i{height:11px;width:11px;border-radius:4px;margin-right:5px}.status-h{background:#BFE8D2}.status-s{background:#FBE3B8}.status-i{background:#C9DBFB}.status-a{background:#F8C9C9}.legend .legend-note{font-weight:600}.attendance-desktop{overflow:hidden;padding:6px 0}.table-scroll{overflow-x:auto}.attendance-table{width:100%;min-width:1180px;border-collapse:separate;border-spacing:0;font-size:12px}.attendance-table th,.attendance-table td{border-bottom:1px solid var(--line);padding:5px 4px;color:var(--ink-2);font-weight:600;text-align:center;white-space:nowrap}.attendance-table thead th{background:#F2F6FC;color:var(--ink-3);font-size:10.5px;font-weight:700;letter-spacing:.03em;text-transform:uppercase}.attendance-table .sticky-name{position:sticky;left:0;z-index:2;min-width:176px;background:#fff;text-align:left;box-shadow:1px 0 0 var(--line)}.attendance-table thead .sticky-name{z-index:3;background:#F2F6FC}.meeting-heading button{border-radius:7px;padding:2px 3px;color:var(--ink-3);font-size:11.5px;font-weight:700;line-height:1.3}.meeting-heading button:hover{background:#E3EBFA;color:#1D4ED8}.meeting-heading small{display:block;font-size:8.5px;font-weight:600;letter-spacing:0;text-transform:none}.student-name-cell{display:flex;align-items:center;gap:9px}.student-name-cell>span:last-child{display:flex;min-width:0;flex-direction:column}.student-name-cell b{max-width:125px;overflow:hidden;color:var(--ink);font-size:12px;text-overflow:ellipsis}.student-name-cell small{color:var(--ink-3);font-size:10px}.student-avatar{display:inline-flex;height:36px;width:36px;flex-shrink:0;align-items:center;justify-content:center;border-radius:11px;background:#EAF0FE;color:#1D4ED8;font-size:12px;font-weight:750}.attendance-cell{height:27px;width:27px;border-radius:8px;font-size:11.5px;font-weight:750}.attendance-cell:hover{transform:scale(1.12)}.value-h{background:#E7F6EF;color:#027A48}.value-s{background:#FEF3E2;color:#B54708}.value-i{background:#EAF0FE;color:#1D4ED8}.value-a{background:#FDECEC;color:#B42318}.attendance-cell.fresh{opacity:.4}.attendance-cell.saving{cursor:wait;opacity:.45}.present-total{background:#F8FAFF}
.attendance-mobile{display:none}.mobile-meeting-bar{display:flex;align-items:center;gap:9px}.mobile-meeting-bar .custom-dropdown{flex:1}.mobile-meeting-meta{margin:8px 0 6px;color:var(--ink-3);font-size:12px;font-weight:600;line-height:1.5}.student-row{display:flex;align-items:center;gap:11px;border-bottom:1px solid var(--line);padding:9px 2px}.student-row:last-child{border-bottom:0}.student-copy{min-width:0;flex:1}.student-copy b{display:block;overflow:hidden;color:var(--ink);font-size:13px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.student-copy small{color:var(--ink-3);font-size:11px;font-weight:600}.attendance-segments{display:inline-flex;flex-shrink:0;gap:2px;border-radius:10px;background:#EEF2F7;padding:3px}.attendance-segments button{height:28px;width:30px;border-radius:8px;background:transparent;color:var(--ink-3);font-size:12px;font-weight:750}.attendance-segments button.active.value-h{background:#027A48;color:#fff}.attendance-segments button.active.value-s{background:#DC8A03;color:#fff}.attendance-segments button.active.value-i{background:#1D4ED8;color:#fff}.attendance-segments button.active.value-a{background:#B42318;color:#fff}
.footnote{margin-top:14px;color:var(--ink-3);font-size:11.5px;font-weight:600;line-height:1.6}.task-chips{display:flex;flex-wrap:wrap;gap:7px}.task-chips button{border:1px solid var(--line);border-radius:999px;background:#fff;padding:7px 12px;color:var(--ink-2);font-size:11.5px;font-weight:700}.task-chips button.active{border-color:#0F2042;background:#0F2042;color:#fff}.score-card{padding:18px}.score-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px}.score-heading h2{color:var(--ink);font-size:15px;font-weight:750}.score-heading h2 span{display:inline-flex;border-radius:999px;background:#EAF0FE;padding:4px 9px;color:#1D4ED8;font-size:10.5px;white-space:nowrap}.score-heading p{margin-top:2px;color:var(--ink-3);font-size:12px;font-weight:600}.score-row{position:relative;margin:7px 0;border:1px solid transparent;border-radius:13px;background:#F8FAFC;padding:10px 12px 10px 17px}.score-row::before{position:absolute;top:11px;bottom:11px;left:0;width:3.5px;border-radius:99px;background:#D8DEE9;content:""}.score-row.low::before{background:#E5484D}.score-row.middle::before{background:#E8A93D}.score-row.high::before{background:#12B76A}.score-row:focus-within{border-color:#2563EB;background:#fff;box-shadow:0 8px 18px rgba(37,99,235,.12)}.score-meta{margin-left:auto;display:flex;flex-shrink:0;flex-direction:column;align-items:flex-end;gap:4px}.score-meta small{color:var(--ink-3);font-size:11px;font-weight:700;white-space:nowrap}.score-meta small.complete{color:#027A48}.task-dots{display:inline-flex;gap:4px}.task-dots i{height:7px;width:7px;border-radius:50%;background:#D8DEE9}.task-dots i.filled{background:#2563EB}.score-row input{margin-left:11px;height:44px;width:84px;flex-shrink:0;border:1px solid var(--line);border-radius:12px;background:#fff;padding:8px 9px;color:var(--ink);font-size:16px;font-weight:650;text-align:center}.score-row input.low{border-color:#F0B4B4;background:#FEF4F4;color:#B42318}.score-row input.middle{border-color:#F2D492;background:#FFFBEB;color:#92600A}.score-row input.high{border-color:#A9DFC6;background:#F0FDF6;color:#027A48}.score-row input:disabled{cursor:not-allowed;background:#F2F5F9;color:var(--ink-3)}.save-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding-top:13px}.save-bar span{color:var(--ink-3);font-size:12px;font-weight:600}.save-bar.standalone{padding:13px 16px}.exam-grid{display:grid;grid-template-columns:1fr 1fr;align-items:start;gap:12px}.score-card.locked .score-row{opacity:.55}.lock-box{display:flex;align-items:flex-start;gap:13px;margin-bottom:10px;border:1px solid #F2D492;border-radius:14px;background:#FFFBEB;padding:14px 15px;color:#92600A}.lock-box svg{margin-top:1px;flex-shrink:0}.lock-box b{display:block;font-size:13.5px}.lock-box span{font-size:12px;font-weight:600;line-height:1.6}
.mode-selector{display:flex;gap:4px;border-radius:15px;background:#E8EDF5;padding:4px}.mode-selector button{flex:1;border-radius:11px;padding:9px 10px;color:var(--ink-3);font-size:13px;font-weight:700;line-height:1.35}.mode-selector button small{display:block;font-size:10.5px;font-weight:600}.mode-selector button.active{background:#fff;color:var(--ink);box-shadow:0 4px 12px rgba(15,23,42,.1)}.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}.summary-grid>div{display:flex;flex-direction:column;gap:5px;border:1px solid var(--line);border-radius:16px;background:#fff;padding:15px 16px}.summary-grid span{color:var(--ink-3);font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.summary-grid b{color:var(--ink);font-size:19px}.summary-grid b.weight-copy{padding-top:4px;font-size:14px}.summary-grid small{color:var(--ink-3);font-size:11px;font-weight:600}.recap-desktop{overflow:hidden;padding:6px 0}.recap-table{width:100%;min-width:960px;border-collapse:collapse;font-size:12.5px}.recap-table th{border-bottom:1px solid var(--line);background:#F2F6FC;padding:10px 9px;color:var(--ink-3);font-size:10.5px;font-weight:700;letter-spacing:.04em;line-height:1.5;text-align:center;text-transform:uppercase}.recap-table th small{font-weight:600;letter-spacing:0;text-transform:none}.recap-table td{border-bottom:1px solid var(--line);padding:9px;color:var(--ink-2);font-weight:600;text-align:center}.recap-name{min-width:170px;text-align:left!important}.recap-name b{display:block;color:var(--ink);font-size:12.5px}.recap-name span{color:var(--ink-3);font-size:10.5px}.final-score{background:#F8FAFF}.recap-table input{width:72px;border:1px solid var(--line);border-radius:9px;padding:6px;color:var(--ink);font-size:12px;text-align:center}.status-chip{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:4px 9px;font-size:10.5px;font-weight:750;white-space:nowrap}.status-chip.waiting{background:#FEF3E2;color:#B54708}.status-chip.success{background:#E7F6EF;color:#027A48}.status-chip.danger{background:#FDECEC;color:#B42318}.recap-mobile{display:none;flex-direction:column;gap:11px}.recap-card{padding:15px 16px}.recap-card-heading{display:flex;align-items:center;gap:11px;margin-bottom:12px}.recap-card-heading .status-chip{margin-left:auto}.recap-values{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center}.recap-values.four{grid-template-columns:repeat(4,1fr)}.recap-values span{display:block;margin-bottom:3px;color:var(--ink-3);font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}.recap-values b{color:var(--ink);font-size:15px}.recap-text-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.recap-text-fields label{color:var(--ink-3);font-size:10.5px;font-weight:700}.recap-text-fields input{margin-top:4px;width:100%;border:1px solid var(--line);border-radius:9px;padding:8px;color:var(--ink);font-size:12px}.recap-final{display:flex;align-items:center;justify-content:space-between;margin-top:12px;border-top:1px solid var(--line);padding-top:11px}.recap-final span{color:var(--ink-3);font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}.recap-final b{color:#1D4ED8;font-size:19px}
@media(max-width:1023px){.exam-grid{grid-template-columns:1fr}}
@media(max-width:700px){.grid-toolbar{flex-direction:column}.grid-toolbar .primary-button{align-self:stretch}.attendance-desktop,.recap-desktop{display:none}.attendance-mobile{display:block;padding:14px 16px}.summary-grid{grid-template-columns:1fr}.recap-mobile{display:flex}.score-row input{width:66px}}
@media(max-width:520px){.task-dots{display:none}.score-meta small{font-size:10px}.score-heading h2 span{display:flex;width:max-content;margin-top:5px}.save-bar{align-items:stretch;flex-direction:column}.student-row{gap:8px}.student-avatar{height:34px;width:34px}.attendance-segments button{width:28px}.recap-card-heading{align-items:flex-start;flex-wrap:wrap}.recap-card-heading .status-chip{margin-left:45px}.recap-values.four{grid-template-columns:repeat(2,1fr)}.recap-text-fields{grid-template-columns:1fr}}
</style>
