<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import type { Student } from './siswaV2Data'

interface Props {
  student: Student | null
  kelasList: string[]
  jurusanList: string[]
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Partial<Student>): void
}>()

const form = ref({
  name: '',
  nis: '',
  nisn: '',
  gender: 'L' as 'L' | 'P',
  phone: '',
  address: '',
  father: '',
  mother: '',
  fphone: '',
  className: '',
  major: '',
  prevSchool: '',
  status: 'Aktif',
  rfidUid: ''
})

const errorMessage = ref('')

watch(
  () => props.student,
  (s) => {
    errorMessage.value = ''
    if (s) {
      form.value = {
        name: s.name,
        nis: s.nis,
        nisn: s.nisn,
        gender: s.gender,
        phone: s.phone,
        address: s.address,
        father: s.father,
        mother: s.mother,
        fphone: s.fphone,
        className: s.className,
        major: s.major,
        prevSchool: s.prevSchool,
        status: s.status,
        rfidUid: s.rfidUid
      }
    } else {
      form.value = {
        name: '',
        nis: '',
        nisn: '',
        gender: 'L',
        phone: '',
        address: '',
        father: '',
        mother: '',
        fphone: '',
        className: props.kelasList[0] || '',
        major: props.jurusanList[0] || '',
        prevSchool: '',
        status: 'Aktif',
        rfidUid: ''
      }
    }
  },
  { immediate: true }
)

const handleSave = () => {
  const name = form.value.name.trim()
  const nis = form.value.nis.trim()
  if (!name || !nis) {
    errorMessage.value = 'Nama lengkap dan NIS wajib diisi.'
    return
  }

  emit('save', {
    ...form.value,
    name,
    nis,
    id: (props.jenjang === 'smp' ? 'SMP-' : 'SMK-') + nis,
    nisn: form.value.nisn.trim() || '-',
    hasRfid: !!form.value.rfidUid.trim(),
    rfidUid: form.value.rfidUid.trim(),
    level: props.jenjang
  })
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-[#101828]/45 flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in duration-150"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-[20px] w-full max-w-[580px] max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 relative animate-in zoom-in-95 duration-150"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-base font-extrabold text-[#101828]">
          {{ student ? 'Edit Biodata Siswa' : 'Tambah Siswa Baru' }}
        </h3>
        <button
          type="button"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-[#344054] hover:bg-[#EFF2F7] transition cursor-pointer"
          aria-label="Tutup modal"
          @click="emit('close')"
        >
          <AdminV2Icon name="x" :size="18" />
        </button>
      </div>

      <p class="text-xs text-[#667085] mb-4">
        ID siswa terisi otomatis dari NIS yang diketik.
      </p>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-[#FDECEA] border border-[#F5C6C0] text-[#B42318] text-xs font-semibold rounded-xl">
        {{ errorMessage }}
      </div>

      <!-- SECTION 1: Biodata & Alamat -->
      <div class="mb-5">
        <h4 class="text-xs font-extrabold text-[#101828] mb-2.5 flex items-center gap-2">
          <span
            class="w-[22px] h-[22px] rounded-lg text-white text-[11px] font-extrabold flex items-center justify-center"
            :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'"
          >
            1
          </span>
          Biodata &amp; Alamat
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Nama Lengkap -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              Nama Lengkap <span class="text-[#F04438]">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="cth: Ahmad Fauzi"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            />
          </div>

          <!-- NIS -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              NIS <span class="text-[#F04438]">*</span>
            </label>
            <input
              v-model="form.nis"
              type="text"
              placeholder="cth: 2026001"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] font-mono focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            />
          </div>

          <!-- NISN -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              NISN
            </label>
            <input
              v-model="form.nisn"
              type="text"
              placeholder="10 digit nomor NISN"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] font-mono focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            />
          </div>

          <!-- Jenis Kelamin -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              Jenis Kelamin
            </label>
            <select
              v-model="form.gender"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            >
              <option value="L">Laki laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          <!-- No. HP/WA -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              No. HP / WA
            </label>
            <input
              v-model="form.phone"
              type="text"
              placeholder="08…"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            />
          </div>

          <!-- Alamat -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              Alamat
            </label>
            <input
              v-model="form.address"
              type="text"
              placeholder="Jalan, RT/RW, kelurahan"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            />
          </div>
        </div>
      </div>

      <!-- SECTION 2: Data Orang Tua -->
      <div class="mb-5">
        <h4 class="text-xs font-extrabold text-[#101828] mb-2.5 flex items-center gap-2">
          <span
            class="w-[22px] h-[22px] rounded-lg text-white text-[11px] font-extrabold flex items-center justify-center"
            :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'"
          >
            2
          </span>
          Data Orang Tua
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              Nama Ayah
            </label>
            <input
              v-model="form.father"
              type="text"
              placeholder="Nama lengkap ayah/wali"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              Nama Ibu
            </label>
            <input
              v-model="form.mother"
              type="text"
              placeholder="Nama lengkap ibu kandung"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-[#344054] mb-1">
              No. WA Orang Tua
            </label>
            <input
              v-model="form.fphone"
              type="text"
              placeholder="08…"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            />
          </div>
        </div>
      </div>

      <!-- SECTION 3: Akademik -->
      <div class="mb-5">
        <h4 class="text-xs font-extrabold text-[#101828] mb-2.5 flex items-center gap-2">
          <span
            class="w-[22px] h-[22px] rounded-lg text-white text-[11px] font-extrabold flex items-center justify-center"
            :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'"
          >
            3
          </span>
          Akademik
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Kelas / Rombel -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              Kelas / Rombel <span class="text-[#F04438]">*</span>
            </label>
            <select
              v-model="form.className"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            >
              <option v-for="k in kelasList" :key="k" :value="k">{{ k }}</option>
            </select>
          </div>

          <!-- Jurusan (SMK Only) -->
          <div v-if="jenjang === 'smk'">
            <label class="block text-xs font-bold text-[#344054] mb-1">
              Jurusan
            </label>
            <select
              v-model="form.major"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
            >
              <option value="">— Pilih Jurusan —</option>
              <option v-for="j in jurusanList" :key="j" :value="j">{{ j }}</option>
            </select>
          </div>

          <!-- Sekolah Asal -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              Sekolah Asal
            </label>
            <input
              v-model="form.prevSchool"
              type="text"
              placeholder="Asal sekolah sebelumnya"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-bold text-[#344054] mb-1">
              Status
            </label>
            <select
              v-model="form.status"
              class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
              :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
            >
              <option value="Aktif">Aktif</option>
              <option value="Lulus">Lulus</option>
              <option value="Pindah">Pindah</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SECTION 4: Kartu Smartcard -->
      <div class="mb-5">
        <h4 class="text-xs font-extrabold text-[#101828] mb-2.5 flex items-center gap-2">
          <span
            class="w-[22px] h-[22px] rounded-lg text-white text-[11px] font-extrabold flex items-center justify-center"
            :class="jenjang === 'smp' ? 'bg-[#16A34A]' : 'bg-[#1B5FD9]'"
          >
            4
          </span>
          Kartu Smartcard
        </h4>

        <div>
          <label class="block text-xs font-bold text-[#344054] mb-1">
            UID Kartu Smartcard
          </label>
          <input
            v-model="form.rfidUid"
            type="text"
            placeholder="cth: RFID-1001-A (opsional)"
            class="w-full bg-[#F8FAFD] border border-[#E7EBF2] rounded-xl px-3 py-2 text-[13px] text-[#101828] font-mono focus:bg-white focus:outline-none focus:border-[#1B5FD9] focus:ring-2 focus:ring-[#E8F0FE]"
            :class="jenjang === 'smp' ? 'focus:border-[#16A34A] focus:ring-[#E7F6ED]' : 'focus:border-[#1B5FD9] focus:ring-[#E8F0FE]'"
          />
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-2.5 pt-3.5 border-t border-[#EFF2F7]">
        <button
          type="button"
          class="px-4 py-2 rounded-full border border-[#E7EBF2] bg-white text-xs font-bold text-[#101828] hover:bg-[#EFF2F7] transition cursor-pointer"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold transition shadow-sm cursor-pointer"
          :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#174FB5]'"
          @click="handleSave"
        >
          <AdminV2Icon name="check" :size="14" />
          {{ student ? 'Simpan Perubahan' : 'Tambah Siswa' }}
        </button>
      </div>
    </div>
  </div>
</template>
