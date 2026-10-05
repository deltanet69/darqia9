<template>
  <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
    <!-- MOBILE CLASS TABS STICKY SWITCHER -->
    <div class="flex md:hidden gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0 sticky top-2 z-20 bg-[#040814]/90 backdrop-blur-md py-1.5">
      <button
        v-for="c in classes"
        :key="c"
        type="button"
        class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-2"
        :class="activeTab === c ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/30' : 'bg-[#0B152C] text-slate-300 border-[#1D2C4E] hover:border-slate-600'"
        @click="$emit('update:activeTab', c)"
      >
        <span>{{ c }}</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold" :class="activeTab === c ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-400'">
          {{ getHadirCount(c) }}/{{ (db[c] || []).length }}
        </span>
      </button>
    </div>

    <!-- MAIN BOARD -->
    <main
      class="grid gap-3 sm:gap-4 flex-1 min-h-0 h-full"
      :class="classes.length === 2 ? 'grid-cols-1 md:grid-cols-2' : classes.length === 4 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'"
    >
      <div
        v-for="c in classes"
        :key="c"
        class="bg-[#0B152C] border border-[#1D2C4E] rounded-2xl p-3 sm:p-5 shadow-2xl flex flex-col justify-between min-h-0 h-full overflow-hidden transition-all duration-300"
        :class="activeTab === c ? 'flex' : 'hidden md:flex'"
      >
        <!-- CARD HEADER -->
        <div class="pb-2.5 border-b border-[#1D2C4E] space-y-2 shrink-0">
          <div class="flex items-center justify-between">
            <div class="text-xl font-black text-white tracking-wide flex items-baseline gap-2 leading-none">
              <span>{{ c }}</span>
              <small class="text-xs font-bold text-slate-400 tracking-wider">KELAS {{ levelNum }}</small>
            </div>
            <div class="text-xs font-bold text-slate-300">
              <b class="text-blue-400 font-mono text-sm">{{ getHadirCount(c) }}</b>/{{ (db[c] || []).length }} <span class="text-slate-400 font-normal text-xs">hadir</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="h-2 bg-[#16233F] rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-700 ease-out rounded-full"
              :style="{ width: `${getPct(c)}%` }"
            />
          </div>
        </div>

        <!-- COLS HEADER (DESKTOP) -->
        <!-- 4-Class Compact Mode Header -->
        <div
          v-if="classes.length >= 4"
          class="hidden sm:grid grid-cols-[1fr_40px_40px_90px] gap-2 py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-[#1D2C4E]/60 items-center shrink-0"
        >
          <span class="text-left">NAMA SISWA</span>
          <span class="text-center font-mono">MASUK</span>
          <span class="text-center font-mono">KELUAR</span>
          <span class="text-right">STATUS</span>
        </div>

        <!-- 2/3-Class Standard Mode Header -->
        <div
          v-else
          class="hidden sm:grid grid-cols-[24px_1fr_50px_50px_100px] gap-2 py-2 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-[#1D2C4E]/60 items-center shrink-0"
        >
          <span class="text-center">NO</span>
          <span class="text-left">NAMA SISWA</span>
          <span class="text-center font-mono">MASUK</span>
          <span class="text-center font-mono">KELUAR</span>
          <span class="text-right">STATUS</span>
        </div>

        <!-- STUDENT ROWS LIST (SCROLLABLE DENGAN DARK MODERN SCROLLBAR) -->
        <div class="flex-1 min-h-0 flex flex-col gap-1.5 py-1.5 overflow-y-auto overflow-x-hidden pr-1.5 [scrollbar-width:thin] [scrollbar-color:#2a3f6e_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#2a3f6e] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3b5998]">
          <div
            v-for="(s, idx) in db[c] || []"
            :key="s.id"
            class="group relative flex-none min-h-[42px] py-2 px-3 rounded-xl transition-all duration-150 cursor-pointer overflow-hidden border flex items-center before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-sm"
            :class="[
              s.status === 'alpa'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-200 before:bg-rose-500 before:shadow-[0_0_8px_rgba(248,113,113,0.7)] hover:bg-rose-500/25 hover:border-rose-500/60'
                : 'bg-[#94B8FF]/[0.05] border-[#94B8FF]/[0.10] hover:-translate-y-0.5 hover:border-blue-400/50 hover:bg-blue-500/10 hover:shadow-md hover:shadow-black/30',
              s.status === 'tepat' ? 'before:bg-emerald-400' : s.status === 'terlambat' ? 'before:bg-amber-400' : s.status === 'alpa' ? '' : 'before:bg-[#2B3A5E]',
              s.flash === 'green' ? 'animate-flashGreen ring-1 ring-emerald-400' : '',
              s.flash === 'red' ? 'animate-flashRed ring-1 ring-rose-400' : ''
            ]"
            @click="$emit('select', s)"
          >
            <!-- DESKTOP 4-CLASS COMPACT ROW -->
            <div
              v-if="classes.length >= 4"
              class="hidden sm:grid grid-cols-[1fr_40px_40px_90px] gap-2 items-center w-full text-xs"
            >
              <!-- Name -->
              <span
                class="font-bold text-[13.5px] truncate min-w-0 pr-1 leading-tight"
                :class="s.status === 'alpa' ? 'text-rose-200' : s.status === 'menunggu' ? 'text-slate-300 font-semibold' : 'text-white'"
                :title="s.name"
              >
                {{ s.name }}
              </span>

              <!-- Masuk -->
              <span class="text-center font-mono text-xs font-bold" :class="s.masuk ? 'text-slate-100' : 'text-slate-500 font-normal'">
                {{ s.masuk || '—' }}
              </span>

              <!-- Keluar -->
              <span class="text-center font-mono text-xs font-bold" :class="s.keluar ? 'text-slate-100' : 'text-slate-500 font-normal'">
                {{ s.keluar || '—' }}
              </span>

              <!-- Status Pill -->
              <span class="flex justify-end">
                <span
                  class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider shrink-0 inline-flex items-center gap-1.5 transition-all duration-500 leading-tight"
                  :class="[
                    getPillClass(s.status),
                    s.pillGlow ? 'animate-pillGlow' : ''
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getDotClass(s.status)" />
                  <span>{{ getStatusLabel(s.status) }}</span>
                </span>
              </span>
            </div>

            <!-- DESKTOP 2/3-CLASS STANDARD ROW -->
            <div
              v-else
              class="hidden sm:grid grid-cols-[24px_1fr_50px_50px_100px] gap-2 items-center w-full text-xs"
            >
              <!-- No -->
              <span class="text-center font-mono font-bold text-slate-500 text-[11px]">
                {{ idx + 1 }}
              </span>

              <!-- Name -->
              <span
                class="font-bold text-[14px] truncate min-w-0 pr-1 leading-tight"
                :class="s.status === 'alpa' ? 'text-rose-200' : s.status === 'menunggu' ? 'text-slate-300 font-semibold' : 'text-white'"
                :title="s.name"
              >
                {{ s.name }}
              </span>

              <!-- Masuk -->
              <span class="text-center font-mono text-xs font-bold" :class="s.masuk ? 'text-slate-100' : 'text-slate-500 font-normal'">
                {{ s.masuk || '—' }}
              </span>

              <!-- Keluar -->
              <span class="text-center font-mono text-xs font-bold" :class="s.keluar ? 'text-slate-100' : 'text-slate-500 font-normal'">
                {{ s.keluar || '—' }}
              </span>

              <!-- Status Pill -->
              <span class="flex justify-end">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 inline-flex items-center gap-1.5 transition-all duration-500 leading-tight"
                  :class="[
                    getPillClass(s.status),
                    s.pillGlow ? 'animate-pillGlow' : ''
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getDotClass(s.status)" />
                  <span>{{ getStatusLabel(s.status) }}</span>
                </span>
              </span>
            </div>

            <!-- MOBILE ROW (< sm) -->
            <div class="sm:hidden flex items-center justify-between w-full gap-2 py-1">
              <div class="flex flex-col min-w-0 flex-1">
                <span
                  class="font-bold text-[13.5px] truncate"
                  :class="s.status === 'alpa' ? 'text-rose-200' : s.status === 'menunggu' ? 'text-slate-300' : 'text-white'"
                >
                  {{ s.name }}
                </span>
                <div class="flex items-center gap-3 text-[10.5px] text-slate-400 font-mono mt-0.5">
                  <span>MASUK: <b class="text-emerald-300">{{ s.masuk || '—' }}</b></span>
                  <span>KELUAR: <b class="text-blue-300">{{ s.keluar || '—' }}</b></span>
                </div>
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 inline-flex items-center gap-1.5"
                :class="getPillClass(s.status)"
              >
                <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getDotClass(s.status)" />
                <span>{{ getStatusLabel(s.status) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { AbsensiStudent } from '~/composables/useAbsensiTv'

interface Props {
  levelNum: string
  classes: string[]
  activeTab: string
  db: Record<string, AbsensiStudent[]>
}

interface Emits {
  (e: 'update:activeTab', tab: string): void
  (e: 'select', student: AbsensiStudent): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const getHadirCount = (className: string) => {
  const list = props.db[className] || []
  return list.filter(s => s.status === 'tepat' || s.status === 'terlambat').length
}

const getPct = (className: string) => {
  const list = props.db[className] || []
  if (!list.length) return 0
  const hadir = list.filter(s => s.status === 'tepat' || s.status === 'terlambat').length
  return Math.round((hadir / list.length) * 100)
}

const getPillClass = (status: AbsensiStudent['status']) => {
  switch (status) {
    case 'tepat': return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
    case 'terlambat': return 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
    case 'alpa': return 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
    default: return 'bg-transparent text-slate-400 border border-slate-700'
  }
}

const getDotClass = (status: AbsensiStudent['status']) => {
  switch (status) {
    case 'tepat': return 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
    case 'terlambat': return 'bg-amber-400 shadow-[0_0_8px_#FB923C]'
    case 'alpa': return 'bg-rose-400 shadow-[0_0_8px_#F87171]'
    default: return 'bg-slate-500'
  }
}

const getStatusLabel = (status: AbsensiStudent['status']) => {
  switch (status) {
    case 'tepat': return 'Tepat Waktu'
    case 'terlambat': return 'Terlambat'
    case 'alpa': return 'Alpa'
    default: return 'Menunggu'
  }
}
</script>
