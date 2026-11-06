<script setup lang="ts">
import { ref, reactive, watch, computed, onBeforeUnmount } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import type { StudentItem } from '~/composables/useAdminStudents'

const props = withDefaults(defineProps<{
  isOpen: boolean
  mode: 'add' | 'edit'
  grade: string
  initialData: Partial<StudentItem>
  classOptions?: string[]
}>(), {
  classOptions: () => []
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Partial<StudentItem>): void
}>()

const currentSection = ref<'pribadi' | 'ortu' | 'akademik' | 'fisik'>('pribadi')

const sections = [
  { id: 'pribadi', label: '1. Biodata & Alamat' },
  { id: 'ortu', label: '2. Data Orang Tua' },
  { id: 'akademik', label: '3. Akademik & Asal Sekolah' },
  { id: 'fisik', label: '4. Fisik & Lainnya' }
] as const

const sectionTitle = computed(() => {
  return sections.find(s => s.id === currentSection.value)?.label || ''
})

const form = reactive<Partial<StudentItem>>({})

const pendidikanOptions = ['Tidak sekolah', 'SD / Sederajat', 'SMP / Sederajat', 'SMA / SMK / Sederajat', 'D1 / D2 / D3', 'D4 / S1', 'S2', 'S3']
const parentGroups = [
  {
    title: 'A. Data Ayah / Wali', color: 'text-blue-600',
    fields: [
      { key: 'fatherName', label: 'Nama Lengkap', full: true, placeholder: 'cth: H. RIDWAN KAMIL' },
      { key: 'fatherPhone', label: 'No. HP / WA (untuk notifikasi)', mono: true, placeholder: 'cth: 082210823033' },
      { key: 'fatherEmail', label: 'Email Aktif (untuk notifikasi)', type: 'email', placeholder: 'cth: nama@email.com' },
      { key: 'fatherEducation', label: 'Pendidikan Terakhir', list: 'pendidikan-ortu', placeholder: 'Pilih atau ketik pendidikan' },
      { key: 'fatherJob', label: 'Pekerjaan', placeholder: 'cth: Wiraswasta' },
      { key: 'fatherIncome', label: 'Penghasilan', full: true, placeholder: 'cth: Rp 2.000.000 - Rp 4.999.999' }
    ]
  },
  {
    title: 'B. Data Ibu Kandung', color: 'text-pink-600',
    fields: [
      { key: 'motherName', label: 'Nama Lengkap', full: true, placeholder: 'cth: NURJANAH' },
      { key: 'motherPhone', label: 'No. HP / WA (untuk notifikasi)', mono: true, placeholder: 'cth: 082210823033' },
      { key: 'motherEmail', label: 'Email Aktif (untuk notifikasi)', type: 'email', placeholder: 'cth: nama@email.com' },
      { key: 'motherEducation', label: 'Pendidikan Terakhir', list: 'pendidikan-ortu', placeholder: 'Pilih atau ketik pendidikan' },
      { key: 'motherJob', label: 'Pekerjaan', placeholder: 'cth: Mengurus Rumah Tangga' },
      { key: 'motherIncome', label: 'Penghasilan', full: true, placeholder: 'cth: Rp 500.000 - Rp 1.999.999' }
    ]
  }
] as const

watch(
  () => props.isOpen,
  (open) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = open ? 'hidden' : ''
    }
  }
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

watch(
  () => props.initialData,
  (val) => {
    for (const key of Object.keys(form)) delete (form as Record<string, unknown>)[key]
    Object.assign(form, val)
    if (props.mode === 'add' && !form.id && form.nis) {
      form.id = `${props.grade}-${form.nis}`
    }
  },
  { immediate: true, deep: true }
)

const handleNisInput = () => {
  if (props.mode === 'add' && form.nis) {
    form.id = `${props.grade}-${form.nis.trim()}`
  }
}

const handleSubmit = () => {
  emit('save', { ...form })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-5 md:p-6"
    >
      <!-- Backdrop Gelap dengan Blur Halus -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          class="fixed inset-0 bg-slate-950/65 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
          @click="$emit('close')"
        />
      </Transition>

      <!-- Centered Modal Card (Keren, Modern, Mobile-First) -->
      <Transition
        enter-active-class="transition duration-200 ease-out transform"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in transform"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          class="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/30 border border-slate-200/90 z-10 h-[calc(100dvh-1.75rem)] sm:h-[min(800px,calc(100dvh-2.5rem))] flex flex-col overflow-hidden font-admin"
          role="dialog"
          aria-modal="true"
        >
          <!-- HEADER STICKY -->
          <div class="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-xs sticky top-0 z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80 shadow-xs">
                <AdminIcon name="student" size="20" />
              </div>
              <div>
                <h3 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  {{ mode === 'add' ? 'Tambah Data Siswa Baru' : 'Edit Data Induk Siswa' }}
                </h3>
                <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Lengkapi data pokok peserta didik sesuai format Dapodik resmi.
                </p>
              </div>
            </div>
            <button
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer touch-manipulation shrink-0"
              type="button"
              aria-label="Tutup dialog"
              @click="$emit('close')"
            >
              <AdminIcon name="x" size="18" />
            </button>
          </div>

          <!-- FORM TABS (TOUCH FRIENDLY) -->
          <div class="flex gap-2 px-5 sm:px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto shrink-0">
            <button
              v-for="st in sections"
              :key="st.id"
              type="button"
              class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition min-h-[38px] cursor-pointer"
              :class="currentSection === st.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'"
              @click="currentSection = st.id"
            >
              {{ st.label }}
            </button>
          </div>

          <form class="flex flex-col flex-1 min-h-0 overflow-hidden" @submit.prevent="handleSubmit">
          <div class="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
            <!-- SECTION 1: BIODATA & ALAMAT -->
            <template v-if="currentSection === 'pribadi'">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">Nama Lengkap <span class="text-rose-500">*</span></label>
                  <input v-model="form.name" required class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: AHMAD FAUZI" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">ID Siswa (Billing)</label>
                  <input v-model="form.id" :readonly="mode === 'edit'" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: SMK-26270120117" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">NIS</label>
                  <input v-model="form.nis" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 26270120117" @input="handleNisInput" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">NISN (minimal 5 digit)<span class="text-rose-500">*</span></label>
                  <input v-model="form.nisn" required class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 0078912345" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">NIK Siswa (16 Digit)</label>
                  <input v-model="form.nik" maxlength="16" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 3216020103090009" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Jenis Kelamin <span class="text-rose-500">*</span></label>
                  <select v-model="form.gender" required class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500">
                    <option value="L">Laki laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Agama</label>
                  <select v-model="form.religion" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500">
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input v-model="form.birthPlace" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: BEKASI" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input v-model="form.birthDate" type="date" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                  <input v-model="form.address" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: UJUNG HARAPAN RT. 006/ 015" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">No. HP / WA Siswa</label>
                  <input v-model="form.phone" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 081299887701" />
                </div>
              </div>
            </template>

            <!-- SECTION 2: DATA ORANG TUA -->
            <template v-else-if="currentSection === 'ortu'">
              <template v-for="(p, pi) in parentGroups" :key="p.title">
                <div class="text-xs font-bold uppercase tracking-wider mb-2" :class="[p.color, pi === 0 ? '' : 'mt-5']">
                  {{ p.title }}
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div v-for="f in p.fields" :key="f.key" :class="f.full ? 'sm:col-span-2' : ''">
                    <label class="block font-semibold text-slate-700 mb-1">{{ f.label }}</label>
                    <input
                      v-model="form[f.key]"
                      :type="f.type || 'text'"
                      :list="f.list"
                      class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500"
                      :class="f.mono ? 'font-mono' : ''"
                      :placeholder="f.placeholder"
                    />
                  </div>
                </div>
              </template>
              <datalist id="pendidikan-ortu">
                <option v-for="o in pendidikanOptions" :key="o" :value="o" />
              </datalist>
            </template>

            <!-- SECTION 3: AKADEMIK & ASAL SEKOLAH -->
            <template v-else-if="currentSection === 'akademik'">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Kelas / Rombel</label>
                  <select v-model="form.className" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500">
                    <option value="">Belum ditempatkan di kelas</option>
                    <option v-for="className in classOptions" :key="className" :value="className">{{ className }}</option>
                  </select>
                </div>
                <div v-if="grade === 'SMK'">
                  <label class="block font-semibold text-slate-700 mb-1">Program Keahlian (Jurusan)</label>
                  <select v-model="form.major" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500">
                    <option value="">Pilih Jurusan</option>
                    <option value="TKJ">Teknik Komputer & Jaringan (TKJ)</option>
                    <option value="AKL">Akuntansi & Keuangan Lembaga (AKL)</option>
                    <option value="TBSM">Teknik Bisnis Sepeda Motor (TBSM)</option>
                    <option value="OTKP">Otomatisasi Tata Kelola Perkantoran (OTKP)</option>
                    <option value="DKV">Desain Komunikasi Visual (DKV)</option>
                    <option value="TKR">Teknik Kendaraan Ringan (TKR)</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Sekolah Asal</label>
                  <input v-model="form.prevSchool" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: SMP IT BINA CENDEKIA ASSALAM (BCA)" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Status Siswa</label>
                  <select v-model="form.status" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500">
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Pindah">Pindah</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Tahun Angkatan</label>
                  <input v-model="form.entryYear" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 2026" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">UID Kartu RFID</label>
                  <input v-model="form.rfidUid" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: E280-1170-0000-021B" />
                </div>
              </div>
            </template>

            <!-- SECTION 4: FISIK & LAINNYA -->
            <template v-else-if="currentSection === 'fisik'">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Anak Ke-</label>
                  <input v-model.number="form.birthOrder" type="number" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 2" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Jumlah Saudara</label>
                  <input v-model.number="form.siblingsCount" type="number" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 3" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Tinggi Badan (cm)</label>
                  <input v-model.number="form.height" type="number" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 165" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
                  <input v-model.number="form.weight" type="number" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 55" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Hobi Siswa</label>
                  <input v-model="form.hobby" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: Futsal, Membaca" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Cita-cita</label>
                  <input v-model="form.ambition" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: Network Engineer" />
                </div>
              </div>
            </template>
          </div>

          <!-- FOOTER -->
          <!-- FOOTER STICKY (TOUCH FRIENDLY) -->
          <div class="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/90 backdrop-blur-xs">
            <div class="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block">
              Langkah: <b class="text-slate-800 font-bold">{{ sectionTitle }}</b>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition min-h-[44px] cursor-pointer"
                type="button"
                @click="$emit('close')"
              >
                Batal
              </button>
              <button
                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition min-h-[44px] flex items-center gap-2 cursor-pointer"
                type="submit"
              >
                <AdminIcon name="check" size="16" />
                <span>{{ mode === 'add' ? 'Simpan Siswa' : 'Perbarui Data' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </Transition>
  </div>
</Teleport>
</template>
