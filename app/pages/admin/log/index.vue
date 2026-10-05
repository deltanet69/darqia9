<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'
import { useAdminSystemStore } from '~/composables/useAdminSystemStore'

definePageMeta({ layout: 'admin', name: 'admin-log' })
useHead({ title: 'Log Aktivitas | Admin Portal' })

const store = useAdminSystemStore()

const filterQ = ref('')
const filterModul = ref('all')

const uniqueModules = computed(() => {
  const mods = new Set(store.logs.value.map(l => l.modul))
  return Array.from(mods).sort()
})

const filteredLogs = computed(() => {
  let list = store.logs.value

  if (filterModul.value !== 'all') {
    list = list.filter(l => l.modul === filterModul.value)
  }

  if (filterQ.value) {
    const q = filterQ.value.toLowerCase()
    list = list.filter(l => (l.nama + ' ' + l.aksi).toLowerCase().includes(q))
  }

  return list
})

const todayLogsCount = computed(() => store.logs.value.length)

const modulClass = (modul: string) => {
  const mCls: Record<string, string> = {
    Absensi: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    Keuangan: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    Nilai: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    CBT: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    Pengguna: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    RBAC: 'bg-cyan-50 text-cyan-700 border border-cyan-200/80',
    'Konten Web': 'bg-blue-50 text-blue-700 border border-blue-200/80',
    Tabungan: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    Kelas: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    Laporan: 'bg-slate-100 text-slate-700 border border-slate-200/80'
  }
  return mCls[modul] || 'bg-slate-100 text-slate-700 border border-slate-200/80'
}

// Utils
const H = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0; return h; }
const getAvatarStyle = (nama: string) => {
  const hue = Math.abs(H(nama)) % 360;
  return { background: `hsl(${hue}, 65%, 90%)`, color: `hsl(${hue}, 70%, 35%)` }
}
const getInitials = (nama: string) => {
  const parts = nama.split(' ')
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase()
}

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr)
  const sec = Math.floor((new Date().getTime() - d.getTime()) / 1000)
  if (sec < 60) return 'Baru saja'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} mnt lalu`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} jam lalu`
  const dDay = Math.floor(hr / 24)
  if (dDay === 1) return 'Kemarin'
  return `${dDay} hari lalu`
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const exportLog = () => {
  const rows = filteredLogs.value.map(l => `"${l.waktu}","${l.nama}","${l.role}","${l.aksi}","${l.modul}"`)
  const blob = new Blob([`"Waktu","Nama","Peran","Aksi","Modul"\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'log-aktivitas-darqia9.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="space-y-6">
    <!-- Page Head -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Log Aktivitas</h2>
        <p class="text-sm text-slate-500 mt-1">Jejak audit sistem &mdash; siapa melakukan apa, kapan, dan di modul mana</p>
      </div>
      <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-150" type="button" @click="exportLog">
        <AdminIcon name="dl" size="16" class="text-slate-500" /> Ekspor Log CSV
      </button>
    </div>

    <!-- KPI Gradient Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Total Aktivitas (k-blue) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#60a5fa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="shield" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            Audit Trail
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ store.logs.length }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Total Log Tercatat</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[14, 20, 28, 35, 42, 50]" color="#ffffff" />
        </div>
      </div>

      <!-- Hari Ini (k-green) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#065f46] via-[#059669] to-[#34d399] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="calendar" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            Realtime
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">{{ todayLogsCount }}</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Aktivitas Hari Ini</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[8, 12, 16, 22, 28, 32]" color="#ffffff" />
        </div>
      </div>

      <!-- Modul Teraktif (k-violet) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#a78bfa] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="book" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            {{ uniqueModules.length }} Modul
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">Absensi</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Modul Paling Sering Diakses</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[12, 18, 25, 30, 36, 44]" color="#ffffff" />
        </div>
      </div>

      <!-- Administrator (k-amber) -->
      <div class="relative overflow-hidden rounded-[20px] p-5 text-white cursor-pointer bg-gradient-to-br from-[#92400e] via-[#d97706] to-[#fbbf24] shadow-[0_14px_30px_-14px_rgba(2,8,23,0.45)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_22px_42px_-14px_rgba(2,8,23,0.5)] transition-all duration-300 group before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:h-52 before:w-52 before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] after:pointer-events-none after:absolute after:-bottom-16 after:-left-10 after:h-32 after:w-32 after:rounded-full after:border-[24px] after:border-white/10">
        <div class="pointer-events-none absolute bottom-0 top-0 -left-24 w-20 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 ease-out group-hover:left-[140%]" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center">
            <AdminIcon name="users" size="22" class="text-white" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
            100% Aman
          </span>
        </div>
        <div class="relative z-10 text-3xl font-extrabold tracking-tight mt-3.5 mb-1 drop-shadow-sm">0 Insiden</div>
        <div class="relative z-10 text-xs font-medium text-white/85">Integritas Log Sistem Terverifikasi</div>
        <div class="absolute right-3.5 bottom-3 z-10 opacity-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          <AdminSparkline :points="[0, 0, 0, 0, 0, 0]" color="#ffffff" />
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <article class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden">
      <!-- Toolbar Header -->
      <div class="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white/50">
        <div class="flex items-center gap-2.5">
          <h3 class="flex items-center gap-2.5 text-[15px] font-bold text-slate-800 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-violet-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
            Daftar Jejak Aktivitas
          </h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">{{ filteredLogs.length }} aktivitas</span>
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <label class="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex-1 sm:w-64 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <AdminIcon name="search" size="16" class="text-slate-400 shrink-0" />
            <input v-model="filterQ" placeholder="Cari user / aksi..." class="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full" />
          </label>
          <select v-model="filterModul" class="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all">
            <option value="all">Semua Modul</option>
            <option v-for="m in uniqueModules" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
      </div>

      <!-- Activity Stream List -->
      <div class="p-5 divide-y divide-slate-100">
        <div v-if="filteredLogs.length === 0" class="py-14 text-center text-slate-400">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
            <AdminIcon name="shield" size="24" />
          </div>
          <div class="text-sm font-semibold text-slate-600">Tidak ada aktivitas yang cocok</div>
          <div class="text-xs text-slate-400 mt-0.5">Coba sesuaikan kata kunci atau modul filter.</div>
        </div>
        <div
          v-for="(l, index) in filteredLogs.slice(0, 40)"
          :key="index"
          class="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0 hover:bg-blue-50/30 px-3 -mx-3 rounded-xl transition-colors duration-150"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs" :style="getAvatarStyle(l.nama)">
            {{ getInitials(l.nama) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs sm:text-sm text-slate-800 leading-relaxed">
              <b class="font-bold text-slate-900">{{ l.nama }}</b> <span class="text-slate-600">{{ l.aksi }}</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <span class="text-slate-500 font-semibold">{{ l.role }}</span>
              <span>&bull;</span>
              <span>{{ timeAgo(l.waktu) }}</span>
              <span>&bull;</span>
              <span class="font-mono">{{ formatTime(l.waktu) }} WIB</span>
            </div>
          </div>
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shrink-0 shadow-xs" :class="modulClass(l.modul)">
            {{ l.modul }}
          </span>
        </div>
      </div>

      <div class="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <span>Menampilkan <b>{{ Math.min(40, filteredLogs.length) }}</b> dari total {{ filteredLogs.length }} aktivitas</span>
        <span class="font-mono text-[11px] text-slate-400">Sinkronisasi Realtime</span>
      </div>
    </article>
  </section>
</template>

