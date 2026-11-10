<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import CbtV2RoomDetail from './CbtV2RoomDetail.vue'
import type { GradeType } from './cbtV2Data'
import { useAdminCbtData } from '~/composables/useAdminCbtData'
import { useRuangUjian, type RuangUjian, type SiswaBebas } from '~/composables/useRuangUjian'
import { periodeOpsi, validasiRuang } from '~/composables/ruangUjianCore'

const props = defineProps<{ grade: GradeType }>()
const emit = defineEmits<{ (e: 'toast', msg: string): void, (e: 'detail', nama: string | null): void }>()

const api = useRuangUjian()
const cbtData = useAdminCbtData('cbt')
const { tahun, muatOpsi } = useTahunAjaran()

const riwayat = ref<string[]>([])
const periode = ref('')
const ruang = ref<RuangUjian[]>([])
const loading = ref(false)
const error = ref('')
// Ruang yang dibuka disimpan di URL (?ruang=), jadi tombol kembali browser dan breadcrumb ikut bekerja.
const route = useRoute()
const router = useRouter()
const selectedId = computed(() => typeof route.query.ruang === 'string' ? route.query.ruang : null)
const bukaRuang = (id: string) => router.push({ query: { ...route.query, ruang: id } })
const tutupRuang = () => { const { ruang: _ruang, ...sisa } = route.query; return router.push({ query: sisa }) }
const saving = ref(false)

const periodeList = computed(() => periodeOpsi(tahun.value, riwayat.value))
// Empat opsi pertama = tahun ajaran aktif; sisanya arsip (hanya dilihat, tidak diubah).
const arsip = computed(() => !periodeList.value.slice(0, 4).includes(periode.value))
// Buat/ubah/hapus ruang hanya Superadmin; guru dan wali kelas hanya melihat dan memantau.
const bolehKelola = computed(() => cbtData.adalahSuperadmin.value)
const selected = computed(() => ruang.value.find(item => item.id === selectedId.value) ?? null)
// Beri tahu halaman induk (untuk menyembunyikan sub menu CBT dan mengisi breadcrumb).
watch(selected, item => emit('detail', item?.name ?? null), { immediate: true })
onUnmounted(() => emit('detail', null))

const totalSiswaAktif = computed(() => cbtData.classes.value.filter(item => item.grade === props.grade).reduce((sum, item) => sum + item.studentCount, 0))
const siswaDiRuang = computed(() => ruang.value.reduce((sum, item) => sum + item.jumlahSiswa, 0))
const siswaBelumRuang = computed(() => Math.max(0, totalSiswaAktif.value - siswaDiRuang.value))
const guruGrade = computed(() => cbtData.teachers.value.filter(item => item.grade === props.grade || item.grade === 'Yayasan'))
const namaGuru = (id: string | null) => cbtData.teachers.value.find(item => item.id === id)?.name ?? ''
const gradeClasses = computed(() => cbtData.classes.value.filter(item => item.grade === props.grade))

const muat = async () => {
  if (!periode.value) return
  loading.value = true
  error.value = ''
  try {
    ruang.value = await api.muatRuang(props.grade, periode.value)
    riwayat.value = await api.muatPeriodeRiwayat(props.grade)
    // ?ruang= yang tidak ada di periode ini (tautan lama/periode lain) dibersihkan agar tidak menjebak.
    if (selectedId.value && !ruang.value.some(item => item.id === selectedId.value)) await tutupRuang()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ruang ujian gagal dimuat.'
    ruang.value = []
  } finally { loading.value = false }
}

onMounted(async () => {
  void cbtData.load()
  await muatOpsi()
  periode.value = periodeList.value[1] ?? periodeList.value[0] ?? ''
  riwayat.value = await api.muatPeriodeRiwayat(props.grade).catch(() => [])
})
watch([periode, () => props.grade], () => { void muat() })

// ---- Form ruang (satuan) ----
const formOpen = ref(false)
const mode = ref<'satu' | 'banyak'>('satu')
const form = ref({ id: '', name: '', capacity: 30, supervisorId: '' })
const bukaForm = (item?: RuangUjian) => {
  form.value = item
    ? { id: item.id, name: item.name, capacity: item.capacity, supervisorId: item.supervisorId ?? '' }
    : { id: '', name: `Ruang ${String(ruang.value.length + 1).padStart(2, '0')}`, capacity: 30, supervisorId: '' }
  mode.value = 'satu'
  formOpen.value = true
}
const simpanForm = async () => {
  const pesan = validasiRuang(form.value)
  if (pesan) return emit('toast', pesan)
  const lama = ruang.value.find(item => item.id === form.value.id)
  if (lama && form.value.capacity < lama.jumlahSiswa) return emit('toast', `Kapasitas tidak boleh di bawah jumlah siswa saat ini (${lama.jumlahSiswa}).`)
  saving.value = true
  try {
    const id = await api.simpanRuang({
      id: form.value.id || undefined, grade: props.grade, periode: periode.value,
      name: form.value.name, capacity: form.value.capacity, supervisorId: form.value.supervisorId || null
    })
    formOpen.value = false
    await muat()
    emit('toast', lama ? 'Ruang ujian diperbarui.' : 'Ruang ujian dibuat. Tambahkan siswa di dalam ruang.')
    if (!lama) await bukaRuang(id)
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Ruang gagal disimpan.') } finally { saving.value = false }
}
const hapus = async (item: RuangUjian) => {
  if (!confirm(`Hapus ${item.name}? Siswa di dalamnya kembali tanpa ruang.`)) return
  try {
    await api.hapusRuang(item.id)
    await muat()
    emit('toast', `${item.name} dihapus.`)
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Ruang gagal dihapus.') }
}

// ---- Generate massal ----
const gen = ref({ jumlah: 5, kapasitas: 30, classIds: [] as string[] })
const bebas = ref<SiswaBebas[]>([])
const bebasMuat = ref(false)
const bebasTerpilih = computed(() => gen.value.classIds.length ? bebas.value.filter(item => gen.value.classIds.includes(item.classId)) : bebas.value)
const perRuang = computed(() => gen.value.jumlah > 0 ? Math.ceil(bebasTerpilih.value.length / gen.value.jumlah) : 0)
const kelebihan = computed(() => Math.max(0, bebasTerpilih.value.length - gen.value.jumlah * gen.value.kapasitas))
const pilihMode = async (baru: 'satu' | 'banyak') => {
  mode.value = baru
  if (baru !== 'banyak') return
  gen.value = { jumlah: Math.max(1, Math.ceil(siswaBelumRuang.value / 30)), kapasitas: 30, classIds: [] }
  bebasMuat.value = true
  try { bebas.value = await api.muatSiswaBebas(props.grade, periode.value) } catch (e) { emit('toast', e instanceof Error ? e.message : 'Data siswa gagal dimuat.') } finally { bebasMuat.value = false }
}
const jalankanGenerate = async () => {
  if (!Number.isInteger(gen.value.jumlah) || gen.value.jumlah < 1 || gen.value.jumlah > 100) return emit('toast', 'Jumlah ruang harus 1 sampai 100.')
  if (!Number.isInteger(gen.value.kapasitas) || gen.value.kapasitas < 1 || gen.value.kapasitas > 60) return emit('toast', 'Kapasitas ruang harus 1 sampai 60 siswa.')
  if (!bebasTerpilih.value.length) return emit('toast', 'Tidak ada siswa tanpa ruang untuk dibagi.')
  saving.value = true
  try {
    const hasil = await api.generateRuang({
      grade: props.grade, periode: periode.value, jumlahRuang: gen.value.jumlah,
      kapasitas: gen.value.kapasitas, classIds: gen.value.classIds, supervisorId: null
    })
    formOpen.value = false
    await muat()
    emit('toast', `${hasil.ruang} ruang dibuat, ${hasil.siswa} siswa dibagi acak${hasil.sisa ? `, ${hasil.sisa} siswa belum kebagian` : ''}.`)
  } catch (e) { emit('toast', e instanceof Error ? e.message : 'Ruang gagal dibuat.') } finally { saving.value = false }
}
const toggleKelas = (id: string) => {
  gen.value.classIds = gen.value.classIds.includes(id) ? gen.value.classIds.filter(item => item !== id) : [...gen.value.classIds, id]
}
const persenIsi = (item: RuangUjian) => Math.min(100, Math.round((item.jumlahSiswa / item.capacity) * 100))
</script>

<template>
  <div class="space-y-4">
    <CbtV2RoomDetail
      v-if="selected"
      :key="selected.id"
      :room="selected"
      :grade="grade"
      :arsip="arsip"
      @back="tutupRuang"
      @changed="muat"
      @toast="(m: string) => emit('toast', m)"
    />

    <template v-else>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 class="text-lg font-extrabold text-[#101828]">Ruang Ujian</h2>
          <p class="mt-0.5 text-xs text-[#667085]">Ruang diisi siswa lintas kelas dengan mata pelajaran yang sama. Satu siswa hanya satu ruang per periode.</p>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <label class="sr-only" for="periode-ruang">Periode ujian</label>
          <select id="periode-ruang" v-model="periode" class="min-h-11 w-full rounded-xl border border-[#E7EBF2] bg-white px-3 text-sm sm:w-64">
            <option v-for="p in periodeList" :key="p" :value="p">{{ p }}{{ periodeList.slice(0, 4).includes(p) ? '' : ' (arsip)' }}</option>
          </select>
          <template v-if="!arsip && bolehKelola">
            <button type="button" class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#101828] px-4 text-xs font-bold text-white hover:bg-[#1E293B]" @click="bukaForm()">
              <AdminV2Icon name="plus" :size="14" /><span>Buat Ruang</span>
            </button>
          </template>
        </div>
      </div>

      <p v-if="arsip" class="rounded-xl border border-[#E7EBF2] bg-[#F8FAFD] px-4 py-3 text-xs text-[#475467]">Periode arsip: ruang, siswa, dan pelanggaran masih dapat dilihat, tetapi tidak dapat diubah.</p>

      <div class="grid grid-cols-3 gap-2 sm:gap-3">
        <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3 sm:p-4"><b class="block text-xl font-extrabold text-[#101828]">{{ ruang.length }}</b><span class="text-[11px] text-[#667085]">Ruang</span></div>
        <div class="rounded-2xl border border-[#E7EBF2] bg-white p-3 sm:p-4"><b class="block text-xl font-extrabold text-[#101828]">{{ siswaDiRuang }}</b><span class="text-[11px] text-[#667085]">Siswa di ruang</span></div>
        <div class="rounded-2xl border bg-white p-3 sm:p-4" :class="siswaBelumRuang && !arsip ? 'border-[#F5D9A6]' : 'border-[#E7EBF2]'"><b class="block text-xl font-extrabold" :class="siswaBelumRuang && !arsip ? 'text-[#AD6504]' : 'text-[#101828]'">{{ siswaBelumRuang }}</b><span class="text-[11px] text-[#667085]">Belum punya ruang</span></div>
      </div>

      <div v-if="error" class="rounded-xl border border-[#F5C6C0] bg-[#FFFBFA] px-4 py-3 text-xs text-[#B42318]" role="alert">{{ error }}. Pastikan migrasi 0033 sudah dijalankan.</div>
      <div v-else-if="loading" class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center text-xs text-[#667085]">Memuat ruang ujian…</div>

      <div v-else-if="ruang.length" class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in ruang"
          :key="item.id"
          class="flex flex-col justify-between rounded-[18px] border border-[#E7EBF2] bg-white p-5 shadow-xs transition hover:border-[#1B5FD9] hover:shadow-md"
        >
          <button type="button" class="text-left" @click="bukaRuang(item.id)">
            <div class="flex items-center justify-between">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1B5FD9]"><AdminV2Icon name="bldg" :size="20" /></span>
              <span class="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold" :class="item.jumlahSiswa >= item.capacity ? 'bg-[#E7F8F0] text-[#087C52]' : item.jumlahSiswa ? 'bg-[#FEF4E5] text-[#AD6504]' : 'bg-[#EFF2F7] text-[#344054]'">
                {{ item.jumlahSiswa >= item.capacity ? 'Penuh' : item.jumlahSiswa ? 'Terisi sebagian' : 'Kosong' }}
              </span>
            </div>
            <h3 class="mt-3.5 text-base font-extrabold text-[#101828]">{{ item.name }}</h3>
            <p class="mt-0.5 text-xs text-[#667085]">Pengawas: {{ namaGuru(item.supervisorId) || 'belum ditentukan' }}</p>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-[#EFF2F7]"><div class="h-full rounded-full bg-[#1B5FD9]" :style="{ width: `${persenIsi(item)}%` }" /></div>
            <p class="mt-1.5 text-[11px] font-semibold text-[#344054]">{{ item.jumlahSiswa }} / {{ item.capacity }} siswa</p>
          </button>
          <div class="mt-4 grid gap-2 border-t border-[#EFF2F7] pt-3" :class="bolehKelola && !arsip ? 'grid-cols-3' : 'grid-cols-1'">
            <button type="button" class="min-h-11 rounded-xl bg-[#E8F0FE] text-xs font-bold text-[#0A2A5C]" @click="bukaRuang(item.id)">Buka</button>
            <button v-if="!arsip && bolehKelola" type="button" class="min-h-11 rounded-xl border border-[#E7EBF2] text-xs font-bold text-[#344054]" @click="bukaForm(item)">Ubah</button>
            <button v-if="!arsip && bolehKelola" type="button" class="min-h-11 rounded-xl border border-[#F8D3CE] text-xs font-bold text-[#B42318]" @click="hapus(item)">Hapus</button>
          </div>
        </article>
      </div>

      <div v-else class="rounded-2xl border border-[#E7EBF2] bg-white p-8 text-center">
        <p class="text-sm font-bold text-[#101828]">Belum ada ruang untuk {{ periode }}</p>
        <p class="mx-auto mt-1 max-w-md text-xs text-[#667085]">{{ bolehKelola ? "Klik Buat Ruang. Anda dapat membuat satu ruang, atau banyak ruang sekaligus dengan siswa dibagi otomatis." : "Ruang ujian dibuat oleh Superadmin." }}</p>
      </div>
    </template>

    <!-- FORM RUANG -->
    <Teleport to="body">
      <div v-if="formOpen" class="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Form ruang ujian" @keydown.esc="formOpen = false">
        <div class="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-[#E7EBF2] bg-white shadow-2xl sm:rounded-2xl">
          <div class="flex items-center justify-between border-b border-[#E7EBF2] p-5">
            <div><span class="text-[10px] font-extrabold uppercase tracking-wider text-[#1B5FD9]">{{ periode }}</span><h3 class="mt-0.5 text-base font-extrabold text-[#101828]">{{ form.id ? 'Ubah Ruang Ujian' : 'Buat Ruang Ujian' }}</h3></div>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-[#667085] hover:bg-[#EFF2F7]" aria-label="Tutup" @click="formOpen = false"><AdminV2Icon name="x" :size="16" /></button>
          </div>
          <div v-if="!form.id" class="grid grid-cols-2 gap-2 px-5 pt-5" role="tablist" aria-label="Cara membuat ruang">
            <button type="button" role="tab" :aria-selected="mode === 'satu'" class="rounded-xl border p-3 text-left" :class="mode === 'satu' ? 'border-[#1B5FD9] bg-[#E8F0FE]' : 'border-[#E7EBF2] bg-white'" @click="pilihMode('satu')">
              <b class="block text-xs font-extrabold text-[#101828]">Satu ruang</b>
              <span class="mt-0.5 block text-[11px] leading-snug text-[#667085]">Buat ruang kosong, siswa dipilih sendiri.</span>
            </button>
            <button type="button" role="tab" :aria-selected="mode === 'banyak'" class="rounded-xl border p-3 text-left" :class="mode === 'banyak' ? 'border-[#1B5FD9] bg-[#E8F0FE]' : 'border-[#E7EBF2] bg-white'" @click="pilihMode('banyak')">
              <b class="block text-xs font-extrabold text-[#101828]">Banyak ruang</b>
              <span class="mt-0.5 block text-[11px] leading-snug text-[#667085]">Siswa dibagi acak ke semua ruang otomatis.</span>
            </button>
          </div>
          <div v-if="mode === 'satu'" class="space-y-3.5 p-5 text-xs">
            <div><label class="mb-1 block font-bold text-[#344054]" for="rg-nama">Nama ruang *</label><input id="rg-nama" v-model="form.name" type="text" class="w-full rounded-xl border border-[#E7EBF2] p-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
            <div><label class="mb-1 block font-bold text-[#344054]" for="rg-kap">Kapasitas siswa *</label><input id="rg-kap" v-model.number="form.capacity" type="number" min="1" max="60" inputmode="numeric" class="w-full rounded-xl border border-[#E7EBF2] p-3 text-sm outline-none focus:border-[#1B5FD9]"><p class="mt-1 text-[#667085]">Umumnya 28–30 siswa, menyesuaikan kondisi ruang.</p></div>
            <div>
              <label class="mb-1 block font-bold text-[#344054]" for="rg-peng">Pengawas ruang</label>
              <select id="rg-peng" v-model="form.supervisorId" class="w-full rounded-xl border border-[#E7EBF2] bg-white p-3 text-sm outline-none focus:border-[#1B5FD9]">
                <option value="">Belum ditentukan</option>
                <option v-for="g in guruGrade" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </div>
          </div>
          <div v-else class="space-y-3.5 p-5 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div><label class="mb-1 block font-bold text-[#344054]" for="gn-jml">Jumlah ruang *</label><input id="gn-jml" v-model.number="gen.jumlah" type="number" min="1" max="100" inputmode="numeric" class="w-full rounded-xl border border-[#E7EBF2] p-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
              <div><label class="mb-1 block font-bold text-[#344054]" for="gn-kap">Kapasitas per ruang *</label><input id="gn-kap" v-model.number="gen.kapasitas" type="number" min="1" max="60" inputmode="numeric" class="w-full rounded-xl border border-[#E7EBF2] p-3 text-sm outline-none focus:border-[#1B5FD9]"></div>
            </div>
            <fieldset>
              <legend class="mb-1.5 font-bold text-[#344054]">Batasi kelas <span class="font-normal text-[#667085]">(kosong = semua kelas {{ grade }})</span></legend>
              <div class="flex flex-wrap gap-1.5">
                <button v-for="c in gradeClasses" :key="c.id" type="button" class="min-h-9 rounded-lg border px-3 text-xs font-bold" :class="gen.classIds.includes(c.id) ? 'border-[#1B5FD9] bg-[#E8F0FE] text-[#0A2A5C]' : 'border-[#E7EBF2] text-[#475467]'" :aria-pressed="gen.classIds.includes(c.id)" @click="toggleKelas(c.id)">{{ c.name }}</button>
              </div>
            </fieldset>
            <div class="rounded-xl bg-[#E8F0FE] p-3 text-[#0A2A5C]">
              <p v-if="bebasMuat" class="font-semibold">Menghitung siswa…</p>
              <template v-else>
                <p class="font-bold">{{ bebasTerpilih.length }} siswa belum punya ruang akan dibagi acak dan merata, sekitar {{ perRuang }} siswa per ruang.</p>
                <p v-if="kelebihan" class="mt-1 font-bold text-[#B42318]">{{ kelebihan }} siswa tidak kebagian karena melebihi kapasitas. Tambah jumlah ruang atau kapasitas.</p>
              </template>
            </div>
          </div>
          <div class="flex gap-2 border-t border-[#E7EBF2] bg-[#F8FAFD] p-4">
            <button type="button" class="min-h-11 flex-1 rounded-xl border border-[#E7EBF2] bg-white text-xs font-bold text-[#344054]" @click="formOpen = false">Batal</button>
            <button v-if="mode === 'satu'" type="button" class="min-h-11 flex-1 rounded-xl bg-[#1B5FD9] text-xs font-bold text-white disabled:opacity-60" :disabled="saving" @click="simpanForm">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
            <button v-else type="button" class="min-h-11 flex-1 rounded-xl bg-[#1B5FD9] text-xs font-bold text-white disabled:opacity-60" :disabled="saving || bebasMuat" @click="jalankanGenerate">{{ saving ? 'Membuat…' : 'Buat & Bagi Siswa' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
