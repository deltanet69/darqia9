<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../../AdminV2Icon.vue'
import type { ClassStudentItem } from '../kelasV2Data'

interface Props {
  students: ClassStudentItem[]
  className: string
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'move-student', student: ClassStudentItem): void
  (e: 'delete-student', student: ClassStudentItem): void
  (e: 'add-student'): void
}>()

const search = ref('')
const genderFilter = ref('')

const filteredStudents = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.students.filter(s => {
    if (genderFilter.value && s.gender !== genderFilter.value) return false
    if (q) {
      const target = `${s.name} ${s.nisn} ${s.nis} ${s.parentName}`.toLowerCase()
      if (!target.includes(q)) return false
    }
    return true
  })
})
</script>

<template>
  <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-4">
    <!-- Header & Action Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
      <div>
        <h4 class="text-sm font-extrabold text-[#101828]">
          Daftar Peserta Didik Rombel {{ className }}
        </h4>
        <p class="text-xs text-[#667085] mt-0.5">
          Total {{ students.length }} siswa terdaftar aktif dalam rombongan belajar ini
        </p>
      </div>

      <!-- Action: Tambah Siswa ke Kelas -->
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer self-start sm:self-auto shadow-xs"
        :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#154EBC]'"
        @click="emit('add-student')"
      >
        <AdminV2Icon name="plus" :size="14" />
        <span>Tambah Siswa ke Rombel</span>
      </button>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-2.5">
      <div class="relative flex-1 min-w-[200px]">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3] pointer-events-none">
          <AdminV2Icon name="search" :size="15" />
        </span>
        <input
          v-model="search"
          type="text"
          placeholder="Cari nama siswa, NISN, NIS, wali..."
          class="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#101828] focus:bg-white focus:border-[#1B5FD9] focus:outline-none transition"
        />
      </div>

      <select
        v-model="genderFilter"
        class="px-3 py-1.5 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#344054] focus:outline-none cursor-pointer"
      >
        <option value="">Semua Gender</option>
        <option value="L">Laki laki (L)</option>
        <option value="P">Perempuan (P)</option>
      </select>
    </div>

    <!-- Student Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#F8FAFC] text-[#475467] uppercase tracking-wider font-bold border-b border-[#E7EBF2] text-[10.5px]">
          <tr>
            <th class="py-2.5 px-3">No</th>
            <th class="py-2.5 px-3">Nama Siswa</th>
            <th class="py-2.5 px-3 font-mono">NISN / NIS</th>
            <th class="py-2.5 px-3">L/P</th>
            <th class="py-2.5 px-3">Presensi</th>
            <th class="py-2.5 px-3">Smartcard</th>
            <th class="py-2.5 px-3">Kontak Wali</th>
            <th class="py-2.5 px-3 text-right">Aksi Manajemen</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F1F5F9] font-medium text-[#344054]">
          <tr
            v-for="(s, idx) in filteredStudents"
            :key="s.id"
            class="hover:bg-[#F8FAFC] transition-colors"
          >
            <td class="py-2.5 px-3 font-mono text-[#98A2B3]">{{ idx + 1 }}</td>
            <td class="py-2.5 px-3 font-bold text-[#101828]">
              {{ s.name }}
            </td>
            <td class="py-2.5 px-3 font-mono text-xs">
              <span class="text-[#101828] font-bold block">{{ s.nisn }}</span>
              <span class="text-[#98A2B3] text-[11px]">NIS: {{ s.nis }}</span>
            </td>
            <td class="py-2.5 px-3 font-bold">
              <span
                class="px-2 py-0.5 rounded-full text-[10px]"
                :class="s.gender === 'L' ? 'bg-[#EFF4FF] text-[#1B5FD9]' : 'bg-[#FDF2FA] text-[#C11574]'"
              >
                {{ s.gender === 'L' ? 'Laki laki' : 'Perempuan' }}
              </span>
            </td>
            <td class="py-2.5 px-3 font-mono">
              <span class="text-[#166534] font-bold">{{ s.attendancePct }}%</span>
            </td>
            <td class="py-2.5 px-3">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="s.hasRfid ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#FEF3F2] text-[#B42318]'"
              >
                {{ s.hasRfid ? 'RFID Aktif' : 'Belum Ada' }}
              </span>
            </td>
            <td class="py-2.5 px-3">
              <span class="block text-[11.5px] font-semibold text-[#101828]">{{ s.parentName }}</span>
              <span class="text-[11px] text-[#667085] font-mono">{{ s.parentPhone }}</span>
              <details class="mt-1.5 text-[11px]">
                <summary class="cursor-pointer font-bold text-[#1B5FD9] hover:underline">
                  Detail orang tua
                </summary>
                <div class="mt-2 min-w-48 rounded-xl border border-[#E7EBF2] bg-[#F8FAFC] p-2.5 space-y-1">
                  <p><b>Ayah:</b> {{ s.fatherName || 'Belum diisi' }}</p>
                  <p><b>Kontak ayah:</b> {{ s.fatherPhone || 'Belum diisi' }}</p>
                  <p><b>Ibu:</b> {{ s.motherName || 'Belum diisi' }}</p>
                  <p><b>Kontak ibu:</b> {{ s.motherPhone || 'Belum diisi' }}</p>
                </div>
              </details>
            </td>
            <td class="py-2.5 px-3 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <!-- Tombol Ubah Kelas (Pindah Rombel) -->
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EFF4FF] hover:bg-[#D1E0FF] text-[#1B5FD9] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Pindahkan siswa ke rombel lain"
                  @click="emit('move-student', s)"
                >
                  <AdminV2Icon name="swap" :size="12" />
                  <span>Ubah Kelas</span>
                </button>

                <!-- Tombol Soft Delete (Superadmin Only) -->
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-[#F04438] hover:bg-[#FEF3F2] transition cursor-pointer"
                  title="Hapus / Keluarkan dari rombel (Superadmin only)"
                  @click="emit('delete-student', s)"
                >
                  <AdminV2Icon name="trash" :size="14" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredStudents.length === 0">
            <td colspan="8" class="py-8 text-center text-[#98A2B3]">
              Tidak ada data siswa yang cocok dengan filter pencarian.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
