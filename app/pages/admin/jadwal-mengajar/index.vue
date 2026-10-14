<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({ layout: 'admin', name: 'admin-jadwal-mengajar' })
useHead({ title: 'Jadwal Mengajar | Admin Portal' })

const grade = useAdminGrade()
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const selectedTeacher = ref('all')
const selectedDay = ref('all')
const searchQuery = ref('')

type TeacherSchedule = {
  id: string
  teacherName: string
  nip: string
  day: string
  time: string
  period: string
  className: string
  subject: string
  room: string
  grade: 'SMP' | 'SMK'
}

const schedules = useState<TeacherSchedule[]>('admin-teacher-schedules', () => [
  // SMP Guru Schedules
  { id: 'TS-01', teacherName: 'Ust. H. Ahmad Fauzi, S.Pd.I', nip: '198506152009022004', day: 'Senin', period: '1 - 2', time: '07.30 - 09.00', className: 'VII-A', subject: 'Pendidikan Agama Islam', room: 'R. 101', grade: 'SMP' },
  { id: 'TS-02', teacherName: 'Ust. H. Ahmad Fauzi, S.Pd.I', nip: '198506152009022004', day: 'Senin', period: '3 - 4', time: '09.15 - 10.45', className: 'VII-B', subject: 'Pendidikan Agama Islam', room: 'R. 102', grade: 'SMP' },
  { id: 'TS-03', teacherName: 'Aisyah Putri, M.Pd', nip: '198811192014022007', day: 'Senin', period: '1 - 2', time: '07.30 - 09.00', className: 'VIII-A', subject: 'Matematika Terpadu', room: 'R. 201', grade: 'SMP' },
  { id: 'TS-04', teacherName: 'Aisyah Putri, M.Pd', nip: '198811192014022007', day: 'Selasa', period: '3 - 4', time: '09.15 - 10.45', className: 'IX-A', subject: 'Matematika Terpadu', room: 'R. 301', grade: 'SMP' },
  { id: 'TS-05', teacherName: 'Budi Santoso, S.Si', nip: '198703122012011009', day: 'Rabu', period: '1 - 3', time: '07.30 - 09.45', className: 'VII-A', subject: 'IPA Terpadu', room: 'Lab IPA', grade: 'SMP' },
  { id: 'TS-06', teacherName: 'Ust. M. Rizky, Lc', nip: '198401012008011012', day: 'Kamis', period: '1 - 2', time: '07.30 - 09.00', className: 'VIII-B', subject: 'Tahfidz Al-Qur\'an', room: 'Masjid', grade: 'SMP' },

  // SMK Guru Schedules
  { id: 'TS-07', teacherName: 'Hendra Gunawan, M.Kom', nip: '199002102015011005', day: 'Senin', period: '1 - 4', time: '07.30 - 10.45', className: 'X RPL 1', subject: 'Pemrograman Berorientasi Objek', room: 'Lab RPL', grade: 'SMK' },
  { id: 'TS-08', teacherName: 'Hendra Gunawan, M.Kom', nip: '199002102015011005', day: 'Selasa', period: '1 - 4', time: '07.30 - 10.45', className: 'XI RPL 1', subject: 'Pemrograman Web & Mobile', room: 'Lab RPL', grade: 'SMK' },
  { id: 'TS-09', teacherName: 'Fajar Nugraha, S.T', nip: '199208222017011006', day: 'Senin', period: '1 - 4', time: '07.30 - 10.45', className: 'X TKJ 1', subject: 'Administrasi Infrastruktur Jaringan', room: 'Lab Jaringan', grade: 'SMK' },
  { id: 'TS-10', teacherName: 'Fajar Nugraha, S.T', nip: '199208222017011006', day: 'Rabu', period: '1 - 4', time: '07.30 - 10.45', className: 'XII TKJ 1', subject: 'Keamanan Jaringan & Cyber Security', room: 'Lab Jaringan', grade: 'SMK' },
  { id: 'TS-11', teacherName: 'Siti Rahmawati, S.Kom', nip: '199109092016022011', day: 'Kamis', period: '1 - 4', time: '07.30 - 10.45', className: 'X RPL 1', subject: 'Basis Data & SQL', room: 'Lab Software', grade: 'SMK' }
])

const teacherNames = computed(() => {
  const set = new Set(schedules.value.filter(s => s.grade === grade.value).map(s => s.teacherName))
  return Array.from(set).sort()
})

const filteredSchedules = computed(() => {
  return schedules.value.filter(s => {
    if (s.grade !== grade.value) return false
    if (selectedTeacher.value !== 'all' && s.teacherName !== selectedTeacher.value) return false
    if (selectedDay.value !== 'all' && s.day !== selectedDay.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return s.teacherName.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)
    }
    return true
  })
})
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
          <span class="text-xs font-semibold text-slate-500">Beban Jam Mengajar (JTM) &bull; T.A 2026/2027</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Jadwal Mengajar Guru</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Distribusi jam mengajar pendidik per kelas, hari, dan ruangan</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          @click="window.print()"
        >
          <AdminIcon name="printer" size="16" />
          <span>Cetak Matriks Jadwal</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Jam Terjadwal</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">{{ filteredSchedules.length * 2 }} Jam</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Sesi mengajar {{ grade }}</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Guru Bertugas</span>
        <b class="text-2xl font-bold text-blue-600 block mt-1">{{ teacherNames.length }} Guru</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Memiliki jadwal aktif</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Beban Rata-rata</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">24 Jam / mg</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Standar sertifikasi pendidik</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Kesesuaian Ruangan</span>
        <b class="text-2xl font-bold text-emerald-600 block mt-1">100%</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Tidak ada bentrok jadwal</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama guru, mata pelajaran, atau kelas..."
          class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-medium transition-colors"
        />
        <AdminIcon name="search" size="16" class="absolute left-3 top-3 text-slate-400" />
      </div>

      <select
        v-model="selectedTeacher"
        class="w-full sm:w-56 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
      >
        <option value="all">Semua Guru {{ grade }}</option>
        <option v-for="t in teacherNames" :key="t" :value="t">{{ t }}</option>
      </select>

      <select
        v-model="selectedDay"
        class="w-full sm:w-40 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
      >
        <option value="all">Semua Hari</option>
        <option value="Senin">Senin</option>
        <option value="Selasa">Selasa</option>
        <option value="Rabu">Rabu</option>
        <option value="Kamis">Kamis</option>
        <option value="Jumat">Jumat</option>
      </select>
    </div>

    <!-- Teacher Schedules Table -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4">Nama Guru</th>
              <th class="py-3.5 px-4">Hari &amp; Jam</th>
              <th class="py-3.5 px-4">Rombel Kelas</th>
              <th class="py-3.5 px-4">Mata Pelajaran</th>
              <th class="py-3.5 px-4">Ruang Belajar</th>
              <th class="py-3.5 px-4">Status Sesi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="s in filteredSchedules"
              :key="s.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="py-3.5 px-4 font-bold text-slate-900">
                <span>{{ s.teacherName }}</span>
                <span class="block text-[10px] text-slate-400 font-mono font-normal">NIP: {{ s.nip }}</span>
              </td>
              <td class="py-3.5 px-4">
                <span class="font-bold text-slate-800">{{ s.day }}</span>
                <span class="block text-[11px] text-slate-500 font-mono">{{ s.time }} (Jam {{ s.period }})</span>
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {{ s.className }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-semibold text-slate-800">{{ s.subject }}</td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-100">
                  {{ s.room }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Terjadwal
                </span>
              </td>
            </tr>
            <tr v-if="filteredSchedules.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 font-medium">
                Tidak ada jadwal mengajar ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
