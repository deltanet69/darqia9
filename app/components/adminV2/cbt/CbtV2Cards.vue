<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { GradeType } from './cbtV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import { useKartuUjian, type PeriodeKartu, type SiswaKartu } from '~/composables/useKartuUjian'
import { periodeOpsi } from '~/composables/ruangUjianCore'
import { cetakKartu } from '~/utils/cbtKartuCetak'

const props = defineProps<{ grade: GradeType }>()
const emit = defineEmits<{ (e: 'toast', msg: string): void }>()

const api = useKartuUjian()
const cbtData = useAdminCbtData('cbt')
const { tahun, muatOpsi } = useTahunAjaran()
// Kartu hanya dikelola Superadmin; peran lain hanya melihat.
const bolehKelola = computed(() => cbtData.adalahSuperadmin.value)

const daftarPeriode = ref<PeriodeKartu[]>([])
const pilihId = ref('')
const siswa = ref<SiswaKartu[]>([])
const loadingPeriode = ref(true)
const loading = ref(false)
const busy = ref(false)
const errorPeriode = ref('')
const error = ref('')
const kelas = ref('')
const tanggalForm = ref({ startsOn: '', endsOn: '' })
const formBaru = ref<{ periode: string, startsOn: string, endsOn: string } | null>(null)

const aktif = computed(() => daftarPeriode.value.find(p => p.id === pilihId.value) ?? null)
const rilisAktif = computed(() => !!aktif.value?.releasedAt)
// Periode yang belum dibuat untuk jenjang ini (tahun ajaran aktif) = pilihan saat membuat periode baru.
const opsiBaru = computed(() => periodeOpsi(tahun.value, []).filter(p => !daftarPeriode.value.some(d => d.periode === p)))
const tanggal = (v: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(v))
const urutKelas = (a: string, b: string) => a.localeCompare(b, 'id', { numeric: true })

// Rekap per kelas: kelas tercatat di kartu saat terbit, jadi kartu tetap di kelas asalnya.
const rekapKelas = computed(() => {
  const map = new Map<string, { nama: string, kartu: number, belum: number, belumBeres: number }>()
  for (const s of siswa.value) {
    const r = map.get(s.classroom) ?? { nama: s.classroom, kartu: 0, belum: 0, belumBeres: 0 }
    if (s.token) r.kartu++
    else r.belum++
    if (!s.eligible) r.belumBeres++
    map.set(s.classroom, r)
  }
  return [...map.values()].sort((a, b) => urutKelas(a.nama, b.nama))
})
const ringkas = computed(() => ({
  kartu: siswa.value.filter(s => s.token).length,
  belum: siswa.value.filter(s => !s.token).length,
  belumBeres: siswa.value.filter(s => !s.eligible).length
}))

const tampil = computed(() => siswa.value.filter(s => s.classroom === kelas.value))
const bisaCetak = (s: SiswaKartu) => s.eligible && s.active && !!s.token
// Pilihan baris untuk aksi massal; hanya siswa yang sudah punya kartu yang bisa dipilih.
const dipilih = ref<string[]>([])
const bisaPilih = computed(() => tampil.value.filter(s => s.cardId))
const terpilih = computed(() => bisaPilih.value.filter(s => dipilih.value.includes(s.cardId!)))
const semuaDipilih = computed(() => bisaPilih.value.length > 0 && terpilih.value.length === bisaPilih.value.length)
const pilihSemua = () => { dipilih.value = semuaDipilih.value ? [] : bisaPilih.value.map(s => s.cardId!) }
watch(kelas, () => { dipilih.value = [] })

const pesanGalat = (e: unknown, cadangan: string) => {
  const m = e instanceof Error ? e.message : cadangan
  return /exam_card|release_exam_cards|card_token_for|regenerate_card_token|classroom/.test(m)
    ? 'Fitur Kartu Ujian belum aktif di server. Terapkan migrasi 0055_kartu_ujian.sql dan 0056_kartu_ujian_per_kelas.sql di Supabase, lalu muat ulang.'
    : m
}

const muatPeriode = async () => {
  loadingPeriode.value = true
  errorPeriode.value = ''
  try {
    daftarPeriode.value = (await api.muatPeriode(props.grade)).sort((a, b) => b.startsOn.localeCompare(a.startsOn))
    if (!aktif.value) pilihId.value = daftarPeriode.value[0]?.id ?? ''
  } catch (e) {
    errorPeriode.value = pesanGalat(e, 'Periode kartu gagal dimuat.')
  } finally {
    loadingPeriode.value = false
  }
}
const muatSiswa = async () => {
  if (!aktif.value) { siswa.value = []; return }
  loading.value = true
  error.value = ''
  try {
    siswa.value = await api.muatSiswa(aktif.value)
    dipilih.value = dipilih.value.filter(id => siswa.value.some(s => s.cardId === id))
  } catch (e) {
    error.value = pesanGalat(e, 'Daftar kartu gagal dimuat.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  void cbtData.load()
  await muatOpsi()
  await muatPeriode()
})
watch(pilihId, () => {
  kelas.value = ''
  dipilih.value = []
  tanggalForm.value = { startsOn: aktif.value?.startsOn ?? '', endsOn: aktif.value?.endsOn ?? '' }
  void muatSiswa()
})

const jalankan = async (tugas: () => Promise<string>, gagal: string) => {
  if (busy.value) return
  busy.value = true
  try { emit('toast', await tugas()) } catch (e) { emit('toast', pesanGalat(e, gagal)) } finally { busy.value = false }
}

const bukaFormBaru = () => { formBaru.value = { periode: opsiBaru.value[0] ?? '', startsOn: '', endsOn: '' } }
const buatPeriode = () => jalankan(async () => {
  const f = formBaru.value!
  await api.simpanPeriode({ grade: props.grade, ...f })
  formBaru.value = null
  await muatPeriode()
  pilihId.value = daftarPeriode.value.find(p => p.periode === f.periode)?.id ?? pilihId.value
  return `Periode ${f.periode} dibuat.`
}, 'Periode gagal dibuat.')

const simpanTanggal = () => jalankan(async () => {
  await api.simpanPeriode({ id: aktif.value!.id, grade: props.grade, periode: aktif.value!.periode, ...tanggalForm.value })
  await muatPeriode()
  return 'Tanggal ujian disimpan.'
}, 'Tanggal gagal disimpan.')

const hapusPeriode = () => {
  const p = aktif.value
  if (!p) return
  const pesan = rilisAktif.value
    ? `Hapus periode ${p.periode} beserta ${ringkas.value.kartu} kartu yang sudah dirilis? Kartu yang terhapus tidak bisa dikembalikan.`
    : `Hapus periode ${p.periode}?`
  if (!confirm(pesan)) return
  return jalankan(async () => {
    await api.hapusPeriode(p.id)
    pilihId.value = ''
    await muatPeriode()
    return `Periode ${p.periode} dihapus.`
  }, 'Periode gagal dihapus.')
}

const terbitkan = () => {
  if (!aktif.value) return
  if (!rilisAktif.value && !confirm('Rilis kartu? Token siswa akan terkunci sampai ujian selesai dan tidak berubah saat ujian dibuat.')) return
  return jalankan(async () => {
    const n = await api.rilis(aktif.value!.id)
    await muatPeriode()
    await muatSiswa()
    return n ? `${n} kartu diterbitkan.` : 'Semua siswa eligible sudah memiliki kartu.'
  }, 'Kartu gagal diterbitkan.')
}

const regenerasi = (daftar: SiswaKartu[]) => {
  const target = daftar.filter(s => s.cardId)
  if (!target.length) return
  const siapa = target.length === 1 ? target[0]!.name : `${target.length} siswa terpilih`
  if (!confirm(`Ganti token ${siapa}? Token lama langsung tidak berlaku dan kartu harus dicetak ulang.`)) return
  return jalankan(async () => {
    let berhasil = 0
    try {
      for (const s of target) { await api.regenerasi(s.cardId!); berhasil++ }
    } finally {
      await muatSiswa()
    }
    return berhasil === 1 ? `Token baru ${target[0]!.name} diterbitkan.` : `Token baru diterbitkan untuk ${berhasil} siswa.`
  }, 'Token gagal diganti.')
}

const hapusKartu = (daftar: SiswaKartu[]) => {
  const target = daftar.filter(s => s.cardId)
  if (!target.length) return
  const siapa = target.length === 1 ? `kartu ${target[0]!.name}` : `${target.length} kartu terpilih`
  if (!confirm(`Hapus ${siapa}? Kartu yang terhapus tidak bisa dikembalikan; siswa perlu kartu susulan.`)) return
  return jalankan(async () => {
    await api.hapusKartu(target.map(s => s.cardId!))
    dipilih.value = []
    await muatSiswa()
    return `${target.length} kartu dihapus.`
  }, 'Kartu gagal dihapus.')
}

const ubahEligible = (s: SiswaKartu) => jalankan(async () => {
  await api.setEligible(s.studentId, !s.eligible)
  await muatSiswa()
  return s.eligible
    ? `${s.name} ditandai belum memenuhi administrasi. Akses masuk ujiannya tertutup.`
    : `${s.name} kini eligible.${rilisAktif.value && !s.token ? ' Tekan Terbitkan Susulan untuk membuat kartunya.' : ''}`
}, 'Status administrasi gagal diubah.')

const salin = async (s: SiswaKartu) => {
  try { await navigator.clipboard.writeText(s.token!); emit('toast', `Token ${s.name} disalin.`) } catch { emit('toast', `Token ${s.name}: ${s.token}`) }
}

const cetak = (daftar: SiswaKartu[], judul: string) => {
  const kartu = daftar.filter(bisaCetak).map(s => ({ name: s.name, nis: s.nis, classroom: s.classroom, room: s.room, token: s.token! }))
  const galat = cetakKartu({ kartu, grade: props.grade, jenis: aktif.value!.periode.split(' ').slice(0, 2).join(' '), judul })
  if (galat) emit('toast', galat)
}
const cetakKelas = (nama: string) => cetak(siswa.value.filter(s => s.classroom === nama), nama)
</script>

<template>
  <section class="mt-4 space-y-4">
    <!-- Daftar periode kartu -->
    <div class="rounded-2xl border border-[#E7EBF2] bg-white p-4 sm:p-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-sm font-extrabold text-[#101828]">Periode Kartu Ujian</h2>
          <p class="text-[11px] text-[#667085]">Kartu dirilis per periode dan dapat terbit sebelum ujian dibuat.</p>
        </div>
        <button v-if="bolehKelola && !formBaru && opsiBaru.length" type="button" class="min-h-11 rounded-xl bg-[#101828] px-4 text-xs font-bold text-white" @click="bukaFormBaru">Buat Periode</button>
      </div>

      <div v-if="formBaru" class="mt-4 grid gap-3 rounded-xl border border-[#E7EBF2] bg-[#FAFBFC] p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div>
          <label class="mb-1 block text-xs font-bold text-[#344054]" for="kartu-periode-baru">Periode ujian</label>
          <select id="kartu-periode-baru" v-model="formBaru.periode" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm">
            <option v-for="p in opsiBaru" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-[#344054]" for="kartu-baru-mulai">Ujian mulai</label>
          <input id="kartu-baru-mulai" v-model="formBaru.startsOn" type="date" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm">
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-[#344054]" for="kartu-baru-selesai">Ujian selesai</label>
          <input id="kartu-baru-selesai" v-model="formBaru.endsOn" type="date" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm">
        </div>
        <div class="flex gap-2">
          <button type="button" class="min-h-11 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white disabled:opacity-50" :disabled="busy || !formBaru.periode || !formBaru.startsOn || !formBaru.endsOn" @click="buatPeriode">Simpan</button>
          <button type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] px-4 text-xs font-bold text-[#344054]" @click="formBaru = null">Batal</button>
        </div>
      </div>

      <p v-if="loadingPeriode" class="mt-4 text-xs text-[#667085]" role="status">Memuat periode…</p>
      <div v-else-if="errorPeriode" class="mt-4 rounded-xl border border-[#F5C6C0] bg-[#FDECEA] px-4 py-3 text-xs text-[#8C1D13]" role="alert">{{ errorPeriode }}</div>
      <p v-else-if="!daftarPeriode.length" class="mt-4 rounded-xl border border-dashed border-[#D0D5DD] px-4 py-6 text-center text-xs text-[#667085]">Belum ada periode kartu untuk jenjang ini.{{ bolehKelola ? ' Tekan Buat Periode untuk memulai.' : '' }}</p>
      <div v-else class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <button
          v-for="p in daftarPeriode"
          :key="p.id"
          type="button"
          class="rounded-xl border px-3.5 py-3 text-left transition"
          :class="p.id === pilihId ? 'border-[#1B5FD9] bg-[#EEF4FF]' : 'border-[#E7EBF2] hover:border-[#C9D5E8]'"
          :aria-pressed="p.id === pilihId"
          @click="pilihId = p.id"
        >
          <span class="flex items-center justify-between gap-2">
            <b class="text-sm text-[#101828]">{{ p.periode }}</b>
            <span class="rounded-md px-1.5 py-0.5 text-[10px] font-bold" :class="p.releasedAt ? 'bg-[#E7F6ED] text-[#087C52]' : 'bg-[#F2F4F7] text-[#475467]'">{{ p.releasedAt ? 'Dirilis' : 'Draf' }}</span>
          </span>
          <span class="mt-1 block text-[11px] text-[#667085]">{{ tanggal(p.startsOn) }} – {{ tanggal(p.endsOn) }}</span>
        </button>
      </div>
    </div>

    <template v-if="aktif">
      <!-- Detail periode terpilih -->
      <div class="rounded-2xl border border-[#E7EBF2] bg-white p-4 sm:p-5">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 class="text-base font-extrabold text-[#101828]">{{ aktif.periode }}</h3>
            <p class="mt-1 max-w-2xl text-[11px] leading-relaxed text-[#667085]">
              <template v-if="rilisAktif">Dirilis {{ tanggal(aktif.releasedAt!) }}. Token terkunci sampai {{ tanggal(aktif.endsOn) }} dan otomatis dipakai oleh ujian pada rentang tanggal ini. Kartu hilang atau rusak cukup dicetak ulang.</template>
              <template v-else>Draf. Token belum dibuat. Rilis kartu kapan pun, tidak perlu menunggu ujian dibuat.</template>
              Siswa yang belum memenuhi administrasi tidak mendapat kartu.
            </p>
          </div>
          <div v-if="bolehKelola" class="flex flex-wrap items-end gap-2">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="mb-1 block text-[11px] font-bold text-[#344054]" for="kartu-mulai">Ujian mulai</label>
                <input id="kartu-mulai" v-model="tanggalForm.startsOn" type="date" :disabled="rilisAktif" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] px-3 text-sm disabled:bg-[#F2F4F7]">
              </div>
              <div>
                <label class="mb-1 block text-[11px] font-bold text-[#344054]" for="kartu-selesai">Ujian selesai</label>
                <input id="kartu-selesai" v-model="tanggalForm.endsOn" type="date" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] px-3 text-sm">
              </div>
            </div>
            <button type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] px-4 text-xs font-bold text-[#344054] disabled:opacity-50" :disabled="busy || (tanggalForm.startsOn === aktif.startsOn && tanggalForm.endsOn === aktif.endsOn)" @click="simpanTanggal">Simpan tanggal</button>
            <button type="button" class="min-h-11 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white disabled:opacity-50" :disabled="busy" @click="terbitkan">{{ busy ? 'Memproses…' : rilisAktif ? 'Terbitkan Susulan' : 'Rilis Kartu' }}</button>
            <button type="button" class="min-h-11 rounded-xl border border-[#F5C6C0] px-4 text-xs font-bold text-[#B42318] disabled:opacity-50" :disabled="busy" @click="hapusPeriode">Hapus Periode</button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-2.5">
          <div class="rounded-xl border border-[#E7EBF2] px-3.5 py-3"><b class="block text-lg font-extrabold text-[#0A2A5C]">{{ ringkas.kartu }}</b><span class="text-[11px] text-[#667085]">Kartu terbit</span></div>
          <div class="rounded-xl border border-[#E7EBF2] px-3.5 py-3"><b class="block text-lg font-extrabold text-[#0A2A5C]">{{ ringkas.belum }}</b><span class="text-[11px] text-[#667085]">Belum punya kartu</span></div>
          <div class="rounded-xl border border-[#E7EBF2] px-3.5 py-3"><b class="block text-lg font-extrabold text-[#0A2A5C]">{{ ringkas.belumBeres }}</b><span class="text-[11px] text-[#667085]">Administrasi belum beres</span></div>
        </div>
      </div>

      <p v-if="loading" class="text-xs text-[#667085]" role="status">Memuat kartu…</p>
      <div v-else-if="error" class="rounded-xl border border-[#F5C6C0] bg-[#FDECEA] px-4 py-3 text-xs text-[#8C1D13]" role="alert">{{ error }}</div>

      <!-- Rekap per kelas -->
      <div v-else-if="!kelas" class="rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7EBF2] p-4">
          <h3 class="text-sm font-extrabold text-[#101828]">Kartu per Kelas</h3>
          <button type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] px-4 text-xs font-bold text-[#344054] disabled:opacity-50" :disabled="!siswa.some(bisaCetak)" @click="cetak(siswa, aktif.periode)">Cetak Semua Kelas</button>
        </div>
        <ul class="divide-y divide-[#EFF2F7]">
          <li v-for="k in rekapKelas" :key="k.nama" class="flex flex-col gap-2 px-4 py-3 text-xs sm:flex-row sm:items-center sm:gap-4">
            <b class="text-sm text-[#101828] sm:w-40">{{ k.nama }}</b>
            <span class="text-[#344054] sm:flex-1">{{ k.kartu }} kartu terbit · {{ k.belum }} belum punya kartu<template v-if="k.belumBeres"> · <span class="text-[#B42318]">{{ k.belumBeres }} administrasi belum beres</span></template></span>
            <div class="flex gap-3">
              <button type="button" class="min-h-9 font-bold text-[#1B5FD9] hover:underline" @click="kelas = k.nama">Lihat kartu</button>
              <button type="button" class="min-h-9 font-bold text-[#344054] hover:underline disabled:opacity-50" :disabled="!k.kartu" @click="cetakKelas(k.nama)">Cetak kelas</button>
            </div>
          </li>
          <li v-if="!rekapKelas.length" class="p-6 text-center text-xs text-[#667085]">Belum ada siswa pada jenjang ini.</li>
        </ul>
      </div>

      <!-- Kartu dalam satu kelas -->
      <div v-else class="rounded-2xl border border-[#E7EBF2] bg-white">
        <div class="flex flex-col gap-2 border-b border-[#E7EBF2] p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="button" class="min-h-11 text-left text-xs font-bold text-[#475467] hover:text-[#1B5FD9]" @click="kelas = ''">← Semua kelas</button>
          <h3 class="text-sm font-extrabold text-[#101828] sm:mr-auto">Kelas {{ kelas }}</h3>
          <label v-if="bisaPilih.length" class="flex min-h-11 items-center gap-2 text-xs font-bold text-[#344054]">
            <input type="checkbox" class="h-4 w-4" :checked="semuaDipilih" @change="pilihSemua"> Pilih semua
          </label>
          <template v-if="terpilih.length">
            <button type="button" class="min-h-11 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white" @click="cetak(terpilih, `${kelas} (${terpilih.length} siswa)`)">Cetak Terpilih ({{ terpilih.length }})</button>
            <template v-if="bolehKelola">
              <button type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] px-4 text-xs font-bold text-[#344054] disabled:opacity-50" :disabled="busy" @click="regenerasi(terpilih)">Ganti Token ({{ terpilih.length }})</button>
              <button type="button" class="min-h-11 rounded-xl border border-[#F5C6C0] px-4 text-xs font-bold text-[#B42318] disabled:opacity-50" :disabled="busy" @click="hapusKartu(terpilih)">Hapus Kartu ({{ terpilih.length }})</button>
            </template>
          </template>
          <button v-else type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] px-4 text-xs font-bold text-[#344054] disabled:opacity-50" :disabled="!tampil.some(bisaCetak)" @click="cetakKelas(kelas)">Cetak Satu Kelas</button>
        </div>
        <ul class="divide-y divide-[#EFF2F7]">
          <li v-for="s in tampil" :key="s.studentId" class="flex flex-col gap-2 px-4 py-3 text-xs sm:flex-row sm:items-center sm:gap-4">
            <div class="flex min-w-0 items-center gap-3 sm:flex-1">
              <input v-if="s.cardId" v-model="dipilih" type="checkbox" :value="s.cardId" class="h-4 w-4 shrink-0" :aria-label="`Pilih ${s.name}`">
              <span v-else class="hidden h-4 w-4 shrink-0 sm:block" />
              <div class="min-w-0">
                <b class="block truncate text-sm text-[#101828]">{{ s.name }}</b>
                <span class="text-[#667085]">{{ s.nis || '-' }}{{ s.room ? ` · ${s.room}` : '' }}<template v-if="!s.active"> · <span class="font-bold text-[#B42318]">Siswa nonaktif</span></template></span>
              </div>
            </div>
            <div class="sm:w-40">
              <span class="inline-flex items-center gap-1.5 font-semibold" :class="s.eligible ? 'text-[#087C52]' : 'text-[#B42318]'">
                <span class="h-2 w-2 rounded-full" :class="s.eligible ? 'bg-[#12805C]' : 'bg-[#D92D20]'" />{{ s.eligible ? 'Eligible' : 'Belum beres' }}
              </span>
              <button v-if="bolehKelola && s.active" type="button" class="mt-0.5 block text-[11px] font-bold text-[#1B5FD9] hover:underline disabled:opacity-50" :disabled="busy" @click="ubahEligible(s)">{{ s.eligible ? 'Tandai belum beres' : 'Jadikan eligible' }}</button>
            </div>
            <div class="sm:w-28">
              <span v-if="s.token" class="rounded-lg bg-[#EEF3FC] px-2 py-1 font-mono font-bold text-[#0A2A5C]">{{ s.token }}</span>
              <span v-else class="text-[#98A2B3]">{{ rilisAktif ? 'Belum ada kartu' : 'Belum dirilis' }}</span>
            </div>
            <div class="flex items-center gap-3 sm:w-52 sm:justify-end">
              <template v-if="s.token">
                <button type="button" class="min-h-9 font-bold text-[#344054] hover:underline" @click="salin(s)">Salin</button>
                <button type="button" class="min-h-9 font-bold text-[#1B5FD9] hover:underline disabled:opacity-50" :disabled="!bisaCetak(s)" @click="cetak([s], s.name)">Cetak</button>
                <button v-if="bolehKelola" type="button" class="min-h-9 font-bold text-[#B42318] hover:underline disabled:opacity-50" :disabled="busy" @click="regenerasi([s])">Ganti token</button>
              </template>
            </div>
          </li>
          <li v-if="!tampil.length" class="p-6 text-center text-xs text-[#667085]">Tidak ada siswa di kelas ini.</li>
        </ul>
      </div>
    </template>
  </section>
</template>
