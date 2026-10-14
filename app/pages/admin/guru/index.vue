<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import { useAdminGrade } from '~/composables/useAdminGrade'

definePageMeta({ layout: 'admin', name: 'admin-guru' })
useHead({ title: 'Data Guru & Staff | Admin Portal' })

const grade = useAdminGrade()
const schoolName = computed(() => grade.value === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const searchQuery = ref('')
const selectedRole = ref('all')
const selectedUnit = ref<'all' | 'SMP' | 'SMK' | 'Yayasan'>('all')

type StaffItem = {
  id: string
  nip: string
  name: string
  role: string
  unit: 'SMP' | 'SMK' | 'Yayasan'
  subject?: string
  phone: string
  status: 'GTY' | 'GTT' | 'Staf Tetap'
  rfidUid: string
}

const staffList = useState<StaffItem[]>('admin-staff-list', () => [
  { id: 'T-01', nip: '198204122005011003', name: 'Drs. H. Ahmad Fauzi, M.Pd.I', role: 'Kepala Sekolah', unit: 'SMK', phone: '081288990011', status: 'GTY', rfidUid: 'E28068940001' },
  { id: 'T-02', nip: '198506152009022004', name: 'Ust. H. Ahmad Fauzi, S.Pd.I', role: 'Waka Kurikulum / Guru PAI', unit: 'SMP', subject: 'PAI', phone: '081288990012', status: 'GTY', rfidUid: 'E28068940002' },
  { id: 'T-03', nip: '199002102015011005', name: 'Hendra Gunawan, M.Kom', role: 'Kaprodi RPL / Guru Produktif', unit: 'SMK', subject: 'PBO & Web', phone: '081377889922', status: 'GTY', rfidUid: 'E28068940003' },
  { id: 'T-04', nip: '199208222017011006', name: 'Fajar Nugraha, S.T', role: 'Kaprodi TKJ / Guru Produktif', unit: 'SMK', subject: 'Jaringan & AIJ', phone: '081377889923', status: 'GTY', rfidUid: 'E28068940004' },
  { id: 'T-05', nip: '198811192014022007', name: 'Aisyah Putri, M.Pd', role: 'Guru Matematika', unit: 'SMP', subject: 'Matematika', phone: '081299881122', status: 'GTY', rfidUid: 'E28068940005' },
  { id: 'T-06', nip: '199304052018022008', name: 'Rina Kurniawati, S.Pd', role: 'Guru Bahasa Indonesia', unit: 'SMP', subject: 'B. Indonesia', phone: '081299881123', status: 'GTT', rfidUid: 'E28068940006' },
  { id: 'T-07', nip: '198703122012011009', name: 'Budi Santoso, S.Si', role: 'Guru IPA', unit: 'SMP', subject: 'IPA Terpadu', phone: '081299881124', status: 'GTY', rfidUid: 'E28068940007' },
  { id: 'T-08', nip: '199507142020011010', name: 'Farhan Maulana, S.Pd', role: 'Guru Bahasa Inggris', unit: 'SMP', subject: 'B. Inggris', phone: '081299881125', status: 'GTT', rfidUid: 'E28068940008' },
  { id: 'T-09', nip: '199109092016022011', name: 'Siti Rahmawati, S.Kom', role: 'Guru Basis Data', unit: 'SMK', subject: 'Basis Data', phone: '081377889924', status: 'GTY', rfidUid: 'E28068940009' },
  { id: 'T-10', nip: '198401012008011012', name: 'Ust. M. Rizky, Lc', role: 'Guru Tahfidz', unit: 'SMP', subject: 'Tahfidz Al-Qur\'an', phone: '081288990013', status: 'GTY', rfidUid: 'E28068940010' },
  { id: 'T-11', nip: '199405062019011013', name: 'Sulaeman, S.Kom', role: 'Kepala Tata Usaha', unit: 'Yayasan', phone: '081299881126', status: 'Staf Tetap', rfidUid: 'E28068940011' },
  { id: 'T-12', nip: '199602032021022014', name: 'Fitri Handayani, A.Md', role: 'Staf Administrasi & Keuangan', unit: 'Yayasan', phone: '081299881127', status: 'Staf Tetap', rfidUid: 'E28068940012' }
])

const filteredStaff = computed(() => {
  return staffList.value.filter(s => {
    if (selectedUnit.value !== 'all' && s.unit !== selectedUnit.value) return false
    if (selectedRole.value !== 'all' && !s.role.toLowerCase().includes(selectedRole.value.toLowerCase())) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.nip.includes(q) || s.role.toLowerCase().includes(q)
    }
    return true
  })
})

// Modal Form
const isModalOpen = ref(false)
const editingStaff = ref<StaffItem | null>(null)
const formData = ref({
  nip: '',
  name: '',
  role: '',
  unit: 'SMK' as StaffItem['unit'],
  subject: '',
  phone: '',
  status: 'GTY' as StaffItem['status'],
  rfidUid: ''
})

const openAddModal = () => {
  editingStaff.value = null
  formData.value = {
    nip: '',
    name: '',
    role: '',
    unit: grade.value,
    subject: '',
    phone: '',
    status: 'GTY',
    rfidUid: ''
  }
  isModalOpen.value = true
}

const openEditModal = (s: StaffItem) => {
  editingStaff.value = s
  formData.value = { ...s }
  isModalOpen.value = true
}

const saveStaff = () => {
  if (!formData.value.name || !formData.value.nip) {
    alert('Mohon isi NIP dan Nama Lengkap guru/staff!')
    return
  }

  if (editingStaff.value) {
    const idx = staffList.value.findIndex(item => item.id === editingStaff.value?.id)
    if (idx !== -1) {
      staffList.value[idx] = { ...formData.value, id: editingStaff.value.id }
    }
  } else {
    staffList.value.unshift({
      id: `T-${Date.now()}`,
      ...formData.value
    })
  }

  isModalOpen.value = false
}

const deleteStaff = (id: string) => {
  if (confirm('Yakin ingin menghapus data pendidik ini?')) {
    staffList.value = staffList.value.filter(s => s.id !== id)
  }
}

const exportStaffCsv = () => {
  const headers = ['No', 'NIP/NUPTK', 'Nama Lengkap', 'Jabatan/Tugas', 'Unit', 'Mapel Utama', 'No HP', 'Status', 'RFID UID']
  const rows = filteredStaff.value.map((s, i) => [
    i + 1,
    `"${s.nip}"`,
    `"${s.name}"`,
    `"${s.role}"`,
    s.unit,
    `"${s.subject || '-'}"`,
    `"${s.phone}"`,
    s.status,
    `"${s.rfidUid}"`
  ])
  const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `data-guru-staff-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6 animate-fadeUp">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Ekosistem Pendidikan Attaqwa 9
          </span>
          <span class="text-xs font-semibold text-slate-500">Pendidik &amp; Tenaga Kependidikan</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Data Guru &amp; Staff</h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Manajemen profil pendidik, penugasan, dan integrasi kartu absensi RFID</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          @click="exportStaffCsv"
        >
          <AdminIcon name="dl" size="16" />
          <span>Ekspor CSV</span>
        </button>
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          @click="openAddModal"
        >
          <AdminIcon name="plus" size="16" />
          <span>Tambah Guru/Staff</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Guru &amp; Staff</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">{{ staffList.length }} Orang</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Seluruh Unit Sekolah</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Guru SMP IT BCA</span>
        <b class="text-2xl font-bold text-emerald-600 block mt-1">
          {{ staffList.filter(s => s.unit === 'SMP').length }} Guru
        </b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Pendidik aktif SMP</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Guru SMK IT Attaqwa 9</span>
        <b class="text-2xl font-bold text-blue-600 block mt-1">
          {{ staffList.filter(s => s.unit === 'SMK').length }} Guru
        </b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Pendidik aktif SMK</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Kartu RFID Terdaftar</span>
        <b class="text-2xl font-bold text-slate-900 block mt-1">100%</b>
        <span class="text-[11px] text-slate-500 block mt-0.5">Semua guru memiliki RFID</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama guru, NIP, atau jabatan..."
          class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-medium transition-colors"
        />
        <AdminIcon name="search" size="16" class="absolute left-3 top-3 text-slate-400" />
      </div>

      <select
        v-model="selectedUnit"
        class="w-full sm:w-44 px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold cursor-pointer"
      >
        <option value="all">Semua Unit</option>
        <option value="SMP">SMP IT BCA</option>
        <option value="SMK">SMK IT Attaqwa 9</option>
        <option value="Yayasan">Yayasan / TU</option>
      </select>
    </div>

    <!-- Staff Table -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-4">Nama &amp; Gelar</th>
              <th class="py-3.5 px-4">NIP / NUPTK</th>
              <th class="py-3.5 px-4">Jabatan &amp; Tugas</th>
              <th class="py-3.5 px-4">Unit Sekolah</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4">RFID UID</th>
              <th class="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="s in filteredStaff"
              :key="s.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    {{ s.name.charAt(0) }}
                  </span>
                  <div>
                    <b class="text-slate-900 block font-bold">{{ s.name }}</b>
                    <span class="text-[11px] text-slate-400 font-mono">{{ s.phone }}</span>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4 font-mono text-slate-600">{{ s.nip }}</td>
              <td class="py-3.5 px-4 font-medium text-slate-800">{{ s.role }}</td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-200': s.unit === 'SMP',
                    'bg-blue-50 text-blue-700 border border-blue-200': s.unit === 'SMK',
                    'bg-purple-50 text-purple-700 border border-purple-200': s.unit === 'Yayasan'
                  }"
                >
                  {{ s.unit }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700">
                  {{ s.status }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{{ s.rfidUid }}</td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Ubah Data"
                    @click="openEditModal(s)"
                  >
                    <AdminIcon name="pencil" size="15" />
                  </button>
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Hapus"
                    @click="deleteStaff(s.id)"
                  >
                    <AdminIcon name="trash" size="15" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredStaff.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400 font-medium">
                Tidak ada data guru atau staff ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Center: Form Guru & Staff (Mobile First & Modern) -->
    <AdminSlideOver
      :open="isModalOpen"
      :title="editingStaff ? 'Ubah Data Guru & Staff' : 'Tambah Guru & Staff Baru'"
      :subtitle="editingStaff ? `Perbarui profil & penugasan: ${editingStaff.name}` : `Formulir registrasi pendidik & tenaga kependidikan ${schoolName}`"
      :badge="editingStaff ? 'Edit Data' : 'Registrasi Baru'"
      :badge-type="editingStaff ? 'warning' : 'primary'"
      icon="user"
      width="lg"
      @close="isModalOpen = false"
    >
      <div class="space-y-5 text-sm">
        <!-- Section 1: Identitas Pokok -->
        <div class="space-y-3.5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
            Identitas Pokok Pendidik
          </span>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap &amp; Gelar</label>
            <input
              v-model="formData.name"
              placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd.I"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">NIP / NUPTK</label>
              <input
                v-model="formData.nip"
                placeholder="18 digit NIP resmi"
                class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-mono font-bold text-sm text-slate-800 transition-all min-h-[44px]"
              />
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Status Kepegawaian</label>
              <select
                v-model="formData.status"
                class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 cursor-pointer transition-all min-h-[44px]"
              >
                <option value="GTY">GTY (Tetap Yayasan)</option>
                <option value="GTT">GTT (Honorer)</option>
                <option value="Staf Tetap">Staf Tetap Operasional</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 2: Penugasan & Unit -->
        <div class="space-y-3.5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
            Penugasan &amp; Unit Sekolah
          </span>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Unit Penempatan</label>
            <select
              v-model="formData.unit"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 cursor-pointer transition-all min-h-[44px]"
            >
              <option value="SMP">SMP IT Bina Cendekia Assalam</option>
              <option value="SMK">SMK IT Attaqwa 9</option>
              <option value="Yayasan">Yayasan / Tata Usaha Terpadu</option>
            </select>
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Jabatan &amp; Tanggung Jawab</label>
            <input
              v-model="formData.role"
              placeholder="Contoh: Guru Matematika / Wali Kelas IX-A"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
        </div>

        <!-- Section 3: Kontak & Presensi RFID -->
        <div class="space-y-3.5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
            Kontak &amp; Presensi RFID
          </span>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Nomor Handphone / WhatsApp</label>
            <input
              v-model="formData.phone"
              placeholder="Contoh: 081299887766"
              class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-mono font-bold text-sm text-slate-800 transition-all min-h-[44px]"
            />
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">UID Kartu RFID Presensi</label>
            <div class="relative">
              <input
                v-model="formData.rfidUid"
                placeholder="Tap kartu RFID pada scanner atau ketik UID"
                class="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none font-mono font-bold text-sm text-slate-800 transition-all min-h-[44px]"
              />
              <AdminIcon name="idcard" size="18" class="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
            <p class="text-xs text-slate-500 mt-1">Kartu ini digunakan untuk absensi kehadiran di gerbang &amp; ruang guru.</p>
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
          @click="saveStaff"
        >
          <AdminIcon name="check" size="16" />
          <span>{{ editingStaff ? 'Perbarui Data' : 'Simpan Pendidik' }}</span>
        </button>
      </template>
    </AdminSlideOver>
  </div>
</template>
