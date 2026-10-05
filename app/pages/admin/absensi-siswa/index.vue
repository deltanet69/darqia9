<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{{ title }}</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{{ subtitle }}</p>
      </div>
      <button
        class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
        type="button"
        @click="exportRecap"
      >
        <AdminIcon name="dl" size="16" />
        <span>Ekspor Rekap</span>
      </button>
    </div>

    <!-- Summary KPI Cards with Gradient, Shine, and Radial Geometry -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <article
        v-for="(item, idx) in summary"
        :key="item.label"
        class="group relative overflow-hidden rounded-3xl p-5 text-white shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-2xl cursor-pointer animate-riseIn before:content-[''] before:absolute before:w-[180px] before:h-[180px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[70px] before:-right-[50px] after:content-[''] after:absolute after:w-[100px] after:h-[100px] after:rounded-full after:pointer-events-none after:border-[20px] after:border-white/10 after:-bottom-[50px] after:-left-[30px]"
        :class="[
          idx === 0 ? 'bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399] shadow-emerald-700/25' :
          idx === 1 ? 'bg-gradient-to-br from-[#92400E] via-[#D97706] to-[#FBBF24] shadow-amber-700/25' :
          idx === 2 ? 'bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] shadow-blue-700/25' :
          'bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#A78BFA] shadow-purple-700/25'
        ]"
        :style="{ animationDelay: `${idx * 70}ms` }"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="text-xs font-bold uppercase tracking-wider text-white/90 relative z-10">{{ item.label }}</div>
        <div class="text-3xl font-black font-mono my-1 relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ item.value }}</div>
        <div class="text-[11px] font-semibold text-white/80 relative z-10">{{ item.note }}</div>
      </article>
    </div>

    <!-- Table Card -->
    <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col">
      <!-- Toolbar -->
      <div class="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <select v-model="selectedDay" class="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-sm">
            <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
          </select>

          <select v-model="school" class="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-sm">
            <option value="Semua">Semua Jenjang</option>
            <option value="SMP">SMP</option>
            <option value="SMK">SMK</option>
          </select>

          <select v-model="classroom" class="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-sm">
            <option value="Semua">Semua Kelas</option>
            <option v-for="item in classrooms" :key="item" :value="item">{{ item }}</option>
          </select>

          <div class="flex-1 min-w-[200px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus-within:border-blue-600 shadow-sm">
            <AdminIcon name="search" size="16" class="text-slate-400" />
            <input v-model.trim="query" placeholder="Cari nama / NIS..." class="w-full text-xs font-medium outline-none bg-transparent" />
          </div>
        </div>

        <!-- Filter Status Chips -->
        <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            v-for="item in statusOptions"
            :key="item.value"
            type="button"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border"
            :class="status === item.value ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600'"
            @click="status = item.value"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <!-- Table View -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100 text-[11px]">
            <tr>
              <th class="py-3 px-4">Siswa</th>
              <th class="py-3 px-4">NIS</th>
              <th class="py-3 px-4">Kelas</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in pagedRows" :key="item.id" class="hover:bg-blue-50/50 transition-colors">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {{ initials(item.name) }}
                  </span>
                  <div>
                    <b class="text-slate-900 text-xs block font-bold">{{ item.name }}</b>
                    <span class="text-[11px] text-slate-400">{{ item.gender }}</span>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 font-mono font-semibold text-slate-700">{{ item.number }}</td>
              <td class="py-3 px-4">
                <span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700">
                  {{ item.classroom }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span
                  class="px-2.5 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5"
                  :class="pillClass(item.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="dotClass(item.status)" />
                  <span>{{ item.status }}</span>
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button
                  class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                  type="button"
                  @click="openDetail(item)"
                >
                  <AdminIcon name="eye" size="14" />
                  <span>Detail</span>
                </button>
              </td>
            </tr>
            <tr v-if="pagedRows.length === 0">
              <td colspan="5" class="py-8 text-center text-slate-400 font-medium">
                Tidak ada data absensi yang sesuai filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500">
        <div>Menampilkan {{ pagedRows.length }} dari {{ filteredRows.length }} data</div>
        <div class="flex items-center gap-1.5">
          <button
            class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
            :disabled="page <= 1"
            @click="page--"
          >
            ‹
          </button>
          <span class="px-2 font-bold text-slate-700">{{ page }} / {{ totalPages }}</span>
          <button
            class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
            :disabled="page >= totalPages"
            @click="page++"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-absensi-siswa'
})

const title = 'Absensi Siswa'
const subtitle = 'Senin, 05 Okt 2026 · Kehadiran peserta didik per kelas'

const selectedDay = ref('Hari Ini')
const days = ['Hari Ini', 'Sabtu, 03 Okt', 'Jumat, 02 Okt', 'Kamis, 01 Okt', 'Rabu, 30 Sep']

const school = ref('Semua')
const classroom = ref('Semua')
const classrooms = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B', 'X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']

const query = ref('')
const status = ref('all')
const statusOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Hadir', value: 'Hadir' },
  { label: 'Izin', value: 'Izin' },
  { label: 'Sakit', value: 'Sakit' },
  { label: 'Alpa', value: 'Alpa' }
]

const summary = [
  { label: 'Hadir Tepat Waktu', value: '484', note: '92.0% dari total siswa' },
  { label: 'Izin / Sakit', value: '28', note: '5.3% dari total siswa' },
  { label: 'Terlambat', value: '6', note: '1.1% dari total siswa' },
  { label: 'Alpa', value: '8', note: '1.5% dari total siswa' }
]

// Mock records
const rawRows = [
  { id: '1', name: 'Ahmad Wijaya', number: '202610101', classroom: 'X RPL 1', status: 'Hadir', gender: 'Laki-laki' },
  { id: '2', name: 'Budi Pratama', number: '202610102', classroom: 'X RPL 1', status: 'Hadir', gender: 'Laki-laki' },
  { id: '3', name: 'Citra Dewi', number: '202610103', classroom: 'X RPL 1', status: 'Izin', gender: 'Perempuan' },
  { id: '4', name: 'Dian Nugraha', number: '202610104', classroom: 'X RPL 2', status: 'Sakit', gender: 'Laki-laki' },
  { id: '5', name: 'Eko Hidayat', number: '202610105', classroom: 'X RPL 2', status: 'Alpa', gender: 'Laki-laki' },
  { id: '6', name: 'Fitri Handayani', number: '202610106', classroom: 'XI RPL 1', status: 'Hadir', gender: 'Perempuan' },
  { id: '7', name: 'Gilang Ramadhan', number: '202610107', classroom: 'XI TKJ 1', status: 'Hadir', gender: 'Laki-laki' },
  { id: '8', name: 'Hana Puspita', number: '202610108', classroom: 'XII RPL 1', status: 'Hadir', gender: 'Perempuan' },
  { id: '9', name: 'Irfan Hakim', number: '202610109', classroom: 'VII-A', status: 'Hadir', gender: 'Laki-laki' },
  { id: '10', name: 'Joko Susanto', number: '202610110', classroom: 'VIII-B', status: 'Alpa', gender: 'Laki-laki' }
]

const filteredRows = computed(() => {
  return rawRows.filter(r => {
    if (status.value !== 'all' && r.status !== status.value) return false
    if (classroom.value !== 'Semua' && r.classroom !== classroom.value) return false
    if (query.value) {
      const q = query.value.toLowerCase()
      return r.name.toLowerCase().includes(q) || r.number.includes(q)
    }
    return true
  })
})

const page = ref(1)
const perPage = 8

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / perPage)))

const pagedRows = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredRows.value.slice(start, start + perPage)
})

const initials = (name: string) => {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const pillClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
    case 'Izin': return 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
    case 'Sakit': return 'bg-blue-500/15 text-blue-700 border border-blue-500/30'
    case 'Alpa': return 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
    default: return 'bg-slate-100 text-slate-600'
  }
}

const dotClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-emerald-500'
    case 'Izin': return 'bg-amber-500'
    case 'Sakit': return 'bg-blue-500'
    case 'Alpa': return 'bg-rose-500'
    default: return 'bg-slate-400'
  }
}

const exportRecap = () => {
  alert('Rekap absensi berhasil diekspor ke format Excel (.xlsx).')
}

const openDetail = (item: any) => {
  alert(`Detail Siswa: ${item.name} (${item.number}) - Kelas ${item.classroom} - Status: ${item.status}`)
}
</script>
