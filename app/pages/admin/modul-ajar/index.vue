<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({ layout: 'admin', name: 'admin-modul-ajar' })
useHead({ title: 'Modul Pembelajaran | Admin Portal' })

const grade = useAdminGrade()
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const searchQuery = ref('')
const selectedSubject = ref('all')
const isModalOpen = ref(false)

type LearningModule = {
  id: string
  title: string
  subject: string
  className: string
  author: string
  fileSize: string
  fileType: 'PDF' | 'DOCX' | 'PPTX'
  uploadDate: string
  downloads: number
  grade: 'SMP' | 'SMK'
}

const modules = useState<LearningModule[]>('admin-learning-modules', () => [
  // SMP Modules
  { id: 'MOD-01', title: 'Modul Ajar Fikih & Akhlak Terpuji Semester 1', subject: 'Pendidikan Agama Islam', className: 'VII SMP', author: 'Ust. H. Ahmad Fauzi, S.Pd.I', fileSize: '4.2 MB', fileType: 'PDF', uploadDate: '01 Agu 2026', downloads: 142, grade: 'SMP' },
  { id: 'MOD-02', title: 'Buku Ajar Aljabar & Geometri SMP Terpadu', subject: 'Matematika', className: 'VII & VIII SMP', author: 'Aisyah Putri, M.Pd', fileSize: '8.5 MB', fileType: 'PDF', uploadDate: '05 Agu 2026', downloads: 210, grade: 'SMP' },
  { id: 'MOD-03', title: 'Modul Praktikum IPA: Sistem Organ Manusia', subject: 'IPA Terpadu', className: 'VIII SMP', author: 'Budi Santoso, S.Si', fileSize: '5.1 MB', fileType: 'PDF', uploadDate: '12 Agu 2026', downloads: 98, grade: 'SMP' },
  { id: 'MOD-04', title: 'Panduan Literasi Digital & Pemrograman Scratch', subject: 'Informatika', className: 'IX SMP', author: 'Dedi Prasetyo, S.Kom', fileSize: '6.4 MB', fileType: 'PDF', uploadDate: '15 Agu 2026', downloads: 165, grade: 'SMP' },

  // SMK Modules
  { id: 'MOD-05', title: 'Modul Praktik PBO: Java OOP & Design Pattern', subject: 'Pemrograman Berorientasi Objek', className: 'X RPL', author: 'Hendra Gunawan, M.Kom', fileSize: '12.8 MB', fileType: 'PDF', uploadDate: '02 Agu 2026', downloads: 340, grade: 'SMK' },
  { id: 'MOD-06', title: 'Panduan Praktikum Cisco Packet Tracer & Routing OSPF', subject: 'Administrasi Jaringan (AIJ)', className: 'X & XI TKJ', author: 'Fajar Nugraha, S.T', fileSize: '15.4 MB', fileType: 'PDF', uploadDate: '04 Agu 2026', downloads: 295, grade: 'SMK' },
  { id: 'MOD-07', title: 'Modul Lengkap Perancangan Database MySQL & PostgreSQL', subject: 'Basis Data', className: 'X RPL', author: 'Siti Rahmawati, S.Kom', fileSize: '9.2 MB', fileType: 'PDF', uploadDate: '10 Agu 2026', downloads: 215, grade: 'SMK' },
  { id: 'MOD-08', title: 'Modul Produk Kreatif: Digital Marketing & E-Commerce', subject: 'Kewirausahaan (PKK)', className: 'XI & XII SMK', author: 'Irwan Setiawan, S.E', fileSize: '7.8 MB', fileType: 'PDF', uploadDate: '18 Agu 2026', downloads: 180, grade: 'SMK' }
])

const filteredModules = computed(() => {
  return modules.value.filter(m => {
    if (m.grade !== grade.value) return false
    if (selectedSubject.value !== 'all' && m.subject !== selectedSubject.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return m.title.toLowerCase().includes(q) || m.author.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q)
    }
    return true
  })
})

const uniqueSubjects = computed(() => {
  const set = new Set(modules.value.filter(m => m.grade === grade.value).map(m => m.subject))
  return Array.from(set).sort()
})

const newModule = ref({
  title: '',
  subject: '',
  className: '',
  author: ''
})

const saveModule = () => {
  if (!newModule.value.title || !newModule.value.subject) {
    alert('Mohon isi judul dan mata pelajaran modul!')
    return
  }
  modules.value.unshift({
    id: `MOD-${Date.now()}`,
    title: newModule.value.title,
    subject: newModule.value.subject,
    className: newModule.value.className || (grade.value === 'SMP' ? 'VII SMP' : 'X SMK'),
    author: newModule.value.author || 'Tim Guru ' + grade.value,
    fileSize: '3.5 MB',
    fileType: 'PDF',
    uploadDate: 'Hari Ini',
    downloads: 0,
    grade: grade.value
  })
  isModalOpen.value = false
  newModule.value = { title: '', subject: '', className: '', author: '' }
}

const downloadModule = (title: string) => {
  alert(`Memulai unduhan berkas: "${title}"`)
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
          <span class="text-xs font-semibold text-slate-500">Perangkat Kurikulum Merdeka</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Modul Pembelajaran</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Repositori bahan ajar digital, lembar kerja siswa (LKS), dan modul praktikum</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          @click="isModalOpen = true"
        >
          <AdminIcon name="upload" size="16" />
          <span>Unggah Modul Baru</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Modul Aktif</span>
        <b class="text-2xl font-black text-slate-900 block mt-1">{{ filteredModules.length }} Modul</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Bahan ajar terverifikasi</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Unduhan Siswa</span>
        <b class="text-2xl font-black text-blue-600 block mt-1">
          {{ filteredModules.reduce((a, b) => a + b.downloads, 0) }}x
        </b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Akses materi digital</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Mata Pelajaran Tercover</span>
        <b class="text-2xl font-black text-slate-900 block mt-1">{{ uniqueSubjects.length }} Mapel</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Semua mapel inti</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Status Perangkat Ajar</span>
        <b class="text-2xl font-black text-emerald-600 block mt-1">Lengkap</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Sesuai standar ATP</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul modul, nama penyusun, atau materi..."
          class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-medium transition-colors"
        />
        <AdminIcon name="search" size="16" class="absolute left-3 top-3 text-slate-400" />
      </div>

      <select
        v-model="selectedSubject"
        class="w-full sm:w-56 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
      >
        <option value="all">Semua Mata Pelajaran</option>
        <option v-for="s in uniqueSubjects" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <!-- Modules Table -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4">Judul Modul Pembelajaran</th>
              <th class="py-3.5 px-4">Mata Pelajaran</th>
              <th class="py-3.5 px-4">Kelas</th>
              <th class="py-3.5 px-4">Guru Penyusun</th>
              <th class="py-3.5 px-4">Ukuran &amp; Format</th>
              <th class="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="m in filteredModules"
              :key="m.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                    {{ m.fileType }}
                  </span>
                  <div>
                    <b class="text-slate-900 block font-bold">{{ m.title }}</b>
                    <span class="text-[11px] text-slate-400">Diunggah: {{ m.uploadDate }} &bull; {{ m.downloads }}x diunduh</span>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4 font-semibold text-slate-800">{{ m.subject }}</td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                  {{ m.className }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-600">{{ m.author }}</td>
              <td class="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{{ m.fileSize }}</td>
              <td class="py-3.5 px-4 text-right">
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                  @click="downloadModule(m.title)"
                >
                  <AdminIcon name="dl" size="14" />
                  <span>Unduh</span>
                </button>
              </td>
            </tr>
            <tr v-if="filteredModules.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 font-medium">
                Tidak ada modul pembelajaran ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Center: Unggah Modul Baru (Mobile First & Modern) -->
    <AdminSlideOver
      :open="isModalOpen"
      title="Unggah Modul Pembelajaran"
      :subtitle="`Repositori perangkat ajar kurikulum &bull; ${schoolName}`"
      badge="Perangkat Ajar"
      badge-type="primary"
      icon="upload"
      width="lg"
      @close="isModalOpen = false"
    >
      <div class="space-y-4 sm:space-y-5 text-sm">
        <!-- File Dropzone Box -->
        <div class="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/70 hover:bg-blue-50/30 transition-all cursor-pointer group">
          <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition-transform shadow-xs">
            <AdminIcon name="upload" size="22" />
          </div>
          <b class="text-sm font-bold text-slate-800 block">Pilih Berkas Modul (.PDF / .DOCX / .PPTX)</b>
          <span class="text-xs text-slate-500 block mt-1">Maksimal ukuran file 25 MB</span>
        </div>

        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Judul Modul Pembelajaran</label>
          <input
            v-model="newModule.title"
            placeholder="Contoh: Modul Pemrograman Dasar Java Semester 1"
            class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
          />
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Mata Pelajaran</label>
          <input
            v-model="newModule.subject"
            placeholder="Contoh: Pemrograman Berorientasi Objek"
            class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Target Kelas</label>
            <input
              v-model="newModule.className"
              placeholder="Contoh: VII SMP / X RPL"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Guru Penyusun</label>
            <input
              v-model="newModule.author"
              placeholder="Nama guru penyusun"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
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
          @click="saveModule"
        >
          <AdminIcon name="check" size="16" />
          <span>Simpan &amp; Terbitkan Modul</span>
        </button>
      </template>
    </AdminSlideOver>
  </div>
</template>
