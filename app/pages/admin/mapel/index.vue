<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({ layout: 'admin', name: 'admin-mapel' })
useHead({ title: 'Master Mapel | Admin Portal' })

const grade = useAdminGrade()
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const searchQuery = ref('')
const selectedCategory = ref('all')
const isModalOpen = ref(false)

type SubjectItem = {
  id: string
  code: string
  name: string
  category: 'Umum' | 'Kejuruan' | 'Keagamaan' | 'Muatan Lokal'
  kkm: number
  hoursPerWeek: number
  coordinator: string
  grade: 'SMP' | 'SMK'
  status: 'Aktif' | 'Nonaktif'
}

const subjects = useState<SubjectItem[]>('admin-master-subjects', () => [
  // SMP Subjects
  { id: 'S-01', code: 'SMP-PAI', name: 'Pendidikan Agama Islam & Budi Pekerti', category: 'Keagamaan', kkm: 75, hoursPerWeek: 4, coordinator: 'Ust. H. Ahmad Fauzi, S.Pd.I', grade: 'SMP', status: 'Aktif' },
  { id: 'S-02', code: 'SMP-TFZ', name: 'Tahfidz & Tahsin Al-Qur\'an', category: 'Keagamaan', kkm: 80, hoursPerWeek: 3, coordinator: 'Ust. M. Rizky, Lc', grade: 'SMP', status: 'Aktif' },
  { id: 'S-03', code: 'SMP-BIN', name: 'Bahasa Indonesia', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Rina Kurniawati, S.Pd', grade: 'SMP', status: 'Aktif' },
  { id: 'S-04', code: 'SMP-MAT', name: 'Matematika', category: 'Umum', kkm: 75, hoursPerWeek: 5, coordinator: 'Aisyah Putri, M.Pd', grade: 'SMP', status: 'Aktif' },
  { id: 'S-05', code: 'SMP-IPA', name: 'Ilmu Pengetahuan Alam (IPA Terpadu)', category: 'Umum', kkm: 75, hoursPerWeek: 5, coordinator: 'Budi Santoso, S.Si', grade: 'SMP', status: 'Aktif' },
  { id: 'S-06', code: 'SMP-IPS', name: 'Ilmu Pengetahuan Sosial (IPS Terpadu)', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Dra. Hj. Maryam, M.Pd', grade: 'SMP', status: 'Aktif' },
  { id: 'S-07', code: 'SMP-BIG', name: 'Bahasa Inggris', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Farhan Maulana, S.Pd', grade: 'SMP', status: 'Aktif' },
  { id: 'S-08', code: 'SMP-INF', name: 'Informatika & Literasi Digital', category: 'Muatan Lokal', kkm: 75, hoursPerWeek: 2, coordinator: 'Dedi Prasetyo, S.Kom', grade: 'SMP', status: 'Aktif' },

  // SMK Subjects
  { id: 'S-09', code: 'SMK-PAI', name: 'Pendidikan Agama Islam & Budi Pekerti', category: 'Keagamaan', kkm: 75, hoursPerWeek: 3, coordinator: 'Ust. H. Ahmad Fauzi, S.Pd.I', grade: 'SMK', status: 'Aktif' },
  { id: 'S-10', code: 'SMK-BIN', name: 'Bahasa Indonesia', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Rina Kurniawati, S.Pd', grade: 'SMK', status: 'Aktif' },
  { id: 'S-11', code: 'SMK-MAT', name: 'Matematika Terapan', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: 'Aisyah Putri, M.Pd', grade: 'SMK', status: 'Aktif' },
  { id: 'S-12', code: 'SMK-PBO', name: 'Pemrograman Berorientasi Objek (PBO)', category: 'Kejuruan', kkm: 78, hoursPerWeek: 6, coordinator: 'Hendra Gunawan, M.Kom', grade: 'SMK', status: 'Aktif' },
  { id: 'S-13', code: 'SMK-BD', name: 'Basis Data & SQL Lanjutan', category: 'Kejuruan', kkm: 78, hoursPerWeek: 4, coordinator: 'Siti Rahmawati, S.Kom', grade: 'SMK', status: 'Aktif' },
  { id: 'S-14', code: 'SMK-AIJ', name: 'Administrasi Infrastruktur Jaringan (AIJ)', category: 'Kejuruan', kkm: 78, hoursPerWeek: 6, coordinator: 'Fajar Nugraha, S.T', grade: 'SMK', status: 'Aktif' },
  { id: 'S-15', code: 'SMK-PKK', name: 'Produk Kreatif & Kewirausahaan (PKK)', category: 'Kejuruan', kkm: 75, hoursPerWeek: 5, coordinator: 'Irwan Setiawan, S.E', grade: 'SMK', status: 'Aktif' }
])

const filteredSubjects = computed(() => {
  return subjects.value.filter(s => {
    if (s.grade !== grade.value) return false
    if (selectedCategory.value !== 'all' && s.category !== selectedCategory.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.coordinator.toLowerCase().includes(q)
    }
    return true
  })
})

const totalHours = computed(() => {
  return filteredSubjects.value.reduce((acc, curr) => acc + curr.hoursPerWeek, 0)
})

const exportCsv = () => {
  const headers = ['No', 'Kode Mapel', 'Nama Mata Pelajaran', 'Kategori', 'KKM', 'Beban Jam/Minggu', 'Koordinator Guru', 'Jenjang', 'Status']
  const rows = filteredSubjects.value.map((s, i) => [
    i + 1,
    `"${s.code}"`,
    `"${s.name}"`,
    `"${s.category}"`,
    s.kkm,
    s.hoursPerWeek,
    `"${s.coordinator}"`,
    s.grade,
    s.status
  ])
  const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `master-mapel-${grade.value.toLowerCase()}-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Form tambah
const newForm = ref({
  code: '',
  name: '',
  category: 'Umum' as SubjectItem['category'],
  kkm: 75,
  hoursPerWeek: 4,
  coordinator: ''
})

const saveSubject = () => {
  if (!newForm.value.name || !newForm.value.code) {
    alert('Mohon isi kode dan nama mata pelajaran!')
    return
  }
  subjects.value.push({
    id: `S-${Date.now()}`,
    code: newForm.value.code.toUpperCase(),
    name: newForm.value.name,
    category: newForm.value.category,
    kkm: Number(newForm.value.kkm),
    hoursPerWeek: Number(newForm.value.hoursPerWeek),
    coordinator: newForm.value.coordinator || 'Tim Guru ' + grade.value,
    grade: grade.value,
    status: 'Aktif'
  })
  isModalOpen.value = false
  newForm.value = { code: '', name: '', category: 'Umum', kkm: 75, hoursPerWeek: 4, coordinator: '' }
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
          <span class="text-xs font-semibold text-slate-500">Struktur Kurikulum Nasional</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Master Mata Pelajaran</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Daftar mata pelajaran, bobot jam tatap muka, dan standar KKM</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          @click="exportCsv"
        >
          <AdminIcon name="dl" size="16" />
          <span>Ekspor CSV</span>
        </button>
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          @click="isModalOpen = true"
        >
          <AdminIcon name="plus" size="16" />
          <span>Tambah Mapel</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Mata Pelajaran</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">{{ filteredSubjects.length }} Mapel</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Kurikulum Aktif {{ grade }}</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Beban Tatap Muka</span>
        <b class="text-2xl font-bold text-blue-600 block mt-1">{{ totalHours }} Jam/Minggu</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Alokasi beban guru</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Standar KKM Rata-rata</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">75 - 78</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Kriteria Ketuntasan Minimum</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Status Kurikulum</span>
        <b class="text-2xl font-bold text-emerald-600 block mt-1">Terverifikasi</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Disetujui Waka Kurikulum</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kode mapel, nama mata pelajaran, atau koordinator..."
          class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-medium transition-colors"
        />
        <AdminIcon name="search" size="16" class="absolute left-3 top-3 text-slate-400" />
      </div>

      <select
        v-model="selectedCategory"
        class="w-full sm:w-48 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
      >
        <option value="all">Semua Kategori</option>
        <option value="Umum">Umum (Wajib)</option>
        <option value="Kejuruan">Kejuruan (Khusus SMK)</option>
        <option value="Keagamaan">Keagamaan / Al-Qur'an</option>
        <option value="Muatan Lokal">Muatan Lokal</option>
      </select>
    </div>

    <!-- Subjects Table -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4">Kode</th>
              <th class="py-3.5 px-4">Mata Pelajaran</th>
              <th class="py-3.5 px-4">Kategori</th>
              <th class="py-3.5 px-4">KKM</th>
              <th class="py-3.5 px-4">Beban Jam</th>
              <th class="py-3.5 px-4">Koordinator Pengampu</th>
              <th class="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="s in filteredSubjects"
              :key="s.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="py-3.5 px-4 font-mono font-bold text-blue-600">{{ s.code }}</td>
              <td class="py-3.5 px-4 font-bold text-slate-900">{{ s.name }}</td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold"
                  :class="{
                    'bg-blue-50 text-blue-700 border border-blue-200': s.category === 'Umum',
                    'bg-purple-50 text-purple-700 border border-purple-200': s.category === 'Kejuruan',
                    'bg-emerald-50 text-emerald-700 border border-emerald-200': s.category === 'Keagamaan',
                    'bg-amber-50 text-amber-700 border border-amber-200': s.category === 'Muatan Lokal'
                  }"
                >
                  {{ s.category }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-mono font-bold text-slate-800">{{ s.kkm }}</td>
              <td class="py-3.5 px-4 font-mono text-slate-600">{{ s.hoursPerWeek }} Jam / mg</td>
              <td class="py-3.5 px-4 font-medium text-slate-600">{{ s.coordinator }}</td>
              <td class="py-3.5 px-4">
                <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {{ s.status }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredSubjects.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400 font-medium">
                Tidak ada data mata pelajaran ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Center: Tambah Mapel Baru (Mobile First & Modern) -->
    <AdminSlideOver
      :open="isModalOpen"
      title="Tambah Mata Pelajaran Baru"
      :subtitle="`Struktur kurikulum nasional &bull; ${schoolName}`"
      badge="Kurikulum"
      badge-type="primary"
      icon="book"
      width="lg"
      @close="isModalOpen = false"
    >
      <div class="space-y-4 sm:space-y-5 text-sm">
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Kode Mata Pelajaran</label>
          <input
            v-model="newForm.code"
            placeholder="Contoh: SMK-RPL-01 atau SMP-IPA-02"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-mono font-bold text-sm text-slate-800 transition-all min-h-[44px]"
          />
          <p class="text-xs text-slate-500 mt-1">Kode unik identifikasi mata pelajaran di kurikulum sekolah.</p>
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Nama Mata Pelajaran</label>
          <input
            v-model="newForm.name"
            placeholder="Contoh: Pemrograman Web &amp; Mobile"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Kategori Kurikulum</label>
            <select
              v-model="newForm.category"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 cursor-pointer transition-all min-h-[44px]"
            >
              <option value="Umum">Umum (Wajib)</option>
              <option value="Kejuruan">Kejuruan (Khusus SMK)</option>
              <option value="Keagamaan">Keagamaan / Al-Qur'an</option>
              <option value="Muatan Lokal">Muatan Lokal</option>
            </select>
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Standar KKM Minimal</label>
            <input
              v-model.number="newForm.kkm"
              type="number"
              min="60"
              max="100"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-mono font-bold text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Alokasi Beban Jam (Jam/Minggu)</label>
          <input
            v-model.number="newForm.hoursPerWeek"
            type="number"
            min="1"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-mono font-bold text-sm text-slate-800 transition-all min-h-[44px]"
          />
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Guru Koordinator Pengampu</label>
          <input
            v-model="newForm.coordinator"
            placeholder="Nama guru penanggung jawab mata pelajaran"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
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
          @click="saveSubject"
        >
          <AdminIcon name="check" size="16" />
          <span>Simpan Mapel</span>
        </button>
      </template>
    </AdminSlideOver>
  </div>
</template>
