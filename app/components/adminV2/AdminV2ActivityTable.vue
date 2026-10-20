<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from './AdminV2Icon.vue'

interface ActivityRow {
  id: string
  name: string
  icon: string
  amount: string
  statusType: 'ok' | 'wait' | 'proc'
  statusLabel: string
  date: string
}

interface Props {
  rows: ActivityRow[]
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'filter-click'): void
  (e: 'view-all'): void
  (e: 'row-click', row: ActivityRow): void
  (e: 'notify', msg: string): void
}>()

const searchQuery = ref('')
const selectedIds = ref<Set<string>>(new Set())

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.rows
  return props.rows.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.name.toLowerCase().includes(q) ||
    r.statusLabel.toLowerCase().includes(q) ||
    r.amount.toLowerCase().includes(q)
  )
})

const isAllSelected = computed(() => {
  return filteredRows.value.length > 0 && filteredRows.value.every(r => selectedIds.value.has(r.id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value.clear()
  } else {
    filteredRows.value.forEach(r => selectedIds.value.add(r.id))
  }
}

const toggleRow = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

const downloadCSV = () => {
  const header = 'ID,Aktivitas,Nominal,Status,Tanggal\n'
  const body = props.rows.map(r => [r.id, r.name, r.amount, r.statusLabel, r.date].join(',')).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'aktivitas-terbaru.csv'
  a.click()
  URL.revokeObjectURL(url)
  emit('notify', 'CSV terunduh')
}
</script>

<template>
  <section class="w-full bg-white border border-[#E7EBF2] rounded-[18px] p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.1)] flex flex-col">
    <!-- Header with Search & Buttons -->
    <div class="flex items-center gap-2.5 mb-3.5 flex-wrap">
      <h3 class="text-[15px] font-extrabold text-[#101828] mr-auto">Aktivitas Terbaru</h3>

      <!-- Search Box -->
      <label class="flex items-center gap-2 border border-[#E7EBF2] rounded-full py-1.5 px-3.5 text-xs text-[#98A2B3] focus-within:border-[#101828] transition min-w-0 flex-1 sm:flex-initial sm:w-60">
        <AdminV2Icon name="search" :size="15" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari aktivitas"
          class="border-none outline-none bg-transparent text-xs w-full text-[#101828] placeholder-[#98A2B3]"
        >
      </label>

      <!-- Filter Button -->
      <button
        type="button"
        class="inline-flex items-center gap-1.5 border border-[#E7EBF2] rounded-full py-1.5 px-3.5 text-xs font-bold text-[#344054] hover:bg-[#EFF2F7] active:scale-95 transition"
        @click="emit('filter-click')"
      >
        <AdminV2Icon name="filter" :size="14" />
        <span>Filter</span>
      </button>

      <!-- CSV Button -->
      <button
        type="button"
        class="inline-flex items-center gap-1.5 border border-[#E7EBF2] rounded-full py-1.5 px-3.5 text-xs font-bold text-[#344054] hover:bg-[#EFF2F7] active:scale-95 transition"
        @click="downloadCSV"
      >
        <AdminV2Icon name="dl" :size="14" />
        <span>CSV</span>
      </button>
    </div>

    <!-- Responsive Table -->
    <div class="overflow-x-auto -mx-[18px] px-[18px]">
      <table class="w-full border-collapse min-w-[640px]">
        <thead>
          <tr class="border-b border-[#E7EBF2]">
            <th class="py-2.5 px-3 text-left w-9">
              <button
                type="button"
                class="w-4 h-4 rounded border flex items-center justify-center transition"
                :class="isAllSelected ? 'bg-[#101828] border-[#101828] text-white' : 'border-[#E7EBF2] bg-white text-transparent'"
                @click="toggleSelectAll"
              >
                <AdminV2Icon name="check" :size="12" />
              </button>
            </th>
            <th class="text-[10.5px] font-bold uppercase tracking-wider text-[#98A2B3] text-left py-2.5 px-3 whitespace-nowrap">ID Transaksi</th>
            <th class="text-[10.5px] font-bold uppercase tracking-wider text-[#98A2B3] text-left py-2.5 px-3 whitespace-nowrap">Aktivitas</th>
            <th class="text-[10.5px] font-bold uppercase tracking-wider text-[#98A2B3] text-left py-2.5 px-3 whitespace-nowrap">Nominal</th>
            <th class="text-[10.5px] font-bold uppercase tracking-wider text-[#98A2B3] text-left py-2.5 px-3 whitespace-nowrap">Status</th>
            <th class="text-[10.5px] font-bold uppercase tracking-wider text-[#98A2B3] text-left py-2.5 px-3 whitespace-nowrap">Tanggal</th>
            <th class="py-2.5 px-3 w-10" />
          </tr>
        </thead>
        <tbody class="divide-y divide-[#EFF2F7]">
          <tr
            v-for="row in filteredRows"
            :key="row.id"
            class="hover:bg-[#F8FAFD] transition"
          >
            <td class="py-3 px-3">
              <button
                type="button"
                class="w-4 h-4 rounded border flex items-center justify-center transition"
                :class="selectedIds.has(row.id) ? 'bg-[#101828] border-[#101828] text-white' : 'border-[#E7EBF2] bg-white text-transparent'"
                @click.stop="toggleRow(row.id)"
              >
                <AdminV2Icon name="check" :size="12" />
              </button>
            </td>
            <td class="py-3 px-3 text-[12.5px] font-bold text-[#344054] whitespace-nowrap">{{ row.id }}</td>
            <td class="py-3 px-3 text-[12.5px] font-semibold text-[#101828] whitespace-nowrap">
              <div class="flex items-center gap-2.5">
                <span class="w-[30px] h-[30px] rounded-[9px] bg-[#EFF2F7] flex items-center justify-center text-[#344054] shrink-0">
                  <AdminV2Icon :name="row.icon" :size="15" />
                </span>
                <span>{{ row.name }}</span>
              </div>
            </td>
            <td class="py-3 px-3 text-[12.5px] font-extrabold text-[#101828] whitespace-nowrap">{{ row.amount }}</td>
            <td class="py-3 px-3 whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1.5 text-[11.5px] font-bold"
                :class="{
                  'text-[#12B76A]': row.statusType === 'ok',
                  'text-[#F79009]': row.statusType === 'wait',
                  'text-[#1B5FD9]': row.statusType === 'proc'
                }"
              >
                <i
                  class="w-1.5 h-1.5 rounded-full"
                  :class="{
                    'bg-[#12B76A]': row.statusType === 'ok',
                    'bg-[#F79009]': row.statusType === 'wait',
                    'bg-[#1B5FD9]': row.statusType === 'proc'
                  }"
                />
                {{ row.statusLabel }}
              </span>
            </td>
            <td class="py-3 px-3 text-xs text-[#667085] whitespace-nowrap">{{ row.date }}</td>
            <td class="py-3 px-3 text-right">
              <button
                type="button"
                class="w-[30px] h-[30px] rounded-lg inline-flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition"
                aria-label="Detail"
                @click.stop="emit('row-click', row)"
              >
                <AdminV2Icon name="dots" :size="15" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0">
            <td colspan="7" class="py-8 text-center text-xs text-[#667085]">
              Tidak ada aktivitas yang sesuai dengan "{{ searchQuery }}"
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Footer -->
    <div class="flex items-center justify-between mt-3 text-xs text-[#667085] pt-1">
      <span>{{ filteredRows.length }} dari {{ rows.length }} transaksi</span>
      <button
        type="button"
        class="text-xs font-bold transition flex items-center gap-1 p-0"
        :class="jenjang === 'smp' ? 'text-[#16A34A] hover:text-[#14532D]' : 'text-[#1B5FD9] hover:text-[#0A2A5C]'"
        @click="emit('view-all')"
      >
        <span>Lihat semua</span>
        <AdminV2Icon name="chev" :size="13" class="-rotate-90" />
      </button>
    </div>
  </section>
</template>
