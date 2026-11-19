<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import CbtV2SebQuit from './CbtV2SebQuit.vue'
import { bacaJadwalRuang, eksporJadwalRuang } from '~/utils/cbtExcelJadwalRuang'
import type { GradeType } from './cbtV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import {
  useRuangUjian, type RuangUjian, type AnggotaRuang, type SiswaBebas, type AlertRuang, type TautanUjian
} from '~/composables/useRuangUjian'
import {
  barisSiswa, ringkasProgres, komposisiKelas, kelasTanpaBank, bentrokJadwal, labelStatus, labelPelanggaran, persenProgres,
  cekJadwalMassal, durasiBaris, jadwalBaris, irisan, type ProgresRow, type BarisJadwalRuang
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
  // Dari tombol Atur Jadwal di daftar ruang (?jadwal=atur): langsung buka form jadwal ruang ini.
  if (route.query.jadwal === 'atur') {
    sub.value = 'jadwal'
    void router.replace({ query: { ...route.query, jadwal: undefined } })
    if (!props.arsip && bolehKelola.value) bukaMassal()
  }
  // Progres diperbarui tiap 15 detik selama halaman terbuka dan tab browser terlihat.
  timer = setInterval(() => { if (!document.hidden && !props.arsip) void muatRingan().catch(() => {}) }, 15_000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

// Satu "jadwal ruang" = ujian-ujian kelas dengan mapel, jadwal, dan nama yang sama. Pengawas melekat di
// tautan ruang + jadwal (migrasi 0088), jadi pengawas ruang ini tidak ikut menjadi pengawas ruang lain.
const ujianSemua = computed(() => {
  const pengawasExam = new Map(tautan.value.map(item => [item.exam_id, item.supervisor_id ?? '']))
  const grup = new Map<string, { key: string, name: string, subject: string, subjectId: string, startsAt: string, duration: number, date: string, time: string, status: string, supervisorId: string, examIds: string[] }>()
  for (const exam of cbtData.exams.value.filter(item => pengawasExam.has(item.id))) {
    const key = `${exam.subjectId}|${exam.startsAt}|${exam.name}`
    const ada = grup.get(key)
    if (ada) { ada.examIds.push(exam.id); ada.supervisorId ||= pengawasExam.get(exam.id)! }
    else grup.set(key, { key, name: exam.name, subject: exam.subject, subjectId: exam.subjectId ?? '', startsAt: exam.startsAt ?? '', duration: exam.duration, date: exam.date, time: exam.time, status: exam.status, supervisorId: pengawasExam.get(exam.id)!, examIds: [exam.id] })
  }
  return [...grup.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
})
const saya = computed(() => rbac.state.value.subjekSaya ?? '')
// Kelola isi ruang (tambah/keluarkan siswa, tugaskan ujian & pengawas) = izin Ubah sub-modul Ruang Ujian (RBAC).
const bolehKelola = computed(() => rbac.bolehAksi('Manajemen CBT', 'rooms', 'ubah', rbac.adalahSuperadmin.value))
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

// ---- Buat Ujian untuk ruang ----
const ujianOpen = ref(false)
const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
const formUjian = ref({ name: '', subjectId: '', startsAt: '', duration: 90, ruangLain: [] as string[] })
const ruangLain = ref<RuangUjian[]>([])
const progresSimpan = ref('')
const classIdsRuang = computed(() => [...new Set(anggota.value.map(item => item.classId).filter((id): id is string => !!id))])
const namaKelas = (id: string) => cbtData.classes.value.find(item => item.id === id)?.name ?? id
const mapelUjian = computed(() => {
  const ids = new Set(cbtData.bankPackages.value.filter(b => b.grade === props.grade && b.classId && classIdsRuang.value.includes(b.classId) && b.subjectId).map(b => b.subjectId!))
  return cbtData.subjects.value.filter(item => ids.has(item.id))
})
const tanpaBank = computed(() => formUjian.value.subjectId ? kelasTanpaBank(classIdsRuang.value, formUjian.value.subjectId, cbtData.bankPackages.value) : [])
const bukaUjian = async () => {
  if (!anggota.value.length) return emit('toast', 'Isi ruang dengan siswa dulu sebelum membuat ujian.')
  formUjian.value = { name: '', subjectId: '', startsAt: localDateTime(new Date(Date.now() + 86_400_000)), duration: 90, ruangLain: [] }
  progresSimpan.value = ''
  ujianOpen.value = true
  try { ruangLain.value = (await api.muatRuang(props.grade, props.room.periode)).filter(item => item.id !== props.room.id) } catch { ruangLain.value = [] }
}
const simpanUjian = async () => {
  const f = formUjian.value
  if (!f.name.trim()) return emit('toast', 'Nama ujian wajib diisi.')
  if (!f.subjectId) return emit('toast', 'Pilih mata pelajaran ujian.')
  if (!f.startsAt || !Number.isFinite(new Date(f.startsAt).getTime())) return emit('toast', 'Waktu mulai ujian tidak valid.')
  if (!Number.isInteger(f.duration) || f.duration < 1 || f.duration > 600) return emit('toast', 'Durasi ujian harus 1 sampai 600 menit.')
  saving.value = true
  try {
    // Kelas dari ruang ini + ruang tambahan; bank soal tetap per kelas.
    const semuaRuang = [props.room.id, ...f.ruangLain]
    const kelas = new Set(classIdsRuang.value)
    for (const id of f.ruangLain) for (const a of await api.muatAnggota(id)) if (a.classId) kelas.add(a.classId)
    const daftarKelas = [...kelas]
    const kosong = kelasTanpaBank(daftarKelas, f.subjectId, cbtData.bankPackages.value)
    if (kosong.length) throw new Error(`Kelas ${kosong.map(namaKelas).join(', ')} belum punya bank soal untuk mapel ini. Buat dulu di tab Bank Soal.`)
    await cbtData.loadQuestions(true)
    const bankDari = (classId: string) => cbtData.bankPackages.value.find(b => b.classId === classId && b.subjectId === f.subjectId && b.grade === props.grade)!
    const tanpaSoal = daftarKelas.filter(id => !bankDari(id).questions.length)
    if (tanpaSoal.length) throw new Error(`Bank soal kelas ${tanpaSoal.map(namaKelas).join(', ')} masih kosong.`)

    const mulai = new Date(f.startsAt).getTime()
    // Satu ruang = satu jadwal: tolak bila beririsan dengan ujian lain di ruang tujuan (mapel/jam/durasi harus identik).
    const tautanSemua = await api.muatTautanUjian(semuaRuang)
    const idTertaut = new Set(tautanSemua.map(item => item.exam_id))
    const bentrok = bentrokJadwal(
      cbtData.exams.value.filter(e => idTertaut.has(e.id)).map(e => ({ subjectId: e.subjectId, startsAt: e.startsAt, duration: e.duration })),
      { subjectId: f.subjectId, startsAt: f.startsAt, duration: f.duration }
    )
    if (bentrok) throw new Error('Salah satu ruang sudah punya ujian lain pada jam yang beririsan. Satu ruang hanya boleh satu mata pelajaran pada satu jadwal.')
    const examIds: string[] = []
    for (const [i, classId] of daftarKelas.entries()) {
      progresSimpan.value = `Menyimpan ujian ${i + 1} dari ${daftarKelas.length}…`
      const cocok = () => cbtData.exams.value.find(e => e.classId === classId && e.subjectId === f.subjectId && new Date(e.startsAt ?? '').getTime() === mulai)
      const ada = cocok()
      if (ada && ada.duration !== f.duration) throw new Error(`Ujian ${namaKelas(classId)} pada jam ini sudah ada dengan durasi ${ada.duration} menit. Samakan durasinya atau ubah jamnya.`)
      if (!ada) {
        const bank = bankDari(classId)
        await cbtData.saveExam({
          name: f.name.trim(), classId, subjectId: f.subjectId, questionBankId: bank.id,
          questionIds: bank.questions.map(q => q.id),
          startsAt: f.startsAt, duration: f.duration
        })
      }
      const dibuat = cocok()
      if (!dibuat) throw new Error('Ujian tersimpan tetapi tidak ditemukan kembali. Muat ulang halaman.')
      examIds.push(dibuat.id)
    }
    await api.tautkanUjian(examIds, semuaRuang)
    ujianOpen.value = false
    await muatSemua()
    emit('changed')
    emit('toast', `Ujian ${f.name.trim()} ditugaskan ke ${semuaRuang.length} ruang (${daftarKelas.length} kelas). Tugaskan pengawasnya di menu Jadwal Ujian.`)
  } catch (e) {
    emit('toast', e instanceof Error ? e.message : 'Ujian gagal dibuat.')
  } finally { saving.value = false; progresSimpan.value = '' }
}
// ---- Atur Jadwal: banyak mapel sekaligus untuk ruang ini, masing-masing dengan pengawasnya ----
// Alur sama dengan Buat Ujian (ujian per kelas + bank soal kelas, lalu ditautkan ke ruang), tetapi semua baris
// diperiksa dulu sebelum ada yang disimpan, agar tidak ada jadwal setengah jadi.
type BarisMassal = BarisJadwalRuang & { mapelImpor?: string, pengawasImpor?: string }
const massalOpen = ref(false)
const namaMassal = ref('')
const barisMassal = ref<BarisMassal[]>([])
const galatMassal = ref<string[]>([])
const jenisPeriode = computed(() => props.room.periode.startsWith('PTS') ? 'tengah_semester' as const : 'akhir' as const)
const tambahJam = (jam: string, menit: number) => {
  const [h = 0, m = 0] = jam.split(':').map(Number)
  const t = Math.min(h * 60 + m + menit, 23 * 60 + 59)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
const barisBaru = (sebelum?: BarisMassal): BarisMassal => sebelum
  ? { tanggal: sebelum.tanggal, mulai: sebelum.selesai, selesai: tambahJam(sebelum.selesai, durasiBaris(sebelum) || 90), subjectId: '', supervisorId: '' }
  : { tanggal: localDateTime(new Date(Date.now() + 86_400_000)).slice(0, 10), mulai: '07:30', selesai: '09:00', subjectId: '', supervisorId: '' }
const bukaMassal = (isi?: BarisMassal[]) => {
  if (!anggota.value.length) return emit('toast', 'Isi ruang dengan siswa dulu sebelum mengatur jadwal.')
  namaMassal.value = ujianSemua.value[0]?.name ?? props.room.periode
  barisMassal.value = isi?.length ? isi : [barisBaru()]
  galatMassal.value = (isi ?? []).map(b => b.mapelImpor || b.pengawasImpor ? 'Isian dari Excel tidak dikenali. Pilih dari daftar.' : '')
  progresSimpan.value = ''
  massalOpen.value = true
}
const tambahBaris = () => { barisMassal.value = [...barisMassal.value, barisBaru(barisMassal.value.at(-1))] }
const hapusBaris = (i: number) => {
  barisMassal.value = barisMassal.value.filter((_, k) => k !== i)
  galatMassal.value = galatMassal.value.filter((_, k) => k !== i)
}
const namaMapel = (id: string) => cbtData.subjects.value.find(item => item.id === id)?.name ?? '-'
const bankKelas = (classId: string, subjectId: string) => cbtData.bankPackages.value.find(x => x.classId === classId && x.subjectId === subjectId && x.grade === props.grade)
const examCocok = (classId: string, b: BarisJadwalRuang) => {
  const mulai = new Date(`${b.tanggal}T${b.mulai}`).getTime()
  return cbtData.exams.value.find(e => e.classId === classId && e.subjectId === b.subjectId && new Date(e.startsAt ?? '').getTime() === mulai)
}

// Pemeriksaan lengkap tanpa menyimpan apa pun. Mengembalikan pesan per baris ('' = aman).
const periksaMassal = async (): Promise<string[]> => {
  const daftar = barisMassal.value
  const pesan = cekJadwalMassal(daftar, ujianSemua.value.map(u => ({ subjectId: u.subjectId, startsAt: u.startsAt, duration: u.duration })))
  await Promise.all([cbtData.loadQuestions(true), cbtData.load(true)])
  // Pengawas tidak boleh sedang bertugas di ruang lain pada jam yang beririsan (database juga menolaknya).
  const ruangPeriode = (await api.muatRuang(props.grade, props.room.periode)).filter(item => item.id !== props.room.id)
  const tautanLain = await api.muatTautanUjian(ruangPeriode.map(item => item.id))
  const examById = new Map(cbtData.exams.value.map(e => [e.id, e]))
  const bertugas = (supervisorId: string, j: { startsAt?: string, duration: number }) => tautanLain.find((t) => {
    const e = examById.get(t.exam_id)
    return t.supervisor_id === supervisorId && !!e?.startsAt && irisan(j, { startsAt: e.startsAt, duration: e.duration })
  })
  return daftar.map((b, i) => {
    if (b.mapelImpor && !b.subjectId) return `Mapel "${b.mapelImpor}" dari Excel tidak dikenali atau belum punya bank soal di ruang ini. Pilih dari daftar.`
    if (b.pengawasImpor && !b.supervisorId) return `Pengawas "${b.pengawasImpor}" dari Excel tidak dikenali. Pilih dari daftar.`
    if (pesan[i]) return pesan[i]!
    const kosong = kelasTanpaBank(classIdsRuang.value, b.subjectId, cbtData.bankPackages.value)
    if (kosong.length) return `Belum ada bank soal ${namaMapel(b.subjectId)} untuk kelas ${kosong.map(namaKelas).join(', ')}.`
    const tanpaSoal = classIdsRuang.value.filter(id => !bankKelas(id, b.subjectId)?.questions.length)
    if (tanpaSoal.length) return `Bank soal ${namaMapel(b.subjectId)} kelas ${tanpaSoal.map(namaKelas).join(', ')} masih kosong.`
    const j = jadwalBaris(b)
    // Ujian per kelas dipakai bersama semua ruang: kelas yang sama tidak boleh punya ujian lain di jam itu.
    for (const classId of classIdsRuang.value) {
      const lain = cbtData.exams.value.find(e => e.classId === classId && !!e.startsAt && irisan(j, { startsAt: e.startsAt, duration: e.duration })
        && !(e.subjectId === b.subjectId && new Date(e.startsAt).getTime() === new Date(j.startsAt!).getTime() && e.duration === j.duration))
      if (lain) return `Kelas ${namaKelas(classId)} sudah punya ujian ${lain.subject} (${lain.date} ${lain.time}) yang beririsan.`
    }
    const tugas = b.supervisorId ? bertugas(b.supervisorId, j) : undefined
    if (tugas) return `${namaGuru(b.supervisorId)} sudah mengawasi ${ruangPeriode.find(x => x.id === tugas.room_id)?.name ?? 'ruang lain'} pada jam ini.`
    return ''
  })
}

const simpanMassal = async () => {
  if (saving.value) return
  if (!namaMassal.value.trim()) return emit('toast', 'Nama ujian wajib diisi.')
  if (!barisMassal.value.length) return emit('toast', 'Tambahkan minimal satu jadwal mapel.')
  saving.value = true
  progresSimpan.value = 'Memeriksa jadwal…'
  try {
    galatMassal.value = await periksaMassal()
    if (galatMassal.value.some(Boolean)) return emit('toast', 'Perbaiki baris yang ditandai dulu. Belum ada jadwal yang disimpan.')
    const daftar = barisMassal.value
    const kelas = classIdsRuang.value
    let n = 0
    for (const b of daftar) {
      for (const classId of kelas) {
        progresSimpan.value = `Menyimpan ujian ${++n} dari ${daftar.length * kelas.length}…`
        if (examCocok(classId, b)) continue // ujian kelas ini sudah dibuat ruang lain dengan jadwal sama: dipakai ulang
        const bank = bankKelas(classId, b.subjectId)!
        await cbtData.saveExam({
          name: namaMassal.value.trim(), classId, subjectId: b.subjectId, questionBankId: bank.id,
          questionIds: bank.questions.map(q => q.id), startsAt: `${b.tanggal}T${b.mulai}`, duration: durasiBaris(b), jenis: jenisPeriode.value
        }, false)
      }
    }
    progresSimpan.value = 'Menautkan jadwal dan pengawas ke ruang…'
    await cbtData.load(true)
    for (const b of daftar) {
      const examIds = kelas.map(classId => examCocok(classId, b)?.id ?? '')
      if (examIds.some(id => !id)) throw new Error(`Ujian ${namaMapel(b.subjectId)} tersimpan tetapi tidak ditemukan kembali. Muat ulang halaman lalu periksa menu Jadwal Ujian.`)
      await api.tautkanUjian(examIds, [props.room.id])
      if (b.supervisorId) await api.tugaskanPengawas(props.room.id, examIds, b.supervisorId)
    }
    massalOpen.value = false
    emit('changed')
    emit('toast', `${daftar.length} jadwal mapel tersimpan di ${props.room.name}.`)
  } catch (e) {
    emit('toast', e instanceof Error ? e.message : 'Jadwal gagal disimpan.')
  } finally {
    await muatSemua()
    saving.value = false
    progresSimpan.value = ''
  }
}

// ---- Export / Import Excel jadwal ruang ini ----
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
    }), mapelUjian.value.map(m => m.name), guruGrade.value.map(g => g.name))
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Export gagal.') }
}
const imporExcel = async (ev: Event) => {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const sama = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
    // Nama dicocokkan persis (tanpa beda huruf besar/kecil); nama ganda/tidak dikenal harus dipilih manual.
    const hasil = (await bacaJadwalRuang(file)).map((x): BarisMassal => {
      const mapel = mapelUjian.value.filter(m => sama(m.name, x.mapel))
      const guru = x.pengawas ? guruGrade.value.filter(g => sama(g.name, x.pengawas)) : []
      return {
        tanggal: x.tanggal, mulai: x.mulai, selesai: x.selesai,
        subjectId: mapel.length === 1 ? mapel[0]!.id : '', supervisorId: guru.length === 1 ? guru[0]!.id : '',
        mapelImpor: mapel.length === 1 ? undefined : (x.mapel || '(kosong)'),
        pengawasImpor: x.pengawas && guru.length !== 1 ? x.pengawas : undefined
      }
    })
    bukaMassal(hasil)
    emit('toast', `${hasil.length} baris jadwal dibaca dari Excel. Periksa lalu klik Simpan Jadwal.`)
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Berkas Excel gagal dibaca.') }
}

const lepasUjian = async (item: { name: string, examIds: string[] }) => {
  if (!confirm(`Lepas ujian ${item.name} dari ${props.room.name}? Ujian di kelas tidak dihapus.`)) return
  try {
    await api.lepasUjian(item.examIds, props.room.id)
    await muatSemua()
    emit('toast', 'Ujian dilepas dari ruang.')
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Ujian gagal dilepas.') }
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
          <button type="button" class="min-h-11 flex-1 rounded-xl bg-white px-4 text-xs font-bold text-[#0A2A5C] hover:bg-[#E8F0FE] sm:flex-none" @click="bukaUjian">Buat Ujian</button>
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
      <!-- Pilih ujian (Overview & Daftar Siswa) -->
      <div v-if="(sub === 'overview' || sub === 'siswa') && ujianRuang.length" class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-[#344054]" for="ujian-ruang">Ujian di ruang ini</label>
        <select id="ujian-ruang" v-model="ujianPilihan" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm sm:max-w-xl">
          <option v-for="u in ujianRuang" :key="u.key" :value="u.key">{{ u.subject }} · {{ u.name }} · {{ u.date }} {{ u.time }}</option>
        </select>
      </div>

      <!-- OVERVIEW -->
      <div v-if="sub === 'overview'" class="space-y-4">
        <CbtV2SebQuit v-if="bolehPunishment" :target-id="room.id" @toast="emit('toast', $event)" />

        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold text-[#101828]">{{ ringkas.siswa }}</b><span class="text-[11px] text-[#667085]">Siswa</span></div>
          <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold text-[#1B5FD9]">{{ ringkas.mengerjakan }}</b><span class="text-[11px] text-[#667085]">Mengerjakan</span></div>
          <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold text-[#087C52]">{{ ringkas.selesai }}</b><span class="text-[11px] text-[#667085]">Selesai</span></div>
          <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold text-[#101828]">{{ ringkas.belumMulai }}</b><span class="text-[11px] text-[#667085]">Belum mulai</span></div>
          <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold" :class="ringkas.terkunci ? 'text-[#B42318]' : 'text-[#101828]'">{{ ringkas.terkunci }}</b><span class="text-[11px] text-[#667085]">Terkunci</span></div>
          <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3.5"><b class="block text-xl font-extrabold text-[#101828]">{{ ringkas.pelanggaran }}</b><span class="text-[11px] text-[#667085]">Pelanggaran</span></div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <section class="rounded-2xl border border-[#E7EBF2] bg-white p-4 sm:p-5">
            <h3 class="text-sm font-extrabold text-[#101828]">Ujian di ruang ini</h3>
            <p v-if="!ujianRuang.length" class="mt-2 text-xs text-[#667085]">Belum ada ujian. {{ arsip || !bolehKelola ? '' : 'Klik Buat Ujian untuk menugaskan jadwal ke ruang ini.' }}</p>
            <ul v-else class="mt-3 divide-y divide-[#EFF2F7]">
              <li v-for="u in ujianRuang" :key="u.key" class="flex items-start justify-between gap-3 py-2.5">
                <div class="min-w-0">
                  <b class="block break-words text-xs font-bold text-[#101828]">{{ u.subject }} · {{ u.name }}</b>
                  <span class="text-[11px] text-[#667085]">{{ u.date }} · {{ u.time }} · {{ u.examIds.length }} kelas</span>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="u.status === 'Berlangsung' ? 'bg-[#E7F8F0] text-[#087C52]' : u.status === 'Selesai' ? 'bg-[#EFF2F7] text-[#344054]' : 'bg-[#FEF4E5] text-[#AD6504]'">{{ u.status }}</span>
                  <button v-if="!arsip && bolehKelola" type="button" class="min-h-9 text-[11px] font-bold text-[#B42318]" @click="lepasUjian(u)">Lepas</button>
                </div>
              </li>
            </ul>
          </section>

          <section class="rounded-2xl border border-[#E7EBF2] bg-white p-4 sm:p-5">
            <h3 class="text-sm font-extrabold text-[#101828]">Asal kelas siswa</h3>
            <p v-if="!komposisi.length" class="mt-2 text-xs text-[#667085]">Ruang masih kosong.</p>
            <ul v-else class="mt-3 space-y-2.5">
              <li v-for="k in komposisi" :key="k.kelas">
                <div class="flex items-center justify-between text-xs"><span class="font-semibold text-[#344054]">{{ k.kelas }}</span><b class="text-[#101828]">{{ k.jumlah }}</b></div>
                <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-[#EFF2F7]"><div class="h-full rounded-full bg-[#1B5FD9]" :style="{ width: `${Math.round((k.jumlah / Math.max(1, anggota.length)) * 100)}%` }" /></div>
              </li>
            </ul>
            <p v-if="ujianAktif" class="mt-4 border-t border-[#EFF2F7] pt-3 text-xs text-[#667085]">Rata-rata progres pengerjaan: <b class="text-[#101828]">{{ ringkas.rataProgres }}%</b></p>
          </section>
        </div>
      </div>

      <!-- JADWAL UJIAN -->
      <div v-else-if="sub === 'jadwal'" class="space-y-2.5">
        <div class="flex flex-wrap gap-2">
          <template v-if="!arsip && bolehKelola">
            <button type="button" class="min-h-11 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white hover:bg-[#164fb6]" @click="bukaMassal()">Atur Jadwal</button>
            <label class="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-[#E7EBF2] bg-white px-4 text-xs font-bold text-[#344054] hover:border-[#1B5FD9] focus-within:outline focus-within:outline-2 focus-within:outline-[#1B5FD9]">
              Import Excel<input type="file" accept=".xlsx" class="sr-only" @change="imporExcel">
            </label>
          </template>
          <button type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] bg-white px-4 text-xs font-bold text-[#344054] hover:border-[#1B5FD9]" @click="eksporExcel">Export Excel</button>
        </div>
        <p v-if="!ujianRuang.length" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">Belum ada jadwal ujian di ruang ini.</p>
        <p v-else-if="!arsip && bolehKelola" class="rounded-xl border border-[#E7EBF2] bg-[#F8FAFD] px-4 py-3 text-xs text-[#475467]">Pilih pengawas untuk tiap jadwal. Pengawas hanya bisa membuka ruang ini, jadwal yang ia awasi, dan kode pembuka kunci siswanya. Satu guru tidak bisa mengawasi dua ruang di jam yang sama.</p>
        <article v-for="u in ujianRuang" :key="u.key" class="rounded-2xl border bg-white p-4" :class="saya && u.supervisorId === saya ? 'border-[#1B5FD9]' : 'border-[#E7EBF2]'">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <b class="block break-words text-sm font-bold text-[#101828]">{{ u.subject }} · {{ u.name }}</b>
              <span class="text-xs text-[#667085]">{{ u.date }} · {{ u.time }} · {{ u.examIds.length }} kelas</span>
            </div>
            <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold" :class="u.status === 'Berlangsung' ? 'bg-[#E7F8F0] text-[#087C52]' : u.status === 'Selesai' ? 'bg-[#EFF2F7] text-[#344054]' : 'bg-[#FEF4E5] text-[#AD6504]'">{{ u.status }}</span>
          </div>
          <div v-if="!arsip && bolehKelola" class="mt-3 max-w-sm">
            <label class="mb-1 block text-[11px] font-bold text-[#344054]" :for="`peng-${u.key}`">Pengawas jadwal ini</label>
            <select :id="`peng-${u.key}`" :value="u.supervisorId" :disabled="!!pengawasSimpan" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm outline-none focus:border-[#1B5FD9] disabled:opacity-60" @change="ubahPengawas(u, $event.target as HTMLSelectElement)">
              <option value="">Belum ditentukan</option>
              <option v-for="g in guruGrade" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
            <p v-if="pengawasSimpan === u.key" class="mt-1 text-[11px] font-bold text-[#1B5FD9]" role="status">Menyimpan…</p>
          </div>
          <p v-else class="mt-2 text-xs text-[#344054]">Pengawas: <b>{{ namaGuru(u.supervisorId) || 'Belum ditentukan' }}</b><span v-if="saya && u.supervisorId === saya" class="ml-2 rounded-full bg-[#E8F0FE] px-2 py-0.5 text-[10px] font-extrabold text-[#1B5FD9]">Tugas Anda</span></p>
          <div class="mt-3">
            <div class="flex justify-between gap-3 text-[11px] font-semibold text-[#344054]"><span>{{ ringkasJadwal(u).selesai }} selesai · {{ ringkasJadwal(u).mengerjakan }} mengerjakan · {{ ringkasJadwal(u).belumMulai }} belum mulai<template v-if="ringkasJadwal(u).terkunci"> · {{ ringkasJadwal(u).terkunci }} terkunci</template></span><span>{{ ringkasJadwal(u).rataProgres }}%</span></div>
            <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-[#EFF2F7]"><div class="h-full rounded-full bg-[#1B5FD9]" :style="{ width: `${ringkasJadwal(u).rataProgres}%` }" /></div>
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
        <p v-if="ujianRuang.length === 0 && anggota.length" class="text-xs text-[#667085]">Progres pengerjaan tampil setelah ujian ditugaskan ke ruang ini lewat Buat Ujian.</p>
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

    <!-- MODAL BUAT UJIAN -->
    <Teleport to="body">
      <div v-if="ujianOpen" class="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Buat ujian untuk ruang" @keydown.esc="!saving && (ujianOpen = false)">
        <div class="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl border border-[#E7EBF2] bg-white shadow-2xl sm:rounded-2xl">
          <div class="flex items-center justify-between border-b border-[#E7EBF2] p-5">
            <div><span class="text-[10px] font-extrabold uppercase tracking-wider text-[#1B5FD9]">{{ room.name }} · {{ room.periode }}</span><h3 class="mt-0.5 text-base font-extrabold text-[#101828]">Buat Ujian</h3></div>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-[#667085] hover:bg-[#EFF2F7]" aria-label="Tutup" :disabled="saving" @click="ujianOpen = false"><AdminV2Icon name="x" :size="16" /></button>
          </div>
          <div class="space-y-3.5 overflow-y-auto p-5 text-xs">
            <div class="rounded-xl bg-[#E8F0FE] p-3 font-semibold text-[#0A2A5C]">Mapel dan jadwal sama untuk semua siswa di ruang. Tiap kelas memakai bank soalnya sendiri; seluruh soal bank dipasang dan token terbit otomatis.</div>
            <div><label class="mb-1 block font-bold text-[#344054]" for="uj-nama">Nama ujian *</label><input id="uj-nama" v-model="formUjian.name" type="text" placeholder="Contoh: PAS Ganjil Matematika" class="w-full rounded-xl border border-[#E7EBF2] p-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
            <div>
              <label class="mb-1 block font-bold text-[#344054]" for="uj-mapel">Mata pelajaran *</label>
              <select id="uj-mapel" v-model="formUjian.subjectId" class="w-full rounded-xl border border-[#E7EBF2] bg-white p-3 text-sm outline-none focus:border-[#1B5FD9]">
                <option value="" disabled>Pilih mata pelajaran</option>
                <option v-for="m in mapelUjian" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
              <p v-if="!mapelUjian.length" class="mt-1 text-[#B42318]">Belum ada bank soal untuk kelas-kelas di ruang ini.</p>
              <p v-else-if="tanpaBank.length" class="mt-1 font-semibold text-[#B42318]">Belum ada bank soal untuk: {{ tanpaBank.map(namaKelas).join(', ') }}. Buat dulu di tab Bank Soal.</p>
              <p v-else-if="formUjian.subjectId" class="mt-1 font-semibold text-[#087C52]">Bank soal tersedia untuk {{ classIdsRuang.length }} kelas di ruang ini.</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2 sm:col-span-1"><label class="mb-1 block font-bold text-[#344054]" for="uj-mulai">Mulai *</label><input id="uj-mulai" v-model="formUjian.startsAt" type="datetime-local" class="w-full rounded-xl border border-[#E7EBF2] p-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
              <div class="col-span-2 sm:col-span-1"><label class="mb-1 block font-bold text-[#344054]" for="uj-durasi">Durasi (menit) *</label><input id="uj-durasi" v-model.number="formUjian.duration" type="number" min="1" max="600" inputmode="numeric" class="w-full rounded-xl border border-[#E7EBF2] p-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
            </div>
            <p class="text-[#667085]">Pengawas ditugaskan per ruang setelah ujian dibuat, di menu Jadwal Ujian.</p>
            <fieldset v-if="ruangLain.length">
              <legend class="mb-1.5 font-bold text-[#344054]">Tugaskan juga ke ruang lain <span class="font-normal text-[#667085]">(jadwal sama)</span></legend>
              <div class="flex flex-wrap gap-1.5">
                <label v-for="r in ruangLain" :key="r.id" class="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#E7EBF2] px-3 text-xs font-bold text-[#344054]"><input v-model="formUjian.ruangLain" type="checkbox" :value="r.id" class="h-4 w-4 accent-[#1B5FD9]">{{ r.name }}</label>
              </div>
            </fieldset>
            <p v-if="progresSimpan" class="font-bold text-[#1B5FD9]" role="status">{{ progresSimpan }}</p>
          </div>
          <div class="flex gap-2 border-t border-[#E7EBF2] bg-[#F8FAFD] p-4">
            <button type="button" class="min-h-11 flex-1 rounded-xl border border-[#E7EBF2] bg-white text-xs font-bold text-[#344054]" :disabled="saving" @click="ujianOpen = false">Batal</button>
            <button type="button" class="min-h-11 flex-1 rounded-xl bg-[#1B5FD9] text-xs font-bold text-white disabled:opacity-60" :disabled="saving || !!tanpaBank.length" @click="simpanUjian">{{ saving ? 'Menyimpan…' : 'Tayangkan Ujian' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- MODAL ATUR JADWAL (banyak mapel) -->
    <Teleport to="body">
      <div v-if="massalOpen" class="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Atur jadwal ujian ruang" @keydown.esc="!saving && (massalOpen = false)">
        <div class="flex max-h-[92dvh] w-full max-w-3xl flex-col rounded-t-2xl border border-[#E7EBF2] bg-white shadow-2xl sm:rounded-2xl">
          <div class="flex items-center justify-between border-b border-[#E7EBF2] p-5">
            <div><span class="text-[10px] font-extrabold uppercase tracking-wider text-[#1B5FD9]">{{ room.name }} · {{ room.periode }}</span><h3 class="mt-0.5 text-base font-extrabold text-[#101828]">Atur Jadwal Ujian</h3></div>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-[#667085] hover:bg-[#EFF2F7]" aria-label="Tutup" :disabled="saving" @click="massalOpen = false"><AdminV2Icon name="x" :size="16" /></button>
          </div>
          <div class="space-y-3.5 overflow-y-auto p-5 text-xs">
            <div class="rounded-xl bg-[#E8F0FE] p-3 font-semibold text-[#0A2A5C]">Satu baris = satu mapel untuk semua siswa di ruang ini. Tiap kelas memakai bank soalnya sendiri dan token terbit otomatis. Semua baris diperiksa dulu; bila ada yang salah, tidak ada yang disimpan.</div>
            <div><label class="mb-1 block font-bold text-[#344054]" for="jm-nama">Nama ujian *</label><input id="jm-nama" v-model="namaMassal" type="text" class="w-full rounded-xl border border-[#E7EBF2] p-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
            <p v-if="!mapelUjian.length" class="font-semibold text-[#B42318]">Belum ada bank soal untuk kelas-kelas di ruang ini. Buat dulu di tab Bank Soal.</p>
            <ol class="space-y-2.5">
              <li v-for="(b, i) in barisMassal" :key="i" class="rounded-xl border p-3" :class="galatMassal[i] ? 'border-[#F5C6C0] bg-[#FFFBFA]' : 'border-[#E7EBF2]'">
                <div class="mb-2 flex items-center justify-between">
                  <b class="text-[11px] font-extrabold uppercase tracking-wider text-[#667085]">Mapel ke-{{ i + 1 }}</b>
                  <button v-if="barisMassal.length > 1" type="button" class="min-h-9 px-2 text-[11px] font-bold text-[#B42318]" :disabled="saving" @click="hapusBaris(i)">Hapus</button>
                </div>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-[1.2fr_0.8fr_0.8fr]">
                  <div class="col-span-2 sm:col-span-1"><label class="mb-1 block font-bold text-[#344054]" :for="`jm-tgl-${i}`">Tanggal</label><input :id="`jm-tgl-${i}`" v-model="b.tanggal" type="date" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] px-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
                  <div><label class="mb-1 block font-bold text-[#344054]" :for="`jm-mulai-${i}`">Jam mulai</label><input :id="`jm-mulai-${i}`" v-model="b.mulai" type="time" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] px-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
                  <div><label class="mb-1 block font-bold text-[#344054]" :for="`jm-selesai-${i}`">Jam selesai</label><input :id="`jm-selesai-${i}`" v-model="b.selesai" type="time" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] px-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
                  <div class="col-span-2 sm:col-span-1">
                    <label class="mb-1 block font-bold text-[#344054]" :for="`jm-mapel-${i}`">Mata pelajaran</label>
                    <select :id="`jm-mapel-${i}`" v-model="b.subjectId" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm outline-none focus:border-[#1B5FD9]">
                      <option value="" disabled>{{ b.mapelImpor ? `Excel: ${b.mapelImpor} (tidak tersedia)` : 'Pilih mapel' }}</option>
                      <option v-for="m in mapelUjian" :key="m.id" :value="m.id">{{ m.name }}</option>
                    </select>
                  </div>
                  <div class="col-span-2">
                    <label class="mb-1 block font-bold text-[#344054]" :for="`jm-peng-${i}`">Pengawas</label>
                    <select :id="`jm-peng-${i}`" v-model="b.supervisorId" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm outline-none focus:border-[#1B5FD9]" @change="b.pengawasImpor = undefined">
                      <option value="">{{ b.pengawasImpor ? `Excel: ${b.pengawasImpor} (tidak dikenali)` : 'Belum ditentukan' }}</option>
                      <option v-for="g in guruGrade" :key="g.id" :value="g.id">{{ g.name }}</option>
                    </select>
                  </div>
                </div>
                <p class="mt-2 text-[11px]" :class="galatMassal[i] ? 'font-semibold text-[#B42318]' : 'text-[#667085]'" :role="galatMassal[i] ? 'alert' : undefined">{{ galatMassal[i] || (durasiBaris(b) > 0 ? `Waktu ujian ${durasiBaris(b)} menit.` : 'Jam selesai harus setelah jam mulai.') }}</p>
              </li>
            </ol>
            <button type="button" class="min-h-11 w-full rounded-xl border border-dashed border-[#1B5FD9] text-xs font-bold text-[#1B5FD9] hover:bg-[#E8F0FE] disabled:opacity-60" :disabled="saving || barisMassal.length >= 50" @click="tambahBaris">+ Tambah mapel</button>
            <p v-if="progresSimpan" class="font-bold text-[#1B5FD9]" role="status">{{ progresSimpan }}</p>
          </div>
          <div class="flex gap-2 border-t border-[#E7EBF2] bg-[#F8FAFD] p-4">
            <button type="button" class="min-h-11 flex-1 rounded-xl border border-[#E7EBF2] bg-white text-xs font-bold text-[#344054]" :disabled="saving" @click="massalOpen = false">Batal</button>
            <button type="button" class="min-h-11 flex-1 rounded-xl bg-[#1B5FD9] text-xs font-bold text-white disabled:opacity-60" :disabled="saving || !mapelUjian.length" @click="simpanMassal">{{ saving ? 'Menyimpan…' : `Simpan ${barisMassal.length} Jadwal` }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
