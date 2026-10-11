<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({ layout: 'admin', name: 'admin-lms' })
useHead({ title: 'Manajemen LMS | Admin Portal' })

const grade = useAdminGrade()
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const searchQuery = ref('')
const selectedFilter = ref('all')
const isModalOpen = ref(false)

type LmsCourse = {
  id: string
  title: string
  className: string
  teacherName: string
  materialsCount: number
  assignmentsCount: number
  studentsCount: number
  activeDiscussions: number
  status: 'Aktif' | 'Selesai' | 'Draft'
  grade: 'SMP' | 'SMK'
}

const courses = useState<LmsCourse[]>('admin-lms-courses', () => [
  // SMP Courses
  { id: 'LMS-01', title: 'PAI & Karakter Islami (Adab & Fiqih Ibadah)', className: 'VII-A', teacherName: 'Ust. H. Ahmad Fauzi, S.Pd.I', materialsCount: 14, assignmentsCount: 4, studentsCount: 32, activeDiscussions: 6, status: 'Aktif', grade: 'SMP' },
  { id: 'LMS-02', title: 'Matematika Terpadu: Persamaan & Pertidaksamaan', className: 'VIII-A', teacherName: 'Aisyah Putri, M.Pd', materialsCount: 18, assignmentsCount: 6, studentsCount: 32, activeDiscussions: 12, status: 'Aktif', grade: 'SMP' },
  { id: 'LMS-03', title: 'Ilmu Pengetahuan Alam: Ekosistem & Lingkungan Hidup', className: 'VIII-B', teacherName: 'Budi Santoso, S.Si', materialsCount: 12, assignmentsCount: 3, studentsCount: 30, activeDiscussions: 4, status: 'Aktif', grade: 'SMP' },
  { id: 'LMS-04', title: 'Informatika: Logika Komputasional & Algoritma', className: 'IX-A', teacherName: 'Dedi Prasetyo, S.Kom', materialsCount: 16, assignmentsCount: 5, studentsCount: 34, activeDiscussions: 8, status: 'Aktif', grade: 'SMP' },

  // SMK Courses
  { id: 'LMS-05', title: 'Pemrograman Web Dinamis (Vue.js & REST API)', className: 'XI RPL 1', teacherName: 'Hendra Gunawan, M.Kom', materialsCount: 22, assignmentsCount: 8, studentsCount: 35, activeDiscussions: 18, status: 'Aktif', grade: 'SMK' },
  { id: 'LMS-06', title: 'Administrasi Jaringan: MikroTik Certified Training', className: 'X TKJ 1', teacherName: 'Fajar Nugraha, S.T', materialsCount: 20, assignmentsCount: 7, studentsCount: 35, activeDiscussions: 15, status: 'Aktif', grade: 'SMK' },
  { id: 'LMS-07', title: 'Basis Data Terdistribusi & Replikasi Data', className: 'XI RPL 1', teacherName: 'Siti Rahmawati, S.Kom', materialsCount: 15, assignmentsCount: 4, studentsCount: 33, activeDiscussions: 9, status: 'Aktif', grade: 'SMK' },
  { id: 'LMS-08', title: 'Keamanan Cyber & Ethical Hacking Dasar', className: 'XII TKJ 1', teacherName: 'Fajar Nugraha, S.T', materialsCount: 24, assignmentsCount: 9, studentsCount: 34, activeDiscussions: 21, status: 'Aktif', grade: 'SMK' }
])

const filteredCourses = computed(() => {
  return courses.value.filter(c => {
    if (c.grade !== grade.value) return false
    if (selectedFilter.value !== 'all' && c.status !== selectedFilter.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return c.title.toLowerCase().includes(q) || c.teacherName.toLowerCase().includes(q) || c.className.toLowerCase().includes(q)
    }
    return true
  })
})

const totalStudents = computed(() => {
  return filteredCourses.value.reduce((acc, curr) => acc + curr.studentsCount, 0)
})

const totalMaterials = computed(() => {
  return filteredCourses.value.reduce((acc, curr) => acc + curr.materialsCount, 0)
})

const newCourse = ref({
  title: '',
  className: '',
  teacherName: ''
})

const saveCourse = () => {
  if (!newCourse.value.title || !newCourse.value.teacherName) {
    alert('Mohon isi judul kelas daring dan nama pengampu!')
    return
  }
  courses.value.unshift({
    id: `LMS-${Date.now()}`,
    title: newCourse.value.title,
    className: newCourse.value.className || (grade.value === 'SMP' ? 'VII-A' : 'X RPL 1'),
    teacherName: newCourse.value.teacherName,
    materialsCount: 1,
    assignmentsCount: 0,
    studentsCount: 32,
    activeDiscussions: 0,
    status: 'Aktif',
    grade: grade.value
  })
  isModalOpen.value = false
  newCourse.value = { title: '', className: '', teacherName: '' }
}
</script>

<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span
            class="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider border"
            :class="grade === 'SMP' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'"
          >
            {{ schoolName }}
          </span>
          <span class="text-xs font-semibold text-slate-500">Learning Management System (LMS)</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Manajemen LMS</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Pengelolaan ruang kelas virtual, penugasan digital, dan forum diskusi interaktif</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          @click="isModalOpen = true"
        >
          <AdminIcon name="plus" size="16" />
          <span>Buka Kursus Baru</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Kelas Daring Aktif</span>
        <b class="text-2xl font-black text-slate-900 block mt-1">{{ filteredCourses.length }} Kursus</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Ruang belajar virtual</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Materi Daring</span>
        <b class="text-2xl font-black text-blue-600 block mt-1">{{ totalMaterials }} Materi</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Video &amp; dokumen aktif</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Partisipasi Siswa</span>
        <b class="text-2xl font-black text-emerald-600 block mt-1">{{ totalStudents }} Siswa</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Terdaftar di kursus</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Interaksi Forum</span>
        <b class="text-2xl font-black text-purple-600 block mt-1">
          {{ filteredCourses.reduce((a, b) => a + b.activeDiscussions, 0) }} Diskusi
        </b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Tanya jawab berjalan</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul kelas LMS, nama pengampu, atau rombel..."
          class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-medium transition-colors"
        />
        <AdminIcon name="search" size="16" class="absolute left-3 top-3 text-slate-400" />
      </div>

      <select
        v-model="selectedFilter"
        class="w-full sm:w-48 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
      >
        <option value="all">Semua Status Kursus</option>
        <option value="Aktif">Aktif</option>
        <option value="Selesai">Selesai</option>
        <option value="Draft">Draft</option>
      </select>
    </div>

    <!-- Courses Grid / Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="c in filteredCourses"
        :key="c.id"
        class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {{ c.className }}
            </span>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {{ c.status }}
            </span>
          </div>

          <h3 class="text-base font-black text-slate-900 leading-snug">{{ c.title }}</h3>
          <p class="text-xs text-slate-500 mt-1 font-medium">Pengampu: <b class="text-slate-700">{{ c.teacherName }}</b></p>
        </div>

        <div class="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
          <div class="p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-slate-400 block font-semibold">Materi</span>
            <b class="text-slate-800 font-mono font-bold">{{ c.materialsCount }} Bab</b>
          </div>
          <div class="p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-slate-400 block font-semibold">Tugas</span>
            <b class="text-slate-800 font-mono font-bold">{{ c.assignmentsCount }} Tugas</b>
          </div>
          <div class="p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-slate-400 block font-semibold">Peserta</span>
            <b class="text-blue-600 font-mono font-bold">{{ c.studentsCount }} Siswa</b>
          </div>
        </div>
      </div>

      <div v-if="filteredCourses.length === 0" class="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200/80">
        Tidak ada kursus LMS ditemukan.
      </div>
    </div>

    <!-- Modal Center: Buka Kursus Baru (Mobile First & Modern) -->
    <AdminSlideOver
      :open="isModalOpen"
      title="Buka Ruang Kelas LMS Baru"
      :subtitle="`Learning Management System &bull; ${schoolName}`"
      badge="E-Learning"
      badge-type="info"
      icon="grad"
      width="lg"
      @close="isModalOpen = false"
    >
      <div class="space-y-4 sm:space-y-5 text-sm">
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Judul Kelas / Kursus Daring</label>
          <input
            v-model="newCourse.title"
            placeholder="Contoh: Pemrograman Framework Vue.js &amp; Nuxt"
            class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Rombel Kelas</label>
            <input
              v-model="newCourse.className"
              placeholder="Contoh: VII-A / XI RPL 1"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Guru Pengampu</label>
            <input
              v-model="newCourse.teacherName"
              placeholder="Nama guru pengajar"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Pengantar / Deskripsi Kelas</label>
          <textarea
            rows="3"
            placeholder="Tuliskan tujuan pembelajaran dan panduan umum ruang kelas daring ini"
            class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all leading-relaxed"
          />
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors min-h-[44px]"
          @click="isModalOpen = false"
        >
          Batal
        </button>
        <button
          type="button"
          class="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2 cursor-pointer transition-colors min-h-[44px]"
          @click="saveCourse"
        >
          <AdminIcon name="check" size="16" />
          <span>Buka Ruang Kelas</span>
        </button>
      </template>
    </AdminSlideOver>
  </div>
</template>
