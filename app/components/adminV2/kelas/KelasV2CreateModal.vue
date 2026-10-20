<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'

interface Props {
  open: boolean
  defaultLevel?: 'SMP' | 'SMK'
}

const props = withDefaults(defineProps<Props>(), {
  defaultLevel: 'SMK'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', newClassData: {
    name: string
    level: 'SMP' | 'SMK'
    major: string
    room: string
    teacher: string
  }): void
}>()

const teacherOptions = [
  'Bambang Supriyanto, M.Kom',
  'Hendra Gunawan, S.Kom',
  'Fajar Nugroho, S.Pd',
  'Rizky Wahyudi, S.T',
  'Eko Prasetyo, S.Pd',
  'Siti Aminah, S.Pd',
  'Dewi Lestari, S.Pd',
  'Nurul Hidayati, S.Si',
  'Drs. H. Ahmad Dahlan'
]

const form = ref({
  name: '',
  level: props.defaultLevel as 'SMP' | 'SMK',
  major: props.defaultLevel === 'SMK' ? 'RPL' : '',
  room: '',
  teacher: ''
})

watch(() => props.open, (val) => {
  if (val) {
    form.value = {
      name: '',
      level: props.defaultLevel,
      major: props.defaultLevel === 'SMK' ? 'RPL' : '',
      room: '',
      teacher: ''
    }
  }
})

watch(() => form.value.level, (lvl) => {
  if (lvl === 'SMP') {
    form.value.major = ''
  } else if (!form.value.major) {
    form.value.major = 'RPL'
  }
})

const handleSubmit = () => {
  if (!form.value.name.trim() || !form.value.teacher) {
    alert('Mohon lengkapi nama rombel dan wali kelas.')
    return
  }

  emit('created', {
    name: form.value.name.trim(),
    level: form.value.level,
    major: form.value.major,
    room: form.value.room.trim() || 'Gedung Utama · R. Kelas',
    teacher: form.value.teacher
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-[#E7EBF2]">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">Tambah Rombongan Belajar (Rombel) Baru</h3>
          <p class="text-xs text-[#667085] mt-0.5">Daftarkan kelas baru untuk Tahun Ajaran 2026/2027</p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-[#F8FAFC] text-[#667085] hover:text-[#101828] hover:bg-[#EFF2F7] flex items-center justify-center font-bold text-sm cursor-pointer transition"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Form Inputs -->
      <form class="space-y-3.5 text-xs" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-[#344054] mb-1">Jenjang Sekolah</label>
            <select
              v-model="form.level"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-bold text-[#101828] outline-none focus:border-[#1B5FD9]"
            >
              <option value="SMK">SMK IT Attaqwa 9</option>
              <option value="SMP">SMP IT Bina Cendekia</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-[#344054] mb-1">Program / Jurusan</label>
            <select
              v-if="form.level === 'SMK'"
              v-model="form.major"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-bold text-[#101828] outline-none focus:border-[#1B5FD9]"
            >
              <option value="RPL">RPL (Rekayasa Perangkat Lunak)</option>
              <option value="TKJ">TKJ (Teknik Komputer Jaringan)</option>
            </select>
            <input
              v-else
              value="Reguler SMP"
              disabled
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] font-bold text-[#667085]"
            />
          </div>
        </div>

        <div>
          <label class="block font-bold text-[#344054] mb-1">Nama Rombel Kelas</label>
          <input
            v-model="form.name"
            placeholder="Contoh: X RPL 3, XII TKJ 2, VII-C"
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-bold text-[#101828] outline-none focus:border-[#1B5FD9] placeholder:text-[#98A2B3]"
            required
          />
        </div>

        <div>
          <label class="block font-bold text-[#344054] mb-1">Wali Kelas (Penanggung Jawab)</label>
          <select
            v-model="form.teacher"
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-bold text-[#101828] outline-none focus:border-[#1B5FD9]"
            required
          >
            <option value="" disabled>-- Pilih Guru Pengajar --</option>
            <option v-for="t in teacherOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-[#344054] mb-1">Lokasi Ruang Kelas</label>
          <input
            v-model="form.room"
            placeholder="Contoh: Gedung B · Lab Komputer 3, Gedung A · R.203"
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-medium text-[#101828] outline-none focus:border-[#1B5FD9] placeholder:text-[#98A2B3]"
          />
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold text-[#667085] hover:bg-[#F8FAFC] transition cursor-pointer"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B5FD9] hover:bg-[#154EBC] transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <AdminV2Icon name="plus" :size="13" />
            <span>Simpan Rombel</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
