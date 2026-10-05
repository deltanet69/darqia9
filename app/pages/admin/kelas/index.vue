<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manajemen Kelas</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{{ classes.length }} kelas &bull; SMP &amp; SMK &bull; Tahun ajaran 2026/2027</p>
      </div>
      <button
        class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
        type="button"
        @click="notice = 'Form tambah kelas tersedia saat backend resmi dimulai.'"
      >
        <AdminIcon name="plus" size="16" />
        <span>Tambah Kelas</span>
      </button>
    </div>

    <!-- Notice -->
    <div v-if="notice" class="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 flex items-center justify-between">
      <span>{{ notice }}</span>
      <button class="text-blue-600 hover:underline" @click="notice = ''">✕</button>
    </div>

    <!-- Class Grid Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <button
        v-for="(item, idx) in classes"
        :key="item.name"
        type="button"
        class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_32px_-6px_rgba(37,99,235,0.12)] hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 text-left flex flex-col justify-between group animate-riseIn"
        :style="{ animationDelay: `${idx * 40}ms` }"
        @click="selected = item"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-4">
            <b class="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{{ item.name }}</b>
            <span
              class="px-2.5 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider"
              :class="item.level === 'SMP' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'"
            >
              {{ item.level }}<template v-if="item.major"> &bull; {{ item.major }}</template>
            </span>
          </div>

          <div class="flex items-center gap-3 mb-5">
            <span class="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white font-black text-xs flex items-center justify-center transition-all duration-300 shadow-sm text-slate-700">
              {{ initials(item.teacher) }}
            </span>
            <div>
              <div class="text-xs font-bold text-slate-900 leading-tight">{{ item.teacher }}</div>
              <div class="text-[11px] text-slate-500 mt-0.5 font-medium">Wali Kelas &bull; {{ item.room }}</div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 bg-slate-50/80 border border-slate-100 p-3 rounded-2xl text-center mb-4">
            <div>
              <b class="text-sm font-black text-slate-900 block font-mono">{{ item.students }}</b>
              <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Siswa</span>
            </div>
            <div>
              <b class="text-sm font-black text-slate-900 block font-mono">{{ item.boys }}/{{ item.girls }}</b>
              <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">L / P</span>
            </div>
            <div>
              <b class="text-sm font-black text-slate-900 block font-mono">{{ item.average }}</b>
              <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Rata²</span>
            </div>
          </div>
        </div>

        <div class="space-y-1.5 pt-2 border-t border-slate-100">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Kehadiran Hari Ini</span>
            <b class="text-slate-900 font-mono">{{ item.attendance }}%</b>
          </div>
          <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
              :style="{ width: `${item.attendance}%` }"
            />
          </div>
        </div>
      </button>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="selected"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      @click.self="selected = null"
    >
      <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-popIn text-slate-900">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-black">{{ selected.name }}</h3>
            <p class="text-xs text-slate-500">{{ selected.level }} &bull; Wali: {{ selected.teacher }}</p>
          </div>
          <button class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500" @click="selected = null">✕</button>
        </div>

        <div class="divide-y divide-slate-100 text-xs font-semibold">
          <div class="flex justify-between py-2.5">
            <span class="text-slate-500">Ruang Kelas</span>
            <span class="font-bold text-slate-900">{{ selected.room }}</span>
          </div>
          <div class="flex justify-between py-2.5">
            <span class="text-slate-500">Total Siswa</span>
            <span class="font-mono font-bold text-slate-900">{{ selected.students }} orang ({{ selected.boys }} L, {{ selected.girls }} P)</span>
          </div>
          <div class="flex justify-between py-2.5">
            <span class="text-slate-500">Tingkat Kehadiran</span>
            <span class="font-mono font-bold text-emerald-600">{{ selected.attendance }}%</span>
          </div>
          <div class="flex justify-between py-2.5">
            <span class="text-slate-500">Nilai Rata-rata</span>
            <span class="font-mono font-bold text-blue-600">{{ selected.average }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3">
          <button class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700" @click="selected = null">Tutup</button>
          <button class="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20" @click="$router.push('/admin/absensi-siswa')">Lihat Absensi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-kelas'
})

const notice = ref('')
const selected = ref<any>(null)

const classes = [
  { name: 'VII-A', level: 'SMP', major: '', room: 'Gedung A &bull; R.101', teacher: 'Siti Aminah, S.Pd', students: 34, boys: 18, girls: 16, attendance: 94, average: 84.2 },
  { name: 'VII-B', level: 'SMP', major: '', room: 'Gedung A &bull; R.102', teacher: 'Rini Astuti, S.Pd', students: 36, boys: 19, girls: 17, attendance: 91, average: 82.8 },
  { name: 'VIII-A', level: 'SMP', major: '', room: 'Gedung A &bull; R.201', teacher: 'Ahmad Fauzi, S.Pd', students: 35, boys: 18, girls: 17, attendance: 95, average: 85.1 },
  { name: 'VIII-B', level: 'SMP', major: '', room: 'Gedung A &bull; R.202', teacher: 'Nurul Hidayati, S.Si', students: 35, boys: 17, girls: 18, attendance: 89, average: 81.5 },
  { name: 'IX-A', level: 'SMP', major: '', room: 'Gedung A &bull; R.301', teacher: 'Drs. H. Dahlan', students: 34, boys: 16, girls: 18, attendance: 96, average: 86.4 },
  { name: 'IX-B', level: 'SMP', major: '', room: 'Gedung A &bull; R.302', teacher: 'Dewi Lestari, S.Pd', students: 36, boys: 20, girls: 16, attendance: 92, average: 83.7 },
  { name: 'X RPL 1', level: 'SMK', major: 'RPL', room: 'Gedung B &bull; Lab 1', teacher: 'Bambang Supriyanto, M.Kom', students: 36, boys: 24, girls: 12, attendance: 94, average: 85.5 },
  { name: 'X RPL 2', level: 'SMK', major: 'RPL', room: 'Gedung B &bull; Lab 2', teacher: 'Eko Prasetyo, S.Pd', students: 35, boys: 22, girls: 13, attendance: 90, average: 83.2 },
  { name: 'XI RPL 1', level: 'SMK', major: 'RPL', room: 'Gedung B &bull; Lab 3', teacher: 'Hendra Gunawan, S.Kom', students: 34, boys: 23, girls: 11, attendance: 95, average: 86.9 },
  { name: 'XI TKJ 1', level: 'SMK', major: 'TKJ', room: 'Gedung B &bull; Lab Jaringan', teacher: 'Rizky Wahyudi, S.T', students: 36, boys: 27, girls: 9, attendance: 93, average: 84.6 },
  { name: 'XII RPL 1', level: 'SMK', major: 'RPL', room: 'Gedung B &bull; R.301', teacher: 'Tri Wibowo, M.Kom', students: 35, boys: 22, girls: 13, attendance: 97, average: 88.3 },
  { name: 'XII TKJ 1', level: 'SMK', major: 'TKJ', room: 'Gedung B &bull; R.302', teacher: 'Agus Setiawan, S.T', students: 34, boys: 26, girls: 8, attendance: 94, average: 85.8 }
]

const initials = (name: string) => {
  return name.replace(/^Drs\.\s*|H\.\s*|S\.Pd\s*|M\.Kom\s*|S\.Kom\s*|S\.Si\s*|S\.T\s*/g, '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
</script>
