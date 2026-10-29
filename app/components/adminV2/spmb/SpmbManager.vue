<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SpmbDetail from '~/components/adminV2/spmb/SpmbDetail.vue'
import SpmbForm from '~/components/adminV2/spmb/SpmbForm.vue'
import SpmbPlacement from '~/components/adminV2/spmb/SpmbPlacement.vue'
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
  { label: 'Total Pendaftar', nilai: aktif.value.length },
  { label: 'Menunggu Verifikasi', nilai: aktif.value.filter(r => r.status === 'Menunggu verifikasi').length },
  { label: 'Pembayaran Terverifikasi', nilai: aktif.value.filter(r => r.status === 'Pembayaran terverifikasi').length },
  { label: 'Diterima', nilai: jumlahDiterima.value },
  { label: 'Ditolak', nilai: aktif.value.filter(r => r.status === 'Ditolak').length }
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

function bukaDetail(id: string) { pilihanId.value = id; tampilan.value = 'detail' }
function bukaFormulir(id = '') { editId.value = id; tampilan.value = 'formulir' }

function simpanFormulir(record: SpmbAdminRecord) {
  const i = admin.records.value.findIndex(r => r.id === record.id)
  if (i >= 0) admin.records.value[i] = record
  else admin.records.value.push(record)
  admin.simpan()
  toast(i >= 0 ? `Data ${record.s_nama} diperbarui.` : `Pendaftaran manual ${record.s_nama} tersimpan dengan ID ${record.id}.`)
  tampilan.value = 'daftar'
}

function ubahStatus(id: string, status: SpmbStatus) {
  const r = admin.records.value.find(x => x.id === id)
  if (!r) return
  if (status === 'Diterima' && r.status !== 'Diterima' && kuotaPenuh.value) {
    toast(`Kuota ${props.jenjang} sudah penuh (${kuotaJenjang.value}). Naikkan kuota dulu bila memang ditambah.`)
    return
  }
  r.status = status
  admin.simpan()
  toast(`Status ${r.s_nama} sekarang: ${status}.`)
}

function hapus(id: string) {
  const r = admin.records.value.find(x => x.id === id)
  if (!r) return
  r.deleted = true
  admin.simpan()
  tampilan.value = 'daftar'
  toast(`${r.s_nama} dipindahkan ke sampah (soft delete).`)
}
function pulihkan(id: string) {
  const r = admin.records.value.find(x => x.id === id)
  if (!r) return
  r.deleted = false
  admin.simpan()
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
  <div>
    <SpmbDetail
      v-if="tampilan === 'detail' && pilihan"
      :record="pilihan"
      @kembali="tampilan = 'daftar'"
      @status="ubahStatus"
      @hapus="hapus"
      @ubah="bukaFormulir"
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
          <h1 class="text-[22px] font-semibold tracking-tight">Manajemen SPMB</h1>
          <p class="mt-0.5 text-sm text-[#667085]">Pendaftar online &amp; manual · Tahun Ajaran {{ SPMB_TAHUN_AJARAN }} · {{ jenjang === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam' }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="inline-flex min-h-11 items-center rounded-[10px] border border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054]" @click="tampilSampah = !tampilSampah">Sampah <span class="ml-1.5 rounded-full bg-[#FEF3F2] px-1.5 text-xs font-medium text-[#B42318]">{{ sampah.length }}</span></button>
          <button type="button" class="inline-flex min-h-11 items-center rounded-[10px] border border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054]" @click="eksporCsv">Ekspor CSV</button>
          <button type="button" class="inline-flex min-h-11 items-center rounded-[10px] bg-[#1B5FD9] px-4 text-sm font-medium text-white" @click="bukaFormulir()">+ Tambah Manual</button>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <button type="button" class="min-h-10 rounded-lg px-4 text-sm font-medium" :class="tabAktif === 'pendaftar' ? 'bg-[#1B5FD9] text-white' : 'border border-[#D0D5DD] bg-white text-[#344054]'" @click="tabAktif = 'pendaftar'">Pendaftar</button>
        <button type="button" class="min-h-10 rounded-lg px-4 text-sm font-medium" :class="tabAktif === 'penempatan' ? 'bg-[#1B5FD9] text-white' : 'border border-[#D0D5DD] bg-white text-[#344054]'" @click="tabAktif = 'penempatan'">Penempatan Kelas <span v-if="belumDitempatkan" class="opacity-70">· {{ belumDitempatkan }} menunggu</span></button>
      </div>

      <SpmbPlacement v-if="tabAktif === 'penempatan'" :jenjang="jenjang" @toast="toast" />

      <template v-else>
        <div class="mt-4 rounded-2xl border border-[#E7EBF2] bg-white p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm">Kuota {{ jenjang }} {{ SPMB_TAHUN_AJARAN }} — Diterima <span class="font-medium">{{ jumlahDiterima }}</span> dari <span class="font-medium">{{ kuotaJenjang }}</span> · Sisa <span class="font-medium">{{ Math.max(0, kuotaJenjang - jumlahDiterima) }}</span></p>
            <button type="button" class="text-sm font-medium text-[#175CD3]" @click="ubahKuota">Ubah Kuota</button>
          </div>
          <div class="mt-2.5 h-2 overflow-hidden rounded-full bg-[#EFF2F7]"><div class="h-full rounded-full bg-[#1B5FD9] transition-all" :style="{ width: `${Math.min(100, Math.round(jumlahDiterima / kuotaJenjang * 100))}%` }" /></div>
          <p class="mt-2 text-xs text-[#667085]">Total pendaftar {{ aktif.length }} — Online {{ aktif.filter(r => r.via === 'Online').length }} · Manual {{ aktif.filter(r => r.via === 'Manual').length }}. Kuota berlaku gabungan untuk pendaftaran online dan manual.</p>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <button v-for="k in kpi" :key="k.label" type="button" class="rounded-2xl border bg-white p-4 text-left" :class="filterStatus === k.label || (k.label === 'Total Pendaftar' && filterStatus === 'Semua') ? 'border-[#1B5FD9]' : 'border-[#E7EBF2]'" @click="filterStatus = k.label === 'Total Pendaftar' ? 'Semua' : k.label">
            <p class="text-[26px] font-semibold leading-none">{{ k.nilai }}</p>
            <p class="mt-1.5 text-[13px] text-[#667085]">{{ k.label }}</p>
          </button>
        </div>

        <div class="mt-4 rounded-2xl border border-[#E7EBF2] bg-white">
          <div class="flex flex-col gap-3 border-b border-[#EFF2F7] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-1.5">
              <button v-for="c in chips" :key="c.label" type="button" class="rounded-full px-3 py-1.5 text-[13px] font-medium" :class="filterStatus === c.label ? 'bg-[#101828] text-white' : 'bg-[#F2F4F7] text-[#475467]'" @click="filterStatus = c.label">{{ c.label }} <span class="opacity-60">{{ c.jumlah }}</span></button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <select v-if="jenjang === 'SMK'" v-model="filterJurusan" class="min-h-10 rounded-lg border border-[#D0D5DD] bg-white px-2.5 text-sm"><option>Semua jurusan</option><option v-for="j in SPMB_JURUSAN_SMK" :key="j">{{ j }}</option></select>
              <select v-model="filterSumber" class="min-h-10 rounded-lg border border-[#D0D5DD] bg-white px-2.5 text-sm"><option>Semua sumber</option><option>Online</option><option>Manual</option></select>
              <input v-model="cari" type="text" placeholder="Cari nama, NISN, atau ID" class="min-h-10 w-[190px] rounded-lg border border-[#D0D5DD] px-3 text-sm outline-none focus:border-[#1B5FD9]">
              <select v-model="urut" class="min-h-10 rounded-lg border border-[#D0D5DD] bg-white px-2.5 text-sm"><option>Terbaru</option><option>Terlama</option><option>Nama A–Z</option></select>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr class="border-b border-[#EFF2F7] text-xs uppercase text-[#667085]">
                  <th class="px-4 py-3 font-medium">ID Pendaftaran</th>
                  <th class="px-4 py-3 font-medium">Calon Siswa</th>
                  <th v-if="jenjang === 'SMK'" class="px-4 py-3 font-medium">Jurusan</th>
                  <th class="px-4 py-3 font-medium">Asal Sekolah</th>
                  <th class="px-4 py-3 font-medium">Orang Tua / Wali</th>
                  <th class="px-4 py-3 font-medium">Waktu Daftar</th>
                  <th class="px-4 py-3 font-medium">Status</th>
                  <th class="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in tersaring" :key="r.id" class="border-b border-[#F5F7FA]">
                  <td class="px-4 py-3.5 text-[13px] text-[#475467]">{{ r.id }}</td>
                  <td class="px-4 py-3.5"><span class="font-medium">{{ r.s_nama }}</span> <span v-if="r.via === 'Manual'" class="ml-1 rounded-full border border-[#B2DDFF] px-2 py-0.5 align-middle text-[11px] font-medium text-[#175CD3]">Manual</span><br><span class="text-[13px] text-[#667085]">NISN {{ r.s_nisn }}</span></td>
                  <td v-if="jenjang === 'SMK'" class="px-4 py-3.5 text-[#475467]">{{ r.jurusan || '-' }}</td>
                  <td class="px-4 py-3.5 text-[#475467]">{{ r.s_sekolah }}</td>
                  <td class="px-4 py-3.5"><span class="text-[#344054]">{{ r.o_nama }}</span><br><a :href="`https://wa.me/62${r.o_hp.replace(/\D/g, '').replace(/^0/, '')}`" target="_blank" rel="noopener" class="text-[13px] font-medium text-[#027A48]">{{ r.o_hp }}</a></td>
                  <td class="px-4 py-3.5 text-[#475467]">{{ fmtWaktuSpmb(r.waktu) }}</td>
                  <td class="px-4 py-3.5"><span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="chipStatusKelas[r.status]">{{ r.status }}</span></td>
                  <td class="px-4 py-3.5 text-right whitespace-nowrap">
                    <template v-if="tampilSampah">
                      <button type="button" class="font-medium text-[#027A48]" @click="pulihkan(r.id)">Pulihkan</button>
                    </template>
                    <template v-else>
                      <button type="button" class="font-medium text-[#175CD3]" @click="bukaDetail(r.id)">Detail</button>
                      <button type="button" class="ml-3 font-medium text-[#B42318]" @click="hapus(r.id)">Hapus</button>
                    </template>
                  </td>
                </tr>
                <tr v-if="!tersaring.length"><td :colspan="jenjang === 'SMK' ? 8 : 7" class="px-4 py-10 text-center text-[#667085]">{{ tampilSampah ? 'Sampah kosong.' : aktif.length ? 'Tidak ada pendaftar yang cocok dengan filter.' : 'Belum ada pendaftaran masuk. Data dari formulir pendaftaran publik akan tampil di sini.' }}</td></tr>
              </tbody>
            </table>
          </div>
          <p class="border-t border-[#EFF2F7] px-4 py-3 text-xs text-[#667085]">Menampilkan {{ tersaring.length }} dari {{ tampilSampah ? sampah.length : aktif.length }} pendaftar {{ jenjang }} · Data berasal dari formulir pendaftaran SPMB {{ SPMB_TAHUN_AJARAN }} &amp; input manual panitia.</p>
        </div>
      </template>
    </template>

    <div v-if="toastPesan" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-[#101828] px-4 py-3 text-center text-sm text-white shadow-lg">{{ toastPesan }}</div>
  </div>
</template>
