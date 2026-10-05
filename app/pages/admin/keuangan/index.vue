<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminToast from '~/components/admin/AdminToast.vue'
import AdminBarChart from '~/components/admin/AdminBarChart.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'

definePageMeta({ layout: 'admin' })

type TransactionKind = 'in' | 'out'
type Transaction = {
  id: number
  date: string
  description: string
  category: string
  kind: TransactionKind
  amount: number
  author: string
}

const months = [
  { label: 'Mei', income: 18.3, expense: 15.1, rawIncome: 183_000_000, rawExpense: 151_000_000 },
  { label: 'Jun', income: 19.8, expense: 16.3, rawIncome: 198_000_000, rawExpense: 163_000_000 },
  { label: 'Jul', income: 21.4, expense: 17.6, rawIncome: 214_000_000, rawExpense: 176_000_000 },
  { label: 'Agu', income: 20.5, expense: 16.9, rawIncome: 205_000_000, rawExpense: 169_000_000 },
  { label: 'Sep', income: 22.6, expense: 18.8, rawIncome: 226_000_000, rawExpense: 188_000_000 },
  { label: 'Okt', income: 24.5, expense: 19.6, rawIncome: 245_000_000, rawExpense: 196_000_000 }
]

const transactionSeeds = [
  ['Pembayaran SPP Siswa', 'SPP', 'in', 8_000_000, 'Rina Pratiwi'],
  ['Gaji Guru & Tenaga Kependidikan', 'Gaji & Tunjangan', 'out', 38_000_000, 'Budi Santoso'],
  ['Infaq Jumat Berkah Siswa', 'Infaq', 'in', 3_500_000, 'Siti Khadijah'],
  ['Tagihan Listrik & Internet Sekolah', 'Operasional', 'out', 4_000_000, 'Ahmad Subarjo'],
  ['Penyaluran Dana BOS Reguler', 'BOS', 'in', 45_000_000, 'Rina Pratiwi'],
  ['Perawatan Lab Komputer & Server CBT', 'Perawatan Gedung', 'out', 2_500_000, 'Budi Santoso'],
  ['Donasi Pengembangan Fasilitas', 'Donasi', 'in', 5_000_000, 'Siti Khadijah'],
  ['Biaya Pembinaan LKS & Ekstrakurikuler', 'Kegiatan Sekolah', 'out', 3_000_000, 'Ahmad Subarjo'],
  ['Setoran Kas Kantin Sekolah', 'Kantin & Koperasi', 'in', 2_000_000, 'Rina Pratiwi'],
  ['Pengadaan Kertas Ujian & ATK', 'ATK & Cetak', 'out', 1_750_000, 'Budi Santoso']
] as const

const transactions = useState<Transaction[]>('admin-finance-transactions', () =>
  Array.from({ length: 44 }, (_, index) => {
    const seed = transactionSeeds[index % transactionSeeds.length]
    const day = 30 - (index % 28)
    const month = index < 31 ? 9 : 8
    return {
      id: index + 1,
      date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      description: seed[0],
      category: seed[1],
      kind: seed[2],
      amount: seed[3] + (index % 4) * 250_000,
      author: seed[4]
    }
  }).sort((a, b) => b.date.localeCompare(a.date))
)

const infaqTarget = 18_000_000
const infaqClasses = [
  ['VII-A', 1_380_000], ['VII-B', 1_160_000], ['VIII-A', 1_410_000], ['VIII-B', 1_190_000],
  ['IX-A', 1_520_000], ['IX-B', 1_240_000], ['X RPL 1', 1_380_000], ['X RPL 2', 1_160_000],
  ['X TKJ 1', 1_370_000], ['XI RPL 1', 1_250_000], ['XI TKJ 1', 1_310_000], ['XII RPL 1', 1_430_000],
  ['XII TKJ 1', 1_360_000]
] as const

const activeTab = ref<'cash' | 'infaq'>('cash')
const query = ref('')
const page = ref(1)
const perPage = 9
const modalOpen = ref(false)
const message = ref('')
const messageKind = ref<'ok' | 'info'>('ok')
const form = reactive<{ kind: TransactionKind; description: string; amount: number | null }>({ kind: 'in', description: '', amount: null })
let toastTimer: ReturnType<typeof setTimeout> | undefined

const currentMonth = months.at(-1)!

const cashflowDatasets = computed(() => [
  { name: 'Masuk', color: '#16a34a', values: months.map(m => m.income) },
  { name: 'Keluar', color: '#f59e0b', values: months.map(m => m.expense) }
])

const infaqHistoryDatasets = computed(() => [
  { name: 'Terkumpul', color: '#16a34a', values: [14.2, 15.6, 16.8, 15.1, 17.2, 17.16] },
  { name: 'Target', color: '#94a3b8', values: [18.0, 18.0, 18.0, 18.0, 18.0, 18.0] }
])

const filteredTransactions = computed(() => {
  const keyword = query.value.toLowerCase()
  return transactions.value.filter(item => `${item.description} ${item.category}`.toLowerCase().includes(keyword))
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / perPage)))
const pagedTransactions = computed(() => filteredTransactions.value.slice((page.value - 1) * perPage, page.value * perPage))
const infaqTotal = infaqClasses.reduce((sum, item) => sum + item[1], 0)
const infaqProgress = Math.min(100, Math.round(infaqTotal / infaqTarget * 100))

watch([query, filteredTransactions], () => {
  page.value = Math.min(page.value, pageCount.value)
  if (query.value) page.value = 1
})

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
const dateId = (value: string) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const showToast = (value: string, kind: 'ok' | 'info' = 'ok') => {
  message.value = value
  messageKind.value = kind
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { message.value = '' }, 2600)
}

const saveTransaction = () => {
  if (!form.description || !form.amount) {
    showToast('Deskripsi dan nominal wajib diisi.', 'info')
    return
  }
  const now = new Date()
  transactions.value.unshift({
    id: transactions.value.length + 1,
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    description: form.description,
    category: form.kind === 'in' ? 'Pemasukan Lain' : 'Operasional',
    kind: form.kind,
    amount: form.amount,
    author: 'Administrator'
  })
  modalOpen.value = false
  form.description = ''
  form.amount = null
  showToast('Transaksi berhasil dicatat ke pembukuan.')
}

onBeforeUnmount(() => { if (toastTimer) clearTimeout(toastTimer) })
</script>

<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Keuangan Sekolah</span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Arus kas, infaq &amp; transaksi &bull; Tahun Ajaran 2026/2027</p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          type="button"
          @click="showToast('Laporan keuangan berhasil disiapkan & diekspor.')"
        >
          <AdminIcon name="dl" size="16" class="text-slate-500" />
          <span>Ekspor Laporan</span>
        </button>
        <button
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          type="button"
          @click="modalOpen = true"
        >
          <AdminIcon name="plus" size="16" />
          <span>Catat Transaksi</span>
        </button>
      </div>
    </div>

    <!-- Segmented Tabs Switcher -->
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm"
        :class="activeTab === 'cash' ? 'bg-[#0A1F44] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-500 hover:text-blue-700'"
        @click="activeTab = 'cash'"
      >
        Arus Kas Umum
      </button>
      <button
        type="button"
        class="px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm"
        :class="activeTab === 'infaq' ? 'bg-[#0A1F44] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-500 hover:text-blue-700'"
        @click="activeTab = 'infaq'"
      >
        Infaq Bulanan
      </button>
    </div>

    <!-- Tab 1: Arus Kas View -->
    <template v-if="activeTab === 'cash'">
      <!-- KPI Metrics Grid with Sweep Shine, Radial Geometry, and Sparklines -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <!-- KPI 1: Pemasukan Bulan Ini (Amber) -->
        <div
          class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#92400E] via-[#D97706] to-[#FBBF24] shadow-[0_14px_30px_-14px_rgba(146,64,14,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(146,64,14,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />
          
          <div class="flex items-center justify-between mb-3 relative z-10">
            <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
              <AdminIcon name="tup" size="22" />
            </span>
            <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
              <AdminIcon name="tup" size="12" />
              <span>+8.2% vs bln lalu</span>
            </span>
          </div>
          <div class="text-2xl sm:text-3xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ rupiah(currentMonth.rawIncome) }}</div>
          <div class="text-xs font-semibold text-amber-100 relative z-10">Pemasukan Bulan Ini</div>
          
          <!-- Sparkline -->
          <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
            <AdminSparkline :values="[18.3, 19.8, 21.4, 20.5, 22.6, 24.5]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
          </div>
        </div>

        <!-- KPI 2: Pengeluaran Bulan Ini (Green) -->
        <div
          class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399] shadow-[0_14px_30px_-14px_rgba(6,95,70,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(6,95,70,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:70ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

          <div class="flex items-center justify-between mb-3 relative z-10">
            <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
              <AdminIcon name="tdn" size="22" />
            </span>
            <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
              <span>terkendali</span>
            </span>
          </div>
          <div class="text-2xl sm:text-3xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ rupiah(currentMonth.rawExpense) }}</div>
          <div class="text-xs font-semibold text-emerald-100 relative z-10">Pengeluaran Bulan Ini</div>
          
          <!-- Sparkline -->
          <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
            <AdminSparkline :values="[15.1, 16.3, 17.6, 16.9, 18.8, 19.6]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
          </div>
        </div>

        <!-- KPI 3: Surplus Bulan Ini (Blue) -->
        <div
          class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] shadow-[0_14px_30px_-14px_rgba(30,64,175,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(30,64,175,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:140ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

          <div class="flex items-center justify-between mb-3 relative z-10">
            <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
              <AdminIcon name="wallet" size="22" />
            </span>
            <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
              <AdminIcon name="tup" size="12" />
              <span>sehat</span>
            </span>
          </div>
          <div class="text-2xl sm:text-3xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ rupiah(currentMonth.rawIncome - currentMonth.rawExpense) }}</div>
          <div class="text-xs font-semibold text-blue-100 relative z-10">Surplus Bulan Ini</div>
          
          <!-- Sparkline -->
          <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
            <AdminSparkline :values="[3.2, 3.5, 3.8, 3.6, 3.8, 4.9]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
          </div>
        </div>

        <!-- KPI 4: Total Transaksi (Violet) -->
        <div
          class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#A78BFA] shadow-[0_14px_30px_-14px_rgba(91,33,182,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(91,33,182,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:210ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
        >
          <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

          <div class="flex items-center justify-between mb-3 relative z-10">
            <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
              <AdminIcon name="file" size="22" />
            </span>
            <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
              <span>{{ transactions.length }} data</span>
            </span>
          </div>
          <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ transactions.length }}</div>
          <div class="text-xs font-semibold text-purple-100 relative z-10">Total Transaksi &bull; 40 hari terakhir</div>
          
          <!-- Sparkline -->
          <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
            <AdminSparkline :values="[30, 32, 36, 38, 41, 44]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
          </div>
        </div>
      </div>

      <!-- Chart: Arus Kas 6 Bulan -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Arus Kas 6 Bulan
            </h3>
            <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Dalam juta rupiah &bull; Pemasukan vs Pengeluaran</div>
          </div>
          <div class="flex items-center gap-4 text-xs font-bold">
            <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#16a34a] inline-block shadow-sm"></i>Masuk</span>
            <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#f59e0b] inline-block shadow-sm"></i>Keluar</span>
          </div>
        </div>

        <div class="py-2">
          <AdminBarChart
            :labels="months.map(m => m.label)"
            :datasets="cashflowDatasets"
          />
        </div>
      </div>

      <!-- Riwayat Transaksi Table Card -->
      <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col justify-between">
        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-emerald-500 before:to-teal-600 before:shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
              Riwayat Transaksi
            </h3>
            <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Seluruh pencatatan kas keluar &amp; masuk</div>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-blue-600 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all">
              <AdminIcon name="search" size="15" class="text-slate-400" />
              <input v-model.trim="query" placeholder="Cari keterangan / kategori…" class="w-48 text-xs font-medium outline-none bg-transparent" />
            </div>
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              @click="modalOpen = true"
            >
              <AdminIcon name="plus" size="15" />
              <span>Catat</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100 text-[11px]">
              <tr>
                <th class="py-3.5 px-5">Tanggal</th>
                <th class="py-3.5 px-5">Keterangan</th>
                <th class="py-3.5 px-5">Kategori</th>
                <th class="py-3.5 px-5">Jenis</th>
                <th class="py-3.5 px-5 text-right">Jumlah</th>
                <th class="py-3.5 px-5">Pencatat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="t in pagedTransactions" :key="t.id" class="hover:bg-blue-50/50 transition-colors">
                <td class="py-3.5 px-5 font-mono font-medium text-slate-500 whitespace-nowrap">{{ dateId(t.date) }}</td>
                <td class="py-3.5 px-5 font-bold text-slate-900">{{ t.description }}</td>
                <td class="py-3.5 px-5">
                  <span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700">
                    {{ t.category }}
                  </span>
                </td>
                <td class="py-3.5 px-5">
                  <span
                    class="px-2.5 py-1 rounded-full text-[10.5px] font-bold inline-flex items-center gap-1.5"
                    :class="t.kind === 'in' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="t.kind === 'in' ? 'bg-emerald-500' : 'bg-rose-500'" />
                    {{ t.kind === 'in' ? 'Masuk' : 'Keluar' }}
                  </span>
                </td>
                <td class="py-3.5 px-5 text-right font-mono font-bold whitespace-nowrap" :class="t.kind === 'in' ? 'text-emerald-600' : 'text-rose-600'">
                  {{ t.kind === 'in' ? '+' : '−' }} {{ rupiah(t.amount) }}
                </td>
                <td class="py-3.5 px-5 text-slate-500 font-medium text-[11.5px]">{{ t.author }}</td>
              </tr>
              <tr v-if="!pagedTransactions.length">
                <td colspan="6" class="py-12 text-center text-xs text-slate-400 font-semibold">
                  Tidak ada transaksi yang cocok dengan filter pencarian.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Menampilkan <b>{{ pagedTransactions.length }}</b> dari <b>{{ filteredTransactions.length }}</b> transaksi</span>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              :disabled="page === 1"
              @click="page--"
            >
              &lsaquo;
            </button>
            <button
              v-for="p in pageCount"
              :key="p"
              type="button"
              class="px-3 py-1 rounded-lg text-xs font-bold border transition-all"
              :class="page === p ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
              @click="page = p"
            >
              {{ p }}
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              :disabled="page === pageCount"
              @click="page++"
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Tab 2: Infaq Bulanan View -->
    <template v-else>
      <!-- Hero Banner Navy Gradient with Progress -->
      <div class="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white bg-gradient-to-br from-[#0A1F44] via-[#0E2C60] to-[#1D4ED8] shadow-[0_16px_36px_-12px_rgba(10,31,68,0.4)] before:content-[''] before:absolute before:w-[320px] before:h-[320px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.15),transparent_70%)] before:-top-[100px] before:-right-[60px]">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div>
            <div class="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Infaq Bulanan &bull; Periode Berjalan 2026</div>
            <div class="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight drop-shadow-md">
              {{ rupiah(infaqTotal) }} <span class="text-base sm:text-lg font-medium text-blue-200">/ {{ rupiah(infaqTarget) }}</span>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-extrabold bg-white/20 border border-white/30 backdrop-blur-md text-white shadow-sm w-fit">
            {{ infaqProgress }}% Tercapai
          </span>
        </div>

        <div class="h-3 rounded-full bg-white/20 overflow-hidden mb-3 relative z-10">
          <i class="block h-full bg-gradient-to-r from-[#4ADE80] to-[#22C55E] rounded-full transition-all duration-700 shadow-sm" :style="{ width: `${infaqProgress}%` }" />
        </div>

        <div class="text-xs text-blue-200 flex items-center gap-2 relative z-10">
          <AdminIcon name="spark" size="14" class="text-blue-300" />
          <span>Dana infaq disalurkan langsung untuk subsidi SPP siswa yatim/dhuafa &amp; kegiatan keagamaan sekolah.</span>
        </div>
      </div>

      <!-- Charts & Distribution Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Infaq Trend Chart -->
        <div class="lg:col-span-7 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-emerald-500 before:to-teal-600 before:shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
                Tren Infaq 6 Bulan
              </h3>
              <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Dalam juta rupiah &bull; Realisasi vs Target (Rp 18 jt)</div>
            </div>
            <div class="flex items-center gap-4 text-xs font-bold">
              <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#16a34a] inline-block shadow-sm"></i>Terkumpul</span>
              <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#94a3b8] inline-block shadow-sm"></i>Target</span>
            </div>
          </div>

          <div class="py-2">
            <AdminBarChart
              :labels="['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt']"
              :datasets="infaqHistoryDatasets"
            />
          </div>
        </div>

        <!-- Infaq per Class Distribution -->
        <div class="lg:col-span-5 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
          <div class="pb-3 border-b border-slate-100 mb-3">
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Distribusi per Kelas
            </h3>
            <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Capaian infaq 13 kelas bulan berjalan</div>
          </div>

          <div class="divide-y divide-slate-100 max-h-[360px] overflow-y-auto space-y-3 pr-1">
            <div v-for="c in infaqClasses" :key="c[0]" class="pt-3 space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <b class="font-bold text-slate-900">{{ c[0] }}</b>
                <span class="font-mono text-slate-600 font-bold">{{ rupiah(c[1]) }} <span class="text-[11px] font-normal text-slate-400">({{ Math.round(c[1] / (infaqTarget / 13) * 100) }}%)</span></span>
              </div>
              <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
                <i
                  class="block h-full rounded-full transition-all"
                  :class="c[1] >= (infaqTarget / 13) ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-amber-400 to-orange-500'"
                  :style="{ width: `${Math.min(100, Math.round(c[1] / (infaqTarget / 13) * 100))}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Catat Transaksi Modal -->
    <AdminModal :open="modalOpen" title="Catat Transaksi Keuangan" @close="modalOpen = false">
      <form @submit.prevent="saveTransaction" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Jenis Transaksi</label>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              class="py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="form.kind === 'in' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'"
              @click="form.kind = 'in'"
            >
              <AdminIcon name="tup" size="14" class="text-emerald-600" />
              <span>+ Pemasukan (Masuk)</span>
            </button>
            <button
              type="button"
              class="py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="form.kind === 'out' ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'"
              @click="form.kind = 'out'"
            >
              <AdminIcon name="tdn" size="14" class="text-rose-600" />
              <span>− Pengeluaran (Keluar)</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Keterangan / Uraian</label>
          <input
            v-model="form.description"
            placeholder="cth: Pembayaran SPP X RPL 1"
            class="w-full px-4 py-3 text-xs bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)] outline-none transition"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Jumlah Nominal (Rp)</label>
          <input
            v-model.number="form.amount"
            type="number"
            placeholder="cth: 500000"
            class="w-full px-4 py-3 text-xs font-mono bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)] outline-none transition"
          />
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          @click="modalOpen = false"
        >
          Batal
        </button>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          @click="saveTransaction"
        >
          Simpan Transaksi
        </button>
      </template>
    </AdminModal>

    <!-- Toast -->
    <AdminToast :message="message" :kind="messageKind" />
  </div>
</template>
