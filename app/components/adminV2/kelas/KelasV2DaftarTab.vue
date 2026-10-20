<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'

export interface ClassRombel {
  name: string
  level: 'SMP' | 'SMK'
  major: string
  room: string
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
  { label: 'SMK RPL', value: 'RPL', count: props.classes.filter(c => c.major === 'RPL').length },
  { label: 'SMK TKJ', value: 'TKJ', count: props.classes.filter(c => c.major === 'TKJ').length },
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
      if (selectedCategory.value !== 'SMP' && item.major !== selectedCategory.value) return false
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
const perPage = 6

watch([searchQuery, filterGrade, filterMajor, selectedCategory, selectedSort], () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredClasses.value.length / perPage)))

const pagedClasses = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredClasses.value.slice(start, start + perPage)
})

// Helpers
const initials = (name: string) => {
  return name.replace(/^Drs\.\s*|H\.\s*|S\.Pd\s*|M\.Kom\s*|S\.Kom\s*|S\.Si\s*|S\.T\s*/g, '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const avatarGradient = (name: string) => {
  const gradients = [
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-purple-500 to-pink-600',
    'bg-gradient-to-br from-amber-500 to-orange-600'
  ]
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return gradients[sum % gradients.length]
}

const badgeClass = (level: string, major: string) => {
  if (level === 'SMP') return 'bg-[#E7F6ED] text-[#166534] border-[#A6E9C5]'
  if (major === 'RPL') return 'bg-[#EFF4FF] text-[#1B5FD9] border-[#B2CCFF]'
  if (major === 'TKJ') return 'bg-[#F4F3FF] text-[#5925DC] border-[#D9D6FE]'
  return 'bg-[#FDF2FA] text-[#C11574] border-[#FCCEEE]'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar & Filters -->
    <div class="bg-white border border-[#E7EBF2] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
      <div class="flex flex-wrap items-center gap-3">
        <!-- School Switcher -->
        <div class="relative">
          <select
            v-model="filterGrade"
            class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-[#F8FAFC] text-[#344054] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1B5FD9] shadow-2xs cursor-pointer"
          >
            <option value="Semua">Semua Jenjang</option>
            <option value="SMK">SMK IT Attaqwa 9</option>
            <option value="SMP">SMP IT Bina Cendekia</option>
          </select>
          <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#98A2B3]">▾</span>
        </div>

        <!-- Major / Jurusan Switcher -->
        <div class="relative">
          <select
            v-model="filterMajor"
            class="appearance-none pl-3.5 pr-8 py-2 text-xs font-bold bg-[#F8FAFC] text-[#344054] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#1B5FD9] shadow-2xs cursor-pointer"
          >
            <option value="Semua">Semua Jurusan</option>
            <option value="RPL">RPL (Rekayasa Perangkat Lunak)</option>
            <option value="TKJ">TKJ (Teknik Komputer Jaringan)</option>
            <option value="SMP">Reguler SMP</option>
          </select>
          <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#98A2B3]">▾</span>
        </div>

        <!-- Sort Selector -->
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
          <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#98A2B3]">▾</span>
        </div>

        <!-- Search Box -->
        <div class="flex-1 min-w-[220px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#1B5FD9] focus-within:bg-white shadow-2xs transition-colors">
          <AdminV2Icon name="search" :size="15" class="text-[#98A2B3] shrink-0" />
          <input
            v-model.trim="searchQuery"
            placeholder="Cari nama kelas, wali kelas, atau ruangan..."
            class="w-full text-xs font-medium outline-none bg-transparent text-[#101828] placeholder:text-[#98A2B3]"
          />
          <button
            v-if="searchQuery"
            class="text-[#98A2B3] hover:text-[#344054] text-xs font-bold cursor-pointer"
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

    <!-- GRID VIEW -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in pagedClasses"
        :key="item.name"
        class="bg-white border border-[#E7EBF2] rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-[#1B5FD9]/40 transition-all flex flex-col justify-between space-y-4"
      >
        <div>
          <!-- Card Header -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
              :class="badgeClass(item.level, item.major)"
            >
              {{ item.level }}<template v-if="item.major"> &bull; {{ item.major }}</template>
            </span>
            <span class="text-[11px] font-mono text-[#667085] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-lg">
              {{ item.room }}
            </span>
          </div>

          <!-- Class Name -->
          <h4
            class="text-xl font-extrabold text-[#101828] hover:text-[#1B5FD9] cursor-pointer transition-colors"
            @click="emit('select-class', item.name)"
          >
            {{ item.name }}
          </h4>

          <!-- Wali Kelas -->
          <div class="flex items-center gap-2.5 mt-2.5 pt-2.5 border-t border-[#F1F5F9]">
            <div
              class="w-8 h-8 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
              :class="avatarGradient(item.name)"
            >
              {{ initials(item.teacher) }}
            </div>
            <div class="min-w-0">
              <span class="text-[10px] uppercase font-bold text-[#98A2B3] block leading-none">Wali Kelas</span>
              <span class="text-xs font-bold text-[#344054] truncate block mt-0.5">{{ item.teacher }}</span>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-4 gap-2 bg-[#F8FAFC] border border-[#F1F5F9] p-2.5 rounded-2xl text-center text-xs mt-3.5">
            <div>
              <b class="text-[#101828] font-mono font-bold block">{{ item.students }}</b>
              <span class="text-[9.5px] text-[#667085]">Siswa</span>
            </div>
            <div>
              <b class="text-[#344054] font-mono font-bold block">36</b>
              <span class="text-[9.5px] text-[#667085]">Kapasitas</span>
            </div>
            <div>
              <b class="text-[#059669] font-mono font-bold block">{{ item.attendance }}%</b>
              <span class="text-[9.5px] text-[#667085]">Hadir</span>
            </div>
            <div>
              <b class="text-[#1B5FD9] font-mono font-bold block">{{ item.average }}</b>
              <span class="text-[9.5px] text-[#667085]">Nilai</span>
            </div>
          </div>

          <!-- Progress Bar Keterisian -->
          <div class="mt-3">
            <div class="flex items-center justify-between text-[10.5px] font-bold text-[#667085] mb-1">
              <span>Keterisian Kelas</span>
              <span class="font-mono text-[#101828]">{{ Math.round((item.students / 36) * 100) }}% ({{ item.students }}/36 Kursi)</span>
            </div>
            <div class="w-full bg-[#EFF2F7] h-1.5 rounded-full overflow-hidden">
              <div
                class="bg-[#1B5FD9] h-full rounded-full"
                :style="{ width: `${(item.students / 36) * 100}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-3 border-t border-[#F1F5F9]">
          <button
            type="button"
            class="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-[#EFF4FF] hover:bg-[#D1E0FF] text-[#1B5FD9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            @click="emit('select-class', item.name)"
          >
            <span>Detail Kelas</span>
            <span>&rarr;</span>
          </button>
          <button
            type="button"
            class="py-2 px-3 rounded-xl font-bold text-xs bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#344054] transition-colors border border-[#E2E8F0] flex items-center gap-1.5 cursor-pointer"
            title="Buka Presensi Rombel Ini"
            @click="emit('open-presensi', item)"
          >
            <AdminV2Icon name="clock" :size="13" />
            <span>Presensi</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TABLE VIEW -->
    <div v-else class="bg-white border border-[#E7EBF2] rounded-3xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#F8FAFC] text-[#475467] font-bold border-b border-[#E7EBF2] uppercase text-[10.5px] tracking-wider">
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
          <tbody class="divide-y divide-[#F1F5F9] font-medium text-[#344054]">
            <tr
              v-for="item in pagedClasses"
              :key="item.name"
              class="hover:bg-[#F8FAFC] transition-colors"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span
                    class="font-extrabold text-sm text-[#101828] hover:text-[#1B5FD9] cursor-pointer"
                    @click="emit('select-class', item.name)"
                  >
                    {{ item.name }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    :class="badgeClass(item.level, item.major)"
                  >
                    {{ item.level }}<template v-if="item.major"> &bull; {{ item.major }}</template>
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 text-[#667085] font-mono text-[11px]">{{ item.room }}</td>
              <td class="py-3 px-4 font-bold text-[#101828]">{{ item.teacher }}</td>
              <td class="py-3 px-4 text-center font-mono">
                <b>{{ item.students }}</b>
                <span class="text-[10.5px] text-[#98A2B3] block">({{ item.boys }}L / {{ item.girls }}P)</span>
              </td>
              <td class="py-3 px-4 text-center font-mono">
                <span class="text-[#059669] font-bold">{{ Math.round((item.students / 36) * 100) }}%</span>
                <span class="text-[10px] text-[#98A2B3] block">36 Kursi</span>
              </td>
              <td class="py-3 px-4 text-center font-mono font-bold text-[#059669]">
                {{ item.attendance }}%
              </td>
              <td class="py-3 px-4 text-center font-mono font-bold text-[#1B5FD9]">
                {{ item.average }}
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    class="px-2.5 py-1.5 rounded-xl font-bold text-xs bg-[#EFF4FF] hover:bg-[#D1E0FF] text-[#1B5FD9] transition cursor-pointer"
                    @click="emit('select-class', item.name)"
                  >
                    Detail
                  </button>
                  <button
                    type="button"
                    class="px-2 py-1.5 rounded-xl font-bold text-xs bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#344054] border border-[#E2E8F0] transition cursor-pointer"
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
      class="bg-white border border-[#E7EBF2] rounded-3xl p-10 text-center space-y-2"
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
      class="bg-white border border-[#E7EBF2] rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
    >
      <span class="text-[#667085] font-medium">
        Menampilkan <b class="text-[#101828] font-mono">{{ (currentPage - 1) * perPage + 1 }}</b> s/d
        <b class="text-[#101828] font-mono">{{ Math.min(currentPage * perPage, filteredClasses.length) }}</b> dari
        <b class="text-[#101828] font-mono">{{ filteredClasses.length }}</b> rombel
      </span>

      <div class="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-[#344054] font-bold hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          &lsaquo; Sebelumnya
        </button>

        <button
          v-for="p in totalPages"
          :key="p"
          type="button"
          class="w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center transition cursor-pointer"
          :class="currentPage === p
            ? 'bg-[#101828] text-white shadow-xs'
            : 'border border-[#E2E8F0] text-[#344054] hover:bg-[#F8FAFC]'"
          @click="currentPage = p"
        >
          {{ p }}
        </button>

        <button
          type="button"
          class="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-[#344054] font-bold hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Selanjutnya &rsaquo;
        </button>
      </div>
    </div>
  </div>
</template>
