<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAdminGrade } from '~/composables/useAdminGrade'
import { useKeuangan } from '~/composables/useKeuangan'
import {
  LABEL_TINGKAT, inisialNama, nomorHalaman, persenTeks, potongHalaman, rekapPerKelas, rp, saringSiswa
} from '~/composables/keuanganCore'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import KeuanganKode from './KeuanganKode.vue'
import KeuanganCutoff from './KeuanganCutoff.vue'
import KeuanganRiwayat from './KeuanganRiwayat.vue'

const emit = defineEmits<{ buka: [nis: string] }>()

const grade = useAdminGrade()
const router = useRouter()
const K = useKeuangan()
const tab = ref<'overview' | 'data' | 'kode' | 'cutoff' | 'riwayat'>('overview')

// Submenu TABS: Senada dan identik 1:1 dengan standar Manajemen CBT, Absensi, & AdminV2
const TABS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'data', label: 'Data Keuangan', icon: 'users' },
  { id: 'kode', label: 'Kode Keuangan', icon: 'layers' },
  { id: 'cutoff', label: 'Cut-off Harian', icon: 'clock' },
  { id: 'riwayat', label: 'Riwayat Pembayaran', icon: 'file-text' }
] as const

const cariCepat = ref('')
const cari = ref('')
const fKelas = ref('')
const fStatus = ref('')
const urut = ref('sisa')
const pasangNis = ref('')
const pasangKode = ref('')
const notif = ref('')
const halaman = ref(1)
const perHalaman = ref(25)

onMounted(() => K.muatSemua(grade.value))
watch(grade, g => K.muatSemua(g))

const baris = computed(() => K.barisSiswa(grade.value))
const paketGrade = computed(() => K.state.value.paket.filter(p => p.grade === grade.value))
const totalSemua = computed(() => baris.value.reduce((a, s) => ({
  tagihan: a.tagihan + s.hitung.total,
  bayar: a.bayar + s.hitung.bayar,
  totalBayar: a.totalBayar + s.hitung.totalBayar,
  saldo: a.saldo + s.hitung.saldo,
  sisa: a.sisa + s.hitung.sisa
}), { tagihan: 0, bayar: 0, totalBayar: 0, saldo: 0, sisa: 0 }))

const persenRealisasi = computed(() => {
  if (!totalSemua.value.tagihan) return '0%'
  return persenTeks((totalSemua.value.totalBayar / totalSemua.value.tagihan) * 100)
})

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
const hal = computed(() => potongHalaman(daftarTampil.value, halaman.value, perHalaman.value))
watch([cari, fKelas, fStatus, urut, grade, perHalaman], () => { halaman.value = 1 })
const kelasList = computed(() => [...new Set(baris.value.map(s => s.kelas))].sort())

const hasilCepat = computed(() => {
  const q = cariCepat.value.trim().toLowerCase()
  if (q.length < 2) return []
const tabTerlihat = useRbac().jagaSubmenu('Keuangan Sekolah', TABS, tab)
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

const namaSekolah = computed(() => grade.value === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam')

defineExpose({ judulHalaman })
</script>

<template>
  <div class="space-y-5">
    <!-- Header Halaman & Tombol Aksi Utama -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-[10.5px] font-extrabold uppercase tracking-widest text-[#1B5FD9] bg-[#E8F0FE] px-2.5 py-0.5 rounded-md border border-[#D0E2FF]">
            PORTAL KEUANGAN &middot; V2
          </span>
          <span
            class="text-[10.5px] font-extrabold rounded-md px-2.5 py-0.5 border"
            :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D] border-emerald-200' : 'bg-[#E8F0FE] text-[#0A2A5C] border-blue-200'"
          >
            {{ grade === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT BCA' }}
          </span>
        </div>
        <h1 class="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
          {{ judulHalaman }}
        </h1>
        <p class="mt-1 text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-3xl font-medium">
          Tagihan flat per Kode Keuangan berdasarkan tahun masuk &middot; NIS adalah ID pembayaran resmi siswa sampai lulus.
        </p>
      </div>

      <div class="shrink-0">
        <button
          type="button"
          @click="router.push('/adminV2/keuangan/pembayaran')"
          class="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#1B5FD9] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(27,95,217,0.25)] hover:bg-[#154cb0] active:scale-[0.98] transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Input Pembayaran</span>
        </button>
      </div>
    </div>

    <!-- Peringatan Mode Contoh Lokal jika Supabase belum dimigrasi -->
    <div v-if="K.lokal.value" class="rounded-2xl border border-amber-300 bg-amber-50/90 p-3.5 sm:p-4 text-[12.5px] text-amber-900 shadow-2xs">
      <div class="flex items-start gap-2.5">
        <span class="text-amber-600 mt-0.5 shrink-0">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
        <div>
          <b>Mode contoh lokal aktif.</b> Migrasi <b>0026_keuangan.sql</b> belum dijalankan di Supabase. Halaman menampilkan data contoh terstruktur agar alur dan desain dapat diuji secara penuh.
        </div>
      </div>
    </div>
    <div v-else-if="K.state.value.keadaan === 'galat'" class="rounded-2xl border border-red-200 bg-red-50 p-3.5 sm:p-4 text-[12.5px] text-red-700 shadow-2xs">
      Data keuangan gagal dimuat. {{ K.pesanGalat.value }}
    </div>

    <!-- SUBMENU NAVIGATION BAR: Identik 1:1 Styling Standar AdminV2 (CBT, Absensi, Sistem) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="w-full sm:w-auto overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav
          class="inline-flex items-center gap-1 bg-[#EFF2F7] border border-[#E7EBF2] p-1.5 rounded-2xl min-w-max"
          role="tablist"
          aria-label="Navigasi Keuangan Sekolah"
        >
          <button
            v-for="t in tabTerlihat"
            :key="t.id"
            type="button"
            role="tab"
            class="inline-flex items-center gap-2 text-[12.5px] px-3.5 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer select-none"
            :class="tab === t.id
              ? 'bg-white text-[#101828] font-bold shadow-[0_1px_4px_rgba(16,24,40,0.12)]'
              : 'text-[#667085] font-semibold hover:text-[#101828]'"
            :aria-selected="tab === t.id"
            @click="tab = t.id"
          >
            <AdminV2Icon
              :name="t.icon"
              :size="15"
              :class="tab === t.id ? (grade === 'SMP' ? 'text-[#16A34A]' : 'text-[#1B5FD9]') : 'text-[#667085]'"
            />
            <span>{{ t.label }}</span>

            <!-- Badge notifikasi jika ada siswa belum ada kode -->
            <span
              v-if="t.id === 'data' && belumKode > 0"
              class="text-[10px] font-extrabold rounded-full px-2 py-0.5 inline-flex items-center"
              :class="tab === 'data' ? 'bg-amber-100 text-amber-800' : 'bg-[#E7EBF2] text-[#475467]'"
            >
              {{ belumKode }} belum diset
            </span>
          </button>
        </nav>
      </div>

      <!-- Indikator Total Siswa di Data Induk -->
      <div class="hidden sm:flex items-center gap-2 text-[12px] font-semibold text-slate-500 shrink-0">
        <span class="inline-block h-2 w-2 rounded-full" :class="grade === 'SMP' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
        <span>{{ baris.length }} siswa {{ grade }} terdaftar di Data Induk</span>
      </div>
    </div>

    <!-- Strip Identitas Jenjang Terintegrasi (Clean & Sleek) -->
    <div class="flex items-center justify-between gap-3 rounded-xl border border-[#E7EBF2] bg-white px-4 py-2.5 text-xs text-slate-600 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div class="flex items-center gap-2 min-w-0">
        <span class="flex h-2 w-2 rounded-full shrink-0" :class="grade === 'SMP' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'" />
        <span class="font-bold text-slate-800 shrink-0">{{ namaSekolah }}</span>
        <span class="text-slate-300">|</span>
        <span class="text-slate-500 truncate">Tahun Ajaran 2026/2027 &middot; Data disinkronkan otomatis dari Data Induk Siswa</span>
      </div>
      <span class="shrink-0 text-[11px] font-semibold text-slate-400 hidden md:inline">
        Ganti jenjang lewat switch SMP/SMK di bilah atas
      </span>
    </div>

    <!-- Floating Toast Notification -->
    <div v-if="notif" class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-[#101828] px-4 py-3 text-[13px] font-medium text-white shadow-xl animate-fade-in">
      {{ notif }}
    </div>

    <!-- ===== TAB 1: OVERVIEW ===== -->
    <template v-if="tab === 'overview'">
      <!-- 4 KARTU KPI FINANSIAL MODERN & BERKELAS (ZERO TEXT CLIPPING, NO RAINBOW BORDERS) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- KPI 1: Total Tagihan (HERO EXECUTIVE BLUE GRADIENT) -->
        <section
          class="rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(27,95,217,0.3)] flex flex-col justify-between text-white transition-all min-h-[155px] relative overflow-hidden"
          :class="grade === 'SMP'
            ? 'bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#14532D]'
            : 'bg-gradient-to-br from-[#1B5FD9] via-[#1651bd] to-[#0A2A5C]'"
        >
          <!-- Watermark Shield Icon -->
          <div class="absolute -right-5 -bottom-5 w-28 h-28 opacity-10 pointer-events-none text-white">
            <AdminV2Icon name="shield" :size="112" />
          </div>

          <div class="relative z-10">
            <div class="flex items-start justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">
                Total Tagihan {{ grade }}
              </span>
              <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <AdminV2Icon name="layers" :size="16" />
              </span>
            </div>
            <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-white mt-1.5 tabular-nums">
              {{ rp(totalSemua.tagihan) }}
            </div>
          </div>

          <div class="relative z-10 pt-2 border-t border-white/15 mt-3 flex items-center justify-between text-xs text-white/80">
            <span class="font-medium">{{ baris.length }} siswa terdaftar</span>
            <span class="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">Konsep Flat</span>
          </div>
        </section>

        <!-- KPI 2: Total Sudah Dibayar (CLEAN WHITE CARD WITH EMERALD ACCENTS) -->
        <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
          <div>
            <div class="flex items-start justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Sudah Dibayar
              </span>
              <span class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#12B76A] shrink-0">
                <AdminV2Icon name="check" :size="16" />
              </span>
            </div>
            <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-emerald-700 mt-1.5 tabular-nums">
              {{ rp(totalSemua.totalBayar) }}
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">Realisasi penerimaan:</span>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold py-0.5 px-2 rounded-full text-[#12B76A] bg-[#E7F8F0]">
              <AdminV2Icon name="check" :size="11" />
              <span>{{ persenRealisasi }}</span>
            </span>
          </div>
        </section>

        <!-- KPI 3: Total Sisa Tagihan (CLEAN WHITE CARD WITH RUBY ACCENTS) -->
        <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
          <div>
            <div class="flex items-start justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Sisa Tagihan
              </span>
              <span class="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#F04438] shrink-0">
                <AdminV2Icon name="clock" :size="16" />
              </span>
            </div>
            <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-rose-700 mt-1.5 tabular-nums">
              {{ rp(totalSemua.sisa) }}
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">Status pelunasan:</span>
            <span class="inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full text-[#B42318] bg-[#FEF3F2]">
              {{ baris.filter(s => s.hitung.sisa > 0).length }} siswa belum lunas
            </span>
          </div>
        </section>

        <!-- KPI 4: Siswa Belum Dipasang Kode (INTERACTIVE WHITE CARD) -->
        <section
          @click="tab = 'data'"
          class="bg-white border rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px] cursor-pointer group"
          :class="belumKode ? 'border-amber-300 hover:border-amber-400' : 'border-[#E7EBF2]'"
        >
          <div>
            <div class="flex items-start justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
                Belum Dipasang Kode
              </span>
              <span class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                <AdminV2Icon name="users" :size="16" />
              </span>
            </div>
            <div class="text-[26px] sm:text-[28px] font-black tracking-tight mt-1.5 tabular-nums" :class="belumKode ? 'text-amber-800' : 'text-slate-900'">
              {{ belumKode }} Siswa
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">Tindakan:</span>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold py-0.5 px-2.5 rounded-full text-amber-900 bg-amber-100 group-hover:bg-amber-200 transition-colors">
              <span>Pasang di Data Keuangan</span>
              <span class="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </span>
          </div>
        </section>
      </div>

      <!-- Quick Search Bar: Cari Siswa untuk Pembayaran (MODERN COMMAND STYLE) -->
      <div class="rounded-2xl border border-[#E7EBF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h3 class="text-[15px] font-bold text-slate-900">Cari Siswa untuk Pembayaran</h3>
            <p class="mt-0.5 text-[12px] text-slate-500 leading-snug">
              Wali murid umumnya hafal NIS anaknya &mdash; ketik NIS atau nama siswa untuk membuka rincian &amp; input pembayaran.
            </p>
          </div>
        </div>

        <div class="relative mt-2.5 max-w-xl">
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </span>
          <input
            v-model="cariCepat"
            placeholder="Contoh: 1130 atau Anisa..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1B5FD9] focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
          >
          <button
            v-if="cariCepat"
            type="button"
            @click="cariCepat = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Hasil Pencarian Cepat Live Dropdown -->
        <div v-if="hasilCepat.length" class="mt-3 max-w-xl divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <button
            v-for="s in hasilCepat"
            :key="s.nis"
            type="button"
            @click="emit('buka', s.nis)"
            class="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-blue-50/50 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold"
                :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
              >
                {{ inisialNama(s.nama) }}
              </span>
              <div class="min-w-0">
                <span class="block truncate text-[13px] font-bold text-slate-900">{{ s.nama }}</span>
                <span class="block text-[11.5px] text-slate-500">
                  NIS {{ s.nis }} &middot; {{ s.kelas }} &middot; Sisa <b class="text-rose-700">{{ rp(s.hitung.sisa) }}</b>
                </span>
              </div>
            </div>
            <span class="shrink-0 text-[12px] font-bold text-[#1B5FD9] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
              Buka Rincian &rarr;
            </span>
          </button>
        </div>
        <p v-else-if="cariCepat.trim().length >= 2" class="mt-2.5 text-[12px] text-slate-500">
          Tidak ditemukan siswa yang cocok dengan kata kunci "{{ cariCepat }}". Periksa kembali NIS atau nama siswa.
        </p>
      </div>

      <!-- Laporan Rekap per Kelas (100% BEBAS HORIZONTAL SCROLL) -->
      <div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2">
          <div>
            <h3 class="text-[16px] font-bold text-slate-900">Laporan Rekap per Kelas</h3>
            <p class="text-[12px] text-slate-500">
              Klik baris kelas untuk melihat siswanya di tab Data Keuangan.
            </p>
          </div>
          <span class="text-[11.5px] font-semibold text-slate-500">
            {{ rekapKelas.length }} Kelas Terdata
          </span>
        </div>

        <!-- Desktop View (>= lg): Tabel Rapi & Proporsional -->
        <div class="hidden lg:block mt-1 overflow-hidden rounded-[20px] border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <table class="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr class="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                <th class="py-3 px-4">Kelas</th>
                <th class="py-3 px-4">Total Tagihan</th>
                <th class="py-3 px-4">Dibayar</th>
                <th class="py-3 px-4">Sisa</th>
                <th class="py-3 px-4 min-w-[150px]">Progress</th>
                <th class="py-3 px-4">Siswa</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="r in rekapKelas"
                :key="r.kelas"
                @click="fKelas = r.kelas; tab = 'data'"
                class="hover:bg-blue-50/40 transition-colors cursor-pointer group"
              >
                <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                  <span class="rounded-lg bg-slate-100 px-2.5 py-1 text-[12px] font-extrabold text-slate-800 border border-slate-200/60 group-hover:border-blue-300">
                    {{ r.kelas }}
                  </span>
                </td>
                <td class="py-3.5 px-4 tabular-nums font-semibold text-slate-800">{{ rp(r.tagihan) }}</td>
                <td class="py-3.5 px-4 tabular-nums font-bold text-emerald-700">{{ rp(r.dibayar) }}</td>
                <td class="py-3.5 px-4 tabular-nums font-bold text-rose-700">{{ rp(r.sisa) }}</td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <div class="h-2 w-24 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="r.tagihan && r.dibayar >= r.tagihan ? 'bg-emerald-600' : 'bg-[#1B5FD9]'"
                        :style="{ width: (r.tagihan ? Math.min(100, r.dibayar / r.tagihan * 100) : 0) + '%' }"
                      />
                    </div>
                    <span class="text-[11.5px] font-semibold text-slate-600 tabular-nums">
                      {{ r.tagihan ? persenTeks(r.dibayar / r.tagihan * 100) : '—' }}
                    </span>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                  {{ r.siswa }} siswa
                </td>
                <td class="py-3.5 px-4 text-right text-[12px] font-bold text-[#1B5FD9] group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
                  Lihat Siswa &rarr;
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile View (< lg): Kartu Kelas Terstruktur (ZERO HORIZONTAL SCROLL) -->
        <div class="block lg:hidden mt-1 space-y-3">
          <div
            v-for="r in rekapKelas"
            :key="r.kelas"
            @click="fKelas = r.kelas; tab = 'data'"
            class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md active:scale-[0.99] transition-all cursor-pointer"
          >
            <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <span class="rounded-lg bg-slate-100 px-2.5 py-1 text-[13px] font-extrabold text-slate-900 border border-slate-200/60">
                  {{ r.kelas }}
                </span>
                <span class="text-[11.5px] font-semibold text-slate-500">
                  {{ r.siswa }} siswa
                </span>
              </div>
              <span class="text-[12px] font-bold text-[#1B5FD9] flex items-center gap-1">
                Lihat &rarr;
              </span>
            </div>

            <!-- Mini Grid 3 Kolom Responsif Finansial -->
            <div class="mt-3 grid grid-cols-3 gap-2 text-center">
              <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block">Tagihan</span>
                <span class="font-bold text-slate-900 tabular-nums text-[12px] block mt-0.5 truncate">{{ rp(r.tagihan) }}</span>
              </div>
              <div class="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span class="text-[9.5px] font-bold uppercase tracking-wider text-emerald-800 block">Dibayar</span>
                <span class="font-bold text-emerald-700 tabular-nums text-[12px] block mt-0.5 truncate">{{ rp(r.dibayar) }}</span>
              </div>
              <div class="p-2 rounded-xl bg-rose-50/70 border border-rose-100">
                <span class="text-[9.5px] font-bold uppercase tracking-wider text-rose-800 block">Sisa</span>
                <span class="font-bold text-rose-700 tabular-nums text-[12px] block mt-0.5 truncate">{{ rp(r.sisa) }}</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-3 flex items-center justify-between text-[11.5px] pt-2 border-t border-slate-100">
              <span class="text-slate-500 font-medium">Progress Pelunasan:</span>
              <span class="font-extrabold text-slate-800 tabular-nums">
                {{ r.tagihan ? persenTeks(r.dibayar / r.tagihan * 100) : '—' }}
              </span>
            </div>
            <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
              <div
                class="h-full rounded-full transition-all"
                :class="r.tagihan && r.dibayar >= r.tagihan ? 'bg-emerald-600' : 'bg-[#1B5FD9]'"
                :style="{ width: (r.tagihan ? Math.min(100, r.dibayar / r.tagihan * 100) : 0) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tagihan per Tingkat & Pembayaran Terakhir (2 Kolom Desktop) -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <!-- Tagihan per Tingkat -->
        <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
          <h3 class="text-[15px] font-bold text-slate-900">Tagihan per Tingkat Pendidikan</h3>
          <p class="text-[12px] text-slate-500 mb-3.5">Distribusi beban biaya dan realisasi pembayaran per angkatan.</p>
          <div class="space-y-3.5">
            <div v-for="t in perTingkat" :key="t.label" class="space-y-1.5">
              <div class="flex items-baseline justify-between gap-2 text-[12.5px]">
                <span class="font-bold text-slate-800">
                  {{ t.label }}
                  <span class="text-slate-400 font-normal">({{ t.siswa }} siswa)</span>
                </span>
                <span class="tabular-nums font-semibold text-slate-700">
                  <b class="text-emerald-700 font-bold">{{ rp(t.bayar) }}</b>
                  <span class="text-slate-400 font-normal"> / </span>
                  {{ rp(t.tagihan) }}
                </span>
              </div>
              <div class="h-2.5 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                <div
                  class="h-full rounded-full bg-[#1B5FD9] transition-all"
                  :style="{ width: (t.tagihan ? Math.min(100, t.bayar / t.tagihan * 100) : 0) + '%' }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Pembayaran Terakhir & Cut-off -->
        <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
          <div class="flex items-center justify-between mb-0.5">
            <h3 class="text-[15px] font-bold text-slate-900">Aktivitas Transaksi Terakhir</h3>
            <button
              type="button"
              @click="tab = 'riwayat'"
              class="text-[12px] font-bold text-[#1B5FD9] hover:underline cursor-pointer"
            >
              Semua Riwayat &rarr;
            </button>
          </div>
          <p class="text-[12px] text-slate-500 mb-2.5">Riwayat pembayaran masuk terkini pada jenjang {{ grade }}.</p>

          <template v-if="K.lokal.value && bayarTerakhir.length">
            <div class="divide-y divide-slate-100">
              <div
                v-for="b in bayarTerakhir"
                :key="b.no"
                @click="emit('buka', b.nis)"
                class="flex items-center justify-between gap-3 py-2.5 hover:bg-slate-50/70 px-1 rounded-lg transition-colors cursor-pointer"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[12.5px] font-extrabold text-[#1B5FD9]">{{ b.no }}</span>
                    <span class="text-[11px] rounded-md bg-slate-100 px-1.5 py-0.2 font-semibold text-slate-600">
                      {{ b.metode }}
                    </span>
                  </div>
                  <span class="block text-[11.5px] text-slate-500 mt-0.5 truncate">
                    {{ b.tanggal }} &middot; {{ b.keterangan }} &middot; NIS {{ b.nis }}
                  </span>
                </div>
                <b class="tabular-nums font-bold text-emerald-700 text-[13.5px] shrink-0">{{ rp(b.nominal) }}</b>
              </div>
            </div>
          </template>
          <p v-else class="text-[12.5px] text-slate-500 py-4">
            Daftar transaksi lengkap terpaginasi dapat dilihat pada tab Riwayat Pembayaran.
          </p>

          <div v-if="cutoffTerakhir" class="mt-3 rounded-xl bg-slate-50 p-3 text-[12px] text-slate-600 border border-slate-200/70">
            Cut-off Terakhir: <b>{{ cutoffTerakhir.dari }} s/d {{ cutoffTerakhir.sampai }}</b> &mdash; dana sebesar <b>{{ rp(cutoffTerakhir.total) }}</b> telah diserahkan ke yayasan.
          </div>
        </div>
      </div>
    </template>

    <!-- ===== TAB 2: DATA KEUANGAN ===== -->
    <template v-else-if="tab === 'data'">
      <!-- 4 KARTU KPI EXECUTIVE DATA KEUANGAN (SESUAI CARD STYLING OVERVIEW) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- KPI 1: Total Siswa (HERO BLUE/GREEN GRADIENT) -->
        <section
          class="rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(27,95,217,0.3)] flex flex-col justify-between text-white transition-all min-h-[155px] relative overflow-hidden"
          :class="grade === 'SMP'
            ? 'bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#14532D]'
            : 'bg-gradient-to-br from-[#1B5FD9] via-[#1651bd] to-[#0A2A5C]'"
        >
          <div class="absolute -right-5 -bottom-5 w-28 h-28 opacity-10 pointer-events-none text-white">
            <AdminV2Icon name="shield" :size="112" />
          </div>

          <div class="relative z-10">
            <div class="flex items-start justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80">
                Total Siswa {{ grade }}
              </span>
              <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <AdminV2Icon name="users" :size="16" />
              </span>
            </div>
            <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-white mt-1.5 tabular-nums">
              {{ baris.length }} Siswa
            </div>
          </div>

          <div class="relative z-10 pt-2 border-t border-white/15 mt-3 flex items-center justify-between text-xs text-white/80">
            <span class="font-medium">Data Induk {{ grade }}</span>
            <span class="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
              {{ baris.filter(s => s.status === 'Aktif').length }} Aktif
            </span>
          </div>
        </section>

        <!-- KPI 2: Siswa Lunas (WHITE CARD WITH EMERALD ACCENT) -->
        <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
          <div>
            <div class="flex items-start justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
                Siswa Lunas
              </span>
              <span class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#12B76A] shrink-0">
                <AdminV2Icon name="check" :size="16" />
              </span>
            </div>
            <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-emerald-700 mt-1.5 tabular-nums">
              {{ baris.filter(s => s.statusBayar === 'Lunas').length }} Siswa
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">Pelunasan 100%:</span>
            <span class="inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full text-[#12B76A] bg-[#E7F8F0]">
              {{ baris.length ? Math.round((baris.filter(s => s.statusBayar === 'Lunas').length / baris.length) * 100) : 0 }}% Lunas
            </span>
          </div>
        </section>

        <!-- KPI 3: Siswa Belum Lunas / Kurang (WHITE CARD WITH ROSE ACCENT) -->
        <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
          <div>
            <div class="flex items-start justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
                Belum Lunas / Kurang
              </span>
              <span class="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#F04438] shrink-0">
                <AdminV2Icon name="clock" :size="16" />
              </span>
            </div>
            <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-[#B42318] mt-1.5 tabular-nums">
              {{ baris.filter(s => s.statusBayar !== 'Lunas').length }} Siswa
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium truncate">Total Sisa: {{ rp(totalSemua.sisa) }}</span>
            <span class="inline-flex items-center text-[11px] font-bold py-0.5 px-2 rounded-full text-rose-700 bg-rose-50 border border-rose-200 shrink-0">
              Menunggak
            </span>
          </div>
        </section>

        <!-- KPI 4: Belum Dipasang Kode (WHITE CARD WITH AMBER ACCENT) -->
        <section class="bg-white border border-[#E7EBF2] rounded-[20px] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md transition-all flex flex-col justify-between min-h-[155px]">
          <div>
            <div class="flex items-start justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
                Belum Pasang Kode
              </span>
              <span class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                <AdminV2Icon name="users" :size="16" />
              </span>
            </div>
            <div class="text-[26px] sm:text-[28px] font-black tracking-tight text-[#B54708] mt-1.5 tabular-nums">
              {{ belumKode }} Siswa
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">Tindakan:</span>
            <span class="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
              Pasang Kode di Bawah &darr;
            </span>
          </div>
        </section>
      </div>

      <!-- Filter Bar Responsif dalam Kontainer Card Mewah -->
      <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-4.5 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5 flex-1 max-w-3xl">
          <div class="relative w-full sm:w-72">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            </span>
            <input
              v-model="cari"
              placeholder="Cari NIS atau Nama Siswa..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#1B5FD9] focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
            >
          </div>
          <select v-model="fKelas" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[12.5px] text-slate-700">
            <option value="">Semua Kelas</option>
            <option v-for="k in kelasList" :key="k" :value="k">{{ k }}</option>
          </select>
          <select v-model="fStatus" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[12.5px] text-slate-700">
            <option value="">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Kurang">Kurang</option>
            <option value="Belum Bayar">Belum Bayar</option>
          </select>
          <select v-model="urut" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[12.5px] text-slate-700">
            <option value="sisa">Urut: Sisa Terbesar</option>
            <option value="progress">Urut: Progress Terendah</option>
            <option value="nama">Urut: Nama A-Z</option>
            <option value="nis">Urut: NIS</option>
          </select>
        </div>

        <span class="text-[12px] font-semibold text-slate-500 shrink-0">
          Total: <b class="text-slate-800">{{ daftarTampil.length }}</b> siswa
        </span>
      </div>

      <!-- Pasang Kode Keuangan Cepat -->
      <div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]">
        <h4 class="text-[13.5px] font-bold text-slate-900 mb-1">Pasang / Ubah Kode Keuangan Siswa</h4>
        <p class="text-[11.5px] text-slate-500 mb-3">Terapkan paket kode biaya ke siswa terdaftar agar nominal master otomatis terhitung.</p>
        <div class="grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-2.5 items-end">
          <div>
            <label class="mb-1 block text-[11.5px] font-medium text-slate-500">Pilih Siswa</label>
            <select v-model="pasangNis" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[12.5px] text-slate-800">
              <option value="">— Pilih Siswa —</option>
              <option v-for="s in baris" :key="s.nis" :value="s.nis">
                {{ s.nis }} — {{ s.nama }} {{ s.kode ? `(Kode: ${s.kode})` : '(Belum ada kode)' }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-[11.5px] font-medium text-slate-500">Pilih Kode Keuangan</label>
            <select v-model="pasangKode" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[12.5px] text-slate-800">
              <option value="">— Pilih Kode Paket —</option>
              <option v-for="p in paketGrade" :key="p.kode" :value="p.kode">
                {{ p.kode }} — {{ p.nama }}
              </option>
            </select>
          </div>
          <button
            type="button"
            :disabled="!pasangNis || !pasangKode"
            @click="simpanPasang"
            class="rounded-xl bg-[#1B5FD9] px-4 py-2 text-[12.5px] font-semibold text-white disabled:opacity-40 hover:bg-[#154cb0] transition-colors cursor-pointer"
          >
            Pasang Kode
          </button>
        </div>
      </div>

      <!-- Informasi Hasil Saring -->
      <p class="text-[12px] text-slate-500">
        Menampilkan <b class="text-slate-800">{{ hal.dari }}–{{ hal.sampai }} dari {{ daftarTampil.length }} data</b> hasil saring (total {{ baris.length }} siswa {{ grade }}).
      </p>

      <!-- TABEL DATA KEUANGAN DESKTOP (>= lg) -->
      <div class="hidden lg:block overflow-hidden rounded-[20px] border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <table class="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr class="bg-slate-50/90 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              <th class="py-3 px-4">Siswa</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Paket Keuangan</th>
              <th class="py-3 px-4">Total Tagihan</th>
              <th class="py-3 px-4">Total Dibayar</th>
              <th class="py-3 px-4">Sisa Tagihan</th>
              <th class="py-3 px-4 min-w-[130px]">Progress</th>
              <th class="py-3 px-4 text-center">Status Bayar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="s in hal.rows"
              :key="s.nis"
              @click="emit('buka', s.nis)"
              class="hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold"
                    :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
                  >
                    {{ inisialNama(s.nama) }}
                  </span>
                  <div class="min-w-0">
                    <span class="block truncate text-[13.5px] font-bold text-slate-900">{{ s.nama }}</span>
                    <span class="block text-[11.5px] text-slate-500">
                      NIS <b :class="grade === 'SMP' ? 'text-[#067647]' : 'text-[#1B5FD9]'">{{ s.nis }}</b> &middot; {{ s.kelas }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span v-if="s.status === 'Lulus'" class="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">Lulus</span>
                <span v-else class="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">Aktif</span>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span v-if="s.kode" class="rounded-md bg-blue-50 px-2 py-0.5 text-[11.5px] font-bold text-[#1B5FD9] border border-blue-200">
                  {{ s.kode }}
                </span>
                <span v-else class="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                  Belum dipasang
                </span>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 tabular-nums">{{ rp(s.hitung.total) }}</td>
              <td class="py-3.5 px-4 whitespace-nowrap font-bold text-emerald-700 tabular-nums">{{ rp(s.hitung.bayar) }}</td>
              <td class="py-3.5 px-4 whitespace-nowrap font-bold text-rose-700 tabular-nums">{{ rp(s.hitung.sisa) }}</td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div class="h-2 w-16 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="s.hitung.persen >= 100 ? 'bg-emerald-600' : 'bg-[#1B5FD9]'"
                      :style="{ width: s.hitung.persen + '%' }"
                    />
                  </div>
                  <span class="text-[11.5px] font-semibold text-slate-600 tabular-nums">{{ persenTeks(s.hitung.persen) }}</span>
                </div>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap text-center">
                <span
                  class="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  :class="s.statusBayar === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : s.statusBayar === 'Kurang' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                >
                  {{ s.statusBayar }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- KARTU SISWA MOBILE (< lg): ZERO HORIZONTAL SCROLL -->
      <div class="block lg:hidden space-y-3">
        <div
          v-for="s in hal.rows"
          :key="s.nis"
          @click="emit('buka', s.nis)"
          class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-md active:scale-[0.99] transition-all cursor-pointer"
        >
          <div class="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100">
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold"
                :class="grade === 'SMP' ? 'bg-[#E7F6ED] text-[#14532D]' : 'bg-[#E8F0FE] text-[#0A2A5C]'"
              >
                {{ inisialNama(s.nama) }}
              </span>
              <div class="min-w-0">
                <h4 class="text-[14px] font-bold text-slate-900 truncate leading-tight">{{ s.nama }}</h4>
                <p class="text-[12px] text-slate-500 mt-0.5">
                  NIS <b :class="grade === 'SMP' ? 'text-[#067647]' : 'text-[#1B5FD9]'">{{ s.nis }}</b> &middot; {{ s.kelas }}
                </p>
              </div>
            </div>

            <span
              class="shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
              :class="s.statusBayar === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : s.statusBayar === 'Kurang' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
            >
              {{ s.statusBayar }}
            </span>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-2 text-center text-[12px]">
            <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-[10px] font-bold uppercase text-slate-500 block">Total</span>
              <span class="font-bold text-slate-900 tabular-nums block mt-0.5 truncate">{{ rp(s.hitung.total) }}</span>
            </div>
            <div class="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span class="text-[10px] font-bold uppercase text-emerald-800 block">Dibayar</span>
              <span class="font-bold text-emerald-700 tabular-nums block mt-0.5 truncate">{{ rp(s.hitung.bayar) }}</span>
            </div>
            <div class="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
              <span class="text-[10px] font-bold uppercase text-rose-800 block">Sisa</span>
              <span class="font-bold text-rose-700 tabular-nums block mt-0.5 truncate">{{ rp(s.hitung.sisa) }}</span>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between text-[11.5px] pt-2 border-t border-slate-100">
            <span class="text-slate-500">
              Paket: <b class="text-[#1B5FD9]">{{ s.kode || 'Belum diset' }}</b>
            </span>
            <span class="font-bold text-slate-700 tabular-nums">{{ persenTeks(s.hitung.persen) }} Terbayar</span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="daftarTampil.length" class="flex flex-wrap items-center justify-between gap-2.5 pt-2">
        <p class="text-[12px] text-slate-500">
          Halaman <b class="text-slate-800">{{ hal.halaman }}</b> dari <b class="text-slate-800">{{ hal.totalHalaman }}</b>
        </p>

        <div class="flex items-center gap-2">
          <select v-model.number="perHalaman" class="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-700">
            <option :value="25">25 / halaman</option>
            <option :value="50">50 / halaman</option>
            <option :value="100">100 / halaman</option>
          </select>

          <div class="flex items-center gap-1">
            <button
              type="button"
              :disabled="hal.halaman <= 1"
              @click="halaman--"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Sebelumnya
            </button>
            <button
              v-for="n in nomorHalaman(hal.halaman, hal.totalHalaman)"
              :key="n"
              type="button"
              @click="halaman = n"
              class="rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors"
              :class="n === hal.halaman ? 'bg-[#1B5FD9] text-white shadow-xs' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
            >
              {{ n }}
            </button>
            <button
              type="button"
              :disabled="hal.halaman >= hal.totalHalaman"
              @click="halaman++"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== TAB 3, 4, 5: KODE, CUTOFF, RIWAYAT ===== -->
    <KeuanganKode v-else-if="tab === 'kode'" />
    <KeuanganCutoff v-else-if="tab === 'cutoff'" />
    <KeuanganRiwayat v-else-if="tab === 'riwayat'" @buka="emit('buka', $event)" />
  </div>
</template>
