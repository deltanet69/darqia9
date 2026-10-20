<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'

export type SubjectCategory = 'Umum' | 'Kejuruan' | 'Keagamaan' | 'Muatan Lokal'

export interface SubjectItem {
  id: string
  code: string
  name: string
  category: SubjectCategory
  kkm: number
  hoursPerWeek: number
  coordinator: string
  grade: 'SMP' | 'SMK'
  status: 'Aktif' | 'Nonaktif'
}

interface Props {
  open: boolean
  grade: 'SMP' | 'SMK'
  schoolName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', subjectData: Omit<SubjectItem, 'id' | 'grade' | 'status'>): void
}>()

const form = ref({
  code: '',
  name: '',
  category: 'Umum' as SubjectCategory,
  kkm: 75,
  hoursPerWeek: 4,
  coordinator: ''
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    form.value = {
      code: '',
      name: '',
      category: props.grade === 'SMK' ? 'Kejuruan' : 'Umum',
      kkm: 75,
      hoursPerWeek: 4,
      coordinator: ''
    }
  }
})

const handleSubmit = () => {
  if (!form.value.name.trim() || !form.value.code.trim()) {
    alert('Mohon isi kode dan nama mata pelajaran!')
    return
  }

  emit('save', {
    code: form.value.code.trim().toUpperCase(),
    name: form.value.name.trim(),
    category: form.value.category,
    kkm: Number(form.value.kkm),
    hoursPerWeek: Number(form.value.hoursPerWeek),
    coordinator: form.value.coordinator.trim() || `Tim Guru ${props.grade}`
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#E7EBF2] space-y-4">
      <div class="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">Tambah Mata Pelajaran Baru</h3>
          <p class="text-xs text-[#667085] mt-0.5">Struktur kurikulum nasional &bull; {{ schoolName }}</p>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-[#F8FAFC] text-[#667085] hover:text-[#101828] flex items-center justify-center font-bold text-sm cursor-pointer transition"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <form class="space-y-3.5 text-xs" @submit.prevent="handleSubmit">
        <div>
          <label class="block font-bold text-[#344054] mb-1">Kode Mata Pelajaran</label>
          <input
            v-model="form.code"
            placeholder="Contoh: SMK-RPL-01 atau SMP-IPA-02"
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-mono font-bold text-[#101828] outline-none focus:border-[#1B5FD9] placeholder:text-[#98A2B3]"
            required
          />
          <p class="text-[11px] text-[#667085] mt-1">Kode unik identifikasi mata pelajaran di kurikulum sekolah.</p>
        </div>

        <div>
          <label class="block font-bold text-[#344054] mb-1">Nama Mata Pelajaran</label>
          <input
            v-model="form.name"
            placeholder="Contoh: Pemrograman Web &amp; Mobile, Matematika Terapan"
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-bold text-[#101828] outline-none focus:border-[#1B5FD9] placeholder:text-[#98A2B3]"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-[#344054] mb-1">Kategori Kurikulum</label>
            <select
              v-model="form.category"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-bold text-[#101828] outline-none focus:border-[#1B5FD9] cursor-pointer"
            >
              <option value="Umum">Umum (Wajib)</option>
              <option value="Kejuruan">Kejuruan (Khusus SMK)</option>
              <option value="Keagamaan">Keagamaan / Al-Qur'an</option>
              <option value="Muatan Lokal">Muatan Lokal</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-[#344054] mb-1">Standar KKM Minimal</label>
            <input
              v-model.number="form.kkm"
              type="number"
              min="60"
              max="100"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-mono font-bold text-[#101828] outline-none focus:border-[#1B5FD9]"
              required
            />
          </div>
        </div>

        <div>
          <label class="block font-bold text-[#344054] mb-1">Alokasi Beban Jam (Jam/Minggu)</label>
          <input
            v-model.number="form.hoursPerWeek"
            type="number"
            min="1"
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-mono font-bold text-[#101828] outline-none focus:border-[#1B5FD9]"
            required
          />
        </div>

        <div>
          <label class="block font-bold text-[#344054] mb-1">Guru Koordinator Pengampu</label>
          <input
            v-model="form.coordinator"
            placeholder="Nama guru penanggung jawab mata pelajaran"
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-medium text-[#101828] outline-none focus:border-[#1B5FD9] placeholder:text-[#98A2B3]"
            required
          />
        </div>

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
            <AdminV2Icon name="check" :size="13" />
            <span>Simpan Mapel</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
