<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { isArabicText, renderKaTeXHtml } from '~/utils/cbtFormula'
import AdminV2Icon from '../AdminV2Icon.vue'
import CbtV2ExamTokens from './CbtV2ExamTokens.vue'
import CbtV2ExamDetail from './CbtV2ExamDetail.vue'
import CbtV2RombelViolations from './CbtV2RombelViolations.vue'
import type { ExamItem, GradeType, CbtTabId } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource } from '~/composables/useAdminCbtData'

interface Props {
  grade: GradeType
  exams: ExamItem[]
  source?: AssessmentSource
}

const props = defineProps<Props>()
const cbtData = useAdminCbtData(props.source ?? 'cbt')
// CBT PTS/PAS: buat/ubah/hapus ujian dan token peserta hanya Superadmin; guru dan wali kelas hanya melihat.
// Ujian harian (LMS) memakai komponen ini juga dan tidak ikut dibatasi.
const bolehKelola = computed(() => props.source === 'ujian_harian' || cbtData.adalahSuperadmin.value)

const emit = defineEmits<{
  (e: 'switch-tab', tab: CbtTabId): void
  (e: 'open-drawer', type: string, payload?: any): void
  (e: 'toast', msg: string): void
  (e: 'copy-token', token: string): void
}>()

// Rombel, modal token, dan filter disimpan di URL: refresh tetap di halaman yang sama dan tombol kembali browser mundur satu langkah.
const route = useRoute()
const router = useRouter()
const kueri = (kunci: string) => typeof route.query[kunci] === 'string' ? route.query[kunci] as string : ''
const ubahKueri = (ubah: Record<string, string | undefined>, ganti = false) => {
  const query = { ...route.query, ...ubah }
  return ganti ? router.replace({ query }) : router.push({ query })
}
const rombelAktif = computed(() => kueri('rombel'))
const ujianDetail = computed(() => props.exams.find(e => e.id === kueri('ujian')) ?? null)
const isCreateModalOpen = ref(false)
const scheduleDialog = ref<HTMLElement | null>(null)
watch(isCreateModalOpen, async open => {
  if (open) { await nextTick(); scheduleDialog.value?.focus() }
})
const isSaving = ref(false)
const wizardStep = ref(1)
const soalMode = ref<'acak' | 'manual'>('acak')
const acakCount = ref(40)
const acakRolled = ref(false)
// Filter status tidak disimpan di URL: setiap membuka daftar selalu mulai dari semua ujian.
const statusFilter = ref<'semua' | 'siap' | 'berlangsung' | 'selesai'>('semua')
const searchQuery = ref(kueri('ujianCari'))
// Dua tampilan di halaman daftar ujian: kartu rombel, atau time table jadwal seluruh rombel.
const tampilan = ref<'rombel' | 'jadwal'>(kueri('ujianTab') === 'jadwal' ? 'jadwal' : 'rombel')
watch(tampilan, t => { void ubahKueri({ ujianTab: t === 'jadwal' ? t : undefined }, true) })
watch(searchQuery, cari => { void ubahKueri({ ujianStatus: undefined, ujianCari: cari || undefined }, true) })
const selectedQuestionIds = ref<string[]>([])
const selectionError = ref('')
const loadingSelection = ref(false)
const requestedQuestionIds = ref<string[] | null>(null)
let selectionRequest = 0

const localDateTime = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const emptyExam = () => ({
  id: '',
  name: '',
  classId: '',
  subjectId: '',
  questionBankId: '',
  startsAt: localDateTime(new Date(Date.now() + 86_400_000)),
  duration: 90,
  token: '',
  supervisorId: '',
  acakEsai: true,
  jenis: 'akhir' as 'akhir' | 'tengah_semester' | 'harian' | 'pr'
})

const newExam = ref(emptyExam())
// Pengawas: guru jenjang ini + Yayasan. Bila daftar jenjang ini kosong (data guru belum berjenjang), semua guru aktif ditampilkan.
const pengawasOpsi = computed(() => {
  const sesuai = cbtData.teachers.value.filter(t => t.grade === props.grade || t.grade === 'Yayasan')
  return sesuai.length ? sesuai : cbtData.teachers.value
})
const currentExams = computed(() => props.exams.filter(exam => exam.grade === props.grade))
const statusKey = (e: { status: string }) => e.status === 'Berlangsung' ? 'berlangsung' : e.status === 'Selesai' ? 'selesai' : 'siap'
const statusLabel = (e: { status: string }) => e.status === 'Berlangsung' ? 'Sedang Berlangsung' : e.status === 'Selesai' ? 'Selesai' : 'Siap Tayang'
const soalLabel = (e: ExamItem) => e.questionIds ? e.questionIds.length + ' soal terpasang' : 'Seluruh bank soal'
const filteredExams = computed(() => currentExams.value.filter(e => {
  if (statusFilter.value !== 'semua' && statusKey(e) !== statusFilter.value) return false
  const q = searchQuery.value.trim().toLowerCase()
  if (q && !(e.name + ' ' + e.subject + ' ' + e.classroom).toLowerCase().includes(q)) return false
  return true
}))
const gradeClasses = computed(() => cbtData.classes.value.filter(item => item.grade === props.grade))
const gradePackages = computed(() => cbtData.bankPackages.value.filter(item => item.grade === props.grade))

// Ringkasan per rombel; rombel tanpa jadwal yang cocok tidak ditampilkan.
const urutWaktu = (a: ExamItem, b: ExamItem) => (a.startsAt ?? '').localeCompare(b.startsAt ?? '')
const rombelGroups = computed(() => gradeClasses.value
  .map(c => {
    const list = filteredExams.value.filter(e => e.classId === c.id).sort(urutWaktu)
    const status = list.some(e => e.status === 'Berlangsung') ? 'Berlangsung' : list.some(e => e.status === 'Terjadwal') ? 'Terjadwal' : 'Selesai'
    return { id: c.id, classroom: c.name, students: c.studentCount ?? 0, subjects: new Set(list.map(e => e.subjectId)).size, exams: list, status, next: list.find(e => e.status !== 'Selesai') }
  })
  .filter(g => g.exams.length))

const rombelDetail = computed(() => {
  const c = gradeClasses.value.find(item => item.id === rombelAktif.value)
  return c ? { id: c.id, classroom: c.name, students: c.studentCount ?? 0 } : null
})

const selectedMajor = ref('Semua')

const isToday = (startsAt?: string) => {
  if (!startsAt) return false
  const d = new Date(startsAt)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

const mapelHariIni = (exams: ExamItem[]) => {
  const list = exams.filter(e => isToday(e.startsAt))
  const set = new Set(list.map(e => e.subjectId || e.subject))
  return set.size
}

const totalRombel = computed(() => rombelGroups.value.length)
const totalSesi = computed(() => filteredExams.value.length)
const sesiBerlangsung = computed(() => filteredExams.value.filter(e => e.status === 'Berlangsung').length)
const sesiSiap = computed(() => filteredExams.value.filter(e => e.status !== 'Berlangsung' && e.status !== 'Selesai').length)

const majorChips = computed(() => {
  const chips: { label: string; value: string; count: number }[] = [
    { label: 'Semua Rombel', value: 'Semua', count: rombelGroups.value.length }
  ]
  const seen = new Set<string>()
  for (const g of rombelGroups.value) {
    const parts = g.classroom.trim().split(/\s+/)
    const m = parts.length >= 2 ? parts[1].replace(/\d+$/, '') : parts[0]
    if (m && !seen.has(m)) {
      seen.add(m)
      const count = rombelGroups.value.filter(x => x.classroom.toUpperCase().includes(m.toUpperCase())).length
      chips.push({ label: m, value: m, count })
    }
  }
  return chips
})

const filteredRombelGroups = computed(() => {
  if (selectedMajor.value === 'Semua') return rombelGroups.value
  return rombelGroups.value.filter(g => g.classroom.toUpperCase().includes(selectedMajor.value.toUpperCase()))
})

// Jadwal rombel terpilih dikelompokkan per hari agar mudah dibaca.
const jadwalPerHari = computed(() => {
  const hasil: { key: string; label: string; exams: ExamItem[] }[] = []
  // Tanpa rombel terpilih = time table seluruh rombel yang punya ujian.
  const sumber = rombelAktif.value ? filteredExams.value.filter(x => x.classId === rombelAktif.value) : [...filteredExams.value]
  for (const e of sumber.sort(urutWaktu)) {
    const key = localDateTime(new Date(e.startsAt ?? Date.now())).slice(0, 10)
    let hari = hasil.find(h => h.key === key)
    if (!hari) {
      hari = { key, label: new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(e.startsAt ?? Date.now())), exams: [] }
      hasil.push(hari)
    }
    hari.exams.push(e)
  }
  return hasil
})

// Kolom time table: view semua rombel punya kolom Rombel tambahan.
const kolomJadwal = computed(() => rombelDetail.value
  ? 'md:grid-cols-[130px_minmax(0,1fr)_minmax(0,190px)_80px_120px_170px]'
  : 'md:grid-cols-[110px_64px_minmax(0,1fr)_minmax(0,170px)_72px_120px_170px]')

// Modal token terbuka selama ?token=1 ada di URL; satu token berlaku untuk seluruh mapel rombel, jadi ujian mana pun cukup sebagai acuan.
// Panel Pelanggaran Siswa (?pelanggaran=1) mencakup seluruh mapel rombel yang sedang dibuka.
const ujianRombel = computed(() => currentExams.value.filter(x => x.classId === rombelAktif.value))
// Badge = jumlah siswa unik yang melanggar di rombel ini (bukan jumlah kejadian), lintas mapel.
const jumlahPelanggaranRombel = computed(() => new Set(ujianRombel.value.flatMap(e => e.violatorIds ?? [])).size)

const tokenExam = computed(() => kueri('token') && rombelDetail.value
  ? currentExams.value.filter(x => x.classId === rombelAktif.value).sort(urutWaktu)[0] ?? null
  : null)

const availablePackages = computed(() =>
  gradePackages.value.filter(pkg => !newExam.value.classId || pkg.classId === newExam.value.classId)
)

// Daftar mapel di Langkah 1 selalu dari Master Mapel jenjang ini — bukan dari
// bank soal. Rombel yang belum memiliki bank soal tetap dapat memilih mapel;
// ketiadaan banknya dijelaskan lewat subjectHasBank dan penjaga di goStep2.
const availableSubjects = computed(() =>
  cbtData.subjects.value.filter(item => item.grade === props.grade)
)

const subjectHasBank = computed(() =>
  !newExam.value.subjectId || availablePackages.value.some(pkg => pkg.subjectId === newExam.value.subjectId)
)

const selectedBank = computed(() => availablePackages.value.find(pkg => pkg.id === newExam.value.questionBankId))
const bankQuestions = computed(() => selectedBank.value?.questions ?? [])
const orderedQuestions = computed(() => selectedQuestionIds.value.map(id => bankQuestions.value.find(q => q.id === id)).filter(q => !!q))

const loadSelection = async (ids?: string[] | null) => {
  requestedQuestionIds.value = ids == null ? null : [...ids]
  const request = ++selectionRequest
  loadingSelection.value = true
  selectionError.value = ''
  selectedQuestionIds.value = []
  try {
    await cbtData.loadQuestions()
    if (request !== selectionRequest) return
    selectedQuestionIds.value = ids == null ? bankQuestions.value.map(q => q.id) : [...ids]
  } catch (error) {
    if (request === selectionRequest) selectionError.value = error instanceof Error ? error.message : 'Soal gagal dimuat.'
  } finally {
    if (request === selectionRequest) loadingSelection.value = false
  }
}

const toggleQuestion = (id: string) => {
  selectedQuestionIds.value = selectedQuestionIds.value.includes(id)
    ? selectedQuestionIds.value.filter(item => item !== id)
    : [...selectedQuestionIds.value, id]
}

const moveQuestion = (index: number, offset: number) => {
  const next = [...selectedQuestionIds.value]
  const target = index + offset
  if (target < 0 || target >= next.length) return
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  selectedQuestionIds.value = next
}

watch(() => newExam.value.questionBankId, () => {
  acakRolled.value = false
  if (isCreateModalOpen.value) void loadSelection()
}, { flush: 'sync' })

const rollRandom = () => {
  const ids = bankQuestions.value.map(q => q.id)
  if (!ids.length) return
  const n = Math.max(1, Math.min(Math.floor(Number(acakCount.value)) || 1, ids.length))
  acakCount.value = n
  const shuffled = [...ids]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  const order = new Map(bankQuestions.value.map(q => [q.id, q.number]))
  const picked = shuffled.slice(0, n).sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
  selectedQuestionIds.value = picked
  acakRolled.value = true
}

const goStep2 = () => {
  if (!newExam.value.name.trim()) { emit('toast', 'Nama ujian wajib diisi.'); return }
  if (!newExam.value.classId || !newExam.value.subjectId) { emit('toast', 'Pilih rombel dan mata pelajaran dulu.'); return }
  if (!newExam.value.questionBankId) { emit('toast', 'Belum ada bank soal untuk mapel ini di rombel ini. Buat dulu di tab Bank Soal.'); return }
  wizardStep.value = 2
  if (soalMode.value === 'acak' && !acakRolled.value && bankQuestions.value.length) rollRandom()
}

const ringkasanJadwal = computed(() => newExam.value.startsAt
  ? new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(newExam.value.startsAt))
  : '-')
const ringkasanKelas = computed(() => gradeClasses.value.find(c => c.id === newExam.value.classId)?.name ?? '-')
const ringkasanMapel = computed(() => cbtData.subjects.value.find(s => s.id === newExam.value.subjectId)?.name ?? '-')

const syncPackage = () => {
  const matching = availablePackages.value.find(pkg => pkg.subjectId === newExam.value.subjectId)
  newExam.value.questionBankId = matching?.id ?? ''
}

const openCreateSchedule = (classroom?: string) => {
  const classItem = gradeClasses.value.find(item => item.name === classroom)
    ?? gradeClasses.value[0]
  newExam.value = emptyExam()
  if (props.source === 'ujian_harian') newExam.value.jenis = 'harian'
  newExam.value.classId = classItem?.id ?? ''
  const firstPackage = gradePackages.value.find(pkg => pkg.classId === newExam.value.classId)
  newExam.value.subjectId = firstPackage?.subjectId ?? ''
  newExam.value.questionBankId = firstPackage?.id ?? ''
  wizardStep.value = 1
  soalMode.value = 'acak'
  acakRolled.value = false
  acakCount.value = 40
  isCreateModalOpen.value = true
  void loadSelection()
}

const openEditSchedule = (exam: ExamItem) => {
  isCreateModalOpen.value = false
  newExam.value = {
    id: exam.id,
    name: exam.name,
    classId: exam.classId ?? '',
    subjectId: exam.subjectId ?? '',
    questionBankId: exam.questionBankId ?? '',
    startsAt: exam.startsAt ? localDateTime(new Date(exam.startsAt)) : localDateTime(new Date()),
    duration: exam.duration,
    token: exam.token,
    supervisorId: exam.supervisorId ?? '',
    acakEsai: exam.acakEsai !== false,
    jenis: exam.jenis ?? (props.source === 'ujian_harian' ? 'harian' : 'akhir')
  }
  wizardStep.value = 1
  soalMode.value = 'manual'
  acakRolled.value = true
  isCreateModalOpen.value = true
  void loadSelection(exam.questionIds)
}

const draftKey = () => `cbt-ujian-draf:${props.source ?? 'cbt'}:${props.grade}`
watch([isCreateModalOpen, newExam, wizardStep, soalMode, acakCount, selectedQuestionIds, acakRolled], () => {
  try {
    if (!isCreateModalOpen.value) sessionStorage.removeItem(draftKey())
    else sessionStorage.setItem(draftKey(), JSON.stringify({ exam: newExam.value, step: wizardStep.value, mode: soalMode.value, acak: acakCount.value, rolled: acakRolled.value, ids: selectedQuestionIds.value }))
  } catch { /* penyimpanan peramban tidak tersedia: formulir tetap jalan tanpa draf */ }
}, { deep: true })

// Draf dipulihkan sekali, setelah data kelas dan bank soal tersedia agar pilihan dropdown terisi.
onMounted(() => {
  let pulih = false
  watch(() => cbtData.bankPackages.value.length, jumlah => {
    if (pulih || !jumlah) return
    pulih = true
    let draf: any = null
    try { draf = JSON.parse(sessionStorage.getItem(draftKey()) || 'null') } catch { /* draf rusak diabaikan */ }
    if (!draf?.exam) return
    newExam.value = draf.exam
    wizardStep.value = draf.step === 2 ? 2 : 1
    soalMode.value = draf.mode === 'manual' ? 'manual' : 'acak'
    acakCount.value = Number(draf.acak) || 40
    acakRolled.value = !!draf.rolled
    isCreateModalOpen.value = true
    void loadSelection(Array.isArray(draf.ids) && draf.ids.length ? draf.ids : null).then(() => { acakRolled.value = !!draf.rolled })
  }, { immediate: true })
})

const saveSchedule = async () => {
  if (isSaving.value || loadingSelection.value || selectionError.value) return
  if (!newExam.value.name.trim()) {
    emit('toast', 'Nama ujian wajib diisi.')
    return
  }
  if (!newExam.value.classId || !newExam.value.subjectId || !newExam.value.questionBankId) {
    emit('toast', 'Pilih kelas, mata pelajaran, dan bank soal yang sesuai.')
    return
  }
  if (!selectedQuestionIds.value.length) {
    emit('toast', 'Pilih minimal satu soal untuk ujian.')
    return
  }
  isSaving.value = true
  try {
    await cbtData.saveExam({
      ...newExam.value,
      name: newExam.value.name.trim(),
      questionIds: selectedQuestionIds.value,
      token: newExam.value.token || undefined
    })
    isCreateModalOpen.value = false
    emit('toast', 'Ujian berhasil ditayangkan. Token peserta (satu token untuk seluruh mapel) diterbitkan untuk siswa yang eligible.')
  } catch (saveError) {
    emit('toast', saveError instanceof Error ? saveError.message : 'Jadwal ujian gagal disimpan.')
  } finally { isSaving.value = false }
}

const removeSchedule = async (exam: ExamItem) => {
  if (!confirm(`Hapus ujian ${exam.name}?`)) return
  try {
    await cbtData.deleteExam(exam.id)
    emit('toast', 'Ujian berhasil dihapus.')
  } catch (deleteError) {
    emit('toast', deleteError instanceof Error ? deleteError.message : 'Ujian gagal dihapus.')
  }
}

</script>

<template>
  <div class="space-y-4">
    <!-- DETAIL SATU UJIAN: daftar siswa + pelanggaran -->
    <CbtV2ExamDetail v-if="ujianDetail" :key="ujianDetail.id" :exam="ujianDetail" :source="source ?? 'cbt'" @back="ubahKueri({ ujian: undefined })" @toast="emit('toast', $event)" />
    <p v-else-if="kueri('ujian')" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">Memuat ujian&hellip; <button type="button" class="font-bold text-[#1B5FD9] underline" @click="ubahKueri({ ujian: undefined })">Kembali ke Daftar Ujian</button></p>

    <!-- DAFTAR UJIAN: RINGKASAN ROMBEL -> JADWAL PER ROMBEL -->
    <div v-else class="space-y-5">
      <!-- Tombol Kembali jika sedang membuka rombel tertentu -->
      <button v-if="rombelAktif" type="button" class="inline-flex min-h-11 items-center gap-2 text-xs font-black text-slate-600 hover:text-blue-600 transition-colors cursor-pointer" @click="ubahKueri({ rombel: undefined, token: undefined })">
        <AdminV2Icon name="back" :size="14" />
        <span>Kembali ke Seluruh Rombel</span>
      </button>

      <!-- Header Halaman: Judul, Deskripsi & Tombol Aksi -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daftar Ujian</span>
            <span v-if="rombelDetail" class="text-[#1B5FD9]">&middot; {{ rombelDetail.classroom }}</span>
          </h2>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            {{ rombelDetail ? `Kelola jadwal sesi ujian, token peserta, dan monitoring pelanggaran untuk ${rombelDetail.classroom}.` : 'Manajemen jadwal sesi ujian per rombel belajar dan time table terstruktur.' }}
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-if="rombelDetail && bolehKelola"
            type="button"
            class="px-4 py-2.5 rounded-xl bg-white border border-[#E7EBF2] hover:border-blue-400 hover:bg-blue-50/50 text-[#1B5FD9] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            @click="ubahKueri({ token: '1' })"
          >
            <AdminV2Icon name="key" :size="13" />
            <span>Token Peserta</span>
          </button>

          <button
            v-if="rombelDetail"
            type="button"
            class="relative px-4 py-2.5 rounded-xl bg-white border text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            :class="jumlahPelanggaranRombel ? 'border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100' : 'border-[#E7EBF2] text-slate-700 hover:border-blue-500'"
            @click="ubahKueri({ pelanggaran: '1' })"
          >
            <AdminV2Icon name="alert" :size="13" />
            <span>Pelanggaran Siswa</span>
            <span
              v-if="jumlahPelanggaranRombel"
              class="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[10px] font-black leading-5 text-center tabular-nums shadow-xs"
            >
              {{ jumlahPelanggaranRombel > 99 ? '99+' : jumlahPelanggaranRombel }}
            </span>
          </button>

          <button
            v-if="bolehKelola"
            type="button"
            class="px-5 py-2.5 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-95"
            @click="openCreateSchedule(rombelDetail?.classroom)"
          >
            <AdminV2Icon name="plus" :size="14" />
            <span>{{ rombelDetail ? 'Tambah Ujian' : 'Buat Ujian' }}</span>
          </button>
        </div>
      </div>

      <!-- Strip Identitas & Status Operasional Terpadu (Sleek & Konsisten dengan Portal Admin) -->
      <div v-if="!rombelDetail" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E7EBF2] bg-white px-4 py-2.5 text-xs text-slate-600 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
        <div class="flex items-center gap-2 min-w-0">
          <span class="flex h-2 w-2 rounded-full shrink-0" :class="props.grade === 'SMP' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
          <span class="font-bold text-slate-800 shrink-0">{{ props.grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT BCA' }}</span>
          <span class="text-slate-300">&middot;</span>
          <span class="text-slate-500 truncate">Tahun Ajaran 2026/2027</span>
        </div>
        <div class="flex items-center gap-3 text-[11.5px] font-semibold text-slate-500">
          <span><b class="text-slate-900 font-bold">{{ totalRombel }}</b> Rombel Ujian</span>
          <span class="text-slate-300">&middot;</span>
          <span><b class="text-slate-900 font-bold">{{ totalSesi }}</b> Sesi Terjadwal</span>
          <template v-if="sesiBerlangsung > 0">
            <span class="text-slate-300">&middot;</span>
            <span class="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{{ sesiBerlangsung }} Sesi Sedang Ujian</span>
            </span>
          </template>
        </div>
      </div>

      <!-- Segmented Control Switcher & Filters Toolbar -->
      <div v-if="!rombelDetail" class="space-y-3 pt-1">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <!-- Switcher Mode View -->
          <div class="inline-flex rounded-xl bg-[#EFF2F7] p-1 gap-1 border border-[#E7EBF2]" role="tablist" aria-label="Tampilan daftar ujian">
            <button
              type="button"
              role="tab"
              :aria-selected="tampilan === 'rombel'"
              class="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              :class="tampilan === 'rombel' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' : 'text-slate-500 hover:text-slate-800'"
              @click="tampilan = 'rombel'"
            >
              <AdminV2Icon name="grid" :size="13" />
              <span>Daftar Ujian Rombel</span>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="tampilan === 'jadwal'"
              class="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              :class="tampilan === 'jadwal' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' : 'text-slate-500 hover:text-slate-800'"
              @click="tampilan = 'jadwal'"
            >
              <AdminV2Icon name="calendar" :size="13" />
              <span>Jadwal Ujian (Time Table)</span>
            </button>
          </div>

          <!-- Filter Status & Search Input -->
          <div class="flex items-center gap-2.5 flex-1 sm:max-w-md ml-auto">
            <div class="relative w-44 shrink-0">
              <select
                v-model="statusFilter"
                aria-label="Filter status ujian"
                class="w-full border border-[#E7EBF2] rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 bg-white outline-none focus:border-[#1B5FD9] shadow-2xs cursor-pointer"
              >
                <option value="semua">Semua status</option>
                <option value="siap">Siap Tayang</option>
                <option value="berlangsung">Sedang Berlangsung</option>
                <option value="selesai">Sudah Selesai</option>
              </select>
            </div>
            <div class="relative flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari rombel atau mapel..."
                class="w-full border border-[#E7EBF2] rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 bg-white outline-none focus:border-[#1B5FD9] shadow-2xs"
              >
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
          </div>
        </div>

        <!-- Filter Chips (Kategori Jurusan) -->
        <div v-if="tampilan === 'rombel' && majorChips.length > 2" class="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <span class="text-[11px] font-extrabold text-[#98A2B3] shrink-0 mr-1 uppercase tracking-wider">Kategori:</span>
          <button
            v-for="chip in majorChips"
            :key="chip.value"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer"
            :class="selectedMajor === chip.value
              ? 'bg-[#101828] text-white shadow-xs'
              : 'bg-[#EFF2F7] text-[#475467] hover:bg-[#E2E8F0]'"
            @click="selectedMajor = chip.value"
          >
            <span>{{ chip.label }}</span>
            <span
              class="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold"
              :class="selectedMajor === chip.value ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#344054]'"
            >
              {{ chip.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- VIEW 1: KARTU ROMBEL (HIGH CRAFT, INFORMATIF, BEBAS AI SLOP) -->
      <div v-if="!rombelDetail && tampilan === 'rombel'">
        <div v-if="filteredRombelGroups.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <article
            v-for="g in filteredRombelGroups"
            :key="g.id"
            class="bg-white border border-[#E7EBF2] hover:border-[#1B5FD9] rounded-2xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04),0_6px_16px_-6px_rgba(16,24,40,0.06)] hover:shadow-[0_8px_24px_-4px_rgba(27,95,217,0.12)] -translate-y-0 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
            @click="ubahKueri({ rombel: g.id })"
          >
            <!-- 1. Nama Kelas & 2. Status -->
            <div class="flex items-center justify-between gap-3 mb-4">
              <h3 class="text-xl font-black text-slate-900 group-hover:text-[#1B5FD9] transition-colors tracking-tight">
                {{ g.classroom }}
              </h3>

              <!-- 2. Status -->
              <span
                class="text-[11px] font-black px-2.5 py-1 rounded-full border shadow-2xs shrink-0 flex items-center gap-1.5"
                :class="statusKey(g.status) === 'berlangsung'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : statusKey(g.status) === 'siap'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-slate-100 border-slate-200 text-slate-600'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="statusKey(g.status) === 'berlangsung'
                    ? 'bg-emerald-500 animate-pulse'
                    : statusKey(g.status) === 'siap'
                      ? 'bg-blue-600'
                      : 'bg-slate-400'"
                />
                <span>{{ statusLabel(g.status) }}</span>
              </span>
            </div>

            <!-- 3, 4, 5: Informasi Utama Sesuai Kebutuhan -->
            <div class="border-t border-slate-100 pt-3.5 space-y-2.5">
              <!-- 3. Jadwal Ujian Hari Ini -->
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 font-medium flex items-center gap-2">
                  <AdminV2Icon name="cal" :size="14" class="text-blue-600 shrink-0" />
                  <span>Ujian Hari Ini</span>
                </span>
                <b
                  class="tabular-nums"
                  :class="mapelHariIni(g.exams) > 0 ? 'text-blue-700 font-black' : 'text-slate-400 font-bold'"
                >
                  {{ mapelHariIni(g.exams) > 0 ? `${mapelHariIni(g.exams)} Pelajaran` : '0 Pelajaran' }}
                </b>
              </div>

              <!-- 4. Berapa Sesi Ujian -->
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 font-medium flex items-center gap-2">
                  <AdminV2Icon name="clock" :size="14" class="text-indigo-600 shrink-0" />
                  <span>Sesi Ujian</span>
                </span>
                <b class="text-slate-900 font-black tabular-nums">
                  {{ g.exams.length }} Sesi
                </b>
              </div>

              <!-- 5. Berapa Jumlah Siswa -->
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 font-medium flex items-center gap-2">
                  <AdminV2Icon name="user" :size="14" class="text-slate-500 shrink-0" />
                  <span>Jumlah Siswa</span>
                </span>
                <b class="text-slate-900 font-black tabular-nums">
                  {{ g.students }} Siswa
                </b>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="rounded-2xl border border-[#E7EBF2] bg-white p-10 text-center shadow-xs">
          <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <AdminV2Icon name="grid" :size="20" />
          </div>
          <h3 class="text-base font-bold text-slate-800">Belum Ada Ujian yang Cocok</h3>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Tidak ada rombel ujian yang sesuai dengan filter atau kata kunci pencarian.
          </p>
          <button
            v-if="bolehKelola"
            type="button"
            class="px-5 py-2.5 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
            @click="openCreateSchedule()"
          >
            + Buat Ujian Baru
          </button>
        </div>
      </div>

      <!-- VIEW 2: TIME TABLE JADWAL UJIAN (TERSTRUKTUR & MODERN) -->
      <div v-if="rombelDetail || tampilan === 'jadwal'" class="space-y-4">
        <section
          v-for="hari in jadwalPerHari"
          :key="hari.key"
          class="bg-white border border-[#E7EBF2] rounded-2xl shadow-xs overflow-hidden"
        >
          <div class="px-5 py-3.5 bg-[#F6F8FC] border-b border-[#E7EBF2] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <AdminV2Icon name="calendar" :size="14" class="text-blue-600" />
              <h3 class="text-xs sm:text-sm font-bold text-[#0A2A5C] tracking-tight">{{ hari.label }}</h3>
            </div>
            <span class="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              {{ hari.exams.length }} Mapel Terjadwal
            </span>
          </div>

          <div class="hidden md:grid gap-4 px-5 py-2.5 border-b border-slate-100 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50" :class="kolomJadwal">
            <span>Jam Pelaksanaan</span><span v-if="!rombelDetail">Rombel</span><span>Mata Pelajaran &amp; Materi</span><span>Pengawas</span><span class="text-center">Peserta</span><span>Status</span><span class="text-right">Aksi</span>
          </div>

          <ul class="divide-y divide-slate-100">
            <li
              v-for="e in hari.exams"
              :key="e.id"
              class="grid gap-2 px-4 sm:px-5 py-3.5 md:items-center md:gap-4 hover:bg-slate-50/60 transition-colors"
              :class="kolomJadwal"
            >
              <span class="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg w-fit">{{ e.time }}</span>
              <span v-if="!rombelDetail" class="text-xs font-bold text-blue-700">
                <span class="md:hidden font-normal text-slate-500">Rombel: </span>{{ e.classroom }}
              </span>
              <div class="min-w-0">
                <b class="block text-sm font-bold text-slate-900 break-words">{{ e.subject }}</b>
                <span class="block text-[11px] text-slate-500 font-medium break-words mt-0.5">{{ e.name }} &middot; {{ soalLabel(e) }}</span>
              </div>
              <span class="text-xs text-slate-700 font-medium">
                <span class="md:hidden text-slate-400">Pengawas: </span>{{ e.supervisor || 'Belum ditentukan' }}
              </span>
              <span class="text-xs font-mono font-bold md:text-center">
                <span class="md:hidden font-sans font-normal text-slate-400">Peserta: </span>{{ e.participants }} Siswa
              </span>
              <span>
                <span
                  class="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs"
                  :class="statusKey(e) === 'berlangsung' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : statusKey(e) === 'siap' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-600'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusKey(e) === 'berlangsung' ? 'bg-emerald-500 animate-pulse' : statusKey(e) === 'siap' ? 'bg-blue-600' : 'bg-slate-400'" />
                  <span>{{ statusLabel(e) }}</span>
                </span>
              </span>
              <div class="flex items-center gap-2 md:justify-end">
                <button
                  type="button"
                  class="rounded-lg bg-blue-50 border border-blue-200/80 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
                  @click="ubahKueri({ ujian: e.id })"
                >
                  Detail
                </button>
                <button
                  v-if="bolehKelola"
                  type="button"
                  class="text-xs font-bold text-slate-600 hover:text-blue-600 hover:underline px-1 cursor-pointer"
                  @click="openEditSchedule(e)"
                >
                  Ubah
                </button>
                <button
                  v-if="bolehKelola"
                  type="button"
                  class="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline px-1 cursor-pointer"
                  @click="removeSchedule(e)"
                >
                  Hapus
                </button>
              </div>
            </li>
          </ul>
        </section>
        <div v-if="!jadwalPerHari.length" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
          Tidak ada jadwal yang cocok dengan filter atau pencarian saat ini.
        </div>
      </div>
    </div>

    <!-- CREATE SCHEDULE MODAL -->
    <Teleport to="body">
      <div
        v-if="isCreateModalOpen"
        ref="scheduleDialog"
        tabindex="-1"
        class="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-label="Penjadwalan ujian"
        @keydown.esc="!isSaving && (isCreateModalOpen = false)"
      >
        <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-[#E7EBF2]">
          <div class="p-5 border-b border-[#E7EBF2] flex items-center justify-between">
            <div>
              <span class="text-[10px] font-extrabold uppercase text-[#1B5FD9] tracking-wider">{{ wizardStep === 1 ? 'Langkah 1 dari 2 · Buat Ujian' : 'Langkah 2 dari 2 · Jadwal & Soal' }}</span>
              <h3 class="text-base font-extrabold text-[#101828] mt-0.5">{{ newExam.id ? 'Ubah Ujian' : 'Buat Ujian' }}</h3>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-lg hover:bg-[#EFF2F7] flex items-center justify-center text-[#667085]"
              @click="isCreateModalOpen = false"
            >
              <AdminV2Icon name="x" :size="16" />
            </button>
          </div>

          <div class="p-5 space-y-3.5 text-xs">
            <div class="p-3 rounded-xl bg-[#E8F0FE] text-[#0A2A5C] flex items-center gap-2 font-semibold">
              <AdminV2Icon name="cal" :size="16" class="shrink-0" />
              <span>{{ source === 'ujian_harian' ? 'Bank Soal LMS untuk ujian harian.' : 'Bank Soal CBT untuk PTS/PAS.' }} Satu token per siswa berlaku untuk seluruh mata pelajaran ujian, dibuat otomatis saat ujian ditayangkan.</span>
            </div>

            <div v-if="wizardStep === 1" class="space-y-3.5">
              <div>
                <label class="block font-bold text-[#344054] mb-1">Nama Ujian *</label>
                <input v-model="newExam.name" type="text" placeholder="Contoh: Penilaian Tengah Semester Informatika" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none focus:border-[#1B5FD9]">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Rombel</label>
                  <select v-model="newExam.classId" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none" @change="syncPackage">
                    <option value="" disabled>Pilih rombel</option>
                    <option v-for="c in gradeClasses" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Mata Pelajaran</label>
                  <select v-model="newExam.subjectId" @change="syncPackage" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none">
                    <option value="" disabled>Pilih mata pelajaran</option>
                    <option v-for="s in availableSubjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
                <p v-if="!subjectHasBank" class="sm:col-span-2 p-3 rounded-xl bg-[#FEF4E5] text-[#7A4A03] font-semibold">Belum ada bank soal untuk mapel ini di rombel ini. Buat dulu bank soalnya di tab Bank Soal — ujian belum dapat dilanjutkan ke jadwal sebelum bank soal tersedia.</p>
              </div>
              <div v-if="source === 'ujian_harian'">
                <label class="block font-bold text-[#344054] mb-1">Jenis Ujian</label>
                <select v-model="newExam.jenis" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none">
                  <option value="harian">Ujian Harian (diawasi, kode buka dari guru/pengawas)</option>
                  <option value="pr">PR di Rumah (kode buka muncul acak)</option>
                </select>
              </div>
              <div v-else>
                <label class="block font-bold text-[#344054] mb-1">Jenis Ujian</label>
                <select v-model="newExam.jenis" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none">
                  <option value="akhir">Ujian Akhir</option>
                  <option value="tengah_semester">Ujian Tengah Semester</option>
                </select>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Durasi (menit)</label>
                  <input v-model="newExam.duration" type="number" min="1" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
                </div>
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Pengawas</label>
                  <select v-model="newExam.supervisorId" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] bg-white outline-none">
                    <option value="">Belum ditentukan</option>
                    <option v-for="t in pengawasOpsi" :key="t.id" :value="t.id">{{ t.name }}{{ t.grade !== grade && t.grade !== 'Yayasan' ? ` (${t.grade})` : '' }}</option>
                  </select>
                </div>
              </div>
              <p class="p-3 rounded-xl bg-[#F6F8FC] text-[#43506B] font-semibold">Di langkah ini belum ada jadwal dan soal — keduanya dikerjakan di langkah berikutnya.</p>
            </div>

            <div v-else class="space-y-3.5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Tanggal dan Waktu Mulai</label>
                  <input v-model="newExam.startsAt" type="datetime-local" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
                </div>
                <div>
                  <label class="block font-bold text-[#344054] mb-1">Token Peserta</label>
                  <input value="Satu token untuk seluruh mapel, dibuat otomatis" readonly class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#667085] bg-[#F6F8FC] outline-none">
                </div>
              </div>
              <div>
                <label for="exam-bank" class="block font-bold text-[#344054] mb-1">{{ source === 'ujian_harian' ? 'Bank Soal LMS (ujian harian)' : 'Bank Soal CBT (PTS/PAS)' }}</label>
                <select id="exam-bank" v-model="newExam.questionBankId" class="w-full min-h-11 border border-[#E7EBF2] rounded-xl p-2.5 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5FD9]">
                  <option value="" disabled>Pilih bank soal</option>
                  <option v-for="pkg in availablePackages.filter(p => p.subjectId === newExam.subjectId)" :key="pkg.id" :value="pkg.id">{{ pkg.subject }} &middot; {{ pkg.code }}</option>
                </select>
              </div>
              <div class="flex rounded-xl bg-[#EEF1F6] p-1 gap-1">
                <button type="button" class="flex-1 px-3 py-2 rounded-lg text-xs font-extrabold" :class="soalMode === 'acak' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'" @click="soalMode = 'acak'">Acak oleh Sistem</button>
                <button type="button" class="flex-1 px-3 py-2 rounded-lg text-xs font-extrabold" :class="soalMode === 'manual' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'" @click="soalMode = 'manual'">Pilih Sendiri</button>
              </div>
              <div v-if="soalMode === 'acak'" class="space-y-2.5 rounded-xl border border-[#E7EBF2] p-3">
                <div class="flex items-end gap-2">
                  <div class="flex-1">
                    <label class="block font-bold text-[#344054] mb-1">Berapa soal yang dipakai</label>
                    <input v-model="acakCount" type="number" min="1" :max="bankQuestions.length || 1" class="w-full border border-[#E7EBF2] rounded-xl p-2.5 text-xs text-[#101828] outline-none">
                  </div>
                  <button type="button" class="px-4 py-2.5 rounded-xl bg-[#1B5FD9] text-white text-xs font-extrabold" @click="rollRandom">Acak Soal</button>
                </div>
                <p class="font-bold text-[#0A2A5C]" aria-live="polite">{{ selectedQuestionIds.length }} soal terpasang dari {{ bankQuestions.length }} soal di bank</p>
                <p v-if="loadingSelection" role="status">Memuat soal&hellip;</p>
                <div v-else-if="selectionError" role="alert" class="text-[#B42318]">{{ selectionError }} <button type="button" class="min-h-11 px-2 underline" @click="loadSelection(requestedQuestionIds)">Muat ulang soal</button></div>
                <div v-else class="flex flex-wrap gap-1.5">
                  <span v-for="q in orderedQuestions" :key="q.id" class="px-2 py-1 rounded-lg bg-[#E8F0FE] text-[#0A2A5C] font-bold">Soal {{ q.number }}</span>
                </div>
                <p class="text-[#667085]">Hasil acakan tersimpan untuk ujian ini dan terkunci setelah disimpan. Masih bisa diacak ulang sebelum itu.</p>
              </div>
              <fieldset v-if="soalMode === 'manual'" class="min-w-0 space-y-2 rounded-xl border border-[#E7EBF2] p-3">
              <legend class="px-1 font-bold text-[#344054]">Pemilihan soal</legend>
              <p aria-live="polite" class="font-bold text-[#0A2A5C]">{{ selectedQuestionIds.length }} dari {{ bankQuestions.length }} soal terpilih</p>
              <p v-if="loadingSelection" role="status">Memuat soal…</p>
              <div v-else-if="selectionError" role="alert" class="text-[#B42318]">
                {{ selectionError }}
                <button type="button" class="min-h-11 px-2 underline" @click="loadSelection(requestedQuestionIds)">Muat ulang soal</button>
              </div>
              <template v-else>
                <label class="flex min-h-11 items-center gap-2 font-bold">
                  <input type="checkbox" :checked="bankQuestions.length > 0 && selectedQuestionIds.length === bankQuestions.length" :indeterminate="selectedQuestionIds.length > 0 && selectedQuestionIds.length < bankQuestions.length" :disabled="!bankQuestions.length" @change="selectedQuestionIds = ($event.target as HTMLInputElement).checked ? bankQuestions.map(q => q.id) : []">
                  Pilih semua
                </label>
                <div class="max-h-56 overflow-y-auto divide-y divide-[#E7EBF2]">
                  <label v-for="q in bankQuestions" :key="q.id" class="flex min-h-11 items-start gap-2 py-3">
                    <input type="checkbox" class="mt-1 shrink-0" :aria-label="`Pilih soal ${q.number}`" :checked="selectedQuestionIds.includes(q.id)" @change="toggleQuestion(q.id)">
                    <span class="shrink-0 font-bold">{{ q.number }}.</span>
                    <span class="min-w-0 flex-1 overflow-x-auto break-words" :dir="q.isRtl || isArabicText(q.text) ? 'rtl' : 'ltr'" v-html="renderKaTeXHtml(q.text)" />
                  </label>
                </div>
                <p v-if="!bankQuestions.length" class="text-[#667085]">Belum ada soal di bank yang dipilih.</p>
                <div v-if="orderedQuestions.length" class="border-t border-[#E7EBF2] pt-3">
                  <p class="font-bold text-[#344054]">Urutan soal siswa</p>
                  <ol class="max-h-48 overflow-y-auto">
                    <li v-for="(q, index) in orderedQuestions" :key="q.id" class="flex items-center justify-between gap-2 py-1">
                      <span>{{ index + 1 }}. Soal bank nomor {{ q.number }}</span>
                      <span class="flex shrink-0 gap-1">
                        <button type="button" class="min-h-11 rounded-lg border px-2 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5FD9]" :aria-label="`Naikkan soal ${q.number}`" :disabled="index === 0" @click="moveQuestion(index, -1)">Naik</button>
                        <button type="button" class="min-h-11 rounded-lg border px-2 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5FD9]" :aria-label="`Turunkan soal ${q.number}`" :disabled="index === orderedQuestions.length - 1" @click="moveQuestion(index, 1)">Turun</button>
                      </span>
                    </li>
                  </ol>
                </div>
              </template>
            </fieldset>
              <label class="flex items-start gap-2.5 p-3 rounded-xl border border-[#E7EBF2] cursor-pointer">
                <input v-model="newExam.acakEsai" type="checkbox" class="mt-0.5 h-4 w-4 accent-[#1B5FD9]">
                <span><b class="block text-[#344054]">Acak urutan soal Esai</b><span class="text-[#667085]">Aktif: tiap siswa mendapat urutan Esai berbeda. Nonaktif: urutan Esai sesuai susunan guru.</span></span>
              </label>
              <div class="rounded-xl bg-[#101828] text-[#C9D6F2] p-4 space-y-1.5">
                <p class="font-extrabold text-white">Ringkasan Ujian</p>
                <div class="flex justify-between gap-3"><span>Nama</span><b class="text-white text-right">{{ newExam.name || '-' }}</b></div>
                <div class="flex justify-between gap-3"><span>Mapel &middot; Rombel</span><b class="text-white text-right">{{ ringkasanMapel }} &middot; {{ ringkasanKelas }}</b></div>
                <div class="flex justify-between gap-3"><span>Jadwal</span><b class="text-white text-right">{{ ringkasanJadwal }}</b></div>
                <div class="flex justify-between gap-3"><span>Soal</span><b class="text-white text-right">{{ selectedQuestionIds.length }} soal ({{ soalMode === 'acak' ? 'diacak sistem' : 'pilih sendiri' }})</b></div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-[#E7EBF2] bg-[#FAFBFC] flex items-center justify-between gap-2">
            <button v-if="wizardStep === 2" type="button" class="px-4 py-2 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-white" @click="wizardStep = 1">Kembali</button>
            <span v-else></span>
            <div class="flex items-center gap-2">
              <button type="button" class="px-4 py-2 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054] hover:bg-white" @click="isCreateModalOpen = false">Batal</button>
              <button v-if="wizardStep === 1" type="button" class="px-5 py-2 rounded-xl bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm" @click="goStep2">Lanjut ke Jadwal &amp; Soal</button>
              <button v-else type="button" class="px-5 py-2 rounded-xl bg-[#101828] hover:bg-[#1E293B] text-white text-xs font-bold shadow-sm" @click="saveSchedule" :disabled="isSaving || loadingSelection || !!selectionError || !selectedQuestionIds.length">{{ isSaving ? 'Menyimpan…' : (newExam.id ? 'Simpan Perubahan' : 'Simpan & Tayangkan') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <CbtV2RombelViolations
      v-if="kueri('pelanggaran') && rombelDetail"
      :classroom="rombelDetail.classroom"
      :exams="ujianRombel"
      :source="source ?? 'cbt'"
      @close="ubahKueri({ pelanggaran: undefined })"
      @toast="emit('toast', $event)"
    />
    <CbtV2ExamTokens
      v-if="tokenExam"
      :exam="tokenExam"
      :source="source"
      @close="ubahKueri({ token: undefined })"
      @toast="emit('toast', $event)"
    />
  </div>
</template>
