<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminToast from '~/components/admin/AdminToast.vue'

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
  savingTransactions.value.unshift({ id: Date.now(), date: '2026-10-03', name: account.name, classroom: account.classroom, kind: action.value, amount })
  modalOpen.value = false
  showToast(`${action.value === 'setor' ? 'Setoran' : 'Penarikan'} ${rupiah(amount)} berhasil.`)
}

onBeforeUnmount(() => { if (toastTimer) clearTimeout(toastTimer) })
</script>

<template>
  <section>
    <div class="page-head"><div><h2>Tabungan Siswa</h2><p>{{ accounts.length }} penabung aktif · program menabung sekolah</p></div></div>
    <div class="grid g4 saving-kpis">
      <article class="kpi k-blue"><span class="shine" /><div class="k-top"><span class="k-ic"><AdminIcon name="piggy" /></span><span class="k-delta">{{ accounts.length }} rekening</span></div><div class="k-val saving-value">{{ rupiah(totalBalance) }}</div><div class="k-lbl">Total Dana Terkumpul</div></article>
      <article class="kpi k-green"><span class="shine" /><div class="k-lbl saving-label">Setoran Bulan Ini</div><div class="k-val saving-value">{{ rupiah(monthlyDeposit) }}</div><div class="k-lbl">{{ currentTransactions.filter(item => item.kind === 'setor').length }} transaksi</div></article>
      <article class="kpi k-amber"><span class="shine" /><div class="k-lbl saving-label">Penarikan Bulan Ini</div><div class="k-val saving-value">{{ rupiah(monthlyWithdrawal) }}</div><div class="k-lbl">{{ currentTransactions.filter(item => item.kind === 'tarik').length }} transaksi</div></article>
      <article class="kpi k-violet"><span class="shine" /><div class="k-lbl saving-label">Rata-rata Saldo</div><div class="k-val saving-value">{{ rupiah(totalBalance / accounts.length) }}</div><div class="k-lbl">per siswa</div></article>
    </div>

    <div class="grid g21">
      <article class="card">
        <div class="card-h"><h3>Rekening Tabungan</h3></div>
        <div class="card-b saving-toolbar"><div class="toolbar"><label class="inp"><span class="ic"><AdminIcon name="search" size="17" /></span><input v-model.trim="query" placeholder="Cari nama siswa…" /></label></div></div>
        <div class="tbl-wrap"><table class="tbl rt"><thead><tr><th>Siswa</th><th>Kelas</th><th style="text-align:right">Saldo</th><th style="text-align:right">Aksi</th></tr></thead><tbody><tr v-for="item in pagedAccounts" :key="item.id"><td data-l="Siswa"><div class="row-user"><span class="avatar">{{ initials(item.name) }}</span><div><div class="t-name">{{ item.name }}</div><div class="t-sub">NIS {{ item.nis }}</div></div></div></td><td data-l="Kelas"><span class="pill p-gray">{{ item.classroom }}</span></td><td data-l="Saldo" style="text-align:right"><b>{{ rupiah(item.balance) }}</b></td><td data-l="Aksi" class="tbl-act saving-actions"><button class="btn btn-ghost btn-sm" type="button" @click="openTransaction(item, 'setor')">Setor</button><button class="btn btn-ghost btn-sm" type="button" @click="openTransaction(item, 'tarik')">Tarik</button></td></tr><tr v-if="!pagedAccounts.length"><td colspan="4"><div class="empty">Tidak ada penabung yang cocok.</div></td></tr></tbody></table></div>
        <div class="pager"><span>{{ filteredAccounts.length }} penabung</span><div class="pg-btns"><button type="button" :disabled="page <= 1" @click="page--">‹</button><button v-for="number in pageCount" :key="number" type="button" :class="{ on: page === number }" @click="page = number">{{ number }}</button><button type="button" :disabled="page >= pageCount" @click="page++">›</button></div></div>
      </article>

      <article class="card"><div class="card-h"><h3>Transaksi Terakhir</h3></div><div class="card-b recent-list"><div v-for="item in savingTransactions.slice(0, 14)" :key="item.id" class="recent-item"><span class="recent-icon" :class="item.kind"><AdminIcon :name="item.kind === 'setor' ? 'tup' : 'tdn'" size="16" /></span><div><b>{{ item.name }}</b><span>{{ item.kind === 'setor' ? 'Setoran' : 'Penarikan' }} · {{ dateId(item.date) }}</span></div><strong :class="item.kind">{{ item.kind === 'setor' ? '+' : '−' }}{{ rupiah(item.amount) }}</strong></div></div></article>
    </div>

    <AdminModal :open="modalOpen" :title="action === 'setor' ? 'Setor Tabungan' : 'Tarik Tabungan'" @close="modalOpen = false">
      <div v-if="selectedAccount" class="selected-student"><span class="avatar large">{{ initials(selectedAccount.name) }}</span><div><b>{{ selectedAccount.name }}</b><div>Saldo saat ini: <strong>{{ rupiah(selectedAccount.balance) }}</strong></div></div></div>
      <div class="field"><label for="saving-amount">Jumlah (Rp)</label><div class="inp"><input id="saving-amount" v-model.number="form.amount" type="number" min="1" placeholder="100000" /></div></div>
      <template #footer><button class="btn btn-ghost btn-sm" type="button" @click="modalOpen = false">Batal</button><button class="btn btn-primary btn-sm" type="button" @click="saveTransaction"><AdminIcon name="check" size="15" /> Simpan</button></template>
    </AdminModal>
    <AdminToast :message="message" :kind="messageKind" />
  </section>
</template>

<style scoped>
.saving-kpis{margin-bottom:18px}.saving-value{font-size:26px}.saving-label{font-size:14px;font-weight:700;color:#fff}.saving-toolbar{padding-bottom:0}.saving-actions{display:flex;justify-content:flex-end;gap:6px;white-space:nowrap}.recent-list{padding:8px 20px 16px;max-height:560px;overflow-y:auto}.recent-item{display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid var(--line-2)}.recent-icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex:none}.recent-icon.setor{background:var(--green-bg);color:var(--green)}.recent-icon.tarik{background:var(--amber-bg);color:var(--amber)}.recent-item>div{flex:1;min-width:0}.recent-item b,.recent-item span{display:block}.recent-item b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.recent-item span{font-size:12px;color:var(--muted)}.recent-item strong{font-size:13px;white-space:nowrap}.recent-item strong.setor{color:var(--green)}.recent-item strong.tarik{color:var(--amber)}.selected-student{display:flex;gap:12px;align-items:center;margin-bottom:16px}.selected-student .large{width:48px;height:48px}.selected-student div div{font-size:13px;color:var(--muted)}@media(max-width:640px){.saving-value{font-size:20px}.pager{align-items:flex-start;gap:10px;flex-direction:column}.pg-btns{max-width:100%;overflow-x:auto}}
</style>
