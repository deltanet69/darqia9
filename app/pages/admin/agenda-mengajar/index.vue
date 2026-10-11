<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({ layout: 'admin', name: 'admin-agenda-mengajar' })
useHead({ title: 'Agenda Mengajar | Admin Portal' })

const grade = useAdminGrade()
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const searchQuery = ref('')
const selectedStatus = ref('all')
const isModalOpen = ref(false)

type TeachingAgenda = {
  id: string
  date: string
  teacherName: string
  className: string
  subject: string
  topic: string
  attendanceSummary: string
  notes: string
  status: 'Terverifikasi' | 'Menunggu Verifikasi'
  grade: 'SMP' | 'SMK'
}

const agendaList = useState<TeachingAgenda[]>('admin-teaching-agenda', () => [
  {
    id: 'AG-01',
    date: '10 Okt 2026',
    teacherName: 'Ust. H. Ahmad Fauzi, S.Pd.I',
    className: 'VII-A',
    subject: 'Pendidikan Agama Islam',
    topic: 'Keteladanan Khulafaur Rasyidin dan Penerapan Akhlak Terpuji',
    attendanceSummary: '32 Hadir · 0 Izin · 0 Alpa',
    notes: 'Diskusi kelompok berjalan sangat aktif dan tertib.',
    status: 'Terverifikasi',
    grade: 'SMP'
  },
  {
    id: 'AG-02',
    date: '10 Okt 2026',
    teacherName: 'Aisyah Putri, M.Pd',
    className: 'VII-A',
    subject: 'Matematika Terpadu',
    topic: 'Aljabar Linier Dasar dan Penyelesaian Soal Cerita',
    attendanceSummary: '31 Hadir · 1 Sakit',
    notes: 'Sebagian siswa butuh pengayaan tambahan pada materi faktorisasi.',
    status: 'Terverifikasi',
    grade: 'SMP'
  },
  {
    id: 'AG-03',
    date: '09 Okt 2026',
    teacherName: 'Budi Santoso, S.Si',
    className: 'VIII-A',
    subject: 'Ilmu Pengetahuan Alam',
    topic: 'Praktikum Sistem Pernapasan Manusia di Laboratorium',
    attendanceSummary: '32 Hadir (100%)',
    notes: 'Seluruh alat peraga lab berfungsi optimal.',
    status: 'Terverifikasi',
    grade: 'SMP'
  },
  {
    id: 'AG-04',
    date: '10 Okt 2026',
    teacherName: 'Hendra Gunawan, M.Kom',
    className: 'X RPL 1',
    subject: 'Pemrograman Berorientasi Objek',
    topic: 'Konsep Inheritance, Polimorfisme, dan Interface di Java',
    attendanceSummary: '34 Hadir · 1 Izin',
    notes: 'Praktikum coding berjalan lancar di Lab Komputer RPL.',
    status: 'Terverifikasi',
    grade: 'SMK'
  },
  {
    id: 'AG-05',
    date: '10 Okt 2026',
    teacherName: 'Fajar Nugraha, S.T',
    className: 'X TKJ 1',
    subject: 'Administrasi Jaringan',
    topic: 'Konfigurasi VLAN & Routing Dinamis MikroTik RouterOS',
    attendanceSummary: '35 Hadir (100%)',
    notes: 'Seluruh routerboard lab berfungsi normal.',
    status: 'Menunggu Verifikasi',
    grade: 'SMK'
  },
  {
    id: 'AG-06',
    date: '09 Okt 2026',
    teacherName: 'Siti Rahmawati, S.Kom',
    className: 'XI RPL 1',
    subject: 'Basis Data & SQL',
    topic: 'Normalisasi Relasi Tabel hingga 3NF & Indexing Database',
    attendanceSummary: '33 Hadir · 1 Sakit',
    notes: 'Kuis singkat di akhir jam pelajaran tercapai 92%.',
    status: 'Terverifikasi',
    grade: 'SMK'
  }
])

const filteredAgenda = computed(() => {
  return agendaList.value.filter(a => {
    if (a.grade !== grade.value) return false
    if (selectedStatus.value !== 'all' && a.status !== selectedStatus.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return a.teacherName.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q) || a.topic.toLowerCase().includes(q)
    }
    return true
  })
})

const newAgenda = ref({
  teacherName: '',
  className: '',
  subject: '',
  topic: '',
  attendanceSummary: 'Hadir Penuh',
  notes: ''
})

const submitAgenda = () => {
  if (!newAgenda.value.teacherName || !newAgenda.value.topic) {
    alert('Mohon lengkapi nama guru dan topik materi KBM!')
    return
  }
  agendaList.value.unshift({
    id: `AG-${Date.now()}`,
    date: 'Hari Ini',
    teacherName: newAgenda.value.teacherName,
    className: newAgenda.value.className || (grade.value === 'SMP' ? 'VII-A' : 'X RPL 1'),
    subject: newAgenda.value.subject || 'Mata Pelajaran Umum',
    topic: newAgenda.value.topic,
    attendanceSummary: newAgenda.value.attendanceSummary,
    notes: newAgenda.value.notes || '-',
    status: 'Menunggu Verifikasi',
    grade: grade.value
  })
  isModalOpen.value = false
  newAgenda.value = { teacherName: '', className: '', subject: '', topic: '', attendanceSummary: 'Hadir Penuh', notes: '' }
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
          <span class="text-xs font-semibold text-slate-500">Jurnal KBM Harian Guru</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Agenda Mengajar Guru</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Pencatatan realisasi materi pembelajaran, presensi kelas, dan catatan kemajuan siswa</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          @click="isModalOpen = true"
        >
          <AdminIcon name="plus" size="16" />
          <span>Isi Agenda KBM</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Jurnal KBM</span>
        <b class="text-2xl font-black text-slate-900 block mt-1">{{ filteredAgenda.length }} Jurnal</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Tercatat di sistem</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Terverifikasi Kurikulum</span>
        <b class="text-2xl font-black text-emerald-600 block mt-1">
          {{ filteredAgenda.filter(a => a.status === 'Terverifikasi').length }}
        </b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Sesuai silabus KBM</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Menunggu Validasi</span>
        <b class="text-2xl font-black text-amber-500 block mt-1">
          {{ filteredAgenda.filter(a => a.status === 'Menunggu Verifikasi').length }}
        </b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Perlu ditinjau Waka</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Rata-rata Kehadiran</span>
        <b class="text-2xl font-black text-blue-600 block mt-1">98.5%</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Partisipasi siswa tinggi</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari guru, topik materi, atau mata pelajaran..."
          class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-medium transition-colors"
        />
        <AdminIcon name="search" size="16" class="absolute left-3 top-3 text-slate-400" />
      </div>

      <select
        v-model="selectedStatus"
        class="w-full sm:w-48 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
      >
        <option value="all">Semua Status Validasi</option>
        <option value="Terverifikasi">Terverifikasi</option>
        <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
      </select>
    </div>

    <!-- Agenda Table -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4">Tanggal &amp; Kelas</th>
              <th class="py-3.5 px-4">Nama Guru</th>
              <th class="py-3.5 px-4">Mata Pelajaran</th>
              <th class="py-3.5 px-4">Materi / Pokok Bahasan</th>
              <th class="py-3.5 px-4">Presensi Kelas</th>
              <th class="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="a in filteredAgenda"
              :key="a.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="py-3.5 px-4">
                <b class="text-slate-900 block font-bold">{{ a.date }}</b>
                <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700 mt-0.5 inline-block">
                  {{ a.className }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-bold text-slate-800">{{ a.teacherName }}</td>
              <td class="py-3.5 px-4 font-semibold text-blue-600">{{ a.subject }}</td>
              <td class="py-3.5 px-4 max-w-xs">
                <span class="block text-slate-900 font-bold leading-snug">{{ a.topic }}</span>
                <span class="block text-[11px] text-slate-500 italic mt-0.5 truncate">{{ a.notes }}</span>
              </td>
              <td class="py-3.5 px-4 text-slate-600 font-medium">{{ a.attendanceSummary }}</td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold"
                  :class="a.status === 'Terverifikasi' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                >
                  {{ a.status }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredAgenda.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 font-medium">
                Tidak ada data agenda KBM ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Center: Isi Agenda Mengajar Baru (Mobile First & Modern) -->
    <AdminSlideOver
      :open="isModalOpen"
      title="Isi Agenda Mengajar Harian"
      :subtitle="`Pencatatan realisasi KBM &bull; ${schoolName}`"
      badge="Jurnal KBM"
      badge-type="primary"
      icon="file"
      width="lg"
      @close="isModalOpen = false"
    >
      <div class="space-y-4 sm:space-y-5 text-sm">
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Nama Guru Pengajar</label>
          <input
            v-model="newAgenda.teacherName"
            placeholder="Contoh: Hendra Gunawan, M.Kom"
            class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Kelas</label>
            <input
              v-model="newAgenda.className"
              placeholder="Contoh: VII-A / X RPL 1"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Mata Pelajaran</label>
            <input
              v-model="newAgenda.subject"
              placeholder="Contoh: Pemrograman Web"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Pokok Bahasan / Materi KBM</label>
          <textarea
            v-model="newAgenda.topic"
            rows="3"
            placeholder="Rangkuman materi, capaian pembelajaran & aktivitas KBM yang diajarkan hari ini"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all leading-relaxed"
          />
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Ringkasan Presensi Siswa</label>
          <input
            v-model="newAgenda.attendanceSummary"
            placeholder="Contoh: 32 Hadir · 0 Izin · 0 Alpa (Lengkap)"
            class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
          />
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Catatan Kejadian &amp; Refleksi Guru</label>
          <textarea
            v-model="newAgenda.notes"
            rows="2"
            placeholder="Catatan perkembangan pemahaman siswa atau kendala teknis KBM"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all"
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
          @click="submitAgenda"
        >
          <AdminIcon name="check" size="16" />
          <span>Simpan Agenda KBM</span>
        </button>
      </template>
    </AdminSlideOver>
  </div>
</template>
