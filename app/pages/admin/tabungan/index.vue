<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminToast from '~/components/admin/AdminToast.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'

definePageMeta({ layout: 'admin' })

type SavingAccount = { id: number; nis: string; name: string; classroom: string; balance: number }
type SavingTransaction = { id: number; date: string; name: string; classroom: string; kind: 'setor' | 'tarik'; amount: number }

const firstNames = ['Ahmad', 'Siti', 'Muhammad', 'Nabila', 'Rizky', 'Aisyah', 'Fauzan', 'Zahra', 'Farhan', 'Putri']
const lastNames = ['Ramadhan', 'Maulana', 'Pratama', 'Hidayat', 'Nugraha', 'Safitri', 'Kurniawan', 'Permata', 'Hakim']
const classrooms = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B', 'X RPL 1', 'X RPL 2', 'X TKJ 1', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']

const accounts = useState<SavingAccount[]>('admin-saving-accounts', () =>
  Array.from({ length: 90 }, (_, index) => ({
    id: index + 1,
    nis: String(2024001 + index),
    name: `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`,
    classroom: classrooms[index % classrooms.length],
    balance: (5 + ((index * 37) % 246)) * 10_000
  }))
)
const savingTransactions = useState<SavingTransaction[]>('admin-saving-transactions', () =>
  Array.from({ length: 22 }, (_, index) => {
    const student = accounts.value[(index * 7) % accounts.value.length]
    return {
      id: index + 1,
      date: `2026-${index < 12 ? '10' : '09'}-${String(3 - (index % 3) + (index < 12 ? 0 : 24)).padStart(2, '0')}`,
      name: student.name,
      classroom: student.classroom,
      kind: index % 4 === 3 ? 'tarik' : 'setor',
      amount: (2 + ((index * 5) % 29)) * 10_000
    }
  })
)

const query = ref('')
const page = ref(1)
const perPage = 10
const modalOpen = ref(false)
const selectedAccount = ref<SavingAccount | null>(null)
const action = ref<'setor' | 'tarik'>('setor')
const form = reactive<{ amount: number | null }>({ amount: null })
const message = ref('')
const messageKind = ref<'ok' | 'info'>('ok')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const totalBalance = computed(() => accounts.value.reduce((sum, item) => sum + item.balance, 0))
const currentTransactions = computed(() => savingTransactions.value.filter(item => item.date.startsWith('2026-10')))
const monthlyDeposit = computed(() => currentTransactions.value.filter(item => item.kind === 'setor').reduce((sum, item) => sum + item.amount, 0))
const monthlyWithdrawal = computed(() => currentTransactions.value.filter(item => item.kind === 'tarik').reduce((sum, item) => sum + item.amount, 0))
const filteredAccounts = computed(() => accounts.value
  .filter(item => `${item.name} ${item.nis} ${item.classroom}`.toLowerCase().includes(query.value.toLowerCase()))
  .sort((a, b) => b.balance - a.balance))
const pageCount = computed(() => Math.max(1, Math.ceil(filteredAccounts.value.length / perPage)))
const pagedAccounts = computed(() => filteredAccounts.value.slice((page.value - 1) * perPage, page.value * perPage))

watch(query, () => { page.value = 1 })
watch(pageCount, value => { page.value = Math.min(page.value, value) })

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
const initials = (value: string) => value.split(' ').slice(0, 2).map(item => item[0]).join('')
const dateId = (value: string) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const showToast = (value: string, kind: 'ok' | 'info' = 'ok') => {
  message.value = value
  messageKind.value = kind
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { message.value = '' }, 2800)
}
const openTransaction = (account: SavingAccount, kind: 'setor' | 'tarik') => {
  selectedAccount.value = account
  action.value = kind
  form.amount = null
  modalOpen.value = true
}
const saveTransaction = () => {
  const account = selectedAccount.value
  const amount = form.amount
  if (!account || !amount || amount <= 0) {
    showToast('Masukkan jumlah yang valid.', 'info')
    return
  }
  if (action.value === 'tarik' && amount > account.balance) {
    showToast('Saldo tidak mencukupi.', 'info')
    return
  }
  account.balance += action.value === 'setor' ? amount : -amount
  savingTransactions.value.unshift({ id: Date.now(), date: '2026-10-05', name: account.name, classroom: account.classroom, kind: action.value, amount })
  modalOpen.value = false
  showToast(`${action.value === 'setor' ? 'Setoran' : 'Penarikan'} ${rupiah(amount)} berhasil disimpan.`)
}

onBeforeUnmount(() => { if (toastTimer) clearTimeout(toastTimer) })
</script>

<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Tabungan Siswa</span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{{ accounts.length }} penabung aktif &bull; Program tabungan mandiri siswa SMP &amp; SMK</p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          type="button"
          @click="showToast('Buku kas tabungan berhasil diekspor.')"
        >
          <AdminIcon name="dl" size="16" class="text-slate-500" />
          <span>Ekspor Buku Kas</span>
        </button>
      </div>
    </div>

    <!-- KPI Metrics Grid with Sweep Shine, Radial Geometry, and Sparklines -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- KPI 1: Total Saldo (Blue) -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] shadow-[0_14px_30px_-14px_rgba(30,64,175,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(30,64,175,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />
        
        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="piggy" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <span>{{ accounts.length }} rekening</span>
          </span>
        </div>
        <div class="text-2xl sm:text-3xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ rupiah(totalBalance) }}</div>
        <div class="text-xs font-semibold text-blue-100 relative z-10">Total Dana Terkumpul</div>
        
        <!-- Sparkline -->
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[85, 92, 98, 104, 110, 113.8]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>

      <!-- KPI 2: Setoran Bulan Ini (Green) -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399] shadow-[0_14px_30px_-14px_rgba(6,95,70,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(6,95,70,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:70ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="tup" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <span>{{ currentTransactions.filter(t => t.kind === 'setor').length }} transaksi</span>
          </span>
        </div>
        <div class="text-2xl sm:text-3xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ rupiah(monthlyDeposit) }}</div>
        <div class="text-xs font-semibold text-emerald-100 relative z-10">Setoran Bulan Ini</div>
        
        <!-- Sparkline -->
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[10.5, 11.2, 12.0, 13.5, 14.1, 14.5]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>

      <!-- KPI 3: Penarikan Bulan Ini (Amber) -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#92400E] via-[#D97706] to-[#FBBF24] shadow-[0_14px_30px_-14px_rgba(146,64,14,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(146,64,14,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:140ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="tdn" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <span>{{ currentTransactions.filter(t => t.kind === 'tarik').length }} transaksi</span>
          </span>
        </div>
        <div class="text-2xl sm:text-3xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ rupiah(monthlyWithdrawal) }}</div>
        <div class="text-xs font-semibold text-amber-100 relative z-10">Penarikan Bulan Ini</div>
        
        <!-- Sparkline -->
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[3.5, 4.0, 3.8, 4.1, 3.9, 4.2]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>

      <!-- KPI 4: Rata-rata Saldo (Violet) -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#A78BFA] shadow-[0_14px_30px_-14px_rgba(91,33,182,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(91,33,182,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:210ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="spark" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <span>per siswa</span>
          </span>
        </div>
        <div class="text-2xl sm:text-3xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ rupiah(Math.round(totalBalance / accounts.length)) }}</div>
        <div class="text-xs font-semibold text-purple-100 relative z-10">Rata-rata Saldo Tabungan</div>
        
        <!-- Sparkline -->
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[1.0, 1.05, 1.12, 1.18, 1.22, 1.26]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>
    </div>

    <!-- Main Content Area: 2 Columns Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Accounts Table Card -->
      <div class="lg:col-span-8 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col justify-between">
        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
              Rekening Tabungan
            </h3>
            <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Daftar buku tabungan seluruh siswa</div>
          </div>

          <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-blue-600 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all">
            <AdminIcon name="search" size="15" class="text-slate-400" />
            <input v-model.trim="query" placeholder="Cari nama / NIS / kelas…" class="w-44 text-xs font-medium outline-none bg-transparent" />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100 text-[11px]">
              <tr>
                <th class="py-3.5 px-5">Siswa</th>
                <th class="py-3.5 px-5">Kelas</th>
                <th class="py-3.5 px-5 text-right">Saldo</th>
                <th class="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="a in pagedAccounts" :key="a.id" class="hover:bg-blue-50/50 transition-colors">
                <td class="py-3.5 px-5">
                  <div class="flex items-center gap-3">
                    <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {{ initials(a.name) }}
                    </span>
                    <div>
                      <b class="text-slate-900 text-xs block font-bold">{{ a.name }}</b>
                      <span class="text-[11px] text-slate-400 font-mono">NIS {{ a.nis }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-5">
                  <span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700">
                    {{ a.classroom }}
                  </span>
                </td>
                <td class="py-3.5 px-5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">{{ rupiah(a.balance) }}</td>
                <td class="py-3.5 px-5 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                      @click="openTransaction(a, 'setor')"
                    >
                      Setor
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                      @click="openTransaction(a, 'tarik')"
                    >
                      Tarik
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!pagedAccounts.length">
                <td colspan="4" class="py-12 text-center text-xs text-slate-400 font-semibold">
                  Tidak ada rekening yang cocok dengan pencarian.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Menampilkan <b>{{ pagedAccounts.length }}</b> dari <b>{{ filteredAccounts.length }}</b> penabung</span>
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

      <!-- Right: Recent Saving Activity -->
      <div class="lg:col-span-4 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
          <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-emerald-500 before:to-teal-600 before:shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
            Transaksi Terakhir
          </h3>
          <span class="text-[11px] text-slate-400 font-semibold">Realtime</span>
        </div>

        <div class="divide-y divide-slate-100 max-h-[560px] overflow-y-auto space-y-2 pr-1">
          <div
            v-for="st in savingTransactions.slice(0, 14)"
            :key="st.id"
            class="pt-3 flex items-center justify-between gap-3 text-xs group hover:bg-slate-50/60 p-2 rounded-xl transition"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                :class="st.kind === 'setor' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'"
              >
                <AdminIcon :name="st.kind === 'setor' ? 'tup' : 'tdn'" size="16" />
              </span>
              <div class="min-w-0">
                <b class="text-slate-900 block truncate font-bold">{{ st.name }}</b>
                <span class="text-[11px] text-slate-400 font-mono">{{ st.kind === 'setor' ? 'Setoran' : 'Penarikan' }} &bull; {{ dateId(st.date) }}</span>
              </div>
            </div>
            <span
              class="font-mono font-bold shrink-0 text-right"
              :class="st.kind === 'setor' ? 'text-emerald-600' : 'text-amber-600'"
            >
              {{ st.kind === 'setor' ? '+' : '−' }}{{ rupiah(st.amount) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Modal -->
    <AdminModal :open="modalOpen" :title="action === 'setor' ? 'Setor Tabungan Siswa' : 'Tarik Tabungan Siswa'" @close="modalOpen = false">
      <div v-if="selectedAccount" class="space-y-4">
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
          <div class="flex items-center gap-3 mb-2">
            <span class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
              {{ initials(selectedAccount.name) }}
            </span>
            <div>
              <b class="text-slate-900 block text-sm font-bold">{{ selectedAccount.name }}</b>
              <div class="text-slate-500">NIS {{ selectedAccount.nis }} &bull; Kelas {{ selectedAccount.classroom }}</div>
            </div>
          </div>
          <div class="text-slate-700 font-semibold pt-2 border-t border-slate-200 mt-2 flex justify-between items-center">
            <span>Saldo saat ini:</span>
            <b class="font-mono text-blue-700 text-sm">{{ rupiah(selectedAccount.balance) }}</b>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nominal {{ action === 'setor' ? 'Setoran' : 'Penarikan' }} (Rp)</label>
          <input
            v-model.number="form.amount"
            type="number"
            placeholder="cth: 50000"
            class="w-full px-4 py-3 text-sm font-mono bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)] outline-none transition"
          />
        </div>
      </div>

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
          class="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
          :class="action === 'setor' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'"
          @click="saveTransaction"
        >
          Konfirmasi {{ action === 'setor' ? 'Setoran' : 'Penarikan' }}
        </button>
      </template>
    </AdminModal>

    <!-- Toast -->
    <AdminToast :message="message" :kind="messageKind" />
  </div>
</template>
