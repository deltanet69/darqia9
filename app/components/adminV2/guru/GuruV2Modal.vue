<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import type { StaffItem } from '~/composables/useAdminTeachers'

const props = defineProps<{
  isOpen: boolean
  editingStaff: StaffItem | null
  currentGrade: 'SMP' | 'SMK'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Omit<StaffItem, 'id'> & { id?: string; syncUser?: boolean }): void
}>()

const activeTab = ref<'identitas' | 'kontak_alamat' | 'kepegawaian'>('identitas')
const syncUserAccount = ref(true)

const formData = ref<Omit<StaffItem, 'id'> & { id?: string }>({
  nip: '',
  name: '',
  role: '',
  unit: 'SMK',
  subject: '',
  phone: '',
  status: 'Aktif',
  rfidUid: '',
  nik: '',
  noKk: '',
  nuptk: '',
  email: '',
  birthPlace: '',
  birthDate: '',
  address: '',
  kelurahan: '',
  kecamatan: '',
  kabKota: '',
  education: '',
  gender: 'Laki laki',
  isUserSynced: false
})

const errorMessage = ref('')

watch(
  () => props.isOpen,
  (open) => {
    errorMessage.value = ''
    activeTab.value = 'identitas'
    if (open) {
      if (props.editingStaff) {
        formData.value = {
          ...props.editingStaff,
          status: ['tidak aktif', 'nonaktif', 'inactive'].includes(props.editingStaff.status.toLowerCase()) ? 'Tidak Aktif' : 'Aktif'
        }
        syncUserAccount.value = !!props.editingStaff.isUserSynced
      } else {
        formData.value = {
          nip: '',
          name: '',
          role: 'Guru Mata Pelajaran',
          unit: props.currentGrade,
          subject: '',
          phone: '',
          status: 'Aktif',
          rfidUid: '',
          nik: '',
          noKk: '',
          nuptk: '',
          email: '',
          birthPlace: 'Bekasi',
          birthDate: '',
          address: '',
          kelurahan: '',
          kecamatan: 'Babelan',
          kabKota: 'Kab. Bekasi',
          education: 'S1 Pendidikan',
          gender: 'Laki laki',
          isUserSynced: false
        }
        syncUserAccount.value = true
      }
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden'
      }
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    activeTab.value = 'identitas'
    errorMessage.value = 'Nama lengkap guru wajib diisi!'
    return
  }

  if (!formData.value.nip.trim()) {
    activeTab.value = 'kepegawaian'
    errorMessage.value = 'NIP / NUPTK wajib diisi untuk registrasi kepegawaian!'
    return
  }

  emit('save', {
    ...formData.value,
    isUserSynced: syncUserAccount.value || formData.value.isUserSynced,
    syncUser: syncUserAccount.value
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-[#0C111D]/60 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Dialog Panel -->
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 border border-[#E7EBF2] my-4 sm:my-8 animate-scaleUp flex flex-col max-h-[92vh]"
      >
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-[#F2F4F7] flex items-center justify-between bg-white shrink-0">
          <div>
            <div class="text-[10px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-0.5">
              {{ editingStaff ? 'Perbarui Profil Guru' : 'Data Induk Kepegawaian' }}
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-[#101828]">
              {{ editingStaff ? 'Ubah Detail Data Guru' : 'Tambah Data Guru Baru' }}
            </h3>
          </div>
          <button
            type="button"
            class="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-xl transition cursor-pointer"
            aria-label="Tutup modal"
            @click="emit('close')"
          >
            <AdminV2Icon name="x" :size="20" />
          </button>
        </div>

        <!-- Tab Navigasi Form -->
        <div class="px-5 pt-2 pb-0 bg-[#F8FAFC] border-b border-[#E2E8F0] shrink-0">
          <div class="flex items-center gap-1 sm:gap-2 overflow-x-auto [scrollbar-width:none]">
            <button
              type="button"
              class="px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap"
              :class="activeTab === 'identitas' ? 'border-[#1B5FD9] text-[#1B5FD9]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'"
              @click="activeTab = 'identitas'"
            >
              1. Identitas Pribadi
            </button>
            <button
              type="button"
              class="px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap"
              :class="activeTab === 'kontak_alamat' ? 'border-[#1B5FD9] text-[#1B5FD9]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'"
              @click="activeTab = 'kontak_alamat'"
            >
              2. Kontak &amp; Alamat
            </button>
            <button
              type="button"
              class="px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap"
              :class="activeTab === 'kepegawaian' ? 'border-[#1B5FD9] text-[#1B5FD9]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'"
              @click="activeTab = 'kepegawaian'"
            >
              3. Penugasan &amp; Akun
            </button>
          </div>
        </div>

        <!-- Form Body (Scrollable) -->
        <form class="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1" @submit.prevent="handleSubmit">
          <div
            v-if="errorMessage"
            class="p-3 bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <AdminV2Icon name="alert" :size="16" class="shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- TAB 1: IDENTITAS PRIBADI -->
          <div v-show="activeTab === 'identitas'" class="space-y-3.5">
            <div>
              <label class="block text-xs font-bold text-[#344054] mb-1.5">
                Nama Lengkap Guru &amp; Gelar <span class="text-[#D92D20]">*</span>
              </label>
              <input
                v-model="formData.name"
                placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd.I"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10 outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
                required
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <input
                  v-model="formData.nik"
                  maxlength="16"
                  placeholder="16 digit NIK KTP"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-mono font-semibold text-[#101828] transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Nomor Kartu Keluarga (No KK)
                </label>
                <input
                  v-model="formData.noKk"
                  maxlength="16"
                  placeholder="16 digit No. KK"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-mono font-semibold text-[#101828] transition-all"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Tempat Lahir
                </label>
                <input
                  v-model="formData.birthPlace"
                  placeholder="Contoh: Bekasi / Jakarta"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Tanggal Lahir
                </label>
                <input
                  v-model="formData.birthDate"
                  type="date"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Jenis Kelamin
                </label>
                <select
                  v-model="formData.gender"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-semibold text-[#344054] cursor-pointer transition-all"
                >
                  <option value="Laki laki">Laki laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Pendidikan Terakhir
                </label>
                <input
                  v-model="formData.education"
                  placeholder="Contoh: S1 Pendidikan / S2 Komputer"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
                />
              </div>
            </div>
          </div>

          <!-- TAB 2: KONTAK & ALAMAT -->
          <div v-show="activeTab === 'kontak_alamat'" class="space-y-3.5">
            <div class="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-start gap-2.5 text-xs text-[#1E40AF]">
              <AdminV2Icon name="mail" :size="16" class="shrink-0 mt-0.5" />
              <div>
                <b class="block font-bold">Integrasi Akun Portal:</b>
                <span>Alamat email ini dapat digunakan oleh guru untuk masuk ke portal administrasi dan CBT.</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Alamat Email Guru
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="contoh: nama.guru@darqia.sch.id"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10 outline-none text-xs sm:text-sm font-mono font-medium text-[#101828] transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  No. Telepon / WhatsApp
                </label>
                <input
                  v-model="formData.phone"
                  placeholder="Contoh: 081288990011"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-mono font-semibold text-[#101828] transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#344054] mb-1.5">
                Alamat Tinggal Lengkap (Jalan, RT/RW, No. Rumah)
              </label>
              <textarea
                v-model="formData.address"
                rows="2"
                placeholder="Contoh: Jl. Raya Ujung Harapan No. 45 RT 02/05"
                class="w-full px-3.5 py-2 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Kelurahan / Desa
                </label>
                <input
                  v-model="formData.kelurahan"
                  placeholder="Contoh: Bahagia"
                  class="w-full px-3 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs font-medium text-[#101828] transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Kecamatan
                </label>
                <input
                  v-model="formData.kecamatan"
                  placeholder="Contoh: Babelan"
                  class="w-full px-3 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs font-medium text-[#101828] transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Kabupaten / Kota
                </label>
                <input
                  v-model="formData.kabKota"
                  placeholder="Contoh: Kab. Bekasi"
                  class="w-full px-3 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs font-medium text-[#101828] transition-all"
                />
              </div>
            </div>
          </div>

          <!-- TAB 3: PENUGASAN, RFID & USER SYNC -->
          <div v-show="activeTab === 'kepegawaian'" class="space-y-3.5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  Nomor Induk Pegawai (NIP) <span class="text-[#D92D20]">*</span>
                </label>
                <input
                  v-model="formData.nip"
                  placeholder="18 digit NIP"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10 outline-none text-xs sm:text-sm font-mono font-bold text-[#101828] transition-all"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">
                  NUPTK (Opsional)
                </label>
                <input
                  v-model="formData.nuptk"
                  maxlength="16"
                  placeholder="16 digit NUPTK"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-mono font-semibold text-[#101828] transition-all"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">Unit Penempatan</label>
                <select
                  v-model="formData.unit"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-bold text-[#344054] cursor-pointer transition-all"
                >
                  <option value="SMP">SMP IT Bina Cendekia Assalam</option>
                  <option value="SMK">SMK IT Attaqwa 9</option>
                  <option value="Yayasan">Yayasan / Tata Usaha Terpadu</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">Status Kepegawaian</label>
                <select
                  v-model="formData.status"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-bold text-[#344054] cursor-pointer transition-all"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">Jabatan Guru</label>
                <input
                  v-model="formData.role"
                  placeholder="Contoh: Guru Matematika / Wali Kelas"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">Mata Pelajaran Utama</label>
                <input
                  v-model="formData.subject"
                  placeholder="Contoh: Matematika / PBO"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#344054] mb-1.5">UID Kartu Absensi RFID</label>
              <input
                v-model="formData.rfidUid"
                placeholder="Contoh: E28068940001"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-mono font-bold text-[#101828] transition-all"
              />
              <span class="text-[11px] text-[#667085] mt-1 block">
                ID RFID digunakan untuk tap in/out kehadiran guru pada reader fisik.
              </span>
            </div>

            <!-- Sync ke User Management Checkbox -->
            <div class="pt-2">
              <label class="flex items-start gap-2.5 p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] cursor-pointer">
                <input
                  v-model="syncUserAccount"
                  type="checkbox"
                  class="w-4 h-4 mt-0.5 rounded border-[#86EFAC] text-[#16A34A] focus:ring-[#16A34A] cursor-pointer"
                />
                <div class="text-xs">
                  <b class="text-[#166534] block font-bold">Sinkronkan ke Manajemen Pengguna (User Management)</b>
                  <span class="text-[#15803D]">
                    Otomatis daftarkan akun login guru menggunakan email (atau NIP) agar guru bisa mengakses modul CBT dan administrasi.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-[#F2F4F7] shrink-0">
            <div class="text-xs text-[#64748B]">
              <span v-if="activeTab !== 'identitas'">Langkah {{ activeTab === 'kontak_alamat' ? '2' : '3' }} dari 3</span>
              <span v-else>Langkah 1 dari 3</span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#475467] hover:bg-[#F2F4F7] transition cursor-pointer"
                @click="emit('close')"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1B5FD9] hover:bg-[#154db0] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <AdminV2Icon name="check" :size="16" />
                <span>{{ editingStaff ? 'Perbarui Data' : 'Simpan Data Guru' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
