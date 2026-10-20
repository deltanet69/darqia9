<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import type { PresensiRecord } from './absensiV2Data'

interface Props {
  records: PresensiRecord[]
  currentPage: number
  totalPages: number
  startIndex: number
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'view-detail', record: PresensiRecord): void
  (e: 'edit-record', record: PresensiRecord): void
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

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Hadir':
      return 'bg-[#E7F8F0] text-[#067647]'
    case 'Terlambat':
      return 'bg-[#FEF4E5] text-[#B54708]'
    case 'Izin':
      return 'bg-[#E8F0FE] text-[#12459B]'
    case 'Sakit':
      return 'bg-[#E0F2FE] text-[#0369A1]'
    case 'Alpa':
      return 'bg-[#FDECEA] text-[#B42318]'
    default:
      return 'bg-[#F2F4F7] text-[#475467]'
  }
}

const statusDotClass = (status: string): string => {
  switch (status) {
    case 'Hadir':
      return 'bg-[#12B76A]'
    case 'Terlambat':
      return 'bg-[#F79009]'
    case 'Izin':
      return 'bg-[#1B5FD9]'
    case 'Sakit':
      return 'bg-[#0BA5EC]'
    case 'Alpa':
      return 'bg-[#F04438]'
    default:
      return 'bg-[#98A2B3]'
  }
}
</script>

<template>
  <div>
    <!-- Table Wrapper with horizontal scrolling -->
    <div class="overflow-x-auto -mx-4 sm:-mx-[18px] px-4 sm:px-[18px]">
      <table class="w-full border-collapse min-w-[840px] text-left">
        <thead>
          <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]/75">
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              No
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Nama Siswa
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              ID &amp; NIS
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Kelas
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Tap Masuk
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Tap Keluar
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Gate RFID
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap">
              Status Presensi
            </th>
            <th class="text-[12px] font-extrabold uppercase tracking-wider text-[#344054] px-4 py-3.5 whitespace-nowrap text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F2F4F7]">
          <tr
            v-for="(rec, index) in records"
            :key="rec.id"
            class="transition"
            :class="rec.status === 'Alpa' ? 'bg-[#FFF5F5]/70 hover:bg-[#FEE4E2]/50' : 'hover:bg-[#F8FAFD]'"
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
                  :class="rec.gender === 'L' ? 'bg-[#E8F0FE] text-[#12459B]' : 'bg-[#FCE8F3] text-[#A91E4E]'"
                >
                  {{ getInitials(rec.name) }}
                </span>
                <div class="min-w-0">
                  <div
                    class="font-bold text-[14.5px] truncate"
                    :class="rec.status === 'Alpa' ? 'text-[#B42318]' : 'text-[#101828]'"
                  >
                    {{ rec.name }}
                  </div>
                  <div class="font-mono text-xs font-semibold text-[#667085] mt-0.5">
                    NISN {{ rec.nisn }}
                  </div>
                </div>
              </div>
            </td>

            <!-- ID Siswa & NIS -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <div
                class="font-mono font-bold text-[14px] transition-colors cursor-help"
                :class="jenjang === 'smp' ? 'text-[#166534]' : 'text-[#12459B]'"
                title="ID Siswa Terdaftar"
              >
                {{ rec.id }}
              </div>
              <div class="font-mono text-xs font-semibold text-[#667085] mt-0.5">
                NIS {{ rec.nis }}
              </div>
            </td>

            <!-- Kelas (Chip Rombel Bersih) -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#F2F4F7] text-[#1E293B] text-[13px] font-bold">
                {{ rec.className }}
              </span>
            </td>

            <!-- Jam Tap Masuk -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <div class="flex items-center gap-1.5">
                <span
                  class="font-mono font-bold text-[13.5px] tabular-nums"
                  :class="rec.status === 'Hadir' ? 'text-[#067647]' : rec.status === 'Terlambat' ? 'text-[#B54708]' : 'text-[#98A2B3]'"
                >
                  {{ rec.timeIn }}
                </span>
                <span
                  v-if="rec.lateMinutes > 0"
                  class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#FEF4E5] text-[#B54708]"
                  title="Waktu keterlambatan dari ambang batas 06:45"
                >
                  +{{ rec.lateMinutes }}m
                </span>
              </div>
            </td>

            <!-- Jam Tap Keluar -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <span class="font-mono font-medium text-[13.5px] text-[#475467] tabular-nums">
                {{ rec.timeOut }}
              </span>
            </td>

            <!-- Gate RFID -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <div v-if="rec.gate !== '—'" class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#344054]">
                <AdminV2Icon name="wifi" :size="13" class="text-[#1B5FD9] shrink-0" />
                <span>{{ rec.gate }}</span>
              </div>
              <span v-else class="text-xs text-[#98A2B3] font-medium">—</span>
            </td>

            <!-- Status Presensi Pill -->
            <td class="px-4 py-4 whitespace-nowrap align-middle">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap"
                :class="statusBadgeClass(rec.status)"
              >
                <i class="w-2 h-2 rounded-full" :class="statusDotClass(rec.status)" />
                {{ rec.status }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-4 py-4 whitespace-nowrap text-right align-middle">
              <div class="inline-flex items-center gap-1.5">
                <!-- Detail Button -->
                <button
                  type="button"
                  class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#344054] border border-[#E7EBF2] bg-white hover:bg-[#F2F4F7] hover:text-[#101828] transition cursor-pointer"
                  title="Detail Presensi Siswa"
                  @click="emit('view-detail', rec)"
                >
                  <AdminV2Icon name="eye" :size="15" />
                </button>

                <!-- Edit Status Manual -->
                <button
                  type="button"
                  class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#344054] border border-[#E7EBF2] bg-white hover:bg-[#EFF2F7] hover:text-[#101828] transition cursor-pointer"
                  title="Ubah Status / Input Izin"
                  @click="emit('edit-record', rec)"
                >
                  <AdminV2Icon name="pencil" :size="15" />
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="records.length === 0">
            <td colspan="9" class="text-center py-14 px-4 text-[#475467]">
              <div class="w-12 h-12 rounded-2xl bg-[#EFF2F7] text-[#667085] flex items-center justify-center mx-auto mb-3">
                <AdminV2Icon name="clock" :size="24" />
              </div>
              <div class="text-sm font-bold text-[#101828]">
                Tidak ada data presensi yang cocok dengan filter.
              </div>
              <div class="text-xs text-[#667085] mt-1">
                Ubah filter kelas, status kehadiran, atau kata kunci pencarian.
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
