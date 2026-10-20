<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import type { Student } from './siswaV2Data'

interface Props {
  students: Student[]
  currentPage: number
  totalPages: number
  startIndex: number
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'view-detail', student: Student): void
  (e: 'edit-student', student: Student): void
  (e: 'delete-student', student: Student): void
  (e: 'update:page', page: number): void
}>()

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

const statusChipClass = (status: string): string => {
  switch (status) {
    case 'Aktif':
      return 'bg-[#E7F8F0] text-[#067647]'
    case 'Lulus':
      return 'bg-[#EFF2F7] text-[#344054]'
    case 'Pindah':
      return 'bg-[#FEF4E5] text-[#B54708]'
    case 'Nonaktif':
      return 'bg-[#FDECEA] text-[#B42318]'
    default:
      return 'bg-[#EFF2F7] text-[#344054]'
  }
}
</script>

<template>
  <div>
    <!-- Table Wrapper with horizontal scrolling -->
    <div class="overflow-x-auto -mx-4 sm:-mx-[18px] px-4 sm:px-[18px]">
      <table class="w-full border-collapse min-w-[800px] text-left">
        <thead>
          <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]/75">
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              No
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Nama Siswa
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              ID Siswa
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Kelas
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              L/P
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Orang Tua
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Smartcard Access
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Status
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F2F4F7]">
          <tr
            v-for="(student, index) in students"
            :key="student.id"
            class="hover:bg-[#F8FAFD] transition"
          >
            <!-- No -->
            <td class="font-mono text-[13px] font-bold px-4 py-4 text-[#475467] whitespace-nowrap align-middle">
              {{ startIndex + index + 1 }}
            </td>

            <!-- Nama Siswa & Avatar -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <div class="flex items-center gap-3">
                <span
                  class="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-[14px] shrink-0"
                  :class="student.gender === 'L' ? 'bg-[#E8F0FE] text-[#12459B]' : 'bg-[#FCE8F3] text-[#A91E4E]'"
                >
                  {{ getInitials(student.name) }}
                </span>
                <div class="min-w-0">
                  <div class="font-bold text-[14.5px] text-[#101828] truncate">
                    {{ student.name }}
                  </div>
                  <div class="font-mono text-xs font-semibold text-[#667085] mt-0.5">
                    NISN {{ student.nisn }}
                  </div>
                </div>
              </div>
            </td>

            <!-- ID Siswa & NIS -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <div
                class="font-mono font-bold text-[14px] transition-colors cursor-help"
                :class="jenjang === 'smp' ? 'text-[#166534]' : 'text-[#12459B]'"
                title="ID untuk keuangan & billing"
              >
                {{ student.id }}
              </div>
              <div class="font-mono text-xs font-semibold text-[#667085] mt-0.5">
                NIS {{ student.nis }}
              </div>
            </td>

            <!-- Kelas (Tanpa jurusan tambahan sesuai instruksi user) -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#F2F4F7] text-[#1E293B] text-[13px] font-bold">
                {{ student.className }}
              </span>
            </td>

            <!-- Gender L/P -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold"
                :class="student.gender === 'L' ? 'bg-[#E8F0FE] text-[#12459B]' : 'bg-[#F1EAFF] text-[#6941C6]'"
              >
                {{ student.gender }}
              </span>
            </td>

            <!-- Orang Tua & Links (Teks WhatsApp / Email terintegrasi langsung) -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <div class="text-[14px] font-bold text-[#101828]">
                {{ student.father }}
              </div>
              <div class="flex items-center gap-2 mt-1 text-[12.5px] font-semibold">
                <!-- WhatsApp Link -->
                <a
                  :href="`https://wa.me/62${student.fphone.replace(/^0/, '')}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 text-[#067647] hover:underline cursor-pointer"
                  :title="`Chat WA (${student.fphone})`"
                >
                  <AdminV2Icon name="phone" :size="13" class="shrink-0" />
                  <span>WhatsApp</span>
                </a>
                <span class="text-[#D0D5DD]">&bull;</span>
                <!-- Email Link -->
                <a
                  :href="`mailto:${student.pemail}`"
                  class="inline-flex items-center gap-1.5 text-[#1B5FD9] hover:underline cursor-pointer"
                  :title="`Kirim Email (${student.pemail})`"
                >
                  <AdminV2Icon name="mail" :size="13" class="shrink-0" />
                  <span>Email</span>
                </a>
              </div>
            </td>

            <!-- Smartcard Access -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <span
                class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold"
                :class="student.hasRfid ? 'bg-[#E7F8F0] text-[#067647]' : 'bg-[#FEF4E5] text-[#B54708]'"
              >
                {{ student.hasRfid ? 'Aktif' : 'Belum Ada' }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <span
                class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold"
                :class="statusChipClass(student.status)"
              >
                {{ student.status }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-4 py-4 whitespace-nowrap text-right align-middle">
              <div class="inline-flex items-center gap-1.5">
                <!-- Detail Button -->
                <button
                  type="button"
                  class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#344054] border border-[#E7EBF2] bg-white hover:bg-[#F2F4F7] hover:text-[#101828] transition cursor-pointer"
                  title="Detail Siswa"
                  @click="emit('view-detail', student)"
                >
                  <AdminV2Icon name="eye" :size="15" />
                </button>

                <!-- Edit Button -->
                <button
                  type="button"
                  class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#344054] border border-[#E7EBF2] bg-white hover:bg-[#F2F4F7] hover:text-[#101828] transition cursor-pointer"
                  title="Edit Biodata"
                  @click="emit('edit-student', student)"
                >
                  <AdminV2Icon name="pencil" :size="15" />
                </button>

                <!-- Delete Button -->
                <button
                  type="button"
                  class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#344054] border border-[#E7EBF2] bg-white hover:bg-[#FDECEA] hover:text-[#F04438] hover:border-[#F5C6C0] transition cursor-pointer"
                  title="Hapus Siswa"
                  @click="emit('delete-student', student)"
                >
                  <AdminV2Icon name="trash" :size="15" />
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="students.length === 0">
            <td colspan="9" class="text-center py-14 px-4 text-[#475467]">
              <div class="w-12 h-12 rounded-2xl bg-[#EFF2F7] text-[#667085] flex items-center justify-center mx-auto mb-3">
                <AdminV2Icon name="users" :size="24" />
              </div>
              <div class="text-sm font-bold text-[#101828]">
                Tidak ada data siswa yang cocok dengan filter.
              </div>
              <div class="text-xs text-[#667085] mt-1">
                Ubah filter atau kata kunci pencarian.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-center gap-2.5 mt-4 pt-3.5 border-t border-[#F2F4F7] text-xs font-bold text-[#344054]"
    >
      <button
        type="button"
        class="min-w-[36px] h-9 px-2.5 rounded-xl border border-[#E7EBF2] bg-white font-extrabold text-[#101828] transition hover:bg-[#EFF2F7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        :disabled="currentPage <= 1"
        @click="emit('update:page', currentPage - 1)"
      >
        ‹
      </button>

      <span class="px-2 text-xs font-semibold text-[#475467]">
        Halaman <b class="text-[#101828] font-bold">{{ currentPage }}</b> / {{ totalPages }}
      </span>

      <button
        type="button"
        class="min-w-[36px] h-9 px-2.5 rounded-xl border border-[#E7EBF2] bg-white font-extrabold text-[#101828] transition hover:bg-[#EFF2F7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        :disabled="currentPage >= totalPages"
        @click="emit('update:page', currentPage + 1)"
      >
        ›
      </button>
    </div>
  </div>
</template>
