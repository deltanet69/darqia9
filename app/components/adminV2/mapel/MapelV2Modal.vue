<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AdminV2Icon from '../AdminV2Icon.vue'
import { generateSubjectCode } from '~/composables/useAdminSubjects'

export type SubjectCategory = 'Umum' | 'Kejuruan' | 'Keagamaan' | 'Muatan Lokal'

export interface SubjectItem {
  id: string
  code: string
  name: string
  category: SubjectCategory
  kkm: number
  hoursPerWeek: number
  grade: 'SMP' | 'SMK'
  status: 'Aktif' | 'Nonaktif'
}

export interface SubjectSaveData {
  id: string | null
  code: string
  name: string
  category: SubjectCategory
  kkm: number
  hoursPerWeek: number
  grade: 'SMP' | 'SMK'
}

interface Props {
  open: boolean
  grade: 'SMP' | 'SMK'
  schoolName: string
  subject: SubjectItem | null
  existingCodes: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', subjectData: SubjectSaveData): void
}>()

const form = ref({
  name: '',
  category: 'Umum' as SubjectCategory,
  kkm: 75,
  hoursPerWeek: 4,
  grade: 'SMK' as 'SMP' | 'SMK'
})

const isEdit = computed(() => !!props.subject)

const formSchoolName = computed(() => form.value.grade === 'SMP' ? 'SMP IT Bina Cendekia Assalam' : 'SMK IT Attaqwa 9')

const codePreview = computed(() => {
  if (props.subject) return props.subject.code
  return generateSubjectCode(form.value.name, props.existingCodes)
})

watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  if (props.subject) {
    form.value = {
      name: props.subject.name,
      category: props.subject.category,
      kkm: props.subject.kkm,
      hoursPerWeek: props.subject.hoursPerWeek,
      grade: props.subject.grade
    }
  } else {
    form.value = {
      name: '',
      category: props.grade === 'SMK' ? 'Kejuruan' : 'Umum',
      kkm: 75,
      hoursPerWeek: 4,
      grade: props.grade
    }
  }
})

const handleSubmit = () => {
  if (!form.value.name.trim()) {
    alert('Mohon isi nama mata pelajaran!')
    return
  }
  if (!codePreview.value) {
    alert('Nama mata pelajaran belum cukup untuk membuat kode otomatis.')
    return
  }
  emit('save', {
    id: props.subject?.id ?? null,
    code: codePreview.value,
    name: form.value.name.trim(),
    category: form.value.category,
    kkm: Math.max(0, Math.min(100, Number(form.value.kkm) || 0)),
    hoursPerWeek: Math.max(0, Number(form.value.hoursPerWeek) || 0),
    grade: form.value.grade
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#E7EBF2] space-y-4 max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
        <div>
          <h3 class="text-base font-extrabold text-[#101828]">{{ isEdit ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran Baru' }}</h3>
          <p class="text-xs text-[#667085] mt-0.5">Struktur kurikulum nasional &bull; {{ formSchoolName }}</p>
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
          <label class="block font-bold text-[#344054] mb-1">Nama Mata Pelajaran</label>
          <input
            v-model="form.name"
            placeholder="Contoh: Pendidikan Agama dan Budi Pekerti"
            class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-bold text-[#101828] outline-none focus:border-[#1B5FD9] placeholder:text-[#98A2B3]"
            required
          />
        </div>

        <div>
          <label class="block font-bold text-[#344054] mb-1">Kode Mata Pelajaran</label>
          <div class="flex items-center gap-2">
            <div class="flex-1 px-3.5 py-2.5 rounded-xl border border-dashed border-[#B2CCFF] bg-[#F5F9FF] font-mono font-extrabold text-sm text-[#0A2A5C]">
              {{ codePreview || '—' }}
            </div>
            <span class="px-2.5 py-1 rounded-full bg-[#1B5FD9] text-white text-[10px] font-extrabold uppercase tracking-wide">
              {{ isEdit ? 'Terkunci' : 'Otomatis' }}
            </span>
          </div>
          <p class="text-[11px] text-[#667085] mt-1">
            {{ isEdit
              ? 'Kode mapel yang sudah dipakai tidak diubah, agar referensi jadwal, bank soal, dan nilai tidak putus.'
              : 'Dibuat otomatis dari nama dan dijamin unik. Kode tidak bisa diubah setelah mapel dipakai.' }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-[#344054] mb-1">Jenjang Pendidikan</label>
            <div class="flex bg-[#EEF1F6] rounded-xl p-1 gap-1">
              <button
                type="button"
                class="flex-1 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition"
                :class="form.grade === 'SMP' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'"
                @click="form.grade = 'SMP'"
              >
                SMP
              </button>
              <button
                type="button"
                class="flex-1 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition"
                :class="form.grade === 'SMK' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'"
                @click="form.grade = 'SMK'"
              >
                SMK
              </button>
            </div>
          </div>

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
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-[#344054] mb-1">Standar KKM Minimal</label>
            <input
              v-model.number="form.kkm"
              type="number"
              min="0"
              max="100"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-mono font-bold text-[#101828] outline-none focus:border-[#1B5FD9]"
              required
            />
            <p class="text-[11px] text-[#667085] mt-1">Acuan tuntas di penilaian akhir: nilai CBT, agenda, dan rapor membaca angka ini.</p>
          </div>

          <div>
            <label class="block font-bold text-[#344054] mb-1">Alokasi Beban Jam (Jam/Minggu)</label>
            <input
              v-model.number="form.hoursPerWeek"
              type="number"
              min="0"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white font-mono font-bold text-[#101828] outline-none focus:border-[#1B5FD9]"
              required
            />
          </div>
        </div>

        <div class="rounded-xl bg-[#E8F0FE] text-[#0A2A5C] px-3.5 py-3 font-semibold leading-relaxed">
          Pengajar tidak diatur di master ini. Pengajar ditentukan di Jadwal Pelajaran per kelas — satu mapel bisa diajar guru berbeda di tiap kelas, dan dari jadwal itu Jadwal Mengajar tiap guru terisi otomatis.
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
