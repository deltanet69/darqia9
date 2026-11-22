<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import CbtV2SebQuit from './CbtV2SebQuit.vue'
import { eksporJadwalRuang } from '~/utils/cbtExcelJadwalRuang'
import type { GradeType } from './cbtV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import {
  useRuangUjian, type RuangUjian, type AnggotaRuang, type SiswaBebas, type AlertRuang, type TautanUjian
} from '~/composables/useRuangUjian'
import {
  barisSiswa, ringkasProgres, komposisiKelas, labelStatus, labelPelanggaran, persenProgres, type ProgresRow
} from '~/composables/ruangUjianCore'

const props = defineProps<{ room: RuangUjian, grade: GradeType, arsip: boolean }>()
const emit = defineEmits<{
  (e: 'back'): void
  (e: 'changed'): void
  (e: 'toast', msg: string): void
}>()

const api = useRuangUjian()
const route = useRoute()
const router = useRouter()
const cbtData = useAdminCbtData('cbt')
const rbac = useRbac()

type SubTab = 'overview' | 'jadwal' | 'siswa' | 'alert'
const SUB_TABS: { id: SubTab, label: string, icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'jadwal', label: 'Jadwal Ujian', icon: 'clock' },
  { id: 'siswa', label: 'Daftar Siswa', icon: 'users' },
  { id: 'alert', label: 'Alert Ujian', icon: 'alert' }
]
const sub = ref<SubTab>('overview')

const anggota = ref<AnggotaRuang[]>([])
const progres = ref<ProgresRow[]>([])
const alerts = ref<AlertRuang[]>([])
const tautan = ref<TautanUjian[]>([])
// Jadwal dari Daftar Ujian yang ditolak masuk ruang ini (mis. dua mapel berbeda di jam yang sama).
const ditolak = ref<string[]>([])
const loading = ref(true)
const error = ref('')
let timer: ReturnType<typeof setInterval> | null = null

const muatRingan = async () => {
  const [p, a] = await Promise.all([api.muatProgres(props.room.id), api.muatAlert(props.room.id)])
  progres.value = p
  alerts.value = a
}
const muatSemua = async () => {
  error.value = ''
  try {
    // Jadwal ruang = ujian kelas-kelas siswanya dari Daftar Ujian, ditautkan otomatis (migrasi 0091).
    if (bolehKelola.value && !props.arsip) ditolak.value = await api.sinkronJadwal(props.room.id).catch(e => [e instanceof Error ? e.message : 'Jadwal ruang gagal disinkronkan.'])
    const [m, t] = await Promise.all([api.muatAnggota(props.room.id), api.muatTautanUjian([props.room.id]), muatRingan()])
    anggota.value = m
    tautan.value = t
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Data ruang gagal dimuat.'
  } finally { loading.value = false }
}
onMounted(async () => {
  void cbtData.load()
  await muatSemua()
  // Dari tombol Atur Pengawas di daftar ruang (?jadwal=atur): langsung buka menu Jadwal Ujian.
  if (route.query.jadwal === 'atur') {
    sub.value = 'jadwal'
    void router.replace({ query: { ...route.query, jadwal: undefined } })
  }
  // Progres diperbarui tiap 15 detik selama halaman terbuka dan tab browser terlihat.
  timer = setInterval(() => { if (!document.hidden && !props.arsip) void muatRingan().catch(() => {}) }, 15_000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

// Satu "jadwal ruang" = ujian-ujian kelas dengan mapel, jadwal, dan nama yang sama. Pengawas melekat di
// tautan ruang + jadwal (migrasi 0088), jadi pengawas ruang ini tidak ikut menjadi pengawas ruang lain.
const ujianSemua = computed(() => {
  const pengawasExam = new Map(tautan.value.map(item => [item.exam_id, item.supervisor_id ?? '']))
  const grup = new Map<string, { key: string, name: string, subject: string, subjectId: string, startsAt: string, duration: number, date: string, time: string, status: string, supervisorId: string, examIds: string[], kelas: string[] }>()
  for (const exam of cbtData.exams.value.filter(item => pengawasExam.has(item.id))) {
    const key = `${exam.subjectId}|${exam.startsAt}|${exam.name}`
    const ada = grup.get(key)
    if (ada) { ada.examIds.push(exam.id); ada.supervisorId ||= pengawasExam.get(exam.id)!; if (exam.classroom && !ada.kelas.includes(exam.classroom)) ada.kelas.push(exam.classroom) }
    else grup.set(key, { key, name: exam.name, subject: exam.subject, subjectId: exam.subjectId ?? '', startsAt: exam.startsAt ?? '', duration: exam.duration, date: exam.date, time: exam.time, status: exam.status, supervisorId: pengawasExam.get(exam.id)!, examIds: [exam.id], kelas: exam.classroom ? [exam.classroom] : [] })
  }
  return [...grup.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
})
const saya = computed(() => rbac.state.value.subjekSaya ?? '')
// Kelola isi ruang (tambah/keluarkan siswa, tugaskan ujian & pengawas) = izin Ubah sub-modul Ruang Ujian (RBAC).
const bolehKelola = computed(() => rbac.bolehAksi('Manajemen CBT', 'rooms', 'ubah', rbac.adalahSuperadmin.value))
// Peran RBAC dimuat async: bila izin kelola baru terbaca setelah ruang dibuka, muat ulang agar jadwal ikut disinkronkan.
watch(bolehKelola, ok => { if (ok) void muatSemua() })
// Selain pengelola, akun hanya melihat jadwal yang ia awasi di ruang ini.
const ujianRuang = computed(() => bolehKelola.value ? ujianSemua.value : ujianSemua.value.filter(u => !!saya.value && u.supervisorId === saya.value))
const ujianPilihan = ref('')
watch(ujianRuang, list => {
  if (!list.some(item => item.key === ujianPilihan.value)) {
    ujianPilihan.value = (list.find(item => item.status === 'Berlangsung') ?? list[0])?.key ?? ''
  }
}, { immediate: true })
const ujianAktif = computed(() => ujianRuang.value.find(item => item.key === ujianPilihan.value) ?? null)

const baris = computed(() => barisSiswa(progres.value, ujianAktif.value ? ujianAktif.value.examIds : null))
const ringkas = computed(() => ringkasProgres(baris.value))
const donatOffset = computed(() => (194.8 * (100 - Math.min(100, Math.max(0, ringkas.value.rataProgres)))) / 100)
const komposisi = computed(() => komposisiKelas(anggota.value.map(item => item.kelas)))
const examTampil = computed(() => new Set(ujianRuang.value.flatMap(u => u.examIds)))
const alertRuang = computed(() => bolehKelola.value ? alerts.value : alerts.value.filter(item => examTampil.value.has(item.exam_id)))
const alertTerkunci = computed(() => alertRuang.value.filter(item => item.locked).length)
const sisaKapasitas = computed(() => Math.max(0, props.room.capacity - anggota.value.length))
const namaGuru = (id: string) => cbtData.teachers.value.find(item => item.id === id)?.name ?? ''
// Pengawas: guru jenjang ini + Yayasan. Bila kosong (data guru belum berjenjang), semua guru aktif ditampilkan.
const guruGrade = computed(() => {
  const sesuai = cbtData.teachers.value.filter(item => item.grade === props.grade || item.grade === 'Yayasan')
  return sesuai.length ? sesuai : cbtData.teachers.value
})
const namaPengawas = computed(() => [...new Set(ujianSemua.value.map(u => namaGuru(u.supervisorId)).filter(Boolean))].join(', ') || 'Belum ditentukan')
// Kode quit SEB ruang: pengawas salah satu jadwal di ruang ini atau Superadmin. Kode pembuka per siswa hanya
// dikirim database untuk jadwal yang diawasi pemanggil (room_alerts 0088), jadi tombolnya mengikuti ada/tidaknya kode.
const bolehPunishment = computed(() => rbac.adalahSuperadmin.value || ujianSemua.value.some(u => !!saya.value && u.supervisorId === saya.value))
const pengawasSimpan = ref('')
const ubahPengawas = async (u: { key: string, examIds: string[], supervisorId: string }, el: HTMLSelectElement) => {
  const supervisorId = el.value
  pengawasSimpan.value = u.key
  try {
    await api.tugaskanPengawas(props.room.id, u.examIds, supervisorId || null)
    tautan.value = await api.muatTautanUjian([props.room.id])
    emit('toast', supervisorId ? `${namaGuru(supervisorId)} ditugaskan sebagai pengawas.` : 'Pengawas jadwal dikosongkan.')
  } catch (e) {
    emit('toast', e instanceof Error ? e.message : 'Pengawas gagal ditugaskan.')
    el.value = u.supervisorId // pilihan ditolak (mis. bentrok jam): kembalikan tampilan
    tautan.value = await api.muatTautanUjian([props.room.id]).catch(() => tautan.value)
  } finally { pengawasSimpan.value = '' }
}
const ringkasJadwal = (u: { examIds: string[] }) => ringkasProgres(barisSiswa(progres.value, u.examIds))

// Nomor sesi per tanggal: urutan jam mulai yang berbeda pada tanggal yang sama (Sesi 1, Sesi 2, ...).
const sesiDari = computed(() => {
  const perTanggal = new Map<string, Map<string, number>>()
  for (const u of ujianRuang.value) {
    const m = perTanggal.get(u.date) ?? new Map<string, number>()
    if (!m.has(u.startsAt)) m.set(u.startsAt, m.size + 1)
    perTanggal.set(u.date, m)
  }
  return perTanggal
})
const nomorSesi = (u: { date: string, startsAt: string }) => sesiDari.value.get(u.date)?.get(u.startsAt) ?? 1
const jumlahSesi = computed(() => [...sesiDari.value.values()].reduce((n, m) => n + m.size, 0))
const jumlahJadwalKelas = computed(() => ujianRuang.value.reduce((n, u) => n + u.examIds.length, 0))
const belumAdaPengawas = computed(() => ujianRuang.value.filter(u => !u.supervisorId).length)
const jamU = (u: { time: string }, akhir = false) => u.time.split(' - ')[akhir ? 1 : 0] ?? ''
const hariU = (u: { startsAt: string }) => u.startsAt ? new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(u.startsAt)) : ''
const inisial = (nama: string) => nama.trim().split(/\s+/).slice(0, 2).map(k => k[0]).join('').toUpperCase() || '?'
// Lebar segmen bar progres dari jumlah siswa per status (bukan rata-rata persen jawaban).
const lebarBar = (u: { examIds: string[] }) => {
  const r = ringkasJadwal(u)
  const total = Math.max(1, r.selesai + r.mengerjakan + r.belumMulai + r.terkunci)
  return { selesai: (r.selesai / total) * 100, mengerjakan: (r.mengerjakan / total) * 100 }
}

const cari = ref('')
const barisTampil = computed(() => {
  const q = cari.value.trim().toLowerCase()
  const list = q ? baris.value.filter(r => `${r.student_name} ${r.nis ?? ''} ${r.class_name ?? ''}`.toLowerCase().includes(q)) : baris.value
  return list
})
const statusKelas = (status: string, adaUjian: boolean) => !adaUjian ? 'bg-[#EFF2F7] text-[#475467]'
  : status === 'selesai' ? 'bg-[#E7F8F0] text-[#087C52]'
    : status === 'berlangsung' ? 'bg-[#E8F0FE] text-[#0A2A5C]'
      : status === 'terkunci' ? 'bg-[#FDECEA] text-[#B42318]' : 'bg-[#EFF2F7] text-[#475467]'

const keluarkan = async (row: { student_id: string, student_name: string, status: string, exam_id: string | null }) => {
  if (row.exam_id && row.status !== 'belum_mulai') return emit('toast', 'Siswa sudah mengerjakan ujian dan tidak dapat dikeluarkan.')
  if (!confirm(`Keluarkan ${row.student_name} dari ${props.room.name}?`)) return
  try {
    await api.keluarkanAnggota(props.room.id, row.student_id)
    await muatSemua()
    emit('changed')
    emit('toast', `${row.student_name} dikeluarkan dari ruang.`)
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Siswa gagal dikeluarkan.') }
}

// ---- Alert ----
const hanyaTerkunci = ref(false)
const alertTampil = computed(() => hanyaTerkunci.value ? alertRuang.value.filter(item => item.locked) : alertRuang.value)
const waktu = (iso: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
const salinKode = async (kode: string) => {
  try { await navigator.clipboard.writeText(kode); emit('toast', `Kode ${kode} disalin.`) } catch { emit('toast', 'Kode gagal disalin.') }
}
const bukaKunci = async (item: AlertRuang) => {
  if (!confirm(`Buka kunci ${item.student_name}? Pastikan siswa sudah ditegur pengawas.`)) return
  try {
    await api.bukaKunci(item.violation_id)
    await muatRingan()
    emit('toast', `Kunci ${item.student_name} dibuka.`)
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Kunci gagal dibuka.') }
}

// ---- Tambah siswa ----
const tambahOpen = ref(false)
const bebas = ref<SiswaBebas[]>([])
const bebasMuat = ref(false)
const pilih = ref<string[]>([])
const cariBebas = ref('')
const filterKelas = ref('')
const acakJumlah = ref(0)
const saving = ref(false)
const kelasBebas = computed(() => [...new Map(bebas.value.map(item => [item.classId, item.kelas])).entries()].map(([id, nama]) => ({ id, nama })).sort((a, b) => a.nama.localeCompare(b.nama)))
const bebasTampil = computed(() => {
  const q = cariBebas.value.trim().toLowerCase()
  return bebas.value.filter(item => (!filterKelas.value || item.classId === filterKelas.value)
    && (!q || `${item.nama} ${item.nis} ${item.kelas}`.toLowerCase().includes(q)))
})
const bukaTambah = async () => {
  pilih.value = []
  cariBebas.value = ''
  filterKelas.value = ''
  acakJumlah.value = sisaKapasitas.value
  tambahOpen.value = true
  bebasMuat.value = true
  try { bebas.value = await api.muatSiswaBebas(props.grade, props.room.periode) } catch (e) { emit('toast', e instanceof Error ? e.message : 'Data siswa gagal dimuat.') } finally { bebasMuat.value = false }
}
const togglePilih = (id: string) => {
  if (pilih.value.includes(id)) pilih.value = pilih.value.filter(item => item !== id)
  else if (pilih.value.length >= sisaKapasitas.value) emit('toast', `Kapasitas ruang tinggal ${sisaKapasitas.value} siswa.`)
  else pilih.value = [...pilih.value, id]
}
const selesaiTambah = async (pesan: string) => {
  tambahOpen.value = false
  await muatSemua()
  emit('changed')
  emit('toast', pesan)
}
const tambahPilihan = async () => {
  if (!pilih.value.length) return emit('toast', 'Pilih minimal satu siswa.')
  saving.value = true
  try { await selesaiTambah(`${await api.tambahAnggota(props.room.id, pilih.value)} siswa ditambahkan ke ${props.room.name}.`) }
  catch (e) { emit('toast', e instanceof Error ? e.message : 'Siswa gagal ditambahkan.') } finally { saving.value = false }
}
const tambahAcak = async () => {
  const n = Math.floor(Number(acakJumlah.value))
  if (!n || n < 1 || n > sisaKapasitas.value) return emit('toast', `Jumlah acak harus 1 sampai ${sisaKapasitas.value}.`)
  saving.value = true
  try { await selesaiTambah(`${await api.isiAcak(props.room.id, n, filterKelas.value ? [filterKelas.value] : null)} siswa acak ditambahkan.`) }
  catch (e) { emit('toast', e instanceof Error ? e.message : 'Pengisian acak gagal.') } finally { saving.value = false }
}

const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
const eksporExcel = async () => {
  try {
    const berkas = `jadwal-${props.room.name}-${props.room.periode}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await eksporJadwalRuang(`${berkas}.xlsx`, ujianRuang.value.map((u) => {
      const mulai = localDateTime(new Date(u.startsAt))
      return {
        tanggal: mulai.slice(0, 10), mulai: mulai.slice(11, 16),
        selesai: localDateTime(new Date(new Date(u.startsAt).getTime() + u.duration * 60_000)).slice(11, 16),
        mapel: u.subject, pengawas: namaGuru(u.supervisorId)
      }
    }))
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Export gagal.') }
}
</script>

<template>
  <div class="space-y-4 mt-10">
    <!-- Header ruang -->
    <div class="rounded-[22px] bg-[#0A2A5C] px-5 py-5 shadow-sm sm:px-6 ">
      <button type="button" class="mb-3 inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-[#C7D7F2] hover:text-white" @click="emit('back')">
        <AdminV2Icon name="back" :size="14" /><span>Semua ruang</span>
      </button>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <span class="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#DCE9FF]">{{ room.periode }}</span>
          <h2 class="mt-2 text-xl font-extrabold text-white sm:text-2xl">{{ room.name }}</h2>
          <p class="mt-1 text-xs text-[#C7D7F2]">{{ anggota.length }} / {{ room.capacity }} siswa<template v-if="ujianSemua.length"> · Pengawas: {{ namaPengawas }}</template></p>
        </div>
        <div v-if="!arsip && bolehKelola" class="flex gap-2">
          <button type="button" class="min-h-11 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-bold text-white hover:bg-white/20 sm:flex-none" @click="bukaTambah">Tambah Siswa</button>
        </div>
      </div>
    </div>

    <!-- Sub menu (gaya sama dengan tab CBT lain) -->
    <div class="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <nav class="inline-flex min-w-max items-center gap-1 rounded-2xl border border-[#E7EBF2] bg-[#EFF2F7] p-1.5" role="tablist" aria-label="Navigasi ruang ujian">
        <button
          v-for="tab in SUB_TABS" :key="tab.id" type="button" role="tab"
          class="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[12.5px] transition-all sm:px-4"
          :class="sub === tab.id ? 'bg-white font-bold text-[#101828] shadow-[0_1px_4px_rgba(16,24,40,0.12)]' : 'font-semibold text-[#667085] hover:text-[#101828]'"
          :aria-selected="sub === tab.id" @click="sub = tab.id"
        >
          <AdminV2Icon :name="tab.icon" :size="15" :class="sub === tab.id ? 'text-[#1B5FD9]' : 'text-[#667085]'" />
          <span>{{ tab.label }}</span>
          <span v-if="tab.id === 'alert' && alertTerkunci" class="rounded-full bg-[#FDECEA] px-2 py-0.5 text-[10px] font-extrabold text-[#B42318]">{{ alertTerkunci }} terkunci</span>
        </button>
      </nav>
    </div>

    <div v-if="error" class="rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-xs text-[#B42318]" role="alert">{{ error }}</div>
    <div v-else-if="loading" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">Memuat data ruang…</div>

    <template v-else>
      <!-- Pilih ujian (Daftar Siswa; di Overview pemilih menyatu di panel ringkasan) -->
      <div v-if="sub === 'siswa' && ujianRuang.length" class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-[#344054]" for="ujian-ruang">Ujian di ruang ini</label>
        <select id="ujian-ruang" v-model="ujianPilihan" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm sm:max-w-xl">
          <option v-for="u in ujianRuang" :key="u.key" :value="u.key">{{ u.subject }} · {{ u.name }} · {{ u.date }} {{ u.time }}</option>
        </select>
      </div>

      <!-- OVERVIEW -->
      <div v-if="sub === 'overview'" class="space-y-4">
        <!-- Panel ringkasan: pemilih ujian + donut progres + angka kunci dalam satu permukaan terang -->
        <section class="rounded-[20px] border border-[#E5EAF1] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,24,40,0.08)] p-5 sm:p-6">
          <div class="flex flex-wrap items-center gap-x-5 gap-y-4">
            <div v-if="ujianRuang.length" class="w-full sm:w-[min(430px,100%)]">
              <label class="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]" for="ujian-ruang-ov">Ujian yang ditampilkan</label>
              <select id="ujian-ruang-ov" v-model="ujianPilihan" class="min-h-[42px] w-full rounded-[11px] border border-[#DFE5EE] bg-white px-3 text-[13px] font-medium text-[#101828] shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none focus:border-[#1B5FD9]">
                <option v-for="u in ujianRuang" :key="u.key" :value="u.key">{{ u.subject }} · {{ u.name }} · {{ u.date }} {{ u.time }}</option>
              </select>
            </div>
            <div class="min-w-0">
              <template v-if="ujianAktif">
                <h3 class="text-base font-semibold tracking-tight text-[#101828] sm:text-[17px]">{{ ujianAktif.subject }} <span class="font-normal text-[#7A8699]">· {{ ujianAktif.name }}</span></h3>
                <p class="mt-0.5 text-xs text-[#98A2B3]">{{ hariU(ujianAktif) }}, {{ ujianAktif.date }} · {{ ujianAktif.time }} · {{ ujianAktif.examIds.length }} kelas · <b class="font-semibold" :class="ujianAktif.status === 'Berlangsung' ? 'text-[#0B7A4B]' : ujianAktif.status === 'Selesai' ? 'text-[#667085]' : 'text-[#9A6A14]'">{{ ujianAktif.status }}</b></p>
              </template>
              <template v-else>
                <h3 class="text-base font-semibold tracking-tight text-[#101828]">Belum ada ujian di ruang ini</h3>
                <p class="mt-0.5 text-xs text-[#98A2B3]">Jadwal muncul otomatis setelah ujian kelas siswa ruang ini dibuat di Daftar Ujian.</p>
              </template>
            </div>
            <div class="ml-auto flex-none text-center">
              <div class="relative h-[76px] w-[76px]">
                <svg width="76" height="76" viewBox="0 0 76 76" class="-rotate-90" aria-hidden="true">
                  <circle cx="38" cy="38" r="31" fill="none" stroke="#EEF1F6" stroke-width="7" />
                  <circle cx="38" cy="38" r="31" fill="none" stroke="#34C77B" stroke-width="7" stroke-linecap="round" stroke-dasharray="194.8" :stroke-dashoffset="donatOffset" />
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-[15px] font-bold tabular-nums text-[#0A2A5C]">{{ ringkas.rataProgres }}%</span>
              </div>
              <p class="mt-1 text-[10.5px] font-medium text-[#98A2B3]">Progres pengerjaan</p>
            </div>
          </div>
          <div class="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 border-t border-[#EEF1F6] pt-5 lg:grid-cols-6">
            <div>
              <span class="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#EAF1FE] text-[#1B5FD9]"><AdminV2Icon name="users" :size="17" /></span>
              <b class="mt-2.5 block text-[25px] font-semibold leading-none tabular-nums text-[#101828]">{{ ringkas.siswa }}</b>
              <span class="mt-1 block text-xs font-medium text-[#667085]">Siswa</span>
            </div>
            <div>
              <span class="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#F0EBFA] text-[#6941C6]"><AdminV2Icon name="pencil" :size="17" /></span>
              <b class="mt-2.5 block text-[25px] font-semibold leading-none tabular-nums text-[#101828]">{{ ringkas.mengerjakan }}</b>
              <span class="mt-1 block text-xs font-medium text-[#667085]">Mengerjakan</span>
            </div>
            <div>
              <span class="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#E6F7EE] text-[#0B7A4B]"><AdminV2Icon name="check" :size="17" /></span>
              <b class="mt-2.5 block text-[25px] font-semibold leading-none tabular-nums text-[#101828]">{{ ringkas.selesai }}</b>
              <span class="mt-1 block text-xs font-medium text-[#667085]">Selesai</span>
            </div>
            <div>
              <span class="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#EEF1F6] text-[#667085]"><AdminV2Icon name="clock" :size="17" /></span>
              <b class="mt-2.5 block text-[25px] font-semibold leading-none tabular-nums text-[#101828]">{{ ringkas.belumMulai }}</b>
              <span class="mt-1 block text-xs font-medium text-[#667085]">Belum mulai</span>
            </div>
            <div>
              <span class="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#FBF3E0] text-[#B07E1E]"><AdminV2Icon name="shield" :size="17" /></span>
              <b class="mt-2.5 block text-[25px] font-semibold leading-none tabular-nums" :class="ringkas.terkunci ? 'text-[#D92D20]' : 'text-[#101828]'">{{ ringkas.terkunci }}</b>
              <span class="mt-1 block text-xs font-medium text-[#667085]">Terkunci</span>
            </div>
            <div>
              <span class="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#FDECEA] text-[#D92D20]"><AdminV2Icon name="alert" :size="17" /></span>
              <b class="mt-2.5 block text-[25px] font-semibold leading-none tabular-nums text-[#101828]">{{ ringkas.pelanggaran }}</b>
              <span class="mt-1 block text-xs font-medium text-[#667085]">Pelanggaran</span>
            </div>
          </div>
        </section>

        <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div class="min-w-0 space-y-4">
            <section class="rounded-[20px] border border-[#E5EAF1] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,24,40,0.08)] p-5">
              <h3 class="flex items-center gap-2.5 text-[13px] font-semibold text-[#101828]"><span class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#EAF1FE] text-[#1B5FD9]"><AdminV2Icon name="cal" :size="14" /></span>Ujian di ruang ini</h3>
              <p v-if="!ujianRuang.length" class="mt-2.5 text-xs text-[#667085]">Belum ada ujian. {{ arsip || !bolehKelola ? '' : 'Jadwal muncul otomatis setelah ujian kelas siswa ruang ini dibuat di Daftar Ujian.' }}</p>
              <ul v-else class="mt-2 divide-y divide-[#EFF2F7]">
                <li v-for="u in ujianRuang" :key="u.key" class="flex items-start justify-between gap-3 py-2.5">
                  <div class="min-w-0">
                    <b class="block break-words text-xs font-bold text-[#101828]">{{ u.subject }} · {{ u.name }}</b>
                    <span class="text-[11px] text-[#667085]">{{ u.date }} · {{ u.time }} · {{ u.examIds.length }} kelas</span>
                  </div>
                  <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="u.status === 'Berlangsung' ? 'bg-[#E7F8F0] text-[#087C52]' : u.status === 'Selesai' ? 'bg-[#EFF2F7] text-[#344054]' : 'bg-[#FEF4E5] text-[#AD6504]'">{{ u.status }}</span>
                </li>
              </ul>
            </section>

            <section class="rounded-[20px] border border-[#E5EAF1] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,24,40,0.08)] p-5">
              <h3 class="flex items-center gap-2.5 text-[13px] font-semibold text-[#101828]"><span class="inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#F0EBFA] text-[#6941C6]"><AdminV2Icon name="layers" :size="14" /></span>Asal kelas siswa</h3>
              <p v-if="!komposisi.length" class="mt-2.5 text-xs text-[#667085]">Ruang masih kosong.</p>
              <template v-else>
                <div class="mt-3 flex flex-wrap gap-1.5">
                  <span v-for="k in komposisi" :key="k.kelas" class="inline-flex items-baseline gap-1.5 rounded-lg bg-[#F7F9FC] px-2.5 py-[5px] text-xs font-semibold text-[#344054]">{{ k.kelas }} <b class="font-semibold tabular-nums text-[#0A2A5C]">{{ k.jumlah }}</b> <small class="text-[10.5px] font-medium text-[#98A2B3]">siswa</small></span>
                </div>
                <p class="mt-3 border-t border-[#EEF1F6] pt-2.5 text-xs text-[#98A2B3]">Total <b class="font-semibold text-[#344054]">{{ anggota.length }} siswa</b> dari <b class="font-semibold text-[#344054]">{{ komposisi.length }} kelas</b></p>
              </template>
            </section>
          </div>

          <CbtV2SebQuit v-if="bolehPunishment" :target-id="room.id" class="min-w-0" @toast="emit('toast', $event)" />
        </div>
      </div>

      <!-- JADWAL UJIAN -->
      <div v-else-if="sub === 'jadwal'" class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-xs font-medium text-[#667085]"><b class="font-semibold text-[#0A2A5C]">{{ jumlahSesi }} sesi</b> · {{ jumlahJadwalKelas }} jadwal kelas · <b class="font-semibold text-[#0A2A5C]">{{ belumAdaPengawas }}</b> belum ada pengawas</p>
          <button type="button" class="ml-auto inline-flex min-h-10 items-center rounded-xl border border-[#E5EAF1] bg-white px-4 text-xs font-semibold text-[#475467] hover:border-[#1B5FD9] hover:text-[#1B5FD9]" @click="eksporExcel">Export Excel</button>
        </div>
        <div v-if="ditolak.length" role="alert" class="rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-xs text-[#B42318]">
          <p class="font-bold">Sebagian jadwal dari Daftar Ujian belum bisa masuk ruang ini:</p>
          <ul class="mt-1 list-disc pl-4"><li v-for="(g, i) in ditolak" :key="i">{{ g }}</li></ul>
        </div>
        <p v-if="!ujianRuang.length" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">Belum ada jadwal ujian di ruang ini. Jadwal muncul otomatis dari Daftar Ujian sesuai kelas siswa di ruang ini.</p>
        <p v-else-if="!arsip && bolehKelola" class="flex gap-2.5 rounded-xl border border-[#E5EAF1] bg-[#F8FAFD] px-4 py-3 text-xs leading-relaxed text-[#5B6B82]"><span class="font-bold text-[#1B5FD9]">i</span><span>Jam dan mapel diatur di <b class="font-semibold text-[#344054]">Daftar Ujian</b>. Di sini cukup pilih pengawas untuk tiap jadwal — satu guru tidak bisa mengawasi dua ruang di jam yang sama, dan pengawas hanya bisa membuka ruang serta jadwal yang ia awasi.</span></p>
        <article v-for="u in ujianRuang" :key="u.key" class="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:flex-row sm:gap-5 sm:p-5" :class="[saya && u.supervisorId === saya ? 'border-[#B9D2F7]' : 'border-[#E5EAF1]', u.status === 'Selesai' ? 'opacity-75' : '']">
          <div class="flex flex-row flex-wrap items-baseline gap-x-2.5 gap-y-1 border-b border-[#EEF1F6] pb-3 sm:w-[122px] sm:flex-none sm:flex-col sm:items-start sm:border-b-0 sm:border-r sm:pb-0 sm:pr-[18px]">
            <span class="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#1B5FD9]">Sesi {{ nomorSesi(u) }}</span>
            <span class="text-[11.5px] font-medium leading-snug text-[#8A94A6]">{{ hariU(u) }}, {{ u.date }}</span>
            <span class="text-xl font-semibold tabular-nums tracking-tight text-[#0A2A5C] sm:mt-1 sm:text-2xl">{{ jamU(u) }}<small class="block text-sm font-medium text-[#98A2B3]">– {{ jamU(u, true) }}</small></span>
            <span class="ml-auto text-[11.5px] font-medium text-[#8A94A6] sm:ml-0 sm:mt-auto sm:pt-3">{{ u.duration }} menit</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start gap-2.5">
              <h3 class="text-[15.5px] font-semibold leading-snug tracking-tight text-[#101828]">{{ u.subject }} <span class="font-normal text-[#7A8699]">· {{ u.name }}</span></h3>
              <span class="ml-auto flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="u.status === 'Berlangsung' ? 'bg-[#E6F7EE] text-[#0B7A4B]' : u.status === 'Selesai' ? 'bg-[#EEF1F6] text-[#5B6B82]' : 'bg-[#FBF3E0] text-[#9A6A14]'">{{ u.status === 'Berlangsung' ? '● ' : '' }}{{ u.status }}</span>
            </div>
            <div class="mt-2.5 flex flex-wrap gap-1.5">
              <span v-for="k in u.kelas" :key="k" class="rounded-lg bg-[#F7F9FC] px-2.5 py-1 text-[11.5px] font-medium text-[#475467]">{{ k }}</span>
              <span v-if="!u.kelas.length" class="rounded-lg bg-[#F7F9FC] px-2.5 py-1 text-[11.5px] font-medium text-[#475467]">{{ u.examIds.length }} kelas</span>
            </div>
            <div class="mt-[18px] flex flex-wrap gap-x-[22px] gap-y-4 border-t border-[#EEF1F6] pt-4">
              <div class="min-w-0 flex-[1_1_300px]">
                <template v-if="!arsip && bolehKelola">
                  <label class="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[#8A94A6]" :for="`peng-${u.key}`">Pengawas <span v-if="!u.supervisorId" class="font-semibold normal-case tracking-normal text-[#B07E1E]">— belum ditentukan</span></label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-[11px] top-1/2 flex h-[23px] w-[23px] -translate-y-1/2 items-center justify-center rounded-full text-[10.5px] font-semibold" :class="u.supervisorId ? 'bg-[#EEF3FB] text-[#5B84C4]' : 'bg-[#FBF3E0] text-[#B07E1E]'">{{ u.supervisorId ? inisial(namaGuru(u.supervisorId)) : '?' }}</span>
                    <select :id="`peng-${u.key}`" :value="u.supervisorId" :disabled="!!pengawasSimpan" class="min-h-11 w-full appearance-none rounded-xl border pl-10 pr-9 text-sm font-medium outline-none focus:border-[#1B5FD9] disabled:opacity-60" :class="u.supervisorId ? 'border-[#DFE5EE] bg-white text-[#101828]' : 'border-[#EBCB8B] bg-[#FFFDF6] text-[#8A6D1F]'" @change="ubahPengawas(u, $event.target as HTMLSelectElement)">
                      <option value="">Belum ditentukan</option>
                      <option v-for="g in guruGrade" :key="g.id" :value="g.id">{{ g.name }}</option>
                    </select>
                    <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#B0B9C8]">▼</span>
                  </div>
                  <p v-if="pengawasSimpan === u.key" class="mt-1 text-[11px] font-semibold text-[#1B5FD9]" role="status">Menyimpan…</p>
                </template>
                <template v-else>
                  <p class="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[#8A94A6]">Pengawas</p>
                  <p class="pt-1.5 text-sm font-medium text-[#101828]">{{ namaGuru(u.supervisorId) || 'Belum ditentukan' }}<span v-if="saya && u.supervisorId === saya" class="ml-2 rounded-full bg-[#E8F0FE] px-2 py-0.5 text-[10px] font-semibold text-[#1B5FD9]">Tugas Anda</span></p>
                </template>
              </div>
              <div class="min-w-0 flex-[1_1_260px]">
                <p class="mb-2 flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[#8A94A6]">Progres siswa <b class="text-xs font-semibold normal-case tracking-normal text-[#0A2A5C]">{{ ringkasJadwal(u).rataProgres }}%</b></p>
                <div class="flex gap-2">
                  <div class="flex-1 rounded-[10px] bg-[#F8FAFC] px-1.5 py-2 text-center"><b class="block text-base font-semibold tabular-nums text-[#101828]">{{ ringkasJadwal(u).selesai }}</b><span class="text-[10.5px] font-medium text-[#8A94A6]">Selesai</span></div>
                  <div class="flex-1 rounded-[10px] bg-[#F8FAFC] px-1.5 py-2 text-center"><b class="block text-base font-semibold tabular-nums text-[#101828]">{{ ringkasJadwal(u).mengerjakan }}</b><span class="text-[10.5px] font-medium text-[#8A94A6]">Mengerjakan</span></div>
                  <div v-if="ringkasJadwal(u).terkunci" class="flex-1 rounded-[10px] bg-[#F8FAFC] px-1.5 py-2 text-center"><b class="block text-base font-semibold tabular-nums text-[#D92D20]">{{ ringkasJadwal(u).terkunci }}</b><span class="text-[10.5px] font-medium text-[#8A94A6]">Terkunci</span></div>
                  <div class="flex-1 rounded-[10px] bg-[#F8FAFC] px-1.5 py-2 text-center"><b class="block text-base font-semibold tabular-nums text-[#101828]">{{ ringkasJadwal(u).belumMulai }}</b><span class="text-[10.5px] font-medium text-[#8A94A6]">Belum mulai</span></div>
                </div>
                <div class="mt-[11px] flex h-[5px] overflow-hidden rounded-full bg-[#EEF1F6]">
                  <div class="h-full bg-[#34C77B]" :style="{ width: `${lebarBar(u).selesai}%` }" />
                  <div class="h-full bg-[#4A90D9]" :style="{ width: `${lebarBar(u).mengerjakan}%` }" />
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- DAFTAR SISWA -->
      <div v-else-if="sub === 'siswa'" class="space-y-3">
        <div class="relative">
          <AdminV2Icon name="search" :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input v-model="cari" type="search" placeholder="Cari nama, NIS, atau kelas" aria-label="Cari siswa" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#1B5FD9]">
        </div>

        <!-- Kartu (mobile) -->
        <div class="space-y-2.5 md:hidden">
          <article v-for="r in barisTampil" :key="r.student_id" class="rounded-2xl border border-[#E7EBF2] bg-white p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0"><b class="block break-words text-sm font-bold text-[#101828]">{{ r.student_name }}</b><span class="text-xs text-[#667085]">{{ r.nis || '-' }} · {{ r.class_name || '-' }}</span></div>
              <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold" :class="statusKelas(r.status, !!r.exam_id)">{{ r.exam_id ? labelStatus(r.status) : 'Tanpa ujian' }}</span>
            </div>
            <div v-if="r.exam_id" class="mt-3">
              <div class="flex justify-between text-[11px] font-semibold text-[#344054]"><span>{{ r.answered }} / {{ r.total }} soal</span><span>{{ persenProgres(r.answered, r.total) }}%</span></div>
              <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-[#EFF2F7]"><div class="h-full rounded-full bg-[#1B5FD9]" :style="{ width: `${persenProgres(r.answered, r.total)}%` }" /></div>
            </div>
            <div class="mt-3 flex items-center justify-between border-t border-[#EFF2F7] pt-3 text-xs">
              <span :class="r.violations ? 'font-bold text-[#B42318]' : 'text-[#667085]'">Pelanggaran: {{ r.violations }}</span>
              <button v-if="!arsip && bolehKelola" type="button" class="min-h-9 font-bold text-[#B42318]" @click="keluarkan(r)">Keluarkan</button>
            </div>
          </article>
        </div>

        <!-- Tabel (md ke atas) -->
        <section class="hidden overflow-hidden rounded-2xl border border-[#E7EBF2] bg-white md:block">
          <table class="w-full table-fixed text-left text-xs">
            <thead class="border-b border-[#E7EBF2] bg-[#FAFBFC] text-[10px] font-semibold uppercase tracking-wider text-[#667085]">
              <tr><th class="w-[30%] px-4 py-3">Siswa</th><th class="w-[12%] px-4 py-3">Kelas</th><th class="w-[14%] px-4 py-3">Status</th><th class="w-[24%] px-4 py-3">Progres</th><th class="w-[10%] px-4 py-3">Pelanggaran</th><th class="w-[10%] px-4 py-3 text-right">Aksi</th></tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="r in barisTampil" :key="r.student_id">
                <td class="px-4 py-3"><b class="block truncate text-xs font-bold text-[#101828]">{{ r.student_name }}</b><span class="text-[11px] text-[#667085]">{{ r.nis || '-' }}</span></td>
                <td class="truncate px-4 py-3 text-[#344054]">{{ r.class_name || '-' }}</td>
                <td class="px-4 py-3"><span class="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold" :class="statusKelas(r.status, !!r.exam_id)">{{ r.exam_id ? labelStatus(r.status) : 'Tanpa ujian' }}</span></td>
                <td class="px-4 py-3">
                  <template v-if="r.exam_id">
                    <div class="h-1.5 overflow-hidden rounded-full bg-[#EFF2F7]"><div class="h-full rounded-full bg-[#1B5FD9]" :style="{ width: `${persenProgres(r.answered, r.total)}%` }" /></div>
                    <span class="mt-1 block text-[11px] font-semibold text-[#344054]">{{ r.answered }} / {{ r.total }} soal · {{ persenProgres(r.answered, r.total) }}%</span>
                  </template>
                  <span v-else class="text-[#98A2B3]">-</span>
                </td>
                <td class="px-4 py-3 font-mono font-bold" :class="r.violations ? 'text-[#B42318]' : 'text-[#667085]'">{{ r.violations }}</td>
                <td class="px-4 py-3 text-right"><button v-if="!arsip && bolehKelola" type="button" class="text-[11px] font-bold text-[#B42318] hover:underline" @click="keluarkan(r)">Keluarkan</button></td>
              </tr>
            </tbody>
          </table>
        </section>

        <p v-if="!barisTampil.length" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">{{ anggota.length ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Ruang masih kosong. Klik Tambah Siswa.' }}</p>
        <p v-if="ujianRuang.length === 0 && anggota.length" class="text-xs text-[#667085]">Progres pengerjaan tampil setelah ujian kelas siswa ruang ini dibuat di Daftar Ujian.</p>
      </div>

      <!-- ALERT UJIAN -->
      <div v-else class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs text-[#667085]">{{ alertRuang.length }} pelanggaran tercatat · {{ alertTerkunci }} akun terkunci</p>
          <label class="inline-flex min-h-9 items-center gap-2 text-xs font-bold text-[#344054]"><input v-model="hanyaTerkunci" type="checkbox" class="h-4 w-4 accent-[#1B5FD9]"> Hanya terkunci</label>
        </div>
        <p class="rounded-xl border border-[#E7EBF2] bg-[#F8FAFD] px-4 py-3 text-xs text-[#475467]">Kode pembuka dan buka kunci hanya tampil untuk pengawas jadwal ujian tersebut di ruang ini, atau Superadmin.</p>
        <div v-if="alertTampil.length" class="grid gap-2.5 lg:grid-cols-2">
          <article v-for="a in alertTampil" :key="a.violation_id" class="rounded-2xl border bg-white p-4" :class="a.locked ? 'border-[#F5C6C0]' : 'border-[#E7EBF2]'">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0"><b class="block break-words text-sm font-bold text-[#101828]">{{ a.student_name }}</b><span class="text-xs text-[#667085]">{{ a.class_name || '-' }} · {{ a.exam_name }}</span></div>
              <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold" :class="a.locked ? 'bg-[#FDECEA] text-[#B42318]' : 'bg-[#E7F8F0] text-[#087C52]'">{{ a.locked ? 'Terkunci' : 'Dibuka' }}</span>
            </div>
            <p class="mt-2 text-xs text-[#344054]"><b>{{ labelPelanggaran(a.violation_type) }}</b> · pelanggaran ke-{{ a.occurrence }} · {{ waktu(a.occurred_at) }}</p>
            <div v-if="a.locked" class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFD] p-3">
              <div><span class="block text-[10px] font-extrabold uppercase tracking-wider text-[#667085]">Kode pembuka akses</span><b class="font-mono text-lg tracking-[0.2em] text-[#101828]">{{ a.occurrence >= 3 || !a.unlock_code ? '------' : a.unlock_code }}</b></div>
              <div v-if="a.occurrence < 3 && a.unlock_code" class="flex gap-2">
                <button type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] bg-white px-3 text-xs font-bold text-[#344054]" @click="salinKode(a.unlock_code)">Salin</button>
                <button v-if="!arsip" type="button" class="min-h-11 rounded-xl bg-[#1B5FD9] px-3 text-xs font-bold text-white" @click="bukaKunci(a)">Buka kunci</button>
              </div>
              <span v-else-if="a.occurrence >= 3" class="text-[11px] font-bold text-[#B42318]">Terkunci total</span>
            </div>
            <p v-else class="mt-2 text-[11px] text-[#667085]">Dibuka {{ a.unlocked_at ? waktu(a.unlocked_at) : '' }}</p>
          </article>
        </div>
        <p v-else class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">Belum ada pelanggaran di ruang ini.</p>
      </div>
    </template>

    <!-- MODAL TAMBAH SISWA -->
    <Teleport to="body">
      <div v-if="tambahOpen" class="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Tambah siswa ke ruang" @keydown.esc="tambahOpen = false">
        <div class="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl border border-[#E7EBF2] bg-white shadow-2xl sm:rounded-2xl">
          <div class="flex items-center justify-between border-b border-[#E7EBF2] p-5">
            <div><h3 class="text-base font-extrabold text-[#101828]">Tambah Siswa</h3><p class="text-xs text-[#667085]">Sisa kapasitas {{ sisaKapasitas }} siswa · hanya siswa tanpa ruang pada periode ini</p></div>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-[#667085] hover:bg-[#EFF2F7]" aria-label="Tutup" @click="tambahOpen = false"><AdminV2Icon name="x" :size="16" /></button>
          </div>
          <div class="space-y-3 overflow-y-auto p-5 text-xs">
            <div class="grid gap-2 sm:grid-cols-2">
              <input v-model="cariBebas" type="search" placeholder="Cari nama atau NIS" aria-label="Cari siswa" class="min-h-11 rounded-xl border border-[#E7EBF2] px-3 text-sm outline-none focus:border-[#1B5FD9]">
              <select v-model="filterKelas" aria-label="Filter kelas" class="min-h-11 rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm"><option value="">Semua kelas</option><option v-for="k in kelasBebas" :key="k.id" :value="k.id">{{ k.nama }}</option></select>
            </div>
            <div class="flex items-end gap-2 rounded-xl bg-[#E8F0FE] p-3">
              <div class="flex-1"><label class="mb-1 block font-bold text-[#0A2A5C]" for="acak-n">Isi acak (sesuai filter kelas)</label><input id="acak-n" v-model.number="acakJumlah" type="number" min="1" :max="sisaKapasitas" inputmode="numeric" class="min-h-11 w-full rounded-xl border border-[#BFD3F6] bg-white px-3 text-sm outline-none"></div>
              <button type="button" class="min-h-11 rounded-xl bg-[#0A2A5C] px-4 text-xs font-bold text-white disabled:opacity-60" :disabled="saving || !sisaKapasitas" @click="tambahAcak">Isi Acak</button>
            </div>
            <p v-if="bebasMuat" class="py-4 text-center text-[#667085]">Memuat siswa…</p>
            <ul v-else-if="bebasTampil.length" class="max-h-64 divide-y divide-[#EFF2F7] overflow-y-auto rounded-xl border border-[#E7EBF2]">
              <li v-for="s in bebasTampil" :key="s.id">
                <label class="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 hover:bg-[#F8FAFD]">
                  <input type="checkbox" class="h-4 w-4 shrink-0 accent-[#1B5FD9]" :checked="pilih.includes(s.id)" @change="togglePilih(s.id)">
                  <span class="min-w-0 flex-1"><b class="block truncate text-xs font-bold text-[#101828]">{{ s.nama }}</b><span class="text-[11px] text-[#667085]">{{ s.nis }} · {{ s.kelas }}</span></span>
                </label>
              </li>
            </ul>
            <p v-else class="py-4 text-center text-[#667085]">Tidak ada siswa tanpa ruang yang cocok.</p>
          </div>
          <div class="flex gap-2 border-t border-[#E7EBF2] bg-[#F8FAFD] p-4">
            <button type="button" class="min-h-11 flex-1 rounded-xl border border-[#E7EBF2] bg-white text-xs font-bold text-[#344054]" @click="tambahOpen = false">Batal</button>
            <button type="button" class="min-h-11 flex-1 rounded-xl bg-[#1B5FD9] text-xs font-bold text-white disabled:opacity-60" :disabled="saving || !pilih.length" @click="tambahPilihan">{{ saving ? 'Menyimpan…' : `Tambahkan ${pilih.length} siswa` }}</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
