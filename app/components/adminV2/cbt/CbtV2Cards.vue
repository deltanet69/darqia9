<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { GradeType } from './cbtV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import { useKartuUjian, type PeriodeKartu, type SiswaKartu } from '~/composables/useKartuUjian'
import { periodeOpsi } from '~/composables/ruangUjianCore'
import { cetakKartu } from '~/utils/cbtKartuCetak'

const props = withDefaults(defineProps<{ grade: GradeType, source?: 'cbt' | 'ujian_harian' }>(), { source: 'cbt' })
const emit = defineEmits<{ (e: 'toast', msg: string): void }>()

const api = useKartuUjian()
const cbtData = useAdminCbtData(props.source)
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
const ubahTanggal = ref(false)
const formBaru = ref<{ periode: string, startsOn: string, endsOn: string } | null>(null)

const aktif = computed(() => daftarPeriode.value.find(p => p.id === pilihId.value) ?? null)
const rilisAktif = computed(() => !!aktif.value?.releasedAt)
// Periode yang belum dibuat untuk jenjang ini (tahun ajaran aktif) = pilihan saat membuat periode baru.
const opsiBaru = computed(() => periodeOpsi(tahun.value, []).filter(p => !daftarPeriode.value.some(d => d.periode === p)))
const tanggal = (v: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(v))
const urutKelas = (a: string, b: string) => a.localeCompare(b, 'id', { numeric: true })

// Rekap per kelas: kelas tercatat di kartu saat terbit, jadi kartu tetap di kelas asalnya.
const rekapKelas = computed(() => {
  const map = new Map<string, { nama: string, siswa: number, kartu: number, belumBeres: number }>()
  for (const s of siswa.value) {
    const r = map.get(s.classroom) ?? { nama: s.classroom, siswa: 0, kartu: 0, belumBeres: 0 }
    r.siswa++
    if (s.token) r.kartu++
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

// Status kartu per siswa, satu label yang jelas.
type StatusKartu = 'terbit' | 'nonaktif' | 'tertahan' | 'menunggu' | 'susulan'
const statusKartu = (s: SiswaKartu): StatusKartu =>
  !s.active ? 'nonaktif' : !s.eligible ? 'tertahan' : s.token ? 'terbit' : rilisAktif.value ? 'susulan' : 'menunggu'
const STATUS: Record<StatusKartu, { label: string, kelas: string }> = {
  terbit: { label: 'Kartu terbit', kelas: 'bg-[#E7F6ED] text-[#087C52]' },
  susulan: { label: 'Perlu kartu susulan', kelas: 'bg-[#FEF0C7] text-[#93370D]' },
  tertahan: { label: 'Tertahan administrasi', kelas: 'bg-[#FDECEA] text-[#B42318]' },
  menunggu: { label: 'Menunggu rilis', kelas: 'bg-[#F2F4F7] text-[#475467]' },
  nonaktif: { label: 'Siswa nonaktif', kelas: 'bg-[#F2F4F7] text-[#475467]' }
}

// Filter: kelas, status, dan pencarian nama/NIS.
const filterStatus = ref<'' | StatusKartu>('')
const cari = ref('')
const tampil = computed(() => {
  const q = cari.value.trim().toLowerCase()
  return siswa.value.filter(s => (!kelas.value || s.classroom === kelas.value)
    && (!filterStatus.value || statusKartu(s) === filterStatus.value)
    && (!q || s.name.toLowerCase().includes(q) || s.nis.includes(q)))
})
// Daftar dikelompokkan per kelas agar listing tiap kelas terpisah jelas.
const grup = computed(() => {
  const map = new Map<string, SiswaKartu[]>()
  for (const s of tampil.value) map.set(s.classroom, [...(map.get(s.classroom) ?? []), s])
  return [...map.entries()].sort((a, b) => urutKelas(a[0], b[0])).map(([nama, isi]) => ({ nama, isi }))
})
const bisaCetak = (s: SiswaKartu) => s.eligible && s.active && !!s.token
// Pilihan untuk aksi massal (bisa lintas kelas); hanya siswa yang sudah punya kartu yang bisa dipilih.
const dipilih = ref<string[]>([])
const terpilih = computed(() => siswa.value.filter(s => s.cardId && dipilih.value.includes(s.cardId)))
const idKartu = (isi: SiswaKartu[]) => isi.filter(s => s.cardId).map(s => s.cardId!)
const grupDipilih = (isi: SiswaKartu[]) => { const ids = idKartu(isi); return ids.length > 0 && ids.every(id => dipilih.value.includes(id)) }
const pilihGrup = (isi: SiswaKartu[]) => {
  const ids = idKartu(isi)
  dipilih.value = grupDipilih(isi) ? dipilih.value.filter(id => !ids.includes(id)) : [...new Set([...dipilih.value, ...ids])]
}

// Listing per kelas: section bisa dibuka-tutup dan dipecah per halaman agar tidak memanjang.
const PER_HALAMAN = 10
const terbuka = ref<Record<string, boolean>>({})
const halaman = ref<Record<string, number>>({})
// Section terbuka otomatis saat hanya satu kelas tampil, atau saat sedang mencari/memfilter.
const sedangTerbuka = (nama: string) => !!kelas.value || grup.value.length === 1 || !!cari.value || !!filterStatus.value || !!terbuka.value[nama]
const togelKelas = (nama: string) => { terbuka.value = { ...terbuka.value, [nama]: !sedangTerbuka(nama) } }
const jumlahHalaman = (total: number) => Math.max(1, Math.ceil(total / PER_HALAMAN))
const halamanAktif = (g: { nama: string, isi: SiswaKartu[] }) => Math.min(halaman.value[g.nama] ?? 1, jumlahHalaman(g.isi.length))
const potongHalaman = (g: { nama: string, isi: SiswaKartu[] }) => g.isi.slice((halamanAktif(g) - 1) * PER_HALAMAN, halamanAktif(g) * PER_HALAMAN)
const aturHalaman = (g: { nama: string, isi: SiswaKartu[] }, h: number) => { halaman.value = { ...halaman.value, [g.nama]: Math.min(Math.max(1, h), jumlahHalaman(g.isi.length)) } }
// Status yang butuh tindakan per kelas, tampil di header section walau section tertutup.
const PERLU_TINDAKAN: StatusKartu[] = ['tertahan', 'susulan', 'menunggu']
const ringkasKelas = (isi: SiswaKartu[]) => PERLU_TINDAKAN
  .map(st => ({ st, n: isi.filter(s => statusKartu(s) === st).length }))
  .filter(x => x.n > 0)
// Filter berubah = kembali ke halaman pertama di semua kelas.
watch([kelas, cari, filterStatus], () => { halaman.value = {} })

const pesanGalat = (e: unknown, cadangan: string) => {
  const m = (e as { message?: string } | null)?.message || ''
  // Hanya error "objek belum ada" yang berarti migrasi belum diterapkan; error lain (RLS, constraint) ditampilkan apa adanya.
  if (/does not exist|could not find|schema cache/i.test(m) && /exam_card|card_token|source|classroom/.test(m)) {
    return 'Fitur Kartu Ujian belum aktif di server. Terapkan migrasi 0055, 0056, dan 0057 di Supabase, lalu muat ulang.'
  }
  return m && m !== cadangan ? `${cadangan} ${m}` : cadangan
}

const muatPeriode = async () => {
  loadingPeriode.value = true
  errorPeriode.value = ''
  try {
    daftarPeriode.value = (await api.muatPeriode(props.grade, props.source)).sort((a, b) => b.startsOn.localeCompare(a.startsOn))
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
  ubahTanggal.value = false
  kelas.value = ''
  filterStatus.value = ''
  cari.value = ''
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
  await api.simpanPeriode({ grade: props.grade, source: props.source, ...f })
  formBaru.value = null
  await muatPeriode()
  pilihId.value = daftarPeriode.value.find(p => p.periode === f.periode)?.id ?? pilihId.value
  return `Periode ${f.periode} dibuat.`
}, 'Periode gagal dibuat.')

const simpanTanggal = () => jalankan(async () => {
  await api.simpanPeriode({ id: aktif.value!.id, grade: props.grade, source: props.source, periode: aktif.value!.periode, ...tanggalForm.value })
  await muatPeriode()
  ubahTanggal.value = false
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
</script>

<template>
  <section class="mt-4 space-y-3">
    <!-- Periode: satu panel ringkas (pilih periode, status, tanggal, angka, aksi) -->
    <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3 sm:p-4">
      <div class="flex flex-wrap items-center gap-2">
        <span class="mr-1 text-xs font-extrabold text-[#101828]">Periode</span>
        <p v-if="loadingPeriode" class="text-xs text-[#667085]" role="status">Memuat periode…</p>
        <template v-else>
          <button
            v-for="p in daftarPeriode"
            :key="p.id"
            type="button"
            class="inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold"
            :class="p.id === pilihId ? 'border-[#1B5FD9] bg-[#EEF4FF] text-[#0A2A5C]' : 'border-[#E7EBF2] text-[#344054] hover:border-[#C9D5E8]'"
            :aria-pressed="p.id === pilihId"
            @click="pilihId = p.id"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="p.releasedAt ? 'bg-[#12805C]' : 'bg-[#98A2B3]'" />{{ p.periode }}
          </button>
          <span v-if="!daftarPeriode.length && !errorPeriode" class="text-xs text-[#667085]">Belum ada periode untuk jenjang ini.</span>
        </template>
        <button v-if="bolehKelola && !formBaru && opsiBaru.length" type="button" class="ml-auto min-h-9 rounded-lg bg-[#101828] px-3 text-xs font-bold text-white" @click="bukaFormBaru">Buat Periode</button>
      </div>

      <div v-if="formBaru" class="mt-3 flex flex-wrap items-end gap-2 border-t border-[#EFF2F7] pt-3">
        <div class="min-w-44 flex-1 sm:flex-none">
          <label class="mb-1 block text-[11px] font-bold text-[#344054]" for="kartu-periode-baru">Periode ujian</label>
          <select id="kartu-periode-baru" v-model="formBaru.periode" class="min-h-9 w-full rounded-lg border border-[#E7EBF2] bg-white px-2.5 text-sm">
            <option v-for="p in opsiBaru" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-[11px] font-bold text-[#344054]" for="kartu-baru-mulai">Ujian mulai</label>
          <input id="kartu-baru-mulai" v-model="formBaru.startsOn" type="date" class="min-h-9 rounded-lg border border-[#E7EBF2] px-2.5 text-sm">
        </div>
        <div>
          <label class="mb-1 block text-[11px] font-bold text-[#344054]" for="kartu-baru-selesai">Ujian selesai</label>
          <input id="kartu-baru-selesai" v-model="formBaru.endsOn" type="date" class="min-h-9 rounded-lg border border-[#E7EBF2] px-2.5 text-sm">
        </div>
        <button type="button" class="min-h-9 rounded-lg bg-[#1B5FD9] px-3 text-xs font-bold text-white disabled:opacity-50" :disabled="busy || !formBaru.periode || !formBaru.startsOn || !formBaru.endsOn" @click="buatPeriode">Simpan</button>
        <button type="button" class="min-h-9 px-2 text-xs font-bold text-[#475467] hover:underline" @click="formBaru = null">Batal</button>
      </div>

      <div v-if="errorPeriode" class="mt-3 rounded-lg border border-[#F5C6C0] bg-[#FDECEA] px-3 py-2 text-xs text-[#8C1D13]" role="alert">{{ errorPeriode }}</div>

      <div v-if="aktif" class="mt-3 flex flex-col gap-2 border-t border-[#EFF2F7] pt-3 lg:flex-row lg:items-center">
        <div class="min-w-0 flex-1 text-xs text-[#475467]">
          <p>
            <span class="mr-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold" :class="rilisAktif ? 'bg-[#E7F6ED] text-[#087C52]' : 'bg-[#F2F4F7] text-[#475467]'">{{ rilisAktif ? 'Dirilis' : 'Draf' }}</span>
            Ujian {{ tanggal(aktif.startsOn) }} – {{ tanggal(aktif.endsOn) }}<template v-if="rilisAktif"> · token terkunci sampai ujian selesai</template>
          </p>
          <p class="mt-1">
            <b class="text-[#0A2A5C]">{{ ringkas.kartu }}</b> kartu terbit ·
            <b class="text-[#0A2A5C]">{{ ringkas.belum }}</b> belum punya kartu ·
            <b :class="ringkas.belumBeres ? 'text-[#B42318]' : 'text-[#0A2A5C]'">{{ ringkas.belumBeres }}</b> administrasi belum beres
          </p>
        </div>
        <div v-if="bolehKelola" class="flex flex-wrap items-end gap-2">
          <template v-if="ubahTanggal">
            <div>
              <label class="mb-1 block text-[11px] font-bold text-[#344054]" for="kartu-mulai">Ujian mulai</label>
              <input id="kartu-mulai" v-model="tanggalForm.startsOn" type="date" :disabled="rilisAktif" class="min-h-9 rounded-lg border border-[#E7EBF2] px-2.5 text-sm disabled:bg-[#F2F4F7]">
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-bold text-[#344054]" for="kartu-selesai">Ujian selesai</label>
              <input id="kartu-selesai" v-model="tanggalForm.endsOn" type="date" class="min-h-9 rounded-lg border border-[#E7EBF2] px-2.5 text-sm">
            </div>
            <button type="button" class="min-h-9 rounded-lg bg-[#101828] px-3 text-xs font-bold text-white disabled:opacity-50" :disabled="busy" @click="simpanTanggal">Simpan</button>
            <button type="button" class="min-h-9 px-2 text-xs font-bold text-[#475467] hover:underline" @click="ubahTanggal = false">Batal</button>
          </template>
          <template v-else>
            <button type="button" class="min-h-9 rounded-lg border border-[#E7EBF2] px-3 text-xs font-bold text-[#344054]" @click="ubahTanggal = true">Ubah tanggal</button>
            <button type="button" class="min-h-9 rounded-lg bg-[#1B5FD9] px-3 text-xs font-bold text-white disabled:opacity-50" :disabled="busy" @click="terbitkan">{{ busy ? 'Memproses…' : rilisAktif ? 'Terbitkan Susulan' : 'Rilis Kartu' }}</button>
            <button type="button" class="min-h-9 rounded-lg px-2 text-xs font-bold text-[#B42318] hover:underline disabled:opacity-50" :disabled="busy" @click="hapusPeriode">Hapus periode</button>
          </template>
        </div>
      </div>
    </div>

    <!-- Daftar kartu: filter kelas (satu baris geser), cari, status, lalu listing per kelas -->
    <div v-if="aktif" class="overflow-hidden rounded-2xl border border-[#E7EBF2] bg-white">
      <div class="space-y-2 border-b border-[#E7EBF2] p-3 sm:p-4">
        <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" role="group" aria-label="Filter kelas">
          <button
            type="button"
            class="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold"
            :class="!kelas ? 'border-[#1B5FD9] bg-[#EEF4FF] text-[#0A2A5C]' : 'border-[#E7EBF2] text-[#344054] hover:border-[#C9D5E8]'"
            :aria-pressed="!kelas"
            @click="kelas = ''"
          >
            Semua <span class="font-semibold text-[#667085] tabular-nums">{{ ringkas.kartu }}/{{ siswa.length }}</span>
          </button>
          <button
            v-for="k in rekapKelas"
            :key="k.nama"
            type="button"
            class="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold"
            :class="kelas === k.nama ? 'border-[#1B5FD9] bg-[#EEF4FF] text-[#0A2A5C]' : 'border-[#E7EBF2] text-[#344054] hover:border-[#C9D5E8]'"
            :aria-pressed="kelas === k.nama"
            :title="k.belumBeres ? `${k.belumBeres} administrasi belum beres` : undefined"
            @click="kelas = k.nama"
          >
            {{ k.nama }}
            <span class="font-semibold tabular-nums" :class="k.kartu < k.siswa ? 'text-[#B54708]' : 'text-[#667085]'">{{ k.kartu }}/{{ k.siswa }}</span>
            <span v-if="k.belumBeres" class="h-1.5 w-1.5 rounded-full bg-[#D92D20]" aria-hidden="true" />
          </button>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label class="sr-only" for="kartu-cari">Cari siswa</label>
          <input id="kartu-cari" v-model="cari" type="search" placeholder="Cari nama atau NIS" class="min-h-9 rounded-lg border border-[#E7EBF2] px-3 text-sm sm:w-56">
          <label class="sr-only" for="kartu-status">Status kartu</label>
          <select id="kartu-status" v-model="filterStatus" class="min-h-9 rounded-lg border border-[#E7EBF2] bg-white px-2.5 text-sm sm:w-52">
            <option value="">Semua status</option>
            <option v-for="(v, key) in STATUS" :key="key" :value="key">{{ v.label }}</option>
          </select>
          <div class="flex flex-wrap items-center gap-2 sm:ml-auto">
            <template v-if="terpilih.length">
              <b class="text-xs text-[#0A2A5C]">{{ terpilih.length }} dipilih</b>
              <button type="button" class="min-h-9 rounded-lg bg-[#1B5FD9] px-3 text-xs font-bold text-white" @click="cetak(terpilih, `${terpilih.length} siswa`)">Cetak</button>
              <template v-if="bolehKelola">
                <button type="button" class="min-h-9 rounded-lg border border-[#E7EBF2] px-3 text-xs font-bold text-[#344054] disabled:opacity-50" :disabled="busy" @click="regenerasi(terpilih)">Ganti Token</button>
                <button type="button" class="min-h-9 rounded-lg border border-[#F5C6C0] px-3 text-xs font-bold text-[#B42318] disabled:opacity-50" :disabled="busy" @click="hapusKartu(terpilih)">Hapus Kartu</button>
              </template>
              <button type="button" class="min-h-9 px-1 text-xs font-bold text-[#475467] hover:underline" @click="dipilih = []">Batal</button>
            </template>
            <button v-else type="button" class="min-h-9 rounded-lg border border-[#E7EBF2] px-3 text-xs font-bold text-[#344054] disabled:opacity-50" :disabled="!tampil.some(bisaCetak)" @click="cetak(tampil, kelas || aktif.periode)">{{ kelas ? `Cetak kelas ${kelas}` : 'Cetak semua' }}</button>
          </div>
        </div>
      </div>

      <p v-if="loading" class="p-4 text-xs text-[#667085]" role="status">Memuat kartu…</p>
      <div v-else-if="error" class="m-4 rounded-lg border border-[#F5C6C0] bg-[#FDECEA] px-3 py-2 text-xs text-[#8C1D13]" role="alert">{{ error }}</div>
      <p v-else-if="!grup.length" class="p-6 text-center text-xs text-[#667085]">Tidak ada siswa yang cocok dengan filter.</p>
      <template v-else>
        <div class="hidden grid-cols-[1.25rem_2rem_minmax(0,1fr)_7rem_9rem_10rem_6.5rem_11rem] gap-3 border-b border-[#EFF2F7] bg-[#FAFBFC] px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#667085] lg:grid">
          <span /><span>No</span><span>Siswa</span><span>Ruang</span><span>Administrasi</span><span>Status kartu</span><span>Token</span><span class="text-right">Aksi</span>
        </div>
        <section v-for="g in grup" :key="g.nama" :aria-label="`Kelas ${g.nama}`" class="border-b border-[#EFF2F7] last:border-b-0">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 bg-[#F5F7FA] px-4 py-2">
            <input v-if="idKartu(g.isi).length" type="checkbox" class="h-4 w-4" :checked="grupDipilih(g.isi)" :aria-label="`Pilih semua kartu kelas ${g.nama}`" @change="pilihGrup(g.isi)">
            <span v-else class="w-4" />
            <h4 class="text-xs font-extrabold text-[#101828]">Kelas {{ g.nama }}</h4>
            <span class="text-[11px] text-[#667085] tabular-nums">{{ g.isi.filter(s => s.token).length }}/{{ g.isi.length }} kartu</span>
            <span
              v-for="x in ringkasKelas(g.isi)"
              :key="x.st"
              class="rounded-md px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums"
              :class="STATUS[x.st].kelas"
            >{{ x.n }} {{ STATUS[x.st].label.toLowerCase() }}</span>
            <div class="ml-auto flex items-center gap-3">
              <button v-if="!kelas" type="button" class="min-h-8 text-[11px] font-bold text-[#1B5FD9] hover:underline disabled:opacity-50" :disabled="!g.isi.some(bisaCetak)" @click="cetak(g.isi, g.nama)">Cetak kelas</button>
              <button
                v-if="!kelas && !cari && !filterStatus && grup.length > 1"
                type="button"
                class="min-h-8 rounded-md border border-[#E7EBF2] bg-white px-2.5 text-[11px] font-bold text-[#344054]"
                :aria-expanded="sedangTerbuka(g.nama)"
                @click="togelKelas(g.nama)"
              >{{ sedangTerbuka(g.nama) ? 'Tutup' : 'Buka' }}</button>
            </div>
          </div>
          <template v-if="sedangTerbuka(g.nama)">
          <ul class="divide-y divide-[#EFF2F7]">
            <li v-for="(s, i) in potongHalaman(g)" :key="s.studentId" class="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-2.5 text-xs lg:grid-cols-[1.25rem_2rem_minmax(0,1fr)_7rem_9rem_10rem_6.5rem_11rem] lg:items-center">
              <span class="row-span-6 pt-0.5 lg:row-span-1 lg:pt-0">
                <input v-if="s.cardId" v-model="dipilih" type="checkbox" :value="s.cardId" class="h-4 w-4" :aria-label="`Pilih ${s.name}`">
              </span>
              <span class="hidden text-[#667085] tabular-nums lg:block">{{ (halamanAktif(g) - 1) * PER_HALAMAN + i + 1 }}</span>
              <div class="min-w-0">
                <b class="block truncate text-[13px] text-[#101828]">{{ s.name }}</b>
                <span class="text-[#667085] tabular-nums">NIS {{ s.nis || '-' }}</span>
              </div>
              <span class="text-[#344054]"><span class="text-[#667085] lg:hidden">Ruang: </span>{{ s.room || 'Belum ditempatkan' }}</span>
              <div class="flex flex-wrap items-center gap-x-2 lg:block">
                <span class="inline-flex items-center gap-1.5 font-semibold" :class="s.eligible ? 'text-[#087C52]' : 'text-[#B42318]'">
                  <span class="h-2 w-2 rounded-full" :class="s.eligible ? 'bg-[#12805C]' : 'bg-[#D92D20]'" />{{ s.eligible ? 'Eligible' : 'Belum beres' }}
                </span>
                <button v-if="bolehKelola && s.active" type="button" class="text-[11px] font-bold text-[#1B5FD9] hover:underline disabled:opacity-50 lg:block" :disabled="busy" @click="ubahEligible(s)">{{ s.eligible ? 'Tandai belum beres' : 'Jadikan eligible' }}</button>
              </div>
              <span><span class="inline-block rounded-md px-2 py-0.5 text-[11px] font-bold" :class="STATUS[statusKartu(s)].kelas">{{ STATUS[statusKartu(s)].label }}</span></span>
              <span>
                <span v-if="s.token" class="rounded-md bg-[#EEF3FC] px-2 py-0.5 font-mono font-bold text-[#0A2A5C]">{{ s.token }}</span>
                <span v-else class="text-[#98A2B3]">—</span>
              </span>
              <div class="flex items-center gap-3 lg:justify-end">
                <template v-if="s.token">
                  <button type="button" class="min-h-8 font-bold text-[#344054] hover:underline" @click="salin(s)">Salin</button>
                  <button type="button" class="min-h-8 font-bold text-[#1B5FD9] hover:underline disabled:opacity-50" :disabled="!bisaCetak(s)" @click="cetak([s], s.name)">Cetak</button>
                  <button v-if="bolehKelola" type="button" class="min-h-8 font-bold text-[#B42318] hover:underline disabled:opacity-50" :disabled="busy" @click="regenerasi([s])">Ganti token</button>
                </template>
              </div>
            </li>
          </ul>
          <nav v-if="jumlahHalaman(g.isi.length) > 1" class="flex flex-wrap items-center justify-between gap-2 border-t border-[#EFF2F7] px-4 py-2.5 text-xs" :aria-label="`Halaman kartu kelas ${g.nama}`">
            <span class="text-[#667085] tabular-nums">{{ (halamanAktif(g) - 1) * PER_HALAMAN + 1 }}–{{ Math.min(halamanAktif(g) * PER_HALAMAN, g.isi.length) }} dari {{ g.isi.length }} siswa</span>
            <div class="flex items-center gap-2">
              <button type="button" class="min-h-8 rounded-md border border-[#E7EBF2] px-2.5 font-bold text-[#344054] disabled:opacity-40" :disabled="halamanAktif(g) <= 1" @click="aturHalaman(g, halamanAktif(g) - 1)">Sebelumnya</button>
              <span class="font-semibold text-[#344054] tabular-nums">{{ halamanAktif(g) }} / {{ jumlahHalaman(g.isi.length) }}</span>
              <button type="button" class="min-h-8 rounded-md border border-[#E7EBF2] px-2.5 font-bold text-[#344054] disabled:opacity-40" :disabled="halamanAktif(g) >= jumlahHalaman(g.isi.length)" @click="aturHalaman(g, halamanAktif(g) + 1)">Berikutnya</button>
            </div>
          </nav>
          </template>
        </section>
      </template>
    </div>
  </section>
</template>
