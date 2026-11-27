<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import SpmbDetail from '~/components/adminV2/spmb/SpmbDetail.vue'
import SpmbForm from '~/components/adminV2/spmb/SpmbForm.vue'
import SpmbPlacement from '~/components/adminV2/spmb/SpmbPlacement.vue'
import SpmbWaPanel from '~/components/adminV2/spmb/SpmbWaPanel.vue'
import {
  SPMB_JURUSAN_SMK, SPMB_TAHUN_AJARAN, csvSpmb, fmtWaktuSpmb, jenjangKeyDari, useSpmbAdmin,
  type SpmbAdminRecord, type SpmbJenjangKey, type SpmbStatus
} from '~/composables/useSpmbAdmin'

const props = defineProps<{ jenjang: SpmbJenjangKey }>()

const admin = useSpmbAdmin()
onMounted(() => admin.muat())

type Tampilan = 'daftar' | 'detail' | 'formulir'
const tampilan = ref<Tampilan>('daftar')
const tabAktif = ref<'pendaftar' | 'penempatan'>('pendaftar')
const pilihanId = ref('')
const editId = ref('')
const tampilSampah = ref(false)
const filterStatus = ref('Semua')
const filterJurusan = ref('Semua jurusan')
const filterSumber = ref('Semua sumber')
const cari = ref('')
const urut = ref('Terbaru')
const toastPesan = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

watch(() => props.jenjang, () => {
  tampilan.value = 'daftar'
  tabAktif.value = 'pendaftar'
  tampilSampah.value = false
  filterStatus.value = 'Semua'
  filterJurusan.value = 'Semua jurusan'
  filterSumber.value = 'Semua sumber'
  cari.value = ''
})

const tabelEl = ref<HTMLElement | null>(null)
function toggleSampah() {
  tampilSampah.value = !tampilSampah.value
  if (tampilSampah.value) {
    // Masuk mode sampah: longgarkan semua filter agar data terhapus
    // tidak tersembunyi filter lama, lalu gulir tabel ke pandangan.
    filterStatus.value = 'Semua'
    filterJurusan.value = 'Semua jurusan'
    filterSumber.value = 'Semua sumber'
    cari.value = ''
    void nextTick(() => tabelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
}

function toast(pesan: string) {
  toastPesan.value = pesan
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastPesan.value = '' }, 3600)
}

const perJenjang = computed(() => admin.records.value.filter(r => jenjangKeyDari(r) === props.jenjang))
const aktif = computed(() => perJenjang.value.filter(r => !r.deleted))
const sampah = computed(() => perJenjang.value.filter(r => r.deleted))
const kuotaJenjang = computed(() => admin.kuota.value[props.jenjang])
const jumlahDiterima = computed(() => aktif.value.filter(r => r.status === 'Diterima').length)
const kuotaPenuh = computed(() => jumlahDiterima.value >= kuotaJenjang.value)

const kpi = computed(() => [
  { label: 'Total Pendaftar', nilai: aktif.value.length, tint: 'bg-blue-50 text-blue-600', ikon: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'] },
  { label: 'Menunggu Verifikasi', nilai: aktif.value.filter(r => r.status === 'Menunggu verifikasi').length, tint: 'bg-amber-50 text-amber-600', ikon: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20', 'M12 6v6l4 2'] },
  { label: 'Pembayaran Terverifikasi', nilai: aktif.value.filter(r => r.status === 'Pembayaran terverifikasi').length, tint: 'bg-sky-50 text-sky-600', ikon: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'] },
  { label: 'Diterima', nilai: jumlahDiterima.value, tint: 'bg-emerald-50 text-emerald-600', ikon: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2', 'm16 11 2 2 4-4'] },
  { label: 'Ditolak', nilai: aktif.value.filter(r => r.status === 'Ditolak').length, tint: 'bg-red-50 text-red-500', ikon: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20', 'm15 9-6 6', 'm9 9 6 6'] }
])
const chips = computed(() => ['Semua', 'Menunggu verifikasi', 'Pembayaran terverifikasi', 'Diterima', 'Ditolak'].map(s => ({
  label: s,
  jumlah: s === 'Semua' ? aktif.value.length : aktif.value.filter(r => r.status === s).length
})))
const belumDitempatkan = computed(() => aktif.value.filter(r => r.status === 'Diterima' && !r.kelas).length)

const tersaring = computed(() => {
  let rows = tampilSampah.value ? [...sampah.value] : [...aktif.value]
  if (filterStatus.value !== 'Semua') rows = rows.filter(r => r.status === filterStatus.value)
  if (props.jenjang === 'SMK' && filterJurusan.value !== 'Semua jurusan') rows = rows.filter(r => r.jurusan === filterJurusan.value)
  if (filterSumber.value === 'Online') rows = rows.filter(r => r.via === 'Online')
  if (filterSumber.value === 'Manual') rows = rows.filter(r => r.via === 'Manual')
  const q = cari.value.trim().toLowerCase()
  if (q) rows = rows.filter(r => r.s_nama.toLowerCase().includes(q) || r.s_nisn.includes(q) || r.id.toLowerCase().includes(q))
  rows.sort((a, b) => {
    if (urut.value === 'Terlama') return a.waktu.localeCompare(b.waktu)
    if (urut.value === 'Nama A–Z') return a.s_nama.localeCompare(b.s_nama)
    return b.waktu.localeCompare(a.waktu)
  })
  return rows
})

const pilihan = computed(() => admin.records.value.find(r => r.id === pilihanId.value) || null)
const untukEdit = computed(() => (editId.value ? admin.records.value.find(r => r.id === editId.value) || null : null))

const chipStatusKelas: Record<string, string> = {
  'Menunggu verifikasi': 'bg-[#FFFAEB] text-[#B54708]',
  'Pembayaran terverifikasi': 'bg-[#EFF8FF] text-[#175CD3]',
  'Diterima': 'bg-[#ECFDF3] text-[#027A48]',
  'Ditolak': 'bg-[#FEF3F2] text-[#B42318]'
}
const titikStatusKelas: Record<string, string> = {
  'Menunggu verifikasi': 'bg-amber-500',
  'Pembayaran terverifikasi': 'bg-sky-500',
  'Diterima': 'bg-emerald-500',
  'Ditolak': 'bg-red-500'
}
function inisialNama(nama: string): string {
  const kata = (nama || '?').trim().split(/\s+/).slice(0, 2)
  return kata.map(k => k[0]?.toUpperCase() || '').join('') || '?'
}

function bukaDetail(id: string) { pilihanId.value = id; tampilan.value = 'detail' }
function bukaFormulir(id = '') { editId.value = id; tampilan.value = 'formulir' }

async function simpanFormulir(record: SpmbAdminRecord, asli?: File | null) {
  if (asli) {
    try {
      const supabase = useSupabaseClient()
      const berkas = await kompresGambar(asli)
      const nama = berkas.name.replace(/[^\w.\-]+/g, '_')
      const { error } = await supabase.storage.from('spmb-bukti').upload(`${record.id}/${nama}`, berkas)
      if (!error) {
        record.bukti_path = `${record.id}/${nama}`
        record.bukti = nama
      }
    } catch { /* nama berkas tetap tercatat dari formulir */ }
  }
  const i = admin.records.value.findIndex(r => r.id === record.id)
  if (i >= 0) admin.records.value[i] = record
  else admin.records.value.push(record)
  admin.simpan()
  void admin.simpanRecordDb(record)
  toast(i >= 0 ? `Data ${record.s_nama} diperbarui.` : `Pendaftaran manual ${record.s_nama} tersimpan dengan ID ${record.id}.`)
  tampilan.value = 'daftar'
}

const waMengirim = ref(false)
async function kirimWa(r: SpmbAdminRecord) {
  if (waMengirim.value) return
  waMengirim.value = true
  try {
    const hasil = await $fetch<{ ok: boolean; pesan: string }>('/api/admin/spmb/wa-kirim', { method: 'POST', body: { id: r.id } })
    toast(hasil.ok ? `WhatsApp terkirim ke wali ${r.s_nama}.` : `WhatsApp tidak terkirim — ${hasil.pesan}`)
  } catch (e: any) {
    toast(`WhatsApp tidak terkirim — ${e?.data?.statusMessage || 'gateway WhatsApp bermasalah.'}`)
  } finally {
    waMengirim.value = false
  }
}
function kirimWaId(id: string) {
  const r = admin.records.value.find(x => x.id === id)
  if (r) void kirimWa(r)
}

async function ubahStatus(id: string, status: SpmbStatus) {
  const r = admin.records.value.find(x => x.id === id)
  if (!r) return
  if (status === 'Diterima' && r.status !== 'Diterima' && kuotaPenuh.value) {
    toast(`Kuota ${props.jenjang} sudah penuh (${kuotaJenjang.value}). Naikkan kuota dulu bila memang ditambah.`)
    return
  }
  r.status = status
  admin.simpan()
  void admin.simpanRecordDb(r)
  toast(`Status ${r.s_nama} sekarang: ${status}.`)
  // Notifikasi WhatsApp ke wali mengikuti setiap perubahan status.
  await kirimWa(r)
}

function hapus(id: string) {
  const r = admin.records.value.find(x => x.id === id)
  if (!r) return
  r.deleted = true
  admin.simpan()
  void admin.simpanRecordDb(r)
  tampilan.value = 'daftar'
  toast(`${r.s_nama} dipindahkan ke sampah (soft delete).`)
}
function pulihkan(id: string) {
  const r = admin.records.value.find(x => x.id === id)
  if (!r) return
  r.deleted = false
  admin.simpan()
  void admin.simpanRecordDb(r)
  toast(`${r.s_nama} dipulihkan ke daftar pendaftar.`)
}

function ubahKuota() {
  const jawab = window.prompt(`Kuota penerimaan ${props.jenjang} tahun ajaran ${SPMB_TAHUN_AJARAN} (gabungan online + manual):`, String(kuotaJenjang.value))
  if (jawab === null) return
  const n = parseInt(jawab, 10)
  if (!n || n < 1) return toast('Kuota harus berupa angka lebih dari 0.')
  admin.kuota.value = { ...admin.kuota.value, [props.jenjang]: n }
  admin.simpanPengaturan()
  toast(`Kuota ${props.jenjang} diubah menjadi ${n}.`)
}

function eksporCsv() {
  const csv = csvSpmb(aktif.value)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `spmb-${props.jenjang.toLowerCase()}-2027.csv`
  a.click()
  URL.revokeObjectURL(a.href)
  toast('File CSV pendaftar diunduh.')
}
</script>

<template>
  <div class="space-y-5">
    <SpmbDetail
      v-if="tampilan === 'detail' && pilihan"
      :record="pilihan"
      @kembali="tampilan = 'daftar'"
      @status="ubahStatus"
      @hapus="hapus"
      @ubah="bukaFormulir"
      @wa="kirimWaId"
    />
    <SpmbForm
      v-else-if="tampilan === 'formulir'"
      :jenjang="jenjang"
      :record="untukEdit"
      :records="aktif"
      @simpan="simpanFormulir"
      @batal="tampilan = 'daftar'"
    />

    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">Manajemen SPMB</h1>
          <p class="mt-1 text-sm text-slate-500">Pendaftar online &amp; manual · Tahun Ajaran {{ SPMB_TAHUN_AJARAN }} · {{ jenjang === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam' }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold shadow-sm transition" :class="tampilSampah ? 'border-red-300 bg-red-50 text-red-700 ring-4 ring-red-100' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'" @click="toggleSampah">{{ tampilSampah ? '← Daftar Pendaftar' : 'Sampah' }} <span class="ml-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 ring-1 ring-red-100">{{ sampah.length }}</span></button>
          <button type="button" class="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800" @click="eksporCsv">Ekspor CSV</button>
          <button type="button" class="inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-[#1B5FD9] to-[#175CD3] px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.99]" @click="bukaFormulir()">+ Tambah Manual</button>
        </div>
      </div>

      <SpmbWaPanel />

      <div>
        <div class="inline-flex rounded-full bg-slate-100 p-1">
          <button type="button" class="min-h-9 rounded-full px-4 text-sm font-semibold transition" :class="tabAktif === 'pendaftar' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'" @click="tabAktif = 'pendaftar'">Pendaftar</button>
          <button type="button" class="min-h-9 rounded-full px-4 text-sm font-semibold transition" :class="tabAktif === 'penempatan' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'" @click="tabAktif = 'penempatan'">Penempatan Kelas <span v-if="belumDitempatkan" class="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">{{ belumDitempatkan }} menunggu</span></button>
        </div>
      </div>

      <SpmbPlacement v-if="tabAktif === 'penempatan'" :jenjang="jenjang" @toast="toast" />

      <template v-else>
        <div class="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)]">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Kuota {{ jenjang }} · {{ SPMB_TAHUN_AJARAN }}</p>
              <p class="mt-1 text-sm text-slate-600">Diterima <span class="font-bold text-slate-900">{{ jumlahDiterima }}</span> dari <span class="font-bold text-slate-900">{{ kuotaJenjang }}</span> · Sisa <span class="font-bold text-emerald-600">{{ Math.max(0, kuotaJenjang - jumlahDiterima) }}</span></p>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700 ring-1 ring-blue-100">{{ Math.min(100, Math.round(jumlahDiterima / kuotaJenjang * 100)) }}%</span>
              <button type="button" class="rounded-full border border-slate-200 px-3.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800" @click="ubahKuota">Ubah Kuota</button>
            </div>
          </div>
          <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-gradient-to-r from-[#1B5FD9] to-[#38BDF8] transition-all" :style="{ width: `${Math.min(100, Math.round(jumlahDiterima / kuotaJenjang * 100))}%` }" /></div>
          <p class="mt-2.5 text-xs text-slate-400">Total pendaftar {{ aktif.length }} — Online {{ aktif.filter(r => r.via === 'Online').length }} · Manual {{ aktif.filter(r => r.via === 'Manual').length }}. Kuota berlaku gabungan untuk pendaftaran online dan manual.</p>
        </div>

        <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <button v-for="k in kpi" :key="k.label" type="button" class="rounded-3xl border bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)] transition hover:-translate-y-0.5" :class="filterStatus === k.label || (k.label === 'Total Pendaftar' && filterStatus === 'Semua') ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-200/70'" @click="filterStatus = k.label === 'Total Pendaftar' ? 'Semua' : k.label">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="k.tint">
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path v-for="d in k.ikon" :key="d" :d="d" /></svg>
            </span>
            <p class="mt-3 text-[26px] font-black leading-none text-slate-900">{{ k.nilai }}</p>
            <p class="mt-1.5 text-[13px] font-medium text-slate-500">{{ k.label }}</p>
          </button>
        </div>

        <div v-if="tampilSampah" class="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-red-200 bg-red-50 px-5 py-3.5">
          <p class="text-sm font-semibold text-red-700">Mode Sampah — menampilkan {{ sampah.length }} data yang dihapus (soft delete). Data di sini tidak terhitung dalam kuota &amp; statistik.</p>
          <button type="button" class="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100" @click="toggleSampah">Kembali ke daftar pendaftar</button>
        </div>

        <div ref="tabelEl" class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_40px_-24px_rgba(16,24,40,0.25)]">
          <div class="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-1.5">
              <button v-for="c in chips" :key="c.label" type="button" class="rounded-full px-3 py-1.5 text-[13px] font-semibold transition" :class="filterStatus === c.label ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" @click="filterStatus = c.label">{{ c.label }} <span class="opacity-60">{{ c.jumlah }}</span></button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <select v-if="jenjang === 'SMK'" v-model="filterJurusan" class="min-h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400"><option>Semua jurusan</option><option v-for="j in SPMB_JURUSAN_SMK" :key="j">{{ j }}</option></select>
              <select v-model="filterSumber" class="min-h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400"><option>Semua sumber</option><option>Online</option><option>Manual</option></select>
              <div class="relative">
                <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                <input v-model="cari" type="text" placeholder="Cari nama, NISN, atau ID" class="min-h-10 w-[200px] rounded-full border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50">
              </div>
              <select v-model="urut" class="min-h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400"><option>Terbaru</option><option>Terlama</option><option>Nama A–Z</option></select>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400">
                  <th class="px-4 py-3 font-bold">ID Pendaftaran</th>
                  <th class="px-4 py-3 font-bold">Calon Siswa</th>
                  <th v-if="jenjang === 'SMK'" class="px-4 py-3 font-bold">Jurusan</th>
                  <th class="px-4 py-3 font-bold">Asal Sekolah</th>
                  <th class="px-4 py-3 font-bold">Orang Tua / Wali</th>
                  <th class="px-4 py-3 font-bold">Waktu Daftar</th>
                  <th class="px-4 py-3 font-bold">Status</th>
                  <th class="px-4 py-3 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in tersaring" :key="r.id" class="border-t border-slate-50 transition hover:bg-blue-50/40">
                  <td class="px-4 py-3"><span class="font-mono text-xs text-slate-500">{{ r.id }}</span></td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-600 ring-1 ring-blue-100">{{ inisialNama(r.s_nama) }}</span>
                      <div class="min-w-0">
                        <p class="truncate font-semibold text-slate-800">{{ r.s_nama }} <span v-if="r.via === 'Manual'" class="ml-1 rounded-full bg-sky-50 px-2 py-0.5 align-middle text-[10px] font-bold text-sky-600 ring-1 ring-sky-100">MANUAL</span></p>
                        <p class="text-xs text-slate-400">NISN {{ r.s_nisn }}</p>
                      </div>
                    </div>
                  </td>
                  <td v-if="jenjang === 'SMK'" class="px-4 py-3 text-slate-500">{{ r.jurusan || '-' }}</td>
                  <td class="px-4 py-3"><span class="block max-w-[180px] truncate text-slate-500">{{ r.s_sekolah }}</span></td>
                  <td class="px-4 py-3"><span class="font-medium text-slate-700">{{ r.o_nama }}</span><br><a :href="`https://wa.me/62${r.o_hp.replace(/\D/g, '').replace(/^0/, '')}`" target="_blank" rel="noopener" class="text-[13px] font-semibold text-[#027A48]">{{ r.o_hp }}</a></td>
                  <td class="whitespace-nowrap px-4 py-3 text-[13px] text-slate-500">{{ fmtWaktuSpmb(r.waktu) }}</td>
                  <td class="px-4 py-3"><span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold" :class="chipStatusKelas[r.status]"><span class="h-1.5 w-1.5 rounded-full" :class="titikStatusKelas[r.status]" />{{ r.status }}</span></td>
                  <td class="whitespace-nowrap px-4 py-3 text-right">
                    <template v-if="tampilSampah">
                      <button type="button" class="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100" @click="bukaDetail(r.id)">Detail</button>
                      <button type="button" class="ml-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100" @click="pulihkan(r.id)">Pulihkan</button>
                    </template>
                    <template v-else>
                      <button type="button" class="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100" @click="bukaDetail(r.id)">Detail</button>
                      <button type="button" class="ml-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100" @click="kirimWa(r)">Kirim WA</button>
                      <button type="button" class="ml-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50" @click="hapus(r.id)">Hapus</button>
                    </template>
                  </td>
                </tr>
                <tr v-if="!tersaring.length">
                  <td :colspan="jenjang === 'SMK' ? 8 : 7" class="px-4 py-12 text-center">
                    <span class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </span>
                    <span class="text-slate-500">{{ tampilSampah ? 'Sampah kosong.' : aktif.length ? 'Tidak ada pendaftar yang cocok dengan filter.' : 'Belum ada pendaftaran masuk. Data dari formulir pendaftaran publik akan tampil di sini.' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">Menampilkan {{ tersaring.length }} dari {{ tampilSampah ? sampah.length : aktif.length }} pendaftar {{ jenjang }} · Data berasal dari formulir pendaftaran SPMB {{ SPMB_TAHUN_AJARAN }} &amp; input manual panitia.</p>
        </div>
      </template>
    </template>

    <div v-if="toastPesan" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full bg-slate-900/95 px-5 py-3 text-center text-sm font-medium text-white shadow-2xl backdrop-blur">{{ toastPesan }}</div>
  </div>
</template>
