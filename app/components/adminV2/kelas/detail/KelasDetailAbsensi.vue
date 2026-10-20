<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '../../AdminV2Icon.vue'
import type { ClassAttendanceDaily } from '../kelasV2Data'

interface Props {
  attendanceList: ClassAttendanceDaily[]
  className: string
  jenjang?: 'smp' | 'smk'
}

const props = withDefaults(defineProps<Props>(), {
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'mark-all-present'): void
  (e: 'update-status', studentId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'): void
}>()

const period = ref<'harian' | 'mingguan' | 'bulanan'>('harian')
const selectedStatusFilter = ref<string>('all')

const counts = computed(() => {
  const hadir = props.attendanceList.filter(a => a.status === 'Hadir').length
  const sakit = props.attendanceList.filter(a => a.status === 'Sakit').length
  const izin = props.attendanceList.filter(a => a.status === 'Izin').length
  const alpa = props.attendanceList.filter(a => a.status === 'Alpa').length
  return { hadir, sakit, izin, alpa, total: props.attendanceList.length }
})

const filteredList = computed(() => {
  if (selectedStatusFilter.value === 'all') return props.attendanceList
  return props.attendanceList.filter(a => a.status === selectedStatusFilter.value)
})
</script>

<template>
  <div class="bg-white border border-[#E7EBF2] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-4">
    <!-- Header with Filters & Quick Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
      <div>
        <h4 class="text-sm font-extrabold text-[#101828]">
          Absensi Presensi Rombel {{ className }}
        </h4>
        <p class="text-xs text-[#667085] mt-0.5">
          Monitoring kehadiran siswa via Smartcard RFID &amp; checklist guru
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Period Switcher: Harian, Mingguan, Bulanan -->
        <div class="inline-flex items-center bg-[#EFF2F7] border border-[#E7EBF2] p-1 rounded-xl">
          <button
            type="button"
            class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="period === 'harian' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
            @click="period = 'harian'"
          >
            Harian
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="period === 'mingguan' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
            @click="period = 'mingguan'"
          >
            Mingguan
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="period === 'bulanan' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
            @click="period = 'bulanan'"
          >
            Bulanan
          </button>
        </div>

        <!-- Tombol "Tandai Siswa Hadir Lengkap" -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E7F6ED] hover:bg-[#D1F2DE] text-[#166534] border border-[#A6E9C5] transition cursor-pointer shadow-2xs"
          @click="emit('mark-all-present')"
        >
          <AdminV2Icon name="check" :size="14" />
          <span>Siswa Hadir Lengkap</span>
        </button>
      </div>
    </div>

    <!-- 4 Status Quick Filter Pills -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <button
        type="button"
        class="p-2.5 rounded-xl border text-center transition cursor-pointer"
        :class="selectedStatusFilter === 'Hadir' ? 'bg-[#E7F6ED] border-[#16A34A] ring-2 ring-[#16A34A]/20' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#E7F6ED]/40'"
        @click="selectedStatusFilter = selectedStatusFilter === 'Hadir' ? 'all' : 'Hadir'"
      >
        <span class="text-[11px] font-bold text-[#14532D] block">Hadir</span>
        <b class="text-lg font-extrabold font-mono text-[#166534]">{{ counts.hadir }} Siswa</b>
      </button>

      <button
        type="button"
        class="p-2.5 rounded-xl border text-center transition cursor-pointer"
        :class="selectedStatusFilter === 'Sakit' ? 'bg-[#FEF6EE] border-[#F79009] ring-2 ring-[#F79009]/20' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#FEF6EE]/40'"
        @click="selectedStatusFilter = selectedStatusFilter === 'Sakit' ? 'all' : 'Sakit'"
      >
        <span class="text-[11px] font-bold text-[#7A271A] block">Sakit</span>
        <b class="text-lg font-extrabold font-mono text-[#B54708]">{{ counts.sakit }} Siswa</b>
      </button>

      <button
        type="button"
        class="p-2.5 rounded-xl border text-center transition cursor-pointer"
        :class="selectedStatusFilter === 'Izin' ? 'bg-[#EFF4FF] border-[#1B5FD9] ring-2 ring-[#1B5FD9]/20' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#EFF4FF]/40'"
        @click="selectedStatusFilter = selectedStatusFilter === 'Izin' ? 'all' : 'Izin'"
      >
        <span class="text-[11px] font-bold text-[#175CD3] block">Izin</span>
        <b class="text-lg font-extrabold font-mono text-[#1B5FD9]">{{ counts.izin }} Siswa</b>
      </button>

      <button
        type="button"
        class="p-2.5 rounded-xl border text-center transition cursor-pointer"
        :class="selectedStatusFilter === 'Alpa' ? 'bg-[#FEF3F2] border-[#F04438] ring-2 ring-[#F04438]/20' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#FEF3F2]/40'"
        @click="selectedStatusFilter = selectedStatusFilter === 'Alpa' ? 'all' : 'Alpa'"
      >
        <span class="text-[11px] font-bold text-[#912018] block">Alpa</span>
        <b class="text-lg font-extrabold font-mono text-[#D92D20]">{{ counts.alpa }} Siswa</b>
      </button>
    </div>

    <!-- Attendance Table with Quick Toggle -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#F8FAFC] text-[#475467] uppercase tracking-wider font-bold border-b border-[#E7EBF2] text-[10.5px]">
          <tr>
            <th class="py-2.5 px-3">No</th>
            <th class="py-2.5 px-3">Nama Siswa</th>
            <th class="py-2.5 px-3 font-mono">NISN</th>
            <th class="py-2.5 px-3">L/P</th>
            <th class="py-2.5 px-3">Waktu Tap RFID</th>
            <th class="py-2.5 px-3">Status Kehadiran</th>
            <th class="py-2.5 px-3 text-right">Ubah Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F1F5F9] font-medium text-[#344054]">
          <tr
            v-for="(row, idx) in filteredList"
            :key="row.studentId"
            class="hover:bg-[#F8FAFC] transition-colors"
          >
            <td class="py-2.5 px-3 font-mono text-[#98A2B3]">{{ idx + 1 }}</td>
            <td class="py-2.5 px-3 font-bold text-[#101828]">
              {{ row.name }}
            </td>
            <td class="py-2.5 px-3 font-mono text-xs">{{ row.nisn }}</td>
            <td class="py-2.5 px-3 font-bold">{{ row.gender }}</td>
            <td class="py-2.5 px-3 font-mono text-xs text-[#667085]">{{ row.time }}</td>
            <td class="py-2.5 px-3">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold inline-flex items-center gap-1"
                :class="{
                  'bg-[#E7F6ED] text-[#166534]': row.status === 'Hadir',
                  'bg-[#FEF6EE] text-[#B54708]': row.status === 'Sakit',
                  'bg-[#EFF4FF] text-[#1B5FD9]': row.status === 'Izin',
                  'bg-[#FEF3F2] text-[#D92D20]': row.status === 'Alpa'
                }"
              >
                {{ row.status }}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right">
              <!-- Quick Status Toggle Buttons -->
              <div class="inline-flex items-center gap-1">
                <button
                  type="button"
                  class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer"
                  :class="row.status === 'Hadir' ? 'bg-[#16A34A] text-white' : 'bg-[#EFF2F7] text-[#475467] hover:bg-[#E2E8F0]'"
                  @click="emit('update-status', row.studentId, 'Hadir')"
                >
                  Hadir
                </button>
                <button
                  type="button"
                  class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer"
                  :class="row.status === 'Sakit' ? 'bg-[#F79009] text-white' : 'bg-[#EFF2F7] text-[#475467] hover:bg-[#E2E8F0]'"
                  @click="emit('update-status', row.studentId, 'Sakit')"
                >
                  Sakit
                </button>
                <button
                  type="button"
                  class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer"
                  :class="row.status === 'Izin' ? 'bg-[#1B5FD9] text-white' : 'bg-[#EFF2F7] text-[#475467] hover:bg-[#E2E8F0]'"
                  @click="emit('update-status', row.studentId, 'Izin')"
                >
                  Izin
                </button>
                <button
                  type="button"
                  class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer"
                  :class="row.status === 'Alpa' ? 'bg-[#F04438] text-white' : 'bg-[#EFF2F7] text-[#475467] hover:bg-[#E2E8F0]'"
                  @click="emit('update-status', row.studentId, 'Alpa')"
                >
                  Alpa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
