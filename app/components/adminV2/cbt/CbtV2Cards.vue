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
const periode = ref('')
const siswa = ref<SiswaKartu[]>([])
const loading = ref(false)
const busy = ref(false)
const error = ref('')
const kelas = ref('')
const form = ref({ startsOn: '', endsOn: '' })

const opsi = computed(() => periodeOpsi(tahun.value, daftarPeriode.value.map(p => p.periode)))
const aktif = computed(() => daftarPeriode.value.find(p => p.periode === periode.value) ?? null)
const rilisAktif = computed(() => !!aktif.value?.releasedAt)
const kelasList = computed(() => [...new Set(siswa.value.map(s => s.classroom))].sort((a, b) => a.localeCompare(b, 'id', { numeric: true })))
const tampil = computed(() => kelas.value ? siswa.value.filter(s => s.classroom === kelas.value) : siswa.value)
// Pilihan baris untuk cetak dan ganti token massal; hanya siswa yang sudah punya kartu yang bisa dipilih.
const dipilih = ref<string[]>([])
const bisaPilih = computed(() => tampil.value.filter(s => s.token))
const terpilih = computed(() => bisaPilih.value.filter(s => dipilih.value.includes(s.studentId)))
const semuaDipilih = computed(() => bisaPilih.value.length > 0 && terpilih.value.length === bisaPilih.value.length)
const pilihSemua = () => { dipilih.value = semuaDipilih.value ? [] : bisaPilih.value.map(s => s.studentId) }
watch(kelas, () => { dipilih.value = [] })
const bisaCetak = (s: SiswaKartu) => s.eligible && !!s.token
const ringkas = computed(() => ({
  total: siswa.value.length,
  kartu: siswa.value.filter(s => s.token).length,
  belumBeres: siswa.value.filter(s => !s.eligible).length
}))
const tanggal = (v: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(v))

const pesanGalat = (e: unknown, cadangan: string) => {
  const m = e instanceof Error ? e.message : cadangan
  return /exam_card|release_exam_cards|card_token_for|regenerate_card_token/.test(m)
    ? 'Fitur Kartu Ujian belum aktif di server. Terapkan migrasi 0055_kartu_ujian.sql di Supabase, lalu muat ulang.'
    : m
}

const muatPeriode = async () => {
  try { daftarPeriode.value = await api.muatPeriode(props.grade) } catch (e) { error.value = pesanGalat(e, 'Periode kartu gagal dimuat.') }
}
const muatSiswa = async () => {
  siswa.value = []
  kelas.value = ''
  dipilih.value = []
  if (!aktif.value) return
  loading.value = true
  error.value = ''
  try { siswa.value = await api.muatSiswa(aktif.value) } catch (e) { error.value = pesanGalat(e, 'Daftar kartu gagal dimuat.') } finally { loading.value = false }
}

onMounted(async () => {
  void cbtData.load()
  await muatOpsi()
  await muatPeriode()
  periode.value = daftarPeriode.value[0]?.periode ?? opsi.value[1] ?? opsi.value[0] ?? ''
})
watch(() => props.grade, async () => { await muatPeriode(); periode.value = daftarPeriode.value[0]?.periode ?? opsi.value[1] ?? '' })
watch(aktif, a => {
  form.value = { startsOn: a?.startsOn ?? '', endsOn: a?.endsOn ?? '' }
  void muatSiswa()
}, { immediate: true })

const jalankan = async (tugas: () => Promise<string>, gagal: string) => {
  if (busy.value) return
  busy.value = true
  try { emit('toast', await tugas()) } catch (e) { emit('toast', pesanGalat(e, gagal)) } finally { busy.value = false }
}

const simpanPeriode = () => jalankan(async () => {
  await api.simpanPeriode({ id: aktif.value?.id, grade: props.grade, periode: periode.value, ...form.value })
  await muatPeriode()
  return aktif.value ? 'Tanggal ujian disimpan.' : 'Periode kartu dibuat.'
}, 'Periode gagal disimpan.')

const hapusPeriode = () => {
  if (!aktif.value || !confirm(`Hapus periode ${aktif.value.periode} beserta kartunya?`)) return
  return jalankan(async () => {
    await api.hapusPeriode(aktif.value!.id)
    await muatPeriode()
    return 'Periode kartu dihapus.'
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

const ubahEligible = (s: SiswaKartu) => jalankan(async () => {
  await api.setEligible(s.studentId, !s.eligible)
  await muatSiswa()
  return s.eligible
    ? `${s.name} ditandai belum memenuhi administrasi. Akses masuk ujiannya tertutup.`
    : `${s.name} kini eligible.${rilisAktif.value ? ' Tekan Terbitkan Susulan untuk membuat kartunya.' : ''}`
}, 'Status administrasi gagal diubah.')

const salin = async (s: SiswaKartu) => {
  try { await navigator.clipboard.writeText(s.token!); emit('toast', `Token ${s.name} disalin.`) } catch { emit('toast', `Token ${s.name}: ${s.token}`) }
}

const cetak = (daftar: SiswaKartu[], judul: string) => {
  const kartu = daftar.filter(bisaCetak).map(s => ({ name: s.name, nis: s.nis, classroom: s.classroom, room: s.room, token: s.token! }))
  const galat = cetakKartu({ kartu, grade: props.grade, jenis: periode.value.split(' ').slice(0, 2).join(' '), judul })
  if (galat) emit('toast', galat)
}
</script>

<template>
  <section class="mt-4 space-y-4">
    <div class="rounded-2xl border border-[#E7EBF2] bg-white p-4 sm:p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div class="sm:w-72">
          <label class="mb-1 block text-xs font-bold text-[#344054]" for="periode-kartu">Periode ujian</label>
          <select id="periode-kartu" v-model="periode" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm">
            <option v-for="p in opsi" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:w-80">
          <div>
            <label class="mb-1 block text-xs font-bold text-[#344054]" for="kartu-mulai">Ujian mulai</label>
            <input id="kartu-mulai" v-model="form.startsOn" type="date" :disabled="!bolehKelola || rilisAktif" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] px-3 text-sm disabled:bg-[#F2F4F7]">
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold text-[#344054]" for="kartu-selesai">Ujian selesai</label>
            <input id="kartu-selesai" v-model="form.endsOn" type="date" :disabled="!bolehKelola" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] px-3 text-sm disabled:bg-[#F2F4F7]">
          </div>
        </div>
        <div v-if="bolehKelola" class="flex flex-wrap gap-2">
          <button type="button" class="min-h-11 rounded-xl bg-[#101828] px-4 text-xs font-bold text-white disabled:opacity-50" :disabled="busy || !form.startsOn || !form.endsOn" @click="simpanPeriode">{{ aktif ? 'Simpan tanggal' : 'Buat periode' }}</button>
          <button v-if="aktif" type="button" class="min-h-11 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white disabled:opacity-50" :disabled="busy" @click="terbitkan">{{ busy ? 'Memproses…' : rilisAktif ? 'Terbitkan Susulan' : 'Rilis Kartu' }}</button>
          <button v-if="aktif && !rilisAktif" type="button" class="min-h-11 rounded-xl border border-[#F5C6C0] px-4 text-xs font-bold text-[#B42318] disabled:opacity-50" :disabled="busy" @click="hapusPeriode">Hapus</button>
        </div>
      </div>
      <p class="mt-3 text-[11px] leading-relaxed text-[#667085]">
        <template v-if="!aktif">Periode ini belum dibuat. Isi tanggal pelaksanaan ujian lalu buat periode; kartu dapat dirilis sebelum ujian dibuat.</template>
        <template v-else-if="rilisAktif">Dirilis. Token terkunci dari rilis sampai {{ tanggal(aktif.endsOn) }} dan otomatis dipakai saat ujian pada rentang {{ tanggal(aktif.startsOn) }} sampai {{ tanggal(aktif.endsOn) }} dibuat. Kartu hilang atau rusak cukup dicetak ulang.</template>
        <template v-else>Draf. Kartu belum terbit dan token belum dibuat. Rilis kartu kapan pun, tidak perlu menunggu ujian dibuat.</template>
        Siswa yang belum memenuhi administrasi tidak mendapat kartu.
      </p>
    </div>

    <div v-if="aktif" class="grid grid-cols-3 gap-2.5">
      <div class="rounded-xl border border-[#E7EBF2] bg-white px-3.5 py-3"><b class="block text-lg font-extrabold text-[#0A2A5C]">{{ ringkas.total }}</b><span class="text-[11px] text-[#667085]">Siswa aktif</span></div>
      <div class="rounded-xl border border-[#E7EBF2] bg-white px-3.5 py-3"><b class="block text-lg font-extrabold text-[#0A2A5C]">{{ ringkas.kartu }}</b><span class="text-[11px] text-[#667085]">Kartu terbit</span></div>
      <div class="rounded-xl border border-[#E7EBF2] bg-white px-3.5 py-3"><b class="block text-lg font-extrabold text-[#0A2A5C]">{{ ringkas.belumBeres }}</b><span class="text-[11px] text-[#667085]">Administrasi belum beres</span></div>
    </div>

    <div v-if="aktif" class="rounded-2xl border border-[#E7EBF2] bg-white">
      <div class="flex flex-col gap-2 border-b border-[#E7EBF2] p-4 sm:flex-row sm:items-center">
        <label class="sr-only" for="kartu-kelas">Kelas</label>
        <select id="kartu-kelas" v-model="kelas" class="min-h-11 rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm sm:w-56">
          <option value="">Semua kelas</option>
          <option v-for="k in kelasList" :key="k" :value="k">{{ k }}</option>
        </select>
        <button type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] px-4 text-xs font-bold text-[#344054] disabled:opacity-50" :disabled="loading || !tampil.some(bisaCetak)" @click="cetak(tampil, kelas || periode)">{{ kelas ? `Cetak Satu Kelas (${kelas})` : 'Cetak Semua Kartu' }}</button>
        <label v-if="bisaPilih.length" class="flex min-h-11 items-center gap-2 text-xs font-bold text-[#344054]">
          <input type="checkbox" class="h-4 w-4" :checked="semuaDipilih" @change="pilihSemua"> Pilih semua
        </label>
        <template v-if="terpilih.length">
          <button type="button" class="min-h-11 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white" @click="cetak(terpilih, `${terpilih.length} siswa`)">Cetak Terpilih ({{ terpilih.length }})</button>
          <button v-if="bolehKelola" type="button" class="min-h-11 rounded-xl border border-[#F5C6C0] px-4 text-xs font-bold text-[#B42318] disabled:opacity-50" :disabled="busy" @click="regenerasi(terpilih)">Ganti Token Terpilih ({{ terpilih.length }})</button>
        </template>
      </div>

      <p v-if="loading" class="p-4 text-xs text-[#667085]" role="status">Memuat kartu…</p>
      <div v-else-if="error" class="m-4 rounded-xl border border-[#F5C6C0] bg-[#FDECEA] px-4 py-3 text-xs text-[#8C1D13]" role="alert">{{ error }}</div>
      <ul v-else class="divide-y divide-[#EFF2F7]">
        <li v-for="s in tampil" :key="s.studentId" class="flex flex-col gap-2 px-4 py-3 text-xs sm:flex-row sm:items-center sm:gap-4">
          <div class="flex min-w-0 items-center gap-3 sm:flex-1">
            <input v-if="s.token" v-model="dipilih" type="checkbox" :value="s.studentId" class="h-4 w-4 shrink-0" :aria-label="`Pilih ${s.name}`">
          <span v-else class="hidden h-4 w-4 shrink-0 sm:block" />
          <div class="min-w-0">
            <b class="block truncate text-sm text-[#101828]">{{ s.name }}</b>
            <span class="text-[#667085]">{{ s.nis || '-' }} · {{ s.classroom }}{{ s.room ? ` · ${s.room}` : '' }}</span>
          </div>
          </div>
          <div class="sm:w-40">
            <span class="inline-flex items-center gap-1.5 font-semibold" :class="s.eligible ? 'text-[#087C52]' : 'text-[#B42318]'">
              <span class="h-2 w-2 rounded-full" :class="s.eligible ? 'bg-[#12805C]' : 'bg-[#D92D20]'" />{{ s.eligible ? 'Eligible' : 'Belum beres' }}
            </span>
            <button v-if="bolehKelola" type="button" class="mt-0.5 block text-[11px] font-bold text-[#1B5FD9] hover:underline disabled:opacity-50" :disabled="busy" @click="ubahEligible(s)">{{ s.eligible ? 'Tandai belum beres' : 'Jadikan eligible' }}</button>
          </div>
          <div class="sm:w-28">
            <span v-if="s.token" class="rounded-lg bg-[#EEF3FC] px-2 py-1 font-mono font-bold text-[#0A2A5C]">{{ s.token }}</span>
            <span v-else class="text-[#98A2B3]">{{ rilisAktif ? 'Belum ada kartu' : 'Belum dirilis' }}</span>
          </div>
          <div class="flex items-center gap-3 sm:w-52 sm:justify-end">
            <template v-if="s.token">
              <button type="button" class="min-h-9 font-bold text-[#344054] hover:underline" @click="salin(s)">Salin</button>
              <button type="button" class="min-h-9 font-bold text-[#1B5FD9] hover:underline disabled:opacity-50" :disabled="!s.eligible" @click="cetak([s], s.name)">Cetak</button>
              <button v-if="bolehKelola" type="button" class="min-h-9 font-bold text-[#B42318] hover:underline disabled:opacity-50" :disabled="busy" @click="regenerasi([s])">Ganti token</button>
            </template>
          </div>
        </li>
        <li v-if="!tampil.length" class="p-6 text-center text-xs text-[#667085]">Belum ada siswa aktif.</li>
      </ul>
    </div>
  </section>
</template>
