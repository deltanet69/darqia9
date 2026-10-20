<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'

export interface StaffItem {
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

const props = defineProps<{
  isOpen: boolean
  editingStaff: StaffItem | null
  currentGrade: 'SMP' | 'SMK'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Omit<StaffItem, 'id'> & { id?: string }): void
}>()

const formData = ref<Omit<StaffItem, 'id'> & { id?: string }>({
  nip: '',
  name: '',
  role: '',
  unit: 'SMK',
  subject: '',
  phone: '',
  status: 'GTY',
  rfidUid: ''
})

const errorMessage = ref('')

watch(
  () => props.isOpen,
  (open) => {
    errorMessage.value = ''
    if (open) {
      if (props.editingStaff) {
        formData.value = { ...props.editingStaff }
      } else {
        formData.value = {
          nip: '',
          name: '',
          role: '',
          unit: props.currentGrade,
          subject: '',
          phone: '',
          status: 'GTY',
          rfidUid: ''
        }
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
  if (!formData.value.name.trim() || !formData.value.nip.trim()) {
    errorMessage.value = 'Mohon isi NIP/NUPTK dan Nama Lengkap pendidik!'
    return
  }
  emit('save', { ...formData.value })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-[#0C111D]/60 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Dialog Panel -->
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden z-10 border border-[#E7EBF2] my-8 animate-scaleUp"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4.5 border-b border-[#F2F4F7] flex items-center justify-between bg-white">
          <div>
            <div class="text-[10.5px] font-extrabold uppercase tracking-widest text-[#1B5FD9] mb-0.5">
              {{ editingStaff ? 'Perbarui Profil' : 'Pendidik & Tenaga Kependidikan' }}
            </div>
            <h3 class="text-lg font-extrabold text-[#101828]">
              {{ editingStaff ? 'Ubah Data Guru & Staff' : 'Tambah Guru & Staff Baru' }}
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

        <!-- Form Body -->
        <form class="p-6 space-y-5 max-h-[calc(85vh-130px)] overflow-y-auto" @submit.prevent="handleSubmit">
          <div
            v-if="errorMessage"
            class="p-3 bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <AdminV2Icon name="alert" :size="16" class="shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Section 1: Identitas Pokok Pendidik -->
          <div class="space-y-3.5">
            <span class="text-xs font-extrabold uppercase tracking-wider text-[#98A2B3] block pb-1 border-b border-[#F2F4F7]">
              1. Identitas Pokok Pendidik
            </span>
            <div>
              <label class="block text-xs font-bold text-[#344054] mb-1.5">Nama Lengkap &amp; Gelar <span class="text-[#D92D20]">*</span></label>
              <input
                v-model="formData.name"
                placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd.I"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10 outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
                required
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">NIP / NUPTK <span class="text-[#D92D20]">*</span></label>
                <input
                  v-model="formData.nip"
                  placeholder="18 digit NIP / NUPTK"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] focus:ring-4 focus:ring-[#1B5FD9]/10 outline-none text-xs sm:text-sm font-mono font-bold text-[#101828] transition-all"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">Status Kepegawaian</label>
                <select
                  v-model="formData.status"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-bold text-[#344054] cursor-pointer transition-all"
                >
                  <option value="GTY">GTY (Tetap Yayasan)</option>
                  <option value="GTT">GTT (Honorer)</option>
                  <option value="Staf Tetap">Staf Tetap Operasional</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section 2: Penugasan & Unit Sekolah -->
          <div class="space-y-3.5 pt-1">
            <span class="text-xs font-extrabold uppercase tracking-wider text-[#98A2B3] block pb-1 border-b border-[#F2F4F7]">
              2. Penugasan &amp; Unit Sekolah
            </span>
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
                <label class="block text-xs font-bold text-[#344054] mb-1.5">Mapel Utama (Opsional)</label>
                <input
                  v-model="formData.subject"
                  placeholder="Contoh: Matematika / PBO"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#344054] mb-1.5">Jabatan &amp; Tanggung Jawab</label>
              <input
                v-model="formData.role"
                placeholder="Contoh: Guru Matematika / Wali Kelas IX-A"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-medium text-[#101828] transition-all"
              />
            </div>
          </div>

          <!-- Section 3: Kontak & Presensi RFID -->
          <div class="space-y-3.5 pt-1">
            <span class="text-xs font-extrabold uppercase tracking-wider text-[#98A2B3] block pb-1 border-b border-[#F2F4F7]">
              3. Kontak &amp; Presensi RFID
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">No. Handphone / WhatsApp</label>
                <input
                  v-model="formData.phone"
                  placeholder="Contoh: 081299887766"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-mono font-bold text-[#101828] transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#344054] mb-1.5">UID Kartu RFID Presensi</label>
                <input
                  v-model="formData.rfidUid"
                  placeholder="Contoh: E28068940001"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-[#F8FAFC] focus:bg-white focus:border-[#1B5FD9] outline-none text-xs sm:text-sm font-mono font-bold text-[#101828] transition-all"
                />
              </div>
            </div>
            <p class="text-[11px] text-[#667085]">
              Smartcard RFID digunakan untuk presensi mandiri saat tiba di gerbang atau ruang guru.
            </p>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F2F4F7]">
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
              <span>{{ editingStaff ? 'Perbarui Data' : 'Simpan Pendidik' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
