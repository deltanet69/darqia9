<script setup lang="ts">
import AdminV2Icon from '../AdminV2Icon.vue'
import type { RombelPresensi } from './absensiV2Data'

interface Props {
  rombels: RombelPresensi[]
  selectedKelas?: string
  jenjang?: 'smp' | 'smk'
}

withDefaults(defineProps<Props>(), {
  selectedKelas: '',
  jenjang: 'smk'
})

const emit = defineEmits<{
  (e: 'select-rombel', className: string): void
}>()

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(w => !/^(H|Hj|Drs|Dra|S\.Pd|S\.Kom|S\.T|S\.Si)$/i.test(w))
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

const getBarGradient = (pct: number): string => {
  if (pct >= 95) return 'from-[#22C55E] to-[#16A34A]'
  if (pct >= 90) return 'from-[#3B82F6] to-[#1D4ED8]'
  return 'from-[#F59E0B] to-[#D97706]'
}

const getPctColor = (pct: number): string => {
  if (pct >= 95) return 'text-[#067647]'
  if (pct >= 90) return 'text-[#1D4ED8]'
  return 'text-[#B54708]'
}
</script>

<template>
  <div>
    <!-- Section Title -->
    <div class="flex items-center justify-between mb-3.5">
      <div>
        <h3 class="text-[16px] font-extrabold text-[#101828]">
          Rekap Kehadiran per Rombel / Kelas
        </h3>
        <p class="text-[12.5px] text-[#667085] mt-0.5 font-medium">
          Pantau rasio kehadiran setiap kelas. Klik salah satu kartu rombel untuk memfilter daftar siswa di bawah.
        </p>
      </div>

      <button
        v-if="selectedKelas"
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EFF2F7] text-[#344054] hover:bg-[#E2E8F0] transition cursor-pointer"
        @click="emit('select-rombel', '')"
      >
        <span>Reset Filter Rombel ({{ selectedKelas }})</span>
        <AdminV2Icon name="x" :size="12" />
      </button>
    </div>

    <!-- Rombel Grid (3 Kolom di Layar Lebar) -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="r in rombels"
        :key="r.name"
        role="button"
        tabindex="0"
        class="bg-white border rounded-[18px] p-4 sm:p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_-12px_rgba(16,24,40,0.08)] cursor-pointer transition hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_rgba(16,24,40,0.18)] select-none"
        :class="selectedKelas === r.name
          ? 'border-[#1B5FD9] ring-2 ring-[#1B5FD9]/30 bg-[#F8FAFD]'
          : 'border-[#E7EBF2] hover:border-[#C3CEDD]'"
        @click="emit('select-rombel', r.name)"
        @keydown.enter="emit('select-rombel', r.name)"
      >
        <!-- Card Header: Rombel Name & Status Badge -->
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-[17px] font-extrabold text-[#101828]">
              {{ r.name }}
            </span>
            <span
              class="px-2.5 py-0.5 rounded-md text-xs font-bold"
              :class="jenjang === 'smp' ? 'bg-[#E7F6ED] text-[#166534]' : 'bg-[#E8F0FE] text-[#12459B]'"
            >
              {{ jenjang.toUpperCase() }}
            </span>
          </div>

          <!-- Attendance Badge -->
          <span
            class="text-xs font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 tabular-nums"
            :class="r.attPct >= 95 ? 'bg-[#E7F8F0] text-[#067647]' : r.attPct >= 90 ? 'bg-[#E8F0FE] text-[#12459B]' : 'bg-[#FEF4E5] text-[#B54708]'"
          >
            <i class="w-1.5 h-1.5 rounded-full" :class="r.attPct >= 95 ? 'bg-[#12B76A]' : r.attPct >= 90 ? 'bg-[#1B5FD9]' : 'bg-[#F79009]'" />
            {{ r.attPct }}% Hadir
          </span>
        </div>

        <!-- Wali Kelas Info -->
        <div class="flex items-center gap-2.5 mb-3.5">
          <span class="w-9 h-9 rounded-xl bg-[#EFF2F7] text-[#344054] font-extrabold text-xs flex items-center justify-center shrink-0">
            {{ getInitials(r.wali) }}
          </span>
          <div class="min-w-0">
            <div class="text-[13px] font-bold text-[#101828] truncate">
              {{ r.wali }}
            </div>
            <div class="text-xs text-[#667085] font-medium flex items-center gap-1.5 truncate">
              <span>Wali Kelas</span>
              <span>&bull;</span>
              <span>{{ r.room }}</span>
            </div>
          </div>
        </div>

        <!-- 4 Stat Mini Breakdown (Hadir, Terlambat, Izin/Sakit, Alpa) -->
        <div class="grid grid-cols-4 gap-2 py-2 px-2.5 rounded-xl bg-[#F8FAFD] border border-[#F2F4F7] mb-3 text-center">
          <div>
            <span class="block text-[10px] font-bold uppercase text-[#667085] tracking-wider">Hadir</span>
            <b class="text-[14px] font-mono font-extrabold text-[#067647]">{{ r.hadirCount }}</b>
          </div>
          <div>
            <span class="block text-[10px] font-bold uppercase text-[#667085] tracking-wider">Telat</span>
            <b class="text-[14px] font-mono font-extrabold text-[#B54708]">{{ r.terlambatCount }}</b>
          </div>
          <div>
            <span class="block text-[10px] font-bold uppercase text-[#667085] tracking-wider">Izin/Skt</span>
            <b class="text-[14px] font-mono font-extrabold text-[#12459B]">{{ r.izinCount + r.sakitCount }}</b>
          </div>
          <div>
            <span class="block text-[10px] font-bold uppercase text-[#667085] tracking-wider">Alpa</span>
            <b class="text-[14px] font-mono font-extrabold text-[#B42318]">{{ r.alpaCount }}</b>
          </div>
        </div>

        <!-- Progress Bar % Kehadiran -->
        <div>
          <div class="flex justify-between items-center text-xs mb-1.5">
            <span class="text-[#667085] font-semibold">Capaian Kehadiran</span>
            <b :class="getPctColor(r.attPct)" class="font-extrabold tabular-nums">
              {{ r.attPct }}%
            </b>
          </div>
          <div class="w-full h-2 rounded-full bg-[#E7EBF2] overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r transition-all duration-700"
              :class="getBarGradient(r.attPct)"
              :style="{ width: `${r.attPct}%` }"
            />
          </div>
        </div>

        <!-- Card Footer Action -->
        <div class="mt-3.5 pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs font-bold text-[#1B5FD9] group-hover:text-[#12459B]">
          <span>Buka Log Kelas Ini</span>
          <span class="inline-flex items-center gap-1 transition-transform group-hover:translate-x-1">
            <span>&rarr;</span>
          </span>
        </div>
      </div>
    </div>
  </div>

</template>
