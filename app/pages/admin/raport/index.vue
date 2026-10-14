<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import AdminSlideOver from '~/components/admin/AdminSlideOver.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({ layout: 'admin', name: 'admin-raport' })
useHead({ title: 'Raport Siswa | Admin Portal' })

const grade = useAdminGrade()
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const selectedClass = ref('all')
const searchQuery = ref('')
const selectedStatus = ref('all')
const activePreviewStudent = ref<any>(null)

const smpClasses = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B']
const smkClasses = ['X RPL 1', 'X TKJ 1', 'XI RPL 1', 'XI TKJ 1', 'XII RPL 1', 'XII TKJ 1']

const availableClasses = computed(() => grade.value === 'SMP' ? smpClasses : smkClasses)

type ReportStudent = {
  id: string
  nisn: string
  nis: string
  name: string
  className: string
  gender: 'L' | 'P'
  averageScore: number
  rank: number
  kkmStatus: 'Tuntas' | 'Remedial'
  reportStatus: 'Siap Cetak' | 'Diterbitkan' | 'Draft'
  grade: 'SMP' | 'SMK'
}

const reportStudents = useState<ReportStudent[]>('admin-report-students', () => [
  // SMP Students
  { id: 'RS-01', nisn: '0089123401', nis: '242507001', name: 'Ahmad Faiz Ramadhan', className: 'VII-A', gender: 'L', averageScore: 88.4, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMP' },
  { id: 'RS-02', nisn: '0089123402', nis: '242507002', name: 'Aisyah Putri Azzahra', className: 'VII-A', gender: 'P', averageScore: 86.9, rank: 2, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMP' },
  { id: 'RS-03', nisn: '0089123403', nis: '242507003', name: 'Bilal Al-Ghifari', className: 'VII-A', gender: 'L', averageScore: 81.2, rank: 3, kkmStatus: 'Tuntas', reportStatus: 'Siap Cetak', grade: 'SMP' },
  { id: 'RS-04', nisn: '0089123404', nis: '242507004', name: 'Fatimah Zahra', className: 'VIII-A', gender: 'P', averageScore: 89.0, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Siap Cetak', grade: 'SMP' },
  { id: 'RS-05', nisn: '0089123405', nis: '242507005', name: 'Hafiz Muhammad', className: 'VIII-A', gender: 'L', averageScore: 74.0, rank: 14, kkmStatus: 'Remedial', reportStatus: 'Draft', grade: 'SMP' },
  { id: 'RS-06', nisn: '0089123406', nis: '242507006', name: 'Nabila Syakira', className: 'IX-A', gender: 'P', averageScore: 91.5, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMP' },

  // SMK Students
  { id: 'RS-07', nisn: '3095100998', nis: '242510001', name: 'A. Sauqi Nur Kamil', className: 'X RPL 1', gender: 'L', averageScore: 87.6, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMK' },
  { id: 'RS-08', nisn: '3095100999', nis: '242510002', name: 'Abdurrahman Al-Farisi', className: 'X RPL 1', gender: 'L', averageScore: 83.2, rank: 2, kkmStatus: 'Tuntas', reportStatus: 'Siap Cetak', grade: 'SMK' },
  { id: 'RS-09', nisn: '3095101000', nis: '242510003', name: 'Adinda Nurhaliza', className: 'X TKJ 1', gender: 'P', averageScore: 85.0, rank: 1, kkmStatus: 'Tuntas', reportStatus: 'Diterbitkan', grade: 'SMK' },
  { id: 'RS-10', nisn: '3095101001', nis: '242510004', name: 'Arya Putra Pratama', className: 'XI RPL 1', gender: 'L', averageScore: 80.5, rank: 4, kkmStatus: 'Tuntas', reportStatus: 'Siap Cetak', grade: 'SMK' },
  { id: 'RS-11', nisn: '3095101002', nis: '242510005', name: 'Bagas Wahyu Hidayat', className: 'XII TKJ 1', gender: 'L', averageScore: 72.8, rank: 18, kkmStatus: 'Remedial', reportStatus: 'Draft', grade: 'SMK' }
])

const filteredList = computed(() => {
  return reportStudents.value.filter(s => {
    if (s.grade !== grade.value) return false
    if (selectedClass.value !== 'all' && s.className !== selectedClass.value) return false
    if (selectedStatus.value !== 'all' && s.reportStatus !== selectedStatus.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.nisn.includes(q) || s.nis.includes(q)
    }
    return true
  })
})

const completedCount = computed(() => filteredList.value.filter(s => s.kkmStatus === 'Tuntas').length)
const completionRate = computed(() => filteredList.value.length ? Math.round((completedCount.value / filteredList.value.length) * 100) : 0)

const openPreview = (s: ReportStudent) => {
  activePreviewStudent.value = s
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
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Raport Siswa</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Rekapitulasi pencapaian nilai kompetensi, ketuntasan belajar, dan cetak rapor digital</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          @click="window.print()"
        >
          <AdminIcon name="printer" size="16" />
          <span>Cetak Masal</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Siswa Terdaftar</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">{{ filteredList.length }} Siswa</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Jenjang {{ grade }}</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Ketuntasan Belajar</span>
        <b class="text-2xl font-bold text-emerald-600 block mt-1">{{ completionRate }}%</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">{{ completedCount }} siswa tuntas KKM</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Rapor Diterbitkan</span>
        <b class="text-2xl font-bold text-blue-600 block mt-1">
          {{ filteredList.filter(s => s.reportStatus === 'Diterbitkan').length }}
        </b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Tervalidasi Kepala Sekolah</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Rapor Siap Cetak</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">
          {{ filteredList.filter(s => s.reportStatus === 'Siap Cetak').length }}
        </b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Menunggu penandatanganan</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama siswa, NISN, atau NIS..."
          class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-medium transition-colors"
        />
        <AdminIcon name="search" size="16" class="absolute left-3 top-3 text-slate-400" />
      </div>

      <select
        v-model="selectedClass"
        class="w-full sm:w-44 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
      >
        <option value="all">Semua Rombel</option>
        <option v-for="c in availableClasses" :key="c" :value="c">{{ c }}</option>
      </select>

      <select
        v-model="selectedStatus"
        class="w-full sm:w-44 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
      >
        <option value="all">Semua Status Rapor</option>
        <option value="Diterbitkan">Diterbitkan</option>
        <option value="Siap Cetak">Siap Cetak</option>
        <option value="Draft">Draft</option>
      </select>
    </div>

    <!-- Report Table -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4">Peringkat</th>
              <th class="py-3.5 px-4">NISN / NIS</th>
              <th class="py-3.5 px-4">Nama Lengkap</th>
              <th class="py-3.5 px-4">Kelas</th>
              <th class="py-3.5 px-4">Rata-rata Nilai</th>
              <th class="py-3.5 px-4">Ketuntasan</th>
              <th class="py-3.5 px-4">Status Rapor</th>
              <th class="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="s in filteredList"
              :key="s.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="py-3.5 px-4 font-bold text-slate-900 font-mono">#{{ s.rank }}</td>
              <td class="py-3.5 px-4 font-mono text-slate-500">
                <span class="block text-slate-800 font-bold">{{ s.nisn }}</span>
                <span class="text-[10px] text-slate-400">NIS: {{ s.nis }}</span>
              </td>
              <td class="py-3.5 px-4 font-bold text-slate-900">{{ s.name }}</td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                  {{ s.className }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-mono font-bold text-blue-600">{{ s.averageScore }}</td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold"
                  :class="s.kkmStatus === 'Tuntas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                >
                  {{ s.kkmStatus }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold"
                  :class="{
                    'bg-blue-50 text-blue-700 border border-blue-200': s.reportStatus === 'Diterbitkan',
                    'bg-amber-50 text-amber-700 border border-amber-200': s.reportStatus === 'Siap Cetak',
                    'bg-slate-100 text-slate-600': s.reportStatus === 'Draft'
                  }"
                >
                  {{ s.reportStatus }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  @click="openPreview(s)"
                >
                  Lihat Rapor
                </button>
              </td>
            </tr>
            <tr v-if="filteredList.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400 font-medium">
                Tidak ada data rapor siswa ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Centered Modal: Pratinjau Rapor Digital Resmi (Keren, Modern, Mobile-First) -->
    <AdminSlideOver
      :open="!!activePreviewStudent"
      title="Pratinjau Rapor Digital"
      :subtitle="activePreviewStudent ? `${activePreviewStudent.name} • ${activePreviewStudent.className} • NISN: ${activePreviewStudent.nisn}` : ''"
      badge="Rapor Resmi"
      badge-type="success"
      icon="printer"
      width="2xl"
      @close="activePreviewStudent = null"
    >
      <div v-if="activePreviewStudent" class="space-y-5 sm:space-y-6 text-sm">
        <!-- School Letterhead & Student Hero -->
        <div class="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 to-[#0A1F44] text-white shadow-lg relative overflow-hidden">
          <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <span class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-inner">
                {{ activePreviewStudent.name.charAt(0) }}
              </span>
              <div>
                <span class="text-xs font-bold text-blue-300 uppercase tracking-widest block mb-0.5">
                  {{ schoolName }}
                </span>
                <h4 class="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {{ activePreviewStudent.name }}
                </h4>
                <div class="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-mono mt-1">
                  <span>NISN: {{ activePreviewStudent.nisn }}</span>
                  <span>&bull;</span>
                  <span>NIS: {{ activePreviewStudent.nis }}</span>
                  <span>&bull;</span>
                  <span class="text-blue-300 font-bold font-sans">{{ activePreviewStudent.className }}</span>
                </div>
              </div>
            </div>

            <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/15 gap-1.5">
              <span class="text-xs text-slate-300 uppercase tracking-wider font-semibold">Peringkat Kelas</span>
              <span class="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm font-mono shadow-sm">
                Juara #{{ activePreviewStudent.rank }}
              </span>
            </div>
          </div>
        </div>

        <!-- 4 Highlights Grid (Sizing Nyaman Dibaca) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Rata-rata Nilai</span>
            <b class="text-2xl sm:text-3xl font-bold text-blue-600 font-mono block mt-1.5">{{ activePreviewStudent.averageScore }}</b>
            <span class="text-xs text-slate-500 block mt-0.5 font-medium">Skala 100</span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status KKM</span>
            <b class="text-lg sm:text-xl font-bold text-emerald-600 block mt-2">{{ activePreviewStudent.kkmStatus }}</b>
            <span class="text-xs text-slate-500 block mt-0.5 font-medium">Standar KKM 75</span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Kehadiran KBM</span>
            <b class="text-2xl sm:text-3xl font-bold text-slate-900 font-mono block mt-1.5">98%</b>
            <span class="text-xs text-emerald-600 font-bold block mt-0.5">0 Hari Alpa</span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sikap &amp; Karakter</span>
            <b class="text-lg sm:text-xl font-bold text-purple-600 block mt-2">Sangat Baik</b>
            <span class="text-xs text-slate-500 block mt-0.5 font-medium">Predikat A</span>
          </div>
        </div>

        <!-- Tabel Nilai Rapor Per Mapel (Jelas & Touch Friendly) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <b class="text-slate-900 font-bold text-sm uppercase tracking-wider">Capaian Kompetensi per Mata Pelajaran</b>
            <span class="text-xs text-slate-500 font-mono">T.A 2026/2027</span>
          </div>
          <div class="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
            <table class="w-full text-left text-sm min-w-[500px]">
              <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4">Mata Pelajaran</th>
                  <th class="py-3 px-3.5 text-center">KKM</th>
                  <th class="py-3 px-3.5 text-center">Nilai Akhir</th>
                  <th class="py-3 px-3.5 text-center">Predikat</th>
                  <th class="py-3 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-slate-900">Pendidikan Agama Islam &amp; Budi Pekerti</td>
                  <td class="py-3.5 px-3.5 text-center font-mono text-slate-600">75</td>
                  <td class="py-3.5 px-3.5 text-center font-mono font-bold text-blue-600 text-base">92</td>
                  <td class="py-3.5 px-3.5 text-center font-bold text-emerald-600">A</td>
                  <td class="py-3.5 px-3.5 text-center"><span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Tuntas</span></td>
                </tr>
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-slate-900">Tahfidz &amp; Tahsin Al-Qur'an</td>
                  <td class="py-3.5 px-3.5 text-center font-mono text-slate-600">80</td>
                  <td class="py-3.5 px-3.5 text-center font-mono font-bold text-blue-600 text-base">90</td>
                  <td class="py-3.5 px-3.5 text-center font-bold text-emerald-600">A</td>
                  <td class="py-3.5 px-3.5 text-center"><span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Tuntas</span></td>
                </tr>
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-slate-900">Bahasa Indonesia</td>
                  <td class="py-3.5 px-3.5 text-center font-mono text-slate-600">75</td>
                  <td class="py-3.5 px-3.5 text-center font-mono font-bold text-blue-600 text-base">88</td>
                  <td class="py-3.5 px-3.5 text-center font-bold text-emerald-600">A</td>
                  <td class="py-3.5 px-3.5 text-center"><span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Tuntas</span></td>
                </tr>
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-slate-900">Matematika</td>
                  <td class="py-3.5 px-3.5 text-center font-mono text-slate-600">75</td>
                  <td class="py-3.5 px-3.5 text-center font-mono font-bold text-blue-600 text-base">85</td>
                  <td class="py-3.5 px-3.5 text-center font-bold text-blue-600">B</td>
                  <td class="py-3.5 px-3.5 text-center"><span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Tuntas</span></td>
                </tr>
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-slate-900">{{ grade === 'SMP' ? 'Ilmu Pengetahuan Alam' : 'Pemrograman Kejuruan' }}</td>
                  <td class="py-3.5 px-3.5 text-center font-mono text-slate-600">75</td>
                  <td class="py-3.5 px-3.5 text-center font-mono font-bold text-blue-600 text-base">87</td>
                  <td class="py-3.5 px-3.5 text-center font-bold text-emerald-600">A</td>
                  <td class="py-3.5 px-3.5 text-center"><span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Tuntas</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Catatan Wali Kelas (Mudah Dibaca) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5">
          <span class="text-xs font-bold text-blue-700 uppercase tracking-wider block">Catatan &amp; Motivasi Wali Kelas</span>
          <p class="text-sm sm:text-base italic text-slate-800 leading-relaxed font-serif">
            "Ananda menunjukkan prestasi akademik yang sangat membanggakan dan aktif berkontribusi dalam kegiatan keagamaan sekolah. Terus pertahankan semangat dan budi pekerti luhur."
          </p>
          <div class="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-blue-100">
            <span>Wali Kelas: Ustadz H. Ahmad Fauzi, S.Pd.I</span>
            <span class="font-mono">Tervalidasi Digital</span>
          </div>
        </div>

        <!-- Validasi Keabsahan Digital -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Autentikasi Dokumen</span>
            <b class="text-slate-900 text-sm block font-bold mt-0.5">Dokumen Rapor Sah &bull; Terdaftar di Sistem Darqia 9</b>
            <span class="text-xs text-slate-500 font-mono block mt-0.5">Kode SHA-256: 4f8b9e...2a1c</span>
          </div>
          <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200">
            Terverifikasi
          </span>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors min-h-[44px]"
          @click="activePreviewStudent = null"
        >
          Tutup
        </button>
        <button
          type="button"
          class="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2 cursor-pointer transition-colors min-h-[44px]"
          @click="window.print()"
        >
          <AdminIcon name="printer" size="18" />
          <span>Cetak PDF Rapor</span>
        </button>
      </template>
    </AdminSlideOver>
  </div>
</template>
