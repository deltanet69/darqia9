<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminSparkline from '~/components/admin/AdminSparkline.vue'
import AdminBarChart from '~/components/admin/AdminBarChart.vue'
import AdminDonutChart from '~/components/admin/AdminDonutChart.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminToast from '~/components/admin/AdminToast.vue'

definePageMeta({ layout: 'admin' })

type Student = {
  id: string
  name: string
  nis: string
  gender: 'L' | 'P'
  nilai: Record<string, number>
}

const level = ref('SMP')
const classroom = ref('IX-A')
const subject = ref('Semua')
const query = ref('')
const page = ref(1)
const perPage = 10
const selectedStudent = ref<Student | null>(null)
const modalOpen = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const smpSubjects = ['Matematika', 'IPA', 'IPS', 'B. Indonesia', 'B. Inggris', 'PPKn', 'PAI', 'Informatika']
const smkSubjects = ['Matematika', 'B. Indonesia', 'B. Inggris', 'PAI', 'Pemrograman Dasar', 'Basis Data', 'PPL', 'PKK']

const currentSubjects = computed(() => level.value === 'SMP' ? smpSubjects : smkSubjects)

const firstNames = ['Ahmad', 'Siti', 'Muhammad', 'Nabila', 'Rizky', 'Aisyah', 'Fauzan', 'Zahra', 'Farhan', 'Putri', 'Raka', 'Aulia', 'Dimas', 'Salma', 'Fikri']
const lastNames = ['Ramadhan', 'Maulana', 'Pratama', 'Hidayat', 'Nugraha', 'Safitri', 'Kurniawan', 'Permata', 'Hakim', 'Santoso']

const students = useState<Student[]>('admin-grades-students', () =>
  Array.from({ length: 40 }, (_, index) => {
    const fn = firstNames[index % firstNames.length]
    const ln = lastNames[Math.floor(index / firstNames.length) % lastNames.length]
    const base = 70 + ((index * 13) % 25)
    const nilai: Record<string, number> = {}
    
    ;[...smpSubjects, ...smkSubjects].forEach((sb, sIdx) => {
      nilai[sb] = Math.max(58, Math.min(98, base + ((index * 7 + sIdx * 5) % 17) - 6))
    })

    return {
      id: `S${index + 1}`,
      name: `${fn} ${ln}`,
      nis: String(2026001 + index),
      gender: index % 2 === 0 ? 'L' : 'P',
      nilai
    }
  })
)

const classrooms = computed(() => level.value === 'SMP' ? ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B'] : ['X RPL 1', 'X RPL 2', 'X TKJ 1', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1'])

watch(level, newLevel => {
  classroom.value = newLevel === 'SMP' ? 'IX-A' : 'X RPL 1'
  subject.value = 'Semua'
  page.value = 1
})

const getStudentScore = (item: Student) => {
  if (subject.value === 'Semua') {
    const subs = currentSubjects.value
    const sum = subs.reduce((acc, sb) => acc + (item.nilai[sb] || 75), 0)
    return sum / subs.length
  }
  return item.nilai[subject.value] || 75
}

const getPredicate = (val: number) => val >= 90 ? 'A' : val >= 80 ? 'B' : val >= 75 ? 'C' : 'D'

const filteredStudents = computed(() =>
  students.value.filter(item =>
    `${item.name} ${item.nis}`.toLowerCase().includes(query.value.toLowerCase())
  )
)

const pageCount = computed(() => Math.max(1, Math.ceil(filteredStudents.value.length / perPage)))
const pagedStudents = computed(() => filteredStudents.value.slice((page.value - 1) * perPage, page.value * perPage))

// Calculations for KPI and Charts
const classAvg = computed(() => {
  if (!students.value.length) return 0
  const total = students.value.reduce((acc, s) => acc + getStudentScore(s), 0)
  return total / students.value.length
})

const passedCount = computed(() => students.value.filter(s => getStudentScore(s) >= 75).length)
const highestStudent = computed(() => {
  if (!students.value.length) return null
  return students.value.reduce((prev, curr) => getStudentScore(curr) > getStudentScore(prev) ? curr : prev)
})

const subjectAverages = computed(() =>
  currentSubjects.value.map(sb => {
    const avg = students.value.reduce((acc, s) => acc + (s.nilai[sb] || 75), 0) / students.value.length
    return { name: sb, avg: +avg.toFixed(1) }
  })
)

const strongestSubject = computed(() => {
  if (!subjectAverages.value.length) return { name: '-', avg: 0 }
  return subjectAverages.value.reduce((prev, curr) => curr.avg > prev.avg ? curr : prev)
})

const predicateCounts = computed(() => {
  const counts = { A: 0, B: 0, C: 0, D: 0 }
  students.value.forEach(s => {
    const pred = getPredicate(getStudentScore(s))
    counts[pred]++
  })
  return counts
})

const subjectChartDatasets = computed(() => [
  {
    name: 'Rata-rata',
    color: '#2563eb',
    values: subjectAverages.value.map(s => s.avg)
  }
])

const predicateDonutSegments = computed(() => [
  { label: 'A (≥90)', value: predicateCounts.value.A, color: '#16a34a' },
  { label: 'B (80–89)', value: predicateCounts.value.B, color: '#2563eb' },
  { label: 'C (75–79)', value: predicateCounts.value.C, color: '#d97706' },
  { label: 'D (<75)', value: predicateCounts.value.D, color: '#e11d48' }
])

const initials = (name: string) => name.split(' ').slice(0, 2).map(w => w[0]).join('')

const showDetailModal = (student: Student) => {
  selectedStudent.value = student
  modalOpen.value = true
}

const showToast = (msg: string) => {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 2600)
}

const exportLedger = () => {
  showToast('Leger nilai ' + classroom.value + ' berhasil diekspor ke Excel.')
}
</script>

<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-riseIn">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Manajemen Nilai</span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Kelas {{ classroom }} &bull; {{ currentSubjects.length }} mata pelajaran &bull; Standar KKM 75</p>
      </div>
      <button
        class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
        type="button"
        @click="exportLedger"
      >
        <AdminIcon name="dl" size="16" />
        <span>Ekspor Leger Nilai</span>
      </button>
    </div>

    <!-- Toolbar Filters -->
    <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
        <button
          v-for="item in ['SMP','SMK']"
          :key="item"
          type="button"
          class="px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
          :class="level === item ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="level = item"
        >
          {{ item }}
        </button>
      </div>

      <select v-model="classroom" class="px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600">
        <option v-for="c in classrooms" :key="c" :value="c">Kelas {{ c }}</option>
      </select>

      <select v-model="subject" class="px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600">
        <option value="Semua">Semua Mapel (Rata-rata)</option>
        <option v-for="item in currentSubjects" :key="item" :value="item">{{ item }}</option>
      </select>

      <div class="flex-1 min-w-[220px] flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-blue-600 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all">
        <AdminIcon name="search" size="16" class="text-slate-400" />
        <input v-model.trim="query" placeholder="Cari nama / NIS siswa..." class="w-full text-xs font-medium outline-none bg-transparent" />
      </div>
    </div>

    <!-- KPI Summary Metrics Grid with Sweep Shine, Radial Geometry, and Sparklines -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- KPI 1: Rata-rata Kelas (Blue) -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#60A5FA] shadow-[0_14px_30px_-14px_rgba(30,64,175,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(30,64,175,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />
        
        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="book" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <span>{{ classAvg >= 75 ? 'Di atas KKM' : 'Di bawah KKM' }}</span>
          </span>
        </div>
        <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ classAvg.toFixed(1) }}</div>
        <div class="text-xs font-semibold text-blue-100 relative z-10">Rata-rata Nilai Kelas</div>
        
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[78, 80, 81, 82, 83.5, classAvg]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>

      <!-- KPI 2: Tuntas (Green) -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#065F46] via-[#059669] to-[#34D399] shadow-[0_14px_30px_-14px_rgba(6,95,70,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(6,95,70,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:70ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="check" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <span>{{ Math.round(passedCount / students.length * 100) }}% siswa</span>
          </span>
        </div>
        <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ passedCount }}</div>
        <div class="text-xs font-semibold text-emerald-100 relative z-10">Tuntas Nilai (&ge;75)</div>
        
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[30, 32, 34, 35, 36, passedCount]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>

      <!-- KPI 3: Nilai Tertinggi (Amber) -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#92400E] via-[#D97706] to-[#FBBF24] shadow-[0_14px_30px_-14px_rgba(146,64,14,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(146,64,14,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:140ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="spark" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm truncate max-w-[140px]">
            <span>{{ highestStudent ? highestStudent.name.split(' ').slice(0, 2).join(' ') : '-' }}</span>
          </span>
        </div>
        <div class="text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 font-mono text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">{{ highestStudent ? getStudentScore(highestStudent).toFixed(0) : '0' }}</div>
        <div class="text-xs font-semibold text-amber-100 relative z-10">Nilai Tertinggi Kelas</div>
        
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[90, 92, 94, 95, 96, 98]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>

      <!-- KPI 4: Mapel Terkuat (Violet) -->
      <div
        class="group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#A78BFA] shadow-[0_14px_30px_-14px_rgba(91,33,182,0.45)] hover:shadow-[0_22px_42px_-14px_rgba(91,33,182,0.55)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 cursor-pointer animate-riseIn [animation-delay:210ms] before:content-[''] before:absolute before:w-[210px] before:h-[210px] before:rounded-full before:pointer-events-none before:bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)] before:-top-[85px] before:-right-[60px] after:content-[''] after:absolute after:w-[120px] after:h-[120px] after:rounded-full after:pointer-events-none after:border-[24px] after:border-white/10 after:-bottom-[60px] after:-left-[40px]"
      >
        <span class="absolute top-0 bottom-0 w-[70px] -left-[90px] -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 pointer-events-none group-hover:left-[135%]" />

        <div class="flex items-center justify-between mb-3 relative z-10">
          <span class="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md text-white flex items-center justify-center">
            <AdminIcon name="grad" size="22" />
          </span>
          <span class="inline-flex items-center gap-1 text-[11.5px] font-extrabold text-white bg-white/20 border border-white/25 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <span>rerata {{ strongestSubject.avg }}</span>
          </span>
        </div>
        <div class="text-xl sm:text-2xl font-black tracking-tight mb-1 relative z-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] truncate">{{ strongestSubject.name }}</div>
        <div class="text-xs font-semibold text-purple-100 relative z-10">Mata Pelajaran Terkuat</div>
        
        <div class="absolute right-3.5 bottom-2.5 z-10 pointer-events-none">
          <AdminSparkline :values="[82, 84, 85, 87, 88, strongestSubject.avg]" color="rgba(255,255,255,0.95)" :width="110" :height="36" />
        </div>
      </div>
    </div>

    <!-- Charts Grid (SVG Interactive) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Chart 1: Rata-rata per Mata Pelajaran -->
      <div class="lg:col-span-8 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
        <div class="pb-4 border-b border-slate-100 mb-4">
          <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-blue-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
            Rata-rata per Mata Pelajaran
          </h3>
          <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Nilai rata-rata seluruh siswa kelas {{ classroom }}</div>
        </div>

        <div class="py-2">
          <AdminBarChart
            :labels="currentSubjects.map(s => s.length > 10 ? s.slice(0, 9) + '…' : s)"
            :datasets="subjectChartDatasets"
          />
        </div>
      </div>

      <!-- Chart 2: Distribusi Predikat (Interactive Donut Chart) -->
      <div class="lg:col-span-4 bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
        <div class="pb-3 border-b border-slate-100 mb-3">
          <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-purple-500 before:to-indigo-600 before:shadow-[0_2px_8px_rgba(168,85,247,0.4)]">
            Distribusi Predikat
          </h3>
          <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Persebaran nilai A, B, C, D</div>
        </div>

        <div class="py-3">
          <AdminDonutChart
            :segments="predicateDonutSegments"
            :center-text="students.length"
            caption="Total Siswa"
          />
        </div>

        <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-bold pt-4 border-t border-slate-100">
          <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#16a34a] inline-block shadow-sm"></i>A ({{ predicateCounts.A }})</span>
          <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#2563eb] inline-block shadow-sm"></i>B ({{ predicateCounts.B }})</span>
          <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#d97706] inline-block shadow-sm"></i>C ({{ predicateCounts.C }})</span>
          <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded-md bg-[#e11d48] inline-block shadow-sm"></i>D ({{ predicateCounts.D }})</span>
        </div>
      </div>
    </div>

    <!-- Nilai Table Card -->
    <div class="bg-gradient-to-b from-white to-[#FCFEFF] border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:rounded-full before:bg-gradient-to-b before:from-emerald-500 before:to-teal-600 before:shadow-[0_2px_8px_rgba(16,185,129,0.4)]">
            Daftar Nilai Siswa
          </h3>
          <div class="text-xs text-slate-500 mt-0.5 ml-3.5 font-medium">Rekap nilai mata pelajaran kelas {{ classroom }}</div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100 text-[11px]">
            <tr>
              <th class="py-3.5 px-5">Siswa</th>
              <th class="py-3.5 px-5">NIS</th>
              <th class="py-3.5 px-5">{{ subject === 'Semua' ? 'Rata-rata' : subject }}</th>
              <th class="py-3.5 px-5">Predikat</th>
              <th class="py-3.5 px-5">Status</th>
              <th class="py-3.5 px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in pagedStudents" :key="item.nis" class="hover:bg-blue-50/50 transition-colors">
              <td class="py-3.5 px-5">
                <div class="flex items-center gap-3">
                  <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {{ initials(item.name) }}
                  </span>
                  <div>
                    <b class="text-slate-900 text-xs font-bold block">{{ item.name }}</b>
                    <span class="text-[11px] text-slate-400">{{ item.gender === 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-5 font-mono font-medium text-slate-600">{{ item.nis }}</td>
              <td class="py-3.5 px-5 font-mono font-bold text-sm" :class="getStudentScore(item) >= 75 ? 'text-emerald-600' : 'text-rose-600'">
                {{ getStudentScore(item).toFixed(1) }}
              </td>
              <td class="py-3.5 px-5">
                <span
                  class="px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                  :class="getPredicate(getStudentScore(item)) === 'A' ? 'bg-emerald-100 text-emerald-800' : getPredicate(getStudentScore(item)) === 'B' ? 'bg-blue-100 text-blue-800' : getPredicate(getStudentScore(item)) === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'"
                >
                  {{ getPredicate(getStudentScore(item)) }}
                </span>
              </td>
              <td class="py-3.5 px-5">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                  :class="getStudentScore(item) >= 75 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStudentScore(item) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'" />
                  {{ getStudentScore(item) >= 75 ? 'Tuntas' : 'Remidi' }}
                </span>
              </td>
              <td class="py-3.5 px-5 text-right whitespace-nowrap">
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5 ml-auto"
                  @click="showDetailModal(item)"
                >
                  <AdminIcon name="eye" size="14" />
                  <span>Detail</span>
                </button>
              </td>
            </tr>
            <tr v-if="!pagedStudents.length">
              <td colspan="6" class="py-12 text-center text-xs text-slate-400 font-semibold">
                Tidak ada siswa yang cocok dengan pencarian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span>Menampilkan <b>{{ pagedStudents.length }}</b> dari <b>{{ filteredStudents.length }}</b> siswa</span>
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

    <!-- Student Detail Modal -->
    <AdminModal :open="modalOpen" title="Rincian Nilai Siswa" @close="modalOpen = false">
      <div v-if="selectedStudent" class="space-y-4">
        <div class="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
            {{ initials(selectedStudent.name) }}
          </span>
          <div>
            <b class="text-slate-900 text-sm block font-bold">{{ selectedStudent.name }}</b>
            <div class="text-xs text-slate-500 mt-0.5">NIS {{ selectedStudent.nis }} &bull; Kelas {{ classroom }} ({{ level }})</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          <div
            v-for="sb in currentSubjects"
            :key="sb"
            class="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
          >
            <span class="text-slate-600 font-medium truncate mr-2">{{ sb }}</span>
            <b class="font-mono font-bold" :class="(selectedStudent.nilai[sb] || 75) >= 75 ? 'text-emerald-600' : 'text-rose-600'">
              {{ selectedStudent.nilai[sb] || 75 }}
            </b>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          @click="modalOpen = false"
        >
          Tutup
        </button>
      </template>
    </AdminModal>

    <!-- Toast -->
    <AdminToast :message="toastMessage" kind="info" />
  </div>
</template>
