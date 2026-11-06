<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'

export interface ClassRombel {
  id: string
  name: string
  level: 'SMP' | 'SMK'
  major: string
  room: string
  homeroomTeacherId: string | null
  teacher: string
  teacherNip: string
  students: number
  boys: number
  girls: number
  attendance: number
  average: number
}

interface Props {
  classes: ClassRombel[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-class', className: string): void
  (e: 'edit-class', item: ClassRombel): void
  (e: 'archive-class', item: ClassRombel): void
  (e: 'open-presensi', item: ClassRombel): void
}>()

// Filters & State
const filterGrade = ref('Semua')
const filterMajor = ref('Semua')
const selectedSort = ref('name-asc')
const searchQuery = ref('')
const selectedCategory = ref('Semua')
const viewMode = ref<'grid' | 'table'>('grid')

// Category Chips with Counts
const categoryChips = computed(() => [
  { label: 'Semua Rombel', value: 'Semua', count: props.classes.length },
  { label: 'SMK RPL', value: 'RPL', count: props.classes.filter(c => (c.major || '').toUpperCase().includes('RPL')).length },
  { label: 'SMK TKJ', value: 'TKJ', count: props.classes.filter(c => (c.major || '').toUpperCase().includes('TKJ')).length },
  { label: 'SMP BCA', value: 'SMP', count: props.classes.filter(c => c.level === 'SMP').length }
])

// Filter & Sort Logic
const filteredClasses = computed(() => {
  let list = props.classes.filter(item => {
    // Grade Filter
    if (filterGrade.value !== 'Semua' && item.level !== filterGrade.value) return false
    // Major Filter
    if (filterMajor.value !== 'Semua') {
      if (filterMajor.value === 'SMP' && item.level !== 'SMP') return false
      if (filterMajor.value !== 'SMP' && item.major !== filterMajor.value) return false
    }
    // Category Chip Filter
    if (selectedCategory.value !== 'Semua') {
      if (selectedCategory.value === 'SMP' && item.level !== 'SMP') return false
      if (selectedCategory.value !== 'SMP' && !item.major.toUpperCase().includes(selectedCategory.value)) return false
    }
    // Search Query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchName = item.name.toLowerCase().includes(q)
      const matchTeacher = item.teacher.toLowerCase().includes(q)
      const matchRoom = item.room.toLowerCase().includes(q)
      if (!matchName && !matchTeacher && !matchRoom) return false
    }
    return true
  })

  // Sorting
  list = [...list].sort((a, b) => {
    if (selectedSort.value === 'name-asc') return a.name.localeCompare(b.name)
    if (selectedSort.value === 'name-desc') return b.name.localeCompare(a.name)
    if (selectedSort.value === 'students-desc') return b.students - a.students
    if (selectedSort.value === 'attendance-desc') return b.attendance - a.attendance
    if (selectedSort.value === 'average-desc') return b.average - a.average
    return 0
  })

  return list
})

// Pagination
const currentPage = ref(1)
const perPage = ref(9)

watch([searchQuery, filterGrade, filterMajor, selectedCategory, selectedSort], () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredClasses.value.length / perPage.value)))

const pagedClasses = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredClasses.value.slice(start, start + perPage.value)
})

// Helpers
const initials = (name: string) => {
  if (!name || !name.trim()) return '?'
  const clean = name.replace(/^(Drs\.|Dra\.|H\.|Hj\.|Ust\.|Ustadz)\s+/gi, '').replace(/,\s*.*$/g, '')
  const parts = clean.trim().split(/\s+/)
  if (!parts.length || !parts[0]) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const avatarGradient = (name: string) => {
  if (!name || !name.trim()) return 'bg-gradient-to-br from-slate-400 to-slate-500'
  const gradients = [
    'bg-gradient-to-br from-[#1B5FD9] to-[#0A2A5C]',
    'bg-gradient-to-br from-[#067647] to-[#054F31]',
    'bg-gradient-to-br from-[#6941C6] to-[#42307D]',
    'bg-gradient-to-br from-[#B54708] to-[#7A2E0E]',
    'bg-gradient-to-br from-[#0E7090] to-[#155E75]'
  ]
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return gradients[sum % gradients.length]
}

const badgeClass = (level: string, major: string) => {
  if (level === 'SMP') return 'bg-[#E7F6ED] text-[#166534] border-[#A6E9C5]'
  const m = (major || '').toUpperCase()
  if (m.includes('RPL')) return 'bg-[#EFF4FF] text-[#1B5FD9] border-[#B2CCFF]'
  if (m.includes('TKJ')) return 'bg-[#F4F3FF] text-[#5925DC] border-[#D9D6FE]'
  if (m.includes('AK') || m.includes('AKL')) return 'bg-amber-50 text-amber-800 border-amber-200'
  if (m.includes('OTKP') || m.includes('MPLB')) return 'bg-teal-50 text-teal-800 border-teal-200'
  if (m.includes('TBSM') || m.includes('TSM')) return 'bg-orange-50 text-orange-800 border-orange-200'
  return 'bg-blue-50 text-[#1B5FD9] border-blue-200'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar & Filters dalam Card Mewah -->
    <div class="bg-white border border-[#E7EBF2] rounded-[20px] p-4.5 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-3.5">
      <div class="flex flex-wrap items-center gap-3">
        <!-- School Switcher -->
        <div class="relative">
          <select
            v-model="filterGrade"
            class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-[#F8FAFC] text-[#344054] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1B5FD9] shadow-2xs cursor-pointer"
          >
            <option value="Semua">Semua Jenjang</option>
            <option value="SMK">SMK IT Attaqwa 9</option>
            <option value="SMP">SMP IT BCA</option>
          </select>
          <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <AdminV2Icon name="chev" :size="12" />
          </span>
        </div>

        <!-- Major Filter -->
        <div class="relative">
          <select
            v-model="filterMajor"
            class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-[#F8FAFC] text-[#344054] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1B5FD9] shadow-2xs cursor-pointer"
          >
            <option value="Semua">Semua Jurusan</option>
            <option value="RPL">Rekayasa Perangkat Lunak (RPL)</option>
            <option value="TKJ">Teknik Komputer Jaringan (TKJ)</option>
            <option value="SMP">Reguler SMP</option>
          </select>
          <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <AdminV2Icon name="chev" :size="12" />
          </span>
        </div>

        <!-- Sort Filter -->
        <div class="relative">
          <select
            v-model="selectedSort"
            class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-[#F8FAFC] text-[#344054] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1B5FD9] shadow-2xs cursor-pointer"
          >
            <option value="name-asc">Nama Kelas (A-Z)</option>
            <option value="name-desc">Nama Kelas (Z-A)</option>
            <option value="students-desc">Jumlah Siswa Terbanyak</option>
            <option value="attendance-desc">Kehadiran Tertinggi</option>
            <option value="average-desc">Nilai Rata-rata Tertinggi</option>
          </select>
          <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <AdminV2Icon name="chev" :size="12" />
          </span>
        </div>

        <!-- Search Bar -->
        <div class="flex-1 min-w-[220px] relative flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-2xs focus-within:border-[#1B5FD9] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 transition-all">
          <AdminV2Icon name="search" :size="14" class="text-slate-400 mr-2 shrink-0" />
          <input
            v-model.trim="searchQuery"
            placeholder="Cari nama kelas, wali kelas, atau ruangan..."
            class="w-full text-xs font-medium outline-none bg-transparent text-[#101828] placeholder:text-slate-400"
          />
          <button
            v-if="searchQuery"
            class="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
            type="button"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>

        <!-- Layout Switcher (Grid vs Table) -->
        <div class="bg-[#EFF2F7] p-1 rounded-xl flex items-center border border-[#E7EBF2] shrink-0">
          <button
            type="button"
            class="p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="viewMode === 'grid' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
            title="Tampilan Grid Kartu"
            @click="viewMode = 'grid'"
          >
            <AdminV2Icon name="grid" :size="15" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="viewMode === 'table' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
            title="Tampilan Tabel Detail"
            @click="viewMode = 'table'"
          >
            <AdminV2Icon name="layers" :size="15" />
          </button>
        </div>
      </div>

      <!-- Filter Chips (Rombel Counts) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span class="text-[11px] font-extrabold text-[#98A2B3] shrink-0 mr-1 uppercase tracking-wider">Kategori:</span>
        <button
          v-for="chip in categoryChips"
          :key="chip.value"
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer"
          :class="selectedCategory === chip.value
            ? 'bg-[#101828] text-white shadow-xs'
            : 'bg-[#EFF2F7] text-[#475467] hover:bg-[#E2E8F0]'"
          @click="selectedCategory = chip.value"
        >
          <span>{{ chip.label }}</span>
          <span
            class="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold"
            :class="selectedCategory === chip.value ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#344054]'"
          >
            {{ chip.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- GRID VIEW: MODERN, INTERAKTIF, DAN SANGAT INFORMATIF UNTUK AWAM -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <article
        v-for="item in pagedClasses"
        :key="item.name"
        class="bg-white border border-[#E7EBF2] rounded-[22px] p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)] hover:shadow-xl hover:border-[#1B5FD9]/50 transition-all duration-300 flex flex-col justify-between space-y-4 group"
      >
        <div class="space-y-3.5">
          <!-- Top Row: Badge Jurusan & Ruang Belajar -->
          <div class="flex items-center justify-between gap-2">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black border tracking-wide uppercase shadow-2xs"
              :class="badgeClass(item.level, item.major)"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="item.level === 'SMP' ? 'bg-[#166534]' : 'bg-[#1B5FD9]'" />
              <span>{{ item.level }} &middot; {{ item.major || 'Umum' }}</span>
            </span>

            <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
              <AdminV2Icon name="home" :size="12" class="text-slate-400" />
              <span>{{ item.room || 'Ruang Belajar' }}</span>
            </span>
          </div>

          <!-- Class Title & Sub -->
          <div>
            <h3
              class="text-2xl font-black text-slate-900 tracking-tight group-hover:text-[#1B5FD9] cursor-pointer transition-colors flex items-center justify-between"
              @click="emit('select-class', item.name)"
            >
              <span>{{ item.name }}</span>
              <span class="text-xs font-bold text-[#1B5FD9] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex items-center gap-1">
                <span>Rincian</span>
                <span>&rarr;</span>
              </span>
            </h3>
            <p class="text-[12px] text-slate-500 font-medium mt-0.5">
              {{ item.level === 'SMK' ? 'SMK IT Attaqwa 9' : 'SMP IT Bina Cendekia Assalam' }} &middot; Tahun Ajaran 2026/2027
            </p>
          </div>

          <!-- Wali Kelas Card (High Contrast & Super Clear for Awam) -->
          <div class="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl text-white font-extrabold text-[13px] flex items-center justify-center shrink-0 shadow-xs"
              :class="avatarGradient(item.teacher)"
            >
              <template v-if="item.teacher">{{ initials(item.teacher) }}</template>
              <AdminV2Icon v-else name="user" :size="18" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Wali Kelas</span>
                <span
                  v-if="item.teacher"
                  class="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md"
                >
                  Aktif
                </span>
                <span
                  v-else
                  class="text-[9.5px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md"
                >
                  Belum Diset
                </span>
              </div>
              <p class="text-[13px] font-bold text-slate-800 truncate mt-0.5">
                {{ item.teacher || 'Belum Ditugaskan' }}
              </p>
              <p v-if="item.teacherNip" class="text-[11px] text-slate-400 font-mono truncate">
                NIP: {{ item.teacherNip }}
              </p>
            </div>
          </div>

          <!-- Kapasitas Rombel & Keterisian Kursi (Intuitive for Awam) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-600 flex items-center gap-1.5">
                <AdminV2Icon name="users" :size="13" class="text-[#1B5FD9]" />
                <span>Keterisian Rombel</span>
              </span>
              <div class="flex items-center gap-1.5">
                <b class="text-slate-900 font-extrabold tabular-nums">{{ item.students }} / 36 Siswa</b>
                <span
                  class="text-[10.5px] font-extrabold px-2 py-0.5 rounded-full"
                  :class="item.students >= 36 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : item.students > 0 ? 'bg-blue-50 text-[#1B5FD9] border border-blue-200' : 'bg-slate-100 text-slate-500'"
                >
                  {{ item.students >= 36 ? 'Penuh (100%)' : item.students > 0 ? `${Math.round((item.students / 36) * 100)}% (${36 - item.students} kursi kosong)` : 'Belum Ada Siswa' }}
                </span>
              </div>
            </div>

            <!-- Modern Progress Bar -->
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="item.students >= 36 ? 'bg-emerald-600' : 'bg-[#1B5FD9]'"
                :style="{ width: `${Math.min(100, (item.students / 36) * 100)}%` }"
              />
            </div>
          </div>

          <!-- Indikator Kehadiran & Nilai (2 Mini Cards) -->
          <div class="grid grid-cols-2 gap-2 text-center text-xs">
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <AdminV2Icon name="check" :size="11" class="text-emerald-600" />
                <span>Kehadiran</span>
              </div>
              <div class="mt-1 font-black text-[14px] tabular-nums" :class="item.attendance > 0 ? 'text-emerald-700' : 'text-slate-400'">
                {{ item.attendance > 0 ? `${item.attendance}%` : 'Belum Dicatat' }}
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <AdminV2Icon name="chart" :size="11" class="text-[#1B5FD9]" />
                <span>Rata² Nilai</span>
              </div>
              <div class="mt-1 font-black text-[14px] tabular-nums" :class="item.average > 0 ? 'text-[#1B5FD9]' : 'text-slate-400'">
                {{ item.average > 0 ? item.average : 'Belum Ujian' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="pt-3.5 border-t border-slate-100 space-y-2">
          <!-- Primary CTA Button -->
          <button
            type="button"
            class="w-full py-2.5 px-4 rounded-xl font-extrabold text-[12.5px] bg-[#1B5FD9] hover:bg-[#154cb0] text-white transition-all shadow-[0_2px_8px_rgba(27,95,217,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            @click="emit('select-class', item.name)"
          >
            <span>Buka Detail Kelas</span>
            <span class="text-sm font-bold">&rarr;</span>
          </button>

          <!-- Secondary Actions Row -->
          <div class="grid grid-cols-3 gap-1.5 text-center">
            <button
              type="button"
              class="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-white hover:bg-slate-50 text-slate-700 transition-colors border border-slate-200/90 flex items-center justify-center gap-1 cursor-pointer"
              title="Lihat Presensi Siswa Rombel Ini"
              @click="emit('open-presensi', item)"
            >
              <AdminV2Icon name="clock" :size="12" class="text-slate-400" />
              <span>Presensi</span>
            </button>

            <button
              type="button"
              class="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-white hover:bg-slate-50 text-slate-700 transition-colors border border-slate-200/90 flex items-center justify-center gap-1 cursor-pointer"
              @click="emit('edit-class', item)"
            >
              <AdminV2Icon name="pencil" :size="12" class="text-slate-400" />
              <span>Ubah</span>
            </button>

            <button
              type="button"
              class="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-white hover:bg-red-50 text-rose-700 transition-colors border border-rose-200/80 flex items-center justify-center gap-1 cursor-pointer"
              @click="emit('archive-class', item)"
            >
              <AdminV2Icon name="trash" :size="12" class="text-rose-500" />
              <span>Arsip</span>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- TABLE VIEW -->
    <div v-else class="bg-white border border-[#E7EBF2] rounded-[20px] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10.5px] tracking-wider">
            <tr>
              <th class="py-3 px-4">Nama Rombel &amp; Jenjang</th>
              <th class="py-3 px-4">Ruang Kelas</th>
              <th class="py-3 px-4">Wali Kelas</th>
              <th class="py-3 px-4 text-center">Siswa (L/P)</th>
              <th class="py-3 px-4 text-center">Kapasitas</th>
              <th class="py-3 px-4 text-center">Kehadiran</th>
              <th class="py-3 px-4 text-center">Rata-rata Nilai</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <tr
              v-for="item in pagedClasses"
              :key="item.name"
              class="hover:bg-blue-50/30 transition-colors"
            >
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2">
                  <span
                    class="font-black text-sm text-slate-900 hover:text-[#1B5FD9] cursor-pointer"
                    @click="emit('select-class', item.name)"
                  >
                    {{ item.name }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                    :class="badgeClass(item.level, item.major)"
                  >
                    {{ item.level }}<template v-if="item.major"> &bull; {{ item.major }}</template>
                  </span>
                </div>
              </td>
              <td class="py-3.5 px-4 text-slate-500 font-medium text-[11.5px]">{{ item.room }}</td>
              <td class="py-3.5 px-4 font-bold text-slate-900">{{ item.teacher || 'Belum Ditugaskan' }}</td>
              <td class="py-3.5 px-4 text-center font-mono">
                <b class="text-slate-900">{{ item.students }}</b>
                <span class="text-[10px] text-slate-400 block">({{ item.boys }}L / {{ item.girls }}P)</span>
              </td>
              <td class="py-3.5 px-4 text-center font-mono">
                <span class="text-emerald-700 font-bold">{{ Math.round((item.students / 36) * 100) }}%</span>
                <span class="text-[10px] text-slate-400 block">36 Kursi</span>
              </td>
              <td class="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                {{ item.attendance > 0 ? `${item.attendance}%` : '—' }}
              </td>
              <td class="py-3.5 px-4 text-center font-mono font-bold text-[#1B5FD9]">
                {{ item.average > 0 ? item.average : '—' }}
              </td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg font-bold text-xs bg-[#EFF4FF] hover:bg-[#D1E0FF] text-[#1B5FD9] transition cursor-pointer"
                    @click="emit('select-class', item.name)"
                  >
                    Detail
                  </button>
                  <button
                    type="button"
                    class="p-1.5 rounded-lg font-bold text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                    title="Presensi"
                    @click="emit('open-presensi', item)"
                  >
                    <AdminV2Icon name="clock" :size="13" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredClasses.length === 0"
      class="bg-white border border-[#E7EBF2] rounded-[20px] p-10 text-center space-y-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div class="w-12 h-12 rounded-2xl bg-[#EFF2F7] text-[#667085] flex items-center justify-center mx-auto mb-2">
        <AdminV2Icon name="search" :size="20" />
      </div>
      <h4 class="font-extrabold text-base text-[#101828]">Tidak ada rombel kelas ditemukan</h4>
      <p class="text-xs text-[#667085]">Silakan sesuaikan kata kunci pencarian atau ganti filter jenjang/jurusan.</p>
    </div>

    <!-- Pagination Footer -->
    <div
      v-if="filteredClasses.length > 0"
      class="flex flex-wrap items-center justify-between gap-3 pt-2"
    >
      <div class="text-xs text-slate-500 font-medium">
        Menampilkan <b class="text-slate-800">{{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredClasses.length) }}</b> dari <b class="text-slate-800">{{ filteredClasses.length }}</b> rombel
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model.number="perPage"
          class="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 font-semibold"
        >
          <option :value="6">6 / halaman</option>
          <option :value="9">9 / halaman</option>
          <option :value="12">12 / halaman</option>
        </select>

        <div class="flex items-center gap-1">
          <button
            type="button"
            :disabled="currentPage <= 1"
            class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            @click="currentPage--"
          >
            Sebelumnya
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
            :class="currentPage === p ? 'bg-[#1B5FD9] text-white shadow-2xs' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          <button
            type="button"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            @click="currentPage++"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
