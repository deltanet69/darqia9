<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import {
  DAYS,
  SLOT_TIMES,
  KELAS,
  slotMin,
  fmtMin,
  guruStatus,
  genGrid,
  type Jenjang,
  type DayIndex,
  type GuruStatus
} from './jadwalV2Data'

const props = defineProps<{
  jenjang: Jenjang
  selectedClass: string
  editable: boolean
  fixedKelas?: string
  mineTeacherName?: string
  simDayIdx: DayIndex
  simMin: number
  extraSchedules: Array<{ level: Jenjang; kelas: string; di: DayIndex; si: number; mapel: string; guru: string; ket?: string }>
}>()

const emit = defineEmits<{
  (e: 'update:jenjang', val: Jenjang): void
  (e: 'update:selectedClass', val: string): void
  (e: 'open-create'): void
}>()

const mobileDay = ref<DayIndex>(props.simDayIdx)
const isDropdownOpen = ref(false)

const currentClassMeta = computed(() => {
  return KELAS[props.jenjang].find(k => k.name === (props.fixedKelas || props.selectedClass)) || KELAS[props.jenjang][0]
})

const classOptions = computed(() => {
  return KELAS[props.jenjang].map(k => k.name)
})

const gridData = computed(() => {
  return genGrid(props.jenjang, props.fixedKelas || props.selectedClass, props.extraSchedules)
})

const getStatus = (di: DayIndex, si: number): GuruStatus => {
  return guruStatus(props.jenjang, props.fixedKelas || props.selectedClass, di, si, props.simDayIdx, props.simMin)
}

const statusBadgeClasses = (st: GuruStatus): string => {
  switch (st) {
    case 'Hadir':
      return 'bg-[#ECFDF5] text-[#047857]'
    case 'Terlambat':
      return 'bg-[#FFFAEB] text-[#B54708]'
    case 'Berlangsung':
      return 'bg-[#EAF0FE] text-[#1D4ED8]'
    case 'Terjadwal':
    default:
      return 'bg-[#F1F5F9] text-[#64748B]'
  }
}

const statusDotClasses = (st: GuruStatus): string => {
  switch (st) {
    case 'Hadir':
      return 'bg-[#047857]'
    case 'Terlambat':
      return 'bg-[#B54708]'
    case 'Berlangsung':
      return 'bg-[#1D4ED8]'
    case 'Terjadwal':
    default:
      return 'bg-[#64748B]'
  }
}

const selectClass = (className: string) => {
  emit('update:selectedClass', className)
  isDropdownOpen.value = false
}

const simLabel = computed(() => {
  return `${DAYS[props.simDayIdx]}, ${fmtMin(props.simMin)} WIB`
})
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar Card -->
    <section class="rounded-2xl border border-[#E7EBF2] bg-white p-4 shadow-xs sm:p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Left tools: Jenjang switcher & Rombel picker -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Switcher Jenjang SMP/SMK -->
          <div class="inline-flex rounded-full border border-[#E7EBF2] bg-[#EFF2F7] p-1" role="group" aria-label="Pilih jenjang">
            <button
              type="button"
              class="rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors"
              :class="jenjang === 'smp' ? 'bg-[#14532D] text-white shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
              @click="emit('update:jenjang', 'smp')"
            >
              SMP
            </button>
            <button
              type="button"
              class="rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors"
              :class="jenjang === 'smk' ? 'bg-[#0A2A5C] text-white shadow-xs' : 'text-[#667085] hover:text-[#101828]'"
              @click="emit('update:jenjang', 'smk')"
            >
              SMK
            </button>
          </div>

          <!-- Class selector or Fixed badge -->
          <div v-if="fixedKelas" class="inline-flex items-center gap-1.5 rounded-full border border-[#C9DCFB] bg-[#E8F0FE] px-3.5 py-1.5 text-xs font-bold text-[#12459B]">
            <AdminV2Icon name="users" :size="14" />
            <span>Kelas {{ fixedKelas }}</span>
          </div>

          <div v-else class="relative">
            <button
              type="button"
              class="inline-flex min-h-10 items-center justify-between gap-2 rounded-xl border border-[#E7EBF2] bg-white px-3.5 py-2 text-xs font-semibold text-[#344054] shadow-xs transition-colors hover:bg-[#F8FAFD]"
              @click="isDropdownOpen = !isDropdownOpen"
            >
              <span>Kelas {{ selectedClass }}</span>
              <AdminV2Icon name="chev" :size="14" class="text-[#667085]" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isDropdownOpen"
              class="absolute left-0 top-[calc(100%+6px)] z-30 max-h-60 w-52 overflow-auto rounded-2xl border border-[#E7EBF2] bg-white p-1.5 shadow-xl"
            >
              <button
                v-for="cls in classOptions"
                :key="cls"
                type="button"
                class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors"
                :class="cls === selectedClass ? 'bg-[#E8F0FE] text-[#12459B]' : 'text-[#344054] hover:bg-[#F3F5F9]'"
                @click="selectClass(cls)"
              >
                <span>{{ cls }}</span>
                <AdminV2Icon v-if="cls === selectedClass" name="check" :size="14" class="text-[#1B5FD9]" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right tool: Button Buat Jadwal Mengajar (Operator only) -->
        <button
          v-if="editable"
          type="button"
          class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1B5FD9] px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#12459B]"
          @click="emit('open-create')"
        >
          <AdminV2Icon name="plus" :size="15" />
          <span>Buat Jadwal Mengajar</span>
        </button>
      </div>

      <!-- Class Info & Simulation meta -->
      <div class="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#EFF2F7] pt-3 text-xs font-semibold text-[#667085]">
        <div>
          Wali Kelas: <b class="text-[#344054]">{{ currentClassMeta?.wali || '-' }}</b>
        </div>
        <div>
          Ruang: <b class="text-[#344054]">{{ currentClassMeta?.room || '-' }}</b>
        </div>
        <div>
          Total Siswa: <b class="text-[#344054]">{{ (currentClassMeta?.boys || 0) + (currentClassMeta?.girls || 0) }} siswa</b>
        </div>
        <div class="ml-auto inline-flex items-center gap-2 rounded-full bg-[#0B1F3A] px-3 py-1 text-[11px] font-bold text-white">
          <span class="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
          <span>Simulasi: {{ simLabel }}</span>
        </div>
      </div>
    </section>

    <!-- Timetable Card -->
    <section class="rounded-2xl border border-[#E7EBF2] bg-white p-4 shadow-xs sm:p-5">
      <!-- Desktop Table View (>= 1024px) -->
      <div class="hidden lg:block overflow-x-auto">
        <div class="min-w-[880px] grid grid-cols-[88px_repeat(5,minmax(140px,1fr))] gap-2">
          <!-- Header Kolom Jam -->
          <div class="rounded-xl bg-[#F3F5F9] p-2.5 text-center text-xs font-bold text-[#344054]">
            Jam
          </div>
          <!-- Header Kolom Hari -->
          <div
            v-for="(day, di) in DAYS"
            :key="day"
            class="rounded-xl p-2.5 text-center text-xs font-bold"
            :class="di === simDayIdx ? 'bg-[#0A2A5C] text-white shadow-xs' : 'bg-[#F3F5F9] text-[#344054]'"
          >
            <span v-if="di === simDayIdx" class="block text-[9.5px] font-extrabold uppercase tracking-wider text-[#93B4F5]">
              Hari Ini
            </span>
            <span>{{ day }}</span>
          </div>

          <!-- Baris Slot Jam 1 s.d. 7 -->
          <template v-for="(slotTime, si) in SLOT_TIMES" :key="'slot-' + si">
            <!-- Slot Waktu Kiri -->
            <div class="flex flex-col items-center justify-center rounded-xl border border-[#E7EBF2] bg-white p-2 text-center">
              <b class="text-xs text-[#101828]">{{ fmtMin(slotMin(si)[0]) }}</b>
              <span class="text-[10px] font-semibold text-[#667085]">{{ fmtMin(slotMin(si)[1]) }}</span>
              <span class="mt-0.5 text-[9.5px] font-bold text-[#98A2B3]">Jam ke-{{ si + 1 }}</span>
            </div>

            <!-- Kolom 5 Hari -->
            <div
              v-for="(day, di) in DAYS"
              :key="'cell-' + di + '-' + si"
              class="flex min-h-[82px] flex-col justify-between rounded-xl border p-2.5 transition-all"
              :class="[
                di === simDayIdx && simMin >= slotMin(si)[0] && simMin < slotMin(si)[1]
                  ? 'border-[#93B4F5] bg-[#F5F8FF] shadow-xs'
                  : 'border-[#E7EBF2] bg-white hover:border-[#CBD5E1]',
                mineTeacherName && gridData[di as DayIndex][si]?.guru === mineTeacherName
                  ? 'border-[#B9CCF5] bg-[#F5F8FF]'
                  : ''
              ]"
            >
              <div>
                <p class="text-xs font-bold leading-snug text-[#101828]">
                  {{ gridData[di as DayIndex][si]?.mapel }}
                </p>
                <p class="mt-1 text-[11px] font-semibold text-[#667085]">
                  {{ gridData[di as DayIndex][si]?.guru }}
                </p>
              </div>

              <!-- Live bar progress jika aktif -->
              <div
                v-if="di === simDayIdx && simMin >= slotMin(si)[0] && simMin < slotMin(si)[1]"
                class="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E4E9F0]"
              >
                <div
                  class="h-full rounded-full bg-[#1B5FD9] transition-all duration-500"
                  :style="{ width: Math.round(((simMin - slotMin(si)[0]) / (slotMin(si)[1] - slotMin(si)[0])) * 100) + '%' }"
                />
              </div>

              <!-- Status pill -->
              <div class="mt-2 pt-1">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                  :class="statusBadgeClasses(getStatus(di as DayIndex, si))"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClasses(getStatus(di as DayIndex, si))" />
                  <span>{{ getStatus(di as DayIndex, si) }}</span>
                </span>
              </div>
            </div>

            <!-- Istirahat 1 setelah jam ke-3 -->
            <div
              v-if="si === 2"
              class="col-span-6 my-1 flex items-center gap-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#667085]"
            >
              <div class="h-px flex-1 border-t border-dashed border-[#CBD5E1]" />
              <span>Istirahat · 09:15–09:30</span>
              <div class="h-px flex-1 border-t border-dashed border-[#CBD5E1]" />
            </div>

            <!-- Istirahat & Dzuhur setelah jam ke-6 -->
            <div
              v-if="si === 5"
              class="col-span-6 my-1 flex items-center gap-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#667085]"
            >
              <div class="h-px flex-1 border-t border-dashed border-[#CBD5E1]" />
              <span>Istirahat &amp; Shalat Dzuhur · 11:45–12:30</span>
              <div class="h-px flex-1 border-t border-dashed border-[#CBD5E1]" />
            </div>
          </template>
        </div>
      </div>

      <!-- Mobile Timeline View (< 1024px) -->
      <div class="lg:hidden space-y-4">
        <!-- Day pills selector -->
        <div class="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Pilih hari">
          <button
            v-for="(day, di) in DAYS"
            :key="'mob-day-' + di"
            type="button"
            class="flex min-w-[70px] flex-1 flex-col items-center rounded-xl border p-2 text-xs font-bold transition-colors"
            :class="mobileDay === di ? 'border-[#0A2A5C] bg-[#0A2A5C] text-white shadow-xs' : 'border-[#E7EBF2] bg-white text-[#344054] hover:bg-[#F8FAFD]'"
            @click="mobileDay = di as DayIndex"
          >
            <span>{{ day }}</span>
            <span
              class="mt-0.5 text-[9px] font-bold uppercase tracking-wider"
              :class="mobileDay === di ? 'text-[#93B4F5]' : di === simDayIdx ? 'text-[#1B5FD9]' : 'text-transparent'"
            >
              {{ di === simDayIdx ? 'Hari Ini' : '·' }}
            </span>
          </button>
        </div>

        <!-- Timeline list for chosen day -->
        <div class="space-y-3">
          <div
            v-for="(slotTime, si) in SLOT_TIMES"
            :key="'mob-slot-' + si"
            class="flex items-stretch gap-3 rounded-2xl border p-3.5 transition-colors"
            :class="[
              mobileDay === simDayIdx && simMin >= slotMin(si)[0] && simMin < slotMin(si)[1]
                ? 'border-[#93B4F5] bg-[#F5F8FF] shadow-xs'
                : 'border-[#E7EBF2] bg-white'
            ]"
          >
            <!-- Time badge -->
            <div class="flex w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F3F5F9] p-2 text-center">
              <b class="text-xs text-[#101828]">{{ fmtMin(slotMin(si)[0]) }}</b>
              <span class="text-[10.5px] font-semibold text-[#667085]">{{ fmtMin(slotMin(si)[1]) }}</span>
              <span class="mt-0.5 text-[9.5px] font-bold text-[#98A2B3]">Jam ke-{{ si + 1 }}</span>
            </div>

            <!-- Content info -->
            <div class="flex flex-1 flex-col justify-between min-w-0">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-xs font-bold text-[#101828] leading-tight">
                    {{ gridData[mobileDay][si]?.mapel }}
                  </h4>
                  <span
                    v-if="mobileDay === simDayIdx && simMin >= slotMin(si)[0] && simMin < slotMin(si)[1]"
                    class="shrink-0 rounded-md bg-[#E8F0FE] px-2 py-0.5 text-[9.5px] font-bold text-[#1B5FD9]"
                  >
                    Sekarang
                  </span>
                </div>
                <p class="mt-1 text-[11px] font-semibold text-[#667085]">
                  {{ gridData[mobileDay][si]?.guru }}
                </p>
              </div>

              <div class="mt-2.5">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  :class="statusBadgeClasses(getStatus(mobileDay, si))"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClasses(getStatus(mobileDay, si))" />
                  <span>{{ getStatus(mobileDay, si) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
