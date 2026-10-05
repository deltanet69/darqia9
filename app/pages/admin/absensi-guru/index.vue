<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{{ title }}</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{{ subtitle }}</p>
      </div>
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
      <div class="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3">
        <select v-model="selectedDay" class="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 shadow-sm">
          <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
        </select>

        <div class="flex-1 min-w-[200px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus-within:border-blue-600 shadow-sm">
          <AdminIcon name="search" size="16" class="text-slate-400" />
          <input v-model.trim="query" placeholder="Cari nama guru..." class="w-full text-xs font-medium outline-none bg-transparent" />
        </div>
      </div>

      <!-- Table View -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100 text-[11px]">
            <tr>
              <th class="py-3 px-4">Guru / Tendik</th>
              <th class="py-3 px-4">NIP</th>
              <th class="py-3 px-4">Mata Pelajaran</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Keterlambatan</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in pagedRows" :key="item.id" class="hover:bg-blue-50/50 transition-colors">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {{ initials(item.name) }}
                  </span>
                  <div>
                    <b class="text-slate-900 text-xs block font-bold">{{ item.name }}</b>
                    <span class="text-[11px] text-slate-400">{{ item.level }}</span>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 font-mono font-semibold text-slate-700">{{ item.nip }}</td>
              <td class="py-3 px-4">
                <span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
                  {{ item.subject }}
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
              <td class="py-3 px-4 font-mono font-bold">
                <span :class="item.delay === '—' ? 'text-slate-400' : 'text-amber-600'">{{ item.delay }}</span>
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
              <td colspan="6" class="py-8 text-center text-slate-400 font-medium">
                Tidak ada data guru yang cocok.
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
  name: 'admin-absensi-guru'
})

const title = 'Absensi Guru'
const subtitle = 'Senin, 05 Okt 2026 · Kehadiran pendidik & tenaga kependidikan'

const selectedDay = ref('Hari Ini')
const days = ['Hari Ini', 'Sabtu, 03 Okt', 'Jumat, 02 Okt', 'Kamis, 01 Okt', 'Rabu, 30 Sep']

const query = ref('')

const summary = [
  { label: 'Hadir Tepat Waktu', value: '38', note: 'dari 42 guru & tendik' },
  { label: 'Terlambat', value: '2', note: 'total 25 menit' },
  { label: 'Izin / Sakit', value: '2', note: '4.8% dari total' },
  { label: 'Tingkat Kehadiran', value: '95.2%', note: 'Stabil minggu ini' }
]

const rawRows = [
  { id: '1', name: 'Drs. H. Ahmad Dahlan', nip: '197508122000031001', subject: 'Pendidikan Agama Islam', status: 'Hadir', delay: '—', level: 'Guru Utama' },
  { id: '2', name: 'Siti Aminah, S.Pd', nip: '198204152008012003', subject: 'Matematika', status: 'Hadir', delay: '—', level: 'Wali Kelas VII-A' },
  { id: '3', name: 'Bambang Supriyanto, M.Kom', nip: '198901202015041002', subject: 'Pemrograman Web', status: 'Terlambat', delay: '15 mnt', level: 'Kaprog RPL' },
  { id: '4', name: 'Rini Astuti, S.Pd', nip: '199105102019032005', subject: 'Bahasa Indonesia', status: 'Hadir', delay: '—', level: 'Guru' },
  { id: '5', name: 'Hendra Gunawan, S.Kom', nip: '198711032014021004', subject: 'Jaringan Komputer', status: 'Izin', delay: '—', level: 'Kaprog TKJ' },
  { id: '6', name: 'Dewi Lestari, S.Pd', nip: '199402182020122008', subject: 'Bahasa Inggris', status: 'Hadir', delay: '—', level: 'Wali Kelas X RPL 1' },
  { id: '7', name: 'Eko Prasetyo, S.Pd', nip: '199009252016081003', subject: 'Pendidikan Jasmani', status: 'Terlambat', delay: '10 mnt', level: 'Guru' },
  { id: '8', name: 'Nurul Hidayati, S.Si', nip: '198807142012012002', subject: 'Ilmu Pengetahuan Alam', status: 'Hadir', delay: '—', level: 'Wali Kelas VIII-B' }
]

const filteredRows = computed(() => {
  if (!query.value) return rawRows
  const q = query.value.toLowerCase()
  return rawRows.filter(r => r.name.toLowerCase().includes(q) || r.nip.includes(q) || r.subject.toLowerCase().includes(q))
})

const page = ref(1)
const perPage = 8

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / perPage)))

const pagedRows = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredRows.value.slice(start, start + perPage)
})

const initials = (name: string) => {
  return name.replace(/^Drs\.\s*|H\.\s*|S\.Pd\s*|M\.Kom\s*|S\.Kom\s*|S\.Si\s*/g, '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const pillClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
    case 'Terlambat': return 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
    case 'Izin': return 'bg-blue-500/15 text-blue-700 border border-blue-500/30'
    case 'Sakit': return 'bg-cyan-500/15 text-cyan-700 border border-cyan-500/30'
    default: return 'bg-slate-100 text-slate-600'
  }
}

const dotClass = (st: string) => {
  switch (st) {
    case 'Hadir': return 'bg-emerald-500'
    case 'Terlambat': return 'bg-amber-500'
    case 'Izin': return 'bg-blue-500'
    case 'Sakit': return 'bg-cyan-500'
    default: return 'bg-slate-400'
  }
}

const openDetail = (item: any) => {
  alert(`Detail Guru: ${item.name} (${item.nip}) - Mapel: ${item.subject} - Status: ${item.status}`)
}
</script>
