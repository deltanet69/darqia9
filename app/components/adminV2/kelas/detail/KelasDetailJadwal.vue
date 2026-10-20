<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../../AdminV2Icon.vue'
import type { ClassScheduleItem } from '../kelasV2Data'

interface Props {
  schedule: ClassScheduleItem[]
  className: string
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'mark-session-complete', sessionId: string): void
  (e: 'flag-student-skip', sessionId: string): void
}>()

const activeDay = ref<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'>('Senin')
const days: Array<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'> = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

const daySchedule = computed(() => {
  return props.schedule.filter(s => s.day === activeDay.value)
})
</script>

<template>
  <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-4">
    <!-- Header with Timetable Day Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
      <div>
        <h4 class="text-sm font-extrabold text-[#101828]">
          Jadwal Pelajaran &amp; Timetable Mingguan Rombel {{ className }}
        </h4>
        <p class="text-xs text-[#667085] mt-0.5">
          Monitoring jam KBM, status kehadiran guru pengajar &amp; validasi kehadiran per jam mata pelajaran
        </p>
      </div>

      <!-- Day Selector Pills (Senin s/d Jumat) -->
      <div class="inline-flex items-center bg-[#EFF2F7] border border-[#E7EBF2] p-1 rounded-xl overflow-x-auto">
        <button
          v-for="d in days"
          :key="d"
          type="button"
          class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap"
          :class="activeDay === d ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
          @click="activeDay = d"
        >
          {{ d }}
        </button>
      </div>
    </div>

    <!-- Alert / Petunjuk KBM -->
    <div class="p-3 rounded-xl bg-[#EFF4FF] border border-[#D1E0FF] text-xs text-[#1B5FD9] flex items-start gap-2.5">
      <AdminV2Icon name="info" :size="16" class="shrink-0 mt-0.5" />
      <div class="leading-relaxed">
        <strong>Pencegahan Siswa Bolos / Kabur Antar Mapel:</strong> Guru pengampu tiap jam pelajaran wajib memvalidasi absensi kelas. Klik <strong>"Siswa Hadir Lengkap"</strong> bila seluruh rombel berada di kelas, atau klik <strong>"Set Alpa Siswa"</strong> bila terdapat peserta didik yang tidak mengikuti KBM di jam tersebut.
      </div>
    </div>

    <!-- Timetable Sessions Listing -->
    <div class="space-y-2.5">
      <div
        v-for="item in daySchedule"
        :key="item.id"
        class="p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5"
        :class="item.isCurrentPeriod ? 'bg-[#F0F7FF] border-[#1B5FD9] shadow-xs' : 'bg-[#F8FAFC] border-[#E7EBF2] hover:bg-white hover:shadow-xs'"
      >
        <!-- Left: Jam & Session Info -->
        <div class="flex items-start gap-3.5 min-w-0">
          <div
            class="w-11 h-11 rounded-xl text-xs font-bold font-mono flex flex-col items-center justify-center shrink-0"
            :class="item.isCurrentPeriod ? 'bg-[#1B5FD9] text-white' : 'bg-white border border-[#E2E8F0] text-[#101828]'"
          >
            <span class="text-[9px] font-medium uppercase text-current/80">Sesi</span>
            <span class="text-sm font-extrabold leading-none">{{ item.session }}</span>
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h5 class="text-sm font-extrabold text-[#101828]">
                {{ item.subject }}
              </h5>
              <span
                v-if="item.isCurrentPeriod"
                class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1B5FD9] text-white"
              >
                Jam Sedang Aktif
              </span>
            </div>

            <div class="flex items-center gap-3 text-xs text-[#667085] mt-1 flex-wrap">
              <span class="font-bold text-[#344054]">Guru: {{ item.teacher }}</span>
              <span>&bull;</span>
              <span class="font-mono">{{ item.time }}</span>
              <span>&bull;</span>
              <span>{{ item.room }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Status Guru & Update Absensi Kelas -->
        <div class="flex items-center gap-2.5 self-end md:self-auto shrink-0 flex-wrap">
          <!-- Sign Guru Telah Absen Mengajar -->
          <div
            class="px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            :class="item.guruPresent ? 'bg-[#E7F6ED] text-[#166534] border border-[#A6E9C5]' : 'bg-[#EFF2F7] text-[#667085] border border-[#E2E8F0]'"
          >
            <i class="w-2 h-2 rounded-full" :class="item.guruPresent ? 'bg-[#16A34A]' : 'bg-[#98A2B3]'" />
            <span>{{ item.guruPresent ? 'Guru Telah Hadir KBM' : 'Menunggu Kehadiran Guru' }}</span>
          </div>

          <!-- Tombol Guru Update Absensi Kelas -->
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
              :class="item.classAttendanceDone ? 'bg-[#E7F6ED] text-[#166534] border border-[#A6E9C5]' : 'bg-white border border-[#E2E8F0] text-[#344054] hover:bg-[#F8FAFC]'"
              @click="emit('mark-session-complete', item.id)"
            >
              <AdminV2Icon name="check" :size="13" />
              <span>{{ item.classAttendanceDone ? 'Siswa Lengkap' : 'Siswa Hadir Lengkap' }}</span>
            </button>

            <button
              type="button"
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FEF3F2] hover:bg-[#FEE4E2] text-[#B42318] border border-[#FECDCA] transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Tandai siswa yang kabur/tidak hadir di jam ini"
              @click="emit('flag-student-skip', item.id)"
            >
              <AdminV2Icon name="alert" :size="13" />
              <span>Set Alpa Siswa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
