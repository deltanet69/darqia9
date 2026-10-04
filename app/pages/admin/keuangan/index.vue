<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminToast from '~/components/admin/AdminToast.vue'

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
  { label: 'Mei', income: 183_000_000, expense: 151_000_000 },
  { label: 'Jun', income: 198_000_000, expense: 163_000_000 },
  { label: 'Jul', income: 214_000_000, expense: 176_000_000 },
  { label: 'Agu', income: 205_000_000, expense: 169_000_000 },
  { label: 'Sep', income: 226_000_000, expense: 188_000_000 },
  { label: 'Okt', income: 245_000_000, expense: 196_000_000 }
]

const transactionSeeds = [
  ['Pembayaran SPP', 'SPP', 'in', 8_000_000, 'Rina Pratiwi'],
  ['Gaji guru & staf', 'Gaji & Tunjangan', 'out', 38_000_000, 'Budi Santoso'],
  ['Infaq bulanan', 'Infaq', 'in', 3_500_000, 'Siti Khadijah'],
  ['Listrik & air', 'Operasional', 'out', 4_000_000, 'Ahmad Subarjo'],
  ['Dana BOS tahap', 'BOS', 'in', 45_000_000, 'Rina Pratiwi'],
  ['Perbaikan AC ruang', 'Perawatan Gedung', 'out', 2_500_000, 'Budi Santoso'],
  ['Donasi wali murid', 'Donasi', 'in', 5_000_000, 'Siti Khadijah'],
  ['Kegiatan lomba', 'Kegiatan Sekolah', 'out', 3_000_000, 'Ahmad Subarjo'],
  ['Setoran kantin', 'Kantin & Koperasi', 'in', 2_000_000, 'Rina Pratiwi'],
  ['Cetak rapor & ATK', 'ATK & Cetak', 'out', 1_750_000, 'Budi Santoso']
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
  ['VII-A', 1_280_000], ['VII-B', 1_160_000], ['VIII-A', 1_310_000], ['VIII-B', 1_090_000],
  ['IX-A', 1_420_000], ['IX-B', 1_240_000], ['X RPL 1', 1_180_000], ['X RPL 2', 1_060_000],
  ['X TKJ 1', 1_270_000], ['XI RPL 1', 1_150_000], ['XI TKJ 1', 1_210_000], ['XII RPL 1', 1_330_000],
  ['XII TKJ 1', 1_260_000]
] as const
const infaqHistory = [12.8, 14.2, 13.6, 16.1, 17.4, 15.9]

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
const chartMax = Math.max(...months.flatMap(item => [item.income, item.expense]))
const filteredTransactions = computed(() => {
  const keyword = query.value.toLowerCase()
  return transactions.value.filter(item => `${item.description} ${item.category}`.toLowerCase().includes(keyword))
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / perPage)))
const pagedTransactions = computed(() => filteredTransactions.value.slice((page.value - 1) * perPage, page.value * perPage))
const infaqTotal = infaqClasses.reduce((sum, item) => sum + item[1], 0)
const infaqProgress = Math.round(infaqTotal / infaqTarget * 100)

watch([query, filteredTransactions], () => {
  page.value = Math.min(page.value, pageCount.value)
  if (query.value) page.value = 1
})

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
const shortRupiah = (value: number) => `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
const dateId = (value: string) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const showToast = (value: string, kind: 'ok' | 'info' = 'ok') => {
  message.value = value
  messageKind.value = kind
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { message.value = '' }, 2800)
}
const openTransaction = () => {
  Object.assign(form, { kind: 'in', description: '', amount: null })
  modalOpen.value = true
}
const saveTransaction = () => {
  if (!form.description.trim() || !form.amount || form.amount <= 0) {
    showToast('Lengkapi keterangan dan jumlah transaksi.', 'info')
    return
  }
  transactions.value.unshift({
    id: Date.now(),
    date: '2026-10-03',
    description: form.description.trim(),
    category: form.kind === 'in' ? 'Lainnya' : 'Operasional',
    kind: form.kind,
    amount: form.amount,
    author: 'Administrator'
  })
  modalOpen.value = false
  showToast(`Transaksi ${rupiah(form.amount)} dicatat.`)
}

onBeforeUnmount(() => { if (toastTimer) clearTimeout(toastTimer) })
</script>

<template>
  <section>
    <div class="page-head">
      <div><h2>Keuangan Sekolah</h2><p>Kelola arus kas umum & infaq bulanan</p></div>
    </div>

    <div class="toolbar" role="tablist" aria-label="Jenis keuangan">
      <button class="chip" :class="{ on: activeTab === 'cash' }" type="button" @click="activeTab = 'cash'">Arus Kas Umum</button>
      <button class="chip" :class="{ on: activeTab === 'infaq' }" type="button" @click="activeTab = 'infaq'">Infaq Bulanan</button>
    </div>

    <template v-if="activeTab === 'cash'">
      <div class="grid g4 finance-kpis">
        <article class="kpi k-amber"><span class="shine" /><div class="k-top"><span class="k-ic"><AdminIcon name="tup" /></span><span class="k-delta"><AdminIcon name="tup" size="14" /> +8,2% vs bln lalu</span></div><div class="k-val finance-value">{{ shortRupiah(currentMonth.income) }}</div><div class="k-lbl">Pemasukan Bulan Ini</div></article>
        <article class="kpi k-green"><span class="shine" /><div class="k-top"><span class="k-ic"><AdminIcon name="tdn" /></span><span class="k-delta">terkendali</span></div><div class="k-val finance-value">{{ shortRupiah(currentMonth.expense) }}</div><div class="k-lbl">Pengeluaran Bulan Ini</div></article>
        <article class="kpi k-blue"><span class="shine" /><div class="k-top"><span class="k-ic"><AdminIcon name="wallet" /></span><span class="k-delta"><AdminIcon name="tup" size="14" /> sehat</span></div><div class="k-val finance-value">{{ shortRupiah(currentMonth.income - currentMonth.expense) }}</div><div class="k-lbl">Surplus Bulan Ini</div></article>
        <article class="kpi k-violet"><span class="shine" /><div class="k-top"><span class="k-ic"><AdminIcon name="file" /></span><span class="k-delta">{{ transactions.length }} data</span></div><div class="k-val">{{ transactions.length }}</div><div class="k-lbl">Total Transaksi · 40 hari terakhir</div></article>
      </div>

      <article class="card finance-chart-card">
        <div class="card-h"><div><h3>Arus Kas 6 Bulan</h3><div class="sub">Dalam juta rupiah</div></div><div class="legend"><span><i style="background:#16a34a" />Masuk</span><span><i style="background:#f59e0b" />Keluar</span></div></div>
        <div class="card-b"><div class="bar-chart" aria-label="Grafik arus kas enam bulan"><div v-for="item in months" :key="item.label" class="bar-group"><div class="bar-pair"><i class="bar-income" :style="{ height: `${item.income / chartMax * 100}%` }" :title="rupiah(item.income)" /><i class="bar-expense" :style="{ height: `${item.expense / chartMax * 100}%` }" :title="rupiah(item.expense)" /></div><span>{{ item.label }}</span></div></div></div>
      </article>

      <article class="card">
        <div class="card-h"><h3>Riwayat Transaksi</h3><button class="btn btn-primary btn-sm" type="button" @click="openTransaction"><AdminIcon name="plus" size="16" /> Catat Transaksi</button></div>
        <div class="card-b finance-toolbar"><div class="toolbar"><label class="inp"><span class="ic"><AdminIcon name="search" size="17" /></span><input v-model.trim="query" placeholder="Cari keterangan / kategori…" /></label></div></div>
        <div class="tbl-wrap"><table class="tbl rt"><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th style="text-align:right">Jumlah</th><th>Oleh</th></tr></thead><tbody><tr v-for="item in pagedTransactions" :key="item.id"><td data-l="Tanggal">{{ dateId(item.date) }}</td><td data-l="Keterangan" class="t-name">{{ item.description }}</td><td data-l="Kategori"><span class="pill p-gray">{{ item.category }}</span></td><td data-l="Jenis"><span class="pill" :class="item.kind === 'in' ? 'p-green' : 'p-rose'">{{ item.kind === 'in' ? 'Masuk' : 'Keluar' }}</span></td><td data-l="Jumlah" style="text-align:right"><b :style="{ color: item.kind === 'in' ? 'var(--green)' : 'var(--rose)' }">{{ item.kind === 'in' ? '+' : '−' }}{{ rupiah(item.amount) }}</b></td><td data-l="Oleh" class="t-sub">{{ item.author }}</td></tr></tbody></table></div>
        <div class="pager"><span>{{ filteredTransactions.length }} transaksi</span><div class="pg-btns"><button type="button" :disabled="page <= 1" @click="page--">‹</button><button v-for="number in pageCount" :key="number" type="button" :class="{ on: page === number }" @click="page = number">{{ number }}</button><button type="button" :disabled="page >= pageCount" @click="page++">›</button></div></div>
      </article>
    </template>

    <template v-else>
      <article class="card infaq-hero"><div class="card-b"><div class="infaq-head"><div><div class="infaq-label">Infaq Bulanan · September 2026</div><div class="infaq-total">{{ rupiah(infaqTotal) }} <span>/ {{ rupiah(infaqTarget) }}</span></div></div><span class="pill infaq-pill">{{ infaqProgress }}% tercapai</span></div><div class="prog infaq-progress"><i :style="{ width: `${infaqProgress}%` }" /></div><p><AdminIcon name="heart" size="14" /> Dana infaq disalurkan untuk beasiswa & kegiatan keagamaan siswa.</p></div></article>
      <div class="grid g21">
        <article class="card"><div class="card-h"><h3>Tren 6 Bulan</h3></div><div class="card-b"><div class="bar-chart" aria-label="Grafik infaq enam bulan"><div v-for="(value, index) in infaqHistory" :key="months[index].label" class="bar-group"><div class="bar-pair single"><i class="bar-income" :style="{ height: `${value / 18 * 100}%` }" :title="`${value} juta rupiah`" /></div><span>{{ months[index].label }}</span></div></div></div></article>
        <article class="card"><div class="card-h"><div><h3>Distribusi per Kelas</h3><div class="sub">Bulan berjalan</div></div></div><div class="card-b infaq-list"><div v-for="item in infaqClasses" :key="item[0]" class="infaq-row"><div><b>{{ item[0] }}</b><span>{{ rupiah(item[1]) }} · {{ Math.round(item[1] / (infaqTarget / infaqClasses.length) * 100) }}%</span></div><div class="prog"><i :style="{ width: `${Math.min(100, item[1] / (infaqTarget / infaqClasses.length) * 100)}%` }" /></div></div></div></article>
      </div>
    </template>

    <AdminModal :open="modalOpen" title="Catat Transaksi" @close="modalOpen = false">
      <div class="field"><label for="transaction-kind">Jenis</label><div class="inp"><select id="transaction-kind" v-model="form.kind"><option value="in">Pemasukan</option><option value="out">Pengeluaran</option></select></div></div>
      <div class="field"><label for="transaction-description">Keterangan</label><div class="inp"><input id="transaction-description" v-model="form.description" placeholder="cth: Pembayaran SPP X RPL 1" /></div></div>
      <div class="field"><label for="transaction-amount">Jumlah (Rp)</label><div class="inp"><input id="transaction-amount" v-model.number="form.amount" type="number" min="1" placeholder="500000" /></div></div>
      <template #footer><button class="btn btn-ghost btn-sm" type="button" @click="modalOpen = false">Batal</button><button class="btn btn-primary btn-sm" type="button" @click="saveTransaction"><AdminIcon name="check" size="15" /> Simpan</button></template>
    </AdminModal>
    <AdminToast :message="message" :kind="messageKind" />
  </section>
</template>

<style scoped>
.finance-kpis,.finance-chart-card{margin-bottom:18px}.finance-value{font-size:26px}.finance-toolbar{padding-bottom:0}.bar-chart{height:250px;display:flex;align-items:flex-end;gap:18px;padding:16px 8px 0;border-bottom:1px solid var(--line)}.bar-group{height:100%;flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:9px;color:var(--muted);font-size:12px}.bar-pair{height:calc(100% - 28px);width:100%;display:flex;align-items:flex-end;justify-content:center;gap:5px}.bar-pair i{width:min(28px,38%);min-height:3px;border-radius:6px 6px 2px 2px;transition:height .4s ease}.bar-pair.single i{width:min(42px,72%)}.bar-income{background:linear-gradient(#4ade80,#16a34a)}.bar-expense{background:linear-gradient(#fbbf24,#d97706)}.infaq-hero{margin-bottom:18px;background:linear-gradient(135deg,#0a1f44,#1d4ed8);border:0;color:#fff}.infaq-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:12px}.infaq-label,.infaq-hero p{color:#bfdbfe;font-size:13px;font-weight:600}.infaq-total{font-size:32px;font-weight:700}.infaq-total span{font-size:15px;font-weight:500;color:#bfdbfe}.infaq-pill{background:rgba(255,255,255,.16);color:#fff;font-size:14px;padding:9px 18px}.infaq-progress{background:rgba(255,255,255,.18);height:11px}.infaq-progress i{background:linear-gradient(90deg,#4ade80,#22c55e)}.infaq-hero p{display:flex;gap:6px;align-items:center;margin-top:10px}.infaq-list{max-height:300px;overflow-y:auto;padding-top:8px}.infaq-row{margin-bottom:13px}.infaq-row>div:first-child{display:flex;justify-content:space-between;gap:8px;font-size:13px;margin-bottom:5px}.infaq-row span{color:var(--muted);text-align:right}@media(max-width:640px){.finance-value{font-size:21px}.bar-chart{height:210px;gap:8px}.bar-pair{gap:3px}.pager{align-items:flex-start;gap:10px;flex-direction:column}.pg-btns{max-width:100%;overflow-x:auto}.infaq-total{font-size:24px}}
</style>

