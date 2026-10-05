<script setup lang="ts">
import { ref, reactive, watch, computed, onBeforeUnmount } from 'vue'
import AdminIcon from '~/components/admin/AdminIcon.vue'
import type { StudentItem } from '~/composables/useAdminStudents'

const props = defineProps<{
  isOpen: boolean
  mode: 'add' | 'edit'
  grade: string
  initialData: Partial<StudentItem>
}>()

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
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10" role="dialog" aria-modal="true">
        <!-- HEADER -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h3 class="text-base font-bold text-slate-900">
              {{ mode === 'add' ? 'Tambah Data Siswa Baru' : 'Edit Data Induk Siswa' }}
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Lengkapi data pokok peserta didik sesuai format data resmi sekolah / Dapodik.
            </p>
          </div>
          <button class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition" type="button" aria-label="Tutup" @click="$emit('close')">
            <AdminIcon name="x" size="18" />
          </button>
        </div>

        <!-- FORM TABS -->
        <div class="flex gap-1 px-5 pt-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto shrink-0">
          <button
            v-for="st in sections"
            :key="st.id"
            type="button"
            class="px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border-b-2"
            :class="currentSection === st.id ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'"
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
                  <label class="block font-semibold text-slate-700 mb-1">ID Siswa (Billing) <span class="text-rose-500">*</span></label>
                  <input v-model="form.id" required class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: SMK-26270120117" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">NIS <span class="text-rose-500">*</span></label>
                  <input v-model="form.nis" required class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 26270120117" @input="handleNisInput" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">NISN (10 Digit) <span class="text-rose-500">*</span></label>
                  <input v-model="form.nisn" required maxlength="10" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 0078912345" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">NIK Siswa (16 Digit)</label>
                  <input v-model="form.nik" maxlength="16" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 3216020103090009" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Jenis Kelamin <span class="text-rose-500">*</span></label>
                  <select v-model="form.gender" required class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500">
                    <option value="L">Laki-laki (L)</option>
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
                  <input v-model="form.birthDate" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 2010-06-08 / 8 Juni 2010" />
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
              <div class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                A. Identitas Ayah / Wali
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-5">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Nama Ayah</label>
                  <input v-model="form.fatherName" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: H. RIDWAN KAMIL" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">NIK Ayah</label>
                  <input v-model="form.fatherNik" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 3216021405800001" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">No. HP / WhatsApp Ayah</label>
                  <input v-model="form.fatherPhone" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 082210823033" />
                </div>
              </div>

              <div class="text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">
                B. Identitas Ibu Kandung
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Nama Ibu</label>
                  <input v-model="form.motherName" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: NURJANAH" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">NIK Ibu</label>
                  <input v-model="form.motherNik" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 3216024711820001" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">No. HP / WhatsApp Ibu</label>
                  <input v-model="form.motherPhone" class="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: 082210823033" />
                </div>
              </div>
            </template>

            <!-- SECTION 3: AKADEMIK & ASAL SEKOLAH -->
            <template v-else-if="currentSection === 'akademik'">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Kelas / Rombel <span class="text-rose-500">*</span></label>
                  <input v-model="form.className" required class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500" placeholder="cth: X. TKJ 1 / VII-A (Putra)" />
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
          <div class="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <div class="text-xs text-slate-400">
              Langkah: <b class="text-slate-700">{{ sectionTitle }}</b>
            </div>
            <div class="flex items-center gap-2">
              <button class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition" type="button" @click="$emit('close')">Batal</button>
              <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition" type="submit">
                {{ mode === 'add' ? 'Simpan Siswa' : 'Perbarui Data' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
