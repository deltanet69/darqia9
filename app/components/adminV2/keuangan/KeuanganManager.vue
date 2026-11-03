<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import {
  LABEL_TINGKAT, inisialNama, persenTeks, rekapPerKelas, rp, saringSiswa,
  type Grade
} from '~/composables/keuanganCore'
import KeuanganKode from './KeuanganKode.vue'
import KeuanganCutoff from './KeuanganCutoff.vue'
import KeuanganRiwayat from './KeuanganRiwayat.vue'

const emit = defineEmits<{ buka: [nis: string] }>()

const grade = useAdminGrade()
const K = useKeuangan()
const tab = ref<'overview' | 'data' | 'kode' | 'cutoff' | 'riwayat'>('overview')
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'data', label: 'Data Keuangan' },
  { id: 'kode', label: 'Kode Keuangan' },
  { id: 'cutoff', label: 'Cut-off Harian' },
  { id: 'riwayat', label: 'Riwayat Pembayaran' }
] as const

const cariCepat = ref('')
const cari = ref('')
const fKelas = ref('')
const fStatus = ref('')
const urut = ref('sisa')
const pasangNis = ref('')
const pasangKode = ref('')
const notif = ref('')

onMounted(() => K.muatSemua(grade.value))
watch(grade, g => K.muatSemua(g))

const baris = computed(() => K.barisSiswa(grade.value))
const paketGrade = computed(() => K.state.value.paket.filter(p => p.grade === grade.value))
const totalSemua = computed(() => baris.value.reduce((a, s) => ({ tagihan: a.tagihan + s.hitung.total, bayar: a.bayar + s.hitung.bayar, sisa: a.sisa + s.hitung.sisa }), { tagihan: 0, bayar: 0, sisa: 0 }))
const belumKode = computed(() => baris.value.filter(s => !s.kode).length)
const rekapKelas = computed(() => rekapPerKelas(baris.value))
const perTingkat = computed(() => [0, 1, 2, 3].map(t => ({
  label: LABEL_TINGKAT[grade.value][t],
  tagihan: baris.value.reduce((a, s) => a + s.hitung.per[t].total, 0),
  bayar: baris.value.reduce((a, s) => a + s.hitung.per[t].bayar, 0),
  siswa: baris.value.filter(s => s.hitung.per[t].total > 0).length
})))
const bayarTerakhir = computed(() => [...K.state.value.bayarLokal].reverse().slice(0, 5))
const daftarTampil = computed(() => saringSiswa(baris.value, { cari: cari.value, kelas: fKelas.value, status: fStatus.value, urut: urut.value }))
const kelasList = computed(() => [...new Set(baris.value.map(s => s.kelas))].sort())
const hasilCepat = computed(() => {
  const q = cariCepat.value.trim().toLowerCase()
  if (q.length < 3) return []
  return baris.value.filter(s => s.nis.includes(q) || s.nama.toLowerCase().includes(q)).slice(0, 6)
})
const cutoffTerakhir = computed(() => K.state.value.cutoffs.find(c => c.grade === grade.value))

const tampilNotif = (teks: string) => { notif.value = teks; setTimeout(() => { notif.value = '' }, 3200) }
const simpanPasang = async () => {
  const s = baris.value.find(x => x.nis === pasangNis.value)
  if (!s || !pasangKode.value) return
  await K.simpanPenetapan(grade.value, s.nis, pasangKode.value, s.tambahan)
  tampilNotif(`Kode ${pasangKode.value} terpasang ke ${s.nama} (${s.nis}). Tagihannya sekarang dihitung dari paket itu.`)
  pasangNis.value = ''
  pasangKode.value = ''
}
const judulHalaman = computed(() => tab.value === 'data' ? 'Data Keuangan'
  : tab.value === 'kode' ? 'Kode Keuangan'
  : tab.value === 'cutoff' ? 'Cut-off Harian'
  : tab.value === 'riwayat' ? 'Riwayat Pembayaran' : 'Keuangan Sekolah')
defineExpose({ judulHalaman })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-[22px] font-semibold leading-7 text-blue-950">{{ judulHalaman }}</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">Tagihan flat per Kode Keuangan berdasarkan tahun masuk. NIS adalah ID pembayaran resmi siswa sampai lulus.</p>
      </div>
    </div>

    <div v-if="K.lokal.value" class="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
      <b>Mode contoh lokal.</b> Migrasi <b>0026_keuangan.sql</b> belum dijalankan di Supabase, jadi halaman menampilkan data contoh agar bisa diperiksa dulu. Jalankan file migrasi itu di SQL Editor Supabase untuk memakai data siswa asli — halaman otomatis beralih tanpa ubah kode.
    </div>
    <div v-else-if="K.state.value.keadaan === 'galat'" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
      Data keuangan gagal dimuat. {{ K.pesanGalat.value }}
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <button v-for="t in TABS" :key="t.id" type="button" @click="tab = t.id"
        :class="tab === t.id ? 'rounded-full bg-[#101828] px-3.5 py-2 text-[12.5px] font-semibold text-white' : 'rounded-full bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'">
        {{ t.label }}
      </button>
      <span class="ml-auto hidden text-[12.5px] text-slate-500 sm:block">{{ baris.length }} siswa {{ grade }} terdaftar di Data Induk</span>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2.5 rounded-xl border border-[#1B5FD9]/30 bg-[#EAF1FC] px-4 py-3">
      <span class="rounded-md bg-[#1B5FD9] px-2 py-1 text-[10.5px] font-bold tracking-wide text-white">JENJANG AKTIF</span>
      <p class="text-[13px] text-slate-600">Menampilkan keuangan <b class="text-slate-800">{{ grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT BCA' }}</b> — ganti jenjang lewat tombol SMP / SMK di kanan atas.</p>
    </div>

    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{{ notif }}</div>

    <!-- ===== OVERVIEW ===== -->
    <template v-if="tab === 'overview'">
      <div class="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Total Tagihan {{ grade }}</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-slate-900">{{ rp(totalSemua.tagihan) }}</p>
          <p class="text-[12px] text-slate-500">{{ baris.length }} siswa &middot; konsep flat per kode</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Sudah Dibayar</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-[#067647]">{{ rp(totalSemua.bayar) }}</p>
          <p class="text-[12px] text-slate-500">dihitung dari Riwayat Pembayaran</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Sisa Tagihan</p>
          <p class="mt-1 text-[24px] font-semibold leading-8 text-[#B42318]">{{ rp(totalSemua.sisa) }}</p>
          <p class="text-[12px] text-slate-500">{{ baris.filter(s => s.hitung.sisa > 0).length }} siswa belum lunas</p>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[12px] font-medium text-slate-500">Siswa Belum Dipasang Kode</p>
          <p class="mt-1 text-[24px] font-semibold leading-8" :class="belumKode ? 'text-[#B54708]' : 'text-slate-900'">{{ belumKode }}</p>
          <p class="text-[12px] text-slate-500">pasang lewat tab Data Keuangan</p>
        </div>
      </div>

      <div class="mt-3 rounded-xl border border-slate-300 bg-white p-4">
        <p class="text-[14.5px] font-semibold text-slate-800">Cari Siswa untuk Pembayaran</p>
        <p class="mt-0.5 text-[12.5px] text-slate-500">Wali murid umumnya hafal NIS anaknya — ketik NIS atau nama, klik hasilnya untuk membuka rincian &amp; input pembayaran.</p>
        <div class="relative mt-3 max-w-xl">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input v-model="cariCepat" placeholder="Contoh: 2324090134 atau Anisa" class="bg-white w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-[13.5px] outline-none focus:border-[#1B5FD9]">
        </div>
        <div v-if="hasilCepat.length" class="mt-2 max-w-xl divide-y divide-slate-100 rounded-xl border border-slate-200">
          <button v-for="s in hasilCepat" :key="s.nis" type="button" @click="emit('buka', s.nis)" class="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-bold" :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'">{{ inisialNama(s.nama) }}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[13.5px] font-medium text-slate-800">{{ s.nama }}</span>
              <span class="block text-[12px] text-slate-500">NIS {{ s.nis }} &middot; {{ s.kelas }} &middot; Sisa {{ rp(s.hitung.sisa) }}</span>
            </span>
            <span class="text-[12.5px] font-semibold text-[#1B5FD9]">Buka rincian &rarr;</span>
          </button>
        </div>
        <p v-else-if="cariCepat.trim().length >= 3" class="mt-2 text-[12.5px] text-slate-500">Tidak ada siswa yang cocok. Periksa lagi NIS / nama, atau buka tab Data Keuangan.</p>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <p class="text-[15px] font-semibold text-slate-800">Laporan Rekap per Kelas</p>
        <span class="text-[12.5px] text-slate-500">Klik baris kelas untuk melihat siswanya di Data Keuangan.</span>
      </div>
      <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
        <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:150px 1fr 1fr 1fr 170px 110px 120px">
          <span>Kelas</span><span>Total Tagihan</span><span>Dibayar</span><span>Sisa</span><span>Progress</span><span>Siswa</span><span />
        </div>
        <button v-for="r in rekapKelas" :key="r.kelas" type="button" @click="fKelas = r.kelas; tab = 'data'" class="grid w-full grid-cols-2 items-center gap-x-3 gap-y-1 border-t border-slate-200 px-4 py-3 text-left hover:bg-slate-50 lg:grid-cols-[150px_1fr_1fr_1fr_170px_110px_120px]">
          <span class="font-semibold text-slate-800">{{ r.kelas }}</span>
          <span class="tabular-nums">{{ rp(r.tagihan) }}</span>
          <span class="tabular-nums font-semibold text-[#067647]">{{ rp(r.dibayar) }}</span>
          <span class="tabular-nums font-semibold text-[#B42318]">{{ rp(r.sisa) }}</span>
          <span class="flex items-center gap-2"><span class="h-2 w-20 overflow-hidden rounded-full bg-slate-200"><span class="block h-full rounded-full" :class="r.tagihan && r.dibayar >= r.tagihan ? 'bg-[#067647]' : 'bg-[#1B5FD9]'" :style="{ width: (r.tagihan ? Math.min(100, r.dibayar / r.tagihan * 100) : 0) + '%' }" /></span><span class="text-[12px] text-slate-500">{{ r.tagihan ? persenTeks(r.dibayar / r.tagihan * 100) : '—' }}</span></span>
          <span>{{ r.siswa }} siswa</span>
          <span class="text-[12.5px] font-semibold text-[#1B5FD9]">Lihat Siswa &rarr;</span>
        </button>
        <div v-if="!rekapKelas.length" class="px-4 py-8 text-center text-[13px] text-slate-500">Belum ada siswa pada jenjang ini.</div>
      </div>

      <div class="mt-5 grid gap-3 xl:grid-cols-2">
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[14.5px] font-semibold text-slate-800">Tagihan per Tingkat</p>
          <div v-for="t in perTingkat" :key="t.label" class="mt-3">
            <div class="flex items-baseline justify-between gap-2 text-[13px]">
              <span class="font-medium text-slate-700">{{ t.label }} <span class="text-slate-400">({{ t.siswa }} siswa)</span></span>
              <span class="tabular-nums text-slate-500">{{ rp(t.bayar) }} / {{ rp(t.tagihan) }}</span>
            </div>
            <div class="mt-1 h-2 overflow-hidden rounded-full bg-slate-200"><div class="h-full rounded-full bg-[#1B5FD9]" :style="{ width: (t.tagihan ? Math.min(100, t.bayar / t.tagihan * 100) : 0) + '%' }" /></div>
          </div>
        </div>
        <div class="rounded-xl border border-slate-300 bg-white p-4">
          <p class="text-[14.5px] font-semibold text-slate-800">Pembayaran Terakhir</p>
          <template v-if="K.lokal.value && bayarTerakhir.length">
            <div v-for="b in bayarTerakhir" :key="b.no" class="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
              <span class="min-w-0"><span class="block truncate text-[13.5px] font-medium text-slate-800">{{ b.no }}</span><span class="block text-[12px] text-slate-500">{{ b.tanggal }} &middot; {{ b.keterangan }} &middot; {{ b.metode }}</span></span>
              <b class="tabular-nums text-[#067647]">{{ rp(b.nominal) }}</b>
            </div>
          </template>
          <p v-else class="mt-2 text-[13px] text-slate-500">Daftar lengkap ada di tab Riwayat Pembayaran (dimuat terpaginasi dari server agar tetap ringan).</p>
          <p v-if="cutoffTerakhir" class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600">Cut-off terakhir: <b>{{ cutoffTerakhir.dari }} s/d {{ cutoffTerakhir.sampai }}</b> — dana sebesar <b>{{ rp(cutoffTerakhir.total) }}</b> sudah diserahkan dari sekolah ke yayasan.</p>
        </div>
      </div>
    </template>

    <!-- ===== DATA KEUANGAN ===== -->
    <template v-else-if="tab === 'data'">
      <div class="mt-5 flex flex-wrap items-center gap-2">
        <div class="relative w-full max-w-xs">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input v-model="cari" placeholder="Cari NIS atau Nama Siswa..." class="bg-white w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-[13px] outline-none focus:border-[#1B5FD9]">
        </div>
        <select v-model="fKelas" class="bg-white rounded-lg border border-slate-300 px-2.5 py-2.5 text-[12.5px] text-slate-600"><option value="">Semua Kelas</option><option v-for="k in kelasList" :key="k" :value="k">{{ k }}</option></select>
        <select v-model="fStatus" class="bg-white rounded-lg border border-slate-300 px-2.5 py-2.5 text-[12.5px] text-slate-600"><option value="">Semua Status</option><option>Lunas</option><option>Kurang</option><option>Belum Bayar</option></select>
        <select v-model="urut" class="bg-white rounded-lg border border-slate-300 px-2.5 py-2.5 text-[12.5px] text-slate-600"><option value="sisa">Urut: Sisa Terbesar</option><option value="progress">Urut: Progress Terendah</option><option value="nama">Urut: Nama A-Z</option><option value="nis">Urut: NIS</option></select>
      </div>
      <div class="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-slate-300 bg-white p-4">
        <div class="min-w-[220px] flex-1">
          <label class="mb-1 block text-[12px] font-medium text-slate-500">Pasang Kode Keuangan — pilih siswa</label>
          <select v-model="pasangNis" class="bg-white w-full rounded-lg border border-slate-300 px-2.5 py-2.5 text-[13px]"><option value="">— pilih siswa —</option><option v-for="s in baris" :key="s.nis" :value="s.nis">{{ s.nis }} — {{ s.nama }}{{ s.kode ? ` (kode saat ini: ${s.kode})` : ' (belum ada kode)' }}</option></select>
        </div>
        <div class="min-w-[180px]">
          <label class="mb-1 block text-[12px] font-medium text-slate-500">Kode Keuangan</label>
          <select v-model="pasangKode" class="bg-white w-full rounded-lg border border-slate-300 px-2.5 py-2.5 text-[13px]"><option value="">— pilih kode —</option><option v-for="p in paketGrade" :key="p.kode" :value="p.kode">{{ p.kode }} — {{ p.nama }}</option></select>
        </div>
        <button type="button" :disabled="!pasangNis || !pasangKode" @click="simpanPasang" class="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-40">Pasang Kode</button>
      </div>
      <p class="mt-3 text-[12.5px] text-slate-500">Menampilkan <b class="text-slate-700">{{ daftarTampil.length }} dari {{ baris.length }} data</b> keuangan siswa {{ grade }}. Data siswa berasal dari <b>Data Induk</b>; di sini petugas hanya memasang Kode Keuangan, tidak membuat siswa baru.</p>
      <div class="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white">
        <div class="hidden bg-slate-100 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 lg:grid" style="grid-template-columns:250px 105px 150px 1fr 1fr 1fr 130px 105px">
          <span>Siswa</span><span>Status</span><span>Paket</span><span>Total Tagihan</span><span>Dibayar</span><span>Sisa</span><span>Progress</span><span>Status Bayar</span>
        </div>
        <button v-for="s in daftarTampil" :key="s.nis" type="button" @click="emit('buka', s.nis)" class="grid w-full grid-cols-2 items-center gap-x-3 gap-y-1.5 border-t border-slate-200 px-4 py-3 text-left hover:bg-slate-50 lg:grid-cols-[250px_105px_150px_1fr_1fr_1fr_130px_105px]">
          <span class="col-span-2 flex min-w-0 items-center gap-3 lg:col-span-1">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold" :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'">{{ inisialNama(s.nama) }}</span>
            <span class="min-w-0"><b class="block truncate text-[13.5px] font-semibold text-slate-800">{{ s.nama }}</b><span class="block text-[12px] text-slate-500"><span class="font-semibold" :class="grade === 'SMP' ? 'text-[#067647]' : 'text-[#1B5FD9]'">NIS {{ s.nis }}</span> &middot; {{ s.kelas }}</span></span>
          </span>
          <span><span v-if="s.status === 'Lulus'" class="rounded bg-[#FEF3F2] px-2 py-1 text-[11px] font-semibold text-[#B42318]">Lulus</span><span v-else class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Aktif</span></span>
          <span class="text-[13px]"><template v-if="s.kode"><b class="font-semibold text-[#1B5FD9]">{{ s.kode }}</b><br><span class="text-[12px] text-slate-500">Masuk {{ s.angkatan }}</span></template><span v-else class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Belum dipasang</span></span>
          <span class="tabular-nums">{{ rp(s.hitung.total) }}</span>
          <span class="tabular-nums font-semibold text-[#067647]">{{ rp(s.hitung.bayar) }}</span>
          <span class="tabular-nums font-semibold text-[#B42318]">{{ rp(s.hitung.sisa) }}</span>
          <span class="flex items-center gap-2"><span class="h-2 w-16 overflow-hidden rounded-full bg-slate-200"><span class="block h-full rounded-full" :class="s.hitung.persen >= 100 ? 'bg-[#067647]' : 'bg-[#1B5FD9]'" :style="{ width: s.hitung.persen + '%' }" /></span><span class="text-[12px] text-slate-500">{{ persenTeks(s.hitung.persen) }}</span></span>
          <span><span v-if="s.statusBayar === 'Lunas'" class="rounded bg-[#ECFDF3] px-2 py-1 text-[11px] font-semibold text-[#067647]">Lunas</span><span v-else-if="s.statusBayar === 'Kurang'" class="rounded bg-[#FFFAEB] px-2 py-1 text-[11px] font-semibold text-[#B54708]">Kurang</span><span v-else class="rounded bg-[#FEF3F2] px-2 py-1 text-[11px] font-semibold text-[#B42318]">Belum Bayar</span></span>
        </button>
        <div v-if="!daftarTampil.length" class="px-4 py-10 text-center"><b class="text-[14px] text-slate-700">Tidak ada siswa yang cocok</b><p class="mt-1 text-[13px] text-slate-500">Ubah pencarian atau filter untuk melihat siswa lain.</p></div>
      </div>
      <p class="mt-3 text-[12.5px] text-slate-500">Klik baris siswa untuk membuka rincian tagihan lengkapnya.</p>
    </template>

    <KeuanganKode v-else-if="tab === 'kode'" />
    <KeuanganCutoff v-else-if="tab === 'cutoff'" />
    <KeuanganRiwayat v-else-if="tab === 'riwayat'" @buka="emit('buka', $event)" />
  </div>
</template>
