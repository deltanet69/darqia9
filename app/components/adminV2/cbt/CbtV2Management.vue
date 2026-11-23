<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { GradeType } from './cbtV2Data'
import { useAdminCbtData, type AssessmentSource, type PelanggaranRombel } from '~/composables/useAdminCbtData'
import { useRuangUjian, type RuangUjian, type TautanUjian } from '~/composables/useRuangUjian'
import { periodeOpsi } from '~/composables/ruangUjianCore'

// Manajemen Ujian: tiga sub-tab, semuanya dari data asli sistem (bukan data contoh).
// - Pelanggaran & Anti-Cheat: exam_violations + ujian_harian_violations lewat useAdminCbtData
//   (kode buka CBT dibaca lewat RPC cbt_kode_buka; aksi panel memakai RPC migrasi 0092).
// - Manajemen Pengawas: tautan ruang + jadwal yang sama dengan tab Jadwal Pengawas
//   (exam_room_exams.supervisor_id per sesi), ditampilkan per hari sebagai akordeon sesi.
// - Kebijakan Ujian: daftar NIS bebas gerbang dari tabel cbt_bebas_gerbang (migrasi 0092),
//   diperiksa server di bebasGerbang selain daftar env; status env dibaca dari /api/admin/cbt/gerbang.
interface Props {
  grade: GradeType
  isFrozen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle-freeze'): void
  (e: 'toast', msg: string): void
}>()

const activeSubNav = ref<'violations' | 'pengawas' | 'kebijakan'>('violations')
const isFreezeModalOpen = ref(false)

const cbt = useAdminCbtData('cbt')
const lms = useAdminCbtData('ujian_harian')
const client = useSupabaseClient()
const superadmin = cbt.adalahSuperadmin

const handleConfirmFreezeToggle = () => {
  isFreezeModalOpen.value = false
  emit('toggle-freeze')
}

const JENIS: Record<string, string> = {
  pindah_tab: 'Pindah tab',
  alt_tab: 'Keluar dari layar ujian',
  tutup_browser: 'Menutup browser'
}
const fmtWaktu = (iso: string) => new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

/* ================= SUB-TAB 1: PELANGGARAN & ANTI-CHEAT ================= */

interface BarisPelanggaran extends PelanggaranRombel {
  source: AssessmentSource
  ujianNama: string
  mapel: string
  kelasRombel: string
}

const barisSemua = ref<BarisPelanggaran[]>([])
const memuatV = ref(false)
const galatV = ref('')
const cariV = ref('')
const filterKelas = ref('')
const filterJenis = ref('')
const filterStatus = ref('')
const kodeTerlihat = ref<Set<string>>(new Set())
const sedangAksi = ref('')

const ujianKey = (source: AssessmentSource, examId: string) => `${source}:${examId}`
const kunciPenugasan = (p: BarisPelanggaran) => `${p.source}:${p.assignmentId}`

const muatPelanggaran = async () => {
  if (memuatV.value) return
  memuatV.value = true
  try {
    // Loader ringan khusus panel: tanpa load() penuh, pelanggaran dibatasi + semua yang masih terkunci.
    const hasil: BarisPelanggaran[] = []
    for (const [api, source] of [[cbt, 'cbt'], [lms, 'ujian_harian']] as const) {
      const { baris, ujian } = await api.loadPelanggaranPanel(props.grade)
      for (const r of baris) {
        const u = ujian.get(r.examId)
        hasil.push({
          ...r, source,
          ujianNama: u?.nama ?? '-', mapel: u?.mapel ?? '-', kelasRombel: u?.kelas ?? '-'
        })
      }
    }
    hasil.sort((a, b) => b.waktu.localeCompare(a.waktu))
    barisSemua.value = hasil
    galatV.value = ''
  } catch (e) {
    galatV.value = e instanceof Error ? e.message : 'Data pelanggaran gagal dimuat.'
  } finally { memuatV.value = false }
}

// Satu siswa cukup satu kode: hanya pelanggaran terakhir yang masih menunggu yang berlaku kodenya.
const kunciTotalSet = computed(() => new Set(barisSemua.value.filter(p => p.ke >= 3 && !p.dipulihkan).map(kunciPenugasan)))
const menungguKode = (p: BarisPelanggaran) => p.terkunci && p.ke < 3 && !p.selesai && !p.dipulihkan && !kunciTotalSet.value.has(kunciPenugasan(p))
const kodeTerbaruSet = computed(() => {
  const ids = new Set<string>()
  const sudah = new Set<string>()
  for (const p of barisSemua.value) { // sudah urut terbaru dulu
    const k = `${p.studentId}|${p.examId}|${p.source}`
    if (menungguKode(p) && !sudah.has(k)) { ids.add(p.id); sudah.add(k) }
  }
  return ids
})
// Baris terbaru per penugasan: di baris inilah tombol aksi panel ditampilkan.
const barisTerbaruSet = computed(() => {
  const ids = new Set<string>()
  const sudah = new Set<string>()
  for (const p of barisSemua.value) {
    const k = kunciPenugasan(p)
    if (!sudah.has(k)) { ids.add(p.id); sudah.add(k) }
  }
  return ids
})

const statusBaris = (p: BarisPelanggaran): { label: string, cls: string } => {
  if (p.dipulihkan) return { label: 'Dipulihkan', cls: 'bg-[#EFF2F7] text-[#475467]' }
  if (p.ke >= 3) return { label: 'Terkunci Total', cls: 'bg-[#FDECEA] text-[#B42318]' }
  if (p.selesai) return { label: 'Sudah Selesai', cls: 'bg-[#EFF2F7] text-[#475467]' }
  if (p.terkunci) return { label: 'Menunggu Kode', cls: 'bg-[#FFFAEB] text-[#B54708]' }
  return { label: 'Sudah Dibuka', cls: 'bg-[#ECFDF3] text-[#067647]' }
}

const kelasOpsi = computed(() => [...new Set(barisSemua.value.map(p => p.kelasRombel))].filter(k => k && k !== '-').sort())
const statusKategori = (p: BarisPelanggaran) => statusBaris(p).label
const barisTampil = computed(() => barisSemua.value.filter(p => {
  if (filterKelas.value && p.kelasRombel !== filterKelas.value) return false
  if (filterJenis.value && p.jenis !== filterJenis.value) return false
  if (filterStatus.value && statusKategori(p) !== filterStatus.value) return false
  if (cariV.value) {
    const q = cariV.value.trim().toLowerCase()
    if (!p.nama.toLowerCase().includes(q) && !p.nis.includes(q)) return false
  }
  return true
}))

const kpiV = computed(() => {
  const batas = Date.now() - 7 * 24 * 3600_000
  return {
    mingguIni: barisSemua.value.filter(p => new Date(p.waktu).getTime() >= batas).length,
    menunggu: new Set(barisSemua.value.filter(menungguKode).map(kunciPenugasan)).size,
    total: kunciTotalSet.value.size,
    terbanyak: (() => {
      const hit = new Map<string, number>()
      for (const p of barisSemua.value) hit.set(p.jenis, (hit.get(p.jenis) ?? 0) + 1)
      const top = [...hit.entries()].sort((a, b) => b[1] - a[1])[0]
      return top ? (JENIS[top[0]] ?? top[0]) : '-'
    })()
  }
})

const apiDari = (source: AssessmentSource) => source === 'cbt' ? cbt : lms

const salinKode = async (p: BarisPelanggaran) => {
  try {
    await navigator.clipboard.writeText(p.kode)
    emit('toast', `Kode ${p.kode} tersalin. Bacakan ke ${p.nama}.`)
  } catch { emit('toast', 'Kode gagal disalin. Bacakan langsung ke siswa.') }
}

const bukaKunciPanel = async (p: BarisPelanggaran) => {
  if (sedangAksi.value) return
  sedangAksi.value = p.id
  try {
    const n = await apiDari(p.source).adminBukaKunci(p.assignmentId)
    emit('toast', n > 0 ? `Kunci ${p.nama} dibuka. Siswa bisa melanjutkan ujian.` : 'Tidak ada kunci yang menunggu untuk siswa ini.')
    await muatPelanggaran()
  } catch (e) {
    emit('toast', e instanceof Error ? e.message : 'Kunci gagal dibuka.')
  } finally { sedangAksi.value = '' }
}

const pulihkanPanel = async (p: BarisPelanggaran) => {
  if (sedangAksi.value) return
  const ok = confirm(`Pulihkan ujian ${p.nama}?\n\nLakukan hanya setelah memeriksa perangkat siswa (mis. HP force close).\n\n• Jawaban yang sudah diisi tetap ada.\n• Sisa waktu = sisa saat akun terkunci.\n• Siswa melanjutkan di peringatan ke-2: satu pelanggaran lagi langsung mengunci total.`)
  if (!ok) return
  sedangAksi.value = p.id
  try {
    const sisa = await apiDari(p.source).pulihkanUjian(p.assignmentId)
    emit('toast', `Ujian ${p.nama} dipulihkan. Sisa waktu ${Math.floor(sisa / 60)} menit ${sisa % 60} detik.`)
    await muatPelanggaran()
  } catch (e) {
    emit('toast', e instanceof Error ? e.message : 'Ujian gagal dipulihkan.')
  } finally { sedangAksi.value = '' }
}

// Reset pelanggaran (Superadmin): modal memperlihatkan kondisi siswa sebelum admin memutuskan.
const resetTarget = ref<BarisPelanggaran | null>(null)
const resetHitung = ref(false)
const kondisiReset = computed(() => {
  const t = resetTarget.value
  if (!t) return null
  const rows = barisSemua.value.filter(p => kunciPenugasan(p) === kunciPenugasan(t) && !p.dipulihkan)
  return {
    totalAktif: rows.length,
    tahap: rows.reduce((m, p) => Math.max(m, p.ke), 0),
    terkunciTotal: kunciTotalSet.value.has(kunciPenugasan(t)),
    menunggu: rows.some(menungguKode)
  }
})
const konfirmasiReset = async () => {
  const t = resetTarget.value
  if (!t || sedangAksi.value) return
  sedangAksi.value = t.id
  try {
    await apiDari(t.source).adminResetPelanggaran(t.assignmentId, resetHitung.value)
    emit('toast', resetHitung.value
      ? `Pelanggaran ${t.nama} direset penuh. Hitungan mulai dari nol lagi.`
      : `Kunci ${t.nama} direset. Siswa bisa melanjutkan ujian.`)
    resetTarget.value = null
    await muatPelanggaran()
  } catch (e) {
    emit('toast', e instanceof Error ? e.message : 'Reset gagal dilakukan.')
  } finally { sedangAksi.value = '' }
}

/* ================= SUB-TAB 2: MANAJEMEN PENGAWAS ================= */

const ruangApi = useRuangUjian()
const { tahun, muatOpsi } = useTahunAjaran()
const periode = ref('')
const riwayatPeriode = ref<string[]>([])
const ruangList = ref<RuangUjian[]>([])
const tautanList = ref<TautanUjian[]>([])
const namaGuru = ref<Map<string, string>>(new Map())
const memuatP = ref(false)
const galatP = ref('')
const hariPilih = ref('')
const sesiTerbuka = ref<Set<string>>(new Set())
const hanyaKosong = ref(false)

const periodeList = computed(() => periodeOpsi(tahun.value, riwayatPeriode.value))

interface BarisTugas {
  key: string
  roomId: string
  ruang: string
  subject: string
  name: string
  startsAt: string
  duration: number
  supervisorId: string | null
  kelas: number
}

// Daftar ujian ringan khusus tab Pengawas (kolom kecil saja, tanpa load() penuh).
const ujianPengawas = ref<{ id: string, subjectId: string, subject: string, name: string, startsAt?: string, duration: number, grade: GradeType }[]>([])

const barisTugas = computed<BarisTugas[]>(() => {
  const examById = new Map(ujianPengawas.value.map(item => [item.id, item]))
  const grup = new Map<string, BarisTugas>()
  for (const t of tautanList.value) {
    const exam = examById.get(t.exam_id)
    if (!exam || !exam.startsAt || exam.grade !== props.grade) continue
    const key = `${t.room_id}|${exam.subjectId}|${exam.startsAt}|${exam.name}`
    const ada = grup.get(key)
    if (ada) { ada.kelas++; continue }
    grup.set(key, {
      key, roomId: t.room_id, ruang: ruangList.value.find(item => item.id === t.room_id)?.name ?? '-',
      subject: exam.subject, name: exam.name, startsAt: exam.startsAt, duration: exam.duration,
      supervisorId: t.supervisor_id, kelas: 1
    })
  }
  return [...grup.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.ruang.localeCompare(b.ruang))
})

const kunciHari = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const labelHari = (kunci: string) => new Date(`${kunci}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
const jamDari = (iso: string) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
const jamSampai = (b: BarisTugas) => new Date(new Date(b.startsAt).getTime() + b.duration * 60_000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')

const hariList = computed(() => [...new Set(barisTugas.value.map(b => kunciHari(b.startsAt)))].sort())
const sesiHari = computed(() => {
  const grup = new Map<string, BarisTugas[]>()
  for (const b of barisTugas.value) {
    if (kunciHari(b.startsAt) !== hariPilih.value) continue
    grup.set(b.startsAt, [...(grup.get(b.startsAt) ?? []), b])
  }
  return [...grup.entries()].map(([startsAt, rows]) => {
    const terisi = rows.filter(r => r.supervisorId).length
    const mulai = new Date(startsAt).getTime()
    const selesai = Math.max(...rows.map(r => new Date(r.startsAt).getTime() + r.duration * 60_000))
    const now = Date.now()
    return {
      startsAt, rows: hanyaKosong.value ? rows.filter(r => !r.supervisorId) : rows,
      jam: `${jamDari(startsAt)}–${jamDari(new Date(selesai).toISOString())}`,
      mapel: [...new Set(rows.map(r => r.subject))].join(', '),
      terisi, total: rows.length,
      status: now >= mulai && now <= selesai ? 'BERLANGSUNG' : now < mulai ? 'SESI BERIKUTNYA' : 'SELESAI'
    }
  }).filter(s => s.rows.length).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
})

const kpiP = computed(() => {
  const rows = barisTugas.value.filter(b => kunciHari(b.startsAt) === hariPilih.value)
  return {
    sesi: new Set(rows.map(r => r.startsAt)).size,
    terisi: rows.filter(r => r.supervisorId).length,
    total: rows.length,
    pengawas: new Set(rows.map(r => r.supervisorId).filter(Boolean)).size,
    kosong: rows.filter(r => !r.supervisorId).length
  }
})

const bukaSesiOtomatis = () => {
  const now = Date.now()
  const aktif = sesiHari.value.find(s => {
    const mulai = new Date(s.startsAt).getTime()
    const selesai = Math.max(...s.rows.map(r => new Date(r.startsAt).getTime() + r.duration * 60_000))
    return now >= mulai && now <= selesai
  })
  const berikut = sesiHari.value.find(s => new Date(s.startsAt).getTime() > now)
  const target = aktif ?? berikut ?? sesiHari.value[0]
  sesiTerbuka.value = new Set(target ? [target.startsAt] : [])
}
const toggleSesi = (startsAt: string) => {
  const baru = new Set(sesiTerbuka.value)
  if (baru.has(startsAt)) baru.delete(startsAt); else baru.add(startsAt)
  sesiTerbuka.value = baru
}

const muatPengawas = async () => {
  if (!periode.value) return
  memuatP.value = true
  galatP.value = ''
  try {
    if (!ujianPengawas.value.length) {
      const [uRes, sRes] = await Promise.all([
        client.from('exams').select('id, name, subject_id, starts_at, duration_minutes, grade'),
        client.from('subjects').select('id, name')
      ])
      if (uRes.error) throw new Error(uRes.error.message)
      const mapelById = new Map((sRes.data ?? []).map((m: any) => [m.id, m.name as string]))
      ujianPengawas.value = ((uRes.data ?? []) as any[]).map(e => ({
        id: e.id, subjectId: e.subject_id, subject: mapelById.get(e.subject_id) ?? '-',
        name: e.name, startsAt: e.starts_at ?? undefined, duration: e.duration_minutes, grade: e.grade
      }))
    }
    if (!namaGuru.value.size) {
      const { data } = await client.from('teachers').select('id, name').order('name')
      namaGuru.value = new Map((data ?? []).map((t: any) => [t.id as string, t.name as string]))
    }
    ruangList.value = await ruangApi.muatRuang(props.grade, periode.value)
    tautanList.value = await ruangApi.muatTautanUjian(ruangList.value.map(item => item.id))
    riwayatPeriode.value = await ruangApi.muatPeriodeRiwayat(props.grade)
    if (!hariList.value.includes(hariPilih.value)) {
      const hariIni = kunciHari(new Date().toISOString())
      hariPilih.value = hariList.value.includes(hariIni) ? hariIni : (hariList.value.find(h => h >= hariIni) ?? hariList.value[0] ?? '')
    }
    bukaSesiOtomatis()
  } catch (e) {
    galatP.value = e instanceof Error ? e.message : 'Jadwal pengawas gagal dimuat.'
    ruangList.value = []
    tautanList.value = []
  } finally { memuatP.value = false }
}

/* ================= SUB-TAB 3: KEBIJAKAN UJIAN ================= */

interface BarisBebas {
  id: string
  nis: string
  nama: string
  kelas: string
  alasan: string
  keterangan: string
  berlaku_sampai: string | null
  aktif: boolean
  created_at: string
}

const daftarBebas = ref<BarisBebas[]>([])
const memuatK = ref(false)
const galatK = ref('')
const gerbangAktif = ref(true)
const nisEnv = ref<string[]>([])
const namaEnv = ref<Map<string, { nama: string, kelas: string }>>(new Map())
const formBebas = ref({ nis: '', nama: '', kelas: '', alasan: 'Perangkat di bawah Android 6', keterangan: '', berlakuSampai: '' })
const mencariSiswa = ref(false)
const menyimpanBebas = ref(false)
const ALASAN_OPSI = ['Perangkat di bawah Android 6', 'RAM perangkat hanya 2 GB', 'HP selalu mati saat login aplikasi', 'Perangkat rusak / tidak bisa instal aplikasi', 'Lainnya']

const statusBebas = (b: BarisBebas): { label: string, cls: string } => {
  if (!b.aktif) return { label: 'Berakhir', cls: 'bg-[#EFF2F7] text-[#475467]' }
  if (b.berlaku_sampai && b.berlaku_sampai < new Date().toISOString().slice(0, 10)) return { label: 'Kedaluwarsa', cls: 'bg-[#FFFAEB] text-[#B54708]' }
  return { label: 'Aktif', cls: 'bg-[#ECFDF3] text-[#067647]' }
}
const fmtTanggal = (iso: string | null) => iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tanpa batas'

const cariSiswaByNis = async (nis: string) => {
  const { data } = await client.from('students').select('id, name, nis, class_id').eq('nis', nis).limit(1)
  const s = (data ?? [])[0] as any
  if (!s) return null
  let kelas = ''
  if (s.class_id) {
    const { data: k } = await client.from('classes').select('name').eq('id', s.class_id).maybeSingle()
    kelas = (k as any)?.name ?? ''
  }
  return { nama: s.name as string, kelas }
}

const muatKebijakan = async () => {
  memuatK.value = true
  try {
    try {
      const st = await $fetch<{ gerbangAktif: boolean, nisEnv: string[] }>('/api/admin/cbt/gerbang')
      gerbangAktif.value = st.gerbangAktif
      nisEnv.value = st.nisEnv
      const peta = new Map<string, { nama: string, kelas: string }>()
      for (const nis of st.nisEnv) {
        const s = await cariSiswaByNis(nis).catch(() => null)
        if (s) peta.set(nis, s)
      }
      namaEnv.value = peta
    } catch { /* status env gagal dibaca: daftar panel tetap ditampilkan */ }
    const { data, error } = await client.from('cbt_bebas_gerbang').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(/cbt_bebas_gerbang/.test(error.message) || error.code === '42P01' || error.code === 'PGRST205'
      ? 'Jalankan migrasi 0092_manajemen_ujian_kebijakan.sql di Supabase SQL Editor agar daftar bebas gerbang aktif.'
      : error.message)
    daftarBebas.value = (data ?? []) as BarisBebas[]
    galatK.value = ''
  } catch (e) {
    galatK.value = e instanceof Error ? e.message : 'Daftar bebas gerbang gagal dimuat.'
  } finally { memuatK.value = false }
}

const cariSiswaForm = async () => {
  const nis = formBebas.value.nis.trim()
  if (!nis) return
  mencariSiswa.value = true
  try {
    const s = await cariSiswaByNis(nis)
    if (s) {
      formBebas.value.nama = s.nama
      formBebas.value.kelas = s.kelas
      emit('toast', `Siswa ditemukan: ${s.nama} (${s.kelas || 'kelas belum terdata'}).`)
    } else {
      emit('toast', `NIS ${nis} tidak ditemukan di data siswa. Periksa lagi nomornya.`)
    }
  } finally { mencariSiswa.value = false }
}

const simpanBebas = async () => {
  const f = formBebas.value
  if (!f.nis.trim() || !f.nama.trim()) {
    emit('toast', 'Isi NIS dan nama siswa dulu (pakai tombol Cari untuk mengisi otomatis).')
    return
  }
  if (nisEnv.value.includes(f.nis.trim())) {
    emit('toast', 'NIS ini sudah bebas gerbang dari pengaturan server (env). Tidak perlu ditambah lagi.')
    return
  }
  menyimpanBebas.value = true
  try {
    const { error } = await client.from('cbt_bebas_gerbang').insert({
      nis: f.nis.trim(), nama: f.nama.trim(), kelas: f.kelas.trim(), alasan: f.alasan,
      keterangan: f.keterangan.trim(), berlaku_sampai: f.berlakuSampai || null
    })
    if (error) throw new Error(/duplicate|unique/.test(error.message) ? 'NIS ini sudah ada di daftar. Aktifkan lagi dari tabel bila statusnya berakhir.' : error.message)
    emit('toast', `${f.nama} sekarang bebas gerbang — bisa login ujian lewat browser.`)
    formBebas.value = { nis: '', nama: '', kelas: '', alasan: 'Perangkat di bawah Android 6', keterangan: '', berlakuSampai: '' }
    await muatKebijakan()
  } catch (e) {
    emit('toast', e instanceof Error ? e.message : 'Pengecualian gagal disimpan.')
  } finally { menyimpanBebas.value = false }
}

const ubahAktifBebas = async (b: BarisBebas, aktif: boolean) => {
  try {
    const { error } = await client.from('cbt_bebas_gerbang').update({ aktif, updated_at: new Date().toISOString() }).eq('id', b.id)
    if (error) throw new Error(error.message)
    emit('toast', aktif ? `${b.nama} bebas gerbang lagi.` : `Pengecualian ${b.nama} dicabut. Login browsernya kembali digerbang.`)
    await muatKebijakan()
  } catch (e) {
    emit('toast', e instanceof Error ? e.message : 'Status gagal diubah.')
  }
}

/* ================= MUAT & PENGAWASAN ================= */

const sudahMuat = ref({ violations: false, pengawas: false, kebijakan: false })
const muatSubNav = async (tab: typeof activeSubNav.value) => {
  if (tab === 'violations' && !sudahMuat.value.violations) { sudahMuat.value.violations = true; await muatPelanggaran() }
  if (tab === 'pengawas' && !sudahMuat.value.pengawas) { sudahMuat.value.pengawas = true; await muatPengawas() }
  if (tab === 'kebijakan' && !sudahMuat.value.kebijakan) { sudahMuat.value.kebijakan = true; await muatKebijakan() }
}

let timerV: ReturnType<typeof setInterval> | null = null
onMounted(async () => {
  await muatOpsi()
  periode.value = periodeList.value[1] ?? periodeList.value[0] ?? ''
  await muatSubNav('violations')
  // Pelanggaran baru muncul sendiri selama tab Pelanggaran terbuka (query ringan tiap 15 detik).
  timerV = setInterval(() => {
    if (activeSubNav.value === 'violations' && document.visibilityState === 'visible') void muatPelanggaran()
  }, 15_000)
})
onUnmounted(() => { if (timerV) clearInterval(timerV) })
watch(activeSubNav, tab => { void muatSubNav(tab) })
watch(hariPilih, () => { bukaSesiOtomatis() })
watch([periode, () => props.grade], () => { if (sudahMuat.value.pengawas) void muatPengawas() })
watch(() => props.grade, () => {
  sudahMuat.value.violations = false
  if (activeSubNav.value === 'violations') void muatPelanggaran()
})
</script>

<template>
  <div class="space-y-4">
    <!-- KONTROL DARURAT UJIAN -->
    <section class="border border-[#F5C6C0] rounded-[20px] p-5 bg-[#FFFBFA] shadow-sm">
      <div class="flex items-start gap-4 flex-wrap">
        <span class="w-11 h-11 rounded-xl bg-[#F04438] text-white flex items-center justify-center shrink-0">
          <AdminV2Icon name="alert" :size="22" />
        </span>
        <div class="flex-1 min-w-[240px]">
          <h3 class="text-sm sm:text-[15px] font-extrabold text-[#7A271A] flex items-center gap-2 flex-wrap">
            <span>Kontrol Darurat Ujian</span>
            <span v-if="isFrozen" class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F04438] text-white inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>Timer Dibekukan</span>
            </span>
          </h3>
          <p class="text-xs text-[#7A271A] mt-1 max-w-2xl leading-relaxed">
            Jeda <b>seluruh timer ujian yang sedang berjalan</b> secara serentak saat insiden server. Waktu yang hilang dikompensasi otomatis saat timer dilanjutkan. Siswa yang disconnect dapat <b>login ulang dan otomatis melanjutkan</b> dari jawaban autosave terakhir — tidak ada jawaban yang hilang.
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white transition shadow-sm inline-flex items-center gap-2"
          :class="isFrozen ? 'bg-[#059669] hover:bg-[#047857]' : 'bg-[#F04438] hover:bg-[#D92D20]'"
          @click="isFreezeModalOpen = true"
        >
          <AdminV2Icon :name="isFrozen ? 'clock' : 'alert'" :size="15" />
          <span>{{ isFrozen ? 'Lanjutkan Semua Timer' : 'Bekukan Semua Timer' }}</span>
        </button>
      </div>
    </section>

    <!-- Header -->
    <div class="flex items-start justify-between gap-3 flex-wrap mb-1">
      <div>
        <h2 class="text-base sm:text-lg font-extrabold text-[#101828] flex items-center gap-2.5">
          <span class="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#818CF8] to-[#4C1D95] shrink-0" />
          <span>Manajemen &amp; Kontrol Sistem CBT</span>
        </h2>
        <p class="text-xs sm:text-[12.5px] text-[#667085] mt-1 ml-4">
          Pengawasan deteksi kecurangan, penugasan pengawas, dan kebijakan akses peserta ujian
        </p>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-[10.5px] font-extrabold px-2.5 py-1 rounded-full bg-[#E8F0FE] text-[#12459B]">BERLAKU: CBT</span>
        <span class="text-[10.5px] font-extrabold px-2.5 py-1 rounded-full bg-[#F1EAFE] text-[#6941C6]">BERLAKU: LMS</span>
      </div>
    </div>

    <!-- Subtabs -->
    <div class="flex items-center gap-1 bg-[#EFF2F7] p-1.5 rounded-2xl w-max max-w-full overflow-x-auto text-xs font-bold">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap"
        :class="activeSubNav === 'violations' ? 'bg-[#0A2A5C] text-white shadow-[0_1px_3px_rgba(16,24,40,0.25)]' : 'text-[#667085] hover:text-[#101828]'"
        @click="activeSubNav = 'violations'"
      >
        <AdminV2Icon name="alert" :size="14" />
        <span>Pelanggaran &amp; Anti-Cheat</span>
        <span v-if="kpiV.menunggu + kpiV.total" class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full" :class="activeSubNav === 'violations' ? 'bg-white/20 text-white' : 'bg-[#FDECEA] text-[#B42318]'">{{ kpiV.menunggu + kpiV.total }}</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap"
        :class="activeSubNav === 'pengawas' ? 'bg-[#0A2A5C] text-white shadow-[0_1px_3px_rgba(16,24,40,0.25)]' : 'text-[#667085] hover:text-[#101828]'"
        @click="activeSubNav = 'pengawas'"
      >
        <AdminV2Icon name="check" :size="14" />
        <span>Manajemen Pengawas</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap"
        :class="activeSubNav === 'kebijakan' ? 'bg-[#0A2A5C] text-white shadow-[0_1px_3px_rgba(16,24,40,0.25)]' : 'text-[#667085] hover:text-[#101828]'"
        @click="activeSubNav = 'kebijakan'"
      >
        <AdminV2Icon name="shield" :size="14" />
        <span>Kebijakan Ujian</span>
        <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full" :class="activeSubNav === 'kebijakan' ? 'bg-white/20 text-white' : 'bg-[#E8F0FE] text-[#12459B]'">Baru</span>
      </button>
    </div>

    <!-- ============ SUBVIEW 1: PELANGGARAN & ANTI-CHEAT ============ -->
    <div v-if="activeSubNav === 'violations'" class="space-y-3.5">
      <!-- Protokol -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl px-4 py-3.5 flex items-center gap-3.5 flex-wrap shadow-sm">
        <span class="w-9 h-9 rounded-xl bg-[#FDECEA] text-[#B42318] flex items-center justify-center shrink-0">
          <AdminV2Icon name="shield" :size="17" />
        </span>
        <div class="flex-1 min-w-[220px]">
          <b class="text-[13px] font-bold text-[#101828] block">Protokol Anti-Cheat CBT &amp; LMS</b>
          <p class="text-[11.5px] text-[#667085] mt-0.5 leading-relaxed">
            Pelanggaran tercatat otomatis dari aplikasi ujian. Akun terkunci bertahap — buka kuncinya memakai <b class="text-[#344054]">kode buka kunci 3 huruf</b> yang hanya bisa dilihat admin &amp; pengawas di halaman ini.
          </p>
        </div>
        <div class="flex items-center gap-1.5 text-center">
          <div class="rounded-xl bg-[#F6F8FC] border border-[#E7EBF2] px-3 py-2">
            <b class="block text-[13px] font-extrabold text-[#101828]">1&times;</b>
            <span class="text-[10px] text-[#667085] leading-tight block">Terkunci<br>pakai kode</span>
          </div>
          <span class="text-[#98A2B3]">&rarr;</span>
          <div class="rounded-xl bg-[#F6F8FC] border border-[#E7EBF2] px-3 py-2">
            <b class="block text-[13px] font-extrabold text-[#101828]">2&times;</b>
            <span class="text-[10px] text-[#667085] leading-tight block">Kunci ulang<br>kode baru</span>
          </div>
          <span class="text-[#98A2B3]">&rarr;</span>
          <div class="rounded-xl bg-[#FDECEA] border border-[#F5C6C0] px-3 py-2">
            <b class="block text-[13px] font-extrabold text-[#B42318]">3&times;</b>
            <span class="text-[10px] text-[#B42318] leading-tight block">Terkunci total<br>hasil terkumpul</span>
          </div>
        </div>
      </div>

      <!-- KPI strip -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#EFF2F7]">
        <div class="px-4 py-3.5">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Insiden Minggu Ini</span>
          <p class="mt-1 text-[13px] text-[#667085]"><b class="text-xl font-extrabold text-[#101828] mr-1">{{ kpiV.mingguIni }}</b>dari semua rombel</p>
        </div>
        <div class="px-4 py-3.5">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]"><span class="inline-block w-1.5 h-1.5 rounded-full bg-[#F04438] mr-1" />Menunggu Kode</span>
          <p class="mt-1 text-[13px] text-[#667085]"><b class="text-xl font-extrabold text-[#D92D20] mr-1">{{ kpiV.menunggu }}</b>siswa</p>
        </div>
        <div class="px-4 py-3.5">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]"><span class="inline-block w-1.5 h-1.5 rounded-full bg-[#F79009] mr-1" />Terkunci Total (3x)</span>
          <p class="mt-1 text-[13px] text-[#667085]"><b class="text-xl font-extrabold text-[#B54708] mr-1">{{ kpiV.total }}</b>siswa</p>
        </div>
        <div class="px-4 py-3.5">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Pelanggaran Terbanyak</span>
          <p class="mt-1.5 text-[13.5px] font-bold text-[#101828]">{{ kpiV.terbanyak }}</p>
        </div>
      </div>

      <!-- Tabel log -->
      <section class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-sm">
        <div class="p-4 border-b border-[#EFF2F7] flex items-center gap-2.5 flex-wrap">
          <input
            v-model="cariV"
            type="search"
            placeholder="Cari nama siswa / NIS..."
            class="flex-1 min-w-[180px] border border-[#E7EBF2] rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none focus:border-[#1B5FD9]"
          >
          <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            Kelas
            <select v-model="filterKelas" class="border border-[#E7EBF2] rounded-xl px-2.5 py-2.5 text-[12.5px] font-semibold text-[#101828] normal-case tracking-normal outline-none">
              <option value="">Semua Kelas</option>
              <option v-for="k in kelasOpsi" :key="k" :value="k">{{ k }}</option>
            </select>
          </label>
          <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            Pelanggaran
            <select v-model="filterJenis" class="border border-[#E7EBF2] rounded-xl px-2.5 py-2.5 text-[12.5px] font-semibold text-[#101828] normal-case tracking-normal outline-none">
              <option value="">Semua Jenis</option>
              <option v-for="(label, key) in JENIS" :key="key" :value="key">{{ label }}</option>
            </select>
          </label>
          <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            Status
            <select v-model="filterStatus" class="border border-[#E7EBF2] rounded-xl px-2.5 py-2.5 text-[12.5px] font-semibold text-[#101828] normal-case tracking-normal outline-none">
              <option value="">Semua Status</option>
              <option>Menunggu Kode</option>
              <option>Terkunci Total</option>
              <option>Sudah Dibuka</option>
              <option>Sudah Selesai</option>
              <option>Dipulihkan</option>
            </select>
          </label>
          <button type="button" class="px-3 py-2.5 rounded-xl border border-[#E7EBF2] text-[12px] font-bold text-[#344054] hover:bg-[#F6F8FC]" @click="muatPelanggaran">Muat Ulang</button>
        </div>

        <div class="px-4 py-3 border-b border-[#EFF2F7] flex items-center justify-between">
          <h4 class="text-[13.5px] font-bold text-[#101828]">Log Aktivitas &amp; Pelanggaran Peserta</h4>
          <span class="text-[11.5px] text-[#667085]">{{ barisTampil.length }} Insiden Ditampilkan &middot; diperbarui otomatis</span>
        </div>

        <p v-if="galatV" class="m-4 rounded-xl border border-[#F8D3CE] bg-[#FDECEA] px-4 py-3 text-xs font-semibold text-[#B42318]">{{ galatV }}</p>
        <p v-else-if="memuatV && !barisSemua.length" class="py-10 text-center text-xs text-[#667085]">Memuat pelanggaran&hellip;</p>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left min-w-[1060px]" style="table-layout:fixed">
            <colgroup>
              <col style="width:118px"><col style="width:178px"><col style="width:168px"><col style="width:158px">
              <col style="width:96px"><col style="width:158px"><col style="width:118px"><col>
            </colgroup>
            <thead>
              <tr class="border-b border-[#EFF2F7] text-[10px] uppercase tracking-wider font-semibold text-[#98A2B3]">
                <th class="py-2.5 px-3">Waktu</th>
                <th class="py-2.5 px-3">Nama Siswa &amp; Kelas</th>
                <th class="py-2.5 px-3">Sesi Ujian</th>
                <th class="py-2.5 px-3">Jenis Pelanggaran</th>
                <th class="py-2.5 px-3">Tahap Kunci</th>
                <th class="py-2.5 px-3">Kode Buka Kunci</th>
                <th class="py-2.5 px-3">Status Akun</th>
                <th class="py-2.5 px-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <tr v-for="p in barisTampil.slice(0, 100)" :key="`${p.source}:${p.id}`" class="hover:bg-[#F8FAFD]/70 align-middle">
                <td class="py-2.5 px-3">
                  <span class="block text-[12.5px] font-semibold text-[#101828] whitespace-nowrap">{{ fmtWaktu(p.waktu) }}</span>
                </td>
                <td class="py-2.5 px-3 min-w-0">
                  <b class="block text-[13px] font-semibold text-[#101828] truncate">{{ p.nama }}</b>
                  <span class="block text-[11px] text-[#667085] truncate">{{ p.kelasRombel }} &middot; NIS: {{ p.nis || '-' }}</span>
                </td>
                <td class="py-2.5 px-3 min-w-0">
                  <b class="block text-[12.5px] font-medium text-[#344054] truncate">{{ p.ujianNama }}</b>
                  <span class="inline-block mt-1 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded" :class="p.source === 'cbt' ? 'bg-[#E8F0FE] text-[#12459B]' : 'bg-[#F1EAFE] text-[#6941C6]'">{{ p.source === 'cbt' ? 'CBT' : 'LMS' }}</span>
                </td>
                <td class="py-2.5 px-3 min-w-0">
                  <b class="block text-[12.5px] font-medium text-[#344054] truncate"><span class="text-[#F79009] mr-0.5">&#9650;</span>{{ JENIS[p.jenis] ?? p.jenis }}</b>
                  <span class="block text-[11px] text-[#667085]">Pelanggaran ke-{{ p.ke }} tercatat</span>
                </td>
                <td class="py-2.5 px-3">
                  <span class="inline-flex items-center gap-1.5">
                    <span class="flex gap-1">
                      <span v-for="n in 3" :key="n" class="w-2 h-2 rounded-full" :class="n <= p.ke ? (p.ke >= 3 ? 'bg-[#F04438]' : 'bg-[#F79009]') : 'bg-[#E7EBF2]'" />
                    </span>
                    <b class="text-[12px] font-semibold text-[#344054]">Ke-{{ p.ke }}</b>
                  </span>
                </td>
                <td class="py-2.5 px-3">
                  <template v-if="kodeTerbaruSet.has(p.id) && p.kode">
                    <span class="inline-flex items-center gap-1.5">
                      <code class="font-mono font-bold tracking-[0.18em] text-[12.5px] bg-[#F6F8FC] border border-dashed border-[#C7D2E4] rounded-lg px-2 py-1">{{ kodeTerlihat.has(p.id) ? p.kode : '&bull;&bull;&bull;' }}</code>
                      <button type="button" class="px-2 py-1 rounded-lg border border-[#E7EBF2] text-[11px] font-bold text-[#1B5FD9] hover:bg-[#E8F0FE]" @click="kodeTerlihat.has(p.id) ? kodeTerlihat.delete(p.id) : kodeTerlihat.add(p.id)">{{ kodeTerlihat.has(p.id) ? 'Tutup' : 'Lihat' }}</button>
                      <button type="button" class="px-2 py-1 rounded-lg border border-[#E7EBF2] text-[11px] font-bold text-[#344054] hover:bg-[#F6F8FC]" @click="salinKode(p)">Salin</button>
                    </span>
                  </template>
                  <span v-else class="text-[#98A2B3]">&mdash;</span>
                </td>
                <td class="py-2.5 px-3">
                  <span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" :class="statusBaris(p).cls">{{ statusBaris(p).label }}</span>
                </td>
                <td class="py-2.5 px-3 text-right whitespace-nowrap">
                  <template v-if="barisTerbaruSet.has(p.id)">
                    <button
                      v-if="kodeTerbaruSet.has(p.id)"
                      type="button"
                      class="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#F04438] hover:bg-[#D92D20] text-white transition disabled:opacity-60"
                      :disabled="!!sedangAksi"
                      @click="bukaKunciPanel(p)"
                    >Buka Kunci</button>
                    <button
                      v-else-if="p.ke >= 3 && !p.dipulihkan && superadmin"
                      type="button"
                      class="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#F04438] hover:bg-[#D92D20] text-white transition disabled:opacity-60"
                      :disabled="!!sedangAksi"
                      @click="pulihkanPanel(p)"
                    >Pulihkan</button>
                    <button
                      v-if="superadmin && !p.dipulihkan"
                      type="button"
                      class="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[#E7EBF2] text-[#344054] hover:bg-[#F6F8FC] transition disabled:opacity-60 ml-1.5"
                      :disabled="!!sedangAksi"
                      @click="resetTarget = p; resetHitung = false"
                    >Reset</button>
                  </template>
                  <span v-else class="text-[11px] text-[#98A2B3]">&mdash;</span>
                </td>
              </tr>
              <tr v-if="!barisTampil.length">
                <td colspan="8" class="py-10 text-center text-[#98A2B3]">
                  <b class="text-xs text-[#344054] block">Tidak ada pelanggaran tercatat</b>
                  <span class="text-[11px]">Seluruh siswa mengikuti ujian dengan tertib.</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="barisTampil.length > 100" class="px-4 py-2.5 text-[11px] text-[#667085] border-t border-[#EFF2F7]">Menampilkan 100 insiden terbaru dari {{ barisTampil.length }}. Persempit dengan filter kelas / status untuk melihat yang lain.</p>
        </div>
      </section>
    </div>

    <!-- ============ SUBVIEW 2: MANAJEMEN PENGAWAS ============ -->
    <div v-else-if="activeSubNav === 'pengawas'" class="space-y-3.5">
      <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 shadow-sm">
        <div class="flex items-start gap-3 flex-wrap">
          <div class="flex-1 min-w-[220px]">
            <h4 class="text-[13.5px] font-bold text-[#101828]">Pengawas per Sesi Ujian</h4>
            <p class="text-[11.5px] text-[#667085] mt-0.5 leading-relaxed">
              Pengawas nempel ke sesi / jam, bukan terkunci di satu ruang — antar sesi yang tidak beririsan ia boleh pindah ruang.
              Sesi yang sedang berjalan terbuka otomatis. Penugasan diatur di menu Ruang Ujian &rarr; Jadwal Ujian; halaman ini untuk membaca &amp; memeriksa.
            </p>
          </div>
          <label class="block">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] mb-1">Periode</span>
            <select v-model="periode" class="border border-[#E7EBF2] rounded-xl px-3 py-2.5 text-[12.5px] font-semibold outline-none">
              <option v-for="p in periodeList" :key="p" :value="p">{{ p }}</option>
            </select>
          </label>
        </div>

        <!-- Pilihan hari: satu bar segmented -->
        <div class="mt-4 flex bg-white border border-[#E7EBF2] rounded-xl p-1 gap-1 overflow-x-auto" role="tablist" aria-label="Pilih hari">
          <button
            v-for="h in hariList"
            :key="h"
            type="button"
            class="flex-1 min-w-[104px] px-3 py-2 rounded-lg text-[12px] font-semibold whitespace-nowrap transition"
            :class="hariPilih === h ? 'bg-[#0A2A5C] text-white' : 'text-[#667085] hover:text-[#101828]'"
            @click="hariPilih = h"
          >{{ labelHari(h) }}</button>
          <span v-if="!hariList.length" class="px-3 py-2 text-[12px] text-[#98A2B3]">Belum ada jadwal pada periode ini</span>
        </div>
        <p class="mt-2 text-[11.5px] text-[#667085]">Menampilkan jadwal <b class="text-[#344054]">{{ hariPilih ? labelHari(hariPilih) : '-' }}</b> &middot; sesi aktif terbuka otomatis mengikuti jam server perangkat ini.</p>
      </div>

      <!-- KPI pengawas -->
      <div class="bg-white border border-[#E7EBF2] rounded-2xl shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#EFF2F7]">
        <div class="px-4 py-3.5">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Sesi Hari Ini</span>
          <p class="mt-1 text-[13px] text-[#667085]"><b class="text-xl font-extrabold text-[#101828] mr-1">{{ kpiP.sesi }}</b>sesi ujian</p>
        </div>
        <div class="px-4 py-3.5">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Ruang Terisi Pengawas</span>
          <p class="mt-1 text-[13px] text-[#667085]"><b class="text-xl font-extrabold text-[#101828] mr-1">{{ kpiP.terisi }}/{{ kpiP.total }}</b>ruang</p>
        </div>
        <div class="px-4 py-3.5">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Pengawas Bertugas</span>
          <p class="mt-1 text-[13px] text-[#667085]"><b class="text-xl font-extrabold text-[#101828] mr-1">{{ kpiP.pengawas }}</b>guru</p>
        </div>
        <div class="px-4 py-3.5">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Slot Kosong</span>
          <p class="mt-1 text-[13px] text-[#667085]"><b class="text-xl font-extrabold mr-1" :class="kpiP.kosong ? 'text-[#D92D20]' : 'text-[#067647]'">{{ kpiP.kosong }}</b>ruang belum ada pengawas</p>
        </div>
      </div>

      <label class="flex items-center gap-2 text-[12px] font-semibold text-[#344054] cursor-pointer select-none px-1">
        <input v-model="hanyaKosong" type="checkbox" class="w-4 h-4 accent-[#0A2A5C]">
        Hanya tampilkan slot kosong
      </label>

      <p v-if="galatP" class="rounded-xl border border-[#F8D3CE] bg-[#FDECEA] px-4 py-3 text-xs font-semibold text-[#B42318]">{{ galatP }}</p>
      <p v-else-if="memuatP" class="py-8 text-center text-xs text-[#667085]">Memuat jadwal pengawas&hellip;</p>
      <p v-else-if="!sesiHari.length" class="py-8 text-center text-xs text-[#667085]">Tidak ada sesi pada hari ini{{ hanyaKosong ? ' tanpa pengawas' : '' }}.</p>

      <!-- Akordeon per sesi -->
      <section
        v-for="(s, idx) in sesiHari"
        :key="s.startsAt"
        class="bg-white border rounded-2xl overflow-hidden shadow-sm"
        :class="s.status === 'BERLANGSUNG' ? 'border-[#ABEFC6]' : 'border-[#E7EBF2]'"
      >
        <button type="button" class="w-full flex items-center gap-3 px-4 py-3.5 text-left flex-wrap" @click="toggleSesi(s.startsAt)">
          <span class="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-[#0A2A5C] text-white">SESI {{ idx + 1 }}</span>
          <b class="text-[14px] font-bold text-[#101828]">{{ s.jam }} WIB</b>
          <span class="text-[12.5px] text-[#344054] font-medium">{{ s.mapel }}</span>
          <span class="flex-1 min-w-[120px] flex items-center gap-2">
            <span class="flex-1 h-1.5 rounded-full bg-[#EFF2F7] overflow-hidden"><span class="block h-full rounded-full bg-[#12B76A]" :style="{ width: `${s.total ? (s.terisi / s.total) * 100 : 0}%` }" /></span>
            <span class="text-[11px] font-semibold text-[#667085] whitespace-nowrap">{{ s.terisi }}/{{ s.total }} pengawas</span>
          </span>
          <span v-if="s.status === 'BERLANGSUNG'" class="text-[10px] font-extrabold px-2 py-1 rounded-full bg-[#ECFDF3] text-[#067647]">BERLANGSUNG</span>
          <span v-else-if="s.status === 'SESI BERIKUTNYA'" class="text-[10px] font-extrabold px-2 py-1 rounded-full bg-[#FFFAEB] text-[#B54708]">SESI BERIKUTNYA</span>
          <span v-else class="text-[10px] font-extrabold px-2 py-1 rounded-full bg-[#EFF2F7] text-[#475467]">SELESAI</span>
          <span class="text-[#98A2B3] text-sm">{{ sesiTerbuka.has(s.startsAt) ? '▾' : '▸' }}</span>
        </button>
        <div v-if="sesiTerbuka.has(s.startsAt)" class="border-t border-[#EFF2F7] px-4 py-2">
          <div
            v-for="b in s.rows"
            :key="b.key"
            class="flex items-center gap-3 py-2.5 border-b border-[#F4F6FA] last:border-0 flex-wrap"
          >
            <span class="text-[11px] font-bold px-2 py-1 rounded-lg bg-[#F6F8FC] border border-[#E7EBF2] text-[#344054] whitespace-nowrap">{{ b.ruang }}</span>
            <span class="flex-1 min-w-[160px]">
              <b class="block text-[12.5px] font-semibold text-[#101828]">{{ b.name }}</b>
              <span class="block text-[11px] text-[#667085]">{{ b.subject }} &middot; {{ b.kelas }} kelas di ruang ini</span>
            </span>
            <template v-if="b.supervisorId">
              <span class="w-7 h-7 rounded-full bg-[#0A2A5C] text-white inline-flex items-center justify-center text-[10px] font-bold shrink-0">{{ (namaGuru.get(b.supervisorId) ?? 'G').split(' ').map(k => k[0]).slice(0, 2).join('') }}</span>
              <span class="text-[12.5px] font-semibold text-[#101828]">{{ namaGuru.get(b.supervisorId) ?? 'Guru' }}</span>
              <span class="w-2 h-2 rounded-full bg-[#12B76A]" />
            </template>
            <template v-else>
              <span class="text-[11px] font-extrabold px-2 py-1 rounded-full bg-[#FDECEA] text-[#B42318]">BELUM DIISI</span>
            </template>
            <button
              type="button"
              class="px-2.5 py-1.5 rounded-lg border border-[#E7EBF2] text-[11.5px] font-bold text-[#1B5FD9] hover:bg-[#E8F0FE]"
              @click="emit('toast', `Atur pengawas ${b.ruang} lewat menu Ruang Ujian → buka ruangnya → tab Jadwal Ujian.`)"
            >{{ b.supervisorId ? 'Ganti' : 'Atur' }}</button>
          </div>
        </div>
      </section>
    </div>

    <!-- ============ SUBVIEW 3: KEBIJAKAN UJIAN ============ -->
    <div v-else class="space-y-3.5">
      <div class="bg-white border border-[#E7EBF2] rounded-2xl px-4 py-3.5 flex items-start gap-3 shadow-sm">
        <span class="w-9 h-9 rounded-xl bg-[#E8F0FE] text-[#12459B] flex items-center justify-center shrink-0">
          <AdminV2Icon name="shield" :size="17" />
        </span>
        <p class="text-[12px] text-[#475467] leading-relaxed">
          <b class="text-[#101828]">Gerbang Aplikasi Ujian.</b> Siswa wajib login ujian lewat aplikasi resmi Darqia.
          Siswa yang perangkatnya tidak mendukung aplikasi (mis. di bawah Android 6 / RAM 2 GB) bisa dikecualikan per NIS di daftar ini —
          setelah ditambahkan, ia bisa login ujian lewat browser web. Daftar ini berlaku untuk <b class="text-[#101828]">CBT dan LMS</b>, semua jenjang.
          Status gerbang saat ini:
          <b :class="gerbangAktif ? 'text-[#067647]' : 'text-[#B42318]'">{{ gerbangAktif ? 'AKTIF' : 'NONAKTIF (dari server)' }}</b>.
        </p>
      </div>

      <p v-if="galatK" class="rounded-xl border border-[#F8D3CE] bg-[#FDECEA] px-4 py-3 text-xs font-semibold text-[#B42318]">{{ galatK }}</p>

      <!-- Form tambah pengecualian -->
      <section v-if="superadmin" class="bg-white border border-[#E7EBF2] rounded-2xl p-4 shadow-sm">
        <h4 class="text-[13.5px] font-bold text-[#101828]">Tambah Pengecualian NIS</h4>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <label class="block">
            <span class="block text-[11px] font-bold text-[#344054] mb-1">NIS Siswa</span>
            <span class="flex gap-1.5">
              <input v-model="formBebas.nis" type="text" inputmode="numeric" placeholder="cth. 26270120114" class="flex-1 min-w-0 border border-[#E7EBF2] rounded-xl px-3 py-2.5 text-[12.5px] outline-none focus:border-[#1B5FD9]">
              <button type="button" class="px-3 py-2.5 rounded-xl bg-[#0A2A5C] text-white text-[12px] font-bold disabled:opacity-60" :disabled="mencariSiswa" @click="cariSiswaForm">{{ mencariSiswa ? 'Mencari…' : 'Cari' }}</button>
            </span>
          </label>
          <label class="block">
            <span class="block text-[11px] font-bold text-[#344054] mb-1">Nama Siswa</span>
            <input v-model="formBebas.nama" type="text" placeholder="Terisi otomatis dari tombol Cari" class="w-full border border-[#E7EBF2] rounded-xl px-3 py-2.5 text-[12.5px] outline-none focus:border-[#1B5FD9]">
          </label>
          <label class="block">
            <span class="block text-[11px] font-bold text-[#344054] mb-1">Alasan Pengecualian</span>
            <select v-model="formBebas.alasan" class="w-full border border-[#E7EBF2] rounded-xl px-3 py-2.5 text-[12.5px] outline-none">
              <option v-for="a in ALASAN_OPSI" :key="a" :value="a">{{ a }}</option>
            </select>
          </label>
          <label class="block">
            <span class="block text-[11px] font-bold text-[#344054] mb-1">Berlaku Sampai</span>
            <input v-model="formBebas.berlakuSampai" type="date" class="w-full border border-[#E7EBF2] rounded-xl px-3 py-2.5 text-[12.5px] outline-none focus:border-[#1B5FD9]">
          </label>
          <label class="block sm:col-span-2">
            <span class="block text-[11px] font-bold text-[#344054] mb-1">Kelas</span>
            <input v-model="formBebas.kelas" type="text" placeholder="Terisi otomatis dari tombol Cari" class="w-full border border-[#E7EBF2] rounded-xl px-3 py-2.5 text-[12.5px] outline-none focus:border-[#1B5FD9]">
          </label>
          <label class="block sm:col-span-2">
            <span class="block text-[11px] font-bold text-[#344054] mb-1">Keterangan (opsional)</span>
            <input v-model="formBebas.keterangan" type="text" placeholder="cth. HP mati total saat membuka aplikasi" class="w-full border border-[#E7EBF2] rounded-xl px-3 py-2.5 text-[12.5px] outline-none focus:border-[#1B5FD9]">
          </label>
        </div>
        <div class="flex justify-end mt-3">
          <button type="button" class="px-4 py-2.5 rounded-xl bg-[#1B5FD9] hover:bg-[#12459B] text-white text-[12.5px] font-bold disabled:opacity-60" :disabled="menyimpanBebas" @click="simpanBebas">{{ menyimpanBebas ? 'Menyimpan…' : '+ Tambah ke Daftar Bebas Gerbang' }}</button>
        </div>
      </section>
      <p v-else class="rounded-xl border border-[#E7EBF2] bg-[#F6F8FC] px-4 py-3 text-[12px] text-[#475467]">
        Daftar ini hanya bisa diubah oleh <b>Superadmin</b>. Anda tetap bisa melihat siapa saja yang bebas gerbang.
      </p>

      <!-- Tabel daftar bebas gerbang -->
      <section class="bg-white border border-[#E7EBF2] rounded-2xl overflow-hidden shadow-sm">
        <div class="px-4 py-3 border-b border-[#EFF2F7] flex items-center justify-between">
          <h4 class="text-[13.5px] font-bold text-[#101828]">Daftar NIS Bebas Gerbang</h4>
          <span class="text-[11.5px] text-[#667085]">{{ daftarBebas.filter(b => statusBebas(b).label === 'Aktif').length + nisEnv.length }} pengecualian aktif</span>
        </div>
        <p v-if="memuatK" class="py-10 text-center text-xs text-[#667085]">Memuat daftar&hellip;</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left min-w-[860px]" style="table-layout:fixed">
            <colgroup><col style="width:190px"><col style="width:110px"><col style="width:210px"><col style="width:120px"><col style="width:100px"><col></colgroup>
            <thead>
              <tr class="border-b border-[#EFF2F7] text-[10px] uppercase tracking-wider font-semibold text-[#98A2B3]">
                <th class="py-2.5 px-3">Siswa</th>
                <th class="py-2.5 px-3">NIS</th>
                <th class="py-2.5 px-3">Alasan &amp; Keterangan</th>
                <th class="py-2.5 px-3">Berlaku Sampai</th>
                <th class="py-2.5 px-3">Status</th>
                <th class="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EFF2F7]">
              <!-- Baris dari env server: tidak bisa diubah dari panel -->
              <tr v-for="nis in nisEnv" :key="`env:${nis}`" class="hover:bg-[#F8FAFD]/70">
                <td class="py-2.5 px-3 min-w-0">
                  <b class="block text-[13px] font-semibold text-[#101828] truncate">{{ namaEnv.get(nis)?.nama ?? 'Akun Sistem' }}</b>
                  <span class="block text-[11px] text-[#667085] truncate">{{ namaEnv.get(nis)?.kelas ?? 'Diatur dari server' }}</span>
                </td>
                <td class="py-2.5 px-3 font-mono text-[12px] text-[#344054]">{{ nis }}</td>
                <td class="py-2.5 px-3 text-[12px] text-[#475467]">Pengecualian tetap dari pengaturan server (env)</td>
                <td class="py-2.5 px-3 text-[12px] text-[#475467]">Tanpa batas</td>
                <td class="py-2.5 px-3"><span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#067647]">Aktif</span></td>
                <td class="py-2.5 px-3 text-right"><span class="text-[10.5px] font-bold px-2 py-1 rounded-full bg-[#EFF2F7] text-[#475467]">AKUN SISTEM</span></td>
              </tr>
              <tr v-for="b in daftarBebas" :key="b.id" class="hover:bg-[#F8FAFD]/70">
                <td class="py-2.5 px-3 min-w-0">
                  <b class="block text-[13px] font-semibold text-[#101828] truncate">{{ b.nama }}</b>
                  <span class="block text-[11px] text-[#667085] truncate">{{ b.kelas || '-' }}</span>
                </td>
                <td class="py-2.5 px-3 font-mono text-[12px] text-[#344054]">{{ b.nis }}</td>
                <td class="py-2.5 px-3 min-w-0">
                  <span class="block text-[12px] text-[#344054] truncate">{{ b.alasan }}</span>
                  <span v-if="b.keterangan" class="block text-[11px] text-[#667085] truncate">{{ b.keterangan }}</span>
                </td>
                <td class="py-2.5 px-3 text-[12px] text-[#475467]">{{ fmtTanggal(b.berlaku_sampai) }}</td>
                <td class="py-2.5 px-3"><span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" :class="statusBebas(b).cls">{{ statusBebas(b).label }}</span></td>
                <td class="py-2.5 px-3 text-right whitespace-nowrap">
                  <button
                    v-if="superadmin && b.aktif"
                    type="button"
                    class="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[#F5C6C0] text-[#B42318] hover:bg-[#FDECEA]"
                    @click="ubahAktifBebas(b, false)"
                  >Cabut</button>
                  <button
                    v-else-if="superadmin"
                    type="button"
                    class="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[#E7EBF2] text-[#1B5FD9] hover:bg-[#E8F0FE]"
                    @click="ubahAktifBebas(b, true)"
                  >Aktifkan Lagi</button>
                  <span v-else class="text-[11px] text-[#98A2B3]">&mdash;</span>
                </td>
              </tr>
              <tr v-if="!daftarBebas.length && !nisEnv.length">
                <td colspan="6" class="py-10 text-center text-[#98A2B3]">
                  <b class="text-xs text-[#344054] block">Belum ada pengecualian</b>
                  <span class="text-[11px]">Semua siswa wajib login ujian lewat aplikasi resmi.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Kartu kebijakan -->
      <div class="grid sm:grid-cols-2 gap-3">
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <b class="text-[13px] font-bold text-[#101828]">Gerbang Aplikasi (Darurat)</b>
            <span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" :class="gerbangAktif ? 'bg-[#ECFDF3] text-[#067647]' : 'bg-[#FDECEA] text-[#B42318]'">{{ gerbangAktif ? 'Aktif' : 'Nonaktif' }}</span>
          </div>
          <p class="text-[11.5px] text-[#667085] mt-1.5 leading-relaxed">Saklar utama gerbang diatur dari server (env <span class="font-mono">NUXT_CBT_GERBANG_APLIKASI</span>). Matikan hanya saat darurat massal — semua siswa bisa login browser selama saklar mati, lalu nyalakan lagi setelah insiden selesai.</p>
        </div>
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <b class="text-[13px] font-bold text-[#101828]">Akun Guru &amp; Staff</b>
            <span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#067647]">Otomatis</span>
          </div>
          <p class="text-[11.5px] text-[#667085] mt-1.5 leading-relaxed">Sesi login guru, pengawas, dan admin selalu bebas gerbang untuk keperluan pengujian dan pemantauan — tidak perlu dimasukkan ke daftar.</p>
        </div>
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <b class="text-[13px] font-bold text-[#101828]">Ujian PR (LMS)</b>
            <span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#067647]">Bebas Gerbang</span>
          </div>
          <p class="text-[11.5px] text-[#667085] mt-1.5 leading-relaxed">Pekerjaan rumah memang dikerjakan dari rumah lewat browser, jadi ujian bertipe PR di LMS tidak pernah digerbang.</p>
        </div>
        <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <b class="text-[13px] font-bold text-[#101828]">Jalur iOS (Safe Exam Browser)</b>
            <span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#067647]">Diizinkan</span>
          </div>
          <p class="text-[11.5px] text-[#667085] mt-1.5 leading-relaxed">Siswa iPhone/iPad mengikuti ujian lewat Safe Exam Browser (SEB) — jalur ini dikenali otomatis dan tidak diblokir gerbang.</p>
        </div>
      </div>
    </div>

    <!-- MODAL RESET PELANGGARAN -->
    <Teleport to="body">
      <div v-if="resetTarget" class="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#101828]/45 backdrop-blur-[2px]" @click="resetTarget = null" />
        <div class="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-3.5">
          <h3 class="text-base font-extrabold text-[#101828]">Reset Kunci — {{ resetTarget.nama }}</h3>
          <div class="rounded-xl bg-[#F6F8FC] border border-[#E7EBF2] px-4 py-3 text-[12px] text-[#344054] space-y-1">
            <p><b>Kelas / NIS:</b> {{ resetTarget.kelasRombel }} / {{ resetTarget.nis || '-' }}</p>
            <p><b>Ujian:</b> {{ resetTarget.ujianNama }} ({{ resetTarget.source === 'cbt' ? 'CBT' : 'LMS' }})</p>
            <p><b>Pelanggaran aktif:</b> {{ kondisiReset?.totalAktif ?? 0 }}x &middot; tahap kunci saat ini <b>Ke-{{ kondisiReset?.tahap ?? 0 }}</b></p>
            <p><b>Kondisi:</b> {{ kondisiReset?.terkunciTotal ? 'Terkunci total — hasil sudah terkumpul' : kondisiReset?.menunggu ? 'Menunggu kode buka kunci' : 'Kunci sudah terbuka' }}</p>
          </div>
          <p class="text-xs text-[#475467] leading-relaxed">
            Pakai reset hanya bila kunci <b>bukan karena kecurangan</b> — mis. aplikasi tertutup sendiri, HP mati, atau listrik padam.
            Kunci akan dibuka dan siswa bisa melanjutkan dari jawaban terakhirnya.
          </p>
          <label class="flex items-start gap-2.5 rounded-xl border border-[#E7EBF2] px-3.5 py-3 cursor-pointer">
            <input v-model="resetHitung" type="checkbox" class="mt-0.5 w-4 h-4 accent-[#0A2A5C]">
            <span class="text-[12px] text-[#344054]"><b>Reset juga hitungan pelanggarannya</b><br>
            <span class="text-[#667085]">Dicentang: hitungan kembali ke nol, pelanggaran berikutnya dihitung dari Ke-1 lagi. Tidak dicentang: kunci dibuka, tetapi tahap pelanggaran tetap tercatat.</span></span>
          </label>
          <div class="flex justify-end gap-2 pt-2 border-t border-[#EFF2F7]">
            <button type="button" class="px-4 py-2 rounded-xl border border-[#E7EBF2] bg-white text-[#344054] font-bold text-xs" @click="resetTarget = null">Batal</button>
            <button type="button" class="px-4 py-2 rounded-xl bg-[#F04438] hover:bg-[#D92D20] text-white font-bold text-xs shadow-sm disabled:opacity-60" :disabled="!!sedangAksi" @click="konfirmasiReset">{{ sedangAksi ? 'Mereset…' : 'Ya, Reset Kunci' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL KONFIRMASI BEKU LANJUTKAN TIMER -->
    <Teleport to="body">
      <div v-if="isFreezeModalOpen" class="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#101828]/45 backdrop-blur-[2px]" @click="isFreezeModalOpen = false" />
        <div class="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-3.5">
          <h3 class="text-base font-extrabold text-[#101828]">
            {{ isFrozen ? 'Lanjutkan Semua Timer Ujian?' : 'Bekukan Semua Timer Ujian?' }}
          </h3>
          <p class="text-xs text-[#475467] leading-relaxed">
            <template v-if="isFrozen">
              Timer ujian akan berjalan kembali untuk seluruh peserta. <b>Kompensasi waktu otomatis</b> diterapkan sebesar durasi pembekuan, sehingga tidak ada siswa yang dirugikan.
            </template>
            <template v-else>
              Seluruh timer pada sesi yang <b>sedang berjalan</b> akan dijeda serentak. Gunakan hanya saat insiden server / darurat. Aksi ini tercatat di audit trail.
            </template>
          </p>
          <div class="flex justify-end gap-2 pt-2 border-t border-[#EFF2F7]">
            <button type="button" class="px-4 py-2 rounded-xl border border-[#E7EBF2] bg-white text-[#344054] font-bold text-xs" @click="isFreezeModalOpen = false">Batal</button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm"
              :class="isFrozen ? 'bg-[#059669] hover:bg-[#047857]' : 'bg-[#F04438] hover:bg-[#D92D20]'"
              @click="handleConfirmFreezeToggle"
            >{{ isFrozen ? 'Ya, Lanjutkan' : 'Ya, Bekukan Sekarang' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
