<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({ layout: 'admin', name: 'admin-jadwal-pelajaran' })
useHead({ title: 'Jadwal Pelajaran | Admin Portal' })

const grade = useAdminGrade()
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const selectedDay = ref('Senin')
const selectedClass = ref('all')
const searchQuery = ref('')

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

const smpClasses = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B']
const smkClasses = ['X RPL 1', 'X TKJ 1', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']

const availableClasses = computed(() => grade.value === 'SMP' ? smpClasses : smkClasses)

type ScheduleItem = {
  id: string
  day: string
  period: string
  time: string
  className: string
  subject: string
  teacher: string
  room: string
  grade: 'SMP' | 'SMK'
}

const scheduleList = useState<ScheduleItem[]>('admin-schedules', () => [
  // SMP Jadwal
  { id: 'SC-01', day: 'Senin', period: '1 - 2', time: '07.30 - 09.00', className: 'VII-A', subject: 'Pendidikan Agama Islam', teacher: 'Ust. H. Ahmad Fauzi, S.Pd.I', room: 'R. 101', grade: 'SMP' },
  { id: 'SC-02', day: 'Senin', period: '3 - 4', time: '09.15 - 10.45', className: 'VII-A', subject: 'Matematika Terpadu', teacher: 'Aisyah Putri, M.Pd', room: 'R. 101', grade: 'SMP' },
  { id: 'SC-03', day: 'Senin', period: '5 - 6', time: '11.00 - 12.30', className: 'VII-A', subject: 'Bahasa Indonesia', teacher: 'Rina Kurniawati, S.Pd', room: 'R. 101', grade: 'SMP' },
  { id: 'SC-04', day: 'Selasa', period: '1 - 2', time: '07.30 - 09.00', className: 'VII-A', subject: 'Ilmu Pengetahuan Alam', teacher: 'Budi Santoso, S.Si', room: 'Lab IPA', grade: 'SMP' },
  { id: 'SC-05', day: 'Rabu', period: '1 - 3', time: '07.30 - 09.45', className: 'VIII-A', subject: 'Bahasa Inggris', teacher: 'Farhan Maulana, S.Pd', room: 'R. 201', grade: 'SMP' },
  { id: 'SC-06', day: 'Kamis', period: '1 - 2', time: '07.30 - 09.00', className: 'IX-A', subject: 'Informatika Dasar', teacher: 'Dedi Prasetyo, S.Kom', room: 'Lab Komputer 1', grade: 'SMP' },
  { id: 'SC-07', day: 'Jumat', period: '1 - 2', time: '07.30 - 08.45', className: 'VII-B', subject: 'Tahfidz & Qur\'an', teacher: 'Ust. M. Rizky, Lc', room: 'Masjid Sekolah', grade: 'SMP' },

  // SMK Jadwal
  { id: 'SC-08', day: 'Senin', period: '1 - 4', time: '07.30 - 10.45', className: 'X RPL 1', subject: 'Pemrograman Berorientasi Objek', teacher: 'Hendra Gunawan, M.Kom', room: 'Lab RPL', grade: 'SMK' },
  { id: 'SC-09', day: 'Senin', period: '5 - 8', time: '11.00 - 14.30', className: 'X RPL 1', subject: 'Basis Data & SQL', teacher: 'Siti Rahmawati, S.Kom', room: 'Lab RPL', grade: 'SMK' },
  { id: 'SC-10', day: 'Selasa', period: '1 - 4', time: '07.30 - 10.45', className: 'X TKJ 1', subject: 'Administrasi Infrastruktur Jaringan', teacher: 'Fajar Nugraha, S.T', room: 'Lab Jaringan & Cisco', grade: 'SMK' },
  { id: 'SC-11', day: 'Rabu', period: '1 - 3', time: '07.30 - 09.45', className: 'XI RPL 1', subject: 'Pemrograman Web & Perangkat Bergerak', teacher: 'Hendra Gunawan, M.Kom', room: 'Lab Software', grade: 'SMK' },
  { id: 'SC-12', day: 'Kamis', period: '1 - 3', time: '07.30 - 09.45', className: 'XII TKJ 1', subject: 'Keamanan Jaringan & Cyber Security', teacher: 'Fajar Nugraha, S.T', room: 'Lab Jaringan', grade: 'SMK' },
  { id: 'SC-13', day: 'Jumat', period: '1 - 2', time: '07.30 - 08.45', className: 'X RPL 1', subject: 'Pendidikan Agama Islam & Budi Pekerti', teacher: 'Ust. H. Ahmad Fauzi, S.Pd.I', room: 'Masjid Sekolah', grade: 'SMK' }
])

const filteredSchedules = computed(() => {
  return scheduleList.value.filter(s => {
    if (s.grade !== grade.value) return false
    if (selectedDay.value && s.day !== selectedDay.value) return false
    if (selectedClass.value !== 'all' && s.className !== selectedClass.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return s.subject.toLowerCase().includes(q) || s.teacher.toLowerCase().includes(q) || s.room.toLowerCase().includes(q)
    }
    return true
  })
})

const totalSchedules = computed(() => scheduleList.value.filter(s => s.grade === grade.value).length)
const todaySchedules = computed(() => scheduleList.value.filter(s => s.grade === grade.value && s.day === selectedDay.value).length)

const printSchedule = () => {
  window.print()
}
</script>

<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span
            class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider border"
            :class="grade === 'SMP' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'"
          >
            {{ schoolName }}
          </span>
          <span class="text-xs font-semibold text-slate-500">Semester Ganjil &bull; T.A 2026/2027</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Jadwal Pelajaran</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Distribusi jadwal kegiatan belajar mengajar per kelas dan ruang</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          @click="printSchedule"
        >
          <AdminIcon name="printer" size="16" />
          <span>Cetak Jadwal</span>
        </button>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Sesi Mingguan</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">{{ totalSchedules }} Sesi</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Seluruh Rombel {{ grade }}</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Jadwal Hari {{ selectedDay }}</span>
        <b class="text-2xl font-bold text-blue-600 block mt-1">{{ todaySchedules }} Sesi</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Tatap muka aktif</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Jumlah Rombel</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">{{ availableClasses.length }} Kelas</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Terjadwal 100%</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Status Pelaksanaan</span>
        <b class="text-2xl font-bold text-emerald-600 block mt-1">Normal</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Kurikulum Merdeka</span>
      </div>
    </div>

    <!-- Filter & Day Tabs -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
      <!-- Days Switcher -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          v-for="d in days"
          :key="d"
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
          :class="selectedDay === d
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="selectedDay = d"
        >
          {{ d }}
        </button>
      </div>

      <!-- Controls Row -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari mata pelajaran, nama guru, atau ruang..."
            class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-medium transition-colors"
          />
          <AdminIcon name="search" size="16" class="absolute left-3 top-3 text-slate-400" />
        </div>

        <select
          v-model="selectedClass"
          class="w-full sm:w-48 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
        >
          <option value="all">Semua Kelas {{ grade }}</option>
          <option v-for="c in availableClasses" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
    </div>

    <!-- Schedule Table -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4">Jam Ke</th>
              <th class="py-3.5 px-4">Waktu</th>
              <th class="py-3.5 px-4">Kelas</th>
              <th class="py-3.5 px-4">Mata Pelajaran</th>
              <th class="py-3.5 px-4">Guru Pengampu</th>
              <th class="py-3.5 px-4">Ruang</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="s in filteredSchedules"
              :key="s.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="py-3.5 px-4 font-mono font-bold text-blue-600">{{ s.period }}</td>
              <td class="py-3.5 px-4 font-mono text-slate-500">{{ s.time }}</td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {{ s.className }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-bold text-slate-900">{{ s.subject }}</td>
              <td class="py-3.5 px-4 font-medium text-slate-600">{{ s.teacher }}</td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-100">
                  {{ s.room }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredSchedules.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 font-medium">
                Tidak ada jadwal pelajaran ditemukan untuk filter ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
