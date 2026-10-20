<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import type { PresensiRecord } from './absensiV2Data'

interface Props {
  record: PresensiRecord | null
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', record: PresensiRecord): void
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
</script>

<template>
  <Teleport to="body">
    <div
      v-if="record"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-[#101828]/50 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />

      <!-- Modal Card -->
      <div
        class="relative bg-white rounded-[20px] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(16,24,40,0.18)] border border-[#E7EBF2] p-5 sm:p-6 z-10 animate-in fade-in zoom-in-95 duration-150"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-[#F2F4F7]">
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-[15px] shrink-0"
              :class="record.gender === 'L' ? 'bg-[#E8F0FE] text-[#12459B]' : 'bg-[#FCE8F3] text-[#A91E4E]'"
            >
              {{ getInitials(record.name) }}
            </span>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-extrabold text-[16px] text-[#101828] truncate">
                  {{ record.name }}
                </h3>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                  :class="statusBadgeClass(record.status)"
                >
                  {{ record.status }}
                </span>
              </div>
              <p class="text-xs text-[#667085] font-mono mt-0.5">
                {{ record.id }} &bull; NISN {{ record.nisn }} &bull; Kelas {{ record.className }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-[#667085] hover:bg-[#EFF2F7] transition cursor-pointer"
            aria-label="Tutup"
            @click="emit('close')"
          >
            <AdminV2Icon name="x" :size="18" />
          </button>
        </div>

        <!-- Attendance Details Key-Value List -->
        <div class="divide-y divide-[#F2F4F7] py-3 text-[13px]">
          <div class="flex justify-between items-center py-2.5">
            <span class="text-[#667085] font-medium">Tanggal Presensi</span>
            <span class="font-bold text-[#101828]">{{ record.date }}</span>
          </div>

          <div class="flex justify-between items-center py-2.5">
            <span class="text-[#667085] font-medium">Tap Masuk</span>
            <span
              class="font-mono font-bold"
              :class="record.status === 'Hadir' ? 'text-[#067647]' : record.status === 'Terlambat' ? 'text-[#B54708]' : 'text-[#667085]'"
            >
              {{ record.timeIn }}
              <span v-if="record.lateMinutes > 0" class="text-xs font-semibold text-[#B54708] ml-1">
                (+{{ record.lateMinutes }} mnt)
              </span>
            </span>
          </div>

          <div class="flex justify-between items-center py-2.5">
            <span class="text-[#667085] font-medium">Tap Keluar</span>
            <span class="font-mono font-bold text-[#101828]">{{ record.timeOut }}</span>
          </div>

          <div class="flex justify-between items-center py-2.5">
            <span class="text-[#667085] font-medium">Gate / Gerbang Masuk</span>
            <span class="font-bold text-[#101828]">{{ record.gate }}</span>
          </div>

          <div class="flex justify-between items-center py-2.5">
            <span class="text-[#667085] font-medium">Smartcard RFID</span>
            <span class="font-mono font-bold text-[#12459B]">
              {{ record.rfidUid || 'Belum di-assign' }}
            </span>
          </div>

          <div class="flex justify-between items-center py-2.5">
            <span class="text-[#667085] font-medium">Wali Murid / Ortu</span>
            <div class="text-right">
              <span class="font-bold text-[#101828] block">{{ record.father }}</span>
              <a
                :href="`https://wa.me/62${record.fphone.replace(/^0/, '')}`"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1 text-xs font-semibold text-[#067647] hover:underline"
              >
                <AdminV2Icon name="phone" :size="12" />
                <span>{{ record.fphone }}</span>
              </a>
            </div>
          </div>

          <div v-if="record.note" class="py-2.5">
            <span class="text-[#667085] font-medium block mb-1">Catatan Kehadiran</span>
            <div class="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#E7EBF2] text-[#344054] text-xs font-semibold">
              {{ record.note }}
            </div>
          </div>
        </div>

        <!-- Banner Info RFID Requirement -->
        <div class="flex items-start gap-2.5 p-3 rounded-xl bg-[#E8F0FE] border border-[#C9DCFB] text-[#0A2A5C] text-xs leading-relaxed mb-4">
          <AdminV2Icon name="info" :size="16" class="shrink-0 text-[#1B5FD9] mt-0.5" />
          <span>
            Presensi siswa terintegrasi langsung dengan <b>Smartcard RFID</b> pada gerbang masuk lobi sekolah. Baris terlambat dihitung setelah pukul 06:45 WIB.
          </span>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F2F4F7]">
          <button
            type="button"
            class="px-4 py-2 rounded-full border border-[#E7EBF2] bg-white text-xs font-bold text-[#344054] hover:bg-[#EFF2F7] transition cursor-pointer"
            @click="emit('close')"
          >
            Tutup
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition cursor-pointer"
            :class="jenjang === 'smp' ? 'bg-[#16A34A] hover:bg-[#15803D]' : 'bg-[#1B5FD9] hover:bg-[#154EAE]'"
            @click="emit('edit', record)"
          >
            <AdminV2Icon name="pencil" :size="14" />
            <span>Ubah Status Presensi</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
